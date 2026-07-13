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
    Image: { title: 'Free Online Image Tools — Resize, Compress & Convert | Toolzum', description: `${toolCount} free online image tools — resize, crop, compress, convert, and edit images in your browser. Nothing uploaded.` },
    PDF: { title: 'Free Online PDF Tools — Compress, Merge & Convert | Toolzum', description: `${toolCount} free online PDF tools — compress, merge, split, convert, and edit PDFs. All processing happens locally.` },
    Video: { title: 'Free Online Video Tools — Compress, Convert & Edit | Toolzum', description: `${toolCount} free online video tools — trim, compress, convert between formats, and enhance videos. Zero uploads.` },
    Audio: { title: 'Free Online Audio Tools — Convert, Cut & Enhance | Toolzum', description: `${toolCount} free online audio tools — convert between MP3, WAV, FLAC, OGG, trim, and enhance audio files locally.` },
    AI: { title: 'Free Online AI Tools — Generate, Summarize & Analyze | Toolzum', description: `${toolCount} free online AI tools — generate images, summarize text, analyze content, and more. Powered by browser-based AI.` },
    Converter: { title: 'Free Online File Converter — Video, Audio & Data | Toolzum', description: `Free online file converter — video, audio, image, data, and document formats. Nothing uploaded, 100% browser-based.` },
    Developer: { title: 'Free Online Developer Tools — Format, Minify & Debug | Toolzum', description: `${toolCount} free online developer tools — format JSON, minify CSS/JS, debug regex, encode/decode, and more.` },
    Text: { title: 'Free Online Text Tools — Count, Convert & Generate | Toolzum', description: `${toolCount} free online text tools — word counter, case converter, text diff, markdown editor, and text generators.` },
    Finance: { title: 'Free Online Finance Tools — GST, EMI & Calculators | Toolzum', description: `${toolCount} free online finance tools — GST calculator, EMI calculator, currency converter, and financial utilities.` },
    Privacy: { title: 'Free Online Privacy Tools — Encrypt, Redact & Secure | Toolzum', description: `${toolCount} free online privacy tools — encrypt text, redact images, generate secure passwords, and more. All local.` },
    SEO: { title: 'Free Online SEO Tools — Analyze, Optimize & Audit | Toolzum', description: `${toolCount} free online SEO tools — meta tag analyzer, keyword density checker, sitemap generator, and SEO audit utilities.` },
    Utility: { title: 'Free Online Utility Tools — Everyday Essentials | Toolzum', description: `${toolCount} free online utility tools — unit converters, QR code generator, color picker, and everyday essentials.` },
    'indian-utilities': { title: 'Free Online India Tools — Aadhaar, PAN & More | Toolzum', description: `${toolCount} free online tools for India — Aadhaar masking, PAN card validation, UPI payment helpers, and Indian utility tools.` },
    Transcription: { title: 'Free Online Transcription Tools — Speech to Text | Toolzum', description: `${toolCount} free online transcription tools — convert speech to text, generate captions, and transcribe audio files locally.` },
    Branding: { title: 'Free Online Branding Tools — Logo, Mockup & Design | Toolzum', description: `${toolCount} free online branding tools — create logos, generate mockups, design business cards, and brand assets.` },
    Business: { title: 'Free Online Business Tools — Invoicing, Contracts & More | Toolzum', description: `${toolCount} free online business tools — invoice generator, contract templates, business name generator, and more.` },
    Marketing: { title: 'Free Online Marketing Tools — Social Media & Analytics | Toolzum', description: `${toolCount} free online marketing tools — social media schedulers, link shorteners, analytics, and campaign helpers.` },
    Productivity: { title: 'Free Online Productivity Tools — Notes, Timers & More | Toolzum', description: `${toolCount} free online productivity tools — todo lists, pomodoro timers, note-taking, and workflow utilities.` },
    Design: { title: 'Free Online Design Tools — Graphics & Visuals | Toolzum', description: `${toolCount} free online design tools — color palette generator, gradient maker, typography checker, and design utilities.` },
    HR: { title: 'Free Online HR Tools — Resume, Salary & HR Utilities | Toolzum', description: `${toolCount} free online HR tools — resume builder, salary calculator, leave calculator, and HR utilities.` },
    Health: { title: 'Free Online Health Tools — BMI, Calorie & Wellness | Toolzum', description: `${toolCount} free online health tools — BMI calculator, calorie tracker, water reminder, and wellness utilities.` },
    Extension: { title: 'Free Online Browser Extension Tools | Toolzum', description: `${toolCount} free online browser extension tools — enhance your browsing with utility extensions. All local.` },
    'E-commerce': { title: 'Free Online E-Commerce Tools — Store & Product | Toolzum', description: `${toolCount} free online e-commerce tools — product price tracker, store analytics, and e-commerce utilities.` },
    Lifestyle: { title: 'Free Online Lifestyle Tools — Daily Life Essentials | Toolzum', description: `${toolCount} free online lifestyle tools — habit tracker, mood journal, and daily life utilities.` },
  };
  const seo = SEO[categoryKey] ?? { title: `${categoryKey} Tools — Free Online | Toolzum`, description: `Free online ${categoryKey} tools — ${toolCount} tools. Process files locally, nothing leaves your browser.` };
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
