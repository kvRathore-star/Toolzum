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
- [ ] 10. Annual plan / credit pack — what price/credit size?

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

OPENAI_API_KEY + GROQ_API_KEY in Pages secrets — without them transcription 500s in production
#36 test purchase (also proves receipt emails), billing SMTP/gateway access
Visual QA — still the one unverified layer

Temp-mail receipt test: open /privacy/temp-email-generator/, generate an address, send it an email from your Gmail, watch it land
Billing live test: buy the $3.99 Pass yourself → confirm Pro grant + receipt email → refund yourself in Dodo → confirm downgrade
PageSpeed check post-deploy (static audit is clean; real numbers need a browser)


Existing notifications — complete list, all verified in code:
- Signup verification, password reset, contact→team, sitemap-completion (opt-in) — all live
- Receipts + payment-failure emails — coded in the webhook, unproven (needs the #36 test purchase)
- Waitlist capture — stores interest, sends nothing (correct)
- Missing: welcome email. That's it for honest transactional mail.

(2) Top-ups need a schema change: refills overwrite balance to the allowance, so purchased credits would be wiped at reset — they need a separate bonus_credits column (or ledger), spent alongside allowance, with an expiry policy.

Top-up build (if you want it): Dodo pack products → webhook credits bonus column → balance UI already exists → 403 path already surfaces → and then low-credit warnings become legitimate. Moderate lift, mostly backend. Build it?

Fix How-to-use, description, FAQs (honest claims

PDF Editor (the flagship gap) — v1 as specced: toolbar + canvas + thumbs + pdf-lib export, free, local.
Shelf structure on /pdf — regroup existing tools into their shelves (Page Management, Edit & Annotate, Create, Convert, Security) instead of one long list.
Gap tools — the ~18 missing, starting with the trust-differentiators (Auto-Redact PII, Fingerprint, Chat with PDF), then edit-adjacent.


Temp mail → verification loop. The old flow destroyed your live address first, then asked the server for a new one — but Turnstile tokens are single-use and already spent, so you always landed back at the verification screen with no inbox. Now: mint first, retire after — your current inbox stays live until the fresh address actually lands, and the verification widget now sits in the live view too (it used to exist only on the empty screen, so a fresh check was impossible without losing your address).
2. QR reader → "no image found". The old code only recognized png/jpeg/webp, and — the real trap — copying a file is not copying an image: a file from Finder/Explorer puts a file reference on the clipboard, not pixels. Now the tool reads whatever image types the clipboard actually holds (gif/bmp/avif/tiff included) and, when there's no pixel data, names what it found ("clipboard holds text/uri-list… open the image and copy the picture itself, not the file").
3. Screenshot → proxies failed. We were depending on three free public proxies as the only path — all flaky, rate-limited, Shields-flagged. Now there's a first-party fetcher (/api/fetch-page): same-origin, no CORS, no third-party limits, with SSRF guards, HTML-only check, size cap, and per-IP rate limiting. Public proxies are fallback only. Bonus honesty: refusals now say which failure (site blocks bots / not a web page / too large) instead of one generic blob.