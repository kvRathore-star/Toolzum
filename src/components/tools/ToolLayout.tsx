"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { GlobalErrorBoundary } from '../GlobalErrorBoundary';
import { ChevronRight, Shield, Zap, Info, Crown, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import { getToolByCategoryAndSlug, toolsRegistry } from '@/registry/tools';
import { useSession } from '@/lib/auth-client';
import { ToolPaywall } from './ToolPaywall';
import { useFreeUsage } from '@/hooks/useFreeUsage';
import { PostDownloadBar } from '@/components/PostDownloadBar';
import { PostDownloadSurvey } from '@/components/PostDownloadSurvey';
import { useToolHistory } from '@/hooks/useToolHistory';
import { getCategoryTheme } from '@/lib/categoryTheme';
import { ShareTool } from '@/components/ShareTool';
import { ProComparisonChart } from '@/components/ProComparisonChart';
import { PostProcessUpgrade } from '@/components/PostProcessUpgrade';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { BulkDropPaywall } from '@/components/BulkDropPaywall';
import type { SessionUser } from '@/types/tool';

interface ToolLayoutProps {
  title: string;
  description: string;
  category: string;
  slug: string;
  children: React.ReactNode;
  seoSection?: React.ReactNode;
}

const proToolCount = toolsRegistry.filter(t => t.isPro).length;
const toolCount = toolsRegistry.length;
const SITE_URL = "https://gotoolhub.com";

function getCategoryPath(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}

function getRelativePath(category: string, slug: string): string {
  return `/${getCategoryPath(category)}/${slug}`;
}

export function ToolLayout({ title, description, category, slug, children, seoSection }: ToolLayoutProps) {
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

  const { remaining, canUse, recordUse, showSignInPrompt, showProPrompt, isSignedIn, freeMaxSizeMB, freeMaxBatch } = useFreeUsage(category);
  const { recordTool } = useToolHistory();

  const tool = getToolByCategoryAndSlug(category, slug);
  const isPro = tool?.isPro || false;
  const isProLocked = isPro && userPlan !== "pro";
  const isLocked = isProLocked;
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

  const relatedTools = useMemo(() => {
    if (!tool) return [];
    return toolsRegistry
      .filter(t => t.category === tool.category && t.slug !== tool.slug)
      .slice(0, 6);
  }, [tool]);

  const nextTool = useMemo(() => {
    return relatedTools.length > 0 ? relatedTools[0] : null;
  }, [relatedTools]);

  useEffect(() => {
    if (tool) {
      recordTool(tool.slug, tool.name, tool.category);
    }
  }, [tool, recordTool]);

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

          <OfflineIndicator />
          <BulkDropPaywall />
        
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--accent)]/5 blur-[120px] rounded-full pointer-events-none" />

        <main className="max-w-[800px] mx-auto py-16 px-4 sm:px-6 relative z-10 flex flex-col items-center text-center">
          
          {/* Back link */}
          <div className="w-full flex justify-start mb-4">
            <Link
              href={`/${category}`}
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to {displayCategory}
            </Link>
          </div>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-8" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">ToolHub</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/tools" className="hover:text-[var(--text-primary)] transition-colors">Tools</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${category}`} className="hover:text-[var(--text-primary)] transition-colors">{displayCategory}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[var(--text-primary)]">{title}</span>
          </nav>

          <h1 className="font-[family-name:var(--font-serif)] text-5xl sm:text-6xl text-[var(--text-primary)] mb-4">
            {title}
          </h1>
          <p className="text-lg text-[var(--text-secondary)] mb-6 max-w-[600px]">
            {description}
          </p>

          {/* Badges row */}
          <div className="flex items-center gap-4 mb-12 text-[11px] font-medium text-[var(--text-muted)] tracking-wide bg-[var(--bg-overlay)] border border-[var(--border-subtle)] px-4 py-2 rounded-full shadow-sm hover:border-[var(--border-default)] transition-colors">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-[var(--success)]" /> 100% Private</span>
            <span className="w-[1px] h-3 bg-[var(--border-subtle)]" />
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-[var(--warning)]" /> Browser Native</span>
            <span className="w-[1px] h-3 bg-[var(--border-subtle)]" />
            <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-[var(--accent)]" /> {proToolCount}+ Pro Tools</span>
            <span className="w-[1px] h-3 bg-[var(--border-subtle)]" />
            <ShareTool title={title} slug={slug} category={category} />
          </div>

          {/* Tool Container */}
          <div className="w-full text-left bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow overflow-hidden relative">
            <GlobalErrorBoundary>
              <ToolPaywall
                isLocked={isLocked}
                isFreeTier={isFreeTier}
                isProLocked={isProLocked}
                showSignInPrompt={showSignInPrompt}
                proToolCount={proToolCount}
                toolCount={toolCount}
                title={title}
              >
                {children}
              </ToolPaywall>
            </GlobalErrorBoundary>
          </div>

          {/* Pro Comparison Chart */}
          <div className="w-full mt-10">
            <ProComparisonChart toolName={title} category={category} />
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
                        <p className="text-[10px] text-[var(--text-muted)] truncate">{rt.dependencies}</p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          </main>

          <PostDownloadBar />
          <PostDownloadSurvey />
          <PostProcessUpgrade toolName={title} />
        </div>
      </>
    );
  }
