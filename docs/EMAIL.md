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

## Scope decision: inbound replies are NOT tickets (owner decision, Oct 2026)

**Decision: Email Routing is a *copy* channel only. The admin panel
(Inbox + Reply) is the system of record. Parsing user email replies back
into the app — "tickets" — is scoped out until contact volume justifies it.**

This came out of a live test on toolzum.com plus the owner's experience
running the same flow on a second app.

### What a user's reply actually does today

```
User replies to the ACK (From: Toolzum Support <contact@toolzum.com>)
  → contact@toolzum.com → Email Routing → a COPY lands in owner's Gmail
  → nothing else. The app never sees it:
      ✗ contact_messages row does not gain the reply
      ✗ status stays manual (new → replied → archived are owner-set)
      ✗ no thread, no new ticket, no attachment capture

Owner replies from Gmail (Reply-To: user on the relay)
  → goes DIRECTLY to the user, bypassing the app entirely.

Owner replies via /admin/reply
  → sends fresh through sendEmail and marks the row `replied`,
     but cannot see/quote the user's Gmail reply — compose-from-scratch.
```

### Evidence (Oct 4 2026, live)

- **Relay → owner: proven.** Gated send returned 200 and the owner
  received `[General Support] …` in Gmail.
- **Owner reply to that relay: bounced "no address exist" — expected,
  not a defect.** The test used a synthetic sender
  (`pipeline-audit@t.toolzum.com`) with no inbox; Reply-To worked as
  coded (`contact.ts:158`).
- **User → ack → reply → contact@: still UNTESTED live** (needs a real
  receiving inbox as the form sender). The owner's second app showed
  this leg never arriving there — hence copy-only posture here too
  until this repo proves otherwise.
- Attachments: the contact form is text-only (no file input, JSON body);
  admin/reply is text-only. Gmail-to-Gmail forwarding preserves
  attachments for the owner's eyes only — the app never ingests them.

### If/when inbound tickets get built (scope sketch)

1. Email Routing → Worker MIME parser (pattern already exists in the
   `toolzum-temp-inbox` worker): From/subject/body, strip quoted history,
   handle multipart + quoted-printable + UTF-8 subjects.
2. Thread match → attach to the originating `contact_messages` row
   (match on the submitter address + a thread key in the ack's
   References/subject); inbound flips status to `replied`.
3. Attachments → R2 with a size cap (or v1 ships explicitly
   "screenshots stay in Gmail" — a product call, not an oversight).
4. Conversation view in `/admin/inbox` (thread + inline reply).
5. Tests: MIME fixtures (multipart, encodings, long quoted threads) +
   one live round-trip with a real inbox before declaring it works.

## Testing end-to-end

> **Status (Oct 4, 2026, live):** Step 1 *relay leg* proven — owner
> received the relay in Gmail (gated send, HTTP 200). Everything below is
> untested except step 4's code path (503 branch exists; not probed this
> round). The ack leg, step 2, and step 3 all need a **real outside
> inbox** as the form sender — the first live test used a synthetic
> address, so the ack went to a nonexistent mailbox and the owner's reply
> to the relay correctly bounced. See the scope decision above.

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
| Gmail send-as SMTP password | Gmail settings only | owner replies as contact@ (`smtp.resend.com` / user `resend` / key from step 1) |
