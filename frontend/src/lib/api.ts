export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface RestaurantItem {
  id: string;
  name: string;
  area: string;
  cuisine: string;
  priceLevel: '$' | '$$' | '$$$' | '$$$$';
  rating: number;
  reviewCount: number;
  image: string;
  officialUrl: string;
  mapsUrl: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm?: number;
}

export interface RestaurantsResponse {
  source: 'google-places' | 'yelp' | 'overpass' | 'hybrid' | 'fallback';
  items: RestaurantItem[];
}

export interface RestaurantFilters {
  price?: string;
  maxDistanceKm?: number;
  minRating?: number;
  cuisine?: string;
  hotelLat?: number;
  hotelLng?: number;
  maxResults?: number;
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${response.status}: ${text}`);
  }

  return (await response.json()) as T;
}

export function getRestaurants(filters?: RestaurantFilters) {
  const query = new URLSearchParams();
  if (filters?.price) query.set('price', filters.price);
  if (typeof filters?.maxDistanceKm === 'number' && filters.maxDistanceKm > 0) query.set('maxDistanceKm', String(filters.maxDistanceKm));
  if (typeof filters?.minRating === 'number' && filters.minRating > 0) query.set('minRating', String(filters.minRating));
  if (filters?.cuisine) query.set('cuisine', filters.cuisine);
  if (typeof filters?.hotelLat === 'number' && Number.isFinite(filters.hotelLat)) query.set('hotelLat', String(filters.hotelLat));
  if (typeof filters?.hotelLng === 'number' && Number.isFinite(filters.hotelLng)) query.set('hotelLng', String(filters.hotelLng));
  if (typeof filters?.maxResults === 'number' && filters.maxResults > 0) query.set('maxResults', String(filters.maxResults));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiFetch<RestaurantsResponse>(`/restaurants${suffix}`);
}
