"use client";

import React, { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Scale, 
  HelpCircle, 
  Globe, 
  FileText,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function TermsOfServicePage() {
  const [expandedSection, setExpandedSection] = useState<string | null>("acceptance");

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const SECTIONS: AccordionItem[] = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: (
        <>
          <p className="mb-3">
            By accessing or using the ToolHub platform, web application, and browser extensions (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms") and all applicable local regulations.
          </p>
          <p>
            If you do not agree to these Terms, you are prohibited from using or accessing the Service. The materials contained in this website are protected by applicable copyright and trademark laws.
          </p>
        </>
      )
    },
    {
      id: "service-description",
      title: "2. Description of Service",
      content: (
        <>
          <p className="mb-3">
            ToolHub is an offline-first browser utility catalog. All processing (including PDF compilation, code formatting, canvas editing, and image transformation) occurs client-side inside your browser sandbox.
          </p>
          <p>
            We reserve the right to modify, suspend, or terminate any component of the Service (including individual tools) at any time without notice.
          </p>
        </>
      )
    },
    {
      id: "prohibited",
      title: "3. Prohibited Conduct",
      content: (
        <>
          <p className="mb-3">When using ToolHub, you agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-3">
            <li>Attempt to scrape, script, or automatedly execute the tools via botting frameworks without a valid API subscription.</li>
            <li>Use local sandboxes to compile malware, construct fraudulent templates (such as fake invoices), or generate illegal materials.</li>
            <li>Interfere with or disrupt the networks hosting the Service CDN resources.</li>
          </ul>
          <p>
            Any violation of these terms may result in immediate suspension of access to our cloud gateways and API services.
          </p>
        </>
      )
    },
    {
      id: "intellectual",
      title: "4. Intellectual Property",
      content: (
        <>
          <p className="mb-3">
            The design, branding, and custom styling systems of ToolHub are the sole property of ToolHub Inc. Individual utilities that implement open-source WebAssembly libraries (such as FFmpeg, Rust decoders, or PDF writers) remain licensed under their respective original open-source boundaries (MIT, GPL, etc.).
          </p>
          <p>
            We grant you a personal, non-exclusive, non-transferable license to execute the compiled code inside your web browser for personal or commercial productivity purposes.
          </p>
        </>
      )
    },
    {
      id: "liability",
      title: "5. Limitation of Liability",
      content: (
        <>
          <div className="flex gap-3 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg p-4 mb-4 text-amber-500 font-mono text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <strong>DISCLAIMER OF WARRANTY:</strong> THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY REPRESENTATION OR WARRANTY, EXPRESS OR IMPLIED.
            </div>
          </div>
          <p className="mb-3">
            Because all file-handling operations run locally inside your browser, ToolHub Inc. has no control over, and assumes no responsibility for, the outcomes of your processed files, calculations, or data.
          </p>
          <p>
            In no event shall ToolHub Inc. or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the Service.
          </p>
        </>
      )
    },
    {
      id: "changes",
      title: "6. Changes to Terms",
      content: (
        <>
          <p className="mb-3">
            ToolHub Inc. may revise these Terms of Service at any time without notice. By using the Service, you are agreeing to be bound by the then-current version of these Terms.
          </p>
          <p>
            We advise reviewing this page periodically for updates.
          </p>
        </>
      )
    }
  ];

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
            <Scale className="w-3.5 h-3.5" /> Service Agreements
          </div>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-7xl mb-6 tracking-tight leading-tight">
            Terms of Service
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)]">
            Please read these guidelines carefully before using the ToolHub client compilers.
          </p>
        </div>

        {/* Accordions Wrapper */}
        <div className="max-w-3xl mx-auto space-y-4 mb-24">
          
          {SECTIONS.map((sec) => {
            const isExpanded = expandedSection === sec.id;
            return (
              <div 
                key={sec.id} 
                className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden transition-all duration-300"
              >
                {/* Clickable Header */}
                <button
                  onClick={() => toggleSection(sec.id)}
                  className="w-full px-6 py-5 flex items-center justify-between font-semibold text-sm sm:text-base text-left hover:bg-[var(--bg-overlay)]/40 transition-colors"
                >
                  <span className="text-[var(--text-primary)]">{sec.title}</span>
                  {isExpanded ? <ChevronUp className="w-4.5 h-4.5 text-[var(--accent)]" /> : <ChevronDown className="w-4.5 h-4.5 text-[var(--text-muted)]" />}
                </button>

                {/* Content Area */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] font-sans">
                    {sec.content}
                  </div>
                )}

              </div>
            );
          })}

        </div>

        {/* CTA help info */}
        <div className="max-w-3xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-8 text-center">
          <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-[var(--accent)]" /> Have questions?
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto mb-6">
            If you need legal clearances, DPA guidelines, or local deployment details, feel free to contact us.
          </p>
          <Link href="/contact">
            <Button size="sm">Contact Support</Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
