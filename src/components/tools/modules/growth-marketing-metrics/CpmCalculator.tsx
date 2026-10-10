"use client";
import React, { useState } from 'react';
import { Target, DollarSign, TrendingUp, Calculator } from 'lucide-react';
import { useParams } from 'next/navigation';
import { CalcActions } from '../shared/CalcActions';

const platformPresets: Record<string, { cpm: number; rpm: number; note: string }> = {
  'youtube': { cpm: 3.50, rpm: 1.50, note: 'YouTube: CPM varies by niche (gaming ~$2, finance ~$12). RPM ~40-55% of CPM after ad rev share.' },
  'twitch': { cpm: 4.00, rpm: 2.50, note: 'Twitch: CPM for pre-roll/mid-roll ads. RPM includes subs/bits revenue share. Varies by region.' },
  'facebook': { cpm: 6.00, rpm: 3.00, note: 'Facebook: In-stream ad CPM is higher than feed. RPM includes bonus programs.' },
  'instagram': { cpm: 8.00, rpm: 4.50, note: 'Instagram: Reels ads have lower CPM than feed/stories. Influencer RPM includes branded content.' },
  'tiktok': { cpm: 1.50, rpm: 0.75, note: 'TikTok: Lower CPM but higher volume. Creator Fund RPM is ~2-4 cents per 1K views.' },
  'twitter': { cpm: 5.00, rpm: 2.50, note: 'Twitter/X: Amplify pre-roll CPM. RPM split varies by ad placement.' },
  'linkedin': { cpm: 9.00, rpm: 5.00, note: 'LinkedIn: Highest CPM among social platforms due to professional targeting. RPM after platform cut.' },
};

type Mode = 'cpm' | 'rpm' | 'estimate';

export default function CpmCalculator() {
  const params = useParams();
  const slug = typeof params?.tool === 'string' ? params.tool : '';
  const [mode, setMode] = useState<Mode>(slug.startsWith('rpm') ? 'rpm' : 'cpm');
  const [platform, setPlatform] = useState<string>('custom');
  const [cost, setCost] = useState(500);
  const [impressions, setImpressions] = useState(100000);
  const [revenue, setRevenue] = useState(150);
  const [estViews, setEstViews] = useState(100000);
  const [estCpm, setEstCpm] = useState(5);
  const [estRpm, setEstRpm] = useState(2);

  const [prevPlatform, setPrevPlatform] = useState(platform);
  if (prevPlatform !== platform) {
    setPrevPlatform(platform);
    if (platform !== 'custom') {
      setEstCpm(platformPresets[platform]!.cpm);
      setEstRpm(platformPresets[platform]!.rpm);
    }
  }

  const cpm = impressions > 0 ? (cost / impressions) * 1000 : 0;
  const rpm = impressions > 0 ? (revenue / impressions) * 1000 : 0;

  const estimatedAdCost = (estCpm * estViews) / 1000;
  const estimatedEarnings = (estRpm * estViews) / 1000;

  const platformLabel = platform !== 'custom' ? platformPresets[platform]?.note?.split(':')[0] : '';
  const presetCpm = platform !== 'custom' ? platformPresets[platform]?.cpm : null;
  const presetRpm = platform !== 'custom' ? platformPresets[platform]?.rpm : null;

  const mainResult = mode === 'cpm' ? `$${cpm.toFixed(2)}` : mode === 'rpm' ? `$${rpm.toFixed(2)}` : `$${estimatedAdCost.toFixed(2)}`;
  const csvData = mode === 'estimate'
    ? `Metric,Value\nEstimated Ad Cost,$${estimatedAdCost.toFixed(2)}\nEstimated Earnings,$${estimatedEarnings.toFixed(2)}\nViews,${estViews}`
    : `Metric,Value\nCPM,$${cpm.toFixed(2)}\nRPM,$${rpm.toFixed(2)}\nImpressions,${impressions}`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header with tabs */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-violet-500" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            {mode === 'cpm' ? 'CPM' : mode === 'rpm' ? 'RPM' : 'Earnings'} Calculator
          </h3>
        </div>
        <div className="flex bg-[var(--bg-surface)] rounded-xl p-1">
          <button onClick={() => setMode('cpm')} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${mode === 'cpm' ? 'bg-[var(--bg-elevated)] text-violet-600 dark:text-violet-400 shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>CPM</button>
          <button onClick={() => setMode('rpm')} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${mode === 'rpm' ? 'bg-[var(--bg-elevated)] text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>RPM</button>
          <button onClick={() => setMode('estimate')} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${mode === 'estimate' ? 'bg-[var(--bg-elevated)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Estimate</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          {/* Platform Preset */}
          <div className="space-y-1">
            <label htmlFor="lbl-cpmcalculator-platform-preset" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Platform Preset</label>
            <select id="lbl-cpmcalculator-platform-preset" aria-label="Platform Preset" value={platform} onChange={e => setPlatform(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 appearance-none cursor-pointer">
              <option value="custom">Custom (manual entry)</option>
              <option value="youtube">YouTube</option>
              <option value="twitch">Twitch</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="twitter">Twitter / X</option>
              <option value="linkedin">LinkedIn</option>
            </select>
            {platform !== 'custom' && (
              <p className="text-[11px] text-[var(--text-muted)] mt-1">{platformPresets[platform]!.note}</p>
            )}
          </div>

          {mode === 'cpm' ? (
            <>
              <div className="space-y-1">
                <label htmlFor="lbl-cpmcalculator-total-ad-campaign-cost" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Ad Campaign Cost ($)</label>
                <input id="lbl-cpmcalculator-total-ad-campaign-cost" aria-label="Total Ad Campaign Cost ($)" type="number" value={cost} onChange={e => setCost(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
                {presetCpm && <p className="text-[11px] text-[var(--text-muted)]">Avg. {platformLabel} CPM: ${presetCpm.toFixed(2)}</p>}
              </div>
              <div className="space-y-1">
                <label htmlFor="lbl-cpmcalculator-total-ad-impressions-delivered" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Ad Impressions Delivered</label>
                <input id="lbl-cpmcalculator-total-ad-impressions-delivered" aria-label="Total Ad Impressions Delivered" type="number" value={impressions} onChange={e => setImpressions(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
              </div>
            </>
          ) : mode === 'rpm' ? (
            <>
              <div className="space-y-1">
                <label htmlFor="lbl-cpmcalculator-total-creator-revenue" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Creator Revenue ($)</label>
                <input id="lbl-cpmcalculator-total-creator-revenue" aria-label="Total Creator Revenue ($)" type="number" value={revenue} onChange={e => setRevenue(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
                {presetRpm && <p className="text-[11px] text-[var(--text-muted)]">Avg. {platformLabel} RPM: ${presetRpm.toFixed(2)}</p>}
              </div>
              <div className="space-y-1">
                <label htmlFor="lbl-cpmcalculator-total-views-impressions" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Views / Impressions</label>
                <input id="lbl-cpmcalculator-total-views-impressions" aria-label="Total Views / Impressions" type="number" value={impressions} onChange={e => setImpressions(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <label htmlFor="lbl-cpmcalculator-total-views-impressions-6" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Views / Impressions</label>
                <input id="lbl-cpmcalculator-total-views-impressions-6" aria-label="Total Views / Impressions" type="number" value={estViews} onChange={e => setEstViews(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
              </div>
              <div className="space-y-1">
                <label htmlFor="lbl-cpmcalculator-average-cpm" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Average CPM ($) <span className="font-normal text-[var(--text-muted)]">(cost per 1K)</span></label>
                <input id="lbl-cpmcalculator-average-cpm" aria-label="Average CPM ($) (cost per 1K)" type="number" value={estCpm} onChange={e => setEstCpm(Math.max(0, parseFloat(e.target.value) || 0))} step="0.1" className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
                {presetCpm && <p className="text-[11px] text-[var(--text-muted)]">Avg. {platformLabel} CPM: ${presetCpm.toFixed(2)}</p>}
              </div>
              <div className="space-y-1">
                <label htmlFor="lbl-cpmcalculator-average-rpm" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Average RPM ($) <span className="font-normal text-[var(--text-muted)]">(earnings per 1K)</span></label>
                <input id="lbl-cpmcalculator-average-rpm" aria-label="Average RPM ($) (earnings per 1K)" type="number" value={estRpm} onChange={e => setEstRpm(Math.max(0, parseFloat(e.target.value) || 0))} step="0.1" className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
                {presetRpm && <p className="text-[11px] text-[var(--text-muted)]">Avg. {platformLabel} RPM: ${presetRpm.toFixed(2)}</p>}
              </div>
            </>
          )}
        </div>

        {/* Result */}
        <div className="space-y-4">
          {mode !== 'estimate' ? (
            <>
              <div className={`rounded-2xl p-6 border flex flex-col justify-center items-center min-h-[160px] ${mode === 'cpm' ? 'bg-violet-50 dark:bg-violet-950/20 border-violet-100 dark:border-violet-900/30' : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {mode === 'cpm' ? <Target className="w-4 h-4 text-violet-500" /> : <DollarSign className="w-4 h-4 text-emerald-500" />}
                  <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                    {mode === 'cpm' ? 'Cost Per 1,000 Impressions (CPM)' : 'Revenue Per 1,000 Impressions (RPM)'}
                  </span>
                </div>
                <p className={`text-5xl font-extrabold ${mode === 'cpm' ? 'text-violet-500' : 'text-emerald-500'}`}>
                  {mode === 'cpm' ? `$${cpm.toFixed(2)}` : `$${rpm.toFixed(2)}`}
                </p>
                {platform !== 'custom' && (
                  <p className="text-[11px] text-[var(--text-muted)] mt-2">
                    {platformLabel} avg: ${mode === 'cpm' ? (presetCpm ?? 0).toFixed(2) : (presetRpm ?? 0).toFixed(2)}
                  </p>
                )}
              </div>
              <CalcActions result={mainResult} downloadData={csvData} downloadFilename="cpm-results.csv" />

              {/* Show both metrics when in either mode */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)] text-center">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">CPM</span>
                  <p className="text-lg font-bold text-violet-500">${cpm.toFixed(2)}</p>
                </div>
                <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)] text-center">
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">RPM</span>
                  <p className="text-lg font-bold text-emerald-500">${rpm.toFixed(2)}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-2xl p-6 border bg-[var(--accent)]/10 dark:bg-[var(--accent)]/10 border-[var(--accent)]/20 dark:border-[var(--accent)]/20 flex flex-col justify-center items-center min-h-[160px]">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-[var(--accent)]" />
                  <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                    Estimated Advertiser Cost
                  </span>
                </div>
                <p className="text-5xl font-extrabold text-[var(--accent)]">
                  ${estimatedAdCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-2">
                  {estViews.toLocaleString()} views × ${estCpm.toFixed(2)} CPM
                </p>
              </div>

              <div className="rounded-2xl p-6 border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 flex flex-col justify-center items-center min-h-[160px]">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                    Estimated Creator Earnings
                  </span>
                </div>
                <p className="text-5xl font-extrabold text-emerald-500">
                  ${estimatedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-2">
                  {estViews.toLocaleString()} views × ${estRpm.toFixed(2)} RPM
                </p>
              </div>
              <CalcActions result={`Ad Cost: $${estimatedAdCost.toFixed(2)} | Earnings: $${estimatedEarnings.toFixed(2)}`} downloadData={csvData} downloadFilename="earnings-estimate.csv" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
