"use client";
import Link from "next/link";
import {
  Globe, Shield, FileText, Wrench, Server, RefreshCw, Code, Sliders, CheckCircle
} from "lucide-react";

const sectionBtn = "inline-flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-default";

interface HubCard {
  name: string;
  slug: string;
  desc: string;
  icon: React.ElementType;
}

function ToolCard({ name, slug, desc, icon: Icon }: HubCard) {
  return (
    <Link
      href={`/developer/${slug}`}
      className="group flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md"
    >
      <span className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{name}</div>
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{desc}</div>
      </div>
    </Link>
  );
}

export default function ConfigToolkit() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Config Toolkit</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
          A collection of HTTP headers, CORS configuration, environment file, ESLint, and retry policy tools.
          Analyze and generate headers, configure CORS policies, parse and validate .env files,
          generate ESLint configs, and build retry policies — all running locally in your browser.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Globe className="w-3.5 h-3.5" /> HTTP Headers</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="HTTP Header Analyzer" slug="http-header-analyzer" desc="Analyze HTTP headers — detect security headers, review formatting, and inspect value structure." icon={Shield} />
          <ToolCard name="HTTP Headers Generator" slug="http-headers-generator" desc="Generate headers for JSON, REST, and GraphQL APIs with correct Content-Type and auth patterns." icon={Code} />
          <ToolCard name="HTTP Cache Header Generator" slug="http-cache-header-generator" desc="Generate Cache-Control directives with configurable max-age, scope, and flags." icon={Sliders} />
          <ToolCard name="HTTP Status Code Checker" slug="http-status-code-checker" desc="Look up HTTP status codes by number — view description, label, and response class." icon={CheckCircle} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Server className="w-3.5 h-3.5" /> CORS & Env Config</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="CORS Header Generator" slug="cors-header-generator" desc="Generate CORS headers by configuring allowed origins, methods, and headers." icon={Globe} />
          <ToolCard name="Env File Generator" slug="env-file-generator" desc="Generate .env file templates with configurable variable names and default values." icon={FileText} />
          <ToolCard name="Env File Parser" slug="env-file-parser" desc="Parse and validate .env files to detect missing variables, syntax errors, and duplicates." icon={FileText} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Wrench className="w-3.5 h-3.5" /> Dev Config</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="ESLint Config Generator" slug="eslint-config-generator" desc="Generate ESLint config presets for React, Node.js, TypeScript, and Next.js projects." icon={Code} />
          <ToolCard name="HTTP Retry Policy Builder" slug="http-retry-policy-builder" desc="Build retry policies with exponential backoff, fixed delay, or circuit breaker strategies." icon={RefreshCw} />
        </div>
      </div>
    </div>
  );
}
