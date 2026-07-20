"use client";
import React from 'react';
import { Palette, Monitor, Wand2 } from 'lucide-react';

const sectionBtn = "inline-flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-default";

interface HubCard {
  name: string;
  slug: string;
  desc: string;
  icon: React.ElementType;
  path?: string;
}

function ToolCard({ name, slug, desc, icon: Icon, path }: HubCard) {
  const href = path || `/design/${slug}/`;
  return (
    <a href={href}
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

export default function ColorAndStyleKit() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Color &amp; Style Tools</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
          Color palette generators, contrast checkers, media queries, and code generators — all running locally in your browser.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Palette className="w-3.5 h-3.5" /> Color Tools</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="Color Palette Generator" slug="color-palette-generator" desc="Generate harmonious color palettes from a base color." icon={Palette} />
          <ToolCard name="Color Shades &amp; Tints" slug="color-shades-tints" desc="Generate shades and tints by varying lightness." icon={Palette} />
          <ToolCard name="Contrast Ratio Checker" slug="contrast-ratio-checker" desc="Check color contrast against WCAG AA/AAA standards." icon={Palette} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Monitor className="w-3.5 h-3.5" /> CSS &amp; Media</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="Media Query Generator" slug="media-query-generator" desc="Generate CSS media queries with width and device conditions." icon={Monitor} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Wand2 className="w-3.5 h-3.5" /> Generators</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="Conventional Commit Generator" slug="conventional-commit-generator" desc="Generate conventional commit messages with type and scope." icon={Wand2} path="/developer/conventional-commit-generator/" />
          <ToolCard name="Markdown Table Generator" slug="markdown-table-generator" desc="Generate Markdown table templates with custom dimensions." icon={Wand2} path="/developer/markdown-table-generator/" />
          <ToolCard name="Nginx Config Generator" slug="nginx-config-generator" desc="Generate Nginx server blocks from directive lists." icon={Wand2} path="/developer/nginx-config-generator/" />
          <ToolCard name="IP Allowlist Generator" slug="ip-allowlist-generator" desc="Generate Nginx allow/deny rules from CIDR ranges." icon={Wand2} path="/developer/ip-allowlist-generator/" />
        </div>
      </div>
    </div>
  );
}
