/**
 * WASM Module Loader
 *
 * Lazy-loads WebAssembly modules for client-side processing.
 * All WASM files live in /public/wasm/ and are served with
 * immutable cache headers (see next.config.ts).
 */

export interface WasmModule {
  instance: WebAssembly.Instance;
  exports: WebAssembly.Exports;
}

const moduleCache = new Map<string, WebAssembly.Module>();

/**
 * Load and instantiate a WASM module from the public directory.
 * Modules are cached (compiled) in-memory after first fetch.
 *
 * @param name - File name (e.g., "bg-remover.wasm") in /public/wasm/
 * @param imports - WebAssembly import object
 * @returns Instantiated WASM module
 */
export async function loadWasm(
  name: string,
  imports: WebAssembly.Imports = {}
): Promise<WasmModule> {
  let compiled = moduleCache.get(name);

  if (!compiled) {
    const response = await fetch(`/wasm/${name}`);
    if (!response.ok) {
      throw new Error(`Failed to load WASM: ${name} (HTTP ${response.status})`);
    }

    const bytes = await response.arrayBuffer();
    compiled = await WebAssembly.compile(bytes);
    moduleCache.set(name, compiled);
  }

  const instance = await WebAssembly.instantiate(compiled, imports);
  return { instance, exports: instance.exports };
}

/**
 * Check if WebAssembly is supported in the current browser.
 */
export function isWasmSupported(): boolean {
  return (
    typeof WebAssembly === "object" &&
    typeof WebAssembly.instantiate === "function"
  );
}

/**
 * Preload a WASM module (fires fetch but doesn't wait).
 * Use for critical-path modules to warm the cache.
 */
export function preloadWasm(name: string): void {
  if (moduleCache.has(name)) return;
  fetch(`/wasm/${name}`)
    .then((r) => {
      if (!r.ok) return;
      return r.arrayBuffer();
    })
    .then((buf) => buf && WebAssembly.compile(buf))
    .then((mod) => mod && moduleCache.set(name, mod))
    .catch((e) => {
      if (process.env.NODE_ENV !== 'production') console.warn('Wasm preload failed:', e);
    });
}

/**
 * Create a standard shared memory buffer for WASM <-> JS interop.
 */
export function createSharedBuffer(size: number): WebAssembly.Memory {
  const pages = Math.ceil(size / 65536);
  return new WebAssembly.Memory({ initial: pages, maximum: pages * 2 });
}