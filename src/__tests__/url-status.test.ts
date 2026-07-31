// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { parseUrlList, chunkArray, buildResultsCsv, summarizeResults, MAX_URLS_PER_CHECK, BATCH_SIZE } from '@/utils/urlStatus';

describe('parseUrlList', () => {
  it('parses one URL per line', () => {
    const urls = parseUrlList('https://example.com\nhttps://toolzum.com\n');
    expect(urls).toEqual(['https://example.com/', 'https://toolzum.com/']);
  });

  it('extracts URL tokens from CSV cells with surrounding noise', () => {
    const urls = parseUrlList('https://example.com,200,OK\n"https://example.org",404,Not Found');
    expect(urls).toEqual(['https://example.com/', 'https://example.org/']);
  });

  it('strips trailing punctuation and fragments', () => {
    const urls = parseUrlList('https://example.com/path.\nhttps://example.com/page#section');
    expect(urls).toEqual(['https://example.com/path.', 'https://example.com/page']);
  });

  it('adds https:// to bare domains', () => {
    const urls = parseUrlList('example.com');
    expect(urls).toEqual(['https://example.com/']);
  });

  it('skips malformed lines and non-URL noise', () => {
    const urls = parseUrlList('hello world\nnot a url\nhttps://example.com');
    expect(urls).toEqual(['https://example.com/']);
  });

  it('dedupes identical URLs', () => {
    const urls = parseUrlList('https://example.com\nhttps://example.com\nhttps://example.com/');
    expect(urls).toEqual(['https://example.com/']);
  });

  it('caps at MAX_URLS_PER_CHECK', () => {
    const input = Array.from({ length: MAX_URLS_PER_CHECK + 10 }, (_, i) => `https://example.com/p/${i}`).join('\n');
    const urls = parseUrlList(input);
    expect(urls).toHaveLength(MAX_URLS_PER_CHECK);
  });
});

describe('chunkArray', () => {
  it('splits into equal chunks except the last', () => {
    const chunks = chunkArray(Array.from({ length: 100 }, (_, i) => i), BATCH_SIZE);
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toHaveLength(BATCH_SIZE);
    expect(chunks[2]).toHaveLength(10);
  });

  it('returns a single chunk for small arrays', () => {
    expect(chunkArray([1, 2, 3], 45)).toEqual([[1, 2, 3]]);
  });

  it('returns empty for empty input', () => {
    expect(chunkArray([], 45)).toEqual([]);
  });
});

describe('buildResultsCsv', () => {
  it('emits a header row and one row per result', () => {
    const csv = buildResultsCsv([
      { url: 'https://a.com', status: 200, statusText: 'OK', finalUrl: 'https://a.com', ms: 120, ok: true },
      { url: 'https://b.com', status: 404, statusText: 'Not Found', finalUrl: 'https://b.com', ms: 300, ok: false },
    ]);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('URL,Status,StatusText,FinalURL,ResponseTime(ms),OK,Error');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain('200');
  });

  it('quotes and escapes commas in URLs', () => {
    const csv = buildResultsCsv([
      { url: 'https://a.com/a,b', status: 200, statusText: 'OK', finalUrl: 'https://a.com/a,b', ms: 1, ok: true },
    ]);
    expect(csv).toContain('"https://a.com/a,b"');
  });
});

describe('summarizeResults', () => {
  it('counts status classes and slow responses', () => {
    const summary = summarizeResults([
      { url: 'a', status: 200, statusText: '', finalUrl: 'a', ms: 100, ok: true },
      { url: 'b', status: 301, statusText: '', finalUrl: 'b', ms: 100, ok: true },
      { url: 'c', status: 404, statusText: '', finalUrl: 'c', ms: 100, ok: false },
      { url: 'd', status: 500, statusText: '', finalUrl: 'd', ms: 100, ok: false },
      { url: 'e', status: 0, statusText: '', finalUrl: 'e', ms: 0, ok: false, error: 'timeout' },
      { url: 'f', status: 200, statusText: '', finalUrl: 'f', ms: 2000, ok: true },
    ]);
    expect(summary).toEqual({ ok: 2, redirects: 1, clientErrors: 1, serverErrors: 1, unreachable: 1, slow: 1 });
  });
});
