import { describe, it } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { toolsRegistry } from '@/registry/tools';
import { getShortDescription } from '@/lib/generateToolDescription';

describe('scan', () => {
  it('remaining flagged tools', () => {
    const norm = (s: string) =>
      s.replace(/^Free online .*? (—|\u2014) /, '').replace(/\. $/, '.').trim();
    const flagged = toolsRegistry.filter(
      t => t.seoDescription && t.description === norm(t.seoDescription)
    );
    const constants = readFileSync(join(process.cwd(), 'src/registry/tools-constants.ts'), 'utf-8');
    console.log(`\nFlagged: ${flagged.length}`);
    for (const t of flagged) {
      const gen = getShortDescription(t);
      const stillMatch = gen === norm(t.seoDescription!);
      const inSrc = constants.includes(`slug: "${t.slug}"`) || constants.includes(`slug: '${t.slug}'`)
        ? 'constants' : 'chunk';
      const wouldFix = stillMatch ? 'FALLBACK' : 'GENERATE';
      console.log(`${t.slug.padEnd(32)} ${inSrc.padEnd(10)} ${wouldFix.padEnd(10)} "${t.description.slice(0, 55)}"`);
    }
  });
});
