/**
 * Recursive JSON value type for walking parsed JSON without `any`.
 * Used by JSON-walking helpers across tool modules (third occurrence
 * triggers this extraction per the shared-tooling rule — this is it).
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
