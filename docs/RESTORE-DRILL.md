# Restore Drill (#38 exit criterion)

Proves the backups work before anyone needs them. Owner-executed
(requires Cloudflare credentials) — staged, awaiting a run.

## Run it (one command)

```bash
./scripts/restore-drill.sh
```

The script exports production (read-only), imports into a dated scratch
database, verifies every core table is queryable with row counts, prints
PASS/FAIL, and tells you the cleanup command. It **refuses** to use the
production database as the import target — mis-targeting is impossible
by construction, not by careful typing.

To re-verify an existing export instead of exporting fresh:

```bash
./scripts/restore-drill.sh backup-2026-09-20.sql [scratch-name]
```

## What PASS means

- Export completed without error (production untouched).
- Scratch import completed; `user`, `download_event`, `analytics_event`,
  `error_log`, `feature_flag`, `ai_credit_event` all present with counts.
- Then delete the scratch DB (`npx wrangler d1 delete <scratch>`) so
  drill copies don't linger.

## After PASS

1. Record the row in `docs/DATA-MIGRATIONS.md` (date, you, PASS).
2. Tell the agent: #38 scores (target 90) and the #27
   runtime-fallback-removal residual unlocks.
3. Repeat quarterly, or after any migration that changes a table shape.

## What FAIL means

Stop. Backups are not proven — do not remove runtime fallbacks, do not
claim #38. Paste the script output to the agent for triage (likely
causes: export truncated, new table missing from the verify list —
extend the `for T in` line in the script).
