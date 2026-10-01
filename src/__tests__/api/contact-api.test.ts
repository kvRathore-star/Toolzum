import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/lib/email', () => ({
  sendEmail: vi.fn(async () => true),
  emailConfigured: vi.fn(() => true),
}));

import { onRequestPost } from '../../../functions/api/contact';
import { sendEmail, emailConfigured } from '../../../src/lib/email';

interface DbOpts {
  rate?: number;
  failInsert?: boolean;
}

function mockDb(opts: DbOpts = {}) {
  const sqls: string[] = [];
  const insertArgs: unknown[][] = [];
  const prepare = vi.fn((sql: string) => {
    sqls.push(sql);
    return {
      bind: vi.fn((...args: unknown[]) => {
        if (sql.includes('INSERT INTO contact_messages')) insertArgs.push(args);
        return {
          first: vi.fn(async () => (sql.includes('FROM analytics_event') ? { c: opts.rate ?? 0 } : null)),
          all: vi.fn(async () => ({ results: [] })),
          run: vi.fn(async () => {
            if (opts.failInsert && sql.includes('INSERT INTO contact_messages')) {
              throw new Error('disk I/O error');
            }
            return {};
          }),
        };
      }),
      first: vi.fn(async () => (sql.includes('COUNT(*)') ? { c: 0 } : null)),
      run: vi.fn(async () => ({})),
    };
  });
  return { db: { prepare } as unknown as D1Database, sqls, insertArgs };
}

const ENV = (db: D1Database, extras: Record<string, string | undefined> = {}) =>
  ({ DB: db, RESEND_API_KEY: 're_x', ...extras }) as never;

function post(body: unknown) {
  return new Request('https://toolzum.com/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const VALID = { name: 'Priya Sharma', email: 'priya@example.com', subject: 'bug', message: 'The PDF merger stalls at 90%.' };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(sendEmail).mockResolvedValue(true);
  vi.mocked(emailConfigured).mockReturnValue(true);
});

describe('POST /api/contact — inbox archive', () => {
  it('archives the message after a successful relay', async () => {
    const { db, sqls, insertArgs } = mockDb();
    const res = await onRequestPost({ request: post(VALID), env: ENV(db) });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(sqls.some((s) => s.includes('INSERT INTO contact_messages'))).toBe(true);

    const args = insertArgs[0]!;
    expect(typeof args[0]).toBe('string'); // id (randomUUID)
    expect(args[1]).toBe('Priya Sharma');
    expect(args[2]).toBe('priya@example.com');
    expect(args[3]).toBe('bug');
    expect(args[4]).toBe('Bug / Vulnerability');
    expect(args[5]).toBe('The PDF merger stalls at 90%.');
    expect(typeof args[6]).toBe('number'); // createdAt unix seconds
    // relay + acknowledgment still both go out
    expect(sendEmail).toHaveBeenCalledTimes(2);
  });

  it('stores unknown subjects under the general category', async () => {
    const { db, insertArgs } = mockDb();
    await onRequestPost({
      request: post({ ...VALID, subject: 'freeform rambling' }),
      env: ENV(db),
    });
    expect(insertArgs[0]![3]).toBe('general');
    expect(insertArgs[0]![4]).toBe('General Support');
  });

  it('does not archive when the relay fails (502 gates)', async () => {
    vi.mocked(sendEmail).mockResolvedValue(false);
    const { db, sqls } = mockDb();
    const res = await onRequestPost({ request: post(VALID), env: ENV(db) });
    expect(res.status).toBe(502);
    expect(sqls.some((s) => s.includes('INSERT INTO contact_messages'))).toBe(false);
    expect(sendEmail).toHaveBeenCalledTimes(1); // relay only, no ack
  });

  it('still succeeds when the archive insert fails — best-effort', async () => {
    const { db } = mockDb({ failInsert: true });
    const res = await onRequestPost({ request: post(VALID), env: ENV(db) });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(sendEmail).toHaveBeenCalledTimes(2);
  });

  it('archives nothing and sends nothing on a honeypot hit', async () => {
    const { db, sqls } = mockDb();
    const res = await onRequestPost({
      request: post({ ...VALID, website: 'spam.example' }),
      env: ENV(db),
    });
    expect(res.status).toBe(200);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(sqls.some((s) => s.includes('INSERT INTO contact_messages'))).toBe(false);
  });

  it('archives nothing when no transport is configured (503)', async () => {
    vi.mocked(emailConfigured).mockReturnValue(false);
    const { db, sqls } = mockDb();
    const res = await onRequestPost({ request: post(VALID), env: ENV(db) });
    expect(res.status).toBe(503);
    expect(sqls.some((s) => s.includes('INSERT INTO contact_messages'))).toBe(false);
  });

  it('rejects invalid params before any DB write', async () => {
    const { db, sqls } = mockDb();
    const res = await onRequestPost({
      request: post({ name: '', email: 'nope', message: '' }),
      env: ENV(db),
    });
    expect(res.status).toBe(400);
    expect(sqls.some((s) => s.includes('INSERT INTO contact_messages'))).toBe(false);
  });
});
