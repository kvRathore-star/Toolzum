"use client";

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { BulkToolShell } from '../utility/BulkToolShell';
import heic2any from 'heic2any';

const OUTPUT_FORMATS = [
  { value: 'webp', label: 'WebP (widely supported)', mime: 'image/webp', ext: '.webp' },
  { value: 'avif', label: 'AVIF (best compression)', mime: 'image/avif', ext: '.avif' },
  { value: 'jpg', label: 'JPEG (universal)', mime: 'image/jpeg', ext: '.jpg' },
  { value: 'png', label: 'PNG (lossless, transparency)', mime: 'image/png', ext: '.png' },
] as const;

const INPUT_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,image/gif,image/bmp,image/vnd.microsoft.icon,image/svg+xml';

export default function BulkImageConverter({ defaultConfig: extraConfig }: { defaultConfig?: Record<string, unknown> } = {}) {
  const searchParams = useSearchParams();
  const fromParam = searchParams?.get('from');
  const toParam = searchParams?.get('to');

  const base = { format: 'webp', quality: '80' };
  const merged = { ...base, ...extraConfig };

  if (toParam && OUTPUT_FORMATS.find(f => f.value === toParam)) {
    merged.format = toParam;
  }

  const fromLabel = fromParam?.toUpperCase();
  const toLabel = toParam?.toUpperCase();

  return (
    <BulkToolShell
      toolSlug="bulk-image-converter"
      title="Bulk Image Format Converter"
      description={fromParam && toParam
        ? `Upload ${fromLabel} images — they'll be converted to ${toLabel}.`
        : "Convert images between JPG, PNG, WebP, AVIF, HEIC, HEIF, GIF, BMP, ICO, SVG. Batch convert with quality control. 100% local, zero uploads."}
      accept={INPUT_ACCEPT}
      processFile={async (file, config) => {
        const format = (config as Record<string, string>).format || 'webp';
        const quality = Number((config as Record<string, string>).quality) / 100 || 0.8;

        const mime = OUTPUT_FORMATS.find(f => f.value === format)?.mime || 'image/webp';
        const ext = OUTPUT_FORMATS.find(f => f.value === format)?.ext || '.webp';

        // Handle HEIC/HEIF/JFIF via heic2any
        if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.match(/\.(heic|heif|jfif)$/i)) {
          const convertedBlob = await heic2any({
            blob: file,
            toType: mime,
            quality,
          });
          return { name: file.name.replace(/\.[^.]+$/, ext), blob: convertedBlob as Blob };
        }

        // Handle SVG - rasterize to canvas
        if (file.type === 'image/svg+xml') {
          const text = await file.text();
          const img = new Image();
          const svgBlob = new Blob([text], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(svgBlob);
          img.src = url;
          await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 1024;
          canvas.height = img.height || 1024;
          canvas.getContext('2d')!.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), mime, quality));
          return { name: file.name.replace(/\.[^.]+$/, ext), blob };
        }

        // Standard raster formats
        const img = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        img.close();
        const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), mime, quality));
        return { name: file.name.replace(/\.[^.]+$/, ext), blob };
      }}
      configFields={
        <div className="space-y-3">
          {fromParam && toParam && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--accent-ink)]/10 border border-[var(--accent)]/20 rounded-[var(--radius-lg)] w-fit">
              <span className="text-xs font-semibold text-[var(--accent)]">{fromLabel}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="text-xs font-semibold text-[var(--accent)]">{toLabel}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Output Format</label>
            <select name="format" defaultValue={(merged.format) as string} className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
              {OUTPUT_FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Quality</label>
            <input name="quality" type="range" min="10" max="100" defaultValue={merged.quality as string} className="w-full mt-1" />
          </div>
        </div>
        </div>
      }
      defaultConfig={merged}
    />
  );
}