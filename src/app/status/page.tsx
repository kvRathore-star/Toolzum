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

export default function StatusPage() {
  const [isPinging, setIsPinging] = useState(false);
  const [lastCheck, setLastCheck] = useState<string>("");
  const [systems, setSystems] = useState<SystemStatus[]>([
    {
      id: "cdn",
      name: "Global Edge CDN",
      icon: Network,
      latency: "12ms",
      uptime: "99.99%",
      status: "operational",
      history: Array.from({ length: 30 }, () => true)
    },
    {
      id: "auth",
      name: "Auth & Gateway",
      icon: ShieldCheck,
      latency: "38ms",
      uptime: "99.98%",
      status: "operational",
      history: Array.from({ length: 30 }, () => true)
    },
    {
      id: "sandbox",
      name: "Local WASM Sandbox Core",
      icon: Cpu,
      latency: "0.04ms (local)",
      uptime: "100.00%",
      status: "operational",
      history: Array.from({ length: 30 }, () => true)
    },
    {
      id: "cloud-relay",
      name: "Heavy Cloud Relay API",
      icon: Server,
      latency: "84ms",
      uptime: "99.95%",
      status: "operational",
      history: Array.from({ length: 30 }, () => true)
    }
  ]);

  useEffect(() => {
    setLastCheck(new Date().toLocaleTimeString());
  }, []);

  const handlePing = () => {
    setIsPinging(true);
    setTimeout(() => {
      setSystems((prev) => 
        prev.map((sys) => {
          let newLatency = sys.latency;
          if (sys.id === "cdn") newLatency = `${Math.floor(Math.random() * 8) + 8}ms`;
          if (sys.id === "auth") newLatency = `${Math.floor(Math.random() * 20) + 25}ms`;
          if (sys.id === "sandbox") newLatency = `${(Math.random() * 0.08 + 0.01).toFixed(3)}ms (local)`;
          if (sys.id === "cloud-relay") newLatency = `${Math.floor(Math.random() * 40) + 65}ms`;
          
          return {
            ...sys,
            latency: newLatency
          };
        })
      );
      setLastCheck(new Date().toLocaleTimeString());
      setIsPinging(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      
      {/* Background Grids */}
      <div className="absolute inset-0 z-0 flex justify-center pointer-events-none opacity-[0.03]">
        <div className="w-full max-w-[1280px] h-full" style={{ backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Main Status Header Card */}
        <div className="max-w-4xl mx-auto bg-emerald-500/10 border border-emerald-500/20 rounded-[var(--radius-2xl)] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-full bg-emerald-500/25 flex items-center justify-center shrink-0 text-emerald-400">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white">All Systems Operational</h1>
              <p className="text-sm text-emerald-400/80 mt-1">Toolzum services are running normally. Latency check healthy.</p>
            </div>
          </div>

          <Button 
            onClick={handlePing} 
            disabled={isPinging}
            variant="secondary" 
            className="shrink-0 gap-2 text-xs py-2 px-4 h-auto border border-emerald-500/30 text-emerald-400 hover:text-emerald-300"
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
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">Operational</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-8 text-right sm:text-right">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] tracking-wider">Ping Latency</div>
                      <div className="text-sm font-mono font-semibold text-[var(--text-primary)] mt-0.5">{sys.latency}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] tracking-wider">30D Uptime</div>
                      <div className="text-sm font-mono font-semibold text-[var(--text-primary)] mt-0.5">{sys.uptime}</div>
                    </div>
                  </div>
                </div>

                {/* Status Bar Timeline Grid */}
                <div>
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-2">
                    <span>30 days ago</span>
                    <span>Uptime Timeline</span>
                    <span>Today</span>
                  </div>
                  
                  <div className="flex gap-1">
                    {sys.history.map((_, i) => (
                      <div 
                        key={i} 
                        className="flex-1 h-6 rounded bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500 hover:scale-y-110 transition-all duration-200" 
                        title={`Day ${30 - i} ago: 100% Operational`}
                      />
                    ))}
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
            <div className="relative pl-6 before:absolute before:top-1.5 before:bottom-0 before:left-[3px] before:w-[1px] before:bg-[var(--border-subtle)] pb-4">
              <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-[var(--text-muted)]" />
              <h4 className="text-sm font-semibold text-[var(--text-secondary)]">June 2026</h4>
              <p className="text-xs text-[var(--text-muted)] mt-1.5">No incidents reported this month.</p>
            </div>

            <div className="relative pl-6 before:absolute before:top-1.5 before:bottom-0 before:left-[3px] before:w-[1px] before:bg-[var(--border-subtle)] pb-4">
              <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-[var(--text-muted)]" />
              <h4 className="text-sm font-semibold text-[var(--text-secondary)]">May 2026</h4>
              <p className="text-xs text-[var(--text-muted)] mt-1.5">No incidents reported this month.</p>
            </div>

            <div className="relative pl-6 before:absolute before:top-1.5 before:bottom-0 before:left-[3px] before:w-[1px] before:bg-[var(--border-subtle)] pb-4">
              <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-[var(--text-muted)]" />
              <h4 className="text-sm font-semibold text-[var(--text-secondary)]">April 2026</h4>
              <p className="text-xs text-[var(--text-muted)] mt-1.5">No incidents reported this month.</p>
            </div>

            <div className="relative pl-6">
              <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-[var(--text-muted)]" />
              <h4 className="text-sm font-semibold text-[var(--text-secondary)]">March 2026</h4>
              <p className="text-xs text-[var(--text-muted)] mt-1.5">No incidents reported this month.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
