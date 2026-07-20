import { SEO_PERMUTATIONS } from './tools-constants';

// Re-export constants so consumers import from one helpers file
export { SEO_PERMUTATIONS, TOOL_REDIRECTS, proSlugs } from './tools-constants';

export function getSeoParentSlug(slug: string): string | undefined {
  return SEO_PERMUTATIONS.find(p => p.slug === slug)?.parentSlug;
}
