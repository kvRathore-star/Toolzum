/**
 * Alert threshold evaluation (#21).
 *
 * Pure evaluator — no side effects except claiming the cooldown slot.
 * The scheduler (.github/workflows/alerts.yml) calls this, then relays
 * to Cloudflare Email Service itself. Separation keeps this endpoint
 * unit-testable and scheduler-swappable.
 *
 * Auth: Bearer ALERT_TOKEN (Pages env). Missing token => 503 LOUD, never
 * a silent dead endpoint (the failure mode this whole item exists to kill).
 *
 * Rules (see docs/ALERTS.md for rationale + tuning):
 * - error-burst: >= 50 error_log rows in the last 15 minutes.
 * - quota-wall-spike: blocked share >= 40% of downloads in the last
 *   hour, with >= 20 downloads (ignores tiny-sample noise).
 * Cooldown: 1 hour per key (alert_log). Claimed when reported — if the
 * relay fails, the next window re-fires.
 */

const ERROR_BURST_LIMIT = 50;
const ERROR_BURST_WINDOW_SEC = 15 * 60;
const BLOCKED_SHARE_NUM = 40;
const BLOCKED_SHARE_MIN_DOWNLOADS = 20;
const BLOCKED_SHARE_WINDOW_SEC = 3600;
const COOLDOWN_SEC = 3600;

export interface AlertHit {
  key: string;
  detail: string;
}

async function countSince(
  DB: D1Database,
  table: string,
  extraWhere: string,
  cutoff: number,
): Promise<number> {
  try {
    const row = await DB.prepare(
      `SELECT COUNT(*) as c FROM "${table}" WHERE createdAt > ?${extraWhere ? ` AND ${extraWhere}` : ""}`,
    )
      .bind(cutoff)
      .first<{ c: number }>();
    return row?.c ?? 0;
  } catch {
    return 0;
  }
}

async function cooldownFresh(DB: D1Database, key: string, now: number): Promise<boolean> {
  try {
    const row = await DB.prepare('SELECT lastSentAt FROM alert_log WHERE "key" = ?')
      .bind(key)
      .first<{ lastSentAt: number }>();
    if (!row) return false;
    return now - row.lastSentAt < COOLDOWN_SEC;
  } catch {
    return false;
  }
}

async function claimSlot(DB: D1Database, key: string, detail: string, now: number): Promise<void> {
  try {
    await DB.prepare(
      `INSERT INTO alert_log ("key", lastSentAt, lastDetail, updatedAt) VALUES (?, ?, ?, ?)
       ON CONFLICT("key") DO UPDATE SET lastSentAt = excluded.lastSentAt, lastDetail = excluded.lastDetail, updatedAt = excluded.updatedAt`,
    )
      .bind(key, now, detail.slice(0, 500), now)
      .run();
  } catch {
    /* cooldown best-effort — a missed claim re-fires next window */
  }
}

export async function onRequestGet(context: { request: Request; env: Record<string, unknown> }) {
  const { request, env } = context;
  const DB = env.DB as D1Database;
  const token = env.ALERT_TOKEN as string | undefined;

  if (!token) {
    return new Response(JSON.stringify({ error: "alerting_not_configured" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
  const auth = request.headers.get("authorization") || "";
  if (auth !== `Bearer ${token}`) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const now = Math.floor(Date.now() / 1000);
  const alerts: AlertHit[] = [];

  // Rule 1: error burst.
  const errors = await countSince(DB, "error_log", "", now - ERROR_BURST_WINDOW_SEC);
  if (errors >= ERROR_BURST_LIMIT && !(await cooldownFresh(DB, "error-burst", now))) {
    const detail = `${errors} errors in the last 15 minutes (threshold ${ERROR_BURST_LIMIT})`;
    await claimSlot(DB, "error-burst", detail, now);
    alerts.push({ key: "error-burst", detail });
  }

  // Rule 2: quota-wall spike (paywall misfire or scraping).
  const [blocked, total] = await Promise.all([
    countSince(DB, "download_event", "outcome LIKE 'blocked%'", now - BLOCKED_SHARE_WINDOW_SEC),
    countSince(DB, "download_event", "", now - BLOCKED_SHARE_WINDOW_SEC),
  ]);
  if (
    total >= BLOCKED_SHARE_MIN_DOWNLOADS &&
    blocked * 100 >= BLOCKED_SHARE_NUM * total &&
    !(await cooldownFresh(DB, "quota-wall-spike", now))
  ) {
    const detail = `${blocked}/${total} downloads blocked in the last hour (${Math.round((blocked / total) * 100)}%, threshold ${BLOCKED_SHARE_NUM}%)`;
    await claimSlot(DB, "quota-wall-spike", detail, now);
    alerts.push({ key: "quota-wall-spike", detail });
  }

  return new Response(
    JSON.stringify({ triggered: alerts.length > 0, alerts, evaluatedAt: now }),
    { headers: { "Content-Type": "application/json" } },
  );
}
