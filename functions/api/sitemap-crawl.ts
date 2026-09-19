interface Env {
  DB?: D1Database;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
}

interface CrawledPage {
  url: string;
  lastmod: string;
  statusCode: number;
  title: string;
  metaDesc: string;
  depth: number;
  isBroken: boolean;
}

interface SEOInsights {
  missingMeta: number;
  brokenLinks: number;
  duplicateTitles: number;
  totalPages: number;
  healthyPages: number;
}

import { checkRateLimit, recordRateLimit } from './rate-limit';
import { createAuth } from '../../src/lib/auth';
import { effectivePlanForUser } from '../../src/lib/planTiers';
import { sendEmail } from '../../src/lib/email';

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function calculatePriority(depth: number): number {
  const priorities = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5];
  return priorities[Math.min(depth, priorities.length - 1)];
}

function inferChangeFreq(url: string, depth: number): string {
  if (depth === 0) return 'daily';
  if (/\/blog\/|\/news\/|\/post\//.test(url)) return 'weekly';
  if (/\/product\/|\/shop\//.test(url)) return 'weekly';
  if (/\/about|\/contact|\/privacy|\/terms/.test(url)) return 'monthly';
  if (depth === 1) return 'weekly';
  return 'monthly';
}

function generateXML(pages: CrawledPage[], baseUrl: string): string {
  const urls = pages.filter(p => !p.isBroken).map(p => `
  <url>
    <loc>${escapeXml(p.url.startsWith('http') ? p.url : baseUrl.replace(/\/$/, '') + p.url)}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${inferChangeFreq(p.url, p.depth)}</changefreq>
    <priority>${calculatePriority(p.depth).toFixed(1)}</priority>
  </url>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls}
</urlset>`;
}

function generateHTMLSitemap(pages: CrawledPage[], baseUrl: string): string {
  const items = pages.filter(p => !p.isBroken).map(p =>
    `<li><a href="${escapeXml(p.url.startsWith('http') ? p.url : baseUrl.replace(/\/$/, '') + p.url)}">${escapeXml(p.title || p.url)}</a></li>`
  ).join('\n    ');
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Sitemap — ${escapeXml(baseUrl)}</title></head>
<body>
  <h1>Sitemap for ${escapeXml(baseUrl)}</h1>
  <ul>
    ${items}
  </ul>
</body>
</html>`;
}

function generateInsights(pages: CrawledPage[]): SEOInsights {
  const titles = pages.filter(p => p.title).map(p => p.title);
  return {
    missingMeta: pages.filter(p => !p.metaDesc).length,
    brokenLinks: pages.filter(p => p.isBroken).length,
    duplicateTitles: titles.length - new Set(titles).size,
    totalPages: pages.length,
    healthyPages: pages.filter(p => !p.isBroken && p.metaDesc && p.title).length,
  };
}

function isSameOrigin(url: string, baseUrl: string): boolean {
  try { return new URL(url).origin === new URL(baseUrl).origin; } catch { return false; }
}

function normalizeUrl(href: string, baseUrl: string): string | null {
  try {
    const url = new URL(href, baseUrl);
    url.hash = '';
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.href;
  } catch { return null; }
}

function matchesExclusion(url: string, rules: string[]): boolean {
  return rules.some(pattern => {
    if (!pattern.trim()) return false;
    if (pattern.startsWith('/') && pattern.endsWith('/*')) return url.includes(pattern.slice(0, -1));
    if (pattern.startsWith('?') || pattern.startsWith('#')) return url.includes(pattern);
    try { return new RegExp(pattern).test(url); } catch { return url.includes(pattern); }
  });
}

/** Extract <loc> URLs from a sitemap (urlset) or sitemap index. Same-origin only. */
function extractSitemapLocs(xml: string, baseUrl: string): { urls: string[]; indexLocs: string[] } {
  const urls: string[] = [];
  const indexLocs: string[] = [];
  const locRe = /<\s*loc\s*>\s*([^<]+?)\s*<\s*\/\s*loc\s*>/gi;
  let m;
  while ((m = locRe.exec(xml)) !== null) {
    const raw = (m[1] || '').trim();
    if (!raw) continue;
    try {
      const abs = new URL(raw, baseUrl).href;
      if (!isSameOrigin(abs, baseUrl)) continue;
      // .xml locs are (sub-)sitemaps; everything else is a page URL.
      if (/\.xml(\?|$)/i.test(abs)) {
        if (!indexLocs.includes(abs)) indexLocs.push(abs);
      } else if (!urls.includes(abs)) {
        urls.push(abs);
      }
    } catch { /* skip malformed */ }
  }
  return { urls, indexLocs };
}

/** Parse robots.txt: returns { sitemaps, disallows, crawlDelayMs }. */
function parseRobots(txt: string): { sitemaps: string[]; disallows: string[]; crawlDelayMs: number } {
  const sitemaps: string[] = [];
  const disallows: string[] = [];
  let crawlDelayMs = 0;
  for (const line of txt.split('\n')) {
    const clean = line.split('#')[0]!.trim();
    const sm = clean.match(/^sitemap\s*:\s*(\S+)/i);
    if (sm && sm[1] && !sitemaps.includes(sm[1])) { sitemaps.push(sm[1]!); continue; }
    const dm = clean.match(/^disallow\s*:\s*(\S*)/i);
    if (dm && dm[1] && !disallows.includes(dm[1])) { disallows.push(dm[1]!); continue; }
    const cd = clean.match(/^crawl-delay\s*:\s*(\d+)/i);
    if (cd) crawlDelayMs = Math.min(Math.max(parseInt(cd[1]!, 10) || 0, 0), 10000);
  }
  return { sitemaps, disallows, crawlDelayMs };
}

const POLITENESS_MS = 150;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function sendCrawlNotification(
  env: Env,
  to: string,
  baseUrl: string,
  pages: CrawledPage[],
  durationMs: number,
  insights: SEOInsights,
) {
  const healthy = pages.filter((p) => !p.isBroken).length;
  const broken = pages.filter((p) => p.isBroken).length;
  const duration = Math.round(durationMs / 1000);
  const text = [
    `Your sitemap crawl for ${baseUrl} is complete.`,
    ``,
    `Pages crawled: ${pages.length}`,
    `Healthy: ${healthy}  |  Broken: ${broken}`,
    `Missing meta description: ${insights.missingMeta}`,
    `Duplicate titles: ${insights.duplicateTitles}`,
    `Duration: ${duration}s`,
    ``,
    `Open the tool to view, download, or copy the XML sitemap.`,
  ].join('\n');
  await sendEmail(env, {
    to,
    subject: `Sitemap complete: ${baseUrl} (${pages.length} pages)`,
    text,
  });
}
/** Pages crawled per invocation — keeps free-plan subrequests (~pages + a few
 *  sitemap docs) safely under the 50/invocation ceiling. */
const CHUNK_PAGES = 20;
const SESSION_TTL_S = 3600;
const MAX_SITEMAP_FETCHES = 10;

interface CrawlSession {
  baseUrl: string;
  inputUrl: string;
  jsRendering: boolean;
  maxAllowed: number;
  exclusions: string[];
  queue: string[];
  visited: string[];
  pages: CrawledPage[];
  discovered: number;
  consecutiveErrors: number;
  delayMs: number;
  jsRendering: boolean;
  createdAt: number;
}

function newSessionId(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  return [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

async function detectSPA(html: string): Promise<boolean> {
  return /<div id="root">\s*<\/div>|<div id="__next">|<div id="app">\s*<\/div>|window\.__NUXT__|<app-root>|<div id="__nuxt">/.test(html);
}

async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { signal: controller.signal }); } finally { clearTimeout(timeout); }
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }): Promise<Response> {
  const url = new URL(request.url);
  const urlParam = url.searchParams.get('url');
  const excludeParam = url.searchParams.get('exclude');
  const maxParam = url.searchParams.get('max');
  const cursorParam = url.searchParams.get('cursor');
  const notifyEmail = url.searchParams.get('notify');

  // Continuation of an existing chunked crawl: session carries all state,
  // so no rate limit and no re-validation (the originating request paid those).
  let resumed: CrawlSession | null = null;
  if (cursorParam) {
    if (!env.DB) return new Response('Crawl sessions unavailable', { status: 503 });
    const row = await env.DB.prepare('SELECT * FROM crawl_session WHERE id = ?')
      .bind(cursorParam)
      .first<CrawlSession & { updatedAt: number }>()
      .catch(() => null);
    if (!row) return new Response('Crawl session expired or unknown — please restart.', { status: 404 });
    if (Date.now() / 1000 - (row.updatedAt || 0) > SESSION_TTL_S) {
      await env.DB.prepare('DELETE FROM crawl_session WHERE id = ?').bind(cursorParam).run().catch(() => {});
      return new Response('Crawl session expired — please restart.', { status: 404 });
    }
    resumed = {
      baseUrl: row.baseUrl, inputUrl: row.inputUrl, maxAllowed: row.maxAllowed,
      exclusions: JSON.parse(row.exclusions || '[]'),
      queue: JSON.parse(row.queue || '[]'), visited: JSON.parse(row.visited || '[]'),
      pages: JSON.parse(row.pages || '[]'), discovered: row.discovered || 0,
      consecutiveErrors: 0, delayMs: POLITENESS_MS, jsRendering: !!(row as { jsRendering?: number }).jsRendering,
      createdAt: row.createdAt || Date.now() / 1000,
    };
  }

  if (!resumed && !urlParam) return new Response('Missing url parameter', { status: 400 });

  // Rate limit: 3 new crawls/min per IP (continuations are exempt).
  if (!resumed && env.DB) {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rl = await checkRateLimit(env.DB, 'crawl', ip, 3);
    if (rl.limited) return rl.response;
    recordRateLimit(env.DB, 'crawl', ip, '/api/sitemap-crawl');
  }

  let inputUrl = (resumed ? resumed.inputUrl : urlParam!.trim());
  if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) inputUrl = 'https://' + inputUrl;

  try { new URL(inputUrl); } catch { return new Response('Invalid URL', { status: 400 }); }

  const maxPages = Math.min(Math.max(parseInt(maxParam || '50', 10) || 50, 5), 500);

  // Tier enforcement (matches UI labels): anon 100, signed-in 200, pro 500.
  // Best-effort: any failure resolves to anon caps, never blocks the crawl.
  // Resumed crawls keep the cap stored at creation (no re-resolution mid-crawl).
  let tierCap = 100;
  if (!resumed) {
    try {
      if (env.DB && env.BETTER_AUTH_SECRET) {
        const auth = createAuth({
          DB: env.DB,
          GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID as string,
          GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET as string,
          BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET as string,
          BETTER_AUTH_URL: env.BETTER_AUTH_URL as string,
        });
        const session = await auth.api.getSession({ headers: request.headers });
        if (session?.user?.id) {
          const row = await env.DB.prepare('SELECT plan FROM "user" WHERE id = ?')
            .bind(session.user.id)
            .first<{ plan: string | null }>()
            .catch(() => null);
          const plan = await effectivePlanForUser(env.DB, session.user.id, row?.plan ?? null);
          tierCap = plan === 'pro' ? 500 : 200;
        }
      }
    } catch { /* anon caps */ }
  } else {
    tierCap = 500; // cap already pinned in session; Math.min below is a no-op guard
  }
  const maxAllowed = resumed ? resumed.maxAllowed : Math.min(maxPages, tierCap);
  const exclusions = resumed
    ? resumed.exclusions
    : (excludeParam ? excludeParam.split(',').map(s => s.trim()).filter(Boolean) : []);
  const baseUrl = (resumed ? resumed.baseUrl : inputUrl.replace(/\/$/, '') + '/');
  const startTime = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const sendEvent = (data: unknown) => {
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)); } catch {}
      };

      let rootHtml: string;
      let jsRendering = resumed ? resumed.jsRendering : false;
      let visited = new Set<string>(resumed ? resumed.visited : []);
      let queued = new Set<string>(resumed ? resumed.queue.concat(resumed.visited) : [baseUrl]);
      let queue: string[] = resumed ? [...resumed.queue] : [baseUrl];
      let pages: CrawledPage[] = resumed ? [...resumed.pages] : [];
      let discovered = resumed ? resumed.discovered : 1;
      let consecutiveErrors = 0;
      let delayMs = POLITENESS_MS;
      // Without D1 there are no sessions: single invocation crawls everything.
      const chunkBudget = env.DB ? CHUNK_PAGES : Number.MAX_SAFE_INTEGER;
      let chunkCrawled = 0;

      if (!resumed) {
        try {
          const rootRes = await fetchWithTimeout(baseUrl);
          rootHtml = await rootRes.text();
          jsRendering = await detectSPA(rootHtml);
        } catch {
          sendEvent({ type: 'error', message: `Could not reach ${baseUrl}. The site may be down or blocking automated requests.` });
          controller.close();
          return;
        }

        if (jsRendering) sendEvent({ type: 'js_detected' });

      // Tier 0 (free): seed from robots.txt + sitemap.xml before BFS link crawl.
      // This covers content sites fully with ~2 extra fetches and makes the
      // robots.txt FAQ claim true (Disallow rules become exclusions).
      // First-chunk only: continuations resume from the saved session.
      try {
        const robotsRes = await fetchWithTimeout(new URL('/robots.txt', baseUrl).href, 8000);
        if (robotsRes.ok) {
          const { sitemaps, disallows, crawlDelayMs } = parseRobots(await robotsRes.text());
          // Politeness: robots Crawl-delay wins, else a 150ms baseline between same-host fetches.
          if (crawlDelayMs > 0) delayMs = crawlDelayMs;
          for (const d of disallows) {
            const rule = d.endsWith('/*') ? d : d + '*';
            if (!exclusions.includes(rule)) exclusions.push(rule);
          }
          const origin = new URL(baseUrl).origin;
          const sitemapQueue: string[] = [];
          const seenSitemaps = new Set<string>();
          const pushSitemap = (loc: string) => {
            try {
              const abs = new URL(loc, baseUrl).href;
              if (abs.startsWith(origin) && !seenSitemaps.has(abs)) { seenSitemaps.add(abs); sitemapQueue.push(abs); }
            } catch { /* skip malformed */ }
          };
          pushSitemap(new URL('/sitemap.xml', baseUrl).href);
          for (const s of sitemaps) pushSitemap(s);
          let depth = 0;
          let seeded = 0;
          let sitemapFetches = 0;
          while (sitemapQueue.length > 0 && depth < 2 && seeded < maxAllowed * 2 && sitemapFetches < MAX_SITEMAP_FETCHES) {
            const levelSize = sitemapQueue.length;
            let addedThisLevel = 0;
            for (let i = 0; i < levelSize && seeded < maxAllowed * 2 && sitemapFetches < MAX_SITEMAP_FETCHES; i++) {
              const loc = sitemapQueue.shift()!;
              await sleep(delayMs);
              sitemapFetches++;
              try {
                const r = await fetchWithTimeout(loc, 8000);
                if (!r.ok) continue;
                const { urls, indexLocs } = extractSitemapLocs(await r.text(), baseUrl);
                for (const u of urls) {
                  if (seeded >= maxAllowed * 2) break;
                  if (!queued.has(u) && !matchesExclusion(u, exclusions)) {
                    queued.add(u);
                    discovered++;
                    queue.push(u);
                    seeded++;
                    addedThisLevel++;
                  }
                }
                for (const x of indexLocs) {
                  if (!seenSitemaps.has(x) && x.startsWith(origin)) { seenSitemaps.add(x); sitemapQueue.push(x); }
                }
              } catch { /* skip unreachable sitemaps */ }
            }
            // stop only when the level produced neither pages nor new sub-sitemaps
            if (addedThisLevel === 0 && sitemapQueue.length === 0) break;
            depth++;
          }
          if (seeded > 0) {
            sendEvent({ type: 'progress', discovered, crawled: 0, max: maxAllowed, currentUrl: baseUrl, log: `✓ Seeded ${seeded} URLs from sitemap.xml / robots.txt` });
          }
        }
      } catch { /* robots/sitemap seeding is best-effort; BFS proceeds regardless */ }
      } // end if (!resumed): continuations skip root fetch + seeding

      // Chunked BFS: at most CHUNK_PAGES page fetches per invocation so free-plan
      // subrequest ceilings are never hit; the client chains continuations.
      while (queue.length > 0 && pages.length < maxAllowed && chunkCrawled < chunkBudget) {
        const currentUrl = queue.shift()!;
        if (visited.has(currentUrl)) continue;
        visited.add(currentUrl);

        if (matchesExclusion(currentUrl, exclusions)) continue;

        sendEvent({ type: 'progress', discovered, crawled: pages.length, max: maxAllowed, currentUrl, log: `→ ${currentUrl}` });

        try {
          await sleep(delayMs);
          const res = await fetchWithTimeout(currentUrl);
          const html = await res.text();
          consecutiveErrors = 0;

          const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
          const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ||
                           html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);

          pages.push({
            url: currentUrl,
            lastmod: res.headers.get('last-modified')?.split('T')[0] || new Date().toISOString().split('T')[0],
            statusCode: res.status,
            title: titleMatch ? titleMatch[1].trim() : '',
            metaDesc: metaMatch ? metaMatch[1].trim() : '',
            depth: currentUrl === baseUrl ? 0 : currentUrl.split('/').filter(Boolean).length - 1,
            isBroken: res.status >= 400,
          });
          chunkCrawled++;

          if (pages.length >= maxAllowed) break;

          const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
          let match;
          while ((match = linkRegex.exec(html)) !== null) {
            const normalized = normalizeUrl(match[1], currentUrl);
            if (normalized && isSameOrigin(normalized, inputUrl) && !queued.has(normalized)) {
              queued.add(normalized);
              discovered++;
              queue.push(normalized);
            }
          }
        } catch {
          consecutiveErrors++;
          pages.push({
            url: currentUrl,
            lastmod: new Date().toISOString().split('T')[0],
            statusCode: 0,
            title: '', metaDesc: '',
            depth: currentUrl === baseUrl ? 0 : currentUrl.split('/').filter(Boolean).length - 1,
            isBroken: true,
          });
          chunkCrawled++;
          if (consecutiveErrors > 5) break;
        }
      }

      const finished = queue.length === 0 || pages.length >= maxAllowed;
      if (!finished && env.DB) {
        // Save session and hand the client a cursor for the next chunk.
        const cursor = newSessionId();
        const now = Math.floor(Date.now() / 1000);
        try {
          await env.DB.prepare(
            'INSERT OR REPLACE INTO crawl_session (id, baseUrl, inputUrl, maxAllowed, exclusions, queue, visited, pages, discovered, jsRendering, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          ).bind(
            cursor, baseUrl, inputUrl, maxAllowed,
            JSON.stringify(exclusions), JSON.stringify(queue),
            JSON.stringify([...visited]), JSON.stringify(pages),
            discovered, jsRendering ? 1 : 0, now, now,
          ).run();
          // Retire the previous cursor (continuations only) so each crawl
          // leaves at most one live session row; the final chunk deletes
          // its cursor on completion, and the sweep below covers aborts.
          if (cursorParam) {
            await env.DB.prepare('DELETE FROM crawl_session WHERE id = ?').bind(cursorParam).run().catch(() => {});
          }
          // Best-effort expiry sweep for abandoned sessions.
          await env.DB.prepare('DELETE FROM crawl_session WHERE updatedAt < ?')
            .bind(now - SESSION_TTL_S).run().catch(() => {});
          sendEvent({ type: 'partial', cursor, pages, discovered, crawled: pages.length, max: maxAllowed });
        } catch {
          // Session store failed: fall through and complete with what we have.
          const completeData = {
            type: 'complete' as const,
            pages,
            xml: generateXML(pages, baseUrl),
            html: generateHTMLSitemap(pages, baseUrl),
            txt: pages.filter(p => !p.isBroken).map(p => p.url).join('\n'),
            insights: generateInsights(pages),
            durationMs: Date.now() - startTime,
            jsRendering,
            url: inputUrl,
          };
          sendEvent(completeData);
          if (notifyEmail) sendCrawlNotification(env, notifyEmail, baseUrl, pages, completeData.durationMs, completeData.insights).catch(() => {});
        }
        controller.close();
        return;
      }

      if (cursorParam && env.DB) {
        await env.DB.prepare('DELETE FROM crawl_session WHERE id = ?').bind(cursorParam).run().catch(() => {});
      }
      const finalInsights = generateInsights(pages);
      const finalDurationMs = Date.now() - startTime;
      sendEvent({
        type: 'complete',
        pages,
        xml: generateXML(pages, baseUrl),
        html: generateHTMLSitemap(pages, baseUrl),
        txt: pages.filter(p => !p.isBroken).map(p => p.url).join('\n'),
        insights: finalInsights,
        durationMs: finalDurationMs,
        jsRendering,
        url: inputUrl,
      });
      if (notifyEmail) sendCrawlNotification(env, notifyEmail, baseUrl, pages, finalDurationMs, finalInsights).catch(() => {});
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': 'https://toolzum.com',
    },
  });
}
