import type { Coordinates } from "@/types/restaurants";

type TransitDestinationInput = {
  name: string;
  address?: string | null;
  location?: Coordinates | null;
  lat?: number | null;
  lng?: number | null;
  origin?: Coordinates | null;
};

export function buildTransitPlannerUrl(destination: TransitDestinationInput) {
  const params = new URLSearchParams();
  const label = [destination.name, destination.address].filter(Boolean).join(" - ");
  params.set("destination", label || destination.name);

  const lat = destination.location?.lat ?? destination.lat;
  const lng = destination.location?.lng ?? destination.lng;
  if (typeof lat === "number" && Number.isFinite(lat)) params.set("destinationLat", String(lat));
  if (typeof lng === "number" && Number.isFinite(lng)) params.set("destinationLng", String(lng));
  if (destination.origin) {
    params.set("originLat", String(destination.origin.lat));
    params.set("originLng", String(destination.origin.lng));
  }
  params.set("fromSite", "1");

  return `/map?${params.toString()}`;
}
