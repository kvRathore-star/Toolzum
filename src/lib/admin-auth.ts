import { createAuth } from "@/lib/auth";

interface AdminEnv {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  TURNSTILE_SECRET_KEY: string;
  ADMIN_EMAILS: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  credits: number;
  createdAt: number;
  image: string | null;
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
    return {
      error: new Response(JSON.stringify({ error: "sign_in_required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  const adminEmails = (env.ADMIN_EMAILS || "")
    .split(",")
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);

  const email = session.user.email?.toLowerCase() || "";

  if (!adminEmails.includes(email)) {
    return {
      error: new Response(JSON.stringify({ error: "admin_email_required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  const userRow = await env.DB.prepare(
    'SELECT role FROM "user" WHERE id = ?'
  )
    .bind(session.user.id)
    .first<{ role: string }>();

  if (userRow?.role !== "admin") {
    return {
      error: new Response(JSON.stringify({ error: "admin_role_required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }

  return {
    user: {
      id: session.user.id,
      name: session.user.name || "",
      email: email,
      role: userRow.role,
      plan: (session.user as Record<string, unknown>).plan as string || "free",
      credits: (session.user as Record<string, unknown>).credits as number || 0,
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
