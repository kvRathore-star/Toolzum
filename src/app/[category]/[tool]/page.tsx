import { notFound } from "next/navigation";
import { toolsRegistry, getToolByCategoryAndSlug } from "@/registry/tools";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { ToolPageSEOContent } from "@/components/tools/ToolPageSEOContent";
import { DynamicModuleWrapper } from "@/components/tools/modules/DynamicModuleWrapper";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MemoryWatchdog } from "@/hooks/useMemoryWatchdog";

export async function generateStaticParams() {
  return toolsRegistry.map((tool) => ({
    category: tool.category.toLowerCase().replace(/\s+/g, '-'),
    tool: tool.slug,
  }));
}

export async function generateMetadata(props: { params: Promise<{ category: string; tool: string }> }) {
  const params = await props.params;
  const toolMetadata = getToolByCategoryAndSlug(params.category, params.tool);
  
  if (!toolMetadata) return { title: 'Not Found' };

  const desc = toolMetadata.seoDescription || `Free online ${toolMetadata.name}: ${toolMetadata.description.charAt(0).toLowerCase() + toolMetadata.description.slice(1)}. 100% browser-based, nothing uploaded.`;
  const ogImageUrl = `https://gotoolhub.com/${params.category}/${params.tool}/opengraph-image`;

  return {
    title: `${toolMetadata.name} — Free Online Tool`,
    description: desc,
    keywords: `${toolMetadata.name.toLowerCase()}, free online ${toolMetadata.name.toLowerCase()}, ${toolMetadata.category.toLowerCase()} tool`,
    alternates: {
      canonical: `https://gotoolhub.com/${params.category}/${params.tool}`,
    },
    openGraph: {
      title: `${toolMetadata.name} - Free Online Tool`,
      description: toolMetadata.description,
      type: 'website',
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImageUrl],
    },
  };
}

export default async function ToolPage(props: { params: Promise<{ category: string; tool: string }> }) {
  const params = await props.params;
  const toolMetadata = getToolByCategoryAndSlug(params.category, params.tool);

  if (!toolMetadata) {
    notFound();
  }

  return (
    <>
      <ToolLayout
        title={toolMetadata.name}
        description={toolMetadata.description}
        category={params.category}
        slug={toolMetadata.slug}
        seoSection={<ToolPageSEOContent tool={toolMetadata} />}
      >
        <MemoryWatchdog />
        <ErrorBoundary>
          <DynamicModuleWrapper slug={toolMetadata.slug} category={toolMetadata.category} />
        </ErrorBoundary>
      </ToolLayout>
    </>
  );
}
