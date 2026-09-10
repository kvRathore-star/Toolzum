"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";

export function useFavorites() {
  const { data: session, isPending } = useSession();
  const isSignedIn = !!session?.user;
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isPending) return;
    if (!isSignedIn) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- favorites reset on sign-out (state sync with auth, not derived render state)
      setFavorites(new Set());
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetch("/api/favorites/list")
      .then(r => {
        if (!r.ok) throw new Error("Failed to load favorites");
        return r.json() as Promise<{ toolSlug: string }[]>;
      })
      .then(rows => {
        setFavorites(new Set(rows.map(r => r.toolSlug)));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isSignedIn, isPending]);

  const toggleFavorite = useCallback(async (slug: string) => {
    const wasFav = favorites.has(slug);
    // Optimistic update
    setFavorites(prev => {
      const next = new Set(prev);
      if (wasFav) next.delete(slug);
      else next.add(slug);
      return next;
    });
    try {
      const endpoint = wasFav ? "/api/favorites/remove" : "/api/favorites/add";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolSlug: slug }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error || "Request failed");
      }
    } catch (err) {
      // Rollback on failure
      setFavorites(prev => {
        const next = new Set(prev);
        if (wasFav) next.add(slug);
        else next.delete(slug);
        return next;
      });
      throw err;
    }
  }, [favorites]);

  return { favorites, isLoading, toggleFavorite, isSignedIn };
}
