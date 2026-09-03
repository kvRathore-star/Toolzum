"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, Bug, Layers, MessageSquare, ChevronDown, ChevronRight } from "lucide-react";

interface ToolGroup {
  toolSlug: string;
  totalCount: number;
  distinctErrors: number;
  lastSeen: number;
  firstSeen: number;
}

interface SourceGroup {
  source: string;
  totalCount: number;
  distinctErrors: number;
  lastSeen: number;
}

interface ErrorEntry {
  id: string;
  message: string;
  stack: string | null;
  source: string;
  toolSlug: string | null;
  path: string | null;
  count: number;
  firstSeenAt: number;
  lastSeenAt: number;
}

function relativeTime(ts: number | null): string {
  if (!ts) return "never";
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(ts * 1000).toLocaleDateString();
}

function SourceIcon({ source }: { source: string }) {
  const colors: Record<string, string> = {
    "error-boundary": "text-red-400",
    "unhandled": "text-amber-400",
    "promise-rejection": "text-orange-400",
    "tool-error": "text-violet-400",
  };
  return <Bug className={`w-4 h-4 ${colors[source] || "text-[var(--text-muted)]"}`} />;
}

export function ErrorLogsSection() {
  const [activeView, setActiveView] = useState<"tool" | "source" | "message">("tool");
  const [toolGroups, setToolGroups] = useState<ToolGroup[]>([]);
  const [sourceGroups, setSourceGroups] = useState<SourceGroup[]>([]);
  const [messages, setMessages] = useState<ErrorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/error-logs?group=${activeView}&limit=100`);
        if (!res.ok || cancelled) return;
        const data = await res.json() as { groups?: ToolGroup[] | SourceGroup[]; errors?: ErrorEntry[] };
        if (cancelled) return;
        if (activeView === "tool") setToolGroups((data.groups || []) as ToolGroup[]);
        else if (activeView === "source") setSourceGroups((data.groups || []) as SourceGroup[]);
        else setMessages(data.errors || []);
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [activeView]);

  const totalErrors = activeView === "tool"
    ? toolGroups.reduce((sum, g) => sum + g.totalCount, 0)
    : activeView === "source"
    ? sourceGroups.reduce((sum, g) => sum + g.totalCount, 0)
    : messages.reduce((sum, e) => sum + e.count, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Total Errors</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">{totalErrors.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Distinct</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
            {activeView === "tool" ? toolGroups.length : activeView === "source" ? sourceGroups.length : messages.length}
          </p>
        </div>
        <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Affected Tools</span>
          </div>
          <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">{toolGroups.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[var(--bg-surface)] rounded-xl p-1 border border-[var(--border-subtle)] w-fit">
        {[
          { key: "tool" as const, label: "By Tool", icon: Layers },
          { key: "source" as const, label: "By Source", icon: Bug },
          { key: "message" as const, label: "All Errors", icon: MessageSquare },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveView(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 ${
              activeView === tab.key
                ? "bg-[var(--accent)] text-white shadow"
                : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-5 h-5 text-[var(--accent)] animate-spin" />
        </div>
      ) : activeView === "tool" ? (
        <div className="space-y-2">
          {toolGroups.length === 0 ? (
            <p className="text-center text-[var(--text-muted)] py-12">No tool errors recorded yet</p>
          ) : toolGroups.map((g) => (
            <div key={g.toolSlug} className="flex items-center justify-between p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent)]/30 transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Bug className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{g.toolSlug}</p>
                  <p className="text-xs text-[var(--text-muted)]">{g.distinctErrors} distinct error(s)</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{g.totalCount.toLocaleString()}</p>
                <p className="text-xs text-[var(--text-muted)]">last {relativeTime(g.lastSeen)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : activeView === "source" ? (
        <div className="space-y-2">
          {sourceGroups.length === 0 ? (
            <p className="text-center text-[var(--text-muted)] py-12">No errors recorded yet</p>
          ) : sourceGroups.map((g) => (
            <div key={g.source} className="flex items-center justify-between p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <SourceIcon source={g.source} />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{g.source}</p>
                  <p className="text-xs text-[var(--text-muted)]">{g.distinctErrors} distinct</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{g.totalCount.toLocaleString()}</p>
                <p className="text-xs text-[var(--text-muted)]">last {relativeTime(g.lastSeen)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {messages.length === 0 ? (
            <p className="text-center text-[var(--text-muted)] py-12">No errors recorded yet</p>
          ) : messages.map((e) => (
            <div key={e.id} className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--bg-elevated)] transition-colors duration-150 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <SourceIcon source={e.source} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{e.message.slice(0, 120)}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {e.toolSlug && <span className="text-xs text-[var(--accent)]">{e.toolSlug}</span>}
                      <span className="text-xs text-[var(--text-muted)]">{e.source}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-[var(--text-primary)] tabular-nums">{e.count}x</span>
                  {expandedId === e.id ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />}
                </div>
              </button>
              {expandedId === e.id && e.stack && (
                <div className="px-4 pb-4 border-t border-[var(--border-subtle)]">
                  <pre className="mt-3 p-3 bg-[var(--bg-base)] rounded-lg text-xs text-[var(--text-secondary)] font-mono overflow-x-auto whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {e.stack}
                  </pre>
                  <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
                    <span>First: {relativeTime(e.firstSeenAt)}</span>
                    <span>Last: {relativeTime(e.lastSeenAt)}</span>
                    {e.path && <span>Path: {e.path}</span>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
