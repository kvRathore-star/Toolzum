"use client";
import React from 'react';
import { Code2, Braces, FileCode } from 'lucide-react';

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

export default function StyleCodeKit() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Style &amp; Code Tools</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
          CSS preprocessors, protobuf tools, and TypeScript utilities — all running locally in your browser.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Code2 className="w-3.5 h-3.5" /> CSS Preprocessors</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="SCSS to CSS Converter" slug="scss-to-css-converter" desc="Convert SCSS variables and nesting to plain CSS." icon={Code2} />
          <ToolCard name="Stylus to CSS Converter" slug="stylus-to-css-converter" desc="Convert Stylus syntax to plain CSS." icon={Code2} />
          <ToolCard name="Tailwind to CSS Converter" slug="tailwind-to-css-converter" desc="Convert Tailwind utility classes to plain CSS." icon={Code2} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Braces className="w-3.5 h-3.5" /> Protobuf</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="Proto Schema Converter" slug="proto-schema-converter" desc="Convert Protobuf to TypeScript and JSON." icon={Braces} />
          <ToolCard name="Protobuf Decoder" slug="protobuf-decoder" desc="Decode raw protobuf hex bytes to text." icon={Braces} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><FileCode className="w-3.5 h-3.5" /> TypeScript</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="tsconfig Analyzer" slug="tsconfig-analyzer" desc="Parse and describe tsconfig.json options." icon={FileCode} />
          <ToolCard name="TypeScript Formatter" slug="typescript-formatter" desc="Auto-format TypeScript with consistent indentation." icon={FileCode} />
          <ToolCard name="String Template Tester" slug="string-template-tester" desc="Test {{variable}} templates with JSON data." icon={FileCode} />
          <ToolCard name="Test Data Generator" slug="test-data-generator" desc="Generate test data from field name/type schemas." icon={FileCode} />
        </div>
      </div>
    </div>
  );
}
