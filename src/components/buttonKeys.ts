"use client";

import React from "react";

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
