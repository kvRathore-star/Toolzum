/**
 * Format metadata dictionary — single source of truth for format
 * descriptions used by generateToolDescription.ts and ToolPageSEOContent.tsx.
 */
export const FORMAT_INFO: Record<string, { name: string; fullName: string; quality: string; bestFor: string }> = {
  // Code / Data formats
  json: { name: 'JSON', fullName: 'JavaScript Object Notation', quality: 'human-readable structured data', bestFor: 'APIs, configuration files, and data exchange between web services' },
  xml: { name: 'XML', fullName: 'Extensible Markup Language', quality: 'verbose hierarchical markup', bestFor: 'enterprise systems, SOAP APIs, document formats like DOCX and SVG' },
  yaml: { name: 'YAML', fullName: 'YAML Ain\'t Markup Language', quality: 'human-friendly configuration', bestFor: 'Docker, Kubernetes, CI/CD pipelines, and application settings' },
  toml: { name: 'TOML', fullName: 'Tom\'s Obvious Minimal Language', quality: 'explicit key-value configuration', bestFor: 'Rust Cargo, Python pyproject.toml, and modern config files' },
  csv: { name: 'CSV', fullName: 'Comma-Separated Values', quality: 'tabular plain text', bestFor: 'spreadsheets, database exports, and data imports' },
  html: { name: 'HTML', fullName: 'HyperText Markup Language', quality: 'semantic document markup', bestFor: 'web pages, email templates, and content rendering' },
  css: { name: 'CSS', fullName: 'Cascading Style Sheets', quality: 'styling rules', bestFor: 'web design, responsive layouts, and visual presentation' },
  js: { name: 'JavaScript', fullName: 'JavaScript', quality: 'dynamic scripting', bestFor: 'web interactivity, Node.js backends, and browser automation' },
  ts: { name: 'TypeScript', fullName: 'TypeScript', quality: 'typed JavaScript superset', bestFor: 'large-scale applications with type safety and better IDE support' },
  jsx: { name: 'JSX', fullName: 'JavaScript XML', quality: 'component markup', bestFor: 'React component definitions and UI rendering' },
  tsx: { name: 'TSX', fullName: 'TypeScript JSX', quality: 'typed component markup', bestFor: 'React components with TypeScript type checking' },
  py: { name: 'Python', fullName: 'Python', quality: 'readable scripting', bestFor: 'data science, automation, web backends, and machine learning' },
  sql: { name: 'SQL', fullName: 'Structured Query Language', quality: 'database query', bestFor: 'relational database operations, data analysis, and reporting' },
  md: { name: 'Markdown', fullName: 'Markdown', quality: 'lightweight markup', bestFor: 'documentation, README files, and content authoring' },
  scss: { name: 'SCSS', fullName: 'Sassy CSS', quality: 'preprocessed styles', bestFor: 'large-scale CSS with variables, mixins, and nesting' },
  sass: { name: 'Sass', fullName: 'Syntactically Awesome Style Sheets', quality: 'indented syntax', bestFor: 'concise CSS with minimal punctuation' },
  graphql: { name: 'GraphQL', fullName: 'GraphQL', quality: 'type-safe API query', bestFor: 'efficient data fetching with precise field selection' },
  ini: { name: 'INI', fullName: 'Initialization File', quality: 'simple key-value config', bestFor: 'application settings and legacy configuration' },
  swift: { name: 'Swift', fullName: 'Swift', quality: 'compiled systems language', bestFor: 'iOS/macOS apps and high-performance Apple ecosystem software' },
  java: { name: 'Java', fullName: 'Java', quality: 'compiled bytecode', bestFor: 'enterprise applications, Android apps, and cross-platform systems' },
  c: { name: 'C', fullName: 'C', quality: 'systems programming', bestFor: 'operating systems, embedded firmware, and performance-critical code' },
  cpp: { name: 'C++', fullName: 'C++', quality: 'systems with OOP', bestFor: 'game engines, high-performance computing, and system software' },
  go: { name: 'Go', fullName: 'Go', quality: 'compiled concurrency', bestFor: 'microservices, cloud infrastructure, and network tools' },
  rust: { name: 'Rust', fullName: 'Rust', quality: 'memory-safe systems', bestFor: 'WebAssembly, CLI tools, and performance-critical applications' },
  php: { name: 'PHP', fullName: 'PHP', quality: 'server-side scripting', bestFor: 'WordPress, Laravel, and web backends' },
  ruby: { name: 'Ruby', fullName: 'Ruby', quality: 'dynamic OOP scripting', bestFor: 'Rails applications, scripting, and rapid prototyping' },
  dart: { name: 'Dart', fullName: 'Dart', quality: 'compiled client language', bestFor: 'Flutter mobile apps and web frontends' },
  lua: { name: 'Lua', fullName: 'Lua', quality: 'lightweight scripting', bestFor: 'game scripting, embedded systems, and configuration' },
  jsonl: { name: 'JSONL', fullName: 'JSON Lines', quality: 'newline-delimited JSON', bestFor: 'streaming data, log files, and line-by-line processing' },
  pbf: { name: 'Protocol Buffers', fullName: 'Protocol Buffers', quality: 'binary serialization', bestFor: 'gRPC services, efficient data storage, and cross-platform communication' },
  protobuf: { name: 'Protocol Buffers', fullName: 'Protocol Buffers', quality: 'binary serialization', bestFor: 'gRPC services, efficient data storage, and cross-platform communication' },
  // Audio formats
  mp3: { name: 'MP3', fullName: 'MPEG-1 Audio Layer 3', quality: 'lossy compressed', bestFor: 'universal music playback and sharing across all devices and platforms' },
  wav: { name: 'WAV', fullName: 'Waveform Audio File Format', quality: 'uncompressed lossless', bestFor: 'professional audio editing, mastering, and archival in DAWs and production software' },
  flac: { name: 'FLAC', fullName: 'Free Lossless Audio Codec', quality: 'losslessly compressed', bestFor: 'high-fidelity music archives and audiophile listening where quality matters more than file size' },
  ogg: { name: 'OGG', fullName: 'Ogg Vorbis', quality: 'lossy compressed', bestFor: 'open-source software, Linux systems, game development, and streaming on open platforms' },
  m4a: { name: 'M4A', fullName: 'MPEG-4 Audio', quality: 'lossy or lossless (AAC/ALAC)', bestFor: 'Apple ecosystem — iTunes, iPhones, iPads, and macOS music libraries' },
  aac: { name: 'AAC', fullName: 'Advanced Audio Coding', quality: 'lossy compressed', bestFor: 'modern streaming services, YouTube, and devices where AAC is the native codec' },
  wma: { name: 'WMA', fullName: 'Windows Media Audio', quality: 'lossy compressed', bestFor: 'Windows-based media libraries, legacy devices, and corporate audio systems' },
  opus: { name: 'Opus', fullName: 'Opus Interactive Audio Codec', quality: 'lossy compressed', bestFor: 'voice-over-IP, real-time communication, and streaming at very low bitrates with excellent quality' },
  aiff: { name: 'AIFF', fullName: 'Audio Interchange File Format', quality: 'uncompressed lossless', bestFor: 'Apple professional audio — Logic Pro, GarageBand, and macOS music production workflows' },
  // Video formats
  mkv: { name: 'MKV', fullName: 'Matroska Video', quality: 'lossless container', bestFor: 'advanced video archiving with multiple subtitle tracks, chapters, and audio streams in one file' },
  mp4: { name: 'MP4', fullName: 'MPEG-4 Part 14', quality: 'lossy compressed', bestFor: 'universal video playback on any device — phones, smart TVs, web browsers, and social media' },
  mov: { name: 'MOV', fullName: 'QuickTime Movie', quality: 'lossless or lossy', bestFor: 'Apple ecosystem — Final Cut Pro, iMovie, and macOS video editing workflows' },
  webm: { name: 'WebM', fullName: 'WebM Video', quality: 'lossy compressed', bestFor: 'web-optimized video — streaming, embedded players, and HTML5 video tags with fast loading' },
  avi: { name: 'AVI', fullName: 'Audio Video Interleave', quality: 'uncompressed or lossy', bestFor: 'legacy video compatibility — older software, embedded systems, and archival playback' },
  // Image formats
  png: { name: 'PNG', fullName: 'Portable Network Graphics', quality: 'lossless', bestFor: 'graphics with sharp edges, text overlays, screenshots, and images requiring transparent backgrounds' },
  jpg: { name: 'JPEG', fullName: 'Joint Photographic Experts Group', quality: 'lossy compressed', bestFor: 'photographs, web images, and social media where smaller file size matters more than perfect quality' },
  webp: { name: 'WebP', fullName: 'Web Picture Format', quality: 'lossy or lossless', bestFor: 'modern websites — Google-recommended format with superior compression for faster page loads' },
  heic: { name: 'HEIC', fullName: 'High Efficiency Image Container', quality: 'lossy or lossless', bestFor: 'Apple device photos — iPhone and Mac default format with excellent compression efficiency' },
  avif: { name: 'AVIF', fullName: 'AV1 Image File Format', quality: 'lossy or lossless', bestFor: 'next-gen web images — royalty-free format with better compression than WebP and JPEG' },
  svg: { name: 'SVG', fullName: 'Scalable Vector Graphics', quality: 'vector (resolution-independent)', bestFor: 'logos, icons, illustrations, and any graphic that needs to scale cleanly to any size' },
  bmp: { name: 'BMP', fullName: 'Bitmap Image File', quality: 'uncompressed', bestFor: 'legacy software compatibility, raw pixel data transfers, and simple image processing tasks' },
  tiff: { name: 'TIFF', fullName: 'Tagged Image File Format', quality: 'lossless (supports layers)', bestFor: 'professional photography, print publishing, and document scanning with high color depth' },
  gif: { name: 'GIF', fullName: 'Graphics Interchange Format', quality: 'lossy (limited to 256 colors)', bestFor: 'simple animations, memes, and images on platforms that support animated GIFs natively' },
  ico: { name: 'ICO', fullName: 'Windows Icon', quality: 'lossless (multiple sizes)', bestFor: 'favicons and app icons — standard format for website bookmarks and Windows application icons' },
  jxl: { name: 'JPEG XL', fullName: 'JPEG XL', quality: 'lossy or lossless', bestFor: 'next-gen image archival — better compression than JPEG with support for wide gamut and HDR' },
  // Document formats
  pdf: { name: 'PDF', fullName: 'Portable Document Format', quality: 'fixed-layout document', bestFor: 'document sharing, printing, and archival with consistent formatting' },
  docx: { name: 'DOCX', fullName: 'Microsoft Word Document', quality: 'editable document', bestFor: 'word processing, collaboration, and document editing' },
  pptx: { name: 'PPTX', fullName: 'Microsoft PowerPoint', quality: 'presentation format', bestFor: 'slide decks, presentations, and visual storytelling' },
  xlsx: { name: 'XLSX', fullName: 'Microsoft Excel Spreadsheet', quality: 'tabular data', bestFor: 'data analysis, calculations, and spreadsheet operations' },
  epub: { name: 'EPUB', fullName: 'Electronic Publication', quality: 'reflowable ebook', bestFor: 'e-readers, mobile devices, and accessible digital books' },
  eml: { name: 'EML', fullName: 'Email Message', quality: 'email archive format', bestFor: 'email backup, archival, and forensic analysis' },
};
export const CLOUD_API_PATTERNS: readonly string[] = [
  "OpenAI API",
  "Stable Diffusion",
  "Google Cloud",
  "ExchangeRate-API",
  "YouTube Data",
  "Whisper API",
  "Mailinator",
  "LibreOffice",
  "CloudConvert",
  "MaxMind",
  "Redis",
  "AI API",
  "Google Translate",
  "Calibre",
  "DNS API",
  "Fetch API",
];

/**
 * Returns true if the tool's dependencies string matches a known
 * cloud/server-side pattern, meaning data leaves the browser.
 */
export function requiresCloudApi(deps: string): boolean {
  return CLOUD_API_PATTERNS.some((p) => deps.includes(p));
}

/**
 * Known local-safe dependency keywords. If deps is non-empty, doesn't
 * match CLOUD_API_PATTERNS, but does match one of these, it's safe to
 * claim "runs locally."
 */
const LOCAL_SAFE_PATTERNS: readonly string[] = [
  // Vanilla / browser-native
  "Vanilla JS",
  "vanilla",
  "Math.random()",
  "btoa/atob",
  "FileReader API",
  "HTML5 Canvas",
  "CSS3 Animations",
  "Browser API",
  "none",

  // Canvas / rendering
  "Canvas API",
  "html2canvas",
  "Fabric.js",
  "fabric.js",
  "Konva",
  "Cropper.js",
  "opentype.js",
  "ag-psd",

  // Crypto / security (client-side)
  "Web Crypto API",
  "Crypto API",
  "CryptoJS",
  "crypto-js",
  "zxcvbn",
  "OpenPGP.js",
  "ibantools",

  // WASM (runs in browser)
  "FFmpeg.wasm",
  "@ffmpeg/ffmpeg",
  "ffmpeg",
  "FFmpeg",
  "sql.js",
  "tesseract.js",

  // PDF (client-side)
  "pdf-lib",
  "PDF-lib",
  "PDF.js",
  "pdf.js",
  "pdfjs-dist",
  "pdf2json",
  "jsPDF",

  // Image (client-side)
  "Canvas API",
  "browser-image-compression",
  "heic2any",
  "Jimp",
  "Sharp",
  "rembg",
  "Real-ESRGAN",
  "DeOldify",
  "OpenCV",
  "Lama Cleaner",
  "exifr",
  "Piexifjs",

  // Audio (client-side)
  "Web Audio API",
  "MediaRecorder",
  "WebRTC",

  // Data parsing (client-side)
  "PapaParse",
  "SheetJS",
  "js-yaml",
  "xlsx",
  "xml2js",
  "vcard-parser",
  "ical",
  "diff-match-patch",
  "regex.js",
  "jsQR",
  "qrcode.js",
  "QRCode.js",
  "JsBarcode",
  "qrcode",

  // JS frameworks (client-side)
  "React",
  "Vue.js",

  // Storage
  "IndexedDB",
  "LocalStorage",
  "localStorage",
  "SessionStorage",
  "Service Worker",

  // Web APIs
  "WebAssembly",
  "WASM",
  "Broadcast Channel",
  "Resize Observer",
  "Intersection Observer",
  "Mutation Observer",
  "Geolocation",
  "Clipboard API",
  "Drag and Drop",
  "URL API",
  "Performance API",
  "Navigation API",
  "Web Workers",
  "WebGL",
  "WebGPU",

  // Unicode / text mapping
  "Unicode mapping",

  // Formatting libraries
  "sql-formatter",
  "Terser",
  "clean-css",
  "html-minifier",
  "highlight.js",
  "Prism",
  "CodeMirror",
  "Monaco",
  "JSONLint",
  "marked.js",
  "Turndown",
  "uuid",
  "jszip",

  // Date libraries (client-side)
  "Date-fns",
  "Moment.js",

  // AI/ML (client-side WASM)
  "tensorflow",
  "TF.js",
  "ONNX",
  "Transformers.js",

  // Misc client-side
  "MathJax",
  "KaTeX",
  "D3.js",
  "Chart.js",
  "Plotly",
  "Three.js",
  "Leaflet",
  "Mapbox GL",
  "jsPDF",
  "html2pdf.js",
];

export type DependencyVerdict = "cloud" | "local" | "unverified";

/**
 * Trust-claim copy constants.
 *
 * IMPORTANT: Any piece of trust-relevant copy that needs to say the same
 * true thing in multiple places must live here and be referenced everywhere,
 * never independently authored per surface. These are the claims where
 * wording drift isn't just untidy — it's a claim inconsistency a careful
 * user or reviewer could catch and flag.
 */
export const LOCAL_TRUST_CLAIM = "Everything runs locally in your browser — nothing is uploaded.";
export const CLOUD_TRUST_CLAIM = "Uses cloud-based processing.";

/**
 * Classifies a tool's dependencies into one of three verdicts:
 *
 * - "cloud":      deps match a known cloud pattern → data leaves browser
 * - "local":      deps match a known local-safe pattern → data stays in browser
 * - "unverified": deps is non-empty but doesn't match either set → needs manual review
 *
 * When deps is empty or "None", returns "local" (no dependencies = no server calls).
 */
export function classifyDependencies(deps: string): DependencyVerdict {
  const trimmed = deps.trim();
  if (!trimmed || trimmed === "None") return "local";
  if (requiresCloudApi(trimmed)) return "cloud";
  if (LOCAL_SAFE_PATTERNS.some((p) => trimmed.includes(p))) return "local";
  return "unverified";
}
