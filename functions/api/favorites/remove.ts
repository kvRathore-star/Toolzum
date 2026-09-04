import { createAuth } from "../../../src/lib/auth";
import { checkRateLimit, recordRateLimit } from "../rate-limit";
import type { D1Database } from "@cloudflare/workers-types";

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

    const rl = await checkRateLimit(DB, "fav-rm", session.user.id, 10);
    if (rl.limited) return rl.response;

    await DB.prepare(
      "DELETE FROM user_favorite WHERE userId = ? AND toolSlug = ?"
    )
      .bind(session.user.id, toolSlug)
      .run();

    recordRateLimit(DB, "fav-rm", session.user.id, "/favorites/remove");

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
