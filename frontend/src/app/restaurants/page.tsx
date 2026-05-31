import Image from "next/image";
import Link from "next/link";
import { apiFetch, getRestaurants } from "@/lib/api";
import UseMyLocationButton from "@/components/restaurants/UseMyLocationButton";

type RestaurantsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type TripLite = {
  id: string;
  accommodation: {
    address: string;
    lat: number;
    lng: number;
  };
};

function pickParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RestaurantsPage({ searchParams }: RestaurantsPageProps) {
  const params = await searchParams;
  const price = pickParam(params.price) ?? "";
  const cuisine = pickParam(params.cuisine) ?? "all";
  const minRating = Number(pickParam(params.minRating) ?? "0");
  const maxDistanceKm = Number(pickParam(params.maxDistanceKm) ?? "0");
  const tripId = pickParam(params.tripId) ?? "";

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
      // Ignore and keep manual location.
    }
  }

  let restaurants: Awaited<ReturnType<typeof getRestaurants>>["items"] = [];
  let fetchError = "";
  try {
    const response = await getRestaurants({
      price,
      cuisine,
      minRating: Number.isFinite(minRating) ? minRating : 0,
      maxDistanceKm: Number.isFinite(maxDistanceKm) ? maxDistanceKm : 0,
      hotelLat: Number.isFinite(hotelLat) ? hotelLat : 0,
      hotelLng: Number.isFinite(hotelLng) ? hotelLng : 0,
      maxResults: 1000,
    });
    restaurants = response.items;
  } catch {
    fetchError = "No se ha podido cargar la lista ahora mismo. Reintenta en unos segundos.";
  }
  const cuisineOptions = Array.from(new Set(["all", ...restaurants.map((r) => r.cuisine)])).sort();

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 md:px-10">
      <section className="mx-auto max-w-6xl space-y-3">
        <p className="text-xs uppercase tracking-[0.24em] text-amber-700">NYC Dining</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">Tengo Hambre en Nueva York</h1>
        <p className="text-sm font-medium text-slate-900">Opciones encontradas: {restaurants.length}</p>
        {restaurants.length === 0 ? (
          <p className="text-sm text-slate-700">
            {fetchError || "No hay resultados validos. Configura `YELP_API_KEY` o `GOOGLE_MAPS_API_KEY` y baja filtros."}
          </p>
        ) : null}
      </section>

      <section className="mx-auto mt-7 max-w-6xl rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <input type="hidden" name="tripId" value={tripId} />
          <div className="xl:col-span-1">
            <label className="mb-1 block text-sm font-medium text-slate-900">Precio</label>
            <select name="price" defaultValue={price} className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-slate-900">
              <option value="">Todos</option>
              <option value="$">$</option>
              <option value="$$">$$</option>
              <option value="$$$">$$$</option>
              <option value="$$$$">$$$$</option>
            </select>
          </div>

          <div className="xl:col-span-1">
            <label className="mb-1 block text-sm font-medium text-slate-900">Resenas min.</label>
            <select name="minRating" defaultValue={String(minRating || 0)} className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-slate-900">
              <option value="0">Todas</option>
              <option value="4">4.0+</option>
              <option value="4.3">4.3+</option>
              <option value="4.5">4.5+</option>
            </select>
          </div>

          <div className="xl:col-span-1">
            <label className="mb-1 block text-sm font-medium text-slate-900">Tipo cocina</label>
            <select name="cuisine" defaultValue={cuisine} className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-slate-900">
              {cuisineOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "Todas" : option}
                </option>
              ))}
            </select>
          </div>

          <div className="xl:col-span-1">
            <label className="mb-1 block text-sm font-medium text-slate-900">Distancia max (km)</label>
            <input
              name="maxDistanceKm"
              type="number"
              min={0}
              step={0.5}
              defaultValue={maxDistanceKm > 0 ? String(maxDistanceKm) : ""}
              placeholder="Ej. 3"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-slate-900"
            />
          </div>

          <input type="hidden" name="hotelLat" value={hotelLat || ""} />
          <input type="hidden" name="hotelLng" value={hotelLng || ""} />

          <div className="md:col-span-2 xl:col-span-6 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-700">
              {hotelAddress ? `Hotel: ${hotelAddress}` : "Puedes usar tu ubicacion exacta para distancia real."}
            </p>
            <div className="flex items-center gap-2">
              <UseMyLocationButton />
              <button type="submit" className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-stone-50">
                Aplicar filtros
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="mx-auto mt-8 grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
        {restaurants.map((restaurant) => (
          <article key={restaurant.id} className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
            <div className="relative h-56 w-full">
              <Image src={restaurant.image} alt={restaurant.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
            <div className="space-y-3 p-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{restaurant.name}</h2>
                <p className="text-sm text-slate-700">
                  {restaurant.area} · {restaurant.cuisine} · {restaurant.priceLevel}
                </p>
              </div>
              <p className="text-sm text-slate-700">{restaurant.address}</p>
              <p className="text-sm text-slate-700">
                Resenas: {restaurant.rating.toFixed(1)}
                {restaurant.distanceKm !== undefined ? ` · Distancia: ${restaurant.distanceKm.toFixed(1)} km` : ""}
              </p>
              <p className="text-sm text-slate-700">Total resenas: {restaurant.reviewCount.toLocaleString("es-ES")}</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={restaurant.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  Ubicacion
                </Link>
                <Link
                  href={restaurant.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-amber-500/20"
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
