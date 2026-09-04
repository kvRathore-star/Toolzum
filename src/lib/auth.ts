import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { captcha } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/d1";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import * as schema from "@/db/schema";

interface AuthEnv {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

// Reduced params: N=4096, r=8, p=1 — still memory-hard but fits Workers CPU budget (~200-400ms)
// Default better-auth (N=16384, r=16) takes ~4.5s and exceeds CPU limit
const SCRYPT_PARAMS = { N: 4096, r: 8, p: 1, maxmem: 128 * 4096 * 8 * 2 };

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
    secret: (() => {
      if (!env.BETTER_AUTH_SECRET) {
        throw new Error("BETTER_AUTH_SECRET is not set. Authentication will not work without it.");
      }
      return env.BETTER_AUTH_SECRET;
    })(),
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
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        // Workaround for upstream bug: signInSocial constructs redirectURI as
        // ${baseURL}/callback/google, missing the /api/auth prefix.
        // Remove when https://github.com/better-auth/better-auth/issues/8033 is fixed.
        redirectURI: `${env.BETTER_AUTH_URL || "https://toolzum.com"}/api/auth/callback/google`,
      },
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google"],
      },
    },
    user: {
      additionalFields: {
        credits: { type: "number", defaultValue: 30 },
        plan: { type: "string", defaultValue: "free" },
        role: { type: "string", defaultValue: "user" },
        status: { type: "string", defaultValue: "active" },
      },
    },
    plugins: [
      ...(env.TURNSTILE_SECRET_KEY
        ? [
            captcha({
              provider: "cloudflare-turnstile",
              secretKey: env.TURNSTILE_SECRET_KEY,
            }),
          ]
        : []),
    ],
  });

  authCache.set(env, instance);
  return instance;
}
