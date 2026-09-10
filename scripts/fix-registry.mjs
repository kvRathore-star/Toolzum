#!/usr/bin/env node
/**
 * Adds the youtube-thumbnail-downloader entry, removes 13 orphaned entries
 * and their proSlugs, then prints registry vs DynamicModuleWrapper counts.
 *
 * Run: node scripts/fix-registry.mjs (historical one-off, do not re-run).
 * Reads/writes: src/registry/tools.ts; reads DynamicModuleWrapper.tsx.
 */
// HISTORICAL one-off: registry repair script. Do not re-run.
import fs from 'fs';

const path = 'src/registry/tools.ts';
let content = fs.readFileSync(path, 'utf-8');

// 1. Add youtube-thumbnail-downloader before the closing ];
const newEntry = `  {
    name: 'YouTube Thumbnail Downloader',
    slug: 'youtube-thumbnail-downloader',
    description: 'Fetches and displays all available resolution variants of a YouTube video thumbnail — from default (120x90) up to maxresdefault (1920x1080) — given a video URL or ID. Content creators and social media managers use it to download high-resolution thumbnails for repurposing in video ads, blog embeds, or portfolio showcases. The tool extracts the video ID from any YouTube URL format and exposes all four thumbnail qualities plus the three storyboard frames in a single gallery view.',
    category: 'Downloader',
    id:  "277",
    dependencies: 'fetch API'
  },\n`;

const insertPoint = content.lastIndexOf('\n];\n');
content = content.slice(0, insertPoint) + '\n' + newEntry + content.slice(insertPoint + 1);

// 2. Remove orphaned entries
const orphans = [
  '"youtube-video-downloader-extension"', '"soundcloud-downloader"', '"online-timer"',
  '"twitch-clip-downloader"', '"color-picker-extension"', '"color-picker"', '"credit-card-generator"',
  '"ai-story-generator"', '"lorem-ipsum-generator"', '"bilibili-video-downloader"', '"flip-image"',
  '"multi-model-ai-chat"', '"ai-chat-hub"'
];

// Process line by line, skipping blocks that contain orphan slugs
const lines = content.split('\n');
const result = [];
let skipUntil = -1;

for (let i = 0; i < lines.length; i++) {
  if (i < skipUntil) continue;
  
  const line = lines[i];
  const trimmed = line.trim();
  
  // Check if this line starts a block with an orphan slug
  if (trimmed === '{') {
    let isOrphan = false;
    let depth = 1;
    let j = i + 1;
    while (j < lines.length && depth > 0) {
      for (const ch of lines[j]) {
        if (ch === '{') depth++;
        if (ch === '}') depth--;
      }
      // Check for orphan slug
      for (const slug of orphans) {
        if (lines[j].includes(`slug: ${slug}`)) {
          isOrphan = true;
          break;
        }
      }
      if (isOrphan) break;
      j++;
    }
    
    if (isOrphan) {
      // Skip this entire block
      skipUntil = j + 1;
      continue;
    }
  }
  
  result.push(line);
}

content = result.join('\n');

// 3. Remove orphan slugs from proSlugs
for (const slug of orphans) {
  const slugVal = slug.replace(/"/g, '');
  const regex = new RegExp(`\\s*"${slugVal}"\\s*,?`, 'g');
  content = content.replace(regex, '');
}
content = content.replace(/,\s*\n\];/, '\n];');

fs.writeFileSync(path, content, 'utf-8');

// Count results
const final = fs.readFileSync(path, 'utf-8');
const finalSlugs = [...final.matchAll(/slug:\s*["\x27]([^"\x27]+)["\x27],?/g)].length;
const dmw = fs.readFileSync('src/components/tools/modules/DynamicModuleWrapper.tsx', 'utf-8');
const dmwSlugs = [...dmw.matchAll(/["\x27]([a-z][a-z0-9_-]+)["\x27]\s*:\s*dynamic/g)].map(m => m[1]);
const regSlugsSet = new Set([...final.matchAll(/slug:\s*["\x27]([^"\x27]+)["\x27],?/g)].map(m => m[1]));
const dmwSet = new Set(dmwSlugs);

console.log(`Registry tools: ${finalSlugs}`);
console.log(`DMW entries: ${dmwSlugs.length}`);
console.log(`Only in registry (missing DMW): ${finalSlugs > 0 ? [...regSlugsSet].filter(s => !dmwSet.has(s)).length : 0}`);
console.log(`Only in DMW (missing registry): ${[...dmwSet].filter(s => !regSlugsSet.has(s)).length}`);
