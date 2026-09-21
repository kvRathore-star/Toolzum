interface Env {
  DB: D1Database;
  OPENAI_API_KEY: string;
  GROQ_API_KEY?: string;
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
import {
  TRANSCRIPTION_CREDITS_PER_MINUTE,
  TRANSCRIPTION_MAX_SECONDS,
  TRANSCRIPTION_MAX_BYTES,
  transcriptionCostForDuration,
  transcriptionMaxPlausibleSeconds,
  transcriptionProviderForLanguage,
  type TranscriptionProvider,
} from '../../../src/lib/transcriptionPricing';

// Provider routing (Dec 2026 review): English → Groq Whisper Turbo
// (~$0.0007/min), everything else → gpt-4o-mini-transcribe (~$0.003/min,
// multilingual). Missing Groq key degrades English to OpenAI; a Groq outage
// retries once on OpenAI (English only). Cutover is atomic per request —
// old and new share no state; in-flight requests complete on the prior
// deployed version (platform drains old isolates), so no job can be
// abandoned or double-charged mid-flight.

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

    const openaiKey = context.env.OPENAI_API_KEY;
    const groqKey = context.env.GROQ_API_KEY;
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    recordRateLimit(DB, 'ai-trans', userId, '/ai/transcribe');

    // Provider routing: English → Groq Whisper Turbo (~$0.0007/min),
    // everything else → gpt-4o-mini-transcribe (~$0.003/min, multilingual).
    // Missing Groq key degrades English to OpenAI rather than 500ing.
    const validLang =
      language && /^[a-z]{2}(-[A-Z]{2})?$/.test(language) ? language : null;
    let provider: TranscriptionProvider = transcriptionProviderForLanguage(validLang);
    if (provider === 'groq' && !groqKey) provider = 'openai';

    const upstream = new FormData();
    upstream.append('file', file as unknown as Blob, file.name || 'audio.mpeg');
    upstream.append('model', provider === 'groq' ? 'whisper-large-v3-turbo' : 'gpt-4o-mini-transcribe');
    if (validLang) upstream.append('language', validLang);
    upstream.append('response_format', responseFormat === 'srt' ? 'srt' : 'text');

    async function runTranscription(which: TranscriptionProvider): Promise<Response> {
      // Model is (re)set per attempt: a Groq→OpenAI fallback must not leak
      // the turbo model name into the OpenAI call.
      upstream.set('model', which === 'groq' ? 'whisper-large-v3-turbo' : 'gpt-4o-mini-transcribe');
      const target =
        which === 'groq'
          ? 'https://api.groq.com/openai/v1/audio/transcriptions'
          : 'https://api.openai.com/v1/audio/transcriptions';
      const key = which === 'groq' ? groqKey! : openaiKey;
      return fetch(target, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}` },
        body: upstream,
      });
    }

    let res = await runTranscription(provider);
    // English-only fallback: a Groq outage retries once on mini-transcribe
    // (valid for English input; never used to cover other languages).
    if (!res.ok && provider === 'groq') {
      console.error('Groq transcription failed, retrying on OpenAI');
      res = await runTranscription('openai');
    }

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Transcription provider error:', res.status, errBody);
      return new Response(JSON.stringify({ error: 'Transcription failed' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const text = (await res.text()).trim();

    if (!text) {
      return new Response(JSON.stringify({ error: 'Empty transcription' }), {
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
