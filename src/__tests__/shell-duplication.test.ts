import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Single-result-panel guard (Sep 2026 — ~65 tools shipped a shell summary
 * panel PLUS an inner output box with its own copy/download: 3 visual
 * boxes, 2 of them results).
 *
 * Rule: inside a <CalculatorShell>…</CalculatorShell> block that does NOT
 * pass customResult, there must be no inner output container — i.e. no
 * clipboardWrite / Blob download / downloadOrShare handlers, no readOnly
 * output fields, and no <pre>/<Output> result blocks. Computed output
 * belongs in the shell's right panel via customResult (or resultStats);
 * the left column keeps inputs, static help, toggles and presets.
 *
 * Stat tiles, gauges and bars without copy/download are fine (same role
 * as resultStats) and are intentionally not flagged.
 */
const ROOT = process.cwd();
const MODULES = path.join(ROOT, "src/components/tools/modules");

const MARKERS = [
  "clipboardWrite(",
  "new Blob(",
  "downloadOrShare(",
  "readOnly",
  "<pre",
  "<Output",
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (/\.tsx$/.test(e.name)) out.push(full);
  }
  return out;
}

/** End line (1-based) of the JSX opening tag starting at line startIdx (0-based). */
function tagEnd(lines: string[], startIdx: number): number {
  let depth = 0;
  let inStr: string | null = null;
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i]!;
    for (let c = 0; c < line.length; c++) {
      const ch = line[c]!;
      if (inStr) {
        if (ch === inStr && line[c - 1] !== "\\") inStr = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") inStr = ch;
      else if (ch === "{" || ch === "(") depth++;
      else if (ch === "}" || ch === ")") depth--;
      else if (ch === ">" && depth === 0) return i + 1;
    }
  }
  return lines.length;
}

interface Violation {
  file: string;
  line: number;
  marker: string;
}

function scan(): Violation[] {
  const out: Violation[] = [];
  for (const file of walk(MODULES)) {
    const src = fs.readFileSync(file, "utf8");
    if (!src.includes("<CalculatorShell")) continue;
    const lines = src.split("\n");
    const closes: number[] = [];
    lines.forEach((l, i) => { if (l.includes("</CalculatorShell>")) closes.push(i); });
    let ci = 0;
    lines.forEach((l, i) => {
      if (!l.includes("<CalculatorShell")) return;
      while (ci < closes.length && closes[ci]! < i) ci++;
      const endTag = tagEnd(lines, i);
      const end = ci < closes.length ? closes[ci]! + 1 : lines.length;
      const tagText = lines.slice(i, endTag).join("\n");
      if (tagText.includes("customResult")) return; // output lives in the right panel by design
      for (let j = endTag; j < end; j++) {
        for (const m of MARKERS) {
          if (lines[j]!.includes(m)) {
            out.push({ file: path.relative(ROOT, file), line: j + 1, marker: m });
            break;
          }
        }
      }
    });
  }
  return out;
}

describe("single-result-panel", () => {
  it("no CalculatorShell without customResult renders an inner output box", () => {
    const violations = scan();
    if (violations.length > 0) {
      console.log("=== Inner output boxes inside CalculatorShell (move to customResult) ===");
      for (const v of violations) console.log(`  ${v.file}:${v.line} [${v.marker}]`);
    }
    expect(violations).toEqual([]);
  });
});
