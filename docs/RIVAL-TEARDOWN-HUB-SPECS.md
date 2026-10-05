# Rival Teardown → Hub Upgrade Specs (Oct 5)

> Sources: ilovepdf.com + iloveimg.com homepages (their hubs — single-category
> sites where homepage IS the category hub), fetched Oct 5 2026.
> Goal: match their depth per category, beat them on breadth (21 categories).

## What both rivals do (our parity checklist)

| Element | iLovePDF / iLoveIMG | Toolzum hub status |
|---|---|---|
| Workflow-grouped tool grid (5–7 groups) | ✓ | ✓ shelves — parity |
| "New!" badges on fresh tools | ✓ (PDF Forms, AI, Upscale, Blur) | ✗ BUILD |
| Hero H1 + benefit subhead | ✓ | ✓ intro — parity |
| FAQ block | ✓ (/help/faq) | ✓ Oct 5 hub FAQs — parity |
| Premium upsell woven in (features, not walls) | ✓ | ~ paywall exists, no hub upsell row |
| Trust badges (ISO/SSL/Assoc) | ✓ | ✗ BUILD honest version |
| Sister-site wheel (PDF↔IMG↔Sign↔API links) | ✓ | ✗ BUILD (we have 21 — bigger wheel) |
| Platform rows (Desktop offline, Mobile, Business/API) | ✓ | ~ PWA offline real; advertise it |
| Vertical pages (Business, Education) | ✓ | ✗ Phase 2 (India verticals = our edge) |
| Tools documentation (/help/documentation) | ✓ every tool documented | ~ tool FAQs exist; docs index missing |
| Blog + Press | ✓ | ~ 10 posts, no Press page |
| App stores (Play/App/Mac/MS) | ✓ backlinks+brand | ○ Android planned; stores later |
| Reddit community + socials | ✓ (r/ilovepdf!) | ✗ owner track (GEO: Reddit = Perplexity #1 source) |
| 25-language i18n | ✓ | ○ PARKED (owner: English-only deliberate) |
| Unified flagship editor (photo-editor) | ✓ iloveimg flagship | ✗ BUILD (Photo Editor plan) |

## PDF hub upgrade spec (`/pdf/`)

1. **New badges** — `pdf-editor` + any tool shipped <60 days. Data: manual
   `NEW_TOOL_SLUGS` set in `categorySections.ts`, reviewed monthly. Render:
   small accent pill on the tool card. Test: badge only on listed slugs.
2. **Cross-category wheel** — "More from Toolzum" row: Image (jpg→pdf flows
   both ways), Developer, AI hubs with one-line why. Component:
   `RelatedCategories` in `CategoryPageClient` (data-driven, 3–4 links).
3. **Trust strip** — 3 honest bullets: files never uploaded (pdf-lib local),
   no signup to start, AI features marked + costed. No ISO cosplay.
4. **Platform row** — PWA offline install CTA (real, shipped) + Pro unlimited.
5. **Guides row** — links PDF blog guides when live (Day 3 sprint).

## Image hub upgrade spec (`/image/`)

Same 5 as PDF, plus:
6. **Photo Editor gap** — iloveimg's flagship unified editor; we have 8
   one-job tools, no canvas. Do NOT fake it with links — build per Photo
   Editor plan, then badge it New.

## Rollout to all 21 hubs (after PDF + Image prove out)

- [ ] New-badge data + render (all hubs, monthly review of the set)
- [ ] RelatedCategories wheel (3–4 links each, no orphan hubs)
- [ ] Trust strip (category-specific proof bullets, all honest)
- [ ] Platform row (PWA + Pro)
- [ ] Guides row (wires up as guides ship)
- [ ] Verticals phase 2: Business/Education-style pages + India verticals
