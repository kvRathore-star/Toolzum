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

    // Log ALL callback and sign-in responses
    if (isCallback || isSignInSocial) {
      console.log(`[AUTH RESP] ${method} ${pathname} → ${status} location=${location}`);
    }

    // For callbacks: clone response to read body without consuming it
    if (isCallback) {
      const clone = response.clone();
      const body = await clone.text().catch(() => "");
      if (body.length > 0) {
        console.log(`[AUTH CALLBACK BODY] ${pathname} body=${body.slice(0, 2000)}`);
      }

      // If redirecting to error page, log the full error details
      if (status >= 300 && status < 400 && location) {
        try {
          const loc = new URL(location, url.origin);
          const error = loc.searchParams.get("error");
          const errorDescription = loc.searchParams.get("error_description");
          if (error) {
            console.error(`[AUTH CALLBACK ERROR] error=${error} description=${errorDescription}`);
          }
        } catch { /* ignore parse errors */ }
      }

      // If 500, log full body
      if (status === 500) {
        console.error(`[AUTH CALLBACK 500] ${pathname} body=${body.slice(0, 2000)}`);
      }
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
