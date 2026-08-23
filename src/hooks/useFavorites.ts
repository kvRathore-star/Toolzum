"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";

export function useFavorites() {
  const { data: session } = useSession();
  const isSignedIn = !!session?.user;
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      setFavorites(new Set());
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetch("/api/favorites/list")
      .then(r => r.json() as Promise<{ toolSlug: string }[]>)
      .then(rows => {
        setFavorites(new Set(rows.map(r => r.toolSlug)));
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isSignedIn]);

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
        // Rollback
        setFavorites(prev => {
          const next = new Set(prev);
          if (wasFav) next.add(slug);
          else next.delete(slug);
          return next;
        });
      }
    } catch {
      // Rollback on network error
      setFavorites(prev => {
        const next = new Set(prev);
        if (wasFav) next.add(slug);
        else next.delete(slug);
        return next;
      });
    }
  }, [favorites]);

  return { favorites, isLoading, toggleFavorite, isSignedIn };
}
