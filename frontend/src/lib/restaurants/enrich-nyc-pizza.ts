import pizzaHallOfFameDb from "@/data/restaurants/nyc-pizza-hall-of-fame.json";
import {
  getGooglePlaceDetails,
  hasGooglePlacesKey,
  searchGoogleRestaurantByText,
} from "@/lib/api/google-places";
import { buildDirectionsLink } from "@/lib/restaurants/build-restaurant-links";
import { estimatePricePerPersonFromSignals } from "@/lib/restaurants/estimate-price";
import { rankNycPizzaHallOfFame } from "@/lib/restaurants/rank-nyc-pizza";
import type { Coordinates, NycPizzaHallOfFamePlace } from "@/types/restaurants";

const PREMIUM_PIZZA_FALLBACK =
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1400&q=80";

function canonicalName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(nyc|new york|restaurant|pizzeria|pizza)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fallbackLocationFor(place: NycPizzaHallOfFamePlace) {
  if (typeof place.lat === "number" && typeof place.lng === "number") {
    return { lat: place.lat, lng: place.lng };
  }

  const boroughCenters: Record<string, { lat: number; lng: number }> = {
    Manhattan: { lat: 40.758, lng: -73.9855 },
    Brooklyn: { lat: 40.6782, lng: -73.9442 },
    Queens: { lat: 40.7282, lng: -73.7949 },
    Bronx: { lat: 40.8448, lng: -73.8648 },
    "Staten Island": { lat: 40.5795, lng: -74.1502 },
  };
  const base = boroughCenters[place.borough] ?? boroughCenters.Manhattan;
  const seed = canonicalName(`${place.name} ${place.neighborhood}`);
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    lat: Number((base.lat + ((hash % 17) - 8) * 0.003).toFixed(6)),
    lng: Number((base.lng + ((Math.floor(hash / 17) % 17) - 8) * 0.003).toFixed(6)),
  };
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function estimateAveragePrice(priceLevel: 1 | 2 | 3 | 4 | null) {
  if (priceLevel === 1) return 15;
  if (priceLevel === 2) return 30;
  if (priceLevel === 3) return 60;
  if (priceLevel === 4) return 100;
  return null;
}

async function enrichWithGoogle(place: NycPizzaHallOfFamePlace): Promise<NycPizzaHallOfFamePlace> {
  if (!hasGooglePlacesKey()) return place;

  const search = await searchGoogleRestaurantByText(`${place.name} ${place.borough} New York`);
  if (!search?.place_id) return place;

  const details = await getGooglePlaceDetails(search.place_id);
  if (!details) return place;

  const priceLevel = details.priceLevel ?? place.priceLevel;
  return {
    ...place,
    address: details.address ?? place.address,
    lat: details.location.lat ?? place.lat,
    lng: details.location.lng ?? place.lng,
    officialWebsite: details.officialWebsite ?? place.officialWebsite,
    googleMapsUrl: details.googleMapsUrl ?? place.googleMapsUrl,
    imageUrl: details.imageUrl ?? place.imageUrl,
    priceLevel,
    averagePricePerPersonUsd:
      estimateAveragePrice(priceLevel) ??
      place.averagePricePerPersonUsd ??
      estimatePricePerPersonFromSignals({
        priceLevel,
        cuisine: ["Pizza", place.pizzaStyle],
        categories: place.categories,
        editorialTags: place.badges,
        name: place.name,
      }),
    googlePlaceId: details.googlePlaceId,
    googleRating: details.googleRating,
    googleReviewCount: details.googleReviewCount,
    dataQuality: "enriched",
    openingHours: details.openingHours,
    phone: details.phone,
  };
}

export async function getNycPizzaHallOfFame(accommodation?: Coordinates | null) {
  const enriched = [];
  const seen = new Set<string>();
  for (const place of pizzaHallOfFameDb as NycPizzaHallOfFamePlace[]) {
    const key = canonicalName(place.name);
    if (seen.has(key)) continue;
    seen.add(key);
    enriched.push(await enrichWithGoogle(place));
  }

  const places = enriched.map((place) => {
    const location = fallbackLocationFor(place);
    const hasCoords = typeof location.lat === "number" && typeof location.lng === "number";
    const distanceFromAccommodationKm =
      accommodation && hasCoords ? distanceKm(accommodation.lat, accommodation.lng, location.lat, location.lng) : null;

    return {
      ...place,
      lat: location.lat,
      lng: location.lng,
      imageUrl: place.imageUrl || PREMIUM_PIZZA_FALLBACK,
      averagePricePerPersonUsd:
        place.averagePricePerPersonUsd ??
        estimatePricePerPersonFromSignals({
          priceLevel: place.priceLevel,
          cuisine: ["Pizza", place.pizzaStyle],
          categories: place.categories,
          editorialTags: place.badges,
          name: place.name,
        }),
      distanceFromAccommodationKm,
      directionsUrl:
        accommodation && hasCoords
          ? buildDirectionsLink({ lat: location.lat, lng: location.lng }, accommodation)
          : place.googleMapsUrl,
    };
  });

  return rankNycPizzaHallOfFame(places, { hasAccommodation: !!accommodation });
}
