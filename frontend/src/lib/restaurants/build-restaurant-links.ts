import type { Coordinates } from "@/types/restaurants";
import {
  buildGoogleDirectionsUrl,
  buildGoogleMapsSearchUrl,
} from "@/lib/api/google-places";

export function ensureGoogleMapsUrl(
  currentUrl: string | null | undefined,
  name: string,
  address?: string | null,
) {
  if (currentUrl) return currentUrl;
  return buildGoogleMapsSearchUrl(name, address ?? undefined);
}

export function buildDirectionsLink(
  destination: Coordinates,
  origin?: Coordinates,
) {
  if (!origin) return null;
  return buildGoogleDirectionsUrl(origin, destination);
}

export function buildOfficialWebsiteSearchUrl(name: string, address?: string | null) {
  const query = [name, address, "official website"].filter(Boolean).join(" ");
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export function resolveOfficialWebsite(
  googleWebsite?: string | null,
  overpassWebsite?: string | null,
  curatedWebsite?: string | null,
) {
  return googleWebsite ?? overpassWebsite ?? curatedWebsite ?? null;
}
