"use client";

import React, { useState } from 'react';
import { DollarSign, Percent, TrendingUp, Users, ShieldAlert, BarChart3, HelpCircle } from 'lucide-react';
import { CalcActions } from '../shared/CalcActions';

export default function SaasPricingCalculator() {
  const [arpu, setArpu] = useState<number>(50); // Average Revenue Per User (monthly)
  const [cac, setCac] = useState<number>(300); // Customer Acquisition Cost
  const [churn, setChurn] = useState<number>(3); // Monthly Churn Rate %
  const [opex, setOpex] = useState<number>(10000); // Monthly Operating Expense (USD)
  const [cogsPercent, setCogsPercent] = useState<number>(15); // COGS % (hosting, api cost, support)
  const [targetMrr, setTargetMrr] = useState<number>(50000); // Target MRR Goal
  const [startingCustomers, setStartingCustomers] = useState<number>(100);

  // Calculations
  const grossMarginMultiplier = 1 - (cogsPercent / 100);
  const ltv = churn > 0 ? (arpu * grossMarginMultiplier) / (churn / 100) : 0;
  const ltvToCac = cac > 0 ? ltv / cac : 0;
  
  const breakEvenCustomers = arpu * grossMarginMultiplier > 0 
    ? Math.ceil(opex / (arpu * grossMarginMultiplier)) 
    : 0;

  const targetCustomers = arpu > 0 ? Math.ceil(targetMrr / arpu) : 0;
  const paybackPeriod = (arpu * grossMarginMultiplier) > 0 
    ? cac / (arpu * grossMarginMultiplier) 
    : 0;

  // LTV:CAC Health Indicator
  let healthText = "Unviable";
  let healthColor = "text-[var(--accent)] bg-rose-500/10 border-rose-500/20";
  if (ltvToCac >= 5) {
    healthText = "Excellent (Highly Scalable)";
    healthColor = "text-emerald-500 bg-emerald-700/10 border-emerald-500/20";
  } else if (ltvToCac >= 3) {
    healthText = "Good (Standard SaaS Target)";
    healthColor = "text-[var(--accent)] bg-indigo-500/10 border-indigo-500/20";
  } else if (ltvToCac >= 1.5) {
    healthText = "Cautionary (High CAC or Churn)";
    healthColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
  }

  // Generate 12-month projection
  const generateProjections = () => {
    const list = [];
    let currentCust = startingCustomers;
    const monthlyBudgetForAcquisition = Math.max(2000, opex * 0.3); // Assumed 30% of opex goes to marketing
    const newCustomersPerMonth = Math.round(monthlyBudgetForAcquisition / cac);

    for (let month = 1; month <= 12; month++) {
      const churned = Math.round(currentCust * (churn / 100));
      const netAdd = newCustomersPerMonth - churned;
      const startCust = currentCust;
      currentCust = Math.max(0, currentCust + netAdd);
      const mrr = currentCust * arpu;
      const arr = mrr * 12;
      const grossProfit = mrr * grossMarginMultiplier;

      list.push({
        month,
        startCust,
        added: newCustomersPerMonth,
        churned,
        endCust: currentCust,
        mrr,
        arr,
        grossProfit
      });
    }
    return list;
  };

  const projections = generateProjections();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Title */}
      <div className="bg-[var(--bg-overlay)] p-5 border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
          SaaS Pricing & Economics Calculator
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Simulate unit economics, customer lifetime value, and MRR growth projections.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-subtle)] pb-2">
            Economics & Drivers
          </h3>

          <div className="space-y-4">
            {/* ARPU */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                <span>Avg. Revenue Per User (ARPU)</span>
                <span className="text-[var(--text-primary)]">${arpu}/mo</span>
              </div>
              <input aria-label="Avg. Revenue Per User (ARPU)" 
                type="range" min="5" max="500" step="5" value={arpu} 
                onChange={e => setArpu(parseInt(e.target.value))} 
                className="w-full accent-indigo-600"
              />
            </div>

            {/* CAC */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                <span>Customer Acquisition Cost (CAC)</span>
                <span className="text-[var(--text-primary)]">${cac}</span>
              </div>
              <input aria-label="Customer Acquisition Cost (CAC)" 
                type="range" min="10" max="2000" step="10" value={cac} 
                onChange={e => setCac(parseInt(e.target.value))} 
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Churn */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                <span>Monthly Churn Rate (%)</span>
                <span className="text-[var(--text-primary)]">{churn}%</span>
              </div>
              <input aria-label="Monthly Churn Rate (%)" 
                type="range" min="0.5" max="25" step="0.5" value={churn} 
                onChange={e => setChurn(parseFloat(e.target.value))} 
                className="w-full accent-indigo-600"
              />
            </div>

            {/* OpEx */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                <span>Monthly Operating Expense</span>
                <span className="text-[var(--text-primary)]">${opex.toLocaleString()}/mo</span>
              </div>
              <input aria-label="Monthly Operating Expense" 
                type="range" min="1000" max="100000" step="1000" value={opex} 
                onChange={e => setOpex(parseInt(e.target.value))} 
                className="w-full accent-indigo-600"
              />
            </div>

            {/* COGS % */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                <span>COGS (Hosting/Support/API %)</span>
                <span className="text-[var(--text-primary)]">{cogsPercent}%</span>
              </div>
              <input aria-label="COGS (Hosting/Support/API %)" 
                type="range" min="5" max="60" step="5" value={cogsPercent} 
                onChange={e => setCogsPercent(parseInt(e.target.value))} 
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Starting Customers */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                <span>Starting Customers</span>
                <span className="text-[var(--text-primary)]">{startingCustomers}</span>
              </div>
              <input aria-label="Starting Customers" 
                type="range" min="0" max="1000" step="10" value={startingCustomers} 
                onChange={e => setStartingCustomers(parseInt(e.target.value))} 
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Target MRR */}
            <div className="space-y-1 pt-2 border-t border-[var(--border-subtle)]">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Target Monthly Recurring Revenue</label>
              <div className="relative">
                <input aria-label="Target Monthly Recurring Revenue" 
                  type="number" value={targetMrr} 
                  onChange={e => setTargetMrr(Math.max(100, parseInt(e.target.value) || 0))}
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--border-subtle)] text-sm"
                />
                <span className="absolute right-4 top-3.5 text-[var(--text-muted)] font-bold text-xs">USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results & Calculations Panel */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* LTV:CAC Ratio */}
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">LTV : CAC Ratio</span>
                <h4 className="text-2xl font-black text-[var(--text-primary)] mt-1">
                  {ltvToCac.toFixed(1)}x
                </h4>
              </div>
              <div className={`mt-3 border px-2 py-1 rounded-md text-[10px] font-bold text-center ${healthColor}`}>
                {healthText}
              </div>
            </div>

            {/* CAC Payback Period */}
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">CAC Payback</span>
                <h4 className="text-2xl font-black text-[var(--accent)] mt-1">
                  {paybackPeriod.toFixed(1)} months
                </h4>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] mt-3 block">Time to recover initial acquisition cost.</span>
            </div>

            {/* Break-Even Points */}
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">OpEx Break-even</span>
                <h4 className="text-2xl font-black text-emerald-500 mt-1">
                  {breakEvenCustomers.toLocaleString()} users
                </h4>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] mt-3 block">
                Required active users for gross profitability.
              </span>
            </div>

          </div>

          {/* Actions */}
          <CalcActions
            result={`LTV:CAC ${ltvToCac.toFixed(1)}x (${healthText}) | Payback ${paybackPeriod.toFixed(1)}mo | Break-even ${breakEvenCustomers} users | LTV $${Math.round(ltv).toLocaleString()} | Gross Margin ${(grossMarginMultiplier * 100).toFixed(0)}%`}
            downloadData={`Month,End Users,Added,Churned,MRR,ARR,Gross Profit\n${projections.map(p => `${p.month},${p.endCust},${p.added},${p.churned},${Math.round(p.mrr)},${Math.round(p.arr)},${Math.round(p.grossProfit)}`).join('\n')}`}
            downloadFilename="saas-pricing-projections.csv"
          />

          {/* Core Metrics Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider pb-2 border-b border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
              Economics Analysis
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between p-2.5 bg-[var(--bg-overlay)]/20 rounded-xl">
                <span className="text-[var(--text-secondary)]">Gross Margin:</span>
                <span className="font-bold text-[var(--text-primary)]">{(grossMarginMultiplier * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[var(--bg-overlay)]/20 rounded-xl">
                <span className="text-[var(--text-secondary)]">Customer Lifetime Value (LTV):</span>
                <span className="font-bold text-[var(--text-primary)]">${Math.round(ltv).toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[var(--bg-overlay)]/20 rounded-xl">
                <span className="text-[var(--text-secondary)]">Target MRR Customers:</span>
                <span className="font-bold text-[var(--text-primary)]">{targetCustomers.toLocaleString()} accounts</span>
              </div>
              <div className="flex justify-between p-2.5 bg-[var(--bg-overlay)]/20 rounded-xl">
                <span className="text-[var(--text-secondary)]">Gross Profit per User:</span>
                <span className="font-bold text-[var(--text-primary)]">${(arpu * grossMarginMultiplier).toFixed(2)}/mo</span>
              </div>
            </div>
          </div>

          {/* Growth Simulator Output */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider pb-2 border-b border-[var(--border-subtle)] dark:border-[var(--border-subtle)] flex items-center justify-between">
              <span>12-Month Projections</span>
              <span className="text-[10px] text-[var(--text-muted)] font-normal">Assumes 30% of OpEx allocated to CAC acquisition</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-[var(--text-secondary)]">
                <thead>
                    <tr className="border-b border-[var(--border-subtle)] dark:border-[var(--border-subtle)] text-[var(--text-muted)] font-semibold">
                    <th className="py-2">Month</th>
                    <th className="py-2">End Users</th>
                    <th className="py-2 text-[var(--accent)]">Churned</th>
                    <th className="py-2">Monthly MRR</th>
                    <th className="py-2">Annual ARR</th>
                    <th className="py-2 text-right">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] dark:divide-[var(--border-subtle)]">
                  {projections.map(proj => (
                    <tr key={proj.month} className="hover:bg-[var(--bg-overlay)]/50 dark:hover:bg-[var(--bg-elevated)]/50">
                      <td className="py-2.5 font-semibold text-[var(--text-primary)]">Month {proj.month}</td>
                      <td className="py-2.5 font-bold text-[var(--text-primary)]">{proj.endCust.toLocaleString()}</td>
                      <td className="py-2.5 text-rose-700 dark:text-rose-400">-{proj.churned}</td>
                      <td className="py-2.5 font-semibold text-[var(--text-primary)] dark:text-[var(--text-primary)]">${Math.round(proj.mrr).toLocaleString()}</td>
                      <td className="py-2.5 text-[var(--text-muted)]">${Math.round(proj.arr).toLocaleString()}</td>
                      <td className="py-2.5 font-bold text-emerald-500 text-right">${Math.round(proj.grossProfit).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
