"use client";

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { HUB_DESCRIPTIONS } from './shared/hubDescriptions';

const IMPORT_TIMEOUT_MS = 15_000;

function useImportTimeout(slug: string): boolean {
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setTimedOut(true), IMPORT_TIMEOUT_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [slug]);

  if (timedOut) return true;
  return false;
}

function DynamicImportFallback({ slug }: { slug: string }) {
  const timedOut = useImportTimeout(slug);
  if (timedOut) {
    return (
      <div className="w-full bg-[var(--bg-overlay)] rounded-[var(--radius-2xl)] border border-red-500/30 p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 mb-6 flex items-center justify-center">
          <span className="text-red-500 text-2xl font-bold">!</span>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Module Load Timed Out</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-md">
          This tool module took too long to load. Check your internet connection and try refreshing.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-[var(--accent)] hover:opacity-90 text-white rounded-xl font-medium transition-all"
        >
          Refresh Page
        </button>
      </div>
    );
  }
  return <SkeletonLoader />;
}

const SkeletonLoader = () => (
  <div className="w-full bg-[var(--bg-overlay)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] p-8 animate-pulse flex flex-col items-center justify-center min-h-[400px]">
    <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] mb-6"></div>
    <div className="h-6 bg-[var(--bg-elevated)] rounded-md w-1/3 mb-4"></div>
    <div className="h-4 bg-[var(--bg-elevated)] rounded-md w-1/2 mb-8"></div>
    <div className="w-full h-12 bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] mb-4"></div>
    <div className="w-full h-12 bg-[var(--bg-elevated)] rounded-[var(--radius-lg)]"></div>

  </div>
);

// Heterogeneous registry — dynamic() returns vary per-component prop types; all are
// rendered here with no props, so `any` is the honest common type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MODULE_REGISTRY: Record<string, React.ComponentType<any>> = {
  'passport-photo-india': dynamic(() => import('@/components/tools/modules/indian-utilities/PassportPhotoIndia'), { 
    ssr: false, 
    loading: () => <DynamicImportFallback slug="passport-photo-india" />
  }),
  'aadhaar-wallet-cropper': dynamic(() => import('@/components/tools/modules/indian-utilities/AadhaarWalletCropper'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="aadhaar-wallet-cropper" />
  }),
  'aadhaar-card-masker': dynamic(() => import('@/components/tools/modules/indian-utilities/AadhaarMasker'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="aadhaar-card-masker" />
  }),
  'image-compressor': dynamic(() => import('@/components/tools/modules/image/ImageCompressor'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="image-compressor" />
  }),
  'pdf-merger': dynamic(() => import('@/components/tools/modules/pdf/PdfMerger'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="pdf-merger" />
  }),
  'pdf-compressor': dynamic(() => import('@/components/tools/modules/pdf/PdfCompressor'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="pdf-compressor" />
  }),
  'password-generator': dynamic(() => import('@/components/tools/modules/utility/PasswordGenerator'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="password-generator" />
  }),
  'live-transcription': dynamic(() => import('@/components/tools/modules/transcription/LiveTranscription'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="live-transcription" />
  }),
  'image-bulk-converter': dynamic(() => import('@/components/tools/modules/image/ImageBulkConverter'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="image-bulk-converter" />
  }),
  'esign-pdf': dynamic(() => import('@/components/tools/modules/pdf/EsignPdf'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="esign-pdf" />
  }),
  'pdf-form-filler': dynamic(() => import('@/components/tools/modules/pdf/PdfFormFiller'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="pdf-form-filler" />
  }),
  'pdf-ocr': dynamic(() => import('@/components/tools/modules/pdf/PdfOcr'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="pdf-ocr" />
  }),
  'resume-builder': dynamic(() => import('@/components/tools/modules/utility/ResumeBuilder'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="resume-builder" />
  }),
  'ai-image-upscaler': dynamic(() => import('@/components/tools/modules/ai/AiImageUpscaler'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="ai-image-upscaler" />
  }),
  'ai-document-chat': dynamic(() => import('@/components/tools/modules/ai/AiDocumentChat'), { 
    ssr: false,
    loading: () => <DynamicImportFallback slug="ai-document-chat" />
  }),
  'mp3-compressor': dynamic(() => import('@/components/tools/modules/audio/Mp3Compressor'), { ssr: false, loading: () => <DynamicImportFallback slug="mp3-compressor" /> }),
  'gif-to-mp4': dynamic(() => import('@/components/tools/modules/video/GifToMp4'), { ssr: false, loading: () => <DynamicImportFallback slug="gif-to-mp4" /> }),
  'video-trimmer': dynamic(() => import('@/components/tools/modules/video/VideoTrimmer'), { ssr: false, loading: () => <DynamicImportFallback slug="video-trimmer" /> }),
  'privacy-cleaner': dynamic(() => import('@/components/tools/modules/privacy/PrivacyCleaner'), { ssr: false, loading: () => <DynamicImportFallback slug="privacy-cleaner" /> }),
  'ai-translator': dynamic(() => import('@/components/tools/modules/ai/AiTranslator'), { ssr: false, loading: () => <DynamicImportFallback slug="ai-translator" /> }),
  'ai-image-generator': dynamic(() => import('@/components/tools/modules/ai/AiImageGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="ai-image-generator" /> }),
  'speed-test': dynamic(() => import('@/components/tools/modules/utility/SpeedTest'), { ssr: false, loading: () => <DynamicImportFallback slug="speed-test" /> }),
  'compress-image-to-50kb': dynamic(() => import('@/components/tools/modules/image/CompressImageTo50kb'), { ssr: false, loading: () => <DynamicImportFallback slug="compress-image-to-50kb" /> }),
  'currency-converter': dynamic(() => import('@/components/tools/modules/finance/CurrencyConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="currency-converter" /> }),
  'logo-maker': dynamic(() => import('@/components/tools/modules/branding/LogoMaker'), { ssr: false, loading: () => <DynamicImportFallback slug="logo-maker" /> }),
  'percentage-calculator': dynamic(() => import('@/components/tools/modules/calculator/PercentageCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="percentage-calculator" /> }),
  'age-calculator': dynamic(() => import('@/components/tools/modules/calculator/AgeCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="age-calculator" /> }),
  'mortgage-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.MortgageCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="mortgage-calculator" /> }),
  'arr-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.ArrCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="arr-calculator" /> }),
  'compound-interest-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.CompoundInterestCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="compound-interest-calculator" /> }),

  'car-loan-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.CarLoanCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="car-loan-calculator" /> }),
  'car-lease-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.CarLeaseCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="car-lease-calculator" /> }),
  'churn-rate-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.ChurnRateCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="churn-rate-calculator" /> }),
  'debt-payoff-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.DebtPayoffCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="debt-payoff-calculator" /> }),
  'discount-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.DiscountCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="discount-calculator" /> }),
  'hourly-to-salary-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.HourlyToSalaryCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="hourly-to-salary-calculator" /> }),
  'inflation-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.InflationCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="inflation-calculator" /> }),
  'customer-ltv-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.LtvCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="customer-ltv-calculator" /> }),
  'mrr-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.MrrCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="mrr-calculator" /> }),
  'net-worth-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.NetWorthCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="net-worth-calculator" /> }),
  'rent-vs-buy-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.RentVsBuyCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="rent-vs-buy-calculator" /> }),
  'retirement-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.RetirementCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="retirement-calculator" /> }),
  'revenue-growth-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.RevenueGrowthCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="revenue-growth-calculator" /> }),
  'runway-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.RunwayCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="runway-calculator" /> }),
  'ab-test-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.AbTestCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="ab-test-calculator" /> }),
  'business-days-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.BusinessDaysCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="business-days-calculator" /> }),
  'day-of-week-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.DayOfWeekCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="day-of-week-calculator" /> }),
  'day-of-year-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.DayOfYearCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="day-of-year-calculator" /> }),
  'exponent-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.ExponentCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="exponent-calculator" /> }),
  'final-grade-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.FinalGradeCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="final-grade-calculator" /> }),
  'gpa-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.GpaCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="gpa-calculator" /> }),
  'grade-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.GradeCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="grade-calculator" /> }),
  'college-gpa-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.CollegeGpaCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="college-gpa-calculator" /> }),
  'leap-year-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.LeapYearCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="leap-year-calculator" /> }),
  'probability-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.ProbabilityCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="probability-calculator" /> }),
  'proportion-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.ProportionCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="proportion-calculator" /> }),
  'ratio-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.RatioCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="ratio-calculator" /> }),
  'aspect-ratio-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.AspectRatioCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="aspect-ratio-calculator" /> }),
  'circle-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.CircleCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="circle-calculator" /> }),
  'dpi-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.DpiCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="dpi-calculator" /> }),
  'fraction-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.FractionCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="fraction-calculator" /> }),
  'mean-median-mode-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.MeanMedianModeCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="mean-median-mode-calculator" /> }),
  'ppi-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.PpiCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="ppi-calculator" /> }),
  'pythagorean-theorem-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.PythagoreanTheoremCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="pythagorean-theorem-calculator" /> }),
  'quadratic-equation-solver': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.QuadraticEquationSolver })), { ssr: false, loading: () => <DynamicImportFallback slug="quadratic-equation-solver" /> }),
  'rectangle-area-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.RectangleAreaCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="rectangle-area-calculator" /> }),
  'triangle-area-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.TriangleAreaCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="triangle-area-calculator" /> }),
  'gas-mileage-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.GasMileageCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="gas-mileage-calculator" /> }),
  'square-root-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.SquareRootCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="square-root-calculator" /> }),
  'scientific-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.ScientificCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="scientific-calculator" /> }),
  'fluid-typography-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.FluidTypographyCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="fluid-typography-calculator" /> }),
  'bmi-calculator-for-kids': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.BmiCalculatorForKids })), { ssr: false, loading: () => <DynamicImportFallback slug="bmi-calculator-for-kids" /> }),
  'body-fat-percentage-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.BodyFatPercentageCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="body-fat-percentage-calculator" /> }),
  'body-surface-area-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.BodySurfaceAreaCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="body-surface-area-calculator" /> }),
  'baby-formula-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.BabyFormulaCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="baby-formula-calculator" /> }),
  'baby-growth-percentile-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.BabyGrowthPercentileCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="baby-growth-percentile-calculator" /> }),
  'baby-sleep-schedule-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.BabySleepScheduleCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="baby-sleep-schedule-calculator" /> }),
  'breastfeeding-calorie-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.BreastfeedingCalorieCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="breastfeeding-calorie-calculator" /> }),
  'calorie-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.CalorieCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="calorie-calculator" /> }),
  'child-height-predictor': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.ChildHeightPredictor })), { ssr: false, loading: () => <DynamicImportFallback slug="child-height-predictor" /> }),
  'cycling-calorie-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.CyclingCalorieCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="cycling-calorie-calculator" /> }),
  'heart-rate-zone-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.HeartRateZoneCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="heart-rate-zone-calculator" /> }),
  'keto-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.KetoCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="keto-calculator" /> }),
  'lean-body-mass-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.LeanBodyMassCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="lean-body-mass-calculator" /> }),
  'macro-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.MacroCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="macro-calculator" /> }),
  'pregnancy-due-date-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.PregnancyDueDateCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="pregnancy-due-date-calculator" /> }),
  'protein-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.ProteinCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="protein-calculator" /> }),
  'running-pace-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.RunningPaceCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="running-pace-calculator" /> }),
  'sleep-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.SleepCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="sleep-calculator" /> }),
  'steps-to-calories-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.StepsToCaloriesCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="steps-to-calories-calculator" /> }),
  'water-intake-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.WaterIntakeCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="water-intake-calculator" /> }),
  'simple-interest-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.SimpleInterestCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="simple-interest-calculator" /> }),
  'savings-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.SavingsCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="savings-calculator" /> }),
  'seat-license-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.SeatLicenseCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="seat-license-calculator" /> }),
  'semver-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.SemverCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="semver-calculator" /> }),
  'standard-deviation-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.StandardDeviationCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="standard-deviation-calculator" /> }),
  'tax-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.TaxCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="tax-calculator" /> }),
  'tds-calculator-india': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.TdsCalculatorIndia })), { ssr: false, loading: () => <DynamicImportFallback slug="tds-calculator-india" /> }),
  'trial-conversion-calculator': dynamic(() => import('@/components/tools/modules/Calculators').then(m => ({ default: m.TrialConversionCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="trial-conversion-calculator" /> }),

  'wheel-of-names': dynamic(() => import('@/components/tools/modules/utility/WheelOfNames'), { ssr: false, loading: () => <DynamicImportFallback slug="wheel-of-names" /> }),
  'object-remover': dynamic(() => import('@/components/tools/modules/image/ObjectRemover'), { ssr: false, loading: () => <DynamicImportFallback slug="object-remover" /> }),
  'screen-recorder-extension': dynamic(() => import('@/components/tools/modules/extension/ScreenRecorderExtension'), { ssr: false, loading: () => <DynamicImportFallback slug="screen-recorder-extension" /> }),
  'to-do-list': dynamic(() => import('@/components/tools/modules/productivity/ToDoList'), { ssr: false, loading: () => <DynamicImportFallback slug="to-do-list" /> }),
  'emi-calculator': dynamic(() => import('@/components/tools/modules/finance/EmiCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="emi-calculator" /> }),
  'video-to-text-transcription': dynamic(() => import('@/components/tools/modules/transcription/VideoToTextTranscription'), { ssr: false, loading: () => <DynamicImportFallback slug="video-to-text-transcription" /> }),
  'crop-image': dynamic(() => import('@/components/tools/modules/image/CropImage'), { ssr: false, loading: () => <DynamicImportFallback slug="crop-image" /> }),
  'social-media-post-maker': dynamic(() => import('@/components/tools/modules/branding/SocialMediaPostMaker'), { ssr: false, loading: () => <DynamicImportFallback slug="social-media-post-maker" /> }),
  'text-to-speech-tts': dynamic(() => import('@/components/tools/modules/audio/TextToSpeechTts'), { ssr: false, loading: () => <DynamicImportFallback slug="text-to-speech-tts" /> }),
  'ai-paraphrasing-tool': dynamic(() => import('@/components/tools/modules/ai/AiParaphrasingTool'), { ssr: false, loading: () => <DynamicImportFallback slug="ai-paraphrasing-tool" /> }),
  'url-shortener': dynamic(() => import('@/components/tools/modules/utility/UrlShortener'), { ssr: false, loading: () => <DynamicImportFallback slug="url-shortener" /> }),
  'unlock-pdf': dynamic(() => import('@/components/tools/modules/pdf/ProtectPdf').then(m => {
    const UnlockPdf = () => <m.PdfSecurityTool defaultMode="unlock" />;
    return { default: UnlockPdf };
  }), { ssr: false, loading: () => <DynamicImportFallback slug="unlock-pdf" /> }),
  'image-enhancer': dynamic(() => import('@/components/tools/modules/image/ImageEnhancer'), { ssr: false, loading: () => <DynamicImportFallback slug="image-enhancer" /> }),
  'sip-calculator': dynamic(() => import('@/components/tools/modules/finance/SipCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="sip-calculator" /> }),
  'bmi-calculator': dynamic(() => import('@/components/tools/modules/health/BmiCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="bmi-calculator" /> }),
  'audio-to-text-transcription': dynamic(() => import('@/components/tools/modules/transcription/AudioToTextTranscription'), { ssr: false, loading: () => <DynamicImportFallback slug="audio-to-text-transcription" /> }),
  'meme-generator': dynamic(() => import('@/components/tools/modules/image/MemeGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="meme-generator" /> }),
  'gst-calculator': dynamic(() => import('@/components/tools/modules/indian-utilities/GstCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="gst-calculator" /> }),
  'image-resizer': dynamic(() => import('@/components/tools/modules/image/ImageResizer'), { ssr: false, loading: () => <DynamicImportFallback slug="image-resizer" /> }),
  'diff-checker': dynamic(() => import('@/components/tools/modules/developer/DiffChecker'), { ssr: false, loading: () => <DynamicImportFallback slug="diff-checker" /> }),
  'ip-address-lookup': dynamic(() => import('@/components/tools/modules/utility/IpAddressLookup'), { ssr: false, loading: () => <DynamicImportFallback slug="ip-address-lookup" /> }),
  'photo-retoucher': dynamic(() => import('@/components/tools/modules/image/PhotoRetoucher'), { ssr: false, loading: () => <DynamicImportFallback slug="photo-retoucher" /> }),
  'pdf-splitter': dynamic(() => import('@/components/tools/modules/pdf/PdfSplitter'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-splitter" /> }),
  'font-generator': dynamic(() => import('@/components/tools/modules/text/FontGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="font-generator" /> }),
  'salary-calculator': dynamic(() => import('@/components/tools/modules/finance/SalaryCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="salary-calculator" /> }),
  'audio-cutter': dynamic(() => import('@/components/tools/modules/audio/AudioCutter'), { ssr: false, loading: () => <DynamicImportFallback slug="audio-cutter" /> }),
  'youtube-transcript-generator': dynamic(() => import('@/components/tools/modules/transcription/YoutubeTranscriptGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="youtube-transcript-generator" /> }),
  'protect-pdf': dynamic(() => import('@/components/tools/modules/pdf/ProtectPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="protect-pdf" /> }),
  'invoice-generator': dynamic(() => import('@/components/tools/modules/finance/InvoiceGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="invoice-generator" /> }),
  'business-card-maker': dynamic(() => import('@/components/tools/modules/branding/BusinessCardMaker'), { ssr: false, loading: () => <DynamicImportFallback slug="business-card-maker" /> }),
  'regex-tester': dynamic(() => import('@/components/tools/modules/developer/RegexTester'), { ssr: false, loading: () => <DynamicImportFallback slug="regex-tester" /> }),
  'dice-roller': dynamic(() => import('@/components/tools/modules/utility/DiceRoller'), { ssr: false, loading: () => <DynamicImportFallback slug="dice-roller" /> }),
  'profit-margin-calculator': dynamic(() => import('@/components/tools/modules/finance/ProfitMarginCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="profit-margin-calculator" /> }),
  'speech-to-text': dynamic(() => import('@/components/tools/modules/audio/SpeechToText'), { ssr: false, loading: () => <DynamicImportFallback slug="speech-to-text" /> }),
  'coin-flipper': dynamic(() => import('@/components/tools/modules/utility/CoinFlipper'), { ssr: false, loading: () => <DynamicImportFallback slug="coin-flipper" /> }),
  'image-colorizer': dynamic(() => import('@/components/tools/modules/image/ImageColorizer'), { ssr: false, loading: () => <DynamicImportFallback slug="image-colorizer" /> }),
  'exif-data-remover': dynamic(() => import('@/components/tools/modules/privacy/ExifDataRemover'), { ssr: false, loading: () => <DynamicImportFallback slug="exif-data-remover" /> }),
  'video-compressor': dynamic(() => import('@/components/tools/modules/video/VideoCompressor'), { ssr: false, loading: () => <DynamicImportFallback slug="video-compressor" /> }),
  'ai-face-swap': dynamic(() => import('@/components/tools/modules/ai/AiFaceSwap'), { ssr: false, loading: () => <DynamicImportFallback slug="ai-face-swap" /> }),
  'xml-sitemap-generator': dynamic(() => import('@/components/tools/modules/seo/XmlSitemapGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="xml-sitemap-generator" /> }),
  'meeting-minutes-generator': dynamic(() => import('@/components/tools/modules/transcription/MeetingMinutesGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="meeting-minutes-generator" /> }),
  'ai-cover-letter-generator': dynamic(() => import('@/components/tools/modules/ai/AiCoverLetterGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="ai-cover-letter-generator" /> }),
  'watermark-pdf': dynamic(() => import('@/components/tools/modules/pdf/WatermarkPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="watermark-pdf" /> }),
  'pdf-page-delete': dynamic(() => import('@/components/tools/modules/pdf/PdfPageDelete'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-page-delete" /> }),
  'png-to-svg': dynamic(() => import('@/components/tools/modules/image/PngToSvg'), { ssr: false, loading: () => <DynamicImportFallback slug="png-to-svg" /> }),
  'email-signature-generator': dynamic(() => import('@/components/tools/modules/branding/EmailSignatureGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="email-signature-generator" /> }),
  'margin-calculator': dynamic(() => import('@/components/tools/modules/finance/MarginCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="margin-calculator" /> }),
  'morse-code-translator': dynamic(() => import('@/components/tools/modules/utility/MorseCodeTranslator'), { ssr: false, loading: () => <DynamicImportFallback slug="morse-code-translator" /> }),
  'roi-calculator': dynamic(() => import('@/components/tools/modules/finance/RoiCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="roi-calculator" /> }),
  'vat-calculator': dynamic(() => import('@/components/tools/modules/finance/VatCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="vat-calculator" /> }),
  'password-strength-checker': dynamic(() => import('@/components/tools/modules/privacy/PasswordStrengthChecker'), { ssr: false, loading: () => <DynamicImportFallback slug="password-strength-checker" /> }),
  'js-minifier': dynamic(() => import('@/components/tools/modules/developer/JsMinifier'), { ssr: false, loading: () => <DynamicImportFallback slug="js-minifier" /> }),
  'base64-encode-decode': dynamic(() => import('@/components/tools/modules/developer/EncoderDecoder').then(m => ({ default: m.EncoderDecoder })), { ssr: false, loading: () => <DynamicImportFallback slug="base64-encode-decode" /> }),
  'text-to-handwriting': dynamic(() => import('@/components/tools/modules/text/TextToHandwriting'), { ssr: false, loading: () => <DynamicImportFallback slug="text-to-handwriting" /> }),
  'receipt-generator': dynamic(() => import('@/components/tools/modules/finance/ReceiptGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="receipt-generator" /> }),
  'ai-thumbnail-maker': dynamic(() => import('@/components/tools/modules/ai/AiThumbnailMaker'), { ssr: false, loading: () => <DynamicImportFallback slug="ai-thumbnail-maker" /> }),
  'secure-note-sharer': dynamic(() => import('@/components/tools/modules/privacy/SecureNoteSharer'), { ssr: false, loading: () => <DynamicImportFallback slug="secure-note-sharer" /> }),
  'video-to-gif': dynamic(() => import('@/components/tools/modules/video/VideoToGif'), { ssr: false, loading: () => <DynamicImportFallback slug="video-to-gif" /> }),
  'image-to-base64': dynamic(() => import('@/components/tools/modules/developer/ImageToBase64'), { ssr: false, loading: () => <DynamicImportFallback slug="image-to-base64" /> }),
  'subtitle-translator': dynamic(() => import('@/components/tools/modules/video/SubtitleTranslator'), { ssr: false, loading: () => <DynamicImportFallback slug="subtitle-translator" /> }),
  'iban-validator': dynamic(() => import('@/components/tools/modules/finance/IbanValidator'), { ssr: false, loading: () => <DynamicImportFallback slug="iban-validator" /> }),
  'rotate-pdf': dynamic(() => import('@/components/tools/modules/pdf/RotatePdf'), { ssr: false, loading: () => <DynamicImportFallback slug="rotate-pdf" /> }),
  'extract-images-from-pdf': dynamic(() => import('@/components/tools/modules/pdf/ExtractImagesFromPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="extract-images-from-pdf" /> }),
  'sql-formatter': dynamic(() => import('@/components/tools/modules/developer/CodeFormatter').then(m => ({ default: m.SqlFormatter })), { ssr: false, loading: () => <DynamicImportFallback slug="sql-formatter" /> }),
  'uuid-generator': dynamic(() => import('@/components/tools/modules/developer/UuidGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="uuid-generator" /> }),
  'bmr-calculator': dynamic(() => import('@/components/tools/modules/health/BmrCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="bmr-calculator" /> }),


  'conversion-rate-calculator': dynamic(() => import('@/components/tools/modules/growth-marketing-metrics/ConversionRateCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="conversion-rate-calculator" /> }),
  'cpm-calculator': dynamic(() => import('@/components/tools/modules/growth-marketing-metrics/CpmCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="cpm-calculator" /> }),
  'roas-calculator': dynamic(() => import('@/components/tools/modules/growth-marketing-metrics/RoasCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="roas-calculator" /> }),
  'podcast-transcription': dynamic(() => import('@/components/tools/modules/transcription/PodcastTranscription'), { ssr: false, loading: () => <DynamicImportFallback slug="podcast-transcription" /> }),
  'compare-pdf-files': dynamic(() => import('@/components/tools/modules/pdf/ComparePdfFiles'), { ssr: false, loading: () => <DynamicImportFallback slug="compare-pdf-files" /> }),
  'favicon-generator': dynamic(() => import('@/components/tools/modules/design/FaviconGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="favicon-generator" /> }),
  'base64-to-image': dynamic(() => import('@/components/tools/modules/developer/ImageToBase64').then(m => {
    const Base64ToImage = () => <m.Base64ImageTool defaultMode="base64-to-image" />;
    return { default: Base64ToImage };
  }), { ssr: false, loading: () => <DynamicImportFallback slug="base64-to-image" /> }),
  'nato-phonetic-converter': dynamic(() => import('@/components/tools/modules/utility/NatoPhoneticConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="nato-phonetic-converter" /> }),

  'unicode-viewer': dynamic(() => import('@/components/tools/modules/utility/UnicodeViewer'), { ssr: false, loading: () => <DynamicImportFallback slug="unicode-viewer" /> }),
  'roman-numeral-converter': dynamic(() => import('@/components/tools/modules/converter/RomanNumeralConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="roman-numeral-converter" /> }),

  'md5-hash-generator': dynamic(() => import('@/components/tools/modules/developer/Md5HashGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="md5-hash-generator" /> }),
  'jfif-to-png': dynamic(() => import('@/components/tools/modules/image/JfifToPng'), { ssr: false, loading: () => <DynamicImportFallback slug="jfif-to-png" /> }),
  'convert-to-jpg': dynamic(() => import('@/components/tools/modules/image/ConvertToJpg'), { ssr: false, loading: () => <DynamicImportFallback slug="convert-to-jpg" /> }),
  'rotate-image': dynamic(() => import('@/components/tools/modules/image/RotateImage'), { ssr: false, loading: () => <DynamicImportFallback slug="rotate-image" /> }),
  'psd-to-jpg-png': dynamic(() => import('@/components/tools/modules/image/PsdToJpgPng'), { ssr: false, loading: () => <DynamicImportFallback slug="psd-to-jpg-png" /> }),
  'blur-face': dynamic(() => import('@/components/tools/modules/image/BlurFace'), { ssr: false, loading: () => <DynamicImportFallback slug="blur-face" /> }),
  'html-to-image': dynamic(() => import('@/components/tools/modules/image/HtmlToImage'), { ssr: false, loading: () => <DynamicImportFallback slug="html-to-image" /> }),
  'archive-converter': dynamic(() => import('@/components/tools/modules/converter/ArchiveConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="archive-converter" /> }),
  'video-to-mp3': dynamic(() => import('@/components/tools/modules/video/VideoToMp3'), { ssr: false, loading: () => <DynamicImportFallback slug="video-to-mp3" /> }),
  'crop-video': dynamic(() => import('@/components/tools/modules/video/CropVideo'), { ssr: false, loading: () => <DynamicImportFallback slug="crop-video" /> }),
  'add-text-to-photo': dynamic(() => import('@/components/tools/modules/image/AddTextToPhoto'), { ssr: false, loading: () => <DynamicImportFallback slug="add-text-to-photo" /> }),
  'batch-image-editor': dynamic(() => import('@/components/tools/modules/image/BatchImageEditor'), { ssr: false, loading: () => <DynamicImportFallback slug="batch-image-editor" /> }),
  'brand-kit': dynamic(() => import('@/components/tools/modules/branding/BrandKit'), { ssr: false, loading: () => <DynamicImportFallback slug="brand-kit" /> }),
  'pgp-key-generator': dynamic(() => import('@/components/tools/modules/privacy/PgpKeyGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="pgp-key-generator" /> }),
  'add-page-numbers-to-pdf': dynamic(() => import('@/components/tools/modules/pdf/AddPageNumbersToPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="add-page-numbers-to-pdf" /> }),
  'invisible-text-generator': dynamic(() => import('@/components/tools/modules/text/InvisibleTextGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="invisible-text-generator" /> }),
  'ltv-calculator': dynamic(() => import('@/components/tools/modules/growth-marketing-metrics/LtvCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="ltv-calculator" /> }),
  'cac-calculator': dynamic(() => import('@/components/tools/modules/growth-marketing-metrics/CacCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="cac-calculator" /> }),
  'burn-rate-calculator': dynamic(() => import('@/components/tools/modules/growth-marketing-metrics/BurnRateCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="burn-rate-calculator" /> }),
  'net-promoter-score-calculator': dynamic(() => import('@/components/tools/modules/growth-marketing-metrics/NetPromoterScoreCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="net-promoter-score-calculator" /> }),
  'pdf-metadata-editor': dynamic(() => import('@/components/tools/modules/pdf/PdfMetadataEditor'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-metadata-editor" /> }),
  'svg-editor': dynamic(() => import('@/components/tools/modules/design/SvgEditor'), { ssr: false, loading: () => <DynamicImportFallback slug="svg-editor" /> }),
  'robots-txt-generator': dynamic(() => import('@/components/tools/modules/seo/RobotsTxtGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="robots-txt-generator" /> }),
  'saas-pricing-calculator': dynamic(() => import('@/components/tools/modules/growth-marketing-metrics/SaasPricingCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="saas-pricing-calculator" /> }),
  'saas-metrics-dashboard': dynamic(() => import('@/components/tools/modules/growth-marketing-metrics/SaaSMetricsDashboard').then(m => ({ default: m.SaaSMetricsDashboard })), { ssr: false, loading: () => <DynamicImportFallback slug="saas-metrics-dashboard" /> }),
  'api-builder': dynamic(() => import('@/components/tools/modules/developer/ApiBuilder').then(m => ({ default: m.ApiBuilder })), { ssr: false, loading: () => <DynamicImportFallback slug="api-builder" /> }),
  'pdf-workflow-builder': dynamic(() => import('@/components/tools/modules/pdf/PdfWorkflowBuilder').then(m => ({ default: m.PdfWorkflowBuilder })), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-workflow-builder" /> }),
  'employee-turnover-calculator': dynamic(() => import('@/components/tools/modules/growth-marketing-metrics/EmployeeTurnoverCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="employee-turnover-calculator" /> }),
  'mac-address-generator': dynamic(() => import('@/components/tools/modules/privacy/MacAddressGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="mac-address-generator" /> }),
  'ip-anonymizer': dynamic(() => import('@/components/tools/modules/privacy/IpAnonymizer'), { ssr: false, loading: () => <DynamicImportFallback slug="ip-anonymizer" /> }),
  'braille-translator': dynamic(() => import('@/components/tools/modules/text/BrailleTranslator'), { ssr: false, loading: () => <DynamicImportFallback slug="braille-translator" /> }),
  'pan-card-resizer': dynamic(() => import('@/components/tools/modules/indian-utilities/PanCardResizer'), { ssr: false, loading: () => <DynamicImportFallback slug="pan-card-resizer" /> }),
  'upi-id-validator': dynamic(() => import('@/components/tools/modules/indian-utilities/UpiValidator'), { ssr: false, loading: () => <DynamicImportFallback slug="upi-id-validator" /> }),
  'indian-address-parser': dynamic(() => import('@/components/tools/modules/indian-utilities/IndianAddressParser'), { ssr: false, loading: () => <DynamicImportFallback slug="indian-address-parser" /> }),
  'vehicle-registration-checker': dynamic(() => import('@/components/tools/modules/indian-utilities/VehicleRegChecker'), { ssr: false, loading: () => <DynamicImportFallback slug="vehicle-registration-checker" /> }),
  'aadhaar-number-validator': dynamic(() => import('@/components/tools/modules/indian-utilities/AadhaarValidator'), { ssr: false, loading: () => <DynamicImportFallback slug="aadhaar-number-validator" /> }),
  'indian-investment-calculator': dynamic(() => import('@/components/tools/modules/indian-utilities/IndianInvestmentCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="indian-investment-calculator" /> }),
  'subtitle-generator': dynamic(() => import('@/components/tools/modules/video/SubtitleGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="subtitle-generator" /> }),
  'unit-converter': dynamic(() => import('@/components/tools/modules/converter/UnitConverter').then(m => ({ default: m.UnitConverter })), { ssr: false, loading: () => <DynamicImportFallback slug="unit-converter" /> }),
  'video-watermark-adder': dynamic(() => import('@/components/tools/modules/video/VideoWatermarkAdder'), { ssr: false, loading: () => <DynamicImportFallback slug="video-watermark-adder" /> }),
  'gst-invoice-generator': dynamic(() => import('@/components/tools/modules/pdf/GstInvoiceGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="gst-invoice-generator" /> }),
  'itr-filing-helper': dynamic(() => import('@/components/tools/modules/indian-utilities/ItrFilingHelper'), { ssr: false, loading: () => <DynamicImportFallback slug="itr-filing-helper" /> }),
  'browser-extension': dynamic(() => import('@/components/tools/modules/extension/BrowserExtension'), { ssr: false, loading: () => <DynamicImportFallback slug="browser-extension" /> }),
  'pan-verification': dynamic(() => import('@/components/tools/modules/indian-utilities/PanVerification'), { ssr: false, loading: () => <DynamicImportFallback slug="pan-verification" /> }),
  'ifsc-code-lookup': dynamic(() => import('@/components/tools/modules/indian-utilities/IfscLookup'), { ssr: false, loading: () => <DynamicImportFallback slug="ifsc-code-lookup" /> }),
  'voter-id-form-helper': dynamic(() => import('@/components/tools/modules/indian-utilities/VoterIdHelper'), { ssr: false, loading: () => <DynamicImportFallback slug="voter-id-form-helper" /> }),
  'india-pincode-finder': dynamic(() => import('@/components/tools/modules/indian-utilities/PincodeFinder'), { ssr: false, loading: () => <DynamicImportFallback slug="india-pincode-finder" /> }),
  'hindi-regional-font-generator': dynamic(() => import('@/components/tools/modules/text/RegionalFontGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="hindi-regional-font-generator" /> }),
  'indian-age-calculator': dynamic(() => import('@/components/tools/modules/indian-utilities/IndianAgeCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="indian-age-calculator" /> }),
  'cgpa-to-percentage-converter': dynamic(() => import('@/components/tools/modules/indian-utilities/CgpaToPercentage'), { ssr: false, loading: () => <DynamicImportFallback slug="cgpa-to-percentage-converter" /> }),
  'generic-pdf-processor': dynamic(() => import('@/components/tools/modules/pdf/GenericPDFProcessor'), { ssr: false, loading: () => <DynamicImportFallback slug="generic-pdf-processor" /> }),
  'apple-music-preview-extractor': dynamic(() => import('@/components/tools/modules/audio/AppleMusicPreviewExtractor'), { ssr: false, loading: () => <DynamicImportFallback slug="apple-music-preview-extractor" /> }),
  'brand-color-palette-generator': dynamic(() => import('@/components/tools/modules/branding/BrandColorPaletteGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="brand-color-palette-generator" /> }),
  'marriage-biodata-maker': dynamic(() => import('@/components/tools/modules/indian-utilities/MarriageBiodataMaker'), { ssr: false, loading: () => <DynamicImportFallback slug="marriage-biodata-maker" /> }),
  'rental-agreement-generator': dynamic(() => import('@/components/tools/modules/indian-utilities/RentalAgreementGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="rental-agreement-generator" /> }),
  'resume-ats-score-checker': dynamic(() => import('@/components/tools/modules/utility/ResumeAtsScoreChecker'), { ssr: false, loading: () => <DynamicImportFallback slug="resume-ats-score-checker" /> }),
  'whatsapp-toolkit': dynamic(() => import('@/components/tools/modules/branding/WhatsAppToolkit'), { ssr: false, loading: () => <DynamicImportFallback slug="whatsapp-toolkit" /> }),
  'indian-document-enhancer': dynamic(() => import('@/components/tools/modules/indian-utilities/IndianDocumentEnhancer'), { ssr: false, loading: () => <DynamicImportFallback slug="indian-document-enhancer" /> }),
  'indian-voice-transcriber': dynamic(() => import('@/components/tools/modules/indian-utilities/IndianVoiceTranscriber'), { ssr: false, loading: () => <DynamicImportFallback slug="indian-voice-transcriber" /> }),
  'bank-statement-analyser': dynamic(() => import('@/components/tools/modules/indian-utilities/BankStatementAnalyser'), { ssr: false, loading: () => <DynamicImportFallback slug="bank-statement-analyser" /> }),
  'social-media-calendar': dynamic(() => import('@/components/tools/modules/branding/SocialMediaCalendar'), { ssr: false, loading: () => <DynamicImportFallback slug="social-media-calendar" /> }),
  'bulk-bg-changer': dynamic(() => import('@/components/tools/modules/image/BulkBgChanger'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-bg-changer" /> }),
  'ai-bg-changer': dynamic(() => import('@/components/tools/modules/ai/AiBgChanger'), { ssr: false, loading: () => <DynamicImportFallback slug="ai-bg-changer" /> }),
  'link-in-bio-builder': dynamic(() => import('@/components/tools/modules/branding/LinkInBioBuilder'), { ssr: false, loading: () => <DynamicImportFallback slug="link-in-bio-builder" /> }),
  'bulk-video-compressor': dynamic(() => import('@/components/tools/modules/video/BulkVideoCompressor'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-video-compressor" /> }),
  'bulk-video-size-reducer': dynamic(() => import('@/components/tools/modules/video/BulkVideoSizeReducer'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-video-size-reducer" /> }),
  'bulk-video-subtitle-burner': dynamic(() => import('@/components/tools/modules/video/BulkVideoSubtitleBurner'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-video-subtitle-burner" /> }),
  'tax-saving-calculator': dynamic(() => import('@/components/tools/modules/indian-utilities/TaxSavingCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="tax-saving-calculator" /> }),
  'gstin-lookup': dynamic(() => import('@/components/tools/modules/indian-utilities/GstinLookup'), { ssr: false, loading: () => <DynamicImportFallback slug="gstin-lookup" /> }),
  'seller-profit-calculator': dynamic(() => import('@/components/tools/modules/indian-utilities/SellerProfitCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="seller-profit-calculator" /> }),
  'complaint-letter-generator': dynamic(() => import('@/components/tools/modules/indian-utilities/ComplaintLetterGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="complaint-letter-generator" /> }),
  'markdown-tools': dynamic(() => import('@/components/tools/modules/converter/MarkdownTools'), { ssr: false, loading: () => <DynamicImportFallback slug="markdown-tools" /> }),
  'markdown-to-html': dynamic(() => import('@/components/tools/modules/converter/MarkdownTools'), { ssr: false, loading: () => <DynamicImportFallback slug="markdown-to-html" /> }),
  'html-to-markdown': dynamic(() => import('@/components/tools/modules/converter/MarkdownTools'), { ssr: false, loading: () => <DynamicImportFallback slug="html-to-markdown" /> }),
  'text-to-markdown': dynamic(() => import('@/components/tools/modules/converter/MarkdownTools'), { ssr: false, loading: () => <DynamicImportFallback slug="text-to-markdown" /> }),
  'markdown-to-text': dynamic(() => import('@/components/tools/modules/converter/MarkdownTools'), { ssr: false, loading: () => <DynamicImportFallback slug="markdown-to-text" /> }),
  'pdf-to-markdown': dynamic(() => import('@/components/tools/modules/pdf/PdfToMarkdown'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-to-markdown" /> }),
  'extract-pages-from-pdf': dynamic(() => import('@/components/tools/modules/pdf/ExtractPagesFromPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="extract-pages-from-pdf" /> }),
  'scan-to-pdf': dynamic(() => import('@/components/tools/modules/pdf/ScanToPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="scan-to-pdf" /> }),
  'repair-pdf': dynamic(() => import('@/components/tools/modules/pdf/RepairPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="repair-pdf" /> }),
  'pdf-to-pdfa': dynamic(() => import('@/components/tools/modules/pdf/PdfToPdfa'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-to-pdfa" /> }),
  'crop-pdf': dynamic(() => import('@/components/tools/modules/pdf/CropPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="crop-pdf" /> }),
  'redact-pdf': dynamic(() => import('@/components/tools/modules/pdf/RedactPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="redact-pdf" /> }),
  'translate-pdf': dynamic(() => import('@/components/tools/modules/pdf/TranslatePdf'), { ssr: false, loading: () => <DynamicImportFallback slug="translate-pdf" /> }),
  'flatten-pdf': dynamic(() => import('@/components/tools/modules/pdf/FlattenPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="flatten-pdf" /> }),
  'grayscale-pdf': dynamic(() => import('@/components/tools/modules/pdf/GrayscalePdf'), { ssr: false, loading: () => <DynamicImportFallback slug="grayscale-pdf" /> }),
  'whiteout-pdf': dynamic(() => import('@/components/tools/modules/pdf/WhiteoutPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="whiteout-pdf" /> }),
  'resize-pdf-pages': dynamic(() => import('@/components/tools/modules/pdf/ResizePdfPages'), { ssr: false, loading: () => <DynamicImportFallback slug="resize-pdf-pages" /> }),
  'add-text-to-pdf': dynamic(() => import('@/components/tools/modules/pdf/AddTextToPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="add-text-to-pdf" /> }),
  'add-image-to-pdf': dynamic(() => import('@/components/tools/modules/pdf/AddImageToPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="add-image-to-pdf" /> }),
  'header-footer-pdf': dynamic(() => import('@/components/tools/modules/pdf/HeaderFooterPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="header-footer-pdf" /> }),
  'nup-pdf': dynamic(() => import('@/components/tools/modules/pdf/NupPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="nup-pdf" /> }),
  'pdf-annotator': dynamic(() => import('@/components/tools/modules/pdf/PdfAnnotator'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-annotator" /> }),
  'deskew-pdf': dynamic(() => import('@/components/tools/modules/pdf/PdfDeskew'), { ssr: false, loading: () => <DynamicImportFallback slug="deskew-pdf" /> }),
  'url-to-pdf': dynamic(() => import('@/components/tools/modules/pdf/UrlToPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="url-to-pdf" /> }),
  'markdown-to-pdf': dynamic(() => import('@/components/tools/modules/pdf/MarkdownToPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="markdown-to-pdf" /> }),
  'bookmark-pdf': dynamic(() => import('@/components/tools/modules/pdf/BookmarkPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="bookmark-pdf" /> }),
  'eml-to-pdf': dynamic(() => import('@/components/tools/modules/pdf/EmlToPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="eml-to-pdf" /> }),
  'raw-image-converter': dynamic(() => import('@/components/tools/modules/image/RawImageConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="raw-image-converter" /> }),
  'collage-maker': dynamic(() => import('@/components/tools/modules/image/CollageMaker'), { ssr: false, loading: () => <DynamicImportFallback slug="collage-maker" /> }),
  'chart-maker': dynamic(() => import('@/components/tools/modules/image/ChartMaker'), { ssr: false, loading: () => <DynamicImportFallback slug="chart-maker" /> }),
  'unblur-sharpen': dynamic(() => import('@/components/tools/modules/image/UnblurSharpen'), { ssr: false, loading: () => <DynamicImportFallback slug="unblur-sharpen" /> }),
  'gif-editor': dynamic(() => import('@/components/tools/modules/image/GifEditor'), { ssr: false, loading: () => <DynamicImportFallback slug="gif-editor" /> }),
  'video-speed-changer': dynamic(() => import('@/components/tools/modules/video/VideoSpeedChanger'), { ssr: false, loading: () => <DynamicImportFallback slug="video-speed-changer" /> }),
  'reverse-video': dynamic(() => import('@/components/tools/modules/video/ReverseVideo'), { ssr: false, loading: () => <DynamicImportFallback slug="reverse-video" /> }),
  'mute-video': dynamic(() => import('@/components/tools/modules/video/MuteVideo'), { ssr: false, loading: () => <DynamicImportFallback slug="mute-video" /> }),
  'vocal-remover': dynamic(() => import('@/components/tools/modules/audio/VocalRemover'), { ssr: false, loading: () => <DynamicImportFallback slug="vocal-remover" /> }),
  'audio-merger': dynamic(() => import('@/components/tools/modules/audio/AudioMerger'), { ssr: false, loading: () => <DynamicImportFallback slug="audio-merger" /> }),
  'voice-recorder': dynamic(() => import('@/components/tools/modules/audio/VoiceRecorder'), { ssr: false, loading: () => <DynamicImportFallback slug="voice-recorder" /> }),
  'noise-reducer': dynamic(() => import('@/components/tools/modules/audio/NoiseReducer'), { ssr: false, loading: () => <DynamicImportFallback slug="noise-reducer" /> }),
  'audio-equalizer': dynamic(() => import('@/components/tools/modules/audio/AudioEqualizer'), { ssr: false, loading: () => <DynamicImportFallback slug="audio-equalizer" /> }),
  'audio-compressor': dynamic(() => import('@/components/tools/modules/audio/AudioCompressor'), { ssr: false, loading: () => <DynamicImportFallback slug="audio-compressor" /> }),
  'waveform-generator': dynamic(() => import('@/components/tools/modules/audio/WaveformGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="waveform-generator" /> }),
  'fade-in-out': dynamic(() => import('@/components/tools/modules/audio/FadeInOut'), { ssr: false, loading: () => <DynamicImportFallback slug="fade-in-out" /> }),
  'video-stabilizer': dynamic(() => import('@/components/tools/modules/video/VideoStabilizer'), { ssr: false, loading: () => <DynamicImportFallback slug="video-stabilizer" /> }),
  'video-screenshot': dynamic(() => import('@/components/tools/modules/video/VideoScreenshot'), { ssr: false, loading: () => <DynamicImportFallback slug="video-screenshot" /> }),
  'video-filters': dynamic(() => import('@/components/tools/modules/video/VideoFilters'), { ssr: false, loading: () => <DynamicImportFallback slug="video-filters" /> }),
  'screen-recorder': dynamic(() => import('@/components/tools/modules/video/ScreenRecorder'), { ssr: false, loading: () => <DynamicImportFallback slug="screen-recorder" /> }),
  'ai-chat-pdf': dynamic(() => import('@/components/tools/modules/ai/AiChatPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="ai-chat-pdf" /> }),
  'grammar-checker': dynamic(() => import('@/components/tools/modules/ai/AiGrammarChecker'), { ssr: false, loading: () => <DynamicImportFallback slug="grammar-checker" /> }),
  'ai-humanizer': dynamic(() => import('@/components/tools/modules/ai/AiHumanizer'), { ssr: false, loading: () => <DynamicImportFallback slug="ai-humanizer" /> }),
  'ai-detector': dynamic(() => import('@/components/tools/modules/ai/AiDetector'), { ssr: false, loading: () => <DynamicImportFallback slug="ai-detector" /> }),
  'article-writer': dynamic(() => import('@/components/tools/modules/ai/AiArticleWriter'), { ssr: false, loading: () => <DynamicImportFallback slug="article-writer" /> }),
  'social-caption-generator': dynamic(() => import('@/components/tools/modules/ai/AiSocialCaption'), { ssr: false, loading: () => <DynamicImportFallback slug="social-caption-generator" /> }),
  'mobi-converter': dynamic(() => import('@/components/tools/modules/converter/MobiConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="mobi-converter" /> }),
  'odt-rtf-to-pdf': dynamic(() => import('@/components/tools/modules/converter/OdtRtfConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="odt-rtf-to-pdf" /> }),
  'website-screenshot': dynamic(() => import('@/components/tools/modules/developer/WebsiteScreenshot'), { ssr: false, loading: () => <DynamicImportFallback slug="website-screenshot" /> }),
  'gif-to-webp-webm': dynamic(() => import('@/components/tools/modules/converter/GifToWebpWebm'), { ssr: false, loading: () => <DynamicImportFallback slug="gif-to-webp-webm" /> }),
  'gif-compressor': dynamic(() => import('@/components/tools/modules/image/GifCompressor'), { ssr: false, loading: () => <DynamicImportFallback slug="gif-compressor" /> }),
  'gif-resizer': dynamic(() => import('@/components/tools/modules/image/GifResizer'), { ssr: false, loading: () => <DynamicImportFallback slug="gif-resizer" /> }),
  'gif-to-apng': dynamic(() => import('@/components/tools/modules/image/GifToApng'), { ssr: false, loading: () => <DynamicImportFallback slug="gif-to-apng" /> }),
  'apng-to-gif': dynamic(() => import('@/components/tools/modules/image/GifToApng').then(m => {
    const ApngToGif = () => <m.AnimationConverter defaultMode="apng-to-gif" />;
    return { default: ApngToGif };
  }), { ssr: false, loading: () => <DynamicImportFallback slug="apng-to-gif" /> }),
  'image-to-ico': dynamic(() => import('@/components/tools/modules/image/ImageToIco'), { ssr: false, loading: () => <DynamicImportFallback slug="image-to-ico" /> }),
  'qr-code-reader': dynamic(() => import('@/components/tools/modules/developer/QrCodeReader'), { ssr: false, loading: () => <DynamicImportFallback slug="qr-code-reader" /> }),
  'whois-lookup': dynamic(() => import('@/components/tools/modules/developer/WhoisLookup'), { ssr: false, loading: () => <DynamicImportFallback slug="whois-lookup" /> }),
  'ssl-checker': dynamic(() => import('@/components/tools/modules/developer/SslChecker'), { ssr: false, loading: () => <DynamicImportFallback slug="ssl-checker" /> }),
  'pdf-to-tiff': dynamic(() => import('@/components/tools/modules/pdf/PdfToTiff'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-to-tiff" /> }),
  'tiff-to-pdf': dynamic(() => import('@/components/tools/modules/pdf/TiffToPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="tiff-to-pdf" /> }),
  'font-converter': dynamic(() => import('@/components/tools/modules/design/FontConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="font-converter" /> }),
  'font-subsetter': dynamic(() => import('@/components/tools/modules/design/FontSubsetter'), { ssr: false, loading: () => <DynamicImportFallback slug="font-subsetter" /> }),
  'cbz-to-pdf': dynamic(() => import('@/components/tools/modules/converter/CbzToPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="cbz-to-pdf" /> }),
  'epub-to-pdf': dynamic(() => import('@/components/tools/modules/converter/EpubToPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="epub-to-pdf" /> }),


  'yaml-validator': dynamic(() => import('@/components/tools/modules/converter/DataFormatTools').then(m => ({ default: m.YamlValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="yaml-validator" /> }),
  'html-entity-encoder': dynamic(() => import('@/components/tools/modules/developer/EncoderDecoder').then(m => ({ default: m.EncoderDecoder })), { ssr: false, loading: () => <DynamicImportFallback slug="html-entity-encoder" /> }),
  'backslash-escape': dynamic(() => import('@/components/tools/modules/developer/EncoderDecoder').then(m => ({ default: m.EncoderDecoder })), { ssr: false, loading: () => <DynamicImportFallback slug="backslash-escape" /> }),
  'url-encoder-decoder': dynamic(() => import('@/components/tools/modules/developer/EncoderDecoder').then(m => ({ default: m.EncoderDecoder })), { ssr: false, loading: () => <DynamicImportFallback slug="url-encoder-decoder" /> }),
  'line-sorter': dynamic(() => import('@/components/tools/modules/utility/LineSorter'), { ssr: false, loading: () => <DynamicImportFallback slug="line-sorter" /> }),
  'url-parser': dynamic(() => import('@/components/tools/modules/developer/UrlParser'), { ssr: false, loading: () => <DynamicImportFallback slug="url-parser" /> }),
  'string-inspector': dynamic(() => import('@/components/tools/modules/developer/StringInspector'), { ssr: false, loading: () => <DynamicImportFallback slug="string-inspector" /> }),

  'code-beautifier': dynamic(() => import('@/components/tools/modules/developer/CodeFormatter'), { ssr: false, loading: () => <DynamicImportFallback slug="code-beautifier" /> }),
  'php-tools': dynamic(() => import('@/components/tools/modules/developer/PhpTools'), { ssr: false, loading: () => <DynamicImportFallback slug="php-tools" /> }),
  'jwt-debugger': dynamic(() => import('@/components/tools/modules/developer/JwtDebugger'), { ssr: false, loading: () => <DynamicImportFallback slug="jwt-debugger" /> }),
  'html-preview': dynamic(() => import('@/components/tools/modules/developer/HtmlPreview'), { ssr: false, loading: () => <DynamicImportFallback slug="html-preview" /> }),
  'cron-parser': dynamic(() => import('@/components/tools/modules/developer/CronParser'), { ssr: false, loading: () => <DynamicImportFallback slug="cron-parser" /> }),
  'aes-encrypt': dynamic(() => import('@/components/tools/modules/developer/CryptoHashTools').then(m => ({ default: m.AesEncrypt })), { ssr: false, loading: () => <DynamicImportFallback slug="aes-encrypt" /> }),
  'crypto-kit': dynamic(() => import('@/components/tools/modules/developer/CryptoKit'), { ssr: false, loading: () => <DynamicImportFallback slug="crypto-kit" /> }),
  'ip-address-converter': dynamic(() => import('@/components/tools/modules/developer/NetworkToolkitWidgets').then(m => ({ default: m.IpAddressConverter })), { ssr: false, loading: () => <DynamicImportFallback slug="ip-address-converter" /> }),
  'ip-range-expander': dynamic(() => import('@/components/tools/modules/developer/NetworkToolkitWidgets').then(m => ({ default: m.IpRangeExpander })), { ssr: false, loading: () => <DynamicImportFallback slug="ip-range-expander" /> }),
  'ipv6-ula-generator': dynamic(() => import('@/components/tools/modules/developer/NetworkToolkitWidgets').then(m => ({ default: m.Ipv6UlaGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="ipv6-ula-generator" /> }),
  'web-inspector': dynamic(() => import('@/components/tools/modules/developer/WebInspector'), { ssr: false, loading: () => <DynamicImportFallback slug="web-inspector" /> }),
  'eta-calculator': dynamic(() => import('@/components/tools/modules/calculator/MathToolsWidgets').then(m => ({ default: m.EtaCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="eta-calculator" /> }),
  'random-port-generator': dynamic(() => import('@/components/tools/modules/utility/RandomPortGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="random-port-generator" /> }),
  'chmod-calculator': dynamic(() => import('@/components/tools/modules/developer/ChmodCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="chmod-calculator" /> }),
  'docker-run-to-compose': dynamic(() => import('@/components/tools/modules/developer/DockerRunToCompose'), { ssr: false, loading: () => <DynamicImportFallback slug="docker-run-to-compose" /> }),
  'email-normalizer': dynamic(() => import('@/components/tools/modules/developer/EmailNormalizer'), { ssr: false, loading: () => <DynamicImportFallback slug="email-normalizer" /> }),
  'yaml-reindenter': dynamic(() => import('@/components/tools/modules/developer/CodeFormatter').then(m => ({ default: m.YamlFormatter })), { ssr: false, loading: () => <DynamicImportFallback slug="yaml-reindenter" /> }),
  'phone-parser': dynamic(() => import('@/components/tools/modules/utility/OtherUtilitiesWidgets').then(m => ({ default: m.PhoneParser })), { ssr: false, loading: () => <DynamicImportFallback slug="phone-parser" /> }),
  'otp-generator': dynamic(() => import('@/components/tools/modules/utility/OtherUtilitiesWidgets').then(m => ({ default: m.OTPGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="otp-generator" /> }),
  'slugify-tool': dynamic(() => import('@/components/tools/modules/utility/OtherUtilitiesWidgets').then(m => ({ default: m.SlugifyTool })), { ssr: false, loading: () => <DynamicImportFallback slug="slugify-tool" /> }),
  'ulid-generator': dynamic(() => import('@/components/tools/modules/utility/MiniGeneratorsWidgets').then(m => ({ default: m.ULIDGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="ulid-generator" /> }),
  'numeronym-generator': dynamic(() => import('@/components/tools/modules/utility/MiniGeneratorsWidgets').then(m => ({ default: m.NumeronymGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="numeronym-generator" /> }),
  'mac-vendor-lookup': dynamic(() => import('@/components/tools/modules/utility/MiniGeneratorsWidgets').then(m => ({ default: m.MACVendorLookup })), { ssr: false, loading: () => <DynamicImportFallback slug="mac-vendor-lookup" /> }),
  'list-converter': dynamic(() => import('@/components/tools/modules/utility/ListConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="list-converter" /> }),
  'rsa-key-generator': dynamic(() => import('@/components/tools/modules/developer/RsaKeyGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="rsa-key-generator" /> }),
  'emoji-picker': dynamic(() => import('@/components/tools/modules/utility/CreativeToolsWidgets').then(m => ({ default: m.EmojiPicker })), { ssr: false, loading: () => <DynamicImportFallback slug="emoji-picker" /> }),
  'ascii-art-generator': dynamic(() => import('@/components/tools/modules/utility/CreativeToolsWidgets').then(m => ({ default: m.ASCIIArtGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="ascii-art-generator" /> }),
  'ascii-font-generator': dynamic(() => import('@/components/tools/modules/utility/CreativeToolsWidgets').then(m => ({ default: m.ASCIIFontGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="ascii-font-generator" /> }),
  'benchmark-builder': dynamic(() => import('@/components/tools/modules/utility/BenchmarkBuilder'), { ssr: false, loading: () => <DynamicImportFallback slug="benchmark-builder" /> }),
  'pdf-to-png': dynamic(() => import('@/components/tools/modules/pdf/PdfToPng'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-to-png" /> }),
  'create-pdf': dynamic(() => import('@/components/tools/modules/pdf/CreatePdf'), { ssr: false, loading: () => <DynamicImportFallback slug="create-pdf" /> }),
  'pdf-info': dynamic(() => import('@/components/tools/modules/pdf/PdfInfo'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-info" /> }),
  'pdf-cleanup': dynamic(() => import('@/components/tools/modules/pdf/PdfCleanup'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-cleanup" /> }),
  'pdf-bates-numbering': dynamic(() => import('@/components/tools/modules/pdf/PdfBatesNumbering'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-bates-numbering" /> }),
  'pdf-stamp': dynamic(() => import('@/components/tools/modules/pdf/PdfStamp'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-stamp" /> }),
  'pdf-timestamp': dynamic(() => import('@/components/tools/modules/pdf/PdfTimestamp'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-timestamp" /> }),
  'pdf-table-of-contents': dynamic(() => import('@/components/tools/modules/pdf/PdfTableOfContents'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-table-of-contents" /> }),
  'pdf-background-color': dynamic(() => import('@/components/tools/modules/pdf/PdfToolkitWidgets').then(m => ({ default: m.PdfBackgroundColor })), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-background-color" /> }),
  'pdf-add-blank-page': dynamic(() => import('@/components/tools/modules/pdf/PdfToolkitWidgets').then(m => ({ default: m.PdfAddBlankPage })), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-add-blank-page" /> }),
  'pdf-advanced': dynamic(() => import('@/components/tools/modules/pdf/PdfAdvanced'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-advanced" /> }),
  'pdf-attachments': dynamic(() => import('@/components/tools/modules/pdf/PdfAttachments'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-attachments" /> }),

  'glassmorphism-generator': dynamic(() => import('@/components/tools/modules/design/CssGenerators').then(m => { const W = () => <m.default defaultMode="glassmorphism" />; return { default: W }; }), { ssr: false, loading: () => <DynamicImportFallback slug="glassmorphism-generator" /> }),
  'neumorphism-generator': dynamic(() => import('@/components/tools/modules/design/CssGenerators').then(m => { const W = () => <m.default defaultMode="neumorphism" />; return { default: W }; }), { ssr: false, loading: () => <DynamicImportFallback slug="neumorphism-generator" /> }),
  'css-specificity-calculator': dynamic(() => import('@/components/tools/modules/developer/CssKit').then(m => ({ default: m.CssSpecificityCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="css-specificity-calculator" /> }),
  'css-validator': dynamic(() => import('@/components/tools/modules/developer/CssKit').then(m => ({ default: m.CssValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="css-validator" /> }),
  'code-obfuscator': dynamic(() => import('@/components/tools/modules/developer/CodeKit').then(m => ({ default: m.CodeObfuscator })), { ssr: false, loading: () => <DynamicImportFallback slug="code-obfuscator" /> }),
  'code-to-curl-parser': dynamic(() => import('@/components/tools/modules/developer/CodeKit').then(m => ({ default: m.CodeToCurlParser })), { ssr: false, loading: () => <DynamicImportFallback slug="code-to-curl-parser" /> }),
  'js-syntax-checker': dynamic(() => import('@/components/tools/modules/developer/CodeKit').then(m => ({ default: m.JsSyntaxChecker })), { ssr: false, loading: () => <DynamicImportFallback slug="js-syntax-checker" /> }),
  'pug-to-html-converter': dynamic(() => import('@/components/tools/modules/developer/CodeKit').then(m => ({ default: m.PugToHtml })), { ssr: false, loading: () => <DynamicImportFallback slug="pug-to-html-converter" /> }),
  'api-request-builder': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.ApiRequestBuilder })), { ssr: false, loading: () => <DynamicImportFallback slug="api-request-builder" /> }),
  'api-tester': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.ApiTester })), { ssr: false, loading: () => <DynamicImportFallback slug="api-tester" /> }),
  'api-response-formatter': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.ApiResponseFormatter })), { ssr: false, loading: () => <DynamicImportFallback slug="api-response-formatter" /> }),
  'api-error-decoder': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.ApiErrorDecoder })), { ssr: false, loading: () => <DynamicImportFallback slug="api-error-decoder" /> }),
  'api-payload-analyzer': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.ApiPayloadAnalyzer })), { ssr: false, loading: () => <DynamicImportFallback slug="api-payload-analyzer" /> }),
  'api-mock-data-generator': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.ApiMockDataGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="api-mock-data-generator" /> }),
  'api-mock-server-config': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.ApiMockServerConfig })), { ssr: false, loading: () => <DynamicImportFallback slug="api-mock-server-config" /> }),
  'mock-api-response-generator': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.MockApiResponseGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="mock-api-response-generator" /> }),
  'api-latency-budget': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.ApiLatencyBudget })), { ssr: false, loading: () => <DynamicImportFallback slug="api-latency-budget" /> }),
  'api-pagination-calculator': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.ApiPaginationCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="api-pagination-calculator" /> }),
  'api-key-generator': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.ApiKeyGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="api-key-generator" /> }),
  'api-key-hasher': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.ApiKeyHasher })), { ssr: false, loading: () => <DynamicImportFallback slug="api-key-hasher" /> }),
  'api-key-validator': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.ApiKeyValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="api-key-validator" /> }),
  'api-cost-estimator': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.ApiCostEstimator })), { ssr: false, loading: () => <DynamicImportFallback slug="api-cost-estimator" /> }),
  'api-gateway-rate-calculator': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.ApiGatewayRateCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="api-gateway-rate-calculator" /> }),
  'api-rate-limiter-calculator': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.ApiRateLimiterCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="api-rate-limiter-calculator" /> }),
  'api-changelog-generator': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.ApiChangelogGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="api-changelog-generator" /> }),
  'api-documentation-generator': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.ApiDocumentationGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="api-documentation-generator" /> }),
  'rest-endpoint-documenter': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.RestEndpointDocumenter })), { ssr: false, loading: () => <DynamicImportFallback slug="rest-endpoint-documenter" /> }),
  'graphql-cost-estimator': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.GraphqlCostEstimator })), { ssr: false, loading: () => <DynamicImportFallback slug="graphql-cost-estimator" /> }),
  'graphql-query-formatter': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.GraphqlQueryFormatter })), { ssr: false, loading: () => <DynamicImportFallback slug="graphql-query-formatter" /> }),
  'graphql-schema-to-json-schema': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.GraphqlSchemaToJsonSchema })), { ssr: false, loading: () => <DynamicImportFallback slug="graphql-schema-to-json-schema" /> }),
  'graphql-schema-validator': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.GraphqlSchemaValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="graphql-schema-validator" /> }),
  'graphql-subscription-builder': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.GraphqlSubscriptionBuilder })), { ssr: false, loading: () => <DynamicImportFallback slug="graphql-subscription-builder" /> }),
  'graphql-tester': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.GraphqlTester })), { ssr: false, loading: () => <DynamicImportFallback slug="graphql-tester" /> }),
  'graphql-variables-formatter': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.GraphqlVariablesFormatter })), { ssr: false, loading: () => <DynamicImportFallback slug="graphql-variables-formatter" /> }),
  'grpc-status-code-lookup': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.GrpcStatusCodeLookup })), { ssr: false, loading: () => <DynamicImportFallback slug="grpc-status-code-lookup" /> }),
  'soap-api-tester': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.SoapApiTester })), { ssr: false, loading: () => <DynamicImportFallback slug="soap-api-tester" /> }),
  'openapi-mock-generator': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.OpenapiMockGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="openapi-mock-generator" /> }),
  'openapi-to-postman': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.OpenapiToPostman })), { ssr: false, loading: () => <DynamicImportFallback slug="openapi-to-postman" /> }),
  'openapi-validator': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.OpenapiValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="openapi-validator" /> }),
  'postman-collection-generator': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.PostmanCollectionGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="postman-collection-generator" /> }),
  'postman-to-openapi-converter': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.PostmanToOpenapiConverter })), { ssr: false, loading: () => <DynamicImportFallback slug="postman-to-openapi-converter" /> }),
  'swagger-openapi-generator': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.SwaggerOpenapiGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="swagger-openapi-generator" /> }),
  'webhook-payload-generator': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.WebhookPayloadGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="webhook-payload-generator" /> }),
  'webhook-retry-config': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.WebhookRetryConfig })), { ssr: false, loading: () => <DynamicImportFallback slug="webhook-retry-config" /> }),
  'webhook-signature-verifier': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.WebhookSignatureVerifier })), { ssr: false, loading: () => <DynamicImportFallback slug="webhook-signature-verifier" /> }),
  'webhook-tester': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.WebhookTester })), { ssr: false, loading: () => <DynamicImportFallback slug="webhook-tester" /> }),
  'webhook-validator': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.WebhookValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="webhook-validator" /> }),
  'api-diff-checker': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.ApiDiffChecker })), { ssr: false, loading: () => <DynamicImportFallback slug="api-diff-checker" /> }),
  'api-docs-generator': dynamic(() => import('@/components/tools/modules/ApiTools').then(m => ({ default: m.ApiDocsGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="api-docs-generator" /> }),
  // DataToolkit — promoted widgets
  'column-extractor': dynamic(() => import('@/components/tools/modules/utility/DataToolkitWidgets').then(m => ({ default: m.ColumnExtractor })), { ssr: false, loading: () => <DynamicImportFallback slug="column-extractor" /> }),
  'column-renamer': dynamic(() => import('@/components/tools/modules/utility/DataToolkitWidgets').then(m => ({ default: m.ColumnRenamer })), { ssr: false, loading: () => <DynamicImportFallback slug="column-renamer" /> }),
  'data-type-converter': dynamic(() => import('@/components/tools/modules/utility/DataToolkitWidgets').then(m => ({ default: m.DataTypeConverter })), { ssr: false, loading: () => <DynamicImportFallback slug="data-type-converter" /> }),
  'deduplicator': dynamic(() => import('@/components/tools/modules/utility/DataToolkitWidgets').then(m => ({ default: m.Deduplicator })), { ssr: false, loading: () => <DynamicImportFallback slug="deduplicator" /> }),
  'format-validator': dynamic(() => import('@/components/tools/modules/utility/DataToolkitWidgets').then(m => ({ default: m.FormatValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="format-validator" /> }),
  'csv-merger': dynamic(() => import('@/components/tools/modules/utility/DataToolkitWidgets').then(m => ({ default: m.CsvMerger })), { ssr: false, loading: () => <DynamicImportFallback slug="csv-merger" /> }),
  'null-value-handler': dynamic(() => import('@/components/tools/modules/utility/DataToolkitWidgets').then(m => ({ default: m.NullValueHandler })), { ssr: false, loading: () => <DynamicImportFallback slug="null-value-handler" /> }),
  'pivot-generator': dynamic(() => import('@/components/tools/modules/utility/DataToolkitWidgets').then(m => ({ default: m.PivotGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="pivot-generator" /> }),
  'row-filter': dynamic(() => import('@/components/tools/modules/utility/DataToolkitWidgets').then(m => ({ default: m.RowFilter })), { ssr: false, loading: () => <DynamicImportFallback slug="row-filter" /> }),
  'csv-row-sorter': dynamic(() => import('@/components/tools/modules/utility/DataToolkitWidgets').then(m => ({ default: m.Sorter })), { ssr: false, loading: () => <DynamicImportFallback slug="csv-row-sorter" /> }),
  'csv-splitter': dynamic(() => import('@/components/tools/modules/utility/DataToolkitWidgets').then(m => ({ default: m.Splitter })), { ssr: false, loading: () => <DynamicImportFallback slug="csv-splitter" /> }),
  'csv-transpose': dynamic(() => import('@/components/tools/modules/utility/DataToolkitWidgets').then(m => ({ default: m.Transpose })), { ssr: false, loading: () => <DynamicImportFallback slug="csv-transpose" /> }),
  'json-escape-unescape': dynamic(() => import('@/components/tools/modules/utility/DataToolkitWidgets').then(m => ({ default: m.JsonEscapeUnescape })), { ssr: false, loading: () => <DynamicImportFallback slug="json-escape-unescape" /> }),
  'merge-patch-generator': dynamic(() => import('@/components/tools/modules/utility/DataToolkitWidgets').then(m => ({ default: m.MergePatchGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="merge-patch-generator" /> }),
  'jwk-generator': dynamic(() => import('@/components/tools/modules/utility/DataToolkitWidgets').then(m => ({ default: m.JwkGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="jwk-generator" /> }),
  'jsonl-formatter': dynamic(() => import('@/components/tools/modules/utility/DataToolkitWidgets').then(m => ({ default: m.JsonlFormatter })), { ssr: false, loading: () => <DynamicImportFallback slug="jsonl-formatter" /> }),
  'csv-json-row-generator': dynamic(() => import('@/components/tools/modules/utility/DataToolkitWidgets').then(m => ({ default: m.CsvJsonRowGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="csv-json-row-generator" /> }),
  'csv-analyzer': dynamic(() => import('@/components/tools/modules/developer/DataUtilitiesWidgets').then(m => ({ default: m.CsvAnalyzer })), { ssr: false, loading: () => <DynamicImportFallback slug="csv-analyzer" /> }),
  'json-path-query-builder': dynamic(() => import('@/components/tools/modules/developer/DataUtilitiesWidgets').then(m => ({ default: m.JsonPathQueryBuilder })), { ssr: false, loading: () => <DynamicImportFallback slug="json-path-query-builder" /> }),
  'json-tree-viewer': dynamic(() => import('@/components/tools/modules/developer/DataUtilitiesWidgets').then(m => ({ default: m.JsonTreeViewer })), { ssr: false, loading: () => <DynamicImportFallback slug="json-tree-viewer" /> }),
  'json-diff-checker': dynamic(() => import('@/components/tools/modules/developer/JSONDiffChecker'), { ssr: false, loading: () => <DynamicImportFallback slug="json-diff-checker" /> }),
  'validator-kit': dynamic(() => import('@/components/tools/modules/developer/ValidatorKit'), { ssr: false, loading: () => <DynamicImportFallback slug="validator-kit" /> }),
  'html-linter': dynamic(() => import('@/components/tools/modules/developer/ValidatorKitWidgets').then(m => ({ default: m.HtmlLinter })), { ssr: false, loading: () => <DynamicImportFallback slug="html-linter" /> }),
  'xml-minifier-validator': dynamic(() => import('@/components/tools/modules/developer/ValidatorKitWidgets').then(m => ({ default: m.XmlMinifierValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="xml-minifier-validator" /> }),
  'cidr-calculator': dynamic(() => import('@/components/tools/modules/developer/MiscUtilitiesKitWidgets').then(m => ({ default: m.CidrCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="cidr-calculator" /> }),
  'aws-iam-policy-analyzer': dynamic(() => import('@/components/tools/modules/developer/MiscUtilitiesKitWidgets').then(m => ({ default: m.AwsIamPolicyAnalyzer })), { ssr: false, loading: () => <DynamicImportFallback slug="aws-iam-policy-analyzer" /> }),
  'oauth-client-setup': dynamic(() => import('@/components/tools/modules/developer/SecurityToolkitWidgets').then(m => ({ default: m.OauthClientSetup })), { ssr: false, loading: () => <DynamicImportFallback slug="oauth-client-setup" /> }),
  'pkce-verifier': dynamic(() => import('@/components/tools/modules/developer/SecurityToolkitWidgets').then(m => ({ default: m.PkceVerifier })), { ssr: false, loading: () => <DynamicImportFallback slug="pkce-verifier" /> }),
  'oauth-scope-builder': dynamic(() => import('@/components/tools/modules/developer/SecurityToolkitWidgets').then(m => ({ default: m.OAuthScopeBuilder })), { ssr: false, loading: () => <DynamicImportFallback slug="oauth-scope-builder" /> }),
  'oauth-state-validator': dynamic(() => import('@/components/tools/modules/developer/SecurityToolkitWidgets').then(m => ({ default: m.OAuthStateValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="oauth-state-validator" /> }),
  'pbkdf2-hash-generator': dynamic(() => import('@/components/tools/modules/developer/SecurityToolkitWidgets').then(m => ({ default: m.Pbkdf2HashGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="pbkdf2-hash-generator" /> }),
  'cookie-parser': dynamic(() => import('@/components/tools/modules/developer/SecurityToolkitWidgets').then(m => ({ default: m.CookieParser })), { ssr: false, loading: () => <DynamicImportFallback slug="cookie-parser" /> }),
  'study-time-calculator': dynamic(() => import('@/components/tools/modules/calculator/CalcFileKitWidgets').then(m => ({ default: m.StudyTimeCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="study-time-calculator" /> }),
  'test-score-calculator': dynamic(() => import('@/components/tools/modules/calculator/CalcFileKitWidgets').then(m => ({ default: m.TestScoreCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="test-score-calculator" /> }),
  'words-per-page-calculator': dynamic(() => import('@/components/tools/modules/calculator/CalcFileKitWidgets').then(m => ({ default: m.WordsPerPageCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="words-per-page-calculator" /> }),
  'profit-loss-calculator': dynamic(() => import('@/components/tools/modules/calculator/CalcFileKitWidgets').then(m => ({ default: m.ProfitLossCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="profit-loss-calculator" /> }),
  'ring-size-converter': dynamic(() => import('@/components/tools/modules/calculator/CalcFileKitWidgets').then(m => ({ default: m.RingSizeConverter })), { ssr: false, loading: () => <DynamicImportFallback slug="ring-size-converter" /> }),
  'screen-size-converter': dynamic(() => import('@/components/tools/modules/calculator/CalcFileKitWidgets').then(m => ({ default: m.ScreenSizeConverter })), { ssr: false, loading: () => <DynamicImportFallback slug="screen-size-converter" /> }),
  'zip-file-extractor': dynamic(() => import('@/components/tools/modules/calculator/CalcFileKitWidgets').then(m => ({ default: m.ZipFileExtractor })), { ssr: false, loading: () => <DynamicImportFallback slug="zip-file-extractor" /> }),
  'base32-encoder': dynamic(() => import('@/components/tools/modules/developer/ConverterToolkitWidgets').then(m => ({ default: m.Base32Encoder })), { ssr: false, loading: () => <DynamicImportFallback slug="base32-encoder" /> }),
  'base64-json-decoder': dynamic(() => import('@/components/tools/modules/developer/ConverterToolkitWidgets').then(m => ({ default: m.Base64ToJsonDecoder })), { ssr: false, loading: () => <DynamicImportFallback slug="base64-json-decoder" /> }),
  'svg-base64-converter': dynamic(() => import('@/components/tools/modules/developer/ConverterToolkitWidgets').then(m => ({ default: m.SvgToBase64Converter })), { ssr: false, loading: () => <DynamicImportFallback slug="svg-base64-converter" /> }),
  'character-encoding-converter': dynamic(() => import('@/components/tools/modules/developer/ConverterToolkitWidgets').then(m => ({ default: m.CharacterEncodingConverter })), { ssr: false, loading: () => <DynamicImportFallback slug="character-encoding-converter" /> }),
  'unicode-converter': dynamic(() => import('@/components/tools/modules/developer/ConverterToolkitWidgets').then(m => ({ default: m.UnicodeConverter })), { ssr: false, loading: () => <DynamicImportFallback slug="unicode-converter" /> }),
  'markdown-slack-converter': dynamic(() => import('@/components/tools/modules/developer/ConverterToolkitWidgets').then(m => ({ default: m.MarkdownToSlackConverter })), { ssr: false, loading: () => <DynamicImportFallback slug="markdown-slack-converter" /> }),
  'px-rem-converter': dynamic(() => import('@/components/tools/modules/developer/ConverterToolkitWidgets').then(m => ({ default: m.PxRemConverter })), { ssr: false, loading: () => <DynamicImportFallback slug="px-rem-converter" /> }),
  'svg-optimizer': dynamic(() => import('@/components/tools/modules/developer/ConverterToolkitWidgets').then(m => ({ default: m.SvgOptimizer })), { ssr: false, loading: () => <DynamicImportFallback slug="svg-optimizer" /> }),
  'proto-schema-converter': dynamic(() => import('@/components/tools/modules/developer/StyleCodeKitWidgets').then(m => ({ default: m.ProtoSchemaConverter })), { ssr: false, loading: () => <DynamicImportFallback slug="proto-schema-converter" /> }),
  'protobuf-decoder': dynamic(() => import('@/components/tools/modules/developer/StyleCodeKitWidgets').then(m => ({ default: m.ProtobufDecoder })), { ssr: false, loading: () => <DynamicImportFallback slug="protobuf-decoder" /> }),
  'tsconfig-analyzer': dynamic(() => import('@/components/tools/modules/developer/StyleCodeKitWidgets').then(m => ({ default: m.TsconfigAnalyzer })), { ssr: false, loading: () => <DynamicImportFallback slug="tsconfig-analyzer" /> }),
  'typescript-formatter': dynamic(() => import('@/components/tools/modules/developer/StyleCodeKitWidgets').then(m => ({ default: m.TypeScriptFormatter })), { ssr: false, loading: () => <DynamicImportFallback slug="typescript-formatter" /> }),
  'string-template-tester': dynamic(() => import('@/components/tools/modules/developer/StyleCodeKitWidgets').then(m => ({ default: m.StringTemplateTester })), { ssr: false, loading: () => <DynamicImportFallback slug="string-template-tester" /> }),
  'test-data-generator': dynamic(() => import('@/components/tools/modules/developer/StyleCodeKitWidgets').then(m => ({ default: m.TestDataGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="test-data-generator" /> }),
  'color-palette-generator': dynamic(() => import('@/components/tools/modules/design/ColorAndStyleKitWidgets').then(m => ({ default: m.ColorPaletteGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="color-palette-generator" /> }),
  'color-shades-tints': dynamic(() => import('@/components/tools/modules/design/ColorAndStyleKitWidgets').then(m => ({ default: m.ColorShadesTints })), { ssr: false, loading: () => <DynamicImportFallback slug="color-shades-tints" /> }),
  'contrast-ratio-checker': dynamic(() => import('@/components/tools/modules/design/ColorAndStyleKitWidgets').then(m => ({ default: m.ContrastRatioChecker })), { ssr: false, loading: () => <DynamicImportFallback slug="contrast-ratio-checker" /> }),
  'media-query-generator': dynamic(() => import('@/components/tools/modules/design/ColorAndStyleKitWidgets').then(m => ({ default: m.MediaQueryGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="media-query-generator" /> }),
  'conventional-commit-generator': dynamic(() => import('@/components/tools/modules/design/ColorAndStyleKitWidgets').then(m => ({ default: m.ConventionalCommitGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="conventional-commit-generator" /> }),
  'markdown-table-generator': dynamic(() => import('@/components/tools/modules/design/ColorAndStyleKitWidgets').then(m => ({ default: m.MarkdownTableGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="markdown-table-generator" /> }),
  'nginx-config-generator': dynamic(() => import('@/components/tools/modules/design/ColorAndStyleKitWidgets').then(m => ({ default: m.NginxConfigGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="nginx-config-generator" /> }),
  'ip-allowlist-generator': dynamic(() => import('@/components/tools/modules/design/ColorAndStyleKitWidgets').then(m => ({ default: m.IpAllowlistGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="ip-allowlist-generator" /> }),
  'msgpack-inspector': dynamic(() => import('@/components/tools/modules/developer/FormatAndDataKitWidgets').then(m => ({ default: m.MessagePackInspector })), { ssr: false, loading: () => <DynamicImportFallback slug="msgpack-inspector" /> }),
  'cbor-inspector': dynamic(() => import('@/components/tools/modules/developer/FormatAndDataKitWidgets').then(m => ({ default: m.CborInspector })), { ssr: false, loading: () => <DynamicImportFallback slug="cbor-inspector" /> }),
  'data-anonymizer': dynamic(() => import('@/components/tools/modules/developer/FormatAndDataKitWidgets').then(m => ({ default: m.DataAnonymizer })), { ssr: false, loading: () => <DynamicImportFallback slug="data-anonymizer" /> }),
  'curl-to-code-converter': dynamic(() => import('@/components/tools/modules/developer/FormatAndDataKitWidgets').then(m => ({ default: m.CurlToCodeConverter })), { ssr: false, loading: () => <DynamicImportFallback slug="curl-to-code-converter" /> }),
  'jsonrpc-builder': dynamic(() => import('@/components/tools/modules/developer/FormatAndDataKitWidgets').then(m => ({ default: m.JsonRpcBuilder })), { ssr: false, loading: () => <DynamicImportFallback slug="jsonrpc-builder" /> }),
  'har-analyzer': dynamic(() => import('@/components/tools/modules/developer/FormatAndDataKitWidgets').then(m => ({ default: m.HarAnalyzer })), { ssr: false, loading: () => <DynamicImportFallback slug="har-analyzer" /> }),
  'log-analyzer': dynamic(() => import('@/components/tools/modules/developer/FormatAndDataKitWidgets').then(m => ({ default: m.LogAnalyzer })), { ssr: false, loading: () => <DynamicImportFallback slug="log-analyzer" /> }),
  'package-json-validator': dynamic(() => import('@/components/tools/modules/developer/FormatAndDataKitWidgets').then(m => ({ default: m.PackageJsonValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="package-json-validator" /> }),
  'mime-finder': dynamic(() => import('@/components/tools/modules/developer/FormatAndDataKitWidgets').then(m => ({ default: m.MimeFinder })), { ssr: false, loading: () => <DynamicImportFallback slug="mime-finder" /> }),
  'calorie-tracker': dynamic(() => import('@/components/tools/modules/health/HealthTools').then(m => ({ default: m.CalorieTracker })), { ssr: false, loading: () => <DynamicImportFallback slug="calorie-tracker" /> }),
  'waist-to-hip-ratio-calculator': dynamic(() => import('@/components/tools/modules/health/HealthTools').then(m => ({ default: m.WaistToHipRatioCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="waist-to-hip-ratio-calculator" /> }),

  'border-css-generator': dynamic(() => import('@/components/tools/modules/design/CssGenerators').then(m => { const W = () => <m.default defaultMode="border-css" />; return { default: W }; }), { ssr: false, loading: () => <DynamicImportFallback slug="border-css-generator" /> }),
  'typography-preview': dynamic(() => import('@/components/tools/modules/design/TypographyPreview'), { ssr: false, loading: () => <DynamicImportFallback slug="typography-preview" /> }),
  'color-blindness-simulator': dynamic(() => import('@/components/tools/modules/design/ColorBlindnessSimulator'), { ssr: false, loading: () => <DynamicImportFallback slug="color-blindness-simulator" /> }),
  'secret-scanner': dynamic(() => import('@/components/tools/modules/developer/SecurityWidgets').then(m => ({ default: m.SecretScanner })), { ssr: false, loading: () => <DynamicImportFallback slug="secret-scanner" /> }),
  'security-txt-generator': dynamic(() => import('@/components/tools/modules/developer/SecurityWidgets').then(m => ({ default: m.SecurityTxtGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="security-txt-generator" /> }),
  'robots-txt-validator': dynamic(() => import('@/components/tools/modules/developer/SecurityWidgets').then(m => ({ default: m.RobotsTxtValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="robots-txt-validator" /> }),
  'dns-record-validator': dynamic(() => import('@/components/tools/modules/developer/SecurityWidgets').then(m => ({ default: m.DnsRecordValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="dns-record-validator" /> }),
  'docker-compose-validator': dynamic(() => import('@/components/tools/modules/developer/ConfigValidatorWidgets').then(m => ({ default: m.DockerComposeValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="docker-compose-validator" /> }),
  'dockerfile-linter': dynamic(() => import('@/components/tools/modules/developer/ConfigValidatorWidgets').then(m => ({ default: m.DockerfileLinter })), { ssr: false, loading: () => <DynamicImportFallback slug="dockerfile-linter" /> }),
  'htaccess-validator': dynamic(() => import('@/components/tools/modules/developer/ConfigValidatorWidgets').then(m => ({ default: m.HtaccessValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="htaccess-validator" /> }),
  'kubernetes-yaml-validator': dynamic(() => import('@/components/tools/modules/developer/ConfigValidatorWidgets').then(m => ({ default: m.KubernetesYamlValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="kubernetes-yaml-validator" /> }),
  'github-actions-validator': dynamic(() => import('@/components/tools/modules/developer/ConfigValidatorWidgets').then(m => ({ default: m.GithubActionsValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="github-actions-validator" /> }),
  'geojson-validator': dynamic(() => import('@/components/tools/modules/developer/ConfigValidatorWidgets').then(m => ({ default: m.GeoJsonValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="geojson-validator" /> }),
  'rss-feed-validator': dynamic(() => import('@/components/tools/modules/developer/ConfigValidatorWidgets').then(m => ({ default: m.RssFeedValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="rss-feed-validator" /> }),
  'sitemap-validator': dynamic(() => import('@/components/tools/modules/developer/ConfigValidatorWidgets').then(m => ({ default: m.SitemapValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="sitemap-validator" /> }),
  'xpath-validator': dynamic(() => import('@/components/tools/modules/developer/ConfigValidatorWidgets').then(m => ({ default: m.XpathValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="xpath-validator" /> }),
  'cron-expression-validator': dynamic(() => import('@/components/tools/modules/developer/ConfigValidatorWidgets').then(m => ({ default: m.CronExpressionValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="cron-expression-validator" /> }),
  'random-date-generator': dynamic(() => import('@/components/tools/modules/utility/GeneratorWidgets').then(m => ({ default: m.RandomDateGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="random-date-generator" /> }),
  'random-time-generator': dynamic(() => import('@/components/tools/modules/utility/GeneratorWidgets').then(m => ({ default: m.RandomTimeGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="random-time-generator" /> }),
  'random-ip-generator': dynamic(() => import('@/components/tools/modules/utility/GeneratorWidgets').then(m => ({ default: m.RandomIpGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="random-ip-generator" /> }),
  'random-user-agent-generator': dynamic(() => import('@/components/tools/modules/utility/GeneratorWidgets').then(m => ({ default: m.RandomUserAgentGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="random-user-agent-generator" /> }),
  'random-sentence-generator': dynamic(() => import('@/components/tools/modules/utility/GeneratorWidgets').then(m => ({ default: m.RandomSentenceGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="random-sentence-generator" /> }),
  'random-word-generator': dynamic(() => import('@/components/tools/modules/utility/GeneratorWidgets').then(m => ({ default: m.RandomWordGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="random-word-generator" /> }),
  'pin-generator': dynamic(() => import('@/components/tools/modules/utility/GeneratorWidgets').then(m => ({ default: m.PinGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="pin-generator" /> }),
  'license-key-generator': dynamic(() => import('@/components/tools/modules/utility/GeneratorWidgets').then(m => ({ default: m.LicenseKeyGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="license-key-generator" /> }),
  'image-placeholder-generator': dynamic(() => import('@/components/tools/modules/utility/GeneratorWidgets').then(m => ({ default: m.ImagePlaceholderGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="image-placeholder-generator" /> }),
  'logo-placeholder-generator': dynamic(() => import('@/components/tools/modules/utility/GeneratorWidgets').then(m => ({ default: m.LogoPlaceholderGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="logo-placeholder-generator" /> }),
  'open-graph-generator': dynamic(() => import('@/components/tools/modules/utility/GeneratorWidgets').then(m => ({ default: m.OpenGraphGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="open-graph-generator" /> }),
  'oauth-pkce-generator': dynamic(() => import('@/components/tools/modules/utility/GeneratorWidgets').then(m => ({ default: m.OauthPkceGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="oauth-pkce-generator" /> }),
  'http-header-analyzer': dynamic(() => import('@/components/tools/modules/developer/ConfigTools').then(m => ({ default: m.HttpHeaderAnalyzer })), { ssr: false, loading: () => <DynamicImportFallback slug="http-header-analyzer" /> }),

  'http-headers-generator': dynamic(() => import('@/components/tools/modules/developer/ConfigTools').then(m => ({ default: m.HttpHeadersGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="http-headers-generator" /> }),
  'http-cache-header-generator': dynamic(() => import('@/components/tools/modules/developer/ConfigTools').then(m => ({ default: m.HttpCacheHeaderGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="http-cache-header-generator" /> }),
  'http-status-code-checker': dynamic(() => import('@/components/tools/modules/developer/ConfigTools').then(m => ({ default: m.HttpStatusCodeChecker })), { ssr: false, loading: () => <DynamicImportFallback slug="http-status-code-checker" /> }),
  'eslint-config-generator': dynamic(() => import('@/components/tools/modules/developer/ConfigTools').then(m => ({ default: m.EslintConfigGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="eslint-config-generator" /> }),
  'http-retry-policy-builder': dynamic(() => import('@/components/tools/modules/developer/ConfigTools').then(m => ({ default: m.HttpRetryPolicyBuilder })), { ssr: false, loading: () => <DynamicImportFallback slug="http-retry-policy-builder" /> }),
  'port-number-lookup': dynamic(() => import('@/components/tools/modules/developer/DevUtilityWidgets').then(m => ({ default: m.PortNumberLookup })), { ssr: false, loading: () => <DynamicImportFallback slug="port-number-lookup" /> }),
  'user-agent-parser': dynamic(() => import('@/components/tools/modules/developer/DevUtilityWidgets').then(m => ({ default: m.UserAgentParser })), { ssr: false, loading: () => <DynamicImportFallback slug="user-agent-parser" /> }),
  'query-string-parser': dynamic(() => import('@/components/tools/modules/developer/DevUtilityWidgets').then(m => ({ default: m.QueryStringParser })), { ssr: false, loading: () => <DynamicImportFallback slug="query-string-parser" /> }),
  'sse-event-formatter': dynamic(() => import('@/components/tools/modules/developer/DevUtilityWidgets').then(m => ({ default: m.SseEventFormatter })), { ssr: false, loading: () => <DynamicImportFallback slug="sse-event-formatter" /> }),
  'rate-limit-header-parser': dynamic(() => import('@/components/tools/modules/developer/DevUtilityWidgets').then(m => ({ default: m.RateLimitHeaderParser })), { ssr: false, loading: () => <DynamicImportFallback slug="rate-limit-header-parser" /> }),
  'pricing-tier-builder': dynamic(() => import('@/components/tools/modules/developer/DevUtilityWidgets').then(m => ({ default: m.PricingTierBuilder })), { ssr: false, loading: () => <DynamicImportFallback slug="pricing-tier-builder" /> }),
  'ssh-key-generator': dynamic(() => import('@/components/tools/modules/developer/SshKeyGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="ssh-key-generator" /> }),

  'code-formatter': dynamic(() => import('@/components/tools/modules/developer/CodeFormatter'), { ssr: false, loading: () => <DynamicImportFallback slug="code-formatter" /> }),
  'html-formatter': dynamic(() => import('@/components/tools/modules/developer/CodeFormatter').then(m => ({ default: m.HtmlFormatter })), { ssr: false, loading: () => <DynamicImportFallback slug="html-formatter" /> }),
  'css-formatter': dynamic(() => import('@/components/tools/modules/developer/CodeFormatter').then(m => ({ default: m.CssFormatter })), { ssr: false, loading: () => <DynamicImportFallback slug="css-formatter" /> }),
  'javascript-formatter': dynamic(() => import('@/components/tools/modules/developer/CodeFormatter').then(m => ({ default: m.JavascriptFormatter })), { ssr: false, loading: () => <DynamicImportFallback slug="javascript-formatter" /> }),
  'jsx-formatter': dynamic(() => import('@/components/tools/modules/developer/CodeFormatter').then(m => ({ default: m.JsxFormatter })), { ssr: false, loading: () => <DynamicImportFallback slug="jsx-formatter" /> }),
  'tsx-formatter': dynamic(() => import('@/components/tools/modules/developer/CodeFormatter').then(m => ({ default: m.TsxFormatter })), { ssr: false, loading: () => <DynamicImportFallback slug="tsx-formatter" /> }),
  'scss-formatter': dynamic(() => import('@/components/tools/modules/developer/CodeFormatter').then(m => ({ default: m.ScssFormatter })), { ssr: false, loading: () => <DynamicImportFallback slug="scss-formatter" /> }),
  'python-formatter': dynamic(() => import('@/components/tools/modules/developer/CodeFormatter').then(m => ({ default: m.PythonFormatter })), { ssr: false, loading: () => <DynamicImportFallback slug="python-formatter" /> }),
  'yaml-formatter': dynamic(() => import('@/components/tools/modules/developer/CodeFormatter').then(m => ({ default: m.YamlFormatter })), { ssr: false, loading: () => <DynamicImportFallback slug="yaml-formatter" /> }),
  'xml-formatter': dynamic(() => import('@/components/tools/modules/developer/CodeFormatter').then(m => ({ default: m.XmlFormatter })), { ssr: false, loading: () => <DynamicImportFallback slug="xml-formatter" /> }),
  'markdown-formatter': dynamic(() => import('@/components/tools/modules/developer/CodeFormatter').then(m => ({ default: m.MarkdownFormatter })), { ssr: false, loading: () => <DynamicImportFallback slug="markdown-formatter" /> }),
  'css-generator': dynamic(() => import('@/components/tools/modules/design/CssGenerators'), { ssr: false, loading: () => <DynamicImportFallback slug="css-generator" /> }),
  'box-shadow-generator': dynamic(() => import('@/components/tools/modules/design/CssGenerators').then(m => { const W = () => <m.default defaultMode="box-shadow" />; return { default: W }; }), { ssr: false, loading: () => <DynamicImportFallback slug="box-shadow-generator" /> }),
  'border-radius-generator': dynamic(() => import('@/components/tools/modules/design/CssGenerators').then(m => { const W = () => <m.default defaultMode="border-radius" />; return { default: W }; }), { ssr: false, loading: () => <DynamicImportFallback slug="border-radius-generator" /> }),
  'flexbox-css-generator': dynamic(() => import('@/components/tools/modules/design/CssGenerators').then(m => { const W = () => <m.default defaultMode="flexbox" />; return { default: W }; }), { ssr: false, loading: () => <DynamicImportFallback slug="flexbox-css-generator" /> }),
  'css-grid-generator': dynamic(() => import('@/components/tools/modules/design/CssGenerators').then(m => { const W = () => <m.default defaultMode="grid" />; return { default: W }; }), { ssr: false, loading: () => <DynamicImportFallback slug="css-grid-generator" /> }),
  'text-shadow-generator': dynamic(() => import('@/components/tools/modules/design/CssGenerators').then(m => { const W = () => <m.default defaultMode="text-shadow" />; return { default: W }; }), { ssr: false, loading: () => <DynamicImportFallback slug="text-shadow-generator" /> }),
  'css-transform-generator': dynamic(() => import('@/components/tools/modules/design/CssGenerators').then(m => { const W = () => <m.default defaultMode="transform" />; return { default: W }; }), { ssr: false, loading: () => <DynamicImportFallback slug="css-transform-generator" /> }),
  'css-animation-generator': dynamic(() => import('@/components/tools/modules/design/CssGenerators').then(m => { const W = () => <m.default defaultMode="animation" />; return { default: W }; }), { ssr: false, loading: () => <DynamicImportFallback slug="css-animation-generator" /> }),
  'css-filter-generator': dynamic(() => import('@/components/tools/modules/design/CssGenerators').then(m => { const W = () => <m.default defaultMode="filter" />; return { default: W }; }), { ssr: false, loading: () => <DynamicImportFallback slug="css-filter-generator" /> }),
  'password-entropy-calculator': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.PasswordEntropyCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="password-entropy-calculator" /> }),
  'two-factor-auth-generator': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.TwoFactorAuthGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="two-factor-auth-generator" /> }),
  'brute-force-time-estimator': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.BruteForceTimeEstimator })), { ssr: false, loading: () => <DynamicImportFallback slug="brute-force-time-estimator" /> }),
  'hash-verifier': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.HashVerifier })), { ssr: false, loading: () => <DynamicImportFallback slug="hash-verifier" /> }),
  'hash-password-generator': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.HashPasswordGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="hash-password-generator" /> }),
  'hash-file-generator': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.HashFileGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="hash-file-generator" /> }),
  'hmac-generator': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.HmacGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="hmac-generator" /> }),
  'ssl-tls-checker': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.SslTlsChecker })), { ssr: false, loading: () => <DynamicImportFallback slug="ssl-tls-checker" /> }),
  'http-security-checker': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.HttpSecurityChecker })), { ssr: false, loading: () => <DynamicImportFallback slug="http-security-checker" /> }),
  'jwt-inspector': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.JwtInspector })), { ssr: false, loading: () => <DynamicImportFallback slug="jwt-inspector" /> }),
  'content-security-policy-generator': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.ContentSecurityPolicyGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="content-security-policy-generator" /> }),
  'subnet-calculator': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.SubnetCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="subnet-calculator" /> }),
  'subnet-visualizer': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.SubnetVisualizer })), { ssr: false, loading: () => <DynamicImportFallback slug="subnet-visualizer" /> }),
  'dns-lookup-generator': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.DnsLookupGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="dns-lookup-generator" /> }),
  'cors-inspector': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.CorsInspector })), { ssr: false, loading: () => <DynamicImportFallback slug="cors-inspector" /> }),
  'cors-header-generator': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.CorsHeaderGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="cors-header-generator" /> }),
  'syntax-validator': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.Validator })), { ssr: false, loading: () => <DynamicImportFallback slug="syntax-validator" /> }),
  'yaml-syntax-validator': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.YamlValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="yaml-syntax-validator" /> }),
  'env-file-generator': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.EnvFileGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="env-file-generator" /> }),
  'env-file-parser': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.EnvFileParser })), { ssr: false, loading: () => <DynamicImportFallback slug="env-file-parser" /> }),
  'cve-lookup': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.CveLookup })), { ssr: false, loading: () => <DynamicImportFallback slug="cve-lookup" /> }),
  'sql-injection-detector': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.SqlInjectionDetector })), { ssr: false, loading: () => <DynamicImportFallback slug="sql-injection-detector" /> }),
  'xss-protection-checker': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.XssProtectionChecker })), { ssr: false, loading: () => <DynamicImportFallback slug="xss-protection-checker" /> }),
  'csrf-token-generator': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.CsrfTokenGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="csrf-token-generator" /> }),
  'oauth2-debugger': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.Oauth2Debugger })), { ssr: false, loading: () => <DynamicImportFallback slug="oauth2-debugger" /> }),
  'saml-decoder': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.SamlDecoder })), { ssr: false, loading: () => <DynamicImportFallback slug="saml-decoder" /> }),
  'csp-policy-validator': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.CspValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="csp-policy-validator" /> }),
  'tls-cipher-checker': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.TlsCipherChecker })), { ssr: false, loading: () => <DynamicImportFallback slug="tls-cipher-checker" /> }),
  'ip-reputation-checker': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.IpReputationChecker })), { ssr: false, loading: () => <DynamicImportFallback slug="ip-reputation-checker" /> }),
  'url-sanitizer': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.UrlSanitizer })), { ssr: false, loading: () => <DynamicImportFallback slug="url-sanitizer" /> }),
  'email-format-validator': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.EmailValidator })), { ssr: false, loading: () => <DynamicImportFallback slug="email-format-validator" /> }),
  'ssl-certificate-decoder': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.SslCertificateDecoder })), { ssr: false, loading: () => <DynamicImportFallback slug="ssl-certificate-decoder" /> }),
  'subdomain-finder': dynamic(() => import('@/components/tools/modules/developer/SecurityTools').then(m => ({ default: m.SubdomainFinder })), { ssr: false, loading: () => <DynamicImportFallback slug="subdomain-finder" /> }),

  'encoder-decoder': dynamic(() => import('@/components/tools/modules/developer/EncoderDecoder').then(m => ({ default: m.EncoderDecoder })), { ssr: false, loading: () => <DynamicImportFallback slug="encoder-decoder" /> }),

  // Generators
  'random-number-generator': dynamic(() => import('@/components/tools/modules/utility/Generators').then(m => ({ default: m.RandomNumberGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="random-number-generator" /> }),
  'random-string-generator': dynamic(() => import('@/components/tools/modules/utility/Generators').then(m => ({ default: m.RandomStringGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="random-string-generator" /> }),
  'random-color-generator': dynamic(() => import('@/components/tools/modules/utility/Generators').then(m => ({ default: m.RandomColorGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="random-color-generator" /> }),
  'random-team-generator': dynamic(() => import('@/components/tools/modules/utility/Generators').then(m => ({ default: m.RandomTeamGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="random-team-generator" /> }),
  'random-picker-generator': dynamic(() => import('@/components/tools/modules/utility/Generators').then(m => ({ default: m.RandomPickerGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="random-picker-generator" /> }),
  'random-decision-maker': dynamic(() => import('@/components/tools/modules/utility/Generators').then(m => ({ default: m.RandomDecisionMaker })), { ssr: false, loading: () => <DynamicImportFallback slug="random-decision-maker" /> }),
  'random-username-generator': dynamic(() => import('@/components/tools/modules/utility/Generators').then(m => ({ default: m.RandomUsernameGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="random-username-generator" /> }),
  'random-token-generator': dynamic(() => import('@/components/tools/modules/utility/Generators').then(m => ({ default: m.RandomTokenGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="random-token-generator" /> }),
  'lorem-ipsum-generator': dynamic(() => import('@/components/tools/modules/utility/Generators').then(m => ({ default: m.LoremIpsumGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="lorem-ipsum-generator" /> }),
  'dummy-text-generator': dynamic(() => import('@/components/tools/modules/utility/Generators').then(m => ({ default: m.DummyTextGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="dummy-text-generator" /> }),
  'fake-data-generator': dynamic(() => import('@/components/tools/modules/utility/Generators').then(m => ({ default: m.FakeDataGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="fake-data-generator" /> }),
  'fake-identity-generator': dynamic(() => import('@/components/tools/modules/utility/Generators').then(m => ({ default: m.FakeIdentityGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="fake-identity-generator" /> }),
  'fake-credit-card-generator': dynamic(() => import('@/components/tools/modules/utility/Generators').then(m => ({ default: m.FakeCreditCardGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="fake-credit-card-generator" /> }),
  'sequence-generator': dynamic(() => import('@/components/tools/modules/utility/Generators').then(m => ({ default: m.SequenceGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="sequence-generator" /> }),
  'barcode-generator': dynamic(() => import('@/components/tools/modules/utility/Generators').then(m => ({ default: m.BarcodeGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="barcode-generator" /> }),
  'qr-code-generator': dynamic(() => import('@/components/tools/modules/utility/QrCodeGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="qr-code-generator" /> }),
  'coupon-code-generator': dynamic(() => import('@/components/tools/modules/utility/Generators').then(m => ({ default: m.CouponCodeGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="coupon-code-generator" /> }),
  'serial-number-generator': dynamic(() => import('@/components/tools/modules/utility/Generators').then(m => ({ default: m.SerialNumberGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="serial-number-generator" /> }),
  'nickname-generator': dynamic(() => import('@/components/tools/modules/utility/Generators').then(m => ({ default: m.NicknameGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="nickname-generator" /> }),
  'avatar-generator': dynamic(() => import('@/components/tools/modules/utility/Generators').then(m => ({ default: m.AvatarGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="avatar-generator" /> }),

  // Timers
  'timer': dynamic(() => import('@/components/tools/modules/productivity/Timers').then(m => ({ default: m.Timer })), { ssr: false, loading: () => <DynamicImportFallback slug="timer" /> }),
  'stopwatch': dynamic(() => import('@/components/tools/modules/productivity/Timers').then(m => ({ default: m.Stopwatch })), { ssr: false, loading: () => <DynamicImportFallback slug="stopwatch" /> }),
  'countdown-tool': dynamic(() => import('@/components/tools/modules/productivity/Timers').then(m => ({ default: m.CountdownTimer })), { ssr: false, loading: () => <DynamicImportFallback slug="countdown-tool" /> }),
  'pomodoro-timer': dynamic(() => import('@/components/tools/modules/productivity/Timers').then(m => ({ default: m.PomodoroTimer })), { ssr: false, loading: () => <DynamicImportFallback slug="pomodoro-timer" /> }),
  'interval-timer': dynamic(() => import('@/components/tools/modules/productivity/Timers').then(m => ({ default: m.IntervalTimer })), { ssr: false, loading: () => <DynamicImportFallback slug="interval-timer" /> }),
  'tabata-timer': dynamic(() => import('@/components/tools/modules/productivity/Timers').then(m => ({ default: m.TabataTimer })), { ssr: false, loading: () => <DynamicImportFallback slug="tabata-timer" /> }),
  'world-clock': dynamic(() => import('@/components/tools/modules/productivity/Timers').then(m => ({ default: m.WorldClock })), { ssr: false, loading: () => <DynamicImportFallback slug="world-clock" /> }),
  'time-duration-calculator': dynamic(() => import('@/components/tools/modules/productivity/Timers').then(m => ({ default: m.TimeDurationCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="time-duration-calculator" /> }),
  'time-addition-calculator': dynamic(() => import('@/components/tools/modules/productivity/Timers').then(m => ({ default: m.TimeAdditionCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="time-addition-calculator" /> }),
  'time-until-calculator': dynamic(() => import('@/components/tools/modules/productivity/Timers').then(m => ({ default: m.TimeUntilCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="time-until-calculator" /> }),
  'meeting-time-planner': dynamic(() => import('@/components/tools/modules/productivity/Timers').then(m => ({ default: m.MeetingTimePlanner })), { ssr: false, loading: () => <DynamicImportFallback slug="meeting-time-planner" /> }),

  // Text / SEO Tools
  'word-counter': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.WordCounter })), { ssr: false, loading: () => <DynamicImportFallback slug="word-counter" /> }),
  'character-counter': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.CharacterCounter })), { ssr: false, loading: () => <DynamicImportFallback slug="character-counter" /> }),
  'word-frequency-counter': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.WordFrequencyCounter })), { ssr: false, loading: () => <DynamicImportFallback slug="word-frequency-counter" /> }),
  'keyword-density-checker': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.KeywordDensityChecker })), { ssr: false, loading: () => <DynamicImportFallback slug="keyword-density-checker" /> }),
  'keyword-planner-tool': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.KeywordPlannerTool })), { ssr: false, loading: () => <DynamicImportFallback slug="keyword-planner-tool" /> }),
  'seo-meta-tag-generator': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.SeoMetaTagGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="seo-meta-tag-generator" /> }),
  'seo-preview-generator': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.SeoPreviewGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="seo-preview-generator" /> }),
  'seo-headline-analyzer': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.SeoHeadlineAnalyzer })), { ssr: false, loading: () => <DynamicImportFallback slug="seo-headline-analyzer" /> }),
  'seo-schema-generator': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.SeoSchemaGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="seo-schema-generator" /> }),
  'seo-slug-generator': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.SeoSlugGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="seo-slug-generator" /> }),
  'text-replacer': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.TextReplacer })), { ssr: false, loading: () => <DynamicImportFallback slug="text-replacer" /> }),
  'text-sorter': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.TextSorter })), { ssr: false, loading: () => <DynamicImportFallback slug="text-sorter" /> }),
  'text-deduplicator': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.TextDeduplicator })), { ssr: false, loading: () => <DynamicImportFallback slug="text-deduplicator" /> }),
  'markdown-previewer': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.MarkdownPreviewer })), { ssr: false, loading: () => <DynamicImportFallback slug="markdown-previewer" /> }),
  'duplicate-word-remover': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.DuplicateWordRemover })), { ssr: false, loading: () => <DynamicImportFallback slug="duplicate-word-remover" /> }),

  'text-cleaner': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.TextCleaner })), { ssr: false, loading: () => <DynamicImportFallback slug="text-cleaner" /> }),

  'text-splitter': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.TextSplitter })), { ssr: false, loading: () => <DynamicImportFallback slug="text-splitter" /> }),

  'trailing-space-remover': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.TrailingSpaceRemover })), { ssr: false, loading: () => <DynamicImportFallback slug="trailing-space-remover" /> }),

  'canonical-url-checker': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.CanonicalUrlChecker })), { ssr: false, loading: () => <DynamicImportFallback slug="canonical-url-checker" /> }),

  'breadcrumb-schema-generator': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.BreadcrumbSchemaGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="breadcrumb-schema-generator" /> }),

  'utm-builder': dynamic(() => import('@/components/tools/modules/seo/TextSeoTools').then(m => ({ default: m.UtmBuilder })), { ssr: false, loading: () => <DynamicImportFallback slug="utm-builder" /> }),
  // Miscellaneous Tools 1
  'color-picker': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.ColorPicker })), { ssr: false, loading: () => <DynamicImportFallback slug="color-picker" /> }),
  'gradient-generator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.GradientGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="gradient-generator" /> }),
  'counter-tool': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.CounterTool })), { ssr: false, loading: () => <DynamicImportFallback slug="counter-tool" /> }),
  'list-randomizer': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.ListRandomizer })), { ssr: false, loading: () => <DynamicImportFallback slug="list-randomizer" /> }),
  'list-sorter': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.ListSorter })), { ssr: false, loading: () => <DynamicImportFallback slug="list-sorter" /> }),

  'number-guessing-game': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.NumberGuessingGame })), { ssr: false, loading: () => <DynamicImportFallback slug="number-guessing-game" /> }),
  'rock-paper-scissors': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.RockPaperScissors })), { ssr: false, loading: () => <DynamicImportFallback slug="rock-paper-scissors" /> }),
  'hangman-game': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.HangmanGame })), { ssr: false, loading: () => <DynamicImportFallback slug="hangman-game" /> }),

  'percentage-difference-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.PercentageDifferenceCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="percentage-difference-calculator" /> }),
  'tip-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.TipCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="tip-calculator" /> }),
  'sales-tax-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.SalesTaxCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="sales-tax-calculator" /> }),
  'markup-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.MarkupCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="markup-calculator" /> }),
  'cagr-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.CAGRCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="cagr-calculator" /> }),
  'fraction-to-decimal-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.FractionToDecimalCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="fraction-to-decimal-calculator" /> }),
  'decimal-to-fraction-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.DecimalToFractionCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="decimal-to-fraction-calculator" /> }),

  'combination-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.CombinationCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="combination-calculator" /> }),
  'permutation-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.PermutationCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="permutation-calculator" /> }),
  'factorial-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.FactorialCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="factorial-calculator" /> }),
  'prime-number-checker': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.PrimeNumberChecker })), { ssr: false, loading: () => <DynamicImportFallback slug="prime-number-checker" /> }),
  'prime-factorization-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.PrimeFactorizationCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="prime-factorization-calculator" /> }),
  'greatest-common-factor-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.GreatestCommonFactorCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="greatest-common-factor-calculator" /> }),
  'least-common-multiple-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.LeastCommonMultipleCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="least-common-multiple-calculator" /> }),
  'modulo-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.ModuloCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="modulo-calculator" /> }),
  'logarithm-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.LogarithmCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="logarithm-calculator" /> }),
  'trigonometry-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.TrigonometryCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="trigonometry-calculator" /> }),
  'scientific-notation-converter': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.ScientificNotationConverter })), { ssr: false, loading: () => <DynamicImportFallback slug="scientific-notation-converter" /> }),
  'significant-figures-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.SignificantFiguresCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="significant-figures-calculator" /> }),
  'rounding-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.RoundingCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="rounding-calculator" /> }),
  'math-equation-solver': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.MathEquationSolver })), { ssr: false, loading: () => <DynamicImportFallback slug="math-equation-solver" /> }),
  'algebra-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.AlgebraCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="algebra-calculator" /> }),
  'geometry-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.GeometryCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="geometry-calculator" /> }),
  'coordinate-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.CoordinateCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="coordinate-calculator" /> }),
  'slope-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.SlopeCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="slope-calculator" /> }),
  'body-fat-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.BodyFatCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="body-fat-calculator" /> }),
  'calorie-intake-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.CalorieIntakeCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="calorie-intake-calculator" /> }),
  'macro-split-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.MacroSplitCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="macro-split-calculator" /> }),
  'sleep-requirement-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.SleepRequirementCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="sleep-requirement-calculator" /> }),
  'ideal-weight-calc': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.IdealWeightCalc })), { ssr: false, loading: () => <DynamicImportFallback slug="ideal-weight-calc" /> }),
  'steps-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.StepsCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="steps-calculator" /> }),
  'calories-burned-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.CaloriesBurnedCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="calories-burned-calculator" /> }),
  'blood-alcohol-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.BloodAlcoholCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="blood-alcohol-calculator" /> }),
  'ovulation-tracker': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.OvulationTracker })), { ssr: false, loading: () => <DynamicImportFallback slug="ovulation-tracker" /> }),

  'date-difference-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.DateDifferenceCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="date-difference-calculator" /> }),
  'date-addition-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.DateAdditionCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="date-addition-calculator" /> }),
  'week-number-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.WeekNumberCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="week-number-calculator" /> }),
  'time-since-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.TimeSinceCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="time-since-calculator" /> }),
  'daylight-saving-time-checker': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.DaylightSavingTimeChecker })), { ssr: false, loading: () => <DynamicImportFallback slug="daylight-saving-time-checker" /> }),
  'work-hours-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.WorkHoursCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="work-hours-calculator" /> }),
  'hours-minutes-calculator': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.HoursMinutesCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="hours-minutes-calculator" /> }),
  'minutes-to-hours-converter': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.MinutesToHoursConverter })), { ssr: false, loading: () => <DynamicImportFallback slug="minutes-to-hours-converter" /> }),

  'seconds-to-minutes-converter': dynamic(() => import('@/components/tools/modules/MiscellaneousTools1').then(m => ({ default: m.SecondsToMinutesConverter })), { ssr: false, loading: () => <DynamicImportFallback slug="seconds-to-minutes-converter" /> }),


  'acv-calculator': dynamic(() => import('@/components/tools/modules/utility/ExtraTools').then(m => ({ default: m.AnnualContractValueCalculator })), { ssr: false, loading: () => <DynamicImportFallback slug="acv-calculator" /> }),
  'ascii-table-generator': dynamic(() => import('@/components/tools/modules/utility/ExtraTools').then(m => ({ default: m.AsciiTableGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="ascii-table-generator" /> }),
  'git-commit-linter': dynamic(() => import('@/components/tools/modules/utility/ExtraTools').then(m => ({ default: m.GitCommitLinter })), { ssr: false, loading: () => <DynamicImportFallback slug="git-commit-linter" /> }),
  'gitignore-generator': dynamic(() => import('@/components/tools/modules/utility/ExtraTools').then(m => ({ default: m.GitignoreGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="gitignore-generator" /> }),
  'hours-to-minutes-converter': dynamic(() => import('@/components/tools/modules/utility/ExtraTools').then(m => ({ default: m.HoursToMinutesConverter })), { ssr: false, loading: () => <DynamicImportFallback slug="hours-to-minutes-converter" /> }),
  'saas-payback-period': dynamic(() => import('@/components/tools/modules/utility/ExtraTools').then(m => ({ default: m.SaasPaybackPeriod })), { ssr: false, loading: () => <DynamicImportFallback slug="saas-payback-period" /> }),
  'saas-quick-ratio': dynamic(() => import('@/components/tools/modules/utility/ExtraTools').then(m => ({ default: m.SaasQuickRatio })), { ssr: false, loading: () => <DynamicImportFallback slug="saas-quick-ratio" /> }),
  'saas-rule-of-40': dynamic(() => import('@/components/tools/modules/utility/ExtraTools').then(m => ({ default: m.SaasRuleOf40 })), { ssr: false, loading: () => <DynamicImportFallback slug="saas-rule-of-40" /> }),
  'swift-formatter': dynamic(() => import('@/components/tools/modules/utility/ExtraTools').then(m => ({ default: m.SwiftFormatter })), { ssr: false, loading: () => <DynamicImportFallback slug="swift-formatter" /> }),
  'pdf-to-txt': dynamic(() => import('@/components/tools/modules/utility/ExtraTools').then(m => ({ default: m.PdfToTxt })), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-to-txt" /> }),

  // Bulk tools
  'bulk-app-icon-generator': dynamic(() => import('@/components/tools/modules/image/BulkAppIconGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-app-icon-generator" /> }),
  'bulk-audio-converter': dynamic(() => import('@/components/tools/modules/audio/BulkAudioConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-audio-converter" /> }),
  'bulk-audio-normalizer': dynamic(() => import('@/components/tools/modules/audio/BulkAudioNormalizer'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-audio-normalizer" /> }),
  'bulk-csv-excel-to-json': dynamic(() => import('@/components/tools/modules/developer/BulkCsvExcelToJson'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-csv-excel-to-json" /> }),
  'bulk-ebook-converter': dynamic(() => import('@/components/tools/modules/converter/BulkEbookConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-ebook-converter" /> }),
  'bulk-exif-stripper-injector': dynamic(() => import('@/components/tools/modules/image/BulkExifStripperInjector'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-exif-stripper-injector" /> }),
  'bulk-face-anonymizer': dynamic(() => import('@/components/tools/modules/image/BulkFaceAnonymizer'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-face-anonymizer" /> }),
  'bulk-font-subsetter': dynamic(() => import('@/components/tools/modules/developer/BulkFontSubsetter'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-font-subsetter" /> }),
  'bulk-heic-to-jpg': dynamic(() => import('@/components/tools/modules/image/BulkHeicToJpg'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-heic-to-jpg" /> }),
  'bulk-image-compressor': dynamic(() => import('@/components/tools/modules/image/BulkImageCompressor'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-image-compressor" /> }),
  'bulk-image-resizer': dynamic(() => import('@/components/tools/modules/image/BulkImageResizer'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-image-resizer" /> }),
  'bulk-image-to-pdf': dynamic(() => import('@/components/tools/modules/pdf/BulkImageToPdf'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-image-to-pdf" /> }),
  'bulk-image-to-text-ocr': dynamic(() => import('@/components/tools/modules/image/BulkImageToTextOcr'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-image-to-text-ocr" /> }),
  'bulk-image-watermark': dynamic(() => import('@/components/tools/modules/image/BulkImageWatermark'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-image-watermark" /> }),
  'bulk-invoice-receipt-parser': dynamic(() => import('@/components/tools/modules/finance/BulkInvoiceReceiptParser'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-invoice-receipt-parser" /> }),
  'bulk-markdown-to-pdf-html': dynamic(() => import('@/components/tools/modules/converter/BulkMarkdownToPdfHtml'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-markdown-to-pdf-html" /> }),
  'bulk-pdf-data-extractor': dynamic(() => import('@/components/tools/modules/pdf/BulkPdfDataExtractor'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-pdf-data-extractor" /> }),
  'bulk-pdf-form-extractor': dynamic(() => import('@/components/tools/modules/pdf/BulkPdfFormExtractor'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-pdf-form-extractor" /> }),
  'bulk-pdf-merger': dynamic(() => import('@/components/tools/modules/pdf/BulkPdfMerger'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-pdf-merger" /> }),
  'bulk-pdf-size-reducer': dynamic(() => import('@/components/tools/modules/pdf/BulkPdfSizeReducer'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-pdf-size-reducer" /> }),
  'bulk-pdf-suite': dynamic(() => import('@/components/tools/modules/pdf/BulkPdfSuite'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-pdf-suite" /> }),
  'bulk-qr-code-generator': dynamic(() => import('@/components/tools/modules/utility/BulkQrCodeGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-qr-code-generator" /> }),
  'bulk-regex-extractor-replacer': dynamic(() => import('@/components/tools/modules/developer/BulkRegexExtractorReplacer'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-regex-extractor-replacer" /> }),
  'bulk-subtitle-time-shifter': dynamic(() => import('@/components/tools/modules/video/BulkSubtitleTimeShifter'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-subtitle-time-shifter" /> }),
  'bulk-svg-to-png': dynamic(() => import('@/components/tools/modules/image/BulkSvgToPng'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-svg-to-png" /> }),
  'bulk-url-status-checker': dynamic(() => import('@/components/tools/modules/seo/BulkUrlStatusChecker'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-url-status-checker" /> }),
  'bulk-url-shortener': dynamic(() => import('@/components/tools/modules/utility/BulkUrlShortener'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-url-shortener" /> }),
  'bulk-image-converter': dynamic(() => import('@/components/tools/modules/image/BulkImageConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="bulk-image-converter" /> }),

  // Converter modules
  'data-format-converter': dynamic(() => import('@/components/tools/modules/converter/DataConverter').then(m => ({ default: m.DataConverter })), { ssr: false, loading: () => <DynamicImportFallback slug="data-format-converter" /> }),
  'document-converter': dynamic(() => import('@/components/tools/modules/converter/DocumentConverter').then(m => ({ default: m.DocumentConverter })), { ssr: false, loading: () => <DynamicImportFallback slug="document-converter" /> }),
  'xlsx-csv-converter': dynamic(() => import('@/components/tools/modules/converter/XlsxCsvConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="xlsx-csv-converter" /> }),
  'vcf-csv-converter': dynamic(() => import('@/components/tools/modules/utility/VcfCsvConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="vcf-csv-converter" /> }),
  'ics-csv-converter': dynamic(() => import('@/components/tools/modules/utility/IcsCsvConverter'), { ssr: false, loading: () => <DynamicImportFallback slug="ics-csv-converter" /> }),
  'json-to-code': dynamic(() => import('@/components/tools/modules/converter/JsonToCode'), { ssr: false, loading: () => <DynamicImportFallback slug="json-to-code" /> }),

  // CSV output hub (migrated from CONVERTER_CONFIG -> ConverterRouter; SSR kept,
  // so no ssr: false — the slug closure forwards slug, description stays undefined
  // to match the previous ConverterRouter render exactly).
  'csv-to-markdown': dynamic(() => import('@/components/tools/modules/shared/CsvHubConverter').then(m => ({ default: () => <m.default slug="csv-to-markdown" /> }))),
  'csv-to-ndjson': dynamic(() => import('@/components/tools/modules/shared/CsvHubConverter').then(m => ({ default: () => <m.default slug="csv-to-ndjson" /> }))),
  'csv-to-sql': dynamic(() => import('@/components/tools/modules/shared/CsvHubConverter').then(m => ({ default: () => <m.default slug="csv-to-sql" /> }))),
  'csv-html-table-converter': dynamic(() => import('@/components/tools/modules/shared/CsvHubConverter').then(m => ({ default: () => <m.default slug="csv-html-table-converter" /> }))),
  'csv-statistics': dynamic(() => import('@/components/tools/modules/shared/CsvHubConverter').then(m => ({ default: () => <m.default slug="csv-statistics" /> }))),
  'csv-data-cleaner': dynamic(() => import('@/components/tools/modules/shared/CsvHubConverter').then(m => ({ default: () => <m.default slug="csv-data-cleaner" /> }))),
  'csv-formatter': dynamic(() => import('@/components/tools/modules/shared/CsvHubConverter').then(m => ({ default: () => <m.default slug="csv-formatter" /> }))),

  // Document format hub (migrated from CONVERTER_CONFIG -> ConverterRouter; SSR kept,
  // so no ssr: false — DocumentFormatConverter destructures only slug, so description
  // being undefined matches the previous ConverterRouter render exactly).
  'word-to-pdf': dynamic(() => import('@/components/tools/modules/shared/DocumentFormatConverter').then(m => ({ default: () => <m.default slug="word-to-pdf" /> }))),
  'pdf-to-word': dynamic(() => import('@/components/tools/modules/shared/DocumentFormatConverter').then(m => ({ default: () => <m.default slug="pdf-to-word" /> }))),
  'excel-to-pdf': dynamic(() => import('@/components/tools/modules/shared/DocumentFormatConverter').then(m => ({ default: () => <m.default slug="excel-to-pdf" /> }))),
  'pdf-to-excel': dynamic(() => import('@/components/tools/modules/shared/DocumentFormatConverter').then(m => ({ default: () => <m.default slug="pdf-to-excel" /> }))),
  'ppt-to-pdf': dynamic(() => import('@/components/tools/modules/shared/DocumentFormatConverter').then(m => ({ default: () => <m.default slug="ppt-to-pdf" /> }))),
  'pdf-to-ppt': dynamic(() => import('@/components/tools/modules/shared/DocumentFormatConverter').then(m => ({ default: () => <m.default slug="pdf-to-ppt" /> }))),
  'jpg-to-pdf': dynamic(() => import('@/components/tools/modules/shared/DocumentFormatConverter').then(m => ({ default: () => <m.default slug="jpg-to-pdf" /> }))),
  'pdf-to-jpg': dynamic(() => import('@/components/tools/modules/shared/DocumentFormatConverter').then(m => ({ default: () => <m.default slug="pdf-to-jpg" /> }))),
  'html-to-pdf': dynamic(() => import('@/components/tools/modules/shared/DocumentFormatConverter').then(m => ({ default: () => <m.default slug="html-to-pdf" /> }))),
  'pdf-to-html': dynamic(() => import('@/components/tools/modules/shared/DocumentFormatConverter').then(m => ({ default: () => <m.default slug="pdf-to-html" /> }))),
  'pdf-to-epub': dynamic(() => import('@/components/tools/modules/shared/DocumentFormatConverter').then(m => ({ default: () => <m.default slug="pdf-to-epub" /> }))),
  'heic-to-pdf': dynamic(() => import('@/components/tools/modules/shared/DocumentFormatConverter').then(m => ({ default: () => <m.default slug="heic-to-pdf" /> }))),

  // Text transform hub (migrated from CONVERTER_CONFIG -> ConverterRouter; SSR kept,
  // so no ssr: false — TextTransformConverter destructures only slug, so description
  // being undefined matches the previous ConverterRouter render exactly).
  'text-tools': dynamic(() => import('@/components/tools/modules/shared/TextTransformConverter').then(m => ({ default: () => <m.default slug="text-tools" /> }))),
  'tailwind-to-css-converter': dynamic(() => import('@/components/tools/modules/shared/TextTransformConverter').then(m => ({ default: () => <m.default slug="tailwind-to-css-converter" /> }))),
  'svg-to-css': dynamic(() => import('@/components/tools/modules/shared/TextTransformConverter').then(m => ({ default: () => <m.default slug="svg-to-css" /> }))),
  'html-to-jsx': dynamic(() => import('@/components/tools/modules/shared/TextTransformConverter').then(m => ({ default: () => <m.default slug="html-to-jsx" /> }))),
  'code-to-curl-converter': dynamic(() => import('@/components/tools/modules/shared/TextTransformConverter').then(m => ({ default: () => <m.default slug="code-to-curl-converter" /> }))),
  'hex-text-converter': dynamic(() => import('@/components/tools/modules/shared/TextTransformConverter').then(m => ({ default: () => <m.default slug="hex-text-converter" /> }))),
  'hex-ascii-converter': dynamic(() => import('@/components/tools/modules/shared/TextTransformConverter').then(m => ({ default: () => <m.default slug="hex-ascii-converter" /> }))),
  'number-base-converter': dynamic(() => import('@/components/tools/modules/shared/TextTransformConverter').then(m => ({ default: () => <m.default slug="number-base-converter" /> }))),
  'case-converter': dynamic(() => import('@/components/tools/modules/shared/TextTransformConverter').then(m => ({ default: () => <m.default slug="case-converter" /> }))),
  'time-zone-converter': dynamic(() => import('@/components/tools/modules/shared/TextTransformConverter').then(m => ({ default: () => <m.default slug="time-zone-converter" /> }))),
  'unix-time-converter': dynamic(() => import('@/components/tools/modules/shared/TextTransformConverter').then(m => ({ default: () => <m.default slug="unix-time-converter" /> }))),

  // Unit converter hub (migrated from CONVERTER_CONFIG -> ConverterRouter; SSR kept,
  // so no ssr: false — UnitConverter destructures only slug, matching the previous
  // ConverterRouter render exactly).
  'length-converter': dynamic(() => import('@/components/tools/modules/shared/UnitConverter').then(m => ({ default: () => <m.default slug="length-converter" /> }))),
  'weight-converter': dynamic(() => import('@/components/tools/modules/shared/UnitConverter').then(m => ({ default: () => <m.default slug="weight-converter" /> }))),
  'volume-converter': dynamic(() => import('@/components/tools/modules/shared/UnitConverter').then(m => ({ default: () => <m.default slug="volume-converter" /> }))),
  'area-converter': dynamic(() => import('@/components/tools/modules/shared/UnitConverter').then(m => ({ default: () => <m.default slug="area-converter" /> }))),
  'speed-converter': dynamic(() => import('@/components/tools/modules/shared/UnitConverter').then(m => ({ default: () => <m.default slug="speed-converter" /> }))),
  'power-converter': dynamic(() => import('@/components/tools/modules/shared/UnitConverter').then(m => ({ default: () => <m.default slug="power-converter" /> }))),
  'pressure-converter': dynamic(() => import('@/components/tools/modules/shared/UnitConverter').then(m => ({ default: () => <m.default slug="pressure-converter" /> }))),
  'temperature-converter': dynamic(() => import('@/components/tools/modules/shared/UnitConverter').then(m => ({ default: () => <m.default slug="temperature-converter" /> }))),
  'time-converter': dynamic(() => import('@/components/tools/modules/shared/UnitConverter').then(m => ({ default: () => <m.default slug="time-converter" /> }))),
  'data-size-converter': dynamic(() => import('@/components/tools/modules/shared/UnitConverter').then(m => ({ default: () => <m.default slug="data-size-converter" /> }))),
  'cooking-measurement-converter': dynamic(() => import('@/components/tools/modules/shared/UnitConverter').then(m => ({ default: () => <m.default slug="cooking-measurement-converter" /> }))),
  'fuel-consumption-converter': dynamic(() => import('@/components/tools/modules/shared/UnitConverter').then(m => ({ default: () => <m.default slug="fuel-consumption-converter" /> }))),
  'paper-size-converter': dynamic(() => import('@/components/tools/modules/shared/UnitConverter').then(m => ({ default: () => <m.default slug="paper-size-converter" /> }))),
  'clothing-size-converter': dynamic(() => import('@/components/tools/modules/shared/UnitConverter').then(m => ({ default: () => <m.default slug="clothing-size-converter" /> }))),
  'shoe-size-converter': dynamic(() => import('@/components/tools/modules/shared/UnitConverter').then(m => ({ default: () => <m.default slug="shoe-size-converter" /> }))),
  'degree-radian-converter': dynamic(() => import('@/components/tools/modules/shared/UnitConverter').then(m => ({ default: () => <m.default slug="degree-radian-converter" /> }))),

  // JSON output hub (migrated from CONVERTER_CONFIG -> ConverterRouter; SSR kept,
  // so no ssr: false — JsonOutputConverter destructures only slug, matching the
  // previous ConverterRouter render exactly).
  'json-to-zod': dynamic(() => import('@/components/tools/modules/shared/JsonOutputConverter').then(m => ({ default: () => <m.default slug="json-to-zod" /> }))),
  'json-to-url-params': dynamic(() => import('@/components/tools/modules/shared/JsonOutputConverter').then(m => ({ default: () => <m.default slug="json-to-url-params" /> }))),
  'json-flattener': dynamic(() => import('@/components/tools/modules/shared/JsonOutputConverter').then(m => ({ default: () => <m.default slug="json-flattener" /> }))),
  'json-ld-generator': dynamic(() => import('@/components/tools/modules/shared/JsonOutputConverter').then(m => ({ default: () => <m.default slug="json-ld-generator" /> }))),
  'json-schema-generator': dynamic(() => import('@/components/tools/modules/shared/JsonOutputConverter').then(m => ({ default: () => <m.default slug="json-schema-generator" /> }))),
  'json-size-analyzer': dynamic(() => import('@/components/tools/modules/shared/JsonOutputConverter').then(m => ({ default: () => <m.default slug="json-size-analyzer" /> }))),
  'ndjson-to-json': dynamic(() => import('@/components/tools/modules/shared/JsonOutputConverter').then(m => ({ default: () => <m.default slug="ndjson-to-json" /> }))),
  'json-formatter-tool': dynamic(() => import('@/components/tools/modules/shared/JsonOutputConverter').then(m => ({ default: () => <m.default slug="json-formatter-tool" /> }))),

  // Format/serializer hub (migrated from CONVERTER_CONFIG -> ConverterRouter; SSR kept,
  // so no ssr: false — FormatSerializerHub destructures only slug, matching the previous
  // ConverterRouter render exactly. json-to-code stays a MODULE_REGISTRY slug below.)
  'yaml-json-converter': dynamic(() => import('@/components/tools/modules/shared/FormatSerializerHub').then(m => ({ default: () => <m.default slug="yaml-json-converter" /> }))),
  'json-to-yaml-converter': dynamic(() => import('@/components/tools/modules/shared/FormatSerializerHub').then(m => ({ default: () => <m.default slug="json-to-yaml-converter" /> }))),
  'ini-json-converter': dynamic(() => import('@/components/tools/modules/shared/FormatSerializerHub').then(m => ({ default: () => <m.default slug="ini-json-converter" /> }))),
  'json-to-ini-converter': dynamic(() => import('@/components/tools/modules/shared/FormatSerializerHub').then(m => ({ default: () => <m.default slug="json-to-ini-converter" /> }))),
  'toml-converter': dynamic(() => import('@/components/tools/modules/shared/FormatSerializerHub').then(m => ({ default: () => <m.default slug="toml-converter" /> }))),
  'json-to-toml-converter': dynamic(() => import('@/components/tools/modules/shared/FormatSerializerHub').then(m => ({ default: () => <m.default slug="json-to-toml-converter" /> }))),

  // CSS preprocessor hub (migrated from CONVERTER_CONFIG -> ConverterRouter; SSR kept,
  // so no ssr: false — CssPreprocessorHub destructures only slug, matching the previous
  // ConverterRouter render exactly).
  'css-to-scss-converter': dynamic(() => import('@/components/tools/modules/shared/CssPreprocessorHub').then(m => ({ default: () => <m.default slug="css-to-scss-converter" /> }))),
  'scss-to-css-converter': dynamic(() => import('@/components/tools/modules/shared/CssPreprocessorHub').then(m => ({ default: () => <m.default slug="scss-to-css-converter" /> }))),
  'less-to-css-converter': dynamic(() => import('@/components/tools/modules/shared/CssPreprocessorHub').then(m => ({ default: () => <m.default slug="less-to-css-converter" /> }))),
  'css-to-less-converter': dynamic(() => import('@/components/tools/modules/shared/CssPreprocessorHub').then(m => ({ default: () => <m.default slug="css-to-less-converter" /> }))),
  'stylus-to-css-converter': dynamic(() => import('@/components/tools/modules/shared/CssPreprocessorHub').then(m => ({ default: () => <m.default slug="stylus-to-css-converter" /> }))),
  'css-to-stylus-converter': dynamic(() => import('@/components/tools/modules/shared/CssPreprocessorHub').then(m => ({ default: () => <m.default slug="css-to-stylus-converter" /> }))),

  // Text-binary hub (migrated from CONVERTER_CONFIG -> ConverterRouter; SSR kept —
  // TextBinaryHub destructures only slug; note text-binary-converter renders the
  // default mode (text-to-binary), matching the previous ConverterRouter render).
  'binary-to-text': dynamic(() => import('@/components/tools/modules/shared/TextBinaryHub').then(m => ({ default: () => <m.default slug="binary-to-text" /> }))),
  'text-to-binary': dynamic(() => import('@/components/tools/modules/shared/TextBinaryHub').then(m => ({ default: () => <m.default slug="text-to-binary" /> }))),
  'text-binary-converter': dynamic(() => import('@/components/tools/modules/shared/TextBinaryHub').then(m => ({ default: () => <m.default slug="text-binary-converter" /> }))),

  // Color hub (migrated from CONVERTER_CONFIG -> ConverterRouter; SSR kept —
  // ColorConverter destructures only slug; every routed slug is a MODES entry).
  'color-converter': dynamic(() => import('@/components/tools/modules/shared/ColorConverter').then(m => ({ default: () => <m.default slug="color-converter" /> }))),
  'hex-to-rgb-converter': dynamic(() => import('@/components/tools/modules/shared/ColorConverter').then(m => ({ default: () => <m.default slug="hex-to-rgb-converter" /> }))),

  // Number hub (migrated from CONVERTER_CONFIG -> ConverterRouter; SSR kept —
  // NumberWordsConverter destructures only slug; roman-numeral-converter stays a
  // MODULE_REGISTRY slug, so only number-to-words-converter is routed here).
  'number-to-words-converter': dynamic(() => import('@/components/tools/modules/shared/NumberWordsConverter').then(m => ({ default: () => <m.default slug="number-to-words-converter" /> }))),

  // HTML-text hub (migrated from CONVERTER_CONFIG -> ConverterRouter; SSR kept —
  // HtmlTextHub destructures only slug and every routed slug is a MODES tab).
  'html-to-text-converter': dynamic(() => import('@/components/tools/modules/shared/HtmlTextHub').then(m => ({ default: () => <m.default slug="html-to-text-converter" /> }))),
  'text-to-html-converter': dynamic(() => import('@/components/tools/modules/shared/HtmlTextHub').then(m => ({ default: () => <m.default slug="text-to-html-converter" /> }))),

  // Text-style hub (migrated from CONVERTER_CONFIG -> ConverterRouter; SSR kept —
  // TextStylingConverter destructures only slug and renders one view per slug.
  // text-style-generator is not a CONVERTER_CONFIG entry and is not routed here).
  'fancy-text-generator': dynamic(() => import('@/components/tools/modules/shared/TextStylingConverter').then(m => ({ default: () => <m.default slug="fancy-text-generator" /> }))),
  'cursive-text-generator': dynamic(() => import('@/components/tools/modules/shared/TextStylingConverter').then(m => ({ default: () => <m.default slug="cursive-text-generator" /> }))),
  'zalgo-text-generator': dynamic(() => import('@/components/tools/modules/shared/TextStylingConverter').then(m => ({ default: () => <m.default slug="zalgo-text-generator" /> }))),

  // Import-to-CSV hub (migrated from CONVERTER_CONFIG -> ConverterRouter; SSR kept —
  // ImportToCsvConverter destructures only slug and every routed slug is a MODES
  // tab. xlsx/vcf/ics-csv-converter are separate MODULE_REGISTRY components and
  // are not routed here).
  'import-to-csv': dynamic(() => import('@/components/tools/modules/shared/ImportToCsvConverter').then(m => ({ default: () => <m.default slug="import-to-csv" /> }))),
  'tsv-csv-converter': dynamic(() => import('@/components/tools/modules/shared/ImportToCsvConverter').then(m => ({ default: () => <m.default slug="tsv-csv-converter" /> }))),

  // Data hub (migrated from CONVERTER_CONFIG -> ConverterRouter; SSR kept —
  // DataConverterFromSlug resolves each slug through SLUG_MAP. json-to-csv,
  // csv-to-json, json-to-xml, csv-to-xml are former TOOL_REDIRECTS sources
  // (Design B) now resolved as real per-pair pages).
  'xml-to-json': dynamic(() => import('@/components/tools/modules/converter/DataConverter').then(m => ({ default: () => <m.DataConverterFromSlug slug="xml-to-json" /> }))),
  'xml-to-csv': dynamic(() => import('@/components/tools/modules/converter/DataConverter').then(m => ({ default: () => <m.DataConverterFromSlug slug="xml-to-csv" /> }))),
  'json-to-xml': dynamic(() => import('@/components/tools/modules/converter/DataConverter').then(m => ({ default: () => <m.DataConverterFromSlug slug="json-to-xml" /> }))),
  'json-to-csv': dynamic(() => import('@/components/tools/modules/converter/DataConverter').then(m => ({ default: () => <m.DataConverterFromSlug slug="json-to-csv" /> }))),
  'csv-to-json': dynamic(() => import('@/components/tools/modules/converter/DataConverter').then(m => ({ default: () => <m.DataConverterFromSlug slug="csv-to-json" /> }))),
  'csv-to-xml': dynamic(() => import('@/components/tools/modules/converter/DataConverter').then(m => ({ default: () => <m.DataConverterFromSlug slug="csv-to-xml" /> }))),

  // Toon hub (migrated from CONVERTER_CONFIG -> ConverterRouter; SSR kept —
  // ToonConverter maps the slug to a JsonToonConverter initialMode. yaml-to-toon,
  // toon-to-json, toon-to-yaml are former TOOL_REDIRECTS sources (Design B) now
  // resolved as real per-pair pages with their own initialMode).
  'json-toon-converter': dynamic(() => import('@/components/tools/modules/converter/DataFormatTools').then(m => ({ default: () => <m.default slug="json-toon-converter" /> }))),
  'yaml-to-toon': dynamic(() => import('@/components/tools/modules/converter/DataFormatTools').then(m => ({ default: () => <m.default slug="yaml-to-toon" /> }))),
  'toon-to-json': dynamic(() => import('@/components/tools/modules/converter/DataFormatTools').then(m => ({ default: () => <m.default slug="toon-to-json" /> }))),
  'toon-to-yaml': dynamic(() => import('@/components/tools/modules/converter/DataFormatTools').then(m => ({ default: () => <m.default slug="toon-to-yaml" /> }))),

  // Video format hub (migrated from CONVERTER_CONFIG -> ConverterRouter; SSR kept —
  // VideoFormatConverter renders a per-tool info banner from the description prop, so
  // each closure passes HUB_DESCRIPTIONS[slug] to keep pre-migration HTML byte-identical).
  'video-converter': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="video-converter" description={HUB_DESCRIPTIONS['video-converter']} /> }))),
  'video-converter-tool': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="video-converter-tool" description={HUB_DESCRIPTIONS['video-converter-tool']} /> }))),
  'mkv-to-mp4': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="mkv-to-mp4" description={HUB_DESCRIPTIONS['mkv-to-mp4']} /> }))),
  'mov-to-mp4': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="mov-to-mp4" description={HUB_DESCRIPTIONS['mov-to-mp4']} /> }))),
  'webm-to-mp4': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="webm-to-mp4" description={HUB_DESCRIPTIONS['webm-to-mp4']} /> }))),
  'avi-to-mp4': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="avi-to-mp4" description={HUB_DESCRIPTIONS['avi-to-mp4']} /> }))),
  'mp4-to-mkv': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="mp4-to-mkv" description={HUB_DESCRIPTIONS['mp4-to-mkv']} /> }))),
  'mp4-to-mov': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="mp4-to-mov" description={HUB_DESCRIPTIONS['mp4-to-mov']} /> }))),
  'mkv-to-mov': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="mkv-to-mov" description={HUB_DESCRIPTIONS['mkv-to-mov']} /> }))),
  'mov-to-mkv': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="mov-to-mkv" description={HUB_DESCRIPTIONS['mov-to-mkv']} /> }))),
  'mkv-to-webm': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="mkv-to-webm" description={HUB_DESCRIPTIONS['mkv-to-webm']} /> }))),
  'mkv-to-avi': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="mkv-to-avi" description={HUB_DESCRIPTIONS['mkv-to-avi']} /> }))),
  'mp4-to-webm': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="mp4-to-webm" description={HUB_DESCRIPTIONS['mp4-to-webm']} /> }))),
  'mp4-to-avi': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="mp4-to-avi" description={HUB_DESCRIPTIONS['mp4-to-avi']} /> }))),
  'mov-to-webm': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="mov-to-webm" description={HUB_DESCRIPTIONS['mov-to-webm']} /> }))),
  'mov-to-avi': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="mov-to-avi" description={HUB_DESCRIPTIONS['mov-to-avi']} /> }))),
  'webm-to-mkv': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="webm-to-mkv" description={HUB_DESCRIPTIONS['webm-to-mkv']} /> }))),
  'webm-to-mov': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="webm-to-mov" description={HUB_DESCRIPTIONS['webm-to-mov']} /> }))),
  'webm-to-avi': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="webm-to-avi" description={HUB_DESCRIPTIONS['webm-to-avi']} /> }))),
  'avi-to-mkv': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="avi-to-mkv" description={HUB_DESCRIPTIONS['avi-to-mkv']} /> }))),
  'avi-to-mov': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="avi-to-mov" description={HUB_DESCRIPTIONS['avi-to-mov']} /> }))),
  'avi-to-webm': dynamic(() => import('@/components/tools/modules/shared/VideoFormatConverter').then(m => ({ default: () => <m.default slug="avi-to-webm" description={HUB_DESCRIPTIONS['avi-to-webm']} /> }))),

  // Video-to-audio hub (migrated from CONVERTER_CONFIG -> ConverterRouter; SSR kept —
  // VideoToAudioConverter renders a per-tool info banner from the description prop, so
  // each closure passes HUB_DESCRIPTIONS[slug] to keep pre-migration HTML byte-identical).
  'mp4-to-mp3': dynamic(() => import('@/components/tools/modules/shared/VideoToAudioConverter').then(m => ({ default: () => <m.default slug="mp4-to-mp3" description={HUB_DESCRIPTIONS['mp4-to-mp3']} /> }))),
  'mov-to-mp3': dynamic(() => import('@/components/tools/modules/shared/VideoToAudioConverter').then(m => ({ default: () => <m.default slug="mov-to-mp3" description={HUB_DESCRIPTIONS['mov-to-mp3']} /> }))),
  'webm-to-mp3': dynamic(() => import('@/components/tools/modules/shared/VideoToAudioConverter').then(m => ({ default: () => <m.default slug="webm-to-mp3" description={HUB_DESCRIPTIONS['webm-to-mp3']} /> }))),
  // Audio-format hub (migrated from CONVERTER_CONFIG -> ConverterRouter; SSR kept —
  // AudioFormatConverter renders a per-tool info banner from the description prop, so
  // each closure passes HUB_DESCRIPTIONS[slug] to keep pre-migration HTML byte-identical).
  'audio-converter': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="audio-converter" description={HUB_DESCRIPTIONS['audio-converter']} /> }))),

  'mp3-to-wav': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="mp3-to-wav" description={HUB_DESCRIPTIONS['mp3-to-wav']} /> }))),

  'wav-to-mp3': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="wav-to-mp3" description={HUB_DESCRIPTIONS['wav-to-mp3']} /> }))),

  'flac-to-mp3': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="flac-to-mp3" description={HUB_DESCRIPTIONS['flac-to-mp3']} /> }))),

  'ogg-to-mp3': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="ogg-to-mp3" description={HUB_DESCRIPTIONS['ogg-to-mp3']} /> }))),

  'm4a-to-mp3': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="m4a-to-mp3" description={HUB_DESCRIPTIONS['m4a-to-mp3']} /> }))),

  'aac-to-mp3': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="aac-to-mp3" description={HUB_DESCRIPTIONS['aac-to-mp3']} /> }))),

  'wma-to-mp3': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="wma-to-mp3" description={HUB_DESCRIPTIONS['wma-to-mp3']} /> }))),

  'opus-to-mp3': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="opus-to-mp3" description={HUB_DESCRIPTIONS['opus-to-mp3']} /> }))),

  'aiff-to-mp3': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="aiff-to-mp3" description={HUB_DESCRIPTIONS['aiff-to-mp3']} /> }))),

  'mp3-to-flac': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="mp3-to-flac" description={HUB_DESCRIPTIONS['mp3-to-flac']} /> }))),

  'mp3-to-ogg': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="mp3-to-ogg" description={HUB_DESCRIPTIONS['mp3-to-ogg']} /> }))),

  'mp3-to-m4a': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="mp3-to-m4a" description={HUB_DESCRIPTIONS['mp3-to-m4a']} /> }))),

  'mp3-to-aac': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="mp3-to-aac" description={HUB_DESCRIPTIONS['mp3-to-aac']} /> }))),

  'mp3-to-wma': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="mp3-to-wma" description={HUB_DESCRIPTIONS['mp3-to-wma']} /> }))),

  'mp3-to-opus': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="mp3-to-opus" description={HUB_DESCRIPTIONS['mp3-to-opus']} /> }))),

  'mp3-to-aiff': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="mp3-to-aiff" description={HUB_DESCRIPTIONS['mp3-to-aiff']} /> }))),

  'wav-to-flac': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="wav-to-flac" description={HUB_DESCRIPTIONS['wav-to-flac']} /> }))),

  'wav-to-ogg': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="wav-to-ogg" description={HUB_DESCRIPTIONS['wav-to-ogg']} /> }))),

  'wav-to-m4a': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="wav-to-m4a" description={HUB_DESCRIPTIONS['wav-to-m4a']} /> }))),

  'wav-to-aac': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="wav-to-aac" description={HUB_DESCRIPTIONS['wav-to-aac']} /> }))),

  'wav-to-wma': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="wav-to-wma" description={HUB_DESCRIPTIONS['wav-to-wma']} /> }))),

  'wav-to-opus': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="wav-to-opus" description={HUB_DESCRIPTIONS['wav-to-opus']} /> }))),

  'wav-to-aiff': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="wav-to-aiff" description={HUB_DESCRIPTIONS['wav-to-aiff']} /> }))),

  'flac-to-wav': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="flac-to-wav" description={HUB_DESCRIPTIONS['flac-to-wav']} /> }))),

  'flac-to-ogg': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="flac-to-ogg" description={HUB_DESCRIPTIONS['flac-to-ogg']} /> }))),

  'flac-to-m4a': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="flac-to-m4a" description={HUB_DESCRIPTIONS['flac-to-m4a']} /> }))),

  'flac-to-aac': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="flac-to-aac" description={HUB_DESCRIPTIONS['flac-to-aac']} /> }))),

  'ogg-to-wav': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="ogg-to-wav" description={HUB_DESCRIPTIONS['ogg-to-wav']} /> }))),

  'ogg-to-flac': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="ogg-to-flac" description={HUB_DESCRIPTIONS['ogg-to-flac']} /> }))),

  'ogg-to-m4a': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="ogg-to-m4a" description={HUB_DESCRIPTIONS['ogg-to-m4a']} /> }))),

  'ogg-to-aac': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="ogg-to-aac" description={HUB_DESCRIPTIONS['ogg-to-aac']} /> }))),

  'm4a-to-wav': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="m4a-to-wav" description={HUB_DESCRIPTIONS['m4a-to-wav']} /> }))),

  'm4a-to-flac': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="m4a-to-flac" description={HUB_DESCRIPTIONS['m4a-to-flac']} /> }))),

  'm4a-to-ogg': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="m4a-to-ogg" description={HUB_DESCRIPTIONS['m4a-to-ogg']} /> }))),

  'm4a-to-aac': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="m4a-to-aac" description={HUB_DESCRIPTIONS['m4a-to-aac']} /> }))),

  'aac-to-wav': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="aac-to-wav" description={HUB_DESCRIPTIONS['aac-to-wav']} /> }))),

  'aac-to-flac': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="aac-to-flac" description={HUB_DESCRIPTIONS['aac-to-flac']} /> }))),

  'aac-to-ogg': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="aac-to-ogg" description={HUB_DESCRIPTIONS['aac-to-ogg']} /> }))),

  'aac-to-m4a': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="aac-to-m4a" description={HUB_DESCRIPTIONS['aac-to-m4a']} /> }))),

  'aac-to-opus': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="aac-to-opus" description={HUB_DESCRIPTIONS['aac-to-opus']} /> }))),

  'aac-to-wma': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="aac-to-wma" description={HUB_DESCRIPTIONS['aac-to-wma']} /> }))),

  'aac-to-aiff': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="aac-to-aiff" description={HUB_DESCRIPTIONS['aac-to-aiff']} /> }))),

  'flac-to-wma': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="flac-to-wma" description={HUB_DESCRIPTIONS['flac-to-wma']} /> }))),

  'flac-to-opus': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="flac-to-opus" description={HUB_DESCRIPTIONS['flac-to-opus']} /> }))),

  'flac-to-aiff': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="flac-to-aiff" description={HUB_DESCRIPTIONS['flac-to-aiff']} /> }))),

  'ogg-to-wma': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="ogg-to-wma" description={HUB_DESCRIPTIONS['ogg-to-wma']} /> }))),

  'ogg-to-opus': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="ogg-to-opus" description={HUB_DESCRIPTIONS['ogg-to-opus']} /> }))),

  'ogg-to-aiff': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="ogg-to-aiff" description={HUB_DESCRIPTIONS['ogg-to-aiff']} /> }))),

  'm4a-to-wma': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="m4a-to-wma" description={HUB_DESCRIPTIONS['m4a-to-wma']} /> }))),

  'm4a-to-opus': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="m4a-to-opus" description={HUB_DESCRIPTIONS['m4a-to-opus']} /> }))),

  'm4a-to-aiff': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="m4a-to-aiff" description={HUB_DESCRIPTIONS['m4a-to-aiff']} /> }))),

  'wma-to-wav': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="wma-to-wav" description={HUB_DESCRIPTIONS['wma-to-wav']} /> }))),

  'wma-to-flac': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="wma-to-flac" description={HUB_DESCRIPTIONS['wma-to-flac']} /> }))),

  'wma-to-ogg': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="wma-to-ogg" description={HUB_DESCRIPTIONS['wma-to-ogg']} /> }))),

  'wma-to-m4a': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="wma-to-m4a" description={HUB_DESCRIPTIONS['wma-to-m4a']} /> }))),

  'wma-to-aac': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="wma-to-aac" description={HUB_DESCRIPTIONS['wma-to-aac']} /> }))),

  'wma-to-opus': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="wma-to-opus" description={HUB_DESCRIPTIONS['wma-to-opus']} /> }))),

  'wma-to-aiff': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="wma-to-aiff" description={HUB_DESCRIPTIONS['wma-to-aiff']} /> }))),

  'opus-to-wav': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="opus-to-wav" description={HUB_DESCRIPTIONS['opus-to-wav']} /> }))),

  'opus-to-flac': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="opus-to-flac" description={HUB_DESCRIPTIONS['opus-to-flac']} /> }))),

  'opus-to-ogg': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="opus-to-ogg" description={HUB_DESCRIPTIONS['opus-to-ogg']} /> }))),

  'opus-to-m4a': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="opus-to-m4a" description={HUB_DESCRIPTIONS['opus-to-m4a']} /> }))),

  'opus-to-aac': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="opus-to-aac" description={HUB_DESCRIPTIONS['opus-to-aac']} /> }))),

  'opus-to-wma': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="opus-to-wma" description={HUB_DESCRIPTIONS['opus-to-wma']} /> }))),

  'opus-to-aiff': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="opus-to-aiff" description={HUB_DESCRIPTIONS['opus-to-aiff']} /> }))),

  'aiff-to-wav': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="aiff-to-wav" description={HUB_DESCRIPTIONS['aiff-to-wav']} /> }))),

  'aiff-to-flac': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="aiff-to-flac" description={HUB_DESCRIPTIONS['aiff-to-flac']} /> }))),

  'aiff-to-ogg': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="aiff-to-ogg" description={HUB_DESCRIPTIONS['aiff-to-ogg']} /> }))),

  'aiff-to-m4a': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="aiff-to-m4a" description={HUB_DESCRIPTIONS['aiff-to-m4a']} /> }))),

  'aiff-to-aac': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="aiff-to-aac" description={HUB_DESCRIPTIONS['aiff-to-aac']} /> }))),

  'aiff-to-wma': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="aiff-to-wma" description={HUB_DESCRIPTIONS['aiff-to-wma']} /> }))),

  'aiff-to-opus': dynamic(() => import('@/components/tools/modules/shared/AudioFormatConverter').then(m => ({ default: () => <m.default slug="aiff-to-opus" description={HUB_DESCRIPTIONS['aiff-to-opus']} /> }))),

  // Image-format hub (migrated from CONVERTER_CONFIG -> ConverterRouter; SSR kept —
  // ImageFormatConverter renders a per-tool info banner from the description prop, so
  // each closure passes HUB_DESCRIPTIONS[slug] to keep pre-migration HTML byte-identical).
  'image-format-converter': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="image-format-converter" description={HUB_DESCRIPTIONS['image-format-converter']} /> }))),
  'png-to-jpg': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="png-to-jpg" description={HUB_DESCRIPTIONS['png-to-jpg']} /> }))),
  'png-to-webp': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="png-to-webp" description={HUB_DESCRIPTIONS['png-to-webp']} /> }))),
  'png-to-avif': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="png-to-avif" description={HUB_DESCRIPTIONS['png-to-avif']} /> }))),
  'png-to-gif': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="png-to-gif" description={HUB_DESCRIPTIONS['png-to-gif']} /> }))),
  'png-to-jxl': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="png-to-jxl" description={HUB_DESCRIPTIONS['png-to-jxl']} /> }))),
  'png-to-heic': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="png-to-heic" description={HUB_DESCRIPTIONS['png-to-heic']} /> }))),
  'png-to-bmp': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="png-to-bmp" description={HUB_DESCRIPTIONS['png-to-bmp']} /> }))),
  'png-to-tiff': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="png-to-tiff" description={HUB_DESCRIPTIONS['png-to-tiff']} /> }))),
  'png-to-ico': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="png-to-ico" description={HUB_DESCRIPTIONS['png-to-ico']} /> }))),
  'jpg-to-png': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="jpg-to-png" description={HUB_DESCRIPTIONS['jpg-to-png']} /> }))),
  'jpg-to-webp': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="jpg-to-webp" description={HUB_DESCRIPTIONS['jpg-to-webp']} /> }))),
  'jpg-to-avif': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="jpg-to-avif" description={HUB_DESCRIPTIONS['jpg-to-avif']} /> }))),
  'jpg-to-gif': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="jpg-to-gif" description={HUB_DESCRIPTIONS['jpg-to-gif']} /> }))),
  'jpg-to-jxl': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="jpg-to-jxl" description={HUB_DESCRIPTIONS['jpg-to-jxl']} /> }))),
  'jpg-to-heic': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="jpg-to-heic" description={HUB_DESCRIPTIONS['jpg-to-heic']} /> }))),
  'jpg-to-svg': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="jpg-to-svg" description={HUB_DESCRIPTIONS['jpg-to-svg']} /> }))),
  'jpg-to-bmp': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="jpg-to-bmp" description={HUB_DESCRIPTIONS['jpg-to-bmp']} /> }))),
  'jpg-to-tiff': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="jpg-to-tiff" description={HUB_DESCRIPTIONS['jpg-to-tiff']} /> }))),
  'jpg-to-ico': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="jpg-to-ico" description={HUB_DESCRIPTIONS['jpg-to-ico']} /> }))),
  'webp-to-png': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="webp-to-png" description={HUB_DESCRIPTIONS['webp-to-png']} /> }))),
  'webp-to-jpg': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="webp-to-jpg" description={HUB_DESCRIPTIONS['webp-to-jpg']} /> }))),
  'webp-to-gif': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="webp-to-gif" description={HUB_DESCRIPTIONS['webp-to-gif']} /> }))),
  'webp-to-avif': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="webp-to-avif" description={HUB_DESCRIPTIONS['webp-to-avif']} /> }))),
  'webp-to-heic': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="webp-to-heic" description={HUB_DESCRIPTIONS['webp-to-heic']} /> }))),
  'webp-to-svg': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="webp-to-svg" description={HUB_DESCRIPTIONS['webp-to-svg']} /> }))),
  'webp-to-bmp': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="webp-to-bmp" description={HUB_DESCRIPTIONS['webp-to-bmp']} /> }))),
  'webp-to-tiff': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="webp-to-tiff" description={HUB_DESCRIPTIONS['webp-to-tiff']} /> }))),
  'webp-to-ico': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="webp-to-ico" description={HUB_DESCRIPTIONS['webp-to-ico']} /> }))),
  'webp-to-jxl': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="webp-to-jxl" description={HUB_DESCRIPTIONS['webp-to-jxl']} /> }))),
  'heic-to-jpg': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="heic-to-jpg" description={HUB_DESCRIPTIONS['heic-to-jpg']} /> }))),
  'heic-to-png': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="heic-to-png" description={HUB_DESCRIPTIONS['heic-to-png']} /> }))),
  'heic-to-webp': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="heic-to-webp" description={HUB_DESCRIPTIONS['heic-to-webp']} /> }))),
  'heic-to-avif': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="heic-to-avif" description={HUB_DESCRIPTIONS['heic-to-avif']} /> }))),
  'heic-to-gif': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="heic-to-gif" description={HUB_DESCRIPTIONS['heic-to-gif']} /> }))),
  'heic-to-svg': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="heic-to-svg" description={HUB_DESCRIPTIONS['heic-to-svg']} /> }))),
  'heic-to-bmp': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="heic-to-bmp" description={HUB_DESCRIPTIONS['heic-to-bmp']} /> }))),
  'heic-to-tiff': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="heic-to-tiff" description={HUB_DESCRIPTIONS['heic-to-tiff']} /> }))),
  'heic-to-ico': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="heic-to-ico" description={HUB_DESCRIPTIONS['heic-to-ico']} /> }))),
  'heic-to-jxl': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="heic-to-jxl" description={HUB_DESCRIPTIONS['heic-to-jxl']} /> }))),
  'avif-to-png': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="avif-to-png" description={HUB_DESCRIPTIONS['avif-to-png']} /> }))),
  'avif-to-jpg': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="avif-to-jpg" description={HUB_DESCRIPTIONS['avif-to-jpg']} /> }))),
  'avif-to-webp': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="avif-to-webp" description={HUB_DESCRIPTIONS['avif-to-webp']} /> }))),
  'avif-to-heic': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="avif-to-heic" description={HUB_DESCRIPTIONS['avif-to-heic']} /> }))),
  'avif-to-svg': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="avif-to-svg" description={HUB_DESCRIPTIONS['avif-to-svg']} /> }))),
  'avif-to-bmp': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="avif-to-bmp" description={HUB_DESCRIPTIONS['avif-to-bmp']} /> }))),
  'avif-to-tiff': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="avif-to-tiff" description={HUB_DESCRIPTIONS['avif-to-tiff']} /> }))),
  'avif-to-gif': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="avif-to-gif" description={HUB_DESCRIPTIONS['avif-to-gif']} /> }))),
  'avif-to-ico': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="avif-to-ico" description={HUB_DESCRIPTIONS['avif-to-ico']} /> }))),
  'avif-to-jxl': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="avif-to-jxl" description={HUB_DESCRIPTIONS['avif-to-jxl']} /> }))),
  'svg-to-png': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="svg-to-png" description={HUB_DESCRIPTIONS['svg-to-png']} /> }))),
  'svg-to-jpg': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="svg-to-jpg" description={HUB_DESCRIPTIONS['svg-to-jpg']} /> }))),
  'svg-to-webp': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="svg-to-webp" description={HUB_DESCRIPTIONS['svg-to-webp']} /> }))),
  'svg-to-avif': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="svg-to-avif" description={HUB_DESCRIPTIONS['svg-to-avif']} /> }))),
  'svg-to-gif': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="svg-to-gif" description={HUB_DESCRIPTIONS['svg-to-gif']} /> }))),
  'svg-to-heic': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="svg-to-heic" description={HUB_DESCRIPTIONS['svg-to-heic']} /> }))),
  'svg-to-bmp': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="svg-to-bmp" description={HUB_DESCRIPTIONS['svg-to-bmp']} /> }))),
  'svg-to-tiff': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="svg-to-tiff" description={HUB_DESCRIPTIONS['svg-to-tiff']} /> }))),
  'svg-to-ico': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="svg-to-ico" description={HUB_DESCRIPTIONS['svg-to-ico']} /> }))),
  'svg-to-jxl': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="svg-to-jxl" description={HUB_DESCRIPTIONS['svg-to-jxl']} /> }))),
  'bmp-to-jpg': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="bmp-to-jpg" description={HUB_DESCRIPTIONS['bmp-to-jpg']} /> }))),
  'bmp-to-png': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="bmp-to-png" description={HUB_DESCRIPTIONS['bmp-to-png']} /> }))),
  'bmp-to-webp': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="bmp-to-webp" description={HUB_DESCRIPTIONS['bmp-to-webp']} /> }))),
  'bmp-to-gif': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="bmp-to-gif" description={HUB_DESCRIPTIONS['bmp-to-gif']} /> }))),
  'bmp-to-avif': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="bmp-to-avif" description={HUB_DESCRIPTIONS['bmp-to-avif']} /> }))),
  'bmp-to-heic': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="bmp-to-heic" description={HUB_DESCRIPTIONS['bmp-to-heic']} /> }))),
  'bmp-to-svg': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="bmp-to-svg" description={HUB_DESCRIPTIONS['bmp-to-svg']} /> }))),
  'bmp-to-tiff': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="bmp-to-tiff" description={HUB_DESCRIPTIONS['bmp-to-tiff']} /> }))),
  'bmp-to-ico': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="bmp-to-ico" description={HUB_DESCRIPTIONS['bmp-to-ico']} /> }))),
  'bmp-to-jxl': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="bmp-to-jxl" description={HUB_DESCRIPTIONS['bmp-to-jxl']} /> }))),
  'tiff-to-jpg': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="tiff-to-jpg" description={HUB_DESCRIPTIONS['tiff-to-jpg']} /> }))),
  'tiff-to-png': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="tiff-to-png" description={HUB_DESCRIPTIONS['tiff-to-png']} /> }))),
  'tiff-to-webp': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="tiff-to-webp" description={HUB_DESCRIPTIONS['tiff-to-webp']} /> }))),
  'tiff-to-gif': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="tiff-to-gif" description={HUB_DESCRIPTIONS['tiff-to-gif']} /> }))),
  'tiff-to-avif': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="tiff-to-avif" description={HUB_DESCRIPTIONS['tiff-to-avif']} /> }))),
  'tiff-to-heic': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="tiff-to-heic" description={HUB_DESCRIPTIONS['tiff-to-heic']} /> }))),
  'tiff-to-svg': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="tiff-to-svg" description={HUB_DESCRIPTIONS['tiff-to-svg']} /> }))),
  'tiff-to-bmp': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="tiff-to-bmp" description={HUB_DESCRIPTIONS['tiff-to-bmp']} /> }))),
  'tiff-to-ico': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="tiff-to-ico" description={HUB_DESCRIPTIONS['tiff-to-ico']} /> }))),
  'tiff-to-jxl': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="tiff-to-jxl" description={HUB_DESCRIPTIONS['tiff-to-jxl']} /> }))),
  'gif-to-jpg': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="gif-to-jpg" description={HUB_DESCRIPTIONS['gif-to-jpg']} /> }))),
  'gif-to-png': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="gif-to-png" description={HUB_DESCRIPTIONS['gif-to-png']} /> }))),
  'gif-to-webp': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="gif-to-webp" description={HUB_DESCRIPTIONS['gif-to-webp']} /> }))),
  'gif-to-avif': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="gif-to-avif" description={HUB_DESCRIPTIONS['gif-to-avif']} /> }))),
  'gif-to-heic': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="gif-to-heic" description={HUB_DESCRIPTIONS['gif-to-heic']} /> }))),
  'gif-to-svg': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="gif-to-svg" description={HUB_DESCRIPTIONS['gif-to-svg']} /> }))),
  'gif-to-bmp': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="gif-to-bmp" description={HUB_DESCRIPTIONS['gif-to-bmp']} /> }))),
  'gif-to-tiff': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="gif-to-tiff" description={HUB_DESCRIPTIONS['gif-to-tiff']} /> }))),
  'gif-to-ico': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="gif-to-ico" description={HUB_DESCRIPTIONS['gif-to-ico']} /> }))),
  'gif-to-jxl': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="gif-to-jxl" description={HUB_DESCRIPTIONS['gif-to-jxl']} /> }))),
  'ico-to-png': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="ico-to-png" description={HUB_DESCRIPTIONS['ico-to-png']} /> }))),
  'ico-to-jpg': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="ico-to-jpg" description={HUB_DESCRIPTIONS['ico-to-jpg']} /> }))),
  'ico-to-webp': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="ico-to-webp" description={HUB_DESCRIPTIONS['ico-to-webp']} /> }))),
  'ico-to-heic': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="ico-to-heic" description={HUB_DESCRIPTIONS['ico-to-heic']} /> }))),
  'ico-to-avif': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="ico-to-avif" description={HUB_DESCRIPTIONS['ico-to-avif']} /> }))),
  'ico-to-svg': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="ico-to-svg" description={HUB_DESCRIPTIONS['ico-to-svg']} /> }))),
  'ico-to-bmp': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="ico-to-bmp" description={HUB_DESCRIPTIONS['ico-to-bmp']} /> }))),
  'ico-to-tiff': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="ico-to-tiff" description={HUB_DESCRIPTIONS['ico-to-tiff']} /> }))),
  'ico-to-gif': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="ico-to-gif" description={HUB_DESCRIPTIONS['ico-to-gif']} /> }))),
  'ico-to-jxl': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="ico-to-jxl" description={HUB_DESCRIPTIONS['ico-to-jxl']} /> }))),
  'jxl-to-png': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="jxl-to-png" description={HUB_DESCRIPTIONS['jxl-to-png']} /> }))),
  'jxl-to-jpg': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="jxl-to-jpg" description={HUB_DESCRIPTIONS['jxl-to-jpg']} /> }))),
  'jxl-to-webp': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="jxl-to-webp" description={HUB_DESCRIPTIONS['jxl-to-webp']} /> }))),
  'jxl-to-gif': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="jxl-to-gif" description={HUB_DESCRIPTIONS['jxl-to-gif']} /> }))),
  'jxl-to-heic': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="jxl-to-heic" description={HUB_DESCRIPTIONS['jxl-to-heic']} /> }))),
  'jxl-to-avif': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="jxl-to-avif" description={HUB_DESCRIPTIONS['jxl-to-avif']} /> }))),
  'jxl-to-svg': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="jxl-to-svg" description={HUB_DESCRIPTIONS['jxl-to-svg']} /> }))),
  'jxl-to-bmp': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="jxl-to-bmp" description={HUB_DESCRIPTIONS['jxl-to-bmp']} /> }))),
  'jxl-to-tiff': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="jxl-to-tiff" description={HUB_DESCRIPTIONS['jxl-to-tiff']} /> }))),
  'jxl-to-ico': dynamic(() => import('@/components/tools/modules/shared/ImageCatchAllConverter').then(m => ({ default: () => <m.default slug="jxl-to-ico" description={HUB_DESCRIPTIONS['jxl-to-ico']} /> }))),



  // Standalone tools
  'break-even-calculator': dynamic(() => import('@/components/tools/modules/finance/BreakEvenCalculator'), { ssr: false, loading: () => <DynamicImportFallback slug="break-even-calculator" /> }),
  'domain-availability-checker': dynamic(() => import('@/components/tools/modules/developer/DomainAvailabilityChecker'), { ssr: false, loading: () => <DynamicImportFallback slug="domain-availability-checker" /> }),
  'pdf-ai-summariser': dynamic(() => import('@/components/tools/modules/pdf/PdfAiSummariser'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-ai-summariser" /> }),
  'pdf-page-manager': dynamic(() => import('@/components/tools/modules/pdf/PdfPageManager'), { ssr: false, loading: () => <DynamicImportFallback slug="pdf-page-manager" /> }),
  'pronunciation-tool': dynamic(() => import('@/components/tools/modules/text/PronunciationTool'), { ssr: false, loading: () => <DynamicImportFallback slug="pronunciation-tool" /> }),

  // ConvertersEverydayKit — promoted widgets

  'large-text-viewer': dynamic(() => import('@/components/tools/modules/utility/ConvertersEverydayWidgets').then(m => ({ default: m.LargeTextViewer })), { ssr: false, loading: () => <DynamicImportFallback slug="large-text-viewer" /> }),
  'avro-schema-generator': dynamic(() => import('@/components/tools/modules/utility/ConvertersEverydayWidgets').then(m => ({ default: m.AvroSchemaGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="avro-schema-generator" /> }),
  'avro-to-json-sample': dynamic(() => import('@/components/tools/modules/utility/ConvertersEverydayWidgets').then(m => ({ default: m.AvroToJsonSample })), { ssr: false, loading: () => <DynamicImportFallback slug="avro-to-json-sample" /> }),
  'ical-event-generator': dynamic(() => import('@/components/tools/modules/utility/ConvertersEverydayWidgets').then(m => ({ default: m.IcalEventGenerator })), { ssr: false, loading: () => <DynamicImportFallback slug="ical-event-generator" /> }),

  // Standalone JSON Formatter (two-panel, replaces legacy JsonOutputConverter)
  'json-formatter': dynamic(() => import('@/components/tools/modules/developer/JsonFormatter'), {
    ssr: false,
    loading: () => <DynamicImportFallback slug="json-formatter" />
  }),

  // Roadmap items
  'csv-to-sqlite': dynamic(() => import('@/components/tools/modules/developer/CsvToSqlite'), { ssr: false, loading: () => <DynamicImportFallback slug="csv-to-sqlite" /> }),
  'vector-pen-canvas': dynamic(() => import('@/components/tools/modules/design/VectorPenCanvas'), { ssr: false, loading: () => <DynamicImportFallback slug="vector-pen-canvas" /> }),

  // Premium text tools
  'text-repeater': dynamic(() => import('@/components/tools/modules/text/TextRepeater'), { ssr: false, loading: () => <DynamicImportFallback slug="text-repeater" /> }),
  'small-text-generator': dynamic(() => import('@/components/tools/modules/text/SmallTextGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="small-text-generator" /> }),
  'big-text-generator': dynamic(() => import('@/components/tools/modules/text/BigTextGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="big-text-generator" /> }),
  'writing-tools': dynamic(() => import('@/components/tools/modules/text/WritingTools'), { ssr: false, loading: () => <DynamicImportFallback slug="writing-tools" /> }),
  'citation-generator': dynamic(() => import('@/components/tools/modules/text/CitationGenerator'), { ssr: false, loading: () => <DynamicImportFallback slug="citation-generator" /> }),

  // New text tools
  'text-reverser': dynamic(() => import('@/components/tools/modules/text/TextReverser'), { ssr: false, loading: () => <DynamicImportFallback slug="text-reverser" /> }),
  'upside-down-text': dynamic(() => import('@/components/tools/modules/text/UpsideDownText'), { ssr: false, loading: () => <DynamicImportFallback slug="upside-down-text" /> }),
  'glitch-text': dynamic(() => import('@/components/tools/modules/text/GlitchText'), { ssr: false, loading: () => <DynamicImportFallback slug="glitch-text" /> }),
  'invisible-character': dynamic(() => import('@/components/tools/modules/text/InvisibleCharacter'), { ssr: false, loading: () => <DynamicImportFallback slug="invisible-character" /> }),
};

const ComingSoonTool = dynamic(() => import('@/components/tools/modules/utility/ComingSoonTool'), { ssr: false, loading: () => <SkeletonLoader /> });

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { CONVERTER_CONFIG } from './shared/converterConfig';
import ConverterRouter from './converter/ConverterRouter';

export function DynamicModuleWrapper({ slug, category }: { slug: string, category: string }) {
  const DynamicModule = MODULE_REGISTRY[slug];

  if (DynamicModule) {
    return (
      <ErrorBoundary>
        <DynamicModule />
      </ErrorBoundary>
    );
  }

  if (CONVERTER_CONFIG[slug]) {
    return <ConverterRouter slug={slug} />;
  }

  const toolName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return (
    <ErrorBoundary>
      <ComingSoonTool toolName={toolName} />
    </ErrorBoundary>
  );
}
