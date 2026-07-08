export type ToolCategory =
  | "PDF"
  | "Image"
  | "Text"
  | "Developer"
  | "Finance"
  | "Utility"
  | "Converter"
  | "Video"
  | "Audio"
  | "Branding"
  | "Productivity"
  | "Privacy"
  | "Design"
  | "Transcription"
  | "Extension"
  | "SEO"
  | "Marketing"
  | "indian-utilities"
  | "AI"
  | "Health"
  | "HR"
  | "Business"
  | "E-commerce"
  | "Lifestyle";

export interface ToolMetadata {
  id: string;
  name: string;
  slug: string;
  category: ToolCategory;
  description: string;
  dependencies: string;
  isPro?: boolean;
  instructions?: { title: string; desc: string }[];
  faqs?: { question: string; answer: string }[];
  seoDescription?: string;
}

const rawToolsRegistry: ToolMetadata[] = [
  {
    id: "add-text-1",
    name: "Add Text to Photo",
    description: 'Overlays custom text captions onto images with control over font, size, color, alignment, opacity, and rotation angle.',
    seoDescription: 'Free online Add Text to Photo — Overlays custom text captions onto images with control over font, size, color, alignment, opacity, and rotation angle. 100% browser-based, no uploads.',
    category: "Image",
    slug: "add-text-to-photo",
    dependencies: "Canvas API",
  },
  {
    id: "batch-edit-1",
    name: "Batch Image Editor",
    description: 'Applies resize, crop, rotate, format conversion, and compression settings to dozens of images simultaneously with one click.',
    seoDescription: 'Free online Batch Image Editor — Applies resize, crop, rotate, format conversion, and compression settings to dozens of images simultaneously with one click. 100% browser-based, no uploads.',
    category: "Image",
    slug: "batch-image-editor",
    dependencies: "Canvas API, jszip",
    isPro: true,
  },


  {
    id: "vid-mp3-1",
    name: "Video to MP3 Converter",
    description: 'Extracts the audio track from uploaded video files (MP4, MOV, AVI, WebM) and encodes it as a high-quality MP3 file.',
    seoDescription: 'Free online Video to MP3 Converter — Extracts the audio track from uploaded video files (MP4, MOV, AVI, WebM) and encodes it as a high-quality MP3 file. 100% browser-based, no uploads.',
    category: "Video",
    slug: "video-to-mp3",
    dependencies: "ffmpeg",
  },

  {
    id: "vid-crop-1",
    name: "Crop Video",
    description: "Crop the visual area of your MP4 video entirely in the browser.",
    seoDescription: 'Free online Crop Video — Crop the visual area of your MP4 video entirely in the browser. 100% browser-based, no uploads.',
    category: "Video",
    slug: "crop-video",
    dependencies: "ffmpeg",
  },
  {
    id: "dev-json-xml-1",
    name: "JSON to XML",
    description: 'Transforms valid JSON documents into well-formed XML using customizable root-element naming and array-handling rules.',
    seoDescription: 'Free online JSON to XML — Transforms valid JSON documents into well-formed XML using customizable root-element naming and array-handling rules. 100% browser-based, no uploads.',
    category: "Developer",
    slug: "json-to-xml",
    dependencies: "xml2js",
  },
  {
    id: "time-conv-1",
    name: "Time Converter",
    description: 'Converts a given date and time between any two time zones from a database of 400+ IANA time zones, and simultaneously displays it in Unix timestamp.',
    seoDescription: 'Free online Time Converter — Converts a given date and time between any two time zones from a database of 400+ IANA time zones, and simultaneously displays it in Unix timestamp. 100% browser-based, no uploads.',
    category: "Converter",
    slug: "time-converter",
    dependencies: "None",
  },

  {
    id: "arch-conv-1",
    name: "Archive Converter",
    description: "Convert ZIP files to TAR, RAR, or uncompressed archives directly in your browser.",
    seoDescription: 'Free online Archive Converter — Convert ZIP files to TAR, RAR, or uncompressed archives directly in your browser. 100% browser-based, no uploads.',
    category: "Converter",
    slug: "archive-converter",
    dependencies: "jszip",
  },

  {
    id: "pdf-heic-1",
    name: "HEIC to PDF",
    description: 'Converts High-Efficiency Image Container (HEIC) photos from iPhones and iPads into standard PDF documents.',
    seoDescription: 'Free online HEIC to PDF — Converts High-Efficiency Image Container (HEIC) photos from iPhones and iPads into standard PDF documents. 100% browser-based, no uploads.',
    category: "PDF",
    slug: "heic-to-pdf",
    dependencies: "pdf-lib, heic2any",
  },
  {
    id: "2",
    name: 'Privacy Cleaner',
    slug: 'privacy-cleaner',
    category: 'Utility',
    description: 'Scans and clears browser cookies, localStorage, sessionStorage, and cached data for the current site.',
    seoDescription: 'Free online Privacy Cleaner — Scans and clears browser cookies, localStorage, sessionStorage, and cached data for the current site. 100% browser-based, no uploads.',
    dependencies: 'Vanilla JS'
  },
  {
    id: "7",
    name: "AI Translator",
    slug: "ai-translator",
    category: "AI",
    description: 'Detects source language automatically and translates text between 100+ languages using advanced neural machine translation.',
    dependencies: "Google Cloud Translation API",
    seoDescription: 'Free AI translator online — translate text between 100+ languages instantly. Automatic language detection. No sign-up needed, works in your browser.'
  },

  {
    id: "9",
    name: "PDF to Word",
    slug: "pdf-to-word",
    category: "PDF",
    description: 'Extracts text content and basic formatting from PDF files and assembles them into editable .docx Word documents.',
    dependencies: "pdf2docx / PDF.js",
    seoDescription: 'Convert PDF to Word online free — extract PDF content into editable DOCX files. Preserves formatting. 100% client-side, no uploads needed.'
  },
  {
    id: "10",
    name: "AI Image Generator",
    slug: "ai-image-generator",
    category: "AI",
    description: 'Transforms text prompts into high-resolution images using advanced diffusion models. Designers and marketers use it for rapid visual prototyping.',
    dependencies: "Stable Diffusion API",
    seoDescription: 'Generate stunning AI images from text prompts — free online. Turn your ideas into high-resolution visuals instantly. Powered by advanced diffusion models.'
  },
  {
    id: "11",
    name: "Speed Test",
    slug: "speed-test",
    category: "Utility",
    description: 'Measures your internet connection’s download speed, upload speed, and latency by transferring real test data to geographically distributed servers.',
    seoDescription: 'Free online Speed Test — Measures your internet connection’s download speed, upload speed, and latency by transferring real test data to geographically distributed servers. 100% browser-based, no uploads.',
    dependencies: "WebSockets / WebRTC"
  },
  {
    id: "14",
    name: "Compress Image to 50KB",
    slug: "compress-image-to-50kb",
    category: "Image",
    description: 'Reduces image file size to 50 KB or below by adjusting JPEG quality, reducing pixel dimensions, or stripping metadata.',
    seoDescription: 'Free online Compress Image to 50KB — Reduces image file size to 50 KB or below by adjusting JPEG quality, reducing pixel dimensions, or stripping metadata. 100% browser-based, no uploads.',
    dependencies: "browser-image-compression"
  },
  {
    id: "15",
    name: "Currency Converter",
    slug: "currency-converter",
    category: "Finance",
    description: 'Converts between 160+ world currencies using real-time exchange rates sourced from central banks and financial data providers.',
    seoDescription: 'Free online Currency Converter — Converts between 160+ world currencies using real-time exchange rates sourced from central banks and financial data providers. 100% browser-based, no uploads.',
    dependencies: "ExchangeRate-API"
  },
  {
    id: "16",
    name: "Logo Maker",
    slug: "logo-maker",
    category: "Branding",
    description: 'Logo Maker provides a drag-and-drop canvas with shape libraries, text tools, and icon collections for building brand logos.',
    dependencies: "Fabric.js / Canvas API",
    seoDescription: 'Free logo maker online — design professional logos with drag-and-drop tools. Choose from shape libraries, icons, and text styles. No design skills needed.'
  },
  {
    id: "17",
    name: "MP4 to MP3",
    slug: "mp4-to-mp3",
    category: "Converter",
    description: 'Extracts the audio track from MP4 video files and saves it as a standalone MP3 file, preserving original bitrate and sample rate.',
    dependencies: "FFmpeg",
    seoDescription: 'Convert MP4 to MP3 online free — extract audio from video files and download as MP3. High-quality, preserves bitrate. 100% free, no uploads.'
  },
  {
    id: "pdf-comp-1",
    name: "PDF Compressor",
    description: 'Reduces PDF file size by compressing embedded images and removing redundant metadata. Offers three compression tiers. Max 50MB.',
    category: "PDF",
    slug: "pdf-compressor",
    dependencies: "Ghostscript / PDF-lib",
    seoDescription: 'Reduce PDF file size by up to 90% — free, instant, and 100% in your browser. Compress, shrink, and optimize PDFs with zero uploads, zero data leaving your device.'
  },
  {
    id: "19",
    name: "Word to PDF",
    slug: "word-to-pdf",
    category: "PDF",
    description: 'Converts .docx and .doc files to PDF while preserving fonts, tables, images, headers, and embedded formatting.',
    seoDescription: 'Free online Word to PDF — Converts .docx and .doc files to PDF while preserving fonts, tables, images, headers, and embedded formatting. 100% browser-based, no uploads.',
    dependencies: "LibreOffice API / CloudConvert API"
  },

  {
    id: "21",
    name: "Percentage Calculator",
    slug: "percentage-calculator",
    category: "Finance",
    description: 'Computes percentage values, percentage increases and decreases, and what-percent-of-what relationships with precise decimal arithmetic.',
    seoDescription: 'Free online Percentage Calculator — Computes percentage values, percentage increases and decreases, and what-percent-of-what relationships with precise decimal arithmetic. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "22",
    name: "JPG to PDF",
    slug: "jpg-to-pdf",
    category: "PDF",
    description: 'Merges one or more JPG images into a single multi-page PDF file in the order you arrange them.',
    seoDescription: 'Free online JPG to PDF — Merges one or more JPG images into a single multi-page PDF file in the order you arrange them. 100% browser-based, no uploads.',
    dependencies: "jsPDF / Canvas API"
  },

  {
    id: "26",
    name: "Age Calculator",
    slug: "age-calculator",
    category: "Utility",
    description: 'Computes exact age in years, months, days, hours, minutes, and seconds from a given birth date relative to any target date.',
    seoDescription: 'Free online Age Calculator — Computes exact age in years, months, days, hours, minutes, and seconds from a given birth date relative to any target date. 100% browser-based, no uploads.',
    dependencies: "Date-fns / Moment.js"
  },
  {
    id: "27",
    name: "HEIC to JPG",
    slug: "heic-to-jpg",
    category: "Image",
    description: 'Decodes Apple HEIC photos and converts them to universally compatible JPG files while preserving EXIF metadata like location and camera settings.',
    seoDescription: 'Free online HEIC to JPG — Decodes Apple HEIC photos and converts them to universally compatible JPG files while preserving EXIF metadata like location and camera settings. 100% browser-based, no uploads.',
    dependencies: "heic2any"
  },
  {
    id: "28",
    name: "PDF to JPG",
    slug: "pdf-to-jpg",
    category: "PDF",
    description: 'Renders each PDF page as a high-quality JPG image, preserving layout, fonts, and embedded graphics exactly as they appear.',
    seoDescription: 'Free online PDF to JPG — Renders each PDF page as a high-quality JPG image, preserving layout, fonts, and embedded graphics exactly as they appear. 100% browser-based, no uploads.',
    dependencies: "PDF.js / Canvas API"
  },
  {
    id: "29",
    name: "PDF to PPT",
    slug: "pdf-to-ppt",
    category: "PDF",
    description: 'Converts PDF content—including text, images, and vector graphics—into editable PowerPoint slides with preserved layout structure.',
    seoDescription: 'Free online PDF to PPT — Converts PDF content—including text, images, and vector graphics—into editable PowerPoint slides with preserved layout structure. 100% browser-based, no uploads.',
    dependencies: "pdf2json / PptxGenJS"
  },
  {
    id: "30",
    name: "Fancy Text Generator",
    slug: "fancy-text-generator",
    category: "Text",
    description: 'Creates stylized Unicode text in 40+ decorative styles including double-struck, bubble, cursive, gothic, and small caps.',
    seoDescription: 'Free online Fancy Text Generator — Creates stylized Unicode text in 40+ decorative styles including double-struck, bubble, cursive, gothic, and small caps. 100% browser-based, no uploads.',
    dependencies: "Unicode mapping"
  },

  {
    id: "33",
    name: "Background Remover",
    slug: "background-remover",
    category: "Image",
    description: 'Segments the foreground subject from an image using a neural network, producing a transparent PNG. Max 20MB.',
    dependencies: "rembg / OpenCV / TensorFlow.js",
    seoDescription: 'Remove image backgrounds automatically with AI — free online tool. Get a transparent PNG in seconds. No uploads, all processing happens in your browser.'
  },
  {
    id: "34",
    name: "WebP to JPG",
    slug: "webp-to-jpg",
    category: "Image",
    description: 'Converts WebP images into standard JPG format, making them usable in applications and websites that do not support Google’s modern format.',
    seoDescription: 'Free online WebP to JPG — Converts WebP images into standard JPG format, making them usable in applications and websites that do not support Google’s modern format. 100% browser-based, no uploads.',
    dependencies: "Canvas API"
  },
  {
    id: "35",
    name: "Wheel of Names",
    slug: "wheel-of-names",
    category: "Utility",
    description: 'Displays an animated spinning wheel that randomly selects one entry from a customizable list of names or options.',
    seoDescription: 'Free online Wheel of Names — Displays an animated spinning wheel that randomly selects one entry from a customizable list of names or options. 100% browser-based, no uploads.',
    dependencies: "Canvas API / GSAP"
  },
  {
    id: "36",
    name: "Image Compressor",
    slug: "image-compressor",
    category: "Image",
    description: 'Reduces JPG, PNG, WebP file sizes using smart compression. Side-by-side quality preview. Max 20MB per image.',
    dependencies: "HTML5 Canvas / libjpeg-turbo",
    seoDescription: 'Compress JPG, PNG, and WebP images online for free. Reduce file size without losing quality — side-by-side preview. 100% browser-based, nothing uploaded.'
  },
  {
    id: "37",
    name: "Object Remover",
    slug: "object-remover",
    category: "Image",
    description: 'Lets you brush over an unwanted object, blemish, or watermark in a photo, then fills the area with contextually plausible pixels.',
    seoDescription: 'Free online Object Remover — Lets you brush over an unwanted object, blemish, or watermark in a photo, then fills the area with contextually plausible pixels. 100% browser-based, no uploads.',
    dependencies: "Lama Cleaner"
  },
  {
    id: "38",
    name: "PPT to PDF",
    slug: "ppt-to-pdf",
    category: "PDF",
    description: 'Renders each PowerPoint slide as a page in a single PDF, maintaining embedded fonts, vector graphics, and slide transitions as static layout.',
    seoDescription: 'Free online PPT to PDF — Renders each PowerPoint slide as a page in a single PDF, maintaining embedded fonts, vector graphics, and slide transitions as static layout. 100% browser-based, no uploads.',
    dependencies: "LibreOffice API"
  },
  {
    id: "39",
    name: "Temporary Email Generator",
    slug: "temporary-email-generator",
    category: "Privacy",
    description: 'Creates disposable email inboxes that self-destruct after a user-configurable time limit (5 minutes to 48 hours).',
    seoDescription: 'Free online Temporary Email Generator — Creates disposable email inboxes that self-destruct after a user-configurable time limit (5 minutes to 48 hours). 100% browser-based, no uploads.',
    dependencies: "Mailinator API / Custom Backend"
  },
  {
    id: "40",
    name: "Screen Recorder Extension",
    slug: "screen-recorder-extension",
    category: "Extension",
    description: 'Generates a browser extension that captures browser tabs, full screens, or specific application windows with configurable resolution, frame rate.',
    seoDescription: 'Free online Screen Recorder Extension — Generates a browser extension that captures browser tabs, full screens, or specific application windows with configurable resolution, frame rate. 100% browser-based, no uploads.',
    dependencies: "MediaRecorder API"
  },
  {
    id: "41",
    name: "PDF Merger",
    slug: "pdf-merger",
    category: "PDF",
    description: 'Combines two or more PDF files into one contiguous document with a drag-and-drop reorder interface for the input list. Legal assistants compiling.',
    dependencies: "pdf-lib",
    seoDescription: 'Merge PDF files online free — combine multiple PDFs into one document with drag-and-drop reordering. No uploads, 100% secure and private.'
  },
  {
    id: "42",
    name: "QR Code Generator",
    slug: "qr-code-generator",
    category: "Utility",
    description: 'Renders a QR code from any text, URL, vCard, Wi-Fi config, or plain string using a client-side Reed-Solomon encoder.',
    dependencies: "qrcode.js",
    seoDescription: 'Free QR code generator online — create QR codes for URLs, vCards, Wi-Fi, and text. Download high-resolution PNG. 100% free, no account needed.'
  },

  {
    id: "44",
    name: "Excel to PDF",
    slug: "excel-to-pdf",
    category: "PDF",
    description: 'Converts Excel spreadsheets into properly paginated PDF files, respecting print areas, page orientation, and cell formatting.',
    seoDescription: 'Free online Excel to PDF — Converts Excel spreadsheets into properly paginated PDF files, respecting print areas, page orientation, and cell formatting. 100% browser-based, no uploads.',
    dependencies: "SheetJS / jsPDF"
  },
  {
    id: "45",
    name: "EMI Calculator",
    slug: "emi-calculator",
    category: "Finance",
    description: 'Splits a loan principal into equal monthly installments using the standard reducing-balance formula with configurable annual interest and tenure.',
    seoDescription: 'Free online EMI Calculator — Splits a loan principal into equal monthly installments using the standard reducing-balance formula with configurable annual interest and tenure. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "46",
    name: "Character Counter",
    slug: "character-counter",
    category: "Text",
    description: 'Counts characters (with and without spaces), words, sentences, paragraphs, and estimated reading time in real time as you type.',
    seoDescription: 'Free online Character Counter — Counts characters (with and without spaces), words, sentences, paragraphs, and estimated reading time in real time as you type. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "47",
    name: "Video to Text Transcription",
    slug: "video-to-text-transcription",
    category: "Transcription",
    description: 'Video to Text Transcription extracts speech from uploaded video files using on-device speech recognition.',
    seoDescription: 'Free online Video to Text Transcription — Video to Text Transcription extracts speech from uploaded video files using on-device speech recognition. 100% browser-based, no uploads.',
    dependencies: "Whisper API"
  },
  {
    id: "48",
    name: "Word Counter",
    slug: "word-counter",
    category: "Text",
    description: 'Provides a live dashboard of word count, sentence count, syllable count, readability scores (Flesch-Kincaid), and speaking time.',
    dependencies: "Vanilla JS",
    seoDescription: 'Free word counter online — count words, characters, sentences, syllables, and readability scores in real time. Perfect for writers, students, and SEO.'
  },
  {
    id: "49",
    name: "Crop Image",
    slug: "crop-image",
    category: "Image",
    description: 'Lets you drag a selection rectangle to crop an image to any pixel dimension, common social-media ratio (1:1, 16:9, 4:5), or exact preset like.',
    seoDescription: 'Free online Crop Image — Lets you drag a selection rectangle to crop an image to any pixel dimension, common social-media ratio (1:1, 16:9, 4:5), or exact preset like. 100% browser-based, no uploads.',
    dependencies: "Cropper.js"
  },
  {
    id: "50",
    name: "Social Media Post Maker",
    slug: "social-media-post-maker",
    category: "Branding",
    description: 'Social Media Post Maker offers platform-specific canvas templates and a library of stock graphics for creating social visuals.',
    seoDescription: 'Free online Social Media Post Maker — Social Media Post Maker offers platform-specific canvas templates and a library of stock graphics for creating social visuals. 100% browser-based, no uploads.',
    dependencies: "Fabric.js"
  },
  {
    id: "51",
    name: "MKV to MP4",
    slug: "mkv-to-mp4",
    category: "Converter",
    description: 'Re-encapsulates MKV video files into the more universally compatible MP4 container without re-encoding the underlying video stream.',
    seoDescription: 'Free online MKV to MP4 — Re-encapsulates MKV video files into the more universally compatible MP4 container without re-encoding the underlying video stream. 100% browser-based, no uploads.',
    dependencies: "FFmpeg"
  },
  {
    id: "52",
    name: "Text to Speech (TTS)",
    slug: "text-to-speech-tts",
    category: "Audio",
    description: "AI voice generator with Indian accents",
    dependencies: "Google Cloud TTS / ElevenLabs",
    seoDescription: 'Free text to speech online with Indian accents — convert text to natural-sounding audio. AI voices in Hindi, Tamil, Telugu, and more. No sign-up needed.'
  },
  {
    id: "53",
    name: "AI Paraphrasing Tool",
    slug: "ai-paraphrasing-tool",
    category: "AI",
    description: 'Rewrites sentences and paragraphs while preserving the original meaning and intent. Academics and content creators use it to avoid plagiarism.',
    dependencies: "HuggingFace",
    seoDescription: 'Free AI paraphrasing tool — rewrite sentences and paragraphs while preserving meaning. Perfect for students, writers, and content creators. 100% browser-based.'
  },
  {
    id: "54",
    name: "Random Number Generator",
    slug: "random-number-generator",
    category: "Utility",
    description: 'Generates cryptographically secure random integers or decimals within a user-defined min-max range with optional repetition filtering.',
    seoDescription: 'Free online Random Number Generator — Generates cryptographically secure random integers or decimals within a user-defined min-max range with optional repetition filtering. 100% browser-based, no uploads.',
    dependencies: "Math.random()"
  },
  {
    id: "55",
    name: "URL Shortener",
    slug: "url-shortener",
    category: "Utility",
    description: 'Takes any long URL and generates a compact, shareable short link with optional custom alias support.',
    seoDescription: 'Free online URL Shortener — Takes any long URL and generates a compact, shareable short link with optional custom alias support. 100% browser-based, no uploads.',
    dependencies: "Node.js / Redis"
  },

  {
    id: "58",
    name: "PDF to Excel",
    slug: "pdf-to-excel",
    category: "PDF",
    description: 'Extracts tabular data from PDF files and reconstructs it into editable Excel spreadsheets with proper column alignment.',
    dependencies: "pdf2json / SheetJS",
    seoDescription: 'Convert PDF to Excel online free — extract tables from PDF into editable XLSX spreadsheets. Accurate column alignment. 100% browser-based.'
  },
  {
    id: "59",
    name: "Unlock PDF",
    slug: "unlock-pdf",
    category: "PDF",
    description: 'Removes owner-level password restrictions from PDFs so you can edit, print, or copy content from protected documents.',
    seoDescription: 'Free online Unlock PDF — Removes owner-level password restrictions from PDFs so you can edit, print, or copy content from protected documents. 100% browser-based, no uploads.',
    dependencies: "qpdf"
  },
  {
    id: "60",
    name: "Image Enhancer",
    slug: "image-enhancer",
    category: "Image",
    description: 'Applies an AI super-resolution model to upscale images by 2x or 4x. Portrait photographers use it to rescue low-resolution files.',
    seoDescription: 'Free online Image Enhancer — Applies an AI super-resolution model to upscale images by 2x or 4x. Portrait photographers use it to rescue low-resolution files. 100% browser-based, no uploads.',
    dependencies: "Real-ESRGAN"
  },
  {
    id: "61",
    name: "SIP Calculator",
    slug: "sip-calculator",
    category: "Finance",
    description: 'Projects the future value of recurring mutual-fund investments using compounded monthly returns based on historical or assumed growth rates.',
    seoDescription: 'Free online SIP Calculator — Projects the future value of recurring mutual-fund investments using compounded monthly returns based on historical or assumed growth rates. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "62",
    name: "BMI Calculator",
    slug: "bmi-calculator",
    category: "Health",
    description: 'Computes Body Mass Index from metric or imperial height and weight inputs, categorizing the result into underweight, normal, overweight.',
    seoDescription: 'Free online BMI Calculator — Computes Body Mass Index from metric or imperial height and weight inputs, categorizing the result into underweight, normal, overweight. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "64",
    name: "Audio to Text Transcription",
    slug: "audio-to-text-transcription",
    category: "Transcription",
    description: 'Audio to Text Transcription converts spoken audio from uploaded files into editable text using browser-based speech APIs.',
    seoDescription: 'Free online Audio to Text Transcription — Audio to Text Transcription converts spoken audio from uploaded files into editable text using browser-based speech APIs. 100% browser-based, no uploads.',
    dependencies: "Whisper API"
  },
  {
    id: "66",
    name: "Meme Generator",
    slug: "meme-generator",
    category: "Image",
    description: 'Adds top-and-bottom text to any uploaded image with meme-style Impact font, customizable font size, stroke width, and white border.',
    seoDescription: 'Free online Meme Generator — Adds top-and-bottom text to any uploaded image with meme-style Impact font, customizable font size, stroke width, and white border. 100% browser-based, no uploads.',
    dependencies: "Canvas API"
  },
  {
    id: "67",
    name: "MOV to MP4",
    slug: "mov-to-mp4",
    category: "Converter",
    description: 'Transcodes QuickTime MOV files into MP4 format while optimizing for web playback and social media uploads.',
    seoDescription: 'Free online MOV to MP4 — Transcodes QuickTime MOV files into MP4 format while optimizing for web playback and social media uploads. 100% browser-based, no uploads.',
    dependencies: "FFmpeg"
  },
  {
    id: "68",
    name: "Resume Builder",
    slug: "resume-builder",
    category: "Utility",
    description: 'Provides a structured, form-based interface for entering work history, education, and skills, then renders a professionally formatted PDF resume.',
    seoDescription: 'Free online Resume Builder — Provides a structured, form-based interface for entering work history, education, and skills, then renders a professionally formatted PDF resume. 100% browser-based, no uploads.',
    dependencies: "React / html2pdf.js"
  },
  {
    id: "69",
    name: "AI Image Upscaler",
    slug: "ai-image-upscaler",
    category: "AI",
    description: 'Increases image resolution by up to 4x while reconstructing fine details that standard interpolation loses.',
    dependencies: "Real-ESRGAN",
    seoDescription: 'Upscale images online free with AI — increase resolution by 4x while reconstructing fine details. No uploads, 100% browser-based enhancement.'
  },
  {
    id: "70",
    name: "GST Calculator",
    slug: "gst-calculator",
    category: "Finance",
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
    seoDescription: 'Resize images online free — scale JPG, PNG, WebP to exact dimensions or percentage. Smart resampling preserves quality. 100% browser-based.'
  },
  {
    id: "72",
    name: "Password Generator",
    slug: "password-generator",
    category: "Utility",
    description: 'Generates cryptographically strong random passwords with fully customizable length, character sets, and pattern rules.',
    seoDescription: 'Free online Password Generator — Generates cryptographically strong random passwords with fully customizable length, character sets, and pattern rules. 100% browser-based, no uploads.',
    dependencies: "Crypto API"
  },
  {
    id: "73",
    name: "Diff Checker",
    slug: "diff-checker",
    category: "Developer",
    description: 'Compares two input texts side-by-side, highlighting inserted, deleted, and changed lines with distinct background colors.',
    seoDescription: 'Free online Diff Checker — Compares two input texts side-by-side, highlighting inserted, deleted, and changed lines with distinct background colors. 100% browser-based, no uploads.',
    dependencies: "diff-match-patch"
  },
  {
    id: "74",
    name: "WEBM to MP4",
    slug: "webm-to-mp4",
    category: "Converter",
    description: 'Converts WebM video files to MP4 format, which is critical for users whose editing software or sharing platforms reject WebM.',
    seoDescription: 'Free online WEBM to MP4 — Converts WebM video files to MP4 format, which is critical for users whose editing software or sharing platforms reject WebM. 100% browser-based, no uploads.',
    dependencies: "FFmpeg"
  },
  {
    id: "76",
    name: "IP Address Lookup",
    slug: "ip-address-lookup",
    category: "Utility",
    description: 'Displays your public IPv4 and IPv6 addresses with geolocation data (city, ISP, ASN, timezone). Network engineers use it to verify VPN connectivity.',
    seoDescription: 'Free online IP Address Lookup — Displays your public IPv4 and IPv6 addresses with geolocation data (city, ISP, ASN, timezone). Network engineers use it to verify VPN connectivity. 100% browser-based, no uploads.',
    dependencies: "MaxMind / IP-API"
  },


  {
    id: "79",
    name: "Photo Retoucher",
    slug: "photo-retoucher",
    category: "Image",
    description: 'Applies an AI-powered inpainting model to remove blemishes, scratches, dust spots, and skin imperfections from portrait and product photos.',
    seoDescription: 'Free online Photo Retoucher — Applies an AI-powered inpainting model to remove blemishes, scratches, dust spots, and skin imperfections from portrait and product photos. 100% browser-based, no uploads.',
    dependencies: "OpenCV"
  },
  {
    id: "80",
    name: "PDF Splitter",
    slug: "pdf-splitter",
    category: "PDF",
    description: 'Divides a single PDF into multiple files by page range, bookmark level, or a specified page count per split.',
    dependencies: "pdf-lib",
    seoDescription: 'Split PDF files online free — divide PDF by page range, bookmarks, or page count. Extract specific pages into separate files. No uploads, private.'
  },
  {
    id: "84",
    name: "Font Generator",
    slug: "font-generator",
    category: "Text",
    description: 'Converts plain ASCII text into dozens of Unicode-stylized variants including bold, script, fraktur, monospace, and decorative letter forms.',
    seoDescription: 'Free online Font Generator — Converts plain ASCII text into dozens of Unicode-stylized variants including bold, script, fraktur, monospace, and decorative letter forms. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "85",
    name: "Salary Calculator",
    slug: "salary-calculator",
    category: "HR",
    description: "Calculate net salary after taxes",
    seoDescription: 'Free online Salary Calculator — Calculate net salary after taxes 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "86",
    name: "Audio Cutter",
    slug: "audio-cutter",
    category: "Audio",
    description: "Trim and cut audio files online",
    seoDescription: 'Free online Audio Cutter — Trim and cut audio files online 100% browser-based, no uploads.',
    dependencies: "Web Audio API / FFmpeg"
  },
  {
    id: "87",
    name: "Pomodoro Timer",
    slug: "pomodoro-timer",
    category: "Productivity",
    description: 'Pomodoro Timer manages work and break intervals with fully customizable session lengths and auto-start options.',
    seoDescription: 'Free online Pomodoro Timer — Pomodoro Timer manages work and break intervals with fully customizable session lengths and auto-start options. 100% browser-based, no uploads.',
    dependencies: "Web Audio API / Vanilla JS"
  },

  {
    id: "90",
    name: "YouTube Transcript Generator",
    slug: "youtube-transcript-generator",
    category: "Transcription",
    description: 'YouTube Transcript Generator fetches captions from public YouTube videos via the video ID or URL.',
    seoDescription: 'Free online YouTube Transcript Generator — YouTube Transcript Generator fetches captions from public YouTube videos via the video ID or URL. 100% browser-based, no uploads.',
    dependencies: "YouTube Data API"
  },

  {
    id: "92",
    name: "EPUB to PDF",
    slug: "epub-to-pdf",
    category: "PDF",
    description: 'Converts EPUB ebooks to PDF with full control over page size, margins, font, and line spacing.',
    seoDescription: 'Free online EPUB to PDF — Converts EPUB ebooks to PDF with full control over page size, margins, font, and line spacing. 100% browser-based, no uploads.',
    dependencies: "Calibre API"
  },


  {
    id: "96",
    name: "Protect PDF",
    slug: "protect-pdf",
    category: "PDF",
    description: 'Encrypts a PDF with a user-chosen password using AES-128, restricting opening, printing, and copying as specified by the owner.',
    seoDescription: 'Free online Protect PDF — Encrypts a PDF with a user-chosen password using AES-128, restricting opening, printing, and copying as specified by the owner. 100% browser-based, no uploads.',
    dependencies: "pdf-lib"
  },
  {
    id: "97",
    name: "Invoice Generator",
    slug: "invoice-generator",
    category: "Finance",
    description: 'Produces downloadable PDF or HTML invoices with customizable line items, tax rates, discounts, and business logo placement.',
    seoDescription: 'Free online Invoice Generator — Produces downloadable PDF or HTML invoices with customizable line items, tax rates, discounts, and business logo placement. 100% browser-based, no uploads.',
    dependencies: "PDF-lib / Vue.js"
  },
  {
    id: "98",
    name: "Business Card Maker",
    slug: "business-card-maker",
    category: "Branding",
    description: 'Business Card Maker provides a WYSIWYG editor with snap-to-grid alignment and preset card dimensions.',
    seoDescription: 'Free online Business Card Maker — Business Card Maker provides a WYSIWYG editor with snap-to-grid alignment and preset card dimensions. 100% browser-based, no uploads.',
    dependencies: "React / Canvas API"
  },
  {
    id: "99",
    name: "Regex Tester",
    slug: "regex-tester",
    category: "Developer",
    description: 'Provides an interactive environment where users can write a regular expression pattern, test it against sample strings, and view real-time match.',
    seoDescription: 'Free online Regex Tester — Provides an interactive environment where users can write a regular expression pattern, test it against sample strings, and view real-time match. 100% browser-based, no uploads.',
    dependencies: "regex.js"
  },

  {
    id: "101",
    name: "Dice Roller",
    slug: "dice-roller",
    category: "Utility",
    description: 'Simulates rolling any number of dice with arbitrary side counts—d4, d6, d8, d10, d12, d20, d100, or custom values.',
    seoDescription: 'Free online Dice Roller — Simulates rolling any number of dice with arbitrary side counts—d4, d6, d8, d10, d12, d20, d100, or custom values. 100% browser-based, no uploads.',
    dependencies: "Three.js"
  },
  {
    id: "102",
    name: "Profit Margin Calculator",
    slug: "profit-margin-calculator",
    category: "Finance",
    description: 'Computes gross profit, net profit, and margin percentages from revenue and cost inputs. Small-business owners use it to price products.',
    seoDescription: 'Free online Profit Margin Calculator — Computes gross profit, net profit, and margin percentages from revenue and cost inputs. Small-business owners use it to price products. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "104",
    name: "Speech to Text",
    slug: "speech-to-text",
    category: "Audio",
    description: "Transcribe audio to text in multiple languages",
    seoDescription: 'Free online Speech to Text — Transcribe audio to text in multiple languages 100% browser-based, no uploads.',
    dependencies: "Whisper API / Web Speech API"
  },
  {
    id: "106",
    name: "PDF to EPUB",
    slug: "pdf-to-epub",
    category: "PDF",
    description: 'Converts static PDF documents into reflowable EPUB ebook format with adjustable font size, orientation, and screen adaptation.',
    seoDescription: 'Free online PDF to EPUB — Converts static PDF documents into reflowable EPUB ebook format with adjustable font size, orientation, and screen adaptation. 100% browser-based, no uploads.',
    dependencies: "Calibre API"
  },
  {
    id: "107",
    name: "Coin Flipper",
    slug: "coin-flipper",
    category: "Utility",
    description: 'Simulates a fair coin flip using a cryptographic random number generator, displaying heads or tails with a realistic animation.',
    seoDescription: 'Free online Coin Flipper — Simulates a fair coin flip using a cryptographic random number generator, displaying heads or tails with a realistic animation. 100% browser-based, no uploads.',
    dependencies: "CSS3 Animations"
  },
  {
    id: "108",
    name: "Image Colorizer",
    slug: "image-colorizer",
    category: "Image",
    description: 'Uses a deep-learning model trained on millions of historical photos to predict plausible per-pixel color for grayscale and sepia images.',
    seoDescription: 'Free online Image Colorizer — Uses a deep-learning model trained on millions of historical photos to predict plausible per-pixel color for grayscale and sepia images. 100% browser-based, no uploads.',
    dependencies: "DeOldify"
  },
  {
    id: "109",
    name: "EXIF Data Remover",
    slug: "exif-data-remover",
    category: "Privacy",
    description: 'Strips GPS coordinates, camera metadata, timestamps, and software fingerprints from JPEG and PNG images.',
    seoDescription: 'Free online EXIF Data Remover — Strips GPS coordinates, camera metadata, timestamps, and software fingerprints from JPEG and PNG images. 100% browser-based, no uploads.',
    dependencies: "exifr / Piexifjs"
  },
  {
    id: "110",
    name: "AVI to MP4",
    slug: "avi-to-mp4",
    category: "Converter",
    description: 'Converts legacy AVI video containers into modern MP4 files with H.264 encoding for drastically smaller file sizes.',
    seoDescription: 'Free online AVI to MP4 — Converts legacy AVI video containers into modern MP4 files with H.264 encoding for drastically smaller file sizes. 100% browser-based, no uploads.',
    dependencies: "FFmpeg"
  },
  {
    id: "111",
    name: "Video Compressor",
    slug: "video-compressor",
    category: "Video",
    description: "Reduce video file size without losing quality. Max 500MB per file.",
    dependencies: "FFmpeg / WebCodecs API",
    seoDescription: 'Compress video files online free — reduce MP4, MOV, and WebM file size without losing quality. Up to 500MB. 100% browser-based, no uploads.'
  },
  {
    id: "112",
    name: "AI Face Swap",
    slug: "ai-face-swap",
    category: "AI",
    description: 'Seamlessly replaces one face with another in photos while matching skin tone, lighting, and head angle.',
    seoDescription: 'Free online AI Face Swap — Seamlessly replaces one face with another in photos while matching skin tone, lighting, and head angle. 100% browser-based, no uploads.',
    dependencies: "InsightFace"
  },
  {
    id: "113",
    name: "JSON Formatter",
    slug: "json-formatter",
    category: "Developer",
    description: 'Pretty-prints raw JSON with configurable indent width, key sorting, and bracket collapsing options while flagging syntax errors with exact.',
    dependencies: "JSONLint",
    seoDescription: 'Free JSON formatter online — format, validate, and beautify JSON with configurable indentation and sorting. Syntax error highlighting included.'
  },
  {
    id: "114",
    name: "XML Sitemap Generator",
    slug: "xml-sitemap-generator",
    category: "SEO",
    description: 'Accepts a list of URLs with optional priority, change frequency, and last-modified dates, then emits a standards-compliant XML sitemap with proper.',
    seoDescription: 'Free online XML Sitemap Generator — Accepts a list of URLs with optional priority, change frequency, and last-modified dates, then emits a standards-compliant XML sitemap with proper. 100% browser-based, no uploads.',
    dependencies: "Node.js / Cheerio"
  },
  {
    id: "115",
    name: "Meeting Minutes Generator",
    slug: "meeting-minutes-generator",
    category: "Transcription",
    description: 'Meeting Minutes Generator structures raw notes into sections like attendees, decisions, action items, and follow-ups.',
    seoDescription: 'Free online Meeting Minutes Generator — Meeting Minutes Generator structures raw notes into sections like attendees, decisions, action items, and follow-ups. 100% browser-based, no uploads.',
    dependencies: "OpenAI API"
  },
  {
    id: "116",
    name: "AI Cover Letter Generator",
    slug: "ai-cover-letter-generator",
    category: "AI",
    description: 'Analyzes a job description and your résumé to produce a tailored cover letter that highlights relevant experience and matches the employer’s.',
    seoDescription: 'Free online AI Cover Letter Generator — Analyzes a job description and your résumé to produce a tailored cover letter that highlights relevant experience and matches the employer’s. 100% browser-based, no uploads.',
    dependencies: "OpenAI API"
  },



  {
    id: "121",
    name: "JSON to CSV",
    slug: "json-to-csv",
    category: "Converter",
    description: 'Parses structured JSON data—including nested objects and arrays—and flattens it into a clean CSV spreadsheet with proper column headers.',
    seoDescription: 'Free online JSON to CSV — Parses structured JSON data—including nested objects and arrays—and flattens it into a clean CSV spreadsheet with proper column headers. 100% browser-based, no uploads.',
    dependencies: "PapaParse"
  },
  {
    id: "122",
    name: "Watermark PDF",
    slug: "watermark-pdf",
    category: "PDF",
    description: 'Overlays text or image watermarks onto every page of a PDF with customizable position, rotation, opacity, and tiling.',
    seoDescription: 'Free online Watermark PDF — Overlays text or image watermarks onto every page of a PDF with customizable position, rotation, opacity, and tiling. 100% browser-based, no uploads.',
    dependencies: "pdf-lib"
  },
  {
    id: "123",
    name: "PDF Page Delete",
    slug: "pdf-page-delete",
    category: "PDF",
    description: 'Removes selected page ranges from a PDF while renumbering the remaining pages and updating any internal page references.',
    seoDescription: 'Free online PDF Page Delete — Removes selected page ranges from a PDF while renumbering the remaining pages and updating any internal page references. 100% browser-based, no uploads.',
    dependencies: "pdf-lib"
  },
  {
    id: "124",
    name: "PNG to SVG",
    slug: "png-to-svg",
    category: "Image",
    description: 'Traces bitmap PNG shapes into clean SVG paths using Potrace in WebAssembly, with controls for curve tolerance, corner threshold.',
    seoDescription: 'Free online PNG to SVG — Traces bitmap PNG shapes into clean SVG paths using Potrace in WebAssembly, with controls for curve tolerance, corner threshold. 100% browser-based, no uploads.',
    dependencies: "Potrace"
  },
  {
    id: "125",
    name: "Email Signature Generator",
    slug: "email-signature-generator",
    category: "Branding",
    description: 'Email Signature Generator builds HTML email signatures through a form-based UI with social link fields and icon toggles.',
    seoDescription: 'Free online Email Signature Generator — Email Signature Generator builds HTML email signatures through a form-based UI with social link fields and icon toggles. 100% browser-based, no uploads.',
    dependencies: "React"
  },

  {
    id: "128",
    name: "Margin Calculator",
    slug: "margin-calculator",
    category: "Finance",
    description: 'Calculates gross margin percentage, markup percentage, cost, and selling price from any two known variables using standard retail formulas.',
    seoDescription: 'Free online Margin Calculator — Calculates gross margin percentage, markup percentage, cost, and selling price from any two known variables using standard retail formulas. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "129",
    name: "Morse Code Translator",
    slug: "morse-code-translator",
    category: "Utility",
    description: 'Converts alphanumeric text into International Morse code with audible beeps played through the Web Audio API, and decodes incoming Morse signals.',
    seoDescription: 'Free online Morse Code Translator — Converts alphanumeric text into International Morse code with audible beeps played through the Web Audio API, and decodes incoming Morse signals. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "130",
    name: "Cursive Text Generator",
    slug: "cursive-text-generator",
    category: "Text",
    description: 'Converts plain text into flowing cursive and script-style Unicode characters that resemble handwritten calligraphy.',
    seoDescription: 'Free online Cursive Text Generator — Converts plain text into flowing cursive and script-style Unicode characters that resemble handwritten calligraphy. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "131",
    name: "ROI Calculator",
    slug: "roi-calculator",
    category: "Finance",
    description: 'Measures return on investment by comparing net gain or loss against the original cost, expressed as both a percentage and a dollar amount.',
    seoDescription: 'Free online ROI Calculator — Measures return on investment by comparing net gain or loss against the original cost, expressed as both a percentage and a dollar amount. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "132",
    name: "VAT Calculator",
    slug: "vat-calculator",
    category: "Finance",
    description: 'Computes VAT-inclusive and VAT-exclusive amounts for EU member-state rates (standard and reduced) with country-specific rules for digital services.',
    seoDescription: 'Free online VAT Calculator — Computes VAT-inclusive and VAT-exclusive amounts for EU member-state rates (standard and reduced) with country-specific rules for digital services. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "134",
    name: "Password Strength Checker",
    slug: "password-strength-checker",
    category: "Privacy",
    description: 'Evaluates passwords against 10+ criteria: length, character diversity, dictionary words, pattern repetition, known-breach database lookup.',
    seoDescription: 'Free online Password Strength Checker — Evaluates passwords against 10+ criteria: length, character diversity, dictionary words, pattern repetition, known-breach database lookup. 100% browser-based, no uploads.',
    dependencies: "zxcvbn"
  },
  {
    id: "135",
    name: "JS Minifier",
    slug: "js-minifier",
    category: "Developer",
    description: 'Strips comments, whitespace, and shortens local variable names in JavaScript source without altering execution semantics.',
    seoDescription: 'Free online JS Minifier — Strips comments, whitespace, and shortens local variable names in JavaScript source without altering execution semantics. 100% browser-based, no uploads.',
    dependencies: "Terser"
  },
  {
    id: "136",
    name: "Base64 Encode/Decode",
    slug: "base64-encode-decode",
    category: "Developer",
    description: 'Encodes text or small files into Base64 strings and decodes them back with automatic MIME-type detection for binary safety.',
    seoDescription: 'Free online Base64 Encode/Decode — Encodes text or small files into Base64 strings and decodes them back with automatic MIME-type detection for binary safety. 100% browser-based, no uploads.',
    dependencies: "btoa/atob"
  },
  {
    id: "137",
    name: "Text to Handwriting",
    slug: "text-to-handwriting",
    category: "Text",
    description: 'Renders typed text as realistic handwritten output using configurable fonts, ink colors, paper backgrounds, and even simulated pressure variations.',
    seoDescription: 'Free online Text to Handwriting — Renders typed text as realistic handwritten output using configurable fonts, ink colors, paper backgrounds, and even simulated pressure variations. 100% browser-based, no uploads.',
    dependencies: "Canvas API"
  },
  {
    id: "138",
    name: "Receipt Generator",
    slug: "receipt-generator",
    category: "Finance",
    description: 'Creates printer-friendly receipt pages with itemized purchases, payment method, date, and merchant details in a compact single-page layout.',
    seoDescription: 'Free online Receipt Generator — Creates printer-friendly receipt pages with itemized purchases, payment method, date, and merchant details in a compact single-page layout. 100% browser-based, no uploads.',
    dependencies: "Canvas API / jsPDF"
  },
  {
    id: "139",
    name: "AI Thumbnail Maker",
    slug: "ai-thumbnail-maker",
    category: "AI",
    description: 'Designs click-optimized YouTube thumbnails by compositing text, images, and effects on a smart canvas.',
    seoDescription: 'Free online AI Thumbnail Maker — Designs click-optimized YouTube thumbnails by compositing text, images, and effects on a smart canvas. 100% browser-based, no uploads.',
    dependencies: "Canvas API / OpenAI API"
  },
  {
    id: "140",
    name: "Secure Note Sharer",
    slug: "secure-note-sharer",
    category: "Privacy",
    description: 'Encrypts a text note with a passphrase and generates a one-time view link that self-destructs after the recipient reads it.',
    seoDescription: 'Free online Secure Note Sharer — Encrypts a text note with a passphrase and generates a one-time view link that self-destructs after the recipient reads it. 100% browser-based, no uploads.',
    dependencies: "Crypto API / Redis"
  },
  {
    id: "141",
    name: "Video to GIF",
    slug: "video-to-gif",
    category: "Video",
    description: "Convert MP4/WebM to GIF animations. Max 500MB input.",
    seoDescription: 'Free online Video to GIF — Convert MP4/WebM to GIF animations. Max 500MB input. 100% browser-based, no uploads.',
    dependencies: "FFmpeg / gif.js"
  },
  {
    id: "142",
    name: "Image to Base64",
    slug: "image-to-base64",
    category: "Developer",
    description: 'Converts uploaded images (PNG, JPG, GIF, SVG, WebP) into Base64-encoded data URI strings ready for embedding in HTML, CSS, or JSON.',
    seoDescription: 'Free online Image to Base64 — Converts uploaded images (PNG, JPG, GIF, SVG, WebP) into Base64-encoded data URI strings ready for embedding in HTML, CSS, or JSON. 100% browser-based, no uploads.',
    dependencies: "FileReader API"
  },
  {
    id: "143",
    name: "Subtitle Translator",
    slug: "subtitle-translator",
    category: "Video",
    description: 'Accepts SRT or VTT subtitle files and translates their text content into any of 100+ target languages while preserving exact timing codes and frame.',
    seoDescription: 'Free online Subtitle Translator — Accepts SRT or VTT subtitle files and translates their text content into any of 100+ target languages while preserving exact timing codes and frame. 100% browser-based, no uploads.',
    dependencies: "Google Translate API"
  },
  {
    id: "144",
    name: "IBAN Validator",
    slug: "iban-validator",
    category: "Finance",
    description: 'Validates the structure, length, and check digits of IBANs from 70+ countries using the official ISO 13616 modulus-97 algorithm.',
    seoDescription: 'Free online IBAN Validator — Validates the structure, length, and check digits of IBANs from 70+ countries using the official ISO 13616 modulus-97 algorithm. 100% browser-based, no uploads.',
    dependencies: "ibantools"
  },






  {
    id: "151",
    name: "CSV to JSON",
    slug: "csv-to-json",
    category: "Converter",
    description: 'Reads CSV files and converts each row into a structured JSON object, correctly inferring data types and handling quoted fields.',
    seoDescription: 'Free online CSV to JSON — Reads CSV files and converts each row into a structured JSON object, correctly inferring data types and handling quoted fields. 100% browser-based, no uploads.',
    dependencies: "PapaParse"
  },
  {
    id: "152",
    name: "Rotate PDF",
    slug: "rotate-pdf",
    category: "PDF",
    description: 'Rotates individual pages or all pages of a PDF by 90, 180, or 270 degrees without re-encoding the page content.',
    seoDescription: 'Free online Rotate PDF — Rotates individual pages or all pages of a PDF by 90, 180, or 270 degrees without re-encoding the page content. 100% browser-based, no uploads.',
    dependencies: "pdf-lib"
  },
  {
    id: "153",
    name: "Extract Images from PDF",
    slug: "extract-images-from-pdf",
    category: "PDF",
    description: 'Extracts every embedded raster image from a PDF as separate JPEG or PNG files, preserving original resolution and color space.',
    seoDescription: 'Free online Extract Images from PDF — Extracts every embedded raster image from a PDF as separate JPEG or PNG files, preserving original resolution and color space. 100% browser-based, no uploads.',
    dependencies: "pdf.js"
  },
  {
    id: "154",
    name: "SQL Formatter",
    slug: "sql-formatter",
    category: "Developer",
    description: 'Reindents and rewrites SQL queries with configurable dialect support (MySQL, PostgreSQL, SQL Server, BigQuery) and keyword-case preference.',
    seoDescription: 'Free online SQL Formatter — Reindents and rewrites SQL queries with configurable dialect support (MySQL, PostgreSQL, SQL Server, BigQuery) and keyword-case preference. 100% browser-based, no uploads.',
    dependencies: "sql-formatter"
  },
  {
    id: "155",
    name: "UUID Generator",
    slug: "uuid-generator",
    category: "Developer",
    description: 'Generates UUID v4 random identifiers in standard 36-character string format with an optional compact hex mode (no dashes).',
    seoDescription: 'Free online UUID Generator — Generates UUID v4 random identifiers in standard 36-character string format with an optional compact hex mode (no dashes). 100% browser-based, no uploads.',
    dependencies: "uuid"
  },
  {
    id: "156",
    name: "HEX to RGB Converter",
    slug: "hex-to-rgb-converter",
    category: "Design",
    description: 'Hex to RGB Converter parses hex color codes and outputs the corresponding RGB and RGBA values.',
    seoDescription: 'Free online HEX to RGB Converter — Hex to RGB Converter parses hex color codes and outputs the corresponding RGB and RGBA values. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "157",
    name: "BMR Calculator",
    slug: "bmr-calculator",
    category: "Health",
    description: 'Calculates Basal Metabolic Rate using the Mifflin-St Jeor equation with age, sex, height, and weight. Nutritionists use it for diet planning.',
    seoDescription: 'Free online BMR Calculator — Calculates Basal Metabolic Rate using the Mifflin-St Jeor equation with age, sex, height, and weight. Nutritionists use it for diet planning. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "158",
    name: "Meta Tag Generator",
    slug: "meta-tag-generator",
    category: "SEO",
    description: 'Builds a complete block of HTML meta tags including title, description, Open Graph, Twitter Cards, and canonical URL from an interactive form.',
    seoDescription: 'Free online Meta Tag Generator — Builds a complete block of HTML meta tags including title, description, Open Graph, Twitter Cards, and canonical URL from an interactive form. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "159",
    name: "Text to Binary",
    slug: "text-to-binary",
    category: "Developer",
    description: 'Encodes any Unicode string into its binary (base-2) representation, byte by byte, with visible byte-boundary separators.',
    seoDescription: 'Free online Text to Binary — Encodes any Unicode string into its binary (base-2) representation, byte by byte, with visible byte-boundary separators. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "160",
    name: "Binary to Text",
    slug: "binary-to-text",
    category: "Developer",
    description: 'Decodes space- or comma-separated binary strings back into human-readable Unicode text, rejecting malformed groups with an exact-position error.',
    seoDescription: 'Free online Binary to Text — Decodes space- or comma-separated binary strings back into human-readable Unicode text, rejecting malformed groups with an exact-position error. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "161",
    name: "Break-Even Calculator",
    slug: "break-even-calculator",
    category: "Finance",
    description: 'Determines the exact unit volume or revenue required to cover fixed and variable costs, with a built-in sensitivity slider for price changes.',
    seoDescription: 'Free online Break-Even Calculator — Determines the exact unit volume or revenue required to cover fixed and variable costs, with a built-in sensitivity slider for price changes. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "162",
    name: "Conversion Rate Calculator",
    slug: "conversion-rate-calculator",
    category: "Marketing",
    description: 'Conversion Rate Calculator divides conversions by total visitors and displays the rate as a percentage with configurable decimal precision.',
    seoDescription: 'Free online Conversion Rate Calculator — Conversion Rate Calculator divides conversions by total visitors and displays the rate as a percentage with configurable decimal precision. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "163",
    name: "CPM Calculator",
    slug: "cpm-calculator",
    category: "Marketing",
    description: 'CPM Calculator computes cost per mille by dividing total ad spend by impressions and multiplying by 1000.',
    seoDescription: 'Free online CPM Calculator — CPM Calculator computes cost per mille by dividing total ad spend by impressions and multiplying by 1000. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "164",
    name: "ROAS Calculator",
    slug: "roas-calculator",
    category: "Marketing",
    description: 'ROAS Calculator divides ad revenue by ad spend to return a return-on-ad-spend ratio. Performance marketers and ecommerce managers use it to evaluate.',
    seoDescription: 'Free online ROAS Calculator — ROAS Calculator divides ad revenue by ad spend to return a return-on-ad-spend ratio. Performance marketers and ecommerce managers use it to evaluate. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "165",
    name: "Podcast Transcription",
    slug: "podcast-transcription",
    category: "Transcription",
    description: 'Podcast Transcription processes long-form audio files through browser-based speech recognition optimized for extended durations.',
    seoDescription: 'Free online Podcast Transcription — Podcast Transcription processes long-form audio files through browser-based speech recognition optimized for extended durations. 100% browser-based, no uploads.',
    dependencies: "Whisper API"
  },
  {
    id: "166",
    name: "CSS Minifier",
    slug: "css-minifier",
    category: "Developer",
    description: 'Removes unnecessary whitespace, comments, and trailing semicolons from CSS, while merging identical selector blocks where safe to do so.',
    seoDescription: 'Free online CSS Minifier — Removes unnecessary whitespace, comments, and trailing semicolons from CSS, while merging identical selector blocks where safe to do so. 100% browser-based, no uploads.',
    dependencies: "clean-css"
  },
  {
    id: "167",
    name: "Markdown to HTML",
    slug: "markdown-to-html",
    category: "Converter",
    description: 'Renders GitHub-Flavored Markdown into semantic, accessible HTML with proper heading hierarchy, code syntax highlighting, and table markup.',
    seoDescription: 'Free online Markdown to HTML — Renders GitHub-Flavored Markdown into semantic, accessible HTML with proper heading hierarchy, code syntax highlighting, and table markup. 100% browser-based, no uploads.',
    dependencies: "marked.js"
  },
  {
    id: "168",
    name: "Compare PDF Files",
    slug: "compare-pdf-files",
    category: "PDF",
    description: 'Performs pixel-level and text-level comparison of two PDF files, highlighting every difference with color-coded overlay annotations.',
    seoDescription: 'Free online Compare PDF Files — Performs pixel-level and text-level comparison of two PDF files, highlighting every difference with color-coded overlay annotations. 100% browser-based, no uploads.',
    dependencies: "pdf.js"
  },
  {
    id: "169",
    name: "Favicon Generator",
    slug: "favicon-generator",
    category: "Design",
    description: 'Favicon Generator converts text initials, uploaded images, or emoji into .ico and PNG favicon files.',
    seoDescription: 'Free online Favicon Generator — Favicon Generator converts text initials, uploaded images, or emoji into .ico and PNG favicon files. 100% browser-based, no uploads.',
    dependencies: "Sharp / jimp"
  },
  {
    id: "170",
    name: "Case Converter",
    slug: "case-converter",
    category: "Text",
    description: 'Transforms text between uppercase, lowercase, title case, sentence case, camelCase, PascalCase, snake_case, and kebab-case with a single click.',
    seoDescription: 'Free online Case Converter — Transforms text between uppercase, lowercase, title case, sentence case, camelCase, PascalCase, snake_case, and kebab-case with a single click. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "171",
    name: "Keyword Density Checker",
    slug: "keyword-density-checker",
    category: "SEO",
    description: 'Parses pasted or uploaded text to count total words, unique terms, and per-keyword frequency as a percentage, sorted by density descending.',
    seoDescription: 'Free online Keyword Density Checker — Parses pasted or uploaded text to count total words, unique terms, and per-keyword frequency as a percentage, sorted by density descending. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "172",
    name: "Base64 to Image",
    slug: "base64-to-image",
    category: "Developer",
    description: 'Decodes a Base64 data string back into its original image format and displays a preview directly in the browser with a download button.',
    seoDescription: 'Free online Base64 to Image — Decodes a Base64 data string back into its original image format and displays a preview directly in the browser with a download button. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "174",
    name: "MD5 Hash Generator",
    slug: "md5-hash-generator",
    category: "Developer",
    description: 'Computes the 128-bit MD5 hash of any input text or uploaded file, returned as a 32-character hexadecimal string with optional uppercase.',
    seoDescription: 'Free online MD5 Hash Generator — Computes the 128-bit MD5 hash of any input text or uploaded file, returned as a 32-character hexadecimal string with optional uppercase. 100% browser-based, no uploads.',
    dependencies: "CryptoJS"
  },
  {
    id: "175",
    name: "HTML Minifier",
    slug: "html-minifier",
    category: "Developer",
    description: 'Removes unnecessary whitespace, comments, and optional closing tags from HTML code to reduce file size without altering rendered output.',
    seoDescription: 'Free online HTML Minifier — Removes unnecessary whitespace, comments, and optional closing tags from HTML code to reduce file size without altering rendered output. 100% browser-based, no uploads.',
    dependencies: "html-minifier"
  },
  {
    id: "176",
    name: "Barcode Generator",
    slug: "barcode-generator",
    category: "Utility",
    description: 'Generates scannable barcodes in major symbologies including EAN-13, Code 128, QR Code, and UPC-A from typed input or pasted data.',
    seoDescription: 'Free online Barcode Generator — Generates scannable barcodes in major symbologies including EAN-13, Code 128, QR Code, and UPC-A from typed input or pasted data. 100% browser-based, no uploads.',
    dependencies: "JsBarcode"
  },




  {
    id: "181",
    name: "PGP Key Generator",
    slug: "pgp-key-generator",
    category: "Privacy",
    description: 'Generates RSA (2048/4096) or ECDSA (Curve25519) PGP key pairs with customizable user IDs, expiration dates, and passphrase protection.',
    seoDescription: 'Free online PGP Key Generator — Generates RSA (2048/4096) or ECDSA (Curve25519) PGP key pairs with customizable user IDs, expiration dates, and passphrase protection. 100% browser-based, no uploads.',
    dependencies: "OpenPGP.js"
  },
  {
    id: "182",
    name: "Add Page Numbers to PDF",
    slug: "add-page-numbers-to-pdf",
    category: "PDF",
    description: 'Inserts page number labels at user-chosen positions (bottom-center, top-right, etc.) with configurable font, size, and starting offset.',
    seoDescription: 'Free online Add Page Numbers to PDF — Inserts page number labels at user-chosen positions (bottom-center, top-right, etc.) with configurable font, size, and starting offset. 100% browser-based, no uploads.',
    dependencies: "pdf-lib"
  },
  {
    id: "183",
    name: "HTML to Markdown",
    slug: "html-to-markdown",
    category: "Converter",
    description: 'Parses arbitrary HTML and converts it into clean, readable Markdown while intelligently stripping inline styles and scripts.',
    seoDescription: 'Free online HTML to Markdown — Parses arbitrary HTML and converts it into clean, readable Markdown while intelligently stripping inline styles and scripts. 100% browser-based, no uploads.',
    dependencies: "Turndown"
  },
  {
    id: "184",
    name: "Reverse Text Generator",
    slug: "reverse-text-generator",
    category: "Text",
    description: 'Applies multiple text-transformation effects: reverse order, reverse each word, flip upside down, mirror horizontally, and rotate 180 degrees.',
    seoDescription: 'Free online Reverse Text Generator — Applies multiple text-transformation effects: reverse order, reverse each word, flip upside down, mirror horizontally, and rotate 180 degrees. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "185",
    name: "Zalgo Text Generator",
    slug: "zalgo-text-generator",
    category: "Text",
    description: 'Adds combining diacritical marks above, below, and through each character to create intentionally corrupted ‘zalgo’ glitch text.',
    seoDescription: 'Free online Zalgo Text Generator — Adds combining diacritical marks above, below, and through each character to create intentionally corrupted ‘zalgo’ glitch text. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "186",
    name: "Invisible Text Generator",
    slug: "invisible-text-generator",
    category: "Text",
    description: 'Generates blank Unicode characters—zero-width spaces, hair spaces, and invisible separators—that appear as empty text.',
    seoDescription: 'Free online Invisible Text Generator — Generates blank Unicode characters—zero-width spaces, hair spaces, and invisible separators—that appear as empty text. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "187",
    name: "LTV Calculator",
    slug: "ltv-calculator",
    category: "Finance",
    description: 'Projects customer lifetime value using average order value, purchase frequency, gross margin, and estimated customer lifespan in months.',
    seoDescription: 'Free online LTV Calculator — Projects customer lifetime value using average order value, purchase frequency, gross margin, and estimated customer lifespan in months. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "188",
    name: "CAC Calculator",
    slug: "cac-calculator",
    category: "Finance",
    description: 'Divides total sales-and-marketing spend by the number of new customers acquired in the same period to produce a blended acquisition cost. Startup.',
    seoDescription: 'Free online CAC Calculator — Divides total sales-and-marketing spend by the number of new customers acquired in the same period to produce a blended acquisition cost. Startup. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "189",
    name: "Burn Rate Calculator",
    slug: "burn-rate-calculator",
    category: "Finance",
    description: 'Calculates gross burn, net burn, and runway (in months) from monthly revenue, operating expenses, and current cash balance.',
    seoDescription: 'Free online Burn Rate Calculator — Calculates gross burn, net burn, and runway (in months) from monthly revenue, operating expenses, and current cash balance. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "190",
    name: "Net Promoter Score Calculator",
    slug: "net-promoter-score-calculator",
    category: "Marketing",
    description: 'Categorizes survey responses into promoters, passives, and detractors. Customer experience teams use it to track loyalty metrics.',
    seoDescription: 'Free online Net Promoter Score Calculator — Categorizes survey responses into promoters, passives, and detractors. Customer experience teams use it to track loyalty metrics. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "191",
    name: "XML to CSV",
    slug: "xml-to-csv",
    category: "Converter",
    description: 'Parses XML documents of any depth and transforms elements and attributes into a tabular CSV structure with automatically generated column paths.',
    seoDescription: 'Free online XML to CSV — Parses XML documents of any depth and transforms elements and attributes into a tabular CSV structure with automatically generated column paths. 100% browser-based, no uploads.',
    dependencies: "xml2js / PapaParse"
  },
  {
    id: "192",
    name: "PDF Metadata Editor",
    slug: "pdf-metadata-editor",
    category: "PDF",
    description: 'Displays and allows editing of standard PDF metadata fields: title, author, subject, keywords, and producer.',
    seoDescription: 'Free online PDF Metadata Editor — Displays and allows editing of standard PDF metadata fields: title, author, subject, keywords, and producer. 100% browser-based, no uploads.',
    dependencies: "pdf-lib"
  },
  {
    id: "193",
    name: "SVG Editor",
    slug: "svg-editor",
    category: "Design",
    description: 'SVG Editor provides a visual canvas for manipulating SVG elements with node selection, transform handles, and attribute editing.',
    seoDescription: 'Free online SVG Editor — SVG Editor provides a visual canvas for manipulating SVG elements with node selection, transform handles, and attribute editing. 100% browser-based, no uploads.',
    dependencies: "SVGO / Fabric.js"
  },
  {
    id: "194",
    name: "Robots.txt Generator",
    slug: "robots-txt-generator",
    category: "SEO",
    description: 'Produces a robots.txt file from a point-and-click form where you set allowed and disallowed paths, crawl delays, and sitemap references.',
    seoDescription: 'Free online Robots.txt Generator — Produces a robots.txt file from a point-and-click form where you set allowed and disallowed paths, crawl delays, and sitemap references. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "195",
    name: "SaaS Pricing Calculator",
    slug: "saas-pricing-calculator",
    category: "Finance",
    description: 'Models subscription revenue across tiers (free, monthly, annual) with inputs for conversion rate, churn, customer count, and average revenue.',
    seoDescription: 'Free online SaaS Pricing Calculator — Models subscription revenue across tiers (free, monthly, annual) with inputs for conversion rate, churn, customer count, and average revenue. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "196",
    name: "Employee Turnover Calculator",
    slug: "employee-turnover-calculator",
    category: "HR",
    description: "Calculate employee turnover rate",
    seoDescription: 'Free online Employee Turnover Calculator — Calculate employee turnover rate 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "197",
    name: "MAC Address Generator",
    slug: "mac-address-generator",
    category: "Privacy",
    description: 'Generates random MAC addresses in six common formats (Unix, Windows, Cisco, colon-separated, hyphen-separated, and dot-separated) with optional OUI.',
    seoDescription: 'Free online MAC Address Generator — Generates random MAC addresses in six common formats (Unix, Windows, Cisco, colon-separated, hyphen-separated, and dot-separated) with optional OUI. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "198",
    name: "IP Anonymizer",
    slug: "ip-anonymizer",
    category: "Privacy",
    description: "Anonymize IP addresses in logs",
    seoDescription: 'Free online IP Anonymizer — Anonymize IP addresses in logs 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  },
  {
    id: "199",
    name: "XML to JSON",
    slug: "xml-to-json",
    category: "Developer",
    description: 'Transforms well-formed XML documents into equivalent JSON structures, mapping attributes to prefixed keys and text content to a configurable key.',
    seoDescription: 'Free online XML to JSON — Transforms well-formed XML documents into equivalent JSON structures, mapping attributes to prefixed keys and text content to a configurable key. 100% browser-based, no uploads.',
    dependencies: "xml2js"
  },
  {
    id: "200",
    name: "Braille Translator",
    slug: "braille-translator",
    category: "Text",
    description: 'Bidirectional converter between standard English text and Grade 1 (uncontracted) or Grade 2 (contracted) Braille.',
    seoDescription: 'Free online Braille Translator — Bidirectional converter between standard English text and Grade 1 or Grade 2 Braille. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS"
  }  ,{
    id: "201",
    name: "Passport Photo Maker (India)",
    slug: "passport-photo-india",
    category: "indian-utilities",
    description: "3.5x4.5 cm cropper for Indian passport photos",
    seoDescription: 'Free online Braille Translator — 3.5x4.5 cm cropper for Indian passport photos 100% browser-based, no uploads.',
    dependencies: "Canvas API / react-cropper"
  },
  {
    id: "202",
    name: "Aadhaar Wallet Cropper",
    slug: "aadhaar-wallet-cropper",
    category: "indian-utilities",
    description: 'Crops Aadhaar card images to the standard 3.5 x 3.5 cm wallet-photo size, automatically detecting the face region using OpenCV Haar cascades.',
    seoDescription: 'Free online Aadhaar Wallet Cropper — Crops Aadhaar card images to the standard 3.5 x 3.5 cm wallet-photo size, automatically detecting the face region using OpenCV Haar cascades. 100% browser-based, no uploads.',
    dependencies: "Canvas API"
  },
  {
    id: "203",
    name: "PAN Card Resizer",
    slug: "pan-card-resizer",
    category: "indian-utilities",
    description: 'Resizes PAN card images to 3 x 4 cm (the standard size for laminated identification) while maintaining legibility of the printed text and hologram.',
    seoDescription: 'Free online PAN Card Resizer — Resizes PAN card images to 3 x 4 cm (the standard size for laminated identification) while maintaining legibility of the printed text and hologram. 100% browser-based, no uploads.',
    dependencies: "Canvas API"
  },
  {
    id: "204",
    name: "KB Image Compressor",
    slug: "kb-image-compressor",
    category: "indian-utilities",
    description: 'Compresses JPEG and PNG images to a specific kilobyte target (e.g., 20 KB, 100 KB, 200 KB) using binary-search quantization until the file size.',
    seoDescription: 'Free online KB Image Compressor — Compresses JPEG and PNG images to a specific kilobyte target (e.g., 20 KB, 100 KB, 200 KB) using binary-search quantization until the file size. 100% browser-based, no uploads.',
    dependencies: "browser-image-compression"
  }

,
  {
    id: "210",
    name: "Live Transcription",
    slug: "live-transcription",
    category: "Transcription",
    description: 'Live Transcription performs real-time speech-to-text using the browser’s native microphone API with continuous streaming output.',
    seoDescription: 'Free online Live Transcription — Live Transcription performs real-time speech-to-text using the browser’s native microphone API with continuous streaming output. 100% browser-based, no uploads.',
    dependencies: "Web Speech API"
  },
  {
    id: "211",
    name: "Image Bulk Converter",
    slug: "image-bulk-converter",
    category: "Image",
    description: 'Processes an arbitrary number of uploaded images sequentially, converting between JPEG, PNG, WebP, AVIF, GIF, and TIFF in a single batch.',
    seoDescription: 'Free online Image Bulk Converter — Processes an arbitrary number of uploaded images sequentially, converting between JPEG, PNG, WebP, AVIF, GIF, and TIFF in a single batch. 100% browser-based, no uploads.',
    dependencies: "browser-image-compression / jszip",
    isPro: true,
  },
  {
    id: "212",
    name: "eSign PDF",
    slug: "esign-pdf",
    category: "PDF",
    description: 'Places a typed, drawn, or uploaded signature image onto a specific page and coordinate of a PDF document.',
    seoDescription: 'Free online eSign PDF — Places a typed, drawn, or uploaded signature image onto a specific page and coordinate of a PDF document. 100% browser-based, no uploads.',
    dependencies: "pdf-lib / fabric"
  },
  {
    id: "213",
    name: "PDF OCR (Scanned Docs)",
    slug: "pdf-ocr",
    category: "PDF",
    description: 'Extracts searchable text from scanned PDF documents and image-only PDFs using optical character recognition with language auto-detection.',
    seoDescription: 'Free online PDF OCR (Scanned Docs) — Extracts searchable text from scanned PDF documents and image-only PDFs using optical character recognition with language auto-detection. 100% browser-based, no uploads.',
    dependencies: "tesseract.js"
  },
  {
    id: "214",
    name: "PDF Form Filler",
    slug: "pdf-form-filler",
    category: "PDF",
    description: 'Detects interactive form fields in a PDF and provides a clean UI to fill text inputs, checkboxes, and dropdowns before downloading the completed.',
    seoDescription: 'Free online PDF Form Filler — Detects interactive form fields in a PDF and provides a clean UI to fill text inputs, checkboxes, and dropdowns before downloading the completed. 100% browser-based, no uploads.',
    dependencies: "pdf-lib"
  },
  {
    id: "216",
    name: "AI Document Chat (RAG)",
    slug: "ai-document-chat",
    category: "AI",
    description: 'Indexes uploaded PDFs, Word files, and plain-text documents into a vector store and lets you ask natural-language questions about their contents.',
    dependencies: "CF Vectorize",
    seoDescription: 'Chat with your documents using AI — upload PDFs, Word files, and ask natural-language questions. Free online RAG tool, 100% private and browser-based.'
  },
  {
    id: "217",
    name: "AI Video Subtitler",
    slug: "ai-video-subtitler",
    category: "AI",
    description: 'Transcribes speech from video files and syncs the resulting subtitles to the exact timing of each utterance.',
    seoDescription: 'Free online AI Video Subtitler — Transcribes speech from video files and syncs the resulting subtitles to the exact timing of each utterance. 100% browser-based, no uploads.',
    dependencies: "Whisper API"
  },

  {
    name: 'Subtitle Generator',
    slug: 'subtitle-generator',
    description: 'Generate SRT files from video.',
    seoDescription: 'Free online Subtitle Generator — Generate SRT files from video. 100% browser-based, no uploads.',
    category: 'Video',
    id:  "219",
    dependencies: 'None'
  },
  {
    name: 'SVG to PNG Converter',
    slug: 'svg-to-png-converter',
    description: 'Convert vector SVG to raster PNG.',
    seoDescription: 'Free online SVG to PNG Converter — Convert vector SVG to raster PNG. 100% browser-based, no uploads.',
    category: 'Converter',
    id:  "220",
    dependencies: 'None'
  },
  {
    name: 'Unit Converter',
    slug: 'unit-converter',
    description: 'Universal unit conversion tool.',
    seoDescription: 'Free online Unit Converter — Universal unit conversion tool. 100% browser-based, no uploads.',
    category: 'Utility',
    id:  "221",
    dependencies: 'None'
  },

  {
    name: 'Video Watermark Adder',
    slug: 'video-watermark-adder',
    description: 'Add logo or text watermark to video.',
    seoDescription: 'Free online Video Watermark Adder — Add logo or text watermark to video. 100% browser-based, no uploads.',
    category: 'Video',
    id:  "223",
    dependencies: 'None'
  },

  {
    name: 'Prompt Library & Generator',
    slug: 'prompt-library-generator',
    description: 'Browse and generate AI prompts.',
    seoDescription: 'Free online Prompt Library & Generator — Browse and generate AI prompts. 100% browser-based, no uploads.',
    category: 'AI',
    id:  "225",
    dependencies: 'None'
  },
  {
    name: 'GST Invoice Generator',
    slug: 'gst-invoice-generator',
    description: 'Generates PDF invoices fully compliant with Indian GST rules, including mandatory fields like HSN/SAC codes, GSTIN, place of supply.',
    seoDescription: 'Free online GST Invoice Generator — Generates PDF invoices fully compliant with Indian GST rules, including mandatory fields like HSN/SAC codes, GSTIN, place of supply. 100% browser-based, no uploads.',
    category: 'indian-utilities',
    id:  "227",
    dependencies: 'None'
  },
  {
    name: 'ITR Filing Helper',
    slug: 'itr-filing-helper',
    description: 'Helper for India Income Tax Returns.',
    seoDescription: 'Free online ITR Filing Helper — Helper for India Income Tax Returns. 100% browser-based, no uploads.',
    category: 'indian-utilities',
    id:  "228",
    dependencies: 'None'
  },

  {
    name: 'Browser Extension',
    slug: 'browser-extension',
    description: 'All-in-one sidebar AI assistant.',
    seoDescription: 'Free online Browser Extension — All-in-one sidebar AI assistant. 100% browser-based, no uploads.',
    category: 'Extension',
    id:  "230",
    dependencies: 'None'
  },
  {
    name: 'MP3 Compressor',
    slug: 'mp3-compressor',
    description: 'Reduce MP3 size with bitrate control',
    seoDescription: 'Free online MP3 Compressor — Reduce MP3 size with bitrate control 100% browser-based, no uploads.',
    category: 'Utility',
    id:  "231",
    dependencies: 'FFmpeg WASM'
  },
  {
    name: 'GIF to MP4 Converter',
    slug: 'gif-to-mp4',
    description: 'Convert GIF animations to MP4 videos',
    seoDescription: 'Free online GIF to MP4 Converter — Convert GIF animations to MP4 videos 100% browser-based, no uploads.',
    category: 'Converter',
    id:  "232",
    dependencies: 'FFmpeg WASM'
  },
  {
    name: 'Video Trimmer',
    slug: 'video-trimmer',
    description: 'Trim and cut video clips locally',
    seoDescription: 'Free online Video Trimmer — Trim and cut video clips locally 100% browser-based, no uploads.',
    category: 'Video',
    id:  "233",
    dependencies: 'FFmpeg WASM'
  },
  {
    name: 'Aadhaar Card Masker',
    slug: 'aadhaar-card-masker',
    description: 'Mask the first 8 digits of your Aadhaar card for secure sharing.',
    seoDescription: 'Free online Aadhaar Card Masker — Mask the first 8 digits of your Aadhaar card for secure sharing. 100% browser-based, no uploads.',
    category: 'indian-utilities',
    id:  "234",
    dependencies: 'Canvas API'
  },
  {
    name: 'PAN Card Verification',
    slug: 'pan-verification',
    description: 'Verify PAN format and extract taxpayer category locally.',
    seoDescription: 'Free online PAN Card Verification — Verify PAN format and extract taxpayer category locally. 100% browser-based, no uploads.',
    category: 'indian-utilities',
    id:  "235",
    dependencies: 'None'
  },
  {
    name: 'IFSC Code Lookup',
    slug: 'ifsc-code-lookup',
    description: 'Accepts an 11-character IFSC code and returns the corresponding bank name, branch address, city, district, state, and contact details.',
    seoDescription: 'Free online IFSC Code Lookup — Accepts an 11-character IFSC code and returns the corresponding bank name, branch address, city, district, state, and contact details. 100% browser-based, no uploads.',
    category: 'indian-utilities',
    id:  "236",
    dependencies: 'IFSC API'
  },
  {
    name: 'Voter ID Form Helper',
    slug: 'voter-id-form-helper',
    description: 'Get document checklists and guidance for Form 6/7/8 registration.',
    seoDescription: 'Free online Voter ID Form Helper — Get document checklists and guidance for Form 6/7/8 registration. 100% browser-based, no uploads.',
    category: 'indian-utilities',
    id:  "237",
    dependencies: 'None'
  },
  {
    name: 'India Pincode Finder',
    slug: 'india-pincode-finder',
    description: 'Search pincodes and post office branches across India.',
    seoDescription: 'Free online India Pincode Finder — Search pincodes and post office branches across India. 100% browser-based, no uploads.',
    category: 'indian-utilities',
    id:  "238",
    dependencies: 'Postal API'
  },
  {
    name: 'Hindi / Regional Font Generator',
    slug: 'hindi-regional-font-generator',
    description: 'Generate stylish unicode fonts for Hindi, Tamil, Telugu, and other regional scripts.',
    seoDescription: 'Free online Hindi / Regional Font Generator — Generate stylish unicode fonts for Hindi, Tamil, Telugu, and other regional scripts. 100% browser-based, no uploads.',
    category: 'indian-utilities',
    id:  "239",
    dependencies: 'None'
  },
  {
    name: 'Indian Age Calculator',
    slug: 'indian-age-calculator',
    description: 'Calculate exact age as per DOB in DD/MM/YYYY format with eligibility check.',
    seoDescription: 'Free online Indian Age Calculator — Calculate exact age as per DOB in DD/MM/YYYY format with eligibility check. 100% browser-based, no uploads.',
    category: 'indian-utilities',
    id:  "240",
    dependencies: 'None'
  },
  {
    name: 'CGPA to Percentage Converter',
    slug: 'cgpa-to-percentage-converter',
    description: 'Convert CGPA to percentage based on CBSE, MU, and university formulas.',
    seoDescription: 'Free online CGPA to Percentage Converter — Convert CGPA to percentage based on CBSE, MU, and university formulas. 100% browser-based, no uploads.',
    category: 'indian-utilities',
    id:  "241",
    dependencies: 'None'
  },
  {
    name: 'PDF to HTML',
    slug: 'pdf-to-html',
    description: 'Convert PDF pages into a clean, responsive HTML5 document.',
    seoDescription: 'Free online PDF to HTML — Convert PDF pages into a clean, responsive HTML5 document. 100% browser-based, no uploads.',
    category: 'PDF',
    id:  "242",
    dependencies: 'PDF.js'
  },
  {
    name: 'HTML to PDF',
    slug: 'html-to-pdf',
    description: 'Convert HTML source code into a downloadable PDF document.',
    seoDescription: 'Free online HTML to PDF — Convert HTML source code into a downloadable PDF document. 100% browser-based, no uploads.',
    category: 'PDF',
    id:  "243",
    dependencies: 'jsPDF'
  },
  {
    name: 'Generic PDF Processor',
    slug: 'generic-pdf-processor',
    description: 'Compress, rotate pages, or strip metadata from PDFs in one unified tool.',
    seoDescription: 'Free online Generic PDF Processor — Compress, rotate pages, or strip metadata from PDFs in one unified tool. 100% browser-based, no uploads.',
    category: 'PDF',
    id:  "244",
    dependencies: 'pdf-lib'
  },
  {
    name: 'WebP to PNG Converter',
    slug: 'webp-to-png',
    description: 'Converts WebP images to standard PNG format with full transparency support. Designers and web developers use it when they need to use WebP-sourced.',
    seoDescription: 'Free online WebP to PNG Converter — Converts WebP images to standard PNG format with full transparency support. Designers and web developers use it when they need to use WebP-sourced. 100% browser-based, no uploads.',
    category: 'Image',
    id:  "245",
    dependencies: 'Canvas API'
  },
  {
    name: 'JFIF to PNG Converter',
    slug: 'jfif-to-png',
    description: 'Converts JFIF (JPEG File Interchange Format) images to standard PNG format without quality loss.',
    seoDescription: 'Free online JFIF to PNG Converter — Converts JFIF (JPEG File Interchange Format) images to standard PNG format without quality loss. 100% browser-based, no uploads.',
    category: 'Image',
    id:  "246",
    dependencies: 'Canvas API'
  },
  {
    name: 'HEIC to PNG Converter',
    slug: 'heic-to-png',
    description: 'Converts Apple HEIC/HEIF images to universally compatible PNG format with a batch queue for processing multiple photos.',
    seoDescription: 'Free online HEIC to PNG Converter — Converts Apple HEIC/HEIF images to universally compatible PNG format with a batch queue for processing multiple photos. 100% browser-based, no uploads.',
    category: 'Image',
    id:  "247",
    dependencies: 'libheif WASM'
  },
  {
    name: 'Image to JPG Converter',
    slug: 'convert-to-jpg',
    description: 'Converts any image format — PNG, WebP, BMP, GIF, TIFF — to standard JPG with configurable quality settings.',
    seoDescription: 'Free online Image to JPG Converter — Converts any image format — PNG, WebP, BMP, GIF, TIFF — to standard JPG with configurable quality settings. 100% browser-based, no uploads.',
    category: 'Image',
    id:  "248",
    dependencies: 'Canvas API'
  },
  {
    name: 'Rotate Image Online',
    slug: 'rotate-image',
    description: 'Rotates images left or right by 90-degree increments instantly in the browser with no upload required.',
    seoDescription: 'Free online Rotate Image Online — Rotates images left or right by 90-degree increments instantly in the browser with no upload required. 100% browser-based, no uploads.',
    category: 'Image',
    id:  "249",
    dependencies: 'Canvas API'
  },
  {
    name: 'Blur Face Online',
    slug: 'blur-face',
    description: 'Detects faces in uploaded images using AI-powered computer vision and applies an adjustable blur effect to each detected face.',
    seoDescription: 'Free online Blur Face Online — Detects faces in uploaded images using AI-powered computer vision and applies an adjustable blur effect to each detected face. 100% browser-based, no uploads.',
    category: 'Image',
    id:  "250",
    dependencies: 'AI API'
  },
  {
    name: 'HTML to Image Converter',
    slug: 'html-to-image',
    description: 'Renders custom HTML and CSS markup into downloadable PNG, JPG, or SVG images directly in the browser.',
    seoDescription: 'Free online HTML to Image Converter — Renders custom HTML and CSS markup into downloadable PNG, JPG, or SVG images directly in the browser. 100% browser-based, no uploads.',
    category: 'Developer',
    id:  "251",
    dependencies: 'html2canvas'
  },
  {
    name: 'Apple Music Preview Extractor',
    slug: 'apple-music-preview-extractor',
    description: 'Extracts publicly available 30-to-90-second audio preview clips from Apple Music by resolving the store URL.',
    seoDescription: 'Free online Apple Music Preview Extractor — Extracts publicly available 30-to-90-second audio preview clips from Apple Music by resolving the store URL. 100% browser-based, no uploads.',
    category: 'Audio',
    id:  "252",
    dependencies: 'fetch API'
  },
  {
    name: 'Marriage Biodata Maker',
    slug: 'marriage-biodata-maker',
    description: 'Creates printable matrimonial biodata forms with sections for personal details, family background, education, career, and partner preferences.',
    seoDescription: 'Free online Marriage Biodata Maker — Creates printable matrimonial biodata forms with sections for personal details, family background, education, career, and partner preferences. 100% browser-based, no uploads.',
    category: 'indian-utilities',
    id:  "257",
    dependencies: 'jsPDF'
  },
  {
    name: 'Rental Agreement Generator',
    slug: 'rental-agreement-generator',
    description: 'Generates customizable rental lease and license agreements compliant with Indian property laws including leave-and-license and tenancy formats.',
    seoDescription: 'Free online Rental Agreement Generator — Generates customizable rental lease and license agreements compliant with Indian property laws including leave-and-license and tenancy formats. 100% browser-based, no uploads.',
    category: 'indian-utilities',
    id:  "258",
    dependencies: 'jsPDF'
  },
  {
    name: 'Resume ATS Score Checker',
    slug: 'resume-ats-score-checker',
    description: 'Analyzes uploaded resumes against a job description using AI to calculate an ATS compatibility score and provide actionable suggestions.',
    seoDescription: 'Free online Resume ATS Score Checker — Analyzes uploaded resumes against a job description using AI to calculate an ATS compatibility score and provide actionable suggestions. 100% browser-based, no uploads.',
    category: 'AI',
    id:  "259",
    dependencies: 'AI API'
  },
  {
    name: 'WhatsApp Toolkit',
    slug: 'whatsapp-toolkit',
    description: 'Generates wa.me click-to-chat links, WhatsApp group invite links, QR codes for quick connections, and includes a chat analyzer and status text.',
    seoDescription: 'Free online WhatsApp Toolkit — Generates wa.me click-to-chat links, WhatsApp group invite links, QR codes for quick connections, and includes a chat analyzer and status text. 100% browser-based, no uploads.',
    category: 'Utility',
    id:  "261",
    dependencies: 'QRCode.js'
  },
  {
    name: 'Indian Document Enhancer',
    slug: 'indian-document-enhancer',
    description: 'Enhances scanned images of Indian identification documents — Aadhaar, PAN, Voter ID, Driving License — for upload compliance on government portals.',
    seoDescription: 'Free online Indian Document Enhancer — Enhances scanned images of Indian identification documents — Aadhaar, PAN, Voter ID, Driving License — for upload compliance on government portals. 100% browser-based, no uploads.',
    category: 'indian-utilities',
    id:  "262",
    dependencies: 'Canvas API'
  },

  {
    name: 'Indian Voice Transcriber',
    slug: 'indian-voice-transcriber',
    description: 'Transcribes recorded audio into text with support for 12 Indian languages using browser-based speech recognition.',
    seoDescription: 'Free online Indian Voice Transcriber — Transcribes recorded audio into text with support for 12 Indian languages using browser-based speech recognition. 100% browser-based, no uploads.',
    category: 'indian-utilities',
    id:  "264",
    dependencies: 'Web Speech API'
  },
  {
    name: 'Bank Statement Analyser',
    slug: 'bank-statement-analyser',
    description: 'Parses uploaded bank statement PDFs or CSV exports and categorizes transactions into income, expense, and transfer categories with visual spending.',
    seoDescription: 'Free online Bank Statement Analyser — Parses uploaded bank statement PDFs or CSV exports and categorizes transactions into income, expense, and transfer categories with visual spending. 100% browser-based, no uploads.',
    category: 'Utility',
    id:  "265",
    dependencies: 'PDF.js'
  },


  {
    name: 'Social Media Calendar',
    slug: 'social-media-calendar',
    description: 'Lets users plan and schedule social media posts across multiple platforms in a visual calendar view with draft, scheduled.',
    seoDescription: 'Free online Social Media Calendar — Lets users plan and schedule social media posts across multiple platforms in a visual calendar view with draft, scheduled. 100% browser-based, no uploads.',
    category: 'Utility',
    id:  "268",
    dependencies: 'localStorage'
  },
  {
    name: 'Bulk Background Changer',
    slug: 'bulk-bg-changer',
    description: 'Removes or replaces backgrounds on multiple images simultaneously with color-key sampling and batch processing.',
    seoDescription: 'Free online Bulk Background Changer — Removes or replaces backgrounds on multiple images simultaneously with color-key sampling and batch processing. 100% browser-based, no uploads.',
    category: 'Image',
    id:  "269",
    dependencies: 'Canvas API',
    isPro: true,
  },
  {
    name: 'AI Background Changer',
    slug: 'ai-bg-changer',
    description: 'Removes and replaces image backgrounds using edge-aware detection algorithms that separate foreground subjects without a green screen.',
    seoDescription: 'Free online AI Background Changer — Removes and replaces image backgrounds using edge-aware detection algorithms that separate foreground subjects without a green screen. 100% browser-based, no uploads.',
    category: 'Image',
    id:  "270",
    dependencies: 'Canvas API'
  },
  {
    name: 'Link in Bio Builder',
    slug: 'link-in-bio-builder',
    description: 'Creates customizable link-in-bio landing pages with profile photo, bio, multiple social media links, and custom icon selection.',
    seoDescription: 'Free online Link in Bio Builder — Creates customizable link-in-bio landing pages with profile photo, bio, multiple social media links, and custom icon selection. 100% browser-based, no uploads.',
    category: 'Branding',
    id:  "271",
    dependencies: 'None'
  },
  {
    name: 'Timezone Converter',
    slug: 'ist-time-converter',
    description: 'Converts between 8+ major world time zones including IST, PST, EST, CST, GMT, UTC, JST, and SGT with live clocks.',
    seoDescription: 'Free online Timezone Converter — Converts between 8+ major world time zones including IST, PST, EST, CST, GMT, UTC, JST, and SGT with live clocks. 100% browser-based, no uploads.',
    category: 'Utility',
    id:  "272",
    dependencies: 'None'
  },
  {
    name: 'Audio Converter',
    slug: 'audio-converter',
    description: 'Converts audio files between MP3, WAV, OGG, and FLAC formats using FFmpeg WASM running entirely in the browser.',
    seoDescription: 'Free online Audio Converter — Converts audio files between MP3, WAV, OGG, and FLAC formats using FFmpeg WASM running entirely in the browser. 100% browser-based, no uploads.',
    category: 'Audio',
    id:  "273",
    dependencies: 'FFmpeg WASM'
  },
  {
    name: 'PDF Page Manager',
    slug: 'pdf-page-manager',
    description: 'Manages PDF pages with crop, organize, extract, rotate, and delete operations in a single unified interface with visual page thumbnails.',
    seoDescription: 'Free online PDF Page Manager — Manages PDF pages with crop, organize, extract, rotate, and delete operations in a single unified interface with visual page thumbnails. 100% browser-based, no uploads.',
    category: 'PDF',
    id:  "274",
    dependencies: 'pdf-lib'
  },
  {
    name: 'Bulk QR Code Generator',
    slug: 'bulk-qr-code-generator',
    description: 'Processes a CSV file containing multiple data entries and generates a corresponding QR code image for each row, delivered as a ZIP archive.',
    seoDescription: 'Free online Bulk QR Code Generator — Processes a CSV file containing multiple data entries and generates a corresponding QR code image for each row, delivered as a ZIP archive. 100% browser-based, no uploads.',
    category: 'Utility',
    id:  "275",
    dependencies: 'qrcode.js, JSZip',
    isPro: true,
  },
  {
    name: 'PDF AI Summariser',
    slug: 'pdf-ai-summariser',
    description: 'Uploads a PDF document, extracts its full text via OCR and native parsing, then sends the content to an LLM for a condensed summary highlighting key.',
    seoDescription: 'Free online PDF AI Summariser — Uploads a PDF document, extracts its full text via OCR and native parsing, then sends the content to an LLM for a condensed summary highlighting key. 100% browser-based, no uploads.',
    category: 'AI',
    id:  "276",
    dependencies: 'AI API, PDF.js'
  },
  {
    id: "278",
    name: "Bulk Image Watermark",
    slug: "bulk-image-watermark",
    category: "Image",
    description: "Apply a text logo, image logo, or timestamp overlay to dozens of images at once with configurable position, opacity, and rotation per batch.",
    seoDescription: 'Free online Bulk Image Watermark — Apply a text logo, image logo, or timestamp overlay to dozens of images at once with configurable position, opacity, and rotation per batch. 100% browser-based, no uploads.',
    dependencies: "Canvas API, jszip",
  },
  {
    id: "279",
    name: "Bulk PDF Data Extractor",
    slug: "bulk-pdf-data-extractor",
    category: "PDF",
    description: "Extract tables, form fields, and key-value pairs from multiple PDFs simultaneously and export the aggregated data to a single CSV or Excel file.",
    seoDescription: 'Free online Bulk PDF Data Extractor — Extract tables, form fields, and key-value pairs from multiple PDFs simultaneously and export the aggregated data to a single CSV or Excel file. 100% browser-based, no uploads.',
    dependencies: "pdf-lib, SheetJS",
  },
  {
    id: "280",
    name: "Bulk Image to PDF",
    slug: "bulk-image-to-pdf",
    category: "PDF",
    description: "Merge hundreds of JPG, PNG, or WebP images into a single multi-page PDF with configurable page size, orientation, and compression per batch.",
    seoDescription: 'Free online Bulk Image to PDF — Merge hundreds of JPG, PNG, or WebP images into a single multi-page PDF with configurable page size, orientation, and compression per batch. 100% browser-based, no uploads.',
    dependencies: "jsPDF, Canvas API",
  },
  {
    id: "281",
    name: "Bulk Audio Converter",
    slug: "bulk-audio-converter",
    category: "Audio",
    description: "Convert an entire folder of audio files between MP3, WAV, OGG, FLAC, and M4A formats in one batch with consistent quality and bitrate settings.",
    seoDescription: 'Free online Bulk Audio Converter — Convert an entire folder of audio files between MP3, WAV, OGG, FLAC, and M4A formats in one batch with consistent quality and bitrate settings. 100% browser-based, no uploads.',
    dependencies: "FFmpeg WASM",
  },
  {
    id: "282",
    name: "Bulk SVG to PNG",
    slug: "bulk-svg-to-png",
    category: "Image",
    description: "Rasterize hundreds of SVG files to PNG at any resolution, preserving vector sharpness. Ideal for generating icon sprite sheets and asset pipelines.",
    seoDescription: 'Free online Bulk SVG to PNG — Rasterize hundreds of SVG files to PNG at any resolution, preserving vector sharpness. Ideal for generating icon sprite sheets and asset pipelines. 100% browser-based, no uploads.',
    dependencies: "Canvas API, jszip",
  },
  {
    id: "283",
    name: "Bulk Image Compressor",
    slug: "bulk-image-compressor",
    category: "Image",
    description: "Compress JPG, PNG, and WebP images in bulk with uniform quality settings. E-commerce sellers use it to optimize entire product catalogs before upload.",
    seoDescription: 'Free online Bulk Image Compressor — Compress JPG, PNG, and WebP images in bulk with uniform quality settings. E-commerce sellers use it to optimize entire product catalogs before upload. 100% browser-based, no uploads.',
    dependencies: "browser-image-compression, jszip",
  },
  {
    id: "284",
    name: "Bulk PDF Size Reducer",
    slug: "bulk-pdf-size-reducer",
    category: "PDF",
    description: "Reduce file size of multiple PDFs at once by compressing embedded images, removing metadata, and optimizing object streams across the batch.",
    seoDescription: 'Free online Bulk PDF Size Reducer — Reduce file size of multiple PDFs at once by compressing embedded images, removing metadata, and optimizing object streams across the batch. 100% browser-based, no uploads.',
    dependencies: "pdf-lib",
  },
  {
    id: "285",
    name: "Bulk Image Resizer",
    slug: "bulk-image-resizer",
    category: "Image",
    description: "Resize hundreds of images to exact pixel dimensions or percentage scale in one pass. Photographers use it to standardize client galleries before delivery.",
    seoDescription: 'Free online Bulk Image Resizer — Resize hundreds of images to exact pixel dimensions or percentage scale in one pass. Photographers use it to standardize client galleries before delivery. 100% browser-based, no uploads.',
    dependencies: "Canvas API, jszip",
  },
  {
    id: "286",
    name: "Bulk Video Compressor",
    slug: "bulk-video-compressor",
    category: "Video",
    description: "Compress multiple video files simultaneously with consistent CRF, resolution, and codec settings. YouTube studios use it to batch-optimize daily uploads.",
    seoDescription: 'Free online Bulk Video Compressor — Compress multiple video files simultaneously with consistent CRF, resolution, and codec settings. YouTube studios use it to batch-optimize daily uploads. 100% browser-based, no uploads.',
    dependencies: "FFmpeg WASM",
  },
  {
    id: "287",
    name: "Bulk PDF Merger",
    slug: "bulk-pdf-merger",
    category: "PDF",
    description: "Join dozens of PDF files into one document in a single operation. Legal teams use it to consolidate contract bundles and discovery exhibits instantly.",
    seoDescription: 'Free online Bulk PDF Merger — Join dozens of PDF files into one document in a single operation. Legal teams use it to consolidate contract bundles and discovery exhibits instantly. 100% browser-based, no uploads.',
    dependencies: "pdf-lib",
  },
  {
    id: "288",
    name: "Bulk Face Anonymizer",
    slug: "bulk-face-anonymizer",
    category: "Image",
    description: "Detect and blur faces across multiple images automatically using on-device face detection. GDPR compliance teams use it to anonymize datasets before publication.",
    seoDescription: 'Free online Bulk Face Anonymizer — Detect and blur faces across multiple images automatically using on-device face detection. GDPR compliance teams use it to anonymize datasets before publication. 100% browser-based, no uploads.',
    dependencies: "TensorFlow.js, Canvas API, jszip",
  },
  {
    id: "289",
    name: "Bulk PDF Form Extractor",
    slug: "bulk-pdf-form-extractor",
    category: "PDF",
    description: "Extract filled form fields from hundreds of identical PDF forms and aggregate responses into a single CSV. Large-scale survey and application processing teams depend on it.",
    seoDescription: 'Free online Bulk PDF Form Extractor — Extract filled form fields from hundreds of identical PDF forms and aggregate responses into a single CSV. Large-scale survey and application processing teams depend on it. 100% browser-based, no uploads.',
    dependencies: "pdf-lib",
  },
  {
    id: "290",
    name: "Bulk Video Size Reducer",
    slug: "bulk-video-size-reducer",
    category: "Video",
    description: "Batch-reduce video file sizes to fit email attachment limits (25MB), messaging platform caps, or any user-defined target. Every office worker with video attachments needs this.",
    seoDescription: 'Free online Bulk Video Size Reducer — Batch-reduce video file sizes to fit email attachment limits (25MB), messaging platform caps, or any user-defined target. Every office worker with video attachments needs this. 100% browser-based, no uploads.',
    dependencies: "FFmpeg WASM",
  },
  {
    id: "291",
    name: "Bulk Audio Normalizer",
    slug: "bulk-audio-normalizer",
    category: "Audio",
    description: "Normalize loudness across multiple audio files to broadcast-standard LUFS levels (–16 LUFS for podcasts, –14 LUFS for streaming). Podcast networks use this to unify episode volume.",
    seoDescription: 'Free online Bulk Audio Normalizer — Normalize loudness across multiple audio files to broadcast-standard LUFS levels (–16 LUFS for podcasts, –14 LUFS for streaming). Podcast networks use this to unify episode volume. 100% browser-based, no uploads.',
    dependencies: "Web Audio API",
  },
  {
    id: "292",
    name: "Bulk Video Subtitle Burner",
    slug: "bulk-video-subtitle-burner",
    category: "Video",
    description: "Burn SRT or VTT subtitles directly into multiple video files in one batch. Content republishers use it to prepare videos for platforms that do not support soft subtitles.",
    seoDescription: 'Free online Bulk Video Subtitle Burner — Burn SRT or VTT subtitles directly into multiple video files in one batch. Content republishers use it to prepare videos for platforms that do not support soft subtitles. 100% browser-based, no uploads.',
    dependencies: "FFmpeg WASM",
  },
  {
    id: "293",
    name: "Bulk Invoice & Receipt Parser",
    slug: "bulk-invoice-receipt-parser",
    category: "Finance",
    description: "Drop 100 invoice PDFs or images, auto-detect date, vendor, amount, and tax, then export a clean CSV ready for tax filing. Replaces expensive accounting OCR per-document fees.",
    seoDescription: 'Free online Bulk Invoice & Receipt Parser — Drop 100 invoice PDFs or images, auto-detect date, vendor, amount, and tax, then export a clean CSV ready for tax filing. Replaces expensive accounting OCR per-document fees. 100% browser-based, no uploads.',
    dependencies: "Tesseract.js, pdf-lib, SheetJS",
  },
  {
    id: "294",
    name: "Bulk CSV/Excel to JSON",
    slug: "bulk-csv-excel-to-json",
    category: "Developer",
    description: "Convert messy CSV or Excel sheets from clients into clean JSON in one batch. Handles missing values, nested rows, and generates strict JSON schemas for 50+ files at once.",
    seoDescription: 'Free online Bulk CSV/Excel to JSON — Convert messy CSV or Excel sheets from clients into clean JSON in one batch. Handles missing values, nested rows, and generates strict JSON schemas for 50+ files at once. 100% browser-based, no uploads.',
    dependencies: "SheetJS",
  },
  {
    id: "295",
    name: "Bulk URL Status Checker",
    slug: "bulk-url-status-checker",
    category: "SEO",
    description: "Check 5,000 URLs for HTTP status codes (200, 301, 404, 500), extract title/meta descriptions, and flag slow pages. SEO agencies use it instead of $50/mo crawling tools.",
    seoDescription: 'Free online Bulk URL Status Checker — Check 5,000 URLs for HTTP status codes (200, 301, 404, 500), extract title/meta descriptions, and flag slow pages. SEO agencies use it instead of $50/mo crawling tools. 100% browser-based, no uploads.',
    dependencies: "fetch API",
  },
  {
    id: "296",
    name: "Bulk WebP/AVIF Modernizer",
    slug: "bulk-webp-avif-modernizer",
    category: "Image",
    description: "Convert entire image folders to WebP or AVIF while keeping directory structure intact. Generates fallback PNGs and ready-to-use HTML <picture> tag blocks per batch.",
    seoDescription: 'Free online Bulk WebP/AVIF Modernizer — Convert entire image folders to WebP or AVIF while keeping directory structure intact. Generates fallback PNGs and ready-to-use HTML <picture> tag blocks per batch. 100% browser-based, no uploads.',
    dependencies: "Canvas API, jszip",
  },
  {
    id: "297",
    name: "Bulk EXIF Stripper & Injector",
    slug: "bulk-exif-stripper-injector",
    category: "Image",
    description: "Strip GPS location, camera serial, and timestamps from thousands of photos client-side. Or bulk-inject copyright metadata using a template across an entire image library.",
    seoDescription: 'Free online Bulk EXIF Stripper & Injector — Strip GPS location, camera serial, and timestamps from thousands of photos client-side. Or bulk-inject copyright metadata using a template across an entire image library. 100% browser-based, no uploads.',
    dependencies: "exifr, piexifjs, jszip",
  },
  {
    id: "298",
    name: "Bulk App Icon Generator",
    slug: "bulk-app-icon-generator",
    category: "Image",
    description: "Upload one high-res SVG/PNG and export 30+ correctly sized icons for iOS, Android, PWA, Shopify, and social media OG images in a structured ZIP.",
    seoDescription: 'Free online Bulk App Icon Generator — Upload one high-res SVG/PNG and export 30+ correctly sized icons for iOS, Android, PWA, Shopify, and social media OG images in a structured ZIP. 100% browser-based, no uploads.',
    dependencies: "Canvas API, jszip",
  },
  {
    id: "299",
    name: "Bulk Markdown to PDF/HTML",
    slug: "bulk-markdown-to-pdf-html",
    category: "Developer",
    description: "Convert 100+ Markdown files into beautifully styled PDFs or static HTML with custom CSS, auto-generated table of contents, and corporate templates.",
    seoDescription: 'Free online Bulk Markdown to PDF/HTML — Convert 100+ Markdown files into beautifully styled PDFs or static HTML with custom CSS, auto-generated table of contents, and corporate templates. 100% browser-based, no uploads.',
    dependencies: "marked.js, jsPDF, jszip",
  },
  {
    id: "300",
    name: "Bulk Font Subsetter",
    slug: "bulk-font-subsetter",
    category: "Developer",
    description: "Convert TTF/OTF fonts to WOFF2 and subset to only used characters (Latin, Cyrillic, etc.). Generates @font-face CSS blocks. Cuts font files from MBs to KBs.",
    seoDescription: 'Free online Bulk Font Subsetter — Convert TTF/OTF fonts to WOFF2 and subset to only used characters (Latin, Cyrillic, etc.). Generates @font-face CSS blocks. Cuts font files from MBs to KBs. 100% browser-based, no uploads.',
    dependencies: "opentype.js, jszip",
  },
  {
    id: "301",
    name: "Bulk Subtitle Time-Shifter",
    slug: "bulk-subtitle-time-shifter",
    category: "Video",
    description: "Apply global time offset (+/- seconds) to a whole season of SRT/VTT files at once. Localization agencies use it to realign and translate subtitle batches.",
    seoDescription: 'Free online Bulk Subtitle Time-Shifter — Apply global time offset (+/- seconds) to a whole season of SRT/VTT files at once. Localization agencies use it to realign and translate subtitle batches. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS, jszip",
  },
  {
    id: "302",
    name: "Bulk Regex Extractor & Replacer",
    slug: "bulk-regex-extractor-replacer",
    category: "Developer",
    description: "Scan thousands of log files or codebase files for regex patterns (IPs, API keys, URLs) and extract or replace them. Visual builder for non-coders with live preview.",
    seoDescription: 'Free online Bulk Regex Extractor & Replacer — Scan thousands of log files or codebase files for regex patterns (IPs, API keys, URLs) and extract or replace them. Visual builder for non-coders with live preview. 100% browser-based, no uploads.',
    dependencies: "Vanilla JS, jszip",
  },
  {
    id: "303",
    name: "Bulk Image to Text (OCR)",
    slug: "bulk-image-to-text-ocr",
    category: "Image",
    description: "Extract text from batches of scanned JPGs, PNGs, or PDF pages and export as a single formatted Word doc. Students and digitizers use it instead of typing 40 pages manually.",
    seoDescription: 'Free online Bulk Image to Text (OCR) — Extract text from batches of scanned JPGs, PNGs, or PDF pages and export as a single formatted Word doc. Students and digitizers use it instead of typing 40 pages manually. 100% browser-based, no uploads.',
    dependencies: "Tesseract.js, jszip",
  },
  {
    id: "304",
    name: "Bulk E-Book Converter",
    slug: "bulk-ebook-converter",
    category: "Converter",
    description: "Convert your entire digital library between EPUB, MOBI, and PDF in one batch. Heavy readers use it instead of single-file converters that limit you to 2 files at a time.",
    seoDescription: 'Free online Bulk E-Book Converter — Convert your entire digital library between EPUB, MOBI, and PDF in one batch. Heavy readers use it instead of single-file converters that limit you to 2 files at a time. 100% browser-based, no uploads.',
    dependencies: "EPUB.js, jszip",
  },
  {
    id: "306",
    name: "Bulk HEIC to JPG",
    slug: "bulk-heic-to-jpg",
    category: "Image",
    description: "Convert hundreds of iPhone HEIC photos to universal JPGs in one batch — fully client-side so your personal vacation photos never leave your machine. Windows users finally view their iPhone library.",
    seoDescription: 'Free online Bulk HEIC to JPG — Convert hundreds of iPhone HEIC photos to universal JPGs in one batch — fully client-side so your personal vacation photos never leave your machine. Windows users finally view their iPhone library. 100% browser-based, no uploads.',
    dependencies: "libheif WASM, jszip",
  },
  {
    id: "307",
    name: "Tax Saving Calculator",
    slug: "tax-saving-calculator",
    category: "indian-utilities",
    description: "Compares Old vs New tax regime liability with 80C, 80D, NPS, HRA, and home loan deductions. Generates personalised tax-saving report for Indian salaried employees.",
    seoDescription: 'Free online Tax Saving Calculator — Compares Old vs New tax regime liability with 80C, 80D, NPS, HRA, and home loan deductions. Generates personalised tax-saving report for Indian salaried employees. 100% browser-based, no uploads.',
    dependencies: "None",
  },
  {
    id: "308",
    name: "GSTIN Lookup",
    slug: "gstin-lookup",
    category: "indian-utilities",
    description: "Verify any GSTIN instantly — get legal name, trade name, address, registration date, and filing status. Bulk verification via CSV export for accounts teams.",
    seoDescription: 'Free online GSTIN Lookup — Verify any GSTIN instantly with legal name, trade name, address, registration date, and filing status. 100% browser-based, no uploads.',
    dependencies: "None",
  },
  {
    id: "309",
    name: "Seller Profit Calculator",
    slug: "seller-profit-calculator",
    category: "indian-utilities",
    description: "Calculate exact profit after Meesho/Amazon/Flipkart commissions, GST, shipping, returns, and packaging. Compare platforms side-by-side. Made for Indian e-commerce sellers.",
    seoDescription: 'Free online Seller Profit Calculator — Calculate exact profit after Meesho/Amazon/Flipkart commissions, GST, shipping, returns, and packaging. Compare platforms side-by-side. 100% browser-based, no uploads.',
    dependencies: "None",
  },
  {
    id: "310",
    name: "Complaint Letter Generator",
    slug: "complaint-letter-generator",
    category: "indian-utilities",
    description: "Generates legally correct formal complaint letters citing Indian consumer law (Consumer Protection Act 2019, RERA, TRAI, RBI). AI-powered with your API key.",
    seoDescription: 'Free online Complaint Letter Generator — Generates legally correct formal complaint letters citing Indian consumer law (Consumer Protection Act 2019, RERA, TRAI, RBI). 100% browser-based, no uploads.',
    dependencies: "AI API",
  }
];
const proSlugs = [
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
  "bulk-heic-to-jpg"
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
  // Image → Image format conversions
  { slug: "bulk-png-to-webp", name: "Bulk PNG to WebP", category: "Image", description: "Convert all your PNG images to modern WebP format in one batch. Shrinks file sizes by 30% without losing quality — essential for Pagespeed scores.", seoDescription: 'Free online Bulk PNG to WebP — Convert all your PNG images to modern WebP format in one batch. Shrinks file sizes by 30% without losing quality — essential for Pagespeed scores. 100% browser-based, no uploads.', parentSlug: "bulk-webp-avif-modernizer" },
  { slug: "bulk-jpg-to-webp", name: "Bulk JPG to WebP", category: "Image", description: "Batch convert JPEG images to WebP format for faster websites. Keeps directory structure intact and generates fallback PNGs automatically.", seoDescription: 'Free online Bulk JPG to WebP — Batch convert JPEG images to WebP format for faster websites. Keeps directory structure intact and generates fallback PNGs automatically. 100% browser-based, no uploads.', parentSlug: "bulk-webp-avif-modernizer" },
  { slug: "bulk-png-to-avif", name: "Bulk PNG to AVIF", category: "Image", description: "Convert PNG images to next-gen AVIF format in bulk. AVIF offers 50% smaller files than JPEG at same quality — best for modern browsers.", seoDescription: 'Free online Bulk PNG to AVIF — Convert PNG images to next-gen AVIF format in bulk. AVIF offers 50% smaller files than JPEG at same quality — best for modern browsers. 100% browser-based, no uploads.', parentSlug: "bulk-webp-avif-modernizer" },
  { slug: "bulk-jpg-to-avif", name: "Bulk JPG to AVIF", category: "Image", description: "Batch convert JPEG photos to AVIF format. Unlock Google Pagespeed's perfect score by serving AVIF with automatic fallback generation.", seoDescription: 'Free online Bulk JPG to AVIF — Batch convert JPEG photos to AVIF format. Unlock Google Pagespeed\'s perfect score by serving AVIF with automatic fallback generation. 100% browser-based, no uploads.', parentSlug: "bulk-webp-avif-modernizer" },
  { slug: "bulk-webp-to-png", name: "Bulk WebP to PNG", category: "Image", description: "Need WebP files back to PNG? Convert entire folders of WebP images to universal PNG format in one click — zero quality loss.", seoDescription: 'Free online Bulk WebP to PNG — Need WebP files back to PNG? Convert entire folders of WebP images to universal PNG format in one click — zero quality loss. 100% browser-based, no uploads.', parentSlug: "bulk-webp-avif-modernizer" },
  { slug: "bulk-heic-to-webp", name: "Bulk HEIC to WebP", category: "Image", description: "iPhone HEIC photos too large for the web? Batch convert them to WebP directly in browser — no uploads, no privacy risk.", seoDescription: 'Free online Bulk HEIC to WebP — iPhone HEIC photos too large for the web? Batch convert them to WebP directly in browser — no uploads, no privacy risk. 100% browser-based, no uploads.', parentSlug: "bulk-webp-avif-modernizer" },
  { slug: "bulk-heic-to-png", name: "Bulk HEIC to PNG", category: "Image", description: "Convert hundreds of Apple HEIC photos to universal PNG format in one batch. Fully client-side — your photos never leave your device.", seoDescription: 'Free online Bulk HEIC to PNG — Convert hundreds of Apple HEIC photos to universal PNG format in one batch. Fully client-side — your photos never leave your device. 100% browser-based, no uploads.', parentSlug: "bulk-heic-to-jpg" },
  { slug: "bulk-png-to-jpg", name: "Bulk PNG to JPG", category: "Image", description: "Batch convert PNG images to JPEG format. Perfect when you need smaller file sizes for email or web upload at the cost of transparency.", seoDescription: 'Free online Bulk PNG to JPG — Batch convert PNG images to JPEG format. Perfect when you need smaller file sizes for email or web upload at the cost of transparency. 100% browser-based, no uploads.', parentSlug: "bulk-image-compressor" },
  { slug: "bulk-jpg-to-png", name: "Bulk JPG to PNG", category: "Image", description: "Convert JPEG photos to lossless PNG format in bulk. Essential for graphics needing transparency or when preserving every pixel matters.", seoDescription: 'Free online Bulk JPG to PNG — Convert JPEG photos to lossless PNG format in bulk. Essential for graphics needing transparency or when preserving every pixel matters. 100% browser-based, no uploads.', parentSlug: "bulk-image-compressor" },
  { slug: "bulk-webp-to-jpg", name: "Bulk WebP to JPG", category: "Image", description: "Batch convert WebP images back to universal JPEG format. For platforms and devices that still don't support Google's modern image format.", seoDescription: 'Free online Bulk WebP to JPG — Batch convert WebP images back to universal JPEG format. For platforms and devices that still don\'t support Google\'s modern image format. 100% browser-based, no uploads.', parentSlug: "bulk-image-compressor" },
  // Batch resize / compress
  { slug: "bulk-resize-images", name: "Bulk Resize Images", category: "Image", description: "Resize hundreds of photos to exact pixel dimensions in one pass. Photographers standardize client galleries before delivery with this tool.", seoDescription: 'Free online Bulk Resize Images — Resize hundreds of photos to exact pixel dimensions in one pass. Photographers standardize client galleries before delivery with this tool. 100% browser-based, no uploads.', parentSlug: "bulk-image-resizer" },
  { slug: "bulk-compress-png", name: "Bulk PNG Compressor", category: "Image", description: "Compress dozens of PNG files at once with smart lossy compression. E-commerce sellers optimize product images while keeping transparency.", seoDescription: 'Free online Bulk PNG Compressor — Compress dozens of PNG files at once with smart lossy compression. E-commerce sellers optimize product images while keeping transparency. 100% browser-based, no uploads.', parentSlug: "bulk-image-compressor" },
  { slug: "bulk-compress-jpg", name: "Bulk JPG Compressor", category: "Image", description: "Batch compress JPEG photos to smaller file sizes with consistent quality. Bloggers and web devs optimize entire image libraries before deployment.", seoDescription: 'Free online Bulk JPG Compressor — Batch compress JPEG photos to smaller file sizes with consistent quality. Bloggers and web devs optimize entire image libraries before deployment. 100% browser-based, no uploads.', parentSlug: "bulk-image-compressor" },
  // Audio format conversions
  { slug: "bulk-mp3-to-wav", name: "Bulk MP3 to WAV", category: "Audio", description: "Convert your MP3 music library to lossless WAV format in one batch. Audio editors and podcasters need WAV for professional production workflows.", seoDescription: 'Free online Bulk MP3 to WAV — Convert your MP3 music library to lossless WAV format in one batch. Audio editors and podcasters need WAV for professional production workflows. 100% browser-based, no uploads.', parentSlug: "bulk-audio-converter" },
  { slug: "bulk-wav-to-mp3", name: "Bulk WAV to MP3", category: "Audio", description: "Batch compress WAV recordings to space-saving MP3 files. Podcasters shrinking raw studio recordings for distribution on Spotify and Apple Podcasts.", seoDescription: 'Free online Bulk WAV to MP3 — Batch compress WAV recordings to space-saving MP3 files. Podcasters shrinking raw studio recordings for distribution on Spotify and Apple Podcasts. 100% browser-based, no uploads.', parentSlug: "bulk-audio-converter" },
  { slug: "bulk-flac-to-mp3", name: "Bulk FLAC to MP3", category: "Audio", description: "Convert FLAC audio files to universally compatible MP3 format in bulk. Perfect for building a portable music library from your lossless archives.", seoDescription: 'Free online Bulk FLAC to MP3 — Convert FLAC audio files to universally compatible MP3 format in bulk. Perfect for building a portable music library from your lossless archives. 100% browser-based, no uploads.', parentSlug: "bulk-audio-converter" },
  { slug: "bulk-ogg-to-mp3", name: "Bulk OGG to MP3", category: "Audio", description: "Batch convert OGG Vorbis files to MP3. For users moving from open-source audio players to devices that only support the MP3 codec.", seoDescription: 'Free online Bulk OGG to MP3 — Batch convert OGG Vorbis files to MP3. For users moving from open-source audio players to devices that only support the MP3 codec. 100% browser-based, no uploads.', parentSlug: "bulk-audio-converter" },
  { slug: "bulk-m4a-to-mp3", name: "Bulk M4A to MP3", category: "Audio", description: "Convert Apple M4A audio files to MP3 in one batch. Android and Windows users converting their iTunes library for cross-platform playback.", seoDescription: 'Free online Bulk M4A to MP3 — Convert Apple M4A audio files to MP3 in one batch. Android and Windows users converting their iTunes library for cross-platform playback. 100% browser-based, no uploads.', parentSlug: "bulk-audio-converter" },
  // Video format conversions
  { slug: "bulk-mp4-to-mov", name: "Bulk MP4 to MOV", category: "Video", description: "Batch convert MP4 videos to QuickTime MOV format. Video editors receiving MP4 files for Final Cut Pro or Premiere Pro workflows.", seoDescription: 'Free online Bulk MP4 to MOV — Batch convert MP4 videos to QuickTime MOV format. Video editors receiving MP4 files for Final Cut Pro or Premiere Pro workflows. 100% browser-based, no uploads.', parentSlug: "bulk-video-compressor" },
  { slug: "bulk-mov-to-mp4", name: "Bulk MOV to MP4", category: "Video", description: "Convert dozens of QuickTime MOV files to web-friendly MP4 in one batch. Social media managers preparing footage for YouTube and Instagram.", seoDescription: 'Free online Bulk MOV to MP4 — Convert dozens of QuickTime MOV files to web-friendly MP4 in one batch. Social media managers preparing footage for YouTube and Instagram. 100% browser-based, no uploads.', parentSlug: "bulk-video-compressor" },
  { slug: "bulk-mkv-to-mp4", name: "Bulk MKV to MP4", category: "Video", description: "Batch remux MKV video files to universally compatible MP4 without re-encoding. Smart TV and iPhone users solving format compatibility issues.", seoDescription: 'Free online Bulk MKV to MP4 — Batch remux MKV video files to universally compatible MP4 without re-encoding. Smart TV and iPhone users solving format compatibility issues. 100% browser-based, no uploads.', parentSlug: "bulk-video-compressor" },
  { slug: "bulk-avi-to-mp4", name: "Bulk AVI to MP4", category: "Video", description: "Convert AVI video files to modern MP4 format in bulk. Archivists digitizing old video libraries for long-term preservation and easy playback.", seoDescription: 'Free online Bulk AVI to MP4 — Convert AVI video files to modern MP4 format in bulk. Archivists digitizing old video libraries for long-term preservation and easy playback. 100% browser-based, no uploads.', parentSlug: "bulk-video-compressor" },
  { slug: "bulk-webm-to-mp4", name: "Bulk WebM to MP4", category: "Video", description: "Batch convert WebM screen recordings to MP4. Designers and developers who receive Loom or Chrome recordings need MP4 for editing software.", seoDescription: 'Free online Bulk WebM to MP4 — Batch convert WebM screen recordings to MP4. Designers and developers who receive Loom or Chrome recordings need MP4 for editing software. 100% browser-based, no uploads.', parentSlug: "bulk-video-compressor" },
  { slug: "bulk-compress-mp4", name: "Bulk MP4 Compressor", category: "Video", description: "Compress multiple MP4 videos at once for email, web, or messaging. YouTube studios batch-optimize daily uploads with consistent CRF settings.", seoDescription: 'Free online Bulk MP4 Compressor — Compress multiple MP4 videos at once for email, web, or messaging. YouTube studios batch-optimize daily uploads with consistent CRF settings. 100% browser-based, no uploads.', parentSlug: "bulk-video-compressor" },
  // PDF operations
  { slug: "bulk-pdf-to-word", name: "Bulk PDF to Word", category: "PDF", description: "Convert dozens of PDF files to editable Word documents in one batch. Legal teams and researchers extract text from multiple contracts simultaneously.", seoDescription: 'Free online Bulk PDF to Word — Convert dozens of PDF files to editable Word documents in one batch. Legal teams and researchers extract text from multiple contracts simultaneously. 100% browser-based, no uploads.', parentSlug: "bulk-pdf-data-extractor" },
  { slug: "bulk-pdf-to-excel", name: "Bulk PDF to Excel", category: "PDF", description: "Extract tables from multiple PDFs and export to Excel in one click. Accountants processing monthly financial statements from vendor PDFs.", seoDescription: 'Free online Bulk PDF to Excel — Extract tables from multiple PDFs and export to Excel in one click. Accountants processing monthly financial statements from vendor PDFs. 100% browser-based, no uploads.', parentSlug: "bulk-pdf-data-extractor" },
  { slug: "bulk-pdf-to-jpg", name: "Bulk PDF to JPG", category: "PDF", description: "Convert each page of multiple PDFs to high-res JPG images. Presenters extracting slides from decks for social media or thumbnails.", seoDescription: 'Free online Bulk PDF to JPG — Convert each page of multiple PDFs to high-res JPG images. Presenters extracting slides from decks for social media or thumbnails. 100% browser-based, no uploads.', parentSlug: "bulk-pdf-data-extractor" },
  { slug: "bulk-image-to-pdf-v2", name: "Bulk JPG/PNG to PDF", category: "PDF", description: "Merge hundreds of scanned images into a single multi-page PDF. Real estate agents and HR teams bundle property photos or applicant documents.", seoDescription: 'Free online Bulk JPG/PNG to PDF — Merge hundreds of scanned images into a single multi-page PDF. Real estate agents and HR teams bundle property photos or applicant documents. 100% browser-based, no uploads.', parentSlug: "bulk-image-to-pdf" },
  { slug: "bulk-compress-pdf", name: "Bulk PDF Compressor", category: "PDF", description: "Reduce file size of multiple PDFs at once by compressing images and removing metadata. Law firms preparing document batches for email.", seoDescription: 'Free online Bulk PDF Compressor — Reduce file size of multiple PDFs at once by compressing images and removing metadata. Law firms preparing document batches for email. 100% browser-based, no uploads.', parentSlug: "bulk-pdf-size-reducer" },
  // Document conversions
  { slug: "bulk-epub-to-pdf", name: "Bulk EPUB to PDF", category: "Converter", description: "Convert your entire e-book library from EPUB to PDF format. Students and researchers who need to annotate academic texts on any device.", seoDescription: 'Free online Bulk EPUB to PDF — Convert your entire e-book library from EPUB to PDF format. Students and researchers who need to annotate academic texts on any device. 100% browser-based, no uploads.', parentSlug: "bulk-ebook-converter" },
  { slug: "bulk-mobi-to-pdf", name: "Bulk MOBI to PDF", category: "Converter", description: "Batch convert Kindle MOBI files to universal PDF. Kindle users switching to iPad or other tablets need their library in a readable format.", seoDescription: 'Free online Bulk MOBI to PDF — Batch convert Kindle MOBI files to universal PDF. Kindle users switching to iPad or other tablets need their library in a readable format. 100% browser-based, no uploads.', parentSlug: "bulk-ebook-converter" },
  { slug: "bulk-pdf-to-epub", name: "Bulk PDF to EPUB", category: "Converter", description: "Convert PDF documents to reflowable EPUB format for e-readers. Academics converting paper scans for comfortable reading on Kindle or Kobo.", seoDescription: 'Free online Bulk PDF to EPUB — Convert PDF documents to reflowable EPUB format for e-readers. Academics converting paper scans for comfortable reading on Kindle or Kobo. 100% browser-based, no uploads.', parentSlug: "bulk-ebook-converter" },
  { slug: "bulk-markdown-to-pdf", name: "Bulk Markdown to PDF", category: "Developer", description: "Generate styled PDF documents from your Markdown files. Technical writers and developers produce documentation releases from markdown source.", seoDescription: 'Free online Bulk Markdown to PDF — Generate styled PDF documents from your Markdown files. Technical writers and developers produce documentation releases from markdown source. 100% browser-based, no uploads.', parentSlug: "bulk-markdown-to-pdf-html" },
  { slug: "bulk-markdown-to-html", name: "Bulk Markdown to HTML", category: "Developer", description: "Convert Markdown files to clean HTML in batch. Documentation teams building static knowledge bases from markdown source files.", seoDescription: 'Free online Bulk Markdown to HTML — Convert Markdown files to clean HTML in batch. Documentation teams building static knowledge bases from markdown source files. 100% browser-based, no uploads.', parentSlug: "bulk-markdown-to-pdf-html" },
  // Bulk workflow pages
  { slug: "bulk-add-watermark", name: "Add Watermark to Multiple Images", category: "Image", description: "Apply a text logo, timestamp, or copyright symbol to dozens of product photos at once. E-commerce sellers protect their catalog images.", seoDescription: 'Free online Add Watermark to Multiple Images — Apply a text logo, timestamp, or copyright symbol to dozens of product photos at once. E-commerce sellers protect their catalog images. 100% browser-based, no uploads.', parentSlug: "bulk-image-watermark" },
  { slug: "bulk-anonymize-faces", name: "Blur Faces in Multiple Photos", category: "Image", description: "Redact faces across hundreds of images for GDPR compliance. Journalists and researchers use it to protect subject identities in batch.", seoDescription: 'Free online Blur Faces in Multiple Photos — Redact faces across hundreds of images for GDPR compliance. Journalists and researchers use it to protect subject identities in batch. 100% browser-based, no uploads.', parentSlug: "bulk-face-anonymizer" },
  { slug: "bulk-ocr-documents", name: "OCR Scan Multiple Documents", category: "Image", description: "Extract text from scanned document images in bulk. Digitize your paper archives with browser-based OCR that never uploads to any server.", seoDescription: 'Free online OCR Scan Multiple Documents — Extract text from scanned document images in bulk. Digitize your paper archives with browser-based OCR that never uploads to any server. 100% browser-based, no uploads.', parentSlug: "bulk-image-to-text-ocr" },
  { slug: "bulk-invoice-to-csv", name: "Bulk Invoice to CSV", category: "Finance", description: "Parse invoice numbers, dates, totals, and vendor names from receipt images into a clean CSV spreadsheet. Accountants process monthly expense batches.", seoDescription: 'Free online Bulk Invoice to CSV — Parse invoice numbers, dates, totals, and vendor names from receipt images into a clean CSV spreadsheet. Accountants process monthly expense batches. 100% browser-based, no uploads.', parentSlug: "bulk-invoice-receipt-parser" },
  { slug: "bulk-spreadsheet-to-json", name: "Bulk Spreadsheet to JSON", category: "Developer", description: "Convert CSV and Excel files to structured JSON in one batch. API developers ingest spreadsheet data without writing ETL pipelines.", seoDescription: 'Free online Bulk Spreadsheet to JSON — Convert CSV and Excel files to structured JSON in one batch. API developers ingest spreadsheet data without writing ETL pipelines. 100% browser-based, no uploads.', parentSlug: "bulk-csv-excel-to-json" },
  { slug: "bulk-check-broken-links", name: "Bulk Broken Link Checker", category: "SEO", description: "Scan hundreds of URLs for broken links and HTTP errors. SEO professionals audit entire sitemaps for 404s before Google crawls them.", seoDescription: 'Free online Bulk Broken Link Checker — Scan hundreds of URLs for broken links and HTTP errors. SEO professionals audit entire sitemaps for 404s before Google crawls them. 100% browser-based, no uploads.', parentSlug: "bulk-url-status-checker" },
  { slug: "bulk-font-minifier", name: "Bulk Font File Reducer", category: "Developer", description: "Subset web fonts to include only the characters your site needs. Slash font file sizes by 80%+ for faster Core Web Vitals.", seoDescription: 'Free online Bulk Font File Reducer — Subset web fonts to include only the characters your site needs. Slash font file sizes by 80%+ for faster Core Web Vitals. 100% browser-based, no uploads.', parentSlug: "bulk-font-subsetter" },
  { slug: "bulk-sync-subtitles", name: "Bulk Subtitle Syncer", category: "Video", description: "Shift SRT subtitle timestamps forward or backward across multiple language tracks. Video publishers sync subtitles to re-edited episodes.", seoDescription: 'Free online Bulk Subtitle Syncer — Shift SRT subtitle timestamps forward or backward across multiple language tracks. Video publishers sync subtitles to re-edited episodes. 100% browser-based, no uploads.', parentSlug: "bulk-subtitle-time-shifter" },
  { slug: "bulk-regex-cleaner", name: "Bulk Regex Data Cleaner", category: "Developer", description: "Extract or replace regex patterns across hundreds of text files. Data engineers sanitize logs, CSVs, and config files in one pass.", seoDescription: 'Free online Bulk Regex Data Cleaner — Extract or replace regex patterns across hundreds of text files. Data engineers sanitize logs, CSVs, and config files in one pass. 100% browser-based, no uploads.', parentSlug: "bulk-regex-extractor-replacer" },
  { slug: "bulk-strip-exif", name: "Bulk Photo Metadata Remover", category: "Privacy", description: "Strip GPS coordinates, camera data, and hidden metadata from batches of photos. Real estate agents protect client privacy before upload.", seoDescription: 'Free online Bulk Photo Metadata Remover — Strip GPS coordinates, camera data, and hidden metadata from batches of photos. Real estate agents protect client privacy before upload. 100% browser-based, no uploads.', parentSlug: "bulk-exif-stripper-injector" },
  { slug: "bulk-normalize-audio", name: "Bulk Audio Normalizer", category: "Audio", description: "Level loudness across your podcast episodes or music library. Consistent volume means listeners don't reach for the volume knob between tracks.", seoDescription: 'Free online Bulk Audio Normalizer — Level loudness across your podcast episodes or music library. Consistent volume means listeners don\'t reach for the volume knob between tracks. 100% browser-based, no uploads.', parentSlug: "bulk-audio-normalizer" },
  { slug: "bulk-pdf-text-extractor", name: "Bulk PDF Text Extractor", category: "PDF", description: "Extract text from hundreds of PDFs at once. Researchers and legal teams mine document collections for keywords and citations.", seoDescription: 'Free online Bulk PDF Text Extractor — Extract text from hundreds of PDFs at once. Researchers and legal teams mine document collections for keywords and citations. 100% browser-based, no uploads.', parentSlug: "bulk-pdf-data-extractor" },
  { slug: "bulk-pdf-form-data", name: "Bulk PDF Form Data Export", category: "PDF", description: "Export form field data from fillable PDFs to structured CSV. HR teams batch-process employee forms without manual data entry.", seoDescription: 'Free online Bulk PDF Form Data Export — Export form field data from fillable PDFs to structured CSV. HR teams batch-process employee forms without manual data entry. 100% browser-based, no uploads.', parentSlug: "bulk-pdf-form-extractor" },
  { slug: "bulk-svg-to-png-converter", name: "Bulk SVG to PNG", category: "Image", description: "Convert SVG vector icons to PNG images at any resolution. Designers generate asset libraries for mobile apps and websites.", seoDescription: 'Free online Bulk SVG to PNG — Convert SVG vector icons to PNG images at any resolution. Designers generate asset libraries for mobile apps and websites. 100% browser-based, no uploads.', parentSlug: "bulk-svg-to-png" },
];

// Add SEO landing pages to registry (programmatic) — MUST happen before toolsRegistry map
  for (const p of SEO_PERMUTATIONS) {
    (rawToolsRegistry as ToolMetadata[]).push({
      id: `seo-${p.slug}`,
      name: p.name,
      slug: p.slug,
      category: p.category,
      description: p.description,
      seoDescription: p.seoDescription,
      dependencies: "Browser API (landing page)",
    });
  }

export const toolsRegistry: ToolMetadata[] = rawToolsRegistry.map(tool => ({
  ...tool,
  isPro: proSlugs.includes(tool.slug)
}));

export const getToolBySlug = (slug: string) => toolsRegistry.find(t => t.slug === slug);
export const getToolsByCategory = (category: string) => toolsRegistry.filter(t => t.category === category);
export const getToolByCategoryAndSlug = (category: string, slug: string) => toolsRegistry.find(t => t.category.toLowerCase().replace(/\s+/g, '-') === category && t.slug === slug);

export function getSeoParentSlug(slug: string): string | undefined {
  return SEO_PERMUTATIONS.find(p => p.slug === slug)?.parentSlug;
}

