import { toolsRegistry } from './tools-index';
import { proSlugs, SEO_PERMUTATIONS, TOOL_REDIRECTS } from './tools-constants';

// Automatic tool counts - no hardcoded numbers
export function getToolCounts() {
  const implementedTools = toolsRegistry.filter(t => !t.id?.startsWith('seo-'));
  
  const visibleFree = implementedTools.filter(t => 
    t.showInCategory !== false && !proSlugs.includes(t.slug)
  ).length;

  const hiddenDuplicates = implementedTools.filter(t => 
    t.showInCategory === false
  ).length;

  const proTools = implementedTools.filter(t => 
    proSlugs.includes(t.slug)
  ).length;

  const seoVariants = SEO_PERMUTATIONS.length;
  
  const totalImplemented = visibleFree + hiddenDuplicates + proTools;
  const totalIndexed = toolsRegistry.length;

  return {
    visibleFree,
    hiddenDuplicates,
    proTools,
    seoVariants,
    totalImplemented,
    totalIndexed,
    // Free tier = visible free + hidden duplicates (both free)
    freeTierTotal: visibleFree + hiddenDuplicates,
  };
}

// Memoized counts for build-time use
let cachedCounts: ReturnType<typeof getToolCounts> | null = null;
export function getCachedToolCounts() {
  if (!cachedCounts) cachedCounts = getToolCounts();
  return cachedCounts;
}

// Re-export constants so consumers import from one helpers file
export { SEO_PERMUTATIONS, TOOL_REDIRECTS, proSlugs } from './tools-constants';

export function getSeoParentSlug(slug: string): string | undefined {
  return SEO_PERMUTATIONS.find(p => p.slug === slug)?.parentSlug;
}