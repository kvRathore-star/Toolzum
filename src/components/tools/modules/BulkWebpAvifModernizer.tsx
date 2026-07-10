"use client";
import React from 'react';
import { BulkToolShell } from './BulkToolShell';

export default function BulkWebpAvifModernizer({ defaultConfig: extraConfig }: { defaultConfig?: Record<string, unknown> } = {}) {
  const base = { format: 'webp', quality: '80' };
  const merged = { ...base, ...extraConfig };
  return (
    <BulkToolShell
      toolSlug="bulk-webp-avif-modernizer"
      title="Bulk WebP/AVIF Modernizer"
      description="Convert images to next-gen WebP and AVIF formats. Shrink file sizes by 30-50% without visible quality loss."
      accept="image/*"
      processFile={async (file, config) => {
        const format = (config as Record<string, string>).format || 'webp';
        const quality = Number((config as Record<string, string>).quality) / 100 || 0.8;
        const img = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        img.close();
        const mime = format === 'avif' ? 'image/avif' : 'image/webp';
        const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), mime, quality));
        const ext = format === 'avif' ? '.avif' : '.webp';
        return { name: file.name.replace(/\.[^.]+$/, ext), blob };
      }}
      configFields={
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Format</label>
            <select name="format" defaultValue={(merged.format) as string} className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
              <option value="webp">WebP (widely supported)</option>
              <option value="avif">AVIF (best compression, experimental)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Quality</label>
            <input name="quality" type="range" min="10" max="100" defaultValue={merged.quality as string} className="w-full mt-1" onChange={e => { const el = e.target; const lbl = el.parentElement?.querySelector('label'); if (lbl) lbl.textContent = `Quality: ${e.target.value}%`; }} />
          </div>
        </div>
      }
      defaultConfig={merged}
    />
  );
}
