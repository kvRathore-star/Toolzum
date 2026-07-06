"use client";

import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, TrendingDown, Download, History, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

interface Calculation {
  id: number;
  date: string;
  productName: string;
  sellingPrice: number;
  purchasePrice: number;
  platformFee: number;
  shippingCost: number;
  gstRate: number;
  otherCosts: number;
  netProfit: number;
  margin: number;
  roi: number;
}

export default function SellerProfitCalculator() {
  const [productName, setProductName] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [platformFee, setPlatformFee] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [gstRate, setGstRate] = useState('18');
  const [otherCosts, setOtherCosts] = useState('');
  const [history, setHistory] = useState<Calculation[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const result = useMemo(() => {
    const sp = Number(sellingPrice) || 0;
    const pp = Number(purchasePrice) || 0;
    const pf = Number(platformFee) || 0;
    const sc = Number(shippingCost) || 0;
    const gst = Number(gstRate) || 0;
    const oc = Number(otherCosts) || 0;

    if (sp === 0) return null;

    const gstAmount = sp - (sp / (1 + gst / 100));
    const taxableValue = sp - gstAmount;
    const totalCost = pp + pf + sc + oc;
    const netProfit = taxableValue - totalCost;
    const margin = (netProfit / sp) * 100;
    const roi = pp > 0 ? (netProfit / pp) * 100 : 0;
    const breakEven = totalCost + gstAmount;

    return {
      sp, pp, pf, sc, gst, oc, gstAmount, taxableValue,
      totalCost, netProfit, margin, roi, breakEven,
    };
  }, [sellingPrice, purchasePrice, platformFee, shippingCost, gstRate, otherCosts]);

  const saveToHistory = () => {
    if (!result || result.netProfit === 0 && result.sp === 0) return toast.error('Calculate a valid product first');
    setHistory(prev => [{
      id: Date.now(),
      date: new Date().toLocaleDateString('en-IN'),
      productName: productName || `Product #${prev.length + 1}`,
      sellingPrice: result.sp,
      purchasePrice: result.pp,
      platformFee: result.pf,
      shippingCost: result.sc,
      gstRate: result.gst,
      otherCosts: result.oc,
      netProfit: result.netProfit,
      margin: result.margin,
      roi: result.roi,
    }, ...prev]);
    toast.success('Saved to history');
  };

  const clearHistory = () => {
    setHistory([]);
    toast.success('History cleared');
  };

  const exportHistory = () => {
    if (!history.length) return toast.error('No history to export');
    const csv = ['Product,Selling Price,Purchase Price,Platform Fee,Shipping,GST Rate,Other Costs,Net Profit,Margin %,ROI %']
      .concat(history.map(h =>
        `"${h.productName}",${h.sellingPrice},${h.purchasePrice},${h.platformFee},${h.shippingCost},${h.gstRate},${h.otherCosts},${h.netProfit.toFixed(2)},${h.margin.toFixed(1)},${h.roi.toFixed(1)}`
      )).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `seller_profit_history_${Date.now()}.csv`);
    toast.success('Exported!');
  };

  const platforms = [
    { name: 'Amazon', fee: '15', label: 'Amazon ~15%' },
    { name: 'Flipkart', fee: '17', label: 'Flipkart ~17%' },
    { name: 'Meesho', fee: '10', label: 'Meesho ~10%' },
    { name: 'Shopify', fee: '2', label: 'Shopify ~2%' },
  ];

  const Currency = ({ children }: { children: React.ReactNode }) => (
    <span className="text-sm font-semibold text-zinc-800 dark:text-white">{children}</span>
  );

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">E-Commerce Seller Profit Calculator</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Cost Inputs</span>
            <button onClick={() => setShowHistory(!showHistory)}
              className="text-xs text-emerald-500 hover:text-emerald-600 font-semibold flex items-center gap-1">
              <History className="w-3 h-3" /> {showHistory ? 'Calculator' : `History (${history.length})`}
            </button>
          </div>

          {!showHistory ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Product Name</label>
                <input value={productName} onChange={e => setProductName(e.target.value)}
                  placeholder="e.g. Cotton T-Shirt"
                  className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Selling Price (₹)</label>
                  <input type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Purchase Cost (₹)</label>
                  <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Platform Fee (₹)</label>
                  <input type="number" value={platformFee} onChange={e => setPlatformFee(e.target.value)}
                    placeholder="0"
                    className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Shipping Cost (₹)</label>
                  <input type="number" value={shippingCost} onChange={e => setShippingCost(e.target.value)}
                    placeholder="0"
                    className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">GST Rate (%)</label>
                  <select value={gstRate} onChange={e => setGstRate(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none">
                    <option value="0">0% (Nil)</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Other Costs (₹)</label>
                  <input type="number" value={otherCosts} onChange={e => setOtherCosts(e.target.value)}
                    placeholder="0"
                    className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Quick Platform Fee</label>
                <div className="flex flex-wrap gap-1.5">
                  {platforms.map(p => (
                    <button key={p.name} onClick={() => setPlatformFee(p.fee)}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-semibold transition-colors ${
                        platformFee === p.fee
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-zinc-50 dark:bg-black/30 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400'
                      }`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={saveToHistory}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5">
                  <Calculator className="w-4 h-4" /> Save to History
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-8 text-zinc-400">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No calculations saved yet</p>
                  <p className="text-[10px] mt-1">Calculate a product and click Save</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500">{history.length} saved calculations</span>
                    <div className="flex gap-1">
                      <button onClick={exportHistory} className="p-1.5 text-zinc-400 hover:text-zinc-600 transition-colors" title="Export CSV"><Download className="w-3.5 h-3.5" /></button>
                      <button onClick={clearHistory} className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors" title="Clear All"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1.5">
                    {history.map(h => (
                      <div key={h.id} className="p-2.5 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-zinc-800 dark:text-white">{h.productName}</span>
                          <span className={`text-[11px] font-bold ${h.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {h.netProfit >= 0 ? '+' : ''}₹{h.netProfit.toFixed(0)} ({h.margin.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-500">₹{h.sellingPrice} sale | Cost ₹{(h.purchasePrice + h.platformFee + h.shippingCost + h.otherCosts).toFixed(0)} | ROI {h.roi.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
                      <strong>Pro:</strong> Sync history across devices, compare product profitability, bulk import from Amazon/Flipkart reports, and get pricing recommendations.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-xl flex flex-col">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Profit Breakdown</span>

          {result ? (
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-zinc-50 dark:bg-black/30 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 text-center">
                  <p className="text-[10px] text-zinc-500 uppercase mb-0.5">Net Profit</p>
                  <p className={`text-xl font-black ${result.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {result.netProfit >= 0 ? '+' : ''}₹{result.netProfit.toFixed(0)}
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-black/30 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 text-center">
                  <p className="text-[10px] text-zinc-500 uppercase mb-0.5">Margin</p>
                  <p className={`text-xl font-black ${result.margin >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {result.margin.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-black/30 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 text-center">
                  <p className="text-[10px] text-zinc-500 uppercase mb-0.5">ROI</p>
                  <p className={`text-xl font-black ${result.roi >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                    {result.roi.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-zinc-50 dark:bg-black/30 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 text-center">
                  <p className="text-[10px] text-zinc-500 uppercase mb-0.5">Break-Even</p>
                  <p className="text-xl font-black text-zinc-800 dark:text-white">₹{result.breakEven.toFixed(0)}</p>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-black/20 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase mb-3">Revenue vs Costs</h4>
                <div className="relative h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div className="absolute inset-0 flex">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, ((result.sp - result.totalCost - result.gstAmount) / result.sp) * 100))}%` }} />
                    <div className="h-full bg-zinc-400 dark:bg-zinc-500 transition-all duration-500" style={{ width: `${(result.totalCost / result.sp) * 100}%` }} />
                    <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${(result.gstAmount / result.sp) * 100}%` }} />
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Profit ({((result.netProfit / result.sp) * 100).toFixed(0)}%)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-400" /> Costs ({((result.totalCost / result.sp) * 100).toFixed(0)}%)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> GST ({((result.gstAmount / result.sp) * 100).toFixed(0)}%)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1.5 p-3 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between"><span className="text-zinc-500">Selling Price</span><span className="font-semibold">₹{result.sp.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Taxable Value</span><span className="font-semibold">₹{result.taxableValue.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">GST Amount</span><span className="font-semibold text-amber-500">₹{result.gstAmount.toFixed(2)}</span></div>
                </div>
                <div className="space-y-1.5 p-3 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between"><span className="text-zinc-500">Purchase Cost</span><span className="font-semibold">₹{result.pp.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Platform Fee</span><span className="font-semibold">₹{result.pf.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Shipping + Other</span><span className="font-semibold">₹{(result.sc + result.oc).toFixed(2)}</span></div>
                  <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-700 pt-1"><span className="text-zinc-500">Total Cost</span><span className="font-semibold text-red-500">₹{result.totalCost.toFixed(2)}</span></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
              <Calculator className="w-10 h-10 mb-2 text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm font-medium">Enter your product costs to see profit breakdown</p>
              <p className="text-[10px] text-zinc-500 mt-1">Supports Amazon, Flipkart, Meesho, Shopify & more</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
