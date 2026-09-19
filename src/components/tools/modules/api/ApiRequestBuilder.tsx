"use client";
import { useState } from 'react';
import { clipboardWrite } from "@/lib/clipboard";


export default function ApiRequestBuilder() {
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
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
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
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${method === m ? 'bg-[var(--accent-ink)] text-white shadow-sm' : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="lbl-apirequestbuilder-url" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">API endpoint URL</label>
            <input id="lbl-apirequestbuilder-url" aria-label="API endpoint URL" type="text" value={url} onChange={e => setUrl(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <div>
          <label htmlFor="lbl-apirequestbuilder-headers-one-per-line" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Headers (one per line)</label>
          <textarea id="lbl-apirequestbuilder-headers-one-per-line" aria-label="Headers (one per line)" value={headers} onChange={e => setHeaders(e.target.value)} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        {method !== 'GET' && (
          <div>
            <label htmlFor="lbl-apirequestbuilder-body" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Body</label>
            <textarea id="lbl-apirequestbuilder-body" aria-label="Body" value={body} onChange={e => setBody(e.target.value)} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        )}
        <button onClick={calc} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate cURL</button>
        {result && (
          <div className="relative">
            <pre className="bg-gray-900 text-green-700 dark:text-green-400 rounded-xl p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all max-h-48">{result}</pre>
            <button onClick={() => { void clipboardWrite(result); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
