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

## Residual risks (unchanged)

- **CI Lint step red**: 62 pre-existing `react-hooks/set-state-in-effect` errors (Tier 1.1 carry-over,
  frozen out of scope). Until fixed, no CI check is meaningful as a merge gate.
- **Performance/build 5-min target**: remaining gap is the in-build TS phase (~3.9 min), which only
  leaves the critical path via `ignoreBuildErrors` + a required CI gate — blocked by free-plan
  branch protection (403). Never set `ignoreBuildErrors` until that gate exists.
- **Testing**: no browser-level E2E; `Depth` full-catalog audit outstanding.
