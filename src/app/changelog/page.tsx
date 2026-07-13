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
    version: "v1.5.0",
    date: "July 7, 2026",
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
    version: "v1.4.0",
    date: "June 18, 2026",
    title: "30 Bulk Tools Complete — Batch Video, Audio & Document Processing",
    tag: "major",
    tagColor: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: "All 30 bulk processing modules are now live. Compress videos, reduce file sizes, burn subtitles, convert images to PDF, merge documents, run OCR, and more — all in your browser with zero uploads. Pro users unlock 6× parallel processing and ZIP downloads.",
    demo: "batch-processing",
    updates: [
      { type: "feature", text: "Batch video processing engine: compress, resize, and burn subtitles on multiple videos simultaneously using FFmpeg WASM — loaded on demand, no install required." },
      { type: "feature", text: "20+ new bulk modules including SVG to PNG, image resize/compress, PDF merge/reduce, OCR text extraction, ebook conversion, audio format conversion, and face anonymization." },
      { type: "feature", text: "Pro users download entire batches as a single ZIP file. Free users get per-file downloads with no watermark." },
      { type: "performance", text: "Pro tier unlocks 6× parallel processing threads — process 12 files in the time free users process 2. Visual speed indicator shows real-time throughput." },
    ]
  },
  {
    version: "v1.3.0",
    date: "May 30, 2026",
    title: "Enterprise Trust & Compliance — Security Page, CSP Headers, Offline Mode",
    tag: "minor",
    tagColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    description: "Enterprise-ready security posture for teams handling sensitive data. Published a dedicated /security page, added CSP headers for XSS prevention, rolled out an offline mode indicator, and zero-data retention badges across all upload zones.",
    updates: [
      { type: "feature", text: "Published /security page with full architecture diagram, data flow map, compliance certifications, and third-party dependency audit." },
      { type: "feature", text: "Content-Security-Policy headers lock down script-src, connect-src, and worker-src — no unauthorized scripts can execute." },
      { type: "feature", text: "Offline mode indicator: shows a persistent banner that all processing still works even when WiFi drops — critical for remote teams." },
      { type: "security", text: "Zero-data retention notices live in every bulk tool upload zone. Files are processed in browser RAM and never leave your device." }
    ]
  },
  {
    version: "v1.2.0",
    date: "May 25, 2026",
    title: `${toolsRegistry.length}+ Tools — Full Office Suite in Your Browser`,
    tag: "major",
    tagColor: "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20",
    description: `The biggest expansion yet. Edit documents, design logos, run AI models, process images, calculate finances — all ${toolsRegistry.length}+ tools run completely offline with zero data leaving your machine. No subscriptions, no uploads, no limits.`,
    demo: "tool-expansion",
    updates: [
      { type: "feature", text: "Full PDF office suite: Word-to-PDF, PDF-to-Word, PDF-to-JPG, and PDF page editing — 100% client-side, no server round trip." },
      { type: "feature", text: "Design studio: SVG Vector Editor, Logo Maker, AI Thumbnail Maker with drag-and-drop canvas, templates, and export presets." },
      { type: "performance", text: "Background image removal migrated to 100% local WebGL tensor execution — up to 4× faster than the previous pipeline, still zero uploads." },
        { type: "security", text: `Offline-first zero-telemetry framework enforced across all ${toolsRegistry.length}+ tools. No analytics pings, no data collection, no third-party requests.` }
    ]
  },
  {
    version: "v1.1.0",
    date: "April 12, 2026",
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
    date: "February 20, 2026",
    title: "Platform Launch — Privacy-First Web Utilities",
    tag: "launch",
    tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    description: "Toolzum launched with a simple premise: every tool should run in your browser, not on a server. No uploading confidential files to black-box servers for simple resize, crop, or hashing operations.",
    updates: [
      { type: "feature", text: "Initial catalog of 50 tools: hashing, text processing, image compression, format conversion, and random generators." },
      { type: "security", text: "Verified zero-data exfiltration — no packets dispatched during any tool execution. Every byte stays on your device." }
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

                <h3 className="text-2xl font-semibold mb-4 text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
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
            <Button disabled className="shrink-0 gap-2 opacity-60 cursor-not-allowed">Subscribe <ArrowRight className="w-4 h-4" /></Button>
          </div>
        </div>

      </div>
    </div>
  );
}
