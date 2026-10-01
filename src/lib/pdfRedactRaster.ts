/**
 * Maximum-redaction raster helpers (release-blocking fix, Oct 2026).
 *
 * The old path rendered the page from pdf.js at 200 DPI, reinserted it at
 * PIXEL size, and encoded an untouched render — the black box and the
 * shipped pixels could disagree, and a text-extraction gate waved the image
 * through. These helpers make the corrected invariants testable without a
 * canvas:
 *
 *  1. rects map from unrotated top-down page points into the rotation-0
 *     canvas space the render produced (one frame for boxes and pixels);
 *  2. the burn runs on the same canvas before toBlob;
 *  3. the exported raster is pixel-verified (regions must be near-black).
 */

/** Page-space or canvas-space axis-aligned rectangle. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Structural subset of pdf.js Viewport — keeps this module DOM-free. */
export interface ViewportLike {
  width: number;
  height: number;
  // pdf.js types this as any[] — the impl asserts exactly [x, y].
  convertToViewportPoint(_x: number, _y: number): number[];
}

/** Minimal canvas contract the burn step needs (CanvasRenderingContext2D satisfies it). */
export interface BlackCanvas {
  fillStyle: unknown;
  fillRect(_x: number, _y: number, _w: number, _h: number): void;
}

/**
 * Unrotated top-down page-space rect → axis-aligned canvas rect in the
 * viewport's pixel space. Converts through PDF y-up user space so cropbox
 * offsets handled by the viewport are respected — the caller must pass a
 * rotation:0 viewport so the render frame and the rect frame agree.
 */
export function pageRectToCanvasRect(r: Rect, pageHeightPt: number, vp: ViewportLike): Rect {
  const p1 = vp.convertToViewportPoint(r.x, pageHeightPt - r.y);
  const p2 = vp.convertToViewportPoint(r.x + r.w, pageHeightPt - (r.y + r.h));
  const x1 = p1[0]!;
  const y1 = p1[1]!;
  const x2 = p2[0]!;
  const y2 = p2[1]!;
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    w: Math.abs(x2 - x1),
    h: Math.abs(y2 - y1),
  };
}

/**
 * Fill the mapped rects solid black. MUST run on the render's own canvas
 * after drawing and before toBlob — the pixels the boxes cover and the
 * pixels that ship are then the same pixels.
 */
export function burnRects(ctx: BlackCanvas, rects: Rect[]): void {
  ctx.fillStyle = '#000000';
  for (const r of rects) ctx.fillRect(r.x, r.y, r.w, r.h);
}

/**
 * Fraction of pixels under `threshold` luminance inside rect (0..1).
 * Used by the post-export pixel gate: a redact region in the OUTPUT file
 * must be near-black, because text extraction cannot see into an image.
 * A 2px inset keeps JPEG bleed at the region edge from failing an
 * otherwise-solid box; rects that vanish after clamping fail closed (0).
 */
export function regionDarkness(
  rgba: Uint8ClampedArray | Uint8Array,
  canvasW: number,
  canvasH: number,
  rect: Rect,
  opts: { threshold?: number; inset?: number } = {},
): number {
  const threshold = opts.threshold ?? 64;
  const inset = opts.inset ?? 2;
  let x0 = Math.max(0, Math.floor(rect.x) + inset);
  let y0 = Math.max(0, Math.floor(rect.y) + inset);
  let x1 = Math.min(canvasW, Math.ceil(rect.x + rect.w) - inset);
  let y1 = Math.min(canvasH, Math.ceil(rect.y + rect.h) - inset);
  if (x1 <= x0 || y1 <= y0) {
    x0 = Math.max(0, Math.floor(rect.x));
    y0 = Math.max(0, Math.floor(rect.y));
    x1 = Math.min(canvasW, Math.ceil(rect.x + rect.w));
    y1 = Math.min(canvasH, Math.ceil(rect.y + rect.h));
    if (x1 <= x0 || y1 <= y0) return 0;
  }
  let dark = 0;
  let total = 0;
  for (let y = y0; y < y1; y++) {
    let i = (y * canvasW + x0) * 4;
    for (let x = x0; x < x1; x++, i += 4) {
      const luma = (rgba[i]! * 299 + rgba[i + 1]! * 587 + rgba[i + 2]! * 114) / 1000;
      if (luma < threshold) dark++;
      total++;
    }
  }
  return total === 0 ? 0 : dark / total;
}

/** Export gate: every burned region must be at least this dark in the output. */
export const REDACT_PIXEL_MIN_RATIO = 0.99;
