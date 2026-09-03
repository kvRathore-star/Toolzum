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
  // ══════════════════════════════════════════════
  // SEPTEMBER 2026
  // ══════════════════════════════════════════════
  {
    version: "v2.3.0",
    date: "September 03, 2026",
    title: "Security Lockdown & 30 New Tools",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "The admin panel gets real security — IP restrictions, session control, and confirmation safeguards. 30 new tools ship including AI-powered watermark removal and bulk PDF operations. The homepage upload experience is completely rebuilt.",
    updates: [
      { type: "security", text: "Admin panel restricted by IP — only trusted networks can access admin routes via ADMIN_IPS environment variable." },
      { type: "security", text: "Admin role changes require typing the user's exact email to confirm — eliminates accidental privilege changes." },
      { type: "feature", text: "Session management: view active sessions per user (device, IP, expiry) and force-logout lost or stolen devices." },
      { type: "feature", text: "30+ new tools: bulk image upscaling, HEIC/AVIF conversion, AI watermark removal (single + batch), bulk PDF operations, and text utilities." },
      { type: "feature", text: "Homepage upload redesigned — format badges (IMG, VID, PDF, DOC, AUD) at a glance, privacy notice, smarter file routing." },
      { type: "fix", text: "Sign-in fixed — users no longer appear logged out after authenticating. Session detection corrected across client and server." },
      { type: "fix", text: "Middleware ban enforcement fixed — banned users could previously access API routes in production." },
    ]
  },
  // ══════════════════════════════════════════════
  // AUGUST 2026
  // ══════════════════════════════════════════════
  {
    version: "v2.2.0",
    date: "August 25, 2026",
    title: "Calculator Renaissance",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Every calculator on the platform gets a premium upgrade — two-column layouts, result history, one-click copy, and auto-calculate mode. A full accessibility pass ensures every tool works for every user.",
    updates: [
      { type: "feature", text: "Calculators redesigned: two-column layout with result panel, one-click copy/download, calculation history, and presets across 80+ calculators." },
      { type: "feature", text: "Auto-calculate across health, finance, and math tools — results appear as you type, no Calculate button needed." },
      { type: "fix", text: "Calculation accuracy improved across 20+ tools — edge cases like empty inputs, impossible values, NaN, and overflow handled gracefully." },
      { type: "fix", text: "Accessibility pass: screen reader support, keyboard navigation, and proper labels added to all interactive elements across 39 tools." },
      { type: "performance", text: "Page loads faster — heavy code removed from initial bundles, images optimized to WebP, tools load on demand." },
      { type: "fix", text: "Gas mileage NaN bug, fraction calculator stack overflow, and modulo computation errors all resolved." },
    ]
  },
  {
    version: "v2.1.1",
    date: "August 18, 2026",
    title: "Admin Panel — Search, Bulk Actions & Audit Trail",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "The admin panel goes from basic to production-ready. Search users, run bulk actions, export data to CSV, and review the full audit trail. Rate limiting and last-admin protection prevent abuse.",
    updates: [
      { type: "feature", text: "Admin panel: search users by name or email, paginated results, bulk ban/unban/delete actions, CSV export." },
      { type: "security", text: "Rate limiting added to all admin API endpoints — prevents abuse and brute-force attacks." },
      { type: "security", text: "Last-admin protection — cannot remove the last remaining admin account." },
      { type: "feature", text: "Audit log viewer with full history of role changes, bans, and credit edits." },
      { type: "fix", text: "Admin sidebar navigation improved — Back to Toolzum link at bottom, mobile responsive." },
      { type: "fix", text: "Admin layout fixed — Header and Footer hidden on admin pages for a cleaner interface." },
    ]
  },
  {
    version: "v2.1.0",
    date: "August 11, 2026",
    title: "Auth Rebuilt From Scratch & Account System",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Google sign-in was broken for weeks. Instead of patching, we rebuilt the entire auth flow from scratch. The admin panel launches alongside a full account system with profile editing, favorites, and bot protection.",
    updates: [
      { type: "fix", text: "Google sign-in rebuilt from scratch — fixed redirect issues, session persistence, and cookie conflicts that were breaking authentication for all users." },
      { type: "feature", text: "Admin panel launched: manage users, view subscriptions, edit credits, ban/unban, GDPR delete, and full audit trail with search and pagination." },
      { type: "feature", text: "Account page: edit profile, change password, manage active sessions, export favorites, and delete your account." },
      { type: "feature", text: "Favorites system: star any tool, see them on your homepage, and jump to them instantly from search (Cmd+K)." },
      { type: "security", text: "Bot protection (Turnstile CAPTCHA) added to sign-up, sign-in, and password reset flows." },
    ]
  },
  // ══════════════════════════════════════════════
  // JULY 2026
  // ══════════════════════════════════════════════
  {
    version: "v2.0.1",
    date: "July 25, 2026",
    title: "Tool Count Accuracy Fix",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "The header claimed '1090+ tools' but results showed '856'. Every count on the page — header, category sidebars, and results — now shows the same accurate number.",
    updates: [
      { type: "fix", text: "Tool counts now consistent everywhere — header, subtitle, category sidebars, and results all show the same number." },
      { type: "fix", text: "Category sidebar and menubar counts now show only visible tools, not hidden redirect entries." },
      { type: "fix", text: "Search engine metadata and structured data (page title, Open Graph) now use accurate counts." },
      { type: "fix", text: "Category navigation no longer lists empty categories that only contained hidden entries." },
      { type: "fix", text: "Footer navigation links fixed — were invisible on hover in light mode." },
    ]
  },
  {
    version: "v2.0.0",
    date: "July 07, 2026",
    title: "Premium Tools & Indian Market Launch",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "The platform's biggest feature drop. CalculatorShell framework powers 80+ calculators with premium UX. Three flagship premium tools launch. Indian Utilities category completed with UPI, Aadhaar, and vehicle registration tools.",
    updates: [
      { type: "feature", text: "CalculatorShell framework: history panel, keyboard shortcuts, result memory, and one-click copy across 80+ calculators." },
      { type: "feature", text: "Premium SaaS Metrics Dashboard — interactive KPI cards, SVG charts, scenario modeling, and PDF export. Privacy-first, no server round trips." },
      { type: "feature", text: "Premium API Builder/Tester — request collections, code snippet generation, environment variables, and privacy-first execution." },
      { type: "feature", text: "Premium PDF Workflow Builder — merge, split, fill forms, rearrange pages, optimize, and edit metadata in a single drag-and-drop workspace." },
      { type: "feature", text: "Indian Utilities completed: UPI ID Validator, Indian Address Parser, Vehicle Registration Checker, Aadhaar Validator, and Investment Calculator." },
      { type: "feature", text: "Bulk URL Shortener — shorten multiple URLs at once with custom aliases, click tracking, and CSV export." },
      { type: "fix", text: "22 health tools moved from Calculator to their own Health category. Video converter tool restored from incorrect hiding." },
    ]
  },
  // ══════════════════════════════════════════════
  // JUNE 2026
  // ══════════════════════════════════════════════
  {
    version: "v1.10.1",
    date: "June 25, 2026",
    title: "62 Hidden Tools Restored & Quality Gate",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "62 tools were accidentally hidden from the catalog. All restored. A new content integrity test suite now runs before every commit to prevent this from happening again.",
    updates: [
      { type: "fix", text: "62 tools restored that were accidentally hidden — unit converters, time/date tools, color utilities, JSON/CSV tools, and code utilities." },
      { type: "fix", text: "23 duplicate tool entries removed. 6 broken tool links fixed. Category filtering corrected across all pages." },
      { type: "feature", text: "Content integrity test suite runs before every commit — catches broken tools, duplicate entries, and missing modules automatically." },
      { type: "fix", text: "509 tools with duplicate descriptions deduplicated — each tool now has a unique, accurate description." },
      { type: "feature", text: "Test suite now catches duplicate entries and broken links before they reach production." },
    ]
  },
  {
    version: "v1.10.0",
    date: "June 15, 2026",
    title: "Production Security & Sitemap Launch",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Security headers deployed across all pages. Automated sitemap generated with 876+ URLs. AI crawler rules configured. The platform is now production-hardened.",
    updates: [
      { type: "security", text: "Content-Security-Policy headers added — prevents unauthorized script execution on all pages." },
      { type: "security", text: "X-Frame-Options and X-Content-Type-Options headers added — prevents clickjacking and MIME-type attacks." },
      { type: "feature", text: "Automated sitemap generation with 876+ URLs, plus AI crawler rules for discoverability." },
      { type: "feature", text: "Sitemap submitted to Google Search Console — accelerates indexing of all tool pages." },
      { type: "performance", text: "Batch processing hardened: a single corrupted or broken file is auto-skipped instead of crashing the entire batch." },
      { type: "fix", text: "Broken internal links across 15 category pages corrected." },
    ]
  },
  // ══════════════════════════════════════════════
  // MAY 2026
  // ══════════════════════════════════════════════
  {
    version: "v1.9.0",
    date: "June 08, 2026",
    title: "830+ Tools — Every Page Now Works",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "The catalog doubles to 830+ tools. Every single one has a working page — zero 'Coming Soon' placeholders, zero broken links. New CSV-to-SQL terminal and vector drawing canvas ship.",
    updates: [
      { type: "feature", text: "Catalog doubled to 830+ tools across 20 categories — every entry has a working page with real functionality." },
      { type: "feature", text: "New CSV to SQL Terminal — upload CSV files and run SQL queries entirely in your browser." },
      { type: "feature", text: "New Vector Drawing Canvas — freeform drawing with pen, shapes, multi-page support, color picker, and SVG/PNG export." },
      { type: "fix", text: "EPUB to PDF converter restored. Time Converter moved to correct category." },
      { type: "fix", text: "Category sidebar counts corrected — no longer inflated by hidden or duplicate entries." },
      { type: "performance", text: "Category listing pages load 30% faster — redundant data fetching removed." },
    ]
  },
  {
    version: "v1.8.0",
    date: "May 26, 2026",
    title: "Category Filters, A-Z Sorting & Smart Megamenu",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Every category page gets filter buttons. A-Z sorting lands. The megamenu starts showing your recently-used tools instead of hardcoded links. CPM Calculator ships with presets for 7 social platforms.",
    updates: [
      { type: "feature", text: "Category filter buttons (Compress, Resize, Convert, Edit, AI) now available on every category page — not just Image and PDF." },
      { type: "feature", text: "A-Z alphabetical sorting on all category pages — dimmed letters for empty categories, works alongside search." },
      { type: "feature", text: "Megamenu 'Most used today' now shows your actual recently-used tools from browser history instead of hardcoded links." },
      { type: "feature", text: "CPM Calculator with presets for 7 social platforms — YouTube, Twitch, Facebook, Instagram, TikTok, Twitter/X, LinkedIn." },
      { type: "fix", text: "'Back to Privacy' link fixed — was going to Privacy Policy page instead of Privacy tools category." },
      { type: "feature", text: "New professional SVG favicon and PWA icons across all device sizes." },
    ]
  },
  {
    version: "v1.7.0",
    date: "May 15, 2026",
    title: "250 Format Converter Pages & Tool Identity",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Search 'PNG to WebP' or 'MP3 to WAV' and land directly on the right tool — 250 dedicated format-pair pages ship. The 20 most popular tools get unique descriptions and how-to guides instead of generic clones.",
    updates: [
      { type: "feature", text: "250 format-pair converter pages: 110 image pairs, 72 audio pairs, 42 document pairs, 20 video pairs, 6 data pairs — each with unique instructions and FAQs." },
      { type: "feature", text: "20+ popular tools given unique descriptions and how-to guides — word counter, image compressor, PDF compressor, video compressor, and more no longer look like clones." },
      { type: "feature", text: "Tool cards no longer display library/framework names — cleaner design, no competitive exposure." },
      { type: "fix", text: "Duplicate SVG-to-PNG entry removed. Link-in-bio builder duplicate fixed." },
      { type: "performance", text: "Sidebar converter count corrected — now accurately reflects all available converters." },
      { type: "fix", text: "Category pages now show accurate tool counts in both header and sidebar." },
    ]
  },
  // ══════════════════════════════════════════════
  // APRIL 2026
  // ══════════════════════════════════════════════
  {
    version: "v1.6.0",
    date: "April 20, 2026",
    title: "Production Launch — Locked Down & Live",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "CORS locked to toolzum.com. Security headers deployed. Mobile responsiveness fixed across all tools. SEO rewritten for real search intent. The platform is now production-ready.",
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
    title: "Mobile Fixes, SEO Overhaul & AI Crawlers",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Mobile layout corrected across all tool pages. SEO metadata rewritten for natural search language. AI crawler rules configured for major models — tools are now discoverable by ChatGPT, Perplexity, and others.",
    updates: [
      { type: "fix", text: "Mobile layout corrected across tool pages — badges, navigation, and hero sections now display properly on small screens." },
      { type: "performance", text: "SEO metadata updated to match natural search language — descriptions align with how users actually search." },
      { type: "feature", text: "AI crawler rules configured for major models — improves tool discoverability and referral traffic." },
      { type: "fix", text: "Console warnings in 7 non-critical modules suppressed in production." },
      { type: "fix", text: "Scientific Calculator grid layout restored — buttons were misaligned on tablets." },
    ]
  },
  {
    version: "v1.5.0",
    date: "April 05, 2026",
    title: "Database & Auth Infrastructure",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "The backend foundation lands. Database tables provisioned for users, sessions, payments, and analytics. Authentication wired with production-ready fallback URLs.",
    updates: [
      { type: "feature", text: "Database tables provisioned: user accounts, sessions, payments, download usage, and analytics events." },
      { type: "fix", text: "Auth redirect loop fixed — fallback URL changed from localhost to production domain." },
      { type: "fix", text: "Currency exchange rates moved to backend proxy with caching — live data instead of fallback rates." },
      { type: "fix", text: "XML Sitemap generator download bug fixed — files no longer fail on slow devices." },
      { type: "fix", text: "Video converter output format corrected — proper codecs for WebM, AVI, and other formats." },
    ]
  },
  // ══════════════════════════════════════════════
  // MARCH 2026
  // ══════════════════════════════════════════════
  {
    version: "v1.4.0",
    date: "March 24, 2026",
    title: "Fault-Tolerant Batch Processing",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Process 50 files at once without worry. One corrupted file no longer crashes the entire batch — it's auto-skipped and the rest keep going. Low-memory devices get a warning before processing starts.",
    updates: [
      { type: "performance", text: "Fault-tolerant batch engine: corrupted files are auto-skipped, the batch continues, and failures are reported at the end." },
      { type: "feature", text: "Memory-pressure warning on devices with less than 4 GB RAM — prevents crashes before they happen." },
      { type: "feature", text: "Large file confirmation dialogs (>100 MB) with device memory info across video, PDF, and image modules." },
      { type: "security", text: "Out-of-memory errors caught explicitly with a clear recovery message instead of a silent browser freeze." },
      { type: "fix", text: "Batch processing no longer stalls when a single file exceeds available memory." },
    ]
  },
  {
    version: "v1.3.1",
    date: "March 20, 2026",
    title: "Bulk Documents, OCR & Ebook Conversion",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Document-focused bulk tools land: PDF merge/reduce, multi-language OCR, and ebook format conversion. BatchProgressPanel gives real-time progress across all bulk modules.",
    updates: [
      { type: "feature", text: "Bulk PDF merge and reduce — combine multiple PDFs or shrink file sizes in batch." },
      { type: "feature", text: "OCR text extraction from images and PDFs — runs entirely in your browser with multi-language support." },
      { type: "feature", text: "Ebook format conversion: EPUB to PDF, MOBI to EPUB, and AZW3 to PDF — all client-side." },
      { type: "performance", text: "BatchProgressPanel with real-time progress bars, fault isolation, and per-file status across all bulk modules." },
      { type: "fix", text: "Bulk audio format conversion fixed — correct codecs used for each output format." },
    ]
  },
  {
    version: "v1.3.0",
    date: "March 13, 2026",
    title: "30 Bulk Processing Tools Ship",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "All 30 bulk processing tools go live. Compress videos, reduce file sizes, burn subtitles, convert images to PDF, merge documents, run OCR — all in your browser. Pro users get parallel processing and ZIP downloads.",
    updates: [
      { type: "feature", text: "Batch video processing — compress, resize, and add subtitles to multiple videos simultaneously." },
      { type: "feature", text: "20+ new bulk tools: image resize/compress, PDF merge/reduce, OCR text extraction, ebook conversion, audio format conversion, and face anonymization." },
      { type: "feature", text: "Pro users download entire batches as a single ZIP file. Free users get per-file downloads." },
      { type: "performance", text: "Pro tier unlocks 6x parallel processing — process 12 files in the time free users process 2." },
      { type: "fix", text: "Batch processing memory leak fixed — prolonged use no longer degrades browser performance." },
    ]
  },
  // ══════════════════════════════════════════════
  // FEBRUARY 2026
  // ══════════════════════════════════════════════
  {
    version: "v1.2.1",
    date: "February 28, 2026",
    title: "230+ Tools Milestone & Catalog Cleanup",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "The catalog crosses 230 tools across 21 categories. Duplicate entries cleaned up, broken links fixed, and category filtering corrected. The platform is now catalog-ready.",
    updates: [
      { type: "feature", text: "Catalog crossed 230 tools across 21 categories with full working pages." },
      { type: "fix", text: "Duplicate tool entries removed across all categories." },
      { type: "fix", text: "Broken tool links fixed — all entries now route to working pages." },
      { type: "fix", text: "Category filtering corrected — subcategories now show accurate tool counts." },
      { type: "performance", text: "Tool card rendering optimized — faster page loads on category listing pages." },
      { type: "fix", text: "Missing tool thumbnails added across 40+ entries." },
    ]
  },
  {
    version: "v1.2.0",
    date: "February 20, 2026",
    title: "Design Studio & Enterprise Security",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "The design tools launch — SVG editor, Logo Maker, AI Thumbnail Maker with drag-and-drop canvas and templates. Enterprise security headers lock down script execution. Zero data collection verified.",
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
    title: "PDF Office Suite — Word, Excel, Images",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "A full PDF office suite launches — Word-to-PDF, PDF-to-Word, PDF-to-JPG, and page editing. All 100% client-side with no server uploads. The catalog crosses 230 tools.",
    updates: [
      { type: "feature", text: "PDF office suite: Word-to-PDF, PDF-to-Word, PDF-to-JPG, and PDF page editing — fully client-side." },
      { type: "feature", text: "Catalog crossed 230 tools across 21 categories." },
      { type: "feature", text: "PDF page editing supports drag-and-drop page reordering and rotation." },
      { type: "fix", text: "Currency converter exchange rates now fetched from backend with caching — live data instead of stale fallbacks." },
      { type: "fix", text: "PDF.js memory leak fixed — prolonged use no longer degrades browser performance." },
    ]
  },
  // ══════════════════════════════════════════════
  // JANUARY 2026
  // ══════════════════════════════════════════════
  {
    version: "v1.1.0",
    date: "January 20, 2026",
    title: "Developer Toolbox & Offline Mode",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "New developer tools land — SQL, JSON, and CSS formatters with syntax highlighting. Offline caching enabled across all routes — tools load instantly even without a connection.",
    updates: [
      { type: "feature", text: "Developer tools: SQL, JSON, and CSS formatters and minifiers with syntax highlighting and error detection." },
      { type: "feature", text: "Offline caching enabled across all page routes — tools and pages load instantly even without WiFi." },
      { type: "feature", text: "Developer tools now support syntax highlighting for 10+ languages — Python, JavaScript, TypeScript, Go, Rust, and more." },
      { type: "fix", text: "XML sitemap generator blob URL race condition fixed — downloads no longer fail on slow devices." },
      { type: "fix", text: "Category sidebar tool counts now update in real-time when filters are applied." },
    ]
  },
  {
    version: "v1.0.1",
    date: "January 09, 2026",
    title: "Finance Tools & Live Exchange Rates",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Business finance tools land — SaaS pricing calculator, ROI simulator, and employee turnover tracker. Currency exchange rates now fetched live from a backend proxy instead of stale fallbacks.",
    updates: [
      { type: "feature", text: "Business finance tools: SaaS pricing calculator, employee turnover tracker, ROI simulator." },
      { type: "feature", text: "Live currency exchange rates with backend caching for reliability." },
      { type: "feature", text: "PDF.js updated to latest stable release — improved rendering accuracy and memory management." },
      { type: "fix", text: "Category tool counts now accurate after finance tools addition." },
      { type: "fix", text: "Search indexing updated to include new finance tools in results." },
    ]
  },
  // ══════════════════════════════════════════════
  // DECEMBER 2025
  // ══════════════════════════════════════════════
  {
    version: "v1.0.0",
    date: "December 15, 2025",
    title: "Public Launch — Zero Uploads, Zero Compromises",
    tag: "launch",
    tagColor: "bg-emerald-700/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    description: "Toolzum goes public with 50 tools. The promise: every tool runs in your browser, not on a server. No uploading confidential files to black-box servers for simple resize, crop, or hashing operations.",
    updates: [
      { type: "feature", text: "50 tools at launch: hashing, text processing, image compression, format conversion, and random generators." },
      { type: "security", text: "Verified zero data exfiltration — no packets leave your device during any tool execution." },
      { type: "performance", text: "Each tool loads independently — initial page load kept under 100KB." },
      { type: "feature", text: "Browser-native file handling — drag and drop or click to select, no file upload dialogs." },
      { type: "feature", text: "Responsive design across desktop, tablet, and mobile — tools work on any device." },
    ]
  },
  // ══════════════════════════════════════════════
  // NOVEMBER 2025
  // ══════════════════════════════════════════════
  {
    version: "v0.10.0",
    date: "November 18, 2025",
    title: "Catalog Doubles, Payments Stabilized",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Closed-beta feedback drives the catalog from 25 to 50 tools. Payment integration stabilized for Indian subscriptions — webhooks, retry logic, and invoice generation all automated.",
    updates: [
      { type: "feature", text: "Catalog expanded from 25 to 50 tools: image resizer, PDF merger, QR code generator, password generator, JSON formatter, base64 encoder/decoder." },
      { type: "feature", text: "Payment integration stabilized — subscription webhooks, retry logic, and invoice generation automated." },
      { type: "performance", text: "Code-splitting improved — each tool loads independently, reducing initial page load by 40%." },
      { type: "fix", text: "Mobile layout corrected — tools now display properly on screens smaller than 768px." },
      { type: "feature", text: "Image resizer now supports batch mode — resize multiple images to the same dimensions at once." },
    ]
  },
  // ══════════════════════════════════════════════
  // OCTOBER 2025
  // ══════════════════════════════════════════════
  {
    version: "v0.9.0",
    date: "October 12, 2025",
    title: "Private Beta — The Foundation",
    tag: "launch",
    tagColor: "bg-emerald-700/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    description: "Closed beta launches with 25 tools. The core engine is built: PDF handling, video/audio processing, OCR — all client-side. Pro subscription model with payment support for India (UPI) and global cards.",
    updates: [
      { type: "feature", text: "25 tools across PDF, Image, Video, Audio, and Text — all running entirely in your browser." },
      { type: "feature", text: "Pro subscription model with payment support for India (UPI) and global cards." },
      { type: "feature", text: "Core processing engine: PDF handling, video/audio processing, and OCR — all client-side." },
      { type: "performance", text: "Dynamic module loading — tools load on demand, keeping initial page under 100KB." },
      { type: "feature", text: "Drag-and-drop file handling across all tools — no file upload dialogs, no server round trips." },
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
