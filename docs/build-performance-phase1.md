# Build Performance Diagnosis — Phase 1 Report

> Tier 3 / performance (Performance/build task, target 62 → 80+). Phase 1 = measure and explain
> the full `npm run build` pipeline before proposing any fixes. Data captured 2026-08-07 from
> instrumented local builds (Next.js 16.2.6, static export to Cloudflare Pages).

## Discrepancy reconciliation (added 2026-08-07, pre-Phase 2)

> This section resolves the gap between the **original complaint** (25+ min builds, 60s per-page
> timeouts, retries) and the **measured baseline** below (~11 min wall, zero timeouts). Phase 2
> must not start until this is read.

### Finding 1 — the "60s timeout / retries" mechanism is real and is Next's default

Next 16.2.6 ships `staticPageGenerationTimeout: 60` (default) with a **3-attempt retry** in the
export worker. When a page exceeds the timeout, it logs **exactly** the message from the original
complaint:

```
Failed to build /[category]/[tool]/page: /pdf/create-pdf (attempt 1 of 3)
because it took more than 60 seconds. Retrying again shortly.
```

Verified by reproduction: temporarily setting `staticPageGenerationTimeout: 8` locally produced
**96 pages hitting the timeout + 96 extra re-renders**, serial page time 103.5 → 118.1 min
(+14.6 min just from retries), wall 6.8 → 7.5 min. The mechanism exists, is deterministic, and
is not a config mistake in this repo (it was never overridden — it is Next's shipped default).
Config was restored after the test (`git status` clean).

### Finding 2 — production (Cloudflare Pages) has never built 25+ min

Pulled all 125 deployments of the `toolzum` Pages project (Jul 20 – Aug 6, 2026) via the CF API:
**build stage 123–476s (2–8 min) across every deploy — no 25+ min build, no timeout/retry
failure.** The two `failure` deployments were hard build *errors* (TypeScript/compile, at 123s
and 304s), not static-generation timeouts. Production builds already run `npm run build`
(build_command confirmed on the project). So the 25-min number is not from production, and it is
not reproduced by production's real build environment.

### Finding 3 — local also never hits the 60s threshold

This machine (4 cores / 8 GB) is *slower* than Cloudflare's Pages build machines, yet the max
per-page time measured was **14.3s** (PDF pages) across two full instrumented builds. Nothing
approaches 60s locally, so zero timeouts here is expected, not coincidental.

### Finding 4 — the 25+ min number exists nowhere in the repo

No mention of "25 min", build timeouts, or retries in `git log`, `docs/`, AGENTS.md, ROADMAP.md,
or README. It is not attributable to any merged change.

### Verdict

- **Confirmed real:** the 60s per-page timeout + 3-attempt retry is a live, built-in Next
  mechanism whose exact log line matches the complaint. It fires when any one page's render
  exceeds the threshold.
- **Not reproducible in either measured environment:** local (max 14.3s/page) and production
  (2–8 min per build) both stay far below it. Production's own build history proves the current
  codebase builds in ~2–8 min on CF's machines.
- **Most likely origin of the original report:** a resource-constrained build host **other than**
  this Mac or CF Pages — most plausibly GitHub Actions CI (`ubuntu-latest`, 2 vCPU / 7 GB, runs
  `npm run build` on every push/PR), where the same 2,460 pages under 3-worker × 8-concurrency
  (= 27 concurrent heavy renders) on half the cores could push the 14.3s PDF-family pages across
  the 60s line, triggering the retries and ballooning wall time. CI is the only build environment
  we could not query (private repo) or fully simulate (qemu/vz unavailable on macOS 12.6-12.7).
- **Recommendation before Phase 2:** confirm/observe one GitHub Actions `npm run build` wall-time
  (or run the same build on any 2-vCPU host) so the baseline reflects the environment that
  produced the complaint. The Phase 2 candidates below are *not* invalidated — they attack the
  same dominant cost (render+RSC flight) that both scales the 60s risk down and shortens CI wall
  time — but they should be validated against that environment's numbers, and `prerenderEarlyExit`
  / `staticGenerationMaxConcurrency` / `staticPageGenerationTimeout` knobs should be considered
  for the constrained host.

## TL;DR

- Full build: **~11 min wall** — OG images ~115–140s (serialized), compile 2.1–2.3min, TypeScript
  3.3min, **static generation 6.6–6.8min**.
- Static generation is the tail. 2,460 export paths, **103.5 min of serial page-render time**
  compressed to 6.8 min by 3 workers. The 60s per-page timeout/retry lines were **not observed**
  in clean local runs — the mechanism is real (Next default, reproduced deliberately; see the
  reconciliation section above) but no page crosses 60s on this hardware (max 14.3s).
- **97% of serial render time is the 1,272 real tool HTML pages (~4.7s each avg).** Redirect and
  static pages are ~0.4–1s. opengraph-image SVG routes (1,151) are negligible (avg 0.13s).
- Instrumentation inside Next's export worker proves the cost is the **render + RSC flight
  phase** (avg 4.57s/page), not component loading (avg 0.045s) and not file I/O.
- Root-cause hypothesis: real tool pages render the **full server shell** (RootLayout + Header +
  megamenu) and the tool's client module is pulled in during SSR, while redirect/permalink pages
  bail early via `permanentRedirect()`.

## Build timeline (instrumented, macOS local, M-series)

| Phase | Run 1 (`build-tier3.log`) | Run 2 (`build-phase2.log`) |
|---|---|---|
| OG images (`gen:og`, serialized) | 114.9s (~98ms/img) | 140.3s (~122ms/img) |
| Webpack compile | 2.1min | 2.3min |
| TypeScript check | 3.3min | ~3.3min |
| Sitemap gen (`generate-sitemap.js`) | 1,104 URLs | 1,104 URLs |
| Static generation | 6.6min (2,460/2,460) | 6.8min (2,460/2,460) |
| Timeout/retry lines | **0** | **0** |

Difference between runs (OG 115s → 140s, pages shift) is machine load; the two runs agree on
structure.

## Path inventory

`npm run build` exports **2,463 paths** (~2,400 as claimed), reconciled by counting route params:

| Path class | Count | Export cost |
|---|---|---|
| Tool HTML pages `/[category]/[tool]` | 1,252 (1,272 export pages incl. permalinks) | **avg 4.70s → 99.7min serial (97%)** |
| opengraph-image.svg routes | 1,151 | avg 0.13s → 152s serial |
| Category pages | 21 | — |
| Blog posts | 9 | — |
| Static (root, pricing, about, …) | ~30 | avg ~0.8s |
| **Total** | **2,463** | **103.1–103.5min serial / 6.8min wall** |

Sources: `toolsRegistry.length` 1,151 (unique slugs), `TOOL_REDIRECTS` 145 keys (82 remain after
Phase 4), `SEO_PERMUTATIONS` 82.

## Per-page distribution (2,460 rows, `PAGEGEN` instrumentation)

- serial sum **103.1 min**, mean 2.46s, **median 0.47s**, p95 6.56s, p99 7.94s, max 14.30s.
- **55% of pages < 1s**, ~30% at 4–6s, 8 pages > 10s.
- Bimodal shape = two populations: fast redirect/static pages vs. full-render tool pages.
- corr(page time, HTML+RSC bytes) = 0.525; corr(page time, RSC bytes) = **0.693** — output size
  tracks render cost.

### Fast vs. slow — the signal

| Population | Avg | RSC payload |
|---|---|---|
| Redirect/permalink tool pages (e.g. `reverse-text-generator` → `text-reverser`, `bulk-jpg-to-gif` w/ `parentSlug`) | ~0.4s | ~17KB |
| Real tool pages (full server shell) | **~4.7s** | ~36KB |

Redirect pages bail via `permanentRedirect()` in `src/app/[category]/[tool]/page.tsx` before the
tool renders; real pages render the entire RootLayout + Header. This is the fastest page in the
build (`rule-of-three-calculator` 379ms) vs. the slowest family (PDF pages, 12.6–14.3s).

## Where the time goes (worker instrumentation)

Three export workers, `staticGenerationMaxConcurrency ?? 8` each → peak **27 concurrent** page
exports, effective parallelism **15.18×**, export window 409s.

Instrumented `node_modules/next/dist/export/worker.js` (`[PHASE]` markers, env-gated by
`NEXT_PAGE_TIMING`):

| Phase | Avg |
|---|---|
| `loadComponents` (load page.js/layout.js via node loader) | 0.045s |
| `render + flush` (React render to RSC flight + read the stream) | **4.57s** |

The render+flight phase is the bottleneck. Component load and stream I/O are ~2 orders of
magnitude cheaper.

### What the render phase actually costs (isolated microbenchmarks)

| Piece | Measured |
|---|---|
| `ToolPageSEOContent` `renderToString` (incl. `rankRelated` simulation) | ~300–650ms |
| Full `ToolLayout` render | ~280–370ms |
| `DynamicModuleWrapper` import (1,049 `dynamic()` calls) | 1,111ms |
| `CreatePdf` module import (Node context) | 2,248ms |
| `Header` import | 1,237ms |
| `buildMegamenuColumns` (per render) | 3.8ms |
| `generateMetadata` description strings | ~0.0ms |
| `getCachedToolCounts` | fast |

Sum of isolated pieces (< 2s) is well under the observed 4.57s — the remainder is Next's full
RSC flight pipeline (serializing the root shell + all dynamic module payloads + static analysis
strings), which is not directly attributable to one component. That split is enough to act on.

## Slowest routes / families

The top-25 slowest pages are all `/pdf/*` (create-pdf, pdf-info, pdf-cleanup, …) at 12.6–14.3s.
Near-identical timings within a family are **batch CPU-contention artifacts** (alphabetically
adjacent pages share a worker burst), not per-family cost — e.g. 8 PDF pages all land in the
first batch at ~14.3s in run 1, ~12.6s in run 2.

Timing clusters (≥3 pages within 50ms): PDF 8×, health calculators 8×, audio converters 8×,
csv/format converters 8×, webhook/openapi 32×, bulk-* 16×, text/markdown 16×, etc. — i.e. many
clusters, confirming most tool pages render the same ~4.7s shell cost.

## Known pre-existing gaps (logged, not part of this phase)

- `docs/depth-audit-followups.md` **#4**: 8 registry tools have no committed OG PNGs (they were
  generated this run and now show as modified/untracked).
- `docs/depth-audit-followups.md` **#4b**: `gen:og` rewrites all `public/og/**` PNGs every build
  (~1,150 modified files in `git status` after each build). Observed live again this run.
- `docs/codebase-audit.md` P1 (`<img>` everywhere — no next/image), P9 (2417-line `tools.ts`
  loaded via layout import) remain open from the audit.

## Optimization candidates (Phase 2 — NOT started, per plan)

1. **Parallelize OG generation** — 1,151 images at ~100ms serialized = ~115–140s. Run in
   parallel workers (expect ~10–15s) and/or add skip-if-unchanged content hashing (fixes #4b too).
2. **Cut the per-page shell cost** — the ~4.5s render+flight for 1,272 tool pages dominates.
   Levers, in expected ROI order:
   - Verify/confirm `dynamic()` `ssr:false` for the 317 hub closures that still SSR.
   - Avoid importing the client tool module during SSR (lazy/`ssr:false` at the render boundary,
     not just the registry closure).
   - Shrink the RSC payload (32KB of static-analysis/SEO strings per tool page) — feeds the
     0.693 size correlation.
3. **Move TypeScript check off the critical path** (3.3min) if CI can gate it separately.
4. **Re-check `toolsRegistry.length`-broad sites** still iterating all 1,151 tools per page:
   `src/app/layout.tsx:22`, `src/components/tools/ToolLayout.tsx:35`, `src/app/pricing/layout.tsx:4`,
   `src/app/changelog/page.tsx:210,218`, `src/registry/tools-helpers.ts:29` — some are
   `ssr:false`-protected already; confirm each is inert at build time.

## Data artifacts

- `/tmp/build-tier3.log` — run 1 (no phase markers, has PAGEGEN).
- `/tmp/build-phase2.log` — run 2 (phase markers + PAGEGEN), authoritative.
- `/tmp/pagegen.tsv` — 2,460 rows: `path\tms\tbytes\trscBytes`.
- Analysis scripts (plain Node, no deps): `/tmp/analyze.mjs`, `/tmp/analyze2.mjs`,
  `/tmp/families.mjs`, `/tmp/batchanalysis.mjs`, `/tmp/final2.mjs`, `/tmp/phase3.mjs`,
  `/tmp/timeline.mjs`, `/tmp/rsc-correlate.mjs`.

> Next: Phase 2 (implementation of the candidates above) is **blocked pending review** of this
> report. Worker instrumentation lives in `node_modules/next/dist/export/worker.js` and is
> env-gated by `NEXT_PAGE_TIMING` — it is wiped by `npm install` and must be re-applied if more
> instrumentation runs are needed.
