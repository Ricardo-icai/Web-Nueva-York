import { getShoppingVenues } from "@/lib/shopping/catalog";
import type { ShoppingVenue } from "@/types/shopping";

export async function enrichShoppingVenues(): Promise<ShoppingVenue[]> {
  return getShoppingVenues();
}
