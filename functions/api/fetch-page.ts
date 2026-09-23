import { checkRateLimit, recordRateLimit } from './rate-limit';

interface Env {
  DB?: D1Database;
}

export const TIMEOUT_MS = 15000;
export const MAX_BYTES = 1_500_000;
const RATE_LIMIT_PER_MIN = 20;

/**
 * First-party page fetcher for the Website Screenshot tool.
 * Client-side CORS proxies (allorigins, corsproxy.io, codetabs) are
 * individually flaky and some are Shields-flagged — fetching same-origin
 * through our own Function removes that whole failure class. The public
 * proxies stay as client fallback, not primary.
 */
function isPublicHttpUrl(value: string): boolean {
  let u: URL;
  try {
    u = new URL(value);
  } catch {
    return false;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
  const host = u.hostname.toLowerCase().replace(/\.$/, '');
  if (host === 'localhost' || host.endsWith('.localhost')) return false;
  if (host === '169.254.169.254' || host === 'metadata.google.internal') return false;
  if (host === '::1' || host === '[::1]') return false;
  // Literal IPv4 private/loopback/link-local ranges.
  if (/^(10\.|127\.|192\.168\.|169\.254\.)/.test(host)) return false;
  const m172 = /^172\.(\d+)\./.exec(host);
  if (m172 && Number(m172[1]) >= 16 && Number(m172[1]) <= 31) return false;
  return true;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx;
  let url: unknown;
  try {
    ({ url } = (await request.json()) as { url?: unknown });
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  if (typeof url !== 'string' || url.length > 2048 || !isPublicHttpUrl(url)) {
    return json({ error: 'invalid_url' }, 400);
  }

  if (env.DB) {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const rl = await checkRateLimit(env.DB, 'fetch-page', ip, RATE_LIMIT_PER_MIN);
    if (rl.limited) return rl.response;
    recordRateLimit(env.DB, 'fetch-page', ip, '/api/fetch-page');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; ToolzumScreenshot/1.0)',
        accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!res.ok) return json({ error: `upstream_${res.status}` }, 502);
    const contentType = res.headers.get('content-type') || '';
    if (!/text\/html|application\/xhtml/i.test(contentType)) {
      await res.body?.cancel();
      return json({ error: 'not_html' }, 422);
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.length > MAX_BYTES) return json({ error: 'too_large' }, 413);
    if (buf.length === 0) return json({ error: 'empty' }, 502);
    return json({ html: new TextDecoder().decode(buf), finalUrl: res.url }, 200);
  } catch {
    return json({ error: 'fetch_failed' }, 502);
  } finally {
    clearTimeout(timer);
  }
};
