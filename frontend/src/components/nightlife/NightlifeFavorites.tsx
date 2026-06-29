"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { buildTransitPlannerUrl } from "@/lib/transit-planner";
import type { NightlifeVenue } from "@/types/nightlife";

export default function NightlifeFavorites({
  favorites,
  favoriteIds,
  isAuthenticated,
  onToggleFavorite,
}: {
  favorites: NightlifeVenue[];
  favoriteIds: string[];
  isAuthenticated: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const { language } = useLanguage();
  return (
    <section id="nightlife-favorites" className="border-t border-slate-200 bg-white px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-4xl font-bold text-slate-950">{language === "en" ? "My nightlife favorites" : "Mis favoritos de noche"}</h2>
        {!isAuthenticated ? (
          <p className="mt-3 text-sm text-slate-600">{language === "en" ? "Sign in to save your favorites permanently." : "Inicia sesion para guardar tus favoritos permanentemente."}</p>
        ) : null}

        {favorites.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-slate-300 bg-[#faf7f2] p-6 text-slate-600">
            <p className="font-display text-2xl text-slate-950">{language === "en" ? "You have not saved any nightlife plans yet." : "Aun no has guardado ningun plan de noche."}</p>
            <p className="mt-2 text-sm">{language === "en" ? "Explore clubs, rooftops, and bars to add them to your list." : "Explora discotecas, rooftops y bares para anadirlos a tu lista."}</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {favorites.map((venue) => (
              <article key={venue.id} className="rounded-[24px] border border-slate-200 bg-[#faf7f2] p-5 text-slate-700">
                <h3 className="mt-2 font-display text-2xl font-bold text-slate-950">{venue.name}</h3>
                <p className="mt-2 text-sm">{venue.description}</p>
                <p className="mt-3 font-semibold text-slate-950">
                  {typeof venue.averagePricePerPersonUsd === "number"
                    ? `${Math.max(Math.round(venue.averagePricePerPersonUsd - 15), 0)}-${Math.round(venue.averagePricePerPersonUsd + 20)} USD ${language === "en" ? "per person" : "por persona"}`
                    : language === "en" ? "Price unavailable" : "Precio no disponible"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {venue.officialWebsite ? (
                    <a href={venue.officialWebsite} target="_blank" rel="noreferrer" className="rounded-full border border-slate-300 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-800">{language === "en" ? "Official website" : "Web oficial"}</a>
                  ) : (
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">{language === "en" ? "Website unavailable" : "Web no disponible"}</span>
                  )}
                  <a href={venue.googleMapsUrl} target="_blank" rel="noreferrer" className="rounded-full border border-slate-300 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-800">Google Maps</a>
                  <a
                    href={buildTransitPlannerUrl({
                      name: venue.name,
                      address: venue.address,
                      lat: venue.location.lat,
                      lng: venue.location.lng,
                    })}
                    className="rounded-full border border-slate-300 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-800"
                  >
                    {language === "en" ? "Directions" : "Como llegar"}
                  </a>
                  <button type="button" onClick={() => onToggleFavorite(venue.id)} className="rounded-full border border-slate-950 bg-slate-950 px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-white">
                    {favoriteIds.includes(venue.id) ? (language === "en" ? "Remove" : "Quitar") : language === "en" ? "Save" : "Guardar"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
