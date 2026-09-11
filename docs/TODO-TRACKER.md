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
- [ ] 26. Add quality gate script: detect generic FAQ text, duplicate FAQ hashes, thin components (<40 lines), one-way converters missing bidirectional UI, identical description/seoDescription. Run as part of content integrity test suite before every commit.
- [ ] 27. Add category-slug validation: maintain a known-good slug→category mapping, flag mismatches at build time. Catches miscategorized tools before they ship.
- [ ] 28. **FAQ depth audit for Formula-type CalculatorShell tools** — ~120 tools use CalculatorShell with Formula classification. The FAQ rollout (item 11/13/23) only solves thin-content if FAQs are genuinely deep (worked examples, derivation steps, edge cases), not generic templates. Before FAQ rollout: audit all Formula tools' registry `faqs` for: step-by-step derivation, worked numeric example, common mistake warnings, formula variant explanations. Flag tools with <4 FAQs or missing worked examples for manual deepening.

SEO: Add unique meta descriptions to top 50 most-visited tools
SEO: Add internal linking between related tools (reduces thin content signals)

 Wire up email service (Resend)
 Wire Resend email service for forgot-password/reset-password

 Newsletter has no backend — clicking subscribe does nothing (would need a Cloudflare Worker or email service)

 gsc connect with agent ide
  
  PDF Workflow Builder, Bulk PDF Suite- ui ihatepdf.cv/

  changelog update

  Quick wins:
- Check analytics_event / download_event tables have data flowing in D1
- Any remaining tool fixes from your list?
- Pricing page or Pro features to refine?
- Analytics dashboard for yourself (admin)? 

- Exact Limits
User type	Daily limit
Anonymous (not signed in)	3
Signed-in free user	5
Pro user	Unlimited
That's a business decision, but here's the data:
- The real Pro upsell is batch processing (500 files), file size (2GB vs 30MB), and parallel threads (6 vs 1) — not the download count
- The download quota is more of an anti-abuse mechanism than a conversion lever

Pro downloads used up today- shows in pro acc?
3 free downloads left today- says in pro acc
they should be user state aware acc to User type	Daily limit
Anonymous (not signed in)	3
Signed-in free user	5
Pro user	Unlimited

pro acc shows- pro 300 AI credits/month on acc pge
while on dashboard says- 100 remaning

recent activiy tool says not all but few like emi calculator- 404 Page not found
This page doesn't exist or may have been moved. Try searching the tools directory.




 use CalculatorShell with: which 
1. Truly bare/minimal tools — tools with just a plain form and no styling
2. Calculator-style tools — inputs → calculate/auto → result
Two-column layout (inputs left, result panel right) 
Preset chips for quick values, 
Result panel with stats, copy/download/history
reusable CalcActions component (copy + download + history)
3. Tools with inconsistent UI — where you want uniform look
Icon + title with border-bottom
Added icon prop to CalculatorShell 
Finance tools: DollarSign icon
Calculator tools: Calculator/GraduationCap/Monitor icons
Health tools: Heart icon
Math tools: Calculator icon
Developer tools: Code icon etc.



## Completed
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


97+ Scorecard Plan — Verified & Detailed
Current: 87/100 → Target: 97+
Tool count: 1,149 tools (1,067 client + 82 SEO) across 21 categories
Tier A — High-impact, contained work (get to ~92)
A1. Accessibility (74 → 82, +8 points)
Verified gaps:
- ~907 of 912 inputs lack htmlFor/aria-label/aria-labelledby
- Hundreds of onClick handlers without paired keyboard handlers
- Skip link CSS exists but is NOT wired up in any component
- No focus trap library (only Radix Dialog has built-in)
- 21 aria-live regions exist (good foundation)
Tasks:
- A1.1 Run eslint --rule '{"jsx-a11y/click-events-have-key-events": "error"}' to get exact count of onClick violations
- A1.2 Wire up skip link: add <a class="skip-link" href="#main">Skip to content</a> in src/app/layout.tsx
- A1.3 Add htmlFor/id pairs to all 912 inputs (batch across 1,067 tools — can use codemod)
- A1.4 Install focus-trap package, apply to GDPR banner, ShareTool, FavoritesSignInModal, DownloadLimitModal
- A1.5 Add heading hierarchy lint rule or test (enforce h1 → h2 → h3 order)
- A1.6 Flip jsx-a11y rules from "warn" to "error" in eslint.config.mjs:18-23 after fixes
- A1.7 Manual screen-reader test with VoiceOver on top 20 tools
A2. Testing (82 → 86, +4 points)
Verified gaps:
- 155 test files exist, but NO vitest coverage config
- 18 API endpoints have ZERO contract tests
- Only 11 guarded calculators (not 20+)
- No Playwright/Cypress
Tasks:
- A2.1 Add @vitest/coverage-v8 to devDependencies, configure coverage in vitest.config.ts
- A2.2 Write contract tests for top 5 API endpoints: ai/generate, analytics, favorites, payments, auth
- A2.3 Add unit tests for remaining 5 untested guarded calculators (11 total, check which lack tests)
- A2.4 Install Playwright, create playwright.config.ts, write E2E test for critical path: home → category → tool → execute → download
- A2.5 Add E2E test for auth flow: signup → login → session → logout
A3. Documentation (71 → 76, +5 points)
Verified gaps:
- README.md exists but is OUTDATED (says "260+ tools")
- Zero README files in src/components/tools/modules/shared/
- Only 8 of 37 scripts have JSDoc (22%)
- No CONTRIBUTING.md
Tasks:
- A3.1 Update README.md with current stats (1,149 tools, 21 categories, correct architecture references)
- A3.2 Create CONTRIBUTING.md with setup, conventions, PR guidelines
- A3.3 Add JSDoc to 25 undocumented scripts in scripts/
- A3.4 Create src/components/tools/modules/shared/README.md documenting CalculatorShell props, auto-calculate rule, guard pattern
- A3.5 Add JSDoc to CalcActions.tsx, categoryTheme.ts, DynamicModuleWrapper.tsx exports
Tier B — Structural improvements (get to ~95)
B1. Mobile/PWA (72 → 80, +8 points)
Verified gaps:
- @capacitor/ios in package.json but NO ios/ directory
- Service worker exists and is robust (Workbox, 15+ cache routes)
- No responsive design tests
- No device-specific WASM optimization
Tasks:
- B1.1 Run npx cap add ios to initialize iOS platform
- B1.2 Configure iOS-specific settings in capacitor.config.ts (splash screen, status bar, etc.)
- B1.3 Test build: npx cap sync ios && npx cap open ios
- B1.4 Add WASM adaptive loading: detect device RAM/CPU, skip heavy WASM on low-end (check navigator.deviceMemory)
- B1.5 Add Playwright responsive tests for 3 breakpoints: 375px (mobile), 768px (tablet), 1280px (desktop)
- B1.6 Audit service worker: verify @ducanh2912/next-pwa is properly integrated in next.config.ts (currently not called)
B2. UX (82 → 90, +5 points) (Note: your plan says 85→90, but original scorecard was 82)
Verified gaps:
- CommandMenu exists but has no filters, no fuzzy config, no search history
- Tool loading states are GOOD (skeleton + timeout)
- Empty-state UX is MINIMAL (only search has it)
- No onboarding flow
Tasks:
- B2.1 Add category filter to CommandMenu (dropdown or chips above search)
- B2.2 Add search history (localStorage, show last 5 searches)
- B2.3 Create reusable EmptyState component with icon, message, CTA
- B2.4 Add empty states to top 20 tools that show zero-data scenarios
- B2.5 Create simple onboarding: first-visit tooltip tour showing Cmd+K, category nav, theme toggle
B3. Security (86 → 90, +4 points)
Verified gaps:
- CSP is NOT configured at all (no headers in next.config.ts, middleware, or wrangler.toml)
- public/_headers has CSP but only for static files on Cloudflare Pages
- No penetration test
- CSRF handled by better-auth (good)
Tasks:
- B3.1 Add CSP headers in next.config.ts or _middleware.ts with nonce-based approach
- B3.2 Remove unsafe-inline from CSP: use nonces for inline scripts/styles
- B3.3 Investigate TF.js/Tesseract newer versions that don't require eval (to remove unsafe-eval)
- B3.4 Schedule third-party penetration test (or use a tool like OWASP ZAP for automated scan)
- B3.5 Add session expiry configuration in better-auth config
Tier C — Polish (get to 97+)
C1. Error Handling (85 → 92, +7 points)
Verified gaps:
- Error boundaries ALREADY cover all 1,149 tools via DynamicModuleWrapper
- 3 separate error UIs exist (not standardized)
- No shared ErrorMessage component
Tasks:
- C1.1 Create shared ErrorMessage component with icon, title, message, retry button, copy error
- C1.2 Refactor ErrorBoundary.tsx, GlobalErrorBoundary.tsx, app/error.tsx to use shared component
- C1.3 Add error message standardization: map error types to user-friendly messages
- C1.4 Add recovery UX: retry with exponential backoff, fallback UI for failed WASM loads
C2. Code Quality (90 → 94, +4 points)
Verified gaps:
- 29 files exceed 500 lines (largest: 2,280 lines)
- ~223 any usages (140 annotations + 83 casts)
- strict: true is on but missing stricter options
Tasks:
- C2.1 Split SecurityTools.tsx (2,280 lines) into focused modules (password, hash, encoding, network tools)
- C2.2 Split DataToolkitWidgets.tsx (1,392 lines) into individual tool components
- C2.3 Run grep -r ': any' src/ --include="*.tsx" | wc -l to get exact count, fix top 50 highest-impact files
- C2.4 Add noUncheckedIndexedAccess: true to tsconfig.json, fix resulting errors
- C2.5 Add noFallthroughCasesInSwitch: true to tsconfig.json
C3. CI/CD (90 → 93, +3 points)
Verified gaps:
- No PR preview deployments (Cloudflare Pages from main only)
- Bundle analyzer exists but no size alerts
- No visual regression testing
Tasks:
- C3.1 Configure Cloudflare Pages preview deployments for PRs (branch-aware deploy)
- C3.2 Add bundlesize or GitHub Action for bundle size comparison on PRs
- C3.3 Set size budget: fail PR if main bundle exceeds threshold (e.g., 500KB)
- C3.4 Install Chromatic or Percy for visual regression testing
- C3.5 Add visual regression test for CalculatorShell (most-used shared component)
Execution Order
Session 1 (Tier A): A1.1-A1.7 → A2.1-A2.5 → A3.1-A3.5 → Score: ~92
Session 2 (Tier B): B1.1-B1.6 → B2.1-B2.5 → B3.1-B3.5 → Score: ~95
Session 3 (Tier C): C1.1-C1.4 → C2.1-C2.5 → C3.1-C3.5 → Score: ~97
Corrections to Your Original Plan
Item	Your Claim	Verified Actual
Tool count	"260+"	1,149 (1,067 client + 82 SEO)
Guarded calculators	"20+"	11
CSP status	Implied configured	NOT configured (only in public/_headers for static files)
Error boundaries	"on every tool module" needed	Already cover all tools via DynamicModuleWrapper
Service worker	Implied needs work	Already robust (Workbox, 15+ cache routes)
README existence	Implied missing	Exists but outdated
UX score	"85"	82 (original scorecard)










Here is your complete test list. Do it in this order — each session is independent, so you can stop after any of them.
Session 1 — smoke pass (10 min, keyboard only, no mouse)
1. Search: open toolzum.com, press Cmd+K, type font converter with the space. Then Esc. Pass = space types, results filter, Esc closes and focus returns to the search button.
2. Dropzone: open toolzum.com/design/font-converter. Tab until the dashed box has a visible outline. Press Enter (file picker must open), cancel, Tab back, press Space (picker opens, page must NOT scroll).
3. Labeled form: open toolzum.com/finance/emi-calculator. Tab through the three fields — each must show its name correctly.

Session 2 — admin check (10 min, sign in as admin first!)
⚠️ Live data — open things but always Cancel, never confirm.
1. Open toolzum.com/admin/users. Tab to a table row, press Enter — detail panel must slide in.
2. Keep pressing Tab — focus must stay inside the panel. Press Esc — panel closes, focus returns to the row.
3. Change a user's Role → confirm dialog pops up → press Esc (Cancel, don't confirm) → only the dialog closes.
4. Click Delete on a user → second dialog stacks → Esc closes only the top one (Cancel, don't confirm).
Session 3 — VoiceOver pass (the big one)
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


2. Video WASM console check
Open toolzum.com (live, after this deploy finishes) in Chrome desktop.
Press Cmd+Option+J (Mac) to open DevTools console. Keep it open.
Open any video tool (e.g. search "video compress"), upload a small video, run it.
Watch the console for red errors mentioning any of: Content Security Policy, blocked, SharedArrayBuffer, failed to fetch, wasm.
Report back: either "clean, video processed, no console errors" or paste the exact red error text.

Needs humans (all batched, none scheduled):
- Smoke re-pass on new UI (chips, tour, empty states), admin keyboard check, VoiceOver top-20
- ZAP weekly run going green on its own (allowlist is in — confirm on next Monday run or manual trigger)
- Video WASM console check (devtools on a video tool, one red-error scan)
Needs UI eyes (~100 labels) — the only agent-side queue left, and it's blocked on looking, not tooling.