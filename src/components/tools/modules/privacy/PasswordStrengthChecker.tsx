"use client";

import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
// @ts-ignore
import zxcvbn from 'zxcvbn';

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const evaluation = zxcvbn(password);
  const score = password ? evaluation.score : 0; // 0 to 4

  const scoreLabels = ['Very Weak', 'Weak', 'Fair / Mediocre', 'Strong', 'Extremely Secure'];
  const scoreColors = [
    'bg-zinc-600',
    'bg-rose-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-emerald-500'
  ];

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <ShieldCheck className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">ZXCVBN Password Strength Audit</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input box */}
        <div className="space-y-4 flex flex-col justify-center">
          <div className="space-y-2">
            <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Password String</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Type passwords to analyze entropy..."
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-xs outline-none pr-10"
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[var(--text-muted)] hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {password && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-[var(--text-muted)]">
                <span>Security Grade</span>
                <span className={`${
                  score === 4 ? 'text-emerald-500' :
                  score === 3 ? 'text-amber-500' :
                  score === 2 ? 'text-orange-500' : 'text-[var(--accent)]'
                }`}>{scoreLabels[score]}</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden flex gap-1">
                {[0, 1, 2, 3].map(lvl => (
                  <div 
                    key={lvl} 
                    className={`flex-1 h-full transition-colors ${
                      lvl <= score - 1 ? scoreColors[score] : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Audit Details */}
        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-zinc-800 flex flex-col justify-between min-h-[180px]">
          {password ? (
            <div className="space-y-3 text-xs text-[var(--text-muted)] animate-in zoom-in-95">
              <h4 className="text-sm font-bold text-zinc-300 uppercase">Entropy Diagnostics</h4>
              <div className="space-y-1">
                <p>💡 Estimated Crack Time: <span className="font-bold text-zinc-100">{evaluation.crack_times_display.offline_fast_hashing_1e10_per_second}</span></p>
                {evaluation.feedback.warning && (
                  <p className="text-rose-400">⚠️ Warning: {evaluation.feedback.warning}</p>
                )}
                {evaluation.feedback.suggestions.length > 0 && (
                  <div className="text-[10px] text-[var(--text-secondary)] mt-2">
                    <p className="font-bold">Suggestions:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {evaluation.feedback.suggestions.map((s: string, idx: number) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-[var(--text-secondary)] m-auto">
              <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-zinc-700" />
              <p className="text-xs">Diagnostics display is idle.</p>
              <p className="text-[10px] text-[var(--text-secondary)]">Enter a password to run the ZXCVBN strength check.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}