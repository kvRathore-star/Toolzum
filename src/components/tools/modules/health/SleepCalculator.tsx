"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { Heart } from 'lucide-react';
import { inputCls, labelCls } from '../Calculators.shared';

export default function SleepCalculator() {
  const [wakeTime, setWakeTime] = useState('06:30');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    if (!wakeTime) { setResult(''); return; }
    const [h, m] = wakeTime.split(':').map(Number);
    const wakeMin = h * 60 + m;
    const cycles = [5, 4.5, 4, 3.5, 3, 2.5, 2].map(c => {
      const sleepMin = c * 90;
      let bedMin = wakeMin - sleepMin - 15;
      if (bedMin < 0) bedMin += 1440;
      const bedH = Math.floor(bedMin / 60) % 24;
      const bedM = Math.round(bedMin % 60);
      return { cycles: c, time: `${bedH.toString().padStart(2, '0')}:${bedM.toString().padStart(2, '0')}` };
    });
    setResult(cycles.map(c => `${c.cycles} cycles (${c.cycles * 1.5}h): ${c.time}`).join('\n'));
  }, [wakeTime]);
  return (
    <CalculatorShell
      title="Sleep Calculator"
      icon={<Heart className="w-5 h-5" />}
      accent="purple"
      result={result}
      onCalculate={calc}
      presets={[
        { label: '6:30 AM', apply: () => { setWakeTime('06:30'); } },
        { label: '7:00 AM', apply: () => { setWakeTime('07:00'); } },
        { label: '5:30 AM', apply: () => { setWakeTime('05:30'); } },
      ]}
      downloadData={`WakeTime,Result\n${wakeTime},${result.replace(/\n/g, ' | ')}`}
      downloadFilename="sleep-times.csv"
    >
      <div className="max-w-sm">
        <div><label className={labelCls}>Wake time</label><input className={inputCls} type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}
