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

export async function onRequestPost(context: { request: Request; env: AdminEnv }) {
  const auth = await requireAdmin(context.request, context.env);
  if ("error" in auth) return auth.error;

  const body = (await context.request.json()) as { userId: string; role: string };
  const { userId, role } = body;

  if (!userId || !["user", "admin"].includes(role)) {
    return json({ error: "invalid_params" }, 400);
  }

  if (userId === auth.user.id) {
    return json({ error: "cannot_change_own_role" }, 400);
  }

  await context.env.DB.prepare('UPDATE "user" SET role = ? WHERE id = ?')
    .bind(role, userId)
    .run();

  return json({ success: true, userId, role });
}
