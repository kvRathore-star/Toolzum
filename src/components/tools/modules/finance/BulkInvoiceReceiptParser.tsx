"use client";
import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';

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
        const imageFile = file;
        if (file.name.endsWith('.pdf')) {
          const { PDFDocument } = await import('pdf-lib');
          const arrayBuf = await file.arrayBuffer();
          const doc = await PDFDocument.load(arrayBuf);
          const pages = doc.getPages();
          if (pages.length === 0) throw new Error('PDF has no pages');
        }
        const Tesseract = await import('tesseract.js');
        const { data } = await Tesseract.recognize(imageFile, lang, { logger: () => {} });
        const text = data.text;
        const invoiceMatch = text.match(/(?:invoice|receipt|bill)\s*(?:#|no|number|\.)?\s*:?\s*([A-Za-z0-9-/]+)/i);
        const dateMatch = text.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
        const totalMatch = text.match(/(?:total|amount|sum|grand total|balance)\s*:?\s*[$€£₹]?\s*(\d{1,8}(?:[.,]\d{2})?)/i);
        const vendorMatch = text.match(/^(.*?)(?:\n|$)/);
        const invoiceNo = invoiceMatch?.[1] || 'N/A';
        const date = dateMatch ? `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}` : 'N/A';
        const total = totalMatch?.[1] || 'N/A';
        const vendor = vendorMatch?.[1]?.replace(/[^\w\s]/g, '').trim() || 'N/A';
        const csv = `"Vendor","Date","Invoice No","Total"\n"${vendor}","${date}","${invoiceNo}","${total}"\n`;
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
