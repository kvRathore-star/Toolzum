import type * as PdfjsLib from 'pdfjs-dist';

/**
 * Single source of truth for the pdf.js worker URL.
 *
 * History: every tool built its own cdnjs URL from ${pdfjsLib.version},
 * and cdnjs stopped hosting that exact file (404) — silently killing
 * EVERY pdf.js tool (editor, extract-images, protect, OCR, …). The worker
 * now ships from our own origin (public/pdf.worker.min.mjs, copied from
 * the installed package by scripts/copy-pdf-worker.js on postinstall),
 * so it can never 404 independently of the library version. Same-origin
 * also removes the CORS failure mode and keeps the offline PWA story true.
 *
 * Takes the pdfjs namespace as an argument (type-only import above, so
 * this module adds zero bytes) — works for both static and dynamic
 * (lazy) pdfjs-dist imports. Idempotent per page load.
 */
export const PDF_WORKER_SRC = '/pdf.worker.min.mjs';

export function setupPdfWorker(pdfjsLib: {
  GlobalWorkerOptions: { workerSrc: string };
}): void;
export function setupPdfWorker(pdfjsLib: typeof PdfjsLib): void;
export function setupPdfWorker(pdfjsLib: {
  GlobalWorkerOptions: { workerSrc: string };
}): void {
  if (pdfjsLib.GlobalWorkerOptions.workerSrc !== PDF_WORKER_SRC) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
  }
}
