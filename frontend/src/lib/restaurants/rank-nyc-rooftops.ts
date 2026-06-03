import type { Coordinates, NycRooftopHallOfFamePlace } from "@/types/restaurants";

function distanceKm(a: Coordinates, b: Coordinates) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * (2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)));
}

function weatherScore(place: NycRooftopHallOfFamePlace) {
  if (place.weatherSuitability === "covered") return 100;
  if (place.weatherSuitability === "indoor_outdoor") return 85;
  if (place.weatherSuitability === "weather_dependent") return 55;
  return 45;
}

export function rankNycRooftops(
  places: NycRooftopHallOfFamePlace[],
  options: { accommodation?: Coordinates } = {},
) {
  return [...places]
    .map((place) => {
      const hasLocation = typeof place.lat === "number" && typeof place.lng === "number";
      const distanceFromAccommodationKm =
        options.accommodation && hasLocation
          ? distanceKm(options.accommodation, { lat: place.lat as number, lng: place.lng as number })
          : place.distanceFromAccommodationKm ?? null;
      return { ...place, distanceFromAccommodationKm };
    })
    .sort((a, b) => {
      const score = (place: NycRooftopHallOfFamePlace) => {
        const ratingScore = ((place.googleRating ?? 0) / 5) * 100;
        const reviewsScore = Math.min(100, Math.log10((place.googleReviewCount ?? 0) + 1) * 25);
        const distanceScore =
          typeof place.distanceFromAccommodationKm === "number"
            ? Math.max(0, 100 - place.distanceFromAccommodationKm * 8)
            : 50;

        return (
          ratingScore * 0.2 +
          reviewsScore * 0.1 +
          place.viewQualityScore * 0.25 +
          place.rooftopReputationScore * 0.15 +
          distanceScore * 0.1 +
          weatherScore(place) * 0.05 +
          (place.officialWebsite ? 100 : 0) * 0.05 +
          (place.imageUrl ? 100 : 0) * 0.05 +
          (place.reservationRecommended || place.reservationUrl ? 100 : 0) * 0.05
        );
      };
      return score(b) - score(a);
    });
}
