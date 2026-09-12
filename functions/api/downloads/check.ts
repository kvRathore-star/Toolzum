import { checkRateLimit, recordRateLimit } from "../rate-limit";
import { createAuth } from "../../../src/lib/auth";
import { resolvePlan, downloadLimit } from "../../../src/lib/planTiers";

interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
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
      GOOGLE_CLIENT_ID: context.env.GOOGLE_CLIENT_ID as string,
      GOOGLE_CLIENT_SECRET: context.env.GOOGLE_CLIENT_SECRET as string,
      BETTER_AUTH_SECRET: context.env.BETTER_AUTH_SECRET as string,
      BETTER_AUTH_URL: context.env.BETTER_AUTH_URL as string,
      TURNSTILE_SECRET_KEY: context.env.TURNSTILE_SECRET_KEY as string,
    });
    const session = await auth.api.getSession({ headers: request.headers });
    let plan = resolvePlan(false, null);
    let userId: string | null = null;
    if (session?.user?.id) {
      userId = session.user.id;
      const row = await DB.prepare("SELECT plan FROM user WHERE id = ?")
        .bind(userId)
        .first<{ plan: string }>();
      plan = resolvePlan(true, row?.plan ?? null);
    }

    const limit = downloadLimit(plan, isProTool);
    if (limit === Infinity) {
      return new Response(JSON.stringify({ allowed: true, remaining: 999, plan }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (limit === 0) {
      return new Response(JSON.stringify({ allowed: false, remaining: 0, plan }), {
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

    return new Response(JSON.stringify({ allowed: remaining > 0, remaining, plan }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    // Unknown state (not exhaustion): plan null tells the badge/modal to
    // render "unavailable", never "used up".
    return new Response(JSON.stringify({ allowed: false, remaining: 0, plan: null }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
