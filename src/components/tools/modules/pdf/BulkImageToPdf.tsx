"use client";
import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';

export default function BulkImageToPdf() {
  return (
    <BulkToolShell
      toolSlug="bulk-image-to-pdf"
      title="Bulk Image to PDF"
      description="Merge multiple images into a single PDF document. Great for scans and photo collections."
      accept="image/*"
      processFile={async (file, config) => {
        const margin = Number((config as Record<string, string>).margin) || 10;
        const img = await createImageBitmap(file);
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF({ orientation: img.width > img.height ? 'landscape' : 'portrait', unit: 'px', format: [img.width + margin * 2, img.height + margin * 2] });
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        img.close();
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        pdf.addImage(dataUrl, 'JPEG', margin, margin, img.width, img.height);
        const pdfBlob = pdf.output('blob');
        return { name: file.name.replace(/\.[^.]+$/, '.pdf'), blob: pdfBlob };
      }}
      configFields={
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">Page Margin (px)</label>
          <input aria-label="Page Margin (px)" name="margin" type="number" defaultValue="10" min="0" max="100" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]" />
        </div>
      }
      defaultConfig={{ margin: '10' }}
    />
  );
}
