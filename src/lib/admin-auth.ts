import { createAuth } from "@/lib/auth";

interface AdminEnv {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  TURNSTILE_SECRET_KEY: string;
  ADMIN_EMAILS: string;
  ADMIN_IPS?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  credits: number;
  status: string;
  createdAt: number;
  image: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

function jsonError(error: string, status: number): { error: Response } {
  return {
    error: new Response(JSON.stringify({ error }), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  };
}

export async function requireUser(
  request: Request,
  env: Pick<AdminEnv, "DB" | "GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET" | "BETTER_AUTH_SECRET" | "BETTER_AUTH_URL" | "TURNSTILE_SECRET_KEY">
): Promise<{ user: AuthUser } | { error: Response }> {
  const auth = createAuth({
    DB: env.DB,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: env.BETTER_AUTH_URL,
    TURNSTILE_SECRET_KEY: env.TURNSTILE_SECRET_KEY,
  });

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return jsonError("sign_in_required", 401);
  }

  const userRow = await env.DB.prepare(
    'SELECT status FROM "user" WHERE id = ?'
  )
    .bind(session.user.id)
    .first<{ status: string }>();

  if (userRow?.status === "banned") {
    return jsonError("account_banned", 403);
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email?.toLowerCase() || "",
      name: session.user.name || "",
    },
  };
}

export async function requireAdmin(
  request: Request,
  env: AdminEnv
): Promise<{ user: AdminUser } | { error: Response }> {
  const auth = createAuth({
    DB: env.DB,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: env.BETTER_AUTH_URL,
    TURNSTILE_SECRET_KEY: env.TURNSTILE_SECRET_KEY,
  });

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.id) {
    return jsonError("sign_in_required", 401);
  }

  const userRow = await env.DB.prepare(
    'SELECT role, status FROM "user" WHERE id = ?'
  )
    .bind(session.user.id)
    .first<{ role: string; status: string }>();

  if (userRow?.status === "banned") {
    return jsonError("account_banned", 403);
  }

  const adminEmails = (env.ADMIN_EMAILS || "")
    .split(",")
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);

  const email = session.user.email?.toLowerCase() || "";

  if (!adminEmails.includes(email)) {
    return jsonError("admin_email_required", 403);
  }

  if (userRow?.role !== "admin") {
    return jsonError("admin_role_required", 403);
  }

  // IP allowlist — optional, skip if ADMIN_IPS not set
  const adminIps = (env.ADMIN_IPS || "")
    .split(",")
    .map((ip: string) => ip.trim())
    .filter(Boolean);
  if (adminIps.length > 0) {
    const clientIp = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    if (!adminIps.includes(clientIp)) {
      return jsonError("ip_not_allowed", 403);
    }
  }

  return {
    user: {
      id: session.user.id,
      name: session.user.name || "",
      email: email,
      role: userRow.role,
      plan: (session.user as Record<string, unknown>).plan as string || "free",
      credits: (session.user as Record<string, unknown>).credits as number || 0,
      status: userRow.status,
      createdAt: (session.user as Record<string, unknown>).createdAt as number || 0,
      image: session.user.image || null,
    },
  };
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
