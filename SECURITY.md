# Security Policy

## Supported versions

Security fixes ship to `main` (which auto-deploys to production). All
versions currently served are the latest deploy — there are no LTS branches.

## Reporting a vulnerability

- **Email:** [contact@toolzum.com](mailto:contact@toolzum.com) with subject
  `[SECURITY]`. Encrypted reports welcome — ask for our PGP key in a first,
  content-free message if needed.
- **Do not** open public GitHub issues for vulnerabilities (they would
  advertise the flaw before a fix ships).
- We acknowledge within 72 hours and aim to ship a fix within 14 days for
  anything affecting user data or payments. Credit on request.

## Out of scope

Automated scanner dumps without demonstrated impact, social engineering of
team members, and denial-of-service volume tests against production.

## Secret hygiene (binding on every contributor)

1. **No secrets in git — ever.** API keys, tokens, and credentials live in
   Cloudflare Pages env / `.env.local` only (see `.env.example` for names).
2. The GSC service-account key pattern (`*- gsc json key.json`) is
   gitignored — never force-add it.
3. Screenshots and pastes in issues/PRs must redact keys, tokens, and
   personal emails.
4. GitHub secret scanning + push protection stay enabled on this repo.
5. If a secret ever lands in history: rotate it immediately, then purge
   with `git filter-repo` — deletion commits do not remove history.
