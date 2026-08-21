"use client";

import React, { useState } from 'react';
import { HelpCircle, RefreshCw } from 'lucide-react';

export default function CoinFlipper() {
  const [result, setResult] = useState<'HEADS' | 'TAILS'>('HEADS');
  const [isFlipping, setIsFlipping] = useState(false);
  const [stats, setStats] = useState({ heads: 5, tails: 5 });

  const flipCoin = () => {
    setIsFlipping(true);
    setTimeout(() => {
      const res = Math.random() > 0.5 ? 'HEADS' : 'TAILS';
      setResult(res);
      setStats(prev => ({
        heads: res === 'HEADS' ? prev.heads + 1 : prev.heads,
        tails: res === 'TAILS' ? prev.tails + 1 : prev.tails
      }));
      setIsFlipping(false);
    }, 600); // Spin duration
  };

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <HelpCircle className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Interactive 3D Coin Flipper</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Flip coin display */}
        <div className="flex flex-col justify-center items-center bg-[var(--bg-overlay)] rounded-2xl p-8 border border-zinc-800 min-h-[250px]">
          <div 
            className={`w-28 h-28 rounded-full border-4 border-amber-500 bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-xl flex items-center justify-center font-black text-amber-800 text-sm tracking-wider transition-all duration-500 ${
              isFlipping ? 'scale-90 opacity-40 rotate-[360deg] animate-bounce' : ''
            }`}
          >
            {result}
          </div>

          <button 
            onClick={flipCoin} 
            disabled={isFlipping}
            className="mt-6 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-50 animate-in"
          >
            <RefreshCw className={`w-4 h-4 ${isFlipping ? 'animate-spin' : ''}`} />
            Flip Coin
          </button>
        </div>

        {/* Flipping stats info */}
        <div className="space-y-4 flex flex-col justify-center">
          <span className="text-xs text-[var(--text-muted)] font-bold uppercase block border-b border-[var(--border-subtle)] pb-2">Coin Flip Statistics</span>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--bg-overlay)] p-3.5 rounded-xl border border-[var(--border-subtle)] text-center">
              <span className="text-[10px] text-[var(--text-secondary)] block uppercase">Heads Total</span>
              <p className="text-2xl font-black text-amber-500 mt-1">{stats.heads}</p>
            </div>
            <div className="bg-[var(--bg-overlay)] p-3.5 rounded-xl border border-[var(--border-subtle)] text-center">
              <span className="text-[10px] text-[var(--text-secondary)] block uppercase">Tails Total</span>
              <p className="text-2xl font-black text-[var(--accent)] mt-1">{stats.tails}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}