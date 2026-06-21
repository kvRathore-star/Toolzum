/// <reference types="@cloudflare/workers-types" />

declare global {
  namespace Cloudflare {
    interface Env {
      DB: D1Database;
      KV_CONFIG: KVNamespace;
      R2_STORE: R2Bucket;
      TURNSTILE_SECRET_KEY: string;
      RATE_LIMIT_KV: KVNamespace;
      PROXY_SECRET: string;
      JWT_SECRET: string;
      RAZORPAY_KEY_ID: string;
      RAZORPAY_KEY_SECRET: string;
      RAZORPAY_WEBHOOK_SECRET: string;
      DODO_API_KEY: string;
      DODO_WEBHOOK_SECRET: string;
    }
  }

  namespace NodeJS {
    interface ProcessEnv extends Cloudflare.Env {}
  }
}

export type {};

// Augment the Request/response types for Cloudflare-specific contexts
declare module "next/server" {
  interface NextRequest {
    cf?: IncomingRequestCfProperties;
  }
}