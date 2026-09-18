"use client";

import React from "react";

interface DualPanelProps {
  /** Left panel content (inputs, options, process button). */
  input: React.ReactNode;
  /** Right panel content (result output). */
  output: React.ReactNode;
  /** Small heading above the input panel. Rendered as text, not a <label>. */
  inputLabel?: string;
  /** Small heading above the output panel. Rendered as text, not a <label>. */
  outputLabel?: string;
  /** Optional bar under the output (e.g. <CalcActions/>). */
  actions?: React.ReactNode;
  className?: string;
}

const panelCls =
  "bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 space-y-3 min-w-0";
const labelCls = "text-xs font-medium text-[var(--text-secondary)]";

/**
 * Side-by-side input/output layout for converter-style tools.
 * Stacks vertically on small screens, two columns from md up.
 * Dumb layout only: the tool owns its controls, labels, and logic —
 * pass <CalcActions/> as `actions` for copy/download/history.
 * Do NOT use for canvas/interactive tools or single-flow generators.
 */
export function DualPanel({ input, output, inputLabel, outputLabel, actions, className = "" }: DualPanelProps) {
  return (
    <div className={`grid gap-4 md:grid-cols-2 ${className}`}>
      <div className={panelCls}>
        {inputLabel ? <p className={labelCls}>{inputLabel}</p> : null}
        {input}
      </div>
      <div className={panelCls}>
        {outputLabel ? <p className={labelCls}>{outputLabel}</p> : null}
        {output}
        {actions}
      </div>
    </div>
  );
}
