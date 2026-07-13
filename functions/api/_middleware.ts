const ALLOWED = ['toolzum.com', 'tool-hub-a86.pages.dev', 'localhost', '127.0.0.1'];

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

  if (request.method === 'POST') {
    const origin = request.headers.get('Origin');
    if (origin && !isAllowed(origin)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return context.next();
}
