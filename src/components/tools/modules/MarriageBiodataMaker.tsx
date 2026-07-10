"use client";

import React, { useState, useRef } from 'react';
import { Download, Heart, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BiodataForm {
  fullName: string;
  dateOfBirth: string;
  age: string;
  height: string;
  weight: string;
  complexion: string;
  bloodGroup: string;
  maritalStatus: string;
  religion: string;
  caste: string;
  subcaste: string;
  gotra: string;
  education: string;
  college: string;
  occupation: string;
  annualIncome: string;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  siblings: string;
  city: string;
  state: string;
  country: string;
  dietaryHabits: string;
  hobbies: string;
  aboutSelf: string;
  expectations: string;
  contactName: string;
  contactRelation: string;
  contactPhone: string;
  contactEmail: string;
}

const initialForm: BiodataForm = {
  fullName: '', dateOfBirth: '', age: '', height: '', weight: '', complexion: '',
  bloodGroup: '', maritalStatus: 'Unmarried', religion: 'Hindu', caste: '', subcaste: '',
  gotra: '', education: '', college: '', occupation: '', annualIncome: '',
  fatherName: '', fatherOccupation: '', motherName: '', motherOccupation: '',
  siblings: '', city: '', state: '', country: 'India', dietaryHabits: '',
  hobbies: '', aboutSelf: '', expectations: '',
  contactName: '', contactRelation: '', contactPhone: '', contactEmail: ''
};

function BiodataPreview({ data, previewRef }: { data: BiodataForm; previewRef: React.RefObject<HTMLDivElement | null> }) {
  const hasAny = (field: string) => field.trim().length > 0;
  const label = (l: string) => <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">{l}</span>;

  return (
    <div ref={previewRef} className="bg-white text-zinc-900 rounded-2xl border border-zinc-200 shadow-sm overflow-hidden print:shadow-none print:border-0">
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white text-center py-6 px-4">
        <h1 className="text-2xl font-bold tracking-tight">MATRIMONIAL BIODATA</h1>
      </div>

      <div className="p-5 space-y-4 text-xs">
        <div className="text-center pb-3 border-b border-zinc-200">
          <h2 className="text-xl font-bold">{data.fullName || 'Your Name'}</h2>
          <p className="text-zinc-500">{data.occupation || ''}{data.occupation && data.city ? ', ' : ''}{data.city || ''}</p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-rose-600 mb-2">Personal Details</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {data.dateOfBirth && <div>{label('Date of Birth')}<span>{data.dateOfBirth}</span></div>}
            {data.age && <div>{label('Age')}<span>{data.age}</span></div>}
            {data.height && <div>{label('Height')}<span>{data.height}</span></div>}
            {data.complexion && <div>{label('Complexion')}<span>{data.complexion}</span></div>}
            {data.bloodGroup && <div>{label('Blood Group')}<span>{data.bloodGroup}</span></div>}
            {data.maritalStatus && <div>{label('Marital Status')}<span>{data.maritalStatus}</span></div>}
            {data.religion && <div>{label('Religion')}<span>{data.religion}</span></div>}
            {data.caste && <div>{label('Caste')}<span>{data.caste}{data.subcaste ? ` / ${data.subcaste}` : ''}</span></div>}
            {data.gotra && <div>{label('Gotra')}<span>{data.gotra}</span></div>}
            {data.dietaryHabits && <div>{label('Diet')}<span>{data.dietaryHabits}</span></div>}
          </div>
        </div>

        {hasAny(data.education) && (
          <div>
            <h3 className="text-sm font-bold text-rose-600 mb-2">Education & Career</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {data.education && <div>{label('Education')}<span>{data.education}</span></div>}
              {data.college && <div>{label('College/University')}<span>{data.college}</span></div>}
              {data.occupation && <div className="col-span-2">{label('Occupation')}<span>{data.occupation}</span></div>}
              {data.annualIncome && <div className="col-span-2">{label('Annual Income')}<span className="text-emerald-600 font-semibold">{data.annualIncome}</span></div>}
            </div>
          </div>
        )}

        {(hasAny(data.fatherName) || hasAny(data.motherName)) && (
          <div>
            <h3 className="text-sm font-bold text-rose-600 mb-2">Family Details</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {data.fatherName && <div>{label('Father')}<span>{data.fatherName}{data.fatherOccupation ? ` (${data.fatherOccupation})` : ''}</span></div>}
              {data.motherName && <div>{label('Mother')}<span>{data.motherName}{data.motherOccupation ? ` (${data.motherOccupation})` : ''}</span></div>}
              {data.siblings && <div className="col-span-2">{label('Siblings')}<span>{data.siblings}</span></div>}
            </div>
          </div>
        )}

        {hasAny(data.hobbies) && <div>{label('Hobbies / Interests')}<span>{data.hobbies}</span></div>}

        {hasAny(data.aboutSelf) && (
          <div>
            <h3 className="text-sm font-bold text-rose-600 mb-2">About Self</h3>
            <p className="text-zinc-700 leading-relaxed">{data.aboutSelf}</p>
          </div>
        )}

        {hasAny(data.expectations) && (
          <div>
            <h3 className="text-sm font-bold text-rose-600 mb-2">Partner Expectations</h3>
            <p className="text-zinc-700 leading-relaxed">{data.expectations}</p>
          </div>
        )}

        {hasAny(data.contactPhone) && (
          <div className="border-t border-zinc-200 pt-3">
            <h3 className="text-sm font-bold text-rose-600 mb-2">Contact Information</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {data.contactName && <div>{label('Name')}<span>{data.contactName}</span></div>}
              {data.contactRelation && <div>{label('Relation')}<span>{data.contactRelation}</span></div>}
              {data.contactPhone && <div className="col-span-2">{label('Phone')}<span className="text-blue-600">{data.contactPhone}</span></div>}
            </div>
          </div>
        )}

        <div className="text-center pt-3 border-t border-zinc-200 text-[9px] text-zinc-400">
          Generated via Toolzum &bull; Not a legal document
        </div>
      </div>
    </div>
  );
}

export default function MarriageBiodataMaker() {
  const [form, setForm] = useState<BiodataForm>(initialForm);
  const [showPreview, setShowPreview] = useState(false);
  const [template, setTemplate] = useState<'classic' | 'elegant'>('classic');
  const previewRef = useRef<HTMLDivElement>(null);

  const update = (key: keyof BiodataForm, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handlePrint = () => {
    if (!previewRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return toast.error('Please allow pop-ups to print');
    const content = previewRef.current.innerHTML;
    printWindow.document.write(`
      <html><head><title>Marriage Biodata - ${form.fullName || 'Untitled'}</title>
      <script src="https://cdn.tailwindcss.com"><\/script>
      <style>@page { margin: 0.5in; } body { font-family: Georgia, serif; } .no-print { display: none !important; } .print\\:shadow-none { box-shadow: none !important; } .print\\:border-0 { border: none !important; }<\/style>
      </head><body>${content}</body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3 border border-zinc-200 dark:border-zinc-700/50 rounded-xl p-4 bg-zinc-50/50 dark:bg-black/20">
      <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider">{title}</h4>
      {children}
    </div>
  );

  const Field = ({ label: lbl, value, onChange, options, placeholder, type = 'text', cols = 1 }: {
    label: string; value: string; onChange: (v: string) => void;
    options?: string[]; placeholder?: string; type?: string; cols?: number;
  }) => (
    <div className={cols > 1 ? 'col-span-2' : ''}>
      <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">{lbl}</label>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/30">
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/30 resize-none h-20" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/30" />
      )}
    </div>
  );

  const formContent = (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <Section title="Personal Info">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name *" value={form.fullName} onChange={v => update('fullName', v)} placeholder="As per documents" cols={2} />
          <Field label="Date of Birth" type="date" value={form.dateOfBirth} onChange={v => update('dateOfBirth', v)} />
          <Field label="Age" value={form.age} onChange={v => update('age', v)} placeholder="e.g. 28" />
          <Field label="Height" value={form.height} onChange={v => update('height', v)} placeholder='e.g. 5ft 8in' />
          <Field label="Complexion" value={form.complexion} onChange={v => update('complexion', v)} placeholder="e.g. Fair, Wheatish" />
          <Field label="Blood Group" value={form.bloodGroup} onChange={v => update('bloodGroup', v)} placeholder="e.g. O+" />
          <Field label="Marital Status" value={form.maritalStatus} onChange={v => update('maritalStatus', v)}
            options={['Unmarried', 'Divorced', 'Widowed', 'Awaiting Divorce']} />
        </div>
      </Section>

      <Section title="Religion & Community">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Religion" value={form.religion} onChange={v => update('religion', v)}
            options={['Hindu', 'Muslim', 'Sikh', 'Christian', 'Jain', 'Buddhist', 'Other']} />
          <Field label="Caste" value={form.caste} onChange={v => update('caste', v)} placeholder="e.g. Brahmin, Rajput" />
          <Field label="Subcaste" value={form.subcaste} onChange={v => update('subcaste', v)} placeholder="Optional" />
          <Field label="Gotra" value={form.gotra} onChange={v => update('gotra', v)} placeholder="e.g. Kashyap" />
        </div>
      </Section>

      <Section title="Education & Career">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Highest Education" value={form.education} onChange={v => update('education', v)}
            options={['High School', 'Diploma', "Bachelor's", "Master's", 'PhD', 'CA', 'MBBS', 'LLB', 'Other']} />
          <Field label="College / University" value={form.college} onChange={v => update('college', v)} placeholder="Optional" />
          <Field label="Occupation" value={form.occupation} onChange={v => update('occupation', v)}
            options={['Software Engineer', 'Doctor', 'Lawyer', 'Teacher', 'Business', 'Government Employee', 'CA / Finance', 'Civil Services', 'Other']} cols={2} />
          <Field label="Annual Income (₹)" value={form.annualIncome} onChange={v => update('annualIncome', v)}
            options={['Below ₹5 Lakhs', '₹5-10 Lakhs', '₹10-20 Lakhs', '₹20-50 Lakhs', '₹50 Lakhs - 1 Crore', 'Above ₹1 Crore']} cols={2} />
        </div>
      </Section>

      <Section title="Family Details">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Father's Name" value={form.fatherName} onChange={v => update('fatherName', v)} placeholder="Optional" />
          <Field label="Father's Occupation" value={form.fatherOccupation} onChange={v => update('fatherOccupation', v)} placeholder="Optional" />
          <Field label="Mother's Name" value={form.motherName} onChange={v => update('motherName', v)} placeholder="Optional" />
          <Field label="Mother's Occupation" value={form.motherOccupation} onChange={v => update('motherOccupation', v)} placeholder="Optional" />
          <Field label="Siblings" value={form.siblings} onChange={v => update('siblings', v)} placeholder="e.g. 1 elder brother, 1 younger sister" cols={2} />
        </div>
      </Section>

      <Section title="Location & Lifestyle">
        <div className="grid grid-cols-3 gap-3">
          <Field label="City" value={form.city} onChange={v => update('city', v)} placeholder="e.g. Mumbai" />
          <Field label="State" value={form.state} onChange={v => update('state', v)} placeholder="e.g. Maharashtra" />
          <Field label="Country" value={form.country} onChange={v => update('country', v)} options={['India', 'USA', 'UK', 'Canada', 'Australia', 'UAE', 'Other']} />
          <Field label="Dietary Habits" value={form.dietaryHabits} onChange={v => update('dietaryHabits', v)}
            options={['Vegetarian', 'Eggetarian', 'Non-Vegetarian', 'Jain', 'Vegan']} />
          <Field label="Hobbies / Interests" value={form.hobbies} onChange={v => update('hobbies', v)} placeholder="e.g. Travel, Music, Yoga" cols={2} />
        </div>
      </Section>

      <Section title="About & Expectations">
        <Field label="About Self" value={form.aboutSelf} onChange={v => update('aboutSelf', v)} type="textarea" placeholder="Write a short introduction about yourself..." cols={2} />
        <Field label="Partner Expectations" value={form.expectations} onChange={v => update('expectations', v)} type="textarea" placeholder="What you're looking for in a partner..." cols={2} />
      </Section>

      <Section title="Contact Info">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contact Person" value={form.contactName} onChange={v => update('contactName', v)} placeholder="Your name or parent's name" />
          <Field label="Relation" value={form.contactRelation} onChange={v => update('contactRelation', v)}
            options={['Self', 'Father', 'Mother', 'Brother', 'Sister', 'Relative', 'Other']} />
          <Field label="Phone Number" value={form.contactPhone} onChange={v => update('contactPhone', v)} placeholder="+91 98765 43210" />
          <Field label="Email" value={form.contactEmail} onChange={v => update('contactEmail', v)} placeholder="Optional" />
        </div>
      </Section>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="w-5 h-5 text-rose-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Marriage Biodata Maker</h3>
      </div>

      <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Fill in your details</span>
            <button onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors">
              {showPreview ? <><EyeOff className="w-3.5 h-3.5" /> Hide Preview</> : <><Eye className="w-3.5 h-3.5" /> Show Preview</>}
            </button>
          </div>
          {formContent}
        </div>

        {showPreview && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Biodata Preview</span>
              <button onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl text-xs transition-colors">
                <Download className="w-3.5 h-3.5" /> Download PDF
              </button>
            </div>
            <BiodataPreview data={form} previewRef={previewRef as React.RefObject<HTMLDivElement | null>} />
          </div>
        )}
      </div>
    </div>
  );
}
