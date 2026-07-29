"use client";

const colors = ['rose', 'emerald', 'violet', 'amber', 'cyan', 'orange', 'teal', 'pink', 'indigo', 'lime', 'sky', 'fuchsia', 'purple', 'red', 'green', 'yellow', 'stone', 'slate', 'zinc', 'neutral'];
let colorIdx = 0;
function nextColor() { const c = colors[colorIdx % colors.length]; colorIdx++; return c; }
const colorMap: Record<string, string> = {};

export function ac(tool: string) {
  if (!colorMap[tool]) colorMap[tool] = nextColor();
  return colorMap[tool];
}

export function pillClass(c: string) { return `inline-block px-3 py-1 rounded-full text-xs font-medium cursor-pointer bg-${c}-500/10 text-${c}-600 dark:text-${c}-400 hover:bg-${c}-500/20 border border-${c}-500/20 transition-colors`; }
export function btnClass(c: string) { return `bg-${c}-500 hover:bg-${c}-600 text-white rounded-xl text-sm font-medium transition-colors px-4 py-2.5 disabled:opacity-50`; }
export function borderClass(c: string) { return `border-l-4 border-${c}-400 pl-3`; }
