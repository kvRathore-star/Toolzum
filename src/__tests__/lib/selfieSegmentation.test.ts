import { describe, it, expect } from "vitest";
import {
  applyPersonMask,
  modelAssetUrl,
  wasmBaseUrl,
  type PersonMask,
  type PixelBuffer,
} from "@/lib/selfieSegmentation";

function makeImage(
  w: number,
  h: number,
  fill: [number, number, number, number] = [100, 100, 100, 255],
): PixelBuffer {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    data.set(fill, i * 4);
  }
  return { data, width: w, height: h };
}

describe("applyPersonMask", () => {
  it("keeps person pixels, clears background to transparent", () => {
    // 4x4 image, 2x2 mask: top-left quadrant is person.
    const img = makeImage(4, 4);
    const mask: PersonMask = {
      map: new Uint8Array([1, 0, 0, 0]),
      width: 2,
      height: 2,
    };
    applyPersonMask(img, mask, { useTransparent: true, bgColor: "#000000" });
    // Person quadrant (x0-1,y0-1) keeps alpha 255.
    expect(img.data[3]).toBe(255);
    // Interior background pixel (x3,y3) fully cleared.
    const i = (3 * 4 + 3) * 4;
    expect(img.data[i + 3]).toBe(0);
    // RGB of person pixels untouched.
    expect(img.data[0]).toBe(100);
  });

  it("paints background color when transparency is off", () => {
    const img = makeImage(4, 4);
    const mask: PersonMask = {
      map: new Uint8Array([1, 0, 0, 0]),
      width: 2,
      height: 2,
    };
    applyPersonMask(img, mask, { useTransparent: false, bgColor: "#10b981" });
    const i = (3 * 4 + 3) * 4;
    expect([img.data[i], img.data[i + 1], img.data[i + 2]]).toEqual([0x10, 0xb9, 0x81]);
    expect(img.data[i + 3]).toBe(255);
    expect(img.data[3]).toBe(255);
  });

  it("feathers the person/background boundary instead of haloing", () => {
    const img = makeImage(4, 4);
    const mask: PersonMask = {
      map: new Uint8Array([1, 0, 0, 0]),
      width: 2,
      height: 2,
    };
    applyPersonMask(img, mask, { useTransparent: true, bgColor: "#000000" });
    // Pixel (x2,y0) is background but adjacent to person → 50% feather.
    const i = (0 * 4 + 2) * 4;
    expect(img.data[i + 3]).toBe(128);
  });
});

describe("model + wasm URLs stay pinned and CSP-covered", () => {
  it("model comes from the allowlisted Google origin", () => {
    expect(modelAssetUrl()).toContain("storage.googleapis.com");
    expect(modelAssetUrl()).toContain("selfie_multiclass_256x256");
  });

  it("wasm pins the installed tasks-vision version on the allowlisted CDN", () => {
    expect(wasmBaseUrl()).toContain("cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm");
  });
});
