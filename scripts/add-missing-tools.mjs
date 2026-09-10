#!/usr/bin/env node
/**
 * Appends 32 missing tool entries (ids 245-276) to rawToolsRegistry and
 * adds their slugs to the proSlugs list.
 *
 * Run: node scripts/add-missing-tools.mjs (historical one-off, do not re-run).
 * Reads/writes: src/registry/tools.ts.
 */
// HISTORICAL one-off: appended missing tool entries to the old registry. Do not re-run (paths stale).
import fs from 'fs';

const registryPath = 'src/registry/tools.ts';
let content = fs.readFileSync(registryPath, 'utf-8');

const newEntries = [
  { name: 'WebP to PNG Converter', slug: 'webp-to-png', desc: 'Converts WebP images to standard PNG format with full transparency support. Designers and web developers use it when they need to use WebP-sourced assets in applications or contexts that only accept PNG. It preserves the original resolution and all alpha channel data during conversion.', category: 'Image', id: '245', deps: 'Canvas API' },
  { name: 'JFIF to PNG Converter', slug: 'jfif-to-png', desc: 'Converts JFIF (JPEG File Interchange Format) images to standard PNG format without quality loss. Photographers and graphic designers use it to normalize JPEG-derived formats before editing or archival. It strips the JFIF wrapper and saves as a clean PNG with sRGB color profile.', category: 'Image', id: '246', deps: 'Canvas API' },
  { name: 'HEIC to PNG Converter', slug: 'heic-to-png', desc: 'Converts Apple HEIC/HEIF images to universally compatible PNG format with a batch queue for processing multiple photos. iPhone users and cross-platform workers who need to share HEIC photos with Windows or Android recipients use it for seamless compatibility. It preserves EXIF metadata and processes Live Photos by extracting the primary still frame.', category: 'Image', id: '247', deps: 'libheif WASM' },
  { name: 'Image to JPG Converter', slug: 'convert-to-jpg', desc: 'Converts any image format — PNG, WebP, BMP, GIF, TIFF — to standard JPG with configurable quality settings. Social media managers and web developers use it to unify mixed-format image sets into JPG before uploading to bandwidth-sensitive platforms. It automatically fills transparency with a white background since JPG does not support alpha channels.', category: 'Image', id: '248', deps: 'Canvas API' },
  { name: 'Rotate Image Online', slug: 'rotate-image', desc: 'Rotates images left or right by 90-degree increments instantly in the browser with no upload required. Photography editors and graphic designers fixing horizon-alignment issues or reorienting mobile-captured photos use it for quick corrections. The tool preserves the full image resolution and EXIF orientation metadata after rotation.', category: 'Image', id: '249', deps: 'Canvas API' },
  { name: 'Blur Face Online', slug: 'blur-face', desc: 'Detects faces in uploaded images using AI-powered computer vision and applies an adjustable blur effect to each detected face. Privacy-conscious journalists, content creators, and real-estate photographers use it to anonymize people in public photos before publishing. It supports multiple face detection and lets you toggle individual face blur on or off.', category: 'Image', id: '250', deps: 'AI API' },
  { name: 'HTML to Image Converter', slug: 'html-to-image', desc: 'Renders custom HTML and CSS markup into downloadable PNG, JPG, or SVG images directly in the browser. Frontend developers and marketers use it to generate dynamic social-media cards, email headers, or quote graphics without a design tool. It captures the DOM at the exact pixel dimensions specified and supports Google Fonts and CSS animations.', category: 'Developer', id: '251', deps: 'html2canvas' },
  { name: 'Apple Music Preview Extractor', slug: 'apple-music-preview-extractor', desc: 'Extracts publicly available 30-to-90-second audio preview clips from Apple Music by resolving the store URL. Music curators, reviewers, and content creators use it to obtain short audio snippets for commentary, reviews, or playlist previews. The extractor pulls the highest-bitrate AAC preview available from Apple\'s CDN.', category: 'Audio', id: '252', deps: 'fetch API' },
  { name: 'Twitch Thumbnail Downloader', slug: 'twitch-thumbnail-downloader', desc: 'Downloads the publicly cached preview thumbnail images from Twitch streams, clips, and videos by parsing the Twitch CDN URL pattern. Streamers and content managers use it to grab high-resolution thumbnails for promotional posts, video compilations, or social media. It offers all available thumbnail sizes from 160x90 up to 1920x1080.', category: 'Downloader', id: '253', deps: 'fetch API' },
  { name: 'Dailymotion Downloader', slug: 'dailymotion-downloader', desc: 'Downloads Dailymotion videos in multiple quality options by extracting direct MP4 stream URLs from the video metadata. Video archivists and content curators use it to save embedded Dailymotion clips before they are removed or made private. It lists every available resolution from 240p to 4K and reports file sizes before download.', category: 'Video', id: '254', deps: 'fetch API' },
  { name: 'AI Placeholder Content Generator', slug: 'ai-placeholder-content-generator', desc: 'Generates realistic placeholder text, blog posts, product descriptions, and website copy using AI from a few keyword prompts. Web designers and content strategists use it to populate wireframes and mockups with natural-sounding filler content instead of lorem ipsum. Each generation includes configurable tone options, word count, and section headings.', category: 'AI', id: '255', deps: 'AI API' },
  { name: 'AI Brand Color Palette Generator', slug: 'brand-color-palette-generator', desc: 'Generates harmonious brand color palettes with hex codes, color meanings, and suggested usage contexts based on industry and mood inputs. Startup founders and graphic designers use it to build professional color systems without color theory expertise. Each palette includes primary, secondary, accent, neutral, and surface colors with contrast ratio validation.', category: 'Design', id: '256', deps: 'AI API' },
  { name: 'Marriage Biodata Maker', slug: 'marriage-biodata-maker', desc: 'Creates printable matrimonial biodata forms with sections for personal details, family background, education, career, and partner preferences. Indian families and matchmaking services use it to prepare standardized biodata sheets for rishta portals and matrimonial events. The output is a clean A4-printable PDF with customizable accent colors and photo placement.', category: 'indian-utilities', id: '257', deps: 'jsPDF' },
  { name: 'Rental Agreement Generator', slug: 'rental-agreement-generator', desc: 'Generates customizable rental lease and license agreements compliant with Indian property laws including leave-and-license and tenancy formats. Landlords, tenants, and property managers in India use it to draft standardized rental contracts without lawyer fees. It covers key clauses: security deposit, maintenance responsibilities, notice period, rent escalation, and stamp duty reference.', category: 'indian-utilities', id: '258', deps: 'jsPDF' },
  { name: 'Resume ATS Score Checker', slug: 'resume-ats-score-checker', desc: 'Analyzes uploaded resumes against a job description using AI to calculate an ATS compatibility score and provide actionable suggestions. Job seekers and career coaches use it to optimize resumes before applying to roles that use automated screening systems. It returns keyword match analysis, formatting recommendations, and a section-by-section breakdown of strengths.', category: 'AI', id: '259', deps: 'AI API' },
  { name: 'Instagram Media Downloader', slug: 'instagram-story-downloader', desc: 'Downloads Instagram posts, reels, and stories by resolving media URLs through Instagram\'s public oEmbed API. Social media managers and content creators use it to archive their own content or save public posts for offline reference. It supports both single and carousel posts and extracts the highest-resolution version of each image or video.', category: 'Downloader', id: '260', deps: 'fetch API' },
  { name: 'WhatsApp Toolkit', slug: 'whatsapp-toolkit', desc: 'Generates wa.me click-to-chat links, WhatsApp group invite links, QR codes for quick connections, and includes a chat analyzer and status text designer. Small business owners and customer support teams use it to streamline WhatsApp-based customer interactions and marketing campaigns. The chat analyzer extracts call-volume patterns from exported chat logs without uploading any data.', category: 'Utility', id: '261', deps: 'QRCode.js' },
  { name: 'Indian Document Enhancer', slug: 'indian-document-enhancer', desc: 'Enhances scanned images of Indian identification documents — Aadhaar, PAN, Voter ID, Driving License — for upload compliance on government and banking portals. Indian citizens and CA firms use it to adjust brightness, contrast, and DPI to meet the specific pixel and file-size requirements of each portal. It auto-crops to the document boundary and strips unnecessary background.', category: 'indian-utilities', id: '262', deps: 'Canvas API' },
  { name: 'AI Complaint Letter Generator', slug: 'ai-complaint-letter-generator', desc: 'Generates AI-powered formal complaint letters and legal notices tailored to Indian consumer protection, banking, and service scenarios. Indian consumers and legal aid professionals use it to draft structured complaints to companies, banks, insurance providers, and government authorities. Each letter references the applicable Indian law or regulation and includes placeholders for supporting document attachments.', category: 'indian-utilities', id: '263', deps: 'AI API' },
  { name: 'Indian Voice Transcriber', slug: 'indian-voice-transcriber', desc: 'Transcribes recorded audio into text with support for 12 Indian languages using browser-based speech recognition. Journalists, researchers, and field workers in India use it to convert interviews, meetings, and dictations in Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Urdu, Odia, and English. It segments the transcript by detected speaker changes and exports as SRT or plain text.', category: 'indian-utilities', id: '264', deps: 'Web Speech API' },
  { name: 'Bank Statement Analyser', slug: 'bank-statement-analyser', desc: 'Parses uploaded bank statement PDFs or CSV exports and categorizes transactions into income, expense, and transfer categories with visual spending breakdowns. Personal finance managers and small business owners use it to understand spending patterns and create budgets without manually tagging transactions. It generates monthly trend charts, top-merchant reports, and an exportable categorized transaction table.', category: 'Utility', id: '265', deps: 'PDF.js' },
  { name: 'AI Resume Tailor', slug: 'ai-resume-tailor', desc: 'Rewrites resume sections to better match a specific job description by highlighting relevant keywords, reordering bullet points, and adjusting tone. Job seekers and recruitment consultants use it to customize applications for each role without rewriting the entire resume from scratch. It preserves factual accuracy while optimizing for ATS keyword matching and recruiter scanning patterns.', category: 'AI', id: '266', deps: 'AI API' },
  { name: 'AI Legal Agreement Generator', slug: 'ai-legal-agreement-generator', desc: 'Generates legally sound agreement templates for Indian contexts including NDAs, rental agreements, employment contracts, service level agreements, and partnership deeds. Startup founders and freelancers in India use it to create enforceable legal documents without engaging a lawyer for routine contracts. Each generated agreement includes jurisdiction-specific clauses, dispute resolution mechanisms, and e-signature placeholders.', category: 'indian-utilities', id: '267', deps: 'AI API' },
  { name: 'Social Media Calendar', slug: 'social-media-calendar', desc: 'Lets users plan and schedule social media posts across multiple platforms in a visual calendar view with draft, scheduled, and published status tracking. Social media managers and content teams use it to maintain a consistent posting cadence across Instagram, Twitter, LinkedIn, and Facebook. It supports drag-to-reorder posts, content templates, and CSV export of the full content plan.', category: 'Utility', id: '268', deps: 'localStorage' },
  { name: 'Bulk Background Changer', slug: 'bulk-bg-changer', desc: 'Removes or replaces backgrounds on multiple images simultaneously with color-key sampling and batch processing. E-commerce photographers and product listing teams use it to standardize product photo backgrounds across an entire catalog in one operation. It supports color replacement, transparent background removal, and uniform color fill with configurable tolerance.', category: 'Image', id: '269', deps: 'Canvas API' },
  { name: 'AI Background Changer', slug: 'ai-bg-changer', desc: 'Removes and replaces image backgrounds using edge-aware detection algorithms that separate foreground subjects without a green screen. Content creators and real-estate photographers use it to swap backgrounds on portraits, product shots, and property photos for listings or social media. It offers a manual refine mode for touch-ups on complex edges like hair or foliage.', category: 'Image', id: '270', deps: 'Canvas API' },
  { name: 'Link in Bio Builder', slug: 'link-in-bio-builder', desc: 'Creates customizable link-in-bio landing pages with profile photo, bio, multiple social media links, and custom icon selection. Instagram creators and TikTok influencers use it to build a central hub linking to all their content, stores, and affiliate pages. The output is a self-contained HTML file that can be hosted on GitHub Pages, Vercel, or any static host.', category: 'Branding', id: '271', deps: 'None' },
  { name: 'IST Time Converter', slug: 'ist-time-converter', desc: 'Converts Indian Standard Time (IST) to other major world time zones and performs UTC-to-IST and IST-to-UTC conversions with DST awareness. Remote teams working with Indian colleagues and travelers planning calls or flights to/from India use it to accurately translate time across zones. It displays the current IST offset and highlights overlapping business hours between IST and the selected target zone.', category: 'Utility', id: '272', deps: 'None' },
  { name: 'Audio Converter', slug: 'audio-converter', desc: 'Converts audio files between MP3, WAV, OGG, and FLAC formats using FFmpeg WASM running entirely in the browser. Podcasters and audio editors use it to normalize file formats across a production pipeline without installing desktop software. It preserves ID3 metadata tags during conversion and displays estimated file size changes before processing.', category: 'Audio', id: '273', deps: 'FFmpeg WASM' },
  { name: 'PDF Page Manager', slug: 'pdf-page-manager', desc: 'Manages PDF pages with crop, organize, extract, rotate, and delete operations in a single unified interface with visual page thumbnails. Office administrators and legal professionals use it to clean up scanned PDFs, reorder pages, and prepare documents for submission. It renders a thumbnail strip of all pages and supports keyboard shortcuts for bulk operations on large documents.', category: 'PDF', id: '274', deps: 'pdf-lib' },
  { name: 'Bulk QR Code Generator', slug: 'bulk-qr-code-generator', desc: 'Processes a CSV file containing multiple data entries and generates a corresponding QR code image for each row, delivered as a ZIP archive. Event organizers and inventory managers use it to create batch-printed QR codes for nametags, asset tags, or product labels without manual repetition. The generator supports four encoding modes (URL, text, vCard, WiFi credentials) and appends a sequential filename prefix so each QR code maps back to its original CSV row.', category: 'Utility', id: '275', deps: 'qrcode.js, JSZip' },
  { name: 'PDF AI Summariser', slug: 'pdf-ai-summariser', desc: 'Uploads a PDF document, extracts its full text via OCR and native parsing, then sends the content to an LLM for a condensed summary highlighting key findings and conclusions. Researchers and business analysts use it to extract actionable insights from lengthy reports, whitepapers, or academic papers in seconds instead of hours. The summariser handles scanned PDFs with embedded images and allows the user to specify summary length and tone (executive, technical, or plain language).', category: 'AI', id: '276', deps: 'AI API, PDF.js' },
];

// Find where to insert (before the closing `];` of rawToolsRegistry)
const insertPoint = content.lastIndexOf('\n];\n\nconst proSlugs');

if (insertPoint === -1) {
  console.error('Could not find insertion point');
  process.exit(1);
}

let entryStrings = '';
for (const e of newEntries) {
  entryStrings += `  {\n    name: '${e.name}',\n    slug: '${e.slug}',\n    description: '${e.desc.replace(/'/g, "\\'")}',\n    category: '${e.category}',\n    id:  "${e.id}",\n    dependencies: '${e.deps}'\n  },\n`;
}

content = content.slice(0, insertPoint) + '\n' + entryStrings + content.slice(insertPoint + 1);

// Also update proSlugs
const proSlugsEnd = content.indexOf('\n];\n\nexport const toolsRegistry');
const proSlugsStart = content.lastIndexOf('\n  "generic-pdf-processor"', proSlugsEnd);
const newProSlugs = [
  'youtube-thumbnail-downloader', 'whatsapp-toolkit', 'bulk-bg-changer', 'ai-bg-changer',
  'link-in-bio-builder', 'bulk-qr-code-generator', 'pdf-ai-summariser',
  'resume-ats-score-checker', 'ai-resume-tailor', 'ai-legal-agreement-generator',
  'social-media-calendar', 'bank-statement-analyser', 'instagram-story-downloader',
  'indian-document-enhancer', 'ai-complaint-letter-generator', 'indian-voice-transcriber',
  'twitch-thumbnail-downloader', 'dailymotion-downloader', 'ai-placeholder-content-generator',
  'brand-color-palette-generator', 'marriage-biodata-maker', 'rental-agreement-generator',
  'audio-converter', 'pdf-page-manager'
];

const existingProSlugsEnd = content.indexOf('\n];\n\nexport const toolsRegistry', proSlugsStart);
const existingProSlugs = content.slice(proSlugsStart, existingProSlugsEnd);

// Get the last line before ];
const lastProLine = existingProSlugs.trimEnd();
let insertion = lastProLine;
for (const slug of newProSlugs) {
  if (!content.includes(`"${slug}"`)) {
    insertion += `,\n  "${slug}"`;
  }
}
insertion += '\n';

content = content.slice(0, proSlugsStart) + insertion + content.slice(existingProSlugsEnd);

fs.writeFileSync(registryPath, content, 'utf-8');
console.log(`Added ${newEntries.length} missing tools to registry`);
