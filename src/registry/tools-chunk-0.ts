import type { ToolMetadata } from './tools-types';

export const entries_chunk_0: ToolMetadata[] = [
  {
    id: "add-text-1",
    name: "Add Text to Photo",
    description: 'Overlays custom text captions onto images with control over font, size, color, alignment, opacity, and rotation angle. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Add Text to Photo — Overlays custom text captions onto images with control over font, size, color, alignment, opacity, and rotation angle. ',
    category: "Image",
    slug: "add-text-to-photo",
    dependencies: "Canvas API",
  },
  {
    id: "batch-edit-1",
    name: "Batch Image Editor",
    description: 'Applies resize, crop, rotate, format conversion, and compression settings to dozens of images simultaneously with one click. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Batch Image Editor — Applies resize, crop, rotate, format conversion, and compression settings to dozens of images simultaneously with one click. ',
    category: "Image",
    slug: "batch-image-editor",
    dependencies: "Canvas API, jszip",
    isPro: true,
  },
  {
    id: "vid-mp3-1",
    name: "Video to MP3 Converter",
    description: 'Extracts the audio track from uploaded video files (MP4, MOV, AVI, WebM) and encodes it as a high-quality MP3 file. No signup or account required.',
    seoDescription: 'Free online Video to MP3 Converter — Extracts the audio track from uploaded video files (MP4, MOV, AVI, WebM) and encodes it as a high-quality MP3 file. ',
    category: "Video",
    slug: "video-to-mp3",
    dependencies: "ffmpeg",
  },
  {
    id: "vid-crop-1",
    name: "Crop Video",
    description: "Crop the visual area of your MP4 video entirely in the browser. No signup or account required.",
    seoDescription: 'Free online Crop Video — Crop the visual area of your MP4 video entirely in the browser. ',
    category: "Video",
    slug: "crop-video",
    dependencies: "ffmpeg",
  },
  {
    id: "dev-json-xml-1",
    name: "JSON to XML",
    description: 'Converts JSON files to XML format — APIs, configuration files, and data exchange between web services to enterprise systems, SOAP APIs, document formats like DOCX and SVG. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online JSON to XML — Transforms valid JSON documents into well-formed XML using customizable root-element naming and array-handling rules. ',
    category: "Converter",
    slug: "json-to-xml",
    dependencies: "xml2js",
    showInCategory: false,
  },
  {
    id: "time-conv-1",
    name: "Time Converter",
    description: 'Convert between time units including seconds, minutes, hours, days, weeks, months, and years with precise decimal results. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Time Converter — Convert between time units including seconds, minutes, hours, days, weeks, months, and years with precise decimal results. ',
    category: "Developer",
    slug: "time-converter",
    dependencies: "None",
  },
  {
    id: "du-1",
    name: "Random Port Generator",
    slug: "random-port-generator",
    category: "Developer",
    description: 'Generate random TCP/UDP port numbers from well-known, registered, or dynamic ranges. Useful for network testing, Docker port mapping, and firewall configuration.',
    seoDescription: 'Free online Random Port Generator — Generate random TCP/UDP port numbers from well-known, registered, or dynamic ranges. ',
    dependencies: "Vanilla JS",
  },
  {
    id: "du-2",
    name: "Chmod Calculator",
    slug: "chmod-calculator",
    category: "Developer",
    description: 'Convert between numeric (755) and symbolic (u=rwx,g=rx,o=rx) chmod permission formats. See detailed breakdown for owner, group, and others.',
    seoDescription: 'Free online Chmod Calculator — Convert between numeric and symbolic chmod permission formats with detailed breakdown. ',
    dependencies: "Vanilla JS",
  },
  {
    id: "du-3",
    name: "Docker Run to Compose Converter",
    slug: "docker-run-to-compose",
    category: "Developer",
    description: 'Convert docker run commands to docker-compose.yml format. Supports ports, volumes, environment variables, networks, restart policies, and container names.',
    seoDescription: 'Free online Docker Run to Compose Converter — Convert docker run commands to docker-compose.yml format. ',
    dependencies: "Vanilla JS",
  },
  {
    id: "du-4",
    name: "Email Normalizer",
    slug: "email-normalizer",
    category: "Developer",
    description: 'Normalize email addresses by removing dots (Gmail), stripping +tags, and lowercasing. Process multiple emails at once for deduplication and cleaning.',
    seoDescription: 'Free online Email Normalizer — Normalize email addresses by removing dots, stripping +tags, and lowercasing. ',
    dependencies: "Vanilla JS",
  },
  {
    id: "arch-conv-1",
    name: "Archive Converter",
    description: "Compress ZIP archives directly in your browser. Upload any file and download a standard ZIP archive — no uploads to servers, no file size limits.",
    seoDescription: 'Free online Archive Converter — Compress ZIP archives directly in your browser. Upload any file and download a standard ZIP archive. ',
    category: "Converter",
    slug: "archive-converter",
    dependencies: "jszip",
  },
  {
    id: "pdf-heic-1",
    name: "HEIC to PDF",
    description: 'Converts HEIC files to PDF format — Apple device photos to document sharing, printing, and archival with consistent formatting. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online HEIC to PDF — Converts High-Efficiency Image Container (HEIC) photos from iPhones and iPads into standard PDF documents. ',
    category: "PDF",
    slug: "heic-to-pdf",
    dependencies: "pdf-lib, heic2any",
    showInCategory: false,
  },
  {
    id: "2",
    name: 'Privacy Cleaner',
    slug: 'privacy-cleaner',
    category: 'Utility',
    description: 'Scans and clears browser cookies, localStorage, sessionStorage, and cached data for the current site. No signup or account required.',
    seoDescription: 'Free online Privacy Cleaner — Scans and clears browser cookies, localStorage, sessionStorage, and cached data for the current site. ',
    dependencies: 'Vanilla JS'
  },
  {
    id: "7",
    name: "AI Translator",
    slug: "ai-translator",
    category: "AI",
    description: 'Detects source language automatically and translates text between 100+ languages using advanced neural machine translation.',
    dependencies: "Google Cloud Translation API",
    seoDescription: 'Free AI translator online — translate text between 100+ languages instantly. Automatic language detection. Uses cloud-based processing.',
  },
  {
    id: "9",
    name: "PDF to Word",
    slug: "pdf-to-word",
    category: "PDF",
    description: 'Extract PDF content into editable DOCX files. Preserves formatting and layout.',
    dependencies: "pdf2docx / PDF.js",
    seoDescription: 'Convert PDF to Word online free — extract PDF content into editable DOCX files. Preserves formatting. 100% client-side, no uploads needed.',
    showInCategory: false
  },
  {
    id: "10",
    name: "AI Image Generator",
    slug: "ai-image-generator",
    category: "AI",
    description: 'Transforms text prompts into high-resolution images using advanced diffusion models. Designers and marketers use it for rapid visual prototyping.',
    dependencies: "Stable Diffusion API",
    seoDescription: 'Generate stunning AI images from text prompts — free online. Turn your ideas into high-resolution visuals instantly. Powered by advanced diffusion models.',
  },
  {
    id: "11",
    name: "Speed Test",
    slug: "speed-test",
    category: "Utility",
    description: 'Measures your internet connection’s download speed and latency by downloading a test file from a CDN. Upload speed is not currently measured.',
    seoDescription: 'Free online Speed Test — Measures your internet connection’s download speed and latency by downloading a test file from a CDN. ',
    dependencies: "Fetch API"
  },
  {
    id: "14",
    name: "Compress Image to 50KB",
    slug: "compress-image-to-50kb",
    category: "Image",
    description: 'Reduces image file size to a specific target — 50 KB, 100 KB, or 200 KB — by automatically adjusting JPEG quality, reducing pixel dimensions, or stripping EXIF metadata. Ideal for government forms, job applications, and upload portals with strict file size limits.',
    seoDescription: 'Free online Compress Image to 50KB — reduce any image to exactly 50 KB, 100 KB, or 200 KB for government forms, job applications, and upload portals with strict limits. ',
    dependencies: "browser-image-compression",
    instructions: [
      { title: "1. Upload Your Image", desc: "Select a JPG or PNG image from your device. The tool works best with photos and scanned documents." },
      { title: "2. Set Your Target Size", desc: "Choose your target: 50 KB, 100 KB, or 200 KB. The compressor automatically adjusts quality and dimensions to hit the target precisely." },
      { title: "3. Download the Result", desc: "Your compressed image is ready instantly. All processing happens locally — your image never leaves your device, keeping sensitive documents private." },
    ],
    faqs: [
      { question: "Why would I need an exact file size?", answer: "Many government portals, job application systems, and university submission forms enforce strict file size limits — often 50 KB, 100 KB, or 200 KB for photos and scanned documents. This tool hits your target automatically." },
      { question: "How is this different from the regular Image Compressor?", answer: "Image Compressor gives you a quality slider with a side-by-side preview — you decide the tradeoff visually. Compress Image to 50KB works toward an exact file size target automatically, prioritizing hitting the size limit over visual tuning." },
      { question: "What happens if my image can't compress to 50 KB?", answer: "The compressor reduces quality progressively and also scales down dimensions if needed. Most photos under 5MB can reach 50 KB. If the result quality is too low, try the 100 KB target or resize your image first with the Image Resizer tool." },
      { question: "Does this work for scanned documents?", answer: "Yes. Scanned documents in JPEG format compress particularly well since they contain large uniform areas. For scanned documents, 50 KB is usually achievable while keeping text readable." },
    ]
  },
  {
    id: "15",
    name: "Currency Converter",
    slug: "currency-converter",
    category: "Finance",
    description: 'Converts between 160+ world currencies using real-time exchange rates sourced from central banks and financial data providers. Uses cloud-based processing.',
    seoDescription: 'Free online Currency Converter — Converts between 160+ world currencies using real-time exchange rates sourced from central banks and financial data providers. ',
    dependencies: "ExchangeRate-API"
  },
  {
    id: "16",
    name: "Logo Maker",
    slug: "logo-maker",
    category: "Branding",
    description: 'Logo Maker provides a drag-and-drop canvas with shape libraries, text tools, and icon collections for building brand logos.',
    dependencies: "Fabric.js / Canvas API",
    seoDescription: 'Free logo maker online — design professional logos with drag-and-drop tools. Choose from shape libraries, icons, and text styles. No design skills needed.',
  },
  {
    id: "pdf-comp-1",
    name: "PDF Compressor",
    description: 'Reduces PDF file size by compressing embedded images, removing redundant metadata, and optimizing object streams. Three compression tiers let you choose between maximum size reduction and high-quality preservation. Handles PDFs up to 50MB.',
    category: "PDF",
    slug: "pdf-compressor",
    dependencies: "Ghostscript / PDF-lib",
    seoDescription: 'Free online PDF Compressor — reduce PDF file size by up to 90% with three compression tiers. Compress embedded images, remove metadata, optimize streams. ',
    instructions: [
      { title: "1. Upload Your PDF", desc: "Drag and drop or select a PDF file up to 50MB. The tool shows the current file size before compression." },
      { title: "2. Choose Compression Tier", desc: "Select from three tiers: Maximum Compression (smallest file, lower image quality), Balanced (good size/quality tradeoff), or High Quality (minimal visual loss)." },
      { title: "3. Download the Compressed PDF", desc: "Your compressed PDF is ready instantly. All processing runs locally — your document never leaves your device, ensuring complete privacy." },
    ],
    faqs: [
      { question: "How much can PDF compression reduce file size?", answer: "Typical reductions range from 40% to 90% depending on content. Image-heavy PDFs (scanned documents, brochures) compress the most. Text-only PDFs compress less since the text content itself is already efficient." },
      { question: "What's the difference between PDF, image, and video compressors?", answer: "PDF Compressor optimizes document files by compressing embedded images, removing metadata, and streamlining internal structures. Image Compressor works on standalone JPG/PNG/WebP files. Video Compressor reduces MP4/MOV/WebM files using video encoding. Each is specialized for its format." },
      { question: "Does compression affect text readability?", answer: "Text within PDFs remains fully readable at all compression tiers since it's stored as text (not images). Only embedded images are affected by compression. For maximum text clarity, choose the High Quality tier." },
      { question: "Is my document data private?", answer: "Yes. All PDF compression happens entirely in your browser. Your document is never uploaded, stored, or transmitted to any server. This is especially important for sensitive documents like contracts, reports, and financial statements." },
    ],
  },
  {
    id: "19",
    name: "Word to PDF",
    slug: "word-to-pdf",
    category: "PDF",
    description: 'Converts .docx and .doc files to PDF while preserving fonts, tables, images, headers, and embedded formatting. Uses cloud-based processing.',
    seoDescription: 'Free online Word to PDF — Converts .docx and .doc files to PDF while preserving fonts, tables, images, headers, and embedded formatting. ',
    dependencies: "LibreOffice API / CloudConvert API",
    showInCategory: false
  },
  {
    id: "21",
    name: "Percentage Calculator",
    slug: "percentage-calculator",
    category: "Calculator",
    description: 'Computes percentage values, percentage increases and decreases, and what-percent-of-what relationships with precise decimal arithmetic. Essential for everyday math — tips, discounts, tax rates, grade scores, and statistical comparisons where quick percentage answers are needed.',
    seoDescription: 'Free online Percentage Calculator — compute percentages, increases, decreases, and what-percent-of-what relationships. Perfect for tips, discounts, taxes, and everyday math. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Choose Your Calculation Type", desc: "Select from three modes: find what percent of Y is X, calculate percentage increase/decrease, or determine what X% of Y equals." },
      { title: "2. Enter Your Numbers", desc: "Type in the values for your calculation. Results update instantly as you type — no button to press." },
      { title: "3. Read Your Result", desc: "The exact percentage is displayed with decimal precision. Copy the result or adjust your inputs for a new calculation." },
    ],
    faqs: [
      { question: "Is this different from the Profit Margin or ROI calculators?", answer: "Yes. Percentage Calculator handles general everyday percentage math — tips, discounts, grade scores, statistics. Profit Margin Calculator focuses on pricing (revenue vs cost). ROI Calculator measures return on investment. Each serves a different business or personal need." },
      { question: "Can I calculate percentage increase over time?", answer: "Yes. Use the increase/decrease mode to compute the percentage change between two values — useful for comparing prices, salaries, or scores across time periods." },
      { question: "Does it handle decimal percentages like 8.5%?", answer: "Yes. The calculator supports decimal percentage values like 8.5%, 12.75%, or 0.5% with precise floating-point arithmetic." },
      { question: "Can I use this for tax calculations?", answer: "Yes. Calculate what a specific tax percentage adds to a purchase price, or work backwards from a total to find the original price before tax." },
    ],
  },
  {
    id: "22",
    name: "JPG to PDF",
    slug: "jpg-to-pdf",
    category: "PDF",
    description: 'Convert JPG images to PDF format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online JPG to PDF — Merges one or more JPG images into a single multi-page PDF file in the order you arrange them. ',
    dependencies: "jsPDF / Canvas API",
    showInCategory: false
  },
  {
    id: "26",
    name: "Age Calculator",
    slug: "age-calculator",
    category: "Calculator",
    description: 'Computes exact age in years, months, days, hours, minutes, and seconds from a given birth date relative to any target date. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Age Calculator — Computes exact age in years, months, days, hours, minutes, and seconds from a given birth date relative to any target date. ',
    dependencies: "Date-fns / Moment.js"
  },
  {
    id: "27",
    name: "HEIC to JPG",
    slug: "heic-to-jpg",
    category: "Image",
    description: 'Convert HEIC images to JPG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online HEIC to JPG — Decodes Apple HEIC photos and converts them to universally compatible JPG files while preserving EXIF metadata like location and camera settings. ',
    dependencies: "heic2any",
    showInCategory: false
  },
  {
    id: "28",
    name: "PDF to JPG",
    slug: "pdf-to-jpg",
    category: "PDF",
    description: 'Convert PDF images to JPG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online PDF to JPG — Renders each PDF page as a high-quality JPG image, preserving layout, fonts, and embedded graphics exactly as they appear. ',
    dependencies: "PDF.js / Canvas API",
    showInCategory: false
  },
  {
    id: "29",
    name: "PDF to PPT",
    slug: "pdf-to-ppt",
    category: "PDF",
    description: 'Converts PDF content—including text, images, and vector graphics—into editable PowerPoint slides with preserved layout structure. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online PDF to PPT — Converts PDF content—including text, images, and vector graphics—into editable PowerPoint slides with preserved layout structure. ',
    dependencies: "pdf2json / PptxGenJS",
    showInCategory: false
  },
  {
    id: "30",
    name: "Fancy Text Generator",
    slug: "fancy-text-generator",
    category: "Text",
    description: 'Creates stylish Unicode text in 40+ decorative font styles including double-struck, bubble, cursive, gothic, and small caps. Perfect for social media bios, gaming usernames, Discord profiles, and Instagram captions where standard fonts will not render.',
    seoDescription: 'Free online Fancy Text Generator — create stylish Unicode text in 40+ decorative font styles including double-struck, bubble, cursive, gothic, and small caps. Perfect for social media bios, gaming usernames, and profile customization. ',
    dependencies: "Unicode mapping",
    instructions: [
      { title: "1. Type or Paste Your Text", desc: "Enter the text you want to transform. The generator instantly shows previews in all 40+ Unicode font styles — no waiting or button clicks." },
      { title: "2. Browse Font Styles", desc: "Scroll through the gallery of styles including double-struck, bubble, cursive, gothic, small caps, fraktur, and monospace. Each style renders your text in real time." },
      { title: "3. Copy and Use Anywhere", desc: "Click any style to copy the transformed text to your clipboard. Use it in social media bios, game profiles, Discord names, Instagram captions, and anywhere that supports Unicode text." },
    ],
    faqs: [
      { question: "How is this different from Font Generator?", answer: "Fancy Text Generator offers 40+ decorative Unicode styles like double-struck (mathematical letters), bubble (circled characters), cursive (script-like), and gothic (fraktur). Font Generator focuses on bold, italic, monospace, and serif/sans-serif variants — more practical for formatting, less decorative." },
      { question: "Will the fancy text display on all devices?", answer: "The decorative Unicode characters render on most modern devices and platforms including iOS, Android, Windows, and macOS. The 40+ styles are chosen for broad Unicode support across social media, messaging apps, and games." },
      { question: "Can I use these for gaming usernames?", answer: "Yes. Many games and platforms (Minecraft, Roblox, Discord, Steam, Epic Games) support Unicode characters, letting you create unique display names that stand out with fancy styling in chat, leaderboards, and profiles." },
      { question: "Does this work on Instagram or Twitter bios?", answer: "Yes. Social media bios support Unicode text, so you can use fancy styles to customize your profile name, bio, highlights, and captions — adding visual flair where the platform only permits plain text entry." },
    ]
  },
  {
    id: "33",
    name: "Background Remover",
    slug: "background-remover",
    category: "Image",
    description: 'Segments the foreground subject from an image using a neural network, producing a transparent PNG. Max 20MB.',
    dependencies: "rembg / OpenCV / TensorFlow.js",
    seoDescription: 'Remove image backgrounds automatically with AI. Coming soon.',
  },
  {
    id: "34",
    name: "WebP to JPG",
    slug: "webp-to-jpg",
    category: "Image",
    description: 'Convert WEBP images to JPG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online WebP to JPG — Converts WebP images into standard JPG format, making them usable in applications and websites that do not support Google\'s modern format. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "34b",
    name: "PNG to JPG",
    slug: "png-to-jpg",
    category: "Image",
    description: 'Convert PNG images to JPG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online PNG to JPG — Convert PNG images into space-efficient JPEG files. Ideal for photographs and complex images where smaller file size outweighs loss of transparency. ',
    dependencies: "Canvas API",
    showInCategory: false
  },
  {
    id: "35",
    name: "Wheel of Names",
    slug: "wheel-of-names",
    category: "Utility",
    description: 'Displays an animated spinning wheel that randomly selects one entry from a customizable list of names or options. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Wheel of Names — Displays an animated spinning wheel that randomly selects one entry from a customizable list of names or options. ',
    dependencies: "Canvas API / GSAP"
  },
  {
    id: "36",
    name: "Image Compressor",
    slug: "image-compressor",
    category: "Image",
    description: 'Reduces JPG, PNG, and WebP file sizes using smart compression with a side-by-side quality preview slider. Balance file size and visual quality visually — max 20MB per image. Perfect for web optimization, email attachments, and social media uploads.',
    dependencies: "HTML5 Canvas / libjpeg-turbo",
    seoDescription: 'Free online Image Compressor — reduce JPG, PNG, and WebP file sizes with a side-by-side quality preview slider. Perfect for web optimization, email, and social media. ',
    instructions: [
      { title: "1. Upload Your Image", desc: "Drag and drop a JPG, PNG, or WebP image up to 20MB. The tool immediately shows the original file size and preview." },
      { title: "2. Adjust Compression Level", desc: "Use the quality slider to find the sweet spot between file size and visual quality. The side-by-side preview helps you compare instantly." },
      { title: "3. Download the Compressed Image", desc: "Once satisfied, download the compressed image. All processing happens locally — no uploads, no server storage, complete privacy." },
    ],
    faqs: [
      { question: "How much can this compress an image?", answer: "Typical compression reduces JPG files by 40-80% and PNG files by 50-90% depending on the quality setting. Complex photographs compress less than simple graphics. Use the preview slider to find the right balance for your use case." },
      { question: "What's the difference between image, PDF, and video compressors?", answer: "Image Compressor works on JPG/PNG/WebP photos and graphics using perceptual quality settings. PDF Compressor targets document files by compressing embedded images and stripping metadata. Video Compressor reduces MP4/MOV/WebM file size using H.264/AV1 encoding. Each is optimized for its media type." },
      { question: "Does compression reduce image quality permanently?", answer: "The compressed image is a new file — your original remains untouched. If the quality is too low, adjust the slider higher and re-download. Lossy compression (JPG, WebP) discards data permanently, so keep your original for archival." },
      { question: "What's the maximum file size?", answer: "The image compressor handles files up to 20MB. For larger images or bulk processing, use the Bulk Image Compressor which supports multiple files simultaneously." },
    ]
  },
  {
    id: "37",
    name: "Object Remover",
    slug: "object-remover",
    category: "Image",
    description: 'Lets you brush over an unwanted object, blemish, or watermark in a photo, then fills the area with contextually plausible pixels. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Object Remover — Lets you brush over an unwanted object, blemish, or watermark in a photo, then fills the area with contextually plausible pixels. ',
    dependencies: "Lama Cleaner"
  },
  {
    id: "38",
    name: "PPT to PDF",
    slug: "ppt-to-pdf",
    category: "PDF",
    description: 'Convert PowerPoint presentations to PDF with accurate slide rendering. Server-side conversion preserves fonts and layouts.',
    seoDescription: 'Free online PPT to PDF — Renders each PowerPoint slide as a page in a single PDF, maintaining embedded fonts, vector graphics, and slide transitions as static layout. ',
    dependencies: "LibreOffice API",
    showInCategory: false
  },
  {
    id: "39",
    name: "Temporary Email Generator",
    slug: "temporary-email-generator",
    category: "Privacy",
    description: 'Creates disposable email inboxes that self-destruct after a user-configurable time limit (5 minutes to 48 hours). Uses cloud-based processing.',
    seoDescription: 'Free online Temporary Email Generator — Creates disposable email inboxes that self-destruct after a user-configurable time limit (5 minutes to 48 hours). ',
    dependencies: "Mailinator API / Custom Backend"
  },
  {
    id: "40",
    name: "Screen Recorder Extension",
    slug: "screen-recorder-extension",
    category: "Extension",
    description: 'Generates a browser extension that captures browser tabs, full screens, or specific application windows with configurable resolution, frame rate. No signup or account required.',
    seoDescription: 'Free online Screen Recorder Extension — Generates a browser extension that captures browser tabs, full screens, or specific application windows with configurable resolution, frame rate. ',
    dependencies: "MediaRecorder API"
  },
  {
    id: "41",
    name: "PDF Merger",
    slug: "pdf-merger",
    category: "PDF",
    description: 'Combines two or more PDF files into one contiguous document with a drag-and-drop reorder interface for the input list. Legal assistants compiling.',
    dependencies: "pdf-lib",
    seoDescription: 'Merge PDF files online free — combine multiple PDFs into one document with drag-and-drop reordering. No uploads, 100% secure and private.',
  },
  {
    id: "42",
    name: "QR Code Generator",
    slug: "qr-code-generator",
    category: "Utility",
    description: 'Renders a scannable QR code from any text or URL using a client-side Reed-Solomon encoder. Download as PNG.',
    dependencies: "qrcode.js",
    seoDescription: 'Free QR code generator online — create QR codes for URLs and text. Download high-resolution PNG. 100% free, no account needed.',
  },
  {
    id: "44",
    name: "Excel to PDF",
    slug: "excel-to-pdf",
    category: "PDF",
    description: 'Converts Excel spreadsheets into properly paginated PDF files, respecting print areas, page orientation, and cell formatting. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Excel to PDF — Converts Excel spreadsheets into properly paginated PDF files, respecting print areas, page orientation, and cell formatting. ',
    dependencies: "SheetJS / jsPDF",
    showInCategory: false
  },
  {
    id: "45",
    name: "EMI Calculator",
    slug: "emi-calculator",
    category: "Calculator",
    description: 'Splits a loan principal into equal monthly installments using the standard reducing-balance formula with configurable annual interest and tenure. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online EMI Calculator — Splits a loan principal into equal monthly installments using the standard reducing-balance formula with configurable annual interest and tenure. ',
    dependencies: "Vanilla JS"
  },
  {
    id: "46",
    name: "Character Counter",
    slug: "character-counter",
    category: "Text",
    description: 'Counts characters with and without spaces and compares your text against platform-specific limits — Twitter/X posts (280), SMS messages (160), SEO meta descriptions (160), Facebook posts (63,206), and LinkedIn summaries (2,600). Real-time counting with space/no-space toggle.',
    seoDescription: 'Free online Character Counter — count characters with and without spaces for Twitter (280), SMS (160), SEO meta descriptions, Facebook, and LinkedIn limits. Real-time counting as you type. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Your Text", desc: "Type or paste the content you want to measure. The character counter updates instantly — no buttons to press or pages to reload." },
      { title: "2. Check Platform Limits", desc: "Each section shows how your text fits into specific platform limits: Twitter (280), SMS (160), SEO meta descriptions (160), Facebook posts (63,206), and LinkedIn (2,600)." },
      { title: "3. Toggle Space Counting", desc: "Use the with/without spaces toggle to match the requirement of your target platform. Some count spaces, others don't — the tool shows both." },
    ],
    faqs: [
      { question: "What character limits does this tool check?", answer: "The character counter shows limits for Twitter/X posts (280 characters), single SMS messages (160), Google meta descriptions (160), Facebook posts (63,206), and LinkedIn headlines (2,600). These cover the most common character-constrained platforms." },
      { question: "What's the difference between Character Counter and Word Counter?", answer: "Character Counter focuses on fitting text into platform-specific space constraints with real-time progress bars for each limit. Word Counter focuses on writing quality — readability scores, grade levels, syllable counts, and speaking time. They complement each other." },
      { question: "Why count characters instead of words?", answer: "Many platforms enforce character limits, not word limits. A tweet can hold up to 280 characters regardless of word count. SMS messages split at 160 characters. Meta descriptions get truncated past 160 characters. Character counting ensures your content stays within each platform's constraint." },
      { question: "Does the count include spaces?", answer: "The tool shows both counts — with spaces and without spaces — because different platforms and submission forms count differently. The toggle lets you switch between views to match the requirement of your target platform." },
    ]
  },
  {
    id: "47",
    name: "Video to Text Transcription",
    slug: "video-to-text-transcription",
    category: "Transcription",
    description: 'Transcribe video audio to text using AI-powered speech recognition. Supports multiple languages and speaker diarization.',
    seoDescription: 'Free online Video to Text Transcription — Video to Text Transcription extracts speech from uploaded video files using on-device speech recognition. ',
    dependencies: "Whisper API"
  },
  {
    id: "48",
    name: "Word Counter",
    slug: "word-counter",
    category: "Text",
    description: 'Analyzes your writing with real-time word count, sentence count, syllable count, paragraphs, and advanced readability metrics — Flesch-Kincaid Reading Ease, Grade Level, estimated speaking time, and keyword density. Essential for writers, students, and SEO professionals optimizing content for readability.',
    dependencies: "Vanilla JS",
    seoDescription: 'Free online Word Counter — analyze writing with real-time word, sentence, syllable, and paragraph counts plus Flesch-Kincaid readability scores, grade level, speaking time, and keyword density. ',
    instructions: [
      { title: "1. Type or Paste Your Content", desc: "Enter your text directly or paste from Word, Google Docs, or any writing app. The dashboard updates in real time as you type or edit." },
      { title: "2. Review Readability & Stats", desc: "The dashboard shows word count, sentence count, syllable count, paragraphs, and advanced metrics including Flesch-Kincaid Grade Level and Reading Ease scores." },
      { title: "3. Optimize Your Writing", desc: "Use the readability insights to adjust your content for your target audience. Aim for a grade level matching your readers — the tool highlights areas for improvement." },
    ],
    faqs: [
      { question: "What readability scores does this tool provide?", answer: "This word counter calculates Flesch-Kincaid Reading Ease (0-100 scale where 60-70 is plain English) and Flesch-Kincaid Grade Level (US school grade equivalent). It also estimates speaking time at 150 words per minute and tracks keyword density for SEO content optimization." },
      { question: "What's the difference between Word Counter and Character Counter?", answer: "Word Counter focuses on writing quality and readability analysis — word/sentence/paragraph counts, syllable counts, grade level, and speaking time. Character Counter focuses on platform-specific character limits like Twitter (280), SMS (160), and meta descriptions (160). Both are useful but serve different purposes." },
      { question: "Can I use this for SEO content?", answer: "Yes. The word counter displays total words, unique words, and keyword density percentages — essential for SEO writing where word counts and readability directly impact search rankings. Use it alongside our SEO tools for comprehensive content optimization." },
      { question: "Does it update in real time?", answer: "Yes. The word counter updates instantly as you type, paste, or delete text. Every keystroke triggers a fresh analysis of all metrics — word count, readability, syllable count, and speaking time." },
    ]
  },
  {
    id: "49",
    name: "Crop Image",
    slug: "crop-image",
    category: "Image",
    description: 'Lets you drag a selection rectangle to crop an image to any pixel dimension, common social-media ratio (1:1, 16:9, 4:5), or exact preset sizes. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Crop Image — Lets you drag a selection rectangle to crop an image to any pixel dimension, common social-media ratio (1:1, 16:9, 4:5), or exact preset sizes.',
    dependencies: "Cropper.js"
  },
  {
    id: "50",
    name: "Social Media Post Maker",
    slug: "social-media-post-maker",
    category: "Branding",
    description: 'Social Media Post Maker offers platform-specific canvas templates and a library of stock graphics for creating social visuals. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Social Media Post Maker — Social Media Post Maker offers platform-specific canvas templates and a library of stock graphics for creating social visuals. ',
    dependencies: "Fabric.js"
  },
  {
    id: "51",
    name: "MKV to MP4",
    slug: "mkv-to-mp4",
    category: "Converter",
    description: 'Convert MKV video files to MP4 format directly in your browser. 100% free, private — your files never leave your device.',
    seoDescription: 'Free online MKV to MP4 — Re-encapsulates MKV video files into the more universally compatible MP4 container without re-encoding the underlying video stream. ',
    dependencies: "FFmpeg",
    showInCategory: false
  },
  {
    id: "52",
    name: "Text to Speech (TTS)",
    slug: "text-to-speech-tts",
    category: "Audio",
    description: "AI voice generator with Indian accents",
    dependencies: "Google Cloud TTS / ElevenLabs",
    seoDescription: 'Free text to speech online with Indian accents — convert text to natural-sounding audio. AI voices in Hindi, Tamil, Telugu, and more. No sign-up needed.',
  },
  {
    id: "53",
    name: "AI Paraphrasing Tool",
    slug: "ai-paraphrasing-tool",
    category: "AI",
    description: 'Rewrite sentences and paragraphs while preserving meaning. Perfect for students, writers, and content creators.',
    dependencies: "HuggingFace",
    seoDescription: 'Free AI paraphrasing tool — rewrite sentences and paragraphs while preserving meaning. Perfect for students, writers, and content creators. ',
  },
  {
    id: "54",
    name: "Random Number Generator",
    slug: "random-number-generator",
    category: "Utility",
    description: 'Generates cryptographically secure random integers or decimals within a user-defined min-max range with optional repetition filtering. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Random Number Generator — Generates cryptographically secure random integers or decimals within a user-defined min-max range with optional repetition filtering. ',
    dependencies: "Math.random()"
  },
  {
    id: "55",
    name: "URL Shortener",
    slug: "url-shortener",
    category: "Branding",
    description: 'Takes any long URL and generates a compact, shareable short link with optional custom alias support. Uses cloud-based processing.',
    seoDescription: 'Free online URL Shortener — Takes any long URL and generates a compact, shareable short link with optional custom alias support. ',
    dependencies: "Node.js / Redis"
  },
  {
    id: "58",
    name: "PDF to Excel",
    slug: "pdf-to-excel",
    category: "PDF",
    description: 'Extract tables from PDF into editable XLSX spreadsheets with accurate column alignment.',
    dependencies: "pdf2json / SheetJS",
    seoDescription: 'Convert PDF to Excel online free — extract tables from PDF into editable XLSX spreadsheets. Accurate column alignment. ',
    showInCategory: false
  },
  {
    id: "59",
    name: "Unlock PDF",
    slug: "unlock-pdf",
    category: "PDF",
    description: 'Removes owner-level password restrictions from PDFs so you can edit, print, or copy content from protected documents. No signup or account required.',
    seoDescription: 'Free online Unlock PDF — Removes owner-level password restrictions from PDFs so you can edit, print, or copy content from protected documents. ',
    dependencies: "qpdf"
  },
  {
    id: "60",
    name: "Image Enhancer",
    slug: "image-enhancer",
    category: "Image",
    description: 'Applies an AI super-resolution model to upscale images by 2x or 4x. Portrait photographers use it to rescue low-resolution files. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Image Enhancer — Applies an AI super-resolution model to upscale images by 2x or 4x. Portrait photographers use it to rescue low-resolution files. ',
    dependencies: "Real-ESRGAN"
  },
  {
    id: "61",
    name: "SIP Calculator",
    slug: "sip-calculator",
    category: "Calculator",
    description: 'Projects the future value of recurring mutual-fund investments using compounded monthly returns based on historical or assumed growth rates. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online SIP Calculator — Projects the future value of recurring mutual-fund investments using compounded monthly returns based on historical or assumed growth rates. ',
    dependencies: "Vanilla JS"
  },
  {
    id: "62",
    name: "BMI Calculator",
    slug: "bmi-calculator",
    category: "Calculator",
    description: 'Computes Body Mass Index from metric or imperial height and weight inputs, categorizing the result into underweight, normal, overweight. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online BMI Calculator — Computes Body Mass Index from metric or imperial height and weight inputs, categorizing the result into underweight, normal, overweight. ',
    dependencies: "Vanilla JS"
  },
  {
    id: "64",
    name: "Audio to Text Transcription",
    slug: "audio-to-text-transcription",
    category: "Transcription",
    description: 'Transcribe audio files to text using AI-powered speech recognition. Supports MP3, WAV, M4A, and more formats.',
    seoDescription: 'Free online Audio to Text Transcription — Convert spoken audio from uploaded files into editable text. Uses cloud-based processing.',
    dependencies: "Whisper API"
  },
  {
    id: "66",
    name: "Meme Generator",
    slug: "meme-generator",
    category: "Image",
    description: 'Adds top-and-bottom text to any uploaded image with meme-style Impact font, customizable font size, stroke width, and white border. No signup or account required.',
    seoDescription: 'Free online Meme Generator — Adds top-and-bottom text to any uploaded image with meme-style Impact font, customizable font size, stroke width, and white border. ',
    dependencies: "Canvas API"
  },
  {
    id: "67",
    name: "MOV to MP4",
    slug: "mov-to-mp4",
    category: "Converter",
    description: 'Convert MOV video files to MP4 format directly in your browser. 100% free, private — your files never leave your device.',
    seoDescription: 'Free online MOV to MP4 — Transcodes QuickTime MOV files into MP4 format while optimizing for web playback and social media uploads. ',
    dependencies: "FFmpeg",
    showInCategory: false
  },
  {
    id: "68",
    name: "Resume Builder",
    slug: "resume-builder",
    category: "Utility",
    description: 'Provides a structured, form-based interface for entering work history, education, and skills, then renders a professionally formatted PDF resume. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Resume Builder — Provides a structured, form-based interface for entering work history, education, and skills, then renders a professionally formatted PDF resume. ',
    dependencies: "React / html2pdf.js"
  },
  {
    id: "69",
    name: "AI Image Upscaler",
    slug: "ai-image-upscaler",
    category: "AI",
    description: 'Increases image resolution by up to 4x while reconstructing fine details that standard interpolation loses.',
    dependencies: "Real-ESRGAN",
    seoDescription: 'Upscale images online free with AI — increase resolution by 4x while reconstructing fine details. ',
  },
  {
    id: "70",
    name: "GST Calculator",
    slug: "gst-calculator",
    category: "Calculator",
    description: 'Computes GST-inclusive and GST-exclusive amounts for Indian tax slabs (5%, 12%, 18%, 28%) with automatic HSN/SAC code hints.',
    dependencies: "Vanilla JS",
    seoDescription: 'Free online GST calculator for India — compute GST inclusive and exclusive prices for 5%, 12%, 18%, and 28% slabs. Instant, accurate, and 100% client-side.',
    instructions: [
      { title: "1. Enter the Base Amount", desc: "Type the invoice or purchase amount in ₹ into the input field. This is the value before or after GST depending on your calculation mode." },
      { title: "2. Select GST Rate & Mode", desc: "Choose the applicable GST slab (5%, 12%, 18%, or 28%) and whether you want to add GST to a net price or remove GST from a gross total." },
      { title: "3. Read Your Tax Breakdown", desc: "The tool instantly shows the net amount, GST value, and total price. Use the values for invoicing, tax filing, or cost estimation." },
    ],
    faqs: [
      { question: "What GST slabs are covered?", answer: "This calculator supports all four standard Indian GST slabs: 5% (essentials like packaged food), 12% (processed goods), 18% (most services and regular items), and 28% (luxury goods and sin products)." },
      { question: "What is the difference between 'Add GST' and 'Remove GST'?", answer: "Add GST calculates the final price including tax starting from a net/exclusive amount (e.g., ₹1000 + 18% GST = ₹1180). Remove GST works backwards from a gross/inclusive total to extract the original net amount and the GST component (e.g., ₹1180 with 18% GST = ₹1000 net + ₹180 tax)." },
      { question: "Can I use this for GST filing or invoice creation?", answer: "This calculator is designed for quick estimates and personal use. For official GST filing or professional invoices, use the GST Invoice Generator tool and consult a tax professional." },
      { question: "Does the calculator handle reverse charge or integrated GST (IGST)?", answer: "The calculator works with standard GST rates. IGST applies to inter-state transactions at the same slab rates, and the calculation method is identical — the total tax percentage is the same whether it's CGST+SGST (intra-state) or IGST (inter-state)." },
      { question: "Are my calculations saved or tracked?", answer: "No. All calculations happen in your browser and are never saved or transmitted. Refresh the page and your data is gone — complete privacy is maintained." },
    ]
  },
  {
    id: "71",
    name: "Image Resizer",
    slug: "image-resizer",
    category: "Image",
    description: 'Scales images to exact pixel dimensions or percentage-based sizes with intelligent resampling algorithms that preserve sharpness.',
    dependencies: "Canvas API / Sharp",
    seoDescription: 'Resize images online free — scale JPG, PNG, WebP to exact dimensions or percentage. Smart resampling preserves quality. ',
  },
  {
    id: "72",
    name: "Password Generator",
    slug: "password-generator",
    category: "Utility",
    description: 'Generates cryptographically strong random passwords with fully customizable length, character sets, and pattern rules. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Password Generator — Generates cryptographically strong random passwords with fully customizable length, character sets, and pattern rules. ',
    dependencies: "Crypto API"
  },
  {
    id: "73",
    name: "Diff Checker",
    slug: "diff-checker",
    category: "Developer",
    description: 'Compares two input texts side-by-side, highlighting inserted, deleted, and changed lines with distinct background colors. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Diff Checker — Compares two input texts side-by-side, highlighting inserted, deleted, and changed lines with distinct background colors. ',
    dependencies: "diff-match-patch"
  },
  {
    id: "74",
    name: "WEBM to MP4",
    slug: "webm-to-mp4",
    category: "Converter",
    description: 'Convert WEBM video files to MP4 format directly in your browser. 100% free, private — your files never leave your device.',
    seoDescription: 'Free online WEBM to MP4 — Converts WebM video files to MP4 format, which is critical for users whose editing software or sharing platforms reject WebM. ',
    dependencies: "FFmpeg",
    showInCategory: false
  },
  {
    id: "76",
    name: "IP Address Lookup",
    slug: "ip-address-lookup",
    category: "Utility",
    description: 'Displays your public IPv4 and IPv6 addresses with geolocation data (city, ISP, ASN, timezone). Network engineers use it to verify VPN connectivity. Uses cloud-based processing.',
    seoDescription: 'Free online IP Address Lookup — Displays your public IPv4 and IPv6 addresses with geolocation data (city, ISP, ASN, timezone). Network engineers use it to verify VPN connectivity. ',
    dependencies: "MaxMind / IP-API"
  },
  {
    id: "79",
    name: "Photo Retoucher",
    slug: "photo-retoucher",
    category: "Image",
    description: 'Applies an AI-powered inpainting model to remove blemishes, scratches, dust spots, and skin imperfections from portrait and product photos. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Photo Retoucher — Applies an AI-powered inpainting model to remove blemishes, scratches, dust spots, and skin imperfections from portrait and product photos. ',
    dependencies: "OpenCV"
  },
  {
    id: "80",
    name: "PDF Splitter",
    slug: "pdf-splitter",
    category: "PDF",
    description: 'Divides a single PDF into multiple files by page range, bookmark level, or a specified page count per split.',
    dependencies: "pdf-lib",
    seoDescription: 'Split PDF files online free — divide PDF by page range, bookmarks, or page count. Extract specific pages into separate files. No uploads, private.',
  },
  {
    id: "84",
    name: "Font Generator",
    slug: "font-generator",
    category: "Text",
    description: 'Generates Unicode-styled text variants for bold, italic, monospace, fraktur, script, serif, and sans-serif — optimized for code comments, design mockups, Discord formatting, and technical documentation where visual emphasis matters beyond standard fonts.',
    seoDescription: 'Free online Font Generator — generate Unicode-styled text in bold, italic, monospace, fraktur, script, serif, and sans-serif. Perfect for design mockups, code comments, Discord, and technical docs. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Your Text", desc: "Type or paste the text you want to style. All font variants appear instantly — no waiting for processing." },
      { title: "2. Browse Font Variants", desc: "Choose from bold serif, bold sans, italic, monospace (typewriter-style), fraktur (gothic), double-struck, script, and more. Each serves a distinct visual purpose." },
      { title: "3. Copy for Your Platform", desc: "Click any variant to copy. Use monospace for code snippets, bold sans for emphasis, or fraktur for a classic academic look. Paste anywhere that supports Unicode." },
    ],
    faqs: [
      { question: "How is this different from Fancy Text Generator?", answer: "Font Generator focuses on practical Unicode font variants — bold, italic, monospace, serif, sans-serif — useful for design mockups, code documentation, and formatting. Fancy Text Generator offers 40+ decorative styles (bubble, gothic, etc.) for social media and creative use." },
      { question: "Can I use monospace text for code?", answer: "Yes. The monospace variant uses Unicode mathematical monospace characters — ideal for inline code in documentation, Discord code blocks, or emphasizing technical terms in plain text environments where HTML isn't available." },
      { question: "What platforms support these styled characters?", answer: "Most modern platforms including Discord, WhatsApp, Instagram, Twitter, and web browsers render Unicode mathematical alphanumerics correctly. The font generator variants are tested for broad compatibility across social media and messaging apps." },
      { question: "Is bold text the same as HTML <b>?", answer: "Unicode bold characters are visual-only — they appear bold but don't carry semantic weight like HTML tags. For SEO and accessibility, use actual HTML. For plain text environments (Discord, bios), Unicode bold is the only option." },
    ]
  },
  {
    id: "85",
    name: "Salary Calculator",
    slug: "salary-calculator",
    category: "Calculator",
    description: "Calculate net salary after taxes Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Salary Calculator — Calculate net salary after taxes ',
    dependencies: "Vanilla JS"
  },
  {
    id: "86",
    name: "Audio Cutter",
    slug: "audio-cutter",
    category: "Audio",
    description: "Trim and cut audio files online Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Audio Cutter — Trim and cut audio files online ',
    dependencies: "Web Audio API / FFmpeg"
  },
  {
    id: "86b",
    name: "MP3 to WAV",
    slug: "mp3-to-wav",
    category: "Audio",
    description: 'Converts MP3 files to WAV format — universal music playback and sharing across all devices and platforms to professional audio editing, mastering, and archival in DAWs and production software. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online MP3 to WAV — Convert compressed MP3 audio files into uncompressed WAV format for professional audio editing. ',
    dependencies: "FFmpeg.wasm",
    showInCategory: false
  },
  {
    id: "87",
    name: "Pomodoro Timer",
    slug: "pomodoro-timer",
    category: "Productivity",
    description: 'Pomodoro Timer manages work and break intervals with fully customizable session lengths and auto-start options. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Pomodoro Timer — Pomodoro Timer manages work and break intervals with fully customizable session lengths and auto-start options. ',
    dependencies: "Web Audio API / Vanilla JS"
  },
  {
    id: "90",
    name: "YouTube Transcript Generator",
    slug: "youtube-transcript-generator",
    category: "Transcription",
    description: 'YouTube Transcript Generator fetches captions from public YouTube videos via the video ID or URL. Uses cloud-based processing.',
    seoDescription: 'Free online YouTube Transcript Generator — YouTube Transcript Generator fetches captions from public YouTube videos via the video ID or URL. ',
    dependencies: "YouTube Data API"
  },
  {
    id: "92",
    name: "EPUB to PDF",
    slug: "epub-to-pdf",
    category: "Converter",
    description: 'Converts EPUB files to PDF format — e-readers, mobile devices, and accessible digital books to document sharing, printing, and archival with consistent formatting. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online EPUB to PDF — Convert e-books to PDF format. Preserves structure, images, and formatting. ',
    dependencies: "jszip, pdf-lib",
    showInCategory: true
  },
  {
    id: "96",
    name: "Protect PDF",
    slug: "protect-pdf",
    category: "PDF",
    description: 'Encrypts a PDF with a user-chosen password using AES-128, restricting opening, printing, and copying as specified by the owner. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Protect PDF — Encrypts a PDF with a user-chosen password using AES-128, restricting opening, printing, and copying as specified by the owner. ',
    dependencies: "pdf-lib"
  },
  {
    id: "97",
    name: "Invoice Generator",
    slug: "invoice-generator",
    category: "Finance",
    description: 'Produces downloadable PDF or HTML invoices with customizable line items, tax rates, discounts, and business logo placement. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Invoice Generator — Produces downloadable PDF or HTML invoices with customizable line items, tax rates, discounts, and business logo placement. ',
    dependencies: "PDF-lib / Vue.js"
  },
  {
    id: "98",
    name: "Business Card Maker",
    slug: "business-card-maker",
    category: "Branding",
    description: 'Business Card Maker provides a WYSIWYG editor with snap-to-grid alignment and preset card dimensions. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Business Card Maker — Business Card Maker provides a WYSIWYG editor with snap-to-grid alignment and preset card dimensions. ',
    dependencies: "React / Canvas API"
  },
  {
    id: "99",
    name: "Regex Tester",
    slug: "regex-tester",
    category: "Developer",
    description: 'Provides an interactive environment where users can write a regular expression pattern, test it against sample strings, and view real-time match. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Regex Tester — Provides an interactive environment where users can write a regular expression pattern, test it against sample strings, and view real-time match. ',
    dependencies: "regex.js"
  },
  {
    id: "101",
    name: "Dice Roller",
    slug: "dice-roller",
    category: "Utility",
    description: 'Simulates rolling any number of dice with arbitrary side counts—d4, d6, d8, d10, d12, d20, d100, or custom values. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Dice Roller — Simulates rolling any number of dice with arbitrary side counts—d4, d6, d8, d10, d12, d20, d100, or custom values. ',
    dependencies: "Three.js"
  },
  {
    id: "102",
    name: "Profit Margin Calculator",
    slug: "profit-margin-calculator",
    category: "Calculator",
    description: 'Computes gross profit, net profit, and margin percentages from revenue and cost inputs. Small-business owners use it to price products, evaluate supplier deals, and ensure healthy margins across their product lines.',
    seoDescription: 'Free online Profit Margin Calculator — compute gross profit, net profit, and margin percentages from revenue and cost. Perfect for product pricing, supplier evaluation, and business planning. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Revenue", desc: "Input your total revenue or selling price per unit. This is the money coming in from sales." },
      { title: "2. Enter Costs", desc: "Input your cost of goods sold (COGS) — what you pay to produce or acquire each unit." },
      { title: "3. Review Your Margins", desc: "The calculator shows gross profit, gross margin %, net profit, and net margin %. Use these numbers to set pricing and evaluate profitability." },
    ],
    faqs: [
      { question: "How is this different from the Margin Calculator?", answer: "Profit Margin Calculator gives you gross and net profit from revenue and cost. Margin Calculator works backwards — calculate selling price or cost from any two known variables (margin %, cost, or price). Use Profit Margin for overall business analysis, Margin Calculator for pricing." },
      { question: "What's a good profit margin?", answer: "Healthy margins vary by industry: retail typically runs 20-50% gross margin, software/SaaS targets 70-90%, restaurants operate on 3-10% net margin. Compare against industry benchmarks for your sector." },
      { question: "Should I use gross or net margin for pricing?", answer: "Gross margin includes only direct production costs — use it for product-level pricing decisions. Net margin accounts for all operating expenses — use it for overall business health assessment." },
      { question: "Can I calculate margin for multiple products?", answer: "This tool handles one product at a time. For multi-product analysis, calculate each product individually and compare the margin percentages across your product line." },
    ]
  },
  {
    id: "104",
    name: "Speech to Text",
    slug: "speech-to-text",
    category: "Audio",
    description: "Transcribe audio to text in multiple languages Uses cloud-based processing.",
    seoDescription: 'Free online Speech to Text — Transcribe audio to text in multiple languages ',
    dependencies: "Whisper API / Web Speech API"
  },
  {
    id: "106",
    name: "PDF to EPUB",
    slug: "pdf-to-epub",
    category: "PDF",
    description: 'Convert PDF documents to EPUB format for e-book readers. Server-side conversion preserves layout, images, and chapter structure.',
    seoDescription: 'Free online PDF to EPUB — Converts static PDF documents into reflowable EPUB ebook format with adjustable font size, orientation, and screen adaptation. ',
    dependencies: "Calibre API",
    showInCategory: false
  },
  {
    id: "107",
    name: "Coin Flipper",
    slug: "coin-flipper",
    category: "Utility",
    description: 'Simulates a fair coin flip using a cryptographic random number generator, displaying heads or tails with a realistic animation. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Coin Flipper — Simulates a fair coin flip using a cryptographic random number generator, displaying heads or tails with a realistic animation. ',
    dependencies: "CSS3 Animations"
  },
  {
    id: "108",
    name: "Image Colorizer",
    slug: "image-colorizer",
    category: "Image",
    description: 'Uses a deep-learning model trained on millions of historical photos to predict plausible per-pixel color for grayscale and sepia images. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Image Colorizer — Uses a deep-learning model trained on millions of historical photos to predict plausible per-pixel color for grayscale and sepia images. ',
    dependencies: "DeOldify"
  },
  {
    id: "109",
    name: "EXIF Data Remover",
    slug: "exif-data-remover",
    category: "Privacy",
    description: 'Strips GPS coordinates, camera metadata, timestamps, and software fingerprints from JPEG and PNG images. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online EXIF Data Remover — Strips GPS coordinates, camera metadata, timestamps, and software fingerprints from JPEG and PNG images. ',
    dependencies: "exifr / Piexifjs"
  },
  {
    id: "110",
    name: "AVI to MP4",
    slug: "avi-to-mp4",
    category: "Converter",
    description: 'Convert AVI video files to MP4 format directly in your browser. 100% free, private — your files never leave your device.',
    seoDescription: 'Free online AVI to MP4 — Converts legacy AVI video containers into modern MP4 files with H.264 encoding for drastically smaller file sizes. ',
    dependencies: "FFmpeg",
    showInCategory: false
  },
  {
    id: "mp4-mkv-1",
    name: "MP4 to MKV Converter",
    description: 'Converts MP4 files to MKV format — universal video playback on any device to advanced video archiving with multiple subtitle tracks, chapters, and audio streams in one file. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online MP4 to MKV Converter — Re-encapsulates MP4 video files into the versatile MKV container without re-encoding the underlying video stream. ',
    category: "Converter",
    slug: "mp4-to-mkv",
    dependencies: "ffmpeg",
    showInCategory: false
  },
  {
    id: "mp4-mov-1",
    name: "MP4 to MOV Converter",
    description: 'Convert MP4 video files to MKV format directly in your browser. 100% free, private — your files never leave your device.',
    seoDescription: 'Free online MP4 to MOV Converter — Converts MP4 video files to QuickTime MOV format while preserving quality, ideal for Apple ecosystem workflows and Final Cut Pro imports. ',
    category: "Converter",
    slug: "mp4-to-mov",
    dependencies: "ffmpeg",
    showInCategory: false
  },
  {
    id: "mkv-mov-1",
    name: "MKV to MOV Converter",
    description: 'Converts MKV files to MOV format — advanced video archiving with multiple subtitle tracks, chapters, and audio streams in one file to Apple ecosystem. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online MKV to MOV Converter — Transcodes Matroska MKV files into QuickTime MOV format for seamless editing in macOS applications like Final Cut Pro and iMovie. ',
    category: "Converter",
    slug: "mkv-to-mov",
    dependencies: "ffmpeg",
    showInCategory: false
  },
  {
    id: "mov-mkv-1",
    name: "MOV to MKV Converter",
    description: 'Convert MKV video files to MOV format directly in your browser. 100% free, private — your files never leave your device.',
    seoDescription: 'Free online MOV to MKV Converter — Converts QuickTime MOV videos into the open-source MKV container format, enabling advanced subtitle support and broader codec compatibility. ',
    category: "Converter",
    slug: "mov-to-mkv",
    dependencies: "ffmpeg",
    showInCategory: false
  },
  {
    id: "111",
    name: "Video Compressor",
    slug: "video-compressor",
    category: "Video",
    description: "Reduces MP4, MOV, and WebM video file sizes using configurable CRF (Constant Rate Factor) encoding, resolution scaling, and bitrate control. Includes a quality preview before processing. Handles files up to 500MB.",
    dependencies: "FFmpeg / WebCodecs API",
    seoDescription: 'Free online Video Compressor — reduce MP4, MOV, and WebM file sizes with CRF encoding, resolution scaling, and bitrate control. Up to 500MB. ',
    instructions: [
      { title: "1. Upload Your Video", desc: "Select an MP4, MOV, or WebM video file from your device. The tool accepts videos up to 500MB." },
      { title: "2. Configure Compression", desc: "Adjust the CRF value (lower = better quality, larger file), target resolution, or bitrate. A preview helps you see the quality tradeoff before processing." },
      { title: "3. Download the Compressed Video", desc: "Process the video locally in your browser using FFmpeg WASM. Download the compressed result — your original stays untouched." },
    ],
    faqs: [
      { question: "How much can this compress a video?", answer: "Typical compression reduces video file sizes by 50-80% depending on the CRF setting and source quality. A 100MB video can often be reduced to 20-30MB with minimal visible quality loss at CRF 23." },
      { question: "What's the difference between video, image, and PDF compressors?", answer: "Video Compressor uses H.264/AV1 encoding via FFmpeg to reduce MP4/MOV/WebM files — the most compute-intensive compression. Image Compressor uses Canvas API for JPG/PNG/WebP. PDF Compressor optimizes document internals. Each uses format-appropriate compression algorithms." },
      { question: "What is CRF and what value should I use?", answer: "CRF (Constant Rate Factor) controls quality: 0 is lossless, 51 is worst. For web uploads, CRF 23-28 is typical (good quality, small file). For archival, use CRF 18-22. For maximum compression (social media), CRF 28-32 works well." },
      { question: "Does compression work on my device without uploading?", answer: "Yes. All video compression runs locally using FFmpeg WASM compiled to WebAssembly. Your video never leaves your browser — no uploads, no server processing, complete privacy for your content." },
    ]
  },
  {
    id: "112",
    name: "AI Face Swap",
    slug: "ai-face-swap",
    category: "AI",
    description: 'Compress video files to reduce size while maintaining quality. Supports MP4, MOV, WebM. Adjust resolution, bitrate, and codec settings.',
    seoDescription: 'Free online AI Face Swap — Seamlessly replaces one face with another in photos while matching skin tone, lighting, and head angle. ',
    dependencies: "InsightFace"
  },
  {
    id: "113",
    name: "JSON Formatter",
    slug: "json-formatter",
    category: "Developer",
    description: 'Pretty-prints raw JSON with configurable indent width, key sorting, and bracket collapsing options while flagging syntax errors with exact.',
    dependencies: "JSONLint",
    seoDescription: 'Free JSON formatter online — format, validate, and beautify JSON with configurable indentation and sorting. Syntax error highlighting included.',        },
  {
    id: "114",
    name: "XML Sitemap Generator",
    slug: "xml-sitemap-generator",
    category: "SEO",
    description: 'Crawls any website and generates a standards-compliant XML sitemap. Supports JavaScript sites (React, Next.js, Vue), detects broken links, and provides SEO health insights.',
    seoDescription: 'Free online XML Sitemap Generator — Crawl any website and generate a standards-compliant XML sitemap. Supports JavaScript sites (React, Next.js, Vue), detects broken links, and provides SEO health insights. ',
    dependencies: "Fetch API / DOMParser"
  },
  {
    id: "115",
    name: "Meeting Minutes Generator",
    slug: "meeting-minutes-generator",
    category: "Transcription",
    description: 'Meeting Minutes Generator structures raw notes into sections like attendees, decisions, action items, and follow-ups. Uses cloud-based processing.',
    seoDescription: 'Free online Meeting Minutes Generator — Meeting Minutes Generator structures raw notes into sections like attendees, decisions, action items, and follow-ups. ',
    dependencies: "OpenAI API"
  },
  {
    id: "116",
    name: "AI Cover Letter Generator",
    slug: "ai-cover-letter-generator",
    category: "AI",
    description: 'Analyzes a job description and your résumé to produce a tailored cover letter that highlights relevant experience and matches the employer’s. Uses cloud-based processing.',
    seoDescription: 'Free online AI Cover Letter Generator — Analyzes a job description and your résumé to produce a tailored cover letter that highlights relevant experience and matches the employer’s. ',
    dependencies: "OpenAI API"
  },
  {
    id: "121",
    name: "JSON to CSV",
    slug: "json-to-csv",
    category: "Converter",
    description: 'Converts JSON files to CSV format — APIs, configuration files, and data exchange between web services to spreadsheets, database exports, and data imports. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online JSON to CSV — Parses structured JSON data—including nested objects and arrays—and flattens it into a clean CSV spreadsheet with proper column headers. ',
    dependencies: "PapaParse",
  },
  {
    id: "122",
    name: "Watermark PDF",
    slug: "watermark-pdf",
    category: "PDF",
    description: 'Overlays text or image watermarks onto every page of a PDF with customizable position, rotation, opacity, and tiling. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Watermark PDF — Overlays text or image watermarks onto every page of a PDF with customizable position, rotation, opacity, and tiling. ',
    dependencies: "pdf-lib"
  },
  {
    id: "123",
    name: "PDF Page Delete",
    slug: "pdf-page-delete",
    category: "PDF",
    description: 'Removes selected page ranges from a PDF while renumbering the remaining pages and updating any internal page references. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online PDF Page Delete — Removes selected page ranges from a PDF while renumbering the remaining pages and updating any internal page references. ',
    dependencies: "pdf-lib"
  },
  {
    id: "124",
    name: "PNG to SVG",
    slug: "png-to-svg",
    category: "Image",
    description: 'Convert PNG images to SVG format in your browser. Lossless, private, and completely free — no uploads needed.',
    seoDescription: 'Free online PNG to SVG — Traces bitmap PNG shapes into clean SVG paths using Potrace in WebAssembly, with controls for curve tolerance, corner threshold. ',
    dependencies: "Potrace"
  },
  {
    id: "125",
    name: "Email Signature Generator",
    slug: "email-signature-generator",
    category: "Branding",
    description: 'Email Signature Generator builds HTML email signatures through a form-based UI with social link fields and icon toggles. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Email Signature Generator — Email Signature Generator builds HTML email signatures through a form-based UI with social link fields and icon toggles. ',
    dependencies: "React"
  },
  {
    id: "128",
    name: "Margin Calculator",
    slug: "margin-calculator",
    category: "Calculator",
    description: 'Calculates gross margin percentage, markup percentage, cost, and selling price from any two known variables — perfect for retail pricing, wholesale negotiations, and e-commerce product listing optimization where you need to work backwards from a target margin.',
    seoDescription: 'Free online Margin Calculator — calculate gross margin %, markup %, cost, or selling price from any two known variables. Perfect for retail pricing, wholesale, and e-commerce. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter What You Know", desc: "Fill in any two of the four fields: cost, selling price, margin %, or markup %. The calculator infers the missing values automatically." },
      { title: "2. Adjust to Target Margin", desc: "If you know your desired margin %, enter it with either cost or price to find the missing number — perfect for pricing new products." },
      { title: "3. Read the Complete Picture", desc: "The tool displays all four values: cost, price, margin %, and markup %. Use the results to set profitable prices." },
    ],
    faqs: [
      { question: "How is this different from the Profit Margin Calculator?", answer: "Margin Calculator works backwards from any two known values to derive the others — ideal for pricing decisions (I want 40% margin on a $50 cost, what should I charge?). Profit Margin Calculator analyzes existing revenue and costs to show your current margins." },
      { question: "What's the difference between margin and markup?", answer: "Margin is the percentage of the selling price that is profit (profit/selling price). Markup is the percentage added to cost (profit/cost). A 25% margin equals a 33% markup. The calculator shows both so you understand your pricing from both perspectives." },
      { question: "Can I use this for wholesale pricing?", answer: "Yes. Enter your wholesale cost and desired margin to find the retail price. Or enter your retail price and see what margin you're making — essential for negotiating with suppliers and distributors." },
      { question: "Is this useful for e-commerce sellers?", answer: "Absolutely. E-commerce sellers on Amazon, Shopify, and Etsy use this to ensure their product pricing covers platform fees, fulfillment costs, and still delivers their target profit margin." },
    ]
  },
  {
    id: "129",
    name: "Morse Code Translator",
    slug: "morse-code-translator",
    category: "Utility",
    description: 'Converts alphanumeric text into International Morse code with audible beeps played through the Web Audio API, and decodes incoming Morse signals. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Morse Code Translator — Converts alphanumeric text into International Morse code with audible beeps played through the Web Audio API, and decodes incoming Morse signals. ',
    dependencies: "Vanilla JS"
  },
  {
    id: "130",
    name: "Cursive Text Generator",
    slug: "cursive-text-generator",
    category: "Text",
    description: 'Transforms plain text into elegant cursive and script-style Unicode characters that imitate handwritten calligraphy. Ideal for wedding invitations, greeting cards, elegant Instagram captions, signatures, and any content needing a personal hand-written touch.',
    seoDescription: 'Free online Cursive Text Generator — transform plain text into elegant cursive and script-style Unicode characters that imitate handwritten calligraphy. Perfect for wedding invites, signatures, and elegant social captions. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Your Base Text", desc: "Type or paste the words you want in cursive. The generator converts each letter to its script-style Unicode equivalent while keeping full readability." },
      { title: "2. Choose Cursive Style", desc: "Browse cursive variants including standard script, bold script, and calligraphy-style letters. Each style gives a different hand-written feel." },
      { title: "3. Copy for Your Project", desc: "Click to copy the cursive text and paste it into invitations, social posts, bio descriptions, or any platform that needs an elegant handwritten look." },
    ],
    faqs: [
      { question: "How is this different from Fancy Text Generator?", answer: "Cursive Text Generator specializes in flowing, script-style characters that resemble handwriting — perfect for formal and personal content. Fancy Text Generator offers a broader range of 40+ decorative styles including bubble, gothic, and mathematical." },
      { question: "Is this real cursive handwriting?", answer: "The output uses Unicode mathematical script characters that visually resemble cursive handwriting. They render as italic, connected-looking letters on most devices, giving the appearance of calligraphy without requiring actual font files to be installed." },
      { question: "Can I use cursive text in professional documents?", answer: "Cursive text is best for informal and decorative use — social media bios, invitations, usernames. For professional documents, use actual cursive fonts installed in your word processor for better formatting control and print quality." },
      { question: "Does it support uppercase and numbers?", answer: "Yes. The cursive generator converts both uppercase and lowercase letters to their script-style equivalents. Numbers and symbols remain in standard form to maintain readability of addresses and dates." },
    ]
  },
  {
    id: "131",
    name: "ROI Calculator",
    slug: "roi-calculator",
    category: "Calculator",
    description: 'Measures return on investment by comparing net gain or loss against the original cost, expressed as both a percentage and a dollar amount. Essential for marketing campaign evaluation, equipment purchase decisions, real estate investment analysis, and comparing investment opportunities.',
    seoDescription: 'Free online ROI Calculator — measure return on investment as percentage and dollar amount. Perfect for marketing campaigns, equipment purchases, real estate, and investment analysis. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Your Investment", desc: "Input the total amount you invested — whether it's marketing spend, equipment cost, stock purchase, or project budget." },
      { title: "2. Enter Your Return", desc: "Input the total return or gain from the investment. This is the revenue or value generated minus any ongoing costs." },
      { title: "3. Review Your ROI", desc: "The calculator shows both ROI % and net profit/loss in dollars. Use it to compare different investment opportunities side by side." },
    ],
    faqs: [
      { question: "How is this different from the Profit Margin or Break-Even calculators?", answer: "ROI Calculator measures the efficiency of an investment by comparing return to cost — useful for evaluating marketing campaigns, equipment, or projects. Profit Margin focuses on product pricing. Break-Even finds the volume needed to cover costs. Each serves a different business decision." },
      { question: "What's a good ROI?", answer: "A positive ROI means you made money. A 100% ROI means you doubled your investment. Compare against your cost of capital: if your ROI exceeds your borrowing rate, the investment is worthwhile. Typical target ROIs vary by industry and risk level." },
      { question: "Can I compare multiple investments?", answer: "This tool evaluates one investment at a time. Calculate ROI for each option individually, then compare the percentages — higher ROI generally indicates a more efficient use of capital." },
      { question: "Does this account for time?", answer: "This is a simple ROI calculation without time adjustment. For investments spanning multiple years, consider using annualized ROI or the NPV (net present value) method for time-value-of-money analysis." },
    ]
  },
  {
    id: "132",
    name: "VAT Calculator",
    slug: "vat-calculator",
    category: "Calculator",
    description: 'Computes VAT-inclusive and VAT-exclusive amounts for EU member-state rates (standard and reduced) with country-specific rules for digital services. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online VAT Calculator — Computes VAT-inclusive and VAT-exclusive amounts for EU member-state rates (standard and reduced) with country-specific rules for digital services. ',
    dependencies: "Vanilla JS"
  },
  {
    id: "134",
    name: "Password Strength Checker",
    slug: "password-strength-checker",
    category: "Privacy",
    description: 'Evaluates password strength using zxcvbn entropy analysis: score, crack time estimate, length, character diversity, dictionary words, and pattern repetition.',
    seoDescription: 'Free online Password Strength Checker — Evaluates password strength using zxcvbn entropy analysis with score, crack time estimate, and improvement suggestions. ',
    dependencies: "zxcvbn"
  },
  {
    id: "135",
    name: "JS Minifier",
    slug: "js-minifier",
    category: "Developer",
    description: 'Strips comments, whitespace, and shortens local variable names in JavaScript source without altering execution semantics. No signup or account required.',
    seoDescription: 'Free online JS Minifier — Strips comments, whitespace, and shortens local variable names in JavaScript source without altering execution semantics. ',
    dependencies: "Terser"
  },
  {
    id: "136",
    name: "Base64 Encode/Decode",
    slug: "base64-encode-decode",
    category: "Developer",
    description: 'Encodes text or small files into Base64 strings and decodes them back with automatic MIME-type detection for binary safety. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Base64 Encode/Decode — Encodes text or small files into Base64 strings and decodes them back with automatic MIME-type detection for binary safety. ',
    dependencies: "btoa/atob"
  },
  {
    id: "137",
    name: "Text to Handwriting",
    slug: "text-to-handwriting",
    category: "Text",
    description: 'Renders typed text as realistic handwritten output using configurable fonts, ink colors, paper backgrounds, and even simulated pressure variations. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Text to Handwriting — Renders typed text as realistic handwritten output using configurable fonts, ink colors, paper backgrounds, and even simulated pressure variations. ',
    dependencies: "Canvas API"
  },
  {
    id: "138",
    name: "Receipt Generator",
    slug: "receipt-generator",
    category: "Finance",
    description: 'Creates printer-friendly receipt pages with itemized purchases, payment method, date, and merchant details in a compact single-page layout. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Receipt Generator — Creates printer-friendly receipt pages with itemized purchases, payment method, date, and merchant details in a compact single-page layout. ',
    dependencies: "Canvas API / jsPDF"
  },
  {
    id: "139",
    name: "AI Thumbnail Maker",
    slug: "ai-thumbnail-maker",
    category: "AI",
    description: 'Designs click-optimized YouTube thumbnails by compositing text, images, and effects on a smart canvas. Uses cloud-based processing.',
    seoDescription: 'Free online AI Thumbnail Maker — Designs click-optimized YouTube thumbnails by compositing text, images, and effects on a smart canvas. ',
    dependencies: "Canvas API / OpenAI API"
  },
  {
    id: "140",
    name: "Secure Note Sharer",
    slug: "secure-note-sharer",
    category: "Privacy",
    description: 'Encrypts a text note with a passphrase and generates a one-time view link that self-destructs after the recipient reads it. Uses cloud-based processing.',
    seoDescription: 'Free online Secure Note Sharer — Encrypts a text note with a passphrase and generates a one-time view link that self-destructs after the recipient reads it. ',
    dependencies: "Crypto API / Redis"
  },
  {
    id: "141",
    name: "Video to GIF",
    slug: "video-to-gif",
    category: "Video",
    description: "Convert MP4/WebM to GIF animations. Max 500MB input. Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Video to GIF — Convert MP4/WebM to GIF animations. Max 500MB input. ',
    dependencies: "FFmpeg / gif.js"
  },
  {
    id: "142",
    name: "Image to Base64",
    slug: "image-to-base64",
    category: "Developer",
    description: 'Convert images to Base64 encoded data URIs directly in your browser. Supports PNG, JPG, WebP, SVG, and GIF. 100% client-side.',
    seoDescription: 'Free online Image to Base64 — Converts uploaded images (PNG, JPG, GIF, SVG, WebP) into Base64-encoded data URI strings ready for embedding in HTML, CSS, or JSON. ',
    dependencies: "FileReader API"
  },
  {
    id: "143",
    name: "Subtitle Translator",
    slug: "subtitle-translator",
    category: "Video",
    description: 'Accepts SRT or VTT subtitle files and translates their text content into any of 100+ target languages while preserving exact timing codes and frame. Uses cloud-based processing.',
    seoDescription: 'Free online Subtitle Translator — Accepts SRT or VTT subtitle files and translates their text content into any of 100+ target languages while preserving exact timing codes and frame. ',
    dependencies: "Google Translate API"
  },
  {
    id: "144",
    name: "IBAN Validator",
    slug: "iban-validator",
    category: "Finance",
    description: 'Validates the structure, length, and check digits of IBANs from 70+ countries using the official ISO 13616 modulus-97 algorithm. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online IBAN Validator — Validates the structure, length, and check digits of IBANs from 70+ countries using the official ISO 13616 modulus-97 algorithm. ',
    dependencies: "ibantools"
  },
  {
    id: "151",
    name: "CSV to JSON",
    slug: "csv-to-json",
    category: "Converter",
    description: 'Converts CSV files to JSON format — spreadsheets, database exports, and data imports to APIs, configuration files, and data exchange between web services. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online CSV to JSON — Reads CSV files and converts each row into a structured JSON object, correctly inferring data types and handling quoted fields. ',
    dependencies: "PapaParse",
  },
  {
    id: "151b",
    name: "CSV to XML",
    slug: "csv-to-xml",
    category: "Converter",
    description: 'Converts CSV files to XML format — spreadsheets, database exports, and data imports to enterprise systems, SOAP APIs, document formats like DOCX and SVG. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online CSV to XML — Parses CSV data and converts it into well-formed XML documents using configurable root and row element names. ',
    dependencies: "PapaParse / xml2js",
    showInCategory: false
  },
  {
    id: "152",
    name: "Rotate PDF",
    slug: "rotate-pdf",
    category: "PDF",
    description: 'Rotates individual pages or all pages of a PDF by 90, 180, or 270 degrees without re-encoding the page content. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Rotate PDF — Rotates individual pages or all pages of a PDF by 90, 180, or 270 degrees without re-encoding the page content. ',
    dependencies: "pdf-lib"
  },
  {
    id: "153",
    name: "Extract Images from PDF",
    slug: "extract-images-from-pdf",
    category: "PDF",
    description: 'Extracts every embedded raster image from a PDF as separate JPEG or PNG files, preserving original resolution and color space. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Extract Images from PDF — Extracts every embedded raster image from a PDF as separate JPEG or PNG files, preserving original resolution and color space. ',
    dependencies: "pdf.js"
  },
  {
    id: "154",
    name: "SQL Formatter",
    slug: "sql-formatter",
    category: "Developer",
    description: 'Formats SQL queries with proper keyword capitalization, indentation, and clause alignment for readable database operations.',
    seoDescription: 'Free online SQL Formatter — Reindents and rewrites SQL queries with configurable dialect support (MySQL, PostgreSQL, SQL Server, BigQuery) and keyword-case preference. ',
    dependencies: "sql-formatter"
  },
  {
    id: "155",
    name: "UUID Generator",
    slug: "uuid-generator",
    category: "Developer",
    description: 'Generates UUID v4 random identifiers in standard 36-character string format with an optional compact hex mode (no dashes). Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online UUID Generator — Generates UUID v4 random identifiers in standard 36-character string format with an optional compact hex mode (no dashes). ',
    dependencies: "uuid"
  },
  {
    id: "156",
    name: "HEX to RGB Converter",
    slug: "hex-to-rgb-converter",
    category: "Design",
    description: 'Hex to RGB Converter parses hex color codes and outputs the corresponding RGB and RGBA values. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online HEX to RGB Converter — Hex to RGB Converter parses hex color codes and outputs the corresponding RGB and RGBA values. ',
    dependencies: "Vanilla JS",
      },
  {
    id: "157",
    name: "BMR Calculator",
    slug: "bmr-calculator",
    category: "Calculator",
    description: 'Calculates Basal Metabolic Rate using the Mifflin-St Jeor equation with age, sex, height, and weight. Nutritionists use it for diet planning. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online BMR Calculator — Calculates Basal Metabolic Rate using the Mifflin-St Jeor equation with age, sex, height, and weight. Nutritionists use it for diet planning. ',
    dependencies: "Vanilla JS"
  },
  {
    id: "158",
    name: "Meta Tag Generator",
    slug: "meta-tag-generator",
    category: "SEO",
    description: 'Builds a complete block of HTML meta tags including title, description, Open Graph, Twitter Cards, and canonical URL from an interactive form. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Meta Tag Generator — Builds a complete block of HTML meta tags including title, description, Open Graph, Twitter Cards, and canonical URL from an interactive form. ',
    dependencies: "Vanilla JS"
  },
  {
    id: "159",
    name: "Text to Binary",
    slug: "text-to-binary",
    category: "Developer",
    description: 'Encodes any Unicode string into its binary (base-2) representation, byte by byte, with visible byte-boundary separators. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Text to Binary — Encodes any Unicode string into its binary (base-2) representation, byte by byte, with visible byte-boundary separators. ',
    dependencies: "Vanilla JS",
      },
  {
    id: "160",
    name: "Binary to Text",
    slug: "binary-to-text",
    category: "Developer",
    description: 'Decodes space- or comma-separated binary strings back into human-readable Unicode text, rejecting malformed groups with an exact-position error. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Binary to Text — Decodes space- or comma-separated binary strings back into human-readable Unicode text, rejecting malformed groups with an exact-position error. ',
    dependencies: "Vanilla JS",
      },
  {
    id: "161",
    name: "Break-Even Calculator",
    slug: "break-even-calculator",
    category: "Calculator",
    description: 'Determines the exact unit volume or revenue required to cover fixed and variable costs, with a built-in sensitivity slider for price changes. Essential for startup pricing strategy, product launch planning, and manufacturing cost analysis where knowing your break-even point is critical before committing to production.',
    seoDescription: 'Free online Break-Even Calculator — find the exact unit volume or revenue needed to cover fixed and variable costs. Price sensitivity slider for what-if analysis. Perfect for startups and product launches. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Fixed Costs", desc: "Input your total fixed costs — rent, salaries, equipment, insurance — costs that don't change with production volume." },
      { title: "2. Enter Variable Costs & Price", desc: "Input your per-unit variable cost (materials, labor, shipping) and your selling price per unit." },
      { title: "3. Find Your Break-Even Point", desc: "The calculator shows the number of units you need to sell and the revenue required to break even. Use the price sensitivity slider to see how pricing affects your break-even." },
    ],
    faqs: [
      { question: "How is this different from the ROI or Profit Margin calculators?", answer: "Break-Even Calculator tells you how many units you must sell before you start making a profit — essential for pricing and production decisions. ROI measures the return on an investment. Profit Margin shows your percentage profit per sale. They work together for complete business analysis." },
      { question: "What happens if I change my selling price?", answer: "Use the price sensitivity slider to simulate different price points. A higher price means fewer units needed to break even, but may reduce demand. A lower price means more units needed but potentially higher volume." },
      { question: "Can I include multiple products?", answer: "This calculator is designed for a single product or service. For multi-product businesses, calculate break-even for each product line separately, or use average contribution margin across your product mix." },
      { question: "Is break-even analysis only for startups?", answer: "No. Established businesses use break-even analysis for new product launches, pricing changes, cost reduction decisions, expansion planning, and evaluating whether to accept large orders or enter new markets." },
    ]
  },
  {
    id: "162",
    name: "Conversion Rate Calculator",
    slug: "conversion-rate-calculator",
    category: "Branding",
    description: 'Conversion Rate Calculator divides conversions by total visitors and displays the rate as a percentage with configurable decimal precision. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Conversion Rate Calculator — Conversion Rate Calculator divides conversions by total visitors and displays the rate as a percentage with configurable decimal precision. ',
    dependencies: "Vanilla JS"
  },
  {
    id: "163",
    name: "CPM Calculator",
    slug: "cpm-calculator",
    category: "Branding",
    description: 'Computes cost per mille (CPM) — the cost advertisers pay per 1,000 ad impressions. Includes platform presets for YouTube, Twitch, Facebook, Instagram, TikTok, Twitter, and LinkedIn with average rates, plus RPM (revenue per mille) calculation for creators.',
    seoDescription: 'Free online CPM Calculator — compute cost per mille for ad campaigns with platform presets for YouTube, Twitch, Facebook, Instagram, TikTok, Twitter, and LinkedIn. Includes RPM for creators. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Select a Platform", desc: "Choose a preset for YouTube, Twitch, Facebook, Instagram, TikTok, Twitter, or LinkedIn — each pre-fills typical CPM and RPM averages for reference. Or select Custom for manual entry." },
      { title: "2. Enter Your Numbers", desc: "In CPM mode, enter total ad spend and impressions. In RPM mode, enter creator revenue and views. The result updates instantly." },
      { title: "3. Read Both Metrics", desc: "The tool shows both CPM and RPM side by side regardless of which mode you're in. Use CPM for advertiser planning and RPM for creator earnings analysis." },
    ],
    faqs: [
      { question: "What's the difference between CPM and RPM?", answer: "CPM (Cost Per Mille) is what advertisers pay per 1,000 ad impressions — the cost side. RPM (Revenue Per Mille) is what publishers and creators earn per 1,000 views — the revenue side. RPM is typically 40-60% of CPM because platforms take a revenue share." },
      { question: "What CPM should I expect for my platform?", answer: "Typical average CPMs vary: LinkedIn ~$9, Instagram ~$8, Facebook ~$6, Twitter ~$5, Twitch ~$4, YouTube ~$3.50, TikTok ~$1.50. Actual rates depend on your niche, audience location, ad format, and season." },
      { question: "How is RPM different from CPM for creators?", answer: "A creator earning $150 from 100,000 YouTube views has an RPM of $1.50, even though the advertiser CPM might be $3.50. The difference is the platform's revenue share (~45% for YouTube). RPM shows what you actually earn." },
      { question: "Can I use this for campaign planning?", answer: "Yes. Advertisers use CPM to budget campaigns: if your target CPM is $5 and you want 1M impressions, budget $5,000. Use the platform presets as starting points and adjust based on your actual campaign data." },
    ]
  },
  {
    id: "164",
    name: "ROAS Calculator",
    slug: "roas-calculator",
    category: "Branding",
    description: 'ROAS Calculator divides ad revenue by ad spend to return a return-on-ad-spend ratio. Performance marketers and ecommerce managers use it to evaluate. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online ROAS Calculator — ROAS Calculator divides ad revenue by ad spend to return a return-on-ad-spend ratio. Performance marketers and ecommerce managers use it to evaluate. ',
    dependencies: "Vanilla JS"
  },
  {
    id: "165",
    name: "Podcast Transcription",
    slug: "podcast-transcription",
    category: "Transcription",
    description: 'Podcast Transcription processes long-form audio files into text using speech recognition.',
    seoDescription: 'Free online Podcast Transcription — Convert long-form podcast audio files into text. Uses cloud-based processing.',
    dependencies: "Whisper API"
  },
  {
    id: "166",
    name: "CSS Minifier",
    slug: "css-minifier",
    category: "Developer",
    description: 'Removes unnecessary whitespace, comments, and trailing semicolons from CSS, while merging identical selector blocks where safe to do so. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online CSS Minifier — Removes unnecessary whitespace, comments, and trailing semicolons from CSS, while merging identical selector blocks where safe to do so. ',
    dependencies: "clean-css"
  },
  {
    id: "168",
    name: "Compare PDF Files",
    slug: "compare-pdf-files",
    category: "PDF",
    description: 'Performs pixel-level and text-level comparison of two PDF files, highlighting every difference with color-coded overlay annotations. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Compare PDF Files — Performs pixel-level and text-level comparison of two PDF files, highlighting every difference with color-coded overlay annotations. ',
    dependencies: "pdf.js"
  },
  {
    id: "169",
    name: "Favicon Generator",
    slug: "favicon-generator",
    category: "Design",
    description: 'Favicon Generator converts text initials, uploaded images, or emoji into .ico and PNG favicon files. No signup or account required.',
    seoDescription: 'Free online Favicon Generator — Favicon Generator converts text initials, uploaded images, or emoji into .ico and PNG favicon files. ',
    dependencies: "Sharp / jimp"
  },
  {
    id: "170",
    name: "Case Converter",
    slug: "case-converter",
    category: "Text",
    description: 'Transforms text between uppercase, lowercase, title case, camelCase, snake_case, kebab-case, and alternating case with a single click. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Case Converter — Transforms text between uppercase, lowercase, title case, camelCase, snake_case, kebab-case, and alternating case with a single click. ',
    dependencies: "Vanilla JS",
      },
  {
    id: "171",
    name: "Keyword Density Checker",
    slug: "keyword-density-checker",
    category: "SEO",
    description: 'Parses pasted or uploaded text to count total words, unique terms, and per-keyword frequency as a percentage, sorted by density descending. No signup or account required.',
    seoDescription: 'Free online Keyword Density Checker — Parses pasted or uploaded text to count total words, unique terms, and per-keyword frequency as a percentage, sorted by density descending. ',
    dependencies: "Vanilla JS"
  },
  {
    id: "172",
    name: "Base64 to Image",
    slug: "base64-to-image",
    category: "Developer",
    description: 'Decodes a Base64 data string back into its original image format and displays a preview directly in the browser with a download button. No signup or account required.',
    seoDescription: 'Free online Base64 to Image — Decodes a Base64 data string back into its original image format and displays a preview directly in the browser with a download button. ',
    dependencies: "Vanilla JS"
  },
  {
    id: "174",
    name: "MD5 & SHA Hash Generator",
    slug: "md5-hash-generator",
    category: "Developer",
    description: 'Compute MD5, SHA-1, SHA-256, and SHA-512 hashes from text or file input using CryptoJS.',
    seoDescription: 'Free online MD5 & SHA Hash Generator — Compute MD5, SHA-1, SHA-256, and SHA-512 cryptographic hashes from text or file input. All processing happens in your browser, nothing is uploaded.',
    dependencies: "CryptoJS"
  },
  {
    id: "175",
    name: "HTML Minifier",
    slug: "html-minifier",
    category: "Developer",
    description: 'Removes unnecessary whitespace, comments, and optional closing tags from HTML code to reduce file size without altering rendered output. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online HTML Minifier — Removes unnecessary whitespace, comments, and optional closing tags from HTML code to reduce file size without altering rendered output. ',
    dependencies: "html-minifier"
  },
  {
    id: "176",
    name: "Barcode Generator",
    slug: "barcode-generator",
    category: "Utility",
    description: 'Generates scannable barcodes in major symbologies including EAN-13, Code 128, QR Code, and UPC-A from typed input or pasted data. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Barcode Generator — Generates scannable barcodes in major symbologies including EAN-13, Code 128, QR Code, and UPC-A from typed input or pasted data. ',
    dependencies: "JsBarcode"
  },
  {
    id: "181",
    name: "PGP Key Generator",
    slug: "pgp-key-generator",
    category: "Privacy",
    description: 'Generates RSA (2048/4096) or ECDSA (Curve25519) PGP key pairs with customizable user IDs, expiration dates, and passphrase protection. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online PGP Key Generator — Generates RSA (2048/4096) or ECDSA (Curve25519) PGP key pairs with customizable user IDs, expiration dates, and passphrase protection. ',
    dependencies: "OpenPGP.js"
  },
  {
    id: "182",
    name: "Add Page Numbers to PDF",
    slug: "add-page-numbers-to-pdf",
    category: "PDF",
    description: 'Inserts page number labels at user-chosen positions (bottom-center, top-right, etc.) with configurable font, size, and starting offset. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Add Page Numbers to PDF — Inserts page number labels at user-chosen positions (bottom-center, top-right, etc.) with configurable font, size, and starting offset. ',
    dependencies: "pdf-lib"
  },
  {
    id: "167c",
    name: "Markdown Tools",
    slug: "markdown-tools",
    category: "Converter",
    description: 'Renders GitHub-Flavored Markdown to HTML, converts text/HTML to Markdown, or strips Markdown to plain text — all in one tool.',
    seoDescription: 'Free online Markdown Tools — Render GitHub-Flavored Markdown to HTML, convert text or HTML to Markdown, or strip Markdown formatting to plain text. ',
    dependencies: "marked.js, Turndown"
  },
  {
    id: "184",
    name: "Reverse Text Generator",
    slug: "reverse-text-generator",
    category: "Text",
    description: 'Applies five distinct text transformations: reverse entire string order, reverse each word individually, flip upside down using rot180 Unicode, mirror horizontally, and rotate 180 degrees. Perfect for creating puzzles, secret messages, palindromes, and attention-grabbing social media content.',
    seoDescription: 'Free online Reverse Text Generator — reverse text order, reverse words one by one, flip upside down, mirror horizontally, or rotate 180 degrees. Perfect for puzzles, secret messages, and unique social content. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Your Text", desc: "Type or paste the text you want to transform. Each transformation previews instantly — no waiting or processing time." },
      { title: "2. Pick a Transformation", desc: "Choose from reverse entire order, reverse each word, flip upside down (using Unicode rot180 characters), mirror left-to-right, or full 180-degree rotation." },
      { title: "3. Copy & Share", desc: "Click any result to copy. Use reversed text for puzzles and riddles, flipped text for attention-grabbing social posts, or mirrored text for creative designs." },
    ],
    faqs: [
      { question: "What's the use of reverse text?", answer: "Reverse text is popular for puzzles (write a message backwards and challenge friends to read it), secret codes (reversed words are hard to skim), social media content that stops the scroll, and creative writing exercises that play with language structure." },
      { question: "How does the upside-down flip work?", answer: "The upside-down flip uses Unicode rot180 characters that rotate each letter 180 degrees (like ʇxǝʇ). This is different from CSS rotation — it uses dedicated Unicode characters so it works anywhere Unicode is supported, not just on web pages." },
      { question: "Can I use this for puzzle design?", answer: "Yes. Reverse Text Generator is ideal for puzzle makers. Write clues in reverse, create mirror messages, or use the upside-down effect for treasure hunts, escape rooms, brain teasers, and social media engagement challenges." },
      { question: "Is mirrored text readable?", answer: "Mirrored text reverses left-to-right — it's readable when held up to a mirror. It's popular for creative social media posts (car window reflections, glass surfaces) and design elements that need a reflection effect." },
    ]
  },
  {
    id: "185",
    name: "Zalgo Text Generator",
    slug: "zalgo-text-generator",
    category: "Text",
    description: 'Adds combining diacritical marks above, below, and through each character to create intentionally corrupted ‘zalgo’ glitch text. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Zalgo Text Generator — Adds combining diacritical marks above, below, and through each character to create intentionally corrupted ‘zalgo’ glitch text. ',
    dependencies: "Vanilla JS",        },
  {
    id: "186",
    name: "Invisible Text Generator",
    slug: "invisible-text-generator",
    category: "Text",
    description: 'Generates blank Unicode characters—zero-width spaces, hair spaces, and invisible separators—that appear as empty text. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Invisible Text Generator — Generates blank Unicode characters—zero-width spaces, hair spaces, and invisible separators—that appear as empty text. ',
    dependencies: "Vanilla JS"
  },
  {
    id: "187",
    name: "LTV Calculator",
    slug: "ltv-calculator",
    category: "Calculator",
    description: 'Projects customer lifetime value using average order value, purchase frequency, gross margin, and estimated customer lifespan in months. SaaS founders and e-commerce operators use LTV to determine acquisition budgets, segment high-value customers, and forecast recurring revenue.',
    seoDescription: 'Free online LTV Calculator — project customer lifetime value from order value, purchase frequency, margin, and lifespan. SaaS and e-commerce essential for acquisition budgeting and revenue forecasting. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Purchase Behavior", desc: "Input average order value (AOV), purchase frequency per month, and gross margin percentage." },
      { title: "2. Enter Customer Lifespan", desc: "Input the average customer lifespan in months — how long customers typically stay active." },
      { title: "3. Review LTV Metrics", desc: "The calculator shows LTV per customer, LTV-to-CAC ratio (when paired with your CAC), and revenue projection. Use these to optimize your acquisition spend." },
    ],
    faqs: [
      { question: "How is this different from the CAC Calculator?", answer: "LTV Calculator projects the total revenue a customer generates over their lifetime. CAC Calculator totals the cost to acquire a new customer. Together (LTV:CAC ratio) they tell you whether your acquisition spending is efficient — a 3:1 ratio is typically healthy." },
      { question: "What's a good LTV:CAC ratio?", answer: "A ratio of 3:1 is considered healthy — you earn 3x what you spent to acquire the customer. Below 1:1 means you're losing money on each customer. Above 5:1 suggests you may be under-investing in growth." },
      { question: "Can I use this for subscription businesses?", answer: "Yes. For subscriptions, use monthly subscription fee as average order value, set frequency to 1 (monthly), and enter your typical churn-based lifespan. SaaS businesses rely heavily on LTV analysis." },
      { question: "Does LTV include upsells and referrals?", answer: "This calculator uses base values. For more accurate LTV, factor in expansion revenue (upsells, cross-sells) by increasing the average order value, and referral revenue by adjusting purchase frequency upward." },
    ]
  },
  {
    id: "188",
    name: "CAC Calculator",
    slug: "cac-calculator",
    category: "Calculator",
    description: 'Divides total sales-and-marketing spend by the number of new customers acquired in the same period to produce a blended acquisition cost. Startups and growth teams use CAC to evaluate marketing channel efficiency, optimize ad spend, and benchmark against LTV.',
    seoDescription: 'Free online CAC Calculator — divide total sales and marketing spend by new customers acquired to find your customer acquisition cost. Essential for startup growth, ad spend optimization, and LTV benchmarking. ',
    dependencies: "Vanilla JS",
    instructions: [
      { title: "1. Enter Marketing Spend", desc: "Input your total sales and marketing costs for the period — ad spend, salaries, tools, agency fees, and overhead." },
      { title: "2. Enter New Customers", desc: "Input the number of new customers acquired during the same period." },
      { title: "3. Review Your CAC", desc: "The calculator shows your blended cost per acquisition. Compare this against your LTV to determine if your acquisition strategy is profitable." },
    ],
    faqs: [
      { question: "How is this different from the LTV Calculator?", answer: "CAC Calculator tells you what it costs to acquire each new customer — critical for budget allocation. LTV Calculator projects how much revenue each customer generates over their lifetime. The LTV:CAC ratio (target 3:1) tells you whether your acquisition spend is efficient." },
      { question: "What's a good CAC?", answer: "A good CAC depends on your industry and business model. SaaS companies typically target CAC under $200 for self-serve and up to $2,000+ for enterprise sales. E-commerce CAC varies from $10-$100+ per customer. The key metric is LTV:CAC ratio, not the raw number." },
      { question: "Should I include all marketing costs?", answer: "Include all direct and indirect costs: ad spend, content creation, salaries of marketing and sales team, software tools, agency fees, and allocated overhead. A fully-loaded CAC gives you an accurate picture of acquisition efficiency." },
      { question: "Can I calculate CAC by channel?", answer: "This calculator provides blended CAC across all channels. For channel-specific analysis, run the tool separately for each channel's spend and customer count to compare which channels are most efficient." },
    ]
  },
  {
    id: "189",
    name: "Burn Rate Calculator",
    slug: "burn-rate-calculator",
    category: "Calculator",
    description: 'Calculates gross burn, net burn, and runway (in months) from monthly revenue, operating expenses, and current cash balance. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Burn Rate Calculator — Calculates gross burn, net burn, and runway (in months) from monthly revenue, operating expenses, and current cash balance. ',
    dependencies: "Vanilla JS"
  },
  {
    id: "190",
    name: "Net Promoter Score Calculator",
    slug: "net-promoter-score-calculator",
    category: "Branding",
    description: 'Categorizes survey responses into promoters, passives, and detractors. Customer experience teams use it to track loyalty metrics. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Net Promoter Score Calculator — Categorizes survey responses into promoters, passives, and detractors. Customer experience teams use it to track loyalty metrics. ',
    dependencies: "Vanilla JS"
  },
  {
    id: "191",
    name: "XML to CSV",
    slug: "xml-to-csv",
    category: "Converter",
    description: 'Converts XML files to CSV format — enterprise systems, SOAP APIs, document formats like DOCX and SVG to spreadsheets, database exports, and data imports. All conversion happens locally in your browser with no file size limits.',
    seoDescription: 'Free online XML to CSV — Parses XML documents of any depth and transforms elements and attributes into a tabular CSV structure with automatically generated column paths. ',
    dependencies: "xml2js / PapaParse",
    showInCategory: false
  },
  {
    id: "192",
    name: "PDF Metadata Editor",
    slug: "pdf-metadata-editor",
    category: "PDF",
    description: 'Displays and allows editing of standard PDF metadata fields: title, author, subject, keywords, and producer. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online PDF Metadata Editor — Displays and allows editing of standard PDF metadata fields: title, author, subject, keywords, and producer. ',
    dependencies: "pdf-lib"
  },
  {
    id: "193",
    name: "SVG Editor",
    slug: "svg-editor",
    category: "Design",
    description: 'SVG Editor provides a visual canvas for manipulating SVG elements with node selection, transform handles, and attribute editing. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online SVG Editor — SVG Editor provides a visual canvas for manipulating SVG elements with node selection, transform handles, and attribute editing. ',
    dependencies: "SVGO / Fabric.js"
  },
  {
    id: "194",
    name: "Robots.txt Generator",
    slug: "robots-txt-generator",
    category: "SEO",
    description: 'Produces a robots.txt file from a point-and-click form where you set allowed and disallowed paths, crawl delays, and sitemap references. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Robots.txt Generator — Produces a robots.txt file from a point-and-click form where you set allowed and disallowed paths, crawl delays, and sitemap references. ',
    dependencies: "Vanilla JS"
  },
  {
    id: "195",
    name: "SaaS Pricing Calculator",
    slug: "saas-pricing-calculator",
    category: "Calculator",
    description: 'Models subscription revenue across tiers (free, monthly, annual) with inputs for conversion rate, churn, customer count, and average revenue. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online SaaS Pricing Calculator — Models subscription revenue across tiers (free, monthly, annual) with inputs for conversion rate, churn, customer count, and average revenue. ',
    dependencies: "Vanilla JS"
  },
  {
    id: "196",
    name: "Employee Turnover Calculator",
    slug: "employee-turnover-calculator",
    category: "Calculator",
    description: "Calculate employee turnover rate Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online Employee Turnover Calculator — Calculate employee turnover rate ',
    dependencies: "Vanilla JS"
  },
  {
    id: "197",
    name: "MAC Address Generator",
    slug: "mac-address-generator",
    category: "Privacy",
    description: 'Generates random MAC addresses in six common formats with optional OUI prefix. Supports Unix, Windows, Cisco, and dot-separated styles.',
    seoDescription: 'Free online MAC Address Generator — Generates random MAC addresses in six common formats (Unix, Windows, Cisco, colon-separated, hyphen-separated, and dot-separated) with optional OUI. ',
    dependencies: "Vanilla JS"
  },
  {
    id: "198",
    name: "IP Anonymizer",
    slug: "ip-anonymizer",
    category: "Privacy",
    description: "Anonymize IP addresses in logs Everything runs locally in your browser — nothing is uploaded.",
    seoDescription: 'Free online IP Anonymizer — Anonymize IP addresses in logs ',
    dependencies: "Vanilla JS"
  },
  {
    id: "199",
    name: "XML to JSON",
    slug: "xml-to-json",
    category: "Converter",
    description: 'Transforms well-formed XML documents into equivalent JSON structures, mapping attributes to prefixed keys and text content.',
    seoDescription: 'Free online XML to JSON — Transforms well-formed XML documents into equivalent JSON structures, mapping attributes to prefixed keys and text content to a configurable key. ',
    dependencies: "xml2js",
    showInCategory: false
  },
  {
    id: "200",
    name: "Braille Translator",
    slug: "braille-translator",
    category: "Text",
    description: 'Bidirectional converter between standard English text and Grade 1 (uncontracted) or Grade 2 (contracted) Braille.',
    seoDescription: 'Free online Braille Translator — Bidirectional converter between standard English text and Grade 1 or Grade 2 Braille. ',
    dependencies: "Vanilla JS"
  },
  {
    id: "201",
    name: "Passport Photo Maker (India)",
    slug: "passport-photo-india",
    category: "indian-utilities",
    description: "3.5x4.5 cm cropper for Indian passport photos",
    seoDescription: 'Free online Passport Photo Maker (India) — 3.5x4.5 cm cropper for Indian passport photos.',
    dependencies: "Canvas API / react-cropper"
  },
  {
    id: "202",
    name: "Aadhaar Wallet Cropper",
    slug: "aadhaar-wallet-cropper",
    category: "indian-utilities",
    description: 'Crops Aadhaar card images to the standard 3.5 x 3.5 cm wallet-photo size, automatically detecting the face region using OpenCV Haar cascades. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online Aadhaar Wallet Cropper — Crops Aadhaar card images to the standard 3.5 x 3.5 cm wallet-photo size, automatically detecting the face region using OpenCV Haar cascades. ',
    dependencies: "Canvas API"
  },
  {
    id: "203",
    name: "PAN Card Resizer",
    slug: "pan-card-resizer",
    category: "indian-utilities",
    description: 'Resizes PAN card images to 3 x 4 cm (the standard size for laminated identification) while maintaining legibility of the printed text and hologram. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online PAN Card Resizer — Resizes PAN card images to 3 x 4 cm (the standard size for laminated identification) while maintaining legibility of the printed text and hologram. ',
    dependencies: "Canvas API"
  },
  {
    id: "210",
    name: "Live Transcription",
    slug: "live-transcription",
    category: "Transcription",
    description: 'Live Transcription performs real-time speech-to-text using the browser’s native microphone API with continuous streaming output. No signup or account required.',
    seoDescription: 'Free online Live Transcription — Live Transcription performs real-time speech-to-text using the browser’s native microphone API with continuous streaming output. ',
    dependencies: "Web Speech API"
  },
  {
    id: "211",
    name: "Image Bulk Converter",
    slug: "image-bulk-converter",
    category: "Image",
    description: 'Processes an arbitrary number of uploaded images sequentially, converting between JPEG, PNG, WebP, AVIF, GIF, and TIFF in a single batch. No signup or account required.',
    seoDescription: 'Free online Image Bulk Converter — Processes an arbitrary number of uploaded images sequentially, converting between JPEG, PNG, WebP, AVIF, GIF, and TIFF in a single batch. ',
    dependencies: "browser-image-compression / jszip",
    isPro: true,
  
    instructions: [

      {
            "title": "1. Upload Images",
            "desc": "Select multiple images (JPEG, PNG, WebP, AVIF, GIF, TIFF) from your device. You can upload dozens at once."
      },
      {
            "title": "2. Choose Output Format",
            "desc": "Select the target format for all images. Every uploaded image will be converted to this format in one batch."
      },
      {
            "title": "3. Download All as ZIP",
            "desc": "All converted images are packaged into a single ZIP archive. Click download to save everything at once."
      }

    ],
    faqs: [

      {
            "question": "What image formats does the bulk converter support?",
            "answer": "The bulk image converter handles JPEG, PNG, WebP, AVIF, GIF, and TIFF formats. You can convert any input format to any output format in a single batch."
      },
      {
            "question": "What's the maximum number of images I can convert at once?",
            "answer": "Free users can convert up to 10 images per batch. Pro users can convert unlimited images. All processing happens in your browser — there are no server-side upload limits."
      },
      {
            "question": "Do I need to download images one by one?",
            "answer": "No. All converted images are automatically packaged into a single ZIP file for one-click download. Each image retains its original filename with the new extension."
      },
      {
            "question": "Is bulk image conversion private?",
            "answer": "Yes. All images are processed entirely in your browser using Canvas API. Your images never leave your device, making it safe for sensitive content."
      }

    ],},
  {
    id: "212",
    name: "eSign PDF",
    slug: "esign-pdf",
    category: "PDF",
    description: 'Places a typed, drawn, or uploaded signature image onto a specific page and coordinate of a PDF document. No signup or account required.',
    seoDescription: 'Free online eSign PDF — Places a typed, drawn, or uploaded signature image onto a specific page and coordinate of a PDF document. ',
    dependencies: "pdf-lib / fabric"
  },
  {
    id: "213",
    name: "PDF OCR (Scanned Docs)",
    slug: "pdf-ocr",
    category: "PDF",
    description: 'Extracts searchable text from scanned PDF documents and image-only PDFs using optical character recognition with language auto-detection. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online PDF OCR (Scanned Docs) — Extracts searchable text from scanned PDF documents and image-only PDFs using optical character recognition with language auto-detection. ',
    dependencies: "tesseract.js"
  },
  {
    id: "214",
    name: "PDF Form Filler",
    slug: "pdf-form-filler",
    category: "PDF",
    description: 'Detects interactive form fields in a PDF and provides a clean UI to fill text inputs, checkboxes, and dropdowns before downloading the completed. Everything runs locally in your browser — nothing is uploaded.',
    seoDescription: 'Free online PDF Form Filler — Detects interactive form fields in a PDF and provides a clean UI to fill text inputs, checkboxes, and dropdowns before downloading the completed. ',
    dependencies: "pdf-lib"
  },
  {
    id: "216",
    name: "AI Document Chat (RAG)",
    slug: "ai-document-chat",
    category: "AI",
    description: 'Indexes uploaded PDFs, Word files, and plain-text documents into a vector store and lets you ask natural-language questions about their contents.',
    dependencies: "CF Vectorize",
    seoDescription: 'Chat with your documents using AI — upload PDFs, Word files, and ask natural-language questions. Free online RAG tool. Uses cloud-based processing.',
  },
  {
    id: "217",
    name: "AI Video Subtitler",
    slug: "ai-video-subtitler",
    category: "AI",
    description: 'Transcribes speech from video files and syncs the resulting subtitles to the exact timing of each utterance. Uses cloud-based processing.',
    seoDescription: 'Free online AI Video Subtitler — Transcribes speech from video files and syncs the resulting subtitles to the exact timing of each utterance. ',
    dependencies: "Whisper API"
  },
  {
    name: 'Subtitle Generator',
    slug: 'subtitle-generator',
    description: 'Generate SRT subtitle files from video automatically. Supports multiple languages with accurate timestamp alignment for your videos.',
    seoDescription: 'Free online Subtitle Generator — Generate SRT files from video. ',
    category: 'Video',
    id:  "219",
    dependencies: 'None'
  },
];
