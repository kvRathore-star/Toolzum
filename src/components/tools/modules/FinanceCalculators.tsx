"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Copy, Delete } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CalculatorShell } from './shared/CalculatorShell';
import { gradePointsMap, gcd, factorial, inputCls, labelCls, btnCls } from './Calculators.shared';

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
                    <td className="px-3 py-1.5 text-right text-green-700 dark:text-green-400">${row.principal.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right text-red-700 dark:text-red-400">${row.interest.toLocaleString()}</td>
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
            { label: 'Expansion', value: parseFloat(expRev) || 0, color: 'bg-emerald-700' },
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
              <span className="text-indigo-700 dark:text-indigo-400">${arr.toLocaleString()}</span>
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
                    <td className="px-3 py-1.5 text-right text-indigo-700 dark:text-indigo-400 font-medium">${row.value.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-right text-emerald-700 dark:text-emerald-400">${row.interest.toLocaleString()}</td>
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
              <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">${pmt.toFixed(0)}</div>
              <div className="text-xs text-[var(--text-tertiary)]">per month</div>
            </div>
            <div className="h-12 w-px bg-[var(--border-subtle)]" />
            <div className="text-center">
              <div className="text-lg font-bold text-[var(--text-primary)]">${(pmt * n).toFixed(0)}</div>
              <div className="text-xs text-[var(--text-tertiary)]">total paid</div>
            </div>
            <div className="h-12 w-px bg-[var(--border-subtle)]" />
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">${(pmt * n - p).toFixed(0)}</div>
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
            <div className="text-3xl font-bold text-amber-700 dark:text-amber-400">${monthly.toFixed(0)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">monthly lease payment</div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 bg-[var(--bg-elevated)] rounded-lg p-3 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Residual</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">{((res / cap) * 100).toFixed(0)}%</div>
            </div>
            <div className="flex-1 bg-[var(--bg-elevated)] rounded-lg p-3 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">APR</div>
              <div className="text-sm font-bold text-amber-700 dark:text-amber-400">{((parseFloat(mf) || 0) * 2400).toFixed(2)}%</div>
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
              <span className="text-red-700 dark:text-red-400 font-medium">{churnPct.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-[var(--bg-overlay)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(churnPct, 100)}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--text-secondary)]">Retention</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">{(100 - churnPct).toFixed(1)}%</span>
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
            <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{cr.toFixed(1)}%</span>
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
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 px-4">&#8594;</div>
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-[var(--text-primary)]">${final.toFixed(0)}</div>
              <div className="text-xs text-[var(--text-tertiary)]">Final Price</div>
            </div>
          </div>
          <div className="bg-emerald-700/10 rounded-lg p-2 text-center">
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">You Save ${savings.toFixed(2)} ({d}% off)</span>
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
            { label: 'Annual', value: `$${annual.toLocaleString()}`, color: 'text-indigo-700 dark:text-indigo-400' },
            { label: 'Monthly', value: `$${monthly.toLocaleString()}`, color: 'text-emerald-700 dark:text-emerald-400' },
            { label: 'Biweekly', value: `$${(annual / 26).toLocaleString()}`, color: 'text-amber-700 dark:text-amber-400' },
            { label: 'Weekly', value: `$${(h * hpw).toLocaleString()}`, color: 'text-rose-700 dark:text-rose-400' },
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
            <div className="text-2xl text-red-700 dark:text-red-400">&#8594;</div>
            <div className="text-center">
              <div className="text-xs text-[var(--text-tertiary)]">In {y} years</div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">${fv.toFixed(0)}</div>
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
          <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">$${ltv.toFixed(0)}</div>
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
            <div className="text-lg font-bold text-indigo-700 dark:text-indigo-400">${mrr.toLocaleString()}</div>
            <div className="text-xs text-[var(--text-tertiary)]">Monthly</div>
          </div>
          <div className="bg-emerald-700/10 rounded-xl p-3 text-center border border-emerald-500/20">
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">${(mrr * 12).toLocaleString()}</div>
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
              <div className={`text-2xl font-bold ${nw >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                ${nw.toLocaleString()}
              </div>
            </div>
            <div className={`px-3 py-1 rounded-lg text-xs font-bold ${dti <= 30 ? 'bg-emerald-700/20 text-emerald-700 dark:text-emerald-400' : dti <= 50 ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400' : 'bg-red-500/20 text-red-700 dark:text-red-400'}`}>
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
        <div><label className="block text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-1.5">Promoters (9-10)</label><input type="number" value={promoters} onChange={e => setPromoters(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-amber-700 dark:text-amber-400 mb-1.5">Passives (7-8)</label><input type="number" value={passives} onChange={e => setPassives(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-red-700 dark:text-red-400 mb-1.5">Detractors (0-6)</label><input type="number" value={detractors} onChange={e => setDetractors(e.target.value)} className={inputCls} /></div>
      </div>
      {result && total > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold" style={{ color: nps >= 50 ? '#34d399' : nps >= 0 ? '#fbbf24' : '#f87171' }}>{nps.toFixed(0)}</div>
            <div className="text-sm text-[var(--text-tertiary)]">out of -100 to +100</div>
          </div>
          <div className="flex h-8 rounded-full overflow-hidden">
            <div className="bg-emerald-700 transition-all duration-500 flex items-center justify-center text-xs font-bold text-white" style={{ width: `${pctPromo}%` }}>{pctPromo >= 15 ? `${pctPromo.toFixed(0)}%` : ''}</div>
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
            <div className="flex-1 bg-emerald-700/10 rounded-xl border border-emerald-500/20 p-3 flex flex-col justify-center items-center">
              <div className="text-xs text-[var(--text-tertiary)]">Buy Net Cost</div>
              <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">${buyNet.toFixed(0)}</div>
            </div>
            <div className="flex-1 bg-amber-500/10 rounded-xl border border-amber-500/20 p-3 flex flex-col justify-center items-center">
              <div className="text-xs text-[var(--text-tertiary)]">Rent Total</div>
              <div className="text-xl font-bold text-amber-700 dark:text-amber-400">${rentTotal.toFixed(0)}</div>
            </div>
          </div>
          <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-700 transition-all duration-500" style={{ width: `${Math.min(buyPct, 100)}%` }} />
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
            <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">${fv.toLocaleString()}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[var(--bg-overlay)] rounded-lg p-2 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Contributions</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">${totalContrib.toLocaleString()}</div>
            </div>
            <div className="bg-[var(--bg-overlay)] rounded-lg p-2 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Growth</div>
              <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">${growth.toLocaleString()}</div>
            </div>
            <div className="bg-[var(--bg-overlay)] rounded-lg p-2 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Growth %</div>
              <div className="text-sm font-bold text-amber-700 dark:text-amber-400">{growthPct.toFixed(0)}%</div>
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
            <div className={`text-2xl font-bold ${isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
              {isPositive ? '\u2191' : '\u2193'} {Math.abs(growth).toFixed(1)}%
            </div>
            <div className="text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Current</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">${c.toLocaleString()}</div>
            </div>
          </div>
          <div className="mt-3 h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${isPositive ? 'bg-emerald-700' : 'bg-red-500'}`} style={{ width: `${Math.min(Math.abs(growth), 100)}%` }} />
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
            <div className={`h-full rounded-full transition-all duration-500 ${runwayPct > 50 ? 'bg-emerald-700' : runwayPct > 25 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${runwayPct}%` }} />
          </div>
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
            <tbody>{schedule.map(r => <tr key={r.year} className="border-b border-[var(--border-subtle)]"><td className="px-3 py-1.5 text-[var(--text-primary)]">{r.year}</td><td className="px-3 py-1.5 text-right text-emerald-700 dark:text-emerald-400">${r.balance.toLocaleString()}</td><td className="px-3 py-1.5 text-right text-[var(--text-secondary)]">${r.contributions.toLocaleString()}</td><td className="px-3 py-1.5 text-right text-amber-700 dark:text-amber-400">${r.interest.toLocaleString()}</td></tr>)}</tbody>
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
