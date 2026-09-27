/**
 * AI credit packs (decision Sep 2026) — one-time top-ups that STACK on
 * top of the monthly allowance and are spent only AFTER it (allowance
 * first, packs second — partial allowance use is fine: balance 2 + cost 5
 * spends 2 from allowance, 3 from packs). Each pack expires 12 months
 * from purchase; expired grants are invisible to balance and spend.
 * Packs are consumed earliest-expiry first (FIFO, then oldest grant).
 *
 * Packs never touch `user.credits` — that counter stays the
 * allowance/trial balance with its monthly-reset semantics (Pro refills,
 * free does not; grantPass bonus credits still land there unchanged).
 *
 * Table: credit_grants (migration 0027). The helper fails closed when
 * the table is missing (migration not applied) — pack buyers can't spend,
 * nobody else is affected.
 */

export const PACK_TIERS = {
  pack_100: 100,
  pack_500: 500,
  pack_1000: 1000,
} as const;

export type PackTier = keyof typeof PACK_TIERS;

export const PACK_EXPIRY_MS = 365 * 24 * 60 * 60 * 1000;

/** Plan value → pack credits, or null for non-pack plans. */
export function packCreditsFor(plan: string): number | null {
  return Object.prototype.hasOwnProperty.call(PACK_TIERS, plan)
    ? PACK_TIERS[plan as PackTier]
    : null;
}

/** Total non-expired pack credits for a user. */
export async function packBalance(
  DB: D1Database,
  userId: string,
  nowMs: number = Date.now(),
): Promise<number> {
  try {
    const row = await DB.prepare(
      "SELECT COALESCE(SUM(remaining), 0) AS total FROM credit_grants WHERE userId = ? AND expiresAt > ?",
    )
      .bind(userId, nowMs)
      .first<{ total: number | null }>();
    return row?.total ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Pre-spend gate: is `cost` coverable by allowance + non-expired packs?
 * Callers replace their `balance < cost` check with this so a pack makes
 * an otherwise-blocked request pass.
 */
export async function creditsAvailable(
  DB: D1Database,
  userId: string,
  cost: number,
  allowanceBalance: number,
  nowMs: number = Date.now(),
): Promise<boolean> {
  const allowance = Math.max(allowanceBalance, 0);
  if (allowance >= cost) return true;
  return allowance + (await packBalance(DB, userId, nowMs)) >= cost;
}

/**
 * Spend `cost` credits: allowance first (up to its balance), remainder
 * from non-expired packs, earliest expiry first. Returns the split for
 * logging. The caller's pre-check (creditsAvailable) guarantees coverage
 * under no concurrency; a lost race can under-spend the pack leg only.
 */
export async function spendCredits(
  DB: D1Database,
  userId: string,
  cost: number,
  allowanceBalance: number,
  nowMs: number = Date.now(),
): Promise<{ allowance: number; pack: number }> {
  const fromAllowance = Math.min(Math.max(allowanceBalance, 0), cost);
  if (fromAllowance > 0) {
    await DB.prepare(
      "UPDATE user SET credits = credits - ? WHERE id = ? AND credits >= ?",
    )
      .bind(fromAllowance, userId, fromAllowance)
      .run();
  }
  let remainder = cost - fromAllowance;
  let fromPack = 0;
  while (remainder > 0) {
    const g = await DB.prepare(
      "SELECT id, remaining FROM credit_grants WHERE userId = ? AND expiresAt > ? AND remaining > 0 ORDER BY expiresAt ASC, grantedAt ASC LIMIT 1",
    )
      .bind(userId, nowMs)
      .first<{ id: string; remaining: number }>();
    if (!g) break;
    const take = Math.min(remainder, g.remaining);
    await DB.prepare(
      "UPDATE credit_grants SET remaining = remaining - ? WHERE id = ? AND remaining >= ?",
    )
      .bind(take, g.id, take)
      .run();
    remainder -= take;
    fromPack += take;
  }
  return { allowance: fromAllowance, pack: fromPack };
}

/**
 * Grant a pack (webhook). Idempotent on the payment-derived id — a
 * duplicate insert (re-delivered event with a fresh webhook-id) returns
 * false instead of double-granting.
 */
export async function grantPack(
  DB: D1Database,
  opts: {
    userId: string;
    credits: number;
    source: string;
    orderId: string;
    nowMs?: number;
  },
): Promise<boolean> {
  const now = opts.nowMs ?? Date.now();
  try {
    await DB.prepare(
      "INSERT INTO credit_grants (id, userId, credits, remaining, source, orderId, grantedAt, expiresAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(
        `pack_${opts.orderId}`,
        opts.userId,
        opts.credits,
        opts.credits,
        opts.source,
        opts.orderId,
        now,
        now + PACK_EXPIRY_MS,
      )
      .run();
    return true;
  } catch {
    return false;
  }
}
