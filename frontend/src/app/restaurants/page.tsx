import Image from "next/image";
import Link from "next/link";
import { apiFetch, getRestaurants, type RestaurantItem } from "@/lib/api";
import UseMyLocationButton from "@/components/restaurants/UseMyLocationButton";

type RestaurantsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type TripLite = {
  accommodation: { address: string; lat: number; lng: number };
};
type AgentSection = { key: string; label: string; count: number };
type AgentLead = {
  id: string;
  name: string;
  sourceName: string;
  sourceUrl: string;
  address?: string;
  lat?: number;
  lng?: number;
  cuisine?: string;
  imageUrl?: string;
  sections?: string[];
};
type AgentDiscoveryResponse = { sections: AgentSection[]; items: AgentLead[] };

function pickParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function estimateAvgPricePerPersonUsd(priceLevel: RestaurantItem["priceLevel"]) {
  if (priceLevel === "$") return 15;
  if (priceLevel === "$$") return 30;
  if (priceLevel === "$$$") return 55;
  return 90;
}

export default async function RestaurantsPage({ searchParams }: RestaurantsPageProps) {
  const params = await searchParams;
  const tripId = pickParam(params.tripId) ?? "";
  const foodType = (pickParam(params.foodType) ?? "all").toLowerCase();
  const minRating = Number(pickParam(params.minRating) ?? "0");
  const price = pickParam(params.price) ?? "";
  const maxDistanceKm = Number(pickParam(params.maxDistanceKm) ?? "0");
  const mapRestaurantId = pickParam(params.mapRestaurantId) ?? "";
  const section = pickParam(params.section) ?? "";
  const showMap = (pickParam(params.showMap) ?? "1") === "1";

  let hotelLat = Number(pickParam(params.hotelLat) ?? "0");
  let hotelLng = Number(pickParam(params.hotelLng) ?? "0");
  let hotelAddress = pickParam(params.hotelAddress) ?? "";

  if ((!Number.isFinite(hotelLat) || !Number.isFinite(hotelLng) || hotelLat === 0 || hotelLng === 0) && tripId) {
    try {
      const trip = await apiFetch<TripLite>(`/trips/${tripId}`);
      hotelLat = trip.accommodation.lat;
      hotelLng = trip.accommodation.lng;
      hotelAddress = trip.accommodation.address;
    } catch {
      // ignore
    }
  }

  const hasHotel =
    Number.isFinite(hotelLat) && Number.isFinite(hotelLng) && hotelLat !== 0 && hotelLng !== 0;

  const response = await getRestaurants({
    price: price || undefined,
    maxDistanceKm: Number.isFinite(maxDistanceKm) && maxDistanceKm > 0 ? maxDistanceKm : undefined,
    minRating: Number.isFinite(minRating) && minRating > 0 ? minRating : undefined,
    hotelLat: hasHotel ? hotelLat : undefined,
    hotelLng: hasHotel ? hotelLng : undefined,
    maxResults: 120,
  });

  const restaurantsApi = response.items;
  let restaurants = restaurantsApi;
  let discoveredSections: AgentSection[] = [];
  let discoveredItems: AgentLead[] = [];
  try {
    const discovery = await apiFetch<AgentDiscoveryResponse>("/agents/restaurants/discover");
    discoveredSections = discovery.sections ?? [];
    discoveredItems = discovery.items ?? [];
  } catch {
    discoveredSections = [];
    discoveredItems = [];
  }

  // Mostrar todos los locales encontrados por el agente como base principal.
  if (discoveredItems.length) {
    const byNameApi = new Map(restaurantsApi.map((r) => [r.name.toLowerCase(), r]));
    restaurants = discoveredItems.map((item) => {
      const apiMatch = byNameApi.get(item.name.toLowerCase());
      const lat = typeof item.lat === "number" ? item.lat : apiMatch?.lat ?? 0;
      const lng = typeof item.lng === "number" ? item.lng : apiMatch?.lng ?? 0;
      const mapsUrl =
        lat !== 0 || lng !== 0
          ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + " New York")}`;
      return {
        id: item.id,
        name: item.name,
        area: "New York",
        cuisine: item.cuisine ?? apiMatch?.cuisine ?? "Restaurant",
        priceLevel: apiMatch?.priceLevel ?? "$$",
        rating: apiMatch?.rating ?? 0,
        reviewCount: apiMatch?.reviewCount ?? 0,
        image: apiMatch?.image ?? item.imageUrl ?? "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80",
        officialUrl: item.sourceUrl ?? apiMatch?.officialUrl ?? mapsUrl,
        mapsUrl,
        address: item.address ?? apiMatch?.address ?? "New York",
        lat,
        lng,
        distanceKm: apiMatch?.distanceKm,
      } satisfies RestaurantItem;
    });
  }

  if (section && discoveredItems.length) {
    const byId = new Map(discoveredItems.map((i) => [i.id, i.sections ?? []]));
    restaurants = restaurants.filter((r) => (byId.get(r.id) ?? []).includes(section));
  }

  restaurants = restaurants.filter((r) => {
    if (foodType === "all") return true;
    const cuisine = r.cuisine.toLowerCase();
    if (foodType === "sushi") return cuisine.includes("sushi") || cuisine.includes("japanese");
    if (foodType === "pizza") return cuisine.includes("pizza");
    if (foodType === "hamburguesas") return cuisine.includes("burger");
    if (foodType === "comida-rapida") return cuisine.includes("fast");
    return true;
  });

  const withLocation = restaurants.filter(
    (r) => Number.isFinite(r.lat) && Number.isFinite(r.lng) && (r.lat !== 0 || r.lng !== 0),
  );
  const selectedMapRestaurant =
    withLocation.find((r) => r.id === mapRestaurantId) ?? withLocation[0] ?? null;
  const mapQuery = selectedMapRestaurant
    ? encodeURIComponent(`${selectedMapRestaurant.name}, ${selectedMapRestaurant.address}`)
    : "New%20York%20restaurants";

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 md:px-10">
      <section className="mx-auto max-w-6xl space-y-3">
        <p className="text-xs uppercase tracking-[0.24em] text-amber-700">NYC Dining</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">Tengo Hambre en Nueva York</h1>
        <p className="text-sm font-medium text-slate-900">Sitios con foto real: {restaurants.length}</p>
      </section>

      <section className="mx-auto mt-7 max-w-6xl rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
        <form className="grid w-full gap-3 md:grid-cols-6">
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="hotelLat" value={hotelLat || ""} />
          <input type="hidden" name="hotelLng" value={hotelLng || ""} />
          <input type="hidden" name="hotelAddress" value={hotelAddress || ""} />
          <p className="text-sm text-slate-700 md:col-span-2">
            {hotelAddress ? `Hotel: ${hotelAddress}` : "Usa tu ubicacion exacta para rutas desde donde estas."}
          </p>
          <select
            name="foodType"
            defaultValue={foodType}
            className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="all">Todo</option>
            <option value="sushi">Sushi</option>
            <option value="pizza">Pizza</option>
            <option value="hamburguesas">Hamburguesas</option>
            <option value="comida-rapida">Comida rapida</option>
          </select>
          <select
            name="price"
            defaultValue={price}
            className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="">Precio</option>
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
            <option value="$$$$">$$$$</option>
          </select>
          <select
            name="maxDistanceKm"
            defaultValue={maxDistanceKm > 0 ? String(maxDistanceKm) : ""}
            className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="">Cercania</option>
            <option value="1">1 km</option>
            <option value="3">3 km</option>
            <option value="5">5 km</option>
            <option value="10">10 km</option>
          </select>
          <select
            name="minRating"
            defaultValue={minRating > 0 ? String(minRating) : ""}
            className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="">Resenas min.</option>
            <option value="4">4.0+</option>
            <option value="4.3">4.3+</option>
            <option value="4.5">4.5+</option>
          </select>
          <select
            name="section"
            defaultValue={section}
            className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="">Seccion del agente</option>
            {discoveredSections.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label} ({s.count})
              </option>
            ))}
          </select>
          <select
            name="showMap"
            defaultValue={showMap ? "1" : "0"}
            className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900"
          >
            <option value="1">Con mapa</option>
            <option value="0">Sin mapa</option>
          </select>
          <div className="flex items-center gap-2 md:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-stone-50"
            >
              Filtrar
            </button>
            <UseMyLocationButton />
          </div>
        </form>
      </section>

      {showMap && (
      <section className="mx-auto mt-8 max-w-6xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Mapa (funcional)</h2>
          <p className="text-sm text-slate-600">Selecciona un restaurante para verlo en el mapa.</p>
        </div>
        <form className="border-b border-stone-200 px-5 py-4">
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="hotelLat" value={hotelLat || ""} />
          <input type="hidden" name="hotelLng" value={hotelLng || ""} />
          <input type="hidden" name="hotelAddress" value={hotelAddress || ""} />
          <input type="hidden" name="foodType" value={foodType} />
          <input type="hidden" name="price" value={price} />
          <input type="hidden" name="maxDistanceKm" value={maxDistanceKm > 0 ? String(maxDistanceKm) : ""} />
          <input type="hidden" name="minRating" value={minRating > 0 ? String(minRating) : ""} />
          <input type="hidden" name="section" value={section} />
          <input type="hidden" name="showMap" value="1" />
          <div className="flex flex-col gap-2 md:flex-row">
            <select
              name="mapRestaurantId"
              defaultValue={selectedMapRestaurant?.id ?? ""}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-slate-900"
            >
              {withLocation.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} - {r.area}
                </option>
              ))}
            </select>
            <button type="submit" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-stone-50">
              Ver en mapa
            </button>
          </div>
        </form>
        <iframe
          title="Mapa de restaurante seleccionado"
          src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`}
          className="h-96 w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
      )}

      <section className="mx-auto mt-8 grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
        {restaurants.map((restaurant) => (
          <article
            id={`restaurant-${restaurant.id}`}
            key={restaurant.id}
            className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm"
          >
            <div className="relative h-56 w-full">
              <Image
                src={restaurant.image}
                alt={restaurant.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="space-y-3 p-5">
              <h2 className="text-xl font-semibold text-slate-900">{restaurant.name}</h2>
              <p className="text-sm text-slate-700">{restaurant.cuisine} · {restaurant.area}</p>
              <p className="text-sm text-slate-700">{restaurant.address}</p>
              <p className="text-sm text-slate-900">
                ⭐ {restaurant.rating.toFixed(1)} · {restaurant.reviewCount.toLocaleString("es-ES")} resenas
              </p>
              <p className="text-sm text-slate-900">
                Precio medio por persona: ~${estimateAvgPricePerPersonUsd(restaurant.priceLevel)} ({restaurant.priceLevel})
              </p>
              {typeof restaurant.distanceKm === "number" && (
                <p className="text-sm text-slate-900">Distancia desde tu ubicacion/hotel: {restaurant.distanceKm} km</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Link
                  href={restaurant.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  Como llegar
                </Link>
                <Link
                  href={restaurant.officialUrl ?? restaurant.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-amber-500/20"
                >
                  Web
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
