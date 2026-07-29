import type { MetadataRoute } from 'next';
import { toolsRegistry, TOOL_REDIRECTS } from '@/registry/tools';

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

  const toolPages = toolsRegistry.map(tool => ({
    url: `${baseUrl}/${tool.category ? catSlug(tool.category) : 'tools'}/${tool.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const redirectPages = Object.entries(TOOL_REDIRECTS).map(([slug, target]) => ({
    url: `${baseUrl}/${target.category}/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.3,
  }));

  return [...staticPages, ...categoryPages, ...toolPages, ...redirectPages];
}
