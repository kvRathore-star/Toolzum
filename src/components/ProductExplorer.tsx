"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Image as ImageIcon, 
  Code, 
  Calculator, 
  ArrowRight,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const CATEGORIES = [
  {
    id: "pdf",
    name: "PDF & Documents",
    icon: FileText,
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    description: "Compress, merge, split, and convert PDF documents completely in-browser. Your legal and personal papers never touch our servers.",
    features: [
      "PDF to Word / Word to PDF conversions",
      "Compress PDF without losing resolution",
      "Merge multiple documents or split pages",
      "Add watermark & passwords locally"
    ],
    link: "/pdf"
  },
  {
    id: "image",
    name: "Image & Graphics",
    icon: ImageIcon,
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    description: "Remove background from photos, edit vector files, convert formats, and optimize images inside your browser window.",
    features: [
      "AI-powered local Background Remover",
      "SVG Vector Editor and Logo Designer",
      "WebP, PNG, JPG, and GIF converters",
      "Bulk image resizing and metadata cleaning"
    ],
    link: "/tools/image"
  },
  {
    id: "developer",
    name: "Developer Utilities",
    icon: Code,
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-700/10",
    borderColor: "border-emerald-500/20",
    description: "Format, minify, encode/decode, and generate dummy data using lightning-fast client-side compilers.",
    features: [
      "SQL, JSON, HTML, and CSS Formatters",
      "Base64, URL, and JWT Encoders / Decoders",
      "Git, Docker, and Cron command generators",
      "Mock API Key and Credit Card sandbox generators"
    ],
    link: "/tools/developer"
  },
  {
    id: "calculator",
    name: "Math & Calculators",
    icon: Calculator,
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    description: "Financial planners, unit converters, and advanced mathematical calculators executing math equations instantaneously.",
    features: [
      "SaaS Pricing & ROI Calculators",
      "Employee Turnover & Financial Planning",
      "Unit, Currency, and Datetime converters",
      "Statistical and algebraic helpers"
    ],
    link: "/tools/math"
  }
];

export function ProductExplorer() {
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);
  const activeCategory = CATEGORIES.find(c => c.id === activeTab) || CATEGORIES[0];

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 sm:p-12 relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-ink)]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mb-10 text-center md:text-left">
        <h2 className="text-3xl font-semibold mb-3">Interactive Explorer</h2>
        <p className="text-[var(--text-secondary)] max-w-xl">
          Select a division below to preview functionality and explore target applications.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-[var(--border-subtle)] pb-4">
        {CATEGORIES.map(category => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === category.id 
                ? "bg-[var(--accent-ink)] text-white shadow-sm" 
                : "hover:bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.name}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${activeCategory.bgColor} ${activeCategory.borderColor} ${activeCategory.color} text-xs font-mono mb-6`}>
            <activeCategory.icon className="w-3.5 h-3.5" />
            Featured Module
          </div>
          <h3 className="text-3xl font-medium mb-4">{activeCategory.name}</h3>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-8">
            {activeCategory.description}
          </p>
          
          <ul className="space-y-3 mb-8">
            {activeCategory.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-ink)]" />
                {feature}
              </li>
            ))}
          </ul>

          <Link href={activeCategory.link}>
            <Button className="gap-2">
              Launch {activeCategory.name} <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Simulated Desktop Preview Pane */}
        <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 font-mono text-xs text-[var(--text-muted)] shadow-inner">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/30" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/30" />
              <span className="w-3 h-3 rounded-full bg-green-500/30" />
            </div>
            <div className="bg-[var(--bg-base)] px-4 py-1 rounded border border-[var(--border-subtle)] text-[10px]">
              toolzum://sandbox-{activeCategory.id}
            </div>
            <Settings className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
          
          <div className="space-y-3 text-[var(--text-secondary)]">
            <div className="text-[var(--accent)] font-semibold">{"// Running local sandbox compiler..."}</div>
            <div>{"{"}</div>
            <div className="pl-4">"status": "ready",</div>
            <div className="pl-4">"environment": "client_sandbox",</div>
            <div className="pl-4">"active_category": "{activeCategory.id}",</div>
            <div className="pl-4">"processing_speed": "0.08ms",</div>
            <div className="pl-4">"features_available": [</div>
            {activeCategory.features.slice(0, 3).map((f, idx) => (
              <div key={idx} className="pl-8 text-emerald-700 dark:text-emerald-400">"{f.split(" ")[0]}...",</div>
            ))}
            <div className="pl-4">]</div>
            <div>{"}"}</div>
          </div>
        </div>
      </div>

    </div>
  );
}
