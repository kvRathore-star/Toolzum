/**
 * 90-day analytics retention enforcement (#26).
 *
 * The Privacy Policy promises analytics data is retained for 90 days.
 * There is no cron on Pages, so writers call `maybePurgeOldRows`
 * (sampled — ~2% of writes) to age out old rows inline. Never throws.
 *
 * Timestamp formats differ per table (legacy mixed TEXT/INTEGER in
 * analytics_event and download_usage), so each predicate handles its
 * own column: TEXT `datetime('now')` columns compare as strings,
 * INTEGER unixepoch columns compare numerically. In SQLite, INTEGER
 * always sorts before TEXT, so a `<` cutoff also sweeps legacy rows
 * stored in the other format.
 */

export const RETENTION_DAYS = 90;

const CUTOFF_TEXT_EXPR = `datetime('now', '-${RETENTION_DAYS} days')`;
const CUTOFF_EPOCH_EXPR = `(unixepoch() - ${RETENTION_DAYS * 86400})`;

// [table, created-column, cutoff-expression]
const PURGE_TARGETS: [string, string, string][] = [
  ["analytics_event", "createdAt", CUTOFF_TEXT_EXPR],
  ["error_log", "createdAt", CUTOFF_EPOCH_EXPR],
  ["download_event", "createdAt", CUTOFF_EPOCH_EXPR],
  ["download_usage", "updatedAt", CUTOFF_TEXT_EXPR],
  ["ai_credit_event", "createdAt", CUTOFF_EPOCH_EXPR],
];

export async function maybePurgeOldRows(
  DB: D1Database,
  sampleRate = 0.02,
): Promise<{ purged: Record<string, number> } | null> {
  try {
    if (Math.random() >= sampleRate) return null;
    const purged: Record<string, number> = {};
    for (const [table, column, cutoff] of PURGE_TARGETS) {
      try {
        const res = await DB.prepare(
          `DELETE FROM "${table}" WHERE "${column}" < ${cutoff}`,
        ).run();
        const deleted =
          (res as unknown as { meta?: { changes?: number } })?.meta?.changes ?? 0;
        if (deleted > 0) purged[table] = deleted;
      } catch {
        // Missing/lazy table (e.g. ai_credit_event before first AI use)
        // — skip it; the next sample retries.
      }
    }
    return { purged };
  } catch {
    return null;
  }
}
