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

| # | Item | Was → Now (target) | Status Sep 16 |
|---|------|-------------------|---------------|
| 33 | Notifications | 25, PARKED | Parked (owner Sep 15, no newsletter). |
| 26 | Compliance | 72 → 93 (95) | Done + counsel pass; held for licensed countersign + live banner check. |
| 36 | Billing | 75 (→ 92) | **OPEN — blocked: SMTP provider + gateway test access.** |
| 51 | Privacy review | 55 → 88 (92) | Done; held for first real sign-off. |
| 34 | Analytics | 72 → 88 (90) | Done; held for traffic validation + 7d toggle. |
| 44 | Legal pages | 82 → 96 | Done ✓ (incl. counsel pass). |

Projected: **→ 77.6**. Actual: **→ ~79.3** on completed items (billing excluded).

## Phase 2 — Resilience (weeks 3–5)

| # | Item | Was → Now (target) | Status Sep 16 |
|---|------|-------------------|---------------|
| 41/49 | Flags + kill-switch | 45/50 → 88 (92) | Done; rollback pipeline deferred per plan. |
| 20 | Release/versioning | 65 → 85 (90) | Done; held for first tagged release. |
| 38 | (cont.) | 50 → 90 | **Done ✓ (drill PASS Sep 16).** |
| 27 | Data mgmt | 68 → 88 (90) | Done; fallback removal awaits migrate-job confirmation. |
| 15 | Build/perf | 72 (→ 86) | **OPEN.** |
| 42 | Load testing | 40 (→ 88) | **OPEN — trigger: 10× baseline traffic for a week.** |
| 37 | Abuse | 85 → 93 (96) | Done; held for Turnstile-on-AI + CGNAT tuning + dashboard. |
| 22 | Dependencies | 75 → 88 | Done ✓ (target met). |
| 21 | Observability | 80 → 90 (93) | Done; held for owner email setup + noise tuning. |

Projected: **→ 81.2**.

## Phase 3 — Reach & quality (weeks 5–9)

| # | Item | Was → Now (target) | Status Sep 16 |
|---|------|-------------------|---------------|
| 30/48 | i18n + scale | 35/30, PARKED | Parked (owner: English-only deliberate). |
| 9 | Accessibility | 72 → 95 | Done ✓ (Sep 14 sessions). |
| 10 | Mobile/PWA | 78 → 86 (92) | Done; held for device audit. |
| 31 | Browser compat | 75 → 85 (90) | Done; held for device rows. |
| 45 | Offline/degraded | 65 → 84 (88) | Done; held for throttled live verification. |
| 46 | Platform | 55, PARKED | Parked (owner: no store apps). |
| 32 | Onboarding | 70 → 86 (92) | Done; held for eyes pass + richer tour. |
| 47 | Energy | 65 → 82 (85) | Done; held for lab battery measurements. |
| 43 | Brand | 80 (→ 93) | **OPEN — blocked on email existing.** |

Projected: **→ 85.1**. Actual: parked i18n reprices the honest ceiling to ~83–84.

## Phase 4 — Craft (weeks 9–14) → 93.9

Depth/thin-content (2), UX polish + Session 4 naming (6), E2E suite (14), warnings-to-zero + API docs (12/17), comparison tooling (5), design polish (8), SEO depth (11), auth hardening (25), scalability proof (29), maintenance (16). Each item to 95–100 per the workbook targets. No new features — this phase is pure quality density.

## Phase 5 — The last mile: 93.9 → 96.1 (program complete)

Everything remaining to 88–99: release automation, dependency policy, data/API polish, payment/brand/platform/energy/i18n tails, flags/load/privacy to high-90s. Computed projection: **96.1**.

## Beyond: 96.1 → 98+ (perfection stretch, no timeline)

Requires literal 100s in craft areas (zero warnings, minute-long builds, proven-at-scale, full E2E, Hindi + regions, teams v1) — roughly +160 weighted points of polish with no new capability. Start it only if a business reason demands the number; 96.1 is already top-decile product quality.

## Non-goals (parked with reasons)

- Newsletter (#33) — parked per owner Sep 15 2026; no backend planned, dead signup removed. Only transactional quota/credit nudges if ever.
- Native store apps (#46) — parked per owner Sep 16 2026; no Play Store / iOS app planned (PWA + Capacitor shell only). Platform row stays 55.
- Full i18n/l10n (#30/#48) — parked per owner Sep 16 2026. Rationale: the Indian audience operates in English for productivity domains (GST/UPI/banking/API terminology is English-official); Hindi chrome would double content costs without unlocking a blocked audience. Hindi *content* (transcription output, voice) already exists where it matters. English-only is deliberate. Revisit only on geo/behavior evidence of a bouncing Hindi-preferring segment. Rows stay 35/30.
- A/B infra at scale, team workspaces beyond lite — revisit past 96.
- ~~English-only assumption lifts in Phase 3 deliberately, not before.~~ Superseded: English-only is permanent policy per the #30/#48 park above.



