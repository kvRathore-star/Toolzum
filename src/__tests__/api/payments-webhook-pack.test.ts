import { describe, it, expect, vi } from 'vitest';

const { sendEmailMock } = vi.hoisted(() => ({ sendEmailMock: vi.fn(async () => undefined) }));
vi.mock('@/lib/email', () => ({ sendEmail: sendEmailMock }));

import { onRequestPost } from '../../../functions/api/payments/webhook';

/**
 * Signed end-to-end tests for the webhook grant paths (pack focus; pass/pro
 * covered for the settle-local-row behavior the return page depends on).
 * Signature scheme mirrors verifyStandardWebhook: HMAC-SHA256 over
 * "{id}.{ts}.{raw-body}" with a whsec_ base64 key.
 */

const SECRET = 'whsec_' + btoa('0123456789abcdef0123456789abcdef');

async function sign(id: string, ts: string, raw: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(atob(SECRET.slice(6))),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, enc.encode(`${id}.${ts}.${raw}`));
  return 'v1,' + btoa(String.fromCharCode(...new Uint8Array(mac)));
}

interface DbState {
  events: Set<string>;
  grants: Map<string, unknown[]>;
  grantInserts: unknown[][];
  inserts: { sql: string; args: unknown[] }[];
  updates: { sql: string; args: unknown[] }[];
  user: { id: string; email: string; plan: string };
}

function mockDb(state: DbState) {
  const prepare = (sql: string) => ({
    bind: (...args: unknown[]) => ({
      first: async () => {
        if (sql.includes('FROM "user"')) return { ...state.user };
        if (sql.includes('FROM payment')) return null; // no local amount → payload amount
        if (sql.includes('FROM session')) return null;
        return null;
      },
      run: async () => {
        if (sql.includes('INSERT INTO webhook_event')) {
          const eventId = String(args[0]);
          if (state.events.has(eventId)) throw new Error('UNIQUE constraint failed: webhook_event.event_id');
          state.events.add(eventId);
          return {};
        }
        if (sql.includes('INSERT INTO credit_grants')) {
          const id = String(args[0]);
          if (state.grants.has(id)) throw new Error('UNIQUE constraint failed: credit_grants.id');
          state.grants.set(id, args);
          state.grantInserts.push([...args]);
          return {};
        }
        if (sql.includes('INSERT INTO payment')) {
          state.inserts.push({ sql, args: [...args] });
          return {};
        }
        if (sql.includes('UPDATE payment') || sql.includes('UPDATE "user"')) {
          state.updates.push({ sql, args: [...args] });
          return {};
        }
        return {};
      },
    }),
  });
  return { prepare } as unknown as D1Database;
}

function freshState(): DbState {
  return { events: new Set(), grants: new Map(), grantInserts: [], inserts: [], updates: [], user: { id: 'u1', email: 'buyer@example.com', plan: 'free' } };
}

async function post(db: D1Database, body: unknown, webhookId: string) {
  const raw = JSON.stringify(body);
  const ts = String(Math.floor(Date.now() / 1000));
  const sig = await sign(webhookId, ts, raw);
  return onRequestPost({
    request: new Request('https://toolzum.com/api/payments/webhook', {
      method: 'POST',
      headers: {
        'webhook-id': webhookId,
        'webhook-timestamp': ts,
        'webhook-signature': sig,
        'content-type': 'application/json',
      },
      body: raw,
    }),
    env: { DB: db, DODO_WEBHOOK_SECRET: SECRET } as never,
  });
}

const packPayload = (credits = '500') => ({
  type: 'payment.succeeded',
  data: {
    id: 'evt_x',
    payment_id: 'pay_123',
    amount: 899,
    currency: 'INR',
    customer: { email: 'buyer@example.com', name: 'Buyer' },
    product_id: 'pdt_pack500_unconfigured',
    metadata: { plan: 'pack', tier: 'pack_500', credits, orderId: 'ord_1' } as Record<string, unknown>,
  },
});

describe('POST /api/payments/webhook — credit packs', () => {
  it('grants the pack, attributes it to our order, and settles the local row', async () => {
    const state = freshState();
    sendEmailMock.mockClear();
    const res = await post(mockDb(state), packPayload(), 'wh_pack_1');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, granted: 'pack' });

    // grant: id/orderId prefer our metadata.orderId (ord_*), 12-month expiry
    expect(state.grantInserts).toHaveLength(1);
    const [id, userId, credits, remaining, source, orderId, grantedAt, expiresAt] = state.grantInserts[0]!;
    expect(id).toBe('pack_ord_1');
    expect(userId).toBe('u1');
    expect(credits).toBe(500);
    expect(remaining).toBe(500);
    expect(source).toBe('pack_500');
    expect(orderId).toBe('ord_1');
    expect(Number(expiresAt) - Number(grantedAt)).toBe(365 * 24 * 60 * 60 * 1000);

    // local ord_* row settles to paid → return/status can confirm
    expect(state.updates.some(u => u.sql.includes('UPDATE payment') && u.args[0] === 'ord_1')).toBe(true);
    // paid dodo_* row + receipt
    expect(state.inserts.some(i => i.sql.includes('INSERT INTO payment') && i.args[0] === 'dodo_pay_123')).toBe(true);
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    expect(sendEmailMock.mock.calls[0]![1]).toMatchObject({ subject: 'Your Toolzum AI credit pack' });
    // user.plan untouched
    expect(state.user.plan).toBe('free');
  });

  it('never double-grants on a re-delivered event with a fresh webhook-id', async () => {
    const state = freshState();
    const first = await post(mockDb(state), packPayload(), 'wh_pack_a');
    expect((await first.json()).granted).toBe('pack');
    const second = await post(mockDb(state), packPayload(), 'wh_pack_b'); // new id, same payment
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual({ ok: true, granted: false });
    expect(state.grantInserts).toHaveLength(1); // UNIQUE pack_ord_1 held
  });

  it('dedupes the exact same webhook-id before any processing', async () => {
    const state = freshState();
    await post(mockDb(state), packPayload(), 'wh_pack_dup');
    const res = await post(mockDb(state), packPayload(), 'wh_pack_dup');
    expect(await res.json()).toEqual({ ok: true, deduped: true });
    expect(state.grantInserts).toHaveLength(1);
  });

  it('does not grant on subscription.active (no charge yet)', async () => {
    const state = freshState();
    const payload = packPayload();
    payload.type = 'subscription.active';
    const res = await post(mockDb(state), payload, 'wh_pack_act');
    expect(await res.json()).toEqual({ ok: true, granted: false });
    expect(state.grantInserts).toHaveLength(0);
    expect(state.updates).toHaveLength(0);
  });

  it('ignores unrecognized products without pack metadata', async () => {
    const state = freshState();
    const payload = packPayload();
    payload.data.metadata = { orderId: 'ord_1' };
    const res = await post(mockDb(state), payload, 'wh_pack_unk');
    expect(await res.json()).toEqual({ ok: true, ignored: 'unrecognized product' });
    expect(state.grantInserts).toHaveLength(0);
  });
});

describe('POST /api/payments/webhook — settle local row (return-page dependency)', () => {
  it('pass: grants the pass and settles the ord_* row (plan stays free)', async () => {
    const state = freshState();
    sendEmailMock.mockClear();
    const payload = {
      type: 'payment.succeeded',
      data: {
        payment_id: 'pay_pass',
        amount: 3.99,
        currency: 'USD',
        customer: { email: 'buyer@example.com', name: '' },
        product_id: 'pdt_0NnxoUmsSDo8QS9UhLJ0J',
        metadata: { plan: 'pass', orderId: 'ord_pass' },
      },
    };
    const res = await post(mockDb(state), payload, 'wh_pass_1');
    expect(await res.json()).toEqual({ ok: true, granted: 'pass' });
    expect(state.updates.some(u => u.sql.includes('UPDATE payment') && u.args[0] === 'ord_pass')).toBe(true);
    expect(state.user.plan).toBe('free');
    expect(sendEmailMock.mock.calls[0]![1]).toMatchObject({ subject: 'Receipt for your Toolzum 7-Day Pass' });
  });

  it('pro: flips the plan and settles the ord_* row', async () => {
    const state = freshState();
    sendEmailMock.mockClear();
    const payload = {
      type: 'payment.succeeded',
      data: {
        payment_id: 'pay_pro',
        amount: 9.99,
        currency: 'USD',
        customer: { email: 'buyer@example.com', name: '' },
        product_id: 'pdt_0Nnxjj5tGkZs2aaArMZAg',
        metadata: { plan: 'pro', orderId: 'ord_pro' },
      },
    };
    const res = await post(mockDb(state), payload, 'wh_pro_1');
    expect(await res.json()).toEqual({ ok: true, granted: true });
    expect(state.updates.some(u => u.sql.includes('UPDATE payment') && u.args[0] === 'ord_pro')).toBe(true);
    expect(state.updates.some(u => u.sql.includes('UPDATE "user" SET plan') && u.args[0] === 'pro')).toBe(true);
  });

  it('rejects unsigned/mis-signed deliveries', async () => {
    const state = freshState();
    const raw = JSON.stringify(packPayload());
    const res = await onRequestPost({
      request: new Request('https://toolzum.com/api/payments/webhook', {
        method: 'POST',
        headers: { 'webhook-id': 'wh_bad', 'webhook-timestamp': String(Math.floor(Date.now() / 1000)), 'webhook-signature': 'v1,aGVsbG8=' },
        body: raw,
      }),
      env: { DB: mockDb(state), DODO_WEBHOOK_SECRET: SECRET } as never,
    });
    expect(res.status).toBe(401);
    expect(state.grantInserts).toHaveLength(0);
  });
});
