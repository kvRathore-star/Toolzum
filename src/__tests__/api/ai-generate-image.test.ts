import { describe, it, expect, vi, afterEach } from 'vitest';
import { onRequestPost, IMAGE_GENERATION_CREDITS, IMAGE_DRAFT_CREDITS } from '../../../functions/api/ai/generate-image';

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
  it(`costs ${IMAGE_GENERATION_CREDITS} credits per HD image`, () => {
    expect(IMAGE_GENERATION_CREDITS).toBe(5);
  });

  it(`costs ${IMAGE_DRAFT_CREDITS} credit per draft`, () => {
    expect(IMAGE_DRAFT_CREDITS).toBe(1);
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

describe('POST /api/ai/generate-image draft tier (Workers AI, 1 credit)', () => {
  const mockAi = (image: unknown) => ({
    run: vi.fn(async () => image),
  });
  const envDraft = (opts?: { credits?: number; plan?: string; ai?: unknown }) => ({
    DB: mockDb({ credits: opts?.credits ?? 10, plan: opts?.plan ?? 'pro' }),
    GEMINI_API_KEY: 'k',
    AI: opts?.ai === undefined ? mockAi({ image: 'ZHJhZnQ=' }) : opts.ai,
  }) as unknown as typeof ENV;

  it('serves drafts to signed-in free users (HD stays Pro-only)', async () => {
    const res = await onRequestPost({
      request: req({ prompt: 'a cat', tier: 'draft' }),
      env: envDraft({ plan: 'free' }),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ image: 'ZHJhZnQ=', mimeType: 'image/png' });
  });

  it('deducts 1 credit on draft success', async () => {
    const updates: { sql: string; args: unknown[] }[] = [];
    const db = mockDb({ credits: 10 });
    const origPrepare = (db as unknown as { prepare: (sql: string) => unknown }).prepare;
    (db as unknown as { prepare: (sql: string) => unknown }).prepare = ((sql: string) => {
      const stmt = (origPrepare as (s: string) => unknown)(sql) as {
        bind: (...a: unknown[]) => unknown;
      };
      if (sql.startsWith('UPDATE user SET credits')) {
        const origBind = stmt.bind;
        stmt.bind = (...args: unknown[]) => {
          updates.push({ sql, args });
          return origBind(...args);
        };
      }
      return stmt;
    }) as never;
    const env = { DB: db, GEMINI_API_KEY: 'k', AI: mockAi({ image: 'ZHJhZnQ=' }) } as unknown as typeof ENV;
    const res = await onRequestPost({ request: req({ prompt: 'a cat', tier: 'draft' }), env });
    expect(res.status).toBe(200);
    // spendCredits: parameterized `credits - ?`, bound first arg = cost 1.
    expect(updates.some(u => u.sql.includes('credits - ?') && u.args[0] === 1)).toBe(true);
  });

  it('403s drafts below the 1-credit cost without touching the binding', async () => {
    const ai = mockAi({ image: 'ZHJhZnQ=' });
    const res = await onRequestPost({
      request: req({ prompt: 'a cat', tier: 'draft' }),
      env: envDraft({ credits: 0, ai }),
    });
    expect(res.status).toBe(403);
    expect(ai.run).not.toHaveBeenCalled();
  });

  it('500s drafts when the AI binding is absent', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const env = { DB: mockDb({ credits: 10 }), GEMINI_API_KEY: 'k' } as unknown as typeof ENV;
    const res = await onRequestPost({ request: req({ prompt: 'a cat', tier: 'draft' }), env });
    expect(res.status).toBe(500);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('502s failed drafts WITHOUT falling back to Gemini (no silent 45x spend)', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const res = await onRequestPost({
      request: req({ prompt: 'a cat', tier: 'draft' }),
      env: envDraft({ ai: mockAi(null) }),
    });
    expect(res.status).toBe(502);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('502s when the binding throws, still without touching Gemini', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const ai = { run: vi.fn(async () => { throw new Error('GPU busy'); }) };
    const res = await onRequestPost({
      request: req({ prompt: 'a cat', tier: 'draft' }),
      env: envDraft({ ai }),
    });
    expect(res.status).toBe(502);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('accepts raw-string binding responses', async () => {
    const res = await onRequestPost({
      request: req({ prompt: 'a cat', tier: 'draft' }),
      env: envDraft({ ai: mockAi('cmF3') }),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ image: 'cmF3', mimeType: 'image/png' });
  });

  it('unknown tier values fall back to HD (never to the cheaper leg)', async () => {
    const ai = mockAi({ image: 'ZHJhZnQ=' });
    const env = {
      DB: mockDb({ credits: 10, plan: 'free' }),
      GEMINI_API_KEY: 'k',
      AI: ai,
    } as unknown as typeof ENV;
    // Free user + bogus tier → HD gate fires (403), binding untouched.
    const res = await onRequestPost({ request: req({ prompt: 'a cat', tier: 'free-plz' }), env });
    expect(res.status).toBe(403);
    expect(ai.run).not.toHaveBeenCalled();
  });
});
