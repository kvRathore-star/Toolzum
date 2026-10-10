declare module "utif" {
  export function decode(buffer: ArrayBuffer): any[];
  export function toRGBA8(ifd: any): Uint8Array;
  export function encodeImage(rgba: Uint8Array | Uint8ClampedArray, w: number, h: number): Uint8Array;
  export function encode(ifds: any[]): Uint8Array;
}

declare module "ical" {
  interface ICalEvent {
    summary?: string;
    description?: string;
    location?: string;
    start?: Date;
    end?: Date;
    [key: string]: any;
  }
  export function parseICS(data: string): Record<string, ICalEvent>;
}

declare module "vcard-parser" {
  export interface VCardData {
    fn?: string[];
    n?: string[];
    tel?: string[];
    email?: string[];
    adr?: string[];
    org?: string[];
    title?: string[];
    url?: string[];
    note?: string[];
    [key: string]: string | Array<string | { value?: string }> | { value?: string } | undefined;
  }
  export function parse(vcf: string): VCardData[];
}

// regenerator-runtime ships no types. Only the side-effect polyfill entry is
// imported (registerFontkitOnce in PdfEditorCore — @pdf-lib/fontkit's Babel
// generated StateMachine.match calls the global regeneratorRuntime).
declare module "regenerator-runtime/runtime";

// gif.js.optimized ships no types. Default export is the GIF constructor
// (UMD); the worker script is served same-origin at /gif.worker.js.
declare module "gif.js.optimized" {
  interface GifOptions {
    workers?: number;
    quality?: number;
    workerScript?: string;
    width?: number;
    height?: number;
    [key: string]: unknown;
  }
  interface GifFrameOptions {
    copy?: boolean;
    delay?: number;
    [key: string]: unknown;
  }
  class GIF {
    constructor(opts?: GifOptions);
    addFrame(el: HTMLCanvasElement, opts?: GifFrameOptions): void;
    on(ev: "finished", cb: (blob: Blob) => void): void;
    on(ev: string, cb: (...args: never[]) => void): void;
    render(): void;
  }
  export default GIF;
}
