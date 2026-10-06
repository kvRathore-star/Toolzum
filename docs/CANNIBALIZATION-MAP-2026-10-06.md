# Cannibalization Map (Oct 6, 2026)

Method: weighted-Jaccard similarity over name+description+FAQ text for all
1,056 registry tools (same-category pairs ≥0.25 reviewed; cross-category
≥0.35 reviewed) + concept-key grouping (same nouns, different categories).

## Verdict: do NOT consolidate format pairs

5,207 same-category pairs ≥0.25 are ~all format-converter pairs
(mp3→wav <> wav→mp3 style, scores 0.76–1.00). These are DISTINCT queries
("heic to jpg" ≠ "jpg to heic") and one-page-per-pair is the documented
long-tail strategy (§9.3 tier 4). Consolidating them would destroy
long-tail rankings. Reverse pairs are complements, not cannibals.

Same for text pairs (json↔yaml, markdown↔html, text↔binary): bidirectional
hubs coexist with one-way pages serving exact-match queries. Keep.

## True same-intent overlap found: 2 clusters

### 1. Contrast checkers — PILOT CANDIDATE (post-sweep)
- `contrast-ratio-checker` (Design, visible) vs `contrast-checker`
  (Utility, `showInCategory: false`, no FAQs) — identical function,
  near-identical descriptions.
- Plan (§10.5): FAQs only on the survivor; 301 loser → survivor;
  measure 2 weeks. NOT before Oct 13 (routes frozen pre-sweep).

### 2. Background changers — already resolved, no action
- `bg-changer` is an alias: its own seoDescription says "Redirects to
  the live AI background tool" (`ai-bg-changer`), hidden from categories.
- `api-builder` vs `api-tester` and `json-to-yaml` vs `yaml-json` were
  reviewed and KEPT: different depth tiers / direction-specific queries.

## Execution rule

Map now, execute only the pilot, only after the Oct 13 re-sweep verdict.
Every consolidation gets date + URLs logged here. No mass redirects —
each cluster needs survivor (links → impressions → content), merge,
301 (≥6 months), measure.
