"use client";

import { useState, useCallback } from 'react';

export type Direction = 'forward' | 'reverse';

interface BidirectionalConfig<T> {
  initialMode?: T;
  forwardLabel?: string;
  reverseLabel?: string;
  onSwap?: (input: string, output: string) => { input: string; output: string };
}

export function useBidirectional<T extends string = Direction>(
  config: BidirectionalConfig<T> = {}
) {
  const [mode, setMode] = useState<T>((config.initialMode || 'forward') as T);

  const toggle = useCallback(() => {
    setMode(prev =>
      prev === ('forward' as T)
        ? ('reverse' as T)
        : ('forward' as T)
    );
  }, []);

  const swap = useCallback(<T>(input: T, output: T): { input: T; output: T } => {
    return { input: output, output: input };
  }, []);

  return { mode, setMode, toggle, swap };
}
