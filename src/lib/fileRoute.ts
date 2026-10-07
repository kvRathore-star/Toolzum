/**
 * Hero upload-box routing (#32 recheck). Maps a dropped file to the right
 * tool by MIME-or-extension, with every target verified live (all 200).
 * Pure + unit-tested — a wrong route here strands users on 404s (the
 * document-converter once pointed at /document/ instead of /converter/).
 */

export type HeroFileType = 'image' | 'video' | 'audio' | 'pdf' | 'document' | 'other';

export function detectFileType(f: { type?: string; name: string }): HeroFileType {
  const type = f.type || '';
  const ext = f.name.split('.').pop()?.toLowerCase() || '';
  // Image: incl. mobile captures (HEIC/HEIF) and modern formats (AVIF).
  if (
    type.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'tiff', 'tif', 'ico', 'avif', 'heic', 'heif'].includes(ext)
  )
    return 'image';
  // Video: incl. mobile captures (3GP) and MP4 variants.
  if (
    type.startsWith('video/') ||
    ['mp4', 'webm', 'mkv', 'mov', 'avi', 'wmv', 'flv', 'm4v', '3gp', '3g2'].includes(ext)
  )
    return 'video';
  if (
    type.startsWith('audio/') ||
    ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac', 'wma', 'opus', 'aiff'].includes(ext)
  )
    return 'audio';
  if (type === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'epub', 'odt', 'ods', 'rtf'].includes(ext))
    return 'document';
  return 'other';
}

export function heroRouteFor(fileType: HeroFileType): string {
  switch (fileType) {
    case 'image':
      return '/image/image-compressor';
    case 'video':
      return '/video/video-compressor';
    case 'audio':
      return '/audio/audio-compressor';
    case 'pdf':
      return '/pdf/pdf-compressor';
    // NOTE: document tools live under the Converter category, not /document/.
    case 'document':
      return '/converter/document-converter';
    default:
      return '/tools';
  }
}

export function heroToolName(fileType: HeroFileType): string {
  switch (fileType) {
    case 'image':
      return 'Image Compressor';
    case 'video':
      return 'Video Compressor';
    case 'audio':
      return 'Audio Converter';
    case 'pdf':
      return 'PDF Compressor';
    case 'document':
      return 'Document Converter';
    default:
      return 'All Tools';
  }
}

// --- Smart-box intents: WHAT the file is -> WHY the user came --------------
// Every route below is a live registry tool (guarded by fileRoute.test.ts).
// Chips offer these instead of funneling every drop into the compressor.

export interface HeroIntent {
  id: string;
  label: string;
  tool: string;
  route: string;
  params?: string;
  /** Honesty disclosure shown on the chip before any click. */
  note?: string;
}

const IMAGE_INTENTS: HeroIntent[] = [
  { id: 'compress', label: 'Compress', tool: 'Image Compressor', route: '/image/image-compressor' },
  { id: 'convert', label: 'Convert', tool: 'Bulk Image Converter', route: '/image/bulk-image-converter' },
  { id: 'resize', label: 'Resize', tool: 'Image Resizer', route: '/image/image-resizer' },
  { id: 'bg-remove', label: 'Remove background', tool: 'AI BG Changer', route: '/image/ai-bg-changer', note: 'Sign-in unlocks AI' },
];

const PDF_INTENTS: HeroIntent[] = [
  { id: 'compress', label: 'Compress', tool: 'PDF Compressor', route: '/pdf/pdf-compressor' },
  { id: 'merge', label: 'Merge', tool: 'PDF Merger', route: '/pdf/pdf-merger' },
  { id: 'split', label: 'Split', tool: 'PDF Splitter', route: '/pdf/pdf-splitter' },
];

const VIDEO_INTENTS: HeroIntent[] = [
  { id: 'compress', label: 'Compress', tool: 'Video Compressor', route: '/video/video-compressor' },
  { id: 'convert', label: 'Convert', tool: 'Video Converter', route: '/converter/video-converter' },
  { id: 'to-mp3', label: 'Extract MP3', tool: 'Video to MP3', route: '/converter/mp4-to-mp3' },
];

const AUDIO_INTENTS: HeroIntent[] = [
  { id: 'compress', label: 'Compress', tool: 'Audio Compressor', route: '/audio/audio-compressor' },
  { id: 'convert', label: 'Convert', tool: 'Audio Converter', route: '/audio/audio-converter' },
];

const DOCUMENT_INTENTS: HeroIntent[] = [
  { id: 'convert', label: 'Convert to PDF', tool: 'Document Converter', route: '/converter/document-converter' },
];

/** Extension-aware intents for text/code files the generic router calls 'other'. */
function textIntents(ext: string): HeroIntent[] {
  if (ext === 'json' || ext === 'jsonl')
    return [{ id: 'format', label: 'Format', tool: 'JSON Formatter', route: '/developer/json-formatter' }];
  if (ext === 'csv' || ext === 'tsv')
    return [{ id: 'convert', label: 'Convert', tool: 'CSV Row Generator', route: '/utility/csv-json-row-generator' }];
  if (ext === 'txt' || ext === 'md' || ext === 'srt' || ext === 'vtt')
    return [{ id: 'count', label: 'Count words', tool: 'Word Counter', route: '/text/word-counter' }];
  return [];
}

export function heroIntentsFor(fileType: HeroFileType, ext: string): HeroIntent[] {
  switch (fileType) {
    case 'image': return IMAGE_INTENTS;
    case 'video': return VIDEO_INTENTS;
    case 'audio': return AUDIO_INTENTS;
    case 'pdf': return PDF_INTENTS;
    case 'document': return DOCUMENT_INTENTS;
    case 'other': {
      const specific = textIntents(ext.toLowerCase());
      if (specific.length > 0) return specific;
      return [{ id: 'browse', label: 'Browse all tools', tool: 'All Tools', route: '/tools' }];
    }
  }
}

/** Multi-file drops go to bulk hubs, never the single-file tools. */
export function heroBulkIntentsFor(fileType: HeroFileType): HeroIntent[] {
  switch (fileType) {
    case 'image': return [{ id: 'bulk', label: 'Convert batch', tool: 'Bulk Image Converter', route: '/image/bulk-image-converter' }];
    case 'video': return [{ id: 'bulk', label: 'Compress batch', tool: 'Bulk Video Compressor', route: '/video/bulk-video-compressor' }];
    case 'audio': return [{ id: 'bulk', label: 'Convert batch', tool: 'Bulk Audio Converter', route: '/audio/bulk-audio-converter' }];
    case 'pdf': return [{ id: 'bulk', label: 'Merge batch', tool: 'PDF Bulk Merger', route: '/pdf/bulk-pdf-merger' }];
    default: return [{ id: 'browse', label: 'Browse all tools', tool: 'All Tools', route: '/tools' }];
  }
}

/** Homepage demo tabs double as the default intent. Unknown tabs fall back
 *  to the first chip so the tabs can never lie about what happens next. */
export function heroDefaultIntentId(fileType: HeroFileType, ext: string, tab: string): string {
  const intents = heroIntentsFor(fileType, ext);
  return intents.find((i) => i.id === tab)?.id ?? intents[0]!.id;
}

// --- Abuse control (client-side heads-up; server/tool enforces) -------------

/** Executables and installers can never be processed in a browser tab. */
const BLOCKED_EXTS = new Set([
  'exe', 'bat', 'cmd', 'com', 'scr', 'msi', 'dll', 'sh', 'ps1', 'vbs',
  'apk', 'jar', 'dmg', 'pkg', 'deb', 'rpm', 'app',
]);

export function heroBlockReason(fileName: string): string | null {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (BLOCKED_EXTS.has(ext))
    return `".${ext}" files can't be processed in a browser — executables never run here, by design.`;
  return null;
}

/** MIME category flatly contradicting the extension smells renamed. Office
 *  documents are excluded: their MIME types are unreliable across devices. */
export function heroTypeWarning(mime: string, ext: string): string | null {
  if (!mime) return null;
  const e = ext.toLowerCase();
  const imgExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'tiff', 'tif', 'ico', 'avif', 'heic', 'heif'].includes(e);
  if (imgExt && (mime.startsWith('video/') || mime.startsWith('audio/') || (mime.startsWith('application/') && mime !== 'application/pdf')))
    return 'This looks like a non-image renamed with an image extension — processing may fail.';
  if (e === 'pdf' && (mime.startsWith('image/') || mime.startsWith('video/') || mime.startsWith('audio/')))
    return 'This looks like a non-PDF renamed to .pdf — processing may fail.';
  return null;
}

export type HeroSizeState = 'ok' | 'over-cap' | 'too-big';

/** 2GB is the hard browser-memory ceiling for every plan (Pro caps at 2GB). */
export function heroSizeState(bytes: number, capMB: number): HeroSizeState {
  if (bytes > 2048 * 1024 * 1024) return 'too-big';
  if (bytes > capMB * 1024 * 1024) return 'over-cap';
  return 'ok';
}

export function heroExtOf(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? (parts.pop()?.toLowerCase() || '') : '';
}
