// Auto-generated barrel — do not edit directly
import type { ToolMetadata } from './tools-types';
import { SEO_PERMUTATIONS, proSlugs } from './tools-constants';
import { entries_chunk_0 } from './tools-chunk-0';
import { entries_chunk_1 } from './tools-chunk-1';
import { entries_chunk_2 } from './tools-chunk-2';
import { entries_chunk_3 } from './tools-chunk-3';
import { entries_chunk_4 } from './tools-chunk-4';
import { entries_chunk_5 } from './tools-chunk-5';

const rawToolsRegistry: ToolMetadata[] = [
  ...entries_chunk_0,
  ...entries_chunk_1,
  ...entries_chunk_2,
  ...entries_chunk_3,
  ...entries_chunk_4,
  ...entries_chunk_5,
];

// Add SEO landing pages to registry — MUST happen before toolsRegistry map
for (const p of SEO_PERMUTATIONS) {
  (rawToolsRegistry as ToolMetadata[]).push({
    id: `seo-${p.slug}`,
    name: p.name,
    slug: p.slug,
    category: p.category,
    description: p.description,
    seoDescription: p.seoDescription,
    dependencies: "Browser API (landing page)",
    showInCategory: false,
  });
}

export const toolsRegistry: ToolMetadata[] = rawToolsRegistry.map(tool => ({
  ...tool,
  isPro: proSlugs.includes(tool.slug)
}));

export const getToolBySlug = (slug: string) => toolsRegistry.find(t => t.slug === slug);
export const getToolsByCategory = (category: string) => toolsRegistry.filter(t => t.category === category && t.showInCategory !== false);
function catToSlug(cat: string): string {
  if (cat === "Growth & Marketing Metrics") return "growth-metrics";
  return cat.toLowerCase().replace(/\s+/g, '-');
}
export const getToolByCategoryAndSlug = (category: string, slug: string) => toolsRegistry.find(t => catToSlug(t.category) === category && t.slug === slug);
