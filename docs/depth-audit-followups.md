# Depth Audit — Follow-up Candidates

> Logged during the Depth/functionality audit (2026-07-31). These are explicitly tracked as
> follow-up candidates, **not closed**. None required action on the audit day; each is listed
> with the evidence gathered so the decision is recorded rather than silently waived.

## Context: `scan.test.ts` is diagnostic-only

`src/__tests__/scan.test.ts` has **no assertions** — it only logs tools whose `description`
equals the normalized `seoDescription`. A green run is not an acceptance signal; it is a
content-opportunity tripwire (same bucket as content-integrity "item #5"). Treat it as a
review list, not a pass/fail gate.

## 1. `pdf-ai-summariser` — copy overclaims OCR on the free tier (candidate)

- Registry claim (`tools-chunk-1.ts`): "Uploads a PDF document, extracts its full text **via
  OCR and native parsing**, then sends the content to an LLM for a condensed summary…"
- Reality (`PdfAiSummariser.tsx`): text extraction is **pdf.js native parsing only**
  (`pdfjs-dist.getDocument` → page text). No OCR. "OCR" appears only in a **Pro** upsell line
  ("process scanned/image PDFs with OCR"), which is not implemented on the free path — a
  scanned PDF yields empty text.
- Verdict: the core flow (upload PDF → LLM summary via `/api/ai/generate`) is **real and
  functional** (now that `GEMINI_API_KEY` is set). This is a **minor copy overclaim**, same
  family as the transcription fixes — not a stub.
- Suggested fix (low effort): drop "via OCR and" from `description` + `seoDescription` for the
  free tier (or implement OCR).
- Scan flag reason: `description === seoDescription` (duplication), which is what surfaced it.

## 2. `markdown-to-html`, `html-to-markdown`, `text-to-markdown`, `markdown-to-text` — cosmetic only (candidate)

- All four route to a **real, functional component** (`MarkdownTools.tsx`) using `marked`,
  `turndown`, or vanilla text wrapping. Client-side, `dependencies` values match.
- All four are `showInCategory: false` SEO landing pages with honest descriptions.
- Verdict: **no functional gap**. The only issue is `description === seoDescription`
  duplication (content-opportunity "item #5"), which is cosmetic SEO work, not correctness.
- Suggested fix (low priority): differentiate the `seoDescription` from the `description`.

## 3. Environment dependency (resolved, kept on record)

- `GEMINI_API_KEY` was **unset** in Cloudflare Pages at audit time → `/api/ai/generate` and
  `/api/ai/transcribe` returned 500 in production (all AI tools).
- Status: **set by the user on 2026-07-31**. No further action unless rate limits appear.

## 4. 8 real registry tools have never had OG images committed (candidate)

- Surfaced 2026-08-05 as a build aside during the Phase 3.2 (text-transform) migration, not
  caused by it. After `npm run build` regenerates `public/og/**`, these 8 files stay
  **untracked** every time — every other tool's OG image is committed:
  - `public/og/converter/csv-data-cleaner.png`
  - `public/og/converter/csv-formatter.png`
  - `public/og/converter/csv-statistics.png`
  - `public/og/converter/mov-to-mp3.png`
  - `public/og/converter/mp4-to-mp3.png`
  - `public/og/converter/text-binary-converter.png`
  - `public/og/converter/webm-to-mp3.png`
  - `public/og/utility/temperature-converter.png`
- All 8 correspond to **real slugs** present in the routing sources (MODULE_REGISTRY /
  CONVERTER_CONFIG) and in `public/sitemap.xml`, so they are not stray artifacts — production
  is simply missing committed OG images for them.
- Verdict: pre-existing gap, unrelated to routing consolidation. **Logged, not fixed**; decide
  separately whether to commit the images (they regenerate deterministically at build) or
  leave them generated-on-deploy.

## 5. data/toon migration vs Design B (lossy redirects) — RESOLVED (2026-08-06)

- Context: during Phase 3, `data` (`xml-to-json`, `xml-to-csv`) and `toon`
  (`json-toon-converter`) were migrated into MODULE_REGISTRY slug closures in
  `DynamicModuleWrapper.tsx` (commit `c9829d6`). These two categories were flagged
  "Design B entangled: avoid" because of the **lossy-redirect** problem:
  - `yaml-to-toon`, `toon-to-json`, `toon-to-yaml` → `permanentRedirect` to
    `/converter/json-toon-converter/`, which renders `JsonToonConverter` with the
    **JSON→Toon default** (`SLUG_TO_MODE['json-toon-converter'] = 'json-to-toon'`), not the
    actual source pair.
  - `json-to-csv`, `csv-to-json`, `json-to-xml`, `csv-to-xml` → `permanentRedirect` to
    `/converter/data-format-converter/` (generic `DataConverter` hub, no pair preselected).
- Verification (2026-08-06, post-`c9829d6`): the migration **did not resolve Design B and did
  not regress it**. Redirects lived in `TOOL_REDIRECTS` (`src/registry/tools-constants.ts`) and
  fired in `src/app/[category]/[tool]/page.tsx:64-67` — a path independent of
  CONVERTER_CONFIG/ConverterRouter, untouched by the migration. Built output confirmed all 7
  source pages still emitted `http-equiv="refresh"` to their same targets. Target rendering was
  byte-identical before/after: `json-toon-converter`'s closure rendered the same
  `ToonConverter` (JSON→Toon default) ConverterRouter did, and `data-format-converter` was
  already a pre-existing `ssr:false` MODULE_REGISTRY entry.
- Guards added during Phase 3: `src/__tests__/data-pairs.test.ts` and `src/__tests__/toon-pairs.test.ts`
  asserted the redirect-source slugs were **not** closure-routed, so an accidental wiring would
  fail CI.
- **Resolution (2026-08-06, Phase 4):** the 7 sources are now real per-pair MODULE_REGISTRY
  pages, closing the lossiness. Their `TOOL_REDIRECTS` entries were removed and per-pair
  closures added (`json-to-csv`, `csv-to-json`, `json-to-xml`, `csv-to-xml` →
  `DataConverterFromSlug slug="…"`; `yaml-to-toon`, `toon-to-json`, `toon-to-yaml` →
  `ToonConverter slug="…"` → correct `SLUG_TO_MODE` `initialMode`). The pairs tests were flipped
  to assert the 7 are closure-routed and are `SLUG_MAP`/`SLUG_TO_MODE` entries. `registry-integrity`
  "no MODULE_REGISTRY slug redirects away" now passes trivially for them. Built output confirmed:
  no `http-equiv="refresh"` on any of the 7 pages, and each renders its correct pair (e.g.
  `yaml-to-toon` shows YAML→Toon with YAML input; `json-to-csv` shows JSON→CSV preselected).
  Registry 1040→1047, redirect-only 89→82, full suite 122 green, tsc clean.
- Status: **closed.** Phase 4 retirement complete: ConverterRouter/converterConfig/
  ConverterCategory deleted (commit `…`); `HUB_DESCRIPTIONS` still to fold into hub-owned data
  and a CI/lint rule blocking new tool registration outside MODULE_REGISTRY remains outstanding.
