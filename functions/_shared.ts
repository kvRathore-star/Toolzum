const RATE_LIMIT_WINDOW = 60; // 60 seconds
const RATE_LIMIT_MAX = 30; // 30 requests per window

const ALLOWED_ORIGINS = new Set([
  "https://toolzum.com",
  "http://localhost:3000",
  "http://localhost:8788",
]);

function getOrigin(request: Request): string {
  const origin = request.headers.get("Origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) return origin;
  const referer = request.headers.get("Referer");
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      if (ALLOWED_ORIGINS.has(refOrigin)) return refOrigin;
    } catch { /* ignore invalid referer */ }
  }
  return "https://toolzum.com";
}

export function jsonResponse(data: unknown, status = 200, cors = true, request?: Request) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cors) {
    headers["Access-Control-Allow-Origin"] = request ? getOrigin(request) : "https://toolzum.com";
    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, x-turnstile-token, x-download-fingerprint, webhook-id, webhook-signature, webhook-timestamp, x-razorpay-signature";
    headers["Vary"] = "Origin";
  }
  return new Response(JSON.stringify(data), { status, headers });
}

export function errorResponse(message: string, status = 400, code?: string, request?: Request) {
  return jsonResponse({ error: message, ...(code ? { code } : {}) }, status, true, request);
}

export async function rateLimitCheck(context: any, request: Request): Promise<boolean> {
  try {
    const kv = context.env.RATE_LIMIT_KV;
    if (!kv) return true;
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const now = Math.floor(Date.now() / 1000);
    const windowKey = `${ip}:${Math.floor(now / RATE_LIMIT_WINDOW)}`;
    const count = parseInt(await kv.get(windowKey) || "0", 10);
    if (count >= RATE_LIMIT_MAX) return false;
    await kv.put(windowKey, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW });
    return true;
  } catch {
    return true;
  }
}

export function handleOptions(request: Request): Response | null {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": getOrigin(request),
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-turnstile-token, x-download-fingerprint, webhook-id, webhook-signature, webhook-timestamp, x-razorpay-signature",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin",
      },
    });
  }
  return null;
}
