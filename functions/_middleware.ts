export async function onRequest(context: any) {
  const { request, next } = context;
  
  const response = await next();
  
  // Security headers
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  
  // Geo cookie
  const cookieHeader = request.headers.get("Cookie") || "";
  if (!cookieHeader.includes("user-country=")) {
    const country = request.headers.get("cf-ipcountry") || "US";
    response.headers.append(
      "Set-Cookie", 
      `user-country=${country}; Path=/; Max-Age=604800; SameSite=Lax; Secure`
    );
  }
  
  return response;
}
