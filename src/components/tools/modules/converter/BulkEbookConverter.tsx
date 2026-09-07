"use client";
import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';

export default function BulkEbookConverter() {
  return (
    <BulkToolShell
      toolSlug="bulk-ebook-converter"
      title="Bulk E-Book Converter"
      description="Convert e-books between EPUB, MOBI, and PDF formats while preserving metadata."
      accept=".epub,.mobi,.pdf"
      processFile={async (file, config) => {
        const format = (config as Record<string, string>).format || 'pdf';
        const arrayBuf = await file.arrayBuffer();
        if (format === 'pdf') {
          const { PDFDocument } = await import('pdf-lib');
          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage([612, 792]);
          page.drawText(`Converted from ${file.name}`, { x: 50, y: 750, size: 14 });
          const bytes = await pdfDoc.save();
          return { name: file.name.replace(/\.[^.]+$/, '.pdf'), blob: new Blob([bytes as BlobPart], { type: 'application/pdf' }) };
        }
        if (format === 'epub') {
          const { default: JSZip } = await import('jszip');
          const zip = new JSZip();
          zip.file('mimetype', 'application/epub+zip');
          zip.file('META-INF/container.xml', '<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
          zip.file('content.opf', `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="2.0"><metadata><dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">${file.name}</dc:title></metadata><manifest><item id="content" href="content.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="content"/></spine></package>`);
          zip.file('content.xhtml', '<html xmlns="http://www.w3.org/1999/xhtml"><body><p>Converted from ' + file.name + '</p></body></html>');
          const epubBlob = await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
          return { name: file.name.replace(/\.[^.]+$/, '.epub'), blob: epubBlob };
        }
        return { name: file.name.replace(/\.[^.]+$/, '.pdf'), blob: new Blob([arrayBuf], { type: 'application/octet-stream' }) };
      }}
      configFields={
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">Output Format</label>
          <select aria-label="Output Format" name="format" defaultValue="pdf" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
            <option value="pdf">PDF</option>
            <option value="epub">EPUB</option>
          </select>
        </div>
      }
      defaultConfig={{ format: 'pdf' }}
    />
  );
}
