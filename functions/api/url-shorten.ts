interface Env {
  DB: D1Database;
}

import { checkRateLimit, recordRateLimit } from './rate-limit';

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
  const rl = await checkRateLimit(DB, 'url-short', ip, 10);
  if (rl.limited) return rl.response;

  recordRateLimit(DB, 'url-short', ip, '/url-shorten');

  let tinyRes: Response;
  try {
    tinyRes = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(target)}`);
  } catch {
    return new Response(JSON.stringify({ error: 'Shortening service unreachable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://toolzum.com' },
    });
  }
  const text = (await tinyRes.text()).trim();
  // tinyurl answers 200 with an "Error" body for rejected URLs — never pass
  // that through as a success (it would get cached and displayed as a link).
  if (!tinyRes.ok || !/^https?:\/\/\S+$/.test(text)) {
    return new Response(JSON.stringify({ error: 'Shortening failed for this URL' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://toolzum.com' },
    });
  }

  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': 'https://toolzum.com',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
