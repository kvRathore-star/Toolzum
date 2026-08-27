import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  output: "export",
  poweredByHeader: false,
  trailingSlash: true,
  async redirects() {
    return [
      {
        source: '/sign-in',
        destination: '/login',
        permanent: true,
      },
    ];
  },
};

const withBA = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBA(nextConfig);

// initOpenNextCloudflareForDev() skipped — macOS 12 doesn't support workerd runtime
