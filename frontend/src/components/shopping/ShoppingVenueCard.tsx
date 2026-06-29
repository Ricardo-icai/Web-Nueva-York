"use client";

import FavoriteToggleButton from "@/components/favorites/FavoriteToggleButton";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import type { ShoppingVenue } from "@/types/shopping";

const FAVORITES_KEY = "nyc_shopping_favorites_v1";

function websiteHostname(url?: string | null) {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export default function ShoppingVenueCard({
  venue,
  nearHotelKm,
  nearUserKm,
}: {
  venue: ShoppingVenue;
  nearHotelKm?: number | null;
  nearUserKm?: number | null;
}) {
  const { language } = useLanguage();
  const logoOrigin = websiteHostname(venue.officialWebsite);
  const area = [venue.neighborhood, venue.borough].filter(Boolean).join(" - ");

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#fffaf0)] shadow-[0_18px_36px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.14)]">
      <div className="relative h-52 overflow-hidden">
        <img src={venue.imageUrl} alt={venue.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,35,66,0.06),rgba(10,35,66,0.7))]" />
        {logoOrigin ? (
          <div className="absolute left-4 top-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/40 bg-white/90 shadow-lg">
            <img
              src={`${logoOrigin}/favicon.ico`}
              alt={`Logo de ${venue.name}`}
              className="h-8 w-8 object-contain"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>
        ) : null}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
          {(venue.badges ?? []).slice(0, 3).map((badge) => (
            <span key={`${venue.id}-${badge}`} className="rounded-full border border-white/30 bg-black/30 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white backdrop-blur">
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-black text-slate-950">{venue.name}</p>
            <p className="text-sm font-semibold text-slate-600">{area}</p>
          </div>
          <FavoriteToggleButton baseKey={FAVORITES_KEY} favoriteType="shopping" itemId={venue.id} />
        </div>

        <p className="text-sm leading-6 text-slate-700">{venue.description}</p>

        <div className="grid gap-3 rounded-[22px] border border-stone-200 bg-white/80 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {venue.averageSpendLabel ? (
              <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{language === "en" ? "Level" : "Nivel"}</p>
                <p className="mt-1 text-sm font-black text-slate-900">{venue.averageSpendLabel}</p>
              </div>
            ) : null}
            {typeof nearHotelKm === "number" ? (
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{language === "en" ? "From hotel" : "Desde hotel"}</p>
                <p className="mt-1 text-sm font-black text-slate-900">{nearHotelKm.toFixed(1)} km</p>
              </div>
            ) : null}
            {typeof nearUserKm === "number" ? (
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{language === "en" ? "From you" : "Desde ti"}</p>
                <p className="mt-1 text-sm font-black text-slate-900">{nearUserKm.toFixed(1)} km</p>
              </div>
            ) : null}
          </div>
          {venue.address ? <p className="text-sm font-semibold text-slate-700">{venue.address}</p> : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {(venue.knownFor ?? []).slice(0, 4).map((item) => (
            <span key={`${venue.id}-${item}`} className="rounded-full bg-[#f5f1e8] px-3 py-1 text-xs font-semibold text-slate-700">
              {item}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          {venue.officialWebsite ? (
            <a href={venue.officialWebsite} target="_blank" rel="noreferrer" className="rounded-full border border-slate-950 bg-white px-4 py-2 text-sm font-black text-slate-950 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
              {language === "en" ? "Official website" : "Web oficial"}
            </a>
          ) : null}
          <a href={venue.googleMapsUrl} target="_blank" rel="noreferrer" className="rounded-full border border-slate-300 bg-[#fffdf6] px-4 py-2 text-sm font-black text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            Google Maps
          </a>
          {venue.directionsUrl ? (
            <a href={venue.directionsUrl} target="_blank" rel="noreferrer" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white shadow-[0_14px_28px_rgba(15,23,42,0.18)]">
              {language === "en" ? "Directions" : "Como llegar"}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
