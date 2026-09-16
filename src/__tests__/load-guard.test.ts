import { describe, it, expect } from "vitest";
import targetGuard from "../../scripts/check-load-target.js";
import reportGuard from "../../scripts/check-load-report.js";

const { targetVerdict } = targetGuard as {
  targetVerdict: (
    target: string | undefined,
    env?: Record<string, string>,
  ) => { ok: boolean; reason: string };
};
const { checkReport } = reportGuard as {
  checkReport: (
    report: unknown,
    opts?: { p95Ms?: number; maxErrorPct?: number },
  ) => { ok: boolean; failures: string[]; p95: number; errorPct: number; total: number };
};

describe("load-test guardrails (#42)", () => {
  it("requires a target", () => {
    expect(targetVerdict(undefined).ok).toBe(false);
    expect(targetVerdict("notaurl").ok).toBe(false);
  });

  it("refuses production apex without explicit confirmation", () => {
    expect(targetVerdict("https://toolzum.com", {}).ok).toBe(false);
    expect(
      targetVerdict("https://toolzum.com", { LOAD_CONFIRM_PROD: "1" }).ok,
    ).toBe(true);
  });

  it("allows previews and localhost", () => {
    expect(targetVerdict("https://abc.toolzum.pages.dev", {}).ok).toBe(true);
    expect(targetVerdict("http://localhost:3000", {}).ok).toBe(true);
    expect(targetVerdict("http://evil.com", {}).ok).toBe(false);
  });

  it("passes a healthy report", () => {
    const res = checkReport({
      aggregate: { latency: { p95: 800 }, codes: { 200: 990, 429: 10 } },
    });
    expect(res.ok).toBe(true);
    expect(res.total).toBe(1000);
  });

  it("fails slow p95, error floods, and empty reports", () => {
    expect(
      checkReport({ aggregate: { latency: { p95: 5000 }, codes: { 200: 100 } } })
        .ok,
    ).toBe(false);
    expect(
      checkReport({ aggregate: { latency: { p95: 100 }, codes: { 200: 50, 500: 50 } } })
        .ok,
    ).toBe(false);
    expect(checkReport({ aggregate: { latency: {}, codes: {} } }).ok).toBe(false);
  });
});
