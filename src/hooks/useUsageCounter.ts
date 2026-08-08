"use client";

import { useState, useEffect, useCallback } from "react";

type UsagePeriod = "day" | "month";

function periodKey(period: UsagePeriod): string {
  const now = new Date();
  return period === "month"
    ? `${now.getFullYear()}-${now.getMonth()}`
    : now.toISOString().split("T")[0];
}

export function useUsageCounter(storageKey: string, period: UsagePeriod = "day") {
  const [usage, setUsage] = useState(0);

  useEffect(() => {
    const key = periodKey(period);
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as { date?: string; month?: string; count?: number };
      const storedKey = period === "month" ? parsed.month : parsed.date;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate persisted usage counter for the current period
      setUsage(storedKey === key ? parsed.count ?? 0 : 0);
    } catch {
      setUsage(0);
    }
  }, [storageKey, period]);

  const trackUsage = useCallback(
    (count: number) => {
      const key = periodKey(period);
      const payload = period === "month" ? { month: key, count } : { date: key, count };
      localStorage.setItem(storageKey, JSON.stringify(payload));
      setUsage(count);
    },
    [storageKey, period]
  );

  return { usage, trackUsage };
}
