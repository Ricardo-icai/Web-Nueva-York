import nightlifeData from "@/data/nightlife/nyc-nightlife-venues.json";
import type { NightlifeVenue } from "@/types/nightlife";

export function getNightlifeVenues(): NightlifeVenue[] {
  return nightlifeData as NightlifeVenue[];
}

export function getNightlifeCategories() {
  return [
    "Nightlife Hall of Fame",
    "Best Clubs",
    "Cocktail Bars",
    "Speakeasies",
    "Rooftop Nightlife",
    "Live Music",
    "Trending Now",
    "July 4th Nightlife Events",
  ] as const;
}
