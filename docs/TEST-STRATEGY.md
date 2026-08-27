# Toolzum.com - Complete Testing Strategy

**Last Updated:** Aug 27, 2026  
**Total Test Files:** 67  
**Total Tests:** 100+  
**Tools Covered:** ~150 (via shared dependencies)

---

## Executive Summary

| Metric | Current | Target |
|--------|---------|--------|
| Test Files | 67 | 96 |
| Dependency Tests | 0 | 13 |
| Shared Lib Tests | 17 | 45 |
| Component Tests | 1 | 21 |
| Page Tests | 0 | 25 |
| Integration Tests | 0 | 10 |
| Tools Verified | ~50 | ~200 |
| Coverage | 13% | 80%+ |

---

## Table of Contents

1. [Coverage Gap Analysis](#coverage-gap-analysis)
2. [Testing Approach](#testing-approach)
3. [Tests Completed](#tests-completed)
4. [Dependency Testing Plan](#dependency-testing-plan)
5. [Shared Library Testing](#shared-library-testing)
6. [Component Testing](#component-testing)
7. [Page Testing](#page-testing)
8. [Integration & E2E Testing](#integration--e2e-testing)
9. [Execution Timeline](#execution-timeline)
10. [Success Criteria](#success-criteria)

---

## Coverage Gap Analysis

### Current State

| Category | Total Files | Tested | Remaining | Coverage |
|----------|-------------|--------|-----------|----------|
| Tool Modules | 400 | 6 | 394 | 1.5% |
| Hooks | 15 | 4 | 11 | 27% |
| Lib Files | 17 | 5 | 12 | 29% |
| Utils | 11 | 1 | 10 | 9% |
| Components | 45 | 1 | 44 | 2% |
| Pages | 25 | 0 | 25 | 0% |
| **Total** | **513** | **17** | **496** | **3.3%** |

### Why 100% Coverage Is Impractical

| Approach | Tests Needed | Time | Feasibility |
|----------|--------------|------|-------------|
| Test all 400 tools individually | 400+ | 100+ hours | ❌ Impractical |
| Test via dependencies (current) | 13 | 5 hours | ✅ Efficient |
| Test all components | 45 | 15 hours | ⚠️ Takes time |
| Test all pages | 25 | 10 hours | ⚠️ Takes time |
| **Realistic target** | **~96** | **~30 hours** | **✅ Achievable** |

### Coverage Targets

| Target | Tests | Coverage | Meaning |
|--------|-------|----------|---------|
| Current | 67 | 13% | Basic shared code |
| MVP | 100 | 60% | Core functionality |
| Good | 147 | 80% | Production ready |
| Complete | 563 | 100% | Full coverage (not recommended) |

### Recommended: 80% Coverage Strategy

```
Layer 1: Dependencies (13 tests)
    └── pdf-lib, jszip, ffmpeg, etc.
    └── Covers 150+ tools

Layer 2: Shared Libraries (32 tests)
    └── All hooks, lib, utils
    └── Covers all shared code

Layer 3: Critical Components (20 tests)
    └── FileUploader, ResultPanel, etc.
    └── Covers main UI

Layer 4: Page Smoke Tests (25 tests)
    └── All routes render
    └── Covers all pages

Layer 5: Integration Tests (10 tests)
    └── Upload→Process→Download
    └── Covers critical workflows

TOTAL: ~96 tests = 80%+ meaningful coverage
```

---

## Testing Approach

### Why Dependency-First Testing?

| Approach | Tests Needed | Tools Covered | Maintenance |
|----------|--------------|---------------|-------------|
| Test each tool individually | 300+ | 300 | High |
| Test shared dependencies | 13 | ~150 | Low |
| Test shared libraries | 32 | All | Medium |
| **Combined** | **45** | **~200** | **Low** |

---

## Tests Completed

### Tool-Specific Tests (6 files) ✅

| File | Category | What It Tests |
|------|----------|---------------|
| `src/__tests__/AudioMerger.test.tsx` | Audio | Audio merge functionality |
| `src/__tests__/ImageColorizer.test.tsx` | Image | Colorization feature |
| `src/__tests__/ImageEnhancer.test.tsx` | Image | Enhancement feature |
| `src/__tests__/MuteVideo.test.tsx` | Video | Audio muting |
| `src/__tests__/NoiseReducer.test.tsx` | Audio | Noise reduction |
| `src/__tests__/VideoCompressor.test.tsx` | Video | Compression |

### Hook Tests (4 files) ✅

| File | Hook | What It Tests |
|------|------|---------------|
| `src/__tests__/hooks/useAiProvider.test.ts` | useAiProvider | AI provider integration |
| `src/__tests__/hooks/useBatchProgress.test.ts` | useBatchProgress | Batch progress tracking |
| `src/__tests__/hooks/useFFmpeg.test.ts` | useFFmpeg | FFmpeg initialization |
| `src/__tests__/hooks/useUsageCounter.test.ts` | useUsageCounter | Usage counting |

### Library Tests (5 files) ✅

| File | Library | What It Tests |
|------|---------|---------------|
| `src/__tests__/lib/clipboard.test.ts` | clipboard | clipboardWrite (3 tests) |
| `src/__tests__/lib/error.test.ts` | error utils | getErrorMessage (7 tests) |
| `src/__tests__/lib/fileUtils.test.ts` | fileUtils | hasLargeFiles, checkMemory |
| `src/__tests__/lib/keyboard.test.ts` | keyboard | Keyboard accessibility |
| `src/__tests__/lib/withErrorHandling.test.ts` | withErrorHandling | Error wrapper (5 tests) |

### Utils & Component Tests (2 files) ✅

| File | Component | What It Tests |
|------|-----------|---------------|
| `src/__tests__/utils/blob.test.ts` | blob utils | Blob handling |
| `src/__tests__/components/AiPrivacyBanner.test.tsx` | AiPrivacyBanner | Privacy banner |

### Existing Tests (50 files) ✅

- Integrity tests (registry, content, claims)
- Pair tests (audio, image, video, text, data)
- Smoke tests
- OG image tests
- Site data tests

---

## Dependency Testing Plan

### P0: High-Value Dependencies (Do First)

**1 test = many tools covered**

| Dependency | Version | Tools Using It | Test | Covers |
|------------|---------|----------------|------|--------|
| **pdf-lib** | 1.17.1 | **73 tools** | Merge 2 PDFs, add watermark | All PDF tools |
| **jszip** | 3.10.1 | **30 tools** | Create ZIP, extract, preview | All file tools |
| **@ffmpeg/ffmpeg** | 0.12.10 | **34 tools** | Basic transcode, compress | All video/audio tools |

**Total P0: 3 tests → 137 tools covered**

### P1: Medium Dependencies

| Dependency | Version | Tools Using It | Test | Covers |
|------------|---------|----------------|------|--------|
| **pdfjs-dist** | 4.0.379 | **18 tools** | Render PDF page | PDF viewers |
| **dompurify** | 3.0.6 | **10 tools** | Sanitize HTML | Text tools |
| **browser-image-compression** | 2.0.2 | **8 tools** | Compress JPEG | Image tools |
| **qrcode** | 1.5.3 | **5 tools** | Generate/read QR | QR tools |
| **jspdf** | 2.5.1 | **5 tools** | Generate PDF with text | PDF gen tools |

**Total P1: 5 tests → 46 tools covered**

### P2: Low Dependencies

| Dependency | Version | Tools Using It | Test | Covers |
|------------|---------|----------------|------|--------|
| **marked** | 12.0.0 | **5 tools** | Parse markdown→HTML | Markdown tools |
| **xlsx** | 0.18.5 | **5 tools** | Read/write spreadsheet | Excel tools |
| **crypto-js** | 4.2.0 | **3 tools** | Encrypt/decrypt AES | Security tools |
| **zxcvbn** | 4.4.2 | **2 tools** | Password strength calc | Password tools |
| **tesseract.js** | 5.1.0 | **2 tools** | Extract text from image | OCR tools |

**Total P2: 5 tests → 17 tools covered**

### Dependency Test Files

```
src/__tests__/dependencies/
├── pdf-lib.test.ts           # 73 PDF tools
├── jszip.test.ts             # 30 file tools
├── ffmpeg.test.ts            # 34 video/audio tools
├── pdfjs-dist.test.ts        # 18 PDF render tools
├── dompurify.test.ts         # 10 text tools
├── image-compression.test.ts # 8 image tools
├── qrcode.test.ts            # 5 QR tools
├── jspdf.test.ts             # 5 PDF gen tools
├── marked.test.ts            # 5 markdown tools
├── xlsx.test.ts              # 5 Excel tools
├── crypto-js.test.ts         # 3 security tools
├── zxcvbn.test.ts            # 2 password tools
└── tesseract.test.ts         # 2 OCR tools
```

---

## Shared Library Testing

### Already Tested (17 files) ✅

| Category | Files | Status |
|----------|-------|--------|
| Lib | clipboard, error, fileUtils, keyboard, withErrorHandling | ✅ |
| Hooks | useAiProvider, useBatchProgress, useFFmpeg, useUsageCounter | ✅ |
| Utils | blob | ✅ |
| Components | AiPrivacyBanner | ✅ |

### Remaining: High Priority (9 files) ⏳

| File | Purpose | Used By | Risk |
|------|---------|---------|------|
| `src/lib/proLimits.ts` | Premium limits | All premium tools | **Revenue** |
| `src/utils/freeUsageGuard.ts` | Free tier guard | Free tools | **Revenue** |
| `src/lib/fetchWithRetry.ts` | API retry logic | API tools | High |
| `src/hooks/useFavorites.ts` | User favorites | All tools | Medium |
| `src/hooks/useToolHistory.ts` | Tool history | All tools | Medium |
| `src/utils/fileSizeLimits.ts` | File validation | File tools | Medium |
| `src/hooks/useParallelProcessor.ts` | Parallel ops | Batch tools | Low |
| `src/hooks/useBidirectional.ts` | Two-way converters | Converter tools | Low |
| `src/hooks/usePresets.tsx` | Preset management | Calculator tools | Low |

### Remaining: Medium Priority (9 files) ⏳

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

### Remaining: Low Priority (10 files) ⏳

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

## Component Testing

### Critical Components to Test (20 files) ⏳

#### Tool Infrastructure (7 files)
| File | Purpose | Priority |
|------|---------|----------|
| `src/components/tools/FileUploader.tsx` | File upload handling | High |
| `src/components/tools/ResultPanel.tsx` | Output display | High |
| `src/components/tools/ProcessingOverlay.tsx` | Loading states | High |
| `src/components/tools/DownloadLimitModal.tsx` | Download limits | High |
| `src/components/tools/BatchProgressPanel.tsx` | Batch progress | High |
| `src/components/tools/ToolPresetBar.tsx` | Preset management | Medium |
| `src/components/tools/FreeVsProBoundary.tsx` | Free/Pro gating | Medium |

#### Shared UI Components (7 files)
| File | Purpose | Priority |
|------|---------|----------|
| `src/components/tools/ToolsDirectoryClient.tsx` | Tool directory | High |
| `src/components/tools/ToolPageSEOContent.tsx` | SEO content | Medium |
| `src/components/tools/AiSettings.tsx` | AI configuration | Medium |
| `src/components/tools/UndoRedoBar.tsx` | Undo/Redo | Medium |
| `src/components/tools/LinkCard.tsx` | Link display | Low |
| `src/components/tools/DownloadQuotaBadge.tsx` | Quota display | Low |
| `src/components/tools/ToolPaywall.tsx` | Paywall | Low |

#### Core UI Components (6 files)
| File | Purpose | Priority |
|------|---------|----------|
| `src/components/ui/button.tsx` | Button component | High |
| `src/components/ui/input.tsx` | Input component | High |
| `src/components/ui/card.tsx` | Card component | Medium |
| `src/components/ShareTool.tsx` | Share functionality | Medium |
| `src/components/theme-provider.tsx` | Theme handling | Low |
| `src/components/privacy-claims.tsx` | Privacy claims | Low |

### Component Test Location

```
src/__tests__/components/
├── tools/
│   ├── FileUploader.test.tsx
│   ├── ResultPanel.test.tsx
│   ├── ProcessingOverlay.test.tsx
│   ├── DownloadLimitModal.test.tsx
│   ├── BatchProgressPanel.test.tsx
│   ├── ToolPresetBar.test.tsx
│   └── FreeVsProBoundary.test.tsx
├── ui/
│   ├── button.test.tsx
│   ├── input.test.tsx
│   └── card.test.tsx
└── ShareTool.test.tsx
```

---

## Page Testing

### All Pages to Test (25 pages) ⏳

#### Main Pages (8 pages)
| Page | Route | Priority |
|------|-------|----------|
| Homepage | `/` | High |
| Tools Directory | `/tools` | High |
| Category Page | `/[category]` | High |
| Tool Page | `/[category]/[tool]` | High |
| Premium Tools | `/premium-tools` | High |
| About | `/about` | Medium |
| FAQ | `/faq` | Medium |
| Contact | `/contact` | Medium |

#### Legal/Info Pages (7 pages)
| Page | Route | Priority |
|------|-------|----------|
| Privacy Policy | `/privacy-policy` | Medium |
| Terms | `/terms` | Medium |
| Security | `/security` | Medium |
| Changelog | `/changelog` | Low |
| Roadmap | `/roadmap` | Low |
| Status | `/status` | Low |
| Product | `/product` | Low |

#### Feature Pages (5 pages)
| Page | Route | Priority |
|------|-------|----------|
| Extension | `/extension` | Medium |
| Blog | `/blog` | Low |
| Blog Post | `/blog/[slug]` | Low |
| Login | `/login` | High |
| Signup | `/signup` | High |

### Page Test Strategy

```typescript
// Example page test
describe('Tool Page', () => {
  it('renders without crashing', () => {
    render(<ToolPage params={{ category: 'pdf', tool: 'pdf-merger' }} />);
  });
  
  it('displays tool title', () => {
    expect(screen.getByText('PDF Merger')).toBeInTheDocument();
  });
  
  it('has working file uploader', () => {
    expect(screen.getByTestId('file-uploader')).toBeInTheDocument();
  });
});
```

---

## Integration & E2E Testing

### Critical User Workflows (10 tests) ⏳

#### File Processing Workflow (4 tests)
| Test | Flow | Validates |
|------|------|-----------|
| PDF Workflow | Upload → Merge → Download | PDF tools work end-to-end |
| Image Workflow | Upload → Compress → Download | Image tools work end-to-end |
| Video Workflow | Upload → Transcode → Download | Video tools work end-to-end |
| ZIP Workflow | Upload files → Create ZIP → Download | ZIP tools work end-to-end |

#### User Account Workflow (3 tests)
| Test | Flow | Validates |
|------|------|-----------|
| Free Usage | Use tool → Hit limit → See upgrade | Free tier works |
| Premium Usage | Login → Use premium tool → Download | Premium works |
| Favorites | Login → Add favorite → View favorites | Favorites work |

#### Error Handling Workflow (3 tests)
| Test | Flow | Validates |
|------|------|-----------|
| Invalid File | Upload wrong type → See error | Error messages work |
| Large File | Upload huge file → See size error | Size limits work |
| Network Error | Simulate offline → See retry | Error handling works |

### E2E Test Setup (Playwright)

```typescript
// Example E2E test
test('PDF merge workflow', async ({ page }) => {
  await page.goto('/pdf/pdf-merger');
  
  // Upload files
  await page.setInputFiles('input[type="file"]', ['file1.pdf', 'file2.pdf']);
  
  // Click merge
  await page.click('button:has-text("Merge")');
  
  // Wait for download
  await page.waitForEvent('download');
});
```

---

## Dependency Map

### Video/Audio Processing
| Library | Import Count | Tools |
|---------|--------------|-------|
| @ffmpeg/ffmpeg | 29 | VideoCompressor, MuteVideo, VideoTrimmer, etc. |
| @ffmpeg/util | 29 | (used by above) |
| gif.js.optimized | 1 | GifCreator |
| fabric | 1 | CanvasEditor |

### Image Processing
| Library | Import Count | Tools |
|---------|--------------|-------|
| browser-image-compression | 5 | BulkImageOptimizer, ImageCompressor |
| heic2any | 1 | HeicConverter |
| cropperjs | 1 | ImageCropper |
| ag-psd | 1 | PsdParser |
| html-to-image | 2 | Screenshot tools |
| html2canvas | 1 | Screenshot tools |
| utif | 2 | TiffConverter |

### PDF Processing
| Library | Import Count | Tools |
|---------|--------------|-------|
| pdf-lib | 44 | PdfMerge, PdfSplit, PdfWatermark, etc. |
| pdfjs-dist | 18 | PdfViewer, PdfToImage |
| jspdf | 4 | PdfGenerator, InvoiceGenerator |
| mammoth | 1 | DocxToPdf |

### Document Processing
| Library | Import Count | Tools |
|---------|--------------|-------|
| xlsx | 1 | ExcelReader, SpreadsheetTools |
| pptxgenjs | 1 | PowerPointGenerator |
| papaparse | 1 | CsvParser |
| xml2js | 1 | XmlParser |

### Text Processing
| Library | Import Count | Tools |
|---------|--------------|-------|
| marked | 2 | MarkdownEditor, MarkdownToHtml |
| turndown | 1 | HtmlToMarkdown |
| dompurify | 9 | All HTML tools |
| diff-match-patch | 2 | TextDiff, TextCompare |
| jsonlint-mod | 1 | JsonValidator |
| js-yaml | 1 | YamlParser |
| sql-formatter | 1 | SqlFormatter |
| clean-css | 1 | CssMinifier |
| html-minifier-terser | 1 | HtmlMinifier |

### Cryptography/Security
| Library | Import Count | Tools |
|---------|--------------|-------|
| crypto-js | 3 | AesEncryption, HashGenerator |
| openpgp | 1 | PgpEncryption |
| jose | 1 | JwtDecoder |

### Barcode/QR
| Library | Import Count | Tools |
|---------|--------------|-------|
| qrcode | 5 | QrCodeGenerator, QrReader |
| jsbarcode | 1 | BarcodeGenerator |
| jsqr | 1 | QrReader |

### ML/AI
| Library | Import Count | Tools |
|---------|--------------|-------|
| @tensorflow/tfjs | 1 | FaceDetector |
| @tensorflow-models/blazeface | 1 | FaceDetector |
| tesseract.js | 1 | OcrTool |

### File Handling
| Library | Import Count | Tools |
|---------|--------------|-------|
| jszip | 26 | ZipCreator, ZipExtractor, BatchTools |
| file-saver | 1 | FileDownloader |

---

## Execution Timeline

### Week 1: Revenue-Critical + P0 Dependencies (Do First)
- [ ] Test `proLimits.ts` — revenue gating, highest risk
- [ ] Test `freeUsageGuard.ts` — free tier limits, revenue-critical
- [ ] Test `fetchWithRetry.ts` — API reliability
- [ ] Write pdf-lib.test.ts (73 tools)
- [ ] Write jszip.test.ts (30 tools)
- [ ] Write ffmpeg.test.ts (34 tools)

### Week 2: Integration Tests (Real Wiring Bugs)
- [ ] PDF workflow: Upload → Merge → Download
- [ ] Image workflow: Upload → Compress → Download
- [ ] Free-tier-limit workflow: Use → Hit limit → See upgrade prompt
- [ ] Video workflow: Upload → Transcode → Download
- [ ] ZIP workflow: Upload files → Create ZIP → Download

### Week 3: P1 Dependencies + Shared Libs
- [ ] Write pdfjs-dist.test.ts (18 tools)
- [ ] Write dompurify.test.ts (10 tools)
- [ ] Write image-compression.test.ts (8 tools)
- [ ] Write qrcode.test.ts (5 tools)
- [ ] Write jspdf.test.ts (5 tools)
- [ ] Complete high-priority lib tests (7 remaining)

### Week 4: Component Testing
- [ ] Test 7 tool infrastructure components
- [ ] Test 7 shared UI components
- [ ] Test 6 core UI components

### Week 5: Page Smoke Tests + P2 Dependencies
- [ ] Smoke test all 25 pages
- [ ] Write P2 dependency tests (marked, xlsx, crypto-js, zxcvbn, tesseract)
- [ ] Complete medium/low-priority lib tests

### Week 6: Final Verification
- [ ] Run full test suite
- [ ] Verify coverage
- [ ] Fix any failing tests

---

## Success Criteria

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Test Files | 67 | 96 | ⏳ |
| Dependency Tests | 0 | 13 | ⏳ |
| Shared Lib Tests | 17 | 45 | ⏳ |
| Component Tests | 1 | 21 | ⏳ |
| Page Tests | 0 | 25 | ⏳ |
| Integration Tests | 0 | 10 | ⏳ |
| Tools Verified | ~50 | ~200 | ⏳ |
| Coverage | 13% | 80%+ | ⏳ |
| Build Size | - | -10% | ⏳ |

---

## Important Notes

### Coverage Definition
**Current "coverage" = test files ÷ source files (13%)**  
Not statement/branch coverage from a coverage tool.  
If reporting externally (investor, hiring), clarify this is "test file coverage."

### Dependency Tests ≠ Tool Tests
| Test Type | What It Verifies | Example |
|-----------|------------------|---------|
| Dependency test | Library works in our env | "pdf-lib can merge PDFs" |
| Tool test | **Our code** calls library correctly | "PdfMerger.tsx handles errors" |

**Gap:** Dependency tests don't catch our bugs — only that the library works.  
The 6 tool-specific tests (AudioMerger, etc.) are the only things testing integration code.

**Risk:** Don't let dependency tests give false confidence that tools are verified.  
Only the shared plumbing is tested, not the tool-specific wiring.

### Revenue-Critical Testing
- `proLimits.ts` gates premium features → **test first**
- `freeUsageGuard.ts` controls free tier limits → **test first**  
- Recent plan-limits bug (free tier 30MB cap) shows this is highest-risk untested code

---

## Quick Reference

### Test Command
```bash
npm run test
```

### Coverage Report
```bash
npm run test -- --coverage
```

### Run Specific Test
```bash
npm run test -- src/__tests__/dependencies/pdf-lib.test.ts
```

### Run All Dependency Tests
```bash
npm run test -- src/__tests__/dependencies/
```

---

## Notes

- Dependency tests verify libraries work in our environment
- Shared lib tests verify our custom hooks/utils work
- Component tests verify UI rendering
- Page tests verify routes work
- Integration tests verify critical user flows
- Focus on P0 deps first - they cover 137 tools with just 3 tests
- 100% coverage is impractical; aim for 80% meaningful coverage
