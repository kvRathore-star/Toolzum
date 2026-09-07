"use client";
import { useState } from 'react';

export default function SoapApiTester() {
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
          <input aria-label="WSDL URL" type="text" value={wsdl} onChange={e => setWsdl(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Method</label>
            <input aria-label="Method" type="text" value={method} onChange={e => setMethod(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">XML Parameters</label>
            <textarea aria-label="XML Parameters" value={params} onChange={e => setParams(e.target.value)} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
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
