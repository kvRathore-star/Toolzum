"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, HelpCircle, BookOpen, Layers, ArrowRight } from "lucide-react";
import { toolsRegistry, ToolMetadata } from "@/registry/tools";

interface ToolPageSEOContentProps {
  tool: ToolMetadata;
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
};

const categoryFaqTemplates: Record<string, { question: string; answer: string }[]> = {
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
    { question: "Will these tools improve my search rankings?", answer: "They help generate technically correct sitemaps, meta tags, and content analysis, which are fundamental technical SEO building blocks." },
    { question: "Can I test multiple URLs at once?", answer: "Yes. Sitemap and meta tag generators support adding multiple URLs. The keyword checker analyzes entire documents." },
    { question: "Is the generated code ready to use?", answer: "Yes. The output is standard XML or HTML that can be copied directly into your website's source code." },
    { question: "Do I need technical knowledge to use these?", answer: "Basic understanding of HTML and XML is helpful but not required. The tools generate clean, ready-to-use code." },
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
  "Downloader": [
    { question: "Is downloading videos legal?", answer: "Only download content you have the rights to access. Respect copyright and terms of service of the source platform." },
    { question: "What video quality is available?", answer: "Available quality depends on the source platform and video. Most tools attempt to fetch the highest available resolution." },
    { question: "Can I download private or age-restricted content?", answer: "No. These tools only access publicly available content that your browser can normally access." },
    { question: "Why does my download fail?", answer: "Downloads may fail if the source platform changes its API, the video is removed, or network restrictions apply." },
    { question: "Are my downloads private?", answer: "Download requests go directly from your browser to the source. We don't proxy or store any downloaded content." },
  ],
};

const defaultInstructions = [
  { title: "1. Enter Your Input", desc: "Type, paste, or upload your data using the input controls provided in the tool interface above." },
  { title: "2. Configure Options", desc: "Adjust any available settings to customize the output according to your requirements." },
  { title: "3. Get Your Result", desc: "View the output instantly. Copy it to your clipboard or download it as a file for later use." },
];

const defaultFaqs = [
  { question: "Is this tool free to use?", answer: "Yes, this tool is completely free. No credit card or registration is required for standard usage." },
  { question: "How is my privacy protected?", answer: "All processing happens 100% locally in your browser. Your data is never uploaded to any server." },
  { question: "Can I use this tool offline?", answer: "Yes. Once the page has loaded, the tool runs entirely offline without requiring an internet connection." },
  { question: "Are there any usage limits?", answer: "Standard tools are unlimited. Pro tools allow free daily usage with an option to upgrade." },
  { question: "What are the system requirements?", answer: "Any modern web browser (Chrome, Firefox, Safari, Edge) on desktop or mobile. No installation needed." },
];

function getCategoryPath(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}

function getCategoryKey(category: string): string {
  const map: Record<string, string> = {
    "pdf": "PDF",
    "image": "Image",
    "text": "Text",
    "developer": "Developer",
    "finance": "Finance",
    "utility": "Utility",
    "converter": "Converter",
    "downloader": "Downloader",
    "video": "Video",
    "audio": "Audio",
    "branding": "Branding",
    "productivity": "Productivity",
    "privacy": "Privacy",
    "design": "Design",
    "transcription": "Transcription",
    "extension": "Extension",
    "seo": "SEO",
    "marketing": "Marketing",
    "indian-utilities": "indian-utilities",
    "ai": "AI",
    "health": "Health",
    "hr": "HR",
    "business": "Business",
    "e-commerce": "E-commerce",
    "lifestyle": "Lifestyle",
  };
  const normalized = category.toLowerCase().replace(/\s+/g, "-");
  return map[normalized] || category;
}

const crossCategoryMap: Record<string, string[]> = {
  "PDF": ["Converter", "Image", "Text"],
  "Image": ["Design", "Branding", "PDF"],
  "Video": ["Audio", "Downloader", "Converter"],
  "Audio": ["Video", "Converter", "Downloader"],
  "Developer": ["SEO", "Utility", "Productivity"],
  "Text": ["AI", "Developer", "SEO"],
  "AI": ["Text", "Image", "Marketing"],
  "Utility": ["Developer", "Productivity", "Finance"],
  "Converter": ["PDF", "Image", "Video"],
  "Downloader": ["Video", "Audio", "Extension"],
  "Finance": ["Utility", "Productivity", "Privacy"],
  "SEO": ["Developer", "Marketing", "Text"],
  "Privacy": ["Developer", "Utility", "Text"],
  "Marketing": ["AI", "SEO", "Design"],
  "Branding": ["Design", "Image", "Marketing"],
  "Design": ["Branding", "Image", "Productivity"],
};

export function ToolPageSEOContent({ tool }: ToolPageSEOContentProps) {
  const categoryKey = getCategoryKey(tool.category);

  const sameCategoryTools = toolsRegistry
    .filter((t) => t.category === tool.category && t.slug !== tool.slug)
    .slice(0, 3);

  const crossCategories = crossCategoryMap[categoryKey] || [];
  const crossCategoryTools = toolsRegistry
    .filter((t) => crossCategories.includes(getCategoryKey(t.category)) && t.slug !== tool.slug)
    .slice(0, 3);

  const allRelated = [...sameCategoryTools, ...crossCategoryTools];

  const displayCategory = tool.category.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  const steps = tool.instructions || categoryInstructionTemplates[categoryKey] || defaultInstructions;
  const faqs = tool.faqs || categoryFaqTemplates[categoryKey] || defaultFaqs;

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
              href={`/tools?category=${encodeURIComponent(tool.category)}`}
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
              "description": tool.description,
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
