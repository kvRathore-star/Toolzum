"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Turnstile } from "@marsidev/react-turnstile";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export default function ComingSoonTool({ toolName }: { toolName: string }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const slug = toolName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || sending) return;
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setSendError("Please complete the verification first.");
      return;
    }

    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/notify-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), tool: slug || 'unknown-tool', captcha: turnstileToken }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setSubmitted(true);
        setEmail('');
      } else if (res.status === 429) {
        setSendError("Too many requests — please try again in a minute.");
      } else if (data.error === "captcha_failed") {
        setSendError("Verification failed — please try again.");
        setTurnstileToken(null);
      } else {
        setSendError("Couldn't save that — please try again.");
      }
    } catch {
      setSendError("Network error — check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-[var(--accent)]/20 blur-3xl rounded-full" />
        <div className="relative w-24 h-24 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-3xl flex items-center justify-center shadow-2xl">
          <svg className="w-10 h-10 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      
      <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">
        In Development
      </h2>
      
      <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-10 text-lg leading-relaxed">
        We are currently building the <span className="text-[var(--text-primary)] font-semibold">{toolName}</span> module. It will be powered entirely by your browser for maximum privacy.
      </p>

      {submitted ? (
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-2xl p-6 max-w-sm w-full mx-auto backdrop-blur-sm animate-in fade-in zoom-in duration-300">
          <div className="flex items-center justify-center mb-3">
            <div className="w-10 h-10 bg-emerald-700/20 rounded-full flex items-center justify-center text-[var(--accent)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-[var(--accent)] font-semibold mb-1">You're on the list!</h3>
          <p className="text-emerald-500/80 text-sm">We'll notify you the moment this tool goes live.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
          <Input aria-label="Enter your email to get early access" 
            type="email" 
            placeholder="Enter your email to get early access"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] flex-1 h-12 rounded-xl focus-visible:ring-[var(--accent)]"
          />
          <Button type="submit" disabled={sending} className="h-12 px-6 bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white rounded-xl shadow-lg shadow-[var(--accent)]/20 transition-all">
            {sending ? 'Joining…' : 'Notify Me'}
          </Button>
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
        </form>
      )}
      {sendError && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400 mt-3">{sendError}</p>
      )}

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto w-full border-t border-[var(--border-subtle)] dark:border-[var(--border-subtle)] pt-12">
        <div>
          <h4 className="text-[var(--text-primary)] font-medium mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-ink)]"></span> 100% Client-Side
          </h4>
          <p className="text-sm text-[var(--text-secondary)]">Your files will never leave your device. All processing happens in your browser.</p>
        </div>
        <div>
          <h4 className="text-[var(--text-primary)] font-medium mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-700"></span> Zero Data Retention
          </h4>
          <p className="text-sm text-[var(--text-secondary)]">We don't store your files, logs, or processing history on our servers.</p>
        </div>
        <div>
          <h4 className="text-[var(--text-primary)] font-medium mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span> Lightning Fast
          </h4>
          <p className="text-sm text-[var(--text-secondary)]">Powered by WebAssembly for near-native performance directly on your machine.</p>
        </div>
      </div>
    </div>
  );
}
