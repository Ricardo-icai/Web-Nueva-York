export type NightlifeCategory =
  | "club"
  | "cocktail_bar"
  | "speakeasy"
  | "rooftop"
  | "live_music"
  | "event";

export interface NightlifeReview {
  authorName?: string;
  rating?: number;
  text?: string;
  relativeTimeDescription?: string;
}

export interface NightlifeVenue {
  id: string;
  name: string;
  category: NightlifeCategory;
  description: string;
  neighborhood?: string | null;
  borough?: string | null;
  location: {
    lat: number | null;
    lng: number | null;
  };
  address?: string | null;
  officialWebsite?: string | null;
  ticketUrl?: string | null;
  reservationUrl?: string | null;
  googleMapsUrl: string;
  directionsUrl?: string | null;
  imageUrl: string;
  imageSource: "official" | "google" | "curated" | "fallback";
  googlePlaceId?: string | null;
  googleRating?: number | null;
  googleReviewCount?: number | null;
  googleReviews?: NightlifeReview[];
  priceLevel?: 1 | 2 | 3 | 4 | null;
  averagePricePerPersonUsd?: number | null;
  musicStyle?: string[];
  bestFor?: string[];
  dressCode?: string | null;
  agePolicy?: string | null;
  openingHours?: string[];
  phone?: string | null;
  ticketRequired?: boolean;
  reservationRecommended?: boolean;
  nightlifeScore?: number;
  socialTrendScore?: number;
  badges?: string[];
}
