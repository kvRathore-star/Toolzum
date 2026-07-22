"use client";

import React, { useState, useRef } from 'react';
import { Download, FileText, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';

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

function generateAgreementHtml(data: AgreementForm): string {
  const d = (v: string) => v || '__________________';
  const inWords = (n: string) => n ? `₹${Number(n).toLocaleString('en-IN')}` : '__________________';
  return `
    <div style="font-family: 'Times New Roman', Times, serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; line-height: 1.8;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px;">Leave & License Agreement</h1>
        <p style="font-size: 13px; color: #666;">(Residential Premises)</p>
      </div>

      <p style="text-align: justify; font-size: 14px; margin-bottom: 20px;">
        This Leave and License Agreement is made and executed at ${d(data.city)}, ${d(data.state)} on this ${new Date().getDate()} day of ${new Date().toLocaleString('default', { month: 'long' })}, ${new Date().getFullYear()}.
      </p>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">PARTIES</h2>
        <p style="font-size: 14px; text-align: justify;">
          <b>LICENSOR</b>: ${d(data.landlordName)} S/o ${d(data.landlordFatherName)}, residing at ${d(data.landlordAddress)} (hereinafter referred to as the "Licensor").
        </p>
        <p style="font-size: 14px; text-align: justify; margin-top: 8px;">
          <b>LICENSEE</b>: ${d(data.tenantName)} S/o ${d(data.tenantFatherName)}, residing at ${d(data.tenantAddress)}, Contact: ${d(data.tenantPhone)} (hereinafter referred to as the "Licensee").
        </p>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">PROPERTY</h2>
        <p style="font-size: 14px; text-align: justify;">
          The Licensor agrees to grant leave and license of the premises being ${d(data.propertyType)} located at ${d(data.fullAddress)}, ${d(data.city)}, ${d(data.state)}.
        </p>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">TERMS & CONDITIONS</h2>
        <ol style="font-size: 14px; padding-left: 20px;">
          <li style="margin-bottom: 8px;"><b>TERM</b>: The license shall commence from ${d(data.leaseStartDate)} and expire on ${d(data.leaseEndDate)}.</li>
          <li style="margin-bottom: 8px;"><b>LICENSE FEE</b>: The Licensee shall pay a monthly license fee of ${inWords(data.monthlyRent)} payable on or before the ${d(data.rentDueDay)}th day of each calendar month.</li>
          <li style="margin-bottom: 8px;"><b>SECURITY DEPOSIT</b>: An interest-free refundable deposit of ${inWords(data.securityDeposit)} has been paid by the Licensee to the Licensor.</li>
          <li style="margin-bottom: 8px;"><b>PURPOSE</b>: The premises shall be used for ${d(data.purpose)} purposes only.</li>
          <li style="margin-bottom: 8px;"><b>UTILITIES</b>: Electricity charges are ${data.electricityIncluded === 'Yes' ? 'included' : 'not included'} in the license fee. Maintenance charges are ${data.maintenanceIncluded === 'Yes' ? 'included' : 'not included'}.</li>
          <li style="margin-bottom: 8px;"><b>RENT INCREASE</b>: The license fee shall be increased by ${d(data.rentIncreasePercent)}% every ${d(data.rentIncreasePeriod)} months.</li>
          <li style="margin-bottom: 8px;"><b>NOTICE PERIOD</b>: Either party may terminate this agreement by giving ${d(data.noticePeriod)} months' written notice.</li>
          ${data.additionalTerms ? `<li style="margin-bottom: 8px;"><b>ADDITIONAL TERMS</b>: ${d(data.additionalTerms)}</li>` : ''}
        </ol>
      </div>

      <div style="margin-top: 40px; display: flex; justify-content: space-between;">
        <div style="text-align: center; width: 45%;">
          <div style="border-top: 1px solid #333; padding-top: 5px;">
            <p style="font-size: 13px; font-weight: bold;">LICENSOR</p>
            <p style="font-size: 12px; color: #666;">${d(data.landlordName)}</p>
          </div>
        </div>
        <div style="text-align: center; width: 45%;">
          <div style="border-top: 1px solid #333; padding-top: 5px;">
            <p style="font-size: 13px; font-weight: bold;">LICENSEE</p>
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
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const update = (key: keyof AgreementForm, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handlePrint = () => {
    const html = DOMPurify.sanitize(generateAgreementHtml(form));
    const win = window.open('', '_blank');
    if (!win) return toast.error('Please allow pop-ups to print');
    win.document.write(`<html><head><title>Rental Agreement</title>
      <style>@page { margin: 0.6in; } body { font-family: 'Times New Roman', serif; } @media print { .no-print { display: none; } }<\/style>
      </head><body>${html}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3 border border-[var(--border-subtle)]/50 rounded-xl p-4 bg-[var(--bg-overlay)]/50 dark:bg-black/20">
      <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider">{title}</h4>
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
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-blue-500/30">
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-blue-500/30 resize-none h-20" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-blue-500/30" />
      )}
    </div>
  );

  const formContent = (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <Section title="Property Details">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Property Type" value={form.propertyType} onChange={v => update('propertyType', v)}
            options={['Residential Apartment', 'Independent House', 'Commercial Office', 'Shop / Retail', 'Villa', 'Studio', 'PG / Hostel']} />
          <Field label="State" value={form.state} onChange={v => update('state', v)}
            options={['Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other']} />
          <Field label="City" value={form.city} onChange={v => update('city', v)} placeholder="e.g. Mumbai" />
          <Field label="Full Address" value={form.fullAddress} onChange={v => update('fullAddress', v)} placeholder="Building, street, area, pincode" cols={2} />
        </div>
      </Section>

      <Section title="Licensor (Landlord)">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name" value={form.landlordName} onChange={v => update('landlordName', v)} placeholder="As per ID proof" />
          <Field label="Father's Name" value={form.landlordFatherName} onChange={v => update('landlordFatherName', v)} placeholder="Optional" />
          <Field label="Address" value={form.landlordAddress} onChange={v => update('landlordAddress', v)} placeholder="Current address" cols={2} />
        </div>
      </Section>

      <Section title="Licensee (Tenant)">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name" value={form.tenantName} onChange={v => update('tenantName', v)} placeholder="As per ID proof" />
          <Field label="Father's Name" value={form.tenantFatherName} onChange={v => update('tenantFatherName', v)} placeholder="Optional" />
          <Field label="Address" value={form.tenantAddress} onChange={v => update('tenantAddress', v)} placeholder="Current address" />
          <Field label="Phone Number" value={form.tenantPhone} onChange={v => update('tenantPhone', v)} placeholder="+91 98765 43210" />
        </div>
      </Section>

      <Section title="Financial Terms">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Monthly Rent (₹)" value={form.monthlyRent} onChange={v => update('monthlyRent', v)} placeholder="e.g. 25000" />
          <Field label="Security Deposit (₹)" value={form.securityDeposit} onChange={v => update('securityDeposit', v)} placeholder="e.g. 50000" />
          <Field label="Rent Due Day" value={form.rentDueDay} onChange={v => update('rentDueDay', v)} placeholder="e.g. 5" />
          <Field label="Rent Increase (%)" value={form.rentIncreasePercent} onChange={v => update('rentIncreasePercent', v)}
            options={['5', '10', '15', '0']} />
          <Field label="Increase Every" value={form.rentIncreasePeriod} onChange={v => update('rentIncreasePeriod', v)}
            options={['12 months', '24 months', '36 months', 'No increase']} />
        </div>
      </Section>

      <Section title="Lease Period">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date" type="date" value={form.leaseStartDate} onChange={v => update('leaseStartDate', v)} />
          <Field label="End Date" type="date" value={form.leaseEndDate} onChange={v => update('leaseEndDate', v)} />
          <Field label="Notice Period" value={form.noticePeriod} onChange={v => update('noticePeriod', v)}
            options={['1 month', '2 months', '3 months', '6 months']} />
          <Field label="Purpose" value={form.purpose} onChange={v => update('purpose', v)}
            options={['Residential', 'Commercial', 'Office', 'Both Residential & Commercial']} />
        </div>
      </Section>

      <Section title="Utilities & Additional">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Electricity Included?" value={form.electricityIncluded} onChange={v => update('electricityIncluded', v)}
            options={['Yes', 'No', 'Shared as per meter']} />
          <Field label="Maintenance Included?" value={form.maintenanceIncluded} onChange={v => update('maintenanceIncluded', v)}
            options={['Yes', 'No', 'Shared']} />
          <Field label="Additional Terms" value={form.additionalTerms} onChange={v => update('additionalTerms', v)} type="textarea" placeholder="Any special conditions..." cols={2} />
        </div>
      </Section>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Rental Agreement Generator</h3>
      </div>

      <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Agreement Details</span>
            <button onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors">
              {showPreview ? <><EyeOff className="w-3.5 h-3.5" /> Hide</> : <><Eye className="w-3.5 h-3.5" /> Preview</>}
            </button>
          </div>
          {formContent}
        </div>

        {showPreview && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Agreement Preview</span>
              <button onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl text-xs transition-colors">
                <Download className="w-3.5 h-3.5" /> Download / Print PDF
              </button>
            </div>
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden max-h-[80vh] overflow-y-auto">
              <div ref={previewRef} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(generateAgreementHtml(form)) }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
