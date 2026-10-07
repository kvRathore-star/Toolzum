"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sun } from 'lucide-react';
import {
  Command, ArrowRight, ShieldCheck, Shield, Zap, Sparkles, ChevronRight,
  Check, MoveRight, Crown, Users, Layers, Star, Upload, FileText, HelpCircle, Lightbulb,
  Music, Video, File as FileIcon, FileImage
} from 'lucide-react';
import type { PopularTool, CategoryCount } from '@/registry/tools';
import { toast } from 'react-hot-toast';
import { SITE_STATS } from '@/registry/site-data.generated';
import { Button } from '@/components/ui/button';
import { getCategoryTheme } from '@/lib/categoryTheme';
import {
  CATEGORIES, STEPS, FEATURES, USE_CASES, INDIA_TOOLS,
  getWhyChoose, getStatsBar
} from '@/data/homepage';
import { useIsIndia } from '@/hooks/useIsIndia';
import { useSession } from '@/lib/auth-client';
import { getRemainingDownloads } from '@/utils/freeUsageGuard';
import { resolvePlan, fileCaps } from '@/lib/planTiers';
import { detectFileType, heroIntentsFor, heroBulkIntentsFor, heroDefaultIntentId, heroBlockReason, heroTypeWarning, heroSizeState, heroExtOf, type HeroFileType, type HeroIntent } from '@/lib/fileRoute';
import { stashHeroFile } from '@/lib/heroFile';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/hooks/useFavorites';
import { FavoriteStarButton } from '@/components/FavoriteStarButton';
import { getClientToolBySlug } from '@/registry/tools-client-index';

const { localTools, cloudTools, hybridTools, totalImplemented } = SITE_STATS;
const totalCloud = cloudTools + hybridTools;
const localPct = Math.round((localTools / totalImplemented) * 100);
const categoryCount = CATEGORIES.length;
const WHY_CHOOSE = getWhyChoose(totalImplemented);
const STATS_BAR = getStatsBar(totalImplemented, categoryCount, localTools);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export function HomeClient({ isIndia = false, popularTools, categoryCounts }: { isIndia?: boolean; popularTools: PopularTool[]; categoryCounts: CategoryCount[] }) {
  const [activeTab, setActiveTab] = useState("compress");
  const [suggestText, setSuggestText] = useState("");
  const DEMO_TABS = ["compress", "resize", "convert"];
  // Roving-tabindex arrow-key nav (APG tabs pattern): arrows move + select.
  const onDemoTabsKeyDown = (e: React.KeyboardEvent) => {
    const i = DEMO_TABS.indexOf(activeTab);
    let next: string | null = null;
    if (e.key === "ArrowRight") next = DEMO_TABS[(i + 1) % DEMO_TABS.length]!;
    else if (e.key === "ArrowLeft") next = DEMO_TABS[(i - 1 + DEMO_TABS.length) % DEMO_TABS.length]!;
    else if (e.key === "Home") next = DEMO_TABS[0]!;
    else if (e.key === "End") next = DEMO_TABS[DEMO_TABS.length - 1]!;
    if (next) {
      e.preventDefault();
      setActiveTab(next);
      document.querySelector<HTMLElement>(`[data-demotab="${next}"]`)?.focus();
    }
  };
  const showIndia = useIsIndia(isIndia);
  const { favorites, isLoading: favoritesLoading } = useFavorites();

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden">

      {/* ===== 1. HERO ===== */}
      <section ref={heroRef} className="relative overflow-x-clip pt-16 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
        <motion.div style={{ y: heroY }} className="absolute top-[-20%] left-[10%] w-[80%] h-[60%] rounded-full bg-[var(--accent-ink)]/8 blur-[140px] pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center relative z-10">
          <div className="flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex flex-wrap items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] mb-8 max-w-full"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{totalImplemented.toLocaleString()} free tools · {localPct}% local · no signup</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-[family-name:var(--font-serif)] text-5xl sm:text-7xl md:text-6xl lg:text-[84px] leading-[0.95] tracking-tight mb-6 sm:mb-8"
            >
              The browser<br />
              <span className="text-[var(--accent)]">supercomputer.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-md mb-10 leading-relaxed"
            >
              {totalImplemented.toLocaleString()}+ Privacy-first tools — PDF, images, video, converters, AI & more. All in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row flex-wrap items-center gap-4 w-full sm:w-auto"
            >
              <Button size="lg" className="w-full sm:w-auto whitespace-nowrap shadow-[var(--shadow-glow-accent)]" asChild>
                <Link href="/tools">
                  Explore All Tools <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto group" asChild>
                <button onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}>
                  Press <kbd className="mx-2 font-mono text-[11px] bg-[var(--bg-overlay)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] group-hover:bg-[var(--bg-elevated)] transition-colors">⌘K</kbd> to search
                </button>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-6 sm:gap-10 mt-10 lg:mt-16 pt-8 border-t border-[var(--border-subtle)] w-full"
            >
              <div className="flex flex-col">
                <span className="font-mono text-2xl text-[var(--text-primary)] font-semibold">{totalImplemented.toLocaleString()}+</span>
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Free Tools</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-2xl text-[var(--success)] font-semibold">{localPct}%</span>
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Local</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-2xl text-[var(--warning)] font-semibold">{totalCloud}</span>
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Cloud AI</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-2xl text-[var(--text-primary)] font-semibold">24/7</span>
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Available</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            className="relative lg:h-[600px] w-full flex items-center justify-center"
          >
            {/* No aspect ratio: the box sizes to content on mobile (no dead
                stretch, no overflow) and holds 600px presence on desktop. */}
            <div className="w-full max-w-[500px] min-h-[480px] lg:min-h-0 lg:h-[600px] bg-[var(--bg-elevated)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] shadow-[var(--shadow-lg)] overflow-hidden flex flex-col relative">
              <div className="h-12 border-b border-[var(--border-subtle)] flex items-center px-4 gap-2 bg-[var(--bg-overlay)]">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                <span className="ml-4 text-[11px] text-[var(--text-muted)] font-mono">toolzum — browser-supercomputer</span>
              </div>

              {/* Column fills the 600px panel: tabs, then the zone stretches.
                  justify-start (not between) so no dead void opens up. */}
              <div className="flex-1 p-6 flex flex-col justify-start gap-4 min-h-0">
                <div className="flex gap-4" role="tablist" aria-label="Demo actions" onKeyDown={onDemoTabsKeyDown}>
                  {DEMO_TABS.map(tab => (
                    <button
                      key={tab}
                      role="tab"
                      id={`demotab-${tab}`}
                      aria-controls="demotab-panel"
                      data-demotab={tab}
                      tabIndex={activeTab === tab ? 0 : -1}
                      aria-selected={activeTab === tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-sm font-medium capitalize pb-2 border-b-2 transition-colors ${
                        activeTab === tab ? 'border-[var(--accent)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div role="tabpanel" id="demotab-panel" aria-labelledby={`demotab-${activeTab}`} className="flex-1 flex flex-col min-h-0">
                <FileDropZone activeTab={activeTab} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 2. HOW IT WORKS ===== */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-sm font-semibold text-[var(--accent)] mb-6">
            <Zap className="w-4 h-4" /> How It Works
          </span>
          <h2 className="font-[family-name:var(--font-serif)] text-4xl sm:text-5xl text-[var(--text-primary)] mb-4">
            Three clicks. Process locally.
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
            No accounts, no upload queues, privacy first.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12 }}
              className="relative bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 sm:p-8 hover:border-[var(--accent)]/30 hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.06)] transition-all duration-500 group"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[40px] font-mono font-bold text-[var(--accent)] leading-none">{step.num}</span>
                <div className="h-px flex-1 bg-[var(--border-subtle)] group-hover:bg-[var(--accent-ink)]/30 transition-colors" />
              </div>
              <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--accent-soft)] border border-[var(--accent)]/20 flex items-center justify-center mb-5 transition-all">
                <step.icon className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{step.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-3 mt-12 text-sm text-[var(--text-muted)]"
        >
          <ShieldCheck className="w-4 h-4 text-[var(--success)]" />
          <span>No sign-up required. All tools are free to start.</span>
        </motion.div>
      </section>

      {/* ===== 3. FEATURES ===== */}
      <section className="border-y border-[var(--border-subtle)] bg-[var(--bg-overlay)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--border-subtle)]">
            {FEATURES.map((feat, i) => (
              <div key={i} className="py-12 px-6 sm:px-8 flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[var(--radius-lg)] bg-[var(--accent-soft)] border border-[var(--accent)]/20 flex items-center justify-center mb-4 sm:mb-6 transition-all">
                  <feat.icon className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <h3 className="text-[18px] font-medium text-[var(--text-primary)] mb-3">{feat.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4. CATEGORY SHOWCASE ===== */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto border-t border-[var(--border-subtle)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-sm font-semibold text-[var(--accent)] mb-6">
            <Layers className="w-4 h-4" /> Everything You Need
          </span>
          <h2 className="font-[family-name:var(--font-serif)] text-4xl sm:text-5xl text-[var(--text-primary)] mb-4">
            {totalImplemented.toLocaleString()}+ tools, {categoryCount} categories
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
            From PDF wrangling to AI generation — one platform does it all.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => {
            const count = categoryCounts.find(c => c.category === cat.label || c.category === cat.id)?.count ?? 0;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/${cat.id.toLowerCase()}`}
                  className="group flex flex-col items-start p-4 sm:p-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] hover:border-[var(--accent)]/30 hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.06)] transition-all duration-300 h-full"
                >
                  {(() => {
                    const theme = getCategoryTheme(cat.id);
                    return (
                      <div className={`w-10 h-10 rounded-[var(--radius-lg)] ${theme.bgTint} border border-[var(--border-subtle)] flex items-center justify-center mb-4 group-hover:border-[var(--accent)]/30 transition-all`}>
                        <cat.icon className={`w-5 h-5 ${theme.iconColor} transition-all`} />
                      </div>
                    );
                  })()}
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent)] transition-colors">{cat.label}</h3>
                  <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">{cat.desc}</p>
                  <span className="text-[11px] font-mono text-[var(--accent)] mt-auto">{count} tools &rarr;</span>
                </Link>
              </motion.div>
            );
          })}
<motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 7 * 0.06 }}
          >
            <Link
              href="/tools"
              className="group flex flex-col items-center justify-center p-5 bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] rounded-[var(--radius-xl)] hover:border-[var(--accent)]/30 transition-all duration-300 h-full text-center"
            >
              <span className="text-lg font-semibold mb-1">{totalImplemented.toLocaleString()}+ tools</span>
              <span className="text-xs text-[var(--text-muted)]">& counting</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== 5. USE CASES ===== */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto border-t border-[var(--border-subtle)] bg-[var(--bg-overlay)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-sm font-semibold text-[var(--accent)] mb-6">
            <Users className="w-4 h-4" /> Built for Everyone
          </span>
          <h2 className="font-[family-name:var(--font-serif)] text-4xl sm:text-5xl text-[var(--text-primary)] mb-4">
            One platform. Every workflow.
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
            Whether you design, develop, create, or run a business.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {USE_CASES.map((uc, i) => (
            <motion.div
              key={uc.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 hover:border-[var(--accent)]/20 transition-all duration-300"
            >
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">{uc.title}</h3>
              <ul className="space-y-3">
                {uc.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                    <Check className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={uc.slug}
                className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-[var(--accent)] hover:underline"
              >
                Explore tools <MoveRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== 6. WHY TOOLZUM ===== */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-sm font-semibold text-[var(--accent)] mb-6">
            <Star className="w-4 h-4" /> Why Toolzum
          </span>
          <h2 className="font-[family-name:var(--font-serif)] text-4xl sm:text-5xl text-[var(--text-primary)] mb-4">
            Built different by design.
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
            Every detail engineered for speed, privacy, and delight.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHY_CHOOSE.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] hover:border-[var(--accent)]/20 hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.05)] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--accent-soft)] border border-[var(--accent)]/20 flex items-center justify-center mb-4 transition-all">
                <item.icon className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{item.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== 6.5. YOUR FAVORITES ===== */}
      {!favoritesLoading && favorites.size > 0 && (
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto border-t border-[var(--border-subtle)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="font-[family-name:var(--font-serif)] text-4xl text-[var(--text-primary)] flex items-center gap-3">
                <Star className="w-8 h-8 fill-amber-400 text-amber-400" />
                Your Favorites
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-2">Tools you&apos;ve saved for quick access.</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(favorites).map((slug, i) => {
              const tool = getClientToolBySlug(slug);
              if (!tool) return null;
              const theme = getCategoryTheme(tool.category);
              const Icon = theme.icon;
              return (
                <motion.div
                  key={slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={`/${tool.category.toLowerCase().replace(/\s+/g, '-')}/${tool.slug}`}
                    className="group block h-full relative"
                  >
                    <div className={`h-full p-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] transition-all duration-300 shadow-sm hover:shadow-[var(--shadow-md)] hover:border-[var(--border-default)] hover:-translate-y-1 ${theme.gradientHover}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-8 h-8 rounded-full ${theme.bgTint} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${theme.iconColor}`} />
                        </div>
                        <FavoriteStarButton slug={slug} />
                      </div>
                      <h3 className="font-semibold text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent)] transition-colors flex items-center gap-2">
                        {tool.name}
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{tool.description}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== 7. POPULAR TOOLS ===== */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto border-t border-[var(--border-subtle)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h2 className="font-[family-name:var(--font-serif)] text-4xl text-[var(--text-primary)]">Most Used Tools</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2">The utilities our users reach for every day.</p>
          </div>
          <Link href="/tools" className="text-sm font-medium text-[var(--accent)] hover:underline hidden sm:flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularTools.map((tool, i) => {
            const theme = getCategoryTheme(tool.category);
            const Icon = theme.icon;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={`/${tool.category.toLowerCase().replace(/\s+/g, '-')}/${tool.slug}`}
                  className="group block h-full"
                >
                  <div className={`h-full p-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] transition-all duration-300 shadow-sm hover:shadow-[var(--shadow-md)] hover:border-[var(--border-default)] hover:-translate-y-1 ${theme.gradientHover}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-8 h-8 rounded-full ${theme.bgTint} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${theme.iconColor}`} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {tool.slug.startsWith('bulk-') && (
                          <span className="text-[10px] font-mono text-blue-700 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded">
                            Bulk
                          </span>
                        )}
                        {tool.isPro && !tool.slug.startsWith('bulk-') && (
                          <span className="text-[10px] font-mono text-amber-600 uppercase tracking-wider bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded">
                            Pro
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-overlay)] border border-[var(--border-subtle)] px-2 py-0.5 rounded">
                          {tool.category}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-base font-medium text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent)] transition-colors flex items-center gap-2">
                      {tool.name}
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all text-[var(--accent)]" />
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">
                      {tool.description}
                    </p>
                    <div className="h-1.5 w-full bg-[var(--bg-overlay)] rounded-full overflow-hidden">
                      <div className={`h-full ${theme.bgTint.replace('/10', '')} opacity-50`} style={{ width: `${50 + (tool.slug.length % 31)}%` }} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center sm:hidden"
        >
          <Link href="/tools" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline">
            View all tools <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* ===== PRO PRICING PREVIEW ===== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto border-t border-[var(--border-subtle)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-sm font-semibold text-amber-500 mb-4">
            <Crown className="w-4 h-4" /> Pro
          </span>
          <h2 className="font-[family-name:var(--font-serif)] text-4xl text-[var(--text-primary)] mb-3">
            Free today. Pro when you need more.
          </h2>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            All tools run in your browser completely free.{' '}
            Upgrade when you hit a limit — bulk processing, larger files, and AI extras.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-10">
          <div className="p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)]">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Free</span>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mb-4">$0</div>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Single file processing</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Basic file size limits (10-30MB)</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Unlimited client-side tools (PDF, images, video)</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Local processing</span></li>
              <li className="flex items-start gap-2 text-[var(--text-muted)]"><span className="w-4 mt-0.5 shrink-0 text-center">—</span><span>Bulk batch processing</span></li>
              <li className="flex items-start gap-2 text-[var(--text-muted)]"><span className="w-4 mt-0.5 shrink-0 text-center">—</span><span>AI generation & extraction</span></li>
            </ul>
          </div>
          <div className="p-6 bg-[var(--accent-ink)]/5 border-2 border-[var(--accent)] rounded-[var(--radius-xl)] relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[var(--accent-ink)] text-white text-[10px] font-mono uppercase tracking-wider rounded-full">Popular</div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span className="text-xs font-mono text-amber-700 dark:text-amber-400 uppercase tracking-wider">Pro</span>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">{showIndia ? '₹299' : '$9.99'}</div>
            <div className="text-xs text-[var(--text-muted)] mb-4">/{showIndia ? 'mo' : 'month'}, cancel anytime</div>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Batch up to 500 files at once</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Files up to 2GB</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Unlimited downloads</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Local processing</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Bulk batch processing</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>AI generation & extraction</span></li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-ink)] text-white font-medium rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
          >
            See full pricing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ===== 8. STATS BAR ===== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto border-t border-[var(--border-subtle)] bg-[var(--bg-overlay)]">
        <div className="text-center mb-8">
          <SocialProofTicker />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS_BAR.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <div className="font-mono text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-[var(--text-secondary)]">{stat.label}</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">{stat.sub}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== 9. INDIA SECTION ===== */}
      {showIndia && (
        <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF6B35]/50 to-transparent" />
          <div className="absolute top-0 inset-x-0 h-[100px] bg-gradient-to-b from-[#FF6B35]/[0.03] to-transparent pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-col items-center text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/20 text-sm font-semibold text-[#FF6B35] mb-6">
              <Sun className="w-4 h-4 inline mr-1" />Made for India
            </span>
            <h2 className="font-[family-name:var(--font-serif)] text-4xl text-[var(--text-primary)] mb-3">
              Built for Bharat
            </h2>
            <p className="text-lg text-[var(--text-secondary)]">
              The only tools platform that speaks your government&apos;s language.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {INDIA_TOOLS.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  href={`/indian-utilities/${item.slug}`}
                  className="group block p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] hover:border-[#FF6B35]/30 hover:bg-[#FF6B35]/[0.02] transition-colors"
                >
                  <h3 className="text-base font-medium text-[var(--text-primary)] mb-2 group-hover:text-[#FF6B35] transition-colors">{item.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ===== 10. FEEDBACK FORM ===== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto border-t border-[var(--border-subtle)]">
        <div className="max-w-3xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-ink)]/5 rounded-full blur-[80px]" />
          <Lightbulb className="w-8 h-8 text-[var(--accent)] mx-auto mb-4" />
          <h2 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl text-[var(--text-primary)] mb-3">
            Suggest a tool
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-8 max-w-lg mx-auto">
            If you need a tool that isn't on the roadmap, let us know! We design open-source, client-side algorithms based on community requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="text"
              aria-label="Suggest a tool"
              placeholder="e.g. SVG pattern generator..."
              value={suggestText}
              onChange={(e) => setSuggestText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  window.location.href = `/contact?subject=suggestion&message=${encodeURIComponent(suggestText.trim() ? `Tool suggestion: ${suggestText.trim()}` : '')}`;
                }
              }}
              className="flex-1 bg-[var(--bg-base)] text-sm border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
            <Link href={`/contact?subject=suggestion&message=${encodeURIComponent(suggestText.trim() ? `Tool suggestion: ${suggestText.trim()}` : '')}`}>
              <Button className="shrink-0 w-full sm:w-auto">Submit Request</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 11. FINAL CTA ===== */}
      <section className="relative overflow-x-clip py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto border-t border-[var(--border-subtle)]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[60%] h-[80%] rounded-full bg-[var(--accent-ink)]/5 blur-[100px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-purple-600 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(var(--accent-rgb),0.2)]">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-[family-name:var(--font-serif)] text-4xl sm:text-5xl text-[var(--text-primary)] mb-4">
            Start building. Nothing to install.
          </h2>
<p className="text-lg text-[var(--text-secondary)] mb-10 max-w-lg mx-auto">
            {totalImplemented.toLocaleString()}+ free tools. Free to use. Pro plan for unlimited bulk + AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto shadow-[var(--shadow-glow-accent)]" asChild>
              <Link href="/tools">
                Explore All Tools <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/pricing">
                See Pricing <MoveRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-6">
            No credit card required. No data ever leaves your browser.
          </p>
        </motion.div>
      </section>

    </div>
  );
}

function FileDropZone({ activeTab }: { activeTab: string }) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [blocked, setBlocked] = useState<string | null>(null);
  const [typeWarn, setTypeWarn] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [carrying, setCarrying] = useState(false);
  const { data: session } = useSession();
  const planCapMB = fileCaps(resolvePlan(!!session?.user, (session?.user as { plan?: string } | undefined)?.plan ?? null)).maxFileSizeMB;
  // User state (quota-aware box): cookie + local counters only — no request.
  // Server remains the source of truth at save time; this is a heads-up.
  const [quota, setQuota] = useState<{ signedIn: boolean; remaining: number } | null>(null);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate quota hint from local counters; re-run when the session resolves
      setQuota({ signedIn: !!session?.user, remaining: getRemainingDownloads() });
    } catch { /* stays neutral */ }
  }, [session?.user]);
  // Drag-enter/leave counter: crossing child elements fires leave events
  // without the pointer actually exiting (classic highlight flicker).
  const dragDepth = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const takeFiles = useCallback((list: FileList | null) => {
    if (!list || list.length === 0) return;
    const arr = Array.from(list);
    const first = arr[0]!;
    // Abuse gate 1: executables/installers never enter the box.
    const block = heroBlockReason(first.name);
    if (block) {
      setFiles([]);
      setSelectedId(null);
      setTypeWarn(null);
      setBlocked(block);
      toast.error('That file type is not supported here.', { icon: '⛔' });
      return;
    }
    // Abuse gate 2: 2GB hard browser-memory ceiling, every plan.
    if (heroSizeState(first.size, planCapMB) === 'too-big') {
      setFiles([]);
      setSelectedId(null);
      setTypeWarn(null);
      setBlocked('This file exceeds the 2GB browser limit — split it before processing.');
      return;
    }
    setBlocked(null);
    const ext = heroExtOf(first.name);
    const kind = detectFileType({ type: first.type, name: first.name });
    setTypeWarn(heroTypeWarning(first.type, ext));
    setFiles(arr);
    // Homepage tabs double as the default intent: picking Convert then
    // dropping a PNG preselects Convert. Set once at drop (event handler,
    // never an effect) so an explicit chip choice always sticks.
    setSelectedId(arr.length > 1
      ? heroBulkIntentsFor(kind)[0]!.id
      : heroDefaultIntentId(kind, ext, activeTab));
  }, [planCapMB, activeTab]);

  const first = files[0] ?? null;
  const multi = files.length > 1;
  const fileType: HeroFileType | null = first ? detectFileType({ type: first.type, name: first.name }) : null;
  const ext = first ? heroExtOf(first.name) : '';
  const intents: HeroIntent[] = fileType
    ? (multi ? heroBulkIntentsFor(fileType) : heroIntentsFor(fileType, ext))
    : [];
  const selected: HeroIntent | null = intents.find((i) => i.id === selectedId) ?? intents[0] ?? null;

  const sizeState = first ? heroSizeState(first.size, planCapMB) : 'ok';
  const overCap = sizeState === 'over-cap';
  const quotaOut = !!quota?.signedIn && quota.remaining <= 0;
  const gated = overCap || quotaOut;

  const clearAll = useCallback(() => {
    setFiles([]);
    setSelectedId(null);
    setBlocked(null);
    setTypeWarn(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const go = useCallback(async (intent: HeroIntent) => {
    if (gated || !first || carrying) return;
    setCarrying(true);
    try {
      // Single files ride along via IndexedDB (same browser, never uploaded)
      // so the destination opens with the file loaded — no second upload.
      // Multi-file batches travel light: bulk tools take folders themselves.
      if (!multi) await stashHeroFile(first);
      const url = intent.params ? `${intent.route}?${intent.params}` : intent.route;
      router.push(url);
    } finally {
      setCarrying(false);
    }
  }, [gated, first, multi, carrying, router]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const fileTypeIcon = (fileType: HeroFileType) => {
    switch (fileType) {
      case 'image': return <FileImage className="w-5 h-5 text-[var(--accent)]" />;
      case 'video': return <Video className="w-5 h-5 text-[var(--accent)]" />;
      case 'audio': return <Music className="w-5 h-5 text-[var(--accent)]" />;
      case 'pdf': return <FileText className="w-5 h-5 text-[var(--accent)]" />;
      default: return <FileIcon className="w-5 h-5 text-[var(--accent)]" />;
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current = 0;
    setDragOver(false);
    takeFiles(e.dataTransfer.files);
  }, [takeFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    takeFiles(e.target.files);
    // Reset so the same file can be picked twice in a row.
    e.target.value = '';
  }, [takeFiles]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    // Screenshots and copied files land straight in the box.
    if (e.clipboardData.files.length > 0) takeFiles(e.clipboardData.files);
  }, [takeFiles]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  }, []);

  const formatBadges = [
    { label: 'IMG', exts: 'JPG, PNG, WebP' },
    { label: 'VID', exts: 'MP4, WebM' },
    { label: 'PDF', exts: 'PDF docs' },
    { label: 'DOC', exts: 'DOC, XLS, CSV' },
    { label: 'AUD', exts: 'MP3, WAV, FLAC' },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-4">
        <p className="text-sm font-semibold text-[var(--text-primary)]">What are you working with?</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">We detect the format and open the right tool</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); }}
        onDragEnter={(e) => { e.preventDefault(); dragDepth.current += 1; setDragOver(true); }}
        onDragLeave={() => { dragDepth.current = Math.max(0, dragDepth.current - 1); if (dragDepth.current === 0) setDragOver(false); }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        tabIndex={0}
        role="button"
        aria-label="Drop a file here, paste from clipboard, or click to browse"
        className={`max-h-[320px] flex-1 min-h-[180px] border-2 border-dashed rounded-[var(--radius-xl)] flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 ${
          dragOver
            ? 'border-[var(--accent)] bg-[var(--accent-ink)]/5 scale-[1.01]'
            : first
              ? 'border-[var(--accent)]/40 bg-[var(--accent-soft)]'
              : 'border-[var(--border-subtle)] bg-[var(--bg-overlay)] hover:border-[var(--accent-hover)] hover:bg-[var(--accent-soft)]'
        }`}
      >
        <input ref={fileInputRef} id="hero-file-input" type="file" className="hidden" onChange={handleInputChange} aria-hidden="true" tabIndex={-1} />
        {blocked ? (
          <div role="alert" className="flex flex-col items-center gap-2 p-4 text-center max-w-[260px]">
            <p className="text-sm font-medium text-[var(--text-primary)]">Can't take this file</p>
            <p className="text-xs text-[var(--text-secondary)]">{blocked}</p>
          </div>
        ) : first && fileType ? (
          <div role="status" className="flex flex-col items-center gap-2 p-4 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center animate-scale-in">
              {fileTypeIcon(fileType)}
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[200px]">
              {multi ? `${files.length} files · ${first.name}` : first.name}
            </p>
            <p className={`text-xs mt-0.5 ${overCap ? "text-amber-600 dark:text-amber-400 font-medium" : "text-[var(--text-muted)]"}`}>
              {multi ? `${files.length} files` : formatSize(first.size)} &middot; {fileType.toUpperCase()} &middot; limit {planCapMB}MB
            </p>
            {typeWarn && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 max-w-[240px] text-center">{typeWarn}</p>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); clearAll(); }}
              className="mt-1 px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg hover:border-[var(--accent)]/30 transition-all duration-200 min-h-[32px]"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center group-hover:border-[var(--accent)]/30 group-hover:bg-[var(--accent-ink)]/5 transition-all">
              <Upload className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--text-primary)]">Drop your file here</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">or <span className="text-[var(--accent)] underline">browse</span></p>
            </div>
          </>
        )}
      </div>

      {/* Intent chips: WHAT the file is -> WHY the user came. Reserved height
          so the box doesn't jump when they appear. */}
      <div className="min-h-[76px] mt-3" aria-live="polite">
        {first && fileType && !blocked && (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] text-[var(--text-muted)]">
              {multi
                ? `${files.length} files detected — bulk tools take the whole batch:`
                : `Detected ${ext ? ext.toUpperCase() + ' ' : ''}${fileType} — what should happen?`}
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Choose what to do with this file">
              {intents.map((intent) => {
                const active = selected?.id === intent.id;
                return (
                  <button
                    key={intent.id}
                    onClick={(e) => { e.stopPropagation(); if (active) go(intent); else setSelectedId(intent.id); }}
                    disabled={gated || carrying}
                    aria-pressed={active}
                    title={intent.note ?? intent.tool}
                    className={`px-3 py-2 rounded-xl border text-left transition-all min-h-[44px] ${
                      active
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40'
                    } ${(gated || carrying) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className="block text-xs font-semibold">{intent.label}</span>
                    <span className="block text-[10px] opacity-70">{intent.tool}{intent.note ? ` · ${intent.note}` : ''}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {/* State gate BEFORE effort: over-cap or quota-out disables every chip
            and says exactly how to proceed. Never a post-work wall. */}
        {first && gated && !blocked && (
          <div role="alert" className="mt-2 p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-[11px] text-[var(--text-secondary)]">
            {overCap ? (
              <>Too big for your {planCapMB}MB limit — <Link href="/sign-in" className="text-[var(--accent)] underline underline-offset-2">sign in free for 150MB</Link> or <Link href="/pricing" className="text-[var(--accent)] underline underline-offset-2">go Pro (2GB)</Link>.</>
            ) : (
              <>Daily limit reached — resets tomorrow · <Link href="/pricing" className="text-[var(--accent)] underline underline-offset-2">View Pro</Link>.</>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {formatBadges.map((b) => (
          <span key={b.label} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[10px] font-mono text-[var(--text-muted)]">
            {b.label} <span className="hidden sm:inline text-[9px] opacity-60">{b.exts}</span>
          </span>
        ))}
      </div>

      <details className="mt-3 group/guide">
        <summary className="text-[11px] text-[var(--text-muted)] hover:text-[var(--accent)] cursor-pointer transition-colors list-none flex items-center gap-1.5 min-h-[32px]">
          <span aria-hidden="true" className="inline-block transition-transform group-open/guide:rotate-90">▸</span>
          What can you drop here?
        </summary>
        <div className="mt-1 p-3 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] leading-relaxed">
          <p><strong className="text-[var(--text-primary)]">Images</strong> (JPG, PNG, WebP, HEIC, AVIF…) → compress, convert, resize, remove background</p>
          <p className="mt-1"><strong className="text-[var(--text-primary)]">PDFs</strong> → compress, merge, split</p>
          <p className="mt-1"><strong className="text-[var(--text-primary)]">Video / audio</strong> → compress, convert, extract MP3</p>
          <p className="mt-1"><strong className="text-[var(--text-primary)]">Documents</strong> (DOCX, ODT, EPUB…) → convert · <strong className="text-[var(--text-primary)]">Spreadsheets</strong> (XLS, XLSX, CSV) → to JSON · <strong className="text-[var(--text-primary)]">Text</strong> (.txt, .md, .json) → count, format</p>
          <p className="mt-1"><strong className="text-[var(--text-primary)]">PPT decks</strong> aren&apos;t supported yet — they land on the tool directory.</p>
          <p className="mt-2 text-[var(--text-muted)]">Limits: {planCapMB}MB on your plan · files stay in this browser · executables refused · several files open the bulk tools.</p>
        </div>
      </details>

      <div className="mt-4 flex items-center justify-between bg-[var(--bg-overlay)] p-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[var(--success)]" />
          <span className="text-[10px] text-[var(--text-muted)]">Your file is only inspected in this browser</span>
        </div>
        <div className="flex items-center gap-3">
          {first && selected && !blocked ? (
            <Button size="sm" onClick={() => go(selected)} disabled={gated || carrying}>
              {carrying ? 'Loading…' : <>Open {selected.tool} <MoveRight className="w-3 h-3 ml-1" /></>}
            </Button>
          ) : (
            <Link
              href="/tools"
              className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            >
              Browse by category <MoveRight className="w-3 h-3 inline" />
            </Link>
          )}
        </div>
      </div>

      {/* Quota-aware status line (local counters; server enforces at save). */}
      {quota && (
        <p className="mt-2 text-center text-[10px] text-[var(--text-muted)]" role="status">
          {!quota.signedIn ? (
            <>3 free downloads/day · <Link href="/sign-in" className="text-[var(--accent)] underline underline-offset-2 hover:no-underline">Sign in for 5/day + AI credits</Link></>
          ) : quota.remaining > 0 ? (
            <>{quota.remaining} free {quota.remaining === 1 ? "download" : "downloads"} left today</>
          ) : (
            <>Daily limit reached — resets tomorrow · <Link href="/pricing" className="text-[var(--accent)] underline underline-offset-2 hover:no-underline">View Pro</Link></>
          )}
        </p>
      )}
    </div>
  );
}

function SocialProofTicker() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    try {
      const val = parseInt(localStorage.getItem('toolzum:processedCount') || '0', 10);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate processed-count badge from localStorage on mount
      setCount(val);
    } catch {}
  }, []);

  if (count === 0) return null;

  return (
    <p className="text-sm text-[var(--text-secondary)]">
      <span className="font-mono font-semibold text-[var(--accent)]">{count.toLocaleString()}</span> files processed in your browser
    </p>
  );
}
