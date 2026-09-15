# Toolzum TODO Tracker

Last updated: 2026-09-15

## Revealed backlog (Sep 15 — quality-audit was parsing an empty barrel, reporting zeros)
- [x] R1. quality-audit fix (`8bde7cf1`) revealed previously-hidden counts — TRIAGED Sep 15:
  - 774 FAQ-less → routed to #11 bulk path (no action now).
  - 478 missing-deps → privacy cross-check DONE: triage script mapped no-deps tools to modules, flagged 28 network-mention suspects; manual inspection cleared all (OpenAI hits are detection-pattern labels, fetch hits are user-URL checks or sample-code strings, CDN/script links are not exfiltration). Zero privacy-badge corruption found. No normalization needed.
  - 104 card-slug mismatches → routed to #27 known-good map (overlap confirmed, not separate effort).
- [ ] R2. Fail-closed audit follow-up: bundle-budget ✅ fail-closed; CI gates ✅; ZAP ✅ (`fail_action: true`); `submit-indexnow` + `gen-sw` hardened Sep 15 (exit non-zero on API error / empty input). Remaining: re-check any new gate added hereafter parses non-empty input — gates must error, not pass, on unparsable input (same silent-success family as `docs/redirects-dynamic-budget-postmortem.md`).
  - Verification recipe (mandatory for every new gate — this is what caught all three):
    1. Feed it EMPTY input → must error/exit non-zero, never "0 issues".
    2. Inject ONE known-bad item → must name it (ID/slug/path), not just count it.
    3. Revert → must report zero NEW issues while still showing existing backlog (never claim zero existing).
    4. Confirm the parser reads the REAL artifact — not a barrel, proxy, or cache that can silently go stale (the exact `tools.ts` failure).

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
- [ ] 9. Email capture — where do signups go?
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
- [x] 26. Quality gate remainder — BUILT Sep 15 (`scripts/faq-gate.ts`, wired into lint-staged for chunks + templates):
  - Hash-dupe = 5-gram Jaccard ≥ 0.30 (measured: customs 0.00–0.02, fallback pairs 0.45–0.57; word-count alone can't separate — fallback blocks run 132–145 words vs customs 150–176, so thin ≡ template-similar).
  - Thin metric folded into the same check (no separate word-count gate — data showed it would pass boilerplate).
  - One-way = X-to-Y with both sides in FORMAT_INFO, no reverse slug, no swap UI (bulk + actions excluded; mp4/mov/webm-to-mp3 extraction accepted). 6 genuine gaps remain (gif-to-mp4, eml-to-pdf, html-to-jsx, svg-to-css, pdf-to-png, csv-to-sql) → product backlog, not blockers.
  - Fail-closed throughout: empty parse/templates exit 2; touched-scope exit 1 on fail, `--full` validates bulk output.
  - Remainder: thin-COMPONENT check (<40 lines of code — distinct from thin-FAQ, folded above) still open; identical desc/seoDesc already covered by content-integrity test.
  - Note: thin-components is a CODE-quality metric (C2/monolith family), not FAQ-remediation scope — parked as separate backlog; does not block #11.
- [x] 27. Category-slug validation — BUILT Sep 15 (quality-audit sitemap-vs-registry check; consistent on current build). Verdict: SINGLE mechanism, no duplicate map — classification derives from registry fields (category + slug verbs + FORMAT_INFO), validated cross-artifact. A checked-in copy would rot. Count-only archetype pass: 5 buckets cover 617/1144, 527 ambiguous (compress/merge/edit/remove/make verbs) → bulk generator needs ~10 verb-led archetypes, not force-fitting. 104 card-slug items dissolve here.
- [ ] 28. **FAQ depth audit for Formula-type CalculatorShell tools** — ~120 tools use CalculatorShell with Formula classification. The FAQ rollout (item 11/13/23) only solves thin-content if FAQs are genuinely deep (worked examples, derivation steps, edge cases), not generic templates. Before FAQ rollout: audit all Formula tools' registry `faqs` for: step-by-step derivation, worked numeric example, common mistake warnings, formula variant explanations. Flag tools with <4 FAQs or missing worked examples for manual deepening.

SEO: Add unique meta descriptions to top 50 most-visited tools
SEO: Add internal linking between related tools (reduces thin content signals)

Checkpoint triggers: (a) sitemap lastDownloaded moves past Sep 11, then (b) 2–3 weeks after that, we compare exclusion buckets + indexed count. I'll pull on your word anytime — just say "gsc check".

 Wire up email service (Resend)
 Wire Resend email service for forgot-password/reset-password

  PARKED Sep 15 2026 per owner (no newsletter planned) — dead `ChangelogNewsletter` signup removed from changelog page; component deleted. Only transactional quota/credit nudges if ever.

 
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

The C2.3 remainder block, verbatim. It's today's live process note and still accurate (75 + 51, batch gate, skip-list, next-up batch). Everything around it can go.
Pentest (item 10) is already in your human-side pending list, so it's preserved there.


Session 1 — smoke pass (10 min, keyboard only, no mouse) — DONE 2026-09-14 (human pass: Cmd+K + space, dropzone Enter/Space, EMI labels all correct).
1. Search: open toolzum.com, press Cmd+K, type font converter with the space. Then Esc. Pass = space types, results filter, Esc closes and focus returns to the search button.
2. Dropzone: open toolzum.com/design/font-converter. Tab until the dashed box has a visible outline. Press Enter (file picker must open), cancel, Tab back, press Space (picker opens, page must NOT scroll).
3. Labeled form: open toolzum.com/finance/emi-calculator. Tab through the three fields — each must show its name correctly.

2. Video WASM console check
Open toolzum.com (live, after this deploy finishes) in Chrome desktop.
Press Cmd+Option+J (Mac) to open DevTools console. Keep it open.
Open any video tool (e.g. search "video compress"), upload a small video, run it.
Watch the console for red errors mentioning any of: Content Security Policy, blocked, SharedArrayBuffer, failed to fetch, wasm.
Report back: either "clean, video processed, no console errors" or paste the exact red error text.

Needs humans (all batched, none scheduled):
- Smoke re-pass on new UI (chips, tour, empty states)

- ZAP weekly run going green on its own (allowlist is in — confirm on next Monday run or manual trigger)

Needs UI eyes (~100 labels) — the only agent-side queue left, and it's blocked on looking, not tooling.


Session 3 — VoiceOver pass (the big one) — DONE 2026-09-14 for most listed tools: controls speak correct names, ~90% success rate.

Session 4 — UI-look naming — DONE IN CODE 2026-09-14 (no manual batches needed): worst-offender mining fixed 32 Copy/Download + vague actions + single letters + duplicates (commits `f3a763d1`, `e99c5639`). Human spot-checks on dense pages remain optional.
1. On Mac: turn on VoiceOver with Cmd+F5. Move with Ctrl+Option+Right arrow. Stop with Cmd+F5.
2. Visit each page below and arrow through it. For every button, box, and field, listen: does it announce a clear name ("Loan Amount", "Upload font file") or something useless ("button", "edit text", silence)?
3. Write down any that announce wrong or nothing, with the page name:
- toolzum.com/finance/emi-calculator
- toolzum.com/finance/sip-calculator
- toolzum.com/finance/gst-calculator
- toolzum.com/finance/currency-converter
- toolzum.com/calculator/age-calculator
- toolzum.com/health/bmi-calculator
- toolzum.com/image/image-compressor
- toolzum.com/pdf/pdf-merger
- toolzum.com/utility/qr-code-generator
- toolzum.com/utility/password-generator
- toolzum.com/utility/unit-converter
- toolzum.com/utility/timer
- toolzum.com/utility/stopwatch
- toolzum.com/text/word-counter
- toolzum.com/developer/json-formatter
- toolzum.com/design/font-converter
- toolzum.com/design/color-picker
- toolzum.com/indian-utilities/rental-agreement-generator
- toolzum.com/utility/todo-list (if it exists — search it; skip if not)
- toolzum.com/utility/base64 (same — search, skip if missing)

Session 4 — UI-look naming (only if sessions 1–3 are done)
I'll give you these in small batches of 10 with screenshots-worth of context ("this box, next to that text — what should it be called?"). Say the word when you get here and I'll prepare the first batch.
Report format for everything: page name + what you pressed + what happened (or what it announced). Short lines are perfect.



Each was left for a specific reason — not skipped, judged:
6. Fingerprint — fixing it would cost privacy credibility. Making anon quotas unbypassable means canvas/WebGL/font fingerprinting or IP-locking. That directly contradicts the "privacy-first, nothing uploaded" promise on the homepage. The anon quota is a speed bump by design; the real anti-abuse layer is already server-side (IP rate limiters on both endpoints). A stronger client fingerprint buys almost nothing — incognito clears it anyway — while weakening the brand claim.
7. UTC skew — nothing user-visible to fix. The local counts are a display-only mirror; every allow/block comes from the server (UTC). The badge shows server values. Aligning the mirror to UTC would churn code + tests to change a number no user ever sees differ. Negative value.
8. Expired cookie — self-healing transient. The window is minutes between expiry and next login, and during it the server is correct (session genuinely invalid → anon limits). Any client-side fix means a session-validation roundtrip on every tool open — a performance cost on 1,148 pages to polish a minutes-long cosmetic mismatch that resolves itself.
Common thread: each "fix" costs more (privacy, churn, performance) than its nuance. That said — your call overrides my judgment on any of them. Say which and I'll implement it the same careful way as 3–5.


Live — carry these three out before deleting:

One rescue — the "Important Notes" honesty block (~15 lines): the coverage-definition warning ("test-file coverage, not statement coverage — clarify externally"), the dependency≠tool-tests gap, and the revenue-critical-first rule. Still true, still load-bearing judgment, and it lives nowhere else.

Contact form still fakes it (contact/page.tsx:49 — localStorage + simulated success, no email/API). Real fix needs a backend (Cloudflare Email Service / worker) — product decision first.

Clipboard honesty long tail: 154 clipboardWrite callers + 137 direct navigator.clipboard uses still assume success. Batch-convert to checked returns with fallback toasts. Shared shells already done.