declare module "opentype.js" {
  export function parse(buffer: ArrayBuffer): Record<string, unknown>;
  export function load(
    url: string,
    callback: (err: Error | null, font?: Record<string, unknown>) => void
  ): void;
}
