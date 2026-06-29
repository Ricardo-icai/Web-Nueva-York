"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
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
  const { language } = useLanguage();
  return (
    <details className="rounded-[26px] border border-slate-200 bg-[#faf7f2] p-5">
      <summary className="cursor-pointer list-none text-sm font-black uppercase tracking-[0.16em] text-slate-950">
        {language === "en" ? "Open details" : "Abrir detalles"}
      </summary>
      <div className="mt-4 space-y-4 text-sm text-slate-700">
        <p>{venue.description}</p>
        <div className="grid gap-2 md:grid-cols-2">
          <p><span className="font-semibold text-slate-950">{language === "en" ? "Address:" : "Direccion:"}</span> {venue.address ?? (language === "en" ? "Address unavailable" : "Direccion no disponible")}</p>
          <p><span className="font-semibold text-slate-950">Dress code:</span> {venue.dressCode ?? "No indicado"}</p>
          <p><span className="font-semibold text-slate-950">{language === "en" ? "Age:" : "Edad:"}</span> {venue.agePolicy ?? (language === "en" ? "Not specified" : "No indicada")}</p>
          <p><span className="font-semibold text-slate-950">{language === "en" ? "Music:" : "Musica:"}</span> {venue.musicStyle?.join(", ") ?? (language === "en" ? "Not specified" : "No indicada")}</p>
          <p><span className="font-semibold text-slate-950">{language === "en" ? "Opening hours:" : "Horario:"}</span> {venue.openingHours?.join(" | ") ?? (language === "en" ? "Opening hours unavailable" : "Horario no disponible")}</p>
          <p><span className="font-semibold text-slate-950">{language === "en" ? "Reviews:" : "Resenas:"}</span> {typeof venue.googleRating === "number" ? `${venue.googleRating.toFixed(1)} (${venue.googleReviewCount ?? 0})` : (language === "en" ? "Reviews unavailable" : "Resenas no disponibles")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkChip href={venue.officialWebsite} label={language === "en" ? "Official website" : "Web oficial"} disabledLabel={language === "en" ? "Website unavailable" : "Web oficial no disponible"} />
          <LinkChip href={venue.ticketUrl} label={language === "en" ? "Tickets" : "Entradas"} disabledLabel={language === "en" ? "Tickets unavailable" : "Entradas no disponibles"} />
          <LinkChip href={venue.reservationUrl} label={language === "en" ? "Booking" : "Reserva"} disabledLabel={language === "en" ? "Booking unavailable" : "Reserva no disponible"} />
          <LinkChip href={venue.googleMapsUrl} label="Google Maps" disabledLabel="Google Maps" />
        </div>
        {similar.length > 0 ? (
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{language === "en" ? "Similar places" : "Sitios parecidos"}</p>
            <p className="mt-2 text-sm text-slate-700">{similar.slice(0, 3).map((item) => item.name).join(" - ")}</p>
          </div>
        ) : null}
      </div>
    </details>
  );
}
