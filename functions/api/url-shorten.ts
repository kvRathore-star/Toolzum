interface Env {
  DB: D1Database;
}

import { checkRateLimit, recordRateLimit } from './rate-limit';

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const url = new URL(context.request.url);
  const target = url.searchParams.get('url');
  return shortenTarget(context, target);
}

// POST { url } — preferred: very long destinations overflow GET query
// limits (414) on some paths; a JSON body has no such ceiling.
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  let target: string | null = null;
  try {
    const body = (await context.request.json()) as { url?: unknown };
    target = typeof body.url === 'string' ? body.url : null;
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }
  return shortenTarget(context, target);
}

async function shortenTarget(context: { request: Request; env: Env }, target: string | null): Promise<Response> {
  const { DB } = context.env;
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

  // Shortening providers in priority order: primary first, fallback on any
  // failure (network error, non-2xx, or 200-with-error body). Failover is
  // the reliability story for bulk batches — one provider's outage must not
  // fail all N URLs. Both endpoints are plain GET text APIs.
  const providers = [
    (target: string) =>
      fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(target)}`),
    (target: string) =>
      fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(target)}`),
  ];

  let shortUrl = '';
  for (const call of providers) {
    let providerRes: Response;
    try {
      providerRes = await call(target);
    } catch {
      continue; // unreachable provider — try the next one
    }
    const text = (await providerRes.text()).trim();
    // Providers answer 200 with an "Error" body for rejected URLs — never
    // pass that through as a success (it would get cached as a link).
    if (providerRes.ok && /^https?:\/\/\S+$/.test(text)) {
      shortUrl = text;
      break;
    }
  }
  if (!shortUrl) {
    return new Response(JSON.stringify({ error: 'Shortening failed for this URL' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://toolzum.com' },
    });
  }

  return new Response(shortUrl, {
    headers: {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': 'https://toolzum.com',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
