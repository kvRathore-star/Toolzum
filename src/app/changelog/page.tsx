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
  {
    version: "v2.3.0",
    date: "September 03, 2026",
    title: "Sign-In Fixed, Admin Security & 30+ New Tools",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Fixed the sign-in issue that was silently breaking user sessions. Admin panel hardened with IP restrictions, session control, and safeguards against accidental role changes. 30+ new tools added including bulk processors, AI-powered watermark removal, and text utilities. Homepage upload experience redesigned.",
    updates: [
      { type: "fix", text: "Sign-in now works reliably — users no longer appear logged out after authenticating." },
      { type: "security", text: "Admin panel restricted by IP — only trusted networks can access admin routes." },
      { type: "security", text: "Admin role changes now require typing the user's email to confirm — prevents accidental promotions or demotions." },
      { type: "feature", text: "Admins can view and revoke active sessions per user, including device and IP information." },
      { type: "feature", text: "30+ new tools: bulk image upscaling, bulk format conversion, AI watermark removal, bulk PDF operations, and text utilities." },
      { type: "feature", text: "Homepage upload box redesigned — shows supported formats at a glance with privacy-first messaging." },
    ]
  },
  {
    version: "v2.2.0",
    date: "August 25, 2026",
    title: "Smarter Calculators, Accessibility & Performance",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Every calculator upgraded with a two-column layout, result history, and auto-calculate mode. Full accessibility pass across the platform. Page load times improved.",
    updates: [
      { type: "feature", text: "Calculators redesigned: two-column layout with result panel, one-click copy/download, calculation history, and presets." },
      { type: "feature", text: "Auto-calculate across health, finance, and math tools — results appear as you type." },
      { type: "fix", text: "Calculation accuracy improved across 20+ tools — edge cases like empty inputs and impossible values handled gracefully." },
      { type: "fix", text: "Accessibility pass: screen reader support, keyboard navigation, and proper labels added across all interactive elements." },
      { type: "performance", text: "Page loads faster — heavy code removed from initial bundles, images optimized, tools load on demand." },
    ]
  },
  {
    version: "v2.1.0",
    date: "August 11, 2026",
    title: "Admin Panel, Sign-In Rebuilt & Account System",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Google sign-in completely rebuilt to fix persistent authentication failures. New admin panel for user management, subscriptions, and audit logging. Full account system with profile editing, favorites, and bot protection on auth flows.",
    updates: [
      { type: "fix", text: "Google sign-in rebuilt from scratch — fixed redirect issues, session persistence, and cookie conflicts that were breaking authentication." },
      { type: "feature", text: "Admin panel launched: manage users, view subscriptions, edit credits, ban/unban, GDPR delete, and full audit trail." },
      { type: "feature", text: "Account page: edit profile, change password, manage sessions, export favorites, and delete your account." },
      { type: "feature", text: "Favorites system: star any tool, see them on your homepage, and jump to them instantly from search." },
      { type: "security", text: "Bot protection added to sign-up, sign-in, and password reset flows." },
    ]
  },
  {
    version: "v2.0.1",
    date: "July 25, 2026",
    title: "Tool Count Accuracy Fix",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Fixed a counting discrepancy where the header claimed '1090+ tools' but results showed '856'. Now every count on the page — header, category sidebars, and results — shows the same number.",
    updates: [
      { type: "fix", text: "Tool counts now consistent everywhere — header, subtitle, category sidebars, and results all show the same number." },
      { type: "fix", text: "Search engine metadata and structured data now use accurate counts." },
    ]
  },
  {
    version: "v2.0.0",
    date: "July 07, 2026",
    title: "Premium Calculator Shell, SaaS Dashboard & Indian Utilities",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Major premium interface upgrade. CalculatorShell framework deployed across 80+ calculators with history, keyboard shortcuts, and one-click copy. Three flagship premium tools launched. Indian Utilities category completed. All tool modules upgraded to premium UI.",
    updates: [
      { type: "feature", text: "CalculatorShell framework: history panel, keyboard support, result memory, and one-click copy across 80+ calculators." },
      { type: "feature", text: "Premium SaaS Metrics Dashboard — interactive KPI cards, charts, scenario modeling, and PDF export." },
      { type: "feature", text: "Premium API Builder/Tester — request collections, code snippet generation, and environment variables." },
      { type: "feature", text: "Premium PDF Workflow Builder — merge, split, fill forms, rearrange pages in a single workspace." },
      { type: "feature", text: "Indian Utilities completed: UPI ID Validator, Indian Address Parser, Vehicle Registration Checker, Aadhaar Validator, and Investment Calculator." },
      { type: "feature", text: "Bulk URL Shortener — shorten multiple URLs at once with custom aliases and CSV export." },
      { type: "fix", text: "22 health tools moved to their own category. Video converter tool restored." },
    ]
  },
  {
    version: "v1.9.0",
    date: "June 23, 2026",
    title: "830+ Tools, Production Hardening & SEO Overhaul",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Tool catalog expanded to 830+. Production hardened with security headers, automated sitemap, and content integrity testing. 62 accidentally hidden tools restored. Bulk processing upgraded with fault isolation. SEO category sections rewritten.",
    updates: [
      { type: "feature", text: "Catalog grew to 830+ tools across 20 categories with full cross-reference verification." },
      { type: "fix", text: "62 tools that were accidentally hidden are now visible again — unit converters, time/date tools, color utilities, and more." },
      { type: "feature", text: "Content integrity testing runs before every commit — catches broken tools and duplicate entries automatically." },
      { type: "performance", text: "Bulk processing hardened: one bad file no longer crashes the entire batch." },
      { type: "feature", text: "Security headers added, automated sitemap generation, and AI crawler rules configured." },
    ]
  },
  {
    version: "v1.8.0",
    date: "June 15, 2026",
    title: "Full Tool Catalog — Zero Empty Pages",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Tool catalog doubled to 830+. Every tool now has a real working page — zero 'Coming Soon' placeholders, zero broken links. Format converters consolidated. New tools: CSV to SQL terminal, Vector Drawing canvas.",
    updates: [
      { type: "feature", text: "Catalog doubled to 830+ tools — every entry has a working page with real functionality." },
      { type: "fix", text: "23 duplicate entries removed. 6 broken tool links fixed. Category filtering corrected across all pages." },
      { type: "feature", text: "New CSV to SQL Terminal — run SQL queries on CSV files in your browser." },
      { type: "feature", text: "New Vector Drawing Canvas — freeform drawing with shapes, multi-page support, and export." },
    ]
  },
  {
    version: "v1.7.0",
    date: "May 26, 2026",
    title: "Category Filters, A-Z Sorting & Smart Megamenu",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Category filters now available on every tool category page. A-Z alphabetical sorting. Megamenu shows your recently-used tools. CPM Calculator with platform presets for YouTube, Instagram, TikTok and more.",
    updates: [
      { type: "feature", text: "Category filter buttons (Compress, Resize, Convert, Edit, AI) now on every category page." },
      { type: "feature", text: "A-Z alphabetical sorting on all category pages." },
      { type: "feature", text: "Megamenu now shows your recently-used tools instead of hardcoded links." },
      { type: "feature", text: "CPM Calculator with presets for 7 social platforms — YouTube, Twitch, Facebook, Instagram, TikTok, Twitter/X, LinkedIn." },
      { type: "fix", text: "'Back to Privacy' link fixed — was going to Privacy Policy instead of Privacy tools." },
      { type: "feature", text: "New professional favicon and PWA icons." },
    ]
  },
  {
    version: "v1.6.0",
    date: "May 15, 2026",
    title: "250 Format Converter Pages",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Every format-to-format conversion now has its own dedicated page. Search 'PNG to WebP' or 'MP3 to WAV' and land directly on the right tool. 20+ high-traffic tools differentiated with unique descriptions.",
    updates: [
      { type: "feature", text: "250 format-pair converter pages — each with format-specific instructions and FAQs." },
      { type: "feature", text: "20+ popular tools given unique descriptions and how-to guides so they don't look like clones." },
    ]
  },
  {
    version: "v1.5.0",
    date: "April 20, 2026",
    title: "Production Launch — Security, Mobile & SEO",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Platform locked down for production. Security headers, database provisioned, mobile responsiveness fixed across all tools, and SEO rewritten for search intent.",
    updates: [
      { type: "security", text: "Security headers added — prevents unauthorized script execution." },
      { type: "fix", text: "Mobile layout fixed across all tool pages — badges, navigation, and hero sections now work on small screens." },
      { type: "fix", text: "URL Shortener and Currency Converter moved to backend proxy — were broken by browser security restrictions." },
      { type: "performance", text: "SEO descriptions rewritten to match how people actually search." },
    ]
  },
  {
    version: "v1.4.0",
    date: "March 24, 2026",
    title: "Fault-Tolerant Batch Processing",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Process 50 files at once without worry. If one file is corrupted or too large, it's automatically skipped and the rest keep processing. Large files get a warning before processing.",
    updates: [
      { type: "feature", text: "Memory-pressure warning on devices with less than 4 GB RAM." },
      { type: "feature", text: "Large file confirmation dialogs (>100 MB) — no more silent browser crashes." },
      { type: "performance", text: "Bad files are auto-skipped instead of crashing the entire batch." },
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
      { type: "feature", text: "Batch video processing — compress, resize, and add subtitles to multiple videos at once." },
      { type: "feature", text: "20+ new bulk tools: image resize, PDF merge, OCR, ebook conversion, audio conversion, and more." },
      { type: "feature", text: "Pro users download entire batches as a single ZIP file." },
    ]
  },
  {
    version: "v1.2.0",
    date: "February 11, 2026",
    title: "Enterprise Security & Full Office Suite — 230+ Tools",
    tag: "major",
    tagColor: "bg-[var(--accent-ink)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "230+ tools with enterprise-ready security. PDF office suite, design studio, CSP security headers, offline mode indicator, and zero data collection across every tool.",
    updates: [
      { type: "feature", text: "Full PDF office suite: Word-to-PDF, PDF-to-Word, PDF-to-JPG, and page editing." },
      { type: "feature", text: "Design studio: SVG editor, Logo Maker, AI Thumbnail Maker with templates and export." },
      { type: "security", text: "Security headers prevent unauthorized scripts. Zero data collection across all tools." },
      { type: "feature", text: "Offline mode indicator — tools work even without WiFi." },
    ]
  },
  {
    version: "v1.1.0",
    date: "January 09, 2026",
    title: "Finance & Developer Tools",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "New finance and developer tools. Offline caching for persistent access.",
    updates: [
      { type: "feature", text: "Business finance: SaaS pricing calculator, ROI simulator, currency exchange rates." },
      { type: "feature", text: "Developer tools: SQL, JSON, and CSS formatters with syntax highlighting." },
      { type: "performance", text: "Offline caching — tools load instantly even without a connection." },
    ]
  },
  {
    version: "v1.0.0",
    date: "December 15, 2025",
    title: "Platform Launch",
    tag: "launch",
    tagColor: "bg-emerald-700/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    description: "Toolzum launched with a simple premise: every tool runs in your browser, not on a server. No uploading confidential files to black-box servers.",
    updates: [
      { type: "feature", text: "50 tools at launch: hashing, text processing, image compression, format conversion, and generators." },
      { type: "security", text: "Zero data exfiltration verified — every byte stays on your device." },
    ]
  },
  {
    version: "v0.10.0",
    date: "November 18, 2025",
    title: "Tool Expansion & Payment Integration",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    description: "Catalog doubled to 50 tools based on beta feedback. Payment integration stabilized for Indian subscriptions.",
    updates: [
      { type: "feature", text: "Catalog expanded from 25 to 50 tools: image resizer, PDF merger, QR code generator, password generator." },
      { type: "fix", text: "Payment integration stabilized — webhooks, retries, and invoices automated." },
      { type: "performance", text: "Each tool loads independently — initial page load 40% faster." },
    ]
  },
  {
    version: "v0.9.0",
    date: "October 12, 2025",
    title: "Private Beta",
    tag: "launch",
    tagColor: "bg-emerald-700/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    description: "Closed beta with 25 tools. All processing happens in your browser — zero uploads. Pro subscription model with payment gateways for India and global users.",
    updates: [
      { type: "feature", text: "25 tools across PDF, Image, Video, Audio, and Text — all running in-browser." },
      { type: "feature", text: "Pro subscription with payment support for India (UPI) and global cards." },
      { type: "performance", text: "Tools load on demand — initial page under 100KB." },
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
