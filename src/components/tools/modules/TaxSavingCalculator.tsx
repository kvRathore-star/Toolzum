"use client";

import React, { useState, useMemo } from 'react';
import { Calculator, Download, IndianRupee, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

interface Investment {
  key: string;
  label: string;
  section: '80C' | '80D' | '80CCD(1B)' | 'Other';
  maxLimit: number;
  value: number;
}

const DEFAULT_INVESTMENTS: Investment[] = [
  { key: 'ppf', label: 'PPF', section: '80C', maxLimit: 150000, value: 0 },
  { key: 'epf', label: 'EPF / VPF', section: '80C', maxLimit: 150000, value: 0 },
  { key: 'elic', label: 'LIC / Term Insurance', section: '80C', maxLimit: 150000, value: 0 },
  { key: 'elss', label: 'ELSS Mutual Funds', section: '80C', maxLimit: 150000, value: 0 },
  { key: 'nps80c', label: 'NPS (80C portion)', section: '80C', maxLimit: 150000, value: 0 },
  { key: 'tuition', label: 'Children Tuition Fees', section: '80C', maxLimit: 150000, value: 0 },
  { key: 'fd', label: '5-Year Tax Saving FD', section: '80C', maxLimit: 150000, value: 0 },
  { key: 'scss', label: 'Senior Citizens Savings', section: '80C', maxLimit: 150000, value: 0 },
  { key: 'nps80ccd', label: 'NPS Extra (80CCD(1B))', section: '80CCD(1B)', maxLimit: 50000, value: 0 },
  { key: 'self80d', label: 'Self Health Insurance (80D)', section: '80D', maxLimit: 25000, value: 0 },
  { key: 'family80d', label: 'Family Health Insurance (80D)', section: '80D', maxLimit: 25000, value: 0 },
  { key: 'parent80d', label: 'Parent Health Insurance (80D)', section: '80D', maxLimit: 25000, value: 0 },
];

const OLD_REGIME_SLABS = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250001, max: 500000, rate: 5 },
  { min: 500001, max: 1000000, rate: 20 },
  { min: 1000001, max: Infinity, rate: 30 },
];

const NEW_REGIME_SLABS = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400001, max: 800000, rate: 5 },
  { min: 800001, max: 1200000, rate: 10 },
  { min: 1200001, max: 1600000, rate: 15 },
  { min: 1600001, max: 2000000, rate: 20 },
  { min: 2000001, max: 2400000, rate: 25 },
  { min: 2400001, max: Infinity, rate: 30 },
];

function calcTax(income: number, slabs: { min: number; max: number; rate: number }[]): number {
  let tax = 0;
  for (const slab of slabs) {
    if (income > slab.min) {
      const taxable = Math.min(income, slab.max) - slab.min;
      tax += taxable * (slab.rate / 100);
    }
  }
  return tax;
}

export default function TaxSavingCalculator() {
  const [grossIncome, setGrossIncome] = useState('1200000');
  const [age, setAge] = useState('30');
  const [investments, setInvestments] = useState<Investment[]>(DEFAULT_INVESTMENTS);

  const updateInvestment = (key: string, value: number) => {
    setInvestments(prev => prev.map(inv => inv.key === key ? { ...inv, value: Math.min(value, inv.maxLimit) } : inv));
  };

  const total80C = useMemo(() =>
    Math.min(investments.filter(i => i.section === '80C').reduce((s, i) => s + i.value, 0), 150000),
    [investments]);

  const total80CCD = useMemo(() =>
    Math.min(investments.filter(i => i.section === '80CCD(1B)').reduce((s, i) => s + i.value, 0), 50000),
    [investments]);

  const total80D = useMemo(() => {
    const self = Math.min(investments.find(i => i.key === 'self80d')?.value || 0, age === '60' ? 50000 : 25000);
    const family = Math.min(investments.find(i => i.key === 'family80d')?.value || 0, 25000);
    const parent = Math.min(investments.find(i => i.key === 'parent80d')?.value || 0, 25000);
    return self + family + parent;
  }, [investments, age]);

  const totalDeductions = useMemo(() => total80C + total80CCD + total80D, [total80C, total80CCD, total80D]);

  const result = useMemo(() => {
    const income = Number(grossIncome) || 0;
    const standardDeduction = 50000;
    const oldTaxable = Math.max(0, income - standardDeduction - totalDeductions);
    const newTaxable = Math.max(0, income - standardDeduction);

    const oldTaxBeforeCess = calcTax(oldTaxable, OLD_REGIME_SLABS);
    const newTaxBeforeCess = calcTax(newTaxable, NEW_REGIME_SLABS);

    const cessOld = oldTaxBeforeCess * 0.04;
    const cessNew = newTaxBeforeCess * 0.04;

    const rebateOld = oldTaxable <= 500000 ? Math.min(oldTaxBeforeCess, 12500) : 0;
    const rebateNew = newTaxable <= 700000 ? Math.min(newTaxBeforeCess, 25000) : 0;

    return {
      grossIncome: income,
      standardDeduction,
      taxableOld: oldTaxable,
      taxableNew: newTaxable,
      oldTax: oldTaxBeforeCess,
      newTax: newTaxBeforeCess,
      cessOld, cessNew,
      rebateOld, rebateNew,
      totalOld: Math.max(0, oldTaxBeforeCess + cessOld - rebateOld),
      totalNew: Math.max(0, newTaxBeforeCess + cessNew - rebateNew),
      saving: Math.max(0, (oldTaxBeforeCess + cessOld - rebateOld) - (newTaxBeforeCess + cessNew - rebateNew)),
      effectiveRateOld: income > 0 ? ((oldTaxBeforeCess + cessOld - rebateOld) / income) * 100 : 0,
      effectiveRateNew: income > 0 ? ((newTaxBeforeCess + cessNew - rebateNew) / income) * 100 : 0,
    };
  }, [grossIncome, totalDeductions]);

  const exportReport = () => {
    if (!result) return;
    const report = [
      '=== TAX SAVING CALCULATOR REPORT (FY 2025-26) ===',
      `Gross Annual Income: ₹${result.grossIncome.toLocaleString('en-IN')}`,
      `Age: ${age === '60' ? '60+ years' : 'Under 60'}`,
      '',
      '--- DEDUCTIONS ---',
      `Section 80C Total: ₹${total80C.toLocaleString('en-IN')} (max ₹1.5L)`,
      `Section 80CCD(1B) NPS Extra: ₹${total80CCD.toLocaleString('en-IN')} (max ₹50K)`,
      `Section 80D Health Insurance: ₹${total80D.toLocaleString('en-IN')}`,
      `Total Deductions: ₹${totalDeductions.toLocaleString('en-IN')}`,
      '',
      '--- OLD REGIME ---',
      `Taxable Income: ₹${result.taxableOld.toLocaleString('en-IN')}`,
      `Tax: ₹${result.oldTax.toLocaleString('en-IN')}`,
      `Cess (4%): ₹${result.cessOld.toLocaleString('en-IN')}`,
      `Rebate: ₹${result.rebateOld.toLocaleString('en-IN')}`,
      `Total Tax: ₹${result.totalOld.toLocaleString('en-IN')}`,
      `Effective Rate: ${result.effectiveRateOld.toFixed(1)}%`,
      '',
      '--- NEW REGIME ---',
      `Taxable Income: ₹${result.taxableNew.toLocaleString('en-IN')}`,
      `Tax: ₹${result.newTax.toLocaleString('en-IN')}`,
      `Cess (4%): ₹${result.cessNew.toLocaleString('en-IN')}`,
      `Rebate: ₹${result.rebateNew.toLocaleString('en-IN')}`,
      `Total Tax: ₹${result.totalNew.toLocaleString('en-IN')}`,
      `Effective Rate: ${result.effectiveRateNew.toFixed(1)}%`,
      '',
      `You save ₹${result.saving.toLocaleString('en-IN')} by choosing the ${result.saving > 0 ? 'OLD regime' : 'NEW regime'}`,
      '',
      'Generated by ToolHub Tax Calculator',
    ].join('\n');
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `tax_report_${new Date().toISOString().slice(0, 10)}.txt`);
    toast.success('Report downloaded!');
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <IndianRupee className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Tax Saving Calculator (80C / 80D)</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Gross Annual Income (₹)</label>
              <input type="number" value={grossIncome} onChange={e => setGrossIncome(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Age</label>
              <select value={age} onChange={e => setAge(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none">
                <option value="30">Under 60</option>
                <option value="60">60 years or above</option>
              </select>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-blue-500 mb-2">Section 80C Investments (max ₹1.5L)</h4>
            <div className="space-y-2">
              {investments.filter(i => i.section === '80C').map(inv => (
                <div key={inv.key} className="grid grid-cols-3 gap-2 items-center">
                  <label className="text-[11px] text-zinc-500">{inv.label}</label>
                  <input type="number" value={inv.value || ''} onChange={e => updateInvestment(inv.key, Number(e.target.value) || 0)} placeholder="0"
                    className="col-span-2 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
              ))}
              <div className="flex justify-between text-xs pt-1 border-t border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-500">Total 80C</span>
                <span className="font-semibold text-zinc-800 dark:text-white">₹{total80C.toLocaleString('en-IN')} / ₹1,50,000</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-purple-500 mb-2">Section 80CCD(1B) NPS Extra (max ₹50K)</h4>
            {investments.filter(i => i.section === '80CCD(1B)').map(inv => (
              <div key={inv.key} className="grid grid-cols-3 gap-2 items-center">
                <label className="text-[11px] text-zinc-500">{inv.label}</label>
                <input type="number" value={inv.value || ''} onChange={e => updateInvestment(inv.key, Number(e.target.value) || 0)} placeholder="0"
                  className="col-span-2 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
            ))}
          </div>

          <div>
            <h4 className="text-xs font-bold text-amber-500 mb-2">Section 80D Health Insurance</h4>
            {investments.filter(i => i.section === '80D').map(inv => (
              <div key={inv.key} className="grid grid-cols-3 gap-2 items-center">
                <label className="text-[11px] text-zinc-500">{inv.label}</label>
                <input type="number" value={inv.value || ''} onChange={e => updateInvestment(inv.key, Number(e.target.value) || 0)} placeholder="0"
                  className="col-span-2 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
            ))}
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-3">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Total Deductions</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{totalDeductions.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tax Comparison</span>
            <button onClick={exportReport} className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
              <Download className="w-3 h-3" /> Export Report
            </button>
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-50 dark:bg-black/30 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Old Regime</span>
                </div>
                <p className="text-3xl font-black text-zinc-800 dark:text-white">₹{result.totalOld.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-zinc-500">Effective rate: {result.effectiveRateOld.toFixed(1)}%</p>
              </div>
              <div className="bg-zinc-50 dark:bg-black/30 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">New Regime</span>
                </div>
                <p className="text-3xl font-black text-zinc-800 dark:text-white">₹{result.totalNew.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-zinc-500">Effective rate: {result.effectiveRateNew.toFixed(1)}%</p>
              </div>
            </div>

            {result.saving > 0 ? (
              <div className="bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-300 dark:border-emerald-700 rounded-xl p-4 text-center">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">You save ₹{result.saving.toLocaleString('en-IN')} with the OLD regime</p>
                <p className="text-[10px] text-emerald-500 mt-0.5">Maximize your 80C, 80D, and NPS investments</p>
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-4 text-center">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">NEW regime is better for you at this income level</p>
                <p className="text-[10px] text-blue-500 mt-0.5">No need to invest in 80C instruments</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1.5 p-3 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between"><span className="text-zinc-500">Taxable Income</span><span className="font-semibold">₹{result.taxableOld.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Tax</span><span className="font-semibold">₹{result.oldTax.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Cess (4%)</span><span className="font-semibold">₹{result.cessOld.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Rebate</span><span className="font-semibold text-red-500">-₹{result.rebateOld.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-700 pt-1"><span className="font-semibold">Total (Old)</span><span className="font-bold text-blue-500">₹{result.totalOld.toLocaleString('en-IN')}</span></div>
              </div>
              <div className="space-y-1.5 p-3 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between"><span className="text-zinc-500">Taxable Income</span><span className="font-semibold">₹{result.taxableNew.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Tax</span><span className="font-semibold">₹{result.newTax.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Cess (4%)</span><span className="font-semibold">₹{result.cessNew.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Rebate</span><span className="font-semibold text-red-500">-₹{result.rebateNew.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-700 pt-1"><span className="font-semibold">Total (New)</span><span className="font-bold text-emerald-500">₹{result.totalNew.toLocaleString('en-IN')}</span></div>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
                <strong>Pro:</strong> Personalized investment recommendation engine, year-by-year comparison, capital gains tax calculator, and CA-reviewed tax planning report. Save ₹50K+ more with AI-optimized tax strategy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
