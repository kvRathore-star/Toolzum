"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';
import { FIRST_NAMES, LAST_NAMES, DOMAINS, CITIES, STREETS, randInt, randItem } from './GeneratorsShared';

export default function FakeIdentityGenerator() {
  const [identity, setIdentity] = useState<any>(null);
  const generate = () => { const fn = randItem(FIRST_NAMES); const ln = randItem(LAST_NAMES); setIdentity({ name: fn + ' ' + ln, email: fn.toLowerCase() + '.' + ln.toLowerCase() + randInt(1, 99) + '@' + randItem(DOMAINS), phone: '+91 ' + randInt(70000, 99999) + ' ' + randInt(10000, 99999), address: randInt(1, 999) + ' ' + randItem(STREETS) + ', ' + randItem(CITIES) + ' - ' + randInt(100001, 999999), dob: randInt(1, 28) + '/' + randInt(1, 12) + '/' + randInt(1970, 2002), occupation: randItem(['Engineer', 'Doctor', 'Teacher', 'Designer', 'Developer', 'Manager', 'Consultant', 'Analyst']) }); };

  const presets = [
    { label: 'Generate', apply: () => { generate(); } },
    { label: 'Clear', apply: () => { setIdentity(null); } },
  ];

  const resultText = identity ? 'Generated identity: ' + identity.name : 'Generate a random identity';

  return (
    <CalculatorShell category="Utility"
      title="Fake Identity Generator"
      result={resultText}
      onCalculate={generate}
      calculateLabel="Generate"
      presets={presets}
      accent="indigo"
      downloadData={identity ? JSON.stringify(identity, null, 2) : ''}
      downloadFilename="identity.json"
    >
      <div className="space-y-4">
        {identity ? (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col min-h-[200px]">
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">{identity.name.split(' ').map((w: string) => w[0]).join('')}</div>
              </div>
              <div className="p-4 bg-[var(--bg-surface)] rounded-xl text-sm space-y-1.5">
                {[['Name', identity.name], ['Email', identity.email], ['Phone', identity.phone], ['Address', identity.address], ['DOB', identity.dob], ['Occupation', identity.occupation]].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between"><span className="font-bold text-[var(--text-secondary)]">{k as string}</span><span className="text-[var(--text-primary)]">{v as string}</span></div>
                ))}
              </div>
              <button onClick={() => { clipboardWrite(JSON.stringify(identity, null, 2)); toast.success('Copied as JSON!'); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Copy as JSON</button>
            </div>
          </div>
        ) : (
          <p className="text-[var(--text-muted)] text-sm text-center">Generate a random identity</p>
        )}
      </div>
    </CalculatorShell>
  );
}
