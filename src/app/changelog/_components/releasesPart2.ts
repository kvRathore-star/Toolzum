import type { Release } from "./releaseTypes";

export const RELEASES_PART_2: Release[] = [
  // ══════════════════════════════════════════════
  // MAY 2026
  // ══════════════════════════════════════════════
  {
    version: "v1.8.0",
    date: "May 26, 2026",
    title: "Category Filters, A-Z Sorting & Smart Megamenu",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "With 830+ tools, discoverability becomes the challenge. Every category page gets filter buttons. A-Z sorting lands. The megamenu starts showing your recently-used tools. Navigation catches up to the catalog.",
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
    description: "Search 'PNG to WebP' or 'MP3 to WAV' and land directly on the right tool — 250 dedicated format-pair pages ship. The 20 most popular tools get unique identities instead of generic clones. SEO starts working.",
    updates: [
      { type: "feature", text: "250 format-pair converter pages: 110 image pairs, 72 audio pairs, 42 document pairs, 20 video pairs, 6 data pairs — each with unique instructions and FAQs." },
      { type: "feature", text: "20+ popular tools given unique descriptions and how-to guides — word counter, image compressor, PDF compressor, video compressor, and more no longer look like clones." },
      { type: "feature", text: "Tool cards no longer display library/framework names — cleaner design, no competitive exposure." },
      { type: "fix", text: "Duplicate SVG-to-PNG entry removed. Link-in-bio builder duplicate fixed." },
      { type: "performance", text: "Category pages load faster — optimized image loading and reduced DOM complexity." },
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
    description: "CORS locked to toolzum.com. Security headers deployed. Mobile responsiveness fixed across all tools. SEO rewritten for real search intent. After months of building, the platform is finally production-ready.",
    updates: [
      { type: "security", text: "CORS restricted to toolzum.com only — staging and localhost origins removed from production." },
      { type: "security", text: "Security headers added — prevents unauthorized script execution on all pages." },
      { type: "fix", text: "Responsive polish — tool cards, result panels, and category grids now reflow cleanly on tablets and small phones." },
      { type: "fix", text: "URL Shortener and Currency Converter moved to backend proxy — were broken by browser security restrictions." },
      { type: "performance", text: "SEO descriptions rewritten to match how people actually search — removed number prefixes, aligned with natural language." },
      { type: "feature", text: "Google Search Console verified — analytics and search performance tracking enabled." },
    ]
  },
  {
    version: "v1.5.1",
    date: "April 10, 2026",
    title: "Mobile Fixes, SEO Overhaul & AI Crawlers",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Mobile layout corrected across all tool pages. SEO metadata rewritten for natural search language. AI crawler rules configured — tools are now discoverable by ChatGPT, Perplexity, and other AI assistants.",
    updates: [
      { type: "fix", text: "Mobile navigation overhauled — hamburger menu, touch targets, and swipe gestures now work reliably on iOS and Android." },
      { type: "performance", text: "SEO metadata updated to match natural search language — descriptions align with how users actually search." },
      { type: "feature", text: "AI crawler rules configured for major models — improves tool discoverability and referral traffic." },
      { type: "performance", text: "Image compression tools now process 2x faster on mobile devices." },
      { type: "fix", text: "Scientific Calculator grid layout restored — buttons were misaligned on tablets." },
    ]
  },
  {
    version: "v1.5.0",
    date: "April 05, 2026",
    title: "Database & Auth Infrastructure",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "The backend foundation lands. Database tables provisioned for users, sessions, payments, and analytics. Authentication wired. The platform stops being purely client-side and starts becoming a product.",
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
    description: "Process 50 files at once without worry. One corrupted file no longer crashes the entire batch — it's auto-skipped and the rest keep going. Bulk processing stops being fragile.",
    demo: "fault-tolerance",
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
    description: "Document-focused bulk tools land: PDF merge/reduce, multi-language OCR, and ebook conversion. The bulk suite starts covering real office workflows, not just media files.",
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
    description: "All 30 bulk processing tools go live. Compress videos, reduce file sizes, burn subtitles, convert images to PDF, merge documents, run OCR — all in your browser. The 'Pro' tier finally has a reason to exist.",
    demo: "batch-processing",
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
    description: "The catalog crosses 230 tools across 21 categories. Duplicates cleaned up, broken links fixed. The registry is now clean enough to scale.",
    updates: [
      { type: "feature", text: "Catalog crossed 230 tools across 21 categories with full working pages." },
      { type: "fix", text: "Duplicate tool entries removed across all categories." },
      { type: "fix", text: "Broken tool links fixed — all entries now route to working pages." },
      { type: "performance", text: "Tool card rendering optimized — faster page loads on category listing pages." },
      { type: "feature", text: "Search now indexes tool descriptions — find tools by what they do, not just their names." },
    ]
  },
  {
    version: "v1.2.0",
    date: "February 20, 2026",
    title: "Design Studio & Enterprise Security",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "The design tools launch — SVG editor, Logo Maker, AI Thumbnail Maker. Enterprise security headers lock down script execution. Zero data collection verified by third-party audit. The platform starts looking professional.",
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
    description: "A full PDF office suite launches — Word-to-PDF, PDF-to-Word, PDF-to-JPG, and page editing. All client-side. Toolzum goes from 'file converter' to 'productivity suite' overnight.",
    updates: [
      { type: "feature", text: "PDF office suite: Word-to-PDF, PDF-to-Word, PDF-to-JPG, and PDF page editing — fully client-side." },
      { type: "feature", text: "PDF page editing supports drag-and-drop page reordering and rotation." },
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
    description: "New developer tools land — SQL, JSON, and CSS formatters with syntax highlighting. Offline caching enabled across all routes — the platform starts feeling like a native app.",
    updates: [
      { type: "feature", text: "Developer tools: SQL, JSON, and CSS formatters and minifiers with syntax highlighting and error detection." },
      { type: "feature", text: "Offline caching enabled across all page routes — tools and pages load instantly even without WiFi." },
      { type: "feature", text: "Developer tools now support syntax highlighting for 10+ languages — Python, JavaScript, TypeScript, Go, Rust, and more." },
      { type: "fix", text: "XML sitemap generator blob URL race condition fixed — downloads no longer fail on slow devices." },
      { type: "fix", text: "Broken internal links across category pages corrected." },
    ]
  },
  {
    version: "v1.0.1",
    date: "January 09, 2026",
    title: "Finance Tools & Live Exchange Rates",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Business finance tools land — SaaS pricing calculator, ROI simulator, and employee turnover tracker. Currency exchange rates now fetched live. The catalog starts serving real-world use cases beyond file conversion.",
    updates: [
      { type: "feature", text: "Business finance tools: SaaS pricing calculator, employee turnover tracker, ROI simulator." },
      { type: "feature", text: "Live currency exchange rates with backend caching for reliability." },
      { type: "feature", text: "PDF.js updated to latest stable release — improved rendering accuracy and memory management." },
      { type: "performance", text: "Search results now include newly added tools within seconds of deployment." },
      { type: "fix", text: "Finance tool pages — calculator inputs, result tables, and chart layouts now render correctly on mobile." },
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
    description: "Toolzum goes public with 50 tools. The promise: every tool runs in your browser, not on a server. Six months from idea to launch — and this is where the real work begins.",
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
    description: "Closed-beta feedback drives the catalog from 25 to 50 tools. Payment integration stabilized for Indian subscriptions — the business model takes shape alongside the product.",
    updates: [
      { type: "feature", text: "Catalog expanded from 25 to 50 tools: image resizer, PDF merger, QR code generator, password generator, JSON formatter, base64 encoder/decoder." },
      { type: "feature", text: "Payment integration stabilized — subscription webhooks, retry logic, and invoice generation automated." },
      { type: "performance", text: "Code-splitting improved — each tool loads independently, reducing initial page load by 40%." },
      { type: "fix", text: "Viewport fix — tool pages now respect meta viewport tag, eliminating horizontal scroll on screens under 768px." },
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
    description: "Closed beta launches with 25 tools. The core engine is built: PDF handling, video/audio processing, OCR — all client-side. This is the starting point for everything that follows.",
    updates: [
      { type: "feature", text: "25 tools across PDF, Image, Video, Audio, and Text — all running entirely in your browser." },
      { type: "feature", text: "Pro subscription model with payment support for India (UPI) and global cards." },
      { type: "feature", text: "Core processing engine: PDF handling, video/audio processing, and OCR — all client-side." },
      { type: "performance", text: "Dynamic module loading — tools load on demand, keeping initial page under 100KB." },
      { type: "feature", text: "Drag-and-drop file handling across all tools — no file upload dialogs, no server round trips." },
    ]
  }
];
