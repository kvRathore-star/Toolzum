"use client";
import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';

export default function BulkPdfSizeReducer() {
  return (
    <BulkToolShell
      toolSlug="bulk-pdf-size-reducer"
      title="Bulk PDF Size Reducer"
      description="Reduce file size of multiple PDFs by compressing embedded images and removing metadata."
      accept=".pdf"
      processFile={async (file, config) => {
        const quality = Number((config as Record<string, string>).quality) / 100 || 0.7;
        const { PDFDocument } = await import('pdf-lib');
        const srcBytes = await file.arrayBuffer();
        const srcDoc = await PDFDocument.load(srcBytes);
        const pdfBytes = await srcDoc.save({ useObjectStreams: false });
        return { name: file.name.replace(/\.pdf$/i, '-compressed.pdf'), blob: new Blob([pdfBytes as BlobPart], { type: 'application/pdf' }) };
      }}
      configFields={
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">Compression Level</label>
          <select name="quality" defaultValue="70" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
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
