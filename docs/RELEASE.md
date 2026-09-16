# Release Discipline (#20)

## Version source of truth

`package.json` `version` tracks the **product** version (currently 2.4.0,
aligned with the newest `/changelog` entry — it used to sit at 0.1.0 while
the product shipped 2.x). It is displayed on `/status`, so "which version
is live" is always answerable. No git tags exist yet (Sep 2026) — the
first tagged release starts the tag discipline below.

## Semver policy

- **patch** (`2.4.x`): fixes, copy corrections, dependency patches. No
  migration, no UI surface change.
- **minor** (`2.x.0`): features, new tools, new admin surfaces, new
  migrations (additive only — see below).
- **major** (`x.0.0`): breaking changes — removed tools/routes, auth
  changes, destructive migrations (require the owner's explicit sign-off).

Bump `package.json` in the same PR as the change. Tag on release:
`git tag vX.Y.Z && git push origin vX.Y.Z`.

## Changelog discipline

Every user-visible change ships with its entry in the same PR, in
`src/app/changelog/_components/releasesPartN.ts`:

- One `{ type, text }` line per change. Types: `feature` | `fix` |
  `security` | `performance` (see `releaseTypes.ts`).
- Text names the user-visible effect, not the mechanism
  ("fields announce their names", not "added aria-labels").
- Unreleased work accumulates under a dated `Unreleased` block at the
  top of Part 1; the release PR renames it to the version + date.
- No entry needed for: refactors with zero behavior change, test-only
  changes, docs outside `/changelog`.

## Release flow

1. Merge to `main` → CI (quality → build → **migrate** → e2e).
2. Cloudflare Pages auto-deploys `main`; the `migrate` job applies D1
   migrations. Code and schema ship together — never one without the other.
3. Confirm: `/status` shows the new version, then bump + tag (above).

## Rollback runbook (faster than a 15-min rebuild)

Order matters — cheapest, least destructive first:

1. **Flip flags first.** Most incidents (bad AI output, cost spike, broken
   engine) die at `/admin/flags` in seconds. No deploy involved.
2. **Roll back code** (dashboard only — wrangler has no rollback command):
   Cloudflare dashboard → Pages `toolzum` → Deployments → ⋯ on the last
   good deployment → **Rollback**. Takes effect in under a minute.
3. **Database does NOT roll back.** D1 is forward-only: a code rollback
   runs old code against the NEW schema. This is why migrations must be
   **additive-only** (add tables/columns/indexes; never rename, drop, or
   retype in a minor). A migration that old code cannot tolerate turns a
   1-minute rollback into a restore drill — flag it in the PR.
4. **Verify:** `/status` version reads the previous number; exercise the
   broken path once; watch `/admin/errors` for 10 minutes.
5. **If data itself is bad:** restore drill per `docs/DATA-MIGRATIONS.md`
   (scratch database first, never import over production blind).

## What "done" looks like per release

- [ ] `package.json` bumped, `/status` shows it
- [ ] Changelog entries merged (no silent user-visible changes)
- [ ] Migrations additive-only (or owner-signed destructive + drill done)
- [ ] Tag pushed (`git push origin vX.Y.Z`)
