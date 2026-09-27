import { describe, it, expect } from 'vitest';
import { onRequestGet as statusGet } from '../../../functions/api/payments/status';
import { onRequestGet as returnGet } from '../../../functions/api/payments/return';

type Row = { status: string; plan: string; packCredits: number };

/**
 * Payment row + session mock for the return/status pair. `packRow` is
 * what the credit_grants-attributed primary query returns; throwOnPackTable
 * simulates migration 0027 not being applied (legacy fallback path).
 */
function mockDb(opts: { packRow?: Row | null; throwOnPackTable?: boolean } = {}) {
  const fallback: Row = opts.packRow === undefined
    ? { status: 'created', plan: 'free', packCredits: 0 }
    : (opts.packRow ?? { status: 'created', plan: 'free', packCredits: 0 });
  const prepare = (sql: string) => ({
    bind: () => ({
      first: async () => {
        if (sql.includes('FROM session')) return { userId: 'u1' };
        if (sql.includes('credit_grants')) {
          if (opts.throwOnPackTable) throw new Error('no such table: credit_grants');
          return opts.packRow === null ? null : fallback;
        }
        // legacy shape (no packCredits column in select → synthesized 0)
        if (opts.packRow === null) return null;
        return { status: fallback.status, plan: fallback.plan, packCredits: 0 };
      },
      run: async () => ({}),
    }),
  });
  return { prepare } as unknown as D1Database;
}

function statusReq(db: D1Database, order = 'ord_1', cookie: string | null = 'auth_session=tok') {
  const headers: Record<string, string> = {};
  if (cookie) headers.cookie = cookie;
  return statusGet({ request: new Request(`https://toolzum.com/api/payments/status?order=${order}`, { headers }), env: { DB: db } });
}

function returnReq(db: D1Database, order = 'ord_1', cookie: string | null = 'auth_session=tok') {
  const headers: Record<string, string> = {};
  if (cookie) headers.cookie = cookie;
  return returnGet({ request: new Request(`https://toolzum.com/api/payments/return?order=${order}`, { headers }), env: { DB: db } });
}

describe('GET /api/payments/status (return-page poller)', () => {
  it('reports pending while the webhook has not settled the order', async () => {
    const res = await statusReq(mockDb({ packRow: { status: 'created', plan: 'free', packCredits: 0 } }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'created', plan: 'free', granted: null, credits: 0 });
  });

  it('names a granted pack and its original size', async () => {
    const res = await statusReq(mockDb({ packRow: { status: 'paid', plan: 'free', packCredits: 500 } }));
    expect(await res.json()).toEqual({ status: 'paid', plan: 'free', granted: 'pack', credits: 500 });
  });

  it('pack attribution wins over an existing Pro plan (Pro user buying a pack)', async () => {
    const res = await statusReq(mockDb({ packRow: { status: 'paid', plan: 'pro', packCredits: 100 } }));
    expect(await res.json()).toEqual({ status: 'paid', plan: 'pro', granted: 'pack', credits: 100 });
  });

  it('reports pro when the plan flipped', async () => {
    const res = await statusReq(mockDb({ packRow: { status: 'paid', plan: 'pro', packCredits: 0 } }));
    expect(await res.json()).toEqual({ status: 'paid', plan: 'pro', granted: 'pro', credits: 0 });
  });

  it('reports pass for a settled free-plan order (grantPass never flips plan)', async () => {
    const res = await statusReq(mockDb({ packRow: { status: 'paid', plan: 'free', packCredits: 0 } }));
    expect(await res.json()).toEqual({ status: 'paid', plan: 'free', granted: 'pass', credits: 0 });
  });

  it('fails closed to the legacy query when credit_grants is missing (pre-migration)', async () => {
    const res = await statusReq(mockDb({ throwOnPackTable: true }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'created', plan: 'free', granted: null, credits: 0 });
  });

  it('401s without a session cookie and 404s unknown orders', async () => {
    expect((await statusReq(mockDb(), 'ord_1', null)).status).toBe(401);
    expect((await statusReq(mockDb({ packRow: null }))).status).toBe(404);
    expect((await statusReq(mockDb(), '')).status).toBe(400);
  });
});

describe('GET /api/payments/return (checkout landing)', () => {
  it('claims pack success only after attribution (SSR, no polling needed)', async () => {
    const html = await (await returnReq(mockDb({ packRow: { status: 'paid', plan: 'free', packCredits: 1000 } }))).text();
    expect(html).toContain('Credits added!');
    expect(html).toContain('Your 1000-credit pack has been added');
    expect(html).toContain('valid for 12 months');
    expect(html).toContain('/dashboard/account');
    expect(html).toContain('return;'); // no poll once granted
  });

  it('shows Pro copy when the plan flipped', async () => {
    const html = await (await returnReq(mockDb({ packRow: { status: 'paid', plan: 'pro', packCredits: 0 } }))).text();
    expect(html).toContain("You're Pro! 🎉");
    expect(html).toContain('return;');
  });

  it('shows pass copy for a settled free-plan order', async () => {
    const html = await (await returnReq(mockDb({ packRow: { status: 'paid', plan: 'free', packCredits: 0 } }))).text();
    expect(html).toContain('Your 7-Day Pass is active! 🎉');
  });

  it('keeps the honest pending state and polls for all three outcomes', async () => {
    const html = await (await returnReq(mockDb({ packRow: { status: 'created', plan: 'free', packCredits: 0 } }))).text();
    const ssr = html.split('<script>')[0]!;
    expect(ssr).toContain('Payment processing…');
    expect(ssr).toContain('Dodo is confirming your payment');
    // must not claim success before the webhook (SSR only — the poll
    // script below legitimately embeds the success copy for later)
    expect(ssr).not.toContain("You're Pro! 🎉");
    expect(ssr).not.toContain('Credits added!');
    expect(ssr).not.toContain('7-Day Pass is active! 🎉');
    expect(ssr).not.toContain('return;');
    // poll handler covers pack, pro, and pass
    expect(html).toContain('d.granted==="pack"');
    expect(html).toContain('d.plan==="pro"');
    expect(html).toContain('d.granted==="pass"');
  });

  it('never claims success for a missing order', async () => {
    const html = await (await returnReq(mockDb({ packRow: null }))).text();
    const ssr = html.split('<script>')[0]!;
    expect(ssr).toContain('Payment processing…');
    expect(ssr).not.toContain('Credits added!');
    expect(ssr).not.toContain("You're Pro! 🎉");
  });
});
