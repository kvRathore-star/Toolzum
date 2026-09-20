// YouTube public-caption fetcher. Reads freely-available caption tracks via
// YouTube's timedtext endpoints — no API key, no auth. Only videos whose
// owner published captions (manual or auto) return text; anything else gets
// an honest no-captions error, never hallucinated analysis.

import { checkRateLimit, recordRateLimit } from './rate-limit';

interface Env {
  DB?: D1Database;
}

const TIMEOUT_MS = 10000;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, {
    signal: controller.signal,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ToolzumCaptionBot/1.0)' },
  }).finally(() => clearTimeout(timeout));
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n+/g, ' ')
    .trim();
}

function parseTimedText(xml: string): string[] {
  const lines: string[] = [];
  const re = /<text[^>]*>([\s\S]*?)<\/text>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const text = decodeEntities(m[1] || '');
    if (text) lines.push(text);
  }
  return lines;
}

function parseTrackList(xml: string): string[] {
  // <track ... lang_code="en" .../> — collect candidate language codes.
  const langs: string[] = [];
  const re = /<track[^>]*lang_code="([^"]+)"[^>]*>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    if (m[1] && !langs.includes(m[1])) langs.push(m[1]);
  }
  return langs;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const url = new URL(context.request.url);
    const id = (url.searchParams.get('id') || '').trim();
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) {
      return json({ error: 'Invalid YouTube video ID (expected 11 characters)' }, 400);
    }

    // Rate limit: 30 caption lookups/min per IP. Without this the endpoint
    // is an open YouTube-scraping proxy — one abuser gets the worker egress
    // IP throttled by Google and the tool dies for everyone.
    if (context.env.DB) {
      const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';
      const rl = await checkRateLimit(context.env.DB, 'yt-captions', ip, 30);
      if (rl.limited) return rl.response;
      recordRateLimit(context.env.DB, 'yt-captions', ip, '/api/youtube-captions');
    }

    // 1. Discover available caption tracks.
    let langs: string[] = [];
    try {
      const listRes = await fetchWithTimeout(
        `https://video.google.com/timedtext?type=list&v=${id}`,
      );
      if (listRes.ok) langs = parseTrackList(await listRes.text());
    } catch {
      langs = [];
    }

    // 2. Prefer English (manual, then auto), else first available track.
    const ordered = [
      ...langs.filter((l) => l === 'en'),
      ...langs.filter((l) => l.startsWith('en')),
      ...langs.filter((l) => !l.startsWith('en')),
      'en', // last resort: direct fetch in case the list endpoint lied
    ];
    const tried = new Set<string>();
    for (const lang of ordered) {
      if (tried.has(lang)) continue;
      tried.add(lang);
      try {
        const res = await fetchWithTimeout(
          `https://video.google.com/timedtext?lang=${encodeURIComponent(lang)}&v=${id}`,
        );
        if (!res.ok) continue;
        const lines = parseTimedText(await res.text());
        if (lines.length > 0) {
          return json({ videoId: id, lang, lines, lineCount: lines.length });
        }
      } catch {
        continue;
      }
    }
    return json(
      {
        error:
          'No public captions found for this video. The owner may have disabled captions — try a video with CC/subtitles enabled.',
      },
      404,
    );
  } catch {
    return json({ error: 'Caption lookup failed. Try again in a moment.' }, 500);
  }
}
