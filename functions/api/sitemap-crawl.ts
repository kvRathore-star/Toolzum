interface Env {
  DB?: D1Database;
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

  if (!urlParam) return new Response('Missing url parameter', { status: 400 });

  // Rate limit: 3 crawls/min per IP
  if (env.DB) {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rl = await checkRateLimit(env.DB, 'crawl', ip, 3);
    if (rl.limited) return rl.response;
    recordRateLimit(env.DB, 'crawl', ip, '/api/sitemap-crawl');
  }

  let inputUrl = urlParam.trim();
  if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) inputUrl = 'https://' + inputUrl;

  try { new URL(inputUrl); } catch { return new Response('Invalid URL', { status: 400 }); }

  const maxPages = Math.min(Math.max(parseInt(maxParam || '50', 10) || 50, 5), 500);
  const exclusions = excludeParam ? excludeParam.split(',').map(s => s.trim()).filter(Boolean) : [];
  const baseUrl = inputUrl.replace(/\/$/, '') + '/';
  const startTime = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const sendEvent = (data: unknown) => {
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)); } catch {}
      };

      let rootHtml: string;
      let jsRendering = false;
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

      const visited = new Set<string>();
      const queue: string[] = [baseUrl];
      const pages: CrawledPage[] = [];
      let discovered = 1;
      let consecutiveErrors = 0;

      while (queue.length > 0 && pages.length < maxPages) {
        const currentUrl = queue.shift()!;
        if (visited.has(currentUrl)) continue;
        visited.add(currentUrl);

        if (matchesExclusion(currentUrl, exclusions)) continue;

        sendEvent({ type: 'progress', discovered: visited.size, crawled: pages.length, max: maxPages, currentUrl, log: `→ ${currentUrl}` });

        try {
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

          if (pages.length >= maxPages) break;

          const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
          let match;
          while ((match = linkRegex.exec(html)) !== null) {
            const normalized = normalizeUrl(match[1], currentUrl);
            if (normalized && isSameOrigin(normalized, inputUrl) && !visited.has(normalized)) {
              visited.add(normalized);
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
          if (consecutiveErrors > 5) break;
        }
      }

      sendEvent({
        type: 'complete',
        pages,
        xml: generateXML(pages, baseUrl),
        html: generateHTMLSitemap(pages, baseUrl),
        txt: pages.filter(p => !p.isBroken).map(p => p.url).join('\n'),
        insights: generateInsights(pages),
        durationMs: Date.now() - startTime,
        jsRendering,
        url: inputUrl,
      });
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
