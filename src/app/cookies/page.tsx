import React from "react";
import {
  Cookie,
  ShieldCheck,
  Settings,
  EyeOff
} from "lucide-react";
import Link from "next/link";
import { DocumentSidebar } from "@/components/DocumentSidebar";

const SECTIONS = [
  { id: "intro", title: "1. Introduction" },
  { id: "what-are-cookies", title: "2. What Are Cookies" },
  { id: "essential", title: "3. Essential Cookies" },
  { id: "analytics", title: "4. Analytics & Privacy" },
  { id: "third-party", title: "5. Third-Party Cookies" },
  { id: "control", title: "6. Your Cookie Choices" }
];

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      
      {/* Background Grids */}
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none opacity-[0.03]">
        <div className="w-full max-w-[1280px] h-full" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="max-w-4xl mx-auto mb-16 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-sm font-semibold text-[var(--accent)] mb-6">
            <Cookie className="w-4 h-4" /> Cookies & Privacy
          </span>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-6xl mb-4 tracking-tight leading-tight">
            Cookie Policy
          </h1>
          <p className="text-sm font-mono text-[var(--text-muted)]">
            Last Updated: May 25, 2026
          </p>
        </div>

        {/* Pillars Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 flex items-start gap-4">
            <ShieldCheck className="w-8 h-8 text-[var(--accent)] shrink-0" />
            <div>
              <h2 className="font-semibold text-sm">Essential Only</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">We only use strictly necessary cookies for basic functionality. No tracking cookies, no fingerprinting.</p>
            </div>
          </div>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 flex items-start gap-4">
            <EyeOff className="w-8 h-8 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <div>
              <h2 className="font-semibold text-sm">No Personal Data</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Our privacy-first analytics collect zero personal information. No cookies are used for analytics.</p>
            </div>
          </div>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 flex items-start gap-4">
            <Settings className="w-8 h-8 text-purple-700 dark:text-purple-400 shrink-0" />
            <div>
              <h2 className="font-semibold text-sm">Full Control</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">You can accept or decline non-essential cookies at any time via our consent banner.</p>
            </div>
          </div>
        </div>

        {/* Sticky Nav + Legal Layout */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          
          <DocumentSidebar sections={SECTIONS} />

          {/* Legal Text Stream */}
          <div className="md:col-span-8 space-y-12 text-sm leading-relaxed text-[var(--text-secondary)] font-sans">
            
            <section id="intro" className="scroll-mt-28">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">1. Introduction</h3>
              <p className="mb-4">
                Toolzum respects your privacy. This Cookie Policy explains how and why we use cookies and similar storage technologies on our website.
              </p>
              <p>
                We believe in minimal, transparent data practices. Our approach to cookies reflects our core commitment: your data stays yours. This policy works alongside our <Link href="/privacy-policy" className="text-[var(--accent)] hover:underline">Privacy Policy</Link> and <Link href="/terms" className="text-[var(--accent)] hover:underline">Terms of Service</Link>.
              </p>
            </section>

            <section id="what-are-cookies" className="scroll-mt-28 border-t border-[var(--border-subtle)] pt-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">2. What Are Cookies</h3>
              <p className="mb-4">
                Cookies are small text files stored on your device by your web browser. They help websites remember your preferences, understand how you interact with the site, and enable basic functionality.
              </p>
              <p className="mb-4">
                We also use browser storage mechanisms like <strong>LocalStorage</strong> and <strong>IndexedDB</strong> to save your UI preferences, theme selection, and tool settings locally on your device.
              </p>
              <p>
                Unlike many websites, Toolzum does <strong>not</strong> use cookies for advertising, cross-site tracking, or building behavioral profiles.
              </p>
            </section>

            <section id="essential" className="scroll-mt-28 border-t border-[var(--border-subtle)] pt-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">3. Essential Cookies</h3>
              <p className="mb-4">
                Essential cookies are necessary for the website to function properly. They enable core features like:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Remembering your cookie consent preference (so we don't ask every visit)</li>
                <li>Maintaining your theme selection (dark/light mode)</li>
                <li>Storing session preferences during your visit</li>
              </ul>
              <p>
                These cookies do not collect any personally identifiable information and cannot be disabled through our consent banner, as they are required for the site to operate.
              </p>
            </section>

            <section id="analytics" className="scroll-mt-28 border-t border-[var(--border-subtle)] pt-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">4. Analytics & Privacy</h3>
              <p className="mb-4">
                We use <strong>Cloudflare Web Analytics</strong> to understand aggregate usage patterns — like which pages are most visited and general geographic regions. This analytics solution:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Does <strong>not</strong> use cookies</li>
                <li>Does <strong>not</strong> collect personal data (no IP addresses, no user IDs)</li>
                <li>Does <strong>not</strong> track individual users across sessions</li>
                <li>Provides only anonymized, aggregate metrics</li>
              </ul>
              <p>
                Because Cloudflare Web Analytics operates without cookies, it requires no consent banner opt-in under GDPR/ePrivacy regulations.
              </p>
            </section>

            <section id="third-party" className="scroll-mt-28 border-t border-[var(--border-subtle)] pt-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">5. Third-Party Cookies</h3>
              <p className="mb-4">
                Toolzum does <strong>not</strong> set any third-party cookies. We do not integrate advertising networks, social media pixels, or external tracking scripts that would place cookies from other domains.
              </p>
              <p className="mb-4">
                If you choose to make a payment through our billing portal, your transaction is handled by an authorized payment gateway (Razorpay or Dodo Payments) under their own privacy and cookie policies. Those services may set their own cookies during the checkout process.
              </p>
              <p>
                We recommend reviewing the privacy policies of those payment providers before completing a transaction.
              </p>
            </section>

            <section id="control" className="scroll-mt-32">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">6. Your Cookie Choices</h3>
              <div className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)] space-y-4">
                <p>You have full control over cookies and storage:</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li><strong>Consent Banner:</strong> When you first visit, our banner lets you Accept or Decline non-essential storage.</li>
                  <li><strong>Browser Settings:</strong> Most browsers allow you to view, block, or delete cookies in their settings.</li>
                  <li><strong>Clear Data:</strong> You can clear LocalStorage, IndexedDB, and cookies at any time through your browser's developer tools or privacy settings.</li>
                  <li><strong>No Impact:</strong> Declining cookies will not break the core functionality of our tools — all processing still works locally.</li>
                </ul>
              </div>
            </section>

          </div>

        </div>

      </div>
    </div>
  );
}
