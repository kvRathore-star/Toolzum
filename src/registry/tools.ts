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
    description: "Overlay custom text onto your images using the HTML5 Canvas API entirely in your browser.",
    category: "Image",
    slug: "add-text-to-photo",
    dependencies: "Canvas API",
  },
  {
    id: "batch-edit-1",
    name: "Batch Image Editor",
    description: "Resize and watermark dozens of images instantly in your browser.",
    category: "Image",
    slug: "batch-image-editor",
    dependencies: "Canvas API, jszip",
  },
  {
    id: "brand-kit-1",
    name: "Brand Kit",
    description: "Save your brand colors and fonts locally to easily copy them when needed.",
    category: "Developer",
    slug: "brand-kit",
    dependencies: "localStorage",
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
    description: "Create animated GIFs by combining multiple images together.",
    category: "Video",
    slug: "image-to-gif",
    dependencies: "ffmpeg",
  },
  {
    id: "mp4-gif-1",
    name: "MP4 to GIF",
    description: "Convert MP4 video clips into animated GIFs.",
    category: "Video",
    slug: "mp4-to-gif",
    dependencies: "ffmpeg",
  },
  {
    id: "webm-gif-1",
    name: "WEBM to GIF",
    description: "Convert WebM video clips into animated GIFs.",
    category: "Video",
    slug: "webm-to-gif",
    dependencies: "ffmpeg",
  },
  {
    id: "mov-gif-1",
    name: "MOV to GIF",
    description: "Convert Apple MOV video clips into animated GIFs.",
    category: "Video",
    slug: "mov-to-gif",
    dependencies: "ffmpeg",
  },
  {
    id: "vid-mp3-1",
    name: "Video to MP3 Converter",
    description: "Extract high-quality audio tracks directly from your video files.",
    category: "Video",
    slug: "video-to-mp3",
    dependencies: "ffmpeg",
  },
  {
    id: "mp3-ogg-1",
    name: "MP3 to OGG Converter",
    description: "Convert MP3 audio files into web-friendly OGG format.",
    category: "Audio",
    slug: "mp3-to-ogg",
    dependencies: "ffmpeg",
  },
  {
    id: "wav-comp-1",
    name: "WAV Compressor",
    description: "Compress heavy WAV files by downmixing to mono and reducing the sample rate.",
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
    description: "Instantly convert JSON objects to XML format.",
    category: "Developer",
    slug: "json-to-xml",
    dependencies: "xml2js",
  },
  {
    id: "time-conv-1",
    name: "Time Converter",
    description: "Convert between seconds, minutes, hours, days, and more.",
    category: "Converter",
    slug: "time-converter",
    dependencies: "None",
  },
  {
    id: "time-pst-est-1",
    name: "PST to EST Converter",
    description: "Quickly convert Pacific Standard Time (PST) to Eastern Standard Time (EST).",
    category: "Converter",
    slug: "pst-to-est",
    dependencies: "None",
  },
  {
    id: "time-cst-est-1",
    name: "CST to EST Converter",
    description: "Quickly convert Central Standard Time (CST) to Eastern Standard Time (EST).",
    category: "Converter",
    slug: "cst-to-est",
    dependencies: "None",
  },
  {
    id: "conv-lbs-kg-1",
    name: "Lbs to Kg Converter",
    description: "Instantly convert Pounds (lbs) to Kilograms (kg).",
    category: "Converter",
    slug: "lbs-to-kg",
    dependencies: "None",
  },
  {
    id: "conv-kg-lbs-1",
    name: "Kg to Lbs Converter",
    description: "Instantly convert Kilograms (kg) to Pounds (lbs).",
    category: "Converter",
    slug: "kg-to-lbs",
    dependencies: "None",
  },
  {
    id: "conv-ft-m-1",
    name: "Feet to Meters Converter",
    description: "Instantly convert length from Feet (ft) to Meters (m).",
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
    description: "Remove white margins from your PDF documents instantly.",
    category: "PDF",
    slug: "crop-pdf",
    dependencies: "pdf-lib",
  },
  {
    id: "pdf-org-1",
    name: "Organize PDF Pages",
    description: "Drag and drop to reorder PDF pages, or remove them entirely.",
    category: "PDF",
    slug: "organize-pdf",
    dependencies: "pdf-lib",
  },
  {
    id: "pdf-ext-1",
    name: "Extract PDF Pages",
    description: "Pull specific pages out of a large PDF to create a smaller document.",
    category: "PDF",
    slug: "extract-pages-from-pdf",
    dependencies: "pdf-lib",
  },
  {
    id: "pdf-heic-1",
    name: "HEIC to PDF",
    description: "Convert Apple iOS HEIC/HEIF photos directly into a PDF document.",
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
    name: "Ad Blocker Extension",
    slug: "ad-blocker-extension",
    category: "Extension",
    description: "Block ads and trackers",
    dependencies: "Vanilla JS"
  },
  {
    id: "yt-dl-1",
    name: "YouTube Downloader",
    description: "Download YouTube videos as MP4 or extract audio as MP3. Paste URL and save instantly.",
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
    id: "5",
    name: "YouTube Video Downloader Extension",
    slug: "youtube-video-downloader-extension",
    category: "Extension",
    description: "Download videos directly from browser",
    dependencies: "Vanilla JS"
  },
  {
    id: "6",
    name: "Facebook Video Downloader",
    slug: "facebook-video-downloader",
    category: "Downloader",
    description: "Download FB videos",
    dependencies: "yt-dlp"
  },
  {
    id: "7",
    name: "AI Translator",
    slug: "ai-translator",
    category: "AI",
    description: "100+ languages (22 Indian languages)",
    dependencies: "Google Cloud Translation API"
  },
  {
    id: "8",
    name: "Grammar Checker Extension",
    slug: "grammar-checker-extension",
    category: "Extension",
    description: "Check grammar as you type",
    dependencies: "LanguageTool API"
  },
  {
    id: "9",
    name: "PDF to Word",
    slug: "pdf-to-word",
    category: "PDF",
    description: "Convert PDF to editable DOCX",
    dependencies: "pdf2docx / PDF.js"
  },
  {
    id: "10",
    name: "AI Image Generator",
    slug: "ai-image-generator",
    category: "AI",
    description: "Generate images from text prompts",
    dependencies: "Stable Diffusion API"
  },
  {
    id: "11",
    name: "Speed Test",
    slug: "speed-test",
    category: "Utility",
    description: "Test internet connection speed",
    dependencies: "WebSockets / WebRTC"
  },
  {
    id: "12",
    name: "Twitter Video Downloader",
    slug: "twitter-video-downloader",
    category: "Downloader",
    description: "Download X videos",
    dependencies: "yt-dlp"
  },
  {
    id: "13",
    name: "SoundCloud Downloader",
    slug: "soundcloud-downloader",
    category: "Downloader",
    description: "Download SoundCloud tracks",
    dependencies: "API / yt-dlp"
  },
  {
    id: "14",
    name: "Compress Image to 50KB",
    slug: "compress-image-to-50kb",
    category: "Image",
    description: "Target size image compression",
    dependencies: "browser-image-compression"
  },
  {
    id: "15",
    name: "Currency Converter",
    slug: "currency-converter",
    category: "Finance",
    description: "Live exchange rates conversion",
    dependencies: "ExchangeRate-API"
  },
  {
    id: "16",
    name: "Logo Maker",
    slug: "logo-maker",
    category: "Branding",
    description: "Create custom logos online",
    dependencies: "Fabric.js / Canvas API"
  },
  {
    id: "17",
    name: "MP4 to MP3",
    slug: "mp4-to-mp3",
    category: "Converter",
    description: "Convert MP4 videos to MP3 audio",
    dependencies: "FFmpeg"
  },
  {
    id: "pdf-comp-1",
    name: "PDF Compressor",
    description: "Reduce PDF file size by up to 90% — free, instant, entirely in your browser. No upload, no signup.",
    category: "PDF",
    slug: "pdf-compressor",
    dependencies: "Ghostscript / PDF-lib"
  },
  {
    id: "19",
    name: "Word to PDF",
    slug: "word-to-pdf",
    category: "PDF",
    description: "Convert Word documents to PDF",
    dependencies: "LibreOffice API / CloudConvert API"
  },
  {
    id: "20",
    name: "AI Writing Assistant",
    slug: "ai-writing-assistant",
    category: "AI",
    description: "Long-form blog, email, and essay writer",
    dependencies: "OpenAI API / LangChain"
  },
  {
    id: "21",
    name: "Percentage Calculator",
    slug: "percentage-calculator",
    category: "Finance",
    description: "Calculate percentages and discounts",
    dependencies: "Vanilla JS"
  },
  {
    id: "22",
    name: "JPG to PDF",
    slug: "jpg-to-pdf",
    category: "PDF",
    description: "Combine JPG images into PDF",
    dependencies: "jsPDF / Canvas API"
  },
  {
    id: "24",
    name: "Online Timer",
    slug: "online-timer",
    category: "Productivity",
    description: "Countdown timer with alarm",
    dependencies: "Web Audio API"
  },
  {
    id: "25",
    name: "Plagiarism Checker",
    slug: "plagiarism-checker",
    category: "Text",
    description: "Check text for duplicate content",
    dependencies: "Copyscape API / Custom API"
  },
  {
    id: "26",
    name: "Age Calculator",
    slug: "age-calculator",
    category: "Utility",
    description: "Calculate exact age in years/months/days",
    dependencies: "Date-fns / Moment.js"
  },
  {
    id: "27",
    name: "HEIC to JPG",
    slug: "heic-to-jpg",
    category: "Image",
    description: "Convert iPhone photos to JPG",
    dependencies: "heic2any"
  },
  {
    id: "28",
    name: "PDF to JPG",
    slug: "pdf-to-jpg",
    category: "PDF",
    description: "Convert PDF pages to JPG images",
    dependencies: "PDF.js / Canvas API"
  },
  {
    id: "29",
    name: "PDF to PPT",
    slug: "pdf-to-ppt",
    category: "PDF",
    description: "Convert PDF to PowerPoint",
    dependencies: "pdf2json / PptxGenJS"
  },
  {
    id: "30",
    name: "Fancy Text Generator",
    slug: "fancy-text-generator",
    category: "Text",
    description: "Create stylish fonts for social media",
    dependencies: "Unicode mapping"
  },
  {
    id: "31",
    name: "Stopwatch",
    slug: "stopwatch",
    category: "Productivity",
    description: "Online stopwatch with lap times",
    dependencies: "Vanilla JS"
  },
  {
    id: "32",
    name: "Reddit Video Downloader",
    slug: "reddit-video-downloader",
    category: "Downloader",
    description: "Download videos from Reddit",
    dependencies: "yt-dlp"
  },
  {
    id: "33",
    name: "Background Remover",
    slug: "background-remover",
    category: "Image",
    description: "AI one-click background removal",
    dependencies: "rembg / OpenCV / TensorFlow.js"
  },
  {
    id: "34",
    name: "WebP to JPG",
    slug: "webp-to-jpg",
    category: "Image",
    description: "Convert WebP images to JPG",
    dependencies: "Canvas API"
  },
  {
    id: "35",
    name: "Wheel of Names",
    slug: "wheel-of-names",
    category: "Utility",
    description: "Random name picker wheel",
    dependencies: "Canvas API / GSAP"
  },
  {
    id: "36",
    name: "Image Compressor",
    slug: "image-compressor",
    category: "Image",
    description: "Lossless & lossy compression for JPG/PNG/WEBP",
    dependencies: "HTML5 Canvas / libjpeg-turbo"
  },
  {
    id: "37",
    name: "Object Remover",
    slug: "object-remover",
    category: "Image",
    description: "Remove unwanted objects from photos",
    dependencies: "Lama Cleaner"
  },
  {
    id: "38",
    name: "PPT to PDF",
    slug: "ppt-to-pdf",
    category: "PDF",
    description: "Convert PowerPoint to PDF",
    dependencies: "LibreOffice API"
  },
  {
    id: "39",
    name: "Temporary Email Generator",
    slug: "temporary-email-generator",
    category: "Privacy",
    description: "Generate disposable email addresses",
    dependencies: "Mailinator API / Custom Backend"
  },
  {
    id: "40",
    name: "Screen Recorder Extension",
    slug: "screen-recorder-extension",
    category: "Extension",
    description: "Record screen and audio",
    dependencies: "MediaRecorder API"
  },
  {
    id: "41",
    name: "PDF Merger",
    slug: "pdf-merger",
    category: "PDF",
    description: "Combine multiple PDFs into one",
    dependencies: "pdf-lib"
  },
  {
    id: "42",
    name: "QR Code Generator",
    slug: "qr-code-generator",
    category: "Utility",
    description: "Create custom QR codes with logos",
    dependencies: "qrcode.js"
  },
  {
    id: "43",
    name: "To-Do List",
    slug: "to-do-list",
    category: "Productivity",
    description: "Simple task management",
    dependencies: "React / LocalStorage"
  },
  {
    id: "44",
    name: "Excel to PDF",
    slug: "excel-to-pdf",
    category: "PDF",
    description: "Convert Excel spreadsheets to PDF",
    dependencies: "SheetJS / jsPDF"
  },
  {
    id: "45",
    name: "EMI Calculator",
    slug: "emi-calculator",
    category: "Finance",
    description: "Calculate home/car loan EMI",
    dependencies: "Vanilla JS"
  },
  {
    id: "46",
    name: "Character Counter",
    slug: "character-counter",
    category: "Text",
    description: "Count characters with/without spaces",
    dependencies: "Vanilla JS"
  },
  {
    id: "47",
    name: "Video to Text Transcription",
    slug: "video-to-text-transcription",
    category: "Transcription",
    description: "Extract text from video files",
    dependencies: "Whisper API"
  },
  {
    id: "48",
    name: "Word Counter",
    slug: "word-counter",
    category: "Text",
    description: "Count words/characters/paragraphs",
    dependencies: "Vanilla JS"
  },
  {
    id: "49",
    name: "Crop Image",
    slug: "crop-image",
    category: "Image",
    description: "Online image cropper",
    dependencies: "Cropper.js"
  },
  {
    id: "50",
    name: "Social Media Post Maker",
    slug: "social-media-post-maker",
    category: "Branding",
    description: "Create graphics for social media",
    dependencies: "Fabric.js"
  },
  {
    id: "51",
    name: "MKV to MP4",
    slug: "mkv-to-mp4",
    category: "Converter",
    description: "Convert MKV videos to MP4",
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
    description: "Rewrite articles and sentences",
    dependencies: "HuggingFace"
  },
  {
    id: "54",
    name: "Random Number Generator",
    slug: "random-number-generator",
    category: "Utility",
    description: "Generate random numbers in range",
    dependencies: "Math.random()"
  },
  {
    id: "55",
    name: "URL Shortener",
    slug: "url-shortener",
    category: "Utility",
    description: "Shorten long URLs with analytics",
    dependencies: "Node.js / Redis"
  },
  {
    id: "56",
    name: "Text Summarizer",
    slug: "text-summarizer",
    category: "Text",
    description: "AI-powered article summarization",
    dependencies: "OpenAI API / HuggingFace"
  },
  {
    id: "58",
    name: "PDF to Excel",
    slug: "pdf-to-excel",
    category: "PDF",
    description: "Extract tables from PDF to Excel",
    dependencies: "pdf2json / SheetJS"
  },
  {
    id: "59",
    name: "Unlock PDF",
    slug: "unlock-pdf",
    category: "PDF",
    description: "Remove password from PDF",
    dependencies: "qpdf"
  },
  {
    id: "60",
    name: "Image Enhancer",
    slug: "image-enhancer",
    category: "Image",
    description: "Enhance image quality and resolution",
    dependencies: "Real-ESRGAN"
  },
  {
    id: "61",
    name: "SIP Calculator",
    slug: "sip-calculator",
    category: "Finance",
    description: "Mutual fund returns calculator",
    dependencies: "Vanilla JS"
  },
  {
    id: "62",
    name: "BMI Calculator",
    slug: "bmi-calculator",
    category: "Health",
    description: "Body Mass Index calculator",
    dependencies: "Vanilla JS"
  },
  {
    id: "63",
    name: "Pinterest Image Downloader",
    slug: "pinterest-image-downloader",
    category: "Downloader",
    description: "Download high-res Pinterest pins",
    dependencies: "Vanilla JS"
  },
  {
    id: "64",
    name: "Audio to Text Transcription",
    slug: "audio-to-text-transcription",
    category: "Transcription",
    description: "Transcribe audio files to text",
    dependencies: "Whisper API"
  },
  {
    id: "66",
    name: "Meme Generator",
    slug: "meme-generator",
    category: "Image",
    description: "Add custom text to meme templates",
    dependencies: "Canvas API"
  },
  {
    id: "67",
    name: "MOV to MP4",
    slug: "mov-to-mp4",
    category: "Converter",
    description: "Convert MOV videos to MP4",
    dependencies: "FFmpeg"
  },
  {
    id: "68",
    name: "Resume Builder",
    slug: "resume-builder",
    category: "Utility",
    description: "Create professional resumes online",
    dependencies: "React / html2pdf.js"
  },
  {
    id: "69",
    name: "AI Image Upscaler",
    slug: "ai-image-upscaler",
    category: "AI",
    description: "Upscale images without losing quality",
    dependencies: "Real-ESRGAN"
  },
  {
    id: "70",
    name: "GST Calculator",
    slug: "gst-calculator",
    category: "Finance",
    description: "Calculate GST inclusive/exclusive prices",
    dependencies: "Vanilla JS"
  },
  {
    id: "71",
    name: "Image Resizer",
    slug: "image-resizer",
    category: "Image",
    description: "Social media templates & custom resizing",
    dependencies: "Canvas API / Sharp"
  },
  {
    id: "72",
    name: "Password Generator",
    slug: "password-generator",
    category: "Utility",
    description: "Generate secure random passwords",
    dependencies: "Crypto API"
  },
  {
    id: "73",
    name: "Diff Checker",
    slug: "diff-checker",
    category: "Developer",
    description: "Compare two text files for differences",
    dependencies: "diff-match-patch"
  },
  {
    id: "74",
    name: "WEBM to MP4",
    slug: "webm-to-mp4",
    category: "Converter",
    description: "Convert WEBM videos to MP4",
    dependencies: "FFmpeg"
  },
  {
    id: "76",
    name: "IP Address Lookup",
    slug: "ip-address-lookup",
    category: "Utility",
    description: "Find geolocation of IP address",
    dependencies: "MaxMind / IP-API"
  },
  {
    id: "77",
    name: "Brand Name Generator",
    slug: "brand-name-generator",
    category: "Branding",
    description: "Generate unique brand names",
    dependencies: "OpenAI API"
  },
  {
    id: "78",
    name: "AI Content Humanizer",
    slug: "ai-content-humanizer",
    category: "AI",
    description: "Bypass AI detectors and make text human-like",
    dependencies: "OpenAI API / Custom NLP"
  },
  {
    id: "79",
    name: "Photo Retoucher",
    slug: "photo-retoucher",
    category: "Image",
    description: "Retouch photos automatically",
    dependencies: "OpenCV"
  },
  {
    id: "80",
    name: "PDF Splitter",
    slug: "pdf-splitter",
    category: "PDF",
    description: "Extract pages from PDF",
    dependencies: "pdf-lib"
  },
  {
    id: "82",
    name: "Twitch Clip Downloader",
    slug: "twitch-clip-downloader",
    category: "Downloader",
    description: "Download clips from Twitch",
    dependencies: "Twitch API"
  },
  {
    id: "83",
    name: "Color Picker Extension",
    slug: "color-picker-extension",
    category: "Extension",
    description: "Pick colors from any webpage",
    dependencies: "Vanilla JS"
  },
  {
    id: "84",
    name: "Font Generator",
    slug: "font-generator",
    category: "Text",
    description: "Generate cool text fonts",
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
    description: "25-minute focus timer",
    dependencies: "Web Audio API / Vanilla JS"
  },
  {
    id: "89",
    name: "AI Video Summarizer",
    slug: "ai-video-summarizer",
    category: "AI",
    description: "Summarize long YouTube videos",
    dependencies: "YouTube API / OpenAI API"
  },
  {
    id: "90",
    name: "YouTube Transcript Generator",
    slug: "youtube-transcript-generator",
    category: "Transcription",
    description: "Get transcripts from YouTube videos",
    dependencies: "YouTube Data API"
  },
  {
    id: "91",
    name: "AI Audio Enhancer",
    slug: "ai-audio-enhancer",
    category: "AI",
    description: "Remove background noise from audio",
    dependencies: "Adobe Podcast API / Custom Model"
  },
  {
    id: "92",
    name: "EPUB to PDF",
    slug: "epub-to-pdf",
    category: "PDF",
    description: "Convert EPUB to PDF format",
    dependencies: "Calibre API"
  },
  {
    id: "93",
    name: "Color Picker Web",
    slug: "color-picker",
    category: "Design",
    description: "Extract colors from images or screen",
    dependencies: "Canvas API / EyeDropper API"
  },
  {
    id: "94",
    name: "AI Voice Cloning",
    slug: "ai-voice-cloning",
    category: "AI",
    description: "Clone voices from short audio samples",
    dependencies: "ElevenLabs API"
  },
  {
    id: "95",
    name: "AI Essay Writer",
    slug: "ai-essay-writer",
    category: "AI",
    description: "Generate high-quality academic essays",
    dependencies: "OpenAI API"
  },
  {
    id: "96",
    name: "Protect PDF",
    slug: "protect-pdf",
    category: "PDF",
    description: "Add password to PDF",
    dependencies: "pdf-lib"
  },
  {
    id: "97",
    name: "Invoice Generator",
    slug: "invoice-generator",
    category: "Finance",
    description: "Generate PDF invoices for freelancers",
    dependencies: "PDF-lib / Vue.js"
  },
  {
    id: "98",
    name: "Business Card Maker",
    slug: "business-card-maker",
    category: "Branding",
    description: "Design custom business cards",
    dependencies: "React / Canvas API"
  },
  {
    id: "99",
    name: "Regex Tester",
    slug: "regex-tester",
    category: "Developer",
    description: "Test regular expressions online",
    dependencies: "regex.js"
  },
  {
    id: "100",
    name: "AI Avatar Generator",
    slug: "ai-avatar-generator",
    category: "AI",
    description: "Generate custom avatars from selfies",
    dependencies: "Stable Diffusion API"
  },
  {
    id: "101",
    name: "Dice Roller",
    slug: "dice-roller",
    category: "Utility",
    description: "Virtual 3D dice roller",
    dependencies: "Three.js"
  },
  {
    id: "102",
    name: "Profit Margin Calculator",
    slug: "profit-margin-calculator",
    category: "Finance",
    description: "Calculate gross and net profit margins",
    dependencies: "Vanilla JS"
  },
  {
    id: "103",
    name: "Credit Card Generator",
    slug: "credit-card-generator",
    category: "Developer",
    description: "Generate valid test credit card numbers",
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
    description: "Download videos from Vimeo",
    dependencies: "yt-dlp"
  },
  {
    id: "106",
    name: "PDF to EPUB",
    slug: "pdf-to-epub",
    category: "PDF",
    description: "Convert PDF to EPUB format",
    dependencies: "Calibre API"
  },
  {
    id: "107",
    name: "Coin Flipper",
    slug: "coin-flipper",
    category: "Utility",
    description: "Virtual coin toss",
    dependencies: "CSS3 Animations"
  },
  {
    id: "108",
    name: "Image Colorizer",
    slug: "image-colorizer",
    category: "Image",
    description: "Colorize black and white photos",
    dependencies: "DeOldify"
  },
  {
    id: "109",
    name: "EXIF Data Remover",
    slug: "exif-data-remover",
    category: "Privacy",
    description: "Strip metadata from images",
    dependencies: "exifr / Piexifjs"
  },
  {
    id: "110",
    name: "AVI to MP4",
    slug: "avi-to-mp4",
    category: "Converter",
    description: "Convert AVI videos to MP4",
    dependencies: "FFmpeg"
  },
  {
    id: "111",
    name: "Video Compressor",
    slug: "video-compressor",
    category: "Video",
    description: "Reduce video file size without losing quality",
    dependencies: "FFmpeg / WebCodecs API"
  },
  {
    id: "112",
    name: "AI Face Swap",
    slug: "ai-face-swap",
    category: "AI",
    description: "Swap faces in photos for fun",
    dependencies: "InsightFace"
  },
  {
    id: "113",
    name: "JSON Formatter",
    slug: "json-formatter",
    category: "Developer",
    description: "Format and validate JSON data",
    dependencies: "JSONLint"
  },
  {
    id: "114",
    name: "XML Sitemap Generator",
    slug: "xml-sitemap-generator",
    category: "SEO",
    description: "Generate sitemap.xml for websites",
    dependencies: "Node.js / Cheerio"
  },
  {
    id: "115",
    name: "Meeting Minutes Generator",
    slug: "meeting-minutes-generator",
    category: "Transcription",
    description: "AI summaries of meeting transcripts",
    dependencies: "OpenAI API"
  },
  {
    id: "116",
    name: "AI Cover Letter Generator",
    slug: "ai-cover-letter-generator",
    category: "AI",
    description: "Create tailored cover letters for jobs",
    dependencies: "OpenAI API"
  },
  {
    id: "117",
    name: "AI Excel Formula Generator",
    slug: "ai-excel-formula-generator",
    category: "AI",
    description: "Generate Excel/Sheets formulas",
    dependencies: "OpenAI API"
  },
  {
    id: "118",
    name: "AI Product Description Generator",
    slug: "ai-product-description-generator",
    category: "AI",
    description: "Write descriptions for products",
    dependencies: "OpenAI API"
  },
  {
    id: "119",
    name: "AI Story Generator",
    slug: "ai-story-generator",
    category: "AI",
    description: "Write creative stories and plots",
    dependencies: "OpenAI API"
  },
  {
    id: "120",
    name: "AI Presentation Generator",
    slug: "ai-presentation-generator",
    category: "AI",
    description: "Generate PowerPoint slides from text",
    dependencies: "OpenAI API / PptxGenJS"
  },
  {
    id: "121",
    name: "JSON to CSV",
    slug: "json-to-csv",
    category: "Converter",
    description: "Convert JSON data to CSV format",
    dependencies: "PapaParse"
  },
  {
    id: "122",
    name: "Watermark PDF",
    slug: "watermark-pdf",
    category: "PDF",
    description: "Add text/image watermark to PDF",
    dependencies: "pdf-lib"
  },
  {
    id: "123",
    name: "PDF Page Delete",
    slug: "pdf-page-delete",
    category: "PDF",
    description: "Remove pages from PDF files",
    dependencies: "pdf-lib"
  },
  {
    id: "124",
    name: "PNG to SVG",
    slug: "png-to-svg",
    category: "Image",
    description: "Vectorize PNG images",
    dependencies: "Potrace"
  },
  {
    id: "125",
    name: "Email Signature Generator",
    slug: "email-signature-generator",
    category: "Branding",
    description: "Create professional email signatures",
    dependencies: "React"
  },
  {
    id: "126",
    name: "AI Music Generator",
    slug: "ai-music-generator",
    category: "AI",
    description: "Generate royalty-free background music",
    dependencies: "Suno API / Custom Model"
  },
  {
    id: "127",
    name: "Lorem Ipsum Generator",
    slug: "lorem-ipsum-generator",
    category: "Design",
    description: "Generate dummy text for layouts",
    dependencies: "Vanilla JS"
  },
  {
    id: "128",
    name: "Margin Calculator",
    slug: "margin-calculator",
    category: "Finance",
    description: "Calculate profit margins",
    dependencies: "Vanilla JS"
  },
  {
    id: "129",
    name: "Morse Code Translator",
    slug: "morse-code-translator",
    category: "Utility",
    description: "Convert text to Morse code and back",
    dependencies: "Vanilla JS"
  },
  {
    id: "130",
    name: "Cursive Text Generator",
    slug: "cursive-text-generator",
    category: "Text",
    description: "Generate cursive text",
    dependencies: "Vanilla JS"
  },
  {
    id: "131",
    name: "ROI Calculator",
    slug: "roi-calculator",
    category: "Finance",
    description: "Calculate Return on Investment",
    dependencies: "Vanilla JS"
  },
  {
    id: "132",
    name: "VAT Calculator",
    slug: "vat-calculator",
    category: "Finance",
    description: "Calculate Value Added Tax",
    dependencies: "Vanilla JS"
  },
  {
    id: "133",
    name: "Bilibili Video Downloader",
    slug: "bilibili-video-downloader",
    category: "Downloader",
    description: "Download videos from Bilibili",
    dependencies: "yt-dlp"
  },
  {
    id: "134",
    name: "Password Strength Checker",
    slug: "password-strength-checker",
    category: "Privacy",
    description: "Test password strength and entropy",
    dependencies: "zxcvbn"
  },
  {
    id: "135",
    name: "JS Minifier",
    slug: "js-minifier",
    category: "Developer",
    description: "Compress JavaScript code",
    dependencies: "Terser"
  },
  {
    id: "136",
    name: "Base64 Encode/Decode",
    slug: "base64-encode-decode",
    category: "Developer",
    description: "Encode or decode Base64 strings",
    dependencies: "btoa/atob"
  },
  {
    id: "137",
    name: "Text to Handwriting",
    slug: "text-to-handwriting",
    category: "Text",
    description: "Convert digital text to handwriting",
    dependencies: "Canvas API"
  },
  {
    id: "138",
    name: "Receipt Generator",
    slug: "receipt-generator",
    category: "Finance",
    description: "Create custom receipts",
    dependencies: "Canvas API / jsPDF"
  },
  {
    id: "139",
    name: "AI Thumbnail Maker",
    slug: "ai-thumbnail-maker",
    category: "AI",
    description: "Generate clickbait YouTube thumbnails",
    dependencies: "Canvas API / OpenAI API"
  },
  {
    id: "140",
    name: "Secure Note Sharer",
    slug: "secure-note-sharer",
    category: "Privacy",
    description: "Share self-destructing notes",
    dependencies: "Crypto API / Redis"
  },
  {
    id: "141",
    name: "Video to GIF",
    slug: "video-to-gif",
    category: "Video",
    description: "Convert MP4/WebM to GIF animations",
    dependencies: "FFmpeg / gif.js"
  },
  {
    id: "142",
    name: "Image to Base64",
    slug: "image-to-base64",
    category: "Developer",
    description: "Convert image to Base64 string",
    dependencies: "FileReader API"
  },
  {
    id: "143",
    name: "Subtitle Translator",
    slug: "subtitle-translator",
    category: "Video",
    description: "Translate SRT/VTT files",
    dependencies: "Google Translate API"
  },
  {
    id: "144",
    name: "IBAN Validator",
    slug: "iban-validator",
    category: "Finance",
    description: "Validate International Bank Account Numbers",
    dependencies: "ibantools"
  },
  {
    id: "145",
    name: "AI Flowchart Maker",
    slug: "ai-flowchart-maker",
    category: "AI",
    description: "Generate flowcharts from text",
    dependencies: "Mermaid.js / OpenAI API"
  },
  {
    id: "146",
    name: "AI Code Explainer",
    slug: "ai-code-explainer",
    category: "AI",
    description: "Explain complex code snippets",
    dependencies: "OpenAI API"
  },
  {
    id: "147",
    name: "AI SQL Generator",
    slug: "ai-sql-generator",
    category: "AI",
    description: "Generate SQL queries from natural language",
    dependencies: "OpenAI API"
  },
  {
    id: "148",
    name: "AI Recipe Generator",
    slug: "ai-recipe-generator",
    category: "AI",
    description: "Generate recipes based on ingredients",
    dependencies: "OpenAI API"
  },
  {
    id: "149",
    name: "AI Domain Name Generator",
    slug: "ai-domain-name-generator",
    category: "AI",
    description: "Generate available domain names",
    dependencies: "OpenAI API / Domain API"
  },
  {
    id: "150",
    name: "AI Mind Map Generator",
    slug: "ai-mind-map-generator",
    category: "AI",
    description: "Create mind maps from prompts",
    dependencies: "OpenAI API / React Flow"
  },
  {
    id: "151",
    name: "CSV to JSON",
    slug: "csv-to-json",
    category: "Converter",
    description: "Convert CSV data to JSON format",
    dependencies: "PapaParse"
  },
  {
    id: "152",
    name: "Rotate PDF",
    slug: "rotate-pdf",
    category: "PDF",
    description: "Rotate PDF pages",
    dependencies: "pdf-lib"
  },
  {
    id: "153",
    name: "Extract Images from PDF",
    slug: "extract-images-from-pdf",
    category: "PDF",
    description: "Extract all images from a PDF",
    dependencies: "pdf.js"
  },
  {
    id: "154",
    name: "SQL Formatter",
    slug: "sql-formatter",
    category: "Developer",
    description: "Beautify SQL queries",
    dependencies: "sql-formatter"
  },
  {
    id: "155",
    name: "UUID Generator",
    slug: "uuid-generator",
    category: "Developer",
    description: "Generate v4 UUIDs",
    dependencies: "uuid"
  },
  {
    id: "156",
    name: "HEX to RGB Converter",
    slug: "hex-to-rgb-converter",
    category: "Design",
    description: "Convert color codes",
    dependencies: "Vanilla JS"
  },
  {
    id: "157",
    name: "BMR Calculator",
    slug: "bmr-calculator",
    category: "Health",
    description: "Basal Metabolic Rate calculator",
    dependencies: "Vanilla JS"
  },
  {
    id: "158",
    name: "Meta Tag Generator",
    slug: "meta-tag-generator",
    category: "SEO",
    description: "Generate SEO meta tags",
    dependencies: "Vanilla JS"
  },
  {
    id: "159",
    name: "Text to Binary",
    slug: "text-to-binary",
    category: "Developer",
    description: "Convert text to binary code",
    dependencies: "Vanilla JS"
  },
  {
    id: "160",
    name: "Binary to Text",
    slug: "binary-to-text",
    category: "Developer",
    description: "Convert binary code to text",
    dependencies: "Vanilla JS"
  },
  {
    id: "161",
    name: "Break-Even Calculator",
    slug: "break-even-calculator",
    category: "Finance",
    description: "Calculate break-even point",
    dependencies: "Vanilla JS"
  },
  {
    id: "162",
    name: "Conversion Rate Calculator",
    slug: "conversion-rate-calculator",
    category: "Marketing",
    description: "Calculate website conversion rates",
    dependencies: "Vanilla JS"
  },
  {
    id: "163",
    name: "CPM Calculator",
    slug: "cpm-calculator",
    category: "Marketing",
    description: "Calculate Cost Per Mille for ads",
    dependencies: "Vanilla JS"
  },
  {
    id: "164",
    name: "ROAS Calculator",
    slug: "roas-calculator",
    category: "Marketing",
    description: "Calculate Return on Ad Spend",
    dependencies: "Vanilla JS"
  },
  {
    id: "165",
    name: "Podcast Transcription",
    slug: "podcast-transcription",
    category: "Transcription",
    description: "Transcribe podcast episodes",
    dependencies: "Whisper API"
  },
  {
    id: "166",
    name: "CSS Minifier",
    slug: "css-minifier",
    category: "Developer",
    description: "Compress CSS code",
    dependencies: "clean-css"
  },
  {
    id: "167",
    name: "Markdown to HTML",
    slug: "markdown-to-html",
    category: "Converter",
    description: "Convert Markdown to HTML code",
    dependencies: "marked.js"
  },
  {
    id: "168",
    name: "Compare PDF Files",
    slug: "compare-pdf-files",
    category: "PDF",
    description: "Compare two PDFs for differences",
    dependencies: "pdf.js"
  },
  {
    id: "169",
    name: "Favicon Generator",
    slug: "favicon-generator",
    category: "Design",
    description: "Convert images to .ico and app icons",
    dependencies: "Sharp / jimp"
  },
  {
    id: "170",
    name: "Case Converter",
    slug: "case-converter",
    category: "Text",
    description: "Convert to UPPER/lower/Title/camel case",
    dependencies: "Vanilla JS"
  },
  {
    id: "171",
    name: "Keyword Density Checker",
    slug: "keyword-density-checker",
    category: "SEO",
    description: "Analyze text for keyword frequency",
    dependencies: "Vanilla JS"
  },
  {
    id: "172",
    name: "Base64 to Image",
    slug: "base64-to-image",
    category: "Developer",
    description: "Convert Base64 string to image",
    dependencies: "Vanilla JS"
  },
  {
    id: "173",
    name: "Flip Image",
    slug: "flip-image",
    category: "Image",
    description: "Flip image horizontally/vertically",
    dependencies: "Canvas API"
  },
  {
    id: "174",
    name: "MD5 Hash Generator",
    slug: "md5-hash-generator",
    category: "Developer",
    description: "Generate MD5 hash from string",
    dependencies: "CryptoJS"
  },
  {
    id: "175",
    name: "HTML Minifier",
    slug: "html-minifier",
    category: "Developer",
    description: "Compress HTML code",
    dependencies: "html-minifier"
  },
  {
    id: "176",
    name: "Barcode Generator",
    slug: "barcode-generator",
    category: "Utility",
    description: "Generate EAN/UPC/Code39 barcodes",
    dependencies: "JsBarcode"
  },
  {
    id: "177",
    name: "AI Regex Generator",
    slug: "ai-regex-generator",
    category: "AI",
    description: "Generate regular expressions from text",
    dependencies: "OpenAI API"
  },
  {
    id: "178",
    name: "AI Business Idea Generator",
    slug: "ai-business-idea-generator",
    category: "AI",
    description: "Generate startup ideas",
    dependencies: "OpenAI API"
  },
  {
    id: "179",
    name: "AI Slogan Generator",
    slug: "ai-slogan-generator",
    category: "AI",
    description: "Create catchy slogans for brands",
    dependencies: "OpenAI API"
  },
  {
    id: "180",
    name: "AI Poem Generator",
    slug: "ai-poem-generator",
    category: "AI",
    description: "Write poems in various styles",
    dependencies: "OpenAI API"
  },
  {
    id: "181",
    name: "PGP Key Generator",
    slug: "pgp-key-generator",
    category: "Privacy",
    description: "Generate PGP public and private keys",
    dependencies: "OpenPGP.js"
  },
  {
    id: "182",
    name: "Add Page Numbers to PDF",
    slug: "add-page-numbers-to-pdf",
    category: "PDF",
    description: "Add page numbers to PDF documents",
    dependencies: "pdf-lib"
  },
  {
    id: "183",
    name: "HTML to Markdown",
    slug: "html-to-markdown",
    category: "Converter",
    description: "Convert HTML to Markdown text",
    dependencies: "Turndown"
  },
  {
    id: "184",
    name: "Reverse Text Generator",
    slug: "reverse-text-generator",
    category: "Text",
    description: "Reverse text or words",
    dependencies: "Vanilla JS"
  },
  {
    id: "185",
    name: "Zalgo Text Generator",
    slug: "zalgo-text-generator",
    category: "Text",
    description: "Generate glitch text",
    dependencies: "Vanilla JS"
  },
  {
    id: "186",
    name: "Invisible Text Generator",
    slug: "invisible-text-generator",
    category: "Text",
    description: "Generate invisible characters",
    dependencies: "Vanilla JS"
  },
  {
    id: "187",
    name: "LTV Calculator",
    slug: "ltv-calculator",
    category: "Finance",
    description: "Calculate Customer Lifetime Value",
    dependencies: "Vanilla JS"
  },
  {
    id: "188",
    name: "CAC Calculator",
    slug: "cac-calculator",
    category: "Finance",
    description: "Calculate Customer Acquisition Cost",
    dependencies: "Vanilla JS"
  },
  {
    id: "189",
    name: "Burn Rate Calculator",
    slug: "burn-rate-calculator",
    category: "Finance",
    description: "Calculate startup burn rate and runway",
    dependencies: "Vanilla JS"
  },
  {
    id: "190",
    name: "Net Promoter Score Calculator",
    slug: "net-promoter-score-calculator",
    category: "Marketing",
    description: "Calculate NPS from survey data",
    dependencies: "Vanilla JS"
  },
  {
    id: "191",
    name: "XML to CSV",
    slug: "xml-to-csv",
    category: "Converter",
    description: "Convert XML data to CSV format",
    dependencies: "xml2js / PapaParse"
  },
  {
    id: "192",
    name: "PDF Metadata Editor",
    slug: "pdf-metadata-editor",
    category: "PDF",
    description: "Edit PDF properties and metadata",
    dependencies: "pdf-lib"
  },
  {
    id: "193",
    name: "SVG Editor",
    slug: "svg-editor",
    category: "Design",
    description: "Edit and optimize SVG files online",
    dependencies: "SVGO / Fabric.js"
  },
  {
    id: "194",
    name: "Robots.txt Generator",
    slug: "robots-txt-generator",
    category: "SEO",
    description: "Create robots.txt files",
    dependencies: "Vanilla JS"
  },
  {
    id: "195",
    name: "SaaS Pricing Calculator",
    slug: "saas-pricing-calculator",
    category: "Finance",
    description: "Optimize SaaS pricing tiers",
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
    description: "Generate random MAC addresses",
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
    description: "Convert XML data to JSON format",
    dependencies: "xml2js"
  },
  {
    id: "200",
    name: "Braille Translator",
    slug: "braille-translator",
    category: "Text",
    description: "Translate text to Braille",
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
    description: "Client-side wallet sizing and masking helper",
    dependencies: "Canvas API"
  },
  {
    id: "203",
    name: "PAN Card Resizer",
    slug: "pan-card-resizer",
    category: "indian-utilities",
    description: "NSDL photo/signature formatting",
    dependencies: "Canvas API"
  },
  {
    id: "204",
    name: "KB Image Compressor",
    slug: "kb-image-compressor",
    category: "indian-utilities",
    description: "Strict 20KB/50KB/100KB target compression",
    dependencies: "browser-image-compression"
  }

,
  {
    id: "210",
    name: "Live Transcription",
    slug: "live-transcription",
    category: "Transcription",
    description: "Real-time mic-to-text using Web Speech API",
    dependencies: "Web Speech API"
  },
  {
    id: "211",
    name: "Image Bulk Converter",
    slug: "image-bulk-converter",
    category: "Image",
    description: "Convert 100s of images at once + ZIP download",
    dependencies: "browser-image-compression / jszip"
  },
  {
    id: "212",
    name: "eSign PDF",
    slug: "esign-pdf",
    category: "PDF",
    description: "Legally sign PDF documents online",
    dependencies: "pdf-lib / fabric"
  },
  {
    id: "213",
    name: "PDF OCR (Scanned Docs)",
    slug: "pdf-ocr",
    category: "PDF",
    description: "Extract text from scanned PDFs",
    dependencies: "tesseract.js"
  },
  {
    id: "214",
    name: "PDF Form Filler",
    slug: "pdf-form-filler",
    category: "PDF",
    description: "Fill & sign PDF forms online",
    dependencies: "pdf-lib"
  },
  {
    id: "215",
    name: "Multi-Model AI Chat",
    slug: "multi-model-ai-chat",
    category: "AI",
    description: "Claude + GPT-4o + Gemini in one interface",
    dependencies: "AI APIs"
  },
  {
    id: "216",
    name: "AI Document Chat (RAG)",
    slug: "ai-document-chat",
    category: "AI",
    description: "Upload PDF/doc and ask questions",
    dependencies: "CF Vectorize"
  },
  {
    id: "217",
    name: "AI Video Subtitler",
    slug: "ai-video-subtitler",
    category: "AI",
    description: "Auto-generate burned-in subtitles on video",
    dependencies: "Whisper API"
  },
  {
    name: 'AI Code Generator',
    slug: 'ai-code-generator',
    description: 'Generate code in 50+ languages.',
    category: 'AI',
    id:  "218",
    dependencies: 'None'
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
    name: 'AI Blog Title Generator',
    slug: 'ai-blog-title-generator',
    description: 'Generate viral blog titles.',
    category: 'AI',
    id:  "222",
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
    name: 'AI Hashtag Generator',
    slug: 'ai-hashtag-generator',
    description: 'Generate viral hashtags for social media.',
    category: 'AI',
    id:  "224",
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
    name: 'AI Chat Hub',
    slug: 'ai-chat-hub',
    description: 'Centralized dashboard for all AI models.',
    category: 'AI',
    id:  "226",
    dependencies: 'None'
  },
  {
    name: 'GST Invoice Generator',
    slug: 'gst-invoice-generator',
    description: 'Generate valid GST invoices for India.',
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
    name: 'AI Changelog Generator',
    slug: 'ai-changelog-generator',
    description: 'Generate release notes from commits.',
    category: 'AI',
    id:  "229",
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
    description: 'Lookup bank branch details, address, and contact using IFSC.',
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
];

const proSlugs = [
  "tiktok-video-downloader", "youtube-downloader", "instagram-video-downloader",
  "facebook-video-downloader", "twitter-video-downloader", "soundcloud-downloader",
  "ai-translator", "pdf-to-word", "ai-image-generator", "logo-maker", "mp4-to-mp3",
  "pdf-compressor", "word-to-pdf", "ai-writing-assistant", "jpg-to-pdf",
  "plagiarism-checker", "pdf-to-jpg", "pdf-to-ppt", "background-remover",
  "object-remover", "ppt-to-pdf", "pdf-merger", "excel-to-pdf", "video-to-text-transcription",
  "social-media-post-maker", "svg-editor", "business-card-maker", "pdf-to-excel",
  "unlock-pdf", "protect-pdf", "epub-to-pdf", "pdf-to-epub", "compare-pdf-files",
  "extract-images-from-pdf", "email-signature-generator", "color-picker",
  "ai-thumbnail-maker", "mp3-compressor", "gif-to-mp4", "video-trimmer",
  "video-watermark-adder", "ai-blog-title-generator", "ai-hashtag-generator",
  "prompt-library-generator", "ai-chat-hub", "ai-changelog-generator",
  "saas-pricing-calculator", "employee-turnover-calculator",
  "pdf-to-html", "html-to-pdf", "generic-pdf-processor"
];

export const toolsRegistry: ToolMetadata[] = rawToolsRegistry.map(tool => ({
  ...tool,
  isPro: proSlugs.includes(tool.slug)
}));

export const getToolBySlug = (slug: string) => toolsRegistry.find(t => t.slug === slug);
export const getToolsByCategory = (category: string) => toolsRegistry.filter(t => t.category === category);

export const getToolByCategoryAndSlug = (category: string, slug: string) => toolsRegistry.find(t => t.category.toLowerCase().replace(/\s+/g, '-') === category && t.slug === slug);
