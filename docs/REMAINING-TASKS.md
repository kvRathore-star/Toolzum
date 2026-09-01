# Remaining Tasks - Toolzum.com

## Current Status

| Task | Status | Details |
|------|--------|---------|
| Keyboard Accessibility | ✅ Complete | 20 tools wired with `useEnterToSubmit` |
| Testing | ✅ Complete | 23 test files, 35+ tests |
| Server Components | ⏳ Pending | 400 client components |
| Split Mega Files | ⏳ Pending | 8 files >1000 lines |

---

## Task 1: Server Components Conversion

### Overview
Convert client components to server components where possible to improve:
- Initial load performance
- SEO (search engine crawling)
- Bundle size reduction

### Priority Order

| Priority | Category | Count | Reason |
|----------|----------|-------|--------|
| 1️⃣ | Static content | ~50 | No interactivity needed |
| 2️⃣ | Display-only tools | ~100 | Read-only output |
| 3️⃣ | Simple forms | ~150 | Basic input/output |
| 4️⃣ | Complex tools | ~150 | Keep as client |

### Candidate Tools for Server Components

#### Static Content (Easy)
- Tool descriptions
- FAQ sections
- Help documentation
- Category pages

#### Display-Only Tools (Medium)
- QR Code viewers (after generation)
- PDF previewers
- Image galleries
- Data tables

#### Keep as Client (Complex)
- FFmpeg-based tools (video, audio)
- Real-time calculators
- Interactive editors
- File uploaders

### Conversion Checklist

For each tool:
- [ ] Check for `useState`, `useEffect`, event handlers
- [ ] If none → Convert to server component
- [ ] If has interactivity → Keep as client
- [ ] Test functionality after conversion

---

## Task 2: Split Mega Files

### Files to Split

| File | Lines | Category | Split Strategy |
|------|-------|----------|----------------|
| `DynamicModuleWrapper.tsx` | 1500+ | Registry | Extract MODULE_REGISTRY |
| `Calculators.tsx` | 800+ | Calculator | Split by calculator type |
| `FinanceCalculators.tsx` | 700+ | Finance | Split by financial tool |
| `ApiTools.tsx` | 600+ | API | Split by API type |
| `MiscTextAndColorTools.tsx` | 500+ | Text/Color | Split text and color tools |
| `DeveloperTools.tsx` | 500+ | Dev | Split by dev tool type |
| `ImageTools.tsx` | 400+ | Image | Split by image operation |
| `VideoTools.tsx` | 400+ | Video | Split by video operation |

### Split Strategy

#### Option A: By Feature
```
Calculators/
  ├── MathCalculators.tsx
  ├── FinanceCalculators.tsx
  ├── HealthCalculators.tsx
  └── index.ts
```

#### Option B: By Complexity
```
Tools/
  ├── SimpleTools.tsx (no state)
  ├── MediumTools.tsx (basic state)
  └── ComplexTools.tsx (FFmpeg, etc.)
```

### Recommended: Option A (By Feature)

#### Benefits
- Easier to maintain
- Better code organization
- Clearer responsibility
- Easier to test

---

## Task 3: Additional Testing (Optional)

### Current Coverage
- 23 test files
- 35+ tests
- 6% of tools tested

### Recommended Addition
- Add 27 more tests to reach 50 total (MVP)
- Focus on high-traffic tools
- Test unique business logic, not FFmpeg

### Priority Tools for Testing

| Tool | Reason |
|------|--------|
| SalaryCalculator | Complex formula |
| UnitConverter | Multiple rules |
| PasswordGenerator | Entropy calculation |
| QrCodeGenerator | Output validation |
| CurrencyConverter | API handling |

---

## Execution Order

### Phase 1: Server Components (Week 1-2)
1. Identify static tools
2. Convert batch 1 (50 tools)
3. Test each conversion
4. Deploy and verify

### Phase 2: Split Mega Files (Week 3)
1. Plan file structure
2. Extract MODULE_REGISTRY
3. Split Calculators
4. Split other mega files
5. Update imports
6. Test all functionality

### Phase 3: Additional Testing (Week 4)
1. Add 27 more tests
2. Focus on complex tools
3. Run full test suite
4. Verify coverage

---
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



- Task list for 79→85+ score (created but not started):
- pending Accessibility: keyboard navigation to top 50 tools
- pending Accessibility: skip-nav + sr-only text across tools
- pending Security: audit client-side file handling
- pending Fix CalculatorShell dual-card layout
- pending Sitemap: submit to Google Search Console
- pending Testing: @testing-library/react for top 20 tools
- pending Performance: audit 399MB static export

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Server Components | 0 | 50+ |
| Files <1000 lines | 8 | 0 |
| Test Coverage | 6% | 12%+ |
| Build Size | - | -10% |

---

## Notes

- Server components improve initial load but require careful conversion
- Splitting files improves maintainability but requires import updates
- Additional testing improves confidence but takes time
- Prioritize based on user impact and maintainability
