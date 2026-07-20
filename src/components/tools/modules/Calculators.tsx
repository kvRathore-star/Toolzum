"use client";
import React, { useState } from 'react';

const inputClass = "w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none";
const labelClass = "block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1.5";
const btnClass = "w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-lg";
const cardClass = "max-w-2xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-8 rounded-2xl shadow-xl animate-in fade-in duration-500";
const headingClass = "text-2xl font-bold text-zinc-900 dark:text-white mb-6";
const resultClass = "p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-sm font-mono whitespace-pre text-indigo-600 dark:text-indigo-400";

export function MortgageCalculator() {
  const [loan, setLoan] = useState('300000');
  const [rate, setRate] = useState('6.5');
  const [years, setYears] = useState('30');
  const [result, setResult] = useState('');
  const calc = () => {
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(years) * 12;
    const p = parseFloat(loan);
    const pmt = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    setResult(`Monthly Payment: $${pmt.toFixed(2)}\nTotal Payment: $${(pmt * n).toFixed(2)}\nTotal Interest: $${(pmt * n - p).toFixed(2)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Mortgage Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Loan Amount ($)</label><input type="number" value={loan} onChange={e => setLoan(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputClass} /></div>
        <div><label className={labelClass}>Loan Term (years)</label><input type="number" value={years} onChange={e => setYears(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ArrCalculator() {
  const [subRev, setSubRev] = useState('100000');
  const [expRev, setExpRev] = useState('20000');
  const [churnRev, setChurnRev] = useState('5000');
  const [result, setResult] = useState('');
  const calc = () => {
    const arr = parseFloat(subRev) + parseFloat(expRev) - parseFloat(churnRev);
    setResult(`Annual Recurring Revenue: $${arr.toLocaleString()}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>ARR Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Subscription Revenue ($)</label><input type="number" value={subRev} onChange={e => setSubRev(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Expansion Revenue ($)</label><input type="number" value={expRev} onChange={e => setExpRev(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Churn Revenue ($)</label><input type="number" value={churnRev} onChange={e => setChurnRev(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState('10000');
  const [rate, setRate] = useState('5');
  const [n, setN] = useState('12');
  const [t, setT] = useState('10');
  const [result, setResult] = useState('');
  const calc = () => {
    const P = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const nPerYear = parseFloat(n);
    const years = parseFloat(t);
    const A = P * Math.pow(1 + r / nPerYear, nPerYear * years);
    setResult(`Final Amount: $${A.toFixed(2)}\nTotal Interest: $${(A - P).toFixed(2)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Compound Interest Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Principal ($)</label><input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Annual Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputClass} /></div>
        <div><label className={labelClass}>Compounds per Year</label><input type="number" value={n} onChange={e => setN(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Years</label><input type="number" value={t} onChange={e => setT(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function CarLoanCalculator() {
  const [loan, setLoan] = useState('35000');
  const [rate, setRate] = useState('4.5');
  const [years, setYears] = useState('5');
  const [result, setResult] = useState('');
  const calc = () => {
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(years) * 12;
    const p = parseFloat(loan);
    const pmt = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    setResult(`Monthly Payment: $${pmt.toFixed(2)}\nTotal Payment: $${(pmt * n).toFixed(2)}\nTotal Interest: $${(pmt * n - p).toFixed(2)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Car Loan Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Loan Amount ($)</label><input type="number" value={loan} onChange={e => setLoan(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputClass} /></div>
        <div><label className={labelClass}>Loan Term (years)</label><input type="number" value={years} onChange={e => setYears(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function CarLeaseCalculator() {
  const [capCost, setCapCost] = useState('30000');
  const [residual, setResidual] = useState('15000');
  const [term, setTerm] = useState('36');
  const [mf, setMf] = useState('0.00125');
  const [result, setResult] = useState('');
  const calc = () => {
    const cap = parseFloat(capCost);
    const res = parseFloat(residual);
    const t = parseFloat(term);
    const moneyFactor = parseFloat(mf);
    const monthly = (cap - res) / t + (cap + res) * moneyFactor;
    setResult(`Monthly Payment: $${monthly.toFixed(2)}\nTotal Lease Cost: $${(monthly * t).toFixed(2)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Car Lease Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Capitalized Cost ($)</label><input type="number" value={capCost} onChange={e => setCapCost(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Residual Value ($)</label><input type="number" value={residual} onChange={e => setResidual(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Lease Term (months)</label><input type="number" value={term} onChange={e => setTerm(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Money Factor</label><input type="number" value={mf} onChange={e => setMf(e.target.value)} step="0.00001" className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ChurnRateCalculator() {
  const [lost, setLost] = useState('50');
  const [total, setTotal] = useState('1000');
  const [result, setResult] = useState('');
  const calc = () => {
    const churn = (parseFloat(lost) / parseFloat(total)) * 100;
    setResult(`Churn Rate: ${churn.toFixed(2)}%`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Churn Rate Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Customers Lost</label><input type="number" value={lost} onChange={e => setLost(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Total Customers</label><input type="number" value={total} onChange={e => setTotal(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ConversionRateCalculator() {
  const [conversions, setConversions] = useState('50');
  const [visitors, setVisitors] = useState('1000');
  const [result, setResult] = useState('');
  const calc = () => {
    const cr = (parseFloat(conversions) / parseFloat(visitors)) * 100;
    setResult(`Conversion Rate: ${cr.toFixed(2)}%`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Conversion Rate Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Conversions</label><input type="number" value={conversions} onChange={e => setConversions(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Total Visitors</label><input type="number" value={visitors} onChange={e => setVisitors(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function DebtPayoffCalculator() {
  const [balance, setBalance] = useState('10000');
  const [rate, setRate] = useState('18');
  const [payment, setPayment] = useState('500');
  const [result, setResult] = useState('');
  const calc = () => {
    const b = parseFloat(balance);
    const r = parseFloat(rate) / 100 / 12;
    const p = parseFloat(payment);
    let remaining = b;
    let months = 0;
    let totalPaid = 0;
    while (remaining > 0 && months < 600) {
      const interest = remaining * r;
      const principal = Math.min(p - interest, remaining);
      remaining -= principal;
      totalPaid += p;
      months++;
    }
    setResult(`Months to Pay Off: ${months}\nTotal Paid: $${totalPaid.toFixed(2)}\nTotal Interest: $${(totalPaid - b).toFixed(2)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Debt Payoff Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Current Balance ($)</label><input type="number" value={balance} onChange={e => setBalance(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Annual Interest Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputClass} /></div>
        <div><label className={labelClass}>Monthly Payment ($)</label><input type="number" value={payment} onChange={e => setPayment(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function DiscountCalculator() {
  const [price, setPrice] = useState('100');
  const [discount, setDiscount] = useState('20');
  const [result, setResult] = useState('');
  const calc = () => {
    const p = parseFloat(price);
    const d = parseFloat(discount);
    const savings = p * d / 100;
    const finalPrice = p - savings;
    setResult(`Savings: $${savings.toFixed(2)}\nFinal Price: $${finalPrice.toFixed(2)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Discount Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Original Price ($)</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Discount (%)</label><input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function HourlyToSalaryCalculator() {
  const [hourly, setHourly] = useState('25');
  const [hoursPerWeek, setHoursPerWeek] = useState('40');
  const [result, setResult] = useState('');
  const calc = () => {
    const annual = parseFloat(hourly) * parseFloat(hoursPerWeek) * 52;
    const monthly = annual / 12;
    setResult(`Annual Salary: $${annual.toLocaleString()}\nMonthly Salary: $${monthly.toLocaleString()}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Hourly to Salary Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Hourly Rate ($)</label><input type="number" value={hourly} onChange={e => setHourly(e.target.value)} step="0.01" className={inputClass} /></div>
        <div><label className={labelClass}>Hours per Week</label><input type="number" value={hoursPerWeek} onChange={e => setHoursPerWeek(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function InflationCalculator() {
  const [present, setPresent] = useState('1000');
  const [rate, setRate] = useState('3');
  const [years, setYears] = useState('10');
  const [result, setResult] = useState('');
  const calc = () => {
    const fv = parseFloat(present) * Math.pow(1 + parseFloat(rate) / 100, parseFloat(years));
    setResult(`Future Value: $${fv.toFixed(2)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Inflation Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Present Value ($)</label><input type="number" value={present} onChange={e => setPresent(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Inflation Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputClass} /></div>
        <div><label className={labelClass}>Years</label><input type="number" value={years} onChange={e => setYears(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function LtvCalculator() {
  const [arpu, setArpu] = useState('50');
  const [churn, setChurn] = useState('5');
  const [result, setResult] = useState('');
  const calc = () => {
    const ltv = parseFloat(arpu) / (parseFloat(churn) / 100);
    setResult(`Customer Lifetime Value: $${ltv.toFixed(2)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>LTV Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>ARPU ($)</label><input type="number" value={arpu} onChange={e => setArpu(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Churn Rate (%)</label><input type="number" value={churn} onChange={e => setChurn(e.target.value)} step="0.1" className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
        <p className="text-xs text-zinc-500 mt-2">Uses ARPU ÷ Churn Rate (SaaS method). For AOV × Frequency × Lifespan (product/e-commerce method), see <a href="/calculator/ltv-calculator" className="text-blue-600 hover:underline">LTV Calculator</a>.</p>
      </div>
    </div>
  );
}

export function MrrCalculator() {
  const [customers, setCustomers] = useState('100');
  const [avgRevenue, setAvgRevenue] = useState('50');
  const [result, setResult] = useState('');
  const calc = () => {
    const mrr = parseFloat(customers) * parseFloat(avgRevenue);
    setResult(`Monthly Recurring Revenue: $${mrr.toLocaleString()}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>MRR Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Number of Customers</label><input type="number" value={customers} onChange={e => setCustomers(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Average Revenue per Customer ($)</label><input type="number" value={avgRevenue} onChange={e => setAvgRevenue(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function NetWorthCalculator() {
  const [assets, setAssets] = useState('500000');
  const [liabilities, setLiabilities] = useState('200000');
  const [result, setResult] = useState('');
  const calc = () => {
    const netWorth = parseFloat(assets) - parseFloat(liabilities);
    setResult(`Net Worth: $${netWorth.toLocaleString()}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Net Worth Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Total Assets ($)</label><input type="number" value={assets} onChange={e => setAssets(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Total Liabilities ($)</label><input type="number" value={liabilities} onChange={e => setLiabilities(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function NpsCalculator() {
  const [promoters, setPromoters] = useState('60');
  const [passives, setPassives] = useState('20');
  const [detractors, setDetractors] = useState('20');
  const [result, setResult] = useState('');
  const calc = () => {
    const total = parseFloat(promoters) + parseFloat(passives) + parseFloat(detractors);
    const pctPromoters = (parseFloat(promoters) / total) * 100;
    const pctDetractors = (parseFloat(detractors) / total) * 100;
    const nps = pctPromoters - pctDetractors;
    setResult(`NPS Score: ${nps.toFixed(1)}\nPromoters: ${pctPromoters.toFixed(1)}%\nDetractors: ${pctDetractors.toFixed(1)}%`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>NPS Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Promoters (score 9-10)</label><input type="number" value={promoters} onChange={e => setPromoters(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Passives (score 7-8)</label><input type="number" value={passives} onChange={e => setPassives(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Detractors (score 0-6)</label><input type="number" value={detractors} onChange={e => setDetractors(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function RentVsBuyCalculator() {
  const [homePrice, setHomePrice] = useState('400000');
  const [downPayment, setDownPayment] = useState('80000');
  const [mortgageRate, setMortgageRate] = useState('6.5');
  const [rent, setRent] = useState('2000');
  const [years, setYears] = useState('5');
  const [result, setResult] = useState('');
  const calc = () => {
    const hp = parseFloat(homePrice);
    const dp = parseFloat(downPayment);
    const mr = parseFloat(mortgageRate) / 100 / 12;
    const term = parseFloat(years);
    const loanAmt = hp - dp;
    const n = term * 12;
    const pmt = loanAmt * mr * Math.pow(1 + mr, n) / (Math.pow(1 + mr, n) - 1);
    const totalMortgage = pmt * n;
    const totalRent = parseFloat(rent) * 12 * term;
    const equity = hp * 0.03 * term;
    const buyCost = totalMortgage + dp;
    const buyNet = buyCost - equity;
    setResult(`Total Rent Paid: $${totalRent.toFixed(0)}\nTotal Mortgage Paid: $${totalMortgage.toFixed(0)}\nEstimated Equity: $${equity.toFixed(0)}\n\nRent Total: $${totalRent.toFixed(0)}\nBuy Net Cost: $${(buyCost - equity).toFixed(0)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Rent vs Buy Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Home Price ($)</label><input type="number" value={homePrice} onChange={e => setHomePrice(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Down Payment ($)</label><input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Mortgage Rate (%)</label><input type="number" value={mortgageRate} onChange={e => setMortgageRate(e.target.value)} step="0.01" className={inputClass} /></div>
        <div><label className={labelClass}>Monthly Rent ($)</label><input type="number" value={rent} onChange={e => setRent(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Timeframe (years)</label><input type="number" value={years} onChange={e => setYears(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState('30');
  const [retireAge, setRetireAge] = useState('65');
  const [savings, setSavings] = useState('50000');
  const [monthly, setMonthly] = useState('1000');
  const [rate, setRate] = useState('7');
  const [result, setResult] = useState('');
  const calc = () => {
    const years = parseFloat(retireAge) - parseFloat(currentAge);
    const r = parseFloat(rate) / 100 / 12;
    const n = years * 12;
    const pv = parseFloat(savings);
    const pmt = parseFloat(monthly);
    const fv = pv * Math.pow(1 + r, n) + pmt * (Math.pow(1 + r, n) - 1) / r;
    setResult(`Total at Retirement: $${fv.toLocaleString()}\nYears until Retirement: ${years}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Retirement Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Current Age</label><input type="number" value={currentAge} onChange={e => setCurrentAge(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Retirement Age</label><input type="number" value={retireAge} onChange={e => setRetireAge(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Current Savings ($)</label><input type="number" value={savings} onChange={e => setSavings(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Monthly Contribution ($)</label><input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Annual Return Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.1" className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function RevenueGrowthCalculator() {
  const [current, setCurrent] = useState('120000');
  const [previous, setPrevious] = useState('100000');
  const [result, setResult] = useState('');
  const calc = () => {
    const growth = ((parseFloat(current) - parseFloat(previous)) / parseFloat(previous)) * 100;
    setResult(`Revenue Growth Rate: ${growth.toFixed(2)}%`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Revenue Growth Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Current Period Revenue ($)</label><input type="number" value={current} onChange={e => setCurrent(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Previous Period Revenue ($)</label><input type="number" value={previous} onChange={e => setPrevious(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function RunwayCalculator() {
  const [cash, setCash] = useState('500000');
  const [burnRate, setBurnRate] = useState('50000');
  const [result, setResult] = useState('');
  const calc = () => {
    const months = parseFloat(cash) / parseFloat(burnRate);
    setResult(`Runway: ${months.toFixed(1)} months (${(months / 12).toFixed(1)} years)`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Runway Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Cash Balance ($)</label><input type="number" value={cash} onChange={e => setCash(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Monthly Burn Rate ($)</label><input type="number" value={burnRate} onChange={e => setBurnRate(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
        <p className="text-xs text-zinc-500 mt-2">For a full burn-rate analysis (gross/net burn with starting/ending cash), see <a href="/calculator/burn-rate-calculator" className="text-blue-600 hover:underline">Burn Rate & Runway Calculator</a>.</p>
      </div>
    </div>
  );
}

export function AbTestCalculator() {
  const [controlVisitors, setControlVisitors] = useState('1000');
  const [controlConversions, setControlConversions] = useState('100');
  const [variantVisitors, setVariantVisitors] = useState('1000');
  const [variantConversions, setVariantConversions] = useState('120');
  const [result, setResult] = useState('');
  const calc = () => {
    const cv = parseFloat(controlVisitors);
    const cc = parseFloat(controlConversions);
    const vv = parseFloat(variantVisitors);
    const vc = parseFloat(variantConversions);
    const cr1 = cc / cv;
    const cr2 = vc / vv;
    const pPool = (cc + vc) / (cv + vv);
    const se = Math.sqrt(pPool * (1 - pPool) * (1 / cv + 1 / vv));
    const z = (cr2 - cr1) / se;
    const pct = (cr2 - cr1) / cr1 * 100;
    setResult(`Control Rate: ${(cr1 * 100).toFixed(2)}%\nVariant Rate: ${(cr2 * 100).toFixed(2)}%\nImprovement: ${pct.toFixed(2)}%\nZ-Score: ${z.toFixed(3)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>A/B Test Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Control Visitors</label><input type="number" value={controlVisitors} onChange={e => setControlVisitors(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Control Conversions</label><input type="number" value={controlConversions} onChange={e => setControlConversions(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Variant Visitors</label><input type="number" value={variantVisitors} onChange={e => setVariantVisitors(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Variant Conversions</label><input type="number" value={variantConversions} onChange={e => setVariantConversions(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function BusinessDaysCalculator() {
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [result, setResult] = useState('');
  const calc = () => {
    let count = 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    setResult(`Business Days: ${count}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Business Days Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>End Date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function DaysBetweenDates() {
  const [date1, setDate1] = useState('2026-01-01');
  const [date2, setDate2] = useState('2026-12-31');
  const [result, setResult] = useState('');
  const calc = () => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = Math.abs(d2.getTime() - d1.getTime());
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    setResult(`Days Between: ${days}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Days Between Dates</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Date 1</label><input type="date" value={date1} onChange={e => setDate1(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Date 2</label><input type="date" value={date2} onChange={e => setDate2(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function DaysUntilCalculator() {
  const [targetDate, setTargetDate] = useState('2027-01-01');
  const [result, setResult] = useState('');
  const calc = () => {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    setResult(`Days Until: ${days}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Days Until Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Target Date</label><input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function DayOfWeekCalculator() {
  const [date, setDate] = useState('2026-12-25');
  const [result, setResult] = useState('');
  const calc = () => {
    const d = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    setResult(`Day of Week: ${days[d.getDay()]}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Day of Week Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function DayOfYearCalculator() {
  const [date, setDate] = useState('2026-07-17');
  const [result, setResult] = useState('');
  const calc = () => {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d.getTime() - start.getTime();
    const day = Math.floor(diff / (1000 * 60 * 60 * 24));
    setResult(`Day of Year: ${day}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Day of Year Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ExponentCalculator() {
  const [base, setBase] = useState('2');
  const [exp, setExp] = useState('10');
  const [result, setResult] = useState('');
  const calc = () => {
    const val = Math.pow(parseFloat(base), parseFloat(exp));
    setResult(`${base}^${exp} = ${val.toLocaleString()}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Exponent Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Base</label><input type="number" value={base} onChange={e => setBase(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Exponent</label><input type="number" value={exp} onChange={e => setExp(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function FinalGradeCalculator() {
  const [grades, setGrades] = useState('85,90,78');
  const [weights, setWeights] = useState('20,30,50');
  const [result, setResult] = useState('');
  const calc = () => {
    const g = grades.split(',').map(Number);
    const w = weights.split(',').map(Number);
    let total = 0;
    let weightSum = 0;
    for (let i = 0; i < g.length; i++) {
      total += g[i] * w[i] / 100;
      weightSum += w[i];
    }
    const final = total / (weightSum / 100);
    setResult(`Final Grade: ${final.toFixed(2)}%`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Final Grade Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Grades (comma-separated)</label><input type="text" value={grades} onChange={e => setGrades(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Weights (comma-separated, %)</label><input type="text" value={weights} onChange={e => setWeights(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function GpaCalculator() {
  const [grades, setGrades] = useState('A,B+,A-');
  const [credits, setCredits] = useState('3,4,3');
  const [result, setResult] = useState('');
  const gradePoints: Record<string, number> = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0 };
  const calc = () => {
    const g = grades.split(',').map(g => g.trim().toUpperCase());
    const c = credits.split(',').map(Number);
    let totalPoints = 0;
    let totalCredits = 0;
    for (let i = 0; i < g.length; i++) {
      const gp = gradePoints[g[i]] || 0;
      totalPoints += gp * c[i];
      totalCredits += c[i];
    }
    const gpa = totalPoints / totalCredits;
    setResult(`GPA: ${gpa.toFixed(2)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>GPA Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Grades (comma-separated, e.g., A,B+,A-)</label><input type="text" value={grades} onChange={e => setGrades(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Credits (comma-separated)</label><input type="text" value={credits} onChange={e => setCredits(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function GradeCalculator() {
  const [percentage, setPercentage] = useState('85');
  const [result, setResult] = useState('');
  const calc = () => {
    const p = parseFloat(percentage);
    let letter = 'F';
    if (p >= 93) letter = 'A';
    else if (p >= 90) letter = 'A-';
    else if (p >= 87) letter = 'B+';
    else if (p >= 83) letter = 'B';
    else if (p >= 80) letter = 'B-';
    else if (p >= 77) letter = 'C+';
    else if (p >= 73) letter = 'C';
    else if (p >= 70) letter = 'C-';
    else if (p >= 67) letter = 'D+';
    else if (p >= 60) letter = 'D';
    setResult(`Letter Grade: ${letter}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Grade Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Percentage (%)</label><input type="number" value={percentage} onChange={e => setPercentage(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function CollegeGpaCalculator() {
  const [semGrades, setSemGrades] = useState('A,B+,A-');
  const [semCredits, setSemCredits] = useState('3,4,3');
  const [prevGpa, setPrevGpa] = useState('3.5');
  const [prevCredits, setPrevCredits] = useState('30');
  const [result, setResult] = useState('');
  const gradePoints: Record<string, number> = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0 };
  const calc = () => {
    const g = semGrades.split(',').map(g => g.trim().toUpperCase());
    const c = semCredits.split(',').map(Number);
    let totalPoints = 0;
    let totalCredits = 0;
    for (let i = 0; i < g.length; i++) {
      totalPoints += (gradePoints[g[i]] || 0) * c[i];
      totalCredits += c[i];
    }
    const semGpa = totalPoints / totalCredits;
    const cumPoints = parseFloat(prevGpa) * parseFloat(prevCredits) + totalPoints;
    const cumCredits = parseFloat(prevCredits) + totalCredits;
    const cumGpa = cumPoints / cumCredits;
    setResult(`Semester GPA: ${semGpa.toFixed(2)}\nCumulative GPA: ${cumGpa.toFixed(2)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>College GPA Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Semester Grades (e.g., A,B+,A-)</label><input type="text" value={semGrades} onChange={e => setSemGrades(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Semester Credits</label><input type="text" value={semCredits} onChange={e => setSemCredits(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Previous GPA</label><input type="number" value={prevGpa} onChange={e => setPrevGpa(e.target.value)} step="0.01" className={inputClass} /></div>
        <div><label className={labelClass}>Previous Total Credits</label><input type="number" value={prevCredits} onChange={e => setPrevCredits(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function LeapYearCalculator() {
  const [year, setYear] = useState('2026');
  const [result, setResult] = useState('');
  const calc = () => {
    const y = parseInt(year);
    const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    setResult(`${y} is ${isLeap ? '' : 'not '}a leap year`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Leap Year Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Year</label><input type="number" value={year} onChange={e => setYear(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ProbabilityCalculator() {
  const [favorable, setFavorable] = useState('3');
  const [total, setTotal] = useState('10');
  const [result, setResult] = useState('');
  const calc = () => {
    const prob = parseFloat(favorable) / parseFloat(total);
    setResult(`Probability: ${(prob * 100).toFixed(2)}%\nOdds: ${favorable}:${parseFloat(total) - parseFloat(favorable)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Probability Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Favorable Outcomes</label><input type="number" value={favorable} onChange={e => setFavorable(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Total Possible Outcomes</label><input type="number" value={total} onChange={e => setTotal(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ProportionCalculator() {
  const [a, setA] = useState('2');
  const [b, setB] = useState('5');
  const [c, setC] = useState('8');
  const [result, setResult] = useState('');
  const calc = () => {
    const d = (parseFloat(b) * parseFloat(c)) / parseFloat(a);
    setResult(`${a} : ${b} = ${c} : ${d.toFixed(4)}\nMissing value (D) = ${d.toFixed(4)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Proportion Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>A (first ratio)</label><input type="number" value={a} onChange={e => setA(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>B (first ratio)</label><input type="number" value={b} onChange={e => setB(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>C (second ratio, solve for D)</label><input type="number" value={c} onChange={e => setC(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function RatioCalculator() {
  const [num1, setNum1] = useState('12');
  const [num2, setNum2] = useState('8');
  const [result, setResult] = useState('');
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const calc = () => {
    const n1 = parseInt(num1);
    const n2 = parseInt(num2);
    const g = gcd(n1, n2);
    setResult(`Simplified Ratio: ${n1 / g} : ${n2 / g}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Ratio Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>First Number</label><input type="number" value={num1} onChange={e => setNum1(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Second Number</label><input type="number" value={num2} onChange={e => setNum2(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function AspectRatioCalculator() {
  const [width, setWidth] = useState('1920');
  const [height, setHeight] = useState('1080');
  const [result, setResult] = useState('');
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const calc = () => {
    const w = parseInt(width);
    const h = parseInt(height);
    const g = gcd(w, h);
    setResult(`Aspect Ratio: ${w / g}:${h / g}\n(${w} × ${h})`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Aspect Ratio Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Width (px)</label><input type="number" value={width} onChange={e => setWidth(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Height (px)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function CircleCalculator() {
  const [radius, setRadius] = useState('5');
  const [result, setResult] = useState('');
  const calc = () => {
    const r = parseFloat(radius);
    const area = Math.PI * r * r;
    const circumference = 2 * Math.PI * r;
    setResult(`Area: ${area.toFixed(4)}\nCircumference: ${circumference.toFixed(4)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Circle Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Radius</label><input type="number" value={radius} onChange={e => setRadius(e.target.value)} step="0.1" className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function DpiCalculator() {
  const [pixels, setPixels] = useState('1920');
  const [inches, setInches] = useState('13.3');
  const [result, setResult] = useState('');
  const calc = () => {
    const dpi = parseFloat(pixels) / parseFloat(inches);
    setResult(`DPI: ${dpi.toFixed(2)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>DPI Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Pixels</label><input type="number" value={pixels} onChange={e => setPixels(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Inches</label><input type="number" value={inches} onChange={e => setInches(e.target.value)} step="0.1" className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function FractionCalculator() {
  const [frac1, setFrac1] = useState('1/2');
  const [frac2, setFrac2] = useState('1/3');
  const [op, setOp] = useState('+');
  const [result, setResult] = useState('');
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const calc = () => {
    const [n1, d1] = frac1.split('/').map(Number);
    const [n2, d2] = frac2.split('/').map(Number);
    let n, d;
    switch (op) {
      case '+': n = n1 * d2 + n2 * d1; d = d1 * d2; break;
      case '-': n = n1 * d2 - n2 * d1; d = d1 * d2; break;
      case '*': n = n1 * n2; d = d1 * d2; break;
      case '/': n = n1 * d2; d = d1 * n2; break;
      default: n = 0; d = 1;
    }
    const g = gcd(Math.abs(n), Math.abs(d));
    n /= g; d /= g;
    setResult(`${frac1} ${op} ${frac2} = ${n}/${d}${d === 1 ? ` = ${n}` : ''}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Fraction Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Fraction 1 (e.g., 1/2)</label><input type="text" value={frac1} onChange={e => setFrac1(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Operation</label><select value={op} onChange={e => setOp(e.target.value)} className={inputClass}>
          <option value="+">+</option><option value="-">-</option><option value="*">×</option><option value="/">÷</option>
        </select></div>
        <div><label className={labelClass}>Fraction 2 (e.g., 1/3)</label><input type="text" value={frac2} onChange={e => setFrac2(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function MeanMedianModeCalculator() {
  const [numbers, setNumbers] = useState('2,4,4,6,8');
  const [result, setResult] = useState('');
  const calc = () => {
    const nums = numbers.split(',').map(Number).sort((a, b) => a - b);
    const mean = nums.reduce((s, v) => s + v, 0) / nums.length;
    const mid = Math.floor(nums.length / 2);
    const median = nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
    const freq: Record<number, number> = {};
    nums.forEach(v => freq[v] = (freq[v] || 0) + 1);
    let mode = nums[0];
    let maxFreq = 1;
    Object.entries(freq).forEach(([k, v]) => { if (v > maxFreq) { maxFreq = v; mode = Number(k); } });
    setResult(`Mean: ${mean.toFixed(2)}\nMedian: ${median}\nMode: ${mode}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Mean Median Mode Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Numbers (comma-separated)</label><input type="text" value={numbers} onChange={e => setNumbers(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function PpiCalculator() {
  const [diagPixels, setDiagPixels] = useState('2200');
  const [diagInches, setDiagInches] = useState('6.1');
  const [result, setResult] = useState('');
  const calc = () => {
    const ppi = parseFloat(diagPixels) / parseFloat(diagInches);
    setResult(`PPI: ${ppi.toFixed(2)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>PPI Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Diagonal Pixels</label><input type="number" value={diagPixels} onChange={e => setDiagPixels(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Diagonal Inches</label><input type="number" value={diagInches} onChange={e => setDiagInches(e.target.value)} step="0.1" className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function PythagoreanTheoremCalculator() {
  const [a, setA] = useState('3');
  const [b, setB] = useState('4');
  const [result, setResult] = useState('');
  const calc = () => {
    const c = Math.sqrt(Math.pow(parseFloat(a), 2) + Math.pow(parseFloat(b), 2));
    setResult(`c = ${c.toFixed(4)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Pythagorean Theorem Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Side a</label><input type="number" value={a} onChange={e => setA(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Side b</label><input type="number" value={b} onChange={e => setB(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function QuadraticEquationSolver() {
  const [a, setA] = useState('1');
  const [b, setB] = useState('-3');
  const [c, setC] = useState('2');
  const [result, setResult] = useState('');
  const calc = () => {
    const A = parseFloat(a);
    const B = parseFloat(b);
    const C = parseFloat(c);
    const disc = B * B - 4 * A * C;
    if (disc < 0) {
      const real = (-B / (2 * A)).toFixed(4);
      const imag = (Math.sqrt(-disc) / (2 * A)).toFixed(4);
      setResult(`x = ${real} ± ${imag}i`);
    } else {
      const x1 = (-B + Math.sqrt(disc)) / (2 * A);
      const x2 = (-B - Math.sqrt(disc)) / (2 * A);
      setResult(`x₁ = ${x1.toFixed(4)}\nx₂ = ${x2.toFixed(4)}`);
    }
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Quadratic Equation Solver</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>a (ax² + bx + c = 0)</label><input type="number" value={a} onChange={e => setA(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>b</label><input type="number" value={b} onChange={e => setB(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>c</label><input type="number" value={c} onChange={e => setC(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function RectangleAreaCalculator() {
  const [length, setLength] = useState('10');
  const [width, setWidth] = useState('5');
  const [result, setResult] = useState('');
  const calc = () => {
    const area = parseFloat(length) * parseFloat(width);
    const perimeter = 2 * (parseFloat(length) + parseFloat(width));
    setResult(`Area: ${area}\nPerimeter: ${perimeter}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Rectangle Area Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Length</label><input type="number" value={length} onChange={e => setLength(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Width</label><input type="number" value={width} onChange={e => setWidth(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function SquareRootCalculator() {
  const [number, setNumber] = useState('144');
  const [result, setResult] = useState('');
  const calc = () => {
    const sqrt = Math.sqrt(parseFloat(number));
    setResult(`√${number} = ${sqrt.toFixed(6)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Square Root Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Number</label><input type="number" value={number} onChange={e => setNumber(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

function evalScientific(input: string): number {
  let pos = 0;
  const s = input.replace(/\s+/g, '').toLowerCase()
    .replace(/π/g, String(Math.PI))
    .replace(/pi/g, String(Math.PI))
    .replace(/\be\b(?![xp])/g, String(Math.E));

  const funcs: Record<string, (x: number) => number> = {
    sin: x => Math.sin(x * Math.PI / 180),
    cos: x => Math.cos(x * Math.PI / 180),
    tan: x => Math.tan(x * Math.PI / 180),
    asin: x => Math.asin(x) * 180 / Math.PI,
    acos: x => Math.acos(x) * 180 / Math.PI,
    atan: x => Math.atan(x) * 180 / Math.PI,
    sqrt: x => Math.sqrt(x),
    log: x => Math.log10(x),
    ln: x => Math.log(x),
    abs: x => Math.abs(x),
    ceil: x => Math.ceil(x),
    floor: x => Math.floor(x),
    round: x => Math.round(x),
  };

  function parseExpr(): number {
    let val = parseTerm();
    while (pos < s.length && (s[pos] === '+' || s[pos] === '-')) {
      const op = s[pos++];
      const right = parseTerm();
      val = op === '+' ? val + right : val - right;
    }
    return val;
  }

  function parseTerm(): number {
    let val = parseUnary();
    while (pos < s.length && (s[pos] === '*' || s[pos] === '/')) {
      const op = s[pos++];
      const right = parseUnary();
      val = op === '*' ? val * right : val / right;
    }
    return val;
  }

  function parseUnary(): number {
    if (pos < s.length && s[pos] === '-') {
      pos++;
      return -parseAtom();
    }
    if (pos < s.length && s[pos] === '+') {
      pos++;
    }
    return parseAtom();
  }

  function parseAtom(): number {
    if (pos < s.length && s[pos] === '(') {
      pos++;
      const val = parseExpr();
      if (pos < s.length && s[pos] === ')') pos++;
      return val;
    }
    for (const [name, fn] of Object.entries(funcs)) {
      if (s.startsWith(name + '(', pos)) {
        pos += name.length;
        if (pos < s.length && s[pos] === '(') pos++;
        const arg = parseExpr();
        if (pos < s.length && s[pos] === ')') pos++;
        return fn(arg);
      }
    }
    let numStr = '';
    while (pos < s.length && (/[0-9.]/).test(s[pos])) {
      numStr += s[pos++];
    }
    return parseFloat(numStr);
  }

  const result = parseExpr();
  if (pos !== s.length) throw new Error('Unexpected character');
  return result;
}

export function ScientificCalculator() {
  const [expr, setExpr] = useState('sin(30) + cos(60)');
  const [result, setResult] = useState('');
  const calc = () => {
    try {
      const val = evalScientific(expr);
      setResult(`Result: ${val}`);
    } catch {
      setResult('Error: Invalid expression');
    }
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Scientific Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Expression (e.g., sin(30) + cos(60))</label><input type="text" value={expr} onChange={e => setExpr(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function FluidTypographyCalculator() {
  const [minVw, setMinVw] = useState('320');
  const [maxVw, setMaxVw] = useState('1200');
  const [minSize, setMinSize] = useState('16');
  const [maxSize, setMaxSize] = useState('24');
  const [result, setResult] = useState('');
  const calc = () => {
    const slope = (parseFloat(maxSize) - parseFloat(minSize)) / (parseFloat(maxVw) - parseFloat(minVw));
    const intercept = parseFloat(minSize) - slope * parseFloat(minVw);
    const clamp = `clamp(${minSize}px, ${(slope * 100).toFixed(4)}vw + ${intercept.toFixed(4)}px, ${maxSize}px)`;
    setResult(`CSS clamp() value:\n${clamp}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Fluid Typography Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Min Viewport (px)</label><input type="number" value={minVw} onChange={e => setMinVw(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Max Viewport (px)</label><input type="number" value={maxVw} onChange={e => setMaxVw(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Min Font Size (px)</label><input type="number" value={minSize} onChange={e => setMinSize(e.target.value)} step="0.1" className={inputClass} /></div>
        <div><label className={labelClass}>Max Font Size (px)</label><input type="number" value={maxSize} onChange={e => setMaxSize(e.target.value)} step="0.1" className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function BmiCalculatorForKids() {
  const [weight, setWeight] = useState('30');
  const [height, setHeight] = useState('130');
  const [age, setAge] = useState('10');
  const [gender, setGender] = useState('male');
  const [result, setResult] = useState('');
  const calc = () => {
    const bmi = parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2);
    const percentiles: Record<string, { underweight: number; normal: number }> = {
      male: { underweight: 5, normal: 85 },
      female: { underweight: 5, normal: 85 },
    };
    const p = percentiles[gender] || percentiles.male;
    let category = 'Normal weight';
    if (bmi < p.underweight) category = 'Underweight';
    else if (bmi > 95) category = 'Obese';
    else if (bmi > p.normal) category = 'Overweight';
    setResult(`BMI: ${bmi.toFixed(1)}\nAge: ${age}\nCategory: ${category}\nNote: BMI percentiles vary by age. Consult a pediatrician.`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>BMI Calculator for Kids</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} step="0.1" className={inputClass} /></div>
        <div><label className={labelClass}>Height (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Age (years)</label><input type="number" value={age} onChange={e => setAge(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Gender</label><select value={gender} onChange={e => setGender(e.target.value)} className={inputClass}>
          <option value="male">Male</option><option value="female">Female</option>
        </select></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function BodyFatPercentageCalculator() {
  const [gender, setGender] = useState('male');
  const [waist, setWaist] = useState('32');
  const [neck, setNeck] = useState('15');
  const [height, setHeight] = useState('70');
  const [hip, setHip] = useState('36');
  const [result, setResult] = useState('');
  const calc = () => {
    let bf: number;
    if (gender === 'male') {
      bf = 495 / (1.0324 - 0.19077 * Math.log10(parseFloat(waist) - parseFloat(neck)) + 0.15456 * Math.log10(parseFloat(height))) - 450;
    } else {
      bf = 495 / (1.29579 - 0.35004 * Math.log10(parseFloat(waist) + parseFloat(hip) - parseFloat(neck)) + 0.22100 * Math.log10(parseFloat(height))) - 450;
    }
    setResult(`Body Fat: ${bf.toFixed(1)}%`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Body Fat Percentage Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Gender</label><select value={gender} onChange={e => setGender(e.target.value)} className={inputClass}>
          <option value="male">Male</option><option value="female">Female</option>
        </select></div>
        <div><label className={labelClass}>Waist (inches)</label><input type="number" value={waist} onChange={e => setWaist(e.target.value)} step="0.1" className={inputClass} /></div>
        <div><label className={labelClass}>Neck (inches)</label><input type="number" value={neck} onChange={e => setNeck(e.target.value)} step="0.1" className={inputClass} /></div>
        <div><label className={labelClass}>Height (inches)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} step="0.1" className={inputClass} /></div>
        {gender === 'female' && <div><label className={labelClass}>Hip (inches)</label><input type="number" value={hip} onChange={e => setHip(e.target.value)} step="0.1" className={inputClass} /></div>}
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function BodySurfaceAreaCalculator() {
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [result, setResult] = useState('');
  const calc = () => {
    const bsa = Math.sqrt(parseFloat(weight) * parseFloat(height) / 3600);
    setResult(`BSA: ${bsa.toFixed(2)} m²`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Body Surface Area Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} step="0.1" className={inputClass} /></div>
        <div><label className={labelClass}>Height (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function BabyFormulaCalculator() {
  const [weight, setWeight] = useState('5');
  const [ageMonths, setAgeMonths] = useState('3');
  const [result, setResult] = useState('');
  const calc = () => {
    const dailyOz = parseFloat(weight) * 2.5;
    const perFeed = dailyOz / Math.max(6, 8 - Math.floor(parseFloat(ageMonths) / 2));
    setResult(`Daily Formula: ${dailyOz.toFixed(1)} oz (${(dailyOz * 29.5735).toFixed(0)} ml)\nPer Feeding: ~${perFeed.toFixed(1)} oz (${(perFeed * 29.5735).toFixed(0)} ml)`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Baby Formula Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} step="0.1" className={inputClass} /></div>
        <div><label className={labelClass}>Age (months)</label><input type="number" value={ageMonths} onChange={e => setAgeMonths(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function BabyGrowthPercentileCalculator() {
  const [weight, setWeight] = useState('10');
  const [height, setHeight] = useState('85');
  const [age, setAge] = useState('2');
  const [result, setResult] = useState('');
  const calc = () => {
    const bmi = parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2);
    const avgBmi = 16 + parseFloat(age) * 0.5;
    const percentile = Math.min(99, Math.max(1, 50 + (bmi - avgBmi) * 10));
    setResult(`Weight: ${weight} kg\nHeight: ${height} cm\nBMI: ${bmi.toFixed(1)}\nEst. Percentile: ${Math.round(percentile)}th\n(Consult pediatrician for accurate WHO chart data)`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Baby Growth Percentile Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} step="0.1" className={inputClass} /></div>
        <div><label className={labelClass}>Height (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Age (years)</label><input type="number" value={age} onChange={e => setAge(e.target.value)} step="0.5" className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function BabySleepScheduleCalculator() {
  const [ageMonths, setAgeMonths] = useState('6');
  const [result, setResult] = useState('');
  const calc = () => {
    const age = parseFloat(ageMonths);
    let totalSleep = 14;
    let naps = 2;
    if (age <= 1) { totalSleep = 16; naps = 4; }
    else if (age <= 4) { totalSleep = 15; naps = 3; }
    else if (age <= 8) { totalSleep = 14; naps = 2; }
    else if (age <= 12) { totalSleep = 13.5; naps = 2; }
    else if (age <= 24) { totalSleep = 13; naps = 1; }
    else { totalSleep = 12; naps = 1; }
    setResult(`Recommended Total Sleep: ${totalSleep} hours/day\nRecommended Naps: ${naps} nap(s)/day\nNight Sleep: ~${(totalSleep - naps * 1.5).toFixed(1)} hours`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Baby Sleep Schedule Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Age (months)</label><input type="number" value={ageMonths} onChange={e => setAgeMonths(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function BreastfeedingCalorieCalculator() {
  const [months, setMonths] = useState('3');
  const [feedings, setFeedings] = useState('8');
  const [result, setResult] = useState('');
  const calc = () => {
    const age = parseFloat(months);
    const feeds = parseFloat(feedings);
    const calPerMl = 0.67;
    const mlPerFeed = age <= 1 ? 60 : age <= 3 ? 90 : age <= 6 ? 120 : 150;
    const dailyCal = mlPerFeed * feeds * calPerMl;
    setResult(`Daily Calories Burned: ~${dailyCal.toFixed(0)} kcal\nPer Feeding: ~${(mlPerFeed * calPerMl).toFixed(0)} kcal`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Breastfeeding Calorie Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Baby's Age (months)</label><input type="number" value={months} onChange={e => setMonths(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Feedings per Day</label><input type="number" value={feedings} onChange={e => setFeedings(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function CalorieCalculator() {
  const [gender, setGender] = useState('male');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [age, setAge] = useState('30');
  const [activity, setActivity] = useState('1.55');
  const [result, setResult] = useState('');
  const calc = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    let bmr = gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    const tdee = bmr * parseFloat(activity);
    setResult(`BMR: ${bmr.toFixed(0)} kcal/day\nTDEE: ${tdee.toFixed(0)} kcal/day`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Calorie Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Gender</label><select value={gender} onChange={e => setGender(e.target.value)} className={inputClass}>
          <option value="male">Male</option><option value="female">Female</option>
        </select></div>
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Height (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Age</label><input type="number" value={age} onChange={e => setAge(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Activity Level</label><select value={activity} onChange={e => setActivity(e.target.value)} className={inputClass}>
          <option value="1.2">Sedentary</option><option value="1.375">Light</option><option value="1.55">Moderate</option><option value="1.725">Active</option><option value="1.9">Very Active</option>
        </select></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ChildHeightPredictor() {
  const [motherH, setMotherH] = useState('165');
  const [fatherH, setFatherH] = useState('180');
  const [childGender, setChildGender] = useState('male');
  const [result, setResult] = useState('');
  const calc = () => {
    const mh = parseFloat(motherH);
    const fh = parseFloat(fatherH);
    let height = childGender === 'male' ? ((mh + fh + 13) / 2) : ((mh + fh - 13) / 2);
    setResult(`Predicted Adult Height: ${height.toFixed(1)} cm (${(height / 2.54).toFixed(1)} inches)`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Child Height Predictor</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Mother's Height (cm)</label><input type="number" value={motherH} onChange={e => setMotherH(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Father's Height (cm)</label><input type="number" value={fatherH} onChange={e => setFatherH(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Child's Gender</label><select value={childGender} onChange={e => setChildGender(e.target.value)} className={inputClass}>
          <option value="male">Male</option><option value="female">Female</option>
        </select></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function CyclingCalorieCalculator() {
  const [weight, setWeight] = useState('70');
  const [duration, setDuration] = useState('60');
  const [speed, setSpeed] = useState('20');
  const [result, setResult] = useState('');
  const calc = () => {
    const met = parseFloat(speed) <= 15 ? 6 : parseFloat(speed) <= 20 ? 8 : parseFloat(speed) <= 25 ? 10 : 12;
    const cal = met * parseFloat(weight) * (parseFloat(duration) / 60);
    setResult(`Calories Burned: ~${cal.toFixed(0)} kcal`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Cycling Calorie Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Duration (minutes)</label><input type="number" value={duration} onChange={e => setDuration(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Speed (km/h)</label><input type="number" value={speed} onChange={e => setSpeed(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function HeartRateZoneCalculator() {
  const [age, setAge] = useState('30');
  const [restingHR, setRestingHR] = useState('70');
  const [result, setResult] = useState('');
  const calc = () => {
    const a = parseFloat(age);
    const maxHR = 220 - a;
    const hrr = maxHR - parseFloat(restingHR);
    const zones = [
      { name: 'Zone 1 (Very Light)', min: 50, max: 60 },
      { name: 'Zone 2 (Light)', min: 60, max: 70 },
      { name: 'Zone 3 (Moderate)', min: 70, max: 80 },
      { name: 'Zone 4 (Hard)', min: 80, max: 90 },
      { name: 'Zone 5 (Maximum)', min: 90, max: 100 },
    ];
    const lines = zones.map(z => {
      const low = Math.round(hrr * z.min / 100 + parseFloat(restingHR));
      const high = Math.round(hrr * z.max / 100 + parseFloat(restingHR));
      return `${z.name}: ${low}-${high} bpm`;
    });
    setResult(`Max HR: ${maxHR} bpm\n\n${lines.join('\n')}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Heart Rate Zone Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Age</label><input type="number" value={age} onChange={e => setAge(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Resting Heart Rate (bpm)</label><input type="number" value={restingHR} onChange={e => setRestingHR(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
        <p className="text-xs text-zinc-500 mt-2">Uses the Karvonen method (resting HR + HR reserve). For a simpler %-of-max calculation, see <a href="/health/heart-rate-calculator" className="text-blue-600 hover:underline">Target Heart Rate Zones</a>.</p>
      </div>
    </div>
  );
}

export function IdealWeightCalculator() {
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('175');
  const [result, setResult] = useState('');
  const calc = () => {
    const h = parseFloat(height);
    const hInches = h / 2.54;
    let minWeight, maxWeight: number;
    if (gender === 'male') {
      const base = 50 + 2.3 * ((hInches - 60) / 1);
      minWeight = base - base * 0.1;
      maxWeight = base + base * 0.1;
    } else {
      const base = 45.5 + 2.3 * ((hInches - 60) / 1);
      minWeight = base - base * 0.1;
      maxWeight = base + base * 0.1;
    }
    setResult(`Ideal Weight Range:\n${minWeight.toFixed(1)} - ${maxWeight.toFixed(1)} kg\n(${(minWeight * 2.205).toFixed(1)} - ${(maxWeight * 2.205).toFixed(1)} lbs)`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Ideal Weight Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Gender</label><select value={gender} onChange={e => setGender(e.target.value)} className={inputClass}>
          <option value="male">Male</option><option value="female">Female</option>
        </select></div>
        <div><label className={labelClass}>Height (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function KetoCalculator() {
  const [weight, setWeight] = useState('70');
  const [calories, setCalories] = useState('2000');
  const [result, setResult] = useState('');
  const calc = () => {
    const cal = parseFloat(calories);
    const protein = parseFloat(weight) * 1.6;
    const fat = (cal - protein * 4) * 0.75 / 9;
    const carbs = (cal - protein * 4) * 0.05 / 4;
    setResult(`Protein: ${protein.toFixed(0)}g (${(protein * 4).toFixed(0)} kcal)\nFat: ${fat.toFixed(0)}g (${(fat * 9).toFixed(0)} kcal)\nCarbs: ${carbs.toFixed(0)}g (${(carbs * 4).toFixed(0)} kcal)`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Keto Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Daily Calories</label><input type="number" value={calories} onChange={e => setCalories(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function LeanBodyMassCalculator() {
  const [weight, setWeight] = useState('70');
  const [bf, setBf] = useState('15');
  const [result, setResult] = useState('');
  const calc = () => {
    const lbm = parseFloat(weight) * (1 - parseFloat(bf) / 100);
    const fatMass = parseFloat(weight) - lbm;
    setResult(`Lean Body Mass: ${lbm.toFixed(1)} kg\nFat Mass: ${fatMass.toFixed(1)} kg`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Lean Body Mass Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Body Fat (%)</label><input type="number" value={bf} onChange={e => setBf(e.target.value)} step="0.1" className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function MacroCalculator() {
  const [gender, setGender] = useState('male');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('175');
  const [age, setAge] = useState('30');
  const [goal, setGoal] = useState('maintain');
  const [result, setResult] = useState('');
  const calc = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    let bmr = gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    const tdee = bmr * 1.55;
    let cal = tdee;
    if (goal === 'lose') cal = tdee - 500;
    else if (goal === 'gain') cal = tdee + 300;
    const protein = w * 2;
    const fat = cal * 0.25 / 9;
    const carbs = (cal - protein * 4 - fat * 9) / 4;
    setResult(`Daily Calories: ${Math.round(cal)} kcal\nProtein: ${Math.round(protein)}g (${Math.round(protein * 4)} kcal)\nFat: ${Math.round(fat)}g (${Math.round(fat * 9)} kcal)\nCarbs: ${Math.round(carbs)}g (${Math.round(carbs * 4)} kcal)`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Macro Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Gender</label><select value={gender} onChange={e => setGender(e.target.value)} className={inputClass}>
          <option value="male">Male</option><option value="female">Female</option>
        </select></div>
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Height (cm)</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Age</label><input type="number" value={age} onChange={e => setAge(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Goal</label><select value={goal} onChange={e => setGoal(e.target.value)} className={inputClass}>
          <option value="lose">Lose Weight</option><option value="maintain">Maintain</option><option value="gain">Gain Muscle</option>
        </select></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function OvulationCalculator() {
  const [lmp, setLmp] = useState('2026-07-01');
  const [cycleLength, setCycleLength] = useState('28');
  const [result, setResult] = useState('');
  const calc = () => {
    const lmpDate = new Date(lmp);
    const cycle = parseFloat(cycleLength);
    const ovulation = new Date(lmpDate);
    ovulation.setDate(ovulation.getDate() + cycle - 14);
    const fertileStart = new Date(ovulation);
    fertileStart.setDate(fertileStart.getDate() - 5);
    const fertileEnd = new Date(ovulation);
    fertileEnd.setDate(fertileEnd.getDate() + 1);
    const nextPeriod = new Date(lmpDate);
    nextPeriod.setDate(nextPeriod.getDate() + cycle);
    setResult(`Ovulation Date: ${ovulation.toLocaleDateString()}\nFertile Window: ${fertileStart.toLocaleDateString()} - ${fertileEnd.toLocaleDateString()}\nNext Period: ${nextPeriod.toLocaleDateString()}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Ovulation Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>First Day of Last Period</label><input type="date" value={lmp} onChange={e => setLmp(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Cycle Length (days)</label><input type="number" value={cycleLength} onChange={e => setCycleLength(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function PregnancyDueDateCalculator() {
  const [lmp, setLmp] = useState('2026-01-15');
  const [result, setResult] = useState('');
  const calc = () => {
    const lmpDate = new Date(lmp);
    const due = new Date(lmpDate);
    due.setDate(due.getDate() + 280);
    const weeks = Math.floor(40);
    const trimester1 = new Date(lmpDate);
    trimester1.setDate(trimester1.getDate() + 84);
    const trimester2 = new Date(lmpDate);
    trimester2.setDate(trimester2.getDate() + 196);
    setResult(`Due Date: ${due.toLocaleDateString()}\nTrimester 1 ends: ${trimester1.toLocaleDateString()}\nTrimester 2 ends: ${trimester2.toLocaleDateString()}\nCurrent gestation: varies`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Pregnancy Due Date Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>First Day of Last Period</label><input type="date" value={lmp} onChange={e => setLmp(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function ProteinCalculator() {
  const [weight, setWeight] = useState('70');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [result, setResult] = useState('');
  const calc = () => {
    const w = parseFloat(weight);
    const factors: Record<string, number> = { sedentary: 0.8, moderate: 1.4, active: 1.8, athlete: 2.2 };
    const protein = w * (factors[activityLevel] || 1.4);
    setResult(`Daily Protein: ${protein.toFixed(0)}g (${(protein * 4).toFixed(0)} kcal)`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Protein Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Activity Level</label><select value={activityLevel} onChange={e => setActivityLevel(e.target.value)} className={inputClass}>
          <option value="sedentary">Sedentary</option><option value="moderate">Moderate</option><option value="active">Active</option><option value="athlete">Athlete</option>
        </select></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function RunningPaceCalculator() {
  const [distance, setDistance] = useState('10');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('50');
  const [seconds, setSeconds] = useState('0');
  const [result, setResult] = useState('');
  const calc = () => {
    const totalMin = parseFloat(hours) * 60 + parseFloat(minutes) + parseFloat(seconds) / 60;
    const pace = totalMin / parseFloat(distance);
    const paceMin = Math.floor(pace);
    const paceSec = Math.round((pace - paceMin) * 60);
    const speed = parseFloat(distance) / (totalMin / 60);
    setResult(`Pace: ${paceMin}:${paceSec.toString().padStart(2, '0')} /km\nSpeed: ${speed.toFixed(2)} km/h`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Running Pace Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Distance (km)</label><input type="number" value={distance} onChange={e => setDistance(e.target.value)} step="0.1" className={inputClass} /></div>
        <div><label className={labelClass}>Hours</label><input type="number" value={hours} onChange={e => setHours(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Minutes</label><input type="number" value={minutes} onChange={e => setMinutes(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Seconds</label><input type="number" value={seconds} onChange={e => setSeconds(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function SleepCalculator() {
  const [wakeTime, setWakeTime] = useState('07:00');
  const [result, setResult] = useState('');
  const calc = () => {
    const [h, m] = wakeTime.split(':').map(Number);
    const wakeMinutes = h * 60 + m;
    const cycles = [5, 6, 7.5, 9].map(hours => {
      const bedMin = wakeMinutes - hours * 60;
      const bedH = Math.floor(((bedMin % 1440) + 1440) % 1440 / 60);
      const bedM = Math.round(((bedMin % 1440) + 1440) % 1440 % 60);
      return `${Math.floor(bedH).toString().padStart(2, '0')}:${Math.floor(bedM).toString().padStart(2, '0')} (${hours} hours, ${hours / 1.5} cycles)`;
    });
    setResult(`If waking at ${wakeTime}, try sleeping at:\n${cycles.join('\n')}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Sleep Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Wake Time</label><input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function StepsToCaloriesCalculator() {
  const [steps, setSteps] = useState('10000');
  const [weight, setWeight] = useState('70');
  const [result, setResult] = useState('');
  const calc = () => {
    const km = parseFloat(steps) * 0.762 / 1000;
    const calPerKgPerKm = 0.65;
    const cal = calPerKgPerKm * parseFloat(weight) * km;
    setResult(`Calories Burned: ~${Math.round(cal)} kcal\nDistance: ~${km.toFixed(2)} km`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Steps to Calories Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Steps</label><input type="number" value={steps} onChange={e => setSteps(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
        <p className="text-xs text-zinc-500 mt-2">Uses weight-based formula (avg stride 76.2 cm). For a height-based stride estimate, see <a href="/health/steps-calculator" className="text-blue-600 hover:underline">Steps to Distance</a>.</p>
      </div>
    </div>
  );
}

export function WaterIntakeCalculator() {
  const [weight, setWeight] = useState('70');
  const [exerciseMin, setExerciseMin] = useState('0');
  const [result, setResult] = useState('');
  const calc = () => {
    const base = parseFloat(weight) * 35;
    const extra = parseFloat(exerciseMin) * 12;
    const total = (base + extra) / 1000;
    const cups = total / 0.237;
    setResult(`Daily Water: ${total.toFixed(1)} L\n(${cups.toFixed(0)} cups / ${(total * 33.814).toFixed(1)} oz)`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Water Intake Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Weight (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Daily Exercise (minutes)</label><input type="number" value={exerciseMin} onChange={e => setExerciseMin(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function SimpleInterestCalculator() {
  const [principal, setPrincipal] = useState('10000');
  const [rate, setRate] = useState('5');
  const [time, setTime] = useState('3');
  const [result, setResult] = useState('');
  const calc = () => {
    const si = parseFloat(principal) * parseFloat(rate) * parseFloat(time) / 100;
    const total = parseFloat(principal) + si;
    setResult(`Simple Interest: $${si.toFixed(2)}\nTotal Amount: $${total.toFixed(2)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Simple Interest Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Principal ($)</label><input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Rate (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.01" className={inputClass} /></div>
        <div><label className={labelClass}>Time (years)</label><input type="number" value={time} onChange={e => setTime(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function SavingsCalculator() {
  const [monthly, setMonthly] = useState('500');
  const [rate, setRate] = useState('5');
  const [years, setYears] = useState('10');
  const [result, setResult] = useState('');
  const calc = () => {
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(years) * 12;
    const pmt = parseFloat(monthly);
    const fv = pmt * (Math.pow(1 + r, n) - 1) / r;
    const totalContributed = pmt * n;
    setResult(`Future Value: $${fv.toFixed(2)}\nTotal Contributed: $${totalContributed.toFixed(2)}\nTotal Interest: $${(fv - totalContributed).toFixed(2)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Savings Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Monthly Contribution ($)</label><input type="number" value={monthly} onChange={e => setMonthly(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Annual Return (%)</label><input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.1" className={inputClass} /></div>
        <div><label className={labelClass}>Years</label><input type="number" value={years} onChange={e => setYears(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function SeatLicenseCalculator() {
  const [seats, setSeats] = useState('10');
  const [pricePerSeat, setPricePerSeat] = useState('50');
  const [months, setMonths] = useState('12');
  const [result, setResult] = useState('');
  const calc = () => {
    const totalMonthly = parseFloat(seats) * parseFloat(pricePerSeat);
    const totalAnnual = totalMonthly * parseFloat(months);
    setResult(`Monthly Total: $${totalMonthly.toFixed(2)}\nAnnual Total: $${totalAnnual.toFixed(2)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Seat License Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Number of Seats</label><input type="number" value={seats} onChange={e => setSeats(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Price per Seat ($/month)</label><input type="number" value={pricePerSeat} onChange={e => setPricePerSeat(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Months</label><input type="number" value={months} onChange={e => setMonths(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function SemverCalculator() {
  const [ver1, setVer1] = useState('2.1.0');
  const [ver2, setVer2] = useState('2.0.0');
  const [result, setResult] = useState('');
  const parseVer = (v: string) => v.split('.').map(Number);
  const calc = () => {
    const v1 = parseVer(ver1);
    const v2 = parseVer(ver2);
    let cmp = '';
    for (let i = 0; i < 3; i++) {
      if (v1[i] > v2[i]) { cmp = '>'; break; }
      if (v1[i] < v2[i]) { cmp = '<'; break; }
    }
    if (!cmp) cmp = '=';
    setResult(`${ver1} ${cmp} ${ver2}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Semver Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Version 1 (e.g., 2.1.0)</label><input type="text" value={ver1} onChange={e => setVer1(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Version 2 (e.g., 2.0.0)</label><input type="text" value={ver2} onChange={e => setVer2(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function StandardDeviationCalculator() {
  const [numbers, setNumbers] = useState('2,4,6,8,10');
  const [result, setResult] = useState('');
  const calc = () => {
    const nums = numbers.split(',').map(Number);
    const mean = nums.reduce((s, v) => s + v, 0) / nums.length;
    const variance = nums.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / nums.length;
    const std = Math.sqrt(variance);
    setResult(`Mean: ${mean.toFixed(4)}\nVariance: ${variance.toFixed(4)}\nStd Dev: ${std.toFixed(4)}`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Standard Deviation Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Numbers (comma-separated)</label><input type="text" value={numbers} onChange={e => setNumbers(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function TaxCalculator() {
  const [income, setIncome] = useState('75000');
  const [deductions, setDeductions] = useState('13000');
  const [result, setResult] = useState('');
  const calc = () => {
    const taxable = Math.max(0, parseFloat(income) - parseFloat(deductions));
    let tax = 0;
    if (taxable > 523600) tax = (taxable - 523600) * 0.37 + 157804.25;
    else if (taxable > 209425) tax = (taxable - 209425) * 0.35 + 47843;
    else if (taxable > 164925) tax = (taxable - 164925) * 0.32 + 33531;
    else if (taxable > 86775) tax = (taxable - 86775) * 0.24 + 14279;
    else if (taxable > 40675) tax = (taxable - 40675) * 0.22 + 4615;
    else if (taxable > 9950) tax = (taxable - 9950) * 0.12 + 995;
    else tax = taxable * 0.1;
    const effective = tax / parseFloat(income) * 100;
    setResult(`Taxable Income: $${taxable.toLocaleString()}\nEstimated Tax: $${Math.round(tax).toLocaleString()}\nEffective Rate: ${effective.toFixed(1)}%`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Tax Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Annual Income ($)</label><input type="number" value={income} onChange={e => setIncome(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Standard Deduction ($)</label><input type="number" value={deductions} onChange={e => setDeductions(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function TdsCalculatorIndia() {
  const [salary, setSalary] = useState('1200000');
  const [result, setResult] = useState('');
  const calc = () => {
    const s = parseFloat(salary);
    let tax = 0;
    if (s > 1500000) tax = (s - 1500000) * 0.3 + 150000;
    else if (s > 1200000) tax = (s - 1200000) * 0.2 + 90000;
    else if (s > 900000) tax = (s - 900000) * 0.15 + 45000;
    else if (s > 600000) tax = (s - 600000) * 0.1 + 15000;
    else if (s > 300000) tax = (s - 300000) * 0.05;
    const monthly = tax / 12;
    setResult(`Annual Tax: ₹${Math.round(tax).toLocaleString()}\nMonthly TDS: ₹${Math.round(monthly).toLocaleString()}\nNet Monthly Salary: ₹${Math.round((s - tax) / 12).toLocaleString()}\n(New Regime, no deductions, approximate)`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>TDS Calculator (India)</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Annual Salary (₹)</label><input type="number" value={salary} onChange={e => setSalary(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function TrialConversionCalculator() {
  const [trials, setTrials] = useState('1000');
  const [paid, setPaid] = useState('200');
  const [result, setResult] = useState('');
  const calc = () => {
    const rate = (parseFloat(paid) / parseFloat(trials)) * 100;
    setResult(`Conversion Rate: ${rate.toFixed(2)}%`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Trial Conversion Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Total Trials</label><input type="number" value={trials} onChange={e => setTrials(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Paid Conversions</label><input type="number" value={paid} onChange={e => setPaid(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function TriangleAreaCalculator() {
  const [base, setBase] = useState('6');
  const [height, setHeight] = useState('4');
  const [result, setResult] = useState('');
  const calc = () => {
    const area = 0.5 * parseFloat(base) * parseFloat(height);
    setResult(`Area: ${area.toFixed(2)} sq units`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Triangle Area Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Base</label><input type="number" value={base} onChange={e => setBase(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Height</label><input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate Area</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}

export function GasMileageCalculator() {
  const [miles, setMiles] = useState('300');
  const [gallons, setGallons] = useState('10');
  const [result, setResult] = useState('');
  const calc = () => {
    if (parseFloat(gallons) === 0) { setResult('Gallons cannot be zero'); return; }
    const mpg = parseFloat(miles) / parseFloat(gallons);
    setResult(`Fuel Economy: ${mpg.toFixed(1)} MPG`);
  };
  return (
    <div className={cardClass}>
      <h1 className={headingClass}>Gas Mileage Calculator</h1>
      <div className="space-y-4">
        <div><label className={labelClass}>Miles Driven</label><input type="number" value={miles} onChange={e => setMiles(e.target.value)} className={inputClass} /></div>
        <div><label className={labelClass}>Gallons Used</label><input type="number" value={gallons} onChange={e => setGallons(e.target.value)} className={inputClass} /></div>
        <button onClick={calc} className={btnClass}>Calculate MPG</button>
        {result && <pre className={resultClass}>{result}</pre>}
      </div>
    </div>
  );
}
