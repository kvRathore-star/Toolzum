import { checkRateLimit, recordRateLimit } from "./rate-limit";
import { createAuth } from "../../src/lib/auth";

interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

export const PLAN_LIMITS: Record<string, { maxFileSizeMB: number; maxBatchSize: number; threads: number }> = {
  free:     { maxFileSizeMB: 30,   maxBatchSize: 1,   threads: 1 },
  signedin: { maxFileSizeMB: 150,  maxBatchSize: 10,  threads: 1 },
  pro:      { maxFileSizeMB: 2000, maxBatchSize: 500, threads: 6 },
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

    let plan: string = 'free';
    if (session?.user?.id) {
      const user = await DB.prepare("SELECT plan FROM user WHERE id = ?")
        .bind(session.user.id)
        .first<{ plan: string }>();
      const stored = user?.plan;
      // The DB default is 'free' for every new account, so a stored 'free'
      // row (or missing row) means an authenticated free user — they get the
      // signedin file/batch caps (150MB/10). Without this, every real
      // signed-in user fell to the 30MB/1-file anon caps and was blocked at
      // download after the uploader (smartMax) allowed up to 150MB.
      if (stored === 'pro') plan = 'pro';
      else if (!stored || stored === 'free') plan = 'signedin';
      else plan = stored;
    }

    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
    recordRateLimit(DB, "check-plan", ip, "/check-plan");

    return new Response(JSON.stringify({ plan, ...limits }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Service unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
