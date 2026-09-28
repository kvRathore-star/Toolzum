"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";


export default function SoapApiTester() {
  const [endpoint, setEndpoint] = useState('https://example.com/service');
  const [method, setMethod] = useState('GetUser');
  const [params, setParams] = useState('<userId>123</userId>');
  const [result, setResult] = useState('');
  const [response, setResponse] = useState('');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const buildEnvelope = () => {
    let namespace = 'http://example.com/service';
    try { namespace = new URL(endpoint).origin + '/service'; } catch { /* keep default */ }
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${method} xmlns="${namespace}">
      ${params}
    </${method}>
  </soap:Body>
</soap:Envelope>`;
  };
  const calc = () => {
    setResponse('');
    setResult(buildEnvelope());
  };
  const send = async () => {
    // Real send: POST the envelope as text/xml with a SOAPAction header.
    // The old tool stopped at envelope generation and never touched the
    // network, despite the endpoint input.
    const envelope = buildEnvelope();
    setResult(envelope);
    setSending(true);
    setResponse('');
    try {
      const res = await fetch(endpoint.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: method },
        body: envelope,
      });
      const text = await res.text();
      setResponse(`# Status: ${res.status} ${res.ok ? 'OK' : 'ERROR'}\n\n${text.slice(0, 8000)}`);
    } catch (e) {
      setResponse(`Request failed: ${e instanceof Error ? e.message : 'network error'} (the service may block browser CORS — test CORS-enabled endpoints).`);
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">SOAP API Tester</h2>
        <div>
          <label htmlFor="lbl-soapapitester-wsdl-url" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Service Endpoint URL</label>
          <input id="lbl-soapapitester-wsdl-url" aria-label="Service Endpoint URL" type="text" value={endpoint} onChange={e => setEndpoint(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lbl-soapapitester-method" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Method</label>
            <input id="lbl-soapapitester-method" aria-label="Method" type="text" value={method} onChange={e => setMethod(e.target.value)} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label htmlFor="lbl-soapapitester-xml-parameters" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">XML Parameters</label>
            <textarea id="lbl-soapapitester-xml-parameters" aria-label="XML Parameters" value={params} onChange={e => setParams(e.target.value)} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={calc} className="bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate SOAP Envelope</button>
          <button onClick={send} disabled={sending} className="bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-50">{sending ? 'Sending…' : 'Send Request'}</button>
        </div>
        {response && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-64 whitespace-pre-wrap break-all">{response}</pre>
          </div>
        )}
        {result && (
          <div className="relative">
            <pre className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-xs font-mono overflow-x-auto max-h-64 whitespace-pre-wrap break-all">{result}</pre>
            <button onClick={() => { clipboardWrite(result).then(ok => { if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1500); } else toast.error('Copy blocked by the browser — select the text manually.'); }); }}
              className="absolute top-2 right-2 px-2.5 py-1 text-[10px] bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] rounded-lg transition-colors">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
