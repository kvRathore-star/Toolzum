import { describe, it, expect, vi } from 'vitest';
import { onRequest } from '../../../functions/api/_middleware';

function mockDb(authCount = 0) {
  const runs: string[] = [];
  const prepare = vi.fn((sql: string) => ({
    bind: vi.fn(() => ({
      first: vi.fn(async () => {
        if (sql.includes('COUNT(*)')) return { c: authCount };
        return null;
      }),
      run: vi.fn(async () => {
        runs.push(sql);
        return {};
      }),
    })),
  }));
  return { db: { prepare } as unknown as D1Database, runs };
}

function ctx(opts: { url: string; method?: string; db?: D1Database }) {
  const next = vi.fn(async () => new Response('next-ok'));
  return {
    next,
    context: {
      request: new Request(opts.url, { method: opts.method ?? 'GET' }),
      next,
      env: { DB: opts.db },
    },
  };
}

describe('api middleware auth throttle (#25)', () => {
  it('passes normal auth traffic through to better-auth untouched', async () => {
    const { db } = mockDb(3);
    const { next, context } = ctx({
      url: 'https://toolzum.com/api/auth/sign-in/email',
      method: 'POST',
      db,
    });
    const res = await onRequest(context);
    expect(await res.text()).toBe('next-ok');
    expect(next).toHaveBeenCalled();
  });

  it('429s credential-stuffing scale (30+ mutations/10min/IP)', async () => {
    const { db, runs } = mockDb(30);
    const { next, context } = ctx({
      url: 'https://toolzum.com/api/auth/sign-in/email',
      method: 'POST',
      db,
    });
    const res = await onRequest(context);
    expect(res.status).toBe(429);
    expect(next).not.toHaveBeenCalled();
    expect(runs.some((s) => s.includes('abuse'))).toBe(true);
  });

  it('ignores GETs (OAuth callbacks must never throttle)', async () => {
    const { db } = mockDb(999);
    const { next, context } = ctx({
      url: 'https://toolzum.com/api/auth/callback/google?code=x',
      method: 'GET',
      db,
    });
    const res = await onRequest(context);
    expect(await res.text()).toBe('next-ok');
    expect(next).toHaveBeenCalled();
  });

  it('fails open without a DB (never locks users out on trouble)', async () => {
    const { next, context } = ctx({
      url: 'https://toolzum.com/api/auth/sign-in/email',
      method: 'POST',
    });
    const res = await onRequest(context);
    expect(await res.text()).toBe('next-ok');
  });
});
