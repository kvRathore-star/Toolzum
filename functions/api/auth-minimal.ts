export const onRequest: PagesFunction = async (context) => {
  try {
    // Test 1: Can we import better-auth?
    const { betterAuth } = await import("better-auth");
    const { drizzleAdapter } = await import("better-auth/adapters/drizzle");
    const { drizzle } = await import("drizzle-orm/d1");

    // Test 2: Can we create a drizzle instance?
    const db = drizzle(context.env.DB);

    // Test 3: Can we create an auth instance?
    const auth = betterAuth({
      secret: context.env.BETTER_AUTH_SECRET || "test",
      baseURL: "https://toolzum.com",
      basePath: "/api/auth",
      database: drizzleAdapter(db, {
        provider: "sqlite",
      }),
      emailAndPassword: {
        enabled: true,
      },
      advanced: {
        disableCSRF: true,
      },
    });

    // Test 4: Can we call signUpEmail?
    const result = await (auth as any).api.signUpEmail({
      body: {
        name: "Test",
        email: `test-${Date.now()}@example.com`,
        password: "TestPass123!",
      },
      headers: new Headers(),
    });

    return new Response(JSON.stringify({ success: true, result }), {
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
