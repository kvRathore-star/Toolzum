# Email system — send, receive, and reply as contact@

Everything Toolzum sends and receives by email. Last verified **Sep 30 2026**
(DNS + Email Routing rules + SMTP endpoint checked live).

## What ships

Every message is rendered by `src/lib/emailTemplate.ts` (`renderEmail`) and
sent through `src/lib/email.ts` (`sendEmail` → Cloudflare Email Sending REST
API). One shell for all 13 emails:

- dark card, indigo accent bar, **logo + wordmark in header AND footer**
- hidden inbox preheader, unique greeting per email type, detail rows
  (payment ID, temp password, crawl stats), bulletproof CTA button
- footer carries **both** `contact@toolzum.com` and `support@toolzum.com`
  plus an "Open Toolzum" link back to the app
- plain-text twin always sent alongside the HTML (email-client fallback)
- a caller that passes only `text` is **auto-branded** by `brandFromText`
  (subject → headline, blocks → paragraphs, bare URLs → links), so a future
  email cannot ship unbranded

### Sender identity

| Emails | From display name | Address |
|---|---|---|
| Credit pack, 7-day pass, Pro receipt, cancellation, failed payment | `Toolzum Billing` | contact@toolzum.com |
| Password reset, admin temporary password | `Toolzum Security` | contact@toolzum.com |
| Contact-form acknowledgment to the sender | `Toolzum Support` | contact@toolzum.com |
| Relay of a contact/suggestion to the owner | `Toolzum Contact` | contact@toolzum.com |
| Welcome, verification, waitlist broadcast, sitemap notification | `Toolzum` | contact@toolzum.com |

**The address never changes — `contact@toolzum.com` is the single verified
sender.** Display name is per-message (`fromName`), so nothing new needs
verifying in Cloudflare when a new email type is added.

## Call sites (all 13)

| Email | Where |
|---|---|
| Welcome, verify, password reset | `src/lib/auth.ts` |
| Contact relay + sender acknowledgment | `functions/api/contact.ts` |
| Credit pack, 7-day pass, Pro receipt, cancellation, failed payment | `functions/api/payments/webhook.ts` |
| Admin temporary password | `functions/api/admin/reset-password.ts` |
| Waitlist launch broadcast | `functions/api/admin/notify-broadcast.ts` |
| Sitemap crawl complete | `functions/api/sitemap-crawl.ts` |

## Contact form: relay + auto-ack

`POST /api/contact` (rate limit 5/IP, honeypot, HTML-stripped input):

1. **Relay to owner** — From `Toolzum Contact <contact@toolzum.com>`,
   `Reply-To: <sender>` so Reply in Gmail reaches the user. This send gates
   the request: failure → `502 email_failed`, the form shows the
   direct-mail fallback. Never a fake success.
2. **Acknowledgment to the sender** — From `Toolzum Support <contact@toolzum.com>`,
   sent immediately after, per-category copy and heading:
   `suggestion` / `bug` / `licensing` / `api` / `general`
   (`CATEGORY_COPY` in `functions/api/contact.ts`).
   Best-effort: if it fails, the user's submission still succeeds.
3. **No `CLOUDFLARE_API_TOKEN`** → `503 email_unconfigured` before either
   send — no acknowledgment goes out, no fake receipt.

## Receiving (Email Routing — verified live)

MX: `route1/2/3.mx.cloudflare.net` (Cloudflare Email Routing), zone
`toolzum.com`. Account rules:

| Rule | Matcher | Action | Status |
|---|---|---|---|
| support forwarding | `support@toolzum.com` | forward → kirtivardhan1996@gmail.com | enabled |
| contact forwarding | `contact@toolzum.com` | forward → kirtivardhan1996@gmail.com | enabled |
| temp-inbox worker | `*@t.toolzum.com` | worker `toolzum-temp-inbox` | enabled |
| legacy | `contact@subscouter.com` | forward → Gmail | enabled |
| catch-all (1) | all | worker `subscouter-email-parser` | enabled (unmatched mail only) |
| catch-all (2) | all | drop | disabled |

Destination address Gmail is **verified** (2026-05-05). Both public addresses
reach the owner's inbox, so the footer mailto links are live.

Re-check anytime (read-only; token needs Email Routing read):

```bash
TOK=$(python3 -c "import re;print(re.search(r'oauth_token = \"([^\"]+)\"', open('/Users/<you>/Library/Preferences/.wrangler/config/default.toml').read()).group(1))")
curl -s -H "Authorization: Bearer $TOK" \
  "https://api.cloudflare.com/client/v4/accounts/<account_id>/email/routing/rules"
```

## Replying as contact@toolzum.com from Gmail

Cloudflare exposes SMTP submission, so Gmail relays through your own domain's
DKIM/SPF — no third-party relay, no alignment problems.

**One-time setup (~5 min):**

1. **Scoped API token** — Cloudflare → My Profile → API Tokens →
   Create Token → Custom → Account · **Email Sending: Edit** only.
   Copy it (it is the SMTP password). Do **not** reuse the Pages production
   secret `CLOUDFLARE_API_TOKEN`.
2. **Gmail → Settings ⚙️ → See all settings → Accounts and Import →
   "Send mail as" → Add another email address**
   - Name: `Toolzum` (or `Kirti (Toolzum)`)
   - Email: `contact@toolzum.com` → Next Step
   - SMTP Server: **`smtp.mx.cloudflare.net`**
   - Port: **465**, connection: **SSL**
   - Username: **`api_token`** ← the literal string, not an email address
   - Password: the token from step 1 → Add Account
3. **Verify** — Gmail emails a code to `contact@toolzum.com`; Email Routing
   forwards it to your Gmail; paste it back.
4. **Make default** (optional) — Accounts and Import → "Make default", so
   every Reply uses it. Otherwise pick per-message from the **From** dropdown.

Outbound path: Gmail → `smtp.mx.cloudflare.net:465` → Cloudflare signs
DKIM/SPF for `toolzum.com` → same pipeline as the app's sends.

## Caveats

- **Jan 2027:** Google is retiring consumer-Gmail "Send mail as" for
  third-party addresses. A custom-domain SMTP relay may fall under that. If
  it goes away, the future-proof fallback is replying from inside Toolzum
  (admin Reply button → existing `sendEmail`), not from Gmail. Not built yet.
- **Shared quota:** Gmail's relay and the app's API sends consume the same
  Email Sending quota. Volume here is trivial (receipts, acks, alerts).
- **Outbound From is always `contact@toolzum.com`.** `support@toolzum.com`
  is receive-only (a routing rule, not a verified sender). To send *from* it
  later, it needs its own verified sender in Email Sending — deliberately not
  done: one address, one promise, matches the privacy/terms/security pages.

## Testing end-to-end

1. Submit `/contact` with a real address → two messages arrive:
   `[General Support] Your Name` (to you) and `We got your message` (to the
   sender), both branded, both From the right display name.
2. Reply to the acknowledgment → lands in your Gmail (via `contact forwarding`).
3. Once Gmail send-as is configured, reply from Gmail → sender sees
   `Toolzum <contact@toolzum.com>`, and `openssl s_client`/mail-tester show
   `dkim=pass` + `spf=pass` for toolzum.com.
4. No secrets set → form must return 503 and show the direct-mail fallback
   (never a fake success).

## Secrets

| Name | Where | Needed for |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Pages env | all outbound sends (Email Sending: Edit) |
| `CLOUDFLARE_ACCOUNT_ID` | Pages env | send endpoint account scoping |
| `CONTACT_TO` | Pages env (optional) | relay target; defaults to the owner's Gmail |
| `ALERT_TOKEN` | Pages env + repo secret | alert workflow auth (see `docs/ALERTS.md`) |
| Gmail send-as token | Gmail settings only | owner replies as contact@ (step 1 above) |
