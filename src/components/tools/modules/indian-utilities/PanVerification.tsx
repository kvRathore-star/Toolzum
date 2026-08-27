"use client";

import React, { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, Info, Copy, RefreshCw, Zap, Users, Building2, Landmark, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const ACCENT = '#059669';
const ACCENT_LIGHT = '#059669';

const STATUS_MAP: Record<string, string> = {
  P: 'Individual (P)',
  C: 'Company (C)',
  H: 'Hindu Undivided Family (HUF) (H)',
  F: 'Firm / LLP (F)',
  A: 'Association of Persons (AOP) (A)',
  B: 'Body of Individuals (BOI) (B)',
  G: 'Government Agency (G)',
  J: 'Artificial Juridical Person (J)',
  L: 'Local Authority (L)',
  T: 'Trust (T)',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  P: <UserCheck className="w-4 h-4" />,
  C: <Building2 className="w-4 h-4" />,
  H: <Users className="w-4 h-4" />,
  F: <Building2 className="w-4 h-4" />,
  A: <Users className="w-4 h-4" />,
  B: <Users className="w-4 h-4" />,
  G: <Landmark className="w-4 h-4" />,
  J: <Building2 className="w-4 h-4" />,
  L: <Landmark className="w-4 h-4" />,
  T: <Building2 className="w-4 h-4" />,
};

const EXAMPLE_PANS = ['ABCDE1234F', 'PQRSG7890H', 'XYZTC5678K', 'LMNOP3456J'];

export default function PanVerification() {
  const [pan, setPan] = useState('');
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    error?: string;
    details?: {
      statusLetter: string;
      statusText: string;
      surnameChar: string;
      serialText: string;
      checkChar: string;
    };
  } | null>(null);

  const handleVerify = () => {
    const cleanPan = pan.trim().toUpperCase();
    if (!cleanPan) {
      toast.error('Please enter a PAN number');
      return;
    }

    if (cleanPan.length !== 10) {
      setValidationResult({
        isValid: false,
        error: `PAN must be exactly 10 characters (current length: ${cleanPan.length})`,
      });
      return;
    }

    const regex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    if (!regex.test(cleanPan)) {
      setValidationResult({
        isValid: false,
        error: 'Invalid PAN structure. Must match: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)',
      });
      return;
    }

    const statusLetter = cleanPan[3];
    const statusText = STATUS_MAP[statusLetter] || 'Unknown status character';
    const surnameChar = cleanPan[4];
    const serialText = cleanPan.substring(5, 9);
    const checkChar = cleanPan[9];

    setValidationResult({
      isValid: true,
      details: {
        statusLetter,
        statusText,
        surnameChar,
        serialText,
        checkChar,
      },
    });
    toast.success('PAN structure is valid!');
  };

  const copyToClipboard = (text: string) => {
    clipboardWrite(text);
    toast.success('Copied to clipboard');
  };

  const resetForm = () => {
    setPan('');
    setValidationResult(null);
  };

  const loadExample = (example: string) => {
    setPan(example);
    setValidationResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[#059669]/10 border border-[#059669]/20 p-4 rounded-xl flex items-center gap-3">
        <Shield className="w-5 h-5 text-[#059669] shrink-0" />
        <p className="text-sm text-[#059669] dark:text-[#059669] font-medium">
          Perform client-side validation of Permanent Account Number (PAN) formats, extract entity type, and visualize its structure.
        </p>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-[var(--text-primary)]">
            Enter 10-Digit PAN Number
          </label>
          <div className="relative">
            <input
              type="text"
              maxLength={10}
              placeholder="e.g., ABCDE1234F"
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              className="w-full bg-[var(--bg-overlay)] border-2 rounded-xl px-4 py-3 text-lg font-mono tracking-widest text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 transition-all"
              style={{
                borderColor: pan ? ACCENT + '66' : 'var(--border-subtle)',
                boxShadow: pan ? `0 0 0 3px ${ACCENT}22` : 'none',
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium uppercase tracking-wider">Try:</span>
            {EXAMPLE_PANS.map((example) => (
              <button
                key={example}
                onClick={() => loadExample(example)}
                className="text-[10px] font-mono font-bold px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleVerify}
            className="flex-1 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, #047857)`,
              boxShadow: `0 4px 20px ${ACCENT}44`
            }}
          >
            <Zap className="w-4 h-4" />
            Verify Format
          </button>
          <button
            onClick={resetForm}
            className="px-5 py-3.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold rounded-xl transition-all cursor-pointer"
            aria-label="Reset"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {validationResult && (
          <div className="space-y-6 border-t border-[var(--border-subtle)] pt-6 animate-in fade-in slide-in-from-top-4 duration-300">
            {validationResult.isValid ? (
              <div className="space-y-6">
                <div
                  className="p-4 rounded-xl flex items-start gap-3 border-2"
                  style={{
                    borderColor: ACCENT + '44',
                    backgroundColor: ACCENT + '0d',
                  }}
                >
                  <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: ACCENT }} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold" style={{ color: ACCENT }}>Valid PAN Format</h4>
                      <button
                        onClick={() => copyToClipboard(pan)}
                        className="p-1.5 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        title="Copy PAN"
                      >
                        <Copy className="w-4 h-4 text-zinc-500" />
                      </button>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">
                      The PAN complies with Income Tax Department formatting rules.
                    </p>
                  </div>
                </div>

                {validationResult.details && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: ACCENT + '15',
                      color: ACCENT,
                      border: `1px solid ${ACCENT}30`
                    }}
                  >
                    {STATUS_ICONS[validationResult.details.statusLetter] || <Info className="w-3.5 h-3.5" />}
                    {validationResult.details.statusText}
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm uppercase tracking-wider">
                    PAN Structure Analysis
                  </h3>

                  <div className="flex justify-center font-mono text-2xl font-black gap-1 p-4 bg-[var(--bg-overlay)] rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
                    <span className="text-zinc-400" title="First 3 characters: Alphabetic Series">{pan.substring(0, 3)}</span>
                    <span className="text-[#059669] underline decoration-[#059669] decoration-2" title={`Taxpayer Status: ${validationResult.details?.statusText}`}>{pan[3]}</span>
                    <span className="text-[#d97706]" title={`Surname starting letter: ${validationResult.details?.surnameChar}`}>{pan[4]}</span>
                    <span className="text-[#2563eb]" title="4 Digits Sequential Number">{pan.substring(5, 9)}</span>
                    <span className="text-[#7c3aed]" title="Last character check digit">{pan[9]}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] space-y-1">
                      <span className="text-xs text-[var(--text-secondary)] font-bold uppercase block">Alphabetic Series (1st-3rd)</span>
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block">
                        <span className="font-mono tracking-wider">{pan.substring(0, 3)}</span>
                        <span className="text-zinc-400 dark:text-zinc-500 font-normal ml-1">— Series prefix</span>
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] space-y-1">
                      <span className="text-xs text-[var(--text-secondary)] font-bold uppercase block">Entity Type (4th)</span>
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block">
                        <span className="font-mono tracking-wider">{pan[3]}</span>
                        <span className="text-zinc-400 dark:text-zinc-500 font-normal ml-1">— {validationResult.details?.statusText}</span>
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] space-y-1">
                      <span className="text-xs text-[var(--text-secondary)] font-bold uppercase block">Surname Initial (5th)</span>
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block">
                        <span className="font-mono tracking-wider">{pan[4]}</span>
                        <span className="text-zinc-400 dark:text-zinc-500 font-normal ml-1">— Name match</span>
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] space-y-1">
                      <span className="text-xs text-[var(--text-secondary)] font-bold uppercase block">Sequential Number (6th-9th)</span>
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block">
                        <span className="font-mono tracking-wider">{validationResult.details?.serialText}</span>
                        <span className="text-zinc-400 dark:text-zinc-500 font-normal ml-1">— Serial</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[var(--bg-overlay)] rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] dark:text-[var(--text-muted)] space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                    <Info className="w-4 h-4" style={{ color: ACCENT }} />
                    How to verify actual active status?
                  </div>
                  <p>
                    This tool is 100% offline and privacy-first — it checks formatting validity. To verify active/de-duplicated status against the Income Tax Department's database, visit the official{' '}
                    <a
                      href="https://eportal.incometax.gov.in/iec/foservices/#/pre-login/verifyYourPAN"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: ACCENT }}
                      className="hover:underline font-bold"
                    >
                      e-Filing Portal (Verify Your PAN)
                    </a>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl flex items-start gap-3 border-2"
                style={{
                  borderColor: '#ef444444',
                  backgroundColor: '#ef44440d',
                }}
              >
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
                <div>
                  <h4 className="font-bold text-red-500">Invalid Format</h4>
                  <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mt-0.5">
                    {validationResult.error}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
