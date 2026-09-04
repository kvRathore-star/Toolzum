import { toolsRegistry } from "@/registry/tools";
import { getCachedToolCounts } from "@/registry/tools-helpers";
import { proSlugs } from "@/registry/tools-constants";
import { PremiumToolsClient } from "./PremiumToolsClient";

const { proTools, totalImplemented } = getCachedToolCounts();
const proToolList = toolsRegistry.filter(t => proSlugs.includes(t.slug) && t.showInCategory !== false);

export default function PremiumToolsPage() {
  return <PremiumToolsClient proTools={proToolList} proCount={proTools} toolCount={totalImplemented} />;
}
