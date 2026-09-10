#!/usr/bin/env node
/**
 * Applies per-slug descriptions from scripts/descriptions-map.json to tool
 * entries in the registry file (optional argv[2] path override).
 *
 * Run: node scripts/update-descriptions.mjs [registry-path].
 * Reads: scripts/descriptions-map.json + target registry; writes target registry.
 */
// HISTORICAL one-off: applied descriptions-map.json to the old registry. Paths stale.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = process.argv[2] || path.resolve(__dirname, '../src/registry/tools.ts');
const mapPath = path.resolve(__dirname, 'descriptions-map.json');

const descriptions = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));

function esc(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function replaceDescription(block, newDesc) {
  const m = block.match(/^(\s*)description:\s*['"`]/m);
  if (!m) return block;

  const indent = m[1];
  const quoteStart = m.index + m[0].length - 1;
  const quote = block[quoteStart];

  // Find the closing quote, respecting escapes
  let closeIdx = -1;
  if (quote === '`') {
    closeIdx = block.indexOf('`', quoteStart + 1);
  } else {
    let i = quoteStart + 1;
    while (i < block.length) {
      if (block[i] === '\\') {
        i += 2;
      } else if (block[i] === quote) {
        closeIdx = i;
        break;
      } else {
        i++;
      }
    }
  }
  if (closeIdx === -1) return block;

  // Skip whitespace and optional comma after the closing quote
  let after = closeIdx + 1;
  while (after < block.length && (block[after] === ' ' || block[after] === '\t')) after++;
  if (after < block.length && block[after] === ',') after++;

  const replacement = `${indent}description: '${esc(newDesc)}',`;
  return block.slice(0, m.index) + replacement + block.slice(after);
}

const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');
const out = [];
let i = 0;

while (i < lines.length) {
  const line = lines[i];
  const isBlockStart = /^\s*\{\s*$/.test(line);

  if (!isBlockStart) {
    out.push(line);
    i++;
    continue;
  }

  // Collect the full block from { to matching }
  const blockLines = [line];
  let depth = 1;
  let j = i + 1;
  while (j < lines.length && depth > 0) {
    const bl = lines[j];
    blockLines.push(bl);
    for (const ch of bl) {
      if (ch === '{') depth++;
      if (ch === '}') depth--;
    }
    j++;
  }

  const blockText = blockLines.join('\n');

  // Only process blocks that look like tool entries (have name + slug)
  if (/name:\s*['"`]/.test(blockText) && /slug:\s*['"`]/.test(blockText)) {
    const slugMatch = blockText.match(/slug:\s*['"`]([^'"`]+)['"`]/);
    if (slugMatch) {
      const slug = slugMatch[1];
      const newDesc = descriptions[slug];
      if (newDesc) {
        const updated = replaceDescription(blockText, newDesc);
        if (updated !== blockText) {
          out.push(updated);
          i = j;
          continue;
        }
      }
    }
  }

  // No replacement — push original lines
  for (let k = i; k < j; k++) {
    out.push(lines[k]);
  }
  i = j;
}

fs.writeFileSync(filePath, out.join('\n'), 'utf-8');
console.log('Done \u2014 descriptions updated.');
