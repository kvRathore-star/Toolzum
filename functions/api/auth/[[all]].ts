import { createAuth } from "../../../src/lib/auth";

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const method = context.request.method;
  const pathname = url.pathname;

  try {
    const auth = createAuth(context.env);
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
