import { listFlags } from "./_flags";
import { checkRateLimit, recordRateLimit } from "./rate-limit";

/**
 * Public flag map (#41/49). No auth — flags gate UI affordances only;
 * enforcement lives server-side at each endpoint. Cached edge-side
 * for an hour; kill-switch propagation worst-case ~1h on CDN, instant
 * on direct origin hits. Client merges over local defaults.
 */
export async function onRequestGet(context: { request: Request; env: { DB: D1Database } }) {
  const DB = context.env.DB;
  const ip = context.request.headers.get("cf-connecting-ip") || "unknown";
  const rl = await checkRateLimit(DB, "flags", ip, 60);
  if (rl.limited) return rl.response;

  const flags = await listFlags(DB);
  recordRateLimit(DB, "flags", ip, "/api/flags");

  return new Response(JSON.stringify({ flags }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60",
    },
  });
}
