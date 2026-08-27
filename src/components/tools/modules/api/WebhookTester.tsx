"use client";
import { useState } from 'react';

export default function WebhookTester() {
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
