"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ClipboardList, Check, ChevronDown, ChevronRight, ExternalLink, Calendar, Download, FileText, AlertCircle } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";
import { downloadOrShare } from "@/utils/nativeShare";

const ITR_FORMS = [
  { id: 'ITR-1', label: 'ITR-1 (Sahaj)', eligibility: 'Individual having income from salary, one house property, and other sources (up to ₹50 lakhs)', icon: FileText },
  { id: 'ITR-2', label: 'ITR-2', eligibility: 'Individual/HUF not having business or profession income, including capital gains', icon: FileText },
  { id: 'ITR-3', label: 'ITR-3', eligibility: 'Individual/HUF having income from business or profession', icon: FileText },
  { id: 'ITR-4', label: 'ITR-4 (Sugam)', eligibility: 'Individual/HUF/firm having presumptive business income (up to ₹2 crores turnover)', icon: FileText },
  { id: 'ITR-5', label: 'ITR-5', eligibility: 'Firms, LLPs, AOPs, BOIs, and other artificial juridical persons', icon: FileText },
  { id: 'ITR-6', label: 'ITR-6', eligibility: 'Companies other than those claiming exemption under section 11', icon: FileText },
];

const DOCUMENT_CHECKLIST = [
  'PAN Card',
  'Aadhaar Card',
  'Form 16 (from employer)',
  'Bank Statement (last 6 months)',
  'TDS Certificates (Form 16A/16B/16C)',
  'Interest Certificates (FD, Savings)',
  'Rent Receipts (HRA claim)',
  'Home Loan Certificate (80C + interest)',
  'Investment Proofs (80C, 80D, etc.)',
  'Capital Gains Statements (mutual funds, stocks)',
  'Foreign Asset Details (if applicable)',
  'Previous Year ITR (for reference)',
];

const GUIDE_STEPS = [
  {
    title: 'Gather Documents',
    description: 'Collect all necessary documents including Form 16, bank statements, investment proofs, and TDS certificates before starting your ITR filing.',
    icon: ClipboardList,
  },
  {
    title: 'Choose Correct ITR Form',
    description: 'Select the appropriate ITR form based on your income sources, residential status, and applicable tax regime.',
    icon: FileText,
  },
  {
    title: 'Fill Income Details',
    description: 'Enter income from salary, house property, capital gains, business/profession, and other sources in the respective schedules.',
    icon: FileText,
  },
  {
    title: 'Claim Deductions',
    description: 'Claim applicable deductions under sections 80C, 80D, 80G, 24(b), and others to reduce your taxable income.',
    icon: FileText,
  },
  {
    title: 'Verify & Submit',
    description: 'Verify all entries, pay any due tax, file the return, and complete e-verification via Aadhaar OTP, net banking, or other methods.',
    icon: Check,
  },
];

const DUE_DATE_2026 = new Date('2026-07-31T23:59:59');
const TAX_PORTAL_URL = 'https://www.incometax.gov.in/iec/foportal';

function getDueDateInfo(): { daysLeft: number; isUrgent: boolean } {
  const now = new Date();
  const diff = DUE_DATE_2026.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  return { daysLeft, isUrgent: daysLeft <= 30 && daysLeft > 0 };
}

export default function ItrFilingHelper() {
  const [income, setIncome] = useState('');
  const [regime, setRegime] = useState('new');
  const [output, setOutput] = useState('');
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<string[]>([]);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [showCalc, setShowCalc] = useState(false);

  const { daysLeft, isUrgent } = getDueDateInfo();

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

  const toggleChecklistItem = (item: string) => {
    setChecklist(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const downloadChecklist = async () => {
    const checked = checklist.join('\n✓ ');
    const text = `ITR Filing Document Checklist\n${'='.repeat(30)}\n\n✓ ${checked}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    // Quota-gated save (1 unit) — block shows the limit modal, so only toast on success.
    if (await downloadOrShare(url, 'itr-checklist.txt')) {
      toast.success('Checklist downloaded!');
    } else {
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent-ink)] to-purple-600 flex items-center justify-center text-white shadow-lg shadow-[var(--accent)]/20">
          <FileText className="w-4 h-4" />
        </div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">ITR Filing Helper</h3>
      </div>

      {daysLeft > 0 && (
        <div className={`flex items-center justify-between px-5 py-3.5 rounded-2xl border shadow-sm ${
          isUrgent
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-300'
            : 'bg-[var(--accent)]/10 border-[var(--accent)]/20 text-[var(--accent)]'
        }`}>
          <div className="flex items-center gap-3">
            <Calendar className={`w-5 h-5 ${isUrgent ? 'text-red-500 animate-pulse' : 'text-[var(--accent)]'}`} />
            <div>
              <p className="text-xs font-bold">{daysLeft} days left until ITR due date (July 31, 2026)</p>
              <p className="text-[10px] opacity-75">Avoid last-minute rush — file your return early</p>
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${isUrgent ? 'bg-red-200 dark:bg-red-800/40 text-red-800 dark:text-red-200' : 'bg-[var(--accent)]/20 text-[var(--accent)]'}`}>
            {isUrgent ? 'URGENT' : 'ON TRACK'}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="">
            <h4 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider flex items-center gap-1.5 mb-4">
              <FileText className="w-3.5 h-3.5" /> Step-by-Step Guide
            </h4>
            <div className="space-y-1.5">
              {GUIDE_STEPS.map((step, i) => (
                <div key={i} className="border border-[var(--border-subtle)] rounded-xl overflow-hidden transition-all">
                  <button aria-expanded={expandedStep === i} onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--bg-overlay)]/50 transition-colors">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      expandedStep === i
                        ? 'bg-gradient-to-br from-[var(--accent-ink)] to-purple-600 text-white shadow-md shadow-[var(--accent)]/20'
                        : 'bg-[var(--accent)]/10 text-[var(--accent)]'
                    }`}>{i + 1}</div>
                    <span className="text-sm font-semibold text-[var(--text-primary)] flex-1">{step.title}</span>
                    {expandedStep === i ? <ChevronDown className="w-4 h-4 text-[var(--accent)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />}
                  </button>
                  {expandedStep === i && (
                    <div className="px-4 pb-3 pt-0 text-xs text-[var(--text-secondary)] leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                      {step.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="">
            <h4 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider flex items-center gap-1.5 mb-4">
              <FileText className="w-3.5 h-3.5" /> Select Your ITR Form
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ITR_FORMS.map(f => (
                <button key={f.id} onClick={() => setSelectedForm(f.id === selectedForm ? null : f.id)}
                  className={`relative text-left px-4 py-3 rounded-xl text-xs border transition-all ${
                    selectedForm === f.id
                      ? 'bg-[var(--accent)]/10 border-[var(--accent)] shadow-sm shadow-[var(--accent)]/10'
                      : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] hover:border-[var(--accent)]'
                  }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-sm ${selectedForm === f.id ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>{f.id}</span>
                    {selectedForm === f.id && <Check className="w-3.5 h-3.5 text-[var(--accent)]" />}
                  </div>
                  <span className="text-[10px] text-[var(--text-secondary)]">{f.eligibility}</span>
                </button>
              ))}
            </div>
            {selectedForm && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl text-[11px] text-green-700 dark:text-green-300 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="w-4 h-4 inline mr-1.5" />
                {ITR_FORMS.find(f => f.id === selectedForm)?.eligibility}
              </div>
            )}
          </div>

          <div className="">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5" /> Document Checklist
              </h4>
              {checklist.length > 0 && (
                <button onClick={downloadChecklist}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-[var(--accent-ink)] to-purple-600 text-white rounded-lg text-[10px] font-bold shadow-lg shadow-[var(--accent)]/20 transition-all active:scale-95">
                  <Download className="w-3 h-3" /> Download
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {DOCUMENT_CHECKLIST.map(item => (
                <label key={item} className="flex items-start gap-2 cursor-pointer group">
                  <input type="checkbox" checked={checklist.includes(item)} onChange={() => toggleChecklistItem(item)}
                    className="mt-0.5 accent-[var(--accent)] w-3.5 h-3.5 rounded" />
                  <span className={`text-[11px] transition-colors ${checklist.includes(item) ? 'text-[var(--accent)] line-through opacity-60' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
                    {item}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">Tax Calculator</h4>
              <button onClick={() => setShowCalc(!showCalc)}
                className="text-[10px] text-[var(--accent)] font-semibold hover:text-indigo-700 dark:hover:text-indigo-400 transition-colors">
                {showCalc ? 'Hide' : 'Show'}
              </button>
            </div>
            {showCalc && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div>
                  <label htmlFor="lbl-itrfilinghelper-total-annual-income" className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Total Annual Income (₹)</label>
                  <input id="lbl-itrfilinghelper-total-annual-income" aria-label="Total Annual Income (₹)" type="number" value={income} onChange={e => setIncome(e.target.value)}
                    className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] transition-all text-sm"
                    placeholder="e.g. 1500000" />
                </div>
                <div>
                  <label htmlFor="lbl-itrfilinghelper-tax-regime" className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Tax Regime</label>
                  <select id="lbl-itrfilinghelper-tax-regime" aria-label="Tax Regime" value={regime} onChange={e => setRegime(e.target.value)}
                    className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] transition-all text-sm">
                    <option value="new">New Tax Regime (Default)</option>
                    <option value="old">Old Tax Regime (With 80C Deductions)</option>
                  </select>
                </div>
                <button onClick={calculateTax}
                  className="w-full bg-gradient-to-r from-[var(--accent-ink)] to-purple-600 hover:from-[var(--accent-ink)] hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-[var(--accent)]/20 transition-all active:scale-[0.98] text-sm">
                  Calculate Tax
                </button>
                {output && (
                  <div className="bg-[var(--accent)]/10/10 border border-[var(--accent)]/20 rounded-xl p-4">
                    <pre className="text-[11px] text-[var(--accent)] font-mono whitespace-pre-wrap leading-relaxed">{output}</pre>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="">
            <h4 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider flex items-center gap-1.5 mb-4">
              <ExternalLink className="w-3.5 h-3.5" /> Official Resources
            </h4>
            <div className="space-y-2">
              <a href={TAX_PORTAL_URL} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[var(--accent-ink)] to-purple-600 hover:from-[var(--accent-ink)] hover:to-purple-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-[var(--accent)]/20 transition-all active:scale-[0.98]">
                <span>Income Tax Portal (e-Filing)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a href="https://www.tdscpc.gov.in" target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-[var(--text-primary)] font-semibold rounded-xl text-xs transition-all">
                <span>TDS CPC (Form 26AS)</span>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--accent)]" />
              </a>
              <a href="https://www.nsdl.co.in" target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] hover:border-[var(--accent)] text-[var(--text-primary)] font-semibold rounded-xl text-xs transition-all">
                <span>NSDL (PAN Services)</span>
                <ExternalLink className="w-3.5 h-3.5 text-[var(--accent)]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
