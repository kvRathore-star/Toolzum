"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { FavoritesSignInModal } from "@/components/FavoritesSignInModal";
import toast from "react-hot-toast";

export function FavoriteStarButton({ slug }: { slug: string }) {
  const { favorites, toggleFavorite, isSignedIn, isLoading } = useFavorites();
  const [showSignIn, setShowSignIn] = useState(false);
  const [toggling, setToggling] = useState(false);
  const isFav = favorites.has(slug);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn) {
      setShowSignIn(true);
      return;
    }
    if (toggling) return;
    setToggling(true);
    try {
      await toggleFavorite(slug);
      toast.success(isFav ? "Removed from favorites" : "Added to favorites");
    } catch {
      toast.error("Failed to update favorites");
    } finally {
      setToggling(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading || toggling}
        className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)] hover:text-amber-400 transition-colors cursor-pointer disabled:opacity-50"
        title={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        <Star
          className={`w-3.5 h-3.5 transition-colors ${
            isFav
              ? "fill-amber-400 text-amber-400"
              : "text-[var(--text-muted)]"
          }`}
        />
        Fav
      </button>
      {showSignIn && <FavoritesSignInModal onClose={() => setShowSignIn(false)} />}
    </>
  );
}
