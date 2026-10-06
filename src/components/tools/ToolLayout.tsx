"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { GlobalErrorBoundary } from '../GlobalErrorBoundary';
import { CategorySidebar, type SidebarGroup } from './CategorySidebar';
import { ChevronRight, Shield, Zap, Info, ArrowLeft, Sparkles, LayoutGrid } from 'lucide-react';
import type { RelatedTool, ToolMetadata } from '@/registry/tools';
import { FREE_SINGLE_ALTERNATIVE } from '@/registry/tools-constants';
import { PoweredBy } from '@/components/tools/PoweredBy';
import { clientToolsRegistry } from '@/registry/tools-client-index';
import { categorySlug } from '@/lib/categorySlugs';
import { PerToolBadge } from '@/components/privacy-claims';
import { useSession } from '@/lib/auth-client';
import { useFreeUsage } from '@/hooks/useFreeUsage';
import { useToolHistory } from '@/hooks/useToolHistory';
import { getCategoryTheme } from '@/lib/categoryTheme';
import { getShortDescription } from '@/lib/generateToolDescription';

const ToolPaywall = dynamic(() => import('./ToolPaywall').then(m => ({ default: m.ToolPaywall })), { ssr: false });
const PostDownloadSurvey = dynamic(() => import('@/components/PostDownloadSurvey').then(m => ({ default: m.PostDownloadSurvey })), { ssr: false });
const DownloadQuotaBadge = dynamic(() => import('@/components/tools/DownloadQuotaBadge').then(m => ({ default: m.DownloadQuotaBadge })), { ssr: false });
const DownloadLimitModal = dynamic(() => import('@/components/tools/DownloadLimitModal').then(m => ({ default: m.DownloadLimitModal })), { ssr: false });
const ShareTool = dynamic(() => import('@/components/ShareTool').then(m => ({ default: m.ShareTool })), { ssr: false });
const FavoriteStarButton = dynamic(() => import('@/components/FavoriteStarButton').then(m => ({ default: m.FavoriteStarButton })), { ssr: false });
const BulkDropPaywall = dynamic(() => import('@/components/BulkDropPaywall').then(m => ({ default: m.BulkDropPaywall })), { ssr: false });
const WorkflowPresetPanel = dynamic(() => import('@/components/WorkflowPresetPanel').then(m => ({ default: m.WorkflowPresetPanel })), { ssr: false });

const PostDownloadBar = dynamic(() => import('@/components/PostDownloadBar').then(m => ({ default: m.PostDownloadBar })), { ssr: false });

import { DOWNLOAD_PRODUCING_SLUGS } from '@/lib/downloadProducingSlugs';

// Only tools whose preset UI is wired through usePresetContext (outer WorkflowPresetPanel).
// BulkToolShell tools have their own inner preset panel — wrapping them in the outer
// panel creates a broken duplicate (save fails with "No configuration available to save").
const BULK_PRESET_SLUGS = new Set([
  'image-compressor', 'image-resizer',
]);

// Tools shipping with a visible Beta chip — the owner release gate in
// docs/TODO-TRACKER.md ("beta label stays until checklist + sign-off").
// Removing the slug IS the switch: delete it here when beta comes off.
const BETA_SLUGS = new Set(['pdf-editor']);

interface ToolLayoutProps {
  title: string;
  description: string;
  category: string;
  slug: string;
  children: React.ReactNode;
  seoSection?: React.ReactNode;
  tool?: ToolMetadata | null;
  proToolCount: number;
  toolCount: number;
  relatedTools: RelatedTool[];
  sidebarGroups?: SidebarGroup[];
}

const SITE_URL = "https://toolzum.com";
const SERVER_SIDE_SLUGS = new Set([
  'ai-translator', 'ai-paraphrasing-tool', 'ai-cover-letter-generator', 'ai-image-generator',
  'regex-tester', 'resume-ats-score-checker', 'complaint-letter-generator', 'subtitle-translator',
  'brand-color-palette-generator', 'youtube-transcript-generator', 'video-to-text-transcription',
  'meeting-minutes-generator', 'audio-to-text-transcription', 'pdf-ai-summariser', 'indian-voice-transcriber',
]);

const CREDIT_COST_SLUGS: Record<string, number> = {
  // NOTE: ai-image-generator is intentionally absent — its cost depends on
  // the in-tool engine choice (Pollinations 0 vs Gemini 5), shown inline.
  'ai-paraphrasing-tool': 1,
  'ai-translator': 1,
  'ai-cover-letter-generator': 1,
  'ai-document-chat': 1,
  'brand-color-palette-generator': 1,
  'complaint-letter-generator': 1,
  'regex-tester': 1,
  'youtube-transcript-generator': 1,
  'subtitle-translator': 1,
  'meeting-minutes-generator': 1,
  // NOTE: audio/video-to-text clean up pasted transcript dumps via TEXT
  // generation (1 credit) — they never touch /api/ai/transcribe.
  'video-to-text-transcription': 1,
  'audio-to-text-transcription': 1,
  'pdf-ai-summariser': 1,
  'resume-ats-score-checker': 1,
  'ai-humanizer': 1,
  'grammar-checker': 1,
};

// True audio uploads bill per minute (see transcriptionPricing.ts), so no
// flat number is honest — these slugs get a "1 credit/min" badge instead.
const PER_MINUTE_SLUGS = new Set(['podcast-transcription', 'indian-voice-transcriber']);

function getCategoryPath(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}

function getRelativePath(category: string, slug: string): string {
  return `/${getCategoryPath(category)}/${slug}`;
}

export function ToolLayout({ title, description, category, slug, children, seoSection, tool, proToolCount, toolCount, relatedTools: relatedToolsProp, sidebarGroups }: ToolLayoutProps) {
  const { data: sessionData, isPending } = useSession();

  const { remaining, canUse, recordUse, showSignInPrompt, showProPrompt, isSignedIn } = useFreeUsage(category);
  const { recordTool } = useToolHistory();

  const isPro = tool?.isPro || false;
  // Access model (locked Sep 2026): Pro pages are HARD-LOCKED for anonymous
  // visitors (sign in to enter) and taste-gated for signed-in free users
  // (2 Pro downloads/day, enforced at save). Never lock while the session is
  // still resolving — a lock flash for signed-in users is worse than a brief
  // content flash for anon.
  const isAnonResolved = !isPending && !sessionData?.user;
  const isLocked = isPro && isAnonResolved;
  // Free single-file escape hatch for locked Pro bulk tools (Oct 5 trust
  // program): anonymous users bounce to a working free tool instead of exiting.
  const freeAltSlug = FREE_SINGLE_ALTERNATIVE[slug];
  const freeAltTool = freeAltSlug
    ? clientToolsRegistry.find((t) => t.slug === freeAltSlug)
    : undefined;
  const freeAlt = freeAltTool
    ? { name: freeAltTool.name, href: `/${categorySlug(freeAltTool.category)}/${freeAltTool.slug}/` }
    : null;
  const displayCategory = category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  // Layout option: sidebar rail vs classic wide. Persisted per browser;
  // defaults to the rail. Pure presentation — same content, same URLs.
  const [rail, setRail] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem('toolzum:sidebar') !== 'off';
    } catch {
      return true;
    }
  });
  const showRail = rail && !!sidebarGroups && sidebarGroups.length > 0;
  const toggleRail = () => {
    setRail((r) => {
      try {
        window.localStorage.setItem('toolzum:sidebar', r ? 'off' : 'on');
      } catch { /* private mode */ }
      return !r;
    });
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Toolzum", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "Tools", "item": `${SITE_URL}/tools` },
      { "@type": "ListItem", "position": 3, "name": displayCategory, "item": `${SITE_URL}/${getCategoryPath(category)}` },
    ],
  };

  const softwareSchema = tool ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "description": tool ? getShortDescription(tool) : undefined,
    "applicationCategory": "WebApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": tool.isPro ? "9.99" : "0.00",
      "priceCurrency": "USD",
    },
  } : null;

  const relatedTools = relatedToolsProp;

  const nextTool = useMemo(() => {
    return relatedTools.length > 0 ? relatedTools[0] : null;
  }, [relatedTools]);

  useEffect(() => {
    if (tool) {
      recordTool(tool.slug, tool.name, tool.category);
    }
  }, [tool, recordTool]);

  // Log usage to server for signed-in users (once per tool visit)
  useEffect(() => {
    if (!tool || !isSignedIn) return;
    const key = `usage-logged-${tool.slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch("/api/user/log-usage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolSlug: tool.slug, toolName: tool.name, category: tool.category }),
    }).catch(() => {});
  }, [tool, isSignedIn]);

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

      {nextTool && (
        <link
          rel="prefetch"
          href={getRelativePath(nextTool.category, nextTool.slug)}
        />
      )}

      <div className="min-h-screen bg-[var(--bg-base)]">

          {/* #45: OfflineIndicator now lives once in SiteShell (was doubled here) */}
          <BulkDropPaywall />
        
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--accent-ink)]/5 blur-[120px] rounded-full pointer-events-none hidden sm:block" />

        <div className={`${showRail ? 'max-w-[1240px]' : 'max-w-[960px]'} mx-auto py-10 sm:py-14 lg:py-16 px-4 sm:px-8 md:px-10 relative z-10 flex flex-col items-center text-center`}>

          {/* Back link + layout option */}
          <div className="w-full flex justify-between items-center mb-4">
            <Link
              href={`/${category}`}
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to {displayCategory}
            </Link>
            {sidebarGroups && sidebarGroups.length > 0 && (
              <button
                onClick={toggleRail}
                aria-pressed={showRail}
                aria-label={showRail ? 'Switch to wide layout without sidebar' : 'Switch to sidebar layout'}
                title={showRail ? 'Wide view' : 'Sidebar view'}
                className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-wider"
              >
                <LayoutGrid className="w-3 h-3" />
                {showRail ? 'Wide' : 'Sidebar'}
              </button>
            )}
          </div>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">Toolzum</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/tools" className="hover:text-[var(--text-primary)] transition-colors">Tools</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${category}`} className="hover:text-[var(--text-primary)] transition-colors">{displayCategory}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[var(--text-primary)]">{title}</span>
          </nav>

          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-6xl text-[var(--text-primary)] mb-4">
            {title}
            {BETA_SLUGS.has(slug) && (
              <span
                className="ml-3 align-middle text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border text-warning border-warning/40 bg-warning/10"
                title="Beta: core features work, edge cases may not — report anything odd via the contact form."
              >
                Beta
              </span>
            )}
          </h1>
          <p className="text-lg text-[var(--text-secondary)] mb-6 max-w-[600px]">
            {description}
          </p>
          {tool && <PoweredBy deps={tool.dependencies || ""} linked className="mb-6 -mt-4" />}

          {/* Badges row */}
          <div className="flex items-center gap-3 sm:gap-4 mb-12 text-[11px] font-medium text-[var(--text-muted)] tracking-wide bg-[var(--bg-overlay)] border border-[var(--border-subtle)] px-3 sm:px-4 py-2 rounded-full shadow-sm hover:border-[var(--border-default)] transition-colors flex-wrap justify-center">
            {tool && <PerToolBadge tool={tool} />}
            {tool && <span className="w-[1px] h-3 bg-[var(--border-subtle)]" />}
            {tool && <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-[var(--warning)]" /> Browser Native</span>}
            {CREDIT_COST_SLUGS[slug] && (
              <>
                <span className="w-[1px] h-3 bg-[var(--border-subtle)]" />
                <span className="flex items-center gap-1.5 text-amber-500">
                  <Sparkles className="w-3.5 h-3.5" />
                  {CREDIT_COST_SLUGS[slug]} credit{CREDIT_COST_SLUGS[slug] > 1 ? 's' : ''} per use
                </span>
                {!isPending && !sessionData?.user && (
                  <>
                    <span className="w-[1px] h-3 bg-[var(--border-subtle)]" />
                    <Link
                      href="/sign-in"
                      className="flex items-center gap-1.5 text-[var(--accent)] hover:underline"
                      aria-label="Sign in free to get 5 trial AI credits"
                    >
                      Sign in free — 5 trial credits
                    </Link>
                  </>
                )}
              </>
            )}
            {PER_MINUTE_SLUGS.has(slug) && (
              <>
                <span className="w-[1px] h-3 bg-[var(--border-subtle)]" />
                <span className="flex items-center gap-1.5 text-amber-500">
                  <Sparkles className="w-3.5 h-3.5" />
                  1 credit/min
                </span>
              </>
            )}
            {tool && <span className="w-[1px] h-3 bg-[var(--border-subtle)]" />}
            {BULK_PRESET_SLUGS.has(slug) && <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-[var(--accent)]" /> Bulk &amp; Presets ✦ Pro</span>}
            {BULK_PRESET_SLUGS.has(slug) && <span className="w-[1px] h-3 bg-[var(--border-subtle)]" />}
            <ShareTool title={title} slug={slug} category={category} />
            <span className="w-[1px] h-3 bg-[var(--border-subtle)]" />
            <FavoriteStarButton slug={slug} />
            {DOWNLOAD_PRODUCING_SLUGS.has(slug) && <DownloadQuotaBadge />}
          </div>

          {/* Tool + sidebar: rail on xl, drawer on mobile. Without groups
              the layout is byte-identical to before (no sidebar rendered). */}
          <div className="w-full xl:flex xl:items-start xl:gap-6 xl:text-left">
            {showRail && (
              <CategorySidebar
                categoryName={displayCategory}
                categoryHref={`/${category}`}
                totalCount={(sidebarGroups || []).reduce((n, g) => n + g.tools.length, 0)}
                currentSlug={slug}
                groups={sidebarGroups || []}
              />
            )}
            <div className="min-w-0 flex-1">

          {/* Tool Container */}
          <div className="w-full text-left bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow overflow-hidden relative p-6 sm:p-8">
            <GlobalErrorBoundary>
              {BULK_PRESET_SLUGS.has(slug) ? (
                <WorkflowPresetPanel toolSlug={slug}>
                  <ToolPaywall
                    isLocked={isLocked}
                    showSignInPrompt={isAnonResolved}
                    proToolCount={proToolCount}
                    toolCount={toolCount}
                    title={title}
                    freeAlt={freeAlt}
                  >
                    {children}
                  </ToolPaywall>
                </WorkflowPresetPanel>
              ) : (
                <ToolPaywall
                  isLocked={isLocked}
                  showSignInPrompt={isAnonResolved}
                  proToolCount={proToolCount}
                  toolCount={toolCount}
                  title={title}
                  freeAlt={freeAlt}
                >
                  {children}
                </ToolPaywall>
              )}
            </GlobalErrorBoundary>
          </div>

          {seoSection}

          {/* Related Tools */}
          {relatedTools.length > 0 && (
            <div className="w-full mt-16">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                  Related {displayCategory} Tools
                </h2>
                <div className="h-px flex-1 bg-[var(--border-subtle)]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {relatedTools.map(rt => {
                  const theme = getCategoryTheme(rt.category);
                  const Icon = theme.icon;
                  return (
                    <Link
                      key={rt.slug}
                      href={`/${getCategoryPath(rt.category)}/${rt.slug}`}
                      className="group flex items-center gap-3 p-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--border-default)] hover:-translate-y-0.5"
                    >
                      <div className={`w-9 h-9 rounded-lg ${theme.bgTint} flex items-center justify-center shrink-0 ring-1 ring-[var(--border-subtle)]`}>
                        <Icon className={`w-4 h-4 ${theme.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">{rt.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)] truncate">{rt.description}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

            </div>
            </div>
          </div>

          <PostDownloadBar />
          <PostDownloadSurvey />
          <DownloadLimitModal />
        </div>
      </>
    );
  }
