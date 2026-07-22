"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ItrFilingHelper() {
  const [income, setIncome] = useState('');
  const [regime, setRegime] = useState('new');
  const [output, setOutput] = useState('');

  const calculateTax = () => {
    if (!income) return;
    setOutput(`Estimated Tax Liability (Stub):\
\
Under the ${regime} tax regime for FY 2023-24, an income of ₹${income} falls into the 15% bracket.\
\
Estimated Tax: ₹${(Number(income) * 0.15).toFixed(2)}\
Cess (4%): ₹${(Number(income) * 0.15 * 0.04).toFixed(2)}\
\
Note: Connect backend LLM for exact deduction processing.`);
    toast.success("Calculation complete!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-sm">
        <strong>India Finance Tool:</strong> AI assistant to help you choose between Old vs New tax regimes and maximize deductions.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
          
          <div>
            <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">Total Annual Income (₹)</label>
            <input 
              type="number" 
              value={income}
              onChange={e => setIncome(e.target.value)}
              className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-3 text-[var(--text-primary)] outline-none focus:border-emerald-500"
              placeholder="e.g. 1500000"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">Tax Regime Preference</label>
            <select 
              value={regime}
              onChange={e => setRegime(e.target.value)}
              className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-3 text-[var(--text-primary)] outline-none focus:border-emerald-500"
            >
              <option value="new">New Tax Regime (Default)</option>
              <option value="old">Old Tax Regime (With 80C Deductions)</option>
            </select>
          </div>

          <button 
            onClick={calculateTax}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95"
          >
            Calculate Tax
          </button>

        </div>

        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex flex-col">
          <h4 className="text-[var(--text-primary)] font-medium mb-4">AI Tax Report</h4>
          <textarea 
            className="flex-1 w-full bg-white dark:bg-black border border-emerald-500/30 rounded-lg px-4 py-3 text-emerald-400 font-mono text-sm outline-none resize-none min-h-[200px]"
            readOnly
            value={output}
            placeholder="Tax breakdown will appear here..."
          />
        </div>
      </div>
    </div>
  );
}
