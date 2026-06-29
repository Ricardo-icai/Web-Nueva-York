import { nycShoppingVenues } from "@/data/shopping/nyc-shopping-venues";
import type { ShoppingVenue } from "@/types/shopping";

export function getShoppingVenues(): ShoppingVenue[] {
  return nycShoppingVenues;
}
