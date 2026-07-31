import { toolsRegistry } from '../src/registry/tools';

async function verifyRegistry() {
  console.log("Starting rigorous diagnostic pass over 200 tools...");
  
  let errors = 0;
  const missingModules = 0;
  const categories = new Set();
  
  for (const tool of toolsRegistry) {
    if (!tool.name || tool.name.trim() === '') {
      console.error(`[ERROR] Tool missing name. ID: ${tool.id}`);
      errors++;
    }
    if (!tool.slug || tool.slug.trim() === '') {
      console.error(`[ERROR] Tool missing slug. Name: ${tool.name}`);
      errors++;
    }
    if (!tool.description || tool.description.trim() === '') {
      console.error(`[ERROR] Tool missing description. Name: ${tool.name}`);
      errors++;
    }
    if (!tool.category || tool.category.trim() === '') {
      console.error(`[ERROR] Tool missing category. Name: ${tool.name}`);
      errors++;
    } else {
      categories.add(tool.category);
    }
  }

  console.log("-----------------------------------------");
  console.log(`✅ Total Tools Analyzed: ${toolsRegistry.length}`);
  console.log(`✅ Categories Mapped: ${categories.size} (${Array.from(categories).slice(0, 3).join(', ')}...)`);
  
  if (errors > 0) {
    console.error(`❌ Diagnostics Failed: ${errors} errors found in the registry.`);
    process.exit(1);
  } else {
    console.log(`🚀 All ${toolsRegistry.length} tools successfully verified! Zero missing metadata attributes.`);
    process.exit(0);
  }
}

verifyRegistry().catch(e => {
  console.error("Runtime Exception:", e);
  process.exit(1);
});
