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

    // Identify user from session
    const cookies = request.headers.get('cookie') || '';
    const tokenMatch = cookies.match(/(?:authjs\.session-token|better-auth\.session_token|auth_session)=([^;]+)/);
    const token = tokenMatch?.[1];
    let plan: string | null = null;
    if (token) {
      const user = await DB.prepare(
        "SELECT u.plan FROM session s JOIN user u ON u.id = s.userId WHERE s.token = ? AND s.expiresAt > unixepoch()"
      ).bind(token).first<{ plan: string }>();
      plan = user?.plan || null;
    }

    const limit = getUserLimit(plan);
    if (limit === Infinity) {
      return new Response(JSON.stringify({ allowed: true, remaining: 999 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // For identified users, track by their token; otherwise by browser fingerprint
    const fingerprint = token || request.headers.get('x-download-fingerprint') || 'unknown';
    const today = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;
    const row = await DB.prepare(
      "SELECT count FROM download_usage WHERE fingerprint = ? AND date = ?"
    ).bind(fingerprint, today).first<{ count: number }>();

    const count = row?.count || 0;
    const remaining = Math.max(0, limit - count);

    return new Response(JSON.stringify({ allowed: remaining > 0, remaining }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ allowed: true, remaining: 3 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
