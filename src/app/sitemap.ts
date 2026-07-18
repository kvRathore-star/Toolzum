import type { MetadataRoute } from "next";
import { toolsRegistry } from "@/registry/tools";

const BASE = "https://toolzum.com";

const staticPages = [
  "", "about", "ai-hub", "blog", "careers", "changelog", "contact",
  "cookies", "dashboard", "extension", "faq", "login", "premium-tools",
  "pricing", "privacy-policy", "product", "roadmap", "security",
  "sign-in", "status", "terms", "tools",
];

const categoryMap = new Map<string, string>();
for (const tool of toolsRegistry) {
  const catSlug = tool.category.toLowerCase().replace(/\s+/g, "-");
  if (!categoryMap.has(catSlug)) {
    categoryMap.set(catSlug, tool.category);
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    entries.push({
      url: `${BASE}/${page}`,
      lastModified: new Date(),
      changeFrequency: page === "" ? "daily" : "weekly",
      priority: page === "" ? 1.0 : 0.8,
    });
  }

  for (const [catSlug] of categoryMap) {
    entries.push({
      url: `${BASE}/${catSlug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  for (const tool of toolsRegistry) {
    const catSlug = tool.category.toLowerCase().replace(/\s+/g, "-");
    entries.push({
      url: `${BASE}/${catSlug}/${tool.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return entries;
}
