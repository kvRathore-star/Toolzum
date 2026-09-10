import { createAuth } from "../../../src/lib/auth";
import type { D1Database } from "@cloudflare/workers-types";

// NOTE: never an allowlist here. A hardcoded category list rotted silently
// (renames like Financial->Finance) and NULLed 11 of 21 categories,
// breaking dashboard links. Taxonomy lives in the registry — accept any
// sane client-supplied value; unknown ones degrade gracefully at render.
const MAX_CATEGORY_LENGTH = 40;

const MAX_SLUG_LENGTH = 80;
const MAX_NAME_LENGTH = 120;

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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = (await context.request.json()) as {
      toolSlug?: string;
      toolName?: string;
      category?: string;
    };

    if (!body.toolSlug || !body.toolName) {
      return new Response(
        JSON.stringify({ error: "toolSlug and toolName required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const toolSlug = String(body.toolSlug).trim().slice(0, MAX_SLUG_LENGTH);
    const toolName = String(body.toolName).trim().slice(0, MAX_NAME_LENGTH);
    const category = body.category && typeof body.category === 'string' && body.category.trim().length > 0 && body.category.trim().length <= MAX_CATEGORY_LENGTH
      ? body.category.trim()
      : null;

    if (!toolSlug || !toolName) {
      return new Response(
        JSON.stringify({ error: "toolSlug and toolName required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const id = crypto.randomUUID();
    const usedAt = Math.floor(Date.now() / 1000);
    const DB = (env as { DB: D1Database }).DB;

    await DB.prepare(
      `INSERT INTO user_tool_usage (id, userId, toolSlug, toolName, category, usedAt) VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(id, session.user.id, toolSlug, toolName, category, usedAt)
      .run();

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
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
