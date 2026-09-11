"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function SleepCalculator() {
  const [wakeTime, setWakeTime] = useState('06:30');

  let result = '';
  if (wakeTime) {
    const [h = 0, m = 0] = wakeTime.split(':').map(Number);
    const wakeMin = h * 60 + m;
    const cycles = [5, 4.5, 4, 3.5, 3, 2.5, 2].map(c => {
      const sleepMin = c * 90;
      let bedMin = wakeMin - sleepMin - 15;
      if (bedMin < 0) bedMin += 1440;
      const bedH = Math.floor(bedMin / 60) % 24;
      const bedM = Math.round(bedMin % 60);
      return { cycles: c, time: `${bedH.toString().padStart(2, '0')}:${bedM.toString().padStart(2, '0')}` };
    });
    result = cycles.map(c => `${c.cycles} cycles (${c.cycles * 1.5}h): ${c.time}`).join('\n');
  }

  return (
    <CalculatorShell category="Health"
      title="Sleep Calculator"
      accent="purple"
      result={result}
      auto
      presets={[
        { label: '6:30 AM', apply: () => { setWakeTime('06:30'); } },
        { label: '7:00 AM', apply: () => { setWakeTime('07:00'); } },
        { label: '5:30 AM', apply: () => { setWakeTime('05:30'); } },
      ]}
      downloadData={`WakeTime,Result\n${wakeTime},${result.replace(/\n/g, ' | ')}`}
      downloadFilename="sleep-times.csv"
    >
      <div className="max-w-sm">
        <div><label htmlFor="lbl-sleepcalculator-wake-time" className={labelCls}>Wake time</label><input id="lbl-sleepcalculator-wake-time" aria-label="Wake time" className={inputCls} type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}
