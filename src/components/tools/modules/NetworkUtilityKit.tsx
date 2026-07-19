"use client";

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function NetworkUtilityKit() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <section>
        <h2 className="text-lg font-bold mb-4">Network Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LinkCard title="Port Number Lookup" slug="port-number-lookup" desc="Look up service names for TCP/UDP port numbers — well-known, registered, and dynamic ranges." />
          <LinkCard title="User-Agent Parser" slug="user-agent-parser" desc="Parse browser, operating system, and version from any User-Agent string." />
          <LinkCard title="Query String Parser" slug="query-string-parser" desc="Parse and inspect URL query parameters as structured key-value pairs." />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">Formatters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LinkCard title="SSE Event Formatter" slug="sse-event-formatter" desc="Parse and visualize Server-Sent Events (SSE) streams into structured data." />
          <LinkCard title="Rate Limit Header Parser" slug="rate-limit-header-parser" desc="Parse X-RateLimit headers and compute usage percentage, reset times, and retry intervals." />
          <LinkCard title="Pricing Tier Builder" slug="pricing-tier-builder" desc="Build pricing tier descriptions from JSON — supports free/pro tiers, features, and user limits." />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">Crypto & Auth</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LinkCard title="SSH Key Generator" slug="ssh-key-generator" desc="Generate RSA, ECDSA, and Ed25519 SSH key pairs with proper OpenSSH format output." />
          <LinkCard title="TOTP Generator (2FA)" slug="two-factor-auth-generator" desc="Generate Time-based One-Time Passwords (TOTP) from a Base32 secret. Full 2FA solution with QR code support." />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">Time Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LinkCard title="Unix Time Converter" slug="unix-time-converter" desc="Convert Unix timestamps to human-readable dates and back. Supports multiple time zones." />
          <LinkCard title="Time Zone Converter" slug="time-zone-converter" desc="Convert time between different time zones worldwide. Handles DST and UTC offsets." />
          <LinkCard title="World Clock" slug="world-clock" desc="View current time across multiple time zones simultaneously. All major cities supported." />
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
