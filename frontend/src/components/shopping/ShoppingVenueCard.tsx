"use client";

import FavoriteToggleButton from "@/components/favorites/FavoriteToggleButton";
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
  const logoOrigin = websiteHostname(venue.officialWebsite);

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_36px_rgba(15,23,42,0.08)]">
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
            <p className="text-sm font-semibold text-slate-600">
              {[venue.neighborhood, venue.borough].filter(Boolean).join(" · ")}
            </p>
          </div>
          <FavoriteToggleButton baseKey={FAVORITES_KEY} favoriteType="shopping" itemId={venue.id} />
        </div>
        <p className="text-sm leading-6 text-slate-700">{venue.description}</p>
        <div className="flex flex-wrap gap-2">
          {(venue.knownFor ?? []).slice(0, 4).map((item) => (
            <span key={`${venue.id}-${item}`} className="rounded-full bg-[#f5f1e8] px-3 py-1 text-xs font-semibold text-slate-700">
              {item}
            </span>
          ))}
        </div>
        <div className="grid gap-2 text-sm font-semibold text-slate-700">
          {venue.address ? <p>{venue.address}</p> : null}
          {venue.averageSpendLabel ? <p>Rango de compra: {venue.averageSpendLabel}</p> : null}
          {typeof nearHotelKm === "number" ? <p>Desde donde duermes: {nearHotelKm.toFixed(1)} km</p> : null}
          {typeof nearUserKm === "number" ? <p>Desde tu ubicacion: {nearUserKm.toFixed(1)} km</p> : null}
        </div>
        <div className="flex flex-wrap gap-3 pt-1">
          {venue.officialWebsite ? (
            <a href={venue.officialWebsite} target="_blank" rel="noreferrer" className="rounded-full border border-slate-950 px-4 py-2 text-sm font-black text-slate-950">
              Web oficial
            </a>
          ) : null}
          <a href={venue.googleMapsUrl} target="_blank" rel="noreferrer" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-black text-slate-900">
            Google Maps
          </a>
          {venue.directionsUrl ? (
            <a href={venue.directionsUrl} target="_blank" rel="noreferrer" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white">
              Como llegar
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
