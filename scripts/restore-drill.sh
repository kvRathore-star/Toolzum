#!/usr/bin/env bash
# Restore drill runner (#38). Owner-executed: needs Cloudflare credentials
# (`wrangler whoami` must succeed). Safe by construction — refuses to touch
# the production database in either direction except a read-only export.
#
# Usage:
#   ./scripts/restore-drill.sh [backup.sql] [scratch-name]
#   - backup.sql: existing export, or omit to export fresh from production
#   - scratch-name: defaults to toolhub-drill-YYYYMMDD (MUST NOT be prod)
set -euo pipefail

PROD_DB="toolhub-db"
BACKUP="${1:-}"
SCRATCH="${2:-toolhub-drill-$(date +%F)}"

if [[ "$SCRATCH" == "$PROD_DB" ]]; then
  echo "REFUSING: scratch name must not be the production database." >&2
  exit 1
fi

if [[ -z "$BACKUP" ]]; then
  BACKUP="backup-$(date +%F).sql"
  echo "→ exporting production to $BACKUP (read-only)…"
  npx wrangler d1 export "$PROD_DB" --remote --output "$BACKUP"
else
  [[ -f "$BACKUP" ]] || { echo "backup file not found: $BACKUP" >&2; exit 1; }
fi

echo "→ creating scratch database $SCRATCH…"
npx wrangler d1 create "$SCRATCH" || true  # exists from a prior drill: reuse

echo "→ importing backup into scratch…"
npx wrangler d1 execute "$SCRATCH" --remote --file="$BACKUP"

echo "→ verifying…"
TABLES_JSON=$(npx wrangler d1 execute "$SCRATCH" --remote --json \
  --command "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'd1_%' ORDER BY name;")
echo "$TABLES_JSON" | grep -o '"name": "[^"]*"' | sed 's/"name": //'

PASS=true
for T in '"user"' 'download_event' 'analytics_event' 'error_log' 'feature_flag' 'ai_credit_event'; do
  COUNT=$(npx wrangler d1 execute "$SCRATCH" --remote --json --command "SELECT COUNT(*) as c FROM $T;" 2>/dev/null \
    | grep -o '"c": [0-9]*' | head -1 | grep -o '[0-9]*' || echo "MISSING")
  echo "  $T: ${COUNT:-MISSING}"
  [[ "$COUNT" == "MISSING" ]] && PASS=false
done

echo "→ drill import verified. Cleanup when done:"
echo "  npx wrangler d1 delete $SCRATCH"
if [[ "$PASS" == true ]]; then
  echo "RESULT: PASS — record it in docs/DATA-MIGRATIONS.md (date, you, PASS)."
else
  echo "RESULT: FAIL — a table is missing; do not treat backups as proven."
  exit 1
fi
