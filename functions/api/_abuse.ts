/**
 * Bot rules (#37). Two velocity guards backed by the existing
 * analytics_event rate-limit rows — no new tables, no new PII:
 * IPs appear only inside ephemeral `prefix:<ip>` fingerprints that
 * the 90-day purge sweeps like everything else.
 *
 * Thresholds are deliberately farm-scale (see docs/ABUSE.md): carrier-
 * grade NAT shares IPs widely, so these catch automation, not cafés.
 */

import { maybePurgeOldRows } from "./_retention";

export const AI_IP_HOURLY_LIMIT = 300;
export const ANON_DL_DAILY_LIMIT = 500;

function forbidden(message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: { "Content-Type": "application/json", "Retry-After": "3600" },
  });
}

export function logAbuse(
  DB: D1Database,
  path: string,
  reason: string,
  ip: string,
): void {
  // NOTE: an earlier revision bound 4 values into 5 columns (silent
  // failure via .catch) — abuse rows were never written. Column/value
  // counts must stay in sync here; the data-migrations gate can't see it.
  DB.prepare(
    "INSERT INTO analytics_event (id, path, fingerprint, clientType, createdAt) VALUES (?, ?, ?, 'abuse', unixepoch())",
  )
    .bind(crypto.randomUUID(), `${path} [${reason}]`, `abuse:${reason}:${ip}`)
    .run()
    .catch(() => {});
  // Abuse rows land in analytics_event — keep the purge covered (the
  // privacy gate fails CI otherwise). Sampled; never rejects.
  void maybePurgeOldRows(DB, 0.005);
}

/**
 * AI bot rule: N calls from one IP in the last hour across ANY accounts
 * (per-account credits + per-user rate limits already bound individuals;
 * this catches multi-account farms draining provider budget).
 * Callers must record the tick via recordAiIpHit() on the allow path...
 * Simpler: this helper both checks AND records (one row per AI call).
 */
export async function checkAiIpVelocity(
  DB: D1Database,
  ip: string,
  path: string,
): Promise<Response | null> {
  try {
    const fp = `ai-ip:${ip}`;
    const row = await DB.prepare(
      "SELECT COUNT(*) as c FROM analytics_event WHERE fingerprint = ? AND createdAt > datetime('now', '-1 hour')",
    )
      .bind(fp)
      .first<{ c: number }>();
    if (row && row.c >= AI_IP_HOURLY_LIMIT) {
      logAbuse(DB, path, "ai-ip-velocity", ip);
      return forbidden("Too many AI requests from your network. Try again later.");
    }
    DB.prepare(
      "INSERT INTO analytics_event (path, fingerprint, clientType, createdAt) VALUES (?, ?, 'ai-ip', datetime('now'))",
    )
      .bind(path, fp)
      .run()
      .catch(() => {});
    // Ticks land in analytics_event too — purge rides along (sampled).
    await maybePurgeOldRows(DB);
    return null;
  } catch {
    return null;
  }
}

/**
 * Anonymous quota-rotation backstop: the per-device fingerprint quota
 * (x-download-fingerprint) is self-reported and rotatable, so a farm
 * gets 3 downloads per forged hash. This caps total attempts per IP
 * per day — legitimate shared IPs rarely approach it (see ABUSE.md).
 */
export async function checkAnonDlVelocity(
  DB: D1Database,
  ip: string,
  path: string,
): Promise<Response | null> {
  try {
    const fp = `dl-record:${ip}`;
    const row = await DB.prepare(
      "SELECT COUNT(*) as c FROM analytics_event WHERE fingerprint = ? AND createdAt > datetime('now', '-1 day')",
    )
      .bind(fp)
      .first<{ c: number }>();
    if (row && row.c >= ANON_DL_DAILY_LIMIT) {
      logAbuse(DB, path, "anon-dl-velocity", ip);
      return forbidden("Too many downloads from your network today. Try again tomorrow.");
    }
    return null;
  } catch {
    return null;
  }
}
