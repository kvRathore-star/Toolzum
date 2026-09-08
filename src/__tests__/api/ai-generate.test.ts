import { describe, it, expect, vi, afterEach } from 'vitest';
import { onRequestPost } from '../../../functions/api/ai/generate';

// Query-aware D1 stub: session lookup, user row, rate-limit count.
function mockDb(opts?: { credits?: number; noUser?: boolean; rateCount?: number }) {
  const { credits = 10, noUser = false, rateCount = 0 } = opts ?? {};
  const first = vi.fn(async (sql?: unknown) => {
    void sql;
    return null;
  });
  const prepare = vi.fn((sql: string) => ({
    bind: vi.fn(() => ({
      first: vi.fn(async () => {
        if (sql.includes('FROM session')) return { userId: 'user-1', plan: 'free' };
        if (sql.includes('COUNT(*)')) return { c: rateCount };
        if (sql.includes('FROM user')) return noUser ? null : { credits, creditResetAt: Date.now() };
        return null;
      }),
      run: vi.fn(async () => ({})),
    })),
  }));
  void first;
  return { prepare } as unknown as D1Database;
}

const ENV = { DB: mockDb(), GEMINI_API_KEY: 'test-key' } as unknown as {
  DB: D1Database;
  GEMINI_API_KEY: string;
};

function req(body: unknown, cookie = 'better-auth.session_token=tok123') {
  return new Request('https://toolzum.com/api/ai/generate', {
    method: 'POST',
    headers: { cookie, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('POST /api/ai/generate contract', () => {
  it('401s without a session cookie (no DB user lookup attempted)', async () => {
    const res = await onRequestPost({
      request: req({ messages: [{ role: 'user', content: 'hi' }] }, ''),
      env: ENV,
    });
    expect(res.status).toBe(401);
  });

  it('403s with zero credits before touching the provider', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const env = { DB: mockDb({ credits: 0 }), GEMINI_API_KEY: 'k' } as unknown as typeof ENV;
    const res = await onRequestPost({ request: req({ messages: [{ role: 'user', content: 'hi' }] }), env });
    expect(res.status).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('400s on missing messages', async () => {
    const res = await onRequestPost({ request: req({}), env: ENV });
    expect(res.status).toBe(400);
  });

  it('500s without a configured provider key', async () => {
    const env = { DB: mockDb() } as unknown as typeof ENV;
    const res = await onRequestPost({
      request: req({ messages: [{ role: 'user', content: 'hi' }] }),
      env,
    });
    expect(res.status).toBe(500);
  });

  it('returns provider content on the happy path', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'hello' }] } }] }))),
    );
    const res = await onRequestPost({
      request: req({ messages: [{ role: 'user', content: 'hi' }] }),
      env: ENV,
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ content: 'hello' });
  });

  it('429s when the per-plan rate limit is hit', async () => {
    const env = { DB: mockDb({ rateCount: 99 }), GEMINI_API_KEY: 'k' } as unknown as typeof ENV;
    const res = await onRequestPost({
      request: req({ messages: [{ role: 'user', content: 'hi' }] }),
      env,
    });
    expect(res.status).toBe(429);
  });
});
