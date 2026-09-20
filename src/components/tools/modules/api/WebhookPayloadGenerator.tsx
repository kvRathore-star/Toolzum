"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";


export default function WebhookPayloadGenerator() {
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
      payload[key!] = generate(type!);
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
              className="px-2.5 py-1 text-[11px] font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">{p.label}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="lbl-webhookpayloadgenerator-event-name" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Event Name</label>
            <input id="lbl-webhookpayloadgenerator-event-name" aria-label="Event Name" type="text" value={event} onChange={e => { setEvent(e.target.value); setResult(''); }} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
          <div>
            <label htmlFor="lbl-webhookpayloadgenerator-fields-key-type" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Fields (key: type)</label>
            <textarea id="lbl-webhookpayloadgenerator-fields-key-type" aria-label="Fields (key: type)" value={fields} onChange={e => { setFields(e.target.value); setResult(''); }} rows={3} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
          </div>
        </div>
        <button onClick={calc} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Generate Payload</button>
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
