"use client";

import React, { useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Command, ArrowRight, ShieldCheck, Zap, Sparkles, ChevronRight, Play,
  Check, MoveRight, Crown, Users, Layers, Star, Upload, FileText,
  Building2
} from 'lucide-react';
import { toolsRegistry } from '@/registry/tools';
import { Button } from '@/components/ui/button';
import { getCategoryTheme } from '@/lib/categoryTheme';
import {
  CATEGORIES, STEPS, FEATURES, USE_CASES, INDIA_TOOLS,
  getWhyChoose, getStatsBar
} from '@/data/homepage';

const toolCount = toolsRegistry.length;
const WHY_CHOOSE = getWhyChoose(toolCount);
const STATS_BAR = getStatsBar(toolCount);

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

export function HomeClient({ isIndia = false }: { isIndia?: boolean }) {
  const [activeTab, setActiveTab] = useState("compress");
  const [showIndia, setShowIndia] = useState(isIndia);

  React.useEffect(() => {
    if (isIndia) {
      setShowIndia(true);
    } else {
      const cookies = document.cookie.split(';');
      const countryCookie = cookies.find(c => c.trim().startsWith('user-country='));
      const country = countryCookie ? countryCookie.split('=')[1] : null;
      const isIndiaTZ = Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Kolkata';
      if (country === 'IN' || isIndiaTZ) {
        setShowIndia(true);
      }
    }
  }, [isIndia]);

  const popularTools = useMemo(() => {
    const featuredSlugs = ['pdf-compressor', 'image-compressor', 'background-remover', 'qr-code-generator', 'gst-calculator', 'word-counter',
      'ai-image-generator', 'video-compressor', 'text-to-speech-tts',
    ];
    const tools = featuredSlugs.map(slug => toolsRegistry.find(t => t.slug === slug)).filter(Boolean) as typeof toolsRegistry;
    if (tools.length < 9) {
      const remaining = 9 - tools.length;
      const additional = toolsRegistry.filter(t => !featuredSlugs.includes(t.slug)).slice(0, remaining);
      return [...tools, ...additional];
    }
    return tools;
  }, []);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden">

      {/* ===== 1. HERO ===== */}
      <section ref={heroRef} className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
        <motion.div style={{ y: heroY }} className="absolute top-[-20%] left-[10%] w-[80%] h-[60%] rounded-full bg-[var(--accent)]/8 blur-[140px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] mb-8"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{toolCount} tools &middot; zero uploads &middot; free to use</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-[family-name:var(--font-serif)] text-6xl sm:text-7xl lg:text-[84px] leading-[0.95] tracking-tight mb-8"
            >
              The browser<br />
              <span className="bg-gradient-to-r from-[var(--accent)] to-purple-400 bg-clip-text text-transparent">supercomputer.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-md mb-10 leading-relaxed"
            >
              {toolCount}+ tools — PDF, image, video, AI — that run entirely in your browser.
              Nothing uploaded. Nothing stored. Just instant, private utility.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <Button size="lg" className="w-full sm:w-auto whitespace-nowrap shadow-[var(--shadow-glow-accent)]" asChild>
                <Link href="/tools">
                  Explore All Tools
                  <ArrowRight className="w-4 h-4 ml-2" />
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
              className="flex flex-wrap gap-6 sm:gap-10 mt-16 pt-8 border-t border-[var(--border-subtle)] w-full"
            >
              <div className="flex flex-col">
                <span className="font-mono text-2xl text-[var(--text-primary)] font-semibold">{toolCount}+</span>
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Browser Tools</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-2xl text-[var(--success)] font-semibold">100%</span>
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Client-Side</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-2xl text-[var(--text-primary)] font-semibold">0</span>
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider mt-1">Server Uploads</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-2xl text-[var(--warning)] font-semibold">24/7</span>
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
            <div className="w-full max-w-[500px] aspect-[4/5] bg-[var(--bg-elevated)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] shadow-[var(--shadow-lg)] overflow-hidden flex flex-col relative">
              <div className="h-12 border-b border-[var(--border-subtle)] flex items-center px-4 gap-2 bg-[var(--bg-overlay)]">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                <span className="ml-4 text-[11px] text-[var(--text-muted)] font-mono">toolhub — browser-supercomputer</span>
              </div>

              <div className="flex-1 p-6 flex flex-col">
                <div className="flex gap-4 mb-8">
                  {['compress', 'resize', 'convert'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-sm font-medium capitalize pb-2 border-b-2 transition-colors ${
                        activeTab === tab ? 'border-[var(--accent)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <FileDropZone activeTab={activeTab} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== 2. HOW IT WORKS ===== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--accent)] mb-6">
            <Zap className="w-3.5 h-3.5" /> How It Works
          </span>
          <h2 className="font-[family-name:var(--font-serif)] text-4xl sm:text-5xl text-[var(--text-primary)] mb-4">
            Three clicks. Zero servers.
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
            No accounts, no upload queues, no privacy trade-offs.
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
              className="relative bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-8 hover:border-[var(--accent)]/30 hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.06)] transition-all duration-500 group"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[40px] font-mono font-bold text-[var(--text-muted)] leading-none group-hover:text-[var(--accent)] transition-colors">{step.num}</span>
                <div className="h-px flex-1 bg-[var(--border-subtle)] group-hover:bg-[var(--accent)]/30 transition-colors" />
              </div>
              <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex items-center justify-center mb-5 group-hover:bg-[var(--accent)]/10 group-hover:border-[var(--accent)]/30 transition-all">
                <step.icon className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
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
              <div key={i} className="py-12 px-8 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center mb-6 text-[var(--text-primary)] transition-all group-hover:bg-[var(--accent)]/10 group-hover:border-[var(--accent)]/30">
                  <feat.icon className="w-5 h-5" />
                </div>
                <h3 className="text-[18px] font-medium text-[var(--text-primary)] mb-3">{feat.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4. CATEGORY SHOWCASE ===== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto border-t border-[var(--border-subtle)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--accent)] mb-6">
            <Layers className="w-3.5 h-3.5" /> Everything You Need
          </span>
          <h2 className="font-[family-name:var(--font-serif)] text-4xl sm:text-5xl text-[var(--text-primary)] mb-4">
            {toolCount} tools, 25 categories
          </h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
            From PDF wrangling to AI generation — one platform does it all.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => {
            const count = toolsRegistry.filter(t => t.category === cat.label || t.category === cat.id).length;
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
                  className="group flex flex-col items-start p-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] hover:border-[var(--accent)]/30 hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.06)] transition-all duration-300 h-full"
                >
                  <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex items-center justify-center mb-4 group-hover:bg-[var(--accent)]/10 group-hover:border-[var(--accent)]/30 transition-all">
                    <cat.icon className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
                  </div>
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
              <span className="text-lg font-semibold mb-1">+{toolCount - CATEGORIES.reduce((s, c) => s + toolsRegistry.filter(t => t.category === c.label || t.category === c.id).length, 0)} tools</span>
              <span className="text-xs text-[var(--text-muted)]">&amp; More categories</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== 5. USE CASES ===== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto border-t border-[var(--border-subtle)] bg-[var(--bg-overlay)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--accent)] mb-6">
            <Users className="w-3.5 h-3.5" /> Built for Everyone
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

      {/* ===== 6. WHY TOOLHUB ===== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--accent)] mb-6">
            <Star className="w-3.5 h-3.5" /> Why ToolHub
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
              <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex items-center justify-center mb-4 group-hover:bg-[var(--accent)]/10 group-hover:border-[var(--accent)]/30 transition-all">
                <item.icon className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">{item.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== 7. POPULAR TOOLS ===== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto border-t border-[var(--border-subtle)]">
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
                          <span className="text-[10px] font-mono text-blue-500 uppercase tracking-wider bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded">
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--accent)] uppercase tracking-wider mb-4">
            <Crown className="w-3.5 h-3.5" /> Pro
          </span>
          <h2 className="font-[family-name:var(--font-serif)] text-4xl text-[var(--text-primary)] mb-3">
            Free today. Pro when you need more.
          </h2>
          <p className="text-[var(--text-secondary)] max-w-lg mx-auto">
            All tools run in your browser completely free.{' '}
            Upgrade when you hit a limit — bulk processing, larger files, and AI extras.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
          <div className="p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)]">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Free</span>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mb-4">$0</div>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Single file processing</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Basic file size limits (20-100MB)</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Unlimited client-side tools (PDF, images, video)</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>100% local processing</span></li>
              <li className="flex items-start gap-2 text-[var(--text-muted)]"><span className="w-4 mt-0.5 shrink-0 text-center">—</span><span>Bulk batch processing</span></li>
              <li className="flex items-start gap-2 text-[var(--text-muted)]"><span className="w-4 mt-0.5 shrink-0 text-center">—</span><span>AI generation & extraction</span></li>
            </ul>
          </div>
          <div className="p-6 bg-[var(--accent)]/5 border-2 border-[var(--accent)] rounded-[var(--radius-xl)] relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[var(--accent)] text-white text-[10px] font-mono uppercase tracking-wider rounded-full">Popular</div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-mono text-amber-500 uppercase tracking-wider">Pro</span>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">{showIndia ? '₹249' : '$14.99'}</div>
            <div className="text-xs text-[var(--text-muted)] mb-4">/{showIndia ? 'mo' : 'month'}, cancel anytime</div>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Batch up to 500 files at once</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>No file size limits</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Unlimited monthly uses</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>100% local processing</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Bulk batch processing</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>AI generation & extraction</span></li>
            </ul>
          </div>
          <div className="p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)]">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Team</span>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mb-4">Contact</div>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>All Pro features</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Dedicated onboarding</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Priority feature requests</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>SSO & audit logging</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>Custom SLA</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>API access</span></li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
          >
            See full pricing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ===== 8. STATS BAR ===== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto border-t border-[var(--border-subtle)] bg-[var(--bg-overlay)]">
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
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF6B35]/50 to-transparent" />
          <div className="absolute top-0 inset-x-0 h-[100px] bg-gradient-to-b from-[#FF6B35]/[0.03] to-transparent pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-col items-center text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B35]/10 border border-[#FF6B35]/20 text-xs font-mono text-[#FF6B35] mb-6">
              🇮🇳 Made for India
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

      {/* ===== 10. FINAL CTA ===== */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto border-t border-[var(--border-subtle)]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[60%] h-[80%] rounded-full bg-[var(--accent)]/5 blur-[100px]" />
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
            {toolCount}+ tools. Free to use. Pro plan for unlimited access.
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
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }, []);

  const getExportUrl = () => {
    switch (activeTab) {
      case 'compress': return '/image/image-compressor';
      case 'resize': return '/image/image-resizer';
      default: return '/image/image-compressor';
    }
  };

  const getToolName = () => {
    switch (activeTab) {
      case 'compress': return 'Image Compressor';
      case 'resize': return 'Image Resizer';
      default: return 'Image Compressor';
    }
  };

  return (
    <>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('hero-file-input')?.click()}
        className={`flex-1 border-2 border-dashed rounded-[var(--radius-xl)] flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer group ${
          dragOver
            ? 'border-[var(--accent)] bg-[var(--accent)]/5'
            : 'border-[var(--border-subtle)] bg-[var(--bg-overlay)] hover:border-[var(--accent-hover)] hover:bg-[var(--accent-soft)]'
        }`}
      >
        <input id="hero-file-input" type="file" className="hidden" onChange={handleInputChange} />
        {file ? (
          <div className="flex flex-col items-center gap-2 p-4">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[200px]">{file.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{formatSize(file.size)}</p>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="text-[10px] text-[var(--text-muted)] underline hover:text-[var(--text-secondary)]"
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center group-hover:border-[var(--accent)]/30 group-hover:bg-[var(--accent)]/5 transition-all">
              <Upload className="w-6 h-6 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-[var(--text-primary)]">Drop file here</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">100% client-side processing</p>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex justify-between items-center bg-[var(--bg-overlay)] p-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
        <div className="flex flex-col">
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
            {file ? `File size` : 'Output Size'}
          </span>
          <span className="text-sm font-mono text-[var(--success)]">
            {file ? formatSize(file.size) : '-74% smaller'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={getExportUrl()}
            className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            Full: {getToolName()} <MoveRight className="w-3 h-3 inline" />
          </Link>
          <Button size="sm" asChild>
            <Link href={getExportUrl()}>Export</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
