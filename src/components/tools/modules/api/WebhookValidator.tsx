"use client";
import { useState } from 'react';

export default function WebhookValidator() {
  const [payload, setPayload] = useState('{"id":"evt_123","event":"user.created","data":{"id":1,"name":"John","email":"john@example.com"},"created":"2026-01-01T00:00:00Z"}');
  const [profile, setProfile] = useState<'generic' | 'stripe' | 'github'>('generic');
  const [result, setResult] = useState<{ valid: boolean; issues: string[] } | null>(null);

  // Provider profiles: the old version hardcoded one invented schema
  // (id/event/data/created) and flagged valid Stripe/GitHub webhooks as
  // invalid. Each profile now checks the shape its provider actually sends.
  const calc = () => {
    try {
      const obj = JSON.parse(payload) as Record<string, unknown>;
      const issues: string[] = [];
      if (profile === 'stripe') {
        if (typeof obj.id !== 'string' || !obj.id) issues.push('Missing: id (Stripe event id, e.g. evt_…)');
        if (typeof obj.type !== 'string' || !obj.type) issues.push('Missing: type (Stripe uses `type`, e.g. payment_intent.succeeded)');
        if (obj.object !== 'event') issues.push('Expected: object === "event"');
        if (typeof obj.created !== 'number') issues.push('Expected: created as a Unix timestamp (number)');
        if (typeof obj.data !== 'object' || obj.data === null) issues.push('Missing: data object');
        if (typeof obj.livemode !== 'boolean') issues.push('Suggestion: livemode boolean is usually present');
      } else if (profile === 'github') {
        if (typeof obj.zen !== 'string' && typeof obj.action !== 'string' && typeof obj.ref !== 'string') {
          issues.push('Missing: expected a GitHub field (zen for ping, action, or ref)');
        }
        if (typeof obj.repository !== 'object' || obj.repository === null) issues.push('Missing: repository object');
        if (typeof obj.sender !== 'object' || obj.sender === null) issues.push('Missing: sender object');
      } else {
        if (!obj.id) issues.push('Missing: id');
        if (!obj.event && !obj.type) issues.push('Missing: event (or type) — the event name');
        if (!obj.data && !obj.payload) issues.push('Missing: data (or payload) — the event body');
        const ts = obj.created ?? obj.timestamp ?? obj.sent_at;
        if (ts !== undefined && typeof ts === 'string' && isNaN(Date.parse(ts))) issues.push('Invalid: timestamp is not a parseable date');
        if (ts !== undefined && typeof ts !== 'string' && typeof ts !== 'number') issues.push('Invalid: timestamp should be an ISO string or Unix number');
        const event = obj.event ?? obj.type;
        if (typeof event === 'string' && !event.includes('.') && !event.includes(':')) issues.push('Suggestion: use dot notation for events (e.g., user.created)');
      }
      setResult({ valid: issues.length === 0, issues: issues.length ? issues : ['✓ Payload structure is valid'] });
    } catch {
      setResult({ valid: false, issues: ['Error: Invalid JSON'] });
    }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Webhook Validator</h2>
        <div>
          <label htmlFor="lbl-webhookvalidator-provider-profile" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Provider Profile</label>
          <select id="lbl-webhookvalidator-provider-profile" aria-label="Provider Profile" value={profile} onChange={e => setProfile(e.target.value as 'generic' | 'stripe' | 'github')} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs">
            <option value="generic">Generic (id + event + data)</option>
            <option value="stripe">Stripe (id + type + created)</option>
            <option value="github">GitHub (action/ref + repository)</option>
          </select>
        </div>
        <div>
          <label htmlFor="lbl-webhookvalidator-webhook-payload-json" className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Webhook Payload (JSON)</label>
          <textarea id="lbl-webhookvalidator-webhook-payload-json" aria-label="Webhook Payload (JSON)" value={payload} onChange={e => { setPayload(e.target.value); setResult(null); }} rows={5} className="w-full mt-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono" />
        </div>
        <button onClick={calc} className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]">Validate</button>
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
