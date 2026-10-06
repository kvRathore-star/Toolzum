# SEO Batch Status — content program tracker (Oct 6)

> Selection rule (unchanged since batch 1): parked (`Crawled – currently not
> indexed` per Oct 5 sweep) + no custom FAQs, ordered by category demand
> (PDF → Image → Developer → Indian-utilities → Converter → Audio →
> Calculator → Finance → Video → Text). Never-crawled pool waits until
> parked pool is done. Standard: playbook §10.7 (28 points, test-locked).

## Done (562 tools at 4–7 FAQs, verified)

| Batch | Tools | Commit |
|---|---|---|
| Base customs (pre-existing) | 371 | earlier history |
| Top-30 (PDF/Image) + titles | 30 | a43235d7 / a4d8f845 |
| Next-30 (Image/Developer) | 30 | 3eac231c |
| Dev-30 + defend-3 | 32 | 9dcef5d1 (+defend) |
| 5th batch (Dev/India/Conv/Audio) | 30 | 0a21dee2 |
| India-9 + defend top-up | 11 | 5f57a2b9 (+uncommitted top-ups) |
| 6th batch (Audio/Calc) | 30 | 515975c0 |

How-to coverage on done set: 0 bare `other` (verified Oct 6 — specific
pattern or custom instructions on every one of the 562).

## Remaining (499 tools, no custom FAQs)

- Parked + no FAQs: **62** (priority — Google actively judging)
- Unknown + no FAQs: **415** (phase 2)
- Other states: 22

## Next-30 queued (parked order)

business-days-calculator, day-of-week-calculator, day-of-year-calculator,
exponent-calculator, college-gpa-calculator, leap-year-calculator,
proportion-calculator, ratio-calculator, aspect-ratio-calculator,
dpi-calculator, fraction-calculator, ppi-calculator,
pythagorean-theorem-calculator, quadratic-equation-solver,
rectangle-area-calculator, square-root-calculator,
standard-deviation-calculator, date-difference-calculator,
inflation-calculator, video-trimmer, bulk-subtitle-time-shifter,
mute-video, video-filters, mov-to-webm, character-counter,
font-generator, text-replacer, ascii-table-generator,
ai-paraphrasing-tool, audio-to-text-transcription.

Note: ai-paraphrasing-tool + audio-to-text-transcription are credit/AI tools —
privacy answers must carry credit framing (see §7b), not local-only text.

## Schedule — anchored to Oct 13 re-sweep (confirmed Oct 6)

| When | Work | Why then |
|---|---|---|
| Oct 6–7 | Pro-tool content (65 tools: Batch 1 = 30 credit-urgent, Batch 2 = 35 bulk/moat) | Revenue tier first; AI credit-honesty urgent |
| Oct 8 | CWV audit + AI-citation baseline | Fast measurement; sets remaining baselines |
| Oct 9–10 | Cannibalization mapping | Needs full content picture; feeds consolidation decisions |
| Oct 11–12 | Hub upgrades (badges, category wheel, trust strip) | Visible hub improvements pre-sweep |
| Oct 13 | Re-sweep + measure | The verdict on everything shipped |
| Ongoing | Content batches (~30/2 days) + visuals pipeline + outreach | Steady engine past 550 |

Visuals (screenshots per tool) is the longest pole — needs a render
pipeline, not just writing; spec Oct 10 alongside cannibalization so it
doesn't block content flow.

## Pro-tool program (65 proSlugs, verified Oct 6: 22 with FAQs / 43 without)

Standard: playbook §10.7 (28 points, test-locked) + premium bar for this
tier: indexing + ranking + premium value + user satisfaction; concrete
numbers/engines/limits in every answer; worked example where a number
exists; low-medium competition query targeted; credit/quota disclosure
before effort; zero absolutes beyond tier; Google-loved Q&A shape
(40–60 word direct answers, question as users ask it).

Batch 1 (30, credit-honesty urgent — Oct 6–7 first): ai-image-generator,
ai-document-chat, ai-paraphrasing-tool, ai-translator, ai-image-upscaler,
ai-face-swap, ai-bg-changer, ai-thumbnail-maker, ai-cover-letter-generator,
ai-chat-pdf, grammar-checker, ai-humanizer, ai-detector,
youtube-transcript-generator, podcast-transcription,
meeting-minutes-generator, indian-voice-transcriber, subtitle-translator,
audio-to-text-transcription, video-to-text-transcription,
brand-color-palette-generator, complaint-letter-generator,
pdf-ai-summariser, resume-ats-score-checker, saas-metrics-dashboard,
bank-statement-analyser, api-builder, pdf-workflow-builder,
bulk-pdf-suite, bulk-image-converter.

Batch 2 (35, bulk/moat — next): bulk-bg-changer, bulk-qr-code-generator,
bulk-image-watermark, bulk-pdf-data-extractor, bulk-image-to-pdf,
bulk-audio-converter, bulk-svg-to-png, bulk-image-compressor,
bulk-pdf-size-reducer, bulk-image-resizer, bulk-video-compressor,
bulk-pdf-merger, bulk-face-anonymizer, bulk-pdf-form-extractor,
bulk-video-size-reducer, bulk-audio-normalizer, bulk-video-subtitle-burner,
bulk-invoice-receipt-parser, bulk-csv-excel-to-json, bulk-url-status-checker,
bulk-exif-stripper-injector, bulk-app-icon-generator,
bulk-markdown-to-pdf-html, bulk-font-subsetter, bulk-subtitle-time-shifter,
bulk-regex-extractor-replacer, bulk-image-to-text-ocr, bulk-ebook-converter,
bulk-heic-to-jpg, bulk-url-shortener, batch-image-editor,
image-bulk-converter, bulk-avif-optimizer, bulk-heic-converter,
bulk-image-upscaler.

## Pro Batch 1 DONE (Oct 6 — 30/30, gates green)

135 FAQs + 30 descriptions + 30 seoTitles + 30 seoDescriptions.
4–6 FAQs per tool (flagships 6, standard 4–5); every answer carries
concrete numbers (1 credit / 1-per-minute, 5 trial, 200 Pro, 25 MB /
30-min caps, 2 Pro downloads/day) + worked example + unique privacy
framing. Credit-vs-local distinction kept: pasted-text formatters bill
1 credit/call (not per-minute); local tools (upscaler, face-swap,
bg-changer, grammar-base, humanizer-template, detector) disclose page
limits, never credits. (Complaint-letter own-key line below superseded —
recheck proved 1 credit; see RECHECK.)

Gates: tsc 0 · eslint 0 · content-standard + claims-integrity +
interaction-pattern + sitemap (23 tests) green · faq-gate --full same 6
pre-existing one-way-converter gaps, 0 new · quality-audit 0 issues.
Customs coverage: 562 → 581 of 1,143 (19 newly gained FAQs; 11 upgraded).

Next: Batch 2 (35 bulk/moat) queued.

## Pro Batch 1 RECHECK (Oct 6 — passed with 12 repairs)

Mechanical 28-pt re-audit + component-code truth check found 12 factual
gaps; all fixed and re-gated green:
- 5 wrong credit claims fixed against `CREDIT_COST_SLUGS` + components:
  complaint-letter (own-key → 1 credit), youtube-transcript (+1/video),
  subtitle-translator (+1/file), resume-ats (+1/check),
  grammar/humanizer (base free-local, AI boost 1 credit).
- 4 invented download limits corrected to component truth
  (`downloadOrShare` presence): saas (no gate — page lock only),
  api-builder (no gate — page lock only), bank-statement (export-only),
  ai-detector (report-save only).
- bulk-image-converter seoTitle regained "Free".
- 13 mechanics-accurate custom `instructions` added (incl. bare-`other`
  bank-statement-analyser; paste-text formatters were on
  upload-convert-download; api-builder/upscaler/face-swap misrouted).
- Pollinations pace note (4/min breather); subtitle season math (10 eps =
  10 credits).
Final: tsc 0 · eslint 0 · 26 tests green · faq-gate 0 new ·
quality-audit 0 · 0 bare-`other` · 0 trios · 0 shared sentences.

## Pro Batch 2 DONE (Oct 6 — 35/35, gates green)

2a (18): bg-changer, qr-generator, watermark, pdf-extractor, image-to-pdf,
audio-converter, svg-to-png, compressor, size-reducer, resizer,
video-compressor, merger, face-anonymizer, form-extractor,
size-reducer-v, normalizer, subtitle-burner, invoice-parser.
2b (17): csv-excel-json, url-status, exif, app-icon, markdown-pdf,
font-subsetter, subtitle-shifter, regex, ocr, ebook, heic-to-jpg,
url-shortener, batch-editor, image-bulk-converter, avif-optimizer,
heic-converter, image-upscaler.
~150 FAQs (4–5/tool, flagships 5–6) + descriptions + seoTitles +
8 mechanics-accurate custom instructions (4 bare-`other` + 4 misrouted).
Server-side truth kept: url-shortener (cloud, ~10/min backend pace,
clipboard + CSV export); url-status (~15 checks/min auto-resume).
Bulk quota truth uniform: anon page-lock, signed 2 Pro batches/day,
Pro unlimited to 500 files/2 GB.
Gates: tsc 0 · eslint 0 · 23 tests green · faq-gate 0 new ·
quality-audit 0 · 0 bare-`other` · 0 trios.
Customs coverage: 581 → 604 of 1,143. Pro program complete: 65/65.

## Both-commits RECHECK (Oct 6 — 2 real harms + refinements fixed)

Adversarial pass over all 65 pro tools (code-truth vs copy):
- HARM 1 (fixed): 32/60 descriptions were STALE — a quote-style bug in
  the batch applier skipped double-quoted `description:` fields, leaving
  old template closers live (shared-sentence clusters 7x/5x/3x). Repaired
  quote-agnostically; exact-sentence sharing now zero at 3+.
- HARM 2 (fixed): url-shortener hid third-party processing — backend
  proxies to TinyURL (verified `functions/api/url-shorten.ts`: 10/min,
  TinyURL retention owns links). Copy now discloses TinyURL + keeps no
  batch list. (url-status verified clean: HEAD checks, ≤45/req, 2-hop
  max, no result storage.)
- Refinements: 11 quota-closers diversified to unique sentences;
  Pollinations de-`unlimited` (4/min pace); detector bands matched to
  component (`~35` meter); youtube 70% stat removed; bank accuracy range
  softened; AVIF share softened; 7 bare-`unlimited` reworded to
  uncapped-local truth.
Gates: tsc 0 · eslint 0 · 26 tests green · faq-gate 0 new ·
quality-audit 0 · 0 bare-`other` · 0 trios · 95/95 mechanical checks OK.

## Shortener failover (Oct 6 — owner decision: keep Pro + fallback)

`functions/api/url-shorten.ts` now tries TinyURL then is.gd (first
valid `https?://` body wins; 502 only if both fail). No frontend change
needed — failover is server-side; bulk backoff behavior unchanged.
Copy is provider-neutral (no brand headline) but keeps the material
fact: third-party service receives each URL. Deps corrected
`Node.js / Redis` → real providers on both shorteners.
Gates: tsc 0 · eslint 0 · edge/claims/content/UrlShortener 18 green ·
faq-gate 0 new · quality-audit 0.

## How-to completion (Oct 6 — 65/65 pro tools custom)

Remaining 39 instruction sets shipped mechanics-first: text/AI tools get
paste→options→generate steps with credit costs; local media tools get
upload→exact-setting→save steps with quota in step 3; utility/dev/seo
tools (regex, url-checker/shortener, csv-json, api-builder, saas) get
workflow steps matching their real UIs — no generic category templates.
Caught live: correcting shortener deps to TinyURL/is.gd flipped both to
`ai-generate` via the loose `'api'` matcher — exclusion added, both back
to paste-text, locked test green.
Gates: tsc 0 · eslint 0 errors · 23 tests green · faq-gate 0 new ·
quality-audit 0. Pro tier now 65/65 on FAQs + how-to + meta.

## Mass how-to round (Oct 6 — 532 tools, 0 identical blocks)

All remaining FAQ'd tools got tool-specific 3-steps: format/action nouns
from names, real engines from deps, caps/quota in final steps; dev/utility
hard cases hand-verbed (parse/inspect/debug/normalize/lint/reindent…);
calculators got standard input sets + scenario step; 25 handcrafted
specials (timers, recorders, TTS/STT, multi-tools). Utility/dev no longer
on generic category templates anywhere in the FAQ'd set.
Gates: tsc 0 · eslint 0 · 23 tests green · faq-gate 0 new · quality-audit 0.
Registry: 605 tools with custom instructions.

## CWV + AI baselines (Oct 6 — partial, honestly labeled)

Server-side measured (production, mobile UA): 200s everywhere, 24–47 KB
compressed HTML, TTFB 0.7–1.3s (weak signal — re-measure from India).
Static audit clean: self-hosted fonts, zero blocking third-party scripts,
immutable caching, lazy tool modules, no LCP/CLS bombs in shell.
Lab (Lighthouse) + field (CrUX) impossible from here — owner/CI step.
AI citations: 12-query tracking sheet created, baseline unmeasured
(manual monthly run). Full detail: `docs/CWV-AI-BASELINE-2026-10-06.md`.

## Parked P1 DONE (Oct 6 — 30/30, gates green)

18 calculators + inflation + 4 video + 4 text + live-transcription,
brand-kit, social-caption. FAQs + how-to + titles inline per 10.7 with
code-truth framing (CalculatorShell ungated saves, Web Speech vendor
processing disclosed, FFmpeg local + free quota, clipboard-only text).
Customs 604 → 634/1,143. ~23 parked remain for P2.

## Parked P2 DONE (Oct 6 — 23/23, gates green)

Design/health/seo/utility/games with code-truth framing (opentype/fflate
local, clipboard-only generators, free quota only where downloadOrShare
verified, games with no persistence claims).
Customs 634 → 657/1,143. Parked pool cleared — Google judges zero
unimproved parked pages now; remaining 486 are never-crawled (phase 2).

## Unknown U DONE (Oct 6 — 30/30 PDF tools, gates green)

Highest-demand unknown pool first: PDF ops with code-truth framing.
Customs 657 → 687/1,143. Next: image unknowns (~47).

## Image batches DONE (Oct 6–7 — 30 + 17 = 47/47, gates green)

Measured pool was 47, not 57 — shipped as IMG1 (30) + IMG2 (17).
Format pairs with per-format use cases; editors/retoucher/AI with
verified mechanics (patch-fill not AI, Gemini-sparkle alpha reversal,
DeOldify/OpenCV local, honest sharpen limits). Free quota cited only
where downloadOrShare verified. Process fix: SKIP guard is now
instructions-only, never whole-tool.
Customs 687 → 734/1,143. Image unknowns cleared. Next: developer
unknowns (~85).
