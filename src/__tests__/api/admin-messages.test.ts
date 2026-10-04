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
  /** Row returned by the thread-mode contact lookup (WHERE id = ?). */
  msgRow?: Record<string, unknown> | null;
  /** Rows for the contact_thread_messages query. */
  threadRows?: Record<string, unknown>[];
  /** Simulate the thread table not existing yet. */
  failThread?: boolean;
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
          if (sql.includes('FROM contact_messages WHERE id = ?')) return opts.msgRow ?? null;
          return null;
        }),
        all: vi.fn(async () => {
          if (sql.includes('contact_thread_messages')) {
            if (opts.failThread) throw new Error('no such table: contact_thread_messages');
            return { results: opts.threadRows ?? [] };
          }
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

describe('GET /api/admin/messages — thread mode (?id=)', () => {
  const MSG = { ...MESSAGE };
  const IN_ROW = {
    id: 'th-1',
    direction: 'in',
    sender: 'priya@example.com',
    body: 'The PDF merger stalls at 90%.',
    attachments: JSON.stringify([
      { key: 'c/tt-1/0', name: 'shot.png', mime: 'image/png', size: 1234 },
    ]),
    createdAt: 1759300100,
  };
  const OUT_ROW = {
    id: 'th-2',
    direction: 'out',
    sender: 'contact@toolzum.com',
    body: 'Trying a fix now.',
    attachments: '[]',
    createdAt: 1759300200,
  };

  it('returns the contact row plus thread with signed attachment URLs', async () => {
    const { db, sqls } = mockDb({ msgRow: MSG, threadRows: [IN_ROW, OUT_ROW] });
    const res = await list({
      request: new Request('https://toolzum.com/api/admin/messages?id=msg-1'),
      env: ENV(db, { ATTACH_SECRET: 'test-secret', MAIL_BRIDGE_URL: 'https://bridge.example' }),
    });
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      ok: boolean;
      message: { id: string };
      thread: { id: string; direction: string; attachments: { url: string | null }[] }[];
    };
    expect(data.ok).toBe(true);
    expect(data.message.id).toBe('msg-1');
    expect(data.thread).toHaveLength(2);
    expect(data.thread[0]!.direction).toBe('in');
    expect(data.thread[1]!.direction).toBe('out');
    expect(data.thread[0]!.attachments[0]!.url).toMatch(
      /^https:\/\/bridge\.example\/att\/c%2Ftt-1%2F0\?t=[0-9a-f]{64}$/
    );
    expect(data.thread[1]!.attachments).toEqual([]);
    // Thread query must keep chronological insertion order (rowid tiebreak).
    expect(sqls.some((s) => s.includes('ORDER BY createdAt ASC, rowid ASC'))).toBe(true);
  });

  it('signs with the default bridge URL when MAIL_BRIDGE_URL is unset', async () => {
    const { db } = mockDb({ msgRow: MSG, threadRows: [IN_ROW] });
    const res = await list({
      request: new Request('https://toolzum.com/api/admin/messages?id=msg-1'),
      env: ENV(db, { ATTACH_SECRET: 'test-secret' }),
    });
    const data = (await res.json()) as { thread: { attachments: { url: string | null }[] }[] };
    expect(data.thread[0]!.attachments[0]!.url).toMatch(
      /^https:\/\/toolzum-mail-bridge\.[a-z0-9]+\.workers\.dev\/att\// 
    );
  });

  it('returns url: null for attachments when ATTACH_SECRET is missing', async () => {
    const { db } = mockDb({ msgRow: MSG, threadRows: [IN_ROW] });
    const res = await list({
      request: new Request('https://toolzum.com/api/admin/messages?id=msg-1'),
      env: ENV(db),
    });
    const data = (await res.json()) as { thread: { attachments: { url: string | null }[] }[] };
    expect(data.thread[0]!.attachments[0]!.url).toBeNull();
  });

  it('404s for an unknown id', async () => {
    const { db } = mockDb({ msgRow: null });
    const res = await list({
      request: new Request('https://toolzum.com/api/admin/messages?id=nope'),
      env: ENV(db),
    });
    expect(res.status).toBe(404);
  });

  it('degrades to an empty thread when the thread table does not exist yet', async () => {
    const { db } = mockDb({ msgRow: MSG, failThread: true });
    const res = await list({
      request: new Request('https://toolzum.com/api/admin/messages?id=msg-1'),
      env: ENV(db),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, message: MSG, thread: [] });
  });

  it('requires admin', async () => {
    const { db } = mockDb({ msgRow: MSG });
    vi.mocked(requireAdmin).mockResolvedValue({ error: new Response('no', { status: 401 }) } as never);
    const res = await list({
      request: new Request('https://toolzum.com/api/admin/messages?id=msg-1'),
      env: ENV(db),
    });
    expect(res.status).toBe(401);
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
