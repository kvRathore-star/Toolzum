"use client";

import { useCallback, useState } from 'react';

export type PresetValue = string | number | Record<string, unknown>;

export interface Preset<T extends PresetValue = string> {
  label: string;
  value: T;
  description?: string;
}

interface UsePresetsOptions<T extends PresetValue> {
  presets: Preset<T>[];
  onApply: (value: T) => void;
}

export function usePresets<T extends PresetValue = string>({ presets, onApply }: UsePresetsOptions<T>) {
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const apply = useCallback((preset: Preset<T>) => {
    setActivePreset(preset.label);
    onApply(preset.value);
  }, [onApply]);

  return { presets, activePreset, apply };
}

interface PresetBarProps<T extends PresetValue> {
  presets: Preset<T>[];
  activePreset: string | null;
  onApply: (preset: Preset<T>) => void;
}

export function PresetBar<T extends PresetValue = string>({
  presets,
  activePreset,
  onApply,
}: PresetBarProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => (
        <button
          key={preset.label}
          onClick={() => onApply(preset)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
            activePreset === preset.label
              ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
              : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--border-default)]'
          }`}
          title={preset.description}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
