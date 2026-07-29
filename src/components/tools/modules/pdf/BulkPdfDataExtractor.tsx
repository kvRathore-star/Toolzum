"use client";
import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';

export default function BulkPdfDataExtractor() {
  return (
    <BulkToolShell
      toolSlug="bulk-pdf-data-extractor"
      title="Bulk PDF Data Extractor"
      description="Extract text content from multiple PDFs at once. Perfect for document analysis and data mining."
      accept=".pdf"
      processFile={async (file) => {
        const arrayBuf = await file.arrayBuffer();
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const doc = await pdfjsLib.getDocument({ data: arrayBuf.slice(0) }).promise;
        let text = '';
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => { if ('str' in item) return (item as unknown as { str: string }).str; return ''; }).join(' ') + '\n';
        }
        return { name: file.name.replace(/\.pdf$/i, '.txt'), blob: new Blob([text], { type: 'text/plain' }) };
      }}
    />
  );
}
