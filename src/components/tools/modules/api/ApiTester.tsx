"use client";
import { useState } from 'react';

export default function ApiTester() {
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
            <label htmlFor="lbl-apitester-url" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">API endpoint URL</label>
            <input id="lbl-apitester-url" aria-label="API endpoint URL" type="text" value={url} onChange={e => setUrl(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label htmlFor="lbl-apitester-method" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Method</label>
            <select id="lbl-apitester-method" aria-label="Method" value={method} onChange={e => setMethod(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono">
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
