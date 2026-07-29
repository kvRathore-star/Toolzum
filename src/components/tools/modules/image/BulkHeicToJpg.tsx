"use client";
import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';

export default function BulkHeicToJpg() {
  return (
    <BulkToolShell
      toolSlug="bulk-heic-to-jpg"
      title="Bulk HEIC to JPG"
      description="Convert iPhone HEIC photos to universal JPG. Fully client-side — your photos never leave your device."
      accept=".heic,.heif"
      processFile={async (file) => {
        const { default: heic2any } = await import('heic2any');
        const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
        const resultBlob = Array.isArray(blob) ? blob[0] : blob;
        return { name: file.name.replace(/\.(heic|heif)$/i, '.jpg'), blob: resultBlob };
      }}
    />
  );
}
