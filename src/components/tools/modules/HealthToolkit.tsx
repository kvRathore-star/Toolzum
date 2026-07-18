"use client";
import Link from "next/link";
import {
  Heart, Apple, Weight, Activity, Droplets, Brain, Moon, Scale,
  Baby, Sun, Footprints, Thermometer, Calculator
} from "lucide-react";

const sectionBtn = "inline-flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-default";

interface HubCard {
  name: string;
  slug: string;
  desc: string;
  icon: React.ElementType;
  path?: string;
}

function ToolCard({ name, slug, desc, icon: Icon, path }: HubCard) {
  return (
    <Link
      href={path || `/health/${slug}`}
      className="group flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all hover:shadow-md"
    >
      <span className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{name}</div>
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{desc}</div>
      </div>
    </Link>
  );
}

export default function HealthToolkit() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Health Toolkit</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
          A collection of health, fitness, and nutrition calculators and trackers — calorie logging,
          body composition analysis, BMI, BMR, heart rate, sleep, hydration, and more.
          Everything runs locally in your browser.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Apple className="w-3.5 h-3.5" /> Nutrition & Calories</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="Calorie Tracker" slug="calorie-tracker" desc="Log daily food intake with a built-in common foods database." icon={Apple} />
          <ToolCard name="Calorie Calculator" slug="calorie-intake-calculator" desc="Calculate resting BMR calorie needs based on weight, height, age, and gender." icon={Calculator} path="/health/calorie-intake-calculator" />
          <ToolCard name="TDEE Calculator" slug="calorie-calculator" desc="Total daily energy expenditure from BMR and activity level." icon={Activity} path="/calculator/calorie-calculator" />
          <ToolCard name="Macro Calculator" slug="macro-calculator" desc="Daily protein, carbs, and fat targets for your goals." icon={Scale} path="/calculator/macro-calculator" />
          <ToolCard name="Protein Calculator" slug="protein-calculator" desc="Daily protein needs based on weight and activity level." icon={Weight} path="/calculator/protein-calculator" />
          <ToolCard name="Keto Calculator" slug="keto-calculator" desc="Calorie and macro breakdown for a ketogenic diet." icon={Brain} path="/calculator/keto-calculator" />
          <ToolCard name="Breastfeeding Calories" slug="breastfeeding-calorie-calculator" desc="Extra calories needed during nursing." icon={Baby} path="/calculator/breastfeeding-calorie-calculator" />
          <ToolCard name="Cycling Calories" slug="cycling-calorie-calculator" desc="Calories burned cycling based on distance and weight." icon={Activity} path="/calculator/cycling-calorie-calculator" />
          <ToolCard name="Steps to Calories" slug="steps-to-calories-calculator" desc="Estimated calories burned from step count." icon={Footprints} path="/calculator/steps-to-calories-calculator" />
          <ToolCard name="Baby Formula" slug="baby-formula-calculator" desc="Daily formula volume by weight and age." icon={Baby} path="/calculator/baby-formula-calculator" />
          <ToolCard name="Child Height Predictor" slug="child-height-predictor" desc="Predicted adult height from parents." icon={Sun} path="/calculator/child-height-predictor" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Weight className="w-3.5 h-3.5" /> Body Composition</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="BMI Calculator" slug="bmi-calculator" desc="Body Mass Index from height and weight." icon={Scale} path="/calculator/bmi-calculator" />
          <ToolCard name="BMI for Kids" slug="bmi-calculator-for-kids" desc="BMI percentile for children." icon={Baby} path="/calculator/bmi-calculator-for-kids" />
          <ToolCard name="BMR Calculator" slug="bmr-calculator" desc="Basal Metabolic Rate from weight, height, age, and gender." icon={Thermometer} path="/calculator/bmr-calculator" />
          <ToolCard name="Body Fat % (Navy)" slug="body-fat-percentage-calculator" desc="Body fat percentage using Navy circumference method." icon={Weight} path="/calculator/body-fat-percentage-calculator" />
          <ToolCard name="Body Fat Estimator" slug="body-fat-estimator" desc="Estimate body fat from BMI and age." icon={Weight} path="/health/body-fat-estimator" />
          <ToolCard name="Ideal Weight" slug="ideal-weight-calc" desc="Ideal body weight by Devine and Robinson formulas." icon={Weight} path="/health/ideal-weight-calc" />
          <ToolCard name="Lean Body Mass" slug="lean-body-mass-calculator" desc="LBM using Boer formula." icon={Weight} path="/calculator/lean-body-mass-calculator" />
          <ToolCard name="Body Surface Area" slug="body-surface-area-calculator" desc="BSA using Mosteller formula." icon={Scale} path="/calculator/body-surface-area-calculator" />
          <ToolCard name="Waist-to-Hip Ratio" slug="waist-to-hip-ratio-calculator" desc="Calculate WHR and assess health risk." icon={Scale} path="/health/waist-to-hip-ratio-calculator" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Activity className="w-3.5 h-3.5" /> Fitness & Wellness</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="Heart Rate Zones" slug="heart-rate-zone-calculator" desc="Target heart rate by age for different exercise intensities." icon={Activity} path="/calculator/heart-rate-zone-calculator" />
          <ToolCard name="Running Pace" slug="running-pace-calculator" desc="Calculate pace, speed, and finish times." icon={Footprints} path="/calculator/running-pace-calculator" />
          <ToolCard name="Sleep Calculator" slug="sleep-calculator" desc="Recommended sleep hours by age group." icon={Moon} path="/calculator/sleep-calculator" />
          <ToolCard name="Water Intake" slug="water-intake-calculator" desc="Daily hydration needs based on weight and exercise." icon={Droplets} path="/calculator/water-intake-calculator" />
          <ToolCard name="Pregnancy Due Date" slug="pregnancy-due-date-calculator" desc="Estimated due date from last menstrual period." icon={Baby} path="/calculator/pregnancy-due-date-calculator" />
          <ToolCard name="Ovulation Tracker" slug="ovulation-tracker" desc="Track fertile window and ovulation day." icon={CalendarIcon} path="/health/ovulation-tracker" />
        </div>
      </div>
    </div>
  );
}

function CalendarIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
