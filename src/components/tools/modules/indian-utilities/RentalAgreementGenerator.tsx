"use client";

import React, { useState, useRef } from 'react';
import { Download, FileText, Eye, EyeOff, Copy, Check, Building, User, IndianRupee, Calendar, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { clipboardWrite } from "@/lib/clipboard";

interface AgreementForm {
  propertyType: string;
  state: string;
  city: string;
  fullAddress: string;
  landlordName: string;
  landlordFatherName: string;
  landlordAddress: string;
  tenantName: string;
  tenantFatherName: string;
  tenantAddress: string;
  tenantPhone: string;
  monthlyRent: string;
  securityDeposit: string;
  leaseStartDate: string;
  leaseEndDate: string;
  noticePeriod: string;
  rentDueDay: string;
  rentIncreasePeriod: string;
  rentIncreasePercent: string;
  electricityIncluded: string;
  maintenanceIncluded: string;
  purpose: string;
  additionalTerms: string;
}

const initialForm: AgreementForm = {
  propertyType: 'Residential Apartment',
  state: 'Maharashtra',
  city: 'Mumbai',
  fullAddress: '',
  landlordName: '',
  landlordFatherName: '',
  landlordAddress: '',
  tenantName: '',
  tenantFatherName: '',
  tenantAddress: '',
  tenantPhone: '',
  monthlyRent: '',
  securityDeposit: '',
  leaseStartDate: '',
  leaseEndDate: '',
  noticePeriod: '3',
  rentDueDay: '5',
  rentIncreasePeriod: '12',
  rentIncreasePercent: '10',
  electricityIncluded: 'No',
  maintenanceIncluded: 'No',
  purpose: 'Residential',
  additionalTerms: '',
};

const TERMS_CHECKLIST = [
  'Rent payment on or before due date',
  'No subletting without landlord consent',
  'Property used only for agreed purpose',
  'No structural changes without permission',
  'Maintain cleanliness and hygiene',
  'Pay utility bills on time',
  'Allow landlord inspection with notice',
  'Return property in original condition',
  'Follow society/colony rules',
  'No illegal activities on premises',
];

function generateAgreementHtml(data: AgreementForm, checkedTerms: string[], agreementType: 'leave-license' | 'tenancy'): string {
  const d = (v: string) => v || '__________________';
  const inWords = (n: string) => n ? `₹${Number(n).toLocaleString('en-IN')}` : '__________________';
  const typeLabel = agreementType === 'leave-license' ? 'Leave & License Agreement' : 'Tenancy Agreement';
  return `
    <div style="font-family: 'Times New Roman', Times, serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; line-height: 1.8;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px;">${typeLabel}</h1>
        <p style="font-size: 13px; color: #666;">(${d(data.purpose)} Premises)</p>
      </div>

      <p style="text-align: justify; font-size: 14px; margin-bottom: 20px;">
        This ${agreementType === 'leave-license' ? 'Leave and License' : 'Tenancy'} Agreement is made and executed at ${d(data.city)}, ${d(data.state)} on this ${new Date().getDate()} day of ${new Date().toLocaleString('default', { month: 'long' })}, ${new Date().getFullYear()}.
      </p>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">PARTIES</h2>
        <p style="font-size: 14px; text-align: justify;">
          <b>${agreementType === 'leave-license' ? 'LICENSOR' : 'LANDLORD'}</b>: ${d(data.landlordName)} S/o ${d(data.landlordFatherName)}, residing at ${d(data.landlordAddress)} (hereinafter referred to as the "${agreementType === 'leave-license' ? 'Licensor' : 'Landlord'}").
        </p>
        <p style="font-size: 14px; text-align: justify; margin-top: 8px;">
          <b>${agreementType === 'leave-license' ? 'LICENSEE' : 'TENANT'}</b>: ${d(data.tenantName)} S/o ${d(data.tenantFatherName)}, residing at ${d(data.tenantAddress)}, Contact: ${d(data.tenantPhone)} (hereinafter referred to as the "${agreementType === 'leave-license' ? 'Licensee' : 'Tenant'}").
        </p>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">PROPERTY</h2>
        <p style="font-size: 14px; text-align: justify;">
          The ${agreementType === 'leave-license' ? 'Licensor' : 'Landlord'} agrees to grant ${agreementType === 'leave-license' ? 'leave and license' : 'tenancy'} of the premises being ${d(data.propertyType)} located at ${d(data.fullAddress)}, ${d(data.city)}, ${d(data.state)}.
        </p>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">TERMS & CONDITIONS</h2>
        <ol style="font-size: 14px; padding-left: 20px;">
          <li style="margin-bottom: 8px;"><b>TERM</b>: The ${agreementType === 'leave-license' ? 'license' : 'tenancy'} shall commence from ${d(data.leaseStartDate)} and expire on ${d(data.leaseEndDate)}.</li>
          <li style="margin-bottom: 8px;"><b>${agreementType === 'leave-license' ? 'LICENSE FEE' : 'RENT'}</b>: The ${agreementType === 'leave-license' ? 'Licensee' : 'Tenant'} shall pay a monthly ${agreementType === 'leave-license' ? 'license fee' : 'rent'} of ${inWords(data.monthlyRent)} payable on or before the ${d(data.rentDueDay)}th day of each calendar month.</li>
          <li style="margin-bottom: 8px;"><b>SECURITY DEPOSIT</b>: An interest-free refundable deposit of ${inWords(data.securityDeposit)} has been paid by the ${agreementType === 'leave-license' ? 'Licensee' : 'Tenant'} to the ${agreementType === 'leave-license' ? 'Licensor' : 'Landlord'}.</li>
          <li style="margin-bottom: 8px;"><b>PURPOSE</b>: The premises shall be used for ${d(data.purpose)} purposes only.</li>
          <li style="margin-bottom: 8px;"><b>UTILITIES</b>: Electricity charges are ${data.electricityIncluded === 'Yes' ? 'included' : 'not included'} in the ${agreementType === 'leave-license' ? 'license fee' : 'rent'}. Maintenance charges are ${data.maintenanceIncluded === 'Yes' ? 'included' : 'not included'}.</li>
          <li style="margin-bottom: 8px;"><b>RENT INCREASE</b>: The ${agreementType === 'leave-license' ? 'license fee' : 'rent'} shall be increased by ${d(data.rentIncreasePercent)}% every ${d(data.rentIncreasePeriod)} months.</li>
          <li style="margin-bottom: 8px;"><b>NOTICE PERIOD</b>: Either party may terminate this agreement by giving ${d(data.noticePeriod)} months' written notice.</li>
          ${checkedTerms.length > 0 ? `<li style="margin-bottom: 8px;"><b>ADDITIONAL COVENANTS</b>:<ul style="margin-top: 4px;">${checkedTerms.map(t => `<li>${t}</li>`).join('')}</ul></li>` : ''}
          ${data.additionalTerms ? `<li style="margin-bottom: 8px;"><b>ADDITIONAL TERMS</b>: ${d(data.additionalTerms)}</li>` : ''}
        </ol>
      </div>

      <div style="margin-top: 40px; display: flex; justify-content: space-between;">
        <div style="text-align: center; width: 45%;">
          <div style="border-top: 1px solid #333; padding-top: 5px;">
            <p style="font-size: 13px; font-weight: bold;">${agreementType === 'leave-license' ? 'LICENSOR' : 'LANDLORD'}</p>
            <p style="font-size: 12px; color: #666;">${d(data.landlordName)}</p>
          </div>
        </div>
        <div style="text-align: center; width: 45%;">
          <div style="border-top: 1px solid #333; padding-top: 5px;">
            <p style="font-size: 13px; font-weight: bold;">${agreementType === 'leave-license' ? 'LICENSEE' : 'TENANT'}</p>
            <p style="font-size: 12px; color: #666;">${d(data.tenantName)}</p>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #ddd; padding-top: 15px;">
        <p>This is a computer-generated agreement and does not require a physical signature.</p>
        <p>Generated via Toolzum &bull; For reference only &bull; Consult a legal professional for execution</p>
      </div>
    </div>
  `;
}

export default function RentalAgreementGenerator() {
  const [form, setForm] = useState<AgreementForm>(initialForm);
  const [agreementType, setAgreementType] = useState<'leave-license' | 'tenancy'>('leave-license');
  const [checkedTerms, setCheckedTerms] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const update = (key: keyof AgreementForm, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleTerm = (term: string) => {
    setCheckedTerms(prev => prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term]);
  };

  const handlePrint = () => {
    const html = DOMPurify.sanitize(generateAgreementHtml(form, checkedTerms, agreementType));
    const win = window.open('', '_blank');
    if (!win) return toast.error('Please allow pop-ups to print');
    win.document.write(`<html><head><title>${agreementType === 'leave-license' ? 'Leave & License' : 'Tenancy'} Agreement</title>
      <style>@page { margin: 0.6in; } body { font-family: 'Times New Roman', serif; } @media print { .no-print { display: none; } }<\/style>
      </head><body>${html}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  const handleCopyText = () => {
    const text = generateAgreementHtml(form, checkedTerms, agreementType).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    clipboardWrite(text).then(ok => { if (ok) { setCopied(true); toast.success('Agreement text copied!'); setTimeout(() => setCopied(false), 2000); } else toast.error('Copy blocked by the browser — select the text manually.'); });
  };

  const Section = ({ title, icon: Icon, children }: { title: string; icon?: React.ElementType; children: React.ReactNode }) => (
    <div className="space-y-3 border border-[var(--border-subtle)]/60 rounded-xl p-4 bg-[var(--bg-overlay)]/50 dark:bg-black/20">
      <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">{Icon && <Icon className="w-3.5 h-3.5" />}{title}</h3>
      {children}
    </div>
  );

  const Field = ({ label: lbl, value, onChange, options, placeholder, type = 'text', cols = 1 }: {
    label: string; value: string; onChange: (v: string) => void;
    options?: string[]; placeholder?: string; type?: string; cols?: number;
  }) => (
    <div className={cols > 1 ? 'md:col-span-2' : ''}>
      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">{lbl}</label>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} aria-label={lbl}
          className="w-full bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-amber-500/30 transition-all">
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label={lbl}
          className="w-full bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-amber-500/30 resize-none h-20 transition-all" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label={lbl}
          className="w-full bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-amber-500/30 transition-all" />
      )}
    </div>
  );

  const formContent = (
    <div className="space-y-4">
      <Section title="Agreement Type" icon={FileText}>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setAgreementType('leave-license')}
            className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
              agreementType === 'leave-license'
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300 shadow-sm'
                : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
            }`}>
            <Building className="w-4 h-4 mx-auto mb-1" />
            Leave & License
            <p className="text-[9px] font-normal opacity-70 mt-0.5">Residential lease</p>
          </button>
          <button onClick={() => setAgreementType('tenancy')}
            className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
              agreementType === 'tenancy'
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300 shadow-sm'
                : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
            }`}>
            <User className="w-4 h-4 mx-auto mb-1" />
            Tenancy
            <p className="text-[9px] font-normal opacity-70 mt-0.5">Long-term rental</p>
          </button>
        </div>
      </Section>

      <Section title="Property Details" icon={Building}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Property Type" value={form.propertyType} onChange={v => update('propertyType', v)}
            options={['Residential Apartment', 'Independent House', 'Commercial Office', 'Shop / Retail', 'Villa', 'Studio', 'PG / Hostel']} />
          <Field label="State" value={form.state} onChange={v => update('state', v)}
            options={['Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other']} />
          <Field label="City" value={form.city} onChange={v => update('city', v)} placeholder="e.g. Mumbai" />
          <Field label="Full Address" value={form.fullAddress} onChange={v => update('fullAddress', v)} placeholder="Building, street, area, pincode" cols={2} />
        </div>
      </Section>

      <Section title={agreementType === 'leave-license' ? 'Licensor (Landlord)' : 'Landlord'} icon={User}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name" value={form.landlordName} onChange={v => update('landlordName', v)} placeholder="As per ID proof" />
          <Field label="Father's Name" value={form.landlordFatherName} onChange={v => update('landlordFatherName', v)} placeholder="Optional" />
          <Field label="Address" value={form.landlordAddress} onChange={v => update('landlordAddress', v)} placeholder="Current address" cols={2} />
        </div>
      </Section>

      <Section title={agreementType === 'leave-license' ? 'Licensee (Tenant)' : 'Tenant'} icon={User}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name" value={form.tenantName} onChange={v => update('tenantName', v)} placeholder="As per ID proof" />
          <Field label="Father's Name" value={form.tenantFatherName} onChange={v => update('tenantFatherName', v)} placeholder="Optional" />
          <Field label="Address" value={form.tenantAddress} onChange={v => update('tenantAddress', v)} placeholder="Current address" />
          <Field label="Phone Number" value={form.tenantPhone} onChange={v => update('tenantPhone', v)} placeholder="+91 98765 43210" />
        </div>
      </Section>

      <Section title="Financial Terms" icon={IndianRupee}>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-200/50 dark:border-amber-800/30">
            <label htmlFor="lbl-rentalagreementgenerator-monthly-rent" className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase block mb-1">Monthly Rent (₹)</label>
            <input id="lbl-rentalagreementgenerator-monthly-rent" aria-label="Monthly Rent (₹)" value={form.monthlyRent} onChange={e => update('monthlyRent', e.target.value)} placeholder="e.g. 25000"
              className="w-full bg-transparent border-0 p-0 text-sm font-bold text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
          </div>
          <div className="p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-200/50 dark:border-amber-800/30">
            <label htmlFor="lbl-rentalagreementgenerator-security-deposit" className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase block mb-1">Security Deposit (₹)</label>
            <input id="lbl-rentalagreementgenerator-security-deposit" aria-label="Security Deposit (₹)" value={form.securityDeposit} onChange={e => update('securityDeposit', e.target.value)} placeholder="e.g. 50000"
              className="w-full bg-transparent border-0 p-0 text-sm font-bold text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
          </div>
          <Field label="Rent Due Day" value={form.rentDueDay} onChange={v => update('rentDueDay', v)} placeholder="e.g. 5" />
          <Field label="Rent Increase (%)" value={form.rentIncreasePercent} onChange={v => update('rentIncreasePercent', v)}
            options={['5', '10', '15', '0']} />
          <Field label="Increase Every" value={form.rentIncreasePeriod} onChange={v => update('rentIncreasePeriod', v)}
            options={['12 months', '24 months', '36 months', 'No increase']} />
        </div>
      </Section>

      <Section title="Lease Period" icon={Calendar}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date" type="date" value={form.leaseStartDate} onChange={v => update('leaseStartDate', v)} />
          <Field label="End Date" type="date" value={form.leaseEndDate} onChange={v => update('leaseEndDate', v)} />
          <Field label="Notice Period" value={form.noticePeriod} onChange={v => update('noticePeriod', v)}
            options={['1 month', '2 months', '3 months', '6 months']} />
          <Field label="Purpose" value={form.purpose} onChange={v => update('purpose', v)}
            options={['Residential', 'Commercial', 'Office', 'Both Residential & Commercial']} />
        </div>
      </Section>

      <Section title="Utilities & Additional" icon={ShieldCheck}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Electricity Included?" value={form.electricityIncluded} onChange={v => update('electricityIncluded', v)}
            options={['Yes', 'No', 'Shared as per meter']} />
          <Field label="Maintenance Included?" value={form.maintenanceIncluded} onChange={v => update('maintenanceIncluded', v)}
            options={['Yes', 'No', 'Shared']} />
          <Field label="Additional Terms" value={form.additionalTerms} onChange={v => update('additionalTerms', v)} type="textarea" placeholder="Any special conditions..." cols={2} />
        </div>
      </Section>

      <Section title="Terms Checklist" icon={ShieldCheck}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {TERMS_CHECKLIST.map(term => (
            <label key={term} className="flex items-start gap-2 cursor-pointer group">
              <input type="checkbox" checked={checkedTerms.includes(term)} onChange={() => toggleTerm(term)}
                className="mt-0.5 accent-amber-500 w-3.5 h-3.5 rounded border-[var(--border-subtle)] dark:border-[var(--border-subtle)]" />
              <span className="text-[11px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{term}</span>
            </label>
          ))}
        </div>
      </Section>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Rental Agreement Generator</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl">
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {formContent}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden sticky top-6">
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-overlay)]/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">Agreement Preview</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={handleCopyText}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] rounded-lg text-[10px] font-semibold transition-all active:scale-95">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button onClick={handlePrint}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg text-[10px] font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-95">
                    <Download className="w-3 h-3" /> PDF
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 bg-[var(--bg-overlay)] max-h-[75vh] overflow-y-auto">
              <div className="bg-white rounded-xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
                <div ref={previewRef} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(generateAgreementHtml(form, checkedTerms, agreementType)) }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
