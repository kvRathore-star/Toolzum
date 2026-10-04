"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Archive, ArchiveRestore, Inbox, Loader2, Paperclip, Send, X } from "lucide-react";
import { AdminSidebar } from "../_components/AdminSidebar";
import { filesToAttachments } from "@/lib/attachClient";

type MessageStatus = "new" | "replied" | "archived";

interface StoredMessage {
  id: string;
  name: string;
  email: string;
  category: string;
  label: string;
  message: string;
  status: string;
  createdAt: number;
}

interface ThreadAtt {
  name: string;
  mime: string;
  size: number;
  url: string | null;
}

interface ThreadMsg {
  id: string;
  direction: "in" | "out";
  sender: string;
  body: string;
  createdAt: number;
  attachments: ThreadAtt[];
}

type Filter = "all" | MessageStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "replied", label: "Replied" },
  { key: "archived", label: "Archived" },
];

const STATUS_BADGE: Record<string, string> = {
  new: "bg-[var(--accent)]/15 text-[var(--accent)]",
  replied: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  archived: "bg-[var(--bg-elevated)] text-[var(--text-muted)]",
};

function formatDate(unixSeconds: number): string {
  try {
    return new Date(unixSeconds * 1000).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "";
  }
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminInboxPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [unread, setUnread] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [thread, setThread] = useState<ThreadMsg[] | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  const load = useCallback(
    async (currentFilter: Filter) => {
      setLoading(true);
      setLoadError("");
      try {
        const qs = currentFilter === "all" ? "" : `?status=${currentFilter}`;
        const res = await fetch(`/api/admin/messages${qs}`);
        if (res.status === 401 || res.status === 403) {
          router.push("/dashboard");
          return;
        }
        const data = (await res.json()) as {
          ok?: boolean;
          messages?: StoredMessage[];
          unread?: number;
        };
        if (!res.ok || !data.ok) throw new Error(`Load failed: ${res.status}`);
        setMessages(data.messages ?? []);
        setUnread(data.unread ?? 0);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load messages");
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    if (!session) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount (fetch-then-set, not derived state)
    void load(filter);
  }, [session, filter, load]);

  const patchStatus = async (id: string, status: MessageStatus) => {
    setBusyId(id);
    setActionError("");
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || `Update failed: ${res.status}`);
      if (expandedId === id && status === "archived") setExpandedId(null);
      await load(filter);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update message");
    } finally {
      setBusyId(null);
    }
  };

  const loadThread = useCallback(async (id: string) => {
    setThreadLoading(true);
    try {
      const res = await fetch(`/api/admin/messages?id=${encodeURIComponent(id)}`);
      if (res.status === 401 || res.status === 403) return;
      const data = (await res.json()) as { ok?: boolean; thread?: ThreadMsg[] };
      setThread(data.ok ? (data.thread ?? []) : []);
    } catch {
      setThread([]);
    } finally {
      setThreadLoading(false);
    }
  }, []);

  const sendReply = async (m: StoredMessage) => {
    const text = replyText.trim();
    if (!text) {
      setActionError("Write a reply first.");
      return;
    }
    setSending(true);
    setActionError("");
    try {
      const attachments = await filesToAttachments(replyFiles);
      const res = await fetch("/api/admin/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: m.email,
          subject: `Re: ${m.label || m.name}`,
          message: text,
          messageId: m.id,
          ...(attachments.length ? { attachments } : {}),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || `Send failed: ${res.status}`);
      setReplyText("");
      setReplyFiles([]);
      await Promise.all([loadThread(m.id), load(filter)]);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to send reply");
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
            <Inbox className="w-6 h-6 text-[var(--accent)]" />
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Inbox</h1>
            {unread > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[var(--accent)] text-white text-xs font-semibold">
                {unread} new
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Contact-form messages are relayed to your forwarded inbox{" "}
            <span className="text-[var(--text-primary)]">and</span> archived here — read and reply
            from one screen. Every reply sends as Toolzum Support &lt;contact@toolzum.com&gt;, so
            correspondents never see your personal address.
          </p>

          <div className="flex gap-2" role="tablist" aria-label="Filter messages">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={filter === f.key}
                onClick={() => {
                  setFilter(f.key);
                  setExpandedId(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  filter === f.key
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {f.label}
                {f.key === "new" && unread > 0 ? ` (${unread})` : ""}
              </button>
            ))}
          </div>

          {actionError && (
            <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs px-4 py-3">
              {actionError}
            </div>
          )}
          {loadError && (
            <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs px-4 py-3 flex items-center justify-between gap-3">
              <span>{loadError}</span>
              <button
                type="button"
                onClick={() => void load(filter)}
                className="font-semibold underline shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] py-8">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading messages…
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-10 text-center text-sm text-[var(--text-muted)]">
              {filter === "all"
                ? "No messages yet — every contact-form submission lands here."
                : `Nothing in "${FILTERS.find((f) => f.key === filter)?.label}" right now.`}
            </div>
          ) : (
            <ul className="space-y-3">
              {messages.map((m) => {
                const expanded = expandedId === m.id;
                const busy = busyId === m.id;
                return (
                  <li
                    key={m.id}
                    className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden"
                  >
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => {
                        const next = expanded ? null : m.id;
                        setExpandedId(next);
                        if (next) {
                          setThread(null);
                          setReplyText("");
                          setReplyFiles([]);
                          void loadThread(next);
                        }
                      }}
                      className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-[var(--bg-elevated)] transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-[var(--text-primary)]">
                            {m.name}
                          </span>
                          <span className="text-xs text-[var(--text-muted)] truncate">
                            {m.email}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-md bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-[11px]">
                            {m.label}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[11px] font-medium ${STATUS_BADGE[m.status] ?? STATUS_BADGE.archived}`}
                          >
                            {m.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[var(--text-secondary)] truncate">
                          {m.message}
                        </p>
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] shrink-0">
                        {formatDate(m.createdAt)}
                      </span>
                    </button>

                    {expanded && (
                      <div className="border-t border-[var(--border-subtle)] px-4 py-4 space-y-4">
                        <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">
                          {m.message}
                        </p>

                        {threadLoading ? (
                          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading conversation…
                          </div>
                        ) : (
                          thread &&
                          thread.length > 0 && (
                            <div className="space-y-2" aria-label={`Conversation with ${m.name}`}>
                              {thread.map((t) => (
                                <div
                                  key={t.id}
                                  className={`rounded-xl px-3 py-2 border ${
                                    t.direction === "out"
                                      ? "ml-6 sm:ml-12 bg-[var(--accent)]/10 border-[var(--accent)]/25"
                                      : "mr-6 sm:mr-12 bg-[var(--bg-elevated)] border-[var(--border-subtle)]"
                                  }`}
                                >
                                  <div className="flex justify-between gap-2 text-[11px] text-[var(--text-muted)]">
                                    <span className="truncate">
                                      {t.direction === "out" ? "You · Toolzum Support" : t.sender}
                                    </span>
                                    <span className="shrink-0">{formatDate(t.createdAt)}</span>
                                  </div>
                                  <p className="mt-1 text-sm text-[var(--text-primary)] whitespace-pre-wrap">
                                    {t.body}
                                  </p>
                                  {t.attachments.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {t.attachments.map((a, i) =>
                                        a.url ? (
                                          <a
                                            key={i}
                                            href={a.url}
                                            download={a.name}
                                            className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                          >
                                            <Paperclip className="w-3 h-3" />
                                            {a.name}
                                            <span className="text-[var(--text-muted)]">
                                              {formatBytes(a.size)}
                                            </span>
                                          </a>
                                        ) : (
                                          <span
                                            key={i}
                                            className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)]"
                                          >
                                            <Paperclip className="w-3 h-3" />
                                            {a.name} (signing unavailable)
                                          </span>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )
                        )}

                        <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                          <label htmlFor={`reply-${m.id}`} className="sr-only">
                            Reply to {m.name}
                          </label>
                          <textarea
                            id={`reply-${m.id}`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={3}
                            placeholder={`Reply to ${m.name}…`}
                            className="w-full rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 resize-y"
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                              <Paperclip className="w-3.5 h-3.5" /> Attach files
                              <input
                                type="file"
                                multiple
                                className="sr-only"
                                onChange={(e) =>
                                  setReplyFiles(e.target.files ? Array.from(e.target.files) : [])
                                }
                              />
                            </label>
                            {replyFiles.map((f, i) => (
                              <span
                                key={`${f.name}-${i}`}
                                className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                              >
                                {f.name}
                                <button
                                  type="button"
                                  aria-label={`Remove ${f.name}`}
                                  onClick={() =>
                                    setReplyFiles((prev) => prev.filter((_, j) => j !== i))
                                  }
                                  className="hover:text-[var(--text-primary)]"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                            <button
                              type="button"
                              disabled={sending || !replyText.trim()}
                              onClick={() => void sendReply(m)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--accent-ink)] text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-all"
                            >
                              {sending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Send className="w-3.5 h-3.5" />
                              )}
                              Send reply
                            </button>
                            <span className="text-[11px] text-[var(--text-muted)]">
                              ≤8 MB per file, max 5 · 12 MB total
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {m.status !== "archived" ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void patchStatus(m.id, "archived")}
                              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-colors"
                            >
                              {busy ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Archive className="w-3.5 h-3.5" />
                              )}
                              Archive
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void patchStatus(m.id, "new")}
                              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 transition-colors"
                            >
                              {busy ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <ArchiveRestore className="w-3.5 h-3.5" />
                              )}
                              Move back to new
                            </button>
                          )}
                          <span className="text-[11px] text-[var(--text-muted)]">
                            From {m.email} · {formatDate(m.createdAt)}
                          </span>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
