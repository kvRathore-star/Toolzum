import React from "react";
import { 
  Zap, 
  ShieldCheck, 
  WifiOff, 
  ArrowRight,
  Sparkles,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCachedToolCounts } from "@/registry/tools-helpers";
import { ProductExplorer } from "@/components/ProductExplorer";

const { localTools, cloudTools, hybridTools, totalImplemented } = getCachedToolCounts();
const totalCloud = cloudTools + hybridTools;

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      
      {/* Background Grids */}
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none opacity-[0.03]">
        <div className="w-full max-w-[1280px] h-full" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-sm font-semibold text-[var(--accent)] mb-6">
            <Sparkles className="w-4 h-4" /> {totalImplemented} Tools — {localTools} Local
          </span>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-7xl mb-6 tracking-tight leading-tight">
            The offline utility command center.
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)]">
            A comprehensive catalog of tools — {localTools} run entirely in your browser, {totalCloud} cloud AI tools clearly marked. No server queues. Just lightning-fast performance.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/tools">
              <Button size="lg" className="gap-2">
                Explore All Tools <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/extension">
              <Button size="lg" variant="secondary" className="gap-2">
                <Download className="w-4 h-4" /> Chrome Extension
              </Button>
            </Link>
          </div>
        </div>

        {/* Pillars of Toolzum */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8">
            <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--accent-ink)]/10 text-[var(--accent)] flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium mb-3">Privacy Sealed</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Most operations run locally using WebAssembly, JS, and HTML5 Web APIs — your files never reach our servers. Cloud AI tools clearly marked.
            </p>
          </div>

          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8">
            <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--success)]/10 text-[var(--success)] flex items-center justify-center mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium mb-3">Strikingly Fast</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Skip uploading files and waiting for server-side processing queues. Get instant conversion, rendering, and calculation.
            </p>
          </div>

          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8">
            <div className="w-12 h-12 rounded-[var(--radius-md)] bg-purple-500/10 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-6">
              <WifiOff className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium mb-3">Runs Fully Offline</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Lost internet connection? No problem. Toolzum is built to work fully offline once loaded, ensuring reliability.
            </p>
          </div>

        </div>

        {/* Interactive Showcase */}
        <div className="mb-24">
          <ProductExplorer />
        </div>

      </div>
    </div>
  );
}
