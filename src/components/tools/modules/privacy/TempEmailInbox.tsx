"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { Turnstile } from "@marsidev/react-turnstile";
import { Mail, Copy, Trash2, RefreshCw, Clock, Inbox, ChevronRight } from 'lucide-react';

const WORKER_BASE = 'https://toolzum-temp-inbox.kirtivardhan1996.workers.dev';
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
const POLL_MS = 10000;

interface TempMessage {
  sender: string;
  subject: string;
  body: string;
  receivedAt: number;
}

function fmtCountdown(ms: number): string {
  if (ms <= 0) return 'expired';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function TempEmailInbox() {
  const [address, setAddress] = useState('');
  const [expiresAt, setExpiresAt] = useState(0);
  const [messages, setMessages] = useState<TempMessage[]>([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ticking countdown.
  useEffect(() => {
    if (!address) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [address]);

  const fetchInbox = useCallback(async (addr: string) => {
    try {
      const res = await fetch(`${WORKER_BASE}/api/temp-inbox?address=${encodeURIComponent(addr)}`);
      if (res.status === 404) {
        setAddress('');
        setMessages([]);
        toast.error('Address expired — generate a new one.');
        return;
      }
      if (!res.ok) return;
      const data = (await res.json()) as { messages?: TempMessage[]; expiresAt?: number };
      setMessages(data.messages || []);
      if (data.expiresAt) setExpiresAt(data.expiresAt * 1000);
    } catch {
      /* poll best-effort — next tick retries */
    }
  }, []);

  // Auto-refresh inbox while an address is live.
  useEffect(() => {
    if (!address) return;
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchInbox(address), POLL_MS);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [address, fetchInbox]);

  const generate = async () => {
    if (creating) return;
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      toast.error('Please complete the verification first.');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`${WORKER_BASE}/api/temp-address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ captcha: turnstileToken }),
      });
      const data = (await res.json().catch(() => ({}))) as { address?: string; expiresAt?: number; error?: string };
      if (res.ok && data.address && data.expiresAt) {
        setAddress(data.address);
        setExpiresAt(data.expiresAt * 1000);
        setMessages([]);
        setOpenIdx(null);
        setNow(Date.now());
        fetchInbox(data.address);
      } else if (data.error === 'captcha_failed') {
        toast.error('Verification failed — please try again.');
        setTurnstileToken(null);
      } else if (data.error === 'capacity_full') {
        toast.error('All inboxes are busy right now — try again in a few minutes.');
      } else {
        toast.error("Couldn't create an address — please try again.");
      }
    } catch {
      toast.error('Network error — check your connection and try again.');
    } finally {
      setCreating(false);
    }
  };

  const copyAddress = async () => {
    if (!address) return;
    const ok = await clipboardWrite(address);
    if (ok) toast.success('Address copied!');
    else toast.error('Copy blocked by the browser — select the address manually.');
  };

  const destroy = async () => {
    if (!address) return;
    try {
      await fetch(`${WORKER_BASE}/api/temp-inbox?address=${encodeURIComponent(address)}`, { method: 'DELETE' });
    } catch {
      /* best-effort */
    }
    setAddress('');
    setMessages([]);
    setOpenIdx(null);
    toast.success('Address destroyed.');
  };

  const remaining = expiresAt - now;
  const expired = address !== '' && remaining <= 0;

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-500">
      {!address || expired ? (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-8 sm:p-10 text-center space-y-5">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--accent-ink)]/10 rounded-2xl">
            <Mail className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Disposable inbox, live for 60 minutes</h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
              Use it for signups you don&apos;t trust. Inbound only — you can&apos;t send or reply.
              Anyone who guesses the address can read it, so never use it for banking or passwords.
            </p>
          </div>
          {TURNSTILE_SITE_KEY && (
            <div className="flex justify-center">
              <Turnstile
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
              />
            </div>
          )}
          <button
            onClick={generate}
            disabled={creating}
            className="px-8 py-3 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98]"
          >
            {creating ? 'Creating…' : 'Generate Temp Address'}
          </button>
        </div>
      ) : (
        <>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <code className="flex-1 min-w-[200px] bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm font-mono text-[var(--accent)] break-all">
                {address}
              </code>
              <button onClick={copyAddress} aria-label="Copy address" className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-[var(--accent-ink)] text-white hover:bg-[var(--accent-hover)] transition-all">
                <Copy className="w-3.5 h-3.5" /> Copy
              </button>
              <button onClick={destroy} aria-label="Destroy address" className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-all">
                <Trash2 className="w-3.5 h-3.5" /> Destroy
              </button>
            </div>
            <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Expires in <strong className="font-mono text-[var(--text-primary)]">{fmtCountdown(remaining)}</strong>
              </span>
              <button onClick={() => { setLoading(true); fetchInbox(address).finally(() => setLoading(false)); }} className="inline-flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <span className="ml-auto">{messages.length}/50 messages</span>
            </div>
          </div>

          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-5">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 inline-flex items-center gap-2">
              <Inbox className="w-4 h-4 text-[var(--accent)]" /> Inbox {messages.length > 0 && <span className="text-[var(--text-muted)] font-mono">({messages.length})</span>}
            </h3>
            {messages.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No messages yet — send an email to the address above. Auto-refreshes every 10 seconds.</p>
            ) : (
              <div className="space-y-2">
                {messages.map((m, i) => (
                  <div key={`${m.receivedAt}-${i}`} className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenIdx(openIdx === i ? null : i)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--bg-overlay)] transition-colors"
                      aria-expanded={openIdx === i}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{m.subject || '(no subject)'}</p>
                        <p className="text-xs text-[var(--text-muted)] truncate">{m.sender} · {new Date(m.receivedAt * 1000).toLocaleString()}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-[var(--text-muted)] shrink-0 transition-transform ${openIdx === i ? 'rotate-90' : ''}`} />
                    </button>
                    {openIdx === i && (
                      <div className="px-4 py-3 border-t border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                        {m.body || '(empty message)'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
