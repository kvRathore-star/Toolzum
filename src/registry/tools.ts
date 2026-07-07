export type ToolCategory =
  | "PDF"
  | "Image"
  | "Text"
  | "Developer"
  | "Finance"
  | "Utility"
  | "Converter"
  | "Downloader"
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
}

const rawToolsRegistry: ToolMetadata[] = [
  {
    id: "add-text-1",
    name: "Add Text to Photo",
    description: 'Overlays custom text captions onto images with control over font, size, color, alignment, opacity, and rotation angle.',
    category: "Image",
    slug: "add-text-to-photo",
    dependencies: "Canvas API",
  },
  {
    id: "batch-edit-1",
    name: "Batch Image Editor",
    description: 'Applies resize, crop, rotate, format conversion, and compression settings to dozens of images simultaneously with one click.',
    category: "Image",
    slug: "batch-image-editor",
    dependencies: "Canvas API, jszip",
    isPro: true,
  },

  {
    id: "gif-comp-1",
    name: "GIF Compressor",
    description: "Reduce GIF file sizes instantly without losing too much visual quality.",
    category: "Video",
    slug: "gif-compressor",
    dependencies: "ffmpeg",
  },
  {
    id: "img-gif-1",
    name: "Image to GIF Maker",
    description: 'Stitches a sequence of uploaded still images (PNG, JPG, or WebP) into a single animated GIF, with configurable frame delay, loop count.',
    category: "Video",
    slug: "image-to-gif",
    dependencies: "ffmpeg",
  },
  {
    id: "mp4-gif-1",
    name: "MP4 to GIF",
    description: 'Transcodes an MP4 video into an animated GIF with controls for start and end time, frame-skipping rate, and output width.',
    category: "Video",
    slug: "mp4-to-gif",
    dependencies: "ffmpeg",
  },
  {
    id: "webm-gif-1",
    name: "WEBM to GIF",
    description: 'Converts a WebM video into an animated GIF with adjustable quality (number of colors from 32 to 256) and optional dithering algorithms.',
    category: "Video",
    slug: "webm-to-gif",
    dependencies: "ffmpeg",
  },
  {
    id: "mov-gif-1",
    name: "MOV to GIF",
    description: 'Converts an uploaded MOV video file into an animated GIF, allowing the user to trim start and end times and set the output frame rate and dimensions.',
    category: "Video",
    slug: "mov-to-gif",
    dependencies: "ffmpeg",
  },
  {
    id: "vid-mp3-1",
    name: "Video to MP3 Converter",
    description: 'Extracts the audio track from uploaded video files (MP4, MOV, AVI, WebM) and encodes it as a high-quality MP3 file.',
    category: "Video",
    slug: "video-to-mp3",
    dependencies: "ffmpeg",
  },
  {
    id: "mp3-ogg-1",
    name: "MP3 to OGG Converter",
    description: 'Transcodes an MP3 audio file to the OGG Vorbis format with adjustable quality slider from -1 (lowest) to 10 (highest), corresponding to bitrates.',
    category: "Audio",
    slug: "mp3-to-ogg",
    dependencies: "ffmpeg",
  },
  {
    id: "wav-comp-1",
    name: "WAV Compressor",
    description: 'Reduces the file size of uploaded WAV audio files by lowering the bit depth (16 or 8 bit) and sample rate (44100, 22050, or 11025 Hz).',
    category: "Audio",
    slug: "wav-compressor",
    dependencies: "ffmpeg",
  },
  {
    id: "vid-crop-1",
    name: "Crop Video",
    description: "Crop the visual area of your MP4 video entirely in the browser.",
    category: "Video",
    slug: "crop-video",
    dependencies: "ffmpeg",
  },
  {
    id: "dev-json-xml-1",
    name: "JSON to XML",
    description: 'Transforms valid JSON documents into well-formed XML using customizable root-element naming and array-handling rules.',
    category: "Developer",
    slug: "json-to-xml",
    dependencies: "xml2js",
  },
  {
    id: "time-conv-1",
    name: "Time Converter",
    description: 'Converts a given date and time between any two time zones from a database of 400+ IANA time zones, and simultaneously displays it in Unix timestamp.',
    category: "Converter",
    slug: "time-converter",
    dependencies: "None",
  },
  {
    id: "time-pst-est-1",
    name: "PST to EST Converter",
    description: 'Converts a user-entered Pacific Time value to Eastern Time. East-coast project managers use it to avoid 3-hour scheduling errors.',
    category: "Converter",
    slug: "pst-to-est",
    dependencies: "None",
  },
  {
    id: "time-cst-est-1",
    name: "CST to EST Converter",
    description: 'Converts a user-entered Central Time value to Eastern Time, showing both the direct conversion and a side-by-side comparison clock.',
    category: "Converter",
    slug: "cst-to-est",
    dependencies: "None",
  },
  {
    id: "conv-lbs-kg-1",
    name: "Lbs to Kg Converter",
    description: 'Converts a weight value from pounds to kilograms with precision up to three decimal places and displays the inverse conversion (kg to lbs).',
    category: "Converter",
    slug: "lbs-to-kg",
    dependencies: "None",
  },
  {
    id: "conv-kg-lbs-1",
    name: "Kg to Lbs Converter",
    description: 'Converts a weight value from kilograms to pounds with three-decimal precision and auto-suggests common plate-loading combinations for barbell.',
    category: "Converter",
    slug: "kg-to-lbs",
    dependencies: "None",
  },
  {
    id: "conv-ft-m-1",
    name: "Feet to Meters Converter",
    description: 'Converts a length from feet to meters using the exact conversion factor 1 ft = 0.3048 m, displaying the result in both decimal and fractional meters.',
    category: "Converter",
    slug: "feet-to-meters",
    dependencies: "None",
  },
  {
    id: "arch-conv-1",
    name: "Archive Converter",
    description: "Convert ZIP files to TAR, RAR, or uncompressed archives directly in your browser.",
    category: "Converter",
    slug: "archive-converter",
    dependencies: "jszip",
  },
  {
    id: "pdf-flatten-1",
    name: "Flatten PDF",
    description: "Make interactive PDF forms, annotations, and layers permanent and uneditable.",
    category: "PDF",
    slug: "flatten-pdf",
    dependencies: "pdf-lib",
  },
  {
    id: "pdf-crop-1",
    name: "Crop PDF Pages",
    description: 'Removes or adjusts page margins on every page of an uploaded PDF by accepting numeric values (or presets like ‘remove 1 inch all sides’) for top.',
    category: "PDF",
    slug: "crop-pdf",
    dependencies: "pdf-lib",
  },
  {
    id: "pdf-org-1",
    name: "Organize PDF Pages",
    description: 'Lets users drag-and-drop PDF page thumbnails into a new order, rotate individual pages, and delete unwanted pages via checkboxes.',
    category: "PDF",
    slug: "organize-pdf",
    dependencies: "pdf-lib",
  },
  {
    id: "pdf-ext-1",
    name: "Extract PDF Pages",
    description: 'Accepts a PDF along with a page range or a comma-separated list of individual page numbers and extracts only those pages into a new PDF file.',
    category: "PDF",
    slug: "extract-pages-from-pdf",
    dependencies: "pdf-lib",
  },
  {
    id: "pdf-heic-1",
    name: "HEIC to PDF",
    description: 'Converts High-Efficiency Image Container (HEIC) photos from iPhones and iPads into standard PDF documents.',
    category: "PDF",
    slug: "heic-to-pdf",
    dependencies: "pdf-lib, heic2any",
  },
  {
    id: "1",
    name: "TikTok Video Downloader",
    slug: "tiktok-video-downloader",
    category: "Downloader",
    description: "Download TikTok without watermark",
    dependencies: "API / yt-dlp"
  },
  {
    id: "2",
    name: 'Privacy Cleaner',
    slug: 'privacy-cleaner',
    category: 'Utility',
    description: 'Scans and clears browser cookies, localStorage, sessionStorage, and cached data for the current site.',
    dependencies: 'Vanilla JS'
  },
  {
    id: "yt-dl-1",
    name: "YouTube Downloader",
    description: 'Downloads YouTube videos as MP4 files or extracts audio as MP3 by parsing the video page for available stream URLs.',
    category: "Downloader",
    slug: "youtube-downloader",
    dependencies: "yt-dlp"
  },
  {
    id: "4",
    name: "Instagram Video Downloader",
    slug: "instagram-video-downloader",
    category: "Downloader",
    description: "Download IG Reels and Videos",
    dependencies: "Instaloader / API"
  },
  {
    id: "6",
    name: "Facebook Video Downloader",
    slug: "facebook-video-downloader",
    category: "Downloader",
    description: 'Downloads public Facebook videos by parsing the page source to extract the highest-quality MP4 stream.',
    dependencies: "yt-dlp"
  },
  {
    id: "7",
    name: "AI Translator",
    slug: "ai-translator",
    category: "AI",
    description: 'Detects source language automatically and translates text between 100+ languages using advanced neural machine translation.',
    dependencies: "Google Cloud Translation API"
  },

  {
    id: "9",
    name: "PDF to Word",
    slug: "pdf-to-word",
    category: "PDF",
    description: 'Extracts text content and basic formatting from PDF files and assembles them into editable .docx Word documents.',
    dependencies: "pdf2docx / PDF.js"
  },
  {
    id: "10",
    name: "AI Image Generator",
    slug: "ai-image-generator",
    category: "AI",
    description: 'Transforms text prompts into high-resolution images using advanced diffusion models. Designers and marketers use it for rapid visual prototyping.',
    dependencies: "Stable Diffusion API"
  },
  {
    id: "11",
    name: "Speed Test",
    slug: "speed-test",
    category: "Utility",
    description: 'Measures your internet connection’s download speed, upload speed, and latency by transferring real test data to geographically distributed servers.',
    dependencies: "WebSockets / WebRTC"
  },
  {
    id: "12",
    name: "Twitter Video Downloader",
    slug: "twitter-video-downloader",
    category: "Downloader",
    description: 'Extracts native video files from tweets by resolving the embedded media URL from Twitter’s CDN.',
    dependencies: "yt-dlp"
  },
  {
    id: "14",
    name: "Compress Image to 50KB",
    slug: "compress-image-to-50kb",
    category: "Image",
    description: 'Reduces image file size to 50 KB or below by adjusting JPEG quality, reducing pixel dimensions, or stripping metadata.',
    dependencies: "browser-image-compression"
  },
  {
    id: "15",
    name: "Currency Converter",
    slug: "currency-converter",
    category: "Finance",
    description: 'Converts between 160+ world currencies using real-time exchange rates sourced from central banks and financial data providers.',
    dependencies: "ExchangeRate-API"
  },
  {
    id: "16",
    name: "Logo Maker",
    slug: "logo-maker",
    category: "Branding",
    description: 'Logo Maker provides a drag-and-drop canvas with shape libraries, text tools, and icon collections for building brand logos.',
    dependencies: "Fabric.js / Canvas API"
  },
  {
    id: "17",
    name: "MP4 to MP3",
    slug: "mp4-to-mp3",
    category: "Converter",
    description: 'Extracts the audio track from MP4 video files and saves it as a standalone MP3 file, preserving original bitrate and sample rate.',
    dependencies: "FFmpeg"
  },
  {
    id: "pdf-comp-1",
    name: "PDF Compressor",
    description: 'Reduces PDF file size by compressing embedded images and removing redundant metadata. Offers three compression tiers. Max 50MB.',
    category: "PDF",
    slug: "pdf-compressor",
    dependencies: "Ghostscript / PDF-lib"
  },
  {
    id: "19",
    name: "Word to PDF",
    slug: "word-to-pdf",
    category: "PDF",
    description: 'Converts .docx and .doc files to PDF while preserving fonts, tables, images, headers, and embedded formatting.',
    dependencies: "LibreOffice API / CloudConvert API"
  },

  {
    id: "21",
    name: "Percentage Calculator",
    slug: "percentage-calculator",
    category: "Finance",
    description: 'Computes percentage values, percentage increases and decreases, and what-percent-of-what relationships with precise decimal arithmetic.',
    dependencies: "Vanilla JS"
  },
  {
    id: "22",
    name: "JPG to PDF",
    slug: "jpg-to-pdf",
    category: "PDF",
    description: 'Merges one or more JPG images into a single multi-page PDF file in the order you arrange them.',
    dependencies: "jsPDF / Canvas API"
  },

  {
    id: "26",
    name: "Age Calculator",
    slug: "age-calculator",
    category: "Utility",
    description: 'Computes exact age in years, months, days, hours, minutes, and seconds from a given birth date relative to any target date.',
    dependencies: "Date-fns / Moment.js"
  },
  {
    id: "27",
    name: "HEIC to JPG",
    slug: "heic-to-jpg",
    category: "Image",
    description: 'Decodes Apple HEIC photos and converts them to universally compatible JPG files while preserving EXIF metadata like location and camera settings.',
    dependencies: "heic2any"
  },
  {
    id: "28",
    name: "PDF to JPG",
    slug: "pdf-to-jpg",
    category: "PDF",
    description: 'Renders each PDF page as a high-quality JPG image, preserving layout, fonts, and embedded graphics exactly as they appear.',
    dependencies: "PDF.js / Canvas API"
  },
  {
    id: "29",
    name: "PDF to PPT",
    slug: "pdf-to-ppt",
    category: "PDF",
    description: 'Converts PDF content—including text, images, and vector graphics—into editable PowerPoint slides with preserved layout structure.',
    dependencies: "pdf2json / PptxGenJS"
  },
  {
    id: "30",
    name: "Fancy Text Generator",
    slug: "fancy-text-generator",
    category: "Text",
    description: 'Creates stylized Unicode text in 40+ decorative styles including double-struck, bubble, cursive, gothic, and small caps.',
    dependencies: "Unicode mapping"
  },
  {
    id: "31",
    name: "Stopwatch",
    slug: "stopwatch",
    category: "Productivity",
    description: 'Stopwatch offers precision timing with lap recording, split tracking, and a clean full-screen display mode.',
    dependencies: "Vanilla JS"
  },
  {
    id: "32",
    name: "Reddit Video Downloader",
    slug: "reddit-video-downloader",
    category: "Downloader",
    description: 'Fetches Reddit-hosted videos and their associated audio tracks from the v.redd.it CDN, then merges them client-side.',
    dependencies: "yt-dlp"
  },
  {
    id: "33",
    name: "Background Remover",
    slug: "background-remover",
    category: "Image",
    description: 'Segments the foreground subject from an image using a neural network, producing a transparent PNG. Max 20MB.',
    dependencies: "rembg / OpenCV / TensorFlow.js"
  },
  {
    id: "34",
    name: "WebP to JPG",
    slug: "webp-to-jpg",
    category: "Image",
    description: 'Converts WebP images into standard JPG format, making them usable in applications and websites that do not support Google’s modern format.',
    dependencies: "Canvas API"
  },
  {
    id: "35",
    name: "Wheel of Names",
    slug: "wheel-of-names",
    category: "Utility",
    description: 'Displays an animated spinning wheel that randomly selects one entry from a customizable list of names or options.',
    dependencies: "Canvas API / GSAP"
  },
  {
    id: "36",
    name: "Image Compressor",
    slug: "image-compressor",
    category: "Image",
    description: 'Reduces JPG, PNG, WebP file sizes using smart compression. Side-by-side quality preview. Max 20MB per image.',
    dependencies: "HTML5 Canvas / libjpeg-turbo"
  },
  {
    id: "37",
    name: "Object Remover",
    slug: "object-remover",
    category: "Image",
    description: 'Lets you brush over an unwanted object, blemish, or watermark in a photo, then fills the area with contextually plausible pixels.',
    dependencies: "Lama Cleaner"
  },
  {
    id: "38",
    name: "PPT to PDF",
    slug: "ppt-to-pdf",
    category: "PDF",
    description: 'Renders each PowerPoint slide as a page in a single PDF, maintaining embedded fonts, vector graphics, and slide transitions as static layout.',
    dependencies: "LibreOffice API"
  },
  {
    id: "39",
    name: "Temporary Email Generator",
    slug: "temporary-email-generator",
    category: "Privacy",
    description: 'Creates disposable email inboxes that self-destruct after a user-configurable time limit (5 minutes to 48 hours).',
    dependencies: "Mailinator API / Custom Backend"
  },
  {
    id: "40",
    name: "Screen Recorder Extension",
    slug: "screen-recorder-extension",
    category: "Extension",
    description: 'Generates a browser extension that captures browser tabs, full screens, or specific application windows with configurable resolution, frame rate.',
    dependencies: "MediaRecorder API"
  },
  {
    id: "41",
    name: "PDF Merger",
    slug: "pdf-merger",
    category: "PDF",
    description: 'Combines two or more PDF files into one contiguous document with a drag-and-drop reorder interface for the input list. Legal assistants compiling.',
    dependencies: "pdf-lib"
  },
  {
    id: "42",
    name: "QR Code Generator",
    slug: "qr-code-generator",
    category: "Utility",
    description: 'Renders a QR code from any text, URL, vCard, Wi-Fi config, or plain string using a client-side Reed-Solomon encoder.',
    dependencies: "qrcode.js"
  },

  {
    id: "44",
    name: "Excel to PDF",
    slug: "excel-to-pdf",
    category: "PDF",
    description: 'Converts Excel spreadsheets into properly paginated PDF files, respecting print areas, page orientation, and cell formatting.',
    dependencies: "SheetJS / jsPDF"
  },
  {
    id: "45",
    name: "EMI Calculator",
    slug: "emi-calculator",
    category: "Finance",
    description: 'Splits a loan principal into equal monthly installments using the standard reducing-balance formula with configurable annual interest and tenure.',
    dependencies: "Vanilla JS"
  },
  {
    id: "46",
    name: "Character Counter",
    slug: "character-counter",
    category: "Text",
    description: 'Counts characters (with and without spaces), words, sentences, paragraphs, and estimated reading time in real time as you type.',
    dependencies: "Vanilla JS"
  },
  {
    id: "47",
    name: "Video to Text Transcription",
    slug: "video-to-text-transcription",
    category: "Transcription",
    description: 'Video to Text Transcription extracts speech from uploaded video files using on-device speech recognition.',
    dependencies: "Whisper API"
  },
  {
    id: "48",
    name: "Word Counter",
    slug: "word-counter",
    category: "Text",
    description: 'Provides a live dashboard of word count, sentence count, syllable count, readability scores (Flesch-Kincaid), and speaking time.',
    dependencies: "Vanilla JS"
  },
  {
    id: "49",
    name: "Crop Image",
    slug: "crop-image",
    category: "Image",
    description: 'Lets you drag a selection rectangle to crop an image to any pixel dimension, common social-media ratio (1:1, 16:9, 4:5), or exact preset like.',
    dependencies: "Cropper.js"
  },
  {
    id: "50",
    name: "Social Media Post Maker",
    slug: "social-media-post-maker",
    category: "Branding",
    description: 'Social Media Post Maker offers platform-specific canvas templates and a library of stock graphics for creating social visuals.',
    dependencies: "Fabric.js"
  },
  {
    id: "51",
    name: "MKV to MP4",
    slug: "mkv-to-mp4",
    category: "Converter",
    description: 'Re-encapsulates MKV video files into the more universally compatible MP4 container without re-encoding the underlying video stream.',
    dependencies: "FFmpeg"
  },
  {
    id: "52",
    name: "Text to Speech (TTS)",
    slug: "text-to-speech-tts",
    category: "Audio",
    description: "AI voice generator with Indian accents",
    dependencies: "Google Cloud TTS / ElevenLabs"
  },
  {
    id: "53",
    name: "AI Paraphrasing Tool",
    slug: "ai-paraphrasing-tool",
    category: "AI",
    description: 'Rewrites sentences and paragraphs while preserving the original meaning and intent. Academics and content creators use it to avoid plagiarism.',
    dependencies: "HuggingFace"
  },
  {
    id: "54",
    name: "Random Number Generator",
    slug: "random-number-generator",
    category: "Utility",
    description: 'Generates cryptographically secure random integers or decimals within a user-defined min-max range with optional repetition filtering.',
    dependencies: "Math.random()"
  },
  {
    id: "55",
    name: "URL Shortener",
    slug: "url-shortener",
    category: "Utility",
    description: 'Takes any long URL and generates a compact, shareable short link with optional custom alias support.',
    dependencies: "Node.js / Redis"
  },

  {
    id: "58",
    name: "PDF to Excel",
    slug: "pdf-to-excel",
    category: "PDF",
    description: 'Extracts tabular data from PDF files and reconstructs it into editable Excel spreadsheets with proper column alignment.',
    dependencies: "pdf2json / SheetJS"
  },
  {
    id: "59",
    name: "Unlock PDF",
    slug: "unlock-pdf",
    category: "PDF",
    description: 'Removes owner-level password restrictions from PDFs so you can edit, print, or copy content from protected documents.',
    dependencies: "qpdf"
  },
  {
    id: "60",
    name: "Image Enhancer",
    slug: "image-enhancer",
    category: "Image",
    description: 'Applies an AI super-resolution model to upscale images by 2x or 4x. Portrait photographers use it to rescue low-resolution files.',
    dependencies: "Real-ESRGAN"
  },
  {
    id: "61",
    name: "SIP Calculator",
    slug: "sip-calculator",
    category: "Finance",
    description: 'Projects the future value of recurring mutual-fund investments using compounded monthly returns based on historical or assumed growth rates.',
    dependencies: "Vanilla JS"
  },
  {
    id: "62",
    name: "BMI Calculator",
    slug: "bmi-calculator",
    category: "Health",
    description: 'Computes Body Mass Index from metric or imperial height and weight inputs, categorizing the result into underweight, normal, overweight.',
    dependencies: "Vanilla JS"
  },
  {
    id: "63",
    name: "Pinterest Image Downloader",
    slug: "pinterest-image-downloader",
    category: "Downloader",
    description: 'Scrapes the highest-resolution version of an image from a Pinterest pin page by inspecting the Open Graph and JSON-LD metadata.',
    dependencies: "Vanilla JS"
  },
  {
    id: "64",
    name: "Audio to Text Transcription",
    slug: "audio-to-text-transcription",
    category: "Transcription",
    description: 'Audio to Text Transcription converts spoken audio from uploaded files into editable text using browser-based speech APIs.',
    dependencies: "Whisper API"
  },
  {
    id: "66",
    name: "Meme Generator",
    slug: "meme-generator",
    category: "Image",
    description: 'Adds top-and-bottom text to any uploaded image with meme-style Impact font, customizable font size, stroke width, and white border.',
    dependencies: "Canvas API"
  },
  {
    id: "67",
    name: "MOV to MP4",
    slug: "mov-to-mp4",
    category: "Converter",
    description: 'Transcodes QuickTime MOV files into MP4 format while optimizing for web playback and social media uploads.',
    dependencies: "FFmpeg"
  },
  {
    id: "68",
    name: "Resume Builder",
    slug: "resume-builder",
    category: "Utility",
    description: 'Provides a structured, form-based interface for entering work history, education, and skills, then renders a professionally formatted PDF resume.',
    dependencies: "React / html2pdf.js"
  },
  {
    id: "69",
    name: "AI Image Upscaler",
    slug: "ai-image-upscaler",
    category: "AI",
    description: 'Increases image resolution by up to 4x while reconstructing fine details that standard interpolation loses.',
    dependencies: "Real-ESRGAN"
  },
  {
    id: "70",
    name: "GST Calculator",
    slug: "gst-calculator",
    category: "Finance",
    description: 'Computes GST-inclusive and GST-exclusive amounts for Indian tax slabs (5%, 12%, 18%, 28%) with automatic HSN/SAC code hints.',
    dependencies: "Vanilla JS"
  },
  {
    id: "71",
    name: "Image Resizer",
    slug: "image-resizer",
    category: "Image",
    description: 'Scales images to exact pixel dimensions or percentage-based sizes with intelligent resampling algorithms that preserve sharpness.',
    dependencies: "Canvas API / Sharp"
  },
  {
    id: "72",
    name: "Password Generator",
    slug: "password-generator",
    category: "Utility",
    description: 'Generates cryptographically strong random passwords with fully customizable length, character sets, and pattern rules.',
    dependencies: "Crypto API"
  },
  {
    id: "73",
    name: "Diff Checker",
    slug: "diff-checker",
    category: "Developer",
    description: 'Compares two input texts side-by-side, highlighting inserted, deleted, and changed lines with distinct background colors.',
    dependencies: "diff-match-patch"
  },
  {
    id: "74",
    name: "WEBM to MP4",
    slug: "webm-to-mp4",
    category: "Converter",
    description: 'Converts WebM video files to MP4 format, which is critical for users whose editing software or sharing platforms reject WebM.',
    dependencies: "FFmpeg"
  },
  {
    id: "76",
    name: "IP Address Lookup",
    slug: "ip-address-lookup",
    category: "Utility",
    description: 'Displays your public IPv4 and IPv6 addresses with geolocation data (city, ISP, ASN, timezone). Network engineers use it to verify VPN connectivity.',
    dependencies: "MaxMind / IP-API"
  },


  {
    id: "79",
    name: "Photo Retoucher",
    slug: "photo-retoucher",
    category: "Image",
    description: 'Applies an AI-powered inpainting model to remove blemishes, scratches, dust spots, and skin imperfections from portrait and product photos.',
    dependencies: "OpenCV"
  },
  {
    id: "80",
    name: "PDF Splitter",
    slug: "pdf-splitter",
    category: "PDF",
    description: 'Divides a single PDF into multiple files by page range, bookmark level, or a specified page count per split.',
    dependencies: "pdf-lib"
  },
  {
    id: "84",
    name: "Font Generator",
    slug: "font-generator",
    category: "Text",
    description: 'Converts plain ASCII text into dozens of Unicode-stylized variants including bold, script, fraktur, monospace, and decorative letter forms.',
    dependencies: "Vanilla JS"
  },
  {
    id: "85",
    name: "Salary Calculator",
    slug: "salary-calculator",
    category: "HR",
    description: "Calculate net salary after taxes",
    dependencies: "Vanilla JS"
  },
  {
    id: "86",
    name: "Audio Cutter",
    slug: "audio-cutter",
    category: "Audio",
    description: "Trim and cut audio files online",
    dependencies: "Web Audio API / FFmpeg"
  },
  {
    id: "87",
    name: "Pomodoro Timer",
    slug: "pomodoro-timer",
    category: "Productivity",
    description: 'Pomodoro Timer manages work and break intervals with fully customizable session lengths and auto-start options.',
    dependencies: "Web Audio API / Vanilla JS"
  },

  {
    id: "90",
    name: "YouTube Transcript Generator",
    slug: "youtube-transcript-generator",
    category: "Transcription",
    description: 'YouTube Transcript Generator fetches captions from public YouTube videos via the video ID or URL.',
    dependencies: "YouTube Data API"
  },

  {
    id: "92",
    name: "EPUB to PDF",
    slug: "epub-to-pdf",
    category: "PDF",
    description: 'Converts EPUB ebooks to PDF with full control over page size, margins, font, and line spacing.',
    dependencies: "Calibre API"
  },


  {
    id: "96",
    name: "Protect PDF",
    slug: "protect-pdf",
    category: "PDF",
    description: 'Encrypts a PDF with a user-chosen password using AES-128, restricting opening, printing, and copying as specified by the owner.',
    dependencies: "pdf-lib"
  },
  {
    id: "97",
    name: "Invoice Generator",
    slug: "invoice-generator",
    category: "Finance",
    description: 'Produces downloadable PDF or HTML invoices with customizable line items, tax rates, discounts, and business logo placement.',
    dependencies: "PDF-lib / Vue.js"
  },
  {
    id: "98",
    name: "Business Card Maker",
    slug: "business-card-maker",
    category: "Branding",
    description: 'Business Card Maker provides a WYSIWYG editor with snap-to-grid alignment and preset card dimensions.',
    dependencies: "React / Canvas API"
  },
  {
    id: "99",
    name: "Regex Tester",
    slug: "regex-tester",
    category: "Developer",
    description: 'Provides an interactive environment where users can write a regular expression pattern, test it against sample strings, and view real-time match.',
    dependencies: "regex.js"
  },

  {
    id: "101",
    name: "Dice Roller",
    slug: "dice-roller",
    category: "Utility",
    description: 'Simulates rolling any number of dice with arbitrary side counts—d4, d6, d8, d10, d12, d20, d100, or custom values.',
    dependencies: "Three.js"
  },
  {
    id: "102",
    name: "Profit Margin Calculator",
    slug: "profit-margin-calculator",
    category: "Finance",
    description: 'Computes gross profit, net profit, and margin percentages from revenue and cost inputs. Small-business owners use it to price products.',
    dependencies: "Vanilla JS"
  },
  {
    id: "104",
    name: "Speech to Text",
    slug: "speech-to-text",
    category: "Audio",
    description: "Transcribe audio to text in multiple languages",
    dependencies: "Whisper API / Web Speech API"
  },
  {
    id: "105",
    name: "Vimeo Video Downloader",
    slug: "vimeo-video-downloader",
    category: "Downloader",
    description: 'Resolves Vimeo’s progressive-download and HLS streaming URLs from the video config object to offer direct MP4 downloads.',
    dependencies: "yt-dlp"
  },
  {
    id: "106",
    name: "PDF to EPUB",
    slug: "pdf-to-epub",
    category: "PDF",
    description: 'Converts static PDF documents into reflowable EPUB ebook format with adjustable font size, orientation, and screen adaptation.',
    dependencies: "Calibre API"
  },
  {
    id: "107",
    name: "Coin Flipper",
    slug: "coin-flipper",
    category: "Utility",
    description: 'Simulates a fair coin flip using a cryptographic random number generator, displaying heads or tails with a realistic animation.',
    dependencies: "CSS3 Animations"
  },
  {
    id: "108",
    name: "Image Colorizer",
    slug: "image-colorizer",
    category: "Image",
    description: 'Uses a deep-learning model trained on millions of historical photos to predict plausible per-pixel color for grayscale and sepia images.',
    dependencies: "DeOldify"
  },
  {
    id: "109",
    name: "EXIF Data Remover",
    slug: "exif-data-remover",
    category: "Privacy",
    description: 'Strips GPS coordinates, camera metadata, timestamps, and software fingerprints from JPEG and PNG images.',
    dependencies: "exifr / Piexifjs"
  },
  {
    id: "110",
    name: "AVI to MP4",
    slug: "avi-to-mp4",
    category: "Converter",
    description: 'Converts legacy AVI video containers into modern MP4 files with H.264 encoding for drastically smaller file sizes.',
    dependencies: "FFmpeg"
  },
  {
    id: "111",
    name: "Video Compressor",
    slug: "video-compressor",
    category: "Video",
    description: "Reduce video file size without losing quality. Max 500MB per file.",
    dependencies: "FFmpeg / WebCodecs API"
  },
  {
    id: "112",
    name: "AI Face Swap",
    slug: "ai-face-swap",
    category: "AI",
    description: 'Seamlessly replaces one face with another in photos while matching skin tone, lighting, and head angle.',
    dependencies: "InsightFace"
  },
  {
    id: "113",
    name: "JSON Formatter",
    slug: "json-formatter",
    category: "Developer",
    description: 'Pretty-prints raw JSON with configurable indent width, key sorting, and bracket collapsing options while flagging syntax errors with exact.',
    dependencies: "JSONLint"
  },
  {
    id: "114",
    name: "XML Sitemap Generator",
    slug: "xml-sitemap-generator",
    category: "SEO",
    description: 'Accepts a list of URLs with optional priority, change frequency, and last-modified dates, then emits a standards-compliant XML sitemap with proper.',
    dependencies: "Node.js / Cheerio"
  },
  {
    id: "115",
    name: "Meeting Minutes Generator",
    slug: "meeting-minutes-generator",
    category: "Transcription",
    description: 'Meeting Minutes Generator structures raw notes into sections like attendees, decisions, action items, and follow-ups.',
    dependencies: "OpenAI API"
  },
  {
    id: "116",
    name: "AI Cover Letter Generator",
    slug: "ai-cover-letter-generator",
    category: "AI",
    description: 'Analyzes a job description and your résumé to produce a tailored cover letter that highlights relevant experience and matches the employer’s.',
    dependencies: "OpenAI API"
  },



  {
    id: "121",
    name: "JSON to CSV",
    slug: "json-to-csv",
    category: "Converter",
    description: 'Parses structured JSON data—including nested objects and arrays—and flattens it into a clean CSV spreadsheet with proper column headers.',
    dependencies: "PapaParse"
  },
  {
    id: "122",
    name: "Watermark PDF",
    slug: "watermark-pdf",
    category: "PDF",
    description: 'Overlays text or image watermarks onto every page of a PDF with customizable position, rotation, opacity, and tiling.',
    dependencies: "pdf-lib"
  },
  {
    id: "123",
    name: "PDF Page Delete",
    slug: "pdf-page-delete",
    category: "PDF",
    description: 'Removes selected page ranges from a PDF while renumbering the remaining pages and updating any internal page references.',
    dependencies: "pdf-lib"
  },
  {
    id: "124",
    name: "PNG to SVG",
    slug: "png-to-svg",
    category: "Image",
    description: 'Traces bitmap PNG shapes into clean SVG paths using Potrace in WebAssembly, with controls for curve tolerance, corner threshold.',
    dependencies: "Potrace"
  },
  {
    id: "125",
    name: "Email Signature Generator",
    slug: "email-signature-generator",
    category: "Branding",
    description: 'Email Signature Generator builds HTML email signatures through a form-based UI with social link fields and icon toggles.',
    dependencies: "React"
  },

  {
    id: "128",
    name: "Margin Calculator",
    slug: "margin-calculator",
    category: "Finance",
    description: 'Calculates gross margin percentage, markup percentage, cost, and selling price from any two known variables using standard retail formulas.',
    dependencies: "Vanilla JS"
  },
  {
    id: "129",
    name: "Morse Code Translator",
    slug: "morse-code-translator",
    category: "Utility",
    description: 'Converts alphanumeric text into International Morse code with audible beeps played through the Web Audio API, and decodes incoming Morse signals.',
    dependencies: "Vanilla JS"
  },
  {
    id: "130",
    name: "Cursive Text Generator",
    slug: "cursive-text-generator",
    category: "Text",
    description: 'Converts plain text into flowing cursive and script-style Unicode characters that resemble handwritten calligraphy.',
    dependencies: "Vanilla JS"
  },
  {
    id: "131",
    name: "ROI Calculator",
    slug: "roi-calculator",
    category: "Finance",
    description: 'Measures return on investment by comparing net gain or loss against the original cost, expressed as both a percentage and a dollar amount.',
    dependencies: "Vanilla JS"
  },
  {
    id: "132",
    name: "VAT Calculator",
    slug: "vat-calculator",
    category: "Finance",
    description: 'Computes VAT-inclusive and VAT-exclusive amounts for EU member-state rates (standard and reduced) with country-specific rules for digital services.',
    dependencies: "Vanilla JS"
  },
  {
    id: "134",
    name: "Password Strength Checker",
    slug: "password-strength-checker",
    category: "Privacy",
    description: 'Evaluates passwords against 10+ criteria: length, character diversity, dictionary words, pattern repetition, known-breach database lookup.',
    dependencies: "zxcvbn"
  },
  {
    id: "135",
    name: "JS Minifier",
    slug: "js-minifier",
    category: "Developer",
    description: 'Strips comments, whitespace, and shortens local variable names in JavaScript source without altering execution semantics.',
    dependencies: "Terser"
  },
  {
    id: "136",
    name: "Base64 Encode/Decode",
    slug: "base64-encode-decode",
    category: "Developer",
    description: 'Encodes text or small files into Base64 strings and decodes them back with automatic MIME-type detection for binary safety.',
    dependencies: "btoa/atob"
  },
  {
    id: "137",
    name: "Text to Handwriting",
    slug: "text-to-handwriting",
    category: "Text",
    description: 'Renders typed text as realistic handwritten output using configurable fonts, ink colors, paper backgrounds, and even simulated pressure variations.',
    dependencies: "Canvas API"
  },
  {
    id: "138",
    name: "Receipt Generator",
    slug: "receipt-generator",
    category: "Finance",
    description: 'Creates printer-friendly receipt pages with itemized purchases, payment method, date, and merchant details in a compact single-page layout.',
    dependencies: "Canvas API / jsPDF"
  },
  {
    id: "139",
    name: "AI Thumbnail Maker",
    slug: "ai-thumbnail-maker",
    category: "AI",
    description: 'Designs click-optimized YouTube thumbnails by compositing text, images, and effects on a smart canvas.',
    dependencies: "Canvas API / OpenAI API"
  },
  {
    id: "140",
    name: "Secure Note Sharer",
    slug: "secure-note-sharer",
    category: "Privacy",
    description: 'Encrypts a text note with a passphrase and generates a one-time view link that self-destructs after the recipient reads it.',
    dependencies: "Crypto API / Redis"
  },
  {
    id: "141",
    name: "Video to GIF",
    slug: "video-to-gif",
    category: "Video",
    description: "Convert MP4/WebM to GIF animations. Max 500MB input.",
    dependencies: "FFmpeg / gif.js"
  },
  {
    id: "142",
    name: "Image to Base64",
    slug: "image-to-base64",
    category: "Developer",
    description: 'Converts uploaded images (PNG, JPG, GIF, SVG, WebP) into Base64-encoded data URI strings ready for embedding in HTML, CSS, or JSON.',
    dependencies: "FileReader API"
  },
  {
    id: "143",
    name: "Subtitle Translator",
    slug: "subtitle-translator",
    category: "Video",
    description: 'Accepts SRT or VTT subtitle files and translates their text content into any of 100+ target languages while preserving exact timing codes and frame.',
    dependencies: "Google Translate API"
  },
  {
    id: "144",
    name: "IBAN Validator",
    slug: "iban-validator",
    category: "Finance",
    description: 'Validates the structure, length, and check digits of IBANs from 70+ countries using the official ISO 13616 modulus-97 algorithm.',
    dependencies: "ibantools"
  },






  {
    id: "151",
    name: "CSV to JSON",
    slug: "csv-to-json",
    category: "Converter",
    description: 'Reads CSV files and converts each row into a structured JSON object, correctly inferring data types and handling quoted fields.',
    dependencies: "PapaParse"
  },
  {
    id: "152",
    name: "Rotate PDF",
    slug: "rotate-pdf",
    category: "PDF",
    description: 'Rotates individual pages or all pages of a PDF by 90, 180, or 270 degrees without re-encoding the page content.',
    dependencies: "pdf-lib"
  },
  {
    id: "153",
    name: "Extract Images from PDF",
    slug: "extract-images-from-pdf",
    category: "PDF",
    description: 'Extracts every embedded raster image from a PDF as separate JPEG or PNG files, preserving original resolution and color space.',
    dependencies: "pdf.js"
  },
  {
    id: "154",
    name: "SQL Formatter",
    slug: "sql-formatter",
    category: "Developer",
    description: 'Reindents and rewrites SQL queries with configurable dialect support (MySQL, PostgreSQL, SQL Server, BigQuery) and keyword-case preference.',
    dependencies: "sql-formatter"
  },
  {
    id: "155",
    name: "UUID Generator",
    slug: "uuid-generator",
    category: "Developer",
    description: 'Generates UUID v4 random identifiers in standard 36-character string format with an optional compact hex mode (no dashes).',
    dependencies: "uuid"
  },
  {
    id: "156",
    name: "HEX to RGB Converter",
    slug: "hex-to-rgb-converter",
    category: "Design",
    description: 'Hex to RGB Converter parses hex color codes and outputs the corresponding RGB and RGBA values.',
    dependencies: "Vanilla JS"
  },
  {
    id: "157",
    name: "BMR Calculator",
    slug: "bmr-calculator",
    category: "Health",
    description: 'Calculates Basal Metabolic Rate using the Mifflin-St Jeor equation with age, sex, height, and weight. Nutritionists use it for diet planning.',
    dependencies: "Vanilla JS"
  },
  {
    id: "158",
    name: "Meta Tag Generator",
    slug: "meta-tag-generator",
    category: "SEO",
    description: 'Builds a complete block of HTML meta tags including title, description, Open Graph, Twitter Cards, and canonical URL from an interactive form.',
    dependencies: "Vanilla JS"
  },
  {
    id: "159",
    name: "Text to Binary",
    slug: "text-to-binary",
    category: "Developer",
    description: 'Encodes any Unicode string into its binary (base-2) representation, byte by byte, with visible byte-boundary separators.',
    dependencies: "Vanilla JS"
  },
  {
    id: "160",
    name: "Binary to Text",
    slug: "binary-to-text",
    category: "Developer",
    description: 'Decodes space- or comma-separated binary strings back into human-readable Unicode text, rejecting malformed groups with an exact-position error.',
    dependencies: "Vanilla JS"
  },
  {
    id: "161",
    name: "Break-Even Calculator",
    slug: "break-even-calculator",
    category: "Finance",
    description: 'Determines the exact unit volume or revenue required to cover fixed and variable costs, with a built-in sensitivity slider for price changes.',
    dependencies: "Vanilla JS"
  },
  {
    id: "162",
    name: "Conversion Rate Calculator",
    slug: "conversion-rate-calculator",
    category: "Marketing",
    description: 'Conversion Rate Calculator divides conversions by total visitors and displays the rate as a percentage with configurable decimal precision.',
    dependencies: "Vanilla JS"
  },
  {
    id: "163",
    name: "CPM Calculator",
    slug: "cpm-calculator",
    category: "Marketing",
    description: 'CPM Calculator computes cost per mille by dividing total ad spend by impressions and multiplying by 1000.',
    dependencies: "Vanilla JS"
  },
  {
    id: "164",
    name: "ROAS Calculator",
    slug: "roas-calculator",
    category: "Marketing",
    description: 'ROAS Calculator divides ad revenue by ad spend to return a return-on-ad-spend ratio. Performance marketers and ecommerce managers use it to evaluate.',
    dependencies: "Vanilla JS"
  },
  {
    id: "165",
    name: "Podcast Transcription",
    slug: "podcast-transcription",
    category: "Transcription",
    description: 'Podcast Transcription processes long-form audio files through browser-based speech recognition optimized for extended durations.',
    dependencies: "Whisper API"
  },
  {
    id: "166",
    name: "CSS Minifier",
    slug: "css-minifier",
    category: "Developer",
    description: 'Removes unnecessary whitespace, comments, and trailing semicolons from CSS, while merging identical selector blocks where safe to do so.',
    dependencies: "clean-css"
  },
  {
    id: "167",
    name: "Markdown to HTML",
    slug: "markdown-to-html",
    category: "Converter",
    description: 'Renders GitHub-Flavored Markdown into semantic, accessible HTML with proper heading hierarchy, code syntax highlighting, and table markup.',
    dependencies: "marked.js"
  },
  {
    id: "168",
    name: "Compare PDF Files",
    slug: "compare-pdf-files",
    category: "PDF",
    description: 'Performs pixel-level and text-level comparison of two PDF files, highlighting every difference with color-coded overlay annotations.',
    dependencies: "pdf.js"
  },
  {
    id: "169",
    name: "Favicon Generator",
    slug: "favicon-generator",
    category: "Design",
    description: 'Favicon Generator converts text initials, uploaded images, or emoji into .ico and PNG favicon files.',
    dependencies: "Sharp / jimp"
  },
  {
    id: "170",
    name: "Case Converter",
    slug: "case-converter",
    category: "Text",
    description: 'Transforms text between uppercase, lowercase, title case, sentence case, camelCase, PascalCase, snake_case, and kebab-case with a single click.',
    dependencies: "Vanilla JS"
  },
  {
    id: "171",
    name: "Keyword Density Checker",
    slug: "keyword-density-checker",
    category: "SEO",
    description: 'Parses pasted or uploaded text to count total words, unique terms, and per-keyword frequency as a percentage, sorted by density descending.',
    dependencies: "Vanilla JS"
  },
  {
    id: "172",
    name: "Base64 to Image",
    slug: "base64-to-image",
    category: "Developer",
    description: 'Decodes a Base64 data string back into its original image format and displays a preview directly in the browser with a download button.',
    dependencies: "Vanilla JS"
  },
  {
    id: "174",
    name: "MD5 Hash Generator",
    slug: "md5-hash-generator",
    category: "Developer",
    description: 'Computes the 128-bit MD5 hash of any input text or uploaded file, returned as a 32-character hexadecimal string with optional uppercase.',
    dependencies: "CryptoJS"
  },
  {
    id: "175",
    name: "HTML Minifier",
    slug: "html-minifier",
    category: "Developer",
    description: 'Removes unnecessary whitespace, comments, and optional closing tags from HTML code to reduce file size without altering rendered output.',
    dependencies: "html-minifier"
  },
  {
    id: "176",
    name: "Barcode Generator",
    slug: "barcode-generator",
    category: "Utility",
    description: 'Generates scannable barcodes in major symbologies including EAN-13, Code 128, QR Code, and UPC-A from typed input or pasted data.',
    dependencies: "JsBarcode"
  },




  {
    id: "181",
    name: "PGP Key Generator",
    slug: "pgp-key-generator",
    category: "Privacy",
    description: 'Generates RSA (2048/4096) or ECDSA (Curve25519) PGP key pairs with customizable user IDs, expiration dates, and passphrase protection.',
    dependencies: "OpenPGP.js"
  },
  {
    id: "182",
    name: "Add Page Numbers to PDF",
    slug: "add-page-numbers-to-pdf",
    category: "PDF",
    description: 'Inserts page number labels at user-chosen positions (bottom-center, top-right, etc.) with configurable font, size, and starting offset.',
    dependencies: "pdf-lib"
  },
  {
    id: "183",
    name: "HTML to Markdown",
    slug: "html-to-markdown",
    category: "Converter",
    description: 'Parses arbitrary HTML and converts it into clean, readable Markdown while intelligently stripping inline styles and scripts.',
    dependencies: "Turndown"
  },
  {
    id: "184",
    name: "Reverse Text Generator",
    slug: "reverse-text-generator",
    category: "Text",
    description: 'Applies multiple text-transformation effects: reverse order, reverse each word, flip upside down, mirror horizontally, and rotate 180 degrees.',
    dependencies: "Vanilla JS"
  },
  {
    id: "185",
    name: "Zalgo Text Generator",
    slug: "zalgo-text-generator",
    category: "Text",
    description: 'Adds combining diacritical marks above, below, and through each character to create intentionally corrupted ‘zalgo’ glitch text.',
    dependencies: "Vanilla JS"
  },
  {
    id: "186",
    name: "Invisible Text Generator",
    slug: "invisible-text-generator",
    category: "Text",
    description: 'Generates blank Unicode characters—zero-width spaces, hair spaces, and invisible separators—that appear as empty text.',
    dependencies: "Vanilla JS"
  },
  {
    id: "187",
    name: "LTV Calculator",
    slug: "ltv-calculator",
    category: "Finance",
    description: 'Projects customer lifetime value using average order value, purchase frequency, gross margin, and estimated customer lifespan in months.',
    dependencies: "Vanilla JS"
  },
  {
    id: "188",
    name: "CAC Calculator",
    slug: "cac-calculator",
    category: "Finance",
    description: 'Divides total sales-and-marketing spend by the number of new customers acquired in the same period to produce a blended acquisition cost. Startup.',
    dependencies: "Vanilla JS"
  },
  {
    id: "189",
    name: "Burn Rate Calculator",
    slug: "burn-rate-calculator",
    category: "Finance",
    description: 'Calculates gross burn, net burn, and runway (in months) from monthly revenue, operating expenses, and current cash balance.',
    dependencies: "Vanilla JS"
  },
  {
    id: "190",
    name: "Net Promoter Score Calculator",
    slug: "net-promoter-score-calculator",
    category: "Marketing",
    description: 'Categorizes survey responses into promoters, passives, and detractors. Customer experience teams use it to track loyalty metrics.',
    dependencies: "Vanilla JS"
  },
  {
    id: "191",
    name: "XML to CSV",
    slug: "xml-to-csv",
    category: "Converter",
    description: 'Parses XML documents of any depth and transforms elements and attributes into a tabular CSV structure with automatically generated column paths.',
    dependencies: "xml2js / PapaParse"
  },
  {
    id: "192",
    name: "PDF Metadata Editor",
    slug: "pdf-metadata-editor",
    category: "PDF",
    description: 'Displays and allows editing of standard PDF metadata fields: title, author, subject, keywords, and producer.',
    dependencies: "pdf-lib"
  },
  {
    id: "193",
    name: "SVG Editor",
    slug: "svg-editor",
    category: "Design",
    description: 'SVG Editor provides a visual canvas for manipulating SVG elements with node selection, transform handles, and attribute editing.',
    dependencies: "SVGO / Fabric.js"
  },
  {
    id: "194",
    name: "Robots.txt Generator",
    slug: "robots-txt-generator",
    category: "SEO",
    description: 'Produces a robots.txt file from a point-and-click form where you set allowed and disallowed paths, crawl delays, and sitemap references.',
    dependencies: "Vanilla JS"
  },
  {
    id: "195",
    name: "SaaS Pricing Calculator",
    slug: "saas-pricing-calculator",
    category: "Finance",
    description: 'Models subscription revenue across tiers (free, monthly, annual) with inputs for conversion rate, churn, customer count, and average revenue.',
    dependencies: "Vanilla JS"
  },
  {
    id: "196",
    name: "Employee Turnover Calculator",
    slug: "employee-turnover-calculator",
    category: "HR",
    description: "Calculate employee turnover rate",
    dependencies: "Vanilla JS"
  },
  {
    id: "197",
    name: "MAC Address Generator",
    slug: "mac-address-generator",
    category: "Privacy",
    description: 'Generates random MAC addresses in six common formats (Unix, Windows, Cisco, colon-separated, hyphen-separated, and dot-separated) with optional OUI.',
    dependencies: "Vanilla JS"
  },
  {
    id: "198",
    name: "IP Anonymizer",
    slug: "ip-anonymizer",
    category: "Privacy",
    description: "Anonymize IP addresses in logs",
    dependencies: "Vanilla JS"
  },
  {
    id: "199",
    name: "XML to JSON",
    slug: "xml-to-json",
    category: "Developer",
    description: 'Transforms well-formed XML documents into equivalent JSON structures, mapping attributes to prefixed keys and text content to a configurable key.',
    dependencies: "xml2js"
  },
  {
    id: "200",
    name: "Braille Translator",
    slug: "braille-translator",
    category: "Text",
    description: 'Bidirectional converter between standard English text and Grade 1 (uncontracted) or Grade 2 (contracted) Braille.',
    dependencies: "Vanilla JS"
  }  ,{
    id: "201",
    name: "Passport Photo Maker (India)",
    slug: "passport-photo-india",
    category: "indian-utilities",
    description: "3.5x4.5 cm cropper for Indian passport photos",
    dependencies: "Canvas API / react-cropper"
  },
  {
    id: "202",
    name: "Aadhaar Wallet Cropper",
    slug: "aadhaar-wallet-cropper",
    category: "indian-utilities",
    description: 'Crops Aadhaar card images to the standard 3.5 x 3.5 cm wallet-photo size, automatically detecting the face region using OpenCV Haar cascades.',
    dependencies: "Canvas API"
  },
  {
    id: "203",
    name: "PAN Card Resizer",
    slug: "pan-card-resizer",
    category: "indian-utilities",
    description: 'Resizes PAN card images to 3 x 4 cm (the standard size for laminated identification) while maintaining legibility of the printed text and hologram.',
    dependencies: "Canvas API"
  },
  {
    id: "204",
    name: "KB Image Compressor",
    slug: "kb-image-compressor",
    category: "indian-utilities",
    description: 'Compresses JPEG and PNG images to a specific kilobyte target (e.g., 20 KB, 100 KB, 200 KB) using binary-search quantization until the file size.',
    dependencies: "browser-image-compression"
  }

,
  {
    id: "210",
    name: "Live Transcription",
    slug: "live-transcription",
    category: "Transcription",
    description: 'Live Transcription performs real-time speech-to-text using the browser’s native microphone API with continuous streaming output.',
    dependencies: "Web Speech API"
  },
  {
    id: "211",
    name: "Image Bulk Converter",
    slug: "image-bulk-converter",
    category: "Image",
    description: 'Processes an arbitrary number of uploaded images sequentially, converting between JPEG, PNG, WebP, AVIF, GIF, and TIFF in a single batch.',
    dependencies: "browser-image-compression / jszip",
    isPro: true,
  },
  {
    id: "212",
    name: "eSign PDF",
    slug: "esign-pdf",
    category: "PDF",
    description: 'Places a typed, drawn, or uploaded signature image onto a specific page and coordinate of a PDF document.',
    dependencies: "pdf-lib / fabric"
  },
  {
    id: "213",
    name: "PDF OCR (Scanned Docs)",
    slug: "pdf-ocr",
    category: "PDF",
    description: 'Extracts searchable text from scanned PDF documents and image-only PDFs using optical character recognition with language auto-detection.',
    dependencies: "tesseract.js"
  },
  {
    id: "214",
    name: "PDF Form Filler",
    slug: "pdf-form-filler",
    category: "PDF",
    description: 'Detects interactive form fields in a PDF and provides a clean UI to fill text inputs, checkboxes, and dropdowns before downloading the completed.',
    dependencies: "pdf-lib"
  },
  {
    id: "216",
    name: "AI Document Chat (RAG)",
    slug: "ai-document-chat",
    category: "AI",
    description: 'Indexes uploaded PDFs, Word files, and plain-text documents into a vector store and lets you ask natural-language questions about their contents.',
    dependencies: "CF Vectorize"
  },
  {
    id: "217",
    name: "AI Video Subtitler",
    slug: "ai-video-subtitler",
    category: "AI",
    description: 'Transcribes speech from video files and syncs the resulting subtitles to the exact timing of each utterance.',
    dependencies: "Whisper API"
  },

  {
    name: 'Subtitle Generator',
    slug: 'subtitle-generator',
    description: 'Generate SRT files from video.',
    category: 'Video',
    id:  "219",
    dependencies: 'None'
  },
  {
    name: 'SVG to PNG Converter',
    slug: 'svg-to-png-converter',
    description: 'Convert vector SVG to raster PNG.',
    category: 'Converter',
    id:  "220",
    dependencies: 'None'
  },
  {
    name: 'Unit Converter',
    slug: 'unit-converter',
    description: 'Universal unit conversion tool.',
    category: 'Utility',
    id:  "221",
    dependencies: 'None'
  },

  {
    name: 'Video Watermark Adder',
    slug: 'video-watermark-adder',
    description: 'Add logo or text watermark to video.',
    category: 'Video',
    id:  "223",
    dependencies: 'None'
  },

  {
    name: 'Prompt Library & Generator',
    slug: 'prompt-library-generator',
    description: 'Browse and generate AI prompts.',
    category: 'AI',
    id:  "225",
    dependencies: 'None'
  },
  {
    name: 'GST Invoice Generator',
    slug: 'gst-invoice-generator',
    description: 'Generates PDF invoices fully compliant with Indian GST rules, including mandatory fields like HSN/SAC codes, GSTIN, place of supply.',
    category: 'indian-utilities',
    id:  "227",
    dependencies: 'None'
  },
  {
    name: 'ITR Filing Helper',
    slug: 'itr-filing-helper',
    description: 'Helper for India Income Tax Returns.',
    category: 'indian-utilities',
    id:  "228",
    dependencies: 'None'
  },

  {
    name: 'Browser Extension',
    slug: 'browser-extension',
    description: 'All-in-one sidebar AI assistant.',
    category: 'Extension',
    id:  "230",
    dependencies: 'None'
  },
  {
    name: 'MP3 Compressor',
    slug: 'mp3-compressor',
    description: 'Reduce MP3 size with bitrate control',
    category: 'Utility',
    id:  "231",
    dependencies: 'FFmpeg WASM'
  },
  {
    name: 'GIF to MP4 Converter',
    slug: 'gif-to-mp4',
    description: 'Convert GIF animations to MP4 videos',
    category: 'Converter',
    id:  "232",
    dependencies: 'FFmpeg WASM'
  },
  {
    name: 'Video Trimmer',
    slug: 'video-trimmer',
    description: 'Trim and cut video clips locally',
    category: 'Video',
    id:  "233",
    dependencies: 'FFmpeg WASM'
  },
  {
    name: 'Aadhaar Card Masker',
    slug: 'aadhaar-card-masker',
    description: 'Mask the first 8 digits of your Aadhaar card for secure sharing.',
    category: 'indian-utilities',
    id:  "234",
    dependencies: 'Canvas API'
  },
  {
    name: 'PAN Card Verification',
    slug: 'pan-verification',
    description: 'Verify PAN format and extract taxpayer category locally.',
    category: 'indian-utilities',
    id:  "235",
    dependencies: 'None'
  },
  {
    name: 'IFSC Code Lookup',
    slug: 'ifsc-code-lookup',
    description: 'Accepts an 11-character IFSC code and returns the corresponding bank name, branch address, city, district, state, and contact details.',
    category: 'indian-utilities',
    id:  "236",
    dependencies: 'IFSC API'
  },
  {
    name: 'Voter ID Form Helper',
    slug: 'voter-id-form-helper',
    description: 'Get document checklists and guidance for Form 6/7/8 registration.',
    category: 'indian-utilities',
    id:  "237",
    dependencies: 'None'
  },
  {
    name: 'India Pincode Finder',
    slug: 'india-pincode-finder',
    description: 'Search pincodes and post office branches across India.',
    category: 'indian-utilities',
    id:  "238",
    dependencies: 'Postal API'
  },
  {
    name: 'Hindi / Regional Font Generator',
    slug: 'hindi-regional-font-generator',
    description: 'Generate stylish unicode fonts for Hindi, Tamil, Telugu, and other regional scripts.',
    category: 'indian-utilities',
    id:  "239",
    dependencies: 'None'
  },
  {
    name: 'Indian Age Calculator',
    slug: 'indian-age-calculator',
    description: 'Calculate exact age as per DOB in DD/MM/YYYY format with eligibility check.',
    category: 'indian-utilities',
    id:  "240",
    dependencies: 'None'
  },
  {
    name: 'CGPA to Percentage Converter',
    slug: 'cgpa-to-percentage-converter',
    description: 'Convert CGPA to percentage based on CBSE, MU, and university formulas.',
    category: 'indian-utilities',
    id:  "241",
    dependencies: 'None'
  },
  {
    name: 'PDF to HTML',
    slug: 'pdf-to-html',
    description: 'Convert PDF pages into a clean, responsive HTML5 document.',
    category: 'PDF',
    id:  "242",
    dependencies: 'PDF.js'
  },
  {
    name: 'HTML to PDF',
    slug: 'html-to-pdf',
    description: 'Convert HTML source code into a downloadable PDF document.',
    category: 'PDF',
    id:  "243",
    dependencies: 'jsPDF'
  },
  {
    name: 'Generic PDF Processor',
    slug: 'generic-pdf-processor',
    description: 'Compress, rotate pages, or strip metadata from PDFs in one unified tool.',
    category: 'PDF',
    id:  "244",
    dependencies: 'pdf-lib'
  },
  {
    name: 'WebP to PNG Converter',
    slug: 'webp-to-png',
    description: 'Converts WebP images to standard PNG format with full transparency support. Designers and web developers use it when they need to use WebP-sourced.',
    category: 'Image',
    id:  "245",
    dependencies: 'Canvas API'
  },
  {
    name: 'JFIF to PNG Converter',
    slug: 'jfif-to-png',
    description: 'Converts JFIF (JPEG File Interchange Format) images to standard PNG format without quality loss.',
    category: 'Image',
    id:  "246",
    dependencies: 'Canvas API'
  },
  {
    name: 'HEIC to PNG Converter',
    slug: 'heic-to-png',
    description: 'Converts Apple HEIC/HEIF images to universally compatible PNG format with a batch queue for processing multiple photos.',
    category: 'Image',
    id:  "247",
    dependencies: 'libheif WASM'
  },
  {
    name: 'Image to JPG Converter',
    slug: 'convert-to-jpg',
    description: 'Converts any image format — PNG, WebP, BMP, GIF, TIFF — to standard JPG with configurable quality settings.',
    category: 'Image',
    id:  "248",
    dependencies: 'Canvas API'
  },
  {
    name: 'Rotate Image Online',
    slug: 'rotate-image',
    description: 'Rotates images left or right by 90-degree increments instantly in the browser with no upload required.',
    category: 'Image',
    id:  "249",
    dependencies: 'Canvas API'
  },
  {
    name: 'Blur Face Online',
    slug: 'blur-face',
    description: 'Detects faces in uploaded images using AI-powered computer vision and applies an adjustable blur effect to each detected face.',
    category: 'Image',
    id:  "250",
    dependencies: 'AI API'
  },
  {
    name: 'HTML to Image Converter',
    slug: 'html-to-image',
    description: 'Renders custom HTML and CSS markup into downloadable PNG, JPG, or SVG images directly in the browser.',
    category: 'Developer',
    id:  "251",
    dependencies: 'html2canvas'
  },
  {
    name: 'Apple Music Preview Extractor',
    slug: 'apple-music-preview-extractor',
    description: 'Extracts publicly available 30-to-90-second audio preview clips from Apple Music by resolving the store URL.',
    category: 'Audio',
    id:  "252",
    dependencies: 'fetch API'
  },
  {
    name: 'Twitch Thumbnail Downloader',
    slug: 'twitch-thumbnail-downloader',
    description: 'Downloads the publicly cached preview thumbnail images from Twitch streams, clips, and videos by parsing the Twitch CDN URL pattern.',
    category: 'Downloader',
    id:  "253",
    dependencies: 'fetch API'
  },
  {
    name: 'Dailymotion Downloader',
    slug: 'dailymotion-downloader',
    description: 'Downloads Dailymotion videos in multiple quality options by extracting direct MP4 stream URLs from the video metadata.',
    category: 'Video',
    id:  "254",
    dependencies: 'fetch API'
  },


  {
    name: 'Marriage Biodata Maker',
    slug: 'marriage-biodata-maker',
    description: 'Creates printable matrimonial biodata forms with sections for personal details, family background, education, career, and partner preferences.',
    category: 'indian-utilities',
    id:  "257",
    dependencies: 'jsPDF'
  },
  {
    name: 'Rental Agreement Generator',
    slug: 'rental-agreement-generator',
    description: 'Generates customizable rental lease and license agreements compliant with Indian property laws including leave-and-license and tenancy formats.',
    category: 'indian-utilities',
    id:  "258",
    dependencies: 'jsPDF'
  },
  {
    name: 'Resume ATS Score Checker',
    slug: 'resume-ats-score-checker',
    description: 'Analyzes uploaded resumes against a job description using AI to calculate an ATS compatibility score and provide actionable suggestions.',
    category: 'AI',
    id:  "259",
    dependencies: 'AI API'
  },
  {
    name: 'Instagram Media Downloader',
    slug: 'instagram-story-downloader',
    description: 'Downloads Instagram posts, reels, and stories by resolving media URLs through Instagram\'s public oEmbed API.',
    category: 'Downloader',
    id:  "260",
    dependencies: 'fetch API'
  },
  {
    name: 'WhatsApp Toolkit',
    slug: 'whatsapp-toolkit',
    description: 'Generates wa.me click-to-chat links, WhatsApp group invite links, QR codes for quick connections, and includes a chat analyzer and status text.',
    category: 'Utility',
    id:  "261",
    dependencies: 'QRCode.js'
  },
  {
    name: 'Indian Document Enhancer',
    slug: 'indian-document-enhancer',
    description: 'Enhances scanned images of Indian identification documents — Aadhaar, PAN, Voter ID, Driving License — for upload compliance on government portals.',
    category: 'indian-utilities',
    id:  "262",
    dependencies: 'Canvas API'
  },

  {
    name: 'Indian Voice Transcriber',
    slug: 'indian-voice-transcriber',
    description: 'Transcribes recorded audio into text with support for 12 Indian languages using browser-based speech recognition.',
    category: 'indian-utilities',
    id:  "264",
    dependencies: 'Web Speech API'
  },
  {
    name: 'Bank Statement Analyser',
    slug: 'bank-statement-analyser',
    description: 'Parses uploaded bank statement PDFs or CSV exports and categorizes transactions into income, expense, and transfer categories with visual spending.',
    category: 'Utility',
    id:  "265",
    dependencies: 'PDF.js'
  },


  {
    name: 'Social Media Calendar',
    slug: 'social-media-calendar',
    description: 'Lets users plan and schedule social media posts across multiple platforms in a visual calendar view with draft, scheduled.',
    category: 'Utility',
    id:  "268",
    dependencies: 'localStorage'
  },
  {
    name: 'Bulk Background Changer',
    slug: 'bulk-bg-changer',
    description: 'Removes or replaces backgrounds on multiple images simultaneously with color-key sampling and batch processing.',
    category: 'Image',
    id:  "269",
    dependencies: 'Canvas API',
    isPro: true,
  },
  {
    name: 'AI Background Changer',
    slug: 'ai-bg-changer',
    description: 'Removes and replaces image backgrounds using edge-aware detection algorithms that separate foreground subjects without a green screen.',
    category: 'Image',
    id:  "270",
    dependencies: 'Canvas API'
  },
  {
    name: 'Link in Bio Builder',
    slug: 'link-in-bio-builder',
    description: 'Creates customizable link-in-bio landing pages with profile photo, bio, multiple social media links, and custom icon selection.',
    category: 'Branding',
    id:  "271",
    dependencies: 'None'
  },
  {
    name: 'Timezone Converter',
    slug: 'ist-time-converter',
    description: 'Converts between 8+ major world time zones including IST, PST, EST, CST, GMT, UTC, JST, and SGT with live clocks.',
    category: 'Utility',
    id:  "272",
    dependencies: 'None'
  },
  {
    name: 'Audio Converter',
    slug: 'audio-converter',
    description: 'Converts audio files between MP3, WAV, OGG, and FLAC formats using FFmpeg WASM running entirely in the browser.',
    category: 'Audio',
    id:  "273",
    dependencies: 'FFmpeg WASM'
  },
  {
    name: 'PDF Page Manager',
    slug: 'pdf-page-manager',
    description: 'Manages PDF pages with crop, organize, extract, rotate, and delete operations in a single unified interface with visual page thumbnails.',
    category: 'PDF',
    id:  "274",
    dependencies: 'pdf-lib'
  },
  {
    name: 'Bulk QR Code Generator',
    slug: 'bulk-qr-code-generator',
    description: 'Processes a CSV file containing multiple data entries and generates a corresponding QR code image for each row, delivered as a ZIP archive.',
    category: 'Utility',
    id:  "275",
    dependencies: 'qrcode.js, JSZip',
    isPro: true,
  },
  {
    name: 'PDF AI Summariser',
    slug: 'pdf-ai-summariser',
    description: 'Uploads a PDF document, extracts its full text via OCR and native parsing, then sends the content to an LLM for a condensed summary highlighting key.',
    category: 'AI',
    id:  "276",
    dependencies: 'AI API, PDF.js'
  },
  {
    name: 'YouTube Thumbnail Downloader',
    slug: 'youtube-thumbnail-downloader',
    description: 'Fetches and displays all available resolution variants of a YouTube video thumbnail — from default (120x90) up to maxresdefault (1920x1080) — given.',
    category: 'Downloader',
    id:  "277",
    dependencies: 'fetch API'
  },
  {
    id: "278",
    name: "Bulk Image Watermark",
    slug: "bulk-image-watermark",
    category: "Image",
    description: "Apply a text logo, image logo, or timestamp overlay to dozens of images at once with configurable position, opacity, and rotation per batch.",
    dependencies: "Canvas API, jszip",
  },
  {
    id: "279",
    name: "Bulk PDF Data Extractor",
    slug: "bulk-pdf-data-extractor",
    category: "PDF",
    description: "Extract tables, form fields, and key-value pairs from multiple PDFs simultaneously and export the aggregated data to a single CSV or Excel file.",
    dependencies: "pdf-lib, SheetJS",
  },
  {
    id: "280",
    name: "Bulk Image to PDF",
    slug: "bulk-image-to-pdf",
    category: "PDF",
    description: "Merge hundreds of JPG, PNG, or WebP images into a single multi-page PDF with configurable page size, orientation, and compression per batch.",
    dependencies: "jsPDF, Canvas API",
  },
  {
    id: "281",
    name: "Bulk Audio Converter",
    slug: "bulk-audio-converter",
    category: "Audio",
    description: "Convert an entire folder of audio files between MP3, WAV, OGG, FLAC, and M4A formats in one batch with consistent quality and bitrate settings.",
    dependencies: "FFmpeg WASM",
  },
  {
    id: "282",
    name: "Bulk SVG to PNG",
    slug: "bulk-svg-to-png",
    category: "Image",
    description: "Rasterize hundreds of SVG files to PNG at any resolution, preserving vector sharpness. Ideal for generating icon sprite sheets and asset pipelines.",
    dependencies: "Canvas API, jszip",
  },
  {
    id: "283",
    name: "Bulk Image Compressor",
    slug: "bulk-image-compressor",
    category: "Image",
    description: "Compress JPG, PNG, and WebP images in bulk with uniform quality settings. E-commerce sellers use it to optimize entire product catalogs before upload.",
    dependencies: "browser-image-compression, jszip",
  },
  {
    id: "284",
    name: "Bulk PDF Size Reducer",
    slug: "bulk-pdf-size-reducer",
    category: "PDF",
    description: "Reduce file size of multiple PDFs at once by compressing embedded images, removing metadata, and optimizing object streams across the batch.",
    dependencies: "pdf-lib",
  },
  {
    id: "285",
    name: "Bulk Image Resizer",
    slug: "bulk-image-resizer",
    category: "Image",
    description: "Resize hundreds of images to exact pixel dimensions or percentage scale in one pass. Photographers use it to standardize client galleries before delivery.",
    dependencies: "Canvas API, jszip",
  },
  {
    id: "286",
    name: "Bulk Video Compressor",
    slug: "bulk-video-compressor",
    category: "Video",
    description: "Compress multiple video files simultaneously with consistent CRF, resolution, and codec settings. YouTube studios use it to batch-optimize daily uploads.",
    dependencies: "FFmpeg WASM",
  },
  {
    id: "287",
    name: "Bulk PDF Merger",
    slug: "bulk-pdf-merger",
    category: "PDF",
    description: "Join dozens of PDF files into one document in a single operation. Legal teams use it to consolidate contract bundles and discovery exhibits instantly.",
    dependencies: "pdf-lib",
  },
  {
    id: "288",
    name: "Bulk Face Anonymizer",
    slug: "bulk-face-anonymizer",
    category: "Image",
    description: "Detect and blur faces across multiple images automatically using on-device face detection. GDPR compliance teams use it to anonymize datasets before publication.",
    dependencies: "TensorFlow.js, Canvas API, jszip",
  },
  {
    id: "289",
    name: "Bulk PDF Form Extractor",
    slug: "bulk-pdf-form-extractor",
    category: "PDF",
    description: "Extract filled form fields from hundreds of identical PDF forms and aggregate responses into a single CSV. Large-scale survey and application processing teams depend on it.",
    dependencies: "pdf-lib",
  },
  {
    id: "290",
    name: "Bulk Video Size Reducer",
    slug: "bulk-video-size-reducer",
    category: "Video",
    description: "Batch-reduce video file sizes to fit email attachment limits (25MB), messaging platform caps, or any user-defined target. Every office worker with video attachments needs this.",
    dependencies: "FFmpeg WASM",
  },
  {
    id: "291",
    name: "Bulk Audio Normalizer",
    slug: "bulk-audio-normalizer",
    category: "Audio",
    description: "Normalize loudness across multiple audio files to broadcast-standard LUFS levels (–16 LUFS for podcasts, –14 LUFS for streaming). Podcast networks use this to unify episode volume.",
    dependencies: "Web Audio API",
  },
  {
    id: "292",
    name: "Bulk Video Subtitle Burner",
    slug: "bulk-video-subtitle-burner",
    category: "Video",
    description: "Burn SRT or VTT subtitles directly into multiple video files in one batch. Content republishers use it to prepare videos for platforms that do not support soft subtitles.",
    dependencies: "FFmpeg WASM",
  },
  {
    id: "293",
    name: "Bulk Invoice & Receipt Parser",
    slug: "bulk-invoice-receipt-parser",
    category: "Finance",
    description: "Drop 100 invoice PDFs or images, auto-detect date, vendor, amount, and tax, then export a clean CSV ready for tax filing. Replaces expensive accounting OCR per-document fees.",
    dependencies: "Tesseract.js, pdf-lib, SheetJS",
  },
  {
    id: "294",
    name: "Bulk CSV/Excel to JSON",
    slug: "bulk-csv-excel-to-json",
    category: "Developer",
    description: "Convert messy CSV or Excel sheets from clients into clean JSON in one batch. Handles missing values, nested rows, and generates strict JSON schemas for 50+ files at once.",
    dependencies: "SheetJS",
  },
  {
    id: "295",
    name: "Bulk URL Status Checker",
    slug: "bulk-url-status-checker",
    category: "SEO",
    description: "Check 5,000 URLs for HTTP status codes (200, 301, 404, 500), extract title/meta descriptions, and flag slow pages. SEO agencies use it instead of $50/mo crawling tools.",
    dependencies: "fetch API",
  },
  {
    id: "296",
    name: "Bulk WebP/AVIF Modernizer",
    slug: "bulk-webp-avif-modernizer",
    category: "Image",
    description: "Convert entire image folders to WebP or AVIF while keeping directory structure intact. Generates fallback PNGs and ready-to-use HTML <picture> tag blocks per batch.",
    dependencies: "Canvas API, jszip",
  },
  {
    id: "297",
    name: "Bulk EXIF Stripper & Injector",
    slug: "bulk-exif-stripper-injector",
    category: "Image",
    description: "Strip GPS location, camera serial, and timestamps from thousands of photos client-side. Or bulk-inject copyright metadata using a template across an entire image library.",
    dependencies: "exifr, piexifjs, jszip",
  },
  {
    id: "298",
    name: "Bulk App Icon Generator",
    slug: "bulk-app-icon-generator",
    category: "Image",
    description: "Upload one high-res SVG/PNG and export 30+ correctly sized icons for iOS, Android, PWA, Shopify, and social media OG images in a structured ZIP.",
    dependencies: "Canvas API, jszip",
  },
  {
    id: "299",
    name: "Bulk Markdown to PDF/HTML",
    slug: "bulk-markdown-to-pdf-html",
    category: "Developer",
    description: "Convert 100+ Markdown files into beautifully styled PDFs or static HTML with custom CSS, auto-generated table of contents, and corporate templates.",
    dependencies: "marked.js, jsPDF, jszip",
  },
  {
    id: "300",
    name: "Bulk Font Subsetter",
    slug: "bulk-font-subsetter",
    category: "Developer",
    description: "Convert TTF/OTF fonts to WOFF2 and subset to only used characters (Latin, Cyrillic, etc.). Generates @font-face CSS blocks. Cuts font files from MBs to KBs.",
    dependencies: "opentype.js, jszip",
  },
  {
    id: "301",
    name: "Bulk Subtitle Time-Shifter",
    slug: "bulk-subtitle-time-shifter",
    category: "Video",
    description: "Apply global time offset (+/- seconds) to a whole season of SRT/VTT files at once. Localization agencies use it to realign and translate subtitle batches.",
    dependencies: "Vanilla JS, jszip",
  },
  {
    id: "302",
    name: "Bulk Regex Extractor & Replacer",
    slug: "bulk-regex-extractor-replacer",
    category: "Developer",
    description: "Scan thousands of log files or codebase files for regex patterns (IPs, API keys, URLs) and extract or replace them. Visual builder for non-coders with live preview.",
    dependencies: "Vanilla JS, jszip",
  }
];
const proSlugs = [
  "tiktok-video-downloader", "youtube-downloader", "instagram-video-downloader",
  "facebook-video-downloader", "twitter-video-downloader",
  "ai-translator", "pdf-to-word", "ai-image-generator", "logo-maker", "mp4-to-mp3",
  "pdf-compressor", "word-to-pdf", "jpg-to-pdf",
  "pdf-to-jpg", "pdf-to-ppt", "background-remover",
  "object-remover", "ppt-to-pdf", "pdf-merger", "excel-to-pdf", "video-to-text-transcription",
  "social-media-post-maker", "svg-editor", "business-card-maker", "pdf-to-excel",
  "unlock-pdf", "protect-pdf", "epub-to-pdf", "pdf-to-epub", "compare-pdf-files",
  "extract-images-from-pdf", "email-signature-generator",
  "ai-thumbnail-maker", "mp3-compressor", "gif-to-mp4", "video-trimmer",
  "video-watermark-adder", "prompt-library-generator", "saas-pricing-calculator",
  "employee-turnover-calculator", "pdf-to-html", "html-to-pdf", "generic-pdf-processor",
  "youtube-thumbnail-downloader",
  "batch-image-editor", "image-bulk-converter", "bulk-bg-changer", "bulk-qr-code-generator",
  "bulk-image-watermark", "bulk-pdf-data-extractor", "bulk-image-to-pdf",
  "bulk-audio-converter", "bulk-svg-to-png", "bulk-image-compressor",
  "bulk-pdf-size-reducer", "bulk-image-resizer", "bulk-video-compressor",
  "bulk-pdf-merger", "bulk-face-anonymizer", "bulk-pdf-form-extractor",
  "bulk-video-size-reducer", "bulk-audio-normalizer", "bulk-video-subtitle-burner",
  "currency-converter", "reddit-video-downloader",
  "temporary-email-generator", "text-to-speech-tts", "ai-paraphrasing-tool",
  "audio-to-text-transcription", "ip-address-lookup",
  "youtube-transcript-generator", "speech-to-text", "vimeo-video-downloader",
  "meeting-minutes-generator", "ai-cover-letter-generator",
  "subtitle-translator", "podcast-transcription", "ai-document-chat", "ai-video-subtitler",
  "ifsc-code-lookup", "india-pincode-finder", "blur-face",
  "resume-ats-score-checker", "pdf-ai-summariser",
  "url-shortener", "secure-note-sharer",
  "gif-compressor", "image-to-gif", "mp4-to-gif", "webm-to-gif", "mov-to-gif",
  "video-to-mp3", "mp3-to-ogg", "wav-compressor", "crop-video", "mkv-to-mp4",
  "mov-to-mp4", "webm-to-mp4", "audio-cutter", "avi-to-mp4", "video-compressor",
  "video-to-gif", "audio-converter", "image-colorizer", "png-to-svg",
  "image-enhancer", "ai-image-upscaler", "ai-face-swap", "photo-retoucher",
  "heic-to-png", "pdf-ocr",
  "bulk-invoice-receipt-parser", "bulk-csv-excel-to-json", "bulk-url-status-checker",
  "bulk-webp-avif-modernizer", "bulk-exif-stripper-injector", "bulk-app-icon-generator",
  "bulk-markdown-to-pdf-html", "bulk-font-subsetter", "bulk-subtitle-time-shifter",
  "bulk-regex-extractor-replacer"
];

export const toolsRegistry: ToolMetadata[] = rawToolsRegistry.map(tool => ({
  ...tool,
  isPro: proSlugs.includes(tool.slug)
}));

export const getToolBySlug = (slug: string) => toolsRegistry.find(t => t.slug === slug);
export const getToolsByCategory = (category: string) => toolsRegistry.filter(t => t.category === category);
export const getToolByCategoryAndSlug = (category: string, slug: string) => toolsRegistry.find(t => t.category.toLowerCase().replace(/\s+/g, '-') === category && t.slug === slug);

