export type RestaurantSource = "overpass" | "google" | "local";
export type RestaurantDataQuality = "basic" | "enriched" | "fallback";

export interface Restaurant {
  id: string;
  source: RestaurantSource;
  dataQuality: RestaurantDataQuality;

  name: string;
  description?: string;

  cuisine: string[];
  category: string[];

  address?: string;
  neighborhood?: string;
  borough?: string;

  location: {
    lat: number;
    lng: number;
  };

  googlePlaceId?: string;
  googleRating?: number;
  googleReviewCount?: number;
  googleReviews?: {
    authorName?: string;
    rating?: number;
    text?: string;
    relativeTimeDescription?: string;
  }[];

  priceLevel?: 1 | 2 | 3 | 4;
  averagePricePerPersonUsd?: number;

  officialWebsite?: string;
  googleMapsUrl: string;
  directionsUrl?: string;
  reservationUrl?: string;

  imageUrl: string;
  imageSource?: "google" | "wikimedia" | "local" | "fallback";

  phone?: string;
  openingHours?: string[];

  familyFriendly?: boolean;
  vegetarianOptions?: boolean;
  veganOptions?: boolean;
  halalOptions?: boolean;
  kosherOptions?: boolean;

  distanceFromAccommodationKm?: number;
  estimatedTransitMinutes?: number;
  estimatedWalkingMinutes?: number;

  qualityScore?: number;
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

