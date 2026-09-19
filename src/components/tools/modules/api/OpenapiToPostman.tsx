"use client";
import { useState } from 'react';
import { clipboardWrite } from "@/lib/clipboard";


export default function OpenapiToPostman() {
  const [spec, setSpec] = useState('openapi: 3.0.0\ninfo:\n  title: My API\n  version: 1.0.0\npaths:\n  /users:\n    get:\n      summary: List users\n      responses:\n        200:\n          description: OK');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  interface PostmanItem {
    name: string;
    request: {
      method: string;
      header: never[];
      url: { raw: string; host: string[]; path: string[]; query?: { key: string; value: string }[] };
    };
    response: never[];
  }

  /** Minimal indent-based OpenAPI path parser (no YAML dep): reads the
   *  top-level `paths:` block — path keys, HTTP methods, summary lines, and
   *  response codes — and emits real Postman v2.1 items. The old version
   *  ignored the input and always emitted a hardcoded /users collection. */
  const parsePaths = (text: string): PostmanItem[] => {
    const lines = text.split('\n');
    // Find top-level `paths:` (zero-indent).
    let pathsStart = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/^paths:\s*$/.test(lines[i]!)) { pathsStart = i; break; }
    }
    if (pathsStart < 0) return [];
    const items: PostmanItem[] = [];
    let currentPath: string | null = null;
    let currentMethod: string | null = null;
    let currentSummary = '';
    let currentResponses: string[] = [];
    const METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']);
    const flush = () => {
      if (currentPath && currentMethod) {
        const cleanPath = currentPath.startsWith('/') ? currentPath.slice(1) : currentPath;
        const segments = cleanPath.split('/').filter(Boolean).map(s => s.replace(/[{}]/g, ':'));
        items.push({
          name: currentSummary || `${currentMethod.toUpperCase()} ${currentPath}`,
          request: {
            method: currentMethod.toUpperCase(),
            header: [],
            url: {
              raw: `{{baseUrl}}/${segments.join('/')}`,
              host: ['{{baseUrl}}'],
              path: segments,
            },
          },
          response: [],
        });
      }
      currentMethod = null;
      currentSummary = '';
      currentResponses = [];
    };
    for (let i = pathsStart + 1; i <= lines.length; i++) {
      const line = lines[i] ?? '';
      const indent = (line.match(/^(\s*)/)?.[1] ?? '').length;
      const trimmed = line.trim();
      if (i === lines.length || (indent === 0 && trimmed)) break; // next top-level key
      if (!trimmed || trimmed.startsWith('#')) continue;
      if (indent === 2 && trimmed.endsWith(':')) {
        flush();
        currentPath = trimmed.slice(0, -1);
      } else if (indent === 4 && currentPath) {
        const m = trimmed.match(/^(\w+):\s*$/);
        if (m && METHODS.has(m[1]!.toLowerCase())) {
          flush();
          currentMethod = m[1]!.toLowerCase();
        }
      } else if (indent >= 6 && currentMethod) {
        const s = trimmed.match(/^summary:\s*(.+)$/);
        if (s?.[1]) currentSummary = s[1].trim();
        const r = trimmed.match(/^(\d{3}|default):\s*$/);
        if (r?.[1]) currentResponses.push(r[1]);
      }
    }
    flush();
    return items;
  };

  const calc = () => {
    setError('');
    const items = parsePaths(spec);
    if (items.length === 0) {
      setResult('');
      setError('No paths found — paste an OpenAPI 3.x spec with a top-level `paths:` block.');
      return;
    }
    const infoMatch = spec.match(/^info:\s*\n(?:.*\n)*?\s+title:\s*(.+)$/m);
    const collection = {
      info: { name: infoMatch?.[1]?.trim() || 'API Collection', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
      item: items,
      variable: [{ key: 'baseUrl', value: 'https://api.example.com', type: 'string' }],
    };
    setResult(JSON.stringify(collection, null, 2));
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">OpenAPI to Postman</h2>
        <div>
          <label htmlFor="lbl-openapitopostman-openapi-spec-yaml" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">OpenAPI Spec (YAML)</label>
          <textarea id="lbl-openapitopostman-openapi-spec-yaml" aria-label="OpenAPI Spec (YAML)" value={spec} onChange={e => setSpec(e.target.value)} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Convert</button>
        {error && (
          <p role="alert" className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl px-3 py-2">{error}</p>
        )}
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-64 whitespace-pre-wrap break-all">{result}</pre>
            <button onClick={() => { void clipboardWrite(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
