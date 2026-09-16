# Dependency Policy (#22)

## Cadence

- **Weekly (automated):** Dependabot opens grouped minor/patch PRs every
  Monday plus separate PRs for majors (`.github/dependabot.yml`, max 5
  open). Majors never auto-merge — they need the triage below.
- **CI gate (every push):** `audit-ci` on production deps, fails on any
  critical outside `audit-ci.json`. Exceptions are GHSA-allowlisted with
  justification here — never silently dropped, never module-wide.
- **Monthly (manual):** `npm outdated` review in the month's first week.
  Non-security majors batch into one PR with regression notes.

## Severity SLAs

| Severity | Action |
|---|---|
| Critical (prod) | Same-day: upgrade, or allowlist + justification + dated revisit |
| High (prod) | Within 7 days via minor/patch, or same treatment as critical |
| Moderate | Next minor window; batch with related work |
| Major-version fix | Dedicated PR + affected-tool regression pass, never bundled |

## Triage ledger (audited Sep 16 2026, 799 prod deps)

| Finding | Verdict |
|---|---|
| `next` 16.2.6 → **16.3.5** (RCE GHSA-p293-qw3h-jr36, GHSA-2xp9-vwfh-vxw4 + highs) | **Upgraded** (minor, non-breaking). Windows-host RCE N/A (Cloudflare Linux); AVIF-image RCE N/A (static export, no Image Optimization API) — upgraded anyway. |
| `jspdf` 2.5.1: HTML-injection GHSA-wfv2-pwc8-crg5 (9.6) + LFI GHSA-f8cm-6447-x5h2 | **Accepted risk, allowlisted, revisit quarterly.** Client-side only (`new jsPDF` + `addImage` in 4 tools — the `html()` vector is never used); no server rendering of untrusted HTML. Fix is 4.2.1 (two majors, breaking) — needs a PDF-tool regression pass first. |
| `xlsx` prototype pollution + ReDoS (no fix) | **Accepted risk** (pre-existing note). Client-side parsing of user-supplied files — self-harm only, no server surface. Revisit if a fix ships. |
| `postcss` / `sharp` / `xmldom` highs | **Cleared via the next upgrade** (transitive). |
| `image-size` DoS via `pptxgenjs` (fix = 2.2.0 major) | **Queued**: `pptxgenjs` major PR with PPTX-tool regression check. |
| `tar` critical via `@capacitor/cli` | **Out of scope**: dev-only (Android packaging), never ships to Pages. CI audits prod only (`skip-dev`). |

## Adding an exception

1. Add the GHSA ID (never a module name) to `audit-ci.json`.
2. Add a ledger row above with verdict + revisit date.
3. Exceptions expire on fix availability — Dependabot majors surface them.
