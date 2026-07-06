import type { MetadataRoute } from "next";

const MOVED_SLUGS = [
  "crop-pdf", "organize-pdf", "extract-pages-from-pdf",
  "lbs-to-kg", "kg-to-lbs", "feet-to-meters",
  "time-converter", "pst-to-est", "cst-to-est",
  "wav-compressor", "mp3-to-ogg",
  "gif-compressor", "image-to-gif",
];

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
