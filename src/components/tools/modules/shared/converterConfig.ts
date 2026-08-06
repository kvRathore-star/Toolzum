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
