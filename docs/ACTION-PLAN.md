# Action Plan: 73.8 → 96.1 (program), 98+ (perfection stretch)

Baseline: **73.8/100** (Sep 12 2026 workbook audit, 51 categories, weights intact).
All projections below are computed from live sheet weights — rerun
`composite` after each phase; if a phase lands short, its items aren't done.

> Honesty note: 98+ is not "one more phase." 96.1 is what an aggressive,
> well-executed program earns. The last ~2 points are all-100s craftsmanship
> (zero warnings, minutes-long builds, proven-at-scale everything). Both are
> specified below — commit to 96, stretch to 98.

## Phase 0 — Ticking clocks (this week, 1–2 days)

| # | Item | Now → Target | Notes |
|---|------|--------------|-------|
| 39 | Vendor risk | 65 → 88 | Verify Gemini Oct 2 cutoff hardness (grace vs hard). Either way: multi-model fallback (3.1-flash-lite ready) so no single-vendor kill switch. |
| 38 | Backup/DR | 50 → 90 | Confirm D1 PITR story first — may be cheaper than custom tooling. Then: restore drill, documented RTO. |

Projected: **73.8 → 75.0** (small number, existential risk removed).

## Phase 1 — Revenue & trust (weeks 1–3)

| # | Item | Now → Target | Notes |
|---|------|--------------|-------|
| 33 | Notifications | 25 → 88 | Backend for newsletter (currently dead button) + one re-engagement loop (credit-reset nudge, quota-wall follow-up). |
| 26 | Compliance | 72 → 95 | Verify consent banner behavior; audit policy accuracy vs actual data flows. |
| 36 | Billing | 75 → 92 | Dunning/payment-failure recovery paths; verify cancel + refund flows live. |
| 51 | Privacy review | 55 → 92 | Formalize the ad-hoc process: checklist gate before ship (data flow, third parties, retention). |
| 34 | Analytics | 72 → 90 | Funnels: signup→first-tool, quota-wall→convert, credit-wall→upgrade. |
| 44 | Legal pages | 82 → 96 | Accuracy pass against #26 findings. |

Projected: **→ 77.6**.

## Phase 2 — Resilience (weeks 3–5)

| # | Item | Now → Target | Notes |
|---|------|--------------|-------|
| 41/49 | Flags + kill-switch | 45/50 → 92 | Lightweight flag service first (80% of instant-disable); full rollback pipeline only if flags prove insufficient. |
| 20 | Release/versioning | 65 → 90 | Semver + changelog discipline + rollback runbook faster than a 15-min rebuild. |
| 38 | (cont.) | — | Restore drill counts here. |
| 27 | Data mgmt | 68 → 90 | Migration story to replace lazy CREATEs; backup verification. |
| 15 | Build/perf | 72 → 86 | Attack the 15-min build (TS 5.5min first); bundle budgets in CI. |
| 42 | Load testing | 40 → 88 | First-ever spike test before traffic justifies it. |
| 37 | Abuse | 85 → 96 | Review fingerprint-vs-IP layers; bot rules for AI endpoints. |
| 22 | Dependencies | 75 → 88 | Lockfile audit cadence + update policy. |
| 21 | Observability | 80 → 93 | Alerting on error-rate + quota-block spikes (data exists, alarms don't). |

Projected: **→ 81.2**.

## Phase 3 — Reach & quality (weeks 5–9)

| # | Item | Now → Target | Notes |
|---|------|--------------|-------|
| 30/48 | i18n + scale | 35/30 → 90/88 | Hindi-first pilot (Indian utilities already exist); cultural/legal nuance after. |
| 9 | Accessibility | 72 → 95 | Session 3 VoiceOver pass → fix → re-pass. Non-negotiable for 95. |
| 10 | Mobile/PWA | 78 → 92 | Device audit + offline hardening beyond shell caching. |
| 31 | Browser compat | 75 → 90 | Safari/Firefox matrix for WASM + SAB paths. |
| 45 | Offline/degraded | 65 → 88 | Degraded-network UX, not just offline shell. |
| 46 | Platform | 55 → 88 | Play Store submission state resolved. |
| 32 | Onboarding | 70 → 92 | Empty-state audit with eyes (spots already listed in tracker). |
| 47 | Energy | 65 → 85 | Measure-first; low-end path already exists. |
| 43 | Brand | 80 → 93 | Touchpoint sweep (emails exist only after Phase 1). |

Projected: **→ 85.1**.

## Phase 4 — Craft (weeks 9–14) → 93.9

Depth/thin-content (2), UX polish + Session 4 naming (6), E2E suite (14), warnings-to-zero + API docs (12/17), comparison tooling (5), design polish (8), SEO depth (11), auth hardening (25), scalability proof (29), maintenance (16). Each item to 95–100 per the workbook targets. No new features — this phase is pure quality density.

## Phase 5 — The last mile: 93.9 → 96.1 (program complete)

Everything remaining to 88–99: release automation, dependency policy, data/API polish, payment/brand/platform/energy/i18n tails, flags/load/privacy to high-90s. Computed projection: **96.1**.

## Beyond: 96.1 → 98+ (perfection stretch, no timeline)

Requires literal 100s in craft areas (zero warnings, minute-long builds, proven-at-scale, full E2E, Hindi + regions, teams v1) — roughly +160 weighted points of polish with no new capability. Start it only if a business reason demands the number; 96.1 is already top-decile product quality.

## Non-goals (parked with reasons)

- A/B infra at scale, team workspaces beyond lite — revisit past 96.
- English-only assumption lifts in Phase 3 deliberately, not before.
