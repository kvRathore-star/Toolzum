"use client";

import React, { useState } from "react";
import {
  Bookmark,
  ChevronDown
} from "lucide-react";
import { ChangelogTimeline } from "@/components/ChangelogTimeline";
import type { Release } from "./_components/releaseTypes";
import { RELEASES_PART_1 } from "./_components/releasesPart1";
import { RELEASES_PART_2 } from "./_components/releasesPart2";
import { ChangelogNewsletter } from "./_components/ChangelogNewsletter";

const RELEASES: Release[] = [...RELEASES_PART_1, ...RELEASES_PART_2];

export default function ChangelogPage() {
  const [showAll, setShowAll] = useState(false);
  const RECENT_COUNT = 8;
  const visibleReleases = showAll ? RELEASES : RELEASES.slice(0, RECENT_COUNT);
  const hiddenCount = RELEASES.length - RECENT_COUNT;

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

        <ChangelogTimeline releases={visibleReleases} />

        {!showAll && hiddenCount > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] hover:border-[var(--accent)]/30 transition-all duration-200"
            >
              <ChevronDown className="w-4 h-4" />
              Show {hiddenCount} older releases
            </button>
          </div>
        )}

        {/* Bottom newsletter section */}
        <ChangelogNewsletter />

      </div>
    </div>
  );
}
