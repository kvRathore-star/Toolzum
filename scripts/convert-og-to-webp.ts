#!/usr/bin/env node
/** Converts public/og PNGs to WebP via sharp (quality 80). One-off migration; re-run safe (skips existing). */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, join, relative } from 'path';
import sharp from 'sharp';

const OG_DIR = resolve('public/og');
const QUALITY = 80; // WebP quality (80 is good balance of size/quality)

async function convertPngToWebP(pngPath: string, webpPath: string): Promise<boolean> {
  try {
    const buffer = readFileSync(pngPath);
    const webpBuffer = await sharp(buffer)
      .webp({ quality: QUALITY })
      .toBuffer();
    
    writeFileSync(webpPath, webpBuffer);
    return true;
  } catch (error) {
    console.error(`Failed to convert ${pngPath}:`, error);
    return false;
  }
}

async function processDirectory(dir: string): Promise<{ converted: number; skipped: number; errors: number }> {
  let converted = 0;
  let skipped = 0;
  let errors = 0;
  
  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      const result = await processDirectory(fullPath);
      converted += result.converted;
      skipped += result.skipped;
      errors += result.errors;
    } else if (entry.isFile() && entry.name.endsWith('.png')) {
      const webpPath = fullPath.replace(/\.png$/, '.webp');
      
      // Skip if WebP already exists
      if (existsSync(webpPath)) {
        skipped++;
        continue;
      }
      
      const success = await convertPngToWebP(fullPath, webpPath);
      if (success) {
        converted++;
        const relPath = relative(OG_DIR, fullPath);
        console.log(`✓ Converted: ${relPath}`);
      } else {
        errors++;
      }
    }
  }
  
  return { converted, skipped, errors };
}

async function main() {
  console.log('=== Converting OG images to WebP ===\n');
  console.log(`Source: ${OG_DIR}`);
  console.log(`Quality: ${QUALITY}\n`);
  
  const startTime = Date.now();
  const result = await processDirectory(OG_DIR);
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('\n=== Conversion complete ===');
  console.log(`Converted: ${result.converted} images`);
  console.log(`Skipped: ${result.skipped} (already exist)`);
  console.log(`Errors: ${result.errors}`);
  console.log(`Duration: ${duration}s`);
  
  // Calculate size savings
  console.log('\n=== Size comparison ===');
  // This would require reading all files, skip for now
}

main().catch(console.error);
