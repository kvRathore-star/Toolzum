import { createAuth } from "../../../src/lib/auth";

export const onRequest: PagesFunction = async (context) => {
  try {
    const auth = createAuth(context.env);
    const response = await auth.handler(context.request);

    if (response.status >= 400) {
      const body = await response.clone().text().catch(() => "");
      console.error(`[AUTH] ${response.status} ${context.request.url}`, body.slice(0, 500));
    }

    return response;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : "";
    console.error(`[AUTH ERROR] ${context.request.url}`, msg, stack?.slice(0, 500));
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
