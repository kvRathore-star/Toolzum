# Auth Review (#25)

## Passwords

- Client enforces min 8 (sign-up); server enforces better-auth default
  minimum independently — client checks are UX, never the gate.
- Hashing: scrypt N=4096/r=8/p=1 (reduced from better-auth defaults,
  which exceed Workers CPU). Memory-hard, fits budget (~200–400ms).
- No breach-corpus check (HaveIBeenPwned k-anonymity). Accepted:
  Turnstile + throttling bound online guessing; offline hashes never
  leave D1. Revisit if credential-stuffing rows appear in abuse logs.

## Brute force: two layers, different weaknesses

1. better-auth built-in: 100 req / 10s, **per-isolate memory** — near-useless
   at the edge (each request may land on a fresh isolate).
2. `_middleware` D1 throttle (this session): auth mutations capped at
   **30 per IP per 10 min**, read-only w.r.t. auth mechanics (no
   cookie/body/CSRF contact), fail-open on DB trouble. This is the
   layer that actually binds.

## Sessions

- Lifetimes explicit in `src/lib/auth.ts` (7d absolute, 1d rolling,
  1d freshness) — equal to better-auth defaults, written down so they
  stop being tribal knowledge.
- Revocation UI exists (per-session revoke + sign-out); admin can
  revoke any session; banned status enforced on every `/api/*` call.
- Residual: ban does not stop *login* (auth routes skip the banned
  check by design) and cannot stop *local tools* (static files need no
  server). Ban = no server data, not no product. Documented, accepted.

## Creation-time humanity

- Turnstile on email auth; Google OAuth otherwise. Mass fake accounts
  cost CAPTCHA-solving or Google accounts each — the economic floor
  under AI-credit farming (see ABUSE.md layer 4).

## Admin audit

Complete: all six mutating admin endpoints (role, credits, plan, ban,
sessions/revoke, password reset, user delete, flag set) write
`admin_audit_log` rows with actor + old/new values.

## Residuals (not this session)

- Login-attempt CAPTCHA escalation (Turnstile after N failures) —
  needs the failure signal plumbed out of better-auth; today's
  throttle + creation CAPTCHA cover the realistic paths.
- Banned-user login block — rejected: would couple ban state into
  auth internals for no gain (nothing server-side is reachable anyway).
- ~~Breach-corpus check~~ DONE Sep 17: `haveIBeenPwned()` wired
  (k-anonymity, no key, no password material leaves). Accepted coupling:
  HIBP range-API outage fails signups loudly (retryable) instead of
  silently accepting breached passwords. Verify live on preview with
  `password123`.
