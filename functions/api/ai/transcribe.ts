interface Env {
  DB: D1Database;
  GEMINI_API_KEY: string;
}

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

import { checkRateLimit, recordRateLimit } from '../rate-limit';
import { logAiCreditEvent } from './credit-events';
import {
  resolvePlan, creditAllowance, aiRateLimit, CREDIT_RESET_DAYS,
  type EffectivePlan,
} from '../../../src/lib/planTiers';

// Per-task cost (decided Sep 11): transcription runs a full audio model
// pass (~$0.19/25min), so it costs 10× a text generation.
export const TRANSCRIPTION_CREDITS = 10;

async function getUserContext(request: Request, DB: D1Database): Promise<{ userId: string; plan: string } | null> {
  const cookies = request.headers.get('cookie') || '';
  const tokenMatch = cookies.match(/(?:authjs\.session-token|better-auth\.session_token|auth_session)=([^;]+)/);
  const token = tokenMatch?.[1];
  if (!token) return null;
  const row = await DB.prepare(
    "SELECT s.userId, u.plan FROM session s JOIN user u ON u.id = s.userId WHERE s.token = ? AND s.expiresAt > unixepoch()"
  ).bind(token).first<{ userId: string; plan: string }>();
  if (!row) return null;
  return { userId: row.userId, plan: row.plan || 'free' };
}

async function resetCreditsIfNeeded(DB: D1Database, userId: string, plan: EffectivePlan, creditResetAt: number | null, currentCredits: number): Promise<{ maxCredits: number; balance: number }> {
  const now = Date.now();
  const resetMs = CREDIT_RESET_DAYS * 24 * 60 * 60 * 1000;
  const maxCredits = creditAllowance(plan);

  if (!creditResetAt || (now - creditResetAt) >= resetMs) {
    await DB.prepare(
      "UPDATE user SET credits = ?, creditResetAt = ? WHERE id = ?"
    ).bind(maxCredits, now, userId).run();
    // Return the fresh balance — the caller-side `user` row was read before
    // the reset, so reusing it would 403 users whose window just renewed.
    return { maxCredits, balance: maxCredits };
  }

  return { maxCredits, balance: currentCredits };
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;

    const userCtx = await getUserContext(context.request, DB);
    if (!userCtx) {
      return new Response(JSON.stringify({ error: 'Sign in required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { userId, plan: storedPlan } = userCtx;
    const plan = resolvePlan(true, storedPlan);
    const rateLimit = aiRateLimit(plan);

    const rl = await checkRateLimit(DB, 'ai-trans', userId, rateLimit);
    if (rl.limited) return rl.response;

    const user = await DB.prepare(
      "SELECT credits, creditResetAt FROM user WHERE id = ?"
    ).bind(userId).first<{ credits: number; creditResetAt: number | null }>();
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { balance, maxCredits } = await resetCreditsIfNeeded(DB, userId, plan, user.creditResetAt, user.credits);

    if (balance < TRANSCRIPTION_CREDITS) {
      await logAiCreditEvent(DB, { userId, task: 'transcribe', outcome: 'blocked_exhausted', balance, allowance: maxCredits });
      return new Response(JSON.stringify({ error: 'Not enough credits — transcription requires 10' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const geminiKey = context.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await context.request.formData();
    const file = formData.get('file');
    const language = formData.get('language') as string | null;
    const responseFormat = formData.get('response_format') as string | null;

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'Missing audio file' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return new Response(
        JSON.stringify({ error: `File too large: ${file.size} bytes (max ${MAX_UPLOAD_BYTES})` }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }

    recordRateLimit(DB, 'ai-trans', userId, '/ai/transcribe');

    const arrayBuffer = await file.arrayBuffer();
    const base64 = toBase64(new Uint8Array(arrayBuffer));
    const mimeType = file.type || 'audio/mpeg';

    const langInstruction = language && language !== 'en'
      ? `Transcribe the audio into ${language}. `
      : '';

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [
              { inlineData: { mimeType, data: base64 } },
              { text: `${langInstruction}Transcribe the audio from this file. Return only the transcribed text, no commentary.` }
            ]
          }],
          generationConfig: { temperature: 0.1 },
        }),
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Gemini transcription error:', res.status, errBody);
      return new Response(JSON.stringify({ error: 'Transcription failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data: { candidates: { content: { parts: { text: string }[] }[] }[] } = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return new Response(JSON.stringify({ error: 'Empty transcription' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await DB.prepare(`UPDATE user SET credits = credits - ${TRANSCRIPTION_CREDITS} WHERE id = ? AND credits >= ${TRANSCRIPTION_CREDITS}`).bind(userId).run();
    await logAiCreditEvent(DB, { userId, task: 'transcribe', outcome: 'allowed', balance: balance - TRANSCRIPTION_CREDITS, allowance: maxCredits });

    const contentType = responseFormat === 'srt' ? 'text/plain' : 'text/plain';

    return new Response(text, {
      headers: { 'Content-Type': contentType },
    });
  } catch (err) {
    console.error('AI transcribe error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
