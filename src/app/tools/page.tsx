import { ToolsDirectoryClient } from "@/components/tools/ToolsDirectoryClient";
import { toolsRegistry } from "@/registry/tools";

const toolCount = toolsRegistry.length;

export const metadata = {
  title: `Browse ${toolCount}+ Free Online Tools`,
  description: `Explore Toolzum's extensive ecosystem of ${toolCount}+ offline-first web utilities. Compress images, modify PDFs, format code, and convert files safely in your browser.`,
  keywords: "free online tools, utilities, image compress, pdf tools, developer tools, local tools, privacy-first tools",
};

export default function ToolsPage() {
  return (
    <ToolsDirectoryClient initialTools={toolsRegistry} />
  );
}
