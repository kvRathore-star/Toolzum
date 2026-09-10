import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  output: "export",
  poweredByHeader: false,
  trailingSlash: true,
  async redirects() {
    return [];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/og/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, s-maxage=2592000',
          },
        ],
      },
    ];
  },
};

const withBA = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBA(nextConfig);

// B1.6 note: @ducanh2912/next-pwa was evaluated and REJECTED — it injects
// a webpack config, which hard-errors under this repo's Turbopack-default
// Next 16 build ("This build is using Turbopack, with a webpack config").
// Fresh-SW generation instead lives in scripts/gen-sw.js (workbox-build,
// post-build step): same Workbox engine and route set, no webpack involved.

// initOpenNextCloudflareForDev() skipped — macOS 12 doesn't support workerd runtime
