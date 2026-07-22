"use client";
import Link from "next/link";
import {
  DollarSign, Hash, Calendar, Heart, Briefcase,
  PiggyBank, TrendingUp, Home, Percent, Calculator,
  Car, Thermometer, Banknote, Scale, ChartNoAxesCombined,
  Timer, Sun, Moon, Baby, Weight,
  Activity, Flame, Footprints, Droplets,
  Fuel, Triangle, Zap, Infinity, ArrowLeftRight,
} from "lucide-react";

const sectionBtn = "inline-flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] cursor-default";

interface HubCard {
  name: string;
  slug: string;
  desc: string;
  icon: React.ElementType;
}

const CAT_OVERRIDES: Record<string, string> = {
  'subnet-calculator': 'developer',
  'stopwatch': 'developer',
  'unix-time-converter': 'developer',
  'week-number-calculator': 'developer',
  'calorie-intake-calculator': 'health',
  'ideal-weight-calc': 'health',
  'ovulation-tracker': 'health',
  'conversion-rate-calculator': 'branding',
};

function toolPath(slug: string): string {
  const cat = CAT_OVERRIDES[slug] || 'calculator';
  return `/${cat}/${slug}`;
}

function ToolCard({ name, slug, desc, icon: Icon }: HubCard) {
  return (
    <Link
      href={toolPath(slug)}
      className="group flex items-start gap-3 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:shadow-md"
    >
      <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-[var(--accent)] dark:text-[var(--accent)] group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
        <Icon className="w-3.5 h-3.5" />
      </span>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] dark:group-hover:text-[var(--accent)] transition-colors">{name}</div>
        <div className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-relaxed line-clamp-1">{desc}</div>
      </div>
    </Link>
  );
}

export default function CalculatorKit() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Calculator Kit</h2>
        <p className="text-sm text-zinc-600 dark:text-[var(--text-muted)] leading-relaxed max-w-3xl">
          A comprehensive collection of 80+ calculators — finance, math, geometry, date/time,
          health, fitness, business, and SaaS metrics. Everything runs locally in your browser.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><DollarSign className="w-3.5 h-3.5" /> Finance Calculators</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <ToolCard name="Simple Interest" slug="simple-interest-calculator" desc="Calculate simple interest on principal over time." icon={PiggyBank} />
          <ToolCard name="Compound Interest" slug="compound-interest-calculator" desc="Compound interest with configurable compounding frequency." icon={TrendingUp} />
          <ToolCard name="Mortgage" slug="mortgage-calculator" desc="Monthly mortgage payments with amortization." icon={Home} />
          <ToolCard name="Discount" slug="discount-calculator" desc="Calculate final price after a percentage discount." icon={Percent} />
          <ToolCard name="Car Loan" slug="car-loan-calculator" desc="Monthly car loan payments at given APR and term." icon={Car} />
          <ToolCard name="Car Lease" slug="car-lease-calculator" desc="Estimate monthly lease payments." icon={Car} />
          <ToolCard name="Inflation" slug="inflation-calculator" desc="Future value of money adjusted for inflation." icon={Thermometer} />
          <ToolCard name="Debt Payoff" slug="debt-payoff-calculator" desc="Months to pay off debt with fixed monthly payment." icon={Banknote} />
          <ToolCard name="Tip Calculator" slug="tip-calculator" desc="Calculate tip amount and total bill." icon={Percent} />
          <ToolCard name="Net Worth" slug="net-worth-calculator" desc="Assets minus liabilities." icon={Scale} />
          <ToolCard name="Hourly to Salary" slug="hourly-to-salary-calculator" desc="Convert hourly rate to annual salary." icon={Banknote} />
          <ToolCard name="Retirement" slug="retirement-calculator" desc="Future value of retirement savings." icon={PiggyBank} />
          <ToolCard name="Conversion Rate" slug="conversion-rate-calculator" desc="Conversion rate from visitors to actions." icon={ChartNoAxesCombined} />
          <ToolCard name="Savings" slug="savings-calculator" desc="Future value of monthly savings contributions." icon={PiggyBank} />
          <ToolCard name="Seat License" slug="seat-license-calculator" desc="Monthly and annual SaaS seat revenue." icon={DollarSign} />
          <ToolCard name="Tax (Est.)" slug="tax-calculator" desc="Estimate US federal income tax." icon={Banknote} />
          <ToolCard name="TDS (India)" slug="tds-calculator-india" desc="Tax Deducted at Source for India." icon={Banknote} />
          <ToolCard name="Trial Conversion" slug="trial-conversion-calculator" desc="Free trial to paid conversion metrics." icon={ChartNoAxesCombined} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Hash className="w-3.5 h-3.5" /> Math & Geometry Calculators</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <ToolCard name="Quadratic Solver" slug="quadratic-equation-solver" desc="Solve ax²+bx+c with real roots." icon={Infinity} />
          <ToolCard name="Simplify Fraction" slug="fraction-calculator" desc="Reduce fractions to lowest terms." icon={Hash} />
          <ToolCard name="Mean & Std Dev" slug="standard-deviation-calculator" desc="Mean, standard deviation, and count." icon={Calculator} />
          <ToolCard name="Pythagorean Theorem" slug="pythagorean-theorem-calculator" desc="Calculate hypotenuse from a²+b²=c²." icon={Triangle} />
          <ToolCard name="Circle" slug="circle-calculator" desc="Area and circumference from radius." icon={Zap} />
          <ToolCard name="Triangle Area" slug="triangle-area-calculator" desc="Area from base and height." icon={Triangle} />
          <ToolCard name="Rectangle Area" slug="rectangle-area-calculator" desc="Area from width and height." icon={Hash} />
          <ToolCard name="Ratio" slug="ratio-calculator" desc="Simplify and compare ratios." icon={ArrowLeftRight} />
          <ToolCard name="Probability" slug="probability-calculator" desc="Probability from favorable and total outcomes." icon={Percent} />
          <ToolCard name="Exponent" slug="exponent-calculator" desc="Calculate base raised to a power." icon={Zap} />
          <ToolCard name="Gas Mileage" slug="gas-mileage-calculator" desc="Calculate MPG from distance and fuel used." icon={Fuel} />
          <ToolCard name="DPI / PPI" slug="dpi-calculator" desc="Screen pixel density from resolution and size." icon={MonitorIcon} />
          <ToolCard name="Aspect Ratio" slug="aspect-ratio-calculator" desc="Simplify width:height aspect ratios." icon={MonitorIcon} />
          <ToolCard name="IP Subnet (CIDR)" slug="subnet-calculator" desc="Calculate hosts and usable addresses." icon={GlobeIcon} />
          <ToolCard name="Fluid Typography" slug="fluid-typography-calculator" desc="Generate clamp() CSS for responsive text." icon={TextCursorInput} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Calendar className="w-3.5 h-3.5" /> Date & Time Calculators</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <ToolCard name="Date Difference" slug="date-difference-calculator" desc="Days, hours, and minutes between dates." icon={Calendar} />
          <ToolCard name="Day of Week" slug="day-of-week-calculator" desc="What day of the week a date falls on." icon={Calendar} />
          <ToolCard name="Add Days" slug="date-addition-calculator" desc="Add or subtract days from a date." icon={Calendar} />
          <ToolCard name="Week Number" slug="week-number-calculator" desc="ISO week number for any date." icon={Hash} />
          <ToolCard name="Day of Year" slug="day-of-year-calculator" desc="Day number within the year." icon={Calendar} />
          <ToolCard name="Leap Year" slug="leap-year-calculator" desc="Check if a year is a leap year." icon={Calendar} />
          <ToolCard name="Unix Timestamp" slug="unix-time-converter" desc="Convert between dates and Unix timestamps." icon={Timer} />
          <ToolCard name="Time Duration" slug="time-duration-calculator" desc="Convert hours and minutes to seconds." icon={Timer} />
          <ToolCard name="Business Days" slug="business-days-calculator" desc="Add business days excluding weekends." icon={Briefcase} />
          <ToolCard name="Stopwatch" slug="stopwatch" desc="Simple online stopwatch." icon={Timer} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Heart className="w-3.5 h-3.5" /> Health & Fitness Calculators</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <ToolCard name="Body Fat (Navy)" slug="body-fat-percentage-calculator" desc="Body fat % using Navy circumference method." icon={Weight} />
          <ToolCard name="Calorie Intake" slug="calorie-intake-calculator" desc="BMR, maintenance, cutting, and bulking targets." icon={Flame} />
          <ToolCard name="BMI for Kids" slug="bmi-calculator-for-kids" desc="BMI percentile for children." icon={Weight} />
          <ToolCard name="Body Surface Area" slug="body-surface-area-calculator" desc="BSA using Mosteller formula." icon={Scale} />
          <ToolCard name="Ideal Weight" slug="ideal-weight-calc" desc="Ideal body weight by Devine and Robinson formulas." icon={Weight} />
          <ToolCard name="Lean Body Mass" slug="lean-body-mass-calculator" desc="LBM using Boer formula." icon={Weight} />
          <ToolCard name="Heart Rate Zones" slug="heart-rate-zone-calculator" desc="Target heart rate by age and intensity." icon={Activity} />
          <ToolCard name="Calorie Needs Calculator" slug="calorie-intake-calculator" desc="Maintenance, cutting, and bulking targets from BMR." icon={Flame} />
          <ToolCard name="Baby Formula" slug="baby-formula-calculator" desc="Daily formula volume by weight and age." icon={Baby} />
          <ToolCard name="Child Height" slug="child-height-predictor" desc="Predicted adult height from parents." icon={Sun} />
          <ToolCard name="Breastfeeding" slug="breastfeeding-calorie-calculator" desc="Extra calories needed during nursing." icon={Baby} />
          <ToolCard name="Cycling Calories" slug="cycling-calorie-calculator" desc="Calories burned cycling by distance and weight." icon={Activity} />
          <ToolCard name="Keto Macros" slug="keto-calculator" desc="Calorie breakdown for keto diet." icon={Flame} />
          <ToolCard name="Macro Calculator" slug="macro-calculator" desc="Daily protein, carbs, and fat targets." icon={Scale} />
          <ToolCard name="Protein Calculator" slug="protein-calculator" desc="Daily protein needs by activity level." icon={Weight} />
          <ToolCard name="Running Pace" slug="running-pace-calculator" desc="Pace, speed, and split times." icon={Footprints} />
          <ToolCard name="Sleep Calculator" slug="sleep-calculator" desc="Recommended hours by age." icon={Moon} />
          <ToolCard name="Steps to Calories" slug="steps-to-calories-calculator" desc="Estimated calories burned from steps." icon={Footprints} />
          <ToolCard name="Water Intake" slug="water-intake-calculator" desc="Daily water needs by weight and exercise." icon={Droplets} />
          <ToolCard name="Pregnancy Due Date" slug="pregnancy-due-date-calculator" desc="Estimated due date from LMP." icon={Baby} />
          <ToolCard name="Ovulation" slug="ovulation-tracker" desc="Fertile window and ovulation day." icon={Calendar} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Briefcase className="w-3.5 h-3.5" /> Business & SaaS Calculators</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <ToolCard name="Break Even" slug="break-even-calculator" desc="Units needed to break even." icon={Calculator} />
          <ToolCard name="Burn Rate" slug="burn-rate-calculator" desc="Monthly net burn or profit." icon={TrendingDown} />
          <ToolCard name="Churn Rate" slug="churn-rate-calculator" desc="Monthly and annual customer churn." icon={Percent} />
          <ToolCard name="MRR" slug="mrr-calculator" desc="Monthly recurring revenue." icon={DollarSign} />
          <ToolCard name="ARR" slug="arr-calculator" desc="Annual recurring revenue." icon={DollarSign} />
          <ToolCard name="NPS" slug="net-promoter-score-calculator" desc="Net Promoter Score from survey data." icon={ChartNoAxesCombined} />
          <ToolCard name="Revenue Growth" slug="revenue-growth-calculator" desc="Revenue growth percentage." icon={TrendingUp} />
          <ToolCard name="Runway" slug="runway-calculator" desc="Months of runway based on burn rate." icon={Timer} />
          <ToolCard name="LTV" slug="ltv-calculator" desc="Customer lifetime value from ARPU and tenure." icon={DollarSign} />
          <ToolCard name="CAC" slug="cac-calculator" desc="Customer acquisition cost." icon={DollarSign} />
          <ToolCard name="Rent vs Buy" slug="rent-vs-buy-calculator" desc="Compare renting vs buying a property." icon={Home} />
          <ToolCard name="A/B Test" slug="ab-test-calculator" desc="Compare conversion rates between variants." icon={ChartNoAxesCombined} />
          <ToolCard name="SemVer" slug="semver-calculator" desc="Parse semantic version strings." icon={Hash} />
          <ToolCard name="Final Grade" slug="final-grade-calculator" desc="Calculate letter grade from score." icon={Percent} />
          <ToolCard name="College GPA" slug="college-gpa-calculator" desc="GPA from letter grades." icon={Calculator} />
          <ToolCard name="Rule of 40" slug="saas-rule-of-40" desc="SaaS health score from growth and profit." icon={ChartNoAxesCombined} />
        </div>
      </div>
    </div>
  );
}

function MonitorIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function GlobeIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function TextCursorInput(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 4H9a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8" />
      <path d="M9 12h6" />
    </svg>
  );
}

function TrendingDown(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}
