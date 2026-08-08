"use client";
import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export function OfflineIndicator() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- seed initial online/offline state before subscribing to browser events
    setOffline(!navigator.onLine);
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-900/90 text-emerald-100 text-xs font-medium rounded-full shadow-lg backdrop-blur-sm flex items-center gap-2 border border-emerald-700/50">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline mode — processing still works! Files stay on your device.</span>
    </div>
  );
}
