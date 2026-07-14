import { notFound } from "next/navigation";
import { toolsRegistry } from "@/registry/tools";
import type { ToolCategory } from "@/registry/tools";
import { CategoryPageClient } from "@/components/tools/CategoryPageClient";

const VALID_CATEGORIES = new Set<string>(toolsRegistry.map(t => t.category));

const CONVERTER_CROSSLIST = new Set(['video-converter', 'audio-converter', 'image-format-converter', 'document-converter']);

function normalizeCategory(category: string): string {
  const match = toolsRegistry.find(
    t => t.category.toLowerCase().replace(/\s+/g, '-') === category
  );
  return match?.category || "";
}

export async function generateStaticParams() {
  const categories = [...new Set(toolsRegistry.map(t => t.category))];
  return categories.map((cat) => ({
    category: cat.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export async function generateMetadata(props: { params: Promise<{ category: string }> }) {
  const params = await props.params;
  const categoryKey = normalizeCategory(params.category);
  if (!categoryKey || !VALID_CATEGORIES.has(categoryKey)) return { title: "Not Found" };

  const toolCount = toolsRegistry.filter(t => t.category === categoryKey && t.showInCategory !== false).length;
  const SEO: Record<string, { title: string; description: string }> = {
    Image: { title: 'Free Online Image Tools — Resize, Compress & Convert | Toolzum', description: 'Free online image tools — resize, crop, compress, convert, and edit images directly in your browser. Nothing uploaded, 100% private.' },
    PDF: { title: 'Free Online PDF Tools — Compress, Merge & Convert | Toolzum', description: 'Free online PDF tools — compress, merge, split, convert, and edit PDFs. All processing happens locally in your browser.' },
    Video: { title: 'Free Online Video Tools — Compress, Convert & Edit | Toolzum', description: 'Free online video tools — trim, compress, convert between formats, and enhance videos. Zero uploads, processed entirely in-browser.' },
    Audio: { title: 'Free Online Audio Tools — Convert, Cut & Enhance | Toolzum', description: 'Free online audio tools — convert between MP3, WAV, FLAC, OGG, trim, and enhance audio files locally in your browser.' },
    AI: { title: 'Free Online AI Tools — Generate, Summarize & Analyze | Toolzum', description: 'Free online AI tools — generate images, summarize text, analyze content, and more. Powered by browser-based AI for complete privacy.' },
    Converter: { title: 'Free Online File Converter — Video, Audio & Data | Toolzum', description: 'Free online file converter — convert video, audio, image, data, and document formats instantly. Nothing uploaded, 100% browser-based.' },
    Developer: { title: 'Free Online Developer Tools — Format, Minify & Debug | Toolzum', description: 'Free online developer tools — format JSON, minify CSS/JS, debug regex, encode/decode, and more. All processing happens in your browser.' },
    Text: { title: 'Free Online Text Tools — Count, Convert & Generate | Toolzum', description: 'Free online text tools — word counter, case converter, text diff, markdown editor, and text generators. Nothing leaves your device.' },
    Finance: { title: 'Free Online Finance Tools — GST, EMI & Calculators | Toolzum', description: 'Free online finance tools — GST calculator, EMI calculator, currency converter, and financial utilities. Accurate calculations in your browser.' },
    Privacy: { title: 'Free Online Privacy Tools — Encrypt, Redact & Secure | Toolzum', description: 'Free online privacy tools — encrypt text, redact images, generate secure passwords, and more. Everything stays local to your device.' },
    SEO: { title: 'Free Online SEO Tools — Analyze, Optimize & Audit | Toolzum', description: 'Free online SEO tools — meta tag analyzer, keyword density checker, sitemap generator, and SEO audit utilities to improve your rankings.' },
    Utility: { title: 'Free Online Utility Tools — Everyday Essentials | Toolzum', description: 'Free online utility tools — unit converters, QR code generator, color picker, and everyday essentials for quick tasks online.' },
    'indian-utilities': { title: 'Free Online India Tools — Aadhaar, PAN & More | Toolzum', description: 'Free online tools for India — Aadhaar masking, PAN card validation, UPI payment helpers, and Indian utility tools. All processed locally.' },
    Transcription: { title: 'Free Online Transcription Tools — Speech to Text | Toolzum', description: 'Free online transcription tools — convert speech to text, generate captions, and transcribe audio files locally in your browser.' },
    Branding: { title: 'Free Online Branding Tools — Logo, Mockup & Design | Toolzum', description: 'Free online branding tools — create logos, generate mockups, design business cards, and brand assets. No design skills needed.' },
    Business: { title: 'Free Online Business Tools — Invoicing, Contracts & More | Toolzum', description: 'Free online business tools — invoice generator, contract templates, business name generator, and more. Streamline your workflow.' },
    Marketing: { title: 'Free Online Marketing Tools — Social Media & Analytics | Toolzum', description: 'Free online marketing tools — social media schedulers, link shorteners, analytics, and campaign helpers to grow your audience.' },
    Productivity: { title: 'Free Online Productivity Tools — Notes, Timers & More | Toolzum', description: 'Free online productivity tools — todo lists, pomodoro timers, note-taking, and workflow utilities to get more done.' },
    Design: { title: 'Free Online Design Tools — Graphics & Visuals | Toolzum', description: 'Free online design tools — color palette generator, gradient maker, typography checker, and design utilities for creators.' },
    HR: { title: 'Free Online HR Tools — Resume, Salary & HR Utilities | Toolzum', description: 'Free online HR tools — resume builder, salary calculator, leave calculator, and HR utilities for professionals and teams.' },
    Health: { title: 'Free Online Health Tools — BMI, Calorie & Wellness | Toolzum', description: 'Free online health tools — BMI calculator, calorie tracker, water reminder, and wellness utilities for a healthier life.' },
    Extension: { title: 'Free Online Browser Extension Tools | Toolzum', description: 'Free online browser extension tools — enhance your browsing with utility extensions. All local, no data collection.' },
    'E-commerce': { title: 'Free Online E-Commerce Tools — Store & Product | Toolzum', description: 'Free online e-commerce tools — product price tracker, store analytics, and e-commerce utilities for online sellers.' },
    Lifestyle: { title: 'Free Online Lifestyle Tools — Daily Life Essentials | Toolzum', description: 'Free online lifestyle tools — habit tracker, mood journal, and daily life utilities to improve your everyday routine.' },
  };
  const seo = SEO[categoryKey] ?? { title: `${categoryKey} Tools — Free Online | Toolzum`, description: `Free online ${categoryKey.toLowerCase()} tools — all processed locally in your browser with nothing uploaded to any server.` };
  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: `https://toolzum.com/${params.category}`,
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
