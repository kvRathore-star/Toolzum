# Toolzum.com — Limits, Pricing & Rate Limits

> Single source of truth for all user-facing limits, credit costs, and rate limits.
> **If this file and the code disagree, the code wins — but update this file immediately.**

Last verified: 2026-09-04

---

## 1. Tool Overview

| Metric | Count |
|--------|-------|
| Total tools | 1,046 |
| Pro tools | 63 (gated by `proSlugs` in `tools-constants.ts`) |
| Download-producing tools | 408 (auto-generated in `downloadProducingSlugs.ts`) |
| Categories | 21 |

---

## 2. Download Quota (Client-Side Tools)

**Applies to:** 408 tools that call `downloadOrShare()` — image compressors, PDF tools, video converters, audio tools, etc.

| Tier | Daily limit | Reset | Enforcement |
|------|-------------|-------|-------------|
| Anonymous | 3/day | Rolling 24h | Server-side (`download_usage` table) |
| Signed-in (free) | 10/day | Rolling 24h | Server-side |
| Pro | Unlimited | N/A | `getUserLimit()` returns `Infinity` |

**Code:** `functions/api/downloads/record.ts:5-8`

```
getUserLimit(plan):
  pro → Infinity
  signed-in → 10
  anonymous → 3
```

**Analytics:** Every attempt logged to `download_event` table with `userType`, `toolSlug`, `outcome` (allowed/blocked_quota).

**Badge:** Shows on tool page for all 408 slugs via `DOWNLOAD_PRODUCING_SLUGS.has(slug)` in `ToolLayout.tsx:220`. Hidden when `hideDownloadQuota={true}` (currently only `gemini-watermark-remover`).

---

## 3. AI Credits

**Applies to:** All tools using `/api/ai/generate` and `/api/ai/transcribe` (server-side Gemini API calls).

| Tier | Credits | Reset | Enforcement |
|------|---------|-------|-------------|
| Free (signed-in) | 30/month | Monthly (proposed) | `user.credits` in D1 |
| Pro | 300/month | Monthly (proposed) | `user.credits` in D1 |
| Anonymous | N/A (sign-in required) | — | 401 on AI routes |

**Note:** Current code has 10 credits total with no reset. Monthly renewal is proposed but not yet implemented.

### Per-Task Credit Costs

| Task | Credits | Actual API cost | Mechanism |
|------|---------|-----------------|-----------|
| Text generation | 1 | ~$0.0002 | Gemini 1.5 Flash via `/api/ai/generate` |
| Image generation | 5 | $0 | Pollinations.ai (free external API) |
| Transcription | 10 | ~$0.19/25min | Gemini 1.5 Flash via `/api/ai/transcribe` |
| Gemini watermark remover | 0 | $0 | Client-side alpha-blending (no API) |
| Other image tools | 0 | $0 | Client-side (Canvas/WASM/FFmpeg) |

**Cost at 30 free credits/month:**
- ~30 text gen calls, OR
- ~3 transcription sessions (25 min each), OR
- ~6 image gen requests, OR
- ~3 watermark removals, OR
- Mix of all

**Cost at 300 Pro credits/month:**
- ~300 text gen calls, OR
- ~30 transcription sessions, OR
- ~60 image gen requests, OR
- ~30 watermark removals, OR
- Mix of all

**Worst-case cost per free user:** ~$0.57/month (3 transcription sessions × $0.19)

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

No explicit rate limit — relies on daily quota enforcement.

---

## 5. File Size Limits

**Code:** `functions/api/check-plan.ts:5-8`

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

| Tier | Limit |
|------|-------|
| All users | Unlimited |

**Code:** `src/components/tools/modules/image/GeminiWatermarkRemover.tsx`

**Previous system (removed):** localStorage monthly cap (10/month) — bypassable via storage clear, no analytics. Removed because tool costs $0 to run and the cap was never enforceable.

**Download quota:** Shows daily badge like other image tools (408 tool set).

---

## 7. Pro Tools

**List:** `src/registry/tools-constants.ts` → `proSlugs` array (63 slugs)

**Categories covered:** AI, Image (bulk), PDF (bulk), Audio (bulk), Video (bulk), Transcription, Developer, E-commerce, Privacy, Indian Utilities

**Enforcement:** `isPro` flag checked at tool page render; Pro users identified via `session.user.plan === "pro"`.

**Get Pro button:** Hidden for Pro users in header (desktop + mobile drawer).

---

## 8. User Tiers Summary

| Feature | Anonymous | Signed-in (free) | Pro ($14.99/mo) |
|---------|-----------|------------------|-----------------|
| Client-side tools | Unlimited | Unlimited | Unlimited |
| Download quota | 3/day | 10/day | Unlimited |
| AI credits | N/A | 30/month | 300/month |
| AI rate limit | Blocked | 2 req/min | 5 req/min |
| Transcription rate limit | Blocked | 2 req/min | 5 req/min |
| Max file size | 30 MB | 150 MB | 2 GB |
| Max batch size | 1 file | 10 files | 500 files |
| Pro tools | Blocked | Blocked | Full access |
| Gemini watermark remover | Unlimited | Unlimited | Unlimited |

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

- [ ] Credit monthly renewal not yet implemented (currently 10 total, no reset)
- [ ] AI rate limits not yet updated to 2/5 split (currently 5 for all signed-in)
- [ ] Transcription rate limits not yet updated to 2/5 split (currently 3 for all)
- [ ] Log AI-credit exhaustion events to analytics (same pattern as download-event)
- [ ] Remove `hideDownloadQuota={false}` prop entirely from page.tsx (no longer needed)
