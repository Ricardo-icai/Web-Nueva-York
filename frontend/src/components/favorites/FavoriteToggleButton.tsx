"use client";

import { useEffect, useState } from "react";
import { loadFavorites, saveFavorites } from "@/lib/user-data";

export const FAVORITES_UPDATED_EVENT = "nyc-favorites-updated";

type Props = {
  baseKey: string;
  favoriteType: string;
  itemId: string;
  className?: string;
};

export default function FavoriteToggleButton({ baseKey, favoriteType, itemId, className }: Props) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const ids = await loadFavorites(baseKey, favoriteType);
      if (active) {
        setFavorites(ids);
        setLoaded(true);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [baseKey, favoriteType]);

  const favorite = favorites.includes(itemId);

  async function toggle() {
    const next = favorite ? favorites.filter((id) => id !== itemId) : [...favorites, itemId];
    setFavorites(next);
    await saveFavorites(baseKey, favoriteType, next);
    window.dispatchEvent(new CustomEvent(FAVORITES_UPDATED_EVENT, { detail: { baseKey, favoriteType } }));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!loaded}
      className={className ?? "rounded-full border border-amber-400 px-3 py-1 text-xs font-semibold text-amber-700 disabled:opacity-60"}
    >
      {favorite ? "Favorito guardado" : "Favorito"}
    </button>
  );
}
