import type { ShoppingVenue } from "@/types/shopping";

function distanceKm(origin: { lat: number; lng: number }, destination: { lat: number | null; lng: number | null }) {
  if (typeof destination.lat !== "number" || typeof destination.lng !== "number") return null;
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const earthKm = 6371;
  const dLat = toRad(destination.lat - origin.lat);
  const dLng = toRad(destination.lng - origin.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(origin.lat)) * Math.cos(toRad(destination.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return earthKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function getNearbyShopping(
  venues: Array<ShoppingVenue & { rankingScore?: number }>,
  origin: { lat: number; lng: number } | null,
) {
  if (!origin) return [];
  return venues
    .map((venue) => ({
      ...venue,
      nearbyDistanceKm: distanceKm(origin, venue.location),
    }))
    .filter((venue) => typeof venue.nearbyDistanceKm === "number")
    .sort((left, right) => {
      const leftDistance = left.nearbyDistanceKm ?? Number.POSITIVE_INFINITY;
      const rightDistance = right.nearbyDistanceKm ?? Number.POSITIVE_INFINITY;
      if (Math.abs(leftDistance - rightDistance) > 0.25) return leftDistance - rightDistance;
      return (right.rankingScore ?? 0) - (left.rankingScore ?? 0);
    });
}
