import { notFound, permanentRedirect } from "next/navigation";
import { toolsRegistry, getToolByCategoryAndSlug, TOOL_REDIRECTS, SEO_PERMUTATIONS } from "@/registry/tools";
import { getToolLayoutData } from "@/registry/tools-helpers";
import { findRelatedTools } from "@/registry/related-tools";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { ToolPageSEOContent } from "@/components/tools/ToolPageSEOContent";
import { DynamicModuleWrapper } from "@/components/tools/modules/DynamicModuleWrapper";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MemoryWatchdog } from "@/hooks/useMemoryWatchdog";
import { getMetaDescription, getShortDescription, getOgDescription } from "@/lib/generateToolDescription";

function catToUrlSlug(cat: string): string {
  if (cat === "Growth & Marketing") return "growth-metrics";
  return cat.toLowerCase().replace(/\s+/g, '-');
}

export async function generateStaticParams() {
  const toolParams = toolsRegistry.map((tool) => ({
    category: catToUrlSlug(tool.category),
    tool: tool.slug,
  }));
  const redirectTargetParams = Object.entries(TOOL_REDIRECTS).map(([slug, target]) => ({
    category: catToUrlSlug(target.category),
    tool: slug,
  }));
  const redirectSourceParams = Object.entries(TOOL_REDIRECTS)
    .filter(([, target]) => target.sourceCategory)
    .flatMap(([slug, target]) => {
      const cats = Array.isArray(target.sourceCategory) ? target.sourceCategory : [target.sourceCategory!];
      return cats.map(sourceCategory => ({
        category: catToUrlSlug(sourceCategory),
        tool: slug,
      }));
    });
  return [...toolParams, ...redirectTargetParams, ...redirectSourceParams];
}

export async function generateMetadata(props: { params: Promise<{ category: string; tool: string }> }) {
  const params = await props.params;
  const toolMetadata = getToolByCategoryAndSlug(params.category, params.tool);
  
  if (!toolMetadata) {
    return {
      title: 'Not Found',
      robots: { index: false, follow: false },
      alternates: { canonical: `https://toolzum.com/${params.category}/${params.tool}/` },
    };
  }

  const desc = getMetaDescription(toolMetadata);
  const ogImageUrl = `https://toolzum.com/og/${params.category}/${params.tool}.webp`;

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
  if (redirect && (catToUrlSlug(redirect.category) !== params.category || redirect.slug !== params.tool)) {
    permanentRedirect(`/${catToUrlSlug(redirect.category)}/${redirect.slug}/`);
  }

  const toolMetadata = getToolByCategoryAndSlug(params.category, params.tool);

  if (!toolMetadata) {
    notFound();
  }

  const seoPage = SEO_PERMUTATIONS.find(p => p.slug === toolMetadata.slug);
  if (seoPage) {
    const parentTool = toolsRegistry.find(t => t.slug === seoPage.parentSlug);
    if (parentTool) {
      let redirectUrl = `/${parentTool.category.toLowerCase()}/${parentTool.slug}/`;
      if (seoPage.slug.includes('-to-')) {
        const parts = seoPage.slug.split('-to-');
        const from = parts[0].replace('bulk-', '');
        const to = parts[1];
        redirectUrl += `?from=${from}&to=${to}`;
      } else {
        const parentPrefix = seoPage.parentSlug.replace(/-[^-]+$/, '-');
        if (seoPage.slug.startsWith(parentPrefix)) {
          const op = seoPage.slug.slice(parentPrefix.length);
          redirectUrl += `?op=${op}`;
        }
      }
      permanentRedirect(redirectUrl);
    }
  }

  return (
    <>
      <ToolLayout
        title={toolMetadata.name}
        description={getShortDescription(toolMetadata)}
        category={params.category}
        slug={toolMetadata.slug}
        tool={toolMetadata}
        {...getToolLayoutData(params.category, toolMetadata.slug)}
        hideDownloadQuota={toolMetadata.slug === 'gemini-watermark-remover'}
        seoSection={<ToolPageSEOContent tool={toolMetadata} relatedTools={findRelatedTools(toolMetadata, toolsRegistry)} />}
      >
        <MemoryWatchdog />
        <ErrorBoundary>
          <DynamicModuleWrapper slug={toolMetadata.slug} category={toolMetadata.category} />
        </ErrorBoundary>
      </ToolLayout>
    </>
  );
}
