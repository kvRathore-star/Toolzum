interface Env {
  DB: D1Database;
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { DB } = context.env;
  const url = new URL(context.request.url);
  const target = url.searchParams.get('url');
  if (!target) return new Response('Missing url parameter', { status: 400 });

  try {
    new URL(target);
  } catch {
    return new Response('Invalid URL', { status: 400 });
  }

  // Rate limit: 10 requests per minute per IP
  const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';
  const recent = await DB.prepare(
    "SELECT COUNT(*) as c FROM analytics_event WHERE fingerprint = ? AND createdAt > datetime('now', '-1 minute')"
  ).bind(`url-short:${ip}`).first<{ c: number }>();
  if (recent && recent.c >= 10) {
    return new Response('Rate limited', { status: 429 });
  }

  // Log rate limit entry
  await DB.prepare(
    "INSERT INTO analytics_event (id, path, fingerprint, createdAt) VALUES (?, ?, ?, datetime('now'))"
  ).bind(crypto.randomUUID(), '/url-shorten', `url-short:${ip}`).run();

  const tinyRes = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(target)}`);
  const text = await tinyRes.text();

  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': 'https://toolzum.com',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
