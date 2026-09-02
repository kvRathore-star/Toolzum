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

export async function onRequestPost(context: { request: Request; env: AdminEnv }) {
  const DB = context.env.DB;

  const ip = context.request.headers.get("cf-connecting-ip") || "unknown";
  const rl = await checkRateLimit(DB, "admin-role", ip, 10);
  if (rl.limited) return rl.response;

  const auth = await requireAdmin(context.request, context.env);
  if ("error" in auth) return auth.error;

  const body = (await context.request.json()) as { userId: string; role: string; confirmEmail?: string };
  const { userId, role, confirmEmail } = body;

  if (!userId || !["user", "admin"].includes(role)) {
    return json({ error: "invalid_params" }, 400);
  }

  if (userId === auth.user.id) {
    return json({ error: "cannot_change_own_role" }, 400);
  }

  const target = await DB.prepare('SELECT role, email FROM "user" WHERE id = ?')
    .bind(userId)
    .first<{ role: string; email: string }>();

  if (!target) {
    return json({ error: "user_not_found" }, 404);
  }

  // Type-to-confirm: required for any change that grants or removes admin role
  const isAdminChange = target.role === "admin" || role === "admin";
  if (isAdminChange) {
    if (!confirmEmail || confirmEmail !== target.email) {
      return json({ error: "confirm_email_required", message: "Type the user's email to confirm admin role changes" }, 400);
    }
  }

  if (target.role === "admin" && role !== "admin") {
    const adminCount = await DB.prepare(
      'SELECT COUNT(*) as count FROM "user" WHERE role = ?'
    )
      .bind("admin")
      .first<{ count: number }>();

    if (adminCount && adminCount.count <= 1) {
      return json({ error: "cannot_remove_last_admin" }, 400);
    }
  }

  await DB.prepare('UPDATE "user" SET role = ? WHERE id = ?')
    .bind(role, userId)
    .run();

  await DB.prepare(
    "INSERT INTO admin_audit_log (actorEmail, action, targetUserId, oldValue, newValue, createdAt) VALUES (?, ?, ?, ?, ?, datetime('now'))"
  )
    .bind(auth.user.email, "update-role", userId, target.role, role)
    .run()
    .catch(() => {});

  recordRateLimit(DB, "admin-role", ip, "/api/admin/update-role");

  return json({ success: true, userId, role });
}
