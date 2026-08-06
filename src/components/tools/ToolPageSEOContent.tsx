import Link from "next/link";
import { ChevronRight, HelpCircle, BookOpen, Layers, ArrowRight } from "lucide-react";
import { toolsRegistry, ToolMetadata } from "@/registry/tools";
import { getShortDescription } from "@/lib/generateToolDescription";
import { requiresCloudApi, LOCAL_TRUST_CLAIM, FORMAT_INFO } from "@/lib/cloudPatterns";
import { UNIT_FAMILIES } from './modules/shared/unitFamilies';

interface ToolPageSEOContentProps {
  tool: ToolMetadata;
}

const broadTypes = new Set(['generator', 'checker', 'tester', 'builder']);

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
  const [, from, to] = match;
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

export const categoryFaqTemplates: Record<string, { question: string; answer: string }[]> = {
  "PDF": [
    { question: "Are my PDFs private when using this tool?", answer: "Yes. All PDF processing happens entirely in your browser. Your files are never uploaded to any server, ensuring complete document privacy." },
    { question: "What PDF formats and versions are supported?", answer: "The tool works with standard PDF files. Most operations support both older and modern PDF versions. Encrypted or password-protected files may need to be unlocked first." },
    { question: "Can I process large PDF files?", answer: "Processing capacity depends on your device's available memory. Very large files (500+ pages or 100MB+) may cause slower performance on low-memory devices." },
    { question: "Is there a limit on how many PDFs I can process?", answer: "No. You can process unlimited PDF files daily. There are no quotas or usage caps since all computation happens on your own device." },
    { question: "Does this work offline?", answer: "Yes. After the initial page load, all PDF tools function completely offline — no internet connection is required." },
  ],
  "Image": [
    { question: "Will I lose image quality during processing?", answer: "Quality depends on the operation. Lossless operations preserve original quality, while compression and format conversion may slightly reduce quality based on your settings." },
    { question: "What image formats are supported?", answer: "Most tools support PNG, JPG, WebP, HEIC, GIF, and SVG. Some specialized tools may support additional formats." },
    { question: "Can I batch process multiple images?", answer: "Batch processing is available in select tools. For single-image tools, you can process them one at a time." },
    { question: "Where are my images processed?", answer: "Completely on your device. Images never leave your browser, ensuring your visual content stays private." },
    { question: "Is there a file size limit?", answer: "There's no hard limit, but very large images (4000x4000px+) may process slower on lower-end devices due to memory constraints." },
  ],
  "Video": [
    { question: "What video formats are supported?", answer: "Common formats include MP4, MOV, AVI, WebM, MKV, and GIF. The exact list varies by tool." },
    { question: "How long does video processing take?", answer: "Processing time depends on file size, your device's CPU, and the operation. Most conversions complete within seconds to a few minutes." },
    { question: "Is video quality preserved?", answer: "Quality depends on your selected settings. Higher bitrate and resolution presets produce better quality but larger file sizes." },
    { question: "Can I process videos offline?", answer: "Yes. All video processing uses FFmpeg WASM running locally in your browser. No uploads or servers involved." },
    { question: "What's the maximum video file size?", answer: "There's no imposed limit, but files over 500MB may require significant RAM and could perform slowly on older devices." },
  ],
  "Audio": [
    { question: "What audio formats can I convert?", answer: "Supported formats include MP3, WAV, OGG, M4A, FLAC, and audio tracks extracted from video files." },
    { question: "Does compression reduce audio quality?", answer: "Quality depends on the bitrate and format you choose. Higher bitrates preserve more detail at the cost of larger file sizes." },
    { question: "Is my audio data private?", answer: "Absolutely. All audio processing happens locally in your browser using WebAssembly. No data is transmitted." },
    { question: "Can I extract audio from video?", answer: "Yes. Several tools support extracting audio tracks from video files and saving them as standalone audio files." },
    { question: "How long does audio processing take?", answer: "Most audio operations complete in seconds. Longer files or complex compression may take a bit longer." },
  ],
  "Developer": [
    { question: "What programming languages are supported?", answer: "Tools cover JavaScript, CSS, HTML, SQL, Python, JSON, XML, CSV, and more. Check individual tool descriptions for specifics." },
    { question: "Is my code sent to a server?", answer: "No. All code processing — formatting, minification, conversion, hashing — runs locally in your browser." },
    { question: "Can I process large code files?", answer: "Yes. Since processing is local, performance depends on your device. Most operations handle large files without issue." },
    { question: "Do the formatting tools follow standard conventions?", answer: "Yes. SQL uses sql-formatter, JSON uses native JSON.parse, and other formatters follow widely adopted formatting rules." },
    { question: "Can I use these tools offline?", answer: "Yes. All developer tools work fully offline after the initial page load." },
  ],
  "Text": [
    { question: "Can I convert large amounts of text?", answer: "Yes. Text processing is extremely fast and can handle documents of any length your browser can display." },
    { question: "Will my text be saved or shared?", answer: "No. Your text stays on your device and is never sent to any server. We don't store your inputs." },
    { question: "What text transformations are available?", answer: "Options include case changes, reversal, unicode styling, binary encoding, Morse code, and handwriting simulation." },
    { question: "Can I upload a file instead of pasting text?", answer: "Many text tools support both direct input and file upload (.txt, .html, .csv, etc.)." },
    { question: "Is there a character limit?", answer: "There's no hard limit, but very large documents (1M+ characters) may cause slower UI responsiveness." },
  ],
  "SEO": [
    { question: "Will these tools improve my search rankings?", answer: "They help with technical SEO fundamentals — auditing site health, analyzing content structure, identifying broken links, and ensuring search engines can properly index your pages." },
    { question: "Can I test multiple URLs at once?", answer: "Yes. Several tools support batch input — add multiple URLs, analyze entire pages, or compare keywords in one go." },
    { question: "Is the output ready to use?", answer: "Yes. Results are presented immediately — you can copy, export, or act on them directly." },
    { question: "Do I need technical knowledge to use these?", answer: "Basic understanding of SEO concepts helps, but most tools are straightforward — paste your data and get results." },
    { question: "Are my website details stored anywhere?", answer: "No. All data stays in your browser and is never transmitted to our servers." },
  ],
  "Privacy": [
    { question: "How is my sensitive data protected?", answer: "All operations run locally in your browser. Passwords, notes, and cryptographic keys never leave your device." },
    { question: "Can I trust the password strength check?", answer: "Yes. It uses the zxcvbn library developed by Dropbox, which evaluates passwords against real-world attack patterns." },
    { question: "Is the encryption truly secure?", answer: "Yes. Encryption uses AES via crypto-js, and PGP key generation uses the OpenPGP.js library — both industry-standard cryptographic implementations." },
    { question: "What happens to my encrypted notes?", answer: "Encrypted notes are encoded into the URL hash fragment, which is never sent to servers. No data is stored on our side." },
    { question: "Can I use these tools offline?", answer: "Yes. All privacy and security tools run completely offline after the initial page load." },
  ],
  "Finance": [
    { question: "How accurate are the calculations?", answer: "All calculators use standard financial formulas and are accurate to two decimal places unless otherwise specified." },
    { question: "Can I save my calculation history?", answer: "Some calculators include local storage for recent calculations. History stays on your device and is not shared." },
    { question: "Are the results financial advice?", answer: "No. These tools provide mathematical calculations for educational and planning purposes. Consult a financial advisor for professional advice." },
    { question: "What currencies does the converter support?", answer: "The currency converter supports 160+ currencies with live exchange rates via a public API, plus an offline fallback matrix." },
    { question: "Can I use these offline?", answer: "Basic calculators work offline. The currency converter requires an internet connection for live rates but includes offline fallback data." },
  ],
  "AI": [
    { question: "Do I need an API key to use AI tools?", answer: "Some AI tools require a provider API key (OpenAI, Anthropic, etc.). Configure yours in the AI Settings panel." },
    { question: "What AI providers are supported?", answer: "Support depends on the tool. Most work with OpenAI-compatible APIs. Check the AI Settings for available providers." },
    { question: "Is my prompt data private?", answer: "Prompts are sent to the AI provider you configure. Choose a provider with a privacy policy you trust for sensitive content." },
    { question: "Why is there a loading delay?", answer: "AI generation requires network calls to the provider's API. Response time depends on the model and your internet speed." },
    { question: "Can I use these tools for free?", answer: "The tools are free to use, but you may need to supply your own API key for the underlying AI service." },
  ],
  "indian-utilities": [
    { question: "Is my personal data safe?", answer: "Yes. All processing happens locally in your browser. Aadhaar and PAN data never leave your device." },
    { question: "What Indian formats are supported?", answer: "Tools support Aadhaar card masking, PAN card verification, IFSC code lookup, pincode finder, and Indian age/percentage calculations." },
    { question: "Can I use these for official purposes?", answer: "These tools are for personal assistance only. Official verification should be done through government portals." },
    { question: "Are the IFSC and pincode databases up to date?", answer: "Lookup data is built into the page and updated periodically. For critical verifications, cross-check with official sources." },
    { question: "Do I need internet access?", answer: "PAN and Aadhaar tools work offline. IFSC and pincode lookups require internet for the most current data." },
  ],
  "Extension": [
    { question: "How do I install these extensions?", answer: "Download the extension files and follow your browser's developer mode extension installation guide." },
    { question: "Are the extensions safe to use?", answer: "All generated extensions run manifest files you can review before installing. You control the code." },
    { question: "Can I customize the generated extension?", answer: "Yes. The generator creates editable source code that you can modify before packaging." },
    { question: "What browsers are supported?", answer: "Generated extensions follow the Manifest V3 standard, compatible with Chrome, Edge, Brave, and other Chromium-based browsers." },
    { question: "Will the extension work offline?", answer: "Most generated extensions work offline, but some features (like downloaders) require internet connectivity." },
  ],
  "Utility": [
    { question: "Is this utility tool free to use?", answer: "Yes, every utility tool on Toolzum is completely free with no usage limits, registration, or hidden charges." },
    { question: "Can I use this tool on mobile?", answer: "Yes. All utility tools are fully responsive and work on any device — phone, tablet, or desktop." },
    { question: "How is my privacy protected?", answer: "Your data never leaves your browser. All processing runs locally and nothing is stored or uploaded." },
    { question: "Does this tool work offline?", answer: "Yes. After the initial page load, the tool runs entirely offline in your browser." },
    { question: "Are there any file size limits?", answer: "Most tools don't impose limits. For file-based tools, performance depends on your device's available memory." },
  ],
  "Health": [
    { question: "Is this a substitute for professional medical advice?", answer: "No. These calculators provide estimates for educational and personal reference. Always consult a healthcare professional for medical decisions." },
    { question: "How accurate are the calculations?", answer: "Calculations follow established medical formulas (Mifflin-St Jeor, Harris-Benedict, etc.) and are accurate within standard clinical parameters." },
    { question: "Is my health data private?", answer: "Absolutely. All health data is processed locally in your browser. Nothing is stored, saved, or transmitted." },
    { question: "What measurements do I need?", answer: "Most health calculators require basic data like age, gender, height, weight, and activity level — all processed instantly as you type." },
    { question: "Can I save or track my results over time?", answer: "Some tools save your last calculation locally. For ongoing tracking, export your results or use a dedicated health tracking app." },
  ],
  "Calculator": [
    { question: "How accurate are these calculators?", answer: "All calculators use standard mathematical and financial formulas with high precision. Results are rounded according to the specific calculator's conventions." },
    { question: "Can I use these calculators for professional purposes?", answer: "Yes for general calculations, but verify critical results independently. Specialized scenarios may require professional-grade tools." },
    { question: "Is my data stored or saved?", answer: "No. All calculations happen in your browser and no data is stored on any server." },
    { question: "Do I need to sign up or register?", answer: "No registration is needed. All calculators are free to use with no account required." },
    { question: "Can I use these offline?", answer: "Yes. All calculator tools work completely offline after the initial page load." },
  ],
  "Branding": [
    { question: "Can I customize the templates?", answer: "Yes. Every brand asset tool lets you customize colors, fonts, layouts, and content to match your brand identity." },
    { question: "What file formats can I download?", answer: "Output formats vary by tool and typically include PNG, SVG, PDF, HTML, and plain text depending on the asset type." },
    { question: "Are there brand usage guidelines included?", answer: "Some tools include usage recommendations. For professional branding, consult a brand guidelines document for consistency." },
    { question: "Is my brand information stored?", answer: "No. All content is processed locally in your browser and nothing is saved on external servers." },
    { question: "Can I use these for commercial projects?", answer: "Yes. All generated brand assets are yours to use for personal or commercial projects with no restrictions." },
  ],
  "Design": [
    { question: "What file formats are supported?", answer: "Most design tools support PNG, JPG, SVG, WebP, and CSS output. Input support varies by tool." },
    { question: "Will I lose quality during export?", answer: "Export quality depends on your settings. SVG and lossless PNG preserve full quality, while JPG/WebP offer compression at adjustable quality levels." },
    { question: "Can I use the designs commercially?", answer: "Yes. All designs you create are yours to use for any personal or commercial project." },
    { question: "Is my design data saved?", answer: "No. All design processing runs in your browser. Save your work by downloading before leaving the page." },
    { question: "Do I need design experience?", answer: "No. The tools are designed to be intuitive. Adjust visual controls and see changes in real time." },
  ],
  "Transcription": [
    { question: "How accurate is the transcription?", answer: "Accuracy depends on audio quality, speaker clarity, background noise, and the specific engine used. Clean recordings produce the best results." },
    { question: "What audio formats are supported?", answer: "Most transcription tools support MP3, WAV, M4A, FLAC, and video formats with audio tracks like MP4 and MOV." },
    { question: "Is there a file length limit?", answer: "File length limits vary by tool. Longer files may have size constraints or require more processing time depending on your device." },
    { question: "Is my audio data private?", answer: "Transcription runs locally using WebAssembly speech recognition where possible. Audio data stays on your device." },
    { question: "Can I edit the transcript after processing?", answer: "Yes. The generated text is editable — you can correct errors, add punctuation, and format it before copying or downloading." },
  ],
  "Productivity": [
    { question: "Does this tool save my data automatically?", answer: "Data is saved locally in your browser's storage. Clearing your browser data will remove saved information." },
    { question: "Can I export my data?", answer: "Yes. Most productivity tools offer copy-to-clipboard or download options to export your tasks, notes, or lists." },
    { question: "Do I need an account?", answer: "No. All productivity tools work without registration or login. Everything stays on your device." },
    { question: "Can I use this on multiple devices?", answer: "Data is stored per device in your local browser. Cross-device sync is not available since no account or cloud storage is used." },
    { question: "Does this work offline?", answer: "Yes. All productivity tools work fully offline after the initial page load." },
  ],
  "Converter": [
    { question: "What formats can I convert between?", answer: "Format support depends on the specific converter tool. Check the tool description for supported input and output formats." },
    { question: "Will I lose quality during conversion?", answer: "Quality depends on the format pair. Lossless conversions preserve original quality, while compressed formats apply adjustable quality settings." },
    { question: "Is there a file size limit?", answer: "No artificial limits are imposed. Very large files may process slower depending on your device's memory and processing power." },
    { question: "Are my files private during conversion?", answer: "Yes. All conversions happen locally in your browser using WebAssembly. Files never leave your device." },
    { question: "Can I batch convert multiple files?", answer: "Batch conversion availability depends on the specific tool. Check the tool interface for multi-file upload support." },
  ],
};

const defaultInstructions = [
  { title: "1. Enter Your Input", desc: "Type, paste, or upload your data using the input controls provided in the tool interface above." },
  { title: "2. Configure Options", desc: "Adjust any available settings to customize the output according to your requirements." },
  { title: "3. Get Your Result", desc: "View the output instantly. Copy it to your clipboard or download it as a file for later use." },
];

const defaultFaqs: { question: string; answer: string }[] = [
  { question: "Is this tool free to use?", answer: "Yes, this tool is completely free with no usage limits, registration, or credit card required." },
  { question: "How is my privacy protected?", answer: "All processing happens locally in your browser. Your data is never uploaded to any server." },
  { question: "Can I use this tool offline?", answer: "Yes. After the initial page load, the tool runs entirely offline without requiring an internet connection." },
  { question: "Are there any usage limits?", answer: "No. You can use this tool unlimited times with no quotas or restrictions." },
  { question: "What are the system requirements?", answer: "Any modern web browser (Chrome, Firefox, Safari, Edge) on desktop or mobile. No installation needed." },
];

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

export function ToolPageSEOContent({ tool }: ToolPageSEOContentProps) {
  const categoryKey = getCategoryKey(tool.category);

  function rankRelated(t: ToolMetadata): number {
    const toolWords = new Set((tool.name + ' ' + tool.description).toLowerCase().split(/\W+/).filter(w => w.length > 2));
    const candidateWords = (t.name + ' ' + t.description).toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const intersection = candidateWords.filter(w => toolWords.has(w)).length;
    return intersection;
  }

  const candidates = toolsRegistry.filter(t => t.slug !== tool.slug);
  const sameCategory = candidates.filter(t => t.category === tool.category);
  const crossCategory = candidates.filter(t => t.category !== tool.category);

  const rankedSame = sameCategory.sort((a, b) => rankRelated(b) - rankRelated(a)).slice(0, 4);
  const rankedCross = crossCategory.sort((a, b) => rankRelated(b) - rankRelated(a)).slice(0, 3);

  const allRelated = [...rankedSame.slice(0, 3), ...rankedCross.slice(0, 2)].slice(0, 6);

  const displayCategory = tool.category.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

  const pair = parseFormatPair(tool.slug);
  const formatSteps = pair ? [
    { title: `1. Upload Your ${FORMAT_INFO[pair.from].name} File`, desc: `Select a ${FORMAT_INFO[pair.from].name} file from your device. ${FORMAT_INFO[pair.from].fullName} files use ${FORMAT_INFO[pair.from].quality} encoding. Drag and drop or browse to upload.` },
    { title: `2. Convert to ${FORMAT_INFO[pair.to].name}`, desc: `The tool converts your ${FORMAT_INFO[pair.from].name} file to ${FORMAT_INFO[pair.to].name} format. ${FORMAT_INFO[pair.to].fullName} uses ${FORMAT_INFO[pair.to].quality} encoding — ${FORMAT_INFO[pair.to].bestFor}.` },
    { title: "3. Download the Result", desc: `Your converted ${FORMAT_INFO[pair.to].name} file is ready instantly. Download it to your device. Everything runs locally — nothing is uploaded to any server.` },
  ] : null;

  const toolType = deriveToolType(tool.slug, tool.name, tool.description, tool.category);
  const seoType = tool.category === 'SEO' ? deriveSeoInstructionType(tool.slug, tool.name, tool.description) : null;
  const steps = tool.instructions || formatSteps || (seoType && seoInstructionTypeTemplates[seoType]) || typeInstructionTemplates[toolType] || categoryInstructionTemplates[categoryKey] || defaultInstructions;
  const baseFaqs = tool.faqs || categoryFaqTemplates[categoryKey] || defaultFaqs;
  const formatFaq = pair ? {
    question: `Why convert ${FORMAT_INFO[pair.from].name} to ${FORMAT_INFO[pair.to].name}?`,
    answer: `${FORMAT_INFO[pair.from].name} (${FORMAT_INFO[pair.from].fullName}) uses ${FORMAT_INFO[pair.from].quality} encoding and is best for ${FORMAT_INFO[pair.from].bestFor}. ${FORMAT_INFO[pair.to].name} (${FORMAT_INFO[pair.to].fullName}) uses ${FORMAT_INFO[pair.to].quality} encoding and excels at ${FORMAT_INFO[pair.to].bestFor}. Converting between them lets you take advantage of each format's strengths — for example, using a compressed format for sharing and a lossless format for editing. All conversion happens locally in your browser with no file size limits.`
  } : null;

  const requiresInternet = requiresCloudApi(tool.dependencies);
  const generatedDesc = getShortDescription(tool);
  const inputTypeFaqs: { question: string; answer: string }[] = [];
  if (!pair) {
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
  const faqs = [
    ...(formatFaq ? [formatFaq] : []),
    ...inputTypeFaqs,
    ...baseFaqs,
  ];

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
