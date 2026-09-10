/**
 * Debug helper listing tools whose description equals the normalized
 * seoDescription, with candidate replacements from getShortDescription.
 *
 * Run: npx tsx scripts/debug-fix.ts (read-only, prints to stdout).
 * Reads: src/registry/tools, src/lib/generateToolDescription,
 *   src/registry/tools-index.ts, src/registry/tools-constants.ts.
 */
// HISTORICAL one-off: flagged descriptions identical to normalized SEO text. Debugging aid, not a gate.
import { readFileSync } from 'fs';
import { toolsRegistry } from '../src/registry/tools';
import { getShortDescription } from '../src/lib/generateToolDescription';

const norm = (s: string) =>
  s.replace(/^Free online .*? (—|\u2014) /, '').replace(/\. $/, '.').trim();

const flagged = toolsRegistry.filter(
  t => t.seoDescription && t.description === norm(t.seoDescription)
);

console.log(`Flagged: ${flagged.length}`);
for (const t of flagged) {
  const stripped = norm(t.seoDescription!);
  const candidate = getShortDescription(t);
  const useFallback = candidate === stripped;
  const newDesc = useFallback ? t.description + ' No signup or account required.' : candidate;
  console.log(`\n=== ${t.slug} ===`);
  console.log(`current desc:      ${t.description}`);
  console.log(`stripped seo:      ${stripped}`);
  console.log(`getShortDesc:      ${candidate}`);
  console.log(`use fallback:      ${useFallback}`);
  console.log(`new desc:          ${newDesc}`);

  // Check if tools-constants.ts contains this slug
  const index = readFileSync('src/registry/tools-index.ts', 'utf-8');
  const constants = readFileSync('src/registry/tools-constants.ts', 'utf-8');
  const inChunk = constants.includes(`slug: "${t.slug}"`) || constants.includes(`slug: '${t.slug}'`);
  console.log(`found in constants: ${inChunk}`);
}
