import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { haveIBeenPwned } from "better-auth/plugins";

/**
 * Breached-password gate (#25 verdict follow-up). The plugin rejects
 * known-breached passwords at signup/change via HIBP k-anonymity.
 * This pins the wiring (a silent removal re-opens stuffing) — live
 * behavior is verified manually on preview (sign up with `password123`).
 */
const ROOT = process.cwd();

describe("breached-password gate", () => {
  it("is registered in the auth instance", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "src/lib/auth.ts"),
      "utf8",
    );
    expect(src.includes("haveIBeenPwned")).toBe(true);
    expect(src.includes("haveIBeenPwned()")).toBe(true);
  });

  it("exposes the expected plugin contract", () => {
    const plugin = haveIBeenPwned() as unknown as {
      id: string;
      init: unknown;
    };
    expect(plugin.id).toBe("have-i-been-pwned");
    expect(typeof plugin.init).toBe("function");
  });
});
