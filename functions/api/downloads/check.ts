import { checkRateLimit, recordRateLimit } from "../rate-limit";

interface Env {
  DB: D1Database;
}

function getUserLimit(plan: string | null): number {
  if (plan === 'pro') return Infinity;
  return plan ? 10 : 3;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;
    const { request } = context;
    const ip = request.headers.get("cf-connecting-ip") || "unknown";

    const rl = await checkRateLimit(DB, "dl-check", ip, 20);
    if (rl.limited) return rl.response;

    // Identify user from session
    const cookies = request.headers.get('cookie') || '';
    const tokenMatch = cookies.match(/(?:authjs\.session-token|better-auth\.session_token|auth_session)=([^;]+)/);
    const token = tokenMatch?.[1];
    let plan: string | null = null;
    let userId: string | null = null;
    if (token) {
      const user = await DB.prepare(
        "SELECT u.plan, s.userId FROM session s JOIN user u ON u.id = s.userId WHERE s.token = ? AND s.expiresAt > unixepoch()"
      ).bind(token).first<{ plan: string; userId: string }>();
      plan = user?.plan || null;
      userId = user?.userId || null;
    }

    const limit = getUserLimit(plan);
    if (limit === Infinity) {
      return new Response(JSON.stringify({ allowed: true, remaining: 999 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // For identified users, track by userId; otherwise by browser fingerprint
    const fingerprint = userId || request.headers.get('x-download-fingerprint') || 'unknown';
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
