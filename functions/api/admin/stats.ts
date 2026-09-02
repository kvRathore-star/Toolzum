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
    DB.prepare('SELECT COUNT(*) as count FROM "user"').first<{ count: number }>(),
    DB.prepare('SELECT COUNT(*) as count FROM "user" WHERE plan = ?').bind("pro").first<{ count: number }>(),
    DB.prepare('SELECT COUNT(*) as count FROM "user" WHERE role = ?').bind("admin").first<{ count: number }>(),
    DB.prepare('SELECT COUNT(*) as count FROM "user" WHERE plan = ?').bind("signedin").first<{ count: number }>(),
  ]);

  const [signupsLast7Days, signupsLast30Days, recentActivity] = await Promise.all([
    DB.prepare("SELECT COUNT(*) as count FROM user WHERE createdAt > ?").bind(sevenDaysAgo).first<{ count: number }>(),
    DB.prepare("SELECT COUNT(*) as count FROM user WHERE createdAt > ?").bind(thirtyDaysAgo).first<{ count: number }>(),
    DB.prepare("SELECT COUNT(*) as count FROM analytics_event WHERE timestamp > ?").bind(sevenDaysAgo).first<{ count: number }>(),
  ]);

  // Revenue metrics — reverse-engineer from payment amounts
  // ₹499 = monthly pro, ₹3999 = yearly pro (≈₹333/mo), ₹1999 = one-time pass
  const totalRevenue = await DB.prepare(
    'SELECT COALESCE(SUM(amount), 0) as total FROM payment WHERE status = ?'
  ).bind("paid").first<{ total: number }>();

  const revenueLast30Days = await DB.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total FROM payment WHERE status = ? AND createdAt > ?"
  ).bind("paid", thirtyDaysAgo).first<{ total: number }>();

  const paidCountLast30Days = await DB.prepare(
    "SELECT COUNT(*) as count FROM payment WHERE status = ? AND createdAt > ?"
  ).bind("paid", thirtyDaysAgo).first<{ count: number }>();

  // Monthly breakdown for MRR estimate
  const monthlyPayments = await DB.prepare(
    "SELECT amount, COUNT(*) as count FROM payment WHERE status = ? AND amount IN (499, 3999) GROUP BY amount"
  ).bind("paid").all<{ amount: number; count: number }>();

  let mrr = 0;
  for (const row of monthlyPayments.results || []) {
    if (row.amount === 499) mrr += row.count * 499;
    else if (row.amount === 3999) mrr += row.count * Math.round(3999 / 12);
  }
  // Also count signed-in users as potential conversions (₹0 but active)
  const activeSubscribers = (proUsers?.count || 0) + (signedinUsers?.count || 0);

  recordRateLimit(DB, "admin-stats", ip, "/api/admin/stats");

  return json({
    totalUsers: totalUsers?.count || 0,
    proUsers: proUsers?.count || 0,
    signedinUsers: signedinUsers?.count || 0,
    adminUsers: adminUsers?.count || 0,
    signupsLast7Days: signupsLast7Days?.count || 0,
    signupsLast30Days: signupsLast30Days?.count || 0,
    pageViewsLast7Days: recentActivity?.count || 0,
    mrr,
    arr: mrr * 12,
    totalRevenue: totalRevenue?.total || 0,
    revenueLast30Days: revenueLast30Days?.total || 0,
    paidCountLast30Days: paidCountLast30Days?.count || 0,
    activeSubscribers,
  });
}
