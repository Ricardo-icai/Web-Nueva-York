import type { NightlifeVenue } from "@/types/nightlife";

type RankOptions = {
  userLocation?: { lat: number; lng: number } | null;
  preferredCategory?: string;
  budgetLevel?: 1 | 2 | 3 | 4 | null;
  musicStyle?: string;
};

function normalizeReviewCount(value: number | null | undefined) {
  if (!value || value <= 0) return 0;
  return Math.min(Math.log10(value + 1) / 4, 1);
}

function categoryMatchScore(venue: NightlifeVenue, preferredCategory?: string) {
  if (!preferredCategory || preferredCategory === "all") return 1;
  if (venue.category === preferredCategory) return 1;
  return 0.25;
}

function musicMatchScore(venue: NightlifeVenue, musicStyle?: string) {
  if (!musicStyle || musicStyle === "all") return 1;
  return venue.musicStyle?.some((item) => item.toLowerCase().includes(musicStyle.toLowerCase())) ? 1 : 0.3;
}

function budgetMatchScore(venue: NightlifeVenue, budgetLevel?: 1 | 2 | 3 | 4 | null) {
  if (!budgetLevel || !venue.priceLevel) return 0.7;
  return Math.max(0, 1 - Math.abs(venue.priceLevel - budgetLevel) * 0.25);
}

function distanceScore(venue: NightlifeVenue, userLocation?: { lat: number; lng: number } | null) {
  if (!userLocation) return 0.6;
  const lat = venue.location.lat;
  const lng = venue.location.lng;
  if (typeof lat !== "number" || typeof lng !== "number") return 0.4;
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const earthKm = 6371;
  const dLat = toRad(lat - userLocation.lat);
  const dLng = toRad(lng - userLocation.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(userLocation.lat)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const km = earthKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  return Math.max(0, 1 - Math.min(km / 20, 1));
}

export function rankNightlifeVenues(venues: NightlifeVenue[], options: RankOptions = {}) {
  return [...venues].sort((left, right) => {
    const score = (venue: NightlifeVenue) => {
      const rating = venue.googleRating ? Math.min(venue.googleRating / 5, 1) : 0.55;
      const reviewCount = normalizeReviewCount(venue.googleReviewCount);
      const reputation = Math.min((venue.nightlifeScore ?? 70) / 100, 1);
      const distance = distanceScore(venue, options.userLocation);
      const website = venue.officialWebsite ? 1 : 0;
      const booking = venue.ticketUrl || venue.reservationUrl ? 1 : 0;
      const image = venue.imageSource === "fallback" ? 0.5 : 1;
      const trend = Math.min((venue.socialTrendScore ?? 65) / 100, 1);
      const relevance =
        categoryMatchScore(venue, options.preferredCategory) *
        musicMatchScore(venue, options.musicStyle) *
        budgetMatchScore(venue, options.budgetLevel);

      return (
        rating * 0.2 +
        reviewCount * 0.1 +
        reputation * 0.2 +
        distance * 0.15 +
        website * 0.05 +
        booking * 0.1 +
        image * 0.05 +
        trend * 0.1 +
        relevance * 0.05
      );
    };

    return score(right) - score(left);
  });
}
