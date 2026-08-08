"use client";

import React, { useState, useRef, useMemo } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { createDownloadBlob } from '@/utils/blob';
import { Crown, Upload, Trash2, Download, Eye } from 'lucide-react';
import { useUsageCounter } from '@/hooks/useUsageCounter';
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
  const paise = Math.round((num - rupees) * 100);
  let word = "";
  if (rupees >= 10000000) { word += c(Math.floor(rupees / 10000000)) + " Crore "; rupees %= 10000000; }
  if (rupees >= 100000) { word += c(Math.floor(rupees / 100000)) + " Lakh "; rupees %= 100000; }
  if (rupees >= 1000) { word += c(Math.floor(rupees / 1000)) + " Thousand "; rupees %= 1000; }
  if (rupees > 0) word += c(rupees);
  word = word.trim() ? "Rupees " + word.trim() + " Only" : "";
  if (paise > 0) { const pw = c(paise) + " Paise"; word = word ? `${word.replace(" Only", "")} and ${pw} Only` : `${pw} Only`; }
  return word;
}

function validateGstin(gstin: string): { valid: boolean; message: string } {
  const cleaned = gstin.toUpperCase().trim();
  if (!cleaned) return { valid: false, message: '' };
  if (cleaned.length !== 15) return { valid: false, message: 'GSTIN must be exactly 15 characters' };
  const pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!pattern.test(cleaned)) return { valid: false, message: 'Invalid GSTIN format' };
  return { valid: true, message: 'Valid GSTIN' };
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
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  const { usage, trackUsage } = useUsageCounter('gstInvoiceUsage', 'month');

  const totals = useMemo(() => {
    let taxableVal = 0, cgst = 0, sgst = 0, igst = 0;
    const isIntrastate = billerState === clientState;
    items.forEach(item => {
      const itemTaxable = item.quantity * item.price;
      taxableVal += itemTaxable;
      const itemTax = itemTaxable * (item.gstRate / 100);
      if (isIntrastate) { cgst += itemTax / 2; sgst += itemTax / 2; } else { igst += itemTax; }
    });
    return { taxableVal, cgst, sgst, igst, totalTax: cgst + sgst + igst, grandTotal: taxableVal + cgst + sgst + igst };
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { toast.error('Logo must be under 500KB'); return; }
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
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

      if (logoDataUrl) {
        try {
          const logoBytes = await fetch(logoDataUrl).then(r => r.arrayBuffer());
          const logoImage = await pdfDoc.embedPng(new Uint8Array(logoBytes)).catch(() => null) || await pdfDoc.embedJpg(new Uint8Array(logoBytes)).catch(() => null);
          if (logoImage) {
            const logoDims = logoImage.scaleToFit(120, 50);
            page.drawImage(logoImage, { x: 40, y: height - 60 - logoDims.height, width: logoDims.width, height: logoDims.height });
          }
        } catch {}
      }

      page.drawText("TAX INVOICE", { x: 40, y: height - 60, size: 20, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      page.drawText(`Invoice No: ${invoiceNo}`, { x: width - 200, y: height - 50, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(`Date: ${invoiceDate}`, { x: width - 200, y: height - 65, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
      page.drawText(`Place of Supply: ${clientStateName}`, { x: width - 200, y: height - 80, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
      page.drawLine({ start: { x: 40, y: height - 95 }, end: { x: width - 40, y: height - 95 }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });

      const dy = logoDataUrl ? height - 140 : height - 120;
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
      const blob = createDownloadBlob(pdfBytes, 'application/pdf');
      const url = URL.createObjectURL(blob);
      downloadOrShare(url, `${invoiceNo}.pdf`);
      trackUsage(usage + 1);
      toast.success("GST Invoice PDF generated!");
      if (usage + 1 >= MONTHLY_LIMIT) toast(`Upgrade to Pro for unlimited invoices this month.`, { icon: '👑' });
    } catch (e) { console.error(e); toast.error("Failed to generate PDF."); }
    finally { setIsProcessing(false); }
  };

  const remaining = MONTHLY_LIMIT - usage;
  const billerGstinValidation = validateGstin(billerGstin);
  const clientGstinValidation = validateGstin(clientGstin);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl">
        <div className="text-emerald-400 text-sm space-y-2">
          <h4 className="font-bold text-emerald-300">Client-Side GST Invoice Builder</h4>
          <p className="text-zinc-600 dark:text-zinc-300">Create legally compliant GST Invoices matching Indian standards. CGST/SGST vs IGST rates are automatically computed based on the Biller and Client states. Fully private, generated locally.</p>
        </div>
        <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0 ml-4"><Crown className="w-3.5 h-3.5" /> Pro</span>
      </div>

      <div className="flex items-center justify-between bg-[var(--bg-overlay)]/50 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)]">
        <p className="text-xs text-[var(--text-secondary)]">Monthly free invoices:</p>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: MONTHLY_LIMIT }, (_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < usage ? 'bg-zinc-300 dark:bg-zinc-600' : 'bg-emerald-500'}`} />
            ))}
          </div>
          <span className="text-[10px] font-bold text-[var(--text-secondary)]">{remaining} / {MONTHLY_LIMIT} remaining this month</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 sm:p-8 rounded-2xl shadow-xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--text-primary)]">Invoice Number</label>
              <input type="text" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] outline-none focus:border-emerald-500 transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--text-primary)]">Invoice Date</label>
              <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] outline-none focus:border-emerald-500 transition-colors" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text-primary)]">Company Logo</label>
            <label className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] rounded-xl cursor-pointer hover:border-emerald-500 transition-colors">
              <Upload className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-[var(--text-secondary)]">{logoDataUrl ? 'Logo uploaded' : 'Upload logo (PNG/JPG, max 500KB)'}</span>
              <input type="file" accept="image/png,image/jpeg" onChange={handleLogoUpload} className="hidden" />
            </label>
            {logoDataUrl && (
              <div className="flex items-center gap-3 mt-2">
                <img src={logoDataUrl} alt="Logo preview" className="h-10 w-auto rounded border border-[var(--border-subtle)]" />
                <button onClick={() => setLogoDataUrl(null)} className="text-xs text-red-500 hover:text-red-400 font-semibold">Remove</button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-zinc-200 dark:border-[var(--border-subtle)]">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Billed By (Seller)</h3>
              <div className="space-y-3">
                <input type="text" placeholder="Company Name" value={billerName} onChange={e => setBillerName(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-emerald-500 transition-colors" />
                <div className="relative">
                  <input type="text" placeholder="GSTIN (15 characters)" value={billerGstin} onChange={e => setBillerGstin(e.target.value.toUpperCase())} maxLength={15} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-emerald-500 uppercase font-mono transition-colors" />
                  {billerGstinValidation.message && (
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold ${billerGstinValidation.valid ? 'text-emerald-500' : 'text-red-500'}`}>
                      {billerGstinValidation.valid ? '✓' : '✕'}
                    </span>
                  )}
                </div>
                {billerGstinValidation.message && (
                  <p className={`text-[10px] ${billerGstinValidation.valid ? 'text-emerald-500' : 'text-red-500'}`}>{billerGstinValidation.message}</p>
                )}
                <select value={billerState} onChange={e => setBillerState(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-emerald-500 transition-colors">
                  {INDIAN_STATES.map(s => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
                </select>
                <textarea placeholder="Billing Address" value={billerAddress} onChange={e => setBillerAddress(e.target.value)} rows={2} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-emerald-500 transition-colors resize-none" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Billed To (Buyer)</h3>
              <div className="space-y-3">
                <input type="text" placeholder="Client Name" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-emerald-500 transition-colors" />
                <div className="relative">
                  <input type="text" placeholder="Client GSTIN (Optional)" value={clientGstin} onChange={e => setClientGstin(e.target.value.toUpperCase())} maxLength={15} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-emerald-500 uppercase font-mono transition-colors" />
                  {clientGstinValidation.message && (
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold ${clientGstinValidation.valid ? 'text-emerald-500' : 'text-red-500'}`}>
                      {clientGstinValidation.valid ? '✓' : '✕'}
                    </span>
                  )}
                </div>
                {clientGstinValidation.message && (
                  <p className={`text-[10px] ${clientGstinValidation.valid ? 'text-emerald-500' : 'text-red-500'}`}>{clientGstinValidation.message}</p>
                )}
                <select value={clientState} onChange={e => setClientState(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-emerald-500 transition-colors">
                  {INDIAN_STATES.map(s => <option key={s.code} value={s.code}>{s.name} ({s.code})</option>)}
                </select>
                <textarea placeholder="Shipping/Billing Address" value={clientAddress} onChange={e => setClientAddress(e.target.value)} rows={2} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-emerald-500 transition-colors resize-none" />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-[var(--border-subtle)]">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Invoice Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-[var(--text-secondary)]">
                <thead className="bg-[var(--bg-overlay)] text-xs font-semibold uppercase text-[var(--text-primary)]">
                  <tr><th className="px-4 py-3">Description</th><th className="px-4 py-3 w-20 text-center">Qty</th><th className="px-4 py-3 w-32 text-right">Price (₹)</th><th className="px-4 py-3 w-24 text-center">GST Rate</th><th className="px-4 py-3 w-32 text-right">Total (₹)</th><th className="px-4 py-3 w-16"></th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {items.map(item => (
                    <tr key={item.id} className="hover:bg-[var(--bg-overlay)]/50 dark:hover:bg-zinc-900/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{item.description}</td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">₹{item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">{item.gstRate}%</td>
                      <td className="px-4 py-3 text-right text-[var(--text-primary)] font-medium">₹{(item.quantity * item.price).toFixed(2)}</td>
                      <td className="px-4 py-3 text-center"><button onClick={() => removeLineItem(item.id)} className="text-red-500 hover:text-red-400 font-bold transition-colors"><Trash2 className="w-4 h-4 inline" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-[var(--bg-overlay)] dark:bg-zinc-900/30 p-5 rounded-2xl border border-zinc-200 dark:border-[var(--border-subtle)] space-y-4">
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">Add New Line Item</h4>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                <div className="sm:col-span-5"><input type="text" placeholder="Item Description" value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-emerald-500 transition-colors" /></div>
                <div className="sm:col-span-2"><input type="number" placeholder="Qty" value={newItemQty || ''} onChange={e => setNewItemQty(Number(e.target.value))} className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-emerald-500 text-center transition-colors" /></div>
                <div className="sm:col-span-3"><input type="number" placeholder="₹ Unit Price" value={newItemPrice || ''} onChange={e => setNewItemPrice(Number(e.target.value))} className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-emerald-500 text-right transition-colors" /></div>
                <div className="sm:col-span-2">
                  <select value={newItemGst} onChange={e => setNewItemGst(Number(e.target.value))} className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] outline-none focus:border-emerald-500 text-center transition-colors">
                    <option value="18">18% GST</option><option value="12">12% GST</option><option value="5">5% GST</option><option value="28">28% GST</option><option value="0">Exempt (0%)</option>
                  </select>
                </div>
              </div>
              <button onClick={addLineItem} className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/20">+ Add Item</button>
            </div>
          </div>

          <div className="bg-[var(--bg-overlay)]/60 p-6 rounded-2xl border border-zinc-200 dark:border-[var(--border-subtle)] space-y-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Invoice Calculations</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-semibold">
              <div className="p-3 bg-[var(--bg-elevated)]/50 rounded-xl border border-[var(--border-subtle)]"><span className="text-[var(--text-secondary)] text-xs block">Taxable Subtotal</span><span className="text-[var(--text-primary)] text-lg font-bold">₹{totals.taxableVal.toFixed(2)}</span></div>
              <div className="p-3 bg-[var(--bg-elevated)]/50 rounded-xl border border-[var(--border-subtle)]"><span className="text-[var(--text-secondary)] text-xs block">Total GST Tax</span><span className="text-[var(--text-primary)] text-lg font-bold">₹{totals.totalTax.toFixed(2)}</span></div>
              <div className="p-3 bg-[var(--bg-elevated)]/50 rounded-xl border border-[var(--border-subtle)] col-span-2"><span className="text-[var(--text-secondary)] text-xs block">GST Mode</span><span className="text-emerald-500 text-lg font-bold">{billerState === clientState ? `Intra-state (CGST: ₹${totals.cgst.toFixed(2)}, SGST: ₹${totals.sgst.toFixed(2)})` : `Inter-state (IGST: ₹${totals.igst.toFixed(2)})`}</span></div>
            </div>
            <div className="pt-4 border-t border-zinc-200 dark:border-[var(--border-subtle)] flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left"><span className="text-[var(--text-secondary)] text-xs block uppercase font-bold tracking-wider">Rupees in Words</span><span className="text-zinc-800 dark:text-zinc-300 font-medium text-sm block max-w-lg mt-0.5">{numberToWords(totals.grandTotal)}</span></div>
              <div className="text-right shrink-0"><span className="text-[var(--text-secondary)] text-xs block uppercase font-bold tracking-wider">Grand Total</span><span className="text-emerald-500 text-3xl font-extrabold block">₹{totals.grandTotal.toFixed(2)}</span></div>
            </div>
          </div>

          <button onClick={handleGeneratePdf} disabled={isProcessing || remaining === 0}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold py-4 rounded-2xl shadow-xl shadow-emerald-500/10 transition-all active:scale-[0.98] text-lg flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            {isProcessing ? 'Generating PDF...' : remaining === 0 ? 'Monthly limit reached — Upgrade to Pro' : 'Generate & Download A4 Tax Invoice (PDF)'}
          </button>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3 flex items-center justify-between">
            <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]"><strong>Pro:</strong> Unlimited monthly invoices, custom brand logo on every invoice, saved client database with GSTIN auto-fill, bulk invoice generation, export to Excel.</p>
            <Link href="/pricing" className="text-[10px] font-bold text-[var(--accent)] dark:text-[var(--accent)] underline shrink-0 ml-4">Upgrade →</Link>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden sticky top-6">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-overlay)]/50">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-[var(--text-primary)]">Live Invoice Preview</span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)]">A4</span>
            </div>
            <div className="p-4 bg-zinc-100 dark:bg-zinc-900/60 flex justify-center">
              <div className="w-full max-w-[420px] bg-white rounded-lg shadow-sm" style={{ aspectRatio: '210 / 297' }}>
                <div className="p-5 text-[10px] text-zinc-800 space-y-3 font-sans overflow-hidden" style={{ lineHeight: '1.4' }}>
                  {logoDataUrl && (
                    <div className="flex justify-center mb-1">
                      <img src={logoDataUrl} alt="Logo" className="h-8 w-auto object-contain" />
                    </div>
                  )}
                  <div className="text-center">
                    <h2 className="text-sm font-bold tracking-tight">TAX INVOICE</h2>
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-500">
                    <span>Invoice: {invoiceNo}</span>
                    <span>Date: {invoiceDate}</span>
                  </div>
                  <div className="border-t border-zinc-300 pt-2 grid grid-cols-2 gap-3">
                    <div>
                      <p className="font-bold text-zinc-700 mb-0.5">Seller</p>
                      <p className="font-semibold">{billerName || '—'}</p>
                      <p className="text-zinc-500">{billerAddress || ''}</p>
                      <p className="text-zinc-500">{INDIAN_STATES.find(s => s.code === billerState)?.name || billerState}</p>
                      {billerGstin && <p className="text-zinc-600 font-mono">GSTIN: {billerGstin}</p>}
                    </div>
                    <div>
                      <p className="font-bold text-zinc-700 mb-0.5">Buyer</p>
                      <p className="font-semibold">{clientName || '—'}</p>
                      <p className="text-zinc-500">{clientAddress || ''}</p>
                      <p className="text-zinc-500">{INDIAN_STATES.find(s => s.code === clientState)?.name || clientState}</p>
                      {clientGstin && <p className="text-zinc-600 font-mono">GSTIN: {clientGstin}</p>}
                    </div>
                  </div>
                  <table className="w-full border-collapse text-[9px]">
                    <thead>
                      <tr className="bg-zinc-100">
                        <th className="text-left px-1 py-1 font-bold">Item</th>
                        <th className="text-center px-1 py-1 font-bold">Qty</th>
                        <th className="text-right px-1 py-1 font-bold">Price</th>
                        <th className="text-center px-1 py-1 font-bold">GST</th>
                        <th className="text-right px-1 py-1 font-bold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, i) => (
                        <tr key={item.id} className="border-b border-zinc-200">
                          <td className="px-1 py-1 truncate max-w-[100px]">{item.description}</td>
                          <td className="text-center px-1 py-1">{item.quantity}</td>
                          <td className="text-right px-1 py-1">₹{item.price.toFixed(2)}</td>
                          <td className="text-center px-1 py-1">{item.gstRate}%</td>
                          <td className="text-right px-1 py-1">₹{(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="border-t border-zinc-300 pt-2 space-y-0.5 text-right">
                    <div className="flex justify-between text-[9px]"><span>Taxable Value:</span><span>₹{totals.taxableVal.toFixed(2)}</span></div>
                    {(totals.cgst > 0 || totals.sgst > 0) ? (
                      <>
                        <div className="flex justify-between text-[9px]"><span>CGST:</span><span>₹{totals.cgst.toFixed(2)}</span></div>
                        <div className="flex justify-between text-[9px]"><span>SGST:</span><span>₹{totals.sgst.toFixed(2)}</span></div>
                      </>
                    ) : (
                      <div className="flex justify-between text-[9px]"><span>IGST:</span><span>₹{totals.igst.toFixed(2)}</span></div>
                    )}
                    <div className="flex justify-between text-[9px]"><span>Total Tax:</span><span>₹{totals.totalTax.toFixed(2)}</span></div>
                    <div className="flex justify-between text-[10px] font-bold border-t border-zinc-300 pt-1 mt-1"><span>Grand Total:</span><span className="text-emerald-600">₹{totals.grandTotal.toFixed(2)}</span></div>
                  </div>
                  <div className="text-[8px] text-zinc-500 pt-1 border-t border-zinc-200">
                    <p className="font-semibold text-zinc-600">Amount in Words:</p>
                    <p>{numberToWords(totals.grandTotal)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
