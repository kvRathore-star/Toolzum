"use client";

import { Sparkles } from 'lucide-react';

export interface PresetOption {
  label: string;
  description?: string;
}

interface ToolPresetBarProps {
  presets: PresetOption[];
  onSelect: (preset: PresetOption) => void;
  activeLabel?: string | null;
}

export function ToolPresetBar({ presets, onSelect, activeLabel }: ToolPresetBarProps) {
  if (!presets.length) return null;

  return (
    <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        <Sparkles className="w-3 h-3" />
        <span>Try an example</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onSelect(preset)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              activeLabel === preset.label
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-default)] hover:text-[var(--text-primary)]'
            }`}
            title={preset.description}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
