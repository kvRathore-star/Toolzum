"use client";
import { useState } from 'react';

export default function WebhookValidator() {
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
          <label htmlFor="lbl-webhookvalidator-webhook-payload-json" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Webhook Payload (JSON)</label>
          <textarea id="lbl-webhookvalidator-webhook-payload-json" aria-label="Webhook Payload (JSON)" value={payload} onChange={e => { setPayload(e.target.value); setResult(null); }} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
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
