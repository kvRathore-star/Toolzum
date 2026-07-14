"use client";

import React from "react";
import Link from "next/link";
import { ToolMetadata, ToolCategory } from "@/registry/tools";
import { Search, ChevronRight, Grid3X3, List, ChevronDown, Image, FileText, Code2, Briefcase, Wrench, Compass } from "lucide-react";
import { getCategoryTheme, getCategoryGroup } from "@/lib/categoryTheme";

interface CategoryPageClientProps {
  category: ToolCategory;
  tools: ToolMetadata[];
}

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'indian-utilities': 'India 🇮🇳',
  'e-commerce': 'E-Commerce',
  'ai': 'AI Tools',
  'converter': 'File Converter',
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
  const [openGroup, setOpenGroup] = React.useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const displayName = CATEGORY_DISPLAY_NAMES[category.toLowerCase()] || category;
  const group = getCategoryGroup(category);
  const subCats = SUB_CATEGORIES[category];

  const allCategories = React.useMemo(() => {
    return Array.from(new Set(tools.map(t => t.category).filter(Boolean))).sort();
  }, [tools]);

  const groupedCategories = React.useMemo(() => {
    const groups: Record<string, string[]> = {};
    allCategories.forEach(c => {
      const g = getCategoryGroup(c);
      if (!groups[g]) groups[g] = [];
      groups[g].push(c);
    });
    return groups;
  }, [allCategories]);

  const GROUP_ORDER = ['Media', 'Text & AI', 'Developer & Tech', 'Business & Finance', 'Tools & Converters', 'Lifestyle'];
  const GROUP_ICONS: Record<string, React.ReactNode> = {
    'Media': <Image className="w-3.5 h-3.5" />,
    'Text & AI': <FileText className="w-3.5 h-3.5" />,
    'Developer & Tech': <Code2 className="w-3.5 h-3.5" />,
    'Business & Finance': <Briefcase className="w-3.5 h-3.5" />,
    'Tools & Converters': <Wrench className="w-3.5 h-3.5" />,
    'Lifestyle': <Compass className="w-3.5 h-3.5" />,
  };

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = searchQuery
    ? tools.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase()))
    : tools;

  const toolCount = filtered.length;

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">Toolzum</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/tools" className="hover:text-[var(--text-primary)] transition-colors">Tools</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--text-primary)]">{displayName}</span>
        </nav>

        {/* Category Menubar */}
        <div ref={menuRef} className="relative mb-8">
          <div className={`flex items-center gap-1 scrollbar-none ${openGroup ? 'overflow-visible flex-wrap pb-20' : 'overflow-x-auto pb-1'}`}>
            <Link
              href="/tools"
              className="shrink-0 px-3 py-2 text-[11px] font-mono uppercase tracking-wider rounded-[var(--radius-md)] transition-colors border border-[var(--border-subtle)] bg-[var(--bg-overlay)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]"
            >
              All
            </Link>
            {GROUP_ORDER.map(groupLabel => {
              const cats = groupedCategories[groupLabel];
              if (!cats || cats.length === 0) return null;
              const isActive = groupLabel === group;
              return (
                <div key={groupLabel} className="relative shrink-0">
                  <button
                    onMouseEnter={() => setOpenGroup(groupLabel)}
                    onClick={() => setOpenGroup(openGroup === groupLabel ? null : groupLabel)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-mono uppercase tracking-wider rounded-[var(--radius-md)] transition-colors border ${
                      isActive
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-overlay)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]'
                    }`}
                  >
                    <span className={isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}>
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
                        const isCatActive = cat === category;
                        const catDisplay = CATEGORY_DISPLAY_NAMES[cat.toLowerCase()] || cat;
                        return (
                          <Link
                            key={cat}
                            href={`/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                            className={`flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                              isCatActive
                                ? 'text-[var(--accent)] bg-[var(--accent-soft)] font-medium'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]'
                            }`}
                            onClick={() => setOpenGroup(null)}
                          >
                            <Icon className={`w-3.5 h-3.5 ${theme.iconColor}`} />
                            <span>{catDisplay}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

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
{{
  Image: 'Free online image tools — resize, crop, compress, convert, and edit images directly in your browser. Nothing uploaded, 100% private.',
  PDF: 'Free online PDF tools — compress, merge, split, convert, and edit PDFs. All processing happens locally in your browser.',
  Video: 'Free online video tools — trim, compress, convert between formats, and enhance videos. Zero uploads, processed entirely in-browser.',
  Audio: 'Free online audio tools — convert between MP3, WAV, FLAC, OGG, trim, and enhance audio files locally in your browser.',
  AI: 'Free online AI tools — generate images, summarize text, analyze content, and more. Powered by browser-based AI for complete privacy.',
  Converter: 'Free online file converter — convert video, audio, image, data, and document formats instantly. Nothing uploaded, 100% browser-based.',
  Developer: 'Free online developer tools — format JSON, minify CSS/JS, debug regex, encode/decode, and more. All processing happens in your browser.',
  Text: 'Free online text tools — word counter, case converter, text diff, markdown editor, and text generators. Nothing leaves your device.',
  Finance: 'Free online finance tools — GST calculator, EMI calculator, currency converter, and financial utilities. Accurate calculations in your browser.',
  Privacy: 'Free online privacy tools — encrypt text, redact images, generate secure passwords, and more. Everything stays local to your device.',
  SEO: 'Free online SEO tools — meta tag analyzer, keyword density checker, sitemap generator, and SEO audit utilities to improve your rankings.',
  Utility: 'Free online utility tools — unit converters, QR code generator, color picker, and everyday essentials for quick tasks online.',
  'indian-utilities': 'Free online tools for India — Aadhaar masking, PAN card validation, UPI payment helpers, and Indian utility tools. All processed locally.',
  Transcription: 'Free online transcription tools — convert speech to text, generate captions, and transcribe audio files locally in your browser.',
  Branding: 'Free online branding tools — create logos, generate mockups, design business cards, and brand assets. No design skills needed.',
  Business: 'Free online business tools — invoice generator, contract templates, business name generator, and more. Streamline your workflow.',
  Marketing: 'Free online marketing tools — social media schedulers, link shorteners, analytics, and campaign helpers to grow your audience.',
  Productivity: 'Free online productivity tools — todo lists, pomodoro timers, note-taking, and workflow utilities to get more done.',
  Design: 'Free online design tools — color palette generator, gradient maker, typography checker, and design utilities for creators.',
  HR: 'Free online HR tools — resume builder, salary calculator, leave calculator, and HR utilities for professionals and teams.',
  Health: 'Free online health tools — BMI calculator, calorie tracker, water reminder, and wellness utilities for a healthier life.',
  Extension: 'Free online browser extension tools — enhance your browsing with utility extensions. All local, no data collection.',
  'E-commerce': 'Free online e-commerce tools — product price tracker, store analytics, and e-commerce utilities for online sellers.',
  Lifestyle: 'Free online lifestyle tools — habit tracker, mood journal, and daily life utilities to improve your everyday routine.',
}[category] ?? `Free online ${category.toLowerCase()} tools — all processed locally in your browser with nothing uploaded to any server.`}
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
