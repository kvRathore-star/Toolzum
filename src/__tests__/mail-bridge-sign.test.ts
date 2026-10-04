import { describe, it, expect } from "vitest";
import {
  MAIL_BRIDGE_DEFAULT_URL,
  parseAttachmentList,
  signAttachmentKey,
  verifyAttachmentSignature,
} from "@/lib/mailBridge";

describe("signAttachmentKey / verifyAttachmentSignature", () => {
  it("round-trips a signed key", async () => {
    const sig = await signAttachmentKey("c/abc/0", "secret-a");
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
    expect(await verifyAttachmentSignature("c/abc/0", sig, "secret-a")).toBe(true);
  });

  it("rejects a tampered key (same signature, different key)", async () => {
    const sig = await signAttachmentKey("c/abc/0", "secret-a");
    expect(await verifyAttachmentSignature("c/abc/1", sig, "secret-a")).toBe(false);
  });

  it("rejects a tampered signature", async () => {
    const sig = await signAttachmentKey("c/abc/0", "secret-a");
    const flipped = (sig[0] === "0" ? "1" : "0") + sig.slice(1);
    expect(await verifyAttachmentSignature("c/abc/0", flipped, "secret-a")).toBe(false);
  });

  it("rejects a wrong secret", async () => {
    const sig = await signAttachmentKey("c/abc/0", "secret-a");
    expect(await verifyAttachmentSignature("c/abc/0", sig, "secret-b")).toBe(false);
  });

  it("rejects empty inputs", async () => {
    expect(await verifyAttachmentSignature("", "x", "secret")).toBe(false);
    expect(await verifyAttachmentSignature("k", "", "secret")).toBe(false);
    expect(await verifyAttachmentSignature("k", "x", "")).toBe(false);
  });

  it("is deterministic for the same key+secret", async () => {
    expect(await signAttachmentKey("k", "s")).toBe(await signAttachmentKey("k", "s"));
  });
});

describe("parseAttachmentList", () => {
  it("parses a valid list", () => {
    const json = JSON.stringify([{ key: "c/a/0", name: "x.png", mime: "image/png", size: 10 }]);
    expect(parseAttachmentList(json)).toHaveLength(1);
    expect(parseAttachmentList(json)[0]?.name).toBe("x.png");
  });

  it("returns [] for null, malformed JSON, non-arrays, and junk entries", () => {
    expect(parseAttachmentList(null)).toEqual([]);
    expect(parseAttachmentList(undefined)).toEqual([]);
    expect(parseAttachmentList("not json")).toEqual([]);
    expect(parseAttachmentList('{"key":"c/a/0"}')).toEqual([]);
    expect(parseAttachmentList('[{"nokey":1},{"key":"ok","name":"a"},5]')).toEqual([
      { key: "ok", name: "a" },
    ]);
  });
});

describe("MAIL_BRIDGE_DEFAULT_URL", () => {
  it("points at the deployed bridge worker over https", () => {
    expect(MAIL_BRIDGE_DEFAULT_URL).toMatch(
      /^https:\/\/toolzum-mail-bridge\.[a-z0-9]+\.workers\.dev$/
    );
  });
});
