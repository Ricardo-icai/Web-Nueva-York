"use client";

import { useEffect, useMemo, useState } from "react";
import { FAVORITES_UPDATED_EVENT } from "@/components/favorites/FavoriteToggleButton";
import { loadFavorites } from "@/lib/user-data";

export type FavoriteRailItem = {
  id: string;
  name: string;
  meta?: string;
  href?: string;
};

type Props = {
  baseKey: string;
  favoriteType: string;
  items: FavoriteRailItem[];
  title?: string;
};

export default function FavoritesRail({ baseKey, favoriteType, items, title = "Favoritos" }: Props) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    async function refresh() {
      const ids = await loadFavorites(baseKey, favoriteType);
      if (active) setFavorites(ids);
    }

    void refresh();
    function onFavoritesUpdated(event: Event) {
      const detail = (event as CustomEvent<{ baseKey?: string; favoriteType?: string }>).detail;
      if (detail?.baseKey === baseKey && detail?.favoriteType === favoriteType) void refresh();
    }

    window.addEventListener(FAVORITES_UPDATED_EVENT, onFavoritesUpdated);
    return () => {
      active = false;
      window.removeEventListener(FAVORITES_UPDATED_EVENT, onFavoritesUpdated);
    };
  }, [baseKey, favoriteType]);

  const favoriteItems = useMemo(() => {
    const byId = new Map(items.map((item) => [item.id, item]));
    return favorites.map((id) => byId.get(id)).filter((item): item is FavoriteRailItem => Boolean(item));
  }, [favorites, items]);

  return (
    <section className="mx-auto mt-6 max-w-6xl rounded-md border-2 border-slate-950 bg-white p-4 shadow-[5px_5px_0_#111827]">
      <h2 className="font-american-diner text-2xl text-slate-950">{title}</h2>
      {favoriteItems.length === 0 ? (
        <p className="mt-2 text-sm font-semibold text-slate-600">Aun no has marcado favoritos.</p>
      ) : (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {favoriteItems.map((item) => {
            const content = (
              <>
                <p className="text-sm font-black text-slate-950">{item.name}</p>
                {item.meta ? <p className="mt-1 text-xs font-semibold text-slate-600">{item.meta}</p> : null}
              </>
            );

            return item.href ? (
              <a key={item.id} href={item.href} className="min-w-56 rounded-md border border-stone-200 bg-[#fffdf4] p-3">
                {content}
              </a>
            ) : (
              <div key={item.id} className="min-w-56 rounded-md border border-stone-200 bg-[#fffdf4] p-3">
                {content}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
