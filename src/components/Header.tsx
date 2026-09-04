"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getMegamenuIcon, getMegamenuIconColor } from "@/registry/megamenu-icons";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ChevronDown, ArrowRight, Search, Zap, Menu, X, Sun, Moon, Heart, Link as LinkIcon, Check, User, LogOut, LayoutDashboard, Star } from "lucide-react";
import { toast } from "react-hot-toast";
import { useToolHistory } from '@/hooks/useToolHistory';
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "./ui/button";
import { MEGAMENU_COLUMNS, SITE_STATS } from "@/registry/site-data.generated";

// Lazy chunk: cmdK search + full registry pulled out of the root-layout bundle.
// Rendered only when the user opens search — cmdk + toolsRegistry stay off the
// network path until ⌘K / the search pill / a search shortcut is actually used.
const CommandMenu = dynamic(() => import("./CommandMenu").then((m) => m.CommandMenu));

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const { history } = useToolHistory();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isSignedIn = !!session?.user;

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userMenuOpen]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- set mounted flag before attaching scroll listener (avoids hydration mismatch)
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Open CommandMenu (loads cmdk + registry on demand) from any trigger:
  // ⌘K, the search pill, and the megamenu/mobile "Search tools..." shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCmdOpen(false);
        return;
      }
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    const onCommand = () => setCmdOpen(true);
    document.addEventListener("keydown", onKey);
    document.addEventListener("opencode-command", onCommand);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("opencode-command", onCommand);
    };
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
    { label: "Pro", href: "/premium-tools" },
    { label: "Pricing", href: "/pricing" },
  ];

  return (
    <>
    <header className={`sticky top-0 z-[1000] w-full h-[60px] border-b border-[var(--border-subtle)] transition-all duration-300 ${isScrolled ? 'bg-[var(--bg-elevated)]/80 backdrop-blur-md' : 'bg-[var(--bg-elevated)]'}`}>
      <div className="mx-auto flex max-w-[1280px] h-full items-center justify-between px-4 sm:px-6">
        
        {/* Left Section: Logo & Links */}
        <div className="flex items-center gap-4 md:gap-6 lg:gap-8">
          <Link href="/" className="flex items-center gap-2.5 group select-none">
            <svg width="26" height="26" viewBox="0 0 100 100" fill="none" className="shrink-0">
              <rect x="0" y="0" width="100" height="100" rx="24" fill="#6366F1"/>
              <path d="M28 34 H72 L30 66 H72" fill="none" stroke="white" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span className="text-[22px] font-extrabold tracking-tight text-[var(--text-primary)]">
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
                <div className={`absolute bottom-[-16px] left-0 w-full h-[16px] bg-transparent transition-opacity duration-200 ${megaMenuOpen ? 'opacity-100' : 'opacity-0'}`} />
              </button>

              
                  <div
                    ref={menuRef}
                    className={`fixed left-1/2 -translate-x-1/2 top-[60px] mt-2 w-screen max-w-[calc(100vw-2rem)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-b-[var(--radius-xl)] shadow-[var(--shadow-lg)] max-h-[80vh] overflow-y-auto z-[1000] md:w-[600px] lg:w-[900px] xl:w-[1100px] transition-all duration-200 ease-[cubic-bezier(0,0,0.2,1)] ${megaMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
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
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
                        {MEGAMENU_COLUMNS.slice(0, 7).map((col, idx) => (
                          <div 
                            key={col.title}
                            className={`flex flex-col ${col.isIndia ? 'p-3 rounded-xl border border-orange-500/30 bg-orange-500/5' : ''}`}
                          >
                            <Link href={col.allHref} onClick={() => setMegaMenuOpen(false)}>
                              <h4 className="text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] uppercase tracking-[0.08em] mb-3 flex items-center gap-1.5 transition-colors">
                                <span className="w-3.5 h-3.5 flex items-center justify-center">{(() => { const Ico = getMegamenuIcon(col.icon); const color = getMegamenuIconColor(col.icon); return <Ico className={`w-3.5 h-3.5 ${color}`} />; })()}</span>
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
                          </div>
                        ))}
                      </div>

                      {/* Bottom Row: remaining columns */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3 mt-6 pt-6 border-t border-[var(--border-subtle)]">
                        {MEGAMENU_COLUMNS.slice(7).map((col, idx) => (
                          <div 
                            key={col.title}
                            className={`flex flex-col ${col.isIndia ? 'p-3 rounded-xl border border-orange-500/30 bg-orange-500/5' : ''}`}
                          >
                            <Link href={col.allHref} onClick={() => setMegaMenuOpen(false)}>
                              <h4 className="text-[11px] font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] uppercase tracking-[0.08em] mb-3 flex items-center gap-1.5 transition-colors">
                                <span className="w-3.5 h-3.5 flex items-center justify-center">{(() => { const Ico = getMegamenuIcon(col.icon); const color = getMegamenuIconColor(col.icon); return <Ico className={`w-3.5 h-3.5 ${color}`} />; })()}</span>
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
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Most Used Ticker */}
                    <div className="bg-[var(--bg-overlay)] border-t border-[var(--border-subtle)] px-6 py-2.5 flex items-center gap-3">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-red-700 dark:text-red-400 flex items-center gap-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> LIVE
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">{history.length > 0 ? 'Recently used:' : 'Most used today:'}</span>
                      <div className="flex gap-4 text-[12px] font-medium text-[var(--text-secondary)]">
                        {history.length > 0 ? (
                          history.slice(0, 4).map(h => (
                            <Link key={h.slug} href={`/${h.category.toLowerCase().replace(/\s+/g, '-')}/${h.slug}`} className="hover:text-[var(--text-primary)] cursor-pointer transition-colors" onClick={() => setMegaMenuOpen(false)}>{h.name}</Link>
                          ))
                        ) : (
                          <>
                            <Link href="/image/background-remover" className="hover:text-[var(--text-primary)] cursor-pointer transition-colors" onClick={() => setMegaMenuOpen(false)}>BG Remover</Link>
                            <Link href="/pdf/pdf-compressor" className="hover:text-[var(--text-primary)] cursor-pointer transition-colors" onClick={() => setMegaMenuOpen(false)}>PDF Compress</Link>
                            <Link href="/video/video-to-mp3" className="hover:text-[var(--text-primary)] cursor-pointer transition-colors" onClick={() => setMegaMenuOpen(false)}>YT Download</Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
              
            </div>

            <Link href="/extension" aria-current={pathname === "/extension" ? "page" : undefined} className="px-3 py-2 text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Extension
            </Link>
            <Link href="/premium-tools" aria-current={pathname === "/premium-tools" ? "page" : undefined} className="px-3 py-2 text-[14px] font-medium text-amber-700 dark:text-amber-700 dark:text-amber-400 hover:text-amber-500 transition-colors">
              Pro
            </Link>
            <Link href="/pricing" aria-current={pathname === "/pricing" ? "page" : undefined} className="px-3 py-2 text-[14px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Pricing
            </Link>

            <div className="relative hidden lg:block">
              <button
                onClick={(e) => { e.stopPropagation(); setShareOpen(!shareOpen); }}
                onMouseEnter={() => setShareOpen(true)}
                onMouseLeave={() => setShareOpen(false)}
                className="flex items-center gap-1.5 px-3 py-2 text-[14px] font-medium text-rose-600 dark:text-rose-400 hover:text-rose-500 transition-all rounded-[var(--radius-sm)]"
                aria-label="Share Toolzum"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>

              
                  <div
                    className={`absolute right-0 top-full mt-2 z-50 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] p-3 min-w-[200px] transition-all duration-150 ease-[cubic-bezier(0,0,0.2,1)] ${shareOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                    onMouseEnter={() => setShareOpen(true)}
                    onMouseLeave={() => setShareOpen(false)}
                  >
                    <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-2">
                      Tell the world about Toolzum
                    </p>
                    <div className="space-y-0.5">
                      {[
                        { name: 'X (Twitter)', emoji: '𝕏', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${SITE_STATS.freeTierTotal}+ free privacy-first browser tools. ${SITE_STATS.localTools} run locally, ${SITE_STATS.cloudTools + SITE_STATS.hybridTools} cloud AI.`)}&url=${encodeURIComponent('https://toolzum.com')}` },
                        { name: 'LinkedIn', emoji: 'in', href: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://toolzum.com')}` },
                        { name: 'Facebook', emoji: 'f', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://toolzum.com')}` },
                        { name: 'WhatsApp', emoji: 'WA', href: `https://wa.me/?text=${encodeURIComponent(`${SITE_STATS.freeTierTotal}+ free privacy-first browser tools: https://toolzum.com`)}` },
                      ].map(p => (
                        <a
                          key={p.name}
                          href={p.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShareOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-[var(--radius-md)] transition-colors w-full"
                        >
                          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[10px] font-bold font-mono">{p.emoji}</span>
                          Share on {p.name}
                        </a>
                      ))}
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText('https://toolzum.com');
                            setShareCopied(true);
                            setTimeout(() => setShareCopied(false), 2000);
                          } catch {}
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-[var(--radius-md)] transition-colors"
                      >
                        {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <LinkIcon className="w-3.5 h-3.5" />}
                        {shareCopied ? 'Copied!' : 'Copy link'}
                      </button>
                    </div>
                  </div>
              
            </div>

          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4">
          <button
            onClick={() => setCmdOpen(true)}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 text-[13px] text-[var(--text-muted)] bg-[var(--bg-overlay)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] transition-all duration-200 cursor-pointer w-auto lg:w-48 hover:w-64 focus:w-64 justify-between"
            aria-label="Open search"
          >
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Search tools...</span>
            </span>
            <kbd className="font-mono text-[10px] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--text-muted)]">
              ⌘K
            </kbd>
          </button>
          {cmdOpen && <CommandMenu open onClose={() => setCmdOpen(false)} />}

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
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="hidden sm:flex items-center gap-2 lg:gap-3">
            {isSignedIn ? (
              <>
                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-md)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-[var(--accent)]/15 flex items-center justify-center">
                      <span className="text-[11px] font-semibold text-[var(--accent)]">
                        {session.user.name?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="hidden lg:inline text-[13px] font-medium text-[var(--text-secondary)] max-w-[100px] truncate">
                      {session.user.name?.split(" ")[0]}
                    </span>
                  </button>

                  
                      <div
                        onMouseLeave={() => setUserMenuOpen(false)}
                        className={`absolute right-0 top-full mt-2 z-50 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] p-1.5 min-w-[180px] transition-all duration-150 ease-[cubic-bezier(0,0,0.2,1)] ${userMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
                      >
                        <div className="px-3 py-2 border-b border-[var(--border-subtle)] mb-1">
                          <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">{session.user.name}</p>
                          <p className="text-[11px] text-[var(--text-muted)] truncate">{session.user.email}</p>
                        </div>
                        <Link
                          href="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] rounded-[var(--radius-md)] transition-colors"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/account"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] rounded-[var(--radius-md)] transition-colors"
                        >
                          <User className="w-3.5 h-3.5" />
                          Account
                        </Link>
                        <Link
                          href="/dashboard/favorites"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] rounded-[var(--radius-md)] transition-colors"
                        >
                          <Star className="w-3.5 h-3.5" />
                          Favorites
                        </Link>
                        <div className="border-t border-[var(--border-subtle)] my-1" />
                        <button
                          onClick={async () => {
                            setUserMenuOpen(false);
                            await signOut();
                            window.location.href = "/";
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-[var(--danger)] hover:bg-[var(--bg-surface)] rounded-[var(--radius-md)] transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign out
                        </button>
                      </div>
                  
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden lg:flex">
                  <Link href="/login" className="hover:scale-105 active:scale-95 transition-transform">Sign in</Link>
                </Button>
              </>
            )}

            {/* Get Pro — hidden for Pro users */}
            {(() => {
              const userPlan = isSignedIn ? ((session?.user as Record<string, unknown>)?.plan as string || "free") : "free";
              if (userPlan === "pro") return null;
              return (
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="group relative hover:scale-105 active:scale-95 transition-all shadow-[var(--shadow-glow-accent)] bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] border-none" 
                  asChild
                >
                  <Link href="/pricing">
                    Get Pro <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-[3px] transition-transform" />
                  </Link>
                </Button>
              );
            })()}
          </div>
        </div>

      </div>

    </header>

      {/* Mobile Drawer — outside header element to avoid backdrop-filter containing block */}
          <div
            ref={drawerRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className={`fixed inset-x-0 top-[60px] bottom-0 z-[999] md:hidden bg-[var(--bg-base)] border-t border-[var(--border-subtle)] overflow-y-auto transition-all duration-200 ease-[cubic-bezier(0,0,0.2,1)] ${mobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
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
              {isSignedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-[var(--radius-md)] transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/favorites"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-[var(--radius-md)] transition-colors"
                  >
                    Favorites
                  </Link>
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await signOut();
                      window.location.href = "/";
                    }}
                    className="block w-full text-left px-4 py-3 text-sm text-[var(--danger)] hover:bg-[var(--bg-surface)] rounded-[var(--radius-md)] transition-colors cursor-pointer"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-[var(--radius-md)] transition-colors"
                >
                  Sign in
                </Link>
              )}

              <div className="px-4 py-3">
                <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Share Toolzum</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { emoji: '𝕏', title: 'Share on X', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${SITE_STATS.freeTierTotal}+ free privacy-first browser tools. ${SITE_STATS.localTools} run locally, ${SITE_STATS.cloudTools + SITE_STATS.hybridTools} cloud AI.`)}&url=${encodeURIComponent('https://toolzum.com')}`, hover: 'hover:text-white hover:bg-zinc-800 hover:border-white/30' },
                    { emoji: 'in', title: 'Share on LinkedIn', href: `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://toolzum.com')}`, hover: 'hover:text-white hover:bg-blue-600 hover:border-blue-500/30' },
                    { emoji: 'f', title: 'Share on Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://toolzum.com')}`, hover: 'hover:text-white hover:bg-indigo-600 hover:border-indigo-500/30' },
                    { emoji: 'WA', title: 'Share on WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${SITE_STATS.freeTierTotal}+ free privacy-first browser tools: https://toolzum.com`)}`, hover: 'hover:text-white hover:bg-emerald-700 hover:border-emerald-500/30' },
                    { emoji: 'RD', title: 'Share on Reddit', href: `https://reddit.com/submit?url=https://toolzum.com&title=Toolzum+—+privacy-first+browser+tools`, hover: 'hover:text-white hover:bg-orange-600 hover:border-orange-500/30' },
                    { emoji: 'TG', title: 'Share on Telegram', href: `https://t.me/share/url?url=https://toolzum.com&text=${encodeURIComponent('Check out Toolzum — privacy-first browser tools')}`, hover: 'hover:text-white hover:bg-sky-600 hover:border-sky-500/30' },
                  ].map(p => (
                    <a key={p.emoji} href={p.href} target="_blank" rel="noopener noreferrer" className={`w-8 h-8 rounded-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-bold font-mono text-[var(--text-muted)] transition-all ${p.hover}`} title={p.title} onClick={() => setMobileMenuOpen(false)}>{p.emoji}</a>
                  ))}
                  <button onClick={async () => { try { await navigator.clipboard.writeText('https://toolzum.com'); toast.success('Link copied!'); } catch {} setMobileMenuOpen(false); }} className="w-8 h-8 rounded-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex items-center justify-center text-[12px] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 hover:bg-[var(--accent-ink)]/5 transition-all cursor-pointer" title="Copy link">🔗</button>
                </div>
              </div>

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
                      <span className="mr-1.5 w-3.5 h-3.5 inline-flex items-center justify-center">{(() => { const Ico = getMegamenuIcon(col.icon); const color = getMegamenuIconColor(col.icon); return <Ico className={`w-3.5 h-3.5 ${color}`} />; })()}</span>
                      {col.title}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Free uses badge (mobile) */}
              <div className="flex items-center justify-center gap-1.5 px-3 py-2 mx-4 mt-4 mb-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-overlay)]">
                <Zap className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span className="text-[12px] font-mono text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Client-side tools unlimited</strong></span>
              </div>

              {/* Pro CTA — hidden for Pro users */}
              {(() => {
                const userPlan = isSignedIn ? ((session?.user as Record<string, unknown>)?.plan as string || "free") : "free";
                if (userPlan === "pro") return null;
                return (
                  <div className="pt-2 pb-6">
                    <Link
                      href="/pricing"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block mx-4 text-center px-4 py-3 text-sm font-medium text-white bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] rounded-[var(--radius-lg)] transition-colors"
                    >
                      Get Pro
                    </Link>
                  </div>
                );
              })()}
            </div>
          </div>
    </>
  );
}
