"use client";

import React from "react";
import Link from "next/link";
import { ToolMetadata, ToolCategory } from "@/registry/tools";
import { Search, ChevronRight, Grid3X3, List, ChevronDown, Image, FileText, Code2, Briefcase, Wrench, Compass, Sun, Sparkles, Crown, ArrowUpDown, PanelLeft, X } from "lucide-react";
import { getCategoryTheme, getCategoryGroup } from "@/lib/categoryTheme";
import { FavoriteStarButton } from "@/components/FavoriteStarButton";
import type { CategorySection } from "@/data/categorySections";

interface CategoryPageClientProps {
  category: ToolCategory;
  tools: ToolMetadata[];
  sections?: (CategorySection & { tools: ToolMetadata[] })[];
  uncategorized?: ToolMetadata[];
  intro?: string;
}

const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'e-commerce': 'E-Commerce',
  'ai': 'AI Tools',
  'converter': 'File Converter',
  'indian-utilities': 'Indian Utilities',
  'growth-metrics': 'Growth & Marketing',
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
  Audio: [
    { label: 'Convert', icon: '🔄' },
    { label: 'Compress', icon: '🗜️' },
    { label: 'Trim', icon: '✂️' },
    { label: 'Edit', icon: '✏️' },
    { label: 'AI', icon: '🤖' },
  ],
  Video: [
    { label: 'Compress', icon: '🗜️' },
    { label: 'Convert', icon: '🔄' },
    { label: 'Trim', icon: '✂️' },
    { label: 'Edit', icon: '✏️' },
    { label: 'AI', icon: '🤖' },
  ],
  Converter: [
    { label: 'Image', icon: '🖼️' },
    { label: 'Video', icon: '🎬' },
    { label: 'Audio', icon: '🎵' },
    { label: 'Document', icon: '📄' },
  ],
  Text: [
    { label: 'Count', icon: '🔢' },
    { label: 'Convert', icon: '🔄' },
    { label: 'Generate', icon: '✨' },
    { label: 'Edit', icon: '✏️' },
  ],
  Developer: [
    { label: 'Format', icon: '🔄' },
    { label: 'Minify', icon: '🗜️' },
    { label: 'Encode', icon: '🔐' },
    { label: 'Regex', icon: '🔍' },
    { label: 'Convert', icon: '🔄' },
  ],
  SEO: [
    { label: 'Analyze', icon: '📊' },
    { label: 'Audit', icon: '🔍' },
    { label: 'Optimize', icon: '⚡' },
    { label: 'Generate', icon: '✨' },
  ],
  Finance: [
    { label: 'Calculate', icon: '🧮' },
    { label: 'Convert', icon: '🔄' },
    { label: 'Tax', icon: '📋' },
    { label: 'ROI', icon: '📈' },
  ],
  Privacy: [
    { label: 'Encrypt', icon: '🔒' },
    { label: 'Redact', icon: '🖍️' },
    { label: 'Generate', icon: '✨' },
    { label: 'Analyze', icon: '🔍' },
  ],
  Utility: [
    { label: 'Convert', icon: '🔄' },
    { label: 'Generate', icon: '✨' },
    { label: 'Calculate', icon: '🧮' },
    { label: 'Format', icon: '🔄' },
  ],
  Branding: [
    { label: 'Design', icon: '🎨' },
    { label: 'Utilities', icon: '🔧' },
  ],
  Health: [
    { label: 'Calculate', icon: '🧮' },
    { label: 'Track', icon: '📊' },
    { label: 'Convert', icon: '🔄' },
  ],
  'indian-utilities': [
    { label: 'Aadhaar', icon: '🆔' },
    { label: 'Finance', icon: '💰' },
    { label: 'Generator', icon: '📄' },
    { label: 'Convert', icon: '🔄' },
  ],
  Calculator: [
    { label: 'Math', icon: '📐' },
    { label: 'Date/Time', icon: '📅' },
  ],
  'Growth & Marketing': [
    { label: 'SaaS Revenue', icon: '📈' },
    { label: 'Customers', icon: '👥' },
    { label: 'Cash', icon: '💰' },
    { label: 'Marketing', icon: '📊' },
  ],
};

const SUBCATEGORY_KEYWORDS: Record<string, Record<string, string[]>> = {
  Image: {
    Compress: ['compress', 'optimize', 'reduce size', 'file size'],
    Resize: ['resize', 'resizer', 'scale', 'dimension', 'resample'],
    Convert: ['convert', 'to png', 'to jpg', 'to webp', 'to gif', 'format converter'],
    Edit: ['edit', 'crop', 'rotate', 'filter', 'flip', 'adjust', 'enhance', 'retouch', 'background'],
    AI: ['ai upscale', 'ai enhance', 'face swap', 'background remove', 'object remove', 'ai colorize'],
  },
  PDF: {
    Compress: ['compress', 'reduce size', 'optimize'],
    Merge: ['merge', 'combine', 'join'],
    Split: ['split', 'extract', 'separate'],
    Convert: ['convert', 'to pdf', 'from pdf', 'pdf to', 'pdf converter'],
    Edit: ['edit', 'rotate', 'protect', 'unlock', 'watermark', 'sign', 'ocr', 'metadata', 'page', 'number', 'header', 'footer'],
  },
  Audio: {
    Convert: ['convert', 'to mp3', 'to wav', 'to flac', 'to ogg', 'to aac', 'to m4a', 'format converter'],
    Compress: ['compress', 'reduce size', 'file size'],
    Trim: ['trim', 'cut', 'crop audio'],
    Edit: ['edit', 'merge', 'join', 'fade', 'volume', 'normalize', 'reverse', 'equalizer', 'noise'],
    AI: ['transcription', 'speech to text', 'vocal remove', 'ai'],
  },
  Video: {
    Compress: ['compress', 'reduce size', 'file size'],
    Convert: ['convert', 'to mp4', 'to avi', 'to mov', 'to webm', 'to gif', 'format converter'],
    Trim: ['trim', 'cut', 'crop video'],
    Edit: ['edit', 'merge', 'join', 'speed', 'reverse', 'stabilize', 'mute', 'filter', 'screenshot', 'watermark'],
    AI: ['subtitler', 'ai', 'screen record'],
  },
  Converter: {
    Image: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'ico', 'avif', 'heic', 'image format'],
    Video: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', '3gp', 'mpeg', 'vob', 'video format'],
    Audio: ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a', 'wma', 'aiff', 'opus', 'audio format'],
    Document: ['pdf', 'docx', 'txt', 'html', 'markdown', 'rtf', 'odt', 'epub', 'document format'],
  },
  Text: {
    Count: ['word counter', 'character counter', 'frequency', 'count', 'analyze'],
    Convert: ['case converter', 'reverse', 'slugs', 'text converter', 'diff'],
    Generate: ['lorem ipsum', 'fancy text', 'cursive', 'font generator', 'zalgo'],
    Edit: ['edit', 'find replace', 'cleaner', 'splitter', 'duplicate', 'sort'],
  },
  Developer: {
    Format: ['formatter', 'beautify', 'prettify', 'format'],
    Minify: ['minifier', 'minify', 'compress code'],
    Encode: ['encoder', 'decoder', 'base64', 'url encode', 'html entity', 'hex', 'binary'],
    Regex: ['regex', 'regular expression'],
    Convert: ['converter', 'json to', 'yaml to', 'xml to', 'markdown to', 'html to'],
  },
  SEO: {
    Analyze: ['keyword density', 'word frequency', 'counter', 'analyzer', 'analyze'],
    Audit: ['audit', 'checker', 'validator', 'schema', 'meta tag', 'serp'],
    Optimize: ['optimize', 'compress', 'minify', 'pagespeed'],
    Generate: ['sitemap', 'generator', 'utm builder', 'robots.txt'],
  },
  Finance: {
    Calculate: ['calculator', 'calculate', 'loan', 'emi', 'mortgage', 'sip', 'investment', 'roi', 'cagr', 'salary'],
    Convert: ['currency converter', 'number converter', 'unit converter'],
    Tax: ['tax', 'gst', 'vat', 'hst', 'salary'],
    ROI: ['roi', 'margin', 'profit', 'break-even', 'markup', 'cac', 'ltv', 'churn'],
  },
  Privacy: {
    Encrypt: ['encrypt', 'encryption', 'cipher', 'aes', 'pgp'],
    Redact: ['redact', 'redaction', 'exif', 'metadata remove'],
    Generate: ['password generator', 'random password', 'secure', 'token'],
    Analyze: ['password strength', 'analyze', 'checker'],
  },
  Utility: {
    Convert: ['converter', 'convert', 'to'],
    Generate: ['generator', 'generate', 'create', 'maker'],
    Calculate: ['calculator', 'calculate', 'counter', 'timer'],
    Format: ['formatter', 'format', 'prettify'],
  },
  Branding: {
    Design: ['logo', 'brand', 'business card', 'email signature', 'social media'],
    Calculate: ['calculator', 'calculate', 'roi', 'cpm', 'roas'],
    Generate: ['generator', 'generate', 'maker', 'invoice', 'receipt', 'coupon'],
  },
  Health: {
    Calculate: ['calculator', 'calculate', 'bmi', 'body fat', 'calorie', 'bmr', 'heart rate', 'running pace', 'ideal weight'],
    Track: ['track', 'tracker', 'log'],
    Convert: ['converter', 'convert', 'unit'],
  },
  'indian-utilities': {
    Aadhaar: ['aadhaar', 'uid', 'pan'],
    Finance: ['gst', 'itr', 'income tax', 'gstin', 'sip', 'fd', 'rd'],
    Generator: ['generator', 'generate', 'maker', 'resume', 'biodata', 'receipt', 'invoice'],
    Convert: ['converter', 'convert'],
  },
  Calculator: {
    Math: ['quadratic', 'pythagorean', 'fraction', 'percentage', 'circle', 'triangle', 'area', 'volume', 'exponent', 'square root', 'mean', 'median', 'mode', 'standard deviation', 'ratio', 'proportion', 'probability', 'scientific', 'trigonometry', 'logarithm', 'aspect ratio', 'rectangle', 'dpi', 'ppi'],
    'Date/Time': ['age', 'date', 'time', 'week', 'business day', 'days between', 'day of week', 'leap year'],
  },
};

export function CategoryPageClient({ category, tools, sections = [], uncategorized = [], intro = '' }: CategoryPageClientProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeSubcategory, setActiveSubcategory] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [openGroup, setOpenGroup] = React.useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const displayName = CATEGORY_DISPLAY_NAMES[category.toLowerCase()] || category;
  const group = getCategoryGroup(category);
  const subCats = SUB_CATEGORIES[category];
  const [sortBy, setSortBy] = React.useState<'name-asc' | 'name-desc'>('name-asc');
  const [showSortMenu, setShowSortMenu] = React.useState(false);
  const sortRef = React.useRef<HTMLDivElement>(null);
  const [proFilter, setProFilter] = React.useState<'all' | 'free' | 'pro'>('all');
  const [letterFilter, setLetterFilter] = React.useState("");
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allCategories = React.useMemo(() => {
    return Array.from(new Set(tools.map(t => t.category).filter(Boolean))).sort().filter(c => c !== 'Extension');
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

  const GROUP_ORDER = ['Media', 'India', 'Text & AI', 'Developer & Tech', 'Business & Finance', 'Tools & Converters', 'Lifestyle'];
  const GROUP_ICONS: Record<string, React.ReactNode> = {
    'Media': <Image className="w-3.5 h-3.5" />,
    'India': <Sun className="w-3.5 h-3.5" />,
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
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = tools.filter(t => {
    const matchesSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSub = !activeSubcategory || !SUBCATEGORY_KEYWORDS[category]?.[activeSubcategory] || SUBCATEGORY_KEYWORDS[category][activeSubcategory].some(kw => t.name.toLowerCase().includes(kw) || t.description.toLowerCase().includes(kw));
    const matchesPro = proFilter === 'all' || (proFilter === 'pro' ? t.isPro : !t.isPro);
    return matchesSearch && matchesSub && matchesPro;
  }).sort((a, b) => {
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    return b.name.localeCompare(a.name);
  });

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

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 mb-4 text-[11px] font-mono border border-[var(--border-subtle)] rounded-[var(--radius-lg)] bg-[var(--bg-overlay)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors md:hidden"
        >
          <PanelLeft className="w-3 h-3" />
          Categories
        </button>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" role="button" tabIndex={0} onClick={() => setSidebarOpen(false)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSidebarOpen(false); } }} />
            <div className="absolute left-0 top-0 h-full w-72 bg-[var(--bg-elevated)] border-r border-[var(--border-subtle)] p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Categories</h3>
                <button aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} className="p-1 rounded-md hover:bg-[var(--bg-overlay)]">
                  <X className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
              </div>
              <nav className="space-y-1">
                <Link
                  href="/tools"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-[11px] font-mono uppercase tracking-wider rounded-[var(--radius-md)] transition-colors border border-[var(--border-subtle)] bg-[var(--bg-overlay)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]"
                >
                  All Tools
                </Link>
                {GROUP_ORDER.map(groupLabel => {
                  const cats = groupedCategories[groupLabel];
                  if (!cats || cats.length === 0) return null;
                  const isActive = groupLabel === group;
                  return (
                    <div key={groupLabel}>
                      <div className={`flex items-center gap-2 px-3 py-2 text-[11px] font-mono uppercase tracking-wider mt-2 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                        <span className={isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}>
                          {GROUP_ICONS[groupLabel]}
                        </span>
                        {groupLabel}
                      </div>
                      <div className="ml-4 space-y-0.5">
                        {cats.map(cat => {
                          const theme = getCategoryTheme(cat);
                          const Icon = theme.icon;
                          const isCatActive = cat === category;
                          const catDisplay = CATEGORY_DISPLAY_NAMES[cat.toLowerCase()] || cat;
                          return (
                            <Link
                              key={cat}
                              href={`/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-[var(--radius-md)] transition-colors ${
                                isCatActive
                                  ? 'text-[var(--accent)] bg-[var(--accent-soft)] font-medium'
                                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]'
                              }`}
                            >
                              <Icon className={`w-3 h-3 ${theme.iconColor}`} />
                              <span>{catDisplay}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

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
                    <div role="group" aria-label="Category submenu"
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
  Image: 'Free image tools — resize, crop, compress, convert, and edit images directly in your browser. Nothing uploaded, 100% private.',
  PDF: 'Free PDF tools — compress, merge, split, convert, and edit PDFs. All processing happens locally in your browser.',
  Video: 'Free video tools — trim, compress, convert between formats, and enhance videos. Zero uploads, processed entirely in-browser.',
  Audio: 'Free audio tools — convert between MP3, WAV, FLAC, OGG, trim, and enhance audio files locally in your browser.',
  AI: 'Free AI tools — generate images, summarize text, analyze content, and more. Powered by browser-based AI for complete privacy.',
  Converter: 'Free file converter — convert video, audio, image, data, and document formats instantly. Nothing uploaded, 100% browser-based.',
  Developer: 'Free developer tools — format JSON, minify CSS/JS, debug regex, encode/decode, and more. All processing happens in your browser.',
  Text: 'Free text tools — word counter, case converter, text diff, markdown editor, and text generators. Nothing leaves your device.',
  Finance: 'Free finance tools — EMI calculator, currency converter, investment calculators, and financial utilities. Accurate calculations in your browser.',
  Privacy: 'Free privacy tools — encrypt text, redact images, generate secure passwords, and more. Everything stays local to your device.',
  SEO: 'Free SEO tools — meta tag analyzer, keyword density checker, sitemap generator, and SEO audit utilities to improve your rankings.',
  Utility: 'Free utility tools — unit converters, QR code generator, color picker, and everyday essentials for quick tasks online.',
  'indian-utilities': 'Free Indian utility tools — Aadhaar masking, PAN card validation, UPI payment helpers, and local utility tools. All processed locally.',
  Transcription: 'Free transcription tools — convert speech to text, generate captions, and transcribe audio files locally in your browser.',
  Branding: 'Free branding tools — create logos, generate mockups, design business cards, and brand assets. No design skills needed.',
  Calculator: 'Free online calculators — math, date/time, and academic calculators for percentages, fractions, date differences, grade averages, and more. 100% browser-based.',
  Productivity: 'Free productivity tools — todo lists, pomodoro timers, note-taking, and workflow utilities to get more done.',
  Design: 'Free design tools — color palette generator, gradient maker, typography checker, and design utilities for creators.',
  Health: 'Free health tools — BMI calculator, calorie tracker, water reminder, and wellness utilities for a healthier life.',
  Extension: 'Free browser extension tools — enhance your browsing with utility extensions. All local, no data collection.',
  'Growth & Marketing': 'Free growth and marketing metrics tools — ARR, MRR, LTV, CAC, churn, runway, CPM, ROAS, NPS, A/B testing, and SaaS analytics. All calculations run in your browser.',
}[category] ?? `Free ${category.toLowerCase()} tools — all processed locally in your browser with nothing uploaded to any server.`}
          </p>
          {intro && (
            <div className="mt-10 max-w-3xl pl-5 border-l-2 border-[var(--accent)]/20">
              <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2">
                About {displayName} Tools
              </h2>
              <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed">
                {intro}
              </p>
            </div>
          )}
        </div>

        {/* Sub-category quick-nav */}
        {subCats && (
          <div className="flex flex-wrap gap-2 mb-8">
            {subCats.map(sc => (
              <button
                key={sc.label}
                onClick={() => { setActiveSubcategory(activeSubcategory === sc.label ? null : sc.label); setSearchQuery(''); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  activeSubcategory === sc.label
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                {sc.icon} {sc.label}
              </button>
            ))}
            <button
              onClick={() => { setSearchQuery(''); setActiveSubcategory(null); }}
              className="text-xs px-3 py-1.5 rounded-full border border-dashed border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-all"
            >
              Clear
            </button>
          </div>
        )}

        {/* Sort */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative" ref={sortRef}>
            <button aria-expanded={showSortMenu} aria-haspopup="menu" onClick={() => setShowSortMenu(!showSortMenu)} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono border border-[var(--border-subtle)] rounded-[var(--radius-lg)] bg-[var(--bg-overlay)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              <ArrowUpDown className="w-3 h-3" />
              {sortBy === 'name-asc' ? 'A–Z' : 'Z–A'}
            </button>
            {showSortMenu && (
              <div role="menu" aria-label="Sort tools" className="absolute left-0 top-full mt-1 w-36 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] py-1 z-50">
                <button role="menuitem" onClick={() => { setSortBy('name-asc'); setShowSortMenu(false); }} className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${sortBy === 'name-asc' ? 'text-[var(--accent)] bg-[var(--accent-soft)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]'}`}>
                  A → Z
                </button>
                <button role="menuitem" onClick={() => { setSortBy('name-desc'); setShowSortMenu(false); }} className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${sortBy === 'name-desc' ? 'text-[var(--accent)] bg-[var(--accent-soft)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)]'}`}>
                  Z → A
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pro/Free toggle */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-0.5 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-0.5 text-[11px] font-mono">
            <button onClick={() => setProFilter('all')} className={`px-2.5 py-1.5 rounded-[var(--radius-md)] transition-colors ${proFilter === 'all' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>All</button>
            <span className="text-[var(--border-subtle)] select-none">·</span>
            <button onClick={() => setProFilter('free')} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[var(--radius-md)] transition-colors ${proFilter === 'free' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}><Sparkles className="w-3 h-3" /> Free</button>
            <span className="text-[var(--border-subtle)] select-none">·</span>
            <button onClick={() => setProFilter('pro')} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[var(--radius-md)] transition-colors ${proFilter === 'pro' ? 'bg-[var(--bg-elevated)] shadow-sm text-amber-700 dark:text-amber-400' : 'text-[var(--text-muted)] hover:text-amber-700 dark:hover:text-amber-400'}`}><Crown className="w-3 h-3" /> Pro</button>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-mono">{toolCount} tool{toolCount !== 1 ? 's' : ''}</span>
        </div>

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
        </div>

        {/* Tool Grid/List */}
        {searchQuery || activeSubcategory || letterFilter || proFilter !== 'all' || !sections?.length ? (
          filtered.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-[var(--border-subtle)] rounded-[var(--radius-xl)] bg-[var(--bg-overlay)]">
              <p className="text-[var(--text-muted)] mb-2">
                {proFilter === 'pro'
                  ? `No Pro tools in ${displayName} yet — everything here is free.`
                  : proFilter === 'free'
                    ? `No free tools match here.`
                    : 'No tools match your filters.'}
              </p>
              <button
                onClick={() => { setSearchQuery(''); setActiveSubcategory(null); setLetterFilter(''); setProFilter('all'); }}
                className="mt-2 px-5 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
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
                        <FavoriteStarButton slug={tool.slug} />
                      </div>
                      <h3 className="text-base font-medium text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors flex items-center gap-2">
                        {tool.name}
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all text-[var(--accent)]" />
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                        {tool.description}
                      </p>
                      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]/50"></div>
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
          )
        ) : (
          <div className="space-y-4">
            {sections.map((section) => {
              const isExpanded = expandedSections.has(section.id);
              return (
                <section key={section.id} id={section.id} className="border border-[var(--border-subtle)] rounded-[var(--radius-xl)] bg-[var(--bg-elevated)] overflow-hidden">
                  <button
                    aria-expanded={isExpanded}
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-[var(--bg-overlay)] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-[family-name:var(--font-serif)] text-[var(--text-primary)]">
                        {section.heading}
                      </h2>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">
                        {section.description}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
                        <span>{section.tools.length} tool{section.tools.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-[var(--text-muted)] shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-6 pb-6 pt-2 border-t border-[var(--border-subtle)]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {section.tools.map((tool) => {
                          const { icon: Icon, color, bg, gradient } = getIconBg(tool);
                          return (
                            <Link
                              key={tool.id}
                              href={`/${tool.category.toLowerCase().replace(/\s+/g, '-')}/${tool.slug}`}
                              className="group block h-full"
                            >
                              <div className={`h-full p-5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] transition-all duration-300 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--border-default)] hover:-translate-y-0.5 ${gradient}`}>
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
                                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]/50"></div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}
            {uncategorized && uncategorized.length > 0 && (
              <section id="other-tools" className="border border-[var(--border-subtle)] rounded-[var(--radius-xl)] bg-[var(--bg-elevated)] overflow-hidden">
                <button
                  aria-expanded={expandedSections.has('other-tools')}
                  onClick={() => toggleSection('other-tools')}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-[var(--bg-overlay)] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-[family-name:var(--font-serif)] text-[var(--text-primary)]">
                      Other {displayName} Tools
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      Additional tools that didn't fit into the categories above.
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
                      <span>{uncategorized.length} tool{uncategorized.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-[var(--text-muted)] shrink-0 transition-transform duration-300 ${expandedSections.has('other-tools') ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all duration-300 ease-in-out ${expandedSections.has('other-tools') ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-6 pb-6 pt-2 border-t border-[var(--border-subtle)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {uncategorized.map((tool) => {
                        const { icon: Icon, color, bg, gradient } = getIconBg(tool);
                        return (
                          <Link
                            key={tool.id}
                            href={`/${tool.category.toLowerCase().replace(/\s+/g, '-')}/${tool.slug}`}
                            className="group block h-full"
                          >
                            <div className={`h-full p-5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] transition-all duration-300 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--border-default)] hover:-translate-y-0.5 ${gradient}`}>
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
                              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]/50"></div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="py-24 text-center border border-dashed border-[var(--border-subtle)] rounded-[var(--radius-xl)] bg-[var(--bg-overlay)]">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-surface)] flex items-center justify-center">
              <Search className="w-6 h-6 text-[var(--text-muted)]" />
            </div>
            <p className="text-[var(--text-muted)] mb-2">No tools found{searchQuery ? ` matching "${searchQuery}"` : activeSubcategory ? ` in ${activeSubcategory}` : letterFilter ? ` starting with "${letterFilter}"` : ''}.</p>
            <p className="text-xs text-[var(--text-muted)] mb-4">Try a different search term or browse other categories.</p>
            <button onClick={() => { setSearchQuery(''); setActiveSubcategory(null); setLetterFilter(''); }} className="px-4 py-2 text-xs font-medium text-white bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] rounded-[var(--radius-lg)] transition-colors">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
