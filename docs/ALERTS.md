# Alerting (#21)

Error bursts + quota-wall spikes page the owner by email. Three parts:
threshold endpoint, scheduler, Cloudflare Email Service.

## How it works

1. `GET /api/admin/alerts-check` (Bearer `ALERT_TOKEN`) evaluates two
   rules over D1 and returns `{ triggered, alerts }`:
   - **error-burst:** ≥ 50 `error_log` rows in 15 min.
   - **quota-wall-spike:** ≥ 40% of downloads blocked in the last hour,
     minimum 20 downloads (tiny samples don't page).
   Each key cools down 1 hour (`alert_log`) — one page per incident.
   No token configured → 503 LOUD, never a silent dead endpoint.
2. `.github/workflows/alerts.yml` runs every 15 min (+ manual dispatch),
   calls the endpoint, and on `triggered: true` sends one email via the
   Cloudflare Email Sending REST API.

## One-time setup (owner, ~5 min)

1. **Onboard the sender domain** (skill: cloudflare-email-service):
   `npx wrangler email sending enable toolzum.com`
   (or Email → Email Sending in the Cloudflare dashboard).
2. **API token:** Cloudflare dashboard → My Profile → API Tokens →
   create with Email Sending `Send` permission. Save as repo secret
   `CLOUDFLARE_API_TOKEN` (already used by preview/migrate jobs).
3. **Alert token:** generate (`openssl rand -hex 32`) and store twice:
   - Pages env var `ALERT_TOKEN` (dashboard → toolzum → Settings →
     Environment variables → Production), AND
   - repo secret `ALERT_TOKEN` (Settings → Secrets → Actions).
4. **Recipient:** repo secret `ALERT_TO` (the email that gets paged).
5. **Test:** Actions → Alert Relay → Run workflow → check inbox.
   Without secrets every step skips loudly (nothing fails silently).

## On alert (runbook)

- **error-burst:** open `/admin/errors` (group by message), check the
  latest deploy + `/admin/analytics` error chart. If a release caused
  it: flip flags first (`/admin/flags`), then roll back per
  `docs/RELEASE.md`. Reply-all not needed — the hourly cooldown
  re-pages only while the burst persists.
- **quota-wall-spike:** open `/admin/analytics` → Most Blocked. A single
  tool spiking = quota misconfiguration or scraper. Check
  `download_event` fingerprints: one device = rotation farm (already
  429d by the velocity guard); broad = pricing/quota bug — fix forward.

## Tuning

Thresholds live at the top of `functions/api/admin/alerts-check.ts`
(`ERROR_BURST_LIMIT`, `BLOCKED_SHARE_*`). Raise them on noisy weeks,
lower them before launches. Change the cooldown (`COOLDOWN_SEC`) only
with a reason recorded here: ___________________________.
