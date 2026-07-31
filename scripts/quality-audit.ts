#!/usr/bin/env node
/**
 * quality-audit.ts — Production quality audit for Toolzum.
 *
 * Checks every tool module against Tier 1 (Baseline) and Tier 2 (Premium) criteria.
 *
 * Run:   npx tsx scripts/quality-audit.ts [--json] [--fix]
 */
import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ─── Config ─────────────────────────────────────────────────────────────────

const TIER1_WEIGHT = 2; // Each Tier 1 check is mandatory
const TIER2_WEIGHT = 1; // Each Tier 2 check is premium

type Criterion = {
  id: string;
  tier: 1 | 2;
  label: string;
  check: (slug: string, source: string) => CheckResult;
};

type CheckResult = { pass: boolean; detail?: string };

// ─── Criteria Definitions ───────────────────────────────────────────────────

const CRITERIA: Criterion[] = [
  // Tier 1 — Baseline
  {
    id: "bidirectional",
    tier: 1,
    label: "Bidirectional (mode toggle or swap)",
    check: (slug, source) => ({
      pass:
        source.includes("handleSwap") ||
        source.includes("swapMode") ||
        source.includes("mode === 'encode") ||
        source.includes("mode === 'decode") ||
        source.includes("direction") ||
        source.includes("swapInputs") ||
        source.includes("reverse") ||
        (/fromFormat/.test(source) && /toFormat/.test(source)),
      detail: "No swap/bidirectional pattern found",
    }),
  },
  {
    id: "controls",
    tier: 1,
    label: "Real input controls (select/dropdown/checkbox/radio/slider)",
    check: (slug, source) => ({
      pass:
        /<select/.test(source) ||
        /<input[^>]*type="(checkbox|radio|range)"/.test(source) ||
        /<Dropdown/.test(source) ||
        /<Selector/.test(source) ||
        /formats\.map/.test(source) ||
        /units\.map/.test(source) ||
        /OPTIONS/.test(source) ||
        /options\.map/.test(source),
      detail: "Only textarea/input[text] found — no structured controls",
    }),
  },
  {
    id: "copy",
    tier: 1,
    label: "Copy-to-clipboard and/or download",
    check: (slug, source) => ({
      pass:
        source.includes("clipboardWrite") ||
        source.includes("copyToClipboard") ||
        source.includes("navigator.clipboard") ||
        source.includes("downloadOrShare") ||
        source.includes("download") ||
        source.includes("handleDownload") ||
        source.includes("onCopy") ||
        source.includes("Copied!"),
      detail: "No copy/download mechanism found",
    }),
  },
  {
    id: "error-states",
    tier: 1,
    label: "Visible error/empty states",
    check: (slug, source) => ({
      pass:
        source.includes("toast.error") ||
        source.includes("setError") ||
        source.includes("errorMessage") ||
        source.includes("isError") ||
        source.includes("catch") ||
        source.includes("try {") ||
        /setOutput\(['"]Error/.test(source) ||
        source.includes("invalid") ||
        source.includes("validation"),
      detail: "No error handling pattern found",
    }),
  },
  {
    id: "loading",
    tier: 1,
    label: "Loading/processing indicator",
    check: (slug, source) => ({
      pass:
        source.includes("isLoading") ||
        source.includes("isProcessing") ||
        source.includes("isConverting") ||
        source.includes("isLoaded") ||
        source.includes("loading") ||
        source.includes("Processing...") ||
        source.includes("Converting...") ||
        source.includes("SkeletonLoader") ||
        source.includes("progress") ||
        source.includes("spinner") ||
        source.includes("disabled") ||
        source.includes("setProcessing"),
      detail: "No loading/processing state found",
    }),
  },
  {
    id: "mobile",
    tier: 1,
    label: "Mobile-usable (responsive classes or flex layout)",
    check: (slug, source) => ({
      pass:
        source.includes("max-w-") ||
        source.includes("sm:") ||
        source.includes("md:") ||
        source.includes("lg:") ||
        source.includes("flex-col") ||
        source.includes("grid-cols") ||
        source.includes("w-full") ||
        source.includes("responsive") ||
        source.includes("mobile"),
      detail: "No responsive layout patterns found",
    }),
  },

  // Tier 2 — Premium
  {
    id: "presets",
    tier: 2,
    label: "Example/preset inputs with one-click",
    check: (slug, source) => ({
      pass:
        source.includes("preset") ||
        source.includes("Preset") ||
        source.includes("example") ||
        source.includes("placeholder") ||
        source.includes("inputPlaceholder") ||
        source.includes("defaultValue") ||
        source.includes("fillExample") ||
        source.includes("loadSample") ||
        source.includes("tryExample") ||
        source.includes("demoData"),
      detail: "No preset/example data found",
    }),
  },
  {
    id: "defaults",
    tier: 2,
    label: "Sensible defaults pre-filled",
    check: (slug, source) => ({
      pass:
        /useState\(['"](?!['"])/.test(source) ||
        /useState\([0-9]/.test(source) ||
        /useState\(true/.test(source) ||
        /useState\(false/.test(source) ||
        source.includes("initial") ||
        source.includes("default") ||
        source.includes("DEFAULT_") ||
        source.includes("DEFAULTS"),
      detail: "No pre-filled defaults detected",
    }),
  },
  {
    id: "history",
    tier: 2,
    label: "History/undo for multi-step tools",
    check: (slug, source) => ({
      pass:
        source.includes("useToolHistory") ||
        source.includes("undo") ||
        source.includes("history") ||
        source.includes("History") ||
        source.includes("redo") ||
        source.includes("timeline") ||
        source.includes("pastStates"),
      detail: "No history/undo pattern found",
    }),
  },
  {
    id: "free-vs-pro",
    tier: 2,
    label: "Free vs Pro signal at point of friction",
    check: (slug, source) => ({
      pass:
        source.includes("useFreeUsage") ||
        source.includes("freeMaxSize") ||
        source.includes("freeMaxBatch") ||
        source.includes("FreeUsage") ||
        source.includes("ToolPaywall") ||
        source.includes("checkAndRecordDownload") ||
        source.includes("BulkDropPaywall") ||
        source.includes("remaining") ||
        source.includes("canUse"),
      detail: "No free-vs-pro signaling found",
    }),
  },
];

// ─── File Discovery ─────────────────────────────────────────────────────────

function discoverModules(): { slug: string; filepath: string }[] {
  const modulesDir = resolve(ROOT, "src/components/tools/modules");

  const all = readdirSync(modulesDir);
  const modules: { slug: string; filepath: string }[] = [];

  for (const f of all) {
    if (f === "shared") continue;
    const fp = resolve(modulesDir, f);
    if (!statSync(fp).isFile()) continue;

    const slug = f.replace(/\.tsx$/, "").replace(/\.ts$/, "");
    // Handle multi-tool files: Calculators.tsx, CodeKit.tsx, etc.
    modules.push({ slug: slug.toLowerCase(), filepath: fp });
  }

  // Also scan shared converters
  const sharedDir = resolve(modulesDir, "shared");
  if (existsSync(sharedDir)) {
    for (const f of readdirSync(sharedDir)) {
      if (!f.endsWith(".tsx") && !f.endsWith(".ts")) continue;
      const fp = resolve(sharedDir, f);
      modules.push({ slug: `shared/${f.replace(/\.tsx$/, "")}`, filepath: fp });
    }
  }

  return modules;
}

// ─── Source Analysis ────────────────────────────────────────────────────────

function analyzeFile(filepath: string): { slug: string; source: string } | null {
  try {
    const source = readFileSync(filepath, "utf-8");
    // Derive a clean slug from filename
    const basename = filepath.split("/").pop()!.replace(/\.tsx$/, "");
    return { slug: basename, source };
  } catch {
    return null;
  }
}

// ─── Results ────────────────────────────────────────────────────────────────

type ToolResult = {
  slug: string;
  filepath: string;
  criteria: Record<string, CheckResult>;
  tier1Pass: number;
  tier1Total: number;
  tier2Pass: number;
  tier2Total: number;
  overall: number; // 0-100
};

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const outputJson = args.includes("--json");
  const fixMode = args.includes("--fix");

  const modules = discoverModules();
  console.log(`\nFound ${modules.length} tool modules\n`);

  const results: ToolResult[] = [];

  for (const mod of modules) {
    const data = analyzeFile(mod.filepath);
    if (!data) continue;

    const result: ToolResult = {
      slug: mod.slug,
      filepath: mod.filepath,
      criteria: {},
      tier1Pass: 0,
      tier1Total: 0,
      tier2Pass: 0,
      tier2Total: 0,
      overall: 0,
    };

    for (const c of CRITERIA) {
      const check = c.check(mod.slug, data.source);
      result.criteria[c.id] = check;
      if (c.tier === 1) {
        result.tier1Total++;
        if (check.pass) result.tier1Pass++;
      } else {
        result.tier2Total++;
        if (check.pass) result.tier2Pass++;
      }
    }

    // Overall score: Tier 1 = 70% weight, Tier 2 = 30%
    const t1score = result.tier1Total > 0 ? result.tier1Pass / result.tier1Total : 0;
    const t2score = result.tier2Total > 0 ? result.tier2Pass / result.tier2Total : 0;
    result.overall = Math.round((t1score * 70 + t2score * 30) * 100) / 100;

    results.push(result);
  }

  // ─── Output ──────────────────────────────────────────────────────────────

  if (outputJson) {
    console.log(JSON.stringify({ results, meta: { criteria: CRITERIA.map(c => c.id) } }, null, 2));
    return;
  }

  // Summary table
  const byScore = [...results].sort((a, b) => a.overall - b.overall);

  const t1PassAll = results.filter(r => r.tier1Pass === r.tier1Total);
  const t2PassAll = results.filter(r => r.tier2Pass === r.tier2Total);
  const totalT1 = results.reduce((s, r) => s + r.tier1Total, 0);
  const totalT1Pass = results.reduce((s, r) => s + r.tier1Pass, 0);
  const totalT2 = results.reduce((s, r) => s + r.tier2Total, 0);
  const totalT2Pass = results.reduce((s, r) => s + r.tier2Pass, 0);

  const avgT1 = totalT1 > 0 ? ((totalT1Pass / totalT1) * 100).toFixed(1) : "0.0";
  const avgT2 = totalT2 > 0 ? ((totalT2Pass / totalT2) * 100).toFixed(1) : "0.0";

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  QUALITY AUDIT — " + new Date().toISOString().slice(0, 10));
  console.log("═══════════════════════════════════════════════════════════\n");

  console.log(`  Modules analyzed:   ${results.length}`);
  console.log(`  Tier 1 pass rate:   ${avgT1}% (${totalT1Pass}/${totalT1})`);
  console.log(`  Tier 2 pass rate:   ${avgT2}% (${totalT2Pass}/${totalT2})`);
  console.log(`  Full Tier 1 pass:   ${t1PassAll.length}/${results.length}`);
  console.log(`  Full Tier 2 pass:   ${t2PassAll.length}/${results.length}\n`);

  // By criterion
  console.log("── Criteria Breakdown ──\n");
  for (const c of CRITERIA) {
    const passCount = results.filter(r => r.criteria[c.id]?.pass).length;
    const pct = ((passCount / results.length) * 100).toFixed(1);
    const icon = passCount === results.length ? "✅" : passCount > results.length * 0.5 ? "⚠️" : "❌";
    console.log(`  ${icon} [T${c.tier}] ${c.label}: ${pct}% (${passCount}/${results.length})`);
  }

  // Bottom 10
  console.log("\n── Bottom 10 Tools ──\n");
  for (const r of byScore.slice(0, 10)) {
    const icon = r.overall >= 90 ? "🟢" : r.overall >= 70 ? "🟡" : r.overall >= 50 ? "🟠" : "🔴";
    console.log(`  ${icon} ${r.slug.padEnd(35)} ${r.tier1Pass}/${r.tier1Total} T1  ${r.tier2Pass}/${r.tier2Total} T2  ${r.overall.toFixed(0)}/100`);
  }

  // Top 10
  console.log("\n── Top 10 Tools ──\n");
  const top10 = [...results].sort((a, b) => b.overall - a.overall).slice(0, 10);
  for (const r of top10) {
    console.log(`  🟢 ${r.slug.padEnd(35)} ${r.tier1Pass}/${r.tier1Total} T1  ${r.tier2Pass}/${r.tier2Total} T2  ${r.overall.toFixed(0)}/100`);
  }

  // Score distribution
  const buckets = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
  const dist = buckets.map(b => ({ min: b, max: b + 10, count: results.filter(r => r.overall >= b && r.overall < b + 10).length }));
  const top = results.filter(r => r.overall >= 90).length + results.filter(r => r.overall === 100).length;

  console.log("\n── Score Distribution ──\n");
  for (const d of dist) {
    const bar = "█".repeat(Math.round((d.count / results.length) * 40));
    console.log(`  ${String(d.min).padStart(2)}-${String(d.max).padStart(2)}% | ${bar} ${d.count}`);
  }
  console.log(`  90-100% | ${"█".repeat(Math.round((top / results.length) * 40))} ${top}`);
  console.log();
}

main().catch(console.error);
