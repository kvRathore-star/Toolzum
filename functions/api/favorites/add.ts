import { createAuth } from "../../../src/lib/auth";

export async function onRequestPost(context: { request: Request; env: Record<string, unknown> }) {
  const { env } = context;

  const auth = createAuth({
    DB: (env as { DB: D1Database }).DB,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID as string,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET as string,
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: env.BETTER_AUTH_URL as string,
    TURNSTILE_SECRET_KEY: env.TURNSTILE_SECRET_KEY as string,
  });

  try {
    const session = await auth.api.getSession({
      headers: context.request.headers,
    });

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "sign_in_required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = (await context.request.json()) as { toolSlug?: string };
    const toolSlug = body.toolSlug;
    if (!toolSlug || typeof toolSlug !== "string") {
      return new Response(JSON.stringify({ error: "toolSlug required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const DB = (env as { DB: D1Database }).DB;
    const now = Math.floor(Date.now() / 1000);
    await DB.prepare(
      "INSERT OR IGNORE INTO user_favorite (userId, toolSlug, createdAt) VALUES (?, ?, ?)"
    )
      .bind(session.user.id, toolSlug, now)
      .run();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
