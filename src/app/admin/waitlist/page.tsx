"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Bell, Loader2, Send } from "lucide-react";
import { AdminSidebar } from "../_components/AdminSidebar";

interface WaitlistRow {
  tool: string;
  pending: number;
  notified: number;
}

interface BroadcastResult {
  ok?: boolean;
  sent?: number;
  failed?: number;
  remaining?: number;
  error?: string;
}

export default function AdminWaitlistPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [rows, setRows] = useState<WaitlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("");
  const [link, setLink] = useState("");
  const [sending, setSending] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, BroadcastResult>>({});

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notify-waitlist");
      if (res.status === 403 || res.status === 401) {
        router.push("/dashboard");
        return;
      }
      if (!res.ok) throw new Error(`Waitlist API error: ${res.status}`);
      const data = (await res.json()) as { tools: WaitlistRow[] };
      setRows(data.tools || []);
    } catch {
      setError("Failed to load waitlist");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!session) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount (fetch-then-set, not derived state)
    load();
  }, [session, load]);

  const broadcast = async (tool: string) => {
    if (!subject.trim() || !link.trim()) {
      setError("Subject and link are required for every broadcast.");
      return;
    }
    if (!window.confirm(`Email ${rows.find((r) => r.tool === tool)?.pending ?? 0} people waiting on "${tool}"?`)) return;
    setSending(tool);
    setError("");
    try {
      const params = new URLSearchParams({ tool, subject: subject.trim(), link: link.trim() });
      const res = await fetch(`/api/admin/notify-broadcast?${params}`);
      const data = (await res.json()) as BroadcastResult;
      if (!res.ok || !data.ok) throw new Error(data.error || `Broadcast failed: ${res.status}`);
      setResult((prev) => ({ ...prev, [tool]: data }));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : `Failed to broadcast to ${tool}`);
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-[var(--accent)]" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Launch Waitlist</h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Emails collected from ComingSoon tool pages and the extension waitlist.
            Broadcasts send in batches of 25 — re-run until pending hits zero.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="broadcast-subject" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Email subject</label>
              <input
                id="broadcast-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="It's live: JWT Signer is here"
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label htmlFor="broadcast-link" className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Tool link (toolzum.com only)</label>
              <input
                id="broadcast-link"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://toolzum.com/developer/jwt-debugger/"
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          {error && (
            <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs px-4 py-3">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading waitlist…
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No waitlist signups yet.</p>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => (
                <div key={row.tool} className="flex flex-wrap items-center gap-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4">
                  <div className="flex-1 min-w-[160px]">
                    <p className="font-mono text-sm text-[var(--text-primary)]">{row.tool}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {row.pending} pending · {row.notified} notified
                    </p>
                    {result[row.tool]?.sent !== undefined && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        Sent {result[row.tool]?.sent}, failed {result[row.tool]?.failed}, {result[row.tool]?.remaining} remaining
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => broadcast(row.tool)}
                    disabled={sending === row.tool || row.pending === 0}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--accent-ink)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-all"
                  >
                    {sending === row.tool ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {sending === row.tool ? "Sending…" : "Broadcast"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
