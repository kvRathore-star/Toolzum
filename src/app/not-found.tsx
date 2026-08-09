import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
  alternates: null,
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="text-8xl font-bold text-[var(--text-muted)] mb-4 font-[family-name:var(--font-serif)] tracking-tight">
          <span className="inline-block animate-pulse">4</span>
          <span className="inline-block animate-pulse [animation-delay:200ms]">0</span>
          <span className="inline-block animate-pulse [animation-delay:400ms]">4</span>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
          Page not found
        </h1>
        <p className="text-[var(--text-secondary)] mb-8 text-sm leading-relaxed">
          This page doesn't exist or may have been moved. Try searching the
          tools directory.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
          >
            Home
          </Link>
          <Link
            href="/tools"
            className="px-6 py-3 bg-[var(--bg-overlay)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl font-medium transition-colors border border-[var(--border-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
          >
            Browse tools
          </Link>
        </div>
      </div>
    </div>
  );
}
