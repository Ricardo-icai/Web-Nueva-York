import type { ShoppingVenue } from "@/types/shopping";

function distanceKm(
  origin: { lat: number; lng: number } | null,
  destination: { lat: number | null; lng: number | null },
) {
  if (!origin || typeof destination.lat !== "number" || typeof destination.lng !== "number") return null;
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const earthKm = 6371;
  const dLat = toRad(destination.lat - origin.lat);
  const dLng = toRad(destination.lng - origin.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(origin.lat)) * Math.cos(toRad(destination.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return earthKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function rankShoppingVenues(
  venues: ShoppingVenue[],
  options?: {
    userLocation?: { lat: number; lng: number } | null;
    accommodation?: { lat: number; lng: number } | null;
  },
) {
  return [...venues]
    .map((venue) => {
      const nearUserKm = distanceKm(options?.userLocation ?? null, venue.location);
      const nearHotelKm = distanceKm(options?.accommodation ?? null, venue.location);
      const editorial = venue.editorialScore ?? 70;
      const googleRating = (venue.googleRating ?? 4.2) * 20;
      const trust = venue.verified === false ? 55 : venue.trustScore ?? 82;
      const trend = venue.trendScore ?? (venue.badges?.some((badge) => /viral|famous|icon/i.test(badge)) ? 84 : 68);
      const flagshipBoost = venue.isFlagship ? 6 : 0;
      const officialBoost = venue.officialWebsite ? 4 : 0;
      const imageBoost = venue.imageUrl ? 3 : 0;
      const distanceBoost = typeof nearUserKm === "number" ? Math.max(0, 12 - nearUserKm * 1.8) : 0;
      const score =
        editorial * 0.38 +
        googleRating * 0.14 +
        trust * 0.16 +
        trend * 0.1 +
        distanceBoost +
        flagshipBoost +
        officialBoost +
        imageBoost;
      return { ...venue, nearUserKm, nearHotelKm, rankingScore: Math.round(score) };
    })
    .sort((left, right) => right.rankingScore - left.rankingScore);
}
