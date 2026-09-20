import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { captcha, haveIBeenPwned } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/d1";
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import * as schema from "@/db/schema";
import { deleteUserAppData } from "@/lib/userErasure";
import { sendEmail } from "@/lib/email";

interface AuthEnv {
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
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
    // Session lifetimes made explicit (values equal better-auth v1
    // defaults — verified in create-context.mjs — so this changes no
    // behavior, it just stops the lifetimes being implicit tribal
    // knowledge). B3.5: revisit durations as a product decision, not code.
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days: absolute session lifetime
      updateAge: 60 * 60 * 24, // 1 day: rolling refresh window
      freshAge: 60 * 60 * 24, // 1 day: sensitive-action freshness
    },
    databaseHooks: {
      user: {
        create: {
          // Welcome email on every signup path (email+password, Google).
          // Never throws — a failed send must not break account creation.
          // Separate from the verification email: this one carries no link.
          after: async (user) => {
            try {
              const u = user as { email?: string; name?: string | null };
              if (!u?.email) return;
              const first = (u.name || "").split(" ")[0];
              await sendEmail(env, {
                to: u.email,
                subject: "Welcome to Toolzum!",
                text: [
                  `Hi${first ? " " + first : ""},`,
                  ``,
                  `Your Toolzum account is ready.`,
                  ``,
                  `Free plan includes 10 AI credits/month plus 1,000+ free tools that run entirely in your browser — nothing uploaded.`,
                  ``,
                  `Browse tools: https://toolzum.com/tools`,
                ].join("\n"),
              });
            } catch {
              // signup proceeds; welcome mail is best-effort
            }
          },
        },
        delete: {
          // #26 erasure cascade: D1 ignores FK cascades and better-auth
          // only removes rows it owns — without this, favorites, usage
          // history, payments, and AI-credit events orphan on self-delete.
          // Never throws; a failed cleanup must not break deletion.
          after: async (user) => {
            const userId = (user as { id?: string } | null)?.id;
            if (!userId) return;
            await deleteUserAppData(env.DB, userId);
          },
        },
      },
      session: {
        create: {
          // Stamp last login on every fresh session (all sign-in paths).
          // Never throws — a failed stamp must not break login.
          after: async (session) => {
            try {
              const userId = (session as { userId?: string }).userId;
              if (!userId) return;
              await env.DB.prepare(
                'UPDATE "user" SET lastLoginAt = unixepoch() WHERE id = ?'
              )
                .bind(userId)
                .run();
            } catch {
              // login proceeds; admin "Last Login" just stays stale
            }
          },
        },
      },
    },
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
      sendResetPassword: async ({ user, url }: { user: { email: string }; url: string; token: string }) => {
        await sendEmail(env, {
          to: user.email,
          subject: "Reset your Toolzum password",
          text: `You requested a password reset. Click the link to set a new password:\n\n${url}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`,
          html: `<p>You requested a password reset.</p><p><a href="${url}">Click here to reset your password</a></p><p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`,
        });
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
        await sendEmail(env, {
          to: user.email,
          subject: "Verify your Toolzum account",
          text: `Welcome to Toolzum! Verify your email address by clicking the link below:\n\n${url}\n\nThis link expires in 1 hour.`,
          html: `<p>Welcome to Toolzum!</p><p><a href="${url}">Click here to verify your email</a></p><p>This link expires in 1 hour.</p>`,
        });
      },
      expiresIn: 3600,
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
        // Email verification now exists (Cloudflare Email Sending via
        // emailVerification.sendVerificationEmail), but a local credential
        // row may still be unverified when the user links Google. Google
        // as a trusted provider already proves email ownership — requiring
        // local verification would permanently block Google login for
        // every email-signup user with account_not_linked. Verified 1.7.2
        // source: requireLocalEmailVerified defaults true and rejects
        // the link.
        requireLocalEmailVerified: false,
      },
    },
    onAPIError: {
      // Friendly branded error page instead of better-auth's default.
      errorURL: `${env.BETTER_AUTH_URL || "https://toolzum.com"}/auth-error`,
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
      // Breached-password rejection (k-anonymity: only a 5-char hash
      // prefix leaves the server — no password material, ever).
      haveIBeenPwned(),
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
