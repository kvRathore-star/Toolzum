"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Globe, Wrench } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'http' | 'dev';

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

function CopyBtn({ text, label }: { text: string; label?: string }) {
  return (
    <button onClick={() => { clipboardWrite(text); toast.success(label ? `${label} copied!` : 'Copied!'); }}
      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
  );
}

export default function ConfigToolkit() {
  const [tab, setTab] = useState<Tab>('http');
  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${tab === v ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-xl w-fit">
        <TabBtn v="http" label="HTTP Headers" icon={Globe} />
        <TabBtn v="dev" label="Dev Config" icon={Wrench} />
      </div>
      {tab === 'http' && <HttpTools />}
      {tab === 'dev' && <DevTools />}
    </div>
  );
}

function HttpTools() {
  const [hdrInput, setHdrInput] = useState('content-type: application/json\nauthorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTYifQ...\ncache-control: no-cache\nx-request-id: abc-123-def');
  const [hdrOut, setHdrOut] = useState('');
  const [hdrGenType, setHdrGenType] = useState('json');
  const [hdrGenOut, setHdrGenOut] = useState('');
  const [cacheMaxAge, setCacheMaxAge] = useState('3600');
  const [cacheScope, setCacheScope] = useState('public');
  const [cacheMustReval, setCacheMustReval] = useState(false);
  const [cacheNoTrans, setCacheNoTrans] = useState(false);
  const [cacheOut, setCacheOut] = useState('');
  const [statusCode, setStatusCode] = useState('404');
  const [statusOut, setStatusOut] = useState('');

  const analyzeHeaders = () => {
    const lines = hdrInput.split('\n').filter(l => l.trim());
    const results: string[] = [];
    lines.forEach((l, i) => {
      const colon = l.indexOf(':');
      if (colon < 0) { results.push(`Line ${i + 1}: No colon — "${l}"`); return; }
      const name = l.slice(0, colon).trim().toLowerCase();
      const val = l.slice(colon + 1).trim();
      const securityHeaders: Record<string, string> = {
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
      const note = securityHeaders[name] || 'Standard header';
      const valPreview = val.length > 40 ? val.slice(0, 37) + '...' : val;
      results.push(`${l.slice(0, colon).trim()}: ${valPreview}\n  → ${note}`);
    });
    results.push('', `Total: ${lines.length} header(s)`);
    setHdrOut(results.join('\n'));
    toast.success('Headers analyzed');
  };

  const genHeaders = () => {
    const jsonHdrs = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Cache-Control': 'no-cache',
    };
    const restHdrs = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer <token>',
    };
    const gqlHdrs = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    const obj = hdrGenType === 'json' ? jsonHdrs : hdrGenType === 'rest' ? restHdrs : gqlHdrs;
    setHdrGenOut(JSON.stringify(obj, null, 2));
    toast.success(`${hdrGenType.toUpperCase()} headers generated`);
  };

  const genCacheHdrs = () => {
    const dirs = [`max-age=${parseInt(cacheMaxAge) || 3600}`, cacheScope];
    if (cacheMustReval) dirs.push('must-revalidate');
    if (cacheNoTrans) dirs.push('no-transform');
    setCacheOut(`Cache-Control: ${dirs.join(', ')}`);
    toast.success('Cache headers generated');
  };

  const checkStatus = () => {
    const found = HTTP_STATUSES.find(s => s.code === parseInt(statusCode));
    if (found) setStatusOut(`${found.code} ${found.label}\n${found.desc}\n\nClass: ${Math.floor(found.code / 100)}xx (${['', 'Informational', 'Success', 'Redirect', 'Client Error', 'Server Error'][Math.floor(found.code / 100)]})`);
    else setStatusOut(`Code ${statusCode} not found in reference`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">HTTP Header Analyzer</h5>
        <textarea value={hdrInput} onChange={e => setHdrInput(e.target.value)}
          className="w-full h-28 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="header: value" />
        <button onClick={analyzeHeaders} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Analyze Headers</button>
        {hdrOut && (
          <div className="relative">
            <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 max-h-48 overflow-y-auto text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{hdrOut}</pre>
            <div className="mt-1"><CopyBtn text={hdrOut} label="Analysis" /></div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
          <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">HTTP Headers Generator</h5>
          <div className="flex gap-2">
            {[{v:'json',l:'JSON'},{v:'rest',l:'REST'},{v:'graphql',l:'GraphQL'}].map(({v,l}) => (
              <button key={v} onClick={() => setHdrGenType(v)}
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${hdrGenType === v ? 'bg-blue-600 text-white shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>{l}</button>
            ))}
          </div>
          <button onClick={genHeaders} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate Headers</button>
          {hdrGenOut && (
            <div className="relative">
              <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{hdrGenOut}</pre>
              <div className="mt-1"><CopyBtn text={hdrGenOut} label="Headers" /></div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
          <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">HTTP Cache Header</h5>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Max-Age (seconds)</label>
              <input type="text" value={cacheMaxAge} onChange={e => setCacheMaxAge(e.target.value)} placeholder="3600"
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Scope</label>
              <select value={cacheScope} onChange={e => setCacheScope(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:border-blue-500">
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="no-store">No Store</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
              <input type="checkbox" checked={cacheMustReval} onChange={e => setCacheMustReval(e.target.checked)} className="rounded" /> must-revalidate
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
              <input type="checkbox" checked={cacheNoTrans} onChange={e => setCacheNoTrans(e.target.checked)} className="rounded" /> no-transform
            </label>
          </div>
          <button onClick={genCacheHdrs} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate</button>
          {cacheOut && (
            <div className="relative">
              <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{cacheOut}</pre>
              <div className="mt-1"><CopyBtn text={cacheOut} label="Cache headers" /></div>
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">HTTP Status Code Checker</h5>
        <div className="flex gap-3 items-end">
          <div className="space-y-1 flex-1 max-w-xs">
            <label className="text-xs font-medium text-zinc-500">Status Code</label>
            <input type="text" value={statusCode} onChange={e => setStatusCode(e.target.value)} placeholder="404"
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
          </div>
          <button onClick={checkStatus} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all h-[42px]">Look Up</button>
        </div>
        {statusOut && (
          <div className="relative">
            <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{statusOut}</pre>
            <div className="mt-1"><CopyBtn text={statusOut} label="Status info" /></div>
          </div>
        )}
      </div>
    </div>
  );
}

function DevTools() {
  const [eslintOut, setEslintOut] = useState('');
  const [eslintType, setEslintType] = useState('react');
  const [retryPolicy, setRetryPolicy] = useState('exponential');
  const [retryMax, setRetryMax] = useState('3');
  const [retryDelay, setRetryDelay] = useState('1000');
  const [retryOut, setRetryOut] = useState('');

  const genEslint = () => {
    const configs: Record<string, object> = {
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
    setEslintOut(JSON.stringify(configs[eslintType] || configs.react, null, 2));
    toast.success(`${eslintType} ESLint config generated`);
  };

  const genRetry = () => {
    const policies: Record<string, object> = {
      exponential: {
        maxRetries: parseInt(retryMax) || 3,
        baseDelay: parseInt(retryDelay) || 1000,
        strategy: 'exponential-backoff',
        maxDelay: 30000,
        jitter: true,
        retryableStatuses: [408, 429, 500, 502, 503, 504],
      },
      linear: {
        maxRetries: parseInt(retryMax) || 3,
        delay: parseInt(retryDelay) || 1000,
        strategy: 'fixed-delay',
        retryableStatuses: [408, 429, 500, 502, 503, 504],
      },
      circuitBreaker: {
        maxRetries: parseInt(retryMax) || 3,
        baseDelay: parseInt(retryDelay) || 1000,
        strategy: 'circuit-breaker',
        failureThreshold: 5,
        resetTimeout: 60000,
        halfOpenMaxRequests: 3,
        retryableStatuses: [500, 502, 503, 504],
      },
    };
    setRetryOut(JSON.stringify(policies[retryPolicy] || policies.exponential, null, 2));
    toast.success(`${retryPolicy} retry policy built`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">ESLint Config Generator</h5>
        <div className="flex flex-wrap gap-2">
          {[{v:'react',l:'React'},{v:'node',l:'Node'},{v:'typescript',l:'TypeScript'},{v:'next',l:'Next.js'}].map(({v,l}) => (
            <button key={v} onClick={() => setEslintType(v)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${eslintType === v ? 'bg-blue-600 text-white shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>{l}</button>
          ))}
        </div>
        <button onClick={genEslint} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Generate ESLint Config</button>
        {eslintOut && (
          <div className="relative">
            <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 max-h-64 overflow-y-auto text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{eslintOut}</pre>
            <div className="mt-1"><CopyBtn text={eslintOut} label="ESLint config" /></div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">HTTP Retry Policy Builder</h5>
        <div className="flex flex-wrap gap-2">
          {[{v:'exponential',l:'Exponential'},{v:'linear',l:'Linear'},{v:'circuitBreaker',l:'Circuit Breaker'}].map(({v,l}) => (
            <button key={v} onClick={() => setRetryPolicy(v)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${retryPolicy === v ? 'bg-blue-600 text-white shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>{l}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">Max Retries</label>
            <input type="text" value={retryMax} onChange={e => setRetryMax(e.target.value)} placeholder="3"
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">Delay (ms)</label>
            <input type="text" value={retryDelay} onChange={e => setRetryDelay(e.target.value)} placeholder="1000"
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
          </div>
        </div>
        <button onClick={genRetry} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Build Retry Policy</button>
        {retryOut && (
          <div className="relative">
            <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 max-h-64 overflow-y-auto text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{retryOut}</pre>
            <div className="mt-1"><CopyBtn text={retryOut} label="Retry policy" /></div>
          </div>
        )}
      </div>
    </div>
  );
}
