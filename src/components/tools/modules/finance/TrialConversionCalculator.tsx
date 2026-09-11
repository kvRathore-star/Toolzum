"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function TrialConversionCalculator() {
  const [visitors, setVisitors] = useState('1000');
  const [signups, setSignups] = useState('100');
  const [paid, setPaid] = useState('20');
  const [trialLength, setTrialLength] = useState('14');
  const [price, setPrice] = useState('29');

  const v = parseFloat(visitors) || 0;
  const s = parseFloat(signups) || 0;
  const p = parseFloat(paid) || 0;
  const pr = parseFloat(price) || 0;
  const visitorToSignup = v > 0 ? (s / v) * 100 : 0;
  const signupToPaid = s > 0 ? (p / s) * 100 : 0;
  const visitorToPaid = v > 0 ? (p / v) * 100 : 0;
  const mrr = p * pr;
  const result = v > 0 ? `Visitor→Signup: ${visitorToSignup.toFixed(1)}% | Signup→Paid: ${signupToPaid.toFixed(1)}% | MRR: $${mrr.toLocaleString()}` : '';

  return (
    <CalculatorShell category="Finance"
      title="Trial Conversion Calculator"
      accent="violet"
      result={result}
      auto
      presets={[
        { label: 'Typical SaaS', apply: () => { setVisitors('10000'); setSignups('500'); setPaid('75'); setTrialLength('14'); setPrice('29'); } },
        { label: 'High conversion', apply: () => { setVisitors('5000'); setSignups('250'); setPaid('50'); setTrialLength('7'); setPrice('49'); } },
        { label: 'Early stage', apply: () => { setVisitors('1000'); setSignups('100'); setPaid('20'); setTrialLength('14'); setPrice('29'); } },
      ]}
      downloadData={`Visitors,Signups,Paid,VisitorToSignup,SignupToPaid,MRR\n${visitors},${signups},${paid},${visitorToSignup.toFixed(1)},${signupToPaid.toFixed(1)},${mrr}`}
      downloadFilename="trial-conversion.csv"
      customResult={v > 0 ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-[var(--bg-overlay)] rounded-xl text-center">
              <div className="text-xs text-[var(--text-muted)]">Visitor→Signup</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">{visitorToSignup.toFixed(1)}%</div>
            </div>
            <div className="p-3 bg-[var(--bg-overlay)] rounded-xl text-center">
              <div className="text-xs text-[var(--text-muted)]">Signup→Paid</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">{signupToPaid.toFixed(1)}%</div>
            </div>
            <div className="p-3 bg-[var(--bg-overlay)] rounded-xl text-center">
              <div className="text-xs text-[var(--text-muted)]">MRR</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${mrr.toLocaleString()}</div>
            </div>
          </div>
          <div className="text-xs text-[var(--text-muted)] text-center">
            {p} paid from {s} signups ({p}/{s}) | {pr}/mo × {p} users
          </div>
        </div>
      ) : null}
    >
      <div className="grid grid-cols-2 gap-4">
        <div><label htmlFor="lbl-trialconversioncalculator-visitors-mo" className={labelCls}>Visitors / mo</label><input id="lbl-trialconversioncalculator-visitors-mo" aria-label="Visitors / mo" className={inputCls} type="number" value={visitors} onChange={e => setVisitors(e.target.value)} /></div>
        <div><label htmlFor="lbl-trialconversioncalculator-trial-signups" className={labelCls}>Trial signups</label><input id="lbl-trialconversioncalculator-trial-signups" aria-label="Trial signups" className={inputCls} type="number" value={signups} onChange={e => setSignups(e.target.value)} /></div>
        <div><label htmlFor="lbl-trialconversioncalculator-paid-conversions" className={labelCls}>Paid conversions</label><input id="lbl-trialconversioncalculator-paid-conversions" aria-label="Paid conversions" className={inputCls} type="number" value={paid} onChange={e => setPaid(e.target.value)} /></div>
        <div><label htmlFor="lbl-trialconversioncalculator-trial-length-days" className={labelCls}>Trial length (days)</label><input id="lbl-trialconversioncalculator-trial-length-days" aria-label="Trial length (days)" className={inputCls} type="number" value={trialLength} onChange={e => setTrialLength(e.target.value)} /></div>
        <div><label htmlFor="lbl-trialconversioncalculator-price-mo" className={labelCls}>Price ($/mo)</label><input id="lbl-trialconversioncalculator-price-mo" aria-label="Price ($/mo)" className={inputCls} type="number" value={price} onChange={e => setPrice(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}
