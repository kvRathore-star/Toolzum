# Depth Audit — Follow-up Candidates

> Logged during the Depth/functionality audit (2026-07-31). These are explicitly tracked as
> follow-up candidates, **not closed**. None required action on the audit day; each is listed
> with the evidence gathered so the decision is recorded rather than silently waived.
>
> **Oct 9 2026 status sweep:** #1 CLOSED (copy fixed, verified in registry);
> #2 CLOSED (all four tools verified description !== seoDescription);
> #4 CLOSED (all 8 OG images exist on disk + in builds). #4b, #6b, #6c and the
> rest below keep their original status unless noted.

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

## 4b. OG images regenerate on every build (backlog — Tier 3 / performance, related to #4)

- Surfaced 2026-08-06 as a build-speed tangent during Phase 4. `npm run build` runs
  `scripts/generate-og-images.ts` first (`gen:og`), which rewrites **all** `public/og/**`
  PNGs each time. Observations:
  - Slow-but-successful builds can *look* hung because the OG step writes many files with no
    progress output, and the pipeline can look stalled at 0% CPU due to pipe buffering.
  - `og-images.test.ts` (vitest) **also** regenerates `public/og/` PNGs on every suite run,
    which causes tracked-PNG churn + untracked PNGs after each local `npm test` — a recurring
    commit-pollution trap (bit the fold-in commit round).
- Verdict: legitimate but **Tier 3 / performance territory**, not a Phase 4 correctness item.
  **Logged, not built.** Ideas for a future round (do not start now):
  - Cache/skip generation when PNGs are unchanged (content-hash compare) instead of rewriting.
  - Move `gen:og` off the hot build path, or dedupe the two generators (build vs. test).
  - Add progress output to `generate-og-images.ts` so slow runs don't look dead.

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
## 6. Cross-Tier Review sweep findings (2026-08-08) — logged, not fixed

> From the Cross-Tier Review & Scorecard Verification Sweep (audit tier). Each finding below is
> logged; **6a was fixed same-day** (2026-08-08) via the audit tier's trivial-fix exception
> (one-line `rm` of orphaned files + permanent `generateAll` harden). **6b** was closed as
> doc-only (claim corrected, no score revision; see below). **6d** is the one real production
> risk (see severity marker).

- **6a. 113 stale tracked OG PNGs (~6MB).** `public/og/` contains 113 PNGs that no longer
  correspond to any live registry slug at that path: **93 category-moved** (slug live, but the
  PNG sits in the pre-restructure directory, e.g. `public/og/utility/csv-formatter.png` is
  git-tracked while the live tool is `converter/csv-formatter`) + **19 true orphans** (slug not
  in registry at all, e.g. `pdf/pdf-to-docx`, `image/bulk-webp-avif-modernizer`). Root cause:
  `generateAll` in `scripts/generate-og-images.ts` prunes the **manifest** for paths no longer
  in `livePaths` (:368-372) but **never deletes the PNG file on disk**. Not a routing/SEO
  defect — every live tool has a current PNG (0 missing) — but the repo tracks 6MB of dead
  images, and the old `growth & marketing metrics/` directory is a leftover category name.
  **FIXED (2026-08-08, same-day, trivial-fix exception):** added `pruneOrphanedImages` to
  `generateAll` (walks `outDir`, deletes any `*.png` not in `livePaths`, removes emptied dirs);
  added a regression test to `og-images.test.ts` ("deletes orphaned PNG files not in the live
  set"); ran `gen:og` → 113 orphans removed, warm run still 0.6s/1172 skipped. The 113
  deletions + harden + test are committed; any future slug/category change now self-cleans.
- **6b. `og-cache.json` is NOT git-tracked despite `docs/build-performance-phase2.md:22,26`
  claiming it is.** `git ls-files | grep og-cache.json` → empty; it is just untracked (and not
  gitignored). Consequence: on a fresh CI/CF checkout the manifest is absent and `gen:og` does a
  cold full render every time — the warm-cache optimization (~0.3s vs ~129s) only helps local
  builds where the file persists. Doc-vs-reality contradiction; either commit the manifest or
  fix the doc claim. **CLOSED (2026-08-08):** doc claim corrected at
  `docs/build-performance-phase2.md` with a dated correction note. **Decision: do NOT commit
  the manifest** — it is a build artifact keyed to absolute machine state; committing it would
  not warm CI anyway (CF checkouts run `gen:og` during build regardless) and would churn the
  repo on every template/content change. No Performance/build score revision needed: the
  production acceptance numbers in the phase2 doc predate Item 1 (deploy window 2026-05-21 →
  2026-08-06 vs Item 1 landing 2026-08-08) and were measured on builds with **no cache at
  all**, so they are already conservative / include the full cold render cost. The warm-cache
  win is a documented local-only optimization.
- **6c. No test covers the registry/routing × OG combination.** `og-images.test.ts` exercises
  `generateAll` only with synthetic tools; `registry-integrity.test.ts` never reads
  `public/og/` or `og-cache.json`. A slug rename, category move, or removal that leaves a stale
  tracked PNG would sail through CI green (6a is the live proof). A cheap guard: assert every
  git-tracked `public/og/**/*.png` maps to a live registry slug at that path. **Logged.**
- **6d. `functions/api/ai/transcribe.ts` has no upload size limit** and base64-encodes via
  `String.fromCharCode(...new Uint8Array(arrayBuffer))` (:28) — a spread on an unbounded array
  (stack/memory risk for large audio). url-status-check.ts budgets everything; transcribe does
  not. Add a size cap (e.g. reject >50MB) and chunk the base64 conversion.
  **SEVERITY: HIGH — production resource-exhaustion / DoS surface.** The handler is
  unauthenticated and accepts any-size multipart upload; a large request forces the spread onto
  the JS stack (RangeError) and unbounded memory in the Worker isolate, and it front-runs the
  paid Gemini API (cost amplification). **FIXED (2026-08-08, same-night):** added
  `MAX_UPLOAD_BYTES` (50MB → 413) guard before any `arrayBuffer()`/decode, and chunked the
  base64 conversion (`toBase64`, 32KB slices) so no unbounded spread reaches the stack. Mirrors
  `url-status-check.ts` budgeting. See `functions/api/ai/transcribe.ts`.
- **6e. `GEMINI_API_KEY` is not in `.env.example` / wrangler config docs** for the transcribe
  handler, so the required secret is undocumented (the handler 500s if unset — cf. follow-up
  #3 above which found it unset in prod at audit time). **SEVERITY: LOW (ops hygiene).**
  **FIXED (2026-08-08):** documented in `.env.example` with a note that it is required for the
  transcribe endpoint and must be set as a Cloudflare Pages secret (else 500).
- **6f. Sitemap generator `scripts/generate-sitemap.js` globs only `tools-chunk-*.ts`** and
  never reads `tools-constants.ts` — 82 SEO_PERMUTATION bulk slugs are absent from the sitemap.
  This is **correct behavior** (all 82 are `parentSlug` entries that `permanentRedirect` to
  their hub via `page.tsx:75-93`, so omitting them from the sitemap is intentional). Verified
  non-issue; recorded so nobody "fixes" the sitemap into adding 301 sources. **No action.**
- **6g. Broader Depth heuristics found no new stubs** (Phase 3). Ran: short implementation
  files (<3KB → 35, all real thin wrappers), stub-language scan (`coming soon|stub|placeholder`
  → 14 false positives, e.g. placeholder *generators* and `background-remover` which is a
  TOOL_REDIRECTS → `ai-bg-changer`). The `description === seoDescription` heuristic
  (`scan.test.ts`) remains the only productive one, flagging the 5 known cosmetic items (#1,
  #2). **Decision: accept current Depth-audit scope** — full manual 1,151-tool functional
  audit is not cost-justified; the structural gate (every MODULE_REGISTRY slug renders, zero
  orphans) + description-identity heuristic is the accepted coverage.

- Status: **closed.** Phase 4 fully complete (2026-08-06):
  - ConverterRouter/converterConfig/ConverterCategory deleted (commit `9d5ab83`).
  - `HUB_DESCRIPTIONS` folded into hub-owned `DESCRIPTIONS` maps (commit `346949c`).
  - Single-registration-path guard landed (commit `b04f253`): lint-time
    `no-restricted-imports` blocking `@/components/tools/modules/**` outside the wrapper,
    plus a CI-time structural test that also catches relative-import paths. A parallel
    registration path (the old converterConfig/ConverterRouter shape) is now blocked both
    at authoring time and in CI.
