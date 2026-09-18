"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { inputClass, labelClass, btnClass, cardClass, headingClass, resultClass } from './ApiTools.shared';
import { clipboardWrite } from "@/lib/clipboard";


export function GraphqlCostEstimator() {
  const [query, setQuery] = useState('{ users { id name posts { title } } }');
  const [result, setResult] = useState<{ fields: number; depth: number; complexity: number } | null>(null);
  const presets = [
    { label: 'Simple Query', q: '{ users { id name } }' },
    { label: 'Nested Query', q: '{ users { id name posts { title comments { body } } } }' },
    { label: 'Deep Nesting', q: '{ users { posts { comments { author { profile { bio } } } } } }' },
  ];
  const calc = () => {
    const depth = (q: string) => {
      let max = 0, cur = 0;
      for (const c of q) { if (c === '{') cur++; else if (c === '}') { max = Math.max(max, cur); cur--; } }
      return max;
    };
    const fields = query.match(/\b[a-zA-Z_]\w*\b/g)?.length || 0;
    const d = depth(query);
    setResult({ fields, depth: d, complexity: fields * Math.pow(2, d) });
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">GraphQL Cost Estimator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setQuery(p.q); setResult(null); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-pink-400 text-[var(--text-secondary)] hover:text-pink-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div>
          <label htmlFor="lbl-apigraphqltools-query" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Query</label>
          <textarea id="lbl-apigraphqltools-query" aria-label="Query" value={query} onChange={e => { setQuery(e.target.value); setResult(null); }} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Estimate Cost</button>
        {result && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Fields</p>
                <p className="text-xl font-bold text-pink-500">{result.fields}</p>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Depth</p>
                <p className="text-xl font-bold text-violet-500">{result.depth}</p>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Complexity</p>
                <p className={`text-xl font-bold ${result.complexity > 1000 ? 'text-red-500' : 'text-emerald-500'}`}>{result.complexity}</p>
              </div>
            </div>
            {result.complexity > 1000 && <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300 font-medium text-center">⚠ High complexity — consider pagination or limiting depth</div>}
            {result.complexity <= 1000 && result.complexity > 0 && <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 text-xs text-emerald-700 dark:text-emerald-300 font-medium text-center">✓ Low complexity — looks good</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export function GraphqlQueryFormatter() {
  const [query, setQuery] = useState('{ users(id:1) { id name email posts { title body } } }');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'Users Query', q: '{ users(id:1) { id name email posts { title body } } }' },
    { label: 'Mutation', q: 'mutation createUser($input:UserInput!) { createUser(input:$input) { id name email } }' },
    { label: 'Subscription', q: 'subscription onUserUpdated { userUpdated { id name email } }' },
  ];
  const calc = () => {
    let indent = 0;
    const formatted = query.replace(/\s+/g, ' ').split('').reduce((acc: string[], c: string) => {
      if (c === '{' || c === '(') { acc.push(c); indent++; acc.push('\n' + '  '.repeat(indent)); }
      else if (c === '}' || c === ')') { indent--; acc.push('\n' + '  '.repeat(indent) + c); }
      else if (c === ',') acc.push(',\n' + '  '.repeat(indent));
      else acc.push(c);
      return acc;
    }, []).join('');
    setResult(formatted);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">GraphQL Query Formatter</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setQuery(p.q); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-fuchsia-400 text-[var(--text-secondary)] hover:text-fuchsia-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div>
          <label htmlFor="lbl-apigraphqltools-query-2" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Query</label>
          <textarea id="lbl-apigraphqltools-query-2" aria-label="Query" value={query} onChange={e => { setQuery(e.target.value); setResult(''); }} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Format</button>
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-48 whitespace-pre-wrap break-all">{result}</pre>
            <button onClick={() => { void clipboardWrite(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function GraphqlSchemaToJsonSchema() {
  const [schema, setSchema] = useState('type User { id: ID! name: String! email: String! age: Int posts: [Post] } type Post { id: ID! title: String! }');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'User+Post', s: 'type User { id: ID! name: String! email: String! age: Int posts: [Post] } type Post { id: ID! title: String! }' },
    { label: 'Product', s: 'type Product { id: ID! name: String! price: Float! inStock: Boolean! }' },
  ];
  const calc = () => {
    const types = schema.match(/(\w+)\s*\{([^}]+)\}/g) || [];
    const jsonSchema: Record<string, any> = { type: 'object', properties: {} };
    for (const t of types) {
      const [, name, fields] = t.match(/(\w+)\s*\{([^}]+)\}/) || [];
      if (!name) continue;
      const props: Record<string, any> = {};
      const fieldList = fields!.split(/\s+/).filter(Boolean);
      for (let i = 0; i < fieldList.length; i += 2) {
        if (!fieldList[i + 1]) continue;
        const fName = fieldList[i];
        const fType = fieldList[i + 1]!.replace('!', '').replace('[', '').replace(']', '');
        const required = fieldList[i + 1]!.includes('!');
        const mapping: Record<string, string> = { ID: 'string', String: 'string', Int: 'integer', Float: 'number', Boolean: 'boolean' };
        props[fName!] = { type: mapping[fType] || 'string' };
        if (required) props[fName!].description = 'required';
      }
      jsonSchema.properties[name.toLowerCase()] = { type: 'object', properties: props };
    }
    setResult(JSON.stringify(jsonSchema, null, 2));
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">GraphQL Schema to JSON Schema</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setSchema(p.s); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-indigo-400 text-[var(--text-secondary)] hover:text-indigo-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div>
          <label htmlFor="lbl-apigraphqltools-graphql-schema" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">GraphQL Schema</label>
          <textarea id="lbl-apigraphqltools-graphql-schema" aria-label="GraphQL Schema" value={schema} onChange={e => { setSchema(e.target.value); setResult(''); }} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Convert</button>
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-64 whitespace-pre-wrap break-all">{result}</pre>
            <button onClick={() => { void clipboardWrite(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function GraphqlSchemaValidator() {
  const [schema, setSchema] = useState('type Query { users: [User] } type User { id: ID! name: String! }');
  const [result, setResult] = useState<{ valid: boolean; issues: string[] } | null>(null);
  const presets = [
    { label: 'Valid', s: 'type Query { users: [User] } type User { id: ID! name: String! }' },
    { label: 'Missing Query', s: 'type User { id: ID! name: String! }' },
  ];
  const calc = () => {
    const issues: string[] = [];
    const types = schema.match(/\btype\s+(\w+)/g) || [];
    if (!types.length) issues.push('No type definitions found');
    if (!schema.includes('type Query')) issues.push('Missing Query type (root type)');
    // Only flag genuine type references: skip $variables and field/argument
    // names (words followed by ':' or '('), which the old check misreported
    // as "unknown types" (e.g. $id, users:, user().
    const defined = schema.match(/\btype\s+(\w+)/g)?.map(m => m.replace('type ', '')) || ['String', 'Int', 'Float', 'Boolean', 'ID'];
    const refRe = /(\w+)(?:!|\))/g;
    let rm: RegExpExecArray | null;
    const seen = new Set<string>();
    while ((rm = refRe.exec(schema)) !== null) {
      const ref = rm[1]!.replace(/[!)\]]/g, '');
      const before = schema[rm.index - 1] || '';
      const after = schema[rm.index + rm[0].length] || '';
      if (before === '$') continue; // variable usage, not a type
      if (after === ':' || after === '(') continue; // field/argument name
      if (!defined.includes(ref) && ref.length > 1 && !seen.has(ref)) {
        seen.add(ref);
        issues.push(`Reference to unknown type: ${ref}`);
      }
    }
    setResult({ valid: issues.length === 0, issues: issues.length ? issues : ['Schema appears valid'] });
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">GraphQL Schema Validator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setSchema(p.s); setResult(null); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-cyan-400 text-[var(--text-secondary)] hover:text-cyan-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div>
          <label htmlFor="lbl-apigraphqltools-schema" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Schema</label>
          <textarea id="lbl-apigraphqltools-schema" aria-label="Schema" value={schema} onChange={e => { setSchema(e.target.value); setResult(null); }} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Validate</button>
        {result && (
          <div className="space-y-2">
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${result.valid ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
              <span className="text-lg">{result.valid ? '✓' : '✗'}</span>
              {result.valid ? 'Valid Schema' : 'Issues Found'}
            </div>
            <div className="text-xs text-[var(--text-secondary)] space-y-1">
              {result.issues.map((issue, i) => (
                <p key={i} className={result.valid ? '' : 'text-red-500'}>{issue}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function GraphqlSubscriptionBuilder() {
  const [name, setName] = useState('userUpdated');
  const [payload, setPayload] = useState('id: ID!\nname: String!\nemail: String');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'User Updated', n: 'userUpdated', p: 'id: ID!\nname: String!\nemail: String' },
    { label: 'New Post', n: 'postCreated', p: 'id: ID!\ntitle: String!\nauthor: String!' },
  ];
  const calc = () => {
    const fields = payload.split('\n').filter(Boolean).map(f => `    ${f.trim()}`).join('\n');
    const sub = `subscription {\n  ${name} {\n${fields}\n  }\n}`;
    setResult(sub);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">GraphQL Subscription Builder</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setName(p.n); setPayload(p.p); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-lime-400 text-[var(--text-secondary)] hover:text-lime-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lbl-apigraphqltools-name" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Query name</label>
            <input id="lbl-apigraphqltools-name" aria-label="Query name" type="text" value={name} onChange={e => { setName(e.target.value); setResult(''); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label htmlFor="lbl-apigraphqltools-payload-fields" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Payload Fields</label>
            <textarea id="lbl-apigraphqltools-payload-fields" aria-label="Payload Fields" value={payload} onChange={e => { setPayload(e.target.value); setResult(''); }} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-lime-600 hover:bg-lime-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Build Subscription</button>
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-48 whitespace-pre-wrap break-all">{result}</pre>
            <button onClick={() => { void clipboardWrite(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function GraphqlTester() {
  const [endpoint, setEndpoint] = useState('https://countries.trevorblades.com/');
  const [query, setQuery] = useState('query { users { id name email } }');
  const [variables, setVariables] = useState('{}');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const presets = [
    { label: 'Users Query', q: 'query { users { id name email } }', v: '{}' },
    { label: 'With Variables', q: 'query ($id: ID!) { user(id: $id) { name email } }', v: '{"id": "1"}' },
  ];
  const calc = async () => {
    // Real request: POST {query, variables} to the endpoint. The old version
    // ignored any endpoint and printed a canned "John" response.
    let vars: unknown = {};
    try {
      vars = variables.trim() ? JSON.parse(variables) : {};
    } catch {
      setResult('Variables are not valid JSON.');
      return;
    }
    setSending(true);
    setResult('');
    try {
      const res = await fetch(endpoint.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: vars }),
      });
      const text = await res.text();
      let pretty = text;
      try { pretty = JSON.stringify(JSON.parse(text), null, 2); } catch { /* non-JSON body — show raw */ }
      setResult(`# Status: ${res.status} ${res.ok ? 'OK' : 'ERROR'}\n\n${pretty}`);
    } catch (e) {
      setResult(`Request failed: ${e instanceof Error ? e.message : 'network error'} (the endpoint may block browser CORS — try a CORS-enabled API).`);
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">GraphQL Tester</h2>
        <div>
          <label htmlFor="lbl-apigraphqltools-endpoint" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Endpoint URL</label>
          <input id="lbl-apigraphqltools-endpoint" aria-label="Endpoint URL" type="url" value={endpoint} onChange={e => { setEndpoint(e.target.value); setResult(''); }} placeholder="https://your-api.com/graphql" className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setQuery(p.q); setVariables(p.v); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-rose-400 text-[var(--text-secondary)] hover:text-rose-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div>
          <label htmlFor="lbl-apigraphqltools-query-7" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Query</label>
          <textarea id="lbl-apigraphqltools-query-7" aria-label="Query" value={query} onChange={e => { setQuery(e.target.value); setResult(''); }} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <div>
          <label htmlFor="lbl-apigraphqltools-variables-json" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Variables (JSON)</label>
          <textarea id="lbl-apigraphqltools-variables-json" aria-label="Variables (JSON)" value={variables} onChange={e => { setVariables(e.target.value); setResult(''); }} rows={2} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} disabled={sending} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-50">{sending ? 'Sending…' : 'Send Request'}</button>
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-64 whitespace-pre-wrap break-all">{result}</pre>
            <button onClick={() => { void clipboardWrite(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function GraphqlVariablesFormatter() {
  const [input, setInput] = useState('{"userId": 1, "name": "John", "age": 30, "email": "john@example.com"}');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const calc = () => {
    try {
      const parsed = JSON.parse(input);
      setResult(JSON.stringify(parsed, null, 2));
    } catch {
      setResult('Error: Invalid JSON');
    }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">GraphQL Variables Formatter</h2>
        <div>
          <label htmlFor="lbl-apigraphqltools-variables-json-9" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Variables JSON</label>
          <textarea id="lbl-apigraphqltools-variables-json-9" aria-label="Variables JSON" value={input} onChange={e => setInput(e.target.value)} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Format</button>
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-48 whitespace-pre-wrap break-all">{result}</pre>
            <button onClick={() => { void clipboardWrite(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
