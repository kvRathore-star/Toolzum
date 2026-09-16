# Abuse Layers — fingerprint vs IP (#37 review)

Four identity layers, weakest first. Each stops what the stronger ones
cannot, and each fails where the next one holds.

## 1. Browser fingerprint hash (anonymous convenience)

- **What:** `th_fp` (UA + screen + language + timezone hash), sent as
  `x-download-fingerprint`, keys the 3/day anonymous download quota.
- **Stops:** casual overuse without an account.
- **Fails:** self-reported — rotate the hash, reset the quota. This is
  accepted (friction-free trial matters more), NOT relied upon.
- **Backstop:** `checkAnonDlVelocity` caps total download attempts per
  IP per day (500, `functions/api/_abuse.ts`). Farm-scale only.

## 2. IP address (rate limiting + velocity)

- **What:** `cf-connecting-ip`, keys per-minute rate limits
  (`rate-limit.ts`) and the #37 velocity guards (300 AI calls/IP/hour,
  500 anon download attempts/IP/day).
- **Stops:** single-source floods, credential-stuffing scale, quota farms.
- **Fails:** carrier-grade NAT shares IPs widely (large Indian mobile
  base) — thresholds must stay farm-scale or cafés get 429s. IPs appear
  ONLY inside ephemeral `prefix:<ip>` analytics_event rows, swept by the
  90-day purge like everything else (see Privacy Policy).
- **Fixed Sep 16 2026:** abuse logging was dead — the INSERT bound 4
  values into 5 columns and `.catch` swallowed it. Now shared
  `logAbuse()` in `_abuse.ts`, used by the API middleware.

## 3. Account + credits (strongest identity)

- **What:** HMAC-signed sessions; AI costs credits (30 free / 300 pro
  per month); per-user per-minute AI budgets (free 2, pro 5).
- **Stops:** per-actor damage is credit-bounded; mass accounts cost
  CAPTCHA-solving (Turnstile) or Google accounts each.
- **Fails:** distributed low-and-slow across many accounts — covered by
  the layer-2 IP velocity guard, which sees across accounts.

## 4. Humanity at creation (Turnstile / Google)

- **What:** Cloudflare Turnstile on email auth; Google OAuth otherwise.
- **Stops:** bulk fake-account creation, the precursor to AI budget drain.
- **Fails:** CAPTCHA farms; accepted residual, bounded by layers 2–3.

## Threshold table

| Guard | Window | Limit | On exceed |
|---|---|---|---|
| Per-user AI rate | 1 min | 2 free / 5 pro | 429 + Retry-After |
| AI IP velocity | 1 hour | 300 calls | 429 1h + abuse row |
| Anon download attempts per IP | 1 day | 500 | 429 1h + abuse row |
| Generic endpoint rate | 1 min | 10–60 by endpoint | 429 + Retry-After |
| AI kill-switch (`ai_generation`) | — | manual | 503, pre-spend |

## SQLite quirks found during review

- `TEXT PRIMARY KEY` columns accept NULLs in SQLite (unlike Postgres).
  `analytics_event.id` relies on this for cookieless inserts. Do not
  "fix" with NOT NULL without backfilling a migration.
- `download_usage.id` is TEXT in migration 0000 but autoincrement
  INTEGER in `schema.ts` — inserts omit it and ride the same NULL
  quirk. A future migration should reconcile the two (out of scope:
  applied history + working writes).
