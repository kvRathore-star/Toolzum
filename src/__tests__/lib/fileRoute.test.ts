import { describe, it, expect } from "vitest";
import { detectFileType, heroRouteFor, heroToolName, heroIntentsFor, heroBulkIntentsFor, heroDefaultIntentId, heroDocumentIntents, heroBlockReason, heroTypeWarning, heroSizeState, heroExtOf } from "@/lib/fileRoute";
import { clientToolsRegistry } from "@/registry/tools-client-index";

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

  it("format-specific files never get a chip that ends in rejection", () => {
    // Compressor accept is jpeg/png/webp only: exotic formats get converters.
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

  it("homepage tabs preselect the matching intent, never a lie", () => {    expect(heroDefaultIntentId("image", "png", "convert")).toBe("convert");
    expect(heroDefaultIntentId("image", "png", "resize")).toBe("resize");
    expect(heroDefaultIntentId("pdf", "pdf", "compress")).toBe("compress");
    // Audio has no resize: falls back to the first chip, not a dead tab.
    expect(heroDefaultIntentId("audio", "mp3", "resize")).toBe("compress");
    expect(heroDefaultIntentId("other", "json", "convert")).toBe("format");
  });

  it("blocks executables, warns on renamed types, sizes honestly", () => {
    expect(heroBlockReason("setup.exe")).not.toBeNull();
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
});
