import { describe, it, expect, vi, afterEach } from 'vitest';
import { onRequestGet as geoGet } from '../../../functions/api/geo-country';
import { onRequestGet as shortGet } from '../../../functions/api/url-shorten';

function mockDb(count = 0) {
  return {
    prepare: vi.fn(() => ({
      bind: vi.fn(() => ({
        first: vi.fn(async () => ({ c: count })),
        run: vi.fn(async () => ({})),
      })),
    })),
  } as unknown as D1Database;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GET /api/geo-country contract', () => {
  it('defaults to US with cache headers', async () => {
    const res = await geoGet({ request: new Request('https://toolzum.com/api/geo-country') });
    expect(await res.json()).toEqual({ country: 'US' });
    expect(res.headers.get('Cache-Control')).toContain('max-age=3600');
  });
});

describe('GET /api/url-shorten contract', () => {
  it('400s without url, and on invalid URLs — no fetch attempted', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const db = mockDb();
    const missing = await shortGet({
      request: new Request('https://toolzum.com/api/url-shorten'),
      env: { DB: db },
    });
    expect(missing.status).toBe(400);
    const invalid = await shortGet({
      request: new Request('https://toolzum.com/api/url-shorten?url=not-a-url'),
      env: { DB: db },
    });
    expect(invalid.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('proxies the tinyurl response with caching headers', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('https://tinyurl.com/abc')));
    const res = await shortGet({
      request: new Request('https://toolzum.com/api/url-shorten?url=https://example.com'),
      env: { DB: mockDb() },
    });
    expect(await res.text()).toBe('https://tinyurl.com/abc');
    expect(res.headers.get('Cache-Control')).toContain('max-age=3600');
  });

  it('fails over to the second provider when the primary errors', async () => {
    const fetchSpy = vi.fn()
      .mockImplementationOnce(async () => new Response('Error', { status: 200 }))
      .mockImplementationOnce(async () => new Response('https://is.gd/xyz'));
    vi.stubGlobal('fetch', fetchSpy);
    const res = await shortGet({
      request: new Request('https://toolzum.com/api/url-shorten?url=https://example.com'),
      env: { DB: mockDb() },
    });
    expect(await res.text()).toBe('https://is.gd/xyz');
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('502s when all providers fail', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('down'); }));
    const res = await shortGet({
      request: new Request('https://toolzum.com/api/url-shorten?url=https://example.com'),
      env: { DB: mockDb() },
    });
    expect(res.status).toBe(502);
  });
});
