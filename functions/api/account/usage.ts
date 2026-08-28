interface Env {
  DB: D1Database;
}

async function getUserId(request: Request, DB: D1Database): Promise<string | null> {
  const cookies = request.headers.get('cookie') || '';
  const tokenMatch = cookies.match(/(?:authjs\.session-token|better-auth\.session_token|auth_session)=([^;]+)/);
  const token = tokenMatch?.[1];
  if (!token) return null;
  const user = await DB.prepare(
    "SELECT s.userId FROM session s WHERE s.token = ? AND s.expiresAt > unixepoch()"
  ).bind(token).first<{ userId: string }>();
  return user?.userId || null;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;
    const userId = await getUserId(context.request, DB);
    if (!userId) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(context.request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

    const rows = await DB.prepare(
      "SELECT path, createdAt FROM analytics_event WHERE fingerprint IN (SELECT fingerprint FROM analytics_event WHERE path LIKE '/api/ai/%') ORDER BY createdAt DESC LIMIT ?"
    ).bind(limit).all<{ path: string; createdAt: number }>();

    return new Response(JSON.stringify(rows.results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
