"use client";
import React, { useState } from 'react';

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
    <div className="w-full bg-[var(--bg-overlay)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] p-6">
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
        <button onClick={copy} className="absolute top-2 right-2 px-3 py-1 text-xs bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
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

const HEADER_TEMPLATES: Record<string, Record<string, string>> = {
  json: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'Cache-Control': 'no-cache' },
  rest: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': 'Bearer <token>' },
  graphql: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
};

const ESLINT_CONFIGS: Record<string, object> = {
  react: {
    env: { browser: true, es2021: true },
    extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    parserOptions: { ecmaFeatures: { jsx: true }, ecmaVersion: 'latest', sourceType: 'module' },
    plugins: ['react', '@typescript-eslint'],
    rules: { 'react/react-in-jsx-scope': 'off', 'no-unused-vars': 'warn', 'no-console': 'warn' },
  },
  node: {
    env: { node: true, es2021: true },
    extends: ['eslint:recommended'],
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    rules: { 'no-unused-vars': 'warn', 'no-console': 'off' },
  },
  typescript: {
    env: { node: true, es2021: true },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    plugins: ['@typescript-eslint'],
    rules: { '@typescript-eslint/no-unused-vars': 'warn', '@typescript-eslint/explicit-function-return-type': 'off' },
  },
  next: {
    extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
    rules: { '@next/next/no-img-element': 'warn' },
  },
};

const RETRY_POLICIES: Record<string, object> = {
  exponential: {
    maxRetries: 3, baseDelay: 1000, strategy: 'exponential-backoff', maxDelay: 30000, jitter: true,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
  },
  linear: {
    maxRetries: 3, delay: 1000, strategy: 'fixed-delay',
    retryableStatuses: [408, 429, 500, 502, 503, 504],
  },
  circuitBreaker: {
    maxRetries: 3, baseDelay: 1000, strategy: 'circuit-breaker', failureThreshold: 5, resetTimeout: 60000,
    halfOpenMaxRequests: 3, retryableStatuses: [500, 502, 503, 504],
  },
};

export function HttpHeaderAnalyzer() {
  const [input, setInput] = useState('content-type: application/json\nauthorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTYifQ...\ncache-control: no-cache\nx-request-id: abc-123-def');
  const [output, setOutput] = useState('');

  const analyze = () => {
    const lines = input.split('\n').filter(l => l.trim());
    const results: string[] = [];
    lines.forEach((l, i) => {
      const colon = l.indexOf(':');
      if (colon < 0) { results.push(`Line ${i + 1}: No colon — "${l}"`); return; }
      const name = l.slice(0, colon).trim().toLowerCase();
      const val = l.slice(colon + 1).trim();
      const note = SECURITY_HEADERS[name] || 'Standard header';
      const valPreview = val.length > 40 ? val.slice(0, 37) + '...' : val;
      results.push(`${l.slice(0, colon).trim()}: ${valPreview}\n  → ${note}`);
    });
    results.push('', `Total: ${lines.length} header(s)`);
    setOutput(results.join('\n'));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <Section title="HTTP Header Analyzer">
        <Input label="Headers (one per line)" value={input} onChange={setInput} rows={6} placeholder="header: value" />
        <button onClick={analyze} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Analyze Headers</button>
        <Output value={output} label="Analysis" />
      </Section>
    </div>
  );
}

export function HttpHeadersGenerator() {
  const [type, setType] = useState('json');
  const [output, setOutput] = useState('');

  const generate = () => {
    setOutput(JSON.stringify(HEADER_TEMPLATES[type] || HEADER_TEMPLATES.json, null, 2));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <Section title="HTTP Headers Generator">
        <ToggleGroup value={type} onChange={setType} options={[
          { value: 'json', label: 'JSON' }, { value: 'rest', label: 'REST' }, { value: 'graphql', label: 'GraphQL' },
        ]} />
        <button onClick={generate} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate Headers</button>
        <Output value={output} label="Generated Headers" />
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
    const dirs = [`max-age=${parseInt(maxAge) || 3600}`, scope];
    if (mustReval) dirs.push('must-revalidate');
    if (noTrans) dirs.push('no-transform');
    setOutput(`Cache-Control: ${dirs.join(', ')}`);
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
      setOutput(`${found.code} ${found.label}\n${found.desc}\n\nClass: ${Math.floor(found.code / 100)}xx (${['', 'Informational', 'Success', 'Redirect', 'Client Error', 'Server Error'][Math.floor(found.code / 100)]})`);
    } else {
      setOutput(`Code ${code} not found in reference`);
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
  const [type, setType] = useState('react');
  const [output, setOutput] = useState('');

  const generate = () => {
    setOutput(JSON.stringify(ESLINT_CONFIGS[type] || ESLINT_CONFIGS.react, null, 2));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <Section title="ESLint Config Generator">
        <ToggleGroup value={type} onChange={setType} options={[
          { value: 'react', label: 'React' }, { value: 'node', label: 'Node' },
          { value: 'typescript', label: 'TypeScript' }, { value: 'next', label: 'Next.js' },
        ]} />
        <button onClick={generate} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate ESLint Config</button>
        <Output value={output} label="ESLint Configuration" />
      </Section>
    </div>
  );
}

export function HttpRetryPolicyBuilder() {
  const [policy, setPolicy] = useState('exponential');
  const [maxRetries, setMaxRetries] = useState('3');
  const [delay, setDelay] = useState('1000');
  const [output, setOutput] = useState('');

  const build = () => {
    const base = RETRY_POLICIES[policy] || RETRY_POLICIES.exponential;
    const merged = { ...base as object, maxRetries: parseInt(maxRetries) || 3, ...(policy === 'linear' ? { delay: parseInt(delay) || 1000 } : { baseDelay: parseInt(delay) || 1000 }) };
    setOutput(JSON.stringify(merged, null, 2));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <Section title="HTTP Retry Policy Builder">
        <ToggleGroup value={policy} onChange={setPolicy} options={[
          { value: 'exponential', label: 'Exponential' }, { value: 'linear', label: 'Linear' },
          { value: 'circuitBreaker', label: 'Circuit Breaker' },
        ]} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Max Retries" value={maxRetries} onChange={setMaxRetries} placeholder="3" />
          <Input label="Delay (ms)" value={delay} onChange={setDelay} placeholder="1000" />
        </div>
        <button onClick={build} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Build Retry Policy</button>
        <Output value={output} label="Retry Policy" />
      </Section>
    </div>
  );
}
