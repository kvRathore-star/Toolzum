#!/usr/bin/env node
/**
 * Generates src/lib/downloadProducingSlugs.ts from static analysis:
 * 1. Finds all module files containing download logic (downloadOrShare,
 *    BulkToolShell, JSZip, URL.createObjectURL)
 * 2. Excludes files that import but never call it (dead imports)
 * 3. Maps slugs to their component (DynamicModuleWrapper entry + optional
 *    `.then(m => …)` selector), following re-export chains behind thin entry
 *    shims; download logic is attributed when the component body contains
 *    markers, references an in-body helper that does, passes CalculatorShell's
 *    downloadData/downloadFilename props, or re-exports a file that does
 * 4. Writes a Set constant used by ToolLayout for download badge visibility
 *
 * Run: npx tsx scripts/generate-download-slugs.ts
 * Wired into: npm run build (via gen:download-slugs)
 */
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { dirname, join } from 'path';

const ROOT = join(import.meta.dirname, '..');
const WRAPPER_PATH = join(ROOT, 'src/components/tools/modules/DynamicModuleWrapper.tsx');
const MODULES_DIR = join(ROOT, 'src/components/tools/modules');
const OUTPUT_PATH = join(ROOT, 'src/lib/downloadProducingSlugs.ts');

// Files that import downloadOrShare but never call it (verified by audit 2026-09-04;
// re-verified 2026-09-12 — converter/DocumentConverter removed: now gated via
// gateBatchDownload, so its slug must be badged)
const DEAD_IMPORTS = new Set([
  'pdf/UrlToPdf',
  'privacy/PrivacyCleaner',
  'ai/AiHumanizer',
]);

// Tools with trivial downloads (calculators, text generators, dev tools)
// These have download buttons but only export .txt of on-screen results
const TRIVIAL_DOWNLOADS = new Set([
  // Calculators
  'acv-calculator', 'burn-rate-calculator', 'cac-calculator', 'conversion-rate-calculator',
  'css-specificity-calculator', 'indian-investment-calculator', 'ltv-calculator',
  'net-promoter-score-calculator', 'roas-calculator', 'seller-profit-calculator',
  'tax-saving-calculator', 'salary-calculator', 'tip-calculator', 'emi-calculator',
  'car-loan-calculator', 'home-loan-calculator', 'sip-calculator', 'ppf-calculator',
  'fd-calculator', 'rd-calculator', 'gst-calculator', 'emi-calculator-india',
  'body-fat-calculator', 'bmi-calculator', 'calorie-calculator', 'macro-calculator',
  'tdee-calculator', 'ideal-weight-calc', 'pregnancy-due-date-calculator',
  'ovulation-tracker', 'heart-rate-zone-calculator', 'water-intake-calculator',
  'steps-to-calories-calculator', 'child-height-predictor', 'date-difference-calculator',
  'time-until-calculator', 'age-calculator', 'percentage-calculator',
  'percentage-difference-calculator', 'profit-margin-calculator', 'break-even-calculator',
  'roi-calculator', 'compound-interest-calculator', 'simple-interest-calculator',
  'fd-calculator-india', 'ppf-calculator-india', 'nps-calculator',
  'gratuity-calculator', 'hra-calculator-india', 'tax-calculator-india',
  'tds-calculator-india', 'capital-gains-calculator', 'mutual-fund-calculator',
  'lumpsum-calculator', 'swp-calculator', 'step-up-sip-calculator',
  'electricity-bill-calculator', 'electricity-cost-calculator',
  'bill-splitter', 'tip-calculator-india', 'discount-calculator',
  'markdown-calculator', 'unit-price-calculator', 'aspect-ratio-calculator',
  'screen-size-converter', 'pixel-density-calculator',
  // Text generators / trivial exports
  'article-writer', 'complaint-letter-generator', 'dummy-text-generator',
  'fake-data-generator', 'invisible-text-generator', 'lorem-ipsum-generator',
  'meeting-minutes-generator', 'text-repeater', 'text-to-handwriting',
  'social-caption-generator', 'password-generator', 'random-password-generator',
  'memorable-password-generator', 'uuid-generator', 'guid-generator',
  'random-string-generator', 'random-number-generator', 'random-word-generator',
  'random-sentence-generator', 'random-team-generator', 'random-picker-generator',
  'nickname-generator', 'sequence-generator', 'coupon-code-generator',
  'serial-number-generator', 'otp-generator', 'ulid-generator',
  // Developer tools (text transforms, no substantial file)
  'code-beautifier', 'code-formatter', 'code-obfuscator', 'code-to-curl-parser',
  'css-formatter', 'css-validator', 'css-specificity-calculator',
  'eslint-config-generator', 'git-commit-linter', 'gitignore-generator',
  'github-actions-validator', 'html-formatter', 'html-entity-encoder',
  'html-preview', 'javascript-formatter', 'js-minifier', 'js-syntax-checker',
  'json-formatter', 'json-escape-unescape', 'jsonl-formatter', 'jsonrpc-builder',
  'jsx-formatter', 'jwk-generator', 'markdown-formatter', 'markdown-slack-converter',
  'markdown-to-html', 'markdown-to-text', 'markdown-tools',
  'python-formatter', 'ruby-formatter', 'rust-formatter', 'swift-formatter',
  'typescript-formatter', 'tsx-formatter', 'php-beautifier',
  'xml-formatter', 'yaml-formatter', 'yaml-reindenter', 'yaml-validator',
  'sql-formatter', 'scss-formatter', 'less-formatter',
  'svg-optimizer', 'svg-base64-converter',
  'protobuf-decoder', 'proto-schema-converter', 'pug-to-html-converter',
  'px-rem-converter', 'media-query-generator', 'tailwind-to-css-converter',
  'stylus-to-css-converter', 'postcss-generator',
  'robots-txt-validator', 'rss-feed-validator', 'sitemap-validator',
  'xml-sitemap-generator', 'xml-to-csv', 'xml-to-json',
  'csv-formatter', 'csv-to-markdown', 'csv-statistics', 'csv-data-cleaner',
  'csv-to-sql', 'csv-to-json', 'csv-to-xml', 'csv-to-sqlite',
  'json-to-csv', 'json-to-xml', 'json-to-code', 'json-path-query-builder',
  'json-compact', 'json-diff', 'json-yaml-converter', 'yaml-json-converter',
  'toml-converter', 'ini-converter', 'env-formatter',
  'text-to-binary', 'binary-to-text', 'text-to-html-converter',
  'text-to-markdown', 'text-reverser', 'text-sorter', 'text-deduplicator',
  'text-replacer', 'text-diff-checker', 'text-counter', 'text-statistics',
  'word-counter', 'character-counter', 'reading-time-calculator',
  'fancy-text-generator', 'big-text-generator', 'small-text-generator',
  'bubble-text-generator', 'superscript-generator', 'subscript-generator',
  'unicode-text-styler', 'ascii-art-generator', 'ascii-big-text',
  'text-to-handwriting', 'text-coloring', 'text-stroke',
  'morse-code-translator', 'braille-translator', 'nato-phonetic-converter',
  'binary-converter', 'hex-converter', 'octal-converter',
  'number-base-converter', 'roman-numeral-converter',
  'temperature-converter', 'color-converter', 'color-palette-generator',
  'gradient-generator', 'contrast-checker', 'color-blindness-simulator',
  'favicon-generator', 'avatar-generator', 'logo-placeholder-generator',
  'image-placeholder-generator', 'qr-code-reader',
  // Utility tools (no substantial file)
  'bulk-url-shortener', 'url-shortener', 'bulk-link-shortener',
  'column-extractor', 'column-renamer', 'row-filter', 'pivot-generator',
  'deduplicator', 'null-value-handler', 'format-validator',
  'line-sorter', 'numeronym-generator', 'slugify-tool',
  'phone-parser', 'mac-vendor-lookup', 'ip-address-converter',
  'ip-range-expander', 'ipv6-ula-generator', 'port-number-lookup',
  'dns-record-validator', 'dns-lookup', 'whois-lookup', 'ssl-checker',
  'website-screenshot', 'screen-recorder', 'screen-recorder-extension',
  'random-port-generator', 'random-time-generator',
  'time-zone-converter', 'time-converter', 'unix-time-converter',
  'hours-to-minutes-converter', 'seconds-to-minutes-converter',
  'minutes-to-hours-converter', 'work-hours-calculator',
  'meeting-time-planner', 'daylight-saving-time-checker',
  'week-number-calculator', 'countdown-tool', 'stopwatch', 'tabata-timer',
  'timer', 'pomodoro-timer', 'interval-timer',
  'large-text-viewer', 'string-inspector', 'string-template-tester',
  'character-encoding-converter', 'unicode-converter',
  'url-encoder-decoder', 'url-parser', 'query-string-parser',
  'html-to-markdown', 'html-to-text-converter', 'markdown-to-text',
  'css-to-javascript', 'javascript-to-css',
  'base32-encoder', 'base64-encode-decode', 'base64-json-decoder',
  'encoder-decoder', 'backslash-escape', 'html-entity-encoder',
  'url-encoder', 'url-decoder',
  'cbor-inspector', 'msgpack-inspector', 'protobuf-decoder',
  'har-analyzer', 'log-analyzer', 'string-inspector',
  'cookie-parser', 'http-header-analyzer', 'http-cache-header-generator',
  'http-headers-generator', 'http-retry-policy-builder', 'http-status-code-checker',
  'rate-limit-header-parser', 'sse-event-formatter',
  'oauth-client-setup', 'oauth-scope-builder', 'oauth-state-validator', 'pkce-verifier',
  'jwt-debugger', 'jwt-encoder-signer', 'jwk-generator',
  'docker-compose-validator', 'docker-run-to-compose', 'dockerfile-linter',
  'kubernetes-yaml-validator', 'package-json-validator', 'tsconfig-analyzer',
  'geojson-validator', 'geojson-to-csv',
  'pbkdf2-hash-generator', 'random-token-generator', 'secret-scanner',
  'security-txt-generator', 'ssl-checker', 'whois-lookup',
  'dns-record-validator', 'dns-lookup', 'ip-geolocation',
  'email-normalizer', 'email-validator', 'email-template-builder',
  'regex-validator', 'regex-tester', 'regex-generator',
  'cron-expression-validator', 'cron-expression-generator',
  'merge-patch-generator', 'json-patch-builder',
  'test-data-generator', 'fake-data-generator',
  'data-anonymizer', 'data-masker', 'data-generator',
  'pricing-tier-builder', 'saas-payback-period', 'saas-quick-ratio', 'saas-rule-of-40',
  // SaaS metrics dashboards (no download)
  'saas-metrics-dashboard',
  // API tools (no download)
  'api-builder',
]);

function findDownloadFiles(): string[] {
  // Use a simple recursive glob since we can't assume ripgrep is available
  function walk(dir: string): string[] {
    const entries = readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...walk(full));
      } else if (/\.(tsx?|mts?)$/.test(entry.name)) {
        const content = readFileSync(full, 'utf8');
        if (content.includes('downloadOrShare') || content.includes('BulkToolShell') || content.includes('JSZip') || content.includes('URL.createObjectURL')) {
          files.push(full);
        }
      }
    }
    return files;
  }

  return walk(MODULES_DIR);
}

// --- Import-graph resolution -------------------------------------------------
// The old mapping (a marker file's path appearing on a DynamicModuleWrapper
// line) only sees TOP-LEVEL module files. Two wrapper patterns broke it:
//  1. Thin entry shims re-exporting logic from a subdirectory
//     (pdf/PdfEditor -> export * from './editor/PdfEditorCore'): invisible,
//     silently dropping slugs on every regeneration (pdf-editor went missing).
//  2. Barrel modules with a component selector
//     (import('…/MiscellaneousTools1').then(m => ({ default: m.CounterTool }))):
//     one barrel path appears on 22 slugs' lines, so barrel-granular mapping
//     either misses real downloads or badges all 22 for one file's handlers.
// Resolution: slug -> wrapper module (+ selector) -> the file that DEFINES
// the selected component (following export * / export {…} from edges) -> that
// file (and its re-export closure) must contain download logic. Plain `import`
// edges are deliberately not followed for closure: shared infra files
// (CalculatorShell, PdfActionBase, …) are imported by hundreds of modules and
// would balloon the set past the audited list.

const readCache = new Map<string, string>();
function readModule(path: string): string {
  let c = readCache.get(path);
  if (c === undefined) {
    c = readFileSync(path, 'utf8');
    readCache.set(path, c);
  }
  return c;
}

/** Resolve an extension-less module path to an actual file, or null. */
function resolveFile(base: string): string | null {
  for (const cand of [base, `${base}.tsx`, `${base}.ts`, `${base}.jsx`, `${base}.mts`, join(base, 'index.tsx'), join(base, 'index.ts')]) {
    if (existsSync(cand) && !cand.endsWith('/')) return cand;
  }
  return null;
}

function resolveSpecifier(spec: string, fromFile: string): string | null {
  if (spec.startsWith('@/')) return resolveFile(join(ROOT, 'src', spec.slice(2)));
  if (spec.startsWith('.')) return resolveFile(join(dirname(fromFile), spec));
  return null;
}

interface ModuleExports {
  stars: string[];                      // export * from './x'
  namedFrom: { target: string; names: string[] }[]; // export { A as B } from './x'
  localNames: Set<string>;              // export { A } (no from)
  defines: Set<string>;                 // export function|const|class … A
  hasDefault: boolean;
  importedNames: { name: string; target: string }[]; // import { A } from './x'
}

const exportCache = new Map<string, ModuleExports>();
function exportsOf(file: string): ModuleExports {
  const hit = exportCache.get(file);
  if (hit) return hit;
  const content = readModule(file);
  const out: ModuleExports = { stars: [], namedFrom: [], localNames: new Set(), defines: new Set(), hasDefault: false, importedNames: [] };

  for (const m of content.matchAll(/export\s+\*\s+from\s*['"]([^'"]+)['"]/g)) {
    const t = resolveSpecifier(m[1]!, file);
    if (t) out.stars.push(t);
  }
  for (const m of content.matchAll(/export\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g)) {
    const t = resolveSpecifier(m[2]!, file);
    if (t) out.namedFrom.push({ target: t, names: splitExportNames(m[1]!) });
  }
  for (const m of content.matchAll(/export\s+(?:type\s+)?\{([^}]+)\}(?!\s*from)/g)) {
    for (const n of splitExportNames(m[1]!)) out.localNames.add(n);
  }
  for (const m of content.matchAll(/export\s+(?:declare\s+)?(?:async\s+)?(?:function\*?|class|const|let|var|interface|type|enum)\s+(\w+)/g)) {
    out.defines.add(m[1]!);
  }
  out.hasDefault = /export\s+default\b/.test(content);
  for (const m of content.matchAll(/import\s+(?:type\s+)?\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g)) {
    const t = resolveSpecifier(m[2]!, file);
    if (t) for (const n of splitExportNames(m[1]!)) out.importedNames.push({ name: n, target: t });
  }
  exportCache.set(file, out);
  return out;
}

/** `A, B as C` -> ['A', 'C'] (exported identity = right side of `as`). */
function splitExportNames(clause: string): string[] {
  return clause.split(',').map((p) => {
    const s = p.trim().replace(/^type\s+/, '');
    const as = s.match(/\bas\s+(\w+)$/);
    return as ? as[1]! : s;
  }).filter(Boolean);
}

/**
 * Which file(s) define `name` for the given entry module? Follows
 * `export * from` and `export {…} from` edges (BFS). A local
 * `import {X} from './src'; export {X}` resolves back to the import source.
 */
function findComponentHomes(root: string, name: string): string[] {
  const homes: string[] = [];
  const seen = new Set<string>();
  const queue: { file: string; acceptDefault: boolean }[] = [{ file: root, acceptDefault: false }];
  while (queue.length > 0) {
    const { file, acceptDefault } = queue.shift()!;
    if (seen.has(file)) continue;
    seen.add(file);
    const ex = exportsOf(file);
    if (ex.defines.has(name)) {
      homes.push(file);
      continue;
    }
    if (ex.localNames.has(name)) {
      // Local export: definition is in this file (defines() would have hit) or
      // it was imported then re-exported — chase the import source.
      const sources = ex.importedNames.filter((i) => i.name === name);
      if (sources.length === 0) homes.push(file);
      else for (const s of sources) queue.push({ file: s.target, acceptDefault: false });
      continue;
    }
    if (acceptDefault && ex.hasDefault) {
      homes.push(file);
      continue;
    }
    for (const nf of ex.namedFrom.filter((c) => c.names.includes(name))) {
      queue.push({ file: nf.target, acceptDefault: false });
    }
    for (const s of ex.stars) queue.push({ file: s, acceptDefault: false });
  }
  return homes;
}

/** Does `file` (or its re-export closure) contain download logic? */
function reachesMarker(start: string, markers: Set<string>): boolean {
  const visited = new Set<string>();
  const queue = [start];
  while (queue.length > 0) {
    const file = queue.pop()!;
    if (visited.has(file)) continue;
    visited.add(file);
    if (markers.has(file)) return true;
    const ex = exportsOf(file);
    queue.push(...ex.stars, ...ex.namedFrom.map((n) => n.target));
  }
  return false;
}

/** Closure only — does anything `file` RE-EXPORTS contain download logic? */
function closureReachesMarker(start: string, markers: Set<string>): boolean {
  const visited = new Set<string>([start]);
  const queue = [...exportsOf(start).stars, ...exportsOf(start).namedFrom.map((n) => n.target)];
  while (queue.length > 0) {
    const file = queue.pop()!;
    if (visited.has(file)) continue;
    visited.add(file);
    if (markers.has(file)) return true;
    const ex = exportsOf(file);
    queue.push(...ex.stars, ...ex.namedFrom.map((n) => n.target));
  }
  return false;
}

const DOWNLOAD_MARKERS = ['downloadOrShare', 'BulkToolShell', 'JSZip', 'URL.createObjectURL'];
function hasDownloadMarker(text: string): boolean {
  return DOWNLOAD_MARKERS.some((m) => text.includes(m));
}

/**
 * Source text of a `function|class|const Name …` definition in `file`.
 * - Declarations (`function f(…) {…}`, `class C {…}`): body = first `{`
 *   outside parameter parens.
 * - Arrow/function expressions (`const f = (…) => {…}`): body after `=>`.
 * - Plain value consts (`const a = document.createElement('a');`): the
 *   statement up to `;` — critically NOT the next function's body (an earlier
 *   version scanned ahead and swallowed unrelated markers, mis-attrributing
 *   e.g. `HangmanGame` to `const a` inside CounterTool's download handler).
 * Returns null when the body can't be isolated (callers fall back to
 * file-level checks). Brace/semicolon matching is heuristic.
 */
function componentSource(file: string, name: string): DefSource | null {
  const content = readModule(file);
  const def = new RegExp(`(?:export\\s+)?(?:declare\\s+)?(?:async\\s+)?(function\\*?|class|const|let|var)\\s+${name}\\b`).exec(content);
  if (!def) return null;
  const kw = def[1]!;
  const start = def.index;
  let i = start + def[0].length;
  const skipWs = () => { while (i < content.length && /\s/.test(content[i]!)) i++; };

  if (kw === 'function' || kw === 'class') {
    // First `{` outside parameter parens, then brace-match.
    let paren = 0;
    for (; i < content.length; i++) {
      const ch = content[i];
      if (ch === '(') paren++;
      else if (ch === ')') paren--;
      else if (ch === '{' && paren === 0) break;
    }
    if (i >= content.length) return null;
    const bodyStart = i;
    let depth = 0;
    for (; i < content.length; i++) {
      if (content[i] === '{') depth++;
      else if (content[i] === '}') { depth--; if (depth === 0) return { start, text: content.slice(start, i + 1) }; }
    }
    return null;
  }

  // const/let/var: scan the initializer statement with depth tracking.
  skipWs();
  if (content[i] !== '=') return null;
  i++;
  let paren = 0, bracket = 0, brace = 0;
  let seenArrow = false;
  for (; i < content.length; i++) {
    const ch = content[i]!;
    if (content.startsWith('=>', i) && paren === 0 && brace === 0 && bracket === 0) {
      seenArrow = true;
      i++; // step into '>' (loop's i++ lands after '=>')
      skipWs();
      if (content[i] === '{') {
        const bodyStart = i;
        let depth = 0;
        for (; i < content.length; i++) {
          if (content[i] === '{') depth++;
          else if (content[i] === '}') { depth--; if (depth === 0) return { start, text: content.slice(start, i + 1) }; }
        }
        return null;
      }
      // expression-bodied arrow: run to `;` at depth 0
      paren = bracket = brace = 0;
      continue;
    }
    if (ch === '(') paren++;
    else if (ch === ')') paren--;
    else if (ch === '[') bracket++;
    else if (ch === ']') bracket--;
    else if (ch === '{' && !seenArrow) brace++;
    else if (ch === '}' && !seenArrow) brace--;
    else if (ch === ';' && paren === 0 && bracket === 0 && brace === 0) return { start, text: content.slice(start, i + 1) };
  }
  return null;
}

interface DefSource { start: number; text: string }

/** name -> all `function|class|const Name …` definitions in `file` (incl. nested helpers). */
function definitionsOf(file: string): Map<string, DefSource[]> {
  const hit = definitionCache.get(file);
  if (hit) return hit;
  const content = readModule(file);
  const defs = new Map<string, DefSource[]>();
  const re = /(?:^|\n)\s*(?:export\s+)?(?:declare\s+)?(?:async\s+)?(?:function\*?|class|const|let|var|enum)\s+(\w+)/g;
  for (const m of content.matchAll(re)) {
    const name = m[1]!;
    const src = componentSource(file, name);
    if (src !== null) {
      const list = defs.get(name) ?? [];
      list.push(src);
      defs.set(name, list);
    }
  }
  definitionCache.set(file, defs);
  return defs;
}
const definitionCache = new Map<string, Map<string, DefSource[]>>();

/**
 * Does the component (or a module-scope helper it references, transitively
 * up to `maxDepth`) contain download logic? Helpers only count when their
 * definition is POSITIONALLY INSIDE the checked slice — names like `clr` or
 * `handleCopy` repeat across sibling components, and name-only lookup crosses
 * component boundaries (previously hung Hangman → Counter's `clr` →
 * CounterTool's download handler). Shared widget files keep downloads in
 * helpers between components (ConfigValidatorWidgets) — those components
 * download via CalculatorShell's downloadData prop, caught above.
 */
function sliceReachesMarker(file: string, start: number, end: number, maxDepth = 3): boolean {
  const content = readModule(file);
  const slice = content.slice(start, end);
  if (hasDownloadMarker(slice)) return true;
  if (/\bdownload(?:Data|Filename)\b/.test(slice)) return true;
  if (maxDepth === 0) return false;
  const defs = definitionsOf(file);
  const referenced = new Set([...slice.matchAll(/\b([A-Za-z_$][\w$]*)\b/g)].map((m) => m[1]!));
  for (const [name, list] of defs) {
    if (!referenced.has(name)) continue;
    for (const d of list) {
      if (d.start < start || d.start + d.text.length > end) continue; // outside this slice
      if (process.env.DOWNLOAD_SLUGS_TRACE) console.log(`[trace] helper '${name}' @${d.start} in ${relPath(file)}`);
      if (sliceReachesMarker(file, d.start, d.start + d.text.length, maxDepth - 1)) return true;
    }
  }
  return false;
}

interface WrapperEntry { slug: string; modPath: string; selector?: string }

/** slug -> wrapper module path (+ optional `.then(m => ({ default: m.X }))` selector). */
function parseWrapperEntries(): WrapperEntry[] {
  const wrapper = readFileSync(WRAPPER_PATH, 'utf8');
  const entries: WrapperEntry[] = [];
  const re = /['"]([\w-]+)['"]\s*:\s*dynamic\(\s*\(\)\s*=>\s*import\(\s*['"]@\/components\/tools\/modules\/([^'"]+)['"]\)\s*(?:\.then\(\s*m\s*=>\s*\(\s*\{\s*default:\s*m\.(\w+)\s*\}\s*\)\s*\))?/g;
  for (const m of wrapper.matchAll(re)) entries.push({ slug: m[1]!, modPath: m[2]!, selector: m[3] });
  return entries;
}

function mapSlugs(files: string[]): string[] {
  const markerFiles = new Set(files.filter((f) => !DEAD_IMPORTS.has(relPath(f))));
  const entries = parseWrapperEntries();
  const slugs = new Set<string>();
  let unresolved = 0;

  for (const { slug, modPath, selector } of entries) {
    // Skip trivial downloads (calculators, text generators, dev tools)
    if (TRIVIAL_DOWNLOADS.has(slug)) continue;
    const file = resolveFile(join(MODULES_DIR, modPath));
    if (!file) {
      unresolved++;
      continue;
    }
    if (!selector) {
      // Single-component module: the module file IS the component.
      if (reachesMarker(file, markerFiles) || /\bdownload(?:Data|Filename)\b/.test(readModule(file))) slugs.add(slug);
      continue;
    }
    const homes = selector ? findComponentHomes(file, selector) : [file];
    if (homes.length === 0) unresolved++;
    const debug = process.env.DOWNLOAD_SLUGS_DEBUG && process.env.DOWNLOAD_SLUGS_DEBUG.split(',').includes(slug);
    if (debug) console.log(`[debug] ${slug}: module=${relPath(file)} selector=${selector ?? '-'} homes=${homes.map(relPath).join('|') || 'NONE'}`);
    // Shared barrel files host many components; attribute download logic to
    // the SELECTED component's body (or its re-export closure), not the file.
    const attributed = homes.some((h) => {
      const src = componentSource(h, selector);
      const bodyOk = src !== null && (sliceReachesMarker(h, src.start, src.start + src.text.length) || closureReachesMarker(h, markerFiles));
      const fallback = src === null && reachesMarker(h, markerFiles);
      if (debug) console.log(`[debug] ${slug}: home=${relPath(h)} slice=${src === null ? 'NULL' : src.text.length} bodyOk=${bodyOk} fallback=${fallback}`);
      return bodyOk || fallback;
    });
    if (debug) console.log(`[debug] ${slug}: attributed=${attributed}`);
    if (attributed) slugs.add(slug);
  }
  if (unresolved > 0) console.warn(`  warning: ${unresolved} entry/entries had unresolved module/component paths`);
  if (process.env.DOWNLOAD_SLUGS_DEBUG) {
    console.log(`  parsed ${entries.length} wrapper entries, ${markerFiles.size} marker files`);
  }

  return [...slugs].sort();
}

function relPath(abs: string): string {
  return abs.replace(MODULES_DIR + '/', '').replace(/\.tsx?$/, '');
}

function generateFile(slugs: string[]): string {
  const lines = [
    '// AUTO-GENERATED by scripts/generate-download-slugs.ts — do not edit manually.',
    '// Regenerate: npx tsx scripts/generate-download-slugs.ts',
    '// Source: grep for downloadOrShare calls in modules/ × DynamicModuleWrapper slug mappings.',
    '',
    'export const DOWNLOAD_PRODUCING_SLUGS = new Set([',
  ];

  for (let i = 0; i < slugs.length; i += 8) {
    const chunk = slugs
      .slice(i, i + 8)
      .map((s) => `  '${s}'`)
      .join(', ');
    lines.push(chunk + ',');
  }

  lines.push(']);');
  lines.push('');
  return lines.join('\n');
}

// --- Main ---
const files = findDownloadFiles();
console.log(`Found ${files.length} files importing downloadOrShare`);

const slugs = mapSlugs(files);
console.log(`Mapped to ${slugs.length} DynamicModuleWrapper slugs (download markers, downloadData props, or re-export closure)`);

const content = generateFile(slugs);
writeFileSync(OUTPUT_PATH, content);
console.log(`Written to ${OUTPUT_PATH}`);
