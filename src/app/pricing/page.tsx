"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Check, Zap, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type BillingInterval = "weekly" | "monthly" | "yearly";

export default function PricingPage() {
  const [isIndia, setIsIndia] = useState(false);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");

  useEffect(() => {
    const cookies = document.cookie.split(";");
    const countryCookie = cookies.find((c) => c.trim().startsWith("user-country="));
    const country = countryCookie ? countryCookie.split("=")[1] : null;

    const isIndiaTZ = Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Kolkata";
    setIsIndia(country === "IN" || isIndiaTZ);
  }, []);

  interface PricingPlan {
    price: string;
    unit: string;
    label: string;
    discount?: string;
  }

  // Pricing structure
  const pricingData: Record<"USD" | "INR", Record<BillingInterval, PricingPlan>> = {
    USD: {
      weekly: { price: "4.99", unit: "week", label: "Weekly" },
      monthly: { price: "14.99", unit: "month", label: "Monthly" },
      yearly: { price: "99", unit: "year", label: "Yearly", discount: "Save 45%" },
    },
    INR: {
      weekly: { price: "99", unit: "week", label: "Weekly" },
      monthly: { price: "299", unit: "month", label: "Monthly" },
      yearly: { price: "1999", unit: "year", label: "Yearly", discount: "Save 44%" },
    },
  };

  const currencySymbol = isIndia ? "₹" : "$";
  const activePricing = isIndia ? pricingData.INR : pricingData.USD;
  const currentPlan = activePricing[billingInterval];

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] relative overflow-hidden">
      {/* Premium Gradient Ambient Light */}
      <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-[var(--accent)]/10 blur-[120px] rounded-full pointer-events-none" />
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
          <div className="inline-flex items-center gap-1.5 bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simple, Easy Pricing Security</span>
          </div>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-7xl mb-6 tracking-tight">
            One Plan. Total Freedom.
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Unlock the power of all 260+ tools with zero limits. No maintenance, zero server logs, completely runs on your device.
          </p>
        </div>

        {/* Geo Indicator */}
        <div className="mb-8 flex items-center gap-2 text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-4 py-2 rounded-full">
          <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
          <span>
            Pricing localized for {isIndia ? "India (INR)" : "Global (USD)"} based on your connection
          </span>
        </div>

        {/* Pricing Segmented Control */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-1 rounded-xl flex gap-1 mb-16 relative z-20 shadow-sm">
          {(["weekly", "monthly", "yearly"] as BillingInterval[]).map((interval) => (
            <button
              key={interval}
              onClick={() => setBillingInterval(interval)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 relative ${
                billingInterval === interval
                  ? "bg-[var(--accent)] text-white shadow-md scale-105"
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
                Essential utilities for occasional, daily use.
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
                  <span>Access ~180 standard utilities offline</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4.5 h-4.5 text-[var(--success)] shrink-0" />
                  <span>100% private, on-device processing</span>
                </li>
                <li className="flex items-center gap-3 opacity-50">
                  <div className="w-4.5 h-px bg-[var(--border-subtle)] shrink-0" />
                  <span className="line-through">Premium Canvas & Document editing suite</span>
                </li>
                <li className="flex items-center gap-3 opacity-50">
                  <div className="w-4.5 h-px bg-[var(--border-subtle)] shrink-0" />
                  <span className="line-through">High-traffic Video/Audio downloaders</span>
                </li>
                <li className="flex items-center gap-3 opacity-50">
                  <div className="w-4.5 h-px bg-[var(--border-subtle)] shrink-0" />
                  <span className="line-through">Interactive SaaS & Finance tools</span>
                </li>
              </ul>
            </div>
            <Button variant="secondary" className="w-full" size="lg">
              Use Free Tools
            </Button>
          </div>

          {/* Pro Tier */}
          <div className="bg-[var(--bg-overlay)] border-2 border-[var(--accent)] rounded-[var(--radius-2xl)] p-8 sm:p-10 flex flex-col justify-between relative shadow-[var(--shadow-glow-accent)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(var(--accent-rgb),0.15)] transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--accent)] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
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
                Complete access to the entire 260+ tool offline suite.
              </p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-mono font-bold text-[var(--text-primary)]">
                  {currencySymbol}
                  {currentPlan.price}
                </span>
                <span className="text-sm text-[var(--text-muted)]">/{currentPlan.unit}</span>
              </div>

              {/* Annual price anchor for monthly/weekly viewers */}
              {billingInterval !== "yearly" && (
                <p className="text-[11px] text-[var(--text-muted)] -mt-4 mb-6">
                  or{" "}
                  <span className="font-semibold text-[var(--text-primary)]">
                    {currencySymbol}{activePricing.yearly.price}
                  </span>
                  /year{" "}
                  <span className="text-[var(--success)] font-semibold">
                    (save {activePricing.yearly.discount?.replace("Save ", "")})
                  </span>
                </p>
              )}

              {/* Checkout Form */}
              <form action="/api/payments/create-order" method="POST" className="mb-8">
                <input type="hidden" name="plan" value={billingInterval} />
                <input type="hidden" name="gateway" value={isIndia ? "razorpay" : "dodo"} />
                <Button variant="primary" className="w-full whitespace-nowrap" size="lg" type="submit">
                  Upgrade to Pro ({currentPlan.label})
                </Button>
              </form>

              <ul className="space-y-4 text-sm text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-6">
                <li className="flex items-center gap-3">
                  <Check className="w-4.5 h-4.5 text-[var(--accent)] shrink-0" />
                  <span className="text-[var(--text-primary)] font-medium">Unlock all 48+ Pro tools</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4.5 h-4.5 text-[var(--accent)] shrink-0" />
                  <span>Unlimited Canvas Editors & Logo Makers</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4.5 h-4.5 text-[var(--accent)] shrink-0" />
                  <span>Full PDF & Document Conversion tools</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4.5 h-4.5 text-[var(--accent)] shrink-0" />
                  <span>Unlimited High-Quality Audio/Video conversions</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4.5 h-4.5 text-[var(--accent)] shrink-0" />
                  <span>Indian local utility tools enabled</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-4.5 h-4.5 text-[var(--accent)] shrink-0" />
                  <span>Proxy API access with 10,000 requests/day</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Money Back & Security Guarantee */}
        <div className="mt-20 flex flex-col items-center gap-4 max-w-xl text-center">
          <div className="flex items-center gap-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-6 py-4 rounded-2xl shadow-sm">
            <ShieldCheck className="w-6 h-6 text-[var(--success)] shrink-0" />
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Secure payments powered by {isIndia ? "Razorpay" : "DodoPayments"}. 30-day money-back guarantee.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-2">
            <AlertCircle className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
            <span>VPN-aware local verification blocks bypass attempts.</span>
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
