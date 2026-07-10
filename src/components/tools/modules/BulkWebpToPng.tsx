"use client";
import React from 'react';
import { BulkToolShell } from './BulkToolShell';

export default function BulkWebpToPng() {
  return (
    <BulkToolShell
      toolSlug="bulk-webp-to-png"
      title="Bulk WebP to PNG"
      description="Need WebP files back to PNG? Convert entire folders of WebP images to universal PNG format in one click — zero quality loss."
      accept="image/*"
      processFile={async (file) => {
        const img = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        img.close();
        const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
        return { name: file.name.replace(/\.[^.]+$/, '.png'), blob };
      }}
    />
  );
}
