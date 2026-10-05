# Quota 10/day Merge — SPEC (awaiting owner pricing approval, Oct 5)

> Status: SPEC ONLY — no code changed. Deploying this alters the business model;
> needs explicit owner "ship it". When approved: implement → gates → same deploy
> as §7b honesty fixes (copy depends on final numbers).

## Decision

Merge anon-3 + signed-5 single-download quotas into **one free tier: 10/day for
everyone** (anon and signed identical). Signup incentive moves to size
(30→150MB), batch (1→10), AI trial (0→5), pro-taste (0→2/day) — all genuine
account benefits. Pro/credits/file-sizes/rates UNCHANGED.

## Exact diff (when approved)

1. `functions/api/downloads/check.ts` + `record.ts` — `getUserLimit()`:
   anon+free → 10, signed+free → 10 (was 3/5). Pro-tool branch untouched (0/2/∞).
2. `src/lib/proLimits.ts` — update `dailyQr`/`freeBatchSize`-adjacent display
   constants ONLY if they encode 3/5 (check at implement time).
3. `DownloadQuotaBadge.tsx` + `DownloadLimitModal.tsx` — copy: "N of 10 free
   left today"; modal pitch becomes size/batch/credits (drop 3→5 ladder text).
4. `docs/LIMITS-AND-PRICING.md` — §2 table (3→10, 5→10), §8 summary row,
   §10 tuning note (record decision + date), counts re-verified.
5. Playbook §7b quota doctrine — replace freeze note with shipped note.
6. Tests to update: any quota test asserting 3/5 (find via
   `grep -rn "dailyQr\|freeBatchSize\|, 3)\|, 5)" src/__tests__`), plus
   badge/modal render tests if they assert copy.

## Verification (same deploy gates)

- Targeted: quota/check-plan/download tests green · eslint/tsc clean.
- Live: curl quota endpoints anon (10 allowed, 11th blocked) + signed (same).
- Full suite green → commit → push.
- Freeze resumes after: no quota-number changes for 90 days.
