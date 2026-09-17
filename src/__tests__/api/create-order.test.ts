import { describe, it, expect, vi } from 'vitest';
import { onRequestPost as createOrder } from '../../../functions/api/payments/create-order';

function mockDb() {
  const seen: { sql: string; args: unknown[] }[] = [];
  const prepare = vi.fn((sql: string) => ({
    bind: vi.fn((...args: unknown[]) => ({
      first: vi.fn(async () => {
        if (sql.includes('COUNT(*)')) return { c: 0 };
        if (sql.includes('FROM session')) return { userId: 'user-1' };
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

const ENV = (db: D1Database) => ({ DB: db }) as never;

const BOUNDARY = '----testboundary9999';
const MULTIPART = `multipart/form-data; boundary=${BOUNDARY}`;

function formReq(plan: string, gateway = 'razorpay') {
  // Hand-built: jsdom FormData lives in a different realm from undici's
  // parser, so a FormData body leaves Content-Type unset and throws (500).
  const body =
    `--${BOUNDARY}\r\nContent-Disposition: form-data; name="plan"\r\n\r\n${plan}\r\n` +
    `--${BOUNDARY}\r\nContent-Disposition: form-data; name="gateway"\r\n\r\n${gateway}\r\n` +
    `--${BOUNDARY}--\r\n`;
  return new Request('https://toolzum.com/api/payments/create-order', {
    method: 'POST',
    headers: { cookie: 'better-auth.session_token=tok', 'Content-Type': MULTIPART },
    body,
  });
}

describe('POST /api/payments/create-order pricing (spec TC-7)', () => {
  it('charges advertised INR amounts (never the old ₹1999 pass bug)', async () => {
    const { db, seen } = mockDb();
    const res = await createOrder({ request: formReq('pass'), env: ENV(db) });
    expect(res.status).not.toBe(400);
    const insert = seen.find((q) => q.sql.includes('INSERT INTO payment'));
    // amount 99 INR, not 1999.
    expect(insert?.args).toEqual(
      expect.arrayContaining(['user-1', 'razorpay', expect.any(String), 99, 'INR']),
    );
  });

  it('monthly matches advertised ₹299', async () => {
    const { db, seen } = mockDb();
    await createOrder({ request: formReq('monthly'), env: ENV(db) });
    const insert = seen.find((q) => q.sql.includes('INSERT INTO payment'));
    expect(insert?.args).toEqual(
      expect.arrayContaining(['user-1', 'razorpay', expect.any(String), 299, 'INR']),
    );
  });

  it('dodo gateway prices in USD ($9.99 monthly)', async () => {
    const { db, seen } = mockDb();
    await createOrder({ request: formReq('monthly', 'dodo'), env: ENV(db) });
    const insert = seen.find((q) => q.sql.includes('INSERT INTO payment'));
    expect(insert?.args).toEqual(
      expect.arrayContaining(['user-1', 'dodo', expect.any(String), 9.99, 'USD']),
    );
  });

  it('rejects unknown plans instead of falling through to pass pricing', async () => {
    const { db } = mockDb();
    const res = await createOrder({ request: formReq('lifetime'), env: ENV(db) });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'invalid_plan' });
  });
});
