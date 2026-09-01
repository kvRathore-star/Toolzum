const ALLOWED = ['toolzum.com'];

function isAllowed(header: string | null): boolean {
  if (!header) return false;
  try {
    const url = new URL(header);
    return ALLOWED.some(o => url.hostname === o || url.hostname.endsWith('.' + o));
  } catch {
    return false;
  }
}

async function isBanned(request: Request, DB: D1Database): Promise<boolean> {
  const cookies = request.headers.get('cookie') || '';
  const tokenMatch = cookies.match(/(?:authjs\.session-token|better-auth\.session_token|auth_session)=([^;]+)/);
  const token = tokenMatch?.[1];
  if (!token) return false;
  const row = await DB.prepare(
    "SELECT u.status FROM session s JOIN \"user\" u ON s.userId = u.id WHERE s.token = ? AND s.expiresAt > unixepoch()"
  ).bind(token).first<{ status: string }>();
  return row?.status === 'banned';
}

export async function onRequest(context: { request: Request; next: () => Promise<Response>; env: { DB?: D1Database } }) {
  const { request } = context;

  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('Origin');
    const referer = request.headers.get('Referer');
    const check = origin || referer;

    // Reject if no origin/referer at all (curl, Postman, server-to-server bypass)
    if (!check) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!isAllowed(check)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (context.env.DB) {
    const banned = await isBanned(request, context.env.DB);
    if (banned) {
      return new Response(JSON.stringify({ error: 'account_banned' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cookies = request.headers.get('cookie') || '';
    const tokenMatch = cookies.match(/(?:authjs\.session-token|better-auth\.session_token|auth_session)=([^;]+)/);
    const token = tokenMatch?.[1];
    if (token) {
      context.env.DB.prepare(
        'UPDATE "user" SET "lastLoginAt" = unixepoch() WHERE id = (SELECT userId FROM session WHERE token = ?) AND ("lastLoginAt" IS NULL OR "lastLoginAt" < unixepoch() - 300)'
      ).bind(token).run().catch(() => {});
    }
  }

  return context.next();
}
