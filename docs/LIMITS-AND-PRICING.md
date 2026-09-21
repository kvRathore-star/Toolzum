# Toolzum.com — Limits, Pricing & Rate Limits

> Single source of truth for all user-facing limits, credit costs, and rate limits.
> **If this file and the code disagree, the code wins — but update this file immediately.**

Last verified: 2026-09-12 (re-audited every tier against code; fixed signed-free server caps + badge copy + paywall 2GB)

---

## 1. Tool Overview

| Metric | Count | Canonical source |
|--------|-------|------------------|
| Total tools | 1,145 (1,063 registry + 82 SEO landing pages) | `src/registry/tools-client-index.ts` + `SEO_PERMUTATIONS` |
| Pro tools | 65 (all gated via `proSlugs`, all browsable) | `src/registry/tools-constants.ts` → `proSlugs` |
| Download-producing tools | 426 (auto-generated) | `src/lib/downloadProducingSlugs.ts` (regen: `npx tsx scripts/generate-download-slugs.ts`) |
| BulkToolShell wrappers | 20 tools | wrappers import from `src/components/tools/modules/utility/BulkToolShell.tsx` |
| Categories | 21 | `src/lib/categoryTheme.ts` |

> Counts verified Sep 12 2026 (`AGENTS.md` corrected same day — both agree:
> 1,063 registry + 82 SEO = 1,145; `ai-video-subtitler` stub removed, Pro 66→65).
> Slugs are NOT pasted here by design — the
> registry is the single source of truth; verify with:
> `node -e "const fs=require('fs');const s=fs.readFileSync('src/registry/tools-constants.ts','utf8');console.log(s.match(/export const proSlugs = \[(.*?)\];/s)[1].match(/\"[^\"]+\"/g).length)"`
>
> ### Plan labels (canonical — `src/lib/planTiers.ts`, Sep 12 2026)
>
> Stored (`user.plan`): only `free` \| `pro` (enforced by
> `/api/admin/change-plan`). Effective (all limit decisions): `anon` \|
> `signedin` \| `pro` via `resolvePlan(authenticated, stored)`. Unknown stored
> values fail closed to `signedin` outcomes (never pro). Endpoint responses
> carry the effective label (`/api/check-plan`, `/api/downloads/check`,
> `/api/account/credits`); the 503 path keeps `plan: null` = unknown state.

---

## 2. Download Quota

**Applies to:** 426 tools that save files through the quota gate — `downloadOrShare()` per-save, or one `gateBatchDownload()` call per batch (ZIP/batch downloaders). Single-save tools and batch tools alike; AI-credit tools are separate (§3).

### Free tools (non-Pro)

| Tier | Daily limit | Reset | Enforcement |
|------|-------------|-------|-------------|
| Anonymous | 3/day | Daily (midnight UTC) | Server-side (`download_usage` table) |
| Signed-in (free) | 5/day | Daily (midnight UTC) | Server-side |
| Pro | Unlimited | N/A | `getUserLimit()` returns `Infinity` |

### Pro tools

| Tier | Daily limit | Reset | Enforcement |
|------|-------------|-------|-------------|
| Anonymous | 0 (blocked) | — | Paywall blocks access entirely |
| Signed-in (free) | 2/day | Daily (midnight UTC) | Server-side (separate `pro:` fingerprint prefix) |
| Pro | Unlimited | N/A | `getUserLimit()` returns `Infinity` |

**Code:** `functions/api/downloads/check.ts:7-10`, `functions/api/downloads/record.ts:7-10`

```
getUserLimit(plan, isProTool):
  pro → Infinity
  signed-in + Pro tool → 2
  signed-in + free tool → 5
  anonymous + Pro tool → 0
  anonymous + free tool → 3
```

**Pro tool detection:** Client detects Pro tools from URL slug via `proSlugs` set in `tools-constants.ts`. Passes `isPro=1` query param (check) or `isPro: true` body field (record) to server. Server prefixes fingerprint with `pro:` to track Pro tool downloads separately.

**Analytics:** Every attempt logged to `download_event` table with `userType`, `toolSlug`, `outcome` (allowed/blocked_quota/blocked_pro_anon).

**Badge:** Shows on tool page for all 426 slugs via `DOWNLOAD_PRODUCING_SLUGS.has(slug)` in `ToolLayout.tsx`. Badge copy stays short (pill links to `/sign-in`); the full pitch (5/day + 10 credits) lives in the limit modal that fires at zero:
- Pro tool + anon: "Sign in to use Pro tools"
- Pro tool + signed: "N Pro downloads left — Upgrade for unlimited" / "Pro downloads used up today"
- Free tool + anon: "N remaining — sign in for more" / "0 remaining — sign in free"
- Free tool + signed: "N free downloads left today" / "Free downloads used up today"
- Pro user: hidden (unlimited)

**Limit modal** (`DownloadLimitModal.tsx`, fires on `toolzum:download-blocked` / `toolzum:plan-limit`): anon quota/file/batch blocks show the concrete free-account upside (5/day, 5 trial credits, 10 files/150MB, 2 Pro downloads/day) with CTA "Sign in free — unlock 5/day + 5 trial credits".

> ✅ **Per-batch accounting (Option C, Sep 12 2026):** one batch download =
> one quota unit, gated by a single `checkAndRecordDownload({ batchSize,
> fileSizeMB })` call (`gateBatchDownload()` in `freeUsageGuard.ts`) BEFORE
> any file saves. So signed free gets 5 batches/day on free tools (~50 files)
> and 2 batches/day on Pro tools (~20 files) — the `pro:` bucket is unchanged.
> Applies to `BulkToolShell` (covers 20 wrapper tools), `DocumentConverter`,
> `BatchImageEditor`, `BulkImageWatermark`, the three FFmpeg bulk video tools,
> `BulkPdfMerger`, and `ArchiveConverter`. Single-save tools were already gated
> via `downloadOrShare()`. User-facing copy keeps saying "downloads/day" (a batch
> save reads as one download action; the badge decrements per batch, so it's
> self-consistent) — "batch" lives in code comments and this doc only.
>
> **Gate coverage by surface (verified Sep 12 2026):**
>
> | Surface | Tools | Gate |
> |---------|-------|------|
> | `BulkToolShell` wrappers | 20 tools (bulk converters, compressors, mergers, extractors…) | Intake caps (1/10/500) + `gateBatchDownload` on Download All/Each |
> | `useBatchProgress` standalone | `BulkImageWatermark`, `BulkVideoSizeReducer`, `BulkVideoCompressor`, `BulkVideoSubtitleBurner`, `BulkPdfMerger` | `gateBatchDownload` (merger: on merged artifact) |
> | Single-shot batch tools | `BatchImageEditor` (gated pre-process), `DocumentConverter`, `ArchiveConverter`, `PdfWorkflowBuilder` | `gateBatchDownload` before save |
> | Badged single-save tools (Sep 12) | `BarcodeGenerator`, `AddTextToPhoto`, `BulkCsvExcelToJson`, `BulkMarkdownToPdfHtml`, `BulkSubtitleTimeShifter`, `IndianVoiceTranscriber`, `ItrFilingHelper`, `PdfInfo`, `CitationGenerator`, `LinkInBioBuilder` | Migrated to `downloadOrShare()` (now returns boolean — no success toast on block) |
> | All other saving tools | anything saving via `downloadOrShare()` | Per-save gate in `nativeShare.ts` |
> | AI-credit tools (no file output) | `CREDIT_COST_SLUGS` in `ToolLayout.tsx` (16 slugs) | Credit deduction, not download quota (badge warns per-use cost) |

---

## 3. AI Credits

**Applies to:** All tools using `/api/ai/generate` and `/api/ai/transcribe` (server-side Gemini API calls).

| Tier | Credits | Reset | Enforcement |
|------|---------|-------|-------------|
| Free (signed-in) | 5, one-time trial (never refilled) | Granted once at first AI use or signup | `user.credits` in D1 |
| Pro | 200/month | Monthly (auto-reset via `creditResetAt`) | `user.credits` in D1 |
| Project Pass (7-day) | 70 one-time + Pro treatment 7d | `passExpiresAt` (time-based, no cron) | `grantPass` + `effectivePlanForUser` |
| Anonymous | N/A (sign-in required) | — | 401 on AI routes |

> ✅ **FIXED Sep 12 2026 — reset race:** `generate.ts`/`transcribe.ts` read the
> balance before the monthly reset, then enforced on the stale row — users
> whose window renewed mid-request got a wrongful 403. Reset now returns the
> fresh balance.

### Per-Task Credit Costs

| Task | Credits | Actual API cost | Mechanism |
|------|---------|-----------------|-----------|
| Text generation (AI Paraphraser, Translator, etc.) | 1 | ~$0.0002 | Gemini 1.5 Flash via `/api/ai/generate` |
| Transcription (Speech-to-Text) | 1/min, ceil (`CREDITS_PER_MINUTE`, `transcriptionPricing.ts`) | ~$0.003/min non-English, ~$0.0007/min English (Groq) | mini-transcribe / Groq Turbo via `/api/ai/transcribe`, 30-min + 25MB caps |
| AI Image Generation (Pollinations engine) | 0 | $0 | Pollinations.ai (free external API, client-side) |
| AI Image Generation (Gemini engine) | 5 (`IMAGE_GENERATION_CREDITS` in `generate-image.ts`) | ~$0.045/image | Gemini 3.1 Flash Image via `/api/ai/generate-image` — **Pro-only** (anon 401, signed-free 403; Pollinations stays free for all) |

> Costs follow the *endpoint called*, not the tool name: `audio/video-to-text-transcription`
> clean up pasted dumps via `/api/ai/generate` (1 credit) — only true audio
> uploads (`podcast`, `indian-voice`) hit `/api/ai/transcribe` (1/min). Enforced
> by `credit-badge-coverage.test.ts`, which also forbids duplicate badge keys.
| Gemini Watermark Remover | 0 | $0 | Client-side alpha-blending (no API) |
| Other image/video/audio tools | 0 | $0 | Client-side (Canvas/WASM/FFmpeg) |

**Cost at 5 free trial credits (one-time, never refilled):**
- ~5 text gen calls, OR
- ~1 Gemini image (5 credits), OR
- ~5 transcription minutes (1/min), OR
- Unlimited Pollinations image generation (free), OR
- Unlimited watermark removal (free)

**Cost at 200 Pro credits/month:**
- ~200 text gen calls, OR
- ~200 transcription minutes (~3.3 hours), OR
- ~40 Gemini images (5 credits each, Pro-only engine), OR
- Unlimited Pollinations image generation (free), OR
- Unlimited watermark removal (free), OR
- Mix of all

**Worst-case cost per free user:** one-time ~$0.045 (5-image trial burn) — then zero forever. No monthly liability.
**Worst-case cost per Pro user:** ~$1.80/month (40 images × $0.045) or ~$0.60 (200 non-English min) vs $9.99 / ₹299 revenue — sustainable.
**Worst-case cost per Pass user:** ~$0.63 (14 images × $0.045) or ~$0.21 (70 min × $0.003) vs $3.99 / ₹99 — one-shot, repurchase to farm.

> $/credit ceiling note (for the next margin audit): image generation
> currently sets it at ~$0.009/credit ($0.045 ÷ 5), above transcription
> ($0.003) and text ($0.0002). If image costs move again, this is the row
> that moves first.

> ✅ **REPRICED Sep 17 2026:** transcription costs 20× text generation
> (`TRANSCRIPTION_CREDITS = 20`); Free 30→10, Pro 300→200, Pass 70/7d
> (`grantPass`, `resolvePlanWithPass` — resets always use the stored
> plan so Pass top-ups never renew to Pro allowances).
>
> ✅ **REPRICED AGAIN Sep 20 2026 (deliberate reversal):** transcription is
> now 1 credit/min (`CREDITS_PER_MINUTE`, shared `transcriptionPricing.ts`
> used by backend charges, UI previews, and ToolLayout per-minute badges),
> 30-min + 25MB caps, gpt-4o-mini-transcribe (~$0.003/min) for non-English
> and Groq Whisper Turbo (~$0.0007/min) for English, with OpenAI fallback.
> Free plans CAN transcribe short clips now (10 min/mo) — the old Pro-only
> lock is gone on purpose: real cost is trivial and it funnels upgrades
> honestly.

> ✅ **RESOLVED Sep 12 2026, repriced Sep 17 2026, repriced again Sep 20 2026:**
> transcription is now 1 credit/min (`CREDITS_PER_MINUTE` in
> `src/lib/transcriptionPricing.ts`, charged in
> `functions/api/ai/transcribe.ts`, previewed in-tool, badged per-minute
> in `ToolLayout.tsx`).

---

## 4. Rate Limits (API)

### AI Text Generation (`/api/ai/generate`)

| Tier | Rate limit | Model |
|------|------------|-------|
| Signed-in (free) | 2 req/min | Gemini 1.5 Flash |
| Pro | 5 req/min | Gemini 1.5 Flash |
| Anonymous | Blocked (401) | — |

### Transcription (`/api/ai/transcribe`)

| Tier | Rate limit | Model |
|------|------------|-------|
| Signed-in (free) | 2 req/min | Gemini 1.5 Flash |
| Pro | 5 req/min | Gemini 1.5 Flash |
| Anonymous | Blocked (401) | — |

### Download Record (`/api/downloads/record`)

Rate limited at 10 req/min per IP. Daily quota enforced separately.

**Notes:**
- Transcription uploads are capped at 50MB by the endpoint itself (`MAX_UPLOAD_BYTES` in `transcribe.ts`) regardless of plan — a signed-in user's 150MB file allowance does not apply to `/api/ai/transcribe`.
- Daily download buckets use `YYYY-M-D` server dates (workerd runs UTC → effectively midnight-UTC reset). The legacy client mirror (`freeUsageGuard`) resets on browser-local midnight — server is authoritative on conflict.
- Plan labels differ slightly per endpoint (`check-plan` returns `signedin` for authenticated free users; download/credit endpoints use `free`) but resolve to identical free-tier outcomes everywhere.

---

## 5. File Size Limits

**Code:** `functions/api/check-plan.ts:7-11`

| Tier | Max file size | Max batch size | Threads |
|------|--------------|----------------|---------|
| Anonymous/free | 30 MB | 1 file | 1 |
| Signed-in | 150 MB | 10 files | 1 |
| Pro | 2 GB | 500 files | 6 |

### Per-Category Smart Limits (`smartMax()`)

| Category | Free | Signed-in |
|----------|------|-----------|
| Video | 30 MB | 150 MB |
| PDF | 15 MB | 40 MB |
| Audio | 20 MB | 50 MB |
| Default (image, etc.) | 10 MB | 20 MB |

**Note:** Pro always uses `check-plan.ts` limits (2 GB), not `smartMax()`.

> ✅ **FIXED Sep 12 2026 — signed-free server caps:** the DB default is
> `plan='free'` for every new account, so `check-plan.ts` returned the
> 30MB/1-file anon caps to all real signed-in users — who were then blocked
> at download after the uploader (`smartMax`) allowed up to 150MB. Now an
> authenticated user with stored plan `free` (or missing row) resolves to the
> `signedin` caps (150MB/10 files). Only stored `pro` → pro caps; unknown
> stored values fall back to free caps. Contract locked in
> `src/__tests__/api/check-plan.test.ts`.

---

## 6. Gemini Watermark Remover

Pure client-side alpha-blending (no API calls, zero cost). No credit charge, no monthly cap.

**Split access model:**
- **Single mode** → Free tool (everyone can use)
- **Batch mode** → Pro-only (upgrade required)

### Single Mode (free tool)

| Tier | Downloads/day |
|------|---------------|
| Anonymous | 3 |
| Signed-in (free) | 5 |
| Pro | Unlimited |

### Batch Mode (Pro-only)

| Tier | Access |
|------|--------|
| Anonymous | Blocked |
| Signed-in (free) | Blocked |
| Pro | Unlimited |

**Code:** `src/components/tools/modules/image/GeminiWatermarkRemover.tsx`

**Batch gating:** Button shows lock icon for non-Pro users. Clicking shows toast "Upgrade to Pro for batch processing". If somehow in batch mode, shows upgrade prompt instead of batch UI.

---

## 7. Pro Tools

**List:** `src/registry/tools-constants.ts` → `proSlugs` array (66 slugs: 55 produce file downloads, 11 are text-only/dashboards)

**Categories covered:** AI, Image (bulk), PDF (bulk), Audio (bulk), Video (bulk), Transcription, Developer, E-commerce, Privacy, Indian Utilities

**Enforcement (locked Sep 2026 — anon hard-lock, signed taste):** Pro pages are
hard-locked for anonymous visitors via `ToolPaywall` (`isLocked = isPro && anon`,
resolved only after the session settles to avoid lock-flash for signed users).
The lock screen leads with **Sign in** (free accounts get 2 Pro downloads/day),
Upgrade secondary. Signed-in free users open Pro tools with download limits
(2/day, separate `pro:` counter). The lock screen never appears for signed-in
users; its upgrade-first variant is the fallback for unknown plans only. Its
feature card advertises "Up to 2GB".

**Batch caps** are enforced client-side at drop time in `BulkToolShell.tsx` (guests 1, signed-in 10, Pro 500 — matches `check-plan.ts`); over-cap drops are truncated with a toast naming the upgrade path. `checkAndRecordDownload()` accepts a `batchSize` option but no caller currently sends it, so the server does not independently enforce batch size — batch is capped at intake, quota at download.

**Get Pro button:** Hidden for Pro users in header (desktop + mobile drawer).

**Note:** `unit-converter` and `gemini-watermark-remover` are NOT Pro tools. Unit converter is a free utility. Gemini watermark single mode is free; batch mode is gated inside the component.

---

## 8. User Tiers Summary

| Feature | Anonymous | Signed-in (free) | Pro ($9.99/mo, ₹299/mo) | Project Pass (7d) |
|---------|-----------|------------------|-----------------|-------------------|
| Client-side tools | Unlimited | Unlimited | Unlimited | Unlimited |
| Download quota (free tools) | 3/day | 5/day | Unlimited | Unlimited |
| Download quota (Pro tools) | Blocked | 2/day | Unlimited | Unlimited |
| AI credits | N/A | 5 trial, one-time | 200/month | 70 one-time |
| AI rate limit | Blocked | 2 req/min | 5 req/min | 5 req/min |
| Transcription rate limit | Blocked | 2 req/min | 5 req/min | 5 req/min |
| Max file size | 30 MB | 150 MB | 2 GB | 2 GB |
| Max batch size | 1 file | 10 files | 500 files | 500 files |
| Batch ZIP download | Single-file only | Single-file only (individual downloads) | ✓ Batch ZIP | ✓ Batch ZIP |
| Pro tools access | Locked at page (sign in for 2/day) | Full access (with limits) | Full access (unlimited) | Full access (7 days) |
| Gemini watermark single | 3/day | 5/day | Unlimited | Unlimited |
| Gemini watermark batch | Blocked | Blocked | Unlimited | Unlimited |

---

## 9. Regeneration Commands

| What | Command | When |
|------|---------|------|
| Download-producing slugs | `npx tsx scripts/generate-download-slugs.ts` | On every build (automated) |
| OG images | `npx tsx scripts/generate-og-images.ts` | On every build |
| Redirects | `node scripts/generate-redirects.js` | On every build |
| Site data | `npx tsx scripts/generate-site-data.ts` | On every build |

**Build chain:** `npm run build` runs all of the above before `next build`.

---

## 10. Known Gaps / TODO

- [x] Log AI-credit exhaustion events to analytics (shipped Sep 12 2026 — see below)
- [x] Normalize plan labels (shipped Sep 12 2026 — `src/lib/planTiers.ts`: stored `free|pro`, effective `anon|signedin|pro`)

### AI-credit analytics (`ai_credit_event`, Sep 12 2026)

Same pattern as `download_event`: every `/api/ai/*` call logs one row —
`{ userId, task: generate|transcribe, outcome: allowed|blocked_exhausted,
balance, allowance, createdAt }`. Table is lazy-created (`CREATE TABLE IF NOT
EXISTS` in `functions/api/ai/credit-events.ts`, same as `error-log.ts`), and
logging never fails the request. Watch query:

```sql
SELECT task, outcome, COUNT(*) FROM ai_credit_event
WHERE createdAt > unixepoch('now', '-30 days') GROUP BY task, outcome;
```

**Tuning triggers (revisit with real data, not gut calls):**
- Single-file saves and batch saves share ONE daily counter per user (`download_usage`
  by fingerprint+date — no separate bulk bucket). The steepest step in the tier
  ladder is anon→signed on free tools (3 files → 5 batches ≈ 50 files, ~17x).
  That's the conscious signup incentive; if data shows signed-free users routinely
  exhausting 5 batches/day without converting, revisit the 50-file ceiling (batch
  cap or batch quota) — not the Pro side.
- `download_event` already logs `toolSlug + userType + outcome`: watch
  `blocked_quota` rate by slug to see whether single-file casual users or batch
  power users hit the wall first before touching any numbers.
