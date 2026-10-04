# Gotchas

Hard-won knowledge from debugging production issues. Read before modifying related code.

## 1. FFmpeg worker-load hang (`classWorkerURL`)

**What broke:** Passing a blob-URL module worker (`classWorkerURL`) to FFmpeg's `load()` caused the LOAD message to never resolve. The worker couldn't resolve its own relative imports (`./const.js`, `./errors.js`) from a blob URL. Every FFmpeg tool showed an infinite "Initializing WebAssembly Core..." spinner.

**How we found it:** User reported all audio/video tools hanging. Isolated to `useFFmpeg.ts` — the `load()` call never returned. Removed `classWorkerURL` from the `load()` call and tools loaded instantly.

**Fix:** `src/hooks/useFFmpeg.ts:75-78` — pass only `coreURL` and `wasmURL` to `load()`, let `@ffmpeg/ffmpeg` use its bundled worker. Commit `2721a6c`.

**Prevention:** Never pass a blob-URL worker to FFmpeg's `load()`. If a tool hangs on "Initializing WebAssembly", check if `classWorkerURL` was recently added.

---

## 2. Cloudflare `_redirects` dynamic-rule budget silent drop

**What broke:** Cloudflare Pages' `_redirects` parser permanently switches to **dynamic** mode on the first splat (`*`) or placeholder (`:name`). After that, every rule counts against a 100-dynamic-rule budget. When exceeded, the parser **silently drops the rest of the file** — no error, no log. 241 rules (120 source URLs) silently 404'd in production because a splat rule was at the top of the file.

**How we found it:** Users reported 404s on tool URLs that worked before. Checked `_redirects` — 590 rules, but only the first 100 dynamic ones fired. The postmortem is at `docs/redirects-dynamic-budget-postmortem.md`.

**Fix:** `public/_redirects` — all static rules come first, dynamic rules (splats/placeholders) sink to the very end. Generator script at `scripts/generate-redirects.js:75-103` enforces this invariant. Regression test at `src/__tests__/redirect-meta-fallback.test.ts:76-94`.

**Prevention:** Never add a splat or placeholder rule above static rules in `_redirects`. The generator script and test will catch this. If you manually edit `_redirects`, verify dynamic rules are last.

---

## 3. D1 `TEXT PRIMARY KEY` NULL issue

**What broke:** `download_usage` table was created with `id TEXT PRIMARY KEY`. In D1 (SQLite), this allowed NULL id values or conflicts with generated UUIDs. The table became unusable — queries returned wrong results or silently failed.

**How we found it:** Download counts weren't tracking correctly. Inspected the D1 table and found NULL ids and duplicate rows.

**Fix:** `src/db/migrations/0003_download_usage_fix.sql` — recreated table with `INTEGER PRIMARY KEY AUTOINCREMENT`. Schema at `src/db/schema.ts:69`. Commit `f6a65a3`.

**Prevention:** Always use `INTEGER PRIMARY KEY AUTOINCREMENT` for D1 id columns. Never use `TEXT PRIMARY KEY` for auto-generated IDs.

---

## 4. File-size-limit dual sources of truth

**What broke:** File size limits were defined in two places that drifted apart: server-side `functions/api/check-plan.ts` (`PLAN_LIMITS`) and client-side `src/hooks/useFreeUsage.ts` (hardcoded constants). Client-side limits were more restrictive (10MB/25MB) than server-side (50MB/500MB), so files were blocked client-side even though the server would allow them.

**How we found it:** Users reported "file too large" errors for files well under the documented limits. Traced to the client-side constants being outdated.

**Fix:** `src/utils/fileSizeLimits.ts` — centralized `smartMax()` function returns limits per category (video/audio/pdf/other). Both `check-plan.ts` and `FileUploader` read from it. Regression test at `src/__tests__/plan-limits.test.ts:29-35` ensures server limits are always >= client limits. Commit `73d765a`.

**Prevention:** Never hardcode file size limits in components. Always use `smartMax()` from `fileSizeLimits.ts`. The regression test catches drift.

---

## 5. Batch-tool silent file acceptance

**What broke:** `BulkToolShell` accepted files that claimed to be images (e.g., `fake.jpg`) but weren't actually valid images. The HTML `accept` attribute only checks extension, not content. Invalid files were silently queued, then failed at runtime or produced garbage output with no user-facing error.

**How we found it:** QA sweep with Puppeteer — uploaded a text file renamed to `.jpg` to 4 batch tools. All accepted it silently. Only discovered when user clicks "Process" and sees a confusing error.

**Fix:** `src/components/tools/modules/utility/BulkToolShell.tsx:74-87` — `createImageBitmap()` probe at upload time. If decoding fails, the file is rejected with a clear toast: `"filename" is not a valid image — skipped.` Only runs for image-accepting tools (`accept !== '*/*'`). Commit `f8a9353`.

**Prevention:** Any file input that accepts images should validate content, not just extension. The `createImageBitmap` probe pattern is the standard approach. If adding a new batch tool, ensure `BulkToolShell` handles the validation — don't bypass it with a custom upload handler.

## 7. Classifier: audio-converter and text-to-speech get wrong How-to templates

**What's wrong:** `deriveInteractionPattern()` in `ToolPageSEOContent.tsx` gives these tools incorrect patterns:
- `audio-converter` → `other` (falls through all patterns). The converter check at line 81 (`n.includes('converter') && !hasFileInput`) requires `!hasFileInput`, but the Audio category forces `hasFileInput=true`. So the converter pattern is skipped and it falls to `other`, which uses a generic category template.
- `text-to-speech` → `upload-convert-download` (instead of `ai-generate`). The name "Text to Speech" matches the "X to Y" regex at line 59, and Audio category makes `hasFileInput=true`, so it gets file-conversion steps instead of AI-generation steps. The TTS-specific check at line 91 never runs because upload-convert-download returns first.

**Root cause:** The converter check guards on `!hasFileInput`, which excludes all audio/video/pdf/image category tools even when they're format converters. The "X to Y" regex matches before the TTS-specific check.

**Fix (done Sep 20 2026):** `!n.includes('speech')` guard added to both "X to Y" branches so text-to-speech/speech-to-text fall through to the `ai-generate` branch, plus a `converter + hasFileInput → upload-convert-download` rule after the calculator early-return (audio-converter was falling to `other`). Verified by full-registry dump: exactly 3 tools changed routing (audio-converter, text-to-speech-tts, speech-to-text); value-based converters (unit, currency, yaml-json, xlsx-csv…) still `enter-values-result`. Regression test at `src/__tests__/interaction-pattern.test.ts`.

**Discovered:** 2026-08-23 during classifier audit. Pre-existing, not caused by any session changes.

## 8. Playwright page.route dies once a Service Worker controls the page

**What's wrong:** e2e route mocks (`page.route('**/api/...')`) silently stop intercepting after SW activation — the page's fetch goes through the SW's runtime route to the real server. Proven Oct 2026: mocked `fetch('/api/check-plan')` returned serve's 404 with `routeHits=0` after `controlled:true`.

**Symptoms:** tests that mock API contracts pass while short and fail when they get long enough for the SW install to finish (781-file precache ≈ 40–160s). pdf-editor CI failed exactly the multi-session cases (2, 3+6, 5, 7) and all of slow webkit — every failure the same modal: "Downloads temporarily unavailable" behind a 150s download timeout.

**Fix (done Oct 4 2026):** `openEditor()` init script stubs `navigator.serviceWorker.register` to a rejected promise for specs that don't test the SW (`e2e/pdf-editor.spec.ts`). Specs that DO test the SW (`offline.spec.ts`) must not use route mocks. Rule: a spec either mocks APIs **or** exercises the SW, never both.

**Discovered:** 2026-10-04 during CI pdf-editor failure triage (artifacts upload was the unlock — error-context.md showed the modal the logs never named).
