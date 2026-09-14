"use client";
import { useState } from 'react';

export default function OpenapiMockGenerator() {
  const [spec, setSpec] = useState('/users:\n  get:\n    responses:\n      200:\n        schema:\n          type: array\n          items:\n            type: object\n            properties:\n              id: { type: integer }\n              name: { type: string }');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  /** Type-aware mock values: every property gets a value matching its
   *  declared type (the old version returned {id:1,name:'John'} for any
   *  type, including booleans and nested objects). */
  const mockForType = (type: string, prop: string, depth: number): unknown => {
    switch (type) {
      case 'integer': return prop.toLowerCase().includes('id') ? 1 : 42;
      case 'number': return 19.99;
      case 'boolean': return true;
      case 'array': return [mockForType('object', prop, depth + 1)];
      case 'object': return depth > 2 ? {} : { id: 1 };
      default: {
        const lower = prop.toLowerCase();
        if (lower.includes('email')) return 'user@example.com';
        if (lower.includes('name')) return 'Jane Doe';
        if (lower.includes('date') || lower.includes('at')) return '2026-01-01T00:00:00Z';
        if (lower.includes('url') || lower.includes('uri')) return 'https://api.example.com/resource/1';
        if (lower === 'id') return 'abc123';
        return 'string';
      }
    }
  };

  const calc = () => {
    const lines = spec.split('\n');
    const mock: Record<string, unknown> = {};
    const props: { path: string; prop: string; type: string }[] = [];
    let currentPath = '';
    let lastProp = '';
    const RESERVED = new Set(['array', 'object', 'integer', 'number', 'boolean', 'string', 'get', 'post', 'put', 'patch', 'delete', 'responses', 'schema', 'properties', 'items', 'paths', 'info', 'openapi', 'content', 'application']);
    for (const line of lines) {
      const pathMatch = line.match(/^\s*(\/\S*):\s*$/);
      if (pathMatch?.[1]) { currentPath = pathMatch[1]; lastProp = ''; continue; }
      const keyMatch = line.match(/^\s*([A-Za-z_][\w-]*):\s*(\{.*\})?\s*$/);
      if (keyMatch && currentPath) {
        const key = keyMatch[1]!;
        const inlineType = keyMatch[2]?.match(/type:\s*(\w+)/)?.[1]?.toLowerCase();
        if (inlineType) {
          if (!RESERVED.has(key.toLowerCase())) props.push({ path: currentPath, prop: key, type: inlineType });
          lastProp = '';
        } else if (!RESERVED.has(key.toLowerCase())) {
          lastProp = key;
        } else {
          lastProp = '';
        }
        continue;
      }
      const block = line.match(/^\s*type:\s*(\w+)/);
      if (block && currentPath && lastProp) {
        props.push({ path: currentPath, prop: lastProp, type: block[1]!.toLowerCase() });
        lastProp = '';
      }
    }
    const byPath = new Map<string, Record<string, unknown>>();
    for (const p of props) {
      if (!byPath.has(p.path)) byPath.set(p.path, {});
      byPath.get(p.path)![p.prop] = mockForType(p.type, p.prop, 0);
    }
    for (const [path, obj] of byPath) {
      mock[path] = Object.keys(obj).length > 0 ? { data: [obj], total: 1 } : { data: [], total: 0 };
    }
    if (props.length === 0) {
      mock['note'] = 'No typed properties found — paste a spec with `prop: { type: X }` or `type:` lines.';
    }
    setResult(JSON.stringify(mock, null, 2));
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">OpenAPI Mock Generator</h2>
        <p className="text-xs text-[var(--text-secondary)]">Spec-driven: paste an OpenAPI YAML fragment with paths and types. For freeform JSON shapes without a spec, use the Mock API Response Generator instead.</p>
        <div>
          <label htmlFor="lbl-openapimockgenerator-openapi-spec-yaml-fragment" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">OpenAPI Spec (YAML fragment)</label>
          <textarea id="lbl-openapimockgenerator-openapi-spec-yaml-fragment" aria-label="OpenAPI Spec (YAML fragment)" value={spec} onChange={e => setSpec(e.target.value)} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Mock</button>
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-64 whitespace-pre-wrap break-all">{result}</pre>
            <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
