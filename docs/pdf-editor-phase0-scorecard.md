# PDF Editor — Phase 0 Scorecard (Oct 2026)

Baseline: **62/100** (target: 95). Measured after `2b51eb7c` (hotfix) +
`4621043f` (Maximum-redaction fix); manual fixture checklist still pending,
so correctness gains are provisional until it passes.

Scoring: evidence only — file:line from this repo. "Unverified" = not read,
not assumed good or bad.

| # | Category | Score | Evidence (file:line) | Main gaps |
|---|----------|-------|----------------------|-----------|
| 1 | Correctness & reliability | 60 | `pdfRedact.ts:468` strip engine (18 tests); pixel gate `PdfEditorCore.tsx` exportPdf (claims-pinned); BUT replace whites out whole item `:1743-1745`; export blocked with 0 annos `:2184`; image accept `:3035`; flow `0.55` + `maxWidth` `:2396-2408`; all-or-nothing catch `:2528` | Find/Replace data loss, 5 open Phase-1 items, no manual fixture run yet |
| 2 | Pro-level editing | 55 | Full annotation set + OCR word-insert `:2921` + AI assist + PII sweep w/ review boxes `:1703`; signatures draw-only (`SIG_KEY` `:2089`); forms = separate tool (`PdfFormFiller.tsx`); editable annos explicitly deferred `:2174`; in-editor crop/split/bookmarks/links absent (separate tools) | editable annotations, in-editor forms, PDF/A, true searchable layer, pattern redaction |
| 3 | Mobile-first | 48 | `MobileActionBar.tsx` w/ `touch-manipulation`; BUT `TODO(mobile): touch-none blocks native pinch-zoom` `:3124`; no `visualViewport`/`deviceMemory` hits; no quick-task landing; share-target unverified | pinch-zoom, viewport-safe toolbars, editor share-target, editor offline SW unverified |
| 4 | Performance & storage | 55 | Autosave → IndexedDB `:265`, `saveNow` `:324`, `beforeunload` guard `:1096`; BUT `structuredClone` of all annos per commit/undo `:1780`,`:349` and per version `:349`; render+export on main thread; no perf tests (bundle-budget covers scripts only); quota-failure UX unverified | worker rendering, incremental undo, quota surfacing, perf budgets |
| 5 | A11y & i18n | 58 | Toolbar `aria-label`/`aria-live` (Toolbar `:40-69`); canvas SR text `:244-246`; shortcuts panel; site a11y e2e exists; BUT no annotation-list SR path, English-only (no i18n/RTL), reduced-motion/high-contrast unverified | SR annotation navigation, translation, editor-scoped e2e |
| 6 | Security & compliance | 68 | pdf.js worker self-hosted + no-CDN test (`pdfjsWorker.test.ts`, 5 tests); file caps `:2792`; privacy tests gate upload claims; redaction gates now fail-closed; editor is client-only (no API surface → Turnstile N/A); BUT hostile-PDF timeout/object limits unverified, no CSP/SRI audit, signature data-URL sits in localStorage (`SIG_KEY` — disclose + clear option, `:2949` already half-supports) | signature disclosure, hostile-input limits, CSP |
| 7 | Architecture & testing | 62 | Strong unit net: claims 94 + redact 18 + raster 10 + logic + registry; 6 Playwright specs exist; CI = lint/tsc/test/build; BUT `PdfEditorCore.tsx` still 3,219 lines, no editor e2e proof, no golden-fixture round-trip (no canvas), no visual regression | split core, editor e2e, golden fixtures |
| 8 | Content, trust & SEO | 68 | FAQ + claims-tested copy (2-sided: `pdf-editor-registry.test.ts`); claims ledger `docs/pdf-editor-claims.md`; BUT stale 30/100 MB copy unverified (Phase 8), similar-tools relevance unverified, no demo media | Phase 8 sweep, stale-copy scan |

## Re-score protocol

- Each Phase-1 item closed moves category 1 (find/replace + 0-anno gate =
  biggest jumps; both are in-flight).
- Phase 2–8 map to categories 2–7 one-to-one.
- Claim rows 6/7/8/12 and the manual checklist must close before category 6
  and 1 can claim their final numbers.

## Known baseline disagreement

The pre-fix review estimated ~72 overall; strict category scoring lands at
62 because correctness (5 open bugs incl. one data-loss path) and mobile
(no pinch/viewport work) are scored against the 95-target definition, not
against "ships and mostly works". Use this table as the fixed yardstick so
re-scores after each phase are comparable — not the earlier single number.
