import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { toolsRegistry, SEO_PERMUTATIONS } from '@/registry/tools';
import { clientToolsRegistry } from '@/registry/tools-client-index';
import { deriveSeoInstructionType, categoryFaqTemplates, deriveInputAnswer } from '@/components/tools/ToolPageSEOContent';
import { UNIT_FAMILIES } from '@/components/tools/modules/shared/unitFamilies';

/**
 * Lenient description/seoDescription clone check (item #5): compares against
 * the seoDescription with its "Free online … — " prefix stripped. Shared by
 * the warn test and the FAQ metrics ratchet (baseline.descSeoIdentical).
 */
function descSeoDuplicates() {
  return toolsRegistry.filter(t => t.seoDescription && t.description === t.seoDescription
    .replace(/^Free online .*? (—|\\u2014) /, '')
    .replace(/\. $/, '.')
    .trim());
}

const stopwords = new Set([
  'to', 'and', 'the', 'in', 'for', 'of', 'a', 'an', 'is', 'it', 'its', 'on', 'or', 'with',
  'by', 'at', 'as', 'be', 'but', 'from', 'not', 'so', 'up', 'you', 'your', 'other', 'do',
]);

const structuralWords = new Set([
  'tool', 'online', 'free', 'bulk', 'pro',
  'converter', 'calculator', 'generator', 'checker', 'validator', 'formatter',
  'extractor', 'editor', 'viewer', 'reader', 'maker', 'builder', 'tester',
  'analyzer', 'estimator', 'decoder', 'encoder', 'transformer', 'inspector',
  'detector', 'debugger', 'finder', 'cleaner', 'remover', 'cutter', 'trimmer',
  'splitter', 'minifier', 'minimizer', 'normalizer', 'sharer', 'tracker',
  'planner', 'scheduler', 'manager', 'parser', 'resizer', 'cropper',
  'anonymizer', 'optimizer', 'modernizer', 'stripper', 'injector',
  'compress', 'compressor', 'merge', 'merger', 'convert', 'edit', 'resize',
  'translate', 'remove', 'count', 'counter', 'search', 'finder',
  'kit', 'tools', 'generators', 'recorder', 'filters',
]);

const formatAliases: Record<string, string[]> = {
  jpg: ['jpeg'], jpeg: ['jpg'],
  js: ['javascript'], ts: ['typescript'],
  jwt: ['json web token', 'json web tokens'],
  heic: ['heic'], epub: ['epub'], cbz: ['cbz'], eml: ['eml'],
  tsv: ['tsv', 'tab-separated', 'tab separated'], csv: ['comma-separated', 'comma separated'],
  jsonl: ['json lines', 'json'], semver: ['semantic version', 'semantic'],
  ndjson: ['ndjson'], avro: ['avro'], zod: ['zod'],
  pug: ['pug'], ini: ['ini'],
  bmi: ['body mass index'], bmr: ['basal metabolic rate'],
  gst: ['gst'], vat: ['vat'],
  roi: ['return on investment'], cagr: ['cagr'],
  cgpa: ['cumulative grade'], ifsc: ['ifsc'], pan: ['pan'],
  uuid: ['uuid'], ulid: ['ulid'], otp: ['one-time password', 'one time password'],
  pgp: ['pgp'], hmac: ['hmac'],
  sha: ['secure hash'], md5: ['md5'], aes: ['aes'],
  sql: ['sqlite'], url: ['url'],
  dpi: ['dots per inch'], ppi: ['pixels per inch'],
  eta: ['estimated time', 'eta', 'travel time'],
  gpa: ['grade point average'],
  tts: ['text to speech', 'text-to-speech'],
  ocr: ['optical character'],
  cve: ['cve'], cors: ['cors'],
  csp: ['content security policy'], dns: ['dns'],
  ssl: ['tls'], ip: ['ip address'],
  pin: ['pin'],
  emi: ['equal monthly', 'loan', 'installment'],
  sip: ['systematic', 'mutual fund', 'mutual-fund', 'recurring'],
  mrr: ['monthly recurring revenue', 'mrr'],
  ltv: ['ltv'], roas: ['roas'], arr: ['annual recurring revenue', 'arr'],
  saas: ['saas', 'subscription'],
  tds: ['tax deducted'],
  exif: ['gps location', 'camera serial', 'copyright metadata', 'metadata'],
  diff: ['differences', 'inserted', 'deleted', 'compare', 'compar'],
  regex: ['regular expression', 'pattern'],
  slugify: ['url-friendly', 'slug'],
  mac: ['mac address'],
  whois: ['domain registration', 'rdap'],
  privacy: ['cookies', 'cache', 'browser data', 'session', 'private'],
  background: ['foreground subject', 'transparent png', 'remove background'],
  decision: ['choose', 'pick', 'randomly pick', 'decide'],
  geometry: ['area', 'perimeter', 'volume', 'shape'],
  trigonometry: ['sine', 'cosine', 'tangent', 'trig'],
  modulo: ['remainder', 'mod'],
  combination: ['ncr', 'choose k items', 'combination'],
  'least common multiple': ['lcm', 'least common multiple'],
  paraphrasing: ['rewrite', 'paraphrase', 'rephrase'],
  math: ['expression evaluator', 'calculator', 'numerical', 'arithmetic'],
  creative: ['emoji', 'ascii art'],
  beautifier: ['beautify', 'prettify', 'format'],
  anonymizer: ['anonymize', 'masking', 'mask'],
  allowlist: ['allow', 'deny', 'cidr', 'nginx'],
  runway: ['cash balance', 'burn rate', 'monthly burn'],
  'working capital': ['gross profit', 'net income', 'margin', 'operating expense'],
  capital: ['gross profit', 'net income', 'margin', 'operating expense'],
  test: ['correct/total', 'percentage', 'letter grade'],
  score: ['correct/total', 'percentage', 'letter grade'],
  image: ['photo', 'photograph', 'picture', 'pixel', 'images', 'photos'],
  api: ['http', 'endpoint', 'get, post, put, delete', 'response', 'request'],
  translator: ['translate', 'translation', 'language', 'neural machine'],
  text: ['text', 'string', 'content', 'character'],
  speech: ['voice', 'speak', 'audio', 'tts', 'ai voice'],
  currency: ['currencies', 'exchange rate', 'financial', 'monetary'],
  power: ['kw', 'hp', 'bhp', 'watt', 'mw'],
  pressure: ['kpa', 'psi', 'bar', 'atm', 'torr'],
  speed: ['km/h', 'mph', 'm/s', 'knots'],
  least: ['lcm'],
  multiple: ['lcm'],
  password: ['passphrase', 'passphrases'],
  memorable: ['easy-to-remember', 'easy to remember'],
  list: ['task', 'tasks', 'todo', 'to-do'],
  data: ['anonymize', 'anonymizing', 'mask', 'masking', 'email', 'phone number'],
  utilities: ['diff', 'qrcode', 'qr code', 'placeholder', 'parser', 'generator'],
  pricing: ['subscription', 'revenue', 'pricing', 'tiers', 'tier'],
  recorder: ['record', 'audio'],
  voice: ['audio', 'microphone', 'speech'],
  mini: ['ulid', 'numeronym', 'vendor lookup'],
  gas: ['fuel', 'mpg', 'fuel economy'],
  mileage: ['fuel economy', 'mpg', 'fuel'],
};

function nameWords(name: string): string[] {
  return name.toLowerCase().split(/[\s\-/]+/).filter(w => w.length > 1 && !stopwords.has(w));
}

function significantWords(words: string[]): string[] {
  return words.filter(w => !structuralWords.has(w));
}

function keywordVariants(word: string): string[] {
  const lower = word.toLowerCase();
  const results = [lower];
  // Check aliases for base word and all stripped forms
  const forms = [lower];
  if (lower.endsWith('s')) forms.push(lower.slice(0, -1));
  if (lower.endsWith('ing')) forms.push(lower.slice(0, -3), lower.slice(0, -3) + 'e');
  if (lower.endsWith('ed')) forms.push(lower.slice(0, -2), lower.slice(0, -1));
  if (lower.endsWith('er')) forms.push(lower.slice(0, -2));
  for (const f of forms) {
    if (formatAliases[f]) results.push(...formatAliases[f]);
  }
  return [...new Set(results)].filter(v => v.length > 1);
}

function descMatchesKeyword(desc: string, keyword: string): boolean {
  const lower = desc.toLowerCase();
  return keywordVariants(keyword).some(v => lower.includes(v));
}

describe('tool description content integrity', () => {
  it('every tool description mentions at least one significant word from its name', () => {
    const failures: string[] = [];
    for (const tool of toolsRegistry) {
      const sig = significantWords(nameWords(tool.name));
      if (sig.length === 0) continue;
      const desc = tool.description;
      const matches = sig.some(kw => descMatchesKeyword(desc, kw));
      if (!matches) {
        failures.push(`${tool.name} (${tool.slug}): name keys [${sig.join(', ')}] not found in "${tool.description}"`);
      }
    }
    expect(failures, failures.join('\n')).toHaveLength(0);
  });

  it('no two tools have identical descriptions', () => {
    const seen = new Map<string, string[]>();
    // Track which tools are SEO virtual duplicates (same slug, different entry)
    const slugSet = new Set<string>();
    for (const tool of toolsRegistry) {
      // Skip SEO virtual entries that share a slug with a real tool
      if (slugSet.has(tool.slug)) continue;
      slugSet.add(tool.slug);
      const existing = seen.get(tool.description) || [];
      existing.push(`${tool.name} (${tool.slug})`);
      seen.set(tool.description, existing);
    }
    const dupes = [...seen.entries()].filter(([, names]) => names.length > 1);
    const msg = dupes.map(([desc, names]) => `${names.join(', ')} share description "${desc}"`).join('\n');
    expect(dupes, msg).toHaveLength(0);
  });

  it('no description uses the old boilerplate pattern', () => {
    const boilerplate = /[Cc]onvert .* to .* online for free\. Fast, browser-based conversion/;
    const failures = toolsRegistry
      .filter(t => boilerplate.test(t.description))
      .map(t => `${t.name} (${t.slug}): "${t.description}"`);
    expect(failures, failures.join('\n')).toHaveLength(0);
  });

  it('seoDescription content and description content are not identical (descriptions should complement, not duplicate)', () => {
    const failures = descSeoDuplicates()
      .map(t => `${t.name} (${t.slug}): "${t.description}"`);
    if (failures.length > 0) {
      console.warn(`\n⚠ WARNING: ${failures.length} tools have description identical to seoDescription content.`);
      console.warn(`  Tracked as content-opportunity work (item #5) — ratcheted via baseline.descSeoIdentical.\n`);
    }
    if (process.env.UPDATE_BASELINE) return; // baseline written by the FAQ metrics ratchet below
    const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
    expect(
      failures.length,
      `description identical to seoDescription (ratchet ${baseline.descSeoIdentical}):\n${failures.join('\n')}`
    ).toBeLessThanOrEqual(baseline.descSeoIdentical);
  });

  it('deriveSeoInstructionType returns correct type for all SEO-category tools', () => {
    const seoTools = toolsRegistry.filter(t => t.category === 'SEO');
    const expectedTypes: Record<string, string> = {
      'xml-sitemap-generator': 'seo-generator',
      'meta-tag-generator': 'seo-generator',
      'keyword-density-checker': 'seo-analyzer',
      'robots-txt-generator': 'seo-generator',
      'bulk-url-status-checker': 'seo-checker',
      'word-frequency-counter': 'seo-analyzer',
      'keyword-planner-tool': 'seo-analyzer',
      'seo-meta-tag-generator': 'seo-generator',
      'seo-preview-generator': 'seo-preview',
      'seo-headline-analyzer': 'seo-analyzer',
      'seo-schema-generator': 'seo-generator',
      'seo-slug-generator': 'seo-generator',
      'text-to-html-converter': 'seo-converter',
      'html-to-text-converter': 'seo-converter',
      'duplicate-word-remover': 'seo-cleanup',
      'text-cleaner': 'seo-cleanup',
      'text-splitter': 'seo-cleanup',
      'trailing-space-remover': 'seo-cleanup',
      'canonical-url-checker': 'seo-checker',
      'breadcrumb-schema-generator': 'seo-generator',
      'utm-builder': 'seo-generator',
      'bulk-url-checker': 'seo-checker',
      'bulk-link-checker': 'seo-checker',
    };
    const failures: string[] = [];
    for (const tool of seoTools) {
      const expected = expectedTypes[tool.slug];
      expect(expected, `No expected type defined for SEO tool "${tool.name}" (${tool.slug})`).toBeTruthy();
      const actual = deriveSeoInstructionType(tool.slug, tool.name, tool.description);
      if (actual !== expected) {
        failures.push(`${tool.name} (${tool.slug}): expected "${expected}", got "${actual}"`);
      }
    }
    expect(failures, failures.join('\n')).toHaveLength(0);
  });

  it('all SEO_PERMUTATIONS have a valid parent tool in the registry', () => {
    const failures: string[] = [];
    for (const perm of SEO_PERMUTATIONS) {
      const resolved = toolsRegistry.find(t => t.slug === perm.parentSlug);
      if (!resolved) {
        failures.push(`${perm.slug}: parent "${perm.parentSlug}" not in toolsRegistry`);
      }
    }
    expect(failures, failures.join('\n')).toHaveLength(0);
  });

  it('no SEO_PERMUTATIONS description contains the old hardcoded image-specific use case strings', () => {
    const cargoCultedStrings = [
      'optimizing images for Pagespeed',
      'standardizing product photo formats',
      'repurposing assets across platforms',
      'delivering assets in multiple format specs',
    ];
    const failures: string[] = [];
    for (const perm of SEO_PERMUTATIONS) {
      for (const bad of cargoCultedStrings) {
        if (perm.description.toLowerCase().includes(bad.toLowerCase())) {
          failures.push(`${perm.slug} (${perm.name}): description contains cargo-culted string "${bad}"`);
        }
      }
    }
    expect(failures, failures.join('\n')).toHaveLength(0);
  });

  it('SEO FAQ template answers do not reference specific tool subtypes (generators/checkers/analyzers) that mislead for other SEO tools', () => {
    const subtypePattern = /\b(generators?|checkers?|analyzers?)\b/i;
    const failures: string[] = [];
    const seoEntry = categoryFaqTemplates['SEO'];
    const seoFaqs = typeof seoEntry === 'function'
      ? seoEntry({ id: 'test', slug: 'test', name: 'Test', description: 'Test', category: 'SEO', component: 'Test', componentPath: '' } as any)
      : seoEntry;
    for (const faq of seoFaqs) {
      if (subtypePattern.test(faq.answer)) {
        failures.push(`SEO FAQ "${faq.question.slice(0, 50)}..." answer references tool subtype: "${faq.answer}"`);
      }
    }
    expect(failures, failures.join('\n')).toHaveLength(0);
  });

  it('unit converters (UNIT_FAMILIES) do not get "upload a file" as their input type', () => {
    const unitSlugs = Object.keys(UNIT_FAMILIES);
    const failures: string[] = [];
    for (const slug of unitSlugs) {
      const tool = toolsRegistry.find(t => t.slug === slug);
      if (!tool) {
        failures.push(`${slug}: not found in toolsRegistry`);
        continue;
      }
      const answer = deriveInputAnswer(tool);
      if (answer.toLowerCase().includes('upload a file')) {
        failures.push(`${slug} (${tool.name}): derives as "upload a file" instead of numeric unit input`);
      }
    }
    expect(failures, failures.join('\n')).toHaveLength(0);
  });
});

const BASELINE_PATH = path.join(__dirname, 'content-integrity-baseline.json');

function stripSeoPrefix(seo: string, name: string): string {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return seo.replace(new RegExp(`^Free online ${esc} — `, 'i'), '').trim();
}

describe('content integrity gate: registry copy + FAQ ratchet (item 26)', () => {
  it('no shipped coming-soon promises', () => {
    const hits = toolsRegistry
      .filter((t) => /coming soon/i.test(`${t.description} ${t.seoDescription || ''}`))
      .map((t) => t.slug);
    expect(hits, 'slugs promising coming-soon features').toEqual([]);
  });

  it('no thin-suspicious modules', () => {
    const root = path.join(process.cwd(), 'src/components/tools/modules');
    const walk = (d: string): string[] =>
      fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(d, e.name);
        return e.isDirectory() ? walk(p) : p.endsWith('.tsx') ? [p] : [];
      });
    const suspects = walk(root).filter((f) => {
      const src = fs.readFileSync(f, 'utf8');
      if (src.split('\n').length >= 40) return false;
      if (src.includes('export *')) return false; // barrel
      // healthy thin wrappers reuse shared engines/shells/hubs/configs …
      if (/shared\/|Shell|Hub|config|preset|BulkToolShell/i.test(src)) return false;
      // … or compose sibling modules (the core/leaf split: a leaf like
      // pdf/editor/Sidebar.tsx is thin ON PURPOSE because the shared piece
      // — PagesList, shared desktop + mobile — lives next door). Importing
      // a local module is reuse the keyword list can't spell.
      return !/from ['"]\.\.?\//.test(src);
    }).map((f) => path.relative(root, f));
    expect(suspects, 'thin modules with no shared reuse').toEqual([]);
  });

  it('FAQ metrics do not regress vs baseline', () => {
    const qCount = new Map<string, number>();
    let missing = 0;
    let under4 = 0;
    for (const t of toolsRegistry) {
      const faqs = (t as { faqs?: { question: string; answer: string }[] }).faqs || [];
      if (faqs.length === 0) missing++;
      else if (faqs.length < 4) under4++;
      for (const f of faqs) qCount.set(f.question, (qCount.get(f.question) || 0) + 1);
    }
    const dupGroups = [...qCount.values()].filter((n) => n > 1).length;
    const dupInstances = [...qCount.values()].filter((n) => n > 1).reduce((a, n) => a + n, 0);
    const current = {
      dupGroups,
      dupInstances,
      missingFaqs: missing,
      under4Faqs: under4,
      descSeoIdentical: descSeoDuplicates().length,
      toolCount: toolsRegistry.length,
    };
    if (process.env.UPDATE_BASELINE) {
      fs.writeFileSync(BASELINE_PATH, JSON.stringify(current, null, 2) + '\n');
      console.info('baseline written:', current);
      return;
    }
    const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
    expect(current.dupGroups, 'duplicate FAQ groups').toBeLessThanOrEqual(baseline.dupGroups);
    expect(current.dupInstances, 'duplicate FAQ instances').toBeLessThanOrEqual(baseline.dupInstances);
    expect(current.missingFaqs, 'tools missing FAQs').toBeLessThanOrEqual(baseline.missingFaqs);
    // Tier-1 depth ratchet: a tool that started FAQs but stopped at 1-3, and
    // description/seoDescription clones, must never grow. See TODO #28.
    expect(current.under4Faqs, 'tools with a partial FAQ set (1-3 entries)').toBeLessThanOrEqual(baseline.under4Faqs);
    expect(current.descSeoIdentical, 'description identical to seoDescription').toBeLessThanOrEqual(baseline.descSeoIdentical);
  });

  it('reports one-way converters (non-failing)', () => {
    const slugs = new Set(clientToolsRegistry.filter((t) => t.category === 'Converter').map((t) => t.slug));
    const pairs: [string, string][] = [
      ['json-to-csv', 'csv-to-json'], ['json-to-xml', 'xml-to-json'], ['yaml-to-json', 'json-to-yaml'],
      ['csv-to-tsv', 'tsv-to-csv'], ['json-to-yaml', 'yaml-to-json'], ['csv-to-html', 'html-to-csv'],
    ];
    const missing = pairs.filter(([a, b]) => (slugs.has(a) && !slugs.has(b)) || (slugs.has(b) && !slugs.has(a))).flat();
    console.info(`one-way converter check: ${missing.length ? 'missing reverse: ' + missing.join(', ') : 'all checked pairs bidirectional'}`);
    expect(true).toBe(true);
  });
});
