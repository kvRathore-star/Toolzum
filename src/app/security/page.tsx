import type { Metadata } from "next";
import { Shield, Lock, Server, FileCheck, Building2, Globe, Download, Wifi, Cpu, Code } from 'lucide-react';
import { EnterpriseCompliance } from '@/components/EnterpriseCompliance';

export const metadata: Metadata = {
  title: "Security & Architecture",
  description:
    "Toolzum's security architecture — everything runs in your browser via WebAssembly. Zero data uploads, complete transparency.",
  openGraph: {
    title: "Security & Architecture | Toolzum",
  },
};

const sections = [
  {
    icon: Shield,
    title: 'Architecture Overview',
    items: [
      'Static site hosted on Cloudflare Pages — no application server',
      'All file processing runs in your browser via WebAssembly (WASM)',
      'Zero data transmitted to external servers during processing',
      'Authentication handled by Better Auth with D1 database (no 3rd-party auth proxy)',
    ],
  },
  {
    icon: Lock,
    title: 'Data Flow',
    items: [
      'Your file → Browser memory (via File API) → WASM processing → Browser memory → Download',
      'Files are never uploaded, cached, logged, or stored on any server',
      'After download, file data is garbage-collected by the browser',
      'No background analytics track file contents or metadata',
    ],
  },
  {
    icon: Server,
    title: 'Infrastructure',
    items: [
      'CDN: Cloudflare Pages (edge network, 330+ locations)',
      'Authentication: Better Auth (D1 database on Cloudflare)',
      'Payments: Stripe (global) + Razorpay (India) — PCI-DSS compliant',
      'No application servers, no databases storing user content, no file storage buckets',
    ],
  },
  {
    icon: FileCheck,
    title: 'Compliance',
    items: [
      'GDPR Article 28 compliant — no data processing agreement needed',
      'HIPAA-friendly — no PHI transmitted or stored',
      'SOC2-type architecture — all compute client-side',
      'CCPA compliant — no personal data collected from file operations',
    ],
  },
  {
    icon: Building2,
    title: 'Enterprise Security',
    items: [
      'Content Security Policy (CSP) headers restrict all outbound connections',
      'X-Content-Type-Options: nosniff prevents MIME-type sniffing',
      'X-Frame-Options: DENY prevents clickjacking',
      'Referrer-Policy: strict-origin-when-cross-origin protects URL leaks',
      'All assets served over HTTPS with HSTS',
    ],
  },
  {
    icon: Globe,
    title: 'Third-Party Dependencies',
    items: [
      'Open source libraries loaded via CDN with integrity hashes (SRI)',
      'FFmpeg.wasm — compiled to WebAssembly, runs entirely client-side',
      'TensorFlow.js — client-side ML, no data leaves browser',
      'PDF.js, pdf-lib — client-side PDF processing',
      'No third-party cookies, no tracking pixels, no analytics scripts on tool pages',
    ],
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="max-w-[960px] mx-auto pt-32 pb-24 px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4">
            <Shield className="w-3.5 h-3.5" /> Security & Architecture
          </span>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl mb-4">Trust Through Transparency</h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Every detail of how Toolzum processes your data is documented here. No black boxes. No fine print.
          </p>
        </div>

        {/* Architecture Diagram (text-based) */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-8 mb-12">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[var(--accent)]" /> System Architecture
          </h2>
          <div className="font-mono text-xs leading-relaxed text-[var(--text-secondary)] space-y-1 bg-[var(--bg-overlay)] p-4 rounded-[var(--radius-lg)] overflow-x-auto">
            <p className="text-emerald-500 font-semibold">┌─────────────────────────────────────────────────┐</p>
            <p className="text-emerald-500 font-semibold">│              Your Browser (Client)                │</p>
            <p className="text-emerald-500 font-semibold">│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │</p>
            <p className="text-emerald-500 font-semibold">│  │ File API │─→│  WASM    │─→│ Canvas/Memory │  │</p>
            <p className="text-emerald-500 font-semibold">│  │ (Upload) │  │ (Process)│  │  (Output)     │  │</p>
            <p className="text-emerald-500 font-semibold">│  └──────────┘  └──────────┘  └──────┬───────┘  │</p>
            <p className="text-emerald-500 font-semibold">│                                     │          │</p>
            <p className="text-emerald-500 font-semibold">│                              ┌──────▼───────┐  │</p>
            <p className="text-emerald-500 font-semibold">│                              │   Download   │  │</p>
            <p className="text-emerald-500 font-semibold">│                              └──────────────┘  │</p>
            <p className="text-emerald-500 font-semibold">└─────────────────────────────────────────────────┘</p>
            <p className="text-zinc-500">         │</p>
            <p className="text-zinc-500">         │ (no data flows downward)</p>
            <p className="text-zinc-500">         ▼</p>
            <p className="text-red-400 font-semibold">┌─────────────────────────────────────────────────┐</p>
            <p className="text-red-400 font-semibold">│              ❌ No Server/Cloud                 │</p>
            <p className="text-red-400 font-semibold">│    Files NEVER uploaded, stored, or logged      │</p>
            <p className="text-red-400 font-semibold">└─────────────────────────────────────────────────┘</p>
          </div>
        </div>

        {/* Detail Sections */}
        <div className="space-y-8">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h2 className="text-lg font-bold">{section.title}</h2>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Enterprise Compliance */}
        <div className="mt-12">
          <EnterpriseCompliance />
        </div>

        {/* Report Download */}
        <div className="mt-12 text-center p-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)]">
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Need a formal security assessment for your procurement team? We maintain a comprehensive security questionnaire.
          </p>
          <a
            href="mailto:security@toolzum.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-[var(--radius-lg)] hover:bg-[var(--accent-hover)] transition-all text-sm"
          >
            <Download className="w-4 h-4" /> Request Security Package
          </a>
        </div>
      </div>
    </div>
  );
}
