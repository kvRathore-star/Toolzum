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

export const FREE_CREDITS = 30;
export const PRO_CREDITS = 300;
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
