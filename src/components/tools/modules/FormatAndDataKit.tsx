"use client";
import React from 'react';
import { FileJson, Database, Code2, BarChart3 } from 'lucide-react';

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

export default function FormatAndDataKit() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Format &amp; Data Tools</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
          Format converters, data tools, code converters, and analyzers — all running locally in your browser.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><FileJson className="w-3.5 h-3.5" /> Format Converters</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="INI to JSON Converter" slug="ini-json-converter" desc="Convert INI configs to JSON." icon={FileJson} />
          <ToolCard name="JSON \u2194 TOML" slug="toml-converter" desc="Bidirectional JSON to TOML conversion." icon={FileJson} path="/developer/toml-converter/" />
          <ToolCard name="JSON \u2194 Toon" slug="json-toon-converter" desc="Convert JSON to human-readable Toon format." icon={FileJson} path="/developer/json-toon-converter/" />
          <ToolCard name="MessagePack Inspector" slug="msgpack-inspector" desc="Simulate MessagePack encoding from JSON." icon={FileJson} />
          <ToolCard name="CBOR Inspector" slug="cbor-inspector" desc="Simulate CBOR encoding from JSON." icon={FileJson} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Database className="w-3.5 h-3.5" /> Data Tools</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="CSV Data Cleaner" slug="csv-data-cleaner" desc="Trim, dedup, lowercase emails." icon={Database} path="/utility/csv-data-cleaner/" />
          <ToolCard name="CSV Statistics" slug="csv-statistics" desc="Per-column stats: count, sum, avg." icon={Database} path="/utility/csv-statistics/" />
          <ToolCard name="Data Anonymizer" slug="data-anonymizer" desc="Anonymize emails, phones, and IPs." icon={Database} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Code2 className="w-3.5 h-3.5" /> Code Converters</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="Code \u2192 cURL Converter" slug="code-to-curl-converter" desc="Convert fetch/axios code to cURL." icon={Code2} />
          <ToolCard name="cURL \u2192 Code Converter" slug="curl-to-code-converter" desc="Convert cURL commands to fetch()." icon={Code2} />
          <ToolCard name="JSON-RPC Builder" slug="jsonrpc-builder" desc="Build JSON-RPC 2.0 request objects." icon={Code2} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><BarChart3 className="w-3.5 h-3.5" /> Analyzers</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="HAR File Analyzer" slug="har-analyzer" desc="Analyze HAR files for size, time, and URLs." icon={BarChart3} />
          <ToolCard name="Log File Analyzer" slug="log-analyzer" desc="Count log lines by level." icon={BarChart3} />
          <ToolCard name="package.json Validator" slug="package-json-validator" desc="Validate name, version, scripts, and deps." icon={BarChart3} />
          <ToolCard name="MIME Type Finder" slug="mime-finder" desc="Look up MIME types for file extensions." icon={BarChart3} />
        </div>
      </div>
    </div>
  );
}
