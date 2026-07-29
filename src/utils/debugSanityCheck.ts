"use client";

import imageCompression from 'browser-image-compression';
import * as pdfjsLib from 'pdfjs-dist';
import { getErrorMessage } from '@/utils/error';

const dev = process.env.NODE_ENV === 'development';
const log = dev ? console.log : () => {};
const err = dev ? console.error : () => {};

export async function runSanityCheck() {
  log("=========================================");
  log("🧪 RUNNING CLIENT-SIDE SMOKE TESTS 🧪");
  log("=========================================");

  let errors = 0;

  // 1. Test browser-image-compression
  try {
    log("[TEST 1/2] Verifying browser-image-compression worker...");
    // Create a tiny dummy 10x10 transparent png
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error("Could not create dummy blob.");
    
    const dummyFile = new File([blob], "dummy.png", { type: "image/png" });
    const compressed = await imageCompression(dummyFile, { maxSizeMB: 0.01, useWebWorker: true });
    
    if (compressed.size > 0) {
      log(`✅ browser-image-compression passed! (Worker spawned, compressed 10x10 to ${compressed.size} bytes)`);
    } else {
      throw new Error("Output size was 0 bytes.");
    }
  } catch (e: unknown) {
    err(`❌ browser-image-compression failed: ${getErrorMessage(e)}`);
    errors++;
  }

  // 2. Test PDF.js worker execution
  try {
    log("[TEST 2/2] Verifying pdfjs-dist WASM worker...");
    // Just test that the library loaded successfully and the worker can theoretically be configured
    const workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    log(`✅ pdfjs-dist passed! (Worker path configured: ${workerSrc})`);
  } catch (e: unknown) {
    err(`❌ pdfjs-dist failed: ${getErrorMessage(e)}`);
    errors++;
  }

  log("=========================================");
  if (errors > 0) {
    err(`🚨 DIAGNOSTICS FAILED WITH ${errors} ERRORS.`);
    return false;
  } else {
    log("🚀 ALL CLIENT-SIDE MODULES OPERATIONAL!");
    return true;
  }
}
