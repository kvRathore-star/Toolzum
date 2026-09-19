import { requireAdmin, json } from "../../../src/lib/admin-auth";

/**
 * Notify-me waitlist overview (admin session auth).
 * GET /api/admin/notify-waitlist → { tools: [{ tool, pending, notified }] }
 * Powers the /admin/waitlist broadcast UI.
 */

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
  const { DB } = context.env;

  const auth = await requireAdmin(context.request, context.env);
  if ("error" in auth) return auth.error;

  try {
    const res = await DB.prepare(
      `SELECT tool_slug AS tool,
              SUM(CASE WHEN notifiedAt IS NULL THEN 1 ELSE 0 END) AS pending,
              SUM(CASE WHEN notifiedAt IS NOT NULL THEN 1 ELSE 0 END) AS notified
       FROM notify_waitlist GROUP BY tool_slug ORDER BY pending DESC`
    ).all<{ tool: string; pending: number; notified: number }>();
    return json({ tools: res.results || [] });
  } catch {
    return json({ error: "store_unavailable" }, 502);
  }
}
