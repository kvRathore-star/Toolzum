/**
 * Bundle budget gate for the static export (C3.2/C3.3).
 *
 * Two modes (same data, no rebuild needed between them):
 *   --collect   Walk out/ HTML, record which JS chunks every page loads.
 *               Writes bundle-stats.json (shared-by-all chunk set + per-file
 *               gzip sizes). Runs in CI right after `npm run build`.
 *   --check     Read bundle-stats.json, fail if shared JS exceeds budget.
 *               Posts a Markdown summary ($GITHUB_STEP_SUMMARY on CI).
 *
 * "Shared by all" = exact set intersection of chunk URLs across every HTML
 * page — the static-export equivalent of Next's "First Load JS shared by
 * all". Budget default 500 KB gzip (override: BUDGET_SHARED_KB env).
 *
 * File-count gate: Cloudflare Pages allows ~20,000 files per deployment and
 * each tool page emits ~7 files (HTML + RSC/txt companions + OG dir), so the
 * catalog cannot grow unboundedly. collect records total file count;
 * check fails above FILE_BUDGET_MAX (default 20000) and warns above
 * FILE_BUDGET_WARN (default 18000). Current: ~16,930 files.
 *
 * Usage:
 *   npx tsx scripts/bundle-budget.ts --collect [--out=out --stats=bundle-stats.json]
 *   npx tsx scripts/bundle-budget.ts --check [--stats=bundle-stats.json]
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

interface BundleStats {
  pageCount: number;
  shared: string[];
  sizes: Record<string, number>;
  heaviest: { route: string; kb: number }[];
  fileCount: number;
}

export function countAll(dir: string): number {
  let n = 0;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    try {
      if (statSync(p).isDirectory()) n += countAll(p);
      else n += 1;
    } catch { /* ignore races with concurrent writes */ }
  }
  return n;
}

const CHUNK_RE = /src="\/_next\/static\/chunks\/([^"]+\.js)"/g;

function listHtml(dir: string, acc: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) acc = listHtml(p, acc);
    else if (e.endsWith('.html')) acc.push(p);
  }
  return acc;
}

function chunksOf(htmlPath: string): Set<string> {
  const html = readFileSync(htmlPath, 'utf8');
  const set = new Set<string>();
  let m: RegExpExecArray | null;
  CHUNK_RE.lastIndex = 0;
  while ((m = CHUNK_RE.exec(html)) !== null) set.add(m[1]!);
  return set;
}

export function collect(outDir: string): BundleStats {
  const files = listHtml(outDir);
  if (files.length === 0) throw new Error(`no HTML pages found under ${outDir}`);
  let shared: Set<string> | null = null;
  const perPage: { route: string; chunks: Set<string> }[] = [];
  for (const f of files) {
    const chunks = chunksOf(f);
    // Zero-JS pages (out/offline.html — the PWA fallback) reference no
    // chunks; their empty set would empty the intersection and abort the
    // gate. Excluded from shared/heaviest, still counted in pageCount.
    if (chunks.size === 0) continue;
    perPage.push({ route: f.slice(outDir.length), chunks });
    shared = shared === null ? chunks : new Set([...shared].filter((c: string) => chunks.has(c)));
  }
  if (shared === null) throw new Error(`no page under ${outDir} references any JS chunk — check CHUNK_RE`);
  const sharedList = [...shared].sort();
  if (sharedList.length === 0) throw new Error('shared-chunk intersection is empty — entry chunks diverge across pages');
  const sizes: Record<string, number> = {};
  const sizeOf = (c: string): number =>
    (sizes[c] ??= gzipSync(readFileSync(join(outDir, '_next', 'static', 'chunks', c))).length);
  for (const c of sharedList) sizeOf(c);
  const heaviest = perPage
    .map(({ route, chunks }) => ({
      route,
      kb: [...chunks].filter((c) => !shared!.has(c)).reduce((s, c) => s + sizeOf(c), 0) / 1024,
    }))
    .sort((a, b) => b.kb - a.kb)
    .slice(0, 15)
    .map(({ route, kb }) => ({ route, kb: Math.round(kb * 10) / 10 }));
  return { pageCount: files.length, shared: sharedList, sizes, heaviest, fileCount: countAll(outDir) };
}

function check(statsPath: string, budgetKb: number): void {
  const stats = JSON.parse(readFileSync(statsPath, 'utf8')) as BundleStats;
  const sharedKb = stats.shared.reduce((s, c) => s + (stats.sizes[c] ?? 0), 0) / 1024;
  const pass = sharedKb <= budgetKb;
  const fileMax = Number(process.env.FILE_BUDGET_MAX ?? 20000);
  const fileWarn = Number(process.env.FILE_BUDGET_WARN ?? 18000);
  const fileCount = stats.fileCount ?? -1;
  const filePass = fileCount < 0 || fileCount <= fileMax;
  const rows = [
    `# Bundle budget ${pass && filePass ? '✅ PASS' : '❌ FAIL'}`,
    '',
    `Shared JS (loaded by all ${stats.pageCount} pages): **${sharedKb.toFixed(1)} KB** gzip — budget **${budgetKb} KB**.`,
    '',
    ...(fileCount < 0
      ? ['File count not collected (old stats file) — file gate skipped.', '']
      : [
          `Deployed files: **${fileCount.toLocaleString()}** — warn at ${fileWarn.toLocaleString()}, max ${fileMax.toLocaleString()} (Pages ceiling).`,
          '',
        ]),
    '| Shared chunk | gzip KB |',
    '| --- | --- |',
    ...stats.shared.map((c) => `| \`${c}\` | ${((stats.sizes[c] ?? 0) / 1024).toFixed(1)} |`),
    '',
    '| Heaviest pages (unique JS) | gzip KB |',
    '| --- | --- |',
    ...stats.heaviest.map((h) => `| \`${h.route}\` | ${h.kb} |`),
  ].join('\n');
  const summary = process.env.GITHUB_STEP_SUMMARY;
  if (summary) writeFileSync(summary, rows + '\n', { flag: 'a' });
  else console.log(rows);
  if (!pass) {
    console.error(`BUDGET EXCEEDED: shared ${sharedKb.toFixed(1)} KB > ${budgetKb} KB`);
    process.exit(1);
  }
  if (fileCount >= 0 && fileCount > fileWarn) {
    console.warn(`FILE BUDGET: ${fileCount.toLocaleString()} deployed files (warn ${fileWarn.toLocaleString()}, max ${fileMax.toLocaleString()})`);
  }
  if (!filePass) {
    console.error(`FILE BUDGET EXCEEDED: ${fileCount.toLocaleString()} files > ${fileMax.toLocaleString()} max`);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const opt = (name: string, def: string): string => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : def;
};
// Import-safe: unit tests import countAll without triggering the CLI
// (same isDirectRun pattern as scripts/generate-og-images.ts).
const isDirectRun =
  !!process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (!isDirectRun) {
  // imported — export only
} else if (args.includes('--collect')) {
  const stats = collect(opt('out', 'out'));
  writeFileSync(opt('stats', 'bundle-stats.json'), JSON.stringify(stats));
  const kb = stats.shared.reduce((s, c) => s + stats.sizes[c]!, 0) / 1024;
  console.log(`collected ${stats.pageCount} pages, shared=${kb.toFixed(1)} KB gzip, files=${stats.fileCount}`);
} else if (args.includes('--check')) {
  check(opt('stats', 'bundle-stats.json'), Number(process.env.BUDGET_SHARED_KB ?? 500));
} else {
  console.error('usage: bundle-budget.ts --collect | --check');
  process.exit(2);
}
