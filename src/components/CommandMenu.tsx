"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { Command } from "cmdk";
import Fuse from "fuse.js";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Search, Sparkles, Zap, Layout, Sun, Moon, Home, Star } from "lucide-react";
import { clientToolsRegistry } from "@/registry/tools-client-index";
import { useFavorites } from "@/hooks/useFavorites";
import { aliasesForSlug } from "@/lib/searchAliases";

interface CommandMenuProps {
  open: boolean;
  onClose: () => void;
}

// Loaded on demand via next/dynamic from Header — cmdk + the full toolsRegistry
// stay out of the initial bundle until the user actually opens search.
export function CommandMenu({ open, onClose }: CommandMenuProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { favorites } = useFavorites();
  const [query, setQuery] = useState("");

  const HISTORY_KEY = "toolzum_search_history";
  // Category filter: narrows tool groups only — favorites, recents and
  // actions always stay visible. Null = unfiltered (today's behavior).
  const [catFilter, setCatFilter] = useState<string | null>(null);  const [history, setHistory] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string").slice(0, 5) : [];
    } catch {
      return [];
    }
  });

  const runCommand = (command: () => void) => {
    const q = query.trim();
    if (q) {
      setHistory((prev) => {
        const next = [q, ...prev.filter((s) => s !== q)].slice(0, 5);
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        } catch {
          /* private mode — history just won't persist */
        }
        return next;
      });
    }
    setCatFilter(null);
    onClose();
    command();
  };

  // Group tools by category
  const categories = useMemo(() => {
    const groups: Record<string, typeof clientToolsRegistry> = {};
    clientToolsRegistry.forEach((tool) => {
      if (!groups[tool.category]) {
        groups[tool.category] = [];
      }
      groups[tool.category]!.push(tool);
    });
    return groups;
  }, []);

  // Typo-tolerant ranking (Sep 2026): fuse over name/slug/description +
  // synonym aliases. cmdk still owns keyboard nav; we only decide visibility
  // (filter) and relevance order (rank-sorted before render).
  const fuseDocs = useMemo(
    () =>
      clientToolsRegistry.map((t) => ({
        ...t,
        searchText: `${t.description ?? ""} ${aliasesForSlug(t.slug).join(" ")}`,
      })),
    [],
  );
  const fuse = useMemo(
    () =>
      new Fuse(fuseDocs, {
        keys: [
          { name: "name", weight: 0.45 },
          { name: "slug", weight: 0.25 },
          { name: "searchText", weight: 0.2 },
          { name: "category", weight: 0.1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
        includeScore: false,
      }),
    [fuseDocs],
  );

  // Multi-word queries behave as token-AND: every token must match
  // (typo-tolerated), full-token hits outrank partials. Single tokens take
  // the fast path. "merge pdf" must surface bulk-pdf-merger, not just any
  // tool with "merge" or "pdf" in its name.
  const ranked = React.useCallback(
    (q: string): string[] => {
      const tokens = q
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 6);
      if (tokens.length <= 1) {
        return fuse.search(q).map((r) => (r.item as { slug: string }).slug);
      }
      const hits = new Map<string, { count: number; rankSum: number }>();
      tokens.forEach((t) => {
        fuse.search(t).forEach((r, i) => {
          const slug = (r.item as { slug: string }).slug;
          const prev = hits.get(slug) ?? { count: 0, rankSum: 0 };
          hits.set(slug, { count: prev.count + 1, rankSum: prev.rankSum + i });
        });
      });
      return [...hits.entries()]
        .sort((a, b) => b[1].count - a[1].count || a[1].rankSum - b[1].rankSum)
        .map(([slug]) => slug);
    },
    [fuse],
  );

  const rankedSlugs = useMemo(() => {
    const q = query.trim();
    if (!q) return null;
    return new Set(ranked(q).map((slug) => slug));
  }, [fuse, query, ranked]);

  const rankOf = useMemo(() => {
    const q = query.trim();
    if (!q) return null;
    const order = new Map<string, number>();
    ranked(q).forEach((slug, i) => order.set(slug, i));
    return order;
  }, [fuse, query, ranked]);

  // Missed-query log (zero-result searches only, truncated): feeds the
  // synonym map — top misses get promoted to SEARCH_ALIASES monthly.
  // Never logs successful searches (privacy: typed text stays local).
  const loggedMisses = useRef<Set<string>>(new Set());
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q || rankedSlugs === null || rankedSlugs.size > 0) return;
    if (loggedMisses.current.has(q)) return;
    loggedMisses.current.add(q);
    const t = window.setTimeout(() => {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: `search:miss:${q.slice(0, 80)}`,
          clientType: "search",
        }),
      }).catch(() => {});
    }, 800);
    return () => window.clearTimeout(t);
  }, [query, rankedSlugs]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-[var(--bg-base)]/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] p-4"
    >
      <button
        aria-label="Close search"
        onClick={onClose}
        tabIndex={-1}
        className="absolute inset-0 cursor-default bg-transparent border-0 p-0"
      />
        <div 
          className="relative w-[calc(100%-2rem)] max-w-[600px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] overflow-hidden flex flex-col max-h-[60vh] mt-[10vh]"
        >
          <Command
            className="flex flex-col h-full"
            // Fuse decides tool visibility (typo-tolerant); non-tool rows
            // (recents, actions) keep plain substring matching on their text.
            filter={(value, search) => {
              const q = search.trim().toLowerCase();
              if (!q || rankedSlugs === null) return 1;
              if (rankedSlugs.has(value)) return 1;
              return value.toLowerCase().includes(q) ? 1 : 0;
            }}
          >
            <div className="flex items-center border-b border-[var(--border-subtle)] px-4">
              <Search className="w-5 h-5 text-[var(--text-muted)] mr-3 shrink-0" />
              <Command.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Search tools, categories, or actions..."
                className="w-full py-5 text-[var(--text-primary)] placeholder-[var(--text-muted)] bg-transparent border-none outline-none focus:ring-0 text-[18px]"
              />
            </div>

            <Command.List className="overflow-y-auto p-2 flex-1 scrollbar-thin scrollbar-thumb-[var(--border-subtle)]">
              <Command.Empty className="py-12 text-center text-sm text-[var(--text-muted)]">
                No matching tools or settings found.
              </Command.Empty>

              <div className="flex gap-1.5 overflow-x-auto px-2 py-2" role="group" aria-label="Filter by category">
                <button
                  onClick={() => setCatFilter(null)}
                  aria-pressed={catFilter === null}
                  className={`shrink-0 px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${catFilter === null ? "bg-[var(--accent-ink)] text-white border-transparent" : "text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]"}`}
                >
                  All
                </button>
                {Object.keys(categories).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCatFilter(catFilter === c ? null : c)}
                    aria-pressed={catFilter === c}
                    className={`shrink-0 px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${catFilter === c ? "bg-[var(--accent-ink)] text-white border-transparent" : "text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]"}`}
                  >
                    {c === "indian-utilities" ? "India Utilities" : c}
                  </button>
                ))}
              </div>

              {!query && history.length > 0 && (
                <Command.Group heading="Recent Searches" className="px-2 py-2 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.06em]">
                  {history.map((h) => (
                    <Command.Item
                      key={h}
                      value={`recent-${h}`}
                      onSelect={() => setQuery(h)}
                      className="flex items-center h-[48px] px-3 rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer data-[selected=true]:bg-[var(--bg-surface)] data-[selected=true]:text-[var(--text-primary)] transition-colors"
                    >
                      <Search className="w-4 h-4 text-[var(--text-muted)] mr-3" />
                      <span className="font-medium flex-1 text-left">{h}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {favorites.size > 0 && (
                <Command.Group heading="Your Favorites" className="px-2 py-2 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.06em]">
                  {Array.from(favorites).map(slug => {
                    const tool = clientToolsRegistry.find(t => t.slug === slug);
                    if (!tool) return null;
                    return (
                      <Command.Item
                        key={slug}
                        value={slug}
                        onSelect={() => runCommand(() => router.push(`/${tool.category.toLowerCase().replace(/\s+/g, '-')}/${tool.slug}`))}
                        className="flex items-center h-[48px] px-3 rounded-[var(--radius-md)] text-[14px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer data-[selected=true]:bg-[var(--bg-surface)] data-[selected=true]:text-[var(--text-primary)] transition-colors group"
                      >
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-3" />
                        <span className="font-medium flex-1 text-left">{tool.name}</span>
                        <span className="text-[11px] font-mono text-[var(--text-muted)] px-2 bg-[var(--bg-overlay)] rounded-full">
                          {tool.category}
                        </span>
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              )}

              <Command.Group heading="Actions" className="px-2 py-2 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.06em]">
                <Command.Item
                  onSelect={() => runCommand(() => router.push("/"))}
                  className="flex items-center h-[48px] px-3 rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer data-[selected=true]:bg-[var(--bg-surface)] data-[selected=true]:text-[var(--text-primary)] transition-colors"
                >
                  <Home className="w-4 h-4 text-[var(--text-muted)] mr-3" />
                  <span className="flex-1 font-medium">Go to Home Page</span>
                  <span className="text-[11px] text-[var(--text-muted)] bg-[var(--bg-overlay)] px-1.5 py-0.5 rounded">Action</span>
                </Command.Item>

                <Command.Item
                  onSelect={() => runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))}
                  className="flex items-center h-[48px] px-3 rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer data-[selected=true]:bg-[var(--bg-surface)] data-[selected=true]:text-[var(--text-primary)] transition-colors"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-[var(--text-muted)] mr-3" />
                  ) : (
                    <Moon className="w-4 h-4 text-[var(--text-muted)] mr-3" />
                  )}
                  <span className="flex-1 font-medium">Switch to {theme === "dark" ? "Light" : "Dark"} Mode</span>
                  <span className="text-[11px] text-[var(--text-muted)] bg-[var(--bg-overlay)] px-1.5 py-0.5 rounded">Theme</span>
                </Command.Item>
              </Command.Group>

              {Object.entries(categories)
                .filter(([category]) => !catFilter || category === catFilter)
                .map(([category, items]) => (
                <Command.Group
                  key={category}
                  heading={category === "indian-utilities" ? "India Utilities" : category}
                  className="mt-2 px-2 py-2 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.06em]"
                >
                  {items
                    .slice()
                    .sort((a, b) => (rankOf?.get(a.slug) ?? 1e9) - (rankOf?.get(b.slug) ?? 1e9))
                    .map((tool) => (
                    <Command.Item
                      key={tool.id}
                      value={tool.slug}
                      onSelect={() =>
                        runCommand(() =>
                          router.push(
                            `/${tool.category.toLowerCase().replace(/\s+/g, "-")}/${tool.slug}`
                          )
                        )
                      }
                      className="flex items-center h-[48px] px-3 rounded-[var(--radius-md)] text-[14px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer data-[selected=true]:bg-[var(--bg-surface)] data-[selected=true]:text-[var(--text-primary)] transition-colors group"
                    >
                      {tool.category === "AI" ? (
                        <Sparkles className="w-4 h-4 text-violet-500 mr-3 group-data-[selected=true]:text-[var(--accent)]" />
                      ) : tool.category === "indian-utilities" ? (
                        <Zap className="w-4 h-4 text-[var(--india)] mr-3 group-data-[selected=true]:text-[var(--accent)]" />
                      ) : (
                        <Layout className="w-4 h-4 text-blue-700 dark:text-blue-400 mr-3 group-data-[selected=true]:text-[var(--accent)]" />
                      )}
                      <span className="font-medium flex-1 text-left">{tool.name}</span>
                      <span className="text-[11px] font-mono text-[var(--text-muted)] px-2 bg-[var(--bg-overlay)] rounded-full">
                        {tool.category}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>

            <div className="border-t border-[var(--border-subtle)] px-4 py-3 bg-[var(--bg-overlay)] flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
              <div className="flex gap-4">
                <span>↑↓ navigate</span>
                <span>Enter select</span>
              </div>
              <div>
                <span>Esc close</span>
              </div>
            </div>
          </Command>
        </div>
      </div>
  );
}
