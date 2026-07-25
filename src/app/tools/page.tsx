import { ToolsDirectoryClient } from "@/components/tools/ToolsDirectoryClient";
import { toolsRegistry } from "@/registry/tools";

const toolCount = toolsRegistry.filter(t => t.showInCategory !== false).length;

export const metadata = {
  title: `${toolCount}+ Free Online Tools — Browser-Based Utilities Directory | Toolzum`,
  description: `Browse ${toolCount}+ free online tools for PDF, images, video, audio, AI, text, code, and more. All process locally in your browser — nothing is uploaded.`,
  alternates: { canonical: "https://toolzum.com/tools/" },
  openGraph: {
    title: `Free Online Tools — ${toolCount}+ Browser-Based Utilities | Toolzum`,
    description: `Stop uploading files to servers. ${toolCount}+ free tools for PDF, images, video, audio, AI, text, and code — all process locally in your browser. Nothing leaves your device.`,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Toolzum",
  url: "https://toolzum.com",
  description: `${toolCount}+ privacy-first online tools for PDF, images, video, audio, AI, text, and code.`,
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
      <ToolsDirectoryClient initialTools={toolsRegistry} />
    </>
  );
}
