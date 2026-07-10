"use client";

import React from 'react';
import { Shield, Lock, Server, FileCheck, Building2, Globe } from 'lucide-react';

const complianceItems = [
  {
    icon: Shield,
    title: 'Zero-Trust Architecture',
    desc: 'All file processing runs 100% in your browser via WebAssembly. Your data never touches any server — not ours, not a third party.',
  },
  {
    icon: Lock,
    title: 'GDPR & SOC2 Ready',
    desc: 'Because files never leave your device, no data processing agreement is needed. Toolzum is inherently compliant with GDPR Article 28, HIPAA, and corporate IT policies.',
  },
  {
    icon: Server,
    title: 'No Cloud Storage',
    desc: 'Files are processed in browser memory and immediately garbage-collected. Nothing is cached, logged, or stored. No shadow IT risk.',
  },
  {
    icon: FileCheck,
    title: 'Corporate Policy Safe',
    desc: 'IT administrators can whitelist Toolzum without data exfiltration concerns. No API calls to external AI models. No upload queues. No data leaks.',
  },
  {
    icon: Building2,
    title: 'Legal & Finance Grade',
    desc: 'Law firms process confidential contracts. Accountants handle tax documents. Healthcare workers manage patient records — all without violating compliance mandates.',
  },
  {
    icon: Globe,
    title: 'Works Offline & Air-Gapped',
    desc: 'After initial page load, Toolzum functions without internet access. Suitable for classified environments, government networks, and remote field operations.',
  },
];

export function EnterpriseCompliance() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-4">
          <Shield className="w-3.5 h-3.5" /> Enterprise & GDPR Compliance
        </span>
        <h2 className="font-[family-name:var(--font-serif)] text-4xl text-[var(--text-primary)] mb-3">
          Built for the Most Regulated Environments
        </h2>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          Corporate policies forbid uploading financial data, medical records, or sensitive contracts to external servers.{' '}
          <strong>Because Toolzum runs 100% locally in your browser, your files never leave your machine.</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {complianceItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] hover:border-emerald-500/20 transition-all">
              <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{item.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-[var(--radius-xl)] text-center">
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          <strong className="font-semibold">Zero data leaves your device.</strong> No accounts needed for processing. No cloud uploads. No logs. No tracking.{' '}
          <a href="/pricing" className="underline hover:no-underline font-semibold">Toolzum is safe for enterprise use.</a>
        </p>
      </div>
    </section>
  );
}
