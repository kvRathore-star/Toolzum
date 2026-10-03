#!/usr/bin/env node
/**
 * pdf-find.mjs — text-search helper for the manual PDF-editor checklist.
 *
 *   node scripts/pdf-find.mjs <file.pdf> <needle> [more needles...]
 *
 * Prints per-page match counts for each needle, then a total.
 * Exit code: 0 = every needle found on at least one page, 1 = some needle
 * absent. Serves as the pdftotext equivalent on machines without poppler:
 *   pdftotext out.pdf - | grep SECRET   ← same question, one command
 *
 * Notes:
 * - Image-only PDFs (scans) yield 0 text matches BY DESIGN — check those
 *   visually instead.
 * - Devanagari/Tamil matras reorder visually vs logically; counting is
 *   multiset-safe (whitespace stripped) so either order matches.
 */
import fs from 'node:fs';
import path from 'node:path';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const [, , file, ...needles] = process.argv;
if (!file || needles.length === 0) {
  console.error('usage: node scripts/pdf-find.mjs <file.pdf> <needle> [more needles...]');
  process.exit(2);
}

const bytes = new Uint8Array(fs.readFileSync(path.resolve(file)));
const doc = await pdfjsLib.getDocument({ data: bytes }).promise;

const norm = (s) => s.replace(/\s/g, '');
const pageTexts = [];
for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  const tc = await page.getTextContent();
  pageTexts.push(tc.items.map((it) => ('str' in it ? it.str : '')).join(''));
}

console.log(`${path.basename(file)}: ${doc.numPages} page(s)`);
let allFound = true;
for (const needle of needles) {
  const target = norm(needle);
  const counts = pageTexts.map((t) => {
    let n = 0;
    let idx = 0;
    const hay = norm(t);
    while ((idx = hay.indexOf(target, idx)) !== -1) {
      n++;
      idx += target.length;
    }
    return n;
  });
  const total = counts.reduce((a, b) => a + b, 0);
  if (total === 0) allFound = false;
  console.log(
    `  "${needle}": ${total} total — per page: ${counts
      .map((c, i) => `p${i + 1}=${c}`)
      .join(', ')}`,
  );
}
process.exit(allFound ? 0 : 1);
