export const MAX_URLS_PER_CHECK = 5000;
export const BATCH_SIZE = 45;
export const SLOW_THRESHOLD_MS = 1500;

export interface UrlStatusResult {
  url: string;
  status: number;
  statusText: string;
  finalUrl: string;
  ms: number;
  ok: boolean;
  error?: string;
}

export interface StatusCheckResponse {
  total: number;
  checked: number;
  skipped: string[];
  hasMore: boolean;
  slow: number;
  results: UrlStatusResult[];
}

const URL_TOKEN = /https?:\/\/[^\s,;"'\u2018\u2019\u201C\u201D]+/i;

export function parseUrlList(text: string): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/^\uFEFF/, '').trim();
    if (!line) continue;
    const match = line.match(URL_TOKEN);
    const candidate = match ? match[0] : line;
    if (!candidate) continue;
    let url = candidate;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    try {
      const parsed = new URL(url);
      parsed.hash = '';
      if (parsed.hostname.includes('.') && !seen.has(parsed.href)) {
        seen.add(parsed.href);
        urls.push(parsed.href);
      }
    } catch {
      // skip malformed
    }
  }
  return urls.slice(0, MAX_URLS_PER_CHECK);
}

export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export function buildResultsCsv(results: UrlStatusResult[]): string {
  const header = 'URL,Status,StatusText,FinalURL,ResponseTime(ms),OK,Error';
  const rows = results.map(r => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    return [esc(r.url), r.status, esc(r.statusText), esc(r.finalUrl), r.ms, r.ok ? 'true' : 'false', esc(r.error || '')].join(',');
  });
  return [header, ...rows].join('\n');
}

export function summarizeResults(results: UrlStatusResult[]) {
  let ok = 0;
  let redirects = 0;
  let clientErrors = 0;
  let serverErrors = 0;
  let unreachable = 0;
  let slow = 0;
  for (const r of results) {
    if (r.status >= 200 && r.status < 300) ok++;
    else if (r.status >= 300 && r.status < 400) redirects++;
    else if (r.status >= 400 && r.status < 500) clientErrors++;
    else if (r.status >= 500) serverErrors++;
    else unreachable++;
    if (r.ms >= SLOW_THRESHOLD_MS) slow++;
  }
  return { ok, redirects, clientErrors, serverErrors, unreachable, slow };
}
