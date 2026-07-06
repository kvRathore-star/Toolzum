"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { GlobalErrorBoundary } from '../GlobalErrorBoundary';
import { ChevronRight, Shield, Zap, Info, Lock, LogIn, Sparkles, Crown } from 'lucide-react';
import { getToolByCategoryAndSlug, toolsRegistry } from '@/registry/tools';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { ToolPageSEOContent } from './ToolPageSEOContent';
import { useFreeUsage, ANON_LIMIT, SIGNED_IN_EXTRA } from '@/hooks/useFreeUsage';
import { PostDownloadBar } from '@/components/PostDownloadBar';
import { PostDownloadSurvey } from '@/components/PostDownloadSurvey';
import { useToolHistory } from '@/hooks/useToolHistory';
import type { SessionUser } from '@/types/tool';

interface ToolLayoutProps {
  title: string;
  description: string;
  category: string;
  slug: string;
  children: React.ReactNode;
}

const proToolCount = toolsRegistry.filter(t => t.isPro).length;
const toolCount = toolsRegistry.length;
const SITE_URL = "https://gotoolhub.com";

function getCategoryPath(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}

export function ToolLayout({ title, description, category, slug, children }: ToolLayoutProps) {
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const { data: sessionData, isPending } = useSession();

  useEffect(() => {
    if (!isPending && sessionData?.user) {
      const user = sessionData.user as unknown as SessionUser;
      setUserPlan(user.plan || "free");
    } else if (!isPending) {
      setUserPlan("free");
    }
  }, [sessionData, isPending]);

  const { remaining, canUse, recordUse, showSignInPrompt, showProPrompt, isSignedIn } = useFreeUsage();
  const { recordTool } = useToolHistory();
  const [blockedByEvent, setBlockedByEvent] = useState(false);

  const handleBlocked = useCallback(() => {
    setBlockedByEvent(true);
    recordUse();
  }, [recordUse]);

  useEffect(() => {
    window.addEventListener("toolhub:download-blocked", handleBlocked);
    return () => window.removeEventListener("toolhub:download-blocked", handleBlocked);
  }, [handleBlocked]);

  const tool = getToolByCategoryAndSlug(category, slug);
  const isPro = tool?.isPro || false;
  const isProLocked = isPro && userPlan !== "pro";
  const isFreeLimited = !isPro && userPlan !== "pro" && (!canUse || blockedByEvent);
  const isLocked = isProLocked || isFreeLimited;
  const isFreeTier = userPlan !== null && userPlan !== "pro" && !isProLocked;
  const displayCategory = category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "ToolHub", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Tools", "item": `${SITE_URL}/tools` },
      { "@type": "ListItem", "position": 3, "name": displayCategory, "item": `${SITE_URL}/${getCategoryPath(category)}` },
    ],
  };

  const softwareSchema = tool ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "description": tool.description,
    "applicationCategory": "WebApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": tool.isPro ? "14.99" : "0.00",
      "priceCurrency": "USD",
    },
  } : null;

  // Preload next tool for instant navigation
  const nextTool = useMemo(() => {
    const siblings = toolsRegistry
      .filter(t => t.category === tool?.category && t.slug !== tool?.slug);
    return siblings.length > 0 ? siblings[0] : null;
  }, [tool]);

  // Record tool in persistent history
  useEffect(() => {
    if (tool) {
      recordTool(tool.slug, tool.name, tool.category);
    }
  }, [tool, recordTool]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const active = document.activeElement;
        if (active instanceof HTMLElement) active.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {softwareSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
      )}

      {/* Prefetch next related tool */}
      {nextTool && (
        <link
          rel="prefetch"
          href={`/${getCategoryPath(nextTool.category)}/${nextTool.slug}`}
        />
      )}

      <div className="min-h-screen bg-[var(--bg-base)]">
        
        {/* Background Accent Glow */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--accent)]/5 blur-[120px] rounded-full pointer-events-none" />

        <main className="max-w-[800px] mx-auto py-16 px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">ToolHub</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/tools" className="hover:text-[var(--text-primary)] transition-colors">Tools</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${category}`} className="hover:text-[var(--text-primary)] transition-colors">{displayCategory}</Link>
          </nav>

          {/* Header */}
          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-6xl text-[var(--text-primary)] mb-4">
            {title}
          </h1>
          <p className="text-lg text-[var(--text-secondary)] mb-6 max-w-[600px]">
            {description}
          </p>

          {/* Trust Badges */}
          <div className="flex items-center gap-4 mb-12 text-[11px] font-medium text-[var(--text-muted)] tracking-wide bg-[var(--bg-overlay)] border border-[var(--border-subtle)] px-4 py-2 rounded-full shadow-sm">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[var(--success)]" /> 100% Private</span>
            <span className="w-[1px] h-3 bg-[var(--border-subtle)]" />
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-[var(--warning)]" /> Browser Native</span>
            <span className="w-[1px] h-3 bg-[var(--border-subtle)]" />
            <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-[var(--accent)]" /> {proToolCount}+ Pro Tools</span>
          </div>

          {/* The Widget Container */}
          <div className="w-full text-left bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-md)] overflow-hidden relative">
            <GlobalErrorBoundary>
              <div className="relative">
                <div className={isLocked ? "blur-md pointer-events-none select-none opacity-40 transition-all duration-300" : "transition-all duration-300"}>
                  {children}
                </div>

                {/* Pro teaser: gradient fade + watermark for free tier */}
                {isFreeTier && !isLocked && (
                  <>
                    <div
                      className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none z-10"
                      style={{
                        background: "linear-gradient(to bottom, transparent, var(--bg-elevated))",
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center pb-3">
                      <Link
                        href="/pricing"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[10px] font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors"
                      >
                        <Crown className="w-3 h-3" />
                        Upgrade to Pro for full access
                      </Link>
                    </div>
                  </>
                )}

                {isLocked && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[var(--bg-overlay)] border-2 border-[var(--accent)] rounded-[var(--radius-2xl)] p-8 text-center shadow-2xl relative overflow-hidden">
                      <div className="absolute -top-10 -left-10 w-32 h-32 bg-[var(--accent)]/10 blur-2xl rounded-full pointer-events-none" />

                      {isProLocked ? (
                        <>
                          <div className="w-14 h-14 bg-[var(--accent)]/15 rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--accent)]/30">
                            <Lock className="w-6 h-6 text-[var(--accent)]" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">Pro Tool</h3>
                          <p className="text-sm text-[var(--text-secondary)] mb-6">
                            Unlock <strong>{title}</strong> and the full suite of {proToolCount} premium Canvas, PDF, AI, and developer tools.
                          </p>
                          <div className="space-y-4">
                            <Link href="/pricing" className="block w-full">
                              <Button variant="primary" className="w-full py-6 text-base" size="lg">
                                Upgrade to Pro
                              </Button>
                            </Link>
                            <div className="text-xs text-[var(--text-muted)] pt-2">
                              Already subscribed?{" "}
                              <Link href="/dashboard" className="text-[var(--accent)] hover:underline font-semibold">
                                Log in to unlock
                              </Link>
                            </div>
                          </div>
                        </>
                      ) : showSignInPrompt ? (
                        <>
                          <div className="w-14 h-14 bg-amber-500/15 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/30">
                            <LogIn className="w-6 h-6 text-amber-400" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">Free Limit Reached</h3>
                          <p className="text-sm text-[var(--text-secondary)] mb-2">
                            You've used {ANON_LIMIT} free tries this month.
                          </p>
                          <p className="text-sm text-[var(--text-secondary)] mb-6">
                            Sign in to get <strong className="text-[var(--accent)]">{SIGNED_IN_EXTRA} more free uses</strong>.
                          </p>
                          <div className="space-y-3">
                            <Link href="/sign-in" className="block w-full">
                              <Button variant="primary" className="w-full py-5 text-base" size="lg">
                                Sign In — Get {SIGNED_IN_EXTRA} More Free Uses <Sparkles className="w-4 h-4 ml-1.5" />
                              </Button>
                            </Link>
                            <Link href="/pricing">
                              <Button variant="ghost" className="w-full text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]" size="sm">
                                Upgrade to Pro instead
                              </Button>
                            </Link>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-14 h-14 bg-[var(--accent)]/15 rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--accent)]/30">
                            <Zap className="w-6 h-6 text-[var(--accent)]" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-2">Daily Limit Reached</h3>
                          <p className="text-sm text-[var(--text-secondary)] mb-6">
                            You've used all your free tries this month. Upgrade to Pro for unlimited access to all {toolCount} tools.
                          </p>
                          <div className="space-y-4">
                            <Link href="/pricing" className="block w-full">
                              <Button variant="primary" className="w-full py-6 text-base" size="lg">
                                Upgrade to Pro
                              </Button>
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </GlobalErrorBoundary>
          </div>

          {/* Dynamic How-to Steps & Related Tools */}
          {tool && <ToolPageSEOContent tool={tool} />}

          </main>

          <PostDownloadBar />
          <PostDownloadSurvey />
        </div>
      </>
    );
  }
