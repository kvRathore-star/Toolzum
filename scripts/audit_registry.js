// HISTORICAL one-off: slug-coverage audit against the old registry layout. Superseded by quality-audit.
const fs = require('fs');
const path = require('path');

// Read tools registry
const toolsRegistryContent = fs.readFileSync(path.join(__dirname, '../src/registry/tools.ts'), 'utf8');
// Simple extraction of slugs
const slugRegex = /slug:\s*["']([^"']+)["']/g;
const registrySlugs = new Set();
let match;
while ((match = slugRegex.exec(toolsRegistryContent)) !== null) {
  registrySlugs.add(match[1]);
}

// Read DynamicModuleWrapper
const wrapperContent = fs.readFileSync(path.join(__dirname, '../src/components/tools/modules/DynamicModuleWrapper.tsx'), 'utf8');
const wrapperRegex = /'([^']+)':\s*dynamic/g;
const wrapperSlugs = new Set();
while ((match = wrapperRegex.exec(wrapperContent)) !== null) {
  wrapperSlugs.add(match[1]);
}

console.log('Total registry slugs:', registrySlugs.size);
console.log('Total wrapper slugs:', wrapperSlugs.size);

const inWrapperNotRegistry = [...wrapperSlugs].filter(s => !registrySlugs.has(s));
const inRegistryNotWrapper = [...registrySlugs].filter(s => !wrapperSlugs.has(s));

console.log('\nIn DynamicModuleWrapper but NOT in tools.ts registry:', inWrapperNotRegistry);
console.log('\nIn tools.ts registry but NOT in DynamicModuleWrapper:', inRegistryNotWrapper);
