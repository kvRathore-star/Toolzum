"use client";
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Download, TrendingUp, TrendingDown, Users, DollarSign, Activity, BarChart3, Target, Zap, RefreshCw } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

interface SaaSMetrics {
  mrr: number; arr: number; arpu: number; ltv: number; cac: number;
  totalCustomers: number; customersLost: number; newCustomers: number;
  previousRevenue: number; currentRevenue: number;
  cashBalance: number; monthlyBurn: number;
  promoters: number; passives: number; detractors: number;
  controlVisitors: number; controlConversions: number;
  variantVisitors: number; variantConversions: number;
  totalTrials: number; paidConversions: number;
  scenarioMrrGrowth: number; scenarioChurnReduction: number; scenarioCacReduction: number;
}

const defaultMetrics: SaaSMetrics = {
  mrr: 50000, arr: 600000, arpu: 50, ltv: 1000, cac: 200,
  totalCustomers: 1000, customersLost: 50, newCustomers: 80,
  previousRevenue: 450000, currentRevenue: 600000,
  cashBalance: 2000000, monthlyBurn: 120000,
  promoters: 200, passives: 100, detractors: 50,
  controlVisitors: 10000, controlConversions: 500,
  variantVisitors: 10000, variantConversions: 600,
  totalTrials: 1000, paidConversions: 200,
  scenarioMrrGrowth: 15, scenarioChurnReduction: 20, scenarioCacReduction: 15,
};

function kpiColor(value: number, thresholds: [number, number]): string {
  if (value >= thresholds[1]) return 'text-emerald-400';
  if (value >= thresholds[0]) return 'text-amber-400';
  return 'text-red-400';
}

function formatCurrency(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function NpsGauge({ score }: { score: number }) {
  const angle = ((score + 100) / 200) * 180;
  const rad = (angle - 90) * Math.PI / 180;
  const r = 60, cx = 80, cy = 70;
  const x = cx + r * Math.cos(rad);
  const y = cy + r * Math.sin(rad);
  const color = score >= 50 ? '#34d399' : score >= 0 ? '#fbbf24' : '#f87171';
  return (
    <svg width="160" height="90" viewBox="0 0 160 90" className="mx-auto">
      <path d="M10 70 A70 70 0 0 1 150 70" fill="none" stroke="#1f2937" strokeWidth="12" strokeLinecap="round"/>
      <path d="M10 70 A70 70 0 0 1 150 70" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(score + 100) / 200 * 220} 220`}/>
      <line x1={cx} y1={cy} x2={x} y2={y} stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r="4" fill={color}/>
      <text x="80" y="85" textAnchor="middle" className="fill-current text-lg font-bold" fill={color}>{score > 0 ? '+' : ''}{score.toFixed(0)}</text>
    </svg>
  );
}

function MiniBar({ values, color, height = 40 }: { values: number[]; color: string; height?: number }) {
  const max = Math.max(...values, 1);
  const w = Math.max(8, Math.min(24, 160 / values.length - 4));
  return (
    <svg width="160" height={height} viewBox={`0 0 160 ${height}`}>
      {values.map((v, i) => (
        <rect key={i} x={i * (w + 4) + 4} y={height - (v / max) * (height - 4)} width={w} height={(v / max) * (height - 4)} rx="3" fill={color} opacity="0.8"/>
      ))}
    </svg>
  );
}

const inputClass = "w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-[var(--text-primary)]";
const labelClass = "block text-xs font-medium mb-1 text-[var(--text-secondary)]";

function MetricInput({ label, value, onChange, prefix, step }: { label: string; value: number; onChange: (v: number) => void; prefix?: string; step?: string }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-tertiary)]">{prefix}</span>}
        <input type="number" value={value} step={step || '1'} onChange={e => onChange(Number(e.target.value))} className={`${inputClass} ${prefix ? 'pl-7' : ''}`} />
      </div>
    </div>
  );
}

function KpiCard({ label, value, suffix, color, icon, subtitle }: { label: string; value: string; suffix?: string; color: string; icon: React.ReactNode; subtitle?: string }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-tertiary)]">{label}</span>
        <span className={`${color}`}>{icon}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}{suffix && <span className="text-sm text-[var(--text-tertiary)] ml-1">{suffix}</span>}</div>
      {subtitle && <div className="text-[10px] text-[var(--text-muted)]">{subtitle}</div>}
    </div>
  );
}

export function SaaSMetricsDashboard() {
  const [m, setM] = useState<SaaSMetrics>(defaultMetrics);
  const dashRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const update = useCallback(<K extends keyof SaaSMetrics>(key: K) => (val: number) => {
    setM(prev => ({ ...prev, [key]: val }));
  }, []);

  const reset = useCallback(() => setM(defaultMetrics), []);

  const churnRate = useMemo(() => m.totalCustomers ? (m.customersLost / m.totalCustomers) * 100 : 0, [m.customersLost, m.totalCustomers]);
  const npsScore = useMemo(() => {
    const total = m.promoters + m.passives + m.detractors;
    return total ? ((m.promoters / total) - (m.detractors / total)) * 100 : 0;
  }, [m.promoters, m.passives, m.detractors]);
  const revenueGrowth = useMemo(() => m.previousRevenue ? ((m.currentRevenue - m.previousRevenue) / m.previousRevenue) * 100 : 0, [m.currentRevenue, m.previousRevenue]);
  const runwayMonths = useMemo(() => m.monthlyBurn ? m.cashBalance / m.monthlyBurn : 0, [m.cashBalance, m.monthlyBurn]);
  const ltvCac = useMemo(() => m.cac ? m.ltv / m.cac : 0, [m.ltv, m.cac]);
  const quickRatio = useMemo(() => m.customersLost ? m.newCustomers / m.customersLost : m.newCustomers > 0 ? 99 : 0, [m.newCustomers, m.customersLost]);
  const ruleOf40 = useMemo(() => revenueGrowth + (m.cac ? (m.ltv / m.cac) * 10 : 0), [revenueGrowth, m.ltv, m.cac]);
  const trialConvRate = useMemo(() => m.totalTrials ? (m.paidConversions / m.totalTrials) * 100 : 0, [m.totalTrials, m.paidConversions]);
  const abControlRate = useMemo(() => m.controlVisitors ? (m.controlConversions / m.controlVisitors) * 100 : 0, [m.controlVisitors, m.controlConversions]);
  const abVariantRate = useMemo(() => m.variantVisitors ? (m.variantConversions / m.variantVisitors) * 100 : 0, [m.variantVisitors, m.variantConversions]);
  const abImprovement = useMemo(() => abControlRate ? ((abVariantRate - abControlRate) / abControlRate) * 100 : 0, [abControlRate, abVariantRate]);

  // Scenario projections
  const scenarioData = useMemo(() => {
    const projectedMrr = m.mrr * (1 + m.scenarioMrrGrowth / 100);
    const projectedChurn = churnRate * (1 - m.scenarioChurnReduction / 100);
    const projectedCac = m.cac * (1 - m.scenarioCacReduction / 100);
    const projectedLtv = m.arpu / (projectedChurn / 100 || 0.01);
    const projectedLtvCac = projectedCac ? projectedLtv / projectedCac : 0;
    return { projectedMrr, projectedChurn, projectedCac, projectedLtv, projectedLtvCac };
  }, [m.mrr, m.scenarioMrrGrowth, churnRate, m.scenarioChurnReduction, m.cac, m.scenarioCacReduction, m.arpu]);

  const exportPdf = useCallback(async () => {
    if (!dashRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toJpeg(dashRef.current, { quality: 0.95, backgroundColor: '#0f0f13', pixelRatio: 2 });
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgW = 210;
      const imgH = (img.naturalHeight / img.naturalWidth) * imgW;
      pdf.addImage(dataUrl, 'JPEG', 0, 0, imgW, imgH);
      if (imgH > pdf.internal.pageSize.getHeight()) {
        pdf.addPage();
        pdf.addImage(dataUrl, 'JPEG', 0, -pdf.internal.pageSize.getHeight(), imgW, imgH);
      }
      pdf.save('saas-metrics-dashboard.pdf');
    } catch { /* ignore */ }
    setExporting(false);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6" ref={dashRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">SaaS Metrics Dashboard</h1>
            <p className="text-xs text-[var(--text-tertiary)]">All your key metrics in one place. Data stays in your browser.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors" title="Reset to defaults">
            <RefreshCw size={16} />
          </button>
          <button onClick={exportPdf} disabled={exporting} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-sm font-medium transition-all active:scale-95 shadow-lg disabled:opacity-50">
            <Download size={16} />
            {exporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Monthly Recurring Revenue" value={formatCurrency(m.mrr)} icon={<TrendingUp size={16} />} color={kpiColor(revenueGrowth, [10, 30])} subtitle={`${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}% vs last period`} />
        <KpiCard label="Annual Recurring Revenue" value={formatCurrency(m.arr)} icon={<DollarSign size={16} />} color="text-blue-400" subtitle={`${(m.arr / m.mrr / 12 * 100).toFixed(0)}% of target`} />
        <KpiCard label="Net Promoter Score" value={npsScore > 0 ? `+${npsScore.toFixed(0)}` : npsScore.toFixed(0)} icon={<Activity size={16} />} color={kpiColor(npsScore, [0, 50])} subtitle={`${m.promoters} promoters · ${m.detractors} detractors`} />
        <KpiCard label="Runway" value={runwayMonths < 12 ? `${runwayMonths.toFixed(1)}` : `${(runwayMonths / 12).toFixed(1)}yr`} suffix="months" icon={<Target size={16} />} color={kpiColor(runwayMonths, [6, 18])} subtitle={`$${(m.cashBalance / 1_000_000).toFixed(1)}M · $${(m.monthlyBurn / 1_000).toFixed(0)}K/mo`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inputs Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Revenue */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2"><DollarSign size={14} className="text-emerald-400" /> Revenue</h2>
            <MetricInput label="MRR ($)" value={m.mrr} onChange={update('mrr')} prefix="$" />
            <MetricInput label="ARR ($)" value={m.arr} onChange={update('arr')} prefix="$" />
            <MetricInput label="Previous Period Revenue ($)" value={m.previousRevenue} onChange={update('previousRevenue')} prefix="$" />
            <MetricInput label="Current Period Revenue ($)" value={m.currentRevenue} onChange={update('currentRevenue')} prefix="$" />
            <MetricInput label="ARPU ($/mo)" value={m.arpu} onChange={update('arpu')} prefix="$" />
          </div>

          {/* Customers */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2"><Users size={14} className="text-blue-400" /> Customers</h2>
            <MetricInput label="Total Customers" value={m.totalCustomers} onChange={update('totalCustomers')} />
            <MetricInput label="New Customers (this period)" value={m.newCustomers} onChange={update('newCustomers')} />
            <MetricInput label="Customers Lost (churned)" value={m.customersLost} onChange={update('customersLost')} />
            <MetricInput label="LTV ($)" value={m.ltv} onChange={update('ltv')} prefix="$" />
            <MetricInput label="CAC ($)" value={m.cac} onChange={update('cac')} prefix="$" />
          </div>

          {/* Health */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2"><Activity size={14} className="text-purple-400" /> Health & Runway</h2>
            <MetricInput label="Cash Balance ($)" value={m.cashBalance} onChange={update('cashBalance')} prefix="$" />
            <MetricInput label="Monthly Burn ($)" value={m.monthlyBurn} onChange={update('monthlyBurn')} prefix="$" />
            <MetricInput label="Promoters (9-10)" value={m.promoters} onChange={update('promoters')} />
            <MetricInput label="Passives (7-8)" value={m.passives} onChange={update('passives')} />
            <MetricInput label="Detractors (0-6)" value={m.detractors} onChange={update('detractors')} />
          </div>

          {/* Experimentation */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2"><Zap size={14} className="text-amber-400" /> Experimentation</h2>
            <MetricInput label="A/B Control Visitors" value={m.controlVisitors} onChange={update('controlVisitors')} />
            <MetricInput label="A/B Control Conversions" value={m.controlConversions} onChange={update('controlConversions')} />
            <MetricInput label="A/B Variant Visitors" value={m.variantVisitors} onChange={update('variantVisitors')} />
            <MetricInput label="A/B Variant Conversions" value={m.variantConversions} onChange={update('variantConversions')} />
            <MetricInput label="Total Trials" value={m.totalTrials} onChange={update('totalTrials')} />
            <MetricInput label="Paid Conversions" value={m.paidConversions} onChange={update('paidConversions')} />
          </div>
        </div>

        {/* Dashboard Output */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer Economics */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5">
            <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4">Customer Economics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[var(--bg-surface)] rounded-xl p-3">
                <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide">Churn Rate</div>
                <div className={`text-lg font-bold mt-1 ${kpiColor(100 - churnRate, [90, 95])}`}>{churnRate.toFixed(2)}%</div>
                <div className="text-[10px] text-[var(--text-muted)]">{m.customersLost} of {m.totalCustomers} customers lost</div>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3">
                <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide">LTV / CAC</div>
                <div className={`text-lg font-bold mt-1 ${kpiColor(ltvCac, [3, 5])}`}>{ltvCac.toFixed(1)}x</div>
                <div className="text-[10px] text-[var(--text-muted)]">Target: 3x+</div>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3">
                <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide">Quick Ratio</div>
                <div className={`text-lg font-bold mt-1 ${kpiColor(quickRatio, [1, 2])}`}>{quickRatio.toFixed(2)}x</div>
                <div className="text-[10px] text-[var(--text-muted)]">{m.newCustomers} new / {m.customersLost} lost</div>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-3">
                <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide">Rule of 40</div>
                <div className={`text-lg font-bold mt-1 ${kpiColor(ruleOf40, [30, 40])}`}>{ruleOf40.toFixed(1)}%</div>
                <div className="text-[10px] text-[var(--text-muted)]">Growth + Profitability</div>
              </div>
            </div>
          </div>

          {/* NPS Gauge + Revenue Growth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-center">
              <h2 className="text-sm font-bold text-[var(--text-primary)] mb-2">NPS Score</h2>
              <NpsGauge score={npsScore} />
              <div className="flex justify-center gap-6 mt-2 text-xs">
                <div><span className="text-emerald-400 font-bold">{(m.totalCustomers ? (m.promoters / m.totalCustomers * 100) : 0).toFixed(0)}%</span> Promoters</div>
                <div><span className="text-amber-400 font-bold">{(m.totalCustomers ? (m.passives / m.totalCustomers * 100) : 0).toFixed(0)}%</span> Passives</div>
                <div><span className="text-red-400 font-bold">{(m.totalCustomers ? (m.detractors / m.totalCustomers * 100) : 0).toFixed(0)}%</span> Detractors</div>
              </div>
            </div>
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5">
              <h2 className="text-sm font-bold text-[var(--text-primary)] mb-2">Revenue Growth</h2>
              <div className={`text-3xl font-bold ${kpiColor(revenueGrowth, [10, 30])}`}>{revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">${m.previousRevenue.toLocaleString()} → ${m.currentRevenue.toLocaleString()}</div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-tertiary)] w-20">ARR Growth</span>
                  <div className="flex-1 h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, revenueGrowth * 3))}%` }} />
                  </div>
                  <span className="text-xs font-mono text-[var(--text-secondary)]">${(m.arr - m.mrr * 12 || 0) > 0 ? '+' : ''}{((m.arr - m.mrr * 12) / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-tertiary)] w-20">MRR Growth</span>
                  <div className="flex-1 h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, (m.mrr - 10000) / 900 * 100))}%` }} />
                  </div>
                  <span className="text-xs font-mono text-[var(--text-secondary)]">${(m.mrr / 1000).toFixed(1)}K</span>
                </div>
              </div>
            </div>
          </div>

          {/* A/B Test & Trial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5">
              <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">A/B Test Results</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-[var(--text-tertiary)]">Control</span><span className="font-mono">{(abControlRate * 100).toFixed(2)}%</span></div>
                <div className="flex justify-between text-xs"><span className="text-[var(--text-tertiary)]">Variant</span><span className="font-mono">{(abVariantRate * 100).toFixed(2)}%</span></div>
                <div className="flex justify-between text-xs font-bold"><span>Improvement</span><span className={abImprovement >= 0 ? 'text-emerald-400' : 'text-red-400'}>{abImprovement >= 0 ? '+' : ''}{abImprovement.toFixed(2)}%</span></div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-3 bg-[var(--bg-surface)] rounded-full overflow-hidden flex">
                  <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, abControlRate * 100)}%` }} />
                </div>
                <div className="flex-1 h-3 bg-[var(--bg-surface)] rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, abVariantRate * 100)}%` }} />
                </div>
              </div>
            </div>
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5">
              <h2 className="text-sm font-bold text-[var(--text-primary)] mb-3">Trial Conversion</h2>
              <div className={`text-3xl font-bold ${kpiColor(trialConvRate, [5, 15])}`}>{trialConvRate.toFixed(1)}%</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">{m.paidConversions} paid from {m.totalTrials} trials</div>
              <MiniBar values={[5, 8, 12, 15, 18, 22, 25, 20, 24, trialConvRate].map(v => v / 30)} color="#34d399" />
            </div>
          </div>

          {/* Scenario Modeling */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5">
            <h2 className="text-sm font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2"><RefreshCw size={14} className="text-indigo-400" /> Scenario Modeling</h2>
            <p className="text-xs text-[var(--text-tertiary)] mb-4">Adjust assumptions below to see how changes impact your metrics.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className={labelClass}>MRR Growth Rate</label>
                <div className="flex items-center gap-2">
                  <input type="range" min="-20" max="50" value={m.scenarioMrrGrowth} onChange={e => setM(p => ({ ...p, scenarioMrrGrowth: Number(e.target.value) }))} className="flex-1 accent-indigo-500" />
                  <span className="text-sm font-mono w-12 text-right text-[var(--text-primary)]">{m.scenarioMrrGrowth >= 0 ? '+' : ''}{m.scenarioMrrGrowth}%</span>
                </div>
              </div>
              <div>
                <label className={labelClass}>Churn Reduction</label>
                <div className="flex items-center gap-2">
                  <input type="range" min="0" max="80" value={m.scenarioChurnReduction} onChange={e => setM(p => ({ ...p, scenarioChurnReduction: Number(e.target.value) }))} className="flex-1 accent-indigo-500" />
                  <span className="text-sm font-mono w-12 text-right text-[var(--text-primary)]">{m.scenarioChurnReduction}%</span>
                </div>
              </div>
              <div>
                <label className={labelClass}>CAC Reduction</label>
                <div className="flex items-center gap-2">
                  <input type="range" min="0" max="80" value={m.scenarioCacReduction} onChange={e => setM(p => ({ ...p, scenarioCacReduction: Number(e.target.value) }))} className="flex-1 accent-indigo-500" />
                  <span className="text-sm font-mono w-12 text-right text-[var(--text-primary)]">{m.scenarioCacReduction}%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="bg-[var(--bg-surface)] rounded-lg p-2.5 text-center">
                <div className="text-[9px] text-[var(--text-tertiary)] uppercase">Projected MRR</div>
                <div className="text-xs font-bold text-emerald-400">{formatCurrency(scenarioData.projectedMrr)}</div>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-lg p-2.5 text-center">
                <div className="text-[9px] text-[var(--text-tertiary)] uppercase">Projected Churn</div>
                <div className="text-xs font-bold" style={{ color: scenarioData.projectedChurn < churnRate ? '#34d399' : '#f87171' }}>{scenarioData.projectedChurn.toFixed(2)}%</div>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-lg p-2.5 text-center">
                <div className="text-[9px] text-[var(--text-tertiary)] uppercase">Projected LTV</div>
                <div className="text-xs font-bold text-blue-400">{formatCurrency(scenarioData.projectedLtv)}</div>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-lg p-2.5 text-center">
                <div className="text-[9px] text-[var(--text-tertiary)] uppercase">Projected CAC</div>
                <div className="text-xs font-bold" style={{ color: scenarioData.projectedCac < m.cac ? '#34d399' : '#f87171' }}>{formatCurrency(scenarioData.projectedCac)}</div>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-lg p-2.5 text-center">
                <div className="text-[9px] text-[var(--text-tertiary)] uppercase">LTV / CAC</div>
                <div className={`text-xs font-bold ${kpiColor(scenarioData.projectedLtvCac, [3, 5])}`}>{scenarioData.projectedLtvCac.toFixed(1)}x</div>
              </div>
            </div>
          </div>

          {/* Privacy Banner */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-4 text-center">
            <p className="text-xs text-[var(--text-tertiary)]">
              <span className="text-emerald-400 font-bold">🔒 Privacy First</span> — All your financial data stays in your browser. Nothing is saved, uploaded, or sent to any server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
