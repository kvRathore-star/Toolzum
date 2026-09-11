# Toolzum.com — Limits, Pricing & Rate Limits

> Single source of truth for all user-facing limits, credit costs, and rate limits.
> **If this file and the code disagree, the code wins — but update this file immediately.**

Last verified: 2026-09-11

---

## 1. Tool Overview

| Metric | Count |
|--------|-------|
| Total tools | 1,146 |
| Pro tools | 66 (gated by `proSlugs` in `tools-constants.ts`) |
| Download-producing tools | 425 (auto-generated in `downloadProducingSlugs.ts`) |
| Categories | 21 |

---

## 2. Download Quota

**Applies to:** 425 tools that call `downloadOrShare()` — image compressors, PDF tools, video converters, audio tools, etc.

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

**Badge:** Shows on tool page for all 425 slugs via `DOWNLOAD_PRODUCING_SLUGS.has(slug)` in `ToolLayout.tsx`. Badge text varies:
- Pro tool: "2 Pro downloads left — Upgrade for unlimited" / "Pro downloads used up today"
- Free tool: "3/5 free downloads left today" / "Free downloads used up today"
- Pro user: hidden (unlimited)

---

## 3. AI Credits

**Applies to:** All tools using `/api/ai/generate` and `/api/ai/transcribe` (server-side Gemini API calls).

| Tier | Credits | Reset | Enforcement |
|------|---------|-------|-------------|
| Free (signed-in) | 30/month | Monthly (auto-reset via `creditResetAt`) | `user.credits` in D1 |
| Pro | 300/month | Monthly (auto-reset via `creditResetAt`) | `user.credits` in D1 |
| Anonymous | N/A (sign-in required) | — | 401 on AI routes |

### Per-Task Credit Costs

| Task | Credits | Actual API cost | Mechanism |
|------|---------|-----------------|-----------|
| Text generation (AI Paraphraser, Translator, etc.) | 1 | ~$0.0002 | Gemini 1.5 Flash via `/api/ai/generate` |
| Transcription (Speech-to-Text) | 10 | ~$0.19/25min | Gemini 1.5 Flash via `/api/ai/transcribe` |
| AI Image Generation | 0 | $0 | Pollinations.ai (free external API, client-side) |
| Gemini Watermark Remover | 0 | $0 | Client-side alpha-blending (no API) |
| Other image/video/audio tools | 0 | $0 | Client-side (Canvas/WASM/FFmpeg) |

**Cost at 30 free credits/month:**
- ~30 text gen calls, OR
- ~3 transcription sessions (25 min each), OR
- Unlimited AI image generation (free), OR
- Unlimited watermark removal (free), OR
- Mix of all

**Cost at 300 Pro credits/month:**
- ~300 text gen calls, OR
- ~30 transcription sessions, OR
- Unlimited AI image generation (free), OR
- Unlimited watermark removal (free), OR
- Mix of all

**Worst-case cost per free user:** ~$0.57/month (3 transcriptions × $0.19).
**Worst-case cost per Pro user:** ~$5.70/month (30 × $0.19) vs $14.99 revenue.

> Decided 2026-09-11: per-task costs are text = 1, transcription = 10
> (`TRANSCRIPTION_CREDITS` in `transcribe.ts`, pinned by contract test).
> The code previously deducted 1 for everything since gating launched
> (Aug 28) — the doc's 10 was the intent that never shipped until now.

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

**Enforcement:** `isPro` flag checked at tool page render; anonymous users see full lock screen. Signed-in free users get full access with download limits (2/day for Pro tools).

**Get Pro button:** Hidden for Pro users in header (desktop + mobile drawer).

**Note:** `unit-converter` and `gemini-watermark-remover` are NOT Pro tools. Unit converter is a free utility. Gemini watermark single mode is free; batch mode is gated inside the component.

---

## 8. User Tiers Summary

| Feature | Anonymous | Signed-in (free) | Pro ($14.99/mo) |
|---------|-----------|------------------|-----------------|
| Client-side tools | Unlimited | Unlimited | Unlimited |
| Download quota (free tools) | 3/day | 5/day | Unlimited |
| Download quota (Pro tools) | Blocked | 2/day | Unlimited |
| AI credits | N/A | 30/month | 300/month |
| AI rate limit | Blocked | 2 req/min | 5 req/min |
| Transcription rate limit | Blocked | 2 req/min | 5 req/min |
| Max file size | 30 MB | 150 MB | 2 GB |
| Max batch size | 1 file | 10 files | 500 files |
| Pro tools access | Blocked | Full access (with limits) | Full access (unlimited) |
| Gemini watermark single | 3/day | 5/day | Unlimited |
| Gemini watermark batch | Blocked | Blocked | Unlimited |

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

- [ ] Log AI-credit exhaustion events to analytics (same pattern as download-event)
