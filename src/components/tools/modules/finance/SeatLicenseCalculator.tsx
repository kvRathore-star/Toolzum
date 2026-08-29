"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function SeatLicenseCalculator() {
  const [users, setUsers] = useState('50');
  const [pricePerUser, setPricePerUser] = useState('15');
  const [billingCycle, setBillingCycle] = useState<'monthly'|'annual'>('monthly');
  const [annualDiscount, setAnnualDiscount] = useState('15');

  const u = parseFloat(users) || 0;
  const p = parseFloat(pricePerUser) || 0;
  const d = parseFloat(annualDiscount) || 0;
  const monthlyBase = u * p;
  const monthly = billingCycle === 'annual' ? monthlyBase * (1 - d / 100) / 12 : monthlyBase;
  const annual = monthly * 12;
  const result = u > 0 && p > 0 ? `$${monthly.toFixed(0)}/mo ($${annual.toFixed(0)}/yr)` : '';

  return (
    <CalculatorShell
      title="Seat License Calculator"
      accent="violet"
      result={result}
      auto
      presets={[
        { label: 'Small team (10)', apply: () => { setUsers('10'); setPricePerUser('10'); setBillingCycle('monthly'); setAnnualDiscount('15'); } },
        { label: 'Mid team (50)', apply: () => { setUsers('50'); setPricePerUser('15'); setBillingCycle('annual'); setAnnualDiscount('15'); } },
        { label: 'Enterprise (100)', apply: () => { setUsers('100'); setPricePerUser('25'); setBillingCycle('annual'); setAnnualDiscount('20'); } },
      ]}
      downloadData={`Users,PricePerUser,BillingCycle,AnnualDiscount,Monthly,Annual\n${users},${pricePerUser},${billingCycle},${annualDiscount},${monthly.toFixed(2)},${annual.toFixed(2)}`}
      downloadFilename="seat-license.csv"
      customResult={u > 0 && p > 0 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[var(--bg-overlay)] rounded-xl text-center">
              <div className="text-xs text-[var(--text-muted)]">Monthly</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">${monthly.toFixed(0)}</div>
            </div>
            <div className="p-3 bg-[var(--bg-overlay)] rounded-xl text-center">
              <div className="text-xs text-[var(--text-muted)]">Annual</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">${annual.toFixed(0)}</div>
            </div>
          </div>
          <div className="text-xs text-[var(--text-muted)] text-center">
            {u} users × ${p}/user{billingCycle === 'annual' ? ` (${d}% annual discount)` : ''}
          </div>
        </div>
      ) : null}
    >
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Number of users</label><input className={inputCls} type="number" value={users} onChange={e => setUsers(e.target.value)} /></div>
        <div><label className={labelCls}>Price / user / month ($)</label><input className={inputCls} type="number" value={pricePerUser} onChange={e => setPricePerUser(e.target.value)} /></div>
        <div><label className={labelCls}>Billing cycle</label><select className={inputCls} value={billingCycle} onChange={e => setBillingCycle(e.target.value as 'monthly'|'annual')}><option value="monthly">Monthly</option><option value="annual">Annual</option></select></div>
        <div><label className={labelCls}>Annual discount (%)</label><input className={inputCls} type="number" value={annualDiscount} onChange={e => setAnnualDiscount(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}
