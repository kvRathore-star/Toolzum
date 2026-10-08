export interface CategoryLimits {
  signed: number;
  free: number;
}

/**
 * Intake ceilings mirror CATEGORY_CAPS (planTiers, the single source):
 * same for anon and signed-in — local compute costs nothing, gates exist
 * only for browser memory and abuse. Pro behavior is unchanged (callers
 * resolve Pro caps from their own props, e.g. the PDF editor's 125/unlimited).
 */
const IMAGE_EXT_HINTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.avif', '.heic', '.heif', '.tiff', '.tif', '.ico'];

export function smartMax(accept: string): CategoryLimits {
  if (accept.includes('video/')) return { signed: 250, free: 250 };
  if (accept.includes('application/pdf') || accept.includes('.pdf')) return { signed: 125, free: 125 };
  if (accept.includes('audio/')) return { signed: 100, free: 100 };
  const lower = accept.toLowerCase();
  if (lower.includes('image/') || IMAGE_EXT_HINTS.some((h) => lower.includes(h))) return { signed: 50, free: 50 };
  return { signed: 150, free: 150 };
}
