"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2, Reply, Send } from "lucide-react";
import { AdminSidebar } from "../_components/AdminSidebar";

interface ReplyCapability {
  ok?: boolean;
  configured?: boolean;
  from?: string;
  fromName?: string;
}

export default function AdminReplyPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/reply");
        if (res.status === 401 || res.status === 403) {
          router.push("/dashboard");
          return;
        }
        const data = (await res.json()) as ReplyCapability;
        if (alive) setConfigured(!!data.configured);
      } catch {
        if (alive) setConfigured(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [session, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSent("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to.trim())) {
      setError("Enter a valid recipient email address.");
      return;
    }
    if (!subject.trim() || !message.trim()) {
      setError("Subject and message are required.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: to.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; to?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || `Send failed: ${res.status}`);
      setSent(data.to || to.trim());
      setTo("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center gap-3">
            <Reply className="w-6 h-6 text-[var(--accent)]" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reply</h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Answer contact-form messages and other correspondence from inside Toolzum —
            sends through Cloudflare Email Service as{" "}
            <span className="text-[var(--text-primary)]">Toolzum Support &lt;contact@toolzum.com&gt;</span>.
            This is the Gmail-independent path: replies from users still reach your forwarded inbox.
          </p>

          {configured === false && (
            <div role="alert" className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs px-4 py-3">
              Email sending is not configured — set the CLOUDFLARE_API_TOKEN and
              CLOUDFLARE_ACCOUNT_ID Pages secrets (docs/ALERTS.md). Sending will return 503 until then.
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs px-4 py-3">
              {error}
            </div>
          )}
          {sent && (
            <div role="status" className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs px-4 py-3">
              Sent to {sent} as Toolzum Support &lt;contact@toolzum.com&gt;.
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reply-to" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">To</label>
                <input
                  id="reply-to"
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="sender@example.com"
                  autoComplete="off"
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label htmlFor="reply-subject" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Subject</label>
                <input
                  id="reply-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Re: your message to Toolzum"
                  maxLength={120}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
            <div>
              <label htmlFor="reply-message" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Message</label>
              <textarea
                id="reply-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi — thanks for writing in…"
                rows={10}
                maxLength={5000}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] resize-y"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl bg-[var(--accent-ink)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-all"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? "Sending…" : "Send reply"}
              </button>
              <span className="text-xs text-[var(--text-muted)]">
                Up to 10 sends per minute · HTML is stripped automatically
              </span>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
