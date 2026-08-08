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
| Code quality (78) | **Confirmed** | `tsc --noEmit --strict` clean. Lint: 62 errors / 2411 warnings — **identical frozen set** (pre-existing Tier 1.1 carry-over, unchanged). ConverterRouter/converterConfig/ConverterCategory retired (empty `find`). 9 dead slugs → `TOOL_REDIRECTS`. Zero orphan components (registry-integrity #9, 17/17 green). *(Post-Phase-2: all 62 errors resolved 2026-08-08 — see "Lint-debt resolution" below; 2,411 warnings remain.)* |
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

**Gate re-enabled:** CI `quality` job's Lint step (`.github/workflows/ci.yml`) now passes and is again meaningful as a merge gate; local `pre-push` hook extended to `npm run lint && npm run typecheck && npm run test`.

## Residual risks (unchanged)

- **Performance/build 5-min target**: remaining gap is the in-build TS phase (~3.9 min), which only
  leaves the critical path via `ignoreBuildErrors` + a required CI gate — blocked by free-plan
  branch protection (403). Never set `ignoreBuildErrors` until that gate exists.
- **Testing**: no browser-level E2E; `Depth` full-catalog audit outstanding.
- **Warnings backlog**: 2,411 lint warnings (no-unused-vars / no-explicit-any / no-console) remain —
  errors are at zero so CI is meaningful again, but a warnings pass is still out of scope.
