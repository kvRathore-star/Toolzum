"use client";

import React, { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, Info, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

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

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 border border-zinc-200 dark:border-white/5 rounded-2xl">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-indigo-500" />
          PAN Card Format Verifier
        </h2>
        <p className="text-sm text-[var(--text-secondary)] dark:text-zinc-400 mt-1">
          Perform a privacy-first, client-side validation of Permanent Account Number (PAN) formats, extract entity type, and visualize its structure.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
            Enter 10-Digit PAN Number
          </label>
          <div className="relative">
            <input
              type="text"
              maxLength={10}
              placeholder="e.g., ABCDE1234F"
              value={pan}
              onChange={(e) => setPan(e.target.value.toUpperCase())}
              className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-lg font-mono tracking-widest text-zinc-900 dark:text-white outline-none"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleVerify}
            className="flex-1 bg-[var(--accent)] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            Verify Format
          </button>
          <button
            onClick={resetForm}
            className="px-5 py-3.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-[var(--bg-surface)] dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl transition-all cursor-pointer"
            aria-label="Reset"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {validationResult && (
          <div className="space-y-6 border-t border-zinc-200 dark:border-zinc-800 pt-6 animate-in fade-in slide-in-from-top-4 duration-300">
            {validationResult.isValid ? (
              <div className="space-y-6">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-bold text-emerald-400">Valid Format Structuring</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      The PAN complies with the official Income Tax Department formatting rules.
                    </p>
                  </div>
                </div>

                {/* Structure Breakdown */}
                <div className="space-y-4">
                  <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm uppercase tracking-wider">
                    PAN Structure Analysis
                  </h3>
                  
                  {/* Visually segments the PAN */}
                  <div className="flex justify-center font-mono text-2xl font-black gap-1 p-4 bg-zinc-50 dark:bg-black/50 rounded-xl border border-zinc-200 dark:border-white/5">
                    <span className="text-indigo-400" title="First 3 characters: Alphabetic Series">{pan.substring(0, 3)}</span>
                    <span className="text-rose-400 underline decoration-rose-500 decoration-2" title={`Taxpayer Status: ${validationResult.details?.statusText}`}>{pan[3]}</span>
                    <span className="text-amber-400" title={`Surname starting letter: ${validationResult.details?.surnameChar}`}>{pan[4]}</span>
                    <span className="text-emerald-400" title="4 Digits Sequential Number">{pan.substring(5, 9)}</span>
                    <span className="text-violet-400" title="Last character check digit">{pan[9]}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 space-y-1">
                      <span className="text-xs text-zinc-500 font-bold uppercase block">Taxpayer Category (4th Digit)</span>
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block">
                        {validationResult.details?.statusText}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 space-y-1">
                      <span className="text-xs text-zinc-500 font-bold uppercase block">Surname / Entity First Character (5th Digit)</span>
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block">
                        Matches name starting with '{validationResult.details?.surnameChar}'
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 space-y-1">
                      <span className="text-xs text-zinc-500 font-bold uppercase block">Alphabetic Series (1st-3rd Digits)</span>
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block">
                        Series prefix: {pan.substring(0, 3)}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 space-y-1">
                      <span className="text-xs text-zinc-500 font-bold uppercase block">Sequential Numbering (6th-9th Digits)</span>
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 block">
                        Serial: {validationResult.details?.serialText}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-white/5 text-xs text-[var(--text-secondary)] dark:text-zinc-400 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                    <Info className="w-4 h-4 text-indigo-500" />
                    How to verify actual active status?
                  </div>
                  <p>
                    Because this tool is 100% offline and privacy-first, it checks formatting validity. To verify active/de-duplicated status against the Income Tax Department's database, visit the official{' '}
                    <a
                      href="https://eportal.incometax.gov.in/iec/foservices/#/pre-login/verifyYourPAN"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline font-bold"
                    >
                      e-Filing Portal (Verify Your PAN)
                    </a>.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-rose-400">Invalid Format</h4>
                  <p className="text-sm text-[var(--text-secondary)] dark:text-zinc-400 mt-0.5">
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
