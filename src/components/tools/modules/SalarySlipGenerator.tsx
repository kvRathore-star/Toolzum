"use client";

import React, { useState, useMemo } from 'react';
import { Download, IndianRupee, Building2, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import DOMPurify from 'dompurify';

interface SalarySlipData {
  companyName: string;
  companyAddress: string;
  employeeName: string;
  employeeId: string;
  designation: string;
  department: string;
  pan: string;
  bankName: string;
  accountNumber: string;
  month: string;
  year: string;
  basic: number;
  hra: number;
  conveyance: number;
  medical: number;
  special: number;
  bonus: number;
  pf: number;
  professionalTax: number;
  tds: number;
  insurance: number;
}

const initialData: SalarySlipData = {
  companyName: '', companyAddress: '', employeeName: '', employeeId: '',
  designation: '', department: '', pan: '', bankName: '', accountNumber: '',
  month: new Date().toLocaleString('default', { month: 'long' }),
  year: String(new Date().getFullYear()),
  basic: 0, hra: 0, conveyance: 0, medical: 0, special: 0, bonus: 0,
  pf: 0, professionalTax: 0, tds: 0, insurance: 0,
};

function numInWords(n: number): string {
  if (n === 0) return 'Zero';
  const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const b = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const fn = (num: number): string => {
    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num / 10)] + (num % 10 ? ' ' + a[num % 10] : '');
    if (num < 1000) return a[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + fn(num % 100) : '');
    if (num < 100000) return fn(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + fn(num % 1000) : '');
    if (num < 10000000) return fn(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + fn(num % 100000) : '');
    return fn(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + fn(num % 10000000) : '');
  };
  return fn(Math.round(n));
}

export default function SalarySlipGenerator() {
  const [data, setData] = useState<SalarySlipData>(initialData);
  const [showPreview, setShowPreview] = useState(false);

  const update = (key: keyof SalarySlipData, value: string | number) =>
    setData(prev => ({ ...prev, [key]: value }));

  const earnings = useMemo(() => {
    const total = data.basic + data.hra + data.conveyance + data.medical + data.special + data.bonus;
    return { ...data, totalEarnings: total };
  }, [data]);

  const deductions = useMemo(() => {
    const total = data.pf + data.professionalTax + data.tds + data.insurance;
    return { ...data, totalDeductions: total };
  }, [data]);

  const netPay = useMemo(() => earnings.totalEarnings - deductions.totalDeductions, [earnings, deductions]);

  const generateSlipHtml = (): string => {
    const d = (v: string) => v || '__________________';
    const fmt = (n: number) => n ? `₹${n.toLocaleString('en-IN')}` : '₹0';
    return `
      <div style="font-family:Arial,sans-serif;max-width:850px;margin:0 auto;padding:20px;color:#1a1a1a;font-size:12px;">
        <div style="border:2px solid #1a1a1a;padding:20px;">
          <div style="text-align:center;border-bottom:2px solid #1a1a1a;padding-bottom:12px;margin-bottom:16px;">
            <h1 style="font-size:20px;font-weight:bold;margin:0;text-transform:uppercase;">Salary Slip</h1>
            <p style="font-size:13px;margin:4px 0;font-weight:bold;">${d(data.companyName)}</p>
            <p style="font-size:10px;color:#666;margin:0;">${d(data.companyAddress)}</p>
          </div>

          <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
            <tr><td style="padding:2px 8px;font-weight:bold;width:140px;">Employee Name</td><td style="padding:2px 8px;">${d(data.employeeName)}</td>
                <td style="padding:2px 8px;font-weight:bold;width:100px;">Designation</td><td style="padding:2px 8px;">${d(data.designation)}</td></tr>
            <tr><td style="padding:2px 8px;font-weight:bold;">Employee ID</td><td style="padding:2px 8px;">${d(data.employeeId)}</td>
                <td style="padding:2px 8px;font-weight:bold;">Department</td><td style="padding:2px 8px;">${d(data.department)}</td></tr>
            <tr><td style="padding:2px 8px;font-weight:bold;">PAN</td><td style="padding:2px 8px;">${d(data.pan)}</td>
                <td style="padding:2px 8px;font-weight:bold;">Period</td><td style="padding:2px 8px;">${d(data.month)} ${d(data.year)}</td></tr>
            <tr><td style="padding:2px 8px;font-weight:bold;">Bank</td><td style="padding:2px 8px;">${d(data.bankName)}</td>
                <td style="padding:2px 8px;font-weight:bold;">A/c No.</td><td style="padding:2px 8px;">${d(data.accountNumber)}</td></tr>
          </table>

          <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
            <tr><td style="background:#1a1a1a;color:#fff;padding:6px 8px;font-weight:bold;font-size:11px;">Earnings</td>
                <td style="background:#1a1a1a;color:#fff;padding:6px 8px;font-weight:bold;font-size:11px;text-align:right;width:120px;">Amount (₹)</td></tr>
            ${[{label:'Basic Salary',val:data.basic},{label:'House Rent Allowance',val:data.hra},{label:'Conveyance Allowance',val:data.conveyance},{label:'Medical Allowance',val:data.medical},{label:'Special Allowance',val:data.special},{label:'Bonus / Incentive',val:data.bonus}].map((item,i)=>`
              <tr${i%2===0?' style="background:#f5f5f5;"':''}><td style="padding:4px 8px;">${item.label}</td><td style="padding:4px 8px;text-align:right;">${fmt(item.val)}</td></tr>
            `).join('')}
            <tr style="font-weight:bold;border-top:2px solid #1a1a1a;"><td style="padding:6px 8px;">Total Earnings</td><td style="padding:6px 8px;text-align:right;">${fmt(earnings.totalEarnings)}</td></tr>
          </table>

          <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
            <tr><td style="background:#1a1a1a;color:#fff;padding:6px 8px;font-weight:bold;font-size:11px;">Deductions</td>
                <td style="background:#1a1a1a;color:#fff;padding:6px 8px;font-weight:bold;font-size:11px;text-align:right;width:120px;">Amount (₹)</td></tr>
            ${[{label:'Provident Fund',val:data.pf},{label:'Professional Tax',val:data.professionalTax},{label:'TDS / Income Tax',val:data.tds},{label:'Insurance Premium',val:data.insurance}].map((item,i)=>`
              <tr${i%2===0?' style="background:#f5f5f5;"':''}><td style="padding:4px 8px;">${item.label}</td><td style="padding:4px 8px;text-align:right;">${fmt(item.val)}</td></tr>
            `).join('')}
            <tr style="font-weight:bold;border-top:2px solid #1a1a1a;"><td style="padding:6px 8px;">Total Deductions</td><td style="padding:6px 8px;text-align:right;">${fmt(deductions.totalDeductions)}</td></tr>
          </table>

          <div style="border:2px solid #1a1a1a;padding:10px;text-align:center;margin-bottom:12px;">
            <span style="font-size:16px;font-weight:bold;">Net Pay: ${fmt(netPay)}</span>
            <div style="font-size:11px;color:#555;margin-top:4px;">Rupees ${numInWords(netPay)} Only</div>
          </div>

          <div style="display:flex;justify-content:space-between;margin-top:30px;padding-top:10px;border-top:1px solid #ccc;">
            <div style="text-align:center;width:45%;">
              <div style="border-top:1px solid #333;padding-top:4px;font-size:11px;font-weight:bold;">Employer Signature</div>
            </div>
            <div style="text-align:center;width:45%;">
              <div style="border-top:1px solid #333;padding-top:4px;font-size:11px;font-weight:bold;">Employee Signature</div>
            </div>
          </div>

          <div style="text-align:center;margin-top:16px;font-size:9px;color:#999;border-top:1px solid #ddd;padding-top:8px;">
            This is a computer-generated salary slip. Generated via ToolHub.
          </div>
        </div>
      </div>
    `;
  };

  const handlePrint = () => {
    if (!data.employeeName.trim()) return toast.error('Enter employee name');
    const html = generateSlipHtml();
    const win = window.open('', '_blank');
    if (!win) return toast.error('Allow pop-ups to generate');
    win.document.write(`<html><head><title>Salary Slip - ${data.employeeName}</title><style>@page{margin:0.3in}body{font-family:Arial,sans-serif;margin:0;padding:0;}<\/style></head><body>${html}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
    toast.success('Salary slip generated!');
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3 border border-zinc-200 dark:border-zinc-700/50 rounded-xl p-4 bg-zinc-50/50 dark:bg-black/20">
      <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider">{title}</h4>
      {children}
    </div>
  );

  const Field = ({ label: lbl, value, onChange, placeholder, type = 'text', cols = 1 }: {
    label: string; value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string; cols?: number;
  }) => (
    <div className={cols > 1 ? 'md:col-span-2' : ''}>
      <label className="block text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 mb-0.5">{lbl}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-5">
        <IndianRupee className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Salary Slip Generator</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Employee & Earnings</span>
            <button onClick={() => setShowPreview(!showPreview)}
              className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors">
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <Section title="Company Details">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Company Name" value={data.companyName} onChange={v => update('companyName', v)} placeholder="e.g. Acme Corp" cols={2} />
                <Field label="Address" value={data.companyAddress} onChange={v => update('companyAddress', v)} placeholder="e.g. Mumbai, Maharashtra" cols={2} />
              </div>
            </Section>

            <Section title="Employee Details">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Employee Name" value={data.employeeName} onChange={v => update('employeeName', v)} placeholder="Full name" />
                <Field label="Employee ID" value={data.employeeId} onChange={v => update('employeeId', v)} placeholder="e.g. EMP001" />
                <Field label="Designation" value={data.designation} onChange={v => update('designation', v)} placeholder="e.g. Software Engineer" />
                <Field label="Department" value={data.department} onChange={v => update('department', v)} placeholder="e.g. Engineering" />
                <Field label="PAN Number" value={data.pan} onChange={v => update('pan', v)} placeholder="e.g. AABCU1234D" />
                <Field label="Bank Name" value={data.bankName} onChange={v => update('bankName', v)} placeholder="e.g. HDFC Bank" />
                <Field label="Account Number" value={data.accountNumber} onChange={v => update('accountNumber', v)} placeholder="e.g. 1234567890" />
                <Field label="Month" value={data.month} onChange={v => update('month', v)}
                  placeholder="January" />
                <Field label="Year" type="number" value={data.year} onChange={v => update('year', v)} placeholder="2025" />
              </div>
            </Section>

            <Section title="Earnings">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Basic Salary (₹)" type="number" value={data.basic} onChange={v => update('basic', Number(v) || 0)} placeholder="e.g. 30000" />
                <Field label="HRA (₹)" type="number" value={data.hra} onChange={v => update('hra', Number(v) || 0)} placeholder="e.g. 15000" />
                <Field label="Conveyance (₹)" type="number" value={data.conveyance} onChange={v => update('conveyance', Number(v) || 0)} placeholder="e.g. 1600" />
                <Field label="Medical (₹)" type="number" value={data.medical} onChange={v => update('medical', Number(v) || 0)} placeholder="e.g. 1250" />
                <Field label="Special Allowance (₹)" type="number" value={data.special} onChange={v => update('special', Number(v) || 0)} placeholder="e.g. 5000" />
                <Field label="Bonus (₹)" type="number" value={data.bonus} onChange={v => update('bonus', Number(v) || 0)} placeholder="e.g. 2000" />
              </div>
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-lg">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Total Earnings</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{earnings.totalEarnings.toLocaleString('en-IN')}</span>
              </div>
            </Section>

            <Section title="Deductions">
              <div className="grid grid-cols-2 gap-3">
                <Field label="PF (₹)" type="number" value={data.pf} onChange={v => update('pf', Number(v) || 0)} placeholder="e.g. 3600" />
                <Field label="Professional Tax (₹)" type="number" value={data.professionalTax} onChange={v => update('professionalTax', Number(v) || 0)} placeholder="e.g. 200" />
                <Field label="TDS (₹)" type="number" value={data.tds} onChange={v => update('tds', Number(v) || 0)} placeholder="e.g. 2000" />
                <Field label="Insurance (₹)" type="number" value={data.insurance} onChange={v => update('insurance', Number(v) || 0)} placeholder="e.g. 1000" />
              </div>
              <div className="flex items-center justify-between p-2.5 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg">
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Total Deductions</span>
                <span className="text-sm font-bold text-red-500">₹{deductions.totalDeductions.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl">
                <span className="text-xs font-bold uppercase">Net Pay</span>
                <div className="text-right">
                  <span className="text-lg font-black">₹{netPay.toLocaleString('en-IN')}</span>
                  <p className="text-[9px] opacity-70">{numInWords(netPay)} Only</p>
                </div>
              </div>
            </Section>

            <button onClick={handlePrint}
              className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors">
              <Download className="w-4 h-4" /> Generate Salary Slip (PDF)
            </button>
          </div>
        </div>

        {showPreview && (
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden max-h-[80vh] overflow-y-auto sticky top-4">
            <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Preview</span>
              <span className="text-[10px] text-zinc-500">{data.month} {data.year}</span>
            </div>
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(generateSlipHtml()) }} />
          </div>
        )}
      </div>
    </div>
  );
}
