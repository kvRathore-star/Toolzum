"use client";
import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';

export default function BulkImageResizer() {
  return (
    <BulkToolShell
      toolSlug="bulk-image-resizer"
      title="Bulk Image Resizer"
      description="Resize hundreds of images to exact pixel dimensions in one pass."
      accept="image/*"
      processFile={async (file, config) => {
        const cfg = config as Record<string, string>;
        const width = parseInt(cfg.width ?? "") || 800;
        const height = parseInt(cfg.height ?? "") || 800;
        const fit = cfg.fit || 'contain';
        const img = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (fit === 'cover') {
          const scale = Math.max(width / img.width, height / img.height);
          sw = width / scale; sh = height / scale;
          sx = (img.width - sw) / 2; sy = (img.height - sh) / 2;
        } else {
          const scale = Math.min(width / img.width, height / img.height);
          const dw = img.width * scale, dh = img.height * scale;
          sx = (width - dw) / 2; sy = (height - dh) / 2;
          sw = dw; sh = dh;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
        img.close();
        const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
        return { name: file.name.replace(/\.[^.]+$/, '.png'), blob };
      }}
      configFields={
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Width (px)</label>
            <input aria-label="Width (px)" name="width" type="number" defaultValue="800" min="1" max="10000" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]" />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Height (px)</label>
            <input aria-label="Height (px)" name="height" type="number" defaultValue="800" min="1" max="10000" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]" />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Fit Mode</label>
            <select aria-label="Fit Mode" name="fit" defaultValue="contain" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
              <option value="contain">Contain (fit inside)</option>
              <option value="cover">Cover (fill, may crop)</option>
              <option value="stretch">Stretch (exact)</option>
            </select>
          </div>
        </div>
      }
      defaultConfig={{ width: '800', height: '800', fit: 'contain' }}
    />
  );
}
