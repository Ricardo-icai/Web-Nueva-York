import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/api";

type Trip = {
  id: string;
  name: string;
  nationality: string;
  startDate: string;
  endDate: string;
  travelers: number;
  pace: string;
  accommodation: {
    address: string;
    lat: number;
    lng: number;
  };
};

type Forecast = {
  source: string;
  days: Array<{
    date: string;
    temperatureMin: number;
    temperatureMax: number;
    precipitationProbability: number;
    weatherCode: number;
  }>;
};

function weatherLabel(code: number) {
  if (code <= 1) return "Despejado";
  if (code <= 3) return "Nubes";
  if (code <= 67) return "Lluvia";
  return "Variable";
}

export default async function DashboardPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  let trip: Trip;
  try {
    trip = await apiFetch<Trip>(`/trips/${tripId}`);
  } catch {
    return (
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="font-display text-3xl text-slate-900">Viaje no disponible</h1>
          <p className="mt-3 text-slate-700">
            Este viaje ya no existe en el servidor. Suele pasar si el backend se reinicia.
          </p>
          <Link
            href="/onboarding"
            className="mt-6 inline-block rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-stone-50"
          >
            Crear un viaje nuevo
          </Link>
        </div>
      </div>
    );
  }

  const forecast = await apiFetch<Forecast>(
    `/weather/forecast?lat=${trip.accommodation.lat}&lng=${trip.accommodation.lng}&startDate=${trip.startDate}&endDate=${trip.endDate}`,
  );

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${trip.accommodation.lng - 0.03}%2C${trip.accommodation.lat - 0.02}%2C${trip.accommodation.lng + 0.03}%2C${trip.accommodation.lat + 0.02}&layer=mapnik&marker=${trip.accommodation.lat}%2C${trip.accommodation.lng}`;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
      <section className="grid overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm md:grid-cols-2">
        <div className="p-7 md:p-10">
          <p className="text-xs uppercase tracking-[0.24em] text-amber-700">Tu base de viaje</p>
          <h1 className="mt-2 font-display text-4xl text-slate-900">{trip.name}</h1>
          <p className="mt-3 text-slate-600">
            {trip.travelers} viajeros - {trip.nationality} - {trip.startDate} a {trip.endDate}
          </p>
          <p className="mt-1 text-slate-500">Alojamiento: {trip.accommodation.address}</p>
        </div>
        <div className="relative min-h-[220px]">
          <Image
            src="https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1600&q=80"
            alt="Nueva York vista editorial"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-2xl text-slate-900">Mapa de la ciudad y tu zona</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-stone-200">
            <iframe title="mapa-nyc" src={mapUrl} className="h-[360px] w-full" loading="lazy" />
          </div>
        </article>

        <article className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-2xl text-slate-900">Tiempo durante tu viaje</h2>
          <div className="mt-4 space-y-3">
            {forecast.days.map((day) => (
              <div key={day.date} className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-slate-700">
                <p className="font-semibold">
                  {day.date} - {weatherLabel(day.weatherCode)}
                </p>
                <p className="text-slate-600">
                  {day.temperatureMin}C - {day.temperatureMax}C - Lluvia: {day.precipitationProbability}%
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl text-slate-900">Siguiente paso</h2>
        <p className="mt-2 text-slate-600">
          Pasa al plan detallado por dia con recomendaciones, horarios y rutas.
        </p>
        <Link href={`/itinerary/${tripId}`} className="mt-4 inline-block rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-stone-50">
          Ver itinerario del primer dia
        </Link>
      </section>
    </div>
  );
}
