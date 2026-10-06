import { describe, it, expect } from 'vitest';
import { toolsRegistry } from '@/registry/tools';
import { defaultFaqsFor } from '@/components/tools/ToolPageSEOContent';

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
    expect(limits ? limits.answer : '').toMatch(/fair daily limits/i);
    const free = defaultFaqsFor(bySlug.get('password-generator'));
    const usage = free.find((f) => /limits|free/i.test(f.question));
    expect(usage ? usage.answer : '').toMatch(/no signup|completely free/i);
  });
});
