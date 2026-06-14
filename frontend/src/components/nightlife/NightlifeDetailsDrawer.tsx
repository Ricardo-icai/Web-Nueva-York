"use client";

import type { NightlifeVenue } from "@/types/nightlife";

function LinkChip({ href, label, disabledLabel }: { href?: string | null; label: string; disabledLabel: string }) {
  if (!href) {
    return <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400">{disabledLabel}</span>;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-800"
    >
      {label}
    </a>
  );
}

export default function NightlifeDetailsDrawer({ venue, similar }: { venue: NightlifeVenue; similar: NightlifeVenue[] }) {
  return (
    <details className="rounded-[26px] border border-slate-200 bg-[#faf7f2] p-5">
      <summary className="cursor-pointer list-none text-sm font-black uppercase tracking-[0.16em] text-slate-950">
        Abrir detalles
      </summary>
      <div className="mt-4 space-y-4 text-sm text-slate-700">
        <p>{venue.description}</p>
        <div className="grid gap-2 md:grid-cols-2">
          <p><span className="font-semibold text-slate-950">Direccion:</span> {venue.address ?? "Direccion no disponible"}</p>
          <p><span className="font-semibold text-slate-950">Dress code:</span> {venue.dressCode ?? "No indicado"}</p>
          <p><span className="font-semibold text-slate-950">Edad:</span> {venue.agePolicy ?? "No indicada"}</p>
          <p><span className="font-semibold text-slate-950">Musica:</span> {venue.musicStyle?.join(", ") ?? "No indicada"}</p>
          <p><span className="font-semibold text-slate-950">Horario:</span> {venue.openingHours?.join(" | ") ?? "Horario no disponible"}</p>
          <p><span className="font-semibold text-slate-950">Resenas:</span> {typeof venue.googleRating === "number" ? `${venue.googleRating.toFixed(1)} (${venue.googleReviewCount ?? 0})` : "Resenas no disponibles"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkChip href={venue.officialWebsite} label="Web oficial" disabledLabel="Web oficial no disponible" />
          <LinkChip href={venue.ticketUrl} label="Entradas" disabledLabel="Entradas no disponibles" />
          <LinkChip href={venue.reservationUrl} label="Reserva" disabledLabel="Reserva no disponible" />
          <LinkChip href={venue.googleMapsUrl} label="Google Maps" disabledLabel="Google Maps" />
        </div>
        {similar.length > 0 ? (
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Sitios parecidos</p>
            <p className="mt-2 text-sm text-slate-700">{similar.slice(0, 3).map((item) => item.name).join(" - ")}</p>
          </div>
        ) : null}
      </div>
    </details>
  );
}
