export type RestaurantSource = "google" | "overpass" | "curated";
export type RestaurantDataQuality = "basic" | "enriched" | "curated";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RestaurantReview {
  authorName?: string;
  rating?: number;
  text?: string;
  relativeTimeDescription?: string;
}

export interface Restaurant {
  id: string;
  source: RestaurantSource;
  dataQuality: RestaurantDataQuality;

  name: string;
  description?: string | null;

  cuisine: string[];
  categories: string[];

  address?: string | null;
  neighborhood?: string | null;
  borough?: string | null;

  location: Coordinates;

  googlePlaceId?: string | null;
  googleRating?: number | null;
  googleReviewCount?: number | null;
  googleReviews?: RestaurantReview[];

  priceLevel?: 1 | 2 | 3 | 4 | null;
  averagePricePerPersonUsd?: number | null;

  officialWebsite?: string | null;
  googleMapsUrl: string;
  directionsUrl?: string | null;
  reservationUrl?: string | null;

  imageUrl: string;
  imageSource: "google" | "wikimedia" | "curated" | "fallback";

  phone?: string | null;
  openingHours?: string[];

  familyFriendly?: boolean;
  vegetarianOptions?: boolean;
  veganOptions?: boolean;
  halalOptions?: boolean;
  kosherOptions?: boolean;

  distanceFromAccommodationKm?: number | null;
  estimatedTransitMinutes?: number | null;
  estimatedWalkingMinutes?: number | null;

  qualityScore?: number;
  editorialTags?: string[];
}

export interface OverpassRestaurantRaw {
  osmId: string;
  name: string;
  amenity: string;
  cuisine?: string;
  website?: string;
  phone?: string;
  openingHours?: string;
  address?: string;
  neighborhood?: string;
  borough?: string;
  lat: number;
  lng: number;
  source: "overpass";
}
