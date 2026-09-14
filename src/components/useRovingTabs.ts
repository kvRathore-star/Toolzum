"use client";

import { useCallback } from "react";

/**
 * Roving-tabindex arrow-key nav for APG tab patterns (automatic activation).
 *
 * Usage:
 *   const tabs = useRovingTabs(ids, activeId, setActiveId, "data-mytabs");
 *   <div role="tablist" onKeyDown={tabs.onKeyDown}>
 *     {ids.map(id => <button role="tab" {...tabs.tabProps(id)} ... />)}
 *
 * ArrowLeft/Right/Up/Down + Home/End move focus AND select. Tab order
 * stays single-stop via roving tabindex. Focus moves via a data attribute
 * so tab buttons need no individual refs.
 */
export function useRovingTabs<T extends string>(
  ids: readonly T[],
  activeId: T,
  onChange: (id: T) => void,
  attr = "data-roving-tab",
) {
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const i = ids.indexOf(activeId);
      let next: T | null = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        next = ids[(i + 1) % ids.length]!;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        next = ids[(i - 1 + ids.length) % ids.length]!;
      } else if (e.key === "Home") {
        next = ids[0]!;
      } else if (e.key === "End") {
        next = ids[ids.length - 1]!;
      }
      if (next !== null) {
        e.preventDefault();
        onChange(next);
        document
          .querySelector<HTMLElement>(`[${attr}="${next}"]`)
          ?.focus();
      }
    },
    [ids, activeId, onChange, attr],
  );

  const tabProps = useCallback(
    (id: T) => ({
      [attr]: id,
      tabIndex: activeId === id ? 0 : -1,
    }),
    [attr, activeId],
  );

  return { onKeyDown, tabProps };
}
