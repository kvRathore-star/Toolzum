import { describe, it, expect } from 'vitest';
import {
  parseUrlList,
  chunkArray,
  buildResultsCsv,
  summarizeResults,
  MAX_URLS_PER_CHECK,
  BATCH_SIZE,
  SLOW_THRESHOLD_MS,
  type UrlStatusResult,
} from '@/utils/urlStatus';

describe('parseUrlList', () => {
  it('parses URLs from newline-separated text', () => {
    const text = 'https://example.com\nhttps://google.com';
    const urls = parseUrlList(text);
    expect(urls).toEqual(['https://example.com/', 'https://google.com/']);
  });

  it('adds https:// to bare domains', () => {
    const urls = parseUrlList('example.com');
    expect(urls).toEqual(['https://example.com/']);
  });

  it('deduplicates URLs', () => {
    const text = 'https://example.com\nhttps://example.com';
    const urls = parseUrlList(text);
    expect(urls).toHaveLength(1);
  });

  it('strips hash fragments', () => {
    const urls = parseUrlList('https://example.com/page#section');
    expect(urls).toEqual(['https://example.com/page']);
  });

  it('skips empty lines', () => {
    const text = '\n\nhttps://example.com\n\n';
    const urls = parseUrlList(text);
    expect(urls).toEqual(['https://example.com/']);
  });

  it('skips malformed URLs', () => {
    const text = 'not a url\nhttps://valid.com\n:/:invalid';
    const urls = parseUrlList(text);
    expect(urls).toEqual(['https://valid.com/']);
  });

  it('parses one URL per line (not comma-separated on same line)', () => {
    const text = 'https://a.com\nhttps://b.com';
    const urls = parseUrlList(text);
    expect(urls).toEqual(['https://a.com/', 'https://b.com/']);
  });

  // Large input (~5k URLs) exceeds the default 5s timeout under v8 coverage
  // overhead; the parse itself is synchronous and deterministic.
  it('respects MAX_URLS_PER_CHECK limit', () => {
    const urls = Array.from({ length: MAX_URLS_PER_CHECK + 100 }, (_, i) => `https://example${i}.com`);
    const text = urls.join('\n');
    const result = parseUrlList(text);
    expect(result.length).toBeLessThanOrEqual(MAX_URLS_PER_CHECK);
  }, 30000);

  it('handles BOM at start of line', () => {
    const text = '\uFEFFhttps://example.com';
    const urls = parseUrlList(text);
    expect(urls).toEqual(['https://example.com/']);
  });
});

describe('chunkArray', () => {
  it('splits array into chunks', () => {
    const result = chunkArray([1, 2, 3, 4, 5], 2);
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns single chunk if array smaller than size', () => {
    const result = chunkArray([1, 2], 5);
    expect(result).toEqual([[1, 2]]);
  });

  it('returns empty array for empty input', () => {
    const result = chunkArray([], 3);
    expect(result).toEqual([]);
  });

  it('handles exact multiple of size', () => {
    const result = chunkArray([1, 2, 3, 4], 2);
    expect(result).toEqual([[1, 2], [3, 4]]);
  });
});

describe('buildResultsCsv', () => {
  it('builds CSV with header and rows', () => {
    const results: UrlStatusResult[] = [
      { url: 'https://a.com', status: 200, statusText: 'OK', finalUrl: 'https://a.com', ms: 100, ok: true },
      { url: 'https://b.com', status: 404, statusText: 'Not Found', finalUrl: 'https://b.com', ms: 200, ok: false, error: 'Not found' },
    ];
    const csv = buildResultsCsv(results);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('URL,Status,StatusText,FinalURL,ResponseTime(ms),OK,Error');
    expect(lines.length).toBe(3);
    expect(lines[1]).toContain('https://a.com');
    expect(lines[1]).toContain('200');
    expect(lines[2]).toContain('https://b.com');
    expect(lines[2]).toContain('404');
  });

  it('escapes quotes in URLs', () => {
    const results: UrlStatusResult[] = [
      { url: 'https://a.com?q="test"', status: 200, statusText: 'OK', finalUrl: 'https://a.com', ms: 50, ok: true },
    ];
    const csv = buildResultsCsv(results);
    expect(csv).toContain('""test""');
  });

  it('returns header only for empty results', () => {
    const csv = buildResultsCsv([]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(1);
  });
});

describe('summarizeResults', () => {
  it('counts OK responses (2xx)', () => {
    const results: UrlStatusResult[] = [
      { url: 'a', status: 200, statusText: '', finalUrl: '', ms: 50, ok: true },
      { url: 'b', status: 201, statusText: '', finalUrl: '', ms: 50, ok: true },
      { url: 'c', status: 204, statusText: '', finalUrl: '', ms: 50, ok: true },
    ];
    const summary = summarizeResults(results);
    expect(summary.ok).toBe(3);
    expect(summary.redirects).toBe(0);
  });

  it('counts redirects (3xx)', () => {
    const results: UrlStatusResult[] = [
      { url: 'a', status: 301, statusText: '', finalUrl: '', ms: 50, ok: false },
      { url: 'b', status: 302, statusText: '', finalUrl: '', ms: 50, ok: false },
    ];
    const summary = summarizeResults(results);
    expect(summary.redirects).toBe(2);
  });

  it('counts client errors (4xx)', () => {
    const results: UrlStatusResult[] = [
      { url: 'a', status: 404, statusText: '', finalUrl: '', ms: 50, ok: false },
      { url: 'b', status: 403, statusText: '', finalUrl: '', ms: 50, ok: false },
    ];
    const summary = summarizeResults(results);
    expect(summary.clientErrors).toBe(2);
  });

  it('counts server errors (5xx)', () => {
    const results: UrlStatusResult[] = [
      { url: 'a', status: 500, statusText: '', finalUrl: '', ms: 50, ok: false },
      { url: 'b', status: 503, statusText: '', finalUrl: '', ms: 50, ok: false },
    ];
    const summary = summarizeResults(results);
    expect(summary.serverErrors).toBe(2);
  });

  it('counts unreachable (status 0)', () => {
    const results: UrlStatusResult[] = [
      { url: 'a', status: 0, statusText: '', finalUrl: '', ms: 50, ok: false, error: 'Network error' },
    ];
    const summary = summarizeResults(results);
    expect(summary.unreachable).toBe(1);
  });

  it('counts slow responses', () => {
    const results: UrlStatusResult[] = [
      { url: 'a', status: 200, statusText: '', finalUrl: '', ms: 2000, ok: true },
      { url: 'b', status: 200, statusText: '', finalUrl: '', ms: 100, ok: true },
    ];
    const summary = summarizeResults(results);
    expect(summary.slow).toBe(1);
  });

  it('returns all zeros for empty results', () => {
    const summary = summarizeResults([]);
    expect(summary.ok).toBe(0);
    expect(summary.redirects).toBe(0);
    expect(summary.clientErrors).toBe(0);
    expect(summary.serverErrors).toBe(0);
    expect(summary.unreachable).toBe(0);
    expect(summary.slow).toBe(0);
  });
});

describe('constants', () => {
  it('MAX_URLS_PER_CHECK is a reasonable number', () => {
    expect(MAX_URLS_PER_CHECK).toBeGreaterThan(0);
    expect(MAX_URLS_PER_CHECK).toBeLessThanOrEqual(50000);
  });

  it('BATCH_SIZE is a reasonable number', () => {
    expect(BATCH_SIZE).toBeGreaterThan(0);
    expect(BATCH_SIZE).toBeLessThanOrEqual(100);
  });

  it('SLOW_THRESHOLD_MS is a reasonable threshold', () => {
    expect(SLOW_THRESHOLD_MS).toBeGreaterThan(0);
  });
});
