# Data Migration Story (#27)

## The rule

Versioned migrations in `src/db/migrations/` are the **source of truth**.
Runtime `ensureTable` / `CREATE TABLE IF NOT EXISTS` calls in `functions/`
stay only as an **idempotent fallback** (they predate the apply pipeline
and cost nothing). The two must never drift:
`src/__tests__/data-migrations.test.ts` fails CI on any gap —
unmigrated runtime table, column drift, or unmigrated purge target.

## Applying migrations

Migrations apply **automatically**: the `migrate` CI job runs
`wrangler d1 migrations apply toolhub-db --remote` on every `main` push
(after quality + build). If the Cloudflare secrets are absent, CI prints
the manual command — run it before relying on the deploy:

```bash
npx wrangler d1 migrations apply toolhub-db --remote   # production
npx wrangler d1 migrations apply toolhub-db --local    # local dev
```

Never edit an applied migration in place (wrangler tracks them by
filename). Add a new numbered file instead.

## Timestamp ledger (locked)

Writers must use the documented format; readers must tolerate history.
`DAY_BUCKET` in `functions/api/admin/analytics.ts` is the read contract.

| Table | Column | Format written today |
|---|---|---|
| `user`, `session`, `account` | `createdAt` | unix **millis** (better-auth) |
| `user_tool_usage` | `usedAt` | unix **seconds** |
| `download_event`, `ai_credit_event`, `error_log` | `createdAt` | unix **seconds** |
| `analytics_event` | `createdAt` | `datetime('now')` **text** (rate-limit comparisons depend on it — do not "fix" to integer without updating `rate-limit.ts`) |
| `download_usage` | `createdAt`/`updatedAt` | `datetime('now')` **text** |
| `download_usage` | `date` | `YYYY-M-D` text (non-padded — string comparison unreliable, use `updatedAt`) |
| `feature_flag` | `updatedAt` | unix **seconds** |

Mixed legacy rows exist (`analytics_event`, `download_usage`). SQLite
sorts INTEGER before TEXT, so `<` purge cutoffs sweep both formats —
see `functions/api/_retention.ts`.

## Foreign keys

D1 does **not** enforce `ON DELETE CASCADE` (schema.ts declares it, the
database ignores it). Erasure is enforced behaviorally, not declaratively:
`src/lib/userErasure.ts` (self-service hook) +
`functions/api/admin/delete-user.ts`. Any new `userId`-keyed table goes
in both lists — the privacy gate test enforces it.

## Backup verification

D1 keeps automatic backups; verify them with an export + restore drill:

```bash
# 1. Export production (owner-run; needs CLOUDFLARE_API_TOKEN)
npx wrangler d1 export toolhub-db --remote --output backup-$(date +%F).sql
# 2. Restore drill: import into a scratch database and run the suite's
#    read-path smoke (admin analytics endpoint against the import)
npx wrangler d1 create toolhub-drill
npx wrangler d1 execute toolhub-drill --remote --file backup-<date>.sql
```

Record each drill (date, exporter, result) here:

| Date | By | Result |
|---|---|---|
| — | — | _No drill recorded yet — first drill is the #38 exit criterion._ |
