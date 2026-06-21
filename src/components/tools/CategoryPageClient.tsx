"use client";

import React from "react";
import Link from "next/link";
import { ToolMetadata, ToolCategory } from "@/registry/tools";
import { Search, ChevronRight } from "lucide-react";
import { getCategoryTheme } from "@/lib/categoryTheme";

interface CategoryPageClientProps {
  category: ToolCategory;
  tools: ToolMetadata[];
}

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'indian-utilities': 'India 🇮🇳',
  'e-commerce': 'E-Commerce',
  'ai': 'AI Tools',
};

function getIconBg(tool: ToolMetadata) {
  const theme = getCategoryTheme(tool.category);
  return {
    icon: theme.icon,
    color: theme.iconColor,
    bg: theme.bgTint,
    gradient: theme.gradientHover,
  };
}

export function CategoryPageClient({ category, tools }: CategoryPageClientProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const displayName = CATEGORY_DISPLAY_NAMES[category.toLowerCase()] || category;

  const filtered = searchQuery
    ? tools.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    : tools;

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">ToolHub</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/tools" className="hover:text-[var(--text-primary)] transition-colors">Tools</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--text-primary)]">{displayName}</span>
        </nav>

        <div className="mb-10">
          <h1 className="font-[family-name:var(--font-serif)] text-4xl sm:text-5xl text-[var(--text-primary)] mb-3">
            {displayName} Tools
          </h1>
          <p className="text-[var(--text-secondary)] text-lg">
            {tools.length} free online {category.toLowerCase()} utilities — all processed locally in your browser.
          </p>
        </div>

        <div className="relative max-w-md mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          <input
            type="text"
            aria-label="Search tools"
            placeholder={`Search ${displayName} tools...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-default)] transition-colors text-base"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tool) => {
            const { icon: Icon, color, bg, gradient } = getIconBg(tool);
            return (
              <Link
                key={tool.id}
                href={`/${tool.category.toLowerCase().replace(/\s+/g, '-')}/${tool.slug}`}
                className="group block h-full"
              >
                <div className={`h-full p-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] transition-all duration-300 shadow-sm hover:shadow-[var(--shadow-md)] hover:border-[var(--border-default)] hover:-translate-y-1 ${gradient}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                  </div>
                  <h3 className="text-base font-medium text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors flex items-center gap-2">
                    {tool.name}
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all text-[var(--accent)]" />
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center border border-dashed border-[var(--border-subtle)] rounded-[var(--radius-xl)] bg-[var(--bg-overlay)]">
            <p className="text-[var(--text-muted)]">No tools found matching "{searchQuery}".</p>
          </div>
        )}
      </div>
    </div>
  );
}
