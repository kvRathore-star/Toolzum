"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Lock, Shield, Zap, Upload } from 'lucide-react';
import { SEO_PERMUTATIONS, toolsRegistry } from '@/registry/tools';

const USE_CASES_BY_CATEGORY: Record<string, string[]> = {
  Image: [
    'Web developers optimizing images for faster page loads',
    'E-commerce sellers standardizing product photos for their catalog',
    'Content creators repurposing images across social media platforms',
    'Photographers preparing client deliveries with consistent formats',
  ],
  SEO: [
    'SEO agencies auditing client sites for broken or misconfigured URLs',
    'Web developers validating redirect chains after site migrations',
    'Content teams checking all links before publishing new pages',
    'Site owners monitoring for 404 errors that hurt search rankings',
  ],
  PDF: [
    'Law firms reducing document sizes for compliant email attachments',
    'Accounting departments archiving financial reports efficiently',
    'HR teams sharing policy documents with faster load times',
    'Publishing teams extracting content from PDFs for reuse',
  ],
  Audio: [
    'Podcasters preparing recordings for distribution on streaming platforms',
    'Music producers converting tracks between lossless and compressed formats',
    'Audio editors standardizing file formats for post-production workflows',
    'Voice-over artists delivering files in the format clients require',
  ],
  Video: [
    'Video editors standardizing footage formats before post-production',
    'Streaming platforms optimizing videos for bandwidth-constrained viewers',
    'Content creators preparing videos for social media uploads',
    'Media archivists converting legacy formats to modern standards',
  ],
  Privacy: [
    'Real estate agents protecting client location privacy before listing photos',
    'Photographers stripping GPS data before sharing images online',
    'Legal professionals removing hidden metadata from sensitive documents',
    'Social media managers preventing location tracking from shared content',
  ],
};

const DEFAULT_USE_CASES = [
  'Professionals processing bulk files efficiently in a single pass',
  'Teams standardizing output formats for consistent deliverables',
  'Power users automating repetitive file transformations',
  'Businesses reducing manual work with batch processing capabilities',
];

export default function BulkSeoLandingPage({ slug, category }: { slug: string; category: string }) {
  const page = SEO_PERMUTATIONS.find(p => p.slug === slug);
  const parentTool = page ? toolsRegistry.find(t => t.slug === page.parentSlug) : null;

  if (!page) return null;

  const hasFormatPair = slug.includes('-to-');
  const formatName = hasFormatPair
    ? slug.replace('bulk-', '').split('-to-').join(' → ').toUpperCase()
    : page.name.replace(/^Bulk\s+/i, '');

  const parentCategory = parentTool?.category || category;
  const useCases = USE_CASES_BY_CATEGORY[parentCategory] || DEFAULT_USE_CASES;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
          {page.name}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
          {page.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center">
          <Shield className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-semibold text-[var(--text-primary)] mb-1">100% Private</h3>
          <p className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">All processing happens in your browser. Zero uploads to any server.</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 text-center">
          <Zap className="w-10 h-10 text-blue-500 mx-auto mb-3" />
          <h3 className="font-semibold text-[var(--text-primary)] mb-1">Lightning Fast</h3>
          <p className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">WebAssembly-powered engine processes files faster than cloud uploads.</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center">
          <Upload className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="font-semibold text-[var(--text-primary)] mb-1">Batch Processing</h3>
          <p className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">Upload entire folders. Process hundreds of files simultaneously.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-2xl p-8 mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] mb-6 uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5" />
          <span>Pro Feature — Unlock Bulk Processing</span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
          {hasFormatPair ? `Ready to convert ${formatName} in bulk?` : 'Ready to process files in bulk?'}
        </h2>
        <p className="text-zinc-600 dark:text-[var(--text-muted)] mb-6 leading-relaxed">
          {hasFormatPair
            ? `This landing page covers the ${formatName} conversion workflow. Our full Pro tool handles ${page.name.replace('Bulk ', '').toLowerCase()}, multiple format pairs simultaneously, higher file limits, and folder structure preservation — all without uploading a single file to a server.`
            : `This landing page introduces the ${formatName.toLowerCase()} workflow. Our full Pro tool handles batch processing, higher limits, and advanced settings — all without uploading a single file to a server.`}
        </p>
        {parentTool && (
          <Link
            href={`/${parentTool.category.toLowerCase().replace(/\s+/g, '-')}/${parentTool.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Try the Full Pro Tool <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-[var(--border-subtle)] rounded-2xl p-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-3">Common Use Cases</h3>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-[var(--text-muted)]">
            {useCases.map((uc, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">✓</span>
                {uc}
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-[var(--border-subtle)] rounded-2xl p-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-3">Why Process Locally?</h3>
          <ul className="space-y-2 text-sm text-zinc-600 dark:text-[var(--text-muted)]">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              No file size limits — your device does the work
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              No queue waiting — processing starts instantly
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              Corporate IT policy compliant — zero data exfiltration
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              Works offline — no internet needed after page load
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center mt-12 border-t border-[var(--border-subtle)] pt-8">
        <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">
          All processing runs 100% in your browser via WebAssembly. 
          No files are uploaded, stored, or transmitted. 
          Your data never leaves your device.
        </p>
      </div>
    </div>
  );
}
