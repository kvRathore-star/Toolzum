declare module "opentype.js" {
  export type OpentypeNameRecord = {
    en?: string;
    enUS?: string;
    [key: string]: string | undefined;
  };
  export type OpentypeFontNames = {
    fontFamily?: OpentypeNameRecord;
    fontSubfamily?: OpentypeNameRecord;
    version?: OpentypeNameRecord;
  };
  export type OpentypeGlyphSet = {
    length: number;
    get(index: number): OpentypeGlyph;
  };
  export type OpentypeGlyph = {
    index?: number;
  };
  export type OpentypePath = {
    fill: string;
    draw(ctx: CanvasRenderingContext2D): void;
  };
  export type OpentypeFont = {
    names?: OpentypeFontNames;
    glyphs: OpentypeGlyphSet;
    unitsPerEm?: number;
    ascender?: number;
    descender?: number;
    getPath: (text: string, x: number, y: number, size: number) => OpentypePath;
    charToGlyph: (char: string) => OpentypeGlyph;
    toArrayBuffer: () => ArrayBuffer;
  };
  export function parse(buffer: ArrayBuffer): OpentypeFont;
  export function load(
    url: string,
    callback: (err: Error | null, font?: OpentypeFont) => void
  ): void;
  export const Font: new (options: Record<string, unknown>) => OpentypeFont;
}
