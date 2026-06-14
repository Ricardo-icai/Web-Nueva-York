"use client";

import SafeImage from "@/components/common/SafeImage";
import { buildTransitPlannerUrl } from "@/lib/transit-planner";
import type { NightlifeVenue } from "@/types/nightlife";

function formatPriceRange(venue: NightlifeVenue) {
  if (typeof venue.averagePricePerPersonUsd === "number") {
    const low = Math.max(venue.averagePricePerPersonUsd - 15, 0);
    const high = venue.averagePricePerPersonUsd + 20;
    return `${Math.round(low)}-${Math.round(high)} USD por persona`;
  }
  return "Precio no disponible";
}

function buttonClasses(disabled = false) {
  return `rounded-full border px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] ${
    disabled
      ? "border-slate-200 bg-slate-100 text-slate-400"
      : "border-slate-300 bg-white text-slate-800"
  }`;
}

function ActionLink({ href, label, disabledLabel }: { href?: string | null; label: string; disabledLabel: string }) {
  if (!href) {
    return <span className={buttonClasses(true)}>{disabledLabel}</span>;
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={buttonClasses(false)}>
      {label}
    </a>
  );
}

export default function NightlifeVenueCard({
  venue,
  isFavorite,
  onToggleFavorite,
  similar,
}: {
  venue: NightlifeVenue;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  similar: NightlifeVenue[];
}) {
  return (
    <article className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="relative h-56">
        <SafeImage alt={venue.name} primary={venue.imageUrl} className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.68))] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/80">{venue.category.replace("_", " ")}</p>
              <h3 className="mt-1 font-display text-2xl font-bold text-white">{venue.name}</h3>
            </div>
            <button type="button" onClick={() => onToggleFavorite(venue.id)} className="rounded-full border border-white/70 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-950">
              {isFavorite ? "Guardado" : "Favorito"}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5 text-sm text-slate-700">
        <p>{venue.description}</p>

        <p className="font-semibold text-slate-950">{formatPriceRange(venue)}</p>

        <div className="flex flex-wrap gap-2">
          <ActionLink href={venue.officialWebsite} label="Web oficial" disabledLabel="Web oficial no disponible" />
          <a href={venue.googleMapsUrl} target="_blank" rel="noreferrer" className={buttonClasses(false)}>Google Maps</a>
          <a
            href={buildTransitPlannerUrl({
              name: venue.name,
              address: venue.address,
              lat: venue.location.lat,
              lng: venue.location.lng,
            })}
            className={buttonClasses(false)}
          >
            Como llegar
          </a>
          <ActionLink href={venue.ticketUrl} label="Entradas" disabledLabel="Entradas no disponibles" />
          <ActionLink href={venue.reservationUrl} label="Reserva" disabledLabel="Reserva no disponible" />
        </div>
      </div>
    </article>
  );
}
