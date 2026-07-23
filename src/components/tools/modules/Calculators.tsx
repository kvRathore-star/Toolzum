"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Copy, Delete } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CalculatorShell } from './shared/CalculatorShell';

const gradePointsMap: Record<string, number> = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0 };
const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
function factorial(n: number): number {
  if (n < 0) throw new Error('Factorial of negative number');
  if (n === 0 || n === 1) return 1;
  if (!Number.isInteger(n)) throw new Error('Factorial of non-integer');
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
const inputCls = "w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors";
const labelCls = "block text-sm font-bold text-[var(--text-primary)] mb-1.5";
const btnCls = "mt-4 px-6 py-3 rounded-xl font-bold text-sm transition-all bg-[var(--accent)] text-white hover:opacity-90 active:scale-95";

export function MortgageCalculator() {
  const [loan, setLoan] = useState('300000');
  const [rate, setRate] = useState('6.5');
  const [years, setYears] = useState('30');
  const [result, setResult] = useState('');
  const [amort, setAmort] = useState<Array<{year: number; principal: number; interest: number; balance: number}>>([]);
  const calc = useCallback(() => {
    const p = parseFloat(loan);
    const annualRate = parseFloat(rate) / 100;
    const r = annualRate / 12;
    const n = parseFloat(years) * 12;
    if (!p || !r || !n) return;
    const pmt = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const total = pmt * n;
    const table: Array<{year: number; principal: number; interest: number; balance: number}> = [];
    let bal = p;
    for (let yr = 1; yr <= parseFloat(years); yr++) {
      let yrPrincipal = 0;
      let yrInterest = 0;
      for (let m = 0; m < 12; m++) {
        const intPart = bal * r;
        const prinPart = pmt - intPart;
        yrPrincipal += prinPart;
        yrInterest += intPart;
        bal -= prinPart;
      }
      if (bal < 0) bal = 0;
      table.push({ year: yr, principal: Math.round(yrPrincipal * 100) / 100, interest: Math.round(yrInterest * 100) / 100, balance: Math.round(bal * 100) / 100 });
    }
    setAmort(table);
    setResult(`Monthly Payment: $${pmt.toFixed(2)}\nTotal Payment: $${total.toFixed(2)}\nTotal Interest: $${(total - p).toFixed(2)}`);
  }, [loan, rate, years]);
  const presets = [
    { label: '30yr Fixed 6.5%', apply: () => { setLoan('300000'); setRate('6.5'); setYears('30'); } },
    { label: '15yr Fixed 5.5%', apply: () => { setLoan('300000'); setRate('5.5'); setYears('15'); } },
    { label: 'Jumbo 30yr', apply: () => { setLoan('750000'); setRate('6.75'); setYears('30'); } },
  ];
  const downloadData = result ? `Metric,Value\nMonthly Payment,$${result.split('\n')[0].split(': $')[1]}\nTotal Payment,$${result.split('\n')[1].split(': $')[1]}\nTotal Interest,$${result.split('\n')[2].split(': $')[1]}` : undefined;
  return (
    <CalculatorShell title="Mortgage Calculator" result={result} onCalculate={calc} presets={presets} downloadData={downloadData} downloadFilename="mortgage.csv" accent="indigo">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Loan Amount ($)</label><input type="number" value={loan} onChange={e => setLoan(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Loan Term (years)</label><input type="number" value={years} onChange={e => setYears(e.target.value)} className={inputCls} /></div>
      </div>
      {amort.length > 0 && (
        <div className="bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-2 border-b border-[var(--border-subtle)] text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Amortization Schedule (Yearly)</div>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[var(--bg-overlay)]">
                <tr className="text-[var(--text-tertiary)] border-b border-[var(--border-subtle)]">
                  <th className="text-left px-3 py-2">Year</th><th className="text-right px-3 py-2">Principal</th><th className="text-right px-3 py-2">Interest</th><th className="text-right px-3 py-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {amort.slice(0, 10).map(row => (
                  <tr key={row.year} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-elevated)]/50">
                    <td className="px-3 py-1.5 text-[var(--text-primary)] font-medium">{row.year}</td>
                    <td className="px-3 py-1.5 text-right text-green-400">${row.principal.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right text-red-400">${row.interest.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right text-[var(--text-secondary)]">${row.balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function ArrCalculator() {
  const [subRev, setSubRev] = useState('100000');
  const [expRev, setExpRev] = useState('20000');
  const [churnRev, setChurnRev] = useState('5000');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const sub = parseFloat(subRev) || 0;
    const exp = parseFloat(expRev) || 0;
    const churn = parseFloat(churnRev) || 0;
    const netNew = exp - churn;
    const arr = sub + exp - churn;
    setResult(`ARR: $${arr.toLocaleString()}\nSubscriptions: $${sub.toLocaleString()}\nExpansion: $${exp.toLocaleString()}\nChurn: -$${churn.toLocaleString()}\nNet New: $${netNew.toLocaleString()}`);
  }, [subRev, expRev, churnRev]);
  const presets = [
    { label: 'SaaS Startup', apply: () => { setSubRev('50000'); setExpRev('10000'); setChurnRev('3000'); } },
    { label: 'Enterprise', apply: () => { setSubRev('500000'); setExpRev('100000'); setChurnRev('25000'); } },
    { label: 'Hypergrowth', apply: () => { setSubRev('200000'); setExpRev('80000'); setChurnRev('5000'); } },
  ];
  const netNew = (parseFloat(expRev) || 0) - (parseFloat(churnRev) || 0);
  const arr = (parseFloat(subRev) || 0) + (parseFloat(expRev) || 0) - (parseFloat(churnRev) || 0);
  const maxVal = Math.max(1, (parseFloat(subRev) || 0) + (parseFloat(expRev) || 0));
  return (
    <CalculatorShell title="ARR Calculator" result={result} onCalculate={calc} presets={presets} accent="blue">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Subscription Revenue ($)</label><input type="number" value={subRev} onChange={e => setSubRev(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Expansion Revenue ($)</label><input type="number" value={expRev} onChange={e => setExpRev(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Churn Revenue ($)</label><input type="number" value={churnRev} onChange={e => setChurnRev(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="space-y-2">
          {[
            { label: 'Subscriptions', value: parseFloat(subRev) || 0, color: 'bg-indigo-500' },
            { label: 'Expansion', value: parseFloat(expRev) || 0, color: 'bg-emerald-500' },
            { label: 'Churn', value: -(parseFloat(churnRev) || 0), color: 'bg-red-500' },
          ].map(bar => (
            <div key={bar.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[var(--text-secondary)]">{bar.label}</span>
                <span className="text-[var(--text-primary)] font-medium">${bar.value.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-[var(--bg-overlay)] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${bar.color}`} style={{ width: `${Math.abs(bar.value) / maxVal * 100}%` }} />
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-[var(--text-primary)]">ARR</span>
              <span className="text-indigo-400">${arr.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState('10000');
  const [rate, setRate] = useState('5');
  const [n, setN] = useState('12');
  const [t, setT] = useState('10');
  const [result, setResult] = useState('');
  const [yearData, setYearData] = useState<Array<{year: number; value: number; deposited: number; interest: number}>>([]);
  const calc = useCallback(() => {
    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const nPerYear = parseFloat(n);
    const years = parseFloat(t);
    if (!P || !r || !nPerYear || !years) return;
    const A = P * Math.pow(1 + r / nPerYear, nPerYear * years);
    const table: Array<{year: number; value: number; deposited: number; interest: number}> = [];
    for (let y = 1; y <= years; y++) {
      const val = P * Math.pow(1 + r / nPerYear, nPerYear * y);
      table.push({ year: y, value: Math.round(val * 100) / 100, deposited: P, interest: Math.round((val - P) * 100) / 100 });
    }
    setYearData(table);
    setResult(`Final Amount: $${A.toFixed(2)}\nTotal Interest: $${(A - P).toFixed(2)}\nEffective Rate: ${((A / P) ** (1 / years) - 1).toFixed(2)}%`);
  }, [principal, rate, n, t]);
  const presets = [
    { label: 'S&P Avg (10yr)', apply: () => { setPrincipal('10000'); setRate('10'); setN('1'); setT('10'); } },
    { label: 'Monthly Save (5yr)', apply: () => { setPrincipal('5000'); setRate('7'); setN('12'); setT('5'); } },
    { label: 'Retirement (30yr)', apply: () => { setPrincipal('50000'); setRate('8'); setN('12'); setT('30'); } },
  ];
  const maxVal = yearData.length > 0 ? yearData[yearData.length - 1].value : 1;
  return (
    <CalculatorShell title="Compound Interest Calculator" result={result} onCalculate={calc} presets={presets} accent="emerald">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Principal ($)</label><input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Annual Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Compounds/Yr</label><input type="number" value={n} onChange={e => setN(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Years</label><input type="number" value={t} onChange={e => setT(e.target.value)} className={inputCls} /></div>
      </div>
      {yearData.length > 0 && (
        <div className="bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-2 border-b border-[var(--border-subtle)] text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Year-by-Year Growth</div>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[var(--bg-overlay)]">
                <tr className="text-[var(--text-tertiary)] border-b border-[var(--border-subtle)]">
                  <th className="text-left px-3 py-2">Year</th><th className="text-right px-3 py-2">Value</th><th className="text-right px-3 py-2">Interest</th><th className="text-right px-3 py-2">Growth</th>
                </tr>
              </thead>
              <tbody>
                {yearData.map(row => (
                  <tr key={row.year} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-elevated)]/50">
                    <td className="px-3 py-1.5 text-[var(--text-primary)] font-medium">{row.year}</td>
                    <td className="px-3 py-1.5 text-right text-indigo-400 font-medium">${row.value.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right text-emerald-400">${row.interest.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <div className="w-16 h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(row.value / maxVal) * 100}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function CarLoanCalculator() {
  const [loan, setLoan] = useState('35000');
  const [rate, setRate] = useState('4.5');
  const [years, setYears] = useState('5');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(years) * 12;
    const p = parseFloat(loan);
    if (!p || !r || !n) return;
    const pmt = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const t = pmt * n;
    const totalPct = ((t - p) / p) * 100;
    setResult(`Monthly Payment: $${pmt.toFixed(2)}\nTotal Payment: $${t.toFixed(2)}\nTotal Interest: $${(t - p).toFixed(2)}\nInterest as % of Loan: ${totalPct.toFixed(1)}%`);
  }, [loan, rate, years]);
  const presets = [
    { label: 'New Car 5yr', apply: () => { setLoan('35000'); setRate('4.5'); setYears('5'); } },
    { label: 'Used Car 3yr', apply: () => { setLoan('18000'); setRate('6.0'); setYears('3'); } },
    { label: 'Luxury 6yr', apply: () => { setLoan('65000'); setRate('5.0'); setYears('6'); } },
  ];
  const r = parseFloat(rate) / 100 / 12;
  const n = parseFloat(years) * 12;
  const p = parseFloat(loan);
  const pmt = p && r ? p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : 0;
  return (
    <CalculatorShell title="Car Loan Calculator" result={result} onCalculate={calc} presets={presets} accent="violet">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Loan Amount ($)</label><input type="number" value={loan} onChange={e => setLoan(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Loan Term (years)</label><input type="number" value={years} onChange={e => setYears(e.target.value)} className={inputCls} /></div>
      </div>
      {result && pmt > 0 && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-400">${pmt.toFixed(0)}</div>
              <div className="text-xs text-[var(--text-tertiary)]">per month</div>
            </div>
            <div className="h-12 w-px bg-[var(--border-subtle)]" />
            <div className="text-center">
              <div className="text-lg font-bold text-[var(--text-primary)]">${(pmt * n).toFixed(0)}</div>
              <div className="text-xs text-[var(--text-tertiary)]">total paid</div>
            </div>
            <div className="h-12 w-px bg-[var(--border-subtle)]" />
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-400">${(pmt * n - p).toFixed(0)}</div>
              <div className="text-xs text-[var(--text-tertiary)]">total interest</div>
            </div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function CarLeaseCalculator() {
  const [capCost, setCapCost] = useState('30000');
  const [residual, setResidual] = useState('15000');
  const [term, setTerm] = useState('36');
  const [mf, setMf] = useState('0.00125');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const cap = parseFloat(capCost) || 0;
    const res = parseFloat(residual) || 0;
    const t = parseFloat(term) || 1;
    const moneyFactor = parseFloat(mf) || 0;
    const depreciation = (cap - res) / t;
    const finance = (cap + res) * moneyFactor;
    const monthly = depreciation + finance;
    const apr = moneyFactor * 2400;
    setResult(`Monthly Payment: $${monthly.toFixed(2)}\nDepreciation: $${depreciation.toFixed(2)}/mo\nFinance Charge: $${finance.toFixed(2)}/mo\nMoney Factor APR: ${apr.toFixed(2)}%\nTotal Lease Cost: $${(monthly * t).toFixed(2)}`);
  }, [capCost, residual, term, mf]);
  const presets = [
    { label: 'Economy 36mo', apply: () => { setCapCost('25000'); setResidual('12500'); setTerm('36'); setMf('0.00150'); } },
    { label: 'Luxury 36mo', apply: () => { setCapCost('55000'); setResidual('30250'); setTerm('36'); setMf('0.00125'); } },
    { label: 'SUV 48mo', apply: () => { setCapCost('45000'); setResidual('20250'); setTerm('48'); setMf('0.00175'); } },
  ];
  const cap = parseFloat(capCost) || 0;
  const res = parseFloat(residual) || 0;
  const monthly = cap && res ? ((cap - res) / (parseFloat(term) || 1)) + (cap + res) * (parseFloat(mf) || 0) : 0;
  return (
    <CalculatorShell title="Car Lease Calculator" result={result} onCalculate={calc} presets={presets} accent="amber">
      <div className="grid grid-cols-2 gap-4">
        <div className="md:col-span-2"><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Capitalized Cost ($)</label><input type="number" value={capCost} onChange={e => setCapCost(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Residual Value ($)</label><input type="number" value={residual} onChange={e => setResidual(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Lease Term (months)</label><input type="number" value={term} onChange={e => setTerm(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Money Factor</label><input type="number" value={mf} onChange={e => setMf(e.target.value)} step="0.00001" className={inputCls} /></div>
      </div>
      {result && monthly > 0 && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
          <div className="text-center mb-3">
            <div className="text-3xl font-bold text-amber-400">${monthly.toFixed(0)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">monthly lease payment</div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 bg-[var(--bg-elevated)] rounded-lg p-3 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Residual</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">{((res / cap) * 100).toFixed(0)}%</div>
            </div>
            <div className="flex-1 bg-[var(--bg-elevated)] rounded-lg p-3 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">APR</div>
              <div className="text-sm font-bold text-amber-400">{((parseFloat(mf) || 0) * 2400).toFixed(2)}%</div>
            </div>
            <div className="flex-1 bg-[var(--bg-elevated)] rounded-lg p-3 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Total</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">${(monthly * (parseFloat(term) || 1)).toFixed(0)}</div>
            </div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function ChurnRateCalculator() {
  const [lost, setLost] = useState('50');
  const [total, setTotal] = useState('1000');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const l = parseFloat(lost);
    const t = parseFloat(total);
    if (!t) return;
    const churn = (l / t) * 100;
    const retention = 100 - churn;
    const annualChurn = 100 - Math.pow(1 - churn / 100, 12) * 100;
    const avgLifetime = churn > 0 ? (1 / (churn / 100)) : Infinity;
    setResult(`Churn Rate: ${churn.toFixed(2)}%\nRetention Rate: ${retention.toFixed(2)}%\nAnnualized Churn: ${annualChurn.toFixed(2)}%\nAvg Customer Lifetime: ${avgLifetime === Infinity ? 'N/A' : avgLifetime.toFixed(1) + ' months'}\nCustomers Retained: ${Math.round(t - l)}`);
  }, [lost, total]);
  const presets = [
    { label: 'SaaS Avg', apply: () => { setLost('50'); setTotal('1000'); } },
    { label: 'High Churn', apply: () => { setLost('150'); setTotal('1000'); } },
    { label: 'Low Churn', apply: () => { setLost('25'); setTotal('1000'); } },
  ];
  const l = parseFloat(lost) || 0;
  const t = parseFloat(total) || 1;
  const churnPct = (l / t) * 100;
  return (
    <CalculatorShell title="Churn Rate Calculator" result={result} onCalculate={calc} presets={presets} accent="rose">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Customers Lost</label><input type="number" value={lost} onChange={e => setLost(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Total Customers</label><input type="number" value={total} onChange={e => setTotal(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--text-secondary)]">Churn</span>
              <span className="text-red-400 font-medium">{churnPct.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-[var(--bg-overlay)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(churnPct, 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--text-secondary)]">Retention</span>
              <span className="text-emerald-400 font-medium">{(100 - churnPct).toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-[var(--bg-overlay)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${100 - Math.min(churnPct, 100)}%` }} />
            </div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function ConversionRateCalculator() {
  const [conversions, setConversions] = useState('50');
  const [visitors, setVisitors] = useState('1000');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const c = parseFloat(conversions) || 0;
    const v = parseFloat(visitors) || 0;
    if (!v) return;
    const cr = (c / v) * 100;
    const nonConverted = v - c;
    setResult(`Conversion Rate: ${cr.toFixed(2)}%\nConversions: ${c}\nVisitors: ${v}\nDid Not Convert: ${nonConverted}`);
  }, [conversions, visitors]);
  const presets = [
    { label: 'E-commerce', apply: () => { setConversions('30'); setVisitors('1000'); } },
    { label: 'SaaS Signup', apply: () => { setConversions('50'); setVisitors('1000'); } },
    { label: 'Lead Gen', apply: () => { setConversions('100'); setVisitors('1000'); } },
  ];
  const c = parseFloat(conversions) || 0;
  const v = parseFloat(visitors) || 1;
  const cr = (c / v) * 100;
  return (
    <CalculatorShell title="Conversion Rate Calculator" result={result} onCalculate={calc} presets={presets} accent="cyan">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Conversions</label><input type="number" value={conversions} onChange={e => setConversions(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Total Visitors</label><input type="number" value={visitors} onChange={e => setVisitors(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-[var(--bg-overlay)] rounded-xl p-3 border border-[var(--border-subtle)]">
            <span className="text-sm text-[var(--text-secondary)]">Conversion Rate</span>
            <span className="text-2xl font-bold text-indigo-400">{cr.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(cr, 100)}%` }} />
          </div>
          <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
            <span>{Math.round(c)} converted</span>
            <span>{Math.round(v - c)} did not convert</span>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function DebtPayoffCalculator() {
  const [balance, setBalance] = useState('10000');
  const [rate, setRate] = useState('18');
  const [payment, setPayment] = useState('500');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const b = parseFloat(balance) || 0;
    const annualRate = parseFloat(rate) || 0;
    const r = annualRate / 100 / 12;
    const p = parseFloat(payment) || 0;
    if (!b || !p) return;
    if (p <= b * r) { setResult('Payment too low - not covering monthly interest. Increase payment.'); return; }
    let remaining = b;
    let months = 0;
    let totalPaid = 0;
    let totalInterest = 0;
    while (remaining > 0 && months < 600) {
      const interest = remaining * r;
      const principal = Math.min(p - interest, remaining);
      remaining -= principal;
      totalPaid += p;
      totalInterest += Math.min(interest, p);
      months++;
    }
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    setResult(`Payoff Time: ${years > 0 ? `${years} yr ${remMonths} mo` : `${months} mo`}\nTotal Paid: $${totalPaid.toFixed(2)}\nTotal Interest: $${totalInterest.toFixed(2)}\nInterest Saved vs Min: ${months < 600 ? `$${(b * (Math.pow(1 + r, months) - 1) - totalInterest).toFixed(0)}` : 'N/A'}`);
  }, [balance, rate, payment]);
  const presets = [
    { label: 'Credit Card', apply: () => { setBalance('10000'); setRate('18'); setPayment('500'); } },
    { label: 'Student Loan', apply: () => { setBalance('35000'); setRate('5.5'); setPayment('400'); } },
    { label: 'Personal Loan', apply: () => { setBalance('15000'); setRate('10'); setPayment('350'); } },
  ];
  const b = parseFloat(balance) || 0;
  const r = (parseFloat(rate) || 0) / 100 / 12;
  const p = parseFloat(payment) || 0;
  let payoffMonths = 0;
  if (b && p && p > b * r) {
    let rem = b;
    while (rem > 0 && payoffMonths < 600) {
      const intPart = rem * r;
      rem -= Math.min(p - intPart, rem);
      payoffMonths++;
    }
  }
  return (
    <CalculatorShell title="Debt Payoff Calculator" result={result} onCalculate={calc} presets={presets} accent="orange">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Current Balance ($)</label><input type="number" value={balance} onChange={e => setBalance(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Annual Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Monthly Payment ($)</label><input type="number" value={payment} onChange={e => setPayment(e.target.value)} className={inputCls} /></div>
      </div>
      {result && payoffMonths > 0 && (
        <div className="bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-tertiary)]">Payoff Timeline</span>
              <span className="text-xs font-bold text-[var(--text-primary)]">{payoffMonths} months ({Math.floor(payoffMonths / 12)} yr {payoffMonths % 12} mo)</span>
            </div>
            <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden relative">
              {[25, 50, 75, 100].map(pct => (
                <div key={pct} className="absolute top-0 h-full w-px bg-[var(--border-subtle)]" style={{ left: `${pct}%` }} />
              ))}
              <div className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-500" style={{ width: '100%' }} />
            </div>
            <div className="flex justify-between text-xs mt-1 text-[var(--text-tertiary)]">
              <span>Month 0</span>
              <span>Month {payoffMonths}</span>
            </div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function DiscountCalculator() {
  const [price, setPrice] = useState('100');
  const [discount, setDiscount] = useState('20');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const p = parseFloat(price) || 0;
    const d = parseFloat(discount) || 0;
    const savings = p * d / 100;
    const final = p - savings;
    setResult(`Original: $${p.toFixed(2)}\nDiscount: ${d}% (-$${savings.toFixed(2)})\nFinal Price: $${final.toFixed(2)}\nYou Save: $${savings.toFixed(2)}`);
  }, [price, discount]);
  const presets = [
    { label: 'Flash Sale 50%', apply: () => { setPrice('100'); setDiscount('50'); } },
    { label: 'Seasonal 30%', apply: () => { setPrice('200'); setDiscount('30'); } },
    { label: 'Clearance 70%', apply: () => { setPrice('150'); setDiscount('70'); } },
  ];
  const p = parseFloat(price) || 0;
  const d = parseFloat(discount) || 0;
  const savings = p * d / 100;
  const final = p - savings;
  return (
    <CalculatorShell title="Discount Calculator" result={result} onCalculate={calc} presets={presets} accent="teal">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Original Price ($)</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Discount (%)</label><input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
          <div className="flex justify-between items-end mb-3">
            <div className="text-center flex-1">
              <div className="text-lg line-through text-[var(--text-tertiary)]">${p.toFixed(0)}</div>
              <div className="text-xs text-[var(--text-tertiary)]">Original</div>
            </div>
            <div className="text-2xl font-bold text-emerald-400 px-4">&#8594;</div>
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-[var(--text-primary)]">${final.toFixed(0)}</div>
              <div className="text-xs text-[var(--text-tertiary)]">Final Price</div>
            </div>
          </div>
          <div className="bg-emerald-500/10 rounded-lg p-2 text-center">
            <span className="text-sm font-bold text-emerald-400">You Save ${savings.toFixed(2)} ({d}% off)</span>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}


export function HourlyToSalaryCalculator() {
  const [hourly, setHourly] = useState('25');
  const [hoursPerWeek, setHoursPerWeek] = useState('40');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const h = parseFloat(hourly) || 0;
    const hpw = parseFloat(hoursPerWeek) || 0;
    const annual = h * hpw * 52;
    const monthly = annual / 12;
    const biweekly = annual / 26;
    const weekly = h * hpw;
    const daily = h * 8;
    setResult(`Annual: $${annual.toLocaleString()}\nMonthly: $${monthly.toLocaleString()}\nBiweekly: $${biweekly.toLocaleString()}\nWeekly: $${weekly.toLocaleString()}\nDaily (8h): $${daily.toLocaleString()}\nHourly: $${h.toFixed(2)}`);
  }, [hourly, hoursPerWeek]);
  const presets = [
    { label: 'Min Wage', apply: () => { setHourly('15'); setHoursPerWeek('40'); } },
    { label: 'Mid Career', apply: () => { setHourly('35'); setHoursPerWeek('40'); } },
    { label: 'Senior/Tech', apply: () => { setHourly('75'); setHoursPerWeek('40'); } },
  ];
  const h = parseFloat(hourly) || 0;
  const hpw = parseFloat(hoursPerWeek) || 0;
  const annual = h * hpw * 52;
  const monthly = annual / 12;
  return (
    <CalculatorShell title="Hourly to Salary Calculator" result={result} onCalculate={calc} presets={presets} accent="pink">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Hourly Rate ($)</label><input type="number" value={hourly} onChange={e => setHourly(e.target.value)} step="0.01" className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Hours per Week</label><input type="number" value={hoursPerWeek} onChange={e => setHoursPerWeek(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Annual', value: `$${annual.toLocaleString()}`, color: 'text-indigo-400' },
            { label: 'Monthly', value: `$${monthly.toLocaleString()}`, color: 'text-emerald-400' },
            { label: 'Biweekly', value: `$${(annual / 26).toLocaleString()}`, color: 'text-amber-400' },
            { label: 'Weekly', value: `$${(h * hpw).toLocaleString()}`, color: 'text-rose-400' },
          ].map(card => (
            <div key={card.label} className="bg-[var(--bg-overlay)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
              <div className={`text-lg font-bold ${card.color}`}>{card.value}</div>
              <div className="text-xs text-[var(--text-tertiary)]">{card.label}</div>
            </div>
          ))}
        </div>
      )}
    </CalculatorShell>
  );
}

export function InflationCalculator() {
  const [present, setPresent] = useState('1000');
  const [rate, setRate] = useState('3');
  const [years, setYears] = useState('10');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const p = parseFloat(present) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const y = parseFloat(years) || 0;
    const fv = p * Math.pow(1 + r, y);
    const loss = fv - p;
    const buyingPowerLoss = (1 - p / fv) * 100;
    setResult(`Future Value: $${fv.toFixed(2)}\nLoss of Purchasing Power: $${Math.abs(loss).toFixed(2)}\nBuying Power Reduction: ${buyingPowerLoss.toFixed(1)}%\nPresent Value: $${p.toFixed(2)}`);
  }, [present, rate, years]);
  const presets = [
    { label: '10yr @ 3%', apply: () => { setPresent('1000'); setRate('3'); setYears('10'); } },
    { label: '20yr @ 4%', apply: () => { setPresent('1000'); setRate('4'); setYears('20'); } },
    { label: '30yr @ 2.5%', apply: () => { setPresent('100000'); setRate('2.5'); setYears('30'); } },
  ];
  const p = parseFloat(present) || 0;
  const r = (parseFloat(rate) || 0) / 100;
  const y = parseFloat(years) || 0;
  const fv = p * Math.pow(1 + r, y);
  return (
    <CalculatorShell title="Inflation Calculator" result={result} onCalculate={calc} presets={presets} accent="lime">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Present Value ($)</label><input type="number" value={present} onChange={e => setPresent(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Inflation Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Years</label><input type="number" value={years} onChange={e => setYears(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Today</div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">${p.toFixed(0)}</div>
            </div>
            <div className="text-2xl text-red-400">&#8594;</div>
            <div className="text-center">
              <div className="text-xs text-[var(--text-tertiary)]">In {y} years</div>
              <div className="text-2xl font-bold text-amber-400">${fv.toFixed(0)}</div>
            </div>
          </div>
          <div className="mt-3 h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full" style={{ width: `${Math.min((fv / (p * 2)) * 100, 100)}%` }} />
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function LtvCalculator() {
  const [arpu, setArpu] = useState('50');
  const [churn, setChurn] = useState('5');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const ltv = parseFloat(arpu) / (parseFloat(churn) / 100);
    setResult(`Customer Lifetime Value: $${ltv.toFixed(2)}`);
  }, [arpu, churn]);
  const presets = [
    { label: 'SaaS', apply: () => { setArpu('50'); setChurn('5'); } },
    { label: 'Enterprise', apply: () => { setArpu('500'); setChurn('3'); } },
    { label: 'Consumer', apply: () => { setArpu('10'); setChurn('8'); } },
  ];
  const ltv = parseFloat(arpu) / (parseFloat(churn) / 100 || 0.01);
  return (
    <CalculatorShell title="LTV Calculator" result={result} onCalculate={calc} presets={presets} accent="sky">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">ARPU ($)</label><input type="number" value={arpu} onChange={e => setArpu(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Churn Rate (%)</label><input type="number" value={churn} onChange={e => setChurn(e.target.value)} step="0.1" className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-tertiary)]">Customer Lifetime Value</div>
          <div className="text-3xl font-bold text-indigo-400">$${ltv.toFixed(0)}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function MrrCalculator() {
  const [customers, setCustomers] = useState('100');
  const [avgRevenue, setAvgRevenue] = useState('50');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const c = parseFloat(customers) || 0;
    const r = parseFloat(avgRevenue) || 0;
    const mrr = c * r;
    const arr = mrr * 12;
    setResult(`MRR: $${mrr.toLocaleString()}\nARR: $${arr.toLocaleString()}\nCustomers: ${c}\nARPU: $${r.toFixed(2)}/mo`);
  }, [customers, avgRevenue]);
  const presets = [
    { label: 'Early Stage', apply: () => { setCustomers('100'); setAvgRevenue('50'); } },
    { label: 'Growth Stage', apply: () => { setCustomers('1500'); setAvgRevenue('80'); } },
    { label: 'Enterprise', apply: () => { setCustomers('500'); setAvgRevenue('500'); } },
  ];
  const c = parseFloat(customers) || 0;
  const r = parseFloat(avgRevenue) || 0;
  const mrr = c * r;
  return (
    <CalculatorShell title="MRR Calculator" result={result} onCalculate={calc} presets={presets} accent="fuchsia">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Number of Customers</label><input type="number" value={customers} onChange={e => setCustomers(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Avg Revenue/Customer ($)</label><input type="number" value={avgRevenue} onChange={e => setAvgRevenue(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-lg font-bold text-indigo-400">${mrr.toLocaleString()}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Monthly</div>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-lg font-bold text-emerald-400">${(mrr * 12).toLocaleString()}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Annual</div>
          </div>
          <div className="bg-[var(--bg-overlay)] rounded-xl p-3 text-center border border-[var(--border-subtle)]">
            <div className="text-lg font-bold text-[var(--text-primary)]">${r.toFixed(0)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">ARPU</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function NetWorthCalculator() {
  const [assets, setAssets] = useState('500000');
  const [liabilities, setLiabilities] = useState('200000');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const a = parseFloat(assets) || 0;
    const l = parseFloat(liabilities) || 0;
    const nw = a - l;
    const dti = a > 0 ? (l / a) * 100 : 0;
    let health: string;
    if (nw <= 0) health = 'Critical';
    else if (dti > 50) health = 'Needs Improvement';
    else if (dti > 30) health = 'Fair';
    else health = 'Healthy';
    setResult(`Net Worth: $${nw.toLocaleString()}\nAssets: $${a.toLocaleString()}\nLiabilities: $${l.toLocaleString()}\nDebt-to-Asset: ${dti.toFixed(1)}%\nFinancial Health: ${health}`);
  }, [assets, liabilities]);
  const presets = [
    { label: 'Young Adult', apply: () => { setAssets('50000'); setLiabilities('20000'); } },
    { label: 'Mid Career', apply: () => { setAssets('500000'); setLiabilities('200000'); } },
    { label: 'Pre-Retirement', apply: () => { setAssets('1500000'); setLiabilities('300000'); } },
  ];
  const a = parseFloat(assets) || 0;
  const l = parseFloat(liabilities) || 0;
  const nw = a - l;
  const dti = a > 0 ? (l / a) * 100 : 0;
  return (
    <CalculatorShell title="Net Worth Calculator" result={result} onCalculate={calc} presets={presets} accent="purple">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Total Assets ($)</label><input type="number" value={assets} onChange={e => setAssets(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Total Liabilities ($)</label><input type="number" value={liabilities} onChange={e => setLiabilities(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
            <div>
              <div className="text-xs text-[var(--text-tertiary)]">Net Worth</div>
              <div className={`text-2xl font-bold ${nw >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ${nw.toLocaleString()}
              </div>
            </div>
            <div className={`px-3 py-1 rounded-lg text-xs font-bold ${dti <= 30 ? 'bg-emerald-500/20 text-emerald-400' : dti <= 50 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
              {dti.toFixed(0)}% DTI
            </div>
          </div>
          <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 rounded-full" style={{ width: `${Math.min(dti, 100)}%` }} />
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function NpsCalculator() {
  const [promoters, setPromoters] = useState('60');
  const [passives, setPassives] = useState('20');
  const [detractors, setDetractors] = useState('20');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const promo = parseFloat(promoters) || 0;
    const pass = parseFloat(passives) || 0;
    const det = parseFloat(detractors) || 0;
    const total = promo + pass + det;
    if (!total) return;
    const pctPromoters = (promo / total) * 100;
    const pctPassives = (pass / total) * 100;
    const pctDetractors = (det / total) * 100;
    const nps = pctPromoters - pctDetractors;
    let grade = 'Needs Improvement';
    if (nps >= 70) grade = 'Excellent';
    else if (nps >= 50) grade = 'Great';
    else if (nps >= 30) grade = 'Good';
    else if (nps >= 0) grade = 'Average';
    setResult(`NPS Score: ${nps.toFixed(1)}\nPromoters: ${pctPromoters.toFixed(1)}%\nPassives: ${pctPassives.toFixed(1)}%\nDetractors: ${pctDetractors.toFixed(1)}%\nGrade: ${grade}\nTotal Responses: ${total}`);
  }, [promoters, passives, detractors]);
  const presets = [
    { label: 'Excellent', apply: () => { setPromoters('70'); setPassives('20'); setDetractors('10'); } },
    { label: 'Average', apply: () => { setPromoters('40'); setPassives('35'); setDetractors('25'); } },
    { label: 'Needs Work', apply: () => { setPromoters('20'); setPassives('30'); setDetractors('50'); } },
  ];
  const promo = parseFloat(promoters) || 0;
  const pass = parseFloat(passives) || 0;
  const det = parseFloat(detractors) || 0;
  const total = promo + pass + det;
  const pctPromo = total > 0 ? (promo / total) * 100 : 0;
  const pctDet = total > 0 ? (det / total) * 100 : 0;
  const nps = pctPromo - pctDet;
  return (
    <CalculatorShell title="Net Promoter Score" result={result} onCalculate={calc} presets={presets} accent="red">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-bold text-emerald-400 mb-1.5">Promoters (9-10)</label><input type="number" value={promoters} onChange={e => setPromoters(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-amber-400 mb-1.5">Passives (7-8)</label><input type="number" value={passives} onChange={e => setPassives(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-red-400 mb-1.5">Detractors (0-6)</label><input type="number" value={detractors} onChange={e => setDetractors(e.target.value)} className={inputCls} /></div>
      </div>
      {result && total > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold" style={{ color: nps >= 50 ? '#34d399' : nps >= 0 ? '#fbbf24' : '#f87171' }}>{nps.toFixed(0)}</div>
            <div className="text-sm text-[var(--text-tertiary)]">out of -100 to +100</div>
          </div>
          <div className="flex h-8 rounded-full overflow-hidden">
            <div className="bg-emerald-500 transition-all duration-500 flex items-center justify-center text-xs font-bold text-white" style={{ width: `${pctPromo}%` }}>{pctPromo >= 15 ? `${pctPromo.toFixed(0)}%` : ''}</div>
            <div className="bg-amber-500 transition-all duration-500 flex items-center justify-center text-xs font-bold text-white" style={{ width: `${100 - pctPromo - pctDet}%` }}>{100 - pctPromo - pctDet >= 15 ? `${(100 - pctPromo - pctDet).toFixed(0)}%` : ''}</div>
            <div className="bg-red-500 transition-all duration-500 flex items-center justify-center text-xs font-bold text-white" style={{ width: `${pctDet}%` }}>{pctDet >= 15 ? `${pctDet.toFixed(0)}%` : ''}</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function RentVsBuyCalculator() {
  const [homePrice, setHomePrice] = useState('400000');
  const [downPayment, setDownPayment] = useState('80000');
  const [mortgageRate, setMortgageRate] = useState('6.5');
  const [rent, setRent] = useState('2000');
  const [years, setYears] = useState('5');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const hp = parseFloat(homePrice) || 0;
    const dp = parseFloat(downPayment) || 0;
    const mr = (parseFloat(mortgageRate) || 0) / 100 / 12;
    const term = parseFloat(years) || 0;
    const monthlyRent = parseFloat(rent) || 0;
    if (!hp || !term) return;
    const loanAmt = hp - dp;
    const n = term * 12;
    const pmt = loanAmt > 0 && mr > 0 ? loanAmt * mr * Math.pow(1 + mr, n) / (Math.pow(1 + mr, n) - 1) : 0;
    const totalMortgage = pmt * n;
    const totalRent = monthlyRent * 12 * term;
    const equity = hp * 0.03 * term;
    const buyCost = totalMortgage + dp;
    const buyNet = buyCost - equity;
    const rentTotal = totalRent;
    const diff = buyNet - rentTotal;
    setResult(`Buy Net Cost: $${buyNet.toFixed(0)}\nRent Total: $${rentTotal.toFixed(0)}\nDifference: $${Math.abs(diff).toFixed(0)} ${diff < 0 ? '(Buy cheaper)' : '(Rent cheaper)'}\nMonthly Mortgage: $${pmt.toFixed(0)} vs Rent: $${monthlyRent.toFixed(0)}`);
  }, [homePrice, downPayment, mortgageRate, rent, years]);
  const presets = [
    { label: 'HCOL 5yr', apply: () => { setHomePrice('700000'); setDownPayment('140000'); setMortgageRate('6.5'); setRent('3000'); setYears('5'); } },
    { label: 'MCOL 7yr', apply: () => { setHomePrice('400000'); setDownPayment('80000'); setMortgageRate('6.0'); setRent('1800'); setYears('7'); } },
    { label: 'LCOL 3yr', apply: () => { setHomePrice('250000'); setDownPayment('50000'); setMortgageRate('5.5'); setRent('1200'); setYears('3'); } },
  ];
  const hp = parseFloat(homePrice) || 0;
  const dp = parseFloat(downPayment) || 0;
  const mr = (parseFloat(mortgageRate) || 0) / 100 / 12;
  const term = parseFloat(years) || 0;
  const monthlyRent = parseFloat(rent) || 0;
  const n = term * 12;
  const pmt = (hp - dp) > 0 && mr > 0 ? (hp - dp) * mr * Math.pow(1 + mr, n) / (Math.pow(1 + mr, n) - 1) : 0;
  const totalMortgage = pmt * n;
  const buyNet = totalMortgage + dp - hp * 0.03 * term;
  const rentTotal = monthlyRent * 12 * term;
  const buyPct = buyNet + rentTotal > 0 ? buyNet / (buyNet + rentTotal) * 100 : 50;
  return (
    <CalculatorShell title="Rent vs Buy Calculator" result={result} onCalculate={calc} presets={presets} accent="green">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Home Price ($)</label><input type="number" value={homePrice} onChange={e => setHomePrice(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Down Payment ($)</label><input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Mortgage Rate (%)</label><input type="number" value={mortgageRate} onChange={e => setMortgageRate(e.target.value)} step="0.01" className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Monthly Rent ($)</label><input type="number" value={rent} onChange={e => setRent(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Timeframe (years)</label><input type="number" value={years} onChange={e => setYears(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="space-y-3">
          <div className="flex h-20 gap-3">
            <div className="flex-1 bg-emerald-500/10 rounded-xl border border-emerald-500/20 p-3 flex flex-col justify-center items-center">
              <div className="text-xs text-[var(--text-tertiary)]">Buy Net Cost</div>
              <div className="text-xl font-bold text-emerald-400">${buyNet.toFixed(0)}</div>
            </div>
            <div className="flex-1 bg-amber-500/10 rounded-xl border border-amber-500/20 p-3 flex flex-col justify-center items-center">
              <div className="text-xs text-[var(--text-tertiary)]">Rent Total</div>
              <div className="text-xl font-bold text-amber-400">${rentTotal.toFixed(0)}</div>
            </div>
          </div>
          <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${Math.min(buyPct, 100)}%` }} />
            <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${100 - Math.min(buyPct, 100)}%` }} />
          </div>
          <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
            <span>Buy</span>
            <span>Rent</span>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}


export function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState('30');
  const [retireAge, setRetireAge] = useState('65');
  const [savings, setSavings] = useState('50000');
  const [monthly, setMonthly] = useState('1000');
  const [rate, setRate] = useState('7');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const years = parseFloat(retireAge) - parseFloat(currentAge);
    if (years <= 0) { setResult('Retirement age must be greater than current age.'); return; }
    const r = (parseFloat(rate) || 0) / 100 / 12;
    const n = years * 12;
    const pv = parseFloat(savings) || 0;
    const pmt = parseFloat(monthly) || 0;
    const fv = pv * Math.pow(1 + r, n) + pmt * (Math.pow(1 + r, n) - 1) / r;
    const totalContrib = pv + pmt * n;
    const withdrawal4pct = fv * 0.04 / 12;
    setResult(`Total at Retirement: $${fv.toLocaleString()}\nTotal Contributions: $${totalContrib.toLocaleString()}\nInvestment Growth: $${(fv - totalContrib).toLocaleString()}\nYears Saving: ${years}\n4% Monthly Withdrawal: $${withdrawal4pct.toLocaleString()}`);
  }, [currentAge, retireAge, savings, monthly, rate]);
  const presets = [
    { label: 'Start Late (40)', apply: () => { setCurrentAge('40'); setRetireAge('65'); setSavings('100000'); setMonthly('2000'); setRate('7'); } },
    { label: 'Early Start (25)', apply: () => { setCurrentAge('25'); setRetireAge('60'); setSavings('10000'); setMonthly('1000'); setRate('8'); } },
    { label: 'Aggressive', apply: () => { setCurrentAge('30'); setRetireAge('55'); setSavings('50000'); setMonthly('3000'); setRate('9'); } },
  ];
  const yrs = Math.max(1, parseFloat(retireAge) - parseFloat(currentAge));
  const r = (parseFloat(rate) || 0) / 100 / 12;
  const n = yrs * 12;
  const pv = parseFloat(savings) || 0;
  const pmt = parseFloat(monthly) || 0;
  const fv = pv * Math.pow(1 + r, n) + pmt * (Math.pow(1 + r, n) - 1) / (r || 0.0001);
  const totalContrib = pv + pmt * n;
  const growth = fv - totalContrib;
  const growthPct = totalContrib > 0 ? (growth / totalContrib) * 100 : 0;
  return (
    <CalculatorShell title="Retirement Calculator" result={result} onCalculate={calc} presets={presets} accent="indigo">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-4">
          <div className="flex-1"><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Current Age</label><input type="number" value={currentAge} onChange={e => setCurrentAge(e.target.value)} className={inputCls} /></div>
          <div className="flex-1"><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Retire Age</label><input type="number" value={retireAge} onChange={e => setRetireAge(e.target.value)} className={inputCls} /></div>
        </div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Current Savings ($)</label><input type="number" value={savings} onChange={e => setSavings(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Monthly Contribution ($)</label><input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Annual Return (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.1" className={inputCls} /></div>
      </div>
      {result && (
        <div className="space-y-3">
          <div className="bg-indigo-500/10 rounded-xl p-4 text-center border border-indigo-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Retirement Nest Egg</div>
            <div className="text-3xl font-bold text-indigo-400">${fv.toLocaleString()}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[var(--bg-overlay)] rounded-lg p-2 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Contributions</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">${totalContrib.toLocaleString()}</div>
            </div>
            <div className="bg-[var(--bg-overlay)] rounded-lg p-2 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Growth</div>
              <div className="text-sm font-bold text-emerald-400">${growth.toLocaleString()}</div>
            </div>
            <div className="bg-[var(--bg-overlay)] rounded-lg p-2 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Growth %</div>
              <div className="text-sm font-bold text-amber-400">{growthPct.toFixed(0)}%</div>
            </div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function RevenueGrowthCalculator() {
  const [current, setCurrent] = useState('120000');
  const [previous, setPrevious] = useState('100000');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const c = parseFloat(current) || 0;
    const p = parseFloat(previous) || 0;
    if (!p) return;
    const growth = ((c - p) / p) * 100;
    const absChange = c - p;
    const cagr = growth;
    setResult(`Growth Rate: ${growth.toFixed(2)}%\nAbsolute Change: $${absChange.toLocaleString()}\nCurrent: $${c.toLocaleString()}\nPrevious: $${p.toLocaleString()}`);
  }, [current, previous]);
  const presets = [
    { label: 'YoY Growth', apply: () => { setCurrent('120000'); setPrevious('100000'); } },
    { label: 'QoQ Growth', apply: () => { setCurrent('55000'); setPrevious('50000'); } },
    { label: 'Hypergrowth', apply: () => { setCurrent('300000'); setPrevious('150000'); } },
  ];
  const c = parseFloat(current) || 0;
  const p = parseFloat(previous) || 1;
  const growth = ((c - p) / p) * 100;
  const isPositive = growth >= 0;
  return (
    <CalculatorShell title="Revenue Growth Calculator" result={result} onCalculate={calc} presets={presets} accent="blue">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Current Period ($)</label><input type="number" value={current} onChange={e => setCurrent(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Previous Period ($)</label><input type="number" value={previous} onChange={e => setPrevious(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Previous</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">${p.toLocaleString()}</div>
            </div>
            <div className={`text-2xl font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? '\u2191' : '\u2193'} {Math.abs(growth).toFixed(1)}%
            </div>
            <div className="text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Current</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">${c.toLocaleString()}</div>
            </div>
          </div>
          <div className="mt-3 h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${Math.min(Math.abs(growth), 100)}%` }} />
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function RunwayCalculator() {
  const [cash, setCash] = useState('500000');
  const [burnRate, setBurnRate] = useState('50000');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const c = parseFloat(cash) || 0;
    const b = parseFloat(burnRate) || 0;
    if (!b) return;
    const months = c / b;
    const years = months / 12;
    const date = new Date();
    date.setMonth(date.getMonth() + Math.floor(months));
    setResult(`Runway: ${months.toFixed(1)} months (${years.toFixed(1)} years)\nCash: $${c.toLocaleString()}\nMonthly Burn: $${b.toLocaleString()}\nRunway Until: ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`);
  }, [cash, burnRate]);
  const presets = [
    { label: 'Seed Stage', apply: () => { setCash('500000'); setBurnRate('50000'); } },
    { label: 'Series A', apply: () => { setCash('3000000'); setBurnRate('200000'); } },
    { label: 'Bootstrapped', apply: () => { setCash('200000'); setBurnRate('15000'); } },
  ];
  const c = parseFloat(cash) || 0;
  const b = parseFloat(burnRate) || 1;
  const months = c / b;
  const maxMonths = 60;
  const runwayPct = Math.min((months / maxMonths) * 100, 100);
  return (
    <CalculatorShell title="Runway Calculator" result={result} onCalculate={calc} presets={presets} accent="emerald">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Cash Balance ($)</label><input type="number" value={cash} onChange={e => setCash(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Monthly Burn Rate ($)</label><input type="number" value={burnRate} onChange={e => setBurnRate(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="space-y-2">
          <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
            <div className="text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Runway</div>
              <div className="text-3xl font-bold" style={{ color: months > 18 ? '#34d399' : months > 6 ? '#fbbf24' : '#f87171' }}>
                {months.toFixed(1)} <span className="text-lg">months</span>
              </div>
            </div>
          </div>
          <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${runwayPct > 50 ? 'bg-emerald-500' : runwayPct > 25 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${runwayPct}%` }} />
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function AbTestCalculator() {
  const [controlVisitors, setControlVisitors] = useState('1000');
  const [controlConversions, setControlConversions] = useState('100');
  const [variantVisitors, setVariantVisitors] = useState('1000');
  const [variantConversions, setVariantConversions] = useState('120');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const cv = parseFloat(controlVisitors) || 0;
    const cc = parseFloat(controlConversions) || 0;
    const vv = parseFloat(variantVisitors) || 0;
    const vc = parseFloat(variantConversions) || 0;
    if (!cv || !vv) return;
    const cr1 = cc / cv;
    const cr2 = vc / vv;
    const pPool = (cc + vc) / (cv + vv);
    const se = pPool * (1 - pPool) * (1 / cv + 1 / vv) > 0 ? Math.sqrt(pPool * (1 - pPool) * (1 / cv + 1 / vv)) : 0;
    const z = se > 0 ? (cr2 - cr1) / se : 0;
    const pct = cr1 > 0 ? (cr2 - cr1) / cr1 * 100 : 0;
    const significant = Math.abs(z) > 1.96;
    setResult(`Control Rate: ${(cr1 * 100).toFixed(2)}%\nVariant Rate: ${(cr2 * 100).toFixed(2)}%\nImprovement: ${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%\nZ-Score: ${z.toFixed(3)}\n${significant ? 'Statistically Significant (p < 0.05)' : 'Not statistically significant'}`);
  }, [controlVisitors, controlConversions, variantVisitors, variantConversions]);
  const presets = [
    { label: 'Winner', apply: () => { setControlVisitors('1000'); setControlConversions('100'); setVariantVisitors('1000'); setVariantConversions('130'); } },
    { label: 'Flat', apply: () => { setControlVisitors('1000'); setControlConversions('100'); setVariantVisitors('1000'); setVariantConversions('102'); } },
    { label: 'Loser', apply: () => { setControlVisitors('1000'); setControlConversions('100'); setVariantVisitors('1000'); setVariantConversions('80'); } },
  ];
  const cv = parseFloat(controlVisitors) || 1;
  const cc = parseFloat(controlConversions) || 0;
  const vv = parseFloat(variantVisitors) || 1;
  const vc = parseFloat(variantConversions) || 0;
  const cr1 = cc / cv;
  const cr2 = vc / vv;
  const pct = cr1 > 0 ? (cr2 - cr1) / cr1 * 100 : 0;
  return (
    <CalculatorShell title="A/B Test Calculator" result={result} onCalculate={calc} presets={presets} accent="violet">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Control Visitors</label><input type="number" value={controlVisitors} onChange={e => setControlVisitors(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Control Conversions</label><input type="number" value={controlConversions} onChange={e => setControlConversions(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Variant Visitors</label><input type="number" value={variantVisitors} onChange={e => setVariantVisitors(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Variant Conversions</label><input type="number" value={variantConversions} onChange={e => setVariantConversions(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="space-y-2">
          <div className="flex gap-3">
            <div className="flex-1 bg-[var(--bg-overlay)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Control</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">{(cr1 * 100).toFixed(1)}%</div>
            </div>
            <div className={`flex-1 rounded-xl p-3 text-center border ${pct >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              <div className="text-xs text-[var(--text-tertiary)]">Variant</div>
              <div className={`text-lg font-bold ${pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{(cr2 * 100).toFixed(1)}%</div>
            </div>
          </div>
          <div className="bg-[var(--bg-overlay)] rounded-lg px-3 py-2 text-center">
            <span className={`text-sm font-bold ${pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {pct >= 0 ? '+' : ''}{pct.toFixed(1)}% {pct >= 0 ? 'improvement' : 'decline'}
            </span>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function BusinessDaysCalculator() {
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!start || !end) return;
    let bdCount = 0;
    let totalDays = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) bdCount++;
      totalDays++;
      current.setDate(current.getDate() + 1);
    }
    const weekends = totalDays - bdCount;
    const weeks = Math.floor(totalDays / 7);
    setResult(`Business Days: ${bdCount}\nWeekend Days: ${weekends}\nTotal Days: ${totalDays}\nWeeks: ~${weeks} weeks`);
  }, [startDate, endDate]);
  const presets = [
    { label: '1 Year', apply: () => { setStartDate('2026-01-01'); setEndDate('2026-12-31'); } },
    { label: '1 Quarter', apply: () => { setStartDate('2026-07-01'); setEndDate('2026-09-30'); } },
    { label: '1 Month', apply: () => { setStartDate('2026-07-01'); setEndDate('2026-07-31'); } },
  ];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let bdCount = 0;
  const current = new Date(start);
  while (current <= end) {
    if (current.getDay() !== 0 && current.getDay() !== 6) bdCount++;
    current.setDate(current.getDate() + 1);
  }
  return (
    <CalculatorShell title="Business Days Calculator" result={result} onCalculate={calc} presets={presets} accent="amber">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">End Date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-xl font-bold text-indigo-400">{bdCount}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Business Days</div>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-3 text-center border border-amber-500/20">
            <div className="text-xl font-bold text-amber-400">{(new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24) - bdCount}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Weekends</div>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-xl font-bold text-emerald-400">{Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Total Days</div>
          </div>
          <div className="bg-[var(--bg-overlay)] rounded-xl p-3 text-center border border-[var(--border-subtle)]">
            <div className="text-xl font-bold text-[var(--text-primary)]">{((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 7)).toFixed(0)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Weeks</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function DaysBetweenDates() {
  const [date1, setDate1] = useState('2026-01-01');
  const [date2, setDate2] = useState('2026-12-31');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = Math.abs(d2.getTime() - d1.getTime());
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44);
    const years = days / 365.25;
    setResult(`Days: ${days}\nWeeks: ${weeks}\nMonths: ~${months}\nYears: ~${years.toFixed(2)}`);
  }, [date1, date2]);
  const presets = [
    { label: '1 Year', apply: () => { setDate1('2026-01-01'); setDate2('2026-12-31'); } },
    { label: 'Summer Break', apply: () => { setDate1('2026-06-01'); setDate2('2026-08-31'); } },
    { label: 'Short Trip', apply: () => { setDate1('2026-07-15'); setDate2('2026-07-22'); } },
  ];
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = Math.abs(d2.getTime() - d1.getTime());
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return (
    <CalculatorShell title="Days Between Dates" result={result} onCalculate={calc} presets={presets} accent="rose">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Date 1</label><input type="date" value={date1} onChange={e => setDate1(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Date 2</label><input type="date" value={date2} onChange={e => setDate2(e.target.value)} className={inputCls} /></div>
      </div>
      {result && days > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-xl font-bold text-indigo-400">{days}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Days</div>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-xl font-bold text-emerald-400">{Math.floor(days / 7)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Weeks</div>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-3 text-center border border-amber-500/20">
            <div className="text-xl font-bold text-amber-400">~{Math.floor(days / 30.44)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Months</div>
          </div>
          <div className="bg-[var(--bg-overlay)] rounded-xl p-3 text-center border border-[var(--border-subtle)]">
            <div className="text-xl font-bold text-[var(--text-primary)]">~{(days / 365.25).toFixed(1)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Years</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function DaysUntilCalculator() {
  const [targetDate, setTargetDate] = useState('2027-01-01');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) { setResult('Target date is in the past.'); return; }
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    setResult(`Days Until: ${days}\nHours Until: ${days * 24 + hours}\nTarget: ${target.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`);
  }, [targetDate]);
  const presets = [
    { label: 'New Year', apply: () => { setTargetDate('2027-01-01'); } },
    { label: 'Christmas', apply: () => { setTargetDate('2026-12-25'); } },
    { label: 'Birthday', apply: () => { setTargetDate('2027-06-15'); } },
  ];
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return (
    <CalculatorShell title="Days Until Calculator" result={result} onCalculate={calc} presets={presets} accent="cyan">
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Target Date</label><input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className={inputCls} /></div>
      {result && days > 0 && (
        <div className="bg-indigo-500/10 rounded-xl p-4 text-center border border-indigo-500/20">
          <div className="text-xs text-[var(--text-tertiary)]">Countdown</div>
          <div className="text-3xl font-bold text-indigo-400">{days} <span className="text-lg">days</span></div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function DayOfWeekCalculator() {
  const [date, setDate] = useState('2026-12-25');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const d = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const month = d.toLocaleString('en-US', { month: 'long' });
    setResult(`Day of Week: ${days[d.getDay()]}\nDate: ${month} ${d.getDate()}, ${d.getFullYear()}`);
  }, [date]);
  const presets = [
    { label: 'Christmas', apply: () => { setDate('2026-12-25'); } },
    { label: 'New Year', apply: () => { setDate('2027-01-01'); } },
    { label: 'Today', apply: () => { setDate(new Date().toISOString().split('T')[0]); } },
  ];
  const d = new Date(date);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[d.getDay()];
  const colors: Record<string, string> = { Sunday: 'text-red-400', Monday: 'text-indigo-400', Tuesday: 'text-emerald-400', Wednesday: 'text-amber-400', Thursday: 'text-blue-400', Friday: 'text-teal-400', Saturday: 'text-purple-400' };
  return (
    <CalculatorShell title="Day of Week Calculator" result={result} onCalculate={calc} presets={presets} accent="orange">
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} /></div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className={`text-3xl font-bold ${colors[dayName] || 'text-indigo-400'}`}>{dayName}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function DayOfYearCalculator() {
  const [date, setDate] = useState('2026-07-17');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const d = new Date(date);
    const year = d.getFullYear();
    const start = new Date(year, 0, 0);
    const diff = d.getTime() - start.getTime();
    const day = Math.floor(diff / (1000 * 60 * 60 * 24));
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const totalDays = isLeap ? 366 : 365;
    const pct = (day / totalDays) * 100;
    setResult(`Day of Year: ${day} of ${totalDays}\nYear Progress: ${pct.toFixed(1)}%\nDays Remaining: ${totalDays - day}`);
  }, [date]);
  const presets = [
    { label: 'Mid Year', apply: () => { setDate('2026-07-01'); } },
    { label: 'Year Start', apply: () => { setDate('2026-01-01'); } },
    { label: 'Year End', apply: () => { setDate('2026-12-31'); } },
  ];
  const d = new Date(date);
  const year = d.getFullYear();
  const start = new Date(year, 0, 0);
  const day = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const totalDays = isLeap ? 366 : 365;
  const pct = (day / totalDays) * 100;
  return (
    <CalculatorShell title="Day of Year Calculator" result={result} onCalculate={calc} presets={presets} accent="teal">
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} /></div>
      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-tertiary)]">Day {day} of {totalDays}</span>
            <span className="text-sm font-bold text-[var(--text-primary)]">{pct.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}


export function ExponentCalculator() {
  const [base, setBase] = useState('2');
  const [exp, setExp] = useState('10');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const b = parseFloat(base) || 0;
    const e = parseFloat(exp) || 0;
    const val = Math.pow(b, e);
    const log10 = Math.log10(val);
    setResult(`${b}^${e} = ${val.toLocaleString()}\nScientific: ${val.toExponential(4)}\nLog10: ${log10.toFixed(4)}`);
  }, [base, exp]);
  const presets = [
    { label: '2^10 (1024)', apply: () => { setBase('2'); setExp('10'); } },
    { label: '10^3 (1000)', apply: () => { setBase('10'); setExp('3'); } },
    { label: '5^4 (625)', apply: () => { setBase('5'); setExp('4'); } },
  ];
  const b = parseFloat(base) || 0;
  const e = parseFloat(exp) || 0;
  const val = Math.pow(b, e);
  return (
    <CalculatorShell title="Exponent Calculator" result={result} onCalculate={calc} presets={presets} accent="pink">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Base</label><input type="number" value={base} onChange={e => setBase(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Exponent</label><input type="number" value={exp} onChange={e => setExp(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-tertiary)]">Result</div>
          <div className="text-xl font-bold text-indigo-400 font-mono break-all">{b}^{e} = {val.toLocaleString()}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function FinalGradeCalculator() {
  const [grades, setGrades] = useState('85,90,78');
  const [weights, setWeights] = useState('20,30,50');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const g = grades.split(',').map(Number);
    const w = weights.split(',').map(Number);
    let total = 0;
    let weightSum = 0;
    for (let i = 0; i < g.length; i++) {
      total += g[i] * w[i] / 100;
      weightSum += w[i];
    }
    const final = weightSum > 0 ? total / (weightSum / 100) : 0;
    setResult(`Final Grade: ${final.toFixed(2)}%\nWeighted Score: ${total.toFixed(2)}\nTotal Weight: ${weightSum}%`);
  }, [grades, weights]);
  const presets = [
    { label: '3 Assignments', apply: () => { setGrades('85,90,78'); setWeights('20,30,50'); } },
    { label: 'Exam Heavy', apply: () => { setGrades('92,80,70'); setWeights('20,20,60'); } },
  ];
  const g = grades.split(',').map(Number);
  const w = weights.split(',').map(Number);
  let total = 0;
  let weightSum = 0;
  for (let i = 0; i < g.length; i++) { total += g[i] * w[i] / 100; weightSum += w[i]; }
  const final = weightSum > 0 ? total / (weightSum / 100) : 0;
  return (
    <CalculatorShell title="Final Grade Calculator" result={result} onCalculate={calc} presets={presets} accent="lime">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Grades (comma-separated)</label><input type="text" value={grades} onChange={e => setGrades(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Weights (comma-separated, %)</label><input type="text" value={weights} onChange={e => setWeights(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
          <div className="text-center">
            <div className="text-xs text-[var(--text-tertiary)]">Final Grade</div>
            <div className={`text-3xl font-bold ${final >= 90 ? 'text-emerald-400' : final >= 80 ? 'text-blue-400' : final >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{final.toFixed(1)}%</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function GpaCalculator() {
  const [grades, setGrades] = useState('A,B+,A-');
  const [credits, setCredits] = useState('3,4,3');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const g = grades.split(',').map(g => g.trim().toUpperCase());
    const c = credits.split(',').map(Number);
    let totalPoints = 0;
    let totalCredits = 0;
    const details: string[] = [];
    for (let i = 0; i < g.length; i++) {
      const gp = gradePointsMap[g[i]] || 0;
      totalPoints += gp * c[i];
      totalCredits += c[i];
      details.push(`${g[i]} (${c[i]} cr) = ${gp.toFixed(1)} \u00d7 ${c[i]}`);
    }
    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    setResult(`GPA: ${gpa.toFixed(2)}\nTotal Points: ${totalPoints.toFixed(1)}\nTotal Credits: ${totalCredits}`);
  }, [grades, credits]);
  const presets = [
    { label: 'Dean\'s List', apply: () => { setGrades('A,A-,B+'); setCredits('3,4,3'); } },
    { label: 'Average Semester', apply: () => { setGrades('B,B+,C+'); setCredits('3,3,4'); } },
  ];
  return (
    <CalculatorShell title="GPA Calculator" result={result} onCalculate={calc} presets={presets} accent="sky">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Grades (e.g., A,B+,A-)</label><input type="text" value={grades} onChange={e => setGrades(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Credits (comma-separated)</label><input type="text" value={credits} onChange={e => setCredits(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (() => {
        const g = grades.split(',').map(g => g.trim().toUpperCase());
        const c = credits.split(',').map(Number);
        let tp = 0, tc = 0;
        for (let i = 0; i < g.length; i++) { tp += (gradePointsMap[g[i]] || 0) * c[i]; tc += c[i]; }
        const gpa = tc > 0 ? tp / tc : 0;
        return (
          <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
            <div className="text-xs text-[var(--text-tertiary)]">GPA</div>
            <div className={`text-3xl font-bold ${gpa >= 3.5 ? 'text-emerald-400' : gpa >= 3.0 ? 'text-blue-400' : gpa >= 2.0 ? 'text-amber-400' : 'text-red-400'}`}>{gpa.toFixed(2)}</div>
          </div>
        );
      })()}
    </CalculatorShell>
  );
}

export function GradeCalculator() {
  const [percentage, setPercentage] = useState('85');
  const [result, setResult] = useState('');
  const getLetter = (p: number) => { if (p >= 93) return 'A'; if (p >= 90) return 'A-'; if (p >= 87) return 'B+'; if (p >= 83) return 'B'; if (p >= 80) return 'B-'; if (p >= 77) return 'C+'; if (p >= 73) return 'C'; if (p >= 70) return 'C-'; if (p >= 67) return 'D+'; if (p >= 60) return 'D'; return 'F'; };
  const calc = useCallback(() => {
    const p = parseFloat(percentage) || 0;
    const letter = getLetter(p);
    const passed = letter !== 'F';
    setResult(`Letter Grade: ${letter}\nPercentage: ${p}%\n${passed ? 'Passed' : 'Failed'}`);
  }, [percentage]);
  const presets = [
    { label: 'Excellent (A)', apply: () => { setPercentage('95'); } },
    { label: 'Passing (D)', apply: () => { setPercentage('65'); } },
    { label: 'Failing (F)', apply: () => { setPercentage('55'); } },
  ];
  const p = parseFloat(percentage) || 0;
  const letter = getLetter(p);
  const colorMap: Record<string, string> = { 'A': 'text-emerald-400', 'A-': 'text-emerald-400', 'B+': 'text-blue-400', 'B': 'text-blue-400', 'B-': 'text-blue-400', 'C+': 'text-amber-400', 'C': 'text-amber-400', 'C-': 'text-amber-400', 'D+': 'text-orange-400', 'D': 'text-orange-400', 'F': 'text-red-400' };
  return (
    <CalculatorShell title="Grade Calculator" result={result} onCalculate={calc} presets={presets} accent="fuchsia">
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Percentage (%)</label><input type="number" value={percentage} onChange={e => setPercentage(e.target.value)} className={inputCls} /></div>
      {result && (
        <div className="space-y-2">
          <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
            <div className={`text-5xl font-bold ${colorMap[letter] || 'text-indigo-400'}`}>{letter}</div>
          </div>
          <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${p >= 60 ? 'bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500' : 'bg-red-500'}`} style={{ width: `${p}%` }} />
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function CollegeGpaCalculator() {
  const [semGrades, setSemGrades] = useState('A,B+,A-');
  const [semCredits, setSemCredits] = useState('3,4,3');
  const [prevGpa, setPrevGpa] = useState('3.5');
  const [prevCredits, setPrevCredits] = useState('30');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const g = semGrades.split(',').map(g => g.trim().toUpperCase());
    const c = semCredits.split(',').map(Number);
    let totalPoints = 0;
    let totalCredits = 0;
    for (let i = 0; i < g.length; i++) {
      totalPoints += (gradePointsMap[g[i]] || 0) * c[i];
      totalCredits += c[i];
    }
    const semGpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    const pg = parseFloat(prevGpa) || 0;
    const pc = parseFloat(prevCredits) || 0;
    const cumPoints = pg * pc + totalPoints;
    const cumCredits = pc + totalCredits;
    const cumGpa = cumCredits > 0 ? cumPoints / cumCredits : 0;
    const change = cumGpa - pg;
    setResult(`Semester GPA: ${semGpa.toFixed(2)}\nCumulative GPA: ${cumGpa.toFixed(2)}\nChange: ${change >= 0 ? '+' : ''}${change.toFixed(3)}`);
  }, [semGrades, semCredits, prevGpa, prevCredits]);
  const presets = [
    { label: 'First Semester', apply: () => { setSemGrades('A,B+,A-'); setSemCredits('3,4,3'); setPrevGpa('0'); setPrevCredits('0'); } },
    { label: 'Junior Year', apply: () => { setSemGrades('A-,A,B'); setSemCredits('4,3,3'); setPrevGpa('3.2'); setPrevCredits('60'); } },
  ];
  return (
    <CalculatorShell title="College GPA Calculator" result={result} onCalculate={calc} presets={presets} accent="purple">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Semester Grades (e.g., A,B+,A-)</label><input type="text" value={semGrades} onChange={e => setSemGrades(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Semester Credits</label><input type="text" value={semCredits} onChange={e => setSemCredits(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Previous GPA</label><input type="number" value={prevGpa} onChange={e => setPrevGpa(e.target.value)} step="0.01" className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Previous Credits</label><input type="number" value={prevCredits} onChange={e => setPrevCredits(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (() => {
        const g = semGrades.split(',').map(g => g.trim().toUpperCase());
        const c = semCredits.split(',').map(Number);
        let tp = 0, tc = 0;
        for (let i = 0; i < g.length; i++) { tp += (gradePointsMap[g[i]] || 0) * c[i]; tc += c[i]; }
        const semGpa = tc > 0 ? tp / tc : 0;
        const pg = parseFloat(prevGpa) || 0;
        const pc = parseFloat(prevCredits) || 0;
        const cumGpa = (pg * pc + tp) / (pc + tc);
        return (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
              <div className="text-xs text-[var(--text-tertiary)]">Semester GPA</div>
              <div className="text-xl font-bold text-indigo-400">{semGpa.toFixed(2)}</div>
            </div>
            <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
              <div className="text-xs text-[var(--text-tertiary)]">Cumulative GPA</div>
              <div className="text-xl font-bold text-emerald-400">{cumGpa.toFixed(2)}</div>
            </div>
          </div>
        );
      })()}
    </CalculatorShell>
  );
}

export function LeapYearCalculator() {
  const [year, setYear] = useState('2026');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const y = parseInt(year);
    const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    const nextLeap = isLeap ? y : (() => { let n = y; while (!((n % 4 === 0 && n % 100 !== 0) || n % 400 === 0)) n++; return n; })();
    setResult(`${y} is ${isLeap ? '' : 'not '}a leap year\nNext leap year: ${nextLeap}\nDays in ${y}: ${isLeap ? 366 : 365}`);
  }, [year]);
  const presets = [
    { label: '2024 (Leap)', apply: () => { setYear('2024'); } },
    { label: '2026 (No)', apply: () => { setYear('2026'); } },
    { label: '2000 (Leap)', apply: () => { setYear('2000'); } },
  ];
  const y = parseInt(year);
  const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  return (
    <CalculatorShell title="Leap Year Calculator" result={result} onCalculate={calc} presets={presets} accent="red">
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Year</label><input type="number" value={year} onChange={e => setYear(e.target.value)} className={inputCls} /></div>
      {result && (
        <div className={`bg-[var(--bg-overlay)] rounded-xl p-4 text-center border ${isLeap ? 'border-emerald-500/20' : 'border-amber-500/20'}`}>
          <div className={`text-3xl font-bold ${isLeap ? 'text-emerald-400' : 'text-amber-400'}`}>{isLeap ? 'Leap Year' : 'Not a Leap Year'}</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">{isLeap ? '366 days' : '365 days'}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function ProbabilityCalculator() {
  const [favorable, setFavorable] = useState('3');
  const [total, setTotal] = useState('10');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const f = parseFloat(favorable) || 0;
    const t = parseFloat(total) || 0;
    if (!t) return;
    const prob = f / t;
    const pct = prob * 100;
    const odds = `${f}:${t - f}`;
    setResult(`Probability: ${pct.toFixed(2)}%\nOdds: ${odds}\nFraction: ${f}/${t}\nDecimal: ${prob.toFixed(4)}`);
  }, [favorable, total]);
  const presets = [
    { label: 'Coin Flip', apply: () => { setFavorable('1'); setTotal('2'); } },
    { label: 'Dice Roll', apply: () => { setFavorable('1'); setTotal('6'); } },
    { label: 'Deck of Cards', apply: () => { setFavorable('13'); setTotal('52'); } },
  ];
  const f = parseFloat(favorable) || 0;
  const t = parseFloat(total) || 1;
  const pct = (f / t) * 100;
  return (
    <CalculatorShell title="Probability Calculator" result={result} onCalculate={calc} presets={presets} accent="green">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Favorable Outcomes</label><input type="number" value={favorable} onChange={e => setFavorable(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Total Possible Outcomes</label><input type="number" value={total} onChange={e => setTotal(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-[var(--bg-overlay)] rounded-xl p-3 border border-[var(--border-subtle)]">
            <span className="text-sm text-[var(--text-secondary)]">Probability</span>
            <span className="text-xl font-bold text-indigo-400">{pct.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function ProportionCalculator() {
  const [a, setA] = useState('2');
  const [b, setB] = useState('5');
  const [c, setC] = useState('8');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const na = parseFloat(a) || 0;
    const nb = parseFloat(b) || 0;
    const nc = parseFloat(c) || 0;
    if (!na) return;
    const d = (nb * nc) / na;
    setResult(`${na} : ${nb} = ${nc} : ${d.toFixed(4)}\nMissing value (D) = ${d.toFixed(4)}`);
  }, [a, b, c]);
  const presets = [
    { label: '2:5 = 8:?', apply: () => { setA('2'); setB('5'); setC('8'); } },
    { label: '3:4 = 12:?', apply: () => { setA('3'); setB('4'); setC('12'); } },
    { label: '1:10 = 5:?', apply: () => { setA('1'); setB('10'); setC('5'); } },
  ];
  const na = parseFloat(a) || 0;
  const nb = parseFloat(b) || 0;
  const nc = parseFloat(c) || 0;
  const d = na ? (nb * nc) / na : 0;
  return (
    <CalculatorShell title="Proportion Calculator" result={result} onCalculate={calc} presets={presets} accent="indigo">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">A</label><input type="number" value={a} onChange={e => setA(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">B (first ratio)</label><input type="number" value={b} onChange={e => setB(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">C (solve D)</label><input type="number" value={c} onChange={e => setC(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)] font-mono text-lg">
          <span className="text-[var(--text-primary)]">{na} : {nb} = {nc} : <span className="text-indigo-400 font-bold">{d.toFixed(2)}</span></span>
        </div>
      )}
    </CalculatorShell>
  );
}

export function RatioCalculator() {
  const [num1, setNum1] = useState('12');
  const [num2, setNum2] = useState('8');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const n1 = parseInt(num1) || 0;
    const n2 = parseInt(num2) || 0;
    if (!n1 || !n2) return;
    const g = gcd(n1, n2);
    const pct = (n1 / n2) * 100;
    setResult(`Simplified Ratio: ${n1 / g} : ${n2 / g}\nProportion: ${pct.toFixed(1)}% (${n1} is ${pct.toFixed(1)}% of ${n2})`);
  }, [num1, num2]);
  const presets = [
    { label: '12:8', apply: () => { setNum1('12'); setNum2('8'); } },
    { label: '16:9 (HD)', apply: () => { setNum1('16'); setNum2('9'); } },
    { label: '100:75', apply: () => { setNum1('100'); setNum2('75'); } },
  ];
  const n1 = parseInt(num1) || 0;
  const n2 = parseInt(num2) || 1;
  const g = gcd(n1, n2);
  return (
    <CalculatorShell title="Ratio Calculator" result={result} onCalculate={calc} presets={presets} accent="blue">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">First Number</label><input type="number" value={num1} onChange={e => setNum1(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Second Number</label><input type="number" value={num2} onChange={e => setNum2(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-2xl font-bold text-indigo-400">{n1 / g} : {n2 / g}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function AspectRatioCalculator() {
  const [width, setWidth] = useState('1920');
  const [height, setHeight] = useState('1080');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseInt(width) || 0;
    const h = parseInt(height) || 0;
    if (!w || !h) return;
    const g = gcd(w, h);
    const ratio = (w / g) / (h / g);
    setResult(`Aspect Ratio: ${w / g}:${h / g}\nRatio: ${ratio.toFixed(3)}:1\n(${w} \u00d7 ${h})`);
  }, [width, height]);
  const presets = [
    { label: 'HD 16:9', apply: () => { setWidth('1920'); setHeight('1080'); } },
    { label: '4:3', apply: () => { setWidth('1024'); setHeight('768'); } },
    { label: 'Ultrawide 21:9', apply: () => { setWidth('2560'); setHeight('1080'); } },
  ];
  const w = parseInt(width) || 0;
  const h = parseInt(height) || 1;
  const g = gcd(w, h);
  const commonRatios = ['16:9', '4:3', '21:9', '3:2', '1:1', '5:4'];
  const match = commonRatios.find(r => { const [rw, rh] = r.split(':').map(Number); return w / h === rw / rh; });
  return (
    <CalculatorShell title="Aspect Ratio Calculator" result={result} onCalculate={calc} presets={presets} accent="emerald">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Width (px)</label><input type="number" value={width} onChange={e => setWidth(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Height (px)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-400">{w / g}:{h / g}</div>
            {match && <div className="text-xs text-emerald-400 mt-1">Common: {match}</div>}
          </div>
          <div className="mt-3 bg-[var(--bg-elevated)] rounded-lg h-24 flex items-center justify-center" style={{ aspectRatio: `${w / g}/${h / g}` }}>
            <div className="text-xs text-[var(--text-tertiary)]">{w} \u00d7 {h}</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function CircleCalculator() {
  const [radius, setRadius] = useState('5');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const r = parseFloat(radius) || 0;
    const area = Math.PI * r * r;
    const circumference = 2 * Math.PI * r;
    const diameter = 2 * r;
    setResult(`Radius: ${r}\nDiameter: ${diameter}\nArea: ${area.toFixed(4)}\nCircumference: ${circumference.toFixed(4)}`);
  }, [radius]);
  const presets = [
    { label: 'r=1', apply: () => { setRadius('1'); } },
    { label: 'r=5', apply: () => { setRadius('5'); } },
    { label: 'r=10', apply: () => { setRadius('10'); } },
  ];
  const r = parseFloat(radius) || 0;
  const area = Math.PI * r * r;
  return (
    <CalculatorShell title="Circle Calculator" result={result} onCalculate={calc} presets={presets} accent="violet">
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Radius</label><input type="number" value={radius} onChange={e => setRadius(e.target.value)} step="0.1" className={inputCls} /></div>
      {result && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Area</div>
            <div className="text-lg font-bold text-indigo-400">{area.toFixed(1)}</div>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Circumference</div>
            <div className="text-lg font-bold text-emerald-400">{(2 * Math.PI * r).toFixed(1)}</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function DpiCalculator() {
  const [pixels, setPixels] = useState('1920');
  const [inches, setInches] = useState('13.3');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const p = parseFloat(pixels) || 0;
    const i = parseFloat(inches) || 0;
    if (!i) return;
    const dpi = p / i;
    const dotPitch = 25.4 / dpi;
    setResult(`DPI: ${dpi.toFixed(2)}\nDot Pitch: ${dotPitch.toFixed(4)} mm\nTotal Dots: ${p}`);
  }, [pixels, inches]);
  const presets = [
    { label: 'MacBook 13\"', apply: () => { setPixels('2560'); setInches('13.3'); } },
    { label: 'Full HD 24\"', apply: () => { setPixels('1920'); setInches('24'); } },
    { label: 'Phone 6.1\"', apply: () => { setPixels('2532'); setInches('6.1'); } },
  ];
  const p = parseFloat(pixels) || 0;
  const i = parseFloat(inches) || 1;
  const dpi = p / i;
  return (
    <CalculatorShell title="DPI Calculator" result={result} onCalculate={calc} presets={presets} accent="amber">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Pixels</label><input type="number" value={pixels} onChange={e => setPixels(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Inches</label><input type="number" value={inches} onChange={e => setInches(e.target.value)} step="0.1" className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-tertiary)]">Dots Per Inch</div>
          <div className="text-3xl font-bold text-indigo-400">{dpi.toFixed(0)}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function FractionCalculator() {
  const [frac1, setFrac1] = useState('1/2');
  const [frac2, setFrac2] = useState('1/3');
  const [op, setOp] = useState('+');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const [n1, d1] = frac1.split('/').map(Number);
    const [n2, d2] = frac2.split('/').map(Number);
    if (!d1 || !d2) return;
    let n: number, d: number;
    switch (op) {
      case '+': n = n1 * d2 + n2 * d1; d = d1 * d2; break;
      case '-': n = n1 * d2 - n2 * d1; d = d1 * d2; break;
      case '*': n = n1 * n2; d = d1 * d2; break;
      case '/': n = n1 * d2; d = d1 * n2; break;
      default: n = 0; d = 1;
    }
    const g = gcd(Math.abs(n), Math.abs(d));
    n /= g; d /= g;
    const decimal = n / d;
    setResult(`${frac1} ${op === '*' ? '\u00d7' : op === '/' ? '\u00f7' : op} ${frac2} = ${n}/${d}${d === 1 ? ` = ${n}` : ` = ${decimal.toFixed(4)}`}`);
  }, [frac1, frac2, op]);
  const presets = [
    { label: '1/2 + 1/3', apply: () => { setFrac1('1/2'); setFrac2('1/3'); setOp('+'); } },
    { label: '3/4 * 2/5', apply: () => { setFrac1('3/4'); setFrac2('2/5'); setOp('*'); } },
  ];
  return (
    <CalculatorShell title="Fraction Calculator" result={result} onCalculate={calc} presets={presets} accent="rose">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Fraction 1</label><input type="text" value={frac1} onChange={e => setFrac1(e.target.value)} placeholder="1/2" className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Operation</label><select value={op} onChange={e => setOp(e.target.value)} className={inputCls}>
          <option value="+">+</option><option value="-">-</option><option value="*">\u00d7</option><option value="/">\u00f7</option>
        </select></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Fraction 2</label><input type="text" value={frac2} onChange={e => setFrac2(e.target.value)} placeholder="1/3" className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)] font-mono">
          <div className="text-lg text-[var(--text-primary)]">{result.split('\n')[0]}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function MeanMedianModeCalculator() {
  const [numbers, setNumbers] = useState('2,4,4,6,8');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const nums = numbers.split(',').map(Number).sort((a, b) => a - b);
    if (!nums.length || nums.some(isNaN)) return;
    const mean = nums.reduce((s, v) => s + v, 0) / nums.length;
    const mid = Math.floor(nums.length / 2);
    const median = nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
    const freq: Record<number, number> = {};
    nums.forEach(v => freq[v] = (freq[v] || 0) + 1);
    let mode = nums[0];
    let maxFreq = 1;
    Object.entries(freq).forEach(([k, v]) => { if (v > maxFreq) { maxFreq = v; mode = Number(k); } });
    const range = nums[nums.length - 1] - nums[0];
    setResult(`Mean: ${mean.toFixed(4)}\nMedian: ${median}\nMode: ${mode}\nRange: ${range}\nCount: ${nums.length}`);
  }, [numbers]);
  const presets = [
    { label: '2,4,4,6,8', apply: () => { setNumbers('2,4,4,6,8'); } },
    { label: '1,2,3,4,5', apply: () => { setNumbers('1,2,3,4,5'); } },
    { label: '10,20,30', apply: () => { setNumbers('10,20,30'); } },
  ];
  const nums = numbers.split(',').map(Number).sort((a, b) => a - b);
  const mean = nums.length ? nums.reduce((s, v) => s + v, 0) / nums.length : 0;
  return (
    <CalculatorShell title="Mean Median Mode Calculator" result={result} onCalculate={calc} presets={presets} accent="cyan">
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Numbers (comma-separated)</label><input type="text" value={numbers} onChange={e => setNumbers(e.target.value)} className={inputCls} /></div>
      {result && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Mean</div>
            <div className="text-lg font-bold text-indigo-400">{mean.toFixed(2)}</div>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Median</div>
            <div className="text-lg font-bold text-emerald-400">{nums.length ? (nums.length % 2 ? nums[Math.floor(nums.length / 2)] : ((nums[nums.length / 2 - 1] + nums[nums.length / 2]) / 2)) : 0}</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}


export function PpiCalculator() {
  const [diagPixels, setDiagPixels] = useState('2200');
  const [diagInches, setDiagInches] = useState('6.1');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const p = parseFloat(diagPixels) || 0;
    const i = parseFloat(diagInches) || 0;
    if (!i) return;
    const ppi = p / i;
    const dotPitch = 25.4 / ppi;
    setResult(`PPI: ${ppi.toFixed(2)}\nDot Pitch: ${dotPitch.toFixed(4)} mm`);
  }, [diagPixels, diagInches]);
  const presets = [
    { label: 'iPhone 6.1\"', apply: () => { setDiagPixels('2532'); setDiagInches('6.1'); } },
    { label: '27\" Monitor', apply: () => { setDiagPixels('3840'); setDiagInches('27'); } },
    { label: '15\" Laptop', apply: () => { setDiagPixels('1920'); setDiagInches('15.6'); } },
  ];
  const p = parseFloat(diagPixels) || 0;
  const i = parseFloat(diagInches) || 1;
  const ppi = p / i;
  return (
    <CalculatorShell title="PPI Calculator" result={result} onCalculate={calc} presets={presets} accent="orange">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Diagonal Pixels</label><input type="number" value={diagPixels} onChange={e => setDiagPixels(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Diagonal Inches</label><input type="number" value={diagInches} onChange={e => setDiagInches(e.target.value)} step="0.1" className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-tertiary)]">Pixels Per Inch</div>
          <div className="text-3xl font-bold text-purple-400">{ppi.toFixed(0)}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function PythagoreanTheoremCalculator() {
  const [a, setA] = useState('3');
  const [b, setB] = useState('4');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const na = parseFloat(a) || 0;
    const nb = parseFloat(b) || 0;
    if (!na || !nb) return;
    const c = Math.sqrt(na * na + nb * nb);
    const area = 0.5 * na * nb;
    const perimeter = na + nb + c;
    setResult(`Hypotenuse (c) = ${c.toFixed(4)}\nArea: ${area.toFixed(4)}\nPerimeter: ${perimeter.toFixed(4)}`);
  }, [a, b]);
  const presets = [
    { label: '3-4-5', apply: () => { setA('3'); setB('4'); } },
    { label: '5-12-13', apply: () => { setA('5'); setB('12'); } },
    { label: '6-8-10', apply: () => { setA('6'); setB('8'); } },
  ];
  const na = parseFloat(a) || 0;
  const nb = parseFloat(b) || 0;
  const c = Math.sqrt(na * na + nb * nb);
  return (
    <CalculatorShell title="Pythagorean Theorem" result={result} onCalculate={calc} presets={presets} accent="teal">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Side a</label><input type="number" value={a} onChange={e => setA(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Side b</label><input type="number" value={b} onChange={e => setB(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-tertiary)]">c = \u221a(a\u00b2 + b\u00b2)</div>
          <div className="text-3xl font-bold text-indigo-400">{c.toFixed(2)}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function QuadraticEquationSolver() {
  const [a, setA] = useState('1');
  const [b, setB] = useState('-3');
  const [c, setC] = useState('2');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const A = parseFloat(a) || 0;
    const B = parseFloat(b) || 0;
    const C = parseFloat(c) || 0;
    if (!A) { setResult('Coefficient "a" cannot be zero.'); return; }
    const disc = B * B - 4 * A * C;
    if (disc < 0) {
      const real = (-B / (2 * A)).toFixed(4);
      const imag = (Math.sqrt(-disc) / (2 * A)).toFixed(4);
      setResult(`Discriminant: ${disc.toFixed(4)} (negative)\nx = ${real} \u00b1 ${imag}i`);
    } else if (disc === 0) {
      const x = -B / (2 * A);
      setResult(`Discriminant: 0\nx = ${x.toFixed(4)} (one root)`);
    } else {
      const x1 = (-B + Math.sqrt(disc)) / (2 * A);
      const x2 = (-B - Math.sqrt(disc)) / (2 * A);
      setResult(`Discriminant: ${disc.toFixed(4)}\nx\u2081 = ${x1.toFixed(4)}\nx\u2082 = ${x2.toFixed(4)}`);
    }
  }, [a, b, c]);
  const presets = [
    { label: 'x\u00b2-3x+2=0', apply: () => { setA('1'); setB('-3'); setC('2'); } },
    { label: 'x\u00b2-4=0', apply: () => { setA('1'); setB('0'); setC('-4'); } },
    { label: 'x\u00b2+x+1=0', apply: () => { setA('1'); setB('1'); setC('1'); } },
  ];
  const A = parseFloat(a) || 0;
  const B = parseFloat(b) || 0;
  const C = parseFloat(c) || 0;
  const disc = B * B - 4 * A * C;
  return (
    <CalculatorShell title="Quadratic Solver" result={result} onCalculate={calc} presets={presets} accent="pink">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">a</label><input type="number" value={a} onChange={e => setA(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">b</label><input type="number" value={b} onChange={e => setB(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">c</label><input type="number" value={c} onChange={e => setC(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-tertiary)]">Discriminant</div>
          <div className={`text-lg font-bold ${disc >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>{disc.toFixed(2)}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function RectangleAreaCalculator() {
  const [length, setLength] = useState('10');
  const [width, setWidth] = useState('5');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const area = l * w;
    const perimeter = 2 * (l + w);
    const diagonal = Math.sqrt(l * l + w * w);
    setResult(`Area: ${area}\nPerimeter: ${perimeter}\nDiagonal: ${diagonal.toFixed(4)}`);
  }, [length, width]);
  const presets = [
    { label: '10 x 5', apply: () => { setLength('10'); setWidth('5'); } },
    { label: 'A4 (29.7x21)', apply: () => { setLength('29.7'); setWidth('21'); } },
    { label: '3 x 4', apply: () => { setLength('3'); setWidth('4'); } },
  ];
  const l = parseFloat(length) || 0;
  const w = parseFloat(width) || 0;
  return (
    <CalculatorShell title="Rectangle Calculator" result={result} onCalculate={calc} presets={presets} accent="lime">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Length</label><input type="number" value={length} onChange={e => setLength(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Width</label><input type="number" value={width} onChange={e => setWidth(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Area</div>
            <div className="text-lg font-bold text-indigo-400">{l * w}</div>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Perimeter</div>
            <div className="text-lg font-bold text-emerald-400">{2 * (l + w)}</div>
          </div>
          <div className="bg-[var(--bg-overlay)] rounded-xl p-3 text-center border border-[var(--border-subtle)]">
            <div className="text-xs text-[var(--text-tertiary)]">Diagonal</div>
            <div className="text-lg font-bold text-[var(--text-primary)]">{Math.sqrt(l * l + w * w).toFixed(1)}</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function SquareRootCalculator() {
  const [number, setNumber] = useState('144');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const n = parseFloat(number) || 0;
    if (n < 0) { setResult('Cannot calculate square root of a negative number.'); return; }
    const sqrt = Math.sqrt(n);
    const cubeRoot = Math.cbrt(n);
    setResult(`\u221a${n} = ${sqrt.toFixed(6)}\n\u221b${n} = ${cubeRoot.toFixed(6)}\n${n} = ${sqrt.toFixed(4)}²`);
  }, [number]);
  const presets = [
    { label: '\u221a144', apply: () => { setNumber('144'); } },
    { label: '\u221a2', apply: () => { setNumber('2'); } },
    { label: '\u221a10000', apply: () => { setNumber('10000'); } },
  ];
  const n = parseFloat(number) || 0;
  const sqrt = Math.sqrt(Math.max(0, n));
  return (
    <CalculatorShell title="Square Root Calculator" result={result} onCalculate={calc} presets={presets} accent="sky">
      <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Number</label><input type="number" value={number} onChange={e => setNumber(e.target.value)} className={inputCls} /></div>
      {result && n >= 0 && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-tertiary)]">\u221a{n}</div>
          <div className="text-3xl font-bold text-indigo-400">{sqrt.toFixed(4)}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

function evalScientific(input: string, degMode = true): number {
  let pos = 0;
  const s = input.replace(/\s+/g, '').toLowerCase()
    .replace(/u03c0/g, String(Math.PI))
    .replace(/pi/g, String(Math.PI))
    .replace(/\be\b(?![xp])/g, String(Math.E));

  const toRad = degMode ? (x: number) => x * Math.PI / 180 : (x: number) => x;
  const fromRad = degMode ? (x: number) => x * 180 / Math.PI : (x: number) => x;

  const funcs: Record<string, (x: number) => number> = {
    sin: x => Math.sin(toRad(x)),
    cos: x => Math.cos(toRad(x)),
    tan: x => Math.tan(toRad(x)),
    asin: x => fromRad(Math.asin(x)),
    acos: x => fromRad(Math.acos(x)),
    atan: x => fromRad(Math.atan(x)),
    sqrt: x => Math.sqrt(x),
    log: x => Math.log10(x),
    ln: x => Math.log(x),
    abs: x => Math.abs(x),
    ceil: x => Math.ceil(x),
    floor: x => Math.floor(x),
    round: x => Math.round(x),
  };

  function parseExpr(): number {
    let val = parseTerm();
    while (pos < s.length && (s[pos] === '+' || s[pos] === '-')) {
      const op = s[pos++];
      const right = parseTerm();
      val = op === '+' ? val + right : val - right;
    }
    return val;
  }

  function parseTerm(): number {
    let val = parsePower();
    while (pos < s.length && (s[pos] === '*' || s[pos] === '/')) {
      const op = s[pos++];
      const right = parsePower();
      val = op === '*' ? val * right : val / right;
    }
    return val;
  }

  function parsePower(): number {
    let val = parseUnary();
    while (pos < s.length && s[pos] === '^') {
      pos++;
      const right = parsePower();
      val = Math.pow(val, right);
    }
    return val;
  }

  function parseUnary(): number {
    if (pos < s.length && s[pos] === '-') { pos++; return -parseAtom(); }
    if (pos < s.length && s[pos] === '+') { pos++; }
    return parseAtom();
  }

  function parseAtom(): number {
    if (pos < s.length && s[pos] === '!') { pos++; return factorial(parseAtom()); }
    if (pos < s.length && s[pos] === '(') {
      pos++;
      const val = parseExpr();
      if (pos < s.length && s[pos] === ')') pos++;
      if (pos < s.length && s[pos] === '!') { pos++; return factorial(val); }
      return val;
    }
    for (const [name, fn] of Object.entries(funcs)) {
      if (s.startsWith(name + '(', pos)) {
        pos += name.length;
        if (pos < s.length && s[pos] === '(') pos++;
        const arg = parseExpr();
        if (pos < s.length && s[pos] === ')') pos++;
        const val = fn(arg);
        if (pos < s.length && s[pos] === '!') { pos++; return factorial(val); }
        return val;
      }
    }
    let numStr = '';
    while (pos < s.length && (/[0-9.]/).test(s[pos])) { numStr += s[pos++]; }
    if (numStr === '') throw new Error('Unexpected character');
    let val = parseFloat(numStr);
    if (pos < s.length && s[pos] === '!') { pos++; val = factorial(val); }
    if (pos < s.length && s[pos] === '%') { pos++; val /= 100; }
    return val;
  }

  const result = parseExpr();
  if (pos !== s.length) throw new Error('Unexpected character');
  return result;
}


export function ScientificCalculator() {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<Array<{expr: string; result: string}>>([]);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [memory, setMemory] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showFuncs, setShowFuncs] = useState(true);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const evaluate = useCallback((expression: string) => {
    if (!expression.trim()) return;
    try {
      const val = evalScientific(expression, angleMode === 'deg');
      const resultStr = Number.isInteger(val) && Math.abs(val) < 1e15 ? String(val) : parseFloat(val.toPrecision(12)).toString();
      setResult(resultStr);
      setError('');
      setHistory(prev => [...prev, { expr: expression, result: resultStr }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
      setResult('');
    }
  }, [angleMode]);

  const insertText = useCallback((text: string) => {
    setExpr(prev => prev + text);
    setError('');
    inputRef.current?.focus();
  }, []);

  const handleFunction = useCallback((fn: string, suffix = '(') => {
    setExpr(prev => prev + fn + suffix);
    inputRef.current?.focus();
  }, []);

  const handleClear = useCallback(() => { setExpr(''); setResult(''); setError(''); }, []);
  const handleBackspace = useCallback(() => { setExpr(prev => prev.slice(0, -1)); }, []);

  const handleEquals = useCallback(() => {
    if (!expr.trim()) return;
    evaluate(expr);
    setExpr('');
  }, [expr, evaluate]);

  const handleMemory = useCallback((op: 'clear' | 'recall' | 'add' | 'subtract') => {
    if (op === 'clear') { setMemory(null); return; }
    if (op === 'recall' && memory !== null) { setExpr(prev => prev + String(memory)); return; }
    const current = result ? parseFloat(result) : NaN;
    if (isNaN(current)) return;
    if (op === 'add') setMemory(m => (m ?? 0) + current);
    if (op === 'subtract') setMemory(m => (m ?? 0) - current);
  }, [result, memory]);

  const recallHistory = useCallback((entry: { expr: string; result: string }) => {
    setExpr(entry.expr);
    setResult(entry.result);
    setShowHistory(false);
  }, []);

  const copyResult = useCallback(() => {
    if (result) { navigator.clipboard.writeText(result); toast.success('Result copied'); }
  }, [result]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      const key = e.key;
      if (key === 'Enter') { e.preventDefault(); handleEquals(); return; }
      if (key === 'Escape') { handleClear(); return; }
      if (key === 'Backspace') { e.preventDefault(); handleBackspace(); return; }
      if (key === 'Delete') { handleClear(); return; }
      if (/^[0-9.]$/.test(key)) { insertText(key); return; }
      if (key === '+') { insertText('+'); return; }
      if (key === '-') { insertText('-'); return; }
      if (key === '*') { insertText('*'); return; }
      if (key === '/') { insertText('/'); return; }
      if (key === '^') { insertText('^'); return; }
      if (key === '(' || key === ')') { insertText(key); return; }
      if (key === '%') { insertText('%'); return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [insertText, handleClear, handleBackspace, handleEquals]);

  const evalDisplay = expr.replace(/\*/g, '\u00d7').replace(/\//g, '\u00f7');
  const btnBase = `h-10 sm:h-12 rounded-xl font-semibold text-sm sm:text-base transition-all active:scale-95 select-none flex items-center justify-center`;
  const btnNum = `${btnBase} bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]`;
  const btnOp = `${btnBase} bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 border border-indigo-500/20`;
  const btnEq = `${btnBase} bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg`;
  const btnFn = `${btnBase} bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs`;
  const btnClr = `${btnBase} bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20`;
  const btnMem = `${btnBase} bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs`;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h1 className="text-lg font-bold text-[var(--text-primary)]">Scientific Calculator</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHistory(!showHistory)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${showHistory ? 'bg-indigo-500/20 text-indigo-400' : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              History {history.length > 0 && `(${history.length})`}
            </button>
            <button onClick={() => setShowFuncs(!showFuncs)} className="px-3 py-1 rounded-lg text-xs font-medium bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {showFuncs ? 'Basic' : 'Sci'}
            </button>
            <button onClick={() => setAngleMode(m => m === 'deg' ? 'rad' : 'deg')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${angleMode === 'deg' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {angleMode.toUpperCase()}
            </button>
          </div>
        </div>
        <div className="mx-4 mb-3 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] p-4 min-h-[88px] flex flex-col justify-end">
          <div className="text-right text-sm text-[var(--text-secondary)] font-mono break-all min-h-[20px]">
            {evalDisplay || <span className="opacity-30">0</span>}
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="text-xs text-[var(--text-tertiary)]">{memory !== null && <span className="text-purple-400 font-bold">M</span>}</div>
            <div className="flex items-center gap-2">
              {result && (
                <>
                  <span className="text-2xl font-bold text-[var(--text-primary)] font-mono">{result}</span>
                  <button onClick={copyResult} className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors" title="Copy result"><Copy size={16} /></button>
                </>
              )}
              {error && <span className="text-sm text-red-400 font-medium">{error}</span>}
            </div>
          </div>
        </div>
        {showHistory && (
          <div ref={historyRef} className="mx-4 mb-3 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] max-h-40 overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-4 text-center text-sm text-[var(--text-tertiary)]">No history yet</div>
            ) : (
              [...history].reverse().map((entry, i) => (
                <button key={i} onClick={() => recallHistory(entry)} className="w-full text-left px-4 py-2 hover:bg-[var(--bg-elevated)] transition-colors border-b border-[var(--border-subtle)] last:border-0">
                  <div className="text-xs text-[var(--text-tertiary)] font-mono">{entry.expr.replace(/\*/g, '\u00d7').replace(/\//g, '\u00f7')}</div>
                  <div className="text-sm font-bold text-[var(--text-primary)] font-mono">= {entry.result}</div>
                </button>
              ))
            )}
          </div>
        )}
        {showFuncs && (
          <div className="px-4 pb-3">
            <div className="grid grid-cols-6 gap-1.5">
              <button className={btnFn} onClick={() => handleFunction('sin')}>sin</button>
              <button className={btnFn} onClick={() => handleFunction('cos')}>cos</button>
              <button className={btnFn} onClick={() => handleFunction('tan')}>tan</button>
              <button className={btnFn} onClick={() => handleFunction('asin')}>sin\u207b\u00b9</button>
              <button className={btnFn} onClick={() => handleFunction('acos')}>cos\u207b\u00b9</button>
              <button className={btnFn} onClick={() => handleFunction('atan')}>tan\u207b\u00b9</button>
              <button className={btnFn} onClick={() => handleFunction('log')}>log</button>
              <button className={btnFn} onClick={() => handleFunction('ln')}>ln</button>
              <button className={btnFn} onClick={() => handleFunction('sqrt')}>\u221a</button>
              <button className={btnFn} onClick={() => insertText('^')}>x\u207f</button>
              <button className={btnFn} onClick={() => insertText('!')}>x!</button>
              <button className={btnFn} onClick={() => insertText('1/')}>1/x</button>
              <button className={btnFn} onClick={() => insertText('\u03c0')}>\u03c0</button>
              <button className={btnFn} onClick={() => insertText('e')}>e</button>
              <button className={btnFn} onClick={() => insertText('(')}>(</button>
              <button className={btnFn} onClick={() => insertText(')')}>)</button>
              <button className={btnFn} onClick={() => insertText('**2')}>x\u00b2</button>
              <button className={btnFn} onClick={() => insertText('**3')}>x\u00b3</button>
            </div>
          </div>
        )}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-5 gap-1.5">
            <button className={btnMem} onClick={() => handleMemory('clear')}>MC</button>
            <button className={btnMem} onClick={() => handleMemory('recall')}>MR</button>
            <button className={btnMem} onClick={() => handleMemory('add')}>M+</button>
            <button className={btnMem} onClick={() => handleMemory('subtract')}>M-</button>
            <button className={btnClr} onClick={handleClear}>C</button>
            <button className={btnNum} onClick={() => insertText('7')}>7</button>
            <button className={btnNum} onClick={() => insertText('8')}>8</button>
            <button className={btnNum} onClick={() => insertText('9')}>9</button>
            <button className={btnOp} onClick={() => insertText('/')}>\u00f7</button>
            <button className={`${btnBase} bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]`} onClick={handleBackspace}><Delete size={18} /></button>
            <button className={btnNum} onClick={() => insertText('4')}>4</button>
            <button className={btnNum} onClick={() => insertText('5')}>5</button>
            <button className={btnNum} onClick={() => insertText('6')}>6</button>
            <button className={btnOp} onClick={() => insertText('*')}>\u00d7</button>
            <button className={btnFn} onClick={() => insertText('%')}>%</button>
            <button className={btnNum} onClick={() => insertText('1')}>1</button>
            <button className={btnNum} onClick={() => insertText('2')}>2</button>
            <button className={btnNum} onClick={() => insertText('3')}>3</button>
            <button className={btnOp} onClick={() => insertText('-')}>\u2212</button>
            <button className={btnFn} onClick={() => insertText('(-')}>\u00b1</button>
            <button className={`${btnNum} col-span-2`} onClick={() => insertText('0')}>0</button>
            <button className={btnNum} onClick={() => insertText('.')}>.</button>
            <button className={btnOp} onClick={() => insertText('+')}>+</button>
            <button className={btnEq} onClick={handleEquals}>=</button>
          </div>
        </div>
      </div>
      <div className="mt-3 text-center">
        <span className="text-xs text-[var(--text-tertiary)]">Keyboard supported \u00b7 Enter to evaluate \u00b7 Esc to clear</span>
      </div>
    </div>
  );
}


export function FluidTypographyCalculator() {
  const [base, setBase] = useState('16');
  const [minVw, setMinVw] = useState('320');
  const [maxVw, setMaxVw] = useState('1440');
  const [scale, setScale] = useState('1.25');
  const [minSize, setMinSize] = useState('');
  const [maxSize, setMaxSize] = useState('');
  const [result, setResult] = useState<Array<{size: string; value: number}>>([]);
  const [fontSizes, setFontSizes] = useState<Array<{level: number; cls: string}>>([]);
  const calc = useCallback(() => {
    const b = parseFloat(base) || 16;
    const mn = parseFloat(minVw) || 320;
    const mx = parseFloat(maxVw) || 1440;
    const s = parseFloat(scale) || 1.25;
    const minClamp = parseFloat(minSize) || b * 0.75;
    const maxClamp = parseFloat(maxSize) || b * 1.5;
    const levels = [-2, -1, 0, 1, 2, 3, 4, 5];
    const sizes = levels.map(l => {
      const val = b * Math.pow(s, l);
      const clampMin = Math.max(minClamp, val * 0.7);
      const clampMax = Math.max(maxClamp, val * 1.2);
      const slope = (clampMax - clampMin) / (mx - mn);
      const intercept = clampMin - slope * mn;
      const desktop = Math.round(val * 10) / 10;
      const cls = `${Math.round(l === 0 ? b * 100 : val * 100) / 100}`;
      return { size: l <= 0 ? `h${Math.abs(l) + 6}` : `h${6 - l}`, value: desktop, level: l };
    });
    setResult(sizes);
    setFontSizes([]);
  }, [base, minVw, maxVw, scale, minSize, maxSize]);
  const b2 = parseFloat(base) || 16;
  const mn2 = parseFloat(minVw) || 320;
  const mx2 = parseFloat(maxVw) || 1440;
  const minSz = parseFloat(minSize) || b2 * 0.75;
  const maxSz = parseFloat(maxSize) || b2 * 1.2;
  const slope2 = ((maxSz - minSz) / (mx2 - mn2) * 100).toFixed(4);
  const intercept2 = (minSz - mn2 * (maxSz - minSz) / (mx2 - mn2)).toFixed(2);
  const cssClamp = `font-size: clamp(${minSz.toFixed(1)}px, ${slope2}vw + ${intercept2}px, ${maxSz.toFixed(1)}px);`;
  return (
    <CalculatorShell title="Fluid Typography" accent="purple" result={result.length > 0 ? `${result.length} sizes generated` : ''} onCalculate={calc}>
      <div className="max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Base Font Size (px)</label><input className={inputCls} value={base} onChange={e => setBase(e.target.value)} /></div>
          <div><label className={labelCls}>Scale Ratio</label><input className={inputCls} value={scale} onChange={e => setScale(e.target.value)} /></div>
          <div><label className={labelCls}>Min Viewport (px)</label><input className={inputCls} value={minVw} onChange={e => setMinVw(e.target.value)} /></div>
          <div><label className={labelCls}>Max Viewport (px)</label><input className={inputCls} value={maxVw} onChange={e => setMaxVw(e.target.value)} /></div>
          <div><label className={labelCls}>Min Clamp (px, optional)</label><input className={inputCls} value={minSize} onChange={e => setMinSize(e.target.value)} placeholder="Auto" /></div>
          <div><label className={labelCls}>Max Clamp (px, optional)</label><input className={inputCls} value={maxSize} onChange={e => setMaxSize(e.target.value)} placeholder="Auto" /></div>
        </div>
        {result.length > 0 && (
          <div className="mt-6">
            <div className="text-sm font-bold text-[var(--text-primary)] mb-3">Type Scale</div>
            <div className="grid gap-3">
              {result.reverse().map((r, i) => {
                const baseRatio = r.value / (parseFloat(base) || 16);
                const bg = baseRatio >= 2 ? 'bg-purple-500/10 border border-purple-500/20' : baseRatio >= 1.5 ? 'bg-blue-500/10' : baseRatio <= 0.7 ? 'bg-rose-500/10' : 'bg-[var(--bg-overlay)]';
                return (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-xl ${bg}`}>
                    <div>
                      <span className="text-sm font-mono font-bold text-[var(--text-primary)]">{r.size}</span>
                      <span className="text-xs text-[var(--text-tertiary)] ml-2">{baseRatio >= 2 ? 'Display' : baseRatio <= 0.7 ? 'Caption' : 'Body'}</span>
                    </div>
                    <span className="text-lg font-bold text-[var(--text-primary)] font-mono">{r.value}px</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
              <div className="text-xs text-[var(--text-tertiary)] mb-2">CSS clamp() formula (base):</div>
              <code className="text-xs font-mono text-purple-400 break-all">{cssClamp}</code>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

export function BmiCalculatorForKids() {
  const [age, setAge] = useState('10');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [height, setHeight] = useState('140');
  const [weight, setWeight] = useState('35');
  const [result, setResult] = useState('');
  const [category, setCategory] = useState('');
  const [percentile, setPercentile] = useState(0);
  const calc = useCallback(() => {
    const a = parseFloat(age) || 0;
    const h = parseFloat(height) || 0;
    const w = parseFloat(weight) || 0;
    if (!a || !h || !w) { setResult('Please fill all fields.'); return; }
    const bmi = w / ((h / 100) ** 2);
    const bmiRounded = Math.round(bmi * 10) / 10;
    const medianBmi: Record<string, Record<number, number>> = { male: { 2:15.5,5:15.4,8:16.2,10:17.0,12:18.0,14:19.5,16:21.0,18:22.5 }, female: { 2:15.3,5:15.2,8:16.3,10:17.2,12:18.5,14:19.8,16:21.2,18:22.3 } };
    const ages = Object.keys(medianBmi[gender]).map(Number);
    const closest = ages.reduce((prev, curr) => Math.abs(curr - a) < Math.abs(prev - a) ? curr : prev);
    const median = medianBmi[gender][closest];
    const pct = median ? Math.round((1 - (Math.abs(bmi - median) / (median * 0.3))) * 100) : 50;
    const clamped = Math.max(1, Math.min(99, pct));
    setPercentile(clamped);
    let cat = '';
    if (bmiRounded < 14.5) cat = 'Underweight';
    else if (bmiRounded < 18.5) cat = 'Normal weight';
    else if (bmiRounded < 25) cat = 'Overweight';
    else cat = 'Obese';
    setCategory(cat);
    setResult(bmiRounded.toString());
  }, [age, gender, height, weight]);
  return (
    <CalculatorShell title="BMI Calculator for Kids (2-18)" accent="cyan" result={result} onCalculate={calc}>
      <div className="max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Age (years)</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
          <div><label className={labelCls}>Gender</label><select className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
          <div><label className={labelCls}>Height (cm)</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
          <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        </div>
        <div className="flex gap-3 mt-3">
          <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setAge('8'); setHeight('128'); setWeight('25'); }}>Age 8 (Boy)</button>
          <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setAge('12'); setHeight('150'); setWeight('42'); }}>Age 12 (Girl)</button>
        </div>
        {result && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">BMI</div>
              <div className="text-2xl font-bold text-cyan-400">{result}</div>
            </div>
            <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Category</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">{category}</div>
            </div>
            <div className="col-span-2 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="text-xs text-[var(--text-tertiary)] mb-2">Estimated Percentile: {percentile}th</div>
              <div className="w-full bg-[var(--bg-overlay)] rounded-full h-3">
                <div className="h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all" style={{ width: `${percentile}%` }} />
              </div>
              <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-1"><span>Underweight</span><span>Normal</span><span>Overweight</span></div>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

export function BodyFatPercentageCalculator() {
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [weight, setWeight] = useState('80');
  const [waist, setWaist] = useState('90');
  const [neck, setNeck] = useState('40');
  const [hip, setHip] = useState('100');
  const [result, setResult] = useState('');
  const [category, setCategory] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const wa = parseFloat(waist) || 0;
    const n = parseFloat(neck) || 0;
    const h = parseFloat(hip) || 0;
    if (!w || !wa || !n) { setResult('Please fill required fields.'); return; }
    let bf: number;
    if (gender === 'male') {
      bf = 495 / (1.0324 - 0.19077 * Math.log10(wa - n) + 0.15456 * Math.log10(w)) - 450;
    } else {
      if (!h) { setResult('Hip measurement required for female.'); return; }
      bf = 495 / (1.29579 - 0.35004 * Math.log10(wa + h - n) + 0.22100 * Math.log10(w)) - 450;
    }
    const rounded = Math.round(bf * 10) / 10;
    setResult(rounded.toString());
    let cat = '';
    if (gender === 'male') {
      if (rounded < 6) cat = 'Essential fat';
      else if (rounded < 14) cat = 'Athletes';
      else if (rounded < 18) cat = 'Fitness';
      else if (rounded < 25) cat = 'Acceptable';
      else cat = 'Obese';
    } else {
      if (rounded < 14) cat = 'Essential fat';
      else if (rounded < 21) cat = 'Athletes';
      else if (rounded < 25) cat = 'Fitness';
      else if (rounded < 32) cat = 'Acceptable';
      else cat = 'Obese';
    }
    setCategory(cat);
  }, [gender, weight, waist, neck, hip]);
  return (
    <CalculatorShell title="Body Fat Percentage" accent="rose" result={result} onCalculate={calc}>
      <div className="max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Gender</label><select className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
          <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
          <div><label className={labelCls}>Waist (cm)</label><input className={inputCls} type="number" value={waist} onChange={e => setWaist(e.target.value)} /></div>
          <div><label className={labelCls}>Neck (cm)</label><input className={inputCls} type="number" value={neck} onChange={e => setNeck(e.target.value)} /></div>
          <div className={gender === 'female' ? '' : 'opacity-50'}><label className={labelCls}>Hip (cm, female)</label><input className={inputCls} type="number" value={hip} onChange={e => setHip(e.target.value)} disabled={gender === 'male'} /></div>
        </div>
        {result && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Body Fat</div>
              <div className="text-2xl font-bold text-rose-400">{result}%</div>
            </div>
            <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Category</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">{category}</div>
            </div>
            <div className="col-span-2 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4">
              <div className="text-xs text-[var(--text-tertiary)] mb-2">Body Fat Indicator</div>
              <div className="w-full bg-[var(--bg-overlay)] rounded-full h-3">
                <div className={`h-3 rounded-full transition-all ${parseFloat(result) > 25 ? 'bg-red-500' : parseFloat(result) > 18 ? 'bg-yellow-500' : parseFloat(result) > 14 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, Math.max(5, parseFloat(result) * 2.5))}%` }} />
              </div>
              <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-1"><span>Essential</span><span>Fitness</span><span>Acceptable</span><span>Obese</span></div>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

export function BodySurfaceAreaCalculator() {
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [unit, setUnit] = useState<'metric'|'imperial'>('metric');
  const [result, setResult] = useState<{m2: number; formula: string; value: number}[]>([]);
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    if (!w || !h) { setResult([]); return; }
    const wKg = unit === 'imperial' ? w * 0.453592 : w;
    const hCm = unit === 'imperial' ? h * 2.54 : h;
    const formulas = [
      { name: 'Mosteller', calc: Math.sqrt(wKg * hCm / 3600) },
      { name: 'Du Bois', calc: 0.007184 * Math.pow(wKg, 0.425) * Math.pow(hCm, 0.725) },
      { name: 'Haycock', calc: 0.024265 * Math.pow(wKg, 0.5378) * Math.pow(hCm, 0.3964) },
      { name: 'Gehan & George', calc: 0.0235 * Math.pow(wKg, 0.51456) * Math.pow(hCm, 0.42246) },
    ];
    setResult(formulas.map(f => ({ m2: Math.round(f.calc * 100) / 100, formula: f.name, value: Math.round(f.calc * 100) / 100 })));
  }, [weight, height, unit]);
  return (
    <CalculatorShell title="Body Surface Area (BSA)" accent="emerald" result={result.length > 0 ? `Avg: ${(result.reduce((s, r) => s + r.m2, 0) / result.length).toFixed(2)} m²` : ''} onCalculate={calc}>
      <div className="max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Unit</label><select className={inputCls} value={unit} onChange={e => setUnit(e.target.value as 'metric'|'imperial')}><option value="metric">Metric (kg/cm)</option><option value="imperial">Imperial (lb/in)</option></select></div>
          <div><label className={labelCls}>{unit === 'metric' ? 'Weight (kg)' : 'Weight (lb)'}</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
          <div><label className={labelCls}>{unit === 'metric' ? 'Height (cm)' : 'Height (in)'}</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
        </div>
        <div className="flex gap-3 mt-3">
          <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setWeight('70'); setHeight('170'); }}>Adult (70kg/170cm)</button>
          <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setWeight('85'); setHeight('180'); }}>Adult (85kg/180cm)</button>
        </div>
        {result.length > 0 && (
          <div className="mt-6 grid gap-3">
            {result.map((r, i) => {
              const styles = [
                { bg: 'bg-emerald-500/10 border border-emerald-500/20', text: 'text-emerald-400' },
                { bg: 'bg-blue-500/10 border border-blue-500/20', text: 'text-blue-400' },
                { bg: 'bg-violet-500/10 border border-violet-500/20', text: 'text-violet-400' },
                { bg: 'bg-amber-500/10 border border-amber-500/20', text: 'text-amber-400' },
              ];
              const s = styles[i] || styles[0];
              return (
                <div key={i} className={`flex items-center justify-between ${s.bg} rounded-xl p-4`}>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{r.formula}</span>
                  <span className={`text-xl font-bold ${s.text} font-mono`}>{r.m2} m²</span>
                </div>
              );
            })}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Average of all formulas</div>
              <div className="text-2xl font-bold text-emerald-400">{(result.reduce((s, r) => s + r.m2, 0) / result.length).toFixed(2)} m²</div>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}


export function BabyFormulaCalculator() {
  const [age, setAge] = useState('3');
  const [weight, setWeight] = useState('6');
  const [feedsPerDay, setFeedsPerDay] = useState('8');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const a = parseFloat(age) || 0;
    const w = parseFloat(weight) || 0;
    const feeds = parseFloat(feedsPerDay) || 8;
    let dailyMl: number;
    if (a <= 0.5) dailyMl = w * 150;
    else if (a <= 3) dailyMl = w * 135;
    else if (a <= 6) dailyMl = w * 120;
    else if (a <= 12) dailyMl = w * 100;
    else dailyMl = w * 90;
    const perFeed = dailyMl / feeds;
    setResult(`Daily: ${Math.round(dailyMl)} mL (${(dailyMl * 0.0338).toFixed(1)} oz)\nPer feed: ${Math.round(perFeed)} mL (${(perFeed * 0.0338).toFixed(1)} oz)\nFeeds: ${feeds} per day`);
  }, [age, weight, feedsPerDay]);
  return (
    <CalculatorShell title="Baby Formula Calculator" accent="pink" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Age (months)</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Feeds / day</label><input className={inputCls} type="number" value={feedsPerDay} onChange={e => setFeedsPerDay(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

export function BabyGrowthPercentileCalculator() {
  const [age, setAge] = useState('12');
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [height, setHeight] = useState('75');
  const [weight, setWeight] = useState('10');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const a = parseFloat(age) || 0;
    const h = parseFloat(height) || 0;
    const w = parseFloat(weight) || 0;
    if (!a || !h || !w) { setResult(''); return; }
    const avgHeight: Record<string, Record<number, number>> = { male: { 0:50,6:68,12:76,24:87,36:96,48:103,60:110 }, female: { 0:49,6:66,12:74,24:86,36:95,48:102,60:109 } };
    const avgWeight: Record<string, Record<number, number>> = { male: { 0:3.4,6:7.9,12:10.2,24:12.8,36:14.5,48:16.5,60:18.5 }, female: { 0:3.2,6:7.3,12:9.5,24:12.2,36:14.0,48:16.0,60:18.0 } };
    const ages: number[] = Object.keys(avgHeight[gender]).map(k => parseInt(k));
    const closest = ages.reduce((x, y) => Math.abs(x - a) < Math.abs(y - a) ? x : y);
    const medH = avgHeight[gender][closest];
    const medW = avgWeight[gender][closest];
    const hPct = medH ? Math.round((1 - Math.abs(h - medH) / (medH * 0.15)) * 100) : 50;
    const wPct = medW ? Math.round((1 - Math.abs(w - medW) / (medW * 0.2)) * 100) : 50;
    setResult(`Height: ${Math.max(1, Math.min(99, hPct))}th percentile\nWeight: ${Math.max(1, Math.min(99, wPct))}th percentile`);
  }, [age, gender, height, weight]);
  return (
    <CalculatorShell title="Baby Growth Percentile" accent="rose" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Age (months)</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className={labelCls}>Gender</label><select className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label className={labelCls}>Height / Length (cm)</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

export function BabySleepScheduleCalculator() {
  const [ageWeeks, setAgeWeeks] = useState('8');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(ageWeeks) || 0;
    const totalSleep = w <= 4 ? 16 : w <= 12 ? 15 : w <= 24 ? 14 : w <= 48 ? 13 : 12;
    const nightSleep = w <= 4 ? 8 : w <= 12 ? 9 : w <= 24 ? 10 : w <= 48 ? 10.5 : 11;
    const daySleep = totalSleep - nightSleep;
    const naps = w <= 12 ? 4 : w <= 24 ? 3 : w <= 48 ? 2 : 1;
    const wakeWindow = w <= 4 ? '45-60 min' : w <= 12 ? '60-90 min' : w <= 24 ? '2-3 hours' : '3-4 hours';
    setResult(`Total sleep: ${totalSleep}h/day\nNight: ${nightSleep}h | Day: ${daySleep}h\nNaps: ${naps}\nWake window: ${wakeWindow}`);
  }, [ageWeeks]);
  return (
    <CalculatorShell title="Baby Sleep Schedule" accent="purple" result={result} onCalculate={calc}>
      <div className="max-w-sm">
        <div><label className={labelCls}>Age (weeks)</label><input className={inputCls} type="number" value={ageWeeks} onChange={e => setAgeWeeks(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => setAgeWeeks('4')}>Newborn (4w)</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => setAgeWeeks('16')}>4 months</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => setAgeWeeks('52')}>12 months</button>
      </div>
    </CalculatorShell>
  );
}

export function BreastfeedingCalorieCalculator() {
  const [age, setAge] = useState('3');
  const [feedings, setFeedings] = useState('8');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const a = parseFloat(age) || 0;
    const f = parseFloat(feedings) || 8;
    const milkPerFeedMl = a <= 1 ? 60 : a <= 2 ? 90 : a <= 4 ? 120 : a <= 6 ? 150 : a <= 12 ? 180 : 210;
    const dailyMl = milkPerFeedMl * f;
    const caloriesBurned = Math.round(dailyMl * 0.67);
    setResult(`Est. milk per feed: ${milkPerFeedMl} mL\nDaily milk output: ${dailyMl} mL\nCalories burned: ~${caloriesBurned} kcal/day`);
  }, [age, feedings]);
  return (
    <CalculatorShell title="Breastfeeding Calories" accent="fuchsia" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Baby age (months)</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className={labelCls}>Feedings / day</label><input className={inputCls} type="number" value={feedings} onChange={e => setFeedings(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

export function CalorieCalculator() {
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [age, setAge] = useState('30');
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('180');
  const [activity, setActivity] = useState('1.55');
  const [goal, setGoal] = useState('maintain');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const a = parseFloat(age) || 30;
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    const act = parseFloat(activity) || 1.55;
    if (!w || !h) { setResult(''); return; }
    let bmr: number;
    if (gender === 'male') bmr = 10 * w + 6.25 * h - 5 * a + 5;
    else bmr = 10 * w + 6.25 * h - 5 * a - 161;
    const tdee = bmr * act;
    let goalCals = tdee;
    if (goal === 'lose') goalCals = tdee - 500;
    else if (goal === 'gain') goalCals = tdee + 500;
    setResult(`BMR: ${Math.round(bmr)} kcal\nTDEE: ${Math.round(tdee)} kcal\n${goal === 'maintain' ? 'Maintenance' : goal === 'lose' ? 'Weight loss (-0.5kg/wk)' : 'Weight gain (+0.5kg/wk)'}: ${Math.round(goalCals)} kcal`);
  }, [gender, age, weight, height, activity, goal]);
  return (
    <CalculatorShell title="Calorie Calculator (TDEE)" accent="emerald" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Gender</label><select className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label className={labelCls}>Age</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Height (cm)</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
        <div><label className={labelCls}>Activity level</label><select className={inputCls} value={activity} onChange={e => setActivity(e.target.value)}><option value="1.2">Sedentary</option><option value="1.375">Light (1-3 days)</option><option value="1.55">Moderate (3-5 days)</option><option value="1.725">Very active (6-7 days)</option><option value="1.9">Extra active</option></select></div>
        <div><label className={labelCls}>Goal</label><select className={inputCls} value={goal} onChange={e => setGoal(e.target.value)}><option value="lose">Lose weight</option><option value="maintain">Maintain</option><option value="gain">Gain weight</option></select></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setAge('30'); setWeight('70'); setHeight('170'); setGender('male'); }}>Avg Male</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setAge('30'); setWeight('60'); setHeight('165'); setGender('female'); }}>Avg Female</button>
      </div>
    </CalculatorShell>
  );
}

export function ChildHeightPredictor() {
  const [parentHeight, setParentHeight] = useState('170');
  const [motherHeight, setMotherHeight] = useState('160');
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [childAge, setChildAge] = useState('8');
  const [childHeight, setChildHeight] = useState('130');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const ph = parseFloat(parentHeight) || 0;
    const mh = parseFloat(motherHeight) || 0;
    const age = parseFloat(childAge) || 0;
    const ch = parseFloat(childHeight) || 0;
    if (!ph || !mh) { setResult(''); return; }
    const midParent = (ph + mh) / 2;
    let predicted: number;
    if (gender === 'male') predicted = midParent + 6.5;
    else predicted = midParent - 6.5;
    if (age > 2 && age < 18 && ch) {
      const adjusted = (ch / (age >= 2 ? (100 + (age - 2) * 6.2) : 100)) * predicted;
      predicted = Math.round((predicted + adjusted) / 2);
    }
    setResult(`Mid-parental height: ${midParent.toFixed(1)} cm\nPredicted adult height: ${Math.round(predicted)} cm (${(predicted / 2.54).toFixed(1)} in)`);
  }, [parentHeight, motherHeight, gender, childAge, childHeight]);
  return (
    <CalculatorShell title="Child Height Predictor" accent="cyan" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Father height (cm)</label><input className={inputCls} type="number" value={parentHeight} onChange={e => setParentHeight(e.target.value)} /></div>
        <div><label className={labelCls}>Mother height (cm)</label><input className={inputCls} type="number" value={motherHeight} onChange={e => setMotherHeight(e.target.value)} /></div>
        <div><label className={labelCls}>Child gender</label><select className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label className={labelCls}>Child age (optional)</label><input className={inputCls} type="number" value={childAge} onChange={e => setChildAge(e.target.value)} /></div>
        <div><label className={labelCls}>Child height (optional)</label><input className={inputCls} type="number" value={childHeight} onChange={e => setChildHeight(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}


export function CyclingCalorieCalculator() {
  const [weight, setWeight] = useState('80');
  const [distance, setDistance] = useState('30');
  const [speed, setSpeed] = useState('25');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const d = parseFloat(distance) || 0;
    const s = parseFloat(speed) || 0;
    if (!w || !d || !s) { setResult(''); return; }
    const hours = d / s;
    const met = s < 16 ? 4 : s < 20 ? 6 : s < 25 ? 8 : s < 30 ? 10 : 12;
    const calories = Math.round(met * w * hours);
    setResult(`Duration: ${hours.toFixed(1)} hours\nMET: ${met}\nCalories burned: ${calories} kcal`);
  }, [weight, distance, speed]);
  return (
    <CalculatorShell title="Cycling Calorie Calculator" accent="orange" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Distance (km)</label><input className={inputCls} type="number" value={distance} onChange={e => setDistance(e.target.value)} /></div>
        <div><label className={labelCls}>Speed (km/h)</label><input className={inputCls} type="number" value={speed} onChange={e => setSpeed(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setWeight('70'); setDistance('20'); setSpeed('20'); }}>Leisure ride</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setWeight('80'); setDistance('50'); setSpeed('28'); }}>Road training</button>
      </div>
    </CalculatorShell>
  );
}

export function HeartRateZoneCalculator() {
  const [age, setAge] = useState('35');
  const [restHr, setRestHr] = useState('65');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const a = parseFloat(age) || 35;
    const rhr = parseFloat(restHr) || 65;
    const maxHr = 220 - a;
    const reserve = maxHr - rhr;
    const zones = [
      { name: 'Zone 1: Very Light', intensity: '50-60%', min: Math.round(rhr + reserve * 0.5), max: Math.round(rhr + reserve * 0.6) },
      { name: 'Zone 2: Light', intensity: '60-70%', min: Math.round(rhr + reserve * 0.6), max: Math.round(rhr + reserve * 0.7) },
      { name: 'Zone 3: Moderate', intensity: '70-80%', min: Math.round(rhr + reserve * 0.7), max: Math.round(rhr + reserve * 0.8) },
      { name: 'Zone 4: Hard', intensity: '80-90%', min: Math.round(rhr + reserve * 0.8), max: Math.round(rhr + reserve * 0.9) },
      { name: 'Zone 5: Maximum', intensity: '90-100%', min: Math.round(rhr + reserve * 0.9), max: maxHr },
    ];
    setResult(`Max HR: ${maxHr} bpm\nHR Reserve: ${reserve} bpm` + zones.map(z => `\n${z.name}: ${z.min}-${z.max} bpm`).join(''));
  }, [age, restHr]);
  return (
    <CalculatorShell title="Heart Rate Zone Calculator" accent="rose" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Age</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className={labelCls}>Resting HR (bpm)</label><input className={inputCls} type="number" value={restHr} onChange={e => setRestHr(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setAge('25'); setRestHr('60'); }}>Athlete 25</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setAge('45'); setRestHr('72'); }}>Average 45</button>
      </div>
    </CalculatorShell>
  );
}

export function IdealWeightCalculator() {
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [height, setHeight] = useState('180');
  const [frame, setFrame] = useState<'small'|'medium'|'large'>('medium');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const h = parseFloat(height) || 0;
    if (!h) { setResult(''); return; }
    const hIn = h / 2.54;
    let devine: number, robinson: number, miller: number, hamwi: number;
    if (gender === 'male') {
      devine = 50 + 2.3 * (hIn - 60);
      robinson = 52 + 1.9 * (hIn - 60);
      miller = 56.2 + 1.41 * (hIn - 60);
      hamwi = 48 + 2.7 * (hIn - 60);
    } else {
      devine = 45.5 + 2.3 * (hIn - 60);
      robinson = 49 + 1.7 * (hIn - 60);
      miller = 53.1 + 1.36 * (hIn - 60);
      hamwi = 45.5 + 2.2 * (hIn - 60);
    }
    const frameAdj = frame === 'small' ? 0.9 : frame === 'large' ? 1.1 : 1;
    const avg = (devine + robinson + miller + hamwi) / 4 * frameAdj;
    setResult(`Devine: ${devine.toFixed(1)} kg\nRobinson: ${robinson.toFixed(1)} kg\nMiller: ${miller.toFixed(1)} kg\nHamwi: ${hamwi.toFixed(1)} kg\nAverage: ${avg.toFixed(1)} kg (${(avg * 2.205).toFixed(1)} lb)`);
  }, [gender, height, frame]);
  return (
    <CalculatorShell title="Ideal Weight Calculator" accent="teal" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Gender</label><select className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label className={labelCls}>Height (cm)</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
        <div><label className={labelCls}>Frame</label><select className={inputCls} value={frame} onChange={e => setFrame(e.target.value as 'small'|'medium'|'large')}><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></div>
      </div>
    </CalculatorShell>
  );
}

export function KetoCalculator() {
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('180');
  const [age, setAge] = useState('35');
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [activity, setActivity] = useState('1.55');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    const a = parseFloat(age) || 35;
    const act = parseFloat(activity) || 1.55;
    if (!w || !h) { setResult(''); return; }
    const bmr = gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    const tdee = bmr * act;
    const deficit = tdee - 500;
    const protein = w * 1.8;
    const fat = (deficit - protein * 4) / 9;
    const carbs = 20;
    setResult(`Daily calories: ${Math.round(deficit)} kcal\nProtein: ${Math.round(protein)} g (${Math.round(protein * 4)} kcal)\nFat: ${Math.round(fat)} g (${Math.round(fat * 9)} kcal)\nCarbs: ${carbs} g (${carbs * 4} kcal)\nNet carbs: ${carbs}g target`);
  }, [weight, height, age, gender, activity]);
  return (
    <CalculatorShell title="Keto Calculator" accent="amber" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Height (cm)</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
        <div><label className={labelCls}>Age</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className={labelCls}>Gender</label><select className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label className={labelCls}>Activity</label><select className={inputCls} value={activity} onChange={e => setActivity(e.target.value)}><option value="1.2">Sedentary</option><option value="1.375">Light</option><option value="1.55">Moderate</option><option value="1.725">Very active</option></select></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setWeight('80'); setHeight('180'); setAge('35'); setGender('male'); }}>Avg Male</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setWeight('65'); setHeight('165'); setAge('35'); setGender('female'); }}>Avg Female</button>
      </div>
    </CalculatorShell>
  );
}

export function LeanBodyMassCalculator() {
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('180');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    if (!w || !h) { setResult(''); return; }
    const boer = gender === 'male' ? 0.407 * w + 0.267 * h - 19.2 : 0.252 * w + 0.473 * h - 48.3;
    const james = gender === 'male' ? 1.1 * w - 128 * Math.pow(w / h, 2) : 1.07 * w - 148 * Math.pow(w / h, 2);
    const avg = (boer + james) / 2;
    setResult(`Boer formula: ${Math.round(boer * 10) / 10} kg\nJames formula: ${Math.round(james * 10) / 10} kg\nAverage LBM: ${Math.round(avg * 10) / 10} kg\nBody fat est.: ${Math.round((w - avg) / w * 100)}%`);
  }, [gender, weight, height]);
  return (
    <CalculatorShell title="Lean Body Mass" accent="blue" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Gender</label><select className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Height (cm)</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

export function MacroCalculator() {
  const [calories, setCalories] = useState('2000');
  const [proteinPct, setProteinPct] = useState('30');
  const [carbsPct, setCarbsPct] = useState('40');
  const [fatPct, setFatPct] = useState('30');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const cals = parseFloat(calories) || 0;
    const p = parseFloat(proteinPct) || 0;
    const c = parseFloat(carbsPct) || 0;
    const f = parseFloat(fatPct) || 0;
    if (!cals || Math.abs(p + c + f - 100) > 1) { setResult('Percentages must add to 100%.'); return; }
    const proteinG = cals * (p / 100) / 4;
    const carbsG = cals * (c / 100) / 4;
    const fatG = cals * (f / 100) / 9;
    setResult(`Protein: ${Math.round(proteinG)}g (${Math.round(proteinG * 4)} kcal)\nCarbs: ${Math.round(carbsG)}g (${Math.round(carbsG * 4)} kcal)\nFat: ${Math.round(fatG)}g (${Math.round(fatG * 9)} kcal)`);
  }, [calories, proteinPct, carbsPct, fatPct]);
  return (
    <CalculatorShell title="Macro Calculator" accent="lime" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Daily calories</label><input className={inputCls} type="number" value={calories} onChange={e => setCalories(e.target.value)} /></div>
        <div className="opacity-0 pointer-events-none"><label className={labelCls}>_</label><input className={inputCls} /></div>
        <div><label className={labelCls}>Protein %</label><input className={inputCls} type="number" value={proteinPct} onChange={e => setProteinPct(e.target.value)} /></div>
        <div><label className={labelCls}>Carbs %</label><input className={inputCls} type="number" value={carbsPct} onChange={e => setCarbsPct(e.target.value)} /></div>
        <div><label className={labelCls}>Fat %</label><input className={inputCls} type="number" value={fatPct} onChange={e => setFatPct(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setCalories('2000'); setProteinPct('30'); setCarbsPct('40'); setFatPct('30'); }}>Balanced</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setCalories('2000'); setProteinPct('40'); setCarbsPct('20'); setFatPct('40'); }}>Keto</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setCalories('2500'); setProteinPct('35'); setCarbsPct('45'); setFatPct('20'); }}>Muscle gain</button>
      </div>
    </CalculatorShell>
  );
}


export function OvulationCalculator() {
  const [cycle, setCycle] = useState('28');
  const [lastPeriod, setLastPeriod] = useState('2026-01-15');
  const [periodLen, setPeriodLen] = useState('5');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const cyc = parseFloat(cycle) || 28;
    const pl = parseFloat(periodLen) || 5;
    if (!lastPeriod) { setResult(''); return; }
    const lmp = new Date(lastPeriod);
    if (isNaN(lmp.getTime())) { setResult('Invalid date.'); return; }
    const ovulationDay = new Date(lmp);
    ovulationDay.setDate(lmp.getDate() + cyc - 14);
    const fertileStart = new Date(ovulationDay);
    fertileStart.setDate(ovulationDay.getDate() - 5);
    const fertileEnd = new Date(ovulationDay);
    fertileEnd.setDate(ovulationDay.getDate() + 1);
    const nextPeriod = new Date(lmp);
    nextPeriod.setDate(lmp.getDate() + cyc);
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    setResult(`Ovulation day: ${fmt(ovulationDay)}\nFertile window: ${fmt(fertileStart)} - ${fmt(fertileEnd)}\nNext period: ${fmt(nextPeriod)}\nCycle day ${cyc - 14} (ovulation)`);
  }, [cycle, lastPeriod, periodLen]);
  return (
    <CalculatorShell title="Ovulation Calculator" accent="rose" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Cycle length (days)</label><input className={inputCls} type="number" value={cycle} onChange={e => setCycle(e.target.value)} /></div>
        <div><label className={labelCls}>Last period date</label><input className={inputCls} type="date" value={lastPeriod} onChange={e => setLastPeriod(e.target.value)} /></div>
        <div><label className={labelCls}>Period length (days)</label><input className={inputCls} type="number" value={periodLen} onChange={e => setPeriodLen(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setCycle('28'); setPeriodLen('5'); }}>28-day cycle</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setCycle('28'); setLastPeriod('2026-02-01'); }}>Feb 1 start</button>
      </div>
    </CalculatorShell>
  );
}

export function PregnancyDueDateCalculator() {
  const [lmp, setLmp] = useState('2026-01-01');
  const [cycleLen, setCycleLen] = useState('28');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    if (!lmp) { setResult(''); return; }
    const date = new Date(lmp);
    if (isNaN(date.getTime())) { setResult('Invalid date.'); return; }
    const cl = parseFloat(cycleLen) || 28;
    const adjustment = cl - 28;
    const due = new Date(date);
    due.setDate(date.getDate() + 280 + adjustment);
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const today = new Date();
    const diff = due.getTime() - today.getTime();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const trimester = daysLeft > 180 ? 'First' : daysLeft > 90 ? 'Second' : 'Third';
    setResult(`Estimated due date: ${fmt(due)}\nDays remaining: ${daysLeft} days\nCurrent trimester: ${trimester}\nWeeks pregnant: ${Math.round((280 - daysLeft) / 7)} weeks`);
  }, [lmp, cycleLen]);
  return (
    <CalculatorShell title="Pregnancy Due Date" accent="fuchsia" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>First day of LMP</label><input className={inputCls} type="date" value={lmp} onChange={e => setLmp(e.target.value)} /></div>
        <div><label className={labelCls}>Cycle length (optional)</label><input className={inputCls} type="number" value={cycleLen} onChange={e => setCycleLen(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

export function ProteinCalculator() {
  const [weight, setWeight] = useState('80');
  const [goal, setGoal] = useState('general');
  const [activity, setActivity] = useState('moderate');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    if (!w) { setResult(''); return; }
    const factors: Record<string, Record<string, number>> = { general: { sedentary: 0.8, moderate: 1.2, active: 1.6 }, muscle: { sedentary: 1.2, moderate: 1.6, active: 2.2 }, weightLoss: { sedentary: 1.2, moderate: 1.6, active: 2.0 } };
    const factor = (factors[goal]?.[activity] || 1.2);
    const proteinG = Math.round(w * factor);
    const perMeal = Math.round(proteinG / 3);
    setResult(`Daily protein: ${proteinG}g\nPer meal (3 meals): ${perMeal}g\nRange: ${Math.round(w * (factor - 0.3))}g - ${Math.round(w * (factor + 0.3))}g`);
  }, [weight, goal, activity]);
  return (
    <CalculatorShell title="Protein Calculator" accent="blue" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Goal</label><select className={inputCls} value={goal} onChange={e => setGoal(e.target.value)}><option value="general">General health</option><option value="muscle">Muscle gain</option><option value="weightLoss">Weight loss</option></select></div>
        <div><label className={labelCls}>Activity</label><select className={inputCls} value={activity} onChange={e => setActivity(e.target.value)}><option value="sedentary">Sedentary</option><option value="moderate">Moderate</option><option value="active">Very active</option></select></div>
      </div>
    </CalculatorShell>
  );
}

export function RunningPaceCalculator() {
  const [distance, setDistance] = useState('5');
  const [unit, setUnit] = useState<'km'|'mi'>('km');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('25');
  const [seconds, setSeconds] = useState('0');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const d = parseFloat(distance) || 0;
    const h = parseFloat(hours) || 0;
    const m = parseFloat(minutes) || 0;
    const s = parseFloat(seconds) || 0;
    if (!d) { setResult(''); return; }
    const totalMin = h * 60 + m + s / 60;
    const paceMin = totalMin / d;
    const paceMinInt = Math.floor(paceMin);
    const paceSec = Math.round((paceMin - paceMinInt) * 60);
    const speed = d / (totalMin / 60);
    const unitLabel = unit === 'km' ? 'km' : 'mi';
    setResult(`Pace: ${paceMinInt}:${paceSec.toString().padStart(2, '0')} /${unitLabel}\nSpeed: ${speed.toFixed(2)} ${unitLabel}/h\nTime: ${h}h ${m}m ${s}s`);
  }, [distance, unit, hours, minutes, seconds]);
  return (
    <CalculatorShell title="Running Pace Calculator" accent="orange" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Distance</label><input className={inputCls} type="number" value={distance} onChange={e => setDistance(e.target.value)} /></div>
        <div><label className={labelCls}>Unit</label><select className={inputCls} value={unit} onChange={e => setUnit(e.target.value as 'km'|'mi')}><option value="km">km</option><option value="mi">mi</option></select></div>
        <div><label className={labelCls}>Hours</label><input className={inputCls} type="number" value={hours} onChange={e => setHours(e.target.value)} /></div>
        <div><label className={labelCls}>Minutes</label><input className={inputCls} type="number" value={minutes} onChange={e => setMinutes(e.target.value)} /></div>
        <div><label className={labelCls}>Seconds</label><input className={inputCls} type="number" value={seconds} onChange={e => setSeconds(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setDistance('5'); setMinutes('25'); setHours('0'); }}>5K (25 min)</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setDistance('10'); setMinutes('50'); setHours('0'); }}>10K (50 min)</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setDistance('42.2'); setMinutes('0'); setHours('3.5'); }}>Marathon (3:30)</button>
      </div>
    </CalculatorShell>
  );
}

export function SleepCalculator() {
  const [wakeTime, setWakeTime] = useState('06:30');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    if (!wakeTime) { setResult(''); return; }
    const [h, m] = wakeTime.split(':').map(Number);
    const wakeMin = h * 60 + m;
    const cycles = [5, 4.5, 4, 3.5, 3, 2.5, 2].map(c => {
      const sleepMin = c * 90;
      let bedMin = wakeMin - sleepMin - 15;
      if (bedMin < 0) bedMin += 1440;
      const bedH = Math.floor(bedMin / 60) % 24;
      const bedM = Math.round(bedMin % 60);
      return { cycles: c, time: `${bedH.toString().padStart(2, '0')}:${bedM.toString().padStart(2, '0')}` };
    });
    setResult(cycles.map(c => `${c.cycles} cycles (${c.cycles * 1.5}h): ${c.time}`).join('\n'));
  }, [wakeTime]);
  return (
    <CalculatorShell title="Sleep Calculator" accent="purple" result={result} onCalculate={calc}>
      <div className="max-w-sm">
        <div><label className={labelCls}>Wake time</label><input className={inputCls} type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

export function StepsToCaloriesCalculator() {
  const [steps, setSteps] = useState('10000');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const s = parseFloat(steps) || 0;
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    if (!s || !w || !h) { setResult(''); return; }
    const strideLen = h * 0.415;
    const distKm = s * strideLen / 100000;
    const calories = Math.round(distKm * w * 1.036);
    const distMiles = distKm * 0.621371;
    setResult(`Distance: ${distKm.toFixed(2)} km (${distMiles.toFixed(2)} mi)\nCalories burned: ${calories} kcal\nStride length: ${strideLen.toFixed(1)} cm`);
  }, [steps, weight, height]);
  return (
    <CalculatorShell title="Steps to Calories" accent="green" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Steps</label><input className={inputCls} type="number" value={steps} onChange={e => setSteps(e.target.value)} /></div>
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Height (cm)</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setSteps('10000'); setWeight('70'); setHeight('170'); }}>10K steps</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setSteps('5000'); }}>5K steps</button>
      </div>
    </CalculatorShell>
  );
}

export function WaterIntakeCalculator() {
  const [weight, setWeight] = useState('70');
  const [activity, setActivity] = useState('30');
  const [climate, setClimate] = useState('moderate');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const act = parseFloat(activity) || 0;
    if (!w) { setResult(''); return; }
    let baseMl = w * 35;
    const actMl = Math.round(act * 12);
    const climateFactor = climate === 'hot' ? 1.3 : climate === 'cold' ? 0.9 : 1;
    const total = Math.round((baseMl + actMl) * climateFactor);
    setResult(`Base: ${Math.round(baseMl)} mL\nActivity: +${actMl} mL\nClimate factor: ${climateFactor}x\nTotal: ${total} mL (${(total / 1000).toFixed(1)} L)\nCups (8oz): ${Math.round(total / 240)}`);
  }, [weight, activity, climate]);
  return (
    <CalculatorShell title="Water Intake Calculator" accent="sky" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Exercise (min/day)</label><input className={inputCls} type="number" value={activity} onChange={e => setActivity(e.target.value)} /></div>
        <div><label className={labelCls}>Climate</label><select className={inputCls} value={climate} onChange={e => setClimate(e.target.value)}><option value="moderate">Moderate</option><option value="hot">Hot / humid</option><option value="cold">Cold</option></select></div>
      </div>
    </CalculatorShell>
  );
}


export function SimpleInterestCalculator() {
  const [principal, setPrincipal] = useState('10000');
  const [rate, setRate] = useState('5');
  const [time, setTime] = useState('3');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const p = parseFloat(principal) || 0;
    const r = parseFloat(rate) || 0;
    const t = parseFloat(time) || 0;
    if (!p || !r || !t) { setResult(''); return; }
    const interest = p * (r / 100) * t;
    const total = p + interest;
    setResult(`Simple Interest: $${interest.toFixed(2)}\nTotal amount: $${total.toFixed(2)}\nAnnual interest: $${(p * r / 100).toFixed(2)}`);
  }, [principal, rate, time]);
  return (
    <CalculatorShell title="Simple Interest Calculator" accent="indigo" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Principal ($)</label><input className={inputCls} type="number" value={principal} onChange={e => setPrincipal(e.target.value)} /></div>
        <div><label className={labelCls}>Rate (%)</label><input className={inputCls} type="number" value={rate} onChange={e => setRate(e.target.value)} /></div>
        <div><label className={labelCls}>Time (years)</label><input className={inputCls} type="number" value={time} onChange={e => setTime(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

export function SavingsCalculator() {
  const [initial, setInitial] = useState('10000');
  const [monthly, setMonthly] = useState('500');
  const [rate, setRate] = useState('5');
  const [years, setYears] = useState('10');
  const [compoundsPerYear, setCompoundsPerYear] = useState('12');
  const [result, setResult] = useState('');
  const [schedule, setSchedule] = useState<Array<{year: number; balance: number; contributions: number; interest: number}>>([]);
  const calc = useCallback(() => {
    const p = parseFloat(initial) || 0;
    const m = parseFloat(monthly) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const y = parseFloat(years) || 0;
    const n = parseFloat(compoundsPerYear) || 12;
    if (!r && !y) { setResult(''); return; }
    const periodicRate = r / n;
    const totalPeriods = y * n;
    const future = p * Math.pow(1 + periodicRate, totalPeriods) + m * (Math.pow(1 + periodicRate, totalPeriods) - 1) / periodicRate;
    const totalContributions = p + m * y * 12;
    const totalInterest = future - totalContributions;
    const sched: Array<{year: number; balance: number; contributions: number; interest: number}> = [];
    for (let yr = 1; yr <= y; yr++) {
      const per = yr * n;
      const bal = p * Math.pow(1 + periodicRate, per) + m * (Math.pow(1 + periodicRate, per) - 1) / periodicRate;
      const contribs = p + m * yr * 12;
      sched.push({ year: yr, balance: Math.round(bal * 100) / 100, contributions: Math.round(contribs * 100) / 100, interest: Math.round((bal - contribs) * 100) / 100 });
    }
    setSchedule(sched);
    setResult(`Future value: $${future.toFixed(2)}\nTotal contributions: $${totalContributions.toFixed(2)}\nTotal interest: $${totalInterest.toFixed(2)}`);
  }, [initial, monthly, rate, years, compoundsPerYear]);
  return (
    <CalculatorShell title="Savings Calculator" accent="emerald" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Initial deposit ($)</label><input className={inputCls} type="number" value={initial} onChange={e => setInitial(e.target.value)} /></div>
        <div><label className={labelCls}>Monthly contribution ($)</label><input className={inputCls} type="number" value={monthly} onChange={e => setMonthly(e.target.value)} /></div>
        <div><label className={labelCls}>Annual rate (%)</label><input className={inputCls} type="number" value={rate} onChange={e => setRate(e.target.value)} /></div>
        <div><label className={labelCls}>Time (years)</label><input className={inputCls} type="number" value={years} onChange={e => setYears(e.target.value)} /></div>
        <div><label className={labelCls}>Compounds / year</label><select className={inputCls} value={compoundsPerYear} onChange={e => setCompoundsPerYear(e.target.value)}><option value="1">Annual</option><option value="2">Semi-annual</option><option value="4">Quarterly</option><option value="12">Monthly</option><option value="365">Daily</option></select></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setInitial('10000'); setMonthly('500'); setRate('7'); setYears('20'); }}>20yr retirement</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setInitial('0'); setMonthly('1000'); setRate('8'); setYears('30'); }}>30yr max</button>
      </div>
      {schedule.length > 0 && (
        <div className="bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] overflow-hidden max-h-48 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[var(--bg-overlay)]"><tr className="text-[var(--text-tertiary)]"><th className="text-left px-3 py-2">Year</th><th className="text-right px-3 py-2">Balance</th><th className="text-right px-3 py-2">Contributions</th><th className="text-right px-3 py-2">Interest</th></tr></thead>
            <tbody>{schedule.map(r => <tr key={r.year} className="border-b border-[var(--border-subtle)]"><td className="px-3 py-1.5 text-[var(--text-primary)]">{r.year}</td><td className="px-3 py-1.5 text-right text-emerald-400">${r.balance.toLocaleString()}</td><td className="px-3 py-1.5 text-right text-[var(--text-secondary)]">${r.contributions.toLocaleString()}</td><td className="px-3 py-1.5 text-right text-amber-400">${r.interest.toLocaleString()}</td></tr>)}</tbody>
          </table>
        </div>
      )}
    </CalculatorShell>
  );
}

export function SeatLicenseCalculator() {
  const [users, setUsers] = useState('50');
  const [pricePerUser, setPricePerUser] = useState('15');
  const [billingCycle, setBillingCycle] = useState<'monthly'|'annual'>('monthly');
  const [annualDiscount, setAnnualDiscount] = useState('15');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const u = parseFloat(users) || 0;
    const p = parseFloat(pricePerUser) || 0;
    const disc = parseFloat(annualDiscount) || 0;
    if (!u || !p) { setResult(''); return; }
    const monthlyTotal = u * p;
    const annualTotal = billingCycle === 'annual' ? monthlyTotal * 12 * (1 - disc / 100) : monthlyTotal * 12;
    const perUserAnnual = billingCycle === 'annual' ? p * 12 * (1 - disc / 100) : p * 12;
    setResult(`Monthly: $${monthlyTotal.toFixed(2)} ($${p.toFixed(2)}/user)\nAnnual: $${annualTotal.toFixed(2)} ($${perUserAnnual.toFixed(2)}/user/yr)\nSavings vs monthly: $${(monthlyTotal * 12 - annualTotal).toFixed(2)}`);
  }, [users, pricePerUser, billingCycle, annualDiscount]);
  return (
    <CalculatorShell title="Seat License Calculator" accent="violet" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Number of users</label><input className={inputCls} type="number" value={users} onChange={e => setUsers(e.target.value)} /></div>
        <div><label className={labelCls}>Price / user / month ($)</label><input className={inputCls} type="number" value={pricePerUser} onChange={e => setPricePerUser(e.target.value)} /></div>
        <div><label className={labelCls}>Billing cycle</label><select className={inputCls} value={billingCycle} onChange={e => setBillingCycle(e.target.value as 'monthly'|'annual')}><option value="monthly">Monthly</option><option value="annual">Annual</option></select></div>
        <div><label className={labelCls}>Annual discount (%)</label><input className={inputCls} type="number" value={annualDiscount} onChange={e => setAnnualDiscount(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setUsers('10'); setPricePerUser('10'); }}>Small team (10)</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setUsers('100'); setPricePerUser('25'); }}>Enterprise (100)</button>
      </div>
    </CalculatorShell>
  );
}

export function SemverCalculator() {
  const [v1, setV1] = useState('1.2.3');
  const [v2, setV2] = useState('1.5.0');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const parse = (v: string): number[] => v.replace(/^v/, '').split('.').map(Number);
    const a = parse(v1);
    const b = parse(v2);
    if (a.some(isNaN) || b.some(isNaN) || a.length !== 3 || b.length !== 3) { setResult('Invalid semver format. Use major.minor.patch'); return; }
    const semverCompare = (x: number[], y: number[]): number => {
      for (let i = 0; i < 3; i++) { if (x[i] !== y[i]) return x[i] > y[i] ? 1 : -1; }
      return 0;
    };
    const cmp = semverCompare(a, b);
    const diff = cmp === 0 ? 'Equal' : cmp > 0 ? `${v1} > ${v2}` : `${v1} < ${v2}`;
    const bumpMajor = `${a[0] + 1}.0.0`;
    const bumpMinor = `${a[0]}.${a[1] + 1}.0`;
    const bumpPatch = `${a[0]}.${a[1]}.${a[2] + 1}`;
    setResult(`Comparison: ${diff}\n${v1} -> major: ${bumpMajor}\n${v1} -> minor: ${bumpMinor}\n${v1} -> patch: ${bumpPatch}`);
  }, [v1, v2]);
  return (
    <CalculatorShell title="Semver Calculator" accent="sky" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Version 1</label><input className={inputCls} value={v1} onChange={e => setV1(e.target.value)} placeholder="1.0.0" /></div>
        <div><label className={labelCls}>Version 2</label><input className={inputCls} value={v2} onChange={e => setV2(e.target.value)} placeholder="2.0.0" /></div>
      </div>
    </CalculatorShell>
  );
}

export function StandardDeviationCalculator() {
  const [numbers, setNumbers] = useState('10, 12, 23, 23, 16, 23, 21, 16');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const nums = numbers.split(/[,\s]+/).filter(Boolean).map(Number);
    if (nums.length < 2 || nums.some(isNaN)) { setResult('Enter at least 2 numbers.'); return; }
    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    const sqDiffs = nums.map(n => Math.pow(n - mean, 2));
    const variance = sqDiffs.reduce((a, b) => a + b, 0) / nums.length;
    const sampleVariance = sqDiffs.reduce((a, b) => a + b, 0) / (nums.length - 1);
    const stdDev = Math.sqrt(variance);
    const sampleStdDev = Math.sqrt(sampleVariance);
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const median = nums.sort((a, b) => a - b)[Math.floor(nums.length / 2)];
    setResult(`Count: ${nums.length}\nMean: ${mean.toFixed(4)}\nMedian: ${median}\nRange: ${min} - ${max}\nPopulation Std Dev: ${stdDev.toFixed(4)}\nSample Std Dev: ${sampleStdDev.toFixed(4)}\nVariance: ${variance.toFixed(4)}`);
  }, [numbers]);
  return (
    <CalculatorShell title="Standard Deviation Calculator" accent="blue" result={result} onCalculate={calc}>
      <div className="max-w-xl">
        <div><label className={labelCls}>Numbers (comma separated)</label><textarea className={`${inputCls} min-h-[80px] resize-none`} value={numbers} onChange={e => setNumbers(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => setNumbers('10, 12, 23, 23, 16, 23, 21, 16')}>Reset example</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => setNumbers('1, 2, 3, 4, 5, 6, 7, 8, 9, 10')}>1-10</button>
      </div>
    </CalculatorShell>
  );
}

export function TaxCalculator() {
  const [income, setIncome] = useState('80000');
  const [filingStatus, setFilingStatus] = useState<'single'|'married'|'head'>('single');
  const [stateTax, setStateTax] = useState('5');
  const [deductions, setDeductions] = useState('14600');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const inc = parseFloat(income) || 0;
    const ded = parseFloat(deductions) || 14600;
    const st = parseFloat(stateTax) || 0;
    const taxable = Math.max(0, inc - ded);
    const brackets: Record<string, Array<{min: number; max: number; rate: number}>> = { single: [{min:0,max:11600,rate:0.1},{min:11600,max:47150,rate:0.12},{min:47150,max:100525,rate:0.22},{min:100525,max:191950,rate:0.24},{min:191950,max:243725,rate:0.32},{min:243725,max:609350,rate:0.35},{min:609350,max:Infinity,rate:0.37}], married: [{min:0,max:23200,rate:0.1},{min:23200,max:94300,rate:0.12},{min:94300,max:201050,rate:0.22},{min:201050,max:383900,rate:0.24},{min:383900,max:487450,rate:0.32},{min:487450,max:731200,rate:0.35},{min:731200,max:Infinity,rate:0.37}], head: [{min:0,max:16550,rate:0.1},{min:16550,max:63100,rate:0.12},{min:63100,max:100500,rate:0.22},{min:100500,max:191950,rate:0.24},{min:191950,max:243700,rate:0.32},{min:243700,max:609350,rate:0.35},{min:609350,max:Infinity,rate:0.37}] };
    let federalTax = 0;
    let remaining = taxable;
    for (const b of brackets[filingStatus]) {
      if (remaining <= 0) break;
      const taxableInBracket = Math.min(remaining, b.max - b.min);
      federalTax += taxableInBracket * b.rate;
      remaining -= taxableInBracket;
    }
    const stateTaxAmount = taxable * (st / 100);
    const fica = inc * 0.0765;
    const totalTax = federalTax + stateTaxAmount + fica;
    const effectiveRate = (totalTax / inc) * 100;
    const takeHome = inc - totalTax;
    setResult(`Gross income: $${inc.toLocaleString()}\nTaxable income: $${taxable.toLocaleString()}\nFederal: $${Math.round(federalTax).toLocaleString()}\nFICA: $${Math.round(fica).toLocaleString()}\nState: $${Math.round(stateTaxAmount).toLocaleString()}\nTotal tax: $${Math.round(totalTax).toLocaleString()}\nEffective rate: ${effectiveRate.toFixed(1)}%\nTake-home: $${Math.round(takeHome).toLocaleString()} (${(takeHome / inc * 100).toFixed(0)}%)`);
  }, [income, filingStatus, stateTax, deductions]);
  return (
    <CalculatorShell title="Tax Calculator (US 2025)" accent="indigo" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Annual income ($)</label><input className={inputCls} type="number" value={income} onChange={e => setIncome(e.target.value)} /></div>
        <div><label className={labelCls}>Filing status</label><select className={inputCls} value={filingStatus} onChange={e => setFilingStatus(e.target.value as 'single'|'married'|'head')}><option value="single">Single</option><option value="married">Married filing jointly</option><option value="head">Head of household</option></select></div>
        <div><label className={labelCls}>State tax rate (%)</label><input className={inputCls} type="number" value={stateTax} onChange={e => setStateTax(e.target.value)} /></div>
        <div><label className={labelCls}>Standard deduction ($)</label><input className={inputCls} type="number" value={deductions} onChange={e => setDeductions(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setIncome('60000'); setFilingStatus('single'); }}>60k Single</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setIncome('150000'); setFilingStatus('married'); }}>150k Married</button>
      </div>
    </CalculatorShell>
  );
}


export function TdsCalculatorIndia() {
  const [income, setIncome] = useState('1200000');
  const [age, setAge] = useState('35');
  const [regime, setRegime] = useState<'old'|'new'>('new');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const inc = parseFloat(income) || 0;
    const a = parseFloat(age) || 35;
    if (!inc) { setResult(''); return; }
    let taxable = inc;
    let tax = 0;
    if (regime === 'new') {
      const slabs = [{min:0,max:300000,rate:0},{min:300000,max:600000,rate:0.05},{min:600000,max:900000,rate:0.1},{min:900000,max:1200000,rate:0.15},{min:1200000,max:1500000,rate:0.2},{min:1500000,max:Infinity,rate:0.3}];
      let remaining = Math.max(0, taxable - 50000);
      for (const s of slabs) {
        if (remaining <= 0) break;
        const taxableInSlab = Math.min(remaining, s.max - s.min);
        tax += taxableInSlab * s.rate;
        remaining -= taxableInSlab;
      }
      const rebate = inc <= 700000 ? Math.min(tax, 25000) : 0;
      tax -= rebate;
    } else {
      const deduction80c = 150000;
      const standardDeduction = a < 60 ? 50000 : a < 80 ? 50000 : 50000;
      taxable = Math.max(0, inc - standardDeduction - deduction80c);
      const slabs = [{min:0,max:250000,rate:0},{min:250000,max:500000,rate:0.05},{min:500000,max:1000000,rate:0.2},{min:1000000,max:Infinity,rate:0.3}];
      let remaining = taxable;
      for (const s of slabs) {
        if (remaining <= 0) break;
        const taxableInSlab = Math.min(remaining, s.max - s.min);
        tax += taxableInSlab * s.rate;
        remaining -= taxableInSlab;
      }
    }
    const cess = tax * 0.04;
    const totalTax = tax + cess;
    setResult(`Gross income: \u20b9${inc.toLocaleString('en-IN')}\nTaxable: \u20b9${taxable.toLocaleString('en-IN')}\nTax: \u20b9${Math.round(tax).toLocaleString('en-IN')}\nHealth & edu cess (4%): \u20b9${Math.round(cess).toLocaleString('en-IN')}\nTotal tax: \u20b9${Math.round(totalTax).toLocaleString('en-IN')}\nEffective rate: ${(totalTax / inc * 100).toFixed(1)}%`);
  }, [income, age, regime]);
  return (
    <CalculatorShell title="TDS Calculator (India)" accent="orange" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Annual income (\u20b9)</label><input className={inputCls} type="number" value={income} onChange={e => setIncome(e.target.value)} /></div>
        <div><label className={labelCls}>Age</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className={labelCls}>Regime</label><select className={inputCls} value={regime} onChange={e => setRegime(e.target.value as 'old'|'new')}><option value="new">New (default)</option><option value="old">Old</option></select></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setIncome('500000'); setRegime('new'); }}>5L New</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setIncome('1500000'); setRegime('old'); }}>15L Old</button>
      </div>
    </CalculatorShell>
  );
}

export function TrialConversionCalculator() {
  const [visitors, setVisitors] = useState('1000');
  const [signups, setSignups] = useState('100');
  const [paid, setPaid] = useState('20');
  const [trialLength, setTrialLength] = useState('14');
  const [price, setPrice] = useState('29');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const v = parseFloat(visitors) || 0;
    const s = parseFloat(signups) || 0;
    const p = parseFloat(paid) || 0;
    const tl = parseFloat(trialLength) || 14;
    const pr = parseFloat(price) || 0;
    if (!v || !s || !p) { setResult(''); return; }
    const signupRate = (s / v) * 100;
    const conversionRate = (p / s) * 100;
    const overallRate = (p / v) * 100;
    const revenue = p * pr;
    const monthlyRev = revenue * (30 / tl);
    setResult(`Signup rate: ${signupRate.toFixed(1)}%\nTrial-to-paid: ${conversionRate.toFixed(1)}%\nOverall conversion: ${overallRate.toFixed(2)}%\nRevenue: $${Math.round(revenue)}\nEst. monthly revenue: $${Math.round(monthlyRev)}`);
  }, [visitors, signups, paid, trialLength, price]);
  return (
    <CalculatorShell title="Trial Conversion Calculator" accent="violet" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Visitors / mo</label><input className={inputCls} type="number" value={visitors} onChange={e => setVisitors(e.target.value)} /></div>
        <div><label className={labelCls}>Trial signups</label><input className={inputCls} type="number" value={signups} onChange={e => setSignups(e.target.value)} /></div>
        <div><label className={labelCls}>Paid conversions</label><input className={inputCls} type="number" value={paid} onChange={e => setPaid(e.target.value)} /></div>
        <div><label className={labelCls}>Trial length (days)</label><input className={inputCls} type="number" value={trialLength} onChange={e => setTrialLength(e.target.value)} /></div>
        <div><label className={labelCls}>Price ($/mo)</label><input className={inputCls} type="number" value={price} onChange={e => setPrice(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setVisitors('10000'); setSignups('500'); setPaid('75'); }}>Typical SaaS</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setVisitors('5000'); setSignups('250'); setPaid('50'); setTrialLength('7'); }}>High conversion</button>
      </div>
    </CalculatorShell>
  );
}

export function TriangleAreaCalculator() {
  const [method, setMethod] = useState<'baseheight'|'sides'|'sas'>('baseheight');
  const [base, setBase] = useState('10');
  const [height, setHeight] = useState('8');
  const [sideA, setSideA] = useState('5');
  const [sideB, setSideB] = useState('6');
  const [sideC, setSideC] = useState('7');
  const [angle, setAngle] = useState('60');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    if (method === 'baseheight') {
      const b = parseFloat(base) || 0;
      const h = parseFloat(height) || 0;
      if (!b || !h) { setResult(''); return; }
      const area = 0.5 * b * h;
      setResult(`Area = \u00bd \u00d7 ${b} \u00d7 ${h} = ${area.toFixed(2)} sq units\n\nFormula: A = \u00bdbh`);
    } else if (method === 'sides') {
      const a = parseFloat(sideA) || 0;
      const b = parseFloat(sideB) || 0;
      const c = parseFloat(sideC) || 0;
      if (!a || !b || !c) { setResult(''); return; }
      const s = (a + b + c) / 2;
      const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
      if (isNaN(area)) { setResult('These side lengths do not form a valid triangle.'); return; }
      setResult(`Area (Heron's formula) = ${area.toFixed(2)} sq units\nSemi-perimeter = ${s.toFixed(2)}\n\nFormula: A = \u221a(s(s-a)(s-b)(s-c))`);
    } else {
      const a = parseFloat(sideA) || 0;
      const b = parseFloat(sideB) || 0;
      const ang = parseFloat(angle) || 0;
      if (!a || !b || !ang) { setResult(''); return; }
      const rad = ang * Math.PI / 180;
      const area = 0.5 * a * b * Math.sin(rad);
      setResult(`Area = \u00bd \u00d7 ${a} \u00d7 ${b} \u00d7 sin(${ang}\u00b0) = ${area.toFixed(2)} sq units`);
    }
  }, [method, base, height, sideA, sideB, sideC, angle]);
  return (
    <CalculatorShell title="Triangle Area Calculator" accent="emerald" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Method</label><select className={inputCls} value={method} onChange={e => setMethod(e.target.value as 'baseheight'|'sides'|'sas')}><option value="baseheight">Base & Height</option><option value="sides">Three sides (SSS)</option><option value="sas">Two sides & angle (SAS)</option></select></div>
        <div className="opacity-0 pointer-events-none"><label className={labelCls}>_</label><input className={inputCls} /></div>
        {method === 'baseheight' && (<><div><label className={labelCls}>Base</label><input className={inputCls} type="number" value={base} onChange={e => setBase(e.target.value)} /></div><div><label className={labelCls}>Height</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div></>)}
        {method === 'sides' && (<><div><label className={labelCls}>Side A</label><input className={inputCls} type="number" value={sideA} onChange={e => setSideA(e.target.value)} /></div><div><label className={labelCls}>Side B</label><input className={inputCls} type="number" value={sideB} onChange={e => setSideB(e.target.value)} /></div><div><label className={labelCls}>Side C</label><input className={inputCls} type="number" value={sideC} onChange={e => setSideC(e.target.value)} /></div></>)}
        {method === 'sas' && (<><div><label className={labelCls}>Side A</label><input className={inputCls} type="number" value={sideA} onChange={e => setSideA(e.target.value)} /></div><div><label className={labelCls}>Side B</label><input className={inputCls} type="number" value={sideB} onChange={e => setSideB(e.target.value)} /></div><div><label className={labelCls}>Angle (\u00b0)</label><input className={inputCls} type="number" value={angle} onChange={e => setAngle(e.target.value)} /></div></>)}
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setBase('10'); setHeight('8'); setMethod('baseheight'); }}>Base/Height</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setSideA('5'); setSideB('6'); setSideC('7'); setMethod('sides'); }}>3-4-5</button>
      </div>
    </CalculatorShell>
  );
}

export function GasMileageCalculator() {
  const [distance, setDistance] = useState('300');
  const [gallons, setGallons] = useState('10');
  const [pricePerGallon, setPricePerGallon] = useState('3.50');
  const [unit, setUnit] = useState<'us'|'metric'>('us');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const d = parseFloat(distance) || 0;
    const g = parseFloat(gallons) || 0;
    const p = parseFloat(pricePerGallon) || 0;
    if (!d || !g) { setResult(''); return; }
    if (unit === 'us') {
      const mpg = d / g;
      const cost = g * p;
      const perMile = cost / d;
      setResult(`Fuel economy: ${mpg.toFixed(1)} mpg\nFuel used: ${g.toFixed(1)} gal\nFuel cost: $${cost.toFixed(2)}\nCost per mile: $${perMile.toFixed(3)}`);
    } else {
      const liters = g * 3.78541;
      const km = d * 1.60934;
      const lPer100km = (liters / km) * 100;
      const cost = g * p;
      setResult(`Fuel economy: ${lPer100km.toFixed(1)} L/100km\nFuel used: ${liters.toFixed(1)} L\nFuel cost: $${cost.toFixed(2)}\nCost per km: $${(cost / km).toFixed(3)}`);
    }
  }, [distance, gallons, pricePerGallon, unit]);
  return (
    <CalculatorShell title="Gas Mileage Calculator" accent="amber" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Unit</label><select className={inputCls} value={unit} onChange={e => setUnit(e.target.value as 'us'|'metric')}><option value="us">US (mi, gal)</option><option value="metric">Metric (km, L)</option></select></div>
        <div className="opacity-0 pointer-events-none"><label className={labelCls}>_</label><input className={inputCls} /></div>
        <div><label className={labelCls}>{unit === 'us' ? 'Distance (miles)' : 'Distance (km)'}</label><input className={inputCls} type="number" value={distance} onChange={e => setDistance(e.target.value)} /></div>
        <div><label className={labelCls}>{unit === 'us' ? 'Gallons used' : 'Gallons used'}</label><input className={inputCls} type="number" value={gallons} onChange={e => setGallons(e.target.value)} /></div>
        <div><label className={labelCls}>Price per gallon ($)</label><input className={inputCls} type="number" value={pricePerGallon} onChange={e => setPricePerGallon(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setDistance('300'); setGallons('10'); setUnit('us'); }}>Avg SUV</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setDistance('400'); setGallons('8'); setUnit('us'); }}>Efficient sedan</button>
      </div>
    </CalculatorShell>
  );
}
