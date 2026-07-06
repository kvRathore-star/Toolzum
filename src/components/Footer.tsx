"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Globe, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] text-[var(--text-secondary)] py-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Brand */}
          <div className="flex flex-col items-start">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <span className="font-semibold text-lg text-[var(--text-primary)]">Tool<span className="text-[var(--accent)]">Hub</span></span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              PDF, images, video, AI and more — in one place. Zero uploads. Starts in seconds.
            </p>
          </div>

          {/* Column 2: Tools */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.1em]">Categories</h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li><Link href="/tools?category=Image" className="hover:text-[var(--accent)] transition-colors">Image</Link></li>
              <li><Link href="/tools?category=PDF" className="hover:text-[var(--accent)] transition-colors">PDF</Link></li>
              <li><Link href="/tools?category=AI" className="hover:text-[var(--accent)] transition-colors">AI Tools</Link></li>
              <li><Link href="/tools?category=Video" className="hover:text-[var(--accent)] transition-colors">Video</Link></li>
              <li><Link href="/tools?category=Audio" className="hover:text-[var(--accent)] transition-colors">Audio</Link></li>
              <li><Link href="/tools?category=Converter" className="hover:text-[var(--accent)] transition-colors">Converter</Link></li>
              <li><Link href="/tools?category=Downloader" className="hover:text-[var(--accent)] transition-colors">Downloader</Link></li>
              <li><Link href="/tools?category=Text" className="hover:text-[var(--accent)] transition-colors">Text</Link></li>
              <li><Link href="/tools?category=Developer" className="hover:text-[var(--accent)] transition-colors">Developer</Link></li>
              <li><Link href="/tools?category=Finance" className="hover:text-[var(--accent)] transition-colors">Finance</Link></li>
              <li><Link href="/tools?category=Utility" className="hover:text-[var(--accent)] transition-colors">Utility</Link></li>
              <li><Link href="/tools?category=indian-utilities" className="hover:text-[var(--india)] transition-colors">India 🇮🇳</Link></li>
            </ul>
          </div>

          {/* Column 3: Product */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.1em]">Product</h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li><Link href="/pricing" className="hover:text-[var(--accent)] transition-colors">Pricing</Link></li>
              <li><Link href="/extension" className="hover:text-[var(--accent)] transition-colors">Chrome Extension</Link></li>
              <li><Link href="/api" className="hover:text-[var(--accent)] transition-colors">API & Developers</Link></li>
              <li><Link href="/changelog" className="hover:text-[var(--accent)] transition-colors">Changelog</Link></li>
              <li><Link href="/roadmap" className="hover:text-[var(--accent)] transition-colors">Roadmap</Link></li>
              <li><Link href="/status" className="hover:text-[var(--accent)] transition-colors">Status</Link></li>
            </ul>
          </div>

          {/* Column 4: Company */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.1em]">Company</h4>
            <ul className="flex flex-col gap-3 text-sm">
              <li><Link href="/about" className="hover:text-[var(--accent)] transition-colors">About</Link></li>
              <li><Link href="/blog" className="hover:text-[var(--accent)] transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-[var(--accent)] transition-colors flex items-center gap-2">Careers <span className="text-[10px] bg-[var(--accent)]/10 text-[var(--accent)] px-1.5 py-0.5 rounded">Hiring</span></Link></li>
              <li><Link href="/privacy" className="hover:text-[var(--accent)] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[var(--accent)] transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--accent)] transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-[var(--text-muted)] text-center md:text-left">
            <span>&copy; {currentYear} ToolHub Inc. Made with ❤️ in India 🇮🇳</span>
            <span className="hidden md:block w-1 h-1 rounded-full bg-[var(--border-subtle)]" />
            <span>All processing happens in your browser — your files never leave your device.</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-xs">
              <Globe className="w-3.5 h-3.5" /> EN
            </button>
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
