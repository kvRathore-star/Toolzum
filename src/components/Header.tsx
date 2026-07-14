"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight, Search, Zap, Menu, X, Sun, Moon } from "lucide-react";
import { CommandMenu } from "./CommandMenu";
import { Button } from "./ui/button";
import { toolsRegistry } from "@/registry/tools";

const MENU_COLUMN_DEFS = [
  { title: "Image", icon: "🖼", category: "Image", allHref: "/image", slugs: ["image-compressor", "image-resizer", "background-remover", "crop-image", "image-enhancer", "batch-image-editor", "png-to-jpg"] },
  { title: "PDF", icon: "📄", category: "PDF", allHref: "/pdf", slugs: ["pdf-compressor", "pdf-merger", "pdf-splitter", "pdf-to-word", "pdf-to-excel", "word-to-pdf", "jpg-to-pdf"] },
  { title: "Video", icon: "📹", category: "Video", allHref: "/video", slugs: ["video-compressor", "video-to-gif", "video-to-mp3", "crop-video", "subtitle-translator", "video-trimmer"] },
  { title: "Audio", icon: "🎵", category: "Audio", allHref: "/audio", slugs: ["text-to-speech-tts", "audio-cutter", "speech-to-text", "audio-converter", "apple-music-preview-extractor", "bulk-audio-converter"] },
  { title: "AI", icon: "🤖", category: "AI", allHref: "/ai", slugs: ["ai-image-generator", "ai-paraphrasing-tool", "ai-translator", "ai-image-upscaler", "ai-face-swap", "ai-cover-letter-generator", "ai-thumbnail-maker"] },
  { title: "Developer", icon: "💻", category: "Developer", allHref: "/developer", slugs: ["json-formatter", "sql-formatter", "css-minifier", "diff-checker", "base64-encode-decode", "regex-tester", "js-minifier"] },
  { title: "Text", icon: "✍", category: "Text", allHref: "/text", slugs: ["character-counter", "word-counter", "fancy-text-generator", "font-generator", "cursive-text-generator", "text-to-handwriting", "case-converter"] },
  { title: "Finance", icon: "💰", category: "Finance", allHref: "/finance", slugs: ["currency-converter", "percentage-calculator", "emi-calculator", "sip-calculator", "gst-calculator", "invoice-generator", "profit-margin-calculator"] },
  { title: "Utility", icon: "🔧", category: "Utility", allHref: "/utility", slugs: ["qr-code-generator", "password-generator", "age-calculator", "wheel-of-names", "random-number-generator", "url-shortener", "resume-builder"] },
  { title: "Converter", icon: "🔄", category: "Converter", allHref: "/converter", slugs: ["mkv-to-mp4", "mp3-to-wav", "png-to-jpg", "json-to-csv", "markdown-tools"] },
  { title: "Privacy", icon: "🔒", category: "Privacy", allHref: "/privacy", slugs: ["temporary-email-generator", "password-strength-checker", "exif-data-remover", "secure-note-sharer", "pgp-key-generator", "ip-anonymizer"] },
  { title: "SEO & Marketing", icon: "📈", category: "SEO", allHref: "/seo", slugs: ["keyword-density-checker", "meta-tag-generator", "xml-sitemap-generator", "robots-txt-generator", "conversion-rate-calculator", "cpm-calculator"] },
  { title: "Branding", icon: "🎨", category: "Branding", allHref: "/branding", slugs: ["logo-maker", "social-media-post-maker", "business-card-maker", "email-signature-generator", "favicon-generator", "svg-editor"] },
  { title: "India", icon: "🇮🇳", category: "indian-utilities", allHref: "/indian-utilities", slugs: ["passport-photo-india", "aadhaar-wallet-cropper", "pan-card-resizer", "gst-invoice-generator"] },
];

function buildMegamenuColumns() {
  return MENU_COLUMN_DEFS.map(({ title, icon, category, allHref, slugs }) => {
    const tools = slugs
      .slice(0, 7)
      .map(slug => toolsRegistry.find(t => t.slug === slug))
      .filter(Boolean)
      .map(t => ({ name: t!.name, href: `/${t!.category.toLowerCase().replace(/\s+/g, '-')}/${t!.slug}` }));
    const allCount = toolsRegistry.filter(t => t.category === category && t.showInCategory !== false).length;
    const isIndia = title === "India";
    return { title, icon, tools, allCount, allHref, isIndia };
  });
}

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const MEGAMENU_COLUMNS = useMemo(() => buildMegamenuColumns(), []);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!megaMenuOpen) return;
      if (e.key === "Escape") {
        setMegaMenuOpen(false);
      }
      if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [megaMenuOpen]);

  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap + Escape close for mobile drawer
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const drawer = drawerRef.current;
    if (!drawer) return;
    const focusable = drawer.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    first?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const MOBILE_NAV_LINKS = [
    { label: "Tools", href: "/tools" },
    { label: "Extension", href: "/extension" },
    { label: "Pricing", href: "/pricing" },
    { label: "Sign in", href: "/login" },
  ];

  return (
    <header className={`sticky top-0 z-[1000] w-full h-[60px] border-b border-[var(--border-subtle)] transition-all duration-300 ${isScrolled ? 'bg-[var(--bg-elevated)]/80 backdrop-blur-md' : 'bg-[var(--bg-elevated)]'}`}>
      <div className="mx-auto flex max-w-[1280px] h-full items-center justify-between px-4 sm:px-6">
        
        {/* Left Section: Logo & Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-1 group select-none">
            <span className="text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">
              Tool<span className="text-[var(--accent)]">zum</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <div 
              ref={triggerRef}
              className="relative"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
              onFocus={() => setMegaMenuOpen(true)}
              onBlur={(e) => {
                if (!triggerRef.current?.contains(e.relatedTarget)) {
                  setMegaMenuOpen(false);
                }
              }}
            >
              <button 
                className={`flex items-center gap-1.5 px-3 py-2 text-[14px] font-medium rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                  megaMenuOpen 
                    ? "text-[var(--text-primary)]" 
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
                aria-expanded={megaMenuOpen}
                aria-haspopup="true"
              >
                <span>Tools</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${megaMenuOpen ? "rotate-180" : ""}`} />
                {megaMenuOpen && (
                  <div className="absolute bottom-[-16px] left-0 w-full h-[16px] bg-transparent" />
                )}
              </button>

              <AnimatePresence>
                {megaMenuOpen && (
                  <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
                    className="absolute left-0 top-[100%] mt-4 w-[1100px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-b-[var(--radius-xl)] shadow-[var(--shadow-lg)] max-h-[80vh] overflow-y-auto z-[1000]"
                  >
                    {/* Inline Search — opens CommandMenu */}
                    <button
                      onClick={() => {
                        setMegaMenuOpen(false);
                        document.dispatchEvent(new CustomEvent('opencode-command'));
                      }}
                      className="w-full p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-overlay)] flex items-center justify-between hover:bg-[var(--bg-surface)] transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Search className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="text-[var(--text-muted)] text-sm">Search tools...</span>
                      </div>
                      <kbd className="text-[10px] font-mono bg-[var(--bg-surface)] px-2 py-1 rounded text-[var(--text-muted)] border border-[var(--border-subtle)]">
                        ⌘K
                      </kbd>
                    </button>

                    <div className="p-6">
                      {/* Top Row: 7 columns */}
                      <div className="grid grid-cols-7 gap-3">
                        {MEGAMENU_COLUMNS.slice(0, 7).map((col, idx) => (
                          <motion.div 
                            key={col.title}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`flex flex-col ${col.isIndia ? 'p-3 rounded-xl border border-orange-500/30 bg-orange-500/5' : ''}`}
                          >
                            <Link href={col.allHref} onClick={() => setMegaMenuOpen(false)}>
                              <h4 className="text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] uppercase tracking-[0.08em] mb-3 flex items-center gap-1.5 transition-colors">
                                <span className="text-[14px]">{col.icon}</span>
                                {col.title}
                                <div className="h-[1px] flex-1 bg-[var(--border-subtle)]" />
                              </h4>
                            </Link>
                            <ul className="space-y-1 flex-1">
                              {col.tools.map((t) => (
                                <li key={t.name}>
                                  <Link
                                    href={t.href}
                                    className="block py-1.5 pl-2 text-[14px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-l-2 hover:border-[var(--accent)] transition-all border-l-2 border-transparent focus:outline-none focus:text-[var(--text-primary)] focus:border-[var(--accent)]"
                                    onClick={() => setMegaMenuOpen(false)}
                                  >
                                    {t.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                            <Link 
                              href={col.allHref}
                              className="mt-3 pl-2 text-[12px] font-medium text-[var(--accent)] hover:underline flex items-center gap-1"
                              onClick={() => setMegaMenuOpen(false)}
                            >
                              → All {col.allCount}
                            </Link>
                          </motion.div>
                        ))}
                      </div>

                      {/* Bottom Row: remaining columns */}
                      <div className="grid grid-cols-7 gap-3 mt-6 pt-6 border-t border-[var(--border-subtle)]">
                        {MEGAMENU_COLUMNS.slice(7).map((col, idx) => (
                          <motion.div 
                            key={col.title}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: (idx + 7) * 0.03 }}
                            className={`flex flex-col ${col.isIndia ? 'p-3 rounded-xl border border-orange-500/30 bg-orange-500/5' : ''}`}
                          >
                            <Link href={col.allHref} onClick={() => setMegaMenuOpen(false)}>
                              <h4 className="text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] uppercase tracking-[0.08em] mb-3 flex items-center gap-1.5 transition-colors">
                                <span className="text-[14px]">{col.icon}</span>
                                {col.title}
                                <div className="h-[1px] flex-1 bg-[var(--border-subtle)]" />
                              </h4>
                            </Link>
                            <ul className="space-y-1 flex-1">
                              {col.tools.map((t) => (
                                <li key={t.name}>
                                  <Link
                                    href={t.href}
                                    className="block py-1.5 pl-2 text-[14px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:text-[var(--text-primary)] hover:border-l-2 hover:border-[var(--accent)] focus:border-l-2 focus:border-[var(--accent)] transition-all border-l-2 border-transparent"
                                    onClick={() => setMegaMenuOpen(false)}
                                  >
                                    {t.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                            <Link 
                              href={col.allHref}
                              className="mt-3 pl-2 text-[12px] font-medium text-[var(--accent)] hover:underline flex items-center gap-1"
                              onClick={() => setMegaMenuOpen(false)}
                            >
                              → All {col.allCount}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Most Used Ticker */}
                    <div className="bg-[var(--bg-overlay)] border-t border-[var(--border-subtle)] px-6 py-2.5 flex items-center gap-3">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-red-500 flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> LIVE
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Most used today:</span>
                      <div className="flex gap-4 text-[12px] font-medium text-[var(--text-secondary)]">
                        <Link href="/image/background-remover" className="hover:text-[var(--text-primary)] cursor-pointer transition-colors" onClick={() => setMegaMenuOpen(false)}>BG Remover</Link>
                        <Link href="/pdf/pdf-compressor" className="hover:text-[var(--text-primary)] cursor-pointer transition-colors" onClick={() => setMegaMenuOpen(false)}>PDF Compress</Link>
                        <Link href="/video/video-to-mp3" className="hover:text-[var(--text-primary)] cursor-pointer transition-colors" onClick={() => setMegaMenuOpen(false)}>YT Download</Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/extension" aria-current={pathname === "/extension" ? "page" : undefined} className="px-3 py-2 text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Extension
            </Link>
            <Link href="/pricing" aria-current={pathname === "/pricing" ? "page" : undefined} className="px-3 py-2 text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Pricing
            </Link>

          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          <CommandMenu />

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all cursor-pointer"
            aria-label="Toggle theme"
          >
            {mounted ? (theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />) : <div className="w-4 h-4" />}
          </button>

          {/* Mobile hamburger */}
          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden items-center justify-center w-9 h-9 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all cursor-pointer"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="hidden sm:flex items-center gap-3">

            <Button variant="ghost" size="sm" asChild>
              <Link href="/login" className="hover:scale-105 active:scale-95 transition-transform">Sign in</Link>
            </Button>
            
            {/* CTA Glow Button */}
            <Button 
              variant="primary" 
              size="sm" 
              className="group relative hover:scale-105 active:scale-95 transition-all shadow-[var(--shadow-glow-accent)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] border-none" 
              asChild
            >
              <Link href="/pricing">
                Get Pro <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-[3px] transition-transform" />
              </Link>
            </Button>
          </div>
        </div>

      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            ref={drawerRef}
            className="fixed inset-x-0 top-[60px] bottom-0 z-[999] md:hidden bg-[var(--bg-base)] border-t border-[var(--border-subtle)] overflow-y-auto"
          >
            <div className="p-4 space-y-1">
              {/* Search shortcut */}
              <div className="mb-4">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    document.dispatchEvent(new CustomEvent("opencode-command"));
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-secondary)] bg-[var(--bg-overlay)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)]"
                >
                  <Search className="w-4 h-4 text-[var(--text-muted)]" />
                  <span>Search tools...</span>
                  <kbd className="ml-auto font-mono text-[10px] text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">⌘K</kbd>
                </button>
              </div>

              {/* Nav links */}
              {MOBILE_NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-[var(--radius-md)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {/* Category shortcuts */}
              <div className="pt-4 mt-4 border-t border-[var(--border-subtle)]">
                <h4 className="px-4 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  Categories
                </h4>
                <div className="grid grid-cols-2 gap-1">
                  {MEGAMENU_COLUMNS.map((col) => (
                    <Link
                      key={col.title}
                      href={col.allHref}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-[var(--radius-md)] transition-colors"
                    >
                      <span className="mr-1.5">{col.icon}</span>
                      {col.title}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Free uses badge (mobile) */}
              <div className="flex items-center justify-center gap-1.5 px-3 py-2 mx-4 mt-4 mb-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-overlay)]">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[12px] font-mono text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Client-side tools unlimited</strong></span>
              </div>

              {/* Pro CTA */}
              <div className="pt-2 pb-6">
                <Link
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block mx-4 text-center px-4 py-3 text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-[var(--radius-lg)] transition-colors"
                >
                  Get Pro
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
