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
  onRequestGet as checkPlan,
  PLAN_LIMITS,
} from '../../../functions/api/check-plan';
import { CATEGORY_CAPS } from '@/lib/planTiers';

function mockDb(
  opts: { userRow?: { plan: string } | null; rateCount?: number } = {},
) {
  const { userRow = null, rateCount = 0 } = opts;
  const prepare = vi.fn((sql: string) => ({
    bind: vi.fn(() => ({
      first: vi.fn(async () => {
        if (sql.includes('FROM analytics_event')) return { c: rateCount };
        if (sql.includes('SELECT plan FROM user')) return userRow;
        return null;
      }),
      run: vi.fn(async () => ({})),
    })),
  }));
  return { prepare } as unknown as D1Database;
}

function req(user?: string) {
  const headers: Record<string, string> = {};
  if (user) headers['x-test-user'] = user;
  return new Request('https://toolzum.com/api/check-plan', { headers });
}

describe('GET /api/check-plan contract', () => {
  it('anonymous callers get the free caps under the canonical anon label', async () => {
    const res = await checkPlan({
      request: req(),
      env: { DB: mockDb() } as never,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ plan: 'anon', ...PLAN_LIMITS.free, categoryCaps: CATEGORY_CAPS });
    expect(body).toMatchObject({
      maxFileSizeMB: 30,
      maxBatchSize: 5,
      threads: 1,
    });
  });

  it('signed-in users without a stored plan get the signedin caps', async () => {
    const res = await checkPlan({
      request: req('new-user'),
      env: { DB: mockDb({ userRow: null }) } as never,
    });
    const body = await res.json();
    expect(body).toEqual({
      plan: 'signedin',
      ...PLAN_LIMITS.signedin,
      categoryCaps: CATEGORY_CAPS,
    });
    expect(body).toMatchObject({
      maxFileSizeMB: 150,
      maxBatchSize: 25,
      threads: 1,
    });
  });

  it('signed-in users with a free row get the signedin caps (DB default is free for every account)', async () => {
    const res = await checkPlan({
      request: req('free-user'),
      env: { DB: mockDb({ userRow: { plan: 'free' } }) } as never,
    });
    expect(await res.json()).toEqual({
      plan: 'signedin',
      ...PLAN_LIMITS.signedin,
      categoryCaps: CATEGORY_CAPS,
    });
  });

  it('pro users get the pro caps (2000MB / 500 batch / 6 threads)', async () => {
    const res = await checkPlan({
      request: req('pro-user'),
      env: { DB: mockDb({ userRow: { plan: 'pro' } }) } as never,
    });
    const body = await res.json();
    expect(body).toEqual({ plan: 'pro', ...PLAN_LIMITS.pro, categoryCaps: CATEGORY_CAPS });
    expect(body).toMatchObject({
      maxFileSizeMB: 2000,
      maxBatchSize: 500,
      threads: 6,
    });
  });

  it('unknown stored plans fail closed to signedin caps (never pro)', async () => {
    const res = await checkPlan({
      request: req('weird-user'),
      env: { DB: mockDb({ userRow: { plan: 'enterprise' } }) } as never,
    });
    expect(await res.json()).toEqual({
      plan: 'signedin',
      ...PLAN_LIMITS.signedin,
      categoryCaps: CATEGORY_CAPS,
    });
  });
});
