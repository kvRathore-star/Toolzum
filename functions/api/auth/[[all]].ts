import { createAuth } from "../../../src/lib/auth";

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const method = context.request.method;
  const pathname = url.pathname;

  try {
    const auth = createAuth(context.env);
    // TEMP-DIAG (remove after OAuth debug): log callback/error shapes only — never values.
    if (pathname.includes("/callback/") || pathname.includes("/error")) {
      const s = new URL(context.request.url).searchParams;
      const cookie = context.request.headers.get("cookie") || "";
      console.log(
        `[AUTH DIAG] ${method} ${pathname} hasStateParam=${s.has("state")} hasCode=${s.has("code")} ` +
          `paramError=${s.get("error") || "none"} hasStateCookie=${/(^|;\s*)(__Secure-)?better-auth\.state=/.test(cookie)} ` +
          `cookieNames=${cookie.split(";").map((c) => c.split("=")[0]?.trim()).join(",") || "none"}`
      );
    }
    const response = await auth.handler(context.request);

    if (response.status >= 400) {
      const location = response.headers.get("location") || "";
      console.error(`[AUTH ERROR] ${method} ${pathname} → ${response.status} location=${location}`);
    }

    return response;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : "";
    console.error(`[AUTH THROW] ${method} ${pathname}`, msg, stack?.slice(0, 1000));
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
