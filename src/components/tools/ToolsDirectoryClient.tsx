"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { toolsRegistry } from "@/registry/tools";
import type { ToolMetadata } from "@/registry/tools";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryTheme } from "@/lib/categoryTheme";

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'indian-utilities': 'India 🇮🇳',
  'e-commerce': 'E-Commerce',
  'ai': 'AI Tools',
  'transcription': 'Transcription',
  'branding': 'Branding',
  'productivity': 'Productivity',
  'marketing': 'Marketing',
};

const ITEMS_PER_PAGE = 30;

export function ToolsDirectoryClient({ initialTools }: { initialTools?: ToolMetadata[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const source = initialTools ?? toolsRegistry;
    const cats = Array.from(new Set(source.map(t => t.category).filter(Boolean)));
    return ["All", ...cats.sort()];
  }, [initialTools]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const categoryParam = urlParams.get("category");
      if (categoryParam) {
        const match = categories.find(c => c.toLowerCase() === categoryParam.toLowerCase());
        if (match) setActiveCategory(match);
      }
    }
  }, [categories]);

  const filteredTools = useMemo(() => {
    return (initialTools ?? toolsRegistry).filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, initialTools]);

  const totalPages = Math.max(1, Math.ceil(filteredTools.length / ITEMS_PER_PAGE));
  const paginatedTools = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTools.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTools, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Header Area */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="font-[family-name:var(--font-serif)] text-4xl sm:text-5xl text-[var(--text-primary)] mb-4">
            Ecosystem Directory
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl">
            Explore {(initialTools ?? toolsRegistry).length}+ offline-first utilities. Everything runs locally in your browser.
          </p>
          
          <div className="mt-8 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input 
              type="text"
              placeholder="Search directory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-default)] transition-colors text-base"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8 lg:gap-12">
        
        {/* Sticky Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="md:sticky md:top-[100px] flex flex-col gap-1">
            <h3 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-3">
              Categories
            </h3>
            {categories.map(category => {
              const displayName = CATEGORY_DISPLAY_NAMES[category.toLowerCase()] || category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`text-left px-3 py-2 text-sm rounded-[var(--radius-md)] transition-colors border-l-2 ${
                    activeCategory === category
                      ? "bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--accent)] font-medium"
                      : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
                  }`}
                >
                  {displayName}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Grid */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-[var(--text-primary)]">
              {activeCategory === "All" ? "All Tools" : activeCategory}
            </h2>
            <span className="text-sm text-[var(--text-muted)]">{filteredTools.length} results</span>
          </div>

          {filteredTools.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-[var(--border-subtle)] rounded-[var(--radius-xl)] bg-[var(--bg-overlay)]">
              <p className="text-[var(--text-muted)] mb-4">No tools found matching your criteria.</p>
              <Button variant="secondary" onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}>
                Clear filters
              </Button>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedTools.map((tool) => {
                const theme = getCategoryTheme(tool.category);
                const Icon = theme.icon;

                return (
                  <Link 
                    key={tool.id} 
                    href={`/${tool.category.toLowerCase().replace(/\s+/g, '-')}/${tool.slug}`}
                    className="group block h-full"
                  >
                    <div className={`h-full p-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] transition-all duration-300 shadow-sm hover:shadow-[var(--shadow-md)] hover:border-[var(--border-default)] hover:-translate-y-1 ${theme.gradientHover}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-8 h-8 rounded-full ${theme.bgTint} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${theme.iconColor}`} />
                        </div>
                        <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-overlay)] border border-[var(--border-subtle)] px-2 py-0.5 rounded">
                          {tool.category}
                        </span>
                      </div>
                      <h3 className="text-base font-medium text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors flex items-center gap-2">
                        {tool.name}
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all text-[var(--accent)]" />
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">
                        {tool.description}
                      </p>
                      <div className="h-1.5 w-full bg-[var(--bg-overlay)] rounded-full overflow-hidden">
                        <div className={`h-full ${theme.bgTint.replace('/10', '')} opacity-50`} style={{ width: `${(tool.id.charCodeAt(0) % 50) + 25}%` }} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-sm text-[var(--text-secondary)]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>)}
        </main>
      </div>
    </div>
  );
}
