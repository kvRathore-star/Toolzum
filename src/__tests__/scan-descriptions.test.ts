import { describe, it } from 'vitest';
import { toolsRegistry } from '@/registry/tools';
import { getShortDescription } from '@/lib/generateToolDescription';

describe('scan', () => {
  it('edge case details', () => {
    const normalized = (s: string) =>
      s.replace(/^Free online .*? (—|\u2014) /, '').replace(/\. $/, '.').trim();

    const flagged = toolsRegistry.filter(
      t => t.seoDescription && t.description === normalized(t.seoDescription)
    );

    // Edge cases: getShortDescription still matches
    const stillMatching = flagged.filter(t => getShortDescription(t) === normalized(t.seoDescription!));
    console.log(`\n=== 34 EDGE CASES (privacy mentioned in description) ===`);
    for (const t of stillMatching) {
      const desc = t.description;
      const kws = ['browser','local','privacy','uploaded','client-side'].filter(kw => desc.toLowerCase().includes(kw));
      console.log(`${t.slug} | "${desc.slice(0, 100)}" | matches: ${kws.join(',')}`);
    }

    // Print all slugs of flagged tools, grouped by source file
    const byChunk: Record<string, string[]> = {};
    for (const t of flagged) {
      const file = `tools-chunk-${t.id[0] === 's' ? 'perm' : Math.min(parseInt(t.id), 5)}.ts`;
      // Actually let's just find them in the actual files
    }
  });
});
