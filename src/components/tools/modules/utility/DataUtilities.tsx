"use client";
import React from 'react';
import { LinkCard } from '@/components/tools/LinkCard';

const tools = [
  { slug: 'csv-analyzer', name: 'CSV Analyzer', description: 'Analyze CSV structure — column types, counts, unique values, and empty cells.', category: 'utility' },
  { slug: 'json-path-query-builder', name: 'JSON Path Query Builder', description: 'Query JSON data using dot-notation path expressions with wildcard support.', category: 'utility' },
  { slug: 'json-tree-viewer', name: 'JSON Tree Viewer', description: 'Visualize JSON structure as an indented tree — see nested objects and arrays at a glance.', category: 'utility' },
  { slug: 'csv-row-sorter', name: 'CSV Row Sorter', description: 'Sort CSV rows by any column ascending or descending.', category: 'utility' },
  { slug: 'csv-json-row-generator', name: 'CSV Row / JSON Generator', description: 'Generate realistic dummy CSV rows or JSON objects with configurable columns.', category: 'utility' },
  { slug: 'csv-html-table-converter', name: 'CSV ↔ HTML Table Converter', description: 'Convert CSV to HTML tables and back with live preview.', category: 'utility' },
  { slug: 'json-formatter', name: 'JSON Formatter & Minifier', description: 'Pretty-print or minify JSON with syntax validation.', category: 'developer' },
  { slug: 'json-diff-checker', name: 'JSON Diff Checker', description: 'Compare two JSON objects side-by-side with color-coded key-level differences.', category: 'developer' },
];

export default function DataUtilities() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Data Utilities</h1>
        <p className="text-[var(--text-muted)] mt-2">CSV analysis, JSON tools, and data generators — each tool opens in its own page.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(tool => (
          <LinkCard key={tool.slug} {...tool} />
        ))}
      </div>
    </div>
  );
}
