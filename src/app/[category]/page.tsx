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
  const seo = categoryKey === "Converter"
    ? { title: "Free Online File Converter — Video, Audio & Data | Toolzum", description: `Free online file converter — video, audio, image, data, and document formats. Nothing uploaded, 100% browser-based.` }
    : { title: `${categoryKey} Tools — Free Online | Toolzum`, description: `Free online ${categoryKey} tools — ${toolCount} tools. Process files locally, nothing leaves your browser.` };
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
