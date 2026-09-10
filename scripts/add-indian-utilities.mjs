/**
 * Appends four indian-utilities entries (ids 201-204) plus a
 * getToolByCategoryAndSlug helper to the tool registry.
 *
 * Run: node scripts/add-indian-utilities.mjs (historical one-off, do not re-run).
 * Reads/writes: /Users/kvsingh/99-ai-tools/src/registry/tools.ts (hardcoded absolute path).
 */
// HISTORICAL one-off: appended indian-utilities entries to the old registry. Do not re-run (paths stale).
import fs from 'fs';
import path from 'path';

const registryPath = '/Users/kvsingh/99-ai-tools/src/registry/tools.ts';
let content = fs.readFileSync(registryPath, 'utf8');

const newTools = `  ,{
    id: "201",
    name: "Passport Photo Maker (India)",
    slug: "passport-photo-india",
    category: "indian-utilities",
    description: "3.5x4.5 cm cropper for Indian passport photos",
    dependencies: "Canvas API / react-cropper"
  },
  {
    id: "202",
    name: "Aadhaar Wallet Cropper",
    slug: "aadhaar-wallet-cropper",
    category: "indian-utilities",
    description: "Client-side wallet sizing and masking helper",
    dependencies: "Canvas API"
  },
  {
    id: "203",
    name: "PAN Card Resizer",
    slug: "pan-card-resizer",
    category: "indian-utilities",
    description: "NSDL photo/signature formatting",
    dependencies: "Canvas API"
  },
  {
    id: "204",
    name: "KB Image Compressor",
    slug: "kb-image-compressor",
    category: "indian-utilities",
    description: "Strict 20KB/50KB/100KB target compression",
    dependencies: "browser-image-compression"
  }
`;

content = content.replace(/\n\];/, newTools + '\n];');

// Add getToolByCategoryAndSlug
if (!content.includes('getToolByCategoryAndSlug')) {
  content += `\nexport const getToolByCategoryAndSlug = (category: string, slug: string) => toolsRegistry.find(t => t.category.toLowerCase().replace(/\\s+/g, '-') === category && t.slug === slug);\n`;
}

fs.writeFileSync(registryPath, content);
console.log("Updated tools.ts with indian-utilities and getToolByCategoryAndSlug.");
