# Toolzum TODO Tracker

Last updated: 2026-08-23

## Quick Wins (do now)
- [x] 1. Generate OG images for 4 new tools + fix default /og-image.png 404 — Ran `npx tsx scripts/generate-og-images.ts`, fixed layout/page.tsx to use `/og/branding/index.png`
- [x] 2. Qualify "zero servers/uploads" copy — Fixed 7 locations: layout, tools/page, about/layout, [category]/page, premium-tools FAQ

## Highest-Risk QA (do next)
- [x] 3. Batch/AI tool QA — Found silent failure pattern in 4 batch tools (fake images accepted silently). Fixed BulkToolShell with createImageBitmap probe at upload time. AI tool 404s are expected (auth endpoint).
- [x] 4. Tablet breakpoint pass — Found header 948px overflow at 768/834px. Fixed: search bar hides text at md, Share/Sign in hidden at md, responsive gaps.

## Preserve Knowledge
- [x] 5. Create docs/gotchas.md — classWorkerURL hang, D1 quota, dynamic-rule-budget, file-size-limit dual sources (30 min)

## Investigate (don't optimize blind)
- [x] 6. Build-time profiling — 12min fresh build: TypeScript 5.5min, compilation 3.2min, SSG 3.2min. Nothing pathological. (15 min)
- [x] 7. Icon system unification — emoji → lucide-react in megamenu/categories (30-60 min)
- [x] 7b. One-way converter upgrade — examples, conversion factors, references for 6 tools; Time & Data Size flipped to two-way; specific FAQs (150 lines)
- [x] 8. Thin-tool audit — merged 3 time converter clones into bidirectional time-converter; upgraded rounding calculator (5 modes + step display); upgraded modulo calculator (JS/Python semantics + long-division); added FAQs for all 3 (commit a796dcc)

## Business decisions (separate thread)
- [x] 9. Email capture — where do signups go? → answered Sep 19 2026: `notify_waitlist` D1 table via POST /api/notify-me (ComingSoon pages + extension waitlist); launch broadcast via GET /api/admin/notify-broadcast
- [x] 10. Annual plan / credit pack — what price/credit size? → answered Sep 26 2026 (annual already shipped `1a398f0c`; packs): 100/500/1,000 credits at ₹249/$7.99, ₹899/$29.99, ₹1,499/$49.99, valid 12 months, spent after monthly allowance (partial OK), FIFO earliest-expiry. New `credit_grants` table (migration 0027), `src/lib/creditPacks.ts`, spend sites rewired, PricingCards "AI credit packs" section, webhook grants on `pack_*` plans, `packCredits` in `/api/account/credits`. Blocked on: Dodo dashboard product IDs in `DODO_PRODUCTS` + applying migration 0027 to D1.

## Save for Focus Time
- [ ] 11. FAQ rollout (~1,060 tools) — multi-day
- [x] 12. Registry-import perf rewrite — eliminated 736KB full registry from client bundles; Homepage -567KB (30%), Tool page -734KB (35%) (commit 52dccf2)

## Mechanical (proven playbook, no decision needed)
- [ ] 13. FAQ rollout — Tier 1 done (category templates personalized, commit 296e435). Still pending: custom FAQs for GSC "crawled, not indexed" flagged tools, then general volume rollout. Weekend task.
- [x] 14. ~~Developer dedup~~ — api-response-formatter → json-formatter, api-error-decoder → http-status-code-checker (commit 0b3b4c0)
- [x] 15. ~~Calculator consolidation~~ — 6 tools redirected to geometry/scientific/date calculators (commit 0b3b4c0)
- [x] 16. ~~Transcription reclassification~~ — Renamed to "Audio Transcript Formatter" / "Video Transcript Formatter", fixed descriptions (commit 0b3b4c0)
- [x] 17. ~~Branding AI-claim fix~~ — Already fixed. deps was "None" (now "AI API"), UI saying "AI-powered" is accurate (tool uses useAiProvider). Auto-generated FAQ now correctly states API key required. (commit ed11ea6)

## Needs one strategic decision
- [ ] 18. Productivity category — build out (habit trackers, focus timers, note tools?)

## GSC monitoring (time-gated)
- [ ] 19. Submit IndexNow / re-validate GSC for this round of fixes (classifier, trust bugs, related-tools, FAQ content) — free nudge, do now
- [ ] 20. GSC check at 2 weeks (early signal) — pull crawled-not-indexed list, check Validate Fix progress bars, per-URL indexing status on the174/220 flagged tools
- [ ] 21. GSC check at 4 weeks (real assessment) — same checks, compare against 2-week data. Recovery is often uneven across pages
- [ ] 22. GSC monthly check-in after 4 weeks — light monitoring cadence

## Immediate actions
- [x] 23. ~~Improve 6 category FAQ templates in ToolPageSEOContent.tsx~~ — Templates now personalized per tool (name, description in first2 questions). All818 tools get unique FAQ text, breaking duplicate content pattern. (commit 296e435)

## Prevention (ongoing)
- [ ] 25. Add lint check: new tools without `faqs` field in registry trigger a warning. Prevents future818-tool backlog. Bake into the tool-addition checklist.
- [ ] 26. Add quality gate script: detect generic FAQ text, duplicate FAQ hashes, thin components (<40 lines), one-way converters missing bidirectional UI, identical description/seoDescription. Run as part of content integrity test suite before every commit.
- [ ] 27. Add category-slug validation: maintain a known-good slug→category mapping, flag mismatches at build time. Catches miscategorized tools before they ship.
- [ ] 28. **FAQ depth audit for Formula-type CalculatorShell tools** — ~120 tools use CalculatorShell with Formula classification. The FAQ rollout (item 11/13/23) only solves thin-content if FAQs are genuinely deep (worked examples, derivation steps, edge cases), not generic templates. Before FAQ rollout: audit all Formula tools' registry `faqs` for: step-by-step derivation, worked numeric example, common mistake warnings, formula variant explanations. Flag tools with <4 FAQs or missing worked examples for manual deepening.

SEO: Add unique meta descriptions to top 50 most-visited tools
SEO: Add internal linking between related tools (reduces thin content signals)

Checkpoint triggers: (a) sitemap lastDownloaded moves past Sep 11, then (b) 2–3 weeks after that, we compare exclusion buckets + indexed count. I'll pull on your word anytime — just say "gsc check".

 [x] Email service — DONE Sep 19 2026 via Cloudflare Email Sending (not Resend): shared src/lib/email.ts; password reset + verification wired in src/lib/auth.ts; contact form, crawl-complete, alerts, uptime all sending

 [x] Newsletter — dead signup removed; no subscribe UI ships (parked per owner Sep 15). No backend needed.

 
## Completed
- [x] C2.3 Eliminate unnecessary `: any` across codebase (Sep 14, commit `be29c121`): 37 files typed; remaining 10 justified (fabric dynamic import, recursive JSON, untyped lib module declarations). tsc clean, 1208/1208 tests green.
- [x] A11y 97+ push (Sep 14, DEPLOYED to production Pages build `8f7e1de8`, commit `256ce85d`): 60 generic labels renamed, 78 icon buttons named, 9 dialogs trapped+labelled, switch/tab/menu/progressbar roles, 9 tablists with arrow-key nav (shared `useRovingTabs`), accordions, live regions, inert hidden trees, tour focus restore. Scans at zero (unnamed/vague/generic); `tsc` clean; full suite 1208/1208 green. xlsx Accessibility 72 → **95** (composite 74.1 → 74.7).
- [x] A/E/X/H QA sweep — 4 commits (cookie/FAQ, a11y, error-handling, mobile)
- [x] Gemini Watermark Remover — commit b185098
- [x] Bulk AVIF Optimizer — commit a9dd4cc
- [x] Bulk HEIC Converter — commit e295260
- [x] Bulk Image Upscaler — commit 2c24b51
- [x] Footer Indian Utilities link — verified consistent
- [x] ⌘K search — verified auto-indexes from toolsRegistry
- [x] Protobuf Decoder — rewrote with real wire format parsing (commit b06b887)
- [x] User Favorites — D1 table, API endpoints, star buttons, homepage section, ⌘K group (commit 5ee786c)

-----------------
1. Session 1 smoke pass — 10 min, keyboard only (Cmd+K + space, dropzone Enter/Space, EMI labels), admin dashboard same.
2. Video WASM console check — upload a small video, watch for CSP/SharedArrayBuffer/wasm red.
3. ZAP green — confirm in Actions tab (see above).
4. PR previews — add the two Cloudflare secrets or flip native PR previews in the Pages dashboard.

5. UI eyes — spot-checks on dense pages only; the systematic queue is already at committed zeros.
5 pages — the densest interactive surfaces in the codebase (ranked by control count):
toolzum.com/developer/unicode-converter — 70 controls (densest file in repo)
toolzum.com/calculator/scientific-calculator — 47 controls
toolzum.com/utility/whatsapp-toolkit — 39 controls
toolzum.com/developer/css-generator — 39 controls
toolzum.com/utility/qr-code-generator — 33 controls
Same drill as Session 4: VoiceOver on (Cmd+F5), arrow through each page, write down anything that announces wrong or nothing (page + control). If these 5 are clean, the eyes queue is effectively closed — everything else is sparser than what's already verified.


Each was left for a specific reason — not skipped, judged:
6. Fingerprint — fixing it would cost privacy credibility. Making anon quotas unbypassable means canvas/WebGL/font fingerprinting or IP-locking. That directly contradicts the "privacy-first, nothing uploaded" promise on the homepage. The anon quota is a speed bump by design; the real anti-abuse layer is already server-side (IP rate limiters on both endpoints). A stronger client fingerprint buys almost nothing — incognito clears it anyway — while weakening the brand claim.
7. UTC skew — nothing user-visible to fix. The local counts are a display-only mirror; every allow/block comes from the server (UTC). The badge shows server values. Aligning the mirror to UTC would churn code + tests to change a number no user ever sees differ. Negative value.
8. Expired cookie — self-healing transient. The window is minutes between expiry and next login, and during it the server is correct (session genuinely invalid → anon limits). Any client-side fix means a session-validation roundtrip on every tool open — a performance cost on 1,148 pages to polish a minutes-long cosmetic mismatch that resolves itself.
Common thread: each "fix" costs more (privacy, churn, performance) than its nuance. That said — your call overrides my judgment on any of them. Say which and I'll implement it the same careful way as 3–5.


Live — carry these three out before deleting:

One rescue — the "Important Notes" honesty block (~15 lines): the coverage-definition warning ("test-file coverage, not statement coverage — clarify externally"), the dependency≠tool-tests gap, and the revenue-critical-first rule. Still true, still load-bearing judgment, and it lives nowhere else.

Contact form — FIXED Sep 19 2026: functions/api/contact.ts relays via Cloudflare Email Sending; success gated on res.ok && data.ok; honest 503/502 fallbacks. Suggest-a-tool boxes (homepage, contact, roadmap) deep-link into it.

  Clipboard honesty long tail: DONE Sep 2026 (commit `1b23e6bc`). Actual scope was 67 unchecked sites (not 154+137 — recount proved it), all converted to checked returns with fallback toasts; 6 direct navigator.clipboard uses were already-guarded reads. Scanner-verified zero remaining.




  Todos — SUPERSEDED Sep 2026, do not action as written:
  (Audit batches below were agent findings, never hand-verified. Spot-checks
  against files actually read disproved 5/5 sampled integrity fires:
  youtube-transcripts DO fetch captions, KeywordDensity multi-word fixed,
  Nickname out-of-bounds guarded, GstinLookup does real Luhn mod-36,
  QrCodeReader shows only real decoded data. Treat the lists below as
  unverified leads, not findings.)
[✓] Audit batch 1: calculator, finance, health, converters
[✓] Audit batch 2: text, developer, seo, image
[✓] Audit batch 3: pdf, video, audio, ai
[✓] Audit batch 4: design, utility, productivity, branding
[✓] Audit batch 5: remaining categories + compile offender list
All 21 categories swept, ~120 offenders. Ranked by trust damage, not count:
Integrity fires — fake output sold as real (fix or delist first):
 1. GstinLookup — fabricates business identity + random dates behind ₹499/mo upsell (indian-utilities/GstinLookup.tsx:22-40).
 2. AppleMusicPreviewExtractor — downloads Blob(['APPLE_MUSIC_PREVIEW_PAYLOAD']) after fake progress (audio/AppleMusicPreviewExtractor.tsx:30).
 3. BulkAudioConverter — non-WAV path returns 100ms of recorded silence labeled .mp3/.ogg (audio/BulkAudioConverter.tsx:51).
 4. BulkFaceAnonymizer (Pro) — "detector" blurs 3 hardcoded rectangles (image/BulkFaceAnonymizer.tsx:24-28).
 5. BulkExifStripperInjector (Pro) — "inject" mode runs the strip path (image/BulkExifStripperInjector.tsx:12-22).
 6. BulkEbookConverter (Pro) — PDF is a filename-only cover page (converter/BulkEbookConverter.tsx:19-30).
 7. BulkInvoiceReceiptParser (Pro) — PDF branch discarded, vendor = first OCR line (finance/BulkInvoiceReceiptParser.tsx:17-33).
 8. youtube-transcript-generator (Pro) — hallucinates analysis from URL string, never fetches captions (transcription/YoutubeTranscriptGenerator.tsx:25).
 9. audio/video-to-text-transcription (both Pro) — accept no media, just rephrase pasted text (transcription/AudioToTextTranscription.tsx:17-26).
10. QrCodeReader — hardcoded fake version metadata, single-decode despite "multiple" claim (developer/QrCodeReader.tsx:72-77).
11. API stubs returning canned data: GraphqlTester (John mock), openapi-to-postman (hardcoded /users), openapi-mock-generator, openapi-validator (substring checks), api-key-validator, DomainAvailabilityChecker (no DNS = "available").
12. PDF liars: PdfToPdfa (metadata-only "conversion"), RepairPdf (theatrical logs, no repair), FlattenPdf (never calls form.flatten()), BulkPdfSizeReducer (ignores quality config), pdf-table-of-contents (canned rows), eml-to-pdf (silently aborts .msg).
Corrupt/wrong output (real code, wrong results): BulkImageResizer contain-crop coords, JsMinifier regex mangles URLs/strings, JwtDebugger base64url fail, BrailleTranslator digit-overwrite, KeywordDensityChecker multi-word never matches, PpiCalculator wrong formula, BabyGrowthPercentile fake LMS, BulkVideoSizeReducer hardcoded 30s duration, NicknameGenerator out-of-bounds crash, WheelOfNames/NatoPhonetic/BarcodeGenerator logic bugs, guard-missing NaNs (TestScore, Ltv, Exponent, Logarithm, SigFigs, Coordinate, Dpi clamps).
Thin-for-name + Pro-gating without pro value: ai-face-swap (manual overlay), ai-image-upscaler (Lanczos, undisclosed), vocal-remover (phase trick), translate-pdf (outputs .txt), subtitle-generator (no auto-transcribe), url-to-pdf (iframe print), video-to-mp3/crop-video/BulkQrCodeGenerator (count-gated thin wrappers), cgpa-to-percentage (crown badge but isPro:false — inverted bug).
Quick wins (labels/gaps): ~15 mislabeled aria-labels (SvgEditor, ToDoList, MacAddressGenerator, PodcastTranscription...), DuplicateWordRemover literal ${}, hardcoded quality label, UrlShortener breaking the client-side claim, ComingSoonTool/browser-extension placeholder pages.
Two caveats: these are agent findings with file:line evidence, not hand-verified — spot-check before fixing. And the count (~10% of catalog) is actually good news: ~90% met the bar. Suggested order: integrity fires (delist-or-fix) → wrong-output math → Pro-gate honesty → quick wins. Want me to start with the top integrity batch?