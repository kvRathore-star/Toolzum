"use client";

import { Undo2, Redo2, RotateCcw } from 'lucide-react';

interface UndoRedoBarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset?: () => void;
  label?: string;
}

export function UndoRedoBar({ canUndo, canRedo, onUndo, onRedo, onReset, label }: UndoRedoBarProps) {
  return (
    <div className="flex items-center gap-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg p-0.5">
      {label && (
        <span className="px-2 text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
      )}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium rounded-md transition-all disabled:opacity-30 text-[var(--text-muted)] hover:text-[var(--text-primary)] enabled:hover:bg-[var(--bg-elevated)]"
        title="Undo"
      >
        <Undo2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Undo</span>
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium rounded-md transition-all disabled:opacity-30 text-[var(--text-muted)] hover:text-[var(--text-primary)] enabled:hover:bg-[var(--bg-elevated)]"
        title="Redo"
      >
        <Redo2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Redo</span>
      </button>
      {onReset && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium rounded-md transition-all text-[var(--text-muted)] hover:text-red-700 dark:hover:text-red-400 enabled:hover:bg-[var(--bg-elevated)]"
          title="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
