"use client";
import React, { useState } from 'react';
import { Target, DollarSign, TrendingUp, Calculator } from 'lucide-react';
import { useParams } from 'next/navigation';

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

  const cpm = impressions > 0 ? (cost / impressions) * 1000 : 0;
  const rpm = impressions > 0 ? (revenue / impressions) * 1000 : 0;

  const estimatedAdCost = (estCpm * estViews) / 1000;
  const estimatedEarnings = (estRpm * estViews) / 1000;

  const platformLabel = platform !== 'custom' ? platformPresets[platform]?.note?.split(':')[0] : '';
  const presetCpm = platform !== 'custom' ? platformPresets[platform]?.cpm : null;
  const presetRpm = platform !== 'custom' ? platformPresets[platform]?.rpm : null;

  React.useEffect(() => {
    if (platform !== 'custom') {
      setEstCpm(platformPresets[platform].cpm);
      setEstRpm(platformPresets[platform].rpm);
    }
  }, [platform]);

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      {/* Header with tabs */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-violet-500" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            {mode === 'cpm' ? 'CPM' : mode === 'rpm' ? 'RPM' : 'Earnings'} Calculator
          </h3>
        </div>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
          <button onClick={() => setMode('cpm')} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${mode === 'cpm' ? 'bg-white dark:bg-zinc-700 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'}`}>CPM</button>
          <button onClick={() => setMode('rpm')} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${mode === 'rpm' ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'}`}>RPM</button>
          <button onClick={() => setMode('estimate')} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${mode === 'estimate' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700'}`}>Estimate</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-5">
          {/* Platform Preset */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Platform Preset</label>
            <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm outline-none appearance-none cursor-pointer">
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
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">{platformPresets[platform].note}</p>
            )}
          </div>

          {mode === 'cpm' ? (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Ad Campaign Cost ($)</label>
                <input type="number" value={cost} onChange={e => setCost(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm outline-none" />
                {presetCpm && <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Avg. {platformLabel} CPM: ${presetCpm.toFixed(2)}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Ad Impressions Delivered</label>
                <input type="number" value={impressions} onChange={e => setImpressions(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm outline-none" />
              </div>
            </>
          ) : mode === 'rpm' ? (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Creator Revenue ($)</label>
                <input type="number" value={revenue} onChange={e => setRevenue(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm outline-none" />
                {presetRpm && <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Avg. {platformLabel} RPM: ${presetRpm.toFixed(2)}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Views / Impressions</label>
                <input type="number" value={impressions} onChange={e => setImpressions(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm outline-none" />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Views / Impressions</label>
                <input type="number" value={estViews} onChange={e => setEstViews(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Average CPM ($) <span className="font-normal text-zinc-400">(cost per 1K)</span></label>
                <input type="number" value={estCpm} onChange={e => setEstCpm(Math.max(0, parseFloat(e.target.value) || 0))} step="0.1" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm outline-none" />
                {presetCpm && <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Avg. {platformLabel} CPM: ${presetCpm.toFixed(2)}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Average RPM ($) <span className="font-normal text-zinc-400">(earnings per 1K)</span></label>
                <input type="number" value={estRpm} onChange={e => setEstRpm(Math.max(0, parseFloat(e.target.value) || 0))} step="0.1" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm outline-none" />
                {presetRpm && <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Avg. {platformLabel} RPM: ${presetRpm.toFixed(2)}</p>}
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
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                    {mode === 'cpm' ? 'Cost Per 1,000 Impressions (CPM)' : 'Revenue Per 1,000 Impressions (RPM)'}
                  </span>
                </div>
                <p className={`text-5xl font-extrabold ${mode === 'cpm' ? 'text-violet-500' : 'text-emerald-500'}`}>
                  ${(mode === 'cpm' ? cpm : rpm).toFixed(2)}
                </p>
                {platform !== 'custom' && (
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-2">
                    {platformLabel} avg: ${mode === 'cpm' ? (presetCpm ?? 0).toFixed(2) : (presetRpm ?? 0).toFixed(2)}
                  </p>
                )}
              </div>

              {/* Show both metrics when in either mode */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-50 dark:bg-black/30 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800 text-center">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">CPM</span>
                  <p className="text-lg font-bold text-violet-500">${cpm.toFixed(2)}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-black/30 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800 text-center">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">RPM</span>
                  <p className="text-lg font-bold text-emerald-500">${rpm.toFixed(2)}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-2xl p-6 border bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30 flex flex-col justify-center items-center min-h-[160px]">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                    Estimated Advertiser Cost
                  </span>
                </div>
                <p className="text-5xl font-extrabold text-blue-500">
                  ${estimatedAdCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-2">
                  {estViews.toLocaleString()} views × ${estCpm.toFixed(2)} CPM
                </p>
              </div>

              <div className="rounded-2xl p-6 border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 flex flex-col justify-center items-center min-h-[160px]">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                    Estimated Creator Earnings
                  </span>
                </div>
                <p className="text-5xl font-extrabold text-emerald-500">
                  ${estimatedEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-2">
                  {estViews.toLocaleString()} views × ${estRpm.toFixed(2)} RPM
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
