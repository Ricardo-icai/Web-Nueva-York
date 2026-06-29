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
      let score = venue.editorialScore ?? 70;
      if (venue.badges?.some((badge) => badge.toLowerCase().includes("icon"))) score += 6;
      if (venue.badges?.some((badge) => badge.toLowerCase().includes("worth the trip"))) score += 4;
      if (typeof nearUserKm === "number") score += Math.max(0, 8 - nearUserKm);
      return { ...venue, nearUserKm, nearHotelKm, rankingScore: score };
    })
    .sort((left, right) => right.rankingScore - left.rankingScore);
}
