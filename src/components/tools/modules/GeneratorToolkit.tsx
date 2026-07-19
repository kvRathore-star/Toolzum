"use client";

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

const CardLink = ({ href, title, desc }: { href: string; title: string; desc: string }) => (
  <Link href={href} className="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-4 rounded-xl space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
    <div className="flex items-center gap-1.5">
      <h5 className="text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:underline">{title}</h5>
      <ExternalLink className="w-3.5 h-3.5 text-blue-400 shrink-0" />
    </div>
    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
  </Link>
);

export default function GeneratorToolkit() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-lg font-bold mb-3">Fake Identity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <CardLink href="/developer/fake-identity-generator/" title="Fake Identity Generator" desc="Generate complete fake identities with name, email, phone, address, date of birth, occupation, and photo placeholder." />
        </div>
      </div>
      <div>
        <h2 className="text-lg font-bold mb-3">Random Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <CardLink href="/developer/random-color-generator/" title="Random Color Generator" desc="Generate random colors in Hex, RGB, or HSL format with visual preview swatches." />
          <CardLink href="/developer/random-date-generator/" title="Random Date Generator" desc="Generate random dates within a configurable range with optional format selection." />
          <CardLink href="/developer/random-time-generator/" title="Random Time Generator" desc="Generate random times in 12h or 24h format with configurable range." />
          <CardLink href="/developer/random-ip-generator/" title="Random IP Generator" desc="Generate random IPv4 and IPv6 addresses for testing and development." />
          <CardLink href="/developer/random-user-agent-generator/" title="Random User-Agent Generator" desc="Generate random browser user-agent strings from a curated list." />
        </div>
      </div>
      <div>
        <h2 className="text-lg font-bold mb-3">Text &amp; Security</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <CardLink href="/developer/lorem-ipsum-generator/" title="Lorem Ipsum Generator" desc="Generate placeholder text in multiple styles: Standard, Cicero, Legal, Startup, Coffee, and Pirate." />
          <CardLink href="/developer/random-sentence-generator/" title="Random Sentence Generator" desc="Generate random sentences from a curated word list." />
          <CardLink href="/developer/random-word-generator/" title="Random Word Generator" desc="Generate random words from a curated vocabulary list." />
          <CardLink href="/developer/pin-generator/" title="PIN Generator" desc="Generate numeric PINs of configurable length (4-10 digits)." />
          <CardLink href="/developer/license-key-generator/" title="License Key Generator" desc="Generate license keys in custom formats with configurable character sets." />
          <CardLink href="/developer/oauth-pkce-generator/" title="OAuth PKCE Generator" desc="Generate RFC 7636 OAuth PKCE code_verifier + code_challenge (S256) pairs." />
        </div>
      </div>
      <div>
        <h2 className="text-lg font-bold mb-3">Web &amp; SEO</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <CardLink href="/developer/image-placeholder-generator/" title="Image Placeholder Generator" desc="Generate SVG image placeholders as base64 data URIs for prototyping." />
          <CardLink href="/developer/logo-placeholder-generator/" title="Logo Placeholder Generator" desc="Generate brand logo placeholders as SVG with random colors and initials." />
          <CardLink href="/developer/open-graph-generator/" title="Open Graph Generator" desc="Generate Open Graph and Twitter Card meta tags for social sharing." />
          <CardLink href="/developer/seo-schema-generator/" title="SEO Schema Generator" desc="Generate JSON-LD structured data for Product, Article, FAQ, LocalBusiness, Recipe, and Event schema types." />
        </div>
      </div>
    </div>
  );
}
