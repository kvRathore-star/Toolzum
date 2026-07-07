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

const RELEASES = [
  {
    version: "v1.5.0",
    date: "July 7, 2026",
    title: "Architecture Hardening — Error Boundaries, Memory Warnings & Web Worker Foundation",
    tag: "major",
    tagColor: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Production-hardened all 30 bulk processing modules with memory-pressure detection, graceful error boundaries, and large-file warnings. Retrofitted withErrorHandling into every critical processing path.",
    updates: [
      { type: "feature", text: "Added memory-pressure detection across all bulk tools — warns users with <4GB RAM before processing large files." },
      { type: "feature", text: "Large file (>100MB) confirmation dialogs with device memory info in all video, PDF, and image processing modules." },
      { type: "performance", text: "withErrorHandling wrapper retrofitted into BulkToolShell, all 3 video modules, PDF merger, and image watermark — failed per-file no longer kills entire batch." },
      { type: "security", text: "Catch blocks across all bulk modules now show OOM-specific messages instead of silent freezes." }
    ]
  },
  {
    version: "v1.4.0",
    date: "June 18, 2026",
    title: "30 Bulk Tools Complete — FFmpeg WASM Video Processing & Pro Gating",
    tag: "major",
    tagColor: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Completed all 30 bulk processing tools including FFmpeg WASM-based video processing. Full Pro gating with parallel processing, ZIP downloads, workflow presets, and watermark-free export.",
    updates: [
      { type: "feature", text: "Implemented 3 FFmpeg WASM video tools: BulkVideoCompressor, BulkVideoSizeReducer, BulkVideoSubtitleBurner — ~30MB WASM lazy-loaded on first use." },
      { type: "feature", text: "Completed remaining 20+ bulk modules — SVG to PNG, image resizer/compressor, PDF merger/reducer, OCR, ebook converter, audio tools, face anonymizer, and more." },
      { type: "feature", text: "ProDownloadButton locking ZIP download behind Pro tier with per-file download for free users." },
      { type: "feature", text: "PostProcessUpgrade popup after 3rd tool use, ProComparisonChart on every tool page, ShareTool social sharing." },
      { type: "performance", text: "Pro users get 6× parallel processing via Promise.all chunks; free users process sequentially with animated speed indicator." },
    ]
  },
  {
    version: "v1.3.0",
    date: "May 30, 2026",
    title: "Privacy & Enterprise Compliance — Security Page, CSP, Offline Mode",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    description: "Enterprise-ready security posture with dedicated /security page, CSP headers, offline mode indicator, and zero-data retention notices. Pricing rebranded with 7-Day Project Pass and India pricing.",
    updates: [
      { type: "feature", text: "Published /security page with architecture diagram, data flow, compliance, and third-party dependency details." },
      { type: "feature", text: "Added Content-Security-Policy headers via public/_headers restricting script-src, connect-src, and worker-src." },
      { type: "feature", text: "OfflineIndicator component — shows 'processing still works' banner when WiFi drops." },
      { type: "fix", text: "Rebranded Weekly plan to 7-Day Project Pass ($3.99/₹99 auto-cancel) across pricing, paywall, and checkout." },
      { type: "fix", text: "3 XSS vectors fixed via DOMPurify.sanitize(); 11 console.log statements removed; Gemini API key moved to header." },
      { type: "security", text: "Zero-data retention notices in all bulk tool upload zones with Zero-Trust badge." }
    ]
  },
  {
    version: "v1.2.0",
    date: "May 25, 2026",
    title: "Golden Master Release — 200+ Browser Tools",
    tag: "major",
    tagColor: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "Our largest release to date. Complete expansion to 200+ offline tools, comprising full PDF compilers, browser vector canvas designers, local AI operations, and comprehensive developers/finance calculators.",
    updates: [
      { type: "feature", text: "Added client-side PDF conversions (Word-to-PDF, PDF-to-Word, PDF-to-JPG)." },
      { type: "feature", text: "Introduced SVG Vector Editor, Logo Maker, and AI Thumbnail Maker suite." },
      { type: "performance", text: "Migrated background image removers to use 100% local WebGL tensor execution, speedups of up to 4x." },
      { type: "security", text: "Implemented offline-first zero telemetry framework across all 200+ tools." }
    ]
  },
  {
    version: "v1.1.0",
    date: "April 12, 2026",
    title: "Finance Calculators & Developer Sandbox Expansion",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    description: "Focused expansion of the developer utility drawer and finance tools. Introduced support for localized currency exchange rates and advanced SaaS metrics calculation dashboards.",
    updates: [
      { type: "feature", text: "Implemented SaaS Pricing Calculator, Employee Turnover tracker, and ROI simulator." },
      { type: "feature", text: "Added developer SQL, JSON, and CSS minifiers and formatting engines." },
      { type: "fix", text: "Resolved latex rendering math equations syntax in financial modules." },
      { type: "performance", text: "Integrated Service Worker caching for offline persistence across page routes." }
    ]
  },
  {
    version: "v1.0.0",
    date: "February 20, 2026",
    title: "Platform Launch — Privacy-First Web Utilities",
    tag: "launch",
    tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    description: "The initial launch of ToolHub. Built to solve the issue of uploading confidential files and image media to black-box servers for simple resize, crop, and hashing operations.",
    updates: [
      { type: "feature", text: "Launched initial catalog of 50 tools, including Hashing, Text humanizers, and Image compression." },
      { type: "feature", text: "Established dark-mode premium dashboard styling framework utilizing custom HSL color variables." },
      { type: "security", text: "Verified that zero packets are dispatched during tool executions." }
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--accent)] mb-6">
            <Bookmark className="w-3.5 h-3.5" /> Product Timeline
          </div>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-7xl mb-6 tracking-tight leading-tight">
            Changelog & Updates
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)]">
            Follow the incremental evolution of the ToolHub engine. We push changes and optimizations every week.
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

                <h3 className="text-2xl font-semibold mb-4 text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {release.title}
                </h3>
                
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                  {release.description}
                </p>

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
          <h3 className="text-2xl font-semibold mb-3">Never miss a tool update</h3>
          <p className="text-[var(--text-secondary)] text-sm max-w-lg mx-auto mb-6">
            We build and deploy new offline utilities every single week. Subscribe to get our weekly release summaries.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="name@email.com" 
              className="flex-1 bg-[var(--bg-base)] text-sm border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]" 
            />
            <Button className="shrink-0 gap-2">Subscribe <ArrowRight className="w-4 h-4" /></Button>
          </div>
        </div>

      </div>
    </div>
  );
}
