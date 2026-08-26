"use client";
import React, { useState } from 'react';
import { FileText, Printer, Plus, Trash2, Calculator } from 'lucide-react';

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

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center print:hidden">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
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
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="text-3xl font-bold text-[var(--text-primary)] bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 outline-none w-full transition-colors"
              placeholder="Your Company Name"
            />
            <textarea
              value={senderDetails}
              onChange={(e) => setSenderDetails(e.target.value)}
              className="text-[var(--text-secondary)] bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 outline-none w-full h-24 resize-none transition-colors"
              placeholder="Your Address & Contact Info"
            />
          </div>
          
          <div className="space-y-4 md:text-right">
            <h1 className="text-4xl font-black text-indigo-100 dark:text-indigo-900/50 uppercase tracking-widest">
              Invoice
            </h1>
            <div className="space-y-2 text-sm">
              <div className="flex md:justify-end gap-2 items-center">
                <span className="font-semibold text-[var(--text-primary)]">Invoice #:</span>
                <input
                  type="text"
                  value={invoiceNum}
                  onChange={(e) => setInvoiceNum(e.target.value)}
                  className="w-32 bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 outline-none md:text-right font-mono"
                />
              </div>
              <div className="flex md:justify-end gap-2 items-center">
                <span className="font-semibold text-[var(--text-primary)]">Date:</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-36 bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 outline-none md:text-right"
                />
              </div>
              <div className="flex md:justify-end gap-2 items-center">
                <span className="font-semibold text-[var(--text-primary)]">Due Date:</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-36 bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 outline-none md:text-right text-[var(--text-secondary)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-12">
          <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Bill To</h3>
          <div className="space-y-2 max-w-sm">
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="text-lg font-bold text-[var(--text-primary)] bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 outline-none w-full"
              placeholder="Client Name"
            />
            <textarea
              value={clientDetails}
              onChange={(e) => setClientDetails(e.target.value)}
              className="text-[var(--text-secondary)] bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 outline-none w-full h-24 resize-none"
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
              {items.map((item) => (
                <tr key={item.id} className="group">
                  <td className="py-3 px-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      className="w-full bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 outline-none text-zinc-900 dark:text-zinc-300"
                      placeholder="Item description"
                    />
                  </td>
                  <td className="py-3 px-2 text-right">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full text-right bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 outline-none text-zinc-900 dark:text-zinc-300"
                    />
                  </td>
                  <td className="py-3 px-2 text-right">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-full text-right bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 outline-none text-zinc-900 dark:text-zinc-300"
                    />
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-[var(--text-primary)]">
                    ${(item.quantity * item.rate).toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-right print-hide">
                    <button
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
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-[var(--text-secondary)] bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-500 outline-none w-full h-24 resize-none"
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
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-8 text-right bg-transparent outline-none"
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