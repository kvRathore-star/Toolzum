import Link from "next/link";
import { ChevronRight, HelpCircle, BookOpen, Layers, ArrowRight } from "lucide-react";
import type { ToolMetadata } from "@/registry/tools";
import { getShortDescription } from "@/lib/generateToolDescription";
import { requiresCloudApi, classifyDependencies, LOCAL_TRUST_CLAIM, FORMAT_INFO } from "@/lib/cloudPatterns";
import { proSlugs } from "@/registry/tools-constants";
import { DOWNLOAD_PRODUCING_SLUGS } from "@/lib/downloadProducingSlugs";
import { UNIT_FAMILIES } from './modules/shared/unitFamilies';

interface ToolPageSEOContentProps {
  tool: ToolMetadata;
  relatedTools?: ToolMetadata[];
}

const broadTypes = new Set(['generator', 'checker', 'tester', 'builder']);

type InteractionPattern =
  | { pattern: 'upload-convert-download'; inputType: string }
  | { pattern: 'upload-process-download' }
  | { pattern: 'enter-values-result' }
  | { pattern: 'paste-text-process-copy' }
  | { pattern: 'upload-edit-visual-download' }
  | { pattern: 'ai-generate' }
  | { pattern: 'click-generate'; hasOptions: boolean }
  | { pattern: 'set-start-alert' }
  | { pattern: 'measure-read' }
  | { pattern: 'play-interact' }
  | { pattern: 'other' };

const ZERO_INPUT_TOOLS = new Set(['dice-roller', 'coin-flipper', 'password-strength-checker']);

const KNOWN_INPUT_TYPES = new Set([
  'pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'bmp', 'tiff', 'tif', 'svg', 'avif', 'ico', 'jxl',
  'mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'wmv', 'm4v', 'mpg', 'mpeg', '3gp', 'video',
  'mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma', 'opus', 'aiff', 'audio',
  'json', 'xml', 'csv', 'yaml', 'yml', 'toml', 'ini', 'env',
  'doc', 'docx', 'word', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp',
  'epub', 'mobi', 'txt', 'rtf', 'md', 'markdown',
  'zip', 'rar', '7z', 'tar', 'gz',
  'css', 'html', 'htm', 'js', 'ts', 'jsx', 'tsx',
  'sql', 'graphql', 'proto',
  'apng', 'psd', 'cbz', 'eml', 'scss',
  'base64', 'hex', 'rgb', 'hsl',
  'text', 'image', 'speech', 'scan', 'url', 'tailwind',
  'slack', 'handwriting', 'sqlite',
  'csv/excel', 'odt/rtf',
]);

const ACTION_VERBS = /^(add|remove|crop|merge|split|rotate|compress|extract|insert|delete|batch|import)\s/i;

export function deriveInteractionPattern(tool: ToolMetadata): InteractionPattern {
  const n = tool.name.toLowerCase();
  const s = tool.slug;
  const dep = (tool.dependencies || '').toLowerCase();
  const cat = (tool.category || '').toLowerCase();

  const fileDeps = ['ffmpeg', 'pdf-lib', 'heic2any', 'jszip', 'cropper.js', 'exifr', 'tesseract', 'pdf2json', 'pdf2docx', 'sheetjs', 'jspdf', 'pptxgenjs', 'html2canvas', 'canvas api', 'sharp'];
  const hasFileInput = fileDeps.some(d => dep.includes(d)) || ['pdf', 'image', 'video', 'audio', 'archive', 'document', 'transcription'].includes(cat);

  if (hasFileInput && (n.includes('compress') || n.includes('merge') || n.includes('split') || n.includes('lock') || n.includes('unlock') || n.includes('stamp') || n.includes('watermark') || n.includes('protect') || n.includes('rotate') || n.includes('extract') || n.includes('resize') || n.includes('crop') || n.includes('remove') || n.includes('enhance') || n.includes('trim') || n.includes('cut') || n.includes('filter') || n.includes('batch') || n.includes('record') || n.includes('add text') || n.includes('add page') || n.includes('normaliz') || n.includes('reduc') || n.includes('blur') || n.includes('redact') || n.includes('anonymiz') || n.includes('pixelat') || n.includes('screenshot') || n.includes('snapshot') || n.includes('capture') || n.includes('thumbnail') || n.includes('background') || n.includes('tint') || n.includes('bates') || n.includes('numbering') || n.includes('delete') || n.includes('annotat') || n.includes('bookmark') || n.includes('workflow') || n.includes('whiteout') || n.includes('create') || n.includes('add image') || n.includes('attach') || n.includes('advanced') || n.includes('suite') || n.includes('toolbox') || n.includes('bundle') || n.includes('strip') || n.includes('inject'))) {
    return { pattern: 'upload-process-download' };
  }

  const toMatch = n.match(/(.+?)\s+to\s+/i);
  if (toMatch && hasFileInput && !n.includes('speech')) {
    const raw = toMatch[1]!.trim();
    const inputType = raw.replace(/^(bulk|add)\s+/i, '').trim();
    if (!ACTION_VERBS.test(raw) && KNOWN_INPUT_TYPES.has(inputType.toLowerCase())) {
      return { pattern: 'upload-convert-download', inputType };
    }
  }
  if (s.includes('-to-') && hasFileInput && !n.includes('speech')) {
    const raw = s.split('-to-')[0];
    const inputType = raw!.replace(/^(bulk|add)/, '').trim();
    if (inputType && !ACTION_VERBS.test(inputType) && KNOWN_INPUT_TYPES.has(inputType.toLowerCase())) {
      return { pattern: 'upload-convert-download', inputType };
    }
  }
  // Canvas/Fabric = visual editor ONLY if tool name implies editing (not generating placeholders)
  if ((dep.includes('fabric') || dep.includes('cropper')) && (n.includes('edit') || n.includes('draw') || n.includes('crop') || n.includes('design'))) {
    return { pattern: 'upload-edit-visual-download' };
  }

  if (cat === 'calculator' || cat === 'finance' || cat === 'health') {
    return { pattern: 'enter-values-result' };
  }
  // Format converters with file input (e.g. audio-converter) convert files,
  // they don't take typed values — route them to the converter pattern.
  if (n.includes('converter') && hasFileInput) {
    return { pattern: 'upload-convert-download', inputType: cat };
  }
  // Text/code converters take pasted text, not typed numbers — paste-text
  // steps, not enter-values steps (Oct 5 audit: 14 tools like yaml-json
  // showed "fill in numbers, dates, measurements"). Unit/value converters
  // (length, currency, px-rem…) fall through to enter-values below.
  if (n.includes('converter') && !hasFileInput && /(text|code|css|scss|less|yaml|json|xml|markdown|html|case|phonetic|ascii|unicode|encoding|hex|jsx|tsx|sql|proto|schema)/i.test(`${n} ${s}`)) {
    return { pattern: 'paste-text-process-copy' };
  }
  if (n.includes('calculator') || n.includes('converter') && !hasFileInput) {
    return { pattern: 'enter-values-result' };
  }
  if (UNIT_FAMILIES[s]) {
    return { pattern: 'enter-values-result' };
  }

  // AI pattern: only match actual AI/API dependencies, not Web Audio API or fetch API
  const aiApiDeps = ['openai', 'anthropic', 'gemini', 'huggingface', 'replicate', 'stability', 'ai api', 'ai provider', 'real-esrgan', 'insightface', 'whisper', 'cf vectorize', 'stable diffusion'];
  const isAiDep = aiApiDeps.some(d => dep.includes(d)) || (dep.includes('api') && !dep.includes('web audio') && !dep.includes('fetch api') && !dep.includes('vanilla') && !dep.includes('canvas'));
  if (isAiDep || cat === 'ai') {
    return { pattern: 'ai-generate' };
  }
  if (n.includes('text to speech') || n.includes('tts') || n.includes('speech to text') || n.includes('transcri')) {
    return { pattern: 'ai-generate' };
  }

  if (ZERO_INPUT_TOOLS.has(s)) {
    return { pattern: 'click-generate', hasOptions: false };
  }
  if (n.includes('generator') || n.includes('maker') || n.includes('random') || n.includes('wheel') || n.includes('password') || n.includes('uuid') || n.includes('dice') || n.includes('coin') || n.includes('barcode') || n.includes('qr code') || n.includes('lorem')) {
    return { pattern: 'click-generate', hasOptions: true };
  }

  // Category-based patterns: only for categories where paste-text-process-copy is actually correct
  if (cat === 'developer' || cat === 'seo') {
    return { pattern: 'paste-text-process-copy' };
  }
  // Privacy tools: check name for text-processing intent, not just category
  if (cat === 'privacy' && (n.includes('encrypt') || n.includes('decrypt') || n.includes('hash') || n.includes('password') || n.includes('pgp') || n.includes('key'))) {
    return { pattern: 'paste-text-process-copy' };
  }
  // Text tools: check name for text-processing intent
  if (cat === 'text' && (n.includes(' formatter') || n.includes(' validator') || n.includes(' counter') || n.includes(' case') || n.includes(' revers') || n.includes(' clean') || n.includes(' sort') || n.includes(' find') || n.includes(' replac') || n.includes(' remov') || n.includes(' dedup'))) {
    return { pattern: 'paste-text-process-copy' };
  }
  if (dep.includes('fast-xml-parser') || dep.includes('json')) {
    return { pattern: 'paste-text-process-copy' };
  }

  // Oct 5 recheck: end-position rules below fire ONLY for tools that fell
  // through everything above (currently 'other') — they cannot hijack tools
  // already routed to upload/ai/click patterns.
  // Text/data tools take pasted content, not typed numbers.
  if (!hasFileInput && /(sort|slug|split|dedup|filter|analyz|shorten|anonymiz|extract|renam|merg|transpos|statistic|translat|null|morse|braille|csv)/i.test(`${n} ${s}`)) {
    return { pattern: 'paste-text-process-copy' };
  }
  // X-to-Y with text formats and no file input (json-to-csv, csv-to-json…).
  if (!hasFileInput && s.includes('-to-') && /(json|xml|csv|yaml|yml|markdown|md|html|txt|text)/i.test(s)) {
    return { pattern: 'paste-text-process-copy' };
  }
  // Form-fill/lookup tools take entered values (validators, checkers, builders, finders).
  if (!hasFileInput && /(valid|verify|checker|parser|finder|builder)/i.test(`${n} ${s}`)) {
    return { pattern: 'enter-values-result' };
  }
  // Timers count down/up and alert — dedicated honest steps.
  if (/timer|stopwatch|countdown|tabata|pomodoro/i.test(`${n} ${s}`)) {
    return { pattern: 'set-start-alert' };
  }
  // Measurement tools: click, wait, read.
  if (s === 'speed-test' || n.includes('speed test')) {
    return { pattern: 'measure-read' };
  }
  // Pickers choose then copy (color, emoji, yes/no).
  if (/picker/i.test(`${n} ${s}`)) {
    return { pattern: 'click-generate', hasOptions: true };
  }
  // Multi-output toolkits take pasted input (links, text) and produce copies.
  if (/toolkit/i.test(`${n} ${s}`)) {
    return { pattern: 'paste-text-process-copy' };
  }
  // SaaS compute tools take entered numbers (payback, ratios, scores).
  if (/payback|quick-ratio|rule-of-40|saas-metrics/i.test(s)) {
    return { pattern: 'enter-values-result' };
  }
  // Playable games: start, play moves, track score.
  if (/game|hangman|guessing|rock-paper|tic-tac|memory-match|snake|tetris|pong|chess|sudoku|quiz/i.test(`${n} ${s}`)) {
    return { pattern: 'play-interact' };
  }
  // Single-file visual editors (GIF editor): upload, edit frames, download.
  if (s === 'gif-editor') {
    return { pattern: 'upload-process-download' };
  }

  return { pattern: 'other' };
}

const interactionPatternTemplates: Record<string, ((inputType?: string) => { title: string; desc: string }[]) | { title: string; desc: string }[]> = {
  'upload-convert-download': (inputType?: string) => [
    { title: `1. Upload Your ${inputType || 'File'}`, desc: `Select a ${inputType || 'file'} from your device. Drag and drop or use the file browser to upload.` },
    { title: "2. Select Output Format", desc: "Choose your desired output format from the available options." },
    { title: "3. Convert & Download", desc: "Click convert to process locally, then download the result to your device." },
  ],
  'upload-process-download': [
    { title: "1. Upload Your File", desc: "Select a file from your device. Drag and drop or use the file browser to upload." },
    { title: "2. Adjust Settings", desc: "Configure the processing options — quality, dimensions, format, or compression level." },
    { title: "3. Process & Download", desc: "Click the process button to run the operation locally, then download the result." },
  ],
  'enter-values-result': [
    { title: "1. Enter Your Values", desc: "Fill in the input fields with your numbers, dates, or measurements." },
    { title: "2. See Instant Results", desc: "Results update automatically as you adjust your inputs." },
    { title: "3. Copy or Save", desc: "Copy the result to your clipboard or note it down for your use." },
  ],
  'paste-text-process-copy': [
    { title: "1. Paste Your Text", desc: "Enter your code, text, or data into the input area." },
    { title: "2. Click Process", desc: "Run the operation — format, validate, encode, convert, or analyze." },
    { title: "3. Copy the Result", desc: "Copy the output to your clipboard with one click." },
  ],
  'upload-edit-visual-download': [
    { title: "1. Upload an Image", desc: "Select an image from your device to load into the editor." },
    { title: "2. Edit on the Canvas", desc: "Use the visual tools to adjust, draw, add text, or apply effects." },
    { title: "3. Download Your Image", desc: "Export the finished image in your preferred format." },
  ],
  'ai-generate': [
    { title: "1. Enter Your Prompt", desc: "Describe what you want — text, image, voice, or translation." },
    { title: "2. Generate", desc: "Click generate and wait for the AI to process your request." },
    { title: "3. Download the Result", desc: "Review the output and download or copy it for your use." },
  ],
  'click-generate': [
    { title: "1. Set Options (if needed)", desc: "Adjust any available settings like length, format, or count." },
    { title: "2. Click Generate", desc: "Click the generate button to produce your output instantly." },
    { title: "3. Copy the Result", desc: "Copy the generated output to your clipboard." },
  ],
  'set-start-alert': [
    { title: "1. Set the Duration", desc: "Enter the work interval, break length, or countdown target." },
    { title: "2. Start the Timer", desc: "Hit start — timing uses the system clock, so switching tabs doesn't lose time." },
    { title: "3. Get Alerted", desc: "An alert fires at zero; laps and totals stay visible for your records." },
  ],
  'measure-read': [
    { title: "1. Click Go", desc: "Start the measurement — close bandwidth-heavy tabs first for an honest reading." },
    { title: "2. Wait for Completion", desc: "The test runs automatically against a nearby test endpoint." },
    { title: "3. Read Your Results", desc: "Compare the numbers against what your plan promises." },
  ],
  'play-interact': [
    { title: "1. Start Playing", desc: "Open the game — no signup, no download, runs instantly in your browser." },
    { title: "2. Make Your Moves", desc: "Tap, click, or type your guesses. Every round is generated fresh and fair." },
    { title: "3. Track Your Score", desc: "Wins, streaks, and best scores stay visible while you play." },
  ],
};

const fileProcessingCategories = new Set(['image', 'audio', 'video', 'pdf', 'converter', 'archive', 'document']);

const keywordTypeRules: [RegExp, string][] = [
  [/hash(?!tag)|hmac|checksum|md5|sha(?!rp)|ripemd|argon2|bcrypt|pbkdf2|digest|message\s*digest/i, 'hasher'],
  [/encrypt|decrypt|cipher/i, 'encoder'],
  [/convert|transcode|transpil/i, 'converter'],
  [/validate|validation|verify|verification/i, 'validator'],
  [/format|beautify|prettify|minif/i, 'formatter'],
  [/analyze|analyse|inspect/i, 'analyzer'],
  [/estimate|estimator|project/i, 'estimator'],
  [/decode|decoder/i, 'decoder'],
  [/encode|encoder/i, 'encoder'],
  [/build|construct|assemble/i, 'builder'],
  [/check|audit/i, 'checker'],
  [/lookup|search|find|resolve/i, 'lookup'],
  [/extract|pull|scrape/i, 'extractor'],
  [/calculate|compute|count/i, 'calculator'],
];

export function deriveInputAnswer(tool: ToolMetadata): string {
  const deps = (tool.dependencies || '').toLowerCase();
  const slug = tool.slug.toLowerCase();
  const category = (tool.category || '').toLowerCase();

  const fileDeps = ['ffmpeg', 'pdf-lib', 'heic2any', 'jszip', 'cropper.js', 'exifr', 'tesseract'];

  if (UNIT_FAMILIES[slug]) {
    return 'Enter a numeric value to convert — all unit conversions update instantly.';
  }

  if (fileDeps.some(d => deps.includes(d)) || fileProcessingCategories.has(category)) {
    return 'Upload a file from your device. Drag and drop or use the file picker to select your document.';
  }

  if (slug === 'iban-validator') {
    return 'Enter an IBAN (International Bank Account Number) to validate its format and structure.';
  }

  if (/lookup|whois|dns\b/.test(slug) || slug.includes('ssl')) {
    return 'Enter a URL, domain name, or IP address.';
  }
  if (slug.includes('checker') && !slug.includes('keyword') && !slug.includes('plagiarism')) {
    return 'Enter one or more URLs to analyze.';
  }
  if (slug === 'url-encoder' || slug === 'url-decoder') {
    return 'Enter a URL or text string to encode or decode.';
  }

  if (category === 'calculator' || category === 'finance' || category === 'health') {
    return 'Enter numeric values in the input fields — amounts, rates, or percentages.';
  }

  if (['generator', 'builder'].includes(deriveToolType(slug, tool.name, tool.description, category))) {
    return 'Configure your settings below — the output generates instantly.';
  }

  return 'Paste or type your content directly into the provided text area.';
}

function keywordType(name: string, description: string): string | null {
  const text = `${name} ${description}`.toLowerCase();
  for (const [pattern, type] of keywordTypeRules) {
    if (pattern.test(text)) return type;
  }
  return null;
}

function deriveToolType(slug: string, name: string, description: string, category?: string): string {
  const suffix = slug.split('-').pop() || '';
  const types: Record<string, string> = {
    generator: "generator", validator: "validator", calculator: "calculator",
    converter: "converter", formatter: "formatter", tester: "tester",
    analyzer: "analyzer", estimator: "estimator", hasher: "hasher",
    decoder: "decoder", encoder: "encoder", builder: "builder",
    maker: "builder", checker: "checker", lookup: "lookup",
    transformer: "converter", extractor: "extractor",
  };
  if (types[suffix]) {
    if (suffix === 'converter' && UNIT_FAMILIES[slug]) {
      return "calculator";
    }
    if (broadTypes.has(types[suffix])) {
      const kw = keywordType(name, description);
      if (kw) return kw;
    }
    return types[suffix];
  }
  return keywordType(name, description) || "default";
}

export function deriveSeoInstructionType(slug: string, name: string, description: string): string {
  if (slug === 'seo-preview-generator') return 'seo-preview';
  if (slug === 'keyword-density-checker') return 'seo-analyzer';
  if (slug.endsWith('-converter')) return 'seo-converter';
  if (slug.endsWith('-remover') || slug.endsWith('-cleaner') || slug.endsWith('-splitter')) return 'seo-cleanup';
  if (slug.endsWith('-checker')) return 'seo-checker';
  if (slug.endsWith('-analyzer') || slug.endsWith('-counter') || slug === 'keyword-planner-tool') return 'seo-analyzer';
  if (slug.endsWith('-generator') || slug.endsWith('-builder')) return 'seo-generator';
  const text = `${name} ${description}`.toLowerCase();
  if (text.includes('check') || text.includes('validate')) return 'seo-checker';
  if (text.includes('analyze') || text.includes('frequency')) return 'seo-analyzer';
  if (text.includes('clean') || text.includes('remove') || text.includes('split')) return 'seo-cleanup';
  if (text.includes('convert') || text.includes('transform')) return 'seo-converter';
  return 'seo-generator';
}

const typeInstructionTemplates: Record<string, { title: string; desc: string }[]> = {
  generator: [
    { title: "1. Configure Your Input", desc: "Set the parameters — name, length, count, or format — using the input controls provided." },
    { title: "2. Generate", desc: "Click the generate button to create your output. Results appear instantly." },
    { title: "3. Copy or Download", desc: "Copy the generated output to your clipboard or download it as a file." },
  ],
  validator: [
    { title: "1. Paste Your Data", desc: "Enter the value you want to validate — an API key, JWT, config file, or payload." },
    { title: "2. Run Validation", desc: "Click validate to check format, structure, length, and character constraints." },
    { title: "3. Review Results", desc: "See whether the input passed or failed validation, with details on any issues found." },
  ],
  calculator: [
    { title: "1. Enter Values", desc: "Fill in the numeric inputs — amounts, rates, counts, or time periods." },
    { title: "2. Compute", desc: "Results update instantly as you adjust inputs. All math runs client-side." },
    { title: "3. Export", desc: "Copy the computed result or download it for your records." },
  ],
  converter: [
    { title: "1. Provide Source Data", desc: "Upload a file or paste the data you want to convert." },
    { title: "2. Select Target Format", desc: "Choose the output format from the available options." },
    { title: "3. Get the Result", desc: "Your converted output is ready instantly. Copy or download it." },
  ],
  formatter: [
    { title: "1. Paste Unformatted Content", desc: "Enter your code, JSON, XML, or query into the input area." },
    { title: "2. Apply Formatting", desc: "Click format to beautify indentation, spacing, and structure." },
    { title: "3. Copy the Output", desc: "Copy the formatted result with proper indentation and line breaks." },
  ],
  tester: [
    { title: "1. Configure the Request", desc: "Set the URL, method, headers, and body for the test request." },
    { title: "2. Execute", desc: "Send the request and wait for the response." },
    { title: "3. Inspect the Response", desc: "View status code, headers, and body. Copy the response for debugging." },
  ],
  analyzer: [
    { title: "1. Provide Input", desc: "Paste the data you want to analyze — JSON, payload, or text content." },
    { title: "2. Analyze", desc: "Click analyze to compute size, structure, nesting, and key counts." },
    { title: "3. Review Insights", desc: "See detailed metrics about your input. Use findings to optimize." },
  ],
  estimator: [
    { title: "1. Set Parameters", desc: "Enter your base values — request volume, pricing, user count, or resource usage." },
    { title: "2. Calculate Estimate", desc: "Click estimate to compute projected costs, budgets, or usage." },
    { title: "3. Adjust and Compare", desc: "Tweak parameters to see how changes affect the estimate." },
  ],
  hasher: [
    { title: "1. Enter Input", desc: "Paste the key, text, or data you want to hash." },
    { title: "2. Select Algorithm", desc: "Choose the hashing algorithm — SHA-256, MD5, or HMAC." },
    { title: "3. Copy the Hash", desc: "Copy the resulting hash string for secure storage or verification." },
  ],
  decoder: [
    { title: "1. Enter Encoded Data", desc: "Paste the encoded string, token, or payload you want to decode." },
    { title: "2. Decode", desc: "Click decode to extract the original content from the encoded format." },
    { title: "3. Inspect Contents", desc: "View the decoded output with field-by-field breakdown." },
  ],
  encoder: [
    { title: "1. Enter Plain Data", desc: "Paste the text, binary, or structured data you want to encode." },
    { title: "2. Encode", desc: "Click encode to transform the data into the target encoding format." },
    { title: "3. Copy the Result", desc: "Copy the encoded output for transmission or storage." },
  ],
  builder: [
    { title: "1. Choose Components", desc: "Select the pieces you want to assemble — fields, options, and settings." },
    { title: "2. Build", desc: "Click build to construct the output from your configured components." },
    { title: "3. Copy or Deploy", desc: "Copy the generated output or configuration for use in your project." },
  ],
  checker: [
    { title: "1. Enter the Value to Check", desc: "Paste the URL, domain, code, or data you want to check." },
    { title: "2. Run the Check", desc: "Click check to evaluate the input against defined criteria." },
    { title: "3. View the Result", desc: "See the check result with pass/fail status and supporting details." },
  ],
  lookup: [
    { title: "1. Enter Your Query", desc: "Type the code, name, or identifier you want to look up." },
    { title: "2. Search", desc: "Click look up to find matching results from the built-in database." },
    { title: "3. Review Details", desc: "View the full result with all available fields and information." },
  ],
  extractor: [
    { title: "1. Upload Source File", desc: "Select the file or data you want to extract content from." },
    { title: "2. Extract", desc: "Click extract to pull specific data types — text, audio, or metadata." },
    { title: "3. Download", desc: "Save the extracted content as a separate file." },
  ],
};

const seoInstructionTypeTemplates: Record<string, { title: string; desc: string }[]> = {
  'seo-generator': [
    { title: "1. Configure Your Input", desc: "Enter or adjust the parameters — URLs, fields, options, or settings — that define what you want to generate." },
    { title: "2. Generate", desc: "Click generate to produce the output — sitemap, meta tags, schema markup, or structured data — from your configured inputs." },
    { title: "3. Copy or Deploy", desc: "Copy the generated code or file and paste it directly into your website, CMS, or project." },
  ],
  'seo-checker': [
    { title: "1. Enter the Data to Check", desc: "Paste a URL, domain, keyword, or list of links into the input field. Some tools accept bulk upload via CSV." },
    { title: "2. Run the Check", desc: "Click check to evaluate the input — status codes, redirects, keyword density, or canonical compliance — and get results instantly." },
    { title: "3. Review and Act", desc: "See pass/fail status, detailed metrics, and actionable insights. Export results as CSV or copy individual items." },
  ],
  'seo-analyzer': [
    { title: "1. Provide Your Content", desc: "Paste the text, headline, or keyword data you want to analyze into the input area." },
    { title: "2. Analyze", desc: "Click analyze to compute metrics — word frequency, keyword density, sentiment, character count, or SEO score." },
    { title: "3. Review Insights", desc: "View detailed results with charts and counts. Use the data to refine your content strategy." },
  ],
  'seo-cleanup': [
    { title: "1. Paste Your Text", desc: "Enter the messy or structured text you want to clean up — duplicate words, trailing spaces, extra whitespace, or delimited data." },
    { title: "2. Clean", desc: "Click to process — remove duplicates, normalize whitespace, split by delimiter, or strip trailing spaces." },
    { title: "3. Copy the Result", desc: "Your cleaned text is ready instantly. Copy it to your clipboard or download as a file." },
  ],
  'seo-converter': [
    { title: "1. Provide Source Content", desc: "Paste your HTML or plain text content into the input area. Both single entries and bulk text are supported." },
    { title: "2. Convert", desc: "Click convert to transform between formats — HTML to plain text or plain text to HTML with proper markup." },
    { title: "3. Copy the Output", desc: "Your converted content is ready to copy or download. Use it in your CMS, emails, or web pages." },
  ],
  'seo-preview': [
    { title: "1. Enter Page Details", desc: "Type your page title, meta description, and URL exactly as they would appear in search results." },
    { title: "2. Preview", desc: "See a live Google-style search snippet showing how your page will appear in SERP listings." },
    { title: "3. Optimize", desc: "Adjust the title and description length to fit snippet limits. Copy the final version for your CMS." },
  ],
};

function parseFormatPair(slug: string): { from: string; to: string } | null {
  const match = slug.match(/^([a-z0-9]+)-to-([a-z0-9]+)$/);
  if (!match) return null;
  const [, from = "", to = ""] = match;
  if (FORMAT_INFO[from] && FORMAT_INFO[to]) return { from, to };
  return null;
}

const categoryInstructionTemplates: Record<string, { title: string; desc: string }[]> = {
  "PDF": [
    { title: "1. Upload Your Document", desc: "Select and upload your PDF or document file using the drag-and-drop area or the file browser. Supported formats vary by tool." },
    { title: "2. Configure Processing Options", desc: "Adjust any available settings — output format, quality, password, or page range — to match your needs." },
    { title: "3. Download the Result", desc: "Click the process button to run the conversion locally, then download the output file to your device." },
  ],
  "Image": [
    { title: "1. Choose an Image", desc: "Upload an image from your device or paste a URL. Most tools support PNG, JPG, WebP, and HEIC formats." },
    { title: "2. Adjust Settings", desc: "Fine-tune parameters like quality, dimensions, filters, or compression level using the on-screen controls." },
    { title: "3. Save Your Image", desc: "Preview the result instantly, then download the processed image in your preferred format." },
  ],
  "Video": [
    { title: "1. Upload a Video File", desc: "Select a video file from your device. Supported formats include MP4, MOV, AVI, WebM, and MKV depending on the tool." },
    { title: "2. Configure Conversion", desc: "Choose output format, quality presets, resolution, or trim settings. All processing runs via FFmpeg WASM in your browser." },
    { title: "3. Download the Output", desc: "Wait for processing to complete — your file never leaves your machine. Download the converted video directly." },
  ],
  "Audio": [
    { title: "1. Upload Audio", desc: "Pick an audio file (MP3, WAV, OGG, M4A) or a video with audio track from your device." },
    { title: "2. Select Options", desc: "Choose output format, bitrate, or compression level. Changes apply instantly as you adjust settings." },
    { title: "3. Download", desc: "Save the processed audio file to your device. All conversion happens locally for complete privacy." },
  ],
  "Developer": [
    { title: "1. Paste or Upload Code", desc: "Enter your source code, text, or data directly into the editor, or upload a file from your machine." },
    { title: "2. Run the Tool", desc: "Click the process button to format, minify, convert, or analyze your input using built-in algorithms." },
    { title: "3. Copy or Export", desc: "Copy the result to your clipboard with one click, or download it as a file for later use." },
  ],
  "Text": [
    { title: "1. Enter Your Text", desc: "Type or paste your text content into the input area. Most tools support both direct entry and file upload." },
    { title: "2. Choose a Transformation", desc: "Select the desired operation — case conversion, translation, formatting, or analysis." },
    { title: "3. Copy the Result", desc: "Your transformed text appears instantly. Copy it to your clipboard or download as a text file." },
  ],
  "SEO": [
    { title: "1. Input Your Data", desc: "Enter your website URL, keywords, or content. Some tools also support bulk input via file upload." },
    { title: "2. Generate or Analyze", desc: "Click generate to produce sitemaps, meta tags, or robots.txt, or run analysis for keyword density and SEO scoring." },
    { title: "3. Export or Implement", desc: "Copy the generated code snippets or download the output file to deploy on your website." },
  ],
  "Privacy": [
    { title: "1. Enter Your Data", desc: "Type or paste sensitive content like passwords, notes, or text into the secure input field." },
    { title: "2. Run the Check", desc: "Click the analyze or generate button. All computation is done locally — nothing leaves your browser." },
    { title: "3. Review Results", desc: "View strength scores, encrypted output, or generated keys. Copy results to use in your applications." },
  ],
  "Finance": [
    { title: "1. Enter Financial Data", desc: "Fill in the required fields — amounts, rates, percentages, or time periods — depending on the calculator." },
    { title: "2. Review Computations", desc: "Results update instantly as you adjust inputs. All formulas are executed client-side for accuracy." },
    { title: "3. Export or Copy", desc: "Copy individual values or download your calculations for record-keeping or further analysis." },
  ],
  "AI": [
    { title: "1. Describe What You Need", desc: "Enter a detailed prompt describing the content you want to generate — text, code, images, or music." },
    { title: "2. Configure the AI", desc: "Select your preferred AI provider and model from the settings. An API key may be required." },
    { title: "3. Generate & Refine", desc: "Review the AI output, make adjustments, and regenerate as needed. Copy or download the final result." },
  ],
  "Utility": [
    { title: "1. Set Your Parameters", desc: "Configure the tool by entering a value, selecting options, or uploading a file depending on the specific operation." },
    { title: "2. Run the Operation", desc: "Click the primary action button — generate, convert, analyze, or calculate — to process your input instantly." },
    { title: "3. Use the Output", desc: "Copy the result to your clipboard, download it as a file, or apply it directly from the tool interface." },
  ],
  "Health": [
    { title: "1. Enter Your Health Data", desc: "Fill in your age, weight, height, gender, and other relevant metrics. All inputs are processed locally." },
    { title: "2. View Instant Results", desc: "Your health metrics — BMI, BMR, calorie needs, or body composition — are calculated instantly as you adjust your inputs." },
    { title: "3. Track or Export", desc: "Copy your results or take a screenshot for personal reference. No data is stored or shared." },
  ],
  "Calculator": [
    { title: "1. Input Your Numbers", desc: "Enter the values you want to calculate — amounts, measurements, dates, or mathematical expressions." },
    { title: "2. Compute Automatically", desc: "Results update in real time as you type. Every formula uses standard mathematical or financial logic." },
    { title: "3. Copy or Compare", desc: "Copy individual results or try different input combinations to compare outcomes side by side." },
  ],
  "Branding": [
    { title: "1. Enter Your Brand Details", desc: "Provide your brand name, tagline, colors, or social links depending on the tool you are using." },
    { title: "2. Customize the Design", desc: "Adjust layouts, fonts, colors, and formatting options to match your brand identity." },
    { title: "3. Export Your Asset", desc: "Download your brand asset as an image, PDF, or text file ready to use on your website or social media." },
  ],
  "Design": [
    { title: "1. Upload or Create Content", desc: "Start with an existing file or use the tool's built-in editor to create something new from scratch." },
    { title: "2. Adjust Design Properties", desc: "Modify dimensions, colors, typography, and layout using the visual controls provided." },
    { title: "3. Export in Your Format", desc: "Download your design in your preferred format — SVG, PNG, CSS, or HTML — at the quality you need." },
  ],
  "Transcription": [
    { title: "1. Upload Your Audio or Video", desc: "Select an audio or video file from your device. Supported formats include MP3, WAV, MP4, MOV, and M4A." },
    { title: "2. Transcribe Automatically", desc: "Click transcribe to convert speech to text. Processing time depends on file length and your device." },
    { title: "3. Copy or Export the Text", desc: "Review the generated transcript, make any corrections, and copy it to your clipboard or download as a text file." },
  ],
  "Productivity": [
    { title: "1. Organize Your Items", desc: "Add tasks, notes, or items you want to manage using the simple input interface." },
    { title: "2. Arrange and Prioritize", desc: "Reorder, categorize, or mark items as needed. Changes are saved locally in your browser." },
    { title: "3. Export Your Progress", desc: "Copy your organized items, export them as text, or keep using the tool for ongoing productivity." },
  ],
  "Converter": [
    { title: "1. Provide Source Data", desc: "Upload a file, paste content, or enter the data you want to convert into the tool." },
    { title: "2. Select Input and Output Formats", desc: "Choose the source format and the target format from the available options." },
    { title: "3. Convert and Download", desc: "Click convert to process your file locally, then download the output in your chosen format." },
  ],
};

export const categoryFaqTemplates: Record<string, ((tool: ToolMetadata) => { question: string; answer: string }[]) | { question: string; answer: string }[]> = {
  "PDF": (tool) => [
    { question: `What does ${tool.name} do?`, answer: `${tool.description} All processing runs locally in your browser — no files are uploaded to any server.` },
    { question: `Is ${tool.name} safe for confidential documents?`, answer: `Yes. Your PDFs never leave your device. All operations happen in-browser using pdf-lib or similar local libraries.` },
    { question: `What PDF formats does ${tool.name} support?`, answer: `Standard PDF files (versions 1.0–2.0). Encrypted or password-protected files may need to be unlocked first.` },
    { question: `Are there file size limits?`, answer: `No hard limits, but very large PDFs (500+ pages or 100MB+) may process slower on low-memory devices.` },
    { question: `Does ${tool.name} work offline?`, answer: `Yes. After the initial page load, all PDF processing runs completely offline.` },
  ],
  "Image": (tool) => [
    { question: `What does ${tool.name} do?`, answer: `${tool.description} All processing happens locally in your browser.` },
    { question: `Will ${tool.name} reduce my image quality?`, answer: `Quality depends on the operation. Lossless operations preserve original quality; compression or format conversion may reduce it based on your settings.` },
    { question: `What image formats does ${tool.name} support?`, answer: `Most tools support PNG, JPG, WebP, HEIC, GIF, and SVG. Check the tool interface for the exact list.` },
    { question: `Is my image data private?`, answer: `Yes. Images never leave your browser — all processing runs on your device.` },
    { question: `Can I batch process multiple images?`, answer: `Batch support depends on the specific tool. Check the upload area for multi-file support.` },
  ],
  "Video": (tool) => [
    { question: `What does ${tool.name} do?`, answer: `${tool.description} Runs locally in your browser using FFmpeg WASM.` },
    { question: `What video formats are supported?`, answer: `Common formats include MP4, MOV, AVI, WebM, MKV, and GIF. The exact list varies by tool.` },
    { question: `How long does video processing take?`, answer: `Depends on file size, your device's CPU, and the operation. Most conversions complete within seconds to a few minutes.` },
    { question: `Is my video data private?`, answer: `Yes. All processing happens locally — your videos never leave your device.` },
    { question: `What's the maximum file size?`, answer: `Free users can process up to 30MB. Signing in increases the limit to 150MB. Pro subscribers can process files up to 2GB.` },
  ],
  "Audio": (tool) => [
    { question: `What does ${tool.name} do?`, answer: `${tool.description} All audio processing runs locally in your browser.` },
    { question: `What audio formats are supported?`, answer: `Supported formats typically include MP3, WAV, OGG, M4A, FLAC, and audio tracks extracted from video files.` },
    { question: `Does ${tool.name} reduce audio quality?`, answer: `Quality depends on the bitrate and format you choose. Higher bitrates preserve more detail at the cost of larger file sizes.` },
    { question: `Is my audio data private?`, answer: `Yes. All audio processing happens locally in your browser using WebAssembly. No data is transmitted.` },
    { question: `How long does processing take?`, answer: `Most audio operations complete in seconds. Longer files or complex operations may take a bit longer.` },
  ],
  "Developer": (tool) => {
    // Network-dependent tools (DNS, CVE, cert, header lookups) query public
    // third-party APIs — the offline/local claims below would lie for them.
    const needsNet = requiresCloudApi(tool.dependencies || '');
    return [
      { question: `What does ${tool.name} do?`, answer: needsNet ? `${tool.description} Lookups run from your browser against public APIs.` : `${tool.description} All processing runs locally — no code is sent to any server.` },
      { question: `What programming languages are supported?`, answer: `Tools cover JavaScript, CSS, HTML, SQL, Python, JSON, XML, CSV, and more. Check the tool description for specifics.` },
      { question: `Can I process large code files?`, answer: `Yes. Since processing is local, performance depends on your device. Most operations handle large files without issue.` },
      { question: `Do the tools follow standard conventions?`, answer: `Yes. Formatters use well-known libraries (sql-formatter, Prettier-compatible patterns) and follow widely adopted rules.` },
      { question: `Can I use ${tool.name} offline?`, answer: needsNet ? `No — this tool queries live public APIs (DNS, certificate, vulnerability data), so it needs an internet connection. The page itself loads offline, but lookups won't run.` : `Yes. All developer tools work fully offline after the initial page load.` },
    ];
  },
  "Text": (tool) => [
    { question: `What does ${tool.name} do?`, answer: `${tool.description} All processing runs locally in your browser.` },
    { question: `Will my text be saved or shared?`, answer: `No. Your text stays on your device and is never sent to any server.` },
    { question: `What text transformations are available?`, answer: `Options include case changes, reversal, unicode styling, binary encoding, Morse code, and more depending on the tool.` },
    { question: `Can I upload a file instead of pasting?`, answer: `Many text tools support both direct input and file upload (.txt, .html, .csv, etc.).` },
    { question: `Is there a character limit?`, answer: `No hard limit, but very large documents (1M+ characters) may cause slower UI responsiveness.` },
  ],
  "SEO": (tool) => [
    { question: `What does ${tool.name} do?`, answer: `${tool.description} Results are generated instantly in your browser.` },
    { question: `Will these tools improve my search rankings?`, answer: `They help with technical SEO — auditing site health, analyzing content, identifying issues. They don't guarantee ranking changes.` },
    { question: `Can I test multiple URLs at once?`, answer: `Several tools support batch input — add multiple URLs or analyze entire pages in one go.` },
    { question: `Is my website data stored?`, answer: `No. All data stays in your browser and is never transmitted to our servers.` },
    { question: `Do I need technical knowledge?`, answer: `Basic SEO understanding helps, but most tools are straightforward — paste your data and get results.` },
  ],
  "Privacy": (tool) => [
    { question: `What does ${tool.name} do?`, answer: `${tool.description} All operations run locally — no data ever leaves your browser.` },
    { question: `Is my data truly private?`, answer: `Yes. Everything happens in your browser. No data is transmitted to any server, and nothing is stored.` },
    { question: `Is the cryptography secure?`, answer: `Encryption uses industry-standard AES (crypto-js) and OpenPGP.js. Key derivation uses PBKDF2 with configurable iterations.` },
    { question: `Can I use ${tool.name} offline?`, answer: `Yes. All privacy and security tools run completely offline after the initial page load.` },
    { question: `What happens to my data after I leave?`, answer: `Nothing — your data was never stored anywhere. It exists only in your browser's active memory while the page is open.` },
  ],
  "Finance": (tool) => [
    { question: `What does ${tool.name} do?`, answer: `${tool.description} All calculations run locally in your browser.` },
    { question: `How accurate are the calculations?`, answer: `All calculators use standard financial formulas and are accurate to two decimal places unless otherwise specified.` },
    { question: `Is this financial advice?`, answer: `No. These tools provide mathematical calculations for educational and planning purposes. Consult a financial advisor for professional advice.` },
    { question: `Can I save my calculation history?`, answer: `Some calculators include local storage for recent calculations. History stays on your device.` },
    { question: `Does this work offline?`, answer: `Yes. All finance calculators work offline. Currency converters require internet for live rates but include offline fallback data.` },
  ],
  "AI": (tool) => [
    { question: `What does ${tool.name} do?`, answer: `${tool.description} Requires an AI provider API key configured in AI Settings.` },
    { question: `Do I need an API key?`, answer: `Yes. Configure your OpenAI, Anthropic, or compatible provider key in the AI Settings panel.` },
    { question: `Is my prompt data private?`, answer: `Prompts are sent to the AI provider you configure. Choose a provider with a privacy policy you trust for sensitive content.` },
    { question: `Why is there a loading delay?`, answer: `AI generation requires network calls to the provider's API. Response time depends on the model and your internet speed.` },
    { question: `Can I use this for free?`, answer: `The tool is free, but you supply your own API key for the underlying AI service.` },
  ],
  "indian-utilities": (tool) => [
    { question: `What does ${tool.name} do?`, answer: `${tool.description} All processing happens locally in your browser.` },
    { question: `Is my personal data safe?`, answer: `Yes. All processing happens locally. Aadhaar and PAN data never leave your device.` },
    { question: `Can I use this for official purposes?`, answer: `These tools are for personal assistance only. Official verification should be done through government portals.` },
    { question: `Are the databases up to date?`, answer: `Lookup data is built into the page and updated periodically. For critical verifications, cross-check with official sources.` },
    { question: `Do I need internet access?`, answer: `Most tools work offline. Lookup tools (IFSC, pincode) may require internet for the most current data.` },
  ],
  "Extension": (tool) => [
    { question: `What does ${tool.name} do?`, answer: `${tool.description} The generator creates editable source code you can review before installing.` },
    { question: `Are the extensions safe?`, answer: `All generated extensions produce manifest files you can review. You control the code.` },
    { question: `Can I customize the output?`, answer: `Yes. The generator creates editable source code that you can modify before packaging.` },
    { question: `What browsers are supported?`, answer: `Generated extensions follow Manifest V3, compatible with Chrome, Edge, Brave, and other Chromium browsers.` },
    { question: `Will it work offline?`, answer: `Most generated extensions work offline, but some features may require internet connectivity.` },
  ],
  "Utility": (tool) => {
    // Oct 5 audit: static "Completely free with no usage limits" rendered on
    // 23 gated Utility tools. Answers now follow the tool's real tier/verdict.
    const gated =
      (DOWNLOAD_PRODUCING_SLUGS as Set<string>).has(tool.slug) ||
      (proSlugs as readonly string[]).includes(tool.slug) ||
      classifyDependencies(tool.dependencies || '') !== 'local';
    const freeAnswer = gated
      ? `Yes — free to start with no signup, under fair daily limits. Pro removes all limits.`
      : `Yes. Completely free with no usage limits, registration, or hidden charges.`;
    const localOnly = classifyDependencies(tool.dependencies || '') === 'local';
    return [
    { question: `What does ${tool.name} do?`, answer: `${tool.description} All processing runs locally in your browser.` },
    { question: `Is this tool free?`, answer: freeAnswer },
    { question: `Can I use this on mobile?`, answer: `Yes. All utility tools are fully responsive and work on any device.` },
    { question: `How is my privacy protected?`, answer: localOnly ? `Your data never leaves your browser. All processing runs locally.` : `Local features never leave your browser; server features are marked where they run.` },
    { question: `Does ${tool.name} work offline?`, answer: localOnly && !gated ? `Yes. After the initial page load, the tool runs entirely offline.` : `Core features work without a connection once loaded; downloads and server features check in online.` },
    ];
  },
  "Health": (tool) => [
    { question: `What does ${tool.name} do?`, answer: `${tool.description} All calculations run locally in your browser.` },
    { question: `Is this medical advice?`, answer: `No. These calculators provide estimates for educational and personal reference. Always consult a healthcare professional.` },
    { question: `How accurate are the results?`, answer: `Calculations follow established medical formulas (Mifflin-St Jeor, Harris-Benedict, etc.) and are accurate within standard clinical parameters.` },
    { question: `Is my health data private?`, answer: `Absolutely. All health data is processed locally. Nothing is stored, saved, or transmitted.` },
    { question: `What measurements do I need?`, answer: `Most health calculators require basic data like age, gender, height, weight, and activity level.` },
  ],
  "Calculator": (tool) => [
    { question: `What does ${tool.name} do?`, answer: `${tool.description} All calculations happen in your browser.` },
    { question: `How accurate are the results?`, answer: `All calculators use standard mathematical formulas with high precision. Results are rounded per the calculator's conventions.` },
    { question: `Can I use this for professional purposes?`, answer: `Yes for general calculations, but verify critical results independently.` },
    { question: `Is my data stored?`, answer: `No. All calculations happen in your browser — no data is stored on any server.` },
    { question: `Does ${tool.name} work offline?`, answer: `Yes. All calculator tools work completely offline after the initial page load.` },
  ],
  "Branding": (tool) => [
    { question: `What does ${tool.name} do?`, answer: `${tool.description} All processing runs locally in your browser.` },
    { question: `Can I customize the templates?`, answer: `Yes. Every brand asset tool lets you customize colors, fonts, layouts, and content.` },
    { question: `What file formats can I download?`, answer: `Output formats vary by tool and typically include PNG, SVG, PDF, HTML, and plain text.` },
    { question: `Is my brand information stored?`, answer: `No. All content is processed locally — nothing is saved on external servers.` },
    { question: `Can I use these commercially?`, answer: `Yes. All generated brand assets are yours to use for personal or commercial projects.` },
  ],
  "Design": (tool) => [
    { question: `What does ${tool.name} do?`, answer: `${tool.description} All processing runs locally in your browser.` },
    { question: `What file formats are supported?`, answer: `Most design tools support PNG, JPG, SVG, WebP, and CSS output.` },
    { question: `Will I lose quality during export?`, answer: `SVG and lossless PNG preserve full quality. JPG/WebP offer compression at adjustable quality levels.` },
    { question: `Is my design data saved?`, answer: `No. All design processing runs in your browser. Download before leaving the page.` },
    { question: `Do I need design experience?`, answer: `No. The tools are designed to be intuitive. Adjust controls and see changes in real time.` },
  ],
  "Transcription": (tool) => [
    { question: `What does ${tool.name} do?`, answer: `${tool.description} Audio and text are sent to our server for AI processing.` },
    { question: `How accurate is the transcription?`, answer: `Accuracy depends on audio quality, speaker clarity, and background noise. Clean recordings produce the best results.` },
    { question: `What audio formats are supported?`, answer: `Most tools support MP3, WAV, M4A, FLAC, and video formats like MP4 and MOV.` },
    { question: `Is my audio data private?`, answer: `Your audio is sent to our server for AI transcription and deleted after processing — it is never stored or shared.` },
    { question: `Can I edit the transcript?`, answer: `Yes. The generated text is fully editable — correct errors, add punctuation, and format before copying.` },
  ],
  "Productivity": (tool) => [
    { question: `What does ${tool.name} do?`, answer: `${tool.description} All data stays in your browser.` },
    { question: `Does this save my data?`, answer: `Data is saved locally in your browser's storage. Clearing browser data will remove saved information.` },
    { question: `Can I export my data?`, answer: `Yes. Most productivity tools offer copy-to-clipboard or download options.` },
    { question: `Do I need an account?`, answer: `No. All productivity tools work without registration. Everything stays on your device.` },
    { question: `Does ${tool.name} work offline?`, answer: `Yes. All productivity tools work fully offline after the initial page load.` },
  ],
  "Converter": (tool) => {
    // Oct 5 audit: static "No artificial limits" rendered on gated tools.
    const gatedC =
      (DOWNLOAD_PRODUCING_SLUGS as Set<string>).has(tool.slug) ||
      (proSlugs as readonly string[]).includes(tool.slug) ||
      classifyDependencies(tool.dependencies || '') !== 'local';
    return [
    { question: `What does ${tool.name} do?`, answer: `${tool.description} All conversions happen locally in your browser.` },
    { question: `What formats are supported?`, answer: `Format support depends on the specific converter. Check the tool description for supported input and output formats.` },
    { question: `Will I lose quality?`, answer: `Quality depends on the format pair. Lossless conversions preserve original quality; compressed formats offer adjustable quality.` },
    { question: `Is there a file size limit?`, answer: gatedC ? `Free tier carries fair file-size and daily limits, shown before you hit them. Pro removes all limits.` : `No artificial limits. Very large files may process slower depending on your device's memory.` },
    { question: `Are my files private?`, answer: `Yes. All conversions happen locally in your browser. Files never leave your device.` },
    ];
  },
};

const defaultInstructions = [
  { title: "1. Enter Your Input", desc: "Type, paste, or upload your data using the input controls provided in the tool interface above." },
  { title: "2. Configure Options", desc: "Adjust any available settings to customize the output according to your requirements." },
  { title: "3. Get Your Result", desc: "View the output instantly. Copy it to your clipboard or download it as a file for later use." },
];

/**
 * Fallback FAQs for tools with neither custom FAQs nor a category template
 * (16 tools, Oct 5 audit — all Growth & Marketing calculators today).
 * Generated from the tool's actual verdict + gating: the previous static
 * version promised "no usage limits" and "never uploaded" unconditionally —
 * false for any gated or cloud tool that ever lands here.
 */
export function defaultFaqsFor(tool: ToolMetadata): { question: string; answer: string }[] {
  const v = classifyDependencies(tool.dependencies || '');
  const isPro = (proSlugs as readonly string[]).includes(tool.slug);
  const gated =
    isPro || (DOWNLOAD_PRODUCING_SLUGS as Set<string>).has(tool.slug) || v !== 'local';
  const pro = isPro;
  return [
    {
      question: 'Is this tool free to use?',
      answer: gated
        ? 'Free to start with fair daily limits — no signup needed to try it. Pro removes all limits.'
        : 'Yes, completely free with no signup. No account, no credit card, no quotas.',
    },
    {
      question: 'How is my privacy protected?',
      answer:
        v === 'cloud'
          ? 'This tool uses cloud processing — data you submit is transmitted for processing.'
          : v === 'hybrid'
            ? 'Most processing runs locally; specific features use cloud AI and are marked.'
            : 'All processing happens locally in your browser. Your data is never uploaded to any server.',
    },
    {
      question: 'Can I use this tool offline?',
      answer:
        v === 'local'
          ? 'Yes. After the initial page load, the tool runs entirely offline without requiring an internet connection.'
          : 'The interface loads offline-capable, but processing needs a connection for server features.',
    },
    {
      question: 'Are there any usage limits?',
      answer:
        gated || pro
          ? 'The free tier carries fair daily limits, shown on the page before you hit them. Pro is unlimited.'
          : 'No quotas or restrictions.',
    },
    { question: "What are the system requirements?", answer: "Any modern web browser (Chrome, Firefox, Safari, Edge) on desktop or mobile. No installation needed." },
  ];
}

function getCategoryPath(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}

function getCategoryKey(category: string): string {
  const map: Record<string, string> = {
    "pdf": "PDF",
    "calculator": "Calculator",
    "image": "Image",
    "text": "Text",
    "developer": "Developer",
    "finance": "Finance",
    "utility": "Utility",
    "converter": "Converter",
    "video": "Video",
    "audio": "Audio",
    "branding": "Branding",
    "productivity": "Productivity",
    "privacy": "Privacy",
    "design": "Design",
    "transcription": "Transcription",
    "extension": "Extension",
    "seo": "SEO",
    "indian-utilities": "indian-utilities",
    "ai": "AI",
    "health": "Health",
  };
  const normalized = category.toLowerCase().replace(/\s+/g, "-");
  return map[normalized] || category;
}

const crossCategoryMap: Record<string, string[]> = {
  "PDF": ["Converter", "Image", "Text"],
  "Image": ["Design", "Branding", "PDF"],
  "Video": ["Audio", "Converter"],
  "Audio": ["Video", "Converter"],
  "Developer": ["SEO", "Utility", "Productivity"],
  "Text": ["AI", "Developer", "SEO"],
  "AI": ["Text", "Image"],
  "Utility": ["Developer", "Productivity", "Finance"],
  "Converter": ["PDF", "Image", "Video"],
  "Finance": ["indian-utilities", "Converter"],
  "SEO": ["Developer", "Branding", "Text"],
  "Privacy": ["Developer", "Utility", "Text"],
  "Branding": ["Design", "Image", "SEO", "Utility"],
  "Design": ["Branding", "Image", "Productivity"],
};

// Precomputed word arrays for every tool (name + description), built once at
// module load. The registry is static, so this is safe to compute eagerly.
export function ToolPageSEOContent({ tool, relatedTools = [] }: ToolPageSEOContentProps) {
  const categoryKey = getCategoryKey(tool.category);
  const allRelated = relatedTools.slice(0, 6);

  const displayCategory = tool.category.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  const pair = parseFormatPair(tool.slug);
  const formatSteps = pair ? [
    { title: `1. Upload Your ${FORMAT_INFO[pair.from]!.name} File`, desc: `Select a ${FORMAT_INFO[pair.from]!.name} file from your device. ${FORMAT_INFO[pair.from]!.fullName} files use ${FORMAT_INFO[pair.from]!.quality} encoding. Drag and drop or browse to upload.` },
    { title: `2. Convert to ${FORMAT_INFO[pair.to]!.name}`, desc: `The tool converts your ${FORMAT_INFO[pair.from]!.name} file to ${FORMAT_INFO[pair.to]!.name} format. ${FORMAT_INFO[pair.to]!.fullName} uses ${FORMAT_INFO[pair.to]!.quality} encoding — ${FORMAT_INFO[pair.to]!.bestFor}.` },
    { title: "3. Download the Result", desc: `Your converted ${FORMAT_INFO[pair.to]!.name} file is ready instantly. Download it to your device. Everything runs locally — nothing is uploaded to any server.` },
  ] : null;

  const toolType = deriveToolType(tool.slug, tool.name, tool.description, tool.category);
  const seoType = tool.category === 'SEO' ? deriveSeoInstructionType(tool.slug, tool.name, tool.description) : null;
  const interactionPattern = deriveInteractionPattern(tool);
  let patternSteps: { title: string; desc: string }[] | null = null;
  if (interactionPattern.pattern !== 'other') {
    const tmpl = interactionPatternTemplates[interactionPattern.pattern];
    if (typeof tmpl === 'function') {
      patternSteps = (tmpl as (inputType?: string) => { title: string; desc: string }[])((interactionPattern as { inputType?: string }).inputType);
    } else {
      patternSteps = tmpl as { title: string; desc: string }[];
    }
  }
  const steps = tool.instructions || formatSteps || patternSteps || (seoType && seoInstructionTypeTemplates[seoType]) || typeInstructionTemplates[toolType] || categoryInstructionTemplates[categoryKey] || defaultInstructions;
  const categoryFaqFn = categoryFaqTemplates[categoryKey];
  const baseFaqs = tool.faqs || (categoryFaqFn ? (typeof categoryFaqFn === 'function' ? (categoryFaqFn as (t: ToolMetadata) => { question: string; answer: string }[])(tool) : categoryFaqFn) : defaultFaqsFor(tool));
  const formatFaq = pair ? {
    question: `Why convert ${FORMAT_INFO[pair.from]!.name} to ${FORMAT_INFO[pair.to]!.name}?`,
    answer: `${FORMAT_INFO[pair.from]!.name} (${FORMAT_INFO[pair.from]!.fullName}) uses ${FORMAT_INFO[pair.from]!.quality} encoding and is best for ${FORMAT_INFO[pair.from]!.bestFor}. ${FORMAT_INFO[pair.to]!.name} (${FORMAT_INFO[pair.to]!.fullName}) uses ${FORMAT_INFO[pair.to]!.quality} encoding and excels at ${FORMAT_INFO[pair.to]!.bestFor}. Converting between them lets you take advantage of each format's strengths — for example, using a compressed format for sharing and a lossless format for editing. All conversion happens locally in your browser with no file size limits.`
  } : null;

  const requiresInternet = requiresCloudApi(tool.dependencies);
  const generatedDesc = getShortDescription(tool);
  const inputTypeFaqs: { question: string; answer: string }[] = [];
  // Tools with substantive custom FAQs stand on their own — the generated
  // intros below would only add template bulk on top. Thin tools keep them
  // as the safety net.
  const hasCustomDepth = (tool.faqs?.length ?? 0) >= 4;
  if (!pair && !hasCustomDepth) {
    inputTypeFaqs.push({
      question: `What exactly does ${tool.name} do?`,
      answer: `${tool.name} lets you ${generatedDesc.charAt(0).toLowerCase() + generatedDesc.slice(1)}. It works on any device with a modern web browser.`
    });
    inputTypeFaqs.push({
      question: `What can I use ${tool.name} for?`,
      answer: `${generatedDesc} It runs entirely in your browser — no software installation or data uploads required.`
    });
    inputTypeFaqs.push({
      question: `What kind of input does ${tool.name} accept?`,
      answer: deriveInputAnswer(tool)
    });
    inputTypeFaqs.push({
      question: `Does ${tool.name} work offline?`,
      answer: requiresInternet
        ? `No. ${tool.name} requires an internet connection because it uses cloud-based processing for its core functionality.`
        : `Yes. After the initial page load, ${tool.name} runs entirely on your device with no internet connection needed. All processing is done locally.`
    });
  }
  const rawFaqs = [
    ...(formatFaq ? [formatFaq] : []),
    ...inputTypeFaqs,
    ...baseFaqs,
  ];
  const topicPatterns: [RegExp, string][] = [
    [/offline/i, "offline"],
    [/\bfree\b/i, "free"],
    [/\bmobile\b/i, "mobile"],
    [/privacy|private|stored|uploaded/i, "privacy"],
    [/limit|size|large/i, "limits"],
    [/accurate|precision|decimal/i, "accuracy"],
    [/speed|fast|slow|long/i, "speed"],
    [/sign.?up|register|account/i, "registration"],
    [/safe|security|encrypt/i, "security"],
  ];
  const seenTopics = new Set<string>();
  const faqs = rawFaqs.filter((faq) => {
    let topic = "";
    for (const [pattern, label] of topicPatterns) {
      if (pattern.test(faq.question)) { topic = label; break; }
    }
    if (!topic) {
      topic = faq.question.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 30);
    }
    if (seenTopics.has(topic)) return false;
    seenTopics.add(topic);
    return true;
  });

  return (
    <div className="w-full mt-16 text-left space-y-16 border-t border-[var(--border-subtle)] pt-16">
      
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] flex items-center gap-2.5 pb-2">
          <BookOpen className="w-5 h-5 text-[var(--accent)]" />
          <span>How to Use the {tool.name}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-5 space-y-2">
              <h3 className="font-medium text-sm text-[var(--text-primary)]">{step.title}</h3>
              <p className="text-xs leading-relaxed text-[var(--text-secondary)]">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {allRelated.length > 0 && (
        <section className="space-y-6">
          <div className="flex justify-between items-center pb-2">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-[var(--accent)]" />
              <span>Similar Tools You Might Need</span>
            </h2>
            <Link 
              href={`/${tool.category.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              See all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allRelated.map((t) => (
              <Link 
                key={t.id} 
                href={`/${getCategoryPath(t.category)}/${t.slug}`}
                className="group p-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--border-default)] transition-all flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors mb-2">
                    {t.name}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {t.description}
                  </p>
                </div>
                <div className="text-[10px] font-semibold text-[var(--text-muted)] mt-4 flex items-center gap-1">
                  <span>Open Tool</span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-[2px] transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] flex items-center gap-2.5 pb-2">
          <HelpCircle className="w-5 h-5 text-[var(--accent)]" />
          <span>Frequently Asked Questions</span>
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-6">
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">{faq.question}</h3>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": tool.name,
              "description": generatedDesc,
              "applicationCategory": "WebApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0.00",
                "priceCurrency": "USD"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            }
          ])
        }}
      />
    </div>
  );
}
