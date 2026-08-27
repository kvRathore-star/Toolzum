"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TrendingUp, PiggyBank, Briefcase, Download, IndianRupee, BarChart3, Calendar, Percent, Clock, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

type Mode = 'sip' | 'ppf' | 'epf';

function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const start = ref.current;
    const diff = value - start;
    if (Math.abs(diff) < 1) { setDisplay(value); ref.current = value; return; }
    const duration = 800;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);
      ref.current = current;
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  return <span>{display.toLocaleString('en-IN')}</span>;
}

function BarChart({ data, maxVal, labelKey, color = 'bg-emerald-700' }: { data: { year: number; value: number }[]; maxVal: number; labelKey: string; color?: string }) {
  return (
    <div className="space-y-1.5">
      {data.map((d, i) => {
        const pct = maxVal > 0 ? (d.value / maxVal) * 100 : 0;
        return (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-6 text-[var(--text-muted)] font-medium text-right">{d.year}</span>
            <div className="flex-1 h-5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
              <div className={`h-full ${color} rounded-full transition-all duration-700 ease-out`} style={{ width: `${pct}%` }} />
            </div>
            <span className="w-24 text-right text-[var(--text-secondary)] font-medium">{formatINR(d.value)}</span>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, accent = false }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)] text-center">
      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-black ${accent ? 'text-emerald-500' : 'text-[var(--text-primary)]'}`}>{value}</p>
    </div>
  );
}

function NumberInput({ label, value, onChange, min = 0, max, step = 1, prefix, suffix, icon }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; prefix?: string; suffix?: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg-overlay)] rounded-xl p-3.5 border border-[var(--border-subtle)] space-y-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide">
        {icon} {label}
      </label>
      <div className="flex items-center gap-1.5">
        {prefix && <span className="text-[var(--text-muted)] font-medium text-sm">{prefix}</span>}
        <input type="number" value={value || ''} onChange={e => { const v = parseFloat(e.target.value) || 0; onChange(max !== undefined ? Math.min(Math.max(v, min), max) : Math.max(v, min)); }}
          min={min} max={max} step={step}
          className="flex-1 bg-transparent border-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-sm text-[var(--text-primary)] font-semibold p-0 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
        {suffix && <span className="text-[var(--text-muted)] text-xs">{suffix}</span>}
      </div>
      <input type="range" min={min} max={max ?? 1000000} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-emerald-500 h-1.5" />
    </div>
  );
}

function Table({ headers, rows, accentIdx = -1 }: { headers: string[]; rows: (string | number)[][]; accentIdx?: number }) {
  return (
    <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-xl border border-[var(--border-subtle)]">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-[var(--bg-elevated)] z-10">
          <tr className="text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
            {headers.map(h => <th key={h} className="text-left py-2.5 px-3 font-bold uppercase tracking-wider">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`${i % 2 === 0 ? 'bg-[var(--bg-overlay)]' : 'bg-transparent'} border-b border-[var(--border-subtle)]/50 text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]/20 transition-colors`}>
              {row.map((cell, j) => (
                <td key={j} className={`py-2 px-3 ${j === accentIdx ? 'font-bold text-emerald-500' : ''} ${j === 0 ? 'font-semibold text-[var(--text-primary)]' : ''}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function downloadCSV(headers: string[], rows: (string | number)[][], filename: string) {
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('CSV downloaded!');
}

// ---------- SIP ----------
function SipTab() {
  const [monthly, setMonthly] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const presets = [
    { name: 'Conservative', monthly: 5000, rate: 8, years: 10 },
    { name: 'Moderate', monthly: 10000, rate: 12, years: 15 },
    { name: 'Aggressive', monthly: 25000, rate: 15, years: 20 },
    { name: 'Short Term', monthly: 15000, rate: 10, years: 3 },
  ];

  const r = rate / 12 / 100;
  const n = years * 12;
  const totalInvested = monthly * n;
  const futureValue = r > 0 ? monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : totalInvested;
  const wealthGained = futureValue - totalInvested;

  const yearlyData = useMemo(() =>
    Array.from({ length: years }, (_, yr) => {
      const monthsDone = (yr + 1) * 12;
      const fv = r > 0 ? monthly * ((Math.pow(1 + r, monthsDone) - 1) / r) * (1 + r) : monthly * monthsDone;
      const invested = monthly * monthsDone;
      return { year: yr + 1, invested: Math.round(invested), value: Math.round(fv), gain: Math.round(fv - invested) };
    }), [monthly, rate, years]);

  const maxVal = Math.max(...yearlyData.map(d => d.value), 1);
  const headers = ['Year', 'Invested (₹)', 'Value (₹)', 'Wealth Gain (₹)'];
  const rows = yearlyData.map(d => [d.year, d.invested.toLocaleString('en-IN'), d.value.toLocaleString('en-IN'), d.gain.toLocaleString('en-IN')]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {presets.map(pr => (
          <button key={pr.name} onClick={() => { setMonthly(pr.monthly); setRate(pr.rate); setYears(pr.years); toast.success(`Loaded: ${pr.name}`); }}
            className="px-3 py-1.5 text-[10px] font-bold bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-emerald-500 hover:border-emerald-400 transition-colors uppercase tracking-wider">{pr.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <NumberInput label="Monthly Investment" value={monthly} onChange={v => setMonthly(v)} min={100} max={500000} step={500} prefix="₹" icon={<IndianRupee className="w-3 h-3" />} />
        <NumberInput label="Expected Return (p.a.)" value={rate} onChange={v => setRate(v)} min={1} max={30} step={0.5} suffix="%" icon={<Percent className="w-3 h-3" />} />
        <NumberInput label="Duration" value={years} onChange={v => setYears(v)} min={1} max={40} step={1} suffix="Years" icon={<Clock className="w-3 h-3" />} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Invested" value={<><IndianRupee className="w-3.5 h-3.5 inline -ml-0.5" /><AnimatedNumber value={Math.round(totalInvested)} /></>} />
        <StatCard label="Estimated Returns" value={<><span className="text-emerald-500">+</span><IndianRupee className="w-3.5 h-3.5 inline" /><AnimatedNumber value={Math.round(wealthGained)} /></>} accent />
        <StatCard label="Total Value" value={<><IndianRupee className="w-3.5 h-3.5 inline -ml-0.5" /><AnimatedNumber value={Math.round(futureValue)} /></>} />
      </div>

      <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Growth Trend</p>
        <BarChart data={yearlyData.map(d => ({ year: d.year, value: d.value }))} maxVal={maxVal} labelKey="Value" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Year-by-Year Breakdown</p>
          <button onClick={() => downloadCSV(headers, rows, 'sip-calculation.csv')}
            className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"><Download className="w-3 h-3" /> CSV</button>
        </div>
        <Table headers={headers} rows={rows} accentIdx={3} />
      </div>

      <button className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2">
        <TrendingUp className="w-4 h-4" /> Calculate SIP
      </button>
    </div>
  );
}

// ---------- PPF ----------
function PpfTab() {
  const [yearlyDeposit, setYearlyDeposit] = useState(60000);
  const [rate, setRate] = useState(7.1);
  const [years, setYears] = useState(15);

  const presets = [
    { name: 'Starter', deposit: 6000, rate: 7.1, years: 15 },
    { name: 'Standard', deposit: 60000, rate: 7.1, years: 15 },
    { name: 'Maximum', deposit: 150000, rate: 7.1, years: 15 },
    { name: 'Extended', deposit: 60000, rate: 7.1, years: 25 },
  ];

  const yearlyData = useMemo(() => {
    const data: { year: number; deposit: number; interest: number; balance: number }[] = [];
    let balance = 0;
    for (let y = 1; y <= years; y++) {
      const dep = Math.min(yearlyDeposit, 150000);
      const opening = balance + dep;
      const interest = opening * (rate / 100);
      balance = opening + interest;
      data.push({ year: y, deposit: dep, interest: Math.round(interest), balance: Math.round(balance) });
    }
    return data;
  }, [yearlyDeposit, rate, years]);

  const totalDeposited = yearlyData.reduce((s, d) => s + d.deposit, 0);
  const totalInterest = yearlyData.reduce((s, d) => s + d.interest, 0);
  const maturityAmount = yearlyData[yearlyData.length - 1]?.balance ?? 0;

  const maxVal = Math.max(...yearlyData.map(d => d.balance), 1);
  const headers = ['Year', 'Deposit (₹)', 'Interest (₹)', 'Balance (₹)'];
  const rows = yearlyData.map(d => [d.year, d.deposit.toLocaleString('en-IN'), d.interest.toLocaleString('en-IN'), d.balance.toLocaleString('en-IN')]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {presets.map(pr => (
          <button key={pr.name} onClick={() => { setYearlyDeposit(pr.deposit); setRate(pr.rate); setYears(pr.years); toast.success(`Loaded: ${pr.name}`); }}
            className="px-3 py-1.5 text-[10px] font-bold bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-emerald-500 hover:border-emerald-400 transition-colors uppercase tracking-wider">{pr.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <NumberInput label="Yearly Deposit" value={yearlyDeposit} onChange={v => setYearlyDeposit(Math.min(Math.max(v, 500), 150000))} min={500} max={150000} step={1000} prefix="₹" icon={<IndianRupee className="w-3 h-3" />} />
        <NumberInput label="PPF Interest Rate" value={rate} onChange={v => setRate(v)} min={1} max={15} step={0.1} suffix="%" icon={<Percent className="w-3 h-3" />} />
        <NumberInput label="Tenure" value={years} onChange={v => setYears(v)} min={1} max={50} step={1} suffix="Years" icon={<Clock className="w-3 h-3" />} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Deposited" value={<><IndianRupee className="w-3.5 h-3.5 inline -ml-0.5" /><AnimatedNumber value={totalDeposited} /></>} />
        <StatCard label="Interest Earned" value={<><span className="text-emerald-500">+</span><IndianRupee className="w-3.5 h-3.5 inline" /><AnimatedNumber value={totalInterest} /></>} accent />
        <StatCard label="Maturity Amount" value={<><IndianRupee className="w-3.5 h-3.5 inline -ml-0.5" /><AnimatedNumber value={maturityAmount} /></>} />
      </div>

      <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Balance Growth</p>
        <BarChart data={yearlyData.map(d => ({ year: d.year, value: d.balance }))} maxVal={maxVal} labelKey="Balance" color="bg-emerald-400" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Year-by-Year Breakdown</p>
          <button onClick={() => downloadCSV(headers, rows, 'ppf-calculation.csv')}
            className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"><Download className="w-3 h-3" /> CSV</button>
        </div>
        <Table headers={headers} rows={rows} accentIdx={3} />
      </div>

      <button className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2">
        <PiggyBank className="w-4 h-4" /> Calculate PPF
      </button>
    </div>
  );
}

// ---------- EPF ----------
function EpfTab() {
  const [basic, setBasic] = useState(50000);
  const [empRate, setEmpRate] = useState(12);
  const [employerEpfRate, setEmployerEpfRate] = useState(3.67);
  const [epsRate, setEpsRate] = useState(8.33);
  const [epfRate, setEpfRate] = useState(8.25);
  const [years, setYears] = useState(25);

  const presets = [
    { name: 'Entry Level', basic: 25000, years: 30 },
    { name: 'Mid Level', basic: 50000, years: 25 },
    { name: 'Senior', basic: 100000, years: 20 },
    { name: 'Early Career', basic: 30000, years: 35 },
  ];

  const yearlyData = useMemo(() => {
    const data: { year: number; empContr: number; employerEpf: number; eps: number; interest: number; corpus: number }[] = [];
    let corpus = 0;
    const epsCap = 15000;
    for (let y = 1; y <= years; y++) {
      const monthlyEmp = basic * (empRate / 100);
      const monthlyEps = Math.min(basic * (epsRate / 100), epsCap * (epsRate / 100));
      const monthlyEmployerEpf = (basic * (employerEpfRate / 100));
      const annualEmp = monthlyEmp * 12;
      const annualEmployerEpf = monthlyEmployerEpf * 12;
      const annualEps = monthlyEps * 12;
      const totalAnnualContr = annualEmp + annualEmployerEpf;
      const interest = (corpus + totalAnnualContr / 2) * (epfRate / 100);
      corpus = corpus + totalAnnualContr + interest;
      data.push({
        year: y,
        empContr: Math.round(annualEmp),
        employerEpf: Math.round(annualEmployerEpf),
        eps: Math.round(annualEps),
        interest: Math.round(interest),
        corpus: Math.round(corpus),
      });
    }
    return data;
  }, [basic, empRate, employerEpfRate, epsRate, epfRate, years]);

  const totalEmp = yearlyData.reduce((s, d) => s + d.empContr, 0);
  const totalEmployerEpf = yearlyData.reduce((s, d) => s + d.employerEpf, 0);
  const totalEps = yearlyData.reduce((s, d) => s + d.eps, 0);
  const totalInterest = yearlyData.reduce((s, d) => s + d.interest, 0);
  const totalCorpus = yearlyData[yearlyData.length - 1]?.corpus ?? 0;

  const maxVal = Math.max(...yearlyData.map(d => d.corpus), 1);
  const headers = ['Year', 'Employee (₹)', 'Employer EPF (₹)', 'Interest (₹)', 'Total Corpus (₹)'];
  const rows = yearlyData.map(d => [d.year, d.empContr.toLocaleString('en-IN'), d.employerEpf.toLocaleString('en-IN'), d.interest.toLocaleString('en-IN'), d.corpus.toLocaleString('en-IN')]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {presets.map(pr => (
          <button key={pr.name} onClick={() => { setBasic(pr.basic); setYears(pr.years); toast.success(`Loaded: ${pr.name}`); }}
            className="px-3 py-1.5 text-[10px] font-bold bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-emerald-500 hover:border-emerald-400 transition-colors uppercase tracking-wider">{pr.name}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <NumberInput label="Monthly Basic + DA" value={basic} onChange={v => setBasic(v)} min={1000} max={500000} step={1000} prefix="₹" icon={<IndianRupee className="w-3 h-3" />} />
        <NumberInput label="Years to Retirement" value={years} onChange={v => setYears(v)} min={1} max={45} step={1} suffix="Years" icon={<Clock className="w-3 h-3" />} />
      </div>

      <details className="group">
        <summary className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider cursor-pointer hover:text-[var(--text-secondary)] transition-colors list-none flex items-center gap-1.5">
          <Building2 className="w-3 h-3" /> Advanced Contribution Settings
          <span className="text-[var(--border-subtle)] group-open:rotate-180 transition-transform ml-auto">▼</span>
        </summary>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <NumberInput label="Employee EPF Rate" value={empRate} onChange={v => setEmpRate(v)} min={0} max={100} step={0.5} suffix="%" icon={<Percent className="w-3 h-3" />} />
          <NumberInput label="Employer EPF Rate" value={employerEpfRate} onChange={v => setEmployerEpfRate(v)} min={0} max={100} step={0.5} suffix="%" icon={<Percent className="w-3 h-3" />} />
          <NumberInput label="EPS Rate (employer)" value={epsRate} onChange={v => setEpsRate(v)} min={0} max={100} step={0.5} suffix="%" icon={<Percent className="w-3 h-3" />} />
          <NumberInput label="EPF Interest Rate" value={epfRate} onChange={v => setEpfRate(v)} min={0} max={20} step={0.25} suffix="%" icon={<Percent className="w-3 h-3" />} />
        </div>
      </details>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Employee Share" value={<><IndianRupee className="w-3.5 h-3.5 inline -ml-0.5" /><AnimatedNumber value={totalEmp} /></>} />
        <StatCard label="Employer EPF Share" value={<><IndianRupee className="w-3.5 h-3.5 inline -ml-0.5" /><AnimatedNumber value={totalEmployerEpf} /></>} />
        <StatCard label="Interest Earned" value={<><span className="text-emerald-500">+</span><IndianRupee className="w-3.5 h-3.5 inline" /><AnimatedNumber value={totalInterest} /></>} accent />
        <StatCard label="Total Corpus" value={<><IndianRupee className="w-3.5 h-3.5 inline -ml-0.5" /><AnimatedNumber value={totalCorpus} /></>} />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl px-4 py-3">
        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
          <Building2 className="w-3 h-3 inline mr-1" />EPS Contribution: <strong>{formatINR(totalEps)}</strong> (employer share @ 8.33% up to ₹15,000/mo basic)
        </p>
      </div>

      <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Corpus Growth</p>
        <BarChart data={yearlyData.map(d => ({ year: d.year, value: d.corpus }))} maxVal={maxVal} labelKey="Corpus" color="bg-emerald-700" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Year-by-Year Breakdown</p>
          <button onClick={() => downloadCSV(headers, rows, 'epf-calculation.csv')}
            className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"><Download className="w-3 h-3" /> CSV</button>
        </div>
        <Table headers={headers} rows={rows} accentIdx={4} />
      </div>

      <button className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2">
        <Briefcase className="w-4 h-4" /> Calculate EPF
      </button>
    </div>
  );
}

// ---------- Main ----------
const TABS: { mode: Mode; label: string; desc: string; icon: React.ReactNode }[] = [
  { mode: 'sip', label: 'SIP', desc: 'Systematic Investment Plan', icon: <TrendingUp className="w-5 h-5" /> },
  { mode: 'ppf', label: 'PPF', desc: 'Public Provident Fund', icon: <PiggyBank className="w-5 h-5" /> },
  { mode: 'epf', label: 'EPF', desc: 'Employee Provident Fund', icon: <Briefcase className="w-5 h-5" /> },
];

export default function IndianInvestmentCalculator() {
  const [mode, setMode] = useState<Mode>('sip');

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Indian Investment Calculator</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {TABS.map(t => (
          <button key={t.mode} onClick={() => setMode(t.mode)}
            className={`rounded-xl p-4 border-2 transition-all text-left ${
              mode === t.mode
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-500/10'
                : 'border-[var(--border-subtle)] bg-[var(--bg-overlay)] hover:border-[var(--text-muted)]'
            }`}>
            <div className={`${mode === t.mode ? 'text-emerald-500' : 'text-[var(--text-muted)]'} mb-1.5`}>{t.icon}</div>
            <p className={`font-bold text-sm ${mode === t.mode ? 'text-emerald-700 dark:text-emerald-300' : 'text-[var(--text-primary)]'}`}>{t.label}</p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{t.desc}</p>
          </button>
        ))}
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl">
        {mode === 'sip' && <SipTab />}
        {mode === 'ppf' && <PpfTab />}
        {mode === 'epf' && <EpfTab />}
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
        <p className="text-[10px] text-[var(--accent)]">
          <strong>Pro:</strong> Compare all three investment options side-by-side, download detailed PDF reports, set goal-based targets with timeline tracking, auto-rebalance suggestions, tax impact analysis, and export to Excel for financial planning.
        </p>
      </div>
    </div>
  );
}