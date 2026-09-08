// HISTORICAL one-off: split the monolithic registry into chunks. Do not re-run.
const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('src/registry/tools.ts', 'utf-8');
const lines = content.split('\n');

function findLine(pred) {
  for (let i = 0; i < lines.length; i++) if (pred(lines[i], i)) return i;
  return -1;
}

// ========= Section boundaries =========
const L = {
  registry: findLine(l => l.includes('const rawToolsRegistry: ToolMetadata[]')), // 36
  proSlugs: findLine(l => l.includes('const proSlugs')), // 11072
  seoType: findLine(l => l.includes('export interface SeoPermutation')), // 11088
  seoData: findLine(l => l.includes('export const SEO_PERMUTATIONS')), // 11097
  redirects: findLine(l => l.includes('export const TOOL_REDIRECTS')), // 11144
};

// proSlugs ends right before SeoPermutation interface
const proSlugsEnd = L.seoType - 1; // blank line before interface

// SEO_PERMUTATIONS ends at `];`
let seoDataEnd = L.seoData + 1;
for (let i = L.seoData + 1; i < lines.length; i++) {
  if (lines[i].trim() === '];') { seoDataEnd = i + 1; break; }
}
// ^ seoDataEnd points to the blank line AFTER ];

console.log('Boundaries:', JSON.stringify(L, null, 2));
console.log('proSlugsEnd:', proSlugsEnd, 'seoDataEnd:', seoDataEnd);

// ========= 1. types.ts =========
const typesLines = lines.slice(0, L.registry); // ToolCategory + ToolMetadata
fs.writeFileSync('src/registry/tools-types.ts', typesLines.join('\n') + '\n');
console.log('✓ tools-types.ts');

// ========= 2. Parse entries =========
const arrayBody = lines.slice(L.registry, L.proSlugs).join('\n');
const eqBracket = arrayBody.indexOf('= [');
const bracketStart = eqBracket !== -1 ? arrayBody.indexOf('[', eqBracket + 2) : arrayBody.indexOf('[');

let depth = 0, bracketEnd = -1;
for (let i = bracketStart; i < arrayBody.length; i++) {
  if (arrayBody[i] === '[') depth++;
  else if (arrayBody[i] === ']') { depth--; if (depth === 0) { bracketEnd = i; break; } }
}

const rawEntries = arrayBody.slice(bracketStart + 1, bracketEnd);
const entries = [];
let d = 0, s = -1;
for (let i = 0; i < rawEntries.length; i++) {
  if (rawEntries[i] === '{') { if (d === 0) s = i; d++; }
  else if (rawEntries[i] === '}') { d--; if (d === 0 && s !== -1) { entries.push(rawEntries.slice(s, i + 1)); s = -1; } }
}
console.log(`✓ ${entries.length} entries parsed`);

// ========= 3. Write entry chunks =========
const CHUNK_SIZE = Math.ceil(entries.length / 6);
const importNames = [];
for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
  const chunk = entries.slice(i, Math.min(i + CHUNK_SIZE, entries.length));
  const varName = `entries_chunk_${importNames.length}`;
  const fileName = `entries-chunk-${importNames.length}.ts`;
  importNames.push({ varName, fileName, count: chunk.length });
  // Strip redundant `as ToolCategory` assertions — the array is already typed
  const entryText = chunk.map(e => '  ' + e.trim().replace(/\s+as\s+ToolCategory\b/g, '')).join(',\n');
  const fname = `src/registry/tools-chunk-${importNames.length - 1}.ts`;
  fs.writeFileSync(fname, `import type { ToolMetadata } from './tools-types';\n\nexport const ${varName}: ToolMetadata[] = [\n${entryText},\n];\n`);
}
console.log(`✓ ${importNames.length} chunk files`);

// ========= 4. constants.ts =========
// Includes: proSlugs, SeoPermutation interface, SEO_PERMUTATIONS, TOOL_REDIRECTS
const proSlugsText = lines.slice(L.proSlugs, L.seoType).join('\n')
  .replace(/^const proSlugs/, 'export const proSlugs'); // make it exported
const seoPermInterface = lines.slice(L.seoType, L.seoData).join('\n').trim();
const constantsParts = [
  "import type { ToolCategory } from './tools-types';\n",
  proSlugsText,                                            // proSlugs (exported)
  '',                                                      // blank
  seoPermInterface,                                        // SeoPermutation interface
  '',
  lines.slice(L.seoData, seoDataEnd).join('\n').trim(),   // SEO_PERMUTATIONS array
  '',
  lines.slice(L.redirects).join('\n'),                    // TOOL_REDIRECTS
];
fs.writeFileSync('src/registry/tools-constants.ts', constantsParts.join('\n') + '\n');
console.log('✓ tools-constants.ts');

// ========= 5. helpers.ts =========
const helpersContent = `import { SEO_PERMUTATIONS } from './tools-constants';

// Re-export constants so consumers import from one helpers file
export { SEO_PERMUTATIONS, TOOL_REDIRECTS, proSlugs } from './tools-constants';

export function getSeoParentSlug(slug: string): string | undefined {
  return SEO_PERMUTATIONS.find(p => p.slug === slug)?.parentSlug;
}
`;
fs.writeFileSync('src/registry/tools-helpers.ts', helpersContent, 'utf-8');
console.log('✓ tools-helpers.ts');

// ========= 6. index.ts (barrel) =========
const importStmts = importNames.map((n, i) =>
  `import { ${n.varName} } from './tools-chunk-${i}';`
).join('\n');
const spreadStmts = importNames.map((n, i) => `  ...${n.varName},`).join('\n');

const forLoopCode = `// Add SEO landing pages to registry — MUST happen before toolsRegistry map
for (const p of SEO_PERMUTATIONS) {
  (rawToolsRegistry as ToolMetadata[]).push({
    id: \`seo-\${p.slug}\`,
    name: p.name,
    slug: p.slug,
    category: p.category,
    description: p.description,
    seoDescription: p.seoDescription,
    dependencies: "Browser API (landing page)",
  });
}`;

const indexContent = `// Auto-generated barrel — do not edit directly
import type { ToolMetadata } from './tools-types';
import { SEO_PERMUTATIONS, proSlugs } from './tools-constants';
${importStmts}

const rawToolsRegistry: ToolMetadata[] = [
${spreadStmts}
];

${forLoopCode}

export const toolsRegistry: ToolMetadata[] = rawToolsRegistry.map(tool => ({
  ...tool,
  isPro: proSlugs.includes(tool.slug)
}));

export const getToolBySlug = (slug: string) => toolsRegistry.find(t => t.slug === slug);
export const getToolsByCategory = (category: string) => toolsRegistry.filter(t => t.category === category && t.showInCategory !== false);
export const getToolByCategoryAndSlug = (category: string, slug: string) => toolsRegistry.find(t => t.category.toLowerCase().replace(/\\s+/g, '-') === category && t.slug === slug);
`;
fs.writeFileSync('src/registry/tools-index.ts', indexContent, 'utf-8');
console.log('✓ tools-index.ts');

// ========= 7. tools.ts → re-export barrel =========
const reexportContent = `// Re-export from split registry (auto-generated)
export type { ToolCategory, ToolMetadata } from './tools-types';
export { toolsRegistry, getToolBySlug, getToolsByCategory, getToolByCategoryAndSlug } from './tools-index';
export { SEO_PERMUTATIONS, TOOL_REDIRECTS, proSlugs, getSeoParentSlug } from './tools-helpers';
`;
fs.writeFileSync('src/registry/tools.ts', reexportContent, 'utf-8');
console.log('✓ src/registry/tools.ts → re-export barrel');
console.log('\nDone!');
