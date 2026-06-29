"use client";

import ShoppingVenueCard from "@/components/shopping/ShoppingVenueCard";
import type { ShoppingVenue } from "@/types/shopping";

export default function ShoppingCategorySection({
  title,
  venues,
}: {
  title: string;
  venues: Array<ShoppingVenue & { nearHotelKm?: number | null; nearUserKm?: number | null }>;
}) {
  if (!venues.length) return null;

  return (
    <section className="mx-auto mt-8 max-w-7xl px-5 sm:px-8">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Shopping guide</p>
          <h2 className="font-american-diner text-3xl text-slate-950">{title}</h2>
        </div>
        <p className="text-sm font-semibold text-slate-600">{venues.length} tiendas</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {venues.map((venue) => (
          <ShoppingVenueCard key={venue.id} venue={venue} nearHotelKm={venue.nearHotelKm} nearUserKm={venue.nearUserKm} />
        ))}
      </div>
    </section>
  );
}
