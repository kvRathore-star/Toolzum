"use client";
import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';

export default function BulkPdfSizeReducer() {
  return (
    <BulkToolShell
      toolSlug="bulk-pdf-size-reducer"
      title="Bulk PDF Size Reducer"
      description="Shrink PDFs by re-rendering pages as optimized JPEG images at your chosen quality. Best for scanned/image-heavy PDFs; text becomes non-selectable."
      accept=".pdf"
      processFile={async (file, config) => {
        const quality = Number((config as Record<string, string>).quality) || 70;
        // Map quality tier to render scale + JPEG quality. The old code read
        // this setting and ignored it (plain re-save); image re-rendering is
        // what actually moves the needle on size.
        const scale = quality <= 40 ? 1.0 : quality <= 70 ? 1.5 : 2.0;
        const jpegQ = quality <= 40 ? 0.5 : quality <= 70 ? 0.7 : 0.85;
        const pdfjsLib = await import('pdfjs-dist');
        const { PDFDocument } = await import('pdf-lib');
        const srcBytes = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(srcBytes.slice(0)).promise;
        const outDoc = await PDFDocument.create();
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
          const dataUrl = canvas.toDataURL('image/jpeg', jpegQ);
          const jpgBytes = Uint8Array.from(atob(dataUrl.split(',')[1]!), c => c.charCodeAt(0));
          const jpg = await outDoc.embedJpg(jpgBytes);
          const outPage = outDoc.addPage([viewport.width, viewport.height]);
          outPage.drawImage(jpg, { x: 0, y: 0, width: viewport.width, height: viewport.height });
        }
        const pdfBytes = await outDoc.save({ useObjectStreams: true });
        if (pdfBytes.byteLength >= file.size) {
          throw new Error(`Re-render is larger than the original (${(file.size / 1024).toFixed(0)} KB) — try Maximum compression or keep the original`);
        }
        return { name: file.name.replace(/\.pdf$/i, '-compressed.pdf'), blob: new Blob([pdfBytes as BlobPart], { type: 'application/pdf' }) };
      }}
      configFields={
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">Compression Level</label>
          <select aria-label="Compression Level" name="quality" defaultValue="70" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
            <option value="40">Maximum (smallest size)</option>
            <option value="70">Balanced (recommended)</option>
            <option value="90">Light (preserve quality)</option>
          </select>
        </div>
      }
      defaultConfig={{ quality: '70' }}
    />
  );
}
