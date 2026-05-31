import {
  buildGoogleMapsSearchUrl,
  getGooglePhotoUrl,
} from "@/lib/api/google-places";
import { estimatePricePerPersonUsd } from "@/lib/restaurants/estimate-price";
import type { OverpassRestaurantRaw, Restaurant } from "@/types/restaurants";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80";

export function normalizeOverpassRestaurant(item: OverpassRestaurantRaw): Restaurant {
  return {
    id: item.osmId,
    source: "overpass",
    dataQuality: "basic",
    name: item.name,
    cuisine: item.cuisine ? item.cuisine.split(";").map((x) => x.trim()).filter(Boolean) : [item.amenity],
    category: [item.amenity],
    address: item.address,
    neighborhood: item.neighborhood,
    borough: item.borough,
    location: { lat: item.lat, lng: item.lng },
    officialWebsite: item.website,
    googleMapsUrl: buildGoogleMapsSearchUrl(item.name, item.address),
    imageUrl: FALLBACK_IMAGE,
    imageSource: "fallback",
    phone: item.phone,
    openingHours: item.openingHours ? [item.openingHours] : undefined,
  };
}

export function mergeGoogleData(
  base: Restaurant,
  google: {
    place_id?: string;
    rating?: number;
    user_ratings_total?: number;
    website?: string;
    url?: string;
    photos?: Array<{ photo_reference?: string }>;
    opening_hours?: { weekday_text?: string[] };
    formatted_phone_number?: string;
    price_level?: 1 | 2 | 3 | 4;
    reviews?: Array<{
      author_name?: string;
      rating?: number;
      text?: string;
      relative_time_description?: string;
    }>;
  },
): Restaurant {
  const photoReference = google.photos?.[0]?.photo_reference;
  const imageUrl = photoReference ? getGooglePhotoUrl(photoReference) : base.imageUrl;
  const openingHours = google.opening_hours?.weekday_text ?? base.openingHours;
  const googleMapsUrl = google.url ?? base.googleMapsUrl;
  const officialWebsite = google.website ?? base.officialWebsite;
  const reviews = (google.reviews ?? []).slice(0, 3).map((r) => ({
    authorName: r.author_name,
    rating: r.rating,
    text: r.text,
    relativeTimeDescription: r.relative_time_description,
  }));
  const priceLevel = google.price_level ?? base.priceLevel;

  return {
    ...base,
    source: "google",
    dataQuality: "enriched",
    googlePlaceId: google.place_id,
    googleRating: google.rating,
    googleReviewCount: google.user_ratings_total,
    googleReviews: reviews.length ? reviews : undefined,
    priceLevel,
    averagePricePerPersonUsd: estimatePricePerPersonUsd(priceLevel),
    officialWebsite,
    googleMapsUrl,
    imageUrl,
    imageSource: photoReference ? "google" : base.imageSource,
    phone: google.formatted_phone_number ?? base.phone,
    openingHours,
  };
}

