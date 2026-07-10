const TELEMETRY_KEY = "th_telemetry";
const MAX_EVENTS = 100;

interface TelemetryEvent {
  type: "error" | "tool_use" | "download" | "page_view";
  ts: number;
  data: Record<string, string>;
}

function read(): TelemetryEvent[] {
  try {
    const raw = localStorage.getItem(TELEMETRY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(events: TelemetryEvent[]) {
  try {
    localStorage.setItem(TELEMETRY_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch { }
}

function push(type: TelemetryEvent["type"], data: Record<string, string>) {
  const events = read();
  events.push({ type, ts: Date.now(), data });
  write(events);
}

export function trackError(error: Error, context?: string) {
  push("error", {
    message: error.message.slice(0, 200),
    context: context || "unknown",
    url: location.pathname,
  });
}

export function trackToolUse(slug: string) {
  push("tool_use", { slug, url: location.pathname });
}

export function trackDownload(slug: string) {
  push("download", { slug, url: location.pathname });
}

export function trackPageView() {
  push("page_view", { url: location.pathname });
}

// Install global error handler (call once in root layout)
export function initTelemetry() {
  if (typeof window === "undefined") return;

  const orig = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (error) trackError(error, "global");
    if (typeof orig === "function") {
      orig.call(window, message, source, lineno, colno, error);
    }
  };

  window.addEventListener("unhandledrejection", (e) => {
    trackError(e.reason instanceof Error ? e.reason : new Error(String(e.reason)), "promise");
  });
}

// For debugging — dump events to console
export function dumpTelemetry() {
  console.table(read());
}
