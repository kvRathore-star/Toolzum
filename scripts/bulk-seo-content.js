#!/usr/bin/env node
/**
 * bulk-seo-content.js — Generates unique FAQ, instructions, and descriptions
 * for all 31 bulk tools in the registry.
 *
 * Run:   node scripts/bulk-seo-content.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TOOLS_PATH = path.join(ROOT, "src/registry/tools.ts");

// ─── Bulk tool FAQ + instruction content ────────────────────────────────────

const BULK_CONTENT = {
  "image-bulk-converter": {
    instructions: [
      { title: "1. Upload Images", desc: "Select multiple images (JPEG, PNG, WebP, AVIF, GIF, TIFF) from your device. You can upload dozens at once." },
      { title: "2. Choose Output Format", desc: "Select the target format for all images. Every uploaded image will be converted to this format in one batch." },
      { title: "3. Download All as ZIP", desc: "All converted images are packaged into a single ZIP archive. Click download to save everything at once." },
    ],
    faqs: [
      { question: "What image formats does the bulk converter support?", answer: "The bulk image converter handles JPEG, PNG, WebP, AVIF, GIF, and TIFF formats. You can convert any input format to any output format in a single batch." },
      { question: "What's the maximum number of images I can convert at once?", answer: "Free users can convert up to 10 images per batch. Pro users can convert unlimited images. All processing happens in your browser — there are no server-side upload limits." },
      { question: "Do I need to download images one by one?", answer: "No. All converted images are automatically packaged into a single ZIP file for one-click download. Each image retains its original filename with the new extension." },
      { question: "Is bulk image conversion private?", answer: "Yes. All images are processed entirely in your browser using Canvas API. Your images never leave your device, making it safe for sensitive content." },
    ],
  },
  "bulk-bg-changer": {
    instructions: [
      { title: "1. Upload Images", desc: "Select multiple images with backgrounds you want to replace. Works best with images that have clear subject-background contrast." },
      { title: "2. Pick Background Color", desc: "Use the color picker to select a new background color, or choose transparent to remove the background entirely." },
      { title: "3. Download All", desc: "All processed images are saved as a ZIP archive. Each image keeps its original dimensions and quality." },
    ],
    faqs: [
      { question: "How does the bulk background changer work?", answer: "The tool uses color-key sampling to detect and replace backgrounds. You can fine-tune the color tolerance for better results on images with complex backgrounds." },
      { question: "Can I use a custom image as the background instead of a solid color?", answer: "Currently, the bulk mode supports solid colors and transparent backgrounds. For custom image backgrounds, use the single-image background changer with more advanced editing options." },
      { question: "How many images can I process at once?", answer: "Free users can process up to 5 images per batch. Pro users can process unlimited images. All processing runs locally in your browser." },
    ],
  },
  "bulk-qr-code-generator": {
    instructions: [
      { title: "1. Enter or Upload Data", desc: "Type or paste your data (URLs, text, phone numbers) one per line, or upload a CSV file with multiple entries." },
      { title: "2. Customize QR Code", desc: "Choose size, error correction level, and optional colors. Each entry gets its own QR code with identical styling." },
      { title: "3. Download ZIP", desc: "All QR codes are exported as PNG images in a ZIP archive, named by their data content for easy identification." },
    ],
    faqs: [
      { question: "What can I put in a QR code?", answer: "QR codes can store URLs, plain text, phone numbers, email addresses, SMS messages, Wi-Fi credentials, vCard contacts, and geographic locations. The bulk generator supports all common data types." },
      { question: "How many QR codes can I generate at once?", answer: "Free users can generate up to 10 QR codes per batch from CSV input. Pro users can generate up to 5,000 QR codes from large CSV files." },
      { question: "What format are the QR code images?", answer: "QR codes are generated as PNG images at your chosen resolution (default 512x512). Each image is named after its content, making it easy to identify which QR code is which." },
    ],
  },
  "bulk-image-watermark": {
    instructions: [
      { title: "1. Upload Images", desc: "Select all images you want to watermark. Supports JPEG, PNG, and WebP formats." },
      { title: "2. Configure Watermark", desc: "Choose between text overlay, image logo, or timestamp. Adjust position, opacity, size, and rotation." },
      { title: "3. Process & Download", desc: "Click process and all watermarked images are saved in a ZIP archive. Processing is fully local." },
    ],
    faqs: [
      { question: "Can I add different watermarks to different images in the same batch?", answer: "No — the bulk watermarker applies the same watermark configuration to all images in a batch. For different watermarks, process images in separate batches." },
      { question: "What watermark types are supported?", answer: "You can add text overlays (customizable font, size, color, opacity), image logos (PNG with transparency), or automatic timestamps showing the date and time." },
      { question: "Does watermarking reduce image quality?", answer: "No, the original image quality is preserved. The watermark is applied as an additional layer without recompressing the base image. Output is saved as PNG to maintain quality." },
    ],
  },
  "bulk-pdf-data-extractor": {
    instructions: [
      { title: "1. Upload PDFs", desc: "Select multiple PDF files containing tables, forms, or structured data. Supports up to 100 files per batch." },
      { title: "2. Select Extraction Mode", desc: "Choose between table extraction, form field extraction, or key-value pair extraction based on your document type." },
      { title: "3. Export as CSV", desc: "All extracted data is aggregated into a single CSV file. Download and open in Excel or Google Sheets." },
    ],
    faqs: [
      { question: "What types of PDF data can be extracted?", answer: "The tool extracts tables (with rows and columns), form fields (filled input fields, checkboxes, dropdowns), and key-value pairs (labels with associated values like Invoice #: 12345)." },
      { question: "Are scanned PDFs supported?", answer: "Yes, if your PDF contains scanned images, the tool can use OCR to extract text. For best results, use digitally-created PDFs rather than scanned documents." },
      { question: "How is the data exported?", answer: "All extracted data is compiled into a single CSV file with consistent column headers across all documents. This makes it easy to analyze in spreadsheet software or import into databases." },
    ],
  },
  "bulk-image-to-pdf": {
    instructions: [
      { title: "1. Upload Images", desc: "Select multiple JPEG, PNG, or WebP images. They'll be combined into a single multi-page PDF." },
      { title: "2. Configure Layout", desc: "Choose page size (A4, Letter, etc.), orientation (portrait/landscape), and image fit mode." },
      { title: "3. Download PDF", desc: "Your multi-page PDF is ready for download. Each image becomes one page in the document." },
    ],
    faqs: [
      { question: "How many images can I combine into one PDF?", answer: "Free users can combine up to 20 images. Pro users can combine hundreds of images. The resulting PDF is generated entirely in your browser." },
      { question: "Will I lose image quality in the PDF?", answer: "No. Images are embedded at their full resolution in the PDF. You can also choose compression level to balance file size and quality." },
      { question: "Can I rearrange the order of images?", answer: "Yes, you can drag and drop to reorder images before generating the PDF. The first image becomes page 1, and so on." },
    ],
  },
  "bulk-audio-converter": {
    instructions: [
      { title: "1. Upload Audio Files", desc: "Select multiple audio files in any supported format (MP3, WAV, OGG, FLAC, M4A, AAC)." },
      { title: "2. Choose Output Format", desc: "Select your target format. All files will be converted to the same output format with consistent settings." },
      { title: "3. Download Converted Files", desc: "All converted audio files are packaged in a ZIP archive. Processing uses FFmpeg WASM in your browser." },
    ],
    faqs: [
      { question: "What audio formats can I convert between?", answer: "Supported formats include MP3, WAV, OGG, FLAC, M4A, and AAC. You can convert any input format to any output format." },
      { question: "Can I adjust audio quality settings?", answer: "Yes, you can set bitrate, sample rate, and channels for the output files. Higher bitrates preserve more quality but produce larger files." },
      { question: "How long does bulk conversion take?", answer: "Conversion speed depends on file sizes and your device. Short audio clips convert in seconds. Longer files (30+ minutes) take a few minutes since FFmpeg processing is CPU-intensive." },
    ],
  },
  "bulk-svg-to-png": {
    instructions: [
      { title: "1. Upload SVG Files", desc: "Select multiple SVG vector files from your device. Thumbnails show a preview of each file." },
      { title: "2. Set Output Resolution", desc: "Choose the output resolution (scale or specific pixel dimensions). Higher DPI produces sharper PNGs." },
      { title: "3. Download PNGs", desc: "All converted PNG images are packaged in a ZIP archive. Each file keeps its original name with a .png extension." },
    ],
    faqs: [
      { question: "Why convert SVG to PNG?", answer: "SVG is a vector format ideal for logos, icons, and illustrations. PNG is a raster format required by many platforms, email clients, and graphic design software that don't support SVG." },
      { question: "Do I lose quality when converting SVG to PNG?", answer: "SVGs are resolution-independent vectors. When converting to PNG at high resolution, the result can be crisp and sharp. We recommend 2x or 3x resolution for Retina/HiDPI displays." },
      { question: "Can I convert multiple SVGs at different sizes?", answer: "Yes, all SVGs in a batch use the same output resolution. For different sizes, run separate batches with different resolution settings." },
    ],
  },
  "bulk-image-compressor": {
    instructions: [
      { title: "1. Upload Images", desc: "Select JPG, PNG, or WebP images. You'll see file sizes before compression." },
      { title: "2. Adjust Quality", desc: "Use the quality slider to control the compression level. Lower quality = smaller files. A preview shows the estimated result." },
      { title: "3. Download All", desc: "All compressed images are saved in a ZIP archive. Click individual images to download them separately." },
    ],
    faqs: [
      { question: "How much can bulk image compression reduce file size?", answer: "Typical compression reduces file sizes by 40-80%. JPEG images compress well at 60-80% quality. PNG compression removes unused colors and optimizes palettes. WebP compression is most efficient, often reducing size by 30-50% over JPEG." },
      { question: "What's the difference between compress and resize?", answer: "Compression reduces file size by lowering image quality (JPEG) or optimizing color data (PNG/WebP). Resizing changes pixel dimensions. For the smallest file size, compress first, then resize if needed." },
      { question: "Is bulk image compression safe for copyrighted images?", answer: "Yes. All processing happens entirely in your browser — your images never leave your device. No server upload means complete privacy for sensitive or copyrighted images." },
    ],
  },
  "bulk-pdf-size-reducer": {
    instructions: [
      { title: "1. Upload PDFs", desc: "Select multiple PDF files. The tool shows each file's current size." },
      { title: "2. Choose Compression Level", desc: "Select from Maximum, Balanced, or High Quality compression tiers." },
      { title: "3. Download Reduced PDFs", desc: "Compressed PDFs are saved individually or as a ZIP archive. Processing is 100% local." },
    ],
    faqs: [
      { question: "How much can PDF file size be reduced?", answer: "Typical reduction ranges from 40-90%. Image-heavy PDFs compress the most. Text-only PDFs see smaller reductions since the text content is already compact." },
      { question: "Does PDF compression affect text readability?", answer: "Text remains fully readable at all compression tiers since it's stored as text vectors, not images. Only embedded images are affected. Choose High Quality for maximum visual fidelity." },
      { question: "Can I process scanned PDFs?", answer: "Yes, but scanned PDFs contain images of text rather than digital text. Compression reduces the image quality to shrink file size. For best results, use OCR to convert scanned content first." },
    ],
  },
  "bulk-image-resizer": {
    instructions: [
      { title: "1. Upload Images", desc: "Select multiple images to resize. Shows dimensions and file sizes for each." },
      { title: "2. Set Dimensions", desc: "Choose exact pixel dimensions, a percentage scale, or a preset (Instagram, Twitter, etc.)." },
      { title: "3. Download All", desc: "All resized images are packaged in a ZIP archive. Each image keeps its original format." },
    ],
    faqs: [
      { question: "What resize modes are available?", answer: "You can resize by exact dimensions (width × height), by percentage (e.g., 50% of original), or by social media presets (Instagram 1080×1080, Twitter header 1500×500, etc.)." },
      { question: "Does resizing reduce image quality?", answer: "Resizing to smaller dimensions can reduce perceived sharpness. We recommend using 'high quality' resampling. Resizing to larger dimensions (upscaling) may cause blurriness as the tool is filling in pixels." },
      { question: "Can I maintain aspect ratio?", answer: "Yes, by default the tool maintains aspect ratio. You can disable this to force exact dimensions, which may stretch or crop the image." },
    ],
  },
  "bulk-video-compressor": {
    instructions: [
      { title: "1. Upload Videos", desc: "Select multiple MP4, MOV, or WebM video files. File sizes and durations are shown." },
      { title: "2. Set Compression Settings", desc: "Choose CRF value (lower = higher quality), target resolution, and codec. Presets available for web, email, and archive." },
      { title: "3. Process & Download", desc: "Videos are compressed one at a time using FFmpeg WASM. Download individual files or all at once." },
    ],
    faqs: [
      { question: "What video formats are supported?", answer: "Input formats include MP4 (H.264/H.265), MOV, WebM, AVI, and MKV. Output is always MP4 (H.264) for maximum compatibility." },
      { question: "How long does bulk video compression take?", answer: "Video compression is CPU-intensive and depends on file size, duration, resolution, and your device's processing power. A 100MB video typically takes 1-3 minutes. Files are processed sequentially, not in parallel." },
      { question: "What CRF value should I use?", answer: "CRF 23 is the default (good balance). Lower values (18-22) produce higher quality but larger files. Higher values (24-28) produce smaller files with more compression artifacts. For web uploads, try CRF 28. For archiving, use CRF 18." },
    ],
  },
  "bulk-pdf-merger": {
    instructions: [
      { title: "1. Upload PDFs", desc: "Select multiple PDF files in the order you want them merged." },
      { title: "2. Reorder (Optional)", desc: "Drag and drop to rearrange pages before merging." },
      { title: "3. Download Merged PDF", desc: "All PDFs are combined into a single document. Download the result instantly." },
    ],
    faqs: [
      { question: "How many PDFs can I merge at once?", answer: "Free users can merge up to 10 PDFs. Pro users can merge up to 100 PDFs. There is no limit on individual file size." },
      { question: "Does merging preserve bookmarks and hyperlinks?", answer: "Yes, bookmarks, hyperlinks, and internal references from the original PDFs are preserved in the merged document when possible." },
      { question: "Can I select specific pages from each PDF?", answer: "The current version merges entire PDFs. For page-level selection, use the PDF Splitter tool first, then merge the extracted pages." },
    ],
  },
  "bulk-face-anonymizer": {
    instructions: [
      { title: "1. Upload Images", desc: "Select multiple photos containing faces. Works best with front-facing, well-lit photos." },
      { title: "2. Choose Anonymization Method", desc: "Select blur, pixelate, or overlay for detected faces. Adjust the intensity as needed." },
      { title: "3. Download Processed Images", desc: "All anonymized images are saved as PNG in a ZIP archive. Original images are never modified on your device." },
    ],
    faqs: [
      { question: "How accurate is the face detection?", answer: "The tool uses TensorFlow.js for on-device face detection. It works well on front-facing and profile photos with adequate lighting. Accuracy decreases with extreme angles, heavy shadows, or very small faces." },
      { question: "Are processed images stored anywhere?", answer: "No. All processing happens entirely in your browser using TensorFlow.js. Your images are never uploaded to any server. The original and processed images only exist in your browser's memory." },
      { question: "Can I process video frames?", answer: "The current version processes static images only. For video face blurring, consider using a dedicated video anonymization tool." },
    ],
  },
  "bulk-pdf-form-extractor": {
    instructions: [
      { title: "1. Upload PDF Forms", desc: "Select multiple PDF files with fillable form fields. All forms should have the same field structure." },
      { title: "2. Map Fields", desc: "The tool auto-detects form fields. Review and confirm the field mapping before extraction." },
      { title: "3. Export to CSV", desc: "All form responses are aggregated into a single CSV file with columns matching the form fields." },
    ],
    faqs: [
      { question: "What types of PDF forms are supported?", answer: "The tool supports AcroForm and XFA forms. Both digitally created forms and those with manual fill-in fields are supported." },
      { question: "Do all PDFs need to have the same form structure?", answer: "Yes, for accurate extraction all PDFs should have identical form field names. Slight variations may cause misaligned data in the CSV output." },
      { question: "Can I extract data from scanned form images?", answer: "No, scanned form images without digital form fields are not supported. Use the bulk OCR tool to digitize scanned forms first." },
    ],
  },
  "bulk-video-size-reducer": {
    instructions: [
      { title: "1. Upload Videos", desc: "Select multiple video files. The tool shows current file sizes." },
      { title: "2. Set Target Size", desc: "Choose a target file size (e.g., 10MB, 25MB, 50MB for email attachments) or a target resolution." },
      { title: "3. Process & Download", desc: "Videos are compressed to fit your target size. Download individual files or as a ZIP archive." },
    ],
    faqs: [
      { question: "What's the difference between Video Compressor and Video Size Reducer?", answer: "Video Compressor gives you CRF quality control for consistent quality. Video Size Reducer works toward a specific file size target, automatically adjusting quality and resolution to hit that target." },
      { question: "What target sizes work best for email?", answer: "For email attachments, aim for under 25MB per file. 10MB is safe for most email providers. Outlook limits attachments to 20MB, Gmail to 25MB." },
      { question: "Does reducing video size affect quality significantly?", answer: "The tool balances file size and quality automatically. For moderate size reductions (e.g., 100MB to 25MB), quality loss is minimal. For extreme reductions, you may notice reduced resolution and compression artifacts." },
    ],
  },
  "bulk-audio-normalizer": {
    instructions: [
      { title: "1. Upload Audio Files", desc: "Select multiple audio files to normalize. Supports MP3, WAV, FLAC, OGG, and M4A." },
      { title: "2. Set Target Level", desc: "Choose your target loudness. Broadcast standard is -14 LUFS (integrated). Music typically targets -16 to -10 LUFS depending on genre." },
      { title: "3. Download Normalized Files", desc: "All normalized audio files are packaged in a ZIP archive. Each file maintains its original format." },
    ],
    faqs: [
      { question: "What is LUFS normalization?", answer: "LUFS (Loudness Units relative to Full Scale) is the international standard for measuring perceived loudness. Normalization adjusts audio to a consistent loudness level, preventing sudden volume changes between tracks." },
      { question: "What target LUFS should I use?", answer: "For podcasts and broadcast, use -14 LUFS (ITU-R BS.1770 standard). For music streaming, -14 to -10 LUFS is common. For YouTube, -14 LUFS is recommended. For Spotify, -14 LUFS." },
      { question: "Does normalization affect dynamic range?", answer: "Normalization adjusts overall loudness without compressing dynamics. It's different from compression. Your audio's dynamic range (quiet-to-loud ratio) is preserved." },
    ],
  },
  "bulk-video-subtitle-burner": {
    instructions: [
      { title: "1. Upload Videos and Subtitles", desc: "Select video files and matching SRT or VTT subtitle files. File names should match for auto-matching." },
      { title: "2. Customize Appearance", desc: "Choose font, size, color, and position for burned-in subtitles. Preview before processing." },
      { title: "3. Process & Download", desc: "Subtitles are burned directly into the video stream. Download processed videos as a ZIP archive." },
    ],
    faqs: [
      { question: "What subtitle formats are supported?", answer: "SRT (SubRip) and VTT (WebVTT) subtitle formats are supported. SRT is the most common format for video subtitles." },
      { question: "Does burning subtitles reduce video quality?", answer: "No, the video is re-encoded with subtitles embedded. Using the same quality settings as the source, there should be no visible quality loss." },
      { question: "Can I match subtitles to videos automatically?", answer: "The tool attempts to match subtitle and video files by filename. For example, 'video1.mp4' matches 'video1.srt'. Files without matches can be paired manually." },
    ],
  },
  "bulk-invoice-receipt-parser": {
    instructions: [
      { title: "1. Upload Invoices or Receipts", desc: "Upload PDF or image files of invoices and receipts. The tool auto-detects document type." },
      { title: "2. Review Extracted Data", desc: "The tool extracts date, vendor, amount, tax, and line items. Review and correct any misreads." },
      { title: "3. Export to CSV", desc: "All extracted data is compiled into a CSV file for accounting software or spreadsheet analysis." },
    ],
    faqs: [
      { question: "What data fields are extracted from invoices?", answer: "The parser extracts vendor name, invoice date, invoice number, total amount, subtotal, tax amount, currency, line items (description, quantity, unit price), and payment terms." },
      { question: "Can I process multi-page invoices?", answer: "Yes, multi-page PDF invoices are fully supported. The tool processes all pages and aggregates extracted data." },
      { question: "How accurate is the OCR for handwritten receipts?", answer: "OCR accuracy depends on handwriting legibility. Printed receipts and typed invoices have high accuracy (95%+). Handwritten content varies — clear block letters work best." },
    ],
  },
  "bulk-csv-excel-to-json": {
    instructions: [
      { title: "1. Upload Files", desc: "Select CSV or Excel (.xlsx, .xls) files. Multiple files can be uploaded at once." },
      { title: "2. Configure Mapping", desc: "Review column mapping. Choose whether to merge all files into one JSON or keep them separate." },
      { title: "3. Download JSON", desc: "The converted data is ready as formatted JSON. Download individual files or all as a ZIP archive." },
    ],
    faqs: [
      { question: "Does the tool handle nested data structures?", answer: "CSV/Excel data is inherently flat (rows and columns). For nested data, use the JSON tools to restructure after conversion. Header rows become JSON keys, data rows become JSON objects." },
      { question: "Can I convert to both array and object formats?", answer: "Yes, you can choose between JSON array format (array of objects) and keyed object format (object with ID-based keys)." },
      { question: "What if my CSV has inconsistent columns?", answer: "The tool handles inconsistent columns by using the union of all column headers across files. Missing values are set to null in the JSON output." },
    ],
  },
  "bulk-url-status-checker": {
    instructions: [
      { title: "1. Enter URLs", desc: "Paste or upload a list of URLs (one per line) or upload a CSV file with URLs." },
      { title: "2. Run Check", desc: "Click 'Check URLs' to start scanning. Progress shows real-time status for each URL." },
      { title: "3. Export Results", desc: "Results are displayed in a table with status codes, response times, and page titles. Export as CSV." },
    ],
    faqs: [
      { question: "How many URLs can I check at once?", answer: "Free users can check up to 50 URLs. Pro users can check up to 5,000 URLs. Rate limiting is applied to prevent overwhelming target servers." },
      { question: "What HTTP status codes does the tool detect?", answer: "The tool detects all standard HTTP status codes: 2xx (success), 3xx (redirect), 4xx (client error), 5xx (server error). It also flags timeout errors and DNS resolution failures." },
      { question: "Does the tool check mobile responsiveness?", answer: "The tool checks HTTP status, response time, and page title. For mobile responsiveness testing, use a dedicated mobile testing tool." },
    ],
  },
  "bulk-webp-avif-modernizer": {
    instructions: [
      { title: "1. Upload Images", desc: "Select image files in any common format (JPEG, PNG, WebP). They will be converted to WebP or AVIF." },
      { title: "2. Choose Output Format", desc: "Select WebP or AVIF as your target format. AVIF offers better compression, WebP offers broader browser support." },
      { title: "3. Download Converted Images", desc: "All converted images are saved in a ZIP archive. Directory structure from upload is preserved." },
    ],
    faqs: [
      { question: "Why convert to WebP or AVIF?", answer: "WebP and AVIF are next-gen image formats that provide 25-50% better compression than JPEG at the same quality. This means faster page loads, lower bandwidth usage, and better Core Web Vitals scores." },
      { question: "Which format should I choose: WebP or AVIF?", answer: "WebP is supported in all modern browsers (95%+ market share). AVIF offers better compression (20% smaller than WebP) but has slightly lower browser support (90%+). For maximum compatibility, use WebP." },
      { question: "Does the tool preserve metadata?", answer: "By default, EXIF metadata is stripped for privacy and smaller file sizes. You can optionally preserve copyright and orientation metadata." },
    ],
  },
  "bulk-exif-stripper-injector": {
    instructions: [
      { title: "1. Upload Images", desc: "Select images to strip or inject EXIF metadata. Supports JPEG and TIFF formats." },
      { title: "2. Choose Mode", desc: "Select 'Strip' to remove all metadata, or 'Inject' to add custom copyright, author, and contact info." },
      { title: "3. Download Processed Images", desc: "Processed images are saved in a ZIP archive. Stripped images retain full visual quality." },
    ],
    faqs: [
      { question: "What metadata is removed when stripping EXIF?", answer: "All EXIF data is removed including GPS location, camera make/model, timestamp, serial numbers, software info, and thumbnails. Only the image data itself is preserved." },
      { question: "Why would I strip EXIF data?", answer: "Privacy is the main reason. Photos taken on smartphones contain GPS coordinates, device serial numbers, and timestamps. Stripping this data protects your location and identity when sharing images online." },
      { question: "What metadata can I inject?", answer: "You can inject copyright notices, author name, creator contact info, description, keywords/tags, and usage rights. This is useful for photographers and content creators to protect their work." },
    ],
  },
  "bulk-app-icon-generator": {
    instructions: [
      { title: "1. Upload Source Icon", desc: "Upload a high-resolution SVG or PNG image. A single source image generates all required icon sizes." },
      { title: "2. Select Platforms", desc: "Choose target platforms: iOS, Android, PWA, macOS, Windows, and social media. Each platform has its own required sizes." },
      { title: "3. Download All Icons", desc: "All generated icons are organized by platform in a ZIP archive, ready to drop into your project." },
    ],
    faqs: [
      { question: "What icon sizes are generated?", answer: "iOS requires 16 sizes from 40×40 to 1024×1024. Android requires 8 sizes including adaptive icons. PWAs require 192×192 and 512×512. Social media platforms have their own specific size requirements." },
      { question: "Can I generate icons for iOS and Android from the same source?", answer: "Yes, the tool generates platform-specific icons from a single source image. iOS icons use rounded corners automatically. Android adaptive icons use the foreground/background layers." },
      { question: "What file format should my source image be?", answer: "SVG is preferred as it's resolution-independent, giving the sharpest results at all sizes. If using PNG, provide at least 1024×1024 pixels for best downscaling quality." },
    ],
  },
  "bulk-markdown-to-pdf-html": {
    instructions: [
      { title: "1. Upload Markdown Files", desc: "Select multiple .md files. They will be converted to styled PDF or HTML." },
      { title: "2. Choose Output Format", desc: "Select PDF for printable documents or HTML for web publishing. Apply custom CSS if needed." },
      { title: "3. Download Converted Files", desc: "All converted files are saved in a ZIP archive. PDFs include auto-generated table of contents." },
    ],
    faqs: [
      { question: "What Markdown features are supported?", answer: "Full GFM (GitHub Flavored Markdown) support including headings, lists, tables, code blocks with syntax highlighting, images, links, blockquotes, and inline formatting." },
      { question: "Can I apply custom styling?", answer: "Yes, you can provide custom CSS to style the output. For HTML output, your CSS is embedded directly. For PDF, the CSS is applied during conversion." },
      { question: "Are images in Markdown files preserved?", answer: "External images (URLs) are preserved. Local image references (file:// paths) are converted to embedded base64 data for standalone documents." },
    ],
  },
  "bulk-font-subsetter": {
    instructions: [
      { title: "1. Upload Fonts", desc: "Select TTF or OTF font files to convert and subset." },
      { title: "2. Enter Characters", desc: "Enter the specific characters your project uses. Only these characters will be kept in the subset." },
      { title: "3. Download Subset Fonts", desc: "Subset fonts are saved as WOFF2 (default) or TTF. File sizes are dramatically reduced." },
    ],
    faqs: [
      { question: "How much can font subsetting reduce file size?", answer: "A full font file (50-200KB) can be reduced to 2-15KB when subset to only the characters used on your website. This is one of the most impactful optimizations for web performance." },
      { question: "What format are the output fonts?", answer: "Default output format is WOFF2, the most efficient web font format. You can also choose TTF for desktop use and WOFF for legacy browser support." },
      { question: "Can I subset multiple fonts at once?", answer: "Yes, upload multiple font files and enter the character set once. All fonts are subset to the same character set, perfect for font families." },
    ],
  },
  "bulk-subtitle-time-shifter": {
    instructions: [
      { title: "1. Upload Subtitle Files", desc: "Select multiple SRT or VTT subtitle files to adjust timing." },
      { title: "2. Set Time Offset", desc: "Enter the offset in seconds (positive to delay, negative to advance). Supports milliseconds for fine adjustment." },
      { title: "3. Download Adjusted Subtitles", desc: "All adjusted subtitle files are saved in a ZIP archive. Original formatting is preserved." },
    ],
    faqs: [
      { question: "Why do subtitles need time shifting?", answer: "Subtitles often go out of sync due to frame rate differences, video edits (added/removed scenes), or different release versions of the same content." },
      { question: "Can I shift different subtitles by different amounts?", answer: "The current bulk mode applies the same offset to all uploaded files. For different offsets, process each group separately." },
      { question: "What subtitle formats are supported?", answer: "SRT (SubRip) and VTT (WebVTT) formats are supported. Both use standard timecode format (HH:MM:SS,mmm) that can be precisely adjusted." },
    ],
  },
  "bulk-regex-extractor-replacer": {
    instructions: [
      { title: "1. Upload Files", desc: "Select text, code, or log files to search or replace content using regular expressions." },
      { title: "2. Enter Pattern", desc: "Enter your regex pattern. Choose between extraction (find all matches) or replacement (find and replace)." },
      { title: "3. Download Results", desc: "Extracted matches are saved to a single file. Replaced files are saved individually in a ZIP archive." },
    ],
    faqs: [
      { question: "What regex syntax is supported?", answer: "JavaScript RegExp syntax is supported including flags (g, i, m, s, u). Features include capture groups, lookahead/lookbehind, character classes, and quantifiers." },
      { question: "Can I preview matches before processing?", answer: "Yes, the tool shows a preview of matched lines before you confirm the operation. This helps verify your regex pattern is correct." },
      { question: "What file types can I process?", answer: "Plain text files (.txt, .md, .csv, .log, .json, .xml, .yaml), code files (.js, .ts, .py, .java, .html, .css, .sql), and any other text-based format." },
    ],
  },
  "bulk-image-to-text-ocr": {
    instructions: [
      { title: "1. Upload Images", desc: "Select scanned images, photos of documents, or PDF pages containing text." },
      { title: "2. Choose Language", desc: "Select the document language for optimal OCR accuracy. Multiple languages can be selected." },
      { title: "3. Export Results", desc: "Extracted text is compiled into a single document. Download as TXT, DOCX, or PDF." },
    ],
    faqs: [
      { question: "What languages does OCR support?", answer: "Tesseract.js supports 100+ languages including English, Spanish, French, German, Chinese, Japanese, Arabic, Hindi, and more. Multi-language documents can process multiple languages simultaneously." },
      { question: "How accurate is browser-based OCR?", answer: "Accuracy depends on image quality, resolution, and text clarity. High-resolution scans of printed documents achieve 95%+ accuracy. Handwritten text has lower accuracy (50-80%)." },
      { question: "Can I extract text from PDFs directly?", answer: "Yes, PDF pages are converted to images for OCR processing. For best results, use high-resolution PDFs. Digitally-created PDFs (not scanned) should use PDF text extraction instead of OCR." },
    ],
  },
  "bulk-ebook-converter": {
    instructions: [
      { title: "1. Upload E-Books", desc: "Select EPUB, MOBI, or PDF e-books. Multiple files can be uploaded at once." },
      { title: "2. Choose Output Format", desc: "Select EPUB (most readers), MOBI (Kindle), or PDF (universal)." },
      { title: "3. Download Converted Books", desc: "Converted e-books are saved in a ZIP archive. Metadata and cover images are preserved." },
    ],
    faqs: [
      { question: "Does conversion preserve bookmarks and metadata?", answer: "Yes, the tool preserves metadata (title, author, ISBN), cover images, table of contents, and internal bookmarks whenever the output format supports them." },
      { question: "Can I convert DRM-protected e-books?", answer: "No, DRM-protected e-books from Kindle Store, Apple Books, or Google Play cannot be converted. Remove DRM first using authorized tools." },
      { question: "What's the difference between EPUB and MOBI?", answer: "EPUB is the industry standard format supported by most readers (Apple Books, Google Play, Kobo). MOBI is Amazon's older format for older Kindles. Newer Kindles support both MOBI and EPUB. EPUB is recommended for broad compatibility." },
    ],
  },
  "bulk-heic-to-jpg": {
    instructions: [
      { title: "1. Upload HEIC Photos", desc: "Select HEIC images from your iPhone or iPad. The tool shows thumbnails of detected files." },
      { title: "2. Configure Output", desc: "Choose JPEG output quality (higher = better quality, larger file)." },
      { title: "3. Download JPGs", desc: "All converted JPG images are saved in a ZIP archive. File names are preserved from the original HEIC files." },
    ],
    faqs: [
      { question: "Why convert HEIC to JPG?", answer: "HEIC/HEIF is Apple's default photo format on iOS. While efficient, it's not supported by Windows, many web platforms, social media, or older software. JPG is the universal image format." },
      { question: "Do I lose quality converting HEIC to JPG?", answer: "HEIC uses more advanced compression than JPEG. There is some quality loss during conversion, but at high quality settings (90%+), the difference is imperceptible to most users." },
      { question: "How many HEIC photos can I convert at once?", answer: "Free users can convert up to 20 photos. Pro users can convert unlimited photos. Conversion uses libheif WASM in your browser." },
    ],
  },
};

// ─── Inject into tools.ts ──────────────────────────────────────────────────

const content = fs.readFileSync(TOOLS_PATH, "utf-8");
let result = content;
let count = 0;

for (const [slug, seo] of Object.entries(BULK_CONTENT)) {
  // Find the entry by slug
  const slugPattern = new RegExp(`(slug:\\s*['"]${slug}['"])`);
  const slugMatch = slugPattern.exec(result);
  if (!slugMatch) {
    console.error(`  NOT FOUND: ${slug}`);
    continue;
  }

  // Find the } that closes this entry
  const entryStart = result.lastIndexOf("{", slugMatch.index);
  if (entryStart === -1) continue;

  // Navigate to find the fields after dependencies
  // Build the injection text
  const instructionsJSON = JSON.stringify(seo.instructions).replace(/^{/, "[").replace(/}$/, "]");
  // Actually, JSON.stringify gives us array already
  let instStr = JSON.stringify(seo.instructions, null, 6);
  instStr = instStr.replace(/^\[/, "[\n");
  instStr = instStr.replace(/\]$/, "\n    ]");

  const faqsStr = JSON.stringify(seo.faqs, null, 6)
    .replace(/^\[/, "[\n")
    .replace(/\]$/, "\n    ]");

  const injection = `\n    instructions: ${instStr},
    faqs: ${faqsStr},`;

  // Find the closing } of this entry
  const entryText = result.slice(entryStart);
  let braceDepth = 0;
  let closeIdx = 0;
  for (let i = 0; i < entryText.length; i++) {
    if (entryText[i] === "{") braceDepth++;
    if (entryText[i] === "}") {
      braceDepth--;
      if (braceDepth === 0) { closeIdx = entryStart + i; break; }
    }
  }

  if (closeIdx === 0) continue;

  // Insert before the final }}
  const beforeClose = result.slice(entryStart, closeIdx);
  const afterClose = result.slice(closeIdx);

  // Check if faqs already exist in this entry
  if (beforeClose.includes("faqs:")) continue;

  result = result.slice(0, closeIdx) + injection + afterClose;
  count++;
}

fs.writeFileSync(TOOLS_PATH, result, "utf-8");
console.log(`Injected SEO content for ${count}/${Object.keys(BULK_CONTENT).length} bulk tools.`);
