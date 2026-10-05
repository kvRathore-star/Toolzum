# SEO Master TODO — everything from the Oct 5 session, in execution order

> Companion: `docs/SEO-GEO-AEO-AIO-DR-PLAYBOOK.md` (the how).
> This file is the what + who + status. Update statuses as work lands.
> Rule: no commit/push without explicit owner word. No blind changes (test +
> live-verify + suite green, §7 guardrails apply to everything).

## A. Diagnosed (done, evidence on file)

- [x] Full-property inspection sweep: 5 indexed / 510 crawled-not-indexed / 566
      unknown → `docs/gsc-inspection-2026-10-05.csv` + `scripts/gsc-check.py --sweep`
- [x] Collapse dated: Jul 15–21 peak (2,758 impr/wk) → Jul 22–31 cliff (−97%).
      Cause: migration live with 241 dead redirects (fixed Aug 9) + spam updates.
- [x] Manual Actions: clean (owner checked Oct 5). Purely algorithmic.
- [x] Technical blockers ruled out: robots.txt clean, pages 200 + `index,follow`,
      sitemap canonical, AI crawlers allowed.
- [x] GSC API limits mapped: trends work; query/page breakdowns withheld (need UI export).

## B. Shipped Oct 5 — IN TREE, UNCOMMITTED (needs owner "commit/push" word)

- [ ] Hub FAQs: 84 Q&As, all 21 hubs + render + FAQPage JSON-LD + coverage test
      (`categorySections.ts`, `[category]/page.tsx`, `CategoryPageClient.tsx`,
      `category-shelves.test.ts`). Gates: hub tests 6/6, eslint 0, tsc 0.
- [ ] Sitemap slash fix (22 URLs) + extension-dupe removal + slash/uniqueness tests.
- [ ] GSC checker fixes (`siteUrl` — the real 403 cause) + sweep mode.
- [ ] This playbook + master todo files.

## C. Waiting on Google (no action, just watch)

- [ ] Sitemap re-read (Last read still Sep 15 as of Oct 5 eve) → expect ~1,082–1,085
      discovered when it flips. If still Sep 15 after 24h, ping agent.
- [ ] Recrawl of slash-fixed + FAQ-enriched hubs.
- [ ] Next update windows (spam ~monthly, core quarterly-ish).

## D. Owner actions (only you can do these)

- [ ] GSC → Request indexing ×10/day (hubs first, then new tools, then top tools).
- [ ] GSC → Performance → Export CSV (Jul 8–31 queries×pages) → drop in `docs/`.
- [ ] DR baseline number (Ahrefs free checker) → record in playbook §5.
- [ ] Send outreach batches (drafts provided on request) · HARO replies · Reddit answers.
- [ ] Directory submissions (SaaSHub, AlternativeTo, Capterra, Product Hunt).
- [ ] Cloudflare DNS: DNS-AID records (`_index._agents`, `_a2a._agents`) — 5 min.
- [ ] Manual Actions glance, monthly.

## E. Week sprint (day-by-day — owner + due in brackets)

- [ ] Day 1 [owner, Oct 6]: indexing ×10 (hubs 1–10) · Performance CSV → `docs/` ·
      DR baseline → playbook §5 · SaaSHub + AlternativeTo submitted.
- [ ] Day 2 [agent→owner review, Oct 7]: `/press` live · outreach batch 1 (prospects
      1–4, §12.2 SOP) sent · blog↔tool interlink pass on existing 10 posts.
- [ ] Day 3 [agent→owner review, Oct 8]: PDF guide per §12.1 skeleton + outreach
      batch 2 (5–8) · indexing ×10 (hubs 11–21).
- [ ] Day 4 [agent, Oct 9]: Image + India guides · `/llms.txt` + api-catalog +
      skills/ARD manifests + Link headers (tests green).
- [ ] Day 5 [split, Oct 10]: Photo Editor spec frozen [agent] · HARO batch 1
      [owner] · DNS-AID [owner, 5 min] · Reddit ×2 genuine answers [owner].
- [ ] Day 6 [split, Oct 11]: outreach batch 3 + follow-ups [owner] · "Toolzum vs
      Smallpdf" comparison [agent→review] · indexing ×10 (guides + defend-3).
- [ ] Day 7 [both, Oct 12]: measure — coverage delta, sitemap Last-read, DR,
      AI citations on §11.2 set · plan week 2.

## F. Builds (agent does code, owner approves deploy)

- [ ] Trust-claims fixes (playbook §7b): reword 4 gated collisions · scrub 27
      meta descriptions · JSON-LD source swap · extend claims-integrity test.
- [ ] `/press` page · `/llms.txt` · `.well-known` manifests · Link headers.
- [ ] Blog expansion (10 posts live — interlink + PDF/Image/India guides per §12.1).
- [ ] Photo Editor (spec → build → §12.3 launch gate v2).
- [ ] `/tools` editorial block · header/footer statics depth pass.
- [ ] Consolidation PILOT: 1 audio-converter cluster per §10.5 (measure 2 wks before scaling).
- [ ] Per-category tool deep-work (after hubs prove out at Oct 13 gate).
- [ ] P2 agent-readiness: markdown negotiation, WebMCP tool registration.

## G. Recurring

- [ ] Daily: 10 indexing requests (never re-request unchanged pages).
- [ ] Weekly: outreach batch + follow-ups per §12.2 · HARO batch · ship ≤10 URLs (§10.4 cap).
- [ ] Monthly: DR/domains → playbook · Manual Actions glance · AI citations on §11.2 set ·
      rankings on §11.1 set.
- [ ] Oct 13: full re-sweep vs Oct 5 baseline + decision gates (playbook §13).

## H. Scoreboard

- Indexed 4 → 50+ (Nov) → 300+ (Q1) · hubs 0/21 → 21/21 · DR +10/90d ·
  AI citations 0 → 10 queries · traffic beats July peak by December.

## I. Why the site felt chaotic (honest diagnosis, Oct 5 — keep this visible)

1. Scale without a single source of truth (1,059 tools but docs say 1,145;
   65 vs 66 pro tools; GSC 1,084 vs sitemap 1,085) — re-verify cadence: monthly.
2. History of changes without reasons (11 sitemap commits, quota flips, Sep 15
   "separate cleanup" sat 3 weeks) — every change now gets reason + date.
3. Overlapping docs — THIS file is the single entrance; everything hangs off it.
4. Two wars one front (product + SEO in same deploys) — small guarded deploys only.
5. Laggy instruments (GSC withholds breakdowns, stale reads) — one number rules:
   indexed count, Oct 13 re-sweep.
Antidotes in force: routes frozen · quotas frozen 90d · one queue (this file) ·
decision records · daily/weekly/monthly rhythm.
