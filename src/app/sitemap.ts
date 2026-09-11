import type { MetadataRoute } from 'next';
import { toolsRegistry, TOOL_REDIRECTS, SEO_PERMUTATIONS } from '@/registry/tools';

export const dynamic = 'force-static';

const baseUrl = 'https://toolzum.com';
const LAUNCH_DATE = new Date('2025-01-01');

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: LAUNCH_DATE, changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${baseUrl}/tools`, lastModified: LAUNCH_DATE, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified: LAUNCH_DATE, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: LAUNCH_DATE, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/about`, lastModified: LAUNCH_DATE, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/blog`, lastModified: LAUNCH_DATE, changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${baseUrl}/changelog`, lastModified: LAUNCH_DATE, changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${baseUrl}/extension`, lastModified: LAUNCH_DATE, changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${baseUrl}/careers`, lastModified: LAUNCH_DATE, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/product`, lastModified: LAUNCH_DATE, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/roadmap`, lastModified: LAUNCH_DATE, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/status`, lastModified: LAUNCH_DATE, changeFrequency: 'weekly' as const, priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: LAUNCH_DATE, changeFrequency: 'monthly' as const, priority: 0.2 },
    { url: `${baseUrl}/privacy-policy`, lastModified: LAUNCH_DATE, changeFrequency: 'monthly' as const, priority: 0.2 },
    { url: `${baseUrl}/cookies`, lastModified: LAUNCH_DATE, changeFrequency: 'monthly' as const, priority: 0.2 },
    { url: `${baseUrl}/security`, lastModified: LAUNCH_DATE, changeFrequency: 'monthly' as const, priority: 0.2 },
    { url: `${baseUrl}/faq`, lastModified: LAUNCH_DATE, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/billing`, lastModified: LAUNCH_DATE, changeFrequency: 'monthly' as const, priority: 0.2 },
    { url: `${baseUrl}/premium-tools`, lastModified: LAUNCH_DATE, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${baseUrl}/login`, lastModified: LAUNCH_DATE, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/sign-in`, lastModified: LAUNCH_DATE, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/sign-up`, lastModified: LAUNCH_DATE, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/forgot-password`, lastModified: LAUNCH_DATE, changeFrequency: 'monthly' as const, priority: 0.3 },
  ];

  function catSlug(cat: string): string {
    return cat === "Growth & Marketing" ? "growth-metrics" : cat.toLowerCase().replace(/\s+/g, '-');
  }

  const categories = [...new Set(toolsRegistry.map(t => t.category ? catSlug(t.category) : undefined).filter(Boolean))];

  const categoryPages = categories.map(cat => ({
    url: `${baseUrl}/${cat}`,
    lastModified: LAUNCH_DATE,
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
      url: `${baseUrl}/${tool.category ? catSlug(tool.category) : 'tools'}/${tool.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

  return [...staticPages, ...categoryPages, ...toolPages];
}
