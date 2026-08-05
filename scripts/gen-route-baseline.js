const fs = require('fs');

const WRAPPER = fs.readFileSync('src/components/tools/modules/DynamicModuleWrapper.tsx', 'utf8');
const CONFIG = fs.readFileSync('src/components/tools/modules/shared/converterConfig.ts', 'utf8');
const ROUTER = fs.readFileSync('src/components/tools/modules/converter/ConverterRouter.tsx', 'utf8');
const CONSTANTS = fs.readFileSync('src/registry/tools-constants.ts', 'utf8');

function baseName(p) {
  const parts = p.split('/');
  return parts[parts.length - 1];
}

const registry = {};
// No-options closures (SSR-preserving, e.g. migrated converter slugs) first:
// strip them from the source so the ssr regex below cannot swallow them while
// scanning forward for a later `, { ssr: false`.
const CLOSURE_RE = /'([a-z0-9-]+)': dynamic\(\(\) => import\('([^']+)'\)\.then\(m => \(\{ default: \(\) => <m\.(default|[A-Za-z0-9_]+)((?:\s+[A-Za-z0-9_]+="[^"]*")*) \/> \}\)\)\)/g;
const closureBlocks = [];
for (const match of WRAPPER.matchAll(CLOSURE_RE)) {
  const [, slug, modPath, exportName, propsStr] = match;
  const props = {};
  for (const pm of (propsStr ?? '').matchAll(/([A-Za-z0-9_]+)="([^"]*)"/g)) props[pm[1]] = pm[2];
  registry[slug] = { path: modPath, export: exportName, mode: props.defaultMode, slug: props.slug };
  closureBlocks.push(match[0]);
}
const SSG_SRC = closureBlocks.reduce((s, b) => s.replace(b, ''), WRAPPER);
const SSG_RE = /'([a-z0-9-]+)': dynamic\(\(\) => import\('([^']+)'\)(.*?),\s*\{\s*ssr: false/sg;
for (const [, slug, modPath, rawTail] of SSG_SRC.matchAll(SSG_RE)) {
  const tail = rawTail.trim();
  let entry;
  if (tail.startsWith('.then(m => {')) {
    const jsx = tail.match(/<m\.(default|[A-Za-z0-9_]+)((?:\s+[A-Za-z0-9_]+="[^"]*")*)/);
    const props = {};
    if (jsx) for (const pm of (jsx[2] ?? '').matchAll(/([A-Za-z0-9_]+)="([^"]*)"/g)) props[pm[1]] = pm[2];
    entry = { path: modPath, export: jsx ? jsx[1] : 'default', mode: props.defaultMode, slug: props.slug };
  } else {
    const named = tail.match(/\.then\(m => \(\{ default: m\.([A-Za-z0-9_]+) \}\)\)/);
    entry = { path: modPath, export: named ? named[1] : 'default' };
  }
  registry[slug] = entry;
}

const categoryOf = {};
const ENTRY_START_RE = /^\s{2}"([a-z0-9-]+)": \{/gm;
const CAT_VALUE_RE = /category: "([a-z0-9-]+)"/g;
const entryStarts = [...CONFIG.matchAll(ENTRY_START_RE)];
for (let i = 0; i < entryStarts.length; i++) {
  const slug = entryStarts[i][1];
  const start = entryStarts[i].index;
  const end = i + 1 < entryStarts.length ? entryStarts[i + 1].index : CONFIG.length;
  const block = CONFIG.slice(start, end);
  const catMatch = block.match(CAT_VALUE_RE);
  if (catMatch) categoryOf[slug] = catMatch[0].match(/"([a-z0-9-]+)"/)[1];
}

const compOf = {};
const COMP_RE = /"([a-z0-9-]+)": (\w+)/g;
while ((m = COMP_RE.exec(ROUTER))) compOf[m[1]] = m[2];

const seoPermutations = [];
const SEO_RE = /parentSlug: "([a-z0-9-]+)"/g;
while ((m = SEO_RE.exec(CONSTANTS))) seoPermutations.push(m[1]);
// TOOL_REDIRECTS line format: { category: "x", slug: "target" } (may be multi-line)
const REDIRECT_START_RE = /^\s{2}"([a-z0-9-]+)": \{/gm;
const redirectStarts = [...CONSTANTS.matchAll(REDIRECT_START_RE)];
const redirects = {};
for (let i = 0; i < redirectStarts.length; i++) {
  const slug = redirectStarts[i][1];
  const start = redirectStarts[i].index;
  const end = i + 1 < redirectStarts.length ? redirectStarts[i + 1].index : CONSTANTS.length;
  const block = CONSTANTS.slice(start, end);
  const slugMatch = block.match(/slug: "([a-z0-9-]+)"/);
  if (slugMatch) redirects[slug] = slugMatch[1];
}

function componentLabel(slug) {
  const r = registry[slug];
  if (r) {
    let label = baseName(r.path);
    if (r.export !== 'default') label += ` -> ${r.export}`;
    if (r.mode) label += ` [${r.mode}]`;
    else if (r.slug) label += ` [slug=${r.slug}]`;
    return label;
  }
  const cat = categoryOf[slug];
  if (cat) {
    return `${compOf[cat] || cat} (category ${cat})`;
  }
  return 'ComingSoonTool (unreachable - redirect handled first)';
}

const allSlugs = new Set([...Object.keys(registry), ...Object.keys(categoryOf)]);
const redirectSources = Object.keys(redirects).filter((s) => !allSlugs.has(s));
const seoCount = seoPermutations.length;

const known22 = [
  'aes-decrypt','ai-video-subtitler','background-remover','bg-changer','contrast-checker',
  'cpp-formatter','css-minifier','curl-to-code','decision-maker','go-formatter','html-minifier',
  'image-converter','jwt-encoder-signer','kotlin-formatter','memorable-password-generator',
  'php-beautifier','ruby-formatter','rust-formatter','temporary-email-generator','text-converter',
  'wifi-qr-generator','yes-no-picker',
];
const comingSoon22 = redirectSources.filter((s) => known22.includes(s));
const CHUNK_RE = /slug: "([a-z0-9-]+)"/g;
const registryList = [];
for (const cf of fs.readdirSync('src/registry').filter((f) => /^tools-chunk-\d+\.ts$/.test(f))) {
  const chunk = fs.readFileSync(`src/registry/${cf}`, 'utf8');
  for (const [, slug] of chunk.matchAll(CHUNK_RE)) registryList.push(slug);
}
const registryRedirectOnly = redirectSources.filter((s) => !known22.includes(s) && registryList.includes(s));
const legacyRedirects = redirectSources.filter((s) => !known22.includes(s) && !registryList.includes(s));
const registrySet = new Set(Object.keys(registry));
const categorySet = new Set(Object.keys(categoryOf));
const categoryMove = Object.keys(redirects).filter((s) => redirects[s] === s);
const shadowed = Object.keys(redirects).filter((s) => categoryOf[s] && redirects[s] !== s);

const lines = [];
lines.push('# Toolzum Routing Baseline (Phase 1)');
lines.push('');
lines.push('> Generated by `scripts/gen-route-baseline.js` from the canonical sources of truth:');
lines.push('> `DynamicModuleWrapper.tsx` (MODULE_REGISTRY), `converterConfig.ts` (CONVERTER_CONFIG),');
lines.push('> `ConverterRouter.tsx` (COMPONENT_MAP), `tools-constants.ts` (TOOL_REDIRECTS / SEO_PERMUTATIONS).');
lines.push('>');
lines.push('> **Purpose:** acceptance baseline for Tier 1.1 routing consolidation. After each migration,');
lines.push('> every slug below must resolve to the exact same component as today. Tracked by');
lines.push('> `registry-integrity.test.ts`, `hub-contracts.test.ts`, and `registry-render-smoke.test.ts`.');
lines.push('');
lines.push('## Summary');
lines.push('');
lines.push('| Mechanism | Slugs |');
lines.push('|---|---|');
lines.push(`| MODULE_REGISTRY (direct dynamic import) | ${Object.keys(registry).length} |`);
lines.push(`| CONVERTER_CONFIG -> ConverterRouter hub | ${Object.keys(categoryOf).length} |`);
lines.push(`| Redirect-only sources (in neither map) | ${redirectSources.length} (${comingSoon22.length} ComingSoon registry tools + ${registryRedirectOnly.length} registry tools redirecting to a hub + ${legacyRedirects.length} legacy URLs) |`);
lines.push(`| Category-move redirects (same slug, old->new category) | ${categoryMove.length} (${categoryMove.filter((s) => registrySet.has(s)).length} MODULE_REGISTRY + ${categoryMove.filter((s) => categorySet.has(s)).length} CONVERTER_CONFIG) |`);
lines.push(`| Redirect-shadowed CONVERTER_CONFIG routes | ${shadowed.length} |`);
lines.push(`| SEO permutation landing slugs (redirected in page.tsx) | ${seoCount} |`);
lines.push('');
lines.push('- Zero overlap between MODULE_REGISTRY and CONVERTER_CONFIG (asserted by registry-integrity #9).');
lines.push('- Redirect-only slugs never reach `ComingSoonTool` because `[category]/[tool]/page.tsx` redirects them first.');
lines.push('- **Render baseline:** `registry-render-smoke.test.ts` renders every MODULE_REGISTRY slug (750) and every');
lines.push('  CONVERTER_CONFIG slug (290) through the real resolution path with no throw. Two real bugs were found and fixed:');
lines.push('  - `json-tree-viewer` (DataUtilitiesWidgets.tsx) called `setError` during render -> infinite re-render loop.');
lines.push('  - `ssh-key-generator` (SshKeyGenerator.tsx) computed `x ** (p-2)` with a ~2^255 BigInt exponent at module load -> import crash. Fixed `modinv` to use modular exponentiation.');
lines.push('');
lines.push('## MODULE_REGISTRY slugs (direct components)');
lines.push('');
lines.push('| Slug | Component |');
lines.push('|---|---|');
const regSlugs = Object.keys(registry).sort();
for (const s of regSlugs) lines.push(`| ${s} | ${componentLabel(s)} |`);
lines.push('');
lines.push('## CONVERTER_CONFIG slugs (hub-routed)');
lines.push('');
lines.push('| Slug | Category | Hub component |');
lines.push('|---|---|---|');
const convSlugs = Object.keys(categoryOf).sort();
for (const s of convSlugs) lines.push(`| ${s} | ${categoryOf[s]} | ${compOf[categoryOf[s]] || 'MISSING_COMPONENT'} |`);
lines.push('');
lines.push('## Redirect-only slugs (never reach ComingSoonTool)');
lines.push('');
lines.push('These 82 slugs are in `TOOL_REDIRECTS` and in neither map, so `page.tsx` redirects them before the wrapper renders.');
lines.push('');
lines.push('### Registry tools (22) — the wrapper\'s only "ComingSoon" fallthrough candidates');
lines.push('');
lines.push('| Slug | Redirect target |');
lines.push('|---|---|');
for (const s of comingSoon22.sort()) lines.push(`| ${s} | ${redirects[s]} |`);
lines.push('');
lines.push('### Legacy URL redirects (60) — not registry tools, redirect to a live tool');
lines.push('');
lines.push('| Slug | Redirect target |');
lines.push('|---|---|');
for (const s of legacyRedirects.sort()) lines.push(`| ${s} | ${redirects[s]} |`);
lines.push('');
lines.push('## Category-move redirects (same slug, old category -> new category)');
lines.push('');
lines.push(`These ${categoryMove.length} slugs render normally at their new category; the redirect only fires from the legacy category URL.`);
lines.push('');
lines.push('| Slug | Redirect target |');
lines.push('|---|---|');
for (const s of categoryMove.sort()) lines.push(`| ${s} | ${redirects[s]} |`);
lines.push('');
if (shadowed.length > 0) {
  lines.push('## Redirect-shadowed CONVERTER_CONFIG routes');
  lines.push('');
  lines.push(`These ${shadowed.length} slugs ARE routed in CONVERTER_CONFIG but a TOOL_REDIRECTS entry diverts their canonical URL (`);
  lines.push('`redirect.slug !== slug` always fires), so the hub route is never rendered via URL. The redirect lands on the consolidated');
  lines.push('tool that renders the same logic. Note: `registry-integrity #9` only checks MODULE_REGISTRY, not CONVERTER_CONFIG, for');
  lines.push('unreachable routes — these are intentionally shadowed.');
  lines.push('');
  lines.push('| Slug | CONVERTER_CONFIG category | Redirect target |');
  lines.push('|---|---|---|');
  for (const s of shadowed.sort()) lines.push(`| ${s} | ${categoryOf[s]} | ${redirects[s]} |`);
  lines.push('');
}
lines.push('## Special cases');
lines.push('');
lines.push('1. **`image-format-converter`** routes to ImageCatchAllConverter with no matching FORMAT_PAIRS entry; it intentionally renders the default pair (png-to-jpg). Allowed by hub-contracts.test.ts.');
lines.push('2. **`json-to-code`** is a MODULE_REGISTRY slug but also a tab inside FormatSerializerHub (FORMAT_SLUGS). The hub tab is only reachable in-app, not by slug.');
lines.push('3. **`json-formatter`** is a MODULE_REGISTRY slug (renders JsonFormatter) but also a mode inside JsonOutputConverter (MODES). The mode is only reachable in-app as a hub tab, not by slug.');
lines.push('4. **`epub-to-pdf`** is a MODULE_REGISTRY slug but also a pair inside DocumentFormatConverter (FORMAT_PAIRS).');
lines.push('5. **`png-to-svg`** is a pair inside ImageCatchAllConverter (FORMAT_PAIRS) but routed via MODULE_REGISTRY.');
lines.push('6. **Closure-wrapped registry entries** (14) render `<m.X defaultMode="...">` pre-selecting a mode:');
const closures = Object.entries(registry).filter(([, e]) => e.mode);
for (const [s, e] of closures.sort()) lines.push(`   - \`${s}\` -> ${baseName(e.path)} mode="${e.mode}"`);
lines.push('');
lines.push('## Hub contract coverage');
lines.push('');
lines.push('`hub-contracts.test.ts` asserts for each hub that every routed slug resolves to a real mode/pair and that');
lines.push('category routing matches hub tabs exactly (except documented fallbacks above):');
lines.push('');
lines.push('| Hub | Category | Routed slugs | Contract |');
lines.push('|---|---|---|---|');
lines.push('| HtmlTextHub | html-text | 2 | category == tabs; each tab has TRANSFORM_CONFIG |');
lines.push('| CssPreprocessorHub | css-preprocessor | 6 | category == tabs; each tab has TRANSFORM_CONFIG |');
lines.push('| FormatSerializerHub | serializer | 6 | every routed slug is a tab; each tab has TRANSFORM_CONFIG |');
lines.push('| DataConverterFromSlug | data | 6 | category == SLUG_MAP; pairs are valid formats |');
lines.push('| DocumentFormatConverter | document | 12 | every routed slug is a FORMAT_PAIRS entry |');
lines.push('| TextTransformConverter | text-transform | 11 | every routed slug is a TRANSFORM_CONFIG entry (mode table: textTransformConfig.ts) |');
lines.push('| UnitConverter | unit | 16 | every routed slug is a UNIT_FAMILIES entry (mode table: UnitConverter.tsx UNIT_FAMILIES) |');
lines.push('| JsonOutputConverter | json-output | 8 | every routed slug is a MODES entry (mode table: JsonOutputConverter.tsx MODES; json-formatter mode stays registry-routed via JsonFormatter) |');
lines.push('| ImageCatchAllConverter | image-format | 110 | every routed slug is a FORMAT_PAIRS entry except image-format-converter |');
lines.push('');
lines.push('## Confidence & limitations');
lines.push('');
lines.push('- Smoke test renders via `react-dom/server` with `next/navigation`, `next/image`, `next/link`, `react-hot-toast` mocked');
lines.push('  and browser-only libs (`@ffmpeg/ffmpeg`, `@ffmpeg/util`, `heic2any`, `openpgp`) stubbed for the harness.');
lines.push('- renderToString exercises the render phase only (no effects). Effect-phase crashes are not caught by the smoke test.');
lines.push('- Hub contract suites run in the node environment and do not render; they validate the slug->mode mapping.');
lines.push('');

fs.writeFileSync('docs/route-mapping-baseline.md', lines.join('\n'));
console.log('registry:', Object.keys(registry).length, '| converter:', Object.keys(categoryOf).length, '| redirect-only:', redirectSources.length, '| seo:', seoCount);
console.log('wrote docs/route-mapping-baseline.md');
