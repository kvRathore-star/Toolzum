interface Env {
  DB: D1Database;
  GROQ_API_KEY?: string;
  GEMINI_API_KEY?: string;
  AI?: {
    run(model: string, inputs: unknown): Promise<unknown>;
  };
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

import { checkRateLimit, recordRateLimit } from '../rate-limit';
import { checkAiIpVelocity } from '../_abuse';
import { isFlagEnabled } from '../_flags';
import { logAiCreditEvent } from './credit-events';
import {
  resolvePlan, creditAllowance, aiRateLimit, CREDIT_RESET_DAYS,
  effectivePlanForUser, FREE_TRIAL_CREDITS,
  type EffectivePlan,
} from '../../../src/lib/planTiers';
import {
  TRANSCRIPTION_MAX_SECONDS,
  TRANSCRIPTION_MAX_BYTES,
  transcriptionCostForDuration,
  transcriptionMaxPlausibleSeconds,
  transcriptionProviderChain,
} from '../../../src/lib/transcriptionPricing';

// Provider chain (Dec 2026 review, rebuilt): Workers AI Whisper Turbo leads
// for all languages (~$0.0005/min, free daily neurons); Groq covers English
// outages, Gemini native covers the rest. OpenAI path removed — nothing in
// the chain needs billing on file. Cutover is atomic per request: providers
// share no state, in-flight requests complete on the prior deployed version,
// so no job is abandoned or double-charged mid-flight.

/** Cross-realm file check: `instanceof File` fails when the File comes
 *  from another realm (workers/edge runtimes, undici vs jsdom in tests).
 *  Structural check instead — and note the handler only ever reads `.size`
 *  (the raw body forwards untouched), so no content methods are required. */
interface UploadedFile {
  size: number;
  name?: string;
}
function isUploadFile(v: unknown): v is UploadedFile {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  if (typeof o.size !== 'number') return false;
  return ['arrayBuffer', 'text', 'stream', 'slice'].some(
    (k) => typeof o[k] === 'function',
  );
}

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

  if (!creditResetAt) {
    // One-time free trial: granted once, stamped, never refilled for free
    // plans. Pro refills to allowance as before.
    const grant = plan === 'pro' ? maxCredits : FREE_TRIAL_CREDITS;
    await DB.prepare(
      "UPDATE user SET credits = ?, creditResetAt = ? WHERE id = ?"
    ).bind(grant, now, userId).run();
    return { maxCredits, balance: grant };
  }
  if ((now - creditResetAt) >= resetMs) {
    // Trial spent and window lapsed: free plans do NOT refill.
    if (plan !== 'pro') return { maxCredits, balance: currentCredits };
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
    const vel = await checkAiIpVelocity(DB, ip, '/ai/transcribe');
    if (vel) return vel;

    const userCtx = await getUserContext(context.request, DB);
    if (!userCtx) {
      return new Response(JSON.stringify({ error: 'Sign in required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { userId, plan: storedPlan } = userCtx;
    // #49 kill-switch: instant-disable without a rebuild.
    if (!(await isFlagEnabled(DB, 'ai_generation'))) {
      return new Response(JSON.stringify({ error: 'AI features are temporarily disabled' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Gates effective (live Pass counts); refill strictly stored (see generate.ts).
    const plan = await effectivePlanForUser(DB, userId, storedPlan);
    const resetPlan = resolvePlan(true, storedPlan);
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

    const { balance, maxCredits } = await resetCreditsIfNeeded(DB, userId, resetPlan, user.creditResetAt, user.credits);

    // Clone first: validation consumes this copy via formData() while the
    // pristine clone streams byte-identical to OpenAI below. This also keeps
    // realm-mixing out (no re-appending parsed File objects into new forms).
    const forwardable = context.request.clone();
    const forwardContentType = context.request.headers.get('content-type') || 'multipart/form-data';
    const formData = await forwardable.formData();
    const file = formData.get('file');
    const language = formData.get('language') as string | null;
    const responseFormat = formData.get('response_format') as string | null;
    const durationSec = parseFloat(formData.get('durationSec') as string);

    if (!isUploadFile(file)) {
      return new Response(JSON.stringify({ error: 'Missing audio file' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!Number.isFinite(durationSec) || durationSec <= 0) {
      return new Response(JSON.stringify({ error: 'durationSec is required (audio length in seconds)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (durationSec > TRANSCRIPTION_MAX_SECONDS) {
      await logAiCreditEvent(DB, { userId, task: 'transcribe', outcome: 'blocked_exhausted', balance, allowance: maxCredits });
      return new Response(JSON.stringify({ error: 'Audio exceeds 30-minute limit — split into parts' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (file.size > TRANSCRIPTION_MAX_BYTES) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum 25MB.' }),
        { status: 413, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Plausibility, not proof: declared minutes must fit the file at floor
    // bitrates (plus slack). Deliberate understatement is bounded to ~$1
    // per request at provider rates — full verification isn't worth building.
    if (durationSec > transcriptionMaxPlausibleSeconds(file.size)) {
      return new Response(JSON.stringify({ error: 'Duration does not match file size' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cost = transcriptionCostForDuration(durationSec);
    if (balance < cost) {
      await logAiCreditEvent(DB, { userId, task: 'transcribe', outcome: 'blocked_exhausted', balance, allowance: maxCredits });
      return new Response(JSON.stringify({ error: `Not enough credits — this file costs ${cost}` }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const groqKey = context.env.GROQ_API_KEY;
    const geminiKey = context.env.GEMINI_API_KEY;
    const aiBinding = context.env.AI;
    // Chain order from the shared module; availability from env. No usable
    // provider at all is the only 500 here — everything else degrades.
    const validLang =
      language && /^[a-z]{2}(-[A-Z]{2})?$/.test(language) ? language : null;
    const chain = transcriptionProviderChain(validLang, {
      workersAi: !!aiBinding,
      groq: !!groqKey,
      gemini: !!geminiKey,
    });
    if (chain.length === 0) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    recordRateLimit(DB, 'ai-trans', userId, '/ai/transcribe');

    // Realm-safe byte read, shared by the Workers AI + Gemini legs (Groq
    // reuses the untouched multipart body below): Response() consumes any
    // Blob/File flavor where direct .arrayBuffer() may not exist.
    let rawBytes: Uint8Array | null = null;
    try {
      rawBytes = new Uint8Array(await new Response(file as unknown as BodyInit).arrayBuffer());
    } catch {
      rawBytes = null;
    }

    async function runWorkersAi(): Promise<string | null> {
      if (!rawBytes || rawBytes.length === 0 || !aiBinding) return null;
      try {
        const out = (await aiBinding.run('@cf/openai/whisper-large-v3-turbo', {
          audio: Array.from(rawBytes),
        })) as { text?: unknown };
        const text = typeof out?.text === 'string' ? out.text.trim() : '';
        return text || null;
      } catch (e) {
        console.error('Workers AI transcription error:', e);
        return null;
      }
    }

    async function runGroqLike(): Promise<Response | null> {
      if (!groqKey) return null;
      const upstream = new FormData();
      upstream.append('file', file as unknown as Blob, file.name || 'audio.mpeg');
      upstream.append('model', 'whisper-large-v3-turbo');
      if (validLang) upstream.append('language', validLang);
      upstream.append('response_format', responseFormat === 'srt' ? 'srt' : 'text');
      try {
        return await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${groqKey}` },
          body: upstream,
        });
      } catch (e) {
        console.error('Groq transcription error:', e);
        return null;
      }
    }

    async function runGemini(): Promise<string | null> {
      if (!geminiKey || !rawBytes || rawBytes.length === 0) return null;
      const base64 = toBase64(rawBytes);
      const mimeType = file.type || 'audio/mpeg';
      const langInstruction =
        validLang && validLang !== 'en' ? `Transcribe the ${validLang} audio into ${validLang}. ` : '';
      try {
        const gres = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-transcribe:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                role: 'user',
                parts: [
                  { inlineData: { mimeType, data: base64 } },
                  { text: `${langInstruction}Transcribe the audio from this file. Return only the transcribed text, no commentary.` },
                ],
              }],
              generationConfig: { temperature: 0.1 },
            }),
          },
        );
        if (!gres.ok) {
          console.error('Gemini transcription fallback error:', gres.status, await gres.text());
          return null;
        }
        const gdata: { candidates?: { content?: { parts?: { text?: string }[] } }[] } = await gres.json();
        const gtext = gdata.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        return gtext || null;
      } catch (e) {
        console.error('Gemini transcription error:', e);
        return null;
      }
    }

    // Walk the chain; first non-empty transcript wins. A provider that is
    // configured but failing degrades to the next leg, never to a 500 —
    // the 502 below only fires when every configured leg came back empty.
    let text: string | null = null;
    for (const step of chain) {
      if (step === 'workers-ai') text = await runWorkersAi();
      else if (step === 'groq') {
        const res = await runGroqLike();
        if (res && res.ok) {
          const t = (await res.text()).trim();
          text = t || null;
        } else if (res) {
          console.error('Groq transcription error:', res.status, await res.text());
        }
      } else text = await runGemini();
      if (text) break;
    }

    if (!text) {
      return new Response(JSON.stringify({ error: 'Transcription failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await DB.prepare(`UPDATE user SET credits = credits - ${cost} WHERE id = ? AND credits >= ${cost}`).bind(userId).run();
    await logAiCreditEvent(DB, { userId, task: 'transcribe', outcome: 'allowed', balance: balance - cost, allowance: maxCredits });

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
