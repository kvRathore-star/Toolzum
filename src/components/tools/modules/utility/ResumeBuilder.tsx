"use client";

import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { CalcActions } from '../shared/CalcActions';

export default function ResumeBuilder() {
  const [personal, setPersonal] = useState({ name: '', title: '', email: '', phone: '', summary: '' });
  const [experience, setExperience] = useState([{ company: '', role: '', duration: '', description: '' }]);
  const [education, setEducation] = useState([{ institution: '', degree: '', year: '' }]);
  const [formError, setFormError] = useState('');

  // Plain-text export for copy (print/PDF stays the visual path).
  const resumeText = useMemo(() => [
    personal.name,
    personal.title,
    [personal.email, personal.phone].filter(Boolean).join(' | '),
    '',
    'SUMMARY',
    personal.summary,
    '',
    'EXPERIENCE',
    ...experience.flatMap((exp) => [
      `${exp.role} — ${exp.company} (${exp.duration})`,
      exp.description,
      '',
    ]),
    'EDUCATION',
    ...education.map((edu) => `${edu.degree} — ${edu.institution} (${edu.year})`),
  ].filter((l, i, arr) => l !== '' || arr[i - 1] !== '').join('\n'), [personal, experience, education]);

  const addExperience = () => setExperience([...experience, { company: '', role: '', duration: '', description: '' }]);
  const addEducation = () => setEducation([...education, { institution: '', degree: '', year: '' }]);

  const handlePrint = () => {
    if (!personal.name.trim()) { setFormError('Please enter your full name before printing.'); toast.error('Full name is required'); return; }
    if (!personal.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email.trim())) { setFormError('Please enter a valid email address before printing.'); toast.error('Valid email is required'); return; }
    setFormError('');
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm no-print">
        <strong>Client-Side Resume Builder:</strong> Fill out your details and print/save to PDF. No data is saved on our servers.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Editor (Left) */}
        <div className="space-y-6 no-print">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">Personal Info</h3>
            <input aria-label="Full Name" value={personal.name} className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)]" placeholder="Full Name *" onChange={(e) => setPersonal({...personal, name: e.target.value})} />
            <input aria-label="Professional Title" value={personal.title} className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)]" placeholder="Professional Title" onChange={(e) => setPersonal({...personal, title: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <input aria-label="Email" value={personal.email} className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)]" placeholder="Email *" type="email" onChange={(e) => setPersonal({...personal, email: e.target.value})} />
              <input aria-label="Phone" value={personal.phone} className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)]" placeholder="Phone" type="tel" onChange={(e) => setPersonal({...personal, phone: e.target.value})} />
            </div>
            <textarea aria-label="Professional Summary" value={personal.summary} className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] h-24" placeholder="Professional Summary" onChange={(e) => setPersonal({...personal, summary: e.target.value})} />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Experience</h3>
              <button onClick={addExperience} className="text-sm text-[var(--accent)] hover:text-blue-300 px-3 py-1 bg-[var(--accent)]/10 rounded-lg">+ Add</button>
            </div>
            {experience.map((exp, i) => (
              <div key={i} className="space-y-2 p-4 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-overlay)]/50 dark:bg-black/50">
                <input aria-label={`Role ${i + 1}`} value={exp.role} className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)]" placeholder="Role" onChange={(e) => { const newExp = [...experience]; newExp[i]!.role = e.target.value; setExperience(newExp); }} />
                <div className="grid grid-cols-2 gap-4">
                  <input aria-label={`Company ${i + 1}`} value={exp.company} className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)]" placeholder="Company" onChange={(e) => { const newExp = [...experience]; newExp[i]!.company = e.target.value; setExperience(newExp); }} />
                  <input aria-label={`Duration ${i + 1}`} value={exp.duration} className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)]" placeholder="Duration (e.g. 2020-2023)" onChange={(e) => { const newExp = [...experience]; newExp[i]!.duration = e.target.value; setExperience(newExp); }} />
                </div>
                <textarea aria-label={`Description of duties ${i + 1}`} value={exp.description} className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] h-20" placeholder="Description of duties" onChange={(e) => { const newExp = [...experience]; newExp[i]!.description = e.target.value; setExperience(newExp); }} />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Education</h3>
              <button onClick={addEducation} className="text-sm text-[var(--accent)] hover:text-blue-300 px-3 py-1 bg-[var(--accent)]/10 rounded-lg">+ Add</button>
            </div>
            {education.map((edu, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-overlay)]/50 dark:bg-black/50">
                <input aria-label={`Institution ${i + 1}`} value={edu.institution} className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] md:col-span-1" placeholder="Institution" onChange={(e) => { const newEdu = [...education]; newEdu[i]!.institution = e.target.value; setEducation(newEdu); }} />
                <input aria-label={`Degree ${i + 1}`} value={edu.degree} className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] md:col-span-1" placeholder="Degree" onChange={(e) => { const newEdu = [...education]; newEdu[i]!.degree = e.target.value; setEducation(newEdu); }} />
                <input aria-label={`Year ${i + 1}`} value={edu.year} className="w-full bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] md:col-span-1" placeholder="Year" onChange={(e) => { const newEdu = [...education]; newEdu[i]!.year = e.target.value; setEducation(newEdu); }} />
              </div>
            ))}
          </div>
          
          {formError && (
            <p role="alert" className="text-xs text-red-600 dark:text-red-400 font-medium">{formError}</p>
          )}
          <button 
            onClick={handlePrint}
            className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95"
            aria-label="Print resume or save as PDF via the print dialog"
          >
            Print / Save as PDF (via print dialog)
          </button>
          <div className="flex justify-center">
            <CalcActions result={resumeText} downloadData={resumeText} downloadFilename="resume.txt" />
          </div>
        </div>

        {/* Live Preview (Right) */}
        <div className="bg-white text-black p-10 min-h-[1056px] w-full max-w-[816px] shadow-2xl mx-auto printable-area print:shadow-none print:m-0 print:p-0">
          <div className="border-b-2 border-[var(--border-subtle)] pb-6 mb-6">
            <h2 className="text-4xl font-black text-[var(--text-primary)] mb-1">{personal.name || 'Your Name'}</h2>
            <h2 className="text-xl text-[var(--text-secondary)] font-medium mb-3">{personal.title || 'Professional Title'}</h2>
            <div className="text-sm text-[var(--text-secondary)] flex gap-4">
              <span>{personal.email || 'email@example.com'}</span>
              <span>•</span>
              <span>{personal.phone || '(555) 123-4567'}</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2 border-b border-[var(--border-subtle)] pb-1">Summary</h3>
            <p className="text-[var(--text-primary)] text-sm leading-relaxed">{personal.summary || 'A brief professional summary highlighting your key skills and achievements.'}</p>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 border-b border-[var(--border-subtle)] pb-1">Experience</h3>
            <div className="space-y-6">
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-[var(--text-primary)]">{exp.role || 'Job Title'}</h4>
                    <span className="text-sm text-[var(--text-secondary)] font-medium">{exp.duration || '2020 - Present'}</span>
                  </div>
                  <div className="text-sm text-[var(--accent)] font-medium mb-2">{exp.company || 'Company Name'}</div>
                  <p className="text-[var(--text-primary)] text-sm leading-relaxed whitespace-pre-wrap">{exp.description || '• Describe your responsibilities and achievements\n• Use bullet points for readability'}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 border-b border-[var(--border-subtle)] pb-1">Education</h3>
            <div className="space-y-4">
              {education.map((edu, i) => (
                <div key={i} className="flex justify-between items-baseline">
                  <div>
                    <h4 className="font-bold text-[var(--text-primary)]">{edu.degree || 'Degree / Certificate'}</h4>
                    <div className="text-sm text-[var(--text-secondary)]">{edu.institution || 'University / Institution'}</div>
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">{edu.year || '2020'}</span>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
      
      {/* CSS for printing */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; box-shadow: none; }
          .no-print { display: none !important; }
          @page { margin: 0; }
        }
      `}</style>
    </div>
  );
}
