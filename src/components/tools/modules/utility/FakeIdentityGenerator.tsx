"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';
import { FIRST_NAMES, LAST_NAMES, DOMAINS, CITIES, STREETS, randInt, randItem } from './GeneratorsShared';

const GENDERS = ['Any', 'Male', 'Female'] as const;
const COUNTRIES: { id: string; label: string; dial: string; cities: string[] }[] = [
  { id: 'IN', label: 'India', dial: '+91', cities: CITIES },
  { id: 'US', label: 'United States', dial: '+1', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Seattle'] },
  { id: 'UK', label: 'United Kingdom', dial: '+44', cities: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow'] },
];

function makeIdentity(gender: string, countryId: string) {
  const fn = randItem(FIRST_NAMES); const ln = randItem(LAST_NAMES);
  const country = COUNTRIES.find(c => c.id === countryId) ?? COUNTRIES[0]!;
  const title = gender === 'Male' ? 'Mr. ' : gender === 'Female' ? 'Ms. ' : '';
  return { name: title + fn + ' ' + ln, gender, country: country.label, email: fn.toLowerCase() + '.' + ln.toLowerCase() + randInt(1, 99) + '@' + randItem(DOMAINS), phone: country.dial + ' ' + randInt(70000, 99999) + ' ' + randInt(10000, 99999), address: randInt(1, 999) + ' ' + randItem(STREETS) + ', ' + randItem(country.cities) + ' - ' + randInt(100001, 999999), dob: randInt(1, 28) + '/' + randInt(1, 12) + '/' + randInt(1970, 2002), occupation: randItem(['Engineer', 'Doctor', 'Teacher', 'Designer', 'Developer', 'Manager', 'Consultant', 'Analyst']) };
}

export default function FakeIdentityGenerator() {
  const [identities, setIdentities] = useState<any[]>([]);
  const [gender, setGender] = useState<string>('Any');
  const [country, setCountry] = useState<string>('IN');
  const [count, setCount] = useState('1');
  const generate = () => { const n = Math.min(5, Math.max(1, parseInt(count) || 1)); setIdentities(Array.from({ length: n }, () => makeIdentity(gender, country))); };
  const identity = identities[0] ?? null;

  const presets = [
    { label: 'Generate', apply: () => { generate(); } },
    { label: 'Clear', apply: () => { setIdentities([]); } },
  ];

  const resultText = identities.length > 0 ? `Generated ${identities.length} identit${identities.length === 1 ? 'y' : 'ies'} (${gender}, ${COUNTRIES.find(c => c.id === country)?.label})` : 'Generate a random identity';

  return (
    <CalculatorShell category="Utility"
      title="Fake Identity Generator"
      result={resultText}
      onCalculate={generate}
      calculateLabel="Generate"
      presets={presets}
      accent="indigo"
      downloadData={identity ? JSON.stringify(identities, null, 2) : ''}
      downloadFilename="identity.json"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="lbl-fakeidentitygenerator-gender" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Gender</label>
            <select id="lbl-fakeidentitygenerator-gender" aria-label="Gender" value={gender} onChange={e => setGender(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2">
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="lbl-fakeidentitygenerator-country" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Country</label>
            <select id="lbl-fakeidentitygenerator-country" aria-label="Country" value={country} onChange={e => setCountry(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2">
              {COUNTRIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="lbl-fakeidentitygenerator-count" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Count</label>
            <input id="lbl-fakeidentitygenerator-count" aria-label="Count" type="number" min="1" max="5" value={count} onChange={e => setCount(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
          </div>
        </div>
        {identities.length > 0 ? (
          <div className="space-y-3">
            {identities.map((identity, idx) => (
          <div key={idx} className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col min-h-[200px]">
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent-ink)] to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">{identity.name.split(' ').map((w: string) => w[0]).join('')}</div>
              </div>
              <div className="p-4 bg-[var(--bg-surface)] rounded-xl text-sm space-y-1.5">
                {[['Name', identity.name], ['Email', identity.email], ['Phone', identity.phone], ['Address', identity.address], ['DOB', identity.dob], ['Occupation', identity.occupation]].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between"><span className="font-bold text-[var(--text-secondary)]">{k as string}</span><span className="text-[var(--text-primary)]">{v as string}</span></div>
                ))}
              </div>
            </div>
          </div>
            ))}
            <button onClick={() => { clipboardWrite(JSON.stringify(identities, null, 2)).then(ok => { if (ok) toast.success('Copied as JSON!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Copy as JSON</button>
          </div>
        ) : (
          <p className="text-[var(--text-muted)] text-sm text-center">Generate a random identity</p>
        )}
      </div>
    </CalculatorShell>
  );
}
