import { createAuth } from "../../../src/lib/auth";

export const onRequest: PagesFunction = async (context) => {
  try {
    const auth = createAuth(context.env);
    const url = new URL(context.request.url);
    const path = url.pathname.replace("/api/auth", "");

    // For GET requests, use the handler
    if (context.request.method === "GET") {
      return auth.handler(context.request);
    }

    // For POST requests, use the API directly
    if (path === "/sign-up/email" && context.request.method === "POST") {
      const body = await context.request.json();
      const result = await (auth as any).api.signUpEmail({
        body,
        headers: context.request.headers,
      });
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (path === "/sign-in/email" && context.request.method === "POST") {
      const body = await context.request.json();
      const result = await (auth as any).api.signInEmail({
        body,
        headers: context.request.headers,
      });
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fallback to handler for other routes
    return auth.handler(context.request);
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
