import { describe, it, expect, vi } from 'vitest';
import { onRequestPost as submit, onRequestGet as list } from '../../../functions/api/testimonials';
import { onRequestGet as adminList, onRequestPatch as adminAct } from '../../../functions/api/admin/testimonials';

function mockDb() {
  const seen: { sql: string; args: unknown[] }[] = [];
  const prepare = vi.fn((sql: string) => {
    seen.push({ sql, args: [] });
    const stmt = {
      bind: (...args: unknown[]) => {
        seen.push({ sql, args });
        return stmt;
      },
      first: async () => {
        if (sql.includes('FROM analytics_event')) return { c: 0 };
        if (sql.includes('FROM testimonials')) return null;
        return null;
      },
      run: async () => ({}),
      all: async () => ({ results: [] }),
    };
    return stmt;
  });
  return { db: { prepare } as unknown as D1Database, seen };
}

function postReq(body: unknown) {
  return new Request('https://toolzum.com/api/testimonials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const authed = (token: string) => ({ authorization: `Bearer ${token}` });

describe('POST /api/testimonials (real reviews, pending first)', () => {
  it('accepts a valid review as pending (never auto-published)', async () => {
    const { db, seen } = mockDb();
    const res = await submit({
      request: postReq({ name: 'Priya', text: 'The PDF merger saved my whole afternoon. Fast and private.' }),
      env: { DB: db } as never,
    });
    expect(await res.json()).toEqual({ ok: true, received: true });
    const insert = seen.find((q) => q.sql.includes('INSERT INTO testimonials') && q.args.length > 0);
    expect(insert).toBeDefined();
    expect(insert?.sql).toContain("'pending'");
    expect(insert?.args).toContain('Priya');
  });

  it('rejects short names, short texts, and links', async () => {
    const { db } = mockDb();
    for (const body of [
      { name: 'P', text: 'Great tool, really helped me out today.' },
      { name: 'Priya', text: 'Nice' },
      { name: 'Priya', text: 'See my review at https://spam.example' },
      { name: 'http://spam.example', text: 'Great tool, really helped me out today.' },
    ]) {
      const res = await submit({ request: postReq(body), env: { DB: db } as never });
      expect(res.status).toBe(400);
    }
  });

  it('approved-only listing never leaks pending rows', async () => {
    const { db, seen } = mockDb();
    await list({ request: new Request('https://toolzum.com/api/testimonials'), env: { DB: db } as never });
    const sel = seen.find((q) => q.sql.includes('FROM testimonials WHERE'));
    expect(sel?.sql).toContain("status = 'approved'");
  });
});

describe('admin testimonials moderation', () => {
  it('rejects unauthenticated admin reads', async () => {
    const { db } = mockDb();
    const res = await adminList({
      request: new Request('https://toolzum.com/api/admin/testimonials'),
      env: { DB: db } as never,
    });
    expect(res.status).toBe(401);
  });

  it('Bearer ALERT_TOKEN can approve and reject', async () => {
    const { db } = mockDb();
    const env = { DB: db, ALERT_TOKEN: 'secret-token' } as never;
    for (const status of ['approved', 'rejected']) {
      const res = await adminAct({
        request: new Request('https://toolzum.com/api/admin/testimonials', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authed('secret-token') },
          body: JSON.stringify({ id: 'r1', status }),
        }),
        env,
      });
      // Mock DB has no row: honest 404, never fake success.
      expect(res.status).toBe(404);
    }
    const bad = await adminAct({
      request: new Request('https://toolzum.com/api/admin/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authed('secret-token') },
        body: JSON.stringify({ id: 'r1', status: 'published' }),
      }),
      env,
    });
    expect(bad.status).toBe(400);
  });
});
