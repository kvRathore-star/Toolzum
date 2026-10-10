/**
 * Copies the gif.js worker from the installed package into public/ so the
 * app serves it same-origin (mirrors scripts/copy-pdf-worker.js). The
 * ImageCatchAllConverter loads it as workerScript for GIF encoding.
 * Runs on postinstall: a gif.js.optimized version bump self-heals.
 */
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'node_modules', 'gif.js.optimized', 'dist', 'gif.worker.js');
const dest = path.join(__dirname, '..', 'public', 'gif.worker.js');

try {
  fs.copyFileSync(src, dest);
  console.log(`✓ gif.worker copied (${(fs.statSync(dest).size / 1024).toFixed(0)}KB)`);
} catch (e) {
  console.warn(`! gif.worker copy failed (non-fatal for non-GIF work): ${e.message}`);
}
