import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { onRequestPost as createOrder } from '../../../functions/api/payments/create-order';

function mockDb() {
  const seen: { sql: string; args: unknown[] }[] = [];
  const prepare = vi.fn((sql: string) => ({
    bind: vi.fn((...args: unknown[]) => ({
      first: vi.fn(async () => {
        if (sql.includes('COUNT(*)')) return { c: 0 };
        if (sql.includes('FROM session')) return { userId: 'user-1' };
        if (sql.includes('FROM "user"')) return { email: 'buyer@x.com', name: 'Buyer' };
        return null;
      }),
      run: vi.fn(async () => {
        seen.push({ sql, args });
        return {};
      }),
    })),
  }));
  return { db: { prepare } as unknown as D1Database, seen };
}

const ENV = (db: D1Database) => ({ DB: db, DODO_API_KEY: 'test-key' }) as never;

const BOUNDARY = '----testboundary9999';
const MULTIPART = `multipart/form-data; boundary=${BOUNDARY}`;

function formReq(plan: string, gateway = 'dodo', country = 'US') {
  // Hand-built: jsdom FormData lives in a different realm from undici's
  // parser, so a FormData body leaves Content-Type unset and throws (500).
  const body =
    `--${BOUNDARY}\r\nContent-Disposition: form-data; name="plan"\r\n\r\n${plan}\r\n` +
    `--${BOUNDARY}\r\nContent-Disposition: form-data; name="gateway"\r\n\r\n${gateway}\r\n` +
    `--${BOUNDARY}--\r\n`;
  return new Request('https://toolzum.com/api/payments/create-order', {
    method: 'POST',
    headers: { cookie: 'better-auth.session_token=tok', 'Content-Type': MULTIPART, 'cf-ipcountry': country },
    body,
  });
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    json: async () => ({ session_id: 'cks_test', checkout_url: 'https://checkout.dodo/test' }),
  })));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('POST /api/payments/create-order pricing (spec TC-7)', () => {
  it('charges advertised INR amounts for Indian buyers (never the old ₹1999 pass bug)', async () => {
    const { db, seen } = mockDb();
    const res = await createOrder({ request: formReq('pass', 'dodo', 'IN'), env: ENV(db) });
    expect(res.status).toBe(303);
    const insert = seen.find((q) => q.sql.includes('INSERT INTO payment'));
    // amount 99 INR, not 1999.
    expect(insert?.args).toEqual(
      expect.arrayContaining(['user-1', 'dodo', expect.any(String), 99, 'INR']),
    );
  });

  it('monthly matches advertised ₹299 for India, $9.99 elsewhere', async () => {
    const { db, seen } = mockDb();
    await createOrder({ request: formReq('monthly', 'dodo', 'IN'), env: ENV(db) });
    const insert = seen.find((q) => q.sql.includes('INSERT INTO payment'));
    expect(insert?.args).toEqual(
      expect.arrayContaining(['user-1', 'dodo', expect.any(String), 299, 'INR']),
    );
    const { db: db2, seen: seen2 } = mockDb();
    await createOrder({ request: formReq('monthly', 'dodo', 'US'), env: ENV(db2) });
    const insert2 = seen2.find((q) => q.sql.includes('INSERT INTO payment'));
    expect(insert2?.args).toEqual(
      expect.arrayContaining(['user-1', 'dodo', expect.any(String), 9.99, 'USD']),
    );
  });

  it('dodo gateway 303-redirects to hosted checkout', async () => {
    const { db } = mockDb();
    const res = await createOrder({ request: formReq('monthly', 'dodo', 'US'), env: ENV(db) });
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('https://checkout.dodo/test');
  });

  it('dodo without API key fails loud (503, no checkout redirect)', async () => {
    const { db } = mockDb();
    const res = await createOrder({ request: formReq('monthly', 'dodo', 'US'), env: { DB: db } as never });
    expect(res.status).toBe(503);
    expect(res.headers.get('location')).toBeNull();
  });

  it('rejects unknown plans instead of falling through to pass pricing', async () => {
    const { db } = mockDb();
    const res = await createOrder({ request: formReq('lifetime'), env: ENV(db) });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid_plan' });
  });
});
