"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Copy, Download, Clock, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { toast } from "react-hot-toast";
import { clipboardWrite } from "@/lib/clipboard";

interface CalcActionsProps {
  result: string;
  downloadData?: string;
  downloadFilename?: string;
  accent?: string;
}

/** Result action bar: copy button, CSV download, collapsible 20-entry history (debounced 500ms). Use when a tool needs result actions without the full CalculatorShell. */
export function CalcActions({
  result,
  downloadData,
  downloadFilename = "result.csv",
  accent = "indigo",
}: CalcActionsProps) {
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  // Inline SR announcer: toasts alone are missed when dismissed, so every
  // copy/download confirmation is also announced here (key remounts so
  // repeats re-announce).
  const [announce, setAnnounce] = useState<{ id: number; text: string } | null>(null);
  const announceId = useRef(0);
  const say = useCallback((text: string) => {
    announceId.current += 1;
    setAnnounce({ id: announceId.current, text });
  }, []);

  const historyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (result) {
      if (historyTimerRef.current) clearTimeout(historyTimerRef.current);
      const captured = result;
      historyTimerRef.current = setTimeout(() => {
        setHistory((prev) => {
          if (prev[0] === captured) return prev;
          return [captured, ...prev].slice(0, 20);
        });
      }, 500);
    }
    return () => { if (historyTimerRef.current) clearTimeout(historyTimerRef.current); };
  }, [result]);

  const copyResult = useCallback(async () => {
    if (!result) return;
    if (await clipboardWrite(result)) {
      toast.success("Result copied");
      say("Result copied to clipboard");
    } else {
      toast.error("Copy failed — select the result text manually");
      say("Copy failed. Select the result text manually.");
    }
  }, [result, say]);

  const handleDownload = useCallback(() => {
    if (!downloadData) return;
    const blob = new Blob([downloadData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = downloadFilename;
    el.click();
    URL.revokeObjectURL(url);
    toast.success("File downloaded");
    say("File downloaded");
  }, [downloadData, downloadFilename, say]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {announce && (
        <div key={announce.id} role="status" className="sr-only">
          {announce.text}
        </div>
      )}
      {/* Copy button */}
      <button
        onClick={copyResult}
        aria-label="Copy result"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors"
      >
        <Copy size={13} />
        Copy
      </button>

      {/* Download button */}
      {downloadData && (
        <button
          onClick={handleDownload}
          aria-label="Download result"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors"
        >
          <Download size={13} />
          Download
        </button>
      )}

      {/* History toggle */}
      {history.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowHistory(!showHistory)}
            aria-expanded={showHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors"
          >
            <Clock size={13} />
            History ({history.length})
            {showHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {showHistory && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl shadow-lg z-50 max-h-48 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-subtle)]">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">
                  History
                </span>
                <button
                  onClick={() => setHistory([])}
                  className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                >
                  <RotateCcw size={10} />
                  Clear
                </button>
              </div>
              <div className="overflow-y-auto max-h-36">
                {history.map((entry, i) => (
                  <div
                    key={i}
                    className="px-3 py-1.5 border-b border-[var(--border-subtle)] last:border-0 text-xs text-[var(--text-secondary)] font-mono truncate"
                  >
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
