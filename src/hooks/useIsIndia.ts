"use client";

import { useState, useEffect } from "react";
import { isIndiaFromCookie, isIndiaFromTz, isIndiaFromIp } from "@/lib/geo";

export function useIsIndia(initial = false): boolean {
  const [isIndia, setIsIndia] = useState(initial);

  useEffect(() => {
    if (isIndiaFromCookie() || isIndiaFromTz()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- fast-path geo detection from cookie/timezone on mount
      setIsIndia(true);
      return;
    }
    isIndiaFromIp().then(setIsIndia);
  }, []);

  return isIndia;
}
