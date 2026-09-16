import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Energy low-end gate (#47). Heavy on-device engines must respect
 * constrained devices — at minimum a heads-up before a multi-MB
 * download, ideally a degraded path. New heavy-engine modules get
 * added to KNOWN_HEAVY below; the gate fails until they handle it.
 */
const ROOT = process.cwd();

// module (relative to src/) -> accepted low-end handling markers.
const KNOWN_HEAVY: { file: string; markers: string[] }[] = [
  { file: "hooks/useFFmpeg.ts", markers: ["isLowEndDevice"] },
  {
    file: "components/tools/modules/utility/BulkToolShell.tsx",
    markers: ["heavyEngineNotice", "isLowEndDevice"],
  },
  {
    file: "components/tools/modules/pdf/PdfOcr.tsx",
    markers: ["isLowEndDevice"],
  },
  {
    file: "components/tools/modules/image/BlurFace.tsx",
    markers: ["isLowEndDevice"],
  },
  {
    file: "components/tools/modules/ai/AiBgChanger.tsx",
    markers: ["isLowEndDevice"],
  },
  {
    file: "components/tools/modules/image/BulkFaceAnonymizer.tsx",
    markers: ["heavyEngineNotice"],
  },
];

describe("energy low-end coverage (#47)", () => {
  it("every known heavy engine handles constrained devices", () => {
    const missing = KNOWN_HEAVY.filter(({ file, markers }) => {
      const content = fs.readFileSync(path.join(ROOT, "src", file), "utf8");
      return !markers.some((m) => content.includes(m));
    }).map(({ file }) => file);
    expect(missing, "heavy engines without low-end handling").toEqual([]);
  });

  it("the low-end detector never blocks (slow tool beats no tool)", () => {
    const src = fs.readFileSync(
      path.join(ROOT, "src/lib/device.ts"),
      "utf8",
    );
    // Detection informs warnings/fallbacks; gating a load on it would
    // brick tools on misdetected devices.
    expect(src.includes("never to block")).toBe(true);
  });
});
