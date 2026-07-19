"use client";

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function ScannerToolkit() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <section>
        <h2 className="text-lg font-bold mb-4">Security Scanners</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LinkCard title="Secret Scanner" slug="secret-scanner" desc="Scan text and code for leaked API keys, tokens, private keys, and credentials. Detects 14+ secret patterns." />
          <LinkCard title="security.txt Generator" slug="security-txt-generator" desc="Generate a security.txt file for your website following RFC 9116 — contact, policy, encryption, and expiry." />
          <LinkCard title="robots.txt Validator" slug="robots-txt-validator" desc="Validate robots.txt syntax — check directives, disallowed paths, sitemap references, and formatting." />
          <LinkCard title="DNS Record Validator" slug="dns-record-validator" desc="Validate DNS record syntax for A, AAAA, CNAME, MX, TXT, NS, SOA, SRV, CAA, and PTR records." />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">Config Linters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LinkCard title="Docker Compose Validator" slug="docker-compose-validator" desc="Validate docker-compose.yml structure — check YAML syntax, services, keywords, and indentation." />
          <LinkCard title="Dockerfile Linter" slug="dockerfile-linter" desc="Lint Dockerfiles — validate instructions like FROM, RUN, COPY, CMD. Checks for unknown directives." />
          <LinkCard title="htaccess Validator" slug="htaccess-validator" desc="Validate .htaccess files — check RewriteRule, ErrorDocument, and 30+ Apache directives for correctness." />
          <LinkCard title="Kubernetes YAML Validator" slug="kubernetes-yaml-validator" desc="Validate Kubernetes manifest YAML — checks apiVersion, kind, metadata, and YAML structure." />
          <LinkCard title="GitHub Actions Validator" slug="github-actions-validator" desc="Validate GitHub Actions workflow YAML — checks name, on trigger, jobs, and YAML syntax." />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">Data Validators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LinkCard title="GeoJSON Validator" slug="geojson-validator" desc="Validate GeoJSON objects — checks feature, geometry, coordinates, bbox, and type correctness." />
          <LinkCard title="RSS Feed Validator" slug="rss-feed-validator" desc="Validate RSS and Atom feeds — checks root element, channel, title, link, description, and items." />
          <LinkCard title="Sitemap Validator" slug="sitemap-validator" desc="Validate XML sitemaps — checks urlset, loc entries, lastmod, priority, and XML declaration." />
          <LinkCard title="XPath Validator" slug="xpath-validator" desc="Test XPath expressions against XML/HTML — evaluate queries and see matching results in real time." />
          <LinkCard title="Cron Expression Validator" slug="cron-expression-validator" desc="Validate cron expressions — checks field format, range bounds, step values, and provides readable descriptions." />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">Also in this category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LinkCard title="Email Validator" slug="email-format-validator" desc="Validate email addresses — checks format, domain, and TLD structure." />
          <LinkCard title="Cron Expression Parser" slug="cron-parser" desc="Parse cron expressions into human-readable schedules with common presets." />
        </div>
      </section>
    </div>
  );
}

function LinkCard({ title, slug, desc }: { title: string; slug: string; desc: string }) {
  return (
    <Link href={`/tools/${slug}`} className="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-4 rounded-xl space-y-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all group">
      <div className="flex items-center gap-1">
        <h5 className="text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:underline">{title}</h5>
        <ExternalLink className="w-3.5 h-3.5 text-blue-400 shrink-0" />
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
    </Link>
  );
}
