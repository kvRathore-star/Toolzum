interface Env {
  DB?: D1Database;
}

interface CheckResult {
  url: string;
  status: number;
  statusText: string;
  finalUrl: string;
  ms: number;
  ok: boolean;
  error?: string;
}

// Free-plan Workers allow 50 subrequests/invocation. Budget leaves headroom
// for redirect hops and the concurrent in-flight fetches (CONCURRENCY).
const SUBREQUEST_BUDGET = 45;
const CONCURRENCY = 4;
const MAX_REDIRECTS = 2;
const TIMEOUT_MS = 8000;
const MAX_URLS_PER_REQUEST = 45;
const MAX_URL_LENGTH = 2048;
const SLOW_THRESHOLD_MS = 1500;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkUrl(url: string, budget: { left: number }, budgetOk: () => boolean): Promise<CheckResult> {
  const start = Date.now();
  let current = url;
  let res: Response | null = null;

  const nextHop = async (): Promise<Response | null> => {
    if (!budgetOk()) return null;
    budget.left -= 1;
    try {
      return await fetchWithTimeout(current, { method: 'HEAD', redirect: 'manual' });
    } catch {
      return null;
    }
  };

  try {
    res = await nextHop();
    let hops = 0;
    while (res && res.status >= 300 && res.status < 400 && hops < MAX_REDIRECTS) {
      const loc = res.headers.get('location');
      if (!loc) break;
      try {
        current = new URL(loc, current).href;
      } catch {
        break;
      }
      res.body?.cancel();
      res = await nextHop();
      hops++;
    }

    // Some servers reject HEAD (405/501); fall back to a ranged GET.
    if (res && (res.status === 405 || res.status === 501) && budgetOk()) {
      budget.left -= 1;
      try {
        res.body?.cancel();
        res = await fetchWithTimeout(current, {
          method: 'GET',
          headers: { Range: 'bytes=0-0' },
          redirect: 'manual',
        });
      } catch {
        res = null;
      }
    }

    const ms = Date.now() - start;
    if (!res) {
      return { url, status: 0, statusText: '', finalUrl: url, ms, ok: false, error: 'timed out or unreachable' };
    }
    res.body?.cancel();
    return {
      url,
      status: res.status,
      statusText: res.statusText,
      finalUrl: current,
      ms,
      ok: res.status >= 200 && res.status < 400,
    };
  } catch {
    res?.body?.cancel();
    return { url, status: 0, statusText: '', finalUrl: url, ms: Date.now() - start, ok: false, error: 'network error' };
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const jsonHeaders = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://toolzum.com' };

  // Rate limit: 15 checks/min per IP (each check covers up to 45 URLs).
  if (env.DB) {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const recent = await env.DB.prepare(
      "SELECT COUNT(*) as c FROM analytics_event WHERE fingerprint = ? AND createdAt > datetime('now', '-1 minute')"
    ).bind(`status-check:${ip}`).first<{ c: number }>();
    if (recent && recent.c >= 15) {
      return new Response(JSON.stringify({ error: 'Too many requests. Try again in a minute.' }), {
        status: 429,
        headers: jsonHeaders,
      });
    }
    env.DB.prepare(
      "INSERT INTO analytics_event (path, fingerprint, clientType, createdAt) VALUES (?, ?, 'url-status-check', datetime('now'))"
    ).bind('/api/url-status-check', `status-check:${ip}`).run().catch(() => {});
  }

  let body: { urls?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: jsonHeaders });
  }

  if (!Array.isArray(body.urls)) {
    return new Response(JSON.stringify({ error: 'Missing urls array' }), { status: 400, headers: jsonHeaders });
  }

  const seen = new Set<string>();
  const urls: string[] = [];
  for (const raw of body.urls) {
    if (typeof raw !== 'string') continue;
    const url = raw.trim();
    if (!url || url.length > MAX_URL_LENGTH || !isHttpUrl(url) || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
    if (urls.length >= MAX_URLS_PER_REQUEST) break;
  }

  if (urls.length === 0) {
    return new Response(JSON.stringify({ error: 'No valid URLs provided' }), { status: 400, headers: jsonHeaders });
  }

  const budget = { left: SUBREQUEST_BUDGET };
  const budgetOk = () => budget.left > 0;
  const results: CheckResult[] = [];
  const truncated: string[] = [];

  let index = 0;
  while (index < urls.length) {
    const batch = urls.slice(index, index + CONCURRENCY);
    const outcomes = await Promise.all(
      batch.map(async (u) => {
        if (!budgetOk()) {
          truncated.push(u);
          return null;
        }
        return await checkUrl(u, budget, budgetOk);
      })
    );
    for (const outcome of outcomes) {
      if (outcome) results.push(outcome);
    }
    index += CONCURRENCY;
    if (budget.left <= 0 && index < urls.length) {
      truncated.push(...urls.slice(index));
      break;
    }
  }

  const slow = results.filter(r => r.ms >= SLOW_THRESHOLD_MS).length;
  return new Response(
    JSON.stringify({
      total: urls.length,
      checked: results.length,
      skipped: truncated,
      hasMore: truncated.length > 0,
      slow,
      results,
    }),
    { status: 200, headers: jsonHeaders }
  );
}
