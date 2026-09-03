import { toolsRegistry } from './tools-index';
import { proSlugs, SEO_PERMUTATIONS, TOOL_REDIRECTS } from './tools-constants';
import { TOOL_RELATIONSHIPS } from './tool-relationships';
import { classifyDependencies } from '@/lib/cloudPatterns';
import type { ToolMetadata } from './tools-types';
import type { DependencyVerdict } from '@/lib/cloudPatterns';

export function classifyTool(tool: ToolMetadata): DependencyVerdict {
  return classifyDependencies(tool.dependencies);
}

export function getToolCounts() {
  // Exclude:
  // - seo-* : SEO permutation landing pages (generated URL variations, not real tools)
  // - Extension : browser extension entries (not browser-based tools)
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

// --- Minimal data extractors (avoids shipping full registry to client) ---

export interface PopularTool {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  isPro?: boolean;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export function getHomeClientData(): { popularTools: PopularTool[]; categoryCounts: CategoryCount[] } {
  const featuredSlugs = [
    'pdf-compressor', 'image-compressor', 'background-remover', 'qr-code-generator',
    'gst-calculator', 'word-counter', 'ai-image-generator', 'video-compressor',
    'text-to-speech-tts',
  ];

  const pick = (t: ToolMetadata): PopularTool => ({
    id: t.id, name: t.name, slug: t.slug, category: t.category,
    description: t.description, isPro: t.isPro,
  });

  const tools = featuredSlugs
    .map(slug => toolsRegistry.find(t => t.slug === slug))
    .filter(Boolean)
    .map(t => pick(t!));

  if (tools.length < 9) {
    const remaining = 9 - tools.length;
    const used = new Set(tools.map(t => t.slug));
    const extra = toolsRegistry
      .filter(t => !used.has(t.slug))
      .slice(0, remaining)
      .map(t => pick(t));
    tools.push(...extra);
  }

  const countMap = new Map<string, number>();
  for (const t of toolsRegistry) {
    if (t.showInCategory === false) continue;
    countMap.set(t.category, (countMap.get(t.category) || 0) + 1);
  }
  const categoryCounts = [...countMap.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return { popularTools: tools, categoryCounts };
}

export interface RelatedTool {
  name: string;
  slug: string;
  category: string;
  description: string;
}

export function getToolLayoutData(category: string, slug: string): {
  proToolCount: number;
  toolCount: number;
  relatedTools: RelatedTool[];
} {
  const tool = toolsRegistry.find(t => t.slug === slug && t.category.toLowerCase().replace(/\s+/g, '-') === category);
  const proToolCount = toolsRegistry.filter(t => t.isPro).length;
  const toolCount = toolsRegistry.length;

  let relatedTools: RelatedTool[] = [];
  if (tool) {
    const curated = TOOL_RELATIONSHIPS[slug];
    if (curated && curated.length > 0) {
      relatedTools = curated
        .map(s => toolsRegistry.find(t => t.slug === s))
        .filter((t): t is ToolMetadata => t != null)
        .slice(0, 6)
        .map(t => ({ name: t.name, slug: t.slug, category: t.category, description: t.description }));
    } else {
      relatedTools = toolsRegistry
        .filter(t => t.category === tool.category && t.slug !== slug)
        .slice(0, 6)
        .map(t => ({ name: t.name, slug: t.slug, category: t.category, description: t.description }));
    }
  }

  return { proToolCount, toolCount, relatedTools };
}