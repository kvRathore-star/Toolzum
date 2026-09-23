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
  // Widget remount key: Turnstile tokens are single-use server-side, so a
  // spent token must never linger behind a green checkbox — remount after
  // every attempt (success or fail) to force a fresh human check.
  const [tsKey, setTsKey] = useState(0);
  const resetCaptcha = () => {
    setTurnstileToken(null);
    setTsKey((k) => k + 1);
  };
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

  const generate = async (): Promise<boolean> => {
    if (creating) return false;
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      toast.error('Please complete the verification first.');
      return false;
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
        return true;
      } else if (data.error === 'captcha_failed') {
        toast.error('Verification failed — complete the fresh check below and try again.');
      } else if (data.error === 'capacity_full') {
        toast.error('All inboxes are busy right now — try again in a few minutes.');
      } else {
        toast.error("Couldn't create an address — please try again.");
      }
    } catch {
      toast.error('Network error — check your connection and try again.');
    } finally {
      // Token is spent either way — remount for a visibly fresh checkbox.
      resetCaptcha();
      setCreating(false);
    }
    return false;
  };

  const copyAddress = async () => {
    if (!address) return;
    const ok = await clipboardWrite(address);
    if (ok) toast.success('Address copied!');
    else toast.error('Copy blocked by the browser — select the address manually.');
  };

  // Server-side retire without touching UI state — used when a fresh
  // address already replaced the old one on screen.
  const retireAddress = async (addr: string) => {
    try {
      await fetch(`${WORKER_BASE}/api/temp-inbox?address=${encodeURIComponent(addr)}`, { method: 'DELETE' });
    } catch {
      /* best-effort */
    }
  };

  const destroy = async (silent = false) => {
    if (!address) return;
    await retireAddress(address);
    setAddress('');
    setMessages([]);
    setOpenIdx(null);
    if (!silent) toast.success('Address destroyed.');
  };

  // Change email = mint the fresh address FIRST, retire the old one only
  // on success. The old flow destroyed first, then hit the spent-captcha
  // wall — dumping a live inbox back to the verification screen.
  const newAddress = async () => {
    if (creating) return;
    const prev = address;
    const ok = await generate();
    if (ok && prev) await retireAddress(prev);
  };

  const copyBody = async (body: string) => {
    const ok = await clipboardWrite(body);
    if (ok) toast.success('Message copied — paste your code where asked.');
    else toast.error('Copy blocked by the browser — select the text manually.');
  };

  const remaining = expiresAt - now;
  const expired = address !== '' && remaining <= 0;

  // The verification widget must exist wherever an address can be minted —
  // previously it only rendered in the empty state, so "New address" on a
  // live inbox always bounced off the spent-token wall back to this screen.
  const verifyBlock = TURNSTILE_SITE_KEY ? (
    <div className="flex justify-center">
      <Turnstile
        key={tsKey}
        siteKey={TURNSTILE_SITE_KEY}
        onSuccess={(token) => setTurnstileToken(token)}
        onExpire={() => setTurnstileToken(null)}
      />
    </div>
  ) : null;

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
          {verifyBlock}
          <button
            onClick={() => generate()}
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
              <button onClick={() => destroy()} aria-label="Destroy address" className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-all">
                <Trash2 className="w-3.5 h-3.5" /> Destroy
              </button>
              <button onClick={newAddress} aria-label="Get a new address" title="Destroy this address and generate a fresh one" className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
                <RefreshCw className="w-3.5 h-3.5" /> New address
              </button>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--bg-overlay)] overflow-hidden" role="progressbar" aria-label="Time remaining" aria-valuenow={Math.max(0, Math.round(remaining / 1000))} aria-valuemin={0} aria-valuemax={3600}>
              <div className="h-full bg-[var(--accent)] transition-all duration-1000" style={{ width: `${Math.max(0, Math.min(100, (remaining / 3600000) * 100))}%` }} />
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

          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-5 space-y-3">
            <p className="text-xs text-[var(--text-secondary)] text-center">
              Want a different address? Complete the check, then press <strong>New address</strong> — your current inbox stays live until the fresh one lands.
            </p>
            {verifyBlock}
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
                      <div className="px-4 py-3 border-t border-[var(--border-subtle)]">
                        <div className="flex justify-end mb-2">
                          <button onClick={() => copyBody(m.body)} aria-label="Copy message text" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                            <Copy className="w-3 h-3" /> Copy text
                          </button>
                        </div>
                        <div className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
                          {m.body || '(empty message)'}
                        </div>
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
