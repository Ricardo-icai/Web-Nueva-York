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

export type PizzaBorough = "Manhattan" | "Brooklyn" | "Queens" | "Bronx" | "Staten Island";
export type PizzaStyle =
  | "NY slice"
  | "Coal oven"
  | "Neapolitan"
  | "Sicilian"
  | "Square slice"
  | "Brooklyn classic"
  | "Artisan"
  | "Other";

export interface NycPizzaHallOfFamePlace {
  id: string;
  name: string;
  type: "pizzeria";
  borough: PizzaBorough;
  neighborhood: string;
  pizzaStyle: PizzaStyle;
  categories: string[];
  signaturePizzas: string[];
  whyItMatters: string;
  bestFor: string[];
  address: string | null;
  lat: number | null;
  lng: number | null;
  officialWebsite: string | null;
  googleMapsUrl: string;
  reservationUrl: string | null;
  imageUrl: string;
  priceLevel: 1 | 2 | 3 | 4 | null;
  averagePricePerPersonUsd: number | null;
  googlePlaceId: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  dataQuality: "curated_pending_google_enrichment" | "enriched";
  badges: string[];
  nycReputationScore: number;
  distanceFromAccommodationKm?: number | null;
  directionsUrl?: string | null;
  openingHours?: string[];
  phone?: string | null;
}

export type RooftopBorough = "Manhattan" | "Brooklyn" | "Queens" | "Bronx" | "Staten Island";
export type RooftopStyle =
  | "Skyline view"
  | "Rooftop dining"
  | "Cocktail rooftop"
  | "Romantic"
  | "Luxury"
  | "Casual"
  | "Photography"
  | "Nightlife";
export type RooftopDressCode = "Casual" | "Smart casual" | "Elegant" | "Unknown";
export type RooftopWeatherSuitability = "outdoor" | "indoor_outdoor" | "covered" | "weather_dependent";

export interface NycRooftopHallOfFamePlace {
  id: string;
  name: string;
  type: "rooftop";
  borough: RooftopBorough;
  neighborhood: string;
  rooftopStyle: RooftopStyle;
  categories: string[];
  bestFor: string[];
  viewType: string[];
  whyItMatters: string;
  dressCode: RooftopDressCode;
  reservationRecommended: boolean;
  ageRestriction: string | null;
  bestTimeToGo: string;
  weatherSuitability: RooftopWeatherSuitability;
  address: string | null;
  lat: number | null;
  lng: number | null;
  officialWebsite: string | null;
  googleMapsUrl: string;
  reservationUrl: string | null;
  imageUrl: string;
  priceLevel: 1 | 2 | 3 | 4 | null;
  averagePricePerPersonUsd: number | null;
  googlePlaceId: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  dataQuality: "curated_pending_google_enrichment" | "enriched";
  badges: string[];
  rooftopReputationScore: number;
  viewQualityScore: number;
  distanceFromAccommodationKm?: number | null;
  directionsUrl?: string | null;
  openingHours?: string[];
  phone?: string | null;
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
