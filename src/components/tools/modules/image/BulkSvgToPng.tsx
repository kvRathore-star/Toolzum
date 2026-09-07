"use client";
import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';

export default function BulkSvgToPng() {
  return (
    <BulkToolShell
      toolSlug="bulk-svg-to-png"
      title="Bulk SVG to PNG Converter"
      description="Convert SVG vector files to high-quality PNG images. Perfect for icons and illustrations."
      accept=".svg"
      processFile={async (file, config) => {
        const text = await file.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'image/svg+xml');
        const svgEl = doc.querySelector('svg');
        if (!svgEl) throw new Error('Invalid SVG');
        const scale = Number((config as Record<string, string>).scale) || 2;
        const w = parseInt(svgEl.getAttribute('width') || '100');
        const h = parseInt(svgEl.getAttribute('height') || '100');
        const canvas = document.createElement('canvas');
        canvas.width = w * scale;
        canvas.height = h * scale;
        const ctx = canvas.getContext('2d')!;
        ctx.scale(scale, scale);
        const img = new Image();
        const blob = new Blob([text], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = reject; img.src = url; });
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        const pngBlob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
        return { name: file.name.replace(/\.svg$/i, '.png'), blob: pngBlob };
      }}
      configFields={
        <div>
          <label className="text-xs font-medium text-[var(--text-secondary)]">Scale Factor</label>
          <select aria-label="Scale Factor" name="scale" defaultValue="2" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
            <option value="1">1× (original size)</option>
            <option value="2">2× (retina, default)</option>
            <option value="3">3× (ultra HD)</option>
            <option value="4">4× (print quality)</option>
          </select>
        </div>
      }
      defaultConfig={{ scale: '2' }}
    />
  );
}
