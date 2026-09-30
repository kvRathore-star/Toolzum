import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { toolsRegistry, type ToolMetadata } from '@/registry/tools';
import { ToolPageSEOContent } from '@/components/tools/ToolPageSEOContent';

// Mocks: no router in unit tests (same harness as a11y/heading-order).
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

interface LdEntry {
  '@context'?: string;
  '@type'?: string | string[];
  name?: string;
  description?: string;
  offers?: { price?: string };
  mainEntity?: { name?: string; acceptedAnswer?: { text?: string } }[];
}

/** Stratified sample: first tool of every category + a deep-FAQ tool + a partial-FAQ tool. */
function sampleTools(): ToolMetadata[] {
  const perCat = new Map<string, ToolMetadata>();
  for (const t of toolsRegistry) {
    if (!perCat.has(t.category)) perCat.set(t.category, t);
  }
  const deep = toolsRegistry.find((t) => (t.faqs?.length ?? 0) >= 4);
  const partial = toolsRegistry.find((t) => {
    const n = t.faqs?.length ?? 0;
    return n > 0 && n < 4;
  });
  const picked = [...perCat.values(), deep, partial].filter(Boolean) as ToolMetadata[];
  return [...new Map(picked.map((t) => [t.slug, t])).values()].slice(0, 30);
}

describe('tool page JSON-LD (FAQPage + SoftwareApplication emitted by ToolPageSEOContent)', () => {
  it('every sampled tool emits parseable, correct schema whose FAQ matches the visible FAQ section', () => {
    const problems: string[] = [];
    for (const tool of sampleTools()) {
      const { container } = render(<ToolPageSEOContent tool={tool} relatedTools={[]} />);
      const scripts = container.querySelectorAll('script[type="application/ld+json"]');
      if (scripts.length !== 1) {
        problems.push(`${tool.slug}: expected 1 JSON-LD block, got ${scripts.length}`);
        continue;
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(scripts[0]!.textContent || '');
      } catch (e) {
        problems.push(`${tool.slug}: JSON-LD does not parse: ${e instanceof Error ? e.message : e}`);
        continue;
      }
      const entries = (Array.isArray(parsed) ? parsed : [parsed]) as LdEntry[];
      for (const entry of entries) {
        if (!entry['@context']) problems.push(`${tool.slug}: entry missing @context`);
        if (!entry['@type']) problems.push(`${tool.slug}: entry missing @type`);
      }

      const sa = entries.find((e) => e['@type'] === 'SoftwareApplication');
      if (!sa) problems.push(`${tool.slug}: no SoftwareApplication`);
      else {
        if (sa.name !== tool.name) problems.push(`${tool.slug}: SoftwareApplication name "${sa.name}" != "${tool.name}"`);
        if (!sa.description || sa.description.trim().length < 20) problems.push(`${tool.slug}: thin SoftwareApplication description`);
        if (sa.offers?.price !== '0.00') problems.push(`${tool.slug}: offers.price != "0.00"`);
      }

      const faq = entries.find((e) => e['@type'] === 'FAQPage');
      if (!faq) {
        problems.push(`${tool.slug}: no FAQPage`);
        continue;
      }
      const main = faq.mainEntity;
      if (!Array.isArray(main) || main.length === 0) {
        problems.push(`${tool.slug}: FAQPage.mainEntity empty`);
        continue;
      }

      // Visible FAQ section: the h2 "Frequently Asked Questions" owns the FAQ h3s;
      // how-to-use and related-tools sections have their own h3s elsewhere.
      const faqH2 = [...container.querySelectorAll('h2')].find((h) =>
        h.textContent?.includes('Frequently Asked Questions')
      );
      const section = faqH2?.closest('section');
      if (!section) {
        problems.push(`${tool.slug}: FAQ section not rendered`);
        continue;
      }
      const visible = [...section.querySelectorAll('h3')].map((h) => (h.textContent || '').trim()).sort();
      const schema = main
        .map((q) => (q.name || '').trim())
        .sort();
      if (JSON.stringify(visible) !== JSON.stringify(schema)) {
        problems.push(
          `${tool.slug}: FAQ schema != visible section (${schema.length} schema vs ${visible.length} visible)`
        );
      }
      for (const q of main) {
        const name = (q.name || '').trim();
        const answer = (q.acceptedAnswer?.text || '').trim();
        if (name.length < 10) problems.push(`${tool.slug}: thin question "${name}"`);
        if (answer.length < 40) problems.push(`${tool.slug}: thin answer for "${name}" (${answer.length} chars)`);
      }
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });
});
