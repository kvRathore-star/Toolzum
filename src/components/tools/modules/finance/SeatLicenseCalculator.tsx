"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { DollarSign } from 'lucide-react';
import { inputCls, labelCls } from '../Calculators.shared';

export default function SeatLicenseCalculator() {
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
    <CalculatorShell
      title="Seat License Calculator"
      icon={<DollarSign className="w-5 h-5" />}
      accent="violet"
      result={result}
      onCalculate={calc}
      presets={[
        { label: 'Small team (10)', apply: () => { setUsers('10'); setPricePerUser('10'); setBillingCycle('monthly'); setAnnualDiscount('15'); } },
        { label: 'Mid team (50)', apply: () => { setUsers('50'); setPricePerUser('15'); setBillingCycle('annual'); setAnnualDiscount('15'); } },
        { label: 'Enterprise (100)', apply: () => { setUsers('100'); setPricePerUser('25'); setBillingCycle('annual'); setAnnualDiscount('20'); } },
      ]}
      downloadData={`Users,PricePerUser,BillingCycle,AnnualDiscount,Result\n${users},${pricePerUser},${billingCycle},${annualDiscount},${result.replace(/\n/g, ' | ')}`}
      downloadFilename="seat-license.csv"
    >
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
