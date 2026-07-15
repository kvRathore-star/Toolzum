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
  interface VCardData {
    fn?: string[];
    n?: string[];
    tel?: string[];
    email?: string[];
    adr?: string[];
    org?: string[];
    title?: string[];
    url?: string[];
    note?: string[];
    [key: string]: any;
  }
  export function parse(vcf: string): VCardData[];
}
