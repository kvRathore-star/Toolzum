import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/lib/admin-auth', () => ({
  requireAdmin: vi.fn(async () => ({ user: { id: 'admin-1', email: 'a@x.com' } })),
  json: (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
}));

import { onRequestGet as list, onRequestPatch as patch } from '../../../functions/api/admin/messages';
import { requireAdmin } from '../../../src/lib/admin-auth';

interface DbOpts {
  results?: unknown[];
  unread?: number;
  row?: { id: string } | null;
  rate?: number;
  failList?: boolean;
}

function mockDb(opts: DbOpts = {}) {
  const sqls: string[] = [];
  const binds: unknown[][] = [];
  const prepare = vi.fn((sql: string) => {
    sqls.push(sql);
    const record = (...args: unknown[]) => {
      binds.push(args);
      return {
        first: vi.fn(async () => {
          if (sql.includes('FROM analytics_event')) return { c: opts.rate ?? 0 };
          if (sql.includes('SELECT id FROM contact_messages')) return opts.row ?? null;
          return null;
        }),
        all: vi.fn(async () => {
          if (opts.failList) throw new Error('no such table: contact_messages');
          return { results: opts.results ?? [] };
        }),
        run: vi.fn(async () => ({ meta: { changes: 1 } })),
      };
    };
    return {
      bind: vi.fn(record),
      first: vi.fn(async () => {
        if (sql.includes('COUNT(*)')) return { n: opts.unread ?? 0 };
        return null;
      }),
      run: vi.fn(async () => ({})),
    };
  });
  return { db: { prepare } as unknown as D1Database, sqls, binds };
}

const ENV = (db: D1Database, extras: Record<string, string | undefined> = {}) =>
  ({
    DB: db,
    GOOGLE_CLIENT_ID: 'x',
    GOOGLE_CLIENT_SECRET: 'x',
    BETTER_AUTH_SECRET: 'x',
    BETTER_AUTH_URL: 'https://toolzum.com',
    TURNSTILE_SECRET_KEY: 'x',
    ADMIN_EMAILS: 'a@x.com',
    ...extras,
  }) as never;

const MESSAGE = {
  id: 'msg-1',
  name: 'Priya',
  email: 'priya@example.com',
  category: 'bug',
  label: 'Bug / Vulnerability',
  message: 'The PDF merger stalls at 90%.',
  status: 'new',
  createdAt: 1759300000,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(requireAdmin).mockResolvedValue({ user: { id: 'admin-1', email: 'a@x.com' } } as never);
});

describe('GET /api/admin/messages', () => {
  it('returns messages plus the unread count', async () => {
    const { db } = mockDb({ results: [MESSAGE], unread: 3 });
    const res = await list({
      request: new Request('https://toolzum.com/api/admin/messages'),
      env: ENV(db),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, messages: [MESSAGE], unread: 3 });
  });

  it('filters by ?status= with a bound parameter', async () => {
    const { db, sqls, binds } = mockDb({ results: [], unread: 0 });
    const res = await list({
      request: new Request('https://toolzum.com/api/admin/messages?status=archived'),
      env: ENV(db),
    });
    expect(res.status).toBe(200);
    expect(sqls.some((s) => s.includes('WHERE status = ?'))).toBe(true);
    expect(binds.some((b) => b[0] === 'archived' && b[1] === 200)).toBe(true);
  });

  it('lists everything for an unknown or absent status', async () => {
    const { db, sqls } = mockDb();
    await list({ request: new Request('https://toolzum.com/api/admin/messages'), env: ENV(db) });
    await list({
      request: new Request('https://toolzum.com/api/admin/messages?status=bogus'),
      env: ENV(db),
    });
    const listQueries = sqls.filter((s) => s.includes('ORDER BY createdAt DESC'));
    expect(listQueries).toHaveLength(2);
    expect(listQueries.every((s) => !s.includes('WHERE status = ?'))).toBe(true);
  });

  it('answers with an empty inbox when the table does not exist yet', async () => {
    const { db } = mockDb({ failList: true });
    const res = await list({
      request: new Request('https://toolzum.com/api/admin/messages'),
      env: ENV(db),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, messages: [], unread: 0 });
  });

  it('requires admin — falls back to Bearer ALERT_TOKEN', async () => {
    const { db } = mockDb();
    vi.mocked(requireAdmin).mockResolvedValue({ error: new Response('no', { status: 401 }) } as never);
    const denied = await list({
      request: new Request('https://toolzum.com/api/admin/messages'),
      env: ENV(db),
    });
    expect(denied.status).toBe(401);

    const allowed = await list({
      request: new Request('https://toolzum.com/api/admin/messages', {
        headers: { authorization: 'Bearer secret-token' },
      }),
      env: ENV(db, { ALERT_TOKEN: 'secret-token' }),
    });
    expect(allowed.status).toBe(200);
  });
});

describe('PATCH /api/admin/messages', () => {
  const body = (payload: unknown) =>
    new Request('https://toolzum.com/api/admin/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: typeof payload === 'string' ? payload : JSON.stringify(payload),
    });

  it('updates a known message to a valid status', async () => {
    const { db, sqls, binds } = mockDb({ row: { id: 'msg-1' } });
    const res = await patch({ request: body({ id: 'msg-1', status: 'archived' }), env: ENV(db) });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, id: 'msg-1', status: 'archived' });
    expect(sqls.some((s) => s.includes("UPDATE contact_messages SET status"))).toBe(true);
    expect(binds.some((b) => b[0] === 'archived' && b[1] === 'msg-1')).toBe(true);
  });

  it('rejects an unknown id with 404 — never a fake success', async () => {
    const { db } = mockDb({ row: null });
    const res = await patch({ request: body({ id: 'missing', status: 'new' }), env: ENV(db) });
    expect(res.status).toBe(404);
  });

  it('rejects a missing id or a bad status with 400 before touching the DB', async () => {
    const { db, sqls } = mockDb();
    for (const payload of [{ id: '', status: 'new' }, { id: 'msg-1', status: 'deleted' }, { id: 'msg-1' }]) {
      const res = await patch({ request: body(payload), env: ENV(db) });
      expect(res.status).toBe(400);
    }
    expect(sqls).toEqual([]);
  });

  it('rate limits after 30 triage actions a minute', async () => {
    const { db, sqls } = mockDb({ rate: 30, row: { id: 'msg-1' } });
    const res = await patch({ request: body({ id: 'msg-1', status: 'new' }), env: ENV(db) });
    expect(res.status).toBe(429);
    expect(sqls.some((s) => s.includes('UPDATE contact_messages'))).toBe(false);
  });

  it('requires admin', async () => {
    const { db } = mockDb();
    vi.mocked(requireAdmin).mockResolvedValue({ error: new Response('no', { status: 401 }) } as never);
    const res = await patch({ request: body({ id: 'msg-1', status: 'new' }), env: ENV(db) });
    expect(res.status).toBe(401);
  });

  it('rejects malformed JSON', async () => {
    const { db } = mockDb();
    const res = await patch({ request: body('nope{'), env: ENV(db) });
    expect(res.status).toBe(400);
  });
});
