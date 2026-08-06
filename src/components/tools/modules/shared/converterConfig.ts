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
  "svg-to-png": { category: "image-format", description: "<strong>SVG to PNG Converter:</strong> Convert scalable vector graphics (SVG) into raster PNG images. Perfect for when you need bitmap versions of logos, icons, and illustrations for use in software that doesn't support SVG. Your files never leave your device." },
  "svg-to-jpg": { category: "image-format", description: "<strong>SVG to JPG Converter:</strong> Convert SVG vector graphics into JPEG images — ideal for sharing vector artwork on platforms that only accept raster formats. Your files never leave your device." },
  "bmp-to-jpg": { category: "image-format", description: "<strong>BMP to JPG Converter:</strong> Convert uncompressed BMP bitmap images into space-efficient JPEG files. Dramatically reduces file sizes from raw bitmaps while maintaining good visual quality — perfect for archiving scanned images. Your files never leave your device." },
  "bmp-to-png": { category: "image-format", description: "<strong>BMP to PNG Converter:</strong> Convert BMP bitmap images into compressed PNG format. PNG offers much smaller file sizes than BMP with optional transparency — ideal for web use and long-term storage. Your files never leave your device." },
  "tiff-to-jpg": { category: "image-format", description: "<strong>TIFF to JPG Converter:</strong> Convert TIFF images into universally compatible JPEG format. Perfect for sharing high-resolution scanned documents and professional photography on the web or via email. Your files never leave your device." },
  "tiff-to-png": { category: "image-format", description: "<strong>TIFF to PNG Converter:</strong> Convert TIFF images into lossless PNG format. Ideal for graphic design workflows that need transparent backgrounds or when editing TIFF files in software with limited TIFF support. Your files never leave your device." },
  "gif-to-jpg": { category: "image-format", description: "<strong>GIF to JPG Converter:</strong> Convert GIF images into JPEG format. Perfect for saving static GIF frames as higher-quality JPEG files with millions of colors instead of GIF's limited 256-color palette. Your files never leave your device." },
  "gif-to-png": { category: "image-format", description: "<strong>GIF to PNG Converter:</strong> Convert GIF images into lossless PNG format. PNG offers superior color depth, better compression, and transparency support over the legacy GIF format. Your files never leave your device." },
  "ico-to-png": { category: "image-format", description: "<strong>ICO to PNG Converter:</strong> Extract Windows icon (.ico) files and convert them into universal PNG images. Perfect for web developers and designers who need to use favicon or app icon source files in modern formats. Your files never leave your device." },
  "jxl-to-png": { category: "image-format", description: "<strong>JXL to PNG Converter:</strong> Convert JPEG XL images into universally compatible PNG format. Essential when your software, device, or platform doesn't yet support the cutting-edge JPEG XL format. Your files never leave your device." },
  "jxl-to-jpg": { category: "image-format", description: "<strong>JXL to JPEG Converter:</strong> Convert JPEG XL images into standard JPEG format for maximum compatibility. JPEG XL offers superior compression but isn't yet supported everywhere — use this converter for broad compatibility. Your files never leave your device." },
  "avif-to-png": { category: "image-format", description: "<strong>AVIF to PNG Converter:</strong> Convert AVIF images into universally compatible PNG format. Essential when your editing software or platform doesn't yet support the next-gen AVIF format. Your files never leave your device." },
  "avif-to-jpg": { category: "image-format", description: "<strong>AVIF to JPG Converter:</strong> Convert AVIF images into universally compatible JPEG format. Perfect for sharing next-gen AVIF photos on social media, email, or websites that haven't adopted AVIF yet. Your files never leave your device." },
  "bmp-to-webp": { category: "image-format", description: "<strong>BMP to WebP Converter:</strong> Convert BMP bitmap images into modern WebP format for drastically smaller file sizes. WebP's superior compression makes your website faster while preserving image quality. Your files never leave your device." },
  "bmp-to-gif": { category: "image-format", description: "<strong>BMP to GIF Converter:</strong> Convert BMP bitmap images into GIF format. Useful when you need to use bitmap-sourced images on platforms or in software with limited format support. Your files never leave your device." },
  "bmp-to-avif": { category: "image-format", description: "<strong>BMP to AVIF Converter:</strong> Convert BMP bitmap images into next-gen AVIF format for best-in-class compression. Dramatically reduce raw bitmap file sizes while maintaining excellent visual quality. Your files never leave your device." },
  "gif-to-webp": { category: "image-format", description: "<strong>GIF to WebP Converter:</strong> Convert GIF images into modern WebP format for smaller file sizes and millions of colors. WebP surpasses GIF's 256-color limitation while offering better compression. Your files never leave your device." },
  "gif-to-avif": { category: "image-format", description: "<strong>GIF to AVIF Converter:</strong> Convert GIF images into next-gen AVIF format for vastly superior compression and color depth. AVIF supports millions of colors compared to GIF's 256-color palette. Your files never leave your device." },
  "ico-to-jpg": { category: "image-format", description: "<strong>ICO to JPG Converter:</strong> Convert Windows icon (.ico) files into JPEG format. Perfect for web developers who need to repurpose favicon source files as regular images or thumbnails. Your files never leave your device." },
  "ico-to-webp": { category: "image-format", description: "<strong>ICO to WebP Converter:</strong> Convert Windows icon (.ico) files into modern WebP format. Ideal for converting app icons and favicon source files into web-optimized images. Your files never leave your device." },
  "jxl-to-webp": { category: "image-format", description: "<strong>JXL to WebP Converter:</strong> Convert JPEG XL images into modern WebP format. Perfect when you need broad browser compatibility but started with a high-efficiency JPEG XL source. Your files never leave your device." },
  "jxl-to-gif": { category: "image-format", description: "<strong>JXL to GIF Converter:</strong> Convert JPEG XL images into GIF format. Useful for creating simple animations from JPEG XL sources or when targeting platforms with basic format support. Your files never leave your device." },
  "svg-to-webp": { category: "image-format", description: "<strong>SVG to WebP Converter:</strong> Convert SVG vector graphics into WebP format. Perfect for when you need rasterized versions of logos and icons in an efficient modern format for websites. Your files never leave your device." },
  "svg-to-avif": { category: "image-format", description: "<strong>SVG to AVIF Converter:</strong> Convert SVG vector graphics into next-gen AVIF format. Ideal for converting vector artwork into the most space-efficient raster format for web delivery. Your files never leave your device." },
  "svg-to-gif": { category: "image-format", description: "<strong>SVG to GIF Converter:</strong> Convert SVG vector graphics into GIF format. Useful for creating simple animated versions of vector graphics or when targeting legacy platforms. Your files never leave your device." },
  "tiff-to-webp": { category: "image-format", description: "<strong>TIFF to WebP Converter:</strong> Convert TIFF images into modern WebP format for drastically smaller file sizes. Perfect for migrating high-resolution scanned images and professional photography to web-optimized formats. Your files never leave your device." },
  "tiff-to-gif": { category: "image-format", description: "<strong>TIFF to GIF Converter:</strong> Convert TIFF images into GIF format. Useful for creating preview thumbnails from high-resolution TIFF files or when basic format compatibility is required. Your files never leave your device." },
  "tiff-to-avif": { category: "image-format", description: "<strong>TIFF to AVIF Converter:</strong> Convert TIFF images into next-gen AVIF format for best-in-class compression. Ideal for archiving high-resolution scans and photography at a fraction of the original file size. Your files never leave your device." },
  "avif-to-webp": { category: "image-format", description: "<strong>AVIF to WebP Converter:</strong> Convert AVIF files into WebP format for modern web-optimized image format. Your files never leave your device." },
  "avif-to-heic": { category: "image-format", description: "<strong>AVIF to HEIC Converter:</strong> Convert AVIF files into HEIC/HEIF format for high-efficiency photo format from Apple devices. Your files never leave your device." },
  "avif-to-svg": { category: "image-format", description: "<strong>AVIF to SVG Converter:</strong> Convert AVIF files into SVG format for scalable vector graphics for logos and icons. Your files never leave your device." },
  "avif-to-bmp": { category: "image-format", description: "<strong>AVIF to BMP Converter:</strong> Convert AVIF files into BMP format for uncompressed bitmap image heritage format. Your files never leave your device." },
  "avif-to-tiff": { category: "image-format", description: "<strong>AVIF to TIFF Converter:</strong> Convert AVIF files into TIFF format for high-resolution image archival and publishing. Your files never leave your device." },
  "avif-to-gif": { category: "image-format", description: "<strong>AVIF to GIF Converter:</strong> Convert AVIF files into GIF format for animated and static image format for broad compatibility. Your files never leave your device." },
  "avif-to-ico": { category: "image-format", description: "<strong>AVIF to ICO Converter:</strong> Convert AVIF files into ICO format for Windows icon format for favicons and app icons. Your files never leave your device." },
  "avif-to-jxl": { category: "image-format", description: "<strong>AVIF to JXL Converter:</strong> Convert AVIF files into JPEG XL format for next-gen JPEG XL image format. Your files never leave your device." },
  "svg-to-heic": { category: "image-format", description: "<strong>SVG to HEIC Converter:</strong> Convert SVG vector files into HEIC/HEIF format for high-efficiency photo format from Apple devices. Your files never leave your device." },
  "svg-to-bmp": { category: "image-format", description: "<strong>SVG to BMP Converter:</strong> Convert SVG vector files into BMP format for uncompressed bitmap image heritage format. Your files never leave your device." },
  "svg-to-tiff": { category: "image-format", description: "<strong>SVG to TIFF Converter:</strong> Convert SVG vector files into TIFF format for high-resolution image archival and publishing. Your files never leave your device." },
  "svg-to-ico": { category: "image-format", description: "<strong>SVG to ICO Converter:</strong> Convert SVG vector files into ICO format for Windows icon format for favicons and app icons. Your files never leave your device." },
  "svg-to-jxl": { category: "image-format", description: "<strong>SVG to JXL Converter:</strong> Convert SVG vector files into JPEG XL format for next-gen JPEG XL image format. Your files never leave your device." },
  "bmp-to-heic": { category: "image-format", description: "<strong>BMP to HEIC Converter:</strong> Convert BMP bitmap files into HEIC/HEIF format for high-efficiency photo format from Apple devices. Your files never leave your device." },
  "bmp-to-svg": { category: "image-format", description: "<strong>BMP to SVG Converter:</strong> Convert BMP bitmap files into SVG format for scalable vector graphics for logos and icons. Your files never leave your device." },
  "bmp-to-tiff": { category: "image-format", description: "<strong>BMP to TIFF Converter:</strong> Convert BMP bitmap files into TIFF format for high-resolution image archival and publishing. Your files never leave your device." },
  "bmp-to-ico": { category: "image-format", description: "<strong>BMP to ICO Converter:</strong> Convert BMP bitmap files into ICO format for Windows icon format for favicons and app icons. Your files never leave your device." },
  "bmp-to-jxl": { category: "image-format", description: "<strong>BMP to JXL Converter:</strong> Convert BMP bitmap files into JPEG XL format for next-gen JPEG XL image format. Your files never leave your device." },
  "tiff-to-heic": { category: "image-format", description: "<strong>TIFF to HEIC Converter:</strong> Convert TIFF files into HEIC/HEIF format for high-efficiency photo format from Apple devices. Your files never leave your device." },
  "tiff-to-svg": { category: "image-format", description: "<strong>TIFF to SVG Converter:</strong> Convert TIFF files into SVG format for scalable vector graphics for logos and icons. Your files never leave your device." },
  "tiff-to-bmp": { category: "image-format", description: "<strong>TIFF to BMP Converter:</strong> Convert TIFF files into BMP format for uncompressed bitmap image heritage format. Your files never leave your device." },
  "tiff-to-ico": { category: "image-format", description: "<strong>TIFF to ICO Converter:</strong> Convert TIFF files into ICO format for Windows icon format for favicons and app icons. Your files never leave your device." },
  "tiff-to-jxl": { category: "image-format", description: "<strong>TIFF to JXL Converter:</strong> Convert TIFF files into JPEG XL format for next-gen JPEG XL image format. Your files never leave your device." },
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
