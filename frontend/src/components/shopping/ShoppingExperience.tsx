"use client";

import FavoritesRail from "@/components/favorites/FavoritesRail";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import ShoppingAreasSection from "@/components/shopping/ShoppingAreasSection";
import ShoppingCategorySection from "@/components/shopping/ShoppingCategorySection";
import ShoppingFilters, { type ShoppingFilterState } from "@/components/shopping/ShoppingFilters";
import ShoppingHero from "@/components/shopping/ShoppingHero";
import ShoppingMap from "@/components/shopping/ShoppingMap";
import ShoppingSearch from "@/components/shopping/ShoppingSearch";
import { nycShoppingAreas } from "@/data/shopping/nyc-shopping-areas";
import { readSession } from "@/lib/auth";
import { getNearbyShopping } from "@/lib/shopping/nearby-shopping";
import { rankShoppingVenues } from "@/lib/shopping/rank-shopping-venues";
import { loadTravelProfile } from "@/lib/user-data";
import type { ShoppingVenue } from "@/types/shopping";
import { useEffect, useMemo, useState } from "react";

const TRAVEL_PROFILE_KEY = "nyc_travel_profile_v1";
const FAVORITES_KEY = "nyc_shopping_favorites_v1";

const defaultFilters: ShoppingFilterState = {
  category: "all",
  budget: "all",
  bestFor: "all",
  zone: "all",
  accommodationDistance: "all",
  currentLocationDistance: "all",
  onlyOfficial: false,
  familyFriendlyOnly: false,
  trendingOnly: false,
  flagshipOnly: false,
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

function includesSignal(haystack: string[] | undefined, needle: string) {
  return (haystack ?? []).some((item) => item.toLowerCase().includes(needle.toLowerCase()));
}

export default function ShoppingExperience({ venues }: { venues: ShoppingVenue[] }) {
  const { language } = useLanguage();
  const [filters, setFilters] = useState<ShoppingFilterState>(defaultFilters);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [accommodation, setAccommodation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  useEffect(() => {
    let active = true;
    async function loadProfile() {
      if (!readSession()) return;
      try {
        const profile = await loadTravelProfile(TRAVEL_PROFILE_KEY);
        if (active && profile?.accommodation?.address && typeof profile.accommodation.lat === "number" && typeof profile.accommodation.lng === "number") {
          setAccommodation({
            address: profile.accommodation.address,
            lat: profile.accommodation.lat,
            lng: profile.accommodation.lng,
          });
        }
      } catch {}
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
      if (filters.budget !== "all" && venue.priceRangeLabel !== filters.budget) return false;
      if (filters.bestFor !== "all" && !includesSignal(venue.bestFor, filters.bestFor) && !includesSignal(venue.knownFor, filters.bestFor)) return false;
      if (filters.zone !== "all" && ![venue.shoppingArea, venue.neighborhood].filter(Boolean).some((item) => item?.toLowerCase().includes(filters.zone.toLowerCase()))) return false;
      if (filters.onlyOfficial && !venue.officialWebsite) return false;
      if (filters.familyFriendlyOnly && !venue.familyFriendly) return false;
      if (filters.trendingOnly && !((venue.trendScore ?? 0) >= 80 || includesSignal(venue.badges, "viral") || includesSignal(venue.badges, "famous us store"))) return false;
      if (filters.flagshipOnly && !venue.isFlagship) return false;
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
        meta: [venue.neighborhood, venue.category.replaceAll("_", " ")].filter(Boolean).join(" - "),
        href: venue.officialWebsite ?? venue.googleMapsUrl,
      })),
    [venues],
  );

  const nearby = useMemo(() => getNearbyShopping(filtered, userLocation).slice(0, 6), [filtered, userLocation]);
  const searchItems = useMemo(
    () =>
      filtered.map((venue) => ({
        id: venue.id,
        name: venue.name,
        neighborhood: venue.neighborhood ?? venue.shoppingArea ?? venue.borough ?? null,
        category: venue.category.replaceAll("_", " "),
        officialWebsite: venue.officialWebsite,
        googleMapsUrl: venue.googleMapsUrl,
        directionsUrl: venue.directionsUrl,
      })),
    [filtered],
  );

  const sections = useMemo(
    () => ({
      famousUs: filtered.filter((venue) => includesSignal(venue.badges, "famous us store") || includesSignal(venue.badges, "nyc icon")).slice(0, 9),
      luxury: filtered.filter((venue) => venue.category === "luxury"),
      sneakersStreetwear: filtered.filter((venue) => venue.category === "sneakers_streetwear" || venue.category === "streetwear"),
      sports: filtered.filter((venue) => venue.category === "sports"),
      departmentStores: filtered.filter((venue) => venue.category === "department_store" || venue.category === "mall"),
      tech: filtered.filter((venue) => venue.category === "tech"),
      beauty: filtered.filter((venue) => venue.category === "beauty"),
      familyFun: filtered.filter((venue) => venue.category === "toys"),
      vintage: filtered.filter((venue) => venue.category === "vintage"),
      outlets: filtered.filter((venue) => venue.category === "outlet"),
      trending: filtered.filter((venue) => (venue.trendScore ?? 0) >= 70 || includesSignal(venue.badges, "viral") || includesSignal(venue.badges, "instagram")).slice(0, 9),
    }),
    [filtered],
  );

  return (
    <>
      <ShoppingHero total={venues.length} />
      <ShoppingFilters filters={filters} onChange={setFilters} onReset={() => setFilters(defaultFilters)} resultCount={filtered.length} />
      <ShoppingSearch items={searchItems} />
      <ShoppingMap venues={filtered} accommodation={accommodation} onUserLocationChange={setUserLocation} />
      <FavoritesRail baseKey={FAVORITES_KEY} favoriteType="shopping" items={favoriteItems} title={language === "en" ? "My city finds favorites" : "Mis favoritos de escaparates"} />
      <div id="shopping-sections" className="pb-10">
        <ShoppingCategorySection title="Tiendas recomendadas cerca de ti" venues={nearby} />
        <ShoppingAreasSection areas={nycShoppingAreas} />
        <ShoppingCategorySection title="Famous US Stores" venues={sections.famousUs} />
        <ShoppingCategorySection title="Luxury Shopping" venues={sections.luxury} />
        <ShoppingCategorySection title="Sneakers & Streetwear" venues={sections.sneakersStreetwear} />
        <ShoppingCategorySection title="Sports Stores" venues={sections.sports} />
        <ShoppingCategorySection title="Department Stores" venues={sections.departmentStores} />
        <ShoppingCategorySection title="Tech & Gadgets" venues={sections.tech} />
        <ShoppingCategorySection title="Beauty & Fragrance" venues={sections.beauty} />
        <ShoppingCategorySection title="Family & Fun Stores" venues={sections.familyFun} />
        <ShoppingCategorySection title="Vintage & Thrift" venues={sections.vintage} />
        <ShoppingCategorySection title="Outlets & Deals" venues={sections.outlets} />
        <ShoppingCategorySection title="Trending Stores" venues={sections.trending} />
      </div>
    </>
  );
}
