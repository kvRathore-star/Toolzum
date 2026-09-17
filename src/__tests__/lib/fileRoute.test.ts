import { describe, it, expect } from "vitest";
import { detectFileType, heroRouteFor, heroToolName } from "@/lib/fileRoute";
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
});
