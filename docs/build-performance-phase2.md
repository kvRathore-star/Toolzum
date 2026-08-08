# Build Performance — Phase 2 Implementation Log

> Tier 3 / performance (Performance/build task). Phase 2 = ship the fixes that Phase 1
> identified. Every item logs a **before / after** measurement on the same machine, same
> conditions (macOS 12.7.6, Node v24, Next 16.2.6 static export). Baseline numbers come from
> `docs/build-performance-phase1.md`.

---

## Item 1 — OG image generation: parallelize + skip-if-unchanged (DONE)

### What changed

`scripts/generate-og-images.ts`:

1. **Parallel pool** — the serial `for` loop became a bounded worker pool
   (`runPool`, default `OG_CONCURRENCY=4`). `@vercel/og` rendering is libuv-threadpool-backed;
   measured saturation is ~2–4 workers (pool 2 ≈ pool 4 ≈ pool 8), so 4 is the sweet spot for a
   2-vCPU CI too.
2. **Content-hash skip** — every output PNG is keyed by a sha1 of its inputs
   (`toolHash`/`categoryHash`, including a `TEMPLATE_VERSION` that invalidates all entries on
   template redesign). A committed `og-cache.json` manifest maps relative path → hash; files that
   match are skipped entirely (no render, no write). Stale entries (tool removed from registry)
   are pruned.

The manifest lives at repo root (`og-cache.json`, git-tracked, relative paths) so it is portable
across machines and works on fresh CI checkouts. `generateAll` accepts optional
`concurrency`/`cachePath` args; the test suite keeps using temp dirs, so it stays isolated.

### Before / after

| Metric | Before (serial) | After (cold, pool 4) | After (warm, cache hit) |
|---|---|---|---|
| `gen:og` wall time | 114.9s / 140.3s (phase1) | 129.0s | **0.6s (1172 skipped)** |
| PNGs written per build | 1,172 (every build) | 1,172 (only cold / on content change) | 0 |
| git churn | 1,172 modified PNGs | 1,172 (one-time resync of stale committed images) | **0** |

### Determinism verification

`@vercel/og` output is byte-identical for identical inputs (two fresh renders compared
byte-for-byte). Two consecutive cold runs of `generateAll` over the real registry changed **0**
files. Combined with the content-hash skip, a build whose tool content is unchanged writes
**no** PNGs — the per-build 1,172-file churn is eliminated. The large `git status` diff that
remains is a one-time resync: committed PNGs predate current registry content.

### Tests

`src/__tests__/og-images.test.ts` now has 6 tests (was 4), all green:

- byte-identical regeneration for unchanged inputs (existing)
- one-tool edit → only that tool PNG regenerates (existing)
- category-count badge regression (existing)
- valid PNG smoke (existing)
- **NEW** cache manifest survives a fully-skipped re-run (guards the cache-wipe bug)
- **NEW** only the changed tool's hash invalidates in the cache

Full suite: 120 → 122 tests (30 files) green.

---

## Item 2 — "kill 317 SSR hub closures" → **premise disproven by measurement, rejected**

### Original plan (Phase 1 report)

"Verify/confirm `dynamic()` `ssr:false` for the 317 hub closures that still SSR" — the
assumption being that SSR-preserved closures in `DynamicModuleWrapper.tsx` cost extra per-page
build time and should be flipped to `ssr:false`.

### Verification result (2026-08-07)

An accurate balance-count scan of `DynamicModuleWrapper.tsx` found **297** (not 317) `dynamic()`
entries without `ssr:false` — all shared-hub converters (CsvHubConverter, DocumentFormatConverter,
TextTransformConverter, UnitConverter, JsonOutputConverter, FormatSerializerConverter, and the
video/audio/image-format families). Every one has an inline comment stating SSR was **deliberately
kept** for ConverterRouter render-parity during the Phase 3/4 migration.

Then measured against the Phase 1 `pagegen.tsv` (2,460 rows, real static-export timings):

| Population | n | avg render+flight | median | p95 |
|---|---|---|---|---|
| SSR-hub tool pages (297 closures) | 308 | **4791ms** | 4744ms | 8396ms |
| Other `ssr:false` tool pages | 944 | **4756ms** | 5138ms | 8184ms |

**Conclusion:** the SSR closures are NOT a measurable build cost — the two populations are
statistically identical. The ~4.5s/page cost is the shared shell (module import + RSC flight
serialization), common to all 1,272 tool pages. Flipping 297 closures to `ssr:false` would break
the documented render-parity guarantee, the structural assertion in
`registry-render-smoke.test.ts:148` (311 closure entries), and SSR HTML for 297 SEO pages — for
zero measured gain. **Rejected; the 317-closure premise is retracted. Those pages stay
SSR-preserved.**

### Revised item 2 — reduce the shared-shell cost (applies to ALL 1,272 pages)

The real lever is the per-page shell that Phase 1 attributed to named pieces:

1. `DynamicModuleWrapper` import (1,049 `dynamic()` calls) — **1,111ms**
2. `CreatePdf` module import (Node context) — **2,248ms** (top-25 slowest pages are all `/pdf/*`)
3. RSC flight serialization — where the 0.693 payload-size correlation lives (→ item 3)

Work proceeds on these below.

---

## Item 2a — `rankRelated` O(n²) related-tools sort in `ToolPageSEOContent` (DONE)

### What changed

Every one of the ~1,272 tool pages runs `rankRelated` in `ToolPageSEOContent.tsx`: a per-page,
O(n) sort over **all 1,151 tools** (same- + cross-category), where the comparator re-tokenized
the *candidate* tool on every comparison **and** rebuilt the *query* tool's word Set inside the
closure — i.e. ~1,150 × 2 regex `split`s and ~1,150 Set allocations per page, per candidate
pair. Total ≈ **~420s of build CPU** across the static export.

Fix:

- Module-scope `TOOL_WORDS: Map<slug, string[]>` — every tool's `(name + description)` is
  tokenized **once at module load** instead of once per comparator call.
- Query tool's word Set (`toolWordSet`) is hoisted **out** of `rankRelated` (one allocation per
  page instead of per candidate).
- Comparator is now a Map lookup + Set scan; the `sort()` call, filter predicates, and
  `.slice()` boundaries are byte-for-byte unchanged.

`wordsOf` is a tiny pure helper extracted to keep the tokenizer in one place. No test asserts
`allRelated` output directly (only the pure `derive*`/`categoryFaqTemplates` helpers are tested),
so the optimization is verified by the exhaustive equivalence check below.

### Before / after

| Metric | Before | After |
|---|---|---|
| `rankRelated` avg per page (5-sample) | 292ms | **16.2ms** |
| Worst-case page | 333ms (phase1) | ~18ms |
| Estimated total build CPU | ~424s | **~24s** |
| Full-registry equivalence pass (1,151 tools) | — | **0 diffs** |
| Suite | 122 tests green | 122 tests green (85.4s) |

### Full-build confirmation

`npm run build` after the change: **Compiled 5.7min, static generation 2.3min** (2460/2460 pages),
zero timeouts/retries. Phase-1 baseline on this same machine was static generation **6.6–6.8min**;
the ~4.4min drop is the `rankRelated` cost leaving the hot loop (plus a partial Next cache). The
per-page before/after above is the controlled measurement; wall-time is the end-to-end check.

### Equivalence verification (full, not sampled)

Re-ran **both** the exact pre-optimization code and the new code against the live registry for
**all 1,151 tools** and diffed the final `allRelated` slug sequences: **0 diffs**. (That pass took
436.6s to run old logic for the whole registry — itself a live demonstration of the per-build
cost being removed.) Ties in `.sort()` are preserved because the comparator returns the same
values and V8 stable-sort ordering is unchanged.

### ESLint / tests

ESLint: 0 errors, 8 pre-existing warnings (none new). Full vitest suite: **122/122 green**.

---

## Item 3 — RSC payload shrink: attribution corrected via A/B, refactor rejected on measurement (2026-08-08)

> **Correction trail (read first).** This section is written in the order the investigation ran,
> ending in a measured correction of this doc's own earlier claim. If you read only one thing:
> the corrected conclusion is in "Controlled A/B" below — **moving the SEO subtree across the
> client boundary (ReactNode prop vs server sibling) leaves the RSC flight payload identical
> (40,213 vs 40,285 chars); the prop-crossing is NOT the lever.** The ~600ms/page "causal"
> verdict and the "serialization, not render" attribution you are about to read were the
> *pre-A/B* state of the evidence, and the A/B disproved the boundary attribution. The refactor
> was rejected **on measurement**, and the trail below is exactly why it was tried and why it
> was reverted.

### The question

Phase 1 found `corr(page time, RSC bytes) = 0.693` and ~40KB RSC flight payload per tool page.
Before committing to a payload-shrink refactor, the same trap that killed item 2's original
premise had to be checked: is the 40KB payload *causing* build cost (serialization/transfer), or
just *correlated* (both scale with the same page complexity)?

### Controlled experiment (2026-08-07)

Restricted `generateStaticParams` to a 24-page sample spanning the phase-1 render-time
distribution (fast ~380ms → slow ~11s, incl. redirect pages as natural controls). Built twice
with `NEXT_PAGE_TIMING=1` instrumentation — once with the `seoSection` prop
(`<ToolPageSEOContent tool={...}/>`) intact, once with it stripped (`null`). Identical page set,
identical worker topology, only variable = the SEO subtree crossing the client boundary into
`ToolLayout`:

| Metric | With seoSection | Stripped | Delta |
|---|---|---|---|
| Mean render+flight / page | 1880ms | 1245ms | **−635ms (−34%)** |
| Median | 1700ms | 1092ms | −608ms |
| Fastest page (`bulk-ico-to-png`) | 1121ms | 720ms | −401ms |
| Slowest page (`cac-calculator`) | 4917ms | 3448ms | −1469ms |

Every one of the 24 pages dropped 30–46%, spanning the full distribution — including pages whose
only real content *is* the SEO section. The drop is roughly constant in absolute terms (~400–
700ms) regardless of page complexity, i.e. it is a **fixed per-page payload cost**, not a
complexity byproduct.

### Attribution: serialization, not render — **WRONG, corrected below (A/B)**

- Isolated `renderToString` of the SEO subtree: **46ms** (post item-2a fix)
- Build delta from stripping it: **~600ms/page**
- → *hypothesis:* ~550ms/page is **RSC flight serialization** of the subtree (the `seoSection`
  ReactNode is passed into the `"use client"` `ToolLayout`, forcing full serialization into
  flight data).

### Verdict — CAUSAL but superseded by the A/B below (read that before citing this)

**Causal.** Removing ~40KB of payload per page measurably drops render+flight time. The 0.693
correlation was real, not confounded — this is the *opposite* of item 2's retracted premise.

> ⚠️ **This verdict is about "the subtree existing in the render tree", NOT about "where it
> sits."** The A/B in the next section proved the boundary-crossing attribution wrong: with the
> SEO moved to a server sibling (no prop crossing), the flight payload was identical and render
> time was *worse*. The 0.693 correlation remains real — it just predicts that removing content
> helps, not that moving it across a client boundary does. Read on for the correction trail.

### Controlled A/B — the correction: prop-crossing is NOT the lever; refactor rejected on measurement (2026-08-08)

On 2026-08-08 the refactor was actually implemented (render `<ToolPageSEOContent>` as a server
sibling of `ToolLayout` instead of passing it as the `seoSection` ReactNode prop) and verified
with a **controlled A/B on the same 24-page sample and same machine state**: two back-to-back
full instrumented builds, only variable = prop crossing vs server sibling.

| Build (same sample, same host, back-to-back) | mean render+flight/page | median |
|---|---|---|
| CONTROL — `seoSection` prop crossing client boundary | 1429ms | 1236ms |
| REFACTOR — SEO as server sibling of `ToolLayout` | 1949ms | 1826ms |

**The refactor did not remove the SEO subtree from the RSC flight payload at all.** Flight
payload for the same page (`/pdf/create-pdf`) was 40,213 chars (control) vs 40,285 chars
(refactor) — identical within noise, and every probe string ("Similar Tools You Might Need",
"How to Use …") was present in the flight data in BOTH builds. The refactor build was even
*slower* (mean +520ms, page span 26.9s vs 21.2s), i.e. machine-load-level noise, not a win.

**Why:** Next.js RSC serializes the *entire* server-rendered tree into the flight payload
regardless of whether a subtree crosses into a client component — the client needs the full
tree to hydrate. The `seoSection` prop vs sibling distinction is not a serialization boundary.
The ~600ms/page delta in the stripped experiment above came from **removing the subtree from
the tree entirely** (render + serialization both gone), not from changing *where* it sits.

This is the same correlation/causation trap that killed item 2: the stripped-vs-present
experiment was causal for "content present at all", and the *attribution* to the client
boundary (this doc's earlier "forcing full serialization into flight data" claim) was wrong.

### Why the refactor was rejected (supersedes "deferred")

Rendered as a sibling, the SEO section also moves **outside** ToolLayout's `<main>` column
(DOM-order change: it drops out of the 960px column flow and the section ordering) with **zero
measured build benefit**. Landing a DOM-order change with no payload reduction fails the tier's
causation bar. The only way to actually reclaim the ~600ms/page is to remove the SEO content
from the render tree entirely (stripped experiment), which is not a real option — it is the
page's SEO content. **Item 3 is therefore REJECTED, not deferred.** The earlier verdict
("Causal") stands for the *experiment* but the *fix* it pointed to does not exist.

The higher-value next action remains **item 4 (off-path TS)**, blocked by the free-plan
branch-protection wall (see below).

---

## Acceptance check — current wall time vs the 5-min single-tool-change target (measured 2026-08-07)

Three builds instrumented and timed on the local machine (same as all phase-1/phase-2 baselines):
a cold full build and a warm single-tool-change build (one character appended to `create-pdf`
description), plus the earlier pre-experiment build.

| Build | gen:og | compile | TypeScript | static-gen | total wall | timeouts |
|---|---|---|---|---|---|---|
| Pre-experiment (current code) | ~0.6s | 5.7min | — | 2.3min | ~8min | 0 |
| #1 cold (`rm -rf .next`) | 2.6s | 116s | 3.9min | 2.3min | 8:24 | 0 |
| #2 warm single-tool change | 2.6s | 2.4min | 3.9min | 2.2min | 10:09 | 0 |

**Result: not under the 5-min single-tool-change target on this machine (~10 min wall).** The
5-min target is not hit. Remaining cost is dominated by **two things outside items 1/2a/3**:

1. **TypeScript check — 3.9 min** (phase 1 item 4: "move TS check off the critical path",
   `typescript.ignoreBuildErrors` + a separate CI gate). This is now the *single largest*
   remaining lever.
2. Compile 2.4min (Turbopack) + static-gen 2.2min.

Item 3 is **rejected** (see above — the refactor was A/B-tested and the attribution corrected:
prop-crossing is not a serialization lever, identical payload), so the next highest-value
action is **item 4 (off-path TS)**, which is blocked by the free-plan branch-protection wall.

### Production single-tool-change population (CF Pages deploy records, pulled 2026-08-08)

The user pushed back on a local-only closeout: production builds range 123–476s, so some of the
125 deploys exceed 5 min. The acceptance population was re-checked against the **actual
production build history** — all 322 production deployments of the `toolzum` Pages project
(CF OAuth via wrangler; env=production; per_page max 20, paginated) filtered to the Jul 20 –
Aug 6, 2026 window (140 deploys) and to the **single-file, tool-code-change** builds (31), i.e.
the real "change one tool and redeploy" population:

| Population (Jul20–Aug6, success) | n | median | p90 | max | under 5 min |
|---|---|---|---|---|---|
| **single-file tool-code builds (acceptance)** | 31 | 249s | 343s | 476s | 26/31 = **83.9%** |
| all single-file | 33 | 249s | 368s | 476s | 81.8% |
| multi-file | 95 | 247s | 307s | 393s | 85.3% |
| all success builds | 129 | 247s | 325s | 476s | 84.5% |
| docs/infra-only single-file | 2 | 317s | — | 452s | 50.0% |

**Verdict: ~84% of production single-tool-change builds complete under 5 min (median 4:09), but
~16% exceed it (p90 5:43, max 7:56).** The 5-min target is *approximated but not met* on real
production hardware either — the same conclusion as the local build, with the same dominant cost
(TS 3.9min in-build + compile + static-gen). This is the honest acceptance picture: the tier's
proven wins (items 1/2a) held wall time at its historical ~8 min and removed the 60s-timeout
risk that started the tier, but the remaining 5-min gap is item 4's TS phase, which is blocked
by the free-plan branch-protection wall. Raw data: `/tmp/cf-all.json`, `/tmp/cf-window.json`,
`/tmp/window-commits.txt`, `/tmp/window-single-files.txt`.

---

## Item 4 — off-path TypeScript: **rejected on safety grounds (platform blocker)**

### What was planned

Split the TS check out of the build (`typescript.ignoreBuildErrors: true` in `next.config.ts`)
and gate it via a separate parallel `tsc --noEmit` CI job, so the 3.9 min in-build TS phase
leaves the critical path. Sequencing rule: (1) add parallel CI gate → (2) confirm the gate is a
**required** PR check (branch protection) → (3) only then set `ignoreBuildErrors`.

### What was found (2026-08-07)

1. **Branch protection is unavailable on this account.** Repo `kvRathore-star/Toolzum` is a
   private repo on the **GitHub free plan**. The API returns
   `403: Upgrade to GitHub Pro or make this repository public to enable this feature` for
   `GET /branches/main/protection`. I have `admin` permissions, but the feature does not exist
   on this plan. **No check can ever be made "required"** → step 2 of the sequencing rule is
   unsatisfiable. Per the rule, step 3 (`ignoreBuildErrors: true`) must therefore **not** be
   applied — flipping it would create the exact silent hole the rule exists to prevent.
2. **CI has been failing at Lint on every push** (at least 2026-07-31 → 2026-08-06, last 5 runs
   all `failure`, `quality` job → Lint step). Local `npm run lint` exits with **62 errors**
   (all `react-hooks/set-state-in-effect`) + 2411 warnings. These errors are a **frozen/unrelated
   set carried from Tier 1.1's scope** ("no tier, pick up separately") — NOT to be fixed as a
   rider on this performance tier. Because lint already fails, the CI `TypeCheck` step is never
   even reached today, so CI is *not* currently gating anything — which is exactly why we must
   not add a second permanent, non-gateable weak point (`ignoreBuildErrors`) on top of a
   temporarily broken gate.
3. **The 3.9 min TS phase is in-build** (`next build`), so a CI-side parallel tsc job would NOT
   remove it from local/production build wall time anyway. The win only existed if step 3
   (`ignoreBuildErrors`) could be safely landed, which it cannot.

### What shipped instead

`.github/workflows/ci.yml` restructured: the single serial `quality` job (Lint → TypeCheck →
Test → Audit → Build) is split into **two parallel jobs** — `quality` (Lint, TypeCheck, Test,
Security Audit) and `build`. `tsc --noEmit --strict` now runs concurrently with the build on
CI runners instead of blocking it, for whatever marginal CI benefit that yields. **In-build TS
checking stays ON** (no `ignoreBuildErrors`).

### Known limitations recorded for future readers

- **Branch protection:** upgrade GitHub plan or make repo public before any `ignoreBuildErrors`
  sequencing can proceed. Until then the rule is: never set `ignoreBuildErrors`.
- **Lint:** the 62 `set-state-in-effect` errors are a pre-existing, frozen backlog (Tier 1.1
  carry-over). Fixing them is its own tier, not a rider here. Until they're fixed, CI's Lint
  step will fail and no CI check is meaningful as a merge gate.

