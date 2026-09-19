"use client";

import React, { useState } from 'react';
import { FileText, Plus, Trash2, Download, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';

interface ReceiptItem {
  id: string;
  name: string;
  qty: number;
  rate: number;
}

export default function ReceiptGenerator() {
  const [businessName, setBusinessName] = useState('Acme Corp Ltd.');
  const [receiptNumber, setReceiptNumber] = useState('REC-88491');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  
  const [items, setItems] = useState<ReceiptItem[]>([
    { id: '1', name: 'Software Consultation Service', qty: 2, rate: 120 },
    { id: '2', name: 'UI Design Assets Pack', qty: 1, rate: 45 }
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemRate, setNewItemRate] = useState(0);

  const [taxPercent, setTaxPercent] = useState(18); // e.g. 18% standard GST
  const [discountAmount, setDiscountAmount] = useState(0);

  const addItem = () => {
    if (!newItemName.trim()) {
      toast.error('Item name cannot be empty');
      return;
    }

    setItems([...items, {
      id: `item-${Date.now()}`,
      name: newItemName.trim(),
      qty: newItemQty,
      rate: newItemRate
    }]);

    setNewItemName('');
    setNewItemQty(1);
    setNewItemRate(0);
    toast.success('Line item added!');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getSubtotal = () => items.reduce((acc, item) => acc + (item.qty * item.rate), 0);
  const getTax = () => getSubtotal() * (taxPercent / 100);
  const getTotal = () => getSubtotal() + getTax() - discountAmount;

  const exportPdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      // Receipt Header
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.text(businessName, 20, 30);

      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Receipt ID: ${receiptNumber}`, 20, 38);
      doc.text(`Transaction Date: ${date}`, 20, 44);
      doc.text(`Payment Method: ${paymentMethod}`, 20, 50);

      // Line items table header
      doc.setFont('Helvetica', 'bold');
      doc.line(20, 58, 190, 58);
      doc.text('Item Description', 22, 64);
      doc.text('Qty', 110, 64);
      doc.text('Rate ($)', 130, 64);
      doc.text('Total ($)', 160, 64);
      doc.line(20, 68, 190, 68);

      // Render line items
      let startY = 74;
      doc.setFont('Helvetica', 'normal');
      items.forEach(item => {
        doc.text(item.name, 22, startY);
        doc.text(String(item.qty), 110, startY);
        doc.text(item.rate.toFixed(2), 130, startY);
        doc.text((item.qty * item.rate).toFixed(2), 160, startY);
        startY += 8;
      });

      doc.line(20, startY, 190, startY);
      startY += 10;

      // Summary
      doc.text('Subtotal:', 130, startY);
      doc.text(`$${getSubtotal().toFixed(2)}`, 160, startY);
      startY += 6;
      doc.text(`Tax (${taxPercent}%):`, 130, startY);
      doc.text(`$${getTax().toFixed(2)}`, 160, startY);
      startY += 6;
      if (discountAmount > 0) {
        doc.text('Discount:', 130, startY);
        doc.text(`-$${discountAmount.toFixed(2)}`, 160, startY);
        startY += 6;
      }
      doc.setFont('Helvetica', 'bold');
      doc.text('Total:', 130, startY);
      doc.text(`$${getTotal().toFixed(2)}`, 160, startY);

      doc.save(`receipt_${receiptNumber}.pdf`);
      toast.success('Receipt PDF exported!');
    } catch (err) {
      toast.error('Failed to compile PDF.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-5 border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] rounded-2xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--accent)]" />
            Receipt Generator & PDF Builder
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Create professional custom receipts, format line items, calculate totals with tax rules, and export to PDF.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs text-[var(--text-muted)]">
        {/* Workspace */}
        <div className="lg:col-span-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase border-b border-zinc-800 pb-2">Details</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="lbl-receiptgenerator-business-name" className="text-[10px] text-[var(--text-muted)] font-bold">Business Name</label>
              <input id="lbl-receiptgenerator-business-name" aria-label="Business Name" type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-zinc-200" />
            </div>
            <div className="space-y-1">
              <label htmlFor="lbl-receiptgenerator-receipt-id" className="text-[10px] text-[var(--text-muted)] font-bold">Receipt ID</label>
              <input id="lbl-receiptgenerator-receipt-id" aria-label="Receipt ID" type="text" value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="lbl-receiptgenerator-date" className="text-[10px] text-[var(--text-muted)] font-bold">Date</label>
              <input id="lbl-receiptgenerator-date" aria-label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-zinc-200" />
            </div>
            <div className="space-y-1">
              <label htmlFor="lbl-receiptgenerator-payment-method" className="text-[10px] text-[var(--text-muted)] font-bold">Payment Method</label>
              <select id="lbl-receiptgenerator-payment-method" aria-label="Payment Method" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2">
                <option value="Credit Card">Credit Card</option>
                <option value="PayPal">PayPal</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-3 space-y-3">
            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">Add Line Item</span>
            <input aria-label="Add Line Item" type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Consultation Fees" className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="lbl-receiptgenerator-qty" className="text-[9px] text-[var(--text-secondary)]">Qty</label>
                <input id="lbl-receiptgenerator-qty" aria-label="Qty" type="number" min="1" value={newItemQty} onChange={e => setNewItemQty(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
              </div>
              <div className="space-y-1">
                <label htmlFor="lbl-receiptgenerator-rate" className="text-[9px] text-[var(--text-secondary)]">Rate ($)</label>
                <input id="lbl-receiptgenerator-rate" aria-label="Rate ($)" type="number" min="0" value={newItemRate} onChange={e => setNewItemRate(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
              </div>
            </div>
            <button onClick={addItem} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
        </div>

        {/* Live Bill preview */}
        <div className="lg:col-span-7 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex flex-col justify-between min-h-[450px]">
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
              <div>
                <h4 className="text-base font-black text-[var(--text-primary)]">{businessName}</h4>
                <p className="text-[10px] text-[var(--text-secondary)] mt-1">Receipt: {receiptNumber} | {date}</p>
              </div>
              <span className="bg-emerald-700/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded text-[9px] font-bold tracking-wider">PAID</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-12 text-[var(--text-muted)] font-bold border-b border-zinc-800 pb-1.5">
                <span className="col-span-6">Description</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-2 text-right">Rate</span>
                <span className="col-span-2 text-right">Total</span>
              </div>

              {items.map(item => (
                <div key={item.id} className="grid grid-cols-12 items-center text-zinc-300 py-1 border-b border-[var(--border-subtle)]/50">
                  <span className="col-span-6 truncate font-medium">{item.name}</span>
                  <span className="col-span-2 text-center">{item.qty}</span>
                  <span className="col-span-2 text-right">${item.rate.toFixed(2)}</span>
                  <span className="col-span-2 text-right font-bold text-[var(--text-primary)]">${(item.qty * item.rate).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-end pt-4 space-y-2 text-xs">
              <div className="flex justify-between w-48 text-[var(--text-muted)]">
                <span>Subtotal:</span>
                <span>${getSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-48 text-[var(--text-muted)]">
                <span>Tax ({taxPercent}%):</span>
                <span>${getTax().toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-48 text-[var(--text-primary)] font-bold border-t border-zinc-800 pt-2 text-sm">
                <span>Total:</span>
                <span className="text-emerald-500">${getTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button onClick={exportPdf} className="w-full mt-6 bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <Download className="w-4 h-4" /> Export Receipt (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}
