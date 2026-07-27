const fs = require('fs');

const CONV_INSTRUCTIONS = {
  "csv-to-json": [
    ["1. Paste or Upload CSV", "Paste your CSV data or upload a CSV file. The tool automatically detects delimiters (comma, tab, semicolon)."],
    ["2. Configure Options", "Choose header row handling, quote character, and whether to trim whitespace."],
    ["3. Convert & Copy", "Click Convert to generate JSON. Copy the result or download as a .json file."],
  ],
  "csv-to-xml": [
    ["1. Enter CSV Data", "Paste comma-separated values or upload a CSV file."],
    ["2. Set Root Element", "Enter a root element name for the XML output (e.g., 'items' or 'records')."],
    ["3. Generate XML", "The tool converts each row into an XML element. Copy or download the result."],
  ],
  "json-to-csv": [
    ["1. Paste JSON", "Paste a JSON array of objects or upload a .json file."],
    ["2. Flatten Nested Fields", "Optionally select which nested fields to flatten into columns."],
    ["3. Export CSV", "Download the CSV or copy it to clipboard. Headers are derived from JSON keys."],
  ],
  "json-to-xml": [
    ["1. Enter JSON", "Paste valid JSON or upload a .json file."],
    ["2. Set XML Root", "Define the root element name and how arrays are wrapped."],
    ["3. Convert", "Generate well-formed XML. Copy or download the output."],
  ],
  "xml-to-csv": [
    ["1. Upload or Paste XML", "Paste XML data or upload an .xml file."],
    ["2. Select Elements", "Choose which XML elements become rows and which nested elements become columns."],
    ["3. Download CSV", "Review the flattened table and export as CSV."],
  ],
  "xml-to-json": [
    ["1. Enter XML", "Paste XML content or upload an .xml file."],
    ["2. Tune Conversion", "Choose whether to preserve attributes, handle namespaces, and format arrays."],
    ["3. Get JSON", "View the JSON output with proper indentation. Copy or download."],
  ],
  "xlsx-csv-converter": [
    ["1. Upload Excel File", "Select an .xlsx or .xls file from your device."],
    ["2. Choose Sheet", "Pick the sheet to convert if the workbook has multiple sheets."],
    ["3. Download CSV", "The converted CSV file is ready for download immediately."],
  ],
  "yaml-json-converter": [
    ["1. Paste YAML or JSON", "Enter YAML to convert to JSON, or JSON to convert to YAML."],
    ["2. Direction Auto-Detected", "The tool detects the input format and shows the output in the opposite format."],
    ["3. Copy Result", "Copy the converted output or download it as a file."],
  ],
  "csv-html-table-converter": [
    ["1. Paste CSV Data", "Enter comma-separated values or upload a CSV file."],
    ["2. Preview Table", "See a live preview of the HTML table with proper column headers."],
    ["3. Copy HTML", "Copy the generated HTML <table> code for use in web pages."],
  ],
  "json-to-ini-converter": [
    ["1. Paste JSON", "Enter a flat or nested JSON object."],
    ["2. Convert to INI", "The tool maps JSON keys to INI section headers and properties."],
    ["3. Copy INI Output", "Copy the generated INI configuration file content."],
  ],
  "json-to-toml-converter": [
    ["1. Enter JSON", "Paste JSON data that you want to convert to TOML format."],
    ["2. Convert", "The tool transforms JSON objects and arrays into TOML tables and inline arrays."],
    ["3. Copy TOML", "Copy the TOML output for use in configuration files."],
  ],
  "json-to-yaml-converter": [
    ["1. Paste JSON", "Enter valid JSON to convert to YAML format."],
    ["2. Convert", "The tool handles nested objects, arrays, and primitive values."],
    ["3. Copy YAML", "Copy the YAML output or download it as a .yml file."],
  ],
  "ini-json-converter": [
    ["1. Paste INI Content", "Enter INI configuration file content."],
    ["2. Convert to JSON", "The tool parses INI sections and key-value pairs into a JSON object."],
    ["3. Copy JSON", "Copy the resulting JSON for use in applications."],
  ],
  "toml-converter": [
    ["1. Paste TOML or JSON", "Enter TOML to convert to JSON, or JSON to convert to TOML."],
    ["2. Auto-Convert", "The tool detects the input format and converts to the other."],
    ["3. Copy Output", "Copy the converted result for your project."],
  ],
  "json-to-code": [
    ["1. Paste JSON", "Enter a JSON object to generate code from."],
    ["2. Select Language", "Choose your target language: TypeScript, Python, Go, Rust, Java, or C#."],
    ["3. Copy Generated Code", "Copy the type definitions or struct code generated from the JSON structure."],
  ],
  "json-toon-converter": [
    ["1. Enter JSON", "Paste JSON data to convert to Toon format."],
    ["2. Convert", "The tool transforms JSON into the human-friendly Toon syntax."],
    ["3. Copy Toon", "Copy the Toon output for use in your project."],
  ],
  "toon-to-json": [
    ["1. Paste Toon", "Enter Toon-format data to convert to JSON."],
    ["2. Convert", "The tool parses Toon syntax into standard JSON."],
    ["3. Copy JSON", "Copy the resulting JSON output."],
  ],
  "toon-to-yaml": [
    ["1. Paste Toon", "Enter Toon-format data to convert to YAML."],
    ["2. Convert", "The tool transforms Toon syntax into YAML format."],
    ["3. Copy YAML", "Copy the resulting YAML output."],
  ],
  "yaml-to-toon": [
    ["1. Paste YAML", "Enter YAML content to convert to Toon format."],
    ["2. Convert", "The tool parses YAML and generates equivalent Toon syntax."],
    ["3. Copy Toon", "Copy the Toon output."],
  ],
  "parquet-to-csv-converter": [
    ["1. Upload Parquet File", "Select a .parquet file from your device."],
    ["2. Preview Columns", "Review the schema and preview the first rows before converting."],
    ["3. Download CSV", "Download the full data as a CSV file."],
  ],
  "csv-to-markdown": [
    ["1. Paste CSV", "Enter comma-separated values with a header row."],
    ["2. Preview Table", "See a live preview of the Markdown table."],
    ["3. Copy Markdown", "Copy the generated Markdown table syntax."],
  ],
  "data-converter": [
    ["1. Enter Data", "Paste your data in any supported format (JSON, XML, CSV, YAML, TOML)."],
    ["2. Choose Target", "Select the output format you need."],
    ["3. Convert & Copy", "Convert instantly and copy the result."],
  ],
  "import-to-csv": [
    ["1. Upload File", "Upload a data file (JSON, XML, or XLSX)."],
    ["2. Map Fields", "Confirm field mapping from source to CSV columns."],
    ["3. Export CSV", "Download the converted CSV file."],
  ],
  "html-to-text-converter": [
    ["1. Paste HTML", "Enter HTML content with tags, attributes, and text."],
    ["2. Configure Options", "Choose whether to preserve links, line breaks, and heading formatting."],
    ["3. Get Plain Text", "Copy the extracted plain text without any HTML markup."],
  ],
  "text-to-html-converter": [
    ["1. Enter Plain Text", "Paste or type the plain text you want to convert."],
    ["2. Customize Output", "Choose paragraph handling, link detection, and list formatting."],
    ["3. Copy HTML", "Copy the generated HTML code."],
  ],
  "markdown-tools": [
    ["1. Enter Markdown", "Paste Markdown content or upload a .md file."],
    ["2. Choose Output", "Select HTML, PDF, or plain text as the target format."],
    ["3. Export", "Copy the output or download as a file."],
  ],
  "avi-to-mp4": [
    ["1. Upload AVI File", "Select an .avi video file from your device."],
    ["2. Choose Quality", "Pick output quality: high, medium, or low. Higher quality produces larger files."],
    ["3. Convert & Download", "Click Convert and download your MP4 file."],
  ],
  "mkv-to-mov": [
    ["1. Upload MKV", "Select an .mkv video file to convert."],
    ["2. Adjust Settings", "Choose video codec (H.264, H.265) and quality."],
    ["3. Download MOV", "Convert and download the MOV file."],
  ],
  "mkv-to-mp4": [
    ["1. Choose MKV File", "Upload or drag an .mkv file into the converter."],
    ["2. Select Codec", "Choose H.264 for broad compatibility or H.265 for better compression."],
    ["3. Start Conversion", "Convert and download as MP4 with all audio tracks preserved."],
  ],
  "mov-to-mkv": [
    ["1. Upload MOV", "Select a .mov file from your device."],
    ["2. Configure", "Choose video and audio codec settings for the MKV container."],
    ["3. Convert", "Download the converted MKV file."],
  ],
  "mov-to-mp4": [
    ["1. Upload MOV File", "Select a .mov video file to convert."],
    ["2. Set Quality", "Choose output resolution and bitrate."],
    ["3. Download MP4", "Convert and download the MP4 file compatible with most devices."],
  ],
  "mp4-to-mkv": [
    ["1. Upload MP4", "Select an .mp4 file to convert to MKV."],
    ["2. Choose Tracks", "Select which audio and subtitle tracks to include."],
    ["3. Convert", "Download the MKV file with your selected tracks."],
  ],
  "mp4-to-mov": [
    ["1. Upload MP4", "Select an .mp4 video file."],
    ["2. Convert", "The tool re-encodes the video into a QuickTime-compatible MOV format."],
    ["3. Download MOV", "Download the converted MOV file."],
  ],
  "webm-to-mp4": [
    ["1. Upload WebM", "Select a .webm video file from your device."],
    ["2. Choose Quality", "Pick output quality and resolution for the MP4."],
    ["3. Download MP4", "Convert and download the MP4 file."],
  ],
  "gif-to-webp-webm": [
    ["1. Upload GIF", "Select a .gif file to convert."],
    ["2. Choose Output", "Pick WebP for smaller file sizes or WebM for better quality animation."],
    ["3. Download", "Convert and download the optimized animation."],
  ],
  "css-to-less-converter": [
    ["1. Paste CSS", "Enter your CSS code in the input editor."],
    ["2. Convert to Less", "The tool transforms CSS into Less syntax with variables, nesting, and mixins."],
    ["3. Copy Less", "Copy the generated Less code or download as .less file."],
  ],
  "css-to-scss-converter": [
    ["1. Enter CSS", "Paste standard CSS code into the editor."],
    ["2. Convert to SCSS", "The tool adds nesting, variables, and SCSS-compatible syntax."],
    ["3. Copy SCSS", "Copy the generated SCSS code."],
  ],
  "css-to-stylus-converter": [
    ["1. Paste CSS", "Enter your CSS code."],
    ["2. Convert to Stylus", "The tool transforms CSS into Stylus syntax with optional brackets and colons."],
    ["3. Copy Stylus", "Copy the generated Stylus code."],
  ],
  "less-to-css-converter": [
    ["1. Enter Less", "Paste Less code with variables, mixins, and nesting."],
    ["2. Compile to CSS", "The tool compiles Less into standard CSS."],
    ["3. Copy CSS", "Copy the resulting CSS for use in any project."],
  ],
  "scss-to-css-converter": [
    ["1. Enter SCSS", "Paste SCSS code with nested rules and variables."],
    ["2. Compile", "The tool compiles SCSS into plain CSS."],
    ["3. Copy CSS", "Copy the compiled CSS output."],
  ],
  "stylus-to-css-converter": [
    ["1. Enter Stylus", "Paste Stylus code with its optional syntax."],
    ["2. Compile to CSS", "The tool compiles Stylus into standard browser-compatible CSS."],
    ["3. Copy CSS", "Copy the resulting CSS."],
  ],
  "tailwind-to-css-converter": [
    ["1. Paste Tailwind HTML", "Enter HTML with Tailwind CSS utility classes."],
    ["2. Convert to CSS", "The tool extracts utility classes and generates equivalent custom CSS."],
    ["3. Copy CSS", "Copy the converted CSS rules."],
  ],
  "document-converter": [
    ["1. Upload Document", "Select a document file (DOCX, ODT, RTF, TXT, HTML)."],
    ["2. Choose Output Format", "Pick the target format: PDF, DOCX, ODT, RTF, TXT, or HTML."],
    ["3. Convert & Download", "Download the converted document with formatting preserved."],
  ],
  "archive-converter": [
    ["1. Upload Archive", "Select a ZIP, RAR, 7z, TAR, or GZ file."],
    ["2. Choose Output Format", "Pick the target archive format for conversion."],
    ["3. Download", "Convert and download the re-packaged archive."],
  ],
  "odt-rtf-to-pdf": [
    ["1. Upload File", "Select an ODT or RTF document."],
    ["2. Configure PDF Options", "Set page size, margins, and orientation for the PDF output."],
    ["3. Download PDF", "Convert and download the PDF file."],
  ],
  "epub-to-pdf": [
    ["1. Upload EPUB", "Select an .epub e-book file from your device."],
    ["2. Choose Layout", "Pick page size, font size, and margin preferences."],
    ["3. Download PDF", "Convert the e-book to PDF and download."],
  ],
  "mobi-converter": [
    ["1. Upload E-Book", "Select an EPUB, PDF, or DOCX file to convert to MOBI."],
    ["2. Set Metadata", "Edit title, author, and cover image if needed."],
    ["3. Download MOBI", "Convert and download the MOBI file for Kindle devices."],
  ],
  "cbz-to-pdf": [
    ["1. Upload CBZ File", "Select a .cbz comic book archive file."],
    ["2. Arrange Pages", "Review and reorder pages if needed before conversion."],
    ["3. Download PDF", "Convert the CBZ to a single PDF document."],
  ],
  "text-tools": [
    ["1. Enter Text", "Paste or type the text you want to work with."],
    ["2. Choose Operation", "Select case conversion, trimming, line sorting, or encoding."],
    ["3. Get Result", "Copy the transformed text or download as a file."],
  ],
  "temperature-converter": [
    ["1. Enter Temperature", "Input the temperature value to convert."],
    ["2. Select Units", "Choose from Celsius, Fahrenheit, or Kelvin as input and output units."],
    ["3. View Result", "See the converted temperature instantly with the formula shown."],
  ],
  "roman-numeral-converter": [
    ["1. Enter Roman or Number", "Type a Roman numeral (e.g., XIV) or a number (e.g., 14)."],
    ["2. Auto-Convert", "The tool detects the input format and converts instantly."],
    ["3. Copy Result", "Copy the converted value to your clipboard."],
  ],
};

const CONV_FAQS = {
  "csv-to-json": [
    ["What delimiter is supported?", "Comma is the default, but the tool auto-detects tabs, semicolons, and pipes. You can also set a custom delimiter."],
    ["How are quoted fields handled?", "Fields enclosed in double quotes are preserved as single values, even if they contain delimiters or newlines."],
    ["Can I convert CSV with no headers?", "Yes. Toggle the 'first row is header' option. Without headers, columns are named field_0, field_1, etc."],
  ],
  "csv-to-xml": [
    ["What if my CSV has no header row?", "You can specify custom element names for columns. Otherwise generic 'column1', 'column2' names are used."],
    ["How are empty cells handled?", "Empty cells are omitted from the XML output by default, or you can include them as empty elements."],
    ["Can I set a custom namespace?", "Yes. You can add an XML namespace prefix to the root element."],
  ],
  "json-to-csv": [
    ["How are nested objects handled?", "Nested objects are flattened using dot notation (e.g., 'address.city'). You can choose which nested paths to include."],
    ["What happens to arrays in JSON?", "Arrays are stringified as JSON strings in a single cell. For arrays of objects, each object becomes a separate row."],
    ["Is the CSV RFC-compliant?", "Yes. Fields containing commas, quotes, or newlines are properly escaped according to RFC 4180."],
  ],
  "json-to-xml": [
    ["How are JSON arrays converted?", "Each array element is wrapped in a parent element. You can customize the element naming convention."],
    ["Are JSON attributes supported?", "Yes. You can mark specific JSON keys as XML attributes instead of child elements."],
    ["Can I format the XML output?", "Yes. The output is indented by default. Toggle minification for compact output."],
  ],
  "xml-to-csv": [
    ["How are nested XML elements flattened?", "Child elements become additional columns with dot-separated names (e.g., 'author.name')."],
    ["What about XML attributes?", "Attributes are prefixed with '@' by default (e.g., '@id'). You can change the prefix in settings."],
    ["Can I handle repeating child elements?", "Yes. Repeating child elements are expanded into separate rows with parent data duplicated."],
  ],
  "xml-to-json": [
    ["How are XML attributes handled?", "Attributes are prefixed with '@' by default. Toggle this behavior in the advanced options."],
    ["What about namespaces?", "XML namespaces can be preserved or stripped. Preserved namespaces become part of the JSON key."],
    ["Are text nodes preserved?", "Yes. Elements with both text and child elements have a '#text' key for the text content."],
  ],
  "xlsx-csv-converter": [
    ["Are formulas preserved?", "Formulas are evaluated and the resulting values are exported to CSV, not the formulas themselves."],
    ["What if my Excel file has formatting?", "CSV does not support formatting (colors, fonts, borders). Only the cell values are exported."],
    ["Can I convert specific cells instead of the whole sheet?", "The converter exports all data in the selected sheet. Use a range selection in Excel first if needed."],
  ],
  "yaml-json-converter": [
    ["Is the conversion lossless?", "For simple data types (strings, numbers, booleans, null, arrays, objects), conversion is lossless."],
    ["How are YAML anchors handled?", "YAML anchors and aliases are resolved and expanded in the JSON output."],
    ["What about comments?", "YAML comments are discarded during conversion as JSON does not support comments."],
  ],
  "csv-html-table-converter": [
    ["How are CSV headers mapped?", "The first row of the CSV becomes the <thead> row. Subsequent rows become <tr> elements."],
    ["Can I add CSS classes?", "Yes. You can add custom CSS classes to the table, thead, and tbody elements in the output."],
    ["Is the output responsive?", "The generated HTML is a plain table. Add your own CSS for responsive behavior."],
  ],
  "json-to-ini-converter": [
    ["How are nested JSON keys handled?", "Nested objects become INI sections like [parent.child]. Flat keys become properties within sections."],
    ["What about arrays?", "JSON arrays are serialized as comma-separated values in single INI properties."],
    ["Is the output valid INI?", "Yes. The output follows standard INI formatting with section headers and key=value pairs."],
  ],
  "json-to-toml-converter": [
    ["How are nested objects converted?", "Nested objects become TOML tables using [table.subtable] notation."],
    ["What about arrays?", "Arrays are converted to TOML inline arrays. Arrays of tables use [[array]] notation."],
    ["Are TOML date types supported?", "Yes. ISO 8601 date strings in JSON are detected and output as TOML datetime values."],
  ],
  "json-to-yaml-converter": [
    ["How are null values handled?", "Null values in JSON become 'null' or '~' in YAML, or can be omitted entirely."],
    ["Does this preserve key order?", "Yes. Key ordering from the JSON input is preserved in the YAML output."],
    ["What about multiline strings?", "Multiline strings use YAML's block scalar notation (| or >) for readability."],
  ],
  "ini-json-converter": [
    ["How are duplicate keys handled?", "Duplicate keys in INI are converted to JSON arrays. The last value is used if duplicates are not desired."],
    ["Are INI comments preserved?", "INI comments (; or #) are discarded as JSON does not support comments."],
    ["What if there are no sections?", "Keys without a section header are placed in a 'global' object in the JSON output."],
  ],
  "toml-converter": [
    ["Are TOML inline tables supported?", "Yes. Inline tables in TOML are converted to nested JSON objects and vice versa."],
    ["How are TOML dates handled?", "TOML datetimes are converted to ISO 8601 strings in JSON output."],
    ["Is the conversion bidirectional?", "Yes. The tool converts both TOML-to-JSON and JSON-to-TOML in a single interface."],
  ],
  "json-to-code": [
    ["What languages are supported?", "TypeScript interfaces, Python dataclasses, Go structs, Rust structs, Java classes, and C# records."],
    ["How are nested objects handled?", "Nested objects generate separate type definitions or nested classes depending on the target language."],
    ["Can I customize naming conventions?", "Yes. Choose camelCase, PascalCase, or snake_case for the generated type names."],
  ],
  "json-toon-converter": [
    ["What is Toon format?", "Toon is a human-friendly data format similar to YAML but with a simpler syntax."],
    ["Are all JSON types supported?", "Yes. Objects, arrays, strings, numbers, booleans, and null values are all supported."],
    ["Can I convert back from Toon to JSON?", "Yes. Use the Toon to JSON converter tool for the reverse operation."],
  ],
  "toon-to-json": [
    ["Is the conversion lossless?", "Yes. All Toon data types have equivalent JSON representations."],
    ["What about Toon comments?", "Toon comments are stripped during conversion to JSON."],
    ["Can I format the JSON output?", "Yes. The JSON output is pretty-printed by default with configurable indentation."],
  ],
  "toon-to-yaml": [
    ["Are Toon multiline strings supported?", "Yes. Multiline strings in Toon are converted to YAML block scalars."],
    ["How are nested structures handled?", "Nested Toon objects become properly indented YAML mappings."],
    ["Is the output valid YAML 1.1?", "Yes. The output follows YAML 1.2 specification for broad compatibility."],
  ],
  "yaml-to-toon": [
    ["Are YAML anchors preserved?", "YAML anchors and aliases are resolved before conversion to Toon."],
    ["How are YAML tags handled?", "Custom YAML tags are stripped. Standard types (str, int, float, bool) are inferred automatically."],
    ["Can I convert large YAML files?", "Yes. The browser-based converter handles moderately sized files. Very large files may affect performance."],
  ],
  "parquet-to-csv-converter": [
    ["What Parquet features are supported?", "The converter handles all standard Parquet data types including nested schemas and repeated fields."],
    ["Are there file size limits?", "Processing is done locally in the browser. Very large Parquet files may take time to load."],
    ["Is compression preserved?", "Parquet compression (Snappy, GZIP, LZ4, ZSTD) is decompressed during conversion. The CSV output is uncompressed."],
  ],
  "csv-to-markdown": [
    ["How are CSV headers displayed?", "The first row becomes the Markdown table header, separated by a divider row of dashes."],
    ["Can I set column alignment?", "Yes. Choose left, right, or center alignment for each column in the alignment options."],
    ["Is the output GitHub-flavored Markdown?", "Yes. The output uses GFM table syntax compatible with GitHub, GitLab, and most Markdown renderers."],
  ],
  "data-converter": [
    ["What formats are supported?", "JSON, XML, CSV, YAML, TOML, INI, and Toon. Convert between any pair of supported formats."],
    ["Can I convert large files?", "The converter runs in-browser. Performance depends on file size and browser memory limits."],
    ["Is the data processed locally?", "Yes. All conversions happen entirely in your browser. No data is uploaded to any server."],
  ],
  "import-to-csv": [
    ["What file formats can I import?", "JSON, XML, and XLSX files are supported for import and conversion to CSV."],
    ["How are nested structures flattened?", "Nested objects are flattened with dot-notation keys as CSV column headers."],
    ["Can I reorder columns?", "Yes. Drag and drop columns to reorder them before exporting the CSV."],
  ],
  "html-to-text-converter": [
    ["What HTML elements are supported?", "All standard HTML elements are supported including headings, paragraphs, lists, tables, links, and images."],
    ["How are links handled?", "Links can be shown as inline text, collected as footnotes, or stripped entirely based on your preference."],
    ["Does this handle inline styles?", "Inline CSS styles are stripped. Only the visible text content and structural elements are preserved."],
  ],
  "text-to-html-converter": [
    ["How are paragraphs detected?", "Double line breaks separate paragraphs. Single line breaks can be preserved as <br> tags."],
    ["Are URLs auto-linked?", "Yes. Detected URLs and email addresses are automatically converted to clickable HTML links."],
    ["Can I add custom CSS?", "The converter generates clean HTML. Add your own CSS classes or inline styles as needed."],
  ],
  "markdown-tools": [
    ["What Markdown features are supported?", "Headings, bold, italic, links, images, code blocks, tables, lists, blockquotes, and horizontal rules."],
    ["Can I convert Markdown to PDF?", "Yes. Select PDF as the output format. The PDF preserves Markdown formatting with a clean layout."],
    ["Is the HTML output sanitized?", "Yes. Generated HTML is sanitized to prevent XSS. Raw HTML in Markdown is stripped by default."],
  ],
  "avi-to-mp4": [
    ["What video codecs are supported?", "The converter supports H.264 and H.265 codecs for MP4 output. H.264 offers broad compatibility."],
    ["Can I adjust the resolution?", "Yes. Choose from original, 1080p, 720p, 480p, or custom resolution settings."],
    ["Is the conversion lossy?", "MP4 encoding is lossy. Use high quality setting to minimize visual quality loss."],
  ],
  "mkv-to-mov": [
    ["Are subtitles preserved?", "MKV subtitle tracks are converted to MOV-compatible formats or can be embedded as separate tracks."],
    ["What audio codecs are supported?", "AAC, MP3, and PCM audio codecs are supported for the MOV container."],
    ["Can I select specific tracks?", "Yes. Choose which video, audio, and subtitle tracks from the MKV to include in the MOV output."],
  ],
  "mkv-to-mp4": [
    ["Are all MKV codecs supported?", "Common codecs like H.264, H.265, VP9, and AV1 are supported. Unsupported codecs are re-encoded."],
    ["What about subtitles?", "MKV subtitles can be burned into the video or converted to MP4-compatible formats."],
    ["Is the conversion fast?", "Conversion speed depends on file size and your device. Smaller files convert in seconds."],
  ],
  "mov-to-mkv": [
    ["What codecs are preserved?", "Common codecs like H.264, ProRes, and DNxHD are preserved when remuxing to MKV."],
    ["Can I add subtitles?", "You can add external SRT or ASS subtitle files to the MKV output."],
    ["Is the audio re-encoded?", "By default audio is copied without re-encoding. Re-encode if you need a different audio format."],
  ],
  "mov-to-mp4": [
    ["Are ProRes files supported?", "Yes. ProRes MOV files are converted to H.264/H.265 MP4 for better compatibility and smaller file sizes."],
    ["Can I trim the video?", "Yes. Set start and end times to convert only a portion of the MOV file."],
    ["Does this preserve metadata?", "Basic metadata like creation date and rotation flags are preserved where possible."],
  ],
  "mp4-to-mkv": [
    ["Why convert MP4 to MKV?", "MKV supports more codecs, subtitles, and chapter markers than MP4. It is preferred for archiving."],
    ["Are chapters preserved?", "Yes. Chapter markers in the MP4 are converted to MKV chapter format."],
    ["Can I add additional audio tracks?", "Yes. You can add external audio tracks to the MKV output during conversion."],
  ],
  "mp4-to-mov": [
    ["What is the difference between MP4 and MOV?", "Both use similar codecs. MOV is Apple's QuickTime format with broader ProRes support."],
    ["Is the conversion lossless?", "When using the same codec, the conversion remuxes the streams without re-encoding for lossless output."],
    ["Are metadata tags preserved?", "Yes. MP4 metadata tags are converted to MOV-compatible metadata."],
  ],
  "webm-to-mp4": [
    ["What codecs does WebM use?", "WebM uses VP8/VP9 video codec and Vorbis/Opus audio. These are re-encoded to H.264/AAC for MP4."],
    ["Will I lose quality?", "Re-encoding from VP9 to H.264 may result in slight quality loss. Use high quality settings to minimize this."],
    ["Can I batch convert?", "The converter handles one file at a time. For multiple files, convert them individually."],
  ],
  "gif-to-webp-webm": [
    ["Which format is better: WebP or WebM?", "WebP animations are smaller files. WebM animations support higher quality and more colors."],
    ["Can I control the animation speed?", "Yes. The GIF frame duration is preserved. Adjust speed multiplier for faster or slower playback."],
    ["Is the conversion lossy?", "Both WebP and WebM use lossy compression for animations. Higher quality settings produce larger files."],
  ],
  "css-to-less-converter": [
    ["Are CSS custom properties converted?", "Yes. CSS custom properties (--variable) are converted to Less variables (@variable)."],
    ["How are nested rules handled?", "CSS descendant selectors are converted to Less nested rules for cleaner syntax."],
    ["Are media queries preserved?", "Yes. CSS media queries are converted to Less nested media query syntax."],
  ],
  "css-to-scss-converter": [
    ["Are CSS variables converted?", "Yes. CSS custom properties become SCSS variables ($variable) during conversion."],
    ["How are vendor prefixes handled?", "Vendor prefixes are preserved as-is. SCSS mixins for prefixes are not auto-generated."],
    ["Can I choose brace style?", "Yes. Choose expanded or compact brace placement in the SCSS output."],
  ],
  "css-to-stylus-converter": [
    ["Does Stylus use braces and colons?", "Stylus supports optional braces and colons. You can choose to include or omit them."],
    ["How are CSS comments handled?", "CSS multi-line comments are preserved. Single-line CSS comments are converted to Stylus // style."],
    ["Are CSS imports converted?", "Yes. CSS @import statements are preserved in the Stylus output."],
  ],
  "less-to-css-converter": [
    ["Are Less mixins compiled?", "Yes. Less mixins with parameters are resolved and the resulting CSS is output."],
    ["How are Less variables handled?", "Less variables are evaluated and their computed values are output in the CSS."],
    ["Are Less guards supported?", "Yes. Less guarded mixins are evaluated and included based on the guard conditions."],
  ],
  "scss-to-css-converter": [
    ["Are SCSS @extend directives compiled?", "Yes. @extend directives are resolved into the final CSS output."],
    ["How are SCSS @if/@else blocks handled?", "Conditional blocks are evaluated based on the variable values provided."],
    ["Can I choose output style?", "Yes. Choose expanded (readable) or compressed (minified) CSS output."],
  ],
  "stylus-to-css-converter": [
    ["Does this handle Stylus transparent mixins?", "Yes. Stylus transparent mixins are compiled to their CSS equivalents."],
    ["How are Stylus variable interpolation handled?", "Variable interpolation in selectors and properties is resolved during compilation."],
    ["Are Stylus block mixins supported?", "Yes. Block mixins using +prefix syntax are compiled to CSS."],
  ],
  "tailwind-to-css-converter": [
    ["What Tailwind classes are supported?", "All standard Tailwind utility classes for layout, spacing, typography, colors, and effects."],
    ["Are responsive prefixes handled?", "Yes. sm:, md:, lg:, xl:, and 2xl: prefixes are converted to their respective media queries."],
    ["Can I customize the CSS output?", "Yes. Choose whether to generate class-based or direct property CSS output."],
  ],
  "document-converter": [
    ["What document formats are supported?", "Input: DOCX, ODT, RTF, TXT, HTML. Output: PDF, DOCX, ODT, RTF, TXT, HTML."],
    ["Is formatting preserved?", "Basic formatting (bold, italic, fonts, colors) is preserved. Complex layouts may have minor differences."],
    ["Are images preserved?", "Embedded images are preserved in the output document where the format supports images."],
  ],
  "archive-converter": [
    ["What archive formats are supported?", "ZIP, RAR, 7z, TAR, GZ, BZ2, and XZ archives can be converted between formats."],
    ["Is compression level adjustable?", "Yes. Choose from fast (lower compression) to maximum (smallest file size) compression levels."],
    ["Are passwords preserved?", "Password-protected archives are decrypted during conversion. You need the original password."],
  ],
  "odt-rtf-to-pdf": [
    ["Are embedded fonts preserved?", "Yes. Embedded fonts in the ODT or RTF document are included in the PDF output."],
    ["Can I set PDF security options?", "Yes. Set a password to restrict opening, printing, or editing the PDF."],
    ["Are bookmarks generated?", "Yes. Headings in the source document are converted to PDF bookmarks for navigation."],
  ],
  "epub-to-pdf": [
    ["Are EPUB images preserved?", "Yes. All images from the EPUB are included in the PDF output."],
    ["Can I set the PDF page size?", "Yes. Choose from A4, Letter, or custom page dimensions."],
    ["Are EPUB hyperlinks preserved?", "Yes. Internal and external hyperlinks from the EPUB are converted to PDF hyperlinks."],
  ],
  "mobi-converter": [
    ["Can I convert EPUB to MOBI?", "Yes. EPUB is the most common source format for MOBI conversion."],
    ["Are Kindle-specific features supported?", "Yes. The output supports Kindle features like X-Ray, page numbers, and book covers."],
    ["Is the MOBI file compatible with all Kindles?", "Yes. The output uses the MOBI 7 format compatible with all Kindle devices and apps."],
  ],
  "cbz-to-pdf": [
    ["What image formats inside CBZ are supported?", "JPEG, PNG, GIF, and WebP images inside CBZ archives are all supported."],
    ["Can I reorder pages?", "Yes. Drag and drop to reorder pages before converting to PDF."],
    ["Are page numbers added?", "Optional. You can add page numbers to the bottom of each PDF page."],
  ],
  "text-tools": [
    ["What text operations are available?", "Case conversion (upper, lower, title, sentence), trimming, line sorting, encoding detection, and whitespace normalization."],
    ["Can I process multiple lines?", "Yes. All operations work on multi-line text. Line-based operations sort or format each line."],
    ["Is the data processed locally?", "Yes. All text processing happens entirely in your browser. Nothing is sent to a server."],
  ],
  "temperature-converter": [
    ["What conversion formulas are used?", "C to F: F = C x 9/5 + 32. F to C: C = (F - 32) x 5/9. C to K: K = C + 273.15."],
    ["Can I convert between all three units?", "Yes. Enter any value in Celsius, Fahrenheit, or Kelvin and see conversions to both other units."],
    ["Is negative temperature supported?", "Yes. Negative values are supported for Celsius and Fahrenheit. Kelvin values cannot go below absolute zero."],
  ],
  "roman-numeral-converter": [
    ["What is the maximum number supported?", "Standard Roman numerals support up to 3,999 (MMMCMXCIX). The tool may support higher values with vinculum notation."],
    ["What is the subtractive notation?", "Roman numerals use subtractive notation: IV (4) instead of IIII, IX (9) instead of VIIII."],
    ["Can I convert invalid Roman numerals?", "The tool validates Roman numeral syntax and flags invalid combinations like VX or IIV."],
  ],
};

const FILES = [
  'src/registry/tools-chunk-0.ts',
  'src/registry/tools-chunk-1.ts',
  'src/registry/tools-chunk-2.ts',
  'src/registry/tools-chunk-3.ts',
  'src/registry/tools-chunk-4.ts',
  'src/registry/tools-chunk-5.ts',
];

let modifiedCount = 0;
let skippedCount = 0;

for (const fpath of FILES) {
  let src = fs.readFileSync(fpath, 'utf8');

  for (const [slug, insts] of Object.entries(CONV_INSTRUCTIONS)) {
    const slugRegex = new RegExp(`slug:\\s*['\"]${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`);
    const slugMatch = src.match(slugRegex);
    if (!slugMatch) continue;

    const pos = slugMatch.index;

    // Find the full tool object by tracking brace balance
    let toolStart = src.lastIndexOf('{', pos);
    let braceCount = 0;
    let toolEnd = toolStart;
    for (let k = toolStart; k < src.length; k++) {
      if (src[k] === '{') braceCount++;
      if (src[k] === '}') braceCount--;
      if (braceCount === 0 && k > toolStart) {
        toolEnd = k + 1;
        break;
      }
    }

    const fullTool = src.substring(toolStart, toolEnd);

    // Skip if already has instructions
    if (fullTool.includes('instructions:')) {
      skippedCount++;
      continue;
    }

    // Insert before the tool's closing `}`, cleaning up trailing whitespace from the prefix
    const prefix = src.substring(0, toolEnd - 1).replace(/\s+$/, '');
    // Ensure trailing comma before inserting new properties
    const needsComma = !prefix.endsWith(',');
    const prefixFixed = prefix + (needsComma ? ',' : '');

    // Build insert text with correct indentation (6 spaces for array items, 4 for properties)
    let insertText = '\n    instructions: [\n';
    for (const [title, desc] of insts) {
      insertText += `      { title: "${title.replace(/"/g, "'")}", desc: "${desc.replace(/"/g, "'")}" },\n`;
    }
    insertText += '    ],\n    faqs: [\n';
    const faqs = CONV_FAQS[slug] || [];
    for (const [q, a] of faqs) {
      insertText += `      { question: "${q.replace(/"/g, "'")}", answer: "${a.replace(/"/g, "'")}" },\n`;
    }
    // trailing 2 spaces matches the indent used for the closing `  },`
    insertText += '    ],\n  ';

    src = prefixFixed + insertText + src.substring(toolEnd - 1);
    modifiedCount++;
  }

  fs.writeFileSync(fpath, src);
}

console.log(`Modified: ${modifiedCount} Converter tools`);
console.log(`Skipped (already had instructions): ${skippedCount} tools`);
