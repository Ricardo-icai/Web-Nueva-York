import type { Coordinates } from "@/types/restaurants";
import { getRestaurantsIntelligence } from "@/lib/restaurants/enrich-restaurant";

export async function getRestaurantsHybrid(origin?: Coordinates) {
  return getRestaurantsIntelligence(origin);
}

