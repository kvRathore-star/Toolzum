import { createAuth } from "../../../src/lib/auth";

export const onRequest: PagesFunction = async (context) => {
  try {
    const auth = createAuth(context.env);
    const response = await auth.handler(context.request);

    // Intercept 500 responses to log and optionally override
    if (response.status >= 500) {
      const cloned = response.clone();
      const body = await cloned.text();
      console.error(`[AUTH ${response.status}] ${context.request.method} ${context.request.url} body=${body.substring(0, 500)}`);

      // Return our own error response with details
      return new Response(JSON.stringify({
        error: body || "Auth handler error",
        status: response.status,
      }), {
        status: response.status,
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
