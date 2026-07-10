import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/audio/bulk-flac-to-mp3", destination: "/audio/bulk-audio-converter", permanent: true },
      { source: "/audio/bulk-ogg-to-mp3", destination: "/audio/bulk-audio-converter", permanent: true },
      { source: "/audio/bulk-m4a-to-mp3", destination: "/audio/bulk-audio-converter", permanent: true },
      { source: "/video/bulk-mp4-to-mov", destination: "/video/bulk-video-compressor", permanent: true },
      { source: "/video/bulk-mov-to-mp4", destination: "/video/bulk-video-compressor", permanent: true },
      { source: "/video/bulk-avi-to-mp4", destination: "/video/bulk-video-compressor", permanent: true },
      { source: "/video/bulk-webm-to-mp4", destination: "/video/bulk-video-compressor", permanent: true },
      { source: "/pdf/bulk-pdf-to-word", destination: "/pdf/bulk-pdf-data-extractor", permanent: true },
      { source: "/pdf/bulk-pdf-to-excel", destination: "/pdf/bulk-pdf-data-extractor", permanent: true },
      { source: "/image/bulk-heic-to-webp", destination: "/image/bulk-webp-avif-modernizer", permanent: true },
      { source: "/image/bulk-heic-to-png", destination: "/image/bulk-heic-to-jpg", permanent: true },
      { source: "/pdf/bulk-image-to-pdf-v2", destination: "/pdf/bulk-image-to-pdf", permanent: true },
      { source: "/image/bulk-png-to-avif", destination: "/image/bulk-webp-avif-modernizer", permanent: true },
      { source: "/image/bulk-jpg-to-avif", destination: "/image/bulk-webp-avif-modernizer", permanent: true },
      { source: "/image/bulk-webp-to-jpg", destination: "/image/bulk-image-compressor", permanent: true },
      { source: "/image/bulk-add-watermark", destination: "/image/bulk-image-watermark", permanent: true },
      { source: "/audio/bulk-normalize-audio", destination: "/audio/bulk-audio-normalizer", permanent: true },
      { source: "/pdf/bulk-pdf-text-extractor", destination: "/pdf/bulk-pdf-data-extractor", permanent: true },
      { source: "/image/bulk-svg-to-png-converter", destination: "/image/bulk-svg-to-png", permanent: true },
      { source: "/ai/ai-writing-assistant", destination: "/tools", permanent: true },
      { source: "/ai/text-summarizer", destination: "/tools", permanent: true },
      { source: "/ai/ai-content-humanizer", destination: "/tools", permanent: true },
      { source: "/ai/ai-code-generator", destination: "/tools", permanent: true },
      { source: "/ai/ai-essay-writer", destination: "/tools", permanent: true },
      { source: "/ai/ai-blog-title-generator", destination: "/tools", permanent: true },
      { source: "/ai/ai-hashtag-generator", destination: "/tools", permanent: true },
      { source: "/ai/ai-changelog-generator", destination: "/tools", permanent: true },
      { source: "/ai/ai-excel-formula-generator", destination: "/tools", permanent: true },
      { source: "/ai/ai-product-description-generator", destination: "/tools", permanent: true },
      { source: "/ai/ai-presentation-generator", destination: "/tools", permanent: true },
      { source: "/ai/ai-flowchart-maker", destination: "/tools", permanent: true },
      { source: "/ai/ai-code-explainer", destination: "/tools", permanent: true },
      { source: "/ai/ai-sql-generator", destination: "/tools", permanent: true },
      { source: "/ai/ai-recipe-generator", destination: "/tools", permanent: true },
      { source: "/ai/ai-domain-name-generator", destination: "/tools", permanent: true },
      { source: "/ai/ai-mind-map-generator", destination: "/tools", permanent: true },
      { source: "/ai/ai-regex-generator", destination: "/tools", permanent: true },
      { source: "/ai/ai-business-idea-generator", destination: "/tools", permanent: true },
      { source: "/ai/ai-slogan-generator", destination: "/tools", permanent: true },
      { source: "/ai/ai-poem-generator", destination: "/tools", permanent: true },
      { source: "/ai/ai-placeholder-content-generator", destination: "/tools", permanent: true },
      { source: "/ai/ai-complaint-letter-generator", destination: "/tools", permanent: true },
      { source: "/ai/ai-resume-tailor", destination: "/tools", permanent: true },
      { source: "/ai/ai-legal-agreement-generator", destination: "/tools", permanent: true },
      { source: "/ai/ai-voice-cloning", destination: "/tools", permanent: true },
      { source: "/ai/ai-audio-enhancer", destination: "/tools", permanent: true },
      { source: "/ai/ai-video-summarizer", destination: "/tools", permanent: true },
      { source: "/ai/ai-avatar-generator", destination: "/tools", permanent: true },
      { source: "/ai/ai-music-generator", destination: "/tools", permanent: true },
      { source: "/developer/brand-name-generator", destination: "/tools", permanent: true },
      { source: "/developer/brand-color-palette-generator", destination: "/tools", permanent: true },
      { source: "/extension/grammar-checker-extension", destination: "/tools", permanent: true },
      { source: "/developer/brand-kit", destination: "/tools", permanent: true },
      { source: "/productivity/to-do-list", destination: "/tools/pomodoro-timer", permanent: true },
      { source: "/text/plagiarism-checker", destination: "/tools", permanent: true },
      { source: "/api", destination: "/pricing", permanent: true },
      { source: "/converter/pst-to-est", destination: "/utility/ist-time-converter", permanent: true },
      { source: "/converter/cst-to-est", destination: "/utility/ist-time-converter", permanent: true },
      { source: "/converter/lbs-to-kg", destination: "/utility/unit-converter", permanent: true },
      { source: "/converter/kg-to-lbs", destination: "/utility/unit-converter", permanent: true },
      { source: "/converter/feet-to-meters", destination: "/utility/unit-converter", permanent: true },
      { source: "/pdf/crop-pdf", destination: "/pdf/pdf-page-manager", permanent: true },
      { source: "/pdf/organize-pdf", destination: "/pdf/pdf-page-manager", permanent: true },
      { source: "/pdf/extract-pages-from-pdf", destination: "/pdf/pdf-page-manager", permanent: true },
      { source: "/pdf/flatten-pdf", destination: "/pdf/pdf-page-manager", permanent: true },
      { source: "/video/mp4-to-gif", destination: "/video/video-to-gif", permanent: true },
      { source: "/video/webm-to-gif", destination: "/video/video-to-gif", permanent: true },
      { source: "/video/mov-to-gif", destination: "/video/video-to-gif", permanent: true },
      { source: "/video/image-to-gif", destination: "/video/video-to-gif", permanent: true },
      { source: "/video/gif-compressor", destination: "/video/video-compressor", permanent: true },
      { source: "/audio/mp3-to-ogg", destination: "/audio/audio-converter", permanent: true },
      { source: "/audio/wav-compressor", destination: "/audio/audio-converter", permanent: true },
      { source: "/productivity/stopwatch", destination: "/productivity/pomodoro-timer", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public,max-age=31536000,immutable" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://www.googletagmanager.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://generativelanguage.googleapis.com https://api.groq.com https://api.openai.com https://api.digitalocean.com",
              "worker-src 'self' blob:",
              "media-src 'self' blob:",
            ].join("; "),
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

// initOpenNextCloudflareForDev() skipped — macOS 12 doesn't support workerd runtime
