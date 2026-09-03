"use client";

import { useEffect, useCallback, useRef } from "react";

interface ErrorPayload {
  message: string;
  stack?: string;
  source: "error-boundary" | "unhandled" | "promise-rejection" | "tool-error";
  toolSlug?: string;
  path?: string;
}

const QUEUE_KEY = "tzum_err_q";
const FLUSH_INTERVAL = 10_000;
const MAX_QUEUE = 20;

function getQueue(): ErrorPayload[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function setQueue(q: ErrorPayload[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch { /* quota */ }
}

function enqueue(err: ErrorPayload) {
  const q = getQueue();
  q.push(err);
  if (q.length > MAX_QUEUE) q.splice(0, q.length - MAX_QUEUE);
  setQueue(q);
}

async function flush() {
  const q = getQueue();
  if (q.length === 0) return;
  setQueue([]);
  try {
    await fetch("/api/error-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ errors: q }),
    });
  } catch {
    setQueue([...getQueue(), ...q]);
  }
}

function getToolSlugFromPath(path: string): string | undefined {
  const match = path.match(/\/([^/]+)\/([^/?]+)/);
  if (match) return match[2];
  return undefined;
}

export function ErrorLogger({ children }: { children: React.ReactNode }) {
  const flushedRef = useRef(false);

  const handleError = useCallback((event: ErrorEvent) => {
    if (event.error?.__logged) return;
    const path = typeof window !== "undefined" ? window.location.pathname : undefined;
    enqueue({
      message: event.message || String(event.error),
      stack: event.error?.stack?.slice(0, 1000),
      source: "unhandled",
      toolSlug: path ? getToolSlugFromPath(path) : undefined,
      path,
    });
  }, []);

  const handleRejection = useCallback((event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack?.slice(0, 1000) : undefined;
    const path = typeof window !== "undefined" ? window.location.pathname : undefined;
    enqueue({
      message,
      stack,
      source: "promise-rejection",
      toolSlug: path ? getToolSlugFromPath(path) : undefined,
      path,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") flush();
    }, FLUSH_INTERVAL);

    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [handleError, handleRejection]);

  useEffect(() => {
    if (!flushedRef.current) {
      flushedRef.current = true;
      flush();
    }
  }, []);

  return <>{children}</>;
}

export function logToolError(error: Error, toolSlug: string) {
  if ((error as Error & { __logged?: boolean }).__logged) return;
  Object.defineProperty(error, "__logged", { value: true });
  const path = typeof window !== "undefined" ? window.location.pathname : undefined;
  enqueue({
    message: error.message,
    stack: error.stack?.slice(0, 1000),
    source: "tool-error",
    toolSlug,
    path,
  });
  flush();
}

export function logErrorBoundaryError(error: Error, componentStack: string, toolSlug?: string) {
  const path = typeof window !== "undefined" ? window.location.pathname : undefined;
  enqueue({
    message: error.message,
    stack: (error.stack?.slice(0, 600) || "") + "\n\nComponent Stack:\n" + componentStack.slice(0, 400),
    source: "error-boundary",
    toolSlug: toolSlug || (path ? getToolSlugFromPath(path) : undefined),
    path,
  });
  flush();
}
