// HISTORICAL one-off: description expansion against the old registry. Paths stale.
import fs from "fs";

const filePath = "src/registry/tools.ts";
let content = fs.readFileSync(filePath, "utf-8");

// Category-specific description builders taking (name, slug) and returning a string
const builders = {
  PDF: (n) => [
    `Edit, convert, and manage your PDF documents right in your browser with ${n}. Merge multiple files, split pages, compress for smaller sizes, or convert to and from other formats. Everything is processed on your device — no uploads, no servers, and no file size limits beyond what your computer can handle.`,
    `${n} gives you full control over PDF documents without installing any software. Rotate pages, add watermarks, extract images, or unlock password-protected files. Your documents stay on your machine and are never transmitted anywhere. Works with standard PDF files of any size.`,
    `Work with PDF files directly in your browser using ${n}. Whether you need to compress a large document, convert it to a different format, or rearrange pages, the tool handles everything locally. Your sensitive documents never leave your computer, making it suitable for confidential materials.`,
  ],
  Image: (n) => [
    `${n} lets you edit and transform your photos and graphics directly in your browser. Resize batches of images, convert between formats, remove backgrounds, or add text overlays. All processing uses your device's own power — nothing is uploaded, stored, or shared with anyone.`,
    `Transform your images with ${n} without uploading them anywhere. Compress for web use, convert between PNG, JPG, WebP and more, or apply creative effects. Every edit happens locally on your machine, so your original files stay private and under your control.`,
    `Edit images on the fly with ${n}. Resize for social media, crop to specific dimensions, change file formats, or enhance colors. Processing is instant because everything runs right where you are — no waiting for uploads or dealing with server queues.`,
  ],
  Video: (n) => [
    `${n} handles video conversion and editing entirely in your browser. Trim clips, convert between MP4, MOV, WebM and other formats, extract audio, or compress files for smaller sizes. The processing runs on your own hardware — no uploads, no queues, and no file size limits.`,
    `Process video files without uploading them anywhere using ${n}. Compress large recordings for sharing, convert to different formats, or extract frames and audio tracks. Everything is done locally using your computer's processor, keeping your footage completely private.`,
    `${n} brings professional video tools to your browser. Cut and trim footage, change aspect ratios, adjust quality settings, or convert between formats. All computation happens on your device, so your videos never leave your computer.`,
  ],
  Audio: (n) => [
    `${n} processes audio files directly in your browser. Convert between MP3, WAV, OGG and other formats, compress for smaller sizes, or extract audio tracks from videos. Your files stay on your device — no uploads or server-side processing involved.`,
    `Convert and edit audio files privately with ${n}. Change formats, adjust quality settings, compress for storage, or trim unwanted sections. Everything runs locally, so your audio never leaves your computer.`,
  ],
  Developer: (n) => [
    `${n} provides essential developer utilities that run completely in your browser. Format and minify code, convert between data formats, generate hashes, or validate syntax. Your code never leaves your machine — processing happens locally for speed and privacy.`,
    `Work with code and data directly in your browser using ${n}. Format JSON and XML, convert between CSV and other formats, generate regex patterns, or compute checksums. Everything runs on your device with no server calls.`,
    `${n} brings common developer tools to your browser without any setup. Parse and validate data structures, encode and decode strings, or generate configuration files. Works offline and keeps your code private.`,
  ],
  Text: (n) => [
    `${n} transforms text directly in your browser. Convert case, change encoding, generate lorem ipsum, or apply creative text styles. Your content stays on your device — nothing is stored or sent to any server. Simple, fast, and private.`,
    `Manipulate text instantly with ${n}. Whether you need to reverse a string, count words and characters, or convert between text formats, the tool responds as you type. All processing is local and your data never leaves your browser.`,
  ],
  Finance: (n) => [
    `${n} performs financial calculations right in your browser. Compute loan payments, calculate investment returns, convert currencies, or generate invoices. All formulas run locally — your financial data stays private and never touches a server.`,
    `Handle everyday financial math with ${n}. Calculate GST and taxes, compare loan options, or create professional receipts and invoices. Results update instantly as you adjust numbers, and your data never leaves your device.`,
  ],
  Utility: (n) => [
    `${n} is a handy browser-based utility for everyday tasks. No installation or sign-up needed — just open the page and use it. Everything runs locally, so your data stays private and the tool works even without an internet connection.`,
    `A straightforward browser tool that gets the job done. ${n} handles common tasks quickly and privately. Works offline, requires no account, and processes everything on your device.`,
  ],
  Converter: (n) => [
    `${n} converts files between formats directly in your browser. No uploads, no servers — just fast, private conversion that happens locally on your machine. Supports common formats and works offline.`,
    `Switch between file formats effortlessly with ${n}. The conversion happens entirely on your device, keeping your files private and making the process instant. No file size limits beyond what your computer can handle.`,
  ],
  Downloader: (n) => [
    `${n} helps you save media from the web directly to your device. The download request goes straight from your browser to the source — nothing is proxied, cached, or stored on any intermediary server. Only download content you have permission to access.`,
    `Save online media quickly with ${n}. Downloads go directly from the source to your device with no intermediary storage. Respect copyright and only download content you have rights to.`,
  ],
  SEO: (n) => [
    `${n} helps you create and analyze search-engine-optimized content directly in your browser. Generate sitemaps, meta tags, and robots.txt files, or analyze keyword density and readability. All processing happens locally — your website data stays private.`,
    `Optimize your website for search engines with ${n}. Generate technical SEO assets like XML sitemaps and structured metadata, or audit your content for improvements. Runs entirely in your browser with no data transmitted.`,
  ],
  Privacy: (n) => [
    `${n} handles sensitive data entirely on your device. Encrypt messages, generate strong passwords, check password strength, or create cryptographic keys. Nothing leaves your browser — your secrets stay secret.`,
    `Protect your sensitive information with ${n}. Generate secure passwords, encrypt private notes, or verify checksums. All cryptographic operations happen locally — no servers, no logs, no data transmission.`,
  ],
  AI: (n) => [
    `${n} brings AI capabilities to your browser. It works with the AI provider of your choice — bring your own API key from OpenAI, Anthropic, or compatible services. You maintain full control over your data and choose a provider whose privacy policy you trust.`,
    `Generate, analyze, and transform content using AI with ${n}. Configure your preferred AI provider and model, then use natural language prompts to get results. Your API key and data are handled directly between you and your chosen provider.`,
  ],
  "indian-utilities": (n) => [
    `${n} is designed specifically for Indian users. Handle Aadhaar card masking, PAN card verification, GST calculations, IFSC lookups, and other India-specific tasks. All processing happens locally — your personal information never leaves your device.`,
    `India-focused utilities made simple with ${n}. Process Aadhaar and PAN documents safely, calculate GST and TDS, or look up IFSC codes and pincodes. Your data stays on your machine and is never uploaded anywhere.`,
  ],
  Extension: (n) => [
    `${n} generates browser extension code that you can review and customize before installing. All output is standard Manifest V3, compatible with Chrome, Edge, and other Chromium-based browsers. Full source code is provided for transparency.`,
    `Create custom browser extensions with ${n}. Generate the complete source code, review it before installation, and load it into your browser in developer mode. You maintain full control over what the extension does.`,
  ],
  Health: (n) => [
    `${n} provides health and fitness calculations that run entirely in your browser. Calculate BMI, daily calorie needs, body fat percentage, and other health metrics. These are informational estimates — please consult a healthcare professional for medical advice. Your data stays private on your device.`,
    `Track your health metrics privately with ${n}. Compute BMI, BMR, ideal weight ranges, and other common measurements. All calculations happen locally — nothing is stored or shared. For informational use only.`,
  ],
  HR: (n) => [
    `${n} handles common HR calculations directly in your browser. Compute employee turnover rates, salary components, leave balances, and overtime pay. All data stays on your device — no uploads or server storage. Results are estimates for planning purposes.`,
    `Simplify HR math with ${n}. Calculate attendance percentages, salary prorations, and statutory deductions. Your employee data remains private because everything is processed locally in your browser.`,
  ],
  Business: (n) => [
    `${n} helps you manage business calculations and documents directly in your browser. Create invoices, estimate profits, calculate break-even points, or analyze cash flow. Your business data stays confidential — all processing happens locally on your device.`,
    `Run your business numbers with ${n} without uploading sensitive data anywhere. Calculate margins, project costs, or generate professional documents. Everything stays on your computer.`,
  ],
  "E-commerce": (n) => [
    `${n} provides e-commerce tools that run entirely in your browser. Calculate pricing, manage inventory estimates, or analyze sales data. Your product and business information stays on your device — nothing is transmitted or stored online.`,
    `E-commerce calculations made simple with ${n}. Work with pricing, discounts, profit margins, and inventory projections. All data stays private on your machine.`,
  ],
  Lifestyle: (n) => [
    `${n} is a simple browser-based tool for everyday decisions. Quick, private, and free — with no account needed. Everything runs locally on your device.`,
    `A practical everyday tool that works right in your browser. ${n} handles common tasks quickly without uploading your data anywhere. No sign-up or installation required.`,
  ],
};

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const lines = content.split("\n");
const resultLines = [];
let i = 0;

while (i < lines.length) {
  const line = lines[i];
  const trimmed = line.trimEnd();

  if (trimmed === "{" || trimmed === "  {") {
    const blockLines = [line];
    let depth = 1;
    let j = i + 1;
    while (j < lines.length && depth > 0) {
      const bl = lines[j];
      blockLines.push(bl);
      for (const ch of bl) {
        if (ch === "{") depth++;
        if (ch === "}") depth--;
      }
      j++;
    }

    const blockText = blockLines.join("\n");

    if (blockText.includes("name:") && blockText.includes("description:")) {
      const nameMatch = blockText.match(/name:\s*"([^"]+)"/);
      const descMatch = blockText.match(/description:\s*"([^"]+)"/);
      const catMatch = blockText.match(/category:\s*"([^"]+)"/);
      const slugMatch = blockText.match(/slug:\s*"([^"]+)"/);

      if (nameMatch && catMatch && descMatch) {
        const name = nameMatch[1];
        const category = catMatch[1];
        const slug = slugMatch ? slugMatch[1] : "";
        const catKey = Object.keys(builders).find(
          (k) => k.toLowerCase() === category.toLowerCase()
        );

        let newDesc;
        if (catKey && builders[catKey]) {
          const options = builders[catKey](name);
          newDesc = options[hash(name + slug) % options.length];
        } else {
          newDesc = `${name} runs entirely in your browser with no server uploads. All processing happens locally on your device, keeping your data private. Free to use with no account or registration required.`;
        }

        const newBlock = blockText.replace(
          /description:\s*"[^"]+"/,
          `description: "${newDesc}"`
        );
        resultLines.push(newBlock);
        i = j;
        continue;
      }
    }
  }

  resultLines.push(line);
  i++;
}

fs.writeFileSync(filePath, resultLines.join("\n"), "utf-8");
console.log("Done — descriptions regenerated.");
