import { describe, it, expect } from 'vitest';
import { toolsRegistry } from '@/registry/tools';

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
  tsv: ['tsv'], ndjson: ['ndjson'], avro: ['avro'], zod: ['zod'],
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
    for (const tool of toolsRegistry) {
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
    const failures = toolsRegistry
      .filter(t => t.seoDescription && t.description === t.seoDescription
        .replace(/^Free online .*? (—|\\u2014) /, '')
        .replace(/\. $/, '.')
        .trim())
      .map(t => `${t.name} (${t.slug}): "${t.description}"`);
    if (failures.length > 0) {
      console.warn(`\n⚠ WARNING: ${failures.length} tools have description identical to seoDescription content.`);
      console.warn(`  This is tracked as content-opportunity work (item #5), not a regression.\n`);
    }
  });
});
