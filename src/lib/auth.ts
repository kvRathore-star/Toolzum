import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import * as schema from "@/db/schema";

interface AuthEnv {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
}

const SCRYPT_PARAMS = { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 };

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password.normalize("NFKC"), salt, 64, SCRYPT_PARAMS);
  return `${salt}:${key.toString("hex")}`;
}

async function verifyPassword({
  hash,
  password,
}: {
  hash: string;
  password: string;
}): Promise<boolean> {
  const [saltHex, keyHex] = hash.split(":");
  if (!saltHex || !keyHex) return false;
  const derived = scryptSync(
    password.normalize("NFKC"),
    Buffer.from(saltHex, "hex"),
    64,
    SCRYPT_PARAMS
  );
  return timingSafeEqual(Buffer.from(keyHex, "hex"), derived);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const authCache = new WeakMap<AuthEnv, any>();

export function createAuth(env: AuthEnv) {
  const cached = authCache.get(env);
  if (cached) return cached;

  const instance = betterAuth({
    secret: env.BETTER_AUTH_SECRET || "fallback-dev-secret",
    baseURL: env.BETTER_AUTH_URL || "https://toolzum.com",
    basePath: "/api/auth",
    database: drizzleAdapter(
      drizzle(env.DB, { schema }),
      {
        provider: "sqlite",
        schema: {
          user: schema.users,
          session: schema.sessions,
          account: schema.accounts,
          verification: schema.verifications,
        },
      }
    ),
    emailAndPassword: {
      enabled: true,
      password: {
        hash: hashPassword,
        verify: verifyPassword,
      },
      sendResetPassword: async ({ user, url, token }: { user: { email: string }; url: string; token: string }) => {
        console.warn(`[PASSWORD RESET] User: ${user.email}, URL: ${url}, Token: ${token}`);
      },
      sendVerificationEmail: async ({ user, url, token }: { user: { email: string }; url: string; token: string }) => {
        console.warn(`[EMAIL VERIFY] User: ${user.email}, URL: ${url}, Token: ${token}`);
      },
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    user: {
      additionalFields: {
        credits: { type: "number", defaultValue: 100 },
        plan: { type: "string", defaultValue: "free" },
      },
    },
    advanced: {
      disableCSRF: true,
    },
  });

  authCache.set(env, instance);
  return instance;
}
