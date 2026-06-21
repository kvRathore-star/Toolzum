import { ToolCardSkeleton } from "@/components/ToolCardSkeleton";

export default function Loading() {
  return (
    <div className="min-h-[60vh] max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="w-48 h-8 bg-[var(--bg-overlay)] rounded animate-pulse mb-2" />
        <div className="w-80 h-4 bg-[var(--bg-overlay)] rounded animate-pulse" />
      </div>
      <ToolCardSkeleton count={12} />
    </div>
  );
}
