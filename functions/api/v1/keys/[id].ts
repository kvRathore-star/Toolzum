import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../../../src/db/schema";
import { eq } from "drizzle-orm";

export async function onRequestDelete(context: any) {
  const { env, params } = context;
  const keyId = params.id;

  if (!keyId) {
    return new Response(JSON.stringify({ error: "Missing key ID" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const userId = context.userId;
  if (!userId) {
    return new Response(JSON.stringify({ error: "Could not identify user" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const db = drizzle(env.DB, { schema });
  const results = await db.select().from(schema.apiKeys).where(eq(schema.apiKeys.keyPrefix, keyId)).all();

  if (results.length === 0) {
    return new Response(JSON.stringify({ error: "Key not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  }

  if (results[0].userId !== userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: { "Content-Type": "application/json" } });
  }

  await db.update(schema.apiKeys).set({ revokedAt: new Date() }).where(eq(schema.apiKeys.keyPrefix, keyId));

  return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
}

export async function onRequestPatch(context: any) {
  const { request, env, params } = context;
  const keyId = params.id;

  if (!keyId) {
    return new Response(JSON.stringify({ error: "Missing key ID" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const userId = context.userId;
  if (!userId) {
    return new Response(JSON.stringify({ error: "Could not identify user" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  let name: string | undefined;
  try {
    const body = await request.json();
    name = body.name;
  } catch { }

  if (!name) {
    return new Response(JSON.stringify({ error: "Nothing to update" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const db = drizzle(env.DB, { schema });
  const results = await db.select().from(schema.apiKeys).where(eq(schema.apiKeys.keyPrefix, keyId)).all();

  if (results.length === 0) {
    return new Response(JSON.stringify({ error: "Key not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  }

  if (results[0].userId !== userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: { "Content-Type": "application/json" } });
  }

  await db.update(schema.apiKeys).set({ name }).where(eq(schema.apiKeys.keyPrefix, keyId));

  return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
}
