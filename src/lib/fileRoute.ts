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
