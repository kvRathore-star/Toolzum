# SEO / GEO / AEO / AIO / DR Work Playbook

> Started Oct 5, 2026. Active work-from-tomorrow checklist to recover indexing,
> rank in classic + AI search, raise DR, and never get flagged as thin content.
> Every item has an owner and a verification step — no blind changes.

## 0. Where we stand (Oct 5 baseline)

- **Indexed: 4 pages** (home, gst-invoice-generator, http-headers-generator, webp-to-ico)
- **510** crawled-not-indexed · **566** never crawled · full list: `docs/gsc-inspection-2026-10-05.csv`
- Cause (verified): Jul 22 migration with 241 silently-dead redirects (fixed Aug 9) +
  site-wide quality filter after Aug 18 / Sep 24 spam updates. No manual penalty (checked Oct 5).
- Shipped: canonical sitemap (slashes, zero dupes, regression tests), IndexNow (1,086 URLs),
  hub FAQs (84, all 21 hubs), related-tools, unique FAQ templates.
- Next measurement: **re-sweep Oct 13** (`python3 scripts/gsc-check.py --sweep`).

---

## 1. SEO — classic Google/Bing ranking

### Technical (all verified Oct 5 — re-check monthly)
- [ ] `robots.txt` allows `/`, blocks only `/api/` + `/admin/`, lists sitemap, allows
      GPTBot/ClaudeBot/PerplexityBot/CCBot. Verify: `curl https://toolzum.com/robots.txt`
- [ ] Sitemap = registry-generated, all canonical trailing-slash, zero dupes.
      Verify: `grep -c "<loc>" sitemap` + tests `sitemap.test.ts` (slash, uniqueness, coverage)
- [ ] Every page serves 200 at its canonical URL; no redirect chains.
- [ ] Tool pages carry `robots: index, follow`.
- [ ] No URL churn: **routes are frozen** — no renames/moves without a 301 + test.

### Content (the actual gate for the 510 parked pages)
- [ ] Hubs: unique meta + intro + curated shelves + 4 FAQs each — DONE Oct 5.
- [ ] Tool pages: unique description, unique FAQ set, real examples, related-tools links.
- [ ] `/tools` directory: editorial block (pending).
- [ ] Header/footer pages (about, contact, pricing): real company content (pending).
- [ ] **Rule: no two pages share a paragraph.** Template repetition is what the
      classifier filters. If a new tool reads like an old one with one word
      swapped, rewrite or consolidate it.

### Recrawl routine (daily, ~10 min)
- [ ] GSC → URL inspection → **Request indexing**: ~10/day, priority order —
      1. category hubs (21), 2. new tools on launch day, 3. top tools by demand.
- [ ] Never mass-submit all 1,059 — quota is 10–12/day and bulk submits signal nothing.
- [ ] Re-request a page ONLY after changing it (same page + same content = same verdict).

---

## 2. GEO — get cited in AI answers (ChatGPT ~65% of AI traffic, Gemini ~20%, Perplexity ~7%)

AI engines cite passages, not pages. Rules:
- [ ] Every content block stands alone: direct answer first, then context.
- [ ] Q&A pairs everywhere (hub FAQs done Oct 5 = GEO fuel; tool FAQs exist).
- [ ] Concrete facts/numbers in answers (formats, sizes, formulas, limits).
- [ ] FAQPage + HowTo JSON-LD on hubs and tools (hubs done Oct 5).
- [ ] Freshness: updated dates real, statistics current.
- [ ] Brand mentions across the web (Reddit is Perplexity's #1 source at ~47% —
      genuine participation, never spam).
- [ ] Keep AI crawlers allowed in robots.txt (verified Oct 5).

## 3. AEO — Answer Engine Optimization (direct-answer boxes, voice, featured snippets)

- [ ] One question = one clear 40–60 word answer (hub + tool FAQs follow this).
- [ ] Question headlines phrased as users ask ("How do I…", "What is…").
- [ ] Comparison/definition blocks for "vs" and "what is" queries.
- [ ] TL;DR summary under major headings on long pages.

## 4. AIO — AI Overviews + AI-content policy compliance

- [ ] Spam policies now explicitly cover AI Overviews responses (June 2026) —
      same rules as classic search, no separate game.
- [ ] AI-assisted content is allowed; **mass-produced unoriginal content is spam**
      ("scaled content abuse" policy). Every AI-drafted paragraph gets human
      specificity added (numbers, tool names, edge cases) before publish.
- [ ] FAQ rich results are dead (deprecated May 2026) — FAQs are for indexable
      text + GEO citations, not snippets. No effort into snippet-chasing markup.
- [ ] Track AI Overview appearances for brand queries monthly (Search Console
      can't split them — spot-check manually in Google search).

## 5. DR — Domain Rating (Ahrefs 0–100; Google doesn't use it, the links behind it rank)

- [ ] **Baseline:** record current DR here → `DR (Oct 2026): ___`
- [ ] Outreach targets (researched Oct 5 — Toolzum is in ZERO of these roundups today):

| # | Target | Hook |
|---|---|---|
| 1 | pdnob.com iLovePDF-alternatives | Free + private PDF editor vs paywalled picks |
| 2 | thebusinessdive.com best-pdf-editors | "Best free" slot: free + no watermark + private |
| 3 | convertlo.pro image converters | Same browser-local promise, 150+ tools vs 5 |
| 4 | snehasishkonger.medium.com | Indie blogger, easy yes |
| 5 | fixthephoto.com 24 converters | HEIC/bulk for photographers |
| 6–7 | formatpic / convertiimage / pdf.net comparisons | "Add us to your table" row |
| 8 | cleverly.tools / runfreetools guides | Twin positioning, cross-listing |
| 9 | SaaSHub (directory) | Free listing + reviews flywheel |
| 10 | AlternativeTo + Product Hunt | Listing now; PH launch at recovery |

- [ ] Outreach template (personalize hook per row; link the EXACT tool, never homepage):

  > Subject: free + private addition for your [roundup name]
  > Hi [name] — I built Toolzum, 1,000+ free browser tools where files never
  > leave the device (no upload, no signup, no watermark). Noticed [their pick]
  > caps free use at [X/day / uploads files] — we're the unlimited private
  > alternative. Worth a test for your [section]? [exact tool link]

- [ ] `/press` page (logo kit, stats, contact) — every outreach needs a credible target.
- [ ] HARO/Connectively as founder (2–3 quotes/week) — drafts on request.
- [ ] Directories: SaaSHub, AlternativeTo, Capterra, Product Hunt, BetaList.
- [ ] **NEVER:** buy links · link exchanges · footer/template badge links with
      follow (listed as link spam) · exact-anchor spam. One paid-link penalty
      costs more than a year of outreach.
- [ ] Track: referring domains + DR monthly in this file.

---

## 6. New-tool launch checklist (the 30 + photo editor) — gate before deploy

Every new tool must pass ALL of these or it deepens the thin-content pattern:

- [ ] Unique description (not one-word-swapped from a sibling tool).
- [ ] 4+ unique FAQs written for THIS tool (no template reuse across tools).
- [ ] Real example / use-case on the page (input → output sample).
- [ ] Related-tools links set (both directions where sensible).
- [ ] In sitemap automatically (registry → build → verify `grep slug sitemap`).
- [ ] Request indexing on launch day (counts against the ~10/day quota).
- [ ] Added to its hub's shelf/section if one fits.
- [ ] Suite green + `sitemap.test.ts` + `category-shelves.test.ts` green.

## 7. Guardrails — what NOT to do

1. No URL renames/moves (routes frozen since Oct 5).
2. No bought/exchanged/template-footer links.
3. No bulk noindex, no bulk deletes — consolidate with 301s, never 404.
4. No mass re-submits; no "SEO plugins" that rewrite URLs/meta in bulk.
5. No AI-content dumps without human specificity pass.
6. No sitemap/registry edits without: targeted test + live curl check + suite green
   (the Sep 15 "separate cleanup" incident is why this rule exists).
7. Check GSC Manual Actions monthly (clean as of Oct 5).

## 7b. Trust-claims audit (Oct 5 — absolute claims vs gated/cloud reality)

> Absolute marketing claims ("no signup", "100% free", "zero server") must match
> per-tool reality. "Misleading functionality" is a Google spam policy — this is
> a ranking issue, not just honesty.

**Verified sound:** `cloudPatterns.ts` verdicts (local/cloud/hybrid/unverified) +
generated descriptions + `claims-integrity.test.ts` cover processing-location
claims. Category intros disclose server exceptions. OG descriptions generated (clean).

**Gaps found (audit Oct 5):**

| # | Gap | Size | Fix |
|---|---|---|---|
| 1 | Gated tools promise no-signup/free, then quota/credit-wall: `qr-code-generator` (5/day→Pro), `crop-video` (3/day), `text-to-speech-tts` + `live-transcription` (credits) | 4 pages | Reword to honest free-tier framing ("5 free/day, Pro for 100") |
| 2 | Meta descriptions (`seoDescription`, shown in SERPs) with absolute claims | 27 pages | Scrub absolutes |
| 3 | `SoftwareApplication` JSON-LD uses stored boilerplate, not generated honest text | all pages | Source swap to `getShortDescription` in `ToolLayout.tsx` |
| 4 | No test on signup/free axis (only processing-location covered) | — | Extend `claims-integrity.test.ts`: gated tools must never claim no-signup/free |

**Standing rule:** quota/pro/credit-gated tools disclose limits in their own
description; free-tier entry ("no signup to start") stays only where true for
entry use. Same two-person + test gates as §10.3 apply.

### Claim matrix (binding for every tool, present + future — Oct 6 audit: 0 violations)

| Claim family | Free + local, ungated | Gated (quota/Pro/credit) or cloud/hybrid |
|---|---|---|
| no signup / no account | Allowed as absolute | Conditional only: "free to start…", "sign in free for…" |
| offline / runs offline | Allowed as absolute | Qualified: core offline-capable; downloads/server check in online |
| no limits / unlimited | n/a (nothing to limit) | Numbers disclosed (3/5/2/credits) or "fair daily limits"; "unlimited" only for Pro |
| unlimited (bare) | Never (meaningless without a cap context) | Only as "Pro unlocks unlimited" |
| free / 100% free | Allowed (money-true) | Allowed for entry tier; must pair with limits disclosure, never standalone |
| local processing | Allowed (verdict-gated by test) | Cloud/hybrid get their own labels; unverified gets none |

Enforcement: `claims-integrity.test.ts` (absolute forms) + `tool-content-standard`
(all-templates guard) + `defaultFaqsFor`/`categoryFaqTemplates` branch on
tier+verdict at render time. Re-audit quarterly with `claims5` method.

**Quota doctrine (Oct 5 verdict: KEEP quotas, reform disclosure):**
Tiers are anon 3/day → signed-up 5/day (+5 trial credits, 10-file batch) → Pro.
Keep them: (1) server AI/transcription calls cost real money per use — unlimited
anon = bankruptcy + bot abuse; (2) quotas fund the free tier via Pro conversion;
(3) quotas gate download ACTIONS, never page content, so indexing is unaffected
(verify: Googlebot must never see a quota wall instead of content).
Reforms: (a) disclose limits ON the page near the action ("3 free today · sign
up for 5 · Pro unlimited") — the badge exists, keep it pre-action and visible;
(b) strictness must track COST — pure-local tools (QR, crop, passwords: $0
server cost) stay generous, strict quotas only where server $$ burns, or "free"
claims ring hollow; (c) the §7b 4 collisions get honest free-tier framing first.

**Quota FREEZE (Oct 5 verdict, from live D1 data): `download_event` shows 12
allowed downloads in 8 weeks and ZERO quota walls hit.** The 10→3 change
converted ~nothing — there was no traffic to convert. Do NOT touch quota
numbers again until volume justifies it: **frozen for 90 days minimum, revisit
only after 100+ downloads/week for 4 straight weeks** (data already logs via
`blocked_quota`). Funnel-tuning on 12 downloads is premature optimization;
traffic (indexing + links) comes first, quotas second. Honesty fixes (§7b)
still ship — those are about trust/classifier, not conversion.

## 8. Cadence from tomorrow

- **Daily (10 min):** ~10 Request-indexing clicks (hubs → new tools → top tools).
- **Weekly:** 1 outreach batch (3–5 prospects) · 1 HARO batch · publish/ship something new.
- **Monthly:** DR + referring domains recorded here · Manual Actions glance ·
  AI-citation spot-checks (ask ChatGPT/Perplexity your top queries).
- **Oct 13:** full re-sweep vs Oct 5 baseline (`scripts/gsc-check.py --sweep`).

## Log

- Oct 5: playbook created. Baseline 4 indexed / 510 parked / 566 unknown.
  Hub FAQs shipped (uncommitted). DR baseline pending.

---

## 9. Domination plan (senior pass, Oct 5) — rank, get cited, outpace competitors

### 9.1 Demand map (what real users actually searched)

GSC API gives date totals but withholds query/page breakdowns (anonymization
thresholds on small properties). Known from totals: **July 8–31 = 3,315
impressions, peak Jul 15–21 (2,758/wk)** — then cliff. To get the exact
query×page table: **GSC UI → Performance → Export CSV (Jul 8–31)** and drop it
in `docs/` — that table becomes the demand bible (action: owner).

Until then, demand logic by category (supply = our tool counts from sweep):
high-demand arenas are **PDF, Image, Developer, Finance/India utilities**
(GST/PAN/Aadhaar/pincode/IFSC = high volume, lower competition, local edge).
Long-tail pattern: `"[format] to [format]"`, `"[task] online free no signup"`.

### 9.2 Competitor map (researched Oct 5 — we appear in ZERO roundups)

| Competitor | Their weakness = our wedge |
|---|---|
| Smallpdf | 2 conversions/day cap, uploads files, $120/yr |
| iLovePDF | OCR/editing/AI paywalled, desktop trial = 3 tasks |
| Convertio / CloudConvert | 10–25/day caps, files uploaded to servers |
| TinyPNG / iLoveIMG | 20/day caps, no AVIF, upsell pressure |
| calculator.net / TinyWow | Dated UX, ad-heavy |

**Positioning triangle (every outreach + content hammers this): FREE + UNLIMITED + PRIVATE (browser-local, no upload, no signup).** No competitor holds all three.

### 9.3 Keyword tiers (high volume → low competition first)

1. **Defend the indexed 3** — gst-invoice-generator, http-headers-generator,
   webp-to-ico: deepen content, build 2–3 backlinks each, never touch URLs.
2. **India utilities** — GST/PAN/Aadhaar/pincode/IFSC/UPI queries: big volume,
   weak incumbents, our local edge. Hub + tools + 1 blog guide each.
3. **Privacy-modified queries** — "…without uploading", "…no signup", "…private":
   low competition, our exact strength, matches GEO phrasing.
4. **Format-pair long tail** — heic→jpg, webp→ico, opus→mp3…: one strong page
   per pair; consolidate near-duplicates, don't spray 88 thin variants.
5. **Hub head terms** — "free pdf tools", "image converter" etc.: hubs rank
   only after trust returns; feed them links from tiers 1–3.

### 9.4 Internal linking (status Oct 5 — mostly built, two gaps)

- DONE: related-tools on ~920 tools, hub→tool grids, hub breadcrumbs,
  curated shelves, fresh-lastmod sitemap.
- GAP 1: **blog→tool links — blog exists (10 posts in `src/lib/blog-posts.ts`)
  but thin interlinking to tools.** Fix: link every guide to its tools + every
  major tool back to its guide (see §9.5).
- GAP 2: homepage features same tools always — rotate seasonal/demand picks.
- Rule: every new page gets ≥3 internal in-links (hub shelf + related + blog/guide).

### 9.5 Content moats (link magnets + GEO fuel — build in this order)

1. **Blog engine + 1 guide per big category** (how-tos, comparisons, "best X"
   with honest competitor tables — these earn the listicle links in §5).
2. **Data studies from our own stats** ("we compressed X images…") — digital-PR bait.
3. **Photo Editor (unified)** — PDF-Editor-class flagship; launches index-ready
   per §6 checklist.
4. **Comparison pages we can win**: "Toolzum vs Smallpdf: free limits compared"
   (truthful table — our triangle wins on free/unlimited/private).

### 9.6 Agent-readiness track (Cloudflare scan Oct 5: 20/100 — separate from Google ranking!)

Honest framing: **none of this moves Google indexing today.** It positions for
agent-driven traffic (ChatGPT/Claude browsing, Comet/Atlas browsers). Score
20→~60 with static files + headers; the rest needs real infra.

- P0 — `/llms.txt` (the actual GEO artifact: site summary + key URLs for LLMs).
- P1 — `/.well-known/api-catalog` (RFC 9727, point at /tools + search),
  `/.well-known/agent-skills/index.json` (tool categories as skills),
  `/.well-known/ai-catalog.json` (ARD manifest), Link headers in next.config
  advertising the catalog, Content-Signal `search=yes` in robots.txt.
  DNS-AID records (`_index._agents`, `_a2a._agents`) — 5 min in Cloudflare DNS.
- P2 — Markdown negotiation (`Accept: text/markdown` via middleware),
  WebMCP `registerTool` on tool forms (each of 1,059 tools agent-callable).
- SKIP until real: MCP server card (no server = card is theater), OAuth
  discovery (only if OIDC is real), Web Bot Auth (signing infra), x402/UCP/ACP
  (no agentic commerce yet).

### 9.7 The 7-day domination sprint (starting tomorrow)

- **Day 1:** GSC clicks — Request indexing ×10 hubs. Export Performance CSV
  (Jul 8–31) → `docs/`. Fill DR baseline (§5). Submit directories: SaaSHub,
  AlternativeTo (listings live same day).
- **Day 2:** Press page (`/press`) live. Outreach batch 1 (prospects 1–4) sent.
  Blog engine scaffold merged.
- **Day 3:** Category guide #1 (PDF: "compress/merge/edit" + competitor table).
  Outreach batch 2 (prospects 5–8). Request indexing ×10 (hubs rest + new).
- **Day 4:** Category guide #2 (Image) + guide #3 (India utilities: GST/PAN).
  `/llms.txt` + api-catalog + skills/ARD manifests live. Link headers on.
- **Day 5:** Photo Editor spec frozen (per §6 gate); build starts. HARO batch 1.
  DNS-AID records added. Reddit: 2 genuine help answers (no links first week).
- **Day 6:** Outreach batch 3 (9–10) + follow-ups batch 1. Comparison page
  "Toolzum vs Smallpdf" live. Request indexing ×10 (guides + tools).
- **Day 7:** Measure: GSC coverage delta, sitemap Last-read, DR check, AI
  citation spot-checks (ask ChatGPT/Perplexity 10 target queries, record).
  Plan week 2 from data. **Oct 13: full re-sweep vs Oct 5 baseline.**

### 9.8 Scoreboard (what "dominating" looks like)

- Indexed: 4 → 50+ (Nov) → 300+ (Q1). Hubs: 0/21 → 21/21.
- DR: baseline → +10 in 90 days (referring domains counted monthly here).
- AI citations: 0 → cited in Perplexity/ChatGPT for 10 target queries.
- Traffic: beat July peak (3,315 impr/mo) by December — via rankings + AI
  referrals, not raw index count.
- Zero new thin pages: §6 gate enforced on all 30 tools + photo editor.

---

## 10. Content quality bar — the anti-automation doctrine (agency audit, Oct 5)

> Why this section exists: every parked page was "content" too. Volume without
> proof-of-work is what the classifier filters. A page earns its index slot by
> containing things **no template could generate**.

### 10.1 Definition of Done — every publishable page MUST have ≥3 of these

1. **Original visual**: real screenshot/GIF of the tool running (not stock).
2. **Worked example with real numbers**: input → steps → output shown
   (e.g., "120 × $49 = $5,880 MRR", "25 MB → 3.1 MB at quality 70").
3. **First-hand test result**: "we tried X on Y and got Z" (competitor limits
   verified by hand, not copied from their pricing page).
4. **Unique data point**: from our own stats, a manual count, or a cited source
   with link. No uncited statistics, ever.
5. **Human expert pass**: named reviewer + date in the file/commit message.
6. **Author + updated date** visible (guides), real person, real accountability.

Pages meeting ≤2 are drafts, not publishes. No exceptions during recovery.

### 10.2 Similarity rule (the template killer)

- **No two indexable pages may share a paragraph.** Before publish, the author
  runs a same-t sentences check against the closest 5 sibling pages
  (mechanical: `grep` distinctive phrases; judgment: human read).
- Near-duplicate tool pairs (e.g., opus-to-aiff vs flac-to-mp3 style) must
  differ in MORE than the format noun: different examples, different FAQs,
  different use-cases — or be consolidated (see §10.5).
- Hub FAQs vs tool FAQs vs guides: same question may exist in two places ONLY
  if both answers are rewritten from scratch for that context.

### 10.3 Human review gate (two-person rule)

Creator ≠ publisher. Publish requires ALL of:
- [ ] §10.1: ≥3 proof-of-work elements present (reviewer initials).
- [ ] §10.2: similarity check done, no shared paragraphs (reviewer initials).
- [ ] §6 launch gate (tools) or §12.1 guide skeleton (guides) complete.
- [ ] Facts verified live (competitor limits re-checked, links 200, numbers recomputed).
- [ ] Suite green (code pages) + tests for new data files.

### 10.4 Velocity cap (recovery period, Q4 2026)

- **Max 10 new indexable URLs per week.** A demoted domain publishing 30 pages
  in a week looks like scaled-content velocity — the exact pattern under judgment.
- Spread the 30 tools across 4+ weeks, each clearing §10.3. Slow is fast.

### 10.5 Consolidation protocol (for the 88-audio-converters problem)

When 3+ pages serve one intent with near-identical content:
1. Pick the survivor: most links + most impressions + best content (in that order).
2. Upgrade the survivor with the best paragraphs of the losers (merge, don't delete value).
3. 301 losers → survivor. Never 404. Keep the 301s ≥6 months.
4. Pilot BEFORE scaling: 1 cluster (audio converters), measure 2 weeks, then decide.
5. Log every consolidation here with date + URLs (audit trail beats memory).

### 10.6 FAQ + per-tool content standard (Oct 5 agency pass, test-locked)

- **4–7 FAQs per tool with custom sets** (9 is bloat, 3 is thin): flagship/complex
  tools earn 6–7, standard tools 4–5. Count follows importance, never template.
  Locked by `tool-content-standard.test.ts`.
- **No question shared by 3+ tools** (test-locked). Pairs tolerated, trios fail
  the build. (Oct 5: eliminated a 46x-shared question class.)
- **Answers ≥40 chars**, tool-specific mechanics named (FFmpeg WASM, pdf-lib,
  Canvas — never "it processes fast").
- **Per-tool SEO checklist** (every touched tool, reviewer initials each):
  how-to pattern verified correct · description unique + carries the target
  query · meta unique (any length, never truncated for length) · JSON-LD +
  OG from generated honest text · worked example present · quota/credit
  disclosure where gated · PoweredBy engines render.
- Tools without custom FAQs use category templates (gated by `faq-gate.ts`,
  Jaccard <0.30) — the 690 follow after the 371 prove out.

### 10.7 Per-tool master checklist (binding from next batch on — Oct 6)

> Every tool ships against ALL of these, verified before commit. This list is
> the sum of every fix this session: nothing here is theory, each line cost
> a real bug found. Test-locked items cite their guard.

**A. Groundwork (before writing a word)**
1. Record tier (anon/signup/Pro/credits) + verdict (local/cloud/hybrid) — all
   copy decisions derive from these two facts.
2. Identify the target query (§11.1 or demand logic) — the page must earn one query.
3. Inventory what templates already say (category FAQs, fallbacks) — new content
   must ADD ground, never repeat it.

**B. Description**
4. ≥120ch substantive (100 hard floor) — what it does + who/what-for + one concrete.
5. Unique full text (no shared paragraphs anywhere).
6. Carries the target query terms naturally.
7. Ends with the category-specific closer (keeps generator suffix honest).
8. No absolute signup/free claims beyond the tool's real tier.

**C. Title (`seoTitle`)**
9. ≤60ch, query-first, "Free" retained, zero absolutes beyond tier (test-locked).

**D. FAQs (4–7 by importance: flagship 6–7, standard 4–5)**
10. Every question globally unique (no 3+× sharing — validated at write time).
11. Answers ≥60ch (40 hard floor), tool-specific mechanics named.
12. Honest gating disclosure where applicable (credits/limits/Pro taste).
13. Cover the essentials the template yielded: what, privacy, limits, edge case.

**E. How-to pattern**
14. Matches mechanics: file→upload, text→paste, values→enter, timers→alert,
    games→play, measure→read, AI→generate, pick→click-generate. Never `other`
    without custom instructions. (Full routing table + regression tests in
    `interaction-pattern.test.ts` — extend the test with every new case.)

**F. Meta / OG / JSON-LD / sitemap**
15. Meta + OG unique and honesty-checked (generated or hand, test-covered).
16. JSON-LD from generated honest text (never stored boilerplate).
17. Canonical trailing-slash; sitemap inclusion verified post-build.

**G. Honesty (the non-negotiables)**
18. Signup/free claims == tier reality (anon 3 / signed 5 / pro taste / credits).
19. Locality claims == verdict reality (local only; cloud/hybrid labeled).
20. Limits disclosed BEFORE effort (badge/modal/description, never post-work walls).
21. PoweredBy shows actual engines, no versions.
22. No invented features, numbers, formats, or limits — every concrete claim
    traceable to registry code, LIMITS doc, or measured behavior.

**H. Gates (all green or it doesn't ship)**
23. Content tests: content-standard, claims-integrity, shelves, interaction,
    generate, sitemap, press/paywall where touched.
24. `faq-gate --full`: no NEW failures (6 pre-existing topology gaps logged).
25. `quality-audit.js`: 0 issues. eslint 0 errors. `tsc --noEmit` 0.
26. Registry parses (1,143 tools). No full suite (owner order) — targeted only.

**I. Post-publish**
27. Request indexing ONLY after material change (same content = same verdict).
28. Re-sweep compare at next checkpoint (Oct 13 cadence).

## 11. Fixed tracking sets (same queries every check — no moving goalposts)

### 11.1 Ranking watch (20 queries — GSC UI weekly + monthly CSV)

free pdf editor no signup · merge pdf online free · compress pdf for email ·
jpg to pdf free · pdf to word free · heic to jpg free · webp to png converter ·
mp3 converter online free · gst invoice generator free · gst calculator india ·
pan card validation online · aadhaar mask online · pincode finder ·
ifsc code lookup · percentage calculator · json formatter online ·
base64 encode online · word counter · qr code generator free · bmi calculator

### 11.2 AI-citation watch (12 queries — ask ChatGPT + Perplexity + Gemini, record cited-or-not monthly)

best free pdf editor without signup · how to merge pdfs in order ·
how to compress jpg without losing quality · mp3 vs flac which is better ·
how is emi calculated · what goes on a gst invoice · how to mask aadhaar number ·
how to calculate mrr with example · is it safe to paste jwt into online decoder ·
srt vs vtt subtitles · what contrast ratio passes wcag ·
how long should a meta description be

(These mirror hub FAQ answers §B — the loop is measurable: FAQ published →
cited-or-not next month. Expand both lists when the Performance CSV lands.)

## 12. SOP templates (copy-paste, fill in, don't improvise)

### 12.1 Blog/guide skeleton (every guide, no exceptions)

1. Title = the query it answers. Hook (2 sentences: who + pain).
2. TL;DR answer box (40–60 words, standalone quotable).
3. Method with REAL screenshots (our tool, numbered steps).
4. Comparison table where rivals exist (our triangle: free/unlimited/private;
   verify every rival cell live that week).
5. "How to choose" guidance (when NOT to use us — honesty earns links).
6. FAQ ×4 (unique to this guide).
7. Author box + published/updated dates + ≥5 internal links (tools + hub).

### 12.2 Outreach follow-up SOP (one email ≈ 10% reply; fortune is in follow-up)

- Day 0: personalized pitch (hook per prospect, exact tool link).
- Day 7: follow-up with ONE new reason (screenshot, new stat, new review).
- Day 21: breakup ("closing the loop — keeping you off my list").
- Track columns: contact · angle used · sent · reply · link live (URL) · DR of linker.
- Funnel math per 10 prospects: ~30% reply → 2–4 links. If reply <15% after
  20 pitches, the ANGLE is wrong, not the product — rewrite hooks, don't spray more.

### 12.3 Launch gate v2 (replaces §6 for everything indexable)

§6 items PLUS: §10.1 (≥3 proof-of-work) + §10.2 (similarity) + §10.3 (reviewer
sign-off) + velocity-cap compliance (§10.4) + fact re-verification date.

## 13. Risk register + decision gates

| Risk | Mitigation |
|---|---|
| Publishing velocity flags scaled-content | §10.4 cap (10/wk) + §10.3 gate on each |
| New tools clone old templates | §10.2 similarity rule + consolidation over creation |
| Outreach marked spammy | Personalized, 1 mail/prospect/week max, breakup at day 21 |
| Reddit/HARO ban for promotion | Help first, links only when directly answering; disclose affiliation |
| Directory links look bought | Free listings only, complete profiles, real descriptions |
| Another spam update mid-recovery | Nothing ships that violates §7; updates also REWARD fixes |
| AI-content detection | §4: human specificity pass is mandatory, not decorative |

**Oct 13 decision gates (re-sweep vs Oct 5: 4 / 510 / 566):**
- Hubs indexed ≥5 → scale hub pattern to tools depth work.
- Indexed <10 total → escalate: consolidation pilot (§10.5) + backlink sprint first.
- Sitemap Last-read current + discovered ≈1,085 → plumbing healthy, problem is verdict-only.
- Any NEW thin-pattern flags in GSC → freeze publishing, audit before resume.
