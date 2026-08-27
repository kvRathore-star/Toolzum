"use client";

import React, { useState } from "react";
import { 
  GitCommit, 
  Sparkles, 
  Wrench, 
  ShieldCheck
} from "lucide-react";
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

interface ChangelogTimelineProps {
  releases: Release[];
}

export function ChangelogTimeline({ releases }: ChangelogTimelineProps) {
  const [filter, setFilter] = useState<"all" | "major" | "minor">("all");

  const filteredReleases = releases.filter(release => {
    if (filter === "all") return true;
    if (filter === "major") return release.tag === "major" || release.tag === "launch";
    if (filter === "minor") return release.tag === "minor";
    return true;
  });

  return (
    <>
      {/* Filter bar */}
      <div className="flex justify-center gap-2 mb-16">
        <button 
          onClick={() => setFilter("all")} 
          className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
            filter === "all" 
            ? "bg-[var(--accent-ink)] text-white border-[var(--accent)]" 
            : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white"
          }`}
        >
          All Updates
        </button>
        <button 
          onClick={() => setFilter("major")} 
          className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
            filter === "major" 
            ? "bg-[var(--accent-ink)] text-white border-[var(--accent)]" 
            : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white"
          }`}
        >
          Major Releases
        </button>
        <button 
          onClick={() => setFilter("minor")} 
          className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
            filter === "minor" 
            ? "bg-[var(--accent-ink)] text-white border-[var(--accent)]" 
            : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white"
          }`}
        >
          Minor & Bug Fixes
        </button>
      </div>

      {/* Timeline representation */}
      <div className="max-w-4xl mx-auto relative pl-6 sm:pl-10 before:absolute before:top-0 before:bottom-0 before:left-[11px] sm:before:left-[19px] before:w-[2px] before:bg-[var(--border-subtle)]">
        
        {filteredReleases.map((release) => (
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
                        {update.type === "performance" && <ShieldCheck className="w-4 h-4 text-purple-700 dark:text-purple-400 shrink-0" />}
                        {update.type === "fix" && <Wrench className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />}
                        {update.type === "security" && <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />}
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
    </>
  );
}
