"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import Link from "next/link";
import { useMemo, useState } from "react";

type ShoppingSearchItem = {
  id: string;
  name: string;
  neighborhood?: string | null;
  category?: string | null;
  officialWebsite?: string | null;
  googleMapsUrl: string;
  directionsUrl?: string | null;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function ShoppingSearch({ items }: { items: ShoppingSearchItem[] }) {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");

  const normalizedQuery = normalize(query);
  const suggestions = useMemo(() => {
    if (!normalizedQuery) return [];
    return items
      .filter((item) => {
        const searchable = [item.name, item.neighborhood ?? "", item.category ?? ""].join(" ");
        return normalize(searchable).includes(normalizedQuery);
      })
      .slice(0, 6);
  }, [items, normalizedQuery]);

  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(`${query} ${language === "en" ? "shopping" : "compras"} new york`)}`;

  return (
    <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#fffdf7,#f8f4eb)] px-5 py-6 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[30px] border border-slate-200 bg-white/92 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="font-american-diner text-3xl text-slate-950 sm:text-4xl">{language === "en" ? "Search" : "Buscar"}</div>
            {query.trim() && suggestions.length === 0 ? (
              <a href={googleUrl} target="_blank" rel="noreferrer" className="nyc-action px-4 py-2 text-xs">
                {language === "en" ? "Search on Google" : "Buscar en Google"}
              </a>
            ) : null}
          </div>

          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={language === "en" ? "Example: sneakers, SoHo, Tiffany, outlet..." : "Ejemplo: sneakers, SoHo, Tiffany, outlet..."}
            className="mt-4 h-12 w-full rounded-2xl border-2 border-slate-950 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:ring-2 focus:ring-red-700"
          />

          {query.trim() ? (
            suggestions.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {suggestions.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-[#fffdf4] p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                    <p className="text-sm font-black text-slate-950">{item.name}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      {[item.neighborhood, item.category].filter(Boolean).join(" · ")}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {item.officialWebsite ? (
                        <Link href={item.officialWebsite} target="_blank" className="rounded-full border border-slate-950 px-3 py-2 font-black text-slate-950">
                          {language === "en" ? "Official website" : "Web oficial"}
                        </Link>
                      ) : null}
                      <Link href={item.googleMapsUrl} target="_blank" className="rounded-full border border-slate-300 px-3 py-2 font-black text-slate-900">
                        Maps
                      </Link>
                      {item.directionsUrl ? (
                        <Link href={item.directionsUrl} target="_blank" className="rounded-full bg-slate-950 px-3 py-2 font-black text-white">
                          {language === "en" ? "Directions" : "Como llegar"}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="mt-4 rounded-2xl border border-slate-200 bg-[#fffdf4] px-4 py-3 text-sm font-semibold text-slate-700">{language === "en" ? "Not found." : "No encontrado."}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
