import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../src/lib/admin-auth', () => ({
  requireAdmin: vi.fn(async () => ({ user: { id: 'admin-1', email: 'a@x.com' } })),
  json: (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
}));

import { onRequestGet as flagsGet } from '../../../functions/api/flags';
import {
  onRequestGet as adminGet,
  onRequestPost as adminPost,
} from '../../../functions/api/admin/flags';

function mockDb(flagRows: { key: string; enabled: number }[] = []) {
  const prepare = vi.fn((sql: string) => ({
    bind: vi.fn(() => ({
      first: vi.fn(async () => {
        if (sql.includes('FROM session')) return { userId: 'u1', plan: 'free' };
        return null;
      }),
      all: vi.fn(async () => ({ results: flagRows })),
      run: vi.fn(async () => ({})),
    })),
    first: vi.fn(async () => null),
    all: vi.fn(async () => ({ results: flagRows })),
    run: vi.fn(async () => ({})),
  }));
  return { db: { prepare } as unknown as D1Database, prepare };
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

describe('flag endpoints (#41/49)', () => {
  it('GET /api/flags returns the stored map (public, no auth)', async () => {
    const { db } = mockDb([{ key: 'ai_generation', enabled: 1 }]);
    const res = await flagsGet({
      request: new Request('https://toolzum.com/api/flags'),
      env: ENV(db),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ flags: { ai_generation: true } });
  });

  it('GET /api/admin/flags requires admin and lists flags', async () => {
    const { db } = mockDb([{ key: 'ai_generation', enabled: 0 }]);
    const res = await adminGet({
      request: new Request('https://toolzum.com/api/admin/flags'),
      env: ENV(db),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ flags: { ai_generation: false } });
  });

  it('POST /api/admin/flags flips a flag and auditions the change', async () => {
    const { db, prepare } = mockDb([]);
    const res = await adminPost({
      request: new Request('https://toolzum.com/api/admin/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'ai_generation', enabled: false }),
      }),
      env: ENV(db),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, key: 'ai_generation', enabled: false });
    const sqls = prepare.mock.calls.map((c) => c[0] as string);
    expect(sqls.some((s) => s.includes('admin_audit_log'))).toBe(true);
  });

  it('POST rejects non-boolean enabled', async () => {
    const { db } = mockDb([]);
    const res = await adminPost({
      request: new Request('https://toolzum.com/api/admin/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'ai_generation', enabled: 'nope' }),
      }),
      env: ENV(db),
    });
    expect(res.status).toBe(400);
  });
});
