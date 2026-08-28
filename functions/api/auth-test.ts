import { createAuth } from "../../../src/lib/auth";

export const onRequest: PagesFunction = async (context) => {
  try {
    const auth = createAuth(context.env);
    // Try to call a simple internal method to test if auth is working
    const url = new URL(context.request.url);

    if (url.pathname.endsWith("/test-db")) {
      // Test D1 directly
      const result = await context.env.DB.prepare("SELECT count(*) as count FROM user").first();
      return new Response(JSON.stringify({ dbTest: result }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname.endsWith("/test-auth")) {
      // Test creating a session token
      try {
        const result = await (auth as any).api.signInEmail({
          body: { email: "test@test.com", password: "wrong" },
          headers: new Headers(),
        });
        return new Response(JSON.stringify({ authTest: result }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(JSON.stringify({
          authError: e instanceof Error ? e.message : String(e),
          stack: e instanceof Error ? e.stack : undefined,
        }), {
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ status: "ok", paths: ["/test-db", "/test-auth"] }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
