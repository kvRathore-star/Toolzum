"use client";
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

export function MemoryWatchdog() {
  useEffect(() => {
    const shown = sessionStorage.getItem('th_watchdog_toasted');
    if (shown) return;

    const nav = navigator as NavigatorWithMemory;
    if (nav.deviceMemory !== undefined && nav.deviceMemory < 4) {
      toast('Low-RAM Mode Activated. Processing may take longer.', {
        icon: '⚡',
        style: {
          borderRadius: '10px',
          background: '#18181b',
          color: '#fbbf24',
          border: '1px solid rgba(251, 191, 36, 0.2)',
        },
        id: 'memory-watchdog',
      });
      sessionStorage.setItem('th_watchdog_toasted', '1');
    }
  }, []);

  return null;
}
