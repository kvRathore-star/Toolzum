import type { ToolCategory } from './tools-types';

export const proSlugs = [
  "ai-image-generator", "ai-document-chat", "ai-video-subtitler",
  "text-to-speech-tts", "speech-to-text", "ai-paraphrasing-tool",
  "bulk-bg-changer", "bulk-qr-code-generator", "bulk-image-watermark",
  "bulk-pdf-data-extractor", "bulk-image-to-pdf", "bulk-audio-converter",
  "bulk-svg-to-png", "bulk-image-compressor", "bulk-pdf-size-reducer",
  "bulk-image-resizer", "bulk-video-compressor", "bulk-pdf-merger",
  "bulk-face-anonymizer", "bulk-pdf-form-extractor", "bulk-video-size-reducer",
  "bulk-audio-normalizer", "bulk-video-subtitle-burner",
  "bulk-invoice-receipt-parser", "bulk-csv-excel-to-json", "bulk-url-status-checker",
  "bulk-webp-avif-modernizer", "bulk-exif-stripper-injector", "bulk-app-icon-generator",
  "bulk-markdown-to-pdf-html", "bulk-font-subsetter", "bulk-subtitle-time-shifter",
  "bulk-regex-extractor-replacer", "bulk-image-to-text-ocr", "bulk-ebook-converter",
  "bulk-heic-to-jpg",
];


export interface SeoPermutation {
  slug: string;
  name: string;
  category: ToolCategory;
  description: string;
  seoDescription?: string;
  parentSlug: string;
}

export const SEO_PERMUTATIONS: SeoPermutation[] = [
  // Tier 1 — Built as real tools (each has a wrapper component in DynamicModuleWrapper)
  { slug: "bulk-png-to-webp", name: "Bulk PNG to WebP", category: "Image", description: "Convert all your PNG images to modern WebP format in one batch. Shrinks file sizes by 30% without losing quality — essential for Pagespeed scores. Everything runs locally in your browser — nothing is uploaded.", seoDescription: 'Free online Bulk PNG to WebP — Convert all your PNG images to modern WebP format in one batch. Shrinks file sizes by 30% without losing quality — essential for Pagespeed scores. ', parentSlug: "bulk-webp-avif-modernizer" },
  { slug: "bulk-jpg-to-webp", name: "Bulk JPG to WebP", category: "Image", description: "Batch convert JPEG images to WebP format for faster websites. Keeps directory structure intact and generates fallback PNGs automatically. Everything runs locally in your browser — nothing is uploaded.", seoDescription: 'Free online Bulk JPG to WebP — Batch convert JPEG images to WebP format for faster websites. Keeps directory structure intact and generates fallback PNGs automatically. ', parentSlug: "bulk-webp-avif-modernizer" },
  { slug: "bulk-webp-to-png", name: "Bulk WebP to PNG", category: "Image", description: "Need WebP files back to PNG? Convert entire folders of WebP images to universal PNG format in one click — zero quality loss. Everything runs locally in your browser — nothing is uploaded.", seoDescription: 'Free online Bulk WebP to PNG — Need WebP files back to PNG? Convert entire folders of WebP images to universal PNG format in one click — zero quality loss. ', parentSlug: "bulk-webp-avif-modernizer" },
  { slug: "bulk-png-to-jpg", name: "Bulk PNG to JPG", category: "Image", description: "Batch convert PNG images to JPEG format. Perfect when you need smaller file sizes for email or web upload at the cost of transparency. Everything runs locally in your browser — nothing is uploaded.", seoDescription: 'Free online Bulk PNG to JPG — Batch convert PNG images to JPEG format. Perfect when you need smaller file sizes for email or web upload at the cost of transparency. ', parentSlug: "bulk-image-compressor" },
  { slug: "bulk-jpg-to-png", name: "Bulk JPG to PNG", category: "Image", description: "Convert JPEG photos to lossless PNG format in bulk. Essential for graphics needing transparency or when preserving every pixel matters. Everything runs locally in your browser — nothing is uploaded.", seoDescription: 'Free online Bulk JPG to PNG — Convert JPEG photos to lossless PNG format in bulk. Essential for graphics needing transparency or when preserving every pixel matters. ', parentSlug: "bulk-image-compressor" },
  { slug: "bulk-resize-images", name: "Bulk Resize Images", category: "Image", description: "Resize hundreds of photos to exact pixel dimensions in one pass. Photographers standardize client galleries before delivery with this tool. Everything runs locally in your browser — nothing is uploaded.", seoDescription: 'Free online Bulk Resize Images — Resize hundreds of photos to exact pixel dimensions in one pass. Photographers standardize client galleries before delivery with this tool. ', parentSlug: "bulk-image-resizer" },
  { slug: "bulk-compress-png", name: "Bulk PNG Compressor", category: "Image", description: "Compress dozens of PNG files at once with smart lossy compression. E-commerce sellers optimize product images while keeping transparency. Everything runs locally in your browser — nothing is uploaded.", seoDescription: 'Free online Bulk PNG Compressor — Compress dozens of PNG files at once with smart lossy compression. E-commerce sellers optimize product images while keeping transparency. ', parentSlug: "bulk-image-compressor" },
  { slug: "bulk-compress-jpg", name: "Bulk JPG Compressor", category: "Image", description: "Batch compress JPEG photos to smaller file sizes with consistent quality. Bloggers and web devs optimize entire image libraries before deployment. Everything runs locally in your browser — nothing is uploaded.", seoDescription: 'Free online Bulk JPG Compressor — Batch compress JPEG photos to smaller file sizes with consistent quality. Bloggers and web devs optimize entire image libraries before deployment. ', parentSlug: "bulk-image-compressor" },
  { slug: "bulk-compress-pdf", name: "Bulk PDF Compressor", category: "PDF", description: "Reduce file size of multiple PDFs at once by compressing images and removing metadata. Law firms preparing document batches for email. Everything runs locally in your browser — nothing is uploaded.", seoDescription: 'Free online Bulk PDF Compressor — Reduce file size of multiple PDFs at once by compressing images and removing metadata. Law firms preparing document batches for email. ', parentSlug: "bulk-pdf-size-reducer" },
  { slug: "bulk-pdf-to-jpg", name: "Bulk PDF to JPG", category: "PDF", description: "Convert each page of multiple PDFs to high-res JPG images. Presenters extracting slides from decks for social media or thumbnails. Everything runs locally in your browser — nothing is uploaded.", seoDescription: 'Free online Bulk PDF to JPG — Convert each page of multiple PDFs to high-res JPG images. Presenters extracting slides from decks for social media or thumbnails. ', parentSlug: "bulk-pdf-data-extractor" },
  { slug: "bulk-mp3-to-wav", name: "Bulk MP3 to WAV", category: "Audio", description: "Convert your MP3 music library to lossless WAV format in one batch. Audio editors and podcasters need WAV for professional production workflows. Everything runs locally in your browser — nothing is uploaded.", seoDescription: 'Free online Bulk MP3 to WAV — Convert your MP3 music library to lossless WAV format in one batch. Audio editors and podcasters need WAV for professional production workflows. ', parentSlug: "bulk-audio-converter" },
  { slug: "bulk-wav-to-mp3", name: "Bulk WAV to MP3", category: "Audio", description: "Batch compress WAV recordings to space-saving MP3 files. Podcasters shrinking raw studio recordings for distribution on Spotify and Apple Podcasts. Everything runs locally in your browser — nothing is uploaded.", seoDescription: 'Free online Bulk WAV to MP3 — Batch compress WAV recordings to space-saving MP3 files. Podcasters shrinking raw studio recordings for distribution on Spotify and Apple Podcasts. ', parentSlug: "bulk-audio-converter" },
  { slug: "bulk-mkv-to-mp4", name: "Bulk MKV to MP4", category: "Video", description: "Batch remux MKV video files to universally compatible MP4 without re-encoding. Smart TV and iPhone users solving format compatibility issues. Everything runs locally in your browser — nothing is uploaded.", seoDescription: 'Free online Bulk MKV to MP4 — Batch remux MKV video files to universally compatible MP4 without re-encoding. Smart TV and iPhone users solving format compatibility issues. ', parentSlug: "bulk-video-compressor" },
  { slug: "bulk-compress-mp4", name: "Bulk MP4 Compressor", category: "Video", description: "Compress multiple MP4 videos at once for email, web, or messaging. YouTube studios batch-optimize daily uploads with consistent CRF settings. Everything runs locally in your browser — nothing is uploaded.", seoDescription: 'Free online Bulk MP4 Compressor — Compress multiple MP4 videos at once for email, web, or messaging. YouTube studios batch-optimize daily uploads with consistent CRF settings. ', parentSlug: "bulk-video-compressor" },
  { slug: "bulk-strip-exif", name: "Bulk Photo Metadata Remover", category: "Privacy", description: "Strip GPS coordinates, camera data, and hidden metadata from batches of photos. Real estate agents protect client privacy before upload. No signup or account required.", seoDescription: 'Free online Bulk Photo Metadata Remover — Strip GPS coordinates, camera data, and hidden metadata from batches of photos. Real estate agents protect client privacy before upload. ', parentSlug: "bulk-exif-stripper-injector" },
  { slug: "bulk-url-checker", name: "Bulk URL Checker", category: "SEO", description: "Check the status of hundreds of URLs at once — find broken links, redirects, and dead pages across your entire website. Essential for SEO audits before Google crawls your site. Everything runs locally in your browser — nothing is uploaded.", seoDescription: 'Free online Bulk URL Checker — Check the status of hundreds of URLs at once — find broken links, redirects, and dead pages across your entire website. Essential for SEO audits before Google crawls your site. ', parentSlug: "bulk-url-status-checker" },
  { slug: "bulk-link-checker", name: "Bulk Link Checker", category: "SEO", description: "Scan and validate every link on your site in one batch. Catch 404s, broken backlinks, and redirect chains before they hurt your search rankings. Everything runs locally in your browser — nothing is uploaded.", seoDescription: 'Free online Bulk Link Checker — Scan and validate every link on your site in one batch. Catch 404s, broken backlinks, and redirect chains before they hurt your search rankings. ', parentSlug: "bulk-url-status-checker" },
];

export const TOOL_REDIRECTS: Record<string, { category: string; slug: string }> = {
  "base64-encoder-decoder": { category: "developer", slug: "base64-encode-decode" },
  "jwt-decoder": { category: "developer", slug: "jwt-debugger" },
  "body-fat-estimator": { category: "health", slug: "body-fat-calculator" },
  "due-date-calculator": { category: "calculator", slug: "pregnancy-due-date-calculator" },
  "csv-data-generator": { category: "utility", slug: "csv-json-row-generator" },
  "json-minifier": { category: "developer", slug: "json-formatter" },
  "csv-sorter": { category: "utility", slug: "csv-row-sorter" },
  "csv-preview-generator": { category: "utility", slug: "csv-html-table-converter" },
  "morse-code-converter": { category: "utility", slug: "morse-code-translator" },
  "customer-acquisition-cost-calculator": { category: "calculator", slug: "cac-calculator" },
  "ratio-simplifier": { category: "calculator", slug: "ratio-calculator" },
  "proportional-calculator": { category: "calculator", slug: "proportion-calculator" },
  "ideal-weight-calculator": { category: "health", slug: "ideal-weight-calc" },
  "ovulation-calculator": { category: "health", slug: "ovulation-tracker" },
  "mp4-to-gif": { category: "video", slug: "video-to-gif" },
  "webm-to-gif": { category: "video", slug: "video-to-gif" },
  "rpm-calculator": { category: "branding", slug: "cpm-calculator" },
  "markdown-to-html": { category: "converter", slug: "markdown-tools" },
  "html-to-markdown": { category: "converter", slug: "markdown-tools" },
  "text-to-markdown": { category: "converter", slug: "markdown-tools" },
  "markdown-to-text": { category: "converter", slug: "markdown-tools" },
  "nps-survey-calculator": { category: "branding", slug: "net-promoter-score-calculator" },
  "random-password-generator": { category: "utility", slug: "password-generator" },
  "random-uuid-generator": { category: "developer", slug: "uuid-generator" },
  "guid-generator": { category: "developer", slug: "uuid-generator" },
  "text-diff-checker": { category: "developer", slug: "diff-checker" },
  "hash-generator": { category: "developer", slug: "md5-hash-generator" },
  "binary-converter": { category: "developer", slug: "number-base-converter" },
  "currency-rate-calculator": { category: "finance", slug: "currency-converter" },
  "exchange-rate-calculator": { category: "finance", slug: "currency-converter" },
  "water-requirement-calculator": { category: "calculator", slug: "water-intake-calculator" },
  "heart-rate-calculator": { category: "calculator", slug: "heart-rate-zone-calculator" },
  "pregnancy-calculator": { category: "calculator", slug: "pregnancy-due-date-calculator" },
  "fraction-simplifier": { category: "calculator", slug: "fraction-calculator" },
  "svg-to-png-converter": { category: "image", slug: "svg-to-png" },
  "kb-image-compressor": { category: "image", slug: "compress-image-to-50kb" },
  "profit-calculator": { category: "calculator", slug: "profit-margin-calculator" },
  "css-gradient-generator": { category: "utility", slug: "gradient-generator" },
  "days-between-dates-calculator": { category: "developer", slug: "date-difference-calculator" },
  "days-until-calculator": { category: "developer", slug: "time-until-calculator" },
  "text-seo-toolkit": { category: "seo", slug: "" },
  "network-utility-toolkit": { category: "developer", slug: "" },
  "scanner-toolkit": { category: "developer", slug: "" },
  "generator-toolkit": { category: "developer", slug: "" },
  "converters-everyday-toolkit": { category: "converter", slug: "" },
  "data-toolkit": { category: "utility", slug: "" },
  "dev-utilities": { category: "developer", slug: "" },

  // Stub entries with no module — redirect to nearest equivalent
  "curl-to-code": { category: "developer", slug: "curl-to-code-converter" },
  "color-blindness-simulator": { category: "utility", slug: "contrast-ratio-checker" },
  "jwt-encoder-signer": { category: "developer", slug: "jwt-debugger" },
  "memorable-password-generator": { category: "developer", slug: "password-generator" },
  "cpp-formatter": { category: "developer", slug: "code-beautifier" },
  "go-formatter": { category: "developer", slug: "code-beautifier" },
  "kotlin-formatter": { category: "developer", slug: "code-beautifier" },
  "php-beautifier": { category: "developer", slug: "code-beautifier" },
  "ruby-formatter": { category: "developer", slug: "code-beautifier" },
  "rust-formatter": { category: "developer", slug: "code-beautifier" },
  "yaml-to-toon": { category: "converter", slug: "yaml-json-converter" },
  "wifi-qr-generator": { category: "utility", slug: "qr-code-generator" },
};


