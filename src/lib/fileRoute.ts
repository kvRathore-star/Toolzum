/**
 * Hero upload-box routing (#32 recheck). Maps a dropped file to the right
 * tool by MIME-or-extension, with every target verified live (all 200).
 * Pure + unit-tested — a wrong route here strands users on 404s (the
 * document-converter once pointed at /document/ instead of /converter/).
 */

import { smartMax } from '@/utils/fileSizeLimits';
import { categoryCap } from '@/lib/planTiers';

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
  /** Honesty disclosure shown on the chip before any click. */
  note?: string;
  /**
   * Destination's intake accept string, set ONLY when that tool enforces
   * smartMax caps at intake (shared FileUploader). The box mirrors the
   * tool's own limit so gating matches enforcement exactly. Tools without
   * intake checks (custom shells, bulk 500MB, paste tools) omit it and the
   * box falls back to the plan cap — their enforcement lives at save time.
   */
  capAccept?: string;
  /**
   * Set ONLY when requiresCloudApi(live registry deps) is true for this
   * route. Absence means local. A test locks every intent against the live
   * verdict, so a future cloud chip cannot ship unlabeled.
   */
  cloud?: true;
}

const IMAGE_INTENTS: HeroIntent[] = [
  { id: 'compress', label: 'Compress', tool: 'Image Compressor', route: '/image/image-compressor', capAccept: 'image/jpeg,image/png,image/webp' },
  { id: 'convert', label: 'Convert', tool: 'Bulk Image Converter', route: '/image/bulk-image-converter' },
  { id: 'resize', label: 'Resize', tool: 'Image Resizer', route: '/image/image-resizer' },
  { id: 'bg-remove', label: 'Remove background', tool: 'AI BG Changer', route: '/image/ai-bg-changer', note: 'Sign-in unlocks AI' },
];

const PDF_INTENTS: HeroIntent[] = [
  { id: 'compress', label: 'Compress', tool: 'PDF Compressor', route: '/pdf/pdf-compressor', capAccept: 'application/pdf' },
  { id: 'edit', label: 'Edit', tool: 'PDF Editor', route: '/pdf/pdf-editor', capAccept: 'application/pdf' },
  { id: 'merge', label: 'Merge', tool: 'PDF Merger', route: '/pdf/pdf-merger', capAccept: 'application/pdf' },
  { id: 'split', label: 'Split', tool: 'PDF Splitter', route: '/pdf/pdf-splitter', capAccept: 'application/pdf' },
];

const VIDEO_INTENTS: HeroIntent[] = [
  { id: 'compress', label: 'Compress', tool: 'Video Compressor', route: '/video/video-compressor', capAccept: 'video/mp4,video/quicktime,video/x-matroska,video/webm' },
  { id: 'convert', label: 'Convert', tool: 'Video Converter', route: '/converter/video-converter' },
  { id: 'to-mp3', label: 'Extract MP3', tool: 'Video to MP3', route: '/video/video-to-mp3', capAccept: 'video/*' },
];

const AUDIO_INTENTS: HeroIntent[] = [
  { id: 'compress', label: 'Compress', tool: 'Audio Compressor', route: '/audio/audio-compressor', capAccept: 'audio/*' },
  { id: 'convert', label: 'Convert', tool: 'Audio Converter', route: '/audio/audio-converter' },
];

/** Formats the compressor cannot take (its accept is jpeg/png/webp only) get
 *  a dedicated converter chip instead — never a chip ending in rejection. */
function heroImageIntents(ext: string): HeroIntent[] {
  switch (ext.toLowerCase()) {
    case 'heic':
    case 'heif':
      return [{ id: 'convert', label: 'Convert to JPG', tool: 'HEIC to JPG', route: '/image/heic-to-jpg' }];
    case 'svg':
      return [{ id: 'convert', label: 'Convert to PNG', tool: 'SVG to PNG', route: '/image/svg-to-png' }];
    case 'gif':
      return [
        { id: 'compress', label: 'Compress', tool: 'GIF Compressor', route: '/image/gif-compressor', capAccept: 'image/gif' },
        { id: 'convert', label: 'Convert', tool: 'Bulk Image Converter', route: '/image/bulk-image-converter' },
      ];
    case 'tiff':
    case 'tif':
      return [{ id: 'convert', label: 'Convert to JPG', tool: 'TIFF to JPG', route: '/image/tiff-to-jpg' }];
    case 'bmp':
      return [{ id: 'convert', label: 'Convert to JPG', tool: 'BMP to JPG', route: '/image/bmp-to-jpg' }];
    case 'avif':
      return [{ id: 'convert', label: 'Convert to JPG', tool: 'AVIF to JPG', route: '/image/avif-to-jpg' }];
    case 'ico':
      return [{ id: 'convert', label: 'Convert to JPG', tool: 'ICO to JPG', route: '/image/ico-to-jpg' }];
    default:
      return IMAGE_INTENTS;
  }
}

/** The compressor takes mp4/mov/mkv/webm (not avi); the converter takes
 *  mkv/mp4/mov/webm/avi. WMV/FLV/M4V/3GP have no browser tool: honest
 *  directory fallback, never a chip ending in rejection. */
function heroVideoIntents(ext: string): HeroIntent[] {
  switch (ext.toLowerCase()) {
    case 'mp4':
    case 'mov':
    case 'mkv':
    case 'webm':
      return VIDEO_INTENTS;
    case 'avi':
      return [
        { id: 'convert', label: 'Convert', tool: 'Video Converter', route: '/converter/video-converter' },
        { id: 'to-mp3', label: 'Extract MP3', tool: 'Video to MP3', route: '/video/video-to-mp3' },
      ];
    default:
      return [{ id: 'browse', label: 'Browse all tools', tool: 'All Tools', route: '/tools', note: 'No converter for this format yet' }];
  }
}

const DOCUMENT_INTENTS: HeroIntent[] = [
  { id: 'convert', label: 'Convert', tool: 'Document Converter', route: '/converter/document-converter' },
];

/** Spreadsheets go to the CSV/Excel tool (own dropzone: .csv/.xlsx/.xls),
 *  never the document converter — it cannot parse them. PPT/ODP decks and
 *  ODS sheets have no browser tool: honest browse fallback, no fake chip. */
export function heroDocumentIntents(ext: string): HeroIntent[] {
  const e = ext.toLowerCase();
  if (e === 'csv' || e === 'xls' || e === 'xlsx')
    return [{ id: 'convert', label: 'Convert to JSON', tool: 'CSV/Excel to JSON', route: '/converter/bulk-csv-excel-to-json' }];
  if (['pdf', 'docx', 'txt', 'md', 'html', 'htm', 'rtf', 'odt', 'epub'].includes(e))
    return DOCUMENT_INTENTS;
  return [{ id: 'browse', label: 'Browse all tools', tool: 'All Tools', route: '/tools' }];
}

/** Extension-aware intents for text/code files the generic router calls 'other'. */
function textIntents(ext: string): HeroIntent[] {
  if (ext === 'json' || ext === 'jsonl')
    return [{ id: 'format', label: 'Format', tool: 'JSON Formatter', route: '/developer/json-formatter' }];
  if (ext === 'csv' || ext === 'xls' || ext === 'xlsx')
    return [{ id: 'convert', label: 'Convert to JSON', tool: 'CSV/Excel to JSON', route: '/converter/bulk-csv-excel-to-json' }];
  if (ext === 'txt' || ext === 'md' || ext === 'srt' || ext === 'vtt')
    return [{ id: 'count', label: 'Count words', tool: 'Word Counter', route: '/text/word-counter' }];
  return [];
}

export function heroIntentsFor(fileType: HeroFileType, ext: string): HeroIntent[] {
  switch (fileType) {
    case 'image': return heroImageIntents(ext);
    case 'video': return heroVideoIntents(ext);
    case 'audio': return AUDIO_INTENTS;
    case 'pdf': return PDF_INTENTS;
    case 'document': return heroDocumentIntents(ext);
    case 'other': {
      const specific = textIntents(ext.toLowerCase());
      if (specific.length > 0) return specific;
      return [{ id: 'browse', label: 'Browse all tools', tool: 'All Tools', route: '/tools' }];
    }
  }
}

/** Multi-file drops go to bulk hubs, never the single-file tools. HEIC/SVG
 *  batches get their dedicated bulk converters — the generic image batch
 *  cannot decode them (canvas-blind), same rule as single files. */
export function heroBulkIntentsFor(fileType: HeroFileType, ext = ''): HeroIntent[] {
  if (fileType === 'image') {
    const e = ext.toLowerCase();
    if (e === 'heic' || e === 'heif')
      return [{ id: 'bulk', label: 'Convert batch', tool: 'Bulk HEIC to JPG', route: '/image/bulk-heic-to-jpg' }];
    if (e === 'svg')
      return [{ id: 'bulk', label: 'Convert batch', tool: 'Bulk SVG to PNG', route: '/image/bulk-svg-to-png' }];
    return [{ id: 'bulk', label: 'Convert batch', tool: 'Bulk Image Converter', route: '/image/bulk-image-converter' }];
  }
  switch (fileType) {
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

/** Effective intake cap (MB) for an intent in the box.
 *  Order: Pro always 2000 (plan promise, honored at the download gate);
 *  explicit smartMax intake caps next (mirrors destination enforcement);
 *  generous category ceiling last (CATEGORY_CAPS — same anon and signed).
 *  Pure + test-locked, so the box can never display a limit the
 *  destination won't honor. */
export function heroCapFor(intent: HeroIntent, authenticated: boolean, isPro: boolean, fileType: HeroFileType): number {
  if (isPro) return 2000;
  if (intent.capAccept) {
    const limits = smartMax(intent.capAccept);
    return authenticated ? limits.signed : limits.free;
  }
  return categoryCap(fileType === 'document' || fileType === 'other' ? 'other' : fileType);
}
