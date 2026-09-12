import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../src/lib/auth', () => ({
  createAuth: vi.fn(() => ({
    api: {
      getSession: vi.fn(async ({ headers }: { headers: Headers }) =>
        headers.get('x-test-user')
          ? { user: { id: headers.get('x-test-user') } }
          : null,
      ),
    },
  })),
}));

import { onRequestGet as dlCheck } from '../../../functions/api/downloads/check';
import { onRequestPost as dlRecord } from '../../../functions/api/downloads/record';

interface SeenQuery {
  sql: string;
  args: unknown[];
}

function mockDb(
  opts: {
    usageCount?: number;
    planByUser?: Record<string, string | null>;
    rateCount?: number;
  } = {},
) {
  const { usageCount = 0, planByUser = {}, rateCount = 0 } = opts;
  const seen: SeenQuery[] = [];
  const prepare = vi.fn((sql: string) => ({
    bind: (...args: unknown[]) => {
      seen.push({ sql, args });
      return {
        first: async () => {
          if (sql.includes('FROM analytics_event')) return { c: rateCount };
          if (sql.includes('SELECT plan FROM user')) {
            const uid = String(args[0] ?? '');
            if (uid in planByUser) {
              const plan = planByUser[uid];
              return plan ? { plan } : null;
            }
            return { plan: uid === 'pro-user' ? 'pro' : 'free' };
          }
          if (sql.includes('FROM download_usage')) {
            // record.ts selects `id, count`; check.ts selects `count`.
            if (sql.includes('id, count')) {
              return usageCount > 0 ? { id: 7, count: usageCount } : null;
            }
            return { count: usageCount };
          }
          return null;
        },
        run: async () => ({}),
        all: async () => ({ results: [] }),
      };
    },
  }));
  return { db: { prepare } as unknown as D1Database, seen };
}

function usageFingerprint(seen: SeenQuery[]): unknown {
  return seen.find((q) => q.sql.includes('FROM download_usage'))?.args[0];
}

function checkReq(opts: { user?: string; fingerprint?: string; isPro?: boolean } = {}) {
  const url = new URL('https://toolzum.com/api/downloads/check');
  if (opts.isPro) url.searchParams.set('isPro', '1');
  const headers: Record<string, string> = {};
  if (opts.user) headers['x-test-user'] = opts.user;
  if (opts.fingerprint) headers['x-download-fingerprint'] = opts.fingerprint;
  return new Request(url.toString(), { headers });
}

function recordReq(
  body: unknown,
  opts: { user?: string; fingerprint?: string; rawBody?: boolean } = {},
) {
  const headers: Record<string, string> = {};
  if (opts.user) headers['x-test-user'] = opts.user;
  if (opts.fingerprint) headers['x-download-fingerprint'] = opts.fingerprint;
  if (opts.rawBody) {
    return new Request('https://toolzum.com/api/downloads/record', {
      method: 'POST',
      headers,
    });
  }
  headers['Content-Type'] = 'application/json';
  return new Request('https://toolzum.com/api/downloads/record', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

describe('GET /api/downloads/check contract', () => {
  it('anon free tool, fresh quota: allowed with remaining 3', async () => {
    const { db } = mockDb();
    const res = await dlCheck({
      request: checkReq({ fingerprint: 'fp-1' }),
      env: { DB: db } as never,
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ allowed: true, remaining: 3, plan: 'anon' });
  });

  it('anon pro tool: blocked (limit 0), no usage row consulted', async () => {
    const { db, seen } = mockDb();
    const res = await dlCheck({
      request: checkReq({ fingerprint: 'fp-1', isPro: true }),
      env: { DB: db } as never,
    });
    expect(await res.json()).toEqual({ allowed: false, remaining: 0, plan: 'anon' });
    expect(seen.some((q) => q.sql.includes('FROM download_usage'))).toBe(false);
  });

  it('signed-in free user, free tool: allowed with remaining 5', async () => {
    const { db } = mockDb();
    const res = await dlCheck({
      request: checkReq({ user: 'free-user' }),
      env: { DB: db } as never,
    });
    expect(await res.json()).toEqual({ allowed: true, remaining: 5, plan: 'signedin' });
  });

  it('signed-in free user, pro tool: limit 2 bucket with pro: fingerprint prefix', async () => {
    const { db, seen } = mockDb({ usageCount: 1 });
    const res = await dlCheck({
      request: checkReq({ user: 'free-user', isPro: true }),
      env: { DB: db } as never,
    });
    expect(await res.json()).toEqual({ allowed: true, remaining: 1, plan: 'signedin' });
    expect(usageFingerprint(seen)).toBe('pro:free-user');
  });

  it('anon pro-tool bucket is observable on the blocked event row', async () => {
    // Anonymous pro-tool calls are blocked before the usage SELECT, but the
    // download_event INSERT still carries the prefixed fingerprint.
    const { db, seen } = mockDb();
    const res = await dlRecord({
      request: recordReq(
        { toolSlug: 'pro-tool', category: 'PDF', isPro: true },
        { fingerprint: 'fp-1' },
      ),
      env: { DB: db } as never,
    });
    expect(await res.json()).toEqual({ allowed: false, remaining: 0 });
    const evt = seen.find((q) => q.sql.includes('INSERT INTO download_event'));
    expect(evt).toBeDefined();
    // bind order: userId, fingerprint, userType, toolSlug, category, ...
    expect(evt?.args[1]).toBe('pro:fp-1');
  });

  it('pro user: unlimited (remaining 999) on free and pro tools', async () => {
    const { db } = mockDb();
    for (const isPro of [false, true]) {
      const res = await dlCheck({
        request: checkReq({ user: 'pro-user', isPro }),
        env: { DB: db } as never,
      });
      expect(await res.json()).toEqual({ allowed: true, remaining: 999, plan: 'pro' });
    }
  });

  it('quota exhausted: anon at 3/3 is blocked with remaining 0', async () => {
    const { db } = mockDb({ usageCount: 3 });
    const res = await dlCheck({
      request: checkReq({ fingerprint: 'fp-1' }),
      env: { DB: db } as never,
    });
    expect(await res.json()).toEqual({ allowed: false, remaining: 0, plan: 'anon' });
  });

  it('service failure reports plan null (unknown state, never "used up")', async () => {
    const db = {
      prepare: () => { throw new Error('D1 down'); },
    } as unknown as D1Database;
    const res = await dlCheck({
      request: checkReq({ fingerprint: 'fp-1' }),
      env: { DB: db } as never,
    });
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ allowed: false, remaining: 0, plan: null });
  });
});

describe('POST /api/downloads/record contract', () => {
  it('anon free tool, fresh quota: allowed, remaining 2, counter inserted', async () => {
    const { db, seen } = mockDb();
    const res = await dlRecord({
      request: recordReq({ toolSlug: 'pdf-compressor', category: 'PDF' }, { fingerprint: 'fp-1' }),
      env: { DB: db } as never,
    });
    expect(await res.json()).toEqual({ allowed: true, remaining: 2 });
    expect(
      seen.some((q) => q.sql.includes('INSERT INTO download_usage')),
    ).toBe(true);
  });

  it('anon pro tool: immediate block with remaining 0', async () => {
    const { db } = mockDb();
    const res = await dlRecord({
      request: recordReq({ isPro: true }, { fingerprint: 'fp-1' }),
      env: { DB: db } as never,
    });
    expect(await res.json()).toEqual({ allowed: false, remaining: 0 });
  });

  it('signed-in free user: limit 5, fresh quota leaves remaining 4', async () => {
    const { db } = mockDb();
    const res = await dlRecord({
      request: recordReq({}, { user: 'free-user' }),
      env: { DB: db } as never,
    });
    expect(await res.json()).toEqual({ allowed: true, remaining: 4 });
  });

  it('quota exhausted: anon at 3/3 blocked_quota with remaining 0', async () => {
    const { db, seen } = mockDb({ usageCount: 3 });
    const res = await dlRecord({
      request: recordReq(
        { toolSlug: 'pdf-compressor', category: 'PDF' },
        { fingerprint: 'fp-1' },
      ),
      env: { DB: db } as never,
    });
    expect(await res.json()).toEqual({ allowed: false, remaining: 0 });
    expect(
      seen.some(
        (q) =>
          q.sql.includes('INSERT INTO download_event') &&
          String(q.sql).includes('blocked_quota'),
      ),
    ).toBe(true);
  });

  it('increment path: existing row is UPDATED, not inserted', async () => {
    const { db, seen } = mockDb({ usageCount: 2 });
    const res = await dlRecord({
      request: recordReq({}, { fingerprint: 'fp-1' }),
      env: { DB: db } as never,
    });
    // limit 3 - count 2 - 1 => allowed with remaining 0.
    expect(await res.json()).toEqual({ allowed: true, remaining: 0 });
    expect(
      seen.some((q) => q.sql.includes('UPDATE download_usage')),
    ).toBe(true);
  });

  it('pro user: immediate allow with remaining 999 and no usage tracking', async () => {
    const { db, seen } = mockDb();
    const res = await dlRecord({
      request: recordReq({}, { user: 'pro-user' }),
      env: { DB: db } as never,
    });
    expect(await res.json()).toEqual({ allowed: true, remaining: 999 });
    expect(seen.some((q) => q.sql.includes('FROM download_usage'))).toBe(false);
  });

  it('toolSlug present: download_event logged with outcome allowed', async () => {
    const { db, seen } = mockDb();
    await dlRecord({
      request: recordReq(
        { toolSlug: 'pdf-compressor', category: 'PDF' },
        { fingerprint: 'fp-1' },
      ),
      env: { DB: db } as never,
    });
    const evt = seen.find((q) => q.sql.includes('INSERT INTO download_event'));
    expect(evt).toBeDefined();
    expect(String(evt?.sql)).toContain('allowed');
  });

  it('legacy callers with an empty body still record against the anon quota', async () => {
    const { db } = mockDb();
    const res = await dlRecord({
      request: recordReq(null, { fingerprint: 'fp-1', rawBody: true }),
      env: { DB: db } as never,
    });
    expect(await res.json()).toEqual({ allowed: true, remaining: 2 });
  });
});
