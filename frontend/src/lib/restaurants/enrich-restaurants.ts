import type { Restaurant } from "@/types/restaurants";

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

const FAST_FOOD_CHAINS = [
  "mcdonald",
  "burger king",
  "wendy",
  "popeyes",
  "chick-fil-a",
  "shake shack",
  "five guys",
  "chipotle",
  "subway",
  "kfc",
  "taco bell",
  "raising cane",
  "dunkin",
];

const TRENDING_KEYWORDS = [
  "kabawa",
  "adda",
  "semma",
  "lilia",
  "los tacos no.1",
  "prince street pizza",
  "via carota",
  "lucali",
  "rubirosa",
  "tatiana",
  "carbone",
];

type WikiResponse = {
  query?: {
    pages?: Record<
      string,
      {
        pageid?: number;
        title?: string;
        fullurl?: string;
        thumbnail?: { source?: string };
      }
    >;
  };
};

const CUISINE_IMAGES: Record<string, string> = {
  sushi:
    "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80",
  pizza:
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
  hamburguesas:
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
  "comida rapida":
    "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
  default:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
};

function buildAddress(row: NycOpenDataRow) {
  return [row.building, row.street, row.boro, row.zipcode].filter(Boolean).join(" ").trim();
}

function buildDirectionsUrl(
  destination: { lat: number; lng: number },
  origin?: { lat: number; lng: number },
) {
  if (origin) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=transit`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${destination.lat},${destination.lng}`;
}

export async function getRestaurantsHybrid(
  origin?: { lat: number; lng: number },
): Promise<Restaurant[]> {
  const url =
    "https://data.cityofnewyork.us/resource/43nn-pn8j.json?$select=camis,dba,boro,cuisine_description,building,street,zipcode,latitude,longitude&$where=latitude%20IS%20NOT%20NULL%20AND%20longitude%20IS%20NOT%20NULL&$limit=2500";

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    const rows = (await response.json()) as NycOpenDataRow[];

    const unique = new Map<string, NycOpenDataRow>();
    for (const row of rows) {
      const id = row.camis?.trim();
      const name = row.dba?.trim();
      if (!id || !name) continue;
      if (!unique.has(id)) unique.set(id, row);
      if (unique.size >= 1000) break;
    }

    const base = Array.from(unique.values());
    const output: Restaurant[] = [];
    for (const row of base) {
      const id = row.camis?.trim();
      const name = row.dba?.trim();
      const lat = Number(row.latitude);
      const lng = Number(row.longitude);
      if (!id || !name || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      const lowerName = name.toLowerCase();
      const cuisineRaw = (row.cuisine_description?.trim() || "Restaurant").toLowerCase();
      const isFastFoodChain = FAST_FOOD_CHAINS.some((k) => lowerName.includes(k));
      const isTrending = TRENDING_KEYWORDS.some((k) => lowerName.includes(k));

      const address = buildAddress(row);
      const cuisine =
        cuisineRaw.includes("sushi")
          ? ["Sushi"]
          : cuisineRaw.includes("pizza")
            ? ["Pizza"]
            : cuisineRaw.includes("hamburger") || cuisineRaw.includes("burger")
              ? ["Hamburguesas"]
              : isFastFoodChain || cuisineRaw.includes("fast")
                ? ["Comida Rapida"]
                : [row.cuisine_description?.trim() || "Restaurant"];
      const category = ["nyc-open-data"];
      if (isFastFoodChain) category.push("fast-food-nyc");
      if (isTrending) category.push("trending-foodie");
      const imageKey =
        cuisine[0] === "Sushi"
          ? "sushi"
          : cuisine[0] === "Pizza"
            ? "pizza"
            : cuisine[0] === "Hamburguesas"
              ? "hamburguesas"
              : cuisine[0] === "Comida Rapida"
                ? "comida rapida"
                : "default";

      output.push({
        id: `nyc-${id}`,
        source: "local",
        dataQuality: "basic",
        name,
        cuisine,
        category,
        address: address || undefined,
        borough: row.boro?.trim() || undefined,
        location: { lat, lng },
        googleMapsUrl: buildDirectionsUrl({ lat, lng }, origin),
        directionsUrl: buildDirectionsUrl({ lat, lng }, origin),
        officialWebsite: `https://www.google.com/search?q=${encodeURIComponent(`${name} ${address}`)}`,
        imageUrl: CUISINE_IMAGES[imageKey] ?? CUISINE_IMAGES.default,
        imageSource: "fallback",
      });
      if (output.length >= 1000) break;
    }

    return output.slice(0, 1000);
  } catch {
    return [];
  }
}
