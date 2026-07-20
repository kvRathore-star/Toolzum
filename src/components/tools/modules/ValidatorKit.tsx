"use client";
import React from 'react';
import { CheckCircle, FileCode, Clock } from 'lucide-react';

const sectionBtn = "inline-flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-default";

interface HubCard {
  name: string;
  slug: string;
  desc: string;
  icon: React.ElementType;
  path?: string;
}

function ToolCard({ name, slug, desc, icon: Icon, path }: HubCard) {
  const href = path || `/developer/${slug}/`;
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

export default function ValidatorKit() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Validation Tools</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
          Lint HTML, validate XML, parse cron expressions, and more — all running locally in your browser.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><CheckCircle className="w-3.5 h-3.5" /> HTML & XML</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="HTML Linter" slug="html-linter" desc="Check HTML for missing DOCTYPE, unclosed tags, and structural issues." icon={CheckCircle} />
          <ToolCard name="XML Formatter" slug="xml-formatter" desc="Format and beautify XML documents with proper indentation." icon={FileCode} />
          <ToolCard name="XML Minifier / Validator" slug="xml-minifier-validator" desc="Minify XML by removing whitespace, or validate XML syntax." icon={FileCode} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Clock className="w-3.5 h-3.5" /> Cron Tools</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="Cron Expression Parser" slug="cron-parser" desc="Parse cron expressions into human-readable descriptions with common presets." icon={Clock} />
          <ToolCard name="Cron Expression Validator" slug="cron-expression-validator" desc="Validate cron expressions with field-level range checking." icon={Clock} />
        </div>
      </div>
    </div>
  );
}
