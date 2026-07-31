import { 
  ShieldCheck, 
  Cpu, 
  Zap, 
  HelpCircle,
  Sparkles,
  EyeOff,
  Lock,
  Ban
} from "lucide-react";
import Link from "next/link";
import { getCachedToolCounts } from "@/registry/tools-helpers";

const { localTools, cloudTools, hybridTools, totalImplemented } = getCachedToolCounts();
const totalCloud = cloudTools + hybridTools;
const localPct = Math.round((localTools / totalImplemented) * 100);

export default function AboutPage() {

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      
      {/* Background Grids */}
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none opacity-[0.03]">
        <div className="w-full max-w-[1280px] h-full" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-sm font-semibold text-[var(--accent)] mb-6">
            <Sparkles className="w-4 h-4" /> Our Core Philosophy
          </span>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-7xl mb-6 tracking-tight leading-tight">
            The browser is the new server.
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)]">
            We believe your files should never leave your device. Toolzum brings server-grade processing to your browser via WebAssembly — {localTools} tools run entirely on your device, zero uploads required.
          </p>
        </div>

        {/* Core Insight */}
        <div className="max-w-4xl mx-auto mb-16 p-6 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-[var(--radius-xl)] text-center">
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            The Browser is the Data Center.
          </p>
          <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-xl mx-auto">
            Most tools compile to WebAssembly and execute on your machine. No server racks, no cloud bills, no data leaving your device.
          </p>
        </div>

        {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 text-center">
              <div className="text-4xl sm:text-5xl font-mono font-semibold text-[var(--accent)] mb-2">{totalImplemented}</div>
              <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">Active Tools</div>
            </div>
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 text-center">
              <div className="text-4xl sm:text-5xl font-mono font-semibold text-[var(--success)] mb-2">{localTools}</div>
              <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">Local Tools</div>
            </div>
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 text-center">
              <div className="text-4xl sm:text-5xl font-mono font-semibold text-blue-400 mb-2">{localPct}%</div>
              <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">Client-Side</div>
            </div>
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 text-center">
              <div className="text-4xl sm:text-5xl font-mono font-semibold text-purple-400 mb-2">&#60; 1s</div>
              <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">Execution Speed</div>
            </div>
          </div>

        {/* The Story */}
        <div className="max-w-3xl mx-auto mb-20 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-sm font-semibold text-[var(--accent)] mb-6">
            <Zap className="w-4 h-4" /> The Story
          </span>
          <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] mb-4">Built by you, for you.</h2>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
            Built by a solo developer who was tired of uploading confidential PDFs and images to random cloud servers 
            just to compress or convert them. So I built <strong className="text-[var(--text-primary)]">{totalImplemented}+ tools</strong> 
            — {localTools} run entirely in your browser, no server needed.
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-4">
            Bootstrapped. Zero VC funding. Privacy-first by design.
          </p>
        </div>

        {/* What Sets Us Apart */}
        <div className="max-w-4xl mx-auto mb-16 p-8 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-[var(--radius-2xl)]">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-sm font-semibold text-[var(--accent)] mb-4">
            <Ban className="w-4 h-4" /> The Difference
          </span>
          <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] mb-4">Your Data Stays on Your Machine.</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
            Traditional online tools ask you to upload files to their server. Toolzum flips that model — {localTools} of our {totalImplemented} tools 
            process entirely in your browser. Your file loads into browser memory, gets processed locally, and downloads directly. 
            Cloud AI tools ({totalCloud}) are clearly marked so you always know what happens with your data.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[var(--bg-elevated)] border border-emerald-200 dark:border-emerald-900 rounded-[var(--radius-lg)] p-4 text-center">
              <div className="text-sm font-semibold text-emerald-500">{localTools} Local Tools</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">Files never leave your device</div>
            </div>
            <div className="bg-[var(--bg-elevated)] border border-emerald-200 dark:border-emerald-900 rounded-[var(--radius-lg)] p-4 text-center">
              <div className="text-sm font-semibold text-emerald-500">{totalCloud} Cloud AI</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">Marked on every tool page</div>
            </div>
            <div className="bg-[var(--bg-elevated)] border border-emerald-200 dark:border-emerald-900 rounded-[var(--radius-lg)] p-4 text-center">
              <div className="text-sm font-semibold text-emerald-500">Zero Breach Surface</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">No server to breach for local tools</div>
            </div>
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
                When you load Toolzum, all tool compilers execute exclusively inside your browser's sandboxed worker thread. No metadata trackers, no temporary folders, and zero risk of file leakage.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-8 border-b border-[var(--border-subtle)] pb-12">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">WebAssembly-Driven Engine</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                We compile industry-standard processing libraries into WebAssembly binaries that run at near-native speed directly in your browser — Chrome, Safari, Firefox, or Edge. No plugins, no installs.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Offline by Design</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                After the initial load, Toolzum requires no internet connection for most operations. Perfect for off-grid work and environments with restricted network access.
              </p>
            </div>
          </div>

        </div>

        {/* Call to Actions */}
        <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-8 sm:p-12 text-center">
          <div className="space-y-2">
            <h3 className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl font-semibold">Have a suggestion?</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
              We are always looking for ideas to improve. Reach out and tell us what you would like to see next.
            </p>
          </div>
          <div className="mt-6">
            <Link href="/contact">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-[var(--radius-lg)] transition-colors text-sm">
                <HelpCircle className="w-4 h-4" /> Send Feedback
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
