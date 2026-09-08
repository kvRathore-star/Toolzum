// HISTORICAL one-off: located placeholder entries in the old registry.
const fs = require('fs');
const path = require('path');

const toolsFilePath = '/Users/kvsingh/99-ai-tools/src/registry/tools.ts';
const modulesDir = '/Users/kvsingh/99-ai-tools/src/components/tools/modules';

const content = fs.readFileSync(toolsFilePath, 'utf8');

// Use a more robust regex/parser to extract the registry objects
// We want to match all fields in each object
const objRegex = /\{[^}]+\}/g;
const matches = content.match(objRegex) || [];

const tools = [];
matches.forEach(block => {
  const idMatch = block.match(/id:\s*"([^"]+)"/);
  const nameMatch = block.match(/name:\s*"([^"]+)"/);
  const slugMatch = block.match(/slug:\s*"([^"]+)"/);
  const categoryMatch = block.match(/category:\s*"([^"]+)"/);
  const descriptionMatch = block.match(/description:\s*"([^"]+)"/);
  const dependenciesMatch = block.match(/dependencies:\s*"([^"]+)"/);

  if (idMatch && nameMatch && slugMatch && categoryMatch) {
    tools.push({
      id: idMatch[1],
      name: nameMatch[1],
      slug: slugMatch[1],
      category: categoryMatch[1],
      description: descriptionMatch ? descriptionMatch[1] : '',
      dependencies: dependenciesMatch ? dependenciesMatch[1] : ''
    });
  }
});

console.log(`Parsed ${tools.length} tools from registry.`);

const placeholders = [];
const implemented = [];

tools.forEach(t => {
  const componentName = t.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const componentPath = path.join(modulesDir, componentName + '.tsx');
  
  if (!fs.existsSync(componentPath)) {
    placeholders.push({ ...t, componentName, status: 'missing_file' });
    return;
  }
  
  const code = fs.readFileSync(componentPath, 'utf8');
  const isPlaceholder = code.includes('ComingSoonTool') || 
                        code.includes('// Basic placeholder logic') || 
                        code.includes('UI Ready:');
  
  if (isPlaceholder) {
    placeholders.push({ ...t, componentName, status: 'placeholder' });
  } else {
    implemented.push({ ...t, componentName });
  }
});

console.log(`\n--- SUMMARY ---`);
console.log(`Total: ${tools.length}`);
console.log(`Implemented: ${implemented.length}`);
console.log(`Placeholders: ${placeholders.length}`);

console.log(`\n--- PLACEHOLDERS LIST (grouped by category) ---`);
const grouped = {};
placeholders.forEach(p => {
  if (!grouped[p.category]) grouped[p.category] = [];
  grouped[p.category].push(p);
});

Object.keys(grouped).sort().forEach(cat => {
  console.log(`\nCategory: ${cat} (${grouped[cat].length} placeholders)`);
  grouped[cat].forEach(p => {
    console.log(`  - ${p.name} (${p.slug}) -> ${p.componentName}.tsx [${p.status}]`);
  });
});
