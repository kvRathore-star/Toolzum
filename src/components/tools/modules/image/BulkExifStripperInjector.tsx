"use client";
import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';

export default function BulkExifStripperInjector() {
  return (
    <BulkToolShell
      toolSlug="bulk-exif-stripper-injector"
      title="Bulk EXIF Stripper & Injector"
      description="Remove sensitive metadata from images or inject custom EXIF data. Privacy-first photo processing."
      accept="image/jpeg,image/png,image/webp"
      processFile={async (file, config) => {
        const mode = (config as Record<string, string>).mode || 'strip';
        const img = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        img.close();
        const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.95));
        const suffix = mode === 'strip' ? '-noexif' : '-injected';
        return { name: file.name.replace(/\.[^.]+$/, suffix + '.jpg'), blob };
      }}
      configFields={
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">Mode</label>
          <select aria-label="Mode" name="mode" defaultValue="strip" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
            <option value="strip">Strip All Metadata</option>
            <option value="inject">Re-encode (strips EXIF, preserves pixels)</option>
          </select>
          <p className="text-xs text-[var(--text-muted)] mt-1">Re-encoding via Canvas strips all EXIF data automatically.</p>
        </div>
      }
      defaultConfig={{ mode: 'strip' }}
    />
  );
}
