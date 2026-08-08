"use client";

import React, { useState, useEffect } from 'react';
import { ClipboardList, ExternalLink, HelpCircle, FileText, CheckSquare, Printer, Info, Check, ChevronDown, ChevronUp, Save, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface FormGuide {
  title: string;
  formNumber: string;
  description: string;
  eligibility: string[];
  documents: {
    category: string;
    options: string[];
  }[];
  nvspLink: string;
}

const FORM_GUIDES: Record<string, FormGuide> = {
  form6: {
    title: 'Form 6 — New Voter Registration',
    formNumber: 'Form 6',
    description: 'Use this form if you are a first-time voter or want to transfer your vote from one constituency to another within India.',
    eligibility: [
      'Must be an Indian Citizen.',
      'Must have attained the age of 18 years on the qualifying date (January 1st, April 1st, July 1st, or October 1st).',
      'Must be an ordinary resident of the polling area where registration is sought.',
    ],
    documents: [
      {
        category: 'Age Proof (Any One)',
        options: [
          'Birth Certificate issued by Municipal Authority',
          'Aadhaar Card showing Date of Birth',
          'PAN Card',
          'Driving License',
          'CBSE/ICSE Class 10/12 Board Marksheet containing Date of Birth',
          'Indian Passport',
        ]
      },
      {
        category: 'Address Proof / Ordinary Residence (Any One)',
        options: [
          'Water/Electricity/Gas connection bill (min 1 year old)',
          'Aadhaar Card showing current address',
          'Current passbook of Nationalized/Scheduled Bank/Post Office',
          'Indian Passport',
          'Revenue Department Land-owning record / Registered Rent Deed',
        ]
      },
      {
        category: 'Photograph',
        options: [
          'Recent passport size color photograph (white background, sizing 3.5cm x 4.5cm)',
        ]
      }
    ],
    nvspLink: 'https://voters.eci.gov.in/',
  },
  form7: {
    title: 'Form 7 — Objection / Deletion of Voter Name',
    formNumber: 'Form 7',
    description: 'Use this form to object to the inclusion of a name in the electoral roll or seek deletion of an existing name (due to death, shifting, or double entry).',
    eligibility: [
      'Any person whose name is already on the electoral roll of that constituency.',
      'Can be submitted for self-deletion or objecting to someone else\'s invalid voter entry in the same polling area.',
    ],
    documents: [
      {
        category: 'Supporting Details (Any One)',
        options: [
          'Death Certificate (in case of seeking deletion of a deceased voter)',
          'Electoral Photo ID Card (EPIC) number of the voter to be deleted',
          'Proof of shifting (if objecting due to voter shifting out)',
        ]
      }
    ],
    nvspLink: 'https://voters.eci.gov.in/',
  },
  form8: {
    title: 'Form 8 — Correction / Shifting / Replacement EPIC',
    formNumber: 'Form 8',
    description: 'Use this form for correction of entries in the existing electoral roll (Name, Age, Photo, Relative Name etc.), shifting of residence (within or outside assembly constituency), or requesting a replacement voter card without corrections.',
    eligibility: [
      'Must already be registered on the electoral roll.',
      'Can be used for: (1) Shifting of Residence, (2) Correction of Entries, (3) Replacement of EPIC without correction, (4) Marking of Person with Disability (PwD).',
    ],
    documents: [
      {
        category: 'Proof for Correction (Depending on selection)',
        options: [
          'For Name/Surname change: Official gazette notification or marriage registration certificate',
          'For Date of Birth change: Aadhaar, Birth Certificate, or Class 10 Marksheet',
          'For Photo correction: Recent color passport photograph',
          'For Address correction: Electricity bill, gas bill, Aadhaar, or Bank Passbook showing new address',
        ]
      },
      {
        category: 'Identity Proof',
        options: [
          'Aadhaar Card (Optional but recommended for linking)',
          'Copy of existing Voter ID Card (EPIC) if available',
        ]
      }
    ],
    nvspLink: 'https://voters.eci.gov.in/',
  }
};

const FORM_CARDS = [
  { key: 'form6', icon: '🆕', tag: 'First Time', color: '#ff6b00' },
  { key: 'form7', icon: '🚫', tag: 'Object/Delete', color: '#e11d48' },
  { key: 'form8', icon: '✏️', tag: 'Correction', color: '#0891b2' },
];

export default function VoterIdHelper() {
  const [selectedForm, setSelectedForm] = useState<'form6' | 'form7' | 'form8'>('form6');
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [savedForms, setSavedForms] = useState<string[]>([]);
  const currentGuide = FORM_GUIDES[selectedForm];

  useEffect(() => {
    const saved = localStorage.getItem('voterHelperProgress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate saved progress from localStorage on mount
        setChecklistItems(parsed.checklist || []);
        setSavedForms(parsed.savedForms || []);
      } catch {}
    }
  }, []);

  const persistProgress = (items: string[], forms: string[]) => {
    localStorage.setItem('voterHelperProgress', JSON.stringify({ checklist: items, savedForms: forms }));
  };

  const handleToggleChecklist = (item: string) => {
    let newItems: string[];
    if (checklistItems.includes(item)) {
      newItems = checklistItems.filter(i => i !== item);
    } else {
      newItems = [...checklistItems, item];
      toast.success('Document added to checklist!');
    }
    setChecklistItems(newItems);
    persistProgress(newItems, savedForms);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalDocs = currentGuide.documents.reduce((acc, cat) => acc + cat.options.length, 0);
  const markedDocs = currentGuide.documents.reduce((acc, cat) => acc + cat.options.filter(o => checklistItems.includes(o)).length, 0);
  const progressPct = totalDocs > 0 ? Math.round((markedDocs / totalDocs) * 100) : 0;

  const handleResetProgress = () => {
    setChecklistItems([]);
    persistProgress([], savedForms);
    toast.success('Progress reset');
  };

  const handleSaveForm = () => {
    if (!savedForms.includes(selectedForm)) {
      const newForms = [...savedForms, selectedForm];
      setSavedForms(newForms);
      persistProgress(checklistItems, newForms);
      toast.success('Form saved for later!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 print:bg-white print:text-black">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--bg-overlay)] p-6 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl print:border-none print:bg-transparent">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <ClipboardList className="w-6 h-6" style={{ color: '#ff6b00' }} />
          Voter ID Registration Helper (ECI)
        </h2>
        <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mt-1">
          Interactive guide and checklist builder for Election Commission of India (ECI) Forms 6, 7, and 8. Select a form to get started.
        </p>
      </motion.div>

      <div className="grid grid-cols-3 gap-3 print:hidden">
        {(Object.keys(FORM_GUIDES) as Array<'form6' | 'form7' | 'form8'>).map((key) => {
          const card = FORM_CARDS.find(c => c.key === key)!;
          const isActive = selectedForm === key;
          const isSaved = savedForms.includes(key);
          return (
            <motion.button key={key} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { setSelectedForm(key); }}
              className={`relative p-4 rounded-2xl border-2 transition-all duration-200 text-left cursor-pointer ${
                isActive ? 'border-transparent shadow-lg' : 'border-[var(--border-subtle)] bg-[var(--bg-overlay)] hover:border-zinc-400 dark:hover:border-zinc-600'
              }`}
              style={isActive ? { borderColor: card.color, backgroundColor: card.color + '12', boxShadow: `0 4px 20px ${card.color}25` } : {}}>
              {isSaved && <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold"><Check className="w-2.5 h-2.5 inline" /> Saved</span>}
              <span className="text-2xl block mb-2">{card.icon}</span>
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">{card.tag}</span>
              <span className="text-sm font-bold text-[var(--text-primary)] block mt-0.5" style={isActive ? { color: card.color } : {}}>{FORM_GUIDES[key].formNumber}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl">
          <div className="space-y-2">
            <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-block border"
              style={{ backgroundColor: '#ff6b0015', color: '#ff6b00', borderColor: '#ff6b0025' }}>
              {currentGuide.formNumber} Overview
            </span>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">{currentGuide.title}</h3>
            <p className="text-sm text-zinc-600 dark:text-[var(--text-muted)] leading-relaxed">
              {currentGuide.description}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-wider">
              Eligibility Criteria
            </h4>
            <ul className="space-y-2.5">
              {currentGuide.eligibility.map((item, index) => (
                <motion.li key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: '#ff6b00' }} />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-wider">Step-by-Step Process</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
              <motion.div whileHover={{ y: -2 }} className="p-4 bg-[var(--bg-overlay)]/35 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)] space-y-1 transition-all">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block">1. Form Submission</span>
                <span>Fill and submit the online application on voters.eci.gov.in or Voter Helpline Mobile App.</span>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} className="p-4 bg-[var(--bg-overlay)]/35 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)] space-y-1 transition-all">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block">2. Field Verification</span>
                <span>A Booth Level Officer (BLO) will visit your residence to verify the submitted details and address proof.</span>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} className="p-4 bg-[var(--bg-overlay)]/35 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)] space-y-1 transition-all">
                <span className="font-bold text-zinc-800 dark:text-zinc-200 block">3. EPIC Card Dispatch</span>
                <span>Once approved, you will receive an SMS and your physical EPIC Voter ID card will be posted to your address.</span>
              </motion.div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--border-subtle)] print:hidden">
            <a
              href={currentGuide.nvspLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-bold py-3 px-4 rounded-xl text-center transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/25"
            >
              Apply Online via Voter Portal
              <ExternalLink className="w-4 h-4" />
            </a>
            <button onClick={handlePrint}
              className="px-5 py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] dark:hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
              <Printer className="w-4 h-4" />
              Print Checklist
            </button>
            <button onClick={handleSaveForm}
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/25">
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        <div className="space-y-6 bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] p-6 rounded-2xl">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
            <h4 className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: '#ff6b00' }} />
              Required Documents
            </h4>
          </div>

          <p className="text-xs text-[var(--text-secondary)]">
            Check the documents you have ready to compile your checklist.
          </p>

          <div className="space-y-6">
            {currentGuide.documents.map((cat, catIdx) => (
              <motion.div key={catIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: catIdx * 0.1 }} className="space-y-2">
                <span className="text-xs font-bold text-[var(--text-secondary)] dark:text-[var(--text-muted)] block">
                  {cat.category}
                </span>
                <div className="space-y-2">
                  {cat.options.map((opt, optIdx) => {
                    const isChecked = checklistItems.includes(opt);
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleToggleChecklist(opt)}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all duration-200 flex items-start gap-2.5 cursor-pointer ${
                          isChecked
                            ? 'text-[var(--accent)]'
                            : 'bg-white dark:bg-black border-[var(--border-subtle)] text-zinc-700 dark:text-[var(--text-muted)] hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                        style={isChecked ? { backgroundColor: '#ff6b0010', borderColor: '#ff6b0030', color: '#ff6b00' } : {}}
                      >
                        <CheckSquare className={`w-4 h-4 mt-0.5 shrink-0 ${isChecked ? '' : 'text-[var(--text-muted)]'}`} style={isChecked ? { color: '#ff6b00' } : {}} />
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>

          {totalDocs > 0 && (
            <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>Progress</span>
                <span className="font-bold" style={{ color: '#ff6b00' }}>{markedDocs}/{totalDocs}</span>
              </div>
              <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: '#ff6b00' }}
                />
              </div>
              {checklistItems.length > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-3 rounded-xl text-center" style={{ backgroundColor: '#ff6b0008', borderColor: '#ff6b0020', borderWidth: 1 }}>
                  <span className="text-xs font-bold block" style={{ color: '#ff6b00' }}>
                    <Check className="w-3 h-3 inline mr-1" />
                    {checklistItems.length} documents marked ready
                  </span>
                </motion.div>
              )}
              <button onClick={handleResetProgress}
                className="w-full py-2 text-[10px] text-[var(--text-secondary)] hover:text-red-500 transition-colors flex items-center justify-center gap-1 cursor-pointer">
                <RotateCcw className="w-3 h-3" /> Reset Progress
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
