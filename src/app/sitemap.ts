import type { MetadataRoute } from 'next';
import { toolsRegistry, TOOL_REDIRECTS, SEO_PERMUTATIONS } from '@/registry/tools';

export const dynamic = 'force-static';

const baseUrl = 'https://toolzum.com';
// lastmod = build time (this route is force-static, so it regenerates every
// build). Every URL said 2025-01-01 for ~9 months — an obviously stale
// lastmod that search engines discount, and tool pages had no <lastmod> at
// all. A uniform build date is at worst neutral and honest about when the
// sitemap was produced; per-page git dates would be better but the registry
// carries no per-tool change date.
const BUILD_DATE = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: BUILD_DATE, changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${baseUrl}/tools`, lastModified: BUILD_DATE, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/about`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/blog`, lastModified: BUILD_DATE, changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${baseUrl}/changelog`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${baseUrl}/extension`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${baseUrl}/careers`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/product`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/roadmap`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/status`, lastModified: BUILD_DATE, changeFrequency: 'weekly' as const, priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.2 },
    { url: `${baseUrl}/privacy-policy`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.2 },
    { url: `${baseUrl}/cookies`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.2 },
    { url: `${baseUrl}/security`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.2 },
    { url: `${baseUrl}/faq`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/billing`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.2 },
    { url: `${baseUrl}/premium-tools`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/login`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/sign-in`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/sign-up`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/forgot-password`, lastModified: BUILD_DATE, changeFrequency: 'monthly' as const, priority: 0.3 },
  ];

  function catSlug(cat: string): string {
    return cat === "Growth & Marketing" ? "growth-metrics" : cat.toLowerCase().replace(/\s+/g, '-');
  }

  const categories = [...new Set(toolsRegistry.map(t => t.category ? catSlug(t.category) : undefined).filter(Boolean))];

  const categoryPages = categories.map(cat => ({
    url: `${baseUrl}/${cat}/`,
    lastModified: BUILD_DATE,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Sitemaps must list only canonical 200-pages. Two registry populations
  // 301 by design and must be excluded, or Google burns crawl budget on
  // redirects (GSC showed 450 redirect + dozens of 404 exclusions from this):
  // - stub slugs redirected to a DIFFERENT tool (bg-changer -> ai-bg-changer).
  //   Same-slug canonical-category redirects are kept (their canonical URL 200s).
  // - SEO_PERMUTATIONS landing slugs (page.tsx 301s each to its parent hub).
  const seoSlugs = new Set(SEO_PERMUTATIONS.map((p) => p.slug));
  const toolPages = toolsRegistry
    .filter((tool) => {
      const redirect = TOOL_REDIRECTS[tool.slug];
      if (redirect && redirect.slug !== tool.slug) return false;
      if (seoSlugs.has(tool.slug)) return false;
      return true;
    })
    .map((tool) => ({
      url: `${baseUrl}/${tool.category ? catSlug(tool.category) : 'tools'}/${tool.slug}/`,
      lastModified: BUILD_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  return [...staticPages, ...categoryPages, ...toolPages];
}
