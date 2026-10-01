"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Archive, ArchiveRestore, Inbox, Loader2, Reply } from "lucide-react";
import { AdminSidebar } from "../_components/AdminSidebar";

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

  const openReply = (m: StoredMessage) => {
    const params = new URLSearchParams({
      to: m.email,
      subject: `Re: ${m.label}`,
      messageId: m.id,
    });
    router.push(`/admin/reply?${params.toString()}`);
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
                      onClick={() => setExpandedId(expanded ? null : m.id)}
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
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openReply(m)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--accent-ink)] text-white hover:bg-[var(--accent-hover)] transition-all"
                          >
                            <Reply className="w-3.5 h-3.5" /> Reply
                          </button>
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
