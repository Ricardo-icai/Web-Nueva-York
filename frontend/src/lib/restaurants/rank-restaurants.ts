import type { Restaurant } from "@/types/restaurants";

type RankingOptions = {
  accommodation?: { lat: number; lng: number };
};

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const v =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 6371 * (2 * Math.atan2(Math.sqrt(v), Math.sqrt(1 - v)));
}

export function rankRestaurants(rows: Restaurant[], options: RankingOptions = {}) {
  const ranked = rows.map((r) => {
    const ratingScore = ((r.googleRating ?? 0) / 5) * 30;
    const reviewScore = Math.min(15, Math.log10((r.googleReviewCount ?? 0) + 1) * 5);
    const hasWebsiteScore = r.officialWebsite ? 5 : 0;
    const imageScore = r.imageUrl ? 5 : 0;
    const familyScore = r.familyFriendly ? 10 : 0;
    const curatedScore = r.source === "curated" ? Math.min(15, (r.qualityScore ?? 0) * 0.15) : 0;

    let distanceScore = 0;
    let distanceFromAccommodationKm: number | null = null;
    if (options.accommodation) {
      const km = distanceKm(options.accommodation, r.location);
      const norm = Math.max(0, 1 - Math.min(1, km / 20));
      distanceScore = norm * 20;
      distanceFromAccommodationKm = Number(km.toFixed(1));
    }

    const qualityScore = Number(
      (
        ratingScore +
        reviewScore +
        distanceScore +
        curatedScore +
        familyScore +
        hasWebsiteScore +
        imageScore
      ).toFixed(2),
    );

    return { ...r, qualityScore, distanceFromAccommodationKm };
  });

  return ranked.sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0));
}

