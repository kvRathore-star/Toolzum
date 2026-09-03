import React from "react";
import { 
  ArrowRight,
  Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  // ──────────────────────────────────────────────
  // SEPTEMBER 2026
  // ──────────────────────────────────────────────
  {
    version: "v2.4.0",
    date: "September 15, 2026",
    title: "Admin Security Hardening & Session Control",
    tag: "security",
    tagColor: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    description: "Admin panel locked down with IP restrictions, session management, and safeguards against accidental privilege changes. If you run a multi-admin setup, set the ADMIN_IPS environment variable to restrict access.",
    updates: [
      { type: "security", text: "Admin panel restricted by IP — only trusted networks can access admin routes. Set ADMIN_IPS environment variable to enable." },
      { type: "security", text: "Admin role changes now require typing the user's exact email to confirm — prevents accidental promotions or demotions." },
      { type: "feature", text: "Admins can view active sessions per user (device, IP, expiry) and force-logout lost or stolen devices." },
      { type: "feature", text: "Full audit trail for all admin actions — every role change, ban, and credit edit is logged with timestamp and actor." },
      { type: "fix", text: "Sign-in now works reliably — users no longer appear logged out after authenticating. Session detection fixed across client and server." },
      { type: "fix", text: "Middleware ban enforcement fixed — banned users were previously able to access API routes in production." },
    ]
  },
  {
    version: "v2.3.1",
    date: "September 10, 2026",
    title: "SEO — 1,000+ Tool FAQs & Format-Pair Pages",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "1,000+ tool-specific instructions and FAQs written across all 21 categories. 53 new format-pair SEO pages. FAQPage structured data added.",
    updates: [
      { type: "feature", text: "1,000+ tool-specific instructions and FAQs written — every tool now has unique how-to guides instead of generic templates." },
      { type: "feature", text: "53 new format-pair SEO pages (PNG-to-JPG, MP3-to-WAV, etc.) — search for any conversion and land on the right tool." },
      { type: "feature", text: "FAQPage JSON-LD structured data added to FAQ page and top tool pages — improves search engine visibility." },
      { type: "feature", text: "Interaction-pattern-based How to Use templates — instructions adapt based on what the tool actually does." },
      { type: "fix", text: "Tool-specific FAQs added for 137 tools that were crawled but not indexed by search engines." },
    ]
  },
  {
    version: "v2.3.0",
    date: "September 03, 2026",
    title: "30+ New Tools & Homepage Redesign",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "30+ new tools added including bulk processors, AI-powered watermark removal, and text utilities. Homepage upload experience redesigned with format badges and privacy-first messaging.",
    updates: [
      { type: "feature", text: "30+ new tools: bulk image upscaling, bulk HEIC/AVIF conversion, AI watermark removal (single + batch), bulk PDF operations (rotate, protect, split, watermark, crop), and text utilities (Reverser, Upside Down, Glitch, Invisible Character)." },
      { type: "feature", text: "Homepage upload box redesigned — shows supported format badges (IMG, VID, PDF, DOC, AUD) at a glance, privacy notice, and smarter file detection that routes to the right tool." },
      { type: "feature", text: "Mobile sidebar navigation added to category pages — browse tools by category on any screen size." },
      { type: "feature", text: "1,000+ tool-specific instructions and FAQs written across all 21 categories — every tool now has unique how-to guides instead of generic templates." },
      { type: "fix", text: "Category sidebar and view mode toggles now visible on mobile — were previously hidden on small screens." },
    ]
  },
  // ──────────────────────────────────────────────
  // AUGUST 2026
  // ──────────────────────────────────────────────
  {
    version: "v2.2.0",
    date: "August 25, 2026",
    title: "Calculator Upgrade, Accessibility & Performance",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Every calculator redesigned with a two-column layout, result history, and auto-calculate mode. Full accessibility pass across the platform. Page load times improved.",
    updates: [
      { type: "feature", text: "Calculators redesigned: two-column layout with result panel, one-click copy/download, calculation history, and presets across 80+ calculators." },
      { type: "feature", text: "Auto-calculate across health, finance, and math tools — results appear as you type, no Calculate button needed." },
      { type: "fix", text: "Calculation accuracy improved across 20+ tools — edge cases like empty inputs, impossible values, NaN, and overflow handled gracefully instead of showing misleading zeros." },
      { type: "fix", text: "Accessibility pass: screen reader support, keyboard navigation, and proper labels added to all interactive elements across 39 tools." },
      { type: "performance", text: "Page loads faster — heavy code removed from initial bundles, images optimized to WebP, tools load on demand." },
      { type: "fix", text: "Gas mileage calculator NaN bug fixed. Fraction calculator stack overflow fixed. Modulo and rounding computations guarded against empty inputs." },
    ]
  },
  {
    version: "v2.1.1",
    date: "August 18, 2026",
    title: "Admin Panel Deep Dive — Search, Pagination & Bulk Actions",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Admin panel upgraded with search, pagination, bulk actions, CSV export, and rate limiting. Last-admin protection prevents accidental lockout.",
    updates: [
      { type: "feature", text: "Admin panel: search users by name or email, paginated results, bulk ban/unban/delete actions, CSV export." },
      { type: "security", text: "Rate limiting added to all admin API endpoints — prevents abuse and brute-force attacks." },
      { type: "security", text: "Last-admin protection — cannot remove the last remaining admin account." },
      { type: "feature", text: "Audit log viewer with full history of role changes, bans, and credit edits." },
      { type: "fix", text: "Admin sidebar navigation improved — Back to Toolzum link at bottom, mobile responsive." },
    ]
  },
  {
    version: "v2.1.0",
    date: "August 11, 2026",
    title: "Admin Panel, Sign-In Rebuilt & Account System",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Google sign-in completely rebuilt to fix persistent authentication failures. New admin panel for user management, subscriptions, and audit logging. Full account system with profile editing, favorites, and bot protection.",
    updates: [
      { type: "fix", text: "Google sign-in rebuilt from scratch — fixed redirect issues, session persistence, and cookie conflicts that were breaking authentication for all users." },
      { type: "feature", text: "Admin panel launched: manage users, view subscriptions, edit credits, ban/unban, GDPR delete, and full audit trail with search and pagination." },
      { type: "feature", text: "Account page: edit profile, change password, manage active sessions, export favorites, and delete your account." },
      { type: "feature", text: "Favorites system: star any tool, see them on your homepage, and jump to them instantly from search (Cmd+K)." },
      { type: "security", text: "Bot protection (Turnstile CAPTCHA) added to sign-up, sign-in, and password reset flows." },
      { type: "fix", text: "Admin layout fixed — Header and Footer hidden on admin pages for a cleaner interface." },
    ]
  },
  // ──────────────────────────────────────────────
  // JULY 2026
  // ──────────────────────────────────────────────
  {
    version: "v2.0.1",
    date: "July 25, 2026",
    title: "Tool Count Accuracy Fix",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Fixed a counting discrepancy where the header claimed '1090+ tools' but results showed '856'. Now every count on the page — header, category sidebars, and results — shows the same accurate number.",
    updates: [
      { type: "fix", text: "Tool counts now consistent everywhere — header, subtitle, category sidebars, and results all show the same number." },
      { type: "fix", text: "Category sidebar and menubar counts now show only visible tools, not hidden redirect entries." },
      { type: "fix", text: "Search engine metadata and structured data (page title, Open Graph) now use accurate counts." },
      { type: "fix", text: "Category navigation no longer lists empty categories that only contained hidden entries." },
    ]
  },
  {
    version: "v2.0.0",
    date: "July 07, 2026",
    title: "Premium Calculator Shell, SaaS Dashboard & Indian Utilities",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Major premium interface upgrade across the entire platform. CalculatorShell framework deployed across 80+ calculators. Three flagship premium tools launched. Indian Utilities category completed.",
    updates: [
      { type: "feature", text: "CalculatorShell framework: history panel, keyboard shortcuts, result memory, and one-click copy across 80+ calculators. Scientific Calculator rebuilt with full grid layout." },
      { type: "feature", text: "Premium SaaS Metrics Dashboard — interactive KPI cards, SVG charts, scenario modeling, and PDF export. Privacy-first, no server round trips." },
      { type: "feature", text: "Premium API Builder/Tester — request collections, code snippet generation, environment variables, and privacy-first execution." },
      { type: "feature", text: "Premium PDF Workflow Builder — merge, split, fill forms, rearrange pages, optimize, and edit metadata in a single drag-and-drop workspace." },
      { type: "feature", text: "Indian Utilities completed: UPI ID Validator, Indian Address Parser, Vehicle Registration Checker, Aadhaar Validator, and Investment Calculator — all optimized for Indian data formats." },
      { type: "feature", text: "Bulk URL Shortener — shorten multiple URLs at once with custom aliases, click tracking, and CSV export." },
      { type: "fix", text: "22 health tools moved from Calculator to their own Health category. Video converter tool restored from incorrect hiding." },
    ]
  },
  // ──────────────────────────────────────────────
  // JUNE 2026
  // ──────────────────────────────────────────────
  {
    version: "v1.10.0",
    date: "June 30, 2026",
    title: "Production Hardening & Batch Processing Fixes",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Bulk processing hardened with fault isolation — one bad file no longer crashes the entire batch. Security headers added, automated sitemap, and AI crawler rules configured.",
    updates: [
      { type: "performance", text: "Bulk processing hardened: a single corrupted or broken file is auto-skipped instead of crashing the entire batch." },
      { type: "security", text: "Content-Security-Policy headers added — prevents unauthorized script execution on all pages." },
      { type: "feature", text: "Automated sitemap generation with 876+ URLs, plus AI crawler rules for discoverability." },
      { type: "feature", text: "Content integrity test suite runs before every commit — catches broken tools and duplicate entries automatically." },
      { type: "fix", text: "62 tools that were accidentally hidden are now visible again — unit converters, time/date tools, color utilities, JSON/CSV tools, and code utilities." },
    ]
  },
  {
    version: "v1.10.1",
    date: "June 25, 2026",
    title: "Hidden Tools Restored & Content Integrity",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "62 accidentally hidden tools restored. Content integrity test suite added to prevent future regressions. Duplicate entries cleaned up.",
    updates: [
      { type: "fix", text: "62 tools restored that were accidentally hidden — unit converters, time/date tools, color utilities, JSON/CSV tools, and code utilities." },
      { type: "fix", text: "23 duplicate tool entries removed. 6 broken tool links fixed. Category filtering corrected across all pages." },
      { type: "feature", text: "Content integrity test suite runs before every commit — catches broken tools, duplicate entries, and missing modules automatically." },
      { type: "fix", text: "Footer navigation links fixed — were invisible on hover in light mode." },
      { type: "fix", text: "509 tools with duplicate descriptions deduplicated." },
    ]
  },
  {
    version: "v1.9.0",
    date: "June 15, 2026",
    title: "830+ Tools — Full Catalog, Zero Empty Pages",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Tool catalog doubled to 830+. Every tool now has a real working page — zero 'Coming Soon' placeholders, zero broken links. 23 duplicates removed, 6 broken links fixed.",
    updates: [
      { type: "feature", text: "Catalog doubled to 830+ tools across 20 categories — every entry has a working page with real functionality." },
      { type: "fix", text: "23 duplicate entries removed. 6 broken tool links fixed. Category filtering corrected across all pages." },
      { type: "feature", text: "New CSV to SQL Terminal — upload CSV files and run SQL queries entirely in your browser." },
      { type: "feature", text: "New Vector Drawing Canvas — freeform drawing with pen, shapes, multi-page support, color picker, and SVG/PNG export." },
      { type: "fix", text: "EPUB to PDF converter restored. Time Converter moved to correct category." },
    ]
  },
  // ──────────────────────────────────────────────
  // MAY 2026
  // ──────────────────────────────────────────────
  {
    version: "v1.8.0",
    date: "May 26, 2026",
    title: "Category Filters, A-Z Sorting & Smart Megamenu",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Category filters now on every tool category page. A-Z alphabetical sorting. Megamenu shows your recently-used tools. CPM Calculator with presets for 7 social platforms.",
    updates: [
      { type: "feature", text: "Category filter buttons (Compress, Resize, Convert, Edit, AI) now available on every category page — not just Image and PDF." },
      { type: "feature", text: "A-Z alphabetical sorting on all category pages — dimmed letters for empty categories, works alongside search." },
      { type: "feature", text: "Megamenu 'Most used today' now shows your actual recently-used tools from browser history instead of hardcoded links." },
      { type: "feature", text: "CPM Calculator with presets for 7 social platforms — YouTube, Twitch, Facebook, Instagram, TikTok, Twitter/X, LinkedIn." },
      { type: "fix", text: "'Back to Privacy' link fixed — was going to Privacy Policy page instead of Privacy tools category." },
      { type: "feature", text: "New professional SVG favicon and PWA icons." },
    ]
  },
  {
    version: "v1.7.0",
    date: "May 15, 2026",
    title: "250 Format Converter Pages & Tool Differentiation",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Every format-to-format conversion now has its own dedicated page. Search 'PNG to WebP' or 'MP3 to WAV' and land directly on the right tool. 20+ high-traffic tools differentiated.",
    updates: [
      { type: "feature", text: "250 format-pair converter pages completed: 110 image pairs, 72 audio pairs, 42 document pairs, 20 video pairs, 6 data pairs — each with unique instructions and FAQs." },
      { type: "feature", text: "20+ popular tools given unique descriptions and how-to guides — word counter, image compressor, PDF compressor, video compressor, and more no longer look like clones." },
      { type: "feature", text: "Tool cards no longer display library/framework names — cleaner design, no competitive exposure." },
      { type: "fix", text: "Duplicate SVG-to-PNG entry removed. Link-in-bio builder duplicate fixed." },
      { type: "performance", text: "Sidebar converter count corrected — now accurately reflects all available converters." },
    ]
  },
  // ──────────────────────────────────────────────
  // APRIL 2026
  // ──────────────────────────────────────────────
  {
    version: "v1.6.0",
    date: "April 20, 2026",
    title: "Production Launch — Security, Mobile & SEO",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Platform locked down for production. Security headers, database provisioned, mobile responsiveness fixed across all tools, and SEO rewritten for search intent.",
    updates: [
      { type: "security", text: "CORS restricted to toolzum.com only — staging and localhost origins removed from production." },
      { type: "security", text: "Security headers added — prevents unauthorized script execution on all pages." },
      { type: "fix", text: "Mobile layout fixed across all tool pages — badges, navigation, hero sections, and URL shortener now work on small screens." },
      { type: "fix", text: "URL Shortener and Currency Converter moved to backend proxy — were broken by browser security restrictions." },
      { type: "performance", text: "SEO descriptions rewritten to match how people actually search — removed number prefixes, aligned with natural language." },
      { type: "fix", text: "Console warnings in 7 non-critical modules suppressed in production — clean console output." },
    ]
  },
  {
    version: "v1.5.1",
    date: "April 10, 2026",
    title: "Mobile Responsiveness & SEO Overhaul",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Mobile layout fixed across all tool pages. SEO descriptions rewritten to match natural search intent. AI crawler rules configured for discoverability.",
    updates: [
      { type: "fix", text: "Mobile layout fixed across all tool pages — badges, navigation, hero sections, and URL shortener now work on small screens." },
      { type: "performance", text: "SEO descriptions rewritten to match how people actually search — removed number prefixes, aligned with natural language." },
      { type: "security", text: "AI crawler rules configured — major AI models can now discover and index tool pages for referral traffic." },
      { type: "fix", text: "Console warnings in 7 non-critical modules suppressed in production." },
      { type: "fix", text: "Video converter output format corrected — proper codecs for WebM, AVI, and other formats." },
    ]
  },
  {
    version: "v1.5.0",
    date: "April 05, 2026",
    title: "Database & Auth Infrastructure",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Database provisioned with user, session, payment, and analytics tables. Authentication system wired with fallback URLs to prevent redirect loops.",
    updates: [
      { type: "feature", text: "Database tables provisioned: user accounts, sessions, payments, download usage, and analytics events." },
      { type: "fix", text: "Auth redirect loop fixed — fallback URL changed from localhost to production domain." },
      { type: "fix", text: "Video converter codec fixed — correct format used for each output type (WebM, AVI, etc.)." },
      { type: "fix", text: "Currency exchange rates moved to backend proxy with caching — live data instead of fallback rates." },
      { type: "fix", text: "XML Sitemap generator download bug fixed — files no longer fail on slow devices." },
    ]
  },
  // ──────────────────────────────────────────────
  // MARCH 2026
  // ──────────────────────────────────────────────
  {
    version: "v1.4.0",
    date: "March 24, 2026",
    title: "Fault-Tolerant Batch Processing",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Process 50 files at once without worry. If one file is corrupted or too large, it's automatically skipped and the rest keep processing. Large files get a warning before processing.",
    updates: [
      { type: "feature", text: "Memory-pressure warning on devices with less than 4 GB RAM — prevents crashes before they happen." },
      { type: "feature", text: "Large file confirmation dialogs (>100 MB) with device memory info across video, PDF, and image modules." },
      { type: "performance", text: "Fault-tolerant batch engine: corrupted files are auto-skipped, the batch continues, and failures are reported at the end." },
      { type: "security", text: "Out-of-memory errors caught explicitly with a clear recovery message instead of a silent browser freeze." },
    ]
  },
  {
    version: "v1.3.1",
    date: "March 20, 2026",
    title: "Bulk Document Processing & OCR",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Document-focused bulk tools added: PDF merge/reduce, OCR text extraction, ebook conversion. BatchProgressPanel added across all bulk modules.",
    updates: [
      { type: "feature", text: "Bulk PDF merge and reduce — combine multiple PDFs or shrink file sizes in batch." },
      { type: "feature", text: "OCR text extraction from images and PDFs — runs entirely in your browser." },
      { type: "feature", text: "Ebook format conversion added to bulk processing suite." },
      { type: "performance", text: "BatchProgressPanel added to all bulk modules — real-time progress, fault isolation, and per-file status." },
      { type: "fix", text: "Bulk audio format conversion fixed — correct codecs used for each output format." },
    ]
  },
  {
    version: "v1.3.0",
    date: "March 13, 2026",
    title: "30 Bulk Processing Tools",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "All 30 bulk processing tools live. Compress videos, reduce file sizes, burn subtitles, convert images to PDF, merge documents, run OCR — all in your browser. Pro users get parallel processing and ZIP downloads.",
    updates: [
      { type: "feature", text: "Batch video processing — compress, resize, and add subtitles to multiple videos simultaneously." },
      { type: "feature", text: "20+ new bulk tools: image resize/compress, PDF merge/reduce, OCR text extraction, ebook conversion, audio format conversion, and face anonymization." },
      { type: "feature", text: "Pro users download entire batches as a single ZIP file. Free users get per-file downloads." },
      { type: "performance", text: "Pro tier unlocks 6x parallel processing — process 12 files in the time free users process 2." },
    ]
  },
  // ──────────────────────────────────────────────
  // FEBRUARY 2026
  // ──────────────────────────────────────────────
  {
    version: "v1.2.1",
    date: "February 28, 2026",
    title: "230+ Tools Milestone & Registry Cleanup",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Catalog crossed 230 tools across 21 categories. Duplicate entries cleaned up, broken links fixed, and category filtering corrected.",
    updates: [
      { type: "feature", text: "Catalog crossed 230 tools across 21 categories with full working pages." },
      { type: "fix", text: "Duplicate tool entries removed across all categories." },
      { type: "fix", text: "Broken tool links fixed — all entries now route to working pages." },
      { type: "fix", text: "Category filtering corrected — subcategories now show accurate tool counts." },
      { type: "performance", text: "Tool card rendering optimized — faster page loads on category listing pages." },
    ]
  },
  {
    version: "v1.2.0",
    date: "February 20, 2026",
    title: "Design Studio & Enterprise Security",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Design tools launched: SVG editor, Logo Maker, AI Thumbnail Maker. Enterprise security headers added. Offline mode indicator. Zero data collection verified.",
    updates: [
      { type: "feature", text: "Design studio: SVG Vector Editor, Logo Maker, AI Thumbnail Maker with drag-and-drop canvas, templates, and export presets." },
      { type: "security", text: "Content-Security-Policy headers lock down script execution — no unauthorized scripts can run." },
      { type: "feature", text: "Offline mode indicator shows persistent banner — all processing works even when WiFi drops." },
      { type: "performance", text: "Image background removal migrated to local execution — 4x faster, still zero uploads." },
      { type: "security", text: "Zero data collection verified across all tools — no analytics pings, no third-party requests." },
    ]
  },
  {
    version: "v1.1.1",
    date: "February 11, 2026",
    title: "PDF Office Suite — 230+ Tools",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Full PDF office suite launched: Word-to-PDF, PDF-to-Word, PDF-to-JPG, and page editing. All 100% client-side with no server uploads.",
    updates: [
      { type: "feature", text: "PDF office suite: Word-to-PDF, PDF-to-Word, PDF-to-JPG, and PDF page editing — fully client-side." },
      { type: "feature", text: "Catalog crossed 230 tools across 21 categories." },
      { type: "fix", text: "Video converter output format corrected — proper codecs for WebM, AVI, and other formats." },
      { type: "fix", text: "Currency converter exchange rates now fetched from backend with caching — live data instead of stale fallbacks." },
    ]
  },
  // ──────────────────────────────────────────────
  // JANUARY 2026
  // ──────────────────────────────────────────────
  {
    version: "v1.1.0",
    date: "January 20, 2026",
    title: "Developer Toolbox & Offline Caching",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "New developer tools with syntax highlighting. Offline caching enabled — tools load instantly even without a connection.",
    updates: [
      { type: "feature", text: "Developer tools: SQL, JSON, and CSS formatters and minifiers with syntax highlighting and error detection." },
      { type: "feature", text: "Offline caching enabled across all page routes — tools and pages load instantly even without WiFi." },
      { type: "fix", text: "XML sitemap generator blob URL race condition fixed — downloads no longer fail on slow devices." },
    ]
  },
  {
    version: "v1.0.1",
    date: "January 09, 2026",
    title: "Finance Tools & Currency Exchange",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "New business finance tools: SaaS pricing calculator, ROI simulator, and live currency exchange rates.",
    updates: [
      { type: "feature", text: "Business finance: SaaS pricing calculator, employee turnover tracker, ROI simulator." },
      { type: "feature", text: "Live currency exchange rates with backend caching for reliability." },
      { type: "fix", text: "PDF.js memory leak fixed — prolonged use no longer degrades browser performance." },
    ]
  },
  // ──────────────────────────────────────────────
  // DECEMBER 2025
  // ──────────────────────────────────────────────
  {
    version: "v1.0.0",
    date: "December 15, 2025",
    title: "Platform Launch — Privacy-First Web Utilities",
    tag: "launch",
    tagColor: "bg-emerald-700/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    description: "Toolzum launched with a simple premise: every tool runs in your browser, not on a server. No uploading confidential files to black-box servers for simple resize, crop, or hashing operations.",
    updates: [
      { type: "feature", text: "50 tools at launch: hashing, text processing, image compression, format conversion, and random generators." },
      { type: "security", text: "Verified zero data exfiltration — no packets leave your device during any tool execution." },
      { type: "performance", text: "Each tool loads independently — initial page load kept under 100KB." },
    ]
  },
  // ──────────────────────────────────────────────
  // NOVEMBER 2025
  // ──────────────────────────────────────────────
  {
    version: "v0.10.0",
    date: "November 18, 2025",
    title: "Tool Expansion & Payment Integration",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Catalog doubled to 50 tools based on closed-beta feedback. Payment integration stabilized for Indian subscriptions.",
    updates: [
      { type: "feature", text: "Catalog expanded from 25 to 50 tools: image resizer, PDF merger, QR code generator, password generator, JSON formatter, base64 encoder/decoder." },
      { type: "feature", text: "Payment integration stabilized — subscription webhooks, retry logic, and invoice generation automated." },
      { type: "fix", text: "PDF.js memory leak fixed — prolonged use no longer degrades browser performance." },
      { type: "performance", text: "Code-splitting improved — each tool loads independently, reducing initial page load by 40%." },
    ]
  },
  // ──────────────────────────────────────────────
  // OCTOBER 2025
  // ──────────────────────────────────────────────
  {
    version: "v0.9.0",
    date: "October 12, 2025",
    title: "Private Beta — Foundation & Core Architecture",
    tag: "launch",
    tagColor: "bg-emerald-700/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    description: "Closed beta with 25 tools. All processing happens in your browser — zero uploads. Pro subscription model with payment gateways for India and global users.",
    updates: [
      { type: "feature", text: "25 tools across PDF, Image, Video, Audio, and Text — all running entirely in your browser." },
      { type: "feature", text: "Pro subscription model with payment support for India (UPI) and global cards." },
      { type: "feature", text: "Core processing engine: PDF handling, video/audio processing, and OCR — all client-side." },
      { type: "performance", text: "Dynamic module loading — tools load on demand, keeping initial page under 100KB." },
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
