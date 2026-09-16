# Load Testing (#42) — rig armed, unfired

First-ever spike test, built before traffic justifies firing it.

## Fire trigger (rule, not date)

Run the first spike when `/admin/analytics` page-views sustain **10×
the Sep 2026 baseline for a week**. Until then the rig stays armed:
scenarios, guardrails, and thresholds are code-reviewed and tested,
but no run has produced numbers. An unfired rig scores process, not proof.

## What it runs

`npm run test:load` (needs `LOAD_TARGET`): artillery warmup 1rps/60s →
spike 5→50 VUs/120s → hold 50/60s over `/`, two tool pages, and the
write-free `/api/geo-country` edge probe. Deliberately no writes
(analytics POSTs would pollute D1) and no authed AI paths (per-user
budgets make farm-load meaningless without a credential pool).

Thresholds: p95 < 2000ms, errors < 1% (env-overridable). The report
checker exits nonzero on breach — CI manual job uploads `load-report.json`.

## Guardrails

- `scripts/check-load-target.js` refuses the production apex unless
  `LOAD_CONFIRM_PROD=1`, requires https (localhost excepted).
- CI job is `workflow_dispatch`-only with a preview default — load never
  fires on push.
- D1-read coverage is intentionally absent (rate limits would 429 the
  generators and pollute the stats); read the `dl-record`/`ai-ip` rows
  after a run instead.

## After the first run

Record here: date, target, p95, error rate, bottleneck found, follow-up.
Until then, #42 stays held below target.
