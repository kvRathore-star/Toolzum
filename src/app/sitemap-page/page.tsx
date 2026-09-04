import React from "react";
import { Map, ArrowUp } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { clientToolsRegistry } from "@/registry/tools-client-index";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Complete list of all Toolzum tools organized by category.",
  alternates: { canonical: "https://toolzum.com/sitemap/" },
};

const CATEGORY_ORDER = [
  "Image", "PDF", "Video", "Audio", "Developer", "Text", "AI",
  "Calculator", "Financial", "Color", "Unit", "Web", "Security",
  "Network", "Data", "File", "Social", "Privacy", "Design",
];

const grouped: Record<string, { slug: string; name: string }[]> = {};
for (const tool of clientToolsRegistry) {
  if (!grouped[tool.category]) grouped[tool.category] = [];
  grouped[tool.category].push({ slug: tool.slug, name: tool.name });
}

const sortedCategories = CATEGORY_ORDER.filter((c) => grouped[c]?.length);

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none opacity-[0.03]">
        <div className="w-full max-w-[1280px] h-full" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-sm font-semibold text-[var(--accent)] mb-6">
            <Map className="w-4 h-4" /> Site Navigation
          </span>
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-7xl mb-6 tracking-tight leading-tight">
            Sitemap
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)]">
            {clientToolsRegistry.length}+ tools organized by category. Find what you need.
          </p>
        </div>

        {/* Static Pages */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Pages</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { href: "/", label: "Home" },
              { href: "/tools", label: "All Tools" },
              { href: "/pricing", label: "Pricing" },
              { href: "/about", label: "About" },
              { href: "/contact", label: "Contact" },
              { href: "/blog", label: "Blog" },
              { href: "/changelog", label: "Changelog" },
              { href: "/security", label: "Security" },
              { href: "/privacy-policy", label: "Privacy Policy" },
              { href: "/terms", label: "Terms of Service" },
              { href: "/disclaimer", label: "Disclaimer" },
              { href: "/sitemap", label: "Sitemap" },
            ].map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="px-4 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-colors"
              >
                {page.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Tool Categories */}
        <div className="max-w-4xl mx-auto space-y-12">
          {sortedCategories.map((category) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                {category}
                <span className="text-xs font-mono text-[var(--text-muted)]">({grouped[category].length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {grouped[category]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      className="px-4 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 transition-colors truncate"
                      title={tool.name}
                    >
                      {tool.name}
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Back to top */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            <ArrowUp className="w-4 h-4" /> Back to top
          </button>
        </div>

      </div>
    </div>
  );
}
