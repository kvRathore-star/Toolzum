import type { Metadata } from "next";
import { Shield, Lock, Cpu, Globe, FileCheck, Download, Server, EyeOff, Wifi, Ban } from 'lucide-react';
import { EnterpriseCompliance } from '@/components/EnterpriseCompliance';
import { getCachedToolCounts } from '@/registry/tools-helpers';

const { localTools, cloudTools, hybridTools, totalImplemented } = getCachedToolCounts();
const totalCloud = cloudTools + hybridTools;
const pct = Math.round((localTools / totalImplemented) * 100);

export const metadata: Metadata = {
  title: "Security & Data Protection",
  description:
    `${localTools} of ${totalImplemented} Toolzum tools process files in your browser — zero uploads, zero server storage.`,
  alternates: { canonical: "https://toolzum.com/security/" },
  openGraph: {
    title: "Security & Data Protection | Toolzum",
  },
};

const trustMetrics = [
  { value: `${pct}%`, label: "Client-Side", sub: `${localTools} tools — no server needed` },
  { value: "0s", label: "Data Retention", sub: "Processed then garbage collected" },
  { value: totalCloud.toString(), label: "Cloud Processing", sub: `${hybridTools > 0 ? `${hybridTools} hybrid, ` : ''}clearly marked` },
  { value: `${totalImplemented}`, label: "Total Tools", sub: "all free, no signup" },
];

const comparisonPoints = [
  {
    icon: Ban,
    title: "Zero-Upload Architecture",
    desc: "Your files are loaded directly into browser memory via the File API. They never traverse a network, never reach a server, and never exist anywhere but your device."
  },
  {
    icon: Lock,
    title: "No Data to Breach",
    desc: "Competitors advertise 'auto-delete after 2 hours' — but that 2-hour window is a breach risk. If there is no server, there is no server to breach. Your files exist only in your browser session."
  },
  {
    icon: EyeOff,
    title: "No Telemetry on Your Content",
    desc: "We run zero analytics on file contents, filenames, or processing outcomes. No tracking pixels, no session replays, no metadata collection on what you process."
  },
  {
    icon: Wifi,
    title: "Works Offline",
    desc: "After the initial page load, Toolzum functions without any internet connection (local-processing tools). No network dependency during file operations."
  },
];

const securitySections = [
  {
    icon: Cpu,
    title: "Architecture",
    items: [
      "All processing via WebAssembly (WASM) — compiled C++, Rust, and Python libraries execute in your browser's sandboxed worker thread",
      "Zero data transmitted to external servers during file operations",
      "Static edge delivery via global CDN — no application servers, no file storage buckets",
      "Session management and payments are the only server-side operations, and they never touch your files"
    ],
  },
  {
    icon: Shield,
    title: "Encryption & Data Flow",
    items: [
      "Your file → Browser memory (File API) → WASM processing → Browser memory → Download",
      "Files are never uploaded, cached, logged, or stored on any server",
      "After download, file data is garbage-collected by the browser — no retention window",
      "All network communication encrypted via TLS 1.3 with HSTS"
    ],
  },
    {
        icon: Globe,
        title: "Infrastructure & Privacy",
        items: [
          "Global edge CDN with 330+ locations for fast static delivery — no application servers",
          "Local-processing tools keep your files entirely in your browser — no server round trip",
          "Client-side compute architecture — inherently auditable and transparent",
          "Cloud AI tools are clearly marked so you always know when data leaves your device"
        ],
      },
  {
    icon: FileCheck,
    title: "Enterprise Security Controls",
    items: [
      "Content Security Policy (CSP) headers — restricts all outbound connections by policy",
      "Subresource Integrity (SRI) — all open source libraries loaded with cryptographic integrity hashes",
      "X-Content-Type-Options: nosniff, X-Frame-Options: DENY, strict Referrer-Policy",
      "No third-party cookies, no advertising scripts, no external tracking on tool pages"
    ],
  },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="max-w-[960px] mx-auto pt-32 pb-24 px-4 sm:px-6">

        {/* Hero */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4">
            <Shield className="w-3.5 h-3.5" /> Security & Data Protection
          </span>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl mb-4 leading-tight">
            There is No Server.
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Traditional web tools upload your documents to a server, process them, and promise to delete them later. 
            Toolzum skips the server entirely — your files load into browser memory, process locally via WebAssembly, 
            and are downloaded directly. There is nothing to intercept, no server to breach, no file to delete.
          </p>
        </div>

        {/* Key Differentiator — Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-[var(--radius-xl)] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-5 h-5 text-red-500" />
              <span className="text-sm font-semibold text-red-700 dark:text-red-400">Server-Based Competitors</span>
            </div>
            <ul className="space-y-2 text-sm text-red-600 dark:text-red-300">
              <li className="flex items-start gap-2">— Upload your file to a cloud server</li>
              <li className="flex items-start gap-2">— Process on remote infrastructure</li>
              <li className="flex items-start gap-2">— Promise to delete after 2 hours</li>
              <li className="flex items-start gap-2">— 2-hour breach window exists</li>
            </ul>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-[var(--radius-xl)] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">No Server to Breach.</span>
            </div>
            <ul className="space-y-2 text-sm text-emerald-600 dark:text-emerald-300">
              <li className="flex items-start gap-2">— Files loaded into browser memory via File API</li>
              <li className="flex items-start gap-2">— Process locally via WebAssembly</li>
              <li className="flex items-start gap-2">— Nothing to delete — no server, no upload</li>
              <li className="flex items-start gap-2">— Zero breach surface for file data</li>
            </ul>
          </div>
        </div>

        {/* Trust Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {trustMetrics.map((m) => (
            <div key={m.label} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 text-center">
              <div className="text-2xl font-bold text-[var(--accent)] font-mono">{m.value}</div>
              <div className="text-[11px] font-semibold text-[var(--text-primary)] mt-1">{m.label}</div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Comparison Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {comparisonPoints.map((point) => {
            const Icon = point.icon;
            return (
              <div key={point.title} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{point.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{point.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Detail Sections */}
        <div className="space-y-6 mb-16">
          {securitySections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
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
        <EnterpriseCompliance />

        {/* CTA */}
        <div className="mt-12 text-center p-8 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)]">
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Need a formal security assessment for your procurement team? We maintain a comprehensive security questionnaire.
          </p>
          <a
            href="mailto:security@toolzum.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-ink)] text-white font-medium rounded-[var(--radius-lg)] hover:bg-[var(--accent-hover)] transition-all text-sm"
          >
            <Download className="w-4 h-4" /> Request Security Package
          </a>
        </div>
      </div>
    </div>
  );
}
