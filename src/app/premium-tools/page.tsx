import { toolsRegistry } from "@/registry/tools";
import { getCachedToolCounts } from "@/registry/tools-helpers";
import { PremiumToolsClient } from "./PremiumToolsClient";

const { proTools, totalImplemented } = getCachedToolCounts();
const proToolList = toolsRegistry.filter(t => t.isPro && t.showInCategory !== false);

export default function PremiumToolsPage() {
  return <PremiumToolsClient proTools={proToolList} proCount={proTools} toolCount={totalImplemented} />;
}
