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

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { DB } = context.env;
    const userId = await getUserId(context.request, DB);
    if (!userId) {
      return new Response(JSON.stringify({ error: "sign_in_required" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const body = await context.request.json<{ toolSlug?: string }>();
    const toolSlug = body.toolSlug;
    if (!toolSlug || typeof toolSlug !== 'string') {
      return new Response(JSON.stringify({ error: "toolSlug required" }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    await DB.prepare(
      "DELETE FROM user_favorite WHERE userId = ? AND toolSlug = ?"
    ).bind(userId, toolSlug).run();
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: "server_error" }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
