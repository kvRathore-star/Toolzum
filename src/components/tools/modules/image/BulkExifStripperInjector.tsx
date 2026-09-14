"use client";
import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';

export default function BulkExifStripperInjector() {
  return (
    <BulkToolShell
      toolSlug="bulk-exif-stripper-injector"
      title="Bulk EXIF Stripper"
      description="Remove sensitive metadata (location, device, timestamps) from images in bulk. Privacy-first photo processing."
      accept="image/jpeg,image/png,image/webp"
      processFile={async (file) => {
        const img = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        img.close();
        const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.95));
        return { name: file.name.replace(/\.[^.]+$/, '-noexif.jpg'), blob };
      }}
      configFields={
        <div>
          <p className="text-xs text-[var(--text-muted)] mt-1">Re-encoding via Canvas strips all EXIF data automatically. (The old &ldquo;inject&rdquo; mode ran this same strip path — it never injected anything, so it was removed.)</p>
        </div>
      }
      defaultConfig={{}}
    />
  );
}
