import { describe, it, expect } from 'vitest';
import { toolsRegistry } from '@/registry/tools';
import { classifyDependencies } from '@/lib/cloudPatterns';
import { categoryFaqTemplates } from '@/components/tools/ToolPageSEOContent';

// Local-only claim shapes. A cloud/hybrid tool carrying any of these in ANY
// rendered copy (description, FAQs, category template) is definitionally
// lying — data leaves the browser by design.
const LOCAL_CLAIM_PATTERNS: { name: string; re: RegExp }[] = [
  { name: 'never-leaves', re: /never (leaves?|uploads?|sent|sends)\b/i },
  { name: 'nothing-uploaded', re: /nothing (is |gets )?(uploaded|sent|leaves)\b/i },
  { name: '100-local', re: /100% local/i },
  { name: 'entirely-local', re: /entirely (in your browser|on-device|on device|local)\b/i },
  { name: 'fully-offline', re: /fully offline\b/i },
  { name: 'works-offline', re: /works (fully )?offline\b/i },
  { name: 'stays-on-device', re: /(stays|remains) on your device\b/i },
  { name: 'no-data-leaves', re: /no data (leaves|is sent|is uploaded)\b/i },
  { name: 'browser-only', re: /runs (entirely|fully|completely) in your browser\b/i },
];

interface Hit {
  slug: string;
  verdict: string;
  source: string;
  pattern: string;
  excerpt: string;
}

function copyFor(tool: (typeof toolsRegistry)[number]): { source: string; text: string }[] {
  const out: { source: string; text: string }[] = [
    { source: 'description', text: `${tool.description} ${tool.seoDescription}` },
  ];
  const faqs = tool.faqs && tool.faqs.length > 0 ? tool.faqs : null;
  if (faqs) {
    faqs.forEach((f, i) => out.push({ source: `faq[${i}]`, text: `${f.question} ${f.answer}` }));
  } else {
    const tpl = (categoryFaqTemplates as Record<string, unknown>)[tool.category];
    const list = typeof tpl === 'function' ? (tpl as (t: unknown) => { question: string; answer: string }[])(tool) : (tpl as { question: string; answer: string }[] | undefined);
    (list || []).forEach((f, i) => out.push({ source: `category-faq[${i}]`, text: `${f.question} ${f.answer}` }));
  }
  return out;
}

describe('claims sweep: cloud tools must not carry local-only copy', () => {
  it('reports zero cloud/hybrid tools with local-only claims', () => {
    const hits: Hit[] = [];
    for (const t of toolsRegistry) {
      const v = classifyDependencies(t.dependencies || '');
      if (v !== 'cloud' && v !== 'hybrid') continue;
      for (const c of copyFor(t)) {
        for (const p of LOCAL_CLAIM_PATTERNS) {
          if (p.re.test(c.text)) {
            const m = c.text.match(p.re);
            const at = m?.index ?? 0;
            hits.push({
              slug: t.slug,
              verdict: v,
              source: c.source,
              pattern: p.name,
              excerpt: c.text.slice(Math.max(0, at - 60), at + 100).replace(/\s+/g, ' '),
            });
            break;
          }
        }
      }
    }
    console.log(`cloud/hybrid tools with local-only copy: ${hits.length}`);
    for (const h of hits) {
      console.log(`  [${h.verdict}] ${h.slug} :: ${h.source} :: ${h.pattern} :: …${h.excerpt}…`);
    }
    expect(hits).toEqual([]);
  });
});
