"use client";

import React from 'react';
import Link from 'next/link';
import {
  Crown, Sparkles, Zap, ShieldCheck, Upload, Check, ArrowRight,
  ChevronRight, FileText, Image, Code2, Briefcase, Wrench,
  Mic, Video, Cpu, Users, Star, Layers
} from 'lucide-react';
import { getCategoryTheme } from '@/lib/categoryTheme';
import type { ToolMetadata } from '@/registry/tools';
import { Button } from '@/components/ui/button';
import { useIsIndia } from '@/hooks/useIsIndia';

const BENEFITS = [
  { icon: Upload, title: 'Batch up to 500 files', desc: 'Process hundreds of files at once — images, PDFs, audio, and video.' },
  { icon: Zap, title: 'No file size limits', desc: 'Upload files up to 500MB. No more worrying about arbitrary caps.' },
  { icon: Layers, title: 'Parallel processing', desc: '6-thread parallel processing for faster conversions and compressions.' },
  { icon: Star, title: 'AI-powered tools', desc: 'Full access to AI tools — document chat, image generation, and more.' },
  { icon: ShieldCheck, title: 'Privacy first', desc: 'All processing stays in your browser. Zero uploads, zero logs, zero tracking.' },
  { icon: Crown, title: 'White-label export', desc: 'Export watermarked results without branding included.' },
];

function groupProTools(tools: ToolMetadata[]): Record<string, ToolMetadata[]> {
  const groups: Record<string, ToolMetadata[]> = {};
  for (const tool of tools) {
    if (!groups[tool.category]) groups[tool.category] = [];
    groups[tool.category].push(tool);
  }
  return groups;
}

const CATEGORY_SUMMARIES: Record<string, { icon: React.ElementType; desc: string }> = {
  AI: { icon: Cpu, desc: 'Intelligent content creation, generation, and analysis tools.' },
  PDF: { icon: FileText, desc: 'Batch PDF processing, merge, compress, convert, and extract.' },
  Image: { icon: Image, desc: 'Bulk image conversion, compression, resizing, and enhancement.' },
  Video: { icon: Video, desc: 'Batch video compression, format conversion, and subtitle burning.' },
  Audio: { icon: Mic, desc: 'Bulk audio format conversion, normalization, and processing.' },
  Developer: { icon: Code2, desc: 'Development utilities for batch operations and data processing.' },
  SEO: { icon: Wrench, desc: 'SEO tools for bulk URL checking and link validation.' },
  Privacy: { icon: ShieldCheck, desc: 'Privacy tools for bulk metadata stripping and anonymization.' },
  'E-commerce': { icon: Briefcase, desc: 'E-commerce tools for bulk image and data processing.' },
};

const CATEGORY_ORDER = ['AI', 'PDF', 'Image', 'Video', 'Audio', 'Developer', 'SEO', 'Privacy', 'E-commerce'];

export function PremiumToolsClient({ proTools, proCount, toolCount }: { proTools: ToolMetadata[]; proCount: number; toolCount: number }) {
  const isIndia = useIsIndia();

  const proPrice = isIndia ? "₹249" : "$14.99";
  const proPriceSuffix = isIndia ? "/month" : "/month, cancel anytime";

  const grouped = groupProTools(proTools);
  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] right-1/4 w-[400px] h-[400px] bg-[var(--accent-ink)]/8 blur-[100px] rounded-full pointer-events-none" />

      {/* ===== HERO ===== */}
      <section className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-sm font-semibold text-amber-500 mb-6">
            <Crown className="w-4 h-4" />
            <span>Pro Tools</span>
          </div>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight mb-6">
            Professional-grade tools<br />
            <span className="text-[var(--accent)]">for power users.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed mb-8">
            {proCount} premium tools for batch processing, AI-powered workflows,
            and advanced media operations. All in your browser. Nothing leaves your device.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/pricing">
              <Button variant="primary" size="lg">
                Upgrade to Pro <Crown className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <span className="text-sm text-[var(--text-muted)]">from {proPrice}/mo</span>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: proCount, label: 'Pro Tools', sub: 'Across 9+ categories' },
            { value: toolCount, label: 'Total Tools', sub: 'Privacy-first, client-side' },
            { value: '500', label: 'Batch Files', sub: 'Per operation' },
            { value: '500MB', label: 'Max File Size', sub: 'Per upload' },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)]">
              <div className="font-mono text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-[var(--text-secondary)]">{stat.label}</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRO TOOLS BY CATEGORY ===== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl text-[var(--text-primary)] mb-3">
            All Pro Tools
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            Every pro tool organized by category. Unlock unlimited access with a single plan.
          </p>
        </div>

        <div className="space-y-16">
          {sortedCategories.map(category => {
            const tools = grouped[category];
            const theme = getCategoryTheme(category);
            const summary = CATEGORY_SUMMARIES[category];
            const Icon = summary?.icon || theme.icon;

            return (
              <div key={category}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-full ${theme.bgTint} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${theme.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--text-primary)]">{category} Tools</h3>
                    {summary && <p className="text-sm text-[var(--text-secondary)]">{summary.desc}</p>}
                  </div>
                  <div className="ml-auto hidden sm:block">
                    <Link href={`/${category.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-sm text-[var(--accent)] hover:underline flex items-center gap-1">
                      Browse all {category} <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {tools.map(tool => {
                    const theme = getCategoryTheme(tool.category);
                    const Icon = theme.icon;
                    return (
                      <Link
                        key={tool.slug}
                        href={`/${tool.category.toLowerCase().replace(/\s+/g, '-')}/${tool.slug}`}
                        className="group block p-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] transition-all duration-200 hover:border-amber-500/30 hover:shadow-md hover:-translate-y-0.5"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg ${theme.bgTint} flex items-center justify-center shrink-0`}>
                            <Icon className={`w-4 h-4 ${theme.iconColor}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <h4 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                                {tool.name}
                              </h4>
                              <Crown className="w-3 h-3 text-amber-500 shrink-0" />
                            </div>
                            <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== WHY GO PRO ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto border-t border-[var(--border-subtle)]">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-sm font-semibold text-amber-500 mb-4">
            <Sparkles className="w-4 h-4" /> Why Go Pro
          </span>
          <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl text-[var(--text-primary)] mb-3">
            Everything you need to scale
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            Stop hitting limits. Start moving faster.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {BENEFITS.map((benefit, i) => (
            <div key={i} className="p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] hover:border-[var(--border-default)] transition-colors">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                <benefit.icon className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{benefit.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRICING COMPARISON ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto border-t border-[var(--border-subtle)]">
        <div className="text-center mb-12">
          <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl text-[var(--text-primary)] mb-3">
            Free vs Pro
          </h2>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            See what you unlock when you upgrade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-10">
          <div className="p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)]">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Free</span>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mb-4">$0</div>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Single file processing</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Basic file size limits (10-50MB)</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Unlimited client-side tools</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Local processing</span></li>
              <li className="flex items-start gap-2 text-[var(--text-muted)]"><span className="w-4 mt-0.5 shrink-0 text-center">—</span><span>Batch processing</span></li>
              <li className="flex items-start gap-2 text-[var(--text-muted)]"><span className="w-4 mt-0.5 shrink-0 text-center">—</span><span>AI tools</span></li>
            </ul>
          </div>
          <div className="p-6 bg-[var(--accent-ink)]/5 border-2 border-[var(--accent)] rounded-[var(--radius-xl)] relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[var(--accent-ink)] text-white text-[10px] font-mono uppercase tracking-wider rounded-full">Popular</div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-mono text-amber-500 uppercase tracking-wider">Pro</span>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">{proPrice}</div>
            <div className="text-xs text-[var(--text-muted)] mb-4">{proPriceSuffix}</div>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Batch up to 500 files at once</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>No file size limits</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Unlimited monthly uses</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Local processing</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Batch processing</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>All AI tools</span></li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Link href="/pricing">
            <Button variant="primary" size="lg">
              See full pricing <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto border-t border-[var(--border-subtle)]">
        <div className="text-center mb-12">
          <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl text-[var(--text-primary)] mb-3">
            Frequently asked questions
          </h2>
        </div>
        <div className="max-w-2xl mx-auto space-y-4">
          {[
            { q: 'How does the Pro plan work?', a: 'Pro gives you unlimited access to all premium tools, batch processing, larger file sizes, and AI features. All for a single monthly price.' },
            { q: 'Can I try before buying?', a: 'Free tools are available without any payment. When you hit a limit (batch size, file size, or AI usage), you will see an option to upgrade.' },
            { q: 'What happens to my files?', a: 'Nothing. Most tools process files entirely in your browser — files never leave your device. A few tools (AI Image Generator, Text-to-Speech) use cloud APIs for features that require server-side processing. We cannot see or store your data for local tools.' },
            { q: 'Is there a free plan?', a: 'Yes. Free users get unlimited access to all standard tools with single-file processing, basic file size limits, and limited AI usage.' },
            { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your subscription at any time. Your Pro access continues until the end of your billing period.' },
          ].map((faq, i) => (
            <details key={i} className="group bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] transition-colors list-none">
                {faq.q}
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-open:rotate-90 transition-transform shrink-0" />
              </summary>
              <div className="px-4 pb-4 text-sm text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-3">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto border-t border-[var(--border-subtle)]">
        <div className="max-w-2xl mx-auto text-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-10 sm:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px]" />
          <Crown className="w-10 h-10 text-amber-500 mx-auto mb-4" />
          <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl text-[var(--text-primary)] mb-3">
            Ready to go Pro?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
            Join thousands of professionals who rely on our tools daily.
            Upgrade in seconds, cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/pricing">
              <Button variant="primary" size="lg">
                Upgrade to Pro <Crown className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/tools">
              <Button variant="secondary" size="lg">
                Browse free tools
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
