import { describe, it, expect } from 'vitest';
import { toolsRegistry } from '@/registry/tools';
import { defaultFaqsFor } from '@/components/tools/ToolPageSEOContent';
import { categoryFaqTemplates } from '@/components/tools/ToolPageSEOContent';
import { classifyDependencies } from '@/lib/cloudPatterns';
import { DOWNLOAD_PRODUCING_SLUGS } from '@/lib/downloadProducingSlugs';
import { proSlugs } from '@/registry/tools-constants';

/**
 * Tool content standard (Oct 5 agency pass): custom FAQ sets must have
 * 4–7 Q&As (9 is bloat, 3 is thin — count follows tool importance), and no
 * question may be shared by 3+ tools (the 46x-duplicate incident).
 * Tools without custom FAQs fall back to category templates (gated
 * separately by scripts/faq-gate.ts).
 */
describe('tool content standard', () => {
  const customs = (toolsRegistry as any[]).filter(
    (t: any) => !t.id?.startsWith('seo-') && (t.faqs?.length ?? 0) > 0
  );

  it('custom FAQ sets have 4–7 questions', () => {
    const bad = customs
      .filter((t: any) => t.faqs.length < 4 || t.faqs.length > 7)
      .map((t: any) => `${t.slug} (${t.faqs.length})`);
    expect(bad).toEqual([]);
  });

  it('no question shared by 3+ tools', () => {
    const owners: Record<string, Set<string>> = {};
    for (const t of customs as any[])
      for (const f of t.faqs || []) {
        const q = String(f.question || '').trim().toLowerCase();
        if (!q) continue;
        owners[q] ||= new Set();
        owners[q].add(t.slug);
      }
    const shared = Object.entries(owners)
      .filter(([, s]) => s.size > 2)
      .map(([q, s]) => `${s.size}x "${q.slice(0, 50)}" (${[...s].slice(0, 3).join(',')})`);
    expect(shared).toEqual([]);
  });

  it('answers are substantive (40+ chars)', () => {
    const thin = (customs as any[]).flatMap((t: any) =>
      (t.faqs || [])
        .filter((f: any) => String(f.answer || '').length < 40)
        .map((f: any) => `${t.slug}: "${String(f.question || '').slice(0, 40)}"`)
    );
    expect(thin).toEqual([]);
  });

  it('fallback FAQs are honest per tool (no unconditional absolutes)', () => {
    // Gated/cloud tools must disclose limits; free-local tools keep the
    // plain truth. Spot-check both sides through the real function.
    const bySlug = new Map((toolsRegistry as any[]).map((t: any) => [t.slug, t]));
    const gated = defaultFaqsFor(bySlug.get('qr-code-generator'));
    const limits = gated.find((f) => /limits|free/i.test(f.question));
    expect(limits ? limits.answer : '').toMatch(/2 free downloads a day/i);
    const free = defaultFaqsFor(bySlug.get('password-generator'));
    const usage = free.find((f) => /limits|free/i.test(f.question));
    expect(usage ? usage.answer : '').toMatch(/no signup|completely free/i);
  });

  it('category templates never promise absolutes to gated tools', () => {
    // Oct 5 catch: Utility/Converter static sentences rendered false claims
    // on gated tools. Templates must branch like defaultFaqsFor does.
    const ABS = [
      /Completely free with no usage limits/,
      /No artificial limits/,
      /runs entirely offline/,
      /never uploaded to any server\./,
      /No signup or account required\./,
      /No sign-?up needed\./,
    ];
    const bad: string[] = [];
    for (const t of toolsRegistry as any[]) {
      if (t.id?.startsWith('seo-') || (t.faqs?.length ?? 0) > 0) continue;
      const fn = (categoryFaqTemplates as any)[t.category];
      if (!fn) continue;
      const faqs = typeof fn === 'function' ? fn(t) : fn;
      const gated =
        (proSlugs as readonly string[]).includes(t.slug) ||
        (DOWNLOAD_PRODUCING_SLUGS as Set<string>).has(t.slug) ||
        classifyDependencies(t.dependencies || '') !== 'local';
      if (!gated) continue;
      const text = faqs.map((f: any) => `${f.question} ${f.answer}`).join(' || ');
      for (const rx of ABS) if (rx.test(text)) bad.push(`${t.slug}: ${rx.source.slice(0, 35)}`);
    }
    expect(bad).toEqual([]);
  });
});
