"use client";

import React, { useState } from 'react';
import { Users, TrendingDown, DollarSign, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';

export default function EmployeeTurnoverCalculator() {
  const [startingEmployees, setStartingEmployees] = useState<number>(100);
  const [endingEmployees, setEndingEmployees] = useState<number>(105);
  const [voluntaryDepartures, setVoluntaryDepartures] = useState<number>(8);
  const [involuntaryDepartures, setInvoluntaryDepartures] = useState<number>(4);
  const [avgAnnualSalary, setAvgAnnualSalary] = useState<number>(75000);
  const [replacementCostFactor, setReplacementCostFactor] = useState<number>(75); // 75% of salary on average

  const totalDepartures = voluntaryDepartures + involuntaryDepartures;
  const averageEmployees = (startingEmployees + endingEmployees) / 2;
  
  // Turnover rate = (departures / average employees) * 100
  const turnoverRate = averageEmployees > 0 ? (totalDepartures / averageEmployees) * 100 : 0;
  
  // Retention rate = ((ending employees - new additions) / starting employees) * 100
  // Approximation of Retention = (Average - Departures) / Average or 100 - Turnover.
  // Standard formula: ((Starting - Departures) / Starting) * 100
  const retentionRate = startingEmployees > 0 
    ? Math.max(0, ((startingEmployees - totalDepartures) / startingEmployees) * 100) 
    : 0;

  // Replacement cost breakdown
  const replacementCostPerEmployee = avgAnnualSalary * (replacementCostFactor / 100);
  const totalReplacementCost = totalDepartures * replacementCostPerEmployee;
  const directRecruitmentCost = totalReplacementCost * 0.4; // 40% agency/ads
  const trainingOnboardingCost = totalReplacementCost * 0.25; // 25% training
  const lostProductivityCost = totalReplacementCost * 0.35; // 35% lost productivity/gap

  // Turnover rate health indicator
  let statusText = "Healthy";
  let statusColor = "text-emerald-500 bg-emerald-700/10 border-emerald-500/20";
  let statusIcon = <CheckCircle className="w-5 h-5 text-emerald-500" />;
  let recommendation = "Your turnover rate is below the national average (~15%). Focus on continuous feedback loops, professional development, and maintaining your excellent work environment.";

  if (turnoverRate > 20) {
    statusText = "High (Critical Alert)";
    statusColor = "text-[var(--accent)] bg-rose-500/10 border-rose-500/20";
    statusIcon = <AlertTriangle className="w-5 h-5 text-[var(--accent)]" />;
    recommendation = "Critical level. Conduct detailed exit interviews immediately to trace root causes (e.g. poor management, low compensation, burnout). Implement employee retention surveys, and review your market compensation competitiveness.";
  } else if (turnoverRate > 10) {
    statusText = "Moderate (Needs Attention)";
    statusColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
    statusIcon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
    recommendation = "Standard level. Introduce quarterly stay interviews, review career growth pathways, ensure managers are coached on team leadership, and check if workloads are balanced.";
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* Title */}
      <div className="bg-[var(--bg-overlay)] p-5 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-[var(--accent)]" />
          Employee Turnover & Retention Calculator
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Measure staff retention, estimate financial replacement impacts, and receive HR recommendations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Panel */}
        <div className="lg:col-span-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-subtle)] dark:border-zinc-800 pb-2">
            Workforce Details
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Starting Headcount */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Starting Employees</label>
                <input 
                  type="number" value={startingEmployees} 
                  onChange={e => setStartingEmployees(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-[var(--text-primary)] font-bold outline-none text-sm"
                />
              </div>

              {/* Ending Headcount */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Ending Employees</label>
                <input 
                  type="number" value={endingEmployees} 
                  onChange={e => setEndingEmployees(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-[var(--text-primary)] font-bold outline-none text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Voluntary */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">Voluntary Quits</label>
                <input 
                  type="number" value={voluntaryDepartures} 
                  onChange={e => setVoluntaryDepartures(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-[var(--text-primary)] font-bold outline-none text-sm"
                />
              </div>

              {/* Involuntary */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Involuntary Layoffs</label>
                <input 
                  type="number" value={involuntaryDepartures} 
                  onChange={e => setInvoluntaryDepartures(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-[var(--text-primary)] font-bold outline-none text-sm"
                />
              </div>
            </div>

            {/* Average Annual Salary */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Avg Annual Salary of Departing Staff</label>
              <div className="relative">
                <input 
                  type="number" value={avgAnnualSalary} 
                  onChange={e => setAvgAnnualSalary(Math.max(1000, parseInt(e.target.value) || 0))}
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] dark:border-zinc-800 rounded-xl px-4 py-2.5 text-[var(--text-primary)] font-bold outline-none text-sm"
                />
                <span className="absolute right-4 top-3 text-[var(--text-muted)] text-xs">$</span>
              </div>
            </div>

            {/* Cost multiplier factor */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)]">
                <span>Replacement Cost Factor (% of salary)</span>
                <span className="text-[var(--text-primary)]">{replacementCostFactor}%</span>
              </div>
              <input 
                type="range" min="15" max="200" step="5" value={replacementCostFactor} 
                onChange={e => setReplacementCostFactor(parseInt(e.target.value))} 
                className="w-full accent-indigo-650"
              />
              <p className="text-[10px] text-[var(--text-muted)]">Standard range is 50% for entry roles, up to 150% for senior leadership roles.</p>
            </div>
          </div>
        </div>

        {/* Results & Calculations Panel */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Turnover Rate */}
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Turnover Rate</span>
                <h4 className="text-2xl font-black text-[var(--accent)] mt-1">
                  {turnoverRate.toFixed(1)}%
                </h4>
              </div>
              <div className={`mt-3 border px-2 py-1 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 ${statusColor}`}>
                {statusIcon}
                <span>{statusText}</span>
              </div>
            </div>

            {/* Retention Rate */}
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Retention Rate</span>
                <h4 className="text-2xl font-black text-emerald-500 mt-1">
                  {retentionRate.toFixed(1)}%
                </h4>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] mt-3 block">Percentage of starting workforce retained.</span>
            </div>

            {/* Estimated Total Loss */}
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Financial Loss</span>
                <h4 className="text-2xl font-black text-[var(--accent)] mt-1">
                  ${Math.round(totalReplacementCost).toLocaleString()}
                </h4>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] mt-3 block">
                Total replacement cost for {totalDepartures} workers.
              </span>
            </div>

          </div>

          {/* Replacement Cost Breakdown */}
          {totalReplacementCost > 0 && (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider pb-2 border-b border-[var(--border-subtle)] dark:border-zinc-800">
                Turnover Financial Breakdown
              </h3>
              
              <div className="space-y-3">
                {/* Recruitment */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[var(--text-secondary)]">Recruiting & Agencies (40%)</span>
                    <span className="text-zinc-900 dark:text-[var(--text-secondary)]">${Math.round(directRecruitmentCost).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-[var(--bg-surface)] h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>

                {/* Training */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[var(--text-secondary)]">Onboarding & Ramp-up Training (25%)</span>
                    <span className="text-zinc-900 dark:text-[var(--text-secondary)]">${Math.round(trainingOnboardingCost).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-[var(--bg-surface)] h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '25%' }} />
                  </div>
                </div>

                {/* Productivity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[var(--text-secondary)]">Lost Productivity & Vacancy Costs (35%)</span>
                    <span className="text-zinc-900 dark:text-[var(--text-secondary)]">${Math.round(lostProductivityCost).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-[var(--bg-surface)] h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '35%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actionable Recommendations */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider pb-2 border-b border-[var(--border-subtle)] dark:border-zinc-800 flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              Culture & Retention Advisory
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
              {recommendation}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
