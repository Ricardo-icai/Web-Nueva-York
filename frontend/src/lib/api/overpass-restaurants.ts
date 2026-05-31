import type { OverpassRestaurantRaw } from "@/types/restaurants";

type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

function buildAddress(tags: Record<string, string>): string | undefined {
  const house = tags["addr:housenumber"] ?? "";
  const street = tags["addr:street"] ?? "";
  const city = tags["addr:city"] ?? "";
  const postcode = tags["addr:postcode"] ?? "";
  const parts = [`${house} ${street}`.trim(), city, postcode].filter(Boolean);
  return parts.length ? parts.join(", ") : undefined;
}

export async function fetchOverpassRestaurants(): Promise<OverpassRestaurantRaw[]> {
  const query = `
    [out:json][timeout:60];
    area["name"="New York City"]["boundary"="administrative"]->.searchArea;
    (
      node["amenity"="restaurant"](area.searchArea);
      way["amenity"="restaurant"](area.searchArea);
      relation["amenity"="restaurant"](area.searchArea);
      node["amenity"="cafe"](area.searchArea);
      way["amenity"="cafe"](area.searchArea);
      relation["amenity"="cafe"](area.searchArea);
      node["amenity"="fast_food"](area.searchArea);
      way["amenity"="fast_food"](area.searchArea);
      relation["amenity"="fast_food"](area.searchArea);
    );
    out center tags;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      cache: "no-store",
    });
    if (!response.ok) return [];

    const data = (await response.json()) as OverpassResponse;
    const rows = (data.elements ?? [])
      .map((el): OverpassRestaurantRaw | null => {
        const tags = el.tags ?? {};
        const name = tags.name?.trim();
        const lat = el.lat ?? el.center?.lat;
        const lng = el.lon ?? el.center?.lon;
        if (!name || typeof lat !== "number" || typeof lng !== "number") return null;
        return {
          osmId: `osm-${el.id}`,
          name,
          amenity: tags.amenity ?? "restaurant",
          cuisine: tags.cuisine,
          website: tags.website ?? tags["contact:website"],
          phone: tags.phone ?? tags["contact:phone"],
          openingHours: tags.opening_hours,
          address: buildAddress(tags),
          neighborhood: tags["addr:suburb"] ?? tags["addr:neighbourhood"],
          borough: tags["addr:borough"],
          lat,
          lng,
          source: "overpass",
        };
      })
      .filter((x): x is OverpassRestaurantRaw => x !== null);

    return rows;
  } catch {
    return [];
  }
}

