import rooftopsDb from "@/data/restaurants/nyc-rooftops-hall-of-fame.json";
import { buildGoogleDirectionsUrl } from "@/lib/api/google-places";
import {
  getGooglePlaceDetails,
  hasGooglePlacesKey,
  searchGoogleRestaurantByText,
} from "@/lib/api/google-places";
import { rankNycRooftops } from "@/lib/restaurants/rank-nyc-rooftops";
import { curateRooftopImage } from "@/lib/restaurants/rooftop-visual-curator";
import type { Coordinates, NycRooftopHallOfFamePlace } from "@/types/restaurants";

const PREMIUM_ROOFTOP_FALLBACK =
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1400&q=85";
const ENABLE_GOOGLE_ROOFTOP_ENRICHMENT =
  process.env.NEXT_PUBLIC_ENABLE_ROOFTOP_GOOGLE_ENRICHMENT === "1" ||
  process.env.ENABLE_ROOFTOP_GOOGLE_ENRICHMENT === "1";

function canonicalName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
}

function withRequiredImage(place: NycRooftopHallOfFamePlace) {
  return {
    ...place,
    imageUrl: curateRooftopImage({ ...place, imageUrl: place.imageUrl || PREMIUM_ROOFTOP_FALLBACK }),
  };
}

function fallbackLocationFor(place: NycRooftopHallOfFamePlace) {
  if (typeof place.lat === "number" && typeof place.lng === "number") {
    return { lat: place.lat, lng: place.lng };
  }

  const centers: Record<string, Coordinates> = {
    "nomad": { lat: 40.7447, lng: -73.9879 },
    "williamsburg": { lat: 40.7144, lng: -73.9619 },
    "garment district": { lat: 40.7547, lng: -73.9916 },
    "times square": { lat: 40.758, lng: -73.9855 },
    "hell's kitchen": { lat: 40.7638, lng: -73.9924 },
    "financial district": { lat: 40.7075, lng: -74.0113 },
    "midtown": { lat: 40.7549, lng: -73.984 },
    "hudson yards": { lat: 40.7538, lng: -74.0022 },
    "meatpacking district": { lat: 40.7408, lng: -74.0077 },
    "seaport": { lat: 40.7066, lng: -74.0037 },
    "flatiron": { lat: 40.7411, lng: -73.9897 },
    "chelsea": { lat: 40.7465, lng: -74.0014 },
    "turtle bay": { lat: 40.754, lng: -73.969 },
    "columbia street waterfront": { lat: 40.685, lng: -74.0012 },
    "brooklyn heights": { lat: 40.696, lng: -73.995 },
    "roosevelt island": { lat: 40.7616, lng: -73.9505 },
    "east village": { lat: 40.7265, lng: -73.9815 },
    "lower east side": { lat: 40.715, lng: -73.9843 },
    "chinatown": { lat: 40.7158, lng: -73.997 },
    "midtown west": { lat: 40.7614, lng: -73.9967 },
    "east williamsburg": { lat: 40.7133, lng: -73.9326 },
    "bryant park": { lat: 40.7541, lng: -73.9846 }
  };
  const boroughCenters: Record<string, Coordinates> = {
    Manhattan: { lat: 40.758, lng: -73.9855 },
    Brooklyn: { lat: 40.6782, lng: -73.9442 },
    Queens: { lat: 40.7282, lng: -73.7949 },
    Bronx: { lat: 40.8448, lng: -73.8648 },
    "Staten Island": { lat: 40.5795, lng: -74.1502 }
  };
  const base = centers[place.neighborhood.toLowerCase()] ?? boroughCenters[place.borough] ?? boroughCenters.Manhattan;
  const offset = Array.from(place.id).reduce((total, char) => total + char.charCodeAt(0), 0);
  return {
    lat: Number((base.lat + ((offset % 9) - 4) * 0.0015).toFixed(6)),
    lng: Number((base.lng + ((Math.floor(offset / 9) % 9) - 4) * 0.0015).toFixed(6)),
  };
}

function estimateRooftopPriceFromLevel(priceLevel: 1 | 2 | 3 | 4 | null) {
  if (priceLevel === 1) return 25;
  if (priceLevel === 2) return 50;
  if (priceLevel === 3) return 90;
  if (priceLevel === 4) return 150;
  return null;
}

async function enrichOne(place: NycRooftopHallOfFamePlace): Promise<NycRooftopHallOfFamePlace> {
  if (!ENABLE_GOOGLE_ROOFTOP_ENRICHMENT || !hasGooglePlacesKey()) return withRequiredImage(place);
  const search = await searchGoogleRestaurantByText(`${place.name} ${place.borough} New York`);
  if (!search?.place_id) return withRequiredImage(place);

  const details = await getGooglePlaceDetails(search.place_id);
  if (!details) return withRequiredImage(place);

  const lat = typeof details.location.lat === "number" ? details.location.lat : place.lat;
  const lng = typeof details.location.lng === "number" ? details.location.lng : place.lng;
  const priceLevel = details.priceLevel ?? place.priceLevel;

  return withRequiredImage({
    ...place,
    dataQuality: "enriched",
    googlePlaceId: details.googlePlaceId ?? place.googlePlaceId,
    googleRating: details.googleRating ?? place.googleRating,
    googleReviewCount: details.googleReviewCount ?? place.googleReviewCount,
    officialWebsite: details.officialWebsite ?? place.officialWebsite,
    address: details.address ?? place.address,
    lat,
    lng,
    imageUrl: details.imageUrl ?? place.imageUrl,
    priceLevel,
    averagePricePerPersonUsd:
      estimateRooftopPriceFromLevel(priceLevel) ?? place.averagePricePerPersonUsd,
    googleMapsUrl: details.googleMapsUrl ?? place.googleMapsUrl,
    openingHours: details.openingHours,
    phone: details.phone,
  });
}

export async function getNycRooftopsHallOfFame(accommodation?: Coordinates) {
  const seen = new Set<string>();
  const curated = (rooftopsDb as NycRooftopHallOfFamePlace[])
    .filter((place) => {
      const key = canonicalName(place.name);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((place) => {
      const location = fallbackLocationFor(place);
      return withRequiredImage({ ...place, lat: location.lat, lng: location.lng });
    });

  const enriched = ENABLE_GOOGLE_ROOFTOP_ENRICHMENT
    ? await Promise.all(curated.slice(0, 8).map(enrichOne)).then((top) => [...top, ...curated.slice(8)])
    : curated;

  const withDirections = enriched.map((place) => ({
    ...place,
    directionsUrl:
      accommodation && typeof place.lat === "number" && typeof place.lng === "number"
        ? buildGoogleDirectionsUrl(accommodation, { lat: place.lat, lng: place.lng })
        : place.googleMapsUrl,
  }));

  return rankNycRooftops(withDirections, { accommodation });
}
