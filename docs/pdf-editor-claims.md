# PDF Editor — Claims Ledger

Every user-facing "verified" / "100% local" / "never leaves" claim, tied to
the test (or manual check) that backs it. Copy must not get ahead of the code:
a claim with no backing is a bug. Status meanings:

- **BACKED** — behavior test exercises the claim
- **SOURCE-REGEX** — a test asserts the claim/impl string exists in source, but no behavior test
- **UNVERIFIED** — no test at all
- **NEEDS-TIGHTENING** — technically true but overclaimable; copy should be scoped

| # | Claim | Where | Backed by | Status |
|---|-------|-------|-----------|--------|
| 1 | "text bytes are stripped on export and verified" | `PdfEditorCore.tsx:1343` | `pdfRedact.test.ts` tests `applyRedactions` on real PDFs (18 tests); export-gate strings asserted in `pdfEditorClaims.test.ts:367-375` | SOURCE-REGEX (no fixture export round-trip yet) |
| 2 | Export is blocked when verification fails | `PdfEditorCore.tsx:2510,2515` | `pdfEditorClaims.test.ts` "redaction export gate" | SOURCE-REGEX |
| 3 | FAQ: "block the download if verification fails" | `registry/tools-chunk-1.ts` (redaction FAQ) | `pdfEditorClaims.test.ts` "redaction export gate" + "maximum redaction raster" | SOURCE-REGEX |
| 4 | "the export re-checks that the text is gone. Images underneath are not wiped." | `PdfEditorCore.tsx:3146` | Verify gate (same as #1); images-flagged path in `pdfRedact.ts` + tests | SOURCE-REGEX |
| 5 | Success toast: "redaction checks passed" + per-gate details | `PdfEditorCore.tsx` export success toast | Tied to the two verify gates below (extraction + pixel); asserted in `pdfEditorClaims.test.ts` ("success toast claims only what the gates actually checked") | SOURCE-REGEX |
| 6 | "the original file on your device is never touched" | tour step, `PdfEditorCore.tsx:169` | Export creates a new Blob; load path keeps `fileBytes` | UNVERIFIED — candidate: export-doesn't-mutate-bytes test |
| 7 | "Your PDF never leaves this device" / "everything stays in your browser" / "file is never uploaded" | `PdfEditorCore.tsx:173,699,2792,3187` | Editor has no network path carrying file bytes | NEEDS-TIGHTENING — AI actions send selected text (disclosed at click); font files are fetched. Scope: "your file is never uploaded (AI sends only the text you select)" |
| 8 | Signature "stored locally, never uploaded" | `PdfEditorCore.tsx:2088,2841` | localStorage persistence | UNVERIFIED — candidate: storage-not-network test |
| 9 | Maximum: "boxes are burned into the pixels and re-checked after export" + "Links and form fields on rasterized pages are not kept" | LeftPanel mode picker | `pdfRedactRaster.test.ts` (10 behavior tests: geometry, burn, pixel gate); source-regex pins in `pdfEditorClaims.test.ts` "maximum redaction raster"; full render round-trip is MANUAL (checklist below) | BACKED (geometry/gate) + MANUAL (render round-trip) |
| 10 | Maximum pixel gate: "UNVERIFIED … Export blocked" | `PdfEditorCore.tsx` pixel verify block | Behavior: `regionDarkness` fail-closed tests; impl: claims-test pins | BACKED (gate fn) + SOURCE-REGEX (wiring) |
| 11 | FAQ: two modes, "burned into the pixels and the export re-checks that they are dark", "Rasterized pages do not keep links or form fields" | `registry/tools-chunk-1.ts` | `pdfEditorClaims.test.ts` "maximum redaction raster" | SOURCE-REGEX |
| 12 | Site-wide "100% local" (e.g. `VectorPenCanvas.tsx:239`, `BulkImageConverter.tsx:39`) | various | pending site-wide sweep | PENDING |
| 13 | Replace toast: "original font substituted, size and bold kept; verify placement" | `PdfEditorCore.tsx` findReplace | Behavior: `matchBoxes` geometry + composition tests ("Hello world"→"Hello there") in `pdfEditorLogic.test.ts`; impl pins in `pdfEditorClaims.test.ts` "find/replace sub-rect fix" (incl. NOT-pins: whole-item whiteout, "Helvetica retypeset") | BACKED (geometry) + SOURCE-REGRESSION (wiring) |
| 14 | PII sweep covers only items that can hold the needle (no short/whitespace avalanche) | `piiItemHit` guard in findSensitive | `pdfEditorLogic.test.ts` "piiItemHit" (4 tests) + claims pin `piiItemHit(it.str, lowered)` | BACKED |
| 15 | FAQ: "Hindi and Tamil annotations export with Noto Sans, fetched once and cached offline… split per script… pauses with a message instead of shipping blank boxes… names the pages to check" | `tools-chunk-1.ts` (fonts FAQ sibling) | Round-trip: `indicExport.test.ts` (Hindi, Tamil, mixed run-split — pdf-lib → pdf.js extraction, fixture fonts); routing/₹/offline-block/warn pins in `pdfEditorClaims.test.ts` "Hindi/Tamil glyph gate" | BACKED (round-trip + wiring) |

## Required behavior tests (from the corrected order)

- [ ] Redaction fixture round-trip: word absent from extracted text + black
      pixels over the region + output page size equals original (per mode,
      incl. 90/180/270 rotation).
      *Partial (no canvas impl in vitest): geometry + gate covered by
      `pdfRedactRaster.test.ts` (rotation:0 frame, exact point↔pixel mapping,
      fail-closed gate); render→toBlob→JPEG re-embed = MANUAL checklist below.*
- [x] Replace substring: "Hello world", replace "world" → "Hello there".
      *Unit-level (Oct 2026): `matchBoxes` sub-rect tests + explicit
      composition test in `pdfEditorLogic.test.ts`; wiring pinned by
      `pdfEditorClaims.test.ts` "find/replace sub-rect fix". Full export
      render still = browser pass.*
- [x] Hindi (Devanagari) and Tamil annotation export — no blank boxes.
      *Round-trip proven (Oct 2026): `indicExport.test.ts` draws both +
      a mixed Latin+Hindi run-split through pdf-lib subset embed and
      asserts pdf.js extraction returns every character (fixture fonts,
      char-multiset compare — matra reordering safe). Runtime wiring
      pinned by "Hindi/Tamil glyph gate" claims block.*
- [ ] Export with zero annotations after a page op succeeds.
- [ ] "Original bytes never touched" — export leaves `fileBytes` unchanged.

## Manual fixture checklist (needs a browser — before re-releasing Maximum)

1. Letter PDF, word "SECRET" at a known spot, /Rotate 0 → Maximum redact →
   export: page size == 612×792 pt, box visually over the word, word absent
   from selection/copy, open in Preview + Acrobat + Chrome.
2. Same at /Rotate 90, 180, 270 — box must sit over the word in every case.
3. Add a highlight over the redacted area → export must BLOCK with the
   "Maximum redaction UNVERIFIED" toast; remove it → export passes.
4. Links + form fields on a rasterized page → confirm they are gone (FAQ
   says so) and the flagged toast names the page.

### Reviewer-added cases (Oct 2026)

5. Rotated page (90° and 270°) with a redaction AND a text annotation —
   box over the right words, annotation where it appeared on screen, page
   orientation matches the original.
6. Highlight overlapping a redaction — confirm the pixel gate catches the
   lightened box (or explain why it does not).
7. Redaction near the page edge + a tiny one-word redaction — rounding in
   the pixel/point conversion shows up here first.
8. Multi-page doc with only pages 2 and 4 redacted — `removePage`/
   `insertPage` index shift: right pages replaced, others untouched.
9. Cropped page (non-zero MediaBox/CropBox origin) — unit tests cover
   rotation, not crop; visual check required.
