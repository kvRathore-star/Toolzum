import { ShieldCheck, AlertCircle, Sparkles } from "lucide-react";
import { getCachedToolCounts } from "@/registry/tools-helpers";
import { EnterpriseCompliance } from "@/components/EnterpriseCompliance";
import { PricingCards } from "@/components/pricing/PricingCards";

const { localTools, cloudTools, hybridTools, freeTierTotal, totalImplemented, proTools } = getCachedToolCounts();
const totalCloud = cloudTools + hybridTools;

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] relative overflow-hidden">
      {/* Premium Gradient Ambient Light */}
      <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-[var(--accent-ink)]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] bg-[var(--success)]/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Abstract Grid Background */}
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none opacity-[0.03]">
        <div
          className="w-full max-w-[1280px] h-full"
          style={{
            backgroundImage:
              "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto pt-32 pb-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 bg-[var(--accent-ink)]/10 text-[var(--accent)] text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simple, Easy Pricing Security</span>
          </div>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-7xl mb-6 tracking-tight">
            One Plan. Total Freedom.
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Unlock the power of all {totalImplemented} tools with zero limits. {localTools} run locally on your device — your files are never uploaded, never stored.
          </p>
        </div>

        <PricingCards proCount={proTools} totalTools={totalImplemented} />

        {/* Feature Comparison Table */}
        <div className="w-full max-w-4xl mt-20">
          <h2 className="text-2xl font-bold text-center mb-8 font-[family-name:var(--font-serif)]">Compare Plans</h2>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-overlay)]">
                  <th className="text-left px-6 py-4 font-semibold text-[var(--text-primary)]">Feature</th>
                  <th className="text-center px-4 py-4 font-semibold text-[var(--text-muted)]">Free / Sign in</th>
                  <th className="text-center px-4 py-4 font-semibold text-[var(--accent)]">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {[
                  ['Max file size', '10-30MB / 20-150MB', '2GB'],
                  ['Server downloads (daily)', '3 / 5 per day (Pro tools: 0 / 2)', 'Unlimited'],
                  ['Pro tools access', 'Blocked as guest · 2/day after free sign-in', 'Full unlimited access'],
                  ['Batch processing', '1 / 10 files', '500 files'],
                  ['Processing speed', 'Standard (1 thread)', 'Parallel (6 threads)'],
                  ['ZIP batch download', 'Single-file only', '✓ Batch ZIP'],
                  ['Watermark-free export', '—', '✓'],
                  ['Workflow presets', '—', 'Unlimited'],
                  ['AI-powered tools', '5 trial AI credits', '200 AI credits/mo'],
                  ['Priority support', '—', 'Email 4h response'],
                  ['White-label export', '—', '✓'],
                  ['Team seats', '1', '1 (Team plan coming)'],
                ].map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-[var(--bg-overlay)]/50' : ''}>
                    <td className="px-6 py-3.5 text-[var(--text-primary)] font-medium">{row[0]}</td>
                    <td className="text-center px-4 py-3.5 text-[var(--text-muted)]">{row[1]}</td>
                    <td className="text-center px-4 py-3.5 text-emerald-600 dark:text-emerald-400 font-semibold">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[var(--text-muted)] text-center mt-3">First value: anonymous users • Second value: after signing in for free</p>
        </div>

        {/* Enterprise Compliance */}
        <EnterpriseCompliance />

        {/* Money Back & Security Guarantee */}
        <div className="mt-20 flex flex-col items-center gap-4 max-w-xl text-center">
          <div className="flex items-center gap-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-6 py-4 rounded-2xl shadow-sm">
            <ShieldCheck className="w-6 h-6 text-[var(--success)] shrink-0" />
            <p className="text-sm font-medium text-[var(--text-primary)]">
              30-day money-back guarantee.
            </p>
          </div>
          </div>

        {/* Trust Signals */}
        <div className="mt-24 text-center border-t border-[var(--border-subtle)] pt-12 w-full max-w-4xl">
          <p className="text-base font-medium text-[var(--text-secondary)]">
            Used by students, freelancers, and developers globally.
          </p>
        </div>
      </div>
    </div>
  );
}

