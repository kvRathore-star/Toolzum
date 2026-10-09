import React from "react";
import { legalDate, formatLegalDate } from "@/lib/legal-dates.generated";
import { AlertTriangle, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Legal disclaimer for Toolzum — clarifies our role as a tool provider.",
  alternates: { canonical: "https://toolzum.com/disclaimer/" },
};

const SECTIONS = [
  {
    id: "general",
    title: "1. General Disclaimer",
    content: (
      <>
        <p className="mb-3">
          Toolzum is a browser-based utility catalog. Most tools process your files locally on your own device — we never host, store, or distribute files you process with local tools. A small number of clearly-marked AI and cloud tools send your input to our server for processing (for example, AI features powered by our AI provider, or tools that query public third-party data such as captions, exchange rates, or postal records).
        </p>
        <p>
          All company, site, and product names, logos, and trademarks referenced on this site remain the property of their respective owners and are used solely for identification. This website does not host, store, or distribute any copyrighted or pirated content, and our tools are provided as utilities for lawful content you have the right to access.
        </p>
      </>
    ),
  },
  {
    id: "tool-provider",
    title: "2. Tool Provider Role",
    content: (
      <>
        <p className="mb-3">
          Toolzum is a browser-based utility platform. We provide tools that process files locally in your browser via WebAssembly. We do not host, store, or have access to any files you process using our tools.
        </p>
        <p>
          For tools that interact with third-party APIs (such as AI-powered features), data is sent directly from your browser to the third-party provider. These tools are clearly marked on every tool page. Your files never reach our servers.
        </p>
      </>
    ),
  },
  {
    id: "no-liability",
    title: "3. No Liability for Third-Party Content",
    content: (
      <p>
        Toolzum is not responsible for the content, accuracy, legality, or availability of any third-party websites, services, or resources linked to or accessed through our tools. You acknowledge that we have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party sites or services.
      </p>
    ),
  },
  {
    id: "user-responsibility",
    title: "4. User Responsibility",
    content: (
      <>
        <p className="mb-3">You are solely responsible for:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Ensuring you have the legal right to access and process any content you use with our tools.</li>
          <li>Complying with all applicable laws and regulations in your jurisdiction.</li>
          <li>The outcomes of any processing performed by our tools on your files.</li>
        </ul>
      </>
    ),
  },
  {
    id: "accuracy",
    title: "5. No Warranty of Accuracy",
    content: (
      <p>
        The tools and services provided on this site are offered "as is" and "as available" without any representation or warranty, express or implied. Toolzum does not warrant that the tools will be error-free, uninterrupted, or that the results obtained from using the tools will be accurate or reliable.
      </p>
    ),
  },
];

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none opacity-[0.03]">
        <div className="w-full max-w-[1280px] h-full" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-sm font-semibold text-amber-600 dark:text-amber-400 mb-6">
            <AlertTriangle className="w-4 h-4" /> Legal Notice
          </span>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-7xl mb-6 tracking-tight leading-tight">
            Disclaimer
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)]">
            Important information about the Toolzum platform and your use of it.
          </p>
          <p className="text-sm font-mono text-[var(--text-muted)] mt-4">
            Last Updated: {formatLegalDate(legalDate("/disclaimer/"))}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4 mb-24">
          {SECTIONS.map((sec) => (
            <details 
              key={sec.id}
              className="group bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden"
            >
              <summary className="w-full px-6 py-5 flex items-center justify-between font-semibold text-sm sm:text-base text-left hover:bg-[var(--bg-overlay)]/40 transition-colors cursor-pointer list-none">
                <span className="text-[var(--text-primary)]">{sec.title}</span>
                <span className="text-[var(--text-muted)] group-open:text-[var(--accent)] transition-colors">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] font-sans">
                {sec.content}
              </div>
            </details>
          ))}
        </div>

        <div className="max-w-3xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-8 text-center">
          <h3 className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl font-semibold mb-2 flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-[var(--accent)]" /> Have questions?
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto mb-6">
            If you have questions about this disclaimer, feel free to contact us.
          </p>
          <Link href="/contact">
            <Button size="sm">Contact Support</Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
