import type { Restaurant } from "@/types/restaurants";

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function rankRestaurants(
  restaurants: Restaurant[],
  origin?: { lat: number; lng: number },
): Restaurant[] {
  const scored = restaurants.map((r) => {
    const distance = origin
      ? haversineKm(origin.lat, origin.lng, r.location.lat, r.location.lng)
      : undefined;
    const ratingScore = r.googleRating ?? 0;
    const reviewScore = Math.log10((r.googleReviewCount ?? 0) + 1);
    const distancePenalty = distance ? Math.min(distance / 10, 3) : 0;
    const qualityScore = ratingScore * 2 + reviewScore - distancePenalty;
    return {
      ...r,
      distanceFromAccommodationKm: distance
        ? Number(distance.toFixed(2))
        : undefined,
      qualityScore: Number(qualityScore.toFixed(2)),
    };
  });

  return scored.sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0));
}

