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
    rules: [
      {
        userAgent: "GPTBot",
        allow: "/",
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "CCBot",
        allow: "/",
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },
      {
        userAgent: "Amazonbot",
        allow: "/",
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: disallowPaths,
      },
    ],
    sitemap: "https://gotoolhub.com/sitemap.xml",
  };
}
