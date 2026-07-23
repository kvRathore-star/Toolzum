"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Copy, Delete } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CalculatorShell } from './shared/CalculatorShell';

const inputClass = "w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] focus:border-indigo-500 rounded-xl px-4 py-3 text-[var(--text-primary)] outline-none";
const labelClass = "block text-sm font-bold text-[var(--text-primary)] mb-1.5";
const btnClass = "w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-lg";
const cardClass = "max-w-2xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl animate-in fade-in duration-500";
const headingClass = "text-2xl font-bold text-[var(--text-primary)] mb-6";
const resultClass = "p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-sm font-mono whitespace-pre text-[var(--accent)] dark:text-[var(--accent)]";

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
    <CalculatorShell title="Mortgage Calculator" result={result} onCalculate={calc} presets={presets} downloadData={downloadData} downloadFilename="mortgage.csv">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className={labelClass}>Loan Amount ($)</label><input type="number" value={loan} onChange={e => setLoan(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputClass} /></div>
        <div><label className={labelClass}>Loan Term (years)</label><input type="number" value={years} onChange={e => setYears(e.target.value)} className={inputClass} /></div>
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
    <CalculatorShell title="ARR Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className={labelClass}>Subscription Revenue ($)</label><input type="number" value={subRev} onChange={e => setSubRev(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Expansion Revenue ($)</label><input type="number" value={expRev} onChange={e => setExpRev(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Churn Revenue ($)</label><input type="number" value={churnRev} onChange={e => setChurnRev(e.target.value)} className={inputClass} /></div>
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
    <CalculatorShell title="Compound Interest Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><label className={labelClass}>Principal ($)</label><input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Annual Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputClass} /></div>
        <div><label className={labelClass}>Compounds/Yr</label><input type="number" value={n} onChange={e => setN(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Years</label><input type="number" value={t} onChange={e => setT(e.target.value)} className={inputClass} /></div>
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
    <CalculatorShell title="Car Loan Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className={labelClass}>Loan Amount ($)</label><input type="number" value={loan} onChange={e => setLoan(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputClass} /></div>
        <div><label className={labelClass}>Loan Term (years)</label><input type="number" value={years} onChange={e => setYears(e.target.value)} className={inputClass} /></div>
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
    <CalculatorShell title="Car Lease Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-2 gap-4">
        <div className="md:col-span-2"><label className={labelClass}>Capitalized Cost ($)</label><input type="number" value={capCost} onChange={e => setCapCost(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Residual Value ($)</label><input type="number" value={residual} onChange={e => setResidual(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Lease Term (months)</label><input type="number" value={term} onChange={e => setTerm(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Money Factor</label><input type="number" value={mf} onChange={e => setMf(e.target.value)} step="0.00001" className={inputClass} /></div>
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
    <CalculatorShell title="Churn Rate Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Customers Lost</label><input type="number" value={lost} onChange={e => setLost(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Total Customers</label><input type="number" value={total} onChange={e => setTotal(e.target.value)} className={inputClass} /></div>
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
    <CalculatorShell title="Conversion Rate Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Conversions</label><input type="number" value={conversions} onChange={e => setConversions(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Total Visitors</label><input type="number" value={visitors} onChange={e => setVisitors(e.target.value)} className={inputClass} /></div>
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
    if (p <= b * r) { setResult('Payment too low — not covering monthly interest. Increase payment.'); return; }
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
    <CalculatorShell title="Debt Payoff Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className={labelClass}>Current Balance ($)</label><input type="number" value={balance} onChange={e => setBalance(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Annual Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputClass} /></div>
        <div><label className={labelClass}>Monthly Payment ($)</label><input type="number" value={payment} onChange={e => setPayment(e.target.value)} className={inputClass} /></div>
      </div>
      {result && payoffMonths > 0 && (
        <div className="bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-tertiary)]">Payoff Timeline</span>
              <span className="text-xs font-bold text-[var(--text-primary)]">{payoffMonths} months ({Math.floor(payoffMonths / 12)} yr {payoffMonths % 12} mo)</span>
            </div>
            <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
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
    <CalculatorShell title="Discount Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Original Price ($)</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Discount (%)</label><input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
          <div className="flex justify-between items-end mb-3">
            <div className="text-center flex-1">
              <div className="text-lg line-through text-[var(--text-tertiary)]">$${p.toFixed(0)}</div>
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
    <CalculatorShell title="Hourly to Salary Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Hourly Rate ($)</label><input type="number" value={hourly} onChange={e => setHourly(e.target.value)} step="0.01" className={inputClass} /></div>
        <div><label className={labelClass}>Hours per Week</label><input type="number" value={hoursPerWeek} onChange={e => setHoursPerWeek(e.target.value)} className={inputClass} /></div>
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
    <CalculatorShell title="Inflation Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className={labelClass}>Present Value ($)</label><input type="number" value={present} onChange={e => setPresent(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Inflation Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputClass} /></div>
        <div><label className={labelClass}>Years</label><input type="number" value={years} onChange={e => setYears(e.target.value)} className={inputClass} /></div>
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
  }, []);
  return (
    <CalculatorShell title="LTV Calculator" result={result} onCalculate={calc}>
      <div><label className={labelClass}>ARPU ($)</label><input type="number" value={arpu} onChange={e => setArpu(e.target.value)} className={inputClass} /></div>
      <div><label className={labelClass}>Churn Rate (%)</label><input type="number" value={churn} onChange={e => setChurn(e.target.value)} step="0.1" className={inputClass} /></div>
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
    <CalculatorShell title="MRR Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Number of Customers</label><input type="number" value={customers} onChange={e => setCustomers(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Avg Revenue/Customer ($)</label><input type="number" value={avgRevenue} onChange={e => setAvgRevenue(e.target.value)} className={inputClass} /></div>
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
    <CalculatorShell title="Net Worth Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Total Assets ($)</label><input type="number" value={assets} onChange={e => setAssets(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Total Liabilities ($)</label><input type="number" value={liabilities} onChange={e => setLiabilities(e.target.value)} className={inputClass} /></div>
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
    <CalculatorShell title="Net Promoter Score" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className={`${labelClass} text-emerald-400`}>Promoters (9-10)</label><input type="number" value={promoters} onChange={e => setPromoters(e.target.value)} className={inputClass} /></div>
        <div><label className={`${labelClass} text-amber-400`}>Passives (7-8)</label><input type="number" value={passives} onChange={e => setPassives(e.target.value)} className={inputClass} /></div>
        <div><label className={`${labelClass} text-red-400`}>Detractors (0-6)</label><input type="number" value={detractors} onChange={e => setDetractors(e.target.value)} className={inputClass} /></div>
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
    <CalculatorShell title="Rent vs Buy Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Home Price ($)</label><input type="number" value={homePrice} onChange={e => setHomePrice(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Down Payment ($)</label><input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Mortgage Rate (%)</label><input type="number" value={mortgageRate} onChange={e => setMortgageRate(e.target.value)} step="0.01" className={inputClass} /></div>
        <div><label className={labelClass}>Monthly Rent ($)</label><input type="number" value={rent} onChange={e => setRent(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Timeframe (years)</label><input type="number" value={years} onChange={e => setYears(e.target.value)} className={inputClass} /></div>
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
    <CalculatorShell title="Retirement Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex gap-4">
          <div className="flex-1"><label className={labelClass}>Current Age</label><input type="number" value={currentAge} onChange={e => setCurrentAge(e.target.value)} className={inputClass} /></div>
          <div className="flex-1"><label className={labelClass}>Retire Age</label><input type="number" value={retireAge} onChange={e => setRetireAge(e.target.value)} className={inputClass} /></div>
        </div>
        <div><label className={labelClass}>Current Savings ($)</label><input type="number" value={savings} onChange={e => setSavings(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Monthly Contribution ($)</label><input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Annual Return (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.1" className={inputClass} /></div>
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
    <CalculatorShell title="Revenue Growth Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Current Period ($)</label><input type="number" value={current} onChange={e => setCurrent(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Previous Period ($)</label><input type="number" value={previous} onChange={e => setPrevious(e.target.value)} className={inputClass} /></div>
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
    <CalculatorShell title="Runway Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Cash Balance ($)</label><input type="number" value={cash} onChange={e => setCash(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Monthly Burn Rate ($)</label><input type="number" value={burnRate} onChange={e => setBurnRate(e.target.value)} className={inputClass} /></div>
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
    <CalculatorShell title="A/B Test Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Control Visitors</label><input type="number" value={controlVisitors} onChange={e => setControlVisitors(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Control Conversions</label><input type="number" value={controlConversions} onChange={e => setControlConversions(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Variant Visitors</label><input type="number" value={variantVisitors} onChange={e => setVariantVisitors(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Variant Conversions</label><input type="number" value={variantConversions} onChange={e => setVariantConversions(e.target.value)} className={inputClass} /></div>
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
    <CalculatorShell title="Business Days Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>End Date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} /></div>
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
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = Math.abs(d2.getTime() - d1.getTime());
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return (
    <CalculatorShell title="Days Between Dates" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Date 1</label><input type="date" value={date1} onChange={e => setDate1(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Date 2</label><input type="date" value={date2} onChange={e => setDate2(e.target.value)} className={inputClass} /></div>
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
  const now = new Date();
  const target = new Date(targetDate);
  const diff = target.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return (
    <CalculatorShell title="Days Until Calculator" result={result} onCalculate={calc}>
      <div><label className={labelClass}>Target Date</label><input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className={inputClass} /></div>
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
  const d = new Date(date);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[d.getDay()];
  const colors: Record<string, string> = { Sunday: 'text-red-400', Monday: 'text-indigo-400', Tuesday: 'text-emerald-400', Wednesday: 'text-amber-400', Thursday: 'text-blue-400', Friday: 'text-teal-400', Saturday: 'text-purple-400' };
  return (
    <CalculatorShell title="Day of Week Calculator" result={result} onCalculate={calc}>
      <div><label className={labelClass}>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} /></div>
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
  const d = new Date(date);
  const year = d.getFullYear();
  const start = new Date(year, 0, 0);
  const day = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const totalDays = isLeap ? 366 : 365;
  const pct = (day / totalDays) * 100;
  return (
    <CalculatorShell title="Day of Year Calculator" result={result} onCalculate={calc}>
      <div><label className={labelClass}>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} /></div>
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
  const b = parseFloat(base) || 0;
  const e = parseFloat(exp) || 0;
  const val = Math.pow(b, e);
  return (
    <CalculatorShell title="Exponent Calculator" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Base</label><input type="number" value={base} onChange={e => setBase(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Exponent</label><input type="number" value={exp} onChange={e => setExp(e.target.value)} className={inputClass} /></div>
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
    <CalculatorShell title="Final Grade Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Grades (comma-separated)</label><input type="text" value={grades} onChange={e => setGrades(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Weights (comma-separated, %)</label><input type="text" value={weights} onChange={e => setWeights(e.target.value)} className={inputClass} /></div>
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

const gradePointsMap: Record<string, number> = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0 };

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
      details.push(`${g[i]} (${c[i]} cr) = ${gp.toFixed(1)} × ${c[i]}`);
    }
    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    setResult(`GPA: ${gpa.toFixed(2)}\nTotal Points: ${totalPoints.toFixed(1)}\nTotal Credits: ${totalCredits}`);
  }, [grades, credits]);
  const presets = [
    { label: 'Dean\'s List', apply: () => { setGrades('A,A-,B+'); setCredits('3,4,3'); } },
    { label: 'Average Semester', apply: () => { setGrades('B,B+,C+'); setCredits('3,3,4'); } },
  ];
  return (
    <CalculatorShell title="GPA Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Grades (e.g., A,B+,A-)</label><input type="text" value={grades} onChange={e => setGrades(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Credits (comma-separated)</label><input type="text" value={credits} onChange={e => setCredits(e.target.value)} className={inputClass} /></div>
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
  const p = parseFloat(percentage) || 0;
  const letter = getLetter(p);
  const colorMap: Record<string, string> = { 'A': 'text-emerald-400', 'A-': 'text-emerald-400', 'B+': 'text-blue-400', 'B': 'text-blue-400', 'B-': 'text-blue-400', 'C+': 'text-amber-400', 'C': 'text-amber-400', 'C-': 'text-amber-400', 'D+': 'text-orange-400', 'D': 'text-orange-400', 'F': 'text-red-400' };
  return (
    <CalculatorShell title="Grade Calculator" result={result} onCalculate={calc}>
      <div><label className={labelClass}>Percentage (%)</label><input type="number" value={percentage} onChange={e => setPercentage(e.target.value)} className={inputClass} /></div>
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
    <CalculatorShell title="College GPA Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Semester Grades (e.g., A,B+,A-)</label><input type="text" value={semGrades} onChange={e => setSemGrades(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Semester Credits</label><input type="text" value={semCredits} onChange={e => setSemCredits(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Previous GPA</label><input type="number" value={prevGpa} onChange={e => setPrevGpa(e.target.value)} step="0.01" className={inputClass} /></div>
        <div><label className={labelClass}>Previous Credits</label><input type="number" value={prevCredits} onChange={e => setPrevCredits(e.target.value)} className={inputClass} /></div>
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
  const y = parseInt(year);
  const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  return (
    <CalculatorShell title="Leap Year Calculator" result={result} onCalculate={calc}>
      <div><label className={labelClass}>Year</label><input type="number" value={year} onChange={e => setYear(e.target.value)} className={inputClass} /></div>
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
  const f = parseFloat(favorable) || 0;
  const t = parseFloat(total) || 1;
  const pct = (f / t) * 100;
  return (
    <CalculatorShell title="Probability Calculator" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Favorable Outcomes</label><input type="number" value={favorable} onChange={e => setFavorable(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Total Possible Outcomes</label><input type="number" value={total} onChange={e => setTotal(e.target.value)} className={inputClass} /></div>
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
  const na = parseFloat(a) || 0;
  const nb = parseFloat(b) || 0;
  const nc = parseFloat(c) || 0;
  const d = na ? (nb * nc) / na : 0;
  return (
    <CalculatorShell title="Proportion Calculator" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className={labelClass}>A</label><input type="number" value={a} onChange={e => setA(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>B (first ratio)</label><input type="number" value={b} onChange={e => setB(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>C (solve D)</label><input type="number" value={c} onChange={e => setC(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)] font-mono text-lg">
          <span className="text-[var(--text-primary)]">{na} : {nb} = {nc} : <span className="text-indigo-400 font-bold">{d.toFixed(2)}</span></span>
        </div>
      )}
    </CalculatorShell>
  );
}

const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);

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
  const n1 = parseInt(num1) || 0;
  const n2 = parseInt(num2) || 1;
  const g = gcd(n1, n2);
  return (
    <CalculatorShell title="Ratio Calculator" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>First Number</label><input type="number" value={num1} onChange={e => setNum1(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Second Number</label><input type="number" value={num2} onChange={e => setNum2(e.target.value)} className={inputClass} /></div>
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
    setResult(`Aspect Ratio: ${w / g}:${h / g}\nRatio: ${ratio.toFixed(3)}:1\n(${w} × ${h})`);
  }, [width, height]);
  const w = parseInt(width) || 0;
  const h = parseInt(height) || 1;
  const g = gcd(w, h);
  const commonRatios = ['16:9', '4:3', '21:9', '3:2', '1:1', '5:4'];
  const match = commonRatios.find(r => { const [rw, rh] = r.split(':').map(Number); return w / h === rw / rh; });
  return (
    <CalculatorShell title="Aspect Ratio Calculator" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Width (px)</label><input type="number" value={width} onChange={e => setWidth(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Height (px)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-400">{w / g}:{h / g}</div>
            {match && <div className="text-xs text-emerald-400 mt-1">Common: {match}</div>}
          </div>
          <div className="mt-3 bg-[var(--bg-elevated)] rounded-lg h-24 flex items-center justify-center" style={{ aspectRatio: `${w / g}/${h / g}` }}>
            <div className="text-xs text-[var(--text-tertiary)]">{w} × {h}</div>
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
  const r = parseFloat(radius) || 0;
  const area = Math.PI * r * r;
  return (
    <CalculatorShell title="Circle Calculator" result={result} onCalculate={calc}>
      <div><label className={labelClass}>Radius</label><input type="number" value={radius} onChange={e => setRadius(e.target.value)} step="0.1" className={inputClass} /></div>
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
  const p = parseFloat(pixels) || 0;
  const i = parseFloat(inches) || 1;
  const dpi = p / i;
  return (
    <CalculatorShell title="DPI Calculator" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Pixels</label><input type="number" value={pixels} onChange={e => setPixels(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Inches</label><input type="number" value={inches} onChange={e => setInches(e.target.value)} step="0.1" className={inputClass} /></div>
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
    setResult(`${frac1} ${op === '*' ? '×' : op === '/' ? '÷' : op} ${frac2} = ${n}/${d}${d === 1 ? ` = ${n}` : ` = ${decimal.toFixed(4)}`}`);
  }, [frac1, frac2, op]);
  return (
    <CalculatorShell title="Fraction Calculator" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div><label className={labelClass}>Fraction 1</label><input type="text" value={frac1} onChange={e => setFrac1(e.target.value)} placeholder="1/2" className={inputClass} /></div>
        <div><label className={labelClass}>Operation</label><select value={op} onChange={e => setOp(e.target.value)} className={inputClass}>
          <option value="+">+</option><option value="-">-</option><option value="*">×</option><option value="/">÷</option>
        </select></div>
        <div><label className={labelClass}>Fraction 2</label><input type="text" value={frac2} onChange={e => setFrac2(e.target.value)} placeholder="1/3" className={inputClass} /></div>
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
  const nums = numbers.split(',').map(Number).sort((a, b) => a - b);
  const mean = nums.length ? nums.reduce((s, v) => s + v, 0) / nums.length : 0;
  return (
    <CalculatorShell title="Mean Median Mode Calculator" result={result} onCalculate={calc}>
      <div><label className={labelClass}>Numbers (comma-separated)</label><input type="text" value={numbers} onChange={e => setNumbers(e.target.value)} className={inputClass} /></div>
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
  const p = parseFloat(diagPixels) || 0;
  const i = parseFloat(diagInches) || 1;
  const ppi = p / i;
  return (
    <CalculatorShell title="PPI Calculator" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Diagonal Pixels</label><input type="number" value={diagPixels} onChange={e => setDiagPixels(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Diagonal Inches</label><input type="number" value={diagInches} onChange={e => setDiagInches(e.target.value)} step="0.1" className={inputClass} /></div>
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
  const na = parseFloat(a) || 0;
  const nb = parseFloat(b) || 0;
  const c = Math.sqrt(na * na + nb * nb);
  return (
    <CalculatorShell title="Pythagorean Theorem" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Side a</label><input type="number" value={a} onChange={e => setA(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Side b</label><input type="number" value={b} onChange={e => setB(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-tertiary)]">c = √(a² + b²)</div>
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
      setResult(`Discriminant: ${disc.toFixed(4)} (negative)\nx = ${real} ± ${imag}i`);
    } else if (disc === 0) {
      const x = -B / (2 * A);
      setResult(`Discriminant: 0\nx = ${x.toFixed(4)} (one root)`);
    } else {
      const x1 = (-B + Math.sqrt(disc)) / (2 * A);
      const x2 = (-B - Math.sqrt(disc)) / (2 * A);
      setResult(`Discriminant: ${disc.toFixed(4)}\nx₁ = ${x1.toFixed(4)}\nx₂ = ${x2.toFixed(4)}`);
    }
  }, [a, b, c]);
  const A = parseFloat(a) || 0;
  const B = parseFloat(b) || 0;
  const C = parseFloat(c) || 0;
  const disc = B * B - 4 * A * C;
  return (
    <CalculatorShell title="Quadratic Solver" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className={labelClass}>a</label><input type="number" value={a} onChange={e => setA(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>b</label><input type="number" value={b} onChange={e => setB(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>c</label><input type="number" value={c} onChange={e => setC(e.target.value)} className={inputClass} /></div>
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
  const l = parseFloat(length) || 0;
  const w = parseFloat(width) || 0;
  return (
    <CalculatorShell title="Rectangle Calculator" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Length</label><input type="number" value={length} onChange={e => setLength(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Width</label><input type="number" value={width} onChange={e => setWidth(e.target.value)} className={inputClass} /></div>
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
    setResult(`√${n} = ${sqrt.toFixed(6)}\n∛${n} = ${cubeRoot.toFixed(6)}\n${n} = ${sqrt.toFixed(4)}²`);
  }, [number]);
  const n = parseFloat(number) || 0;
  const sqrt = Math.sqrt(Math.max(0, n));
  return (
    <CalculatorShell title="Square Root Calculator" result={result} onCalculate={calc}>
      <div><label className={labelClass}>Number</label><input type="number" value={number} onChange={e => setNumber(e.target.value)} className={inputClass} /></div>
      {result && n >= 0 && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-tertiary)]">√{n}</div>
          <div className="text-3xl font-bold text-indigo-400">{sqrt.toFixed(4)}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

function factorial(n: number): number {
  if (n < 0) throw new Error('Factorial of negative number');
  if (n === 0 || n === 1) return 1;
  if (!Number.isInteger(n)) throw new Error('Factorial of non-integer');
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function evalScientific(input: string, degMode = true): number {
  let pos = 0;
  const s = input.replace(/\s+/g, '').toLowerCase()
    .replace(/π/g, String(Math.PI))
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
    if (pos < s.length && s[pos] === '-') {
      pos++;
      return -parseAtom();
    }
    if (pos < s.length && s[pos] === '+') {
      pos++;
    }
    return parseAtom();
  }

  function parseAtom(): number {
    if (pos < s.length && s[pos] === '!') {
      pos++;
      return factorial(parseAtom());
    }
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
    while (pos < s.length && (/[0-9.]/).test(s[pos])) {
      numStr += s[pos++];
    }
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
      const resultStr = formatNumber(val);
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

  const handleClear = useCallback(() => {
    setExpr('');
    setResult('');
    setError('');
  }, []);

  const handleBackspace = useCallback(() => {
    setExpr(prev => prev.slice(0, -1));
  }, []);

  const handleEquals = useCallback(() => {
    if (!expr.trim()) return;
    evaluate(expr);
    setExpr('');
  }, [expr, evaluate]);

  const handleMemory = useCallback((op: 'clear' | 'recall' | 'add' | 'subtract') => {
    if (op === 'clear') { setMemory(null); return; }
    if (op === 'recall' && memory !== null) {
      setExpr(prev => prev + String(memory));
      return;
    }
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
    if (result) {
      navigator.clipboard.writeText(result);
      toast.success('Result copied');
    }
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

  const formatNumber = (n: number): string => {
    if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
    const s = n.toPrecision(12);
    return parseFloat(s).toString();
  };

  const evalDisplay = expr.replace(/\*/g, '×').replace(/\//g, '÷');
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
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h1 className="text-lg font-bold text-[var(--text-primary)]">Scientific Calculator</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${showHistory ? 'bg-indigo-500/20 text-indigo-400' : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              History {history.length > 0 && `(${history.length})`}
            </button>
            <button
              onClick={() => setShowFuncs(!showFuncs)}
              className="px-3 py-1 rounded-lg text-xs font-medium bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {showFuncs ? 'Basic' : 'Sci'}
            </button>
            <button
              onClick={() => setAngleMode(m => m === 'deg' ? 'rad' : 'deg')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${angleMode === 'deg' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}
            >
              {angleMode.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Display */}
        <div className="mx-4 mb-3 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] p-4 min-h-[88px] flex flex-col justify-end">
          <div className="text-right text-sm text-[var(--text-secondary)] font-mono break-all min-h-[20px]">
            {evalDisplay || <span className="opacity-30">0</span>}
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="text-xs text-[var(--text-tertiary)]">
              {memory !== null && <span className="text-purple-400 font-bold">M</span>}
            </div>
            <div className="flex items-center gap-2">
              {result && (
                <>
                  <span className="text-2xl font-bold text-[var(--text-primary)] font-mono">{result}</span>
                  <button onClick={copyResult} className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors" title="Copy result">
                    <Copy size={16} />
                  </button>
                </>
              )}
              {error && <span className="text-sm text-red-400 font-medium">{error}</span>}
            </div>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div ref={historyRef} className="mx-4 mb-3 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] max-h-40 overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-4 text-center text-sm text-[var(--text-tertiary)]">No history yet</div>
            ) : (
              [...history].reverse().map((entry, i) => (
                <button
                  key={i}
                  onClick={() => recallHistory(entry)}
                  className="w-full text-left px-4 py-2 hover:bg-[var(--bg-elevated)] transition-colors border-b border-[var(--border-subtle)] last:border-0"
                >
                  <div className="text-xs text-[var(--text-tertiary)] font-mono">{entry.expr.replace(/\*/g, '×').replace(/\//g, '÷')}</div>
                  <div className="text-sm font-bold text-[var(--text-primary)] font-mono">= {entry.result}</div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Scientific Functions Panel */}
        {showFuncs && (
          <div className="px-4 pb-3">
            <div className="grid grid-cols-6 gap-1.5">
              <button className={btnFn} onClick={() => handleFunction('sin')}>sin</button>
              <button className={btnFn} onClick={() => handleFunction('cos')}>cos</button>
              <button className={btnFn} onClick={() => handleFunction('tan')}>tan</button>
              <button className={btnFn} onClick={() => handleFunction('asin')}>sin⁻¹</button>
              <button className={btnFn} onClick={() => handleFunction('acos')}>cos⁻¹</button>
              <button className={btnFn} onClick={() => handleFunction('atan')}>tan⁻¹</button>
              <button className={btnFn} onClick={() => handleFunction('log')}>log</button>
              <button className={btnFn} onClick={() => handleFunction('ln')}>ln</button>
              <button className={btnFn} onClick={() => handleFunction('sqrt')}>√</button>
              <button className={btnFn} onClick={() => insertText('^')}>xⁿ</button>
              <button className={btnFn} onClick={() => insertText('!')}>x!</button>
              <button className={btnFn} onClick={() => insertText('1/')}>1/x</button>
              <button className={btnFn} onClick={() => insertText('π')}>π</button>
              <button className={btnFn} onClick={() => insertText('e')}>e</button>
              <button className={btnFn} onClick={() => insertText('(')}>(</button>
              <button className={btnFn} onClick={() => insertText(')')}>)</button>
              <button className={btnFn} onClick={() => insertText('**2')}>x²</button>
              <button className={btnFn} onClick={() => insertText('**3')}>x³</button>
            </div>
          </div>
        )}

        {/* Main Keypad */}
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
            <button className={btnOp} onClick={() => insertText('/')}>÷</button>
            <button className={`${btnBase} bg-[var(--bg-overlay)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]`} onClick={handleBackspace}>
              <Delete size={18} />
            </button>

            <button className={btnNum} onClick={() => insertText('4')}>4</button>
            <button className={btnNum} onClick={() => insertText('5')}>5</button>
            <button className={btnNum} onClick={() => insertText('6')}>6</button>
            <button className={btnOp} onClick={() => insertText('*')}>×</button>
            <button className={btnFn} onClick={() => insertText('%')}>%</button>

            <button className={btnNum} onClick={() => insertText('1')}>1</button>
            <button className={btnNum} onClick={() => insertText('2')}>2</button>
            <button className={btnNum} onClick={() => insertText('3')}>3</button>
            <button className={btnOp} onClick={() => insertText('-')}>−</button>
            <button className={btnFn} onClick={() => insertText('(-')}>±</button>

            <button className={`${btnNum} col-span-2`} onClick={() => insertText('0')}>0</button>
            <button className={btnNum} onClick={() => insertText('.')}>.</button>
            <button className={btnOp} onClick={() => insertText('+')}>+</button>
            <button className={btnEq} onClick={handleEquals}>=</button>
          </div>
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="mt-3 text-center">
        <span className="text-xs text-[var(--text-tertiary)]">⌨️ Keyboard supported · Enter to evaluate · Esc to clear</span>
      </div>
    </div>
  );
}

export function FluidTypographyCalculator() {
  const [minVw, setMinVw] = useState('320');
  const [maxVw, setMaxVw] = useState('1200');
  const [minSize, setMinSize] = useState('16');
  const [maxSize, setMaxSize] = useState('24');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const slope = (parseFloat(maxSize) - parseFloat(minSize)) / (parseFloat(maxVw) - parseFloat(minVw));
    const intercept = parseFloat(minSize) - slope * parseFloat(minVw);
    const clamp = `clamp(${minSize}px, ${(slope * 100).toFixed(4)}vw + ${intercept.toFixed(4)}px, ${maxSize}px)`;
    setResult(`CSS clamp() value:\n${clamp}`);
  }, []);
  return (
    <CalculatorShell title="Fluid Typography Calculator" result={result} onCalculate={calc}>
        <div><label className={labelClass}>Min Viewport (px)</label><input type="number" value={minVw} onChange={e => setMinVw(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Max Viewport (px)</label><input type="number" value={maxVw} onChange={e => setMaxVw(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Min Font Size (px)</label><input type="number" value={minSize} onChange={e => setMinSize(e.target.value)} step="0.1" className={inputClass} /></div>
        <div><label className={labelClass}>Max Font Size (px)</label><input type="number" value={maxSize} onChange={e => setMaxSize(e.target.value)} step="0.1" className={inputClass} /></div>
    </CalculatorShell>
  );
}

export function BmiCalculatorForKids() {
  const [weight, setWeight] = useState('30');
  const [height, setHeight] = useState('130');
  const [age, setAge] = useState('10');
  const [gender, setGender] = useState('male');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    if (!w || !h) return;
    const bmi = w / Math.pow(h / 100, 2);
    let category = 'Normal weight';
    if (bmi < 5) category = 'Underweight';
    else if (bmi > 25) category = 'Obese';
    else if (bmi > 20) category = 'Overweight';
    setResult(`BMI: ${bmi.toFixed(1)}\nAge: ${age}\nCategory: ${category}\nNote: BMI percentiles vary by age. Consult pediatrician.`);
  }, [weight, height, gender, age]);
  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 1;
  const bmi = w / Math.pow(h / 100, 2);
  const catColor = bmi < 5 ? 'text-red-400' : bmi > 25 ? 'text-red-400' : bmi > 20 ? 'text-amber-400' : 'text-emerald-400';
  return (
    <CalculatorShell title="BMI Calculator for Kids" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} step="0.1" className={inputClass} /></div>
        <div><label className={labelClass}>Height (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Age (years)</label><input type="number" value={age} onChange={e => setAge(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Gender</label><select value={gender} onChange={e => setGender(e.target.value)} className={inputClass}>
          <option value="male">Male</option><option value="female">Female</option>
        </select></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className={`text-3xl font-bold ${catColor}`}>{bmi.toFixed(1)}</div>
          <div className="text-xs text-[var(--text-tertiary)]">BMI</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function BodyFatPercentageCalculator() {
  const [gender, setGender] = useState('male');
  const [waist, setWaist] = useState('32');
  const [neck, setNeck] = useState('15');
  const [height, setHeight] = useState('70');
  const [hip, setHip] = useState('36');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(waist) || 0;
    const n = parseFloat(neck) || 0;
    const h = parseFloat(height) || 0;
    if (!w || !n || !h) return;
    let bf: number;
    if (gender === 'male') {
      bf = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
    } else {
      const hp = parseFloat(hip) || 0;
      bf = 495 / (1.29579 - 0.35004 * Math.log10(w + hp - n) + 0.22100 * Math.log10(h)) - 450;
    }
    let cat = 'Essential';
    if (bf > 35) cat = 'Obese'; else if (bf > 25) cat = 'Above Average'; else if (bf > 18) cat = 'Average'; else if (bf > 10) cat = 'Lean';
    setResult(`Body Fat: ${bf.toFixed(1)}%\nCategory: ${cat}\nMethod: US Navy (NATO)`);
  }, [gender, waist, neck, height, hip]);
  return (
    <CalculatorShell title="Body Fat Calculator" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Gender</label><select value={gender} onChange={e => setGender(e.target.value)} className={inputClass}>
          <option value="male">Male</option><option value="female">Female</option>
        </select></div>
        <div><label className={labelClass}>Waist (in)</label><input type="number" value={waist} onChange={e => setWaist(e.target.value)} step="0.1" className={inputClass} /></div>
        <div><label className={labelClass}>Neck (in)</label><input type="number" value={neck} onChange={e => setNeck(e.target.value)} step="0.1" className={inputClass} /></div>
        <div><label className={labelClass}>Height (in)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} step="0.1" className={inputClass} /></div>
        {gender === 'female' && <div><label className={labelClass}>Hip (in)</label><input type="number" value={hip} onChange={e => setHip(e.target.value)} step="0.1" className={inputClass} /></div>}
      </div>
    </CalculatorShell>
  );
}

export function BodySurfaceAreaCalculator() {
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    if (!w || !h) return;
    const bsa = Math.sqrt(w * h / 3600);
    const bsaDubois = 0.007184 * Math.pow(w, 0.425) * Math.pow(h, 0.725);
    setResult(`BSA (Mosteller): ${bsa.toFixed(2)} m²\nBSA (DuBois): ${bsaDubois.toFixed(2)} m²\nWeight: ${w} kg\nHeight: ${h} cm`);
  }, [weight, height]);
  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 0;
  const bsa = Math.sqrt(w * h / 3600);
  return (
    <CalculatorShell title="Body Surface Area" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} step="0.1" className={inputClass} /></div>
        <div><label className={labelClass}>Height (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-tertiary)]">Body Surface Area</div>
          <div className="text-3xl font-bold text-indigo-400">{bsa.toFixed(2)} m²</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function BabyFormulaCalculator() {
  const [weight, setWeight] = useState('5');
  const [ageMonths, setAgeMonths] = useState('3');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const kg = parseFloat(weight) || 0;
    const age = parseFloat(ageMonths) || 0;
    if (!kg) return;
    const dailyOz = kg * 2.5;
    const feedsPerDay = Math.max(6, 8 - Math.floor(age / 2));
    const perFeed = dailyOz / feedsPerDay;
    setResult(`Daily: ${dailyOz.toFixed(1)} oz (${(dailyOz * 29.5735).toFixed(0)} ml)\nPer Feeding: ${perFeed.toFixed(1)} oz (${(perFeed * 29.5735).toFixed(0)} ml)\nFeeds/Day: ${feedsPerDay}`);
  }, [weight, ageMonths]);
  const kg = parseFloat(weight) || 0;
  const dailyOz = kg * 2.5;
  return (
    <CalculatorShell title="Baby Formula Calculator" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} step="0.1" className={inputClass} /></div>
        <div><label className={labelClass}>Age (months)</label><input type="number" value={ageMonths} onChange={e => setAgeMonths(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-lg font-bold text-indigo-400">{dailyOz.toFixed(0)} oz</div>
            <div className="text-xs text-[var(--text-tertiary)]">Daily</div>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-lg font-bold text-emerald-400">{(dailyOz * 29.5735).toFixed(0)} ml</div>
            <div className="text-xs text-[var(--text-tertiary)]">Daily (ml)</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function BabyGrowthPercentileCalculator() {
  const [weight, setWeight] = useState('10');
  const [height, setHeight] = useState('85');
  const [age, setAge] = useState('2');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    const a = parseFloat(age) || 0;
    if (!w || !h || !a) return;
    const bmi = w / Math.pow(h / 100, 2);
    const avgBmi = 16 + a * 0.5;
    const percentile = Math.min(99, Math.max(1, 50 + (bmi - avgBmi) * 10));
    setResult(`Weight: ${w} kg\nHeight: ${h} cm\nBMI: ${bmi.toFixed(1)}\nEst. Percentile: ${Math.round(percentile)}th\n(Consult pediatrician for WHO chart data)`);
  }, [weight, height, age]);
  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 1;
  const a = parseFloat(age) || 1;
  const bmi = w / Math.pow(h / 100, 2);
  const avgBmi = 16 + a * 0.5;
  const percentile = Math.min(99, Math.max(1, 50 + (bmi - avgBmi) * 10));
  return (
    <CalculatorShell title="Baby Growth Percentile" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} step="0.1" className={inputClass} /></div>
        <div><label className={labelClass}>Height (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Age (years)</label><input type="number" value={age} onChange={e => setAge(e.target.value)} step="0.5" className={inputClass} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-[var(--text-tertiary)]">Percentile</span>
            <span className="text-sm font-bold text-indigo-400">{Math.round(percentile)}th</span>
          </div>
          <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 via-amber-500 via-emerald-500 via-blue-500 to-indigo-500 rounded-full" style={{ width: `${percentile}%` }} />
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function BabySleepScheduleCalculator() {
  const [ageMonths, setAgeMonths] = useState('6');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const age = parseFloat(ageMonths) || 0;
    let totalSleep = 14, naps = 2;
    if (age <= 1) { totalSleep = 16; naps = 4; }
    else if (age <= 4) { totalSleep = 15; naps = 3; }
    else if (age <= 8) { totalSleep = 14; naps = 2; }
    else if (age <= 12) { totalSleep = 13.5; naps = 2; }
    else if (age <= 24) { totalSleep = 13; naps = 1; }
    else { totalSleep = 12; naps = 1; }
    const nightSleep = totalSleep - naps * 1.5;
    setResult(`Total Sleep: ${totalSleep}h/day\nNaps: ${naps}/day\nNight: ~${nightSleep.toFixed(1)}h\nWake Window: ~${(24 - totalSleep).toFixed(1)}h`);
  }, [ageMonths]);
  const age = parseFloat(ageMonths) || 0;
  const sleeps = [
    { label: 'Newborn (0-1m)', total: 16, naps: 4 },
    { label: 'Infant (1-4m)', total: 15, naps: 3 },
    { label: 'Baby (4-8m)', total: 14, naps: 2 },
    { label: 'Older (8-12m)', total: 13.5, naps: 2 },
    { label: 'Toddler (12-24m)', total: 13, naps: 1 },
    { label: 'Preschool (24m+)', total: 12, naps: 1 },
  ];
  const current = sleeps.reduce((prev, curr) => Math.abs(curr.total - (14 - age * 0.15)) < Math.abs(prev.total - (14 - age * 0.15)) ? curr : prev);
  return (
    <CalculatorShell title="Baby Sleep Schedule" result={result} onCalculate={calc}>
      <div><label className={labelClass}>Age (months)</label><input type="number" value={ageMonths} onChange={e => setAgeMonths(e.target.value)} className={inputClass} /></div>
      {result && (
        <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/20">
          <div className="text-center mb-3">
            <div className="text-xs text-[var(--text-tertiary)]">Recommended Sleep</div>
            <div className="text-3xl font-bold text-indigo-400">{current.total}h <span className="text-lg">/ day</span></div>
          </div>
          <div className="flex justify-center gap-4 text-sm">
            <div className="bg-[var(--bg-elevated)] px-3 py-1.5 rounded-lg">
              <span className="text-[var(--text-tertiary)]">Naps: </span>
              <span className="font-bold text-[var(--text-primary)]">{current.naps}</span>
            </div>
            <div className="bg-[var(--bg-elevated)] px-3 py-1.5 rounded-lg">
              <span className="text-[var(--text-tertiary)]">Night: </span>
              <span className="font-bold text-[var(--text-primary)]">~{(current.total - current.naps * 1.5).toFixed(1)}h</span>
            </div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function BreastfeedingCalorieCalculator() {
  const [months, setMonths] = useState('3');
  const [feedings, setFeedings] = useState('8');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const age = parseFloat(months) || 0;
    const feeds = parseFloat(feedings) || 0;
    const mlPerFeed = age <= 1 ? 60 : age <= 3 ? 90 : age <= 6 ? 120 : 150;
    const dailyCal = mlPerFeed * feeds * 0.67;
    setResult(`Daily Calories Burned: ~${dailyCal.toFixed(0)} kcal\nPer Feeding: ~${(mlPerFeed * 0.67).toFixed(0)} kcal\nTotal Milk: ~${(mlPerFeed * feeds).toFixed(0)} ml/day`);
  }, [months, feedings]);
  const age = parseFloat(months) || 0;
  const mlPerFeed = age <= 1 ? 60 : age <= 3 ? 90 : age <= 6 ? 120 : 150;
  const feeds = parseFloat(feedings) || 0;
  const dailyCal = mlPerFeed * feeds * 0.67;
  return (
    <CalculatorShell title="Breastfeeding Calories" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Baby's Age (months)</label><input type="number" value={months} onChange={e => setMonths(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Feedings per Day</label><input type="number" value={feedings} onChange={e => setFeedings(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="bg-amber-500/10 rounded-xl p-4 text-center border border-amber-500/20">
          <div className="text-xs text-[var(--text-tertiary)]">Calories Burned Daily</div>
          <div className="text-3xl font-bold text-amber-400">{dailyCal.toFixed(0)} <span className="text-lg">kcal</span></div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function CalorieCalculator() {
  const [gender, setGender] = useState('male');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [age, setAge] = useState('30');
  const [activity, setActivity] = useState('1.55');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    const a = parseFloat(age) || 0;
    const bmr = gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    const tdee = bmr * parseFloat(activity);
    const calDeficit = tdee - 500;
    const calSurplus = tdee + 300;
    setResult(`BMR: ${bmr.toFixed(0)} kcal/day\nTDEE: ${tdee.toFixed(0)} kcal/day\nCut: ${calDeficit.toFixed(0)} kcal\nBulk: ${calSurplus.toFixed(0)} kcal`);
  }, [gender, weight, height, age, activity]);
  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 0;
  const a = parseFloat(age) || 0;
  const bmr = gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
  const tdee = bmr * parseFloat(activity);
  const presets = [
    { label: 'Sedentary', apply: () => { setActivity('1.2'); } },
    { label: 'Moderate', apply: () => { setActivity('1.55'); } },
    { label: 'Very Active', apply: () => { setActivity('1.9'); } },
  ];
  return (
    <CalculatorShell title="Calorie Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Gender</label><select value={gender} onChange={e => setGender(e.target.value)} className={inputClass}>
          <option value="male">Male</option><option value="female">Female</option>
        </select></div>
        <div><label className={labelClass}>Activity Level</label><select value={activity} onChange={e => setActivity(e.target.value)} className={inputClass}>
          <option value="1.2">Sedentary</option><option value="1.375">Light</option><option value="1.55">Moderate</option><option value="1.725">Active</option><option value="1.9">Very Active</option>
        </select></div>
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Height (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Age</label><input type="number" value={age} onChange={e => setAge(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">BMR</div>
            <div className="text-lg font-bold text-indigo-400">{Math.round(bmr)}</div>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">TDEE</div>
            <div className="text-lg font-bold text-emerald-400">{Math.round(tdee)}</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function ChildHeightPredictor() {
  const [motherH, setMotherH] = useState('165');
  const [fatherH, setFatherH] = useState('180');
  const [childGender, setChildGender] = useState('male');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const mh = parseFloat(motherH) || 0;
    const fh = parseFloat(fatherH) || 0;
    if (!mh || !fh) return;
    const height = childGender === 'male' ? ((mh + fh + 13) / 2) : ((mh + fh - 13) / 2);
    const range = 8.5;
    setResult(`Predicted Height: ${height.toFixed(1)} cm (${(height / 2.54).toFixed(1)} in)\nRange (95%): ${(height - range).toFixed(1)} - ${(height + range).toFixed(1)} cm\nMethod: Mid-parental (Tanner)`);
  }, [motherH, fatherH, childGender]);
  const mh = parseFloat(motherH) || 0;
  const fh = parseFloat(fatherH) || 0;
  const height = childGender === 'male' ? ((mh + fh + 13) / 2) : ((mh + fh - 13) / 2);
  return (
    <CalculatorShell title="Child Height Predictor" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className={labelClass}>Mother's Height (cm)</label><input type="number" value={motherH} onChange={e => setMotherH(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Father's Height (cm)</label><input type="number" value={fatherH} onChange={e => setFatherH(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Child's Gender</label><select value={childGender} onChange={e => setChildGender(e.target.value)} className={inputClass}>
          <option value="male">Male</option><option value="female">Female</option>
        </select></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-tertiary)]">Predicted Adult Height</div>
          <div className="text-3xl font-bold text-indigo-400">{height.toFixed(1)} cm</div>
          <div className="text-xs text-[var(--text-tertiary)]">{(height / 2.54).toFixed(1)} inches</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function CyclingCalorieCalculator() {
  const [weight, setWeight] = useState('70');
  const [duration, setDuration] = useState('60');
  const [speed, setSpeed] = useState('20');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const kg = parseFloat(weight) || 0;
    const min = parseFloat(duration) || 0;
    const kmh = parseFloat(speed) || 0;
    if (!kg || !min) return;
    const met = kmh <= 15 ? 6 : kmh <= 20 ? 8 : kmh <= 25 ? 10 : 12;
    const cal = met * kg * (min / 60);
    const distance = kmh * (min / 60);
    setResult(`Calories Burned: ~${cal.toFixed(0)} kcal\nMET: ${met}\nDistance: ~${distance.toFixed(1)} km\nIntensity: ${met <= 8 ? 'Moderate' : 'Vigorous'}`);
  }, [weight, duration, speed]);
  const kg = parseFloat(weight) || 0;
  const min = parseFloat(duration) || 0;
  const kmh = parseFloat(speed) || 0;
  const met = kmh <= 15 ? 6 : kmh <= 20 ? 8 : kmh <= 25 ? 10 : 12;
  const cal = met * kg * (min / 60);
  return (
    <CalculatorShell title="Cycling Calorie Calc" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Duration (min)</label><input type="number" value={duration} onChange={e => setDuration(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Speed (km/h)</label><input type="number" value={speed} onChange={e => setSpeed(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="bg-emerald-500/10 rounded-xl p-4 text-center border border-emerald-500/20">
          <div className="text-xs text-[var(--text-tertiary)]">Calories Burned</div>
          <div className="text-3xl font-bold text-emerald-400">{Math.round(cal)} <span className="text-lg">kcal</span></div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function HeartRateZoneCalculator() {
  const [age, setAge] = useState('30');
  const [restingHR, setRestingHR] = useState('70');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const a = parseFloat(age) || 0;
    const rhr = parseFloat(restingHR) || 0;
    if (!a) return;
    const maxHR = 220 - a;
    const hrr = maxHR - rhr;
    const zones = [
      { name: 'Zone 1', desc: 'Very Light', min: 50, max: 60 },
      { name: 'Zone 2', desc: 'Light', min: 60, max: 70 },
      { name: 'Zone 3', desc: 'Moderate', min: 70, max: 80 },
      { name: 'Zone 4', desc: 'Hard', min: 80, max: 90 },
      { name: 'Zone 5', desc: 'Maximum', min: 90, max: 100 },
    ];
    const lines = zones.map(z => {
      const low = Math.round(hrr * z.min / 100 + rhr);
      const high = Math.round(hrr * z.max / 100 + rhr);
      return `${z.name} (${z.desc}): ${low}-${high} bpm`;
    });
    setResult(`Max HR: ${maxHR} bpm\nResting: ${rhr} bpm\nHR Reserve: ${hrr} bpm\n\n${lines.join('\n')}`);
  }, [age, restingHR]);
  const a = parseFloat(age) || 0;
  const rhr = parseFloat(restingHR) || 0;
  const maxHR = 220 - a;
  const hrr = maxHR - rhr;
  const zones = [
    { name: 'Z1', desc: 'Very Light', min: 50, max: 60, color: 'bg-blue-500' },
    { name: 'Z2', desc: 'Light', min: 60, max: 70, color: 'bg-emerald-500' },
    { name: 'Z3', desc: 'Moderate', min: 70, max: 80, color: 'bg-amber-500' },
    { name: 'Z4', desc: 'Hard', min: 80, max: 90, color: 'bg-orange-500' },
    { name: 'Z5', desc: 'Max', min: 90, max: 100, color: 'bg-red-500' },
  ];
  return (
    <CalculatorShell title="Heart Rate Zones" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Age</label><input type="number" value={age} onChange={e => setAge(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Resting HR (bpm)</label><input type="number" value={restingHR} onChange={e => setRestingHR(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="space-y-1">
          {zones.map((z, i) => {
            const low = Math.round(hrr * z.min / 100 + rhr);
            const high = Math.round(hrr * z.max / 100 + rhr);
            return (
              <div key={z.name} className="flex items-center gap-3 text-xs">
                <div className="w-16 text-right font-medium text-[var(--text-secondary)]">{z.name}</div>
                <div className="flex-1 h-5 bg-[var(--bg-elevated)] rounded-full overflow-hidden relative">
                  <div className={`h-full ${z.color} rounded-full opacity-60`} style={{ width: `${z.max}%` }} />
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-difference">{low}-{high}</div>
                </div>
                <div className="w-20 text-[var(--text-tertiary)]">{z.desc}</div>
              </div>
            );
          })}
        </div>
      )}
    </CalculatorShell>
  );
}

export function IdealWeightCalculator() {
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('175');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const h = parseFloat(height) || 0;
    const hInches = h / 2.54;
    const base = gender === 'male' ? 50 + 2.3 * (hInches - 60) : 45.5 + 2.3 * (hInches - 60);
    const minWeight = base - base * 0.1;
    const maxWeight = base + base * 0.1;
    const bmiMin = minWeight / Math.pow(h / 100, 2);
    const bmiMax = maxWeight / Math.pow(h / 100, 2);
    setResult(`Ideal Weight: ${minWeight.toFixed(1)} - ${maxWeight.toFixed(1)} kg\n(${(minWeight * 2.205).toFixed(1)} - ${(maxWeight * 2.205).toFixed(1)} lbs)\nEst. BMI: ${bmiMin.toFixed(1)} - ${bmiMax.toFixed(1)}`);
  }, [gender, height]);
  const h = parseFloat(height) || 1;
  return (
    <CalculatorShell title="Ideal Weight" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Gender</label><select value={gender} onChange={e => setGender(e.target.value)} className={inputClass}>
          <option value="male">Male</option><option value="female">Female</option>
        </select></div>
        <div><label className={labelClass}>Height (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputClass} /></div>
      </div>
    </CalculatorShell>
  );
}

export function KetoCalculator() {
  const [weight, setWeight] = useState('70');
  const [calories, setCalories] = useState('2000');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const cal = parseFloat(calories) || 0;
    const kg = parseFloat(weight) || 0;
    if (!cal || !kg) return;
    const protein = kg * 1.6;
    const fat = (cal - protein * 4) * 0.75 / 9;
    const carbs = (cal - protein * 4) * 0.05 / 4;
    const fatPct = (fat * 9 / cal) * 100;
    const proteinPct = (protein * 4 / cal) * 100;
    const carbPct = (carbs * 4 / cal) * 100;
    setResult(`Protein: ${protein.toFixed(0)}g (${proteinPct.toFixed(0)}%)\nFat: ${fat.toFixed(0)}g (${fatPct.toFixed(0)}%)\nCarbs: ${carbs.toFixed(0)}g (${carbPct.toFixed(0)}%)\nCalories: ${Math.round(cal)} kcal`);
  }, [weight, calories]);
  const kg = parseFloat(weight) || 0;
  const cal = parseFloat(calories) || 0;
  const protein = kg * 1.6;
  const fat = (cal - protein * 4) * 0.75 / 9;
  const carbs = (cal - protein * 4) * 0.05 / 4;
  return (
    <CalculatorShell title="Keto Calculator" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Daily Calories</label><input type="number" value={calories} onChange={e => setCalories(e.target.value)} className={inputClass} /></div>
      </div>
      {result && cal > 0 && (
        <div className="space-y-2">
          {[
            { label: 'Fat', value: fat, pct: (fat * 9 / cal) * 100, color: 'bg-amber-500' },
            { label: 'Protein', value: protein, pct: (protein * 4 / cal) * 100, color: 'bg-indigo-500' },
            { label: 'Carbs', value: carbs, pct: (carbs * 4 / cal) * 100, color: 'bg-emerald-500' },
          ].map(m => (
            <div key={m.label}>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">{m.label}</span>
                <span className="text-[var(--text-primary)] font-medium">{m.value.toFixed(0)}g ({m.pct.toFixed(0)}%)</span>
              </div>
              <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                <div className={`h-full ${m.color} rounded-full transition-all duration-500`} style={{ width: `${m.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </CalculatorShell>
  );
}

export function LeanBodyMassCalculator() {
  const [weight, setWeight] = useState('70');
  const [bf, setBf] = useState('15');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const bfp = parseFloat(bf) || 0;
    if (!w) return;
    const lbm = w * (1 - bfp / 100);
    const fatMass = w - lbm;
    const lbmPct = (lbm / w) * 100;
    setResult(`Lean Body Mass: ${lbm.toFixed(1)} kg\nFat Mass: ${fatMass.toFixed(1)} kg\nLean %: ${lbmPct.toFixed(1)}%\nFat %: ${bfp.toFixed(1)}%`);
  }, [weight, bf]);
  const w = parseFloat(weight) || 0;
  const bfp = parseFloat(bf) || 0;
  const lbm = w * (1 - bfp / 100);
  const fatMass = w - lbm;
  return (
    <CalculatorShell title="Lean Body Mass" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Body Fat (%)</label><input type="number" value={bf} onChange={e => setBf(e.target.value)} step="0.1" className={inputClass} /></div>
      </div>
      {result && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-lg font-bold text-indigo-400">{lbm.toFixed(1)} kg</div>
            <div className="text-xs text-[var(--text-tertiary)]">Lean Mass</div>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-3 text-center border border-amber-500/20">
            <div className="text-lg font-bold text-amber-400">{fatMass.toFixed(1)} kg</div>
            <div className="text-xs text-[var(--text-tertiary)]">Fat Mass</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function MacroCalculator() {
  const [gender, setGender] = useState('male');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [age, setAge] = useState('30');
  const [goal, setGoal] = useState('maintain');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    const a = parseFloat(age) || 0;
    const bmr = gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    const tdee = bmr * 1.55;
    let cal = tdee;
    if (goal === 'lose') cal = tdee - 500;
    else if (goal === 'gain') cal = tdee + 300;
    const protein = w * 2;
    const fat = cal * 0.25 / 9;
    const carbs = (cal - protein * 4 - fat * 9) / 4;
    setResult(`Calories: ${Math.round(cal)} kcal\nProtein: ${Math.round(protein)}g\nFat: ${Math.round(fat)}g\nCarbs: ${Math.round(carbs)}g`);
  }, [gender, weight, height, age, goal]);
  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 0;
  const a = parseFloat(age) || 0;
  const bmr = gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
  const tdee = bmr * 1.55;
  let cal = tdee;
  if (goal === 'lose') cal = tdee - 500;
  else if (goal === 'gain') cal = tdee + 300;
  const protein = w * 2;
  const fat = cal * 0.25 / 9;
  const carbs = (cal - protein * 4 - fat * 9) / 4;
  const presets = [
    { label: 'Lose Weight', apply: () => { setGoal('lose'); } },
    { label: 'Maintain', apply: () => { setGoal('maintain'); } },
    { label: 'Gain Muscle', apply: () => { setGoal('gain'); } },
  ];
  return (
    <CalculatorShell title="Macro Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Gender</label><select value={gender} onChange={e => setGender(e.target.value)} className={inputClass}>
          <option value="male">Male</option><option value="female">Female</option>
        </select></div>
        <div><label className={labelClass}>Goal</label><select value={goal} onChange={e => setGoal(e.target.value)} className={inputClass}>
          <option value="lose">Lose</option><option value="maintain">Maintain</option><option value="gain">Gain</option>
        </select></div>
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Height (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Age</label><input type="number" value={age} onChange={e => setAge(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
          <div className="text-center mb-3">
            <div className="text-xs text-[var(--text-tertiary)]">Daily Calories</div>
            <div className="text-2xl font-bold text-indigo-400">{Math.round(cal)} kcal</div>
          </div>
          <div className="flex justify-center gap-4 text-sm">
            <div className="text-center"><div className="font-bold text-amber-400">{Math.round(protein)}g</div><div className="text-xs text-[var(--text-tertiary)]">Protein</div></div>
            <div className="text-center"><div className="font-bold text-emerald-400">{Math.round(fat)}g</div><div className="text-xs text-[var(--text-tertiary)]">Fat</div></div>
            <div className="text-center"><div className="font-bold text-blue-400">{Math.round(carbs)}g</div><div className="text-xs text-[var(--text-tertiary)]">Carbs</div></div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function OvulationCalculator() {
  const [lmp, setLmp] = useState('2026-07-01');
  const [cycleLength, setCycleLength] = useState('28');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const lmpDate = new Date(lmp);
    const cycle = parseFloat(cycleLength) || 28;
    const ovulation = new Date(lmpDate);
    ovulation.setDate(ovulation.getDate() + cycle - 14);
    const fertileStart = new Date(ovulation);
    fertileStart.setDate(fertileStart.getDate() - 5);
    const fertileEnd = new Date(ovulation);
    fertileEnd.setDate(fertileEnd.getDate() + 1);
    const nextPeriod = new Date(lmpDate);
    nextPeriod.setDate(nextPeriod.getDate() + cycle);
    const dpo = Math.floor((new Date().getTime() - ovulation.getTime()) / (1000 * 60 * 60 * 24));
    setResult(`Ovulation: ${ovulation.toLocaleDateString()}\nFertile Window: ${fertileStart.toLocaleDateString()} - ${fertileEnd.toLocaleDateString()}\nNext Period: ${nextPeriod.toLocaleDateString()}\nDPO: ${Math.max(0, dpo)} days`);
  }, [lmp, cycleLength]);
  const lmpDate = new Date(lmp);
  const cycle = parseFloat(cycleLength) || 28;
  const ovulation = new Date(lmpDate);
  ovulation.setDate(ovulation.getDate() + cycle - 14);
  return (
    <CalculatorShell title="Ovulation Calculator" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>First Day of Last Period</label><input type="date" value={lmp} onChange={e => setLmp(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Cycle Length (days)</label><input type="number" value={cycleLength} onChange={e => setCycleLength(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="bg-pink-500/10 rounded-xl p-4 text-center border border-pink-500/20">
          <div className="text-xs text-[var(--text-tertiary)]">Ovulation Date</div>
          <div className="text-xl font-bold text-pink-400">{ovulation.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function PregnancyDueDateCalculator() {
  const [lmp, setLmp] = useState('2026-01-15');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const lmpDate = new Date(lmp);
    const due = new Date(lmpDate);
    due.setDate(due.getDate() + 280);
    const trimester1 = new Date(lmpDate);
    trimester1.setDate(trimester1.getDate() + 84);
    const trimester2 = new Date(lmpDate);
    trimester2.setDate(trimester2.getDate() + 196);
    const today = new Date();
    const daysPregnant = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeksPregnant = Math.max(0, Math.floor(daysPregnant / 7));
    const daysRemaining = Math.max(0, Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    setResult(`Due Date: ${due.toLocaleDateString()}\nTrimester 1 ends: ${trimester1.toLocaleDateString()}\nTrimester 2 ends: ${trimester2.toLocaleDateString()}\nGestation: ${weeksPregnant}w ${daysPregnant % 7}d\nDays Remaining: ${daysRemaining}`);
  }, [lmp]);
  const lmpDate = new Date(lmp);
  const due = new Date(lmpDate);
  due.setDate(due.getDate() + 280);
  const daysPregnant = Math.max(0, Math.floor((new Date().getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24)));
  const weeksPregnant = Math.floor(daysPregnant / 7);
  return (
    <CalculatorShell title="Pregnancy Due Date" result={result} onCalculate={calc}>
      <div><label className={labelClass}>First Day of Last Period</label><input type="date" value={lmp} onChange={e => setLmp(e.target.value)} className={inputClass} /></div>
      {result && (
        <div className="bg-rose-500/10 rounded-xl p-4 border border-rose-500/20">
          <div className="text-center mb-2">
            <div className="text-xs text-[var(--text-tertiary)]">Due Date</div>
            <div className="text-xl font-bold text-rose-400">{due.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
          </div>
          <div className="text-center text-xs text-[var(--text-tertiary)]">Currently ~{weeksPregnant} weeks pregnant</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function ProteinCalculator() {
  const [weight, setWeight] = useState('70');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    if (!w) return;
    const factors: Record<string, number> = { sedentary: 0.8, moderate: 1.4, active: 1.8, athlete: 2.2 };
    const factor = factors[activityLevel] || 1.4;
    const protein = w * factor;
    const calFromProtein = protein * 4;
    const pctOf2000 = (calFromProtein / 2000) * 100;
    setResult(`Daily Protein: ${protein.toFixed(0)}g (${calFromProtein.toFixed(0)} kcal)\nPer kg: ${factor.toFixed(1)}g/kg\n% of 2000 kcal diet: ${pctOf2000.toFixed(0)}%`);
  }, [weight, activityLevel]);
  const w = parseFloat(weight) || 0;
  const factors: Record<string, number> = { sedentary: 0.8, moderate: 1.4, active: 1.8, athlete: 2.2 };
  const factor = factors[activityLevel] || 1.4;
  const protein = w * factor;
  const presets = [
    { label: 'Sedentary', apply: () => { setActivityLevel('sedentary'); } },
    { label: 'Active', apply: () => { setActivityLevel('active'); } },
    { label: 'Athlete', apply: () => { setActivityLevel('athlete'); } },
  ];
  return (
    <CalculatorShell title="Protein Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Activity Level</label><select value={activityLevel} onChange={e => setActivityLevel(e.target.value)} className={inputClass}>
          <option value="sedentary">Sedentary</option><option value="moderate">Moderate</option><option value="active">Active</option><option value="athlete">Athlete</option>
        </select></div>
      </div>
      {result && (
        <div className="bg-indigo-500/10 rounded-xl p-4 text-center border border-indigo-500/20">
          <div className="text-xs text-[var(--text-tertiary)]">Daily Protein</div>
          <div className="text-3xl font-bold text-indigo-400">{protein.toFixed(0)}g</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function RunningPaceCalculator() {
  const [distance, setDistance] = useState('10');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('50');
  const [seconds, setSeconds] = useState('0');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const d = parseFloat(distance) || 0;
    const h = parseFloat(hours) || 0;
    const m = parseFloat(minutes) || 0;
    const s = parseFloat(seconds) || 0;
    if (!d) return;
    const totalMin = h * 60 + m + s / 60;
    const pace = totalMin / d;
    const paceMin = Math.floor(pace);
    const paceSec = Math.round((pace - paceMin) * 60);
    const speed = d / (totalMin / 60);
    const calEstimate = Math.round(70 * 1.036 * d);
    setResult(`Pace: ${paceMin}:${paceSec.toString().padStart(2, '0')} /km\nSpeed: ${speed.toFixed(2)} km/h\nTime: ${h > 0 ? `${Math.floor(totalMin / 60)}h ` : ''}${Math.round(totalMin % 60)}min\nEst. Calories: ~${calEstimate} kcal`);
  }, [distance, hours, minutes, seconds]);
  const d = parseFloat(distance) || 0;
  const totalMin = (parseFloat(hours) || 0) * 60 + (parseFloat(minutes) || 0) + (parseFloat(seconds) || 0) / 60;
  const pace = totalMin / (d || 1);
  const presets = [
    { label: '5K', apply: () => { setDistance('5'); setMinutes('25'); setSeconds('0'); } },
    { label: '10K', apply: () => { setDistance('10'); setMinutes('50'); setSeconds('0'); } },
    { label: 'Half Marathon', apply: () => { setDistance('21.1'); setHours('1'); setMinutes('45'); setSeconds('0'); } },
  ];
  return (
    <CalculatorShell title="Running Pace Calc" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><label className={labelClass}>Distance (km)</label><input type="number" value={distance} onChange={e => setDistance(e.target.value)} step="0.1" className={inputClass} /></div>
        <div><label className={labelClass}>Hours</label><input type="number" value={hours} onChange={e => setHours(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Minutes</label><input type="number" value={minutes} onChange={e => setMinutes(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Seconds</label><input type="number" value={seconds} onChange={e => setSeconds(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Pace</div>
            <div className="text-lg font-bold text-indigo-400">{Math.floor(pace)}:{Math.round((pace - Math.floor(pace)) * 60).toString().padStart(2, '0')} /km</div>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Speed</div>
            <div className="text-lg font-bold text-emerald-400">{(d / (totalMin / 60 || 1)).toFixed(1)} km/h</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function SleepCalculator() {
  const [wakeTime, setWakeTime] = useState('07:00');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const [h, m] = wakeTime.split(':').map(Number);
    const wakeMinutes = h * 60 + m;
    const options = [5, 6, 7.5, 9].map(hours => {
      const bedMin = wakeMinutes - hours * 60;
      const bedH = Math.floor(((bedMin % 1440) + 1440) % 1440 / 60);
      const bedM = Math.round(((bedMin % 1440) + 1440) % 1440 % 60);
      return `${String(bedH).padStart(2, '0')}:${String(bedM).padStart(2, '0')} (${hours}h, ${hours / 1.5} cycles)`;
    });
    setResult(`If waking at ${wakeTime}:\n${options.join('\n')}`);
  }, [wakeTime]);
  return (
    <CalculatorShell title="Sleep Calculator" result={result} onCalculate={calc}>
      <div><label className={labelClass}>Wake Time</label><input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className={inputClass} /></div>
      {result && (
        <div className="bg-indigo-500/10 rounded-xl p-3 border border-indigo-500/20">
          <div className="text-xs text-[var(--text-tertiary)] mb-2">Optimal Bedtimes (90-min cycles)</div>
          {result.split('\n').slice(1).map((line, i) => (
            <div key={i} className="flex justify-between text-sm py-1 border-b border-[var(--border-subtle)] last:border-0">
              <span className="font-bold text-[var(--text-primary)]">{line.split(' (')[0]}</span>
              <span className="text-[var(--text-secondary)]">({line.split('(')[1]}</span>
            </div>
          ))}
        </div>
      )}
    </CalculatorShell>
  );
}

export function StepsToCaloriesCalculator() {
  const [steps, setSteps] = useState('10000');
  const [weight, setWeight] = useState('70');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const s = parseFloat(steps) || 0;
    const w = parseFloat(weight) || 0;
    if (!s || !w) return;
    const km = s * 0.762 / 1000;
    const cal = 0.65 * w * km;
    const calPerStep = cal / s;
    const miles = km / 1.609;
    setResult(`Calories: ~${Math.round(cal)} kcal\nDistance: ${km.toFixed(2)} km (${miles.toFixed(2)} mi)\nCal/Step: ${calPerStep.toFixed(3)}\nSteps/km: ~${Math.round(1000 / 0.762)}`);
  }, [steps, weight]);
  const s = parseFloat(steps) || 0;
  const w = parseFloat(weight) || 0;
  const km = s * 0.762 / 1000;
  const cal = 0.65 * w * km;
  return (
    <CalculatorShell title="Steps to Calories" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Steps</label><input type="number" value={steps} onChange={e => setSteps(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-lg font-bold text-emerald-400">{Math.round(cal)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">kcal burned</div>
          </div>
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-lg font-bold text-indigo-400">{km.toFixed(2)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">km walked</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function WaterIntakeCalculator() {
  const [weight, setWeight] = useState('70');
  const [exerciseMin, setExerciseMin] = useState('0');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const ex = parseFloat(exerciseMin) || 0;
    if (!w) return;
    const base = w * 35;
    const extra = ex * 12;
    const total = (base + extra) / 1000;
    const cups = total / 0.237;
    setResult(`Daily Water: ${total.toFixed(1)} L\n(${cups.toFixed(0)} cups / ${(total * 33.814).toFixed(1)} oz)\nBase: ${(base / 1000).toFixed(1)}L + Exercise: ${(extra / 1000).toFixed(2)}L`);
  }, [weight, exerciseMin]);
  const w = parseFloat(weight) || 0;
  const ex = parseFloat(exerciseMin) || 0;
  const total = (w * 35 + ex * 12) / 1000;
  return (
    <CalculatorShell title="Water Intake" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Daily Exercise (min)</label><input type="number" value={exerciseMin} onChange={e => setExerciseMin(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="bg-blue-500/10 rounded-xl p-4 text-center border border-blue-500/20">
          <div className="text-xs text-[var(--text-tertiary)]">Daily Water Intake</div>
          <div className="text-3xl font-bold text-blue-400">{total.toFixed(1)} L</div>
          <div className="text-xs text-[var(--text-tertiary)]">{(total / 0.237).toFixed(0)} cups · {(total * 33.814).toFixed(0)} oz</div>
        </div>
      )}
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
    const si = p * r * t / 100;
    const total = p + si;
    setResult(`Simple Interest: $${si.toFixed(2)}\nTotal Amount: $${total.toFixed(2)}\nPrincipal: $${p.toFixed(2)}\nRate: ${r}%\nTime: ${t} year(s)`);
  }, [principal, rate, time]);
  const p = parseFloat(principal) || 0;
  const r = parseFloat(rate) || 0;
  const t = parseFloat(time) || 0;
  const si = p * r * t / 100;
  const total = p + si;
  return (
    <CalculatorShell title="Simple Interest" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className={labelClass}>Principal ($)</label><input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputClass} /></div>
        <div><label className={labelClass}>Time (years)</label><input type="number" value={time} onChange={e => setTime(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-lg font-bold text-indigo-400">${si.toFixed(0)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Interest</div>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-lg font-bold text-emerald-400">${total.toFixed(0)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Total</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function SavingsCalculator() {
  const [monthly, setMonthly] = useState('500');
  const [rate, setRate] = useState('5');
  const [years, setYears] = useState('10');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const pmt = parseFloat(monthly) || 0;
    const r = (parseFloat(rate) || 0) / 100 / 12;
    const n = (parseFloat(years) || 0) * 12;
    if (!pmt || !n) return;
    const fv = pmt * (Math.pow(1 + r, n) - 1) / r;
    const totalContributed = pmt * n;
    const growth = fv - totalContributed;
    const monthlyEquivalent = fv / n;
    setResult(`Future Value: $${fv.toFixed(2)}\nTotal Contributed: $${totalContributed.toFixed(2)}\nTotal Growth: $${growth.toFixed(2)}\nMonthly Growth: $${monthlyEquivalent.toFixed(2)}/mo`);
  }, [monthly, rate, years]);
  const pmt = parseFloat(monthly) || 0;
  const r = (parseFloat(rate) || 0) / 100 / 12;
  const n = (parseFloat(years) || 0) * 12;
  const fv = pmt * (Math.pow(1 + r, n) - 1) / (r || 0.0001);
  const totalContributed = pmt * n;
  const presets = [
    { label: '10yr @ 5%', apply: () => { setMonthly('500'); setRate('5'); setYears('10'); } },
    { label: '20yr @ 7%', apply: () => { setMonthly('1000'); setRate('7'); setYears('20'); } },
    { label: '30yr @ 8%', apply: () => { setMonthly('500'); setRate('8'); setYears('30'); } },
  ];
  return (
    <CalculatorShell title="Savings Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className={labelClass}>Monthly ($)</label><input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Annual Return (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.1" className={inputClass} /></div>
        <div><label className={labelClass}>Years</label><input type="number" value={years} onChange={e => setYears(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-lg font-bold text-indigo-400">${fv.toFixed(0)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Future Value</div>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-lg font-bold text-emerald-400">${(fv - totalContributed).toFixed(0)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Growth</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function SeatLicenseCalculator() {
  const [seats, setSeats] = useState('10');
  const [pricePerSeat, setPricePerSeat] = useState('50');
  const [months, setMonths] = useState('12');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const s = parseFloat(seats) || 0;
    const p = parseFloat(pricePerSeat) || 0;
    const m = parseFloat(months) || 0;
    const totalMonthly = s * p;
    const totalAnnual = totalMonthly * m;
    const costPerSeatAnnual = p * m;
    setResult(`Monthly Total: $${totalMonthly.toFixed(2)}\nAnnual Total: $${totalAnnual.toFixed(2)}\nCost per Seat/Year: $${costPerSeatAnnual.toFixed(2)}\nTotal Seats: ${s}`);
  }, [seats, pricePerSeat, months]);
  const s = parseFloat(seats) || 0;
  const p = parseFloat(pricePerSeat) || 0;
  const m = parseFloat(months) || 0;
  const totalMonthly = s * p;
  const totalAnnual = totalMonthly * m;
  return (
    <CalculatorShell title="Seat License Calc" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className={labelClass}>Number of Seats</label><input type="number" value={seats} onChange={e => setSeats(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Price/Seat ($/mo)</label><input type="number" value={pricePerSeat} onChange={e => setPricePerSeat(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Months</label><input type="number" value={months} onChange={e => setMonths(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-lg font-bold text-indigo-400">${totalMonthly.toFixed(0)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Monthly</div>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-lg font-bold text-emerald-400">${totalAnnual.toFixed(0)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Annual</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function SemverCalculator() {
  const [ver1, setVer1] = useState('2.1.0');
  const [ver2, setVer2] = useState('2.0.0');
  const [result, setResult] = useState('');
  const parseVer = (v: string) => v.split('.').map(Number);
  const calc = useCallback(() => {
    const v1 = parseVer(ver1);
    const v2 = parseVer(ver2);
    let cmp = '';
    for (let i = 0; i < 3; i++) {
      if ((v1[i] || 0) > (v2[i] || 0)) { cmp = '>'; break; }
      if ((v1[i] || 0) < (v2[i] || 0)) { cmp = '<'; break; }
    }
    if (!cmp) cmp = '=';
    setResult(`${ver1} ${cmp} ${ver2}\n${ver1} is ${cmp === '>' ? 'newer' : cmp === '<' ? 'older' : 'equal to'} ${ver2}`);
  }, [ver1, ver2]);
  const v1 = parseVer(ver1);
  const v2 = parseVer(ver2);
  let cmp = '';
  for (let i = 0; i < 3; i++) { if ((v1[i] || 0) > (v2[i] || 0)) { cmp = '>'; break; } if ((v1[i] || 0) < (v2[i] || 0)) { cmp = '<'; break; } }
  if (!cmp) cmp = '=';
  const presets = [
    { label: 'Major Bump', apply: () => { setVer1('3.0.0'); setVer2('2.1.0'); } },
    { label: 'Minor Bump', apply: () => { setVer1('2.2.0'); setVer2('2.1.0'); } },
    { label: 'Patch', apply: () => { setVer1('2.1.1'); setVer2('2.1.0'); } },
  ];
  return (
    <CalculatorShell title="Semver Calculator" result={result} onCalculate={calc} presets={presets}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Version 1</label><input type="text" value={ver1} onChange={e => setVer1(e.target.value)} placeholder="2.1.0" className={inputClass} /></div>
        <div><label className={labelClass}>Version 2</label><input type="text" value={ver2} onChange={e => setVer2(e.target.value)} placeholder="2.0.0" className={inputClass} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)]">
          <div className="text-xl font-bold font-mono" style={{ color: cmp === '>' ? '#34d399' : cmp === '<' ? '#f87171' : '#fbbf24' }}>{ver1} {cmp} {ver2}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function StandardDeviationCalculator() {
  const [numbers, setNumbers] = useState('2,4,6,8,10');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const nums = numbers.split(',').map(Number);
    if (!nums.length || nums.some(isNaN)) return;
    const mean = nums.reduce((s, v) => s + v, 0) / nums.length;
    const variance = nums.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / nums.length;
    const std = Math.sqrt(variance);
    const popStd = Math.sqrt(nums.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (nums.length));
    const sampleStd = nums.length > 1 ? Math.sqrt(nums.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (nums.length - 1)) : 0;
    setResult(`Mean: ${mean.toFixed(4)}\nPopulation σ: ${popStd.toFixed(4)}\nSample σ: ${sampleStd.toFixed(4)}\nVariance: ${variance.toFixed(4)}\nN: ${nums.length}`);
  }, [numbers]);
  const nums = numbers.split(',').map(Number);
  const mean = nums.length ? nums.reduce((s, v) => s + v, 0) / nums.length : 0;
  return (
    <CalculatorShell title="Std Deviation" result={result} onCalculate={calc}>
      <div><label className={labelClass}>Numbers (comma-separated)</label><input type="text" value={numbers} onChange={e => setNumbers(e.target.value)} className={inputClass} /></div>
      {result && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Mean</div>
            <div className="text-lg font-bold text-indigo-400">{mean.toFixed(2)}</div>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Std Dev (σ)</div>
            <div className="text-lg font-bold text-emerald-400">{Math.sqrt(nums.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / nums.length).toFixed(2)}</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function TaxCalculator() {
  const [income, setIncome] = useState('75000');
  const [deductions, setDeductions] = useState('13000');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const inc = parseFloat(income) || 0;
    const ded = parseFloat(deductions) || 0;
    const taxable = Math.max(0, inc - ded);
    let tax = 0;
    if (taxable > 523600) tax = (taxable - 523600) * 0.37 + 157804.25;
    else if (taxable > 209425) tax = (taxable - 209425) * 0.35 + 47843;
    else if (taxable > 164925) tax = (taxable - 164925) * 0.32 + 33599;
    else if (taxable > 86775) tax = (taxable - 86775) * 0.24 + 14279;
    else if (taxable > 40675) tax = (taxable - 40675) * 0.22 + 4615;
    else if (taxable > 9950) tax = (taxable - 9950) * 0.12 + 995;
    else tax = taxable * 0.1;
    const effective = inc > 0 ? (tax / inc) * 100 : 0;
    const marginal = taxable > 523600 ? 37 : taxable > 209425 ? 35 : taxable > 164925 ? 32 : taxable > 86775 ? 24 : taxable > 40675 ? 22 : taxable > 9950 ? 12 : 10;
    const afterTax = inc - tax;
    setResult(`Taxable Income: $${taxable.toLocaleString()}\nTax: $${Math.round(tax).toLocaleString()}\nEffective: ${effective.toFixed(1)}%\nMarginal: ${marginal}%\nAfter Tax: $${afterTax.toLocaleString()}`);
  }, [income, deductions]);
  const inc = parseFloat(income) || 0;
  const ded = parseFloat(deductions) || 0;
  const taxable = Math.max(0, inc - ded);
  let tax = 0;
  if (taxable > 523600) tax = (taxable - 523600) * 0.37 + 157804.25;
  else if (taxable > 209425) tax = (taxable - 209425) * 0.35 + 47843;
  else if (taxable > 164925) tax = (taxable - 164925) * 0.32 + 33599;
  else if (taxable > 86775) tax = (taxable - 86775) * 0.24 + 14279;
  else if (taxable > 40675) tax = (taxable - 40675) * 0.22 + 4615;
  else if (taxable > 9950) tax = (taxable - 9950) * 0.12 + 995;
  else tax = taxable * 0.1;
  return (
    <CalculatorShell title="Tax Calculator" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Annual Income ($)</label><input type="number" value={income} onChange={e => setIncome(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Standard Deduction ($)</label><input type="number" value={deductions} onChange={e => setDeductions(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="space-y-2">
          <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Estimated Tax</div>
            <div className="text-2xl font-bold text-red-400">$${Math.round(tax).toLocaleString()}</div>
          </div>
          <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full" style={{ width: `${Math.min((tax / inc) * 100, 100)}%` }} />
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function TdsCalculatorIndia() {
  const [salary, setSalary] = useState('1200000');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const s = parseFloat(salary) || 0;
    let tax = 0;
    if (s > 1500000) tax = (s - 1500000) * 0.3 + 150000;
    else if (s > 1200000) tax = (s - 1200000) * 0.2 + 90000;
    else if (s > 900000) tax = (s - 900000) * 0.15 + 45000;
    else if (s > 600000) tax = (s - 600000) * 0.1 + 15000;
    else if (s > 300000) tax = (s - 300000) * 0.05;
    const monthly = tax / 12;
    const netMonthly = (s - tax) / 12;
    const effective = s > 0 ? (tax / s) * 100 : 0;
    setResult(`Annual Tax: ₹${Math.round(tax).toLocaleString()}\nMonthly TDS: ₹${Math.round(monthly).toLocaleString()}\nNet Monthly: ₹${Math.round(netMonthly).toLocaleString()}\nEffective: ${effective.toFixed(1)}%\n(New Regime, no deductions)`);
  }, [salary]);
  const s = parseFloat(salary) || 0;
  let tax = 0;
  if (s > 1500000) tax = (s - 1500000) * 0.3 + 150000;
  else if (s > 1200000) tax = (s - 1200000) * 0.2 + 90000;
  else if (s > 900000) tax = (s - 900000) * 0.15 + 45000;
  else if (s > 600000) tax = (s - 600000) * 0.1 + 15000;
  else if (s > 300000) tax = (s - 300000) * 0.05;
  return (
    <CalculatorShell title="TDS Calculator (India)" result={result} onCalculate={calc}>
      <div><label className={labelClass}>Annual Salary (₹)</label><input type="number" value={salary} onChange={e => setSalary(e.target.value)} className={inputClass} /></div>
      {result && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-red-500/10 rounded-xl p-3 text-center border border-red-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Annual Tax</div>
            <div className="text-lg font-bold text-red-400">₹{Math.round(tax).toLocaleString()}</div>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Net Monthly</div>
            <div className="text-lg font-bold text-emerald-400">₹{Math.round((s - tax) / 12).toLocaleString()}</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function TrialConversionCalculator() {
  const [trials, setTrials] = useState('1000');
  const [paid, setPaid] = useState('200');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const t = parseFloat(trials) || 0;
    const p = parseFloat(paid) || 0;
    if (!t) return;
    const rate = (p / t) * 100;
    const churned = t - p;
    setResult(`Conversion Rate: ${rate.toFixed(2)}%\nPaid: ${p} of ${t}\nDid Not Convert: ${churned}`);
  }, [trials, paid]);
  const t = parseFloat(trials) || 1;
  const p = parseFloat(paid) || 0;
  const rate = (p / t) * 100;
  return (
    <CalculatorShell title="Trial Conversion" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Total Trials</label><input type="number" value={trials} onChange={e => setTrials(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Paid Conversions</label><input type="number" value={paid} onChange={e => setPaid(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="space-y-2">
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-xs text-[var(--text-tertiary)]">Trial Conversion</div>
            <div className="text-2xl font-bold text-indigo-400">{rate.toFixed(1)}%</div>
          </div>
          <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full" style={{ width: `${rate}%` }} />
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function TriangleAreaCalculator() {
  const [base, setBase] = useState('6');
  const [height, setHeight] = useState('4');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const b = parseFloat(base) || 0;
    const h = parseFloat(height) || 0;
    if (!b || !h) return;
    const area = 0.5 * b * h;
    setResult(`Area: ${area.toFixed(2)} sq units\nBase: ${b}\nHeight: ${h}`);
  }, [base, height]);
  const b = parseFloat(base) || 0;
  const h = parseFloat(height) || 0;
  const area = 0.5 * b * h;
  return (
    <CalculatorShell title="Triangle Area" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Base</label><input type="number" value={base} onChange={e => setBase(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Height</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputClass} /></div>
      </div>
      {result && (
        <div className="bg-emerald-500/10 rounded-xl p-4 text-center border border-emerald-500/20">
          <div className="text-xs text-[var(--text-tertiary)]">Area = ½ × b × h</div>
          <div className="text-3xl font-bold text-emerald-400">{area.toFixed(2)}</div>
        </div>
      )}
    </CalculatorShell>
  );
}

export function GasMileageCalculator() {
  const [miles, setMiles] = useState('300');
  const [gallons, setGallons] = useState('10');
  const [costPerGallon, setCostPerGallon] = useState('3.50');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const m = parseFloat(miles) || 0;
    const g = parseFloat(gallons) || 0;
    const cpg = parseFloat(costPerGallon) || 0;
    if (!g) { setResult('Gallons cannot be zero'); return; }
    const mpg = m / g;
    const kml = mpg * 0.425144;
    const costPerMile = cpg / mpg;
    const tripCost = cpg * g;
    setResult(`Fuel Economy: ${mpg.toFixed(1)} MPG\n${kml.toFixed(1)} km/L\nCost/Mile: $${costPerMile.toFixed(2)}\nTrip Cost: $${tripCost.toFixed(2)}`);
  }, [miles, gallons, costPerGallon]);
  const m = parseFloat(miles) || 0;
  const g = parseFloat(gallons) || 1;
  const cpg = parseFloat(costPerGallon) || 0;
  const mpg = m / g;
  return (
    <CalculatorShell title="Gas Mileage" result={result} onCalculate={calc}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className={labelClass}>Miles Driven</label><input type="number" value={miles} onChange={e => setMiles(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Gallons Used</label><input type="number" value={gallons} onChange={e => setGallons(e.target.value)} step="0.1" className={inputClass} /></div>
        <div><label className={labelClass}>$/Gallon</label><input type="number" value={costPerGallon} onChange={e => setCostPerGallon(e.target.value)} step="0.01" className={inputClass} /></div>
      </div>
      {result && (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-lg font-bold text-emerald-400">{mpg.toFixed(1)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">MPG</div>
          </div>
          <div className="bg-indigo-500/10 rounded-xl p-3 text-center border border-indigo-500/20">
            <div className="text-lg font-bold text-indigo-400">${(cpg * g).toFixed(2)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Trip Cost</div>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}
