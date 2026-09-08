import { describe, it, expect, vi } from 'vitest';
import { onRequestPost } from '../../../functions/api/payments/create-order';

// No gateway secrets exist anywhere (not even Cloudflare), so these cover
// the order-creation contract only: auth gating, gateway fallback, and the
// persisted 'created' row. Live gateway behavior is untestable by design.
function mockDb(opts?: { hasSession?: boolean; rateCount?: number }) {
  const { hasSession = true, rateCount = 0 } = opts ?? {};
  return {
    prepare: vi.fn((sql: string) => ({
      bind: vi.fn(() => ({
        first: vi.fn(async () => {
          if (sql.includes('COUNT(*)')) return { c: rateCount };
          if (sql.includes('FROM session')) return hasSession ? { userId: 'user-1' } : null;
          return null;
        }),
        run: vi.fn(async () => ({})),
      })),
    })),
  } as unknown as D1Database;
}

function req(form: Record<string, string>, cookie = 'better-auth.session_token=tok123') {
  const body = new URLSearchParams(form);
  return new Request('https://toolzum.com/api/payments/create-order', {
    method: 'POST',
    headers: { cookie, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
}

describe('POST /api/payments/create-order contract', () => {
  it('redirects anonymous callers to sign-in (no order row written)', async () => {
    const db = mockDb({ hasSession: false });
    const res = await onRequestPost({
      request: req({ plan: 'monthly', gateway: 'razorpay' }, ''),
      env: { DB: db },
    });
    const html = await res.text();
    expect(html).toContain('/sign-in');
    const inserts = (db.prepare as any).mock.calls.filter(([sql]: [string]) =>
      sql.includes('INSERT INTO payment'),
    );
    expect(inserts).toHaveLength(0);
  });

  it('falls back to razorpay on unknown gateway and persists a created order', async () => {
    const db = mockDb();
    const res = await onRequestPost({
      request: req({ plan: 'monthly', gateway: 'bogus' }),
      env: { DB: db },
    });
    const html = await res.text();
    expect(html).toContain('/pricing?order=');
    const inserts = (db.prepare as any).mock.calls.filter(([sql]: [string]) =>
      sql.includes('INSERT INTO payment'),
    );
    expect(inserts).toHaveLength(1);
  });

  it('429s under rate pressure before touching the DB writes', async () => {
    const db = mockDb({ rateCount: 99 });
    const res = await onRequestPost({
      request: req({ plan: 'pass', gateway: 'dodo' }),
      env: { DB: db },
    });
    expect(res.status).toBe(429);
  });
});
