const REQUIRED_PUBLIC_ENV_VARS = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_CF_ANALYTICS_TOKEN",
] as const;

const OPTIONAL_PUBLIC_ENV_VARS = [
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "NEXT_PUBLIC_POSTHOG_KEY",
  "NEXT_PUBLIC_SENTRY_DSN",
] as const;

const REQUIRED_SERVER_ENV_VARS = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "DODO_API_KEY",
  "DODO_WEBHOOK_SECRET",
  "JWT_SECRET",
  "TURNSTILE_SECRET_KEY",
] as const;

type EnvResult = { ok: true } | { ok: false; missing: string[] };

export function validatePublicEnv(): EnvResult {
  const missing = REQUIRED_PUBLIC_ENV_VARS.filter(
    (name) => !process.env[name] || process.env[name] === "" || process.env[name] === "http://localhost:3000"
  );
  return missing.length > 0 ? { ok: false, missing } : { ok: true };
}

export function validateServerEnv(env: Record<string, string | undefined>): EnvResult {
  const missing = REQUIRED_SERVER_ENV_VARS.filter(
    (name) => !env[name] || env[name] === ""
  );
  return missing.length > 0 ? { ok: false, missing } : { ok: true };
}

export function getPublicEnvVar(name: string): string | undefined {
  return process.env[name];
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
