"use client";
import React from 'react';
import { BulkToolShell } from './BulkToolShell';

export default function BulkImageCompressor({ defaultConfig: extraConfig }: { defaultConfig?: Record<string, unknown> } = {}) {
  const base = { quality: '80', format: 'jpeg' };
  const merged = { ...base, ...extraConfig };
  return (
    <BulkToolShell
      toolSlug="bulk-image-compressor"
      title="Bulk Image Compressor"
      description="Compress dozens of images at once. Optimize for web while keeping quality."
      accept="image/*"
      processFile={async (file, config) => {
        const quality = Number((config as Record<string, string>).quality) / 100 || 0.8;
        const format = ((config as Record<string, string>).format) || 'jpeg';
        const img = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        img.close();
        const mime = format === 'png' ? 'image/png' : 'image/jpeg';
        const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), mime, quality));
        const ext = format === 'png' ? '.png' : '.jpg';
        return { name: file.name.replace(/\.[^.]+$/, ext), blob };
      }}
      configFields={
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Quality: {50}%</label>
            <input name="quality" type="range" min="10" max="100" defaultValue={merged.quality as string} className="w-full mt-1" onChange={e => { const el = e.target; const lbl = el.parentElement?.querySelector('label'); if (lbl) lbl.textContent = `Quality: ${e.target.value}%`; }} />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Output Format</label>
            <select name="format" defaultValue={merged.format as string} className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
              <option value="jpeg">JPEG (smaller)</option>
              <option value="png">PNG (lossless)</option>
            </select>
          </div>
        </div>
      }
      defaultConfig={merged}
    />
  );
}
