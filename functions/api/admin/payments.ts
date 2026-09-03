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
  const rl = await checkRateLimit(DB, "admin-payments", ip, 30);
  if (rl.limited) return rl.response;

  const auth = await requireAdmin(context.request, context.env);
  if ("error" in auth) return auth.error;

  const url = new URL(context.request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const offset = (page - 1) * limit;

  let whereClause = "";
  let countWhere = "";
  const binds: unknown[] = [];
  const countBinds: unknown[] = [];

  if (search) {
    whereClause = `LEFT JOIN "user" u ON p.userId = u.id WHERE (u.name LIKE ? OR u.email LIKE ? OR p.orderId LIKE ?)`;
    countWhere = `LEFT JOIN "user" u ON p.userId = u.id WHERE (u.name LIKE ? OR u.email LIKE ? OR p.orderId LIKE ?)`;
    const s = `%${search}%`;
    binds.push(s, s, s);
    countBinds.push(s, s, s);
  } else {
    whereClause = `LEFT JOIN "user" u ON p.userId = u.id`;
    countWhere = `LEFT JOIN "user" u ON p.userId = u.id`;
  }

  if (status) {
    const statusClause = whereClause.includes("WHERE") ? "AND p.status = ?" : "WHERE p.status = ?";
    const countStatusClause = countWhere.includes("WHERE") ? "AND p.status = ?" : "WHERE p.status = ?";
    whereClause += ` ${statusClause}`;
    countWhere += ` ${countStatusClause}`;
    binds.push(status);
    countBinds.push(status);
  }

  const countResult = await DB.prepare(`SELECT COUNT(*) as total FROM payment p ${countWhere}`)
    .bind(...countBinds)
    .first<{ total: number }>();
  const total = countResult?.total || 0;

  const payments = await DB.prepare(
    `SELECT p.id, p.userId, p.gateway, p.orderId, p.amount, p.currency, p.status, p.createdAt,
            u.name as userName, u.email as userEmail
     FROM payment p ${whereClause}
     ORDER BY p.createdAt DESC LIMIT ? OFFSET ?`
  )
    .bind(...binds, limit, offset)
    .all<{
      id: string;
      userId: string;
      gateway: string;
      orderId: string;
      amount: number;
      currency: string;
      status: string;
      createdAt: number;
      userName: string | null;
      userEmail: string | null;
    }>();

  recordRateLimit(DB, "admin-payments", ip, "/api/admin/payments");

  return json({
    payments: payments.results || [],
    total,
    page,
    limit,
  });
}
