"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { DollarSign, Hash, Calendar, Heart, Briefcase } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'finance' | 'math' | 'datetime' | 'health' | 'business';

export default function CalculatorKit() {
  const [tab, setTab] = useState<Tab>('finance');

  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${tab === v ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        <TabBtn v="finance" label="Finance" icon={DollarSign} />
        <TabBtn v="math" label="Math" icon={Hash} />
        <TabBtn v="datetime" label="Date/Time" icon={Calendar} />
        <TabBtn v="health" label="Health" icon={Heart} />
        <TabBtn v="business" label="SaaS/Biz" icon={Briefcase} />
      </div>
      {tab === 'finance' && <FinanceCalcs />}
      {tab === 'math' && <MathCalcs />}
      {tab === 'datetime' && <DateTimeCalcs />}
      {tab === 'health' && <HealthCalcs />}
      {tab === 'business' && <BusinessCalcs />}
    </div>
  );
}

const Inp = ({ label, value, onChange, prefix, suffix, small }: { label: string; value: number; onChange: (v: number) => void; prefix?: string; suffix?: string; small?: boolean }) => (
  <div className="flex items-center gap-1.5">
    <label className="text-[10px] text-zinc-500 w-16 shrink-0">{label}</label>
    {prefix && <span className="text-[10px] text-zinc-400">{prefix}</span>}
    <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
      className={`w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 ${small ? 'py-1 text-[11px]' : 'py-1.5 text-xs'} text-zinc-900 dark:text-white outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} />
    {suffix && <span className="text-[10px] text-zinc-400 w-6">{suffix}</span>}
  </div>
);

const CalcBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={onClick} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all active:scale-[0.98]">{label}</button>
);

const Result = ({ value }: { value: string }) => (
  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-zinc-50 dark:bg-black rounded-lg px-2 py-1">{value}</p>
);

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
    <h5 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{title}</h5>
    {children}
  </div>
);

function FinanceCalcs() {
  const [siP, setSiP] = useState(10000); const [siR, setSiR] = useState(5); const [siT, setSiT] = useState(3); const [siRes, setSiRes] = useState<number | null>(null);
  const [ciP, setCiP] = useState(10000); const [ciR, setCiR] = useState(5); const [ciT, setCiT] = useState(3); const [ciN, setCiN] = useState(12); const [ciRes, setCiRes] = useState<number | null>(null);
  const [mortA, setMortA] = useState(300000); const [mortR, setMortR] = useState(6.5); const [mortY, setMortY] = useState(30); const [mortRes, setMortRes] = useState<number | null>(null);
  const [discP, setDiscP] = useState(100); const [discPct, setDiscPct] = useState(20); const [discRes, setDiscRes] = useState<number | null>(null);
  const [carP, setCarP] = useState(35000); const [carR, setCarR] = useState(5); const [carY, setCarY] = useState(5); const [carRes, setCarRes] = useState<number | null>(null);
  const [inflP, setInflP] = useState(1000); const [inflR, setInflR] = useState(3); const [inflY, setInflY] = useState(10); const [inflRes, setInflRes] = useState<number | null>(null);
  const [debtB, setDebtB] = useState(15000); const [debtR, setDebtR] = useState(18); const [debtM, setDebtM] = useState(500); const [debtRes, setDebtRes] = useState<number | null>(null);
  const [tipAmt, setTipAmt] = useState(50); const [tipPct, setTipPct] = useState(15); const [tipRes, setTipRes] = useState<number | null>(null);
  const [netWAssets, setNetWAssets] = useState(500000); const [netWLiab, setNetWLiab] = useState(200000); const [netWRes, setNetWRes] = useState<number | null>(null);
  const [h2sHr, setH2sHr] = useState(50); const [h2sHrs, setH2sHrs] = useState(40); const [h2sRes, setH2sRes] = useState<number | null>(null);
  const [retSave, setRetSave] = useState(10000); const [retR, setRetR] = useState(7); const [retY, setRetY] = useState(30); const [retRes, setRetRes] = useState<number | null>(null);
  const [convVis, setConvVis] = useState(10000); const [convGoal, setConvGoal] = useState(500); const [convRes, setConvRes] = useState<number | null>(null);
  const [saveMonthly, setSaveMonthly] = useState(500); const [saveR, setSaveR] = useState(7); const [saveY, setSaveY] = useState(10); const [saveRes, setSaveRes] = useState<number | null>(null);
  const [seatPrice, setSeatPrice] = useState(50); const [seatCount, setSeatCount] = useState(100); const [seatRes, setSeatRes] = useState<number | null>(null);
  const [taxIncome, setTaxIncome] = useState(100000); const [taxRes, setTaxRes] = useState<string | null>(null);
  const [tdsAmt, setTdsAmt] = useState(50000); const [tdsPct, setTdsPct] = useState(10); const [tdsRes, setTdsRes] = useState<number | null>(null);
  const [trialVis, setTrialVis] = useState(10000); const [trialSignup, setTrialSignup] = useState(2000); const [trialPaid, setTrialPaid] = useState(500); const [trialRes, setTrialRes] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      <Card title="Simple Interest">
        <Inp label="Principal" value={siP} onChange={setSiP} prefix="$" small />
        <Inp label="Rate" value={siR} onChange={setSiR} suffix="%" small />
        <Inp label="Years" value={siT} onChange={setSiT} small />
        <CalcBtn onClick={() => setSiRes(siP * siR / 100 * siT)} label="Calculate" />
        {siRes !== null && <Result value={`$${siRes.toFixed(0)} interest · $${(siP + siRes).toFixed(0)} total`} />}
      </Card>
      <Card title="Compound Interest">
        <Inp label="Principal" value={ciP} onChange={setCiP} prefix="$" small />
        <Inp label="Rate" value={ciR} onChange={setCiR} suffix="%" small />
        <Inp label="Years" value={ciT} onChange={setCiT} small />
        <Inp label="Per Year" value={ciN} onChange={setCiN} small />
        <CalcBtn onClick={() => setCiRes(ciP * Math.pow(1 + ciR / 100 / ciN, ciN * ciT))} label="Calculate" />
        {ciRes !== null && <Result value={`$${ciRes.toFixed(0)} total · $${(ciRes - ciP).toFixed(0)} earned`} />}
      </Card>
      <Card title="Mortgage">
        <Inp label="Loan" value={mortA} onChange={setMortA} prefix="$" small />
        <Inp label="APR" value={mortR} onChange={setMortR} suffix="%" small />
        <Inp label="Years" value={mortY} onChange={setMortY} small />
        <CalcBtn onClick={() => { const r = mortR / 100 / 12; const n = mortY * 12; setMortRes(mortA * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)); }} label="Monthly Payment" />
        {mortRes !== null && <Result value={`$${mortRes.toFixed(0)}/mo · $${(mortRes * mortY * 12).toFixed(0)} total`} />}
      </Card>
      <Card title="Discount">
        <Inp label="Price" value={discP} onChange={setDiscP} prefix="$" small />
        <Inp label="Off" value={discPct} onChange={setDiscPct} suffix="%" small />
        <CalcBtn onClick={() => setDiscRes(discP * (1 - discPct / 100))} label="Final Price" />
        {discRes !== null && <Result value={`$${discRes.toFixed(2)} · Save $${(discP - discRes).toFixed(2)}`} />}
      </Card>
      <Card title="Car Loan">
        <Inp label="Amount" value={carP} onChange={setCarP} prefix="$" small />
        <Inp label="APR" value={carR} onChange={setCarR} suffix="%" small />
        <Inp label="Years" value={carY} onChange={setCarY} small />
        <CalcBtn onClick={() => { const r = carR / 100 / 12; const n = carY * 12; setCarRes(carP * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)); }} label="Monthly Payment" />
        {carRes !== null && <Result value={`$${carRes.toFixed(0)}/mo · $${(carRes * carY * 12).toFixed(0)} total`} />}
      </Card>
      <Card title="Car Lease">
        <Inp label="Price" value={carP} onChange={setCarP} prefix="$" small />
        <Inp label="Residual %" value={carR} onChange={setCarR} suffix="%" small />
        <Inp label="Months" value={carY} onChange={setCarY} small />
        <CalcBtn onClick={() => { const dep = carP * (1 - carR / 100); setCarRes(dep / carY + (carP + carP * carR / 100) * 0.001); }} label="Est. Monthly" />
        {carRes !== null && <Result value={`~$${carRes.toFixed(0)}/mo lease`} />}
      </Card>
      <Card title="Inflation">
        <Inp label="Amount" value={inflP} onChange={setInflP} prefix="$" small />
        <Inp label="Rate" value={inflR} onChange={setInflR} suffix="%" small />
        <Inp label="Years" value={inflY} onChange={setInflY} small />
        <CalcBtn onClick={() => setInflRes(inflP * Math.pow(1 + inflR / 100, inflY))} label="Future Value" />
        {inflRes !== null && <Result value={`$${inflRes.toFixed(0)} · Lost $${(inflRes - inflP).toFixed(0)} purchasing power`} />}
      </Card>
      <Card title="Debt Payoff">
        <Inp label="Balance" value={debtB} onChange={setDebtB} prefix="$" small />
        <Inp label="APR" value={debtR} onChange={setDebtR} suffix="%" small />
        <Inp label="Monthly" value={debtM} onChange={setDebtM} prefix="$" small />
        <CalcBtn onClick={() => { const r = debtR / 100 / 12; const n = Math.log(debtM / (debtM - debtB * r)) / Math.log(1 + r); setDebtRes(Math.ceil(n)); }} label="Months to Payoff" />
        {debtRes !== null && <Result value={`${debtRes} months · $${(debtRes * debtM).toFixed(0)} total`} />}
      </Card>
      <Card title="Tip Calculator">
        <Inp label="Bill" value={tipAmt} onChange={setTipAmt} prefix="$" small />
        <Inp label="Tip" value={tipPct} onChange={setTipPct} suffix="%" small />
        <CalcBtn onClick={() => setTipRes(tipAmt * tipPct / 100)} label="Tip Amount" />
        {tipRes !== null && <Result value={`$${tipRes.toFixed(2)} tip · $${(tipAmt + tipRes).toFixed(2)} total`} />}
      </Card>
      <Card title="Net Worth">
        <Inp label="Assets" value={netWAssets} onChange={setNetWAssets} prefix="$" small />
        <Inp label="Liabilities" value={netWLiab} onChange={setNetWLiab} prefix="$" small />
        <CalcBtn onClick={() => setNetWRes(netWAssets - netWLiab)} label="Calculate" />
        {netWRes !== null && <Result value={`$${netWRes.toLocaleString()} net worth`} />}
      </Card>
      <Card title="Hourly → Salary">
        <Inp label="Hourly" value={h2sHr} onChange={setH2sHr} prefix="$" small />
        <Inp label="Hours/wk" value={h2sHrs} onChange={setH2sHrs} small />
        <CalcBtn onClick={() => setH2sRes(h2sHr * h2sHrs * 52)} label="Annual Salary" />
        {h2sRes !== null && <Result value={`$${h2sRes.toLocaleString()}/yr`} />}
      </Card>
      <Card title="Retirement">
        <Inp label="Initial" value={retSave} onChange={setRetSave} prefix="$" small />
        <Inp label="Return" value={retR} onChange={setRetR} suffix="%" small />
        <Inp label="Years" value={retY} onChange={setRetY} small />
        <CalcBtn onClick={() => setRetRes(retSave * Math.pow(1 + retR / 100, retY))} label="Future Value" />
        {retRes !== null && <Result value={`$${retRes.toLocaleString()} (no monthly contribution)`} />}
      </Card>
      <Card title="Conversion Rate">
        <Inp label="Visitors" value={convVis} onChange={setConvVis} small />
        <Inp label="Conversions" value={convGoal} onChange={setConvGoal} small />
        <CalcBtn onClick={() => setConvRes(convGoal / convVis * 100)} label="CVR" />
        {convRes !== null && <Result value={`${convRes.toFixed(2)}%`} />}
      </Card>
      <Card title="Savings (Monthly)">
        <Inp label="Monthly" value={saveMonthly} onChange={setSaveMonthly} prefix="$" small />
        <Inp label="Return" value={saveR} onChange={setSaveR} suffix="%" small />
        <Inp label="Years" value={saveY} onChange={setSaveY} small />
        <CalcBtn onClick={() => { const r = saveR / 100 / 12; const n = saveY * 12; setSaveRes(saveMonthly * (Math.pow(1 + r, n) - 1) / r); }} label="Future Value" />
        {saveRes !== null && <Result value={`$${saveRes.toLocaleString()} total ($${(saveRes - saveMonthly * saveY * 12).toLocaleString()} earned)`} />}
      </Card>
      <Card title="Seat License">
        <Inp label="Price/seat" value={seatPrice} onChange={setSeatPrice} prefix="$" small />
        <Inp label="Seats" value={seatCount} onChange={setSeatCount} small />
        <CalcBtn onClick={() => setSeatRes(seatPrice * seatCount)} label="Monthly Revenue" />
        {seatRes !== null && <Result value={`$${seatRes.toLocaleString()}/mo · $${(seatRes * 12).toLocaleString()}/yr`} />}
      </Card>
      <Card title="Tax (Est.)">
        <Inp label="Annual Income" value={taxIncome} onChange={setTaxIncome} prefix="$" small />
        <CalcBtn onClick={() => {
          const brackets = [[11000, 0.1], [44725, 0.12], [95375, 0.22], [182100, 0.24], [231250, 0.32], [578125, 0.35], [Infinity, 0.37]];
          let tax = 0, remain = taxIncome, prev = 0;
          for (const [limit, rate] of brackets) {
            if (remain <= 0) break;
            const taxable = Math.min(remain, limit - prev);
            tax += taxable * rate;
            remain -= taxable;
            prev = limit;
          }
          setTaxRes(`$${tax.toLocaleString()} tax · $${(taxIncome - tax).toLocaleString()} after tax · ${(tax / taxIncome * 100).toFixed(1)}% effective`);
        }} label="Est. Tax (2025 US)" />
        {taxRes && <Result value={taxRes} />}
      </Card>
      <Card title="TDS (India)">
        <Inp label="Amount" value={tdsAmt} onChange={setTdsAmt} prefix="₹" small />
        <Inp label="TDS %" value={tdsPct} onChange={setTdsPct} suffix="%" small />
        <CalcBtn onClick={() => setTdsRes(tdsAmt * tdsPct / 100)} label="TDS Deduction" />
        {tdsRes !== null && <Result value={`₹${tdsRes.toLocaleString()} TDS · Net ₹${(tdsAmt - tdsRes).toLocaleString()}`} />}
      </Card>
      <Card title="Trial Conversion">
        <Inp label="Visitors" value={trialVis} onChange={setTrialVis} small />
        <Inp label="Signups" value={trialSignup} onChange={setTrialSignup} small />
        <Inp label="Paid" value={trialPaid} onChange={setTrialPaid} small />
        <CalcBtn onClick={() => setTrialRes(`${(trialSignup / trialVis * 100).toFixed(1)}% signup · ${(trialPaid / trialSignup * 100).toFixed(1)}% conversion · ${(trialPaid / trialVis * 100).toFixed(2)}% overall`)} label="Calculate" />
        {trialRes && <Result value={trialRes} />}
      </Card>
    </div>
  );
}

function MathCalcs() {
  const [qA, setQA] = useState(1); const [qB, setQB] = useState(-3); const [qC, setQC] = useState(2); const [qRes, setQRes] = useState<string | null>(null);
  const [fNum, setFNum] = useState(12); const [fDen, setFDen] = useState(8); const [fRes, setFRes] = useState<string | null>(null);
  const [stdV, setStdV] = useState(''); const [stdRes, setStdRes] = useState<{ mean: number; std: number; count: number } | null>(null);
  const [pA, setPA] = useState(3); const [pB, setPB] = useState(4); const [pRes, setPRes] = useState<number | null>(null);
  const [cR, setCR] = useState(5); const [cRes, setCRes] = useState<{ area: number; circ: number } | null>(null);
  const [triBase, setTriBase] = useState(6); const [triH, setTriH] = useState(4); const [triRes, setTriRes] = useState<number | null>(null);
  const [rectW, setRectW] = useState(5); const [rectH, setRectH] = useState(3); const [rectRes, setRectRes] = useState<number | null>(null);
  const [raA, setRaA] = useState(4); const [raB, setRaB] = useState(6); const [raRes, setRaRes] = useState<string | null>(null);
  const [probFav, setProbFav] = useState(1); const [probTot, setProbTot] = useState(6); const [probRes, setProbRes] = useState<number | null>(null);
  const [expBase, setExpBase] = useState(2); const [expPow, setExpPow] = useState(10); const [expRes, setExpRes] = useState<number | null>(null);
  const [gasMiles, setGasMiles] = useState(300); const [gasGallons, setGasGallons] = useState(10); const [gasRes, setGasRes] = useState<number | null>(null);
  const [dpiW, setDpiW] = useState(1920); const [dpiH, setDpiH] = useState(1080); const [dpiInch, setDpiInch] = useState(15.6); const [dpiRes, setDpiRes] = useState<number | null>(null);
  const [aspW, setAspW] = useState(1920); const [aspH, setAspH] = useState(1080); const [aspRes, setAspRes] = useState<string | null>(null);
  const [ipAddr, setIpAddr] = useState(''); const [cidr, setCidr] = useState(24); const [ipRes, setIpRes] = useState<string | null>(null);
  const [fluidMinVw, setFluidMinVw] = useState(320); const [fluidMaxVw, setFluidMaxVw] = useState(1440); const [fluidMinS, setFluidMinS] = useState(16); const [fluidMaxS, setFluidMaxS] = useState(32); const [fluidRes, setFluidRes] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      <Card title="Quadratic (ax²+bx+c)">
        <Inp label="a" value={qA} onChange={setQA} small />
        <Inp label="b" value={qB} onChange={setQB} small />
        <Inp label="c" value={qC} onChange={setQC} small />
        <CalcBtn onClick={() => { const d = qB * qB - 4 * qA * qC; setQRes(d < 0 ? 'No real roots' : `x = ${((-qB + Math.sqrt(d)) / (2 * qA)).toFixed(4)}, ${((-qB - Math.sqrt(d)) / (2 * qA)).toFixed(4)}`); }} label="Solve" />
        {qRes && <Result value={qRes} />}
      </Card>
      <Card title="Simplify Fraction">
        <Inp label="Num" value={fNum} onChange={setFNum} small />
        <Inp label="Den" value={fDen} onChange={setFDen} small />
        <CalcBtn onClick={() => { const g = (a: number, b: number): number => b === 0 ? a : g(b, a % b); const d = g(Math.abs(fNum), Math.abs(fDen)); setFRes(`${fNum / d}/${fDen / d}`); }} label="Simplify" />
        {fRes && <Result value={fRes} />}
      </Card>
      <Card title="Mean & Std Dev">
        <textarea value={stdV} onChange={e => setStdV(e.target.value)} placeholder="1,2,3,4,5"
          className="w-full h-12 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500 resize-none" />
        <CalcBtn onClick={() => {
          const nums = stdV.split(',').map(Number).filter(n => !isNaN(n));
          if (nums.length < 2) { toast.error('≥2 numbers required'); return; }
          const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
          const v = nums.reduce((a, b) => a + (b - mean) ** 2, 0) / (nums.length - 1);
          setStdRes({ mean, std: Math.sqrt(v), count: nums.length });
        }} label="Calculate" />
        {stdRes && <Result value={`n=${stdRes.count} · μ=${stdRes.mean.toFixed(2)} · σ=${stdRes.std.toFixed(2)}`} />}
      </Card>
      <Card title="Pythagorean (a²+b²=c²)">
        <Inp label="a" value={pA} onChange={setPA} small />
        <Inp label="b" value={pB} onChange={setPB} small />
        <CalcBtn onClick={() => setPRes(Math.sqrt(pA * pA + pB * pB))} label="Calculate c" />
        {pRes !== null && <Result value={`c = ${pRes.toFixed(4)}`} />}
      </Card>
      <Card title="Circle">
        <Inp label="Radius" value={cR} onChange={setCR} small />
        <CalcBtn onClick={() => setCRes({ area: Math.PI * cR * cR, circ: 2 * Math.PI * cR })} label="Calculate" />
        {cRes && <Result value={`A=${cRes.area.toFixed(2)} · C=${cRes.circ.toFixed(2)}`} />}
      </Card>
      <Card title="Triangle Area">
        <Inp label="Base" value={triBase} onChange={setTriBase} small />
        <Inp label="Height" value={triH} onChange={setTriH} small />
        <CalcBtn onClick={() => setTriRes(0.5 * triBase * triH)} label="Area" />
        {triRes !== null && <Result value={`Area = ${triRes.toFixed(2)}`} />}
      </Card>
      <Card title="Rectangle Area">
        <Inp label="Width" value={rectW} onChange={setRectW} small />
        <Inp label="Height" value={rectH} onChange={setRectH} small />
        <CalcBtn onClick={() => setRectRes(rectW * rectH)} label="Area" />
        {rectRes !== null && <Result value={`Area = ${rectRes.toFixed(2)}`} />}
      </Card>
      <Card title="Ratio (a:b)">
        <Inp label="a" value={raA} onChange={setRaA} small />
        <Inp label="b" value={raB} onChange={setRaB} small />
        <CalcBtn onClick={() => { const g = (a: number, b: number): number => b === 0 ? a : g(b, a % b); const d = g(raA, raB); setRaRes(`${raA / d} : ${raB / d} = ${((raA / raB) * 100).toFixed(1)}%`); }} label="Simplify" />
        {raRes && <Result value={raRes} />}
      </Card>
      <Card title="Probability">
        <Inp label="Favorable" value={probFav} onChange={setProbFav} small />
        <Inp label="Total" value={probTot} onChange={setProbTot} small />
        <CalcBtn onClick={() => setProbRes(probFav / probTot * 100)} label="Probability" />
        {probRes !== null && <Result value={`${probRes.toFixed(2)}% · 1 in ${(probTot / probFav).toFixed(0)}`} />}
      </Card>
      <Card title="Exponent">
        <Inp label="Base" value={expBase} onChange={setExpBase} small />
        <Inp label="Power" value={expPow} onChange={setExpPow} small />
        <CalcBtn onClick={() => setExpRes(Math.pow(expBase, expPow))} label="Calculate" />
        {expRes !== null && <Result value={`${expBase}^${expPow} = ${expRes.toLocaleString()}`} />}
      </Card>
      <Card title="Gas Mileage">
        <Inp label="Miles" value={gasMiles} onChange={setGasMiles} small />
        <Inp label="Gallons" value={gasGallons} onChange={setGasGallons} small />
        <CalcBtn onClick={() => setGasRes(gasMiles / gasGallons)} label="MPG" />
        {gasRes !== null && <Result value={`${gasRes.toFixed(1)} mpg`} />}
      </Card>
      <Card title="DPI / PPI">
        <Inp label="Width (px)" value={dpiW} onChange={setDpiW} small />
        <Inp label="Height (px)" value={dpiH} onChange={setDpiH} small />
        <Inp label="Diagonal (in)" value={dpiInch} onChange={setDpiInch} small />
        <CalcBtn onClick={() => setDpiRes(Math.sqrt(dpiW * dpiW + dpiH * dpiH) / dpiInch)} label="DPI" />
        {dpiRes !== null && <Result value={`${dpiRes.toFixed(1)} PPI · ${(dpiW / dpiRes).toFixed(2)}×${(dpiH / dpiRes).toFixed(2)} in`} />}
      </Card>
      <Card title="Aspect Ratio">
        <Inp label="Width" value={aspW} onChange={setAspW} small />
        <Inp label="Height" value={aspH} onChange={setAspH} small />
        <CalcBtn onClick={() => { const g = (a: number, b: number): number => b === 0 ? a : g(b, a % b); const d = g(aspW, aspH); setAspRes(`${aspW / d}:${aspH / d}`); }} label="Simplify" />
        {aspRes && <Result value={aspRes} />}
      </Card>
      <Card title="IP Subnet (CIDR)">
        <Inp label="CIDR" value={cidr} onChange={setCidr} small />
        <CalcBtn onClick={() => setIpRes(`${Math.pow(2, 32 - cidr).toLocaleString()} hosts · ${cidr <= 30 ? Math.pow(2, 32 - cidr) - 2 : Math.pow(2, 32 - cidr)} usable`)} label="Calculate" />
        {ipRes && <Result value={ipRes} />}
      </Card>
      <Card title="Fluid Typography">
        <Inp label="Min vw" value={fluidMinVw} onChange={setFluidMinVw} suffix="px" small />
        <Inp label="Max vw" value={fluidMaxVw} onChange={setFluidMaxVw} suffix="px" small />
        <Inp label="Min size" value={fluidMinS} onChange={setFluidMinS} suffix="px" small />
        <Inp label="Max size" value={fluidMaxS} onChange={setFluidMaxS} suffix="px" small />
        <CalcBtn onClick={() => { const slope = (fluidMaxS - fluidMinS) / (fluidMaxVw - fluidMinVw); const intercept = fluidMinS - slope * fluidMinVw; setFluidRes(`font-size: clamp(${fluidMinS}px, ${(slope * 100).toFixed(4)}vw + ${intercept.toFixed(4)}px, ${fluidMaxS}px);`); }} label="Generate CSS" />
        {fluidRes && <Result value={fluidRes} />}
      </Card>
    </div>
  );
}

function DateTimeCalcs() {
  const [d1, setD1] = useState(() => new Date().toISOString().split('T')[0]);
  const [d2, setD2] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0]; });
  const [diffRes, setDiffRes] = useState<string | null>(null);
  const [dowD, setDowD] = useState(() => new Date().toISOString().split('T')[0]); const [dowRes, setDowRes] = useState<string | null>(null);
  const [addD, setAddD] = useState(() => new Date().toISOString().split('T')[0]); const [addDy, setAddDy] = useState(30); const [addRes, setAddRes] = useState<string | null>(null);
  const [wkD, setWkD] = useState(() => new Date().toISOString().split('T')[0]); const [wkRes, setWkRes] = useState<string | null>(null);
  const [doyD, setDoyD] = useState(() => new Date().toISOString().split('T')[0]); const [doyRes, setDoyRes] = useState<string | null>(null);
  const [leapY, setLeapY] = useState(2024); const [leapRes, setLeapRes] = useState<string | null>(null);
  const [tsD, setTsD] = useState(() => new Date().toISOString().split('T')[0]); const [tsRes, setTsRes] = useState<string | null>(null);
  const [durH, setDurH] = useState(2); const [durM, setDurM] = useState(30); const [durRes, setDurRes] = useState<string | null>(null);
  const [bdnsD, setBdnsD] = useState(() => new Date().toISOString().split('T')[0]); const [bdnsDy, setBdnsDy] = useState(10); const [bdnsRes, setBdnsRes] = useState<string | null>(null);
  const [tsToD, setTsToD] = useState(Math.floor(Date.now() / 1000).toString()); const [tsToRes, setTsToRes] = useState<string | null>(null);
  const [stopH, setStopH] = useState(0); const [stopM, setStopM] = useState(0); const [stopS, setStopS] = useState(0); const [stopRunning, setStopRunning] = useState(false);
  const [stopElapsed, setStopElapsed] = useState(0);
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  React.useEffect(() => {
    if (!stopRunning) return;
    const interval = setInterval(() => setStopElapsed(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [stopRunning]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      <Card title="Date Difference">
        <input type="date" value={d1} onChange={e => setD1(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        <input type="date" value={d2} onChange={e => setD2(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        <CalcBtn onClick={() => { const ms = Math.abs(new Date(d2).getTime() - new Date(d1).getTime()); setDiffRes(`${Math.floor(ms / 86400000)} days`); }} label="Difference" />
        {diffRes && <Result value={diffRes} />}
      </Card>
      <Card title="Day of Week">
        <input type="date" value={dowD} onChange={e => setDowD(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        <CalcBtn onClick={() => setDowRes(DAYS[new Date(dowD).getDay()])} label="Check" />
        {dowRes && <Result value={dowRes} />}
      </Card>
      <Card title="Add Days">
        <input type="date" value={addD} onChange={e => setAddD(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        <Inp label="Days" value={addDy} onChange={setAddDy} small />
        <CalcBtn onClick={() => { const d = new Date(addD); d.setDate(d.getDate() + addDy); setAddRes(d.toISOString().split('T')[0]); }} label="Calculate" />
        {addRes && <Result value={addRes} />}
      </Card>
      <Card title="Week Number">
        <input type="date" value={wkD} onChange={e => setWkD(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        <CalcBtn onClick={() => { const d = new Date(wkD); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7); setWkRes(`Week ${Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 4).getTime()) / 604800000) + 1}`); }} label="ISO Week" />
        {wkRes && <Result value={wkRes} />}
      </Card>
      <Card title="Day of Year">
        <input type="date" value={doyD} onChange={e => setDoyD(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        <CalcBtn onClick={() => { const s = new Date(doyD); const y = s.getFullYear(); const d = Math.floor((s.getTime() - new Date(y, 0, 0).getTime()) / 86400000); setDoyRes(`Day ${d} of ${y}`); }} label="Calculate" />
        {doyRes && <Result value={doyRes} />}
      </Card>
      <Card title="Leap Year Check">
        <Inp label="Year" value={leapY} onChange={setLeapY} small />
        <CalcBtn onClick={() => setLeapRes((leapY % 4 === 0 && leapY % 100 !== 0) || leapY % 400 === 0 ? '✓ Leap year' : '✗ Not leap year')} label="Check" />
        {leapRes && <Result value={leapRes} />}
      </Card>
      <Card title="Date → Timestamp">
        <input type="date" value={tsD} onChange={e => setTsD(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        <CalcBtn onClick={() => setTsRes(String(Math.floor(new Date(tsD).getTime() / 1000)))} label="Convert" />
        {tsRes && <Result value={tsRes} />}
      </Card>
      <Card title="Timestamp → Date">
        <Inp label="Unix ts" value={parseInt(tsToD) || 0} onChange={v => setTsToD(String(v))} small />
        <CalcBtn onClick={() => setTsToRes(new Date(parseInt(tsToD) * 1000).toISOString().split('T')[0])} label="Convert" />
        {tsToRes && <Result value={tsToRes} />}
      </Card>
      <Card title="Time Duration">
        <Inp label="Hours" value={durH} onChange={setDurH} small />
        <Inp label="Minutes" value={durM} onChange={setDurM} small />
        <CalcBtn onClick={() => setDurRes(`${durH * 60 + durM} min = ${(durH + durM / 60).toFixed(2)} hrs = ${(durH * 60 + durM) * 60} sec`)} label="Convert" />
        {durRes && <Result value={durRes} />}
      </Card>
      <Card title="Business Days">
        <input type="date" value={bdnsD} onChange={e => setBdnsD(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        <Inp label="Days" value={bdnsDy} onChange={setBdnsDy} small />
        <CalcBtn onClick={() => {
          let d = new Date(bdnsD); let n = Math.abs(bdnsDy); const sign = bdnsDy >= 0 ? 1 : -1;
          while (n > 0) { d.setDate(d.getDate() + sign); if (d.getDay() !== 0 && d.getDay() !== 6) n--; }
          setBdnsRes(d.toISOString().split('T')[0]);
        }} label="Add Business Days" />
        {bdnsRes && <Result value={bdnsRes} />}
      </Card>
      <Card title="Stopwatch">
        <div className="text-center">
          <div className="text-xl font-mono font-bold text-zinc-900 dark:text-white">
            {Math.floor(stopElapsed / 3600).toString().padStart(2, '0')}:
            {Math.floor((stopElapsed % 3600) / 60).toString().padStart(2, '0')}:
            {(stopElapsed % 60).toString().padStart(2, '0')}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => { setStopRunning(true); if (!stopRunning) setStopElapsed(0); }}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${stopRunning ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>Start</button>
          <button onClick={() => setStopRunning(false)}
            className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${!stopRunning ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400' : 'bg-red-600 hover:bg-red-500 text-white'}`}>Stop</button>
          <button onClick={() => { setStopRunning(false); setStopElapsed(0); }}
            className="flex-1 py-1 text-[10px] font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700">Reset</button>
        </div>
      </Card>
    </div>
  );
}

function HealthCalcs() {
  const [bmiW, setBmiW] = useState(70); const [bmiH, setBmiH] = useState(175); const [bmiRes, setBmiRes] = useState<{ bmi: number; cat: string } | null>(null);
  const [bmrW, setBmrW] = useState(70); const [bmrH, setBmrH] = useState(175); const [bmrA, setBmrA] = useState(30); const [bmrS, setBmrS] = useState<'male'|'female'>('male'); const [bmrRes, setBmrRes] = useState<number | null>(null);
  const [bfW, setBfW] = useState(80); const [bfN, setBfN] = useState(38); const [bfH, setBfH] = useState(175); const [bfS, setBfS] = useState<'male'|'female'>('male'); const [bfRes, setBfRes] = useState<number | null>(null);
  const [kcalW, setKcalW] = useState(70); const [kcalH, setKcalH] = useState(175); const [kcalA, setKcalA] = useState(30); const [kcalS, setKcalS] = useState<'male'|'female'>('male'); const [kcalAct, setKcalAct] = useState(1.55); const [kcalRes, setKcalRes] = useState<number | null>(null);
  const [kidsBmiW, setKidsBmiW] = useState(30); const [kidsBmiH, setKidsBmiH] = useState(130); const [kidsBmiRes, setKidsBmiRes] = useState<number | null>(null);
  const [bsaW, setBsaW] = useState(70); const [bsaH, setBsaH] = useState(175); const [bsaRes, setBsaRes] = useState<number | null>(null);
  const [idealH, setIdealH] = useState(175); const [idealS, setIdealS] = useState<'male'|'female'>('male'); const [idealRes, setIdealRes] = useState<number | null>(null);
  const [leanW, setLeanW] = useState(70); const [leanH, setLeanH] = useState(175); const [leanS, setLeanS] = useState<'male'|'female'>('male'); const [leanRes, setLeanRes] = useState<number | null>(null);
  const [h2sAge, setH2sAge] = useState(30); const [h2sMax, setH2sMax] = useState<number>(220 - 30); const [h2sRes, setH2sRes] = useState<string | null>(null);
  const [babyAgeMo, setBabyAgeMo] = useState(6); const [babyW, setBabyW] = useState(7.5); const [babyRes, setBabyRes] = useState<string | null>(null);
  const [babyHtAge, setBabyHtAge] = useState(3); const [babyHtCm, setBabyHtCm] = useState(95); const [babyHtRes, setBabyHtRes] = useState<string | null>(null);
  const [nursingFreq, setNursingFreq] = useState(8); const [nursingAge, setNursingAge] = useState(3); const [nursingRes, setNursingRes] = useState<string | null>(null);
  const [calGoalW, setCalGoalW] = useState(70); const [calGoalH, setCalGoalH] = useState(175); const [calGoalA, setCalGoalA] = useState(30); const [calGoalS, setCalGoalS] = useState<'male'|'female'>('male'); const [calGoalRes, setCalGoalRes] = useState<number | null>(null);
  const [childHtDad, setChildHtDad] = useState(180); const [childHtMom, setChildHtMom] = useState(165); const [childHtS, setChildHtS] = useState<'male'|'female'>('male'); const [childHtRes, setChildHtRes] = useState<string | null>(null);
  const [cycleDist, setCycleDist] = useState(20); const [cycleW, setCycleW] = useState(70); const [cycleTime, setCycleTime] = useState(60); const [cycleRes, setCycleRes] = useState<string | null>(null);
  const [ketoCarbs, setKetoCarbs] = useState(20); const [ketoProtein, setKetoProtein] = useState(75); const [ketoFat, setKetoFat] = useState(155); const [ketoRes, setKetoRes] = useState<string | null>(null);
  const [macroW, setMacroW] = useState(70); const [macroAct, setMacroAct] = useState(1.55); const [macroGoal, setMacroGoal] = useState<'maintain'|'lose'|'gain'>('maintain'); const [macroRes, setMacroRes] = useState<string | null>(null);
  const [ovLastPeriod, setOvLastPeriod] = useState(''); const [ovCycle, setOvCycle] = useState(28); const [ovRes, setOvRes] = useState<string | null>(null);
  const [pregLmp, setPregLmp] = useState(''); const [pregRes, setPregRes] = useState<string | null>(null);
  const [protW, setProtW] = useState(70); const [protAct, setProtAct] = useState<'sedentary'|'moderate'|'active'|'athlete'>('moderate'); const [protRes, setProtRes] = useState<number | null>(null);
  const [paceDist, setPaceDist] = useState(5); const [paceTime, setPaceTime] = useState(30); const [paceRes, setPaceRes] = useState<string | null>(null);
  const [sleepAge, setSleepAge] = useState(30); const [sleepRes, setSleepRes] = useState<string | null>(null);
  const [stepsCount, setStepsCount] = useState(10000); const [stepsRes, setStepsRes] = useState<number | null>(null);
  const [waterW, setWaterW] = useState(70); const [waterAct, setWaterAct] = useState(30); const [waterRes, setWaterRes] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      <Card title="BMI">
        <Inp label="Weight" value={bmiW} onChange={setBmiW} suffix="kg" small />
        <Inp label="Height" value={bmiH} onChange={setBmiH} suffix="cm" small />
        <CalcBtn onClick={() => { const b = bmiW / ((bmiH / 100) ** 2); const c = b < 18.5 ? 'Underweight' : b < 25 ? 'Normal' : b < 30 ? 'Overweight' : 'Obese'; setBmiRes({ bmi: b, cat: c }); }} label="Calculate" />
        {bmiRes && <Result value={`${bmiRes.bmi.toFixed(1)} · ${bmiRes.cat}`} />}
      </Card>
      <Card title="BMR">
        <Inp label="Weight" value={bmrW} onChange={setBmrW} suffix="kg" small />
        <Inp label="Height" value={bmrH} onChange={setBmrH} suffix="cm" small />
        <Inp label="Age" value={bmrA} onChange={setBmrA} small />
        <div className="flex gap-1">
          <button onClick={() => setBmrS('male')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${bmrS === 'male' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>M</button>
          <button onClick={() => setBmrS('female')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${bmrS === 'female' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>F</button>
        </div>
        <CalcBtn onClick={() => setBmrRes(bmrS === 'male' ? 88.362 + 13.397 * bmrW + 4.799 * bmrH - 5.677 * bmrA : 447.593 + 9.247 * bmrW + 3.098 * bmrH - 4.330 * bmrA)} label="BMR" />
        {bmrRes !== null && <Result value={`${bmrRes.toFixed(0)} kcal/day`} />}
      </Card>
      <Card title="Body Fat (Navy)">
        <Inp label="Waist" value={bfW} onChange={setBfW} suffix="cm" small />
        <Inp label="Neck" value={bfN} onChange={setBfN} suffix="cm" small />
        <Inp label="Height" value={bfH} onChange={setBfH} suffix="cm" small />
        <div className="flex gap-1">
          <button onClick={() => setBfS('male')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${bfS === 'male' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>M</button>
          <button onClick={() => setBfS('female')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${bfS === 'female' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>F</button>
        </div>
        <CalcBtn onClick={() => { const log = Math.log10(bfW - bfN); setBfRes(parseFloat((495 / (1.0324 - 0.19077 * log + 0.15456 * Math.log10(bfH)) - 450).toFixed(1))); }} label="Body Fat %" />
        {bfRes !== null && <Result value={`${bfRes}%`} />}
      </Card>
      <Card title="TDEE">
        <Inp label="Weight" value={kcalW} onChange={setKcalW} suffix="kg" small />
        <Inp label="Height" value={kcalH} onChange={setKcalH} suffix="cm" small />
        <Inp label="Age" value={kcalA} onChange={setKcalA} small />
        <div className="flex gap-1">
          <button onClick={() => setKcalS('male')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${kcalS === 'male' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>M</button>
          <button onClick={() => setKcalS('female')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${kcalS === 'female' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>F</button>
        </div>
        <select value={kcalAct} onChange={e => setKcalAct(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] text-zinc-900 dark:text-white outline-none">
          <option value={1.2}>Sedentary</option><option value={1.375}>Light</option><option value={1.55}>Moderate</option><option value={1.725}>Active</option><option value={1.9}>Very Active</option>
        </select>
        <CalcBtn onClick={() => { const bmr = kcalS === 'male' ? 88.362 + 13.397 * kcalW + 4.799 * kcalH - 5.677 * kcalA : 447.593 + 9.247 * kcalW + 3.098 * kcalH - 4.330 * kcalA; setKcalRes(bmr * kcalAct); }} label="TDEE" />
        {kcalRes !== null && <Result value={`${kcalRes.toFixed(0)} kcal/day`} />}
      </Card>
      <Card title="BMI for Kids">
        <Inp label="Weight" value={kidsBmiW} onChange={setKidsBmiW} suffix="kg" small />
        <Inp label="Height" value={kidsBmiH} onChange={setKidsBmiH} suffix="cm" small />
        <CalcBtn onClick={() => setKidsBmiRes(kidsBmiW / ((kidsBmiH / 100) ** 2))} label="BMI" />
        {kidsBmiRes !== null && <Result value={`BMI: ${kidsBmiRes.toFixed(1)} (consult pediatrician for percentile)`} />}
      </Card>
      <Card title="Body Surface Area">
        <Inp label="Weight" value={bsaW} onChange={setBsaW} suffix="kg" small />
        <Inp label="Height" value={bsaH} onChange={setBsaH} suffix="cm" small />
        <CalcBtn onClick={() => setBsaRes(Math.sqrt(bsaW * bsaH / 3600))} label="BSA (Mosteller)" />
        {bsaRes !== null && <Result value={`${bsaRes.toFixed(2)} m²`} />}
      </Card>
      <Card title="Ideal Weight">
        <Inp label="Height" value={idealH} onChange={setIdealH} suffix="cm" small />
        <div className="flex gap-1">
          <button onClick={() => setIdealS('male')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${idealS === 'male' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>M</button>
          <button onClick={() => setIdealS('female')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${idealS === 'female' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>F</button>
        </div>
        <CalcBtn onClick={() => setIdealRes(idealS === 'male' ? 50 + 0.91 * (idealH - 152.4) : 45.5 + 0.91 * (idealH - 152.4))} label="Devine Formula" />
        {idealRes !== null && <Result value={`${idealRes.toFixed(1)} kg`} />}
      </Card>
      <Card title="Lean Body Mass">
        <Inp label="Weight" value={leanW} onChange={setLeanW} suffix="kg" small />
        <Inp label="Height" value={leanH} onChange={setLeanH} suffix="cm" small />
        <div className="flex gap-1">
          <button onClick={() => setLeanS('male')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${leanS === 'male' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>M</button>
          <button onClick={() => setLeanS('female')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${leanS === 'female' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>F</button>
        </div>
        <CalcBtn onClick={() => setLeanRes(leanS === 'male' ? 0.407 * leanW + 0.267 * leanH - 19.2 : 0.252 * leanW + 0.473 * leanH - 48.3)} label="Boer Formula" />
        {leanRes !== null && <Result value={`${leanRes.toFixed(1)} kg`} />}
      </Card>
      <Card title="Heart Rate Zones">
        <Inp label="Age" value={h2sAge} onChange={v => { setH2sAge(v); setH2sMax(220 - v); }} small />
        <CalcBtn onClick={() => { const m = 220 - h2sAge; setH2sRes(`Max: ${m} · Zone 2: ${Math.round(m * 0.6)}-${Math.round(m * 0.7)} · Zone 5: ${Math.round(m * 0.9)}-${m}`); }} label="Zones" />
        {h2sRes && <Result value={h2sRes} />}
      </Card>
      <Card title="Calorie Calculator">
        <Inp label="Weight" value={calGoalW} onChange={setCalGoalW} suffix="kg" small />
        <Inp label="Height" value={calGoalH} onChange={setCalGoalH} suffix="cm" small />
        <Inp label="Age" value={calGoalA} onChange={setCalGoalA} small />
        <div className="flex gap-1">
          <button onClick={() => setCalGoalS('male')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${calGoalS === 'male' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>M</button>
          <button onClick={() => setCalGoalS('female')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${calGoalS === 'female' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>F</button>
        </div>
        <CalcBtn onClick={() => { const bmr = calGoalS === 'male' ? 88.362 + 13.397 * calGoalW + 4.799 * calGoalH - 5.677 * calGoalA : 447.593 + 9.247 * calGoalW + 3.098 * calGoalH - 4.330 * calGoalA; setCalGoalRes(bmr); }} label="Resting Calories" />
        {calGoalRes !== null && <Result value={`${calGoalRes.toFixed(0)} kcal/day (BMR)`} />}
      </Card>
      <Card title="Baby Formula">
        <Inp label="Age (months)" value={babyAgeMo} onChange={setBabyAgeMo} small />
        <Inp label="Weight (kg)" value={babyW} onChange={setBabyW} small />
        <CalcBtn onClick={() => { const daily = babyW * 150; const perFeed = daily / nursingFreq; setBabyRes(`${daily.toFixed(0)} mL/day · ~${perFeed.toFixed(0)} mL per feed (${nursingFreq}x/day)`); }} label="Daily Needs" />
        {babyRes && <Result value={babyRes} />}
      </Card>
      <Card title="Child Height Predictor">
        <Inp label="Dad (cm)" value={childHtDad} onChange={setChildHtDad} small />
        <Inp label="Mom (cm)" value={childHtMom} onChange={setChildHtMom} small />
        <div className="flex gap-1">
          <button onClick={() => setChildHtS('male')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${childHtS === 'male' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>M</button>
          <button onClick={() => setChildHtS('female')} className={`flex-1 py-1 text-[10px] font-bold rounded-lg ${childHtS === 'female' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>F</button>
        </div>
        <CalcBtn onClick={() => { const mid = (childHtDad + childHtMom) / 2; setChildHtRes(childHtS === 'male' ? `${(mid + 6.5).toFixed(1)} cm` : `${(mid - 6.5).toFixed(1)} cm`); }} label="Predicted Height" />
        {childHtRes && <Result value={childHtRes} />}
      </Card>
      <Card title="Breastfeeding Calories">
        <Inp label="Age (months)" value={nursingAge} onChange={setNursingAge} small />
        <Inp label="Feeds/day" value={nursingFreq} onChange={setNursingFreq} small />
        <CalcBtn onClick={() => { const extra = nursingAge <= 6 ? 500 : 400; setNursingRes(`~${extra} extra kcal/day needed (for ${nursingFreq}x feeds)`); }} label="Extra Calories" />
        {nursingRes && <Result value={nursingRes} />}
      </Card>
      <Card title="Cycling Calories">
        <Inp label="Distance" value={cycleDist} onChange={setCycleDist} suffix="km" small />
        <Inp label="Weight" value={cycleW} onChange={setCycleW} suffix="kg" small />
        <Inp label="Duration" value={cycleTime} onChange={setCycleTime} suffix="min" small />
        <CalcBtn onClick={() => { const met = 8; const kcal = met * 3.5 * cycleW / 200 * cycleTime; setCycleRes(`${kcal.toFixed(0)} kcal · ${(cycleDist / (cycleTime / 60)).toFixed(1)} km/h avg`); }} label="Calories Burned" />
        {cycleRes && <Result value={cycleRes} />}
      </Card>
      <Card title="Keto Macros">
        <Inp label="Carbs (g)" value={ketoCarbs} onChange={setKetoCarbs} small />
        <Inp label="Protein (g)" value={ketoProtein} onChange={setKetoProtein} small />
        <Inp label="Fat (g)" value={ketoFat} onChange={setKetoFat} small />
        <CalcBtn onClick={() => { const total = ketoCarbs * 4 + ketoProtein * 4 + ketoFat * 9; setKetoRes(`${total} kcal · ${(ketoFat * 9 / total * 100).toFixed(0)}% fat · ${(ketoProtein * 4 / total * 100).toFixed(0)}% protein · ${(ketoCarbs * 4 / total * 100).toFixed(0)}% carbs`); }} label="Total Calories" />
        {ketoRes && <Result value={ketoRes} />}
      </Card>
      <Card title="Macro Calculator">
        <Inp label="Weight" value={macroW} onChange={setMacroW} suffix="kg" small />
        <select value={macroAct} onChange={e => setMacroAct(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] text-zinc-900 dark:text-white outline-none">
          <option value={1.2}>Sedentary</option><option value={1.375}>Light</option><option value={1.55}>Moderate</option><option value={1.725}>Active</option>
        </select>
        <select value={macroGoal} onChange={e => setMacroGoal(e.target.value as any)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] text-zinc-900 dark:text-white outline-none">
          <option value="maintain">Maintain</option><option value="lose">Lose (-20%)</option><option value="gain">Gain (+20%)</option>
        </select>
        <CalcBtn onClick={() => { const bmr = 88.362 + 13.397 * macroW + 4.799 * 175 - 5.677 * 30; let cal = bmr * macroAct; if (macroGoal === 'lose') cal *= 0.8; if (macroGoal === 'gain') cal *= 1.2; const p = macroW * 2; const f = cal * 0.25 / 9; const c = (cal - p * 4 - f * 9) / 4; setMacroRes(`${cal.toFixed(0)} kcal · P:${p.toFixed(0)}g C:${c.toFixed(0)}g F:${f.toFixed(0)}g`); }} label="Calculate" />
        {macroRes && <Result value={macroRes} />}
      </Card>
      <Card title="Protein Calculator">
        <Inp label="Weight" value={protW} onChange={setProtW} suffix="kg" small />
        <select value={protAct} onChange={e => setProtAct(e.target.value as any)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] text-zinc-900 dark:text-white outline-none">
          <option value="sedentary">Sedentary (0.8 g/kg)</option><option value="moderate">Moderate (1.2 g/kg)</option><option value="active">Active (1.6 g/kg)</option><option value="athlete">Athlete (2.0 g/kg)</option>
        </select>
        <CalcBtn onClick={() => { const factor = { sedentary: 0.8, moderate: 1.2, active: 1.6, athlete: 2.0 }[protAct]; setProtRes(protW * (factor || 1.2)); }} label="Daily Protein" />
        {protRes !== null && <Result value={`${protRes.toFixed(0)} g protein/day`} />}
      </Card>
      <Card title="Running Pace">
        <Inp label="Distance" value={paceDist} onChange={setPaceDist} suffix="km" small />
        <Inp label="Time (min)" value={paceTime} onChange={setPaceTime} small />
        <CalcBtn onClick={() => { const pace = paceTime / paceDist; const min = Math.floor(pace); const sec = Math.round((pace - min) * 60); setPaceRes(`${paceDist.toFixed(1)} km in ${paceTime} min · ${min}:${sec.toString().padStart(2, '0')} /km · ${(paceDist / (paceTime / 60)).toFixed(1)} km/h`); }} label="Calculate Pace" />
        {paceRes && <Result value={paceRes} />}
      </Card>
      <Card title="Sleep Calculator">
        <Inp label="Age" value={sleepAge} onChange={setSleepAge} small />
        <CalcBtn onClick={() => { const hrs = sleepAge <= 1 ? '12-16' : sleepAge <= 2 ? '11-14' : sleepAge <= 5 ? '10-13' : sleepAge <= 13 ? '9-11' : sleepAge <= 17 ? '8-10' : '7-9'; setSleepRes(`Recommended: ${hrs} hours/night`); }} label="Recommended Sleep" />
        {sleepRes && <Result value={sleepRes} />}
      </Card>
      <Card title="Steps to Calories">
        <Inp label="Steps" value={stepsCount} onChange={setStepsCount} small />
        <CalcBtn onClick={() => setStepsRes(stepsCount * 0.04)} label="Calories Burned" />
        {stepsRes !== null && <Result value={`~${stepsRes.toFixed(0)} kcal (est.) · ${(stepsCount / 7500).toFixed(1)} km`} />}
      </Card>
      <Card title="Water Intake">
        <Inp label="Weight" value={waterW} onChange={setWaterW} suffix="kg" small />
        <Inp label="Exercise" value={waterAct} onChange={setWaterAct} suffix="min" small />
        <CalcBtn onClick={() => setWaterRes(waterW * 0.033 + waterAct * 0.012)} label="Daily Water" />
        {waterRes !== null && <Result value={`${waterRes.toFixed(1)} L/day (${(waterRes / 0.355).toFixed(0)} cans)`} />}
      </Card>
      <Card title="Pregnancy Due Date">
        <input type="date" value={pregLmp} onChange={e => setPregLmp(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        <CalcBtn onClick={() => { if (!pregLmp) { toast.error('Select LMP date'); return; } const d = new Date(pregLmp); d.setDate(d.getDate() + 280); setPregRes(`Due: ${d.toDateString()} · ${Math.ceil((d.getTime() - Date.now()) / 86400000)} days remaining`); }} label="Calculate Due Date" />
        {pregRes && <Result value={pregRes} />}
      </Card>
      <Card title="Ovulation">
        <input type="date" value={ovLastPeriod} onChange={e => setOvLastPeriod(e.target.value)} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        <Inp label="Cycle (days)" value={ovCycle} onChange={setOvCycle} small />
        <CalcBtn onClick={() => { if (!ovLastPeriod) { toast.error('Select last period date'); return; } const d = new Date(ovLastPeriod); d.setDate(d.getDate() + ovCycle - 14); const f = new Date(d); f.setDate(f.getDate() - 1); const e = new Date(d); e.setDate(e.getDate() + 1); setOvRes(`Ovulation: ${d.toDateString()} · Fertile window: ${f.toDateString()} - ${e.toDateString()}`); }} label="Calculate" />
        {ovRes && <Result value={ovRes} />}
      </Card>
    </div>
  );
}

function BusinessCalcs() {
  const [beRev, setBeRev] = useState(100); const [beVar, setBeVar] = useState(40); const [beFix, setBeFix] = useState(30000); const [beRes, setBeRes] = useState<number | null>(null);
  const [brRev, setBrRev] = useState(500000); const [brExp, setBrExp] = useState(450000); const [brRes, setBrRes] = useState<number | null>(null);
  const [churnCust, setChurnCust] = useState(1000); const [churnLost, setChurnLost] = useState(50); const [churnRes, setChurnRes] = useState<number | null>(null);
  const [mrrM, setMrrM] = useState(50000); const [mrrRes, setMrrRes] = useState<number | null>(null);
  const [arrM, setArrM] = useState(600000); const [arrRes, setArrRes] = useState<number | null>(null);
  const [npsP, setNpsP] = useState(60); const [npsD, setNpsD] = useState(20); const [npsRes, setNpsRes] = useState<number | null>(null);
  const [rgRev, setRgRev] = useState(1000000); const [rgPrev, setRgPrev] = useState(800000); const [rgRes, setRgRes] = useState<number | null>(null);
  const [rwRev, setRwRev] = useState(500000); const [rwExp, setRwExp] = useState(400000); const [rwRes, setRwRes] = useState<number | null>(null);
  const [ltvAp, setLtvAp] = useState(100); const [ltvMonths, setLtvMonths] = useState(24); const [ltvRes, setLtvRes] = useState<number | null>(null);
  const [cacSales, setCacSales] = useState(50000); const [cacMkt, setCacMkt] = useState(50000); const [cacCustomers, setCacCustomers] = useState(100); const [cacRes, setCacRes] = useState<number | null>(null);
  const [rvBuyP, setRvBuyP] = useState(500000); const [rvRent, setRvRent] = useState(2500); const [rvYrs, setRvYrs] = useState(5); const [rvRes, setRvRes] = useState<string | null>(null);
  const [abCtrl, setAbCtrl] = useState(1000); const [abVar, setAbVar] = useState(1000); const [abCtrlC, setAbCtrlC] = useState(100); const [abVarC, setAbVarC] = useState(120); const [abRes, setAbRes] = useState<string | null>(null);
  const [semVerInput, setSemVerInput] = useState('1.2.3'); const [semVerRes, setSemVerRes] = useState<string | null>(null);
  const [gradeScore, setGradeScore] = useState(85); const [gradeTotal, setGradeTotal] = useState(100); const [gradeRes, setGradeRes] = useState<string | null>(null);
  const [gpaGrades, setGpaGrades] = useState('A,B+,A-,B'); const [gpaRes, setGpaRes] = useState<number | null>(null);
  const GPA_MAP: Record<string, number> = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0 };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      <Card title="Break Even">
        <Inp label="Price" value={beRev} onChange={setBeRev} prefix="$" small />
        <Inp label="Var Cost" value={beVar} onChange={setBeVar} prefix="$" small />
        <Inp label="Fixed" value={beFix} onChange={setBeFix} prefix="$" small />
        <CalcBtn onClick={() => { if (beRev - beVar <= 0) toast.error('Price must exceed variable cost'); else setBeRes(Math.ceil(beFix / (beRev - beVar))); }} label="BEP (units)" />
        {beRes !== null && <Result value={`${beRes} units · $${(beRes * beRev).toLocaleString()} revenue`} />}
      </Card>
      <Card title="Burn Rate">
        <Inp label="Revenue" value={brRev} onChange={setBrRev} prefix="$" small />
        <Inp label="Expenses" value={brExp} onChange={setBrExp} prefix="$" small />
        <CalcBtn onClick={() => setBrRes(brRev - brExp)} label="Net Burn" />
        {brRes !== null && <Result value={brRes >= 0 ? `+$${brRes.toLocaleString()}/mo profit` : `-$${Math.abs(brRes).toLocaleString()}/mo burn`} />}
      </Card>
      <Card title="Churn Rate">
        <Inp label="Customers" value={churnCust} onChange={setChurnCust} small />
        <Inp label="Lost" value={churnLost} onChange={setChurnLost} small />
        <CalcBtn onClick={() => setChurnRes(churnLost / churnCust * 100)} label="Monthly Churn" />
        {churnRes !== null && <Result value={`${churnRes.toFixed(2)}%/mo · ${(100 * (1 - Math.pow(1 - churnRes / 100, 12))).toFixed(1)}% annual`} />}
      </Card>
      <Card title="MRR">
        <Inp label="Monthly Rev" value={mrrM} onChange={setMrrM} prefix="$" small />
        <CalcBtn onClick={() => setMrrRes(mrrM)} label="MRR" />
        {mrrRes !== null && <Result value={`$${mrrRes.toLocaleString()}/mo`} />}
      </Card>
      <Card title="ARR">
        <Inp label="Annual Rev" value={arrM} onChange={setArrM} prefix="$" small />
        <CalcBtn onClick={() => setArrRes(arrM)} label="ARR" />
        {arrRes !== null && <Result value={`$${arrRes.toLocaleString()}/yr`} />}
      </Card>
      <Card title="NPS">
        <Inp label="Promoters (9-10)" value={npsP} onChange={setNpsP} small />
        <Inp label="Detractors (0-6)" value={npsD} onChange={setNpsD} small />
        <CalcBtn onClick={() => { const t = npsP + npsD; setNpsRes(t > 0 ? ((npsP - npsD) / t * 100) : 0); }} label="NPS Score" />
        {npsRes !== null && <Result value={`${npsRes.toFixed(0)} ${npsRes > 50 ? 'Excellent' : npsRes > 0 ? 'Good' : 'Needs work'}`} />}
      </Card>
      <Card title="Revenue Growth">
        <Inp label="Current (revenue)" value={rgRev} onChange={setRgRev} prefix="$" small />
        <Inp label="Previous" value={rgPrev} onChange={setRgPrev} prefix="$" small />
        <CalcBtn onClick={() => setRgRes(rgPrev > 0 ? ((rgRev - rgPrev) / rgPrev * 100) : 0)} label="Growth %" />
        {rgRes !== null && <Result value={`${rgRes >= 0 ? '+' : ''}${rgRes.toFixed(1)}%`} />}
      </Card>
      <Card title="Runway">
        <Inp label="Cash" value={rwRev} onChange={setRwRev} prefix="$" small />
        <Inp label="Monthly Burn" value={rwExp} onChange={setRwExp} prefix="$" small />
        <CalcBtn onClick={() => setRwRes(rwExp > 0 ? rwRev / rwExp : 999)} label="Months Left" />
        {rwRes !== null && <Result value={`${rwRes.toFixed(1)} months (until ${new Date(Date.now() + rwRes * 30 * 86400000).toLocaleDateString()})`} />}
      </Card>
      <Card title="LTV">
        <Inp label="ARPU" value={ltvAp} onChange={setLtvAp} prefix="$" small />
        <Inp label="Avg Months" value={ltvMonths} onChange={setLtvMonths} small />
        <CalcBtn onClick={() => setLtvRes(ltvAp * ltvMonths)} label="LTV" />
        {ltvRes !== null && <Result value={`$${ltvRes.toLocaleString()}`} />}
      </Card>
      <Card title="CAC">
        <Inp label="Sales Cost" value={cacSales} onChange={setCacSales} prefix="$" small />
        <Inp label="Marketing" value={cacMkt} onChange={setCacMkt} prefix="$" small />
        <Inp label="New Customers" value={cacCustomers} onChange={setCacCustomers} small />
        <CalcBtn onClick={() => setCacRes(cacCustomers > 0 ? (cacSales + cacMkt) / cacCustomers : 0)} label="CAC" />
        {cacRes !== null && <Result value={`$${cacRes.toLocaleString()} per customer`} />}
      </Card>
      <Card title="Rent vs Buy">
        <Inp label="Buy Price" value={rvBuyP} onChange={setRvBuyP} prefix="$" small />
        <Inp label="Monthly Rent" value={rvRent} onChange={setRvRent} prefix="$" small />
        <Inp label="Years" value={rvYrs} onChange={setRvYrs} small />
        <CalcBtn onClick={() => setRvRes(rvRent * 12 * rvYrs > rvBuyP ? `Buy (rent costs $${(rvRent * 12 * rvYrs).toLocaleString()})` : `Rent (costs $${(rvRent * 12 * rvYrs).toLocaleString()} vs buy $${rvBuyP.toLocaleString()})`)} label="Compare" />
        {rvRes && <Result value={rvRes} />}
      </Card>
      <Card title="A/B Test">
        <Inp label="Control (visitors)" value={abCtrl} onChange={setAbCtrl} small />
        <Inp label="Variant" value={abVar} onChange={setAbVar} small />
        <Inp label="Control (conv)" value={abCtrlC} onChange={setAbCtrlC} small />
        <Inp label="Variant (conv)" value={abVarC} onChange={setAbVarC} small />
        <CalcBtn onClick={() => { const cR = abCtrlC / abCtrl * 100; const vR = abVarC / abVar * 100; const lift = ((vR - cR) / cR * 100); setAbRes(`Control: ${cR.toFixed(1)}% · Variant: ${vR.toFixed(1)}% · ${lift >= 0 ? '+' : ''}${lift.toFixed(1)}% lift`); }} label="Analyze" />
        {abRes && <Result value={abRes} />}
      </Card>
      <Card title="SemVer">
        <Inp label="Version" value={0} onChange={() => {}} small />
        <input type="text" value={semVerInput} onChange={e => setSemVerInput(e.target.value)} placeholder="1.2.3"
          className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        <CalcBtn onClick={() => { const p = semVerInput.split('.').map(Number); setSemVerRes(p.length === 3 && p.every(n => !isNaN(n)) ? `Major: ${p[0]} · Minor: ${p[1]} · Patch: ${p[2]}` : 'Invalid' ); }} label="Parse" />
        {semVerRes && <Result value={semVerRes} />}
      </Card>
      <Card title="Final Grade Calculator">
        <Inp label="Score" value={gradeScore} onChange={setGradeScore} small />
        <Inp label="Total" value={gradeTotal} onChange={setGradeTotal} small />
        <CalcBtn onClick={() => { const pct = gradeScore / gradeTotal * 100; setGradeRes(`${pct.toFixed(1)}% · ${pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F'}`); }} label="Grade" />
        {gradeRes && <Result value={gradeRes} />}
      </Card>
      <Card title="College GPA Calculator">
        <input type="text" value={gpaGrades} onChange={e => setGpaGrades(e.target.value)} placeholder="A,B+,A-,B"
          className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        <CalcBtn onClick={() => { const grades = gpaGrades.split(',').map(g => g.trim().toUpperCase()); const nums = grades.map(g => GPA_MAP[g]).filter(v => v !== undefined); setGpaRes(nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0); }} label="GPA" />
        {gpaRes !== null && <Result value={`${gpaRes.toFixed(2)} / 4.0`} />}
      </Card>
      <Card title="Rule of 40">
        <Inp label="Growth %" value={rgRev} onChange={setRgRev} suffix="%" small />
        <Inp label="Profit %" value={brRev} onChange={setBrRev} suffix="%" small />
        <CalcBtn onClick={() => { const sum = rgRev / 1000000 * 100 + (brRev - brExp) / 500000 * 100; setBeRes(sum); }} label="Score" />
        {beRes !== null && <Result value={`${beRes.toFixed(0)}% ${beRes >= 40 ? '✓ Healthy' : 'Needs improvement'}`} />}
      </Card>
    </div>
  );
}
