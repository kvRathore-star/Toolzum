"use client";

import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, TrendingDown, ShoppingBag, Download, Upload, BarChart3, IndianRupee, Percent, Package, Truck, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

type Platform = 'meesho' | 'amazon' | 'flipkart';

const PLATFORM_DATA: Record<Platform, { label: string; minComm: number; maxComm: number; closingFee: number; shippingSubsidy: number }> = {
  meesho: { label: 'Meesho', minComm: 0, maxComm: 15, closingFee: 5, shippingSubsidy: 40 },
  amazon: { label: 'Amazon', minComm: 2, maxComm: 35, closingFee: 15, shippingSubsidy: 25 },
  flipkart: { label: 'Flipkart', minComm: 5, maxComm: 25, closingFee: 10, shippingSubsidy: 30 },
};

function formatINR(n: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

interface ProductCalc {
  productCost: number; sellingPrice: number; platform: Platform; commissionPct: number;
  gstPct: number; shippingCost: number; packagingCost: number; returnRate: number;
  fixedFee: number;
}

function calculate(c: ProductCalc) {
  const platform = PLATFORM_DATA[c.platform];
  const commissionAmt = c.sellingPrice * c.commissionPct / 100;
  const gstAmt = c.sellingPrice * c.gstPct / 100;
  const returnCost = c.sellingPrice * c.returnRate / 100;
  const totalFees = commissionAmt + gstAmt + c.shippingCost + c.packagingCost + returnCost + c.fixedFee;
  const netProfit = c.sellingPrice - c.productCost - totalFees;
  const marginPct = c.sellingPrice > 0 ? (netProfit / c.sellingPrice) * 100 : 0;
  const breakevenPrice = c.productCost + totalFees;
  return { netProfit, marginPct, breakevenPrice, commissionAmt, gstAmt, totalFees, returnCost };
}

export default function SellerProfitCalculator() {
  const [input, setInput] = useState<ProductCalc>({
    productCost: 200, sellingPrice: 499, platform: 'meesho', commissionPct: 10,
    gstPct: 18, shippingCost: 50, packagingCost: 15, returnRate: 5, fixedFee: 0,
  });
  const [comparePlatform, setComparePlatform] = useState(false);

  const update = (key: keyof ProductCalc, val: string | Platform) => {
    setInput(prev => ({ ...prev, [key]: typeof val === 'string' && key !== 'platform' ? Math.max(0, parseFloat(val) || 0) : val }));
  };

  const result = useMemo(() => calculate(input), [input]);

  const comparison = useMemo(() => {
    if (!comparePlatform) return null;
    const otherPlatforms = (['meesho', 'amazon', 'flipkart'] as Platform[]).filter(p => p !== input.platform);
    return otherPlatforms.map(p => calculate({ ...input, platform: p }));
  }, [input, comparePlatform]);

  const handleExport = () => {
    const lines = [
      '=== Seller Profit Calculator Report ===',
      `Product Cost: ${formatINR(input.productCost)}`,
      `Selling Price: ${formatINR(input.sellingPrice)}`,
      `Platform: ${PLATFORM_DATA[input.platform].label}`,
      `Commission: ${input.commissionPct}% (${formatINR(result.commissionAmt)})`,
      `GST: ${input.gstPct}% (${formatINR(result.gstAmt)})`,
      `Shipping: ${formatINR(input.shippingCost)}`,
      `Packaging: ${formatINR(input.packagingCost)}`,
      `Return Cost: ${formatINR(result.returnCost)}`,
      `Total Fees: ${formatINR(result.totalFees)}`,
      `Net Profit: ${formatINR(result.netProfit)}`,
      `Margin: ${result.marginPct.toFixed(1)}%`,
      `Breakeven: ${formatINR(result.breakevenPrice)}`,
    ].join('\n');
    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `seller_profit_${Date.now()}.txt`);
    toast.success('Report exported!');
  };

  const inputField = (label: string, key: keyof ProductCalc, icon: React.ReactNode, suffix = '', placeholder = '0') => (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide">{icon} {label}</label>
      <div className="flex items-center gap-1">
        {suffix === '₹' && <span className="text-[var(--text-muted)] text-xs font-medium">{suffix}</span>}
        <input type="number" min="0" step="1" value={(input[key] as number) || ''} onChange={e => update(key, e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/30" />
        {suffix && suffix !== '₹' && <span className="text-[var(--text-muted)] text-[10px] w-6">{suffix}</span>}
      </div>
    </div>
  );

  const ProfitBadge = ({ value, label }: { value: number; label: string }) => (
    <div className="bg-[var(--bg-overlay)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
      <p className={`text-xl font-black ${value >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
        {value >= 0 ? '+' : ''}{value.toFixed(1)}%
      </p>
      <p className="text-[10px] text-[var(--text-secondary)] uppercase mt-0.5">{label}</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <ShoppingBag className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">E-commerce Seller Profit Calculator</h3>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 space-y-5">
          <p className="text-xs text-[var(--text-secondary)]">Calculate your exact profit after platform commissions, GST, shipping, and returns. Compare across Meesho, Amazon, and Flipkart.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {inputField('Product Cost', 'productCost', <Package className="w-3.5 h-3.5" />, '₹')}
            {inputField('Selling Price', 'sellingPrice', <ShoppingBag className="w-3.5 h-3.5" />, '₹')}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide"><BarChart3 className="w-3.5 h-3.5" /> Platform</label>
              <select aria-label="Platform" value={input.platform} onChange={e => update('platform', e.target.value as Platform)}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/30">
                <option value="meesho">Meesho (0-15% commission)</option>
                <option value="amazon">Amazon (2-35% commission)</option>
                <option value="flipkart">Flipkart (5-25% commission)</option>
              </select>
            </div>
            {inputField('Commission %', 'commissionPct', <Percent className="w-3.5 h-3.5" />, '%')}
            {inputField('GST %', 'gstPct', <IndianRupee className="w-3.5 h-3.5" />, '%')}
            {inputField('Shipping', 'shippingCost', <Truck className="w-3.5 h-3.5" />, '₹')}
            {inputField('Packaging', 'packagingCost', <Package className="w-3.5 h-3.5" />, '₹')}
            {inputField('Return Rate %', 'returnRate', <RefreshCw className="w-3.5 h-3.5" />, '%')}
            {inputField('Fixed Fee', 'fixedFee', <IndianRupee className="w-3.5 h-3.5" />, '₹')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ProfitBadge value={result.marginPct} label="Profit Margin" />
            <div className="bg-[var(--bg-overlay)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
              <p className="text-xl font-black text-[var(--text-primary)]">{formatINR(result.netProfit)}</p>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase mt-0.5">Net Profit</p>
            </div>
            <div className="bg-[var(--bg-overlay)] rounded-xl p-3 border border-[var(--border-subtle)] text-center">
              <p className="text-xl font-black text-amber-500">{formatINR(result.breakevenPrice)}</p>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase mt-0.5">Breakeven Price</p>
            </div>
          </div>

          <div className="bg-[var(--bg-overlay)] rounded-xl p-3 border border-[var(--border-subtle)]">
            <h5 className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2">Fee Breakdown ({PLATFORM_DATA[input.platform].label})</h5>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              {[
                { label: 'Commission', value: result.commissionAmt },
                { label: 'GST', value: result.gstAmt },
                { label: 'Shipping', value: input.shippingCost },
                { label: 'Packaging', value: input.packagingCost },
                { label: 'Return Cost', value: result.returnCost },
              ].map(f => (
                <div key={f.label} className="bg-white dark:bg-black/40 rounded-lg p-2">
                  <p className="text-[10px] text-[var(--text-secondary)]">{f.label}</p>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">{formatINR(f.value)}</p>
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={comparePlatform} onChange={e => setComparePlatform(e.target.checked)}
              className="rounded border-zinc-300 text-emerald-500 focus:ring-emerald-500" />
            <span className="text-xs text-zinc-600 dark:text-[var(--text-muted)]">Compare across all platforms</span>
          </label>

          {comparison && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {comparison.map((c, i) => {
                const p = (['amazon', 'flipkart', 'meesho'] as Platform[]).filter(p => p !== input.platform)[i];
                return (
                  <div key={p} className="bg-[var(--bg-overlay)] rounded-xl p-3 border border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[var(--text-primary)]">{PLATFORM_DATA[p].label}</span>
                      <span className={`text-sm font-black ${c.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatINR(c.netProfit)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                      <span>Margin: {c.marginPct.toFixed(1)}%</span>
                      <span>Fees: {formatINR(c.totalFees)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={handleExport} className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-colors">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
            <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]">
              <strong>Pro:</strong> Bulk product import via CSV, profit trend tracking over time, auto-updated commission rates, export P&L report, compare same product across all 3 platforms simultaneously, team plan for agencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
