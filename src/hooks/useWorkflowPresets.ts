"use client";

import { useState, useEffect, useCallback } from 'react';
import { useProStatus } from '@/hooks/useProStatus';

export interface WorkflowPreset {
  id: string;
  name: string;
  toolSlug: string;
  config: Record<string, unknown>;
  createdAt: string;
}

const STORAGE_KEY = 'th_presets';

function loadPresets(): WorkflowPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePresets(presets: WorkflowPreset[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch { /* quota exceeded */ }
}

export function useWorkflowPresets(toolSlug: string) {
  const isPro = useProStatus();
  const [presets, setPresets] = useState<WorkflowPreset[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load presets for this tool slug from localStorage on mount/switch
    setPresets(loadPresets().filter(p => p.toolSlug === toolSlug));
  }, [toolSlug]);

  const savePreset = useCallback((name: string, config: Record<string, unknown>) => {
    if (!isPro) return false;
    const all = loadPresets();
    const newPreset: WorkflowPreset = {
      id: `${Date.now()}`,
      name,
      toolSlug,
      config,
      createdAt: new Date().toISOString(),
    };
    all.push(newPreset);
    savePresets(all);
    setPresets(prev => [...prev, newPreset]);
    return true;
  }, [isPro, toolSlug]);

  const loadPreset = useCallback((id: string): Record<string, unknown> | null => {
    const all = loadPresets();
    const preset = all.find(p => p.id === id && p.toolSlug === toolSlug);
    return preset?.config ?? null;
  }, [toolSlug]);

  const deletePreset = useCallback((id: string) => {
    const all = loadPresets().filter(p => p.id !== id);
    savePresets(all);
    setPresets(prev => prev.filter(p => p.id !== id));
  }, []);

  return { presets, savePreset, loadPreset, deletePreset, isPro };
}
