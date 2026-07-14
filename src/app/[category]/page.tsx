import { notFound } from "next/navigation";
import { toolsRegistry } from "@/registry/tools";
import type { ToolCategory } from "@/registry/tools";
import { CategoryPageClient } from "@/components/tools/CategoryPageClient";

const VALID_CATEGORIES = new Set<string>(toolsRegistry.map(t => t.category));

const CONVERTER_CROSSLIST = new Set(['video-converter', 'audio-converter', 'image-format-converter', 'document-converter']);

function normalizeCategory(category: string): string {
  if (category === "marketing") return "Branding";
  const match = toolsRegistry.find(
    t => t.category.toLowerCase().replace(/\s+/g, '-') === category
  );
  return match?.category || "";
}

export async function generateStaticParams() {
  const categories = [...new Set(toolsRegistry.map(t => t.category))];
  const params = categories.map((cat) => ({
    category: cat.toLowerCase().replace(/\s+/g, '-'),
  }));
  params.push({ category: 'marketing' });
  return params;
}

export async function generateMetadata(props: { params: Promise<{ category: string }> }) {
  const params = await props.params;
  const categoryKey = normalizeCategory(params.category);
  if (!categoryKey || !VALID_CATEGORIES.has(categoryKey)) return { title: "Not Found" };

  const toolCount = toolsRegistry.filter(t => t.category === categoryKey && t.showInCategory !== false).length;
  const SEO: Record<string, { title: string; description: string }> = {
    Image: { title: 'Free Image Tools — Resize, Compress & Convert | Toolzum', description: 'Free online image tools — resize, crop, compress, convert, and edit images directly in your browser. Nothing uploaded, 100% private.' },
    PDF: { title: 'Free PDF Tools — Compress, Merge & Convert | Toolzum', description: 'Free online PDF tools — compress, merge, split, convert, and edit PDFs. All processing happens locally in your browser.' },
    Video: { title: 'Free Video Tools — Compress, Convert & Edit | Toolzum', description: 'Free online video tools — trim, compress, convert between formats, and enhance videos. Zero uploads, processed entirely in-browser.' },
    Audio: { title: 'Free Audio Tools — Convert, Cut & Enhance | Toolzum', description: 'Free online audio tools — convert between MP3, WAV, FLAC, OGG, trim, and enhance audio files locally in your browser.' },
    AI: { title: 'Free AI Tools — Generate, Summarize & Analyze | Toolzum', description: 'Free online AI tools — generate images, summarize text, analyze content, and more. Powered by browser-based AI for complete privacy.' },
    Converter: { title: 'Free File Converter — Video, Audio & Data | Toolzum', description: 'Free online file converter — convert video, audio, image, data, and document formats instantly. Nothing uploaded, 100% browser-based.' },
    Developer: { title: 'Free Developer Tools — Format, Minify & Debug | Toolzum', description: 'Free online developer tools — format JSON, minify CSS/JS, debug regex, encode/decode, and more. All processing happens in your browser.' },
    Text: { title: 'Free Text Tools — Count, Convert & Generate | Toolzum', description: 'Free online text tools — word counter, case converter, text diff, markdown editor, and text generators. Nothing leaves your device.' },
    Finance: { title: 'Free Finance Tools — GST, EMI & Calculators | Toolzum', description: 'Free online finance tools — GST calculator, EMI calculator, currency converter, and financial utilities. Accurate calculations in your browser.' },
    Privacy: { title: 'Free Privacy Tools — Encrypt, Redact & Secure | Toolzum', description: 'Free online privacy tools — encrypt text, redact images, generate secure passwords, and more. Everything stays local to your device.' },
    SEO: { title: 'Free SEO Tools — Analyze, Optimize & Audit | Toolzum', description: 'Free online SEO tools — meta tag analyzer, keyword density checker, sitemap generator, and SEO audit utilities to improve your rankings.' },
    Utility: { title: 'Free Utility Tools — Everyday Essentials | Toolzum', description: 'Free online utility tools — unit converters, QR code generator, color picker, and everyday essentials for quick tasks online.' },
    'indian-utilities': { title: 'Free India Tools — Aadhaar, PAN & More | Toolzum', description: 'Free online tools for India — Aadhaar masking, PAN card validation, UPI payment helpers, and Indian utility tools. All processed locally.' },
    Transcription: { title: 'Free Transcription Tools — Speech to Text | Toolzum', description: 'Free online transcription tools — convert speech to text, generate captions, and transcribe audio files locally in your browser.' },
    Branding: { title: 'Free Branding & Marketing Tools — Logo, Analytics & Design | Toolzum', description: 'Free online branding and marketing tools — create logos, design social media posts, shorten URLs, schedule content, and measure campaign performance with analytics calculators.' },
    Business: { title: 'Free Business Tools — Invoicing, Contracts & More | Toolzum', description: 'Free online business tools — invoice generator, contract templates, business name generator, and more. Streamline your workflow.' },
    Productivity: { title: 'Free Productivity Tools — Notes, Timers & More | Toolzum', description: 'Free online productivity tools — todo lists, pomodoro timers, note-taking, and workflow utilities to get more done.' },
    Design: { title: 'Free Design Tools — Graphics & Visuals | Toolzum', description: 'Free online design tools — color palette generator, gradient maker, typography checker, and design utilities for creators.' },
    HR: { title: 'Free HR Tools — Resume, Salary & HR Utilities | Toolzum', description: 'Free online HR tools — resume builder, salary calculator, leave calculator, and HR utilities for professionals and teams.' },
    Health: { title: 'Free Health Tools — BMI, Calorie & Wellness | Toolzum', description: 'Free online health tools — BMI calculator, calorie tracker, water reminder, and wellness utilities for a healthier life.' },
    Extension: { title: 'Free Browser Extension Tools | Toolzum', description: 'Free online browser extension tools — enhance your browsing with utility extensions. All local, no data collection.' },
    'E-commerce': { title: 'Free E-Commerce Tools — Store & Product | Toolzum', description: 'Free online e-commerce tools — product price tracker, store analytics, and e-commerce utilities for online sellers.' },
    Lifestyle: { title: 'Free Lifestyle Tools — Daily Life Essentials | Toolzum', description: 'Free online lifestyle tools — habit tracker, mood journal, and daily life utilities to improve your everyday routine.' },
  };
  const seo = SEO[categoryKey] ?? { title: `${categoryKey} Tools — Free | Toolzum`, description: `Free online ${categoryKey.toLowerCase()} tools — all processed locally in your browser with nothing uploaded to any server.` };
  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: categoryKey === "Branding" && params.category === "marketing"
        ? "https://toolzum.com/branding"
        : `https://toolzum.com/${params.category}`,
    },
  };
}

export default async function CategoryPage(props: { params: Promise<{ category: string }> }) {
  const params = await props.params;
  const categoryKey = normalizeCategory(params.category);
  if (!categoryKey || !VALID_CATEGORIES.has(categoryKey)) notFound();

  const tools = toolsRegistry.filter(t =>
    (t.category === categoryKey && t.showInCategory !== false) ||
    (categoryKey === 'Converter' && CONVERTER_CROSSLIST.has(t.slug))
  );

  return <CategoryPageClient category={categoryKey as ToolCategory} tools={tools} />;
}
