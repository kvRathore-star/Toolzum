"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Clipboard } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

function CopyBtn({ text, label }: { text: string; label?: string }) {
  return (
    <button onClick={() => { clipboardWrite(text); toast.success(label ? `${label} copied!` : 'Copied!'); }}
      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"><Clipboard className="w-3 h-3" /> Copy</button>
  );
}

function LinkCard({ title, href, desc }: { title: string; href: string; desc: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
      <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{title}</h5>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{desc}</p>
      <a href={href} className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all text-center">Open →</a>
    </div>
  );
}

export default function SerializationKit() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LinkCard title="TSV ↔ CSV Converter" href="/tools/tsv-csv-converter" desc="Bidirectional TSV to CSV conversion" />
        <LinkCard title="YAML ↔ JSON Converter" href="/tools/yaml-json-converter" desc="Bidirectional YAML to JSON conversion" />
        <LinkCard title="JSON → Toon Converter" href="/tools/json-toon-converter" desc="Convert JSON to human-readable Toon format" />
        <LinkCard title="YAML Validator" href="/tools/yaml-validator" desc="Validate YAML formatting, convert to JSON, minify" />
        <LinkCard title="JSON ↔ TOML Converter" href="/tools/toml-converter" desc="Bidirectional JSON to TOML conversion" />
      </div>
    </div>
  );
}
