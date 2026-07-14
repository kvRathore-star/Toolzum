"use client";

import React, { useState } from "react";
import { 
  ShieldAlert, 
  FileText, 
  EyeOff, 
  Database,
  Lock,
  ArrowUp
} from "lucide-react";

const SECTIONS = [
  { id: "intro", title: "1. Introduction" },
  { id: "local-processing", title: "2. Client-Side Processing Pledge" },
  { id: "data-collection", title: "3. Information We Collect" },
  { id: "cookies", title: "4. Cookies and Session Memory" },
  { id: "third-party", title: "5. Third-Party Integrations" },
  { id: "security", title: "6. Security Architecture" },
  { id: "dpdp", title: "7. Data Protection (India DPDP Act)" }
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("intro");

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      
      {/* Background Grids */}
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none opacity-[0.03]">
        <div className="w-full max-w-[1280px] h-full" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="max-w-4xl mx-auto mb-16 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--accent)] mb-6">
            <Lock className="w-3.5 h-3.5" /> Privacy & Security
          </div>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-6xl mb-4 tracking-tight leading-tight">
            Privacy Policy
          </h1>
          <p className="text-sm font-mono text-[var(--text-muted)]">
            Last Updated: May 25, 2026
          </p>
        </div>

        {/* Super Strength Statement */}
        <div className="max-w-4xl mx-auto mb-12 p-6 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-[var(--radius-xl)] text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-mono uppercase tracking-wider mb-3">
            <ShieldAlert className="w-3 h-3" /> Our Core Promise
          </div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            We Cannot See Your Files. Period.
          </h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Unlike traditional services that upload your documents to cloud servers and promise to delete them later, 
            Toolzum <strong>never sends your files anywhere</strong>. Every tool loads, processes, and outputs data 
            entirely within your browser's memory via WebAssembly. There is no server-side copy of your file — 
            not even temporarily. This is not a feature; it is the foundation of our architecture.
          </p>
        </div>

        {/* Pillars Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 flex items-start gap-4">
            <EyeOff className="w-8 h-8 text-[var(--accent)] shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">No Server Logs</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">We do not see or retain your upload strings, documents, or image pixels.</p>
            </div>
          </div>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 flex items-start gap-4">
            <Database className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">Local Storage ONLY</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Application states and preferences are cached locally inside IndexedDB.</p>
            </div>
          </div>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 flex items-start gap-4">
            <ShieldAlert className="w-8 h-8 text-purple-400 shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">Offline Isolation</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">All compiled WebAssembly operations execute without sending outbound API pings.</p>
            </div>
          </div>
        </div>

        {/* Sticky Nav + Legal Layout */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          
          {/* Sticky Sidebar Navigation */}
          <div className="md:col-span-4 sticky top-28 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 hidden md:block">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-4 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> Document Sections
            </h3>
            <ul className="space-y-3">
              {SECTIONS.map((sec) => (
                <li key={sec.id}>
                  <button
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full text-left text-xs font-medium transition-colors hover:text-white ${
                      activeSection === sec.id 
                      ? "text-[var(--accent)] font-semibold" 
                      : "text-[var(--text-secondary)]"
                    }`}
                  >
                    {sec.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Text Stream */}
          <div className="md:col-span-8 space-y-12 text-sm leading-relaxed text-[var(--text-secondary)] font-sans">
            
            <section id="intro" className="scroll-mt-28">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">1. Introduction</h3>
              <p className="mb-4">
                Welcome to Toolzum. We value the privacy of our visitors and users above all else. This Privacy Policy details our infrastructure configuration and absolute client-side isolation architecture.
              </p>
              <p>
                By using Toolzum (the "Service"), you accept that all files, images, code, and calculation strings are processed directly inside your device's web browser, and agree to the storage guidelines listed below.
              </p>
            </section>

            <section id="local-processing" className="scroll-mt-28 border-t border-[var(--border-subtle)] pt-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">2. Client-Side Processing Pledge</h3>
              <p className="mb-4">
                <strong>Our Core Philosophy is simple:</strong> We do not upload your media.
              </p>
              <p className="mb-4">
                Traditional utility sites transmit user documents to backend queues to run formatting scripts. Toolzum compiles C++ libraries and JavaScript tools into WebAssembly binaries that execute locally inside a sandboxed client thread.
              </p>
              <p>
                This ensures that your files (such as confidential business PDFs, identification files, or private photo pixels) never exit your device to traverse the internet.
              </p>
            </section>

            <section id="data-collection" className="scroll-mt-28 border-t border-[var(--border-subtle)] pt-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">3. Information We Collect</h3>
              <p className="mb-4">
                Because all processing operations occur locally, our API servers do not collect:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Files uploaded to converters, PDF compressors, or image editors.</li>
                <li>Content, text strings, or inputs entered into developer calculators or humanizers.</li>
                <li>Cryptographic hashes, passwords, or secure notes generated locally.</li>
              </ul>
              <p>
                We only collect basic, anonymized static telemetry (such as page route views and errors) via localized tracking pixels to analyze platform optimization and check overall compilation crashes.
              </p>
            </section>

            <section id="cookies" className="scroll-mt-28 border-t border-[var(--border-subtle)] pt-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">4. Cookies and Session Memory</h3>
              <p className="mb-4">
                Toolzum utilizes browser storage mechanisms (LocalStorage, SessionStorage, and IndexedDB) to save settings, UI preferences, and user states (such as checklist items, upvotes, and custom styling themes).
              </p>
              <p>
                These states remain persistently cached on your browser and can be completely purged at any time by clearing your browser cache.
              </p>
            </section>

            <section id="third-party" className="scroll-mt-28 border-t border-[var(--border-subtle)] pt-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">5. Third-Party Integrations</h3>
              <p className="mb-4">
                We do not sell, rent, or lease any analytical details or user data. We host the Toolzum compiler framework on global CDN edge nodes (Cloudflare/Pages) to deliver files to your browser efficiently.
              </p>
              <p>
                When you initiate payment requests (such as upgraded cloud quotas), your transactions are handled directly through authorized secure portal gateways (e.g. Razorpay or Dodo) under their respective privacy parameters.
              </p>
            </section>

            <section id="security" className="scroll-mt-28 border-t border-[var(--border-subtle)] pt-8">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">6. Security Architecture</h3>
              <p className="mb-4">
                Our code compiles utilizing strict Content Security Policies (CSP) to block arbitrary external scripting injections. We run weekly audits to ensure dependencies remain clear of known vulnerabilities.
              </p>
              <p>
                Should you have any questions regarding privacy audits, please inspect the public developer repository or write to us through our contact form.
              </p>
            </section>

            <section id="dpdp" className="scroll-mt-32">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3">7. Data Protection (India DPDP Act 2023)</h3>
              <div className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)] space-y-4">
                <p>Toolzum complies with India's Digital Personal Data Protection Act, 2023.</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li><strong>Data Fiduciary:</strong> Toolzum Inc.</li>
                  <li><strong>Grievance Officer:</strong> Reachable at support@toolzum.com</li>
                  <li><strong>Data we collect:</strong> Usage analytics (anonymised), account email (if logged in).</li>
                  <li><strong>Your rights:</strong> Right to access, correct, and erase your personal data.</li>
                  <li><strong>Retention:</strong> Analytics data retained for 90 days. Account data retained until deletion.</li>
                  <li><strong>Contact:</strong> For data requests, email support@toolzum.com within 72 hours response SLA.</li>
                </ul>
              </div>
            </section>

            {/* Scroll back to top button */}
            <div className="flex justify-center border-t border-[var(--border-subtle)] pt-8 mt-12">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-white transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" /> Back to Top
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
