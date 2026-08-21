"use client";

import React, { useState, useRef } from 'react';
import { Download, Heart, User, Users, GraduationCap, Globe, Phone, ChevronLeft, ChevronRight, Camera, Check } from 'lucide-react';
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

const STEPS = [
  { id: 1, label: 'Personal', icon: User },
  { id: 2, label: 'Family', icon: Users },
  { id: 3, label: 'Education', icon: GraduationCap },
  { id: 4, label: 'Preferences', icon: Globe },
  { id: 5, label: 'Preview', icon: Heart },
];

function BiodataPreview({ data, photoUrl }: { data: BiodataForm; photoUrl: string | null }) {
  const hasAny = (field: string) => field.trim().length > 0;
  const label = (l: string) => <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block mb-0.5">{l}</span>;

  return (
    <div className="bg-white text-zinc-900 rounded-2xl border-2 border-rose-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white text-center py-6 px-4 relative">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.3' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <h1 className="text-2xl font-bold tracking-tight relative">MATRIMONIAL BIODATA</h1>
        <div className="w-16 h-0.5 bg-white/50 mx-auto mt-2 rounded-full" />
      </div>

      <div className="p-5 space-y-4 text-xs">
        <div className="text-center pb-3 border-b border-rose-100">
          {photoUrl && (
            <div className="mb-2 flex justify-center">
              <div className="w-20 h-20 rounded-full border-2 border-rose-300 overflow-hidden">
                <img src={photoUrl} alt="Photo" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          <h2 className="text-xl font-bold text-zinc-800">{data.fullName || 'Your Name'}</h2>
          <p className="text-zinc-500">{data.occupation || ''}{data.occupation && data.city ? ', ' : ''}{data.city || ''}</p>
        </div>

        <div>
          <h3 className="text-sm font-bold text-rose-600 mb-2 flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> Personal Details</h3>
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
            <h3 className="text-sm font-bold text-rose-600 mb-2 flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Education & Career</h3>
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
            <h3 className="text-sm font-bold text-rose-600 mb-2 flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Family Details</h3>
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
          <div className="border-t border-rose-100 pt-3">
            <h3 className="text-sm font-bold text-rose-600 mb-2 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Contact Information</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {data.contactName && <div>{label('Name')}<span>{data.contactName}</span></div>}
              {data.contactRelation && <div>{label('Relation')}<span>{data.contactRelation}</span></div>}
              {data.contactPhone && <div className="col-span-2">{label('Phone')}<span className="text-blue-600">{data.contactPhone}</span></div>}
            </div>
          </div>
        )}

        <div className="text-center pt-3 border-t border-rose-100 text-[9px] text-zinc-400">
          Generated via Toolzum &bull; Not a legal document
        </div>
      </div>
    </div>
  );
}

export default function MarriageBiodataMaker() {
  const [form, setForm] = useState<BiodataForm>(initialForm);
  const [step, setStep] = useState(1);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof BiodataForm, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Photo must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

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

  const Field = ({ label: lbl, value, onChange, options, placeholder, type = 'text', cols = 1 }: {
    label: string; value: string; onChange: (v: string) => void;
    options?: string[]; placeholder?: string; type?: string; cols?: number;
  }) => (
    <div className={cols > 1 ? 'md:col-span-2' : ''}>
      <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">{lbl}</label>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-rose-500/30 transition-all">
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-rose-500/30 resize-none h-20 transition-all" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-white dark:bg-black/50 border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-rose-500/30 transition-all" />
      )}
    </div>
  );

  const stepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Personal Details</h4>
                <p className="text-[10px] text-[var(--text-muted)]">Basic information about yourself</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name *" value={form.fullName} onChange={v => update('fullName', v)} placeholder="As per documents" cols={2} />
              <Field label="Date of Birth" type="date" value={form.dateOfBirth} onChange={v => update('dateOfBirth', v)} />
              <Field label="Age" value={form.age} onChange={v => update('age', v)} placeholder="e.g. 28" />
              <Field label="Height" value={form.height} onChange={v => update('height', v)} placeholder="e.g. 5ft 8in" />
              <Field label="Complexion" value={form.complexion} onChange={v => update('complexion', v)} placeholder="e.g. Fair, Wheatish" />
              <Field label="Weight" value={form.weight} onChange={v => update('weight', v)} placeholder="e.g. 65 kg" />
              <Field label="Blood Group" value={form.bloodGroup} onChange={v => update('bloodGroup', v)} placeholder="e.g. O+" />
              <Field label="Marital Status" value={form.maritalStatus} onChange={v => update('maritalStatus', v)}
                options={['Unmarried', 'Divorced', 'Widowed', 'Awaiting Divorce']} />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Field label="Religion" value={form.religion} onChange={v => update('religion', v)}
                options={['Hindu', 'Muslim', 'Sikh', 'Christian', 'Jain', 'Buddhist', 'Other']} />
              <Field label="Caste" value={form.caste} onChange={v => update('caste', v)} placeholder="e.g. Brahmin" />
              <Field label="Subcaste" value={form.subcaste} onChange={v => update('subcaste', v)} placeholder="Optional" />
              <Field label="Gotra" value={form.gotra} onChange={v => update('gotra', v)} placeholder="e.g. Kashyap" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-2">Profile Photo</label>
              <div className="flex items-center gap-4">
                {photoUrl ? (
                  <div className="relative">
                    <img src={photoUrl} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-rose-300" />
                    <button onClick={() => setPhotoUrl(null)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow">×</button>
                  </div>
                ) : (
                  <button onClick={() => photoInputRef.current?.click()} className="w-20 h-20 rounded-full border-2 border-dashed border-rose-300 flex flex-col items-center justify-center text-rose-700 dark:text-rose-400 hover:border-rose-500 transition-colors">
                    <Camera className="w-6 h-6" />
                    <span className="text-[8px] mt-0.5">Upload</span>
                  </button>
                )}
                <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                <p className="text-[10px] text-[var(--text-muted)]">Upload a clear passport-style photo</p>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Family Details</h4>
                <p className="text-[10px] text-[var(--text-muted)]">Family background information</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Father's Name" value={form.fatherName} onChange={v => update('fatherName', v)} placeholder="Full name" />
              <Field label="Father's Occupation" value={form.fatherOccupation} onChange={v => update('fatherOccupation', v)} placeholder="e.g. Business" />
              <Field label="Mother's Name" value={form.motherName} onChange={v => update('motherName', v)} placeholder="Full name" />
              <Field label="Mother's Occupation" value={form.motherOccupation} onChange={v => update('motherOccupation', v)} placeholder="e.g. Homemaker" />
              <Field label="Siblings" value={form.siblings} onChange={v => update('siblings', v)} placeholder="e.g. 1 elder brother, 1 younger sister" cols={2} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="City" value={form.city} onChange={v => update('city', v)} placeholder="e.g. Mumbai" />
              <Field label="State" value={form.state} onChange={v => update('state', v)} placeholder="e.g. Maharashtra" />
              <Field label="Country" value={form.country} onChange={v => update('country', v)} options={['India', 'USA', 'UK', 'Canada', 'Australia', 'UAE', 'Other']} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Education & Career</h4>
                <p className="text-[10px] text-[var(--text-muted)]">Academic and professional background</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Highest Education" value={form.education} onChange={v => update('education', v)}
                options={['High School', 'Diploma', "Bachelor's", "Master's", 'PhD', 'CA', 'MBBS', 'LLB', 'Other']} />
              <Field label="College / University" value={form.college} onChange={v => update('college', v)} placeholder="Optional" />
              <Field label="Occupation" value={form.occupation} onChange={v => update('occupation', v)}
                options={['Software Engineer', 'Doctor', 'Lawyer', 'Teacher', 'Business', 'Government Employee', 'CA / Finance', 'Civil Services', 'Other']} cols={2} />
              <Field label="Annual Income (₹)" value={form.annualIncome} onChange={v => update('annualIncome', v)}
                options={['Below ₹5 Lakhs', '₹5-10 Lakhs', '₹10-20 Lakhs', '₹20-50 Lakhs', '₹50 Lakhs - 1 Crore', 'Above ₹1 Crore']} cols={2} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Preferences & About</h4>
                <p className="text-[10px] text-[var(--text-muted)]">Lifestyle, interests, and partner expectations</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Dietary Habits" value={form.dietaryHabits} onChange={v => update('dietaryHabits', v)}
                options={['Vegetarian', 'Eggetarian', 'Non-Vegetarian', 'Jain', 'Vegan']} />
              <Field label="Hobbies / Interests" value={form.hobbies} onChange={v => update('hobbies', v)} placeholder="e.g. Travel, Music, Yoga" />
            </div>
            <Field label="About Self" value={form.aboutSelf} onChange={v => update('aboutSelf', v)} type="textarea" placeholder="Write a short introduction about yourself..." cols={2} />
            <Field label="Partner Expectations" value={form.expectations} onChange={v => update('expectations', v)} type="textarea" placeholder="What you're looking for in a partner..." cols={2} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Contact Person" value={form.contactName} onChange={v => update('contactName', v)} placeholder="Your name or parent's name" />
              <Field label="Relation" value={form.contactRelation} onChange={v => update('contactRelation', v)}
                options={['Self', 'Father', 'Mother', 'Brother', 'Sister', 'Relative', 'Other']} />
              <Field label="Phone Number" value={form.contactPhone} onChange={v => update('contactPhone', v)} placeholder="+91 98765 43210" />
              <Field label="Email" value={form.contactEmail} onChange={v => update('contactEmail', v)} placeholder="Optional" />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Preview & Download</h4>
                <p className="text-[10px] text-[var(--text-muted)]">Review your biodata and download as PDF</p>
              </div>
            </div>
            <BiodataPreview data={form} photoUrl={photoUrl} />
            <button onClick={handlePrint}
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm">
              <Download className="w-4 h-4" /> Download Biodata as PDF
            </button>
          </div>
        );
    }
  };

  const canProceed = () => {
    if (step === 1 && !form.fullName.trim()) return false;
    return true;
  };

  const isLastStep = step === STEPS.length;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
          <Heart className="w-4 h-4" />
        </div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Marriage Biodata Maker</h3>
      </div>

      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-1.5 shadow-sm">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              {i > 0 && <div className={`w-6 h-0.5 rounded-full ${step > i ? 'bg-rose-500' : 'bg-zinc-300 dark:bg-zinc-600'}`} />}
              <button onClick={() => { if (step > i || canProceed()) setStep(s.id); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                  step === s.id
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/20'
                    : step > s.id
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-zinc-400 dark:text-zinc-500'
                }`}>
                {step > s.id ? <Check className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl">
          {stepContent()}

          <div className="flex justify-between mt-6 pt-4 border-t border-[var(--border-subtle)]">
            <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-200 dark:bg-[var(--bg-surface)] hover:bg-zinc-300 dark:hover:bg-[var(--bg-elevated)] disabled:opacity-40 text-[var(--text-primary)] font-semibold rounded-xl text-xs transition-all active:scale-95">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            {!isLastStep ? (
              <button onClick={() => { if (canProceed()) setStep(step + 1); else toast.error('Please fill in required fields'); }}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-500/20 transition-all active:scale-95">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handlePrint}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-500/20 transition-all active:scale-95">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden sticky top-6">
            <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-overlay)]/50">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-[var(--text-primary)]">Live Preview</span>
              </div>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/30">
              <div ref={previewRef}>
                <BiodataPreview data={form} photoUrl={photoUrl} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
