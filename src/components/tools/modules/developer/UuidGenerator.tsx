"use client";

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4, v1 as uuidv1 } from 'uuid';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { clipboardWrite } from "@/lib/clipboard";

type UuidVersion = 'v4' | 'v1';

export default function UuidGenerator() {
  const [version, setVersion] = useState<UuidVersion>('v4');
  const [quantity, setQuantity] = useState(10);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [uuids, setUuids] = useState<string[]>([]);

  const generateUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < quantity; i++) {
      let id = version === 'v4' ? uuidv4() : uuidv1();
      
      if (!hyphens) {
        id = id.replace(/-/g, '');
      }
      if (uppercase) {
        id = id.toUpperCase();
      }
      list.push(id);
    }
    setUuids(list);
    toast.success(`Generated ${quantity} UUIDs!`);
  };

  // Run automatically on mount
  useEffect(() => {
    generateUuids();
  }, [version, quantity, uppercase, hyphens]);

  const copyAll = async () => {
    if (uuids.length === 0) return;
    try {
      await clipboardWrite(uuids.join('\n'));
      toast.success("All UUIDs copied to clipboard!");
    } catch {
      toast.error("Failed to copy UUIDs.");
    }
  };

  const copySingle = async (val: string) => {
    try {
      await clipboardWrite(val);
      toast.success("Copied UUID!");
    } catch {
      toast.error("Failed to copy.");
    }
  };

  const downloadList = () => {
    if (uuids.length === 0) return;
    const blob = new Blob([uuids.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `uuids-${version}.txt`);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-blue-400 text-sm space-y-1">
        <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
          🆔 Bulk UUID Generator
        </h4>
        <p className="text-zinc-600 dark:text-[var(--text-muted)]">
          Generate RFC4122 compliant Universally Unique Identifiers (UUIDs) v4 (cryptographically random) or v1 (timestamp-based) entirely client-side.
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-[var(--bg-overlay)] p-6 rounded-2xl border border-zinc-200 dark:border-[var(--border-subtle)] shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* UUID Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">UUID Version</label>
            <div className="flex bg-white dark:bg-black p-1 rounded-xl border border-[var(--border-subtle)]">
              <button
                onClick={() => setVersion('v4')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  version === 'v4' ? 'bg-blue-600 text-white' : 'text-[var(--text-secondary)]'
                }`}
              >
                v4 (Random)
              </button>
              <button
                onClick={() => setVersion('v1')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  version === 'v1' ? 'bg-blue-600 text-white' : 'text-[var(--text-secondary)]'
                }`}
              >
                v1 (Time)
              </button>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">
              Quantity ({quantity})
            </label>
            <input
              type="range"
              min={1}
              max={100}
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-lg appearance-none cursor-pointer accent-blue-600 mt-3"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2 flex flex-col justify-center gap-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)] font-semibold select-none">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={e => setUppercase(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-800 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              Capitalize (UPPER)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)] font-semibold select-none">
              <input
                type="checkbox"
                checked={hyphens}
                onChange={e => setHyphens(e.target.checked)}
                className="rounded border-zinc-300 dark:border-zinc-800 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              Include Hyphens
            </label>
          </div>

          {/* Action button */}
          <div className="flex items-end">
            <button
              onClick={generateUuids}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all active:scale-95 text-sm"
            >
              🔄 Regenerate List
            </button>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      {uuids.length > 0 && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl flex flex-col overflow-hidden">
          {/* Output Header */}
          <div className="px-6 py-4 bg-black/20 border-b border-zinc-200 dark:border-[var(--border-subtle)] flex justify-between items-center shrink-0">
            <span className="text-[var(--text-primary)] text-sm font-bold uppercase tracking-wider">
              Generated Identifiers
            </span>
            <div className="flex gap-2">
              <button
                onClick={copyAll}
                className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
              >
                📋 Copy All
              </button>
              <button
                onClick={downloadList}
                className="text-xs bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg font-semibold transition-colors"
              >
                💾 Save List
              </button>
            </div>
          </div>

          {/* UUID scrollable list */}
          <div className="p-6 max-h-[450px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-850 font-mono text-sm">
            {uuids.map((id, index) => (
              <div key={index} className="flex justify-between items-center py-2.5 group">
                <span className="text-zinc-950 dark:text-zinc-200">{id}</span>
                <button
                  onClick={() => copySingle(id)}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-xs text-blue-500 hover:text-blue-400 font-semibold px-2 py-1 rounded bg-blue-500/10 transition-opacity"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

