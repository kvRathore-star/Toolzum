import { createAuth } from "../../../src/lib/auth";

export const onRequest: PagesFunction = async (context) => {
  try {
    const auth = createAuth(context.env);
    const url = new URL(context.request.url);
    console.log(`[AUTH REQ] ${context.request.method} ${url.pathname}${url.search}`);

    const response = await auth.handler(context.request);
    const cloned = response.clone();
    const body = await cloned.text();
    console.log(`[AUTH RES] status=${response.status} body=${body.substring(0, 500)}`);

    // If better-auth returned a 500 with empty body, try to get more info
    if (response.status === 500 && !body) {
      console.error("[AUTH 500] Empty body from better-auth handler");
      return new Response(JSON.stringify({
        error: "Internal auth error",
        path: url.pathname,
        method: context.request.method,
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return response;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : undefined;
    console.error("[AUTH EXCEPTION]", msg, stack);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
