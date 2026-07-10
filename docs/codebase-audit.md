# Toolzum Codebase Audit

> Comprehensive A-Z audit of the Toolzum codebase — 106 issues found (12 critical, 28 high, 39 medium, 27 low).

---

## 1. PERFORMANCE

| # | Issue | File | Line | Severity |
|---|-------|------|------|----------|
| P1 | **All images use `<img>` instead of `next/image`** — no automatic optimization, no responsive srcSet, no lazy loading via Next.js | ~36 files in `src/components/tools/modules/` | Various | **High** |
| P2 | **No lazy loading on many images** — some have `loading="lazy"` but several do not (e.g., VideoCompressor, BulkImageWatermark, BulkAppIconGenerator) | `BulkImageWatermark.tsx`, `VideoCompressor.tsx`, `BulkAppIconGenerator.tsx`, `EmailSignatureGenerator.tsx`, `LinkInBioBuilder.tsx` | Various | **Medium** |
| P3 | **`output: "export"` disables all server features** — ISR, SSR, API routes, middleware, and the PWA service worker registration endpoint are all unavailable | `next.config.ts:17` | 17 | **Critical** |
| P4 | **Service worker registration broken** — `@ducanh2912/next-pwa` generates `public/sw.js` but static export prevents registration; the code itself acknowledges this in a comment | `next.config.ts:19-23` | 19-23 | **High** |
| P5 | **Bundle Analyzer configured but not in build pipeline** — only runs with `ANALYZE=true` env variable, never checked in CI | `next.config.ts:26-28` | 26-28 | **Low** |
| P6 | **Geist + Geist_Mono + Instrument_Serif fonts loaded** — three font families loaded on every page, even pages that don't use serif text | `src/app/layout.tsx:12-26` | 12-26 | **Medium** |
| P7 | **Cloudflare Analytics beacon loads conditionally** but script is injected via `dangerouslySetInnerHTML` with template literal — potential XSS if token is compromised | `src/app/layout.tsx:109-111` | 109-111 | **Medium** |
| P8 | **Font preconnects** present but Next.js font system already handles this — redundant `preconnect` hints | `src/app/layout.tsx:115-116` | 115-116 | **Low** |
| P9 | **Large tool registry file** — `tools.ts` is 2417 lines, all loaded on every page via layout import | `src/registry/tools.ts` | 1-2417 | **Medium** |

---

## 2. SEO

| # | Issue | File | Line | Severity |
|---|-------|------|------|----------|
| S1 | **Missing metadata on several pages** — the following pages set metadata via `useEffect`/`document.title` instead of Next.js `generateMetadata` or `export const metadata`: About, Contact, Careers, Changelog, Cookies, Privacy, Terms, Product, Roadmap, Status, Extension, Billing, Dashboard, Login | `about/page.tsx:16-25`, `contact/page.tsx:17-26`, `careers/page.tsx`, `changelog/page.tsx`, `cookies/page.tsx`, `privacy/page.tsx`, `terms/page.tsx`, `product/page.tsx`, `roadmap/page.tsx`, `status/page.tsx`, `extension/page.tsx`, `billing/page.tsx`, `dashboard/page.tsx`, `login/page.tsx` | Various | **High** |
| S2 | **No Open Graph or Twitter cards on static pages** — only the home page and blog post pages have OG tags | All non-home pages | — | **High** |
| S3 | **No canonical URLs on most pages** — only root layout has `alternates.canonical`, individual category pages set it, most pages don't | All pages except layout and `[category]/page.tsx` | — | **Medium** |
| S4 | **Sitemap is a static XML file** — lastmod dates are hardcoded to "2026-07-10", changes are not reflected dynamically | `public/sitemap.xml` | All | **Medium** |
| S5 | **Duplicate URLs in sitemap** — `/privacy` appears twice (lines 73-78 and 190-194), `/extension` appears twice (lines 58-62 and 142-146) | `public/sitemap.xml` | 73, 190, 58, 142 | **Medium** |
| S6 | **`/api` in sitemap redirects to `/pricing`** via `_redirects` (line 61) but is still listed in sitemap | `public/sitemap.xml:22-26`, `public/_redirects:61` | 22, 61 | **Low** |
| S7 | **Blog posts lack JSON-LD** on the index page (only individual blog post pages have it) | `src/app/blog/page.tsx` | — | **Medium** |
| S8 | **No `hreflang` tags** despite language selector in footer claiming 10 languages | `src/app/layout.tsx` | — | **Low** |
| S9 | **robots.ts has `force-static` but no actual dynamic logic** — could just be a static `robots.txt` file | `src/app/robots.ts:12` | 12 | **Low** |
| S10 | **`/sign-in` is a separate route that redirects to `/login`** — duplicate route, confuses crawlers | `src/app/sign-in/page.tsx` | 1-14 | **Low** |

---

## 3. ACCESSIBILITY

| # | Issue | File | Line | Severity |
|---|-------|------|------|----------|
| A1 | **Empty `alt=""` on many images** — decorative images should have `alt=""` but tool preview/result images have empty alt (BulkImageWatermark, BulkBgChanger, LinkInBioBuilder, AiBgChanger) | Multiple tool module files | Various | **Medium** |
| A2 | **No `aria-label` on icon-only buttons** — theme toggle button has it, but social sign-in buttons and some tool buttons don't | `login/page.tsx:146-167`, several tool modules | Various | **Medium** |
| A3 | **Skip-to-content link targets `#main-content`** — verified this ID exists in layout.tsx (line 127) which is correct | `layout.tsx:117-122` | 117 | **OK** |
| A4 | **Focus trap in mobile drawer** is implemented but no focus indicator on mega-menu tool links (they use `border-l-2` on hover but not focus-visible) | `Header.tsx:197-199` | 197 | **Low** |
| A5 | **Color contrast depends entirely on CSS variables** — no fallback colors defined if variables fail to load | `globals.css` | — | **Low** |
| A6 | **No `aria-current` on active navigation links** | `Header.tsx` | Various | **Low** |
| A7 | **No keyboard-accessible sub-menu indicator** for mega-menu — only mouse hover opens it (though it does respond to focus) | `Header.tsx:125-132` | 125-132 | **Medium** |
| A8 | **`<select>` elements lack `aria-label`** — contact form category dropdown | `contact/page.tsx:169-178` | 169 | **Low** |

---

## 4. PWA

| # | Issue | File | Line | Severity |
|---|-------|------|------|----------|
| W1 | **Service worker cannot register** — `output: "export"` in Next.js config prevents SW registration endpoint; `next-pwa` comment confirms this | `next.config.ts:17-23` | 17-23 | **Critical** |
| W2 | **Manifest.json is static** — tool count says "290+" but `toolsRegistry.length` is used dynamically elsewhere — mismatch possible | `public/manifest.json:4` | 4 | **Medium** |
| W3 | **No offline fallback page** — the SW exists but since it can't register, the offline page scenario is untestable | `public/sw.js` | — | **High** |
| W4 | **No `maskable` icon for 192x192** — only the 512x512 icon has `purpose: "any maskable"` | `public/manifest.json:18` | 18 | **Low** |
| W5 | **No splash screens defined** | `public/manifest.json` | — | **Low** |
| W6 | **No `lang` in manifest** | `public/manifest.json` | — | **Low** |
| W7 | **`edge_side_panel` in manifest** requires Chromium Edge — non-standard property | `public/manifest.json:65` | 65 | **Low** |

---

## 5. SECURITY

| # | Issue | File | Line | Severity |
|---|-------|------|------|----------|
| C1 | **CSP in `_headers` allows `unsafe-inline` for scripts and styles** — blocks most XSS but `unsafe-inline` reduces protection | `public/_headers:2` | 2 | **Medium** |
| C2 | **No CSP `frame-ancestors` directive** — `X-Frame-Options: DENY` covers this but CSP would be more robust | `public/_headers:2` | 2 | **Low** |
| C3 | **Permissions-Policy only set in Cloudflare Functions middleware, not in static `_headers`** — Functions middleware only runs on Cloudflare, not locally | `public/_headers`, `functions/_middleware.ts:11` | — | **Medium** |
| C4 | **No CSP `form-action` directive** — could allow form submission to arbitrary origins | `public/_headers:2` | 2 | **Medium** |
| C5 | **Contact form stores submissions in localStorage** — no actual email sending, no Turnstile CAPTCHA implementation on the client side | `contact/page.tsx:46-48` | 46-48 | **High** |
| C6 | **Turnstile on create-order is server-only** — no client-side Turnstile widget rendered on pricing page | `functions/api/payments/create-order.ts:63-79` | 63 | **Medium** |
| C7 | **Login page says "Authentication is not available in offline mode"** — this means auth is effectively broken/dead code | `login/page.tsx:25` | 25 | **Critical** |
| C8 | **`NEXT_PUBLIC_*` env vars exposed in layout** — `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` is inlined in a script tag | `layout.tsx:110` | 110 | **Low** |
| C9 | **No `input` sanitization on search/contact form** — though since there's no server processing for the contact form, risk is limited | `contact/page.tsx` | — | **Low** |
| C10 | **Cloudflare Functions middleware uses `any` type for context** — no type safety | `functions/_middleware.ts:1` | 1 | **Low** |
| C11 | **HSTS max-age is 2 years** (63072000s) — good, but no `includeSubDomains` confirmation (it is present) | `public/_headers:6` | 6 | **OK** |

---

## 6. CODE QUALITY

| # | Issue | File | Line | Severity |
|---|-------|------|------|----------|
| Q1 | **`console.log` left in production code** — `"Hello, " + name` debug log | `MarkdownToHtml.tsx:27` | 27 | **Medium** |
| Q2 | **`@ts-expect-error` used 3 times** — instead of properly typing custom user properties on session | `dashboard/page.tsx:71,105`, `BulkFontSubsetter.tsx:15` | 71, 105, 15 | **Medium** |
| Q3 | **`any` types used extensively in Cloudflare Functions** — `context: any`, `error: any`, `body: Record<string, unknown>` | `functions/` directory | Multiple | **Medium** |
| Q4 | **AnalyticsProvider fetches `/api/analytics` which doesn't exist as a Next.js API route** — this 404s on static export | `AnalyticsProvider.tsx:23` | 23 | **High** |
| Q5 | **No ErrorBoundary wrapping individual tool components** — error in one tool could crash the whole page | Various tool modules | — | **Medium** |
| Q6 | **Console.error used for logging in production components** (Error.tsx, global-error.tsx) — OK for error pages, but they also show user-facing messages | `error.tsx:10`, `global-error.tsx` | 10 | **Low** |
| Q7 | **Many unused imports** — e.g., `useEffect` imported in pages that don't use it, or `React` imported when not needed in Next.js App Router | Multiple files | Various | **Low** |
| Q8 | **`as` casts used for environment variables** — `process.env.DB as unknown as D1Database` | `auth.ts:9` | 9 | **Medium** |
| Q9 | **No Prettier config for `functions/` directory** — Prettier script only covers `src/` | `package.json:18` | 18 | **Low** |
| Q10 | **Comment about `L3` and `L5` in config files** — appears to be tracking/labeling system left in production code | `next.config.ts:19`, `drizzle.config.ts:8` | 19, 8 | **Low** |

---

## 7. TESTING

| # | Issue | File | Line | Severity |
|---|-------|------|------|----------|
| T1 | **Only 1 test file exists** — `smoke.test.tsx` with 3 trivial tests | `src/__tests__/smoke.test.tsx` | 1-19 | **Critical** |
| T2 | **No component tests** — no tests for Header, Footer, any tool module, or any page | — | — | **High** |
| T3 | **No API route tests** — Functions API logic is untested | — | — | **High** |
| T4 | **Test environment is `node`** but tests import React/JSX — should use `jsdom` or `happy-dom` | `vitest.config.ts:7` | 7 | **Medium** |
| T5 | **No E2E tests** despite having Puppeteer in devDependencies | `package.json:126` | 126 | **High** |
| T6 | **Vitest globals enabled** but no `@vitest/globals` types configured | `vitest.config.ts:6` | 6 | **Low** |

---

## 8. MONITORING

| # | Issue | File | Line | Severity |
|---|-------|------|------|----------|
| M1 | **PostHog initial pageview not captured** — the `$pageview` capture only fires on pathname *change*, not on initial mount | `PostHogProvider.tsx:28-33` | 28-33 | **Medium** |
| M2 | **No Sentry integration despite env var being defined** — `NEXT_PUBLIC_SENTRY_DSN` in env but no Sentry SDK/configuration | `lib/env.ts:9`, `package.json` | 9 | **High** |
| M3 | **AnalyticsProvider's `/api/analytics` endpoint doesn't exist** — all analytics payloads silently fail with 404 | `AnalyticsProvider.tsx:23` | 23 | **High** |
| M4 | **No performance monitoring** — no Web Vitals tracking, no RUM | — | — | **Medium** |
| M5 | **No error reporting beyond `console.error`** — errors in tools are lost if user doesn't have devtools open | Multiple files | — | **Medium** |

---

## 9. INFRASTRUCTURE

| # | Issue | File | Line | Severity |
|---|-------|------|------|----------|
| I1 | **No Dockerfile** — can't containerize for self-hosting | — | — | **Medium** |
| I2 | **CI workflow runs `npm run build` but build requires env vars** — will fail in CI without `.env.local` | `.github/workflows/ci.yml:33` | 33 | **High** |
| I3 | **Build script validates env before building** — but `validatePublicEnv()` rejects `http://localhost:3000`, breaking local builds | `package.json:7`, `lib/env.ts:28` | 7, 28 | **Medium** |
| I4 | **`output: "export"` is incompatible with Cloudflare Functions** — Pages Functions won't run on static export routes | `next.config.ts:17` | 17 | **Critical** |
| I5 | **No custom 50x error page for Cloudflare Pages** — only Next.js `error.tsx` and `global-error.tsx` exist but Cloudflare may serve its own error page | — | — | **Medium** |
| I6 | **`wrangler.toml` has D1 config commented out** — database binding not enabled for production | `wrangler.toml:7-10` | 7-10 | **High** |
| I7 | **Rate limiting in create-order uses `KV` but `RATE_LIMIT_KV` may not exist** — commented in wrangler.toml | `functions/api/payments/create-order.ts:13-15` | 13 | **High** |
| I8 | **No health check endpoint** | — | — | **Low** |

---

## 10. CONTENT / MISSING PAGES

| # | Issue | File | Line | Severity |
|---|-------|------|------|----------|
| N1 | **No FAQ page** — `faqs` field exists in `ToolMetadata` but no `/faq` route | — | — | **Medium** |
| N2 | **No `/sign-up` page** — linked from login page (`/login` line 174) but doesn't exist | `login/page.tsx:174` | 174 | **High** |
| N3 | **Contact form doesn't actually send** — stores in localStorage and simulates success after 1.5s timeout; no email, no API call | `contact/page.tsx:37-56` | 37-56 | **Critical** |
| N4 | **Footer links to `/sign-up` which doesn't exist** | `Footer.tsx` (via login redirect chain) | — | **High** |
| N5 | **Changelog "Subscribe" input doesn't work** — no backend, no email integration | `changelog/page.tsx:257-262` | 257-262 | **Medium** |
| N6 | **Roadmap feature request form doesn't work** — just shows a toast, doesn't submit anywhere | `roadmap/page.tsx:232-238` | 232-238 | **Medium** |
| N7 | **Extension page "Download Extension ZIP" generates a dummy file** — not a real Chrome extension | `extension/page.tsx:37-52` | 37-52 | **Medium** |
| N8 | **Career page says "No Open Roles"** — fine for now but should have application CTA | `careers/page.tsx:64-70` | 64-70 | **Low** |
| N9 | **Status page uses fake/simulated data** — hardcoded uptime, random latency generation, no real monitoring integration | `status/page.tsx:28-65,71-90` | 28-90 | **Low** |
| N10 | **Pricing page form POSTs to `/api/payments/create-order`** — this won't work with static export | `pricing/page.tsx:195` | 195 | **Critical** |
| N11 | **Blog post list uses client-side rendering** — page.tsx is a server component but imports lucide icons, though the actual rendering is fine | `blog/page.tsx` | — | **Low** |

---

## 11. MISSING ROUTES / BROKEN LINKS

| # | Issue | File | Line | Severity |
|---|-------|------|------|----------|
| R1 | **`/sign-up`** — linked from login but doesn't exist | `login/page.tsx:174` | 174 | **High** |
| R2 | **`/api/analytics`** — fetched by AnalyticsProvider but doesn't exist as route | `AnalyticsProvider.tsx:23` | 23 | **High** |
| R3 | **`/downloader/youtube-downloader`** — linked in Header "Most Used Today" ticker but no such route exists | `Header.tsx:283` | 283 | **Medium** |
| R4 | **`/tools/pdf`** — in product page links to `/tools/pdf` but category pages are at `/{category}` not `/tools/{category}` | `product/page.tsx:36` | 36 | **Medium** |

---

## 12. BUILD / BUNDLE

| # | Issue | File | Line | Severity |
|---|-------|------|------|----------|
| B1 | **Static export (`output: "export"`) is incompatible with many features** — API routes, middleware, ISR, server components with dynamic functions all fail | `next.config.ts:17` | 17 | **Critical** |
| B2 | **`@opennextjs/cloudflare` is a dependency** but `output: "export"` suggests it's not used — these are conflicting approaches | `package.json:36` | 36 | **High** |
| B3 | **Large bundle from heavy dependencies** — `@ffmpeg/ffmpeg`, `@tensorflow/tfjs`, `pdfjs-dist`, `fabric`, `mermaid` are all large libraries loaded on demand | `package.json` | 34, 42-43, 62, 77 | **Medium** |
| B4 | **No explicit code-splitting boundaries** — all tool modules are dynamic imports but the main layout loads the full registry | `layout.tsx:9` | 9 | **Medium** |
| B5 | **Lint command runs ESLint but config only includes `core-web-vitals` and `typescript`** — no custom rules | `eslint.config.mjs` | 1-16 | **Low** |
| B6 | **TypeScript `strict: true` is set** — good, but `skipLibCheck: true` may hide issues | `tsconfig.json:7` | 7 | **Low** |

---

## 13. DATA FLOW / AUTH

| # | Issue | File | Line | Severity |
|---|-------|------|------|----------|
| D1 | **No Next.js middleware** — all route protection must happen client-side (which is easily bypassed) | No `middleware.ts` | — | **Critical** |
| D2 | **Dashboard auth check is purely client-side** — `useSession()` redirects to `/login` but the actual page content is still in the JS bundle | `dashboard/page.tsx:14-18` | 14-18 | **High** |
| D3 | **Login form does nothing** — `handleSubmit` shows "Authentication is not available in offline mode" toast; social buttons do the same | `login/page.tsx:23-26,148-167` | 23-26 | **Critical** |
| D4 | **Better Auth is configured but never actually connected** — the auth.ts config exists, the client exists, but no page actually calls `signIn()` | `auth.ts`, `auth-client.ts`, `login/page.tsx` | — | **Critical** |
| D5 | **`@ts-expect-error` on `session.user.credits` and `session.user.plan`** — indicates the type definition is incomplete | `dashboard/page.tsx:71,105` | 71, 105 | **Medium** |
| D6 | **JWT verification in create-order uses fallback to `guest_user`** — anyone can make orders as guest | `functions/api/payments/create-order.ts:21` | 21 | **Medium** |

---

## 14. INTERNATIONALIZATION

| # | Issue | File | Line | Severity |
|---|-------|------|------|----------|
| L1 | **No i18n framework installed or configured** — no `next-intl`, `react-i18next`, or similar | — | — | **High** |
| L2 | **Language selector in footer is purely cosmetic** — changing language does nothing, all content stays in English | `Footer.tsx:47-49` | 47-49 | **High** |
| L3 | **`<html lang="en">` is hardcoded** — should be dynamic if i18n is implemented | `layout.tsx:76` | 76 | **Low** |
| L4 | **No `hreflang` alternate tags** despite language options in UI | `layout.tsx` | — | **Medium** |
| L5 | **Pricing has INR support via geo-detection** — this is the only localization that works | `pricing/page.tsx:19` | 19 | **OK** |

---

## SUMMARY

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Performance | 1 | 1 | 4 | 3 | 9 |
| SEO | 0 | 2 | 5 | 3 | 10 |
| Accessibility | 0 | 0 | 5 | 3 | 8 |
| PWA | 1 | 1 | 2 | 3 | 7 |
| Security | 1 | 1 | 4 | 5 | 11 |
| Code Quality | 0 | 2 | 5 | 3 | 10 |
| Testing | 1 | 3 | 1 | 1 | 6 |
| Monitoring | 0 | 3 | 2 | 0 | 5 |
| Infrastructure | 2 | 3 | 2 | 1 | 8 |
| Content/Pages | 2 | 3 | 4 | 2 | 11 |
| Routes/Links | 0 | 3 | 1 | 0 | 4 |
| Build/Bundle | 1 | 2 | 2 | 2 | 7 |
| Data Flow/Auth | 3 | 2 | 1 | 0 | 6 |
| i18n | 0 | 2 | 1 | 1 | 4 |
| **TOTAL** | **12** | **28** | **39** | **27** | **106** |

### Top 10 Critical Issues

1. **`output: "export"` breaks everything** — API routes, middleware, PWA SW registration, server components with dynamic functions. (`next.config.ts:17`)
2. **Authentication is dead code** — Login page says "Authentication is not available in offline mode", Better Auth configured but never connected. No middleware exists.
3. **Contact form doesn't actually work** — Stores in localStorage and fakes success after 1.5s. No email sent, no API called. (`contact/page.tsx:37-56`)
4. **`/api/analytics` endpoint doesn't exist** — `AnalyticsProvider.tsx` POSTs to it on every page navigation, but it 404s silently. (`AnalyticsProvider.tsx:23`)
5. **Pricing page payment form is non-functional** — POSTs to `/api/payments/create-order` which won't work with static export. (`pricing/page.tsx:195`)
6. **Service worker cannot register** — Static export prevents SW registration endpoint. PWA is non-functional. (`next.config.ts:17-23`)
7. **Only 1 test file exists** — 3 trivial tests for a 300+ tool codebase. (`src/__tests__/smoke.test.tsx`)
8. **No middleware for route protection** — Dashboard auth is purely client-side, easily bypassed. (No `middleware.ts`)
9. **Cloudflare Functions won't run** — Static export (`output: "export"`) prevents Pages Functions from handling API routes.
10. **Better Auth never connected** — Auth config and client exist but no page calls `signIn()`. (`auth.ts`, `auth-client.ts`)

---

*Audit generated: 2026-07-10 | 92 tool calls · 2m 43s*
