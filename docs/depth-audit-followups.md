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
