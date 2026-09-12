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
  ] = await Promise.all([
    // Top tools used (7d)
    safeQuery<{ toolSlug: string; toolName: string; category: string; uses: number }>(
      DB,
      `SELECT toolSlug, toolName, category, COUNT(*) as uses FROM user_tool_usage
       WHERE createdAt > ? GROUP BY toolSlug ORDER BY uses DESC LIMIT 10`,
      sevenDaysAgo
    ),
    // Top tools used (30d)
    safeQuery<{ toolSlug: string; toolName: string; category: string; uses: number }>(
      DB,
      `SELECT toolSlug, toolName, category, COUNT(*) as uses FROM user_tool_usage
       WHERE createdAt > ? GROUP BY toolSlug ORDER BY uses DESC LIMIT 15`,
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
      "SELECT COUNT(*) as count FROM user_tool_usage WHERE createdAt > ?",
      thirtyDaysAgo
    ),
    safeFirst<{ count: number }>(
      DB,
      "SELECT COUNT(*) as count FROM error_log WHERE createdAt > ?",
      thirtyDaysAgo
    ),
  ]);

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
    totals: {
      downloads30d: totalDownloads?.count || 0,
      blocked30d: totalBlocked?.count || 0,
      toolUsages30d: totalToolUsages?.count || 0,
      errors30d: totalErrors?.count || 0,
    },
  });
}
