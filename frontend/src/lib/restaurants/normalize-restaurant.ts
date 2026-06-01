import type { OverpassRestaurantRaw, Restaurant } from "@/types/restaurants";
import { ensureGoogleMapsUrl } from "@/lib/restaurants/build-restaurant-links";
import { RESTAURANT_CATEGORY_IMAGES } from "@/data/restaurants/restaurant-category-images";

function inferCuisine(raw?: string) {
  if (!raw) return ["Restaurant"];
  return raw
    .split(/[;,]/)
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function inferCategoryKey(cuisine: string[]) {
  const text = cuisine.join(" ").toLowerCase();
  if (text.includes("pizza")) return "pizza";
  if (text.includes("bagel")) return "bagel";
  if (text.includes("burger")) return "burger";
  if (text.includes("deli")) return "deli";
  if (text.includes("steak")) return "steakhouse";
  if (text.includes("korean")) return "korean";
  if (text.includes("japanese") || text.includes("sushi")) return "japanese";
  if (text.includes("mexican")) return "mexican";
  if (text.includes("vegan")) return "vegan";
  return "default";
}

export function normalizeOverpassRestaurant(raw: OverpassRestaurantRaw): Restaurant {
  const cuisine = inferCuisine(raw.cuisine);
  const categoryKey = inferCategoryKey(cuisine);
  return {
    id: raw.osmId,
    source: "overpass",
    dataQuality: "basic",
    name: raw.name,
    description: null,
    cuisine,
    categories: [raw.amenity, categoryKey],
    address: raw.address ?? null,
    neighborhood: raw.neighborhood ?? null,
    borough: raw.borough ?? null,
    location: { lat: raw.lat, lng: raw.lng },
    googlePlaceId: null,
    googleRating: null,
    googleReviewCount: null,
    googleReviews: [],
    priceLevel: null,
    averagePricePerPersonUsd: null,
    officialWebsite: raw.website ?? null,
    googleMapsUrl: ensureGoogleMapsUrl(null, raw.name, raw.address),
    directionsUrl: null,
    reservationUrl: null,
    imageUrl: RESTAURANT_CATEGORY_IMAGES[categoryKey] ?? RESTAURANT_CATEGORY_IMAGES.default,
    imageSource: "fallback",
    phone: raw.phone ?? null,
    openingHours: raw.openingHours ? [raw.openingHours] : [],
    qualityScore: 40,
    editorialTags: [],
  };
}

