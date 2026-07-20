"use client";

import React from 'react';
import { Globe, GitCompare, Shuffle } from 'lucide-react';

const sectionBtn = "inline-flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-default";

interface HubCard {
  name: string;
  slug: string;
  desc: string;
  icon: React.ElementType;
}

function ToolCard({ name, slug, desc, icon: Icon }: HubCard) {
  return (
    <a href={`/developer/${slug}/`}
      className="group flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md">
      <span className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{name}</div>
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{desc}</div>
      </div>
    </a>
  );
}

export default function NetworkToolkit() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Network Tools</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
          IP address converters, range calculators, and network utilities — all running locally in your browser.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Globe className="w-3.5 h-3.5" /> IP Tools</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="IPv4 Address Converter" slug="ip-address-converter" desc="Convert IPv4 between dotted decimal, decimal, binary, and hexadecimal." icon={Globe} />
          <ToolCard name="IP Range Expander" slug="ip-range-expander" desc="Expand an IP range into individual addresses for network planning." icon={GitCompare} />
          <ToolCard name="IPv6 ULA Generator" slug="ipv6-ula-generator" desc="Generate random IPv6 Unique Local Addresses for internal networks." icon={Shuffle} />
          <ToolCard name="Subnet Calculator" slug="subnet-calculator" desc="Calculate subnet masks, CIDR notation, and broadcast addresses." icon={Globe} />
          <ToolCard name="Subnet Visualizer" slug="subnet-visualizer" desc="Visualize IP subnet divisions with a hierarchical tree view." icon={Globe} />
          <ToolCard name="IP Address Lookup" slug="ip-address-lookup" desc="Look up geolocation and ISP information for any IP address." icon={Globe} />
        </div>
      </div>
    </div>
  );
}
