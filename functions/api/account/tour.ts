import { createAuth } from "../../../src/lib/auth";

interface Env {
  DB: D1Database;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS "user_flags" (
    "userId" text PRIMARY KEY,
    "tourSeenAt" integer,
    "updatedAt" integer NOT NULL
  )
`;

async function ensureTable(DB: D1Database): Promise<void> {
  try {
    await DB.prepare("SELECT 1 FROM user_flags LIMIT 1").first();
  } catch {
    await DB.prepare(CREATE_TABLE).run();
  }
}

async function getUserId(request: Request, env: Env): Promise<string | null> {
  const auth = createAuth({
    DB: env.DB,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID as string,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET as string,
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: env.BETTER_AUTH_URL as string,
    TURNSTILE_SECRET_KEY: env.TURNSTILE_SECRET_KEY as string,
  });
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user?.id ?? null;
}

/** Whether the signed-in user has completed/skipped the onboarding tour. */
export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const userId = await getUserId(context.request, context.env);
    if (!userId) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { DB } = context.env;
    await ensureTable(DB);
    const row = await DB.prepare("SELECT tourSeenAt FROM user_flags WHERE userId = ?")
      .bind(userId)
      .first<{ tourSeenAt: number | null }>();
    return new Response(JSON.stringify({ seen: !!row?.tourSeenAt }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/** Persist the tour state ({ seen: true } hides it on every device). */
export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const userId = await getUserId(context.request, context.env);
    if (!userId) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const body = (await context.request.json().catch(() => ({}))) as { seen?: boolean };
    const { DB } = context.env;
    await ensureTable(DB);
    const now = Date.now();
    await DB.prepare(
      `INSERT INTO user_flags (userId, tourSeenAt, updatedAt) VALUES (?, ?, ?)
       ON CONFLICT(userId) DO UPDATE SET tourSeenAt = excluded.tourSeenAt, updatedAt = excluded.updatedAt`,
    )
      .bind(userId, body.seen ? now : null, now)
      .run();
    return new Response(JSON.stringify({ seen: !!body.seen }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}
