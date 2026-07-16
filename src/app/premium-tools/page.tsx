import { toolsRegistry } from "@/registry/tools";
import type { ToolMetadata } from "@/registry/tools";
import { PremiumToolsClient } from "./PremiumToolsClient";

export default function PremiumToolsPage() {
  const proTools = toolsRegistry.filter(t => t.isPro && t.showInCategory !== false);
  return <PremiumToolsClient proTools={proTools} proCount={proTools.length} toolCount={toolsRegistry.length} />;
}
