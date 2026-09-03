"use client";

import React from "react";
import { X } from "lucide-react";

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
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl px-6 py-3 flex items-center gap-4 text-sm">
      <span className="font-medium text-[var(--text-primary)]">{selectedCount} selected</span>
      <span className="text-[var(--border-subtle)]">|</span>
      <button onClick={onBan} disabled={bulkAction !== null} className="px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50">Ban</button>
      <button onClick={onUnban} disabled={bulkAction !== null} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50">Unban</button>
      <button onClick={onDelete} disabled={bulkAction !== null} className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50">Delete</button>
      <button onClick={onClear} className="p-1 hover:bg-[var(--bg-surface)] rounded-lg cursor-pointer"><X className="w-4 h-4 text-[var(--text-muted)]" /></button>
    </div>
  );
}
