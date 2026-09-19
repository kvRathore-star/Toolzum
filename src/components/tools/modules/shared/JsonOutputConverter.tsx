"use client";

import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { getErrorMessage } from '@/utils/error';
import type { JsonValue } from '@/lib/json';


type ModeDef = {
  slug: string;
  name: string;
  description: string;
  outputLabel: string;
  transform: (data: JsonValue, input: string) => string;
};

export const MODES: Record<string, ModeDef> = {
  "json-formatter": {
    slug: "json-formatter", name: "JSON Formatter",
    description: "Pretty-print JSON with configurable indentation",
    outputLabel: "Formatted JSON",
    transform: (d, _) => JSON.stringify(d, null, 2),
  },
  "json-to-zod": {
    slug: "json-to-zod", name: "JSON → Zod Schema",
    description: "Generate Zod validation schemas from JSON",
    outputLabel: "Zod Schema",
    transform: (d) => {
      const infer = (v: JsonValue, k: string): string => {
        if (v === null) return 'z.nullable(z.any())';
        if (typeof v === 'string') return k.match(/email|mail/i) ? 'z.string().email()' : k.match(/url|href|link/i) ? 'z.string().url()' : 'z.string()';
        if (typeof v === 'number') return Number.isInteger(v) ? 'z.number().int()' : 'z.number()';
        if (typeof v === 'boolean') return 'z.boolean()';
        if (Array.isArray(v)) return v.length ? `z.array(${infer(v[0]!, k)})` : 'z.array(z.any())';
        if (typeof v === 'object') return `z.object({\n${Object.entries(v).map(([kk, vv]) => `  "${kk}": ${infer(vv, kk)}`).join(',\n')}\n})`;
        return 'z.any()';
      };
      return `import { z } from 'zod';\n\nexport const schema = z.object({\n${Object.entries(d as Record<string, JsonValue>).map(([k, v]) => `  "${k}": ${infer(v, k)}`).join(',\n')}\n});\n`;
    },
  },
  "json-to-url-params": {
    slug: "json-to-url-params", name: "JSON → URL Params",
    description: "Convert JSON object to URL query string",
    outputLabel: "Query String",
    transform: (d) => '?' + new URLSearchParams(Object.fromEntries(Object.entries(d as Record<string, JsonValue>).map(([k, v]) => [k, String(v)]))).toString(),
  },
  "json-flattener": {
    slug: "json-flattener", name: "JSON Flattener",
    description: "Flatten nested JSON to dot-notation key-value pairs",
    outputLabel: "Flattened",
    transform: (d) => {
      const flatten = (obj: JsonValue, prefix = ''): Record<string, string> =>
        Object.entries(obj as Record<string, JsonValue>).reduce((acc, [k, v]) => {
          const key = prefix ? `${prefix}.${k}` : k;
          if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(acc, flatten(v, key));
          else acc[key] = String(v);
          return acc;
        }, {} as Record<string, string>);
      return Object.entries(flatten(d)).map(([k, v]) => `${k}: ${v}`).join('\n');
    },
  },
  "json-ld-generator": {
    slug: "json-ld-generator", name: "JSON-LD Generator",
    description: "Wrap JSON in schema.org JSON-LD structure",
    outputLabel: "JSON-LD",
    transform: (d) => JSON.stringify({ "@context": "https://schema.org", "@type": "Thing", ...(d as Record<string, JsonValue>) }, null, 2),
  },
  "json-schema-generator": {
    slug: "json-schema-generator", name: "JSON Schema Generator",
    description: "Infer JSON Schema draft-07 from sample JSON",
    outputLabel: "JSON Schema",
    transform: (d) => {
      const infer = (v: JsonValue): unknown => {
        if (v === null) return { type: 'null' };
        if (typeof v === 'string') return { type: 'string' };
        if (typeof v === 'number') return { type: 'number' };
        if (typeof v === 'boolean') return { type: 'boolean' };
        if (Array.isArray(v)) return { type: 'array', items: v.length ? infer(v[0]!) : {} };
        if (typeof v === 'object') return { type: 'object', properties: Object.fromEntries(Object.entries(v).map(([k, vv]) => [k, infer(vv)])), required: Object.keys(v) };
        return {};
      };
      return JSON.stringify({ $schema: "http://json-schema.org/draft-07/schema#", ...(infer(d) as Record<string, unknown>) }, null, 2);
    },
  },
  "json-size-analyzer": {
    slug: "json-size-analyzer", name: "JSON Size Analyzer",
    description: "Analyze JSON payload size, keys, and nesting depth",
    outputLabel: "Analysis",
    transform: (d, raw) => {
      const depth = (o: JsonValue): number => o && typeof o === 'object' ? 1 + Math.max(...Object.values(o as Record<string, JsonValue>).map(v => depth(v)), 0) : 0;
      const countKeys = (o: JsonValue): number => { if (!o || typeof o !== 'object') return 0; const r = o as Record<string, JsonValue>; return Object.keys(r).reduce((s, k) => s + countKeys(r[k]!), 0) + Object.keys(r).length; };
      return [
        `Characters:  ${raw.length}`,
        `Bytes:       ${new Blob([raw]).size}`,
        `Top-level keys: ${Object.keys(d as Record<string, JsonValue>).length}`,
        `Total keys:  ${countKeys(d)}`,
        `Nesting depth: ${depth(d)}`,
        `Type:        ${Array.isArray(d) ? 'Array' : 'Object'}`,
      ].join('\n');
    },
  },
  "ndjson-to-json": {
    slug: "ndjson-to-json", name: "NDJSON → JSON Array",
    description: "Convert newline-delimited JSON to a JSON array",
    outputLabel: "JSON Array",
    transform: (_, raw) => {
      const lines = raw.trim().split('\n').filter(Boolean);
      const arr = lines.map(l => JSON.parse(l));
      return JSON.stringify(arr, null, 2);
    },
  },
  "json-formatter-tool": {
    slug: "json-formatter-tool", name: "JSON Output Tools",
    description: "Format, validate, and convert JSON to Zod schemas, URL params, flat format, JSON-LD, or analyze size",
    outputLabel: "Formatted JSON",
    transform: (d, _) => JSON.stringify(d, null, 2),
  },
};

export default function JsonOutputConverter({ slug }: { slug: string; description?: string }) {
  const mode = MODES[slug];
  const [input, setInput] = useState('{\n  "name": "Product",\n  "price": 29.99,\n  "active": true\n}');
  const [output, setOutput] = useState('');

  if (!mode) return <div className="text-red-500">Unknown JSON mode: {slug}</div>;

  const handleConvert = () => {
    try {
      const parsed = slug === 'ndjson-to-json' ? null : JSON.parse(input);
      setOutput(mode.transform(parsed, input));
    } catch (e: unknown) {
      setOutput(`Error: ${getErrorMessage(e)}`);
    }
  };

  const handleCopy = () => {
    clipboardWrite(output);
    toast.success('Copied!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">{mode.name}</h2>
        <p className="text-xs text-[var(--text-secondary)]">{mode.description}</p>
        <textarea rows={6} value={input} onChange={e => setInput(e.target.value)} aria-label="Input JSON"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] resize-y min-h-[80px]" />
        <button onClick={handleConvert}
          className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-2 rounded-lg text-sm transition-all active:scale-[0.98]">
          {slug === 'ndjson-to-json' ? 'Convert' : 'Transform'}
        </button>
        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">{mode.outputLabel}</span>
              <button onClick={handleCopy} className="text-xs text-[var(--accent)] hover:underline font-medium">Copy</button>
            </div>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-64 overflow-y-auto">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
