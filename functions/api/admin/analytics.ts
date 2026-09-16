import { requireAdmin, json } from "../../../src/lib/admin-auth";
import { checkRateLimit, recordRateLimit } from "../rate-limit";

interface AdminEnv {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  TURNSTILE_SECRET_KEY: string;
  ADMIN_EMAILS: string;
}

async function safeQuery<T>(DB: D1Database, query: string, ...args: unknown[]): Promise<T[]> {
  try {
    const stmt = args.length > 0 ? DB.prepare(query).bind(...args) : DB.prepare(query);
    const result = await stmt.all<T>();
    return result.results || [];
  } catch {
    return [];
  }
}

async function safeFirst<T>(DB: D1Database, query: string, ...args: unknown[]): Promise<T | null> {
  try {
    const stmt = args.length > 0 ? DB.prepare(query).bind(...args) : DB.prepare(query);
    return await stmt.first<T>() || null;
  } catch {
    return null;
  }
}

// Day bucket that tolerates every createdAt flavor in this DB: unix seconds
// (download_event, error_log, rate-limit rows), unix millis (better-auth
// user/session rows), and ISO/datetime text. Bare DATE(int) misreads integers
// as Julian days (garbage labels) and DATE(bad-input) yields NULL (which
// crashed the analytics page on .slice — Sep 12 2026).
const DAY_BUCKET =
  "DATE(CASE WHEN typeof(createdAt) = 'integer' AND createdAt > 100000000000 " +
  "THEN datetime(CAST(createdAt / 1000 AS INTEGER), 'unixepoch') " +
  "WHEN typeof(createdAt) = 'integer' THEN datetime(createdAt, 'unixepoch') " +
  "ELSE createdAt END)";

export async function onRequestGet(context: { request: Request; env: AdminEnv }) {
  const DB = context.env.DB;
  const ip = context.request.headers.get("cf-connecting-ip") || "unknown";
  const rl = await checkRateLimit(DB, "admin-analytics", ip, 20);
  if (rl.limited) return rl.response;

  const auth = await requireAdmin(context.request, context.env);
  if ("error" in auth) return auth.error;

  const now = Math.floor(Date.now() / 1000);
  const day = 86400;
  const sevenDaysAgo = now - 7 * day;
  const thirtyDaysAgo = now - 30 * day;
  // better-auth user rows are millis; everything event-like is seconds.
  const thirtyDaysAgoMs = thirtyDaysAgo * 1000;

  const [
    topTools7d,
    topTools30d,
    downloadsByDay,
    downloadsByUserType,
    blockedDownloads,
    missedSearches,
    topDownloadedTools,
    errorsByDay,
    topErrors,
    signupsByDay,
    pageViewsByDay,
    funnelSignup,
    funnelQuota,
    funnelQuotaAnon,
    funnelCredit,
  ] = await Promise.all([
    // Top tools used (7d). NOTE: the column is usedAt (unix seconds) —
    // a previous revision read a nonexistent createdAt, so these charts
    // silently showed "No data" forever. Same fix as the timestamp note.
    safeQuery<{ toolSlug: string; toolName: string; category: string; uses: number }>(
      DB,
      `SELECT toolSlug, toolName, category, COUNT(*) as uses FROM user_tool_usage
       WHERE usedAt > ? GROUP BY toolSlug ORDER BY uses DESC LIMIT 10`,
      sevenDaysAgo
    ),
    // Top tools used (30d)
    safeQuery<{ toolSlug: string; toolName: string; category: string; uses: number }>(
      DB,
      `SELECT toolSlug, toolName, category, COUNT(*) as uses FROM user_tool_usage
       WHERE usedAt > ? GROUP BY toolSlug ORDER BY uses DESC LIMIT 15`,
      thirtyDaysAgo
    ),
    // Downloads by day (30d). Blocked outcomes are 'blocked_quota' /
    // 'blocked_pro_anon' (see downloads/record.ts) — LIKE, never =.
    safeQuery<{ date: string; count: number; blocked: number }>(
      DB,
      `SELECT ${DAY_BUCKET} as date,
              COUNT(*) as count,
              SUM(CASE WHEN outcome LIKE 'blocked%' THEN 1 ELSE 0 END) as blocked
       FROM download_event WHERE createdAt > ?
       GROUP BY ${DAY_BUCKET} ORDER BY date`,
      thirtyDaysAgo
    ),
    // Downloads by user type
    safeQuery<{ userType: string; count: number; blocked: number }>(
      DB,
      `SELECT userType,
              COUNT(*) as count,
              SUM(CASE WHEN outcome LIKE 'blocked%' THEN 1 ELSE 0 END) as blocked
       FROM download_event WHERE createdAt > ?
       GROUP BY userType ORDER BY count DESC`,
      thirtyDaysAgo
    ),
    // Blocked downloads by tool
    safeQuery<{ toolSlug: string; category: string; count: number }>(
      DB,
      `SELECT toolSlug, category, COUNT(*) as count FROM download_event
       WHERE outcome LIKE 'blocked%' AND createdAt > ?
       GROUP BY toolSlug ORDER BY count DESC LIMIT 10`,
      thirtyDaysAgo
    ),
    // Top missed searches (30d) — zero-result Cmd+K queries logged as
    // search:miss:<query>. Feeds SEARCH_ALIASES: promote repeats monthly.
    safeQuery<{ query: string; misses: number }>(
      DB,
      `SELECT REPLACE(path, 'search:miss:', '') as query, COUNT(*) as misses FROM analytics_event
       WHERE path LIKE 'search:miss:%' AND createdAt > ?
       GROUP BY query ORDER BY misses DESC LIMIT 15`,
      thirtyDaysAgo
    ),
    // Top downloaded tools
    safeQuery<{ toolSlug: string; category: string; count: number }>(
      DB,
      `SELECT toolSlug, category, COUNT(*) as count FROM download_event
       WHERE outcome = 'allowed' AND createdAt > ?
       GROUP BY toolSlug ORDER BY count DESC LIMIT 10`,
      thirtyDaysAgo
    ),
    // Errors by day (30d)
    safeQuery<{ date: string; count: number }>(
      DB,
      `SELECT ${DAY_BUCKET} as date, COUNT(*) as count FROM error_log
       WHERE createdAt > ? GROUP BY ${DAY_BUCKET} ORDER BY date`,
      thirtyDaysAgo
    ),
    // Top errors
    safeQuery<{ message: string; count: number; lastSeen: string }>(
      DB,
      `SELECT message, COUNT(*) as count, MAX(createdAt) as lastSeen FROM error_log
       WHERE createdAt > ? GROUP BY message ORDER BY count DESC LIMIT 5`,
      thirtyDaysAgo
    ),
    // Signups by day (30d)
    safeQuery<{ date: string; count: number }>(
      DB,
      `SELECT ${DAY_BUCKET} as date, COUNT(*) as count FROM user
       WHERE createdAt > ? GROUP BY ${DAY_BUCKET} ORDER BY date`,
      thirtyDaysAgo
    ),
    // Page views by day (30d). NOTE: the column is createdAt (mixed unix /
    // datetime rows) — a previous revision read a nonexistent `timestamp`
    // column, so this chart silently showed "No data" forever.
    safeQuery<{ date: string; count: number }>(
      DB,
      `SELECT ${DAY_BUCKET} as date, COUNT(*) as count FROM analytics_event
       WHERE createdAt > ? GROUP BY ${DAY_BUCKET} ORDER BY date`,
      thirtyDaysAgo
    ),
    // FUNNEL 1 — signup → first tool (30d signups). First use = earliest
    // signed-in usage row or allowed download (both unix seconds); signup
    // is better-auth millis, normalized per row.
    safeQuery<{
      signups: number; activated: number; activated7d: number; avgSecsToFirst: number | null;
    }>(
      DB,
      `SELECT COUNT(*) as signups,
              SUM(CASE WHEN f.firstUse IS NOT NULL THEN 1 ELSE 0 END) as activated,
              SUM(CASE WHEN f.firstUse IS NOT NULL AND f.firstUse <= s.signupSec + 604800 THEN 1 ELSE 0 END) as activated7d,
              AVG(CASE WHEN f.firstUse IS NOT NULL AND f.firstUse >= s.signupSec THEN f.firstUse - s.signupSec END) as avgSecsToFirst
       FROM (SELECT id,
                    CAST(CASE WHEN createdAt > 100000000000 THEN createdAt / 1000 ELSE createdAt END AS INTEGER) as signupSec
             FROM "user" WHERE createdAt > ?) s
       LEFT JOIN (SELECT userId, MIN(ts) as firstUse FROM (
                    SELECT userId, usedAt as ts FROM user_tool_usage WHERE userId IS NOT NULL
                    UNION ALL
                    SELECT userId, createdAt as ts FROM download_event WHERE userId IS NOT NULL AND outcome = 'allowed'
                  ) GROUP BY userId) f ON f.userId = s.id`,
      thirtyDaysAgoMs
    ),
    // FUNNEL 2 — quota wall → Pro (30d). Signed-in users blocked who are
    // pro now. plan='pro' covers paid conversion (set on payment).
    safeQuery<{ blockedUsers: number; convertedPro: number }>(
      DB,
      `SELECT COUNT(*) as blockedUsers,
              SUM(CASE WHEN u.plan = 'pro' THEN 1 ELSE 0 END) as convertedPro
       FROM (SELECT DISTINCT userId FROM download_event
             WHERE userId IS NOT NULL AND outcome LIKE 'blocked%' AND createdAt > ?) d
       LEFT JOIN "user" u ON u.id = d.userId`,
      thirtyDaysAgo
    ),
    // FUNNEL 2b — anonymous wall volume (unlinkable: anon rows carry the
    // browser hash, signed-in rows carry userId — no join key by design).
    safeQuery<{ anonBlocks: number; anonDevices: number }>(
      DB,
      `SELECT COUNT(*) as anonBlocks, COUNT(DISTINCT fingerprint) as anonDevices
       FROM download_event
       WHERE userId IS NULL AND outcome LIKE 'blocked%' AND createdAt > ?`,
      thirtyDaysAgo
    ),
    // FUNNEL 3 — AI credit wall → Pro (30d). ai_credit_event is lazy
    // (missing before first AI use) — safeQuery yields [] so the UI
    // must default, never assume a row.
    safeQuery<{ walledUsers: number; convertedPro: number }>(
      DB,
      `SELECT COUNT(*) as walledUsers,
              SUM(CASE WHEN u.plan = 'pro' THEN 1 ELSE 0 END) as convertedPro
       FROM (SELECT DISTINCT userId FROM ai_credit_event
             WHERE outcome = 'blocked_exhausted' AND createdAt > ?) w
       LEFT JOIN "user" u ON u.id = w.userId`,
      thirtyDaysAgo
    ),
  ]);

  const [
    totalDownloads,
    totalBlocked,
    totalToolUsages,
    totalErrors,
  ] = await Promise.all([
    safeFirst<{ count: number }>(
      DB,
      "SELECT COUNT(*) as count FROM download_event WHERE createdAt > ?",
      thirtyDaysAgo
    ),
    safeFirst<{ count: number }>(
      DB,
      "SELECT COUNT(*) as count FROM download_event WHERE outcome LIKE 'blocked%' AND createdAt > ?",
      thirtyDaysAgo
    ),
    safeFirst<{ count: number }>(
      DB,
      "SELECT COUNT(*) as count FROM user_tool_usage WHERE usedAt > ?",
      thirtyDaysAgo
    ),
    safeFirst<{ count: number }>(
      DB,
      "SELECT COUNT(*) as count FROM error_log WHERE createdAt > ?",
      thirtyDaysAgo
    ),
  ]);

  // Single-row funnel aggregates: default on empty (notably the lazy
  // ai_credit_event table, missing before first AI use).
  const f1 = funnelSignup[0] ?? { signups: 0, activated: 0, activated7d: 0, avgSecsToFirst: null };
  const f2 = funnelQuota[0] ?? { blockedUsers: 0, convertedPro: 0 };
  const f2b = funnelQuotaAnon[0] ?? { anonBlocks: 0, anonDevices: 0 };
  const f3 = funnelCredit[0] ?? { walledUsers: 0, convertedPro: 0 };

  recordRateLimit(DB, "admin-analytics", ip, "/api/admin/analytics");

  return json({
    topTools7d,
    topTools30d,
    downloadsByDay,
    downloadsByUserType,
    blockedDownloads,
    topDownloadedTools,
    missedSearches,
    errorsByDay,
    topErrors,
    signupsByDay,
    pageViewsByDay,
    funnels: {
      signupToFirstTool: {
        signups: f1.signups,
        activated: f1.activated,
        activated7d: f1.activated7d,
        avgSecsToFirst: f1.avgSecsToFirst,
      },
      quotaWallToPro: {
        blockedUsers: f2.blockedUsers,
        convertedPro: f2.convertedPro,
        anonBlocks: f2b.anonBlocks,
        anonDevices: f2b.anonDevices,
      },
      creditWallToPro: {
        walledUsers: f3.walledUsers,
        convertedPro: f3.convertedPro,
      },
    },
    totals: {
      downloads30d: totalDownloads?.count || 0,
      blocked30d: totalBlocked?.count || 0,
      toolUsages30d: totalToolUsages?.count || 0,
      errors30d: totalErrors?.count || 0,
    },
  });
}
