import { createAuth } from "../../../src/lib/auth";

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const method = context.request.method;
  const pathname = url.pathname;

  const isCallback = pathname.includes("/callback/");
  const isSignInSocial = pathname.includes("/sign-in/social");

  if (isCallback || isSignInSocial) {
    console.log(`[AUTH REQ] ${method} ${pathname} query=${url.search}`);
  }

  try {
    const auth = createAuth(context.env);
    const response = await auth.handler(context.request);

    const status = response.status;
    const location = response.headers.get("location") || "";

    if (status >= 400 || location.includes("error")) {
      console.error(`[AUTH RESP] ${method} ${pathname} → ${status} location=${location}`);
    }

    if (isCallback && status >= 300 && status < 400 && location) {
      const loc = new URL(location, url.origin);
      if (loc.searchParams.has("error")) {
        console.error(`[AUTH CALLBACK ERROR] redirect to error page: ${location}`);
        // Try to read the response body for more details
        const body = await response.text().catch(() => "");
        console.error(`[AUTH CALLBACK ERROR] response body (first 500): ${body.slice(0, 500)}`);
      }
    }

    if (isCallback && status === 500) {
      const body = await response.text().catch(() => "");
      console.error(`[AUTH 500] ${method} ${pathname} body=${body.slice(0, 1000)}`);
    }

    return response;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : "";
    console.error(`[AUTH THROW] ${method} ${pathname}`, msg, stack?.slice(0, 1000));
    return new Response(JSON.stringify({ error: msg, stack: stack?.slice(0, 500) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
