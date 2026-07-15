import { ToolsDirectoryClient } from "@/components/tools/ToolsDirectoryClient";
import { toolsRegistry } from "@/registry/tools";

const toolCount = toolsRegistry.length;

export const metadata = {
  title: `Browse ${toolCount}+ Free Tools`,
  description: `Explore Toolzum's extensive ecosystem of ${toolCount}+ offline-first web utilities. Compress images, modify PDFs, format code, and convert files safely in your browser.`,
  alternates: { canonical: "https://toolzum.com/tools/" },
  openGraph: {
    title: `Free Tools — ${toolCount}+ Browser-Based Utilities | Toolzum`,
    description: `Stop uploading files to servers. ${toolCount}+ free tools for PDF, images, video, audio, AI, text, and code — all process locally in your browser. Nothing leaves your device.`,
  },
};

export default function ToolsPage() {
  return (
    <ToolsDirectoryClient initialTools={toolsRegistry} />
  );
}
