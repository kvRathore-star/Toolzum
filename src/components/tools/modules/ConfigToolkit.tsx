"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Globe, Shield, Settings, Wrench } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'http' | 'cors' | 'env' | 'dev';

export default function ConfigToolkit() {
  const [tab, setTab] = useState<Tab>('http');
  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${tab === v ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        <TabBtn v="http" label="HTTP Headers" icon={Globe} />
        <TabBtn v="cors" label="CORS & Rate Limit" icon={Shield} />
        <TabBtn v="env" label="Env & Config" icon={Settings} />
        <TabBtn v="dev" label="Dev Config" icon={Wrench} />
      </div>
      {tab === 'http' && <HttpTools />}
      {tab === 'cors' && <CorsTools />}
      {tab === 'env' && <EnvTools />}
      {tab === 'dev' && <DevTools />}
    </div>
  );
}

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
    <h5 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{title}</h5>
    {children}
  </div>
);

const CalcBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={onClick} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all active:scale-[0.98]">{label}</button>
);

const Inp = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div className="flex items-center gap-1.5">
    <label className="text-[10px] text-zinc-500 shrink-0">{label}</label>
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
  </div>
);

const Sel = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) => (
  <div className="flex items-center gap-1.5">
    <label className="text-[10px] text-zinc-500 shrink-0">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      className="flex-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-1.5 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500">
      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>
);

function Output({ value }: { value: string }) {
  if (!value) return null;
  return (
    <div className="relative">
      <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 max-h-32 overflow-y-auto text-emerald-600 dark:text-emerald-400 break-all whitespace-pre-wrap">{value}</pre>
      <button onClick={() => { clipboardWrite(value); toast.success('Copied!'); }} className="text-[10px] text-blue-500 hover:underline mt-0.5">Copy</button>
    </div>
  );
}

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
      results.push(`Line ${i + 1}: ${l.slice(0, colon).trim()}: ${valPreview}\n  → ${note}`);
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="HTTP Header Analyzer">
        <textarea value={hdrInput} onChange={e => setHdrInput(e.target.value)}
          className="w-full h-20 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="header: value" />
        <CalcBtn onClick={analyzeHeaders} label="Analyze" />
        <Output value={hdrOut} />
      </Card>
      <Card title="HTTP Headers Generator">
        <div className="flex gap-1">
          {[{v:'json',l:'JSON'},{v:'rest',l:'REST'},{v:'graphql',l:'GraphQL'}].map(({v,l}) => (
            <button key={v} onClick={() => setHdrGenType(v)}
              className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${hdrGenType === v ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>{l}</button>
          ))}
        </div>
        <CalcBtn onClick={genHeaders} label="Generate Headers" />
        <Output value={hdrGenOut} />
      </Card>
      <Card title="HTTP Cache Header Generator">
        <Inp label="Max-age" value={cacheMaxAge} onChange={setCacheMaxAge} placeholder="3600" />
        <Sel label="Scope" value={cacheScope} onChange={setCacheScope} options={[{v:'public',l:'Public'},{v:'private',l:'Private'},{v:'no-store',l:'No Store'}]} />
        <label className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <input type="checkbox" checked={cacheMustReval} onChange={e => setCacheMustReval(e.target.checked)} /> must-revalidate
        </label>
        <label className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <input type="checkbox" checked={cacheNoTrans} onChange={e => setCacheNoTrans(e.target.checked)} /> no-transform
        </label>
        <CalcBtn onClick={genCacheHdrs} label="Generate" />
        <Output value={cacheOut} />
      </Card>
      <Card title="HTTP Status Code Checker">
        <Inp label="Code" value={statusCode} onChange={setStatusCode} placeholder="404" />
        <CalcBtn onClick={checkStatus} label="Look Up" />
        <Output value={statusOut} />
      </Card>
    </div>
  );
}

function CorsTools() {
  const [corsOrigin, setCorsOrigin] = useState('https://app.example.com');
  const [corsMethods, setCorsMethods] = useState('GET, POST, PUT, DELETE');
  const [corsHeaders, setCorsHeaders] = useState('Content-Type, Authorization, X-Requested-With');
  const [corsExpose, setCorsExpose] = useState('X-Total-Count, X-RateLimit-Remaining');
  const [corsCreds, setCorsCreds] = useState(true);
  const [corsMaxAge, setCorsMaxAge] = useState('86400');
  const [corsOut, setCorsOut] = useState('');
  const [corsTestOrigin, setCorsTestOrigin] = useState('https://other-site.com');
  const [corsTestOut, setCorsTestOut] = useState('');
  const [rlHeaders, setRlHeaders] = useState('X-RateLimit-Limit: 100\nX-RateLimit-Remaining: 42\nX-RateLimit-Reset: 1700000000\nRetry-After: 120');
  const [rlOut, setRlOut] = useState('');

  const genCors = () => {
    const hdrs: string[] = [];
    if (corsOrigin === '*') hdrs.push('Access-Control-Allow-Origin: *');
    else hdrs.push(`Access-Control-Allow-Origin: ${corsOrigin}`);
    hdrs.push(`Access-Control-Allow-Methods: ${corsMethods}`);
    hdrs.push(`Access-Control-Allow-Headers: ${corsHeaders}`);
    if (corsExpose) hdrs.push(`Access-Control-Expose-Headers: ${corsExpose}`);
    if (corsCreds) hdrs.push('Access-Control-Allow-Credentials: true');
    if (corsMaxAge) hdrs.push(`Access-Control-Max-Age: ${corsMaxAge}`);
    setCorsOut(hdrs.join('\n'));
    toast.success('CORS headers generated');
  };

  const testCors = () => {
    const origin = corsTestOrigin;
    const allowed = corsOrigin.split(',').map(s => s.trim());
    let result: string;
    if (corsOrigin === '*') result = `✓ Origin "${origin}" is ALLOWED (wildcard *)`;
    else if (allowed.includes(origin)) result = `✓ Origin "${origin}" is ALLOWED (exact match)`;
    else if (allowed.some(a => origin.endsWith(a.replace('https://', '').replace('http://', '')))) result = `✓ Origin "${origin}" is ALLOWED (suffix match)`;
    else result = `✗ Origin "${origin}" is BLOCKED`;
    const checks = [
      result,
      `Expected methods: ${corsMethods}`,
      `Credentials: ${corsCreds ? 'Yes' : 'No'}`,
      `Preflight max-age: ${corsMaxAge}s`,
      '',
      'Note: Browser CORS enforcement also depends on matching method and headers.',
    ];
    setCorsTestOut(checks.join('\n'));
    toast.success(result.startsWith('✓') ? 'Allowed' : 'Blocked');
  };

  const parseRateLimit = () => {
    const lines = rlHeaders.split('\n').filter(l => l.trim());
    const parsed: Record<string, string> = {};
    lines.forEach(l => {
      const [k, ...v] = l.split(':');
      if (k) parsed[k.trim().toLowerCase()] = v.join(':').trim();
    });
    const results: string[] = [];
    const limit = parsed['x-ratelimit-limit'];
    const remaining = parsed['x-ratelimit-remaining'];
    const reset = parsed['x-ratelimit-reset'];
    const retryAfter = parsed['retry-after'];
    if (limit) results.push(`Limit: ${limit} requests`);
    if (remaining) results.push(`Remaining: ${remaining} (${Math.round(parseInt(remaining) / parseInt(limit || '1') * 100)}% used)`);
    if (reset) {
      const d = new Date(parseInt(reset) * 1000);
      results.push(`Reset: ${d.toISOString()} (${Math.round((parseInt(reset) - Date.now() / 1000) / 60)} min)`);
    }
    if (retryAfter) results.push(`Retry-After: ${retryAfter}s`);
    if (!results.length) results.push('No rate limit headers detected');
    setRlOut(results.join('\n'));
    toast.success('Rate limit headers parsed');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="CORS Header Generator">
        <Inp label="Origin" value={corsOrigin} onChange={setCorsOrigin} placeholder="https://app.example.com" />
        <Inp label="Methods" value={corsMethods} onChange={setCorsMethods} placeholder="GET, POST" />
        <Inp label="Headers" value={corsHeaders} onChange={setCorsHeaders} placeholder="Content-Type" />
        <Inp label="Expose" value={corsExpose} onChange={setCorsExpose} placeholder="X-Total-Count" />
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-zinc-500">Credentials:</label>
          <button onClick={() => setCorsCreds(!corsCreds)} className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${corsCreds ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>{corsCreds ? 'true' : 'false'}</button>
        </div>
        <Inp label="Max-age" value={corsMaxAge} onChange={setCorsMaxAge} placeholder="86400" />
        <CalcBtn onClick={genCors} label="Generate CORS Headers" />
        <Output value={corsOut} />
      </Card>
      <Card title="CORS Policy Tester">
        <Inp label="Test Origin" value={corsTestOrigin} onChange={setCorsTestOrigin} placeholder="https://other-site.com" />
        <p className="text-[10px] text-zinc-400">Tests against the origin configured above</p>
        <CalcBtn onClick={testCors} label="Test CORS Policy" />
        <Output value={corsTestOut} />
      </Card>
      <Card title="Rate Limit Header Parser">
        <textarea value={rlHeaders} onChange={e => setRlHeaders(e.target.value)}
          className="w-full h-20 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="X-RateLimit-Limit: 100" />
        <CalcBtn onClick={parseRateLimit} label="Parse" />
        <Output value={rlOut} />
      </Card>
    </div>
  );
}

function EnvTools() {
  const [envIn, setEnvIn] = useState('DATABASE_URL=postgres://localhost:5432/mydb\nAPI_KEY=sk-abc123\nNODE_ENV=development\nPORT=3000\nDEBUG=true\nLOG_LEVEL=info\nSECRET_KEY=supersecret\nCORS_ORIGIN=http://localhost:3000');
  const [envOut, setEnvOut] = useState('');
  const [envTmplVars, setEnvTmplVars] = useState('DATABASE_URL,API_KEY,NODE_ENV,PORT,DEBUG,LOG_LEVEL,SECRET_KEY,CORS_ORIGIN');
  const [envTmplOut, setEnvTmplOut] = useState('');
  const [amqpExchange, setAmqpExchange] = useState('my-exchange');
  const [amqpType, setAmqpType] = useState('topic');
  const [amqpDurable, setAmqpDurable] = useState(true);
  const [amqpAutoDel, setAmqpAutoDel] = useState(false);
  const [amqpRouting, setAmqpRouting] = useState('my.routing.key');
  const [amqpOut, setAmqpOut] = useState('');

  const parseEnv = () => {
    const lines = envIn.split('\n').filter(l => l.trim());
    const results: string[] = [];
    lines.forEach((l, i) => {
      if (l.trim().startsWith('#')) { results.push(`Line ${i + 1}: Comment`); return; }
      const eq = l.indexOf('=');
      if (eq < 0) { results.push(`Line ${i + 1}: Missing "="`); return; }
      const key = l.slice(0, eq).trim();
      const val = l.slice(eq + 1).trim();
      const issues: string[] = [];
      if (!/^[A-Z_][A-Z0-9_]*$/i.test(key)) issues.push('Invalid key format');
      if (!val) issues.push('Empty value');
      if (val.includes(' ')) issues.push('Value contains spaces (unquoted)');
      if (key.toLowerCase() === 'password' || key.toLowerCase().includes('secret') || key.toLowerCase().includes('key')) issues.push('⚠️ Contains sensitive data');
      results.push(`Line ${i + 1}: ${key}=${val.length > 30 ? val.slice(0, 27) + '...' : val}${issues.length ? ' | ' + issues.join(', ') : ''}`);
    });
    results.push('', `Total: ${lines.length} lines`);
    setEnvOut(results.join('\n'));
    toast.success('Environment parsed');
  };

  const genEnvTmpl = () => {
    const vars = envTmplVars.split(',').map(v => v.trim()).filter(Boolean);
    const tmpl = vars.map(v => `# ${v}\n${v}=""`).join('\n\n');
    setEnvTmplOut(tmpl);
    toast.success('Template generated');
  };

  const genAmqp = () => {
    const config = {
      exchange: amqpExchange,
      type: amqpType,
      options: {
        durable: amqpDurable,
        autoDelete: amqpAutoDel,
      },
      bindings: [{
        routingKey: amqpRouting,
      }],
    };
    setAmqpOut(JSON.stringify(config, null, 2));
    toast.success('AMQP config generated');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="Env File Parser">
        <textarea value={envIn} onChange={e => setEnvIn(e.target.value)}
          className="w-full h-24 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="KEY=value" />
        <CalcBtn onClick={parseEnv} label="Parse .env" />
        <Output value={envOut} />
      </Card>
      <Card title="Env Variable Template">
        <textarea value={envTmplVars} onChange={e => setEnvTmplVars(e.target.value)}
          className="w-full h-20 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-y" placeholder="KEY1,KEY2,KEY3" />
        <CalcBtn onClick={genEnvTmpl} label="Generate Template" />
        <Output value={envTmplOut} />
      </Card>
      <Card title="AMQP Exchange Config">
        <Inp label="Exchange" value={amqpExchange} onChange={setAmqpExchange} placeholder="my-exchange" />
        <Sel label="Type" value={amqpType} onChange={setAmqpType} options={[{v:'direct',l:'Direct'},{v:'topic',l:'Topic'},{v:'fanout',l:'Fanout'},{v:'headers',l:'Headers'}]} />
        <Inp label="Routing key" value={amqpRouting} onChange={setAmqpRouting} placeholder="my.routing.key" />
        <label className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <input type="checkbox" checked={amqpDurable} onChange={e => setAmqpDurable(e.target.checked)} /> Durable
        </label>
        <label className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <input type="checkbox" checked={amqpAutoDel} onChange={e => setAmqpAutoDel(e.target.checked)} /> Auto-delete
        </label>
        <CalcBtn onClick={genAmqp} label="Generate Config" />
        <Output value={amqpOut} />
      </Card>
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Card title="ESLint Config Generator">
        <div className="flex flex-wrap gap-1">
          {[{v:'react',l:'React'},{v:'node',l:'Node'},{v:'typescript',l:'TypeScript'},{v:'next',l:'Next.js'}].map(({v,l}) => (
            <button key={v} onClick={() => setEslintType(v)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${eslintType === v ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>{l}</button>
          ))}
        </div>
        <CalcBtn onClick={genEslint} label="Generate ESLint Config" />
        <Output value={eslintOut} />
      </Card>
      <Card title="HTTP Retry Policy Builder">
        <div className="flex flex-wrap gap-1">
          {[{v:'exponential',l:'Exponential'},{v:'linear',l:'Linear'},{v:'circuitBreaker',l:'Circuit Breaker'}].map(({v,l}) => (
            <button key={v} onClick={() => setRetryPolicy(v)}
              className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${retryPolicy === v ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>{l}</button>
          ))}
        </div>
        <Inp label="Max retries" value={retryMax} onChange={setRetryMax} placeholder="3" />
        <Inp label="Delay (ms)" value={retryDelay} onChange={setRetryDelay} placeholder="1000" />
        <CalcBtn onClick={genRetry} label="Build Retry Policy" />
        <Output value={retryOut} />
      </Card>
    </div>
  );
}
