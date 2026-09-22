/**
 * Copies the pdf.js worker from the installed package into public/ so the
 * app serves it same-origin (see src/lib/pdfjsWorker.ts). Runs on
 * postinstall: a pdfjs-dist version bump self-heals instead of 404ing like
 * the old per-tool cdnjs URLs did.
 */
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const dest = path.join(__dirname, '..', 'public', 'pdf.worker.min.mjs');

try {
  fs.copyFileSync(src, dest);
  console.log(`✓ pdf.worker copied (${(fs.statSync(dest).size / 1024).toFixed(0)}KB)`);
} catch (e) {
  console.warn(`! pdf.worker copy failed (non-fatal for non-PDF work): ${e.message}`);
}
