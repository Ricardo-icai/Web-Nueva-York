"use client";

import type { ShoppingArea } from "@/types/shopping";

export default function ShoppingAreasSection({ areas }: { areas: ShoppingArea[] }) {
  return (
    <section className="mx-auto mt-8 max-w-7xl px-5 sm:px-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Shopping areas</p>
          <h2 className="font-american-diner text-3xl text-slate-950">Best Shopping Areas</h2>
        </div>
        <p className="text-sm font-semibold text-slate-600">{areas.length} zonas clave</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {areas.map((area) => (
          <article key={area.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#c1121f]">{area.borough}</p>
            <h3 className="mt-2 font-american-diner text-2xl text-slate-950">{area.name}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">{area.description}</p>
            <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">
              <p>Precio medio zona: {area.averagePriceLabel}</p>
              <p>Tiempo recomendado: {area.suggestedVisitTime}</p>
              <p>Metro: {area.nearestSubway}</p>
              <p>Ambiente: {area.vibe}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {area.bestFor.map((item) => (
                <span key={`${area.id}-${item}`} className="rounded-full bg-[#f5f1e8] px-3 py-1 text-xs font-semibold text-slate-700">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-stone-200 bg-[#fffdf6] p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Tiendas destacadas</p>
              <p className="mt-2 text-sm font-semibold text-slate-800">{area.highlightedStores.join(" - ")}</p>
            </div>
            <div className="mt-4 flex gap-3">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(area.name + " New York")}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-slate-950 bg-white px-4 py-2 text-sm font-black text-slate-950"
              >
                Ver en mapa
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
