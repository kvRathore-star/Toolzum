import { describe, it, expect } from "vitest";
import { detectFileType, heroRouteFor, heroToolName, heroIntentsFor, heroBulkIntentsFor, heroDefaultIntentId, heroDocumentIntents, heroBlockReason, heroTypeWarning, heroSizeState, heroCapFor, heroExtOf } from "@/lib/fileRoute";
import { smartMax } from "@/utils/fileSizeLimits";
import { requiresCloudApi } from "@/lib/cloudPatterns";
import { clientToolsRegistry } from "@/registry/tools-client-index";
import { toolsRegistry } from "@/registry/tools";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const F = (name: string, type = "") => ({ name, type });

describe("hero upload routing (trustworthy file -> tool)", () => {
  it("routes by MIME first", () => {
    expect(detectFileType(F("x", "image/png"))).toBe("image");
    expect(detectFileType(F("x", "video/mp4"))).toBe("video");
    expect(detectFileType(F("x", "audio/mpeg"))).toBe("audio");
    expect(detectFileType(F("x", "application/pdf"))).toBe("pdf");
  });

  it("falls back to extension (mobile often sends empty MIME)", () => {
    expect(detectFileType(F("photo.HEIC"))).toBe("image");
    expect(detectFileType(F("clip.3gp"))).toBe("video");
    expect(detectFileType(F("scan.PDF"))).toBe("pdf");
  });

  it("covers mobile-era formats", () => {
    for (const ext of ["heic", "heif", "avif", "m4v", "3gp", "odt", "rtf"]) {
      expect(detectFileType(F(`f.${ext}`))).not.toBe("other");
    }
  });

  it("extensionless and unknown files fall back to the directory", () => {
    expect(detectFileType(F("README"))).toBe("other");
    expect(detectFileType(F("data.xyz"))).toBe("other");
    expect(heroRouteFor("other")).toBe("/tools");
  });

  it("every route resolves to a live registry tool (no 404 routing)", () => {
    const bySlug = new Map(clientToolsRegistry.map((t) => [t.slug, t]));
    const cases: [string, string][] = [
      ["image", "/image/image-compressor"],
      ["video", "/video/video-compressor"],
      ["audio", "/audio/audio-compressor"],
      ["pdf", "/pdf/pdf-compressor"],
      ["document", "/converter/document-converter"],
    ];
    for (const [kind, url] of cases) {
      expect(heroRouteFor(kind as never)).toBe(url);
      const m = url.match(/^\/([^/]+)\/([^/]+)$/)!;
      const tool = bySlug.get(m[2]!);
      expect(tool, `${url} must exist`).toBeDefined();
      expect(tool!.category.toLowerCase().replace(/\s+/g, "-")).toBe(m[1]);
    }
    expect(heroToolName("pdf")).toBe("PDF Compressor");
  });

  it("every intent chip resolves to a live registry tool (no 404 chips)", () => {
    const bySlug = new Map(clientToolsRegistry.map((t) => [t.slug, t]));
    const check = (route: string) => {
      // /tools is the browse directory (fallback for unknown types), not a tool.
      if (route === "/tools") return;
      const m = route.match(/^\/([^/]+)\/([^/]+)$/);
      expect(m, `${route} must be a tool path`).not.toBeNull();
      const tool = bySlug.get(m![2]!);
      expect(tool, `${route} must exist`).toBeDefined();
      expect(tool!.category.toLowerCase().replace(/\s+/g, "-")).toBe(m![1]);
    };
    for (const kind of ["image", "video", "audio", "pdf", "document"] as const) {
      for (const intent of heroIntentsFor(kind, "")) check(intent.route);
      for (const intent of heroBulkIntentsFor(kind)) check(intent.route);
    }
    // Ext-aware bulk branches resolve too (HEIC/SVG batches skip the
    // canvas-blind generic converter for dedicated bulk tools).
    for (const ext of ["heic", "svg", "png", "mp4", "mp3", "pdf"]) {
      const t = ext === "mp4" ? "video" : ext === "mp3" ? "audio" : ext === "pdf" ? "pdf" : "image";
      for (const intent of heroBulkIntentsFor(t as never, ext)) check(intent.route);
    }
    expect(heroBulkIntentsFor("image", "heic")[0]!.route).toBe("/image/bulk-heic-to-jpg");
    expect(heroBulkIntentsFor("image", "svg")[0]!.route).toBe("/image/bulk-svg-to-png");
    expect(heroBulkIntentsFor("image", "png")[0]!.route).toBe("/image/bulk-image-converter");
    for (const ext of ["json", "csv", "txt", "md"]) {
      for (const intent of heroIntentsFor("other", ext)) check(intent.route);
    }
    // No duplicate chip ids per type (aria-pressed + selection need unique ids).
    for (const kind of ["image", "video", "audio", "pdf", "document"] as const) {
      const ids = heroIntentsFor(kind, "").map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("spreadsheets go to the CSV tool, decks fall back honestly", () => {    // The document converter cannot parse spreadsheets (verified accept list).
    expect(heroDocumentIntents("xls")[0]!.route).toBe("/converter/bulk-csv-excel-to-json");
    expect(heroDocumentIntents("xlsx")[0]!.route).toBe("/converter/bulk-csv-excel-to-json");
    expect(heroDocumentIntents("csv")[0]!.route).toBe("/converter/bulk-csv-excel-to-json");
    expect(heroDocumentIntents("docx")[0]!.route).toBe("/converter/document-converter");
    // No browser tool handles decks: honest directory fallback, no fake chip.
    expect(heroDocumentIntents("pptx")[0]!.route).toBe("/tools");
    expect(heroDocumentIntents("ods")[0]!.route).toBe("/tools");
    // CSV drops route to a real file tool, never the data generator.
    expect(heroIntentsFor("other", "csv")[0]!.route).toBe("/converter/bulk-csv-excel-to-json");
  });

  it("format-specific files never get a chip that ends in rejection", () => {    // Compressor accept is jpeg/png/webp only: exotic formats get converters.
    expect(heroIntentsFor("image", "heic").map((i) => i.route)).toEqual(["/image/heic-to-jpg"]);
    expect(heroIntentsFor("image", "svg").map((i) => i.route)).toEqual(["/image/svg-to-png"]);
    expect(heroIntentsFor("image", "gif").map((i) => i.route)).toEqual(["/image/gif-compressor", "/image/bulk-image-converter"]);
    expect(heroIntentsFor("image", "tiff")[0]!.route).toBe("/image/tiff-to-jpg");
    expect(heroIntentsFor("image", "bmp")[0]!.route).toBe("/image/bmp-to-jpg");
    expect(heroIntentsFor("image", "avif")[0]!.route).toBe("/image/avif-to-jpg");
    expect(heroIntentsFor("image", "ico")[0]!.route).toBe("/image/ico-to-jpg");
    expect(heroIntentsFor("image", "png").map((i) => i.id)).toEqual(["compress", "convert", "resize", "bg-remove"]);
    // AVI compresses nowhere but converts fine; WMV-class has no tool at all.
    const avi = heroIntentsFor("video", "avi").map((i) => i.id);
    expect(avi).not.toContain("compress");
    expect(avi).toContain("convert");
    expect(heroIntentsFor("video", "wmv")[0]!.route).toBe("/tools");
    expect(heroIntentsFor("video", "mp4").map((i) => i.id)).toEqual(["compress", "convert", "to-mp3"]);
    // MP3 extraction honors the broad video/* acceptor, not the mp4-only one.
    expect(heroIntentsFor("video", "mp4").find((i) => i.id === "to-mp3")!.route).toBe("/video/video-to-mp3");
  });

  it("chip caps mirror destination intake (box gating matches enforcement)", () => {    // Contract with smartMax: the box shows these numbers, tools enforce them.
    expect(smartMax("image/jpeg,image/png,image/webp")).toEqual({ signed: 20, free: 10 });
    expect(smartMax("video/mp4,video/quicktime,video/x-matroska,video/webm")).toEqual({ signed: 150, free: 30 });
    expect(smartMax("audio/*")).toEqual({ signed: 50, free: 20 });
    expect(smartMax("application/pdf")).toEqual({ signed: 40, free: 15 });
    expect(smartMax("image/gif")).toEqual({ signed: 20, free: 10 });
    // Every capAccept on a chip resolves through smartMax (no dead strings).
    const all = [
      ...heroIntentsFor("image", "png"),
      ...heroIntentsFor("video", "mp4"),
      ...heroIntentsFor("audio", "mp3"),
      ...heroIntentsFor("pdf", "pdf"),
      ...heroIntentsFor("image", "gif"),
    ];
    expect(all.filter((i) => i.capAccept).length).toBeGreaterThan(5);
    for (const intent of all) {
      if (!intent.capAccept) continue;
      const caps = smartMax(intent.capAccept);
      expect(caps.free).toBeGreaterThan(0);
      expect(caps.signed).toBeGreaterThanOrEqual(caps.free);
    }
  });

  it("homepage tabs preselect the matching intent, never a lie", () => {    expect(heroDefaultIntentId("image", "png", "convert")).toBe("convert");
    expect(heroDefaultIntentId("image", "png", "resize")).toBe("resize");
    expect(heroDefaultIntentId("pdf", "pdf", "compress")).toBe("compress");
    // Audio has no resize: falls back to the first chip, not a dead tab.
    expect(heroDefaultIntentId("audio", "mp3", "resize")).toBe("compress");
    expect(heroDefaultIntentId("other", "json", "convert")).toBe("format");
  });

  it("blocks executables, warns on renamed types, sizes honestly", () => {    expect(heroBlockReason("setup.exe")).not.toBeNull();
    expect(heroBlockReason("run.sh")).not.toBeNull();
    expect(heroBlockReason("photo.png")).toBeNull();
    expect(heroBlockReason("report.pdf")).toBeNull();
    expect(heroTypeWarning("video/mp4", "png")).not.toBeNull();
    expect(heroTypeWarning("image/png", "png")).toBeNull();
    expect(heroTypeWarning("", "png")).toBeNull();
    // Office MIME types are unreliable: never warn there.
    expect(heroTypeWarning("", "docx")).toBeNull();
    expect(heroSizeState(10 * 1024 * 1024, 30)).toBe("ok");
    expect(heroSizeState(50 * 1024 * 1024, 30)).toBe("over-cap");
    expect(heroSizeState(3 * 1024 * 1024 * 1024, 2000)).toBe("too-big");
    expect(heroExtOf("photo.HEIC")).toBe("heic");
    expect(heroExtOf("README")).toBe("");
  });

  it("every chip's cloud label matches the live locality verdict", () => {
    // A future cloud chip cannot ship unlabeled: the flag must equal
    // requiresCloudApi over the tool's real dependencies.
    const bySlug = new Map(toolsRegistry.map((t) => [t.slug, t]));
    const exts = ["jpg", "png", "heic", "svg", "gif", "tiff", "mp4", "avi", "wmv", "mp3", "pdf", "docx", "xls", "pptx", "json", "csv", "txt", "zip"];
    const seen = new Set<string>();
    for (const ext of exts) {
      const t = ext === "mp4" || ext === "avi" || ext === "wmv" ? "video"
        : ext === "mp3" ? "audio" : ext === "pdf" ? "pdf"
        : ["docx", "xls", "pptx"].includes(ext) ? "document"
        : ["jpg", "png", "heic", "svg", "gif", "tiff"].includes(ext) ? "image" : "other";
      const intents = [...heroIntentsFor(t as never, ext), ...heroBulkIntentsFor(t as never, ext)];
      for (const intent of intents) {
        if (seen.has(intent.route)) continue;
        seen.add(intent.route);
        if (intent.route === "/tools") continue;
        const slug = intent.route.split("/").pop()!;
        const tool = bySlug.get(slug);
        expect(tool, `${intent.route} must exist`).toBeDefined();
        expect(intent.cloud ?? false, `${slug} cloud label`).toBe(
          requiresCloudApi((tool as unknown as { dependencies?: string }).dependencies || "None"),
        );
      }
    }
  });

  it("heroCapFor resolves explicit, smartMax, then plan caps", () => {    expect(heroCapFor({ id: "x", label: "x", tool: "x", route: "/tools", capMB: { anon: 125, signed: 125 } }, false, 30)).toBe(125);
    expect(heroCapFor({ id: "x", label: "x", tool: "x", route: "/tools", capAccept: "application/pdf" }, false, 30)).toBe(15);
    expect(heroCapFor({ id: "x", label: "x", tool: "x", route: "/tools", capAccept: "application/pdf" }, true, 150)).toBe(40);
    expect(heroCapFor({ id: "x", label: "x", tool: "x", route: "/tools" }, false, 30)).toBe(30);
  });

  it("every chip destination consumes the homepage carry (no silent empty tool)", () => {
    // A chip that lands on a tool which ignores the stash reintroduces the
    // double-upload. Direct pickup, or a shared shell/uploader that has it.
    const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");
    const wrapper = read("src/components/tools/modules/DynamicModuleWrapper.tsx");
    const carries = (src: string, baseDir: string, depth = 0): boolean => {
      if (/heroFile|useHeroFilePickup|consumeHero/.test(src)) return true;
      if (depth >= 2) return false;
      // Follow local imports (wrappers like PdfEditor -> PdfEditorCore, and
      // the shared uploaders/shells) looking for the carry everywhere.
      const imports = [...src.matchAll(/from\s+['"]((?:\.{1,2}\/[^'"]+|@\/[^'"]+))['"]/g)].map((m) => m[1]);
      return imports.some((imp) => {
        if (!/(FileUploader|BulkToolShell|editor\/|modules\/pdf\/PdfEditor|Core)/.test(imp)) return false;
        const fp = imp.startsWith("@/")
          ? path.join(ROOT, "src", imp.replace(/^@\//, "") + ".tsx")
          : path.normalize(path.join(baseDir, imp + ".tsx"));
        if (!fs.existsSync(fp)) return false;
        return carries(fs.readFileSync(fp, "utf8"), path.dirname(fp), depth + 1);
      });
    };
    const exts = ["jpg", "png", "heic", "svg", "gif", "tiff", "bmp", "avif", "ico", "mp4", "avi", "wmv", "mp3", "pdf", "docx", "xls", "pptx", "json", "csv", "txt", "md"];
    const routes = new Set<string>();
    for (const ext of exts) {
      const t = ["mp4", "avi", "wmv"].includes(ext) ? "video" : ext === "mp3" ? "audio" : ext === "pdf" ? "pdf"
        : ["docx", "xls", "pptx"].includes(ext) ? "document"
        : ["jpg", "png", "heic", "svg", "gif", "tiff", "bmp", "avif", "ico"].includes(ext) ? "image" : "other";
      for (const i of [...heroIntentsFor(t as never, ext), ...heroBulkIntentsFor(t as never, ext)]) routes.add(i.route);
    }
    for (const route of routes) {
      if (route === "/tools") continue;
      const slug = route.split("/").pop()!;
      const m = wrapper.match(new RegExp(`'${slug}':\\s*dynamic\\(\\(\\)\\s*=>\\s*import\\('([^']+)'\\)`));
      expect(m, `${slug} must be wired in DynamicModuleWrapper`).not.toBeNull();
      const fp = "src/" + m![1].replace(/^@\//, "") + ".tsx";
      expect(fs.existsSync(path.join(ROOT, fp)), `${slug} component file must exist`).toBe(true);
      const src = read(fp);
      expect(carries(src, path.join(ROOT, path.dirname(fp))), `${slug} must consume the hero carry`).toBe(true);
    }
  });
});
