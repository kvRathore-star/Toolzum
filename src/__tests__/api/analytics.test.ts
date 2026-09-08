import { describe, it, expect, vi } from 'vitest';
import { onRequestPost } from '../../../functions/api/analytics';

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

function req(body: unknown, ip = '1.2.3.4') {
  return new Request('https://toolzum.com/api/analytics', {
    method: 'POST',
    headers: { 'CF-Connecting-IP': ip, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/analytics contract', () => {
  it('rejects invalid paths with 400', async () => {
    const res = await onRequestPost({
      request: req({ path: 123 }),
      env: { DB: mockDb() },
    });
    expect(res.status).toBe(400);
  });

  it('rejects overlong paths with 400', async () => {
    const res = await onRequestPost({
      request: req({ path: '/' + 'x'.repeat(600) }),
      env: { DB: mockDb() },
    });
    expect(res.status).toBe(400);
  });

  it('records valid events with ok:true', async () => {
    const res = await onRequestPost({
      request: req({ path: '/pdf/pdf-compressor' }),
      env: { DB: mockDb() },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('returns 429 when rate limited', async () => {
    const res = await onRequestPost({
      request: req({ path: '/' }),
      env: { DB: mockDb(30) },
    });
    expect(res.status).toBe(429);
  });
});
