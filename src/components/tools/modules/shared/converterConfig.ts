export type ConverterCategory = "video-format" | "video-to-audio" | "audio-format" | "image-format" | "data" | "document";

export type ConverterConfigEntry = {
  category: ConverterCategory;
  description?: string;
};

export const CONVERTER_CONFIG: Record<string, ConverterConfigEntry> = {
  // Consolidated converters
  "video-converter": { category: "video-format", description: "Convert between MKV, MP4, MOV, WebM, and AVI video formats." },
  "audio-converter": { category: "audio-format", description: "Convert between MP3, WAV, FLAC, OGG, M4A, and AAC audio formats." },
  "image-format-converter": { category: "image-format", description: "Convert between PNG, JPG, WebP, HEIC, and AVIF image formats." },
  "data-converter": { category: "data", description: "Convert between JSON, CSV, and XML data formats." },
  "document-converter": { category: "document", description: "Convert between PDF, Word, Excel, PowerPoint, JPG, EPUB, and HEIC document formats." },
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
  // Audio format converters
  "mp3-to-wav": { category: "audio-format", description: "<strong>MP3 to WAV Converter:</strong> Transform compressed MP3 audio files into uncompressed WAV format for professional audio editing. WAV preserves full audio fidelity — essential for music production, podcast mastering, and audio restoration. Your files never leave your device." },
  "wav-to-mp3": { category: "audio-format", description: "<strong>WAV to MP3 Converter:</strong> Compress large WAV audio files into space-saving MP3 format. Perfect for sharing music, podcasts, and voice recordings online where file size matters. Your files never leave your device." },
  "flac-to-mp3": { category: "audio-format", description: "<strong>FLAC to MP3 Converter:</strong> Convert lossless FLAC audio files into universally compatible MP3 format. Ideal for loading high-res audio onto devices with limited storage or sharing on platforms that don't support FLAC. Your files never leave your device." },
  "ogg-to-mp3": { category: "audio-format", description: "<strong>OGG to MP3 Converter:</strong> Convert OGG Vorbis audio files into the more widely supported MP3 format. Perfect when you need universal playback compatibility across devices, media players, and platforms. Your files never leave your device." },
  "m4a-to-mp3": { category: "audio-format", description: "<strong>M4A to MP3 Converter:</strong> Convert M4A audio files (AAC/ALAC) into MP3 format for broader device compatibility. Ideal for moving Apple ecosystem audio to non-Apple devices and platforms. Your files never leave your device." },
  "aac-to-mp3": { category: "audio-format", description: "<strong>AAC to MP3 Converter:</strong> Convert AAC audio files into universally compatible MP3 format. Perfect when your audio software, device, or platform needs MP3 but you have AAC files. Your files never leave your device." },
  "wma-to-mp3": { category: "audio-format", description: "<strong>WMA to MP3 Converter:</strong> Convert Windows Media Audio (WMA) files into universally compatible MP3 format. Essential for playing WMA audio on non-Windows devices, media players, and streaming platforms. Your files never leave your device." },
  "opus-to-mp3": { category: "audio-format", description: "<strong>Opus to MP3 Converter:</strong> Convert Opus audio files into the more widely supported MP3 format. Opus offers excellent compression but isn't universally supported — perfect for broad compatibility. Your files never leave your device." },
  "aiff-to-mp3": { category: "audio-format", description: "<strong>AIFF to MP3 Converter:</strong> Convert Apple's AIFF audio files into space-saving MP3 format. AIFF files are uncompressed and massive — MP3 conversion dramatically reduces size while preserving good audio quality. Your files never leave your device." },
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
  "svg-to-png": { category: "image-format", description: "<strong>SVG to PNG Converter:</strong> Convert scalable vector graphics (SVG) into raster PNG images. Perfect for when you need bitmap versions of logos, icons, and illustrations for use in software that doesn't support SVG. Your files never leave your device." },
  "svg-to-jpg": { category: "image-format", description: "<strong>SVG to JPG Converter:</strong> Convert SVG vector graphics into JPEG images — ideal for sharing vector artwork on platforms that only accept raster formats. Your files never leave your device." },
  "png-to-gif": { category: "image-format", description: "<strong>PNG to GIF Converter:</strong> Convert PNG images into GIF format. Useful when you need to upload images to older platforms or software that only supports the GIF format for static images. Your files never leave your device." },
  "jpg-to-gif": { category: "image-format", description: "<strong>JPG to GIF Converter:</strong> Convert JPEG photos into GIF format for compatibility with legacy applications, embedded systems, or platforms with limited format support. Your files never leave your device." },
  "webp-to-gif": { category: "image-format", description: "<strong>WebP to GIF Converter:</strong> Convert modern WebP images into the widely compatible GIF format. Essential for using WebP-sourced images in older software, email clients, or platforms that only accept GIF. Your files never leave your device." },
  "bmp-to-jpg": { category: "image-format", description: "<strong>BMP to JPG Converter:</strong> Convert uncompressed BMP bitmap images into space-efficient JPEG files. Dramatically reduces file sizes from raw bitmaps while maintaining good visual quality — perfect for archiving scanned images. Your files never leave your device." },
  "bmp-to-png": { category: "image-format", description: "<strong>BMP to PNG Converter:</strong> Convert BMP bitmap images into compressed PNG format. PNG offers much smaller file sizes than BMP with optional transparency — ideal for web use and long-term storage. Your files never leave your device." },
  "tiff-to-jpg": { category: "image-format", description: "<strong>TIFF to JPG Converter:</strong> Convert TIFF images into universally compatible JPEG format. Perfect for sharing high-resolution scanned documents and professional photography on the web or via email. Your files never leave your device." },
  "tiff-to-png": { category: "image-format", description: "<strong>TIFF to PNG Converter:</strong> Convert TIFF images into lossless PNG format. Ideal for graphic design workflows that need transparent backgrounds or when editing TIFF files in software with limited TIFF support. Your files never leave your device." },
  "gif-to-jpg": { category: "image-format", description: "<strong>GIF to JPG Converter:</strong> Convert GIF images into JPEG format. Perfect for saving static GIF frames as higher-quality JPEG files with millions of colors instead of GIF's limited 256-color palette. Your files never leave your device." },
  "gif-to-png": { category: "image-format", description: "<strong>GIF to PNG Converter:</strong> Convert GIF images into lossless PNG format. PNG offers superior color depth, better compression, and transparency support over the legacy GIF format. Your files never leave your device." },
  "ico-to-png": { category: "image-format", description: "<strong>ICO to PNG Converter:</strong> Extract Windows icon (.ico) files and convert them into universal PNG images. Perfect for web developers and designers who need to use favicon or app icon source files in modern formats. Your files never leave your device." },
  "jxl-to-png": { category: "image-format", description: "<strong>JXL to PNG Converter:</strong> Convert JPEG XL images into universally compatible PNG format. Essential when your software, device, or platform doesn't yet support the cutting-edge JPEG XL format. Your files never leave your device." },
  "jxl-to-jpg": { category: "image-format", description: "<strong>JXL to JPEG Converter:</strong> Convert JPEG XL images into standard JPEG format for maximum compatibility. JPEG XL offers superior compression but isn't yet supported everywhere — use this converter for broad compatibility. Your files never leave your device." },
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
