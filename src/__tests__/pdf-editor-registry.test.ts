import { describe, it, expect } from 'vitest';
import { toolsRegistry } from '@/registry/tools';
import { classifyDependencies } from '@/lib/cloudPatterns';

describe('pdf-editor registry entry', () => {
  const tool = toolsRegistry.find((t) => t.slug === 'pdf-editor');

  it('exists in the client index', () => {
    expect(tool).toBeDefined();
  });

  it('carries honest instructions (no invented options)', () => {
    expect(tool!.instructions!.length).toBeGreaterThanOrEqual(4);
    const text = tool!.instructions!.map((s) => `${s.title} ${s.desc}`).join(' ');
    expect(text).toMatch(/cover-up/i);
  });

  it('discloses additive-only editing + cover-up limits in FAQs', () => {
    const faqs = tool!.faqs || [];
    expect(faqs.some((f) => /existing.*text/i.test(f.question) && /helvetica/i.test(f.answer))).toBe(true);
    expect(faqs.some((f) => /redact/i.test(f.question) && /recover/i.test(f.answer))).toBe(true);
  });

  it('classifies local (pdf-lib, browser-only) so local copy is legitimate', () => {
    expect(classifyDependencies(tool!.dependencies || '')).toBe('local');
  });
});
