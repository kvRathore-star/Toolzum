import { requireAdmin, json } from "../../../src/lib/admin-auth";
import { checkRateLimit, recordRateLimit } from "../rate-limit";
import { sendEmail } from "../../../src/lib/email";
import { renderEmail } from "../../../src/lib/emailTemplate";

interface AdminEnv {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  TURNSTILE_SECRET_KEY: string;
  ADMIN_EMAILS: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
}

export async function onRequestPost(context: { request: Request; env: AdminEnv }) {
  const DB = context.env.DB;

  const ip = context.request.headers.get("cf-connecting-ip") || "unknown";
  const rl = await checkRateLimit(DB, "admin-reset-pw", ip, 5);
  if (rl.limited) return rl.response;

  const auth = await requireAdmin(context.request, context.env);
  if ("error" in auth) return auth.error;

  const body = (await context.request.json()) as { userId: string };
  const { userId } = body;

  if (!userId) return json({ error: "missing userId" }, 400);

  const target = await DB.prepare('SELECT id, email FROM "user" WHERE id = ?')
    .bind(userId)
    .first<{ id: string; email: string }>();

  if (!target) return json({ error: "user_not_found" }, 404);

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let tempPw = "";
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  for (const b of bytes) tempPw += chars[b % chars.length];

  const SCRYPT_PARAMS = { N: 4096, r: 8, p: 1, maxmem: 128 * 4096 * 8 * 2 };
  const { scryptSync, randomBytes } = await import("node:crypto");
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(tempPw.normalize("NFKC"), salt, 64, SCRYPT_PARAMS);
  const hashedPw = `${salt}:${key.toString("hex")}`;

  await DB.prepare('UPDATE "user" SET "hashedPassword" = ? WHERE id = ?')
    .bind(hashedPw, userId)
    .run();

  await DB.prepare(
    "INSERT INTO admin_audit_log (actorEmail, action, targetUserId, oldValue, newValue, createdAt) VALUES (?, ?, ?, ?, ?, datetime('now'))"
  )
    .bind(auth.user.email, "reset-password", userId, null, "temp_password_set")
    .run()
    .catch(() => {});

  recordRateLimit(DB, "admin-reset-pw", ip, "/api/admin/reset-password");

  // Email the temp password to the user directly (best-effort — the
  // admin still gets it in the response if sending is unconfigured).
  const emailed = await sendEmail(context.env, {
    to: target.email,
    subject: "Your Toolzum password was reset",
    text: `An administrator reset your Toolzum password.\n\nTemporary password: ${tempPw}\n\nSign in and change it immediately from your account page. If you didn't request this, contact us at contact@toolzum.com.`,
    html: renderEmail({
      heading: "Your password was reset by an administrator",
      greeting: "Sign in with the temporary password below, then change it immediately.",
      paragraphs: [
        "A temporary password was issued for your Toolzum account. Sign in with it and change it immediately from your account page.",
      ],
      details: [
        { label: "Account", value: target.email },
        { label: "Temporary password", value: tempPw },
      ],
      cta: { label: "Sign in", url: "https://toolzum.com/login" },
      note: "If you didn't request this, contact us at contact@toolzum.com right away.",
    }),
  });

  return json({ success: true, tempPassword: tempPw, email: target.email, emailed });
}
