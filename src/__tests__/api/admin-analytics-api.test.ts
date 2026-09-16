import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../src/lib/admin-auth', () => ({
  requireAdmin: vi.fn(async () => ({ user: { id: 'admin-1', email: 'a@x.com' } })),
  json: (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
}));

import { onRequestGet as analytics } from '../../../functions/api/admin/analytics';

function mockDb() {
  const prepare = vi.fn((sql: string) => ({
    bind: vi.fn(() => ({
      all: vi.fn(async () => {
        if (sql.includes('FROM download_event') && sql.includes('toolSlug')) {
          return { results: [{ toolSlug: 't', category: 'c', count: 2 }] };
        }
        if (sql.includes('search:miss')) {
          return { results: [{ query: 'backgroud', misses: 3 }] };
        }
        if (sql.includes('FROM user_tool_usage')) {
          return { results: [] };
        }
        if (sql.includes('FROM error_log')) {
          return { results: [] };
        }
        if (sql.includes('FROM user') || sql.includes('FROM analytics_event')) {
          return { results: [] };
        }
        if (sql.includes('COUNT(*)')) {
          return { results: [] };
        }
        return { results: [] };
      }),
      first: vi.fn(async () => {
        if (sql.includes('COUNT(*)')) return { count: 0 };
        return null;
      }),
      run: vi.fn(async () => ({})),
    })),
  }));
  return { db: { prepare } as unknown as D1Database };
}

const ENV = (db: D1Database) =>
  ({
    DB: db,
    GOOGLE_CLIENT_ID: 'x',
    GOOGLE_CLIENT_SECRET: 'x',
    BETTER_AUTH_SECRET: 'x',
    BETTER_AUTH_URL: 'https://toolzum.com',
    TURNSTILE_SECRET_KEY: 'x',
    ADMIN_EMAILS: 'a@x.com',
  }) as never;

describe('GET /api/admin/analytics funnels (#34)', () => {
  function funnelDb() {
    const prepare = vi.fn((sql: string) => ({
      bind: vi.fn(() => ({
        all: vi.fn(async () => {
          if (sql.includes('as signups')) {
            return { results: [{ signups: 100, activated: 60, activated7d: 45, avgSecsToFirst: 7200 }] };
          }
          if (sql.includes('as blockedUsers')) {
            return { results: [{ blockedUsers: 20, convertedPro: 5 }] };
          }
          if (sql.includes('anonBlocks')) {
            return { results: [{ anonBlocks: 300, anonDevices: 150 }] };
          }
          if (sql.includes('as walledUsers')) {
            return { results: [{ walledUsers: 10, convertedPro: 4 }] };
          }
          return { results: [] };
        }),
        first: vi.fn(async () => {
          if (sql.includes('COUNT(*)')) return { count: 0 };
          return null;
        }),
        run: vi.fn(async () => ({})),
      })),
    }));
    return { db: { prepare } as unknown as D1Database };
  }

  it('returns all three conversion funnels with wall→pro attribution', async () => {
    const { db } = funnelDb();
    const res = await analytics({
      request: new Request('https://toolzum.com/api/admin/analytics'),
      env: ENV(db),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.funnels).toEqual({
      signupToFirstTool: { signups: 100, activated: 60, activated7d: 45, avgSecsToFirst: 7200 },
      quotaWallToPro: { blockedUsers: 20, convertedPro: 5, anonBlocks: 300, anonDevices: 150 },
      creditWallToPro: { walledUsers: 10, convertedPro: 4 },
    });
  });

  it('defaults funnels on empty tables (lazy ai_credit_event)', async () => {
    const { db } = mockDb();
    const res = await analytics({
      request: new Request('https://toolzum.com/api/admin/analytics'),
      env: ENV(db),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body.funnels).toEqual({
      signupToFirstTool: { signups: 0, activated: 0, activated7d: 0, avgSecsToFirst: null },
      quotaWallToPro: { blockedUsers: 0, convertedPro: 0, anonBlocks: 0, anonDevices: 0 },
      creditWallToPro: { walledUsers: 0, convertedPro: 0 },
    });
  });

  it('coerces NULL sums to 0 (SQLite SUM over zero rows)', async () => {
    const prepare = vi.fn(() => ({
      bind: vi.fn(() => ({
        all: vi.fn(async () => [
          { signups: 0, activated: null, activated7d: null, avgSecsToFirst: null },
        ]),
        first: vi.fn(async () => ({ count: 0 })),
        run: vi.fn(async () => ({})),
      })),
    }));
    const db = { prepare } as unknown as D1Database;
    const res = await analytics({
      request: new Request('https://toolzum.com/api/admin/analytics'),
      env: ENV(db),
    });
    const body = (await res.json()) as {
      funnels: { signupToFirstTool: Record<string, unknown> };
    };
    expect(body.funnels.signupToFirstTool).toEqual({
      signups: 0,
      activated: 0,
      activated7d: 0,
      avgSecsToFirst: null,
    });
  });
});

describe('GET /api/admin/analytics contract', () => {
  it('returns missedSearches aligned with the blocked/top queries (no slot shift)', async () => {
    const { db } = mockDb();
    const res = await analytics({
      request: new Request('https://toolzum.com/api/admin/analytics'),
      env: ENV(db),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    // Blocked-tool rows keep their shape (would carry miss rows on misalignment).
    expect(body.blockedDownloads).toEqual([{ toolSlug: 't', category: 'c', count: 2 }]);
    expect(body.missedSearches).toEqual([{ query: 'backgroud', misses: 3 }]);
    expect(body.topDownloadedTools).toEqual([{ toolSlug: 't', category: 'c', count: 2 }]);
  });
});
