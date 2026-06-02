import type { Coordinates, RestaurantReview } from "@/types/restaurants";

const GOOGLE_KEY =
  process.env.GOOGLE_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export function hasGooglePlacesKey() {
  return Boolean(GOOGLE_KEY);
}

export function getGooglePhotoUrl(photoReference: string) {
  if (!GOOGLE_KEY) return null;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${encodeURIComponent(photoReference)}&key=${GOOGLE_KEY}`;
}

export function buildGoogleMapsSearchUrl(name: string, address?: string) {
  const q = [name, address].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function buildGoogleDirectionsUrl(origin: Coordinates, destination: Coordinates) {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=transit`;
}

type GoogleTextSearchResult = {
  place_id: string;
  name: string;
  formatted_address?: string;
};

type GoogleDetailsResult = {
  place_id?: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  website?: string;
  url?: string;
  price_level?: number;
  photos?: Array<{ photo_reference?: string }>;
  formatted_phone_number?: string;
  opening_hours?: { weekday_text?: string[] };
  reviews?: Array<{
    author_name?: string;
    rating?: number;
    text?: string;
    relative_time_description?: string;
  }>;
  geometry?: { location?: { lat?: number; lng?: number } };
};

async function safeFetchJson<T>(url: string) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function searchGoogleRestaurantByText(query: string) {
  if (!GOOGLE_KEY) return null;
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&type=restaurant&key=${GOOGLE_KEY}`;
  const payload = await safeFetchJson<{ results?: GoogleTextSearchResult[] }>(url);
  return payload?.results?.[0] ?? null;
}

export async function getGooglePlaceDetails(placeId: string) {
  if (!GOOGLE_KEY) return null;
  const fields =
    "place_id,name,formatted_address,geometry,rating,user_ratings_total,price_level,website,url,photos,opening_hours,formatted_phone_number,reviews";
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${encodeURIComponent(fields)}&key=${GOOGLE_KEY}`;
  const payload = await safeFetchJson<{ result?: GoogleDetailsResult }>(url);
  const result = payload?.result;
  if (!result) return null;
  const reviews: RestaurantReview[] =
    result.reviews?.map((r) => ({
      authorName: r.author_name,
      rating: r.rating,
      text: r.text,
      relativeTimeDescription: r.relative_time_description,
    })) ?? [];
  return {
    googlePlaceId: result.place_id ?? null,
    address: result.formatted_address ?? null,
    googleRating: result.rating ?? null,
    googleReviewCount: result.user_ratings_total ?? null,
    googleReviews: reviews,
    officialWebsite: result.website ?? null,
    googleMapsUrl: result.url ?? null,
    priceLevel:
      typeof result.price_level === "number" && result.price_level >= 1 && result.price_level <= 4
        ? (result.price_level as 1 | 2 | 3 | 4)
        : null,
    imageUrl: result.photos?.[0]?.photo_reference
      ? getGooglePhotoUrl(result.photos[0].photo_reference)
      : null,
    openingHours: result.opening_hours?.weekday_text ?? [],
    phone: result.formatted_phone_number ?? null,
    location: {
      lat: result.geometry?.location?.lat ?? null,
      lng: result.geometry?.location?.lng ?? null,
    },
  };
}
