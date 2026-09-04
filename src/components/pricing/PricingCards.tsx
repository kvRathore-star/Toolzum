"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Zap, Sparkles, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsIndia } from "@/hooks/useIsIndia";

type BillingInterval = "pass" | "monthly" | "yearly";

interface PricingPlan {
  price: string;
  unit: string;
  label: string;
  discount?: string;
}

const pricingData: Record<"USD" | "INR", Record<BillingInterval, PricingPlan>> = {
  USD: {
    pass: { price: "3.99", unit: "7 days", label: "7-Day Project Pass" },
    monthly: { price: "14.99", unit: "month", label: "Monthly" },
    yearly: { price: "99", unit: "year", label: "Yearly", discount: "Save 45%" },
  },
  INR: {
    pass: { price: "99", unit: "7 days", label: "7-Day Project Pass" },
    monthly: { price: "249", unit: "month", label: "Monthly" },
    yearly: { price: "1999", unit: "year", label: "Yearly", discount: "Save 33%" },
  },
};

export function PricingCards({ proCount, totalTools }: { proCount: number; totalTools: number }) {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const isIndia = useIsIndia();

  const currencySymbol = isIndia ? "₹" : "$";
  const activePricing = isIndia ? pricingData.INR : pricingData.USD;
  const currentPlan = activePricing[billingInterval];

  return (
    <>
      {/* Geo Indicator */}
      <div className="mb-8 flex items-center gap-2 text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-4 py-2 rounded-full">
        <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
        <span>
          Pricing localized for {isIndia ? "India (INR)" : "Global (USD)"} based on your connection
        </span>
      </div>

      {/* Pricing Segmented Control */}
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-1 rounded-xl flex gap-1 mb-16 relative z-20 shadow-sm">
        {(["pass", "monthly", "yearly"] as BillingInterval[]).map((interval) => (
          <button
            key={interval}
            onClick={() => setBillingInterval(interval)}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 relative ${
              billingInterval === interval
                ? "bg-[var(--accent-ink)] text-white shadow-md scale-105"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)]"
            }`}
          >
            {activePricing[interval].label}
            {activePricing[interval].discount && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[var(--success)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                {activePricing[interval].discount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full items-stretch relative z-10">
        {/* Free Tier */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 hover:border-[var(--text-muted)] hover:shadow-lg">
          <div>
            <h3 className="text-xl font-semibold mb-2">Free Plan</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Core utilities with daily usage limits. Sign in to unlock higher free quotas.
            </p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-mono font-bold text-[var(--text-primary)]">
                {currencySymbol}0
              </span>
              <span className="text-sm text-[var(--text-muted)]">/forever</span>
            </div>
            <ul className="space-y-4 text-sm text-[var(--text-secondary)] mb-8 border-t border-[var(--border-subtle)] pt-6">
              <li className="flex items-center gap-3">
                <Check className="w-4.5 h-4.5 text-[var(--success)] shrink-0" />
                <span>Single-file processing — 10-30MB per file (20-150MB after signing in)</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4.5 h-4.5 text-[var(--success)] shrink-0" />
                <span>Sequential execution + manual individual downloads</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4.5 h-4.5 text-[var(--success)] shrink-0" />
                <span>On-device processing for local tools — cloud AI tools clearly marked</span>
              </li>
              <li className="flex items-center gap-3 opacity-50">
                <div className="w-4.5 h-px bg-[var(--border-subtle)] shrink-0" />
                <span className="line-through">Pro: Unlimited bulk folders, parallel 6-thread cores, expanded memory</span>
              </li>
              <li className="flex items-center gap-3 opacity-50">
                <div className="w-4.5 h-px bg-[var(--border-subtle)] shrink-0" />
                <span className="line-through">Pro: 1-Click ZIP downloads, workflow presets, 2GB files</span>
              </li>
              <li className="flex items-center gap-3 opacity-50">
                <div className="w-4.5 h-px bg-[var(--border-subtle)] shrink-0" />
                <span className="line-through">Pro: advanced B2B media, document & data engines</span>
              </li>
            </ul>
          </div>
          <Link href="/tools" className="block">
            <Button variant="secondary" className="w-full" size="lg">
              Use Free Tools
            </Button>
          </Link>
        </div>

        {/* Pro Tier */}
        <div className="bg-[var(--bg-overlay)] border-2 border-[var(--accent)] rounded-[var(--radius-2xl)] p-8 sm:p-10 flex flex-col justify-between relative shadow-[var(--shadow-glow-accent)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(var(--accent-rgb),0.15)] transform md:-translate-y-4">
          {billingInterval === "monthly" && (
            <div className="absolute -top-3 -right-3 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg z-10">
              MOST POPULAR
            </div>
          )}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--accent-ink)] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
            <Zap className="w-3.5 h-3.5 fill-white" /> Pro Plan
          </div>

          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">Full Engine Access</h3>
              {billingInterval === "yearly" && (
                <span className="bg-[var(--success)]/20 text-[var(--success)] text-[10px] font-bold px-2 py-0.5 rounded">
                  Get 2 Months Free
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              {billingInterval === "pass"
                ? (isIndia ? 'Instant bulk processing for a single project. Pay securely with UPI.' : 'Perfect for a one-off heavy workload. One-time payment, expires automatically.')
                : billingInterval === "yearly"
                ? (isIndia ? 'Ultimate long-term utility. Breaks down to just ₹166/month.' : 'Best for teams and power users. Save 45% off monthly.')
                : (isIndia ? `Less than ₹9/day. Unlimited access for growing businesses. Recommended for Indian freelancers.` : `The standard for active freelancers and developers. Cancel anytime in 1-click.`)}
            </p>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-mono font-bold text-[var(--text-primary)]">
                {currencySymbol}
                {currentPlan.price}
              </span>
              <span className="text-sm text-[var(--text-muted)]">/{currentPlan.unit}</span>
            </div>

            <form action="/api/payments/create-order" method="POST" className="mb-8">
              <input type="hidden" name="plan" value={billingInterval} />
              <input type="hidden" name="gateway" value={isIndia ? "razorpay" : "dodo"} />
              <Button variant="primary" className="w-full whitespace-nowrap" size="lg" type="submit">
                {billingInterval === 'pass' ? `Get Project Pass — ${currencySymbol}${currentPlan.price}` : `Upgrade to Pro Now`}
              </Button>
            </form>

            <ul className="space-y-4 text-sm text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-6">
              <li className="flex items-center gap-3">
                <Check className="w-4.5 h-4.5 text-[var(--accent)] shrink-0" />
                <span className="text-[var(--text-primary)] font-medium">Unlock all {proCount}+ Pro tools with zero usage throttling</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4.5 h-4.5 text-[var(--accent)] shrink-0" />
                <span>Unlimited Bulk Processing: drop folders, expanded memory, parallel 6-thread cores</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4.5 h-4.5 text-[var(--accent)] shrink-0" />
                <span>1-Click "Download All as ZIP Archive" + save workflow presets</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4.5 h-4.5 text-[var(--accent)] shrink-0" />
                <span>Advanced B2B Engines: Bulk tools access</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4.5 h-4.5 text-[var(--accent)] shrink-0" />
                <span>Premium Media Suite: High-Speed Audio & Video Transcoders</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-4.5 h-4.5 text-[var(--accent)] shrink-0" />
                <span>Client-Side Private Processing — your data stays on your device</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

