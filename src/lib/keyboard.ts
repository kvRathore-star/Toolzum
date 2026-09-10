"use client";
import { useCallback, useEffect } from "react";

export function useEnterToSubmit(onSubmit: () => void) {
  return useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        onSubmit();
      }
    },
    [onSubmit]
  );
}

export function useEscapeToClose(onClose: () => void) {
  return useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );
}

export function useHotkey(key: string, handler: () => void, deps: unknown[] = []) {
  // eslint-disable-next-line react-hooks/use-memo -- deps is caller-controlled by API design (pass-through memo inputs)
  const callback = useCallback(() => handler(), deps);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === key &&
        !e.repeat &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement)
      ) {
        e.preventDefault();
        callback();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, callback]);
}

export function getAriaLabel(iconOnly: boolean, label?: string, tooltip?: string): string | undefined {
  if (!iconOnly) return undefined;
  return label || tooltip || undefined;
}
