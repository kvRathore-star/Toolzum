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
  onRequestGet as tourGet,
  onRequestPost as tourPost,
} from '../../../functions/api/account/tour';

function mockDb(opts: { seenAt?: number | null } = {}) {
  const { seenAt = null } = opts;
  const seen: string[] = [];
  const prepare = vi.fn((sql: string) => ({
    bind: vi.fn(() => ({
      first: vi.fn(async () => {
        if (sql.includes('FROM user_flags')) return seenAt ? { tourSeenAt: seenAt } : null;
        return null;
      }),
      run: vi.fn(async () => {
        seen.push(sql);
        return {};
      }),
    })),
    first: vi.fn(async () => ({ '1': 1 })),
    run: vi.fn(async () => {
      seen.push(sql);
      return {};
    }),
  }));
  return { db: { prepare } as unknown as D1Database, seen };
}

function req(user?: string, body?: unknown) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (user) headers['x-test-user'] = user;
  return new Request('https://toolzum.com/api/account/tour', {
    method: body ? 'POST' : 'GET',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

const ENV = (db: D1Database) =>
  ({
    DB: db,
    GOOGLE_CLIENT_ID: 'x',
    GOOGLE_CLIENT_SECRET: 'x',
    BETTER_AUTH_SECRET: 'x',
    BETTER_AUTH_URL: 'https://toolzum.com',
    TURNSTILE_SECRET_KEY: 'x',
  }) as never;

describe('GET/POST /api/account/tour contract', () => {
  it('401s without a session', async () => {
    const { db } = mockDb();
    expect((await tourGet({ request: req(), env: ENV(db) })).status).toBe(401);
    expect((await tourPost({ request: req(undefined, { seen: true }), env: ENV(db) })).status).toBe(401);
  });

  it('returns unseen for fresh users, seen after POST', async () => {
    const fresh = mockDb();
    const getRes = await tourGet({ request: req('u1'), env: ENV(fresh.db) });
    expect(await getRes.json()).toEqual({ seen: false });

    const { db, seen } = mockDb();
    const postRes = await tourPost({ request: req('u1', { seen: true }), env: ENV(db) });
    expect(await postRes.json()).toEqual({ seen: true });
    expect(seen.some((sql) => sql.includes('INSERT INTO user_flags'))).toBe(true);

    const marked = mockDb({ seenAt: Date.now() });
    const getRes2 = await tourGet({ request: req('u1'), env: ENV(marked.db) });
    expect(await getRes2.json()).toEqual({ seen: true });
  });
});
