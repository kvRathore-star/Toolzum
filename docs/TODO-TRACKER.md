# Toolzum TODO Tracker

Last updated: 2026-08-23

## Quick Wins (do now)
- [x] 1. Generate OG images for 4 new tools + fix default /og-image.png 404 — Ran `npx tsx scripts/generate-og-images.ts`, fixed layout/page.tsx to use `/og/branding/index.png`
- [x] 2. Qualify "zero servers/uploads" copy — Fixed 7 locations: layout, tools/page, about/layout, [category]/page, premium-tools FAQ

## Highest-Risk QA (do next)
- [x] 3. Batch/AI tool QA — Found silent failure pattern in 4 batch tools (fake images accepted silently). Fixed BulkToolShell with createImageBitmap probe at upload time. AI tool 404s are expected (auth endpoint).
- [x] 4. Tablet breakpoint pass — Found header 948px overflow at 768/834px. Fixed: search bar hides text at md, Share/Sign in hidden at md, responsive gaps.

## Preserve Knowledge
- [x] 5. Create docs/gotchas.md — classWorkerURL hang, D1 quota, dynamic-rule-budget, file-size-limit dual sources (30 min)

## Investigate (don't optimize blind)
- [x] 6. Build-time profiling — 12min fresh build: TypeScript 5.5min, compilation 3.2min, SSG 3.2min. Nothing pathological. (15 min)
- [x] 7. Icon system unification — emoji → lucide-react in megamenu/categories (30-60 min)
- [x] 7b. One-way converter upgrade — examples, conversion factors, references for 6 tools; Time & Data Size flipped to two-way; specific FAQs (150 lines)
- [x] 8. Thin-tool audit — merged 3 time converter clones into bidirectional time-converter; upgraded rounding calculator (5 modes + step display); upgraded modulo calculator (JS/Python semantics + long-division); added FAQs for all 3 (commit a796dcc)

## Business decisions (separate thread)
- [ ] 9. Email capture — where do signups go?
- [ ] 10. Annual plan / credit pack — what price/credit size?

## Save for Focus Time
- [ ] 11. FAQ rollout (~1,060 tools) — multi-day
- [x] 12. Registry-import perf rewrite — eliminated 736KB full registry from client bundles; Homepage -567KB (30%), Tool page -734KB (35%) (commit 52dccf2)

## Mechanical (proven playbook, no decision needed)
- [ ] 13. FAQ rollout — Tier 1 done (category templates personalized, commit 296e435). Still pending: custom FAQs for GSC "crawled, not indexed" flagged tools, then general volume rollout. Weekend task.
- [x] 14. ~~Developer dedup~~ — api-response-formatter → json-formatter, api-error-decoder → http-status-code-checker (commit 0b3b4c0)
- [x] 15. ~~Calculator consolidation~~ — 6 tools redirected to geometry/scientific/date calculators (commit 0b3b4c0)
- [x] 16. ~~Transcription reclassification~~ — Renamed to "Audio Transcript Formatter" / "Video Transcript Formatter", fixed descriptions (commit 0b3b4c0)
- [x] 17. ~~Branding AI-claim fix~~ — Already fixed. deps was "None" (now "AI API"), UI saying "AI-powered" is accurate (tool uses useAiProvider). Auto-generated FAQ now correctly states API key required. (commit ed11ea6)

## Needs one strategic decision
- [ ] 18. Productivity category — build out (habit trackers, focus timers, note tools?) or fold 2 tools into Utility and remove category. A 2-tool category looks unfinished next to 60+ tool categories. Recommend fold+kill unless productivity is core to growth strategy

## GSC monitoring (time-gated)
- [ ] 19. Submit IndexNow / re-validate GSC for this round of fixes (classifier, trust bugs, related-tools, FAQ content) — free nudge, do now
- [ ] 20. GSC check at 2 weeks (early signal) — pull crawled-not-indexed list, check Validate Fix progress bars, per-URL indexing status on the174/220 flagged tools
- [ ] 21. GSC check at 4 weeks (real assessment) — same checks, compare against 2-week data. Recovery is often uneven across pages
- [ ] 22. GSC monthly check-in after 4 weeks — light monitoring cadence

## Immediate actions
- [x] 23. ~~Improve 6 category FAQ templates in ToolPageSEOContent.tsx~~ — Templates now personalized per tool (name, description in first2 questions). All818 tools get unique FAQ text, breaking duplicate content pattern. (commit 296e435)
- [ ] 24. Submit IndexNow / re-validate GSC for latest fixes (classifier, trust bugs, related-tools, FAQ content)

## Prevention (ongoing)
- [ ] 25. Add lint check: new tools without `faqs` field in registry trigger a warning. Prevents future818-tool backlog. Bake into the tool-addition checklist.
- [ ] 26. Add quality gate script: detect generic FAQ text, duplicate FAQ hashes, thin components (<40 lines), one-way converters missing bidirectional UI, identical description/seoDescription. Run as part of content integrity test suite before every commit.
- [ ] 27. Add category-slug validation: maintain a known-good slug→category mapping, flag mismatches at build time. Catches miscategorized tools before they ship.
- [ ] 28. **FAQ depth audit for Formula-type CalculatorShell tools** — ~120 tools use CalculatorShell with Formula classification. The FAQ rollout (item 11/13/23) only solves thin-content if FAQs are genuinely deep (worked examples, derivation steps, edge cases), not generic templates. Before FAQ rollout: audit all Formula tools' registry `faqs` for: step-by-step derivation, worked numeric example, common mistake warnings, formula variant explanations. Flag tools with <4 FAQs or missing worked examples for manual deepening.

## Testing Strategy: Shared Library Coverage
**Approach:** Instead of 300+ individual tool tests, test shared libraries/hooks that all tools depend on. ~39 shared files → ~40-50 tests covers all tools.

### Already Done (11 files) ✅
| File | Tests | Status |
|------|-------|--------|
| `src/__tests__/lib/clipboard.test.ts` | clipboardWrite | ✅ |
| `src/__tests__/lib/error.test.ts` | getErrorMessage | ✅ |
| `src/__tests__/lib/fileUtils.test.ts` | hasLargeFiles, checkMemory | ✅ |
| `src/__tests__/lib/keyboard.test.ts` | keyboard utilities | ✅ |
| `src/__tests__/lib/withErrorHandling.test.ts` | error wrapper (5 tests) | ✅ |
| `src/__tests__/utils/blob.test.ts` | blob utilities | ✅ |
| `src/__tests__/hooks/useAiProvider.test.ts` | AI provider hook | ✅ |
| `src/__tests__/hooks/useBatchProgress.test.ts` | batch progress hook | ✅ |
| `src/__tests__/hooks/useFFmpeg.test.ts` | FFmpeg hook | ✅ |
| `src/__tests__/hooks/useUsageCounter.test.ts` | usage counter hook | ✅ |
| `src/__tests__/components/AiPrivacyBanner.test.tsx` | privacy banner | ✅ |

### Remaining: Lib (10 files) ⏳
| File | Priority | Notes |
|------|----------|-------|
| `src/lib/fetchWithRetry.ts` | High | Used by API calls |
| `src/lib/proLimits.ts` | High | Premium tier limits |
| `src/lib/auth.ts` | Medium | Auth logic |
| `src/lib/auth-client.ts` | Medium | Client auth |
| `src/lib/env.ts` | Medium | Environment config |
| `src/lib/categoryTheme.ts` | Low | Theme mappings |
| `src/lib/geo.ts` | Low | Geo utilities |
| `src/lib/log.ts` | Low | Logging |
| `src/lib/utils.ts` | Low | General utils |
| `src/lib/generateToolDescription.ts` | Low | Description gen |

### Remaining: Hooks (11 files) ⏳
| File | Priority | Notes |
|------|----------|-------|
| `src/hooks/useFavorites.ts` | High | User favorites |
| `src/hooks/useToolHistory.ts` | High | Tool history |
| `src/hooks/useParallelProcessor.ts` | Medium | Parallel ops |
| `src/hooks/useBidirectional.ts` | Medium | Two-way converters |
| `src/hooks/usePresets.tsx` | Medium | Preset management |
| `src/hooks/useWorkflowPresets.ts` | Medium | Workflow presets |
| `src/hooks/useObjectURL.ts` | Low | Object URL mgmt |
| `src/hooks/useFreeUsage.ts` | Low | Free tier tracking |
| `src/hooks/useIsIndia.ts` | Low | Region detection |
| `src/hooks/useMemoryWatchdog.ts` | Low | Memory monitoring |
| `src/hooks/useWebWorker.ts` | Low | Worker management |

### Remaining: Utils (9 files) ⏳
| File | Priority | Notes |
|------|----------|-------|
| `src/utils/error.ts` | High | Already tested via lib/error.test.ts |
| `src/utils/fileSizeLimits.ts` | High | File size validation |
| `src/utils/freeUsageGuard.ts` | High | Free tier guard |
| `src/utils/nativeShare.ts` | Medium | Native share API |
| `src/utils/toolCache.ts` | Medium | Tool caching |
| `src/utils/urlStatus.ts` | Medium | URL status checks |
| `src/utils/cobaltApi.ts` | Low | Cobalt API client |
| `src/utils/telemetry.ts` | Low | Telemetry |
| `src/utils/transcribe.ts` | Low | Transcription |

### Summary
- **Total shared files:** ~39
- **Already tested:** 11 (28%)
- **Remaining:** 28 files → ~30-40 more tests
- **Estimated total:** 40-50 tests covering all tools via shared dependencies
---

## Completed
- [x] A/E/X/H QA sweep — 4 commits (cookie/FAQ, a11y, error-handling, mobile)
- [x] Gemini Watermark Remover — commit b185098
- [x] Bulk AVIF Optimizer — commit a9dd4cc
- [x] Bulk HEIC Converter — commit e295260
- [x] Bulk Image Upscaler — commit 2c24b51
- [x] Footer Indian Utilities link — verified consistent
- [x] ⌘K search — verified auto-indexes from toolsRegistry
- [x] Protobuf Decoder — rewrote with real wire format parsing (commit b06b887)
- [x] User Favorites — D1 table, API endpoints, star buttons, homepage section, ⌘K group (commit 5ee786c)
