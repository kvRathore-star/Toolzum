import { notFound, permanentRedirect } from "next/navigation";
import { toolsRegistry, getToolByCategoryAndSlug, TOOL_REDIRECTS } from "@/registry/tools";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { ToolPageSEOContent } from "@/components/tools/ToolPageSEOContent";
import { DynamicModuleWrapper } from "@/components/tools/modules/DynamicModuleWrapper";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MemoryWatchdog } from "@/hooks/useMemoryWatchdog";
import { getMetaDescription, getShortDescription, getOgDescription } from "@/lib/generateToolDescription";

export async function generateStaticParams() {
  const redirectPages = Object.entries(TOOL_REDIRECTS).map(([slug, target]) => ({
    category: target.category,
    tool: slug,
  }));
  return [
    ...toolsRegistry.map((tool) => ({
      category: tool.category.toLowerCase().replace(/\s+/g, '-'),
      tool: tool.slug,
    })),
    ...redirectPages,
  ];
}

export async function generateMetadata(props: { params: Promise<{ category: string; tool: string }> }) {
  const params = await props.params;
  const toolMetadata = getToolByCategoryAndSlug(params.category, params.tool);
  
  if (!toolMetadata) return { title: 'Not Found' };

  const desc = getMetaDescription(toolMetadata);
  const ogImageUrl = `https://toolzum.com/og/${params.category}/${params.tool}.png`;

  return {
    title: `${toolMetadata.name} – Free Online Tool`,
    description: desc,
    alternates: {
      canonical: `https://toolzum.com/${params.category}/${params.tool}/`,
    },
    openGraph: {
      title: `${toolMetadata.name} – Free Online Tool`,
      description: getOgDescription(toolMetadata),
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

  const redirect = TOOL_REDIRECTS[params.tool];
  if (redirect) {
    permanentRedirect(`/${redirect.category}/${redirect.slug}/`);
  }

  const toolMetadata = getToolByCategoryAndSlug(params.category, params.tool);

  if (!toolMetadata) {
    notFound();
  }

  return (
    <>
      <ToolLayout
        title={toolMetadata.name}
        description={getShortDescription(toolMetadata)}
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
