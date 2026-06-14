"use client";

import { readSession } from "@/lib/auth";
import { loadFavorites, loadTravelProfile, saveFavorites } from "@/lib/user-data";
import { rankNightlifeVenues } from "@/lib/nightlife/rank-nightlife-venues";
import type { NightlifeVenue } from "@/types/nightlife";
import { useEffect, useMemo, useState } from "react";
import NightlifeCategorySection from "./NightlifeCategorySection";
import NightlifeFavorites from "./NightlifeFavorites";
import NightlifeFilters, { type NightlifeFilterState } from "./NightlifeFilters";
import NightlifeHero from "./NightlifeHero";
import NightlifeMap from "./NightlifeMap";

const FAVORITES_KEY = "nyc_nightlife_favorites_v1";
const FAVORITES_TYPE = "nightlife";
const TRAVEL_PROFILE_KEY = "nyc_travel_profile_v1";

const defaultFilters: NightlifeFilterState = {
  priceRange: "all",
  musicStyle: "all",
  agePolicy: "all",
  accommodationDistance: "all",
  currentLocationDistance: "all",
};

function distanceKm(
  origin: { lat: number; lng: number },
  destination: { lat: number | null; lng: number | null },
) {
  if (typeof destination.lat !== "number" || typeof destination.lng !== "number") return null;
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const earthKm = 6371;
  const dLat = toRad(destination.lat - origin.lat);
  const dLng = toRad(destination.lng - origin.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(origin.lat)) * Math.cos(toRad(destination.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return earthKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function distanceFilterMatches(value: string, km: number | null) {
  if (value === "all") return true;
  if (km === null) return false;
  if (value === "0-1.5") return km <= 1.5;
  if (value === "0-3") return km <= 3;
  if (value === "0-6") return km <= 6;
  if (value === "6-plus") return km > 6;
  return true;
}

function priceMatches(venue: NightlifeVenue, filter: string) {
  if (filter === "all") return true;
  if (typeof venue.averagePricePerPersonUsd !== "number") return false;
  if (filter === "0-40") return venue.averagePricePerPersonUsd <= 40;
  if (filter === "40-70") return venue.averagePricePerPersonUsd > 40 && venue.averagePricePerPersonUsd <= 70;
  if (filter === "70-100") return venue.averagePricePerPersonUsd > 70 && venue.averagePricePerPersonUsd <= 100;
  if (filter === "100-160") return venue.averagePricePerPersonUsd > 100 && venue.averagePricePerPersonUsd <= 160;
  return true;
}

function musicMatches(venue: NightlifeVenue, filter: string) {
  if (filter === "all") return true;
  const styles = venue.musicStyle ?? [];
  if (filter === "Reggaeton") {
    return styles.some((style) => {
      const normalized = style.toLowerCase();
      return normalized.includes("reggaeton") || normalized.includes("latin");
    });
  }
  return styles.some((style) => style.toLowerCase().includes(filter.toLowerCase()));
}

export default function NightlifeExperience({ venues }: { venues: NightlifeVenue[] }) {
  const [filters, setFilters] = useState<NightlifeFilterState>(defaultFilters);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [accommodation, setAccommodation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      const hasSession = Boolean(readSession());
      if (active) setAuthenticated(hasSession);

      try {
        const ids = await loadFavorites(FAVORITES_KEY, FAVORITES_TYPE);
        if (active) setFavorites(ids);
      } catch {
        if (!active) return;
        try {
          const local = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]") as string[];
          setFavorites(Array.isArray(local) ? local : []);
        } catch {
          setFavorites([]);
        }
      }

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
        // ignore profile load issues
      }
    }

    void loadInitialData();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // ignore storage errors
    }
    void saveFavorites(FAVORITES_KEY, FAVORITES_TYPE, favorites).catch(() => undefined);
  }, [favorites]);

  const ranked = useMemo(
    () =>
      rankNightlifeVenues(venues, {
        userLocation,
      }),
    [userLocation, venues],
  );

  const filteredVenues = useMemo(() => {
    return ranked.filter((venue) => {
      if (!priceMatches(venue, filters.priceRange)) return false;
      if (!musicMatches(venue, filters.musicStyle)) return false;
      if (filters.agePolicy !== "all" && venue.agePolicy !== filters.agePolicy) return false;

      const accommodationKm = accommodation ? distanceKm(accommodation, venue.location) : null;
      const currentKm = userLocation ? distanceKm(userLocation, venue.location) : null;

      if (!distanceFilterMatches(filters.accommodationDistance, accommodationKm)) return false;
      if (!distanceFilterMatches(filters.currentLocationDistance, currentKm)) return false;
      return true;
    });
  }, [accommodation, filters, ranked, userLocation]);

  const favoriteVenues = useMemo(
    () => venues.filter((venue) => favorites.includes(venue.id)),
    [favorites, venues],
  );

  const byCategory = useMemo(() => {
    const hallOfFame = filteredVenues.slice(0, 6);
    return {
      hallOfFame,
      clubs: filteredVenues.filter((venue) => venue.category === "club").slice(0, 9),
      rooftops: filteredVenues.filter((venue) => venue.category === "rooftop").slice(0, 9),
      cocktails: filteredVenues.filter((venue) => venue.category === "cocktail_bar").slice(0, 9),
      speakeasies: filteredVenues.filter((venue) => venue.category === "speakeasy").slice(0, 9),
      liveMusic: filteredVenues.filter((venue) => venue.category === "live_music").slice(0, 9),
      trending: [...filteredVenues].sort((a, b) => (b.socialTrendScore ?? 0) - (a.socialTrendScore ?? 0)).slice(0, 6),
      july4: filteredVenues.filter((venue) => venue.badges?.some((badge) => badge.toLowerCase().includes("july 4"))),
    };
  }, [filteredVenues]);

  const toggleFavorite = (id: string) => {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <>
      <NightlifeHero total={venues.length} />
      <NightlifeFilters filters={filters} onChange={setFilters} resultCount={filteredVenues.length} />
      <NightlifeMap
        venues={filteredVenues}
        selectedId={filteredVenues[0]?.id ?? null}
        favorites={favorites}
        onUserLocationChange={setUserLocation}
        accommodation={accommodation}
      />
      <NightlifeFavorites favorites={favoriteVenues} favoriteIds={favorites} isAuthenticated={authenticated} onToggleFavorite={toggleFavorite} />
      <NightlifeCategorySection title="Nightlife Hall of Fame" venues={byCategory.hallOfFame} favorites={favorites} onToggleFavorite={toggleFavorite} />
      <NightlifeCategorySection title="Best Clubs" venues={byCategory.clubs} favorites={favorites} onToggleFavorite={toggleFavorite} />
      <NightlifeCategorySection title="Rooftop Nightlife" venues={byCategory.rooftops} favorites={favorites} onToggleFavorite={toggleFavorite} />
      <NightlifeCategorySection title="Cocktail Bars" venues={byCategory.cocktails} favorites={favorites} onToggleFavorite={toggleFavorite} />
      <NightlifeCategorySection title="Speakeasies" venues={byCategory.speakeasies} favorites={favorites} onToggleFavorite={toggleFavorite} />
      <NightlifeCategorySection title="Live Music" venues={byCategory.liveMusic} favorites={favorites} onToggleFavorite={toggleFavorite} />
      <NightlifeCategorySection title="Trending Now" venues={byCategory.trending} favorites={favorites} onToggleFavorite={toggleFavorite} />
      <NightlifeCategorySection title="July 4th Nightlife Events" venues={byCategory.july4} favorites={favorites} onToggleFavorite={toggleFavorite} />
    </>
  );
}
