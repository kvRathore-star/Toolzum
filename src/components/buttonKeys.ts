"use client";

import React, { useRef, useCallback } from "react";

/**
 * Shared keyboard activation for `role="button"` elements.
 *
 * ARIA button pattern (Enter and Space are NOT interchangeable):
 * - Enter fires on keydown.
 * - Space fires on keyup, with preventDefault() on keydown to stop
 *   the page from scrolling.
 *
 * Kept as named functions (not a props-spread object) so that
 * `onKeyDown` / `onKeyUp` appear as literal JSX attributes — the
 * jsx-a11y rules cannot see through `{...spread}` and would still fail.
 *
 * Usage: <div role="button" tabIndex={0} onClick={open}
 *              onKeyDown={(e) => buttonKeyDown(e, open)}
 *              onKeyUp={(e) => buttonKeyUp(e, open)} />
 */
export function buttonKeyDown(e: React.KeyboardEvent, onActivate: () => void) {
  if (e.key === "Enter") {
    e.preventDefault();
    onActivate();
  } else if (e.key === " ") {
    // Space activates on keyup; prevent scroll here.
    e.preventDefault();
  }
}

export function buttonKeyUp(e: React.KeyboardEvent, onActivate: () => void) {
  if (e.key === " ") {
    e.preventDefault();
    onActivate();
  }
}

/**
 * Native file pickers return focus nowhere when cancelled (the <input> is
 * display:none, so it can't take focus) — focus falls to <body> and the next
 * Space press scrolls the page instead of reopening the picker. This hook
 * pulls focus back to the dropzone after every picker interaction.
 *
 * Usage: spread `ref={dropRef}` on the dropzone div, call `armReturn()`
 * right before opening the picker, and `focusDrop()` after handling files.
 */
export function usePickerFocusReturn<T extends HTMLElement>() {
  const dropRef = useRef<T>(null);

  const focusDrop = useCallback(() => {
    dropRef.current?.focus();
  }, []);

  const armReturn = useCallback(() => {
    const timer = window.setTimeout(
      () => window.removeEventListener("focus", onFocus),
      60_000,
    );
    function onFocus() {
      window.clearTimeout(timer);
      window.removeEventListener("focus", onFocus);
      dropRef.current?.focus();
    }
    window.addEventListener("focus", onFocus);
  }, []);

  return { dropRef, armReturn, focusDrop };
}
