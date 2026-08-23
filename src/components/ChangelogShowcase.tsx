"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Play, Pause, FileType, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { clientToolsRegistry } from "@/registry/tools-client-index";

// ─── Batch Fault Tolerance Demo (v1.5.0) ───

function FaultToleranceDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s >= 100 ? 0 : s + 1)), 60);
    return () => clearInterval(t);
  }, []);

  const files = [
    { name: "video_edit.mp4", size: "128 MB", status: step > 20 ? "done" as const : "processing" as const },
    { name: "presentation.mp4", size: "64 MB", status: step > 40 ? "done" as const : "processing" as const },
    { name: "corrupted_file.mp4", size: "0 MB", status: (step > 30 && step < 80) ? "error" as const : step >= 80 ? "skipped" as const : "processing" as const },
    { name: "screen_recording.mp4", size: "256 MB", status: step > 60 ? "done" as const : "processing" as const },
    { name: "tutorial_720p.mp4", size: "85 MB", status: step > 80 ? "done" as const : "processing" as const },
  ];

  return (
    <div className="bg-[var(--bg-base)] rounded-[var(--radius-xl)] border border-[var(--border-subtle)] p-4 sm:p-6 my-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-mono text-[var(--text-muted)]">Fault Tolerance Simulation</span>
      </div>
      <div className="space-y-2">
        {files.map(f => (
          <div key={f.name} className="flex items-center gap-3 text-xs font-mono bg-[var(--bg-elevated)] rounded-lg px-3 py-2 border border-[var(--border-subtle)]">
            <FileType className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
            <span className="flex-1 truncate text-[var(--text-primary)]">{f.name}</span>
            <span className="text-[var(--text-muted)]">{f.size}</span>
            {f.status === "processing" && <Loader2 className="w-3.5 h-3.5 text-[var(--accent)] animate-spin shrink-0" />}
            {f.status === "done" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />}
            {f.status === "error" && <XCircle className="w-3.5 h-3.5 text-red-700 dark:text-red-400 shrink-0" />}
            {f.status === "skipped" && <span className="text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold shrink-0">Skipped</span>}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <span className="inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-700 dark:text-emerald-400" /> 3 completed</span>
        <span className="inline-flex items-center gap-1"><XCircle className="w-3 h-3 text-red-700 dark:text-red-400" /> 1 corrupted (auto-skipped)</span>
        <span className="inline-flex items-center gap-1"><Loader2 className="w-3 h-3 text-[var(--accent)] animate-spin" /> 1 processing</span>
      </div>
    </div>
  );
}

// ─── Batch Processing Visualizer (v1.4.0) ───

function BatchProcessingDemo() {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { setIsPlaying(false); return 100; }
        return p + 1;
      });
    }, 80);
    return () => clearInterval(t);
  }, [isPlaying]);

  return (
    <div className="bg-[var(--bg-base)] rounded-[var(--radius-xl)] border border-[var(--border-subtle)] p-4 sm:p-6 my-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-ink)] animate-pulse" />
          <span className="text-xs font-mono text-[var(--text-muted)]">Batch Processing Simulation</span>
        </div>
        <button onClick={() => setIsPlaying(p => !p)} className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] transition-colors">
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="flex gap-1.5 mb-4">
        {Array.from({ length: 12 }).map((_, i) => {
          const threshold = (i + 1) * (100 / 12);
          const active = progress >= threshold;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full aspect-[3/4] rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden relative">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-[var(--accent-ink)] transition-all duration-100"
                  style={{ height: active ? `${Math.min(100, ((progress - threshold + (100 / 12)) / (100 / 12)) * 100)}%` : "0%" }}
                />
                {active && <div className="absolute inset-0 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /></div>}
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">#{i + 1}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
          <div
            className="h-full bg-gradient-to-r from-[var(--accent)] to-emerald-400 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-mono text-[var(--text-muted)] w-10 text-right">{progress}%</span>
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-[var(--text-muted)]">
        <span>6 parallel threads (Pro)</span>
        <span className="text-[var(--border-subtle)]">|</span>
        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{Math.floor(progress / 8.33)} / 12 files</span>
        <span className="text-[var(--border-subtle)]">|</span>
        <span>Sequential (Free)</span>
      </div>
    </div>
  );
}

// ─── Tool Expansion Counter (v1.2.0) ───

function ToolExpansionDemo() {
  const [count, setCount] = useState(50);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const totalSteps = 200 - 50;
    let step = 0;
    const t = setInterval(() => {
      step++;
      setCount(50 + Math.floor((step / totalSteps) * (200 - 50)));
      if (step >= totalSteps) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [isVisible]);

  const categories = useMemo(() => {
    const map: { label: string; registryCat: string; color: string }[] = [
      { label: "Image", registryCat: "Image", color: "bg-blue-500" },
      { label: "Video", registryCat: "Video", color: "bg-purple-500" },
      { label: "PDF", registryCat: "PDF", color: "bg-rose-500" },
      { label: "Audio", registryCat: "Audio", color: "bg-amber-500" },
      { label: "Dev", registryCat: "Developer", color: "bg-emerald-700" },
      { label: "Finance", registryCat: "Finance", color: "bg-cyan-500" },
      { label: "AI", registryCat: "AI", color: "bg-violet-500" },
      { label: "India", registryCat: "indian-utilities", color: "bg-orange-500" },
    ];
    return map.map(({ label, registryCat, color }) => ({
      label,
      count: clientToolsRegistry.filter(t => t.category === registryCat && t.showInCategory !== false).length,
      color,
    }));
  }, []);

  return (
    <div ref={ref} className="bg-[var(--bg-base)] rounded-[var(--radius-xl)] border border-[var(--border-subtle)] p-4 sm:p-6 my-6">
      <div className="text-center mb-6">
        <div className="text-4xl sm:text-5xl font-bold font-mono text-[var(--accent)] tabular-nums">
          {count}<span className="text-lg text-[var(--text-muted)]">+</span>
        </div>
        <div className="text-xs font-mono text-[var(--text-muted)] mt-1">tools & counting</div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {categories.map(cat => (
          <div key={cat.label} className="text-center p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <div className={`w-2 h-2 rounded-full ${cat.color} mx-auto mb-1`} />
            <div className="text-xs font-semibold text-[var(--text-primary)]">{cat.label}</div>
            <div className="text-[10px] font-mono text-[var(--text-muted)]">{cat.count} tools</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Runner ───

export type DemoType = "fault-tolerance" | "batch-processing" | "tool-expansion";

export default function ChangelogShowcase({ demo }: { demo: DemoType }) {
  return (
    <div className="not-prose">
      {demo === "fault-tolerance" && <FaultToleranceDemo />}
      {demo === "batch-processing" && <BatchProcessingDemo />}
      {demo === "tool-expansion" && <ToolExpansionDemo />}
    </div>
  );
}
