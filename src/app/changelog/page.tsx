"use client";

import React, { useState } from "react";
import { 
  GitCommit, 
  Sparkles, 
  Wrench, 
  ShieldCheck, 
  ArrowRight,
  Bookmark
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toolsRegistry } from "@/registry/tools";
import ChangelogShowcase, { DemoType } from "@/components/ChangelogShowcase";

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
    version: "v2.0.1",
    date: "July 25, 2026",
    title: "Accurate Tool Counts — Hidden Redirects No Longer Inflate Directory Numbers",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
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
    tagColor: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
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
    tagColor: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
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
    tagColor: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
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
    tagColor: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Major navigation upgrades: category filters across all tool categories, A-Z alphabetical tool filter, and dynamic recently-used tools in the megamenu. Fixed critical navigation bug where 'Back to Privacy' linked to Privacy Policy instead of Privacy tools. Added CPM Calculator with 7 platform presets (YouTube, Twitch, Facebook, Instagram, TikTok, Twitter/X, LinkedIn) plus RPM (Revenue Per Mille) mode for creators.",
    updates: [
      { type: "feature", text: "CPM Calculator rewritten with platform presets for 7 social platforms — each pre-fills typical CPM/RPM averages. RPM mode toggle for creator earnings analysis." },
      { type: "feature", text: "New RPM Calculator page at /rpm-calculator — dedicated SEO entry covering revenue-per-mille search intent." },
      { type: "feature", text: "Category filter buttons (Compress, Resize, Convert, Edit, AI, etc.) now available on Audio, Video, Text, Developer, SEO, Finance, Privacy, Utility, Branding, and Health category pages — not just Image and PDF." },
      { type: "feature", text: "A-Z alphabetical letter filter on all category pages — dimmed letters for empty letters, works alongside search." },
      { type: "feature", text: "Megamenu 'Most used today' now shows your actual recently-used tools (from localStorage history) instead of hardcoded links. Falls back to defaults when history is empty." },
      { type: "fix", text: "Fixed 'Back to Privacy' navigation — Privacy Policy moved from /privacy/ to /privacy-policy/ so /privacy/ now correctly shows the Privacy tools category. Same fix for /health/ → /status/ redirect to unblock Health tools category page." },
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
    tagColor: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
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
    tagColor: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
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
    tagColor: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
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
    tagColor: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
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
    tagColor: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
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
    tagColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
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
    tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
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
    tagColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
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
    tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
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
  const [filter, setFilter] = useState<"all" | "major" | "minor">("all");

  const filteredReleases = RELEASES.filter(release => {
    if (filter === "all") return true;
    if (filter === "major") return release.tag === "major" || release.tag === "launch";
    if (filter === "minor") return release.tag === "minor";
    return true;
  });

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

        {/* Filter bar */}
        <div className="flex justify-center gap-2 mb-16">
          <button 
            onClick={() => setFilter("all")} 
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              filter === "all" 
              ? "bg-[var(--accent)] text-white border-[var(--accent)]" 
              : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            All Updates
          </button>
          <button 
            onClick={() => setFilter("major")} 
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              filter === "major" 
              ? "bg-[var(--accent)] text-white border-[var(--accent)]" 
              : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            Major Releases
          </button>
          <button 
            onClick={() => setFilter("minor")} 
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              filter === "minor" 
              ? "bg-[var(--accent)] text-white border-[var(--accent)]" 
              : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            Minor & Bug Fixes
          </button>
        </div>

        {/* Timeline representation */}
        <div className="max-w-4xl mx-auto relative pl-6 sm:pl-10 before:absolute before:top-0 before:bottom-0 before:left-[11px] sm:before:left-[19px] before:w-[2px] before:bg-[var(--border-subtle)]">
          
          {filteredReleases.map((release, releaseIdx) => (
            <div key={release.version} className="relative mb-20 last:mb-0">
              
              {/* Timeline marker node */}
              <div className="absolute -left-[20px] sm:-left-[28px] top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[var(--bg-base)] border-[3px] border-[var(--accent)] flex items-center justify-center text-white z-10 shadow-sm">
                <GitCommit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--accent)]" />
              </div>

              {/* Release details box */}
              <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 sm:p-10 shadow-sm relative group hover:border-[var(--accent)]/30 transition-all duration-300">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-[var(--bg-base)] border border-[var(--border-subtle)]">
                      {release.version}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] font-mono">{release.date}</span>
                  </div>
                  <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border ${release.tagColor}`}>
                    {release.tag}
                  </span>
                </div>

                <h3 className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl font-semibold mb-4 text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {release.title}
                </h3>
                
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                  {release.description}
                </p>

                {release.demo && (
                  <div className="mb-6">
                    <ChangelogShowcase demo={release.demo} />
                  </div>
                )}

                {/* Sublist updates */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-semibold uppercase text-[var(--text-muted)] tracking-wider">Change Details</h4>
                  
                  <ul className="space-y-3">
                    {release.updates.map((update, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                        <span className="mt-1">
                          {update.type === "feature" && <Sparkles className="w-4 h-4 text-[var(--accent)] shrink-0" />}
                          {update.type === "performance" && <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />}
                          {update.type === "fix" && <Wrench className="w-4 h-4 text-blue-400 shrink-0" />}
                          {update.type === "security" && <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
                        </span>
                        <span>
                          <strong className="capitalize text-[var(--text-primary)]">{update.type}: </strong>
                          {update.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>
          ))}

        </div>

        {/* Bottom newsletter section */}
        <div className="mt-24 max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-[80px]" />
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
