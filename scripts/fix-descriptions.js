#!/usr/bin/env node
/**
 * Rewrites X-to-Y converter descriptions plus a small specials-by-slug map
 * in the registry; leaves other descriptions untouched.
 *
 * Run: node scripts/fix-descriptions.js (historical one-off, paths stale).
 * Reads/writes: src/registry/tools.ts.
 */
// HISTORICAL one-off: description fixes against the old registry. Paths stale.
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TOOLS_PATH = path.join(ROOT, "src/registry/tools.ts");

let content = fs.readFileSync(TOOLS_PATH, "utf-8");

function makeDescription(name, slug) {
  const lower = name.toLowerCase().trim();

  const fm = lower.match(/^(\w+)\s+to\s+(\w+)/);
  if (fm) {
    const [_, from, to] = fm.map(s => s.toLowerCase());
    const fU = from.toUpperCase(), tU = to.toUpperCase();
    const video = ["mkv","mp4","mov","webm","avi"];
    const audio = ["mp3","wav","flac","ogg","m4a","aac","wma","opus","aiff"];
    const image = ["jpg","jpeg","png","webp","heic","avif","svg","bmp","tiff","gif","ico","jxl"];

    if (video.includes(from) && video.includes(to))
      return `Convert ${fU} video files to ${tU} format directly in your browser. 100% free, private — your files never leave your device.`;
    if (audio.includes(from) && audio.includes(to))
      return `Convert ${fU} audio files to ${tU} format directly in your browser. High-quality conversion with no file size limits. Private and free.`;
    if (image.includes(from) || image.includes(to))
      return `Convert ${fU} images to ${tU} format in your browser. Lossless, private, and completely free — no uploads needed.`;
    return `Convert ${fU} to ${tU} online for free. Fast, browser-based conversion with no uploads needed. 100% private.`;
  }

  const specials = {
    "crop-video": "Crop videos to custom dimensions directly in your browser. Remove unwanted edges, adjust aspect ratio, and export in MP4 format. Free and private.",
    "archive-converter": "Extract and convert archives (ZIP, RAR, 7z, TAR, GZ) online. Extract files or convert between archive formats directly in your browser. Free and secure.",
    "text-to-speech-tts": "Convert text to natural-sounding speech using browser-based speech synthesis. Download as audio or listen instantly. Supports multiple voices and languages.",
    "salary-calculator": "Calculate take-home salary after tax and deductions. Supports hourly, daily, weekly, monthly rates with customizable tax brackets.",
    "audio-cutter": "Cut and trim audio files online. Select start and end timestamps, apply crossfade, and download the trimmed result. Free and browser-based.",
    "speech-to-text": "Transcribe speech to text using browser-based speech recognition. Dictate notes, captions, or documents hands-free. No uploads needed.",
    "video-compressor": "Compress video files to reduce size while maintaining quality. Supports MP4, MOV, WebM. Adjust resolution, bitrate, and codec settings.",
    "video-to-gif": "Convert video clips to animated GIFs online. Trim start/end, resize, adjust frame rate, and download high-quality GIFs. Free and browser-based.",
    "employee-turnover-calculator": "Calculate employee turnover rate for your organization. Supports voluntary and involuntary separation tracking with period analysis.",
    "ip-anonymizer": "Anonymize IP addresses in log files or datasets. Supports IPv4 and IPv6 masking with configurable prefix preservation.",
  };

  if (specials[slug]) return specials[slug];
  return null;
}

// Find all entries and build replacements list
const replacements = [];
const regex = /(\n\s*\{[\s\S]*?id: "([^"]+)",[\s\S]*?name: "([^"]+)",[\s\S]*?slug: "([^"]+)",[\s\S]*?description: ')([^']*)(')/g;

let m;
while ((m = regex.exec(content)) !== null) {
  const [full, prefix, id, name, slug, currentDesc] = m;
  const newDesc = makeDescription(name, slug);
  if (newDesc && newDesc !== currentDesc) {
    replacements.push([m.index, full.length, prefix + newDesc + "'"]);
  } else if ((!currentDesc || currentDesc.length < 30) && slug && name) {
    const fallback = makeDescription(name, slug);
    if (fallback && fallback !== currentDesc) {
      replacements.push([m.index, full.length, prefix + fallback + "'"]);
    }
  }
}

// Apply in reverse order so indices don't shift
replacements.sort((a, b) => b[0] - a[0]);
const parts = [];
let lastEnd = content.length;
for (const [start, len, replacement] of replacements) {
  parts.push(content.slice(start + len, lastEnd));
  parts.push(replacement);
  lastEnd = start;
}
parts.push(content.slice(0, lastEnd));
content = parts.reverse().join("");

fs.writeFileSync(TOOLS_PATH, content, "utf-8");
console.log(`Updated ${replacements.length} descriptions.`);
