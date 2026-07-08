import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../../src/db/schema";
import { eq } from "drizzle-orm";

function generateKey(): { rawKey: string; uuid: string } {
  const uuid = crypto.randomUUID();
  return { rawKey: `th_live_${uuid}`, uuid };
}

async function hashKey(rawKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(rawKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function onRequestPost(context: any) {
  const { request, env } = context;

  // Resolve userId from middleware context (set by v1/_middleware for Bearer token),
  // or validate session cookie for web UI users
  let userId = context.userId;

  if (!userId) {
    // Session-based auth (web UI): validate better-auth session token from Cookie
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c: string) => {
        const [k, ...v] = c.trim().split("=");
        return [k, v.join("=")];
      })
    );
    const sessionToken = Object.keys(cookies).find(k => k.includes("better-auth"));
    if (sessionToken && cookies[sessionToken]) {
      const dbSession = drizzle(env.DB, { schema });
      const sessionResult = await dbSession
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.token, cookies[sessionToken]))
        .get();
      if (sessionResult && new Date(sessionResult.expiresAt) > new Date()) {
        userId = sessionResult.userId;
      }
    }
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: "Authentication required. Sign in to create API keys." }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  // Non-blocking Turnstile check on key creation
  const turnstileToken = request.headers.get("x-turnstile-token");
  if (turnstileToken && env.TURNSTILE_SECRET_KEY) {
    try {
      const turnstileBody = new FormData();
      turnstileBody.append("secret", env.TURNSTILE_SECRET_KEY);
      turnstileBody.append("response", turnstileToken);
      const turnstileRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: turnstileBody,
      });
      const turnstileResult: any = await turnstileRes.json();
      if (!turnstileResult.success) {
        console.warn("Turnstile verification failed for key creation");
      }
    } catch (tsErr) {
      console.warn("Turnstile verification error:", tsErr);
    }
  }

  const db = drizzle(env.DB, { schema });

  // Count existing non-revoked keys
  const existing = await db.select().from(schema.apiKeys).where(eq(schema.apiKeys.userId, userId)).all();
  const activeKeys = existing.filter(k => !k.revokedAt);

  const userRecord = await db.select().from(schema.users).where(eq(schema.users.id, userId)).all();
  const plan = userRecord.length > 0 ? userRecord[0].plan : "free";
  const maxKeys = plan === "pro" ? 10 : 2;

  if (activeKeys.length >= maxKeys) {
    return new Response(JSON.stringify({ error: `Maximum ${maxKeys} active keys allowed on your plan. Revoke an existing key first.` }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  let name = "My API Key";
  try {
    const body = await request.json();
    if (body.name) name = body.name;
  } catch { }

  const { rawKey, uuid } = generateKey();
  const keyHash = await hashKey(rawKey);

  await db.insert(schema.apiKeys).values({
    id: crypto.randomUUID(),
    userId,
    keyPrefix: uuid,
    keyHash,
    name,
    plan,
    requestsUsed: 0,
    requestsLimit: plan === "pro" ? 10000 : 100,
    createdAt: new Date(),
  });

  return new Response(JSON.stringify({
    key: rawKey,
    keyId: uuid,
    name,
    hint: "Save this key — it will not be shown again.",
  }), { status: 201, headers: { "Content-Type": "application/json" } });
}

export async function onRequestGet(context: any) {
  const { env } = context;

  const userId = context.userId;
  if (!userId) {
    return new Response(JSON.stringify({ error: "Could not identify user" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const db = drizzle(env.DB, { schema });
  const keys = await db.select().from(schema.apiKeys).where(eq(schema.apiKeys.userId, userId)).all();

  const sanitized = keys.map(k => ({
    id: k.keyPrefix,
    name: k.name,
    plan: k.plan,
    prefix: k.keyPrefix.slice(0, 8),
    requestsUsed: k.requestsUsed,
    requestsLimit: k.requestsLimit,
    createdAt: k.createdAt,
    revokedAt: k.revokedAt,
  }));

  return new Response(JSON.stringify({ keys: sanitized }), { status: 200, headers: { "Content-Type": "application/json" } });
}
