import type { MetadataRoute } from "next";

const MOVED_SLUGS: string[] = [];

const disallowPaths = [
  "/api/",
  "/dashboard/",
  ...MOVED_SLUGS.map(s => `/${s}`),
  ...MOVED_SLUGS.map(s => `/tools/${s}`),
];

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: disallowPaths,
    },
    sitemap: "https://gotoolhub.com/sitemap.xml",
  };
}
