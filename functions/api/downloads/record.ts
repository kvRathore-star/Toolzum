interface Env {
  DB: D1Database;
}

function getUserLimit(plan: string | null): number {
  if (plan === 'pro') return Infinity;
  return plan ? 10 : 3;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;
    const { request } = context;

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

    const fingerprint = token || request.headers.get('x-download-fingerprint') || 'unknown';
    const today = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;

    const existing = await DB.prepare(
      "SELECT id, count FROM download_usage WHERE fingerprint = ? AND date = ?"
    ).bind(fingerprint, today).first<{ id: number; count: number }>();

    const currentCount = existing?.count || 0;
    if (currentCount >= limit) {
      return new Response(JSON.stringify({ allowed: false, remaining: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (existing) {
      await DB.prepare(
        "UPDATE download_usage SET count = count + 1, updatedAt = datetime('now') WHERE id = ?"
      ).bind(existing.id).run();
    } else {
      await DB.prepare(
        "INSERT INTO download_usage (fingerprint, date, count, createdAt, updatedAt) VALUES (?, ?, 1, datetime('now'), datetime('now'))"
      ).bind(fingerprint, today).run();
    }

    return new Response(JSON.stringify({ allowed: true, remaining: limit - currentCount - 1 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ allowed: true, remaining: 3 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
