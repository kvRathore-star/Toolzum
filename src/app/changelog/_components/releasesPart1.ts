import type { Release } from "./releaseTypes";

export const RELEASES_PART_1: Release[] = [
  {
    version: "v2.5.0",
    date: "September 16, 2026",
    title: "Trust & Resilience Program",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Privacy policies rewritten to match reality, a consent banner that actually disables analytics, admin conversion funnels, instant kill-switches, and an offline page that works when pages don't load.",
    updates: [
      { type: "feature", text: "Consent banner Decline now truly disables analytics — plus a reset button to revisit your choice anytime." },
      { type: "feature", text: "Admin conversion funnels: signup-to-first-tool, quota-wall-to-Pro, and credit-wall-to-Pro." },
      { type: "feature", text: "Instant kill-switches for AI features with an admin control page — no rebuild to pause." },
      { type: "feature", text: "Offline fallback page: uncached visits show a helpful page instead of a browser error." },
      { type: "feature", text: "Onboarding tour fixed on mobile; search and dashboard empty states guide you onward." },
      { type: "fix", text: "Legal pages audited line-by-line against the live product; subscription, copyright, and children's terms added." },
      { type: "fix", text: "AI errors now say you're offline when you are — and never auto-retry paid requests." },
      { type: "security", text: "Bot-rate guards on AI endpoints, repaired abuse logging, Next.js security upgrade." },
    ]
  },
  // ══════════════════════════════════════════════
  // SEPTEMBER 2026
  // ══════════════════════════════════════════════
  {
    version: "v2.4.0",
    date: "September 11, 2026",
    title: "Accessibility Pass, Live Credits & Adaptive WASM",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Every form field announces its name to screen readers. Credit balances go live instead of day-old snapshots. Low-end devices skip the heavy video engine. Quota copy finally tells the truth about who you are.",
    updates: [
      { type: "feature", text: "Form labels bound for screen readers across 800+ inputs — fields announce their names instead of silence." },
      { type: "feature", text: "Skip link jumps past navigation on every page; dialogs trap focus, close on Escape, and return focus on dismiss." },
      { type: "feature", text: "Live credit balances — dashboard and account read true remaining credits from the server ('X remaining of 300/mo')." },
      { type: "fix", text: "Download badge reads server plan state — Pro users never see quota copy; anonymous users on Pro tools get 'Sign in' instead of 'used up'." },
      { type: "performance", text: "Low-end devices skip the multi-threaded video core and get heads-up toasts before large AI and OCR downloads." },
      { type: "fix", text: "Contract suites added for credits and downloads endpoints — 1,141 tests green across 196 files." },
      { type: "fix", text: "Beyond-plan catches from the same pass: palette Space hijack fixed with focus-return on close; dropzones, indexed rows, and selects named; hidden file inputs keyboard-focusable; 294 controls labeled from nearby text; hover/drag-only containers keyboard-accessible." },
    ]
  },
  {
    version: "v2.3.0",
    date: "September 03, 2026",
    title: "Admin Command Center & Platform Hardening",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "The admin panel becomes a real command center — user detail slide-out with credits, ban/unban, plan management, payment history, session control, and role audit trail. Platform-wide payments dashboard with search and filters. Error telemetry catches issues before users report them. Accessibility and performance hardened for 100k+ users.",
    demo: "tool-expansion",
    updates: [
      { type: "feature", text: "Admin user detail slide-out: edit credits, change plans, ban/unban, GDPR delete, payment history, active sessions, and role change audit trail — all in one panel." },
      { type: "feature", text: "Platform-wide payments dashboard — browse, search, and filter all transactions by name, email, order ID, or payment status." },
      { type: "feature", text: "Error telemetry — client-side error capture with admin dashboard view, grouped by tool, source, and message." },
      { type: "security", text: "Admin panel restricted to allowlisted admin emails — unauthorized accounts cannot reach admin APIs." },
      { type: "security", text: "Admin role changes require typing the user's exact email to confirm — eliminates accidental privilege changes." },
      { type: "security", text: "Session management: view active sessions per user (device, IP, expiry) and force-logout lost or stolen devices." },
      { type: "feature", text: "30+ new tools: bulk image upscaling, HEIC/AVIF conversion, AI watermark removal (single + batch), bulk PDF operations, and text utilities." },
      { type: "feature", text: "Homepage upload box improved — keyboard accessible (Tab + Enter), proper ARIA labels, animated file detection, better Remove button." },
      { type: "performance", text: "Database indexes applied for 100k+ scalability — user, payment, and session tables optimized for admin queries." },
      { type: "fix", text: "Admin API field name fixes — roleHistory, lastLoginAt, status now correctly returned from user detail endpoint." },
      { type: "fix", text: "Ban/unban API mismatch fixed — frontend now sends correct status field matching the API contract." },
      { type: "fix", text: "Close button on slide-out panel now sits above backdrop blur layer. Escape key also works." },
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
    description: "Every calculator on the platform gets a premium upgrade — two-column layouts, result history, auto-calculate. A full accessibility pass ensures every tool works for every user. Quality catches up to quantity.",
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
    description: "The admin panel goes from basic to production-ready. Search users, run bulk actions, export to CSV, review the full audit trail. Running a multi-user platform becomes manageable.",
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
    description: "Google sign-in was broken for weeks. Instead of patching, we rebuilt the entire auth flow from scratch. The admin panel launches alongside a full account system. Users finally have identities.",
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
    description: "The header claimed '1090+ tools' but results showed '856'. Every count on the page now shows the same accurate number. Trust details matter when you're asking users to rely on your product.",
    updates: [
      { type: "fix", text: "Tool counts now consistent everywhere — header, subtitle, category sidebars, and results all show the same number." },
      { type: "fix", text: "Category sidebar and menubar counts now show only visible tools, not hidden redirect entries." },
      { type: "fix", text: "Search engine metadata and structured data (page title, Open Graph) now use accurate counts." },
      { type: "fix", text: "Category navigation no longer lists empty categories that only contained hidden entries." },
      { type: "performance", text: "Page load time improved by removing redundant count calculations." },
    ]
  },
  {
    version: "v2.0.0",
    date: "July 07, 2026",
    title: "Premium Tools & Indian Market Launch",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "The platform's biggest feature drop. CalculatorShell framework powers 80+ calculators with premium UX. Three flagship premium tools launch. Indian Utilities category completes. Toolzum stops being a utility and starts being a platform.",
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
    description: "62 tools were accidentally hidden from the catalog. All restored. A content integrity test suite now runs before every commit — this never happens again.",
    updates: [
      { type: "fix", text: "62 tools restored that were accidentally hidden — unit converters, time/date tools, color utilities, JSON/CSV tools, and code utilities." },
      { type: "fix", text: "23 duplicate tool entries removed. 6 broken tool links fixed. Category filtering corrected across all pages." },
      { type: "feature", text: "Content integrity test suite runs before every commit — catches broken tools, duplicate entries, and missing modules automatically." },
      { type: "fix", text: "509 tools with duplicate descriptions deduplicated — each tool now has a unique, accurate description." },
    ],
  },
  {
    version: "v1.10.0",
    date: "June 15, 2026",
    title: "Production Security & Sitemap Launch",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Security headers deployed across all pages. Automated sitemap generated with 876+ URLs. AI crawler rules configured. The platform gets serious about being found.",
    updates: [
      { type: "security", text: "Content-Security-Policy headers added — prevents unauthorized script execution on all pages." },
      { type: "security", text: "X-Frame-Options and X-Content-Type-Options headers added — prevents clickjacking and MIME-type attacks." },
      { type: "feature", text: "Automated sitemap generation with 876+ URLs for discoverability." },
      { type: "feature", text: "Sitemap submitted to Google Search Console — accelerates indexing of all tool pages." },
      { type: "performance", text: "Batch processing hardened: a single corrupted or broken file is auto-skipped instead of crashing the entire batch." },
      { type: "fix", text: "Broken internal links across 15 category pages corrected." },
    ],
  },
  {
    version: "v1.9.0",
    date: "June 08, 2026",
    title: "830+ Tools — Every Page Now Works",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "The catalog doubles to 830+ tools. Every single one has a working page — zero 'Coming Soon' placeholders, zero broken links. New CSV-to-SQL terminal and vector drawing canvas ship. The platform is now a serious alternative to desktop software.",
    updates: [
      { type: "feature", text: "Catalog doubled to 830+ tools across 20 categories — every entry has a working page with real functionality." },
      { type: "feature", text: "New CSV to SQL Terminal — upload CSV files and run SQL queries entirely in your browser." },
      { type: "feature", text: "New Vector Drawing Canvas — freeform drawing with pen, shapes, multi-page support, color picker, and SVG/PNG export." },
      { type: "fix", text: "EPUB to PDF converter restored. Time Converter moved to correct category." },
      { type: "performance", text: "Category listing pages load 30% faster — redundant data fetching removed." },
      { type: "feature", text: "Tool cards now show usage count and last updated date — helps users find actively maintained tools." },
    ]
  },
];
