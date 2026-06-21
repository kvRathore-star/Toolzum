import { drizzle } from "drizzle-orm/d1";
import * as schema from "../../../src/db/schema";
import { eq } from "drizzle-orm";

export async function onRequest(context: any) {
  const { request, next, env } = context;
  const auth = request.headers.get("Authorization");

  // Require bearer token for all /api/v1/* routes
  if (!auth?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const rawKey = auth.slice(7).trim();
  if (!rawKey.startsWith("th_live_")) {
    return new Response(JSON.stringify({ error: "Invalid API key format" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const uuidPart = rawKey.slice(8);
  const db = drizzle(env.DB, { schema });
  const results = await db.select().from(schema.apiKeys).where(eq(schema.apiKeys.keyPrefix, uuidPart)).all();

  if (results.length === 0) {
    return new Response(JSON.stringify({ error: "API key not found" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const keyRecord = results[0];
  if (keyRecord.revokedAt) {
    return new Response(JSON.stringify({ error: "API key has been revoked" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(rawKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", keyData);
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

  if (hashHex !== keyRecord.keyHash) {
    return new Response(JSON.stringify({ error: "Invalid API key" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  if (keyRecord.requestsUsed >= keyRecord.requestsLimit) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded for this API key" }), { status: 429, headers: { "Content-Type": "application/json" } });
  }

  // Attach key info and userId to context for downstream handlers
  context.apiKey = keyRecord;
  context.userId = keyRecord.userId;

  const response = await next();

  return response;
}
