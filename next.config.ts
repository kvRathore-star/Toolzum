import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  output: "export",
  poweredByHeader: false,
};

const withBA = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBA(nextConfig);
