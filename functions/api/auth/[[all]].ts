import { createAuth } from "../../../src/lib/auth";

export const onRequest: PagesFunction = async (context) => {
  try {
    const auth = createAuth(context.env);
    const response = await auth.handler(context.request);

    if (response.status >= 400) {
      const body = await response.clone().text();
      console.error(`[AUTH ${response.status}] ${context.request.method} ${context.request.url}`, body);
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
