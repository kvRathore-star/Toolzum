# Toolzum Scorecard

House style: every number states what was *actually measured or checked* versus what is still
assumed. Scope boundaries are called out per dimension so a later pass cannot re-inflate a score
off an aspirational target. Updates are commit-linked.

## Baseline (2026-07-31)

| Dimension | Score | Notes |
|---|---|---|
| Tool breadth | 95 | 1,151 tools, 21 categories |
| SEO foundation | 88 | OG gen, sitemap, per-tool SEO content, good taxonomy |
| Deployment/CI | 85 | Auto-deploy Pages, full clean build on every push |
| Architecture (registry) | 78 | Chunked registry + dynamic imports is smart; but routing resolution was split across 3 mechanisms (MODULE_REGISTRY, ConverterRouter, converterConfig) that drifted |
| Code quality | 70 | Typecheck+lint+tests clean; but inconsistencies surfaced (one-way "converters", orphaned components, 9 dead slugs) |
| Depth/functionality | 68 | Many tools are real (FFmpeg, vcard-parser); several were thin/stub (csv-formatter 5-row preview), hidden instead of fixed |
| Performance/build | 62 | 60s-per-page timeouts, 25+ min build, page-gen retries |
| Security/privacy | 74 | Client-side processing mostly; FFmpeg CDN/CSP had real issues (fixed) |
| Testing | 55 | 16 tests for 1,151 tools |
| Maintainability | 60 | Every tool add/rename regenerates 1,100+ OG files; no change-detection |

## Update (2026-08-08)

| Dimension | Jul 31 | Now | Evidence / scope boundary |
|---|---|---|---|
| Depth | 68 | **80** | Commits `7660543..985bfb6` (7). 2 confirmed-fake tools rewired to real backends (bulk-url-status-checker, PodcastTranscription) w/ contract tests; honest copy downgrades on 3 more; 1 dead stub consolidated; registry-wide structural integrity verified (no orphans/dead routes). Scope note — the functional depth audit itself covered **~5 flagged tools out of 1,151** via one heuristic (`description === seoDescription` in `scan.test.ts`), not the full catalog; remaining candidates (pdf-ai-summariser OCR copy, 4 markdown tools) logged in `docs/depth-audit-followups.md`. |
| Testing | 55 (→72) | **80** | Baseline 55 (16 tests); reached 72 as the first og-images tests landed, then 80 on commits `7660543..985bfb6`. +26 contract/behavioral tests (og-images, url-status parsing/chunking, transcribe POST contract, csv-output-modes) — real behavioral tests, not render-smoke. Residual gap unchanged: no browser-level E2E (Playwright). |
| Performance/build | 62 | **70** | Commits `0bffdad` + `efa3b5c`. Proven wins: OG skip-if-unchanged + parallel pool (warm ~0.6s, zero PNG churn vs 1,100+/build before), `rankRelated` O(n²) → O(n) (−420s build CPU, 0 output diffs), CI quality/build split. Zero timeouts in all 322 production deploys (the 60s page-gen timeout risk that opened the tier is gone). Measured reality, not target: production single-tool-change builds median **4:09**, p90 **5:43**, max **7:56**, **83.9% under the 5-min target** (n=31, CF Pages deploy records Jul 20–Aug 6); local warm single-tool change ~10 min. The 5-min target is therefore *approximated but not met*. Item 3 (RSC payload refactor) rejected on A/B measurement — prop-crossing is not a serialization boundary (payload 40,213 vs 40,285 chars identical). Item 4 (off-path TS, the single largest remaining lever) blocked by free-plan branch-protection 403. Full trail: `docs/build-performance-phase1.md`, `docs/build-performance-phase2.md`. |
| Maintainability | 60 | **75** | Commits `0bffdad` + `efa3b5c`. Root cause of the OG churn removed (not masked): content-hash cache manifest with `TEMPLATE_VERSION` invalidation + concurrency pool; 2 new regression tests assert the exact failure scenario (edit one tool → exactly one PNG changes; add tools to a different category → zero existing PNGs change). Minor flagged risk, not blocker: the manual `1,000+` footer is intentionally hardcoded (with comment) and can go stale like the old `277+` did — needs a periodic manual bump, not automation. |
| Code quality | 78 | **80** | Commits `c28c661` + `96f0180` (2026-08-08). The 62-error lint set that previously capped this dimension was **frozen carry-over**; with all `react-hooks/set-state-in-effect` errors resolved (13 genuine fixes + 40 scoped disables, each with a stated reason), the CI lint step and pre-push hook are real gates again. `tsc --noEmit --strict` clean; 123/123 tests. 2,411 warnings remain — scope-bound out, not a regression. |

## Cross-Tier Review & Scorecard Verification Sweep (2026-08-08)

Full re-verification of every dimension against current repo state + interaction check between
the four landed tiers. **Last full review: 2026-08-08 (commit `d57ff94` + this sweep).**

### Phase 1 — cross-tier interaction check

| Check | Result |
|---|---|
| Full test suite (authoritative count) | **30 files / 123 tests / 123 passed.** (Historical quotes 38/38, 60/60 were intermediate snapshots; 123 includes the new orphan-prune test.) |
| gen:og + test suite together | Warm cache: **0/1172 rendered, 0.3s, zero new churn**; suite green after. Maintainability × Performance holds. |
| OG cache × Depth tool changes | Manifest is self-healing (0 stale manifest entries, 0 misses — every live slug has a current PNG). **113 stale tracked PNGs (~6MB) removed (2026-08-08)** via `pruneOrphanedImages` harden in `generateAll` + regression test. Logged `6a`, now fixed. |
| Routing/registry × rankRelated/OG | Single `toolsRegistry` source of truth shared by both pipelines (same module instance); no shared mutable state, no import cycles. `MODULE_REGISTRY` is the separate routing surface, guarded by `registry-integrity` #9 (17 tests). No divergence found. |
| `og-cache.json` tracking | **Doc contradiction resolved (2026-08-08):** phase2 doc claimed "git-tracked, portable" but the file is untracked. Claim corrected with dated note. **Decision: manifest stays untracked** (build artifact; CF runs `gen:og` during build anyway, so committing would not warm CI and would churn the repo). Production acceptance numbers predate Item 1 and were measured with no cache — already conservative, no score revision. Logged `6b`, now closed. |

### Phase 2 — re-verified stale dimensions

| Dimension | Verdict | Evidence |
|---|---|---|
| Code quality (80) | **Raised (78 → 80)** | `tsc --noEmit --strict` clean. **Lint: 62 errors → 0** (2026-08-08, commits `c28c661`+`96f0180`) — all `react-hooks/set-state-in-effect` resolved (13 genuine fixes, 40 scoped disables with stated reasons); CI lint step green again, pre-push hook gates lint+typecheck+test. 2,411 warnings remain (scoped out, not a regression). ConverterRouter/converterConfig/ConverterCategory retired (empty `find`). 9 dead slugs → `TOOL_REDIRECTS`. Zero orphan components (registry-integrity #9, 17/17 green). |
| Security (78) | **Confirmed, 2 findings (both fixed 2026-08-08)** | CSP coherent (allows exactly the CDNs tools load: unpkg/jsdelivr for FFmpeg WASM + pdf.js workers). `url-status-check.ts`: robust — http/https-only SSRF filter, 2048-char cap, dedup, 45-URL limit, subrequest budget (45/50), 8s timeout, D1 rate limit (15/min/IP). `transcribe.ts`: **6d FIXED** — added 50MB upload cap (413) + chunked 32KB base64 (no unbounded spread); **6e FIXED** — `GEMINI_API_KEY` documented in `.env.example`. |
| UX consistency (72) | **Confirmed** | csv-formatter consolidated to `CsvHubConverter` fallback (hub intact); copy downgrades landed (transcription tools, bulk-url-status-checker); Design B lossy redirects fully resolved in Phase 4. No new duplicates. |
| SEO foundation (88) | **Confirmed** | Sitemap 2,208 URLs; the 82 registry slugs absent are all `SEO_PERMUTATIONS` `parentSlug` redirects (301 → hub, correctly omitted). 0 visible tools missing using the generator's own slugify. Per-tool SEO content + OG intact. |
| Deployment/CI (85) | **Confirmed** | CI workflow (quality+build parallel) present; last push deployed clean; zero build timeouts across 322 production deploys. |
| Breadth (95) | **Confirmed** | **1,151 tools, 21 categories** (live registry). |

### Phase 3 — Depth full-catalog gap

Broader heuristics run: short-file (<3KB → 35, all real thin wrappers), stub-language scan
(`coming soon|stub|placeholder` → 14, all false positives — placeholder *generators* and
`background-remover`, which is a redirect to `ai-bg-changer`). **No new functional gaps.** The
`description === seoDescription` heuristic remains the only productive one (5 known cosmetic
candidates, logged `docs/depth-audit-followups.md` #1/#2). **Decision: accept current scope** —
structural gate (every MODULE_REGISTRY slug renders; zero orphans) + description-identity
heuristic is the accepted coverage; full manual 1,151-tool audit not cost-justified. Recorded
`docs/depth-audit-followups.md` §6g.

### Findings resolution (2026-08-08 same-day follow-up)

6a–6g in `docs/depth-audit-followups.md` §6: **6a FIXED** (orphan PNG cleanup via
`pruneOrphanedImages` + regression test; 113 stale files removed, repo self-cleans now);
**6b CLOSED** (doc claim corrected; manifest stays untracked by decision; no score revision);
**6c logged** (registry×OG test guard still open — 6a's regression test partially covers it);
**6d FIXED** (50MB cap + chunked base64 — was HIGH-severity DoS surface);
**6e FIXED** (`GEMINI_API_KEY` documented in `.env.example`);
**6f non-issue confirmed**; **6g Depth scope decision recorded**.

### Lint-debt resolution (2026-08-08, commit `c28c661`, pushed)

All 62 `react-hooks/set-state-in-effect` errors resolved and the CI lint gate is green.

| Category | Count | Fix |
|---|---|---|
| (a) State-deriving effects → `useMemo` | 5 | RegexTester, TextStylingConverter (ZalgoView), GstInvoiceGenerator (totals), AudioMerger (total duration); CpmCalculator converted to render-time adjustment (`setPrevPlatform` idiom) instead of an effect |
| (a) Reset-on-state/prop-change → `key` remount / event-handler reset | 8 | AesTool, Base64ImageTool, PdfSecurityTool, AnimationConverter, TextHtmlTool (`key={defaultMode}` at mount sites incl. `DynamicModuleWrapper`); XlsxCsvConverter (`switchDirection` handler), ToolsDirectoryClient (page reset folded into filter handlers), UuidGenerator (lazy init + regenerate handlers) |
| (b) Legitimate-but-flagged → scoped `// eslint-disable-next-line react-hooks/set-state-in-effect -- <reason>` | 40 | localStorage hydration on mount, browser feature-detection, event/subscription setup, object-URL lifecycle — each with an inline justification comment |
| Shared-hook consolidation | 2 new hooks | `src/hooks/useUsageCounter.ts` (8 daily/monthly usage blocks), `src/hooks/useIsIndia.ts` (4 geo blocks) — each carries 1 scoped disable internally |

**Measured:** `eslint . --format json` errors **62 → 0** (intermediate: 53 after Step 1–2, 48 after 4a, 40 after 4b). `tsc --noEmit --strict` clean. Full suite **30 files / 123 tests / 123 passed** including the full-registry render smoke test. The 2,411 pre-existing warnings (no-unused-vars / no-explicit-any / no-console) were intentionally untouched per scope.

**Decision recorded — `UuidGenerator` (was flagged borderline (a)/(b), explicitly decided, not silently reclassified):** treated as **(a)** via lazy `useState` initializer + regenerate-in-handlers, not a scoped disable. Rationale: `uuids` is a pure function of `[version, quantity, uppercase, hyphens]` — auto-gen-on-mount and auto-regenerate-on-option-change are the derived-value pattern (the existing effect was a state-derivation-in-effect), so the idiomatic fix is deriving at init + on input change, which also preserves the per-change toast. A disable would have left a known anti-pattern in place.

**Gate re-enabled:** CI `quality` job's Lint step (`.github/workflows/ci.yml`) now passes and is again meaningful as a merge gate; local `pre-push` hook extended to `npm run lint && npm run typecheck && npm run test`.

## Residual risks (2026-08-09 triage)

Each open item below is now in one of three honest states: **closed (accepted constraint)**,
**triaged + sized**, or **deliberately parked**. Nothing here is silently carried forward.

### 1. Performance/build gate — CLOSED (accepted constraint)

The in-build TS phase (~3.9 min) only leaves the critical path via `ignoreBuildErrors`, which the
CI requires a protected-branch status check for. That gate is genuinely unavailable, not merely
unconfigured: this repo is **private**, and GitHub Free branch protection applies only to **public**
repos (protected branches on private repos require Pro/Team). Re-verified 2026-08-09 via the
GitHub API (unauthenticated repo lookup returns 404 ⇒ private) + GitHub Free plan docs.
Alternatives considered: merge queue (requires the same protected-branch prerequisite on Free),
CODEOWNERS-based required review (also a protected-branch feature). None substitute on Free.

**Accepted final state:** pre-push hook (`lint && typecheck && test`) + CI `quality` job (lint +
typecheck) are the enforced gates; they run on every push and merge. `ignoreBuildErrors` must
**never** be set until a branch-protection gate exists (move to Pro/Team, or make the repo public).
This risk is now a documented, deliberate tradeoff — not an oversight.

### 2. Warnings backlog — TRIAGED + SIZED (not fixed, per scope)

Recounted 2026-08-09 with the CI-equivalent invocation (bare `eslint --format json`): **2,418**
warnings (the previously quoted 2,411 came from `eslint .`; the 7-warning delta is a
counting-scope difference — both represent the same backlog, errors remain at zero).

| Bucket | Count | Location | Verdict |
|---|---|---|---|
| `no-unused-vars` + `@typescript-eslint/no-unused-vars` | 1,543 | 1,441 src / 72 scripts / 4 functions / 26 public | Mostly mechanical — the dominant pattern is a never-used handler arg (`'request' is defined but never used`, `argsIgnorePattern` is `^_` so args lacking the `_` prefix trip it) plus `assigned but never used` locals. Spot-checked: arg-prefix or removal is safe; the `assigned but never used` ones need a 5-second confirm that removal has no side effects. |
| `@typescript-eslint/no-explicit-any` | 276 | src + scripts (generate-og-images, _middleware, geo-country, Api*Tools) | Needs judgment per site — real typing work, not autofix. |
| `no-console` | 205 | **195 in `scripts/`** (legit CLI/audit logging), 10 in src | 195 of these should be a **config override** (`scripts/**` already has one for require; add `no-console: off` there) — zero code changes. The 10 in src are judgment (warn/error are already allowed; these are `log`). |
| `no-unused-expressions` | 78 | 74 in `public/` (generated sw.js/workbox) | Config fix — add `public/**` to `globalIgnores`. These are generated PWA artifacts, not source. |
| `@next/next/no-img-element` | 68 | src | Semi-mechanical — most are `<img>`→`next/image`; a few (canvas/blob-drawn previews in Ai*Tools) need judgment. |
| `react/no-unescaped-entities` | 72 | src | Mechanical escape; low risk. |
| react-hooks family (exhaustive-deps / static-components / refs / purity / immutability / preserve-manual-memoization) | 170 | src | Needs judgment per site — these flag real behavior, must not be blind-autofixed. |
| `jsx-a11y/alt-text` + `import/no-anonymous-default-export` | 6 | src | Trivial/mechanical. |
| **Total** | **2,418** | — | — |

Top offenders by file: `MiscNumberMathTools.tsx` (92), `MiscDateTimeAndConverterTools.tsx` (55),
`MiscHealthTools.tsx` (43), `generateToolDescription.ts` (42), `Generators.tsx` (41),
`TextSeoTools.tsx` (37), `RentalAgreementGenerator.tsx` (32), `ApiRestTools.tsx` (28) —
unused-vars dominates in these; scripts/quality-audit.js (62) is mostly console + unused-vars.

**Size estimate for a real pass (not done — triage only):**
- ~30 min of config-only wins: `public/**` ignore + `scripts/**` no-console → removes ~295
  (~100 public artifacts + ~195 script consoles), zero code risk.
- ~2–3 hrs mechanical: arg-prefix/removal for unused-vars in src, unescaped-entities, alt-text,
  remaining no-unused-expressions.
- ~5–8 hrs judgment: remaining src unused-vars, `no-explicit-any` (276), react-hooks family (170),
  no-img-element (68) — each needs read-and-decide, with typecheck+test re-runs.
- **Total realistic: ~10–14 hrs / 1.5–2 focused days**, green build maintained throughout.
Full backlog records: `/tmp/lint-warn-ci.json` (per-run artifact; regenerate with
`npx eslint --format json` — do not commit).

### 3. E2E + full-catalog Depth audit — PARKED (deliberate)

These need dedicated future sessions and are not foldable into the above:
- **No browser-level E2E** (Playwright): only 30 files / 123 tests, all contract/behavioral +
  render-smoke; zero browser automation. Worth a dedicated session, not a drive-by add.
- **Full 1,151-tool functional audit**: the productive heuristic (`description === seoDescription`)
  covers ~5 flagged tools; the structural gate (every MODULE_REGISTRY slug renders, zero orphans)
  is accepted coverage. A full manual catalog audit is not cost-justified today — re-evaluate if a
  tool regresses to stub-like behavior.
- Both tracked in `docs/depth-audit-followups.md`; do not re-open during routine tool work.

## Operational notes

### 2026-08-18 — synthetic `download_usage` test row from quota E2E

Live browser E2E of the download-quota flow (badge → decrement → modal at limit) on the
deployed site recorded one synthetic row in the production `download_usage` D1 table:
**3 downloads, count=3, under a throwaway browser-fingerprint key** (`browser-quota-<timestamp>-<rand>`).
Fingerprint-keyed and isolated to the daily bucket, so it never affects real users — but it
will show up as one odd fingerprint if anyone runs analytics on the table. Leave as-is; do
not delete (no local wrangler auth). Future quota E2Es should reuse a throwaway fingerprint
and expect this class of leftover row.

### 2026-08-18 — perf: registry out of root layout + on-demand cmdK search (3 small fixes)

Deployed (`70ec253`, `f7963c5`): (a) root layout uses a generated `TOOL_COUNT`
constant instead of `toolsRegistry.length`; (b) `CommandMenu` is now loaded on
demand via `next/dynamic` and rendered only when opened (⌘K / search pill /
shortcuts); (c) Header megamenu columns + share counts come from generated
`src/registry/site-data.generated.ts` (`npm run gen:site-data`, parity-tested in
`src/__tests__/site-data.test.ts`). Header chunk confirmed live with **zero**
registry data; cmdk + registry chunks only fetch on search-open (1153 items,
0 JS errors, ⌘K/Esc verified on deployed site).

Measured on the deployed site (medians, cache disabled) — JS bytes / files:
- Home: 441 KB / 21 → **400 KB / 15** (−9%)
- `/converter/video-converter`: 465 KB / 17 → **450 KB / 17** (−3%)
- `/calculator/age-calculator`: 526 KB / 27 → **450 KB / 17** (−14%)

Timing metrics (FCP/LCP/TBT/CLS) from the after-run are **not recorded** — system
load average was ~200 (swap thrash) at measurement time, so they were noise. The
byte deltas are network-accounting and load-independent, so the win is real.
If a future Lighthouse/measure run asks "why did perf improve", this is the trail.
Baseline: `/var/folders/7y/v2j_q1jn68b6qfz08n2yjk1h0000gn/T/opencode/baseline.json` (may be
gone; the numbers above are the summary). A fresh Chrome CDP instance is kept at
port 9334 (`/tmp/chrome-fresh`) for any future timing re-run.

### NEXT PERF TARGET (scoped, not drive-by) — home + tool pages still ship the 503 KB registry chunk

`HomeClient.tsx` (home page) and `tools/ToolLayout.tsx` (every tool page) still
`import { toolsRegistry }` directly, so home and all tool pages fetch the 503 KB
registry chunk on initial load regardless of the fixes above. The 3 fixes shipped
mainly help pages that never need the registry (About, static pages). This is the
highest-traffic surface and the real next target, but it is **bigger surgery**: it
touches two core layout components (HomeClient featured/filter scans + ToolLayout
related-tools + counts), not isolated utility files. Treat like the FFmpeg/D1 work:
scope as its own reviewed piece, not "one more small fix".

### 2026-08-19 — duplicate-tools merge: video-converter-tool → video-converter (301)

Cluster 1 (`curl-to-code`) was merged earlier (stub removed, redirect kept). This
commit merges cluster 2 (video pair): `/video/video-converter-tool` removed from
`MODULE_REGISTRY` and 301'd to `/converter/video-converter` via `TOOL_REDIRECTS`
(+ `sourceCategory: "video"` for the cross-category edge rule) + generated
`_redirects`. Registry: 1150 → 1149 tools. GSC data over 3 months was noise (0
clicks, ~10 impressions site-wide across all 3 remaining clusters), so the
keep/301 calls rested on structure, not clicks:
- **video pair (merged):** same `VideoFormatConverter` component, one-sided
  relationship signal (5 refs vs 0), `-tool` suffix artifact. → 301.
- **image trio (kept):** three distinct components; `bulk-image-converter` is a
  parent hub for ~100 child tools — merging it would break the family. The real
  issue is name cannibalization (`image-format-converter` vs `image-bulk-converter`
  vs `bulk-image-converter` all chase "bulk image converter" queries) → distinct
  H1/intro copy per tool, not a 301.
- **json pair (kept):** `json-formatter` (dedicated `JsonFormatter`) vs
  `json-formatter-tool` (distinct "JSON Output Tools" mode) — different components,
  different features. Optionally make the names/descriptions more distinct.

GSC export: `docs/toolzum.com-Performance-on-Search-2026-08-19/` (untracked,
reference only). Only the video pair was a real duplicate; the other two "duplicates"
from the original audit were pattern-matched names, not shared code.

## Update (2026-09-11)

| Dimension | Aug 8 | Now | Evidence / scope boundary |
|---|---|---|---|
| Testing | 80 (30 files / 123 tests) | **~90** | 196 files / 1,141 tests: coverage thresholds ratcheted, 32 API contract tests, 103 guarded-calc behavior tests, Playwright E2E (critical-path, auth-flow, responsive). Unparks the "no E2E" item. Residual: og-images 5s timeout flakes under parallel load (passes solo). |
| Accessibility | unmeasured | **~82** | 817 inputs bound via htmlFor/id (brace-aware batch, insertions-only); skip link live; dialog focus traps via shared hook; interaction rules at error. Residual: 327-site human-naming queue (bound-identity judgment, no safe automation). |
| Quota/credits honesty | — | fixed | Live `/api/account/credits` + hook (session snapshots went stale daily); plan-aware badge (Pro never sees quota copy); transcription cost enforced at 10 (was accidentally 1 since Aug 28). |
| Performance/build | 70 | **~72** | Adaptive WASM (ST-only cores + heads-ups on low-end); OG/redirect/site-data generators all green; `out/` 482MB and climbing (diet pass still open). |
| Code quality | 80 | **~82** | `: any` 75→67 across 3 tsc-gated batches (9 mid-batch reverts caught by the gate); 3 dead deps + 184 transitive packages pruned; 2 dead scripts removed. |
| Premium/prod | — | fixed | `pdf-workflow-builder` re-gated (test-ungating from Jul 22 never restored; 65→66); `temporary-email-generator` stub retired (was hijacking privacy-cleaner). |
| Perf target (Aug 18) | open | **resolved** | HomeClient imports only the light client index; ToolLayout imports no registry. |

Counts as of this entry: 1,146 tools, 21 categories, 66 pro, 425 download-producing.
