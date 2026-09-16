"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Download, BarChart3, AlertTriangle, TrendingUp, Users, Search, Filter, ArrowUpDown, Zap } from "lucide-react";

interface AnalyticsData {
  topTools7d: { toolSlug: string; toolName: string; category: string; uses: number }[];
  topTools30d: { toolSlug: string; toolName: string; category: string; uses: number }[];
  downloadsByDay: { date: string; count: number; blocked: number }[];
  downloadsByUserType: { userType: string; count: number; blocked: number }[];
  blockedDownloads: { toolSlug: string; category: string; count: number }[];
  missedSearches: { query: string; misses: number }[];
  topDownloadedTools: { toolSlug: string; category: string; count: number }[];
  errorsByDay: { date: string; count: number }[];
  topErrors: { message: string; count: number; lastSeen: string | number | null }[];
  signupsByDay: { date: string; count: number }[];
  pageViewsByDay: { date: string; count: number }[];
  totals: {
    downloads30d: number;
    blocked30d: number;
    toolUsages30d: number;
    errors30d: number;
  };
  funnels?: {
    signupToFirstTool: {
      signups: number; activated: number; activated7d: number; avgSecsToFirst: number | null;
    };
    quotaWallToPro: {
      blockedUsers: number; convertedPro: number; anonBlocks: number; anonDevices: number;
    };
    creditWallToPro: { walledUsers: number; convertedPro: number };
  };
}

type TimeRange = "7d" | "30d";

function MiniBarChart({ data, maxVal, color }: { data: { label: string; value: number }[]; maxVal: number; color: string }) {
  if (!data.length) return <p className="text-xs text-[var(--text-muted)]">No data</p>;
  const max = maxVal || Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="relative w-full flex justify-center">
            <div className="absolute -top-6 px-1.5 py-0.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-[10px] text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {d.value.toLocaleString()}
            </div>
          </div>
          <div
            className={`w-full rounded-t transition-all duration-300 ${color}`}
            style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }}
          />
          <span className="text-[9px] text-[var(--text-muted)] truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function HorizontalBarChart({ items, maxVal, color }: { items: { label: string; value: number; sub?: string }[]; maxVal: number; color: string }) {
  if (!items.length) return <p className="text-xs text-[var(--text-muted)]">No data</p>;
  const max = maxVal || Math.max(...items.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      {items.map((d, i) => (
        <div key={i} className="group">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs text-[var(--text-secondary)] truncate max-w-[60%]">{d.label}</span>
            <span className="text-xs text-[var(--text-muted)] tabular-nums">{d.value.toLocaleString()}{d.sub ? ` ${d.sub}` : ""}</span>
          </div>
          <div className="h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${color}`}
              style={{ width: `${Math.max(2, (d.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatBox({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string; icon: React.ElementType; color: string;
}) {
  return (
    <div className="p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{typeof value === "number" ? value.toLocaleString() : value}</p>
      {sub && <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p>}
    </div>
  );
}

function funnelPct(part: number, whole: number): string {
  if (!whole || whole <= 0) return "—";
  return `${Math.round((part / whole) * 100)}%`;
}

function formatDuration(secs: number | null): string {
  if (secs == null || secs < 0) return "—";
  if (secs < 3600) return `${Math.max(1, Math.round(secs / 60))}m`;
  if (secs < 86400) return `${Math.round(secs / 3600)}h`;
  return `${Math.round(secs / 86400)}d`;
}

function FunnelCard({ title, icon: Icon, color, bar, steps, note }: {
  title: string; icon: React.ElementType; color: string; bar: string;
  steps: { label: string; value: number; base: number }[]; note?: string;
}) {
  return (
    <div className="p-5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-5 h-5 ${color}`} />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
      </div>
      <div className="space-y-3">
        {steps.map((s) => (
          <div key={s.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[var(--text-secondary)]">{s.label}</span>
              <span className="text-xs text-[var(--text-muted)] tabular-nums">
                {s.value.toLocaleString()} · {funnelPct(s.value, s.base)}
              </span>
            </div>
            <div className="h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden">
              {/* NOTE: bar must be a literal class (Tailwind scans source —
                  a runtime "text-"→"bg-" replace generates no CSS). */}
              <div
                className={`h-full rounded-full transition-all duration-500 ${bar}`}
                style={{ width: `${s.base > 0 ? Math.max(2, (s.value / s.base) * 100) : 2}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      {note && <p className="text-[11px] text-[var(--text-muted)] mt-3">{note}</p>}
    </div>
  );
}

export function AnalyticsSection() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState<TimeRange>("30d");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) setData(await res.json());
      else setError(`Error: ${res.status}`);
    } catch {
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount (fetch-then-set, not derived state)
  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  // Day labels are server-normalized, but a null date must never crash the
  // page again (Sep 12 2026: one bad row killed all of /admin/analytics).
  const dayLabel = (date: string | null): string =>
    typeof date === "string" && date.length >= 5 ? date.slice(5) : "—";
  // error_log timestamps are unix seconds (numbers), not ISO strings —
  // .slice() on a number threw "is not a function" (Sep 12 2026).
  const stampLabel = (v: string | number | null): string => {
    if (typeof v === "number") return new Date(v * 1000).toLocaleDateString();
    return typeof v === "string" && v.length >= 10 ? v.slice(0, 10) : "—";
  };
  const topTools = range === "7d" ? data.topTools7d : data.topTools30d;
  const downloadsByDay = data.downloadsByDay;
  const signupsByDay = data.signupsByDay;
  const pageViewsByDay = data.pageViewsByDay;

  return (
    <div className="space-y-6">
      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Downloads (30d)" value={data.totals.downloads30d} icon={Download} color="text-emerald-400" />
        <StatBox label="Blocked (30d)" value={data.totals.blocked30d} sub={`${data.totals.downloads30d > 0 ? Math.round((data.totals.blocked30d / data.totals.downloads30d) * 100) : 0}% of total`} icon={AlertTriangle} color="text-amber-400" />
        <StatBox label="Tool Uses (30d)" value={data.totals.toolUsages30d} icon={BarChart3} color="text-blue-400" />
        <StatBox label="Errors (30d)" value={data.totals.errors30d} icon={AlertTriangle} color="text-red-400" />
      </div>

      {/* Conversion Funnels (#34) — 30d windows; missing keys default (older API shape) */}
      {data.funnels && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FunnelCard
            title="Signup → First Tool"
            icon={Users}
            color="text-blue-400"
            bar="bg-blue-500"
            steps={[
              { label: "Signups", value: data.funnels.signupToFirstTool.signups, base: data.funnels.signupToFirstTool.signups },
              { label: "Used a tool", value: data.funnels.signupToFirstTool.activated, base: data.funnels.signupToFirstTool.signups },
              { label: "Within 7 days", value: data.funnels.signupToFirstTool.activated7d, base: data.funnels.signupToFirstTool.signups },
            ]}
            note={`Median time to first use: ${formatDuration(data.funnels.signupToFirstTool.avgSecsToFirst)}`}
          />
          <FunnelCard
            title="Quota Wall → Pro"
            icon={AlertTriangle}
            color="text-amber-400"
            bar="bg-amber-500"
            steps={[
              { label: "Signed-in users blocked", value: data.funnels.quotaWallToPro.blockedUsers, base: data.funnels.quotaWallToPro.blockedUsers },
              { label: "Pro now", value: data.funnels.quotaWallToPro.convertedPro, base: data.funnels.quotaWallToPro.blockedUsers },
            ]}
            note={`${data.funnels.quotaWallToPro.anonBlocks.toLocaleString()} anon blocks across ${data.funnels.quotaWallToPro.anonDevices.toLocaleString()} devices — unlinkable to signup by design`}
          />
          <FunnelCard
            title="Credit Wall → Pro"
            icon={Zap}
            color="text-violet-400"
            bar="bg-violet-500"
            steps={[
              { label: "Users hitting empty", value: data.funnels.creditWallToPro.walledUsers, base: data.funnels.creditWallToPro.walledUsers },
              { label: "Pro now", value: data.funnels.creditWallToPro.convertedPro, base: data.funnels.creditWallToPro.walledUsers },
            ]}
            note="Empty-credit events with no AI table yet show zeros, not errors"
          />
        </div>
      )}

      {/* Tool Usage */}
      <div className="p-5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Top Tools</h3>
          </div>
          <div className="flex bg-[var(--bg-base)] rounded-lg p-0.5">
            <button
              onClick={() => setRange("7d")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${range === "7d" ? "bg-[var(--accent)] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
            >7d</button>
            <button
              onClick={() => setRange("30d")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${range === "30d" ? "bg-[var(--accent)] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
            >30d</button>
          </div>
        </div>
        <HorizontalBarChart
          items={topTools.map((t) => ({ label: `${t.toolName || t.toolSlug}`, value: t.uses, sub: t.category }))}
          maxVal={topTools[0]?.uses || 0}
          color="bg-[var(--accent)]"
        />
      </div>

      {/* Downloads Over Time */}
      <div className="p-5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Downloads Over Time</h3>
        </div>
        <div className="flex gap-4 h-32">
          <div className="flex-1">
            <p className="text-[10px] text-[var(--text-muted)] mb-1">Allowed</p>
            <MiniBarChart
              data={downloadsByDay.map((d) => ({ label: dayLabel(d.date), value: d.count - d.blocked }))}
              maxVal={Math.max(...downloadsByDay.map((d) => d.count - d.blocked), 1)}
              color="bg-emerald-500"
            />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-[var(--text-muted)] mb-1">Blocked</p>
            <MiniBarChart
              data={downloadsByDay.map((d) => ({ label: dayLabel(d.date), value: d.blocked }))}
              maxVal={Math.max(...downloadsByDay.map((d) => d.blocked), 1)}
              color="bg-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Downloads by User Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">By User Type</h3>
          </div>
          <HorizontalBarChart
            items={data.downloadsByUserType.map((d) => ({ label: d.userType, value: d.count, sub: `${d.blocked} blocked` }))}
            maxVal={data.downloadsByUserType[0]?.count || 0}
            color="bg-blue-500"
          />
        </div>

        <div className="p-5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Most Blocked</h3>
          </div>
          <HorizontalBarChart
            items={data.blockedDownloads.map((d) => ({ label: d.toolSlug, value: d.count, sub: d.category }))}
            maxVal={data.blockedDownloads[0]?.count || 0}
            color="bg-amber-500"
          />
        </div>
      </div>

      {/* Missed searches — zero-result Cmd+K queries; promote repeats to SEARCH_ALIASES */}
      {(data.missedSearches ?? []).length > 0 && (
        <div className="p-5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-violet-400" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Top Missed Searches</h3>
          </div>
          <HorizontalBarChart
            items={data.missedSearches.map((d) => ({ label: d.query, value: d.misses }))}
            maxVal={data.missedSearches[0]?.misses || 0}
            color="bg-violet-500"
          />
        </div>
      )}

      {/* Top Downloaded Tools */}
      {data.topDownloadedTools.length > 0 && (
        <div className="p-5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-violet-400" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Most Downloaded Tools</h3>
          </div>
          <HorizontalBarChart
            items={data.topDownloadedTools.map((d) => ({ label: d.toolSlug, value: d.count, sub: d.category }))}
            maxVal={data.topDownloadedTools[0]?.count || 0}
            color="bg-violet-500"
          />
        </div>
      )}

      {/* Signups & Page Views */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Signups Over Time</h3>
          </div>
          <MiniBarChart
            data={signupsByDay.map((d) => ({ label: dayLabel(d.date), value: d.count }))}
            maxVal={Math.max(...signupsByDay.map((d) => d.count), 1)}
            color="bg-blue-500"
          />
        </div>

        <div className="p-5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Page Views Over Time</h3>
          </div>
          <MiniBarChart
            data={pageViewsByDay.map((d) => ({ label: dayLabel(d.date), value: d.count }))}
            maxVal={Math.max(...pageViewsByDay.map((d) => d.count), 1)}
            color="bg-violet-500"
          />
        </div>
      </div>

      {/* Top Errors */}
      {data.topErrors.length > 0 && (
        <div className="p-5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Top Errors</h3>
          </div>
          <div className="space-y-2">
            {data.topErrors.map((e, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-base)] rounded-lg">
                <span className="text-xs text-[var(--text-secondary)] truncate max-w-[70%]">{e.message}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--text-muted)] tabular-nums">{e.count}x</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{stampLabel(e.lastSeen)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
