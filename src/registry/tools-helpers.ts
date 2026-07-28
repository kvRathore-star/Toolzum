import { toolsRegistry } from './tools-index';
import { proSlugs, SEO_PERMUTATIONS, TOOL_REDIRECTS } from './tools-constants';
import { classifyDependencies } from '@/lib/cloudPatterns';
import type { ToolMetadata } from './tools-types';
import type { DependencyVerdict } from '@/lib/cloudPatterns';

export function classifyTool(tool: ToolMetadata): DependencyVerdict {
  return classifyDependencies(tool.dependencies);
}

export function getToolCounts() {
  const implementedTools = toolsRegistry.filter(t => !t.id?.startsWith('seo-') && t.category !== 'Extension');
  
  const visibleFree = implementedTools.filter(t => 
    t.showInCategory !== false && !proSlugs.includes(t.slug)
  ).length;

  const hiddenDuplicates = implementedTools.filter(t => 
    t.showInCategory === false && !proSlugs.includes(t.slug)
  ).length;

  const proTools = implementedTools.filter(t => 
    proSlugs.includes(t.slug)
  ).length;

  const seoVariants = SEO_PERMUTATIONS.length;
  
  const totalImplemented = implementedTools.length;
  const totalIndexed = toolsRegistry.length;
  const localTools = implementedTools.filter(t => {
    return classifyDependencies(t.dependencies) === "local";
  }).length;
  const cloudTools = implementedTools.filter(t => {
    return classifyDependencies(t.dependencies) === "cloud";
  }).length;
  const hybridTools = implementedTools.filter(t => {
    return classifyDependencies(t.dependencies) === "hybrid";
  }).length;
  const unverifiedTools = implementedTools.filter(t => {
    return classifyDependencies(t.dependencies) === "unverified";
  }).length;

  return {
    visibleFree,
    hiddenDuplicates,
    proTools,
    seoVariants,
    totalImplemented,
    totalIndexed,
    localTools,
    cloudTools,
    hybridTools,
    unverifiedTools,
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