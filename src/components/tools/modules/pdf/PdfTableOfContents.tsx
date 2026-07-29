"use client";
import React from 'react';
import { PdfActionBase } from './PdfActionBase';

export default function PdfTableOfContents() {
  return (
    <PdfActionBase
      title="Table of Contents"
      description="Insert a table of contents page at the beginning of your PDF."
      renderOptions={() => null}
      processAction={async (pdfDoc, font, boldFont, pages) => {
        const tocPage = pdfDoc.insertPage(0, [595.28, 841.89]);
        tocPage.drawText('Table of Contents', {
          x: 50, y: 780, size: 24, font: boldFont, color: { r: 0.1, g: 0.1, b: 0.1 },
        });
        tocPage.drawLine({
          start: { x: 50, y: 770 }, end: { x: 545, y: 770 },
          thickness: 1, color: { r: 0.2, g: 0.2, b: 0.2 },
        });
        const totalPages = pdfDoc.getPageCount() - 1;
        for (let i = 1; i <= totalPages; i++) {
          const yPos = 740 - i * 22;
          if (yPos < 50) break;
          tocPage.drawText(`Section ${i}`, {
            x: 50, y: yPos, size: 12, font, color: { r: 0.2, g: 0.2, b: 0.2 },
          });
          tocPage.drawText(`Page ${i + 1}`, {
            x: 500, y: yPos, size: 12, font, color: { r: 0.5, g: 0.5, b: 0.5 },
          });
          tocPage.drawLine({
            start: { x: 50, y: yPos - 8 }, end: { x: 545, y: yPos - 8 },
            thickness: 0.3, color: { r: 0.85, g: 0.85, b: 0.85 },
          });
        }
      }}
    />
  );
}
