"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Navigation history (recently used tools) ──────────────────────────────

const STORAGE_KEY = "th_tool_history";

export interface ToolHistoryEntry {
  slug: string;
  name: string;
  category: string;
  timestamp: number;
}

function readHistory(): ToolHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: ToolHistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

export function useToolHistory() {
  const [history, setHistory] = useState<ToolHistoryEntry[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate recently-used tools from localStorage on mount
    setHistory(readHistory());
  }, []);

  const recordTool = (slug: string, name: string, category: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const entries = readHistory().filter(e => e.slug !== slug);
      entries.unshift({ slug, name, category, timestamp: Date.now() });
      const trimmed = entries.slice(0, 5);
      writeHistory(trimmed);
      setHistory(trimmed);
    }, 300);
  };

  const clearHistory = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    writeHistory([]);
    setHistory([]);
  };

  return { history, recordTool, clearHistory };
}

// ─── Undo/redo state management ─────────────────────────────────────────────

interface UndoEntry<T> {
  state: T;
  label: string;
}

export function useUndoHistory<T>(initialState: T, maxEntries = 50) {
  const [past, setPast] = useState<UndoEntry<T>[]>([{ state: initialState, label: "Initial" }]);
  const [future, setFuture] = useState<UndoEntry<T>[]>([]);
  const [index, setIndex] = useState(0);
  const locking = useRef(false);

  const pushState = useCallback((state: T, label: string) => {
    if (locking.current) return;
    setPast(prev => {
      const next = [...prev.slice(0, index + 1), { state, label }];
      if (next.length > maxEntries) next.shift();
      return next;
    });
    setIndex(prev => Math.min(prev + 1, maxEntries - 1));
    setFuture([]);
  }, [index, maxEntries]);

  const undo = useCallback((): T | null => {
    if (index <= 0) return null;
    locking.current = true;
    const newIdx = index - 1;
    setIndex(newIdx);
    setFuture(prev => [past[index], ...prev]);
    setTimeout(() => { locking.current = false; }, 0);
    return past[newIdx].state;
  }, [index, past]);

  const redo = useCallback((): T | null => {
    if (future.length === 0) return null;
    locking.current = true;
    const entry = future[0];
    setFuture(prev => prev.slice(1));
    setIndex(prev => prev + 1);
    setPast(prev => [...prev, entry]);
    setTimeout(() => { locking.current = false; }, 0);
    return entry.state;
  }, [future]);

  const reset = useCallback((state: T) => {
    setPast([{ state, label: "Reset" }]);
    setFuture([]);
    setIndex(0);
  }, []);

  return {
    pushState, undo, redo, reset,
    canUndo: index > 0,
    canRedo: future.length > 0,
    past, future, index,
  };
}
