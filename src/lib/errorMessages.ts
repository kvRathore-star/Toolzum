/**
 * User-facing error classification. Maps raw throwables to the friendly
 * title/message pair shown by ErrorMessage. One place so all three
 * boundaries (tool ErrorBoundary, GlobalErrorBoundary, app/error.tsx)
 * describe the same failure the same way.
 */

export type ErrorKind = "memory" | "load" | "network" | "unknown";

export interface FriendlyError {
  kind: ErrorKind;
  title: string;
  message: string;
}

const MEMORY_RE = /memory|allocation|out of memory|wasm.*memory|array buffer/i;
const LOAD_RE = /loading|chunk|module|import\(|dynamically|failed to fetch|network|offline|timeout/i;

export function classifyError(error: unknown): FriendlyError {
  const msg = error instanceof Error ? error.message : String(error ?? "");
  if (MEMORY_RE.test(msg)) {
    return {
      kind: "memory",
      title: "Browser memory limit reached",
      message:
        "Large files may exceed browser memory limits on some devices. Try smaller batches, close other tabs, or use a desktop browser.",
    };
  }
  if (LOAD_RE.test(msg)) {
    return {
      kind: "load",
      title: "Failed to load this tool",
      message:
        "The tool code or its engine (WASM/AI model) didn't finish loading. Check your connection and retry — large first-time downloads can take a minute.",
    };
  }
  if (!msg) {
    return {
      kind: "unknown",
      title: "Something went wrong",
      message: "An unexpected error occurred. Retry, or refresh the page to start clean.",
    };
  }
  return {
    kind: "network",
    title: "Something went wrong",
    message: msg,
  };
}
