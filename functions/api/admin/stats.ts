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

async function safeCount(DB: D1Database, query: string, ...args: unknown[]): Promise<{ count: number; failed: boolean }> {
  try {
    const stmt = args.length > 0 ? DB.prepare(query).bind(...args) : DB.prepare(query);
    const result = await stmt.first<{ count: number }>();
    return { count: result?.count || 0, failed: false };
  } catch {
    return { count: 0, failed: true };
  }
}

async function safeSum(DB: D1Database, query: string, ...args: unknown[]): Promise<{ total: number; failed: boolean }> {
  try {
    const stmt = args.length > 0 ? DB.prepare(query).bind(...args) : DB.prepare(query);
    const result = await stmt.first<{ total: number }>();
    return { total: result?.total || 0, failed: false };
  } catch {
    return { total: 0, failed: true };
  }
}

export async function onRequestGet(context: { request: Request; env: AdminEnv }) {
  const DB = context.env.DB;
  const ip = context.request.headers.get("cf-connecting-ip") || "unknown";
  const rl = await checkRateLimit(DB, "admin-stats", ip, 20);
  if (rl.limited) return rl.response;

  const auth = await requireAdmin(context.request, context.env);
  if ("error" in auth) return auth.error;

  const now = Math.floor(Date.now() / 1000);
  const sevenDaysAgo = now - 7 * 86400;
  const thirtyDaysAgo = now - 30 * 86400;

  const [totalUsers, proUsers, adminUsers, signedinUsers] = await Promise.all([
    safeCount(DB, 'SELECT COUNT(*) as count FROM "user"'),
    safeCount(DB, 'SELECT COUNT(*) as count FROM "user" WHERE plan = ?', "pro"),
    safeCount(DB, 'SELECT COUNT(*) as count FROM "user" WHERE role = ?', "admin"),
    safeCount(DB, 'SELECT COUNT(*) as count FROM "user" WHERE plan = ?', "signedin"),
  ]);

  const [signupsLast7Days, signupsLast30Days, recentActivity] = await Promise.all([
    safeCount(DB, "SELECT COUNT(*) as count FROM user WHERE createdAt > ?", sevenDaysAgo),
    safeCount(DB, "SELECT COUNT(*) as count FROM user WHERE createdAt > ?", thirtyDaysAgo),
    safeCount(DB, "SELECT COUNT(*) as count FROM analytics_event WHERE timestamp > ?", sevenDaysAgo),
  ]);

  const [totalRevenue, revenueLast30Days, paidCountLast30Days] = await Promise.all([
    safeSum(DB, 'SELECT COALESCE(SUM(amount), 0) as total FROM payment WHERE status = ?', "paid"),
    safeSum(DB, "SELECT COALESCE(SUM(amount), 0) as total FROM payment WHERE status = ? AND createdAt > ?", "paid", thirtyDaysAgo),
    safeCount(DB, "SELECT COUNT(*) as count FROM payment WHERE status = ? AND createdAt > ?", "paid", thirtyDaysAgo),
  ]);

  let mrr = 0;
  let mrrFailed = false;
  try {
    const monthlyPayments = await DB.prepare(
      "SELECT amount, COUNT(*) as count FROM payment WHERE status = ? AND amount IN (499, 3999) GROUP BY amount"
    ).bind("paid").all<{ amount: number; count: number }>();

    for (const row of monthlyPayments.results || []) {
      if (row.amount === 499) mrr += row.count * 499;
      else if (row.amount === 3999) mrr += row.count * Math.round(3999 / 12);
    }
  } catch {
    mrrFailed = true;
  }

  const activeSubscribers = (proUsers.count || 0) + (signedinUsers.count || 0);

  recordRateLimit(DB, "admin-stats", ip, "/api/admin/stats");

  return json({
    totalUsers: totalUsers.count,
    proUsers: proUsers.count,
    signedinUsers: signedinUsers.count,
    adminUsers: adminUsers.count,
    signupsLast7Days: signupsLast7Days.count,
    signupsLast30Days: signupsLast30Days.count,
    pageViewsLast7Days: recentActivity.count,
    mrr,
    arr: mrr * 12,
    totalRevenue: totalRevenue.total,
    revenueLast30Days: revenueLast30Days.total,
    paidCountLast30Days: paidCountLast30Days.count,
    activeSubscribers,
    _degraded: recentActivity.failed || totalRevenue.failed || mrrFailed,
    _failedQueries: [
      recentActivity.failed && "analytics_event",
      totalRevenue.failed && "payment",
      mrrFailed && "payment_mrr",
    ].filter(Boolean),
  });
}
