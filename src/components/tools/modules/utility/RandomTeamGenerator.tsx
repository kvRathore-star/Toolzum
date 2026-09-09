"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { Input, shuffleArray } from './GeneratorsShared';

export default function RandomTeamGenerator() {
  const [input, setInput] = useState('Alice\nBob\nCharlie\nDiana\nEve\nFrank'); const [numTeams, setNumTeams] = useState(2); const [teams, setTeams] = useState<string[][]>([]);
  const generate = () => { const names = input.split('\n').map(s => s.trim()).filter(Boolean); const shuffled = shuffleArray(names); const t: string[][] = Array.from({ length: numTeams }, () => []); shuffled.forEach((name, i) => t[i % numTeams]!.push(name)); setTeams(t); };
  const teamColors = ['text-emerald-500', 'text-violet-500', 'text-amber-500', 'text-blue-700 dark:text-blue-400', 'text-pink-500', 'text-cyan-500'];

  const presets = [
    { label: '2 Teams', apply: () => { setNumTeams(2); generate(); } },
    { label: '3 Teams', apply: () => { setNumTeams(3); generate(); } },
    { label: '4 Teams', apply: () => { setNumTeams(4); generate(); } },
    { label: 'Clear', apply: () => { setTeams([]); } },
  ];

  const resultText = teams.length > 0 ? 'Generated ' + teams.length + ' teams from ' + input.split('\n').filter(Boolean).length + ' names' : 'Enter names and generate teams';

  return (
    <CalculatorShell category="Utility"
      title="Random Team Generator"
      result={resultText}
      onCalculate={generate}
      calculateLabel="Generate"
      presets={presets}
      accent="emerald"
      downloadData={JSON.stringify({ teams: teams.map((t, i) => ({ team: i + 1, members: t })), totalNames: input.split('\n').filter(Boolean).length }, null, 2)}
      downloadFilename="teams.json"
    >
      <div className="space-y-4">
        <Input label="Names (one per line)" value={input} onChange={v => setInput(v)} rows={6} />
        <Input label="Number of Teams" type="number" value={String(numTeams)} onChange={v => setNumTeams(Number(v))} />
        {teams.length > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col min-h-[200px]">
            <div className="space-y-3">
              {teams.map((team, i) => (
                <div key={i} className="p-3 bg-[var(--bg-surface)] rounded-xl">
                  <div className={'text-sm font-bold ' + teamColors[i % teamColors.length] + ' mb-1'}>Team {i + 1} · {team.length} members</div>
                  <div className="text-xs text-[var(--text-secondary)]">{team.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!teams.length && (
          <p className="text-[var(--text-muted)] text-sm text-center">Enter names and generate teams</p>
        )}
      </div>
    </CalculatorShell>
  );
}
