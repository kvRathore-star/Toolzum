"use client";

import React from "react";
import { X, Trash2, ShieldOff, ShieldCheck, Crown, ArrowUp } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  bulkAction: "ban" | "unban" | "delete" | "upgrade-pro" | "downgrade-free" | null;
  onBan: () => void;
  onUnban: () => void;
  onDelete: () => void;
  onUpgradePro: () => void;
  onDowngradeFree: () => void;
  onClear: () => void;
}

export function BulkActionsBar({ selectedCount, bulkAction, onBan, onUnban, onDelete, onUpgradePro, onDowngradeFree, onClear }: BulkActionsBarProps) {
  if (selectedCount === 0) return null;
  const busy = bulkAction !== null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[var(--bg-elevated)]/95 backdrop-blur-xl border border-[var(--border-subtle)] rounded-2xl shadow-2xl shadow-black/20 px-6 py-3 flex items-center gap-3 text-sm animate-slide-up">
      <span className="font-medium text-[var(--text-primary)] tabular-nums">{selectedCount} selected</span>
      <span className="text-[var(--border-subtle)]">|</span>
      <button onClick={onUpgradePro} disabled={busy} className="flex items-center gap-1.5 px-3 py-2 bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50 transition-all duration-200 active:scale-95 min-h-[44px]">
        <Crown className="w-3.5 h-3.5" /> Upgrade Pro
      </button>
      <button onClick={onDowngradeFree} disabled={busy} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50 transition-all duration-200 active:scale-95 min-h-[44px]">
        <ArrowUp className="w-3.5 h-3.5 rotate-180" /> Downgrade Free
      </button>
      <button onClick={onBan} disabled={busy} className="flex items-center gap-1.5 px-3 py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50 transition-all duration-200 active:scale-95 min-h-[44px]">
        <ShieldOff className="w-3.5 h-3.5" /> Ban
      </button>
      <button onClick={onUnban} disabled={busy} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50 transition-all duration-200 active:scale-95 min-h-[44px]">
        <ShieldCheck className="w-3.5 h-3.5" /> Unban
      </button>
      <button onClick={onDelete} disabled={busy} className="flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50 transition-all duration-200 active:scale-95 min-h-[44px]">
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
      <button onClick={onClear} aria-label="Clear selection" className="p-2 hover:bg-[var(--bg-surface)] rounded-lg cursor-pointer transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"><X className="w-4 h-4 text-[var(--text-muted)]" /></button>
    </div>
  );
}
