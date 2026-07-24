import { notFound } from "next/navigation";
import { toolsRegistry } from "@/registry/tools";
import type { ToolCategory } from "@/registry/tools";
import { CategoryPageClient } from "@/components/tools/CategoryPageClient";
import { CATEGORY_SECTIONS, CATEGORY_INTROS } from "@/data/categorySections";

const VALID_CATEGORIES = new Set<string>(toolsRegistry.map(t => t.category));

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
    Image: { title: 'Free Image Tools – Resize, Compress & Convert', description: 'Free image tools — resize, crop, compress, convert, and edit images directly in your browser. Nothing uploaded, 100% private.' },
    PDF: { title: 'Free PDF Tools – Compress, Merge & Convert', description: 'Free PDF tools — compress, merge, split, convert, and edit PDFs. All processing happens locally in your browser.' },
    Video: { title: 'Free Video Tools – Compress, Convert & Edit', description: 'Free video tools — trim, compress, convert between formats, and enhance videos. Zero uploads, processed entirely in-browser.' },
    Audio: { title: 'Free Audio Tools – Convert, Cut & Enhance', description: 'Free audio tools — convert between MP3, WAV, FLAC, OGG, trim, and enhance audio files locally in your browser.' },
    AI: { title: 'Free AI Tools – Generate, Summarize & Analyze', description: 'Free AI tools — generate images, summarize text, analyze content, and more. Powered by browser-based AI for complete privacy.' },
    Converter: { title: 'Free File Converter – Video, Audio & Data', description: 'Free file converter — convert video, audio, image, data, and document formats instantly. Nothing uploaded, 100% browser-based.' },
    Developer: { title: 'Free Developer Tools – Format, Minify & Debug', description: 'Free developer tools — format JSON, minify CSS/JS, debug regex, encode/decode, and more. All processing happens in your browser.' },
    Text: { title: 'Free Text Tools – Count, Convert & Generate', description: 'Free text tools — word counter, case converter, text diff, markdown editor, and text generators. Nothing leaves your device.' },
    Finance: { title: 'Free Finance Tools – GST, EMI & Calculators', description: 'Free finance tools — GST calculator, EMI calculator, currency converter, and financial utilities. Accurate calculations in your browser.' },
    Privacy: { title: 'Free Privacy Tools – Encrypt, Redact & Secure', description: 'Free privacy tools — encrypt text, redact images, generate secure passwords, and more. Everything stays local to your device.' },
    SEO: { title: 'Free SEO Tools – Analyze, Optimize & Audit', description: 'Free SEO tools — meta tag analyzer, keyword density checker, sitemap generator, and SEO audit utilities to improve your rankings.' },
    Utility: { title: 'Free Utility Tools – Everyday Essentials', description: 'Free utility tools — unit converters, QR code generator, color picker, and everyday essentials for quick tasks.' },
    'indian-utilities': { title: 'Indian Utilities – Aadhaar, PAN, GST & More', description: 'Free Indian utility tools — Aadhaar masking, PAN card validation, UPI payment helpers, and local utility tools. All processed locally.' },
    Transcription: { title: 'Free Transcription Tools – Speech to Text', description: 'Free transcription tools — convert speech to text, generate captions, and transcribe audio files locally in your browser.' },
    Branding: { title: 'Free Branding & Marketing Tools – Logo, Analytics & Design', description: 'Free branding and marketing tools — create logos, design social media posts, shorten URLs, schedule content, and measure campaign performance with analytics calculators.' },
    Productivity: { title: 'Free Productivity Tools – Notes, Timers & More', description: 'Free productivity tools — todo lists, pomodoro timers, note-taking, and workflow utilities to get more done.' },
    Design: { title: 'Free Design Tools – Graphics & Visuals', description: 'Free design tools — color palette generator, gradient maker, typography checker, and design utilities for creators.' },
    Health: { title: 'Free Health Tools – BMI, Calorie & Wellness', description: 'Free health tools — BMI calculator, calorie tracker, water reminder, and wellness utilities for a healthier life.' },
    Extension: { title: 'Free Browser Extension Tools', description: 'Free browser extension tools — enhance your browsing with utility extensions. All local, no data collection.' },
    Calculator: { title: 'Free Online Calculators – Math, Date & Academic Tools', description: 'Free online calculators — percentages, fractions, date differences, grade averages, and math tools. All computations happen locally in your browser.' },
  };
  const seo = SEO[categoryKey] ?? { title: `${categoryKey} Tools – Free | Toolzum`, description: `Free ${categoryKey.toLowerCase()} tools — all processed locally in your browser with nothing uploaded to any server.` };
  const ogImage = `https://toolzum.com/og/${categoryKey.toLowerCase()}/index.png`;
  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: categoryKey === "Branding" && params.category === "marketing"
        ? "https://toolzum.com/branding/"
        : `https://toolzum.com/${params.category}/`,
    },
    openGraph: {
      title: `${seo.title} | Toolzum`,
      description: seo.description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImage],
    },
  };
}

export default async function CategoryPage(props: { params: Promise<{ category: string }> }) {
  const params = await props.params;
  const categoryKey = normalizeCategory(params.category);
  if (!categoryKey || !VALID_CATEGORIES.has(categoryKey)) notFound();

  const sectionSlugs = new Set((CATEGORY_SECTIONS[categoryKey] || []).flatMap(s => s.slugs));
  const allTools = toolsRegistry.filter(t =>
    (t.category === categoryKey && t.showInCategory !== false) ||
    (sectionSlugs.has(t.slug) && t.showInCategory !== false)
  );

  const toolMap = new Map(allTools.map(t => [t.slug, t]));
  const sections = CATEGORY_SECTIONS[categoryKey];
  const sectionedTools = sections
    ? sections
        .map(s => ({
          ...s,
          tools: s.slugs.map(slug => toolMap.get(slug)).filter(Boolean) as typeof allTools,
        }))
        .filter(s => s.tools.length > 0)
    : [];

  const uncategorized = sections
    ? allTools.filter(t => !sections.some(s => s.slugs.includes(t.slug)))
    : allTools;

  const intro = CATEGORY_INTROS[categoryKey] || '';

  return (
    <CategoryPageClient
      category={categoryKey as ToolCategory}
      tools={allTools}
      sections={sectionedTools}
      uncategorized={uncategorized}
      intro={intro}
    />
  );
}
