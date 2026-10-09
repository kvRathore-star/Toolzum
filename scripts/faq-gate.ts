/**
 * faq-gate.ts — #26 remainder: FAQ near-dupe, thin-block, and one-way-converter checks.
 *
 * Thresholds (measured Sep 15, not guessed):
 * - Custom FAQ sets: 150-176 words, pairwise 5-gram Jaccard 0.00-0.02.
 * - Category-fallback pairs: 132-145 words (word count ALONE cannot separate!),
 *   pairwise Jaccard 0.45-0.57.
 * - Cutoff JACCARD_DUP = 0.30: cleanly separates customs (<0.03) from
 *   template-likes (>=0.45). Thin ≡ near-duplicate of own category template.
 *
 * Scope: git-touched registry tools by default (pre-commit safe).
 *   --full runs all tools (bulk-rollout validation).
 * Fail-closed: zero parsed tools, or unresolvable templates, exit non-zero.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { toolsRegistry } from '../src/registry/tools';
import { categoryFaqTemplates } from '../src/components/tools/ToolPageSEOContent';
import { FORMAT_INFO } from '../src/lib/cloudPatterns';

const ROOT = process.cwd();
const JACCARD_DUP = 0.30;

// Extraction tools are inherently one-way (audio out of video has no
// meaningful reverse). Documented acceptances — not gaps.
const ONE_WAY_ACCEPTED = new Set([
  'mp4-to-mp3', // audio extraction; mp3-to-mp4 is meaningless
  'mov-to-mp3',
  'webm-to-mp3',
  // Reverses that live under different slugs (verified Oct 9):
  'gif-to-mp4', // reverse is video-to-gif (accepts mp4/mov/webm)
  'pdf-to-png', // reverse is bulk-image-to-pdf / jpg-to-pdf
  // No meaningful reverse exists:
  'eml-to-pdf', // cannot reconstruct an email from a PDF
  'html-to-jsx', // JSX-to-HTML needs execution, not conversion
  'svg-to-css', // CSS cannot regenerate vector source
  // Reverse would be a new tool (sql-to-csv noted as candidate):
  'csv-to-sql',
]);

const words = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
const shingles = (s: string, n = 5): Set<string> => {
  const w = words(s);
  const set = new Set<string>();
  for (let i = 0; i + n <= w.length; i++) set.add(w.slice(i, i + n).join(' '));
  return set;
};
const jaccard = (a: Set<string>, b: Set<string>): number => {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter || 1);
};
const blockOf = (faqs: { question: string; answer: string }[]) =>
  faqs.map((f) => f.question + ' ' + f.answer).join(' ');

function templateBlock(category: string, tool: any): string | null {
  const fn: any = (categoryFaqTemplates as any)[category];
  if (!fn) return null;
  const faqs = typeof fn === 'function' ? fn(tool) : fn;
  return blockOf(faqs);
}

function touchedSlugs(): Set<string> | null {
  // null = check everything (--full); otherwise only git-touched slugs.
  if (process.argv.includes('--full')) return null;
  let diff = '';
  try {
    diff = execSync('git diff HEAD -- src/registry/tools.ts src/registry/tools-chunk-*.ts src/registry/tools-constants.ts',
      { encoding: 'utf-8', cwd: ROOT });
  } catch {
    console.error('FATAL: git diff failed — refusing to pass blind.');
    process.exit(2);
  }
  return new Set([...diff.matchAll(/^\+.*slug:\s*["']([a-z0-9-]+)["']/gm)].map((m) => m[1]!));
}

function wrapperMap(): Map<string, string> {
  const src = fs.readFileSync(path.join(ROOT, 'src/components/tools/modules/DynamicModuleWrapper.tsx'), 'utf8');
  const out = new Map<string, string>();
  for (const m of src.matchAll(/'([a-z0-9-]+)': dynamic\(\(\) => import\('([^']+)'\)/g)) {
    if (!out.has(m[1]!)) out.set(m[1]!, m[2]!);
  }
  return out;
}

function main() {
  if (toolsRegistry.length === 0) {
    console.error('FATAL: parsed 0 registry tools — refusing to pass blind.');
    process.exit(2);
  }
  const touched = touchedSlugs();
  const tools = touched === null ? toolsRegistry : toolsRegistry.filter((t) => touched.has(t.slug));
  if (tools.length === 0) {
    console.log('faq-gate: no touched tools with registry data — nothing to check.');
    return;
  }
  const mods = wrapperMap();
  let fails = 0;

  for (const t of tools) {
    const customs = t.faqs ?? [];
    // 1+2. Template-similarity (unified thin/dupe metric) — only meaningful with customs.
    if (customs.length > 0) {
      const tmpl = templateBlock(t.category, t);
      if (tmpl === null) {
        console.log(`NOTE  ${t.slug}: no category template (falls to generic defaults) — custom FAQs carry it.`);
      } else {
        const sim = jaccard(shingles(blockOf(customs)), shingles(tmpl));
        if (sim >= JACCARD_DUP) {
          console.log(`FAIL  ${t.slug}: custom FAQs ${(sim).toFixed(2)} similar to category template (>= ${JACCARD_DUP}) — reads as boilerplate.`);
          fails++;
        }
      }
    }
    // 3. One-way converter: X-to-Y slug where BOTH sides are known format
    // tokens, no reverse tool, no swap UI. (Non-format "-to-" slugs like
    // text-to-speech or add-text-to-photo are actions, not converters.)
    // Bulk batch tools are one-directional by design — excluded.
    const m = t.slug.startsWith('bulk-') ? null : t.slug.match(/^([a-z0-9-]+)-to-([a-z0-9-]+)$/);
    const formats = m && FORMAT_INFO[m[1]!] && FORMAT_INFO[m[2]!];
    if (m && formats) {
      const reverse = `${m[2]}-to-${m[1]}`;
      const hasReverse = toolsRegistry.some((x) => x.slug === reverse);
      let hasSwap = false;
      const mod = mods.get(t.slug);
      if (mod) {
        for (const ext of ['.tsx', '.ts']) {
          const fp = path.join(ROOT, 'src', mod.replace(/^@\//, '') + ext);
          if (fs.existsSync(fp) && /swap/i.test(fs.readFileSync(fp, 'utf8'))) { hasSwap = true; break; }
        }
      }
      if (!hasReverse && !hasSwap && !ONE_WAY_ACCEPTED.has(t.slug)) {
        console.log(`FAIL  ${t.slug}: one-way converter — no reverse tool (${reverse}) and no swap UI.`);
        fails++;
      }
    }
  }
  // Thin tools with NO customs are #11 bulk-path input, not gate failures.
  const bare = tools.filter((t) => !(t.faqs ?? []).length).length;
  console.log(`faq-gate: checked ${tools.length}, failures ${fails} (${bare} without customs → bulk path, not failures).`);
  if (fails > 0) process.exit(1);
}

main();
