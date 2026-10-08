/**
 * Category-wise content scoreboard — every dimension, every indexable tool.
 * Dimensions: FAQ presence+depth, how-to custom, seoTitle shape, meta band,
 * description quality, OG existence. Run: npx tsx scripts/content-scoreboard.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { toolsRegistry } from '../src/registry/tools';

const ROOT = process.cwd();
const OG_ROOT = path.join(ROOT, 'public', 'og');

function catSlug(cat: string): string {
  if (cat === 'Growth & Marketing') return 'growth-metrics';
  return cat.toLowerCase().replace(/\s+/g, '-');
}

const RETIRED = [
  'free quota', '3/day', '5/day', 'fair daily limits', '3 a day anonymous',
  'up to 10 files', '1 file at a time', 'Max 20MB', 'up to 20MB',
  '30MB guest', '150MB free sign-in',
];
const GENERIC_HOWTO = [
  'Enter the value', 'Run the lookup', 'Confirm officially',
  'Verify the returned details', 'Type or paste the number, code, or address',
];

interface Row { slug: string; fails: string[]; }

const byCat = new Map<string, Row[]>();
let total = 0;

for (const t of toolsRegistry as unknown as Record<string, unknown>[]) {
  const slug = t.slug as string;
  const category = t.category as string;
  // Skip redirect/stub populations (not indexable).
  if ((t as { showInCategory?: boolean }).showInCategory === false) continue;
  total++;
  const fails: string[] = [];
  const faqs = (t.faqs || []) as { question: string; answer: string }[];
  const instructions = (t.instructions || []) as { title: string; desc: string }[];
  const desc = (t.description || '') as string;
  const meta = (t.seoDescription || '') as string;
  const title = (t.seoTitle || '') as string;

  if (faqs.length === 0) fails.push('no-faq');
  else {
    if (faqs.length < 4) fails.push('thin-faq');
    const block = faqs.map((f) => f.question + ' ' + f.answer).join(' ');
    if (!/\d/.test(block)) fails.push('faq-no-numbers');
  }
  if (instructions.length === 0) fails.push('no-howto');
  else if (GENERIC_HOWTO.some((g) => instructions.some((i) => (i.title + ' ' + i.desc).includes(g)))) {
    fails.push('generic-howto');
  }
  if (!title) fails.push('no-title');
  else {
    if (title.length > 60) fails.push('title-long');
    if (!/free/i.test(title)) fails.push('title-no-free');
  }
  if (!meta) fails.push('no-meta');
  else {
    if (meta.length < 100) fails.push('meta-thin');
    if (meta.length > 170) fails.push('meta-long');
    if (meta.trim() === desc.trim()) fails.push('meta-eq-desc');
  }
  if (desc.length < 80) fails.push('desc-thin');
  for (const s of RETIRED) {
    if (desc.includes(s) || meta.includes(s) || faqs.some((f) => (f.question + f.answer).includes(s))) {
      fails.push('retired-copy');
      break;
    }
  }
  const og = path.join(OG_ROOT, catSlug(category), `${slug}.webp`);
  const ogPng = path.join(OG_ROOT, catSlug(category), `${slug}.png`);
  if (!fs.existsSync(og) && !fs.existsSync(ogPng)) fails.push('no-og');

  if (!byCat.has(category)) byCat.set(category, []);
  byCat.get(category)!.push({ slug, fails });
}

console.log('TOOLS=' + total);
const score: [string, number, number, Record<string, number>][] = [];
for (const [cat, rows] of byCat) {
  const withFails = rows.filter((r) => r.fails.length > 0);
  const kinds: Record<string, number> = {};
  for (const r of rows) for (const f of r.fails) kinds[f] = (kinds[f] || 0) + 1;
  const pct = Math.round((100 * (rows.length - withFails.length)) / rows.length);
  score.push([cat, pct, rows.length, kinds]);
}
score.sort((a, b) => a[1] - b[1]);
for (const [cat, pct, n, kinds] of score) {
  console.log(`${pct}% ${cat} (${n}): ` + Object.entries(kinds).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}=${v}`).join(' '));
}
