"use client";
import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';

export default function BulkImageToPdf() {
  return (
    <BulkToolShell
      toolSlug="bulk-image-to-pdf"
      title="Bulk Image to PDF"
      description="Convert multiple images into PDF documents — one PDF per image, delivered together. Great for scans and photo collections."
      accept="image/*"
      processFile={async (file, config) => {
        const cfg = config as Record<string, string>;
        const margin = Number(cfg.margin) || 10;
        const pageSize = cfg.pageSize || 'fit';
        const orientationCfg = cfg.orientation || 'auto';
        const quality = Number(cfg.quality) || 0.92;
        const img = await createImageBitmap(file);
        const { jsPDF } = await import('jspdf');
        const orientation = (orientationCfg === 'auto' ? (img.width > img.height ? 'landscape' : 'portrait') : orientationCfg) as 'landscape' | 'portrait';
        const pdf = pageSize === 'fit'
          ? new jsPDF({ orientation, unit: 'px', format: [img.width + margin * 2, img.height + margin * 2] })
          : new jsPDF({ orientation, unit: 'px', format: pageSize });
        const pw = pdf.internal.pageSize.getWidth();
        const ph = pdf.internal.pageSize.getHeight();
        const scale = Math.min((pw - margin * 2) / img.width, (ph - margin * 2) / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        img.close();
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        pdf.addImage(dataUrl, 'JPEG', (pw - dw) / 2, (ph - dh) / 2, dw, dh);
        const pdfBlob = pdf.output('blob');
        return { name: file.name.replace(/\.[^.]+$/, '.pdf'), blob: pdfBlob };
      }}
      configFields={
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Page Margin (px)</label>
            <input aria-label="Page Margin (px)" name="margin" type="number" defaultValue="10" min="0" max="100" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Page Size</label>
            <select aria-label="Page Size" name="pageSize" defaultValue="fit" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
              <option value="fit">Fit to Image</option>
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Orientation</label>
            <select aria-label="Orientation" name="orientation" defaultValue="auto" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
              <option value="auto">Auto</option>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">JPEG Quality</label>
            <select aria-label="JPEG Quality" name="quality" defaultValue="0.92" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
              <option value="0.6">60% (Smaller)</option>
              <option value="0.8">80% (Balanced)</option>
              <option value="0.92">92% (High)</option>
              <option value="1">100% (Maximum)</option>
            </select>
          </div>
        </div>
      }
      defaultConfig={{ margin: '10', pageSize: 'fit', orientation: 'auto', quality: '0.92' }}
    />
  );
}
