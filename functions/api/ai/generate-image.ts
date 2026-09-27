interface Env {
  DB: D1Database;
  GEMINI_API_KEY?: string;
  AI?: {
    run(model: string, inputs: unknown): Promise<unknown>;
  };
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
import { creditsAvailable, spendCredits } from '../../../src/lib/creditPacks';

// Per-task cost: HD generation (~$0.045/image) costs 5 credits — ~40/mo Pro.
// (Old comment claimed "~6 images/mo free": stale since the one-time trial;
// the 5-credit trial buys exactly 1 HD image, or 5 drafts.)
export const IMAGE_GENERATION_CREDITS = 5;

// Draft tier (Dec 2026): Workers AI FLUX.1-schnell at ~$0.001/image for fast
// drafts. At 1 credit the ladder reads free → 1 → 5, and every draft that
// substitutes a hero image saves ~$0.044. Signed-in users only (never anon);
// the free trial's 5 credits buy 5 drafts, which is the funnel working.
export const IMAGE_DRAFT_CREDITS = 1;
export const IMAGE_DRAFT_MODEL = '@cf/black-forest-labs/flux-1-schnell';

// Migrated Sep 21 2026: gemini-2.5-flash-image shut down Oct 2 2026 per
// Google's deprecations table. Successor is gemini-3.1-flash-image (GA since
// May 28 2026 — NOT the -preview, which died Jun 25 2026). Same
// generateContent shape, so this is a version bump, not a rewrite.
export const IMAGE_MODEL = 'gemini-3.1-flash-image';

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
    return { maxCredits, balance: maxCredits };
  }
  return { maxCredits, balance: currentCredits };
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;

    // #37 bot rule first (cheapest: no session lookup for farms).
    const ip = context.request.headers.get('cf-connecting-ip') || 'unknown';
    const vel = await checkAiIpVelocity(DB, ip, '/ai/generate-image');
    if (vel) return vel;

    const userCtx = await getUserContext(context.request, DB);
    if (!userCtx) {
      return new Response(JSON.stringify({ error: 'Sign in required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { userId, plan: storedPlan } = userCtx;
    // #49 kill-switch: instant-disable without a rebuild (checked before
    // the Pro gate — killed means killed for everyone).
    if (!(await isFlagEnabled(DB, 'ai_generation'))) {
      return new Response(JSON.stringify({ error: 'AI features are temporarily disabled' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Gates effective (live Pass counts); refill strictly stored (see generate.ts).
    const plan = await effectivePlanForUser(DB, userId, storedPlan);
    const resetPlan = resolvePlan(true, storedPlan);

    const { prompt, aspectRatio = '1:1', tier = 'hd' } = await context.request.json() as {
      prompt?: string;
      aspectRatio?: string;
      tier?: string;
    };

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return new Response(JSON.stringify({ error: 'Missing prompt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Tier split: 'draft' (Workers AI, 1 credit, any signed-in user) vs 'hd'
    // (Gemini, 5 credits, Pro-only). Unknown tier values fall back to 'hd' —
    // never to the cheaper leg, so a malformed request can't discount itself.
    const isDraft = tier === 'draft';
    const cost = isDraft ? IMAGE_DRAFT_CREDITS : IMAGE_GENERATION_CREDITS;

    // HD is a Pro-only lever (Pollinations stays free for everyone; drafts
    // cost 1 credit for any signed-in user). Signed-in free users get a
    // 402-style upsell on HD, not a silent 401.
    if (!isDraft && plan !== 'pro') {
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

    const { balance, maxCredits } = await resetCreditsIfNeeded(DB, userId, resetPlan, user.creditResetAt, user.credits);

    // Allowance first; credit packs cover the remainder (creditPacks.ts).
    if (!(await creditsAvailable(DB, userId, cost, balance))) {
      await logAiCreditEvent(DB, { userId, task: 'image', outcome: 'blocked_exhausted', balance, allowance: maxCredits });
      return new Response(JSON.stringify({ error: `Not enough credits — image generation requires ${cost}` }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const geminiKey = context.env.GEMINI_API_KEY;
    const aiBinding = context.env.AI;
    // Each tier gates on its own provider: drafts need the Workers AI
    // binding, HD needs the Gemini key. A missing provider is a 500 —
    // and a draft NEVER falls back to Gemini (that would silently 45x
    // the cost of the request; a failed draft is an honest 502).
    if (isDraft && !aiBinding) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (!isDraft && !geminiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    recordRateLimit(DB, 'ai-img', userId, '/ai/generate-image');

    if (isDraft) {
      // Draft leg: FLUX.1-schnell via Workers AI (~$0.001/image). Response
      // shape is parsed defensively — string, { image }, or raw bytes —
      // because binding return shapes vary by model version.
      let w = 1024;
      let h = 1024;
      if (aspectRatio === '16:9') { w = 1024; h = 576; }
      else if (aspectRatio === '9:16') { w = 576; h = 1024; }
      let base64: string | null = null;
      try {
        const out = await aiBinding!.run(IMAGE_DRAFT_MODEL, {
          prompt: prompt.trim(),
          width: w,
          height: h,
        });
        if (typeof out === 'string') {
          base64 = out.startsWith('data:') ? out.split(',', 2)[1] || null : out;
        } else if (out && typeof out === 'object' && typeof (out as { image?: unknown }).image === 'string') {
          const img = (out as { image: string }).image;
          base64 = img.startsWith('data:') ? img.split(',', 2)[1] || null : img;
        } else if (out instanceof Uint8Array) {
          let binary = '';
          for (let i = 0; i < out.length; i += 0x8000) {
            binary += String.fromCharCode(...out.subarray(i, i + 0x8000));
          }
          base64 = btoa(binary);
        }
      } catch (e) {
        console.error('Workers AI image draft error:', e);
      }
      if (!base64) {
        return new Response(JSON.stringify({ error: 'AI provider error' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const spentDraft = await spendCredits(DB, userId, cost, balance);
      await logAiCreditEvent(DB, { userId, task: 'image', outcome: 'allowed', balance: Math.max(balance - spentDraft.allowance, 0), allowance: maxCredits });
      return new Response(JSON.stringify({ image: base64, mimeType: 'image/png' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

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

    const spentImg = await spendCredits(DB, userId, cost, balance);
    await logAiCreditEvent(DB, { userId, task: 'image', outcome: 'allowed', balance: Math.max(balance - spentImg.allowance, 0), allowance: maxCredits });

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
