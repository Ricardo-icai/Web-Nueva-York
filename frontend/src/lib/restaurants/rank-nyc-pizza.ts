import type { NycPizzaHallOfFamePlace } from "@/types/restaurants";

type RankingContext = {
  hasAccommodation: boolean;
};

function normalizedRating(place: NycPizzaHallOfFamePlace) {
  return typeof place.googleRating === "number" ? (place.googleRating / 5) * 100 : 0;
}

function normalizedReviews(place: NycPizzaHallOfFamePlace) {
  return typeof place.googleReviewCount === "number" ? Math.min(100, Math.log10(place.googleReviewCount + 1) * 22) : 0;
}

function styleImportance(place: NycPizzaHallOfFamePlace) {
  if (place.categories.includes("pizza_hall_of_fame")) return 100;
  if (place.categories.includes("historic") || place.categories.includes("brooklyn_legend")) return 90;
  if (place.categories.includes("near_tourist_areas")) return 70;
  return 60;
}

function distanceScore(place: NycPizzaHallOfFamePlace, context: RankingContext) {
  if (!context.hasAccommodation) return 60;
  if (typeof place.distanceFromAccommodationKm !== "number") return 35;
  return Math.max(0, 100 - place.distanceFromAccommodationKm * 12);
}

export function rankNycPizzaHallOfFame(
  places: NycPizzaHallOfFamePlace[],
  context: RankingContext = { hasAccommodation: false },
) {
  return [...places].sort((a, b) => {
    const score = (place: NycPizzaHallOfFamePlace) =>
      normalizedRating(place) * 0.25 +
      normalizedReviews(place) * 0.15 +
      place.nycReputationScore * 0.25 +
      styleImportance(place) * 0.1 +
      distanceScore(place, context) * 0.1 +
      (place.officialWebsite ? 100 : 0) * 0.05 +
      (place.imageUrl ? 100 : 0) * 0.05 +
      (place.bestFor.includes("families") || place.badges.includes("Family Friendly") ? 100 : 0) * 0.05;

    return score(b) - score(a);
  });
}
