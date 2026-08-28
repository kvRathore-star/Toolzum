"use client";

import React, { useState } from 'react';
import { HelpCircle, RefreshCw } from 'lucide-react';

export default function DiceRoller() {
  const [dices, setDices] = useState<number[]>([1, 6]);
  const [isRolling, setIsRolling] = useState(false);

  const rollDices = () => {
    setIsRolling(true);
    setTimeout(() => {
      const rolled = dices.map(() => Math.floor(Math.random() * 6) + 1);
      setDices(rolled);
      setIsRolling(false);
    }, 600); // Animation duration
  };

  const addDice = () => {
    if (dices.length < 5) setDices([...dices, 1]);
  };

  const removeDice = () => {
    if (dices.length > 1) setDices(dices.slice(0, -1));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3 justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">3D CSS Dice Roller</h3>
        </div>
        <div className="flex gap-2">
          <button onClick={removeDice} className="px-2.5 py-1 bg-zinc-800 text-xs text-zinc-300 rounded font-semibold">- Remove</button>
          <button onClick={addDice} className="px-2.5 py-1 bg-indigo-600 text-xs text-white rounded font-semibold">+ Add Dice</button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center space-y-12 py-10 bg-[var(--bg-overlay)] rounded-2xl border border-[var(--border-subtle)]">
        <div className="flex flex-wrap justify-center gap-8 min-h-[120px] items-center">
          {dices.map((val, idx) => (
            <div 
              key={idx}
              className={`w-16 h-16 bg-white dark:bg-[var(--bg-surface)] border-2 border-[var(--border-subtle)] rounded-xl shadow-lg flex items-center justify-center text-3xl font-black text-[var(--accent)] transition-all duration-500 ${
                isRolling ? 'rotate-180 scale-95 opacity-50 animate-bounce' : ''
              }`}
            >
              {val}
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-xs text-[var(--text-muted)] font-bold mb-4">Total Sum: {dices.reduce((a, b) => a + b, 0)}</p>
          <button 
            onClick={rollDices} 
            disabled={isRolling}
            className="bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold px-8 py-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
            Roll Dices
          </button>
        </div>
      </div>
    </div>
  );
}