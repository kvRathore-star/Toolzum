import { describe, it, expect } from "vitest";
import { stripQuoted, stripHtml, toBytes, cleanFileName } from "../../workers/mail-bridge/src/util";

describe("stripQuoted", () => {
  it("keeps the reply and drops the Gmail quote", () => {
    const text = `Thanks for the quick fix!\n\nOn Sun, Oct 4, 2026 at 6:48 PM Toolzum Support <contact@toolzum.com> wrote:\n> We got your message\n> more quoted`;
    expect(stripQuoted(text)).toBe("Thanks for the quick fix!");
  });

  it("drops an Outlook-style quote block", () => {
    const text = `Looks good.\n\nFrom: Toolzum Support\nSent: Sunday, October 4, 2026 6:48 PM\nTo: user@example.com\nSubject: Re: We got your message`;
    expect(stripQuoted(text)).toBe("Looks good.");
  });

  it("drops an Original Message separator", () => {
    const text = `Agreed.\n\n---------- Original Message ----------\nFrom: Someone`;
    expect(stripQuoted(text)).toBe("Agreed.");
  });

  it("drops a forwarded message separator", () => {
    const text = `See below.\n\n---------- Forwarded message ----------\nFrom: A`;
    expect(stripQuoted(text)).toBe("See below.");
  });

  it("drops the Dutch Outlook Verzonden separator", () => {
    const text = `Prima zo.\n\n---------- Verzonden bericht ----------\nVan: Toolzum`;
    expect(stripQuoted(text)).toBe("Prima zo.");
  });

  it("returns text untouched when no marker exists", () => {
    const text = "Just a plain message with no history at all.";
    expect(stripQuoted(text)).toBe(text);
  });

  it("keeps content written BELOW a quoted > line (no bare-> cutting)", () => {
    const text = `About your question:\n> can you explain the export options?\nHere is my answer: use CSV, it round-trips cleanly.`;
    expect(stripQuoted(text)).toBe(text);
  });

  it("returns text untouched when the marker is at index 0 (nothing to keep but nothing safe to cut)", () => {
    const text = "On Sun, Oct 4, 2026 someone wrote:\nonly quoted content";
    expect(stripQuoted(text)).toBe(text);
  });

  it("trailing whitespace before the marker is trimmed", () => {
    const text = `My reply.\n   \nOn Sun someone wrote:\n> old`;
    expect(stripQuoted(text)).toBe("My reply.");
  });
});

describe("stripHtml", () => {
  it("converts block breaks to newlines and strips tags", () => {
    expect(stripHtml("<p>Hello<br>world</p><p>two</p>")).toBe("Hello\nworld\ntwo");
  });

  it("decodes the common entities", () => {
    expect(stripHtml("a &amp; b &lt;c&gt; &quot;d&quot; &#039;e&#039;&nbsp;f")).toBe(
      'a & b <c> "d" \'e\' f'
    );
  });

  it("collapses runs of blank lines", () => {
    expect(stripHtml("<p>a</p><div></div><div></div><div></div><p>b</p>")).toBe("a\n\nb");
  });
});

describe("toBytes", () => {
  it("decodes base64 strings", () => {
    expect([...toBytes("aGVsbG8=")]).toEqual([...new TextEncoder().encode("hello")]);
  });

  it("passes through Uint8Array", () => {
    const u8 = new Uint8Array([1, 2, 3]);
    expect(toBytes(u8)).toBe(u8);
  });

  it("wraps ArrayBuffer", () => {
    const buf = new TextEncoder().encode("xy").buffer;
    expect(toBytes(buf as ArrayBuffer)).toEqual(new Uint8Array([120, 121]));
  });

  it("falls back to UTF-8 for non-base64 strings", () => {
    expect(toBytes("plain!")).toEqual(new TextEncoder().encode("plain!"));
  });
});

describe("cleanFileName", () => {
  it("strips header-breaking characters", () => {
    expect(cleanFileName('re\r\nport "x"/y<z>.txt', 0)).toBe('report xyz.txt');
  });

  it("generates a fallback name", () => {
    expect(cleanFileName(null, 2)).toBe("attachment-3");
    expect(cleanFileName("", 0)).toBe("attachment-1");
    expect(cleanFileName('"""', 1)).toBe("attachment-2");
  });

  it("caps length at 200", () => {
    expect(cleanFileName("a".repeat(500), 0)).toHaveLength(200);
  });
});
