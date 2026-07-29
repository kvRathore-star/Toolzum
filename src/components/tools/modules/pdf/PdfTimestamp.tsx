"use client";
import React from 'react';
import { PdfActionBase } from './PdfActionBase';

export default function PdfTimestamp() {
  return (
    <PdfActionBase
      title="Timestamp"
      description="Add a generation timestamp to the bottom-right corner of every page."
      renderOptions={() => null}
      processAction={async (pdfDoc, font, boldFont, pages) => {
        const now = new Date();
        const ts = now.toLocaleString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        });
        for (const page of pages) {
          const { width, height } = page.getSize();
          const size = 9;
          const text = `Generated: ${ts}`;
          const tw = font.widthOfTextAtSize(text, size);
          page.drawText(text, {
            x: width - tw - 20,
            y: 15,
            size,
            font,
            color: { r: 0.5, g: 0.5, b: 0.5 },
          });
        }
      }}
    />
  );
}
