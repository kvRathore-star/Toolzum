"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { toolsRegistry } from "@/registry/tools";
import type { ToolMetadata } from "@/registry/tools";
import { Search, ChevronLeft, ChevronRight, Grid3X3, List, ChevronDown, PanelLeft, AlignJustify, Image, FileText, Code2, Briefcase, Wrench, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryTheme, getCategoryGroup } from "@/lib/categoryTheme";

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
const GROUP_ORDER = ['Media', 'Text & AI', 'Developer & Tech', 'Business & Finance', 'Tools & Converters', 'Lifestyle'];
const GROUP_ICONS: Record<string, React.ReactNode> = {
  'Media': <Image className="w-3.5 h-3.5" />,
  'Text & AI': <FileText className="w-3.5 h-3.5" />,
  'Developer & Tech': <Code2 className="w-3.5 h-3.5" />,
  'Business & Finance': <Briefcase className="w-3.5 h-3.5" />,
  'Tools & Converters': <Wrench className="w-3.5 h-3.5" />,
  'Lifestyle': <Compass className="w-3.5 h-3.5" />,
};

export function ToolsDirectoryClient({ initialTools }: { initialTools?: ToolMetadata[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [navMode, setNavMode] = useState<'sidebar' | 'menubar'>('sidebar');
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('toolzum:navMode');
    if (saved === 'sidebar' || saved === 'menubar') setNavMode(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('toolzum:navMode', navMode);
  }, [navMode]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const groupedCategories = useMemo(() => {
    const source = initialTools ?? toolsRegistry;
    const cats = Array.from(new Set(source.map(t => t.category).filter(Boolean)));
    const groups: Record<string, string[]> = {};
    cats.sort().forEach(c => {
      const group = getCategoryGroup(c);
      if (!groups[group]) groups[group] = [];
      groups[group].push(c);
    });
    return groups;
  }, [initialTools]);

  const allCategories = useMemo(() => {
    const cats = Array.from(new Set((initialTools ?? toolsRegistry).map(t => t.category).filter(Boolean)));
    return ["All", ...cats.sort()];
  }, [initialTools]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const categoryParam = urlParams.get("category");
      if (categoryParam) {
        const match = allCategories.find(c => c.toLowerCase() === categoryParam.toLowerCase());
        if (match) setActiveCategory(match);
      }
    }
  }, [allCategories]);

  const filteredTools = useMemo(() => {
    return (initialTools ?? toolsRegistry).filter(tool => {
      if (tool.showInCategory === false) return false;
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

  const CategoryMenubar = () => (
    <div ref={menuRef} className="mb-8">
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveCategory("All")}
          className={`shrink-0 px-3 py-2 text-[11px] font-mono uppercase tracking-wider rounded-[var(--radius-md)] transition-colors border ${
            activeCategory === "All"
              ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
              : "border-[var(--border-subtle)] bg-[var(--bg-overlay)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]"
          }`}
        >
          All
        </button>
        {GROUP_ORDER.map(groupLabel => {
          const cats = groupedCategories[groupLabel];
          if (!cats || cats.length === 0) return null;
          return (
            <div key={groupLabel} className="relative shrink-0">
              <button
                onClick={() => setOpenGroup(openGroup === groupLabel ? null : groupLabel)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-mono uppercase tracking-wider rounded-[var(--radius-md)] transition-colors border ${
                  activeCategory !== "All" && cats.includes(activeCategory)
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-overlay)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]'
                }`}
              >
                <span className={activeCategory !== "All" && cats.includes(activeCategory) ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}>
                  {GROUP_ICONS[groupLabel]}
                </span>
                {groupLabel}
                <ChevronDown className={`w-3 h-3 transition-transform ${openGroup === groupLabel ? 'rotate-180' : ''}`} />
              </button>
              {openGroup === groupLabel && (
                <div
                  className="absolute top-full left-0 mt-1 w-52 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] py-2 z-50"
                  onMouseLeave={() => setOpenGroup(null)}
                >
                  {cats.map(cat => {
                    const theme = getCategoryTheme(cat);
                    const Icon = theme.icon;
                    const isCatActive = cat === activeCategory;
                    const catDisplay = CATEGORY_DISPLAY_NAMES[cat.toLowerCase()] || cat;
                    const count = (initialTools ?? toolsRegistry).filter(t => t.category === cat && t.showInCategory !== false).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => { setActiveCategory(cat); setOpenGroup(null); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                          isCatActive
                            ? 'text-[var(--accent)] bg-[var(--accent-soft)] font-medium'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${theme.iconColor}`} />
                        <span className="flex-1 text-left">{catDisplay}</span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">{count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const Sidebar = () => (
    <aside className="w-full md:w-64 shrink-0">
      <div className="md:sticky md:top-[100px] flex flex-col gap-4">
        <div>
          <button
            onClick={() => setActiveCategory("All")}
            className={`w-full text-left px-3 py-2 text-sm rounded-[var(--radius-md)] transition-colors ${
              activeCategory === "All"
                ? "bg-[var(--accent-soft)] text-[var(--accent)] font-medium border-l-2 border-[var(--accent)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] border-l-2 border-transparent"
            }`}
          >
            All Tools
          </button>
        </div>
        {GROUP_ORDER.map(group => {
          const cats = groupedCategories[group];
          if (!cats || cats.length === 0) return null;
          return (
            <div key={group}>
              <h3 className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1 px-3">
                {group}
              </h3>
              <div className="flex flex-col gap-0.5">
                {cats.map(category => {
                  const displayName = CATEGORY_DISPLAY_NAMES[category.toLowerCase()] || category;
                  const theme = getCategoryTheme(category);
                  const Icon = theme.icon;
                  const count = (initialTools ?? toolsRegistry).filter(t => t.category === category && t.showInCategory !== false).length;
                  return (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`flex items-center gap-2 text-left px-3 py-1.5 text-sm rounded-[var(--radius-md)] transition-colors border-l-2 ${
                        activeCategory === category
                          ? "bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--accent)] font-medium"
                          : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${theme.iconColor} shrink-0`} />
                      <span className="flex-1">{displayName}</span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      {/* Header Area */}
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="font-[family-name:var(--font-serif)] text-4xl sm:text-5xl text-[var(--text-primary)] mb-4">
            Ecosystem Directory
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl">
            Explore {(initialTools ?? toolsRegistry).filter(t => t.showInCategory !== false).length}+ offline-first utilities. Everything runs locally in your browser.
          </p>
          
          <div className="mt-8 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input 
              type="text"
              placeholder="Search directory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all text-base"
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8 lg:gap-12">
        
        {/* Navigation: Sidebar or Menubar */}
        {navMode === 'sidebar' ? <Sidebar /> : null}

        <main className="flex-1">
          {/* Top controls row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-medium text-[var(--text-primary)]">
                {activeCategory === "All" ? "All Tools" : activeCategory}
              </h2>
              <span className="text-sm text-[var(--text-muted)] font-mono">{filteredTools.length} results</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Nav mode toggle */}
              <div className="flex bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-0.5">
                <button onClick={() => setNavMode('sidebar')} className={`p-2 rounded-[var(--radius-md)] transition-colors ${navMode === 'sidebar' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`} title="Sidebar navigation">
                  <PanelLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setNavMode('menubar')} className={`p-2 rounded-[var(--radius-md)] transition-colors ${navMode === 'menubar' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`} title="Horizontal menu navigation">
                  <AlignJustify className="w-4 h-4" />
                </button>
              </div>
              {/* View mode toggle */}
              <div className="flex bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-0.5">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-[var(--radius-md)] transition-colors ${viewMode === 'grid' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`} aria-label="Grid view">
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-[var(--radius-md)] transition-colors ${viewMode === 'list' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`} aria-label="List view">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal menubar when active */}
          {navMode === 'menubar' && <CategoryMenubar />}

          {/* Empty / Grid / List */}
          {filteredTools.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-[var(--border-subtle)] rounded-[var(--radius-xl)] bg-[var(--bg-overlay)]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-surface)] flex items-center justify-center">
                <Search className="w-6 h-6 text-[var(--text-muted)]" />
              </div>
              <p className="text-[var(--text-muted)] mb-4">No tools found matching your criteria.</p>
              <Button variant="secondary" onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}>
                Clear filters
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
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
                    <div className={`h-full p-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] transition-all duration-300 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--border-default)] hover:-translate-y-0.5 ${theme.gradientHover}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-9 h-9 rounded-xl ${theme.bgTint} flex items-center justify-center ring-1 ring-[var(--border-subtle)] group-hover:ring-[var(--accent)]/30 transition-all`}>
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
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4 leading-relaxed">
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
            </>
          ) : (
            <div className="space-y-2">
              {paginatedTools.map((tool) => {
                const theme = getCategoryTheme(tool.category);
                const Icon = theme.icon;
                return (
                  <Link
                    key={tool.id}
                    href={`/${tool.category.toLowerCase().replace(/\s+/g, '-')}/${tool.slug}`}
                    className="group flex items-center gap-4 p-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--border-default)] hover:-translate-y-0.5"
                  >
                    <div className={`w-10 h-10 rounded-xl ${theme.bgTint} flex items-center justify-center shrink-0 ring-1 ring-[var(--border-subtle)]`}>
                      <Icon className={`w-5 h-5 ${theme.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{tool.name}</h3>
                        <span className="text-[9px] font-mono text-[var(--text-muted)] bg-[var(--bg-overlay)] px-1.5 py-0.5 rounded">{tool.category}</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] truncate">{tool.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}

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
        </main>
      </div>
    </div>
  );
}
