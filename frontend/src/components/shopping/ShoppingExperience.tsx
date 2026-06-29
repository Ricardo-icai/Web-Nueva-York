"use client";

import FavoritesRail from "@/components/favorites/FavoritesRail";
import ShoppingCategorySection from "@/components/shopping/ShoppingCategorySection";
import ShoppingFilters, { type ShoppingFilterState } from "@/components/shopping/ShoppingFilters";
import ShoppingHero from "@/components/shopping/ShoppingHero";
import ShoppingMap from "@/components/shopping/ShoppingMap";
import { readSession } from "@/lib/auth";
import { loadTravelProfile } from "@/lib/user-data";
import { rankShoppingVenues } from "@/lib/shopping/rank-shopping-venues";
import type { ShoppingVenue } from "@/types/shopping";
import { useEffect, useMemo, useState } from "react";

const TRAVEL_PROFILE_KEY = "nyc_travel_profile_v1";
const FAVORITES_KEY = "nyc_shopping_favorites_v1";

const defaultFilters: ShoppingFilterState = {
  category: "all",
  accommodationDistance: "all",
  currentLocationDistance: "all",
};

function distanceFilterMatches(value: string, km: number | null | undefined) {
  if (value === "all") return true;
  if (typeof km !== "number") return false;
  if (value === "0-1.5") return km <= 1.5;
  if (value === "0-3") return km <= 3;
  if (value === "0-6") return km <= 6;
  if (value === "6-plus") return km > 6;
  return true;
}

export default function ShoppingExperience({ venues }: { venues: ShoppingVenue[] }) {
  const [filters, setFilters] = useState<ShoppingFilterState>(defaultFilters);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [accommodation, setAccommodation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!readSession()) return;
      try {
        const profile = await loadTravelProfile(TRAVEL_PROFILE_KEY);
        if (
          active &&
          profile?.accommodation?.address &&
          typeof profile.accommodation.lat === "number" &&
          typeof profile.accommodation.lng === "number"
        ) {
          setAccommodation({
            address: profile.accommodation.address,
            lat: profile.accommodation.lat,
            lng: profile.accommodation.lng,
          });
        }
      } catch {
        // ignore
      }
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const ranked = useMemo(
    () =>
      rankShoppingVenues(venues, {
        userLocation,
        accommodation,
      }),
    [accommodation, userLocation, venues],
  );

  const filtered = useMemo(() => {
    return ranked.filter((venue) => {
      if (filters.category !== "all" && venue.category !== filters.category) return false;
      if (!distanceFilterMatches(filters.accommodationDistance, venue.nearHotelKm)) return false;
      if (!distanceFilterMatches(filters.currentLocationDistance, venue.nearUserKm)) return false;
      return true;
    });
  }, [filters, ranked]);

  const favoriteItems = useMemo(
    () =>
      venues.map((venue) => ({
        id: venue.id,
        name: venue.name,
        meta: [venue.neighborhood, venue.category.replaceAll("_", " ")].filter(Boolean).join(" · "),
        href: venue.officialWebsite ?? venue.googleMapsUrl,
      })),
    [venues],
  );

  const sections = useMemo(
    () => ({
      icons: filtered.slice(0, 6),
      luxury: filtered.filter((venue) => venue.category === "luxury" || venue.category === "department_store"),
      fashion: filtered.filter((venue) => venue.category === "fashion" || venue.category === "beauty"),
      sport: filtered.filter((venue) => venue.category === "sports" || venue.category === "sneakers_streetwear"),
      creative: filtered.filter((venue) => venue.category === "vintage" || venue.category === "design_books" || venue.category === "market"),
    }),
    [filtered],
  );

  return (
    <>
      <ShoppingHero total={venues.length} />
      <ShoppingFilters filters={filters} onChange={setFilters} onReset={() => setFilters(defaultFilters)} resultCount={filtered.length} />
      <ShoppingMap venues={filtered} accommodation={accommodation} onUserLocationChange={setUserLocation} />
      <FavoritesRail baseKey={FAVORITES_KEY} favoriteType="shopping" items={favoriteItems} title="Favoritos de compras" />
      <ShoppingCategorySection title="Tiendas iconicas de Nueva York" venues={sections.icons} />
      <ShoppingCategorySection title="Lujo y grandes almacenes" venues={sections.luxury} />
      <ShoppingCategorySection title="Moda y belleza" venues={sections.fashion} />
      <ShoppingCategorySection title="Deportes, sneakers y streetwear" venues={sections.sport} />
      <ShoppingCategorySection title="Vintage, regalos y mercados creativos" venues={sections.creative} />
    </>
  );
}
