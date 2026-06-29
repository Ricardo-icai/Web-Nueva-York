export type ShoppingCategory =
  | "luxury"
  | "department_store"
  | "fashion"
  | "sports"
  | "sneakers_streetwear"
  | "streetwear"
  | "tech"
  | "vintage"
  | "beauty"
  | "toys"
  | "souvenirs"
  | "outlet"
  | "mall"
  | "bookstore"
  | "specialty"
  | "design_books"
  | "market";

export interface ShoppingVenue {
  id: string;
  name: string;
  category: ShoppingCategory;
  description: string;
  shortDescription?: string;
  neighborhood?: string | null;
  borough?: string | null;
  shoppingArea?: string | null;
  address?: string | null;
  location: {
    lat: number | null;
    lng: number | null;
  };
  officialWebsite?: string | null;
  googleMapsUrl: string;
  directionsUrl?: string | null;
  imageUrl: string;
  imageSource: "official" | "curated" | "fallback";
  googlePlaceId?: string | null;
  googleRating?: number | null;
  googleReviewCount?: number | null;
  googleReviews?: Array<{
    authorName?: string;
    rating?: number;
    text?: string;
    relativeTimeDescription?: string;
  }>;
  badges?: string[];
  knownFor?: string[];
  brands?: string[];
  productTypes?: string[];
  bestFor?: string[];
  sourceSignals?: string[];
  averageSpendLabel?: string | null;
  averagePriceUsd?: number | null;
  priceRangeLabel?: "$" | "$$" | "$$$" | "$$$$" | null;
  editorialScore?: number;
  familyFriendly?: boolean;
  isFlagship?: boolean;
  isTouristEssential?: boolean;
  isLocalFavorite?: boolean;
  trendScore?: number;
  trustScore?: number;
  verified?: boolean;
}

export interface ShoppingArea {
  id: string;
  name: string;
  description: string;
  bestFor: string[];
  highlightedStores: string[];
  averagePriceLabel: string;
  suggestedVisitTime: string;
  vibe: string;
  nearestSubway: string;
  borough: string;
  location: {
    lat: number;
    lng: number;
  };
}
