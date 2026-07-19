"use client";
import Link from 'next/link';
import { FileText, BarChart3, Search, Hash, ExternalLink } from 'lucide-react';

const LinkCard = ({ title, slug, desc, category = "developer" }: { title: string; slug: string; desc: string; category?: string }) => (
  <Link href={`/${category}/${slug}`} className="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
    <div className="flex items-center gap-1">
      <h5 className="text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline">{title}</h5>
      <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
    </div>
    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
  </Link>
);

export default function TextSeoToolkit() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Text Tools</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <LinkCard title="Text Replacer" slug="text-replacer" desc="Find and replace text with one click." category="seo" />
          <LinkCard title="Text Cleaner" slug="text-cleaner" desc="Normalize whitespace, trim lines, clean up messy text." category="seo" />
          <LinkCard title="Text Splitter" slug="text-splitter" desc="Split text by any delimiter into numbered parts." category="seo" />
          <LinkCard title="Trailing Space Remover" slug="trailing-space-remover" desc="Remove trailing whitespace from every line." category="seo" />
          <LinkCard title="Duplicate Word Remover" slug="duplicate-word-remover" desc="Remove duplicate words, preserve first occurrence." category="seo" />
          <LinkCard title="Text Deduplicator" slug="text-deduplicator" desc="Remove duplicate lines from text." category="seo" />
          <LinkCard title="Text Sorter" slug="text-sorter" desc="Sort lines A→Z, Z→A, by length, or randomize." category="seo" />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">SEO & Meta Tools</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <LinkCard title="SEO Slug Generator" slug="seo-slug-generator" desc="Generate SEO-friendly URL slugs from text." category="seo" />
          <LinkCard title="SEO Meta Tag Generator" slug="seo-meta-tag-generator" desc="Generate meta tags, OG, Twitter Cards, canonical URL." category="seo" />
          <LinkCard title="SEO Preview Generator" slug="seo-preview-generator" desc="Preview how your page appears in Google search results." category="seo" />
          <LinkCard title="Word Counter" slug="word-counter" desc="Count words, sentences, syllables, and readability." category="seo" />
          <LinkCard title="Canonical URL Checker" slug="canonical-url-checker" desc="Validate canonical URLs for SEO best practices." category="seo" />
          <LinkCard title="Breadcrumb Schema Generator" slug="breadcrumb-schema-generator" desc="Generate JSON-LD BreadcrumbList structured data." category="seo" />
          <LinkCard title="FAQ Schema" slug="seo-schema-generator" desc="Generate FAQ, Article, Product, LocalBusiness, and more JSON-LD." category="seo" />
          <LinkCard title="UTM Builder" slug="utm-builder" desc="Build campaign tracking URLs with UTM parameters." category="seo" />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Coming Soon</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="block bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-700 p-3 rounded-xl space-y-2 opacity-60">
            <h5 className="text-[11px] font-bold text-zinc-500">Image to Color Palette</h5>
            <p className="text-[10px] text-zinc-400 leading-relaxed">Upload an image and extract its dominant color palette. Full canvas-based extraction coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
