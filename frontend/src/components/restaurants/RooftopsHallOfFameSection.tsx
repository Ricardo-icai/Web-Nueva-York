"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import RooftopCocktailLoader from "@/components/restaurants/RooftopCocktailLoader";
import RooftopsMap from "@/components/restaurants/RooftopsMap";
import { readSession, userScopedStorageKey } from "@/lib/auth";
import { buildOfficialWebsiteSearchUrl } from "@/lib/restaurants/build-restaurant-links";
import { buildTransitPlannerUrl } from "@/lib/transit-planner";
import type { Coordinates, NycRooftopHallOfFamePlace } from "@/types/restaurants";

type Props = {
  places: NycRooftopHallOfFamePlace[];
  accommodation?: Coordinates;
};

const ROOFTOP_FAVORITES_KEY = "nyc_rooftop_favorites_v1";

const FILTERS = [
  "All",
  "Hall of Fame",
  "Famous / Viral",
  "Manhattan",
  "Brooklyn",
  "Queens",
  "Skyline Views",
  "Rooftop Dining",
  "Cocktails",
  "Romantic",
  "Family Friendly Daytime",
  "Sunset",
  "Nightlife",
  "Photography",
  "Covered / Weather-Safe",
  "Near Tourist Areas",
  "Worth Booking",
] as const;

type Filter = (typeof FILTERS)[number];

function famousViralScore(place: NycRooftopHallOfFamePlace) {
  const hay = `${place.name} ${place.badges.join(" ")} ${place.categories.join(" ")} ${place.rooftopStyle}`.toLowerCase();
  let score = place.rooftopReputationScore + place.viewQualityScore;
  if (hay.includes("best skyline")) score += 22;
  if (hay.includes("great for photos")) score += 18;
  if (hay.includes("nightlife")) score += 14;
  if (hay.includes("luxury")) score += 12;
  if (hay.includes("worth booking")) score += 12;
  if (["230 Fifth Rooftop", "Westlight", "Overstory", "Nubeluz", "Panorama Room", "Magic Hour Rooftop Bar & Lounge"].includes(place.name)) {
    score += 30;
  }
  return score;
}

function matchesFilter(place: NycRooftopHallOfFamePlace, filter: Filter) {
  const hay = `${place.categories.join(" ")} ${place.badges.join(" ")} ${place.bestFor.join(" ")} ${place.rooftopStyle} ${place.weatherSuitability}`.toLowerCase();
  if (filter === "All") return true;
  if (filter === "Hall of Fame") return place.categories.includes("nyc_rooftops_hall_of_fame");
  if (filter === "Famous / Viral") return famousViralScore(place) >= 205;
  if (filter === "Manhattan" || filter === "Brooklyn" || filter === "Queens") return place.borough === filter;
  if (filter === "Skyline Views") return hay.includes("skyline") || hay.includes("views");
  if (filter === "Rooftop Dining") return hay.includes("rooftop_dining") || place.rooftopStyle === "Rooftop dining";
  if (filter === "Cocktails") return hay.includes("cocktail");
  if (filter === "Romantic") return hay.includes("romantic") || place.bestFor.includes("couples");
  if (filter === "Family Friendly Daytime") return hay.includes("family") || place.bestFor.includes("families");
  if (filter === "Sunset") return hay.includes("sunset") || place.bestTimeToGo === "Sunset";
  if (filter === "Nightlife") return hay.includes("nightlife");
  if (filter === "Photography") return hay.includes("photo");
  if (filter === "Covered / Weather-Safe") {
    return place.weatherSuitability === "covered" || place.weatherSuitability === "indoor_outdoor" || hay.includes("weather-safe");
  }
  if (filter === "Near Tourist Areas") return hay.includes("near_tourist_areas");
  if (filter === "Worth Booking") return place.reservationRecommended || hay.includes("worth booking");
  return true;
}

export default function RooftopsHallOfFameSection({ places, accommodation }: Props) {
  const favoritesKey = useMemo(() => userScopedStorageKey(ROOFTOP_FAVORITES_KEY, readSession()?.email), []);
  const [activeFilter, setActiveFilter] = useState<Filter>("Hall of Fame");
  const [selectedId, setSelectedId] = useState<string | null>(places[0]?.id ?? null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(userScopedStorageKey(ROOFTOP_FAVORITES_KEY, readSession()?.email));
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const visiblePlaces = useMemo(
    () => places.filter((place) => matchesFilter(place, activeFilter)).slice(0, 24),
    [activeFilter, places],
  );
  const famousViralPlaces = useMemo(
    () => [...places].sort((a, b) => famousViralScore(b) - famousViralScore(a)).slice(0, 8),
    [places],
  );
  const favoritePlaces = useMemo(
    () => places.filter((place) => favorites.includes(place.id)),
    [favorites, places],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 180);
    return () => window.clearTimeout(timer);
  }, [activeFilter]);

  useEffect(() => {
    localStorage.setItem(favoritesKey, JSON.stringify(favorites));
  }, [favorites, favoritesKey]);

  function toggleFavorite(id: string) {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  if (!places.length) return null;

  return (
    <section className="mx-auto mt-8 max-w-6xl space-y-5">
      <div className="rounded-lg border-2 border-slate-950 bg-[#fff3d1] p-5 shadow-[6px_6px_0_#111827]">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-dashed border-slate-950 pb-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-700">Roof Tops Specials</p>
            <h2 className="font-american-diner text-4xl text-slate-950">Menu de Filtros</h2>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              Filtra por vistas, zona, cocktails, cena, atardecer, viralidad y plan familiar.
            </p>
          </div>
          <span className="rounded-full border-2 border-slate-950 bg-red-700 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
            {visiblePlaces.length} visibles
          </span>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-red-700">Filtro principal</span>
            <select
              value={activeFilter}
              onChange={(event) => {
                setLoading(true);
                setActiveFilter(event.target.value as Filter);
              }}
              className="h-11 w-full rounded-md border-2 border-slate-950 bg-[#fffdf4] px-3 text-sm font-black uppercase tracking-wide text-slate-950 shadow-[3px_3px_0_#111827] outline-none transition focus:bg-white focus:ring-2 focus:ring-red-600"
            >
              {FILTERS.map((filter) => (
                <option key={filter} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-red-700">Accesos rapidos</span>
            <select
              value={activeFilter}
              onChange={(event) => {
                setLoading(true);
                setActiveFilter(event.target.value as Filter);
              }}
              className="h-11 w-full rounded-md border-2 border-slate-950 bg-white px-3 text-sm font-black uppercase tracking-wide text-slate-950 shadow-[3px_3px_0_#111827] outline-none transition focus:bg-white focus:ring-2 focus:ring-red-600"
            >
              <option value="Famous / Viral">Famous / Viral</option>
              <option value="Skyline Views">Skyline Views</option>
              <option value="Rooftop Dining">Rooftop Dining</option>
              <option value="Cocktails">Cocktails</option>
              <option value="Romantic">Romantic</option>
              <option value="Sunset">Sunset</option>
              <option value="Nightlife">Nightlife</option>
              <option value="Covered / Weather-Safe">Covered / Weather-Safe</option>
              <option value="Worth Booking">Worth Booking</option>
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <RooftopCocktailLoader />
      ) : (
        <RooftopsMap
          places={visiblePlaces}
          accommodation={accommodation}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      )}

      <section className="rounded-lg border-2 border-slate-950 bg-white p-4 shadow-[6px_6px_0_#111827]">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b-2 border-dashed border-slate-950 pb-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-700">Famous & Viral</p>
            <h3 className="font-american-diner text-3xl text-slate-950">Hall of Fame de Roof Tops</h3>
            <p className="text-sm font-semibold text-slate-700">
              Los rooftops mas iconicos, fotografiados y recomendables para una primera visita.
            </p>
          </div>
          <span className="rounded-full border-2 border-slate-950 bg-slate-950 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
            Top {famousViralPlaces.length}
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {famousViralPlaces.map((place, idx) => {
            const websiteHref = place.officialWebsite ?? buildOfficialWebsiteSearchUrl(place.name, place.address);
            return (
              <article
                key={`viral-${place.id}`}
                className={`overflow-hidden rounded-lg border-2 bg-[#fffdf4] shadow-[4px_4px_0_#111827] ${
                  selectedId === place.id ? "border-red-700" : "border-slate-950"
                }`}
              >
                <button type="button" onClick={() => setSelectedId(place.id)} className="block w-full text-left">
                  <div className="relative h-36 w-full">
                    <Image src={place.imageUrl} alt={place.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 25vw" />
                    <span className="absolute left-2 top-2 rounded-full border border-white bg-red-700 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                      #{idx + 1}
                    </span>
                  </div>
                </button>
                <div className="space-y-2 p-3">
                  <p className="text-sm font-black text-slate-950">{place.name}</p>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    {place.neighborhood} - {place.rooftopStyle}
                  </p>
                  <p className="text-xs text-slate-700">{place.badges.slice(0, 2).join(" - ")}</p>
                  <p className="text-xs font-semibold text-slate-700">
                    {typeof place.googleReviewCount === "number"
                      ? `${place.googleReviewCount} resenas`
                      : (
                        <a href={websiteHref} target="_blank" className="font-black text-red-700 underline underline-offset-2">
                          Ver descripcion del rooftop
                        </a>
                      )}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <a href={place.googleMapsUrl} target="_blank" className="rounded-full border border-slate-300 px-2 py-1">
                      Maps
                    </a>
                    <a href={websiteHref} target="_blank" className="rounded-full border border-red-700 bg-red-700 px-2 py-1 font-bold text-white">
                      Entradas / Web
                    </a>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(place.id)}
                      className="rounded-full border border-amber-500 bg-amber-100 px-2 py-1 font-bold text-slate-950"
                    >
                      {favorites.includes(place.id) ? "Guardado" : "Favorito"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border-2 border-slate-950 bg-[#fff3d1] p-4 shadow-[6px_6px_0_#111827]">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b-2 border-dashed border-slate-950 pb-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-red-700">Mi Lista</p>
            <h3 className="font-american-diner text-3xl text-slate-950">Favoritos</h3>
          </div>
          <span className="rounded-full border-2 border-slate-950 bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-950">
            {favoritePlaces.length} guardados
          </span>
        </div>
        {favoritePlaces.length === 0 ? (
          <p className="text-sm font-semibold text-slate-700">Aun no has guardado ningun rooftop.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {favoritePlaces.map((place) => {
              const websiteHref = place.officialWebsite ?? buildOfficialWebsiteSearchUrl(place.name, place.address);
              return (
                <article key={`favorite-${place.id}`} className="overflow-hidden rounded-lg border-2 border-slate-950 bg-white shadow-[4px_4px_0_#111827]">
                  <div className="relative h-32 w-full">
                    <Image src={place.imageUrl} alt={place.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 25vw" />
                  </div>
                  <div className="space-y-2 p-3">
                    <p className="text-sm font-black text-slate-950">{place.name}</p>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-600">{place.neighborhood}</p>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <a href={place.googleMapsUrl} target="_blank" className="rounded-full border border-slate-300 px-2 py-1">Maps</a>
                      <a href={buildTransitPlannerUrl({ name: place.name, address: place.address, lat: place.lat, lng: place.lng })} className="rounded-full border border-slate-300 px-2 py-1">Como llegar</a>
                      <a href={websiteHref} target="_blank" className="rounded-full border border-red-700 bg-red-700 px-2 py-1 font-bold text-white">Entradas / Web</a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className={`grid gap-4 md:grid-cols-2 xl:grid-cols-3 ${loading ? "opacity-50" : ""}`}>
        {visiblePlaces.map((place) => {
          const isSelected = selectedId === place.id;
          const websiteHref = place.officialWebsite ?? buildOfficialWebsiteSearchUrl(place.name, place.address);
          return (
            <article
              key={place.id}
              className={`overflow-hidden rounded-lg border-2 bg-white shadow-[5px_5px_0_#111827] ${
                isSelected ? "border-red-700" : "border-slate-950"
              }`}
            >
              <button type="button" onClick={() => setSelectedId(place.id)} className="block w-full text-left">
                <div className="relative h-44 w-full bg-stone-100">
                  <Image src={place.imageUrl} alt={place.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
              </button>
              <div className="space-y-2 p-4">
                <div>
                  <p className="text-base font-black text-slate-950">{place.name}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {place.borough} - {place.neighborhood} - {place.rooftopStyle}
                  </p>
                </div>
                <p className="text-xs text-slate-700">Views: {place.viewType.join(", ")}</p>
                <p className="text-xs text-slate-600">{place.whyItMatters}</p>
                <div className="grid gap-1 text-xs text-slate-700">
                  <p>Dress code: {place.dressCode}</p>
                  <p>Age policy: {place.ageRestriction ?? "Age policy unknown"}</p>
                  <p>{place.reservationRecommended ? "Reservation recommended" : "Reservation optional"}</p>
                  <p>Best time: {place.bestTimeToGo}</p>
                  <p>Weather: {place.weatherSuitability.replaceAll("_", " ")}</p>
                  <p>
                    {typeof place.googleRating === "number"
                      ? `Rating ${place.googleRating.toFixed(1)} - ${place.googleReviewCount ?? 0} resenas`
                      : "Rating unavailable"}
                  </p>
                  <p>
                    {typeof place.googleReviewCount === "number"
                      ? `Resenas de Google: ${place.googleReviewCount}`
                      : (
                        <a href={websiteHref} target="_blank" className="font-black text-red-700 underline underline-offset-2">
                          Ver descripcion del rooftop
                        </a>
                      )}
                  </p>
                  <p>
                    {typeof place.averagePricePerPersonUsd === "number"
                      ? `Estimated from $${place.averagePricePerPersonUsd}/person`
                      : "Price estimate unavailable"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {place.badges.map((badge) => (
                    <span key={badge} className="rounded-full bg-slate-950 px-2 py-1 font-bold text-white">
                      {badge}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <a href={place.googleMapsUrl} target="_blank" className="rounded-full border border-slate-300 px-2 py-1">
                    Google Maps
                  </a>
                  <a href={buildTransitPlannerUrl({ name: place.name, address: place.address, lat: place.lat, lng: place.lng })} className="rounded-full border border-slate-300 px-2 py-1">
                    Como llegar
                  </a>
                  <a href={websiteHref} target="_blank" className="rounded-full border border-red-700 bg-red-700 px-2 py-1 font-bold text-white">
                    {place.officialWebsite ? "Entradas / Web oficial" : "Buscar entradas / web"}
                  </a>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(place.id)}
                    className="rounded-full border border-amber-500 bg-amber-100 px-2 py-1 font-bold text-slate-950"
                  >
                    {favorites.includes(place.id) ? "Favorito guardado" : "Favorito"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
