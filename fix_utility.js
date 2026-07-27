const fs = require('fs');
const { CONTENT } = require('./fix_utility_data.js');

const chunks = [0, 2, 3, 4, 5];
let modified = 0;
let skipped = 0;

for (const ci of chunks) {
  const file = `src/registry/tools-chunk-${ci}.ts`;
  let src = fs.readFileSync(file, 'utf8');
  const orig = src;

  for (const [slug, data] of Object.entries(CONTENT)) {
    const slugIdx = src.indexOf(`slug: "${slug}"`);
    if (slugIdx === -1) { skipped++; continue; }

    const beforeSlug = src.substring(0, slugIdx);
    const toolStart = beforeSlug.lastIndexOf('{');

    let depth = 0, toolEnd = toolStart;
    for (let i = toolStart; i < src.length; i++) {
      if (src[i] === '{') depth++;
      else if (src[i] === '}') { depth--; if (depth === 0) { toolEnd = i + 1; break; } }
    }

    const toolBlock = src.substring(toolStart, toolEnd);
    if (toolBlock.includes('instructions:')) { skipped++; continue; }

    // Body is everything between { and }
    // Strip trailing whitespace and optional trailing comma
    let body = toolBlock.slice(1, -1).trimEnd();
    if (body.endsWith(',')) body = body.slice(0, -1);

    const indent = '    ';
    const instrJson = JSON.stringify(data.instructions, null, 6)
      .split('\n').map((l, i) => i === 0 ? l : indent + l).join('\n');
    const faqsJson = JSON.stringify(data.faqs, null, 6)
      .split('\n').map((l, i) => i === 0 ? l : indent + l).join('\n');

    const beforeTool = src.substring(0, toolStart);
    const afterTool = src.substring(toolEnd);

    const newBlock = `{\n${body},\n${indent}instructions: ${instrJson},\n${indent}faqs: ${faqsJson}\n}`;
    src = beforeTool + newBlock + afterTool;
    modified++;
  }

  if (src !== orig) fs.writeFileSync(file, src);
}

console.log(`Modified: ${modified} Utility tools`);
console.log(`Skipped: ${skipped}`);
