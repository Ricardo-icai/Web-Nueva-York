"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { NycPizzaHallOfFamePlace } from "@/types/restaurants";

type Props = {
  places: NycPizzaHallOfFamePlace[];
};

const FILTERS = [
  "All",
  "Hall of Fame",
  "Manhattan",
  "Brooklyn",
  "Queens",
  "Bronx",
  "Staten Island",
  "NY Slice",
  "Coal Oven",
  "Neapolitan",
  "Sicilian",
  "Square Slice",
  "Viral",
  "Family Friendly",
  "Near Tourist Areas",
  "Worth the Trip",
] as const;

type Filter = (typeof FILTERS)[number];

function matchesFilter(place: NycPizzaHallOfFamePlace, filter: Filter) {
  const hay = `${place.categories.join(" ")} ${place.badges.join(" ")} ${place.bestFor.join(" ")} ${place.pizzaStyle}`.toLowerCase();
  if (filter === "All") return true;
  if (filter === "Hall of Fame") return place.categories.includes("pizza_hall_of_fame");
  if (filter === "Manhattan" || filter === "Brooklyn" || filter === "Queens" || filter === "Bronx" || filter === "Staten Island") {
    return place.borough === filter;
  }
  if (filter === "NY Slice") return place.pizzaStyle === "NY slice" || hay.includes("ny_slice");
  if (filter === "Coal Oven") return place.pizzaStyle === "Coal oven" || hay.includes("coal_oven");
  if (filter === "Square Slice") return place.pizzaStyle === "Square slice" || hay.includes("square_slice");
  if (filter === "Family Friendly") return place.bestFor.includes("families") || place.badges.includes("Family Friendly");
  return hay.includes(filter.toLowerCase().replaceAll(" ", "_")) || hay.includes(filter.toLowerCase());
}

export default function PizzaHallOfFameSection({ places }: Props) {
  const [activeFilter, setActiveFilter] = useState<Filter>("Hall of Fame");
  const visiblePlaces = useMemo(
    () => places.filter((place) => matchesFilter(place, activeFilter)).slice(0, 24),
    [activeFilter, places],
  );

  if (!places.length) return null;

  return (
    <section className="mx-auto mt-8 max-w-6xl space-y-4">
      <div className="space-y-2">
        <h2 className="font-american-diner text-3xl text-slate-900">NYC Pizza Hall of Fame</h2>
        <p className="text-sm text-slate-700">
          From classic New York slices to Brooklyn legends, coal oven icons and viral pizza spots.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold ${
              activeFilter === filter
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-stone-300 bg-white text-slate-700"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visiblePlaces.map((place) => (
          <article key={place.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <div className="relative h-44 w-full bg-stone-100">
              <Image
                src={place.imageUrl}
                alt={place.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="space-y-2 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{place.name}</p>
                <p className="text-xs text-slate-600">
                  {place.borough} - {place.neighborhood} - {place.pizzaStyle}
                </p>
              </div>
              <p className="text-xs text-slate-700">
                Signature pizza: {place.signaturePizzas[0] ?? "Unavailable"}
              </p>
              <p className="text-xs text-slate-600">{place.whyItMatters}</p>
              <p className="text-xs text-slate-700">
                {typeof place.googleRating === "number"
                  ? `Rating ${place.googleRating.toFixed(1)} - ${place.googleReviewCount ?? 0} reviews`
                  : "Rating unavailable"}
              </p>
              <p className="text-xs text-slate-700">
                {typeof place.averagePricePerPersonUsd === "number"
                  ? `Estimated from $${place.averagePricePerPersonUsd}/person`
                  : "Price estimate unavailable"}
              </p>
              <p className="text-xs text-slate-700">
                {typeof place.distanceFromAccommodationKm === "number"
                  ? `Distance from hotel: ${place.distanceFromAccommodationKm.toFixed(1)} km`
                  : "Distance from hotel unavailable"}
              </p>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {place.badges.map((badge) => (
                  <span key={badge} className="rounded-full bg-slate-900 px-2 py-1 text-white">
                    {badge}
                  </span>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <a href={place.googleMapsUrl} target="_blank" className="rounded-full border border-slate-300 px-2 py-1">
                  Google Maps
                </a>
                <a href={place.directionsUrl ?? place.googleMapsUrl} target="_blank" className="rounded-full border border-slate-300 px-2 py-1">
                  Directions
                </a>
                {place.officialWebsite ? (
                  <a href={place.officialWebsite} target="_blank" className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-1">
                    Official Website
                  </a>
                ) : (
                  <span className="rounded-full border border-stone-300 px-2 py-1 text-stone-500">
                    Official website unavailable
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
