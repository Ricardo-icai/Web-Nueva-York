import type { OverpassRestaurantRaw } from "@/types/restaurants";

type PlaceSearchItem = {
  place_id: string;
  name?: string;
  formatted_address?: string;
};

type PlaceSearchResponse = {
  results?: PlaceSearchItem[];
};

type PlaceDetailsResponse = {
  result?: {
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
  };
};

function getGoogleKey(): string | null {
  return process.env.GOOGLE_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? null;
}

export function getGooglePhotoUrl(photoReference: string): string {
  const key = getGoogleKey();
  if (!key) return "";
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${encodeURIComponent(photoReference)}&key=${key}`;
}

export function buildGoogleMapsSearchUrl(name: string, address?: string): string {
  const q = `${name}${address ? ` ${address}` : ""}`.trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function buildGoogleDirectionsUrl(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=transit`;
}

export async function searchGooglePlaceForRestaurant(restaurant: OverpassRestaurantRaw): Promise<string | null> {
  const key = getGoogleKey();
  if (!key) return null;
  const query = `${restaurant.name} ${restaurant.address ?? ""} New York`.trim();
  try {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${key}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const data = (await response.json()) as PlaceSearchResponse;
    return data.results?.[0]?.place_id ?? null;
  } catch {
    return null;
  }
}

export async function getGooglePlaceDetails(placeId: string) {
  const key = getGoogleKey();
  if (!key) return null;
  try {
    const fields =
      "place_id,rating,user_ratings_total,website,url,photos,opening_hours,formatted_phone_number,price_level,reviews";
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&key=${key}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const data = (await response.json()) as PlaceDetailsResponse;
    return data.result ?? null;
  } catch {
    return null;
  }
}

