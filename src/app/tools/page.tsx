import { ToolsDirectoryClient } from "@/components/tools/ToolsDirectoryClient";
import { getCachedToolCounts } from "@/registry/tools-helpers";

const { totalImplemented, seoVariants } = getCachedToolCounts();

export const metadata = {
  title: `${totalImplemented}+ Free Online Tools — Browser-Based Utilities Directory | Toolzum`,
  description: `Browse ${totalImplemented}+ free online tools for PDF, images, video, audio, AI, text, code, and more. Most process locally in your browser — nothing uploaded for local tools.`,
  alternates: { canonical: "https://toolzum.com/tools/" },
  openGraph: {
    title: `Free Online Tools — ${totalImplemented}+ Browser-Based Utilities | Toolzum`,
    description: `Stop uploading files to servers. ${totalImplemented}+ free tools for PDF, images, video, audio, AI, text, and code — most process locally in your browser. Nothing leaves your device for local tools.`,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Toolzum",
  url: "https://toolzum.com",
  description: `${totalImplemented}+ privacy-first online tools for PDF, images, video, audio, AI, text, and code.`,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://toolzum.com/tools?search={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolsDirectoryClient toolCount={totalImplemented} />
    </>
  );
}
