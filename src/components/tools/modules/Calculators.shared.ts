"use client";

export const gradePointsMap: Record<string, number> = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0 };
export const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
export function factorial(n: number): number {
  if (n < 0) throw new Error('Factorial of negative number');
  if (n === 0 || n === 1) return 1;
  if (!Number.isInteger(n)) throw new Error('Factorial of non-integer');
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
export const inputCls = "w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 transition-colors";
export const labelCls = "block text-sm font-bold text-[var(--text-primary)] mb-1.5";
export const btnCls = "mt-4 px-6 py-3 rounded-xl font-bold text-sm transition-all bg-[var(--accent)] text-white hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
