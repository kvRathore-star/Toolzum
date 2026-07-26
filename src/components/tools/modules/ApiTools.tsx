"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const inputClass = "w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2";
const labelClass = "block text-sm font-medium mb-1";
const btnClass = "w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg";
const cardClass = "max-w-xl mx-auto p-6";
const headingClass = "text-2xl font-bold mb-6";
const resultClass = "p-4 bg-[var(--bg-surface)] rounded-lg text-sm font-mono whitespace-pre";

export function ApiRequestBuilder() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://api.example.com/users');
  const [headers, setHeaders] = useState('Content-Type: application/json\nAuthorization: Bearer token');
  const [body, setBody] = useState('{"name":"John"}');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'REST Users', url: 'https://api.example.com/users', method: 'GET', headers: 'Content-Type: application/json\nAuthorization: Bearer token', body: '' },
    { label: 'Create User', url: 'https://api.example.com/users', method: 'POST', headers: 'Content-Type: application/json', body: '{"name":"John","email":"john@example.com"}' },
    { label: 'GraphQL', url: 'https://api.example.com/graphql', method: 'POST', headers: 'Content-Type: application/json', body: '{"query":"{ users { id name } }"}' },
  ];
  const calc = () => {
    const h = headers.split('\n').filter(Boolean).map(h => `  -H "${h.trim()}"`).join(' \\\n');
    const b = method !== 'GET' && body ? `  -d '${body}'` : '';
    const curl = `curl -X ${method} \\\n${h} \\\n  "${url}"${b ? ` \\\n${b}` : ''}`;
    setResult(curl);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Request Builder</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setMethod(p.method); setUrl(p.url); setHeaders(p.headers); setBody(p.body); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-blue-400 text-[var(--text-secondary)] hover:text-blue-600 transition-colors">
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Method</label>
            <div className="flex gap-1 mt-1">
              {['GET','POST','PUT','PATCH','DELETE'].map(m => (
                <button key={m} onClick={() => setMethod(m)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${method === m ? 'bg-blue-600 text-white shadow-sm' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-zinc-900'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">URL</label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Headers (one per line)</label>
          <textarea value={headers} onChange={e => setHeaders(e.target.value)} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        {method !== 'GET' && (
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Body</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        )}
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate cURL</button>
        {result && (
          <div className="relative">
            <pre className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all max-h-48">{result}</pre>
            <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiTester() {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [method, setMethod] = useState('GET');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const presets = [
    { label: 'JSONPlaceholder', url: 'https://jsonplaceholder.typicode.com/posts/1' },
    { label: 'ReqRes Users', url: 'https://reqres.in/api/users?page=1' },
    { label: 'HTTPBin', url: 'https://httpbin.org/get' },
  ];
  const calc = async () => {
    setLoading(true);
    try {
      const res = await fetch(url, { method });
      const text = await res.text();
      setStatus(res.status);
      setResult(text.slice(0, 2000));
    } catch (e) {
      setStatus(0);
      setResult(`Fetch error: ${e}`);
    } finally { setLoading(false); }
  };
  const statusColor = status !== null ? (status >= 200 && status < 300 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : status >= 400 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300') : '';
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Tester</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setUrl(p.url); setResult(''); setStatus(null); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-blue-400 text-[var(--text-secondary)] hover:text-blue-600 transition-colors">
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-3">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">URL</label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Method</label>
            <select value={method} onChange={e => setMethod(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono">
              <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
            </select>
          </div>
        </div>
        <button onClick={calc} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">
          {loading ? 'Sending...' : 'Send Request'}
        </button>
        {result && (
          <div className="space-y-2">
            {status !== null && (
              <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${statusColor}`}>
                {status} {status === 200 ? 'OK' : status === 201 ? 'Created' : status === 204 ? 'No Content' : status === 301 ? 'Moved' : status === 400 ? 'Bad Request' : status === 401 ? 'Unauthorized' : status === 403 ? 'Forbidden' : status === 404 ? 'Not Found' : status === 500 ? 'Server Error' : status === 0 ? 'Network Error' : ''}
              </div>
            )}
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-64 whitespace-pre-wrap break-all">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiResponseFormatter() {
  const [input, setInput] = useState('{"name":"John","age":30,"city":"New York"}');
  const [indent, setIndent] = useState(2);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const calc = () => {
    try {
      const parsed = JSON.parse(input);
      setResult(JSON.stringify(parsed, null, indent));
    } catch {
      setResult('Error: Invalid JSON input');
    }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Response Formatter</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">JSON Input</label>
          <textarea value={input} onChange={e => { setInput(e.target.value); setResult(''); }} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-[var(--text-secondary)]">Indent:</label>
          <div className="flex gap-1">
            {[2, 4].map(v => (
              <button key={v} onClick={() => setIndent(v)} className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${indent === v ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]'}`}>{v}</button>
            ))}
          </div>
          <button onClick={calc} className="ml-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-all">Format</button>
        </div>
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

export function ApiErrorDecoder() {
  const [code, setCode] = useState('404');
  const [result, setResult] = useState('');
  const codes: Record<string, { name: string; desc: string; category: string; color: string }> = {
    '100': { name: 'Continue', desc: 'The server has received the request headers and the client should proceed to send the body', category: 'Informational', color: 'blue' },
    '101': { name: 'Switching Protocols', desc: 'The server is switching protocols as requested', category: 'Informational', color: 'blue' },
    '200': { name: 'OK', desc: 'The request has succeeded', category: 'Success', color: 'green' },
    '201': { name: 'Created', desc: 'A new resource has been created successfully', category: 'Success', color: 'green' },
    '204': { name: 'No Content', desc: 'The request succeeded but there is no content to return', category: 'Success', color: 'green' },
    '301': { name: 'Moved Permanently', desc: 'The requested resource has been moved permanently', category: 'Redirection', color: 'yellow' },
    '302': { name: 'Found', desc: 'The requested resource has been found but under a different URI', category: 'Redirection', color: 'yellow' },
    '304': { name: 'Not Modified', desc: 'The resource has not been modified since the last request', category: 'Redirection', color: 'yellow' },
    '400': { name: 'Bad Request', desc: 'The server cannot process the request due to a client error', category: 'Client Error', color: 'red' },
    '401': { name: 'Unauthorized', desc: 'Authentication is required and has failed or has not been provided', category: 'Client Error', color: 'red' },
    '403': { name: 'Forbidden', desc: 'The client does not have access rights to the content', category: 'Client Error', color: 'red' },
    '404': { name: 'Not Found', desc: 'The server cannot find the requested resource', category: 'Client Error', color: 'red' },
    '405': { name: 'Method Not Allowed', desc: 'The request method is not supported by the resource', category: 'Client Error', color: 'red' },
    '408': { name: 'Request Timeout', desc: 'The server timed out waiting for the request', category: 'Client Error', color: 'red' },
    '429': { name: 'Too Many Requests', desc: 'The user has sent too many requests in a given amount of time (rate limiting)', category: 'Client Error', color: 'red' },
    '500': { name: 'Internal Server Error', desc: 'A generic error message when an unexpected condition was met', category: 'Server Error', color: 'red' },
    '502': { name: 'Bad Gateway', desc: 'The server received an invalid response from an upstream server', category: 'Server Error', color: 'red' },
    '503': { name: 'Service Unavailable', desc: 'The server is temporarily unable to handle the request', category: 'Server Error', color: 'red' },
    '504': { name: 'Gateway Timeout', desc: 'The upstream server failed to send a request in the time allowed', category: 'Server Error', color: 'red' },
  };
  const presets = ['200', '201', '301', '400', '401', '403', '404', '429', '500', '502', '503'];
  const calc = () => {
    setResult(code);
  };
  const info = codes[result] || null;
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Error Decoder</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(c => (
            <button key={c} onClick={() => { setCode(c); setResult(''); }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${code === c ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-zinc-900'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status Code</label>
            <input type="number" value={code} onChange={e => setCode(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div className="flex items-end">
            <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-xs transition-all">Lookup</button>
          </div>
        </div>
        {info && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-4 space-y-3 border border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-black ${info.color === 'green' ? 'text-green-500' : info.color === 'yellow' ? 'text-yellow-500' : info.color === 'blue' ? 'text-blue-500' : 'text-red-500'}`}>{result}</span>
              <div>
                <p className="text-lg font-bold text-[var(--text-primary)]">{info.name}</p>
                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${info.color === 'green' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : info.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : info.color === 'blue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>{info.category}</span>
              </div>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{info.desc}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiPayloadAnalyzer() {
  const [payload, setPayload] = useState('{"user":{"name":"John","addresses":[{"city":"NYC","zip":"10001"}]}}');
  const [result, setResult] = useState<{ size: number; keys: number; depth: number; topKeys: number; type: string } | null>(null);
  const presets = [
    { label: 'Nested User', json: '{"user":{"name":"John","addresses":[{"city":"NYC","zip":"10001"}]}}' },
    { label: 'Product List', json: '{"products":[{"id":1,"name":"Widget","price":9.99},{"id":2,"name":"Gadget","price":19.99}],"total":2}' },
    { label: 'Flat Object', json: '{"name":"John","age":30,"email":"john@example.com","active":true,"role":"admin"}' },
  ];
  const calc = () => {
    try {
      const obj = JSON.parse(payload);
      const str = JSON.stringify(obj);
      const depth = (o: any): number => typeof o === 'object' && o !== null ? 1 + Math.max(0, ...Object.values(o).map(v => depth(v))) : 0;
      const countKeys = (o: any): number => typeof o === 'object' && o !== null ? Object.keys(o).length + Object.values(o).filter(v => typeof v === 'object' && v !== null).reduce((s: number, v: any) => s + countKeys(v), 0) : 0;
      setResult({
        size: str.length,
        keys: countKeys(obj),
        depth: depth(obj),
        topKeys: Object.keys(obj).length,
        type: Array.isArray(obj) ? 'Array' : typeof obj,
      });
    } catch { setResult(null); }
  };
  const maxKey = result ? Math.max(result.size, result.keys * 10, result.depth * 50, result.topKeys * 50) : 1;
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Payload Analyzer</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setPayload(p.json); setResult(null); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-blue-400 text-[var(--text-secondary)] hover:text-blue-600 transition-colors">
              {p.label}
            </button>
          ))}
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">JSON Payload</label>
          <textarea value={payload} onChange={e => { setPayload(e.target.value); setResult(null); }} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Analyze</button>
        {result && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Size</p>
              <p className="text-xl font-bold text-blue-500">{result.size < 1024 ? `${result.size} B` : `${(result.size / 1024).toFixed(2)} KB`}</p>
              <div className="mt-2 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(result.size / maxKey) * 100}%` }} /></div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Keys</p>
              <p className="text-xl font-bold text-emerald-500">{result.keys}</p>
              <div className="mt-2 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${(result.keys * 10 / maxKey) * 100}%` }} /></div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Nesting Depth</p>
              <p className="text-xl font-bold text-purple-500">{result.depth}</p>
              <div className="mt-2 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${(result.depth * 50 / maxKey) * 100}%` }} /></div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Top-Level Keys</p>
              <p className="text-xl font-bold text-amber-500">{result.topKeys}</p>
              <div className="mt-2 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(result.topKeys * 50 / maxKey) * 100}%` }} /></div>
            </div>
            <div className="col-span-2 bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Type</p>
              <span className="inline-block mt-1 px-2.5 py-1 text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg">{result.type}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiMockDataGenerator() {
  const [schema, setSchema] = useState('{ "id": "number", "name": "string", "email": "string", "age": "number" }');
  const [count, setCount] = useState(3);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'User Profile', schema: '{ "id": "number", "name": "string", "email": "email", "age": "number", "active": "boolean" }' },
    { label: 'Product', schema: '{ "id": "number", "title": "string", "price": "number", "inStock": "boolean" }' },
    { label: 'Comment', schema: '{ "id": "number", "postId": "number", "author": "string", "body": "string", "createdAt": "string" }' },
  ];
  const generate = (field: string) => {
    if (field === 'number') return Math.floor(Math.random() * 1000);
    if (field === 'string') return Math.random().toString(36).substring(2, 8);
    if (field === 'email') return `${Math.random().toString(36).substring(2, 8)}@example.com`;
    if (field === 'boolean') return Math.random() > 0.5;
    return 'value';
  };
  const calc = () => {
    try {
      const fields = JSON.parse(schema);
      const items = Array.from({ length: count }, () => {
        const item: Record<string, any> = {};
        for (const [k, v] of Object.entries(fields)) item[k] = generate(v as string);
        return item;
      });
      setResult(JSON.stringify(items, null, 2));
    } catch {
      setResult('Error: Invalid schema JSON');
    }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Mock Data Generator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setSchema(p.schema); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-emerald-400 text-[var(--text-secondary)] hover:text-emerald-600 transition-colors">
              {p.label}
            </button>
          ))}
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Schema (JSON)</label>
          <textarea value={schema} onChange={e => { setSchema(e.target.value); setResult(''); }} rows={4} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Count: {count}</label>
          <input type="range" min={1} max={20} value={count} onChange={e => { setCount(Number(e.target.value)); setResult(''); }} className="w-full mt-1 accent-emerald-500" />
        </div>
        <button onClick={calc} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate</button>
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

export function ApiMockServerConfig() {
  const [endpoints, setEndpoints] = useState('/users: [{ "id": 1, "name": "John" }]\n/posts: [{ "id": 1, "title": "Hello" }]');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'Simple CRUD', data: '/users: [{ "id": 1, "name": "John" }]\n/posts: [{ "id": 1, "title": "Hello" }]\n/comments: [{ "id": 1, "body": "Nice post!" }]' },
    { label: 'Blog API', data: '/posts: [{ "id": 1, "title": "First Post", "body": "Content here" }]\n/authors: [{ "id": 1, "name": "Jane Doe" }]\n/categories: [{ "id": 1, "name": "Tech" }]' },
  ];
  const calc = () => {
    const lines = endpoints.split('\n').filter(Boolean);
    const config: Record<string, any> = {};
    for (const line of lines) {
      const [key, ...rest] = line.split(':');
      if (!key) continue;
      try {
        const val = JSON.parse(rest.join(':').trim());
        config[key.trim()] = val;
      } catch { config[key.trim()] = []; }
    }
    const db = { posts: [], comments: [], ...config };
    const jsonServer = JSON.stringify({ "db": db, "routes": Object.keys(db).reduce((acc: Record<string, string>, k: string) => { acc[`/api/${k}`] = `/${k}`; return acc; }, {}) }, null, 2);
    setResult(jsonServer);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Mock Server Config</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setEndpoints(p.data); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-amber-400 text-[var(--text-secondary)] hover:text-amber-600 transition-colors">
              {p.label}
            </button>
          ))}
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Endpoints (key: JSON array, one per line)</label>
          <textarea value={endpoints} onChange={e => { setEndpoints(e.target.value); setResult(''); }} rows={4} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Config</button>
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

export function MockApiResponseGenerator() {
  const [schema, setSchema] = useState('{\n  "users": [\n    { "id": "number", "name": "string", "email": "string", "active": "boolean" }\n  ],\n  "total": "number"\n}');
  const [count, setCount] = useState(5);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const presets = [
    { label: 'User List', schema: '{\n  "users": [\n    { "id": "number", "name": "string", "email": "string", "active": "boolean" }\n  ],\n  "total": "number"\n}' },
    { label: 'Product Catalog', schema: '{\n  "products": [\n    { "id": "number", "title": "string", "price": "number", "inStock": "boolean", "tags": ["string"] }\n  ],\n  "page": "number",\n  "perPage": "number"\n}' },
    { label: 'Blog Posts', schema: '{\n  "posts": [\n    { "id": "number", "title": "string", "slug": "string", "content": "string", "publishedAt": "date" }\n  ],\n  "meta": { "total": "number", "page": "number" }\n}' },
  ];

  const generate = (type: string): any => {
    if (type === 'number') return Math.floor(Math.random() * 1000);
    if (type === 'string') return Math.random().toString(36).substring(2, 10);
    if (type === 'boolean') return Math.random() > 0.5;
    if (type === 'date') return new Date(Date.now() - Math.random() * 31536000000).toISOString();
    if (Array.isArray(type)) return Array.from({ length: 3 }, () => generate(type[0]));
    return 'value';
  };

  const calc = () => {
    try {
      const template = JSON.parse(schema);
      const generateFromTemplate = (obj: any): any => {
        if (Array.isArray(obj)) {
          return Array.from({ length: count }, () => obj[0] ? generateFromTemplate(obj[0]) : {});
        }
        if (typeof obj === 'object' && obj !== null) {
          const result: any = {};
          for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
              result[key] = generate(value);
            } else if (Array.isArray(value) && value.length > 0) {
              result[key] = generateFromTemplate(value);
            } else if (typeof value === 'object' && value !== null) {
              result[key] = generateFromTemplate(value);
            }
          }
          return result;
        }
        return obj;
      };
      const result = generateFromTemplate(template);
      setOutput(JSON.stringify(result, null, 2));
    } catch {
      toast.error('Invalid JSON schema');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Mock API Response Generator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setSchema(p.schema); setOutput(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-emerald-400 text-[var(--text-secondary)] hover:text-emerald-600 transition-colors">
              {p.label}
            </button>
          ))}
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Response Schema (JSON)</label>
          <textarea value={schema} onChange={e => { setSchema(e.target.value); setOutput(''); }} rows={6} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Array Length: {count}</label>
          <input type="range" min={1} max={50} value={count} onChange={e => { setCount(Number(e.target.value)); setOutput(''); }} className="w-full mt-1 accent-emerald-500" />
        </div>
        <button onClick={calc} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate</button>
        {output && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-64 whitespace-pre-wrap break-all">{output}</pre>
            <button onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiLatencyBudget() {
  const [sla, setSla] = useState('99.9');
  const [totalTime, setTotalTime] = useState('2000');
  const [result, setResult] = useState<{ appBudget: number; dbBudget: number; extBudget: number; allowedDowntime: number } | null>(null);
  const presets = [
    { label: 'High SLA', sla: '99.99', time: '1000' },
    { label: 'Standard', sla: '99.9', time: '2000' },
    { label: 'Relaxed', sla: '99.5', time: '5000' },
  ];
  const calc = () => {
    const slaPct = parseFloat(sla) / 100;
    const totalMs = parseFloat(totalTime);
    const monthlySecs = 30 * 24 * 60 * 60;
    const allowedDowntimeSecs = monthlySecs * (1 - slaPct);
    setResult({
      appBudget: totalMs * 0.3,
      dbBudget: totalMs * 0.4,
      extBudget: totalMs * 0.3,
      allowedDowntime: allowedDowntimeSecs,
    });
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Latency Splitter</h2>
        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-400 text-xs">
          <strong>⚠ Simplified Calculator:</strong> This tool uses a fixed 30/40/30% split (Application/Database/External APIs) for demonstration. Real latency budgets require profiling your specific architecture, considering tail latencies, retries, and queueing delays.
        </div>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setSla(p.sla); setTotalTime(p.time); setResult(null); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-purple-400 text-[var(--text-secondary)] hover:text-purple-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">SLA (%)</label>
            <input type="number" value={sla} onChange={e => setSla(e.target.value)} step="0.01" className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Total Budget (ms)</label>
            <input type="number" value={totalTime} onChange={e => setTotalTime(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Calculate Split</button>
        {result && (
          <div className="space-y-3">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center gap-3">
              <span className="text-2xl">⏱</span>
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Monthly Allowed Downtime</p>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{result.allowedDowntime.toFixed(0)}s ({(result.allowedDowntime / 60).toFixed(1)} min)</p>
              </div>
            </div>
            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Fixed-Ratio Breakdown ({parseFloat(totalTime)}ms total)</div>
            <div className="space-y-2">
              {[
                { label: 'Application', value: result.appBudget, color: 'bg-blue-500', pct: 30 },
                { label: 'Database', value: result.dbBudget, color: 'bg-emerald-500', pct: 40 },
                { label: 'External APIs', value: result.extBudget, color: 'bg-purple-500', pct: 30 },
              ].map(item => (
                <div key={item.label} className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)]">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{item.label}</span>
                    <span className="font-bold">{item.value.toFixed(0)}ms ({item.pct}%)</span>
                  </div>
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiPaginationCalculator() {
  const [total, setTotal] = useState('100');
  const [perPage, setPerPage] = useState('10');
  const [page, setPage] = useState('3');
  const [result, setResult] = useState<{ totalPages: number; offset: number; start: number; end: number; hasNext: boolean; hasPrev: boolean } | null>(null);
  const calc = () => {
    const t = parseInt(total);
    const pp = parseInt(perPage);
    const p = parseInt(page);
    const totalPages = Math.ceil(t / pp);
    const offset = (p - 1) * pp;
    setResult({
      totalPages,
      offset,
      start: offset + 1,
      end: Math.min(offset + pp, t),
      hasNext: p < totalPages,
      hasPrev: p > 1,
    });
  };
  const pageArr = result ? Array.from({ length: result.totalPages }, (_, i) => i + 1) : [];
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Pagination Calculator</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Total Items</label>
            <input type="number" value={total} onChange={e => { setTotal(e.target.value); setResult(null); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Per Page</label>
            <input type="number" value={perPage} onChange={e => { setPerPage(e.target.value); setResult(null); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Current Page</label>
            <input type="number" value={page} onChange={e => { setPage(e.target.value); setResult(null); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Calculate</button>
        {result && (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Pages</p>
                <p className="text-xl font-bold text-blue-500">{result.totalPages}</p>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Offset</p>
                <p className="text-xl font-bold text-emerald-500">{result.offset}</p>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Has Next</p>
                <p className={`text-lg font-bold ${result.hasNext ? 'text-green-500' : 'text-red-400'}`}>{result.hasNext ? '✓' : '✗'}</p>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Has Prev</p>
                <p className={`text-lg font-bold ${result.hasPrev ? 'text-green-500' : 'text-red-400'}`}>{result.hasPrev ? '✓' : '✗'}</p>
              </div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)]">
              <p className="text-xs text-[var(--text-secondary)] mb-2">Items on page: <span className="font-bold">{result.start} - {result.end}</span></p>
              <div className="flex gap-1 flex-wrap">
                {pageArr.map(p => (
                  <span key={p} onClick={() => { setPage(String(p)); calc(); }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${p === parseInt(page) ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-[var(--text-secondary)] hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiKeyGenerator() {
  const [prefix, setPrefix] = useState('sk');
  const [length, setLength] = useState('32');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'Stripe-like', prefix: 'sk', len: '32' },
    { label: 'GitHub PAT', prefix: 'ghp', len: '40' },
    { label: 'Simple Key', prefix: 'key', len: '24' },
  ];
  const calc = () => {
    const len = parseInt(length);
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let key = '';
    for (let i = 0; i < len; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
    setResult(prefix ? `${prefix}_${key}` : key);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Key Generator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setPrefix(p.prefix); setLength(p.len); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-rose-400 text-[var(--text-secondary)] hover:text-rose-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Prefix</label>
            <input type="text" value={prefix} onChange={e => { setPrefix(e.target.value); setResult(''); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Length</label>
            <input type="number" value={length} onChange={e => { setLength(e.target.value); setResult(''); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate</button>
        {result && (
          <div className="relative">
            <pre className="bg-gray-900 text-rose-300 rounded-xl p-4 text-sm font-mono overflow-x-auto break-all">{result}</pre>
            <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiKeyHasher() {
  const [apiKey, setApiKey] = useState('sk_test_abc123def456');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const calc = async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    setResult(hashHex);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Key Hasher</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">API Key</label>
          <input type="text" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Hash (SHA-256)</button>
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto break-all">{result}</pre>
            <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiKeyValidator() {
  const [apiKey, setApiKey] = useState('sk_test_abc123def456ghi789');
  const [result, setResult] = useState<{ valid: boolean; checks: { label: string; pass: boolean }[] } | null>(null);
  const calc = () => {
    const checks = [
      { label: `Length (16-128): ${apiKey.length}`, pass: apiKey.length >= 16 && apiKey.length <= 128 },
      { label: 'Has prefix separator (_)', pass: apiKey.includes('_') },
      { label: 'Valid characters (a-zA-Z0-9_-)', pass: /^[a-zA-Z0-9_-]+$/.test(apiKey) },
      { label: 'Character diversity', pass: (apiKey.match(/[a-z]/g)?.length || 0) + (apiKey.match(/[A-Z]/g)?.length || 0) + (apiKey.match(/[0-9]/g)?.length || 0) >= 3 },
    ];
    setResult({ valid: checks.every(c => c.pass), checks });
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Key Validator</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">API Key</label>
          <input type="text" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Validate</button>
        {result && (
          <div className="space-y-2">
            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-bold ${result.valid ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
              <span className="text-lg">{result.valid ? '✓' : '✗'}</span>
              {result.valid ? 'Valid API Key' : 'Invalid API Key'}
            </div>
            <div className="space-y-1.5">
              {result.checks.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={c.pass ? 'text-green-500' : 'text-red-400'}>{c.pass ? '✓' : '✗'}</span>
                  <span className="text-[var(--text-secondary)]">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiCostEstimator() {
  const [requests, setRequests] = useState('1000000');
  const [pricePerMillion, setPricePerMillion] = useState('0.50');
  const [users, setUsers] = useState('10000');
  const [result, setResult] = useState<{ cost: number; costPerUser: number; reqPerUser: number; monthlyPerUser: number } | null>(null);
  const presets = [
    { label: 'OpenAI GPT-4o', req: '1000000', ppm: '10.00', users: '5000' },
    { label: 'Stripe API', req: '500000', ppm: '0.50', users: '10000' },
    { label: 'Small Startup', req: '100000', ppm: '1.00', users: '1000' },
  ];
  const calc = () => {
    const req = parseFloat(requests);
    const ppm = parseFloat(pricePerMillion);
    const u = parseFloat(users);
    setResult({
      cost: (req / 1000000) * ppm,
      costPerUser: ((req / 1000000) * ppm) / u,
      reqPerUser: req / u,
      monthlyPerUser: (req / u) * ppm / 1000000,
    });
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Cost Estimator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setRequests(p.req); setPricePerMillion(p.ppm); setUsers(p.users); setResult(null); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-green-400 text-[var(--text-secondary)] hover:text-green-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Monthly Requests</label>
            <input type="number" value={requests} onChange={e => { setRequests(e.target.value); setResult(null); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Price/Million ($)</label>
            <input type="number" value={pricePerMillion} onChange={e => { setPricePerMillion(e.target.value); setResult(null); }} step="0.01" className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Users</label>
            <input type="number" value={users} onChange={e => { setUsers(e.target.value); setResult(null); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Estimate Cost</button>
        {result && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Monthly Cost</p>
              <p className="text-2xl font-black text-green-500">${result.cost.toFixed(2)}</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Cost Per User</p>
              <p className="text-2xl font-black text-blue-500">${result.costPerUser.toFixed(4)}</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Requests Per User</p>
              <p className="text-xl font-bold text-purple-500">{result.reqPerUser.toFixed(1)}</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Monthly Cost/User</p>
              <p className="text-xl font-bold text-amber-500">${result.monthlyPerUser.toFixed(4)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiGatewayRateCalculator() {
  const [maxRps, setMaxRps] = useState('100');
  const [burstSize, setBurstSize] = useState('200');
  const [windowSec, setWindowSec] = useState('60');
  const [result, setResult] = useState<{ maxPerWindow: number; sustainedRate: number; throttledRate: number } | null>(null);
  const calc = () => {
    const rps = parseFloat(maxRps);
    const burst = parseFloat(burstSize);
    const windowS = parseFloat(windowSec);
    setResult({
      maxPerWindow: rps * windowS,
      sustainedRate: (rps * windowS) / windowS,
      throttledRate: Math.round(rps * 0.8),
    });
  };
  const wSec = parseFloat(windowSec) || 60;
  const maxVal = result ? Math.max(result.maxPerWindow, result.sustainedRate * wSec, result.throttledRate * wSec) || 1 : 1;
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Gateway Rate Calculator</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Max RPS</label>
            <input type="number" value={maxRps} onChange={e => { setMaxRps(e.target.value); setResult(null); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Burst Size</label>
            <input type="number" value={burstSize} onChange={e => { setBurstSize(e.target.value); setResult(null); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Window (s)</label>
            <input type="number" value={windowSec} onChange={e => { setWindowSec(e.target.value); setResult(null); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Calculate</button>
        {result && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Per Window</p>
                <p className="text-lg font-bold text-cyan-500">{result.maxPerWindow.toLocaleString()}</p>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Sustained</p>
                <p className="text-lg font-bold text-blue-500">{result.sustainedRate} req/s</p>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Throttle (80%)</p>
                <p className="text-lg font-bold text-amber-500">{result.throttledRate} req/s</p>
              </div>
            </div>
            <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden relative">
              <div className="h-full bg-cyan-500 rounded-full transition-all absolute left-0 top-0" style={{ width: `${(result.sustainedRate / parseFloat(maxRps)) * 100}%`, maxWidth: '100%' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiRateLimiterCalculator() {
  const [limit, setLimit] = useState('100');
  const [windowMins, setWindowMins] = useState('15');
  const [burst, setBurst] = useState('20');
  const [result, setResult] = useState<{ ratePerSec: number; ratePerMin: number; burstWindow: number; retryAfter: number } | null>(null);
  const calc = () => {
    const l = parseInt(limit);
    const w = parseInt(windowMins);
    const b = parseInt(burst);
    const ratePerSec = l / (w * 60);
    setResult({
      ratePerSec,
      ratePerMin: l / w,
      burstWindow: Math.ceil(b / ratePerSec),
      retryAfter: Math.ceil(w / l * 60),
    });
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Rate Limiter Calculator</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Rate Limit</label>
            <input type="number" value={limit} onChange={e => setLimit(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Window (min)</label>
            <input type="number" value={windowMins} onChange={e => setWindowMins(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Burst</label>
            <input type="number" value={burst} onChange={e => setBurst(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Calculate</button>
        {result && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Per Second</p>
              <p className="text-xl font-bold text-violet-500">{result.ratePerSec.toFixed(3)} req/s</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Per Minute</p>
              <p className="text-xl font-bold text-blue-500">{result.ratePerMin.toFixed(1)} req/min</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Burst Window</p>
              <p className="text-xl font-bold text-amber-500">~{result.burstWindow}s</p>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Retry-After</p>
              <p className="text-xl font-bold text-emerald-500">{result.retryAfter}s</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiChangelogGenerator() {
  const [oldVersion, setOldVersion] = useState('2.0.0');
  const [newVersion, setNewVersion] = useState('2.1.0');
  const [changes, setChanges] = useState('Added: New /v2/users endpoint\nAdded: Rate limiting headers\nChanged: Response format for /v1/posts\nDeprecated: /v1/legacy endpoint\nFixed: Null pointer in auth middleware');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'API Release', oldV: '2.0.0', newV: '2.1.0', changes: 'Added: New /v2/users endpoint\nChanged: Response format for /v1/posts\nFixed: Null pointer in auth middleware\nDeprecated: /v1/legacy endpoint' },
    { label: 'Patch Fix', oldV: '1.5.0', newV: '1.5.1', changes: 'Fixed: Login redirect loop\nFixed: Memory leak in WebSocket handler\nSecurity: Upgraded dependencies' },
  ];
  const calc = () => {
    const lines = changes.split('\n').filter(Boolean);
    const categorized: Record<string, string[]> = { Added: [], Changed: [], Deprecated: [], Removed: [], Fixed: [], Security: [] };
    for (const line of lines) {
      const [cat] = line.split(':');
      const clean = cat.trim();
      if (categorized[clean]) categorized[clean].push(line.trim());
    }
    let output = `## Changelog\n\n### ${newVersion} (${new Date().toISOString().split('T')[0]})\n`;
    for (const [cat, items] of Object.entries(categorized)) {
      if (items.length) output += `\n#### ${cat}\n${items.map(i => `- ${i}`).join('\n')}\n`;
    }
    setResult(output);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Changelog Generator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setOldVersion(p.oldV); setNewVersion(p.newV); setChanges(p.changes); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-sky-400 text-[var(--text-secondary)] hover:text-sky-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Old Version</label>
            <input type="text" value={oldVersion} onChange={e => setOldVersion(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">New Version</label>
            <input type="text" value={newVersion} onChange={e => setNewVersion(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Changes (one per line: Added:/Changed:/Fixed:)</label>
          <textarea value={changes} onChange={e => setChanges(e.target.value)} rows={4} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Changelog</button>
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

export function ApiDocumentationGenerator() {
  const [endpoint, setEndpoint] = useState('/api/v2/users');
  const [method, setMethod] = useState('GET');
  const [desc, setDesc] = useState('Retrieve a list of all users');
  const [params, setParams] = useState('page (query, integer, optional) - Page number\nlimit (query, integer, optional) - Items per page');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const calc = () => {
    const paramLines = params.split('\n').filter(Boolean);
    const table = paramLines.map(p => {
      const parts = p.split('-');
      const field = parts[0].trim();
      const desc2 = parts.slice(1).join('-').trim();
      return `| ${field} | ${desc2} |`;
    }).join('\n');
    const output = `# ${method} ${endpoint}\n\n${desc}\n\n### Parameters\n\n| Parameter | Description |\n|-----------|-------------|\n${table}\n\n### Response\n\n\`\`\`json\n{\n  "data": [],\n  "total": 0,\n  "page": 1\n}\n\`\`\`\n\n### Example\n\n\`\`\`bash\ncurl -X ${method} "https://api.example.com${endpoint}"\n\`\`\``;
    setResult(output);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Documentation Generator</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Endpoint</label>
            <input type="text" value={endpoint} onChange={e => setEndpoint(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Method</label>
            <select value={method} onChange={e => setMethod(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono">
              <option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
          <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Parameters (one per line: name (type, required) - description)</label>
          <textarea value={params} onChange={e => setParams(e.target.value)} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Docs</button>
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

export function RestEndpointDocumenter() {
  const [endpoints, setEndpoints] = useState('GET /users - List all users\nPOST /users - Create a user\nGET /users/:id - Get user by ID\nPUT /users/:id - Update user\nDELETE /users/:id - Delete user');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'CRUD Users', data: 'GET /users - List all users\nPOST /users - Create a user\nGET /users/:id - Get user by ID\nPUT /users/:id - Update user\nDELETE /users/:id - Delete user' },
    { label: 'Blog API', data: 'GET /posts - List posts\nPOST /posts - Create post\nGET /posts/:id - Get post\nPUT /posts/:id - Update post\nDELETE /posts/:id - Delete post\nGET /comments - List comments' },
  ];
  const calc = () => {
    const lines = endpoints.split('\n').filter(Boolean);
    const table = lines.map(l => {
      const [method, ...rest] = l.split(' ');
      const restStr = rest.join(' ');
      const [path, ...descParts] = restStr.split('-');
      return `| ${method.trim()} | \`${path.trim()}\` | ${descParts.join('-').trim()} |`;
    }).join('\n');
    const output = `## REST API Endpoints\n\n| Method | Path | Description |\n|--------|------|-------------|\n${table}\n\n### Sample Request Body\n\`\`\`json\n{\n  "name": "string",\n  "email": "string"\n}\n\`\`\`\n\n### Sample Response\n\`\`\`json\n{\n  "id": 1,\n  "name": "string",\n  "email": "string",\n  "createdAt": "2026-01-01T00:00:00Z"\n}\n\`\`\``;
    setResult(output);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">REST Endpoint Documenter</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setEndpoints(p.data); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-teal-400 text-[var(--text-secondary)] hover:text-teal-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Endpoints (METHOD /path - description, one per line)</label>
          <textarea value={endpoints} onChange={e => setEndpoints(e.target.value)} rows={4} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Docs</button>
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
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Query</label>
          <textarea value={query} onChange={e => { setQuery(e.target.value); setResult(null); }} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
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
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Query</label>
          <textarea value={query} onChange={e => { setQuery(e.target.value); setResult(''); }} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Format</button>
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-48 whitespace-pre-wrap break-all">{result}</pre>
            <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
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
      const fieldList = fields.split(/\s+/).filter(Boolean);
      for (let i = 0; i < fieldList.length; i += 2) {
        if (!fieldList[i + 1]) continue;
        const fName = fieldList[i];
        const fType = fieldList[i + 1].replace('!', '').replace('[', '').replace(']', '');
        const required = fieldList[i + 1].includes('!');
        const mapping: Record<string, string> = { ID: 'string', String: 'string', Int: 'integer', Float: 'number', Boolean: 'boolean' };
        props[fName] = { type: mapping[fType] || 'string' };
        if (required) props[fName].description = 'required';
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
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">GraphQL Schema</label>
          <textarea value={schema} onChange={e => { setSchema(e.target.value); setResult(''); }} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Convert</button>
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
    const referenced = schema.match(/(\w+)(?:!|\))/g)?.map(m => m.replace(/[!)\]]/g, '')) || [];
    const defined = schema.match(/\btype\s+(\w+)/g)?.map(m => m.replace('type ', '')) || ['String', 'Int', 'Float', 'Boolean', 'ID'];
    for (const ref of referenced) {
      if (!defined.includes(ref) && ref.length > 1) issues.push(`Reference to unknown type: ${ref}`);
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
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Schema</label>
          <textarea value={schema} onChange={e => { setSchema(e.target.value); setResult(null); }} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
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
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Name</label>
            <input type="text" value={name} onChange={e => { setName(e.target.value); setResult(''); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Payload Fields</label>
            <textarea value={payload} onChange={e => { setPayload(e.target.value); setResult(''); }} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-lime-600 hover:bg-lime-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Build Subscription</button>
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-48 whitespace-pre-wrap break-all">{result}</pre>
            <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function GraphqlTester() {
  const [query, setQuery] = useState('query { users { id name email } }');
  const [variables, setVariables] = useState('{}');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'Users Query', q: 'query { users { id name email } }', v: '{}' },
    { label: 'With Variables', q: 'query ($id: ID!) { user(id: $id) { name email } }', v: '{"id": "1"}' },
  ];
  const calc = () => {
    const formatted = `# Query\n${query.replace(/\s+/g, ' ').trim()}\n\n# Variables\n${variables}\n\n# Response (mock)\n{\n  "data": {\n    "users": [\n      { "id": "1", "name": "John", "email": "john@example.com" }\n    ]\n  }\n}`;
    setResult(formatted);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">GraphQL Tester</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setQuery(p.q); setVariables(p.v); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-rose-400 text-[var(--text-secondary)] hover:text-rose-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Query</label>
          <textarea value={query} onChange={e => { setQuery(e.target.value); setResult(''); }} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Variables (JSON)</label>
          <textarea value={variables} onChange={e => { setVariables(e.target.value); setResult(''); }} rows={2} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Format</button>
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
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Variables JSON</label>
          <textarea value={input} onChange={e => setInput(e.target.value)} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Format</button>
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-48 whitespace-pre-wrap break-all">{result}</pre>
            <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function GrpcStatusCodeLookup() {
  const [code, setCode] = useState('4');
  const [result, setResult] = useState('');
  const codes: Record<string, { name: string; desc: string }> = {
    '0': { name: 'OK', desc: 'The operation completed successfully' },
    '1': { name: 'CANCELLED', desc: 'The operation was cancelled' },
    '2': { name: 'UNKNOWN', desc: 'Unknown error' },
    '3': { name: 'INVALID_ARGUMENT', desc: 'Client specified an invalid argument' },
    '4': { name: 'DEADLINE_EXCEEDED', desc: 'Deadline expired before operation completed' },
    '5': { name: 'NOT_FOUND', desc: 'Some requested entity was not found' },
    '6': { name: 'ALREADY_EXISTS', desc: 'Entity already exists' },
    '7': { name: 'PERMISSION_DENIED', desc: 'Caller does not have permission' },
    '8': { name: 'RESOURCE_EXHAUSTED', desc: 'Resource exhausted (rate limit)' },
    '9': { name: 'FAILED_PRECONDITION', desc: 'System not in required state' },
    '10': { name: 'ABORTED', desc: 'Operation aborted' },
    '11': { name: 'OUT_OF_RANGE', desc: 'Operation was attempted past valid range' },
    '12': { name: 'UNIMPLEMENTED', desc: 'Operation not implemented' },
    '13': { name: 'INTERNAL', desc: 'Internal errors' },
    '14': { name: 'UNAVAILABLE', desc: 'Service is currently unavailable' },
    '15': { name: 'DATA_LOSS', desc: 'Unrecoverable data loss or corruption' },
    '16': { name: 'UNAUTHENTICATED', desc: 'Request not authenticated' },
  };
  const presets = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'];
  const info = codes[code] || null;
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">gRPC Status Code Lookup</h2>
        <div className="flex flex-wrap gap-1">
          {presets.map(c => (
            <button key={c} onClick={() => setCode(c)}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${code === c ? 'bg-stone-600 text-white' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-zinc-900'}`}>{c}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Code</label>
            <input type="number" value={code} onChange={e => setCode(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div className="flex items-end">
            <button onClick={() => setResult(codes[code]?.name || '')} className="w-full bg-stone-600 hover:bg-stone-500 text-white font-bold py-2 rounded-lg text-xs transition-all">Lookup</button>
          </div>
        </div>
        {info && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
            <p className="text-lg font-black text-stone-600 dark:text-stone-300">{info.name}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{info.desc}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SoapApiTester() {
  const [wsdl, setWsdl] = useState('https://example.com/service?wsdl');
  const [method, setMethod] = useState('GetUser');
  const [params, setParams] = useState('<userId>123</userId>');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const calc = () => {
    const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${method} xmlns="http://example.com/service">
      ${params}
    </${method}>
  </soap:Body>
</soap:Envelope>`;
    setResult(envelope);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">SOAP API Tester</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">WSDL URL</label>
          <input type="text" value={wsdl} onChange={e => setWsdl(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Method</label>
            <input type="text" value={method} onChange={e => setMethod(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">XML Parameters</label>
            <textarea value={params} onChange={e => setParams(e.target.value)} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate SOAP Envelope</button>
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

export function OpenapiMockGenerator() {
  const [spec, setSpec] = useState('/users:\n  get:\n    responses:\n      200:\n        schema:\n          type: array\n          items:\n            type: object\n            properties:\n              id: { type: integer }\n              name: { type: string }');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const calc = () => {
    const lines = spec.split('\n').filter(Boolean);
    const mock: Record<string, any> = {};
    let currentPath = '';
    for (const line of lines) {
      if (line.startsWith('/')) { currentPath = line.split(':')[0]; mock[currentPath] = {}; }
      if (line.includes('type: integer')) mock[currentPath] = { data: [{ id: 1, name: 'John' }], total: 1 };
      if (line.includes('type: string')) mock[currentPath] = { data: [{ id: 1, name: 'John' }], total: 1 };
    }
    setResult(JSON.stringify(mock, null, 2));
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">OpenAPI Mock Generator</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">OpenAPI Spec (YAML fragment)</label>
          <textarea value={spec} onChange={e => setSpec(e.target.value)} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
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

export function OpenapiToPostman() {
  const [spec, setSpec] = useState('openapi: 3.0.0\ninfo:\n  title: My API\n  version: 1.0.0\npaths:\n  /users:\n    get:\n      summary: List users\n      responses:\n        200:\n          description: OK');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const calc = () => {
    const collection = {
      info: { name: 'API Collection', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
      item: [
        {
          name: '/users',
          request: { method: 'GET', header: [], url: { raw: 'https://api.example.com/users', protocol: 'https', host: ['api', 'example', 'com'], path: ['users'] } },
          response: [{ name: '200 OK', status: 'OK', code: 200, header: [], body: '[]' }],
        },
      ],
    };
    setResult(JSON.stringify(collection, null, 2));
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">OpenAPI to Postman</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">OpenAPI Spec (YAML)</label>
          <textarea value={spec} onChange={e => setSpec(e.target.value)} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Convert</button>
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

export function OpenapiValidator() {
  const [spec, setSpec] = useState('openapi: "3.0.0"\ninfo:\n  title: Test API\n  version: "1.0.0"\npaths:\n  /users:\n    get:\n      responses:\n        "200":\n          description: OK');
  const [result, setResult] = useState<{ valid: boolean; issues: string[] } | null>(null);
  const calc = () => {
    const issues: string[] = [];
    if (!spec.includes('openapi:')) issues.push('Missing openapi version field');
    if (!spec.includes('info:')) issues.push('Missing info section');
    if (!spec.includes('title:')) issues.push('Missing API title');
    if (!spec.includes('version:')) issues.push('Missing API version');
    if (!spec.includes('paths:')) issues.push('Missing paths section');
    if (!spec.includes('/')) issues.push('No endpoint paths defined');
    setResult({ valid: issues.length === 0, issues: issues.length ? issues : ['Schema appears valid'] });
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">OpenAPI Validator</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">OpenAPI Spec (YAML)</label>
          <textarea value={spec} onChange={e => setSpec(e.target.value)} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Validate</button>
        {result && (
          <div className={`p-3 rounded-xl text-sm font-bold ${result.valid ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
            <p>{result.valid ? '✓ Valid Spec' : '✗ Issues Found'}</p>
            {result.issues.map((issue, i) => <p key={i} className="text-xs font-normal mt-1">{issue}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}

export function PostmanCollectionGenerator() {
  const [endpoints, setEndpoints] = useState('GET /users List users\nPOST /users Create user\nGET /users/:id Get user');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'Users CRUD', data: 'GET /users List users\nPOST /users Create user\nGET /users/:id Get user\nPUT /users/:id Update user\nDELETE /users/:id Delete user' },
    { label: 'Posts API', data: 'GET /posts List posts\nPOST /posts Create post\nGET /posts/:id Get post' },
  ];
  const calc = () => {
    const lines = endpoints.split('\n').filter(Boolean);
    const items = lines.map(l => {
      const [method, path, ...descParts] = l.split(' ');
      return {
        name: descParts.join(' ') || path,
        request: { method, header: [], url: { raw: `https://api.example.com${path}`, protocol: 'https', host: ['api', 'example', 'com'], path: path.split('/').filter(Boolean) } },
      };
    });
    const collection = {
      info: { name: 'API Collection', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
      item: items,
    };
    setResult(JSON.stringify(collection, null, 2));
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Postman Collection Generator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setEndpoints(p.data); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-orange-400 text-[var(--text-secondary)] hover:text-orange-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Endpoints (METHOD /path description, one per line)</label>
          <textarea value={endpoints} onChange={e => setEndpoints(e.target.value)} rows={4} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate</button>
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

export function PostmanToOpenapiConverter() {
  const [collection, setCollection] = useState('{"info":{"name":"My API"},"item":[{"name":"Users","request":{"method":"GET","url":{"raw":"https://api.example.com/users"}}}]}');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const calc = () => {
    try {
      const c = JSON.parse(collection);
      const paths: Record<string, any> = {};
      for (const item of c.item || []) {
        const path = item.request?.url?.raw ? new URL(item.request.url.raw).pathname : '/' + (item.name || '').toLowerCase();
        const method = (item.request?.method || 'GET').toLowerCase();
        paths[path] = paths[path] || {};
        paths[path][method] = { summary: item.name || '', responses: { '200': { description: 'OK' } } };
      }
      const spec = { openapi: '3.0.0', info: { title: c.info?.name || 'API', version: '1.0.0' }, paths };
      setResult(JSON.stringify(spec, null, 2));
    } catch {
      setResult('Error: Invalid Postman collection JSON');
    }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Postman to OpenAPI Converter</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Postman Collection (JSON)</label>
          <textarea value={collection} onChange={e => setCollection(e.target.value)} rows={4} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Convert</button>
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

export function SwaggerOpenapiGenerator() {
  const [title, setTitle] = useState('Pet Store API');
  const [version, setVersion] = useState('1.0.0');
  const [desc, setDesc] = useState('A sample pet store API');
  const [endpoints, setEndpoints] = useState('GET /pets List all pets\nPOST /pets Create a pet\nGET /pets/{petId} Get pet by ID');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'Pet Store', t: 'Pet Store API', v: '1.0.0', d: 'A sample pet store API', e: 'GET /pets List all pets\nPOST /pets Create a pet\nGET /pets/{petId} Get pet by ID' },
    { label: 'Blog API', t: 'Blog API', v: '2.0.0', d: 'A simple blog API', e: 'GET /posts List posts\nPOST /posts Create post\nGET /posts/{id} Get post' },
  ];
  const calc = () => {
    const lines = endpoints.split('\n').filter(Boolean);
    const paths: Record<string, any> = {};
    for (const line of lines) {
      const [method, path, ...descParts] = line.split(' ');
      const m = method.toLowerCase();
      paths[path] = paths[path] || {};
      paths[path][m] = { summary: descParts.join(' '), responses: { '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object' } } } } } };
    }
    const spec = { openapi: '3.0.0', info: { title, version, description: desc }, paths };
    setResult(JSON.stringify(spec, null, 2));
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Swagger/OpenAPI Generator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setTitle(p.t); setVersion(p.v); setDesc(p.d); setEndpoints(p.e); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-green-400 text-[var(--text-secondary)] hover:text-green-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Version</label>
            <input type="text" value={version} onChange={e => setVersion(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Endpoints (METHOD /path description, one per line)</label>
          <textarea value={endpoints} onChange={e => setEndpoints(e.target.value)} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Spec</button>
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

export function WebhookPayloadGenerator() {
  const [event, setEvent] = useState('user.created');
  const [fields, setFields] = useState('id: number\nname: string\nemail: string\ncreatedAt: string');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'User Created', e: 'user.created', f: 'id: number\nname: string\nemail: string\ncreatedAt: string' },
    { label: 'Order Placed', e: 'order.placed', f: 'orderId: number\ntotal: number\nitems: number\ncustomerEmail: string' },
    { label: 'Payment', e: 'payment.completed', f: 'transactionId: string\namount: number\ncurrency: string\nstatus: string' },
  ];
  const generate = (t: string) => {
    if (t === 'number') return Math.floor(Math.random() * 1000);
    if (t === 'string') return Math.random().toString(36).substring(2, 8);
    if (t === 'email') return `${Math.random().toString(36).substring(2, 8)}@example.com`;
    if (t === 'boolean') return Math.random() > 0.5;
    return 'value';
  };
  const calc = () => {
    const payload: Record<string, any> = {};
    for (const line of fields.split('\n').filter(Boolean)) {
      const [key, type] = line.split(':').map(s => s.trim());
      payload[key] = generate(type);
    }
    const webhook = { id: Math.random().toString(36).substring(2, 10), event, created: new Date().toISOString(), data: payload };
    setResult(JSON.stringify(webhook, null, 2));
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Webhook Payload Generator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setEvent(p.e); setFields(p.f); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-blue-400 text-[var(--text-secondary)] hover:text-blue-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Event Name</label>
            <input type="text" value={event} onChange={e => { setEvent(e.target.value); setResult(''); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Fields (key: type)</label>
            <textarea value={fields} onChange={e => { setFields(e.target.value); setResult(''); }} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Payload</button>
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

export function WebhookRetryConfig() {
  const [maxRetries, setMaxRetries] = useState('3');
  const [baseDelay, setBaseDelay] = useState('1000');
  const [result, setResult] = useState<{ name: string; delays: string; total: number }[]>([]);
  const calc = () => {
    const max = parseInt(maxRetries);
    const delay = parseInt(baseDelay);
    const strategies = [
      { name: 'Fixed', delays: Array.from({ length: max }, () => delay) },
      { name: 'Linear', delays: Array.from({ length: max }, (_, i) => delay * (i + 1)) },
      { name: 'Exponential', delays: Array.from({ length: max }, (_, i) => delay * Math.pow(2, i)) },
      { name: 'Exponential + Jitter', delays: Array.from({ length: max }, (_, i) => Math.round(delay * Math.pow(2, i) * (0.5 + Math.random() * 0.5))) },
    ];
    setResult(strategies.map(s => ({
      name: s.name,
      delays: s.delays.join(' → '),
      total: s.delays.reduce((a, b) => a + b, 0),
    })));
  };
  const maxTotal = result.length ? Math.max(...result.map(r => r.total)) : 1;
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Webhook Retry Config</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Max Retries</label>
            <input type="number" value={maxRetries} onChange={e => setMaxRetries(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Base Delay (ms)</label>
            <input type="number" value={baseDelay} onChange={e => setBaseDelay(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Calculate</button>
        {result.length > 0 && (
          <div className="space-y-3">
            {result.map(r => (
              <div key={r.name} className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)]">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs font-bold">{r.name}</p>
                  <p className="text-xs font-bold text-amber-500">{(r.total / 1000).toFixed(1)}s</p>
                </div>
                <p className="text-[10px] font-mono text-[var(--text-muted)] mb-1.5">{r.delays}</p>
                <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(r.total / maxTotal) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function WebhookSignatureVerifier() {
  const [payload, setPayload] = useState('{"event":"user.created","data":{"id":1}}');
  const [secret, setSecret] = useState('whsec_test_secret_key');
  const [signature, setSignature] = useState('');
  const [result, setResult] = useState<{ expected: string; match: boolean | null }>({ expected: '', match: null });
  const calc = async () => {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const msgData = encoder.encode(payload);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, msgData);
    const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
    const expectedSig = 'sha256=' + hex;
    setResult({ expected: expectedSig, match: signature ? signature === expectedSig : null });
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Webhook Signature Verifier</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Payload</label>
          <textarea value={payload} onChange={e => setPayload(e.target.value)} rows={2} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Signing Secret</label>
            <input type="text" value={secret} onChange={e => setSecret(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Signature</label>
            <input type="text" value={signature} onChange={e => setSignature(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Verify</button>
        {result.expected && (
          <div className="space-y-2">
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Expected Signature</p>
              <p className="text-xs font-mono break-all">{result.expected}</p>
            </div>
            {result.match !== null && (
              <div className={`p-3 rounded-xl text-sm font-bold ${result.match ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                {result.match ? '✓ Signature matches!' : '✗ Signature does not match'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function WebhookTester() {
  const [url, setUrl] = useState('https://webhook.site/your-unique-id');
  const [payload, setPayload] = useState('{"event":"test","data":{"message":"Hello"}}');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);
  const calc = async () => {
    setLoading(true); setResult(''); setStatus(null);
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload });
      const text = await res.text();
      setStatus(res.status);
      setResult(text.slice(0, 500));
    } catch (e) {
      setResult(`Fetch error: ${e}\n\n(Note: This may fail due to CORS. Use a test endpoint that supports CORS.)`);
    } finally { setLoading(false); }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Webhook Tester</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Webhook URL</label>
          <input type="text" value={url} onChange={e => setUrl(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Payload (JSON)</label>
          <textarea value={payload} onChange={e => setPayload(e.target.value)} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">
          {loading ? 'Sending...' : 'Send Test'}
        </button>
        {result && (
          <div className="space-y-2">
            {status !== null && (
              <div className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${status >= 200 && status < 300 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                Status: {status}
              </div>
            )}
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-48 whitespace-pre-wrap break-all">{result}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export function WebhookValidator() {
  const [payload, setPayload] = useState('{"id":"evt_123","event":"user.created","data":{"id":1,"name":"John","email":"john@example.com"},"created":"2026-01-01T00:00:00Z"}');
  const [result, setResult] = useState<{ valid: boolean; issues: string[] } | null>(null);
  const calc = () => {
    try {
      const obj = JSON.parse(payload);
      const issues: string[] = [];
      if (!obj.id) issues.push('Missing: id');
      if (!obj.event) issues.push('Missing: event');
      if (!obj.data) issues.push('Missing: data');
      if (!obj.created) issues.push('Missing: created (timestamp)');
      if (obj.created && isNaN(Date.parse(obj.created))) issues.push('Invalid: created timestamp format');
      if (obj.event && !obj.event.includes('.')) issues.push('Suggestion: use dot notation for event (e.g., user.created)');
      setResult({ valid: issues.length === 0, issues: issues.length ? issues : ['✓ Payload structure is valid'] });
    } catch {
      setResult({ valid: false, issues: ['Error: Invalid JSON'] });
    }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Webhook Validator</h2>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Webhook Payload (JSON)</label>
          <textarea value={payload} onChange={e => { setPayload(e.target.value); setResult(null); }} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Validate</button>
        {result && (
          <div className={`p-3 rounded-xl ${result.valid ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            <p className={`text-sm font-bold ${result.valid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{result.valid ? '✓ Valid' : '✗ Issues'}</p>
            {result.issues.map((issue, i) => <p key={i} className="text-xs mt-1 text-[var(--text-secondary)]">{issue}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiDiffChecker() {
  const [oldSpec, setOldSpec] = useState('');
  const [newSpec, setNewSpec] = useState('');
  const [result, setResult] = useState<{ added: string[]; removed: string[]; common: number } | null>(null);
  const calc = () => {
    try {
      const old = JSON.parse(oldSpec || '{}');
      const fresh = JSON.parse(newSpec || '{}');
      const oldPaths = Object.keys(old.paths || {});
      const newPaths = Object.keys(fresh.paths || {});
      setResult({
        added: newPaths.filter(p => !oldPaths.includes(p)),
        removed: oldPaths.filter(p => !newPaths.includes(p)),
        common: oldPaths.filter(p => newPaths.includes(p)).length,
      });
    } catch { setResult(null); }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Diff Checker</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Old Spec</label>
            <textarea value={oldSpec} onChange={e => setOldSpec(e.target.value)} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" placeholder='{"paths":{"/users":{"get":{}}}}' />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">New Spec</label>
            <textarea value={newSpec} onChange={e => setNewSpec(e.target.value)} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" placeholder='{"paths":{"/users":{"get":{}},"/posts":{"get":{}}}}' />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Compare Specs</button>
        {result && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase">Added</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">+{result.added.length}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">Removed</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">-{result.removed.length}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Common</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{result.common}</p>
              </div>
            </div>
            {result.added.length > 0 && <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Added Endpoints</p>
              {result.added.map(p => <p key={p} className="text-xs font-mono text-green-500">+ {p}</p>)}
            </div>}
            {result.removed.length > 0 && <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Removed Endpoints</p>
              {result.removed.map(p => <p key={p} className="text-xs font-mono text-red-400">- {p}</p>)}
            </div>}
          </div>
        )}
      </div>
    </div>
  );
}

export function ApiDocsGenerator() {
  const [spec, setSpec] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'Sample API', s: '{"openapi":"3.0.0","info":{"title":"My API","version":"1.0.0","description":"A sample API"},"paths":{"/users":{"get":{"summary":"List users","parameters":[{"name":"page","in":"query","schema":{"type":"integer"},"required":false}]}},"/users/{id}":{"get":{"summary":"Get user by ID"}}}}' },
  ];
  const calc = () => {
    try {
      const s = JSON.parse(spec || '{}');
      const title = s.info?.title || 'API';
      const version = s.info?.version || '1.0.0';
      const desc = s.info?.description || '';
      const paths = Object.entries(s.paths || {});
      let md = `# ${title} v${version}\n\n${desc ? desc + '\n\n' : ''}`;
      for (const [path, methods] of paths) {
        for (const [method, detail] of Object.entries(methods as Record<string, any>)) {
          const d = detail as any;
          const summary = d.summary || method.toUpperCase();
          md += `## ${method.toUpperCase()} \`${path}\`\n\n${summary}\n\n`;
          if (d.parameters?.length) {
            md += '### Parameters\n\n| Name | In | Type | Required |\n|------|-----|------|----------|\n';
            for (const p of d.parameters) {
              md += `| ${p.name} | ${p.in} | ${p.schema?.type || 'string'} | ${p.required ? 'Yes' : 'No'} |\n`;
            }
            md += '\n';
          }
        }
      }
      if (!paths.length) md += '_No endpoints defined._\n';
      setResult(md);
    } catch { setResult('Invalid JSON. Paste a valid OpenAPI spec.'); }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">API Docs Generator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setSpec(p.s); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-blue-400 text-[var(--text-secondary)] hover:text-blue-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">OpenAPI Spec (JSON)</label>
          <textarea value={spec} onChange={e => { setSpec(e.target.value); setResult(''); }} rows={6} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Docs</button>
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

export function ConventionalCommitGenerator() {
  const [type, setType] = useState('feat');
  const [scope, setScope] = useState('api');
  const [message, setMessage] = useState('add user list pagination');
  const [breaking, setBreaking] = useState('');
  const [body, setBody] = useState('');
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const presets = [
    { label: 'Feature', t: 'feat', s: 'api', m: 'add user list pagination', b: '' },
    { label: 'Bug Fix', t: 'fix', s: 'auth', m: 'handle token refresh race condition', b: '' },
    { label: 'Breaking', t: 'feat', s: 'core', m: 'migrate to new caching layer', b: 'old cache API deprecated' },
  ];
  const calc = () => {
    const scopeStr = scope ? `(${scope})` : '';
    const breakingStr = breaking ? `!\n\nBREAKING CHANGE: ${breaking}` : '';
    const bodyStr = body ? `\n\n${body}` : '';
    setResult(`${type}${scopeStr}${breakingStr}: ${message}${bodyStr}`);
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Conventional Commit Generator</h2>
        <div className="flex flex-wrap gap-1.5">
          {presets.map(p => (
            <button key={p.label} onClick={() => { setType(p.t); setScope(p.s); setMessage(p.m); setBreaking(p.b); setResult(''); }}
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-blue-400 text-[var(--text-secondary)] hover:text-blue-600 transition-colors">{p.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Type</label>
            <select value={type} onChange={e => { setType(e.target.value); setResult(''); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs">
              <option value="feat">feat</option><option value="fix">fix</option><option value="docs">docs</option>
              <option value="style">style</option><option value="refactor">refactor</option><option value="perf">perf</option>
              <option value="test">test</option><option value="chore">chore</option><option value="ci">ci</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Scope</label>
            <input type="text" value={scope} onChange={e => setScope(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Description</label>
          <input type="text" value={message} onChange={e => setMessage(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Breaking Change</label>
          <input type="text" value={breaking} onChange={e => setBreaking(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Body</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={2} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs" />
        </div>
        <button onClick={calc} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Commit</button>
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto break-all">{result}</pre>
            <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
