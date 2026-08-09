# Postmortem: Cloudflare `_redirects` dynamic-rule budget silently dropped 241 rules

Status: **RESOLVED (2026-08-09, commit `161eed8`).** Root-caused, fixed, regression-tested, and
re-verified against production. Kept short on purpose — this is a paper trail for the failure
*shape*, which can reappear in another form.

## What broke

Cloudflare Pages' `_redirects` parser permanently switches to **dynamic** mode the first time it
sees a splat (`*`) or placeholder (`:name`) rule. From that point on, **every** rule — including
exact-path static rules — counts against the **100-dynamic-rule budget**, and once the budget is
exceeded the parser **silently drops the remainder of the file**. No error, no log, no warning.

Our file had a splat as its **very first rule**:

```
/growth-&-marketing/*   /growth-metrics/:splat   301
```

so all 590 rules after it were treated as dynamic, and only the first 100 ever fired. In
production the old file's splat was rule #1 of 341, so **rules #101–341 (241 rules, 120 sources)
silently 404'd for however long the migration had been live** — including the entire
Calculator→Health/Finance migration block and several toolkit renames. The deployment looked fine:
the file uploaded, `_headers` applied, first 100 rules worked, so nothing surfaced until a
systematic rule-by-rule probe.

Reference: workers-sdk issue #14694. Note the Cloudflare limit is 2,000 static + 100 dynamic; we
never hit the *limit*, we hit the *mode switch*.

## How it was found

Not by a failing test or an error — by **directly probing every rule against the edge**. A
sample-then-believe approach missed it twice because both sampled only rules within the first 100
("looks fine at a glance"). The exhaustive probe (every rule line, cache-busted, on the deployed
edge) exposed the exact boundary: rule #100 returned 301, rule #101 returned 404.

## The fix

Static-first ordering in `scripts/generate-redirects.js`:

- `parseStaticRules` now scans the **whole** file for dynamic rules (splats/placeholders) and
  sinks them to a trailing `# ==== DYNAMIC RULES ====` block at the very end.
- `public/_redirects` regenerated so the splat is the **last** line, after all 692 static rules.
- Idempotent: re-running the generator produces no diff.

## The regression guard

`src/__tests__/redirect-meta-fallback.test.ts` test 4 asserts:

1. No static rule appears after the first dynamic rule.
2. Dynamic-rule count ≤ 100.

Verified both directions: the test **fails** against the pre-fix file and **passes** on the fixed
file. This runs in CI (pre-push hook: `lint && typecheck && test`).

## Re-verification (post-fix, production)

115 previously-dropped URLs across all 7 migration blocks return 301 on `toolzum.com` (cache-busted,
deployment `161eed8`): toolkit renames (18), Calculator→Health (19), Calculator→Finance (39),
Utility→Calculator (20), Finance-mislabeled + misc (7), Developer→Utility timers (6), final renames
(6), plus splat + first-100 regression (11).

## Failure modes to watch (if it reappears)

- **`_redirects` grows past 2,000 static rules** → static budget exceeded, tail dropped silently
  again. The regression test only checks dynamic ordering/count, **not** the 2,000-static ceiling.
  If the file approaches ~1,900 lines, add a static-count assert and re-audit.
- **Generator reorders rules** → a future change that moves a splat/placeholder above static rules
  re-triggers this. The static-first invariant test guards it; keep the splat-last invariant.
- **Any rule added above a splat** — same trap. Comment in the generated file marks the dynamic
  block as "keep last".

## Lesson for future audits

"Every ready-to-ship moment gets one more question" is the pattern that caught this (and the
meta-refresh-vs-301 gap, and the provenance gap). For silent-partial-application bugs: verify the
**whole set**, not a sample, on the real edge, cache-busted.
