interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface Env {
  DB: D1Database;
  GEMINI_API_KEY: string;
}

import { checkRateLimit, recordRateLimit } from '../rate-limit';
import { checkAiIpVelocity } from '../_abuse';
import { isFlagEnabled } from '../_flags';
import { logAiCreditEvent } from './credit-events';
import {
  resolvePlan, creditAllowance, aiRateLimit, CREDIT_RESET_DAYS,
  effectivePlanForUser,
  type EffectivePlan,
} from '../../../src/lib/planTiers';

// Per-task cost: plain text generation. (Transcription is metered per
// minute — see CREDITS_PER_MINUTE in transcribe.ts / transcriptionPricing.ts.)
export const TEXT_GENERATION_CREDITS = 1;

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

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;

    // #37 bot rule first (cheapest: no session lookup for farms).
    const ip = context.request.headers.get('cf-connecting-ip') || 'unknown';
    const vel = await checkAiIpVelocity(DB, ip, '/ai/generate');
    if (vel) return vel;

    const userCtx = await getUserContext(context.request, DB);
    if (!userCtx) {
      return new Response(JSON.stringify({ error: 'Sign in required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { userId, plan: storedPlan } = userCtx;
    // #49 kill-switch: instant-disable without a rebuild. Checked before
    // rate-limit/credit spend so a killed feature costs nobody anything.
    if (!(await isFlagEnabled(DB, 'ai_generation'))) {
      return new Response(JSON.stringify({ error: 'AI features are temporarily disabled' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Gates use the effective plan (live Pass counts as Pro); the monthly
    // refill below MUST use the stored plan, or Pass top-ups would renew
    // to Pro allowances every cycle.
    const plan = await effectivePlanForUser(DB, userId, storedPlan);
    const resetPlan = resolvePlan(true, storedPlan);
    const rateLimit = aiRateLimit(plan);

    const rl = await checkRateLimit(DB, 'ai-gen', userId, rateLimit);
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

    const { balance, maxCredits } = await resetCreditsIfNeeded(DB, userId, resetPlan, user.creditResetAt, user.credits);

    if (balance <= 0) {
      await logAiCreditEvent(DB, { userId, task: 'generate', outcome: 'blocked_exhausted', balance, allowance: maxCredits });
      return new Response(JSON.stringify({ error: 'No credits remaining' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { messages, temperature = 0.7 } = await context.request.json() as {
      messages: AiMessage[];
      temperature?: number;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing messages' }), {
        status: 400,
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

    recordRateLimit(DB, 'ai-gen', userId, '/ai/generate');

    const geminiContents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : m.role === 'system' ? 'user' : 'user',
      parts: [{ text: m.content }]
    }));

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiContents,
          generationConfig: { temperature },
        }),
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Gemini API error:', res.status, errBody);
      return new Response(JSON.stringify({ error: 'AI provider error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data: { candidates: { content: { parts: { text: string }[] } }[] } = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return new Response(JSON.stringify({ error: 'Empty response from AI' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await DB.prepare(`UPDATE user SET credits = credits - ${TEXT_GENERATION_CREDITS} WHERE id = ? AND credits > 0`).bind(userId).run();
    await logAiCreditEvent(DB, { userId, task: 'generate', outcome: 'allowed', balance: balance - TEXT_GENERATION_CREDITS, allowance: maxCredits });

    return new Response(JSON.stringify({ content: text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('AI generate error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
