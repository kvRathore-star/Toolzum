"use client";

import React from "react";
import Link from "next/link";
import { ToolMetadata, ToolCategory } from "@/registry/tools";
import { Search, ChevronRight, Grid3X3, List } from "lucide-react";
import { getCategoryTheme, getCategoryGroup } from "@/lib/categoryTheme";

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

const SUB_CATEGORIES: Record<string, { label: string; icon: string }[]> = {
  Image: [
    { label: 'Compress', icon: '🗜️' },
    { label: 'Resize', icon: '📐' },
    { label: 'Convert', icon: '🔄' },
    { label: 'Edit', icon: '✏️' },
    { label: 'AI', icon: '🤖' },
  ],
  PDF: [
    { label: 'Compress', icon: '🗜️' },
    { label: 'Merge', icon: '📑' },
    { label: 'Split', icon: '✂️' },
    { label: 'Convert', icon: '🔄' },
    { label: 'Edit', icon: '✏️' },
  ],
};

export function CategoryPageClient({ category, tools }: CategoryPageClientProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const displayName = CATEGORY_DISPLAY_NAMES[category.toLowerCase()] || category;
  const group = getCategoryGroup(category);
  const subCats = SUB_CATEGORIES[category];

  const filtered = searchQuery
    ? tools.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    : tools;

  const toolCount = filtered.length;

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">ToolHub</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/tools" className="hover:text-[var(--text-primary)] transition-colors">Tools</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--text-primary)]">{displayName}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] font-mono text-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-1 rounded-full tracking-wider uppercase">
              {group}
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-serif)] text-4xl sm:text-5xl text-[var(--text-primary)] mb-3">
            {displayName} Tools
          </h1>
          <p className="text-[var(--text-secondary)] text-lg">
            {tools.length} free online {category.toLowerCase()} utilities — all processed locally in your browser.
          </p>
        </div>

        {/* Sub-category quick-nav */}
        {subCats && (
          <div className="flex flex-wrap gap-2 mb-8">
            {subCats.map(sc => (
              <button
                key={sc.label}
                onClick={() => setSearchQuery(sc.label.toLowerCase())}
                className="text-xs px-3 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)] transition-all"
              >
                {sc.icon} {sc.label}
              </button>
            ))}
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs px-3 py-1.5 rounded-full border border-dashed border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-all"
            >
              Clear
            </button>
          </div>
        )}

        {/* Search + view toggle */}
        <div className="flex items-center gap-4 mb-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              aria-label="Search tools"
              placeholder={`Search ${displayName} tools...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all text-base"
            />
          </div>
          <div className="flex bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-0.5">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-[var(--radius-md)] transition-colors ${viewMode === 'grid' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`} aria-label="Grid view">
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-[var(--radius-md)] transition-colors ${viewMode === 'list' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`} aria-label="List view">
              <List className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">{toolCount} tool{toolCount !== 1 ? 's' : ''}</span>
        </div>

        {/* Tool Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((tool) => {
              const { icon: Icon, color, bg, gradient } = getIconBg(tool);
              return (
                <Link
                  key={tool.id}
                  href={`/${tool.category.toLowerCase().replace(/\s+/g, '-')}/${tool.slug}`}
                  className="group block h-full"
                >
                  <div className={`h-full p-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] transition-all duration-300 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--border-default)] hover:-translate-y-0.5 ${gradient}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center ring-1 ring-[var(--border-subtle)] group-hover:ring-[var(--accent)]/30 transition-all`}>
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                    </div>
                    <h3 className="text-base font-medium text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors flex items-center gap-2">
                      {tool.name}
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all text-[var(--accent)]" />
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>
                    <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]/50">
                      <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                        {tool.dependencies}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((tool) => {
              const { icon: Icon, color, bg } = getIconBg(tool);
              return (
                <Link
                  key={tool.id}
                  href={`/${tool.category.toLowerCase().replace(/\s+/g, '-')}/${tool.slug}`}
                  className="group flex items-center gap-4 p-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--border-default)] hover:-translate-y-0.5"
                >
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0 ring-1 ring-[var(--border-subtle)]`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{tool.name}</h3>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{tool.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="py-24 text-center border border-dashed border-[var(--border-subtle)] rounded-[var(--radius-xl)] bg-[var(--bg-overlay)]">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-surface)] flex items-center justify-center">
              <Search className="w-6 h-6 text-[var(--text-muted)]" />
            </div>
            <p className="text-[var(--text-muted)] mb-2">No tools found matching &quot;{searchQuery}&quot;.</p>
            <p className="text-xs text-[var(--text-muted)] mb-4">Try a different search term or browse other categories.</p>
            <button onClick={() => setSearchQuery('')} className="px-4 py-2 text-xs font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-[var(--radius-lg)] transition-colors">
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
