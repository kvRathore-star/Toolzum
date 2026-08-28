import { createAuth } from "../../../src/lib/auth";

export const onRequest: PagesFunction<{ DB: D1Database; GOOGLE_CLIENT_ID: string; GOOGLE_CLIENT_SECRET: string }> = async (context) => {
  const auth = createAuth(context.env);
  return auth.handler(context.request);
};
