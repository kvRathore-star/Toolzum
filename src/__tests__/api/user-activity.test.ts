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

import { onRequestGet as activity } from '../../../functions/api/user/activity';
import { onRequestPost as logUsage } from '../../../functions/api/user/log-usage';

const RECENT = [
  {
    toolSlug: 'pdf-compressor',
    toolName: 'PDF Compressor',
    category: 'PDF',
    usedAt: 1700000000,
  },
];
const TOP = [
  {
    toolSlug: 'pdf-compressor',
    toolName: 'PDF Compressor',
    category: 'PDF',
    uses: 9,
  },
];
const DAILY = [{ day: 19600, count: 3 }];
const CATS = [{ category: 'PDF', uses: 12 }];

function activityDb() {
  const prepare = vi.fn((sql: string) => ({
    bind: vi.fn(() => ({
      first: vi.fn(async () => {
        if (sql.includes('FROM analytics_event')) return { c: 0 };
        if (sql.includes('COUNT(DISTINCT')) return { count: 4 };
        if (sql.includes('COUNT(*)')) return { count: 25 };
        return null;
      }),
      run: vi.fn(async () => ({})),
      all: vi.fn(async () => {
        if (sql.includes('ORDER BY usedAt DESC LIMIT 10')) return { results: RECENT };
        if (sql.includes('GROUP BY toolSlug')) return { results: TOP };
        if (sql.includes('GROUP BY day')) return { results: DAILY };
        if (sql.includes('GROUP BY category')) return { results: CATS };
        return { results: [] };
      }),
    })),
  }));
  return { prepare } as unknown as D1Database;
}

interface SeenQuery {
  sql: string;
  args: unknown[];
}

function logUsageDb() {
  const seen: SeenQuery[] = [];
  const prepare = vi.fn((sql: string) => ({
    bind: (...args: unknown[]) => {
      seen.push({ sql, args });
      return { run: async () => ({}) };
    },
  }));
  return { db: { prepare } as unknown as D1Database, seen };
}

function getReq(user?: string) {
  const headers: Record<string, string> = {};
  if (user) headers['x-test-user'] = user;
  return new Request('https://toolzum.com/api/user/activity', { headers });
}

function postReq(body: unknown, user?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (user) headers['x-test-user'] = user;
  return new Request('https://toolzum.com/api/user/log-usage', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

describe('GET /api/user/activity contract', () => {
  it('401s without a session', async () => {
    const res = await activity({ request: getReq(), env: { DB: activityDb() } });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('returns the dashboard shape with session-backed rows', async () => {
    const res = await activity({
      request: getReq('user-1'),
      env: { DB: activityDb() },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      monthlyToolsUsed: 4,
      totalToolsUsed: 25,
      recentActivity: RECENT,
      topTools: TOP,
      dailyUsage: DAILY,
      categoryBreakdown: CATS,
    });
  });
});

describe('POST /api/user/log-usage contract', () => {
  it('401s without a session', async () => {
    const { db } = logUsageDb();
    const res = await logUsage({
      request: postReq({ toolSlug: 'pdf-compressor', toolName: 'PDF Compressor' }),
      env: { DB: db },
    });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('400s without toolSlug/toolName', async () => {
    const { db } = logUsageDb();
    for (const body of [
      {},
      { toolSlug: 'pdf-compressor' },
      { toolName: 'PDF Compressor' },
      { toolSlug: '   ', toolName: 'PDF Compressor' },
    ]) {
      const res = await logUsage({
        request: postReq(body, 'user-1'),
        env: { DB: db },
      });
      expect(res.status).toBe(400);
    }
  });

  it('returns ok:true and stores the trimmed row with a valid body', async () => {
    const { db, seen } = logUsageDb();
    const res = await logUsage({
      request: postReq(
        { toolSlug: 'pdf-compressor', toolName: 'PDF Compressor', category: 'Finance' },
        'user-1',
      ),
      env: { DB: db },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    const insert = seen.find((q) => q.sql.includes('INSERT INTO user_tool_usage'));
    expect(insert).toBeDefined();
    // bind order: id, userId, toolSlug, toolName, category, usedAt
    expect(insert?.args[1]).toBe('user-1');
    expect(insert?.args[2]).toBe('pdf-compressor');
    expect(insert?.args[3]).toBe('PDF Compressor');
    expect(insert?.args[4]).toBe('Finance');
  });

  it('accepts stale/unknown category strings verbatim (no allowlist)', async () => {
    const { db, seen } = logUsageDb();
    for (const category of ['Financial', 'SomeMadeUpCategory']) {
      seen.length = 0;
      const res = await logUsage({
        request: postReq(
          { toolSlug: 'pdf-compressor', toolName: 'PDF Compressor', category },
          'user-1',
        ),
        env: { DB: db },
      });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
      const insert = seen.find((q) => q.sql.includes('INSERT INTO user_tool_usage'));
      expect(insert?.args[4]).toBe(category);
    }
  });

  it('degrades missing or overlong categories to null but still logs', async () => {
    const { db, seen } = logUsageDb();
    for (const category of [undefined, 'x'.repeat(41)]) {
      seen.length = 0;
      const res = await logUsage({
        request: postReq(
          { toolSlug: 'pdf-compressor', toolName: 'PDF Compressor', category },
          'user-1',
        ),
        env: { DB: db },
      });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
      const insert = seen.find((q) => q.sql.includes('INSERT INTO user_tool_usage'));
      expect(insert?.args[4]).toBeNull();
    }
  });
});
