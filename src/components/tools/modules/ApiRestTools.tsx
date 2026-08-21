"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { inputClass, labelClass, btnClass, cardClass, headingClass, resultClass } from './ApiTools.shared';

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
            <pre className="bg-gray-900 text-green-700 dark:text-green-400 rounded-xl p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all max-h-48">{result}</pre>
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
              <span className={`text-3xl font-black ${info.color === 'green' ? 'text-green-500' : info.color === 'yellow' ? 'text-yellow-500' : info.color === 'blue' ? 'text-blue-700 dark:text-blue-400' : 'text-red-500'}`}>{result}</span>
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
              <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{result.size < 1024 ? `${result.size} B` : `${(result.size / 1024).toFixed(2)} KB`}</p>
              <div className="mt-2 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(result.size / maxKey) * 100}%` }} /></div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-4 border border-[var(--border-subtle)]">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Total Keys</p>
              <p className="text-xl font-bold text-emerald-500">{result.keys}</p>
              <div className="mt-2 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-700 rounded-full transition-all" style={{ width: `${(result.keys * 10 / maxKey) * 100}%` }} /></div>
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
        <button onClick={calc} className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate</button>
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
        <button onClick={calc} className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate</button>
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
        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-700 dark:text-amber-400 text-xs">
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
                { label: 'Database', value: result.dbBudget, color: 'bg-emerald-700', pct: 40 },
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
                <p className="text-xl font-bold text-blue-700 dark:text-blue-400">{result.totalPages}</p>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Offset</p>
                <p className="text-xl font-bold text-emerald-500">{result.offset}</p>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Has Next</p>
                <p className={`text-lg font-bold ${result.hasNext ? 'text-green-500' : 'text-red-700 dark:text-red-400'}`}>{result.hasNext ? '✓' : '✗'}</p>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Has Prev</p>
                <p className={`text-lg font-bold ${result.hasPrev ? 'text-green-500' : 'text-red-700 dark:text-red-400'}`}>{result.hasPrev ? '✓' : '✗'}</p>
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
              {result.removed.map(p => <p key={p} className="text-xs font-mono text-red-700 dark:text-red-400">- {p}</p>)}
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
