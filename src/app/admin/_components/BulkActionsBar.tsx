"use client";

import React from "react";
import { X, Trash2, ShieldOff, ShieldCheck } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  bulkAction: "ban" | "unban" | "delete" | null;
  onBan: () => void;
  onUnban: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export function BulkActionsBar({ selectedCount, bulkAction, onBan, onUnban, onDelete, onClear }: BulkActionsBarProps) {
  if (selectedCount === 0) return null;
  const busy = bulkAction !== null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[var(--bg-elevated)]/95 backdrop-blur-xl border border-[var(--border-subtle)] rounded-2xl shadow-2xl shadow-black/20 px-6 py-3 flex items-center gap-4 text-sm animate-slide-up">
      <span className="font-medium text-[var(--text-primary)] tabular-nums">{selectedCount} selected</span>
      <span className="text-[var(--border-subtle)]">|</span>
      <button onClick={onBan} disabled={busy} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50 transition-all duration-200 active:scale-95">
        <ShieldOff className="w-3.5 h-3.5" /> Ban
      </button>
      <button onClick={onUnban} disabled={busy} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50 transition-all duration-200 active:scale-95">
        <ShieldCheck className="w-3.5 h-3.5" /> Unban
      </button>
      <button onClick={onDelete} disabled={busy} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50 transition-all duration-200 active:scale-95">
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
      <button onClick={onClear} className="p-1.5 hover:bg-[var(--bg-surface)] rounded-lg cursor-pointer transition-all duration-200"><X className="w-4 h-4 text-[var(--text-muted)]" /></button>
    </div>
  );
}
