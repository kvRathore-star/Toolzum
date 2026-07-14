"use client";

import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      
      {/* Background Grids */}
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none opacity-[0.03]">
        <div className="w-full max-w-[1280px] h-full" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--accent)] mb-6">
            <Briefcase className="w-3.5 h-3.5" /> Work With Us
          </div>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-7xl mb-6 tracking-tight leading-tight">
            Build the local web.
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)]">
            We are building a future where developer, image, and text operations compile directly inside user clients. Join our fully remote open source advocacy and design engine.
          </p>
        </div>

        {/* Culture highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 max-w-5xl mx-auto">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mb-6">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base mb-2">100% Remote First</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">Work from anywhere in the world. Set your own hours and coordinate asynchronously.</p>
          </div>

          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base mb-2">Work-Life Harmony</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">No arbitrary deadlines or grind culture. We value mental clarity and consistent, high-quality output.</p>
          </div>

          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base mb-2">Open Source Focus</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">We contribute deeply to open WebAssembly compilers, leaving a legacy of free utilities for all.</p>
          </div>
        </div>

        {/* No open roles currently */}
        <div className="max-w-4xl mx-auto text-center py-16">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
          <h2 className="text-2xl font-semibold mb-2">No Open Roles Right Now</h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            We are not actively hiring at the moment. Follow us on social channels or check back later for future openings.
          </p>
          <p className="text-[var(--text-muted)] text-sm mt-6">
            Interested in joining us?{" "}
            <a href="mailto:support@toolzum.com?subject=Job%20Application%20-%20Resume" className="text-[var(--accent)] hover:underline">Send us your resume</a> and we will keep you in mind.
          </p>
        </div>

      </div>
    </div>
  );
}
