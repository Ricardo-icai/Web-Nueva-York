import curatedDb from "@/data/restaurants/nyc-restaurants-curated.json";
import bestBurgersDb from "@/data/restaurants/nyc-best-burgers-restaurants.json";
import mustHaveDb from "@/data/restaurants/nyc-must-have-restaurants.json";
import socialTrendingDb from "@/data/restaurants/nyc-social-trending-restaurants.json";
import { RESTAURANT_CATEGORY_IMAGES } from "@/data/restaurants/restaurant-category-images";
import {
  buildGoogleDirectionsUrl,
  buildGoogleMapsSearchUrl,
  getGooglePlaceDetails,
  hasGooglePlacesKey,
  searchGoogleRestaurantByText,
} from "@/lib/api/google-places";
import { fetchOverpassRestaurants } from "@/lib/api/overpass-restaurants";
import { resolveOfficialWebsite } from "@/lib/restaurants/build-restaurant-links";
import {
  estimatePricePerPersonFromLevel,
  estimatePricePerPersonFromSignals,
} from "@/lib/restaurants/estimate-price";
import { normalizeOverpassRestaurant } from "@/lib/restaurants/normalize-restaurant";
import { rankRestaurants } from "@/lib/restaurants/rank-restaurants";
import type { Coordinates, Restaurant } from "@/types/restaurants";
import type { OverpassRestaurantRaw } from "@/types/restaurants";

type CuratedRow = {
  id: string;
  name: string;
  description?: string;
  cuisine: string[];
  categories: string[];
  address?: string | null;
  neighborhood?: string | null;
  borough?: string | null;
  lat: number | null;
  lng: number | null;
  officialWebsite?: string | null;
  googleMapsUrl: string;
  reservationUrl?: string | null;
  imageUrl?: string;
  priceLevel?: 1 | 2 | 3 | 4 | null;
  averagePricePerPersonUsd?: number | null;
  familyFriendly?: boolean | null;
  vegetarianOptions?: boolean | null;
  veganOptions?: boolean | null;
  halalOptions?: boolean | null;
  kosherOptions?: boolean | null;
  editorialTags?: string[];
  qualityScore?: number;
  whyItMatters?: string;
  signatureDishes?: string[];
  type?: string;
};

export const MAX_GOOGLE_ENRICHMENT = 50;

type NycOpenDataRow = {
  camis?: string;
  dba?: string;
  boro?: string;
  cuisine_description?: string;
  building?: string;
  street?: string;
  zipcode?: string;
  latitude?: string;
  longitude?: string;
};

function fixText(value?: string | null) {
  if (!value) return value ?? null;
  return value
    .replaceAll("Ã¢â‚¬â„¢", "'")
    .replaceAll("Ã¢â‚¬Å“", '"')
    .replaceAll("Ã¢â‚¬Â", '"')
    .replaceAll("Ã¢â‚¬â€œ", "-")
    .replaceAll("Ã¢â‚¬â€", "-")
    .replaceAll("ÃƒÂ´", "o")
    .replaceAll("ÃƒÂ¨", "e")
    .replaceAll("ÃƒÂ©", "e")
    .replaceAll("ÃƒÂ¡", "a")
    .replaceAll("ÃƒÂ­", "i")
    .replaceAll("ÃƒÂ³", "o")
    .replaceAll("ÃƒÂº", "u")
    .replaceAll("Ã¢â‚¬Â¢", "-")
    .replaceAll("Â·", "-")
    .replace(/\s+/g, " ")
    .trim();
}

function fixTextArray(values?: string[]) {
  return (values ?? []).map((value) => fixText(value) ?? value);
}

function canonicalRestaurantName(name: string) {
  return (fixText(name) ?? name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/no\.?\s*1/g, "no 1")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(nyc|new york|restaurant|pizzeria|pizza)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fallbackLocationFor(row: CuratedRow) {
  if (typeof row.lat === "number" && typeof row.lng === "number") {
    return { lat: row.lat, lng: row.lng };
  }

  const boroughCenters: Record<string, { lat: number; lng: number }> = {
    manhattan: { lat: 40.758, lng: -73.9855 },
    brooklyn: { lat: 40.6782, lng: -73.9442 },
    queens: { lat: 40.7282, lng: -73.7949 },
    bronx: { lat: 40.8448, lng: -73.8648 },
    "staten island": { lat: 40.5795, lng: -74.1502 },
  };
  const base = boroughCenters[(row.borough ?? "").toLowerCase()] ?? boroughCenters.manhattan;
  const seed = canonicalRestaurantName(`${row.name} ${row.neighborhood ?? ""}`);
  const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    lat: Number((base.lat + ((hash % 17) - 8) * 0.003).toFixed(6)),
    lng: Number((base.lng + ((Math.floor(hash / 17) % 17) - 8) * 0.003).toFixed(6)),
  };
}

function pickCategoryImage(categories: string[], cuisine: string[]) {
  const merged = [...categories, ...cuisine].join(" ").toLowerCase();
  if (merged.includes("pizza")) return RESTAURANT_CATEGORY_IMAGES.pizza;
  if (merged.includes("bagel")) return RESTAURANT_CATEGORY_IMAGES.bagel;
  if (merged.includes("deli")) return RESTAURANT_CATEGORY_IMAGES.deli;
  if (merged.includes("burger")) return RESTAURANT_CATEGORY_IMAGES.burger;
  if (merged.includes("steak")) return RESTAURANT_CATEGORY_IMAGES.steakhouse;
  if (merged.includes("korean")) return RESTAURANT_CATEGORY_IMAGES.korean;
  if (merged.includes("japanese") || merged.includes("sushi")) return RESTAURANT_CATEGORY_IMAGES.japanese;
  if (merged.includes("mexican")) return RESTAURANT_CATEGORY_IMAGES.mexican;
  if (merged.includes("vegan")) return RESTAURANT_CATEGORY_IMAGES.vegan;
  if (merged.includes("dessert")) return RESTAURANT_CATEGORY_IMAGES.dessert;
  return RESTAURANT_CATEGORY_IMAGES.default;
}

function curatedToRestaurant(row: CuratedRow): Restaurant {
  const location = fallbackLocationFor(row);
  const name = fixText(row.name) ?? row.name;
  const address = fixText(row.address ?? null);
  const cuisine = fixTextArray(row.cuisine);
  const categories = fixTextArray(row.categories);
  const editorialTags = fixTextArray(row.editorialTags);
  const signatureDishes = fixTextArray(row.signatureDishes);
  const mapsUrl =
    row.googleMapsUrl && !/[ÃÂâ]/.test(row.googleMapsUrl)
      ? row.googleMapsUrl
      : buildGoogleMapsSearchUrl(name, address ?? undefined);

  return {
    id: row.id,
    source: "curated",
    dataQuality: "curated",
    name,
    description: fixText(row.description ?? row.whyItMatters ?? null),
    cuisine,
    categories,
    address,
    neighborhood: fixText(row.neighborhood ?? null),
    borough: fixText(row.borough ?? null),
    location,
    googlePlaceId: null,
    googleRating: null,
    googleReviewCount: null,
    googleReviews: [],
    priceLevel: row.priceLevel ?? null,
    averagePricePerPersonUsd:
      row.averagePricePerPersonUsd ??
      estimatePricePerPersonFromSignals({
        priceLevel: row.priceLevel ?? null,
        cuisine,
        categories,
        editorialTags,
        name,
      }),
    officialWebsite: fixText(row.officialWebsite ?? null),
    googleMapsUrl: mapsUrl,
    directionsUrl: null,
    reservationUrl: row.reservationUrl ?? null,
    imageUrl: row.imageUrl && row.imageUrl.length > 0 ? row.imageUrl : pickCategoryImage(categories, cuisine),
    imageSource: row.imageUrl && row.imageUrl.length > 0 ? "curated" : "fallback",
    phone: null,
    openingHours: [],
    familyFriendly: row.familyFriendly ?? undefined,
    vegetarianOptions: row.vegetarianOptions ?? undefined,
    veganOptions: row.veganOptions ?? undefined,
    halalOptions: row.halalOptions ?? undefined,
    kosherOptions: row.kosherOptions ?? undefined,
    qualityScore: row.qualityScore ?? 70,
    editorialTags: [...editorialTags, ...signatureDishes, ...(row.type ? [fixText(row.type) ?? row.type] : [])],
  };
}

function mergeByName(base: Restaurant[], extra: Restaurant[]) {
  const out = new Map<string, Restaurant>();
  for (const r of [...base, ...extra]) {
    const k = canonicalRestaurantName(r.name);
    const existing = out.get(k);
    if (!existing) {
      out.set(k, r);
      continue;
    }
    out.set(k, {
      ...existing,
      description: existing.description ?? r.description,
      categories: Array.from(new Set([...(existing.categories ?? []), ...(r.categories ?? [])])),
      cuisine: Array.from(new Set([...(existing.cuisine ?? []), ...(r.cuisine ?? [])])),
      address: existing.address ?? r.address,
      neighborhood: existing.neighborhood ?? r.neighborhood,
      borough: existing.borough ?? r.borough,
      officialWebsite: resolveOfficialWebsite(existing.officialWebsite, r.officialWebsite, null),
      imageUrl: existing.imageUrl || r.imageUrl,
      googleMapsUrl: existing.googleMapsUrl || r.googleMapsUrl,
      directionsUrl: existing.directionsUrl ?? r.directionsUrl,
      reservationUrl: existing.reservationUrl ?? r.reservationUrl,
      priceLevel: existing.priceLevel ?? r.priceLevel,
      averagePricePerPersonUsd: existing.averagePricePerPersonUsd ?? r.averagePricePerPersonUsd,
      googlePlaceId: existing.googlePlaceId ?? r.googlePlaceId,
      googleRating: existing.googleRating ?? r.googleRating,
      googleReviewCount: existing.googleReviewCount ?? r.googleReviewCount,
      distanceFromAccommodationKm: existing.distanceFromAccommodationKm ?? r.distanceFromAccommodationKm,
      estimatedTransitMinutes: existing.estimatedTransitMinutes ?? r.estimatedTransitMinutes,
      estimatedWalkingMinutes: existing.estimatedWalkingMinutes ?? r.estimatedWalkingMinutes,
      editorialTags: Array.from(new Set([...(existing.editorialTags ?? []), ...(r.editorialTags ?? [])])),
      qualityScore: Math.max(existing.qualityScore ?? 0, r.qualityScore ?? 0),
      source: existing.source === "curated" ? "curated" : r.source,
      dataQuality: existing.dataQuality === "curated" ? "curated" : r.dataQuality,
    });
  }
  return Array.from(out.values());
}

function chooseForGoogleEnrichment(items: Restaurant[], accommodation?: Coordinates) {
  const score = (r: Restaurant) => {
    let s = 0;
    if (r.source === "curated") s += 100;
    if (r.officialWebsite) s += 30;
    if (r.cuisine.length > 0) s += 20;
    if (accommodation) {
      const dLat = r.location.lat - accommodation.lat;
      const dLng = r.location.lng - accommodation.lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      s += Math.max(0, 25 - dist * 500);
    }
    if (r.name.split(" ").length > 1) s += 10;
    return s;
  };
  return [...items].sort((a, b) => score(b) - score(a)).slice(0, MAX_GOOGLE_ENRICHMENT);
}

async function enrichWithGoogle(
  input: Restaurant[],
  accommodation?: Coordinates,
): Promise<Restaurant[]> {
  if (!hasGooglePlacesKey()) return input;
  const targets = chooseForGoogleEnrichment(input, accommodation);
  const targetIds = new Set(targets.map((t) => t.id));
  const enrichedMap = new Map<string, Restaurant>();

  for (const row of targets) {
    const search = await searchGoogleRestaurantByText(
      `${row.name} ${row.address ?? "New York City"}`,
    );
    if (!search?.place_id) continue;
    const details = await getGooglePlaceDetails(search.place_id);
    if (!details) continue;

    const enriched: Restaurant = {
      ...row,
      source: "google",
      dataQuality: "enriched",
      googlePlaceId: details.googlePlaceId,
      googleRating: details.googleRating,
      googleReviewCount: details.googleReviewCount,
      googleReviews: details.googleReviews,
      priceLevel: details.priceLevel,
      averagePricePerPersonUsd: estimatePricePerPersonFromLevel(details.priceLevel),
      officialWebsite: resolveOfficialWebsite(details.officialWebsite, row.officialWebsite, null),
      googleMapsUrl: details.googleMapsUrl ?? row.googleMapsUrl,
      imageUrl: details.imageUrl ?? row.imageUrl,
      imageSource: details.imageUrl ? "google" : row.imageSource,
      openingHours: details.openingHours,
      phone: details.phone,
    };
    enrichedMap.set(row.id, enriched);
  }

  return input.map((r) => {
    const e = enrichedMap.get(r.id);
    if (e) return e;
    if (!targetIds.has(r.id)) return r;
    return r;
  });
}

export async function getRestaurantsIntelligence(
  accommodation?: Coordinates,
): Promise<Restaurant[]> {
  let overpassRaw = await fetchOverpassRestaurants();
  if (!overpassRaw.length) {
    try {
      const response = await fetch(
        "https://data.cityofnewyork.us/resource/43nn-pn8j.json?$select=camis,dba,boro,cuisine_description,building,street,zipcode,latitude,longitude&$where=latitude%20IS%20NOT%20NULL%20AND%20longitude%20IS%20NOT%20NULL&$limit=3000",
        { cache: "no-store" },
      );
      if (response.ok) {
        const rows = (await response.json()) as NycOpenDataRow[];
        overpassRaw = rows
          .map((r): OverpassRestaurantRaw | null => {
            const lat = Number(r.latitude);
            const lng = Number(r.longitude);
            const name = r.dba?.trim();
            const id = r.camis?.trim();
            if (!name || !id || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
            return {
              osmId: `nyc-${id}`,
              name,
              amenity: "restaurant",
              cuisine: r.cuisine_description ?? "restaurant",
              website: undefined,
              phone: undefined,
              openingHours: undefined,
              address: [r.building, r.street, r.boro, r.zipcode].filter(Boolean).join(" "),
              neighborhood: undefined,
              borough: r.boro,
              lat,
              lng,
              source: "overpass",
            };
          })
          .filter((x): x is OverpassRestaurantRaw => x !== null);
      }
    } catch {
      overpassRaw = [];
    }
  }
  const overpass = overpassRaw.map(normalizeOverpassRestaurant);
  const curated = [
    ...(curatedDb as CuratedRow[]),
    ...(bestBurgersDb as CuratedRow[]),
    ...(mustHaveDb as CuratedRow[]),
    ...(socialTrendingDb as CuratedRow[]),
  ].map(curatedToRestaurant);
  const merged = mergeByName(curated, overpass).map((r) => ({
    ...r,
    googleMapsUrl: r.googleMapsUrl || buildGoogleMapsSearchUrl(r.name, r.address ?? undefined),
    imageUrl: r.imageUrl || pickCategoryImage(r.categories, r.cuisine),
  }));

  const withGoogle = await enrichWithGoogle(merged, accommodation);
  const withDirections = withGoogle.map((r) => ({
    ...r,
    directionsUrl: accommodation ? buildGoogleDirectionsUrl(accommodation, r.location) : null,
    averagePricePerPersonUsd:
      r.averagePricePerPersonUsd ??
      estimatePricePerPersonFromSignals({
        priceLevel: r.priceLevel ?? null,
        cuisine: r.cuisine,
        categories: r.categories,
        editorialTags: r.editorialTags,
        name: r.name,
      }),
  }));

  return rankRestaurants(withDirections, { accommodation });
}
