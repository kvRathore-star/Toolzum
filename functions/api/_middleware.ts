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

export async function onRequest(context: { request: Request; next: () => Promise<Response> }) {
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

  return context.next();
}
