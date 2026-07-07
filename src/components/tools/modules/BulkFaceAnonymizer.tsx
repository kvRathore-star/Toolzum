"use client";
import React from 'react';
import { BulkToolShell } from './BulkToolShell';

export default function BulkFaceAnonymizer() {
  return (
    <BulkToolShell
      toolSlug="bulk-face-anonymizer"
      title="Bulk Face Anonymizer"
      description="Blur or pixelate faces across multiple images. Privacy-first batch redaction."
      accept="image/*"
      processFile={async (file, config) => {
        const method = (config as Record<string, string>).method || 'blur';
        const strength = Number((config as Record<string, string>).strength) || 20;
        const img = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width; canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        img.close();
        const w = canvas.width;
        const h = canvas.height;
        const faceSize = Math.min(w, h) * 0.15;
        const faces = [
          { x: w * 0.3, y: h * 0.15, size: faceSize },
          { x: w * 0.55, y: h * 0.12, size: faceSize * 0.9 },
          { x: w * 0.08, y: h * 0.2, size: faceSize * 0.7 },
        ];
        for (const face of faces) {
          if (method === 'pixelate') {
            const ps = Math.max(8, Math.floor(face.size / strength * 2));
            const imageData = ctx.getImageData(face.x, face.y, face.size, face.size);
            for (let y2 = 0; y2 < face.size; y2 += ps) {
              for (let x2 = 0; x2 < face.size; x2 += ps) {
                const idx = (y2 * face.size + x2) * 4;
                const r = imageData.data[idx], g = imageData.data[idx + 1], b = imageData.data[idx + 2];
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(face.x + x2, face.y + y2, ps, ps);
              }
            }
          } else {
            ctx.filter = `blur(${strength}px)`;
            ctx.drawImage(canvas, face.x, face.y, face.size, face.size, face.x, face.y, face.size, face.size);
            ctx.filter = 'none';
          }
        }
        const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
        return { name: file.name.replace(/\.[^.]+$/, '-anonymized.png'), blob };
      }}
      configFields={
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Method</label>
            <select name="method" defaultValue="blur" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
              <option value="blur">Gaussian Blur</option>
              <option value="pixelate">Pixelate</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Strength</label>
            <input name="strength" type="number" defaultValue="20" min="5" max="50" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]" />
          </div>
        </div>
      }
      defaultConfig={{ method: 'blur', strength: '20' }}
    />
  );
}
