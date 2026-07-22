"use client";
import React from 'react';
import { degrees } from 'pdf-lib';
import { PdfActionBase } from './PdfActionBase';

export default function PdfStamp() {
  return (
    <PdfActionBase
      title="Stamp"
      description="Add a diagonal watermark stamp (e.g. DRAFT, CONFIDENTIAL) to every page of your PDF."
      renderOptions={(state, setState) => {
        const stampText = (state?.stampText as string) || 'DRAFT';
        return (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Stamp Text</label>
            <input type="text" value={stampText} onChange={e => setState({ ...state, stampText: e.target.value })}
              placeholder="DRAFT, CONFIDENTIAL, etc."
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
          </div>
        );
      }}
      processAction={async (pdfDoc, font, boldFont, pages, state) => {
        const stampText = (state?.stampText as string) || 'DRAFT';
        for (const page of pages) {
          const { width, height } = page.getSize();
          const size = 48;
          page.drawText(stampText, {
            x: width / 2 - font.widthOfTextAtSize(stampText, size) / 2,
            y: height / 2 - size / 2,
            size,
            font: boldFont,
            color: { r: 0.8, g: 0.2, b: 0.2 },
            opacity: 0.3,
            rotate: degrees(-45),
          });
        }
      }}
    />
  );
}
