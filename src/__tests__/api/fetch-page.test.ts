import { describe, it, expect, vi, afterEach } from 'vitest';
import { onRequestPost } from '../../../functions/api/fetch-page';

function mockDb(rateCount = 0) {
  const prepare = vi.fn((_sql: string) => ({
    bind: vi.fn(() => ({
      first: vi.fn(async () => ({ c: rateCount })),
      run: vi.fn(async () => ({})),
    })),
  }));
  return { prepare } as unknown as D1Database;
}

function req(body: unknown) {
  return new Request('https://toolzum.com/api/fetch-page', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function htmlRes(html: string, contentType = 'text/html; charset=utf-8') {
  return new Response(html, { status: 200, headers: { 'Content-Type': contentType } });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('POST /api/fetch-page contract', () => {
  it('400s non-JSON bodies', async () => {
    const bad = new Request('https://toolzum.com/api/fetch-page', { method: 'POST', body: 'not-json{{{' });
    const res = await onRequestPost({ request: bad, env: { DB: mockDb() } });
    expect(res.status).toBe(400);
  });

  it('400s non-http(s) and private-network URLs without fetching', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    for (const url of [
      'ftp://example.com/x',
      'http://localhost:3000/',
      'http://127.0.0.1/',
      'http://10.0.0.5/admin',
      'http://192.168.1.1/',
      'http://172.16.0.9/',
      'http://169.254.169.254/latest/meta-data/',
      'not a url',
    ]) {
      const res = await onRequestPost({ request: req({ url }), env: { DB: mockDb() } });
      expect(res.status).toBe(400);
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns decoded html for public pages', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => htmlRes('<html><head></head><body>hi</body></html>')));
    const res = await onRequestPost({ request: req({ url: 'https://example.com/' }), env: { DB: mockDb() } });
    expect(res.status).toBe(200);
    const data = (await res.json()) as { html?: string };
    expect(data.html).toContain('hi');
  });

  it('422s non-HTML content without returning bytes', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => htmlRes('%PDF-1.4', 'application/pdf')));
    const res = await onRequestPost({ request: req({ url: 'https://example.com/f.pdf' }), env: { DB: mockDb() } });
    expect(res.status).toBe(422);
  });

  it('502s upstream failures and unreachable hosts', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 403 })));
    const r1 = await onRequestPost({ request: req({ url: 'https://example.com/' }), env: { DB: mockDb() } });
    expect(r1.status).toBe(502);
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('down'); }));
    const r2 = await onRequestPost({ request: req({ url: 'https://example.com/' }), env: { DB: mockDb() } });
    expect(r2.status).toBe(502);
  });

  it('429s past the per-minute budget', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const res = await onRequestPost({ request: req({ url: 'https://example.com/' }), env: { DB: mockDb(99) } });
    expect(res.status).toBe(429);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
