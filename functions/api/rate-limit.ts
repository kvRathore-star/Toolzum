/**
 * Shared rate-limit helper for Cloudflare Pages Functions.
 *
 * All endpoints use the same D1 table (analytics_event) with a prefixed
 * fingerprint column. This module centralises the check / record / 429
 * logic so each handler doesn't copy-paste ~15 lines.
 *
 * Usage in an endpoint:
 *
 *   import { checkRateLimit, recordRateLimit } from './rate-limit';
 *
 *   const rl = await checkRateLimit(DB, 'analytics', ip, 30);
 *   if (rl.limited) return rl.response;          // 429 + Retry-After
 *   // … do work …
 *   await recordRateLimit(DB, 'analytics', ip);   // fire-and-forget
 */

interface RateLimitResult {
  limited: boolean;
  response?: Response;
}

const WINDOW_SECONDS = 60;

/**
 * Check whether the given key has exceeded `limit` in the last minute.
 * Returns { limited: true, response } with a 429 + Retry-After header
 * when the limit is hit, otherwise { limited: false }.
 */
export async function checkRateLimit(
  DB: D1Database,
  prefix: string,
  key: string,
  limit: number,
): Promise<RateLimitResult> {
  const fingerprint = `${prefix}:${key}`;
  const row = await DB.prepare(
    "SELECT COUNT(*) as c FROM analytics_event WHERE fingerprint = ? AND createdAt > datetime('now', '-1 minute')"
  )
    .bind(fingerprint)
    .first<{ c: number }>();

  if (row && row.c >= limit) {
    return {
      limited: true,
      response: new Response(
        JSON.stringify({ error: 'Rate limited. Try again in a minute.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(WINDOW_SECONDS),
          },
        },
      ),
    };
  }

  return { limited: false };
}

/**
 * Record a rate-limit tick (fire-and-forget). Intentionally does NOT
 * await so a DB write failure doesn't block the response. A failed
 * insert silently loses one tick — acceptable trade-off for availability.
 */
export function recordRateLimit(
  DB: D1Database,
  prefix: string,
  key: string,
  path: string,
): void {
  const fingerprint = `${prefix}:${key}`;
  DB.prepare(
    "INSERT INTO analytics_event (path, fingerprint, clientType, createdAt) VALUES (?, ?, 'rate-limit', datetime('now'))"
  )
    .bind(path, fingerprint)
    .run()
    .catch(() => {});
}
