"use client";
import React from 'react';
import { BulkToolShell } from '../utility/BulkToolShell';

type BlazeFaceModel = {
  estimateFaces: (
    _input: HTMLCanvasElement,
    _returnTensors: boolean,
  ) => Promise<Array<{ topLeft: number[]; bottomRight: number[]; probability?: number[] | number }>>;
};

// Module-level singleton: one model download shared across the whole batch
// (same pattern as the single-image BlurFace tool).
let modelPromise: Promise<BlazeFaceModel | null> | null = null;
function ensureBlazeFace(): Promise<BlazeFaceModel | null> {
  if (!modelPromise) {
    modelPromise = (async () => {
      try {
        const [{ load: loadBlazeface }] = await Promise.all([
          import('@tensorflow-models/blazeface'),
          import('@tensorflow/tfjs'),
        ]);
        return (await loadBlazeface()) as BlazeFaceModel;
      } catch (err) {
        console.error('Failed to load blazeface', err);
        return null;
      }
    })();
  }
  return modelPromise;
}

export default function BulkFaceAnonymizer() {
  return (
    <BulkToolShell
      toolSlug="bulk-face-anonymizer"
      title="Bulk Face Anonymizer"
      description="Detect faces with on-device AI, then blur or pixelate them across multiple images. Privacy-first batch redaction."
      accept="image/*"
      heavyEngineNotice="Face-detection AI loads once, then runs per image — expect slower batches on constrained devices."
      processFile={async (file, config) => {
        const method = (config as Record<string, string>).method || 'blur';
        const strength = Number((config as Record<string, string>).strength) || 20;
        const model = await ensureBlazeFace();
        if (!model) throw new Error('Face-detection engine failed to load');
        const img = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width; canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        img.close();
        // Real detection replaces the old hardcoded rectangles (which blurred
        // fixed screen positions whether or not a face was there).
        const predictions = await model.estimateFaces(canvas, false);
        const faces = predictions
          .map(p => {
            const [x, y] = p.topLeft as [number, number];
            const [x2, y2] = p.bottomRight as [number, number];
            const prob = Array.isArray(p.probability) ? p.probability[0] ?? 1 : p.probability ?? 1;
            return { x, y, size: Math.max(x2 - x, y2 - y), prob };
          })
          .filter(f => f.prob > 0.5 && f.size > 8);
        if (faces.length === 0) throw new Error(`No faces detected in ${file.name} — skipped`);
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
            <select aria-label="Method" name="method" defaultValue="blur" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]">
              <option value="blur">Gaussian Blur</option>
              <option value="pixelate">Pixelate</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--text-secondary)]">Strength</label>
            <input aria-label="Strength" name="strength" type="number" defaultValue="20" min="5" max="50" className="w-full mt-1 p-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)]" />
          </div>
        </div>
      }
      defaultConfig={{ method: 'blur', strength: '20' }}
    />
  );
}
