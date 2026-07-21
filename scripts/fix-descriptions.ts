/**
 * #5: Fix 509 tools with description identical to seoDescription content.
 * Uses line-level replacement to handle both ' and " quote styles.
 */

import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import { toolsRegistry } from '../src/registry/tools';
import { getShortDescription } from '../src/lib/generateToolDescription';

const CLEANUP_SUFFIX = ' No signup or account required.';

function computeNewDesc(tool: typeof toolsRegistry[0]): string {
  const stripped = tool.seoDescription!
    .replace(/^Free online .*? (—|\u2014) /, '').replace(/\. $/, '.').trim();
  const candidate = getShortDescription(tool);
  return candidate !== stripped ? candidate : tool.description + CLEANUP_SUFFIX;
}

const normalized = (s: string) =>
  s.replace(/^Free online .*? (—|\u2014) /, '').replace(/\. $/, '.').trim();

const flagged = toolsRegistry.filter(
  t => t.seoDescription && t.description === normalized(t.seoDescription)
);

console.log(`Total flagged: ${flagged.length}`);

// Build slug → new desc map
const slugMap = new Map<string, string>();
for (const tool of flagged) {
  slugMap.set(tool.slug, computeNewDesc(tool));
}

// Process each chunk file
const chunkGlob = globSync('src/registry/tools-chunk-*.ts');
const toolsIndexGlob = globSync('src/registry/tools-index.ts');
const toolsConstantsGlob = globSync('src/registry/tools-constants.ts');
const allFiles = [...chunkGlob, ...toolsIndexGlob, ...toolsConstantsGlob];

let totalReplaced = 0;
let totalFiles = 0;
const failures: string[] = [];

for (const file of allFiles) {
  const lines = readFileSync(file, 'utf-8').split('\n');
  const fileChanges: { lineIdx: number; newLine: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const slugMatch = lines[i].match(/(?:^\s*|\b)slug:\s*(['"])([^'"]+)\1/);
    if (!slugMatch) continue;
    const slug = slugMatch[2];
    if (!slugMap.has(slug)) continue;

    // Found a flagged tool — find the description line (search forward & backward, or same line)
    let descIdx = -1;
    let oldLine: string;

    // First check if description: is on the same line as slug (single-line entries)
    if (lines[i].includes('description:')) {
      descIdx = i;
      oldLine = lines[i];
    } else {
      // Scope search within the current entry: find entry-opening `{` before slug
      let entryStart = i;
      for (let k = i - 1; k >= Math.max(0, i - 20); k--) {
        if (/^\s*\{/.test(lines[k])) { entryStart = k; break; }
      }
      // Find entry-closing `}` after slug (may be own line or trailing on last property)
      let entryEnd = i;
      for (let k = i + 1; k < Math.min(lines.length, i + 20); k++) {
        if (/^\s*\}[\s,]*$/.test(lines[k]) || /\},?\s*$/.test(lines[k])) { entryEnd = k; break; }
      }
      // Search backward from slug within entry first (description before slug)
      for (let j = i - 1; j >= entryStart; j--) {
        if (lines[j].trim().startsWith('description:')) { descIdx = j; break; }
      }
      // If not found, search forward from slug within entry
      if (descIdx === -1) {
        for (let j = i + 1; j <= entryEnd; j++) {
          if (lines[j].trim().startsWith('description:')) { descIdx = j; break; }
        }
      }
      if (descIdx === -1) {
        failures.push(`${slug}: description line not found near line ${i + 1}`);
        continue;
      }
      oldLine = lines[descIdx];
    }

    const newDesc = slugMap.get(slug)!;

    // Handle single-line case (description on same line as slug)
    if (descIdx === i) {
      const inlineMatch = oldLine.match(/(description:\s*)(['"])([^'"]*)\2,\s*(seoDescription|parentSlug)/);
      if (inlineMatch) {
        const prefix = inlineMatch[1];
        const quote = inlineMatch[2];
        let useQuote = quote;
        let escaped = newDesc;
        if (escaped.includes(useQuote)) {
          useQuote = useQuote === "'" ? '"' : "'";
        }
        escaped = escaped.replace(new RegExp(useQuote === "'" ? /'/g : /"/g), '\\' + useQuote);
        const newLine = oldLine.replace(
          `${prefix}${quote}${inlineMatch[3]}${quote}, `,
          `${prefix}${useQuote}${escaped}${useQuote}, `
        );
        if (newLine !== oldLine) {
          fileChanges.push({ lineIdx: descIdx, newLine });
          continue;
        }
      }
      failures.push(`${slug}: could not parse single-line entry`);
      continue;
    }

    // Determine the quote style from the old line
    const quoteMatch = oldLine.match(/^(\s*description:\s*)(['"])(.*)$/);
    if (!quoteMatch) {
      failures.push(`${slug}: unexpected format "${oldLine.trim().slice(0, 80)}"`);
      continue;
    }

    const prefix = quoteMatch[1];
    const oldQuote = quoteMatch[2];
    let rest = quoteMatch[3];

    // Find where the value ends: look for `',` or `",` or just `'` or `"` at end
    let closeQuoteIdx = rest.lastIndexOf(oldQuote === "'" ? "'," : '",');
    if (closeQuoteIdx === -1) closeQuoteIdx = rest.lastIndexOf(oldQuote);
    if (closeQuoteIdx === -1) {
      failures.push(`${slug}: cannot find closing quote in "${rest.slice(0, 60)}"`);
      continue;
    }
    // Get trailing comma if present
    const trailing = rest.slice(closeQuoteIdx + 1) || ',';

    // If newDesc contains the same quote char, use the opposite one
    let useQuote = oldQuote;
    let escaped = newDesc;
    if (escaped.includes(useQuote)) {
      useQuote = useQuote === "'" ? '"' : "'";
    }
    escaped = escaped.replace(new RegExp(useQuote === "'" ? /'/g : /"/g), '\\' + useQuote);

    const newLine = `${prefix}${useQuote}${escaped}${useQuote}${trailing}`;
    if (newLine !== oldLine) {
      fileChanges.push({ lineIdx: descIdx, newLine });
    } else {
      failures.push(`${slug}: new line identical to old line`);
    }
  }

  if (fileChanges.length > 0) {
    for (const fc of fileChanges) {
      lines[fc.lineIdx] = fc.newLine;
    }
    writeFileSync(file, lines.join('\n'));
    totalReplaced += fileChanges.length;
    totalFiles++;
    console.log(`Updated ${file}: ${fileChanges.length} tools`);
  }
}

console.log(`\nDone. ${totalReplaced}/${slugMap.size} descriptions replaced across ${totalFiles} files.`);
if (failures.length > 0) {
  console.log(`\nFailures (${failures.length}):`);
  failures.slice(0, 10).forEach(f => console.log(`  ${f}`));
}
