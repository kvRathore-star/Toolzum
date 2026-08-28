export const onRequest: PagesFunction = async (context) => {
  const envKeys = Object.keys(context.env);
  const dbBinding = context.env.DB ? "exists" : "missing";
  const secret = context.env.BETTER_AUTH_SECRET ? "set" : "missing";

  return new Response(JSON.stringify({
    envKeys,
    dbBinding,
    secret,
  }), {
    headers: { "Content-Type": "application/json" },
  });
};
