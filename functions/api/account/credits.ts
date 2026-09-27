import { createAuth } from "../../../src/lib/auth";
import {
  resolvePlan, creditAllowance, CREDIT_RESET_DAYS,
  effectivePlanForUser, FREE_TRIAL_CREDITS,
  FREE_CREDITS, PRO_CREDITS,
} from "../../../src/lib/planTiers";

// Re-exported for existing importers (account-credits.test.ts).
export { FREE_CREDITS, PRO_CREDITS };

interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

/**
 * Live credit balance. Dashboard/account pages used to read `credits` from
 * the session snapshot, which only refreshes on the rolling session window
 * (up to 1 day) — balances stayed stale after AI use. This endpoint reads
 * D1 directly and applies the same monthly reset as ai/generate, so the
 * client can overlay fresh values with the session as fallback.
 */
export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;

    const auth = createAuth({
      DB,
      GOOGLE_CLIENT_ID: context.env.GOOGLE_CLIENT_ID as string,
      GOOGLE_CLIENT_SECRET: context.env.GOOGLE_CLIENT_SECRET as string,
      BETTER_AUTH_SECRET: context.env.BETTER_AUTH_SECRET as string,
      BETTER_AUTH_URL: context.env.BETTER_AUTH_URL as string,
      TURNSTILE_SECRET_KEY: context.env.TURNSTILE_SECRET_KEY as string,
    });
    const session = await auth.api.getSession({ headers: context.request.headers });
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const row = await DB.prepare(
      "SELECT plan, credits, creditResetAt FROM user WHERE id = ?"
    )
      .bind(session.user.id)
      .first<{ plan: string | null; credits: number | null; creditResetAt: number | null }>();
    if (!row) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Display plan is effective (live Pass reads as Pro); the refill
    // allowance below stays stored-plan so Pass top-ups never renew.
    const plan = await effectivePlanForUser(DB, session.user.id, row.plan);
    const allowance = creditAllowance(resolvePlan(true, row.plan));
    let credits = row.credits ?? allowance;

    const now = Date.now();
    if (!row.creditResetAt) {
      // One-time free trial (matches ai/* reset logic): grant once, stamp.
      const grant = plan === 'pro' ? allowance : FREE_TRIAL_CREDITS;
      await DB.prepare("UPDATE user SET credits = ?, creditResetAt = ? WHERE id = ?")
        .bind(grant, now, session.user.id)
        .run();
      credits = grant;
    } else if (now - row.creditResetAt >= CREDIT_RESET_DAYS * 24 * 60 * 60 * 1000) {
      // Trial spent and window lapsed: free plans do NOT refill.
      if (plan === 'pro') {
        await DB.prepare("UPDATE user SET credits = ?, creditResetAt = ? WHERE id = ?")
          .bind(allowance, now, session.user.id)
          .run();
        credits = allowance;
      }
    }

    // Credit packs stack ON TOP of the allowance and are spent after it —
    // shown separately so "45 of 200" never silently includes pack credits.
    let packCredits = 0;
    try {
      const pack = await DB.prepare(
        "SELECT COALESCE(SUM(remaining), 0) AS total FROM credit_grants WHERE userId = ? AND expiresAt > ?"
      ).bind(session.user.id, now).first<{ total: number | null }>();
      packCredits = pack?.total ?? 0;
    } catch {
      /* migration 0027 not applied yet — behave as if no packs */
    }

    return new Response(JSON.stringify({ credits, plan, allowance, packCredits }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}
