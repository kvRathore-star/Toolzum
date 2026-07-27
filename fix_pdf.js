const fs = require('fs');

const ALL = {};
function add(slug, insts, faqs) { ALL[slug] = { instructions: insts, faqs }; }

// ---- PDF CONVERTERS (to/from PDF) ----
add("jpg-to-pdf", [
  ["1. Upload JPG Images", "Select one or more JPG images from your device. Supported: JPEG, JPG, and JFIF formats. You can also drag and drop files directly."],
  ["2. Arrange Image Order", "Drag thumbnails to reorder pages. Each JPG becomes one PDF page. The order in the PDF matches the thumbnail arrangement."],
  ["3. Generate & Download PDF", "Choose page size (A4, Letter, or match image size) and orientation. Click Create PDF and download your multi-page document."],
], [
  ["Can I combine JPG and PNG in one PDF?", "Yes. The tool accepts multiple image formats simultaneously. Mix JPG, PNG, WebP, and other formats in a single PDF output."],
  ["What happens to EXIF data?", "EXIF orientation tags are respected — images are auto-rotated to display correctly. Other EXIF metadata is stripped from the PDF output."],
  ["Is there a file size limit?", "Processing is done locally in your browser. Very large images (>50MB each) may take time. Total pages are limited by browser memory."],
]);

add("png-to-pdf", [
  ["1. Upload PNG Files", "Select PNG images to convert. PNG preserves transparency — the tool lets you choose a background color for transparent areas."],
  ["2. Set Background Options", "For images with transparency, pick a solid background color (white, black, or custom) or keep transparency for specific PDF viewers."],
  ["3. Create PDF", "Choose layout: single image per page or multiple images per page. Download the resulting PDF document."],
], [
  ["Does the PDF preserve PNG transparency?", "Most PDF viewers render transparent PNGs correctly when 'preserve transparency' is selected. Some older viewers may display a checkerboard pattern."],
  ["Can I adjust image DPI for print?", "Yes. Set output DPI from 72 (screen) to 300 (print quality). Higher DPI means larger PDF file size but better print output."],
  ["What page sizes are available?", "A3, A4, A5, Letter, Legal, Tabloid, and custom page sizes. Images are scaled to fit within the page margins."],
]);

add("heic-to-pdf", [
  ["1. Upload HEIC Images", "Select HEIC/HEIF photos from your iPhone or modern Android device. HEIC is Apple's efficient image format with 50% smaller files than JPEG."],
  ["2. Choose Output Settings", "Select page size and orientation. Each HEIC photo becomes one PDF page in the order uploaded."],
  ["3. Convert & Download", "Your HEIC images are decoded and assembled into a single PDF. Download the PDF for sharing or archiving."],
], [
  ["Why convert HEIC to PDF?", "HEIC is not universally supported on Windows or in enterprise document systems. PDF ensures anyone can view your photos without special software."],
  ["Does this preserve Live Photos?", "No. Only the still image from a HEIC Live Photo is converted. The motion component is not included in the PDF."],
  ["What about HEIF vs HEIC?", "Both formats use the same HEVC-based compression. The tool handles both .heic and .heif file extensions identically."],
]);

add("word-to-pdf", [
  ["1. Upload Word Document", "Select a .docx or .doc file. The converter preserves text formatting, fonts, tables, images, and basic layout."],
  ["2. Set PDF Options", "Choose PDF compliance level (PDF/A-1b for archiving) and whether to embed fonts for consistent rendering across devices."],
  ["3. Download PDF", "Your Word document is converted to PDF with formatting preserved. Download the result or open in a new tab."],
], [
  ["Are tracked changes visible in the PDF?", "Tracked changes are accepted before conversion. The PDF shows the final document as if all changes were accepted."],
  ["Are Word macros preserved?", "No. VBA macros and ActiveX controls are stripped during conversion. Only visible document content is included in the PDF."],
  ["Do embedded fonts render correctly?", "When font embedding is enabled, the PDF includes the fonts used. The document looks identical on any device without font installation."],
]);

add("excel-to-pdf", [
  ["1. Upload Excel File", "Select a .xlsx or .xls spreadsheet. The tool processes all worksheets in the workbook."],
  ["2. Choose Sheet & Layout", "Select specific sheets or convert all. Choose landscape or portrait orientation and whether to fit all columns on one page."],
  ["3. Export as PDF", "Your spreadsheet is converted to PDF with cell formatting, borders, and conditional formatting preserved."],
], [
  ["Are Excel formulas evaluated?", "Yes. Cell values as displayed (including formula results) are captured in the PDF. Formula syntax is not shown — only the computed values."],
  ["Do charts and pivot tables render?", "Yes. Charts, pivot tables, sparklines, and conditional formatting icons are rendered as static graphics in the PDF."],
  ["What if my sheet is wider than one page?", "Select 'fit to page width' to scale columns to fit. Alternatively, choose landscape orientation or allow multiple horizontal pages."],
]);

add("ppt-to-pdf", [
  ["1. Upload PowerPoint File", "Select a .pptx or .ppt presentation. The converter preserves slide layout, text formatting, images, and shapes."],
  ["2. Set PDF Options", "Choose to include one slide per page or multiple slides per page (handout layout). Select slide range if you only need specific slides."],
  ["3. Download PDF", "Your PowerPoint is converted to PDF. Animations and transitions are removed — each slide appears in its final state."],
], [
  ["Are speaker notes included?", "Optionally. Toggle 'include speaker notes' to append notes pages after each slide, or 'notes only' for a text-only notes document."],
  ["Do embedded videos and audio play in the PDF?", "No. Multimedia elements are not playable in the PDF. Placeholder icons indicate where media was in the original presentation."],
  ["Are SmartArt graphics preserved?", "Yes. SmartArt diagrams are converted to static vector graphics in the PDF, preserving their visual appearance."],
]);

add("pdf-to-word", [
  ["1. Upload PDF File", "Select a PDF document to convert to Word format. The tool extracts text, images, and basic formatting."],
  ["2. Choose Output Format", "Select .docx (editable Word document) or .doc (legacy format). DOCX is recommended for the best formatting preservation."],
  ["3. Download Editable File", "Your PDF is converted to a Word document. Text is editable, images are extractable, and basic structure is preserved."],
], [
  ["How accurate is the conversion?", "Text-heavy PDFs with simple layouts convert accurately (90%+). Complex layouts with multiple columns, tables, or text boxes may need manual adjustments."],
  ["Are scanned PDFs supported?", "For scanned PDFs (images of text), use the PDF OCR tool first to recognize text, then convert to Word."],
  ["Is the conversion free with no limits?", "Yes. All processing happens locally in your browser. No file uploads, no server costs, no page limits."],
]);

add("pdf-to-docx", [
  ["1. Select PDF for Conversion", "Upload the PDF file you want to convert to DOCX format. Works best with text-based PDFs created from digital sources."],
  ["2. Configure Output", "Choose whether to preserve headers/footers, footnotes, and table of contents during conversion."],
  ["3. Download DOCX", "Your DOCX file is ready. Open it in Microsoft Word, Google Docs, or LibreOffice for editing."],
], [
  ["What is the difference between DOCX and DOC?", "DOCX is the modern XML-based Word format (Office 2007+). DOC is the legacy binary format. DOCX produces smaller files with better formatting preservation."],
  ["Are PDF bookmarks preserved?", "Yes. PDF bookmarks (table of contents entries) are converted to Word heading styles and a table of contents."],
  ["Does this handle PDF forms?", "Form field values are preserved as static text. Fillable form fields are converted to plain text in the Word output."],
]);

add("pdf-to-excel", [
  ["1. Upload PDF with Tables", "Select a PDF containing tabular data. The tool identifies tables using horizontal and vertical line detection."],
  ["2. Review Detected Tables", "Preview extracted tables. Adjust detection sensitivity if the tool misses or merges table boundaries incorrectly."],
  ["3. Export as Excel", "Download the .xlsx file with each table on a separate worksheet, or all tables combined into one sheet."],
], [
  ["What types of tables work best?", "Tables with clear borders, consistent column alignment, and simple headers convert best. Borderless tables or merged cells may need manual correction."],
  ["Can I extract specific tables only?", "Yes. Select individual tables from the preview to export only what you need, rather than all detected tables."],
  ["Are number formats preserved?", "The tool attempts to detect number, date, and currency formatting. Complex custom formats may not transfer exactly."],
]);

add("pdf-to-jpg", [
  ["1. Upload PDF Document", "Select a PDF file. Each page is rendered as a separate JPG image at your chosen quality level."],
  ["2. Set Image Quality", "Choose JPG quality: 70% (small file, acceptable for previews), 90% (good quality for most uses), or 100% (maximum quality, large file)."],
  ["3. Download Images", "Download individual JPG files or a ZIP archive containing all pages as separate images."],
], [
  ["What resolution are the JPG images?", "Output resolution matches the PDF's native resolution, typically 72-150 DPI for screen PDFs, 300 DPI for print PDFs. Adjustable in settings."],
  ["Can I convert specific page ranges?", "Yes. Enter a page range (e.g., 1-5, 8) to convert only selected pages instead of the entire document."],
  ["Do text layers remain?", "No. JPG is a raster image format — all text, images, and vector graphics are flattened into a single image layer."],
]);

add("pdf-to-png", [
  ["1. Upload PDF", "Select a PDF file. PNG preserves transparency and sharp edges better than JPG for text-heavy pages."],
  ["2. Set Resolution", "Choose output DPI (72-600). 150 DPI is recommended for screen viewing. 300 DPI for print-ready images."],
  ["3. Download PNGs", "Download individual PNG files. Each PDF page becomes a separate high-quality PNG image."],
], [
  ["Why use PNG over JPG for PDF conversion?", "PNG supports lossless compression and transparency. Text and line art appear sharper in PNG than JPG at the same resolution."],
  ["What is the file size compared to JPG?", "PNG files are typically 2-5x larger than equivalent JPGs for photo-heavy pages. For text-only pages, the difference is smaller."],
  ["Can I convert to monochrome PNG?", "Yes. Select 'grayscale' or 'black and white' mode to reduce file size. Black and white PNGs are significantly smaller than color."],
]);

add("pdf-to-ppt", [
  ["1. Upload PDF File", "Select a PDF document to convert to PowerPoint. Each PDF page becomes a separate slide."],
  ["2. Choose Layout", "Select standard slide size (4:3 or 16:9) and whether to preserve the original aspect ratio of PDF pages."],
  ["3. Download PPTX", "Your PDF is converted to an editable PowerPoint file. Text and images are placed on individual slides."],
], [
  ["Are PDF text boxes editable in PowerPoint?", "Yes. Text extracted from the PDF is placed in editable text boxes on each slide. Formatting may need minor adjustments."],
  ["Do vector graphics remain vectors?", "PDF vector graphics (logos, diagrams) are typically rasterized to PNG during conversion for compatibility."],
  ["Can I convert a multi-page PDF to multiple slides?", "Yes. Each PDF page becomes one PowerPoint slide in order. Slide count matches the PDF page count."],
]);

add("pdf-to-epub", [
  ["1. Upload PDF for E-Book Conversion", "Select a PDF document. Best results come from text-rich PDFs with reflowable content (not scanned pages)."],
  ["2. Set E-Book Metadata", "Enter title, author, and cover image. Choose the output format: EPUB (standard e-book) or EPUB3 (with enhanced layout support)."],
  ["3. Download EPUB", "Your PDF is converted to an e-book readable on Kindle, Kobo, Apple Books, Google Play Books, and most e-readers."],
], [
  ["Why convert PDF to EPUB?", "PDFs have fixed layouts that do not reflow on small screens. EPUB text adjusts to any screen size for comfortable mobile reading."],
  ["Are images preserved?", "Yes. Images embedded in the PDF are extracted and included in the EPUB. Image quality is preserved at original resolution."],
  ["Does this support PDF tables of contents?", "Yes. PDF bookmarks and internal links are converted to EPUB navigation for chapter-based reading."],
]);

add("pdf-to-txt", [
  ["1. Upload PDF File", "Select any PDF document. The tool extracts all text content in reading order."],
  ["2. Choose Extraction Mode", "Select 'preserve layout' to maintain column and line positions, or 'raw text' for continuous paragraph text without positioning."],
  ["3. Download Text File", "Download the extracted text as .txt or copy it directly to your clipboard. No formatting remains — plain text only."],
], [
  ["What about scanned PDFs?", "This tool extracts text from digital PDFs only. For scanned documents, use the PDF OCR tool first to recognize text."],
  ["Are page numbers included?", "Optional. Toggle 'include page markers' to add [Page 1], [Page 2] labels at each page boundary in the output text."],
  ["Is this lossy?", "Yes — all formatting (bold, italic, fonts, colors, images) is lost. Only the raw text content is extracted."],
]);

add("pdf-to-pdfa", [
  ["1. Upload PDF File", "Select a standard PDF to convert to PDF/A format. PDF/A is an ISO-standardized version for long-term archiving."],
  ["2. Choose Compliance Level", "Select PDF/A-1b (basic, 2005), PDF/A-2b (supports layers and transparency, 2008), or PDF/A-3b (can embed non-PDF files, 2012)."],
  ["3. Generate Archival PDF", "Your PDF is converted to PDF/A with all fonts embedded, metadata normalized, and features restricted for archival compliance."],
], [
  ["What does PDF/A restrict?", "PDF/A prohibits dynamic content (JavaScript, audio, video), requires embedded fonts, bans encryption, and mandates device-independent colors."],
  ["Why not just keep the original PDF?", "Standard PDFs may reference external fonts, contain JavaScript, or use features that degrade over time. PDF/A ensures the document renders identically forever."],
  ["Does PDF/A increase file size?", "Yes. Embedding all fonts and converting images to device-independent color spaces typically increases file size by 10-30%."],
]);

add("pdf-to-markdown", [
  ["1. Upload Your PDF", "Select a PDF that contains text content. The tool attempts to extract and structure content as Markdown."],
  ["2. Configure Output", "Choose heading level mapping (PDF heading styles to Markdown H1-H6), list detection, and code block preservation."],
  ["3. Download Markdown", "Get a .md file with your PDF content converted to Markdown syntax. Ideal for documentation, note-taking, or CMS import."],
], [
  ["How are tables handled?", "Tables are extracted as Markdown pipe tables. Complex merged cells or nested tables may not convert perfectly."],
  ["Are footnotes preserved?", "Yes. PDF footnotes are converted to Markdown footnote syntax [^1] at the bottom of the document."],
  ["Can I convert only specific pages?", "Yes. Enter a page range to limit the conversion scope, useful for large documents with irrelevant sections."],
]);

add("markdown-to-pdf", [
  ["1. Enter or Upload Markdown", "Paste Markdown text or upload a .md file. Supports standard Markdown syntax including tables, code blocks, and task lists."],
  ["2. Style Your PDF", "Choose from built-in themes (clean, modern, classic, dark). Set font family, size, page margins, and line spacing."],
  ["3. Generate PDF", "Your Markdown is rendered and exported as a styled PDF. Download or print directly from the browser."],
], [
  ["Can I add a custom CSS stylesheet?", "Yes. Upload a custom CSS file or paste CSS rules to control every aspect of the PDF appearance beyond the built-in themes."],
  ["Are emoji and Unicode supported?", "Yes. Standard emoji and Unicode characters render in the PDF. Font selection may affect how special characters appear."],
  ["Does this support math formulas?", "LaTeX math expressions in $$ delimiters are rendered using KaTeX for professional mathematical typesetting."],
]);

add("url-to-pdf", [
  ["1. Enter Website URL", "Paste the full URL of the web page to convert. The tool renders the page as it appears in a browser."],
  ["2. Adjust Page Settings", "Select page size (A4, Letter), orientation, margins, and whether to include background graphics and images."],
  ["3. Capture & Download", "The web page is rendered and converted to PDF. Dynamic content (scroll, click) is captured as initially loaded."],
], [
  ["Does this capture JavaScript-rendered content?", "Yes. The tool uses a headless browser to render JavaScript before capturing. Some highly dynamic apps may not fully render."],
  ["How are multi-page websites handled?", "The tool captures only the entered URL. It does not follow links or crawl subpages. For the full site, save each page individually."],
  ["Can I set a custom viewport size?", "Yes. Set viewport width and height to control how the page renders. Useful for capturing mobile-specific layouts."],
]);

add("eml-to-pdf", [
  ["1. Upload EML File", "Select an .eml email file exported from Outlook, Thunderbird, Apple Mail, or any email client."],
  ["2. Choose PDF Layout", "Select whether to include email headers (From, To, Date, Subject), attachments as separate pages, and inline images."],
  ["3. Download as PDF", "Your email is converted to a PDF document with all content preserved. Attachments are appended as additional pages."],
], [
  ["Are EML attachments included?", "Yes. Attachments are extracted and appended to the PDF. Common document and image formats are rendered inline."],
  ["Does this preserve email formatting?", "Email HTML formatting is preserved including fonts, colors, tables, and embedded images. Plain text emails use a clean monospace layout."],
  ["Can I batch convert multiple EML files?", "Yes. Select multiple .eml files. Each is converted independently and combined into a single PDF or separate files."],
]);

add("html-to-pdf", [
  ["1. Enter HTML Code", "Paste HTML content or upload an .html file. The tool renders the HTML as it would appear in a web browser."],
  ["2. Style & Format", "Choose paper size, orientation, margins, and whether to include page numbers and headers/footers."],
  ["3. Export PDF", "Your HTML is rendered as a clean PDF. CSS styles are applied, and the output matches the browser preview."],
],
[
  ["Are external CSS and JS loaded?", "External resources linked in the HTML are loaded. For offline HTML files without network access, inline all resources first."],
  ["Do print-specific CSS rules apply?", "Yes. CSS @media print rules are respected. The tool applies print stylesheets for optimal PDF output."],
  ["Can I add custom headers and footers?", "Yes. Set custom header and footer HTML with dynamic fields like page number, title, and date."],
]);

add("tiff-to-pdf", [
  ["1. Upload TIFF Files", "Select one or more multi-page TIFF files. TIFF is common in scanning and fax workflows."],
  ["2. Set Page Options", "Choose page size, orientation, and compression (JPEG for photos, LZW for line art) for the PDF output."],
  ["3. Convert to PDF", "Each TIFF page becomes a PDF page. Multi-page TIFFs are preserved with all pages in order."],
], [
  ["Does this handle multi-page TIFF?", "Yes. Multi-page TIFF files are converted in full — each TIFF page becomes a PDF page without losing any content."],
  ["What TIFF compression types are supported?", "Uncompressed, LZW, PackBits, CCITT Group 3/4 (fax), JPEG, and Deflate compressed TIFFs are all supported."],
  ["Can I combine multiple TIFFs into one PDF?", "Yes. Select multiple TIFF files — they merge into a single PDF in the order they are added."],
]);

add("scan-to-pdf", [
  ["1. Connect Your Scanner", "Select your scanner from the list of detected devices. TWAIN and WIA drivers are supported on desktop browsers."],
  ["2. Set Scan Parameters", "Choose resolution (150-600 DPI), color mode (color, grayscale, black & white), and document size."],
  ["3. Scan & Save as PDF", "Start scanning. The scanned pages are assembled into a PDF document and ready for download."],
], [
  ["Can I scan multiple pages into one PDF?", "Yes. Use the 'batch scan' mode to scan multiple pages sequentially. Each page is appended to the same PDF."],
  ["What resolution should I use for documents?", "300 DPI is standard for text documents. 150 DPI for drafts (smaller files). 600 DPI for detailed graphics or small text."],
  ["Does this work with network scanners?", "The tool uses WebUSB and WebHID APIs. USB-connected scanners work best. Network scanners may require vendor-specific software."],
]);

// ---- PDF UTILITIES ----
add("pdf-merger", [
  ["1. Upload PDF Files", "Select two or more PDF files to merge. Drag and drop to reorder them in the list."],
  ["2. Set Merge Options", "Choose to merge all files into one PDF (append mode) or interleave pages from multiple files."],
  ["3. Download Merged PDF", "Your combined PDF is ready. All original content including bookmarks, links, and form fields are preserved."],
], [
  ["Can I merge files with different page sizes?", "Yes. Each page retains its original size in the merged PDF. The output is a mixed-format document."],
  ["Are PDF bookmarks merged?", "Yes. Bookmarks from each file are combined into a single bookmark tree with nested sections per source file."],
  ["Is there a file limit?", "Processing is local. The limit depends on your browser's available memory — typically files up to 500MB total."],
]);

add("pdf-splitter", [
  ["1. Upload PDF File", "Select a multi-page PDF to split into separate files."],
  ["2. Choose Split Method", "Split by: every N pages, all pages individually, specific page ranges (1-3, 5, 8-10), or split at each bookmark."],
  ["3. Download Split Files", "Download individual PDF files or a ZIP archive containing all split documents."],
], [
  ["Does splitting affect document content?", "No. Each split PDF contains the original pages exactly as they appeared — no content is modified during splitting."],
  ["Can I split by bookmark levels?", "Yes. Choose 'split by bookmark' and the PDF is divided at each first-level bookmark boundary."],
  ["What happens to PDF forms?", "Form field data is preserved in each split document. AcroForm fields remain functional in the resulting PDF files."],
]);

add("pdf-page-delete", [
  ["1. Upload PDF", "Select the PDF document to delete pages from."],
  ["2. Select Pages to Remove", "View thumbnail previews of all pages. Click to mark pages for deletion. Use the page range input (1-3, 5, 8-10) for bulk selection."],
  ["3. Export Cleaned PDF", "Download the PDF with selected pages removed. Remaining pages are renumbered sequentially."],
], [
  ["Can I undo page deletion?", "The operation is applied immediately to the preview. You can reset and start over before downloading."],
  ["Are deleted pages recoverable after download?", "No. Once you download the modified PDF without the deleted pages, those pages are permanently removed from that copy."],
  ["Does page deletion affect internal links?", "Yes. Internal cross-references to deleted pages are removed. Links to remaining pages are updated to reflect new page numbers."],
]);

add("rotate-pdf", [
  ["1. Upload PDF", "Select a PDF document. The tool shows thumbnail previews of all pages for rotation."],
  ["2. Rotate Pages", "Click individual pages to rotate them 90 clockwise. Use 'rotate all' for uniform rotation. Each click adds 90 of rotation."],
  ["3. Save Rotated PDF", "Download the PDF with pages rotated to your desired orientation."],
], [
  ["What rotation angles are available?", "90, 180, and 270 degrees. Each click rotates by 90 . Rotate a page twice for 180  (upside down)."],
  ["Does rotating affect text selectability?", "No. Text in rotated pages remains selectable and searchable. Only the visual orientation changes."],
  ["Can I rotate only odd or even pages?", "Yes. Use 'rotate odd pages' or 'rotate even pages' for duplex scanning corrections."],
]);

add("extract-pages-from-pdf", [
  ["1. Upload PDF", "Select the source PDF document to extract pages from."],
  ["2. Select Page Range", "Enter the page range to extract (e.g., 1-3, 5, 8-10). Preview thumbnails show which pages are selected."],
  ["3. Extract & Download", "The selected pages are extracted as a new PDF document. All content, formatting, and links are preserved."],
], [
  ["Does extraction preserve the original file?", "Yes. The original PDF is not modified. A new PDF is created containing only the extracted pages."],
  ["Can I extract non-consecutive pages?", "Yes. Use comma-separated ranges: 1-3, 5, 8-10 extracts pages 1,2,3,5,8,9,10 in that order."],
  ["Are form fields preserved in extracted pages?", "Yes. Form fields and their values are copied to the new PDF. Fields reference the new page numbering."],
]);

add("extract-images-from-pdf", [
  ["1. Upload PDF", "Select a PDF containing embedded images. The tool scans each page for raster images."],
  ["2. Choose Images", "Preview all detected images with thumbnails. Select individual images or 'select all' to extract everything."],
  ["3. Download Images", "Download selected images as a ZIP archive. Each image retains its original format (JPEG, PNG, TIFF) where possible."],
], [
  ["What image formats are embedded in PDFs?", "PDFs typically contain JPEG (photos), PNG/JPX (high-quality images), and CCITT (fax/black & white scans). The tool preserves original formats."],
  ["Are vector graphics extractable?", "The tool extracts raster images only. Vector graphics (logos, diagrams) are rendered as PNG if enabled in settings."],
  ["What is the maximum image resolution?", "Images are extracted at their original resolution as embedded in the PDF. No upscaling or downscaling is applied."],
]);

add("compress-pdf", [
  ["1. Upload PDF", "Select a PDF file to reduce its file size. Compression works best on PDFs with embedded images."],
  ["2. Choose Compression Level", "Select: Maximum (smallest file, lower image quality), Balanced (good size reduction, acceptable quality), or Minimal (high quality, modest size reduction)."],
  ["3. Download Compressed PDF", "Your compressed PDF is ready. Compare the before and after file sizes displayed on screen."],
], [
  ["What does PDF compression actually do?", "It recompresses images to JPEG/JPEG2000 at lower quality, removes duplicate fonts, optimizes object streams, and compresses uncompressed data."],
  ["How much size reduction can I expect?", "Image-heavy PDFs: 50-80% reduction. Text-only PDFs: 10-30% reduction. Already-optimized PDFs: minimal gain."],
  ["Does compression affect text quality?", "No. Text and vector graphics are preserved at full quality. Only raster images are recompressed."],
]);

add("protect-pdf", [
  ["1. Upload PDF", "Select a PDF document to password-protect or restrict."],
  ["2. Set Passwords", "Set a user password (required to open the file) and/or a permissions password (required to modify permissions)."],
  ["3. Choose Restrictions", "Restrict printing (low-res or full), copying text, modifying content, adding comments, and filling forms."],
  ["4. Download Protected PDF", "Your PDF is encrypted and protected. Share the password separately from the document."],
], [
  ["What encryption standard is used?", "AES-128 bit encryption (PDF 2.0 compliant). This is the current industry standard for PDF document security."],
  ["Can I remove password protection later?", "Yes. Use the Unlock PDF tool with the correct permissions password to remove restrictions."],
  ["Is PDF password protection truly secure?", "AES-128 encryption is cryptographically strong. However, the user password cannot be recovered if lost, so keep backup copies."],
]);

add("unlock-pdf", [
  ["1. Upload Protected PDF", "Select a password-protected or restricted PDF file."],
  ["2. Enter Password", "Enter the permissions password to unlock the PDF. If you only have the user password, you can open but may not remove restrictions."],
  ["3. Download Unlocked PDF", "Your PDF is decrypted with all restrictions removed. The output PDF is free to print, edit, and copy."],
], [
  ["What if I forgot the password?", "PDF passwords cannot be recovered or cracked by this tool. You need the original password set during protection."],
  ["Does unlocking remove the password permanently?", "Yes. The downloaded PDF has no encryption or restrictions. It behaves like any unprotected PDF."],
  ["Can I unlock PDFs restricted by DRM?", "No. Adobe DRM, Enterprise Rights Management, and similar systems require their respective authorization tools."],
]);

add("watermark-pdf", [
  ["1. Upload PDF", "Select the PDF document to add watermarks to."],
  ["2. Configure Watermark", "Choose text watermark (enter text, font, size, color, opacity) or image watermark (upload PNG/JPG). Set position, rotation, and page range."],
  ["3. Apply & Download", "The watermark is applied to selected pages. Download the watermarked PDF."],
], [
  ["Can I add watermarks to specific pages only?", "Yes. Enter a page range (e.g., 1-3, 5) or select 'first page only' for cover-page watermarks."],
  ["What opacity should I use?", "10-30% for visible-yet-subtle watermarks (DRAFT, CONFIDENTIAL). 50%+ for bold markings (COPY). Below 10% for background watermarks."],
  ["Can I use an image as watermark?", "Yes. Upload a PNG or JPG with transparency. The image is repeated or centered across each page as configured."],
]);

add("redact-pdf", [
  ["1. Upload PDF", "Select a PDF containing sensitive information to permanently remove."],
  ["2. Select Content to Redact", "Use the tool to draw redaction rectangles over text, images, or entire page sections. Search for specific text to auto-redact all occurrences."],
  ["3. Apply Redactions", "Permanently remove the selected content. Redacted areas appear as black boxes. The underlying text is irrecoverably deleted."],
], [
  ["Is redaction reversible?", "No. Proper redaction removes the underlying content permanently. The text cannot be recovered from the redacted PDF."],
  ["Does redaction remove hidden metadata?", "Yes. The tool also strips hidden metadata, comments, and tracked changes that might expose redacted information."],
  ["Can I search and redact specific words?", "Yes. Enter a search term to find all occurrences. Bulk-select results for batch redaction across the entire document."],
]);

add("sign-pdf", [
  ["1. Upload PDF", "Select the PDF document you need to sign."],
  ["2. Create or Upload Signature", "Draw your signature with mouse/touch, type a typed signature, or upload an image of your signature."],
  ["3. Place Signature", "Click where you want the signature to appear on the document. Adjust size and position. Download the signed PDF."],
], [
  ["Is this legally binding?", "A drawn or typed signature on a PDF is not a digital certificate. For legally binding signatures, use a qualified digital signature service."],
  ["Can I add multiple signatures?", "Yes. Add signatures for multiple parties on different pages or the same page."],
  ["Can I add an initial block too?", "Yes. Use the 'initials' option to add smaller initial marks in addition to the full signature."],
]);

add("pdf-form-filler", [
  ["1. Upload PDF Form", "Select a fillable PDF form (AcroForm or XFA format). The tool detects all form fields automatically."],
  ["2. Fill Out Fields", "Click on each form field to enter text, select checkboxes, choose radio buttons, or pick dropdown options."],
  ["3. Download Filled Form", "Save the completed PDF form with all entered data flattened or editable. Choose whether to allow further editing."],
], [
  ["What types of form fields are supported?", "Text fields, checkboxes, radio buttons, dropdown lists, list boxes, buttons, and signature fields are all supported."],
  ["Can I save progress and continue later?", "Yes. Your filled data persists in the browser session. Do not clear browser cache until you download the completed form."],
  ["What is field flattening?", "Flattening converts fillable form fields into static text. This prevents further editing and is commonly required for submitted forms."],
]);

add("pdf-ocr", [
  ["1. Upload Scanned PDF", "Select a scanned PDF or image-based PDF. OCR (Optical Character Recognition) converts images of text into searchable content."],
  ["2. Select Language", "Choose the document language for accurate character recognition. Supports 30+ languages including English, Spanish, French, German, Chinese, and Arabic."],
  ["3. Process & Download", "The OCR engine analyzes each page and creates a searchable PDF with a hidden text layer over the original image."],
], [
  ["How accurate is the OCR?", "Clean scans at 300 DPI with clear fonts achieve 98%+ accuracy. Handwriting, decorative fonts, or low-resolution scans (below 200 DPI) significantly reduce accuracy."],
  ["Does the original image quality change?", "No. The original scanned image is preserved. The recognized text is added as an invisible layer underneath for search and selection."],
  ["Can I export the recognized text separately?", "Yes. Download the extracted text as a .txt file or the original PDF with the searchable text layer added."],
]);

add("translate-pdf", [
  ["1. Upload PDF", "Select a PDF document to translate. The tool extracts text, translates it, and rebuilds the document with translated content."],
  ["2. Choose Languages", "Select source language (auto-detect or manual) and target language. Supports 50+ language pairs."],
  ["3. Download Translated PDF", "Your PDF is translated with the layout preserved as closely as possible. Text is replaced in-place within the original design."],
], [
  ["How is the translation quality?", "Machine translation quality depends on language pair and content complexity. Simple content translates well; technical or literary content may need human review."],
  ["Is the original layout preserved?", "The tool attempts to match text position, font size, and formatting. Longer translated text may overflow text boxes and need adjustment."],
  ["Are images and graphics preserved?", "Yes. Images, charts, and graphics remain unchanged. Only text content is extracted and translated."],
]);

add("compare-pdf-files", [
  ["1. Upload Two PDFs", "Select the original and modified PDF versions to compare. The tool analyzes both documents page by page."],
  ["2. Choose Comparison Mode", "Select 'visual' (image-based pixel diff) or 'textual' (text content difference). Visual mode detects layout changes; textual focuses on word changes."],
  ["3. Review Differences", "View highlighted differences: added content in green, removed in red, modified in yellow. Download a difference report as PDF."],
], [
  ["What types of changes are detected?", "Text additions, deletions, modifications, image changes, formatting differences, and page reordering are all detected and highlighted."],
  ["Can I compare specific pages only?", "Yes. Enter a page range to limit comparison. Useful when comparing large documents where changes are in known sections."],
  ["Is this suitable for legal document review?", "Yes. The visual diff report provides clear, color-coded change tracking suitable for legal document comparison and contract review."],
]);

add("pdf-metadata-editor", [
  ["1. Upload PDF", "Select a PDF file to view and edit its metadata."],
  ["2. Edit Metadata Fields", "Modify title, author, subject, keywords, and producer fields. Custom XMP metadata can also be added."],
  ["3. Save Updated PDF", "Download the PDF with the corrected metadata. The document content remains unchanged."],
], [
  ["What metadata fields does a PDF contain?", "Core fields: Title, Author, Subject, Keywords (PDF info dictionary). Extended fields in XMP: creation date, modification date, producer, creator tool."],
  ["Can I remove all metadata?", "Yes. Use the 'clear metadata' option to strip all identifying information from the PDF before distribution."],
  ["Does editing metadata change the document hash?", "Yes. Modifying metadata alters the PDF binary, so any cryptographic hash of the file changes."],
]);

add("pdf-timestamp", [
  ["1. Upload PDF", "Select a PDF document to add a trusted timestamp to."],
  ["2. Apply Timestamp", "The tool connects to a RFC 3161 Time Stamp Authority to generate a cryptographic proof-of-existence for the document."],
  ["3. Download Stamped PDF", "Your PDF now contains a timestamp token that proves the document existed at a specific point in time."],
], [
  ["What is an RFC 3161 timestamp?", "A cryptographic token issued by a Time Stamp Authority that proves a document existed before or at a specific time. It is verifiable by anyone."],
  ["Is a timestamp legally valid?", "eIDAS Regulation defines qualified timestamps as legally equivalent to handwritten dates in the EU. Validity varies by jurisdiction."],
  ["Does the timestamp expire?", "No. The timestamp remains cryptographically verifiable indefinitely. However, the TSA certificate chain must remain valid."],
]);

add("pdf-info", [
  ["1. Upload PDF", "Select a PDF file to inspect its properties and technical details."],
  ["2. View Document Info", "See page count, file size, PDF version, encryption status, fonts used, images count, metadata, and more."],
  ["3. Export Report", "Download the PDF information as a text report or copy individual details to clipboard."],
], [
  ["What technical details are shown?", "PDF version, page dimensions, font list (embedded or not), image resolutions, color spaces, layer information, and interactive elements."],
  ["Can I check if a PDF is PDF/A compliant?", "Yes. The tool validates the PDF against PDF/A-1, PDF/A-2, and PDF/A-3 requirements and reports compliance status."],
  ["Does this detect malicious PDFs?", "The tool reports JavaScript usage, external references, and embedded files — indicators used in PDF-based attacks — but does not scan for malware."],
]);

add("flatten-pdf", [
  ["1. Upload PDF", "Select a PDF with form fields, annotations, or layers to flatten."],
  ["2. Choose Flatten Options", "Select what to flatten: form fields (convert to text), annotations (merge into page), or layers (merge all visible layers)."],
  ["3. Download Flattened PDF", "Your PDF has all interactive elements merged into the page content. The file remains visually identical but is no longer editable."],
], [
  ["Why flatten a PDF?", "Flattening prevents further editing, ensures consistent rendering across PDF viewers, and is often required for document submission or archival."],
  ["Is flattening reversible?", "No. Once flattened, form fields cannot be edited, annotations cannot be moved, and layers cannot be toggled."],
  ["Does flattening reduce file size?", "Sometimes. Flattening removes editable form field structures while retaining their visual appearance. Annotations become part of the page content."],
]);

add("grayscale-pdf", [
  ["1. Upload PDF", "Select a color PDF document to convert to grayscale."],
  ["2. Choose Conversion Method", "Choose 'luminosity' (perceptual brightness) for natural-looking grayscale, 'average' for flat conversion, or 'print' for CMYK simulation."],
  ["3. Download Grayscale PDF", "All colors are converted to shades of gray while preserving text readability and image detail."],
], [
  ["Why convert to grayscale?", "Grayscale PDFs are 30-50% smaller than color versions. Printing in grayscale saves color ink or toner charges."],
  ["Does this affect text searchability?", "No. Text content and OCR layers are preserved. Only the visual color information is removed."],
  ["Can I convert specific pages to grayscale?", "Yes. Enter a page range to apply grayscale conversion only to selected pages, leaving others in color."],
]);

add("crop-pdf", [
  ["1. Upload PDF", "Select a PDF with pages to crop. The tool shows page previews with a draggable crop rectangle."],
  ["2. Set Crop Margins", "Drag crop handles or enter precise margin values (top, bottom, left, right) in inches, mm, or points."],
  ["3. Apply & Download", "All pages (or selected page range) are cropped to the specified boundaries. Content outside the crop area is hidden."],
], [
  ["Does cropping permanently remove content?", "Yes. Content outside the crop box is hidden. Some PDF viewers may allow revealing cropped content unless the PDF is optimized."],
  ["Can I crop different pages differently?", "No. The crop applies uniformly to the selected page range. For individual page crops, process each page separately."],
  ["What are standard crop presets?", "Trim whitespace (auto-detect), presentation crop (16:9), document crop (remove margins), and custom size."],
]);

add("resize-pdf-pages", [
  ["1. Upload PDF", "Select a PDF to resize its pages. All pages are scaled to the same output dimensions."],
  ["2. Set New Page Size", "Choose a standard size (A4, Letter, A3, Legal, Tabloid) or enter custom width and height. Choose scaling mode: fit, fill, or stretch."],
  ["3. Download Resized PDF", "All pages are uniformly scaled to the new size. Content is scaled proportionally by default."],
], [
  ["Does resizing affect content layout?", "Yes. Content is scaled proportionally. A letter-sized page resized to A4 will have slight aspect ratio adjustment."],
  ["Can I upscale a PDF to a larger size?", "Yes, but text and images may appear pixelated if upscaled significantly (e.g., A5 to A3). Vector content scales cleanly."],
  ["What is the difference between fit, fill, and stretch?", "Fit: content fits entirely within new page. Fill: content fills the entire page (may crop). Stretch: content deforms to match new dimensions exactly."],
]);

add("add-image-to-pdf", [
  ["1. Upload PDF", "Select the PDF document to add images to."],
  ["2. Upload Image", "Choose an image file (PNG, JPG, WebP) to insert. The image is placed as an overlay on the page."],
  ["3. Position & Download", "Click to set the image position on the page. Adjust size and rotation. Download the PDF with the embedded image."],
], [
  ["Can I add images to specific pages only?", "Yes. Select the target page number. The image is added only to that page while others remain unchanged."],
  ["What image formats are supported?", "PNG (with transparency), JPG/JPEG, WebP, GIF, and BMP. PNG is recommended for logos and graphics with transparent backgrounds."],
  ["Can I add multiple images to different pages?", "Yes. Upload an image, place it on a page, then repeat for additional images on different pages."],
]);

add("add-text-to-pdf", [
  ["1. Upload PDF", "Select the PDF document to add text annotations to."],
  ["2. Enter Text", "Type your text content. Choose font, size, color, and bold/italic formatting."],
  ["3. Position & Download", "Click on the page to place the text. Drag to reposition if needed. Download the PDF with added text."],
], [
  ["Can I add text with Unicode characters?", "Yes. Unicode text including accented characters, CJK characters, and emoji are supported. Font availability affects special character rendering."],
  ["Is the added text editable after saving?", "No. Added text is flattened into the page as a printable annotation. For editable text, use a PDF editor."],
  ["Can I add text to multiple pages at once?", "Yes. Select 'apply to all pages' to add the same text (e.g., page numbers, headers) to every page."],
]);

add("add-page-numbers-to-pdf", [
  ["1. Upload PDF", "Select a PDF document to add page numbers to."],
  ["2. Configure Numbering", "Choose position (top/bottom, left/center/right), starting number, format (1, 2, 3 or i, ii, iii), and font size."],
  ["3. Apply Page Numbers", "Page numbers are added to every page in the document. Download the numbered PDF."],
], [
  ["Can I skip the first page?", "Yes. Select 'skip first page' to omit page numbers on cover pages or title pages."],
  ["Can I use Roman numerals for front matter?", "Yes. Choose Roman numeral (i, ii, iii) format for the first section and switch to Arabic (1, 2, 3) from a specified page."],
  ["Does this affect existing headers or footers?", "Page numbers are placed in the page margin area. Existing header/footer content may overlap if positioned similarly."],
]);

add("header-footer-pdf", [
  ["1. Upload PDF", "Select the PDF document to add headers and/or footers to."],
  ["2. Design Header/Footer", "Enter left, center, and right content. Include dynamic fields: [page], [totalpages], [date], [time], and custom text."],
  ["3. Apply & Download", "Headers and footers are added to the selected page range. Download the PDF with consistent headers and footers."],
], [
  ["Can different headers be set for odd/even pages?", "Yes. Enable 'different odd and even pages' to set mirrored headers for book-style layouts."],
  ["What font options are available?", "Choose from system fonts. Set size, color, bold, and italic. Fonts are embedded for consistent rendering."],
  ["Can I add a line separator below headers?", "Yes. Toggle 'header line' to add a horizontal rule separating the header from page content."],
]);

add("bookmark-pdf", [
  ["1. Upload PDF", "Select a PDF document to add or edit bookmarks (table of contents)."],
  ["2. Add Bookmarks", "Create new bookmarks: enter bookmark name, set target page number, and assign a hierarchy level for nested sections."],
  ["3. Save Bookmarked PDF", "Download the PDF with the updated bookmark tree. Bookmarks appear in the PDF viewer's navigation panel."],
], [
  ["Can I import bookmarks from a text file?", "Yes. Upload a tab-indented text file with bookmark names and page numbers for batch bookmark creation."],
  ["Are existing bookmarks preserved?", "Yes. Existing bookmarks remain and new bookmarks are added. You can also choose to replace existing bookmarks entirely."],
  ["How many bookmark levels are supported?", "Up to 12 levels of nested bookmarks (L1: Chapter, L2: Section, L3: Subsection, etc.). Most PDF viewers display 3-5 levels by default."],
]);

add("pdf-table-of-contents", [
  ["1. Upload PDF", "Select a PDF to automatically generate a table of contents from its content structure."],
  ["2. Review Suggestions", "The tool analyzes heading styles and font sizes to detect chapter/section structure. Review and adjust auto-detected TOC entries."],
  ["3. Generate TOC", "A new table of contents page is inserted at the beginning of the PDF with clickable links to each section."],
], [
  ["How are headings detected?", "The tool analyzes font size, weight, and spacing patterns. Large bold fonts at the start of paragraphs are flagged as potential headings."],
  ["Can I manually add missing entries?", "Yes. Click 'add entry' to manually insert TOC items for sections the auto-detection missed."],
  ["Are TOC entries hyperlinked?", "Yes. Each entry contains an internal PDF link that jumps to the corresponding section when clicked."],
]);

add("nup-pdf", [
  ["1. Upload PDF", "Select a PDF to arrange multiple pages per sheet (N-up layout)."],
  ["2. Choose Layout", "Select 2-up, 4-up, 6-up, 8-up, or 16-up layout. Choose reading order: left-to-right or top-to-bottom."],
  ["3. Download N-up PDF", "Your PDF is rearranged with multiple reduced-size pages on each sheet. Ideal for printing drafts or handouts."],
], [
  ["What is N-up layout used for?", "N-up printing saves paper by placing multiple document pages on one physical sheet. Common for lecture handouts (4-up, 6-up) and document review (2-up)."],
  ["Can I add borders between pages?", "Yes. Toggle page borders and set border thickness. Borders help visually separate reduced pages on the sheet."],
  ["Does N-up preserve page order?", "Yes. Pages flow in reading order within each sheet. For 4-up, pages 1-4 on first sheet, 5-8 on second, etc."],
]);

add("pdf-add-blank-page", [
  ["1. Upload PDF", "Select a PDF to insert blank pages into."],
  ["2. Choose Insert Points", "Specify positions to add blank pages: after each page, before specific pages, or at the end of the document."],
  ["3. Download Modified PDF", "The PDF is updated with blank pages inserted at the chosen positions."],
], [
  ["Why add blank pages?", "Common reasons: duplex printing preparation (add blank page after odd-numbered end page), insert separator pages between chapters, or leave room for notes."],
  ["Can I set the blank page size?", "Yes. Choose the same size as the document or a custom size. Matching size is recommended for uniform document appearance."],
  ["Can I add different blank pages to different positions?", "Yes. Use 'insert after pages 1, 5, 10' to add blank pages at multiple specific positions."],
]);

add("pdf-annotator", [
  ["1. Upload PDF", "Select a PDF document to add annotations to."],
  ["2. Choose Annotation Tool", "Select highlight (yellow, green, blue, pink), underline, strikethrough, freehand drawing, rectangle, circle, arrow, or sticky note."],
  ["3. Annotate & Download", "Click and drag on the page to create annotations. Download the PDF with all annotations embedded."],
], [
  ["Are annotations saved in the PDF?", "Yes. Annotations are embedded as PDF comments and appear in any PDF viewer that supports annotations (Adobe Acrobat, Preview, Edge)."],
  ["Can I delete or modify annotations?", "Yes. Click on any annotation to select it for deletion, repositioning, or resizing before downloading."],
  ["Are annotations printable?", "Yes. Annotations are printed by default. Toggle 'print annotations' off to download a PDF with on-screen-only annotations."],
]);

add("pdf-stamp", [
  ["1. Upload PDF", "Select a PDF document to apply stamps to."],
  ["2. Choose Stamp", "Select from built-in stamps (APPROVED, DRAFT, CONFIDENTIAL, RECEIVED, VOID, COPY, SIGNED) or upload a custom stamp image."],
  ["3. Place & Download", "Click on the page to place the stamp. Adjust size, rotation, and opacity. Download the stamped PDF."],
], [
  ["What stamp formats are available?", "Built-in text stamps in multiple styles, date/time stamps, and custom image stamps (PNG with transparency)."],
  ["Can I stamp multiple pages automatically?", "Yes. Select 'apply to all pages' or specify a page range for batch stamping."],
  ["Are stamps different from watermarks?", "Stamps are placed annotations that can include text, dates, and images. Watermarks typically cover the entire page background."],
]);

add("pdf-background-color", [
  ["1. Upload PDF", "Select a PDF to change or add a background color to."],
  ["2. Choose Color", "Pick a solid background color from the palette or enter a hex code (e.g., #FFF8E7 for warm white)."],
  ["3. Apply & Download", "The background color is applied to selected pages. Text and content remain fully visible over the new background."],
], [
  ["Why change PDF background color?", "Reduce eye strain with warm or sepia tones for extended reading. Brand documents may require specific background colors."],
  ["Does this affect text readability?", "No. Text and images render above the background. Choose a light background for dark text or dark background for light text."],
  ["Can I apply different colors to different pages?", "Batch apply is uniform. For multi-color backgrounds, process each page range separately."],
]);

add("pdf-bates-numbering", [
  ["1. Upload PDF", "Select a PDF document to add Bates numbering for legal document identification."],
  ["2. Configure Bates Format", "Set prefix (e.g., DEF-), starting number, suffix, number of digits (0001-9999), and position on the page."],
  ["3. Apply Numbering", "Sequential Bates numbers are stamped on every page. Download the numbered PDF for legal discovery or case management."],
], [
  ["What is Bates numbering used for?", "Bates numbering is the standard in legal discovery for uniquely identifying document pages. Each page gets a unique sequential number."],
  ["Can I add custom text alongside the number?", "Yes. Set prefix and suffix fields. Example: 'DEF-000001-2024' where 'DEF-' is prefix, '000001' is sequential, '-2024' is suffix."],
  ["Does Bates numbering affect existing content?", "Numbers are added in the page margin. Ensure sufficient margin space exists to avoid overlap with content."],
]);

add("pdf-attachments", [
  ["1. Upload PDF", "Select a PDF to manage embedded file attachments."],
  ["2. View Current Attachments", "See all files currently embedded in the PDF. Add new attachments or remove existing ones."],
  ["3. Save PDF with Attachments", "Download the PDF with the updated embedded files. Attachments appear in the PDF viewer's attachment panel."],
], [
  ["What file types can be embedded?", "Any file type: documents (DOCX, XLSX), images, ZIP archives, or other PDFs. The attachment is embedded within the PDF file."],
  ["Can I extract attachments from a PDF?", "Yes. Select an attachment and click 'download' to extract it from the PDF as a separate file."],
  ["Do attachments increase PDF file size?", "Yes, significantly. A 10 MB file attached to a 1 MB PDF results in an 11 MB PDF. Compress files before attaching for smaller output."],
]);

add("pdf-cleanup", [
  ["1. Upload PDF", "Select a PDF to clean up and optimize. The tool finds and removes unnecessary elements."],
  ["2. Choose Cleanup Options", "Select to remove: metadata, annotations, form fields, embedded files, JavaScript actions, alternate images, and orphaned objects."],
  ["3. Download Cleaned PDF", "Your PDF is optimized with unnecessary data removed. File size is reduced while visible content remains unchanged."],
], [
  ["What is removed during cleanup?", "Metadata (author, title, creator), hidden annotations, embedded search indexes, duplicate fonts, alternate image versions, and JavaScript actions."],
  ["Is cleanup safe for document integrity?", "Yes. All visible content, text, images, and page layout are preserved. Only hidden or unnecessary data structures are removed."],
  ["How much size reduction can I expect?", "5-30% reduction for typical PDFs. PDFs with heavy metadata, embedded files, or alternate images may see 40%+ reduction."],
]);

add("bulk-pdf-suite", [
  ["1. Upload Multiple PDFs", "Select several PDF files for batch processing. The suite applies the same operation to all files."],
  ["2. Choose Batch Operation", "Select from: compress, rotate, protect, unlock, split, watermark, crop, resize, or flatten all uploaded files."],
  ["3. Configure & Export", "Set parameters for the chosen operation. Download individual results or a ZIP archive of all processed files."],
], [
  ["What batch operations are supported?", "Compress, rotate, password-protect, unlock, split into pages, add watermark, crop margins, resize pages, and flatten."],
  ["Can I apply different settings per file?", "Batch operations apply uniform settings to all files. For file-specific settings, process each file individually."],
  ["What is the batch file limit?", "Up to 20 files per batch, or files totaling up to 500 MB, depending on browser memory."],
]);

add("pdf-workflow-builder", [
  ["1. Add PDF Files", "Upload one or more PDF source files to the workflow."],
  ["2. Build Processing Steps", "Create a sequence: merge, split, rotate, watermark, compress, protect. Drag steps to reorder the workflow."],
  ["3. Execute Workflow", "Run the entire processing pipeline in sequence. Download the final output or review each step's result."],
], [
  ["What steps can I chain?", "Merge, split, rotate, crop, compress, watermark, protect (password), flatten, grayscale, add headers/footers, and add page numbers."],
  ["Can I save workflows for reuse?", "Yes. Save your workflow as a JSON template and reload it later for processing similar document batches."],
  ["Does the workflow process files sequentially?", "Yes. Each step processes the output of the previous step. Order matters — compress before protect, for example."],
]);

add("deskew-pdf", [
  ["1. Upload PDF", "Select a skewed or crooked scanned PDF document."],
  ["2. Auto-Detect Skew", "The tool analyzes page content and detects rotation angles. Preview the auto-corrected result."],
  ["3. Apply Correction", "The deskew is applied to all pages or selected pages. Download the straightened PDF."],
], [
  ["What causes PDF skew?", "Scanned documents often have slight rotation (1-5 degrees) from imperfect alignment on the scanner bed or ADF."],
  ["Is deskewing always accurate?", "The tool detects skew by analyzing text baselines and page edges. Results are best for text-heavy pages with straight margins."],
  ["Can I manually adjust the angle?", "Yes. If auto-deskew is off by a fraction of a degree, use the manual fine-tune slider to adjust ±5 degrees."],
]);

add("create-pdf", [
  ["1. Choose Content Type", "Select how to create your PDF: from a blank page, from uploaded images, or from pasted text content."],
  ["2. Add Content", "For images: upload and arrange files. For text: type or paste. For blank: set page size and orientation."],
  ["3. Save as PDF", "Your content is assembled into a clean PDF document. Download the result."],
], [
  ["Can I mix images and text in one PDF?", "Yes. Upload images and add text blocks on the same page for simple document creation without external software."],
  ["What page sizes are available?", "A4, A3, Letter, Legal, and custom dimensions. Orientation can be portrait or landscape."],
  ["Can I rearrange pages after adding content?", "Yes. Thumbnail view allows drag-and-drop reordering of pages before final export."],
]);

add("repair-pdf", [
  ["1. Upload Damaged PDF", "Select a PDF that displays errors, fails to open, or has corrupted content."],
  ["2. Analyze Damage", "The tool scans the PDF structure and identifies corruption: missing cross-references, damaged streams, or truncated data."],
  ["3. Repair & Download", "The tool attempts to rebuild the damaged PDF structure. Download the repaired version or recoverable content."],
], [
  ["What types of PDF corruption can be repaired?", "Cross-reference table errors, invalid object streams, truncated files (recovers readable portion), and incorrect file headers."],
  ["Can all damaged PDFs be repaired?", "No. Severely truncated or overwritten files may not be recoverable. Backup copies are always the best recovery option."],
  ["Does repair preserve all content?", "The tool recovers as much as possible. Some formatting, images, or pages may be lost if the corresponding data is corrupted irreparably."],
]);

add("whiteout-pdf", [
  ["1. Upload PDF", "Select a PDF document to white out (cover up) specific content."],
  ["2. Select Areas to Cover", "Click and drag white rectangles over text, signatures, numbers, or any content you want to conceal."],
  ["3. Download Whitened PDF", "The selected areas are covered with white. Unlike redaction, the underlying content is hidden but not permanently removed."],
], [
  ["Is whitening the same as redaction?", "No. Whitening covers content with a white box — the underlying text is still present in the PDF and could be recovered. Redaction permanently deletes content."],
  ["Can I resize whitening blocks?", "Yes. Each white rectangle can be dragged, resized, or deleted before final download."],
  ["What color options are available?", "Multiple colors: white (most common), black, gray, or custom colors to match the document background."],
]);

add("pdf-advanced", [
  ["1. Upload PDF", "Select a PDF for advanced operations. This tool provides a set of power-user features."],
  ["2. Choose Advanced Feature", "Options include: PDF version conversion, color space conversion, Overprint Preview, transparency flattening, and page box editing."],
  ["3. Apply & Export", "Configure the advanced operation parameters and download the processed PDF."],
], [
  ["What is page box editing?", "PDFs have multiple boxes: MediaBox (page size), CropBox (visible area), BleedBox (printing), TrimBox (final size), and ArtBox (content area). You can edit all."],
  ["What color space conversions are available?", "Convert between RGB, CMYK, and Grayscale. CMYK is used for print production; RGB for screen display."],
  ["When should I flatten transparency?", "Transparency flattening is needed for PDFs with overlapping transparent objects that cause printing issues on older RIP systems."],
]);

// ---- INSERTION ENGINE ----
const FILES = [
  'src/registry/tools-chunk-0.ts',
  'src/registry/tools-chunk-1.ts',
  'src/registry/tools-chunk-2.ts',
  'src/registry/tools-chunk-4.ts',
];

let modifiedCount = 0;
let skippedCount = 0;

for (const fpath of FILES) {
  let src = fs.readFileSync(fpath, 'utf8');
  for (const [slug, data] of Object.entries(ALL)) {
    const slugRegex = new RegExp(`slug:\\s*['\"]${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`);
    const m = src.match(slugRegex);
    if (!m) continue;
    const pos = m.index;
    let toolStart = src.lastIndexOf('{', pos);
    let bc = 0, toolEnd = toolStart;
    for (let k = toolStart; k < src.length; k++) {
      if (src[k] === '{') bc++;
      if (src[k] === '}') bc--;
      if (bc === 0 && k > toolStart) { toolEnd = k + 1; break; }
    }
    const ft = src.substring(toolStart, toolEnd);
    if (ft.includes('instructions:')) { skippedCount++; continue; }

    const prefix = src.substring(0, toolEnd - 1).replace(/\s+$/, '');
    const needsComma = !prefix.endsWith(',');
    const pf = prefix + (needsComma ? ',' : '');

    let it = '\n    instructions: [\n';
    for (const [ti, de] of data.instructions) {
      it += `      { title: "${ti.replace(/"/g, "'")}", desc: "${de.replace(/"/g, "'")}" },\n`;
    }
    it += '    ],\n    faqs: [\n';
    for (const [q, a] of data.faqs) {
      it += `      { question: "${q.replace(/"/g, "'")}", answer: "${a.replace(/"/g, "'")}" },\n`;
    }
    it += '    ],\n  ';

    src = pf + it + src.substring(toolEnd - 1);
    modifiedCount++;
  }
  fs.writeFileSync(fpath, src);
}

console.log(`Modified: ${modifiedCount} PDF tools`);
console.log(`Skipped (already had instructions): ${skippedCount} tools`);
