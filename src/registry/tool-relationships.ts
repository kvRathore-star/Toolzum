/**
 * Curated workflow-based tool-to-tool relationships.
 *
 * Each entry maps a tool slug to the slugs it should link to.
 * Links are directional but the UI should render them as "related tools."
 * Tools not listed here fall back to same-category random selection.
 *
 * WHY THIS EXISTS
 * The old fallback (first 6 same-category tools alphabetically) creates
 * weak, semantically empty links. Curated pairs connect tools a user
 * would naturally reach for next in the same workflow — e.g. after
 * generating a GST invoice, they need GSTIN lookup and IFSC lookup.
 */

export const TOOL_RELATIONSHIPS: Record<string, string[]> = {
  // ── Aadhaar & ID Tools ──────────────────────────────────────
  "aadhaar-wallet-cropper": [
    "passport-photo-india",
    "aadhaar-card-masker",
  ],
  "aadhaar-card-masker": [
    "aadhaar-wallet-cropper",
    "aadhaar-number-validator",
  ],
  "aadhaar-number-validator": [
    "aadhaar-card-masker",
  ],
  "pan-verification": [
    "indian-document-enhancer",
    "gstin-lookup",
  ],
  "indian-document-enhancer": [
    "pan-verification",
    "aadhaar-wallet-cropper",
    "voter-id-form-helper",
  ],
  "passport-photo-india": [
    "aadhaar-wallet-cropper",
    "indian-document-enhancer",
  ],
  "rental-agreement-generator": [
    "indian-address-parser",
    "complaint-letter-generator",
  ],
  "voter-id-form-helper": [
    "indian-address-parser",
    "india-pincode-finder",
  ],

  // ── Finance & Tax ───────────────────────────────────────────
  "gst-invoice-generator": [
    "gstin-lookup",
    "ifsc-code-lookup",
  ],
  "gstin-lookup": [
    "gst-invoice-generator",
    "seller-profit-calculator",
  ],
  "ifsc-code-lookup": [
    "gst-invoice-generator",
    "upi-id-validator",
  ],
  "tax-saving-calculator": [
    "indian-investment-calculator",
  ],
  "seller-profit-calculator": [
    "gst-invoice-generator",
    "gstin-lookup",
  ],

  // ── Document Generators ─────────────────────────────────────
  "marriage-biodata-maker": [
    "indian-address-parser",
  ],
  "complaint-letter-generator": [
    "rental-agreement-generator",
    "india-pincode-finder",
  ],
  "india-pincode-finder": [
    "indian-address-parser",
    "voter-id-form-helper",
  ],

  // ── Payments & Investments ──────────────────────────────────
  "indian-investment-calculator": [
    "tax-saving-calculator",
    "upi-id-validator",
  ],
  "upi-id-validator": [
    "ifsc-code-lookup",
    "indian-investment-calculator",
  ],

  // ── Converters & Language ───────────────────────────────────
  "indian-age-calculator": [
    "aadhaar-number-validator",
    "cgpa-to-percentage-converter",
  ],
  "cgpa-to-percentage-converter": [
    "indian-age-calculator",
  ],
  "indian-voice-transcriber": [
    "hindi-regional-font-generator",
  ],
  "hindi-regional-font-generator": [
    "indian-voice-transcriber",
  ],
  "indian-address-parser": [
    "india-pincode-finder",
    "voter-id-form-helper",
    "rental-agreement-generator",
  ],
  "vehicle-registration-checker": [
    "aadhaar-number-validator",
  ],

  // ── PDF Compressors ─────────────────────────────────────────
  "pdf-compressor": [
    "bulk-pdf-size-reducer",
    "pdf-merger",
  ],
  "bulk-pdf-size-reducer": [
    "pdf-compressor",
    "bulk-pdf-merger",
  ],

  // ── PDF Mergers ─────────────────────────────────────────────
  "pdf-merger": [
    "pdf-compressor",
    "pdf-splitter",
  ],
  "bulk-pdf-merger": [
    "bulk-pdf-size-reducer",
    "bulk-pdf-suite",
  ],

  // ── PDF Splitters ───────────────────────────────────────────
  "pdf-splitter": [
    "pdf-merger",
    "extract-pages-from-pdf",
  ],
  "extract-pages-from-pdf": [
    "pdf-splitter",
    "pdf-page-delete",
  ],
  "pdf-page-delete": [
    "extract-pages-from-pdf",
    "pdf-splitter",
  ],

  // ── PDF Converters ──────────────────────────────────────────
  "pdf-to-markdown": [
    "markdown-to-pdf",
  ],
  "markdown-to-pdf": [
    "pdf-to-markdown",
  ],
  "pdf-to-png": [
    "pdf-to-tiff",
    "extract-images-from-pdf",
  ],
  "pdf-to-tiff": [
    "tiff-to-pdf",
    "pdf-to-png",
  ],
  "tiff-to-pdf": [
    "pdf-to-tiff",
  ],
  "pdf-to-txt": [
    "pdf-to-markdown",
    "pdf-ocr",
  ],
  "pdf-to-pdfa": [
    "pdf-metadata-editor",
    "pdf-cleanup",
  ],
  "url-to-pdf": [
    "html-to-pdf",
    "create-pdf",
  ],
  "html-to-pdf": [
    "pdf-to-html",
    "create-pdf",
  ],
  "pdf-to-html": [
    "html-to-pdf",
  ],
  "eml-to-pdf": [
    "html-to-pdf",
    "create-pdf",
  ],
  "bulk-image-to-pdf": [
    "scan-to-pdf",
    "bulk-pdf-merger",
  ],
  "scan-to-pdf": [
    "bulk-image-to-pdf",
  ],
  "create-pdf": [
    "url-to-pdf",
    "html-to-pdf",
  ],
  "translate-pdf": [
    "pdf-ocr",
    "pdf-to-txt",
  ],

  // ── Privacy / Redaction ─────────────────────────────────────
  "redact-pdf": [
    "whiteout-pdf",
    "unlock-pdf",
    "pdf-bates-numbering",
  ],
  "whiteout-pdf": [
    "redact-pdf",
    "unlock-pdf",
  ],
  "unlock-pdf": [
    "redact-pdf",
    "whiteout-pdf",
  ],

  // ── Page Organization ───────────────────────────────────────
  "rotate-pdf": [
    "crop-pdf",
    "pdf-page-manager",
  ],
  "crop-pdf": [
    "resize-pdf-pages",
    "rotate-pdf",
  ],
  "resize-pdf-pages": [
    "crop-pdf",
    "nup-pdf",
  ],
  "pdf-page-manager": [
    "rotate-pdf",
    "crop-pdf",
    "nup-pdf",
  ],
  "pdf-add-blank-page": [
    "pdf-page-manager",
    "nup-pdf",
  ],
  "nup-pdf": [
    "pdf-page-manager",
    "resize-pdf-pages",
  ],

  // ── Signing / Forms ─────────────────────────────────────────
  "esign-pdf": [
    "pdf-form-filler",
    "pdf-annotator",
  ],
  "pdf-form-filler": [
    "esign-pdf",
    "pdf-annotator",
  ],
  "pdf-annotator": [
    "esign-pdf",
    "pdf-form-filler",
  ],

  // ── Branding / Document Dress-Up ────────────────────────────
  "watermark-pdf": [
    "pdf-stamp",
    "header-footer-pdf",
  ],
  "pdf-stamp": [
    "watermark-pdf",
    "pdf-timestamp",
  ],
  "header-footer-pdf": [
    "add-page-numbers-to-pdf",
    "watermark-pdf",
  ],
  "add-page-numbers-to-pdf": [
    "header-footer-pdf",
    "pdf-table-of-contents",
  ],
  "pdf-background-color": [
    "watermark-pdf",
    "pdf-stamp",
  ],
  "pdf-timestamp": [
    "bookmark-pdf",
    "pdf-stamp",
  ],
  "bookmark-pdf": [
    "pdf-table-of-contents",
    "pdf-timestamp",
  ],
  "pdf-table-of-contents": [
    "bookmark-pdf",
    "add-page-numbers-to-pdf",
  ],
  "add-text-to-pdf": [
    "add-image-to-pdf",
    "pdf-stamp",
  ],
  "add-image-to-pdf": [
    "add-text-to-pdf",
    "watermark-pdf",
  ],

  // ── Cleanup / Repair / Quality ──────────────────────────────
  "repair-pdf": [
    "deskew-pdf",
    "pdf-cleanup",
  ],
  "deskew-pdf": [
    "repair-pdf",
    "pdf-cleanup",
  ],
  "pdf-cleanup": [
    "repair-pdf",
    "deskew-pdf",
  ],
  "grayscale-pdf": [
    "flatten-pdf",
    "pdf-cleanup",
  ],
  "flatten-pdf": [
    "grayscale-pdf",
    "pdf-cleanup",
  ],
  "pdf-metadata-editor": [
    "pdf-info",
    "pdf-to-pdfa",
  ],

  // ── Data Extraction ─────────────────────────────────────────
  "pdf-ocr": [
    "extract-images-from-pdf",
    "pdf-to-txt",
  ],
  "extract-images-from-pdf": [
    "pdf-ocr",
    "bulk-pdf-data-extractor",
  ],
  "bulk-pdf-data-extractor": [
    "bulk-pdf-form-extractor",
    "pdf-ocr",
  ],
  "bulk-pdf-form-extractor": [
    "bulk-pdf-data-extractor",
    "pdf-ocr",
  ],
  "pdf-info": [
    "compare-pdf-files",
    "pdf-metadata-editor",
  ],
  "compare-pdf-files": [
    "pdf-info",
    "pdf-ocr",
  ],

  // ── Legal / Compliance ──────────────────────────────────────
  "pdf-bates-numbering": [
    "redact-pdf",
    "compare-pdf-files",
  ],

  // ── All-in-One / Power Tools ────────────────────────────────
  "pdf-workflow-builder": [
    "bulk-pdf-suite",
    "generic-pdf-processor",
  ],
  "bulk-pdf-suite": [
    "pdf-workflow-builder",
    "generic-pdf-processor",
    "bulk-pdf-merger",
  ],
  "generic-pdf-processor": [
    "pdf-workflow-builder",
    "bulk-pdf-suite",
    "pdf-advanced",
  ],
  "pdf-advanced": [
    "generic-pdf-processor",
    "pdf-workflow-builder",
  ],
  "pdf-attachments": [
    "pdf-metadata-editor",
    "pdf-workflow-builder",
  ],

  // ── Image: Format Converters (rule-based) ───────────────────
  "heic-to-jpg": ["jpg-to-heic", "bulk-image-converter", "image-format-converter"],
  "webp-to-jpg": ["jpg-to-webp", "bulk-image-converter", "image-bulk-converter"],
  "png-to-jpg": ["jpg-to-png", "bulk-image-converter", "image-format-converter"],
  "jfif-to-png": ["bulk-image-converter", "image-format-converter"],
  "convert-to-jpg": ["bulk-image-converter", "image-bulk-converter"],
  "svg-to-png": ["bulk-image-converter", "image-bulk-converter"],
  "svg-to-jpg": ["jpg-to-svg", "bulk-image-converter", "image-bulk-converter"],
  "png-to-gif": ["gif-to-png", "bulk-image-converter", "image-format-converter"],
  "jpg-to-gif": ["gif-to-jpg", "bulk-image-converter", "image-format-converter"],
  "webp-to-gif": ["gif-to-webp", "bulk-image-converter", "image-bulk-converter"],
  "bmp-to-jpg": ["jpg-to-bmp", "bulk-image-converter", "image-format-converter"],
  "bmp-to-png": ["png-to-bmp", "bulk-image-converter", "image-format-converter"],
  "tiff-to-jpg": ["jpg-to-tiff", "bulk-image-converter", "image-format-converter"],
  "tiff-to-png": ["png-to-tiff", "bulk-image-converter", "image-format-converter"],
  "gif-to-jpg": ["jpg-to-gif", "bulk-image-converter", "image-bulk-converter"],
  "gif-to-png": ["png-to-gif", "bulk-image-converter", "image-bulk-converter"],
  "ico-to-png": ["png-to-ico", "bulk-image-converter", "image-bulk-converter"],
  "jxl-to-png": ["png-to-jxl", "bulk-image-converter", "image-format-converter"],
  "jxl-to-jpg": ["jpg-to-jxl", "bulk-image-converter", "image-format-converter"],
  "avif-to-jpg": ["jpg-to-avif", "bulk-image-converter", "image-bulk-converter"],
  "avif-to-png": ["png-to-avif", "bulk-image-converter", "image-bulk-converter"],
  "bmp-to-avif": ["avif-to-bmp", "bulk-image-converter", "image-format-converter"],
  "bmp-to-gif": ["gif-to-bmp", "bulk-image-converter", "image-format-converter"],
  "bmp-to-webp": ["webp-to-bmp", "bulk-image-converter", "image-format-converter"],
  "gif-to-avif": ["avif-to-gif", "bulk-image-converter", "image-bulk-converter"],
  "gif-to-webp": ["webp-to-gif", "bulk-image-converter", "image-bulk-converter"],
  "heic-to-avif": ["avif-to-heic", "bulk-image-converter", "image-format-converter"],
  "heic-to-gif": ["gif-to-heic", "bulk-image-converter", "image-format-converter"],
  "heic-to-webp": ["webp-to-heic", "bulk-image-converter", "image-format-converter"],
  "ico-to-jpg": ["jpg-to-ico", "bulk-image-converter", "image-bulk-converter"],
  "ico-to-webp": ["webp-to-ico", "bulk-image-converter", "image-bulk-converter"],
  "jpg-to-jxl": ["jxl-to-jpg", "bulk-image-converter", "image-format-converter"],
  "jxl-to-gif": ["gif-to-jxl", "bulk-image-converter", "image-format-converter"],
  "jxl-to-webp": ["webp-to-jxl", "bulk-image-converter", "image-format-converter"],
  "png-to-jxl": ["jxl-to-png", "bulk-image-converter", "image-format-converter"],
  "svg-to-avif": ["avif-to-svg", "bulk-image-converter", "image-bulk-converter"],
  "svg-to-gif": ["gif-to-svg", "bulk-image-converter", "image-bulk-converter"],
  "svg-to-webp": ["webp-to-svg", "bulk-image-converter", "image-bulk-converter"],
  "tiff-to-avif": ["avif-to-tiff", "bulk-image-converter", "image-format-converter"],
  "tiff-to-gif": ["gif-to-tiff", "bulk-image-converter", "image-format-converter"],
  "tiff-to-webp": ["webp-to-tiff", "bulk-image-converter", "image-format-converter"],
  "webp-to-avif": ["avif-to-webp", "bulk-image-converter", "image-bulk-converter"],
  "jpg-to-png": ["png-to-jpg", "bulk-image-converter", "image-format-converter"],
  "png-to-webp": ["webp-to-png", "bulk-image-converter", "image-format-converter"],
  "jpg-to-webp": ["webp-to-jpg", "bulk-image-converter", "image-format-converter"],
  "webp-to-png": ["png-to-webp", "bulk-image-converter", "image-bulk-converter"],
  "heic-to-png": ["png-to-heic", "bulk-image-converter", "image-format-converter"],
  "png-to-avif": ["avif-to-png", "bulk-image-converter", "image-format-converter"],
  "jpg-to-avif": ["avif-to-jpg", "bulk-image-converter", "image-format-converter"],
  "png-to-heic": ["heic-to-png", "bulk-image-converter", "image-format-converter"],
  "png-to-bmp": ["bmp-to-png", "bulk-image-converter", "image-format-converter"],
  "png-to-tiff": ["tiff-to-png", "bulk-image-converter", "image-format-converter"],
  "png-to-ico": ["ico-to-png", "bulk-image-converter", "image-format-converter"],
  "jpg-to-heic": ["heic-to-jpg", "bulk-image-converter", "image-format-converter"],
  "jpg-to-svg": ["svg-to-jpg", "bulk-image-converter", "image-format-converter"],
  "jpg-to-bmp": ["bmp-to-jpg", "bulk-image-converter", "image-format-converter"],
  "jpg-to-tiff": ["tiff-to-jpg", "bulk-image-converter", "image-format-converter"],
  "jpg-to-ico": ["ico-to-jpg", "bulk-image-converter", "image-format-converter"],
  "webp-to-heic": ["heic-to-webp", "bulk-image-converter", "image-bulk-converter"],
  "webp-to-svg": ["svg-to-webp", "bulk-image-converter", "image-bulk-converter"],
  "webp-to-bmp": ["bmp-to-webp", "bulk-image-converter", "image-bulk-converter"],
  "webp-to-tiff": ["tiff-to-webp", "bulk-image-converter", "image-bulk-converter"],
  "webp-to-ico": ["ico-to-webp", "bulk-image-converter", "image-bulk-converter"],
  "webp-to-jxl": ["jxl-to-webp", "bulk-image-converter", "image-bulk-converter"],
  "heic-to-svg": ["svg-to-heic", "bulk-image-converter", "image-format-converter"],
  "heic-to-bmp": ["bmp-to-heic", "bulk-image-converter", "image-format-converter"],
  "heic-to-tiff": ["tiff-to-heic", "bulk-image-converter", "image-format-converter"],
  "heic-to-ico": ["ico-to-heic", "bulk-image-converter", "image-format-converter"],
  "heic-to-jxl": ["jxl-to-heic", "bulk-image-converter", "image-format-converter"],
  "avif-to-webp": ["webp-to-avif", "bulk-image-converter", "image-bulk-converter"],
  "avif-to-heic": ["heic-to-avif", "bulk-image-converter", "image-bulk-converter"],
  "avif-to-svg": ["svg-to-avif", "bulk-image-converter", "image-bulk-converter"],
  "avif-to-bmp": ["bmp-to-avif", "bulk-image-converter", "image-bulk-converter"],
  "avif-to-tiff": ["tiff-to-avif", "bulk-image-converter", "image-bulk-converter"],
  "avif-to-gif": ["gif-to-avif", "bulk-image-converter", "image-bulk-converter"],
  "avif-to-ico": ["ico-to-avif", "bulk-image-converter", "image-bulk-converter"],
  "avif-to-jxl": ["jxl-to-avif", "bulk-image-converter", "image-bulk-converter"],
  "svg-to-heic": ["heic-to-svg", "bulk-image-converter", "image-bulk-converter"],
  "svg-to-bmp": ["bmp-to-svg", "bulk-image-converter", "image-bulk-converter"],
  "svg-to-tiff": ["tiff-to-svg", "bulk-image-converter", "image-bulk-converter"],
  "svg-to-ico": ["ico-to-svg", "bulk-image-converter", "image-bulk-converter"],
  "svg-to-jxl": ["jxl-to-svg", "bulk-image-converter", "image-bulk-converter"],
  "bmp-to-heic": ["heic-to-bmp", "bulk-image-converter", "image-format-converter"],
  "bmp-to-svg": ["svg-to-bmp", "bulk-image-converter", "image-format-converter"],
  "bmp-to-tiff": ["tiff-to-bmp", "bulk-image-converter", "image-format-converter"],
  "bmp-to-ico": ["ico-to-bmp", "bulk-image-converter", "image-format-converter"],
  "bmp-to-jxl": ["jxl-to-bmp", "bulk-image-converter", "image-format-converter"],
  "tiff-to-heic": ["heic-to-tiff", "bulk-image-converter", "image-format-converter"],
  "tiff-to-svg": ["svg-to-tiff", "bulk-image-converter", "image-format-converter"],
  "tiff-to-bmp": ["bmp-to-tiff", "bulk-image-converter", "image-format-converter"],
  "tiff-to-ico": ["ico-to-tiff", "bulk-image-converter", "image-format-converter"],
  "tiff-to-jxl": ["jxl-to-tiff", "bulk-image-converter", "image-format-converter"],
  "gif-to-heic": ["heic-to-gif", "bulk-image-converter", "image-bulk-converter"],
  "gif-to-svg": ["svg-to-gif", "bulk-image-converter", "image-bulk-converter"],
  "gif-to-bmp": ["bmp-to-gif", "bulk-image-converter", "image-bulk-converter"],
  "gif-to-tiff": ["tiff-to-gif", "bulk-image-converter", "image-bulk-converter"],
  "gif-to-ico": ["ico-to-gif", "bulk-image-converter", "image-bulk-converter"],
  "gif-to-jxl": ["jxl-to-gif", "bulk-image-converter", "image-bulk-converter"],
  "ico-to-heic": ["heic-to-ico", "bulk-image-converter", "image-bulk-converter"],
  "ico-to-avif": ["avif-to-ico", "bulk-image-converter", "image-bulk-converter"],
  "ico-to-svg": ["svg-to-ico", "bulk-image-converter", "image-bulk-converter"],
  "ico-to-bmp": ["bmp-to-ico", "bulk-image-converter", "image-bulk-converter"],
  "ico-to-tiff": ["tiff-to-ico", "bulk-image-converter", "image-bulk-converter"],
  "ico-to-gif": ["gif-to-ico", "bulk-image-converter", "image-bulk-converter"],
  "ico-to-jxl": ["jxl-to-ico", "bulk-image-converter", "image-bulk-converter"],
  "jxl-to-heic": ["heic-to-jxl", "bulk-image-converter", "image-format-converter"],
  "jxl-to-avif": ["avif-to-jxl", "bulk-image-converter", "image-format-converter"],
  "jxl-to-svg": ["svg-to-jxl", "bulk-image-converter", "image-format-converter"],
  "jxl-to-bmp": ["bmp-to-jxl", "bulk-image-converter", "image-format-converter"],
  "jxl-to-tiff": ["tiff-to-jxl", "bulk-image-converter", "image-format-converter"],
  "jxl-to-ico": ["ico-to-jxl", "bulk-image-converter", "image-format-converter"],

  // ── Image Compressors ──────────────────────────────────────
  "image-compressor": ["compress-image-to-50kb", "bulk-image-compressor"],
  "compress-image-to-50kb": ["image-compressor"],
  "bulk-image-compressor": ["image-compressor", "bulk-image-resizer"],

  // ── Image Resizers ─────────────────────────────────────────
  "image-resizer": ["crop-image", "bulk-image-resizer"],
  "crop-image": ["image-resizer"],
  "bulk-image-resizer": ["image-resizer", "bulk-image-compressor"],

  // ── Image Format Converters (named) ─────────────────────────
  "image-format-converter": ["image-bulk-converter", "bulk-image-converter"],
  "image-bulk-converter": ["image-format-converter", "bulk-image-converter"],
  "png-to-svg": ["image-format-converter"],
  "raw-image-converter": ["image-format-converter"],
  "psd-to-jpg-png": ["image-format-converter"],
  "gif-to-apng": ["apng-to-gif"],
  "apng-to-gif": ["gif-to-apng"],
  "image-to-ico": ["bulk-image-converter"],
  "bulk-heic-to-jpg": ["bulk-image-converter", "image-bulk-converter"],
  "bulk-svg-to-png": ["bulk-image-converter"],
  "image-converter": ["image-format-converter", "bulk-image-converter"],
  "bulk-image-converter": ["image-format-converter", "image-bulk-converter"],
  "rotate-image": ["crop-image", "image-resizer"],

  // ── Image Editors ─────────────────────────────────────────
  "add-text-to-photo": ["meme-generator", "collage-maker"],
  "meme-generator": ["add-text-to-photo", "collage-maker"],
  "collage-maker": ["meme-generator", "add-text-to-photo"],
  "image-enhancer": ["photo-retoucher", "image-colorizer", "unblur-sharpen"],
  "photo-retoucher": ["image-enhancer", "image-colorizer", "unblur-sharpen"],
  "image-colorizer": ["image-enhancer", "photo-retoucher", "unblur-sharpen"],
  "unblur-sharpen": ["image-enhancer", "photo-retoucher", "image-colorizer"],
  "batch-image-editor": ["bulk-image-watermark", "bulk-exif-stripper-injector"],
  "blur-face": ["bulk-face-anonymizer", "bulk-exif-stripper-injector"],
  "bulk-face-anonymizer": ["blur-face", "bulk-exif-stripper-injector"],
  "gif-editor": ["gif-compressor", "gif-resizer"],
  "gif-compressor": ["gif-editor", "gif-resizer"],
  "gif-resizer": ["gif-editor", "gif-compressor"],
  "object-remover": ["photo-retoucher"],
  "bulk-image-to-text-ocr": ["bulk-exif-stripper-injector"],
  "bulk-app-icon-generator": ["image-to-ico", "bulk-image-converter"],
  "chart-maker": ["collage-maker"],

  // ── AI Image Tools ──────────────────────────────────────────
  "ai-bg-changer": ["bulk-bg-changer"],
  "bulk-bg-changer": ["ai-bg-changer"],
  "background-remover": ["bg-changer", "ai-bg-changer"],
  "bg-changer": ["background-remover", "ai-bg-changer"],
  "bulk-image-watermark": ["batch-image-editor", "bulk-image-converter"],
  "bulk-exif-stripper-injector": ["blur-face", "bulk-face-anonymizer"],

  // ── Audio Converters ──────────────────────────────────────────
  "audio-format-converter": ["bulk-audio-converter", "mp3-compressor"],
  "bulk-audio-converter": ["audio-format-converter", "bulk-mp3-to-wav"],
  "apple-music-preview-extractor": ["audio-cutter"],

  // ── Audio Compressors ─────────────────────────────────────────
  "mp3-compressor": ["audio-compressor", "audio-format-converter"],
  "audio-compressor": ["mp3-compressor", "audio-equalizer"],

  // ── Audio Trim & Cut ─────────────────────────────────────────
  "audio-cutter": ["audio-merger", "fade-in-out"],

  // ── Audio Editors & Effects ──────────────────────────────────
  "audio-merger": ["audio-cutter", "fade-in-out"],
  "fade-in-out": ["audio-cutter", "audio-merger"],
  "noise-reducer": ["audio-equalizer", "vocal-remover"],
  "audio-equalizer": ["noise-reducer", "audio-compressor"],
  "waveform-generator": ["audio-cutter", "voice-recorder"],
  "vocal-remover": ["noise-reducer", "audio-equalizer"],
  "voice-recorder": ["speech-to-text", "noise-reducer"],
  "bulk-audio-normalizer": ["audio-compressor", "bulk-audio-converter"],

  // ── AI & Speech Tools ────────────────────────────────────────
  "text-to-speech": ["speech-to-text"],
  "speech-to-text": ["text-to-speech", "voice-recorder"],

  // ── Other Audio Tools ────────────────────────────────────────
  "bulk-mp3-to-wav": ["bulk-wav-to-mp3", "bulk-audio-converter"],
  "bulk-wav-to-mp3": ["bulk-mp3-to-wav", "bulk-audio-converter"],

  // ── Video Compressors ─────────────────────────────────────────
  "video-compressor": ["bulk-video-compressor", "video-converter", "video-trimmer"],
  "bulk-video-compressor": ["video-compressor", "bulk-mp4-compressor", "bulk-video-size-reducer"],
  "bulk-video-size-reducer": ["bulk-video-compressor", "video-compressor", "bulk-mp4-compressor"],

  // ── Video Converters ─────────────────────────────────────────
  "video-converter": ["video-compressor", "video-to-gif", "video-to-mp3-converter"],
  "video-to-gif": ["video-trimmer", "crop-video", "video-converter"],
  "video-to-mp3-converter": ["video-converter", "mute-video"],

  // ── Video Trimmers ────────────────────────────────────────────
  "crop-video": ["video-trimmer", "video-filters", "video-compressor"],
  "video-trimmer": ["crop-video", "video-speed-changer", "video-compressor"],

  // ── Video Editors & Effects ──────────────────────────────────
  "video-speed-changer": ["reverse-video", "video-trimmer", "video-filters"],
  "reverse-video": ["video-speed-changer", "video-filters"],
  "mute-video": ["video-to-mp3-converter", "video-watermark-adder"],
  "video-stabilizer": ["video-trimmer", "video-filters", "video-compressor"],
  "video-filters": ["video-stabilizer", "video-watermark-adder", "video-speed-changer"],
  "video-screenshot": ["video-trimmer", "video-filters"],
  "screen-recorder": ["video-trimmer", "video-compressor"],
  "video-watermark-adder": ["video-filters", "video-compressor"],

  // ── Video Subtitle Tools ──────────────────────────────────────
  "subtitle-translator": ["subtitle-generator", "bulk-video-subtitle-burner", "bulk-subtitle-time-shifter"],
  "subtitle-generator": ["subtitle-translator", "bulk-video-subtitle-burner"],
  "bulk-video-subtitle-burner": ["subtitle-generator", "subtitle-translator", "bulk-subtitle-time-shifter"],
  "bulk-subtitle-time-shifter": ["subtitle-translator", "bulk-video-subtitle-burner"],

  // ── Other Video Tools ─────────────────────────────────────────
  "bulk-mkv-to-mp4": ["bulk-mp4-compressor", "video-converter"],

  // bulk-mp4-compressor merged from two sections (compressors + other)
  "bulk-mp4-compressor": ["bulk-video-compressor", "bulk-video-size-reducer", "bulk-mkv-to-mp4", "video-compressor"],

  // ── Text: Counters & Analyzers ─────────────────────────────────
  "word-counter": ["writing-tools", "character-counter", "text-cleaner"],
  "character-counter": ["word-counter", "writing-tools"],
  "ascii-table-generator": ["text-splitter", "markdown-previewer"],
  "writing-tools": ["word-counter", "character-counter"],

  // reverse-text-generator ≈ text-reverser → canonical: text-reverser
  "reverse-text-generator": ["text-reverser"],
  "text-reverser": ["upside-down-text"],

  // ── Text: Converters ──────────────────────────────────────────
  "case-converter": ["text-cleaner", "text-replacer", "reverse-text-generator"],
  "braille-translator": ["pronunciation-tool", "case-converter"],
  "text-to-handwriting": ["cursive-text-generator", "font-generator"],
  "text-repeater": ["text-cleaner", "text-splitter"],
  "markdown-previewer": ["text-cleaner", "citation-generator"],
  "text-replacer": ["text-cleaner", "case-converter"],
  "text-sorter": ["text-deduplicator", "duplicate-word-remover"],
  "text-deduplicator": ["duplicate-word-remover", "text-sorter", "text-cleaner"],
  "duplicate-word-remover": ["text-deduplicator", "text-sorter"],
  "text-cleaner": ["text-deduplicator", "text-replacer", "word-counter"],
  "text-splitter": ["text-sorter", "ascii-table-generator", "text-repeater"],

  // ── Text & Font Generators ────────────────────────────────────
  // fancy-text/font/text-styling/text-style cluster → canonical: font-generator
  "fancy-text-generator": ["font-generator", "cursive-text-generator"],
  "font-generator": ["cursive-text-generator"],
  "cursive-text-generator": ["font-generator", "text-to-handwriting"],
  "invisible-text-generator": ["invisible-character", "small-text-generator"],
  "lorem-ipsum-generator": ["citation-generator", "markdown-previewer"],
  "pronunciation-tool": ["braille-translator", "word-counter"],
  "text-styling": ["font-generator", "small-text-generator", "big-text-generator"],
  "small-text-generator": ["big-text-generator", "text-styling"],
  "big-text-generator": ["small-text-generator", "text-styling"],
  "citation-generator": ["lorem-ipsum-generator", "word-counter"],
  "text-style-generator": ["font-generator"],
  "upside-down-text": ["text-reverser", "glitch-text"],
  "glitch-text": ["upside-down-text", "invisible-character"],
  "invisible-character": ["invisible-text-generator", "glitch-text"],

  // ============ Code Formatters & Beautifiers ============
  "json-formatter": ["code-formatter", "code-beautifier", "javascript-formatter"],
  "html-formatter": ["code-formatter", "code-beautifier", "xml-formatter"],
  "typescript-formatter": ["code-formatter", "javascript-formatter", "tsx-formatter"],
  "scss-formatter": ["code-formatter", "css-formatter", "code-beautifier"],
  "xml-formatter": ["code-formatter", "html-formatter", "code-beautifier"],
  "swift-formatter": ["code-formatter", "kotlin-formatter", "code-beautifier"],
  "proto-schema-converter": ["json-formatter", "typescript-formatter", "protobuf-decoder"],
  "tsconfig-analyzer": ["typescript-formatter", "package-json-validator"],
  "bulk-csv-excel-to-json": ["json-formatter", "csv-analyzer", "csv-to-sql"],
  "bulk-regex-extractor-replacer": ["regex-tester", "secret-scanner"],
  "trailing-space-remover": ["code-beautifier", "csv-data-cleaner"],
  "sql-formatter": ["code-formatter", "json-formatter", "csv-to-sql"],
  "code-beautifier": ["code-formatter", "js-minifier", "css-formatter"],
  "code-formatter": ["code-beautifier", "json-formatter", "python-formatter"],
  "css-formatter": ["scss-formatter", "css-generator", "media-query-generator"],
  "javascript-formatter": ["typescript-formatter", "js-minifier", "json-formatter"],
  "jsx-formatter": ["tsx-formatter", "javascript-formatter"],
  "tsx-formatter": ["jsx-formatter", "typescript-formatter"],
  "python-formatter": ["ruby-formatter", "code-formatter"],
  "yaml-formatter": ["json-formatter", "yaml-validator"],
  "markdown-formatter": ["html-formatter", "markdown-table-generator"],
  "cpp-formatter": ["rust-formatter", "code-formatter"],
  "go-formatter": ["rust-formatter", "code-formatter"],
  "kotlin-formatter": ["swift-formatter", "code-formatter"],
  "php-beautifier": ["python-formatter", "ruby-formatter"],
  "ruby-formatter": ["python-formatter", "php-beautifier"],
  "rust-formatter": ["go-formatter", "cpp-formatter"],

  // ============ Minifiers & Compressors ============
  "js-minifier": ["javascript-formatter", "code-beautifier"],

  // ============ CSS Generators ============
  "css-generator": ["media-query-generator", "css-formatter"],
  "media-query-generator": ["css-generator", "css-formatter"],

  // ============ API & Webhook Tools ============
  "api-request-builder": ["api-tester", "api-builder", "http-headers-generator"],
  "api-tester": ["api-request-builder", "api-response-formatter", "webhook-tester"],
  "api-response-formatter": ["api-tester", "api-payload-analyzer", "json-formatter"],
  "api-error-decoder": ["http-status-code-checker", "api-response-formatter"],
  "api-payload-analyzer": ["api-response-formatter", "json-size-analyzer"],
  "api-mock-data-generator": ["mock-api-response-generator", "test-data-generator", "openapi-mock-generator"],
  "api-mock-server-config": ["api-mock-data-generator", "mock-api-response-generator"],
  "mock-api-response-generator": ["api-mock-data-generator", "openapi-mock-generator"],
  "api-latency-budget": ["api-pagination-calculator", "api-gateway-rate-calculator"],
  "api-pagination-calculator": ["api-latency-budget", "api-rate-limiter-calculator"],
  "api-key-generator": ["api-key-hasher", "api-key-validator"],
  "api-key-hasher": ["api-key-generator", "api-key-validator"],
  "api-key-validator": ["api-key-generator", "api-key-hasher"],
  "api-cost-estimator": ["graphql-cost-estimator", "pricing-tier-builder"],
  "api-gateway-rate-calculator": ["api-rate-limiter-calculator", "api-latency-budget"],
  "api-rate-limiter-calculator": ["api-gateway-rate-calculator", "api-pagination-calculator"],
  "api-changelog-generator": ["api-documentation-generator", "api-diff-checker"],
  "api-documentation-generator": ["rest-endpoint-documenter", "api-docs-generator"],
  "rest-endpoint-documenter": ["api-documentation-generator", "api-docs-generator"],
  "graphql-cost-estimator": ["graphql-query-formatter", "api-cost-estimator"],
  "graphql-query-formatter": ["graphql-variables-formatter", "graphql-tester"],
  "graphql-schema-to-json-schema": ["graphql-schema-validator", "json-formatter"],
  "graphql-schema-validator": ["graphql-schema-to-json-schema", "graphql-tester"],
  "graphql-subscription-builder": ["graphql-query-formatter", "graphql-tester"],
  "graphql-tester": ["graphql-query-formatter", "graphql-variables-formatter"],
  "graphql-variables-formatter": ["graphql-query-formatter", "graphql-tester"],
  "grpc-status-code-lookup": ["http-status-code-checker", "api-error-decoder"],
  "soap-api-tester": ["api-tester", "api-request-builder"],
  "openapi-mock-generator": ["api-mock-data-generator", "mock-api-response-generator"],
  "openapi-to-postman": ["postman-collection-generator", "openapi-validator"],
  "openapi-validator": ["openapi-to-postman", "api-diff-checker"],
  "postman-collection-generator": ["openapi-to-postman", "postman-to-openapi-converter"],
  "postman-to-openapi-converter": ["postman-collection-generator", "openapi-to-postman"],
  "swagger-openapi-generator": ["openapi-validator", "api-docs-generator"],
  "api-docs-generator": ["swagger-openapi-generator", "api-documentation-generator"],
  "api-diff-checker": ["openapi-validator", "api-changelog-generator"],
  "webhook-payload-generator": ["webhook-tester", "webhook-validator"],
  "webhook-retry-config": ["webhook-tester", "http-retry-policy-builder"],
  "webhook-signature-verifier": ["webhook-validator", "webhook-tester"],
  "webhook-tester": ["webhook-payload-generator", "webhook-signature-verifier"],
  "webhook-validator": ["webhook-payload-generator", "webhook-signature-verifier"],
  "code-to-curl-converter": ["curl-to-code-converter", "curl-to-code"],
  "curl-to-code-converter": ["code-to-curl-converter", "curl-to-code"],
  "jsonrpc-builder": ["api-request-builder", "json-formatter"],
  "api-builder": ["api-request-builder", "api-tester", "curl-to-code"],
  "curl-to-code": ["curl-to-code-converter", "code-to-curl-converter", "code-to-curl-parser"],
  "http-headers-generator": ["http-status-code-checker", "api-request-builder"],
  "http-status-code-checker": ["api-error-decoder", "grpc-status-code-lookup"],
  "pricing-tier-builder": ["api-cost-estimator", "graphql-cost-estimator"],

  // ============ Security & Encryption ============
  "password-entropy-calculator": ["brute-force-time-estimator", "two-factor-auth-generator"],
  "two-factor-auth-generator": ["password-entropy-calculator", "jwt-inspector"],
  "brute-force-time-estimator": ["password-entropy-calculator", "hash-password-generator"],
  "hash-verifier": ["hash-file-generator", "md5-hash-generator"],
  "hash-password-generator": ["pbkdf2-hash-generator", "brute-force-time-estimator"],
  "hash-file-generator": ["hash-verifier", "md5-hash-generator"],
  "hmac-generator": ["hash-file-generator", "webhook-signature-verifier"],
  "md5-hash-generator": ["hash-file-generator", "hash-verifier"],
  "ssl-tls-checker": ["ssl-certificate-decoder", "ssl-checker"],
  "http-security-checker": ["content-security-policy-generator", "csp-policy-validator"],
  "jwt-inspector": ["jwt-encoder-signer", "two-factor-auth-generator"],
  "content-security-policy-generator": ["csp-policy-validator", "http-security-checker"],
  "subnet-calculator": ["subnet-visualizer", "cidr-calculator"],
  "subnet-visualizer": ["subnet-calculator", "cidr-calculator"],
  "ip-address-converter": ["subnet-calculator", "ip-range-expander"],
  "ip-range-expander": ["ip-address-converter", "cidr-calculator"],
  "ipv6-ula-generator": ["ip-address-converter", "subnet-calculator"],
  "dns-lookup-generator": ["dns-record-validator", "subdomain-finder"],
  "cors-inspector": ["cors-header-generator"],
  "cors-header-generator": ["cors-inspector"],
  "env-file-generator": ["env-file-parser"],
  "env-file-parser": ["env-file-generator"],
  "cve-lookup": ["sql-injection-detector", "xss-protection-checker"],
  "sql-injection-detector": ["xss-protection-checker", "secret-scanner"],
  "xss-protection-checker": ["sql-injection-detector", "cve-lookup"],
  "csrf-token-generator": ["oauth2-debugger", "csp-policy-validator"],
  "oauth2-debugger": ["oauth-client-setup", "jwt-inspector"],
  "saml-decoder": ["oauth2-debugger", "jwt-inspector"],
  "csp-policy-validator": ["content-security-policy-generator", "http-security-checker"],
  "tls-cipher-checker": ["ssl-tls-checker", "ssl-checker"],
  "ip-reputation-checker": ["subnet-calculator", "url-sanitizer"],
  "url-sanitizer": ["ip-reputation-checker", "cors-inspector"],
  "ssl-certificate-decoder": ["ssl-tls-checker", "ssl-checker"],
  "subdomain-finder": ["dns-lookup-generator", "whois-lookup"],
  "email-format-validator": ["email-normalizer"],
  "aes-encrypt": ["rsa-key-generator", "hmac-generator"],
  "rsa-key-generator": ["aes-encrypt", "ssh-key-generator"],
  "oauth-client-setup": ["oauth2-debugger", "oauth-scope-builder"],
  "pkce-verifier": ["oauth-pkce-generator", "oauth-client-setup"],
  "oauth-scope-builder": ["oauth-client-setup", "oauth-state-validator"],
  "oauth-state-validator": ["oauth-scope-builder", "oauth-client-setup"],
  "pbkdf2-hash-generator": ["hash-password-generator", "md5-hash-generator"],
  "cookie-parser": ["cors-inspector", "http-security-checker"],
  "secret-scanner": ["sql-injection-detector", "api-key-hasher"],
  "security-txt-generator": ["robots-txt-validator"],
  "robots-txt-validator": ["security-txt-generator", "sitemap-validator"],
  "oauth-pkce-generator": ["pkce-verifier", "oauth-client-setup"],
  "ip-allowlist-generator": ["cidr-calculator", "subnet-calculator"],
  "cidr-calculator": ["subnet-calculator", "ip-allowlist-generator"],
  "aws-iam-policy-analyzer": ["secret-scanner", "cve-lookup"],
  "ssl-checker": ["ssl-tls-checker", "ssl-certificate-decoder"],
  "dns-record-validator": ["dns-lookup-generator", "subdomain-finder"],
  "jwt-encoder-signer": ["jwt-inspector", "oauth2-debugger"],
  "domain-availability-checker": ["whois-lookup", "subdomain-finder"],
  "rate-limit-header-parser": ["api-rate-limiter-calculator", "api-gateway-rate-calculator"],

  // ============ Encoders & Decoders ============
  "image-to-base64": ["svg-base64-converter", "base64-json-decoder"],
  "url-encoder-decoder": ["query-string-parser", "url-parser"],
  "hex-ascii-converter": ["hex-text-converter", "text-to-binary"],
  "text-to-binary": ["binary-to-text", "hex-ascii-converter"],
  "number-base-converter": ["hex-ascii-converter", "unicode-converter"],
  "base32-encoder": ["base64-json-decoder", "image-to-base64"],
  "base64-json-decoder": ["image-to-base64", "json-formatter"],
  "hex-text-converter": ["hex-ascii-converter", "binary-to-text"],
  "svg-base64-converter": ["image-to-base64", "svg-optimizer"],
  "binary-to-text": ["text-to-binary", "hex-text-converter"],

  // ============ Validators & Converters ============
  "diff-checker": ["json-diff-checker", "api-diff-checker"],
  "regex-tester": ["bulk-regex-extractor-replacer", "secret-scanner"],
  "syntax-validator": ["validator-kit", "html-linter"],
  "yaml-syntax-validator": ["yaml-validator", "yaml-formatter"],
  "yaml-validator": ["yaml-syntax-validator", "yaml-reindenter"],
  "git-commit-linter": ["conventional-commit-generator", "gitignore-generator"],
  "gitignore-generator": ["git-commit-linter", "dockerfile-linter"],
  "csv-to-sqlite": ["csv-analyzer", "csv-to-sql"],
  "json-path-query-builder": ["json-tree-viewer", "json-formatter"],
  "json-diff-checker": ["diff-checker", "json-tree-viewer"],
  "json-tree-viewer": ["json-path-query-builder", "json-formatter"],
  "html-to-jsx": ["jsx-formatter", "html-formatter"],
  "svg-to-css": ["svg-base64-converter", "svg-optimizer"],
  "jwt-debugger": ["jwt-inspector", "jwt-encoder-signer"],
  "html-preview": ["html-formatter", "html-to-jsx"],
  "cron-parser": ["cron-expression-validator"],
  "geojson-validator": ["xml-minifier-validator", "syntax-validator"],
  "rss-feed-validator": ["sitemap-validator", "xml-minifier-validator"],
  "sitemap-validator": ["rss-feed-validator", "robots-txt-validator"],
  "xpath-validator": ["xml-minifier-validator", "xml-formatter"],
  "cron-expression-validator": ["cron-parser"],
  "html-linter": ["syntax-validator", "html-formatter"],
  "xml-minifier-validator": ["xml-formatter", "geojson-validator"],
  "character-encoding-converter": ["unicode-converter", "hex-ascii-converter"],
  "unicode-converter": ["character-encoding-converter", "text-to-binary"],
  "markdown-slack-converter": ["markdown-formatter", "markdown-table-generator"],
  "px-rem-converter": ["css-specificity-calculator", "css-formatter"],
  "msgpack-inspector": ["cbor-inspector", "protobuf-decoder"],
  "cbor-inspector": ["msgpack-inspector", "protobuf-decoder"],
  "avro-schema-generator": ["avro-to-json-sample", "json-schema-generator"],
  "avro-to-json-sample": ["avro-schema-generator", "json-schema-generator"],
  "json-escape-unescape": ["json-formatter", "json-flattener"],
  "json-flattener": ["json-escape-unescape", "json-path-query-builder"],
  "json-to-zod": ["json-schema-generator", "json-formatter"],
  "ndjson-to-json": ["jsonl-formatter", "json-formatter"],
  "jsonl-formatter": ["ndjson-to-json", "json-formatter"],
  "json-to-url-params": ["query-string-parser", "json-formatter"],
  "json-schema-generator": ["json-to-zod", "avro-schema-generator"],
  "merge-patch-generator": ["json-diff-checker", "json-formatter"],
  "css-specificity-calculator": ["css-formatter", "css-validator"],
  "css-validator": ["css-specificity-calculator", "css-formatter"],
  "validator-kit": ["syntax-validator", "email-format-validator"],
  "csv-data-cleaner": ["csv-analyzer", "email-normalizer"],
  "json-formatter-tool": ["json-formatter", "json-schema-generator"],
  "url-parser": ["query-string-parser", "url-encoder-decoder"],
  "protobuf-decoder": ["msgpack-inspector", "cbor-inspector"],
  "query-string-parser": ["url-parser", "json-to-url-params"],
  "email-normalizer": ["email-format-validator", "csv-data-cleaner"],
  "json-ld-generator": ["json-formatter", "json-schema-generator"],
  "json-size-analyzer": ["api-payload-analyzer", "json-formatter"],

  // ============ Config & Linting ============
  "docker-compose-validator": ["dockerfile-linter", "kubernetes-yaml-validator"],
  "dockerfile-linter": ["docker-compose-validator", "docker-run-to-compose"],
  "htaccess-validator": ["nginx-config-generator", "robots-txt-validator"],
  "kubernetes-yaml-validator": ["docker-compose-validator", "github-actions-validator"],
  "github-actions-validator": ["kubernetes-yaml-validator", "gitignore-generator"],
  "code-obfuscator": ["code-beautifier", "js-minifier"],
  "code-to-curl-parser": ["curl-to-code", "code-to-curl-converter"],
  "js-syntax-checker": ["javascript-formatter", "html-linter"],
  "pug-to-html-converter": ["html-formatter", "html-to-jsx"],
  "nginx-config-generator": ["htaccess-validator", "docker-run-to-compose"],
  "eslint-config-generator": ["javascript-formatter", "gitignore-generator"],
  "docker-run-to-compose": ["dockerfile-linter", "docker-compose-validator"],

  // ============ HTTP & Network Debugging ============
  "http-header-analyzer": ["http-security-checker", "http-cache-header-generator"],
  "http-cache-header-generator": ["http-header-analyzer", "http-retry-policy-builder"],
  "http-retry-policy-builder": ["http-cache-header-generator", "webhook-retry-config"],
  "whois-lookup": ["domain-availability-checker", "subdomain-finder"],
  "web-inspector": ["user-agent-parser", "http-header-analyzer"],
  "user-agent-parser": ["web-inspector", "random-user-agent-generator"],
  "chmod-calculator": ["ssh-key-generator", "cidr-calculator"],

  // ============ Random Generators & Mock Data ============
  "random-ip-generator": ["random-token-generator", "ipv6-ula-generator"],
  "random-token-generator": ["uuid-generator", "api-key-generator"],
  "dummy-text-generator": ["lorem-ipsum-generator", "test-data-generator"],
  "fake-identity-generator": ["fake-data-generator", "fake-credit-card-generator"],
  "serial-number-generator": ["license-key-generator", "coupon-code-generator"],
  "uuid-generator": ["random-token-generator", "serial-number-generator"],
  "test-data-generator": ["fake-data-generator", "api-mock-data-generator"],
  "open-graph-generator": ["json-ld-generator", "avatar-generator"],
  "fake-data-generator": ["fake-identity-generator", "test-data-generator"],
  "fake-credit-card-generator": ["fake-identity-generator", "fake-data-generator"],
  "coupon-code-generator": ["serial-number-generator", "license-key-generator"],
  "avatar-generator": ["logo-placeholder-generator", "open-graph-generator"],
  "license-key-generator": ["serial-number-generator", "coupon-code-generator"],
  "pin-generator": ["random-token-generator", "uuid-generator"],
  "random-user-agent-generator": ["user-agent-parser", "random-ip-generator"],
  "logo-placeholder-generator": ["avatar-generator", "image-placeholder-generator"],
  "memorable-password-generator": ["password-entropy-calculator", "random-token-generator"],

  // ============ Developer Utilities ============
  "string-inspector": ["character-encoding-converter", "unicode-converter"],
  "qr-code-reader": ["image-to-base64", "avatar-generator"],
  "yaml-reindenter": ["yaml-validator", "yaml-formatter"],
  "conventional-commit-generator": ["git-commit-linter", "gitignore-generator"],
  "har-analyzer": ["log-analyzer", "http-header-analyzer"],
  "package-json-validator": ["tsconfig-analyzer", "gitignore-generator"],
  "data-anonymizer": ["email-normalizer", "secret-scanner"],
  "port-number-lookup": ["http-status-code-checker", "mime-finder"],
  "sse-event-formatter": ["webhook-tester", "json-formatter"],
  "ssh-key-generator": ["rsa-key-generator", "jwk-generator"],
  "jwk-generator": ["ssh-key-generator", "rsa-key-generator"],
  "image-placeholder-generator": ["avatar-generator", "logo-placeholder-generator"],
  "bulk-font-subsetter": ["svg-optimizer", "image-placeholder-generator"],
  "markdown-table-generator": ["markdown-formatter", "markdown-slack-converter"],
  "website-screenshot": ["http-header-analyzer", "whois-lookup"],
  "php-tools": ["php-beautifier", "json-formatter"],
  "svg-optimizer": ["svg-base64-converter", "svg-to-css"],
  "mime-finder": ["port-number-lookup", "http-status-code-checker"],
  "string-template-tester": ["string-inspector", "json-formatter"],
  "csv-analyzer": ["csv-statistics", "csv-data-cleaner"],
  "csv-statistics": ["csv-analyzer", "csv-transpose"],
  "log-analyzer": ["har-analyzer", "data-anonymizer"],
  "csv-merger": ["csv-splitter", "csv-transpose"],
  "csv-splitter": ["csv-merger", "csv-transpose"],
  "csv-transpose": ["csv-merger", "csv-splitter"],
  "csv-to-sql": ["csv-to-sqlite", "sql-formatter"],

  // ── Productivity ────────────────────────────────────────────────
  "pomodoro-timer": ["to-do-list"],
  "to-do-list": ["pomodoro-timer"],

  // ── Transcription ──────────────────────────────────────────────
  "audio-to-text-transcription": ["video-to-text-transcription", "podcast-transcription", "live-transcription"],
  "video-to-text-transcription": ["audio-to-text-transcription", "youtube-transcript-generator", "podcast-transcription"],
  "live-transcription": ["audio-to-text-transcription", "meeting-minutes-generator"],
  "podcast-transcription": ["audio-to-text-transcription", "video-to-text-transcription", "meeting-minutes-generator"],
  "youtube-transcript-generator": ["video-to-text-transcription", "audio-to-text-transcription"],
  "meeting-minutes-generator": ["audio-to-text-transcription", "podcast-transcription", "live-transcription"],

  // ── SEO: Content/Keyword Prep ──────────────────────────────────
  "keyword-density-checker": ["seo-headline-analyzer", "keyword-planner-tool", "seo-slug-generator"],
  "word-frequency-counter": ["keyword-density-checker", "seo-headline-analyzer"],
  "keyword-planner-tool": ["keyword-density-checker", "seo-headline-analyzer", "seo-slug-generator"],

  // ── SEO: Publishing/Rich Results ─────────────────────────────
  "seo-preview-generator": ["seo-meta-tag-generator", "seo-headline-analyzer", "seo-schema-generator"],
  "canonical-url-checker": ["xml-sitemap-generator", "robots-txt-generator", "bulk-url-status-checker"],
  "breadcrumb-schema-generator": ["seo-schema-generator", "xml-sitemap-generator"],
  "utm-builder": ["seo-slug-generator"],
  "seo-headline-analyzer": ["seo-preview-generator", "keyword-density-checker", "seo-meta-tag-generator"],
  "seo-schema-generator": ["breadcrumb-schema-generator", "seo-preview-generator"],
  "bulk-url-status-checker": ["xml-sitemap-generator", "canonical-url-checker"],
  "xml-sitemap-generator": ["robots-txt-generator", "canonical-url-checker", "bulk-url-status-checker"],
  "seo-meta-tag-generator": ["seo-preview-generator", "seo-schema-generator", "seo-slug-generator"],
  "robots-txt-generator": ["xml-sitemap-generator", "canonical-url-checker"],
  "meta-tag-generator": ["seo-preview-generator", "seo-schema-generator"],
  "seo-slug-generator": ["seo-meta-tag-generator", "canonical-url-checker", "utm-builder"],

  // ── Finance: SaaS Metrics & Analytics ─────────────────────────
  "saas-metrics-dashboard": ["arr-calculator", "churn-rate-calculator", "saas-rule-of-40"],
  "ltv-calculator": ["cac-calculator", "customer-ltv-calculator", "churn-rate-calculator"],
  "churn-rate-calculator": ["ltv-calculator", "saas-quick-ratio", "employee-turnover-calculator"],
  "runway-calculator": ["burn-rate-calculator", "saas-metrics-dashboard"],
  "saas-pricing-calculator": ["mrr-calculator", "seat-license-calculator"],
  "ab-test-calculator": ["trial-conversion-calculator", "saas-metrics-dashboard"],
  "customer-ltv-calculator": ["ltv-calculator", "cac-calculator"],
  "acv-calculator": ["arr-calculator", "saas-payback-period"],
  "saas-payback-period": ["cac-calculator", "acv-calculator"],
  "cac-calculator": ["ltv-calculator", "saas-payback-period", "customer-ltv-calculator"],
  "burn-rate-calculator": ["runway-calculator", "saas-metrics-dashboard"],
  "employee-turnover-calculator": ["churn-rate-calculator"],
  "arr-calculator": ["mrr-calculator", "acv-calculator", "saas-metrics-dashboard"],
  "mrr-calculator": ["arr-calculator", "saas-pricing-calculator"],
  "revenue-growth-calculator": ["arr-calculator", "saas-rule-of-40"],
  "seat-license-calculator": ["saas-pricing-calculator", "mrr-calculator"],
  "saas-quick-ratio": ["churn-rate-calculator", "saas-metrics-dashboard"],
  "saas-rule-of-40": ["revenue-growth-calculator", "saas-quick-ratio"],

  // ── Finance: Loans & Mortgages ────────────────────────────────
  "mortgage-calculator": ["rent-vs-buy-calculator", "emi-calculator"],
  "car-lease-calculator": ["car-loan-calculator"],
  "working-capital-calculator": ["profit-margin-calculator", "break-even-calculator"],
  "emi-calculator": ["mortgage-calculator", "car-loan-calculator"],
  "car-loan-calculator": ["car-lease-calculator", "emi-calculator"],

  // ── Finance: Savings & Investment ─────────────────────────────
  "compound-interest-calculator": ["sip-calculator", "savings-calculator", "simple-interest-calculator"],
  "sip-calculator": ["compound-interest-calculator", "cagr-calculator"],
  "savings-calculator": ["compound-interest-calculator", "retirement-calculator"],
  "profit-margin-calculator": ["margin-calculator", "break-even-calculator", "working-capital-calculator"],
  "break-even-calculator": ["profit-margin-calculator", "roi-calculator"],
  "cagr-calculator": ["sip-calculator", "roi-calculator"],
  "margin-calculator": ["markup-calculator", "profit-margin-calculator"],
  "roi-calculator": ["cagr-calculator", "break-even-calculator"],
  "simple-interest-calculator": ["compound-interest-calculator"],
  "retirement-calculator": ["savings-calculator", "net-worth-calculator"],
  "rent-vs-buy-calculator": ["mortgage-calculator"],

  // ── Finance: Tax & Salary ─────────────────────────────────────
  "gst-calculator": ["tds-calculator-india", "sales-tax-calculator"],
  "vat-calculator": ["sales-tax-calculator", "gst-calculator"],
  "net-worth-calculator": ["debt-payoff-calculator", "retirement-calculator"],
  "debt-payoff-calculator": ["net-worth-calculator", "tax-calculator"],
  "tip-calculator": ["sales-tax-calculator", "discount-calculator"],
  "salary-calculator": ["tax-calculator", "hourly-to-salary-calculator", "tds-calculator-india"],
  "hourly-to-salary-calculator": ["salary-calculator", "tax-calculator"],
  "tax-calculator": ["salary-calculator", "tds-calculator-india"],
  "tds-calculator-india": ["gst-calculator", "salary-calculator"],
  "sales-tax-calculator": ["gst-calculator", "vat-calculator", "tip-calculator"],

  // ── Finance: Invoicing & Currency ─────────────────────────────
  "currency-converter": ["invoice-generator", "iban-validator"],
  "invoice-generator": ["receipt-generator", "bulk-invoice-receipt-parser", "currency-converter"],
  "bulk-invoice-receipt-parser": ["invoice-generator", "receipt-generator"],
  "receipt-generator": ["invoice-generator", "discount-calculator"],
  "iban-validator": ["currency-converter", "invoice-generator"],
  "discount-calculator": ["markup-calculator", "receipt-generator"],
  "inflation-calculator": ["currency-converter", "compound-interest-calculator"],
  "trial-conversion-calculator": ["ab-test-calculator", "saas-metrics-dashboard"],
  "markup-calculator": ["margin-calculator", "discount-calculator"],

  // ── Health: Weight & Body Composition ─────────────────────────
  "bmi-calculator": ["ideal-weight-calc", "body-fat-percentage-calculator", "calorie-calculator"],
  "body-fat-percentage-calculator": ["body-fat-calculator", "lean-body-mass-calculator", "waist-to-hip-ratio-calculator"],
  "body-fat-calculator": ["body-fat-percentage-calculator", "bmi-calculator"],
  "calorie-intake-calculator": ["calorie-calculator", "macro-calculator"],
  "ideal-weight-calc": ["bmi-calculator", "lean-body-mass-calculator"],
  "lean-body-mass-calculator": ["body-fat-percentage-calculator", "ideal-weight-calc"],
  "waist-to-hip-ratio-calculator": ["body-fat-percentage-calculator", "bmi-calculator"],
  "bmr-calculator": ["calorie-calculator", "calorie-intake-calculator"],
  "bmi-calculator-for-kids": ["child-height-predictor", "baby-growth-percentile-calculator"],
  "body-surface-area-calculator": ["bmi-calculator", "bmr-calculator"],

  // ── Health: Calorie & Nutrition ───────────────────────────────
  "calorie-calculator": ["bmr-calculator", "macro-calculator", "calorie-intake-calculator"],
  "breastfeeding-calorie-calculator": ["baby-formula-calculator", "calorie-intake-calculator"],
  "protein-calculator": ["macro-calculator", "macronutrient-calculator"],
  "keto-calculator": ["macro-calculator", "macronutrient-calculator"],
  "macro-calculator": ["calorie-calculator", "protein-calculator", "keto-calculator"],
  "macronutrient-calculator": ["macro-calculator", "protein-calculator"],
  "calories-burned-calculator": ["calorie-tracker", "calorie-calculator"],
  "calorie-tracker": ["calories-burned-calculator", "calorie-calculator"],
  "steps-to-calories-calculator": ["steps-calculator", "calories-burned-calculator"],

  // ── Health: Fitness & Exercise ────────────────────────────────
  "heart-rate-zone-calculator": ["running-pace-calculator", "calories-burned-calculator"],
  "steps-calculator": ["steps-to-calories-calculator", "running-pace-calculator"],
  "running-pace-calculator": ["heart-rate-zone-calculator", "steps-calculator"],
  "cycling-calorie-calculator": ["calories-burned-calculator", "heart-rate-zone-calculator"],

  // ── Health: Pregnancy & Baby ──────────────────────────────────
  "pregnancy-due-date-calculator": ["ovulation-tracker", "baby-growth-percentile-calculator"],
  "ovulation-tracker": ["pregnancy-due-date-calculator"],
  "baby-formula-calculator": ["baby-sleep-schedule-calculator", "baby-growth-percentile-calculator"],
  "baby-growth-percentile-calculator": ["child-height-predictor", "pregnancy-due-date-calculator"],
  "baby-sleep-schedule-calculator": ["baby-formula-calculator", "sleep-requirement-calculator"],
  "child-height-predictor": ["baby-growth-percentile-calculator", "bmi-calculator-for-kids"],

  // ── Health: Other ─────────────────────────────────────────────
  "blood-alcohol-calculator": ["water-intake-calculator"],
  "sleep-requirement-calculator": ["sleep-calculator", "baby-sleep-schedule-calculator"],
  "water-intake-calculator": ["calorie-intake-calculator", "blood-alcohol-calculator"],
  "sleep-calculator": ["sleep-requirement-calculator"],

  // ── Calculator: Math ─────────────────────────────────────────
  "percentage-calculator": ["percentage-difference-calculator", "ratio-calculator", "rounding-calculator"],
  "exponent-calculator": ["square-root-calculator", "scientific-notation-converter"],
  "fraction-calculator": ["fraction-to-decimal-calculator", "decimal-to-fraction-calculator", "ratio-calculator"],
  "fraction-to-decimal-calculator": ["decimal-to-fraction-calculator", "fraction-calculator"],
  "ratio-calculator": ["proportion-calculator", "rule-of-three-calculator", "fraction-calculator"],
  "probability-calculator": ["combination-calculator", "permutation-calculator"],
  "combination-calculator": ["permutation-calculator", "factorial-calculator"],
  "prime-number-checker": ["prime-factorization-calculator", "greatest-common-factor-calculator"],
  "greatest-common-factor-calculator": ["least-common-multiple-calculator", "prime-factorization-calculator"],
  "modulo-calculator": ["greatest-common-factor-calculator", "rounding-calculator"],
  "mean-median-mode-calculator": ["standard-deviation-calculator"],
  "quadratic-equation-solver": ["math-equation-solver", "algebra-calculator"],
  "circle-calculator": ["geometry-calculator", "triangle-area-calculator"],
  "aspect-ratio-calculator": ["screen-size-converter", "dpi-calculator", "ppi-calculator"],
  "dpi-calculator": ["ppi-calculator", "screen-size-converter"],
  "scientific-calculator": ["algebra-calculator", "trigonometry-calculator", "logarithm-calculator"],
  "degree-radian-converter": ["trigonometry-calculator"],
  "significant-figures-calculator": ["rounding-calculator", "scientific-notation-converter"],
  "gas-mileage-calculator": ["percentage-calculator"],
  "percentage-difference-calculator": ["percentage-calculator", "ratio-calculator"],
  "algebra-calculator": ["math-equation-solver", "quadratic-equation-solver", "scientific-calculator"],
  "geometry-calculator": ["circle-calculator", "rectangle-area-calculator", "triangle-area-calculator"],
  "slope-calculator": ["coordinate-calculator", "distance-calculator"],
  "math-equation-solver": ["algebra-calculator", "quadratic-equation-solver"],
  "screen-size-converter": ["aspect-ratio-calculator", "ppi-calculator"],
  "proportion-calculator": ["ratio-calculator", "rule-of-three-calculator"],
  "ppi-calculator": ["dpi-calculator", "screen-size-converter"],
  "pythagorean-theorem-calculator": ["triangle-area-calculator", "distance-calculator"],
  "rectangle-area-calculator": ["geometry-calculator", "triangle-area-calculator"],
  "square-root-calculator": ["exponent-calculator", "scientific-calculator"],
  "fluid-typography-calculator": ["screen-size-converter", "aspect-ratio-calculator"],
  "semver-calculator": ["fluid-typography-calculator"],
  "standard-deviation-calculator": ["mean-median-mode-calculator"],
  "decimal-to-fraction-calculator": ["fraction-to-decimal-calculator", "fraction-calculator"],
  "rule-of-three-calculator": ["proportion-calculator", "ratio-calculator"],
  "permutation-calculator": ["combination-calculator", "factorial-calculator"],
  "factorial-calculator": ["permutation-calculator", "combination-calculator"],
  "prime-factorization-calculator": ["prime-number-checker", "greatest-common-factor-calculator", "least-common-multiple-calculator"],
  "least-common-multiple-calculator": ["greatest-common-factor-calculator", "prime-factorization-calculator"],
  "logarithm-calculator": ["scientific-calculator", "exponent-calculator"],
  "trigonometry-calculator": ["degree-radian-converter", "scientific-calculator"],
  "scientific-notation-converter": ["significant-figures-calculator", "exponent-calculator"],
  "rounding-calculator": ["significant-figures-calculator", "percentage-calculator"],
  "coordinate-calculator": ["midpoint-calculator", "distance-calculator", "slope-calculator"],
  "midpoint-calculator": ["coordinate-calculator", "distance-calculator"],
  "distance-calculator": ["coordinate-calculator", "midpoint-calculator", "pythagorean-theorem-calculator"],
  "triangle-area-calculator": ["pythagorean-theorem-calculator", "geometry-calculator"],

  // ── Calculator: Date & Time ──────────────────────────────────
  "age-calculator": ["time-since-calculator", "day-of-week-calculator"],
  "business-days-calculator": ["work-hours-calculator", "date-difference-calculator"],
  "day-of-week-calculator": ["day-of-year-calculator", "age-calculator"],
  "day-of-year-calculator": ["week-number-calculator", "day-of-week-calculator"],
  "leap-year-calculator": ["day-of-year-calculator", "date-addition-calculator"],
  "time-until-calculator": ["date-difference-calculator", "time-since-calculator"],
  "date-difference-calculator": ["business-days-calculator", "time-until-calculator"],
  "week-number-calculator": ["day-of-year-calculator"],
  "work-hours-calculator": ["business-days-calculator", "hours-minutes-calculator"],
  "eta-calculator": ["time-duration-calculator", "time-addition-calculator"],
  "time-duration-calculator": ["time-addition-calculator", "hours-minutes-calculator"],
  "time-addition-calculator": ["time-duration-calculator", "date-addition-calculator"],
  "meeting-time-planner": ["daylight-saving-time-checker", "time-addition-calculator"],
  "date-addition-calculator": ["time-addition-calculator", "leap-year-calculator"],
  "time-since-calculator": ["age-calculator", "time-until-calculator"],
  "daylight-saving-time-checker": ["meeting-time-planner", "leap-year-calculator"],
  "hours-minutes-calculator": ["work-hours-calculator", "time-duration-calculator"],

  // ── Calculator: Academic ─────────────────────────────────────
  "final-grade-calculator": ["grade-calculator", "gpa-calculator"],
  "gpa-calculator": ["college-gpa-calculator", "final-grade-calculator"],
  "grade-calculator": ["test-score-calculator", "final-grade-calculator"],
  "college-gpa-calculator": ["gpa-calculator", "final-grade-calculator"],
  "study-time-calculator": ["words-per-page-calculator", "final-grade-calculator"],
  "test-score-calculator": ["grade-calculator", "final-grade-calculator"],
  "words-per-page-calculator": ["study-time-calculator"],

  // ── Converter ──────────────────────────────────────────────────

  // Image / Audio
  "gif-to-webp-webm": ["gif-to-mp4", "html-to-image"],
  "html-to-image": ["gif-to-webp-webm"],
  "gif-to-mp4": ["gif-to-webp-webm"],

  // Document
  "epub-to-pdf": ["mobi-converter", "bulk-ebook-converter"],
  "mobi-converter": ["epub-to-pdf", "bulk-ebook-converter"],
  "odt-rtf-to-pdf": ["document-converter", "text-to-html-converter"],
  "cbz-to-pdf": ["epub-to-pdf", "bulk-ebook-converter"],
  "bulk-ebook-converter": ["epub-to-pdf", "mobi-converter"],
  "bulk-markdown-to-pdf-html": ["markdown-tools", "csv-to-markdown"],
  "csv-to-markdown": ["bulk-markdown-to-pdf-html", "json-to-csv"],
  "json-to-csv": ["csv-to-markdown", "import-to-csv"],
  "text-to-html-converter": ["odt-rtf-to-pdf", "html-to-text-converter"],
  "import-to-csv": ["json-to-csv", "xlsx-csv-converter"],
  "document-converter": ["odt-rtf-to-pdf", "epub-to-pdf"],

  // Data
  "data-converter": ["yaml-json-converter", "csv-to-json", "toml-converter"],
  "json-toon-converter": ["toon-to-json", "yaml-to-toon"],
  "csv-html-table-converter": ["xlsx-csv-converter", "csv-to-json"],
  "yaml-json-converter": ["json-to-yaml-converter", "toml-converter"],
  "json-to-yaml-converter": ["yaml-json-converter", "toml-converter"],
  "json-to-ini-converter": ["ini-json-converter", "json-to-toml-converter"],
  "json-to-toml-converter": ["toml-converter", "json-to-yaml-converter"],
  "ini-json-converter": ["json-to-ini-converter", "data-converter"],
  "toml-converter": ["yaml-json-converter", "json-to-toml-converter"],
  "json-to-code": ["data-converter", "json-to-xml"],
  "json-to-xml": ["data-converter", "csv-to-json"],
  "csv-to-json": ["json-to-csv", "data-converter", "csv-html-table-converter"],
  "xlsx-csv-converter": ["csv-html-table-converter", "import-to-csv"],
  "html-to-text-converter": ["text-to-html-converter", "markdown-tools"],

  // CSS Preprocessors
  "scss-to-css-converter": ["css-to-scss-converter", "less-to-css-converter"],
  "tailwind-to-css-converter": ["scss-to-css-converter", "less-to-css-converter"],
  "stylus-to-css-converter": ["css-to-stylus-converter", "scss-to-css-converter"],
  "css-to-scss-converter": ["scss-to-css-converter", "css-to-less-converter"],
  "less-to-css-converter": ["css-to-less-converter", "scss-to-css-converter"],
  "css-to-less-converter": ["less-to-css-converter", "css-to-scss-converter"],
  "css-to-stylus-converter": ["stylus-to-css-converter", "css-to-scss-converter"],

  // Toon
  "yaml-to-toon": ["toon-to-yaml", "json-toon-converter"],
  "toon-to-json": ["json-toon-converter", "toon-to-yaml"],
  "toon-to-yaml": ["yaml-to-toon", "toon-to-json"],

  // Utilities
  "temperature-converter": ["roman-numeral-converter"],
  "roman-numeral-converter": ["temperature-converter"],
  "archive-converter": ["document-converter", "bulk-ebook-converter"],
  "markdown-tools": ["bulk-markdown-to-pdf-html", "html-to-text-converter"],

  // ── Utility ────────────────────────────────────────────────────

  // Random Generators
  "random-number-generator": ["random-string-generator", "sequence-generator"],
  "password-generator": ["random-string-generator", "otp-generator"],
  "qr-code-generator": ["barcode-generator", "wifi-qr-generator"],
  "barcode-generator": ["qr-code-generator"],
  "wheel-of-names": ["random-team-generator", "decision-maker"],
  "counter-tool": ["sequence-generator"],
  "list-randomizer": ["list-sorter", "random-team-generator"],
  "list-sorter": ["list-randomizer"],
  "decision-maker": ["yes-no-picker", "random-decision-maker", "wheel-of-names"],
  "yes-no-picker": ["decision-maker", "coin-flipper"],
  "coin-flipper": ["dice-roller", "yes-no-picker"],
  "dice-roller": ["dice-roller-tool", "coin-flipper"],
  "dice-roller-tool": ["dice-roller", "coin-flipper"],
  "ulid-generator": ["random-string-generator", "random-port-generator"],
  "random-color-generator": ["color-palette-generator", "color-picker"],
  "random-date-generator": ["random-time-generator", "sequence-generator"],
  "random-team-generator": ["wheel-of-names", "list-randomizer"],
  "random-decision-maker": ["decision-maker", "yes-no-picker"],
  "random-string-generator": ["password-generator", "ulid-generator"],
  "random-word-generator": ["random-sentence-generator", "nickname-generator"],
  "sequence-generator": ["random-number-generator", "counter-tool"],
  "ascii-art-generator": ["ascii-font-generator"],
  "ascii-font-generator": ["ascii-art-generator"],
  "random-port-generator": ["ulid-generator"],
  "random-picker-generator": ["decision-maker", "list-randomizer"],
  "random-username-generator": ["nickname-generator", "random-word-generator"],
  "nickname-generator": ["random-username-generator", "random-word-generator"],
  "emoji-picker": ["ascii-art-generator"],
  "otp-generator": ["password-generator"],
  "wifi-qr-generator": ["qr-code-generator"],
  "random-time-generator": ["random-date-generator"],
  "random-sentence-generator": ["random-word-generator"],

  // Timers & Stopwatch
  "timer": ["countdown-tool", "stopwatch"],
  "stopwatch": ["timer", "interval-timer"],
  "countdown-tool": ["timer", "world-clock"],
  "interval-timer": ["tabata-timer", "stopwatch"],
  "tabata-timer": ["interval-timer"],
  "world-clock": ["countdown-tool", "time-zone-converter"],

  // Games & Fun Tools
  "number-guessing-game": ["rock-paper-scissors", "hangman-game"],
  "rock-paper-scissors": ["number-guessing-game", "coin-flipper"],
  "hangman-game": ["number-guessing-game"],

  // Text & Number Converters
  "morse-code-translator": ["nato-phonetic-converter", "unicode-viewer"],
  "nato-phonetic-converter": ["morse-code-translator"],
  "unicode-viewer": ["morse-code-translator"],
  "number-to-words-converter": ["number-words-tools"],
  "number-words-tools": ["number-to-words-converter"],

  // Unit Converters
  "speed-converter": ["speed-converter-advanced", "length-converter"],
  "weight-converter": ["volume-converter", "unit-converter"],
  "data-size-converter": ["unit-converter"],
  "cooking-measurement-converter": ["volume-converter"],
  "fuel-consumption-converter": ["speed-converter", "weight-converter"],
  "clothing-size-converter": ["shoe-size-converter"],
  "hours-to-minutes-converter": ["hours-to-minutes-tool", "time-converter"],
  "hours-to-minutes-tool": ["hours-to-minutes-converter", "time-converter"],
  "time-converter": ["unix-time-converter", "hours-to-minutes-converter"],
  "unix-time-converter": ["time-converter", "time-zone-converter"],
  "vcf-csv-converter": ["ics-csv-converter"],
  "speed-converter-advanced": ["speed-converter", "length-converter"],
  "unit-converter": ["length-converter", "weight-converter", "volume-converter"],
  "power-converter": ["unit-converter", "pressure-converter"],
  "pressure-converter": ["power-converter", "unit-converter"],
  "length-converter": ["unit-converter", "speed-converter"],
  "volume-converter": ["cooking-measurement-converter", "unit-converter"],
  "area-converter": ["unit-converter", "length-converter"],
  "paper-size-converter": ["area-converter"],

  // Data & CSV Tools
  "large-text-viewer": ["format-validator", "column-extractor"],
  "column-extractor": ["column-renamer", "row-filter"],
  "deduplicator": ["csv-row-sorter", "null-value-handler"],
  "null-value-handler": ["deduplicator", "format-validator"],
  "csv-row-sorter": ["deduplicator", "row-filter"],
  "csv-json-row-generator": ["csv-to-ndjson", "csv-formatter"],
  "tsv-csv-converter": ["csv-formatter", "xlsx-csv-converter"],
  "csv-formatter": ["csv-to-ndjson", "csv-json-row-generator"],
  "line-sorter": ["list-converter", "deduplicator"],
  "list-converter": ["line-sorter"],
  "phone-parser": ["mac-vendor-lookup"],
  "mac-vendor-lookup": ["phone-parser", "ip-address-lookup"],
  "column-renamer": ["column-extractor", "data-type-converter"],
  "data-type-converter": ["column-renamer", "format-validator"],
  "format-validator": ["data-type-converter", "null-value-handler"],
  "pivot-generator": ["row-filter", "csv-formatter"],
  "row-filter": ["column-extractor", "pivot-generator"],
  "csv-to-ndjson": ["csv-formatter", "csv-json-row-generator"],
  "ics-csv-converter": ["vcf-csv-converter", "ical-event-generator"],

  // Color & Design Tools
  "color-picker": ["color-palette-generator", "color-tools"],
  "color-palette-generator": ["color-picker", "gradient-generator"],
  "gradient-generator": ["color-palette-generator", "contrast-checker"],
  "contrast-checker": ["gradient-generator", "color-picker"],
  "color-tools": ["color-picker", "random-color-generator"],

  // Everyday Utilities
  "speed-test": ["benchmark-builder", "ip-address-lookup"],
  "benchmark-builder": ["speed-test"],
  "numeronym-generator": ["slugify-tool"],
  "slugify-tool": ["numeronym-generator", "url-shortener"],
  "url-shortener": ["bulk-url-shortener", "qr-code-generator"],
  "bulk-url-shortener": ["url-shortener", "bulk-qr-code-generator"],
  "ring-size-converter": ["shoe-size-converter", "clothing-size-converter"],
  "shoe-size-converter": ["clothing-size-converter", "ring-size-converter"],
  "bulk-qr-code-generator": ["qr-code-generator", "bulk-url-shortener"],
  "ip-address-lookup": ["speed-test", "mac-vendor-lookup"],
  "time-zone-converter": ["world-clock", "unix-time-converter"],
  "minutes-to-hours-converter": ["seconds-to-minutes-converter", "hours-to-minutes-converter"],
  "seconds-to-minutes-converter": ["minutes-to-hours-converter", "time-converter"],
  "resume-builder": ["bank-statement-analyser"],
  "zip-file-extractor": ["archive-converter"],
  "ical-event-generator": ["ics-csv-converter", "world-clock"],
  "whatsapp-toolkit": ["qr-code-generator", "url-shortener"],
  "bank-statement-analyser": ["resume-builder"],

  // ── Privacy ────────────────────────────────────────────────────
  "bulk-strip-exif": ["exif-data-remover", "privacy-cleaner"],
  "exif-data-remover": ["bulk-strip-exif", "privacy-cleaner"],
  "ip-anonymizer": ["mac-address-generator", "privacy-cleaner"],
  "mac-address-generator": ["ip-anonymizer"],
  "password-strength-checker": ["pgp-key-generator", "secure-note-sharer"],
  "pgp-key-generator": ["secure-note-sharer", "password-strength-checker"],
  "privacy-cleaner": ["exif-data-remover", "ip-anonymizer"],
  "secure-note-sharer": ["pgp-key-generator", "password-strength-checker"],
};
