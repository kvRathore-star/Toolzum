/**
 * Single source of truth for user tiers — the "plan-label normalization"
 * (Sep 2026). Previously every endpoint spoke its own dialect (`free` vs
 * `signedin` for the same authenticated free user, `null` vs `'free'` for
 * anon), which once caused check-plan to serve anon caps to signed-in users.
 *
 * Two-level model:
 * - STORED plan (DB `user.plan`): only 'free' | 'pro'. Enforced by
 *   /api/admin/change-plan. Never 'signedin', never null.
 * - EFFECTIVE plan (this module): 'anon' | 'signedin' | 'pro', resolved from
 *   (authenticated, storedPlan). All limit/allowance/rate decisions branch
 *   on the effective plan via the helpers below — never on raw strings.
 */

export type StoredPlan = "free" | "pro";
export type EffectivePlan = "anon" | "signedin" | "pro";

export const FREE_CREDITS = 10;
export const PRO_CREDITS = 200;
export const CREDIT_RESET_DAYS = 30;

export interface FileCaps {
  maxFileSizeMB: number;
  maxBatchSize: number;
  threads: number;
}

const FILE_CAPS: Record<EffectivePlan, FileCaps> = {
  anon: { maxFileSizeMB: 30, maxBatchSize: 1, threads: 1 },
  signedin: { maxFileSizeMB: 150, maxBatchSize: 10, threads: 1 },
  pro: { maxFileSizeMB: 2000, maxBatchSize: 500, threads: 6 },
};

export function resolvePlan(authenticated: boolean, storedPlan: string | null): EffectivePlan {
  if (!authenticated) return "anon";
  if (storedPlan === "pro") return "pro";
  // Stored 'free', missing, or anything unexpected → authenticated free tier.
  // Unknown values fail closed to free-tier outcomes (never pro).
  return "signedin";
}

/** Monthly AI credit allowance. */
export function creditAllowance(plan: EffectivePlan): number {
  return plan === "pro" ? PRO_CREDITS : FREE_CREDITS;
}

/** Per-minute AI request budget (60s sliding window, see rate-limit.ts). */
export function aiRateLimit(plan: EffectivePlan): number {
  return plan === "pro" ? 5 : 2;
}

/**
 * Daily download budget. Pro is unlimited; Pro tools give authed free users
 * a 2/day taste and block anon entirely. Returns Infinity, never null.
 */
export function downloadLimit(plan: EffectivePlan, isProTool: boolean): number {
  if (plan === "pro") return Infinity;
  if (isProTool) return plan === "anon" ? 0 : 2;
  return plan === "anon" ? 3 : 5;
}

/** File/batch/thread caps served by /api/check-plan. */
export function fileCaps(plan: EffectivePlan): FileCaps {
  return FILE_CAPS[plan];
}

/** Narrow an arbitrary stored value to the DB invariant (free|pro). */
export function normalizeStoredPlan(plan: string | null): StoredPlan {
  return plan === "pro" ? "pro" : "free";
}

/** Project Pass terms (pricing spec Sep 2026). */
export const PASS_DAYS = 7;
export const PASS_CREDITS = 70;

/**
 * Effective plan with a live Project Pass: a valid passExpiresAt grants
 * Pro treatment without touching the stored plan, so expiry needs no
 * writes, no cron, no cleanup — time does it. Stale timestamps are inert.
 */
export function resolvePlanWithPass(
  authenticated: boolean,
  storedPlan: string | null,
  passExpiresAt: number | null,
  nowMs: number = Date.now(),
): EffectivePlan {
  if (
    authenticated &&
    typeof passExpiresAt === "number" &&
    passExpiresAt > nowMs
  ) {
    return "pro";
  }
  return resolvePlan(authenticated, storedPlan);
}

/**
 * Read-path helper: resolves the effective plan for a user row,
 * tolerating databases predating the passExpiresAt column (0020).
 */
export async function effectivePlanForUser(
  DB: D1Database,
  userId: string,
  storedPlan: string | null,
  nowMs: number = Date.now(),
): Promise<EffectivePlan> {
  let passExpiresAt: number | null = null;
  try {
    const row = await DB.prepare('SELECT passExpiresAt FROM "user" WHERE id = ?')
      .bind(userId)
      .first<{ passExpiresAt: number | null }>();
    passExpiresAt = row?.passExpiresAt ?? null;
  } catch {
    /* pre-0020 database — stored plan decides */
  }
  return resolvePlanWithPass(true, storedPlan, passExpiresAt, nowMs);
}

/**
 * Grants a Project Pass: tops up credits once (monthly reset normalizes
 * any remainder) and stamps expiry. Called by the payment webhook
 * (pending gateway keys) or admin tooling — never by clients.
 */
export async function grantPass(
  DB: D1Database,
  userId: string,
  days: number = PASS_DAYS,
  bonusCredits: number = PASS_CREDITS,
  nowMs: number = Date.now(),
): Promise<void> {
  await DB.prepare(
    'UPDATE "user" SET passExpiresAt = ?, credits = credits + ?, creditResetAt = COALESCE(creditResetAt, ?) WHERE id = ?',
  )
    .bind(nowMs + days * 86400 * 1000, bonusCredits, nowMs, userId)
    .run();
}
