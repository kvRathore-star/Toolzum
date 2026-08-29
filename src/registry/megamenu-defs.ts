import type { ToolMetadata } from "./tools-types";
import type { MegamenuColumn } from "./site-data.generated";

export interface MegamenuColumnDef {
  title: string;
  icon: string;
  category: string;
  allHref: string;
  slugs: string[];
}

// Curated megamenu definition (title/icon/category/allHref/featured slugs).
// Live lookup of names + fillers + allCount happens against the registry at
// generation time (see scripts/generate-site-data.ts); the Header only consumes
// the precomputed result in site-data.generated.ts.
export const MENU_COLUMN_DEFS: MegamenuColumnDef[] = [
  { title: "Image", icon: "image", category: "Image", allHref: "/image", slugs: ["image-compressor", "image-resizer", "background-remover", "crop-image", "image-enhancer", "batch-image-editor", "png-to-jpg", "gemini-watermark-remover", "bulk-avif-optimizer", "bulk-heic-converter", "bulk-image-upscaler"] },
  { title: "PDF", icon: "pdf", category: "PDF", allHref: "/pdf", slugs: ["pdf-compressor", "pdf-merger", "pdf-splitter", "pdf-to-word", "pdf-to-excel", "word-to-pdf", "jpg-to-pdf"] },
  { title: "Video", icon: "video", category: "Video", allHref: "/video", slugs: ["video-compressor", "video-to-gif", "video-to-mp3", "crop-video", "subtitle-translator", "video-trimmer"] },
  { title: "Audio", icon: "audio", category: "Audio", allHref: "/audio", slugs: ["text-to-speech-tts", "audio-cutter", "speech-to-text", "audio-converter", "apple-music-preview-extractor", "bulk-audio-converter"] },
  { title: "AI", icon: "ai", category: "AI", allHref: "/ai", slugs: ["ai-image-generator", "ai-paraphrasing-tool", "ai-translator", "ai-image-upscaler", "ai-face-swap", "ai-cover-letter-generator", "ai-thumbnail-maker"] },
  { title: "Developer", icon: "developer", category: "Developer", allHref: "/developer", slugs: ["json-formatter", "sql-formatter", "css-minifier", "diff-checker", "base64-encode-decode", "regex-tester", "js-minifier"] },
  { title: "Text", icon: "text", category: "Text", allHref: "/text", slugs: ["character-counter", "word-counter", "fancy-text-generator", "font-generator", "cursive-text-generator", "text-to-handwriting", "case-converter"] },
  { title: "Finance", icon: "finance", category: "Finance", allHref: "/finance", slugs: ["currency-converter", "emi-calculator", "sip-calculator", "compound-interest-calculator", "invoice-generator", "profit-margin-calculator"] },
  { title: "Utility", icon: "utility", category: "Utility", allHref: "/utility", slugs: ["qr-code-generator", "password-generator", "wheel-of-names", "random-number-generator", "resume-builder", "dice-roller", "unit-converter"] },
  { title: "Converter", icon: "converter", category: "Converter", allHref: "/converter", slugs: ["mkv-to-mp4", "mp3-to-wav", "png-to-jpg", "json-to-csv", "markdown-tools"] },
  { title: "Privacy", icon: "privacy", category: "Privacy", allHref: "/tools", slugs: ["temporary-email-generator", "password-strength-checker", "exif-data-remover", "secure-note-sharer", "pgp-key-generator", "ip-anonymizer"] },
  { title: "SEO", icon: "seo", category: "SEO", allHref: "/seo", slugs: ["keyword-density-checker", "meta-tag-generator", "xml-sitemap-generator", "robots-txt-generator", "bulk-url-status-checker"] },
  { title: "Branding", icon: "branding", category: "Branding", allHref: "/branding", slugs: ["logo-maker", "social-media-post-maker", "business-card-maker", "email-signature-generator", "url-shortener", "social-media-calendar", "link-in-bio-builder"] },
  { title: "India", icon: "indian-utilities", category: "indian-utilities", allHref: "/indian-utilities", slugs: ["passport-photo-india", "aadhaar-wallet-cropper", "gst-calculator", "gst-invoice-generator", "gstin-lookup"] },
];

export function buildMegamenuColumns(registry: ToolMetadata[]): MegamenuColumn[] {
  return MENU_COLUMN_DEFS.map(({ title, icon, category, allHref, slugs }) => {
    const featured = slugs.slice(0, 7);
    const featuredTools = featured
      .map((slug) => registry.find((t) => t.slug === slug))
      .filter(Boolean) as ToolMetadata[];
    const featuredSlugsSet = new Set(featuredTools.map((t) => t.slug));
    const fillers = registry
      .filter((t) => t.category === category && t.showInCategory !== false && !featuredSlugsSet.has(t.slug))
      .slice(0, 7 - featuredTools.length);
    const tools = [...featuredTools, ...fillers]
      .map((t) => ({ name: t.name, href: `/${t.category.toLowerCase().replace(/\s+/g, "-")}/${t.slug}` }));
    const allCount = registry.filter((t) => t.category === category && t.showInCategory !== false).length;
    const isIndia = title === "India";
    return { title, icon, tools, allCount, allHref, isIndia };
  });
}
