import { describe, it, expect } from 'vitest';
import { PDFDocument, degrees } from 'pdf-lib';
// legacy build: works in Node without the DOM worker (main build warns).
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import {
  pageRectToCanvasRect,
  burnRects,
  regionDarkness,
  REDACT_PIXEL_MIN_RATIO,
  type Rect,
} from '@/lib/pdfRedactRaster';

/**
 * Maximum-redaction raster geometry (release-blocking fix, Oct 2026).
 *
 * The old export path rendered the rotated view at 200 DPI and reinserted
 * the page at PIXEL size — boxes drew at point coords on a 2.78x page.
 * These tests pin the corrected invariants against a real pdf.js Viewport:
 *   1. rotation:0 render keeps one coordinate frame for every /Rotate;
 *   2. page rects map exactly onto that frame;
 *   3. canvas pixel size is never mistaken for page point size;
 *   4. the pixel gate fails closed.
 * Full render → toBlob → JPEG round-trip needs a canvas implementation;
 * covered by the manual fixture checklist in docs/pdf-editor-claims.md.
 */

const SCALE = 200 / 72;
const PAGE_W = 612;
const PAGE_H = 792;

async function rot0Viewport(angle: number) {
  const doc = await PDFDocument.create();
  const p = doc.addPage([PAGE_W, PAGE_H]);
  if (angle) p.setRotation(degrees(angle));
  const bytes = await doc.save();
  const task = pdfjsLib.getDocument({ data: new Uint8Array(bytes) });
  const pdf = await task.promise;
  const page = await pdf.getPage(1);
  // Exactly what the fixed export path requests.
  const vp = page.getViewport({ scale: SCALE, rotation: 0 });
  return { vp, task };
}

describe('pageRectToCanvasRect (burn geometry)', () => {
  it('maps top-down page points exactly onto the rotation:0 render', async () => {
    const { vp, task } = await rot0Viewport(0);
    const r: Rect = { x: 72, y: 100, w: 200, h: 40 };
    const c = pageRectToCanvasRect(r, PAGE_H, vp);
    expect(c.x).toBeCloseTo(r.x * SCALE, 5);
    expect(c.y).toBeCloseTo(r.y * SCALE, 5);
    expect(c.w).toBeCloseTo(r.w * SCALE, 5);
    expect(c.h).toBeCloseTo(r.h * SCALE, 5);
    await task.destroy();
  });

  it('keeps the frame unrotated for /Rotate 90, 180, 270 (rect stays in bounds)', async () => {
    for (const angle of [90, 180, 270]) {
      const { vp, task } = await rot0Viewport(angle);
      // rotation:0 render dims depend only on the page, never on /Rotate —
      // this is what makes rect coords valid whatever the page angle is.
      expect(vp.width).toBeCloseTo(PAGE_W * SCALE, 5);
      expect(vp.height).toBeCloseTo(PAGE_H * SCALE, 5);
      // A rect in the page's lower-right corner must land inside the canvas.
      const r: Rect = { x: PAGE_W - 140, y: PAGE_H - 100, w: 100, h: 40 };
      const c = pageRectToCanvasRect(r, PAGE_H, vp);
      expect(c.x).toBeGreaterThanOrEqual(-1e-6);
      expect(c.y).toBeGreaterThanOrEqual(-1e-6);
      expect(c.x + c.w).toBeLessThanOrEqual(vp.width + 1e-6);
      expect(c.y + c.h).toBeLessThanOrEqual(vp.height + 1e-6);
      // Round-trip: divide the canvas rect back to points → original rect.
      expect(c.x / SCALE).toBeCloseTo(r.x, 4);
      expect(c.y / SCALE).toBeCloseTo(r.y, 4);
      expect(c.w / SCALE).toBeCloseTo(r.w, 4);
      await task.destroy();
    }
  });

  it('regression: canvas pixel size must never be used as the reinsert page size', async () => {
    const { vp, task } = await rot0Viewport(0);
    // The old bug: insertPage([vp.width, vp.height]) → 2.78x oversized page.
    expect(vp.width).not.toBeCloseTo(PAGE_W, 0);
    expect(vp.width / SCALE).toBeCloseTo(PAGE_W, 5);
    expect(vp.height / SCALE).toBeCloseTo(PAGE_H, 5);
    await task.destroy();
  });
});

describe('burnRects', () => {
  it('fills every mapped rect with black on the same context', () => {
    const calls: { style: string; args: number[] }[] = [];
    const ctx = {
      fillStyle: '',
      fillRect: (x: number, y: number, w: number, h: number) => {
        calls.push({ style: ctx.fillStyle, args: [x, y, w, h] });
      },
    };
    burnRects(ctx, [
      { x: 10, y: 20, w: 30, h: 40 },
      { x: 100, y: 200, w: 50, h: 60 },
    ]);
    expect(calls.length).toBe(2);
    expect(calls[0]!.style).toBe('#000000');
    expect(calls[0]!.args).toEqual([10, 20, 30, 40]);
    expect(calls[1]!.args).toEqual([100, 200, 50, 60]);
  });
});

describe('regionDarkness (post-export pixel gate)', () => {
  const make = (w: number, h: number, rgb: [number, number, number]) => {
    const data = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = rgb[0];
      data[i + 1] = rgb[1];
      data[i + 2] = rgb[2];
      data[i + 3] = 255;
    }
    return data;
  };

  it('all-black region passes (1.0)', () => {
    expect(regionDarkness(make(50, 50, [0, 0, 0]), 50, 50, { x: 0, y: 0, w: 50, h: 50 })).toBe(1);
  });

  it('all-white region fails (0) — the old false-VERIFIED case', () => {
    expect(regionDarkness(make(50, 50, [255, 255, 255]), 50, 50, { x: 0, y: 0, w: 50, h: 50 })).toBe(0);
  });

  it('a bright leak over an otherwise-black region fails the 99% gate', () => {
    const data = make(100, 100, [0, 0, 0]);
    // 10x10 white patch = 1% of a 100x100 region → ratio lands at/below 0.99.
    for (let y = 40; y < 50; y++) {
      for (let x = 40; x < 50; x++) {
        const i = (y * 100 + x) * 4;
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      }
    }
    const dark = regionDarkness(data, 100, 100, { x: 0, y: 0, w: 100, h: 100 });
    expect(dark).toBeLessThan(REDACT_PIXEL_MIN_RATIO);
  });

  it('inset keeps 1-2px JPEG bleed at the edge from failing a solid box', () => {
    const data = make(50, 50, [255, 255, 255]);
    for (let y = 10; y < 40; y++) {
      for (let x = 10; x < 40; x++) {
        const i = (y * 50 + x) * 4;
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
      }
    }
    // Region exactly on the box edge — un-inset sampling would catch the
    // white border; the 2px inset must still report solid black.
    const dark = regionDarkness(data, 50, 50, { x: 10, y: 10, w: 30, h: 30 });
    expect(dark).toBe(1);
  });

  it('fails closed: empty or out-of-bounds rect returns 0', () => {
    const data = make(20, 20, [0, 0, 0]);
    expect(regionDarkness(data, 20, 20, { x: 5, y: 5, w: 0, h: 0 })).toBe(0);
    expect(regionDarkness(data, 20, 20, { x: 100, y: 100, w: 10, h: 10 })).toBe(0);
  });

  it('exports the gate threshold at 99%', () => {
    expect(REDACT_PIXEL_MIN_RATIO).toBe(0.99);
  });
});
