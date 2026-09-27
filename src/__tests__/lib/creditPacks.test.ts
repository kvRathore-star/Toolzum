import { describe, it, expect } from 'vitest';
import {
  packBalance,
  creditsAvailable,
  spendCredits,
  grantPack,
  packCreditsFor,
  PACK_EXPIRY_MS,
} from '@/lib/creditPacks';

interface Grant {
  id: string;
  userId: string;
  credits: number;
  remaining: number;
  source: string;
  orderId: string | null;
  grantedAt: number;
  expiresAt: number;
}

/**
 * Scripted in-memory D1 stand-in — implements only the SQL shapes
 * creditPacks.ts issues, dispatching on substrings (repo mock style).
 * `userCredits` mirrors `user.credits`.
 */
function memDb(opts: { grants?: Grant[]; userCredits?: number } = {}) {
  const grants: Grant[] = opts.grants ? [...opts.grants] : [];
  const user = { credits: opts.userCredits ?? 0 };
  const prepare = (sql: string) => {
    const bind = (...args: unknown[]) => ({
      async first() {
        if (sql.includes('SUM(remaining)')) {
          const [userId, now] = args as [string, number];
          const total = grants
            .filter((g) => g.userId === userId && g.expiresAt > now)
            .reduce((s, g) => s + g.remaining, 0);
          return { total };
        }
        if (sql.includes('SELECT id, remaining')) {
          const [userId, now] = args as [string, number];
          const g = grants
            .filter((x) => x.userId === userId && x.expiresAt > now && x.remaining > 0)
            .sort((a, b) => a.expiresAt - b.expiresAt || a.grantedAt - b.grantedAt)[0];
          return g ? { id: g.id, remaining: g.remaining } : null;
        }
        return null;
      },
      async run() {
        if (sql.includes('UPDATE user SET credits = credits -')) {
          const [amount, id, min] = args as [number, string, number];
          if (id === 'u1' && user.credits >= min) user.credits -= amount;
          return {};
        }
        if (sql.includes('UPDATE credit_grants SET remaining')) {
          const [take, id, min] = args as [number, string, number];
          const g = grants.find((x) => x.id === id);
          if (g && g.remaining >= min) g.remaining -= take;
          return {};
        }
        if (sql.includes('INSERT INTO credit_grants')) {
          const [id, userId, credits, remaining, source, orderId, grantedAt, expiresAt] = args as
            [string, string, number, number, string, string | null, number, number];
          if (grants.some((g) => g.id === id)) throw new Error('UNIQUE constraint failed: credit_grants.id');
          grants.push({ id, userId, credits, remaining, source, orderId, grantedAt, expiresAt });
          return {};
        }
        return {};
      },
    });
    return { bind };
  };
  return { db: { prepare } as unknown as D1Database, grants, user };
}

const NOW = 1_700_000_000_000;

function grant(id: string, remaining: number, grantedAt: number, userId = 'u1'): Grant {
  return {
    id,
    userId,
    credits: remaining,
    remaining,
    source: 'pack_100',
    orderId: id,
    grantedAt,
    expiresAt: grantedAt + PACK_EXPIRY_MS,
  };
}

describe('credit packs (decision Sep 2026)', () => {
  it('packCreditsFor maps tier plans only', () => {
    expect(packCreditsFor('pack_100')).toBe(100);
    expect(packCreditsFor('pack_500')).toBe(500);
    expect(packCreditsFor('pack_1000')).toBe(1000);
    expect(packCreditsFor('pro')).toBeNull();
    expect(packCreditsFor('pass')).toBeNull();
  });

  it('packBalance sums non-expired grants only', () => {
    const { db } = memDb({
      grants: [
        grant('a', 100, NOW - 2 * PACK_EXPIRY_MS), // expired
        grant('b', 50, NOW - 1000), // live
        grant('c', 30, NOW - 500), // live
        grant('other', 999, NOW - 500, 'u2'), // another user
      ],
    });
    // grants a: expired (grantedAt NOW-2*expiry → expiresAt NOW-PACK_EXPIRY_MS < NOW)
    return packBalance(db, 'u1', NOW).then((bal) => expect(bal).toBe(80));
  });

  it('allowance covers the cost → packs untouched', async () => {
    const { db, grants, user } = memDb({ userCredits: 10, grants: [grant('a', 100, NOW - 1000)] });
    expect(await creditsAvailable(db, 'u1', 3, 10, NOW)).toBe(true);
    const spent = await spendCredits(db, 'u1', 3, 10, NOW);
    expect(spent).toEqual({ allowance: 3, pack: 0 });
    expect(user.credits).toBe(7);
    expect(grants[0]!.remaining).toBe(100);
  });

  it('spends allowance first, remainder from packs (partial split)', async () => {
    const { db, grants, user } = memDb({ userCredits: 2, grants: [grant('a', 100, NOW - 1000)] });
    expect(await creditsAvailable(db, 'u1', 5, 2, NOW)).toBe(true);
    const spent = await spendCredits(db, 'u1', 5, 2, NOW);
    expect(spent).toEqual({ allowance: 2, pack: 3 });
    expect(user.credits).toBe(0);
    expect(grants[0]!.remaining).toBe(97);
  });

  it('packs alone cover the cost when allowance is empty (free trial spent)', async () => {
    const { db, grants, user } = memDb({ userCredits: 0, grants: [grant('a', 100, NOW - 1000)] });
    expect(await creditsAvailable(db, 'u1', 5, 0, NOW)).toBe(true);
    const spent = await spendCredits(db, 'u1', 5, 0, NOW);
    expect(spent).toEqual({ allowance: 0, pack: 5 });
    expect(user.credits).toBe(0);
    expect(grants[0]!.remaining).toBe(95);
  });

  it('blocks when neither allowance nor packs cover the cost', async () => {
    const { db } = memDb({ userCredits: 2, grants: [grant('a', 2, NOW - 1000)] });
    expect(await creditsAvailable(db, 'u1', 5, 2, NOW)).toBe(false);
    // and with nothing at all
    const empty = memDb({ userCredits: 0 });
    expect(await creditsAvailable(empty.db, 'u1', 1, 0, NOW)).toBe(false);
  });

  it('never spends expired grants', async () => {
    const { db, grants } = memDb({
      userCredits: 0,
      grants: [grant('expired', 100, NOW - 2 * PACK_EXPIRY_MS)],
    });
    expect(await creditsAvailable(db, 'u1', 1, 0, NOW)).toBe(false);
    const spent = await spendCredits(db, 'u1', 1, 0, NOW);
    expect(spent).toEqual({ allowance: 0, pack: 0 });
    expect(grants[0]!.remaining).toBe(100);
  });

  it('consumes earliest-expiry first (FIFO), across multiple grants', async () => {
    const { db, grants } = memDb({
      userCredits: 0,
      grants: [
        grant('later', 10, NOW - 1000), // expires later (granted later)
        grant('sooner', 4, NOW - 9000), // expires sooner
      ],
    });
    const spent = await spendCredits(db, 'u1', 5, 0, NOW);
    expect(spent).toEqual({ allowance: 0, pack: 5 });
    expect(grants.find((g) => g.id === 'sooner')!.remaining).toBe(0);
    // remainder after draining 'sooner' came from the next grant
    expect(grants.find((g) => g.id === 'later')!.remaining).toBe(9);
  });

  it('grantPack writes a 12-month grant and is idempotent on orderId', async () => {
    const { db, grants } = memDb();
    expect(await grantPack(db, { userId: 'u1', credits: 100, source: 'pack_100', orderId: 'pay_1', nowMs: NOW })).toBe(true);
    expect(grants).toHaveLength(1);
    expect(grants[0]!.expiresAt - grants[0]!.grantedAt).toBe(PACK_EXPIRY_MS);
    expect(grants[0]!.remaining).toBe(100);
    // duplicate (re-delivered event) must not double-grant
    expect(await grantPack(db, { userId: 'u1', credits: 100, source: 'pack_100', orderId: 'pay_1', nowMs: NOW })).toBe(false);
    expect(grants).toHaveLength(1);
  });
});
