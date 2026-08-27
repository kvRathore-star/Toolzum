# Remaining Tasks - Toolzum.com

## Current Status

| Task | Status | Details |
|------|--------|---------|
| Keyboard Accessibility | ✅ Complete | 20 tools wired with `useEnterToSubmit` |
| Testing | ✅ Complete | 67 test files, 100+ tests |
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

## Task 3: Testing Strategy - Shared Library Coverage

### Approach
Instead of 300+ individual tool tests, test shared libraries/hooks that all tools depend on.
~39 shared files → ~40-50 tests covers all tools via dependencies.

### Tests Created (Aug 27) - 17 Files

#### Tool-Specific Tests (6 files)
| File | Category | Tests |
|------|----------|-------|
| `src/__tests__/AudioMerger.test.tsx` | Audio | Audio merge functionality |
| `src/__tests__/ImageColorizer.test.tsx` | Image | Colorization feature |
| `src/__tests__/ImageEnhancer.test.tsx` | Image | Enhancement feature |
| `src/__tests__/MuteVideo.test.tsx` | Video | Audio muting |
| `src/__tests__/NoiseReducer.test.tsx` | Audio | Noise reduction |
| `src/__tests__/VideoCompressor.test.tsx` | Video | Compression |

#### Hook Tests (4 files)
| File | Hook | Tests |
|------|------|-------|
| `src/__tests__/hooks/useAiProvider.test.ts` | useAiProvider | AI provider integration |
| `src/__tests__/hooks/useBatchProgress.test.ts` | useBatchProgress | Batch progress tracking |
| `src/__tests__/hooks/useFFmpeg.test.ts` | useFFmpeg | FFmpeg initialization |
| `src/__tests__/hooks/useUsageCounter.test.ts` | useUsageCounter | Usage counting |

#### Library Tests (5 files)
| File | Library | Tests |
|------|---------|-------|
| `src/__tests__/lib/clipboard.test.ts` | clipboard | clipboardWrite (3 tests) |
| `src/__tests__/lib/error.test.ts` | error utils | getErrorMessage (7 tests) |
| `src/__tests__/lib/fileUtils.test.ts` | fileUtils | hasLargeFiles, checkMemory |
| `src/__tests__/lib/keyboard.test.ts` | keyboard | Keyboard accessibility |
| `src/__tests__/lib/withErrorHandling.test.ts` | withErrorHandling | Error wrapper (5 tests) |

#### Utils & Component Tests (2 files)
| File | Component | Tests |
|------|-----------|-------|
| `src/__tests__/utils/blob.test.ts` | blob utils | Blob handling |
| `src/__tests__/components/AiPrivacyBanner.test.tsx` | AiPrivacyBanner | Privacy banner |

### Current Coverage
- **Total test files:** 67
- **Shared lib tests:** 17 (new)
- **Existing tests:** 50 (tool-specific, pairs, integrity)
- **Coverage:** ~17% of shared code tested

### Remaining Shared Libs to Test (28 files)

#### High Priority (9 files)
| File | Purpose | Used By |
|------|---------|---------|
| `src/lib/fetchWithRetry.ts` | API retry logic | API tools |
| `src/lib/proLimits.ts` | Premium limits | All premium tools |
| `src/hooks/useFavorites.ts` | User favorites | All tools |
| `src/hooks/useToolHistory.ts` | Tool history | All tools |
| `src/utils/fileSizeLimits.ts` | File validation | File tools |
| `src/utils/freeUsageGuard.ts` | Free tier guard | Free tools |
| `src/hooks/useParallelProcessor.ts` | Parallel ops | Batch tools |
| `src/hooks/useBidirectional.ts` | Two-way converters | Converter tools |
| `src/hooks/usePresets.tsx` | Preset management | Calculator tools |

#### Medium Priority (9 files)
| File | Purpose | Used By |
|------|---------|---------|
| `src/lib/auth.ts` | Auth logic | User features |
| `src/lib/auth-client.ts` | Client auth | User features |
| `src/lib/env.ts` | Environment config | All tools |
| `src/hooks/useWorkflowPresets.ts` | Workflow presets | Complex tools |
| `src/utils/nativeShare.ts` | Native share | Mobile tools |
| `src/utils/toolCache.ts` | Tool caching | All tools |
| `src/utils/urlStatus.ts` | URL validation | URL tools |
| `src/lib/categoryTheme.ts` | Theme mappings | UI |
| `src/lib/geo.ts` | Geo utilities | Location tools |

#### Low Priority (10 files)
| File | Purpose | Used By |
|------|---------|---------|
| `src/lib/log.ts` | Logging | Debug |
| `src/lib/utils.ts` | General utils | Various |
| `src/lib/generateToolDescription.ts` | Description gen | SEO |
| `src/hooks/useObjectURL.ts` | Object URL mgmt | File tools |
| `src/hooks/useFreeUsage.ts` | Free tier tracking | Free tools |
| `src/hooks/useIsIndia.ts` | Region detection | Indian tools |
| `src/hooks/useMemoryWatchdog.ts` | Memory monitoring | Heavy tools |
| `src/hooks/useWebWorker.ts` | Worker management | CPU tools |
| `src/utils/cobaltApi.ts` | Cobalt API | Video download |
| `src/utils/telemetry.ts` | Telemetry | Analytics |

---

## Task 4: Dependency Testing (Verify All Tools Work)

### Approach
Test each dependency/library directly to verify ALL tools using it work correctly.
13 dependency tests = ~150 tools covered

### High-Value Dependencies (P0 - Do First)

| Dependency | Tools Using It | Test Strategy | Tests Needed |
|------------|----------------|---------------|--------------|
| pdf-lib | **73 tools** | Test merge/split/watermark on sample PDF | 1 |
| jszip | **30 tools** | Test create/extract/preview ZIP | 1 |
| @ffmpeg/ffmpeg | **34 tools** | Test basic transcode/compress | 1 |

### Medium Dependencies (P1)

| Dependency | Tools Using It | Test Strategy | Tests Needed |
|------------|----------------|---------------|--------------|
| dompurify | **10 tools** | Test sanitize HTML input | 1 |
| qrcode | **5 tools** | Test generate/read QR | 1 |
| jspdf | **5 tools** | Test generate PDF with text | 1 |
| browser-image-compression | **8 tools** | Test compress JPEG/PNG | 1 |
| pdfjs-dist | **18 tools** | Test render PDF page | 1 |

### Low Dependencies (P2)

| Dependency | Tools Using It | Test Strategy | Tests Needed |
|------------|----------------|---------------|--------------|
| marked | **5 tools** | Test parse markdown→HTML | 1 |
| xlsx | **5 tools** | Test read/write spreadsheet | 1 |
| crypto-js | **3 tools** | Test encrypt/decrypt AES | 1 |
| zxcvbn | **2 tools** | Test password strength calc | 1 |
| tesseract.js | **2 tools** | Test extract text from image | 1 |

### Dependency Test Summary

| Priority | Dependencies | Tools Covered | Tests |
|----------|--------------|---------------|-------|
| P0 | pdf-lib, jszip, ffmpeg | ~137 tools | 3 |
| P1 | dompurify, qrcode, jspdf, image-compression, pdfjs | ~46 tools | 5 |
| P2 | marked, xlsx, crypto-js, zxcvbn, tesseract | ~17 tools | 5 |
| **Total** | **13 dependencies** | **~150 tools** | **13** |

### Test File Locations
```
src/__tests__/dependencies/
  ├── pdf-lib.test.ts          (covers 73 PDF tools)
  ├── jszip.test.ts            (covers 30 file tools)
  ├── ffmpeg.test.ts           (covers 34 video/audio tools)
  ├── dompurify.test.ts        (covers 10 text tools)
  ├── qrcode.test.ts           (covers 5 QR tools)
  ├── jspdf.test.ts            (covers 5 PDF gen tools)
  ├── image-compression.test.ts (covers 8 image tools)
  ├── pdfjs-dist.test.ts       (covers 18 PDF render tools)
  ├── marked.test.ts           (covers 5 markdown tools)
  ├── xlsx.test.ts             (covers 5 Excel tools)
  ├── crypto-js.test.ts        (covers 3 security tools)
  ├── zxcvbn.test.ts           (covers 2 password tools)
  └── tesseract.test.ts        (covers 2 OCR tools)
```

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

### Phase 3: Dependency Testing (Week 4)
1. Create `src/__tests__/dependencies/` folder
2. Test P0 deps: pdf-lib, jszip, ffmpeg (covers 137 tools)
3. Test P1 deps: dompurify, qrcode, jspdf, image-compression (covers 46 tools)
4. Verify all tools using these deps work

### Phase 4: Shared Library Testing (Week 5)
1. Complete high-priority lib tests (9 files)
2. Complete medium-priority lib tests (9 files)
3. Run full test suite

### Phase 5: Low Priority Testing (Week 6)
1. Test P2 deps: marked, xlsx, crypto-js, zxcvbn, tesseract
2. Complete low-priority lib tests (10 files)
3. Add category smoke tests (1 per category)
4. Final coverage verification

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Server Components | 0 | 50+ |
| Files <1000 lines | 8 | 0 |
| Shared Lib Tests | 17 | 45+ |
| Dependency Tests | 0 | 13 |
| Tools Verified | ~50 | ~200 |
| Test Coverage | 17% | 60%+ |
| Build Size | - | -10% |

---

## Notes

- Server components improve initial load but require careful conversion
- Splitting files improves maintainability but requires import updates
- Additional testing improves confidence but takes time
- Prioritize based on user impact and maintainability
