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
  faqs?: { question: string; answer: string }[];
}

const proToolCount = toolsRegistry.filter(t => t.isPro).length;
const toolCount = toolsRegistry.length;
const SITE_URL = "https://gotoolhub.com";

function getCategoryPath(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "-");
}

export function ToolLayout({ title, description, category, slug, children, faqs = [] }: ToolLayoutProps) {
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

  const categoryFaqTemplates: Record<string, { question: string; answer: string }[]> = {
    "PDF": [
      { question: "Are my PDFs private when using this tool?", answer: "Yes. All PDF processing happens entirely in your browser. Your files are never uploaded to any server, ensuring complete document privacy." },
      { question: "What PDF formats and versions are supported?", answer: "The tool works with standard PDF files. Most operations support both older and modern PDF versions." },
      { question: "Can I process large PDF files?", answer: "Processing capacity depends on your device's available memory. Very large files (500+ pages or 100MB+) may cause slower performance on low-memory devices." },
      { question: "Is there a limit on how many PDFs I can process?", answer: "No. You can process unlimited PDF files daily. All computation happens on your own device." },
      { question: "Does this work offline?", answer: "Yes. After the initial page load, all PDF tools function completely offline." },
    ],
    "Image": [
      { question: "Will I lose image quality during processing?", answer: "Quality depends on the operation. Lossless operations preserve original quality, while compression may slightly reduce quality based on your settings." },
      { question: "What image formats are supported?", answer: "Most tools support PNG, JPG, WebP, HEIC, GIF, and SVG." },
      { question: "Where are my images processed?", answer: "Completely on your device. Images never leave your browser." },
      { question: "Is there a file size limit?", answer: "No hard limit, but very large images (4000x4000px+) may process slower on lower-end devices." },
    ],
    "Video": [
      { question: "What video formats are supported?", answer: "Common formats include MP4, MOV, AVI, WebM, MKV, and GIF." },
      { question: "How long does video processing take?", answer: "Processing time depends on file size and your device's CPU. Most conversions complete within seconds." },
      { question: "Is video quality preserved?", answer: "Quality depends on your selected settings. Higher bitrate presets produce better quality." },
      { question: "Can I process videos offline?", answer: "Yes. All video processing uses FFmpeg WASM locally in your browser." },
    ],
    "Audio": [
      { question: "What audio formats can I convert?", answer: "Supported formats include MP3, WAV, OGG, M4A, FLAC." },
      { question: "Does compression reduce audio quality?", answer: "Quality depends on the bitrate you choose. Higher bitrates preserve more detail." },
      { question: "Is my audio data private?", answer: "Absolutely. All audio processing happens locally in your browser." },
    ],
    "Developer": [
      { question: "What programming languages are supported?", answer: "Tools cover JavaScript, CSS, HTML, SQL, Python, JSON, XML, and CSV." },
      { question: "Is my code sent to a server?", answer: "No. All code processing runs locally in your browser." },
      { question: "Can I use these tools offline?", answer: "Yes. All developer tools work fully offline after the initial page load." },
    ],
    "Text": [
      { question: "Will my text be saved or shared?", answer: "No. Your text stays on your device and is never sent to any server." },
      { question: "What text transformations are available?", answer: "Options include case changes, reversal, unicode styling, binary encoding, and more." },
      { question: "Is there a character limit?", answer: "No hard limit, but very large documents (1M+ characters) may cause slower UI responsiveness." },
    ],
    "SEO": [
      { question: "Will these tools improve my search rankings?", answer: "They help generate technically correct sitemaps, meta tags, and content analysis — fundamental SEO building blocks." },
      { question: "Is the generated code ready to use?", answer: "Yes. The output is standard XML or HTML ready to deploy." },
      { question: "Are my website details stored?", answer: "No. All data stays in your browser." },
    ],
    "Finance": [
      { question: "How accurate are the calculations?", answer: "All calculators use standard financial formulas accurate to two decimal places." },
      { question: "Can I save my calculation history?", answer: "Some calculators include local storage. History stays on your device." },
      { question: "Are the results financial advice?", answer: "No. These tools provide calculations for educational purposes. Consult a financial advisor." },
    ],
    "Privacy": [
      { question: "How is my sensitive data protected?", answer: "All operations run locally. Passwords and keys never leave your device." },
      { question: "Is the encryption truly secure?", answer: "Yes. Encryption uses AES via crypto-js and OpenPGP.js — industry-standard implementations." },
      { question: "Can I use these tools offline?", answer: "Yes. All privacy tools run completely offline." },
    ],
    "Downloader": [
      { question: "Is downloading videos legal?", answer: "Only download content you have the rights to access. Respect copyright." },
      { question: "What video quality is available?", answer: "Available quality depends on the source platform." },
      { question: "Why does my download fail?", answer: "Downloads may fail if the source platform changes its API or the content is removed." },
    ],
    "AI": [
      { question: "Do I need an API key?", answer: "Some AI tools require a provider API key (OpenAI, Anthropic, etc.)." },
      { question: "Is my prompt data private?", answer: "Prompts are sent to the AI provider you configure." },
      { question: "Why is there a loading delay?", answer: "AI generation requires network calls to the provider's API." },
    ],
    "indian-utilities": [
      { question: "Is my personal data safe?", answer: "Yes. All processing happens locally. Aadhaar and PAN data never leave your device." },
      { question: "What Indian formats are supported?", answer: "Aadhaar masking, PAN verification, IFSC lookup, pincode finder, and Indian calculations." },
      { question: "Can I use these for official purposes?", answer: "These tools are for personal assistance. Official verification should use government portals." },
    ],
    "Extension": [
      { question: "How do I install these extensions?", answer: "Download the files and follow your browser's developer mode extension installation guide." },
      { question: "Are the extensions safe?", answer: "All generated extensions use manifest files you can review before installing." },
      { question: "What browsers are supported?", answer: "Manifest V3 is compatible with Chrome, Edge, Brave, and Chromium-based browsers." },
    ],
    "Health": [
      { question: "Is this medical advice?", answer: "No. These tools provide informational calculations. Consult a healthcare professional." },
      { question: "Are my health details private?", answer: "Yes. All calculations happen locally in your browser." },
    ],
    "HR": [
      { question: "Are these calculations legally binding?", answer: "No. They provide estimates. Consult a legal professional for official matters." },
      { question: "Is employee data stored?", answer: "No. All data stays on your device." },
    ],
    "Business": [
      { question: "Can I use these for official business documents?", answer: "Yes, the output can be used for business purposes but verify accuracy." },
      { question: "Is my business data private?", answer: "Yes. All processing happens locally in your browser." },
    ],
  };
  const defaultFaqs: { question: string; answer: string }[] = [
    { question: "Is this tool free to use?", answer: "Yes, this tool is completely free. No registration required." },
    { question: "How is my privacy protected?", answer: "All processing happens 100% locally in your browser. Your data is never uploaded." },
    { question: "Can I use this tool offline?", answer: "Yes. Once loaded, the tool runs entirely offline." },
  ];
  function getCategoryKey(cat: string): string {
    const map: Record<string, string> = {
      pdf: "PDF", image: "Image", video: "Video", audio: "Audio",
      developer: "Developer", text: "Text", finance: "Finance",
      utility: "Utility", converter: "Converter", downloader: "Downloader",
      seo: "SEO", privacy: "Privacy", ai: "AI", branding: "Branding",
      productivity: "Productivity", design: "Design", transcription: "Transcription",
      extension: "Extension", marketing: "Marketing", health: "Health",
      hr: "HR", business: "Business", "e-commerce": "E-commerce", lifestyle: "Lifestyle",
    };
    return map[cat.toLowerCase().replace(/\s+/g, "-")] || cat;
  }
  const finalFaqs = faqs && faqs.length > 0
    ? faqs
    : (tool ? (categoryFaqTemplates[getCategoryKey(tool.category)] ?? defaultFaqs) : []);

  const faqSchema = finalFaqs && finalFaqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": finalFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

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
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
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

          {/* SEO FAQs */}
          {finalFaqs && finalFaqs.length > 0 && (
            <section className="mt-24 w-full text-left">
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-8 flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {finalFaqs.map((faq, index) => (
                  <details key={index} className="group bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden transition-all [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer items-center justify-between p-5 text-[var(--text-primary)] font-medium select-none">
                      <span>{faq.question}</span>
                      <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="px-5 pb-5 pt-1 text-[var(--text-secondary)] text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          </main>

          <PostDownloadBar />
          <PostDownloadSurvey />
        </div>
      </>
    );
  }
