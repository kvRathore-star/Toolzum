"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  CheckCircle, 
  RefreshCw, 
  Server, 
  ShieldCheck, 
  Cpu, 
  Network 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SystemStatus {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  latency: string;
  uptime: string;
  status: "operational" | "degraded" | "offline";
  history: boolean[]; // true = operational, false = degraded/offline (for 30 days)
}

const HISTORY_KEY = "toolzum:status-history";
const HISTORY_LEN = 30;

/**
 * Manual incident entries (newest last is fine — matched by "Month YYYY" label).
 * Months without an entry render "No incidents reported this month."
 * Example: { month: "September 2026", text: "API latency spike 14:00–14:40 IST, resolved." }
 */
const MANUAL_INCIDENTS: { month: string; text: string }[] = [];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Rolling 4-month window ending at the current month — advances automatically each month. */
function getIncidentMonths(): { label: string; text: string }[] {
  const now = new Date();
  const out: { label: string; text: string }[] = [];
  for (let back = 0; back < 4; back++) {
    const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    const manual = MANUAL_INCIDENTS.find((m) => m.month === label);
    out.push({ label, text: manual?.text ?? "No incidents reported this month." });
  }
  return out;
}

function loadHistory(): Record<string, boolean[]> {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, boolean[]>;
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed;
  } catch {
    return {};
  }
}

/** Real client-side probes — no side effects, no credit cost, no writes. */
async function probeUrl(url: string, init?: RequestInit): Promise<number> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const t0 = performance.now();
    const res = await fetch(url, { cache: "no-store", signal: ctrl.signal, ...init });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await res.arrayBuffer().catch(() => undefined);
    return performance.now() - t0;
  } finally {
    clearTimeout(timer);
  }
}

function probeLocal(): number {
  // Real micro-benchmark on this device (not a model of anything remote).
  const t0 = performance.now();
  let acc = 0;
  for (let i = 0; i < 200000; i++) acc += Math.sqrt(i) % 7;
  void acc;
  return performance.now() - t0;
}

const PROBES: Record<string, () => Promise<number>> = {
  // Edge static serving (HEAD /, no body).
  cdn: () => probeUrl("/", { method: "HEAD" }),
  // Functions + session-resolution stack (read-only, rate-limit safe).
  auth: () => probeUrl("/api/check-plan"),
  // This device's JS engine.
  sandbox: async () => probeLocal(),
  // Functions + D1 read path (check records nothing).
  "cloud-relay": () => probeUrl("/api/downloads/check"),
};

const BASE_SYSTEMS = [
  { id: "cdn", name: "Global Edge CDN", icon: Network },
  { id: "auth", name: "Auth & Gateway", icon: ShieldCheck },
  { id: "sandbox", name: "Local WASM Sandbox Core", icon: Cpu },
  { id: "cloud-relay", name: "Heavy Cloud Relay API", icon: Server },
];

function formatLatency(id: string, ms: number): string {
  if (id === "sandbox") return `${ms.toFixed(2)}ms (local)`;
  return `${Math.round(ms)}ms`;
}

export default function StatusPage() {
  const [isPinging, setIsPinging] = useState(false);
  const [lastCheck, setLastCheck] = useState<string>("");
  const [systems, setSystems] = useState<SystemStatus[]>(() => {
    // Lazy init (not effect): hydrate check history during first render.
    // loadHistory is SSR-safe (missing localStorage returns {}).
    let stored: Record<string, boolean[]> = {};
    try {
      stored = loadHistory();
    } catch { /* fresh start on corrupt storage */ }
    return BASE_SYSTEMS.map((s) => {
      const hist = (stored[s.id] ?? []).slice(-HISTORY_LEN);
      const okCount = hist.filter(Boolean).length;
      return {
        ...s,
        latency: "—",
        uptime: hist.length > 0 ? `${((okCount / hist.length) * 100).toFixed(2)}%` : "—",
        status: "operational" as const,
        history: hist,
      };
    });
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- set initial "last checked" timestamp on mount
    setLastCheck(new Date().toLocaleTimeString());
  }, []);

  const handlePing = async () => {
    setIsPinging(true);
    const outcomes = await Promise.all(
      BASE_SYSTEMS.map(async (s) => {
        try {
          const ms = await (PROBES[s.id] ?? (async () => { throw new Error("no probe"); }))();
          return { id: s.id, ok: true, latency: formatLatency(s.id, ms) };
        } catch {
          return { id: s.id, ok: false, latency: "unreachable" };
        }
      }),
    );
    setSystems((prev) => {
      const next = prev.map((sys) => {
        const outcome = outcomes.find((o) => o.id === sys.id);
        const ok = outcome?.ok ?? false;
        const history = [...sys.history, ok].slice(-HISTORY_LEN);
        const okCount = history.filter(Boolean).length;
        return {
          ...sys,
          latency: outcome?.latency ?? sys.latency,
          status: (ok ? "operational" : "offline") as SystemStatus["status"],
          history,
          uptime: history.length > 0 ? `${((okCount / history.length) * 100).toFixed(2)}%` : "—",
        };
      });
      try {
        const stored = loadHistory();
        for (const sys of next) stored[sys.id] = sys.history;
        localStorage.setItem(HISTORY_KEY, JSON.stringify(stored));
      } catch { /* private mode — history just won't persist */ }
      return next;
    });
    setLastCheck(new Date().toLocaleTimeString());
    setIsPinging(false);
  };

  // Overall header state derives from the latest live probes — never assumed.
  const checkedCount = systems.filter((s) => s.history.length > 0).length;
  const offlineCount = systems.filter((s) => s.history.length > 0 && s.status !== "operational").length;
  const overall = checkedCount === 0 ? "idle" : offlineCount === 0 ? "ok" : "down";
  const overallCard =
    overall === "ok"
      ? "bg-emerald-700/10 border-emerald-500/20"
      : overall === "down"
        ? "bg-red-700/10 border-red-500/20"
        : "bg-[var(--bg-elevated)] border-[var(--border-subtle)]";
  const overallIcon =
    overall === "ok"
      ? "bg-emerald-700/25 text-emerald-700 dark:text-emerald-400"
      : overall === "down"
        ? "bg-red-700/25 text-red-700 dark:text-red-400"
        : "bg-[var(--bg-overlay)] text-[var(--text-muted)]";
  const overallTitle = overall === "ok"
    ? "All Systems Operational"
    : overall === "down"
      ? "Partial Outage Detected"
      : "Status — Run a Check";
  const overallSub = overall === "ok"
    ? "Toolzum services are running normally. Latency check healthy."
    : overall === "down"
      ? `${offlineCount} of ${checkedCount} checked systems unreachable from your browser.`
      : "Live probes run from your browser — nothing here is sampled data.";

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      
      {/* Background Grids */}
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none opacity-[0.03]">
        <div className="w-full max-w-[1280px] h-full" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Main Status Header Card */}
        <div className={`max-w-4xl mx-auto border rounded-[var(--radius-2xl)] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 ${overallCard}`}>
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${overallIcon}`}>
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white">{overallTitle}</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">{overallSub}</p>
            </div>
          </div>

          <Button 
            onClick={handlePing} 
            disabled={isPinging}
            variant="secondary" 
            className="shrink-0 gap-2 text-xs py-2 px-4 h-auto border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:text-emerald-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? "animate-spin" : ""}`} />
            {isPinging ? "Pinging..." : "Run Infrastructure Ping Check"}
          </Button>
        </div>

        {/* Systems Grid List */}
        <div className="max-w-4xl mx-auto space-y-6 mb-16">
          
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--accent)]" /> Platform Health
            </h2>
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              Last updated: {lastCheck}
            </span>
          </div>

          {systems.map((sys) => {
            const Icon = sys.icon;
            const checked = sys.history.length > 0;
            const ok = checked && sys.status === "operational";
            const dotCls = !checked
              ? "bg-[var(--text-muted)]"
              : ok ? "bg-emerald-400" : "bg-red-400";
            const labelCls = !checked
              ? "text-[var(--text-muted)]"
              : ok
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-red-700 dark:text-red-400";
            const stateLabel = !checked ? "Not checked" : ok ? "Operational" : "Unreachable";
            return (
              <div 
                key={sys.id} 
                className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6"
              >
                {/* Header detail */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-overlay)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)]">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{sys.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full animate-pulse ${dotCls}`} />
                        <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${labelCls}`}>{stateLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-8 text-right sm:text-right">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] tracking-wider">Ping Latency</div>
                      <div className="text-sm font-mono font-semibold text-[var(--text-primary)] mt-0.5">{sys.latency}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] tracking-wider">Uptime (this browser)</div>
                      <div className="text-sm font-mono font-semibold text-[var(--text-primary)] mt-0.5">{sys.uptime}</div>
                    </div>
                  </div>
                </div>

                {/* Status Bar Timeline Grid */}
                <div>
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-2">
                    <span>Oldest check</span>
                    <span>Uptime Timeline (last 30 checks, this browser)</span>
                    <span>Latest</span>
                  </div>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: 30 }, (_, i) => {
                      // history is newest-last; slot i (0 = oldest) maps from the left.
                      const offset = 30 - sys.history.length + i;
                      const val = offset >= 0 ? sys.history[offset] : undefined;
                      const cls = val === undefined
                        ? "bg-[var(--bg-overlay)] border border-[var(--border-subtle)]"
                        : val
                          ? "bg-emerald-700/20 border border-emerald-500/30 hover:bg-emerald-700"
                          : "bg-red-700/20 border border-red-500/30 hover:bg-red-700";
                      const label = val === undefined ? "no check yet" : val ? "reachable" : "unreachable";
                      return (
                        <div
                          key={i}
                          className={`flex-1 h-6 rounded ${cls} hover:scale-y-110 transition-all duration-200`}
                          title={`Check ${30 - i} ago: ${label}`}
                        />
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })}

        </div>

        {/* Incident History List */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-base font-semibold border-b border-[var(--border-subtle)] pb-4 mb-6">Incident History</h3>

          <div className="space-y-6">
            {getIncidentMonths().map((m, i, arr) => (
              <div
                key={m.label}
                className={`relative pl-6 ${i < arr.length - 1 ? "before:absolute before:top-1.5 before:bottom-0 before:left-[3px] before:w-[1px] before:bg-[var(--border-subtle)] pb-4" : ""}`}
              >
                <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-[var(--text-muted)]" />
                <h4 className="text-sm font-semibold text-[var(--text-secondary)]">{m.label}</h4>
                <p className="text-xs text-[var(--text-muted)] mt-1.5">{m.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
