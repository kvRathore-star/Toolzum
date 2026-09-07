"use client";

import React, { useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from '@/lib/clipboard';
import { Shield, CheckCircle, XCircle, Copy, RefreshCw, Zap, Fingerprint, Hash, FileDigit, AlertTriangle } from 'lucide-react';

const ACCENT = '#f97316';

const d = [
  [0,1,2,3,4,5,6,7,8,9],
  [1,2,3,4,0,6,7,8,9,5],
  [2,3,4,0,1,7,8,9,5,6],
  [3,4,0,1,2,8,9,5,6,7],
  [4,0,1,2,3,9,5,6,7,8],
  [5,9,8,7,6,0,4,3,2,1],
  [6,5,9,8,7,1,0,4,3,2],
  [7,6,5,9,8,2,1,0,4,3],
  [8,7,6,5,9,3,2,1,0,4],
  [9,8,7,6,5,4,3,2,1,0]
];
const p = [
  [0,1,2,3,4,5,6,7,8,9],
  [1,5,7,6,2,8,3,0,9,4],
  [5,8,0,3,7,9,6,1,4,2],
  [8,9,1,6,0,4,3,5,2,7],
  [9,4,5,3,1,2,6,8,7,0],
  [4,2,8,6,5,7,3,9,0,1],
  [2,7,9,3,8,0,6,4,1,5],
  [7,0,4,6,9,1,3,2,5,8]
];
const inv = [0,4,3,2,1,5,6,7,8,9];

function verhoeffCheck(num: string): boolean {
  let c = 0;
  const digits = num.split('').reverse().map(Number);
  for (let i = 0; i < digits.length; i++) {
    c = d[c][p[i % 8][digits[i]]];
  }
  return c === 0;
}

function formatAadhaar(num: string): string {
  const digits = num.replace(/\D/g, '');
  if (digits.length === 0) return '';
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
}

function maskLastFour(num: string): string {
  const digits = num.replace(/\D/g, '');
  if (digits.length < 4) return digits;
  return `XXXX XXXX ${digits.slice(-4)}`;
}

function generateValidAadhaar(): string {
  while (true) {
    let digits = '';
    digits += Math.floor(Math.random() * 8) + 2;
    for (let i = 1; i < 11; i++) {
      digits += Math.floor(Math.random() * 10);
    }
    for (let check = 0; check <= 9; check++) {
      const candidate = digits + check;
      if (verhoeffCheck(candidate)) {
        return formatAadhaar(candidate);
      }
    }
  }
}

function isSuspicious(num: string): { suspicious: boolean; reason?: string } {
  const digits = num.replace(/\D/g, '');
  if (/^0+$/.test(digits)) return { suspicious: true, reason: 'All zeros' };
  if (/^1+$/.test(digits)) return { suspicious: true, reason: 'All ones' };
  if (/^(\d)\1{11}$/.test(digits)) return { suspicious: true, reason: 'All digits identical' };
  if ('012345678901'.startsWith(digits) || '987654321098'.startsWith(digits)) return { suspicious: true, reason: 'Sequential pattern' };
  if (/^(\d{2,}?)\1{2,}$/.test(digits)) return { suspicious: true, reason: 'Repeating pattern' };
  return { suspicious: false };
}

interface ValidationStep {
  label: string;
  status: 'idle' | 'pass' | 'fail';
  detail?: string;
}

export default function AadhaarValidator() {
  const [input, setInput] = useState('');
  const [validated, setValidated] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [steps, setSteps] = useState<ValidationStep[]>([
    { label: 'Format Check', status: 'idle' },
    { label: 'Checksum Verification', status: 'idle' },
    { label: 'Pattern Analysis', status: 'idle' },
  ]);
  const [suspicious, setSuspicious] = useState<{ suspicious: boolean; reason?: string }>({ suspicious: false });
  const [rawDigits, setRawDigits] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9\s]/g, '');
    const digits = raw.replace(/\s/g, '');
    if (digits.length > 12) return;
    const formatted = formatAadhaar(digits);
    setInput(formatted);
    setValidated(false);
    setSteps(steps.map(s => ({ ...s, status: 'idle' as const })));
  }, []);

  const handleValidate = useCallback(async () => {
    const digits = input.replace(/\s/g, '');
    if (digits.length !== 12) {
      toast.error('Aadhaar number must be exactly 12 digits');
      return;
    }

    setRawDigits(digits);
    setIsAnimating(true);
    setValidated(false);

    const newSteps: ValidationStep[] = [
      { label: 'Format Check', status: 'idle' },
      { label: 'Checksum Verification', status: 'idle' },
      { label: 'Pattern Analysis', status: 'idle' },
    ];

    await new Promise(r => setTimeout(r, 300));
    const firstDigit = parseInt(digits[0]);
    const formatPass = /^\d{12}$/.test(digits) && firstDigit >= 2;
    newSteps[0].status = formatPass ? 'pass' : 'fail';
    newSteps[0].detail = formatPass ? '12 digits, valid start' : firstDigit < 2 ? 'First digit cannot be 0 or 1' : 'Must be exactly 12 digits';
    setSteps([...newSteps]);

    await new Promise(r => setTimeout(r, 500));
    const checksumPass = verhoeffCheck(digits);
    newSteps[1].status = checksumPass ? 'pass' : 'fail';
    newSteps[1].detail = checksumPass ? 'Verhoeff checksum valid' : 'Verhoeff checksum failed';
    setSteps([...newSteps]);

    await new Promise(r => setTimeout(r, 400));
    const susp = isSuspicious(digits);
    setSuspicious(susp);
    newSteps[2].status = susp.suspicious ? 'fail' : 'pass';
    newSteps[2].detail = susp.suspicious ? `Suspicious: ${susp.reason}` : 'No suspicious patterns';
    setSteps([...newSteps]);

    setIsValid(formatPass && checksumPass && !susp.suspicious);
    setValidated(true);
    setIsAnimating(false);
  }, [input]);

  const handleGenerate = useCallback(() => {
    const generated = generateValidAadhaar();
    setInput(generated);
    setValidated(false);
    setSteps(steps.map(s => ({ ...s, status: 'idle' as const })));
    setSuspicious({ suspicious: false });
    toast.success('Random valid Aadhaar generated');
  }, []);

  const handleCopyMasked = useCallback(() => {
    const masked = maskLastFour(rawDigits);
    clipboardWrite(masked);
    toast.success('Masked copy: ' + masked);
  }, [rawDigits]);

  const handleReset = useCallback(() => {
    setInput('');
    setValidated(false);
    setIsValid(false);
    setSteps(steps.map(s => ({ ...s, status: 'idle' as const })));
    setSuspicious({ suspicious: false });
    setRawDigits('');
    inputRef.current?.focus();
  }, []);

  const digits = input.replace(/\s/g, '');

  return (
    <div className="max-w-xl mx-auto space-y-5 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl">
        <Shield className="w-5 h-5 text-[#f97316] shrink-0" />
        <p className="text-sm text-[#f97316] dark:text-[#f97316] font-medium">
          Validate Aadhaar numbers offline using Verhoeff checksum algorithm. All processing stays in your browser.
        </p>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-[var(--text-primary)]">
            Enter 12-Digit Aadhaar Number
          </label>
          <div className="relative">
            <input aria-label="Enter 12-Digit Aadhaar Number"
              ref={inputRef}
              type="text"
              inputMode="numeric"
              placeholder="XXXX XXXX XXXX"
              value={input}
              onChange={handleChange}
              className="w-full bg-[var(--bg-overlay)] border-2 rounded-xl px-4 py-3.5 text-xl font-mono tracking-[0.15em] text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 transition-all"
              style={{
                borderColor: validated ? (isValid ? '#22c55e66' : '#ef444466') : '#f9731666',
                boxShadow: validated ? (isValid ? '0 0 0 3px #22c55e22' : '0 0 0 3px #ef444422') : '0 0 0 3px #f9731622',
              }}
            />
            {digits.length > 0 && (
              <button
                onClick={handleReset}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Reset"
              >
                <RefreshCw className="w-4 h-4 text-zinc-400" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wider">Generate:</span>
              <button
                onClick={handleGenerate}
                className="text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                Random Valid
              </button>
            </div>
            {digits.length > 0 && (
              <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                {digits.length}/12
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleValidate}
          disabled={isAnimating || digits.length !== 12}
          className="w-full text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${ACCENT}, #ea580c)`,
            boxShadow: `0 4px 20px ${ACCENT}44`,
          }}
        >
          {isAnimating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Validating...
            </span>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Validate Aadhaar
            </>
          )}
        </button>

        {isAnimating && (
          <div className="space-y-2.5 py-2">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{
                    backgroundColor: step.status === 'idle' ? 'var(--bg-surface)' : step.status === 'pass' ? '#22c55e' : '#ef4444',
                  }}
                >
                  {step.status === 'idle' ? (
                    <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  ) : step.status === 'pass' ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <XCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm font-semibold"
                      style={{
                        color: step.status === 'idle' ? 'var(--text-muted)' : step.status === 'pass' ? '#22c55e' : '#ef4444',
                      }}
                    >
                      {step.label}
                    </span>
                    {step.detail && (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono ml-2 shrink-0">{step.detail}</span>
                    )}
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: step.status === 'idle' ? '0%' : '100%',
                        backgroundColor: step.status === 'pass' ? '#22c55e' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {validated && !isAnimating && (
          <div className="space-y-5 border-t border-[var(--border-subtle)] pt-5 animate-in fade-in slide-in-from-top-4 duration-300">
            <div
              className="rounded-2xl p-5 border-2 relative overflow-hidden"
              style={{
                borderColor: isValid ? '#22c55e44' : '#ef444444',
                backgroundColor: isValid ? '#22c55e0a' : '#ef44440a',
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10"
                style={{ backgroundColor: isValid ? '#22c55e' : '#ef4444' }}
              />
              <div className="flex items-center gap-4 relative z-10">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isValid ? '#22c55e' : '#ef4444',
                    boxShadow: `0 4px 16px ${isValid ? '#22c55e44' : '#ef444444'}`,
                  }}
                >
                  {isValid ? (
                    <Shield className="w-7 h-7 text-white" />
                  ) : (
                    <AlertTriangle className="w-7 h-7 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className="text-lg font-black tracking-tight"
                      style={{ color: isValid ? '#22c55e' : '#ef4444' }}
                    >
                      {isValid ? 'VALID AADHAAR' : 'INVALID AADHAAR'}
                    </h3>
                    <div
                      className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider"
                      style={{
                        backgroundColor: isValid ? '#22c55e20' : '#ef444420',
                        color: isValid ? '#22c55e' : '#ef4444',
                        border: `1px solid ${isValid ? '#22c55e30' : '#ef444430'}`,
                      }}
                    >
                      SECURITY CARD
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {isValid ? 'Verhoeff checksum & format validated successfully' : 'Validation checks failed'}
                  </p>
                </div>
              </div>

              <div className="flex justify-center font-mono text-2xl font-black gap-1 p-4 mt-4 bg-[var(--bg-overlay)] rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)] relative z-10">
                <span className="text-zinc-400" title="First digit (cannot be 0/1)">{rawDigits[0]}</span>
                <span className="text-zinc-400" title="Digits 2-4">{rawDigits.slice(1, 4)}</span>
                <span className="text-zinc-400 opacity-30">|</span>
                <span className="text-[#f97316]" title="Digits 5-8">{rawDigits.slice(4, 8)}</span>
                <span className="text-zinc-400 opacity-30">|</span>
                <span className="text-[#22c55e]" title="Last 4 digits">{rawDigits.slice(8)}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 relative z-10">
                <div className="p-2.5 rounded-lg bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] text-center">
                  <Fingerprint className="w-3.5 h-3.5 mx-auto mb-1 text-zinc-400" />
                  <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Issuer</div>
                  <div className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">UIDAI</div>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] text-center">
                  <FileDigit className="w-3.5 h-3.5 mx-auto mb-1 text-zinc-400" />
                  <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Checksum</div>
                  <div className="text-[11px] font-bold mt-0.5" style={{ color: steps[1].status === 'pass' ? '#22c55e' : '#ef4444' }}>
                    {steps[1].status === 'pass' ? 'Verified' : 'Failed'}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] text-center">
                  <Hash className="w-3.5 h-3.5 mx-auto mb-1 text-zinc-400" />
                  <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Pattern</div>
                  <div className="text-[11px] font-bold mt-0.5" style={{ color: steps[2].status === 'pass' ? '#22c55e' : '#ef4444' }}>
                    {suspicious.suspicious ? `${suspicious.reason}` : 'Clean'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopyMasked}
                className="flex-1 py-3 bg-[var(--bg-surface)] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[var(--text-primary)] font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                Copy Masked
              </button>
              <button
                onClick={handleGenerate}
                className="flex-1 py-3 bg-[var(--bg-surface)] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[var(--text-primary)] font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                Generate Another
              </button>
            </div>

            {suspicious.suspicious && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Suspicious Pattern Detected</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    This number matches known fake patterns: {suspicious.reason}. It may be a generated or test Aadhaar.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {!validated && !isAnimating && (
          <div className="py-8 text-center">
            <Shield className="w-10 h-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Enter an Aadhaar number to validate</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              The Verhoeff checksum will be computed locally
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
