/**
 * Patterns in tool.dependencies that indicate the tool requires
 * cloud/server-side processing (data leaves the browser).
 *
 * IMPORTANT: This list is the single source of truth for trust claims
 * across the site. Both generateToolDescription.ts and ToolPageSEOContent.tsx
 * import from here. When adding a new cloud-dependent tool, update this list
 * — otherwise it will silently claim "runs locally" which is a privacy risk.
 */
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
