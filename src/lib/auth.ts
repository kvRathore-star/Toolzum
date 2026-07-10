import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";
import { getRequiredEnv } from "./env";

export const auth = betterAuth({
  database: drizzleAdapter(
    // Note: process.env.DB is populated by Cloudflare Pages / OpenNext bindings
    drizzle(process.env.DB as unknown as D1Database, { schema }),
    {
      provider: "sqlite",
      schema,
    }
  ),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: getRequiredEnv("GOOGLE_CLIENT_ID"),
      clientSecret: getRequiredEnv("GOOGLE_CLIENT_SECRET"),
    },
  },
  user: {
    additionalFields: {
      credits: {
        type: "number",
        defaultValue: 100,
      },
      plan: {
        type: "string",
        defaultValue: "free",
      },
    },
  },
});
