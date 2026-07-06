"use client";

import React, { useState, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { Crown } from 'lucide-react';
import Link from 'next/link';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  gstRate: number;
}

const INDIAN_STATES = [
  { code: "AN", name: "Andaman & Nicobar Islands" }, { code: "AP", name: "Andhra Pradesh" }, { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" }, { code: "BR", name: "Bihar" }, { code: "CH", name: "Chandigarh" },
  { code: "CG", name: "Chhattisgarh" }, { code: "DN", name: "Dadra & Nagar Haveli & Daman & Diu" }, { code: "DL", name: "Delhi" },
  { code: "GA", name: "Goa" }, { code: "GJ", name: "Gujarat" }, { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" }, { code: "JK", name: "Jammu & Kashmir" }, { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" }, { code: "KL", name: "Kerala" }, { code: "LA", name: "Ladakh" },
  { code: "LD", name: "Lakshadweep" }, { code: "MP", name: "Madhya Pradesh" }, { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" }, { code: "ML", name: "Meghalaya" }, { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" }, { code: "OD", name: "Odisha" }, { code: "PY", name: "Puducherry" },
  { code: "PB", name: "Punjab" }, { code: "RJ", name: "Rajasthan" }, { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" }, { code: "TG", name: "Telangana" }, { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" }, { code: "UK", name: "Uttarakhand" }, { code: "WB", name: "West Bengal" },
];

const MONTHLY_LIMIT = 3;

function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function g(n: number): string { if (n < 20) return a[n]; const d = n % 10; return b[Math.floor(n / 10)] + (d ? " " + a[d] : ""); }
  function c(n: number): string {
    if (n === 0) return "";
    let s = "";
    if (n >= 100) { s += a[Math.floor(n / 100)] + " Hundred "; n %= 100; }
    if (n > 0) { if (s !== "") s += "and "; s += g(n); }
    return s.trim();
  }
  let rupees = Math.floor(num);
  let paise = Math.round((num - rupees) * 100);
  let word = "";
  if (rupees >= 10000000) { word += c(Math.floor(rupees / 10000000)) + " Crore "; rupees %= 10000000; }
  if (rupees >= 100000) { word += c(Math.floor(rupees / 100000)) + " Lakh "; rupees %= 100000; }
  if (rupees >= 1000) { word += c(Math.floor(rupees / 1000)) + " Thousand "; rupees %= 1000; }
  if (rupees > 0) word += c(rupees);
  word = word.trim() ? "Rupees " + word.trim() + " Only" : "";
  if (paise > 0) { const pw = c(paise) + " Paise"; word = word ? `${word.replace(" Only", "")} and ${pw} Only` : `${pw} Only`; }
  return word;
}

export default function GstInvoiceGenerator() {
  const [invoiceNo, setInvoiceNo] = useState(`INV-${new Date().getFullYear()}-001`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [billerName, setBillerName] = useState('');
  const [billerGstin, setBillerGstin] = useState('');
  const [billerState, setBillerState] = useState('MH');
  const [billerAddress, setBillerAddress] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientGstin, setClientGstin] = useState('');
  const [clientState, setClientState] = useState('MH');
  const [clientAddress, setClientAddress] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ id: '1', description: 'Consulting Services', quantity: 1, price: 10000, gstRate: 18 }]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [newItemGst, setNewItemGst] = useState(18);
  const [isProcessing, setIsProcessing] = useState(false);
  const [usage, setUsage] = useState(0);

  useEffect(() => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
    const stored = localStorage.getItem('gstInvoiceUsage');
    if (stored) {
      try { const { month, count } = JSON.parse(stored); setUsage(month === monthKey ? count : 0); }
      catch { setUsage(0); }
    }
  }, []);

  const trackUsage = (count: number) => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
    localStorage.setItem('gstInvoiceUsage', JSON.stringify({ month: monthKey, count }));
    setUsage(count);
  };

  const [totals, setTotals] = useState({ taxableVal: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0, grandTotal: 0 });

  useEffect(() => {
    let taxableVal = 0, cgst = 0, sgst = 0, igst = 0;
    const isIntrastate = billerState === clientState;
    items.forEach(item => {
      const itemTaxable = item.quantity * item.price;
      taxableVal += itemTaxable;
      const itemTax = itemTaxable * (item.gstRate / 100);
      if (isIntrastate) { cgst += itemTax / 2; sgst += itemTax / 2; } else { igst += itemTax; }
    });
    setTotals({ taxableVal, cgst, sgst, igst, totalTax: cgst + sgst + igst, grandTotal: taxableVal + cgst + sgst + igst });
  }, [items, billerState, clientState]);

  const addLineItem = () => {
    if (!newItemDesc.trim()) { toast.error("Please enter a description."); return; }
    if (newItemQty <= 0) { toast.error("Quantity must be > 0."); return; }
    if (newItemPrice < 0) { toast.error("Price cannot be negative."); return; }
    setItems([...items, { id: crypto.randomUUID(), description: newItemDesc, quantity: newItemQty, price: newItemPrice, gstRate: newItemGst }]);
    setNewItemDesc(''); setNewItemQty(1); setNewItemPrice(0); toast.success("Item added!");
  };

  const removeLineItem = (id: string) => {
    if (items.length <= 1) { toast.error("Invoice must have at least one item."); return; }
    setItems(items.filter(item => item.id !== id));
  };

  const handleGeneratePdf = async () => {
    if (usage >= MONTHLY_LIMIT) { toast.error(`You've used all ${MONTHLY_LIMIT} free invoices this month. Upgrade to Pro for unlimited invoices.`); return; }
    if (!billerName.trim()) { toast.error("Biller Name is required."); return; }
    if (!clientName.trim()) { toast.error("Client Name is required."); return; }
    if (items.length === 0) { toast.error("Add at least one line item."); return; }

    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const billerStateName = INDIAN_STATES.find(s => s.code === billerState)?.name || billerState;
      const clientStateName = INDIAN_STATES.find(s => s.code === clientState)?.name || clientState;

      page.drawText("TAX INVOICE", { x: 40, y: height - 60, size: 20, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText(`Invoice No: ${invoiceNo}`, { x: width - 200, y: height - 50, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(`Date: ${invoiceDate}`, { x: width - 200, y: height - 65, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
      page.drawText(`Place of Supply: ${clientStateName}`, { x: width - 200, y: height - 80, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
      page.drawLine({ start: { x: 40, y: height - 95 }, end: { x: width - 40, y: height - 95 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });

      const dy = height - 120;
      page.drawText("Billed By (Seller)", { x: 40, y: dy, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText(billerName, { x: 40, y: dy - 18, size: 11, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(billerAddress || "N/A", { x: 40, y: dy - 32, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
      page.drawText(`State: ${billerStateName}`, { x: 40, y: dy - 46, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
      page.drawText(`GSTIN: ${billerGstin.toUpperCase() || "N/A"}`, { x: 40, y: dy - 60, size: 9, font: fontBold, color: rgb(0.2, 0.2, 0.2) });

      page.drawText("Billed To (Buyer)", { x: width / 2 + 20, y: dy, size: 10, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText(clientName, { x: width / 2 + 20, y: dy - 18, size: 11, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(clientAddress || "N/A", { x: width / 2 + 20, y: dy - 32, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
      page.drawText(`State: ${clientStateName}`, { x: width / 2 + 20, y: dy - 46, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
      page.drawText(`GSTIN: ${clientGstin.toUpperCase() || "N/A"}`, { x: width / 2 + 20, y: dy - 60, size: 9, font: fontBold, color: rgb(0.2, 0.2, 0.2) });

      let tableY = dy - 100;
      page.drawRectangle({ x: 40, y: tableY - 5, width: width - 80, height: 20, color: rgb(0.95, 0.96, 0.98) });
      page.drawText("S.No", { x: 45, y: tableY, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText("Description", { x: 80, y: tableY, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText("Qty", { x: 300, y: tableY, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText("Unit Price", { x: 340, y: tableY, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText("GST", { x: 420, y: tableY, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText("Amount (INR)", { x: 480, y: tableY, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawLine({ start: { x: 40, y: tableY - 6 }, end: { x: width - 40, y: tableY - 6 }, thickness: 1.2, color: rgb(0.7, 0.7, 0.7) });
      tableY -= 25;

      items.forEach((item, index) => {
        const itemTotal = item.quantity * item.price;
        page.drawText(String(index + 1), { x: 45, y: tableY, size: 9, font });
        page.drawText(item.description.substring(0, 38), { x: 80, y: tableY, size: 9, font });
        page.drawText(String(item.quantity), { x: 300, y: tableY, size: 9, font });
        page.drawText(`₹${item.price.toFixed(2)}`, { x: 340, y: tableY, size: 9, font });
        page.drawText(`${item.gstRate}%`, { x: 420, y: tableY, size: 9, font });
        page.drawText(`₹${itemTotal.toFixed(2)}`, { x: 480, y: tableY, size: 9, font });
        page.drawLine({ start: { x: 40, y: tableY - 6 }, end: { x: width - 40, y: tableY - 6 }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
        tableY -= 20;
      });

      tableY -= 15;
      const sx = width - 240;
      page.drawText("Taxable Value:", { x: sx, y: tableY, size: 9, font });
      page.drawText(`₹${totals.taxableVal.toFixed(2)}`, { x: width - 100, y: tableY, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
      tableY -= 15;
      if (totals.cgst > 0 || totals.sgst > 0) {
        page.drawText("CGST:", { x: sx, y: tableY, size: 9, font }); page.drawText(`₹${totals.cgst.toFixed(2)}`, { x: width - 100, y: tableY, size: 9, font }); tableY -= 15;
        page.drawText("SGST:", { x: sx, y: tableY, size: 9, font }); page.drawText(`₹${totals.sgst.toFixed(2)}`, { x: width - 100, y: tableY, size: 9, font }); tableY -= 15;
      } else {
        page.drawText("IGST:", { x: sx, y: tableY, size: 9, font }); page.drawText(`₹${totals.igst.toFixed(2)}`, { x: width - 100, y: tableY, size: 9, font }); tableY -= 15;
      }
      page.drawText("Total GST Tax:", { x: sx, y: tableY, size: 9, font }); page.drawText(`₹${totals.totalTax.toFixed(2)}`, { x: width - 100, y: tableY, size: 9, font }); tableY -= 18;
      page.drawLine({ start: { x: sx, y: tableY + 5 }, end: { x: width - 40, y: tableY + 5 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
      page.drawText("Grand Total:", { x: sx, y: tableY, size: 10, font: fontBold });
      page.drawText(`₹${totals.grandTotal.toFixed(2)}`, { x: width - 100, y: tableY, size: 11, font: fontBold, color: rgb(0.1, 0.6, 0.1) });

      tableY -= 35;
      page.drawText("Amount in Words:", { x: 40, y: tableY, size: 8, font: fontBold, color: rgb(0.4, 0.4, 0.4) });
      page.drawText(numberToWords(totals.grandTotal), { x: 40, y: tableY - 12, size: 9, font, color: rgb(0.2, 0.2, 0.2) });

      const fy = 80;
      page.drawLine({ start: { x: 40, y: fy + 40 }, end: { x: width - 40, y: fy + 40 }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
      page.drawText("Terms & Conditions:", { x: 40, y: fy + 25, size: 8, font: fontBold, color: rgb(0.4, 0.4, 0.4) });
      page.drawText("1. Goods once sold will not be taken back.", { x: 40, y: fy + 12, size: 7, font, color: rgb(0.5, 0.5, 0.5) });
      page.drawText("2. This is a computer generated invoice and requires no signature.", { x: 40, y: fy, size: 7, font, color: rgb(0.5, 0.5, 0.5) });
      page.drawText("Authorized Signatory", { x: width - 150, y: fy, size: 9, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      page.drawLine({ start: { x: width - 160, y: fy + 20 }, end: { x: width - 40, y: fy + 20 }, thickness: 0.5, color: rgb(0.6, 0.6, 0.6) });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      downloadOrShare(url, `${invoiceNo}.pdf`);
      trackUsage(usage + 1);
      toast.success("GST Invoice PDF generated!");
      if (usage + 1 >= MONTHLY_LIMIT) toast(`Upgrade to Pro for unlimited invoices this month.`, { icon: '👑' });
    } catch (e) { console.error(e); toast.error("Failed to generate PDF."); }
    finally { setIsProcessing(false); }
  };

  const remaining = MONTHLY_LIMIT - usage;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl">
        <div className="text-emerald-400 text-sm space-y-2">
          <h4 className="font-bold text-emerald-300">Client-Side GST Invoice Builder</h4>
          <p className="text-zinc-600 dark:text-zinc-300">Create legally compliant GST Invoices matching Indian standards. CGST/SGST vs IGST rates are automatically computed based on the Biller and Client states. Fully private, generated locally.</p>
        </div>
        <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0 ml-4"><Crown className="w-3.5 h-3.5" /> Pro</span>
      </div>

      <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
        <p className="text-xs text-zinc-500">Monthly free invoices:</p>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: MONTHLY_LIMIT }, (_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < usage ? 'bg-zinc-300 dark:bg-zinc-600' : 'bg-emerald-500'}`} />
            ))}
          </div>
          <span className="text-[10px] font-bold text-zinc-500">{remaining} / {MONTHLY_LIMIT} remaining this month</span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 sm:p-8 rounded-2xl shadow-xl space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Invoice Number</label>
            <input type="text" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:border-emerald-500" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Invoice Date</label>
            <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:border-emerald-500" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-zinc-200 dark:border-white/5">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Billed By (Seller / You)</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Company Name" value={billerName} onChange={e => setBillerName(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white outline-none focus:border-emerald-500" />
              <input type="text" placeholder="GSTIN (15 character)" value={billerGstin} onChange={e => setBillerGstin(e.target.value.toUpperCase())} maxLength={15} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white outline-none focus:border-emerald-500 uppercase font-mono" />
              <select value={billerState} onChange={e => setBillerState(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white outline-none focus:border-emerald-500">
                {INDIAN_STATES.map(s => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
              </select>
              <textarea placeholder="Billing Address" value={billerAddress} onChange={e => setBillerAddress(e.target.value)} rows={2} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white outline-none focus:border-emerald-500" />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Billed To (Buyer / Client)</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Client Name" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white outline-none focus:border-emerald-500" />
              <input type="text" placeholder="Client GSTIN (Optional)" value={clientGstin} onChange={e => setClientGstin(e.target.value.toUpperCase())} maxLength={15} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white outline-none focus:border-emerald-500 uppercase font-mono" />
              <select value={clientState} onChange={e => setClientState(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white outline-none focus:border-emerald-500">
                {INDIAN_STATES.map(s => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
              </select>
              <textarea placeholder="Shipping/Billing Address" value={clientAddress} onChange={e => setClientAddress(e.target.value)} rows={2} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white outline-none focus:border-emerald-500" />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-white/5">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Invoice Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-500 dark:text-zinc-400">
              <thead className="bg-zinc-50 dark:bg-black/50 text-xs font-semibold uppercase text-zinc-700 dark:text-zinc-300">
                <tr><th className="px-4 py-3">Description</th><th className="px-4 py-3 w-20 text-center">Qty</th><th className="px-4 py-3 w-32 text-right">Price (₹)</th><th className="px-4 py-3 w-24 text-center">GST Rate</th><th className="px-4 py-3 w-32 text-right">Total (₹)</th><th className="px-4 py-3 w-16"></th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40">
                    <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{item.description}</td>
                    <td className="px-4 py-3 text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">₹{item.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">{item.gstRate}%</td>
                    <td className="px-4 py-3 text-right text-zinc-900 dark:text-white font-medium">₹{(item.quantity * item.price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-center"><button onClick={() => removeLineItem(item.id)} className="text-red-500 hover:text-red-400 font-bold">✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900/30 p-5 rounded-2xl border border-zinc-200 dark:border-white/5 space-y-4">
            <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Add New Line Item</h4>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              <div className="sm:col-span-5"><input type="text" placeholder="Item Description" value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white outline-none focus:border-emerald-500" /></div>
              <div className="sm:col-span-2"><input type="number" placeholder="Qty" value={newItemQty || ''} onChange={e => setNewItemQty(Number(e.target.value))} className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white outline-none focus:border-emerald-500 text-center" /></div>
              <div className="sm:col-span-3"><input type="number" placeholder="₹ Unit Price" value={newItemPrice || ''} onChange={e => setNewItemPrice(Number(e.target.value))} className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white outline-none focus:border-emerald-500 text-right" /></div>
              <div className="sm:col-span-2">
                <select value={newItemGst} onChange={e => setNewItemGst(Number(e.target.value))} className="w-full bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-white outline-none focus:border-emerald-500 text-center">
                  <option value="18">18% GST</option><option value="12">12% GST</option><option value="5">5% GST</option><option value="28">28% GST</option><option value="0">Exempt (0%)</option>
                </select>
              </div>
            </div>
            <button onClick={addLineItem} className="w-full py-3 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold rounded-xl transition-all active:scale-95">+ Add Item</button>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-black/60 p-6 rounded-2xl border border-zinc-200 dark:border-white/5 space-y-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Invoice Calculations</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-semibold">
            <div className="p-3 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800"><span className="text-zinc-500 text-xs block">Taxable Subtotal</span><span className="text-zinc-900 dark:text-white text-lg font-bold">₹{totals.taxableVal.toFixed(2)}</span></div>
            <div className="p-3 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800"><span className="text-zinc-500 text-xs block">Total GST Tax</span><span className="text-zinc-900 dark:text-white text-lg font-bold">₹{totals.totalTax.toFixed(2)}</span></div>
            <div className="p-3 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800 col-span-2"><span className="text-zinc-500 text-xs block">GST Mode</span><span className="text-emerald-500 text-lg font-bold">{billerState === clientState ? `Intra-state (CGST: ₹${totals.cgst.toFixed(2)}, SGST: ₹${totals.sgst.toFixed(2)})` : `Inter-state (IGST: ₹${totals.igst.toFixed(2)})`}</span></div>
          </div>
          <div className="pt-4 border-t border-zinc-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left"><span className="text-zinc-500 text-xs block uppercase font-bold tracking-wider">Rupees in Words</span><span className="text-zinc-800 dark:text-zinc-300 font-medium text-sm block max-w-lg mt-0.5">{numberToWords(totals.grandTotal)}</span></div>
            <div className="text-right shrink-0"><span className="text-zinc-500 text-xs block uppercase font-bold tracking-wider">Grand Total</span><span className="text-emerald-500 text-3xl font-extrabold block">₹{totals.grandTotal.toFixed(2)}</span></div>
          </div>
        </div>

        <button onClick={handleGeneratePdf} disabled={isProcessing || remaining === 0}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold py-4.5 rounded-2xl shadow-xl shadow-emerald-500/10 transition-all active:scale-98 text-lg flex items-center justify-center gap-2">
          {isProcessing ? 'Generating PDF...' : remaining === 0 ? 'Monthly limit reached — Upgrade to Pro' : 'Generate & Download A4 Tax Invoice (PDF)'}
        </button>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3 flex items-center justify-between">
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400"><strong>Pro:</strong> Unlimited monthly invoices, custom brand logo on every invoice, saved client database with GSTIN auto-fill, bulk invoice generation, export to Excel.</p>
          <Link href="/pricing" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 underline shrink-0 ml-4">Upgrade →</Link>
        </div>
      </div>
    </div>
  );
}
