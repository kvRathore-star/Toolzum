interface Env {
  DB: D1Database;
  GEMINI_API_KEY: string;
}

import { checkRateLimit, recordRateLimit } from '../rate-limit';
import { logAiCreditEvent } from './credit-events';
import {
  resolvePlan, creditAllowance, aiRateLimit, CREDIT_RESET_DAYS,
  type EffectivePlan,
} from '../../../src/lib/planTiers';

// Per-task cost: native image generation (~$0.039/image) sits between text
// (1) and transcription (10). At 5 credits: ~6 images/mo free, ~60 Pro/mo.
export const IMAGE_GENERATION_CREDITS = 5;

// NOTE (Sep 12 2026): gemini-2.5-flash-image retires Oct 2 2026 per Google.
// Successor: gemini-3.1-flash-lite-image (cheapest) or gemini-3.1-flash-image.
// Migrate MODEL before then — same request/response shape.
const IMAGE_MODEL = 'gemini-2.5-flash-image';

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
    return { maxCredits, balance: maxCredits };
  }
  return { maxCredits, balance: currentCredits };
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

    // Gemini image generation is a Pro-only lever (Pollinations stays free
    // for everyone). Signed-in free users get a 402-style upsell, not a silent 401.
    if (plan !== 'pro') {
      return new Response(JSON.stringify({ error: 'Pro feature — upgrade for Gemini image generation' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const rateLimit = aiRateLimit(plan);

    const rl = await checkRateLimit(DB, 'ai-img', userId, rateLimit);
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

    if (balance < IMAGE_GENERATION_CREDITS) {
      await logAiCreditEvent(DB, { userId, task: 'image', outcome: 'blocked_exhausted', balance, allowance: maxCredits });
      return new Response(JSON.stringify({ error: 'Not enough credits — image generation requires 5' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { prompt, aspectRatio = '1:1' } = await context.request.json() as {
      prompt?: string;
      aspectRatio?: string;
    };

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return new Response(JSON.stringify({ error: 'Missing prompt' }), {
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

    recordRateLimit(DB, 'ai-img', userId, '/ai/generate-image');

    const fullPrompt = aspectRatio && aspectRatio !== '1:1'
      ? `${prompt.trim()} (aspect ratio ${aspectRatio})`
      : prompt.trim();

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
        }),
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Gemini image error:', res.status, errBody);
      return new Response(JSON.stringify({ error: 'AI provider error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data: { candidates?: { content?: { parts?: { inlineData?: { mimeType?: string; data?: string } }[] } }[] } = await res.json();
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData?.data);

    if (!imagePart?.inlineData?.data) {
      return new Response(JSON.stringify({ error: 'Empty response from AI' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await DB.prepare(`UPDATE user SET credits = credits - ${IMAGE_GENERATION_CREDITS} WHERE id = ? AND credits >= ${IMAGE_GENERATION_CREDITS}`).bind(userId).run();
    await logAiCreditEvent(DB, { userId, task: 'image', outcome: 'allowed', balance: balance - IMAGE_GENERATION_CREDITS, allowance: maxCredits });

    return new Response(JSON.stringify({
      image: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || 'image/png',
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('AI image generate error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
