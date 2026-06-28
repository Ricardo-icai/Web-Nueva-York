"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SearchItem = {
  id: string;
  name: string;
  neighborhood?: string | null;
  googleMapsUrl: string;
};

type Props = {
  items: SearchItem[];
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function RestaurantSearch({ items }: Props) {
  const [query, setQuery] = useState("");

  const normalizedQuery = normalize(query);
  const suggestions = useMemo(() => {
    if (!normalizedQuery) return [];
    return items
      .filter((item) => normalize(item.name).includes(normalizedQuery))
      .slice(0, 6);
  }, [items, normalizedQuery]);

  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(`${query} restaurant new york`)}`;

  return (
    <div className="nyc-hard-card-white space-y-3 p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-red-700">Buscar por nombre</p>
          <h2 className="mt-1 font-american-diner text-3xl text-slate-950">¿Ya sabes a dónde quieres ir?</h2>
        </div>
        {query.trim() && suggestions.length === 0 ? (
          <a href={googleUrl} target="_blank" className="nyc-action px-4 py-2 text-xs">
            Buscar en Google
          </a>
        ) : null}
      </div>

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Escribe el nombre del sitio"
        className="h-12 w-full rounded-2xl border-2 border-slate-950 bg-white px-4 text-sm font-bold text-slate-950 outline-none focus:ring-2 focus:ring-red-700"
      />

      {query.trim() ? (
        suggestions.length > 0 ? (
          <div className="grid gap-2">
            {suggestions.map((item) => (
              <Link
                key={item.id}
                href={item.googleMapsUrl}
                target="_blank"
                className="nyc-smooth-card rounded-2xl border border-slate-200 bg-[#fffdf4] px-4 py-3"
              >
                <p className="text-sm font-black text-slate-950">{item.name}</p>
                <p className="mt-1 text-xs font-semibold text-slate-600">{item.neighborhood ?? "Restaurante en la web"}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-[#fffdf4] px-4 py-3 text-sm font-semibold text-slate-700">
            No lo tengo en la web. Puedes buscarlo en Google.
          </div>
        )
      ) : null}
    </div>
  );
}
