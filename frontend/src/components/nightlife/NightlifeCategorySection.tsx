import type { NightlifeVenue } from "@/types/nightlife";
import NightlifeVenueCard from "./NightlifeVenueCard";

export default function NightlifeCategorySection({
  title,
  venues,
  favorites,
  onToggleFavorite,
}: {
  title: string;
  venues: NightlifeVenue[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <section className="border-t border-slate-200 bg-white px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-4xl font-bold text-slate-950">{title}</h2>

        {venues.length === 0 ? (
          <div className="mt-6 rounded-[26px] border border-dashed border-slate-300 bg-[#faf7f2] p-6 text-slate-600">
            No hay resultados con los filtros actuales en esta seccion.
          </div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {venues.map((venue) => (
              <NightlifeVenueCard
                key={venue.id}
                venue={venue}
                isFavorite={favorites.includes(venue.id)}
                onToggleFavorite={onToggleFavorite}
                similar={venues.filter((item) => item.id !== venue.id && item.category === venue.category).slice(0, 3)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
