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
    description: 'Overlays custom text captions onto images with control over font, size, color, alignment, opacity, and rotation angle. Social media content creators and small business owners use it to add branding watermarks, quote overlays, or promotional call-to-action text to product photos. It renders the final output at the original image resolution, so no quality is lost during the text overlay process.',
    category: "Image",
    slug: "add-text-to-photo",
    dependencies: "Canvas API",
  },
  {
    id: "batch-edit-1",
    name: "Batch Image Editor",
    description: 'Applies resize, crop, rotate, format conversion, and compression settings to dozens of images simultaneously with one click. E-commerce managers and photographers uploading product catalogs or event galleries use it to standardize entire image sets before publishing. It provides a live preview grid of all transformation effects before you commit to processing the batch.',
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
    description: 'Stitches a sequence of uploaded still images (PNG, JPG, or WebP) into a single animated GIF, with configurable frame delay, loop count, and frame order (drag-to-reorder). UI/UX designers and motion graphic artists use it to create quick interface mockup walkthroughs and before-after comparisons without learning animation software. The tool auto-detects image dimensions and warns when frames have mismatched sizes, offering to pad smaller frames to the largest canvas size.',
    category: "Video",
    slug: "image-to-gif",
    dependencies: "ffmpeg",
  },
  {
    id: "mp4-gif-1",
    name: "MP4 to GIF",
    description: 'Transcodes an MP4 video into an animated GIF with controls for start and end time, frame-skipping rate, and output width. Game developers and community managers use it to share short looping clips of gameplay, UI animations, or bug demonstrations on platforms like Discord and GitHub issues that auto-play GIFs. The tool limits output to 15 seconds and suggests the optimal frame-skip value based on input duration to keep file sizes under 5 MB.',
    category: "Video",
    slug: "mp4-to-gif",
    dependencies: "ffmpeg",
  },
  {
    id: "webm-gif-1",
    name: "WEBM to GIF",
    description: 'Converts a WebM video into an animated GIF with adjustable quality (number of colors from 32 to 256) and optional dithering algorithms (Floyd-Steinberg, pattern, or none). Open-source contributors and video editors who work with WebM-encoded screen recordings use it to produce GIF versions for documentation and blog posts. The converter strips the audio stream (irrelevant for GIF) before processing, reducing conversion time compared to general video converters.',
    category: "Video",
    slug: "webm-to-gif",
    dependencies: "ffmpeg",
  },
  {
    id: "mov-gif-1",
    name: "MOV to GIF",
    description: 'Converts an uploaded MOV video file into an animated GIF, allowing the user to trim start and end times and set the output frame rate and dimensions. Social media designers and product marketers use it to create lightweight, looped product demonstrations and memes that play in any browser without video codec support. The converter applies a palette-optimization step and dithering to reduce GIF file size while maintaining visual quality, and reports the final file size before download.',
    category: "Video",
    slug: "mov-to-gif",
    dependencies: "ffmpeg",
  },
  {
    id: "vid-mp3-1",
    name: "Video to MP3 Converter",
    description: 'Extracts the audio track from uploaded video files (MP4, MOV, AVI, WebM) and encodes it as a high-quality MP3 file. Content creators and podcasters use it to repurpose video content into audio-only formats for distribution on platforms like Spotify or Apple Podcasts. The tool preserves the original audio bitrate up to 320kbps and automatically strips all video data to produce the smallest possible MP3 file.',
    category: "Video",
    slug: "video-to-mp3",
    dependencies: "ffmpeg",
  },
  {
    id: "mp3-ogg-1",
    name: "MP3 to OGG Converter",
    description: 'Transcodes an MP3 audio file to the OGG Vorbis format with adjustable quality slider from -1 (lowest) to 10 (highest), corresponding to bitrates from 45 kbps to 500 kbps. Audiophiles and open-source software users who prefer patent-free audio codecs use it to convert their music libraries for use on Linux-based devices or Rhythmbox-compatible players. The converter preserves ID3 tags (title, artist, album) by mapping them to OGG Vorbis comments during transcoding.',
    category: "Audio",
    slug: "mp3-to-ogg",
    dependencies: "ffmpeg",
  },
  {
    id: "wav-comp-1",
    name: "WAV Compressor",
    description: 'Reduces the file size of uploaded WAV audio files by lowering the bit depth (16 or 8 bit) and sample rate (44100, 22050, or 11025 Hz), with a real-time preview of estimated output size before encoding. Podcast producers and field recording hobbyists use it to shrink raw studio-quality WAV files into smaller, web-ready versions for uploading to hosting platforms with file size limits. The compressor shows a frequency-spectrum comparison of the original versus compressed audio so users can judge quality trade-offs audibly and visually.',
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
    description: 'Transforms valid JSON documents into well-formed XML using customizable root-element naming and array-handling rules. API developers migrating legacy SOAP endpoints to REST and data engineers normalizing cross-format feeds use it to avoid manual transcription errors. It preserves nested object depth as nested XML elements so the structure stays lossless.',
    category: "Developer",
    slug: "json-to-xml",
    dependencies: "xml2js",
  },
  {
    id: "time-conv-1",
    name: "Time Converter",
    description: 'Converts a given date and time between any two time zones from a database of 400+ IANA time zones, and simultaneously displays it in Unix timestamp, ISO 8601, and 12/24-hour formats. Remote project managers and distributed engineering teams use it to schedule meetings across time zones and translate server log timestamps into local time. The converter automatically accounts for daylight saving time changes and indicates when a queried time falls within a DST transition gap.',
    category: "Converter",
    slug: "time-converter",
    dependencies: "None",
  },
  {
    id: "time-pst-est-1",
    name: "PST to EST Converter",
    description: 'Converts a user-entered Pacific Time value to Eastern Time, displaying the result as a clock face and a calendar date that correctly advances or regresses across midnight. East-coast project managers coordinating with west-coast teams use it to avoid 3-hour scheduling errors when booking cross-country calls. The converter highlights specific business hours overlap (8 AM–5 PM PST vs 11 AM–8 PM EST) so users instantly see the feasible meeting window.',
    category: "Converter",
    slug: "pst-to-est",
    dependencies: "None",
  },
  {
    id: "time-cst-est-1",
    name: "CST to EST Converter",
    description: 'Converts a user-entered Central Time value to Eastern Time, showing both the direct conversion and a side-by-side comparison clock. Regional sales representatives and logistics coordinators who operate across the Central and Eastern time zones use it to accurately schedule deliveries and client calls. The tool applies DST rules for both zones independently, correctly handling edge cases like the second Sunday in March when only part of the country has sprung forward.',
    category: "Converter",
    slug: "cst-to-est",
    dependencies: "None",
  },
  {
    id: "conv-lbs-kg-1",
    name: "Lbs to Kg Converter",
    description: 'Converts a weight value from pounds to kilograms with precision up to three decimal places and displays the inverse conversion (kg to lbs) simultaneously for reference. International travelers and fitness enthusiasts using mixed equipment (US dumbbells with metric programs) rely on it to normalize weight measurements. The converter shows both the raw calculation and a common-approximation table (e.g., 1 lb ≈ 0.45 kg, 5 lb ≈ 2.27 kg) for mental estimation.',
    category: "Converter",
    slug: "lbs-to-kg",
    dependencies: "None",
  },
  {
    id: "conv-kg-lbs-1",
    name: "Kg to Lbs Converter",
    description: 'Converts a weight value from kilograms to pounds with three-decimal precision and auto-suggests common plate-loading combinations for barbell exercises. International athletes and nutrition professionals who work with metric food labels but US-based gym equipment use it for accurate weight conversions. The converter additionally lists equivalent weights in stones, a format still widely used in UK medical and fitness contexts.',
    category: "Converter",
    slug: "kg-to-lbs",
    dependencies: "None",
  },
  {
    id: "conv-ft-m-1",
    name: "Feet to Meters Converter",
    description: 'Converts a length from feet to meters using the exact conversion factor 1 ft = 0.3048 m, displaying the result in both decimal and fractional meters. Architects and civil engineers working across imperial and metric blueprints use it to verify dimensions during international construction projects. The converter accepts compound inputs like 5’10” and parses them into decimal feet before performing the conversion, handling height measurements on a single line.',
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
    description: 'Removes or adjusts page margins on every page of an uploaded PDF by accepting numeric values (or presets like ‘remove 1 inch all sides’) for top, bottom, left, and right boundaries. Publishing professionals and document formatters use it to trim excess white space from slide-deck exports, remove crop marks from print PDFs, or standardize page dimensions before merging documents. The tool applies the crop non-destructively—it sets the MediaBox rather than physically discarding content—so nothing outside the crop area is permanently lost.',
    category: "PDF",
    slug: "crop-pdf",
    dependencies: "pdf-lib",
  },
  {
    id: "pdf-org-1",
    name: "Organize PDF Pages",
    description: 'Lets users drag-and-drop PDF page thumbnails into a new order, rotate individual pages, and delete unwanted pages via checkboxes, then exports the modified document. Office administrators and legal professionals use it to reorganize scanned contracts, remove blank pages from scanned batches, and rotate mis-oriented phone scans before sharing. The tool renders a thumbnail strip of all pages on load and supports keyboard shortcuts (Shift+click for range selection) for bulk operations on large documents.',
    category: "PDF",
    slug: "organize-pdf",
    dependencies: "pdf-lib",
  },
  {
    id: "pdf-ext-1",
    name: "Extract PDF Pages",
    description: 'Accepts a PDF along with a page range or a comma-separated list of individual page numbers and extracts only those pages into a new PDF file. Legal assistants and academic researchers use it to pull specific chapters, exhibits, or appendices from large multi-page documents without opening a PDF editor. The extraction preserves all original formatting, embedded fonts, hyperlinks, and interactive form fields from the source pages.',
    category: "PDF",
    slug: "extract-pages-from-pdf",
    dependencies: "pdf-lib",
  },
  {
    id: "pdf-heic-1",
    name: "HEIC to PDF",
    description: 'Converts High-Efficiency Image Container (HEIC) photos from iPhones and iPads into standard PDF documents. Mac and iOS users who need to submit device photos to insurance claims, rental applications, or school portals that reject HEIC format use it to avoid manual re-export. It preserves EXIF orientation metadata so vertical photos do not appear rotated in the resulting PDF.',
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
    description: 'Scans and clears browser cookies, localStorage, sessionStorage, and cached data for the current site. Privacy-conscious users in India use it to remove tracking data, clear login sessions, and free up browser storage across multiple domains. Everything runs locally on-device: no data is transmitted or stored on any server.',
    dependencies: 'Vanilla JS'
  },
  {
    id: "yt-dl-1",
    name: "YouTube Downloader",
    description: 'Downloads YouTube videos as MP4 files or extracts audio as MP3 by parsing the video page for available stream URLs. Content creators, educators, and offline viewers use it to save tutorials, music videos, or lectures for playback without an internet connection. It supports multiple resolutions up to 4K and preserves the original audio quality when extracting MP3 tracks.',
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
    description: 'Downloads public Facebook videos by parsing the page source to extract the highest-quality MP4 stream. Social media managers and content curators use it to archive videos or repurpose content offline. It supports both single videos and album embeds without requiring any login or API key.',
    dependencies: "yt-dlp"
  },
  {
    id: "7",
    name: "AI Translator",
    slug: "ai-translator",
    category: "AI",
    description: 'Detects source language automatically and translates text between 100+ languages using advanced neural machine translation. Marketing teams, customer support agents, and travelers use it to communicate across language barriers in real time. It preserves formatting, idioms, and tone better than generic translators by contextualizing each sentence against the full document.',
    dependencies: "Google Cloud Translation API"
  },
  {
    id: "8",
    name: "Grammar Checker Extension",
    slug: "grammar-checker-extension",
    category: "Extension",
    description: 'Generates a complete, installable browser extension (Chrome, Edge, Firefox) that highlights grammar, punctuation, and style errors in any text input field on the web. Freelance writers and content marketers use it to proofread emails, blog posts, and social media captions without leaving their browser tab. The extension checks text locally for basic errors first before making API calls for advanced stylistic suggestions, keeping sensitive content on-device.',
    dependencies: "LanguageTool API"
  },
  {
    id: "9",
    name: "PDF to Word",
    slug: "pdf-to-word",
    category: "PDF",
    description: 'Extracts text content and basic formatting from PDF files and assembles them into editable .docx Word documents. Office workers, students, and researchers who receive read-only PDF contracts or papers and need to quote, annotate, or rewrite sections use it to regain editability. It preserves hyperlinks and list numbering from the source PDF so reformatting effort is minimal.',
    dependencies: "pdf2docx / PDF.js"
  },
  {
    id: "10",
    name: "AI Image Generator",
    slug: "ai-image-generator",
    category: "AI",
    description: 'Transforms text prompts into high-resolution images using advanced diffusion models. Designers, marketers, and content creators use it to rapidly prototype visuals without needing graphic design skills. It supports multiple aspect ratios and artistic styles, from photorealistic to oil painting.',
    dependencies: "Stable Diffusion API"
  },
  {
    id: "11",
    name: "Speed Test",
    slug: "speed-test",
    category: "Utility",
    description: 'Measures your internet connection’s download speed, upload speed, and latency by transferring real test data to geographically distributed servers. Anyone troubleshooting slow Wi-Fi, verifying ISP performance, or deciding whether their connection supports 4K streaming uses this tool. It runs a multi-threaded test that saturates high-bandwidth connections (1 Gbps+), unlike single-threaded speed tests that under-report fiber speeds.',
    dependencies: "WebSockets / WebRTC"
  },
  {
    id: "12",
    name: "Twitter Video Downloader",
    slug: "twitter-video-downloader",
    category: "Downloader",
    description: 'Extracts native video files from tweets by resolving the embedded media URL from Twitter’s CDN. Marketers and journalists use it to save viral clips, interviews, or announcements for offline reference. It preserves the original resolution and audio track without re-encoding.',
    dependencies: "yt-dlp"
  },
  {
    id: "14",
    name: "Compress Image to 50KB",
    slug: "compress-image-to-50kb",
    category: "Image",
    description: 'Reduces image file size to 50 KB or below by adjusting JPEG quality, reducing pixel dimensions, or stripping metadata—whichever combination hits the target. Web developers and e-commerce sellers use it to meet strict upload limits on listing portals and CMS platforms. It shows a live preview slider so you can balance quality against file size before exporting.',
    dependencies: "browser-image-compression"
  },
  {
    id: "15",
    name: "Currency Converter",
    slug: "currency-converter",
    category: "Finance",
    description: 'Converts between 160+ world currencies using real-time exchange rates sourced from central banks and financial data providers. Travelers, e-commerce sellers, and international freelancers use it to get accurate live rates without manually searching the web. It auto-detects your local currency via IP geolocation and caches the latest rates for offline use.',
    dependencies: "ExchangeRate-API"
  },
  {
    id: "16",
    name: "Logo Maker",
    slug: "logo-maker",
    category: "Branding",
    description: 'Logo Maker provides a drag-and-drop canvas with shape libraries, text tools, and icon collections for building brand logos. Small business owners and startup founders use it to quickly prototype logo concepts without hiring a designer. It auto-generates color palette suggestions based on your chosen shape and font combinations.',
    dependencies: "Fabric.js / Canvas API"
  },
  {
    id: "17",
    name: "MP4 to MP3",
    slug: "mp4-to-mp3",
    category: "Converter",
    description: 'Extracts the audio track from MP4 video files and saves it as a standalone MP3 file, preserving original bitrate and sample rate. Content creators, podcasters, and music enthusiasts use it to grab soundtracks, interview audio, or lecture recordings from video files without re-encoding. It supports batch processing and lets you preview audio before downloading.',
    dependencies: "FFmpeg"
  },
  {
    id: "pdf-comp-1",
    name: "PDF Compressor",
    description: 'Reduces PDF file size by intelligently compressing embedded images, removing redundant metadata, and optimizing object streams. Anyone who emails PDFs or uploads them to portals with strict size limits uses this to fit files within attachment restrictions. It offers three compression tiers (low, medium, high) with a live before/after size preview so you pick the right trade-off.',
    category: "PDF",
    slug: "pdf-compressor",
    dependencies: "Ghostscript / PDF-lib"
  },
  {
    id: "19",
    name: "Word to PDF",
    slug: "word-to-pdf",
    category: "PDF",
    description: 'Converts .docx and .doc files to PDF while preserving fonts, tables, images, headers, and embedded formatting. Office workers, legal professionals, and publishers use it to lock document layout before sharing or printing. The conversion engine runs locally—files never leave your machine, which is critical for confidential legal or HR documents.',
    dependencies: "LibreOffice API / CloudConvert API"
  },
  {
    id: "20",
    name: "AI Writing Assistant",
    slug: "ai-writing-assistant",
    category: "AI",
    description: 'Provides real-time suggestions to refine grammar, tone, and structure across any text input. Bloggers, copywriters, and students rely on it to overcome writer’s block and polish their drafts. Its context-aware engine adapts suggestions to match your specific audience and industry vocabulary.',
    dependencies: "OpenAI API / LangChain"
  },
  {
    id: "21",
    name: "Percentage Calculator",
    slug: "percentage-calculator",
    category: "Finance",
    description: 'Computes percentage values, percentage increases and decreases, and what-percent-of-what relationships with precise decimal arithmetic. Shoppers comparing discounts, sales teams calculating commission splits, and analysts normalizing data rely on it for quick mental-math verification. It supports chain calculations so each result feeds into the next operation without re-entering numbers.',
    dependencies: "Vanilla JS"
  },
  {
    id: "22",
    name: "JPG to PDF",
    slug: "jpg-to-pdf",
    category: "PDF",
    description: 'Merges one or more JPG images into a single multi-page PDF file in the order you arrange them. Photographers, real-estate agents, and administrative assistants use it to bundle scan pages or photo portfolios into a single shareable document. You can adjust image compression per page to balance file size against print-quality output.',
    dependencies: "jsPDF / Canvas API"
  },
  {
    id: "25",
    name: "Plagiarism Checker",
    slug: "plagiarism-checker",
    category: "Text",
    description: 'Compares submitted text against an offline reference corpus and highlights passages that match existing sources with a similarity percentage. Teachers, editors, and content publishers use it to screen submissions before publication or grading. It runs entirely in the browser—no text is ever uploaded to a server, keeping sensitive documents private.',
    dependencies: "Copyscape API / Custom API"
  },
  {
    id: "26",
    name: "Age Calculator",
    slug: "age-calculator",
    category: "Utility",
    description: 'Computes exact age in years, months, days, hours, minutes, and seconds from a given birth date relative to any target date. HR professionals, healthcare administrators, and parents use it for eligibility checks, milestone tracking, or simply satisfying curiosity. It handles leap years, timezone offsets, and historical calendar quirks so the result is legally precise.',
    dependencies: "Date-fns / Moment.js"
  },
  {
    id: "27",
    name: "HEIC to JPG",
    slug: "heic-to-jpg",
    category: "Image",
    description: 'Decodes Apple HEIC photos and converts them to universally compatible JPG files while preserving EXIF metadata like location and camera settings. iPhone and iPad users who share photos with Windows or Android contacts use this to eliminate compatibility issues. It processes Live Photos by extracting the primary still frame rather than throwing errors like most converters.',
    dependencies: "heic2any"
  },
  {
    id: "28",
    name: "PDF to JPG",
    slug: "pdf-to-jpg",
    category: "PDF",
    description: 'Renders each PDF page as a high-quality JPG image, preserving layout, fonts, and embedded graphics exactly as they appear. Presenters and educators use it to extract single slides or pages for embedding into slide decks, social media posts, or thumbnails. It supports custom DPI settings up to 600 so you can produce print-ready images from any PDF.',
    dependencies: "PDF.js / Canvas API"
  },
  {
    id: "29",
    name: "PDF to PPT",
    slug: "pdf-to-ppt",
    category: "PDF",
    description: 'Converts PDF content—including text, images, and vector graphics—into editable PowerPoint slides with preserved layout structure. Business professionals and consultants who receive reports as PDFs but need to present or remix the content in PowerPoint rely on this. It maintains text as editable placeholder boxes rather than flattening everything into background images.',
    dependencies: "pdf2json / PptxGenJS"
  },
  {
    id: "30",
    name: "Fancy Text Generator",
    slug: "fancy-text-generator",
    category: "Text",
    description: 'Creates stylized Unicode text in 40+ decorative styles including double-struck, bubble, cursive, gothic, and small caps. Social-media influencers and Discord/Telegram users use it to make their handles and messages stand out in crowded feeds. Every style includes a one-tap copy button and a preview showing how it renders across different platforms.',
    dependencies: "Unicode mapping"
  },
  {
    id: "31",
    name: "Stopwatch",
    slug: "stopwatch",
    category: "Productivity",
    description: 'Stopwatch offers precision timing with lap recording, split tracking, and a clean full-screen display mode. Athletes and QA engineers rely on it for interval training or performance benchmarking. It keeps a persistent lap history within the session so you can review splits without external logging.',
    dependencies: "Vanilla JS"
  },
  {
    id: "32",
    name: "Reddit Video Downloader",
    slug: "reddit-video-downloader",
    category: "Downloader",
    description: 'Fetches Reddit-hosted videos and their associated audio tracks from the v.redd.it CDN, then merges them client-side. Community managers and meme archivists use it to save posts before they are deleted or removed. It handles both Reddit-native uploads and Gfycat or Imgur hosted clips.',
    dependencies: "yt-dlp"
  },
  {
    id: "33",
    name: "Background Remover",
    slug: "background-remover",
    category: "Image",
    description: 'Segments the foreground subject from an image using a neural network trained on portrait, product, and animal datasets, producing a transparent PNG. E-commerce sellers and graphic designers use it to cut out models or objects for listing photos and composite artwork. It outputs a full-resolution file and also provides a refined edge mask for manual touch-up.',
    dependencies: "rembg / OpenCV / TensorFlow.js"
  },
  {
    id: "34",
    name: "WebP to JPG",
    slug: "webp-to-jpg",
    category: "Image",
    description: 'Converts WebP images into standard JPG format, making them usable in applications and websites that do not support Google’s modern format. Web developers and designers who receive WebP assets from performance-optimized sites or Chrome downloads use this for backward compatibility. It preserves the original color profile and EXIF data so the conversion is visually lossless despite the format change.',
    dependencies: "Canvas API"
  },
  {
    id: "35",
    name: "Wheel of Names",
    slug: "wheel-of-names",
    category: "Utility",
    description: 'Displays an animated spinning wheel that randomly selects one entry from a customizable list of names or options. Teachers and giveaway hosts use it for classroom participation, prize draws, or deciding who does the next chore. You can save wheels as shareable URLs and adjust spin speed, sound effects, and color themes.',
    dependencies: "Canvas API / GSAP"
  },
  {
    id: "36",
    name: "Image Compressor",
    slug: "image-compressor",
    category: "Image",
    description: 'Reduces JPG, PNG, and WebP file sizes using smart compression algorithms that balance quality against byte reduction. Web developers and site owners optimizing page load speeds use this to shrink hero images and thumbnails before deployment. It offers a side-by-side preview slider so you can visually verify the quality before accepting a smaller file.',
    dependencies: "HTML5 Canvas / libjpeg-turbo"
  },
  {
    id: "37",
    name: "Object Remover",
    slug: "object-remover",
    category: "Image",
    description: 'Lets you brush over an unwanted object, blemish, or watermark in a photo, then fills the area with contextually plausible pixels via a diffusion-based inpainting model. Real-estate photographers and listing agents use it to remove trash cans, signs, or power lines from property photos. It supports multi-stroke edits so you can fix several objects without restarting.',
    dependencies: "Lama Cleaner"
  },
  {
    id: "38",
    name: "PPT to PDF",
    slug: "ppt-to-pdf",
    category: "PDF",
    description: 'Renders each PowerPoint slide as a page in a single PDF, maintaining embedded fonts, vector graphics, and slide transitions as static layout. Presenters distributing slide decks to attendees and recruiters submitting pitch decks to application portals that require PDF format use it before sharing. It processes multi-megabyte .pptx files entirely in the browser so no slide data is uploaded to a server.',
    dependencies: "LibreOffice API"
  },
  {
    id: "39",
    name: "Temporary Email Generator",
    slug: "temporary-email-generator",
    category: "Privacy",
    description: 'Creates disposable email inboxes that self-destruct after a user-configurable time limit (5 minutes to 48 hours). Privacy-conscious users and developers use it to sign up for services, verify accounts, or test registration flows without exposing their primary address. Each inbox supports attachments and can receive email from any sender—no registration or personal data required.',
    dependencies: "Mailinator API / Custom Backend"
  },
  {
    id: "40",
    name: "Screen Recorder Extension",
    slug: "screen-recorder-extension",
    category: "Extension",
    description: 'Generates a browser extension that captures browser tabs, full screens, or specific application windows with configurable resolution, frame rate, and audio source selection. Remote educators and software QA engineers use it to create software tutorials or record bug reproduction steps without installing heavyweight desktop applications. Recordings are saved directly to the user’s downloads folder in WebM format, with an optional pause-and-resume feature.',
    dependencies: "MediaRecorder API"
  },
  {
    id: "41",
    name: "PDF Merger",
    slug: "pdf-merger",
    category: "PDF",
    description: 'Combines two or more PDF files into one contiguous document with a drag-and-drop reorder interface for the input list. Legal assistants compiling exhibit bundles, teachers assembling handout packets, and anyone consolidating scanned documents use it to avoid desktop software installation. It accepts up to 20 files per session and preserves each source PDF’s internal bookmarks as a merged outline.',
    dependencies: "pdf-lib"
  },
  {
    id: "42",
    name: "QR Code Generator",
    slug: "qr-code-generator",
    category: "Utility",
    description: 'Renders a QR code from any text, URL, vCard, Wi-Fi config, or plain string using a client-side Reed-Solomon encoder. Marketing teams and event coordinators use it to generate scannable codes for landing pages, digital menus, or check-in links. It supports color customization, embedded logos, and SVG export for print-ready output.',
    dependencies: "qrcode.js"
  },
  {
    id: "43",
    name: "To-Do List",
    slug: "to-do-list",
    category: "Productivity",
    description: 'To Do List provides a flat task manager with drag-to-reorder, completion toggling, and localStorage persistence. Freelancers and students use it to track daily priorities without sign-up friction. All tasks survive page refreshes automatically via browser storage.',
    dependencies: "React / LocalStorage"
  },
  {
    id: "44",
    name: "Excel to PDF",
    slug: "excel-to-pdf",
    category: "PDF",
    description: 'Converts Excel spreadsheets into properly paginated PDF files, respecting print areas, page orientation, and cell formatting. Accountants and project managers use this to share financial statements, Gantt charts, or data tables in a universally printable format that cannot be accidentally altered. It handles merged cells, conditional formatting colors, and multi-worksheet workbooks in a single conversion.',
    dependencies: "SheetJS / jsPDF"
  },
  {
    id: "45",
    name: "EMI Calculator",
    slug: "emi-calculator",
    category: "Finance",
    description: 'Splits a loan principal into equal monthly installments using the standard reducing-balance formula with configurable annual interest and tenure. Home buyers, auto loan shoppers, and small-business owners use it to compare lender offers before committing to financing. It generates a full amortization schedule table that breaks down principal vs. interest for every single payment.',
    dependencies: "Vanilla JS"
  },
  {
    id: "46",
    name: "Character Counter",
    slug: "character-counter",
    category: "Text",
    description: 'Counts characters (with and without spaces), words, sentences, paragraphs, and estimated reading time in real time as you type. Social-media managers and copywriters use it to fit character-limited platforms like Twitter, SMS campaigns, or meta-descriptions. It highlights the exact characters that exceed a user-configurable limit so you know what to trim.',
    dependencies: "Vanilla JS"
  },
  {
    id: "47",
    name: "Video to Text Transcription",
    slug: "video-to-text-transcription",
    category: "Transcription",
    description: 'Video to Text Transcription extracts speech from uploaded video files using on-device speech recognition. Content creators and journalists use it to generate rough transcripts for editing or captioning. It processes entirely in-browser, so no video data ever leaves your machine.',
    dependencies: "Whisper API"
  },
  {
    id: "48",
    name: "Word Counter",
    slug: "word-counter",
    category: "Text",
    description: 'Provides a live dashboard of word count, sentence count, syllable count, readability scores (Flesch-Kincaid), and speaking time. Authors, bloggers, and ESL learners use it to hit editorial word budgets and gauge how accessible their writing is. The readability graph updates character-by-character so you see the trend before you finish a paragraph.',
    dependencies: "Vanilla JS"
  },
  {
    id: "49",
    name: "Crop Image",
    slug: "crop-image",
    category: "Image",
    description: 'Lets you drag a selection rectangle to crop an image to any pixel dimension, common social-media ratio (1:1, 16:9, 4:5), or exact preset like 1080×1080. Social-media managers and advertisers use it to reformat one source image across Instagram, Twitter, LinkedIn, and Facebook simultaneously. It overlays rule-of-thirds and center guides for precise composition.',
    dependencies: "Cropper.js"
  },
  {
    id: "50",
    name: "Social Media Post Maker",
    slug: "social-media-post-maker",
    category: "Branding",
    description: 'Social Media Post Maker offers platform-specific canvas templates and a library of stock graphics for creating social visuals. Social media managers and marketers use it to produce consistent branded posts without Photoshop. It includes preset dimensions for Instagram, Twitter, LinkedIn, and Facebook.',
    dependencies: "Fabric.js"
  },
  {
    id: "51",
    name: "MKV to MP4",
    slug: "mkv-to-mp4",
    category: "Converter",
    description: 'Re-encapsulates MKV video files into the more universally compatible MP4 container without re-encoding the underlying video stream. Anyone who needs to play MKV files on devices like smart TVs, iPhones, or game consoles uses this to avoid format rejection. It preserves all original video quality, subtitles, and multiple audio tracks in a single pass.',
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
    description: 'Rewrites sentences and paragraphs while preserving the original meaning and intent. Academics and content creators use it to avoid plagiarism, simplify complex language, or adapt text for different platforms. It offers multiple rewriting modes ranging from formal to conversational tone.',
    dependencies: "HuggingFace"
  },
  {
    id: "54",
    name: "Random Number Generator",
    slug: "random-number-generator",
    category: "Utility",
    description: 'Generates cryptographically secure random integers or decimals within a user-defined min-max range with optional repetition filtering. Game masters and statisticians use it for dice rolls, lottery simulations, Monte Carlo sampling, or impartial group assignments. It logs a timestamped history of every generated number for auditability.',
    dependencies: "Math.random()"
  },
  {
    id: "55",
    name: "URL Shortener",
    slug: "url-shortener",
    category: "Utility",
    description: 'Takes any long URL and generates a compact, shareable short link with optional custom alias support. Social media managers and SMS marketers use this to fit links into character-limited posts and track click performance. It offers QR code generation alongside every short link so print and digital distribution are covered in one step.',
    dependencies: "Node.js / Redis"
  },
  {
    id: "56",
    name: "Text Summarizer",
    slug: "text-summarizer",
    category: "Text",
    description: 'Uses extractive and abstractive summarization to reduce long articles or documents to a configurable number of sentences or bullet points. Journalists, executives, and students use it to quickly grasp the key arguments of a piece before deciding to read the full version. It also generates a one-sentence TL;DR summary positioned at the very top for the fastest possible scan.',
    dependencies: "OpenAI API / HuggingFace"
  },
  {
    id: "58",
    name: "PDF to Excel",
    slug: "pdf-to-excel",
    category: "PDF",
    description: 'Extracts tabular data from PDF files and reconstructs it into editable Excel spreadsheets with proper column alignment. Data analysts and auditors use this to pull financial tables, inventory lists, or survey results trapped inside locked or scanned PDFs. It applies OCR on scanned tables and uses column-detection heuristics that recover multi-level headers and merged cells.',
    dependencies: "pdf2json / SheetJS"
  },
  {
    id: "59",
    name: "Unlock PDF",
    slug: "unlock-pdf",
    category: "PDF",
    description: 'Removes owner-level password restrictions from PDFs so you can edit, print, or copy content from protected documents. Researchers, office staff, and students use it when they lose the original author password or receive a restricted file from a colleague. It decrypts the PDF on-device using the owner password hash—no cloud round-trip is required.',
    dependencies: "qpdf"
  },
  {
    id: "60",
    name: "Image Enhancer",
    slug: "image-enhancer",
    category: "Image",
    description: 'Applies an AI super-resolution model to upscale images by 2x or 4x while sharpening detail, reducing noise, and correcting color cast. Portrait photographers and print-shop operators use it to rescue low-resolution source files for large-format output. It also includes one-click adjustments for brightness, contrast, saturation, and white balance.',
    dependencies: "Real-ESRGAN"
  },
  {
    id: "61",
    name: "SIP Calculator",
    slug: "sip-calculator",
    category: "Finance",
    description: 'Projects the future value of recurring mutual-fund investments using compounded monthly returns based on historical or assumed growth rates. Long-term retail investors and first-time SIP planners use it to set realistic monthly contribution targets for goals like retirement or education. It lets you toggle step-up SIP amounts (annual increase) to model income-growth scenarios.',
    dependencies: "Vanilla JS"
  },
  {
    id: "62",
    name: "BMI Calculator",
    slug: "bmi-calculator",
    category: "Health",
    description: 'Computes Body Mass Index from metric or imperial height and weight inputs, categorizing the result into underweight, normal, overweight, or obese ranges per WHO standards. Fitness trainers and primary care patients use it as a quick screening tool during health assessments or progress tracking. The calculator displays both the numeric BMI value and a color-coded gauge visualization, and optionally saves past results to localStorage for trend tracking.',
    dependencies: "Vanilla JS"
  },
  {
    id: "63",
    name: "Pinterest Image Downloader",
    slug: "pinterest-image-downloader",
    category: "Downloader",
    description: 'Scrapes the highest-resolution version of an image from a Pinterest pin page by inspecting the Open Graph and JSON-LD metadata. Graphic designers and mood-board creators use it to source reference imagery without screenshot artifacts. It strips the Pinterest overlay and watermark-free original when available.',
    dependencies: "Vanilla JS"
  },
  {
    id: "64",
    name: "Audio to Text Transcription",
    slug: "audio-to-text-transcription",
    category: "Transcription",
    description: 'Audio to Text Transcription converts spoken audio from uploaded files into editable text using browser-based speech APIs. Podcasters and researchers use it to create searchable text from interviews or recordings. It supports multiple audio formats including MP3, WAV, and OGG.',
    dependencies: "Whisper API"
  },
  {
    id: "66",
    name: "Meme Generator",
    slug: "meme-generator",
    category: "Image",
    description: 'Adds top-and-bottom text to any uploaded image with meme-style Impact font, customizable font size, stroke width, and white border. Social media users and community managers use it to create shareable reaction memes or promotional graphics in seconds without launching Photoshop. It includes a library of 50+ popular meme templates (Drake, Distracted Boyfriend, etc.) for instant starting points.',
    dependencies: "Canvas API"
  },
  {
    id: "67",
    name: "MOV to MP4",
    slug: "mov-to-mp4",
    category: "Converter",
    description: 'Transcodes QuickTime MOV files into MP4 format while optimizing for web playback and social media uploads. Video editors and social media managers rely on it to prepare footage for platforms like YouTube, Twitter, and Instagram that favor MP4. It intelligently handles Apple ProRes and other high-bitrate codecs that typical converters fail to process.',
    dependencies: "FFmpeg"
  },
  {
    id: "68",
    name: "Resume Builder",
    slug: "resume-builder",
    category: "Utility",
    description: 'Provides a structured, form-based interface for entering work history, education, and skills, then renders a professionally formatted PDF resume. Job seekers and career changers use it to produce ATS-friendly resumes that pass automated screening systems. It includes real-time section reordering and one-click template switching without losing any entered data.',
    dependencies: "React / html2pdf.js"
  },
  {
    id: "69",
    name: "AI Image Upscaler",
    slug: "ai-image-upscaler",
    category: "AI",
    description: 'Increases image resolution by up to 4x while reconstructing fine details that standard interpolation loses. Photographers and e-commerce sellers use it to prepare low-res assets for print or high-res displays. It denoises images during upscaling, restoring clarity to old or compressed photos.',
    dependencies: "Real-ESRGAN"
  },
  {
    id: "70",
    name: "GST Calculator",
    slug: "gst-calculator",
    category: "Finance",
    description: 'Computes GST-inclusive and GST-exclusive amounts for Indian tax slabs (5%, 12%, 18%, 28%) with automatic HSN/SAC code hints. Small-business owners, freelancers, and accountants in India use it to generate tax-ready invoice figures without memorizing rate tables. It splits the output into central CGST and state SGST components as required by Indian tax law.',
    dependencies: "Vanilla JS"
  },
  {
    id: "71",
    name: "Image Resizer",
    slug: "image-resizer",
    category: "Image",
    description: 'Scales images to exact pixel dimensions or percentage-based sizes with intelligent resampling algorithms that preserve sharpness. Graphic designers and web developers preparing assets for responsive layouts, social media cover images, or print specifications use this for pixel-perfect output. It supports maintaining aspect ratio via lock-button, canvas cropping, and batch resizing of multiple images at once.',
    dependencies: "Canvas API / Sharp"
  },
  {
    id: "72",
    name: "Password Generator",
    slug: "password-generator",
    category: "Utility",
    description: 'Generates cryptographically strong random passwords with fully customizable length, character sets, and pattern rules. Security-conscious individuals and system administrators use it to create credentials for accounts, servers, or API keys that resist brute-force attacks. It excludes visually ambiguous characters (like 1/l/I and 0/O) by default and rates each password’s entropy score.',
    dependencies: "Crypto API"
  },
  {
    id: "73",
    name: "Diff Checker",
    slug: "diff-checker",
    category: "Developer",
    description: 'Compares two input texts side-by-side, highlighting inserted, deleted, and changed lines with distinct background colors. Developers and technical writers use it to review code changes, compare document drafts, or verify configuration file modifications before deployment. The tool supports unified and split-view modes and detects indentation-level changes that word-level diff checkers typically miss.',
    dependencies: "diff-match-patch"
  },
  {
    id: "74",
    name: "WEBM to MP4",
    slug: "webm-to-mp4",
    category: "Converter",
    description: 'Converts WebM video files to MP4 format, which is critical for users whose editing software or sharing platforms reject WebM. Designers and web developers who receive screen recordings or animations in WebM from Chrome-based tools use this for downstream compatibility. It strips the VP8/VP9 codec and repackages into H.264, achieving playability on virtually every modern device.',
    dependencies: "FFmpeg"
  },
  {
    id: "76",
    name: "IP Address Lookup",
    slug: "ip-address-lookup",
    category: "Utility",
    description: 'Displays your current public IPv4 and IPv6 addresses along with geolocation data (city, ISP, ASN, timezone) fetched via a WebRTC STUN request and a geolocation API. Network engineers and remote workers use it to verify VPN connectivity, diagnose routing issues, or confirm their public-facing IP. It also exposes your local LAN IP and browser-reported location for comparison.',
    dependencies: "MaxMind / IP-API"
  },
  {
    id: "77",
    name: "Brand Name Generator",
    slug: "brand-name-generator",
    category: "Branding",
    description: 'Brand Name Generator combines keyword inputs with syllable patterns and suffix rules to produce creative name ideas. Entrepreneurs and naming committees use it to brainstorm brand names before domain availability checks. It lets you lock preferred words and regenerate variations around them.',
    dependencies: "OpenAI API"
  },
  {
    id: "78",
    name: "AI Content Humanizer",
    slug: "ai-content-humanizer",
    category: "AI",
    description: 'Replaces robotic phrasing, repetitive patterns, and awkward constructions typical of AI-generated text. Bloggers and SEO writers use it to make published content pass AI-detection tools and sound genuinely human. It varies sentence rhythm and vocabulary while keeping facts and structure intact.',
    dependencies: "OpenAI API / Custom NLP"
  },
  {
    id: "79",
    name: "Photo Retoucher",
    slug: "photo-retoucher",
    category: "Image",
    description: 'Applies an AI-powered inpainting model to remove blemishes, scratches, dust spots, and skin imperfections from portrait and product photos. Wedding photographers and real-estate listing agents use it to clean up images without launching Photoshop. It preserves EXIF data and outputs a lossless PNG so no quality is lost between edits.',
    dependencies: "OpenCV"
  },
  {
    id: "80",
    name: "PDF Splitter",
    slug: "pdf-splitter",
    category: "PDF",
    description: 'Divides a single PDF into multiple files by page range, bookmark level, or a specified page count per split. Paralegals, accountants, and data managers use it to extract specific sections from large reports or separate combined submissions. You can preview each page as a thumbnail before splitting and optionally rename output files in bulk.',
    dependencies: "pdf-lib"
  },
  {
    id: "84",
    name: "Font Generator",
    slug: "font-generator",
    category: "Text",
    description: 'Converts plain ASCII text into dozens of Unicode-stylized variants including bold, script, fraktur, monospace, and decorative letter forms. Social-media users, graphic designers, and gamers use it to create distinctive display names, bios, and captions where custom fonts are not natively supported. Every generated style is copy-paste compatible with Instagram, TikTok, Discord, and Steam.',
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
    description: 'Pomodoro Timer manages work and break intervals with fully customizable session lengths and auto-start options. Students and remote workers use it to maintain focus using the Pomodoro technique. It fires desktop notification alerts when sessions end, even if the browser tab is backgrounded.',
    dependencies: "Web Audio API / Vanilla JS"
  },
  {
    id: "89",
    name: "AI Video Summarizer",
    slug: "ai-video-summarizer",
    category: "AI",
    description: 'Extracts key scenes, dialogue, and concepts from long-form video into a structured text summary. Researchers and busy professionals use it to digest hour-long recordings, lectures, or meetings in minutes. It generates timestamps for each summary point so you can jump directly to the source segment.',
    dependencies: "YouTube API / OpenAI API"
  },
  {
    id: "90",
    name: "YouTube Transcript Generator",
    slug: "youtube-transcript-generator",
    category: "Transcription",
    description: 'YouTube Transcript Generator fetches captions from public YouTube videos via the video ID or URL. Researchers and content analysts use it to extract readable text for quoting or translation. It preserves timestamps alongside each line for easy navigation back to the original video.',
    dependencies: "YouTube Data API"
  },
  {
    id: "91",
    name: "AI Audio Enhancer",
    slug: "ai-audio-enhancer",
    category: "AI",
    description: 'Removes background noise, hiss, and hum from recordings while preserving vocal clarity. Podcasters and remote workers use it to clean up recordings made in untreated rooms or through poor microphones. It can also normalize volume levels across an entire audio file in one pass.',
    dependencies: "Adobe Podcast API / Custom Model"
  },
  {
    id: "92",
    name: "EPUB to PDF",
    slug: "epub-to-pdf",
    category: "PDF",
    description: 'Converts EPUB ebooks to PDF with full control over page size, margins, font, and line spacing. Readers, self-publishing authors, and educators use it to create print-ready versions of digital books or to read EPUB files on devices with poor EPUB support. It preserves chapter headings, table of contents hyperlinks, and embedded images during conversion.',
    dependencies: "Calibre API"
  },
  {
    id: "94",
    name: "AI Voice Cloning",
    slug: "ai-voice-cloning",
    category: "AI",
    description: 'Analyzes a short voice sample to synthesize new speech that matches the original speaker’s tone, pitch, and cadence. Voice actors and indie game developers use it to generate narration or dialogue without repeated studio sessions. It can clone a voice from as little as 30 seconds of source audio.',
    dependencies: "ElevenLabs API"
  },
  {
    id: "95",
    name: "AI Essay Writer",
    slug: "ai-essay-writer",
    category: "AI",
    description: 'Generates thesis-driven essays with coherent arguments, citations, and properly structured paragraphs. Students and academics use it to produce first drafts on unfamiliar topics or to overcome analysis paralysis. It lets you specify essay type—argumentative, compare-contrast, or expository—and target word count.',
    dependencies: "OpenAI API"
  },
  {
    id: "96",
    name: "Protect PDF",
    slug: "protect-pdf",
    category: "PDF",
    description: 'Encrypts a PDF with a user-chosen password using AES-128, restricting opening, printing, and copying as specified by the owner. HR departments distributing confidential offer letters and legal teams sharing discovery documents use it before emailing attachments. It does not transmit the file to any server—all encryption happens client-side via a WebCrypto implementation.',
    dependencies: "pdf-lib"
  },
  {
    id: "97",
    name: "Invoice Generator",
    slug: "invoice-generator",
    category: "Finance",
    description: 'Produces downloadable PDF or HTML invoices with customizable line items, tax rates, discounts, and business logo placement. Freelancers, sole proprietors, and agency owners use it to send professional billing documents without subscribing to full accounting software. It auto-fills sequential invoice numbers, due dates, and the sender’s saved profile between sessions.',
    dependencies: "PDF-lib / Vue.js"
  },
  {
    id: "98",
    name: "Business Card Maker",
    slug: "business-card-maker",
    category: "Branding",
    description: 'Business Card Maker provides a WYSIWYG editor with snap-to-grid alignment and preset card dimensions. Freelancers and sales professionals use it to design double-sided business cards for home printing. It exports directly to a print-ready PDF with cut-line guides.',
    dependencies: "React / Canvas API"
  },
  {
    id: "99",
    name: "Regex Tester",
    slug: "regex-tester",
    category: "Developer",
    description: 'Provides an interactive environment where users can write a regular expression pattern, test it against sample strings, and view real-time match highlights with capture group breakdowns. Developers and data analysts use it to craft and debug regex patterns for search-and-replace operations, log parsing, or form validation before deploying them in production code. The tester includes a pattern library with 50+ common regex recipes and flags any catastrophic backtracking risks by analyzing the pattern structure.',
    dependencies: "regex.js"
  },
  {
    id: "100",
    name: "AI Avatar Generator",
    slug: "ai-avatar-generator",
    category: "AI",
    description: 'Creates stylized or photorealistic digital avatars from a single uploaded selfie. Social media users and virtual-event organizers use it to build consistent profile imagery without a photoshoot. It offers hundreds of art styles including anime, 3D render, and classic portrait painting.',
    dependencies: "Stable Diffusion API"
  },
  {
    id: "101",
    name: "Dice Roller",
    slug: "dice-roller",
    category: "Utility",
    description: 'Simulates rolling any number of dice with arbitrary side counts—d4, d6, d8, d10, d12, d20, d100, or custom values. Tabletop RPG players and game masters use it when physical dice are not available or when they need to roll complex expressions like 3d6+2. It provides a full probability breakdown showing the mathematical likelihood of each outcome.',
    dependencies: "Three.js"
  },
  {
    id: "102",
    name: "Profit Margin Calculator",
    slug: "profit-margin-calculator",
    category: "Finance",
    description: 'Computes gross profit, net profit, and margin percentages from revenue and cost inputs, and can work backwards to find required sell price given a target margin. Small-business owners and freelancers use it to price products or services before sending quotes. It displays both markup and margin side-by-side so you never confuse the two metrics.',
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
    description: 'Resolves Vimeo’s progressive-download and HLS streaming URLs from the video config object to offer direct MP4 downloads. Video editors and production teams use it to download review cuts or offline proxies. It surfaces every available resolution from 360p to 4K without transcoding.',
    dependencies: "yt-dlp"
  },
  {
    id: "106",
    name: "PDF to EPUB",
    slug: "pdf-to-epub",
    category: "PDF",
    description: 'Converts static PDF documents into reflowable EPUB ebook format with adjustable font size, orientation, and screen adaptation. Students and avid readers use this to transfer textbooks, research papers, or manuals onto e-readers like Kindle and Kobo. It preserves chapter bookmarks, hyperlinks, and image alt text that migration tools typically discard.',
    dependencies: "Calibre API"
  },
  {
    id: "107",
    name: "Coin Flipper",
    slug: "coin-flipper",
    category: "Utility",
    description: 'Simulates a fair coin flip using a cryptographic random number generator, displaying heads or tails with a realistic animation. Decision-makers and game players use it to settle disputes, choose between two options, or add randomness to board games. It tracks flip history with a running tally so you can verify fairness over thousands of flips.',
    dependencies: "CSS3 Animations"
  },
  {
    id: "108",
    name: "Image Colorizer",
    slug: "image-colorizer",
    category: "Image",
    description: 'Uses a deep-learning model trained on millions of historical photos to predict plausible per-pixel color for grayscale and sepia images. Genealogists and history enthusiasts use it to bring old family portraits and archival photographs to life. It lets you tint specific regions (skin, sky, foliage) manually when the AI is uncertain.',
    dependencies: "DeOldify"
  },
  {
    id: "109",
    name: "EXIF Data Remover",
    slug: "exif-data-remover",
    category: "Privacy",
    description: 'Strips GPS coordinates, camera metadata, timestamps, and software fingerprints from JPEG and PNG images. Journalists, privacy advocates, and real-estate photographers use it to scrub location and device data before publishing photos online. The removal is done completely on-device via WebAssembly—images are never transmitted or stored on a server.',
    dependencies: "exifr / Piexifjs"
  },
  {
    id: "110",
    name: "AVI to MP4",
    slug: "avi-to-mp4",
    category: "Converter",
    description: 'Converts legacy AVI video containers into modern MP4 files with H.264 encoding for drastically smaller file sizes. Archivists and anyone digitizing old home videos or DVD rips use this to future-proof their media libraries. It applies smart deinterlacing and aspect-ratio correction automatically, saving hours of manual video preprocessing.',
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
    description: 'Seamlessly replaces one face with another in photos while matching skin tone, lighting, and head angle. Content creators and meme-makers use it for humorous edits or to place themselves into historical photos. It automatically adjusts facial expression to match the original image’s context.',
    dependencies: "InsightFace"
  },
  {
    id: "113",
    name: "JSON Formatter",
    slug: "json-formatter",
    category: "Developer",
    description: 'Pretty-prints raw JSON with configurable indent width, key sorting, and bracket collapsing options while flagging syntax errors with exact line-level messages. Backend developers debugging API responses and data analysts inspecting large config files use it before feeding data into downstream tools. It includes a minimized side-by-side view that halves character count for copying into logs.',
    dependencies: "JSONLint"
  },
  {
    id: "114",
    name: "XML Sitemap Generator",
    slug: "xml-sitemap-generator",
    category: "SEO",
    description: 'Accepts a list of URLs with optional priority, change frequency, and last-modified dates, then emits a standards-compliant XML sitemap with proper namespace declarations. SEO specialists and site owners use it to submit a complete page inventory to Google Search Console. It validates all URLs for syntax correctness and flags duplicate or malformed entries before export.',
    dependencies: "Node.js / Cheerio"
  },
  {
    id: "115",
    name: "Meeting Minutes Generator",
    slug: "meeting-minutes-generator",
    category: "Transcription",
    description: 'Meeting Minutes Generator structures raw notes into sections like attendees, decisions, action items, and follow-ups. Project managers and team leads use it to produce consistent meeting artifacts without manual formatting. It includes a templating system so recurring meetings keep the same structure.',
    dependencies: "OpenAI API"
  },
  {
    id: "116",
    name: "AI Cover Letter Generator",
    slug: "ai-cover-letter-generator",
    category: "AI",
    description: 'Analyzes a job description and your résumé to produce a tailored cover letter that highlights relevant experience and matches the employer’s language. Job seekers and career changers use it to overcome writer’s block and customize applications at scale. It scores each generated draft against ATS keyword patterns so your letter passes automated screening systems.',
    dependencies: "OpenAI API"
  },
  {
    id: "117",
    name: "AI Excel Formula Generator",
    slug: "ai-excel-formula-generator",
    category: "AI",
    description: 'Converts plain-English descriptions of spreadsheet logic into ready-to-paste Excel or Google Sheets formulas. Business analysts, accountants, and data analysts use it to avoid syntax errors and learn complex functions like XLOOKUP or nested IFs interactively. Each formula includes an inline explanation of how it works and a link to the official Microsoft or Google documentation.',
    dependencies: "OpenAI API"
  },
  {
    id: "118",
    name: "AI Product Description Generator",
    slug: "ai-product-description-generator",
    category: "AI",
    description: 'Generates SEO-optimized product descriptions from a few keywords, a URL, or an image of the product. E-commerce sellers and Shopify store owners use it to create consistent, persuasive copy across hundreds of SKUs without hiring a copywriter. It outputs multiple tone variants—professional, casual, or luxury—so you can A/B test which converts better.',
    dependencies: "OpenAI API"
  },
  {
    id: "120",
    name: "AI Presentation Generator",
    slug: "ai-presentation-generator",
    category: "AI",
    description: 'Converts a topic sentence or rough outline into a complete slide deck with design, layout, and bullet points. Sales teams and educators use it to build professional presentations in minutes instead of hours. It applies consistent themes across all slides and can export directly to PowerPoint or Google Slides.',
    dependencies: "OpenAI API / PptxGenJS"
  },
  {
    id: "121",
    name: "JSON to CSV",
    slug: "json-to-csv",
    category: "Converter",
    description: 'Parses structured JSON data—including nested objects and arrays—and flattens it into a clean CSV spreadsheet with proper column headers. Data analysts and engineers use this to move API responses, database exports, or configuration files into tools like Excel, Google Sheets, or pandas. It handles deeply nested JSON by intelligently flattening keys into descriptive column names rather than dropping data.',
    dependencies: "PapaParse"
  },
  {
    id: "122",
    name: "Watermark PDF",
    slug: "watermark-pdf",
    category: "PDF",
    description: 'Overlays text or image watermarks onto every page of a PDF with customizable position, rotation, opacity, and tiling. Legal professionals and photographers use it to add confidential markings, copyright notices, or document stamps before distribution. It supports variable watermark fields like {date}, {page-number}, or {username} that populate dynamically per recipient.',
    dependencies: "pdf-lib"
  },
  {
    id: "123",
    name: "PDF Page Delete",
    slug: "pdf-page-delete",
    category: "PDF",
    description: 'Removes selected page ranges from a PDF while renumbering the remaining pages and updating any internal page references. Administrative assistants cleaning up scanned documents that include blank separator sheets and authors removing unwanted appendix pages use it to produce clean final files. It displays a visual thumbnail preview of every page before deletion so users can confirm their selection.',
    dependencies: "pdf-lib"
  },
  {
    id: "124",
    name: "PNG to SVG",
    slug: "png-to-svg",
    category: "Image",
    description: 'Traces bitmap PNG shapes into clean SVG paths using Potrace in WebAssembly, with controls for curve tolerance, corner threshold, and speckle suppression. Icon designers and frontend developers use it to convert hand-drawn sketches or raster logos into resolution-independent vectors. The result is editable in any vector application and typically 80-90% smaller than the source PNG.',
    dependencies: "Potrace"
  },
  {
    id: "125",
    name: "Email Signature Generator",
    slug: "email-signature-generator",
    category: "Branding",
    description: 'Email Signature Generator builds HTML email signatures through a form-based UI with social link fields and icon toggles. Salespeople and corporate employees use it to create professional signatures without editing raw HTML. The preview renders live so every field change shows the result immediately.',
    dependencies: "React"
  },
  {
    id: "126",
    name: "AI Music Generator",
    slug: "ai-music-generator",
    category: "AI",
    description: 'Composes original music tracks from text descriptions of genre, mood, tempo, and instrumentation. Indie filmmakers and game developers use it to create royalty-free background scores without hiring a composer. It generates stems (individual instrument tracks) for flexible post-production editing.',
    dependencies: "Suno API / Custom Model"
  },
  {
    id: "128",
    name: "Margin Calculator",
    slug: "margin-calculator",
    category: "Finance",
    description: 'Calculates gross margin percentage, markup percentage, cost, and selling price from any two known variables using standard retail formulas. E-commerce sellers, product managers, and wholesalers use it to price inventory while ensuring target profitability. It includes a breakeven-quantity sub-calculator that shows how many units must sell at a given margin.',
    dependencies: "Vanilla JS"
  },
  {
    id: "129",
    name: "Morse Code Translator",
    slug: "morse-code-translator",
    category: "Utility",
    description: 'Converts alphanumeric text into International Morse code with audible beeps played through the Web Audio API, and decodes incoming Morse signals back to text via keyboard or microphone input. Ham-radio operators and aviation students use it for practice or to decode recorded transmissions. It adjusts the Farnsworth speed and tone frequency to match your skill level.',
    dependencies: "Vanilla JS"
  },
  {
    id: "130",
    name: "Cursive Text Generator",
    slug: "cursive-text-generator",
    category: "Text",
    description: 'Converts plain text into flowing cursive and script-style Unicode characters that resemble handwritten calligraphy. Wedding-invitation designers, journalers, and Instagram story creators use it to add an elegant hand-lettered aesthetic without design software. It offers multiple cursive variants—formal Spencerian, casual looped, and connected italic—each with realistic letter joins.',
    dependencies: "Vanilla JS"
  },
  {
    id: "131",
    name: "ROI Calculator",
    slug: "roi-calculator",
    category: "Finance",
    description: 'Measures return on investment by comparing net gain or loss against the original cost, expressed as both a percentage and a dollar amount. Startup founders, marketing managers, and real-estate investors use it to evaluate which channels or assets deliver the highest yield. It supports multi-period comparison so you can paste several investments at once and see a ranked table.',
    dependencies: "Vanilla JS"
  },
  {
    id: "132",
    name: "VAT Calculator",
    slug: "vat-calculator",
    category: "Finance",
    description: 'Computes VAT-inclusive and VAT-exclusive amounts for EU member-state rates (standard and reduced) with country-specific rules for digital services. E-commerce merchants, SaaS operators, and EU freelancers use it to generate compliant invoices across multiple jurisdictions. It automatically applies the correct rate when a country is selected and flags reverse-charge scenarios.',
    dependencies: "Vanilla JS"
  },
  {
    id: "134",
    name: "Password Strength Checker",
    slug: "password-strength-checker",
    category: "Privacy",
    description: 'Evaluates passwords against 10+ criteria: length, character diversity, dictionary words, pattern repetition, known-breach database lookup, and entropy. Security-conscious users and system administrators use it to enforce strong password policies without sending plaintext passwords over the network. The breach check uses a k-anonymity model so only a partial hash prefix is transmitted, preserving your password’s secrecy.',
    dependencies: "zxcvbn"
  },
  {
    id: "135",
    name: "JS Minifier",
    slug: "js-minifier",
    category: "Developer",
    description: 'Strips comments, whitespace, and shortens local variable names in JavaScript source without altering execution semantics. Web-performance engineers and build-pipeline maintainers use it to reduce bundle size before deployment to production CDNs. It shows a before/after byte-count comparison and estimates the percentage savings achieved by minification.',
    dependencies: "Terser"
  },
  {
    id: "136",
    name: "Base64 Encode/Decode",
    slug: "base64-encode-decode",
    category: "Developer",
    description: 'Encodes text or small files into Base64 strings and decodes them back with automatic MIME-type detection for binary safety. Developers embedding images in CSS/data URIs and security engineers inspecting encoded payloads use it for quick round-trip verification. It detects and strips common padding variants automatically so pasted strings from any source decode correctly on first try.',
    dependencies: "btoa/atob"
  },
  {
    id: "137",
    name: "Text to Handwriting",
    slug: "text-to-handwriting",
    category: "Text",
    description: 'Renders typed text as realistic handwritten output using configurable fonts, ink colors, paper backgrounds, and even simulated pressure variations. Students and content creators use it to generate handwritten-style notes, assignments, or social-media posts that look natural. The output can be downloaded as a PDF or PNG with optional lined or ruled paper backgrounds.',
    dependencies: "Canvas API"
  },
  {
    id: "138",
    name: "Receipt Generator",
    slug: "receipt-generator",
    category: "Finance",
    description: 'Creates printer-friendly receipt pages with itemized purchases, payment method, date, and merchant details in a compact single-page layout. Retail pop-up vendors, tradespeople, and service providers use it to hand receipts to customers on the spot without a POS system. It supports same-session reprint so the last receipt can be duplicated with a single click.',
    dependencies: "Canvas API / jsPDF"
  },
  {
    id: "139",
    name: "AI Thumbnail Maker",
    slug: "ai-thumbnail-maker",
    category: "AI",
    description: 'Designs click-optimized YouTube thumbnails by compositing text, images, and effects on a smart canvas. YouTubers and video marketers use it to increase click-through rates without learning Photoshop. It analyzes top-performing thumbnails in your niche to suggest color palettes and layout patterns.',
    dependencies: "Canvas API / OpenAI API"
  },
  {
    id: "140",
    name: "Secure Note Sharer",
    slug: "secure-note-sharer",
    category: "Privacy",
    description: 'Encrypts a text note with a passphrase and generates a one-time view link that self-destructs after the recipient reads it. Journalists, legal teams, and system administrators use it to securely transmit passwords, API keys, or confidential instructions without leaving a persistent record. The note is encrypted with AES-256-GCM before transmission and the decryption key is never stored on the server.',
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
    description: 'Converts uploaded images (PNG, JPG, GIF, SVG, WebP) into Base64-encoded data URI strings ready for embedding in HTML, CSS, or JSON. API developers and backend engineers use it to inline small images in responses, generate placeholder blobs for database seeding, or encode assets for email templates. The tool optionally strips the MIME-type prefix for raw Base64 output and shows the character count and estimated size inflation ratio.',
    dependencies: "FileReader API"
  },
  {
    id: "143",
    name: "Subtitle Translator",
    slug: "subtitle-translator",
    category: "Video",
    description: 'Accepts SRT or VTT subtitle files and translates their text content into any of 100+ target languages while preserving exact timing codes and frame synchronization. Video editors and localization teams use it to localize foreign-language films and online courses without manually retiming subtitles. The translation engine recognizes speaker labels, sound effects in brackets, and formatting tags, leaving them untranslated so only dialogue is modified.',
    dependencies: "Google Translate API"
  },
  {
    id: "144",
    name: "IBAN Validator",
    slug: "iban-validator",
    category: "Finance",
    description: 'Validates the structure, length, and check digits of IBANs from 70+ countries using the official ISO 13616 modulus-97 algorithm. Payment operations teams and accounts-payable clerks use it to catch typos before they cause wire-transfer failures or bank rejection fees. It displays the parsed bank identifier, branch code, and account number so users can verify the parts visually.',
    dependencies: "ibantools"
  },
  {
    id: "145",
    name: "AI Flowchart Maker",
    slug: "ai-flowchart-maker",
    category: "AI",
    description: 'Parses process descriptions and automatically generates a connected flowchart with labeled nodes and decision branches. Product managers and technical writers use it to document workflows, algorithms, or decision trees instantly. It supports swimlane diagrams and can export to Mermaid, Lucidchart, and SVG formats.',
    dependencies: "Mermaid.js / OpenAI API"
  },
  {
    id: "146",
    name: "AI Code Explainer",
    slug: "ai-code-explainer",
    category: "AI",
    description: 'Accepts any code snippet and returns a plain-English breakdown of what each section does and why. Junior developers and code-review participants use it to understand unfamiliar libraries or legacy codebases. It can also translate explanations between programming languages, showing equivalent logic in Python, JavaScript, or Rust.',
    dependencies: "OpenAI API"
  },
  {
    id: "147",
    name: "AI SQL Generator",
    slug: "ai-sql-generator",
    category: "AI",
    description: 'Translates plain-English database queries into optimized SQL statements with proper joins and indexing hints. Data analysts and product managers use it to query databases without memorizing SQL syntax or table schemas. It explains the generated query step by step so users learn SQL as they go.',
    dependencies: "OpenAI API"
  },
  {
    id: "148",
    name: "AI Recipe Generator",
    slug: "ai-recipe-generator",
    category: "AI",
    description: 'Suggests complete recipes based on a list of ingredients you already have in your kitchen. Home cooks and meal-preppers use it to reduce food waste and avoid last-minute grocery runs. It filters by dietary restrictions (vegan, keto, gluten-free) and scales servings automatically.',
    dependencies: "OpenAI API"
  },
  {
    id: "149",
    name: "AI Domain Name Generator",
    slug: "ai-domain-name-generator",
    category: "AI",
    description: 'Combines seed keywords with current TLD availability data, linguistic patterns, and brandability heuristics to propose available domain names. Startup founders and side-project builders use it to brainstorm names that are short, memorable, and pronounceable. Each suggestion shows instant WHOIS availability and highlights domains that are still unregistered with popular extensions like .com and .io.',
    dependencies: "OpenAI API / Domain API"
  },
  {
    id: "150",
    name: "AI Mind Map Generator",
    slug: "ai-mind-map-generator",
    category: "AI",
    description: 'Parses a block of text, a URL, or bullet points and renders a hierarchical mind map that can be exported as PNG, SVG, or Markdown. Students, project managers, and writers use it to visually organize research, brainstorm ideas, or outline complex topics. It auto-layouts nodes to minimize crossing lines and lets you collapse subtrees to focus on high-level structure.',
    dependencies: "OpenAI API / React Flow"
  },
  {
    id: "151",
    name: "CSV to JSON",
    slug: "csv-to-json",
    category: "Converter",
    description: 'Reads CSV files and converts each row into a structured JSON object, correctly inferring data types and handling quoted fields. Backend developers and data pipeline builders use this to transform spreadsheet exports into API-friendly payloads or database seed files. It auto-detects delimiters (commas, tabs, semicolons) and encoding schemes so malformed CSV never breaks the output.',
    dependencies: "PapaParse"
  },
  {
    id: "152",
    name: "Rotate PDF",
    slug: "rotate-pdf",
    category: "PDF",
    description: 'Rotates individual pages or all pages of a PDF by 90, 180, or 270 degrees without re-encoding the page content. Office workers dealing with scanned documents that came in sideways and designers fixing mixed-orientation PDFs use it to make reading natural. It applies rotation metadata-only when possible so the operation completes in under a second for most files.',
    dependencies: "pdf-lib"
  },
  {
    id: "153",
    name: "Extract Images from PDF",
    slug: "extract-images-from-pdf",
    category: "PDF",
    description: 'Extracts every embedded raster image from a PDF as separate JPEG or PNG files, preserving original resolution and color space. Graphic designers reclaiming assets from client PDFs and archivists pulling figures from research-paper PDFs use it to avoid recreating graphics from scratch. It shows a thumbnail grid of all found images and lets users download them individually or as a ZIP archive.',
    dependencies: "pdf.js"
  },
  {
    id: "154",
    name: "SQL Formatter",
    slug: "sql-formatter",
    category: "Developer",
    description: 'Reindents and rewrites SQL queries with configurable dialect support (MySQL, PostgreSQL, SQL Server, BigQuery) and keyword-case preference. Data analysts and backend engineers reviewing complex joins or long CTEs use it before committing queries to shared codebases. It highlights syntax errors inline and warns about implicit grouping or missing WHERE clauses as it formats.',
    dependencies: "sql-formatter"
  },
  {
    id: "155",
    name: "UUID Generator",
    slug: "uuid-generator",
    category: "Developer",
    description: 'Generates UUID v4 random identifiers in standard 36-character string format with an optional compact hex mode (no dashes). Software engineers provisioning database primary keys, creating API resource IDs, or assigning session tokens use it to avoid collisions without a central authority. It produces a batch of up to 50 UUIDs at once so users can copy an entire seed set in one action.',
    dependencies: "uuid"
  },
  {
    id: "156",
    name: "HEX to RGB Converter",
    slug: "hex-to-rgb-converter",
    category: "Design",
    description: 'Hex to RGB Converter parses hex color codes and outputs the corresponding RGB and RGBA values. Frontend developers and designers use it for precise color translation between CSS formats. It also shows a color swatch preview and converts back from RGB to hex.',
    dependencies: "Vanilla JS"
  },
  {
    id: "157",
    name: "BMR Calculator",
    slug: "bmr-calculator",
    category: "Health",
    description: 'Calculates Basal Metabolic Rate using the Mifflin-St Jeor equation, accepting age, sex, height, and weight to estimate daily caloric expenditure at rest. Nutritionists and weight-loss clients use it to determine baseline calorie targets for diet planning and body composition goals. This tool surfaces both BMR in calories per day and estimated maintenance calories adjusted for five activity levels from sedentary to extra active.',
    dependencies: "Vanilla JS"
  },
  {
    id: "158",
    name: "Meta Tag Generator",
    slug: "meta-tag-generator",
    category: "SEO",
    description: 'Builds a complete block of HTML meta tags including title, description, Open Graph, Twitter Cards, and canonical URL from an interactive form. Content marketers and web developers use it to craft preview snippets that control how pages appear in search results and social feeds. It live-previews the Google SERP snippet and the Facebook/Twitter card as you type.',
    dependencies: "Vanilla JS"
  },
  {
    id: "159",
    name: "Text to Binary",
    slug: "text-to-binary",
    category: "Developer",
    description: 'Encodes any Unicode string into its binary (base-2) representation, byte by byte, with visible byte-boundary separators. Computer-science students learning data representation and embedded-systems developers verifying bit patterns use it for teaching and debugging. It highlights the ASCII-range bytes in a different color so readable characters stand out from control codes.',
    dependencies: "Vanilla JS"
  },
  {
    id: "160",
    name: "Binary to Text",
    slug: "binary-to-text",
    category: "Developer",
    description: 'Decodes space- or comma-separated binary strings back into human-readable Unicode text, rejecting malformed groups with an exact-position error indicator. Firmware engineers reading memory dumps and students checking homework solutions use it to reverse binary encoding without writing a script. It accepts variable-length binary groups (7-bit or 8-bit) and infers the intended encoding automatically.',
    dependencies: "Vanilla JS"
  },
  {
    id: "161",
    name: "Break-Even Calculator",
    slug: "break-even-calculator",
    category: "Finance",
    description: 'Determines the exact unit volume or revenue required to cover fixed and variable costs, with a built-in sensitivity slider for price changes. Entrepreneurs writing business plans, product managers launching new SKUs, and investors reviewing unit economics use it to de-risk spending decisions. It draws an interactive chart that shades the loss and profit regions relative to the break-even point.',
    dependencies: "Vanilla JS"
  },
  {
    id: "162",
    name: "Conversion Rate Calculator",
    slug: "conversion-rate-calculator",
    category: "Marketing",
    description: 'Conversion Rate Calculator divides conversions by total visitors and displays the rate as a percentage with configurable decimal precision. Marketers and ecommerce operators use it to measure campaign or landing page performance. It optionally computes the statistical margin of error for the given sample size.',
    dependencies: "Vanilla JS"
  },
  {
    id: "163",
    name: "CPM Calculator",
    slug: "cpm-calculator",
    category: "Marketing",
    description: 'CPM Calculator computes cost per mille by dividing total ad spend by impressions and multiplying by 1000. Media buyers and advertisers use it to compare campaign efficiency across different publishers. It includes a reverse mode that estimates required impressions from a target CPM.',
    dependencies: "Vanilla JS"
  },
  {
    id: "164",
    name: "ROAS Calculator",
    slug: "roas-calculator",
    category: "Marketing",
    description: 'ROAS Calculator divides ad revenue by ad spend to return a return-on-ad-spend ratio. Performance marketers and ecommerce managers use it to evaluate campaign profitability. It shows both the ratio and the percentage return in a single result panel.',
    dependencies: "Vanilla JS"
  },
  {
    id: "165",
    name: "Podcast Transcription",
    slug: "podcast-transcription",
    category: "Transcription",
    description: 'Podcast Transcription processes long-form audio files through browser-based speech recognition optimized for extended durations. Podcasters and accessibility teams use it to generate show transcripts for SEO and hearing-impaired listeners. It automatically segments the transcript by detected speaker changes.',
    dependencies: "Whisper API"
  },
  {
    id: "166",
    name: "CSS Minifier",
    slug: "css-minifier",
    category: "Developer",
    description: 'Removes unnecessary whitespace, comments, and trailing semicolons from CSS, while merging identical selector blocks where safe to do so. Frontend developers and build-toolchain authors use it to shrink stylesheet payloads for faster page loads in production. It reports the exact number of duplicate declarations eliminated and the final file-size reduction percentage.',
    dependencies: "clean-css"
  },
  {
    id: "167",
    name: "Markdown to HTML",
    slug: "markdown-to-html",
    category: "Converter",
    description: 'Renders GitHub-Flavored Markdown into semantic, accessible HTML with proper heading hierarchy, code syntax highlighting, and table markup. Technical writers and documentation maintainers use it to publish READMEs, wiki pages, or blog posts without touching raw HTML. It supports extended syntax like task lists, footnotes, and strikethrough that standard Markdown parsers omit.',
    dependencies: "marked.js"
  },
  {
    id: "168",
    name: "Compare PDF Files",
    slug: "compare-pdf-files",
    category: "PDF",
    description: 'Performs pixel-level and text-level comparison of two PDF files, highlighting every difference with color-coded overlay annotations. Contract reviewers and compliance officers use it to spot unauthorized changes between document revisions without reading every page. It generates a side-by-side diff report that marks additions in green, deletions in red, and layout shifts in yellow.',
    dependencies: "pdf.js"
  },
  {
    id: "169",
    name: "Favicon Generator",
    slug: "favicon-generator",
    category: "Design",
    description: 'Favicon Generator converts text initials, uploaded images, or emoji into .ico and PNG favicon files. Developers and site owners use it to create favicons without needing image editing software. It outputs all required sizes (16×16, 32×32, 48×48) in a single download.',
    dependencies: "Sharp / jimp"
  },
  {
    id: "170",
    name: "Case Converter",
    slug: "case-converter",
    category: "Text",
    description: 'Transforms text between uppercase, lowercase, title case, sentence case, camelCase, PascalCase, snake_case, and kebab-case with a single click. Developers, editors, and data-entry operators use it to normalize inconsistent formatting in bulk or to reformat code identifiers. It intelligently handles edge cases like apostrophes in title case and preserves acronyms in camelCase conversion.',
    dependencies: "Vanilla JS"
  },
  {
    id: "171",
    name: "Keyword Density Checker",
    slug: "keyword-density-checker",
    category: "SEO",
    description: 'Parses pasted or uploaded text to count total words, unique terms, and per-keyword frequency as a percentage, sorted by density descending. Copywriters and content strategists use it to detect keyword stuffing and ensure natural distribution across blog posts and landing pages. It highlights every occurrence of a selected keyword directly in the source text for contextual review.',
    dependencies: "Vanilla JS"
  },
  {
    id: "172",
    name: "Base64 to Image",
    slug: "base64-to-image",
    category: "Developer",
    description: 'Decodes a Base64 data string back into its original image format and displays a preview directly in the browser with a download button. Frontend developers and QA engineers use it to inspect encoded image data embedded in API responses, CSS data URIs, or email attachments without writing a decoder script. The tool automatically detects the image MIME type from the Base64 header and warns if the string is malformed or truncated before attempting to render.',
    dependencies: "Vanilla JS"
  },
  {
    id: "174",
    name: "MD5 Hash Generator",
    slug: "md5-hash-generator",
    category: "Developer",
    description: 'Computes the 128-bit MD5 hash of any input text or uploaded file, returned as a 32-character hexadecimal string with optional uppercase. Developers verifying file integrity after downloads and QA engineers checking that test artifacts have not mutated use it as a quick checksum tool. It accepts file uploads up to 50 MB so users can hash binaries without a command-line utility.',
    dependencies: "CryptoJS"
  },
  {
    id: "175",
    name: "HTML Minifier",
    slug: "html-minifier",
    category: "Developer",
    description: 'Removes unnecessary whitespace, comments, and optional closing tags from HTML code to reduce file size without altering rendered output. Web performance engineers and static-site deployers use it to optimize pages before publishing, improving load times and Core Web Vitals scores. The minifier intelligently preserves conditional comments, server-side includes, and data attributes while aggressively removing all other non-functional markup.',
    dependencies: "html-minifier"
  },
  {
    id: "176",
    name: "Barcode Generator",
    slug: "barcode-generator",
    category: "Utility",
    description: 'Generates scannable barcodes in major symbologies including EAN-13, Code 128, QR Code, and UPC-A from typed input or pasted data. Retailers, warehouse managers, and product designers use it to create labels without specialized hardware or expensive licensing. It validates check digits automatically and guarantees compliance with GS1 formatting rules.',
    dependencies: "JsBarcode"
  },
  {
    id: "177",
    name: "AI Regex Generator",
    slug: "ai-regex-generator",
    category: "AI",
    description: 'Accepts a natural-language sentence describing a text-matching rule—such as ‘find all US phone numbers with area codes’—and returns a ready-to-use regular expression. Non-technical professionals and junior developers use it to generate accurate regex patterns without learning regex syntax. The generator explains each token in the output pattern with inline comments so users can verify and customize the generated expression.',
    dependencies: "OpenAI API"
  },
  {
    id: "178",
    name: "AI Business Idea Generator",
    slug: "ai-business-idea-generator",
    category: "AI",
    description: 'Synthesizes market trends, technological capabilities, and pain-point databases to generate concrete business concepts with rough TAM estimates. Aspiring entrepreneurs and innovation teams use it to discover underserved niches and validate assumptions before building a prototype. Each idea includes a one-sentence pitch, a suggested business model (SaaS, marketplace, etc.), and three hypothetical competitors.',
    dependencies: "OpenAI API"
  },
  {
    id: "179",
    name: "AI Slogan Generator",
    slug: "ai-slogan-generator",
    category: "AI",
    description: 'Generates catchy, brand-aligned taglines from a brief description of your product, audience, and tone preference. Startup founders and marketing teams use it to brainstorm positioning before investing in ad creative. It groups slogans by emotional angle—humorous, authoritative, aspirational—so you can pick the right voice.',
    dependencies: "OpenAI API"
  },
  {
    id: "180",
    name: "AI Poem Generator",
    slug: "ai-poem-generator",
    category: "AI",
    description: 'Writes original poetry in forms ranging from haiku and sonnet to free verse, matching a requested mood or theme. Poets and event planners use it to draft personalized verses for invitations, memorials, or creative projects. It respects syllable counts for structured forms and offers rhyme-scheme options.',
    dependencies: "OpenAI API"
  },
  {
    id: "181",
    name: "PGP Key Generator",
    slug: "pgp-key-generator",
    category: "Privacy",
    description: 'Generates RSA (2048/4096) or ECDSA (Curve25519) PGP key pairs with customizable user IDs, expiration dates, and passphrase protection. Developers, security researchers, and privacy advocates use it to create PGP keys for email encryption, software signing, or SSH authentication. All key generation happens in the browser using Web Crypto API—the private key material is never exposed to the network.',
    dependencies: "OpenPGP.js"
  },
  {
    id: "182",
    name: "Add Page Numbers to PDF",
    slug: "add-page-numbers-to-pdf",
    category: "PDF",
    description: 'Inserts page number labels at user-chosen positions (bottom-center, top-right, etc.) with configurable font, size, and starting offset. Law-firm paralegals preparing exhibits with Bates-style numbering and academic authors formatting theses use it to meet submission guidelines. It skips the first page automatically when the user marks it as a cover sheet so numbering starts on the correct page.',
    dependencies: "pdf-lib"
  },
  {
    id: "183",
    name: "HTML to Markdown",
    slug: "html-to-markdown",
    category: "Converter",
    description: 'Parses arbitrary HTML and converts it into clean, readable Markdown while intelligently stripping inline styles and scripts. Content migrators and web scrapers use it to transfer articles, documentation, or email templates from HTML-heavy sources into Markdown-based CMS platforms like Ghost or Obsidian. It preserves image alt text, link titles, and nested lists that naive converters routinely lose.',
    dependencies: "Turndown"
  },
  {
    id: "184",
    name: "Reverse Text Generator",
    slug: "reverse-text-generator",
    category: "Text",
    description: 'Applies multiple text-transformation effects: reverse order, reverse each word, flip upside down, mirror horizontally, and rotate 180 degrees. Puzzle makers, coders, and meme creators use it to create cryptic messages or visually interesting text effects. Each transformation shows a live preview and the Unicode code points used so you understand the mechanics behind the effect.',
    dependencies: "Vanilla JS"
  },
  {
    id: "185",
    name: "Zalgo Text Generator",
    slug: "zalgo-text-generator",
    category: "Text",
    description: 'Adds combining diacritical marks above, below, and through each character to create intentionally corrupted ‘zalgo’ glitch text. Discord moderators, horror-game developers, and internet culture enthusiasts use it to create unsettling usernames or thematic visual effects. You can independently control the intensity of marks above, below, and inside the text for fine-grained distortion.',
    dependencies: "Vanilla JS"
  },
  {
    id: "186",
    name: "Invisible Text Generator",
    slug: "invisible-text-generator",
    category: "Text",
    description: 'Generates blank Unicode characters—zero-width spaces, hair spaces, and invisible separators—that appear as empty text. Privacy-conscious users and developers use it to hide metadata in text, test rendering engines, or create seemingly blank social-media bios. Each generated character includes its Unicode hex code and a visible-mode toggle so you can confirm what is actually there.',
    dependencies: "Vanilla JS"
  },
  {
    id: "187",
    name: "LTV Calculator",
    slug: "ltv-calculator",
    category: "Finance",
    description: 'Projects customer lifetime value using average order value, purchase frequency, gross margin, and estimated customer lifespan in months. Subscription-business founders, growth marketers, and finance analysts use it to gauge whether customer-acquisition spend will pay back over time. It compares LTV against a user-supplied CAC figure and flags whether the ratio falls below the healthy 3:1 benchmark.',
    dependencies: "Vanilla JS"
  },
  {
    id: "188",
    name: "CAC Calculator",
    slug: "cac-calculator",
    category: "Finance",
    description: 'Divides total sales-and-marketing spend by the number of new customers acquired in the same period to produce a blended acquisition cost. Startup operators and VC-funded growth teams use it to track unit-economics health month over month. It breaks down the total into channel-level subtotals (paid ads, referrals, content) so users can see which pipeline is cheapest.',
    dependencies: "Vanilla JS"
  },
  {
    id: "189",
    name: "Burn Rate Calculator",
    slug: "burn-rate-calculator",
    category: "Finance",
    description: 'Calculates gross burn, net burn, and runway (in months) from monthly revenue, operating expenses, and current cash balance. Startup founders and CFOs use it to project how long their capital will last before the next fundraise. It supports scenario modeling so you can adjust expense cuts or revenue growth assumptions in real time.',
    dependencies: "Vanilla JS"
  },
  {
    id: "190",
    name: "Net Promoter Score Calculator",
    slug: "net-promoter-score-calculator",
    category: "Marketing",
    description: 'Net Promoter Score Calculator categorizes survey responses into promoters, passives, and detractors, then subtracts the detractor percentage from the promoter percentage. Customer experience teams and product managers use it to track loyalty metrics from raw survey data. It accepts bulk input so you can paste an entire column of 0–10 ratings at once.',
    dependencies: "Vanilla JS"
  },
  {
    id: "191",
    name: "XML to CSV",
    slug: "xml-to-csv",
    category: "Converter",
    description: 'Parses XML documents of any depth and transforms elements and attributes into a tabular CSV structure with automatically generated column paths. Database administrators and ETL developers use this to migrate legacy XML data into relational databases or analytics tools that require flat inputs. It resolves repeating elements into multiple rows while keeping sibling context intact, avoiding the one-row-per-file trap.',
    dependencies: "xml2js / PapaParse"
  },
  {
    id: "192",
    name: "PDF Metadata Editor",
    slug: "pdf-metadata-editor",
    category: "PDF",
    description: 'Displays and allows editing of standard PDF metadata fields: title, author, subject, keywords, and producer. Librarians cataloging digital archives and compliance officers who need to stamp documents with department tags use it directly in the browser. It preserves all XMP metadata already present in the file and only overwrites the field the user explicitly changes.',
    dependencies: "pdf-lib"
  },
  {
    id: "193",
    name: "SVG Editor",
    slug: "svg-editor",
    category: "Design",
    description: 'SVG Editor provides a visual canvas for manipulating SVG elements with node selection, transform handles, and attribute editing. Icon designers and frontend developers use it to tweak SVG assets without launching a full vector tool. The editor exports clean, non-prettified SVG markup that matches your visual adjustments exactly.',
    dependencies: "SVGO / Fabric.js"
  },
  {
    id: "194",
    name: "Robots.txt Generator",
    slug: "robots-txt-generator",
    category: "SEO",
    description: 'Produces a robots.txt file from a point-and-click form where you set allowed and disallowed paths, crawl delays, and sitemap references per user-agent. Webmasters and site-launch teams use it to block staging environments from search engines while keeping the live domain fully indexable. It validates the output against Google’s official robots.txt parser before you download.',
    dependencies: "Vanilla JS"
  },
  {
    id: "195",
    name: "SaaS Pricing Calculator",
    slug: "saas-pricing-calculator",
    category: "Finance",
    description: 'Models subscription revenue across tiers (free, monthly, annual) with inputs for conversion rate, churn, customer count, and average revenue per user. Product managers and growth teams use it to compare the impact of pricing changes on MRR, ARR, and customer lifetime value. It plots a waterfall chart showing how each tier contributes to total revenue.',
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
    description: 'Generates random MAC addresses in six common formats (Unix, Windows, Cisco, colon-separated, hyphen-separated, and dot-separated) with optional OUI prefix filtering. Network engineers and QA testers use it to create spoofed addresses for device testing, network simulation, or privacy masking. You can specify a custom OUI to generate addresses that appear to belong to a specific hardware vendor.',
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
    description: 'Transforms well-formed XML documents into equivalent JSON structures, mapping attributes to prefixed keys and text content to a configurable key name. Integration engineers migrating SOAP-based integrations to RESTful APIs and data pipeline developers use it to normalize legacy payloads. It detects repeated sibling elements and converts them into JSON arrays automatically to preserve cardinality.',
    dependencies: "xml2js"
  },
  {
    id: "200",
    name: "Braille Translator",
    slug: "braille-translator",
    category: "Text",
    description: 'Bidirectional converter between standard English text and Grade 1 (uncontracted) or Grade 2 (contracted) Braille. Accessibility specialists, educators of visually impaired students, and transcribers use it to prepare learning materials and verify Braille correctness. It renders the Braille output both as Unicode Braille patterns and as a visual dot diagram for learning purposes.',
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
    description: 'Crops Aadhaar card images to the standard 3.5 x 3.5 cm wallet-photo size, automatically detecting the face region using OpenCV Haar cascades. Indian citizens and HR teams use it to prepare identification photos for government forms, PF accounts, and employee records. It applies a white background and meets the exact pixel dimensions required by UIDAI guidelines.',
    dependencies: "Canvas API"
  },
  {
    id: "203",
    name: "PAN Card Resizer",
    slug: "pan-card-resizer",
    category: "indian-utilities",
    description: 'Resizes PAN card images to 3 x 4 cm (the standard size for laminated identification) while maintaining legibility of the printed text and hologram. Tax consultants and CA firms use it to prepare client PAN cards for ITR filings and KYC documentation. It keeps the original DPI at 300 so the resized card remains crisp when printed.',
    dependencies: "Canvas API"
  },
  {
    id: "204",
    name: "KB Image Compressor",
    slug: "kb-image-compressor",
    category: "indian-utilities",
    description: 'Compresses JPEG and PNG images to a specific kilobyte target (e.g., 20 KB, 100 KB, 200 KB) using binary-search quantization until the file size falls just under the limit. Government-job applicants and exam portals use it to resize photographs and signatures for online application forms. It never crops or stretches the image—only adjusts quality and strips metadata to stay within the bound.',
    dependencies: "browser-image-compression"
  }

,
  {
    id: "210",
    name: "Live Transcription",
    slug: "live-transcription",
    category: "Transcription",
    description: 'Live Transcription performs real-time speech-to-text using the browser’s native microphone API with continuous streaming output. Remote meeting participants and journalists use it to capture spoken dialogue as it happens. It maintains a rolling buffer so you can scroll back through the session without losing the current stream.',
    dependencies: "Web Speech API"
  },
  {
    id: "211",
    name: "Image Bulk Converter",
    slug: "image-bulk-converter",
    category: "Image",
    description: 'Processes an arbitrary number of uploaded images sequentially, converting between JPEG, PNG, WebP, AVIF, GIF, and TIFF in a single batch. Graphic designers and print-shop operators use it to standardize a folder of mixed-format assets before delivery. It runs entirely in your browser via WebAssembly—nothing is uploaded to a server.',
    dependencies: "browser-image-compression / jszip"
  },
  {
    id: "212",
    name: "eSign PDF",
    slug: "esign-pdf",
    category: "PDF",
    description: 'Places a typed, drawn, or uploaded signature image onto a specific page and coordinate of a PDF document. Contract managers closing agreements remotely and freelancers signing engagement letters use it to finalize documents without printing or scanning. It generates a signed-timestamp footer that records the browser’s approximate signing time so the PDF shows evidence of when it was completed.',
    dependencies: "pdf-lib / fabric"
  },
  {
    id: "213",
    name: "PDF OCR (Scanned Docs)",
    slug: "pdf-ocr",
    category: "PDF",
    description: 'Extracts searchable text from scanned PDF documents and image-only PDFs using optical character recognition with language auto-detection. Archivists and digitization teams use it to make scanned books, invoices, or historical records text-searchable and copy-pasteable. It supports 130+ languages and outputs a text layer directly embedded back into the PDF for full searchability.',
    dependencies: "tesseract.js"
  },
  {
    id: "214",
    name: "PDF Form Filler",
    slug: "pdf-form-filler",
    category: "PDF",
    description: 'Detects interactive form fields in a PDF and provides a clean UI to fill text inputs, checkboxes, and dropdowns before downloading the completed document. Recruiters, insurance agents, and HR staff use it to fill standard forms without printing, scanning, or buying Acrobat Pro. Filled forms can be flattened into a non-editable PDF to prevent tampering after submission.',
    dependencies: "pdf-lib"
  },
  {
    id: "216",
    name: "AI Document Chat (RAG)",
    slug: "ai-document-chat",
    category: "AI",
    description: 'Indexes uploaded PDFs, Word files, and plain-text documents into a vector store and lets you ask natural-language questions about their contents. Researchers, legal professionals, and students use it to extract facts from long reports or contracts without reading every page. It cites the exact source paragraph for every answer so you can verify claims instantly.',
    dependencies: "CF Vectorize"
  },
  {
    id: "217",
    name: "AI Video Subtitler",
    slug: "ai-video-subtitler",
    category: "AI",
    description: 'Transcribes speech from video files and syncs the resulting subtitles to the exact timing of each utterance. Content creators and accessibility teams use it to caption videos for hearing-impaired viewers or multi-language audiences. It supports dual-language subtitle tracks so viewers can read translations alongside the original audio.',
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
    name: 'GST Invoice Generator',
    slug: 'gst-invoice-generator',
    description: 'Generates PDF invoices fully compliant with Indian GST rules, including mandatory fields like HSN/SAC codes, GSTIN, place of supply, and tax breakdown (CGST, SGST, IGST). Small business owners and freelancers registered under GST use it to create professional invoices without subscribing to paid accounting software. The generator auto-calculates tax amounts based on the selected GST rate and reverse-charges mechanism, and exports a ZIP archive of all invoices when processing in batch mode.',
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
    description: 'Accepts an 11-character IFSC code and returns the corresponding bank name, branch address, city, district, state, and contact details from the official RBI database. Indian banking customers and fintech developers use it to validate account routing details before initiating NEFT, RTGS, or IMPS transfers. The lookup caches results locally for 24 hours and supports partial matches, returning up to five candidate branches when the full code is uncertain.',
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
    description: 'Converts WebP images to standard PNG format with full transparency support. Designers and web developers use it when they need to use WebP-sourced assets in applications or contexts that only accept PNG. It preserves the original resolution and all alpha channel data during conversion.',
    category: 'Image',
    id:  "245",
    dependencies: 'Canvas API'
  },
  {
    name: 'JFIF to PNG Converter',
    slug: 'jfif-to-png',
    description: 'Converts JFIF (JPEG File Interchange Format) images to standard PNG format without quality loss. Photographers and graphic designers use it to normalize JPEG-derived formats before editing or archival. It strips the JFIF wrapper and saves as a clean PNG with sRGB color profile.',
    category: 'Image',
    id:  "246",
    dependencies: 'Canvas API'
  },
  {
    name: 'HEIC to PNG Converter',
    slug: 'heic-to-png',
    description: 'Converts Apple HEIC/HEIF images to universally compatible PNG format with a batch queue for processing multiple photos. iPhone users and cross-platform workers who need to share HEIC photos with Windows or Android recipients use it for seamless compatibility. It preserves EXIF metadata and processes Live Photos by extracting the primary still frame.',
    category: 'Image',
    id:  "247",
    dependencies: 'libheif WASM'
  },
  {
    name: 'Image to JPG Converter',
    slug: 'convert-to-jpg',
    description: 'Converts any image format — PNG, WebP, BMP, GIF, TIFF — to standard JPG with configurable quality settings. Social media managers and web developers use it to unify mixed-format image sets into JPG before uploading to bandwidth-sensitive platforms. It automatically fills transparency with a white background since JPG does not support alpha channels.',
    category: 'Image',
    id:  "248",
    dependencies: 'Canvas API'
  },
  {
    name: 'Rotate Image Online',
    slug: 'rotate-image',
    description: 'Rotates images left or right by 90-degree increments instantly in the browser with no upload required. Photography editors and graphic designers fixing horizon-alignment issues or reorienting mobile-captured photos use it for quick corrections. The tool preserves the full image resolution and EXIF orientation metadata after rotation.',
    category: 'Image',
    id:  "249",
    dependencies: 'Canvas API'
  },
  {
    name: 'Blur Face Online',
    slug: 'blur-face',
    description: 'Detects faces in uploaded images using AI-powered computer vision and applies an adjustable blur effect to each detected face. Privacy-conscious journalists, content creators, and real-estate photographers use it to anonymize people in public photos before publishing. It supports multiple face detection and lets you toggle individual face blur on or off.',
    category: 'Image',
    id:  "250",
    dependencies: 'AI API'
  },
  {
    name: 'HTML to Image Converter',
    slug: 'html-to-image',
    description: 'Renders custom HTML and CSS markup into downloadable PNG, JPG, or SVG images directly in the browser. Frontend developers and marketers use it to generate dynamic social-media cards, email headers, or quote graphics without a design tool. It captures the DOM at the exact pixel dimensions specified and supports Google Fonts and CSS animations.',
    category: 'Developer',
    id:  "251",
    dependencies: 'html2canvas'
  },
  {
    name: 'Apple Music Preview Extractor',
    slug: 'apple-music-preview-extractor',
    description: 'Extracts publicly available 30-to-90-second audio preview clips from Apple Music by resolving the store URL. Music curators, reviewers, and content creators use it to obtain short audio snippets for commentary, reviews, or playlist previews. The extractor pulls the highest-bitrate AAC preview available from Apple\'s CDN.',
    category: 'Audio',
    id:  "252",
    dependencies: 'fetch API'
  },
  {
    name: 'Twitch Thumbnail Downloader',
    slug: 'twitch-thumbnail-downloader',
    description: 'Downloads the publicly cached preview thumbnail images from Twitch streams, clips, and videos by parsing the Twitch CDN URL pattern. Streamers and content managers use it to grab high-resolution thumbnails for promotional posts, video compilations, or social media. It offers all available thumbnail sizes from 160x90 up to 1920x1080.',
    category: 'Downloader',
    id:  "253",
    dependencies: 'fetch API'
  },
  {
    name: 'Dailymotion Downloader',
    slug: 'dailymotion-downloader',
    description: 'Downloads Dailymotion videos in multiple quality options by extracting direct MP4 stream URLs from the video metadata. Video archivists and content curators use it to save embedded Dailymotion clips before they are removed or made private. It lists every available resolution from 240p to 4K and reports file sizes before download.',
    category: 'Video',
    id:  "254",
    dependencies: 'fetch API'
  },
  {
    name: 'AI Placeholder Content Generator',
    slug: 'ai-placeholder-content-generator',
    description: 'Generates realistic placeholder text, blog posts, product descriptions, and website copy using AI from a few keyword prompts. Web designers and content strategists use it to populate wireframes and mockups with natural-sounding filler content instead of lorem ipsum. Each generation includes configurable tone options, word count, and section headings.',
    category: 'AI',
    id:  "255",
    dependencies: 'AI API'
  },
  {
    name: 'AI Brand Color Palette Generator',
    slug: 'brand-color-palette-generator',
    description: 'Generates harmonious brand color palettes with hex codes, color meanings, and suggested usage contexts based on industry and mood inputs. Startup founders and graphic designers use it to build professional color systems without color theory expertise. Each palette includes primary, secondary, accent, neutral, and surface colors with contrast ratio validation.',
    category: 'Design',
    id:  "256",
    dependencies: 'AI API'
  },
  {
    name: 'Marriage Biodata Maker',
    slug: 'marriage-biodata-maker',
    description: 'Creates printable matrimonial biodata forms with sections for personal details, family background, education, career, and partner preferences. Indian families and matchmaking services use it to prepare standardized biodata sheets for rishta portals and matrimonial events. The output is a clean A4-printable PDF with customizable accent colors and photo placement.',
    category: 'indian-utilities',
    id:  "257",
    dependencies: 'jsPDF'
  },
  {
    name: 'Rental Agreement Generator',
    slug: 'rental-agreement-generator',
    description: 'Generates customizable rental lease and license agreements compliant with Indian property laws including leave-and-license and tenancy formats. Landlords, tenants, and property managers in India use it to draft standardized rental contracts without lawyer fees. It covers key clauses: security deposit, maintenance responsibilities, notice period, rent escalation, and stamp duty reference.',
    category: 'indian-utilities',
    id:  "258",
    dependencies: 'jsPDF'
  },
  {
    name: 'Resume ATS Score Checker',
    slug: 'resume-ats-score-checker',
    description: 'Analyzes uploaded resumes against a job description using AI to calculate an ATS compatibility score and provide actionable suggestions. Job seekers and career coaches use it to optimize resumes before applying to roles that use automated screening systems. It returns keyword match analysis, formatting recommendations, and a section-by-section breakdown of strengths.',
    category: 'AI',
    id:  "259",
    dependencies: 'AI API'
  },
  {
    name: 'Instagram Media Downloader',
    slug: 'instagram-story-downloader',
    description: 'Downloads Instagram posts, reels, and stories by resolving media URLs through Instagram\'s public oEmbed API. Social media managers and content creators use it to archive their own content or save public posts for offline reference. It supports both single and carousel posts and extracts the highest-resolution version of each image or video.',
    category: 'Downloader',
    id:  "260",
    dependencies: 'fetch API'
  },
  {
    name: 'WhatsApp Toolkit',
    slug: 'whatsapp-toolkit',
    description: 'Generates wa.me click-to-chat links, WhatsApp group invite links, QR codes for quick connections, and includes a chat analyzer and status text designer. Small business owners and customer support teams use it to streamline WhatsApp-based customer interactions and marketing campaigns. The chat analyzer extracts call-volume patterns from exported chat logs without uploading any data.',
    category: 'Utility',
    id:  "261",
    dependencies: 'QRCode.js'
  },
  {
    name: 'Indian Document Enhancer',
    slug: 'indian-document-enhancer',
    description: 'Enhances scanned images of Indian identification documents — Aadhaar, PAN, Voter ID, Driving License — for upload compliance on government and banking portals. Indian citizens and CA firms use it to adjust brightness, contrast, and DPI to meet the specific pixel and file-size requirements of each portal. It auto-crops to the document boundary and strips unnecessary background.',
    category: 'indian-utilities',
    id:  "262",
    dependencies: 'Canvas API'
  },
  {
    name: 'AI Complaint Letter Generator',
    slug: 'ai-complaint-letter-generator',
    description: 'Generates AI-powered formal complaint letters and legal notices tailored to Indian consumer protection, banking, and service scenarios. Indian consumers and legal aid professionals use it to draft structured complaints to companies, banks, insurance providers, and government authorities. Each letter references the applicable Indian law or regulation and includes placeholders for supporting document attachments.',
    category: 'indian-utilities',
    id:  "263",
    dependencies: 'AI API'
  },
  {
    name: 'Indian Voice Transcriber',
    slug: 'indian-voice-transcriber',
    description: 'Transcribes recorded audio into text with support for 12 Indian languages using browser-based speech recognition. Journalists, researchers, and field workers in India use it to convert interviews, meetings, and dictations in Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Urdu, Odia, and English. It segments the transcript by detected speaker changes and exports as SRT or plain text.',
    category: 'indian-utilities',
    id:  "264",
    dependencies: 'Web Speech API'
  },
  {
    name: 'Bank Statement Analyser',
    slug: 'bank-statement-analyser',
    description: 'Parses uploaded bank statement PDFs or CSV exports and categorizes transactions into income, expense, and transfer categories with visual spending breakdowns. Personal finance managers and small business owners use it to understand spending patterns and create budgets without manually tagging transactions. It generates monthly trend charts, top-merchant reports, and an exportable categorized transaction table.',
    category: 'Utility',
    id:  "265",
    dependencies: 'PDF.js'
  },
  {
    name: 'AI Resume Tailor',
    slug: 'ai-resume-tailor',
    description: 'Rewrites resume sections to better match a specific job description by highlighting relevant keywords, reordering bullet points, and adjusting tone. Job seekers and recruitment consultants use it to customize applications for each role without rewriting the entire resume from scratch. It preserves factual accuracy while optimizing for ATS keyword matching and recruiter scanning patterns.',
    category: 'AI',
    id:  "266",
    dependencies: 'AI API'
  },
  {
    name: 'AI Legal Agreement Generator',
    slug: 'ai-legal-agreement-generator',
    description: 'Generates legally sound agreement templates for Indian contexts including NDAs, rental agreements, employment contracts, service level agreements, and partnership deeds. Startup founders and freelancers in India use it to create enforceable legal documents without engaging a lawyer for routine contracts. Each generated agreement includes jurisdiction-specific clauses, dispute resolution mechanisms, and e-signature placeholders.',
    category: 'indian-utilities',
    id:  "267",
    dependencies: 'AI API'
  },
  {
    name: 'Social Media Calendar',
    slug: 'social-media-calendar',
    description: 'Lets users plan and schedule social media posts across multiple platforms in a visual calendar view with draft, scheduled, and published status tracking. Social media managers and content teams use it to maintain a consistent posting cadence across Instagram, Twitter, LinkedIn, and Facebook. It supports drag-to-reorder posts, content templates, and CSV export of the full content plan.',
    category: 'Utility',
    id:  "268",
    dependencies: 'localStorage'
  },
  {
    name: 'Bulk Background Changer',
    slug: 'bulk-bg-changer',
    description: 'Removes or replaces backgrounds on multiple images simultaneously with color-key sampling and batch processing. E-commerce photographers and product listing teams use it to standardize product photo backgrounds across an entire catalog in one operation. It supports color replacement, transparent background removal, and uniform color fill with configurable tolerance.',
    category: 'Image',
    id:  "269",
    dependencies: 'Canvas API'
  },
  {
    name: 'AI Background Changer',
    slug: 'ai-bg-changer',
    description: 'Removes and replaces image backgrounds using edge-aware detection algorithms that separate foreground subjects without a green screen. Content creators and real-estate photographers use it to swap backgrounds on portraits, product shots, and property photos for listings or social media. It offers a manual refine mode for touch-ups on complex edges like hair or foliage.',
    category: 'Image',
    id:  "270",
    dependencies: 'Canvas API'
  },
  {
    name: 'Link in Bio Builder',
    slug: 'link-in-bio-builder',
    description: 'Creates customizable link-in-bio landing pages with profile photo, bio, multiple social media links, and custom icon selection. Instagram creators and TikTok influencers use it to build a central hub linking to all their content, stores, and affiliate pages. The output is a self-contained HTML file that can be hosted on GitHub Pages, Vercel, or any static host.',
    category: 'Branding',
    id:  "271",
    dependencies: 'None'
  },
  {
    name: 'IST Time Converter',
    slug: 'ist-time-converter',
    description: 'Converts Indian Standard Time (IST) to other major world time zones and performs UTC-to-IST and IST-to-UTC conversions with DST awareness. Remote teams working with Indian colleagues and travelers planning calls or flights to/from India use it to accurately translate time across zones. It displays the current IST offset and highlights overlapping business hours between IST and the selected target zone.',
    category: 'Utility',
    id:  "272",
    dependencies: 'None'
  },
  {
    name: 'Audio Converter',
    slug: 'audio-converter',
    description: 'Converts audio files between MP3, WAV, OGG, and FLAC formats using FFmpeg WASM running entirely in the browser. Podcasters and audio editors use it to normalize file formats across a production pipeline without installing desktop software. It preserves ID3 metadata tags during conversion and displays estimated file size changes before processing.',
    category: 'Audio',
    id:  "273",
    dependencies: 'FFmpeg WASM'
  },
  {
    name: 'PDF Page Manager',
    slug: 'pdf-page-manager',
    description: 'Manages PDF pages with crop, organize, extract, rotate, and delete operations in a single unified interface with visual page thumbnails. Office administrators and legal professionals use it to clean up scanned PDFs, reorder pages, and prepare documents for submission. It renders a thumbnail strip of all pages and supports keyboard shortcuts for bulk operations on large documents.',
    category: 'PDF',
    id:  "274",
    dependencies: 'pdf-lib'
  },
  {
    name: 'Bulk QR Code Generator',
    slug: 'bulk-qr-code-generator',
    description: 'Processes a CSV file containing multiple data entries and generates a corresponding QR code image for each row, delivered as a ZIP archive. Event organizers and inventory managers use it to create batch-printed QR codes for nametags, asset tags, or product labels without manual repetition. The generator supports four encoding modes (URL, text, vCard, WiFi credentials) and appends a sequential filename prefix so each QR code maps back to its original CSV row.',
    category: 'Utility',
    id:  "275",
    dependencies: 'qrcode.js, JSZip'
  },
  {
    name: 'PDF AI Summariser',
    slug: 'pdf-ai-summariser',
    description: 'Uploads a PDF document, extracts its full text via OCR and native parsing, then sends the content to an LLM for a condensed summary highlighting key findings and conclusions. Researchers and business analysts use it to extract actionable insights from lengthy reports, whitepapers, or academic papers in seconds instead of hours. The summariser handles scanned PDFs with embedded images and allows the user to specify summary length and tone (executive, technical, or plain language).',
    category: 'AI',
    id:  "276",
    dependencies: 'AI API, PDF.js'
  },
  {
    name: 'YouTube Thumbnail Downloader',
    slug: 'youtube-thumbnail-downloader',
    description: 'Fetches and displays all available resolution variants of a YouTube video thumbnail — from default (120x90) up to maxresdefault (1920x1080) — given a video URL or ID. Content creators and social media managers use it to download high-resolution thumbnails for repurposing in video ads, blog embeds, or portfolio showcases. The tool extracts the video ID from any YouTube URL format and exposes all four thumbnail qualities plus the three storyboard frames in a single gallery view.',
    category: 'Downloader',
    id:  "277",
    dependencies: 'fetch API'
  }
];

const proSlugs = [
  "tiktok-video-downloader", "youtube-downloader", "instagram-video-downloader",
  "facebook-video-downloader", "twitter-video-downloader",
  "ai-translator", "pdf-to-word", "ai-image-generator", "logo-maker", "mp4-to-mp3",
  "pdf-compressor", "word-to-pdf", "ai-writing-assistant", "jpg-to-pdf",
  "plagiarism-checker", "pdf-to-jpg", "pdf-to-ppt", "background-remover",
  "object-remover", "ppt-to-pdf", "pdf-merger", "excel-to-pdf", "video-to-text-transcription",
  "social-media-post-maker", "svg-editor", "business-card-maker", "pdf-to-excel",
  "unlock-pdf", "protect-pdf", "epub-to-pdf", "pdf-to-epub", "compare-pdf-files",
  "extract-images-from-pdf", "email-signature-generator",
  "ai-thumbnail-maker", "mp3-compressor", "gif-to-mp4", "video-trimmer",
  "video-watermark-adder", "ai-blog-title-generator", "ai-hashtag-generator",
  "prompt-library-generator", "ai-changelog-generator",
  "saas-pricing-calculator", "employee-turnover-calculator",
  "pdf-to-html", "html-to-pdf", "generic-pdf-processor",
  "youtube-thumbnail-downloader"
];

export const toolsRegistry: ToolMetadata[] = rawToolsRegistry.map(tool => ({
  ...tool,
  isPro: proSlugs.includes(tool.slug)
}));

export const getToolBySlug = (slug: string) => toolsRegistry.find(t => t.slug === slug);
export const getToolsByCategory = (category: string) => toolsRegistry.filter(t => t.category === category);
export const getToolByCategoryAndSlug = (category: string, slug: string) => toolsRegistry.find(t => t.category.toLowerCase().replace(/\s+/g, '-') === category && t.slug === slug);

