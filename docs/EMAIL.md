# Email system — send, receive, and reply as contact@

Everything Toolzum sends and receives by email. Last verified **Oct 1 2026**
(Resend domain verified live + DNS + Email Routing rules checked).

## What ships

Every message is rendered by `src/lib/emailTemplate.ts` (`renderEmail`) and
sent through `src/lib/email.ts` (`sendEmail`), which tries two transports:

1. **Resend (primary)** — free tier, **3,000 emails/month, 100/day, no card**.
   Domain `toolzum.com` verified in Resend (Oct 1 2026, region
   `ap-northeast-1`/Tokyo) with **DKIM-only auth** at
   `resend._domainkey.toolzum.com`. Chosen because Cloudflare Email Sending
   on the Workers Free plan can only reach *verified destination*
   addresses — Resend's REST API reaches arbitrary recipients.
   ⚠️ Resend does **not** use an SPF include (`spf.resend.com` has no TXT
   record — adding it would cause SPF permerror; DMARC passes via DKIM).
2. **Cloudflare Email Sending (fallback)** — used when Resend is missing or
   a send fails; still correct for the owner's verified relay address.

One shell for all 14 emails:

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
verifying when a new email type is added (the *domain* is verified once,
in Resend's dashboard).

## Call sites (all 14)

| Email | Where |
|---|---|
| Welcome, verify, password reset | `src/lib/auth.ts` |
| Contact relay + sender acknowledgment | `functions/api/contact.ts` |
| Credit pack, 7-day pass, Pro receipt, cancellation, failed payment | `functions/api/payments/webhook.ts` |
| Admin temporary password | `functions/api/admin/reset-password.ts` |
| Waitlist launch broadcast | `functions/api/admin/notify-broadcast.ts` |
| Sitemap crawl complete | `functions/api/sitemap-crawl.ts` |
| Owner reply / compose (admin dashboard) | `functions/api/admin/reply.ts` |

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
3. **No transport configured** (no `RESEND_API_KEY` and no
   `CLOUDFLARE_API_TOKEN`+`CLOUDFLARE_ACCOUNT_ID` pair) →
   `503 email_unconfigured` before either send — no acknowledgment goes
   out, no fake receipt.
4. **Inbox archive** — after the relay, the message is stored in
   `contact_messages` (migration `0028`; best-effort insert — a D1 hiccup
   never fails the form) and shows up in the admin **Inbox**
   (`/admin/inbox` → `GET`/`PATCH /api/admin/messages`): read, reply, and
   archive from one screen. The Gmail relay keeps flowing as before; the
   archive is a second copy, deliberately **not** retention-purged (it's
   correspondence, mirrors the owner's Gmail, no telemetry).

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

Gmail relays through **Resend's SMTP** (`smtp.resend.com`), which signs
DKIM/SPF for `toolzum.com` — the same identity as every app send. Cloudflare
SMTP is deliberately *not* used: Email Sending on the Workers Free plan can
only reach verified destinations, so Gmail replies to arbitrary recipients
would be rejected at submission.

**One-time setup (~5 min):**

1. **SMTP password** — the same `RESEND_API_KEY` value (`re_…`, Resend
   dashboard → API Keys). A second dedicated key works too if you prefer
   rotation hygiene. No Cloudflare token is needed.
2. **Gmail → Settings ⚙️ → See all settings → Accounts and Import →
   "Send mail as" → Add another email address**
   - Name: `Toolzum` (or `Kirti (Toolzum)`)
   - Email: `contact@toolzum.com` → Next Step
   - SMTP Server: **`smtp.resend.com`**
   - Port: **465**, connection: **SSL**
   - Username: **`resend`** ← the literal string, not an email address
   - Password: the `RESEND_API_KEY` from step 1 → Add Account
3. **Verify** — Gmail emails a code to `contact@toolzum.com`; Email Routing
   forwards it to your Gmail; paste it back. (Changing the SMTP server on an
   already-added address can re-trigger this code — same forward path.)
4. **Make default** (optional) — Accounts and Import → "Make default", so
   every Reply uses it. Otherwise pick per-message from the **From** dropdown.

Outbound path: Gmail → `smtp.resend.com:465` → Resend signs DKIM/SPF for
`toolzum.com` → delivered under the same free tier as the app (counts
against 100/day; owner replies only — negligible).

## In-app reply — the Gmail-independent path

`/admin/reply` (sidebar: **Reply**) sends any message through the same
pipeline, so correspondence never depends on Gmail's send-as:

- **UI:** `src/app/admin/reply/page.tsx` — To / Subject / Message form,
  capability banner when email secrets are missing, success + error states.
  Deep-links from the Inbox (`?to=…&subject=…&messageId=…`) prefill the
  form and show a "marked replied on send" note.
- **Endpoint:** `POST /api/admin/reply` — admin session **or**
  `Bearer ALERT_TOKEN`, validates `{ to, subject, message, messageId? }`
  (email format, HTML stripped, 120/5000 char caps), rate limit **10/min
  per IP** (`admin-reply`), then `sendEmail(…, { fromName: "Toolzum Support" })`
  with `brandFromText` HTML — subject as headline plus an **Open Toolzum**
  CTA button and a "reply reaches the same inbox" note, so owner replies
  wear the same branded card as every other Toolzum email. A successful
  send with `messageId` flips that
  `contact_messages` row to `replied` (best-effort). `GET` returns
  `{ configured, from, fromName }` for the UI probe.
- **Inbox endpoint:** `GET /api/admin/messages` (`?status=` filter → list +
  `unread` count; missing table answers an empty inbox, never a 500) and
  `PATCH /api/admin/messages` (`{ id, status: new|replied|archived }`,
  404 on unknown id, 30/min) — same auth pair as reply. UI:
  `src/app/admin/inbox/page.tsx` (sidebar **Inbox**).
- Failures are honest: `503 email_unconfigured` (no transport secrets), `502
  email_failed` (the transport said no), `429` over the limit. Tests:
  `src/__tests__/api/admin-reply-api.test.ts` (14 cases),
  `src/__tests__/api/admin-messages.test.ts` (11 cases),
  `src/__tests__/api/contact-api.test.ts` (archive, 7 cases) +
  `src/__tests__/lib/email-send.test.ts` (transport routing, 15 cases).
- **Curl with the Bearer token:** `functions/api/_middleware.ts` rejects any
  mutation with no Origin/Referer (403) — add `-H 'Origin: https://toolzum.com'`.
  The browser UI sends Origin automatically; GET (the probe) is exempt.

## Caveats

- **Workers Free → Resend migration (Oct 1 2026):** the account has **no
  Workers Paid subscription** (dashboard check), and Cloudflare Email
  Sending on Workers Free can only send to *verified destination*
  addresses — arbitrary-recipient sends were being rejected. Resolved by
  moving all sends to **Resend's free tier** (primary) with Cloudflare kept
  as fallback; `RESEND_API_KEY` is the Pages secret that activates it.
  Until that secret is set, behavior is unchanged (Cloudflare-only: owner
  relay works, arbitrary-recipient sends fail best-effort — the on-page
  per-category thank-you in `src/app/contact/page.tsx` remains the
  guaranteed user-facing acknowledgment either way).
- **Jan 2027:** Google is retiring consumer-Gmail "Send mail as" for
  third-party addresses. A custom-domain SMTP relay may fall under that. If
  it goes away, the fallback is already live: **Reply** in the admin
  dashboard (`/admin/reply` → `POST /api/admin/reply` → `sendEmail`), the
  Gmail-independent path documented above.
- **Quotas:** app sends consume the Resend free tier (3,000/mo, 100/day —
  current volume is a few hundred/month, ample headroom). Gmail's send-as
  relay now shares that same Resend quota; volume there is trivial
  (owner replies only).
- **Failure visibility (Oct 1 2026):** every transport failure logs
  `[email] …` with HTTP status + response-body snippet to Pages function
  logs; auth's reset/verification sends **throw** when `sendEmail` returns
  false, so better-auth logs `Failed to run background task: …` instead of
  the send vanishing. Resend-verification endpoints return an honest error;
  forget-password keeps its deliberate generic message (anti-enumeration).
- **Outbound From is always `contact@toolzum.com`.** `support@toolzum.com`
  is receive-only (a routing rule, not a verified sender). To send *from* it
  later it needs its own identity in Resend — deliberately not done: one
  address, one promise, matches the privacy/terms/security pages.

## Inbound replies are tickets now (deployed Oct 5 2026 — live e2e proven)

**Original decision (Oct 4): Email Routing is a *copy* channel only —
parsing user replies back into the app was scoped out until volume
justified it.** Owner reversed this the same week: the mail pipeline
infra gaps got filled (code complete, deployed Oct 5, live e2e below).

### Before the bridge (what the Oct 4 audit documented)

```
User replies to the ACK (From: Toolzum Support <contact@toolzum.com>)
  → contact@toolzum.com → Email Routing → a COPY lands in owner's Gmail
  → nothing else. The app never sees it:
      ✗ contact_messages row does not gain the reply
      ✗ no thread, no attachment capture
      ✗ admin had to compose from scratch (/admin/reply)
```

### After deploy (toolzum-mail-bridge)

```
User replies to contact@ or support@
  → Email Routing rules (both → Worker toolzum-mail-bridge)
  → worker buffers message.raw, parses with postal-mime:
      · matches contact_messages by lower(email), newest non-archived
        (else auto-creates a ticket; replied → new re-alerts,
         archived stays archived)
      · strips quoted history (Gmail/Outlook markers)
      · attachments (≤10, ≤20 MB total) → MAIL_KV as c/{threadId}/{i}
      · appends contact_thread_messages row (direction 'in')
  → forwards the COPY to owner's Gmail (last step, independent
    try/catch per stage — a broken panel never eats the owner's mail)

Owner replies from /admin/inbox (inline composer, ≤5 files × 8 MB,
12 MB total — total is a Workers-memory guard: the base64 body exists
in ~3 copies at send time against the 128 MB ceiling)
  → POST /api/admin/reply (+ attachments) → Resend carries them
    (Cloudflare fallback refused when attachments present — no silent
    strip) → thread row 'out' + row flips to `replied` (the inbound
    flip is `replied → new` only; archived threads stay archived)
    → BCCs OWNER_COPY when the Pages secret is set — the owner's copy
      of every panel reply (Gmail's Sent folder no longer holds one)

Attachment downloads: /admin/inbox renders HMAC-signed URLs
  (src/lib/mailBridge.ts, shared ATTACH_SECRET) → worker serves
  GET /att/{key}?t=… from KV with constant-time signature check.
```

- Migration: `src/db/migrations/0029_contact_thread.sql` (applies manually
  via local wrangler; CI warn-and-continues until the GH token gets D1).
- Bindings: worker has D1 + `MAIL_KV` (`toolzum-mail-att`,
  `1608474e39a0449dbee6e2c1c3ff2ea8`); Pages functions gained `MAIL_KV`
  (root wrangler.toml) + `ATTACH_SECRET` Pages secret (same value as the
  worker's).
- Design notes: ticket matching is **email-only** — a reply from a
  different address than the submitter opens a *new* ticket (honest,
  no guessing); malformed-sender mail threads into one catch-all row
  (email ''). Stored attachments live in KV indefinitely — same retention
  class as the D1 message rows themselves. Owner replies sent directly
  from Gmail still bypass the panel thread (inherent to the copy channel).
- Tests: sign/verify round-trip + tamper cases, quoted-history fixtures,
  Resend attachment payload + no-silent-strip fallback refusal,
  attachment validation, owner-BCC pass-through.

### Evidence (Oct 4 2026, live)

- **Relay → owner: proven.** Gated send returned 200 and the owner
  received `[General Support] …` in Gmail.
- **Owner reply to that relay: bounced "no address exist" — expected,
  not a defect.** The test used a synthetic sender
  (`pipeline-audit@t.toolzum.com`) with no inbox; Reply-To worked as
  coded (`contact.ts:158`).
- **User → ack → reply → contact@: proven.** Real Gmail reply received
  via Email Routing 2026-10-04 16:48 UTC (contact@ rule temporarily
  pointed at a readable mailbox for observation, then restored; the
  owner's second app showed this leg failing there — not here).

### Evidence (Oct 5 2026, live — full pipeline)

- **Inbound with attachment: proven.** Email to contact@ (7877.jpg,
  374 KB) → bridge created ticket + thread row `direction 'in'`,
  attachment in KV at `c/{threadId}/0`, signed chip downloads in
  `/admin/inbox`; worker tail clean (only logs failures).
- **Forward to owner's Gmail: proven.** Copy of the same message
  arrived in `kirtivardhan1996@gmail.com`.
- **Panel reply: accepted then recipient-bounced — content policy,
  not a code defect.** Resend accepted (202, `out` row written after),
  sent 11:09, Gmail bounced: *"Blocked due to content: the message was
  rejected because it contained content that the recipient's server
  doesn't allow."* **Isolated: plain-text reply with no attachment was
  delivered afterward — the `Toolzum.app.zip` (executable-bearing
  archive) is the trigger.** Gmail hard-rejects archives containing
  executables from external/low-reputation senders rather than
  spam-foldering them. Recipient-side policy: ship app bundles as a
  Drive link, never as an email attachment. Benign-attachment outbound
  (e.g. a screenshot) still unverified — one panel reply with an image
  closes it.
- **Owner BCC: implemented** (`OWNER_COPY` Pages secret), ships with
  the same deploy as this entry.

## Testing end-to-end

> **Status (Oct 4, 2026, live):** Steps 1–2 PROVEN end-to-end — relay
> reached the owner; a real Gmail reply to the ack
> (`Re: We got your message`, 16:48 UTC) was received via Email Routing
> (verified by temporarily pointing the contact@ rule at a readable
> mailbox, then restoring). Step 3 (Gmail send-as DKIM) and step 4's live
> 503 probe remain untested. Synthetic-sender test earlier that day
> bounced as expected — Reply-To worked (`contact.ts:158`). See the
> inbound-thread section (bridge live Oct 5; inbound + forward proven,
> attachment-content bounce isolated in the Oct 5 evidence).

1. Submit `/contact` with an **outside** address (any real inbox) → two
   messages arrive: `[General Support] Your Name` (to you) and
   `We got your message` (to the sender), both branded, both From the right
   display name. Works for arbitrary recipients once `RESEND_API_KEY` is set.
2. Reply to the acknowledgment → lands in your Gmail (via `contact forwarding`).
3. Once Gmail send-as is configured, reply from Gmail → sender sees
   `Toolzum <contact@toolzum.com>`, and `openssl s_client`/mail-tester show
   `dkim=pass` + `spf=pass` for toolzum.com.
4. No secrets set → form must return 503 and show the direct-mail fallback
   (never a fake success).

## Secrets

| Name | Where | Needed for |
|---|---|---|
| `RESEND_API_KEY` | Pages env | **primary transport** — all outbound sends (Resend free tier) |
| `CLOUDFLARE_API_TOKEN` | Pages env | fallback transport (Email Sending: Edit) |
| `CLOUDFLARE_ACCOUNT_ID` | Pages env | fallback transport account scoping |
| `CONTACT_TO` | Pages env (optional) | relay target; defaults to the owner's Gmail |
| `ALERT_TOKEN` | Pages env + repo secret | alert workflow auth + `/api/admin/reply` bearer path (see `docs/ALERTS.md`) |
| `ATTACH_SECRET` | Pages env + worker env | HMAC signing of `/att/` download URLs (same value both sides) |
| `OWNER_COPY` | Pages env (optional) | BCC on every panel reply — owner's copy of what Gmail's Sent used to hold |
| Gmail send-as SMTP password | Gmail settings only | owner replies as contact@ (`smtp.resend.com` / user `resend` / key from step 1) |
