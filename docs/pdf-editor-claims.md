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
| 3 | FAQ: "will block the download if verification fails" | `registry/tools-chunk-1.ts` (redaction FAQ) | `pdfEditorClaims.test.ts:371` | SOURCE-REGEX |
| 4 | "the export re-checks that the text is gone. Images underneath are not wiped." | `PdfEditorCore.tsx:3146` | Verify gate (same as #1); images-flagged path in `pdfRedact.ts` + tests | SOURCE-REGEX |
| 5 | Success toast: "re-checked by text extraction: removed strings are not recoverable" | `PdfEditorCore.tsx` export success toast | Verify gate re-extraction block | SOURCE-REGEX |
| 6 | "the original file on your device is never touched" | tour step, `PdfEditorCore.tsx:169` | Export creates a new Blob; load path keeps `fileBytes` | UNVERIFIED — candidate: export-doesn't-mutate-bytes test |
| 7 | "Your PDF never leaves this device" / "everything stays in your browser" / "file is never uploaded" | `PdfEditorCore.tsx:173,699,2792,3187` | Editor has no network path carrying file bytes | NEEDS-TIGHTENING — AI actions send selected text (disclosed at click); font files are fetched. Scope: "your file is never uploaded (AI sends only the text you select)" |
| 8 | Signature "stored locally, never uploaded" | `PdfEditorCore.tsx:2088,2841` | localStorage persistence | UNVERIFIED — candidate: storage-not-network test |
| 9 | Maximum-mode safety copy (disabled Oct 2026) | LeftPanel note + redaction FAQ | Release-blocked pending fix — see `docs/pdf-editor-master-prompt.md` addendum | Disabled, keep out of claims until pixel verify gate lands |
| 10 | Site-wide "100% local" (e.g. `VectorPenCanvas.tsx:239`, `BulkImageConverter.tsx:39`) | various | pending site-wide sweep | PENDING |

## Required behavior tests (from the corrected order)

- [ ] Redaction fixture round-trip: word absent from extracted text + black
      pixels over the region + output page size equals original (per mode,
      incl. 90/180/270 rotation).
- [ ] Replace substring: "Hello world", replace "world" → "Hello there".
- [ ] Hindi (Devanagari) and Tamil annotation export — no blank boxes.
- [ ] Export with zero annotations after a page op succeeds.
- [ ] "Original bytes never touched" — export leaves `fileBytes` unchanged.
