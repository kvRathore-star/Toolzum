"use client";

export function ToolCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-[180px] rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 animate-pulse"
        >
          <div className="w-3/4 h-4 bg-[var(--bg-overlay)] rounded mb-3" />
          <div className="w-full h-3 bg-[var(--bg-overlay)] rounded mb-2" />
          <div className="w-2/3 h-3 bg-[var(--bg-overlay)] rounded mb-6" />
          <div className="flex gap-2">
            <div className="w-16 h-6 bg-[var(--bg-overlay)] rounded-full" />
            <div className="w-16 h-6 bg-[var(--bg-overlay)] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CategoryCardSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-[140px] rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 animate-pulse"
        >
          <div className="w-10 h-10 bg-[var(--bg-overlay)] rounded-lg mb-3" />
          <div className="w-1/2 h-4 bg-[var(--bg-overlay)] rounded mb-2" />
          <div className="w-3/4 h-3 bg-[var(--bg-overlay)] rounded" />
        </div>
      ))}
    </div>
  );
}
