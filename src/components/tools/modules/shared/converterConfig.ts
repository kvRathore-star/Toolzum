export type ConverterCategory = "video-format" | "video-to-audio" | "audio-format" | "image-format" | "data" | "document";

export type ConverterConfigEntry = {
  category: ConverterCategory;
  description?: string;
};

export const CONVERTER_CONFIG: Record<string, ConverterConfigEntry> = {
  // Video format converters
  "mkv-to-mp4": {
    category: "video-format",
    description: "<strong>MKV to MP4 Converter:</strong> Re-encapsulates Matroska (.mkv) video files into the more universally compatible MP4 container without re-encoding the underlying video stream. Your files never leave your device.",
  },
  "mov-to-mp4": {
    category: "video-format",
    description: "<strong>Apple QuickTime Converter:</strong> Transcode QuickTime .MOV files (usually from iPhones or Macs) into universal MP4 format optimized for web playback and social media uploads. Your files never leave your device.",
  },
  "webm-to-mp4": {
    category: "video-format",
    description: "<strong>WEBM to MP4 Converter:</strong> Transcode modern WebM videos (often from screen recorders or web exports) into universal MP4 files. Critical for users whose editing software or sharing platforms reject WebM. Your files never leave your device.",
  },
  "avi-to-mp4": {
    category: "video-format",
    description: "<strong>AVI to MP4 Converter:</strong> Upgrade your old AVI video files into modern universal MP4 format with H.264 encoding for drastically smaller file sizes. Perfect for archiving and compatibility. Your files never leave your device.",
  },
  "mp4-to-mkv": {
    category: "video-format",
    description: "<strong>MP4 to MKV Converter:</strong> Re-encapsulates MP4 video files into the versatile MKV container format without re-encoding. MKV supports advanced subtitle tracks, chapter markers, and multiple audio streams. Your files never leave your device.",
  },
  "mp4-to-mov": {
    category: "video-format",
    description: "<strong>MP4 to MOV Converter:</strong> Convert MP4 video files to QuickTime MOV format while preserving quality. Ideal for Apple ecosystem workflows including Final Cut Pro, iMovie, and macOS QuickTime Player. Your files never leave your device.",
  },
  "mkv-to-mov": {
    category: "video-format",
    description: "<strong>MKV to MOV Converter:</strong> Transcode Matroska MKV files into QuickTime MOV format for seamless editing in macOS applications. Perfect when you have high-quality MKV files but need to work in Final Cut Pro or iMovie. Your files never leave your device.",
  },
  "mov-to-mkv": {
    category: "video-format",
    description: "<strong>MOV to MKV Converter:</strong> Convert QuickTime MOV videos into the open-source MKV container format. MKV offers broader codec support, embedded subtitles, and chapter markers — perfect for media archiving. Your files never leave your device.",
  },
  // Video to audio converters
  "mp4-to-mp3": { category: "video-to-audio" },
  "mov-to-mp3": { category: "video-to-audio" },
  "webm-to-mp3": { category: "video-to-audio" },
  // Audio format converters
  "mp3-to-wav": { category: "audio-format", description: "<strong>MP3 to WAV Converter:</strong> Transform compressed MP3 audio files into uncompressed WAV format for professional audio editing. WAV preserves full audio fidelity — essential for music production, podcast mastering, and audio restoration. Your files never leave your device." },
  "wav-to-mp3": { category: "audio-format", description: "<strong>WAV to MP3 Converter:</strong> Compress large WAV audio files into space-saving MP3 format. Perfect for sharing music, podcasts, and voice recordings online where file size matters. Your files never leave your device." },
  "flac-to-mp3": { category: "audio-format", description: "<strong>FLAC to MP3 Converter:</strong> Convert lossless FLAC audio files into universally compatible MP3 format. Ideal for loading high-res audio onto devices with limited storage or sharing on platforms that don't support FLAC. Your files never leave your device." },
  "ogg-to-mp3": { category: "audio-format", description: "<strong>OGG to MP3 Converter:</strong> Convert OGG Vorbis audio files into the more widely supported MP3 format. Perfect when you need universal playback compatibility across devices, media players, and platforms. Your files never leave your device." },
  "m4a-to-mp3": { category: "audio-format", description: "<strong>M4A to MP3 Converter:</strong> Convert M4A audio files (AAC/ALAC) into MP3 format for broader device compatibility. Ideal for moving Apple ecosystem audio to non-Apple devices and platforms. Your files never leave your device." },
  "aac-to-mp3": { category: "audio-format", description: "<strong>AAC to MP3 Converter:</strong> Convert AAC audio files into universally compatible MP3 format. Perfect when your audio software, device, or platform needs MP3 but you have AAC files. Your files never leave your device." },
  // Image format converters
  "png-to-jpg": { category: "image-format", description: "<strong>PNG to JPG Converter:</strong> Convert lossless PNG images into space-efficient JPEG files. Ideal for photographs and complex images where the smaller file size outweighs the loss of transparency. Your files never leave your device." },
  "jpg-to-png": { category: "image-format", description: "<strong>JPG to PNG Converter:</strong> Convert JPEG images into lossless PNG format. Perfect when you need transparency support, lossless editing, or higher quality for graphics with text and sharp edges. Your files never leave your device." },
  "png-to-webp": { category: "image-format", description: "<strong>PNG to WebP Converter:</strong> Convert PNG images into modern WebP format for drastically smaller file sizes with the same quality. WebP is supported by all modern browsers — essential for website performance. Your files never leave your device." },
  "jpg-to-webp": { category: "image-format", description: "<strong>JPG to WebP Converter:</strong> Convert JPEG photos into modern WebP format to reduce page load times without visible quality loss. WebP's superior compression makes your website faster. Your files never leave your device." },
  "webp-to-png": { category: "image-format", description: "<strong>WebP to PNG Converter:</strong> Convert modern WebP images back to universal PNG format. Essential when your editing software, printing service, or platform doesn't yet support WebP. Your files never leave your device." },
  "heic-to-jpg": { category: "image-format", description: "<strong>HEIC to JPG Converter:</strong> Convert Apple's HEIC/HEIF photos into universally compatible JPEG format. Required when sharing iPhone photos with non-Apple devices, uploading to websites, or using software that doesn't support HEIC. Your files never leave your device." },
  "heic-to-png": { category: "image-format", description: "<strong>HEIC to PNG Converter:</strong> Convert Apple's HEIC photos into lossless PNG format. Ideal for graphic design work that needs transparency, or when you need to edit HEIC photos in software that only supports PNG. Your files never leave your device." },
  "png-to-avif": { category: "image-format", description: "<strong>PNG to AVIF Converter:</strong> Convert PNG images into next-gen AVIF format for superior compression. AVIF offers better quality at smaller sizes than both JPEG and WebP — the future of web imagery. Your files never leave your device." },
  "jpg-to-avif": { category: "image-format", description: "<strong>JPG to AVIF Converter:</strong> Convert JPEG photos into AVIF format for best-in-class compression. AVIF files are dramatically smaller than JPEG at the same visual quality — perfect for modern websites. Your files never leave your device." },
  "webp-to-jpg": { category: "image-format", description: "<strong>WebP to JPG Converter:</strong> Convert WebP images back to universally compatible JPEG format. Essential for uploading to websites, social media, or platforms that don't yet support WebP. Your files never leave your device." },
  // Data converters
  "json-to-csv": { category: "data" },
  "csv-to-json": { category: "data" },
  "json-to-xml": { category: "data" },
  "xml-to-json": { category: "data" },
  "csv-to-xml": { category: "data" },
  "xml-to-csv": { category: "data" },

  // Document converters
  "word-to-pdf": { category: "document" },
  "pdf-to-word": { category: "document" },
  "excel-to-pdf": { category: "document" },
  "pdf-to-excel": { category: "document" },
  "ppt-to-pdf": { category: "document" },
  "pdf-to-ppt": { category: "document" },
  "jpg-to-pdf": { category: "document" },
  "pdf-to-jpg": { category: "document" },
  "html-to-pdf": { category: "document" },
  "pdf-to-html": { category: "document" },
  "epub-to-pdf": { category: "document" },
  "pdf-to-epub": { category: "document" },
  "heic-to-pdf": { category: "document" },
};
