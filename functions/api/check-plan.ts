import { checkRateLimit, recordRateLimit } from "./rate-limit";
import { createAuth } from "../../src/lib/auth";
import { resolvePlan, fileCaps, effectivePlanForUser, type FileCaps } from "../../src/lib/planTiers";

interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

// Legacy alias map (kept for existing clients/tests): 'free' === anon caps.
// Canonical caps live in planTiers.fileCaps(); this map derives from it so
// the numbers exist exactly once.
export const PLAN_LIMITS: Record<string, FileCaps> = {
  free: fileCaps("anon"),
  signedin: fileCaps("signedin"),
  pro: fileCaps("pro"),
};

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;
    const ip = context.request.headers.get("cf-connecting-ip") || "unknown";

    const rl = await checkRateLimit(DB, "check-plan", ip, 30);
    if (rl.limited) return rl.response;

    // Identify user via better-auth. The session cookie is HMAC-signed, so
    // manual token lookup never matches — every signed-in user fell through
    // to 'signedin' limits (pro users got 150MB/10-file caps instead of
    // 2GB/500). Resolved through the SDK like favorites/downloads.
    const auth = createAuth({
      DB,
      GOOGLE_CLIENT_ID: context.env.GOOGLE_CLIENT_ID as string,
      GOOGLE_CLIENT_SECRET: context.env.GOOGLE_CLIENT_SECRET as string,
      BETTER_AUTH_SECRET: context.env.BETTER_AUTH_SECRET as string,
      BETTER_AUTH_URL: context.env.BETTER_AUTH_URL as string,
      TURNSTILE_SECRET_KEY: context.env.TURNSTILE_SECRET_KEY as string,
    });
    const session = await auth.api.getSession({ headers: context.request.headers });

    let plan = resolvePlan(false, null);
    let stored: string | null = null;
    if (session?.user?.id) {
      const user = await DB.prepare("SELECT plan FROM user WHERE id = ?")
        .bind(session.user.id)
        .first<{ plan: string }>();
      stored = user?.plan ?? null;
      // Authenticated free users get the signedin file/batch caps (150MB/10).
      // The DB default is 'free' for every new account — resolving the raw
      // stored value directly once served 30MB/1-file anon caps to all real
      // signed-in users (fixed Sep 12 2026, locked by check-plan.test.ts).
      // Live Pass counts as Pro (time-based, no writes needed).
      plan = await effectivePlanForUser(DB, session.user.id, stored);
    }

    const limits = fileCaps(plan);
    recordRateLimit(DB, "check-plan", ip, "/check-plan");

    return new Response(JSON.stringify({ plan, ...limits }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Service unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
}
