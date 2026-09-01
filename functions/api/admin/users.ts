import { requireAdmin, json } from "../../../src/lib/admin-auth";

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
  const auth = await requireAdmin(context.request, context.env);
  if ("error" in auth) return auth.error;

  const url = new URL(context.request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  const search = url.searchParams.get("search") || "";
  const offset = (page - 1) * limit;

  let query = 'SELECT id, name, email, role, plan, credits, createdAt, image FROM "user"';
  let countQuery = 'SELECT COUNT(*) as total FROM "user"';
  const params: unknown[] = [];

  if (search) {
    const where = " WHERE name LIKE ? OR email LIKE ?";
    query += where;
    countQuery += where;
    params.push(`%${search}%`, `%${search}%`);
  }

  query += " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
  const countResult = await context.env.DB.prepare(countQuery)
    .bind(...params)
    .first<{ total: number }>();

  const stmt = context.env.DB.prepare(query).bind(...params, limit, offset);
  const users = await stmt.all<{
    id: string;
    name: string;
    email: string;
    role: string;
    plan: string;
    credits: number;
    createdAt: number;
    image: string | null;
  }>();

  return json({
    users: users.results || [],
    total: countResult?.total || 0,
    page,
    limit,
  });
}
