"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Dialog a11y: initial focus, focus trap (Tab wrap), Escape to close,
 * body scroll lock (optional), and focus restore on unmount.
 */
export function useDialogA11y<T extends HTMLElement>(
  active: boolean,
  onClose: () => void,
  opts?: { lockScroll?: boolean; trap?: boolean }
) {
  const ref = useRef<T>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const lockScroll = opts?.lockScroll ?? true;
  const trap = opts?.trap ?? true;

  useEffect(() => {
    if (!active) return;
    prevFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const node = ref.current;

    const t = window.setTimeout(() => {
      const first =
        node?.querySelector<HTMLElement>(FOCUSABLE) ??
        (node as unknown as HTMLElement | null);
      first?.focus?.();
    }, 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !trap || !node) return;
      const items = Array.from(
        node.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null);
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0]!;
      const last = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);

    const prevOverflow = document.body.style.overflow;
    if (lockScroll) document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey, true);
      if (lockScroll) document.body.style.overflow = prevOverflow;
      prevFocus.current?.focus?.();
    };
  }, [active, lockScroll, trap]);

  return ref;
}
