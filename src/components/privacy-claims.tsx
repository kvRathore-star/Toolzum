import { getCachedToolCounts } from '@/registry/tools-helpers';
import type { ToolMetadata } from '@/registry/tools-types';
import { classifyDependencies } from '@/lib/cloudPatterns';

export function ToolCountBadge() {
  const { totalImplemented, localTools, cloudTools, hybridTools } = getCachedToolCounts();
  const pct = Math.round((localTools / totalImplemented) * 100);
  return <>{totalImplemented.toLocaleString()} free tools · {pct}% local · no signup</>;
}

export function PrivacyClaim() {
  const { localTools, cloudTools, hybridTools } = getCachedToolCounts();
  const totalCloud = cloudTools + hybridTools;
  return <>{localTools.toLocaleString()} tools run 100% in your browser. {totalCloud} use cloud processing — clearly marked on every tool.</>;
}

export function ShortPrivacyClaim() {
  const { localTools } = getCachedToolCounts();
  return <>{localTools.toLocaleString()} tools run in your browser</>;
}

export function PerToolBadge({ tool }: { tool: ToolMetadata }) {
  const verdict = classifyDependencies(tool.dependencies);
  if (verdict === "cloud") {
    return <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />Cloud AI</span>;
  }
  if (verdict === "hybrid") {
    return <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />Hybrid</span>;
  }
  if (verdict === "unverified") {
    return <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />Unverified</span>;
  }
  return <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />100% Local</span>;
}
