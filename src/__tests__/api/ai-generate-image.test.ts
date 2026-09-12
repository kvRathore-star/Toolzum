import { describe, it, expect, vi, afterEach } from 'vitest';
import { onRequestPost, IMAGE_GENERATION_CREDITS } from '../../../functions/api/ai/generate-image';

function mockDb(opts?: { credits?: number; noUser?: boolean; rateCount?: number; plan?: string }) {
  const { credits = 10, noUser = false, rateCount = 0, plan = 'pro' } = opts ?? {};
  const prepare = vi.fn((sql: string) => ({
    bind: vi.fn(() => ({
      first: vi.fn(async () => {
        if (sql.includes('FROM session')) return { userId: 'user-1', plan };
        if (sql.includes('COUNT(*)')) return { c: rateCount };
        if (sql.includes('FROM user')) return noUser ? null : { credits, creditResetAt: Date.now() };
        return null;
      }),
      run: vi.fn(async () => ({})),
    })),
  }));
  return { prepare } as unknown as D1Database;
}

const ENV = { DB: mockDb(), GEMINI_API_KEY: 'test-key' } as unknown as {
  DB: D1Database;
  GEMINI_API_KEY: string;
};

function req(body: unknown, cookie = 'better-auth.session_token=tok123') {
  return new Request('https://toolzum.com/api/ai/generate-image', {
    method: 'POST',
    headers: { cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('POST /api/ai/generate-image contract', () => {
  it(`costs ${IMAGE_GENERATION_CREDITS} credits per image`, () => {
    expect(IMAGE_GENERATION_CREDITS).toBe(5);
  });

  it('401s without a session cookie', async () => {
    const res = await onRequestPost({
      request: req({ prompt: 'a cat' }, ''),
      env: ENV,
    });
    expect(res.status).toBe(401);
  });

  it('403s for signed-in free users (Pro-only lever) without touching the provider', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const env = { DB: mockDb({ credits: 30, plan: 'free' }), GEMINI_API_KEY: 'k' } as unknown as typeof ENV;
    const res = await onRequestPost({ request: req({ prompt: 'a cat' }), env });
    expect(res.status).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('403s below the 5-credit cost before touching the provider', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const env = { DB: mockDb({ credits: 4 }), GEMINI_API_KEY: 'k' } as unknown as typeof ENV;
    const res = await onRequestPost({ request: req({ prompt: 'a cat' }), env });
    expect(res.status).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('400s on missing prompt', async () => {
    const res = await onRequestPost({ request: req({}), env: ENV });
    expect(res.status).toBe(400);
  });

  it('returns base64 image on the happy path', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(
          JSON.stringify({ candidates: [{ content: { parts: [{ inlineData: { mimeType: 'image/png', data: 'aGVsbG8=' } }] } }] }),
        ),
      ),
    );
    const res = await onRequestPost({ request: req({ prompt: 'a cat' }), env: ENV });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ image: 'aGVsbG8=', mimeType: 'image/png' });
  });

  it('502s on empty provider response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ candidates: [] }))));
    const res = await onRequestPost({ request: req({ prompt: 'a cat' }), env: ENV });
    expect(res.status).toBe(502);
  });

  it('429s when the per-plan rate limit is hit', async () => {
    const env = { DB: mockDb({ rateCount: 99 }), GEMINI_API_KEY: 'k' } as unknown as typeof ENV;
    const res = await onRequestPost({ request: req({ prompt: 'a cat' }), env });
    expect(res.status).toBe(429);
  });
});
