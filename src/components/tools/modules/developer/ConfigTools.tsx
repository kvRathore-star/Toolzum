"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const HTTP_STATUSES: { code: number; label: string; desc: string }[] = [
  { code: 200, label: 'OK', desc: 'Standard success response' },
  { code: 201, label: 'Created', desc: 'Resource successfully created' },
  { code: 204, label: 'No Content', desc: 'Success with no response body' },
  { code: 301, label: 'Moved Permanently', desc: 'Resource moved to new URL permanently' },
  { code: 302, label: 'Found', desc: 'Temporary redirect' },
  { code: 304, label: 'Not Modified', desc: 'Use cached version' },
  { code: 400, label: 'Bad Request', desc: 'Malformed request syntax' },
  { code: 401, label: 'Unauthorized', desc: 'Authentication required' },
  { code: 403, label: 'Forbidden', desc: 'Server understood but refuses' },
  { code: 404, label: 'Not Found', desc: 'Resource does not exist' },
  { code: 405, label: 'Method Not Allowed', desc: 'HTTP method not supported' },
  { code: 408, label: 'Request Timeout', desc: 'Server timed out waiting for request' },
  { code: 429, label: 'Too Many Requests', desc: 'Rate limit exceeded' },
  { code: 500, label: 'Internal Server Error', desc: 'Generic server error' },
  { code: 502, label: 'Bad Gateway', desc: 'Invalid upstream response' },
  { code: 503, label: 'Service Unavailable', desc: 'Server temporarily overloaded' },
  { code: 504, label: 'Gateway Timeout', desc: 'Upstream did not respond in time' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] p-6 shadow-xl">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", rows }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; rows?: number;
}) {
  const cls = "w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50";
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      {rows ? (
        <textarea className={cls} rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className={cls} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

function Output({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }).catch(() => {});
  };
  return (
    <div className="mt-4">
      {label && <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>}
      <div className="relative">
        <pre className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 overflow-x-auto whitespace-pre-wrap break-all max-h-60">{value}</pre>
        <div className="absolute top-2 right-2 flex gap-1">
          <button onClick={copy} className="px-3 py-1 text-xs bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          <button onClick={() => {
            const blob = new Blob([value], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = label ? label.toLowerCase().replace(/\s+/g, '-') + '.txt' : 'output.txt';
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Downloaded!');
          }} className="px-3 py-1 text-xs bg-zinc-600 hover:bg-zinc-500 text-white rounded-lg transition-colors">Download</button>
        </div>
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function ToggleGroup({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${value === o.value ? 'bg-blue-600 text-white shadow-sm' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}>{o.label}</button>
      ))}
    </div>
  );
}

const SECURITY_HEADERS: Record<string, string> = {
  'content-security-policy': 'Security: Controls resources the browser can load',
  'strict-transport-security': 'Security: Enforces HTTPS (HSTS)',
  'x-content-type-options': 'Security: Prevents MIME sniffing',
  'x-frame-options': 'Security: Prevents clickjacking',
  'x-xss-protection': 'Security: XSS filter (legacy)',
  'referrer-policy': 'Security: Controls referrer info',
  'permissions-policy': 'Security: Controls browser features',
  'cache-control': 'Performance: Caching directive',
  'content-type': 'Format: Media type of response',
  'content-encoding': 'Format: Compression type',
  'authorization': 'Auth: Credentials/token',
  'set-cookie': 'State: Session cookie',
};

export function HttpHeaderAnalyzer() {
  const [input, setInput] = useState('Content-Type: application/json\nAccept: application/json\nAuthorization: Bearer <token>\nX-Request-ID: req-abc-123');
  const [output, setOutput] = useState('');

  const presets = [
    { label: 'REST API', apply: () => setInput('Content-Type: application/json\nAccept: application/json\nAuthorization: Bearer <token>\nX-Request-ID: req-abc-123') },
    { label: 'CORS Setup', apply: () => setInput('Access-Control-Allow-Origin: https://example.com\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\nAccess-Control-Allow-Headers: Content-Type, Authorization') },
    { label: 'Security Headers', apply: () => setInput('Content-Security-Policy: default-src \'self\'\nStrict-Transport-Security: max-age=31536000; includeSubDomains\nX-Content-Type-Options: nosniff\nX-Frame-Options: DENY') },
    { label: 'Cache Control', apply: () => setInput('Cache-Control: public, max-age=3600\nETag: "abc123"\nVary: Accept-Encoding') },
  ];

  const analyze = () => {
    const lines = input.split('\n').filter(l => l.trim());
    const results: string[] = [];
    lines.forEach((l, i) => {
      const colon = l.indexOf(':');
      if (colon < 0) { results.push('Line ' + (i + 1) + ': No colon — "' + l + '"'); return; }
      const name = l.slice(0, colon).trim().toLowerCase();
      const val = l.slice(colon + 1).trim();
      const note = SECURITY_HEADERS[name] || 'Standard header';
      const valPreview = val.length > 40 ? val.slice(0, 37) + '...' : val;
      results.push(l.slice(0, colon).trim() + ': ' + valPreview + '\n  → ' + note);
    });
    results.push('', 'Total: ' + lines.length + ' header(s)');
    setOutput(results.join('\n'));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((p) => (
          <button key={p.label} onClick={() => { setInput(p.apply.toString().match(/'([^']+)'/)?.[1] || ''); setOutput(''); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <Section title="HTTP Header Analyzer">
        <Input label="Headers (one per line)" value={input} onChange={setInput} rows={6} placeholder="header: value" />
        <button onClick={analyze} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Analyze Headers</button>
        <Output value={output} label="Analysis" />
      </Section>
    </div>
  );
}

export function HttpHeadersGenerator() {
  const [preset, setPreset] = useState('rest');
  const [headers, setHeaders] = useState<{ name: string; value: string }[]>([
    { name: 'Content-Type', value: 'application/json' },
    { name: 'Accept', value: 'application/json' },
    { name: 'Authorization', value: 'Bearer <token>' },
  ]);
  const [output, setOutput] = useState('');

  const PRESETS: Record<string, { name: string; value: string }[]> = {
    rest: [
      { name: 'Content-Type', value: 'application/json' },
      { name: 'Accept', value: 'application/json' },
      { name: 'Authorization', value: 'Bearer <token>' },
      { name: 'X-Request-ID', value: 'req-abc-123' },
    ],
    graphql: [
      { name: 'Content-Type', value: 'application/json' },
      { name: 'Accept', value: 'application/json' },
      { name: 'Authorization', value: 'Bearer <token>' },
    ],
    cors: [
      { name: 'Access-Control-Allow-Origin', value: 'https://example.com' },
      { name: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
      { name: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
      { name: 'Access-Control-Max-Age', value: '86400' },
    ],
    security: [
      { name: 'Content-Security-Policy', value: "default-src 'self'" },
      { name: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      { name: 'X-Content-Type-Options', value: 'nosniff' },
      { name: 'X-Frame-Options', value: 'DENY' },
      { name: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { name: 'Permissions-Policy', value: 'camera=(), microphone=()' },
    ],
  };

  const applyPreset = (key: string) => {
    setPreset(key);
    setHeaders(PRESETS[key] || []);
    setOutput('');
  };

  const addHeader = () => setHeaders([...headers, { name: '', value: '' }]);
  const removeHeader = (idx: number) => setHeaders(headers.filter((_, i) => i !== idx));
  const updateHeader = (idx: number, field: 'name' | 'value', val: string) => {
    const next = [...headers];
    next[idx] = { ...next[idx], [field]: val };
    setHeaders(next);
  };

  const generate = () => {
    const formatted = headers.filter(h => h.name.trim()).map(h => h.name + ': ' + h.value).join('\n');
    setOutput(formatted);
  };

  const copyOutput = () => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Headers copied!');
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'http-headers.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => applyPreset('rest')} className={'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ' + (preset === 'rest' ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)]')}>REST API</button>
        <button onClick={() => applyPreset('graphql')} className={'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ' + (preset === 'graphql' ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)]')}>GraphQL</button>
        <button onClick={() => applyPreset('cors')} className={'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ' + (preset === 'cors' ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)]')}>CORS</button>
        <button onClick={() => applyPreset('security')} className={'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ' + (preset === 'security' ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)]')}>Security Headers</button>
      </div>
      <Section title="HTTP Headers Generator">
        <div className="space-y-2 mb-3">
          {headers.map((h, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={h.name} onChange={e => updateHeader(i, 'name', e.target.value)} placeholder="Header name"
                className="flex-1 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono" />
              <input value={h.value} onChange={e => updateHeader(i, 'value', e.target.value)} placeholder="Value"
                className="flex-1 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono" />
              <button onClick={() => removeHeader(i)} className="text-red-500 hover:text-red-400 text-sm px-2">✕</button>
            </div>
          ))}
        </div>
        <button onClick={addHeader} className="text-sm text-blue-500 hover:text-blue-400 mb-3">+ Add Header</button>
        <button onClick={generate} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate Headers</button>
        {output && (
          <div className="mt-4">
            <div className="flex gap-2 mb-2">
              <button onClick={copyOutput} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg hover:text-[var(--text-primary)] transition-colors">Copy</button>
              <button onClick={downloadOutput} className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">Download</button>
            </div>
            <Output value={output} label="Generated Headers" />
          </div>
        )}
      </Section>
    </div>
  );
}

export function HttpCacheHeaderGenerator() {
  const [maxAge, setMaxAge] = useState('3600');
  const [scope, setScope] = useState('public');
  const [mustReval, setMustReval] = useState(false);
  const [noTrans, setNoTrans] = useState(false);
  const [output, setOutput] = useState('');

  const generate = () => {
    const dirs = ['max-age=' + (parseInt(maxAge) || 3600), scope];
    if (mustReval) dirs.push('must-revalidate');
    if (noTrans) dirs.push('no-transform');
    setOutput('Cache-Control: ' + dirs.join(', '));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <Section title="HTTP Cache Header Generator">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Max-Age (seconds)" value={maxAge} onChange={setMaxAge} placeholder="3600" />
          <Select label="Scope" value={scope} onChange={setScope} options={[
            { value: 'public', label: 'Public' }, { value: 'private', label: 'Private' }, { value: 'no-store', label: 'No Store' },
          ]} />
        </div>
        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-[var(--text-muted)] cursor-pointer">
            <input type="checkbox" checked={mustReval} onChange={e => setMustReval(e.target.checked)} className="rounded" /> must-revalidate
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-[var(--text-muted)] cursor-pointer">
            <input type="checkbox" checked={noTrans} onChange={e => setNoTrans(e.target.checked)} className="rounded" /> no-transform
          </label>
        </div>
        <button onClick={generate} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate</button>
        <Output value={output} label="Cache-Control Header" />
      </Section>
    </div>
  );
}

export function HttpStatusCodeChecker() {
  const [code, setCode] = useState('404');
  const [output, setOutput] = useState('');

  const lookup = () => {
    const found = HTTP_STATUSES.find(s => s.code === parseInt(code));
    if (found) {
      const className = ['', 'Informational', 'Success', 'Redirect', 'Client Error', 'Server Error'][Math.floor(found.code / 100)];
      setOutput(found.code + ' ' + found.label + '\n' + found.desc + '\n\nClass: ' + Math.floor(found.code / 100) + 'xx (' + className + ')');
    } else {
      setOutput('Code ' + code + ' not found in reference');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <Section title="HTTP Status Code Checker">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input label="Status Code" value={code} onChange={setCode} placeholder="404" />
          </div>
          <button onClick={lookup} className="bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all h-[42px]">Look Up</button>
        </div>
        <Output value={output} label="Status Information" />
      </Section>
      <Section title="Reference Table">
        <div className="max-h-72 overflow-y-auto space-y-1">
          {HTTP_STATUSES.map(s => (
            <div key={s.code} className="flex gap-3 text-sm py-1.5 px-2 rounded-lg hover:bg-[var(--bg-surface)]">
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 w-12 shrink-0">{s.code}</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 w-36 shrink-0">{s.label}</span>
              <span className="text-[var(--text-secondary)]">{s.desc}</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

export function EslintConfigGenerator() {
  const [category, setCategory] = useState('react');
  const [output, setOutput] = useState('');

  const CATEGORIES: Record<string, { label: string; config: object; rules: { name: string; desc: string; severity: string }[] }> = {
    react: {
      label: 'React',
      config: {
        env: { browser: true, es2021: true },
        extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:@typescript-eslint/recommended'],
        parser: '@typescript-eslint/parser',
        parserOptions: { ecmaFeatures: { jsx: true }, ecmaVersion: 'latest', sourceType: 'module' },
        plugins: ['react', '@typescript-eslint'],
        rules: { 'react/react-in-jsx-scope': 'off', 'no-unused-vars': 'warn', 'no-console': 'warn' },
      },
      rules: [
        { name: 'react/react-in-jsx-scope', desc: 'Disable — not needed with modern React JSX transform', severity: 'off' },
        { name: 'no-unused-vars', desc: 'Warn on unused variables to catch dead code', severity: 'warn' },
        { name: 'no-console', desc: 'Warn on console.log in production code', severity: 'warn' },
        { name: 'react/prop-types', desc: 'Skip — use TypeScript for type checking instead', severity: 'off' },
      ],
    },
    node: {
      label: 'Node',
      config: {
        env: { node: true, es2021: true },
        extends: ['eslint:recommended'],
        parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
        rules: { 'no-unused-vars': 'warn', 'no-console': 'off' },
      },
      rules: [
        { name: 'no-unused-vars', desc: 'Warn on unused variables', severity: 'warn' },
        { name: 'no-console', desc: 'Allow console in Node.js environment', severity: 'off' },
        { name: 'no-process-exit', desc: 'Allow process.exit() in CLI tools', severity: 'off' },
        { name: 'eqeqeq', desc: 'Require === instead of == for type safety', severity: 'error' },
      ],
    },
    typescript: {
      label: 'TypeScript',
      config: {
        env: { node: true, es2021: true },
        extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
        parser: '@typescript-eslint/parser',
        parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
        plugins: ['@typescript-eslint'],
        rules: { '@typescript-eslint/no-unused-vars': 'warn', '@typescript-eslint/explicit-function-return-type': 'off' },
      },
      rules: [
        { name: '@typescript-eslint/no-unused-vars', desc: 'Warn on unused TypeScript variables', severity: 'warn' },
        { name: '@typescript-eslint/explicit-function-return-type', desc: 'Allow implicit returns for brevity', severity: 'off' },
        { name: '@typescript-eslint/no-explicit-any', desc: 'Warn on any type usage', severity: 'warn' },
        { name: '@typescript-eslint/consistent-type-imports', desc: 'Enforce type-only imports', severity: 'off' },
      ],
    },
    next: {
      label: 'Next.js',
      config: {
        extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
        rules: { '@next/next/no-img-element': 'warn' },
      },
      rules: [
        { name: '@next/next/no-img-element', desc: 'Warn — prefer next/image for optimization', severity: 'warn' },
        { name: '@next/next/no-html-link-for-pages', desc: 'Use next/link for client-side navigation', severity: 'error' },
        { name: '@next/next/no-sync-scripts', desc: 'Avoid synchronous script loading', severity: 'error' },
        { name: 'react-hooks/exhaustive-deps', desc: 'Ensure useEffect dependencies are correct', severity: 'warn' },
      ],
    },
  };

  const current = CATEGORIES[category];

  const generate = () => {
    setOutput(JSON.stringify(current.config, null, 2));
  };

  const copyOutput = () => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Config copied!');
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.eslintrc.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded .eslintrc.json!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button key={key} onClick={() => { setCategory(key); setOutput(''); }}
            className={'px-4 py-2 text-sm font-semibold rounded-xl transition-all ' + (category === key ? 'bg-blue-600 text-white shadow-sm' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)]')}>{cat.label}</button>
        ))}
      </div>
      <Section title={'ESLint Config — ' + current.label}>
        <div className="space-y-2 mb-4">
          {current.rules.map((r) => (
            <div key={r.name} className="flex items-start gap-3 text-sm py-2 px-3 rounded-lg bg-[var(--bg-surface)]">
              <span className={'text-xs font-bold px-2 py-0.5 rounded ' + (r.severity === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : r.severity === 'warn' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300')}>{r.severity}</span>
              <div>
                <span className="font-mono text-xs text-blue-600 dark:text-blue-400">{r.name}</span>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={generate} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate ESLint Config</button>
        {output && (
          <div className="mt-4">
            <div className="flex gap-2 mb-2">
              <button onClick={copyOutput} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg hover:text-[var(--text-primary)] transition-colors">Copy</button>
              <button onClick={downloadOutput} className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">Download .eslintrc.json</button>
            </div>
            <Output value={output} label="ESLint Configuration" />
          </div>
        )}
      </Section>
    </div>
  );
}

export function HttpRetryPolicyBuilder() {
  const [policy, setPolicy] = useState('exponential');
  const [maxRetries, setMaxRetries] = useState('3');
  const [baseDelay, setBaseDelay] = useState('1000');
  const [jitter, setJitter] = useState(true);
  const [output, setOutput] = useState('');

  const POLICIES: Record<string, { label: string; defaults: Record<string, unknown> }> = {
    exponential: {
      label: 'Exponential Backoff',
      defaults: { maxRetries: 3, baseDelay: 1000, strategy: 'exponential-backoff', maxDelay: 30000, jitter: true, retryableStatuses: [408, 429, 500, 502, 503, 504] },
    },
    linear: {
      label: 'Linear Delay',
      defaults: { maxRetries: 3, delay: 1000, strategy: 'fixed-delay', retryableStatuses: [408, 429, 500, 502, 503, 504] },
    },
    circuitBreaker: {
      label: 'Circuit Breaker',
      defaults: { maxRetries: 3, baseDelay: 1000, strategy: 'circuit-breaker', failureThreshold: 5, resetTimeout: 60000, halfOpenMaxRequests: 3, retryableStatuses: [500, 502, 503, 504] },
    },
  };

  const build = () => {
    const base = POLICIES[policy].defaults;
    const retries = parseInt(maxRetries) || 3;
    const delay = parseInt(baseDelay) || 1000;
    const merged: Record<string, unknown> = { ...base, maxRetries: retries };
    if (policy === 'linear') {
      merged.delay = delay;
    } else {
      merged.baseDelay = delay;
    }
    merged.jitter = jitter;

    const configStr = JSON.stringify(merged, null, 2);

    let diagram = '';
    if (policy === 'exponential') {
      diagram = 'Retry Flow (Exponential Backoff):\n\n';
      diagram += '  Attempt 1    Attempt 2    Attempt 3    Attempt 4\n';
      diagram += '  ┌──────┐     ┌──────┐     ┌──────┐     ┌──────┐\n';
      diagram += '  │ Req  │────▶│ Req  │────▶│ Req  │────▶│ Req  │\n';
      diagram += '  └──────┘     └──┬───┘     └──┬───┘     └──────┘\n';
      diagram += '                  │ fail       │ fail\n';
      diagram += '                  ▼            ▼\n';
      diagram += '              wait ' + delay + 'ms   wait ' + (delay * 2) + 'ms\n';
      diagram += '                  │            │\n';
      diagram += '                  ▼            ▼\n';
      diagram += '              +jitter     +jitter\n';
      diagram += '\nDelays: ' + delay + 'ms → ' + (delay * 2) + 'ms → ' + (delay * 4) + 'ms' + (jitter ? ' (+random jitter)' : '') + '\n';
      diagram += 'Max total wait: ~' + ((delay * (Math.pow(2, retries) - 1)) / 1000).toFixed(1) + 's';
    } else if (policy === 'linear') {
      diagram = 'Retry Flow (Linear Delay):\n\n';
      diagram += '  Attempt 1    Attempt 2    Attempt 3\n';
      diagram += '  ┌──────┐     ┌──────┐     ┌──────┐\n';
      diagram += '  │ Req  │────▶│ Req  │────▶│ Req  │\n';
      diagram += '  └──────┘     └──┬───┘     └──┬───┘\n';
      diagram += '                  │ fail       │ fail\n';
      diagram += '                  ▼            ▼\n';
      diagram += '              wait ' + delay + 'ms   wait ' + delay + 'ms\n';
      diagram += '                  │            │\n';
      diagram += '                  ▼            ▼\n';
      diagram += '              +jitter     +jitter\n';
      diagram += '\nDelays: ' + delay + 'ms (fixed) per attempt' + (jitter ? ' (+random jitter)' : '') + '\n';
      diagram += 'Max total wait: ~' + ((delay * retries) / 1000).toFixed(1) + 's';
    } else {
      diagram = 'Retry Flow (Circuit Breaker):\n\n';
      diagram += '  CLOSED ──── failure threshold exceeded ────▶ OPEN\n';
      diagram += '    │                                            │\n';
      diagram += '    │ request OK                                  │ reject all\n';
      diagram += '    ▼                                            │\n';
      diagram += '  ┌─────────┐    reset timeout    ┌──────────┐  │\n';
      diagram += '  │ Allow   │◀────────────────────│ HALF-OPEN│◀─┘\n';
      diagram += '  │ requests│                      │ probe N  │\n';
      diagram += '  └─────────┘                      └──────────┘\n';
      diagram += '\nFailure threshold: ' + (merged as Record<string, unknown>).failureThreshold + ' consecutive failures\n';
      diagram += 'Reset timeout: ' + ((merged as Record<string, unknown>).resetTimeout as number) / 1000 + 's\n';
      diagram += 'Half-open probes: ' + (merged as Record<string, unknown>).halfOpenMaxRequests;
    }

    setOutput(configStr + '\n\n' + diagram);
  };

  const copyOutput = () => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Policy copied!');
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'retry-policy.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(POLICIES).map(([key, p]) => (
          <button key={key} onClick={() => { setPolicy(key); setOutput(''); }}
            className={'px-4 py-2 text-sm font-semibold rounded-xl transition-all ' + (policy === key ? 'bg-blue-600 text-white shadow-sm' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)]')}>{p.label}</button>
        ))}
      </div>
      <Section title="HTTP Retry Policy Builder">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Max Retries" value={maxRetries} onChange={setMaxRetries} placeholder="3" />
          <Input label="Base Delay (ms)" value={baseDelay} onChange={setBaseDelay} placeholder="1000" />
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-[var(--text-muted)] cursor-pointer mb-3">
          <input type="checkbox" checked={jitter} onChange={e => setJitter(e.target.checked)} className="rounded" /> Add random jitter to delays
        </label>
        <button onClick={build} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Build Retry Policy</button>
        {output && (
          <div className="mt-4">
            <div className="flex gap-2 mb-2">
              <button onClick={copyOutput} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg hover:text-[var(--text-primary)] transition-colors">Copy</button>
              <button onClick={downloadOutput} className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">Download</button>
            </div>
            <Output value={output} label="Retry Policy" />
          </div>
        )}
      </Section>
    </div>
  );
}
