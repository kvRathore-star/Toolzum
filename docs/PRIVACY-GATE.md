# Privacy Ship-Gate (#51)

Formalizes the ad-hoc review that produced the #26/#44 findings. Run this
checklist before shipping any feature that touches user data, analytics,
accounts, or third-party services. The automated half lives in
`src/__tests__/privacy-gate.test.ts` (runs in CI) — this doc is the human
half the test cannot do.

## 1. Data flow — where does user content go?

- [ ] Local-only? Confirm no `fetch` of file bytes / prompts leaves the browser.
- [ ] Server-proxied (AI/cloud)? The tool page must carry the cloud/AI marking,
      and `privacy-policy` §2 + §3 must already describe the path
      (browser → our server → provider). No silent new proxies.
- [ ] New request fields? If an endpoint accepts new user-supplied fields,
      confirm none are persisted beyond their purpose (see §4).

## 2. Third parties — who else sees it?

- [ ] New CDN / API / model origin? Add it to `public/_headers` CSP
      (connect-src/script-src/img-src as appropriate) AND to the
      subprocessor list in `privacy-policy` §5.
- [ ] New cookies or storage? Disclose in `cookies` §3/§5
      (essential vs consent-gated) and in `privacy-policy` §4.
- [ ] Analytics provider change? Update `cookies` §4, the FAQ privacy
      answer, and the GDPR transfer note (`privacy-policy` §8).

## 3. Retention — how long does it live?

- [ ] New table with timestamps? Add it to `PURGE_TARGETS` in
      `functions/api/_retention.ts` and call `maybePurgeOldRows` from
      every writer (the gate test enforces both).
- [ ] New userId-keyed table? Add it to `src/lib/userErasure.ts` AND
      `functions/api/admin/delete-user.ts` (D1 ignores FK cascades —
      these lists ARE the cascade). Migration-SQL-only tables go in the
      test's `EXTRA_USER_TABLES` too.
- [ ] Retention promise changed? The `privacy-policy` retention line must
      match the enforced number, not the intended one.

## 4. Consent — does Decline still mean no?

- [ ] New telemetry sender (client `fetch` to `/api/*` analytics, new
      provider `init`)? Gate it on `mayCollectTelemetry()` from
      `@/lib/consent` — the gate test scans for ungated senders.
- [ ] New localStorage key for tracking/quota? Never reuse the consent
      key name; import `CONSENT_KEY` from `@/lib/consent`, don't retype it.
- [ ] Banner copy still true? If collection behavior changed, the banner
      text and `cookies` §6 must say what Decline actually disables.

## 5. Erasure — can the user leave?

- [ ] Self-service delete still reaches the new data? Covered by §3's
      erasure lists; verify with the danger-zone flow, not just the admin
      endpoint.
- [ ] Audit/support rows with email/userId? Either purge them or record
      the legitimate-interest basis here: ___________________________.

## Sign-off

Reviewer: ________________  Date: __________  Result: ship / fix-first
Notes: ______________________________________________________________
