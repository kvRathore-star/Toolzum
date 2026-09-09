/**
 * Low-end device detection for heavy WASM/AI engine loads (FFmpeg ~30MB,
 * TF.js BlazeFace, Tesseract). Used to show a heads-up before large
 * downloads — never to block: a slow tool beats no tool.
 *
 * Unknown capabilities → false (assume capable). All signals are
 * best-effort browser hints, not guarantees.
 */
export function isLowEndDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  try {
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if (typeof mem === "number" && mem <= 4) return true;
    if (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4) {
      return true;
    }
    const conn = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    if (conn?.saveData) return true;
    if (conn?.effectiveType && ["slow-2g", "2g", "3g"].includes(conn.effectiveType)) return true;
  } catch {
    return false;
  }
  return false;
}
