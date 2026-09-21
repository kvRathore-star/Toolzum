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

import {
  onRequestGet as credits,
  FREE_CREDITS,
  PRO_CREDITS,
} from '../../../functions/api/account/credits';

interface UserRow {
  plan: string | null;
  credits: number | null;
  creditResetAt: number | null;
}

function mockDb(opts: { userRow?: UserRow | null; throwOn?: 'select' | 'update' } = {}) {
  const { userRow = null, throwOn } = opts;
  const runs: string[] = [];
  const prepare = vi.fn((sql: string) => ({
    bind: vi.fn(() => ({
      first: vi.fn(async () => {
        if (throwOn === 'select') throw new Error('D1 down');
        if (sql.includes('FROM user')) return userRow;
        return null;
      }),
      run: vi.fn(async () => {
        if (throwOn === 'update') throw new Error('D1 down');
        runs.push(sql);
        return {};
      }),
    })),
  }));
  return { db: { prepare } as unknown as D1Database, runs };
}

function req(user?: string) {
  const headers: Record<string, string> = {};
  if (user) headers['x-test-user'] = user;
  return new Request('https://toolzum.com/api/account/credits', { headers });
}

const FRESH = Date.now();

describe('GET /api/account/credits contract', () => {
  it('anonymous callers get 401', async () => {
    const { db } = mockDb();
    const res = await credits({ request: req(), env: { DB: db } as never });
    expect(res.status).toBe(401);
  });

    it('pro user past the reset window gets refilled to PRO_CREDITS', async () => {
    const { db, runs } = mockDb({
      userRow: { plan: 'pro', credits: 12, creditResetAt: null },
    });
    const res = await credits({ request: req('pro-user'), env: { DB: db } as never });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ credits: PRO_CREDITS, plan: 'pro', allowance: PRO_CREDITS });
    expect(runs.some((sql) => sql.startsWith('UPDATE user SET'))).toBe(true);
  });

  it('free user inside the window keeps the stored balance with no write', async () => {
    const { db, runs } = mockDb({
      userRow: { plan: 'free', credits: 17, creditResetAt: FRESH },
    });
    const res = await credits({ request: req('free-user'), env: { DB: db } as never });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ credits: 17, plan: 'signedin', allowance: FREE_CREDITS });
    expect(runs).toEqual([]);
  });

  it('free user past the window does NOT refill (one-time trial spent)', async () => {
    const { db, runs } = mockDb({
      userRow: { plan: 'free', credits: 2, creditResetAt: FRESH - 31 * 86400000 },
    });
    const res = await credits({ request: req('free-user'), env: { DB: db } as never });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ credits: 2, plan: 'signedin', allowance: FREE_CREDITS });
    expect(runs).toEqual([]);
  });

  it('free user with no reset stamp gets the one-time 5-credit trial', async () => {
    const { db, runs } = mockDb({
      userRow: { plan: 'free', credits: 30, creditResetAt: null },
    });
    const res = await credits({ request: req('free-user'), env: { DB: db } as never });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ credits: 5, plan: 'signedin', allowance: FREE_CREDITS });
    expect(runs.some((sql) => sql.startsWith('UPDATE user SET'))).toBe(true);
  });

  it('missing user row is 401, DB failure is 503', async () => {
    const missing = mockDb({ userRow: null });
    const res404 = await credits({ request: req('ghost'), env: { DB: missing.db } as never });
    expect(res404.status).toBe(401);

    const broken = mockDb({ throwOn: 'select' });
    const res503 = await credits({ request: req('u'), env: { DB: broken.db } as never });
    expect(res503.status).toBe(503);
  });
});
