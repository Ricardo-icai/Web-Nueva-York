export type ShoppingCategory =
  | "luxury"
  | "department_store"
  | "fashion"
  | "sports"
  | "sneakers_streetwear"
  | "vintage"
  | "beauty"
  | "design_books"
  | "market";

export interface ShoppingVenue {
  id: string;
  name: string;
  category: ShoppingCategory;
  description: string;
  neighborhood?: string | null;
  borough?: string | null;
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
  badges?: string[];
  knownFor?: string[];
  sourceSignals?: string[];
  averageSpendLabel?: string | null;
  editorialScore?: number;
  familyFriendly?: boolean;
}
