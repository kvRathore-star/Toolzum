# PDF Editor — Master Improvement Prompt

> Saved from a review prompt (Oct 2026). Run one phase at a time; stop after each
> phase and wait for approval. Verified bug claims are checked against the repo —
> see the addendum at the bottom for corrections and the execution order we
> settled on.

```
ROLE
You are a principal engineer and PDF-tooling specialist. Your goal is to take
the Toolzum PDF Editor (Next.js, React, pdf-lib, pdf.js, tesseract.js) from
roughly 72/100 to 95+/100 against the standard of a professional PDF editor
(Acrobat, Foxit, PDFgear, Smallpdf), without breaking its core promise:
local-first, private, free to edit, honest about limits.

NON-NEGOTIABLE RULES
1. Audit first. Read the whole editor, the lib helpers (pdfRedact, pdfFonts,
   pdfEditorLogic), toolbar, sidebar and context files before changing code.
   Report what you read and what you could not read.
2. Never claim something works without proof: a unit test, a fixture PDF
   round-trip, or a manual test step. Say "unverified" when it is.
3. Do not change user-facing honesty copy (flatten warning, redaction caveats,
   Helvetica retype note) except to make it more accurate.
4. Privacy is a hard constraint: no file bytes leave the device. Anything that
   does (AI text, OCR engine download, font fetch) must be disclosed in UI.
5. Small, reviewable commits per fix. No rewrites without a migration path.
   Existing behavior (undo, autosave, version history, tab guard) must not
   regress.
6. Keep the "100% local" badge and FAQ in sync with the actual code.

PHASE 0: SCORECARD
Score the current editor 0-100 on each category below with 2-3 line evidence
(file:line). Output a table. Re-score after every phase.

PHASE 1: CORRECTNESS BLOCKERS (fix first)
- Maximum redaction: when rasterizing at 200 DPI, the page is reinserted at
  pixel size, so annotations and black boxes land in the wrong place. Burn
  redaction rects into the canvas before rasterizing, reinsert at original
  point size, handle /Rotate. Add a test that verifies black pixels sit over
  the target region.
- Export blocked when there are zero annotations, but page rotate, delete,
  reorder and duplicate change the file. Allow export whenever bytes changed.
- Image annotations: accept PNG, JPG, WebP, GIF, SVG, HEIC by normalizing to
  PNG or JPEG through canvas on pick. Never fail export because of format.
- Text encoding: detect unencodable glyphs (Devanagari, Tamil, Arabic, CJK,
  rupee sign, emoji) before export. Embed full-coverage fonts (Noto Sans
  Devanagari, Tamil, Bengali, Arabic with shaping, CJK subset) or warn
  per annotation. Never export blank boxes.
- Find and Replace: replace only the matched substring, preserving the rest
  of the text run (split the run, keep font and size). Fix PII sweep matching
  so short or whitespace items are not falsely covered.
- Flow text export: measure with real font metrics (widthOfTextAtSize), not
  size*0.55, and remove double wrapping through maxWidth. Preview and export
  must match line for line.
- Export error handling: per-annotation try/catch with a report of which
  annotation failed, never all-or-nothing.

PHASE 2: PRO-LEVEL EDITING
- True text editing: reconstruct text runs, detect the original font and
  embed a matching or subset font, preserve kerning, color and size. Keep a
  clear fallback and a "font substituted" indicator when exact match is
  impossible.
- Real, editable PDF annotations on export (Highlight, Ink, FreeText,
  Square, Circle, Line, Text/Note, Stamp) as an option alongside flatten,
  verified to open in Acrobat, Preview, Chrome, Firefox, pdf.js and mobile
  viewers. Default stays clear to the user: "Editable" vs "Flattened".
- Fillable forms in the editor itself: text fields, checkboxes, radios,
  dropdowns, date fields, auto-detect fields, flatten on export, add new form
  fields. Merge the separate Form Filler into this flow.
- Signatures: draw, type, initials, date stamp, sign all pages, saved
  locally only, optional visual certificate (not a legal digital signature
  unless implemented properly; label it honestly).
- Searchable-PDF output from OCR: write an invisible text layer so scanned
  documents become searchable and selectable, not just word-insert.
- Redaction: pattern search (email, phone, Aadhaar, PAN, card numbers) with
  review list, verified removal across content streams, annotations,
  metadata, attachments, bookmarks and hidden layers. Keep the verify gate.
- Page tools inline: insert blank page, extract, split, merge another PDF,
  crop, resize, page numbers, header/footer, watermark, stamps, bookmarks.
- Links and bookmarks: add and edit URL and page links.
- Compare view, measurement tool, and layers are out of scope unless
  cheap. Note them in a backlog rather than half-building them.

PHASE 3: MOBILE-FIRST (budget Android phones, 4-6 GB RAM)
- Touch targets at least 44 px, pinch-zoom, two-finger pan, long-press menu,
  drag handles sized for fingers, on-screen keyboard that never covers the
  active text box (use visualViewport).
- Memory discipline: lazy render only visible pages plus a small window,
  release canvases, cap thumbnails, lower page caps on low-memory devices
  (use navigator.deviceMemory), warn before opening heavy files.
- PWA: installable, offline after first load, share_target and file_handlers
  so users can "Open with Toolzum" from WhatsApp, Gmail and Files.
- Quick-task landing: big buttons for Sign, Fill form, Annotate, Compress,
  Merge, Scan to PDF.
- Test on a low-end Android and iOS Safari. Document results.

PHASE 4: PERFORMANCE AND STORAGE
- Autosave: store the original bytes once, save annotation deltas separately,
  debounce, surface failures (quota exceeded) to the user, never silent.
- Replace structuredClone of full annos per commit with patch-based history
  (immer patches or command pattern). Store image data once by ID.
- Move heavy work to Web Workers (render, OCR, export, hashing).
- Cap and measure: define budgets (open 20 MB PDF under 2 s on mid laptop,
  first paint under 1 s, export under 3 s for 50 annotations) and add
  automated perf tests.
- Draft privacy: prompt before restoring a previous session, offer "do not
  store on this device", auto-clear the draft after download, 7-day expiry
  visible in UI, one-click "wipe local data".

PHASE 5: ACCESSIBILITY AND I18N
- WCAG 2.2 AA: full keyboard operation for every tool, visible focus, proper
  roles and labels, live regions for toasts, no color-only meaning, reduced
  motion, 200 percent zoom reflow, high contrast mode.
- Screen reader path: page text, annotation list, and a non-canvas way to
  add and edit annotations.
- RTL layout for Arabic and Urdu, complex script shaping for Indic scripts,
  locale-aware number and date formats, UI translations for at least English
  and Hindi first.

PHASE 6: SECURITY AND COMPLIANCE
- Treat every PDF as hostile: size, page and object limits, timeout, no
  eval, no remote loading by the PDF, sanitize filenames and embedded JS,
  strict CSP, subresource integrity for CDN assets, self-host pdf.js worker,
  tesseract core and language data, and fonts.
- Turnstile and rate limits on every server route; credit checks enforced
  server-side only (never trust the client for Pro or credits).
- AI privacy: show exactly what text will be sent before sending, support
  selection-only, allow translation to any target language (not only English),
  no logging of content server-side.
- Provide PDF/A output option and PDF metadata sanitize option.
- Add a public security and privacy page that matches the real behavior,
  with a "verify it yourself" guide (open DevTools, watch the Network tab).

PHASE 7: ARCHITECTURE AND TESTING
- Split the 3,200-line component: extract exportPdf into a pure module
  (bytes, annotations, options) with no React or DOM dependency, plus
  hooks for history, autosave, OCR, and AI. Keep behavior identical.
- Tests: unit tests for coordinate transforms (rotation 0/90/180/270,
  cropped and non-zero-origin MediaBox), text wrapping, redaction; golden
  PDF fixtures (rotated, encrypted, scanned, form, huge, corrupt, CJK,
  Indic, tagged, with attachments); Playwright end-to-end for open, edit,
  undo, export, reload-restore, and multi-tab conflict; visual regression
  comparing preview and exported render.
- CI: type check, lint, tests, bundle-size budget, and Lighthouse.
- Remove eslint-disable on dependency arrays by fixing the underlying design.
- Add error telemetry that never captures document content (counts and
  error codes only), opt-in.

PHASE 8: CONTENT, TRUST AND SEO
- One source of truth for limits (file size, pages, credits) used by UI,
  FAQ and metadata. Fix the stale 30/100 MB copy and tool-count mismatches.
- Replace irrelevant "Similar tools" with relevant PDF tools.
- Add a short product demo (GIF or video), screenshots, a comparison table
  vs Acrobat/WPS/Smallpdf, changelog link, and a "what is not supported"
  list.
- Add structured data (SoftwareApplication, FAQPage), accurate title and
  meta, fast LCP, and an honest "100% local, except AI" badge.

DEFINITION OF DONE (95+ means all of these)
- Every category scores at least 90, overall at least 95 on the scorecard.
- No known data-loss, privacy-leak, or silent-failure bug.
- Export opens correctly in Acrobat, Chrome, Firefox, macOS Preview, iOS
  and Android viewers, verified with fixtures.
- Preview-to-export visual diff under an agreed threshold on all fixtures.
- Works offline after first load, on a 4 GB Android phone, with a 50-page
  PDF.
- All tests pass in CI.

OUTPUT FORMAT FOR EACH PHASE
1. Findings (file:line evidence)
2. Plan (ordered tasks, risks)
3. Code changes (small diffs)
4. Tests added and results
5. Updated scorecard
6. Remaining gaps and next phase
Stop after each phase and wait for approval before starting the next.
```

## Addendum — verification & corrected execution order (Oct 2026)

Repo verification confirmed every Phase 1 bug claim, two worse than reported:

1. **Maximum redaction — release-blocking, security-grade.** The raster comes
   from pdf.js `pdfDoc`, which never sees pdf-lib's `applyRedactions` edits:
   the "redacted" page is a picture of the original, text included
   (`PdfEditorCore.tsx:2340-2352`). The page is reinserted at pixel size so
   black boxes land wrong (`:2349-2352` vs annos drawn at point coords
   `:2362+`), and the text-extraction verify gate passes trivially because an
   image has no text layer (`:2497-2519`) → false "VERIFIED clean" toast.
2. **Find & Replace destroys text.** The whole text item is whited out
   (`:1743-1745`, `h.w + 4`) and only `replaceText` is retypeset — replacing
   "world" in "Hello world" deletes "Hello ". Font is always Helvetica.
3. Confirmed as reported: export blocked at 0 annos (`:2184`), image format
   restriction (`:3035`), flow-text 0.55 + `maxWidth` double-wrap
   (`:2396-2408`), all-or-nothing export errors (`:2528`).

### Corrected execution order

1. **Hotfix now:** hide/disable Maximum mode (Selective only, keep its verify
   gate). Tone down "VERIFIED" wording to claim only what was checked (text
   bytes removed, not pixels).
2. **Fix Maximum redaction properly:** draw black rects onto the canvas in
   the same coordinate space as the render, before `toBlob`; raster must come
   from the same pixels as the boxes; insert page at original point size
   (`vp.width / (200/72)`); handle `/Rotate`; burn page annotations into the
   raster or redraw them at corrected size.
3. **Strengthen verify gate for raster pages:** render the exported page and
   assert every redact region is near-black (e.g. 99% of pixels under a
   luminance threshold). Text extraction alone cannot verify a raster.
4. **Fix Find & Replace:** split the matched item by character offset using
   font width ratios; white out only the sub-rect; keep prefix/suffix; match
   font and size where possible, mark "font substituted" when not.
5. **Rest of Phase 1:** export with 0 annos when bytes changed, image
   normalization, flow-text measurement, per-annotation error handling,
   glyph check.

### Required tests

- Redaction fixture: redact a known word per mode, export → word absent from
  extracted text; rendered output has black pixels exactly over the region;
  output page dimensions equal the original.
- Replace: "Hello world" with "world"→"there" yields "Hello there".
- Rotated-page redaction at 90°, 180°, 270°.

### Report requirements

- Mark the Maximum-mode bug **release-blocking**.
- Maintain a claims ledger: every place the UI says "verified" or "100%
  local", each tied to a test (see `docs/pdf-editor-claims.md`).
- Glyph item: confirm by exporting a Hindi and a Tamil annotation.
