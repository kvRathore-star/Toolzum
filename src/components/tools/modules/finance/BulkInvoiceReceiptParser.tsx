"use client";
import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';
import { createWorker } from 'tesseract.js';

// Module-level worker: one OCR engine shared across the batch (tesseract.js
// v7 API — the old static Tesseract.recognize() no longer exists).
interface OcrWorker {
  recognize: (_img: Blob | string) => Promise<{ data: { text: string } }>;
  reinitialize: (_lang: string) => Promise<void>;
}
let workerPromise: Promise<OcrWorker | null> | null = null;
function ensureWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      try {
        const worker = await createWorker(undefined, undefined, { logger: () => {} });
        return worker as unknown as OcrWorker;
      } catch {
        return null;
      }
    })();
  }
  return workerPromise;
}

/** Render a PDF's first page to an image blob so receipts saved as PDF get OCR'd too. */
async function pdfFirstPageToImage(file: File): Promise<Blob> {
  const pdfjsLib = await import('pdfjs-dist');
  const pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;
  if (pdf.numPages === 0) throw new Error('PDF has no pages');
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Could not rasterize PDF page');
  return blob;
}

export default function BulkInvoiceReceiptParser() {
  return (
    <BulkToolShell
      toolSlug="bulk-invoice-receipt-parser"
      title="Bulk Invoice & Receipt Parser"
      description="Extract invoice numbers, dates, totals, and vendor names from receipt images using OCR."
      accept="image/*,.pdf"
      heavyEngineNotice="OCR engine is large — first run on a constrained device may take a while…"
      processFile={async (file, config) => {
        const lang = (config as Record<string, string>).lang || 'eng';
        // PDFs are rasterized to an image first — the old code loaded the PDF
        // and silently discarded it, so PDF receipts never parsed.
        const imageInput = file.name.toLowerCase().endsWith('.pdf') ? await pdfFirstPageToImage(file) : file;
        const worker = await ensureWorker();
        if (!worker) throw new Error('OCR engine failed to load');
        await worker.reinitialize(lang);
        const { data } = await worker.recognize(imageInput);
        const text = data.text;
        const invoiceMatch = text.match(/(?:invoice|receipt|bill)\s*(?:#|no|number|\.)?\s*:?\s*([A-Za-z0-9-/]+)/i);
        const dateMatch = text.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
        const totalMatch = text.match(/(?:total|amount|sum|grand total|balance)\s*:?\s*[$€£₹]?\s*(\d{1,8}(?:[.,]\d{2})?)/i);
        const firstLine = text.split('\n').map(l => l.trim()).find(l => l.length > 1) || '';
        const invoiceNo = invoiceMatch?.[1] || 'N/A';
        const date = dateMatch ? `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}` : 'N/A';
        const total = totalMatch?.[1] || 'N/A';
        const vendor = firstLine.replace(/[^\w\s]/g, '').trim() || 'N/A';
        const lowConfidence = invoiceNo === 'N/A' || total === 'N/A' ? 'CHECK SCAN' : 'OK';
        const csv = `"Vendor","Date","Invoice No","Total","Confidence"\n"${vendor}","${date}","${invoiceNo}","${total}","${lowConfidence}"\n`;
        return { name: file.name.replace(/\.[^.]+$/, '-parsed.csv'), blob: new Blob([csv], { type: 'text/csv' }) };
      }}
      configFields={
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">OCR Language</label>
          <select aria-label="OCR Language" name="lang" defaultValue="eng" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
            <option value="eng">English</option>
            <option value="hin">Hindi</option>
            <option value="ara">Arabic</option>
            <option value="spa">Spanish</option>
          </select>
        </div>
      }
      defaultConfig={{ lang: 'eng' }}
    />
  );
}
