"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, LayoutGrid } from 'lucide-react';

export interface SidebarGroup {
  heading: string;
  tools: { name: string; slug: string; href: string }[];
}

interface CategorySidebarProps {
  categoryName: string;
  categoryHref: string;
  totalCount: number;
  currentSlug: string;
  groups: SidebarGroup[];
}

/**
 * Category wayfinding sidebar (ihatepdf-style nav, Toolzum URLs).
 * Same-category shelves + tools, current page highlighted. Pure
 * navigation — every link is a normal page load, so SEO crawlers see
 * zero change versus the shelf cards. Sticky on desktop, collapsible
 * drawer on mobile.
 */
export function CategorySidebar({ categoryName, categoryHref, totalCount, currentSlug, groups }: CategorySidebarProps) {
  const [open, setOpen] = useState(false);

  const nav = (
    <nav aria-label={`${categoryName} tools`} className="space-y-5">
      <Link href={categoryHref} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] transition-colors">
        <LayoutGrid className="w-4 h-4 text-[var(--accent)]" />
        All {categoryName} tools
        <span className="ml-auto font-mono text-[var(--text-muted)]">{totalCount}</span>
      </Link>
      {groups.map((g) => (
        <div key={g.heading}>
          <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{g.heading}</p>
          <ul className="space-y-0.5">
            {g.tools.map((t) => {
              const active = t.slug === currentSlug;
              return (
                <li key={t.slug}>
                  <Link
                    href={t.href}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      active
                        ? 'bg-[var(--accent-ink)]/10 text-[var(--text-primary)] font-bold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-[var(--accent)]' : 'bg-[var(--border-subtle)]'}`} />
                    <span className="truncate">{t.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile drawer */}
      <div className="xl:hidden w-full mb-4">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={`${open ? 'Hide' : 'Show'} ${categoryName} tools navigation`}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm font-bold text-[var(--text-primary)]"
        >
          <LayoutGrid className="w-4 h-4 text-[var(--accent)]" />
          {categoryName} tools ({totalCount})
          <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="mt-2 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] max-h-[50vh] overflow-y-auto">
            {nav}
          </div>
        )}
      </div>
      {/* Desktop sticky rail */}
      <aside className="hidden xl:block w-[240px] shrink-0">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          {nav}
        </div>
      </aside>
    </>
  );
}
