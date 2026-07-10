import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import withBundleAnalyzer from "@next/bundle-analyzer";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  }
});

const nextConfig: NextConfig = {
  output: "export",
  poweredByHeader: false,
  // L3: Service worker with static export — @ducanh2912/next-pwa generates SW at
  // public/sw.js, but `output: "export"` disables all server routes (incl SW
  // registration endpoint). If SW doesn't register in production, consider
  // removing `output: "export"` and deploying on Node/Vercel, or registering
  // the SW manually from a custom `public/sw.js`.
};

const withBA = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBA(withPWA(nextConfig));
