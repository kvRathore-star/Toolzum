"use client";
import React, { useState } from 'react';
import { FileText, Printer, Plus, Trash2, Calculator } from 'lucide-react';
import { CalcActions } from '../shared/CalcActions';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export default function InvoiceGenerator() {
  const [invoiceNum, setInvoiceNum] = useState('INV-001');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  
  const [senderName, setSenderName] = useState('Your Company Name');
  const [senderDetails, setSenderDetails] = useState('123 Business Rd.\\nCity, State 12345\\ncontact@yourcompany.com');
  
  const [clientName, setClientName] = useState('Client Name');
  const [clientDetails, setClientDetails] = useState('456 Client Ave.\\nCity, State 67890');
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Web Design Services', quantity: 1, rate: 1500 },
    { id: '2', description: 'Hosting (1 Year)', quantity: 1, rate: 120 }
  ]);
  
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('Thank you for your business!');

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Math.random().toString(), description: '', quantity: 1, rate: 0 }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const handlePrint = () => {
    window.print();
  };

  // Plain-text export for copy/download (print/PDF stays the visual path).
  const invoiceText = [
    `INVOICE ${invoiceNum}`,
    `Date: ${date}${dueDate ? `  Due: ${dueDate}` : ''}`,
    ``,
    `From: ${senderName}`,
    ...senderDetails.split('\n'),
    ``,
    `Bill to: ${clientName}`,
    ...clientDetails.split('\n'),
    ``,
    ...items.map((item) => `${item.description || '(no description)'} — ${item.quantity} x ${item.rate} = ${item.quantity * item.rate}`),
    ``,
    `Subtotal: ${subtotal}`,
    `Tax (${taxRate}%): ${tax}`,
    `Total: ${total}`,
    ``,
    notes,
  ].join('\n');

  return (
    <div className="p-6 space-y-4">
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center print:hidden">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[var(--accent)] dark:text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Invoice Generator</h2>
              <p className="text-sm text-[var(--text-secondary)]">Create and print professional invoices</p>
            </div>
          </div>
          
          <button
            onClick={handlePrint}
            className="px-6 py-2.5 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print / PDF
          </button>
          <CalcActions result={invoiceText} downloadData={invoiceText} downloadFilename={`${invoiceNum || 'invoice'}.txt`} />
        </div>

        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #invoice-container, #invoice-container * {
              visibility: visible;
            }
            #invoice-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
            }
            .print-hide {
              display: none !important;
            }
            input, textarea {
              border: none !important;
              background: transparent !important;
              resize: none !important;
              padding: 0 !important;
            }
          }
        `}</style>

        <div 
          id="invoice-container"
          className="bg-white dark:bg-zinc-950 border border-[var(--border-subtle)] rounded-2xl p-8 md:p-12 shadow-sm"
        >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
          <div className="space-y-4 flex-1">
            <input aria-label="Your Company Name"
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="text-3xl font-bold text-[var(--text-primary)] bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] dark:hover:border-[var(--border-subtle)] focus:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 w-full transition-colors"
              placeholder="Your Company Name"
            />
            <textarea aria-label="Your Address & Contact Info"
              value={senderDetails}
              onChange={(e) => setSenderDetails(e.target.value)}
              className="text-[var(--text-secondary)] bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] dark:hover:border-[var(--border-subtle)] focus:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 w-full h-24 resize-none transition-colors"
              placeholder="Your Address & Contact Info"
            />
          </div>
          
          <div className="space-y-4 md:text-right">
            <h2 className="text-4xl font-black text-indigo-100 dark:text-indigo-900/50 uppercase tracking-widest">
              Invoice
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex md:justify-end gap-2 items-center">
                <span className="font-semibold text-[var(--text-primary)]">Invoice #:</span>
                <input aria-label="Invoice #:"
                  type="text"
                  value={invoiceNum}
                  onChange={(e) => setInvoiceNum(e.target.value)}
                  className="w-32 bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] dark:hover:border-[var(--border-subtle)] focus:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 md:text-right font-mono"
                />
              </div>
              <div className="flex md:justify-end gap-2 items-center">
                <span className="font-semibold text-[var(--text-primary)]">Date:</span>
                <input aria-label="Date:"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-36 bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] dark:hover:border-[var(--border-subtle)] focus:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 md:text-right"
                />
              </div>
              <div className="flex md:justify-end gap-2 items-center">
                <span className="font-semibold text-[var(--text-primary)]">Due Date:</span>
                <input aria-label="Due Date:"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-36 bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] dark:hover:border-[var(--border-subtle)] focus:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 md:text-right text-[var(--text-secondary)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-12">
          <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Bill To</h3>
          <div className="space-y-2 max-w-sm">
            <input aria-label="Bill To"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="text-lg font-bold text-[var(--text-primary)] bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] dark:hover:border-[var(--border-subtle)] focus:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 w-full"
              placeholder="Client Name"
            />
            <textarea aria-label="Client Address & Info"
              value={clientDetails}
              onChange={(e) => setClientDetails(e.target.value)}
              className="text-[var(--text-secondary)] bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] dark:hover:border-[var(--border-subtle)] focus:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 w-full h-24 resize-none"
              placeholder="Client Address & Info"
            />
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-12 overflow-x-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y border-[var(--border-subtle)] text-[var(--text-primary)]">
                <th className="py-3 px-2 font-semibold">Description</th>
                <th className="py-3 px-2 font-semibold w-24 text-right">Qty</th>
                <th className="py-3 px-2 font-semibold w-32 text-right">Rate</th>
                <th className="py-3 px-2 font-semibold w-32 text-right">Amount</th>
                <th className="py-3 px-2 w-10 print-hide"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {items.map((item, idx) => (
                <tr key={item.id} className="group">
                  <td className="py-3 px-2">
                    <input aria-label="Item description"
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      className="w-full bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] dark:hover:border-[var(--border-subtle)] focus:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-[var(--text-primary)] dark:text-zinc-300"
                      placeholder="Item description"
                    />
                  </td>
                  <td className="py-3 px-2 text-right">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity} aria-label={`Item ${idx + 1} quantity`}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full text-right bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] dark:hover:border-[var(--border-subtle)] focus:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-[var(--text-primary)] dark:text-zinc-300"
                    />
                  </td>
                  <td className="py-3 px-2 text-right">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate} aria-label={`Item ${idx + 1} rate`}
                      onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full text-right bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] dark:hover:border-[var(--border-subtle)] focus:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-[var(--text-primary)] dark:text-zinc-300"
                    />
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-[var(--text-primary)]">
                    ${(item.quantity * item.rate).toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right print-hide">
                    <button
                      aria-label={item.description ? `Remove ${item.description}` : `Remove invoice item ${idx + 1}`}
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          
          <button
            onClick={handleAddItem}
            className="mt-4 text-sm font-medium text-[var(--accent)] dark:text-[var(--accent)] hover:text-indigo-700 flex items-center gap-1 print-hide"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {/* Totals & Notes */}
        <div className="flex flex-col-reverse md:flex-row justify-between gap-8">
          <div className="flex-1">
            <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Notes</h3>
            <textarea aria-label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-[var(--text-secondary)] bg-transparent border-b border-transparent hover:border-[var(--border-subtle)] dark:hover:border-[var(--border-subtle)] focus:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 w-full h-24 resize-none"
              placeholder="Terms, payment instructions, etc."
            />
          </div>
          
          <div className="w-full md:w-64 space-y-3 text-[var(--text-primary)]">
            <div className="flex justify-between items-center py-1">
              <span className="text-[var(--text-secondary)]">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center py-1 group">
              <span className="text-[var(--text-secondary)] flex items-center gap-1">
                Tax 
                <span className="print-hide text-xs bg-[var(--bg-surface)] px-1 rounded flex items-center">
                  <input aria-label="Tax"
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-8 text-right bg-transparent focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                  />
                  %
                </span>
                <span className="hidden print:inline">({taxRate}%)</span>
              </span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-t-2 border-zinc-900 dark:border-white">
              <span className="font-bold">Total</span>
              <span className="font-bold text-xl">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}