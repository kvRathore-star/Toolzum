"use client";

import { 
  ShieldCheck, 
  Cpu, 
  Zap, 
  HelpCircle, 
  FileCode,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      
      {/* Background Grids */}
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none opacity-[0.03]">
        <div className="w-full max-w-[1280px] h-full" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--accent)] mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Our Core Philosophy
          </div>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-7xl mb-6 tracking-tight leading-tight">
            The web is local.
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)]">
            We believe that processing files shouldn't require sending them to remote servers. Toolzum brings state-of-the-art tools directly to your browser's sandboxed environment.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-24">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 text-center">
            <div className="text-4xl sm:text-5xl font-mono font-semibold text-[var(--accent)] mb-2">224</div>
            <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">Active Tools</div>
          </div>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 text-center">
            <div className="text-4xl sm:text-5xl font-mono font-semibold text-[var(--success)] mb-2">0</div>
            <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">Bytes Uploaded</div>
          </div>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 text-center">
            <div className="text-4xl sm:text-5xl font-mono font-semibold text-blue-400 mb-2">100%</div>
            <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">Client-Side</div>
          </div>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 text-center">
            <div className="text-4xl sm:text-5xl font-mono font-semibold text-purple-400 mb-2">&lt; 1s</div>
            <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">Execution Speed</div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="space-y-16 mb-24 max-w-4xl mx-auto">
          
          <div className="flex flex-col md:flex-row items-start gap-8 border-b border-[var(--border-subtle)] pb-12">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Absolute Sandbox Isolation</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                When you load Toolzum, all tool compilers (WASM binaries, ffmpeg builds, canvas nodes) execute exclusively inside your browser's sandboxed worker thread. No metadata trackers, no temporary folders, and zero risk of file leakage.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-8 border-b border-[var(--border-subtle)] pb-12">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">WebAssembly-Driven Compiler</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Leveraging standard LLVM to WebAssembly compilations, we translate complex C++, Rust, and Python file-conversion libraries into binaries that run at near-native speed directly inside Chrome, Safari, Firefox, and Edge.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Lightning-Fast Offline Access</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Because Toolzum downloads processing resources locally once, the platform requires no active internet to perform standard PDF, text, math, and converter functions. Perfect for off-grid developers, remote designers, and closed-intranet networks.
              </p>
            </div>
          </div>

        </div>

        {/* Call to Actions */}
        <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-semibold">Join the Open Source Engine</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-md">
              Check out our public repository, request new features, or contribute local WASM tools.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" className="gap-2">
                <FileCode className="w-4 h-4" /> Github Repository
              </Button>
            </a>
            <Link href="/contact">
              <Button className="gap-2">
                <HelpCircle className="w-4 h-4" /> Get in Touch
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
