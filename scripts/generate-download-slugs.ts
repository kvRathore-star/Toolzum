#!/usr/bin/env node
/**
 * Generates src/lib/downloadProducingSlugs.ts from static analysis:
 * 1. Finds all module files that import downloadOrShare
 * 2. Excludes files that import but never call it (dead imports)
 * 3. Maps file paths to their DynamicModuleWrapper slugs
 * 4. Writes a Set constant used by ToolLayout for download badge visibility
 *
 * Run: npx tsx scripts/generate-download-slugs.ts
 * Wired into: npm run build (via gen:download-slugs)
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

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

function mapSlugs(filePaths: string[]): string[] {
  const wrapper = readFileSync(WRAPPER_PATH, 'utf8');
  const lines = wrapper.split('\n');
  const slugs = new Set<string>();

  for (const filePath of filePaths) {
    // Extract relative path from modules/ (e.g. "ai/AiArticleWriter")
    const relPath = filePath
      .replace(MODULES_DIR + '/', '')
      .replace(/\.tsx?$/, '');

    // Skip dead imports
    if (DEAD_IMPORTS.has(relPath)) continue;

    // Find DynamicModuleWrapper lines referencing this exact module path
    for (const line of lines) {
      if (line.includes(relPath)) {
        const slugMatch = line.match(/'([\w-]+)'/);
        if (slugMatch) {
          const slug = slugMatch[1];
          // Skip trivial downloads (calculators, text generators, dev tools)
          if (!TRIVIAL_DOWNLOADS.has(slug!)) {
            slugs.add(slug!);
          }
        }
      }
    }
  }

  return [...slugs].sort();
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
console.log(`Mapped to ${slugs.length} DynamicModuleWrapper slugs`);

const content = generateFile(slugs);
writeFileSync(OUTPUT_PATH, content);
console.log(`Written to ${OUTPUT_PATH}`);
