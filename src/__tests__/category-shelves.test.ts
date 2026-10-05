import { describe, it, expect } from 'vitest';
import { toolsRegistry } from '@/registry/tools';
import { CATEGORY_SECTIONS, CATEGORY_INTROS } from '@/data/categorySections';

describe('category shelves integrity', () => {
  it('every shelf slug resolves to a real tool (no silent drops)', () => {
    const slugs = new Set(toolsRegistry.map((t) => t.slug));
    const missing: string[] = [];
    for (const [cat, sections] of Object.entries(CATEGORY_SECTIONS)) {
      for (const s of sections) {
        for (const slug of s.slugs) {
          if (!slugs.has(slug)) missing.push(`${cat}/${s.id}: ${slug}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('no slug shelved twice in the same category', () => {
    const dupes: string[] = [];
    for (const [cat, sections] of Object.entries(CATEGORY_SECTIONS)) {
      const seen = new Set<string>();
      for (const s of sections) {
        for (const slug of s.slugs) {
          if (seen.has(slug)) dupes.push(`${cat}: ${slug}`);
          seen.add(slug);
        }
      }
    }
    expect(dupes).toEqual([]);
  });

  it('pdf-editor leads the Edit & Annotate shelf', () => {
    const pdf = CATEGORY_SECTIONS['PDF'] || [];
    const edit = pdf.find((s) => s.id === 'edit');
    expect(edit).toBeDefined();
    expect(edit!.slugs[0]).toBe('pdf-editor');
  });

  it('no mega-shelf in PDF (ihatepdf density: ≤16 tools per shelf)', () => {
    // Scoped to PDF: other categories have pre-existing bloat outside this
    // task's scope. Do not extend blindly — resplit per category instead.
    const bloated = (CATEGORY_SECTIONS['PDF'] || [])
      .filter((s) => s.slugs.length > 16)
      .map((s) => `PDF/${s.id}: ${s.slugs.length}`);
    expect(bloated).toEqual([]);
  });

  it('{count} intros match the displayed tool list (About vs tabs)', () => {
    // page.tsx renders {count} as allTools.length (category tools +
    // cross-listed section tools, minus hidden) — the same list the
    // All/Free/Pro tabs count. Replicate that filter here.
    const mismatched: string[] = [];
    for (const [cat, intro] of Object.entries(CATEGORY_INTROS)) {
      if (!intro.includes('{count}')) continue;
      const sectionSlugs = new Set((CATEGORY_SECTIONS[cat] || []).flatMap((s) => s.slugs));
      const shown = toolsRegistry.filter(
        (t) =>
          (t.category === cat && t.showInCategory !== false) ||
          (sectionSlugs.has(t.slug) && t.showInCategory !== false),
      ).length;
      // Rendered text must contain the real number, not the placeholder.
      const rendered = intro.replace('{count}', String(shown));
      if (rendered.includes('{count}') || !rendered.includes(String(shown))) {
        mismatched.push(`${cat}: renders without live count`);
      }
    }
    expect(mismatched).toEqual([]);
    expect(Object.values(CATEGORY_INTROS).some((i) => i.includes('{count}'))).toBe(true);
  });

  it('every category hub has >=4 unique FAQs', async () => {
    const { CATEGORY_FAQS } = await import('@/data/categorySections');
    const bad: string[] = [];
    const cats = [...new Set(toolsRegistry.map((t) => t.category))];
    for (const cat of cats) {
      const faqs = CATEGORY_FAQS[cat] || [];
      if (faqs.length < 4) {
        bad.push(`${cat}: only ${faqs.length} FAQs`);
        continue;
      }
      const seen = new Set<string>();
      for (const f of faqs) {
        if (!f.question.endsWith('?')) bad.push(`${cat}: question lacks '?': ${f.question.slice(0, 40)}`);
        if (f.answer.length < 40) bad.push(`${cat}: answer too short: ${f.question.slice(0, 40)}`);
        const key = f.question.toLowerCase();
        if (seen.has(key)) bad.push(`${cat}: duplicate question: ${f.question.slice(0, 40)}`);
        seen.add(key);
      }
    }
    expect(bad).toEqual([]);
  });
});
