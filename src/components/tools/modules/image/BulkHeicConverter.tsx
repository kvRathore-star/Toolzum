"use client";

import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';
import { toast } from 'react-hot-toast';

const OUTPUT_FORMATS = [
  { value: 'jpg', label: 'JPEG (universal)', mime: 'image/jpeg', ext: '.jpg' },
  { value: 'png', label: 'PNG (lossless)', mime: 'image/png', ext: '.png' },
  { value: 'webp', label: 'WebP (modern, small)', mime: 'image/webp', ext: '.webp' },
] as const;

export default function BulkHeicConverter() {
  return (
    <BulkToolShell
      toolSlug="bulk-heic-converter"
      title="Bulk HEIC Converter"
      description="Convert iPhone HEIC/HEIF photos to JPG, PNG, or WebP in batch. Fully client-side — your photos never leave your device."
      accept=".heic,.heif,image/heic,image/heif"
      processFile={async (file, config) => {
        const cfg = config as Record<string, string>;
        const format = cfg.format || 'jpg';
        const quality = Number(cfg.quality) || 92;
        const { default: heic2any } = await import('heic2any');
        const target = OUTPUT_FORMATS.find((f) => f.value === format) || OUTPUT_FORMATS[0];
        const blob = await heic2any({
          blob: file,
          toType: target.mime,
          quality: quality / 100,
        });
        const resultBlob = Array.isArray(blob) ? blob[0]! : blob;
        return {
          name: file.name.replace(/\.(heic|heif)$/i, target.ext),
          blob: resultBlob,
        };
      }}
      configFields={
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Output Format</label>
            <select aria-label="Output Format"
              name="format"
              defaultValue="jpg"
              className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]"
            >
              {OUTPUT_FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Quality</label>
            <input aria-label="Quality"
              type="range"
              name="quality"
              min="10"
              max="100"
              defaultValue="92"
              className="w-full mt-1"
            />
          </div>
        </div>
      }
      defaultConfig={{ format: 'jpg', quality: '92' }}
    />
  );
}
