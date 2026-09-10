import { checkRateLimit, recordRateLimit } from "../rate-limit";
import { createAuth } from "../../../src/lib/auth";

interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

function getUserLimit(plan: string | null, isProTool: boolean): number {
  if (plan === 'pro') return Infinity;
  if (isProTool) return plan ? 2 : 0;
  return plan ? 5 : 3;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;
    const { request } = context;
    const ip = request.headers.get("cf-connecting-ip") || "unknown";

    const rl = await checkRateLimit(DB, "dl-check", ip, 20);
    if (rl.limited) return rl.response;

    const url = new URL(request.url);
    const isProTool = url.searchParams.get('isPro') === '1';

    // Identify user via better-auth. The session cookie is HMAC-signed
    // (token.signature), so manual token lookup against the session table
    // never matches — resolve through the SDK like the favorites endpoints.
    const auth = createAuth({
      DB,
      GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID as string,
      GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET as string,
      BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET as string,
      BETTER_AUTH_URL: env.BETTER_AUTH_URL as string,
      TURNSTILE_SECRET_KEY: env.TURNSTILE_SECRET_KEY as string,
    });
    const session = await auth.api.getSession({ headers: request.headers });
    let plan: string | null = null;
    let userId: string | null = null;
    if (session?.user?.id) {
      userId = session.user.id;
      const row = await DB.prepare("SELECT plan FROM user WHERE id = ?")
        .bind(userId)
        .first<{ plan: string }>();
      plan = row?.plan || 'free';
    }

    const limit = getUserLimit(plan, isProTool);
    if (limit === Infinity) {
      return new Response(JSON.stringify({ allowed: true, remaining: 999 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (limit === 0) {
      return new Response(JSON.stringify({ allowed: false, remaining: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // For Pro tool downloads, prefix fingerprint to track separately
    const baseFingerprint = userId || request.headers.get('x-download-fingerprint') || 'unknown';
    const fingerprint = isProTool ? `pro:${baseFingerprint}` : baseFingerprint;
    const today = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
    const row = await DB.prepare(
      "SELECT count FROM download_usage WHERE fingerprint = ? AND date = ?"
    ).bind(fingerprint, today).first<{ count: number }>();

    const count = row?.count || 0;
    const remaining = Math.max(0, limit - count);
    recordRateLimit(DB, "dl-check", ip, "/downloads/check");

    return new Response(JSON.stringify({ allowed: remaining > 0, remaining }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ allowed: false, remaining: 0 }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
