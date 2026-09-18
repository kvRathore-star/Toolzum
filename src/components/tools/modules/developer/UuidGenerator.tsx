"use client";

import React, { useState } from 'react';
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

  const buildUuids = (v: UuidVersion, q: number, up: boolean, hy: boolean): string[] => {
    const list: string[] = [];
    for (let i = 0; i < q; i++) {
      let id = v === 'v4' ? uuidv4() : uuidv1();

      if (!hy) {
        id = id.replace(/-/g, '');
      }
      if (up) {
        id = id.toUpperCase();
      }
      list.push(id);
    }
    return list;
  };

  const [uuids, setUuids] = useState<string[]>(() => buildUuids('v4', 10, false, true));

  const setVersionAndRegenerate = (v: UuidVersion) => {
    setVersion(v);
    const list = buildUuids(v, quantity, uppercase, hyphens);
    setUuids(list);
    toast.success(`Generated ${quantity} UUIDs!`);
  };

  const setQuantityAndRegenerate = (q: number) => {
    setQuantity(q);
    const list = buildUuids(version, q, uppercase, hyphens);
    setUuids(list);
    toast.success(`Generated ${q} UUIDs!`);
  };

  const setUppercaseAndRegenerate = (up: boolean) => {
    setUppercase(up);
    const list = buildUuids(version, quantity, up, hyphens);
    setUuids(list);
    toast.success(`Generated ${quantity} UUIDs!`);
  };

  const setHyphensAndRegenerate = (hy: boolean) => {
    setHyphens(hy);
    const list = buildUuids(version, quantity, uppercase, hy);
    setUuids(list);
    toast.success(`Generated ${quantity} UUIDs!`);
  };

  const regenerate = () => {
    const list = buildUuids(version, quantity, uppercase, hyphens);
    setUuids(list);
    toast.success(`Generated ${quantity} UUIDs!`);
  };

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
      <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-2xl text-[var(--accent)] text-sm space-y-1">
        <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
          🆔 Bulk UUID Generator
        </h4>
        <p className="text-[var(--text-secondary)]">
          Generate RFC4122 compliant Universally Unique Identifiers (UUIDs) v4 (cryptographically random) or v1 (timestamp-based) entirely client-side.
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-[var(--bg-overlay)] p-6 rounded-2xl border border-[var(--border-subtle)] shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* UUID Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">UUID Version</label>
            <div className="flex bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border-subtle)]">
              <button
                onClick={() => setVersionAndRegenerate('v4')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  version === 'v4' ? 'bg-[var(--accent-ink)] text-white' : 'text-[var(--text-secondary)]'
                }`}
              >
                v4 (Random)
              </button>
              <button
                onClick={() => setVersionAndRegenerate('v1')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  version === 'v1' ? 'bg-[var(--accent-ink)] text-white' : 'text-[var(--text-secondary)]'
                }`}
              >
                v1 (Time)
              </button>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label htmlFor="lbl-uuidgenerator-quantity-quantity" className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">
              Quantity ({quantity})
            </label>
            <input id="lbl-uuidgenerator-quantity-quantity"
              type="range"
              min={1}
              max={100}
              value={quantity} aria-label="Quantity"
              onChange={e => setQuantityAndRegenerate(Number(e.target.value))}
              className="w-full h-2 bg-[var(--bg-overlay)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)] mt-3"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2 flex flex-col justify-center gap-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)] font-semibold select-none">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={e => setUppercaseAndRegenerate(e.target.checked)}
                className="rounded border-[var(--border-subtle)] text-[var(--accent)] focus:ring-[var(--accent)] h-4 w-4"
              />
              Capitalize (UPPER)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)] font-semibold select-none">
              <input
                type="checkbox"
                checked={hyphens}
                onChange={e => setHyphensAndRegenerate(e.target.checked)}
                className="rounded border-[var(--border-subtle)] text-[var(--accent)] focus:ring-[var(--accent)] h-4 w-4"
              />
              Include Hyphens
            </label>
          </div>

          {/* Action button */}
          <div className="flex items-end">
            <button
              onClick={regenerate}
              className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all active:scale-95 text-sm"
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
          <div className="px-6 py-4 bg-black/20 border-b border-[var(--border-subtle)] flex justify-between items-center shrink-0">
            <span className="text-[var(--text-primary)] text-sm font-bold uppercase tracking-wider">
              Generated Identifiers
            </span>
            <div className="flex gap-2">
              <button
                onClick={copyAll}
                className="text-xs bg-[var(--accent-ink)] hover:opacity-90 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
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
          <div className="p-6 max-h-[450px] overflow-y-auto divide-y divide-[var(--border-subtle)] font-mono text-sm">
            {uuids.map((id, index) => (
              <div key={index} className="flex justify-between items-center py-2.5 group">
                <span className="text-[var(--text-primary)]">{id}</span>
                <button
                  onClick={() => copySingle(id)}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-xs text-[var(--accent)] hover:opacity-80 font-semibold px-2 py-1 rounded bg-[var(--accent)]/10 transition-opacity"
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

