"use client";

import { useState, useEffect, useRef } from "react";

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
  } catch (e) {
    console.error("[toolzum]", e);
    return [];
  }
}

function writeHistory(entries: ToolHistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error("[toolzum]", e);
  }
}

export function useToolHistory() {
  const [history, setHistory] = useState<ToolHistoryEntry[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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
