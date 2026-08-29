"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Globe, Moon, Sun, Check, User, LayoutDashboard, Star } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession } from "@/lib/auth-client";

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "fr", label: "French", native: "Français" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "zh", label: "Chinese", native: "中文" },
  { code: "ja", label: "Japanese", native: "日本語" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "ru", label: "Russian", native: "Русский" },
];

function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("en");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const lang = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-xs cursor-pointer"
      >
        <Globe className="w-3.5 h-3.5" /> {lang.code.toUpperCase()}
      </button>
      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-48 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] shadow-2xl py-2 max-h-64 overflow-y-auto z-[100]">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setCurrent(l.code); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2 text-xs text-left hover:bg-[var(--bg-overlay)] transition-colors cursor-pointer ${current === l.code ? "text-[var(--accent)] font-semibold" : "text-[var(--text-secondary)]"}`}
            >
              <span>{l.native}</span>
              {current === l.code && <Check className="w-3 h-3" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mark mounted to avoid hydration mismatch in theme-aware footer
    setMounted(true);
  }, []);

  return (
    <footer className="bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] text-[var(--text-secondary)] py-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Brand */}
          <div className="flex flex-col items-start">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <span className="font-bold text-2xl tracking-tight text-[var(--text-primary)]">Tool<span className="text-[var(--accent)]">zum</span></span>
            </Link>
            <p className="text-base leading-relaxed mb-6 text-[var(--text-secondary)] max-w-[240px]">
              Privacy-first tools — PDF, images, video, converters, AI & more. All in one place.
            </p>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-[0.08em]">Share Toolzum</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <a href="https://twitter.com/intent/tweet?text=Check+out+Toolzum+—+privacy-first+browser+tools,+all+free.&url=https://toolzum.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex items-center justify-center text-[11px] font-bold font-mono text-[var(--text-muted)] hover:text-white hover:border-white/30 hover:bg-zinc-800 transition-all" title="Share on X/Twitter">𝕏</a>
                <a href="https://www.linkedin.com/sharing/share-offsite/?url=https://toolzum.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-bold font-mono text-[var(--text-muted)] hover:text-white hover:border-blue-500/30 hover:bg-blue-600 transition-all" title="Share on LinkedIn">in</a>
                <a href="https://www.facebook.com/sharer/sharer.php?u=https://toolzum.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-bold font-mono text-[var(--text-muted)] hover:text-white hover:border-indigo-500/30 hover:bg-indigo-600 transition-all" title="Share on Facebook">f</a>
                <a href="https://wa.me/?text=Check+out+Toolzum+—+privacy-first+browser+tools,+all+free.+https://toolzum.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex items-center justify-center text-[11px] font-bold font-mono text-[var(--text-muted)] hover:text-white hover:border-emerald-500/30 hover:bg-emerald-700 transition-all" title="Share on WhatsApp">WA</a>
                <a href="https://reddit.com/submit?url=https://toolzum.com&title=Toolzum+—+privacy-first+browser+tools" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex items-center justify-center text-[11px] font-bold font-mono text-[var(--text-muted)] hover:text-white hover:border-orange-500/30 hover:bg-orange-600 transition-all" title="Share on Reddit">RD</a>
                <a href="https://t.me/share/url?url=https://toolzum.com&text=Check+out+Toolzum+—+privacy-first+browser+tools" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex items-center justify-center text-[11px] font-bold font-mono text-[var(--text-muted)] hover:text-white hover:border-sky-500/30 hover:bg-sky-600 transition-all" title="Share on Telegram">TG</a>
                <button onClick={async () => { try { await navigator.clipboard.writeText('https://toolzum.com'); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {} }} className="w-8 h-8 rounded-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex items-center justify-center text-[11px] font-bold font-mono text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/30 hover:bg-[var(--accent-ink)]/5 transition-all cursor-pointer" title="Copy link">{copied ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : '🔗'}</button>
              </div>
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="flex flex-col gap-4">
            <p className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-[0.08em]">Product</p>
            <ul className="flex flex-col gap-3">
              <li><Link href="/tools" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">All Tools</Link></li>
              <li><Link href="/pricing" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Pricing</Link></li>
              <li><Link href="/extension" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Chrome Extension</Link></li>
              <li><Link href="/indian-utilities" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Indian Utilities</Link></li>
              <li><Link href="/changelog" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Changelog</Link></li>
              <li><Link href="/status" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Status</Link></li>
              <li><Link href="/faq" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="flex flex-col gap-4">
            <p className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-[0.08em]">Company</p>
            <ul className="flex flex-col gap-3">
              <li><Link href="/about" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">About</Link></li>
              <li><Link href="/blog" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex items-center gap-2">Careers <span className="text-[10px] font-semibold bg-[var(--accent-ink)]/10 text-[var(--accent)] px-1.5 py-0.5 rounded">Hiring</span></Link></li>
              <li><Link href="/roadmap" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Roadmap</Link></li>
              <li><Link href="/contact" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="flex flex-col gap-4">
            <p className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-[0.08em]">Legal</p>
            <ul className="flex flex-col gap-3">
              <li><Link href="/privacy-policy" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Cookie Policy</Link></li>
              <li><Link href="/terms" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Terms of Service</Link></li>
              <li><Link href="/security" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Security</Link></li>
            </ul>
          </div>

          {/* Column 5: Account */}
          <div className="flex flex-col gap-4">
            <p className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-[0.08em]">Account</p>
            <ul className="flex flex-col gap-3">
              {session?.user ? (
                <>
                  <li><Link href="/dashboard" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex items-center gap-2"><LayoutDashboard className="w-3.5 h-3.5" /> Dashboard</Link></li>
                  <li><Link href="/dashboard/favorites" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex items-center gap-2"><Star className="w-3.5 h-3.5" /> Favorites</Link></li>
                  <li><Link href="/dashboard/account" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex items-center gap-2"><User className="w-3.5 h-3.5" /> My Account</Link></li>
                </>
              ) : (
                <>
                  <li><Link href="/sign-in" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Sign In</Link></li>
                  <li><Link href="/sign-up" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Sign Up</Link></li>
                  <li><Link href="/forgot-password" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">Forgot Password</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-[var(--text-muted)] text-center md:text-left">
            <span>&copy; {currentYear} Toolzum Inc.</span>
            <span className="hidden md:block w-1 h-1 rounded-full bg-[var(--border-subtle)]" />
            <span>The browser supercomputer. Free, private, yours.</span>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector />
            <span className="w-px h-4 bg-[var(--border-subtle)]" />
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-xs cursor-pointer"
            >
              {mounted && theme === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5" /> Light
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5" /> Dark
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
