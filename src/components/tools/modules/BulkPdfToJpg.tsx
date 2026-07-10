"use client";
import React from 'react';
import { BulkToolShell } from './BulkToolShell';

export default function BulkPdfToJpg() {
  return (
    <BulkToolShell
      toolSlug="bulk-pdf-to-jpg"
      title="Bulk PDF to JPG"
      description="Convert each page of multiple PDFs to high-res JPG images. Presenters extracting slides from decks for social media or thumbnails."
      accept=".pdf"
      processFile={async (file) => {
        const arrayBuf = await file.arrayBuffer();
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const doc = await pdfjsLib.getDocument({ data: arrayBuf.slice(0) }).promise;
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport }).promise;
          const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.92));
          zip.file(`${file.name.replace(/\.pdf$/i, '')}-page-${i}.jpg`, blob);
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        return { name: file.name.replace(/\.pdf$/i, '-pages.zip'), blob: zipBlob };
      }}
    />
  );
}
