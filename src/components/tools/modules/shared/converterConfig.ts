export type ConverterCategory = "video-format" | "video-to-audio" | "audio-format" | "image-format" | "data" | "document" | "text-transform" | "html-text" | "css-preprocessor" | "serializer" | "json-output" | "csv-output" | "text-style" | "unit" | "import-to-csv" | "color" | "number" | "toon" | "text-binary";

export type ConverterConfigEntry = {
  category: ConverterCategory;
  description?: string;
};

export const CONVERTER_CONFIG: Record<string, ConverterConfigEntry> = {
  // Consolidated converters
  // Audio format converters migrated to MODULE_REGISTRY (DynamicModuleWrapper):
  // all 73 audio-format slugs (audio-converter and every a/b audio pair) render
  // AudioFormatConverter via slug closures (SSR-preserving); descriptions live
  // in HUB_DESCRIPTIONS.
  // Image format converters
  "gif-to-jpg": { category: "image-format", description: "<strong>GIF to JPG Converter:</strong> Convert GIF images into JPEG format. Perfect for saving static GIF frames as higher-quality JPEG files with millions of colors instead of GIF's limited 256-color palette. Your files never leave your device." },
  "gif-to-png": { category: "image-format", description: "<strong>GIF to PNG Converter:</strong> Convert GIF images into lossless PNG format. PNG offers superior color depth, better compression, and transparency support over the legacy GIF format. Your files never leave your device." },
  "ico-to-png": { category: "image-format", description: "<strong>ICO to PNG Converter:</strong> Extract Windows icon (.ico) files and convert them into universal PNG images. Perfect for web developers and designers who need to use favicon or app icon source files in modern formats. Your files never leave your device." },
  "jxl-to-png": { category: "image-format", description: "<strong>JXL to PNG Converter:</strong> Convert JPEG XL images into universally compatible PNG format. Essential when your software, device, or platform doesn't yet support the cutting-edge JPEG XL format. Your files never leave your device." },
  "jxl-to-jpg": { category: "image-format", description: "<strong>JXL to JPEG Converter:</strong> Convert JPEG XL images into standard JPEG format for maximum compatibility. JPEG XL offers superior compression but isn't yet supported everywhere — use this converter for broad compatibility. Your files never leave your device." },
  "gif-to-webp": { category: "image-format", description: "<strong>GIF to WebP Converter:</strong> Convert GIF images into modern WebP format for smaller file sizes and millions of colors. WebP surpasses GIF's 256-color limitation while offering better compression. Your files never leave your device." },
  "gif-to-avif": { category: "image-format", description: "<strong>GIF to AVIF Converter:</strong> Convert GIF images into next-gen AVIF format for vastly superior compression and color depth. AVIF supports millions of colors compared to GIF's 256-color palette. Your files never leave your device." },
  "ico-to-jpg": { category: "image-format", description: "<strong>ICO to JPG Converter:</strong> Convert Windows icon (.ico) files into JPEG format. Perfect for web developers who need to repurpose favicon source files as regular images or thumbnails. Your files never leave your device." },
  "ico-to-webp": { category: "image-format", description: "<strong>ICO to WebP Converter:</strong> Convert Windows icon (.ico) files into modern WebP format. Ideal for converting app icons and favicon source files into web-optimized images. Your files never leave your device." },
  "jxl-to-webp": { category: "image-format", description: "<strong>JXL to WebP Converter:</strong> Convert JPEG XL images into modern WebP format. Perfect when you need broad browser compatibility but started with a high-efficiency JPEG XL source. Your files never leave your device." },
  "jxl-to-gif": { category: "image-format", description: "<strong>JXL to GIF Converter:</strong> Convert JPEG XL images into GIF format. Useful for creating simple animations from JPEG XL sources or when targeting platforms with basic format support. Your files never leave your device." },
  "gif-to-heic": { category: "image-format", description: "<strong>GIF to HEIC Converter:</strong> Convert GIF files into HEIC/HEIF format for high-efficiency photo format from Apple devices. Your files never leave your device." },
  "gif-to-svg": { category: "image-format", description: "<strong>GIF to SVG Converter:</strong> Convert GIF files into SVG format for scalable vector graphics for logos and icons. Your files never leave your device." },
  "gif-to-bmp": { category: "image-format", description: "<strong>GIF to BMP Converter:</strong> Convert GIF files into BMP format for uncompressed bitmap image heritage format. Your files never leave your device." },
  "gif-to-tiff": { category: "image-format", description: "<strong>GIF to TIFF Converter:</strong> Convert GIF files into TIFF format for high-resolution image archival and publishing. Your files never leave your device." },
  "gif-to-ico": { category: "image-format", description: "<strong>GIF to ICO Converter:</strong> Convert GIF files into ICO format for Windows icon format for favicons and app icons. Your files never leave your device." },
  "gif-to-jxl": { category: "image-format", description: "<strong>GIF to JXL Converter:</strong> Convert GIF files into JPEG XL format for next-gen JPEG XL image format. Your files never leave your device." },
  "ico-to-heic": { category: "image-format", description: "<strong>ICO to HEIC Converter:</strong> Convert Windows ICO files into HEIC/HEIF format for high-efficiency photo format from Apple devices. Your files never leave your device." },
  "ico-to-avif": { category: "image-format", description: "<strong>ICO to AVIF Converter:</strong> Convert Windows ICO files into AVIF format for next-gen royalty-free image format. Your files never leave your device." },
  "ico-to-svg": { category: "image-format", description: "<strong>ICO to SVG Converter:</strong> Convert Windows ICO files into SVG format for scalable vector graphics for logos and icons. Your files never leave your device." },
  "ico-to-bmp": { category: "image-format", description: "<strong>ICO to BMP Converter:</strong> Convert Windows ICO files into BMP format for uncompressed bitmap image heritage format. Your files never leave your device." },
  "ico-to-tiff": { category: "image-format", description: "<strong>ICO to TIFF Converter:</strong> Convert Windows ICO files into TIFF format for high-resolution image archival and publishing. Your files never leave your device." },
  "ico-to-gif": { category: "image-format", description: "<strong>ICO to GIF Converter:</strong> Convert Windows ICO files into GIF format for animated and static image format for broad compatibility. Your files never leave your device." },
  "ico-to-jxl": { category: "image-format", description: "<strong>ICO to JXL Converter:</strong> Convert Windows ICO files into JPEG XL format for next-gen JPEG XL image format. Your files never leave your device." },
  "jxl-to-heic": { category: "image-format", description: "<strong>JXL to HEIC Converter:</strong> Convert JPEG XL files into HEIC/HEIF format for high-efficiency photo format from Apple devices. Your files never leave your device." },
  "jxl-to-avif": { category: "image-format", description: "<strong>JXL to AVIF Converter:</strong> Convert JPEG XL files into AVIF format for next-gen royalty-free image format. Your files never leave your device." },
  "jxl-to-svg": { category: "image-format", description: "<strong>JXL to SVG Converter:</strong> Convert JPEG XL files into SVG format for scalable vector graphics for logos and icons. Your files never leave your device." },
  "jxl-to-bmp": { category: "image-format", description: "<strong>JXL to BMP Converter:</strong> Convert JPEG XL files into BMP format for uncompressed bitmap image heritage format. Your files never leave your device." },
  "jxl-to-tiff": { category: "image-format", description: "<strong>JXL to TIFF Converter:</strong> Convert JPEG XL files into TIFF format for high-resolution image archival and publishing. Your files never leave your device." },
  "jxl-to-ico": { category: "image-format", description: "<strong>JXL to ICO Converter:</strong> Convert JPEG XL files into ICO format for Windows icon format for favicons and app icons. Your files never leave your device." },
  // Data converters migrated to MODULE_REGISTRY (DynamicModuleWrapper):
  // xml-to-json, xml-to-csv render DataConverterFromSlug (DataConverter) via
  // slug closures (SSR-preserving). json-to-csv, csv-to-json, json-to-xml,
  // csv-to-xml are NOT routed here: they are TOOL_REDIRECTS sources
  // (-> data-format-converter), so any CONVERTER_CONFIG entry for them would
  // be unreachable. They remain available in-app as format pairs on the
  // DataConverter hub.

  // Document converters migrated to MODULE_REGISTRY (DynamicModuleWrapper):
  // word-to-pdf, pdf-to-word, excel-to-pdf, pdf-to-excel, ppt-to-pdf, pdf-to-ppt,
  // jpg-to-pdf, pdf-to-jpg, html-to-pdf, pdf-to-html, pdf-to-epub, heic-to-pdf
  // render DocumentFormatConverter via slug closures. epub-to-pdf remains a
  // MODULE_REGISTRY slug (EpubToPdf) and an in-app FORMAT_PAIRS tab.

  // Hub/consolidated converter entries

  // Toon converters migrated to MODULE_REGISTRY (DynamicModuleWrapper):
  // json-toon-converter renders ToonConverter via slug closure
  // (SSR-preserving). yaml-to-toon, toon-to-json, toon-to-yaml are NOT routed
  // here: they are TOOL_REDIRECTS sources (-> json-toon-converter). Their
  // modes remain available in-app on the ToonConverter hub.

};
