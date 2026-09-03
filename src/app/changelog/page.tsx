import React from "react";
import { 
  ArrowRight,
  Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toolsRegistry } from "@/registry/tools";
import { ChangelogTimeline } from "@/components/ChangelogTimeline";
import { DemoType } from "@/components/ChangelogShowcase";

interface Release {
  version: string;
  date: string;
  title: string;
  tag: string;
  tagColor: string;
  description: string;
  demo?: DemoType;
  updates: { type: string; text: string }[];
}

const RELEASES: Release[] = [
  {
    version: "v2.3.0",
    date: "September 03, 2026",
    title: "Security Hardening, 31 New Tools & Homepage Redesign",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Admin security hardened with IP allowlisting, session management, and type-to-confirm for role changes. Google OAuth cookie detection fixed across client and middleware. 31 new tools added including bulk processors, Gemini watermark remover, and text utilities. Homepage upload box redesigned with format badges and privacy notice. 1,000+ tool-specific FAQs and instructions written.",
    updates: [
      { type: "security", text: "Admin IP allowlisting via ADMIN_IPS env var — restrict admin API access to trusted IPs." },
      { type: "security", text: "Type-to-confirm for admin role changes — must type user's exact email to promote or demote admin. Prevents accidental privilege escalation." },
      { type: "feature", text: "Session management: list active sessions per user with device/IP info, force-logout from admin panel." },
      { type: "fix", text: "Cookie name mismatch fixed: freeUsageGuard.ts used underscore (better-auth_session_token) instead of dot (better-auth.session_token). Client-side sign-in detection was always failing." },
      { type: "fix", text: "Middleware cookie regex updated with __Secure-better-auth.session_token prefix for production HTTPS. Ban enforcement and lastLoginAt tracking now work in production." },
      { type: "feature", text: "Homepage upload box redesigned: format badges (IMG, VID, PDF, DOC, AUD), privacy notice with Shield icon, browse-by-category fallback — inspired by SMART START upload UX." },
      { type: "feature", text: "31 new tools: Bulk Image Upscaler, Bulk HEIC Converter, Bulk AVIF Optimizer, Gemini Watermark Remover (single + batch), Bulk PDF Suite (9 operations), Reverser, Upside Down Text, Glitch Text, Invisible Character." },
      { type: "feature", text: "1,000+ tool-specific instructions and FAQs written across all 21 categories — no more generic templates." },
      { type: "feature", text: "SEO: FAQPage JSON-LD schema, tool-specific FAQs for 137 crawled-not-indexed tools, 53 format-pair SEO permutations." },
      { type: "fix", text: "Mobile sidebar nav toggles (nav mode, view mode) now visible on mobile — were hidden behind sm:flex." },
      { type: "fix", text: "SaaS overview dashboard: MRR/ARR metrics, growth milestones with progress bars, colored accent stat cards." },
    ]
  },
  {
    version: "v2.2.0",
    date: "August 25, 2026",
    title: "CalculatorShell Upgrade, UI Consistency & Accessibility",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "CalculatorShell upgraded with two-column layout, result panel, auto-calculate, and presets across 80+ calculators. CSS variable migration completed across 24 files. Accessibility pass: aria-live, keyboard handlers, aria-labels. Large files split into individual per-tool modules. FFmpeg tools consolidated behind shared hook.",
    updates: [
      { type: "feature", text: "CalculatorShell redesigned: two-column layout with result panel (copy/download/history), icon prop, auto-calculate mode, and presets for 80+ calculators." },
      { type: "feature", text: "Auto-calculate enabled for health, finance, and math tools — results update as you type, no Calculate button needed." },
      { type: "refactor", text: "TextSeoTools.tsx (1,346 lines, 25 tools) and Generators.tsx (1,420 lines, 22 tools) split into individual per-tool files." },
      { type: "refactor", text: "25 FFmpeg tools migrated to shared useFFmpeg hook. 8 finance tools migrated to CalculatorShell." },
      { type: "fix", text: "CSS variable migration completed across 24 files — eliminates hardcoded Tailwind colors. Megamenu icons/colors aligned." },
      { type: "fix", text: "37 duplicate action buttons removed across 7 calculator files. 16 calculators guarded against misleading zero/empty results." },
      { type: "fix", text: "GasMileage NaN guard, FractionCalculator stack overflow fix, Modulo/Rounding computation guarded behind hasInput." },
      { type: "fix", text: "39 duplicate showInCategory properties removed. Card-in-card nesting eliminated from 29 standalone tools + 13 Section helpers." },
      { type: "fix", text: "Accessibility: aria-live to CalculatorShell, keyboard handlers to 39 non-interactive onClick elements, aria-labels to 20 icon-only buttons." },
      { type: "fix", text: "Error handling: try/catch + user-facing toast added to canvas image tools and speech synthesis." },
      { type: "performance", text: "Full tools registry removed from HomeClient and ToolLayout client bundles. OG images converted to WebP." },
    ]
  },
  {
    version: "v2.1.0",
    date: "August 11, 2026",
    title: "Admin Panel, Auth Overhaul & Account System",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Google OAuth completely rebuilt after diagnosing redirect URI, state strategy, and middleware conflicts across 10+ commits. Admin panel launched with user management, SaaS metrics, and audit logging. Premium dashboard, account page, Turnstile CAPTCHA, and favorites system wired end-to-end. Route system consolidated — all converter categories migrated to single MODULE_REGISTRY.",
    updates: [
      { type: "fix", text: "Google OAuth rebuilt: explicit redirectURI override to match callback route, database state strategy to fix state_mismatch, middleware skip for /api/auth/ routes, issuer column added to account table." },
      { type: "fix", text: "Pin better-auth to 1.7.2 to prevent silent schema-breaking upgrades. Remove broken secondaryStorage (D1 lacks KV interface). Remove lastLoginAt from Drizzle schema that was breaking new user creation." },
      { type: "feature", text: "Admin panel with user management: ban/unban, GDPR delete, plan grant, credits editing, subscription visibility, audit log viewer, and role management." },
      { type: "feature", text: "Admin v2: sidebar nav, search, pagination, bulk actions, CSV export, rate limiting, last-admin protection, silent redirect." },
      { type: "feature", text: "Premium dashboard with real activity data, session-aware header navigation, usage logging wired to tool pages." },
      { type: "feature", text: "Account page: profile editing, password change, session management, favorites export, and delete account." },
      { type: "feature", text: "User favorites system: star button on every tool, homepage favorites section, ⌘K search integration, and dedicated /dashboard/favorites page." },
      { type: "feature", text: "Turnstile CAPTCHA wired into sign-up, sign-in, and forgot-password flows." },
      { type: "feature", text: "Route system consolidated: all converter categories (image, audio, video, data, text) migrated to single MODULE_REGISTRY. ConverterRouter retired." },
      { type: "feature", text: "Registry integrity suite: zero orphans, zero ComingSoon pages, dead routes removed, content integrity test suite with pre-push hooks." },
      { type: "feature", text: "Complete test suite: 115 test files, 547+ tests, component tests for top 50 tools, keyboard accessibility tests." },
      { type: "fix", text: "Admin layout fixed: Header/Footer hidden for /admin routes. Sidebar nav with Back to Toolzum at bottom, mobile responsive." },
    ]
  },
  {
    version: "v2.0.1",
    date: "July 25, 2026",
    title: "Accurate Tool Counts — Hidden Redirects No Longer Inflate Directory Numbers",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Fixed a significant counting discrepancy across the tools directory. The header claimed '1090+ Free Online Tools' while the results counter showed only '856' — a 234-tool gap caused by hidden SEO redirect stubs (format-pair variants like 'MKV to WEBM') being counted in the total but excluded from the visible results. Now every count on the page — header, subtitle, category sidebars, and results — reflects only tools actually shown.",
    updates: [
      { type: "fix", text: "Header 'X+ Free Online Tools' and subtitle now use the same visible-only count as the results list — no more 234-tool gap between header and results." },
      { type: "fix", text: "Category sidebar and menubar counts now exclude hidden redirect entries — each category shows the true number of visible tools." },
      { type: "fix", text: "Server-side metadata and JSON-LD structured data (page title, description, Open Graph) now use the filtered count instead of the inflated total." },
      { type: "fix", text: "Category navigation no longer lists categories that only contain hidden redirect entries." },
    ]
  },
  {
    version: "v2.0.0",
    date: "July 07, 2026",
    title: "Premium UX Overhaul, Indian Utilities & Calculator Shell",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Major premium interface upgrade across the entire platform. CalculatorShell deployed across 80+ calculators with history, keyboard shortcuts, and one-click copy. Three flagship premium tools launched: SaaS Metrics Dashboard with KPI charts and scenario modeling, API Builder/Tester with Postman-lite collections, and PDF Workflow Builder for merge/split/form-fill. Indian Utilities category completed with 5 new tools. All remaining tool modules upgraded to premium UI. CSS variable system migrated across all 359 tool modules.",
    updates: [
      { type: "feature", text: "CalculatorShell framework created and deployed across 80+ calculators — history panel, keyboard support, result memory, and one-click copy. Scientific Calculator rebuilt with full grid layout." },
      { type: "feature", text: "Premium SaaS Metrics Dashboard with interactive KPI cards, SVG charts, scenario modeling, and PDF export — privacy-first, no server round trips." },
      { type: "feature", text: "Premium API Builder/Tester — full Postman-lite experience with request collections, code snippet generation, environment variables, and privacy-first execution." },
      { type: "feature", text: "Premium PDF Workflow Builder — merge, split, fill forms, rearrange pages, optimize, and edit metadata in a single drag-and-drop workspace." },
      { type: "feature", text: "Indian Utilities category completed: UPI ID Validator, Indian Address Parser, Vehicle Registration Checker, Aadhaar Number Validator, and Investment Calculator — all optimized for Indian data formats." },
      { type: "feature", text: "Premium text tools expanded: 6 new tools added, 7 hidden stub tools restored with real modules, 4 tools enhanced with additional features. Bulk redirects wired for all stub-to-real transitions." },
      { type: "feature", text: "Bulk URL Shortener built as Pro tool — shorten multiple URLs at once with custom aliases, click tracking, and CSV export." },
      { type: "feature", text: "Mechanical CSS variable migration completed across all 359 tool module files — eliminates hardcoded colors and improves theming consistency." },
      { type: "fix", text: "22 health tools moved from Calculator category to dedicated Health category — corrects miscategorization, adds proper section groupings and redirects." },
      { type: "fix", text: "Video converter tool unhidden with its real module — was incorrectly suppressed as a stub despite having a full implementation." },
      { type: "fix", text: "7 category mismatches, security holes, and performance anti-patterns fixed across the registry." },
      { type: "feature", text: "New modules: NatoPhoneticConverter, RomanNumeralConverter, UnicodeViewer — all with premium UI and zero dependencies." },
      { type: "performance", text: "Developer Toolkit modules upgraded to premium UI with syntax highlighting, error detection, and responsive layouts." },
    ]
  },
  {
    version: "v1.9.0",
    date: "June 23, 2026",
    title: "Registry Expansion, Toolkit Audit & Production Hardening",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Tool catalog expanded to 831 entries with full cross-reference audit across all routing paths. 15/15 composite toolkit bundles audited, refactored, and deduplicated — 5 retired into LinkCard hubs. Production hardening: CSP headers, IndexNow, dynamic sitemap, content integrity test suite with pre-push hooks. 83 format-pair redirect URLs deployed, 62 previously hidden tools restored. Bulk tool BatchProgressPanel retrofitted across 31 modules. SEO category sections with server-side H2 groupings.",
    updates: [
      { type: "feature", text: "Full cross-reference audit: 689 MODULE_REGISTRY entries + 256 CONVERTER_CONFIG entries + 17 SEO_PERMUTATIONS = 955 coverage slots covering 831 tool slugs with zero orphans and zero gaps." },
      { type: "feature", text: "400+ new tool entries added to the registry — total catalog grows from ~430 to 831 tools across 20 categories. Every new tool has a unique slug, ID, description, and module binding." },
      { type: "performance", text: "15/15 toolkit audit completed — SecurityToolkit (513→283 lines), DevToolkit, DataToolkit, and all composite bundles refactored. 5 retired into LinkCard hub pages with retained redirects." },
      { type: "feature", text: "83 format-pair redirect URLs added (showInCategory: false) — each routes through the consolidated ConverterRouter pipeline for image, audio, video, document, and data conversions." },
      { type: "fix", text: "62 accidentally hidden tools restored (unit converters, time/date, color, JSON/CSV/code utilities) — previously suppressed by incorrect showInCategory: false flag." },
      { type: "feature", text: "Content integrity test suite with pre-push hooks — verifies every tool has a real module, no duplicate IDs, no broken cross-references. Runs before every commit." },
      { type: "performance", text: "Bulk tool hardening: BatchProgressPanel retrofitted onto BulkVideoSizeReducer, BulkVideoSubtitleBurner, and 29 other bulk modules. Fault isolation prevents single-file crashes from killing the queue." },
      { type: "feature", text: "SEO category sections rewritten with server-side H2 groupings and unique introductions. Accordion subsections (collapsed by default) on every category page." },
      { type: "fix", text: "23 duplicate tool entries removed (17 exact slug duplicates + 6 near-duplicates). ID collision id '495' reassigned unique id." },
      { type: "fix", text: "6 orphaned MODULE_REGISTRY entries removed or renamed. 2 dead keys (json-syntax-validator, recommended-security-headers) removed." },
      { type: "fix", text: "4 standalone dev utilities extracted from DevUtilities composite (random-port-generator, chmod-calculator, docker-run-to-compose, email-normalizer) — each gets its own SEO page." },
      { type: "fix", text: "Cross-category dedup: Group 1 batch merge with superset redirects, cross-reference labels on navigation, roadmap synced." },
      { type: "performance", text: "Production configuration: CSP headers, IndexNow key + submission script, dynamic sitemap (876 URLs) migrated to static export-compatible generation, robots.txt with AI crawler rules." },
      { type: "fix", text: "509 tools with descriptions identical to seoDescription fixed — deduplicated. Trust-claim suffix consolidated into single shared constant." },
      { type: "fix", text: "Footer navigation links fixed (invisible on hover in light mode). Premium tools 'Browse all' link corrected from /categories/ to /." },
      { type: "feature", text: "Module registry split into chunks (0-5) for improved maintainability. Stale static sitemap and robots.txt removed in favor of dynamic generation." },
    ]
  },
  {
    version: "v1.8.0",
    date: "June 15, 2026",
    title: "830 Tools — Full Registry Coverage, Zero Orphans",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Tool catalog doubled from ~430 to 831 tools. Every tool slug now routes to a real component — zero 'Coming Soon' pages, zero orphaned module keys, zero uncovered slugs. All dynamic routing paths (MODULE_REGISTRY, CONVERTER_CONFIG, SEO_PERMUTATIONS) cross-referenced and verified complete. Subcategory pills fixed across all 15 tool categories. Format converter consolidation finalized with all 256 converterConfig entries.",
    updates: [
      { type: "feature", text: "400+ new tool entries added to the registry — total catalog grows from ~430 to 831 tools across 20 categories. Every new tool has a unique slug, ID, description, and module binding." },
      { type: "feature", text: "Full cross-reference audit completed: 689 MODULE_REGISTRY entries + 256 CONVERTER_CONFIG entries + 17 SEO_PERMUTATIONS = 955 coverage slots covering 831 tool slugs with zero gaps and zero orphans." },
      { type: "fix", text: "23 duplicate tool entries removed (17 exact slug duplicates + 6 near-duplicate entries with different slugs but identical tool data)." },
      { type: "fix", text: "ID collision resolved: duplicate id '495' reassigned unique id '495-uniq'." },
      { type: "fix", text: "6 orphaned MODULE_REGISTRY entries removed or renamed to match actual tool slugs: conversion-rate-calc, audio-converter-tool→audio-converter, data-converter-tool→data-converter, document-converter-tool→document-converter, pace-calculator, body-mass-index-calculator." },
      { type: "fix", text: "2 dead MODULE_REGISTRY keys (json-syntax-validator, recommended-security-headers) with no tools.ts entry or component file removed." },
      { type: "fix", text: "Subcategory pill filtering fixed across all 15 tool categories — brand keywords and social platform names now filter correctly into their subcategory groups." },
      { type: "fix", text: "EPUB to PDF converter visibility fixed (showInCategory: false → true, server dependencies → browser dependencies)." },
      { type: "fix", text: "Time Converter category fixed (Utility → Developer) and description corrected (no longer mentions time zones)." },
      { type: "feature", text: "Format converter consolidation finalized: all 256 directed format-pair slugs (image, audio, video, document, data) handled by ConverterRouter with no missing entries." },
      { type: "feature", text: "Bulk SEO landing pages verified: all 17 SEO_PERMUTATIONS entries (bulk-png-to-webp, bulk-mp3-to-wav, etc.) route correctly through BulkSeoLandingPage." },
      { type: "feature", text: "Header navigation links verified: all 5 previously flagged nav slugs confirmed present in tools.ts registry." },
      { type: "feature", text: "New CSV to SQLite Web Terminal tool — upload CSV files and run SQL queries in a WebAssembly SQLite sandbox entirely in-browser." },
      { type: "feature", text: "New Vector Pen Canvas tool — freeform vector drawing with pen, shapes, multi-page canvas, color picker, and SVG/PNG export." },
      { type: "feature", text: "Roadmap page updated: 2 planned items moved to completed (vector-pen, csv-to-sqlite), 3 in-development items moved to completed (pdf-sign, temp-email, webp-pipeline)." },
      { type: "performance", text: "TypeScript compilation — zero errors across the entire codebase." },
    ]
  },
  {
    version: "v1.7.0",
    date: "May 26, 2026",
    title: "Category Navigation Overhaul & CPM Suite",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Major navigation upgrades: category filters across all tool categories, A-Z alphabetical tool filter, and dynamic recently-used tools in the megamenu. Fixed critical navigation bug where 'Back to Privacy' linked to Privacy Policy instead of Privacy tools. Added CPM Calculator with 7 platform presets (YouTube, Twitch, Facebook, Instagram, TikTok, Twitter/X, LinkedIn) plus RPM (Revenue Per Mille) mode for creators.",
    updates: [
      { type: "feature", text: "CPM Calculator rewritten with platform presets for 7 social platforms — each pre-fills typical CPM/RPM averages. RPM mode toggle for creator earnings analysis." },
      { type: "feature", text: "New RPM Calculator page at /rpm-calculator — dedicated SEO entry covering revenue-per-mille search intent." },
      { type: "feature", text: "Category filter buttons (Compress, Resize, Convert, Edit, AI, etc.) now available on Audio, Video, Text, Developer, SEO, Finance, Privacy, Utility, Branding, and Health category pages — not just Image and PDF." },
      { type: "feature", text: "A-Z alphabetical letter filter on all category pages — dimmed letters for empty letters, works alongside search." },
      { type: "feature", text: "Megamenu 'Most used today' now shows your actual recently-used tools (from localStorage history) instead of hardcoded links. Falls back to defaults when history is empty." },
      { type: "fix", text: "Fixed 'Back to Privacy' navigation — Privacy Policy moved from /privacy/ to /privacy-policy/ so /privacy/ now correctly shows the Privacy tools category page. Same fix for /health/ → /status/ redirect to unblock Health tools category page." },
      { type: "fix", text: "Tool cards no longer display dependency/library names (Canvas API, FFmpeg.wasm, etc.) — removes competitive exposure and cleans up card design." },
      { type: "feature", text: "SEO permutations added for bulk-url-checker and bulk-link-checker routing to the existing bulk URL status checker tool." },
      { type: "feature", text: "New professional SVG favicon and PWA icons — clean geometric monogram mark replaces the previous raster favicon." },
    ]
  },
  {
    version: "v1.6.0",
    date: "May 15, 2026",
    title: "250 Format Pair Converter Pages & Tool Differentiation",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Full format-pair coverage: all 250 directed converter pairs across image, audio, video, document, and data formats now have individual SEO-optimized pages. Every pair page has format-specific usage instructions and conversion-reason FAQs. Tool differentiation applied to 20+ high-traffic tools with unique descriptions, custom how-to steps, and cross-tool comparison FAQs.",
    updates: [
      { type: "feature", text: "250 format-pair converter pages completed: 110 image pairs, 72 audio pairs, 42 document pairs, 20 video pairs, 6 data pairs — each with unique slug, SEO metadata, instructions, and FAQs." },
      { type: "feature", text: "ToolPageSEOContent.tsx rewritten to detect {format}-to-{format} slugs and generate format-specific instructions + comparison FAQs from a 25-format metadata map." },
      { type: "feature", text: "Phase 1-4 differentiation: word-counter, character-counter, fancy-text-generator, cursive-text-generator, font-generator, reverse-text-generator, image-compressor, compress-image-to-50kb, kb-image-compressor, pdf-compressor, video-compressor, gif-compressor, percentage-calculator, profit-margin-calculator, margin-calculator, roi-calculator, break-even-calculator, ltv-calculator, and cac-calculator — each with unique descriptions, custom instructions, and 4 cross-tool comparison FAQs." },
      { type: "feature", text: "Converter consolidation: ImageCatchAllConverter, AudioFormatConverter, DocumentFormatConverter, VideoFormatConverter, and ConverterRouter with 250 converterConfig.ts entries." },
      { type: "performance", text: "Sidebar converter count fixed — Header.tsx now correctly adds 4 cross-listed tools to the converter category count." },
      { type: "fix", text: "svg-to-png-converter duplicate entry removed from DynamicModuleWrapper, link-in-bio-builder duplicate entry fixed." },
    ]
  },
  {
    version: "v1.5.0",
    date: "April 20, 2026",
    title: "Launch Readiness — CORS, D1 Database, Mobile UX & SEO Overhaul",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Production hardening across the entire platform. CORS middleware locked to toolzum.com, remote D1 database provisioned with migrations, mobile responsiveness fixes across all tool layouts, and SEO metadata rewritten for search intent alignment. Every tool module audited and patched for production readiness.",
    updates: [
      { type: "security", text: "CORS middleware restricted to toolzum.com only — staging and localhost origins removed from production." },
      { type: "feature", text: "D1 database migrations applied remotely: user, session, payment, download_usage, and analytics_event tables provisioned." },
      { type: "performance", text: "Mobile responsiveness overhaul: WhatsApp Toolkit stats grid, tool page backdrop, badge row, hero layout, time zone tabs, and URL shortener all fixed for small screens." },
      { type: "fix", text: "URL Shortener: moved TinyURL API call to backend proxy — CORS was blocking all client-side requests." },
      { type: "fix", text: "VideoConverter: correct codec per output format (libvpx for WEBM, mpeg4 for AVI) and proper MIME types." },
      { type: "fix", text: "CurrencyConverter: exchange rate API moved to backend proxy with caching — fallback rates replaced with live data." },
      { type: "fix", text: "XmlSitemapGenerator: blob URL race condition fixed — downloads no longer fail on slow devices." },
      { type: "performance", text: "SEO meta descriptions rewritten — removed number prefixes from all 25 category descriptions, aligned with natural search intent." },
      { type: "security", text: "AI crawler robots.txt rules updated — GPTBot, ClaudeBot, Google-Extended, and others re-enabled on tool pages to improve AI discoverability and referral traffic." },
      { type: "fix", text: "console.warn calls in 7 non-critical modules wrapped in dev-only guard — production console stays clean." },
      { type: "security", text: "auth-client fallback URL changed from localhost to toolzum.com — prevents auth redirect loops." }
    ]
  },
  {
    version: "v1.4.0",
    date: "March 24, 2026",
    title: "Fault-Tolerant Bulk Processing — No More Crashing on Bad Files",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Bulk processing now handles faults gracefully. Process 50 files at once — if one is corrupted or too large, Toolzum auto-skips it, keeps processing the rest, and flags the failure at the end. No more restarting entire batches.",
    demo: "fault-tolerance",
    updates: [
      { type: "feature", text: "Memory-pressure detection warns you before processing large files on devices with less than 4 GB RAM." },
      { type: "feature", text: "Large file confirmation dialogs (>100 MB) with device memory info across video, PDF, and image modules — no more silent browser crashes." },
      { type: "performance", text: "Fault-tolerant batch engine: a single corrupted or broken file no longer kills your entire queue. The batch self-heals, skips the problem file, and reports what failed." },
      { type: "security", text: "Out-of-memory errors are now caught explicitly with a clear recovery message instead of a silent freeze — zero data loss on overflow." }
    ]
  },
  {
    version: "v1.3.0",
    date: "March 13, 2026",
    title: "30 Bulk Tools Complete — Batch Video, Audio & Document Processing",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "All 30 bulk processing modules are now live. Compress videos, reduce file sizes, burn subtitles, convert images to PDF, merge documents, run OCR, and more — all in your browser with zero uploads. Pro users unlock 6x parallel processing and ZIP downloads.",
    demo: "batch-processing",
    updates: [
      { type: "feature", text: "Batch video processing engine: compress, resize, and burn subtitles on multiple videos simultaneously using FFmpeg WASM — loaded on demand, no install required." },
      { type: "feature", text: "20+ new bulk modules including SVG to PNG, image resize/compress, PDF merge/reduce, OCR text extraction, ebook conversion, audio format conversion, and face anonymization." },
      { type: "feature", text: "Pro users download entire batches as a single ZIP file. Free users get per-file downloads with no watermark." },
      { type: "performance", text: "Pro tier unlocks 6x parallel processing threads — process 12 files in the time free users process 2. Visual speed indicator shows real-time throughput." },
    ]
  },
  {
    version: "v1.2.0",
    date: "February 11, 2026",
    title: "Enterprise Trust, Compliance & Full Office Suite — 230+ Tools",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: `The biggest expansion yet — ${toolsRegistry.length}+ tools across 21 categories plus enterprise-ready security. Published a dedicated /security page, CSP headers for XSS prevention, offline mode indicator, and zero-data retention badges across all upload zones.`,
    demo: "tool-expansion",
    updates: [
      { type: "feature", text: "Full PDF office suite: Word-to-PDF, PDF-to-Word, PDF-to-JPG, and PDF page editing — 100% client-side, no server round trip." },
      { type: "feature", text: "Design studio: SVG Vector Editor, Logo Maker, AI Thumbnail Maker with drag-and-drop canvas, templates, and export presets." },
      { type: "feature", text: "Content-Security-Policy headers lock down script-src, connect-src, and worker-src — no unauthorized scripts can execute." },
      { type: "feature", text: "Offline mode indicator shows persistent banner — all processing works even when WiFi drops, critical for remote teams." },
      { type: "performance", text: "Background image removal migrated to 100% local WebGL tensor execution — up to 4x faster than the previous pipeline, still zero uploads." },
      { type: "security", text: `Offline-first zero-telemetry framework enforced across all ${toolsRegistry.length}+ tools. No analytics pings, no data collection, no third-party requests.` }
    ]
  },
  {
    version: "v1.1.0",
    date: "January 09, 2026",
    title: "Business Finance & Developer Toolbox",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Expanded the finance and developer tool categories with SaaS metrics, currency exchange, code formatting, and offline caching for persistent access.",
    updates: [
      { type: "feature", text: "Business finance suite: SaaS pricing calculator, employee turnover tracker, ROI simulator, and localized currency exchange rates." },
      { type: "feature", text: "Developer sandbox: SQL, JSON, and CSS minifiers and formatters with syntax highlighting and error detection." },
      { type: "performance", text: "Service Worker caching enables offline persistence across all page routes — tools and pages load instantly even without a connection." }
    ]
  },
  {
    version: "v1.0.0",
    date: "December 15, 2025",
    title: "Platform Launch — Privacy-First Web Utilities",
    tag: "launch",
    tagColor: "bg-emerald-700/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    description: "Toolzum launched with a simple premise: every tool should run in your browser, not on a server. No uploading confidential files to black-box servers for simple resize, crop, or hashing operations.",
    updates: [
      { type: "feature", text: "Initial catalog of 50 tools: hashing, text processing, image compression, format conversion, and random generators." },
      { type: "security", text: "Verified zero-data exfiltration — no packets dispatched during any tool execution. Every byte stays on your device." }
    ]
  },
  {
    version: "v0.10.0",
    date: "November 18, 2025",
    title: "Tool Expansion & User Feedback Integration",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Doubled the tool catalog based on closed-beta feedback. Added image editing, PDF manipulation, QR code generation, and text utilities. Razorpay integration stabilized for Indian subscriptions.",
    updates: [
      { type: "feature", text: "Expanded catalog from 25 to 50 tools: image resizer, PDF merger, QR code generator, password generator, JSON formatter, and base64 encoder/decoder." },
      { type: "feature", text: "Razorpay payment integration hardened — subscription webhooks, retry logic, and invoice generation now fully automated." },
      { type: "fix", text: "Memory leak in PDF.js worker pool fixed — prolonged use no longer degrades browser performance." },
      { type: "performance", text: "Code-splitting improved: each tool module now loads independently, reducing initial bundle by 40%." }
    ]
  },
  {
    version: "v0.9.0",
    date: "October 12, 2025",
    title: "Private Beta — Foundation & Core Architecture",
    tag: "launch",
    tagColor: "bg-emerald-700/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    description: "Closed beta launch with the core architecture: client-side WASM processing engine, PDF.js integration, FFmpeg WASM for media, and the initial 25 tools. Pro subscription model and Razorpay/DodoPayments integration established.",
    updates: [
      { type: "feature", text: "Core WASM processing engine: PDF.js, FFmpeg WASM, and Tesseract.js integrated for fully client-side document, media, and OCR processing." },
      { type: "feature", text: "Initial 25 tools across PDF, Image, Video, Audio, and Text categories — all running in-browser with zero server uploads." },
      { type: "feature", text: "Pro subscription model established with Razorpay (India/UPI) and DodoPayments (global) payment gateways." },
      { type: "performance", text: "Dynamic module loading system — tools are code-split and loaded on demand, keeping initial bundle under 100KB." }
    ]
  }
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      
      {/* Background Grids */}
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none opacity-[0.03]">
        <div className="w-full max-w-[1280px] h-full" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-sm font-semibold text-[var(--accent)] mb-6">
            <Bookmark className="w-4 h-4" /> Product Timeline
          </span>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-7xl mb-6 tracking-tight leading-tight">
            Changelog & Updates
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)]">
            Follow the incremental evolution of the Toolzum engine. We push changes and optimizations every week.
          </p>
        </div>

        <ChangelogTimeline releases={RELEASES} />

        {/* Bottom newsletter section */}
        <div className="mt-24 max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-ink)]/5 rounded-full blur-[80px]" />
          <h3 className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl font-semibold mb-3">Never miss a tool update</h3>
          <p className="text-[var(--text-secondary)] text-sm max-w-lg mx-auto mb-6">
            We build and deploy new offline utilities every single week. Subscribe to get our weekly release summaries.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="name@email.com" 
              className="flex-1 bg-[var(--bg-base)] text-sm border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]" 
            />
            <Button disabled className="shrink-0 gap-2 opacity-60 cursor-not-allowed">Subscribe <ArrowRight className="w-4 h-4" /></Button>
          </div>
        </div>

      </div>
    </div>
  );
}
