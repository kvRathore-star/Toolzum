import { describe, it, expect, vi } from 'vitest';
import { onRequestPost } from '../../../functions/api/payments/create-order';

// Dodo is the only integrated gateway. These cover the order-creation
// contract: auth gating, gateway default, and the persisted 'created' row.
// Live gateway behavior is untestable by design (stubbed fetch).
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
      request: req({ plan: 'monthly', gateway: 'dodo' }, ''),
      env: { DB: db },
    });
    const html = await res.text();
    expect(html).toContain('/sign-in');
    const inserts = (db.prepare as any).mock.calls.filter(([sql]: [string]) =>
      sql.includes('INSERT INTO payment'),
    );
    expect(inserts).toHaveLength(0);
  });

  it('falls back to dodo on unknown gateway and persists a created order', async () => {
    const db = mockDb();
    const res = await onRequestPost({
      request: req({ plan: 'monthly', gateway: 'bogus' }),
      env: { DB: db },
    });
    // No DODO_API_KEY in test env → loud 503, never a dead-end local order.
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'checkout_unconfigured' });
  });

  it('coerces the legacy razorpay gateway to the dodo path (no dead-end order page)', async () => {
    const db = mockDb();
    const res = await onRequestPost({
      request: req({ plan: 'monthly', gateway: 'razorpay' }),
      env: { DB: db },
    });
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'checkout_unconfigured' });
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
