const fs = require('fs');
const { CONTENT } = require('./fix_image_data.js');

const chunks = [0, 1, 2, 3, 5];
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

    // Remove the closing } from the block, keep the trailing whitespace/indentation
    const blockBody = toolBlock.slice(0, -1);
    // Find the closing indentation (whitespace after last newline)
    const lastNewline = blockBody.lastIndexOf('\n');
    const closeIndent = lastNewline >= 0 ? blockBody.substring(lastNewline) : '';
    // Remove trailing comma if present (usually not on the same line as the indentation)
    let cleanBody = blockBody;
    if (lastNewline >= 0) {
      const beforeLastLine = blockBody.substring(0, lastNewline);
      const lastLine = blockBody.substring(lastNewline); // includes \n and whitespace
      // Trim trailing comma and whitespace from the property before last line
      const trimmed = beforeLastLine.trimEnd();
      cleanBody = trimmed.endsWith(',') ? trimmed.slice(0, -1) : trimmed;
    }

    const indent = '    ';
    const instrJson = JSON.stringify(data.instructions, null, 6)
      .split('\n').map((l, i) => i === 0 ? l : indent + l).join('\n');
    const faqsJson = JSON.stringify(data.faqs, null, 6)
      .split('\n').map((l, i) => i === 0 ? l : indent + l).join('\n');

    const beforeTool = src.substring(0, toolStart);
    const afterTool = src.substring(toolEnd);

    const insertion = `,\n${indent}instructions: ${instrJson},\n${indent}faqs: ${faqsJson}${closeIndent}`;
    src = beforeTool + cleanBody + insertion + '}' + afterTool;
    modified++;
  }

  if (src !== orig) fs.writeFileSync(file, src);
}

console.log(`Modified: ${modified} Image tools`);
console.log(`Skipped (not found or already had instructions): ${skipped} tools`);
