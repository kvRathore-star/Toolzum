/**
 * Pass/fail over an artillery JSON report (#42). Thresholds are generous
 * on purpose: static pages behind a CDN should be boring. Tighten after
 * the first real run lands in docs/LOAD.md.
 *
 * Pure + tested. Env overrides: LOAD_P95_MS, LOAD_MAX_ERROR_PCT.
 */

const DEFAULT_P95_MS = 2000;
const DEFAULT_MAX_ERROR_PCT = 1;

function checkReport(report, opts) {
  opts = opts || {};
  const p95 = Number(report?.aggregate?.latency?.p95 ?? NaN);
  const codes = report?.aggregate?.codes ?? {};
  const total = Object.values(codes).reduce((a, b) => a + Number(b || 0), 0);
  const ok2xx = Object.entries(codes)
    .filter(([code]) => String(code).startsWith("2"))
    .reduce((a, [, n]) => a + Number(n || 0), 0);
  const errorPct = total > 0 ? ((total - ok2xx) / total) * 100 : 100;

  const p95Limit =
    Number(opts.p95Ms ?? process.env.LOAD_P95_MS ?? DEFAULT_P95_MS);
  const errLimit = Number(
    opts.maxErrorPct ?? process.env.LOAD_MAX_ERROR_PCT ?? DEFAULT_MAX_ERROR_PCT,
  );

  const failures = [];
  if (Number.isNaN(p95)) failures.push("no latency data in report");
  else if (p95 > p95Limit) failures.push(`p95 ${Math.round(p95)}ms > ${p95Limit}ms`);
  if (total === 0) failures.push("zero requests recorded");
  else if (errorPct > errLimit)
    failures.push(`error rate ${errorPct.toFixed(2)}% > ${errLimit}%`);

  return { ok: failures.length === 0, failures, p95, errorPct, total };
}

module.exports = { checkReport, DEFAULT_P95_MS, DEFAULT_MAX_ERROR_PCT };

if (typeof process !== "undefined" && process.argv[1] && process.argv[1].endsWith("check-load-report.js")) {
  const fs = require("node:fs");
  const report = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  const res = checkReport(report);
  console.log(JSON.stringify(res, null, 2));
  process.exit(res.ok ? 0 : 1);
}
