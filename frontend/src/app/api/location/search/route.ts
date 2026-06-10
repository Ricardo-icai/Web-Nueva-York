import { NextRequest, NextResponse } from "next/server";

type LocationSuggestion = {
  label: string;
  lat: number;
  lng: number;
  provider: string;
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return NextResponse.json([]);

  const googleKey = process.env.GOOGLE_MAPS_API_KEY;
  if (googleKey) {
    try {
      const autocomplete = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&location=40.7128,-74.0060&radius=50000&components=country:us&key=${googleKey}`,
        { cache: "no-store" },
      );

      if (autocomplete.ok) {
        const data = (await autocomplete.json()) as {
          predictions?: Array<{ description: string; place_id: string }>;
        };
        const resolved = await Promise.all(
          (data.predictions ?? []).slice(0, 6).map(async (item) => {
            const details = await fetch(
              `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&fields=geometry&key=${googleKey}`,
              { cache: "no-store" },
            );
            if (!details.ok) return null;
            const payload = (await details.json()) as {
              result?: { geometry?: { location?: { lat?: number; lng?: number } } };
            };
            const lat = payload.result?.geometry?.location?.lat;
            const lng = payload.result?.geometry?.location?.lng;
            return typeof lat === "number" && typeof lng === "number"
              ? { label: item.description, lat, lng, provider: "google" }
              : null;
          }),
        );

        const suggestions = resolved.filter(
          (item): item is LocationSuggestion => item !== null,
        );
        if (suggestions.length > 0) return NextResponse.json(suggestions);
      }
    } catch {
      // Continue with OpenStreetMap when Google Places is unavailable.
    }
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=7&countrycodes=us&viewbox=-74.2591,40.9176,-73.7004,40.4774&bounded=1&q=${encodeURIComponent(query)}`,
      {
        cache: "no-store",
        headers: {
          "User-Agent": "nyc-family-planner/1.0",
          "Accept-Language": "es,en;q=0.8",
        },
      },
    );
    if (!response.ok) return NextResponse.json([]);

    const data = (await response.json()) as Array<{
      display_name: string;
      lat: string;
      lon: string;
    }>;
    return NextResponse.json(
      data.map((item) => ({
        label: item.display_name,
        lat: Number(item.lat),
        lng: Number(item.lon),
        provider: "openstreetmap",
      })),
    );
  } catch {
    return NextResponse.json([]);
  }
}
