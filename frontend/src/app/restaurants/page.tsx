import Image from "next/image";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import UseMyLocationButton from "@/components/restaurants/UseMyLocationButton";
import { getRestaurantsHybrid } from "@/lib/restaurants/enrich-restaurants";

type RestaurantsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type TripLite = {
  accommodation: { address: string; lat: number; lng: number };
};

function pickParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RestaurantsPage({ searchParams }: RestaurantsPageProps) {
  const params = await searchParams;
  const tripId = pickParam(params.tripId) ?? "";
  const foodType = (pickParam(params.foodType) ?? "all").toLowerCase();
  const trendingOnly = (pickParam(params.trending) ?? "0") === "1";
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

  let restaurants = await getRestaurantsHybrid(
    Number.isFinite(hotelLat) && Number.isFinite(hotelLng) && hotelLat !== 0 && hotelLng !== 0
      ? { lat: hotelLat, lng: hotelLng }
      : undefined,
  );
  restaurants = restaurants.filter((r) => {
    if (foodType === "all") return true;
    const cuisines = r.cuisine.map((c) => c.toLowerCase());
    if (foodType === "sushi") return cuisines.some((c) => c.includes("sushi"));
    if (foodType === "pizza") return cuisines.some((c) => c.includes("pizza"));
    if (foodType === "hamburguesas") return cuisines.some((c) => c.includes("hamburgues"));
    if (foodType === "comida-rapida") {
      return (
        cuisines.some((c) => c.includes("comida rapida") || c.includes("fast")) ||
        r.category.includes("fast-food-nyc")
      );
    }
    return true;
  });
  if (trendingOnly) {
    restaurants = restaurants.filter((r) => r.category.includes("trending-foodie"));
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 md:px-10">
      <section className="mx-auto max-w-6xl space-y-3">
        <p className="text-xs uppercase tracking-[0.24em] text-amber-700">NYC Dining</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">Tengo Hambre en Nueva York</h1>
        <p className="text-sm font-medium text-slate-900">Sitios con foto: {restaurants.length}</p>
      </section>

      <section className="mx-auto mt-7 max-w-6xl rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
        <form className="grid w-full gap-3 md:grid-cols-4">
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="hotelLat" value={hotelLat || ""} />
          <input type="hidden" name="hotelLng" value={hotelLng || ""} />
          <p className="text-sm text-slate-700 md:col-span-2">
            {hotelAddress ? `Hotel: ${hotelAddress}` : "Usa tu ubicacion exacta para que el enlace de ruta salga desde donde estas."}
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
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-900">
              <input
                type="checkbox"
                name="trending"
                value="1"
                defaultChecked={trendingOnly}
                className="mr-2 align-middle"
              />
              De moda
            </label>
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

      <section className="mx-auto mt-8 grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
        {restaurants.map((restaurant) => (
          <article key={restaurant.id} className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
            <div className="relative h-56 w-full">
              <Image src={restaurant.imageUrl} alt={restaurant.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
            <div className="space-y-3 p-5">
              <h2 className="text-xl font-semibold text-slate-900">{restaurant.name}</h2>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={restaurant.directionsUrl ?? restaurant.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  Como llegar
                </Link>
                <Link
                  href={restaurant.officialWebsite ?? restaurant.googleMapsUrl}
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
