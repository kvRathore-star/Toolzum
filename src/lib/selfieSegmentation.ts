"use client";

/**
 * On-device person segmentation for AI BG Changer (Sep 2026).
 *
 * MediaPipe ImageSegmenter (selfie_multiclass_256x256) runs 100% locally —
 * no uploads, no credits, no server cost. This is what makes the tool's "AI"
 * prefix true; the chroma heuristic in AiBgChanger remains as the instant
 * fallback when the model can't load (offline, old device, fetch blocked).
 *
 * Model contract assumption: category index 0 is background; every other
 * index is person. The pixel loop only depends on that, never on exact
 * part labels — verified against the multiclass model card.
 */

const TASKS_VISION_VERSION = "1.0.1";
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VISION_VERSION}/wasm`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite";

const MASK_SIZE = 256;

type Segmenter = {
  segment: (image: unknown, callback: (result: unknown) => void) => void;
  close?: () => void;
};

let segmenterPromise: Promise<unknown> | null = null;

export function modelAssetUrl(): string {
  return MODEL_URL;
}

export function wasmBaseUrl(): string {
  return WASM_URL;
}

/** Singleton loader — the ~MB model downloads once, then stays in memory. */
export async function getPersonSegmenter(): Promise<unknown> {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      const vision = await import("@mediapipe/tasks-vision");
      const fileset = await vision.FilesetResolver.forVisionTasks(WASM_URL);
      return vision.ImageSegmenter.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
        outputCategoryMask: true,
        runningMode: "IMAGE",
      });
    })().catch((err: unknown) => {
      // Never cache a failure — a transient network blip shouldn't doom
      // every later attempt in this session.
      segmenterPromise = null;
      throw err;
    });
  }
  return segmenterPromise;
}

export interface PersonMask {
  /** 1 = person, 0 = background, row-major at MASK_SIZE × MASK_SIZE. */
  map: Uint8Array;
  width: number;
  height: number;
}

/** Run segmentation on an image element/bitmap. Throws on any failure. */
export async function segmentPerson(image: HTMLImageElement | ImageBitmap): Promise<PersonMask> {
  const segmenter = (await getPersonSegmenter()) as Segmenter;
  const result = await new Promise<unknown>((resolve, reject) => {
    try {
      segmenter.segment(image, resolve);
    } catch (err) {
      reject(err);
    }
  });
  const masks = (result as { categoryMasks?: Array<{ getAsUint8Array?: () => Uint8Array }> }).categoryMasks;
  const raw = masks?.[0]?.getAsUint8Array?.();
  if (!raw || raw.length !== MASK_SIZE * MASK_SIZE) {
    throw new Error("Unexpected segmentation mask shape");
  }
  const map = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) map[i] = raw[i]! > 0 ? 1 : 0;
  return { map, width: MASK_SIZE, height: MASK_SIZE };
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

/**
 * Pure pixel loop: apply a person mask to full-resolution image data.
 * Mask is nearest-neighbor upsampled to image size. Person pixels are kept;
 * background pixels go transparent (or the chosen color) with a 1px feather
 * band around mask edges to avoid halos.
 *
 * Takes a structural buffer (not DOM ImageData) so the loop is unit-testable
 * in Node — real ImageData satisfies the shape.
 */
export interface PixelBuffer {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export function applyPersonMask(
  imageData: PixelBuffer,
  mask: PersonMask,
  opts: { useTransparent: boolean; bgColor: string },
): void {
  const { data, width, height } = imageData;
  const [br, bg, bb] = hexToRgb(opts.bgColor);
  const sx = mask.width / width;
  const sy = mask.height / height;

  const at = (x: number, y: number): number => {
    const mx = Math.min(mask.width - 1, Math.max(0, Math.floor(x * sx)));
    const my = Math.min(mask.height - 1, Math.max(0, Math.floor(y * sy)));
    return mask.map[my * mask.width + mx]!;
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (at(x, y) === 1) continue; // person — keep
      // Feather: background pixel adjacent to person gets 50% blend.
      const edge =
        at(x - 1, y) === 1 || at(x + 1, y) === 1 || at(x, y - 1) === 1 || at(x, y + 1) === 1;
      if (opts.useTransparent) {
        data[i + 3] = edge ? 128 : 0;
      } else if (edge) {
        data[i] = Math.round(data[i]! / 2 + br / 2);
        data[i + 1] = Math.round(data[i + 1]! / 2 + bg / 2);
        data[i + 2] = Math.round(data[i + 2]! / 2 + bb / 2);
      } else {
        data[i] = br;
        data[i + 1] = bg;
        data[i + 2] = bb;
      }
    }
  }
}
